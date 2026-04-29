// app/academy/lesson/cipher-imbalance/page.tsx
// ATLAS Academy — Lesson 11.18: Cipher Imbalance [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 11 · CIPHER
// Where Price Promised to Return.
// Covers: 3-candle FVG geometry, three birth gates, 11 parallel arrays,
//         smart mitigation (boxes shrink), original vs remaining, fade by
//         fill %, consequential FVGs ★, lifecycle (full fill / age /
//         pruning), stacked detection ⚡, the 6-line tooltip, the
//         11-verdict Command Center cascade, inputs, trading, mistakes.
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Crown } from 'lucide-react';

// ============================================================
// GAME ROUNDS — 5 scenario-based Cipher Imbalance challenges
// String-id answers, per-option explanations (teaches on wrong answers).
// Covers: cascade verdict reading, smart mitigation interpretation,
//         consequential vs non-consequential sizing, stop placement,
//         stacked detection trading, fill % decision making.
// ============================================================
const gameRounds = [
  {
    id: 'r1',
    scenario:
      'You are watching XAUUSD 4h. The Imbalance row reads <strong class="text-white">&#9650;&mdash;&nbsp;&#9660; 0.4 ATR (33% filled)</strong> &rarr; <strong class="text-amber-400">STACKED BEAR &#9889;</strong>. The Ribbon stack is bear. A Tension Snap short signal just fired with 3/4 conviction. You are flat.',
    prompt: 'How should you size and place this trade?',
    options: [
      {
        id: 'a',
        text: 'Take a normal-size short with stop just below the live remaining edge of the bear gap.',
        correct: false,
        explain:
          'Two errors. First, this misses the STACKED &#9889; tier signal &mdash; you should size up 1.5-2x for stacked setups (Mistake 4 from S15). Second, the stop placement is wrong: stops go beyond the ORIGINAL bound, not the live edge. Live bounds are mutable; stops at the live get caught by deeper-fill wicks (Mistake 5 from S15).',
      },
      {
        id: 'b',
        text: 'Take a 1.5-2x size short with stop just above the original top of the highest stacked bear gap, plus a small ATR buffer.',
        correct: true,
        explain:
          'Correct. STACKED &#9889; is the elevated tier &mdash; cascade position 3, only NO ACTIVE GAPS sits above it. Stacked setups produce statistically larger continuation moves, so size up 1.5-2x. Stop discipline doesn\u2019t change: above the original top of the highest stacked gap (not live, not the lower gap\u2019s top) with ATR buffer. Combined with Ribbon BEAR + qualified TS signal, this is one of the highest-conviction setups CIPHER tracks.',
      },
      {
        id: 'c',
        text: 'Skip the trade &mdash; the &#9889; means high volatility and unpredictable execution.',
        correct: false,
        explain:
          'Reversed reading. The &#9889; is institutional CONFIRMATION, not a volatility warning. Multiple aggressive moves in the same direction within 2 ATR is exactly the kind of confluence operators want. Skipping STACKED &#9889; setups means leaving the highest-conviction context CIPHER offers unworked.',
      },
      {
        id: 'd',
        text: 'Take a long against the stacked bears &mdash; the 33% fill means the gaps are weak and ready to fail.',
        correct: false,
        explain:
          'Triple error. (1) Counter-trend longs against a bear stack with stacked bear FVGs is fighting institutional intent visible across multiple feature layers. (2) 33% filled means the stacked gaps are barely consumed, not weak &mdash; 67% magnetic strength remains. (3) Fading STACKED &#9889; setups has historically poor edge. Trade with the stack, not against it.',
      },
    ],
  },
  {
    id: 'r2',
    scenario:
      'You hover an FVG and the tooltip reads: <strong class="text-white">BULL FVG &#9733; Consequential</strong> &middot; <strong class="text-white">Original 4654.20-4640.10</strong> &middot; <strong class="text-white">Remaining 4647.50-4640.10</strong> &middot; <strong class="text-white">Fill 47%</strong> &middot; <strong class="text-white">Age 24/100 bars</strong> &middot; <strong class="text-white">Distance 0.3 ATR</strong>. Ribbon stack is bull. Spine is teal and tracking.',
    prompt: 'What does this tooltip tell you and what is the right move?',
    options: [
      {
        id: 'a',
        text: 'Skip &mdash; 47% fill means the gap is half-consumed, low remaining magnet strength.',
        correct: false,
        explain:
          '47% is mid-tier fill, not skip territory. Per Section 14 (Decision 1) and Mistake 1: under 30% fill is high conviction, 30-60% is medium conviction, 60-90% is caution. 47% sits in medium &mdash; tradeable, especially with the consequential star and bullish trend confluence.',
      },
      {
        id: 'b',
        text: 'Long entry at 4647.50 (live remaining top) with stop at 4639.80 (just below ORIGINAL bottom 4640.10 with small buffer). Hold runner toward next bear FVG above.',
        correct: true,
        explain:
          'Correct full setup. Distance 0.3 ATR means AT GAP territory, fresh-young age 24/100 bars, consequential &#9733; star = full size warranted. Entry at the live remaining edge (4647.50) is where price hits and reacts first. Stop just BELOW the original bottom (not live), with ATR buffer &mdash; only triggers on real breakdown. Target gap-to-gap to the nearest bear FVG above. Textbook Section 14 execution.',
      },
      {
        id: 'c',
        text: 'Long with stop at 4647.20 (just below the live remaining top).',
        correct: false,
        explain:
          'This is mistake 5 from S15. Stops at the live remaining edge get whipsawed when price wicks deeper into the gap before reversing. The whole point of CIPHER tracking original AND live separately is so operators can place stops beyond original bounds while reading entries off live. Live for entries; original for stops.',
      },
      {
        id: 'd',
        text: 'Long at 4640.10 (original bottom) with stop just below.',
        correct: false,
        explain:
          'Wrong entry zone. The original bottom is the GAP BOTTOM, not the entry. Price would need to consume the entire remaining gap to reach 4640.10 &mdash; at that point the FVG fully fills and deletes from chart, which is the failure scenario, not the entry scenario. Entry at the live edge (4647.50) where the magnet is currently active.',
      },
    ],
  },
  {
    id: 'r3',
    scenario:
      'EURUSD 1H. The Imbalance row reads <strong class="text-white">&#9650; 1.4 ATR &#9660; 1.2 ATR (78% filled)</strong> &rarr; <strong class="text-white">NEAR BEAR GAP</strong>. You hover the bear FVG and the tooltip shows: <strong class="text-white">BEAR FVG Non-consequential</strong> &middot; <strong class="text-white">Fill 78%</strong> &middot; <strong class="text-white">Age 67/100 bars</strong>. Ribbon stack is bull.',
    prompt: 'How should you treat this bear FVG?',
    options: [
      {
        id: 'a',
        text: 'Take a short rejection setup at the gap with normal size.',
        correct: false,
        explain:
          'Three reasons to skip or downsize, all stacking. (1) 78% fill is in the &ldquo;chasing 90%-filled gaps&rdquo; failure pattern from Mistake 1 &mdash; the magnet is mostly consumed. (2) Non-consequential = against-trend, lower fill rate. (3) Age 67/100 is approaching forgotten territory. Normal size on this combination is over-exposure.',
      },
      {
        id: 'b',
        text: 'Skip the bear FVG entirely as a short setup. The combination of 78% fill + non-consequential + age 67 is poor conviction. Look elsewhere.',
        correct: true,
        explain:
          'Correct. The tooltip is doing exactly what it\u2019s designed for: giving you a multi-dimensional read so you can disqualify weak setups. 78% fill is the deepest mistake-1 territory. Non-consequential against a bull stack is fighting trend. Age 67/100 means the institutional aggression is mostly overwritten. Three independent negative signals; the sum is a clear skip. Better setups exist on the same chart.',
      },
      {
        id: 'c',
        text: 'Take a long FROM the bear gap as a breakout-fade setup.',
        correct: false,
        explain:
          'Bear FVGs are SHORT setups (rejection/continuation), not long bounce zones. Bull setups come from bull FVGs below price. The geometric direction of an FVG determines its trade direction; you can\u2019t flip it. This option also creates a confused mental model that will fail across multiple FVG trades.',
      },
      {
        id: 'd',
        text: 'Wait for the bear FVG to fully fill and delete, then enter long at the deletion bar.',
        correct: false,
        explain:
          'There&rsquo;s no operational edge in entering at FVG deletion. The deletion bar means the gap retired (full fill), not that a reversal is imminent. Long entries should come from a separate trade thesis (bull FVG bounce, AT SUPPORT setup, signal engine fire) &mdash; not from waiting for gaps to disappear.',
      },
    ],
  },
  {
    id: 'r4',
    scenario:
      'BTC 15m. The Imbalance row reads <strong class="text-white">&#9650; 0.2 ATR &#9660; 0.3 ATR</strong> &rarr; <strong class="text-amber-400">GAP CLUSTER</strong>. Both a bull FVG below and a bear FVG above are within 0.5 ATR of current price. The Ribbon stack is CROSSING (no clear direction).',
    prompt: 'What is the right play?',
    options: [
      {
        id: 'a',
        text: 'Take a long bounce off the bull FVG &mdash; AT GAP territory.',
        correct: false,
        explain:
          'Misses the GAP CLUSTER context. When price is AT both bull and bear gaps simultaneously, the cascade fires GAP CLUSTER specifically because the geometry is pre-breakout, not bounce. Whichever side breaks first is where the move goes; betting on a bounce in this configuration is guessing direction without information.',
      },
      {
        id: 'b',
        text: 'Mark both gap edges as breakout triggers. Enter on first close beyond either edge, stop on opposite side, target the next major FVG or Structure level.',
        correct: true,
        explain:
          'Correct. GAP CLUSTER is a pre-breakout context, same playbook as DOUBLE COIL or DECISION ZONE. Mark both extremes; first close beyond either is the breakout entry; stop opposite side. The CROSSING Ribbon adds confirmation that direction is undetermined &mdash; let price commit before sizing. Targets are the next major magnets in the breakout direction.',
      },
      {
        id: 'c',
        text: 'Take BOTH a long stop-buy above the bear gap AND a short stop-sell below the bull gap to catch whichever breaks first.',
        correct: false,
        explain:
          'Bracket orders introduce execution risk: if the spread widens or you slip the entry on the breakout, the not-triggered side becomes your stop and you can lose on both sides. Single-side entry on confirmed close-through is cleaner. Save bracket complexity for after you\u2019ve mastered the simpler version.',
      },
      {
        id: 'd',
        text: 'Skip entirely &mdash; CROSSING Ribbon means no directional trades allowed.',
        correct: false,
        explain:
          'CROSSING means no DIRECTIONAL trades from the Ribbon perspective, but GAP CLUSTER is explicitly a breakout setup, not a directional one. You\u2019re trading the breakout direction as it commits, not predicting it. Skipping GAP CLUSTER is leaving one of CIPHER\u2019s highest-edge contexts unworked. The Ribbon CROSSING actually CONFIRMS that direction is genuinely undetermined &mdash; reinforcing the breakout thesis.',
      },
    ],
  },
  {
    id: 'r5',
    scenario:
      'You\u2019re long XAUUSD 1H from a bull FVG entry 8 bars ago, +1.2R in profit. The bull gap behind you has filled to 55%. The Imbalance row now reads <strong class="text-white">&#9650; 1.8 ATR &#9660; 0.4 ATR</strong> &rarr; <strong class="text-amber-400">AT BEAR GAP</strong>. The bear FVG above is exactly the gap you marked as your initial target.',
    prompt: 'What is the right action right now?',
    options: [
      {
        id: 'a',
        text: 'Hold the full position &mdash; the trend is still intact, let it run further.',
        correct: false,
        explain:
          'You hit your initial target. AT BEAR GAP means price has reached the magnet you marked at entry. Holding the FULL position past your planned target ignores the discipline that earned you the +1.2R in the first place. Some scale-out is warranted; the question is how much.',
      },
      {
        id: 'b',
        text: 'Scale out the runner portion (full position close, or substantial partial). The bull gap behind is 55% filled \u2014 prior partial scale already happened (or should have); the bear FVG target is hit; this is exit territory.',
        correct: true,
        explain:
          'Correct. Section 14 playbook: scale out at 50% fill of the entry gap (which already triggered or should have triggered at 55%); exit at the opposite-direction FVG target. AT BEAR GAP on the gap you marked = target hit. Take the win and reset. Holding past planned targets is a discipline failure, not a strategy. The +1.2R is real; convert it.',
      },
      {
        id: 'c',
        text: 'Add to the long &mdash; bear FVGs are weak overhead resistance and price will punch through.',
        correct: false,
        explain:
          'Wrong on multiple counts. (1) Adding to a winning trade at the target zone increases exposure exactly when reduction is the disciplined call. (2) AT BEAR GAP means you\u2019re at a magnet, which has historical reaction probability \u2014 not a punch-through zone. (3) Even if price did punch through, the next bear FVG above becomes the new target; let the runner do that work, don\u2019t pyramid into resistance.',
      },
      {
        id: 'd',
        text: 'Reverse to short at the bear FVG \u2014 the gap will reject price downward.',
        correct: false,
        explain:
          'AT BEAR GAP is a rejection-short SETUP zone, but reversing your existing long position is mistaken trade management. You should EXIT the long (target hit), then independently evaluate the bear short setup as a new trade with its own thesis, sizing, and stop. Forcing a reversal because you\u2019re already at the level conflates two separate decisions.',
      },
    ],
  },
];

// ============================================================
// QUIZ — 8 multiple choice questions on Cipher Imbalance
// Covers: 3-candle geometry, birth gates, parallel arrays, smart
//         mitigation formula, original vs remaining, fade by fill,
//         consequential flag, lifecycle paths, stacked detection,
//         cascade verdicts, trading rules.
// ============================================================
const quizQuestions = [
  {
    id: 'q1',
    question: 'How many candles define a Fair Value Gap, and what is the bullish FVG inequality?',
    options: [
      { id: 'a', text: 'Two candles. Bullish: open > previous close.', correct: false },
      { id: 'b', text: 'Three candles, two bars apart. Bullish: low > high[2].', correct: true },
      { id: 'c', text: 'Three consecutive candles. Bullish: low > previous high.', correct: false },
      { id: 'd', text: 'Five candles. Bullish: lowest of last 5 > highest of first 5.', correct: false },
    ],
    explain:
      'A bullish FVG fires when the current bar\u2019s low is above the high from two bars ago \u2014 with the middle candle (candle[1]) doing the gap-creating work. Two bars apart is geometrically meaningful because it means a full candle\u2019s worth of action was skipped over. (Section 2.)',
  },
  {
    id: 'q2',
    question: 'CIPHER demands three birth gates before registering an FVG. What are they?',
    options: [
      { id: 'a', text: 'Geometric gap + minimum 0.3 ATR size + middle candle volume > 1.2x average. All three required.', correct: true },
      { id: 'b', text: 'Geometric gap + Ribbon agreement + RSI confirmation.', correct: false },
      { id: 'c', text: 'Geometric gap + 0.3 ATR size only. Volume is not gated.', correct: false },
      { id: 'd', text: 'Just the geometric gap. Other indicators check size separately.', correct: false },
    ],
    explain:
      'All three gates must pass on the same bar with strict AND logic. The geometric gap filters geometry; the 0.3 ATR size filters trivial gaps; the volume gate (the most important) confirms institutional aggression rather than thin retail flow. CIPHER stores no FVG that fails any gate \u2014 which is why CIPHER\u2019s FVG count is 30-50% lower than retail FVG indicators on the same chart. (Section 3.)',
  },
  {
    id: 'q3',
    question: 'What is the smart mitigation formula that drives box shrinking on a bullish FVG?',
    options: [
      { id: 'a', text: 'new_top := low (replace top with current low whenever in gap).', correct: false },
      { id: 'b', text: 'new_top := math.min(ft, low) when low is inside the gap. The frontier only retreats inward.', correct: true },
      { id: 'c', text: 'new_top := (ft + low) / 2 (average the two values).', correct: false },
      { id: 'd', text: 'new_top doesn\u2019t change \u2014 the box is fixed at original size until full fill.', correct: false },
    ],
    explain:
      'The math.min discipline is the whole game. A naive new_top := low would let the box GROW back if a later bar\u2019s low retreated outside the gap. CIPHER\u2019s math.min guarantees the top edge is monotonically non-increasing \u2014 once shrunk, never grows. This permanence is what makes the live remaining size operationally trustworthy. (Section 5.)',
  },
  {
    id: 'q4',
    question: 'What does "consequential" mean on a Cipher FVG, and how does the engine flag it?',
    options: [
      { id: 'a', text: 'The FVG was created with high volume \u2014 simply tags any high-conviction gap.', correct: false },
      { id: 'b', text: 'The FVG aligns with the Ribbon stack direction at birth (with-trend). CIPHER tags it with &#9733; in the tooltip and gives it a -5 transparency boost (visibly brighter).', correct: true },
      { id: 'c', text: 'The FVG is the most recent one on chart \u2014 only one consequential gap exists at a time.', correct: false },
      { id: 'd', text: 'The FVG has been retested at least once and held.', correct: false },
    ],
    explain:
      'Consequential is set at birth: conseq = ribbon_dir == fvg_dir. With-trend gaps are statistically stronger magnets because the institutional aggression aligned with where money is flowing structurally. The brightness boost is the engine\u2019s priority signal \u2014 trust it as a sizing input (full size on consequential, reduced or skip on non-consequential). (Section 8.)',
  },
  {
    id: 'q5',
    question: 'Why does CIPHER track BOTH original bounds and live bounds for each FVG?',
    options: [
      { id: 'a', text: 'Only the live bounds matter; tracking the original is redundant historical data.', correct: false },
      { id: 'b', text: 'Original gives the historical record + fill % denominator + 50% midline anchor; live gives the current frontier for entries and proximity reads. Both serve operationally distinct purposes.', correct: true },
      { id: 'c', text: 'For backtesting only \u2014 live trading uses just the original.', correct: false },
      { id: 'd', text: 'The two are computed differently as a redundancy check; only one is actually used.', correct: false },
    ],
    explain:
      'Original is immutable historical truth: birth bounds, anchors the 50% midline, denominator for fill percentage. Live is mutable current frontier: drives the visible box, used for entry zones, used for proximity reads in the cascade. Two snapshots of the same FVG, two different operational uses. (Section 6.)',
  },
  {
    id: 'q6',
    question: 'When does a Cipher FVG retire, and what are the three retirement paths?',
    options: [
      { id: 'a', text: 'Only when fully filled \u2014 there\u2019s just one retirement path.', correct: false },
      { id: 'b', text: 'Three paths: (1) full fill (low &lt;= fb for bull, high &gt;= ft for bear), (2) age expiry beyond 100 bars, (3) FIFO pruning when total active count exceeds fvg_max=8.', correct: true },
      { id: 'c', text: 'When the user manually clicks delete on the box.', correct: false },
      { id: 'd', text: 'When the Ribbon stack flips against the gap direction.', correct: false },
    ],
    explain:
      'Three independent paths; any one retires the FVG permanently. Full fill is "promise kept" (institutional move complete). Age expiry is "forgotten" (overwritten by 100 bars of new structure). Pruning is "crowded out" (room for newer gaps). All three retirements remove the FVG from all 11 arrays simultaneously and delete box, midline, and label. (Section 9.)',
  },
  {
    id: 'q7',
    question: 'When does CIPHER fire the STACKED &#9889; (lightning bolt) tier in the Imbalance row?',
    options: [
      { id: 'a', text: 'When 3 or more FVGs of any direction exist on chart.', correct: false },
      { id: 'b', text: 'When 2+ same-direction FVGs are within 2 ATR of each other AND price is AT (within 0.5 ATR of) one of them.', correct: true },
      { id: 'c', text: 'When the volume gate fires above 2x average on the middle candle.', correct: false },
      { id: 'd', text: 'When the Ribbon stack flips during an active FVG.', correct: false },
    ],
    explain:
      'Two conditions both required: stacked detection (2+ same-direction within 2 ATR) AND proximity (AT GAP, within 0.5 ATR). The combined tier sits at cascade positions 2-3, only NO ACTIVE GAPS sits above. Plain stacked without proximity falls to lower tiers (positions 7-8). The &#9889; specifically marks "stacked AND at" \u2014 the highest-conviction operational context. (Section 10.)',
  },
  {
    id: 'q8',
    question: 'You\u2019re entering a long on a bullish FVG bounce. Where does the stop go?',
    options: [
      { id: 'a', text: 'At the live remaining bottom of the FVG.', correct: false },
      { id: 'b', text: 'Just below the ORIGINAL bottom of the FVG, with a small ATR buffer.', correct: true },
      { id: 'c', text: 'At the 50% midline of the original gap.', correct: false },
      { id: 'd', text: 'Below the most recent swing low, regardless of the FVG bounds.', correct: false },
    ],
    explain:
      'Stops go beyond the ORIGINAL bound, not the live edge. Live bounds shrink during partial fills; price routinely wicks deeper into a gap before reversing, which would whipsaw a stop placed at the live. Only a stop beyond the original bottom triggers on a real geometric break of the FVG (which retires the entire gap). The original-vs-live distinction is precisely so operators can place stops beyond original while reading entries off live. (Section 14, Mistake 5 in Section 15.)',
  },
];

// ============================================================
// ANIMSCENE — re-usable animated canvas, IO-paused, DPR-aware
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
// ANIMATION 1 — SmartMitigationAnim (S01 Groundbreaking Concept)
// The headline feature visualised. A bullish FVG is born from 3 candles.
// Price runs up, then returns. As price enters the gap from above, the
// box's TOP edge drops to follow price — the unfilled portion below
// stays visible. Fill % climbs from 0% → 51% → 87% → 100% (deletion).
// The label at the right edge updates with the live percentage.
// ============================================================
function SmartMitigationAnim() {
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

    // Cycle 14s — 4 phases:
    // 0 - 3s: 3-candle gap forms (bull FVG born)
    // 3 - 6s: price runs up away from the gap (0% filled, vivid)
    // 6 - 10s: price returns, top of box drops as gap fills (51%, then 87%)
    // 10 - 14s: full fill, box vanishes
    const cycle = 14.0;
    const cycT = t % cycle;

    // Layout — chart takes left ~70%, fill % gauge on right
    const meterX = padX + chartW * 0.78;
    const meterW = chartW * 0.20;
    const innerChartW = chartW * 0.72;

    // ── Candle generation ──
    // The 3-candle FVG is centered around bar 12-14 of a 36-bar chart
    // Bar 12: green candle (down)
    // Bar 13: middle candle with high volume — creates the gap
    // Bar 14: green candle that opens above bar 12's high
    // After: price runs up, peaks, then descends back into the gap
    const N = 36;
    const baseY = padY + chartH * 0.55;
    const gapBarA = 12; // first candle of gap pattern
    const gapBarB = 14; // third candle (gap confirmation)

    type Candle = { open: number; high: number; low: number; close: number; vol: number };
    const candles: Candle[] = [];

    for (let i = 0; i < N; i++) {
      let mid = baseY;
      const gapMidY = baseY - 30; // where the FVG zone sits
      if (i < gapBarA) {
        // Pre-gap: drift sideways
        mid = baseY + Math.sin(i * 0.6) * 4;
      } else if (i === gapBarA) {
        mid = baseY - 4;
      } else if (i === gapBarA + 1) {
        // Middle candle (high volume) — big jump
        mid = baseY - 22;
      } else if (i === gapBarB) {
        mid = baseY - 36;
      } else if (i < 22) {
        // Run up away from gap
        mid = baseY - 30 - (i - gapBarB) * 2;
      } else if (i < 34) {
        // Return back toward gap (and into it)
        const retT = (i - 22) / 12;
        mid = baseY - 50 + retT * 50;
      } else {
        // Final bars — through the gap
        mid = baseY + 4 + (i - 34) * 2;
      }
      const openY = mid - 3;
      const closeY = mid + 3;
      const highY = mid - 6;
      const lowY = mid + 6;
      candles.push({
        open: openY,
        close: closeY,
        high: highY,
        low: lowY,
        vol: i === gapBarA + 1 ? 1.0 : 0.4 + Math.random() * 0.15,
      });
    }

    // FVG geometry (originals — never change)
    // Bull FVG: top = candle[gapBarB].low, bottom = candle[gapBarA].high
    const orig_top = candles[gapBarB].low;
    const orig_bot = candles[gapBarA].high;

    // ── Determine "current bar" being drawn (everything up to revealIdx is shown) ──
    let revealIdx = 0;
    if (cycT < 3) {
      revealIdx = Math.floor(gapBarB + 1 + (cycT / 3) * 2);
    } else if (cycT < 6) {
      revealIdx = Math.floor(gapBarB + 3 + ((cycT - 3) / 3) * 6);
    } else if (cycT < 10) {
      revealIdx = Math.floor(22 + ((cycT - 6) / 4) * 12);
    } else {
      revealIdx = Math.min(N - 1, Math.floor(33 + ((cycT - 10) / 4) * 4));
    }

    // ── Compute live mitigation: gap top shrinks based on min low across visible bars > gapBarB ──
    let live_top = orig_top;
    for (let i = gapBarB + 1; i <= revealIdx; i++) {
      const lowI = candles[i].low;
      if (lowI < orig_top && lowI > orig_bot) {
        live_top = Math.min(live_top, lowI);
      }
    }
    const orig_size = orig_top - orig_bot;
    const remain_size = live_top - orig_bot;
    const fill_pct = orig_size > 0 ? Math.max(0, Math.min(1, 1 - (remain_size / orig_size))) : 0;

    // Full fill detection — box vanishes
    let full_fill = false;
    for (let i = gapBarB + 1; i <= revealIdx; i++) {
      if (candles[i].low <= orig_bot) {
        full_fill = true;
        break;
      }
    }

    // ── Layout helpers ──
    const px = (i: number) => padX + 6 + (i / (N - 1)) * (innerChartW - 12);

    // ── Draw the FVG box (if not fully filled) ──
    if (revealIdx >= gapBarB && !full_fill) {
      // Fade scales with fill %
      const fadeBoost = fill_pct * 0.4;
      const baseAlpha = 0.30 - fadeBoost;
      const borderAlpha = 0.65 - fadeBoost * 0.5;

      ctx.fillStyle = `rgba(38,166,154,${Math.max(0.05, baseAlpha)})`;
      ctx.fillRect(px(gapBarA), live_top, px(N - 1) - px(gapBarA), orig_bot - live_top);

      // Dashed border
      ctx.strokeStyle = `rgba(38,166,154,${Math.max(0.15, borderAlpha)})`;
      ctx.setLineDash([4, 3]);
      ctx.lineWidth = 1.2;
      ctx.strokeRect(px(gapBarA), live_top, px(N - 1) - px(gapBarA), orig_bot - live_top);
      ctx.setLineDash([]);

      // 50% midline (anchored to ORIGINAL gap)
      const mid_price = (orig_top + orig_bot) / 2;
      // Only show if midline is still inside the remaining gap
      if (mid_price >= orig_bot && mid_price <= live_top) {
        ctx.strokeStyle = `rgba(38,166,154,${Math.max(0.20, borderAlpha * 0.7)})`;
        ctx.setLineDash([1, 3]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px(gapBarA), mid_price);
        ctx.lineTo(px(N - 1), mid_price);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Right-edge fill % label
      const fpInt = Math.round(fill_pct * 100);
      if (fpInt > 5) {
        ctx.font = 'bold 9px ui-sans-serif, system-ui';
        ctx.fillStyle = `rgba(38,166,154,${Math.max(0.4, borderAlpha)})`;
        ctx.textAlign = 'left';
        ctx.fillText(fpInt + '%', px(N - 1) + 4, (live_top + orig_bot) / 2 + 3);
      }
    }

    // ── Draw candles up to revealIdx ──
    for (let i = 0; i <= revealIdx && i < N; i++) {
      const c = candles[i];
      const isUp = c.close < c.open;
      // Highlight middle candle of FVG with volume
      const isFvgMiddle = i === gapBarA + 1;
      ctx.fillStyle = isFvgMiddle ? AMBER : isUp ? 'rgba(38,166,154,0.75)' : 'rgba(239,83,80,0.75)';
      // Wick
      ctx.strokeStyle = ctx.fillStyle as string;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px(i), c.high);
      ctx.lineTo(px(i), c.low);
      ctx.stroke();
      // Body
      ctx.fillRect(px(i) - 1.6, Math.min(c.open, c.close), 3.2, Math.abs(c.close - c.open));
    }

    // ── Top label — phase narrative ──
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    let phaseLabel = '';
    let phaseColor: string = TEAL;
    if (cycT < 3) {
      phaseLabel = '3 CANDLES, 1 GAP \u00B7 BULL FVG BORN';
      phaseColor = TEAL;
    } else if (cycT < 6) {
      phaseLabel = 'PRICE RUNS UP \u00B7 GAP UNFILLED';
      phaseColor = TEAL;
    } else if (cycT < 10) {
      phaseLabel = 'PRICE RETURNS \u00B7 BOX SHRINKS AS GAP FILLS';
      phaseColor = AMBER;
    } else if (full_fill) {
      phaseLabel = 'FULL FILL \u00B7 BOX DELETED';
      phaseColor = MAGENTA;
    } else {
      phaseLabel = 'NEAR FULL FILL \u00B7 PROMISE NEARLY KEPT';
      phaseColor = AMBER;
    }
    ctx.fillStyle = phaseColor;
    ctx.fillText(phaseLabel, padX + innerChartW / 2, padY + 16);

    // ── Fill % gauge (right side) ──
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(meterX, padY, meterW, chartH);
    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.strokeRect(meterX, padY, meterW, chartH);

    ctx.font = 'bold 9px ui-sans-serif, system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = AMBER;
    ctx.fillText('FILL %', meterX + 8, padY + 16);

    // Vertical fill bar
    const barX = meterX + 12;
    const barY = padY + 30;
    const barW = 14;
    const barH = chartH - 56;
    ctx.strokeStyle = 'rgba(255,255,255,0.20)';
    ctx.strokeRect(barX, barY, barW, barH);
    const fillH = (full_fill ? 1.0 : fill_pct) * (barH - 2);
    ctx.fillStyle = full_fill ? MAGENTA : fill_pct > 0.5 ? AMBER : TEAL;
    ctx.fillRect(barX + 1, barY + barH - fillH - 1, barW - 2, fillH);

    // Numeric readout
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.fillStyle = full_fill ? MAGENTA : fill_pct > 0.5 ? AMBER : TEAL;
    ctx.textAlign = 'center';
    ctx.fillText((full_fill ? 100 : Math.round(fill_pct * 100)) + '%', meterX + meterW / 2, padY + chartH - 12);

    // Bottom caption
    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.textAlign = 'center';
    ctx.fillText('Boxes shrink as price returns. The chart shows you only the magnet that\u2019s still active.', padX + innerChartW / 2, h - 8);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 2 — FvgAnatomyAnim (S02)
// The 3-candle gap geometry. Three candles displayed prominently with
// labels: candle[2] (oldest), candle[1] (middle), candle[0] (current).
// The math is overlaid: bullish FVG = low > high[2]. The gap zone is
// highlighted in teal between the relevant edges.
// ============================================================
function FvgAnatomyAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const MAGENTA = '#EF5350';
    const AMBER = '#FFB300';

    ctx.fillStyle = '#0a0f1a';
    ctx.fillRect(0, 0, w, h);

    const padX = 28;
    const padY = 30;
    const chartW = w - padX * 2;
    const chartH = h - padY * 2 - 24;

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.strokeRect(padX, padY, chartW, chartH);

    // Cycle 8s — alternates between bull FVG (0-4s) and bear FVG (4-8s)
    const cycle = 8.0;
    const cycT = t % cycle;
    const isBull = cycT < 4.0;

    // Position the 3 candles centrally
    const candleW = 30;
    const candleSpace = 60;
    const groupCenterX = padX + chartW / 2;
    const c2X = groupCenterX - candleSpace; // oldest
    const c1X = groupCenterX;
    const c0X = groupCenterX + candleSpace; // current

    const baseY = padY + chartH * 0.55;

    // Bull FVG geometry: c[2] body lower, c[0] body higher, c[0].low > c[2].high
    // Bear FVG geometry: c[2] body higher, c[0] body lower, c[0].high < c[2].low
    let c2: { o: number; h: number; l: number; c: number };
    let c1: { o: number; h: number; l: number; c: number };
    let c0: { o: number; h: number; l: number; c: number };

    if (isBull) {
      c2 = { o: baseY, h: baseY - 10, l: baseY + 10, c: baseY + 4 };
      c1 = { o: baseY - 4, h: baseY - 30, l: baseY - 6, c: baseY - 28 };
      c0 = { o: baseY - 36, h: baseY - 48, l: baseY - 32, c: baseY - 42 };
    } else {
      c2 = { o: baseY - 28, h: baseY - 32, l: baseY - 12, c: baseY - 18 };
      c1 = { o: baseY - 18, h: baseY - 12, l: baseY + 8, c: baseY + 6 };
      c0 = { o: baseY + 14, h: baseY + 8, l: baseY + 24, c: baseY + 22 };
    }

    // Highlight the FVG zone
    const gapTop = isBull ? c0.l : c2.l;
    const gapBot = isBull ? c2.h : c0.h;
    const gapColor = isBull ? TEAL : MAGENTA;
    const gapColorRGB = isBull ? '38,166,154' : '239,83,80';

    // Pulsing glow (every cycle) when gap is identified
    const pulse = 0.5 + 0.5 * Math.sin(t * 4);
    const gapAlpha = 0.20 + pulse * 0.15;

    // Box from c2 to c0
    ctx.fillStyle = `rgba(${gapColorRGB},${gapAlpha})`;
    ctx.fillRect(c2X - candleW / 2, gapTop, c0X - c2X + candleW, gapBot - gapTop);
    ctx.strokeStyle = `rgba(${gapColorRGB},${0.5 + pulse * 0.3})`;
    ctx.setLineDash([4, 3]);
    ctx.lineWidth = 1.2;
    ctx.strokeRect(c2X - candleW / 2, gapTop, c0X - c2X + candleW, gapBot - gapTop);
    ctx.setLineDash([]);

    // Gap label
    ctx.font = 'bold 12px ui-sans-serif, system-ui';
    ctx.fillStyle = gapColor;
    ctx.textAlign = 'center';
    ctx.fillText(isBull ? 'BULL FVG' : 'BEAR FVG', groupCenterX, (gapTop + gapBot) / 2 + 4);

    // Draw candles
    const drawCandle = (cd: { o: number; h: number; l: number; c: number }, x: number, label: string) => {
      const isUp = cd.c < cd.o;
      const color = isUp ? 'rgba(38,166,154,0.85)' : 'rgba(239,83,80,0.85)';
      // Wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, cd.h);
      ctx.lineTo(x, cd.l);
      ctx.stroke();
      // Body
      ctx.fillStyle = color;
      ctx.fillRect(x - candleW / 2, Math.min(cd.o, cd.c), candleW, Math.abs(cd.c - cd.o));

      // Index label below
      ctx.font = '9px ui-sans-serif, system-ui';
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.textAlign = 'center';
      ctx.fillText(label, x, padY + chartH - 4);
    };

    drawCandle(c2, c2X, 'candle[2]');
    drawCandle(c1, c1X, 'candle[1]');
    drawCandle(c0, c0X, 'candle[0]');

    // Annotations: the relevant edge points
    const arrowSize = 4;
    if (isBull) {
      // Mark candle[2].high (gap bottom)
      ctx.fillStyle = AMBER;
      ctx.beginPath();
      ctx.moveTo(c2X + candleW / 2 + 4, c2.h);
      ctx.lineTo(c2X + candleW / 2 + 4 + arrowSize * 2, c2.h - arrowSize);
      ctx.lineTo(c2X + candleW / 2 + 4 + arrowSize * 2, c2.h + arrowSize);
      ctx.closePath();
      ctx.fill();
      ctx.font = '9px ui-sans-serif, system-ui';
      ctx.fillStyle = AMBER;
      ctx.textAlign = 'left';
      ctx.fillText('high[2]', c2X + candleW / 2 + 12, c2.h + 3);

      // Mark candle[0].low (gap top)
      ctx.fillStyle = AMBER;
      ctx.beginPath();
      ctx.moveTo(c0X - candleW / 2 - 4, c0.l);
      ctx.lineTo(c0X - candleW / 2 - 4 - arrowSize * 2, c0.l - arrowSize);
      ctx.lineTo(c0X - candleW / 2 - 4 - arrowSize * 2, c0.l + arrowSize);
      ctx.closePath();
      ctx.fill();
      ctx.textAlign = 'right';
      ctx.fillText('low', c0X - candleW / 2 - 12, c0.l + 3);
    } else {
      // Mark candle[2].low (gap top)
      ctx.fillStyle = AMBER;
      ctx.beginPath();
      ctx.moveTo(c2X + candleW / 2 + 4, c2.l);
      ctx.lineTo(c2X + candleW / 2 + 4 + arrowSize * 2, c2.l - arrowSize);
      ctx.lineTo(c2X + candleW / 2 + 4 + arrowSize * 2, c2.l + arrowSize);
      ctx.closePath();
      ctx.fill();
      ctx.font = '9px ui-sans-serif, system-ui';
      ctx.fillStyle = AMBER;
      ctx.textAlign = 'left';
      ctx.fillText('low[2]', c2X + candleW / 2 + 12, c2.l + 3);

      // Mark candle[0].high (gap bottom)
      ctx.fillStyle = AMBER;
      ctx.beginPath();
      ctx.moveTo(c0X - candleW / 2 - 4, c0.h);
      ctx.lineTo(c0X - candleW / 2 - 4 - arrowSize * 2, c0.h - arrowSize);
      ctx.lineTo(c0X - candleW / 2 - 4 - arrowSize * 2, c0.h + arrowSize);
      ctx.closePath();
      ctx.fill();
      ctx.textAlign = 'right';
      ctx.fillText('high', c0X - candleW / 2 - 12, c0.h + 3);
    }

    // Top: the formula
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = gapColor;
    ctx.fillText(isBull ? 'low > high[2]   \u2192   gap up' : 'high < low[2]   \u2192   gap down', groupCenterX, padY + 18);

    // Bottom caption
    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.textAlign = 'center';
    ctx.fillText('Three candles. Two bars apart. The middle candle skipped over fair value.', padX + chartW / 2, h - 4);

    // Phase progress dots
    const dotsY = h - 14;
    void dotsY;
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 3 — BirthGatesAnim (S03)
// Three sequential gates lit up in turn: (1) geometric gap detected,
// (2) gap size ≥ 0.3 ATR, (3) middle candle volume ≥ 1.2x average.
// Only when all three pass does a real FVG get born. A gate panel on
// the right shows each gate's status as the sequence plays out.
// ============================================================
function BirthGatesAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const MAGENTA = '#EF5350';
    const AMBER = '#FFB300';

    ctx.fillStyle = '#0a0f1a';
    ctx.fillRect(0, 0, w, h);

    const padX = 24;
    const padY = 28;
    const chartW = w * 0.58 - padX;
    const chartH = h - padY * 2 - 22;
    const panelX = padX + chartW + 14;
    const panelW = w - panelX - padX;

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.strokeRect(padX, padY, chartW, chartH);

    // Cycle 12s — 4 gates evaluated sequentially in 3s phases:
    // phase 0 (0-3s): gate 1 evaluated (geometric gap)
    // phase 1 (3-6s): gate 2 evaluated (size)
    // phase 2 (6-9s): gate 3 evaluated (volume)
    // phase 3 (9-12s): all pass, FVG born
    const cycle = 12.0;
    const phaseDur = 3.0;
    const cycT = t % cycle;
    const phase = Math.floor(cycT / phaseDur);

    // 3-candle pattern at center
    const groupCenterX = padX + chartW / 2;
    const candleSpace = 32;
    const c2X = groupCenterX - candleSpace;
    const c1X = groupCenterX;
    const c0X = groupCenterX + candleSpace;
    const baseY = padY + chartH * 0.55;

    // Bull FVG candles
    const c2 = { o: baseY, h: baseY - 8, l: baseY + 6, c: baseY + 4 };
    const c1 = { o: baseY - 2, h: baseY - 24, l: baseY - 4, c: baseY - 22 };
    const c0 = { o: baseY - 28, h: baseY - 36, l: baseY - 24, c: baseY - 32 };

    // Volume bars below
    const volY = padY + chartH - 30;
    const volH = 22;

    // Draw candles with phase-dependent highlights
    const drawCandle = (cd: { o: number; h: number; l: number; c: number }, x: number, highlight: boolean) => {
      const isUp = cd.c < cd.o;
      const baseColor = isUp ? '38,166,154' : '239,83,80';
      const alpha = highlight ? 1.0 : 0.50;
      ctx.strokeStyle = `rgba(${baseColor},${alpha})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, cd.h);
      ctx.lineTo(x, cd.l);
      ctx.stroke();
      ctx.fillStyle = `rgba(${baseColor},${alpha})`;
      ctx.fillRect(x - 14, Math.min(cd.o, cd.c), 28, Math.abs(cd.c - cd.o));
    };

    // Highlight all 3 candles in phase 0+; emphasize middle in phase 2
    drawCandle(c2, c2X, phase >= 0);
    drawCandle(c1, c1X, phase >= 2 || phase === 0);
    drawCandle(c0, c0X, phase >= 0);

    // Gate 1 visualisation — gap zone
    const gapTop = c0.l;
    const gapBot = c2.h;
    if (phase >= 0) {
      ctx.fillStyle = phase >= 3 ? 'rgba(38,166,154,0.30)' : 'rgba(255,179,0,0.20)';
      ctx.fillRect(c2X - 14, gapTop, c0X - c2X + 28, gapBot - gapTop);
      ctx.strokeStyle = phase >= 3 ? `rgba(38,166,154,0.85)` : 'rgba(255,179,0,0.65)';
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1.2;
      ctx.strokeRect(c2X - 14, gapTop, c0X - c2X + 28, gapBot - gapTop);
      ctx.setLineDash([]);
    }

    // Gate 2 visualisation — ATR scale bar (vertical)
    if (phase >= 1) {
      const atrPx = 12; // 1 ATR in pixels
      const atrThreshPx = atrPx * 0.3;
      const scaleX = padX + chartW - 22;
      const scaleY = gapBot;
      ctx.strokeStyle = phase >= 1 ? 'rgba(255,179,0,0.85)' : 'rgba(255,255,255,0.30)';
      ctx.lineWidth = 1.2;
      // 0.3 ATR threshold marker
      ctx.beginPath();
      ctx.moveTo(scaleX - 5, scaleY - atrThreshPx);
      ctx.lineTo(scaleX + 5, scaleY - atrThreshPx);
      ctx.stroke();
      // Vertical scale showing actual gap size
      ctx.beginPath();
      ctx.moveTo(scaleX, scaleY);
      ctx.lineTo(scaleX, gapTop);
      ctx.stroke();
      ctx.font = '8px ui-sans-serif, system-ui';
      ctx.fillStyle = AMBER;
      ctx.textAlign = 'left';
      ctx.fillText('0.3 ATR', scaleX + 8, scaleY - atrThreshPx + 3);
    }

    // Gate 3 visualisation — volume bars below
    if (phase >= 2) {
      // Average vol line
      const avgY = volY + volH * 0.55;
      ctx.strokeStyle = 'rgba(255,255,255,0.30)';
      ctx.setLineDash([2, 3]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padX + 6, avgY);
      ctx.lineTo(padX + chartW - 6, avgY);
      ctx.stroke();
      ctx.setLineDash([]);
      // Volume bars per candle
      const bars = [
        { x: c2X, h: 6, color: 'rgba(255,255,255,0.4)' },
        { x: c1X, h: volH * 0.85, color: AMBER }, // BIG — middle candle
        { x: c0X, h: 7, color: 'rgba(255,255,255,0.4)' },
      ];
      bars.forEach((b) => {
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x - 12, volY + volH - b.h, 24, b.h);
      });
      // Threshold label
      ctx.font = '8px ui-sans-serif, system-ui';
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.textAlign = 'left';
      ctx.fillText('1.2\u00D7 avg', padX + chartW - 50, avgY - 3);
    }

    // Final birth marker
    if (phase >= 3) {
      ctx.font = 'bold 10px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillStyle = TEAL;
      ctx.fillText('\u2713 FVG BORN', groupCenterX, padY + 18);
    } else {
      ctx.font = 'bold 10px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillStyle = AMBER;
      ctx.fillText('CHECKING GATES...', groupCenterX, padY + 18);
    }

    // ── Side panel: the 3 gates checklist ──
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(panelX, padY, panelW, chartH);
    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.strokeRect(panelX, padY, panelW, chartH);

    ctx.font = 'bold 9px ui-sans-serif, system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = AMBER;
    ctx.fillText('BIRTH GATES', panelX + 8, padY + 16);

    const gates = [
      { label: 'Geometric gap', detail: 'low > high[2]' },
      { label: 'Size filter', detail: '> 0.3 ATR' },
      { label: 'Volume', detail: 'middle bar > 1.2\u00D7 avg' },
    ];

    gates.forEach((g, i) => {
      const fy = padY + 36 + i * 38;
      const isLit = phase > i;
      const isCurrent = phase === i;
      // Status circle
      ctx.beginPath();
      ctx.arc(panelX + 14, fy + 6, 5, 0, Math.PI * 2);
      ctx.fillStyle = isLit ? TEAL : isCurrent ? AMBER : 'rgba(255,255,255,0.15)';
      ctx.fill();
      // Checkmark on lit gates
      if (isLit) {
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(panelX + 11, fy + 6);
        ctx.lineTo(panelX + 13, fy + 9);
        ctx.lineTo(panelX + 17, fy + 3);
        ctx.stroke();
      }
      // Label + detail
      ctx.font = isCurrent || isLit ? 'bold 10px ui-sans-serif, system-ui' : '10px ui-sans-serif, system-ui';
      ctx.fillStyle = isLit ? 'rgba(255,255,255,0.95)' : isCurrent ? AMBER : 'rgba(255,255,255,0.40)';
      ctx.textAlign = 'left';
      ctx.fillText('Gate ' + (i + 1) + ': ' + g.label, panelX + 26, fy + 4);
      ctx.font = '8px ui-sans-serif, system-ui';
      ctx.fillStyle = isLit ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.30)';
      ctx.fillText(g.detail, panelX + 26, fy + 16);
    });

    // Final outcome
    const outcomeY = padY + 36 + 3 * 38 + 14;
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath();
    ctx.moveTo(panelX + 8, outcomeY - 8);
    ctx.lineTo(panelX + panelW - 8, outcomeY - 8);
    ctx.stroke();
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = phase >= 3 ? TEAL : 'rgba(255,255,255,0.40)';
    ctx.fillText(phase >= 3 ? 'FVG REGISTERED' : 'PENDING...', panelX + panelW / 2, outcomeY + 8);

    void MAGENTA;

    // Bottom caption
    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.textAlign = 'center';
    ctx.fillText('All three must pass. One gate fails, no FVG.', padX + chartW / 2, h - 6);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 4 — ParallelArraysAnim (S04)
// Record card showing all 11 fields populating as a level forms.
// Highlights the "original vs live" pair (orig_top/bot frozen,
// top/bot mutable). Cycles through 3 stages: birth (all fields set),
// partial mitigation (live fields shrink), full fill (record vanishes).
// ============================================================
function ParallelArraysAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const MAGENTA = '#EF5350';
    const AMBER = '#FFB300';

    ctx.fillStyle = '#0a0f1a';
    ctx.fillRect(0, 0, w, h);

    // Layout: chart top ~30%, record card bottom ~60% with field grid
    const padX = 22;
    const padY = 24;
    const cardW = w - padX * 2;
    const cardH = h - padY * 2;

    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(padX, padY, cardW, cardH);
    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.strokeRect(padX, padY, cardW, cardH);

    // Cycle 12s — 3 stages of 4s
    // 0: birth — all fields populated, fill 0%
    // 1: mitigation — live fields shrink, fill 47%
    // 2: full fill — record about to vanish (or vanished)
    const cycle = 12.0;
    const phaseDur = 4.0;
    const cycT = t % cycle;
    const phase = Math.floor(cycT / phaseDur);

    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = AMBER;
    ctx.fillText('FVG RECORD CARD \u00B7 ALL 11 FIELDS', padX + 14, padY + 22);

    // Stage label
    const stages = ['STAGE 1 \u00B7 BIRTH', 'STAGE 2 \u00B7 MITIGATION (47% filled)', 'STAGE 3 \u00B7 FULL FILL \u2192 DELETE'];
    const stageColors = [TEAL, AMBER, MAGENTA];
    ctx.font = 'bold 9px ui-sans-serif, system-ui';
    ctx.textAlign = 'right';
    ctx.fillStyle = stageColors[phase];
    ctx.fillText(stages[phase], padX + cardW - 14, padY + 22);

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath();
    ctx.moveTo(padX + 12, padY + 32);
    ctx.lineTo(padX + cardW - 12, padY + 32);
    ctx.stroke();

    // Field rows — split into two columns
    type Field = {
      name: string;
      stage0: string;
      stage1: string;
      stage2: string;
      isOriginal?: boolean;
      isLive?: boolean;
      stage1Color?: string;
      stage2Color?: string;
    };

    const fields: Field[] = [
      { name: 'fvg_orig_top', stage0: '4654.20', stage1: '4654.20', stage2: '4654.20', isOriginal: true },
      { name: 'fvg_orig_bot', stage0: '4640.10', stage1: '4640.10', stage2: '4640.10', isOriginal: true },
      { name: 'fvg_top', stage0: '4654.20', stage1: '4647.50', stage2: '\u2014', isLive: true, stage1Color: AMBER },
      { name: 'fvg_bot', stage0: '4640.10', stage1: '4640.10', stage2: '\u2014', isLive: true },
      { name: 'fvg_dir', stage0: '+1 (BULL)', stage1: '+1 (BULL)', stage2: '\u2014' },
      { name: 'fvg_bar', stage0: '147', stage1: '147', stage2: '\u2014' },
      { name: 'fvg_conseq', stage0: '1 (\u2605)', stage1: '1 (\u2605)', stage2: '\u2014', stage2Color: TEAL },
      { name: 'fvg_box', stage0: 'box.new()', stage1: 'box.shrink()', stage2: 'box.delete()', stage2Color: MAGENTA },
      { name: 'fvg_mid', stage0: 'line.new()', stage1: 'line at 4647.15', stage2: 'line.delete()' },
      { name: 'fvg_lbl', stage0: 'label "0%"', stage1: 'label "47%"', stage2: 'label.delete()' },
    ];
    // 11 fields; we only have 10 here (fvg_orig_top/bot are two; rest are 9; total = 11 = 10 listed + age computed not stored)
    // Actually: orig_top, orig_bot, top, bot, dir, bar, conseq, box, mid, lbl = 10. The 11th is implicit "age" via bar_index - fvg_bar.
    // Let's add age as a derived row to make it 11.
    fields.push({ name: '\u2192 age (derived)', stage0: '0 / 100', stage1: '24 / 100', stage2: '\u2014', stage2Color: 'rgba(255,255,255,0.3)' });

    const colCount = 2;
    const rowsPerCol = Math.ceil(fields.length / colCount);
    const colW = (cardW - 24) / colCount;
    const rowH = (cardH - 60) / rowsPerCol;

    fields.forEach((f, i) => {
      const col = Math.floor(i / rowsPerCol);
      const row = i % rowsPerCol;
      const fx = padX + 14 + col * colW;
      const fy = padY + 44 + row * rowH;

      // Field name (with prefix indicator)
      const isOrigField = f.isOriginal;
      const isLiveField = f.isLive;
      const prefix = isOrigField ? '\u25EF ' : isLiveField ? '\u25CF ' : '  ';
      ctx.font = '9px ui-sans-serif, system-ui';
      ctx.fillStyle = isOrigField ? 'rgba(255,255,255,0.55)' : isLiveField ? AMBER : 'rgba(255,255,255,0.45)';
      ctx.textAlign = 'left';
      ctx.fillText(prefix + f.name, fx, fy);

      // Value — by stage
      const value = phase === 0 ? f.stage0 : phase === 1 ? f.stage1 : f.stage2;
      let valueColor = 'rgba(255,255,255,0.85)';
      if (phase === 1 && f.stage1Color) valueColor = f.stage1Color;
      if (phase === 2 && f.stage2Color) valueColor = f.stage2Color;
      if (phase === 2 && value === '\u2014') valueColor = 'rgba(255,255,255,0.30)';

      ctx.font = 'bold 9px ui-sans-serif, system-ui';
      ctx.fillStyle = valueColor;
      ctx.textAlign = 'right';
      ctx.fillText(value, fx + colW - 14, fy);
    });

    // Legend at bottom
    const legendY = padY + cardH - 22;
    ctx.font = '8px ui-sans-serif, system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillText('\u25EF  immutable (set at birth, never change)', padX + 14, legendY);
    ctx.fillStyle = AMBER;
    ctx.fillText('\u25CF  live (mutates on mitigation)', padX + 14, legendY + 12);

    void MAGENTA;
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 5 — BoxShrinkDetailAnim (S05)
// Slow-motion deep-dive on the smart mitigation. A bullish FVG with
// price returning. Each tick of price entering the gap is shown step
// by step: arrow points to current low, top edge drops with it. Math
// formula overlay shows the live new_top := math.min(ft, low)
// computation. The unfilled remainder visibly shrinks each step.
// ============================================================
function BoxShrinkDetailAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const MAGENTA = '#EF5350';
    const AMBER = '#FFB300';

    ctx.fillStyle = '#0a0f1a';
    ctx.fillRect(0, 0, w, h);

    const padX = 24;
    const padY = 28;
    const chartW = w * 0.66 - padX;
    const chartH = h - padY * 2 - 22;
    const formulaX = padX + chartW + 14;
    const formulaW = w - formulaX - padX;

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.strokeRect(padX, padY, chartW, chartH);

    // Cycle 12s — 6 discrete steps as price descends into gap
    const cycle = 12.0;
    const cycT = t % cycle;
    const stepCount = 6;
    const step = Math.floor((cycT / cycle) * stepCount); // 0-5

    // Gap zone — fixed
    const gapTop = padY + chartH * 0.18;
    const gapBot = padY + chartH * 0.50;

    // Each step lowers the candle's low further into the gap
    // Step 0: above gap (new_top = orig_top, fill = 0%)
    // Step 1: low touches gap top (new_top = orig_top, no shrink yet)
    // Step 2: low enters gap (new_top drops to mid-zone)
    // Step 3-4: low descends further (new_top drops more)
    // Step 5: near full fill
    const lowsPerStep = [
      gapTop - 18,
      gapTop + 2,
      gapTop + 12,
      gapTop + 20,
      gapTop + 28,
      gapTop + 32,
    ];
    const currentLow = lowsPerStep[step];

    // Compute live new_top using the Pine logic:
    // if low < ft and low > fb: new_top := math.min(ft, low)
    let liveTop = gapTop;
    for (let s = 0; s <= step; s++) {
      const lowAtStep = lowsPerStep[s];
      if (lowAtStep < gapTop && lowAtStep > gapBot) {
        liveTop = Math.min(liveTop, lowAtStep);
      }
    }

    const orig_size = gapBot - gapTop;
    const remain_size = gapBot - liveTop;
    const fill_pct = orig_size > 0 ? Math.max(0, Math.min(1, 1 - (remain_size / orig_size))) : 0;

    // Draw original gap outline (faint dashed amber rectangle)
    ctx.strokeStyle = 'rgba(255,179,0,0.40)';
    ctx.setLineDash([2, 3]);
    ctx.lineWidth = 1;
    ctx.strokeRect(padX + 8, gapTop, chartW - 16, gapBot - gapTop);
    ctx.setLineDash([]);
    ctx.font = '8px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,179,0,0.65)';
    ctx.textAlign = 'left';
    ctx.fillText('original', padX + 12, gapTop - 4);

    // Draw live (shrinking) gap
    const fadeBoost = fill_pct * 0.4;
    const fillAlpha = Math.max(0.10, 0.30 - fadeBoost);
    ctx.fillStyle = `rgba(38,166,154,${fillAlpha})`;
    ctx.fillRect(padX + 8, liveTop, chartW - 16, gapBot - liveTop);
    ctx.strokeStyle = `rgba(38,166,154,${Math.max(0.30, 0.75 - fadeBoost * 0.5)})`;
    ctx.setLineDash([4, 3]);
    ctx.lineWidth = 1.4;
    ctx.strokeRect(padX + 8, liveTop, chartW - 16, gapBot - liveTop);
    ctx.setLineDash([]);

    // Live edge label
    ctx.font = 'bold 9px ui-sans-serif, system-ui';
    ctx.fillStyle = TEAL;
    ctx.textAlign = 'left';
    ctx.fillText('live', padX + 12, liveTop - 4);

    // Single candle showing the current step's low
    const candleX = padX + chartW * 0.55;
    const candleY = currentLow - 18;
    const candleH = 26;
    ctx.fillStyle = step >= 2 && step <= 4 ? AMBER : 'rgba(38,166,154,0.85)';
    ctx.fillRect(candleX - 4, candleY, 8, candleH);
    // Wick to the low
    ctx.strokeStyle = ctx.fillStyle as string;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(candleX, candleY + candleH);
    ctx.lineTo(candleX, currentLow);
    ctx.stroke();

    // Arrow from candle's low to liveTop edge of box
    if (step >= 2 && step <= 4) {
      ctx.strokeStyle = AMBER;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(candleX + 8, currentLow);
      ctx.lineTo(padX + chartW - 12, liveTop);
      ctx.stroke();
      ctx.setLineDash([]);
      // Arrow head
      ctx.fillStyle = AMBER;
      ctx.beginPath();
      ctx.moveTo(padX + chartW - 12, liveTop);
      ctx.lineTo(padX + chartW - 18, liveTop - 3);
      ctx.lineTo(padX + chartW - 18, liveTop + 3);
      ctx.closePath();
      ctx.fill();
    }

    // Step counter top
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    const stepLabels = [
      'STEP 1 \u00B7 Price above gap',
      'STEP 2 \u00B7 Touch top of gap',
      'STEP 3 \u00B7 Enter gap, low = mid',
      'STEP 4 \u00B7 Deeper into gap',
      'STEP 5 \u00B7 Approaching bottom',
      'STEP 6 \u00B7 Near full fill',
    ];
    ctx.fillStyle = step >= 4 ? AMBER : TEAL;
    ctx.fillText(stepLabels[step], padX + chartW / 2, padY + 16);

    // ── Formula panel (right) ──
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(formulaX, padY, formulaW, chartH);
    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.strokeRect(formulaX, padY, formulaW, chartH);

    ctx.font = 'bold 9px ui-sans-serif, system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = AMBER;
    ctx.fillText('THE SHRINK FORMULA', formulaX + 8, padY + 16);

    // Pine-style code lines
    ctx.font = '9px ui-sans-serif, monospace';
    const codeLines = [
      { txt: 'if low < ft and', col: 'rgba(255,255,255,0.85)' },
      { txt: '   low > fb:', col: 'rgba(255,255,255,0.85)' },
      { txt: '  new_top :=', col: TEAL },
      { txt: '    math.min(', col: 'rgba(255,255,255,0.7)' },
      { txt: '      ft, low)', col: 'rgba(255,255,255,0.7)' },
    ];
    codeLines.forEach((cl, i) => {
      ctx.fillStyle = cl.col;
      ctx.fillText(cl.txt, formulaX + 8, padY + 36 + i * 13);
    });

    // Live values — pulse box
    const valY = padY + 110;
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath();
    ctx.moveTo(formulaX + 8, valY - 8);
    ctx.lineTo(formulaX + formulaW - 8, valY - 8);
    ctx.stroke();

    ctx.font = '8px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillText('ft (current top):', formulaX + 8, valY + 4);
    ctx.font = 'bold 9px ui-sans-serif, monospace';
    ctx.fillStyle = TEAL;
    ctx.fillText('y=' + Math.round(liveTop), formulaX + 8, valY + 16);

    ctx.font = '8px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillText('low (current bar):', formulaX + 8, valY + 32);
    ctx.font = 'bold 9px ui-sans-serif, monospace';
    ctx.fillStyle = AMBER;
    ctx.fillText('y=' + Math.round(currentLow), formulaX + 8, valY + 44);

    ctx.font = '8px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillText('fill %:', formulaX + 8, valY + 60);
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.fillStyle = fill_pct > 0.5 ? AMBER : TEAL;
    ctx.fillText(Math.round(fill_pct * 100) + '%', formulaX + 8, valY + 74);

    void MAGENTA;

    // Bottom caption
    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.textAlign = 'center';
    ctx.fillText('Each step: new_top = min(current top, low). The frontier only retreats inward.', padX + chartW / 2, h - 8);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 6 — OriginalVsRemainingAnim (S06)
// Visualises the dual-tracking design. Two overlaid boxes for one FVG:
// the dashed amber outline of the original full size, and the solid teal
// box of the live remaining size. The 50% midline is anchored to the
// original (drawn at the middle of the dashed outline). Price returns,
// only the live box shrinks; the dashed original stays fixed.
// ============================================================
function OriginalVsRemainingAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const MAGENTA = '#EF5350';
    const AMBER = '#FFB300';

    ctx.fillStyle = '#0a0f1a';
    ctx.fillRect(0, 0, w, h);

    const padX = 28;
    const padY = 28;
    const chartW = w - padX * 2;
    const chartH = h - padY * 2 - 22;
    const baseY = padY + chartH * 0.55;

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.strokeRect(padX, padY, chartW, chartH);

    // Cycle 10s. Price oscillates: starts above gap, dips into gap (filling 30%),
    // pulls back partway (gap stays at 30% — original/remaining clearly diverge),
    // dips again to 60%, pulls back... showing that the live shrinks but never expands.
    const cycle = 10.0;
    const cycT = t % cycle;

    // Gap zone — fixed
    const gapTop = padY + chartH * 0.20;
    const gapBot = padY + chartH * 0.50;
    const gapMid = (gapTop + gapBot) / 2;

    // Generate 50 candles with the orchestrated price action
    const N = 50;
    const candles: { x: number; y: number; low: number }[] = [];
    for (let i = 0; i < N; i++) {
      const x = i / (N - 1);
      let candleY = baseY - 30;
      let candleLow = candleY;
      if (x < 0.20) {
        // Pre-gap, sideways above
        candleY = gapTop - 25 + Math.sin(x * Math.PI * 4) * 5;
        candleLow = candleY + 4;
      } else if (x < 0.40) {
        // First dip into gap to ~30%
        const dipT = (x - 0.20) / 0.20;
        candleLow = gapTop - 5 + dipT * 18;
        candleY = candleLow - 8;
      } else if (x < 0.55) {
        // Pull back up — gap remainder stays at 30%
        const upT = (x - 0.40) / 0.15;
        candleLow = gapTop + 13 - upT * 25;
        candleY = candleLow - 8;
      } else if (x < 0.80) {
        // Second deeper dip to ~60%
        const dipT = (x - 0.55) / 0.25;
        candleLow = gapTop - 12 + dipT * 32;
        candleY = candleLow - 8;
      } else {
        // Hold near deeper level
        candleLow = gapTop + 20 + Math.sin((x - 0.80) * Math.PI * 4) * 4;
        candleY = candleLow - 8;
      }
      candles.push({ x: padX + 6 + x * (chartW - 12), y: candleY, low: candleLow });
    }

    // Compute live top: min of all visible lows that fell inside the gap
    let liveTop = gapTop;
    for (let i = 0; i < N; i++) {
      const lowI = candles[i].low;
      if (lowI > gapTop && lowI < gapBot) {
        liveTop = Math.max(liveTop, lowI);
      }
    }
    // The live shrinking only retreats inward — equivalent to current minimum that price reached
    // (since gapTop is "above" in y-coordinate space, "min low" geometrically = max y)

    const orig_size = gapBot - gapTop;
    const remain_size = gapBot - liveTop;
    const fill_pct = Math.max(0, Math.min(1, 1 - (remain_size / orig_size)));

    // Draw ORIGINAL outline (dashed amber, faint, never changes)
    ctx.strokeStyle = 'rgba(255,179,0,0.55)';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.2;
    ctx.strokeRect(padX + 8, gapTop, chartW - 16, gapBot - gapTop);
    ctx.setLineDash([]);
    ctx.font = 'bold 9px ui-sans-serif, system-ui';
    ctx.fillStyle = AMBER;
    ctx.textAlign = 'left';
    ctx.fillText('ORIGINAL (fvg_orig_top / fvg_orig_bot)', padX + 12, gapTop - 6);

    // Draw LIVE shrinking box (teal solid)
    const liveAlpha = Math.max(0.15, 0.40 - fill_pct * 0.20);
    ctx.fillStyle = `rgba(38,166,154,${liveAlpha})`;
    ctx.fillRect(padX + 8, liveTop, chartW - 16, gapBot - liveTop);
    ctx.strokeStyle = `rgba(38,166,154,${Math.max(0.4, 0.85 - fill_pct * 0.4)})`;
    ctx.lineWidth = 1.4;
    ctx.strokeRect(padX + 8, liveTop, chartW - 16, gapBot - liveTop);
    ctx.font = 'bold 9px ui-sans-serif, system-ui';
    ctx.fillStyle = TEAL;
    ctx.fillText('LIVE (fvg_top / fvg_bot)', padX + 12, liveTop + 12);

    // 50% midline — ANCHORED TO ORIGINAL (between gapTop and gapBot)
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.setLineDash([2, 3]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padX + 8, gapMid);
    ctx.lineTo(padX + chartW - 8, gapMid);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = '8px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.textAlign = 'right';
    ctx.fillText('50% midline (anchored to ORIGINAL, never moves)', padX + chartW - 12, gapMid - 4);

    // Plot candles up through the current visible range
    const visibleN = Math.floor(N * (cycT / cycle));
    for (let i = 0; i < Math.min(visibleN, N); i++) {
      const c = candles[i];
      const isUp = i % 3 === 0;
      ctx.fillStyle = isUp ? 'rgba(38,166,154,0.65)' : 'rgba(239,83,80,0.55)';
      ctx.strokeStyle = ctx.fillStyle as string;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(c.x, c.y - 6);
      ctx.lineTo(c.x, c.low);
      ctx.stroke();
      ctx.fillRect(c.x - 1.4, c.y - 4, 2.8, 8);
    }

    // Top label
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = AMBER;
    ctx.fillText('TWO SETS OF BOUNDS, ONE FVG', padX + chartW / 2, padY + 16);

    // Live readouts at right
    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillText('original size: ' + Math.round(orig_size) + 'px', padX + chartW - 8, padY + chartH - 16);
    ctx.fillStyle = fill_pct > 0.5 ? AMBER : TEAL;
    ctx.fillText('remaining: ' + Math.round(remain_size) + 'px (' + Math.round((1 - fill_pct) * 100) + '%)', padX + chartW - 8, padY + chartH - 4);

    // Bottom caption
    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.textAlign = 'center';
    ctx.fillText('The dashed original is a fixed historical reference. The live box is the current frontier.', padX + chartW / 2, h - 8);

    void MAGENTA;
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 7 — FillPctFadeAnim (S07)
// 4 boxes arranged horizontally at the same fill increments (0%, 30%,
// 60%, 90%) showing the visible difference in opacity. Each box has
// its fill % label at the right edge. Demonstrates the fade-by-fill
// progression operators see when scanning a chart.
// ============================================================
function FillPctFadeAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const MAGENTA = '#EF5350';
    const AMBER = '#FFB300';

    ctx.fillStyle = '#0a0f1a';
    ctx.fillRect(0, 0, w, h);

    const padX = 24;
    const padY = 30;
    const chartW = w - padX * 2;
    const chartH = h - padY * 2 - 22;

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.strokeRect(padX, padY, chartW, chartH);

    // Draw 4 example FVGs at progressive fill percentages
    const fillPcts = [0.0, 0.30, 0.60, 0.90];
    const slotW = (chartW - 40) / fillPcts.length;
    const slotH = chartH * 0.55;
    const slotY = padY + chartH * 0.20;

    // Subtle pulse for the current "spotlight" (cycles through each)
    const cycle = 8.0;
    const phase = Math.floor((t % cycle) / 2.0); // 0-3

    fillPcts.forEach((fp, i) => {
      const slotX = padX + 20 + i * slotW;
      const isSpotlight = i === phase;

      // Original outline (dashed faint amber)
      ctx.strokeStyle = 'rgba(255,179,0,0.30)';
      ctx.setLineDash([2, 3]);
      ctx.lineWidth = 1;
      ctx.strokeRect(slotX, slotY, slotW * 0.8, slotH);
      ctx.setLineDash([]);

      // Live remaining box — top edge drops by fp fraction, fade scales with fp
      const remainTop = slotY + slotH * fp;
      const remainH = slotH * (1 - fp);

      const fillFade = fp * 0.4;
      const baseAlpha = Math.max(0.05, 0.40 - fillFade);
      const borderAlpha = Math.max(0.20, 0.85 - fillFade * 0.6);
      // Spotlight gets a subtle pulse
      const spotPulse = isSpotlight ? 0.05 + 0.03 * Math.sin(t * 4) : 0;
      ctx.fillStyle = `rgba(38,166,154,${baseAlpha + spotPulse})`;
      ctx.fillRect(slotX, remainTop, slotW * 0.8, remainH);
      ctx.strokeStyle = `rgba(38,166,154,${borderAlpha})`;
      ctx.setLineDash([4, 3]);
      ctx.lineWidth = 1.2;
      ctx.strokeRect(slotX, remainTop, slotW * 0.8, remainH);
      ctx.setLineDash([]);

      // 50% midline (anchored to original)
      const midY = slotY + slotH * 0.5;
      // Show only if midline is still inside remaining
      if (midY >= remainTop && midY <= slotY + slotH) {
        ctx.strokeStyle = 'rgba(255,255,255,0.45)';
        ctx.setLineDash([1, 3]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(slotX, midY);
        ctx.lineTo(slotX + slotW * 0.8, midY);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Right-edge fill % label
      const fpInt = Math.round(fp * 100);
      if (fpInt > 5) {
        ctx.font = 'bold 11px ui-sans-serif, system-ui';
        ctx.fillStyle = `rgba(38,166,154,${borderAlpha})`;
        ctx.textAlign = 'left';
        ctx.fillText(fpInt + '%', slotX + slotW * 0.8 + 4, midY + 4);
      } else {
        // 0% — show "FRESH"
        ctx.font = 'bold 9px ui-sans-serif, system-ui';
        ctx.fillStyle = TEAL;
        ctx.textAlign = 'left';
        ctx.fillText('FRESH', slotX + slotW * 0.8 + 4, midY + 4);
      }

      // Spotlight indicator
      if (isSpotlight) {
        ctx.strokeStyle = AMBER;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([2, 2]);
        ctx.strokeRect(slotX - 4, slotY - 4, slotW * 0.8 + 8, slotH + 8);
        ctx.setLineDash([]);
      }

      // Bottom label
      ctx.font = isSpotlight ? 'bold 10px ui-sans-serif, system-ui' : '10px ui-sans-serif, system-ui';
      ctx.fillStyle = isSpotlight ? AMBER : 'rgba(255,255,255,0.65)';
      ctx.textAlign = 'center';
      ctx.fillText(fpInt + '% FILLED', slotX + slotW * 0.4, slotY + slotH + 18);
    });

    // Top label
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = TEAL;
    ctx.fillText('FADE BY FILL PERCENTAGE', padX + chartW / 2, padY + 18);

    // Spotlight commentary
    ctx.font = '10px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    const commentaries = [
      'Fresh \u2014 vivid, no fade. Highest priority magnet.',
      '30% filled \u2014 starting to fade. Still actionable.',
      '60% filled \u2014 mid fade. Promise mostly kept.',
      '90% filled \u2014 nearly invisible. Almost expired.',
    ];
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.fillText(commentaries[phase], padX + chartW / 2, h - 14);

    // Phase progress dots
    const dotsY = h - 6;
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = i === phase ? AMBER : 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      ctx.arc(padX + 10 + i * 14, dotsY, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    void MAGENTA;
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 8 — ConsequentialStarAnim (S08)
// Two FVGs of identical size and direction, side by side. Left one is
// CONSEQUENTIAL (with-trend, ★) — slightly brighter rendering. Right
// one is non-consequential (against-trend) — slightly dimmer. The
// Ribbon stack indicator at top shows the current direction. Tooltips
// labeled accordingly. Demonstrates the visual edge case operators
// scan for.
// ============================================================
function ConsequentialStarAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const MAGENTA = '#EF5350';
    const AMBER = '#FFB300';

    ctx.fillStyle = '#0a0f1a';
    ctx.fillRect(0, 0, w, h);

    const padX = 24;
    const padY = 28;
    const chartW = w - padX * 2;
    const chartH = h - padY * 2 - 28;

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.strokeRect(padX, padY, chartW, chartH);

    // Scenario: bull stack on the Ribbon → bull FVGs are CONSEQUENTIAL
    // Show 2 bull FVGs of identical geometry — one ★ (with-trend, brighter), one not (against, dimmer)

    // Pulse for the spotlight rotation
    const cycle = 6.0;
    const phase = Math.floor((t % cycle) / 3.0); // 0 or 1

    // Left FVG (consequential ★)
    const leftX = padX + chartW * 0.10;
    const leftW = chartW * 0.32;
    const fvgY = padY + chartH * 0.30;
    const fvgH = chartH * 0.30;

    // -5 transparency boost = ~10% more vivid in pixel terms
    // Standard fvg_fill_transp ~ 70 → consequential = 65, non-consequential = 70
    const consequentialAlpha = 0.45;
    const nonConseqAlpha = 0.30;

    // Bull = teal
    ctx.fillStyle = `rgba(38,166,154,${consequentialAlpha})`;
    ctx.fillRect(leftX, fvgY, leftW, fvgH);
    ctx.strokeStyle = `rgba(38,166,154,${0.85})`;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.strokeRect(leftX, fvgY, leftW, fvgH);
    ctx.setLineDash([]);

    // Star marker for consequential
    ctx.font = 'bold 14px ui-sans-serif, system-ui';
    ctx.fillStyle = AMBER;
    ctx.textAlign = 'left';
    ctx.fillText('\u2605', leftX + 8, fvgY + 18);

    // Right FVG (non-consequential)
    const rightX = padX + chartW * 0.55;
    const rightW = chartW * 0.32;

    ctx.fillStyle = `rgba(38,166,154,${nonConseqAlpha})`;
    ctx.fillRect(rightX, fvgY, rightW, fvgH);
    ctx.strokeStyle = `rgba(38,166,154,${0.55})`;
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 3]);
    ctx.strokeRect(rightX, fvgY, rightW, fvgH);
    ctx.setLineDash([]);

    // Spotlight rotation
    const spotX = phase === 0 ? leftX : rightX;
    const spotW = phase === 0 ? leftW : rightW;
    ctx.strokeStyle = AMBER;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([2, 3]);
    ctx.strokeRect(spotX - 4, fvgY - 4, spotW + 8, fvgH + 8);
    ctx.setLineDash([]);

    // Labels below each FVG
    ctx.font = 'bold 10px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = phase === 0 ? AMBER : 'rgba(255,255,255,0.65)';
    ctx.fillText('CONSEQUENTIAL \u2605', leftX + leftW / 2, fvgY + fvgH + 16);
    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = phase === 0 ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.45)';
    ctx.fillText('with-trend (Ribbon BULL + bull FVG)', leftX + leftW / 2, fvgY + fvgH + 30);
    ctx.fillText('+5 transparency boost \u2192 visibly brighter', leftX + leftW / 2, fvgY + fvgH + 42);

    ctx.font = 'bold 10px ui-sans-serif, system-ui';
    ctx.fillStyle = phase === 1 ? AMBER : 'rgba(255,255,255,0.65)';
    ctx.fillText('NON-CONSEQUENTIAL', rightX + rightW / 2, fvgY + fvgH + 16);
    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = phase === 1 ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.45)';
    ctx.fillText('against-trend (Ribbon BEAR + bull FVG)', rightX + rightW / 2, fvgY + fvgH + 30);
    ctx.fillText('standard transparency \u2192 dimmer', rightX + rightW / 2, fvgY + fvgH + 42);

    // Top: Ribbon stack indicator
    const ribbonY = padY + 20;
    ctx.font = 'bold 9px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = TEAL;
    ctx.fillText('CIPHER RIBBON: \u25B2 BULL', padX + chartW / 2, ribbonY);

    // Bottom caption
    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.textAlign = 'center';
    ctx.fillText('Same gap geometry, different conviction. The chart subtly tells you which is which.', padX + chartW / 2, h - 6);

    void MAGENTA;
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 9 — FvgLifecycleAnim (S09)
// Three retirement paths shown side-by-side: Path A (full fill —
// price reaches original bottom), Path B (age expiry — 100 bars pass),
// Path C (pruned — 9th FVG forces oldest out of 8). Each path animates
// to its retirement state with a clear visual indication.
// ============================================================
function FvgLifecycleAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const MAGENTA = '#EF5350';
    const AMBER = '#FFB300';

    ctx.fillStyle = '#0a0f1a';
    ctx.fillRect(0, 0, w, h);

    const padX = 22;
    const padY = 26;
    const chartW = w - padX * 2;
    const chartH = h - padY * 2 - 26;

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.strokeRect(padX, padY, chartW, chartH);

    // Three vertical panels
    const panelW = chartW / 3 - 10;
    const panelHeight = chartH;
    const pathAX = padX + 8;
    const pathBX = padX + chartW / 3 + 4;
    const pathCX = padX + (chartW * 2) / 3 + 0;

    // Vertical dividers
    ctx.setLineDash([3, 4]);
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    [pathBX - 6, pathCX - 6].forEach((x) => {
      ctx.beginPath();
      ctx.moveTo(x, padY + 6);
      ctx.lineTo(x, padY + panelHeight - 6);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // Cycle 12s — 3 phases of 4s, each highlighting one path
    const cycle = 12.0;
    const phaseDur = 4.0;
    const cycT = t % cycle;
    const phase = Math.floor(cycT / phaseDur); // 0,1,2
    const phaseT = (cycT - phase * phaseDur) / phaseDur;

    // ── Path A: FULL FILL ──
    {
      const x = pathAX;
      ctx.font = 'bold 10px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillStyle = phase === 0 ? AMBER : 'rgba(255,255,255,0.45)';
      ctx.fillText('PATH A \u00B7 FULL FILL', x + panelW / 2, padY + 18);

      // The gap — fill % climbs from 0 to 100 during phase 0
      const fillP = phase === 0 ? phaseT : phase === 0 ? 1 : 1.0;
      const gapTop = padY + 40;
      const gapBot = padY + 90;
      const liveTop = gapTop + (gapBot - gapTop) * fillP;

      // Original outline
      ctx.strokeStyle = 'rgba(255,179,0,0.40)';
      ctx.setLineDash([2, 3]);
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 6, gapTop, panelW - 12, gapBot - gapTop);
      ctx.setLineDash([]);

      // Live shrinking
      if (phase !== 0 || fillP < 1.0) {
        const fadeBoost = fillP * 0.4;
        ctx.fillStyle = `rgba(38,166,154,${Math.max(0.10, 0.40 - fadeBoost)})`;
        ctx.fillRect(x + 6, liveTop, panelW - 12, gapBot - liveTop);
        ctx.strokeStyle = `rgba(38,166,154,${Math.max(0.20, 0.85 - fadeBoost * 0.6)})`;
        ctx.lineWidth = 1.2;
        ctx.strokeRect(x + 6, liveTop, panelW - 12, gapBot - liveTop);
      }

      // Status
      ctx.font = '9px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      const isRetired = phase === 0 && phaseT > 0.95;
      if (isRetired) {
        ctx.fillStyle = MAGENTA;
        ctx.font = 'bold 11px ui-sans-serif, system-ui';
        ctx.fillText('\u2192 DELETED', x + panelW / 2, padY + 130);
        ctx.font = '8px ui-sans-serif, system-ui';
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.fillText('Promise kept.', x + panelW / 2, padY + 144);
      } else {
        ctx.fillStyle = phase === 0 ? AMBER : 'rgba(255,255,255,0.4)';
        ctx.fillText('Filling: ' + Math.round(fillP * 100) + '%', x + panelW / 2, padY + 130);
      }

      // Trigger formula
      ctx.font = 'bold 8px ui-sans-serif, monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.textAlign = 'center';
      ctx.fillText('low <= fb', x + panelW / 2, padY + chartH - 20);
      ctx.font = '8px ui-sans-serif, system-ui';
      ctx.fillStyle = 'rgba(255,255,255,0.40)';
      ctx.fillText('Promise consumed', x + panelW / 2, padY + chartH - 6);
    }

    // ── Path B: AGE EXPIRY ──
    {
      const x = pathBX;
      ctx.font = 'bold 10px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillStyle = phase === 1 ? AMBER : 'rgba(255,255,255,0.45)';
      ctx.fillText('PATH B \u00B7 AGE EXPIRY', x + panelW / 2, padY + 18);

      // Static FVG that fades over time
      const ageMax = 100;
      const age = phase === 1 ? Math.floor(phaseT * (ageMax + 10)) : 0;
      const ageFrac = Math.min(1, age / ageMax);

      const gapTop = padY + 40;
      const gapBot = padY + 90;

      // Stable box, transparency rises with age
      const fadeAlpha = Math.max(0.05, 0.40 - ageFrac * 0.30);
      ctx.fillStyle = `rgba(38,166,154,${fadeAlpha})`;
      ctx.fillRect(x + 6, gapTop, panelW - 12, gapBot - gapTop);
      ctx.strokeStyle = `rgba(38,166,154,${Math.max(0.15, 0.85 - ageFrac * 0.65)})`;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(x + 6, gapTop, panelW - 12, gapBot - gapTop);
      ctx.setLineDash([]);

      // Age progress bar
      const barX = x + 12;
      const barY = padY + 105;
      const barW = panelW - 24;
      const barH = 8;
      ctx.strokeStyle = 'rgba(255,255,255,0.30)';
      ctx.strokeRect(barX, barY, barW, barH);
      const fillW = ageFrac * (barW - 2);
      ctx.fillStyle = ageFrac > 0.9 ? MAGENTA : ageFrac > 0.5 ? AMBER : TEAL;
      ctx.fillRect(barX + 1, barY + 1, fillW, barH - 2);

      // Status
      ctx.font = '9px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      const isRetired = phase === 1 && age >= ageMax;
      if (isRetired) {
        ctx.fillStyle = MAGENTA;
        ctx.font = 'bold 11px ui-sans-serif, system-ui';
        ctx.fillText('\u2192 EXPIRED', x + panelW / 2, padY + 130);
        ctx.font = '8px ui-sans-serif, system-ui';
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.fillText('No longer relevant.', x + panelW / 2, padY + 144);
      } else {
        ctx.fillStyle = phase === 1 ? AMBER : 'rgba(255,255,255,0.4)';
        ctx.fillText('Age: ' + Math.min(age, ageMax) + ' / 100 bars', x + panelW / 2, padY + 130);
      }

      // Trigger formula
      ctx.font = 'bold 8px ui-sans-serif, monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.textAlign = 'center';
      ctx.fillText('age > 100', x + panelW / 2, padY + chartH - 20);
      ctx.font = '8px ui-sans-serif, system-ui';
      ctx.fillStyle = 'rgba(255,255,255,0.40)';
      ctx.fillText('Forgotten', x + panelW / 2, padY + chartH - 6);
    }

    // ── Path C: PRUNED ──
    {
      const x = pathCX;
      ctx.font = 'bold 10px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillStyle = phase === 2 ? AMBER : 'rgba(255,255,255,0.45)';
      ctx.fillText('PATH C \u00B7 PRUNED', x + panelW / 2, padY + 18);

      // 8 stacked mini FVG boxes filling progressively
      const startY = padY + 38;
      const boxW = panelW - 16;
      const boxH = 8;
      const boxSpacing = 10;
      const visibleBoxes = phase === 2 ? Math.floor(8 + phaseT * 2) : 8;
      const totalBoxes = Math.min(visibleBoxes, 9);

      // Highlight oldest (box 0) when 9th appears
      for (let bi = 0; bi < totalBoxes; bi++) {
        const by = startY + bi * boxSpacing;
        const isOldest = bi === 0;
        const isNew = bi === 8;
        const beingPruned = phase === 2 && phaseT > 0.50 && phaseT < 0.85 && isOldest;
        const pruned = phase === 2 && phaseT >= 0.85 && isOldest;
        if (pruned) continue; // skip drawing

        let alpha = 0.35;
        if (beingPruned) alpha = 0.35 - (phaseT - 0.50) * 0.8; // fade out
        if (isNew) alpha = 0.6;

        ctx.fillStyle = `rgba(38,166,154,${Math.max(0.05, alpha)})`;
        ctx.fillRect(x + 8, by, boxW, boxH);
        ctx.strokeStyle = isNew ? AMBER : `rgba(38,166,154,${Math.max(0.20, alpha + 0.3)})`;
        ctx.lineWidth = isNew ? 1.5 : 1;
        ctx.strokeRect(x + 8, by, boxW, boxH);
      }

      // Indicator for pruning
      ctx.font = '9px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      if (phase === 2 && phaseT > 0.85) {
        ctx.fillStyle = MAGENTA;
        ctx.font = 'bold 11px ui-sans-serif, system-ui';
        ctx.fillText('\u2192 PRUNED', x + panelW / 2, padY + 130);
        ctx.font = '8px ui-sans-serif, system-ui';
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.fillText('Oldest dropped to make room.', x + panelW / 2, padY + 144);
      } else if (phase === 2 && phaseT > 0.50) {
        ctx.fillStyle = AMBER;
        ctx.fillText('9th FVG arriving... oldest fading', x + panelW / 2, padY + 130);
      } else {
        ctx.fillStyle = phase === 2 ? AMBER : 'rgba(255,255,255,0.4)';
        ctx.fillText('Active: 8 / fvg_max=8', x + panelW / 2, padY + 130);
      }

      // Trigger formula
      ctx.font = 'bold 8px ui-sans-serif, monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.textAlign = 'center';
      ctx.fillText('size > fvg_max', x + panelW / 2, padY + chartH - 20);
      ctx.font = '8px ui-sans-serif, system-ui';
      ctx.fillStyle = 'rgba(255,255,255,0.40)';
      ctx.fillText('Crowded out', x + panelW / 2, padY + chartH - 6);
    }

    // Bottom caption
    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.textAlign = 'center';
    ctx.fillText('Three paths. All silent, all automatic, all permanent.', padX + chartW / 2, h - 8);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 10 — StackedDetectionAnim (S10)
// Three FVGs of the same direction stacked within 2 ATR of each other.
// CIPHER fires fvg_stacked_bull. The ⚡ glyph appears in the row.
// Visual: vertical bar showing 2 ATR proximity zone; 3 bull FVGs all
// fall inside it; left panel shows the cluster, right panel shows the
// Command Center row updating to STACKED BULL ⚡.
// ============================================================
function StackedDetectionAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const MAGENTA = '#EF5350';
    const AMBER = '#FFB300';

    ctx.fillStyle = '#0a0f1a';
    ctx.fillRect(0, 0, w, h);

    const padX = 24;
    const padY = 28;
    const chartW = w * 0.62 - padX;
    const chartH = h - padY * 2 - 22;
    const ccX = padX + chartW + 14;
    const ccW = w - ccX - padX;

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.strokeRect(padX, padY, chartW, chartH);

    // Cycle 10s — 4 phases:
    // 0-3s: 1 bull FVG visible (no stacked)
    // 3-5s: 2nd bull FVG forms within 2 ATR (still not stacked, need 3+? actually CIPHER fires at 2+)
    // 5-8s: stacked alert fires
    // 8-10s: spotlight on the alert
    const cycle = 10.0;
    const cycT = t % cycle;
    const fvgsActive = cycT < 3 ? 1 : cycT < 5 ? 2 : 3;
    const stackedFires = fvgsActive >= 2;

    // FVG positions — three bull FVGs in close proximity
    const fvgs = [
      { y: padY + chartH * 0.35, h: 16 },
      { y: padY + chartH * 0.50, h: 14 },
      { y: padY + chartH * 0.62, h: 16 },
    ];
    // 2 ATR proximity zone overlay (in pixels approximately spans 4-5 of chartH)
    const atrSpan = chartH * 0.35;

    // Draw 2 ATR proximity zone (faint amber band)
    if (stackedFires) {
      const zoneTop = padY + chartH * 0.30;
      const zoneBot = zoneTop + atrSpan;
      const pulse = 0.5 + 0.5 * Math.sin(t * 4);
      ctx.fillStyle = `rgba(255,179,0,${0.06 + pulse * 0.04})`;
      ctx.fillRect(padX + 6, zoneTop, chartW - 12, zoneBot - zoneTop);
      ctx.strokeStyle = `rgba(255,179,0,${0.40 + pulse * 0.20})`;
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1.2;
      ctx.strokeRect(padX + 6, zoneTop, chartW - 12, zoneBot - zoneTop);
      ctx.setLineDash([]);
      ctx.font = 'bold 9px ui-sans-serif, system-ui';
      ctx.fillStyle = `rgba(255,179,0,${0.65 + pulse * 0.20})`;
      ctx.textAlign = 'right';
      ctx.fillText('2 ATR cluster zone', padX + chartW - 8, zoneTop - 4);
    }

    // Draw the FVGs visible so far
    for (let i = 0; i < fvgsActive; i++) {
      const f = fvgs[i];
      const isLatest = i === fvgsActive - 1;
      // Pulse the latest one as it births
      let alpha = 0.35;
      if (isLatest && cycT < 3) alpha = 0.30 + 0.15 * Math.sin(t * 6);
      ctx.fillStyle = `rgba(38,166,154,${alpha})`;
      ctx.fillRect(padX + 12, f.y, chartW - 24, f.h);
      ctx.strokeStyle = `rgba(38,166,154,0.85)`;
      ctx.setLineDash([4, 3]);
      ctx.lineWidth = 1.3;
      ctx.strokeRect(padX + 12, f.y, chartW - 24, f.h);
      ctx.setLineDash([]);

      // Right-edge label "fresh"
      ctx.font = 'bold 9px ui-sans-serif, system-ui';
      ctx.fillStyle = TEAL;
      ctx.textAlign = 'left';
      ctx.fillText('FRESH', padX + chartW - 50, f.y + f.h / 2 + 3);
    }

    // Top label — phase narrative
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    let phaseLabel = '';
    let phaseColor: string = TEAL;
    if (cycT < 3) {
      phaseLabel = 'ONE BULL FVG \u00B7 NORMAL READ';
      phaseColor = TEAL;
    } else if (cycT < 5) {
      phaseLabel = 'SECOND BULL FVG WITHIN 2 ATR \u2192 STACKED FIRES';
      phaseColor = AMBER;
    } else {
      phaseLabel = 'STACKED BULL \u26A1 \u00B7 INSTITUTIONAL CONFIRMATION';
      phaseColor = AMBER;
    }
    ctx.fillStyle = phaseColor;
    ctx.fillText(phaseLabel, padX + chartW / 2, padY + 16);

    // ── Command Center panel ──
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
    ctx.fillText('Imbalance', ccX + 8, padY + 38);

    // Cell 2 (distances) and Cell 3 (verdict)
    ctx.font = 'bold 9px ui-sans-serif, system-ui';
    if (cycT < 3) {
      ctx.fillStyle = TEAL;
      ctx.fillText('\u25B2 0.6 \u25BC \u2014', ccX + 60, padY + 38);
      ctx.fillStyle = TEAL;
      ctx.fillText('\u2192 NEAR BULL GAP', ccX + 8, padY + 56);
    } else if (cycT < 5) {
      ctx.fillStyle = TEAL;
      ctx.fillText('\u25B2 0.4 \u25BC \u2014', ccX + 60, padY + 38);
      ctx.fillStyle = AMBER;
      ctx.fillText('\u2192 NEAR BULL GAP', ccX + 8, padY + 56);
    } else {
      // Stacked alert
      ctx.fillStyle = AMBER;
      ctx.fillText('\u25B2 0.2 \u25BC \u2014', ccX + 60, padY + 38);
      const pulse = 0.5 + 0.5 * Math.sin(t * 5);
      ctx.fillStyle = `rgba(255,179,0,${0.7 + pulse * 0.30})`;
      ctx.font = 'bold 10px ui-sans-serif, system-ui';
      ctx.fillText('\u2192 STACKED BULL \u26A1', ccX + 8, padY + 56);
    }

    // Faded other rows
    ctx.fillStyle = 'rgba(255,255,255,0.20)';
    ctx.font = '9px ui-sans-serif, system-ui';
    ['Ribbon', 'Structure', 'Pulse', 'Regime'].forEach((r, i) => {
      ctx.fillText(r, ccX + 8, padY + 80 + i * 16);
    });

    // FVG count indicator
    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.textAlign = 'center';
    ctx.fillText(fvgsActive + ' bull FVG' + (fvgsActive === 1 ? '' : 's') + ' active', padX + chartW / 2, padY + chartH - 4);

    void MAGENTA;

    // Bottom caption
    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.textAlign = 'center';
    ctx.fillText('Multiple aggressive moves in the same direction over short range = institutional intent.', padX + chartW / 2, h - 8);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 11 — FvgTooltipAnim (S11)
// Hover glow pulses on an FVG's right-edge fill % label, then the
// 6-line tooltip card unfolds with the metadata. Card displays:
// role + ★ flag, original bounds, remaining bounds, fill %, age,
// distance ATR — exactly the 6 lines from the Pine tooltip code.
// ============================================================
function FvgTooltipAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const MAGENTA = '#EF5350';
    const AMBER = '#FFB300';

    ctx.fillStyle = '#0a0f1a';
    ctx.fillRect(0, 0, w, h);

    const padX = 24;
    const padY = 28;
    const chartW = w - padX * 2;
    const chartH = h - padY * 2 - 18;

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.strokeRect(padX, padY, chartW, chartH);

    // FVG box at fixed position
    const fvgX = padX + 12;
    const fvgY = padY + chartH * 0.55;
    const fvgW = chartW * 0.55;
    const fvgH = chartH * 0.18;

    // Render the live FVG (47% filled per the tooltip values)
    const liveTop = fvgY + fvgH * 0.47;
    const orig_bot = fvgY + fvgH;

    // Original outline (faint dashed amber)
    ctx.strokeStyle = 'rgba(255,179,0,0.30)';
    ctx.setLineDash([2, 3]);
    ctx.lineWidth = 1;
    ctx.strokeRect(fvgX, fvgY, fvgW, fvgH);
    ctx.setLineDash([]);

    // Live box
    ctx.fillStyle = 'rgba(38,166,154,0.30)';
    ctx.fillRect(fvgX, liveTop, fvgW, orig_bot - liveTop);
    ctx.strokeStyle = 'rgba(38,166,154,0.75)';
    ctx.setLineDash([4, 3]);
    ctx.lineWidth = 1.3;
    ctx.strokeRect(fvgX, liveTop, fvgW, orig_bot - liveTop);
    ctx.setLineDash([]);

    // Midline (anchored to original)
    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.setLineDash([1, 3]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(fvgX, fvgY + fvgH / 2);
    ctx.lineTo(fvgX + fvgW, fvgY + fvgH / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Right-edge fill % label
    const labelX = fvgX + fvgW + 4;
    const labelY = fvgY + fvgH / 2 + 4;
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.fillStyle = TEAL;
    ctx.textAlign = 'left';
    ctx.fillText('47%', labelX, labelY);

    // Cycle 8s — hover glow pulses then tooltip reveals
    const cycle = 8.0;
    const cycT = t % cycle;
    const tipReveal = cycT > 1.5;
    const tipFade = Math.min(1, (cycT - 1.5) / 0.6);

    // Hover glow over the label
    if (cycT > 0.5) {
      const glowPulse = 0.5 + 0.5 * Math.sin(t * 4);
      ctx.fillStyle = `rgba(255,179,0,${0.20 + glowPulse * 0.20})`;
      ctx.beginPath();
      ctx.arc(labelX + 12, labelY - 3, 16, 0, Math.PI * 2);
      ctx.fill();
    }

    // Tooltip card (top-right area)
    if (tipReveal) {
      const tipX = padX + chartW * 0.50;
      const tipY = padY + 24;
      const tipW = 260;
      const tipH = 156;

      ctx.globalAlpha = tipFade;
      ctx.fillStyle = 'rgba(0,0,0,0.85)';
      ctx.fillRect(tipX, tipY, tipW, tipH);
      ctx.strokeStyle = 'rgba(255,255,255,0.20)';
      ctx.strokeRect(tipX, tipY, tipW, tipH);

      // Header: BULL FVG ★ Consequential
      ctx.font = 'bold 11px ui-sans-serif, system-ui';
      ctx.textAlign = 'left';
      ctx.fillStyle = TEAL;
      ctx.fillText('BULL FVG  ', tipX + 10, tipY + 18);
      ctx.fillStyle = AMBER;
      ctx.fillText('\u2605', tipX + 70, tipY + 18);
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.font = '10px ui-sans-serif, system-ui';
      ctx.fillText('Consequential', tipX + 82, tipY + 18);

      // Divider
      ctx.strokeStyle = 'rgba(255,255,255,0.20)';
      ctx.beginPath();
      ctx.moveTo(tipX + 10, tipY + 28);
      ctx.lineTo(tipX + tipW - 10, tipY + 28);
      ctx.stroke();

      // Six metadata lines
      const lines = [
        { label: 'Original:', value: '4654.20 \u2013 4640.10' },
        { label: 'Remaining:', value: '4647.50 \u2013 4640.10' },
        { label: 'Fill:', value: '47%' },
        { label: 'Age:', value: '24 / 100 bars' },
        { label: 'Distance:', value: '0.3 ATR' },
      ];

      ctx.font = '10px ui-sans-serif, system-ui';
      lines.forEach((l, i) => {
        const ly = tipY + 44 + i * 18;
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.textAlign = 'left';
        ctx.fillText(l.label, tipX + 10, ly);
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.font = 'bold 10px ui-sans-serif, system-ui';
        ctx.textAlign = 'right';
        ctx.fillText(l.value, tipX + tipW - 10, ly);
        ctx.font = '10px ui-sans-serif, system-ui';
      });

      ctx.globalAlpha = 1;

      // Connecting line from label to tooltip
      ctx.strokeStyle = 'rgba(255,179,0,0.40)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(labelX + 16, labelY - 3);
      ctx.lineTo(tipX, tipY + tipH / 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Top label
    ctx.font = 'bold 10px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = AMBER;
    ctx.fillText('HOVER THE FILL % LABEL  \u2192  6-LINE TOOLTIP', padX + chartW / 2, padY + 16);

    // Bottom caption
    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.textAlign = 'center';
    ctx.fillText('Every active gap carries a complete metadata block, one mouse-over away.', padX + chartW / 2, h - 4);

    void MAGENTA;
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 12 — ImbalanceRowCascadeAnim (S12)
// The 11-verdict priority cascade. Cycles through 4 demo states
// drawn directly from the user's screenshot ground truths:
//   - Image 1 state: GAPS DISTANT (51% filled bear)
//   - Image 2 state: STACKED BEAR ⚡
//   - Image 3 state: NEAR BEAR GAP (70% filled)
//   - Image 4 state: STACKED BULL
// Inputs panel on left shows live distances + booleans; cascade
// evaluates top-down; output box on right shows the broadcast verdict.
// ============================================================
function ImbalanceRowCascadeAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const MAGENTA = '#EF5350';
    const AMBER = '#FFB300';

    ctx.fillStyle = '#0a0f1a';
    ctx.fillRect(0, 0, w, h);

    const padX = 22;
    const padY = 16;
    const chartW = w - padX * 2;
    const chartH = h - padY - 16;

    // 4 demo states cycle every 3.5s
    const phaseDur = 3.5;
    const phase = Math.floor((t % (phaseDur * 4)) / phaseDur);

    type Demo = {
      bullDist: number; bearDist: number;
      atBull: boolean; atBear: boolean;
      nearBull: boolean; nearBear: boolean;
      stackedBull: boolean; stackedBear: boolean;
      hasFvg: boolean;
      verdict: string;
    };
    const demos: Demo[] = [
      // Image 1 state: 8.2 ATR distant bear, 51% filled
      { bullDist: -1, bearDist: 8.2, atBull: false, atBear: false, nearBull: false, nearBear: false, stackedBull: false, stackedBear: false, hasFvg: true, verdict: 'GAPS DISTANT' },
      // Image 2 state: stacked bear ⚡ at gap
      { bullDist: -1, bearDist: 0.4, atBull: false, atBear: true, nearBull: false, nearBear: true, stackedBull: false, stackedBear: true, hasFvg: true, verdict: 'STACKED BEAR ⚡' },
      // Image 3 state: near bear gap, 70% filled
      { bullDist: 3.8, bearDist: 1.3, atBull: false, atBear: false, nearBull: false, nearBear: true, stackedBull: false, stackedBear: false, hasFvg: true, verdict: 'NEAR BEAR GAP' },
      // Image 4 state: stacked bull (without AT)
      { bullDist: 2.2, bearDist: -1, atBull: false, atBear: false, nearBull: false, nearBear: false, stackedBull: true, stackedBear: false, hasFvg: true, verdict: 'STACKED BULL' },
    ];
    const demo = demos[phase];

    // Layout
    const inputX = padX + 8;
    const labelX = padX + 124;
    const outputX = padX + chartW - 130;

    // Headers
    ctx.font = 'bold 8px ui-sans-serif, system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fillText('INPUTS', inputX, padY + 4);
    ctx.fillText('CASCADE (top-down)', labelX, padY + 4);
    ctx.fillText('BROADCAST', outputX, padY + 4);

    // Display input values (bull/bear distances)
    ctx.font = 'bold 9px ui-sans-serif, monospace';
    ctx.fillStyle = TEAL;
    ctx.textAlign = 'left';
    ctx.fillText('\u25B2 ' + (demo.bullDist < 0 ? '\u2014' : demo.bullDist.toFixed(1)) + ' ATR', inputX, padY + 18);
    ctx.fillStyle = MAGENTA;
    ctx.fillText('\u25BC ' + (demo.bearDist < 0 ? '\u2014' : demo.bearDist.toFixed(1)) + ' ATR', inputX, padY + 32);

    // Cascade levels (full 11)
    const levels = [
      { id: '1', label: 'NO ACTIVE GAPS', match: !demo.hasFvg, color: 'rgba(255,255,255,0.5)' },
      { id: '2', label: 'STACKED BULL \u26A1', match: demo.stackedBull && demo.atBull, color: AMBER },
      { id: '3', label: 'STACKED BEAR \u26A1', match: demo.stackedBear && demo.atBear, color: AMBER },
      { id: '4', label: 'GAP CLUSTER', match: demo.atBull && demo.atBear, color: AMBER },
      { id: '5', label: 'AT BULL GAP', match: demo.atBull, color: TEAL },
      { id: '6', label: 'AT BEAR GAP', match: demo.atBear, color: MAGENTA },
      { id: '7', label: 'STACKED BULL', match: demo.stackedBull, color: TEAL },
      { id: '8', label: 'STACKED BEAR', match: demo.stackedBear, color: MAGENTA },
      { id: '9', label: 'NEAR BULL GAP', match: demo.nearBull, color: TEAL },
      { id: '10', label: 'NEAR BEAR GAP', match: demo.nearBear, color: MAGENTA },
      { id: '11', label: 'GAPS DISTANT', match: demo.hasFvg, color: 'rgba(255,255,255,0.6)' },
    ];

    // Find winner
    let winnerIdx = -1;
    for (let i = 0; i < levels.length; i++) {
      if (levels[i].match) {
        winnerIdx = i;
        break;
      }
    }

    const cascadeStartY = padY + 14;
    const rowH = (chartH - 28) / levels.length;

    levels.forEach((lvl, i) => {
      const y = cascadeStartY + i * rowH;
      const isWinner = i === winnerIdx;
      const isSuppressed = winnerIdx !== -1 && i > winnerIdx;
      const matches = lvl.match;

      // Row text
      ctx.font = isWinner ? 'bold 9px ui-sans-serif, system-ui' : '9px ui-sans-serif, system-ui';
      ctx.textAlign = 'left';
      ctx.globalAlpha = isSuppressed ? 0.20 : isWinner ? 1.0 : 0.55;
      const textColor = isWinner ? lvl.color : isSuppressed ? '#666' : '#aaa';
      ctx.fillStyle = textColor;
      ctx.fillText((i + 1) + '. ' + lvl.label, labelX, y + rowH / 2 + 3);
      ctx.globalAlpha = 1;

      // Input dot
      ctx.beginPath();
      ctx.arc(inputX + 6, y + rowH / 2, 3, 0, Math.PI * 2);
      ctx.fillStyle = matches ? lvl.color : 'rgba(255,255,255,0.12)';
      ctx.fill();

      // Strikethrough on suppressed-but-matched
      if (isSuppressed && matches) {
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        const tw = ctx.measureText((i + 1) + '. ' + lvl.label).width;
        ctx.moveTo(labelX - 2, y + rowH / 2 + 1);
        ctx.lineTo(labelX + tw + 2, y + rowH / 2 + 1);
        ctx.stroke();
      }
    });

    // Output box
    if (winnerIdx >= 0) {
      const winner = levels[winnerIdx];
      const boxY = padY + chartH / 2 - 18;
      const boxW = 116;
      const boxH = 36;

      const winnerY = cascadeStartY + winnerIdx * rowH + rowH / 2;
      ctx.strokeStyle = winner.color;
      ctx.lineWidth = 1.4;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(labelX + 130, winnerY);
      ctx.lineTo(outputX - 4, boxY + boxH / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Determine RGB string for the output box fill
      let colorRgb = '255,255,255';
      if (winner.color === TEAL) colorRgb = '38,166,154';
      else if (winner.color === MAGENTA) colorRgb = '239,83,80';
      else if (winner.color === AMBER) colorRgb = '255,179,0';

      ctx.fillStyle = `rgba(${colorRgb},0.18)`;
      ctx.fillRect(outputX, boxY, boxW, boxH);
      ctx.strokeStyle = winner.color;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(outputX, boxY, boxW, boxH);

      ctx.font = 'bold 9px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillStyle = winner.color;
      ctx.fillText('\u2192 ' + winner.label, outputX + boxW / 2, boxY + boxH / 2 + 4);

      ctx.font = '8px ui-sans-serif, system-ui';
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.fillText('Imbalance row says:', outputX + boxW / 2, boxY - 4);
    }

    // Phase progress dots
    const dotsY = h - 6;
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = i === phase ? AMBER : 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      ctx.arc(padX + 10 + i * 14, dotsY, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 13 — TradingFvgAnim (S14)
// 4-stage trade lifecycle on a chart with an active bullish FVG.
// Stage 1: approach (price descends toward the gap, Spine confirms).
// Stage 2: entry at the live remaining edge, stop just BELOW original.
// Stage 3: runner — fill % climbs to 60%, partial scale-out triggered.
// Stage 4: exit at next bear FVG above price (mean reversion + magnet
// to magnet).
// ============================================================
function TradingFvgAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const MAGENTA = '#EF5350';
    const AMBER = '#FFB300';

    ctx.fillStyle = '#0a0f1a';
    ctx.fillRect(0, 0, w, h);

    const padX = 24;
    const padY = 28;
    const chartW = w - padX * 2;
    const chartH = h - padY * 2 - 18;

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.strokeRect(padX, padY, chartW, chartH);

    const cycle = 12.0;
    const cycT = t % cycle;
    const N = 60;

    // Stage timing
    const showApproach = cycT > 0.5;
    const showEntry = cycT > 3.0;
    const showRunner = cycT > 6.5;
    const showExit = cycT > 9.5;

    // Bull FVG location (target zone) — fixed
    const bullFvgTop = padY + chartH * 0.55;
    const bullFvgBot = padY + chartH * 0.72;
    // Bear FVG above (for exit target) — fixed
    const bearFvgTop = padY + chartH * 0.20;
    const bearFvgBot = padY + chartH * 0.30;

    // Generate price action: descend into bull FVG, bounce, run toward bear FVG, hit it
    const prices: number[] = [];
    for (let i = 0; i < N; i++) {
      const x = i / (N - 1);
      let p = padY + chartH * 0.40;
      if (x < 0.20) {
        // Approach
        p = padY + chartH * 0.35 + x * chartH * 0.30 * 5;
      } else if (x < 0.35) {
        // Touch bull FVG (entry zone)
        p = bullFvgTop + 4 + (x - 0.20) * 2;
      } else if (x < 0.85) {
        // Run upward
        const runT = (x - 0.35) / 0.50;
        p = bullFvgTop - runT * (bullFvgTop - bearFvgBot - 4);
      } else {
        // Exit at bear FVG
        p = bearFvgBot + (x - 0.85) * 2;
      }
      prices.push(p);
    }

    // Spine — smoothed, hugs price (healthy)
    const spinePts: number[] = [];
    for (let i = 0; i < N; i++) {
      const lookback = Math.max(0, i - 6);
      let sum = 0;
      for (let j = lookback; j <= i; j++) sum += prices[j];
      spinePts.push(sum / (i - lookback + 1));
    }

    const px = (i: number) => padX + 6 + (i / (N - 1)) * (chartW - 12);

    // Compute current revealIdx
    let revealIdx = 0;
    if (cycT < 3) revealIdx = Math.floor(cycT / 3 * N * 0.32);
    else if (cycT < 6.5) revealIdx = Math.floor(N * 0.32 + (cycT - 3) / 3.5 * N * 0.30);
    else if (cycT < 9.5) revealIdx = Math.floor(N * 0.62 + (cycT - 6.5) / 3 * N * 0.25);
    else revealIdx = Math.min(N - 1, Math.floor(N * 0.87 + (cycT - 9.5) / 2.5 * N * 0.13));

    // Compute live bull FVG mitigation based on revealIdx
    let bullLiveTop = bullFvgTop;
    for (let i = 0; i < revealIdx && i < N; i++) {
      if (prices[i] > bullFvgTop && prices[i] < bullFvgBot) {
        bullLiveTop = Math.max(bullLiveTop, prices[i]);
      }
    }
    const bullFillPct = (bullLiveTop - bullFvgTop) / (bullFvgBot - bullFvgTop);

    // ── Plot the bull FVG ──
    ctx.strokeStyle = 'rgba(255,179,0,0.35)';
    ctx.setLineDash([2, 3]);
    ctx.lineWidth = 1;
    ctx.strokeRect(padX + 6, bullFvgTop, chartW - 12, bullFvgBot - bullFvgTop);
    ctx.setLineDash([]);

    const bullFade = bullFillPct * 0.4;
    ctx.fillStyle = `rgba(38,166,154,${Math.max(0.10, 0.35 - bullFade)})`;
    ctx.fillRect(padX + 6, bullLiveTop, chartW - 12, bullFvgBot - bullLiveTop);
    ctx.strokeStyle = `rgba(38,166,154,${Math.max(0.30, 0.85 - bullFade)})`;
    ctx.setLineDash([4, 3]);
    ctx.lineWidth = 1.3;
    ctx.strokeRect(padX + 6, bullLiveTop, chartW - 12, bullFvgBot - bullLiveTop);
    ctx.setLineDash([]);

    if (bullFillPct > 0.05) {
      ctx.font = 'bold 9px ui-sans-serif, system-ui';
      ctx.fillStyle = `rgba(38,166,154,0.85)`;
      ctx.textAlign = 'left';
      ctx.fillText(Math.round(bullFillPct * 100) + '%', padX + chartW - 32, bullLiveTop + (bullFvgBot - bullLiveTop) / 2 + 3);
    }

    ctx.font = 'bold 9px ui-sans-serif, system-ui';
    ctx.fillStyle = TEAL;
    ctx.textAlign = 'left';
    ctx.fillText('BULL FVG', padX + 8, bullFvgTop - 4);

    // ── Plot the bear FVG (target) ──
    ctx.strokeStyle = 'rgba(255,179,0,0.35)';
    ctx.setLineDash([2, 3]);
    ctx.lineWidth = 1;
    ctx.strokeRect(padX + 6, bearFvgTop, chartW - 12, bearFvgBot - bearFvgTop);
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(239,83,80,0.30)';
    ctx.fillRect(padX + 6, bearFvgTop, chartW - 12, bearFvgBot - bearFvgTop);
    ctx.strokeStyle = 'rgba(239,83,80,0.85)';
    ctx.setLineDash([4, 3]);
    ctx.lineWidth = 1.3;
    ctx.strokeRect(padX + 6, bearFvgTop, chartW - 12, bearFvgBot - bearFvgTop);
    ctx.setLineDash([]);

    ctx.font = 'bold 9px ui-sans-serif, system-ui';
    ctx.fillStyle = MAGENTA;
    ctx.textAlign = 'left';
    ctx.fillText('BEAR FVG (target)', padX + 8, bearFvgTop - 4);

    // ── Plot price candles up to revealIdx ──
    for (let i = 0; i < revealIdx && i < N; i++) {
      const isUp = i % 4 === 0;
      ctx.fillStyle = isUp ? 'rgba(38,166,154,0.65)' : 'rgba(239,83,80,0.55)';
      ctx.fillRect(px(i) - 1.4, prices[i] - 4, 2.8, 8);
    }

    // ── Plot Spine (only after approach) ──
    if (showApproach && revealIdx > 1) {
      ctx.strokeStyle = TEAL;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px(0), spinePts[0]);
      for (let i = 1; i <= revealIdx && i < N; i++) ctx.lineTo(px(i), spinePts[i]);
      ctx.stroke();
    }

    // ── Trade markers ──
    if (showEntry) {
      const entryIdx = Math.floor(N * 0.34);
      const ex = px(entryIdx);
      const ey = prices[entryIdx] + 14;
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

      // Stop just below original bottom of bull FVG
      const stopY = bullFvgBot + 10;
      ctx.strokeStyle = 'rgba(239,83,80,0.55)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(px(0) + 4, stopY);
      ctx.lineTo(px(N - 1) - 4, stopY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = '9px ui-sans-serif, system-ui';
      ctx.textAlign = 'left';
      ctx.fillStyle = MAGENTA;
      ctx.fillText('STOP \u00B7 below ORIGINAL bottom (not live)', px(0) + 6, stopY + 12);
    }

    if (showRunner) {
      const runIdx = Math.floor(N * 0.62);
      const sx = px(runIdx);
      const sy = prices[runIdx] - 12;
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
      ctx.fillText('Bull gap 60% filled', sx, sy + 14);
    }

    if (showExit) {
      const exitIdx = Math.floor(N * 0.92);
      const xx = px(exitIdx);
      const xy = prices[exitIdx] - 12;
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
      ctx.font = '8px ui-sans-serif, system-ui';
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillText('Hit bear FVG target', xx, xy + 14);
    }

    // Top label
    ctx.font = 'bold 10px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = TEAL;
    ctx.fillText('FVG TRADE LIFECYCLE \u00B7 GAP-TO-GAP', padX + chartW / 2, padY + 16);

    // Stage indicator
    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    let stage = 'WAITING';
    if (showExit) stage = 'STAGE 4 \u00B7 EXIT (target hit)';
    else if (showRunner) stage = 'STAGE 3 \u00B7 RUNNER + SCALE OUT';
    else if (showEntry) stage = 'STAGE 2 \u00B7 ENTRY (at gap edge)';
    else if (showApproach) stage = 'STAGE 1 \u00B7 APPROACH';
    ctx.fillText(stage, padX + chartW / 2, padY + chartH - 4);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function CipherImbalanceLesson() {
  const [scrollY, setScrollY] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameRound, setGameRound] = useState(0);
  const [gameSelections, setGameSelections] = useState<(string | null)[]>(new Array(gameRounds.length).fill(null));
  const [quizAnswers, setQuizAnswers] = useState<(string | null)[]>(new Array(quizQuestions.length).fill(null));
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [certRevealed, setCertRevealed] = useState(false);
  const [certId] = useState(() => `PRO-CERT-L11.18-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);

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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 11 &middot; Lesson 18</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Cipher Imbalance<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Where Price Promised to Return</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">Price doesn&apos;t move smoothly. It moves in bursts that leave behind unfinished business &mdash; three-candle gaps where institutional aggression skipped past fair value. The chart owes you a return.</motion.p>
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
            <p className="text-xl font-extrabold mb-3">Price doesn&apos;t move smoothly. It moves in bursts. Those bursts leave gaps. Those gaps are the chart&apos;s outstanding promises.</p>
            <p className="text-gray-400 leading-relaxed mb-4">Watch any chart for an hour. Most candles are normal: they overlap with the previous candle, they breathe in their range, they make small moves in either direction. <strong className="text-amber-400">Then occasionally a candle does something different.</strong> It opens far above the previous bar&apos;s close, pushes higher with conviction, and closes leaving a vertical gap of price that was never traded. The next candle opens above the previous bar&apos;s entire range. Price has skipped over fair value entirely.</p>
            <p className="text-gray-400 leading-relaxed mb-4">That gap is a <strong className="text-white">Fair Value Gap</strong> &mdash; an FVG. It marks a moment where institutional aggression was so strong that price tore through what should have been an equilibrium zone. The orders that should have filled there didn&apos;t get filled. <strong className="text-white">Markets remember.</strong> Price comes back to fill these gaps with high probability before continuing &mdash; not always, not on every gap, not on every timeframe, but with enough frequency that operators who ignore them are giving away edge.</p>
            <p className="text-gray-400 leading-relaxed">CIPHER tracks every FVG on your chart from birth, watches them shrink as price returns to fill them, and tells you on every bar where the chart&apos;s outstanding promises sit. The gaps aren&apos;t decorations. They&apos;re magnets. This is the lesson where you stop watching gaps form and start operating around them.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#11088; THE IMBALANCE OPERATOR PROMISE</p>
            <p className="text-sm text-gray-400 leading-relaxed">By the end of this lesson you will know the <strong className="text-white">3-candle geometry</strong> that defines an FVG, the <strong className="text-white">three birth gates</strong> CIPHER demands before registering one, the <strong className="text-white">11 parallel arrays</strong> that track each gap&apos;s state, the <strong className="text-white">smart mitigation logic</strong> that shrinks boxes as price fills them, the <strong className="text-white">consequential star</strong> that flags with-trend gaps as higher-edge magnets, the <strong className="text-white">stacked detection</strong> that fires the &#9889; alert, and how to <strong className="text-white">trade the pair</strong> &mdash; entries at gap edges, stops beyond original bounds, scale-outs as fill % climbs. You stop seeing horizontal boxes. You start operating in a chart with active and shrinking magnets.</p>
          </div>
        </motion.div>
      </section>

      {/* === S01 — Where Price Promised to Return (Groundbreaking Concept) === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; &#11088; Where Price Promised to Return</p>
          <h2 className="text-2xl font-extrabold mb-4">The Groundbreaking Concept</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Most FVG indicators do one thing: when a 3-candle gap forms, draw a box. That&apos;s it. A box that sits there forever. Or maybe deletes when price touches it. <strong className="text-amber-400">CIPHER does something fundamentally different. The boxes are alive.</strong> They shrink as price fills them, fade as their relevance decays, expose only the unfilled portion that&apos;s still a magnet. The chart shows you not what an FVG used to be, but what&apos;s left of it right now.</p>
          <SmartMitigationAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the four phases. <strong className="text-white">Phase 1</strong>: a 3-candle pattern forms with high volume on the middle bar &mdash; CIPHER births the FVG box (vivid teal, 0% filled). <strong className="text-white">Phase 2</strong>: price runs up away from the gap, the box stays unchanged on chart, fully intact. <strong className="text-white">Phase 3</strong>: price returns, dipping into the gap from above. The box&apos;s top edge drops to follow price down, leaving only the unfilled portion below. The fill % climbs from 0% to 51% to 87%. The box fades as fill % increases. <strong className="text-white">Phase 4</strong>: price reaches the original bottom &mdash; full fill. Box deleted. Promise kept.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">SMART MITIGATION &middot; THE BOX SHRINKS</p>
              <p className="text-sm text-gray-400 leading-relaxed">When price returns and partially fills a bullish FVG from above, CIPHER pulls the box&apos;s <strong className="text-white">top edge down</strong> to the lowest price reached. The unfilled portion below stays visible. The visual shows you exactly the magnet that&apos;s still active, not the historical full size. <strong className="text-white">No other indicator does this.</strong> Most just leave stale boxes on chart long after price has consumed half the gap.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FADE BY FILL PERCENTAGE</p>
              <p className="text-sm text-gray-400 leading-relaxed">As the fill % climbs (0% \u2192 25% \u2192 60% \u2192 85%), the box becomes progressively more transparent. A 0%-filled gap is vivid; a 90%-filled gap is barely visible. <strong className="text-white">The visual itself communicates urgency</strong>. Operators reading the chart absorb the priority hierarchy in milliseconds: bright = fresh, faded = nearly consumed.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FULL FILL &middot; DELETED</p>
              <p className="text-sm text-gray-400 leading-relaxed">When price reaches the original bottom of a bullish gap (or top of a bearish gap), the FVG is fully filled. CIPHER deletes it &mdash; box, midline, and label all vanish at the same bar. <strong className="text-white">There is no &ldquo;historically filled&rdquo; state on chart</strong>. CIPHER&apos;s philosophy: if a gap isn&apos;t actionable, don&apos;t draw it. Yesterday&apos;s consumed gaps don&apos;t clutter today&apos;s chart.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE LIVE FILL % LABEL</p>
              <p className="text-sm text-gray-400 leading-relaxed">At the right edge of every active gap, a small numeric label displays the live fill percentage &mdash; <strong className="text-white">25%</strong>, <strong className="text-white">51%</strong>, <strong className="text-white">87%</strong>. You can scan a chart and read each gap&apos;s exact fill state without hovering for a tooltip. The label disappears when the gap is fresh (under 5% filled) or when it deletes from full fill.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">WHY THIS REPLACES STATIC BOXES</p>
              <p className="text-sm text-gray-400 leading-relaxed">Static FVG boxes lie. A box that was 100 pips wide at birth and is now 45% filled is still drawn 100 pips wide on most indicators &mdash; but only the bottom 55 pips are still a magnet. Operators trading the &ldquo;edge of the gap&rdquo; are aiming at imaginary geometry. <strong className="text-white">CIPHER&apos;s shrinking box puts your aim where the magnet actually is</strong>: at the live, unfilled portion.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE 50% MIDLINE STAYS HONEST</p>
              <p className="text-sm text-gray-400 leading-relaxed">The dotted equilibrium line at the original gap&apos;s 50% point <strong className="text-white">stays anchored to the original gap</strong>, not the shrinking remainder. Why: the 50% point is the institutional fair-value reference for that aggressive move &mdash; it doesn&apos;t drift just because some of the gap has filled. The midline is a fixed psychological reference; the box is the live frontier.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE COMMAND CENTER ROW</p>
              <p className="text-sm text-gray-400 leading-relaxed">Beyond the on-chart visuals, CIPHER fuses every active FVG into a single Command Center row. Cell 2 displays nearest bull and bear gap distances in ATR units. Cell 3 broadcasts a verdict from an 11-level priority cascade &mdash; NO ACTIVE GAPS, GAPS DISTANT, NEAR BULL GAP, NEAR BEAR GAP, AT BULL GAP, AT BEAR GAP, GAP CLUSTER, STACKED BULL, STACKED BEAR, and the urgent <strong className="text-white">STACKED &#9889; tier</strong> when stacking aligns with proximity. Two glances, complete imbalance awareness.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Glance at the chart. <strong className="text-white">Read the unfilled portions</strong> of any visible boxes &mdash; that&apos;s where the magnets sit. Glance at the fill % labels &mdash; lower percentages mean fresher gaps. Glance at the Command Center Imbalance row &mdash; the cascade tells you exactly which verdict applies. Three glances, complete context. The promises that price still owes you are visible at every moment.</p>
          </div>
        </motion.div>
      </section>

      {/* === S02 — Anatomy of an FVG === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; Anatomy of an FVG</p>
          <h2 className="text-2xl font-extrabold mb-4">Three candles, two bars apart, one gap of unfilled price</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Before we read the smart mitigation, we have to know what an FVG actually <em>is</em> at the geometric level. <strong className="text-amber-400">An FVG is created by exactly three candles</strong> &mdash; the candle two bars ago, the candle one bar ago (the &ldquo;middle&rdquo; aggression bar), and the current candle. The math is two of the simplest expressions in technical analysis: a single inequality between high and low across two bars apart.</p>
          <FvgAnatomyAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the animation alternate between bull and bear FVGs. <strong className="text-white">Bullish FVG</strong>: the current candle&apos;s low is above the candle-from-two-bars-ago&apos;s high. The gap zone is the price range between those two edges &mdash; price has skipped from <em>high[2]</em> all the way up to <em>low</em> without being traded. <strong className="text-white">Bearish FVG</strong>: the current candle&apos;s high is below the candle-from-two-bars-ago&apos;s low. The gap zone sits between <em>high</em> and <em>low[2]</em>. The middle candle &mdash; candle[1] &mdash; is the bar that did the work of skipping past fair value. Its volume matters; we&apos;ll cover that in the next section.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE BULLISH FVG FORMULA</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">bullish_fvg = low &gt; high[2]</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">When this evaluates true, a bullish FVG is geometrically present. The gap&apos;s top edge is the current bar&apos;s <strong className="text-white">low</strong>. The gap&apos;s bottom edge is two-bars-ago&apos;s <strong className="text-white">high</strong>. The middle candle&apos;s entire range sits between those two edges &mdash; the middle is the bar that did the gapping. Pine&apos;s <code className="text-white">[2]</code> notation references the value two bars ago.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE BEARISH FVG FORMULA</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">bearish_fvg = high &lt; low[2]</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">The mirror image. Current bar&apos;s <strong className="text-white">high</strong> sits below two-bars-ago&apos;s <strong className="text-white">low</strong>. Gap&apos;s top edge is two-bars-ago&apos;s low; gap&apos;s bottom edge is the current high. The middle candle gapped <em>down</em> through fair value rather than up.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE MIDDLE CANDLE IS THE AGGRESSOR</p>
              <p className="text-sm text-gray-400 leading-relaxed">Of the three candles, the middle one (candle[1]) is doing the work. It&apos;s the bar where price tore through the equilibrium zone &mdash; opening near the bottom edge and closing near the top (or vice versa for bearish). <strong className="text-white">The gap is the middle candle&apos;s body extended out to the surrounding candles&apos; edges.</strong> Without that middle candle&apos;s aggressive range, no gap forms.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHY [2] AND NOT [1]</p>
              <p className="text-sm text-gray-400 leading-relaxed">Geometric FVGs are defined across <em>two bars apart</em>, not adjacent. The reason: a gap between adjacent bars (current vs previous) just means the candles overlapped poorly. A gap that spans a full intermediate bar means price moved <strong className="text-white">aggressively enough that an entire candle&apos;s worth of action was skipped over</strong>. That magnitude is what makes FVGs structurally meaningful.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">WICKS DON&apos;T COUNT AGAINST THE GEOMETRY</p>
              <p className="text-sm text-gray-400 leading-relaxed">FVG geometry uses bar high and low &mdash; the full wick. A bull FVG fires only if the current bar&apos;s lowest wick is above two-bars-ago&apos;s highest wick. Wicks that overlap kill the geometry, even if the candle bodies are far apart. <strong className="text-white">Pure body-only gap definitions exist in some indicators, but CIPHER uses the conservative wick-inclusive geometry</strong> &mdash; only true gaps with no traded price in the zone qualify.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE GAP ZONE IS A PRICE RANGE, NOT A PRICE</p>
              <p className="text-sm text-gray-400 leading-relaxed">An FVG is defined by <strong className="text-white">two prices</strong>: the gap&apos;s top edge and bottom edge. Between them sits the unfilled range. The midline (50% point) is a derived reference, not part of the geometric definition. CIPHER plots all three: top edge, bottom edge, and midline, then tracks them through the lifecycle.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FVGS FORM ON CLOSED BARS, NOT INTRA-BAR</p>
              <p className="text-sm text-gray-400 leading-relaxed">CIPHER doesn&apos;t fire FVG detection mid-bar. Detection runs on bar close. A wick that briefly satisfies the gap geometry mid-bar but closes back inside the previous bar&apos;s range <strong className="text-white">does not produce an FVG</strong>. Closed-bar discipline filters out flicker. New FVGs always appear at bar close, never on live ticks.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">When you see a fresh box appear on chart, it&apos;s because the just-closed bar&apos;s range satisfies one of two simple inequalities relative to the bar two bars ago. Three candles, two bars apart, one gap. <strong className="text-white">The geometry is honest. CIPHER doesn&apos;t paint imaginary FVGs.</strong> But geometry alone isn&apos;t enough &mdash; the next section covers the three additional gates that filter the geometry into something tradeable.</p>
          </div>
        </motion.div>
      </section>

      {/* === S03 — The Three Birth Gates === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The Three Birth Gates</p>
          <h2 className="text-2xl font-extrabold mb-4">Geometric gap is necessary. Three gates make it sufficient.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">A geometric gap by itself is not enough to register an FVG. <strong className="text-amber-400">CIPHER demands three gates pass simultaneously before a new FVG is born</strong>: (1) the geometric gap exists, (2) the gap is at least 0.3 ATR in size, and (3) the middle candle (the aggressor) had volume at least 1.2x its recent average. All three must pass on the same bar. One gate fails &mdash; no FVG, no box, no entry in the arrays. The gates are how CIPHER filters retail noise from institutional intent.</p>
          <BirthGatesAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the gates light up sequentially. <strong className="text-white">Gate 1</strong>: the geometric gap is highlighted in amber &mdash; CIPHER confirms <code className="text-white">low &gt; high[2]</code>. <strong className="text-white">Gate 2</strong>: a vertical scale appears showing the gap height versus the 0.3 ATR threshold &mdash; passes only if the gap is at least 30% of one ATR. <strong className="text-white">Gate 3</strong>: volume bars appear below the candles, with the middle bar towering above the others (1.2x average or higher). When all three gates pass, the box flips from amber to teal and the &ldquo;FVG BORN&rdquo; checkmark appears. Birth confirmed.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">GATE 1 &middot; GEOMETRIC GAP EXISTS</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">bullish_fvg = low &gt; high[2]<br />bearish_fvg = high &lt; low[2]</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">The 3-candle inequality from Section 2. Pure geometry, no other inputs. <strong className="text-white">Necessary but never sufficient</strong> &mdash; geometric gaps form constantly on noisy charts; most don&apos;t represent meaningful institutional aggression.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">GATE 2 &middot; SIZE \u2265 0.3 ATR</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">gap_size = abs(top_edge \u2212 bottom_edge)<br />size_pass = gap_size &gt; atr * 0.3</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">A tiny gap of 0.05 ATR isn&apos;t institutionally meaningful &mdash; it&apos;s just two candles that didn&apos;t quite overlap. CIPHER demands at least 0.3 ATR before treating it as a real magnet. <strong className="text-white">The 0.3 threshold is calibrated against minute-by-minute geometric noise</strong>. ATR-normalisation means the gate scales automatically to any asset and timeframe.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">GATE 3 &middot; MIDDLE CANDLE VOLUME &gt; 1.2x AVG</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">vol_pass = vol_ratio[1] &gt; 1.2</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">The most important gate. <code className="text-white">vol_ratio[1]</code> is the middle candle&apos;s volume divided by its 20-bar average. A passing FVG demands the middle candle have at least 1.2x average volume &mdash; <strong className="text-white">proof that the gap was caused by aggressive participation, not just thin retail flow</strong>. Most retail FVG indicators skip this gate entirely. CIPHER demands it.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE THREE-GATE COMBINED FORMULA</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">bull_fvg_valid = bullish_fvg AND<br />&nbsp;&nbsp;gap_size &gt; atr * 0.3 AND<br />&nbsp;&nbsp;vol_ratio[1] &gt; 1.2</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">All three are required. CIPHER stores no FVG that fails any gate. The strict AND logic is why CIPHER&apos;s FVG count tends to be 30-50% lower than retail FVG indicators on the same chart &mdash; we filter out the noise that those indicators paint as legitimate gaps.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">WHY THE VOLUME GATE MATTERS MOST</p>
              <p className="text-sm text-gray-400 leading-relaxed">A gap with low volume on the middle candle is statistically a fluke &mdash; thin liquidity, news event, or accidental geometry. <strong className="text-white">A gap with high volume on the middle candle is institutional intent</strong>: someone aggressive enough to push price through fair value <em>with size</em> created the imbalance. That&apos;s the kind of gap markets remember and return to fill.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PRE-VALIDATION ON CLOSED BARS</p>
              <p className="text-sm text-gray-400 leading-relaxed">All three gates evaluate at bar close, not intra-bar. The volume read uses <code className="text-white">vol_ratio[1]</code> &mdash; the previous bar&apos;s closed volume ratio &mdash; to ensure we&apos;re testing finalised data. <strong className="text-white">No FVG appears mid-bar.</strong> The gates apply once per closed bar and either fire or don&apos;t.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE 0.3 ATR GATE IS NOT TUNABLE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Most CIPHER parameters expose user inputs. The 0.3 ATR gap minimum is hardcoded and not configurable. Reason: the threshold is calibrated empirically against historical FVG fill rates &mdash; gaps below 0.3 ATR fill at significantly higher rates as random noise reversion, not as institutional return. <strong className="text-white">Lowering it would re-introduce the noise we filter for</strong>.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SAME GATES FOR BULL AND BEAR</p>
              <p className="text-sm text-gray-400 leading-relaxed">Bullish and bearish FVGs are tested with mirror-symmetric gates. The geometric inequality flips, but size and volume requirements are identical. <strong className="text-white">CIPHER treats bull and bear gaps as structurally equivalent</strong> &mdash; they differ only in direction, not in conviction or significance.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Every FVG box you see on chart passed all three gates. <strong className="text-white">It&apos;s geometrically real, statistically meaningful in size, and was caused by aggressive volume</strong>. Other indicators paint gaps that fail one or more of these tests. CIPHER doesn&apos;t. When a CIPHER FVG appears, the chart is flagging an institutional move, not noise.</p>
          </div>
        </motion.div>
      </section>

      {/* === S04 — The 11 Parallel Arrays === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The 11 Parallel Arrays</p>
          <h2 className="text-2xl font-extrabold mb-4">Eleven fields per FVG &mdash; original is sacred, live shrinks</h2>
          <p className="text-gray-400 leading-relaxed mb-6">CIPHER tracks every active FVG as a record across <strong className="text-amber-400">11 parallel arrays</strong>. Slightly more than Cipher Structure&apos;s 10 fields per level. The crucial distinction inside the record: a clean separation between <strong className="text-white">original bounds</strong> (immutable, set at birth, never change) and <strong className="text-white">live bounds</strong> (mutable, shrink as price fills the gap). The smart mitigation we covered in Section 1 is implemented through this dual-tracking design.</p>
          <ParallelArraysAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the record card cycle through three stages. <strong className="text-white">Stage 1 &middot; Birth</strong>: all 11 fields populate. Original bounds match live bounds (gap is fully unfilled). <strong className="text-white">Stage 2 &middot; Mitigation</strong>: price fills 47% of the gap. The live <code className="text-white">fvg_top</code> shrinks to <strong className="text-white">4647.50</strong>; the original <code className="text-white">fvg_orig_top</code> stays at <strong className="text-white">4654.20</strong> &mdash; same record, two different snapshots. <strong className="text-white">Stage 3 &middot; Full Fill</strong>: the box deletes, label deletes, midline deletes; the entire row vanishes from all 11 arrays simultaneously.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">IMMUTABLE FIELDS &middot; fvg_orig_top, fvg_orig_bot</p>
              <p className="text-sm text-gray-400 leading-relaxed">Set at birth from the gap&apos;s geometric edges. <strong className="text-white">Never change for the lifetime of the FVG</strong>. Used for: original size calculation, fill percentage computation, the 50% midline anchor, and the tooltip&apos;s original-bounds line. The originals are the fixed historical record.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">LIVE FIELDS &middot; fvg_top, fvg_bot</p>
              <p className="text-sm text-gray-400 leading-relaxed">Initialised at birth identical to the originals. <strong className="text-white">Shrink as price enters the gap</strong>. For bullish: <code className="text-white">fvg_top</code> drops down toward the original bottom as price dips into the gap. For bearish: <code className="text-white">fvg_bot</code> rises up toward the original top. The live bounds drive the on-chart box size.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DIRECTION &middot; fvg_dir</p>
              <p className="text-sm text-gray-400 leading-relaxed">+1 for bullish FVG, -1 for bearish. Determines mitigation direction (price enters bull gaps from above, bear gaps from below) and the rendering colour (teal for +1, magenta for -1).</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">BIRTH BAR &middot; fvg_bar</p>
              <p className="text-sm text-gray-400 leading-relaxed">The bar index when the FVG was born. Used for age calculation: <code className="text-white">age = bar_index \u2212 fvg_bar</code>. Drives the 100-bar age cap for retirement and the &ldquo;Age: N / 100&rdquo; line in the tooltip.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CONSEQUENTIAL FLAG &middot; fvg_conseq</p>
              <p className="text-sm text-gray-400 leading-relaxed">1 if the FVG was born with-trend (Ribbon stack matched gap direction), 0 if against-trend. <strong className="text-white">Drives the &#9733; flag</strong> in the tooltip and a -5 transparency boost on the box (subtly brighter). Operators reading the chart can spot consequential gaps by their slightly more vivid rendering. Section 8 covers this in depth.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">VISUAL FIELDS &middot; fvg_box, fvg_mid, fvg_lbl</p>
              <p className="text-sm text-gray-400 leading-relaxed">Three Pine drawing primitives, one per visual feature. <strong className="text-white">fvg_box</strong>: the rectangle that shrinks as price fills the gap. <strong className="text-white">fvg_mid</strong>: the dotted 50% equilibrium line anchored to original bounds. <strong className="text-white">fvg_lbl</strong>: the live fill % label at the right edge. Each is created at birth, mutated during mitigation, deleted on retirement. The drawing primitives are stored alongside the data so the visuals stay perfectly in sync with the record.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PARALLEL ARRAYS, NOT OBJECTS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Pine doesn&apos;t use user-defined types per FVG here &mdash; CIPHER stores each field as its own array. FVG 0 is row 0 across all 11 arrays; FVG 1 is row 1; and so on. <strong className="text-white">When an FVG retires, its row is removed from all 11 arrays at once via array.remove()</strong>, keeping the indexing in sync. The relational model lives in the index alignment.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">UP TO fvg_max ACTIVE FVGs</p>
              <p className="text-sm text-gray-400 leading-relaxed">CIPHER caps total active FVGs at <strong className="text-white">fvg_max = 8</strong> &mdash; the union of bull and bear gaps. When a new FVG would exceed the cap, the <strong className="text-white">oldest gap is pruned</strong> (FIFO). Pruning is silent: the box, midline, and label all vanish at the same bar, and the row drops from all 11 arrays. New FVGs always make room for themselves.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE 11TH FIELD IS DERIVED</p>
              <p className="text-sm text-gray-400 leading-relaxed">Strictly counted: 10 stored arrays (orig_top, orig_bot, top, bot, dir, bar, conseq, box, mid, lbl). <strong className="text-white">The 11th &mdash; age &mdash; is derived</strong> from <code className="text-white">bar_index \u2212 fvg_bar</code> on every bar rather than stored. The tooltip reads it; the retirement check reads it; the fade calculation reads it. Computed once per bar per FVG, never persisted. It&apos;s fundamental to the record even though it doesn&apos;t live in its own array.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">ONCE YOU SEE THE RECORD</p>
            <p className="text-sm text-gray-400 leading-relaxed">An FVG box on chart isn&apos;t just a rectangle. It&apos;s the visible expression of an 11-array record where original bounds are the historical truth and live bounds are the current frontier. <strong className="text-white">The next sections walk through how that record evolves</strong>: smart mitigation (S05), the original-vs-remaining read (S06), fade by fill % (S07), the consequential star (S08), the lifecycle paths (S09), and the stacking detection (S10).</p>
          </div>
        </motion.div>
      </section>

      {/* === S05 — Smart Mitigation: Boxes That Shrink === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Smart Mitigation</p>
          <h2 className="text-2xl font-extrabold mb-4">The deep mechanics &mdash; how the box actually shrinks</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Section 1 introduced smart mitigation as the headline feature. Section 4 showed you the parallel arrays that make it possible. <strong className="text-amber-400">This section is the deep dive into the actual logic</strong> &mdash; the per-bar evaluation that drives every box&apos;s shrinking edge. The formula is exactly four lines of Pine, but those four lines are what separates CIPHER&apos;s FVG implementation from every other indicator on TradingView.</p>
          <BoxShrinkDetailAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the six steps unfold. <strong className="text-white">Step 1</strong>: price sits above the gap, no contact. <strong className="text-white">Step 2</strong>: low touches the top edge of the original gap &mdash; still no shrink yet. <strong className="text-white">Step 3</strong>: low descends into the gap; <code className="text-white">new_top := math.min(ft, low)</code> evaluates to the lower value, the box top drops to follow. <strong className="text-white">Steps 4-5</strong>: low descends further, top continues to drop. <strong className="text-white">Step 6</strong>: nearly full fill, box almost gone. The right-side panel shows the live <code className="text-white">ft</code>, <code className="text-white">low</code>, and <code className="text-white">fill %</code> values updating in lock-step with the visual.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE MITIGATION FORMULA</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">if fd == 1 and low &lt; ft and low &gt; fb:<br />&nbsp;&nbsp;new_top := math.min(ft, low)</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">Four conditions, four characters of logic. <code className="text-white">fd == 1</code> means it&apos;s a bullish FVG. <code className="text-white">low &lt; ft</code> means current bar&apos;s low has entered the gap from above. <code className="text-white">low &gt; fb</code> means the low hasn&apos;t broken below the original bottom (which would trigger full fill instead). When all three pass, the new top is the smaller of (current top) and (current low). <strong className="text-white">The frontier only retreats inward; never expands back outward</strong>.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">BEARISH MITIGATION IS THE MIRROR</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">if fd == -1 and high &gt; fb and high &lt; ft:<br />&nbsp;&nbsp;new_bot := math.max(fb, high)</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">For bearish FVGs, the bottom edge rises as price pushes up into the gap. Same mathematical pattern, mirror-symmetric. The bear gap&apos;s remaining portion is always the ABOVE the live bottom.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE math.min IS THE WHOLE GAME</p>
              <p className="text-sm text-gray-400 leading-relaxed">A naive implementation might try <code className="text-white">new_top := low</code>, but that would let the box <em>grow</em> back if a later bar&apos;s low retreated outside the gap. CIPHER&apos;s use of <code className="text-white">math.min</code> guarantees the top edge is monotonically non-increasing. <strong className="text-white">Once a box has shrunk to a certain size, it never gets bigger again</strong>. The shrink is permanent for the FVG&apos;s lifetime.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PER-BAR, PER-FVG EVALUATION</p>
              <p className="text-sm text-gray-400 leading-relaxed">On every closed bar, CIPHER iterates through all active FVGs (up to 8) and evaluates the mitigation logic against the current bar&apos;s high and low. <strong className="text-white">Each FVG&apos;s shrink is independent</strong>: a single bar can shrink the bull gap below price AND the bear gap above price simultaneously, if its wick reaches into both.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">box.set_top() AND box.set_bottom()</p>
              <p className="text-sm text-gray-400 leading-relaxed">When the live <code className="text-white">fvg_top</code> (or <code className="text-white">fvg_bot</code>) changes, CIPHER calls <code className="text-white">box.set_top()</code> (or <code className="text-white">box.set_bottom()</code>) on the stored box primitive to redraw the rectangle. Pine&apos;s box objects are mutable in-place; this is what allows the visual to shrink without creating a new box on every bar. <strong className="text-white">The box you saw at birth is the same object on chart 50 bars later, just with new dimensions</strong>.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SHRINK ONLY ON ENTRY, NOT ON CONTINUED PROXIMITY</p>
              <p className="text-sm text-gray-400 leading-relaxed">The shrink fires when the bar&apos;s low (or high) actually <em>enters</em> the gap zone. A bar that hovers right above the gap without entering doesn&apos;t trigger a shrink. <strong className="text-white">Entry is the action that counts</strong>. Wicks that come close but don&apos;t penetrate leave the box untouched.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FULL FILL TAKES PRECEDENCE</p>
              <p className="text-sm text-gray-400 leading-relaxed">If a bar&apos;s low reaches the original bottom (<code className="text-white">low &lt;= fb</code>), the FVG retires before the shrink even fires. The box, midline, and label all delete on that bar. <strong className="text-white">No partial-shrink at 99% then delete at 100%</strong>; the full-fill check runs first. This keeps the chart clean &mdash; nearly-filled gaps either get fully filled and vanish, or stay at their last shrunk state.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE LABEL UPDATES TO MATCH</p>
              <p className="text-sm text-gray-400 leading-relaxed">Each shrink also recomputes <code className="text-white">fill_pct</code> from the new bounds and updates the label text via <code className="text-white">label.set_text(fvg_l, fpct + &quot;%&quot;)</code>. <strong className="text-white">The label and the box always agree</strong> &mdash; same bar, same data source, same computation.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">When you see a CIPHER FVG box on chart, its current size is <strong className="text-white">exactly the unfilled portion remaining</strong>. Not the historical full size, not an approximation, not a guess. The math.min discipline guarantees it. <strong className="text-white">Trade the visible edges, not imagined ones</strong>. Your stop placement and target reads should reference what&apos;s on chart, because what&apos;s on chart is the live truth.</p>
          </div>
        </motion.div>
      </section>

      {/* === S06 — The Original-vs-Remaining Read === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; The Original-vs-Remaining Read</p>
          <h2 className="text-2xl font-extrabold mb-4">Why CIPHER tracks both, and why the midline never moves</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Section 4 introduced the dual-tracking design. Section 5 showed how the live bounds shrink. <strong className="text-amber-400">This section explains why both reads matter, and the specific decision CIPHER makes about the 50% midline anchor.</strong> The original-vs-remaining distinction isn&apos;t just bookkeeping &mdash; it&apos;s the source of multiple operational reads that disappear if you collapse the two into one.</p>
          <OriginalVsRemainingAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the dashed amber outline (the original) stay perfectly fixed while the teal box (the live remaining) shrinks step by step. The dotted white midline runs through the geometric center of the dashed outline &mdash; it doesn&apos;t move when the live box shrinks. Price oscillates: dips into the gap to 30% fill, pulls back partway, dips deeper to 60% fill. <strong className="text-white">The dashed original stays as a permanent record of where the gap began</strong>; the teal live box shows where the magnet currently sits.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">WHY KEEP THE ORIGINAL AT ALL</p>
              <p className="text-sm text-gray-400 leading-relaxed">If you only tracked the live remaining bounds, you&apos;d lose: (1) the historical record of how big the gap originally was, (2) the fill percentage calculation (which needs original size as denominator), (3) the 50% midline anchor, and (4) the tooltip&apos;s &ldquo;Original: X to Y&rdquo; line. <strong className="text-white">The original is the historical reference; the live is the current frontier</strong>. Both reads are operationally distinct.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FILL % NEEDS ORIGINAL SIZE</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">orig_size = orig_top &minus; orig_bot<br />remain_size = top &minus; bot<br />fill_pct = 1.0 &minus; (remain_size / orig_size)</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">Without the original, fill % would be undefined. <strong className="text-white">A box that&apos;s currently 5 ATR tall could be 0% filled (giant fresh gap) or 95% filled (originally 100 ATR, now nearly consumed)</strong>. Same current size, opposite operational meaning. The original is what disambiguates them.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE 50% MIDLINE ANCHORS TO ORIGINAL</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">mid_price = (orig_top + orig_bot) / 2</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">CIPHER could anchor the midline to the live remaining instead. It doesn&apos;t. The reasoning: <strong className="text-white">the 50% point is the institutional fair-value reference for the original aggressive move</strong>. It doesn&apos;t drift just because some of the gap has filled. If the midline followed the shrinking box, the &ldquo;50% point&rdquo; would creep deeper into the remainder as fills happened &mdash; a moving target with no anchored meaning.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE MIDLINE DISAPPEARS WHEN OUTSIDE THE REMAINDER</p>
              <p className="text-sm text-gray-400 leading-relaxed">When the live box shrinks past the 50% midpoint (fill % &gt; 50%), the midline is no longer inside the remaining gap. CIPHER hides the midline at that point via <code className="text-white">line.set_y1(ml, na)</code>. <strong className="text-white">The midline only renders while it&apos;s still operationally inside the magnet</strong>. Past 50% fill, it&apos;s already been crossed and is no longer a forward reference.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">TWO TYPES OF VISUAL ON CHART</p>
              <p className="text-sm text-gray-400 leading-relaxed">Look at any active FVG. You&apos;ll see <strong className="text-white">the rendered box</strong> (live shrinking, teal/magenta) and possibly <strong className="text-white">the dotted midline</strong> (original-anchored, white). The original outline isn&apos;t drawn separately on chart &mdash; the midline IS the visible signal that the original extends beyond the live box. When the midline floats above the box&apos;s top edge, you can infer there&apos;s been a partial fill from above.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE TOOLTIP SHOWS BOTH PAIRS</p>
              <p className="text-sm text-gray-400 leading-relaxed">When you hover an FVG, the tooltip displays:<br /><code className="text-white">Original: 4654.20 \u2013 4640.10</code><br /><code className="text-white">Remaining: 4647.50 \u2013 4640.10</code><br />Both pairs side by side. Operationally: original tells you the institutional move that birthed the gap; remaining tells you where the magnet is right now. <strong className="text-white">Two reads, one tooltip block</strong>.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">REMAINING DRIVES PROXIMITY READS</p>
              <p className="text-sm text-gray-400 leading-relaxed">The Command Center Imbalance row uses the <strong className="text-white">live remaining bounds</strong> for proximity calculations. AT BULL GAP fires when price is within 0.5 ATR of the <em>remaining</em> gap&apos;s midpoint, not the original. <strong className="text-white">Proximity follows the live frontier, not the historical reference</strong>. Operators chasing setups should orient to where the magnet actually is.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE DESIGN IS NOT SYMMETRIC ACROSS THE TWO</p>
              <p className="text-sm text-gray-400 leading-relaxed">Original = historical record + fill % denominator + midline anchor. Live = current frontier + visual rendering + proximity calculations. <strong className="text-white">They serve different purposes; CIPHER never confuses them</strong>. Most retail FVG indicators don&apos;t even maintain both, which is why their visuals lie about magnitude after partial fills.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">The midline tells you the institutional fair value reference. The box tells you the active magnet. <strong className="text-white">When price approaches a partially-filled FVG, target the live edge for entry, not the midline; reference the midline for psychological context</strong>. The two reads layer to give you complete positional awareness around any FVG.</p>
          </div>
        </motion.div>
      </section>

      {/* === S07 — Fade by Fill Percentage === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Fade by Fill Percentage</p>
          <h2 className="text-2xl font-extrabold mb-4">The visual itself communicates urgency</h2>
          <p className="text-gray-400 leading-relaxed mb-6">CIPHER doesn&apos;t just shrink the box as it fills &mdash; <strong className="text-amber-400">it also fades it</strong>. A 0%-filled gap is rendered vivid; a 90%-filled gap is barely visible. Combined with the size shrink, this means the most urgent unfilled gaps are the most visually prominent on chart, and consumed gaps recede toward invisibility before they delete entirely. The visual hierarchy is automatic and operator-friendly: bright = fresh, faded = nearly consumed.</p>
          <FillPctFadeAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the four reference boxes at progressive fill levels. <strong className="text-white">0%</strong>: vivid teal, sharp border, &ldquo;FRESH&rdquo; label. <strong className="text-white">30%</strong>: noticeable fade, label shows &ldquo;30%&rdquo;. <strong className="text-white">60%</strong>: significantly fainter, midline disappears (covered in S06). <strong className="text-white">90%</strong>: nearly invisible, label barely legible. The same FVG at four different points in its mitigation. The visual tells you priority without requiring text reading.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE FADE FORMULA</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">fill_fade = int(fill_pct * 15)<br />curr_fill_transp = math.max(50,<br />&nbsp;&nbsp;math.min(96,<br />&nbsp;&nbsp;&nbsp;&nbsp;fvg_fill_transp + fill_fade + conseq_boost))</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">Up to 15 additional transparency points are added based on fill percentage. <strong className="text-white">A 100%-filled box would have +15 transparency on top of the base</strong>, making it nearly invisible. The math.max/math.min clamps the result between 50 (highly visible floor) and 96 (almost transparent ceiling).</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">BORDER FADE IS SEPARATE</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">if fill_pct &gt; 0.1:<br />&nbsp;&nbsp;fade_border = math.min(95,<br />&nbsp;&nbsp;&nbsp;&nbsp;fvg_border_transp + int(fill_pct * 20))</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">Borders fade independently from fills, with up to 20 transparency points added &mdash; slightly more aggressive than the fill fade. <strong className="text-white">The border fades faster than the fill</strong>, which means at high fill percentages the box becomes a faint cloud rather than a sharp rectangle. Fitting visual metaphor for a magnet that&apos;s mostly consumed.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FADE BEGINS AT 10%, NOT 0%</p>
              <p className="text-sm text-gray-400 leading-relaxed">The border fade is gated at <code className="text-white">fill_pct &gt; 0.1</code>. Until 10% fill, the border stays at its default vividness. <strong className="text-white">Fresh gaps and barely-touched gaps look identical visually</strong> &mdash; both are fully active magnets. Past 10%, the engine starts signalling visual decay.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE LABEL DISAPPEARS UNDER 5%</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">label.set_text(fvg_l,<br />&nbsp;&nbsp;fpct &gt; 5 ? str.tostring(fpct) + &quot;%&quot; : &quot;&quot;)</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">Under 5% fill, the label text is empty &mdash; no &ldquo;0%&rdquo; or &ldquo;3%&rdquo; clutter on chart. <strong className="text-white">The label only appears when there&apos;s meaningful fill to report</strong>. Operators reading a chart see fill % labels only on gaps that have actually been touched.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE INTENSITY INPUT INTERACTS</p>
              <p className="text-sm text-gray-400 leading-relaxed">The Imbalance Intensity input (Subtle / Normal / Bold) shifts the entire transparency curve up or down. <strong className="text-white">Subtle adds +20 transparency to all gaps</strong>; Bold subtracts -20. This shifts the entire fade scale: under Bold, even a 90%-filled gap stays meaningfully visible; under Subtle, even fresh gaps are subdued. The relative fade hierarchy is preserved across all intensities.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CONSEQUENTIAL GAPS GET A BRIGHTNESS BOOST</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">conseq_boost = fvg_cq == 1 ? -5 : 0</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">Consequential FVGs (with-trend) get -5 transparency &mdash; visibly brighter than non-consequential gaps. <strong className="text-white">A consequential FVG at 60% fill renders as bright as a non-consequential FVG at ~50% fill</strong>. The boost is subtle but cumulatively meaningful when scanning a chart with mixed gap types. Section 8 covers consequential mechanics in depth.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FADE IS NOT THE SAME AS RETIREMENT</p>
              <p className="text-sm text-gray-400 leading-relaxed">A 95%-filled gap is faded to near-invisibility but is <strong className="text-white">still a live record</strong> in CIPHER&apos;s arrays &mdash; it can still trigger AT GAP / NEAR GAP proximity reads, can still appear in the Command Center row, can still feed signal context tags. The fade is purely visual decay; the operational record is intact until full fill or age expiry actually retire it.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Bright box = fresh magnet, full priority. <strong className="text-white">Faded box = mostly consumed, lower priority but still tracked</strong>. Barely-visible box = approaching full fill, watch for the box to vanish entirely. Scan the chart by visual prominence and you&apos;re scanning by operational urgency &mdash; the rendering does the prioritisation for you.</p>
          </div>
        </motion.div>
      </section>

      {/* === S08 — Consequential FVGs === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Consequential FVGs &#9733;</p>
          <h2 className="text-2xl font-extrabold mb-4">With-trend gaps get the star &mdash; and the brightness boost</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Not all FVGs are created equal. <strong className="text-amber-400">A bullish FVG that forms during a bullish Ribbon stack is institutionally different</strong> from one that forms during a bearish stack. The first means institutions are creating gaps in the trend direction &mdash; loading up, not exiting. The second means institutions are creating against-trend gaps &mdash; could be exhaustion, could be reversal-class moves, but operationally less reliable as continuation magnets. CIPHER calls the with-trend version <em>consequential</em> and tags it accordingly.</p>
          <ConsequentialStarAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the spotlight rotate between the two FVGs. They&apos;re geometrically identical &mdash; same size, same direction (both bull) &mdash; but the Ribbon stack at the top reads BULL. <strong className="text-white">The left FVG is consequential</strong> (with-trend bull): it carries the &#9733; tag and renders subtly brighter. <strong className="text-white">The right FVG is non-consequential</strong> (against-trend, would only happen if Ribbon were bear): standard transparency, no star. The visual difference is intentional &mdash; just enough to scan, not so much it dominates.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE CONSEQUENTIAL DEFINITION</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">conseq = ribbon_dir == fvg_dir ? 1 : 0</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">Set at FVG birth based on the current Ribbon stack direction. Bull FVG + bull Ribbon = consequential (1). Bull FVG + bear Ribbon = non-consequential (0). <strong className="text-white">The flag is fixed at birth and never updated</strong> &mdash; even if the Ribbon stack flips later in the FVG&apos;s lifecycle, the consequential label sticks with the gap.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHY WITH-TREND GAPS MATTER MORE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Markets move in trends; institutions trade in size; <strong className="text-white">an FVG created in the trend direction is institutional confirmation of conviction</strong>. The aggression that birthed the gap was aligned with where money is flowing structurally. Against-trend FVGs are more often profit-taking spikes, news reactions, or temporary dislocations &mdash; the move that created the gap was less likely a continuation signal.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE -5 TRANSPARENCY BOOST</p>
              <p className="text-sm text-gray-400 leading-relaxed">Consequential FVGs render with 5 fewer transparency points across all states. <strong className="text-white">A fresh consequential FVG is roughly 10% brighter visually than a fresh non-consequential one</strong>. The boost compounds with the fade-by-fill curve, which means consequential gaps stay readably visible deeper into their fill cycle than non-consequential ones do.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE TOOLTIP TAG</p>
              <p className="text-sm text-gray-400 leading-relaxed">When you hover a consequential FVG, the tooltip&apos;s first line reads <code className="text-white">BULL FVG &#9733; Consequential</code>. Non-consequential reads <code className="text-white">BULL FVG Non-consequential</code>. <strong className="text-white">Both tooltips are clear about the type</strong>; you don&apos;t need to remember which version you&apos;re looking at.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">SIGNAL CONTEXT TAGS USE THE CONSEQUENTIAL FLAG</p>
              <p className="text-sm text-gray-400 leading-relaxed">When a Pulse Cross or Tension Snap fires while price is at a consequential FVG, the signal&apos;s context tag reflects that. <strong className="text-white">A long PX at a consequential bull FVG is a higher-conviction setup</strong> than the same signal at a non-consequential FVG. The Last Signal row in the Command Center will note it.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CONSEQUENTIAL DOES NOT MEAN GUARANTEED</p>
              <p className="text-sm text-gray-400 leading-relaxed">A consequential FVG is statistically a stronger magnet, but not a certainty. <strong className="text-white">Markets can fail to fill any FVG &mdash; consequential or otherwise &mdash; if the trend ends or accelerates beyond it</strong>. The flag is a probability adjuster, not a deterministic signal. Consequential gaps fill at higher rates; that&apos;s the operational claim, not &ldquo;always fill.&rdquo;</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SIZING PREFERENCE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Operators trading FVG bounce setups should <strong className="text-white">prefer consequential gaps for full size</strong> and trade non-consequential gaps with reduced size or skip them entirely. The visual hierarchy is the engine&apos;s priority signal &mdash; trust it as a sizing input, not just visual decoration.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CONSEQUENTIAL FLAG IS NOT MUTUALLY EXCLUSIVE WITH STACKED</p>
              <p className="text-sm text-gray-400 leading-relaxed">An FVG can be both consequential AND part of a stacked group (covered in S10). A stacked-bull setup with all consequential FVGs is the highest-conviction gap context CIPHER tracks. <strong className="text-white">Multiple aggressive moves in the trend direction over a short range</strong> &mdash; that&apos;s where institutional intent is clearest.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">When scanning a chart for entries, <strong className="text-white">prioritise the brighter boxes</strong> &mdash; they&apos;re consequential. Hover the tooltip to confirm the &#9733; tag. <strong className="text-white">Trade those at full size with confidence</strong>. Non-consequential gaps still get tracked and still appear on chart, but treat them as opportunities to reduce size or wait for additional confirmation.</p>
          </div>
        </motion.div>
      </section>

      {/* === S09 — Lifecycle === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Lifecycle</p>
          <h2 className="text-2xl font-extrabold mb-4">Three paths to retirement &mdash; full fill, age, pruning</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Every active FVG has a finite lifespan. Three paths can end it: <strong className="text-amber-400">full fill</strong> (price consumes the gap entirely), <strong className="text-amber-400">age expiry</strong> (100 bars pass since birth), or <strong className="text-amber-400">pruning</strong> (a 9th FVG forces the oldest out of CIPHER&apos;s 8-cap). All three paths are silent and automatic: when an FVG retires, its box, midline, and label all delete on the same bar; the row drops from all 11 arrays simultaneously; the chart cleans itself.</p>
          <FvgLifecycleAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the three retirement paths cycle. <strong className="text-white">Path A &middot; Full Fill</strong>: a single gap fills progressively until <code className="text-white">low &lt;= fb</code>, at which point it&apos;s deleted &mdash; the &ldquo;promise kept&rdquo; outcome. <strong className="text-white">Path B &middot; Age Expiry</strong>: a gap that&apos;s never been touched fades over 100 bars; at the cap, it deletes regardless of fill state. <strong className="text-white">Path C &middot; Pruning</strong>: 8 active FVGs sit on chart; a 9th forms, the oldest is dropped to make room (FIFO). All three paths are permanent &mdash; once retired, an FVG is gone, no &ldquo;historically filled&rdquo; trail.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">PATH A &middot; FULL FILL</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">filled = fd == 1 ? (low &lt;= fb) : (high &gt;= ft)<br />if filled or expired:<br />&nbsp;&nbsp;box.delete(...)<br />&nbsp;&nbsp;line.delete(...)<br />&nbsp;&nbsp;label.delete(...)<br />&nbsp;&nbsp;array.remove(...)</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">Bullish FVG retires when current bar&apos;s low reaches the original bottom. Bearish retires when high reaches the original top. <strong className="text-white">The check uses original bounds, not live</strong> &mdash; a gap is fully filled only when price reaches all the way to the historical edge. Once retired, all 11 array entries are removed via array.remove() in a single iteration.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PATH B &middot; AGE EXPIRY</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">expired = age &gt; 100<br />age = bar_index &minus; fvg_bar</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">100 bars after birth, an FVG retires regardless of fill state. <strong className="text-white">A gap that&apos;s been ignored by price for 100 bars is no longer institutionally relevant</strong> &mdash; the move that created it has been overwritten by 100 bars of new structure. Cleaning it from chart prevents stale-gap clutter on long-running charts.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PATH C &middot; PRUNING</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">while array.size(fvg_top) &gt; fvg_max:<br />&nbsp;&nbsp;array.shift(...) // remove oldest</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">When a new FVG would push the active count above 8, the oldest is removed via <code className="text-white">array.shift()</code> &mdash; FIFO eviction. <strong className="text-white">No quality scoring on prune</strong>: it&apos;s purely first-in-first-out, regardless of fill state, age, or consequential status. The simplest possible rule, but it works because the age cap usually retires gaps before the prune ever fires.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE 100-BAR CAP IS HARDCODED</p>
              <p className="text-sm text-gray-400 leading-relaxed">Like Cipher Structure&apos;s parameters, lifecycle limits are tuned but exposed differently. The 100-bar age cap is hardcoded in the Pine. <strong className="text-white">If you find FVGs aging out too fast on your timeframe, raise the timeframe</strong> &mdash; on 1H charts, 100 bars is roughly a week; on 1D charts, 100 bars is roughly 5 months. Different timeframes carry different memory horizons.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">FULL FILL TAKES PRECEDENCE OVER AGE</p>
              <p className="text-sm text-gray-400 leading-relaxed">If a gap is at age 99 and the bar that fills it is the bar that would have retired it from age, <strong className="text-white">the full fill check fires first</strong> &mdash; the gap retires as &ldquo;promise kept&rdquo; rather than &ldquo;forgotten.&rdquo; Operationally identical (gap is gone), but the distinction matters for the conceptual record.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PRUNING IS THE LEAST COMMON PATH</p>
              <p className="text-sm text-gray-400 leading-relaxed">In normal trading, the age cap usually fires before the count reaches 8 + 1. <strong className="text-white">Pruning typically only happens during high-volatility sessions</strong> when many FVGs are born in rapid succession. On stable, ranging charts, you&apos;ll rarely see pruning trigger.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">NO RETIREMENT METADATA</p>
              <p className="text-sm text-gray-400 leading-relaxed">Once an FVG retires, there&apos;s no record of WHY it retired &mdash; full fill, age, or prune. <strong className="text-white">CIPHER&apos;s philosophy: the chart should show what&apos;s actionable now, not a graveyard of past gaps</strong>. If a gap is gone, it&apos;s gone, and the operator&apos;s attention should be on currently active gaps. Backtesting the retirement-mode distribution would require external logging.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE LIFECYCLE GIVES YOU SIGNAL</p>
              <p className="text-sm text-gray-400 leading-relaxed">An FVG approaching age 90+ with low fill % is <strong className="text-white">forgotten territory</strong> &mdash; price hasn&apos;t shown interest in 90 bars, the institutional aggression has been overwritten. Treat these as low-priority targets even though they&apos;re still on chart. Conversely, fresh FVGs (age &lt;= 20) at high consequential ratings are <strong className="text-white">peak priority</strong>: institutional intent fresh, plenty of life left.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Every FVG on your chart is currently relevant by definition &mdash; if it weren&apos;t, CIPHER would have retired it. <strong className="text-white">Track age via tooltip; prioritise younger gaps</strong>. Watch for the visual fade as a gap approaches age 100 &mdash; faded gaps are dying, trade them carefully. When a gap deletes from full fill, the &ldquo;promise kept&rdquo; outcome means the institutional move that created it is now operationally complete.</p>
          </div>
        </motion.div>
      </section>

      {/* === S10 — Stacked FVG Detection === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Stacked FVG Detection &#9889;</p>
          <h2 className="text-2xl font-extrabold mb-4">Two or more same-direction gaps within 2 ATR &mdash; institutional intent</h2>
          <p className="text-gray-400 leading-relaxed mb-6">A single FVG is institutional aggression. <strong className="text-amber-400">Two or more same-direction FVGs within 2 ATR of each other is institutional CONVICTION.</strong> CIPHER monitors all active FVGs every bar and fires <code className="text-white">fvg_stacked_bull</code> or <code className="text-white">fvg_stacked_bear</code> when the cluster forms. The Imbalance row appends a &#9889; lightning bolt to flag the urgent context. Operationally, stacked gaps fill at higher rates and produce larger continuation moves than isolated gaps &mdash; because the institutions repeatedly pushed in the same direction over a short range.</p>
          <StackedDetectionAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the alert build. <strong className="text-white">Phase 1</strong>: one bull FVG visible, the row reads NEAR BULL GAP (normal). <strong className="text-white">Phase 2</strong>: a second bull FVG forms within 2 ATR of the first &mdash; the amber 2-ATR cluster zone appears, marking the proximity envelope. <strong className="text-white">Phase 3</strong>: the row updates to STACKED BULL &#9889; with pulsing amber emphasis. The lightning bolt is the institutional confirmation alert. The Pine cascade (Section 12) places the &#9889; tier above unmodified STACKED BULL precisely so the operator&apos;s eye catches it immediately.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE STACKED FORMULA</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">if other_dir == fd<br />&nbsp;&nbsp;and math.abs(other_top &minus; ft) &lt; atr * 2:<br />&nbsp;&nbsp;&nbsp;&nbsp;same_dir_count := same_dir_count + 1</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">For each pair of active FVGs, CIPHER checks if their directions match (<code className="text-white">other_dir == fd</code>) AND if their tops are within 2 ATR of each other. <strong className="text-white">Two qualifying gaps fire the stacked flag</strong>; three or more strengthen the conviction without changing the visual tier (still &#9889;, just denser cluster).</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">2 ATR PROXIMITY \u00B7 CALIBRATED, NOT TUNABLE</p>
              <p className="text-sm text-gray-400 leading-relaxed">The 2 ATR threshold is hardcoded. The reasoning: 2 ATR represents roughly one trading session&apos;s typical range &mdash; gaps within this distance occurred within a coherent timeframe of institutional positioning. <strong className="text-white">Wider thresholds would lump together unrelated moves; tighter thresholds would miss legitimate cluster patterns</strong>. The 2 ATR value was empirically calibrated against historical fill rates of clustered vs isolated gaps.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STACKED FIRES AT 2+, NOT JUST 3+</p>
              <p className="text-sm text-gray-400 leading-relaxed">Some retail FVG indicators require 3 or more clustered gaps before flagging. CIPHER fires at 2. <strong className="text-white">Two consecutive aggressive moves in the same direction within 2 ATR is already statistically significant</strong> &mdash; the second move proves the first wasn&apos;t a one-off, and the proximity proves both occurred during a coherent institutional window. Three would be even stronger but waiting for the third gives away too much edge.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DIRECTION MATTERS \u00B7 BULL AND BEAR ARE TRACKED SEPARATELY</p>
              <p className="text-sm text-gray-400 leading-relaxed"><code className="text-white">fvg_stacked_bull</code> and <code className="text-white">fvg_stacked_bear</code> are independent booleans. A chart can have stacked bulls AND stacked bears simultaneously &mdash; that&apos;s a high-volatility chart with aggressive moves in both directions. The Command Center cascade prioritises whichever direction is currently AT a gap; if both, the cascade lands on the highest-priority verdict.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">STACKED + AT \u26A1 \u00B7 THE TOP-TIER VERDICTS</p>
              <p className="text-sm text-gray-400 leading-relaxed">When stacking is active AND price is within 0.5 ATR of one of the gaps, the cascade fires the elevated tier: <strong className="text-white">STACKED BULL &#9889;</strong> or <strong className="text-white">STACKED BEAR &#9889;</strong>. These sit at positions 2 and 3 in the 11-level cascade &mdash; only NO ACTIVE GAPS sits above them. Operationally, this is the highest-conviction context CIPHER&apos;s Imbalance row produces.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STACKED WITHOUT AT \u00B7 LOWER-TIER FALLBACK</p>
              <p className="text-sm text-gray-400 leading-relaxed">Stacking without proximity falls to lower cascade positions (7 and 8): plain <strong className="text-white">STACKED BULL</strong> or <strong className="text-white">STACKED BEAR</strong>, no &#9889;. Still institutional confirmation, but you&apos;re not at the magnet yet &mdash; mark the cluster as a future entry zone. When price returns, the cascade will elevate to &#9889; tier automatically.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STACKING + CONSEQUENTIAL \u00B7 PEAK CONVICTION</p>
              <p className="text-sm text-gray-400 leading-relaxed">An FVG can be both consequential (with-trend, &#9733;) AND part of a stacked cluster. <strong className="text-white">Stacked bull gaps that are all consequential during a bull Ribbon stack is the highest-conviction FVG context CIPHER tracks</strong>. Multiple aggressive moves, all aligned with the trend, all clustered &mdash; the combined evidence for institutional intent is overwhelming.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SIZE INCREASES, STOP STAYS DISCIPLINED</p>
              <p className="text-sm text-gray-400 leading-relaxed">Operators trading STACKED &#9889; setups should <strong className="text-white">size up the entry</strong> (within risk parameters) because the expected continuation move is statistically larger. But stop discipline doesn&apos;t change &mdash; stop still goes just below the lowest stacked gap&apos;s original bottom (long) or above the highest stacked gap&apos;s original top (short). Larger size, tighter stop relative to dollar risk; the R:R improves naturally with stacking.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">A &#9889; in the Imbalance row is a peak-conviction setup. <strong className="text-white">Mark the cluster as a high-edge zone, scale up size, expect a larger continuation move on fill</strong>. STACKED &#9889; without proximity is a future setup &mdash; mark and wait. Plain STACKED (no &#9889;) is the cluster confirmation; AT-tier proximity is the trigger. The ladder from NEAR &rarr; STACKED &rarr; STACKED &#9889; tells you exactly where you are in the conviction hierarchy.</p>
          </div>
        </motion.div>
      </section>

      {/* === S11 — The 6-Line Tooltip === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; The 6-Line Tooltip</p>
          <h2 className="text-2xl font-extrabold mb-4">Hover any FVG. The full record is one mouse-over away.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The visual rendering is the at-a-glance read; the tooltip is the deep read. <strong className="text-amber-400">Every active FVG carries a 6-line metadata block accessible by hovering its fill % label</strong>. The tooltip isn&apos;t computed at hover-time &mdash; it&apos;s rendered into the FVG&apos;s record on every bar via <code className="text-white">label.set_tooltip()</code>, and hover just reveals what&apos;s already there. Six lines, two roles, four data points. Everything you need to make a sizing decision on a setup.</p>
          <FvgTooltipAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the hover glow pulse on the right-edge fill % label, then the tooltip card unfold. The example shows the tooltip output for a consequential bull FVG at 47% fill: <strong className="text-white">BULL FVG &#9733; Consequential</strong> as the header, then five data lines: <strong className="text-white">Original 4654.20-4640.10</strong>, <strong className="text-white">Remaining 4647.50-4640.10</strong>, <strong className="text-white">Fill 47%</strong>, <strong className="text-white">Age 24/100 bars</strong>, <strong className="text-white">Distance 0.3 ATR</strong>. Each line decodes a different dimension of the FVG&apos;s state.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">LINE 1 \u00B7 ROLE + CONSEQUENTIAL FLAG</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">BULL FVG \u2605 Consequential</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">The header line. Role (BULL FVG or BEAR FVG) plus the consequential indicator (<strong className="text-white">&#9733; Consequential</strong> for with-trend FVGs, plain <strong className="text-white">Non-consequential</strong> for against-trend). The consequential flag is the first thing the tooltip tells you because it&apos;s the most operational decision point: which sizing tier does this FVG warrant?</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">LINE 2 \u00B7 ORIGINAL BOUNDS</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">Original: 4654.20 \u2013 4640.10</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">The immutable historical bounds set at FVG birth. <strong className="text-white">These never change</strong>. Useful for: backtest reconstruction, sizing-stop calculations (stop sits beyond these, not the live), and comparing the original size against the current fill state.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">LINE 3 \u00B7 REMAINING BOUNDS</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">Remaining: 4647.50 \u2013 4640.10</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">The live shrinking bounds. The current frontier of the magnet. For a fully-fresh gap, these match the originals. As price fills the gap, the remaining bounds shrink. <strong className="text-white">Use these for entry placement</strong> &mdash; orders go to the live edge, not the original.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">LINE 4 \u00B7 FILL %</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">Fill: 47%</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">Numeric fill percentage. Same value displayed at the right-edge label, but in the tooltip for hover-confirmation. <strong className="text-white">Operationally: lower fill = fresher magnet, higher fill = nearly consumed</strong>. Use this directly for prioritisation when scanning multiple FVGs.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">LINE 5 \u00B7 AGE</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">Age: 24 / 100 bars</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">Bars elapsed since birth versus the 100-bar cap. <strong className="text-white">24/100 means the gap is young</strong> &mdash; institutional aggression is recent, plenty of life left. 89/100 means the gap is approaching age expiry; trade carefully or skip. The 100-bar denominator is fixed.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">LINE 6 \u00B7 DISTANCE</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">Distance: 0.3 ATR</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">How far current price sits from the FVG&apos;s nearest edge, in ATR units. <strong className="text-white">0.3 ATR is AT GAP territory</strong> (within 0.5 ATR threshold). Below 1.5 ATR is NEAR. Above 1.5 ATR is BETWEEN/DISTANT. The Command Center Imbalance row uses these same thresholds for cascade verdicts.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE TOOLTIP IS LIVE, NOT FROZEN</p>
              <p className="text-sm text-gray-400 leading-relaxed">All 6 fields recompute on every bar via the per-bar mitigation logic. Age increments. Fill % changes if the box shrinks. Distance changes as price moves. <strong className="text-white">The tooltip is a real-time snapshot, not a frozen value at FVG birth</strong>. Hover updates show the latest state on every refresh.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">HOVER WORKS ON THE FILL % LABEL</p>
              <p className="text-sm text-gray-400 leading-relaxed">Pine Script tooltips attach to label objects. CIPHER attaches the tooltip to the right-edge fill % label (<code className="text-white">fvg_l</code>). <strong className="text-white">Hover the label, not the box</strong>. The box itself doesn&apos;t carry tooltip metadata; the label does. If a gap is very fresh (under 5% filled, label hidden), the tooltip is unreachable until fill % climbs into visibility.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PAIR WITH THE IMBALANCE ROW FOR FULL CONTEXT</p>
              <p className="text-sm text-gray-400 leading-relaxed">The Command Center Imbalance row gives you nearest bull and bear gap distances + cascade verdict. The tooltip gives you the full record on any individual gap. <strong className="text-white">Glance at the row for &ldquo;where am I&rdquo; context; hover specific gaps for &ldquo;what is this gap&rdquo; details</strong>. The two are complementary &mdash; the row is the radar, the tooltip is the report.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">When a setup is forming near an FVG, hover the fill % label. <strong className="text-white">Read all six lines</strong>. Decide: is this a fresh consequential gap with low fill % and modest age (high-conviction entry), or an aged non-consequential gap at 75% fill (skip)? The tooltip is the full lookup. Use it before committing capital.</p>
          </div>
        </motion.div>
      </section>

      {/* === S12 — The Imbalance Row in the Command Center === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">12 &mdash; The Imbalance Row in the Command Center</p>
          <h2 className="text-2xl font-extrabold mb-4">Two distances, one verdict, eleven possible reads</h2>
          <p className="text-gray-400 leading-relaxed mb-6">All FVG state across the chart converges into a single row. <strong className="text-amber-400">Cell 2 displays the nearest bull and bear gap distances in ATR units, plus the nearest gap&apos;s fill percentage. Cell 3 displays one of eleven verdicts</strong> drawn from a hard-coded priority cascade. Three cells, three glances, complete imbalance awareness in under a second. This is CIPHER&apos;s deepest cascade &mdash; eleven levels &mdash; because gap geometry has more operational states than any other feature.</p>
          <ImbalanceRowCascadeAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the four demo states cycle. <strong className="text-white">Demo 1</strong>: bull dist N/A, bear dist 8.2 ATR &rarr; GAPS DISTANT (matches the 51%-filled bear gap in your screenshot Image 1). <strong className="text-white">Demo 2</strong>: stacked bear AT &rarr; STACKED BEAR &#9889; (matches the 33%-filled bear in Image 2). <strong className="text-white">Demo 3</strong>: bear gap 1.3 ATR away, 70% filled &rarr; NEAR BEAR GAP (matches Image 3). <strong className="text-white">Demo 4</strong>: bull stacked without proximity &rarr; STACKED BULL (matches Image 4). Each demo lights up the input dots that satisfy the cascade predicates; the first match wins.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE 11 VERDICTS, IN PRIORITY ORDER</p>
              <p className="text-sm text-gray-400 leading-relaxed">1. <strong className="text-white">NO ACTIVE GAPS</strong> &mdash; no FVGs at all. 2. <strong className="text-white">STACKED BULL &#9889;</strong> &mdash; stacked + AT bull. 3. <strong className="text-white">STACKED BEAR &#9889;</strong> &mdash; stacked + AT bear. 4. <strong className="text-white">GAP CLUSTER</strong> &mdash; AT both bull AND bear. 5. <strong className="text-white">AT BULL GAP</strong> &mdash; within 0.5 ATR of bull. 6. <strong className="text-white">AT BEAR GAP</strong> &mdash; within 0.5 ATR of bear. 7. <strong className="text-white">STACKED BULL</strong> &mdash; stacked but not at. 8. <strong className="text-white">STACKED BEAR</strong> &mdash; stacked but not at. 9. <strong className="text-white">NEAR BULL GAP</strong> &mdash; within 1.5 ATR. 10. <strong className="text-white">NEAR BEAR GAP</strong> &mdash; within 1.5 ATR. 11. <strong className="text-white">GAPS DISTANT</strong> &mdash; the silent default fallback.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CELL 2 FORMAT \u00B7 DUAL-DIRECTION + FILL %</p>
              <p className="text-sm text-gray-400 leading-relaxed">Cell 2 always displays both directions: <code className="text-white">\u25B2 [bull_dist] ATR \u25BC [bear_dist] ATR</code>. When the nearest gap has &gt;10% fill, the fill % appends in parens: <code className="text-white">(33% filled)</code>. <strong className="text-white">When a gap is missing on one side, that side shows an em-dash</strong>: <code className="text-white">\u25B2 \u2014 \u25BC 8.2 ATR</code>. The em-dash is the &ldquo;no active gap on this side&rdquo; signal.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">RANKED BY URGENCY, NOT FREQUENCY</p>
              <p className="text-sm text-gray-400 leading-relaxed">The order is not &ldquo;most common verdict on top&rdquo; &mdash; it&apos;s <strong className="text-white">most urgent verdict on top</strong>. NO ACTIVE GAPS is rare on a chart that&apos;s been running but sits at position 1 because it changes the entire trading picture (no magnets to plan around). STACKED &#9889; tiers sit just below because they&apos;re the highest-conviction operational contexts.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SUPPRESSION IS DELIBERATE</p>
              <p className="text-sm text-gray-400 leading-relaxed">When STACKED BULL &#9889; fires, NEAR BULL GAP is also true. The cascade lets only the higher-priority match through. <strong className="text-white">The trader gets the strongest signal, not a buffet of overlapping reads</strong>. Trust the cascade.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">CELL COLOURS BY VERDICT</p>
              <p className="text-sm text-gray-400 leading-relaxed">AT BULL / NEAR BULL / STACKED BULL render in <strong className="text-white">teal</strong> &mdash; bullish proximity. AT BEAR / NEAR BEAR / STACKED BEAR render in <strong className="text-white">magenta</strong> &mdash; bearish proximity. STACKED &#9889; tiers and GAP CLUSTER render in <strong className="text-white">amber</strong> &mdash; high-urgency. NO ACTIVE GAPS and GAPS DISTANT render faded white &mdash; nothing actionable. Colour itself is a signal &mdash; you can read the row at a glance without parsing the words.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">GAP CLUSTER \u00B7 RARE BUT POWERFUL</p>
              <p className="text-sm text-gray-400 leading-relaxed">When price is AT both a bull gap (above) AND a bear gap (below) simultaneously &mdash; both within 0.5 ATR &mdash; the cascade fires GAP CLUSTER. <strong className="text-white">This only happens in tight ranges with FVGs on both sides squeezed close to current price</strong>. Operationally: a major move is approaching; whichever gap fills first will produce an outsized continuation. Same playbook as DOUBLE COIL or DECISION ZONE: mark both, trade the breakout.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PAIR WITH OTHER ROWS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Imbalance row alone tells you gap geometry. Pair with other rows for full context: <strong className="text-white">AT BULL GAP + Ribbon BULL = high-probability bounce setup</strong>. AT BULL GAP + Ribbon BEAR = level under siege, expect break. NEAR BULL GAP + AT SUPPORT (Structure row) = confluence stacking, consider sizing up. The Imbalance row is one input in the multi-row Command Center read.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">EM-DASH ON ONE SIDE \u00B7 ASYMMETRIC IMBALANCE</p>
              <p className="text-sm text-gray-400 leading-relaxed">When cell 2 shows an em-dash on one side, it means <strong className="text-white">no active FVG exists in that direction</strong>. Common in strong trends where one side keeps getting filled while the other side keeps generating fresh gaps. Asymmetric reads tell you the chart&apos;s direction more than balanced reads do &mdash; an em-dash on the bear side with multiple bull gaps below is a structurally bullish picture.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Glance at cell 2 for the literal distances and fill state. Glance at cell 3 for the verdict. <strong className="text-white">Two seconds, complete imbalance awareness</strong>. Pair with the chart visuals for confirmation, but the row is the verdict. Trust the cascade.</p>
          </div>
        </motion.div>
      </section>

      {/* === S13 — Inputs === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">13 &mdash; The Imbalance Inputs</p>
          <h2 className="text-2xl font-extrabold mb-4">Two toggles, one intensity, calibrated defaults</h2>
          <p className="text-gray-400 leading-relaxed mb-6">CIPHER&apos;s Imbalance group is the simplest of the visual layer features &mdash; <strong className="text-amber-400">no lifecycle parameters exposed, no tunable thresholds, just a master toggle, an intensity selector, and a Command Center row toggle</strong>. The reasoning: FVG geometry is universal, and CIPHER&apos;s smart-mitigation logic doesn&apos;t benefit from per-user tuning. The fewer knobs, the harder it is to misconfigure.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">CIPHER IMBALANCE \u00B7 master toggle</p>
              <p className="text-sm text-gray-400 leading-relaxed">Default: OFF (the indicator ships off so the chart starts clean). When OFF, all FVG detection logic still runs internally &mdash; the Command Center Imbalance row still updates if its toggle is on, signal context tags still fire &mdash; but no FVG visuals are drawn on chart. <strong className="text-white">Turn this on first.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">IMBALANCE INTENSITY \u00B7 Subtle / Normal / Bold</p>
              <p className="text-sm text-gray-400 leading-relaxed">Default: Normal. Controls box opacity uniformly across all fill states. <strong className="text-white">Subtle adds +20 transparency to all gaps</strong>; Bold subtracts -20. The fade-by-fill curve from S07 is preserved across all intensities &mdash; only the base level shifts. Use Subtle on dense charts where Imbalance is one of many overlays; Bold when FVGs are your primary read.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">COMMAND CENTER IMBALANCE ROW \u00B7 default OFF</p>
              <p className="text-sm text-gray-400 leading-relaxed">Separately, the Command Center input group has an Imbalance row toggle. Default OFF (most CC rows ship off to keep the panel compact). <strong className="text-white">Turn this on too</strong> &mdash; the Imbalance row is the deepest cascade in CIPHER (11 verdicts) and operationally critical for FVG-aware trading.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">NO LIFECYCLE PARAMETERS EXPOSED</p>
              <p className="text-sm text-gray-400 leading-relaxed">Unlike Cipher Structure (which exposes pivot_len, max_zones, max_tests, max_age), Imbalance hardcodes its lifecycle: <strong className="text-white">3 birth gates (geometric + 0.3 ATR + 1.2x volume), 100-bar age cap, 8 maximum active FVGs, 2 ATR stacked threshold</strong>. All calibrated empirically; none tunable. The reasoning: gap detection is geometrically universal, and tuning these thresholds creates worse outcomes (either noise floods or significant gaps get filtered out).</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">PRESETS THAT INCLUDE IMBALANCE</p>
              <p className="text-sm text-gray-400 leading-relaxed">The Preset dropdown at the top of the inputs has six configurations. <strong className="text-white">Scalper</strong> and <strong className="text-white">Reversal</strong> presets enable Cipher Imbalance. Other presets default Imbalance OFF to keep their respective visual layers clean. Presets override individual toggles &mdash; set Preset to None for full manual control.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">RECOMMENDED OPERATOR SETUP</p>
              <p className="text-sm text-gray-400 leading-relaxed">Cipher Imbalance ON, Intensity Normal. Command Center Imbalance row ON. <strong className="text-white">Three toggles, calibrated defaults, no parameter tuning required.</strong> If FVG boxes feel too prominent on a busy chart, switch to Subtle; if FVGs are your primary trading signal, switch to Bold. The math doesn&apos;t change &mdash; only visibility.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DON&apos;T STACK ALL VISUAL LAYERS BOLD</p>
              <p className="text-sm text-gray-400 leading-relaxed">Cipher Ribbon Bold + Cipher Structure Bold + Cipher Spine Bold + Cipher Imbalance Bold creates a chart where the candles are buried under overlays. <strong className="text-white">Pick one or two visual layers as primary</strong> (your specialty) and dim the others to Subtle. For FVG-focused trading: Imbalance Bold + Ribbon Subtle + Structure Subtle + Spine Subtle. The hierarchy makes the chart readable.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">IMBALANCE INTERACTS WITH OTHER FEATURES</p>
              <p className="text-sm text-gray-400 leading-relaxed">The consequential flag depends on Cipher Ribbon&apos;s stack direction. Signal context tags reference Imbalance via <code className="text-white">ctx_at_fvg_bull</code> and <code className="text-white">ctx_at_fvg_bear</code> booleans. <strong className="text-white">Imbalance is part of the integrated CIPHER ecosystem; turning it off disables several signal-context features even if the row toggle is still on</strong>. For full operator capability, leave the master toggle ON.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Two master toggles, one intensity, no thresholds. <strong className="text-white">Defaults are calibrated.</strong> Turn the master and CC row toggles on, leave Intensity at Normal. Tune visibility only if your chart has too many or too few visual layers competing. The math doesn&apos;t change &mdash; only what you can see does.</p>
          </div>
        </motion.div>
      </section>

      {/* === S14 — Trading FVGs === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">14 &mdash; Trading FVGs</p>
          <h2 className="text-2xl font-extrabold mb-4">Entry at the live edge. Stop beyond original. Target the next gap.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">FVGs aren&apos;t entry triggers on their own &mdash; they&apos;re <strong className="text-amber-400">positional context</strong>. The Signal Engine (PX, TS) fires the actual entry; the FVG defines where the setup happens, where the stop goes, and what the target is. The pair&apos;s job is operational geometry: gaps are entry zones, original bounds are stop references, opposite-direction gaps are targets.</p>
          <TradingFvgAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the four-stage trade lifecycle. <strong className="text-white">Stage 1 \u00B7 Approach</strong>: price descends toward an active bull FVG, Spine confirms healthy bull momentum. <strong className="text-white">Stage 2 \u00B7 Entry</strong>: price touches the live remaining edge of the bull gap, PX/TS fires, entry placed with stop just BELOW the original bottom. <strong className="text-white">Stage 3 \u00B7 Runner</strong>: price reverses upward, bull gap fills 60%, partial scale-out triggered. <strong className="text-white">Stage 4 \u00B7 Exit</strong>: price hits a bear FVG above as the magnet-to-magnet target. The whole trade was geometric: gap to gap, with the Signal Engine timing the entry and the visual layers managing the journey.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">DECISION 1 \u00B7 ENTRY ELIGIBILITY</p>
              <p className="text-sm text-gray-400 leading-relaxed">Before taking any signal, check the Imbalance row. <strong className="text-white">AT BULL GAP or NEAR BULL GAP = bounce-long setups eligible</strong> (price returning to fill an unfinished bull gap). AT BEAR GAP or NEAR BEAR GAP = rejection-short setups eligible. STACKED &#9889; = sized-up setup eligible. GAPS DISTANT = no FVG-based context; rely on signal engine alone or other visual layers.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DECISION 2 \u00B7 ENTRY EDGE \u00B7 LIVE NOT ORIGINAL</p>
              <p className="text-sm text-gray-400 leading-relaxed">Entries target the <strong className="text-white">live remaining edge</strong>, not the original. For a partially-filled bull FVG with 47% fill, the live top is where price will hit and react first &mdash; that&apos;s the entry zone. The original top is operationally stale; price already passed through it during the prior fill. <strong className="text-white">Aim at the live frontier; the chart already shows it</strong>.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DECISION 3 \u00B7 STOP \u00B7 BEYOND ORIGINAL BOUND</p>
              <p className="text-sm text-gray-400 leading-relaxed">Stops go just BEYOND the FVG&apos;s <strong className="text-white">original bottom</strong> (long, bull gap) or <strong className="text-white">original top</strong> (short, bear gap), with a small ATR buffer. Why original and not live? <strong className="text-white">A genuine gap break means price closed beyond the original geometric edge, which retires the FVG entirely</strong>. A wick into the gap that just shrinks the live bound isn&apos;t a structural failure &mdash; the gap is still an active magnet. Stops beyond the original only trigger on real failures.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DECISION 4 \u00B7 TARGET \u00B7 OPPOSITE-DIRECTION FVG</p>
              <p className="text-sm text-gray-400 leading-relaxed">Targets are the <strong className="text-white">nearest opposite-direction FVG</strong>: long entry from a bull gap targets the next bear gap above; short entry from a bear gap targets the next bull gap below. The reasoning: markets often trade gap-to-gap, with each gap acting as a magnet. <strong className="text-white">If no opposite-direction FVG exists, target the next major Structure level</strong> (S/R) instead. Trading gap-to-gap captures the natural rhythm of institutional rebalancing.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">SCALE OUT AS FILL % CLIMBS</p>
              <p className="text-sm text-gray-400 leading-relaxed">After entry, the bull gap behind you starts filling as you run away from it. <strong className="text-white">Scale out a portion when fill % crosses 50%</strong> &mdash; the gap is now half-consumed, your trade has captured meaningful range. Hold the runner for the bear-gap target. <strong className="text-white">Full scale-out at 80%+ fill</strong> if you don&apos;t want to hold through deeper retracement risk.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STACKED &#9889; ENTRIES SIZE UP</p>
              <p className="text-sm text-gray-400 leading-relaxed">Setups in STACKED &#9889; tier fire with the highest expected continuation move. <strong className="text-white">Size these entries 1.5x-2x your standard FVG size</strong> within risk parameters. Stop discipline doesn&apos;t change (still beyond original of nearest stacked gap), but the larger expected move means the R:R improves naturally with bigger size.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CONSEQUENTIAL &#9733; PREFERENCES</p>
              <p className="text-sm text-gray-400 leading-relaxed">When multiple FVGs are eligible (e.g. multiple NEAR BULL GAPs in different price ranges), <strong className="text-white">prefer the consequential ones for full size</strong>. Non-consequential gaps get smaller positions or skipped entirely. The visual hierarchy (consequential = brighter) is the engine&apos;s priority signal &mdash; trust it as a sizing input.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">AGE GATES THE ENTRY</p>
              <p className="text-sm text-gray-400 leading-relaxed">An FVG approaching age 90+ is <strong className="text-white">forgotten territory</strong>. Skip new entries on these. The institutional aggression that birthed the gap has been overwritten by 90 bars of new structure. <strong className="text-white">Trade fresh-to-mid age (under 60 bars) for full conviction; treat 60-90 as caution; skip 90+</strong>.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">FVGS PAIR WITH STRUCTURE</p>
              <p className="text-sm text-gray-400 leading-relaxed">An FVG that aligns with a Cipher Structure level is a <strong className="text-white">confluence setup</strong>. AT BULL GAP + AT SUPPORT = two magnets pointing the same direction at the same price. These are the highest-edge setups in CIPHER&apos;s visual stack. <strong className="text-white">Size up confluence setups; treat them as primary entries even when other layers are uncertain</strong>.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FVGS WITHOUT THE SIGNAL ENGINE</p>
              <p className="text-sm text-gray-400 leading-relaxed">CIPHER&apos;s philosophy is signal-confirmed entries, but advanced operators can <strong className="text-white">trade FVG bounces without a PX/TS signal</strong> when consequential gaps + supportive Spine + Ribbon + low fill % all align. The trade is &ldquo;pre-signal&rdquo; &mdash; you&apos;re betting the signal will come at the bounce. Higher risk, but legitimate when the convergence is strong. <strong className="text-white">Reduce size by 30-50%</strong> versus signal-confirmed entries to compensate.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">GAP CLUSTER BREAKOUT PLAYBOOK</p>
              <p className="text-sm text-gray-400 leading-relaxed">When the row reads GAP CLUSTER (AT both bull and bear simultaneously), the trade pattern flips from bounce to breakout: <strong className="text-white">mark both gap edges; first close beyond either is the breakout entry; stop opposite side; target the next major FVG or Structure level</strong>. Same pattern as DOUBLE COIL or DECISION ZONE. Clusters are pre-breakout, not bounce zones.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE COMPLETE TRADE</p>
            <p className="text-sm text-gray-400 leading-relaxed">Imbalance row says AT BULL GAP &#9889;. Spine is teal. Tooltip shows consequential, age 18, fill 12%. Signal engine fires PX in agreement. <strong className="text-white">Enter</strong> at the live remaining edge with stop just below original bottom. <strong className="text-white">Hold</strong> while gap fills behind you. <strong className="text-white">Scale out</strong> at 50% fill. <strong className="text-white">Exit</strong> at the nearest bear gap above as gap-to-gap target. Reset.</p>
          </div>
        </motion.div>
      </section>

      {/* === S15 — 6 Mistakes === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">15 &mdash; The Six Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-4">How operators mis-read FVGs &mdash; and the corrections</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Six failure patterns appear consistently in early Imbalance work. Each has a specific correction. <strong className="text-amber-400">If you find yourself doing any of these, return to the relevant section above.</strong></p>

          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 mb-4">
            <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 1 \u00B7 CHASING 90%-FILLED GAPS</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-2"><strong className="text-white">The pattern:</strong> you spot a faded box on chart, treat it as a normal entry zone, and enter at the live edge expecting a clean bounce. Price barely reacts before fully filling and deleting the gap, taking your stop with it.</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-2"><strong className="text-white">Why it fails:</strong> a 90%-filled gap has 10% of its original magnet strength left. The institutional intent was 90% consumed already; the remaining sliver isn&apos;t structural. Price punches through with minimal resistance.</p>
            <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-amber-400">The correction:</strong> prefer fresh gaps (under 30% fill) for full-conviction entries. 30-60% is medium conviction. 60-90% is skip territory unless extreme confluence with other layers. The fade-by-fill curve from S07 visually flags this; trust it. See Section 7.</p>
          </div>

          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 mb-4">
            <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 2 \u00B7 IGNORING THE VOLUME GATE STORY</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-2"><strong className="text-white">The pattern:</strong> you see an FVG box on chart and treat it identical to FVGs from other indicators. You don&apos;t understand the three birth gates and apply retail FVG patterns that often produce noise.</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-2"><strong className="text-white">Why it fails:</strong> CIPHER&apos;s gates filter 30-50% of geometric gaps that retail indicators paint. The remaining gaps are institutionally significant by design. <strong className="text-white">Treating CIPHER FVGs like retail FVGs ignores the quality filter</strong> that makes CIPHER&apos;s read trustworthy in the first place.</p>
            <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-amber-400">The correction:</strong> trust that every CIPHER FVG passed all three gates &mdash; it&apos;s real. Trade them with conviction; don&apos;t demand additional volume confirmation that&apos;s already baked in. See Section 3.</p>
          </div>

          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 mb-4">
            <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 3 \u00B7 TREATING NON-CONSEQUENTIAL AS EQUAL</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-2"><strong className="text-white">The pattern:</strong> you trade every FVG with the same size, ignoring the consequential star. Your win rate is fine on consequential gaps but atrocious on non-consequential ones, and the average is mediocre.</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-2"><strong className="text-white">Why it fails:</strong> consequential FVGs (with-trend) statistically fill at higher rates than non-consequential ones. Sizing them equally means you&apos;re over-exposed on the worse setups and under-exposed on the better ones.</p>
            <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-amber-400">The correction:</strong> hover the tooltip. If you see &#9733; Consequential, full size. If non-consequential, half size or skip. The visual brightness boost is the engine telling you which is which &mdash; trust it as a sizing input. See Section 8.</p>
          </div>

          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 mb-4">
            <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 4 \u00B7 MISSING THE STACKED CONTEXT</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-2"><strong className="text-white">The pattern:</strong> you trade an AT BULL GAP setup with normal size, not noticing the row actually reads STACKED BULL &#9889;. Your fill rate is fine but you&apos;re leaving meaningful R on the table because the expected continuation was much larger.</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-2"><strong className="text-white">Why it fails:</strong> stacked setups produce statistically larger continuation moves. Sizing them like ordinary AT GAP setups means under-monetising the highest-conviction context CIPHER tracks.</p>
            <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-amber-400">The correction:</strong> read cell 3 carefully. STACKED &#9889; deserves 1.5x-2x size. The lightning bolt isn&apos;t decoration; it&apos;s a tier escalation. See Section 10.</p>
          </div>

          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 mb-4">
            <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 5 \u00B7 STOPPING AT THE LIVE EDGE</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-2"><strong className="text-white">The pattern:</strong> long entry on bull FVG bounce. You place the stop at the live remaining bottom. Price wicks through to the original bottom (which is below the live), takes your stop, then immediately recovers and runs your target.</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-2"><strong className="text-white">Why it fails:</strong> live bounds are mutable; original bounds are structural. Price routinely wicks deeper into a partially-filled gap before reversing &mdash; that&apos;s why CIPHER tracks both. A stop at the live edge gets caught by these deeper-fill wicks; only a stop beyond the original signals a real failure.</p>
            <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-amber-400">The correction:</strong> stops go beyond the ORIGINAL bound, not the live. Below original bottom for longs; above original top for shorts. With a small ATR buffer. See Section 14, Mistake 5 specifically.</p>
          </div>

          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 mb-6">
            <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 6 \u00B7 READING FVGS WITHOUT TREND FILTER</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-2"><strong className="text-white">The pattern:</strong> you focus exclusively on FVGs &mdash; entry, stop, target all gap-driven &mdash; without checking the Ribbon stack or Spine state. You take long bounce entries on bull gaps during clean bear trends and watch them fail.</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-2"><strong className="text-white">Why it fails:</strong> FVGs without trend context are gap-geometry without market direction. A bull gap during a strong bear trend is a counter-trend setup; bounces work but at much lower fill rates than with-trend bounces. The Ribbon stack and Spine tell you which setups have the wind behind them.</p>
            <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-amber-400">The correction:</strong> always pair Imbalance with Ribbon and Spine. With-trend FVGs are full size; against-trend FVGs need additional confirmation or reduced size. The consequential flag automates part of this filtering, but operators should verify the integration manually. See Section 8 and Section 14.</p>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE PATTERN BENEATH THE PATTERNS</p>
            <p className="text-sm text-gray-400 leading-relaxed">Five of the six mistakes share one root: <strong className="text-white">treating FVGs as standalone signals rather than positional context</strong>. Mistakes 1, 2, 5 are about misreading the gap itself. Mistakes 3, 4 are about misreading the conviction tier. Mistake 6 is about ignoring the broader market read. <strong className="text-white">FVGs are magnets that draw price; they don&apos;t fire entries on their own</strong>. The Signal Engine times the entry; the Ribbon and Spine confirm direction; the FVG provides the geometry. Read all four together, and most failure patterns dissolve.</p>
          </div>
        </motion.div>
      </section>

      {/* === CHEAT SHEET === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">Cheat Sheet</p>
          <h2 className="text-2xl font-extrabold mb-4">Cipher Imbalance, condensed</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Print-it-out reference. Each section below distills one concept from the lesson into a single read-aloud sentence plus the one number or rule you actually need at the moment of decision.</p>
          <div className="p-6 rounded-2xl glass-card">
            <div className="pb-4 border-b border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE 3-CANDLE FVG GEOMETRY</p>
              <p className="text-sm text-gray-400 leading-relaxed">Bullish: low &gt; high[2]. Bearish: high &lt; low[2]. The middle candle is the aggressor; current and 2-bars-ago define the gap edges.</p>
            </div>
            <div className="py-4 border-b border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE THREE BIRTH GATES</p>
              <p className="text-sm text-gray-400 leading-relaxed">All three required: (1) geometric gap, (2) gap_size &gt; 0.3 ATR, (3) middle candle volume &gt; 1.2&times; average. CIPHER refuses any FVG that fails any gate.</p>
            </div>
            <div className="py-4 border-b border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE 11 PARALLEL ARRAYS</p>
              <p className="text-sm text-gray-400 leading-relaxed">10 stored + 1 derived. Immutable: orig_top, orig_bot. Live: top, bot. Plus dir, bar, conseq, box, mid, lbl. Age = bar_index &minus; bar.</p>
            </div>
            <div className="py-4 border-b border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE SHRINK FORMULA</p>
              <p className="text-sm text-gray-400 leading-relaxed">new_top := math.min(ft, low) for bull. The frontier only retreats inward. The 50% midline anchors to the ORIGINAL bounds, never moves.</p>
            </div>
            <div className="py-4 border-b border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CONSEQUENTIAL FLAG</p>
              <p className="text-sm text-gray-400 leading-relaxed">Set at birth: conseq = ribbon_dir == fvg_dir. With-trend = &#9733; + brighter rendering (-5 transparency). Sizing input: full size on consequential, reduced on non.</p>
            </div>
            <div className="py-4 border-b border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">LIFECYCLE: THREE PATHS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Full fill (low &lt;= fb / high &gt;= ft), age &gt; 100 bars, or pruned (FIFO at fvg_max=8). All three permanent &mdash; box + midline + label all delete simultaneously.</p>
            </div>
            <div className="py-4 border-b border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STACKED &#9889; DETECTION</p>
              <p className="text-sm text-gray-400 leading-relaxed">2+ same-direction FVGs within 2 ATR fires fvg_stacked. STACKED &#9889; (with AT) sits at cascade tier 2-3; size 1.5x-2x normal.</p>
            </div>
            <div className="py-4 border-b border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">IMBALANCE ROW VERDICTS</p>
              <p className="text-sm text-gray-400 leading-relaxed">11 levels: NO ACTIVE GAPS \u2192 STACKED &#9889; tier \u2192 GAP CLUSTER \u2192 AT \u2192 STACKED \u2192 NEAR \u2192 GAPS DISTANT. AT = 0.5 ATR, NEAR = 1.5 ATR.</p>
            </div>
            <div className="pt-4">
              <p className="text-xs font-bold text-amber-400 mb-1">THE TRADING RULES</p>
              <p className="text-sm text-gray-400 leading-relaxed">Entry at live edge + signal confirms. Stop just BEYOND ORIGINAL bound (not live). Scale out at 50% fill. Target opposite-direction FVG. Size by consequential + stacked tier.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S16 — Scenario Game === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">16 &mdash; Scenario Game</p>
          <h2 className="text-2xl font-extrabold mb-4">Read Imbalance Like an Operator</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Five scenarios. Each puts you in front of a real Command Center read &mdash; tooltip metadata, cascade verdicts, smart mitigation states, stacked alerts, gap clusters, target hits. Pick the right call. Explanations appear after every answer, including the wrong ones.</p>
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
                  <p className="text-xs text-gray-400 mt-1">{finalScore >= 4 ? 'Operator-grade Imbalance reading installed. You see the chart\u2019s outstanding promises and trade them with discipline.' : finalScore >= 3 ? 'Solid grasp. Re-read the smart mitigation (S05), original-vs-remaining (S06), consequential star (S08), stacked detection (S10), and trading playbook (S14) before the quiz.' : 'Re-study the birth gates (S03), parallel arrays (S04), smart mitigation (S05), trading playbook (S14), and the six mistakes (S15) before the quiz.'}</p>
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
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 11.18: Cipher Imbalance</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-sky-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Imbalance Operator &mdash;</p>
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
