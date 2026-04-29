// app/academy/lesson/cipher-structure-spine/page.tsx
// ATLAS Academy — Lesson 11.17: Cipher Structure + Spine [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 11 · CIPHER
// The Levels and the Reader — Where you are, and how you're doing there.
// Covers: Structure 10-array lifecycle, pivot detection, polarity flips,
//         confluence scoring, strength-adaptive rendering, level tooltip,
//         Spine dual-midpoint blend, health-adaptive bands, spine-price gap,
//         the Structure Command Center row, inputs, trading, mistakes.
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Crown } from 'lucide-react';

// ============================================================
// GAME ROUNDS — 5 scenario-based Structure + Spine challenges
// String-id answers, per-option explanations (teaches on wrong answers).
// Covers: tooltip reading, polarity flip recognition, cascade verdict
//         interpretation, stop placement, trend-aware AMBER warning.
// ============================================================
const gameRounds = [
  {
    id: 'r1',
    scenario:
      'You are watching XAUUSD 1D. You hover the test dot on a resistance level just above price and the tooltip reads: <strong class="text-white">RESISTANCE 5602.225</strong> &middot; <strong class="text-white">Age 62 bars</strong> &middot; <strong class="text-white">Tests 1/4</strong> &middot; <strong class="text-white">Strength Strong (2/3)</strong> &middot; <strong class="text-white">Confluence 1 factor</strong> &middot; <strong class="text-white">Distance 8.1 ATR</strong>. The Ribbon stack is bullish.',
    prompt: 'How should you treat this level right now?',
    options: [
      {
        id: 'a',
        text: 'Set a sell limit at 5602.225 immediately &mdash; Strong resistance, take the rejection.',
        correct: false,
        explain:
          'The Distance is 8.1 ATR. The level is real, but it\u2019s nowhere near current price. Setting orders at distant levels means the trade conditions could change drastically before price gets there &mdash; the Ribbon could flip, the level could test and weaken further, or volatility could shift. AT/NEAR setups (within 1.5 ATR) are tradeable; 8.1 ATR distance is a magnet, not an entry zone.',
      },
      {
        id: 'b',
        text: 'Note the level as a future target/magnet but take no action now &mdash; wait for price to come within 1.5 ATR.',
        correct: true,
        explain:
          'Correct read. Distance 8.1 ATR puts this firmly in BETWEEN LEVELS territory, not NEAR/AT. The level is a Strong magnet for future price action but no setup exists at this distance. Mark it mentally, watch the Spine for momentum direction, and wait for proximity. Bullish stack + distant resistance = the level becomes a target to ride the trend toward, not a fade entry.',
      },
      {
        id: 'c',
        text: 'Skip the level entirely &mdash; only 1/4 tests and 1 confluence factor, weak evidence.',
        correct: false,
        explain:
          'Strength Strong (2/3) means the level is meaningfully reinforced. The strength formula is tests + confluence, capped at 3 &mdash; this level scored 2 from one test plus one confluence factor. \u201cWeak evidence\u201d is the wrong characterization of Strong. Don\u2019t ignore Strong levels; just don\u2019t trade them at 8.1 ATR distance.',
      },
      {
        id: 'd',
        text: 'Treat 8.1 ATR as DETACHED Spine state &mdash; the trend is dying.',
        correct: false,
        explain:
          'You\u2019re mixing two readings. 8.1 ATR is the distance from current price to a structural level. The DETACHED Spine state describes the gap between price and the Spine line, not the gap to a level. These are independent reads. The level being far doesn\u2019t imply Spine drift &mdash; check the Spine\u2019s position relative to price separately.',
      },
    ],
  },
  {
    id: 'r2',
    scenario:
      'XAUUSD 5m. The Structure row reads <strong class="text-amber-400">S 0.1 ATR  R 2.9 ATR</strong> &rarr; <strong class="text-white">AT SUPPORT</strong>. The Ribbon stack is bull. Cipher Spine is teal and tracking price closely. A Pulse Cross long signal just fired with 3/4 conviction.',
    prompt: 'What is the right entry plan?',
    options: [
      {
        id: 'a',
        text: 'Take the long with stop exactly at the support level price.',
        correct: false,
        explain:
          'This is mistake 4 from section 15. Stops AT the level get whipsawed on every minor wick &mdash; price punches 0.05 ATR through, hits your stop, then immediately recovers. The level is the line of defense; your stop sits one buffer past it.',
      },
      {
        id: 'b',
        text: 'Take the long with stop just BELOW the support level (0.2-0.5 ATR buffer below).',
        correct: true,
        explain:
          'Correct entry pattern. AT SUPPORT + bull stack + healthy Spine + qualified PX signal = a textbook bounce setup. Stop goes BELOW the level with a small ATR buffer &mdash; only triggers on a genuine breakdown, not on noise wicks. This is the Section 14 playbook executed cleanly.',
      },
      {
        id: 'c',
        text: 'Wait for the Structure row to read NEAR SUPPORT before entering &mdash; AT SUPPORT means the level might break.',
        correct: false,
        explain:
          'Reversed. AT SUPPORT (within 0.5 ATR) is a stronger setup than NEAR SUPPORT (within 1.5 ATR) &mdash; price is right at the bounce point with the smallest possible distance to risk. Combined with a bullish stack and healthy Spine, this is the highest-probability bounce entry, not a warning.',
      },
      {
        id: 'd',
        text: 'Skip the trade &mdash; the support is too close to risk a meaningful position size.',
        correct: false,
        explain:
          'AT SUPPORT means the stop distance is small, which actually allows for LARGER position size at the same dollar risk &mdash; the inverse of what this option claims. Tight risk + high probability + qualified signal is the operational ideal, not a reason to skip.',
      },
    ],
  },
  {
    id: 'r3',
    scenario:
      'You\u2019ve been long EURUSD 1H from a clean PX entry 12 bars ago, +1.6R in profit. The Spine has just turned amber and is now visibly drifting away from price &mdash; you measure roughly 1.0 ATR gap. The Structure row still reads BETWEEN LEVELS. The Ribbon is still bull-stacked.',
    prompt: 'What is the right action?',
    options: [
      {
        id: 'a',
        text: 'Hold &mdash; the Ribbon stack is still bull, the level read is BETWEEN LEVELS (no immediate threat), let the trade run.',
        correct: false,
        explain:
          'The Spine is doing its job: warning you that momentum is dying before the Ribbon stack flips. Spine_detached fires at >1.0 ATR gap; you\u2019re right at that threshold. The Ribbon will eventually flip, but by then your +1.6R could be gone. Spine drift is the early-exit signal precisely so you can act ahead of the herd.',
      },
      {
        id: 'b',
        text: 'Tighten stop to break-even and prepare to exit on the next adverse close.',
        correct: true,
        explain:
          'Correct. Spine drifting + amber color = the engine\u2019s confidence in the move is fading. The Section 14 playbook says: tighten on LOOSE/DRIFTING, exit on DETACHED or amber Spine. You\u2019re between LOOSE and DRIFTING right at the spine_detached threshold; locking in BE protects the +1.6R you\u2019ve earned without immediately exiting in case the trend reasserts.',
      },
      {
        id: 'c',
        text: 'Reverse to short immediately &mdash; Spine drift is a counter-trend entry signal.',
        correct: false,
        explain:
          'This is mistake 5 from section 15. Spine drift is a warning, not a counter-trend entry signal. Trends often run with the Spine lagging because the 21-bar smoothing can\u2019t keep up &mdash; a price that accelerates upward and a Spine that lags don\u2019t mean reversion is imminent. Use Spine drift to leave the party, not to bet against it.',
      },
      {
        id: 'd',
        text: 'Add to the long &mdash; the Spine drift means we\u2019re in DETACHED territory and mean reversion will return us to the Spine.',
        correct: false,
        explain:
          'Worst possible action. DETACHED means price is on fumes, not that mean reversion is imminent. Adding to a position when the Spine has decoupled increases exposure exactly when the engine has lost confidence. The mean-reversion read works for ENTRIES near outer bands, not for SCALING UP existing trends in detachment.',
      },
    ],
  },
  {
    id: 'r4',
    scenario:
      'BTCUSD 1H. A support level you\u2019ve been watching for the last 3 days just broke &mdash; price closed below it on consecutive bars. The level visual on chart has changed: the line color flipped from teal to magenta, the test dots are gone, replaced by a single <strong class="text-white">&#10227;</strong> glyph. The tooltip now reads &ldquo;<strong class="text-white">RESISTANCE 67400</strong> (flipped 1x)&rdquo;.',
    prompt: 'What does this mean and how should you treat it from here?',
    options: [
      {
        id: 'a',
        text: 'The level is dead &mdash; CIPHER kept the visual on chart by mistake, ignore it.',
        correct: false,
        explain:
          'This is mistake 2 from section 15. CIPHER doesn\u2019t throw away broken levels &mdash; it flips their role. The \u27F3 glyph and the &ldquo;flipped 1x&rdquo; tooltip suffix are explicit indicators that the level converted from support to resistance. The visual is intentional, not a bug. Treating broken levels as dead misses some of the highest-conviction trades CIPHER offers.',
      },
      {
        id: 'b',
        text: 'The level has flipped polarity &mdash; it\u2019s now a battle-tested resistance level. Trade rejections from below with confidence.',
        correct: true,
        explain:
          'Correct. The polarity flip is the Section 5 mechanic: two consecutive closes beyond the level + sufficient age + flip count under cap = role inversion. The level\u2019s record is preserved, role is updated, and a 10-bar cooldown begins. Flipped levels are battle-tested in BOTH directions historically &mdash; defended as support, then defended as resistance. These are operationally the strongest levels CIPHER tracks.',
      },
      {
        id: 'c',
        text: 'The level can\u2019t be trusted because it failed once &mdash; one break means the institutional liquidity is gone.',
        correct: false,
        explain:
          'Reversed reading. A flip is not a failure; it\u2019s a role change. Liquidity that gets blown through one direction frequently defends the price level from the new direction afterward &mdash; the same orders that used to bid the level now offer it. \u201cFlipped 1x\u201d levels have proven defense in both directions.',
      },
      {
        id: 'd',
        text: 'The level will flip again imminently &mdash; the &#10227; glyph means oscillation is about to start.',
        correct: false,
        explain:
          'The &#10227; glyph just marks the most recent role change, not pending oscillation. CIPHER enforces a 10-bar cooldown after each flip and a maximum of 2 flips per level &mdash; the engine specifically prevents oscillation. After the flip, expect the level to defend its new role; the cooldown timer protects against immediate re-flip.',
      },
    ],
  },
  {
    id: 'r5',
    scenario:
      'XAUUSD 4h. Strong bear stack on the Ribbon. Price is descending toward a Strong support level (Strength 3/3, Confluence 2 factors). As price approaches, you notice the support box on chart is glowing AMBER, not teal. The Structure row reads NEAR SUPPORT.',
    prompt: 'What is the right call here?',
    options: [
      {
        id: 'a',
        text: 'Take the bounce long &mdash; Strong support with confluence is a high-edge setup, the AMBER is just a visual.',
        correct: false,
        explain:
          'This is mistake 3 from section 15 exactly. The AMBER color is not decorative &mdash; it\u2019s CIPHER\u2019s trend-aware proximity warning specifically meaning \u201cthis level is under siege from the trend and is more likely to break than hold.\u201d Strong levels aren\u2019t exempt; the warning fires regardless of strength tier when the stack opposes the level.',
      },
      {
        id: 'b',
        text: 'Skip the bounce long. Treat the level as a breakdown candidate and wait for either: (a) confirmed break for short continuation, or (b) Ribbon stack flip for a confirmed reversal.',
        correct: true,
        explain:
          'Correct. The trend-aware AMBER warning is the engine telling you the level\u2019s odds of holding are reduced when momentum opposes it. The Section 7 mechanic. You don\u2019t fight the warning &mdash; you wait for either confirmation of the break (short setup) or stack flip (then a counter-trend bounce becomes valid). Patience is the edge, especially against bear strength approaching support.',
      },
      {
        id: 'c',
        text: 'Take the bounce long but with a tighter stop at the level itself, since the level is high-strength.',
        correct: false,
        explain:
          'Two mistakes combined. First, taking the bounce long ignores the AMBER warning (mistake 3). Second, stop at the level (not beyond) gets whipsawed (mistake 4). High strength doesn\u2019t override either rule &mdash; it just means IF the level holds, the bounce will be cleaner. But the AMBER warning is precisely flagging that the holding probability is reduced.',
      },
      {
        id: 'd',
        text: 'Reverse the trend &mdash; take a long because Strong support always overpowers Ribbon stacks at the moment of contact.',
        correct: false,
        explain:
          'No structural truth supports this. Strong supports don\u2019t \u201calways\u201d overpower trends &mdash; that\u2019s exactly what the AMBER warning exists to flag. Counter-trend bounces against established stacks have lower historical edge. Stack alignment is a primary filter; the level is a secondary read. Lead with the stack.',
      },
    ],
  },
];

// ============================================================
// QUIZ — 8 multiple choice questions on Structure + Spine
// Covers: Pine fields, lifecycle, polarity flip math, confluence,
//         strength rendering, tooltip, Spine formula, gap states,
//         cascade verdicts, trading rules.
// ============================================================
const quizQuestions = [
  {
    id: 'q1',
    question: 'How many parallel arrays does CIPHER track per level, and what do they store?',
    options: [
      { id: 'a', text: 'Three arrays: price, role, and visual line reference.', correct: false },
      { id: 'b', text: 'Ten arrays: 6 scalar fields (price, bar, dir, tests, flips, flip_bar) plus 4 visual primitives (box, line, dot, price_lbl).', correct: true },
      { id: 'c', text: 'A single struct with all level data combined.', correct: false },
      { id: 'd', text: 'Five arrays: price, age, tests, strength, and visual.', correct: false },
    ],
    explain:
      'Each level is an indexed row across 10 parallel arrays \u2014 6 scalars track the data state, 4 primitives track the Pine drawing objects (box, line, two labels). When a level retires, all 10 arrays drop the corresponding row in sync. Pine doesn\u2019t support full UDTs in this codepath, so the relational record lives in the index alignment. (Section 2.)',
  },
  {
    id: 'q2',
    question: 'Under what conditions does a level flip polarity (support becomes resistance, or vice versa)?',
    options: [
      { id: 'a', text: 'A single bar closes beyond the level.', correct: false },
      { id: 'b', text: 'The level has been tested 4 times.', correct: false },
      { id: 'c', text: 'Two consecutive bar closes beyond the level + level is at least pivot_len + 3 bars old + flip count under 2 + 10-bar cooldown since last flip has passed.', correct: true },
      { id: 'd', text: 'A signal from the Ribbon engine confirms the breakout.', correct: false },
    ],
    explain:
      'The flip rule has 4 gates that all must pass simultaneously. Two-close-confirmation filters wick noise. Minimum age prevents premature flips on fresh levels. Max-2-flips prevents endless oscillation. The 10-bar cooldown stops back-to-back flipping in chop. All four gates protect the integrity of the flip signal. (Section 5.)',
  },
  {
    id: 'q3',
    question: 'A fresh level just born scores 0 tests but matches Cipher Flow within 0.4 ATR, sits at a round number, and aligns with a Risk Envelope band. What strength tier does CIPHER render?',
    options: [
      { id: 'a', text: 'Speculative (0/3) \u2014 no tests means no strength.', correct: false },
      { id: 'b', text: 'Moderate (1/3) \u2014 confluence factors don\u2019t count without at least one test.', correct: false },
      { id: 'c', text: 'Very Strong (3/3) \u2014 strength = tests + confluence, capped at 3. With 0 tests + 3 confluence factors, the score is 3.', correct: true },
      { id: 'd', text: 'The strength is unrendered until the first test fires.', correct: false },
    ],
    explain:
      'CIPHER\u2019s strength formula is tests + confluence_bonus, capped at 3. A fresh level with 3 confluence factors visually renders identical to a level with 3 tests \u2014 institutional alignment is treated as evidence equivalent to retest history. Most ribbons-based indicators ignore confluence; CIPHER weights it explicitly. (Section 6.)',
  },
  {
    id: 'q4',
    question: 'You hover a level and the tooltip reads "Tests: 3 / 4". What does this tell you operationally?',
    options: [
      { id: 'a', text: 'The level has been tested 3 times out of 4 maximum allowed \u2014 next test will retire it.', correct: true },
      { id: 'b', text: 'The level has 3 confluence factors out of 4 possible.', correct: false },
      { id: 'c', text: 'The level is on its 3rd flip out of 4 flips allowed.', correct: false },
      { id: 'd', text: 'The level is 3/4 of the way to its maximum age.', correct: false },
    ],
    explain:
      'The tooltip line "Tests: N / M" displays current test count divided by i_zone_max_tests (default 4). At 3/4, one more touch retires the level. Operationally: trade the next bounce with tighter stops or smaller size, because it\u2019s probably the last viable bounce on this level. (Sections 4 and 8.)',
  },
  {
    id: 'q5',
    question: 'The Cipher Spine formula blends two midpoints by health weight. What are the two midpoints and how does the blend work?',
    options: [
      { id: 'a', text: 'Tight EMA(5) and smooth EMA(21), blended by ATR ratio.', correct: false },
      { id: 'b', text: 'Tight midpoint (5-bar high+low/2) and smooth midpoint (21-bar high+low/2), blended as: spine = tight \u00D7 health_weight + smooth \u00D7 (1 \u2212 health_weight).', correct: true },
      { id: 'c', text: 'Daily VWAP and weekly VWAP, blended by volume.', correct: false },
      { id: 'd', text: 'Cipher Core and Cipher Anchor, blended by ribbon spread.', correct: false },
    ],
    explain:
      'The Spine isn\u2019t an EMA \u2014 it\u2019s a range-midpoint blend. The 5-bar tight midpoint hugs price; the 21-bar smooth midpoint anchors structure. The health weight (0-1) interpolates between them every bar. Healthy momentum pulls the Spine to the tight midpoint; dying momentum pulls it to the smooth midpoint, exposing a gap that visualises divergence. (Section 9.)',
  },
  {
    id: 'q6',
    question: 'What does it mean when the spine-price gap is in DRIFTING state (0.8-1.5 ATR)?',
    options: [
      { id: 'a', text: 'The Spine is broken and needs to be reset.', correct: false },
      { id: 'b', text: 'Price has fully decoupled \u2014 mean reversion is imminent. Take the counter-trend trade.', correct: false },
      { id: 'c', text: 'Real divergence territory: price is meaningfully ahead of where the engine thinks the trend center should be. Two interpretations: momentum genuinely fading, or the trend is too strong for 21-bar smoothing to keep up. Pair with Ribbon stack to disambiguate.', correct: true },
      { id: 'd', text: 'The trade should be exited immediately regardless of other reads.', correct: false },
    ],
    explain:
      'DRIFTING is the divergence-warning state, not a hard exit. The action depends on what the Ribbon stack is doing. Healthy stack + DRIFTING = trend is too strong for Spine smoothing to keep up; stay in but tighten. Weakening stack + DRIFTING = momentum genuinely fading; exit. The Spine reads alone don\u2019t replace cross-signal context. (Section 11.)',
  },
  {
    id: 'q7',
    question: 'The Structure row reads "S 0.1 ATR  R 2.9 ATR \u2192 AT SUPPORT". Why does AT SUPPORT win the cascade over NEAR SUPPORT or BETWEEN LEVELS?',
    options: [
      { id: 'a', text: 'Because the cascade prioritizes by frequency \u2014 AT SUPPORT is rarer so it wins.', correct: false },
      { id: 'b', text: 'Because AT SUPPORT is positioned higher in the cascade than NEAR SUPPORT and BETWEEN LEVELS, and all three predicates technically match \u2014 the first match wins.', correct: true },
      { id: 'c', text: 'Because S 0.1 ATR is below the NEAR SUPPORT threshold of 1.5 ATR.', correct: false },
      { id: 'd', text: 'Because BETWEEN LEVELS only fires when there are no nearby levels at all.', correct: false },
    ],
    explain:
      'The cascade evaluates top-down with first-match-wins priority. With S 0.1 ATR, the predicates for AT SUPPORT (sup &lt; 0.5), NEAR SUPPORT (sup &lt; 1.5), and BETWEEN LEVELS (fallback) all technically evaluate true \u2014 but AT SUPPORT is encountered first in the priority order and broadcasts. The lower-priority matches are suppressed. (Section 12.)',
  },
  {
    id: 'q8',
    question: 'You take a long entry at AT SUPPORT. Where does the stop go?',
    options: [
      { id: 'a', text: 'Exactly at the support price \u2014 the level is the line of defense.', correct: false },
      { id: 'b', text: 'Just BELOW the support level with a 0.2-0.5 ATR buffer \u2014 only triggers on a genuine break, not on wick noise.', correct: true },
      { id: 'c', text: 'At the Spine line \u2014 momentum invalidation is the primary stop reference.', correct: false },
      { id: 'd', text: 'At a fixed dollar amount below entry, ignoring the level entirely.', correct: false },
    ],
    explain:
      'Stop placement is just BEYOND the level (not at it) with an ATR buffer. The level is the defense line; the stop sits one tick past it. Stops AT the level get whipsawed on noise wicks; stops with a buffer only trigger on real breaks. This is one of the most operationally important rules in the lesson. (Section 14, Mistake 4 in Section 15.)',
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
// ANIMATION 1 — LevelsAndReaderAnim (S01 Groundbreaking Concept)
// Three-phase loop: (1) chart paints with Structure levels appearing
// one by one. (2) Spine line appears, threading between the levels,
// revealing where price is. (3) The Command Center Structure row
// updates to "NEAR SUPPORT / NEAR RESISTANCE / BETWEEN LEVELS"
// based on price's position relative to the visible levels.
// ============================================================
function LevelsAndReaderAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const MAGENTA = '#EF5350';
    const AMBER = '#FFB300';

    ctx.fillStyle = '#0a0f1a';
    ctx.fillRect(0, 0, w, h);

    const padX = 20;
    const padY = 24;
    const chartW = w * 0.66 - padX * 1.2;
    const chartH = h - padY * 2 - 18;
    const ccX = padX + chartW + 12;
    const ccW = w - ccX - padX;

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.strokeRect(padX, padY, chartW, chartH);

    // Three-phase loop, 6s each, 18s total
    const phaseDur = 6.0;
    const cycle = t % (phaseDur * 3);
    const phase = Math.floor(cycle / phaseDur);
    const phaseT = (cycle - phase * phaseDur) / phaseDur;

    // Generate price walk — same shape every loop (deterministic)
    const N = 60;
    const baseY = padY + chartH * 0.55;
    const prices: number[] = [];
    for (let i = 0; i < N; i++) {
      const x = i / (N - 1);
      const drift = -x * chartH * 0.10;
      const wave = Math.sin(x * Math.PI * 3.2) * chartH * 0.08;
      const noise = Math.sin(x * 13) * 3;
      prices.push(baseY + drift + wave + noise);
    }
    const px = (i: number) => padX + 6 + (i / (N - 1)) * (chartW - 12);

    // Define 4 Structure levels at fixed Y positions on the chart
    const levels = [
      { y: padY + chartH * 0.20, role: 'R', strength: 3, label: '4798' },
      { y: padY + chartH * 0.38, role: 'R', strength: 2, label: '4740' },
      { y: padY + chartH * 0.68, role: 'S', strength: 2, label: '4644' },
      { y: padY + chartH * 0.85, role: 'S', strength: 3, label: '4553' },
    ];

    // Phase progress for level paint-in (phase 0 only)
    const levelsToShow =
      phase === 0
        ? Math.min(levels.length, Math.floor(phaseT * (levels.length + 1)))
        : levels.length;

    // ── Plot price candles (always faint backdrop) ──
    for (let i = 0; i < N; i++) {
      const xC = px(i);
      const yC = prices[i];
      ctx.fillStyle = i % 3 === 0 ? 'rgba(38,166,154,0.45)' : 'rgba(239,83,80,0.45)';
      ctx.fillRect(xC - 1.4, yC - 4, 2.8, 8);
    }

    // ── Phase 0/1/2: Plot the Structure levels visible so far ──
    for (let li = 0; li < levelsToShow; li++) {
      const lvl = levels[li];
      const isResist = lvl.role === 'R';
      const lineColor = isResist ? MAGENTA : TEAL;
      const baseAlpha = lvl.strength === 3 ? 0.85 : 0.55;

      // Level horizontal line
      ctx.strokeStyle = `${lineColor}${Math.round(baseAlpha * 255).toString(16).padStart(2, '0')}`;
      ctx.lineWidth = lvl.strength === 3 ? 2 : 1.3;
      // Style: dotted for strength<=1, dashed=2, solid=3
      if (lvl.strength === 2) ctx.setLineDash([6, 4]);
      else if (lvl.strength <= 1) ctx.setLineDash([2, 4]);
      else ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(padX + 6, lvl.y);
      ctx.lineTo(padX + chartW - 8, lvl.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Price label at right edge
      ctx.font = '9px ui-sans-serif, system-ui';
      ctx.fillStyle = `${lineColor}cc`;
      ctx.textAlign = 'left';
      ctx.fillText(lvl.label, padX + chartW - 36, lvl.y - 4);
    }

    // ── Phase 1+: Spine line threading between the levels ──
    if (phase >= 1) {
      // Spine sits ~20% inside the band between price and the nearest level
      const spinePts: number[] = [];
      for (let i = 0; i < N; i++) {
        // Spine smooths the price path with a 21-bar lag
        const lookback = Math.max(0, i - 21);
        let avg = 0;
        for (let j = lookback; j <= i; j++) avg += prices[j];
        avg /= (i - lookback + 1);
        spinePts.push(avg);
      }

      // Reveal-in animation: spine paints from left to right during phase 1
      const drawPct = phase === 1 ? Math.min(1, phaseT * 1.3) : 1.0;
      const drawN = Math.floor(N * drawPct);

      // Spine bands (inner + outer)
      if (drawN > 1) {
        const bandW = 14;
        // Outer band fill
        ctx.beginPath();
        ctx.moveTo(px(0), spinePts[0] - bandW);
        for (let i = 1; i < drawN; i++) ctx.lineTo(px(i), spinePts[i] - bandW);
        for (let i = drawN - 1; i >= 0; i--) ctx.lineTo(px(i), spinePts[i] + bandW);
        ctx.closePath();
        ctx.fillStyle = 'rgba(38,166,154,0.10)';
        ctx.fill();
        // Inner band fill
        ctx.beginPath();
        ctx.moveTo(px(0), spinePts[0] - bandW * 0.4);
        for (let i = 1; i < drawN; i++) ctx.lineTo(px(i), spinePts[i] - bandW * 0.4);
        for (let i = drawN - 1; i >= 0; i--) ctx.lineTo(px(i), spinePts[i] + bandW * 0.4);
        ctx.closePath();
        ctx.fillStyle = 'rgba(38,166,154,0.20)';
        ctx.fill();

        // Spine line itself
        ctx.beginPath();
        ctx.moveTo(px(0), spinePts[0]);
        for (let i = 1; i < drawN; i++) ctx.lineTo(px(i), spinePts[i]);
        ctx.strokeStyle = TEAL;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // ── Top-of-chart phase label ──
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    const phaseLabels = [
      'STRUCTURE PAINTS THE LEVELS',
      'SPINE READS THE PRICE',
      'THE COMPLETE READ',
    ];
    ctx.fillStyle = phase === 2 ? AMBER : phase === 1 ? TEAL : MAGENTA;
    ctx.fillText(phaseLabels[phase], padX + chartW / 2, padY + 16);

    // ── CC panel ──
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
    ctx.fillText('Structure', ccX + 8, padY + 38);

    // Cell 2 + cell 3 of Structure row update by phase
    ctx.font = 'bold 9px ui-sans-serif, system-ui';
    if (phase === 0) {
      // Levels appearing — read incomplete
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.fillText(levelsToShow > 0 ? 'S — R —' : 'NO LEVELS', ccX + 60, padY + 38);
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.fillText(levelsToShow > 0 ? '\u2192 SCANNING' : '\u2192 NO LEVELS', ccX + 8, padY + 56);
    } else if (phase === 1) {
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.fillText('S 1.4  R 1.8', ccX + 50, padY + 38);
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillText('\u2192 BETWEEN LEVELS', ccX + 8, padY + 56);
    } else {
      ctx.fillStyle = MAGENTA;
      ctx.fillText('S 2.6  R 0.8', ccX + 50, padY + 38);
      ctx.fillStyle = MAGENTA;
      ctx.fillText('\u2192 NEAR RESISTANCE', ccX + 8, padY + 56);
    }

    // Faded other rows for context
    ctx.fillStyle = 'rgba(255,255,255,0.20)';
    ctx.font = '9px ui-sans-serif, system-ui';
    ['Ribbon', 'Pulse', 'Regime', 'Bias'].forEach((r, i) => {
      ctx.fillText(r, ccX + 8, padY + 80 + i * 16);
    });

    // Phase progress dots
    const dotsY = h - 14;
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = i === phase ? AMBER : 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      ctx.arc(padX + 10 + i * 16, dotsY, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 2 — StructureAnatomyAnim (S02)
// Visual record-card metaphor: shows the 10 parallel arrays as
// a level "record" populating each field as a level forms on chart.
// Left side: a chart with one level forming. Right side: the level's
// metadata card filling in as bars pass: zone_price, zone_bar,
// zone_tests, zone_dir, zone_flips, zone_box, zone_line, zone_dot,
// zone_price_lbl. Demystifies the "10 parallel arrays per level".
// ============================================================
function StructureAnatomyAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const MAGENTA = '#EF5350';
    const AMBER = '#FFB300';

    ctx.fillStyle = '#0a0f1a';
    ctx.fillRect(0, 0, w, h);

    // Layout: chart on left ~52%, record card on right ~48%
    const padX = 18;
    const padY = 24;
    const chartW = w * 0.50 - padX;
    const chartH = h - padY * 2 - 20;
    const cardX = padX + chartW + 14;
    const cardW = w - cardX - padX;

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.strokeRect(padX, padY, chartW, chartH);

    // Cycle 10s — bars accumulate, level forms, fields populate
    const cycle = 10.0;
    const cycT = t % cycle;
    const N = 50;
    const barsElapsed = Math.floor((cycT / cycle) * N);

    // Generate bear-then-bounce price action with a clear pivot low
    const baseY = padY + chartH * 0.55;
    const prices: number[] = [];
    const pivotIdx = 20;
    for (let i = 0; i < N; i++) {
      const x = i / (N - 1);
      let p = baseY;
      if (i < pivotIdx) {
        p = baseY - (pivotIdx - i) * 1.6;
      } else {
        p = baseY - (i - pivotIdx) * 0.8 + Math.sin((i - pivotIdx) * 0.6) * 4;
      }
      prices.push(p);
    }
    const pivotY = prices[pivotIdx] + 4; // pivot low marks support

    const px = (i: number) => padX + 6 + (i / (N - 1)) * (chartW - 12);

    // Plot candles up to barsElapsed
    for (let i = 0; i < Math.min(barsElapsed, N); i++) {
      ctx.fillStyle = i < pivotIdx ? 'rgba(239,83,80,0.65)' : 'rgba(38,166,154,0.55)';
      ctx.fillRect(px(i) - 1.4, prices[i] - 4, 2.8, 8);
    }

    // Once pivot is confirmed (barsElapsed > pivotIdx + 5), draw the level
    const levelConfirmed = barsElapsed > pivotIdx + 5;
    const tests = barsElapsed > 35 ? 1 : 0;

    if (levelConfirmed) {
      ctx.strokeStyle = `${TEAL}cc`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(padX + 6, pivotY);
      ctx.lineTo(padX + chartW - 6, pivotY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Dot at the pivot
      ctx.fillStyle = TEAL;
      ctx.beginPath();
      ctx.arc(px(pivotIdx), pivotY, 3, 0, Math.PI * 2);
      ctx.fill();

      // Test count dot (if tested)
      if (tests > 0) {
        ctx.fillStyle = AMBER;
        ctx.font = 'bold 14px ui-sans-serif, system-ui';
        ctx.textAlign = 'left';
        ctx.fillText('\u2022', px(pivotIdx) + 30, pivotY + 4);
      }
    }

    // ── RECORD CARD ──
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(cardX, padY, cardW, chartH);
    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.strokeRect(cardX, padY, cardW, chartH);

    ctx.font = 'bold 10px ui-sans-serif, system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = AMBER;
    ctx.fillText('LEVEL RECORD', cardX + 10, padY + 16);

    // Each field reveals as we hit certain bar milestones
    type Field = { label: string; getValue: () => string; reveal: number; color?: string };
    const fields: Field[] = [
      { label: 'zone_price', getValue: () => '4553.85', reveal: pivotIdx + 5, color: 'rgba(255,255,255,0.85)' },
      { label: 'zone_bar', getValue: () => String(pivotIdx), reveal: pivotIdx + 5, color: 'rgba(255,255,255,0.85)' },
      { label: 'zone_dir', getValue: () => 'SUPPORT (+1)', reveal: pivotIdx + 5, color: TEAL },
      { label: 'zone_tests', getValue: () => String(tests), reveal: pivotIdx + 5, color: tests > 0 ? AMBER : 'rgba(255,255,255,0.7)' },
      { label: 'zone_flips', getValue: () => '0', reveal: pivotIdx + 5, color: 'rgba(255,255,255,0.7)' },
      { label: 'zone_flip_bar', getValue: () => '—', reveal: pivotIdx + 5, color: 'rgba(255,255,255,0.5)' },
      { label: 'zone_box', getValue: () => 'box.new()', reveal: pivotIdx + 5, color: 'rgba(255,255,255,0.7)' },
      { label: 'zone_line', getValue: () => 'line.new()', reveal: pivotIdx + 5, color: 'rgba(255,255,255,0.7)' },
      { label: 'zone_dot', getValue: () => 'label.new()', reveal: pivotIdx + 5, color: 'rgba(255,255,255,0.7)' },
      { label: 'zone_price_lbl', getValue: () => 'label.new()', reveal: pivotIdx + 5, color: 'rgba(255,255,255,0.7)' },
    ];

    ctx.font = '9px ui-sans-serif, system-ui';
    fields.forEach((f, i) => {
      const fy = padY + 36 + i * 18;
      const isRevealed = barsElapsed >= f.reveal;
      // Label
      ctx.fillStyle = isRevealed ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.20)';
      ctx.fillText(f.label, cardX + 10, fy);
      // Value
      if (isRevealed) {
        ctx.fillStyle = f.color || 'rgba(255,255,255,0.85)';
        ctx.font = 'bold 9px ui-sans-serif, system-ui';
        ctx.textAlign = 'right';
        ctx.fillText(f.getValue(), cardX + cardW - 10, fy);
        ctx.font = '9px ui-sans-serif, system-ui';
        ctx.textAlign = 'left';
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.textAlign = 'right';
        ctx.fillText('—', cardX + cardW - 10, fy);
        ctx.textAlign = 'left';
      }
    });

    // Bar counter
    ctx.font = '10px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.textAlign = 'center';
    ctx.fillText('Bar ' + Math.min(barsElapsed, N), padX + chartW / 2, h - 8);

    void MAGENTA;
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 3 — PivotDetectionAnim (S03)
// Shows the pivot detection logic: i_pivot_len bars left + i_pivot_len
// bars right of a candidate bar must all be lower (for pivot high)
// or higher (for pivot low) than the candidate. The lookback window
// scans across the chart, lighting up the candidate when found.
// ============================================================
function PivotDetectionAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';

    ctx.fillStyle = '#0a0f1a';
    ctx.fillRect(0, 0, w, h);

    const padX = 24;
    const padY = 30;
    const chartW = w - padX * 2;
    const chartH = h - padY * 2 - 26;
    const baseY = padY + chartH * 0.55;

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.strokeRect(padX, padY, chartW, chartH);

    // Generate price with two clear pivot lows
    const N = 40;
    const prices: number[] = [];
    const pivotPositions = [12, 28]; // two pivot lows
    for (let i = 0; i < N; i++) {
      const x = i / (N - 1);
      let p = baseY - Math.sin(x * Math.PI * 2.0) * chartH * 0.15;
      // Add some local noise
      p += Math.sin(i * 1.3) * 4;
      prices.push(p);
    }

    const px = (i: number) => padX + 8 + (i / (N - 1)) * (chartW - 16);

    // Cycle 8s — lookback window scans across
    const cycle = 8.0;
    const cycT = t % cycle;
    const scanIdx = Math.floor((cycT / cycle) * N);
    const pivotLen = 5;

    // Plot all candles
    for (let i = 0; i < N; i++) {
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillRect(px(i) - 1.4, prices[i] - 5, 2.8, 10);
    }

    // Lookback window highlight (around scanIdx)
    if (scanIdx >= pivotLen && scanIdx < N - pivotLen) {
      const winLeft = px(scanIdx - pivotLen);
      const winRight = px(scanIdx + pivotLen);
      ctx.fillStyle = 'rgba(255,179,0,0.10)';
      ctx.fillRect(winLeft, padY + 6, winRight - winLeft, chartH - 12);
      ctx.strokeStyle = 'rgba(255,179,0,0.40)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(winLeft, padY + 6, winRight - winLeft, chartH - 12);
      ctx.setLineDash([]);

      // Highlight candidate bar
      ctx.fillStyle = AMBER;
      ctx.fillRect(px(scanIdx) - 1.6, prices[scanIdx] - 5, 3.2, 10);

      // Check: is candidate < all bars within the window?
      let isPivotLow = true;
      for (let j = scanIdx - pivotLen; j <= scanIdx + pivotLen; j++) {
        if (j === scanIdx) continue;
        if (prices[j] <= prices[scanIdx]) {
          isPivotLow = false;
          break;
        }
      }

      // Check known pivots
      const isKnownPivot = pivotPositions.some((p) => Math.abs(p - scanIdx) < 2);

      if (isPivotLow || isKnownPivot) {
        // Plot a teal pivot marker
        ctx.fillStyle = TEAL;
        ctx.beginPath();
        ctx.arc(px(scanIdx), prices[scanIdx] + 14, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = 'bold 9px ui-sans-serif, system-ui';
        ctx.fillStyle = TEAL;
        ctx.textAlign = 'center';
        ctx.fillText('PIVOT LOW', px(scanIdx), prices[scanIdx] + 28);
      }
    }

    // Persistent markers on confirmed pivots that have been past
    pivotPositions.forEach((p) => {
      if (scanIdx > p + pivotLen) {
        ctx.fillStyle = TEAL;
        ctx.beginPath();
        ctx.arc(px(p), prices[p] + 14, 3, 0, Math.PI * 2);
        ctx.fill();

        // Horizontal level extending to the right
        ctx.strokeStyle = 'rgba(38,166,154,0.40)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 4]);
        ctx.beginPath();
        ctx.moveTo(px(p), prices[p] + 4);
        ctx.lineTo(px(N - 1), prices[p] + 4);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    // Top label
    ctx.font = 'bold 10px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = AMBER;
    ctx.fillText('i_pivot_len = ' + pivotLen + '   (scan window: ' + (pivotLen * 2 + 1) + ' bars)', padX + chartW / 2, padY + 18);

    // Bottom caption
    ctx.font = '10px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillText('A pivot low requires all 5 bars left + 5 bars right to be higher than the candidate.', padX + chartW / 2, h - 8);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 4 — LevelLifecycleAnim (S04)
// A level's life from birth to retirement. Tests counter ticks up,
// age progress bar fills. Either: (path A) tests hit max → retire,
// or (path B) age hits max → retire. Plus the pruning rule: when
// total levels exceed i_max_zones, the weakest is pruned.
// ============================================================
function LevelLifecycleAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';

    ctx.fillStyle = '#0a0f1a';
    ctx.fillRect(0, 0, w, h);

    const padX = 24;
    const padY = 28;
    const chartW = w - padX * 2;
    const chartH = h - padY * 2 - 22;

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.strokeRect(padX, padY, chartW, chartH);

    // Cycle 12s. Two phases shown sequentially.
    // 0-6s: tests-driven retirement (tests counter ticks 0→4)
    // 6-12s: age-driven retirement (age bar fills 0→max)
    const cycle = 12.0;
    const cycT = t % cycle;
    const phase = cycT < 6.0 ? 0 : 1;
    const phaseT = phase === 0 ? cycT / 6.0 : (cycT - 6.0) / 6.0;

    // Layout: left half = tests path, right half = age path
    const leftW = chartW / 2 - 8;
    const rightW = chartW / 2 - 8;
    const leftX = padX + 4;
    const rightX = padX + chartW / 2 + 4;

    // Mid divider
    ctx.setLineDash([3, 4]);
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.beginPath();
    ctx.moveTo(padX + chartW / 2, padY + 6);
    ctx.lineTo(padX + chartW / 2, padY + chartH - 6);
    ctx.stroke();
    ctx.setLineDash([]);

    // Headers
    ctx.font = 'bold 10px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = phase === 0 ? AMBER : 'rgba(255,255,255,0.4)';
    ctx.fillText('PATH A \u00B7 TESTS RETIREMENT', leftX + leftW / 2, padY + 16);
    ctx.fillStyle = phase === 1 ? AMBER : 'rgba(255,255,255,0.4)';
    ctx.fillText('PATH B \u00B7 AGE RETIREMENT', rightX + rightW / 2, padY + 16);

    // ── PATH A: tests retirement ──
    const testsMax = 4;
    const testsCount = phase === 0 ? Math.floor(phaseT * (testsMax + 1)) : 0;
    const retiredTests = phase === 0 && testsCount >= testsMax;

    // Visual: 4 test slots, fill with dots as tests accumulate
    ctx.font = '11px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.textAlign = 'left';
    ctx.fillText('Tests this level has been touched:', leftX + 14, padY + 40);

    for (let s = 0; s < testsMax; s++) {
      const sx = leftX + 18 + s * 24;
      const sy = padY + 60;
      const isFilled = s < testsCount;
      ctx.strokeStyle = 'rgba(255,255,255,0.30)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(sx, sy, 8, 0, Math.PI * 2);
      ctx.stroke();
      if (isFilled) {
        ctx.fillStyle = AMBER;
        ctx.beginPath();
        ctx.arc(sx, sy, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Status
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'left';
    if (retiredTests) {
      ctx.fillStyle = MAGENTA;
      ctx.fillText('\u2192 RETIRED  (' + testsCount + ' / 4)', leftX + 14, padY + 92);
      ctx.font = '9px ui-sans-serif, system-ui';
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.fillText('Liquidity consumed.', leftX + 14, padY + 108);
    } else {
      ctx.fillStyle = phase === 0 ? TEAL : 'rgba(255,255,255,0.4)';
      ctx.fillText('Active (' + testsCount + ' / 4)', leftX + 14, padY + 92);
    }

    ctx.font = '8px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fillText('i_zone_max_tests = 4', leftX + 14, padY + chartH - 12);

    // ── PATH B: age retirement ──
    const ageMax = 200;
    const age = phase === 1 ? Math.floor(phaseT * (ageMax + 30)) : 0;
    const retiredAge = phase === 1 && age >= ageMax;

    ctx.font = '11px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.textAlign = 'left';
    ctx.fillText('Bars since the level was created:', rightX + 14, padY + 40);

    // Age progress bar
    const barX = rightX + 14;
    const barY = padY + 56;
    const barW = rightW - 28;
    const barH = 14;
    ctx.strokeStyle = 'rgba(255,255,255,0.30)';
    ctx.strokeRect(barX, barY, barW, barH);
    const fillPct = Math.min(1, age / ageMax);
    ctx.fillStyle = retiredAge ? MAGENTA : age > ageMax * 0.7 ? AMBER : TEAL;
    ctx.fillRect(barX + 1, barY + 1, (barW - 2) * fillPct, barH - 2);

    // Age decay zone marker (>100 bars = fade starts)
    const decayMarkX = barX + barW * (100 / ageMax);
    ctx.setLineDash([2, 3]);
    ctx.strokeStyle = 'rgba(255,179,0,0.55)';
    ctx.beginPath();
    ctx.moveTo(decayMarkX, barY - 4);
    ctx.lineTo(decayMarkX, barY + barH + 4);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = '8px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,179,0,0.85)';
    ctx.textAlign = 'center';
    ctx.fillText('100b decay', decayMarkX, barY - 6);

    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'left';
    if (retiredAge) {
      ctx.fillStyle = MAGENTA;
      ctx.fillText('\u2192 RETIRED  (' + Math.min(age, ageMax) + ' / 200)', rightX + 14, padY + 92);
      ctx.font = '9px ui-sans-serif, system-ui';
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.fillText('Aged out, no longer relevant.', rightX + 14, padY + 108);
    } else {
      ctx.fillStyle = phase === 1 ? TEAL : 'rgba(255,255,255,0.4)';
      ctx.fillText('Active (' + age + ' / 200)', rightX + 14, padY + 92);
    }

    ctx.font = '8px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.textAlign = 'left';
    ctx.fillText('i_zone_max_age = 200', rightX + 14, padY + chartH - 12);

    // Bottom caption
    ctx.font = '10px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.textAlign = 'center';
    ctx.fillText('Either path retires the level. Liquidity consumed, or relevance expired.', padX + chartW / 2, h - 8);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 5 — PolarityFlipAnim (S05)
// A support level becomes resistance. Price approaches the level,
// closes through it for two consecutive bars, the level's role
// inverts, the visual changes color (teal → magenta), the test
// dots reset to zero, the flip counter ticks to 1, and a 10-bar
// cooldown begins.
// ============================================================
function PolarityFlipAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const MAGENTA = '#EF5350';
    const AMBER = '#FFB300';

    ctx.fillStyle = '#0a0f1a';
    ctx.fillRect(0, 0, w, h);

    const padX = 22;
    const padY = 28;
    const chartW = w * 0.62 - padX;
    const chartH = h - padY * 2 - 22;
    const cardX = padX + chartW + 14;
    const cardW = w - cardX - padX;
    const baseY = padY + chartH * 0.45;

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.strokeRect(padX, padY, chartW, chartH);

    // Cycle 12s — narrative arc with discrete stages
    const cycle = 12.0;
    const cycT = t % cycle;
    // Stage 0 (0-3s): support holding, price bouncing off
    // Stage 1 (3-5s): price approaches and breaches level
    // Stage 2 (5-7s): second consecutive close below — flip confirms
    // Stage 3 (7-12s): level is now resistance, price tests from below
    let stage = 0;
    if (cycT >= 3 && cycT < 5) stage = 1;
    else if (cycT >= 5 && cycT < 7) stage = 2;
    else if (cycT >= 7) stage = 3;

    // Level price — sits at this y throughout
    const levelY = baseY + 10;

    const N = 50;
    const prices: number[] = [];
    for (let i = 0; i < N; i++) {
      const x = i / (N - 1);
      let p = baseY;
      // Stage scripted price action
      if (x < 0.30) {
        // Bouncing off support (above level)
        p = levelY - 18 + Math.sin(x * Math.PI * 4) * 12;
      } else if (x < 0.45) {
        // Approach
        p = levelY - 10 + (x - 0.30) * 60;
      } else if (x < 0.55) {
        // Break: closes below level
        p = levelY + 10 + (x - 0.45) * 30;
      } else if (x < 0.65) {
        // Second confirm bar below
        p = levelY + 14 + (x - 0.55) * 10;
      } else {
        // Now level acts as resistance from below
        p = levelY + 14 + Math.sin((x - 0.65) * Math.PI * 4) * 10;
      }
      prices.push(p);
    }
    const px = (i: number) => padX + 6 + (i / (N - 1)) * (chartW - 12);

    // Compute how many bars to draw based on stage
    let drawN = N;
    if (stage === 0) drawN = Math.floor(N * 0.30 + 6);
    else if (stage === 1) drawN = Math.floor(N * 0.50);
    else if (stage === 2) drawN = Math.floor(N * 0.62);

    // Plot candles up to drawN
    for (let i = 0; i < drawN; i++) {
      ctx.fillStyle = prices[i] < levelY ? 'rgba(38,166,154,0.55)' : 'rgba(239,83,80,0.55)';
      ctx.fillRect(px(i) - 1.4, prices[i] - 4, 2.8, 8);
    }

    // ── Draw the level ──
    // Color depends on stage: support (teal) for 0/1, transitioning amber for 2, resistance (magenta) for 3
    let levelColor: string = TEAL;
    let levelStyleDash: number[] = [];
    if (stage <= 1) {
      levelColor = TEAL;
      levelStyleDash = [];
    } else if (stage === 2) {
      levelColor = AMBER;
      levelStyleDash = [4, 3];
    } else {
      levelColor = MAGENTA;
      levelStyleDash = [];
    }

    ctx.strokeStyle = levelColor;
    ctx.lineWidth = 2;
    ctx.setLineDash(levelStyleDash);
    ctx.beginPath();
    ctx.moveTo(padX + 6, levelY);
    ctx.lineTo(padX + chartW - 6, levelY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Test dots (or flip glyph)
    if (stage === 3) {
      // After flip, test counter is 0 — show the ⟳ flip glyph
      ctx.fillStyle = MAGENTA;
      ctx.font = 'bold 14px ui-sans-serif, system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('\u27F3', px(Math.floor(N * 0.62)), levelY - 6);
    } else {
      // Show test dots — 1 dot pre-break, 0 post
      const tests = stage <= 1 ? 1 : 0;
      ctx.fillStyle = AMBER;
      ctx.font = 'bold 14px ui-sans-serif, system-ui';
      ctx.textAlign = 'left';
      let dotStr = '';
      for (let d = 0; d < tests; d++) dotStr += '\u2022';
      if (dotStr) ctx.fillText(dotStr, px(Math.floor(N * 0.20)), levelY - 6);
    }

    // ── Stage label at top ──
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    const stageLabels = [
      'STAGE 1 \u00B7 SUPPORT HOLDING',
      'STAGE 2 \u00B7 BREACHED (1st close below)',
      'STAGE 3 \u00B7 FLIP CONFIRMING (2 closes below)',
      'STAGE 4 \u00B7 NOW RESISTANCE',
    ];
    ctx.fillStyle = stage === 0 ? TEAL : stage === 1 ? AMBER : stage === 2 ? AMBER : MAGENTA;
    ctx.fillText(stageLabels[stage], padX + chartW / 2, padY + 18);

    // ── Side panel: live record card showing role transition ──
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(cardX, padY, cardW, chartH);
    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.strokeRect(cardX, padY, cardW, chartH);

    ctx.font = 'bold 9px ui-sans-serif, system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = AMBER;
    ctx.fillText('LEVEL RECORD', cardX + 8, padY + 16);

    ctx.font = '9px ui-sans-serif, system-ui';
    const fields = [
      { label: 'zone_dir', stage0: 'SUPPORT (+1)', stage3: 'RESISTANCE (-1)', dynamic: true },
      { label: 'zone_tests', stage0: '1', stage3: '0', dynamic: true },
      { label: 'zone_flips', stage0: '0', stage3: '1', dynamic: true },
      { label: 'zone_flip_bar', stage0: '\u2014', stage3: 'bar 31', dynamic: true },
    ];
    fields.forEach((f, i) => {
      const fy = padY + 36 + i * 22;
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.fillText(f.label, cardX + 8, fy);
      const val = stage >= 3 ? f.stage3 : f.stage0;
      const isChanged = stage >= 3 && f.dynamic;
      ctx.fillStyle = isChanged ? MAGENTA : 'rgba(255,255,255,0.85)';
      ctx.font = 'bold 9px ui-sans-serif, system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(val, cardX + cardW - 8, fy);
      ctx.font = '9px ui-sans-serif, system-ui';
      ctx.textAlign = 'left';
    });

    // Cooldown countdown after flip
    if (stage === 3) {
      const cooldownTotal = 10;
      const cooldownProgress = Math.min(1, (cycT - 7.0) / 4.5);
      const cooldownLeft = Math.max(0, Math.round(cooldownTotal * (1 - cooldownProgress)));
      ctx.font = 'bold 9px ui-sans-serif, system-ui';
      ctx.fillStyle = AMBER;
      ctx.textAlign = 'left';
      ctx.fillText('Cooldown:', cardX + 8, padY + 130);
      ctx.font = 'bold 11px ui-sans-serif, system-ui';
      ctx.fillStyle = cooldownLeft > 0 ? AMBER : TEAL;
      ctx.fillText(cooldownLeft > 0 ? cooldownLeft + ' bars' : 'READY', cardX + 56, padY + 130);
      ctx.font = '8px ui-sans-serif, system-ui';
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.fillText('No second flip allowed yet.', cardX + 8, padY + 144);
    }

    // Bottom caption
    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.textAlign = 'center';
    ctx.fillText('Liquidity that gets blown through doesn\u2019t vanish. It converts.', padX + chartW / 2, h - 8);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 6 — ConfluenceAnim (S06)
// A level's strength = tests + confluence. Three confluence factors
// each tested independently and lit up when they apply: Ribbon edge
// proximity, Risk Envelope band proximity, and round number proximity.
// As factors light up, the level's strength tier increases visually.
// ============================================================
function ConfluenceAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const MAGENTA = '#EF5350';
    const AMBER = '#FFB300';

    ctx.fillStyle = '#0a0f1a';
    ctx.fillRect(0, 0, w, h);

    const padX = 22;
    const padY = 28;
    const chartW = w * 0.58 - padX;
    const chartH = h - padY * 2 - 22;
    const panelX = padX + chartW + 14;
    const panelW = w - panelX - padX;

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.strokeRect(padX, padY, chartW, chartH);

    // Cycle 16s — 4 stages of 4s each, each stage lights up another factor
    const cycle = 16.0;
    const cycT = t % cycle;
    const stage = Math.floor(cycT / 4.0); // 0, 1, 2, 3

    // Level at fixed position (resistance above price)
    const levelY = padY + chartH * 0.30;

    // Generate price wave
    const N = 50;
    const baseY = padY + chartH * 0.65;
    const prices: number[] = [];
    for (let i = 0; i < N; i++) {
      const x = i / (N - 1);
      prices.push(baseY - Math.sin(x * Math.PI * 2.5) * 20);
    }
    const px = (i: number) => padX + 6 + (i / (N - 1)) * (chartW - 12);

    // Plot candles
    for (let i = 0; i < N; i++) {
      ctx.fillStyle = 'rgba(255,255,255,0.30)';
      ctx.fillRect(px(i) - 1.2, prices[i] - 3, 2.4, 6);
    }

    // ── Confluence factors visible based on stage ──
    // Stage 0: just the test (no confluence)
    // Stage 1: + Ribbon edge nearby
    // Stage 2: + Risk Envelope band
    // Stage 3: + Round number

    // Ribbon edge — show as a faint teal line just below the level
    if (stage >= 1) {
      ctx.strokeStyle = 'rgba(38,166,154,0.55)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(padX + 6, levelY + 4);
      for (let i = 0; i < N; i++) {
        const x = padX + 6 + (i / (N - 1)) * (chartW - 12);
        const yWiggle = levelY + 4 + Math.sin((i / N) * Math.PI * 1.5) * 3;
        ctx.lineTo(x, yWiggle);
      }
      ctx.stroke();
      // Label
      ctx.font = '8px ui-sans-serif, system-ui';
      ctx.fillStyle = 'rgba(38,166,154,0.85)';
      ctx.textAlign = 'right';
      ctx.fillText('cipher_flow', padX + chartW - 6, levelY + 14);
    }

    // Risk Envelope band — show as a faint amber line above
    if (stage >= 2) {
      ctx.strokeStyle = 'rgba(255,179,0,0.55)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(padX + 6, levelY - 6);
      ctx.lineTo(padX + chartW - 6, levelY - 6);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = '8px ui-sans-serif, system-ui';
      ctx.fillStyle = 'rgba(255,179,0,0.85)';
      ctx.textAlign = 'right';
      ctx.fillText('risk envelope band', padX + chartW - 6, levelY - 10);
    }

    // Round number marker (e.g. 4800.000) — show on the right margin
    if (stage >= 3) {
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = 1;
      ctx.setLineDash([1, 3]);
      ctx.beginPath();
      ctx.moveTo(padX + chartW - 4, levelY);
      ctx.lineTo(padX + chartW - 4, levelY + 4);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = 'bold 9px ui-sans-serif, system-ui';
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.textAlign = 'left';
      ctx.fillText('\u2192 4800.000', padX + chartW + 2, levelY + 3);
    }

    // ── The level itself, rendered with strength-adaptive style ──
    // Strength = 1 (1 test) + confluence factors lit
    const tests = 1;
    const confluence = stage; // 0, 1, 2, 3
    const strength = Math.min(3, tests + confluence);

    let levelStyle: number[] = [];
    let levelWidth = 1;
    if (strength <= 1) {
      levelStyle = [2, 4]; // dotted
      levelWidth = 1;
    } else if (strength === 2) {
      levelStyle = [6, 4]; // dashed
      levelWidth = 2;
    } else {
      levelStyle = []; // solid
      levelWidth = 3;
    }
    const baseAlpha = 0.45 + strength * 0.15;
    ctx.strokeStyle = `rgba(239,83,80,${baseAlpha})`;
    ctx.lineWidth = levelWidth;
    ctx.setLineDash(levelStyle);
    ctx.beginPath();
    ctx.moveTo(padX + 6, levelY);
    ctx.lineTo(padX + chartW - 6, levelY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Test dot
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 14px ui-sans-serif, system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('\u2022', px(Math.floor(N * 0.45)), levelY - 6);

    // ── Side panel: confluence checklist ──
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(panelX, padY, panelW, chartH);
    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.strokeRect(panelX, padY, panelW, chartH);

    ctx.font = 'bold 9px ui-sans-serif, system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = AMBER;
    ctx.fillText('STRENGTH SCORE', panelX + 8, padY + 16);

    // Tests row
    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillText('Tests', panelX + 8, padY + 38);
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 9px ui-sans-serif, system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('+1', panelX + panelW - 8, padY + 38);
    ctx.textAlign = 'left';

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.beginPath();
    ctx.moveTo(panelX + 8, padY + 48);
    ctx.lineTo(panelX + panelW - 8, padY + 48);
    ctx.stroke();

    // Confluence factor checklist
    const factors = [
      { label: 'Ribbon edge', minStage: 1 },
      { label: 'Risk Envelope', minStage: 2 },
      { label: 'Round number', minStage: 3 },
    ];

    factors.forEach((f, i) => {
      const fy = padY + 64 + i * 22;
      const isActive = stage >= f.minStage;
      ctx.font = '9px ui-sans-serif, system-ui';
      ctx.fillStyle = isActive ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.30)';
      ctx.textAlign = 'left';
      ctx.fillText(f.label, panelX + 8, fy);
      ctx.fillStyle = isActive ? AMBER : 'rgba(255,255,255,0.20)';
      ctx.font = 'bold 9px ui-sans-serif, system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(isActive ? '+1' : '\u2014', panelX + panelW - 8, fy);
    });

    // Total strength tier
    const tierY = padY + 64 + 3 * 22 + 14;
    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.beginPath();
    ctx.moveTo(panelX + 8, tierY - 8);
    ctx.lineTo(panelX + panelW - 8, tierY - 8);
    ctx.stroke();

    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.textAlign = 'left';
    ctx.fillText('Strength', panelX + 8, tierY + 4);

    const tierLabels = ['Speculative', 'Moderate', 'Strong', 'Very Strong'];
    const tierColors = [
      'rgba(255,255,255,0.4)',
      'rgba(255,255,255,0.7)',
      AMBER,
      MAGENTA,
    ];
    ctx.font = 'bold 10px ui-sans-serif, system-ui';
    ctx.fillStyle = tierColors[strength];
    ctx.textAlign = 'right';
    ctx.fillText(tierLabels[strength] + ' (' + strength + '/3)', panelX + panelW - 8, tierY + 4);

    // Bottom caption
    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.textAlign = 'center';
    ctx.fillText('A level can score Strong without ever being tested.', padX + chartW / 2, h - 8);

    void TEAL;
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 7 — StrengthRenderingAnim (S07)
// 4 levels at strength tiers 0, 1, 2, 3 stacked on a chart, all
// showing the visual progression: dotted thin → dotted thicker
// → dashed → solid thick. Plus the trend-aware AMBER warning when
// approaching a level counter to the trend.
// ============================================================
function StrengthRenderingAnim() {
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

    // 4 levels at distinct y positions, each at a different strength tier
    const levels = [
      { y: padY + chartH * 0.18, strength: 3, role: 'R', label: '4798 \u00B7 Very Strong' },
      { y: padY + chartH * 0.36, strength: 2, role: 'R', label: '4740 \u00B7 Strong' },
      { y: padY + chartH * 0.62, strength: 1, role: 'S', label: '4644 \u00B7 Moderate' },
      { y: padY + chartH * 0.85, strength: 0, role: 'S', label: '4553 \u00B7 Speculative' },
    ];

    // Cycle 8s — price oscillates up and down across the levels
    const cycle = 8.0;
    const cycT = t % cycle;
    const phaseT = cycT / cycle;

    // Price walks through the levels, currently approaching one
    const N = 50;
    const baseY = padY + chartH * 0.55;
    const prices: number[] = [];
    for (let i = 0; i < N; i++) {
      const x = i / (N - 1);
      // Sinusoidal walk with the current end at a specific y
      const localT = (x + phaseT * 0.5) % 1.0;
      prices.push(baseY - Math.sin(localT * Math.PI * 1.5) * chartH * 0.20);
    }
    const px = (i: number) => padX + 6 + (i / (N - 1)) * (chartW - 16);

    // Identify the current price (last bar) and which level it's approaching
    const currentPrice = prices[N - 1];

    // Plot candles
    for (let i = 0; i < N; i++) {
      ctx.fillStyle = 'rgba(255,255,255,0.30)';
      ctx.fillRect(px(i) - 1.2, prices[i] - 3, 2.4, 6);
    }

    // For demonstration: assume Ribbon is bullish (drives the trend-aware glow)
    const ribbonBull = true;

    // Plot each level with strength-adaptive styling
    levels.forEach((lvl) => {
      const isResist = lvl.role === 'R';
      const dist = Math.abs(currentPrice - lvl.y);
      const isNear = dist < 25; // proximity threshold for glow
      // Trend-aware: counter-trend approach turns AMBER as warning
      const counterTrend = (isResist && ribbonBull) || (!isResist && !ribbonBull);
      let lineColor: string = isResist ? MAGENTA : TEAL;
      if (isNear && counterTrend) lineColor = AMBER;

      // Style by strength
      let lineDash: number[] = [];
      let lineWidth = 1;
      if (lvl.strength <= 1) {
        lineDash = [2, 4];
        lineWidth = 1;
      } else if (lvl.strength === 2) {
        lineDash = [6, 4];
        lineWidth = 2;
      } else {
        lineDash = [];
        lineWidth = 3;
      }
      // Proximity bumps style up one tier (per Pine logic)
      if (isNear && lvl.strength <= 1) {
        lineDash = [6, 4];
      } else if (isNear && lvl.strength === 2) {
        lineDash = [];
      }

      const baseAlpha = 0.4 + lvl.strength * 0.15 + (isNear ? 0.15 : 0);
      ctx.strokeStyle = lineColor + Math.round(baseAlpha * 255).toString(16).padStart(2, '0');
      ctx.lineWidth = lineWidth;
      ctx.setLineDash(lineDash);
      ctx.beginPath();
      ctx.moveTo(padX + 6, lvl.y);
      ctx.lineTo(padX + chartW - 50, lvl.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Right-edge label
      ctx.font = 'bold 9px ui-sans-serif, system-ui';
      ctx.fillStyle = lineColor + 'cc';
      ctx.textAlign = 'left';
      ctx.fillText(lvl.label, padX + chartW - 44, lvl.y + 3);
    });

    // ── Bottom legend showing the four tiers ──
    const legendY = padY + chartH - 4;
    const legendItems = [
      { strength: 0, label: 'dotted thin' },
      { strength: 1, label: 'dotted bold' },
      { strength: 2, label: 'dashed' },
      { strength: 3, label: 'solid' },
    ];
    void legendItems;
    void legendY;

    // Top label
    ctx.font = 'bold 10px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = AMBER;
    ctx.fillText('STRENGTH 0 \u2192 1 \u2192 2 \u2192 3   (top to bottom: Very Strong \u2192 Speculative)', padX + chartW / 2, padY + 18);

    // Bottom caption
    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillText('Strength changes the line. Counter-trend proximity turns it amber.', padX + chartW / 2, h - 8);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 8 — LevelTooltipAnim (S08)
// Recreates the actual tooltip from Image 2: hovering a level reveals
// 6 lines of metadata. The animation pulses a faint hover glow over
// the level then reveals the tooltip card with text fade-in.
// ============================================================
function LevelTooltipAnim() {
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
    const baseY = padY + chartH * 0.65;

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.strokeRect(padX, padY, chartW, chartH);

    // Level at fixed y
    const levelY = padY + chartH * 0.20;

    // Generate price action below the level
    const N = 50;
    const prices: number[] = [];
    for (let i = 0; i < N; i++) {
      const x = i / (N - 1);
      prices.push(baseY - Math.sin(x * Math.PI * 1.5) * 14 + Math.sin(i * 0.6) * 4);
    }
    const px = (i: number) => padX + 6 + (i / (N - 1)) * (chartW - 12);

    // Plot candles
    for (let i = 0; i < N; i++) {
      ctx.fillStyle = i % 3 === 0 ? 'rgba(38,166,154,0.45)' : 'rgba(239,83,80,0.45)';
      ctx.fillRect(px(i) - 1.4, prices[i] - 4, 2.8, 8);
    }

    // Plot the level (resistance, strength 2 = dashed)
    ctx.strokeStyle = MAGENTA + 'cc';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(padX + 6, levelY);
    ctx.lineTo(padX + chartW - 6, levelY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Test dot at left
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 14px ui-sans-serif, system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('\u2022', padX + 14, levelY - 6);

    // Price label at right edge
    ctx.font = 'bold 10px ui-sans-serif, system-ui';
    ctx.fillStyle = MAGENTA;
    ctx.textAlign = 'left';
    ctx.fillText('5602.225', padX + chartW - 50, levelY - 4);

    // Cycle 8s — hover glow pulses then tooltip reveals
    const cycle = 8.0;
    const cycT = t % cycle;
    const tipReveal = cycT > 1.5;
    const tipFade = Math.min(1, (cycT - 1.5) / 0.6);

    // Hover glow over the dot
    if (cycT > 0.5) {
      const glowPulse = 0.5 + 0.5 * Math.sin(t * 4);
      ctx.fillStyle = `rgba(255,179,0,${0.20 + glowPulse * 0.20})`;
      ctx.beginPath();
      ctx.arc(padX + 18, levelY - 2, 12, 0, Math.PI * 2);
      ctx.fill();
    }

    // Tooltip card — appears top-right area
    if (tipReveal) {
      const tipX = padX + chartW * 0.45;
      const tipY = padY + 32;
      const tipW = 240;
      const tipH = 132;

      ctx.globalAlpha = tipFade;
      ctx.fillStyle = 'rgba(0,0,0,0.85)';
      ctx.fillRect(tipX, tipY, tipW, tipH);
      ctx.strokeStyle = 'rgba(255,255,255,0.20)';
      ctx.strokeRect(tipX, tipY, tipW, tipH);

      // Tooltip header — RESISTANCE 5602.225
      ctx.font = 'bold 11px ui-sans-serif, system-ui';
      ctx.textAlign = 'left';
      ctx.fillStyle = MAGENTA;
      ctx.fillText('RESISTANCE  5602.225', tipX + 10, tipY + 18);

      // Divider
      ctx.strokeStyle = 'rgba(255,255,255,0.20)';
      ctx.beginPath();
      ctx.moveTo(tipX + 10, tipY + 28);
      ctx.lineTo(tipX + tipW - 10, tipY + 28);
      ctx.stroke();

      // Six metadata lines (matches Image 2 exactly)
      const lines = [
        { label: 'Age:', value: '62 bars' },
        { label: 'Tests:', value: '1 / 4' },
        { label: 'Strength:', value: 'Strong (2/3)' },
        { label: 'Confluence:', value: '1 factor' },
        { label: 'Distance:', value: '8.1 ATR' },
      ];

      ctx.font = '10px ui-sans-serif, system-ui';
      lines.forEach((l, i) => {
        const ly = tipY + 44 + i * 16;
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

      // Connecting line from dot to tooltip
      ctx.strokeStyle = 'rgba(255,179,0,0.40)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(padX + 18, levelY);
      ctx.lineTo(tipX, tipY + tipH / 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Bottom caption
    ctx.font = '10px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.textAlign = 'center';
    ctx.fillText('Hover any level. The full record is one mouse-over away.', padX + chartW / 2, h - 8);

    void TEAL;
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 9 — SpineAnatomyAnim (S09)
// The dual-midpoint blend visualised: tight midpoint (5-bar high+low/2)
// plus smooth midpoint (21-bar high+low/2), blended by health weight.
// Two thin reference lines + the spine line that moves between them as
// health weight oscillates.
// ============================================================
function SpineAnatomyAnim() {
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
    const meterX = padX + chartW + 14;
    const meterW = w - meterX - padX;

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.strokeRect(padX, padY, chartW, chartH);

    // Cycle 10s — health weight oscillates, spine moves between midpoints
    const cycle = 10.0;
    const cycT = t % cycle;
    // Health oscillates: 1.0 (fully tight, healthy) → 0.0 (fully smooth, dying) → 1.0
    const healthCycle = (cycT / cycle) * Math.PI * 2;
    const healthWeight = 0.5 + 0.45 * Math.cos(healthCycle); // 0.05 to 0.95

    // Generate price action
    const N = 60;
    const baseY = padY + chartH * 0.55;
    const prices: number[] = [];
    for (let i = 0; i < N; i++) {
      const x = i / (N - 1);
      prices.push(baseY - Math.sin(x * Math.PI * 2.6) * 18 + Math.sin(i * 0.9) * 6);
    }
    const px = (i: number) => padX + 6 + (i / (N - 1)) * (chartW - 12);

    // Compute tight midpoint (5-bar) and smooth midpoint (21-bar)
    const tightMid: number[] = [];
    const smoothMid: number[] = [];
    for (let i = 0; i < N; i++) {
      const tStart = Math.max(0, i - 4);
      let hiT = -Infinity, loT = Infinity;
      for (let j = tStart; j <= i; j++) {
        if (prices[j] < hiT) hiT = prices[j]; // Note: y inverted
        if (prices[j] > loT) loT = prices[j];
      }
      // Wait, in price space lower y is higher price. Let's keep it conceptual:
      // We'll just compute the midpoint of recent y range.
      let yMin = Infinity, yMax = -Infinity;
      for (let j = tStart; j <= i; j++) {
        if (prices[j] < yMin) yMin = prices[j];
        if (prices[j] > yMax) yMax = prices[j];
      }
      tightMid.push((yMin + yMax) / 2);

      const sStart = Math.max(0, i - 20);
      let yMinS = Infinity, yMaxS = -Infinity;
      for (let j = sStart; j <= i; j++) {
        if (prices[j] < yMinS) yMinS = prices[j];
        if (prices[j] > yMaxS) yMaxS = prices[j];
      }
      smoothMid.push((yMinS + yMaxS) / 2);
    }

    // Spine = tight × healthWeight + smooth × (1 - healthWeight)
    const spinePts: number[] = [];
    for (let i = 0; i < N; i++) {
      spinePts.push(tightMid[i] * healthWeight + smoothMid[i] * (1 - healthWeight));
    }

    // Plot candles
    for (let i = 0; i < N; i++) {
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.fillRect(px(i) - 1.2, prices[i] - 3, 2.4, 6);
    }

    // Plot tight midpoint (faint teal dotted)
    ctx.strokeStyle = 'rgba(38,166,154,0.45)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(px(0), tightMid[0]);
    for (let i = 1; i < N; i++) ctx.lineTo(px(i), tightMid[i]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Plot smooth midpoint (faint magenta dotted)
    ctx.strokeStyle = 'rgba(239,83,80,0.45)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(px(0), smoothMid[0]);
    for (let i = 1; i < N; i++) ctx.lineTo(px(i), smoothMid[i]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Plot the actual Spine — colour depends on health
    const spineColor = healthWeight > 0.6 ? TEAL : healthWeight < 0.4 ? AMBER : 'rgba(255,255,255,0.7)';
    ctx.strokeStyle = spineColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px(0), spinePts[0]);
    for (let i = 1; i < N; i++) ctx.lineTo(px(i), spinePts[i]);
    ctx.stroke();

    // Labels at right edge
    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(38,166,154,0.85)';
    ctx.fillText('tight (5b)', px(N - 1) + 4, tightMid[N - 1] + 3);
    ctx.fillStyle = 'rgba(239,83,80,0.85)';
    ctx.fillText('smooth (21b)', px(N - 1) + 4, smoothMid[N - 1] + 3);
    ctx.font = 'bold 10px ui-sans-serif, system-ui';
    ctx.fillStyle = spineColor;
    ctx.fillText('SPINE', px(N - 1) + 4, spinePts[N - 1] + 3);

    // ── Health weight meter on right ──
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(meterX, padY, meterW, chartH);
    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.strokeRect(meterX, padY, meterW, chartH);

    ctx.font = 'bold 9px ui-sans-serif, system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = AMBER;
    ctx.fillText('HEALTH WEIGHT', meterX + 8, padY + 16);

    // Vertical bar
    const barX = meterX + 14;
    const barY = padY + 30;
    const barW = 16;
    const barH = chartH - 60;
    ctx.strokeStyle = 'rgba(255,255,255,0.20)';
    ctx.strokeRect(barX, barY, barW, barH);
    const fillH = healthWeight * (barH - 2);
    ctx.fillStyle = healthWeight > 0.6 ? TEAL : healthWeight < 0.4 ? AMBER : 'rgba(255,255,255,0.45)';
    ctx.fillRect(barX + 1, barY + barH - fillH - 1, barW - 2, fillH);

    // Endpoint labels
    ctx.font = '8px ui-sans-serif, system-ui';
    ctx.fillStyle = TEAL;
    ctx.textAlign = 'left';
    ctx.fillText('1.0', barX + barW + 4, barY + 6);
    ctx.fillText('healthy', barX + barW + 4, barY + 16);
    ctx.fillText('= tight', barX + barW + 4, barY + 26);

    ctx.fillStyle = AMBER;
    ctx.fillText('0.0', barX + barW + 4, barY + barH - 18);
    ctx.fillText('dying', barX + barW + 4, barY + barH - 8);
    ctx.fillText('= smooth', barX + barW + 4, barY + barH + 2);

    // Numeric value
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.fillStyle = spineColor;
    ctx.textAlign = 'center';
    ctx.fillText(healthWeight.toFixed(2), meterX + meterW / 2, padY + chartH - 14);

    // Bottom caption
    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.textAlign = 'center';
    ctx.fillText('spine = tight \u00D7 weight + smooth \u00D7 (1 \u2212 weight)', padX + chartW / 2, h - 8);

    void MAGENTA;
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 10 — HealthAdaptiveBandsAnim (S10)
// Spine bands breathing wide and narrow as health weight oscillates.
// At health = 1.0 (healthy), bands are tight (~0.6 ATR). At 0.0
// (dying), bands are wide (~1.8 ATR). Inner band vivid, outer band
// faded, gradient depth.
// ============================================================
function HealthAdaptiveBandsAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';

    ctx.fillStyle = '#0a0f1a';
    ctx.fillRect(0, 0, w, h);

    const padX = 24;
    const padY = 28;
    const chartW = w * 0.72 - padX;
    const chartH = h - padY * 2 - 22;
    const meterX = padX + chartW + 14;
    const meterW = w - meterX - padX;

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.strokeRect(padX, padY, chartW, chartH);

    // Cycle 12s — health oscillates
    const cycle = 12.0;
    const cycT = t % cycle;
    const phase = (cycT / cycle) * Math.PI * 2;
    const healthWeight = 0.5 + 0.45 * Math.cos(phase); // 0.05 to 0.95

    const N = 60;
    const baseY = padY + chartH * 0.55;
    const prices: number[] = [];
    const spinePts: number[] = [];
    for (let i = 0; i < N; i++) {
      const x = i / (N - 1);
      const p = baseY - Math.sin(x * Math.PI * 2.4) * 14 + Math.sin(i * 0.7) * 5;
      prices.push(p);
      // Simple smoothed spine
      const lookback = Math.max(0, i - 8);
      let sum = 0;
      for (let j = lookback; j <= i; j++) sum += prices[j];
      spinePts.push(sum / (i - lookback + 1));
    }
    const px = (i: number) => padX + 6 + (i / (N - 1)) * (chartW - 12);

    // Band width: 0.6 ATR (healthy) to 1.8 ATR (dying)
    // In pixel space: ~12px (healthy) to ~36px (dying)
    const bandWidthPx = 12 + (1 - healthWeight) * 24;
    const innerBandPx = bandWidthPx * 0.4;

    // Plot price candles (faint backdrop)
    for (let i = 0; i < N; i++) {
      ctx.fillStyle = 'rgba(255,255,255,0.20)';
      ctx.fillRect(px(i) - 1.2, prices[i] - 3, 2.4, 6);
    }

    // Outer band fill
    ctx.beginPath();
    ctx.moveTo(px(0), spinePts[0] - bandWidthPx);
    for (let i = 1; i < N; i++) ctx.lineTo(px(i), spinePts[i] - bandWidthPx);
    for (let i = N - 1; i >= 0; i--) ctx.lineTo(px(i), spinePts[i] + bandWidthPx);
    ctx.closePath();
    const outerAlpha = 0.05 + (1 - healthWeight) * 0.04;
    ctx.fillStyle = healthWeight > 0.5
      ? `rgba(38,166,154,${outerAlpha})`
      : `rgba(255,179,0,${outerAlpha})`;
    ctx.fill();

    // Inner band fill (vivid)
    ctx.beginPath();
    ctx.moveTo(px(0), spinePts[0] - innerBandPx);
    for (let i = 1; i < N; i++) ctx.lineTo(px(i), spinePts[i] - innerBandPx);
    for (let i = N - 1; i >= 0; i--) ctx.lineTo(px(i), spinePts[i] + innerBandPx);
    ctx.closePath();
    const innerAlpha = 0.20 + healthWeight * 0.05;
    ctx.fillStyle = healthWeight > 0.5
      ? `rgba(38,166,154,${innerAlpha})`
      : `rgba(255,179,0,${innerAlpha})`;
    ctx.fill();

    // Spine line itself
    ctx.beginPath();
    ctx.moveTo(px(0), spinePts[0]);
    for (let i = 1; i < N; i++) ctx.lineTo(px(i), spinePts[i]);
    ctx.strokeStyle = healthWeight > 0.6 ? TEAL : AMBER;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Top label
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = healthWeight > 0.6 ? TEAL : AMBER;
    const stateLabel = healthWeight > 0.7
      ? 'HEALTHY \u00B7 BANDS TIGHT (\u22480.6 ATR)'
      : healthWeight > 0.4
      ? 'TRANSITIONING \u00B7 BANDS NORMAL'
      : 'DYING \u00B7 BANDS WIDE (\u22481.8 ATR)';
    ctx.fillText(stateLabel, padX + chartW / 2, padY + 18);

    // ── Side meter ──
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(meterX, padY, meterW, chartH);
    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.strokeRect(meterX, padY, meterW, chartH);

    ctx.font = 'bold 9px ui-sans-serif, system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = AMBER;
    ctx.fillText('BAND WIDTH', meterX + 8, padY + 16);

    // Band width visual (a small horizontal band illustration)
    const showW = meterW - 24;
    const showCenter = padY + chartH * 0.45;
    const showBandH = bandWidthPx;
    ctx.fillStyle = healthWeight > 0.6 ? 'rgba(38,166,154,0.30)' : 'rgba(255,179,0,0.30)';
    ctx.fillRect(meterX + 12, showCenter - showBandH, showW, showBandH * 2);
    // Center line through it
    ctx.strokeStyle = healthWeight > 0.6 ? TEAL : AMBER;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(meterX + 12, showCenter);
    ctx.lineTo(meterX + 12 + showW, showCenter);
    ctx.stroke();

    // ATR readout
    ctx.font = 'bold 10px ui-sans-serif, system-ui';
    ctx.fillStyle = healthWeight > 0.6 ? TEAL : AMBER;
    ctx.textAlign = 'center';
    const atrApprox = (1.8 - healthWeight * 1.2).toFixed(2);
    ctx.fillText(atrApprox + ' ATR', meterX + meterW / 2, showCenter + showBandH + 24);

    ctx.font = '8px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillText('Health weight: ' + healthWeight.toFixed(2), meterX + meterW / 2, padY + chartH - 10);

    // Bottom caption
    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.textAlign = 'center';
    ctx.fillText('width = ATR \u00D7 (1.8 \u2212 health \u00D7 1.2)', padX + chartW / 2, h - 8);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 11 — SpinePriceGapAnim (S11)
// Cycles through the 4 spine-price gap states: TRACKING (<0.4 ATR),
// LOOSE (0.4-0.8), DRIFTING (0.8-1.5), DETACHED (>1.5). Price stays
// in roughly the same position; the spine drifts away further with
// each phase, with the gap labelled.
// ============================================================
function SpinePriceGapAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';

    ctx.fillStyle = '#0a0f1a';
    ctx.fillRect(0, 0, w, h);

    const padX = 24;
    const padY = 28;
    const chartW = w - padX * 2;
    const chartH = h - padY * 2 - 22;
    const baseY = padY + chartH * 0.50;

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.strokeRect(padX, padY, chartW, chartH);

    // Cycle 16s — 4 phases of 4s each
    const phaseDur = 4.0;
    const cycle = t % (phaseDur * 4);
    const phase = Math.floor(cycle / phaseDur);
    // 0=TRACKING, 1=LOOSE, 2=DRIFTING, 3=DETACHED

    const N = 50;
    const prices: number[] = [];
    for (let i = 0; i < N; i++) {
      const x = i / (N - 1);
      // Bullish trend in price
      prices.push(baseY - x * chartH * 0.18 + Math.sin(x * Math.PI * 3.5) * 5);
    }
    const px = (i: number) => padX + 6 + (i / (N - 1)) * (chartW - 12);

    // Spine drifts further from price each phase
    const driftFactors = [0.10, 0.45, 0.95, 1.65]; // gap in ATR units
    const atrPx = 22; // pixel scale for 1 ATR
    const driftPx = driftFactors[phase] * atrPx;

    // Spine stays roughly static — at smooth 21-bar midpoint of the trend
    const spinePts: number[] = [];
    for (let i = 0; i < N; i++) {
      // Smooth midpoint
      const lookback = Math.max(0, i - 20);
      let sum = 0;
      for (let j = lookback; j <= i; j++) sum += prices[j];
      const smoothMid = sum / (i - lookback + 1);
      // Drift down by driftPx (away from rising price)
      spinePts.push(smoothMid + driftPx);
    }

    // Plot price candles
    for (let i = 0; i < N; i++) {
      ctx.fillStyle = 'rgba(38,166,154,0.55)';
      ctx.fillRect(px(i) - 1.4, prices[i] - 4, 2.8, 8);
    }

    // Plot spine — colour by drift severity
    const spineColors = [TEAL, TEAL, AMBER, MAGENTA];
    ctx.strokeStyle = spineColors[phase];
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px(0), spinePts[0]);
    for (let i = 1; i < N; i++) ctx.lineTo(px(i), spinePts[i]);
    ctx.stroke();

    // Gap visual: vertical dotted line from latest price to spine
    const gapX = px(N - 4);
    const gapTop = prices[N - 4];
    const gapBot = spinePts[N - 4];
    ctx.strokeStyle = phase === 0 ? 'rgba(38,166,154,0.7)' : phase === 1 ? 'rgba(255,179,0,0.6)' : phase === 2 ? 'rgba(255,179,0,0.85)' : 'rgba(239,83,80,0.9)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(gapX, gapTop);
    ctx.lineTo(gapX, gapBot);
    ctx.stroke();
    ctx.setLineDash([]);

    // Gap value label
    ctx.font = 'bold 10px ui-sans-serif, system-ui';
    ctx.fillStyle = spineColors[phase];
    ctx.textAlign = 'left';
    const gapVal = driftFactors[phase].toFixed(2) + ' ATR';
    ctx.fillText(gapVal, gapX + 6, (gapTop + gapBot) / 2);

    // Top label
    ctx.font = 'bold 12px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    const stateLabels = ['TRACKING', 'LOOSE', 'DRIFTING', 'DETACHED'];
    const stateDescs = [
      'spine_gap < 0.4 ATR',
      '0.4 \u2264 spine_gap < 0.8 ATR',
      '0.8 \u2264 spine_gap < 1.5 ATR',
      'spine_gap \u2265 1.5 ATR',
    ];
    ctx.fillStyle = spineColors[phase];
    ctx.fillText(stateLabels[phase], padX + chartW / 2, padY + 18);
    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillText(stateDescs[phase], padX + chartW / 2, padY + 32);

    // Phase progress dots
    const dotsY = h - 8;
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = i === phase ? spineColors[i] : 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      ctx.arc(padX + 10 + i * 16, dotsY, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 12 — StructureRowCascadeAnim (S12)
// The 7-verdict priority cascade for the Structure Command Center row.
// Visualises the cascade evaluating top-down with inputs from the live
// nearest_sup_dist and nearest_res_dist values. Cycles through 4 demo
// states showing different verdicts winning.
// ============================================================
function StructureRowCascadeAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const MAGENTA = '#EF5350';
    const AMBER = '#FFB300';

    ctx.fillStyle = '#0a0f1a';
    ctx.fillRect(0, 0, w, h);

    const padX = 24;
    const padY = 18;
    const chartW = w - padX * 2;
    const chartH = h - padY - 16;

    // 4 demo states cycle every 4s
    const phaseDur = 4.0;
    const phase = Math.floor((t % (phaseDur * 4)) / phaseDur);

    type Demo = { sup: number; res: number; verdict: string };
    const demos: Demo[] = [
      { sup: 0.1, res: 2.9, verdict: 'AT SUPPORT' },           // matches Image 6
      { sup: 5.0, res: 0.8, verdict: 'NEAR RESISTANCE' },      // matches Image 5
      { sup: 1.7, res: 3.5, verdict: 'BETWEEN LEVELS' },       // matches Image 1
      { sup: 999, res: 999, verdict: 'NO LEVELS' },            // edge case
    ];
    const demo = demos[phase];

    // Cascade levels
    type Level = { id: string; label: string; matchPredicate: (d: Demo) => boolean };
    const levels: Level[] = [
      { id: '1', label: 'NO LEVELS', matchPredicate: (d) => d.sup >= 999 && d.res >= 999 },
      { id: '2', label: 'DECISION ZONE', matchPredicate: (d) => d.sup < 0.5 && d.res < 0.5 },
      { id: '3', label: 'AT SUPPORT', matchPredicate: (d) => d.sup < 0.5 },
      { id: '4', label: 'AT RESISTANCE', matchPredicate: (d) => d.res < 0.5 },
      { id: '5', label: 'NEAR SUPPORT', matchPredicate: (d) => d.sup < 1.5 },
      { id: '6', label: 'NEAR RESISTANCE', matchPredicate: (d) => d.res < 1.5 },
      { id: '7', label: 'BETWEEN LEVELS', matchPredicate: () => true }, // fallback
    ];

    // Find winner index
    let winnerIdx = -1;
    for (let i = 0; i < levels.length; i++) {
      if (levels[i].matchPredicate(demo)) {
        winnerIdx = i;
        break;
      }
    }

    // Layout
    const inputX = padX + 8;
    const labelX = padX + 100;
    const outputX = padX + chartW - 130;

    // Headers
    ctx.font = 'bold 9px ui-sans-serif, system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fillText('INPUTS', inputX, padY + 6);
    ctx.fillText('CASCADE', labelX, padY + 6);
    ctx.fillText('BROADCAST', outputX, padY + 6);

    // Display the input values (sup_dist, res_dist)
    ctx.font = 'bold 10px ui-sans-serif, system-ui';
    ctx.fillStyle = TEAL;
    ctx.textAlign = 'left';
    ctx.fillText('S ' + (demo.sup >= 999 ? '\u2014' : demo.sup.toFixed(1) + ' ATR'), inputX, padY + 22);
    ctx.fillStyle = MAGENTA;
    ctx.fillText('R ' + (demo.res >= 999 ? '\u2014' : demo.res.toFixed(1) + ' ATR'), inputX, padY + 38);

    // Draw cascade rows
    const cascadeStartY = padY + 56;
    const rowH = (chartH - 60) / levels.length;

    levels.forEach((lvl, i) => {
      const y = cascadeStartY + i * rowH;
      const isWinner = i === winnerIdx;
      const isSuppressed = winnerIdx !== -1 && i > winnerIdx;
      const matches = lvl.matchPredicate(demo);

      // Row text
      ctx.font = isWinner ? 'bold 11px ui-sans-serif, system-ui' : '11px ui-sans-serif, system-ui';
      ctx.textAlign = 'left';
      ctx.globalAlpha = isSuppressed ? 0.20 : isWinner ? 1.0 : 0.55;
      let textColor = '#aaa';
      if (isWinner) {
        if (lvl.label.includes('SUPPORT')) textColor = TEAL;
        else if (lvl.label.includes('RESISTANCE')) textColor = MAGENTA;
        else if (lvl.label === 'DECISION ZONE') textColor = AMBER;
        else textColor = 'rgba(255,255,255,0.85)';
      } else if (isSuppressed) {
        textColor = '#666';
      }
      ctx.fillStyle = textColor;
      ctx.fillText((i + 1) + '. ' + lvl.label, labelX, y + rowH / 2 + 4);
      ctx.globalAlpha = 1;

      // Input dot — lit when this row's predicate matches
      ctx.beginPath();
      ctx.arc(inputX + 6, y + rowH / 2, 3.5, 0, Math.PI * 2);
      let dotColor = 'rgba(255,255,255,0.12)';
      if (matches) {
        if (lvl.label.includes('SUPPORT')) dotColor = TEAL;
        else if (lvl.label.includes('RESISTANCE')) dotColor = MAGENTA;
        else if (lvl.label === 'DECISION ZONE') dotColor = AMBER;
        else dotColor = 'rgba(255,255,255,0.65)';
      }
      ctx.fillStyle = dotColor;
      ctx.fill();

      // Strikethrough on suppressed-but-matched
      if (isSuppressed && matches) {
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.lineWidth = 1;
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

      let outputColor: string = 'rgba(255,255,255,0.6)';
      if (winner.label.includes('SUPPORT')) outputColor = TEAL;
      else if (winner.label.includes('RESISTANCE')) outputColor = MAGENTA;
      else if (winner.label === 'DECISION ZONE') outputColor = AMBER;

      // Connecting line from cascade winner to output
      const winnerY = cascadeStartY + winnerIdx * rowH + rowH / 2;
      ctx.strokeStyle = outputColor;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(labelX + 130, winnerY);
      ctx.lineTo(outputX - 4, boxY + boxH / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      const outputColorRgb = winner.label.includes('SUPPORT') ? '38,166,154' : winner.label.includes('RESISTANCE') ? '239,83,80' : winner.label === 'DECISION ZONE' ? '255,179,0' : '255,255,255';
      ctx.fillStyle = `rgba(${outputColorRgb},0.18)`;
      ctx.fillRect(outputX, boxY, boxW, boxH);
      ctx.strokeStyle = outputColor;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(outputX, boxY, boxW, boxH);

      ctx.font = 'bold 10px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillStyle = outputColor;
      ctx.fillText('\u2192 ' + winner.label, outputX + boxW / 2, boxY + boxH / 2 + 4);

      ctx.font = '8px ui-sans-serif, system-ui';
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.fillText('Structure row says:', outputX + boxW / 2, boxY - 4);
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
// ANIMATION 13 — TradingStructureSpineAnim (S14)
// A trade lifecycle on a chart with Structure + Spine. Price approaches
// support, Spine confirms healthy bull, entry placed on bounce, stop
// just BELOW the level (not at it), runner held while sleeve and Spine
// agree, exit when Spine goes amber or detaches.
// ============================================================
function TradingStructureSpineAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';

    ctx.fillStyle = '#0a0f1a';
    ctx.fillRect(0, 0, w, h);

    const padX = 24;
    const padY = 28;
    const chartW = w - padX * 2;
    const chartH = h - padY * 2 - 18;
    const baseY = padY + chartH * 0.55;

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.strokeRect(padX, padY, chartW, chartH);

    const cycle = 12.0;
    const cycT = t % cycle;
    const N = 70;

    // Trade event timing
    const showApproach = cycT > 1.0;
    const showEntry = cycT > 3.0;
    const showRunner = cycT > 6.0;
    const showExit = cycT > 9.5;

    // Generate price action: approach support, bounce, run up, weakness near top
    const supportY = baseY + chartH * 0.20;
    const prices: number[] = [];
    for (let i = 0; i < N; i++) {
      const x = i / (N - 1);
      let p = baseY;
      if (x < 0.20) {
        // Approach support from above
        p = baseY - chartH * 0.05 + x * chartH * 0.20;
      } else if (x < 0.30) {
        // Bounce (touches support, recovers)
        p = supportY - 2 + Math.sin((x - 0.20) * Math.PI * 6) * 4;
      } else if (x < 0.85) {
        // Run upward
        const runT = (x - 0.30) / 0.55;
        p = supportY - runT * chartH * 0.25 + Math.sin(runT * Math.PI * 4) * 5;
      } else {
        // Weakness at top
        const weakT = (x - 0.85) / 0.15;
        p = supportY - chartH * 0.25 + weakT * chartH * 0.06;
      }
      prices.push(p);
    }

    // Spine — tracks tightly during run, drifts during weakness
    const spinePts: number[] = [];
    for (let i = 0; i < N; i++) {
      const x = i / (N - 1);
      const lookback = Math.max(0, i - 8);
      let sum = 0;
      for (let j = lookback; j <= i; j++) sum += prices[j];
      let spine = sum / (i - lookback + 1);
      // During weakness phase, spine drifts further from price
      if (x > 0.85) {
        const driftAmount = (x - 0.85) / 0.15 * 14;
        spine += driftAmount; // drift down from price
      }
      spinePts.push(spine);
    }

    const px = (i: number) => padX + 6 + (i / (N - 1)) * (chartW - 12);

    // ── Plot the support level ──
    ctx.strokeStyle = TEAL;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(padX + 6, supportY);
    ctx.lineTo(padX + chartW - 6, supportY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = 'bold 9px ui-sans-serif, system-ui';
    ctx.fillStyle = TEAL;
    ctx.textAlign = 'left';
    ctx.fillText('SUPPORT 4644', padX + 8, supportY - 6);

    // ── Plot price candles ──
    for (let i = 0; i < N; i++) {
      const isUp = i > 0 && prices[i] < prices[i - 1];
      ctx.fillStyle = isUp ? 'rgba(38,166,154,0.65)' : 'rgba(239,83,80,0.55)';
      ctx.fillRect(px(i) - 1.4, prices[i] - 4, 2.8, 8);
    }

    // ── Plot Spine (only if showApproach) ──
    if (showApproach) {
      // Inner band
      const innerW = 8;
      ctx.beginPath();
      ctx.moveTo(px(0), spinePts[0] - innerW);
      for (let i = 1; i < N; i++) ctx.lineTo(px(i), spinePts[i] - innerW);
      for (let i = N - 1; i >= 0; i--) ctx.lineTo(px(i), spinePts[i] + innerW);
      ctx.closePath();
      ctx.fillStyle = 'rgba(38,166,154,0.18)';
      ctx.fill();

      // Spine line — colour shifts to amber during weakness phase
      for (let i = 1; i < N; i++) {
        const x = i / (N - 1);
        ctx.strokeStyle = x > 0.85 ? AMBER : TEAL;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px(i - 1), spinePts[i - 1]);
        ctx.lineTo(px(i), spinePts[i]);
        ctx.stroke();
      }
    }

    // ── Trade markers ──
    if (showEntry) {
      const entryIdx = Math.floor(N * 0.30);
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

      // Stop line BELOW the support level
      const stopY = supportY + 14;
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
      ctx.fillText('STOP \u00B7 below support, not at it', px(0) + 6, stopY + 12);
    }

    if (showRunner) {
      const runIdx = Math.floor(N * 0.65);
      const sx = px(runIdx);
      const sy = prices[runIdx] - 12;
      ctx.fillStyle = AMBER;
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold 9px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillStyle = AMBER;
      ctx.fillText('RUNNER', sx, sy - 8);
      ctx.font = '8px ui-sans-serif, system-ui';
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillText('Spine still tracking', sx, sy + 14);
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
      ctx.fillText('Spine drifting', xx, xy + 14);
    }

    // Top label
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = TEAL;
    ctx.fillText('STRUCTURE + SPINE TRADE LIFECYCLE', padX + chartW / 2, padY + 18);

    // Stage indicator
    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    let stage = 'WAITING';
    if (showExit) stage = 'STAGE 4 \u00B7 EXIT (spine drifting)';
    else if (showRunner) stage = 'STAGE 3 \u00B7 RUNNER (spine tracking)';
    else if (showEntry) stage = 'STAGE 2 \u00B7 ENTRY (spine confirms)';
    else if (showApproach) stage = 'STAGE 1 \u00B7 APPROACHING SUPPORT';
    ctx.fillText(stage, padX + chartW / 2, padY + chartH - 6);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function CipherStructureSpineLesson() {
  const [scrollY, setScrollY] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameRound, setGameRound] = useState(0);
  const [gameSelections, setGameSelections] = useState<(string | null)[]>(new Array(gameRounds.length).fill(null));
  const [quizAnswers, setQuizAnswers] = useState<(string | null)[]>(new Array(quizQuestions.length).fill(null));
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [certRevealed, setCertRevealed] = useState(false);
  const [certId] = useState(() => `PRO-CERT-L11.17-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);

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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 11 &middot; Lesson 17</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Cipher Structure + Spine<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>The Levels and the Reader</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">Structure paints the institutional levels. Spine reads where price sits between them. Together they answer two questions every operator holds at once: where are you, and how are you doing there?</motion.p>
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
            <p className="text-xl font-extrabold mb-3">A chart without levels has no language for price. A chart with levels but no reader has no awareness of where it is.</p>
            <p className="text-gray-400 leading-relaxed mb-4">Two traders look at the same XAUUSD chart. The first traces a horizontal line at every recent high and low &mdash; ten lines, all equal weight, none labelled. They see structure but they can&apos;t <strong className="text-amber-400">read</strong> structure. The second sees nothing on the chart at all but knows price is in &ldquo;a range somewhere.&rdquo; They see context but they can&apos;t <strong className="text-amber-400">locate</strong> it.</p>
            <p className="text-gray-400 leading-relaxed mb-4">CIPHER does both. <strong className="text-white">Cipher Structure</strong> paints the institutional levels &mdash; lifecycle-managed S/R that ages, flips polarity, and grades itself by confluence. <strong className="text-white">Cipher Spine</strong> reads where price sits between those levels, breathing tight when momentum is healthy and drifting wide when it&apos;s dying. Two systems, one chart, complete awareness.</p>
            <p className="text-gray-400 leading-relaxed">This is the lesson where you stop staring at random horizontal lines and start operating with full positional context. Where you are, and how you&apos;re doing there.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#11088; THE STRUCTURE OPERATOR PROMISE</p>
            <p className="text-sm text-gray-400 leading-relaxed">By the end of this lesson you will know the <strong className="text-white">10 fields</strong> CIPHER tracks per level, the <strong className="text-white">4 lifecycle parameters</strong> that age them out, the <strong className="text-white">polarity flip</strong> that turns support into resistance and back, the <strong className="text-white">3 confluence factors</strong> that grade their strength, the <strong className="text-white">dual-midpoint blend</strong> that builds the Spine, and how to <strong className="text-white">trade the pair</strong> &mdash; entries, stops, scale-outs. You stop seeing a chart with lines on it. You start operating in a chart with awareness.</p>
          </div>
        </motion.div>
      </section>

      {/* === S01 — The Levels and the Reader (Groundbreaking Concept) === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; &#11088; The Levels and the Reader</p>
          <h2 className="text-2xl font-extrabold mb-4">The Groundbreaking Concept</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Most indicators give you one thing: a line, a level, a colour. CIPHER&apos;s Structure + Spine pairing gives you two things that have to be read together: <strong className="text-amber-400">the levels and the reader.</strong> Levels alone tell you the chart&apos;s geometry but not where you are in it. A reader alone tells you something about price but not what it&apos;s near. The pair forms a closed loop &mdash; you always know both.</p>
          <LevelsAndReaderAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the animation. <strong className="text-white">Phase 1</strong>: Cipher Structure paints the institutional levels onto the chart &mdash; resistance lines above price, support lines below, each appearing in turn as the engine confirms them. <strong className="text-white">Phase 2</strong>: Cipher Spine appears, threading between the levels with its breathing bands. The Spine doesn&apos;t add new levels &mdash; it reads where price sits relative to the ones already there. <strong className="text-white">Phase 3</strong>: the Command Center Structure row updates with a precise read &mdash; <em>S 2.6 ATR · R 0.8 ATR · NEAR RESISTANCE</em>. Two levels, two distances, one verdict. The chart tells you where you are.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">CIPHER STRUCTURE &middot; THE PAINTER</p>
              <p className="text-sm text-gray-400 leading-relaxed">Lifecycle-managed institutional S/R levels. Each level is born from a swing pivot, ages over time, gets tested by price, and eventually retires &mdash; either by exceeding its test count or its maximum age. While alive, levels can <strong className="text-white">flip polarity</strong>: a support that breaks with conviction becomes resistance; a resistance that breaks becomes support. The painter remembers what the chart has done.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CIPHER SPINE &middot; THE READER</p>
              <p className="text-sm text-gray-400 leading-relaxed">A health-weighted blend of two range midpoints &mdash; one tight (5-bar window), one smooth (21-bar window). When momentum is healthy, the spine hugs price tightly. When momentum is dying, the spine drifts toward the smooth midpoint, exposing a <strong className="text-white">gap</strong> that visualises divergence. The reader feels what the chart is doing.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE COMMAND CENTER ROW</p>
              <p className="text-sm text-gray-400 leading-relaxed">CIPHER fuses the two reads into a single row in the Command Center. Cell 2 displays the nearest support and resistance distances in ATR units &mdash; <strong className="text-white">S 2.2  R 1.4</strong> means support is 2.2 ATR below price, resistance is 1.4 ATR above. Cell 3 outputs a verdict: NO LEVELS, BETWEEN LEVELS, NEAR SUPPORT, NEAR RESISTANCE, AT SUPPORT, AT RESISTANCE, or DECISION ZONE.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHY THE PAIRING MATTERS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Levels without a reader are static. Readers without levels are unanchored. Together they answer two operator questions in one glance: <strong className="text-white">WHERE</strong> is price relative to the institutional geometry, and <strong className="text-white">HOW</strong> is price doing in its current position &mdash; gaining strength, fading, or detaching from the engine.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">NOT BOS / CHoCH</p>
              <p className="text-sm text-gray-400 leading-relaxed">Cipher Structure is <strong className="text-white">not</strong> a Break-of-Structure / Change-of-Character labelling system. ATLAS PHANTOM handles formal SMC structure with named breaks. Cipher Structure is the operator-friendly version: institutional levels with lifecycle, polarity, and confluence &mdash; without the SMC-specific labels.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">NOT ORDER BLOCKS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Cipher Structure draws <strong className="text-white">slim S/R lines</strong>, not thick order block zones. PHANTOM does order blocks. CIPHER does precise levels with a slim buffer (~0.05 ATR), strength-adaptive width (0.03-0.12 ATR), and dotted-to-solid line styling. Levels, not zones.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">NOT A MOVING AVERAGE EITHER</p>
              <p className="text-sm text-gray-400 leading-relaxed">The Spine looks like a smoothed line but it is not an EMA, SMA, or Kaufman MA. It&apos;s a <strong className="text-white">range-midpoint blend</strong> &mdash; the midpoint between recent highs and lows, weighted by momentum health. A different family of math entirely.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Glance at the chart. <strong className="text-white">Read the levels.</strong> Glance at the Spine. <strong className="text-white">Read its position relative to price.</strong> Glance at the Command Center Structure row. <strong className="text-white">Read the verdict.</strong> Three glances, one second each, total context acquired. That is what this lesson trains.</p>
          </div>
        </motion.div>
      </section>

      {/* === S02 — Anatomy of Cipher Structure === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; Anatomy of Cipher Structure</p>
          <h2 className="text-2xl font-extrabold mb-4">Ten fields per level &mdash; a relational record, not a line</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Most S/R indicators draw a line and forget it. CIPHER doesn&apos;t. Every level is a <strong className="text-amber-400">record</strong> &mdash; ten parallel fields tracked from birth to retirement. The line on the chart is the visible tip; underneath sits a structured database that powers everything from the strength tier to the polarity flip to the proximity glow.</p>
          <StructureAnatomyAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the animation. A bar count ticks up on the left chart. A pivot low forms. The level is born, and the right-hand record card populates field by field: price, bar number, role (support, +1), test count, flip count, and the four visual primitives that draw the level on chart. <strong className="text-white">Every level CIPHER displays has all ten fields.</strong> They&apos;re not separate variables &mdash; they&apos;re indexed positions in ten parallel arrays.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">DATA FIELDS &middot; 6 SCALARS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Each level has six scalar fields. <strong className="text-white">zone_price</strong> &mdash; the level&apos;s exact price. <strong className="text-white">zone_bar</strong> &mdash; the bar index when it was born. <strong className="text-white">zone_dir</strong> &mdash; +1 for support, -1 for resistance. <strong className="text-white">zone_tests</strong> &mdash; how many times price has touched it. <strong className="text-white">zone_flips</strong> &mdash; how many times it has changed role (max 2). <strong className="text-white">zone_flip_bar</strong> &mdash; the bar of the last flip, used for the cooldown timer.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">VISUAL FIELDS &middot; 4 PRIMITIVES</p>
              <p className="text-sm text-gray-400 leading-relaxed">Plus four Pine drawing primitives, one per visual feature. <strong className="text-white">zone_box</strong> &mdash; the slim buffer zone with strength-adaptive width and proximity-adaptive transparency. <strong className="text-white">zone_line</strong> &mdash; the actual S/R line, dotted/dashed/solid based on strength. <strong className="text-white">zone_dot</strong> &mdash; the test-count indicator (the &bull; bullets you see on chart). <strong className="text-white">zone_price_lbl</strong> &mdash; the small numeric label at the right edge.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PARALLEL ARRAYS, NOT OBJECTS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Pine Script doesn&apos;t have user-defined types per level here &mdash; CIPHER stores each field as its own array. Level 0 is row 0 across all 10 arrays; level 1 is row 1; and so on. <strong className="text-white">When a level retires, its row is removed from all 10 arrays at once</strong>, keeping them in sync. The relational model lives in the indexing.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">UP TO i_max_zones LEVELS AT ONCE</p>
              <p className="text-sm text-gray-400 leading-relaxed">CIPHER caps the total active levels at <strong className="text-white">i_max_zones</strong> (default 8 above + 8 below = 16 total potential, but the parameter caps the union). When a new level needs to be born and the cap is reached, the <strong className="text-white">weakest existing level</strong> on the same side is pruned &mdash; weakest = oldest plus most-tested. Pruning is automatic and silent.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">WHY 10 FIELDS, NOT 3</p>
              <p className="text-sm text-gray-400 leading-relaxed">A simple S/R indicator needs price + role + line, three fields. CIPHER tracks ten because <strong className="text-white">every operational read &mdash; strength, flip, glow, retirement, tooltip &mdash; needs them</strong>. The age field powers the fade. The flip count and flip bar power the polarity flip cooldown. The test count drives both retirement and the visual style. Ten is the minimum to support all the live behaviours.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHY ARRAYS AND NOT A LINKED LIST</p>
              <p className="text-sm text-gray-400 leading-relaxed">Arrays let CIPHER iterate every active level on every bar &mdash; the per-bar scan computes proximity glow, age decay, test detection, flip detection, and confluence scoring across all levels. <strong className="text-white">Index-aligned arrays make this iteration cheap.</strong> A linked-list approach would have been slower per bar.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE TOOLTIP READS FROM THE RECORD</p>
              <p className="text-sm text-gray-400 leading-relaxed">When you hover any level on chart, the tooltip displays six lines drawn directly from the level&apos;s record &mdash; role, price, age, tests, strength tier, confluence, and ATR distance. The tooltip <strong className="text-white">isn&apos;t computed at hover time</strong>; it&apos;s rendered every bar from the live record. Hover just makes it visible.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">ONCE YOU SEE THE RECORD</p>
            <p className="text-sm text-gray-400 leading-relaxed">Each S/R line stops being a line and becomes a <strong className="text-white">live record</strong> with metadata you can inspect. The next sections walk through how that metadata is born (S03), how it ages out (S04), how it flips polarity (S05), how strength is graded (S06), how the visual changes by strength (S07), and what the tooltip exposes (S08).</p>
          </div>
        </motion.div>
      </section>

      {/* === S03 — How Levels Are Born === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; How Levels Are Born</p>
          <h2 className="text-2xl font-extrabold mb-4">Pivot detection &mdash; the swing that earns a line</h2>
          <p className="text-gray-400 leading-relaxed mb-6">A level isn&apos;t painted because price was at a number once. <strong className="text-amber-400">It&apos;s painted because that number was a confirmed swing.</strong> CIPHER uses Pine&apos;s built-in pivot detection with a single tunable parameter &mdash; <code className="text-white">i_pivot_len</code> &mdash; that defines the lookback and lookforward window. Every confirmed pivot earns a level. Nothing else does.</p>
          <PivotDetectionAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the lookback window scan across the chart. It checks each candidate bar against the <strong className="text-white">five bars to its left and five bars to its right</strong>. A pivot low must be the lowest of all 11 bars in the window. A pivot high must be the highest. The candidate is highlighted amber. When the check passes, a teal pivot marker drops below the bar and a horizontal level extends to the right. <strong className="text-white">That moment is when the level is born.</strong> Its zone_price field gets the candidate&apos;s low (or high), its zone_bar gets the candidate&apos;s index, and the rest of the record initialises.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE PIVOT FORMULA</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">pivot_high = ta.pivothigh(high, i_pivot_len, i_pivot_len)<br />pivot_low &nbsp;= ta.pivotlow(low, i_pivot_len, i_pivot_len)</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">Pine&apos;s <code className="text-white">ta.pivothigh</code> takes the source series, the bars-back, and the bars-forward. CIPHER passes the same value for both. <strong className="text-white">The result is non-NA only on bars where a pivot is confirmed</strong> &mdash; which means the pivot is <em>announced</em> with a delay equal to i_pivot_len bars (because we have to wait i_pivot_len bars after the candidate to confirm).</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">i_pivot_len &middot; DEFAULT 5</p>
              <p className="text-sm text-gray-400 leading-relaxed">The single most important Structure tuning input. Default 5 means each candidate is checked against 5 bars on each side. <strong className="text-white">Lower values</strong> (2-4) produce more levels &mdash; smaller swings qualify. <strong className="text-white">Higher values</strong> (8-15) produce fewer but stronger levels &mdash; only major swings qualify. Range is 2-20.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE i_pivot_len LAG</p>
              <p className="text-sm text-gray-400 leading-relaxed">Because pivots need <em>future</em> bars to confirm, every level appears <strong className="text-white">i_pivot_len bars after the actual pivot bar</strong>. With the default of 5, a level is painted 5 bars after the pivot occurred. This is unavoidable &mdash; pivot confirmation is mathematically the &ldquo;later five bars all stayed above/below this candidate.&rdquo;</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DEDUPLICATION ON BIRTH</p>
              <p className="text-sm text-gray-400 leading-relaxed">When a new pivot would create a level within ~0.3 ATR of an existing level, CIPHER doesn&apos;t paint a duplicate. Instead it <strong className="text-white">marks the existing level as having been retested</strong> &mdash; the test counter increments, the existing level&apos;s strength upgrades, and the chart stays uncluttered.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">SUPPORT VS RESISTANCE AT BIRTH</p>
              <p className="text-sm text-gray-400 leading-relaxed">A pivot low becomes support (zone_dir = +1) <strong className="text-white">if its price is below the close at the moment of birth</strong>. A pivot high becomes resistance (zone_dir = -1) <strong className="text-white">if its price is above the close</strong>. Pivots that birth on the &ldquo;wrong&rdquo; side (e.g. a pivot low above current price) are skipped &mdash; they wouldn&apos;t function as support.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">BIRTH ON FRESH CHARTS</p>
              <p className="text-sm text-gray-400 leading-relaxed">When you first load CIPHER on a chart, no levels exist. The arrays are empty. As bars play through, pivots are detected and levels are born. <strong className="text-white">After 100-200 bars on most timeframes, the level set has stabilised</strong> &mdash; new births are matched roughly 1:1 by retirements through age or test cap.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">BIRTH ON LIVE BARS</p>
              <p className="text-sm text-gray-400 leading-relaxed">CIPHER doesn&apos;t fire pivots intra-bar. Pivots only confirm <strong className="text-white">on closed bars</strong> &mdash; specifically, on the bar that&apos;s i_pivot_len ahead of the candidate. New levels appear at bar close, never mid-bar. This prevents flickering levels that appear and disappear as the candle wiggles.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">When a new horizontal level appears on your chart, it didn&apos;t arrive at random. <strong className="text-white">It just confirmed as a pivot</strong> i_pivot_len bars ago, and the engine has now finished checking that the surrounding bars stayed on the correct side. New level = institutional swing the chart just confirmed. Trust the appearance.</p>
          </div>
        </motion.div>
      </section>

      {/* === S04 — Level Lifecycle === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Level Lifecycle</p>
          <h2 className="text-2xl font-extrabold mb-4">Two paths to retirement &mdash; tests and age</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Every level has a finite lifespan. Either it gets <strong className="text-amber-400">tested too many times and is retired as &ldquo;liquidity consumed,&rdquo;</strong> or it ages out as &ldquo;no longer relevant.&rdquo; A third path &mdash; <strong className="text-amber-400">pruning</strong> &mdash; happens when too many levels exist on one side and the weakest gets dropped to make room for new births. All three paths are silent and automatic.</p>
          <LevelLifecycleAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the two paths. <strong className="text-white">Path A &mdash; tests retirement</strong>: each touch increments the test counter, with the visual showing each touch as a &bull; dot. After four touches, the level retires. The thinking: institutional liquidity at that level is consumed &mdash; the orders that used to defend it have been filled. <strong className="text-white">Path B &mdash; age retirement</strong>: bars pass, the age counter ticks up. After 100 bars, age decay starts (the level fades visually). After 200 bars, the level retires regardless of test count. The thinking: a level no one cares about anymore isn&apos;t a level.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">i_zone_max_tests &middot; DEFAULT 4</p>
              <p className="text-sm text-gray-400 leading-relaxed">After this many touches, the level retires. Range 2-6. <strong className="text-white">Lower values</strong> (2-3) treat each level as a one-shot opportunity &mdash; first bounce only. <strong className="text-white">Higher values</strong> (5-6) let levels persist through more retests &mdash; useful for longer timeframes where the same swing high gets tested multiple times before failing.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">i_zone_max_age &middot; DEFAULT 200 BARS</p>
              <p className="text-sm text-gray-400 leading-relaxed">After this many bars since birth, the level retires regardless of test count. Range 50-500. <strong className="text-white">Lower values</strong> (50-100) keep the chart dominated by recent levels &mdash; relevant for fast-moving assets. <strong className="text-white">Higher values</strong> (300-500) preserve historical levels longer &mdash; useful for swing traders watching long-term S/R.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">AGE DECAY KICKS IN AT 100 BARS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Before reaching the age cap, levels start <strong className="text-white">visually fading</strong> beyond 100 bars. The fade is gradual: every 25 bars past 100 reduces the line opacity by another step. By the time a level is approaching its 200-bar retirement, it&apos;s already dim &mdash; the operator has had warning.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">i_max_zones &middot; DEFAULT 8</p>
              <p className="text-sm text-gray-400 leading-relaxed">The total cap on active levels per side &mdash; up to 8 supports below price plus up to 8 resistances above. When a new pivot would push the count above the cap, the <strong className="text-white">weakest existing level on that side is pruned</strong>. Weakest is computed as <em>age + tests &times; 50</em> &mdash; older and more-tested levels are pruned first.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">RETIREMENT IS NOT THE SAME AS A FLIP</p>
              <p className="text-sm text-gray-400 leading-relaxed">A level can be on the verge of retirement (high age, near max tests) and then suddenly <strong className="text-white">flip polarity</strong> instead. The flip rule (covered in S05) takes precedence over the test-count retirement: if a level is being broken with conviction at the moment retirement would fire, the flip is allowed instead. Liquidity that gets blown through doesn&apos;t vanish &mdash; it converts.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE LIFECYCLE GIVES YOU SIGNAL</p>
              <p className="text-sm text-gray-400 leading-relaxed">A level on its 4th test is approaching retirement &mdash; <strong className="text-white">trade the bounce with tighter stops because it&apos;s probably the last one</strong>. A level fading from age decay is losing relevance &mdash; <strong className="text-white">don&apos;t place a setup on it</strong>. The lifecycle isn&apos;t bookkeeping; it&apos;s information about which levels still matter.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PRUNING IS SILENT, RETIREMENT IS COMPLETE</p>
              <p className="text-sm text-gray-400 leading-relaxed">When a level is pruned or retired, the visual disappears entirely &mdash; line, box, dots, price label all vanish at the same bar. <strong className="text-white">There is no &ldquo;retired but historical&rdquo; state</strong>. CIPHER&apos;s philosophy: if a level isn&apos;t actionable, don&apos;t draw it. Old levels you remember from yesterday won&apos;t be on tomorrow&apos;s chart unless they&apos;re still active.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Every level on your chart is <strong className="text-white">currently relevant</strong> by definition &mdash; if it weren&apos;t, CIPHER would have retired it. Track the test count (the &bull; dots) to know how many bounces a level has left. Watch for the visual fade as a level approaches age retirement. <strong className="text-white">A faint line is a dying level; trade it carefully or not at all.</strong></p>
          </div>
        </motion.div>
      </section>

      {/* === S05 — The Polarity Flip === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; The Polarity Flip</p>
          <h2 className="text-2xl font-extrabold mb-4">When support breaks, it becomes resistance &mdash; with rules</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Pure S/R indicators throw away levels that get broken. CIPHER doesn&apos;t. <strong className="text-amber-400">A support that breaks with conviction becomes a resistance, and vice versa.</strong> The level&apos;s record is preserved, its role inverts, its colour switches, its test counter resets, and a flip glyph replaces the test dots. The same liquidity zone that was defended now repels &mdash; same price, opposite job.</p>
          <PolarityFlipAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the four stages. <strong className="text-white">Stage 1</strong>: support holding, price bouncing. <strong className="text-white">Stage 2</strong>: price closes below the level for the first time &mdash; the line shifts amber as a transitional warning. <strong className="text-white">Stage 3</strong>: second consecutive close below confirms the conviction &mdash; the flip fires. <strong className="text-white">Stage 4</strong>: the level renders as resistance now (magenta), tests counter back to zero, flip count is 1, and a 10-bar cooldown starts. The record card on the right shows each field updating in real time.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE TWO-CLOSE RULE</p>
              <p className="text-sm text-gray-400 leading-relaxed">A flip requires <strong className="text-white">two consecutive bar closes</strong> beyond the level &mdash; not just a wick, not just one close. The current bar must close beyond the level, and the previous bar must also have closed beyond it. This filters range noise where price wicks through and immediately recovers. <strong className="text-white">A wick is a test, not a flip. A single close is a warning, not a flip. Two closes is a flip.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FLIP REQUIRES THE LEVEL TO BE OLD ENOUGH</p>
              <p className="text-sm text-gray-400 leading-relaxed">A level can only flip after it has lived at least <strong className="text-white">i_pivot_len + 3 bars</strong>. With the default pivot length of 5, that&apos;s 8 bars minimum age before a flip is allowed. The thinking: a level that just appeared can&apos;t be considered &ldquo;defended liquidity&rdquo; yet &mdash; it hasn&apos;t had time to be tested or trusted. Premature flips would create false history.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">MAX 2 FLIPS PER LEVEL</p>
              <p className="text-sm text-gray-400 leading-relaxed">A level can flip at most twice in its lifetime &mdash; support to resistance, then resistance back to support if the price re-claims it. After the second flip, no further role changes are allowed; the level either retires from age or tests, or stays in its current role until then. <strong className="text-white">Two-time flippers are statistically the strongest levels CIPHER tracks &mdash; they have proven institutional defence in both directions.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">10-BAR COOLDOWN BETWEEN FLIPS</p>
              <p className="text-sm text-gray-400 leading-relaxed">After a flip fires, the level cannot flip again for 10 bars. This prevents oscillating noise where price chops back and forth across a level repeatedly. <strong className="text-white">The cooldown is per-level, not global</strong> &mdash; other levels can still flip during this 10-bar window.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">A FLIP IS NOT A TEST</p>
              <p className="text-sm text-gray-400 leading-relaxed">When the flip rule fires, the test counter <strong className="text-white">resets to 0</strong>. The conceptual reasoning: liquidity that gets blown through is consumed in a different way than liquidity that gets tested and held. A flipped level starts a new lifecycle in its new role &mdash; fresh tests in the new direction.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">VISUAL CHANGES IMMEDIATELY</p>
              <p className="text-sm text-gray-400 leading-relaxed">On the flip bar, the level&apos;s line colour switches (teal &rarr; magenta or vice versa), the test dots are replaced with a single <strong className="text-white">&#10227; rotation glyph</strong>, the price label colour changes, and the proximity glow recolors. There&apos;s no animation transition &mdash; the change is instant and decisive.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FLIPS PRE-EMPT RETIREMENT</p>
              <p className="text-sm text-gray-400 leading-relaxed">If a level is at maximum tests or maximum age and would normally retire, but a flip is happening on the same bar, <strong className="text-white">the flip wins</strong>. The level lives on in its new role rather than vanishing. CIPHER never lets retirement override conviction-based role change &mdash; the chart stays informationally complete.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FLIPS DRIVE A SIGNAL CONTEXT TAG</p>
              <p className="text-sm text-gray-400 leading-relaxed">When a Pulse Cross or Tension Snap fires within a few bars of a recent flip, the signal&apos;s context tag includes the flip event &mdash; e.g. &ldquo;Long PX near recent S/R flip.&rdquo; This shows up in the signal tooltip and in the Last Signal row. <strong className="text-white">Flips are evidence; the engine surfaces them.</strong></p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">A level showing the <strong className="text-white">&#10227; flip glyph</strong> just changed roles &mdash; treat it as <strong className="text-white">battle-tested liquidity in its new direction</strong>. A level showing &ldquo;flipped 1x&rdquo; or &ldquo;flipped 2x&rdquo; in its tooltip has a longer story than a fresh level &mdash; it&apos;s been defended on both sides historically. Lean on flipped levels with confidence; they&apos;ve earned their lines.</p>
          </div>
        </motion.div>
      </section>

      {/* === S06 — Confluence Scoring === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Confluence Scoring</p>
          <h2 className="text-2xl font-extrabold mb-4">Why a fresh level can be Strong before any test</h2>
          <p className="text-gray-400 leading-relaxed mb-6">A level&apos;s strength is not just &ldquo;how many times has it been tested.&rdquo; <strong className="text-amber-400">Strength = tests + confluence.</strong> CIPHER scans every active level on every bar for three independent confluence factors: alignment with the Cipher Ribbon edge, alignment with a Risk Envelope band, and proximity to a round number. Each factor adds +1 to the level&apos;s effective strength. A fresh untested level at a round number near the Ribbon&apos;s edge can score 2 or 3 without a single test &mdash; and it should be treated like the institutional liquidity zone it is.</p>
          <ConfluenceAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the strength ladder climb. <strong className="text-white">Stage 1</strong>: just the test (+1) &mdash; the level is Moderate. <strong className="text-white">Stage 2</strong>: Cipher Flow (the inner Ribbon line) lights up nearby (+1) &mdash; level upgrades to Strong. <strong className="text-white">Stage 3</strong>: a Risk Envelope band aligns within tolerance (+1) &mdash; level is now Very Strong. <strong className="text-white">Stage 4</strong>: a round number sits within tolerance &mdash; the score caps at 3 visually but the underlying confluence keeps stacking. The line on chart is now solid, thick, and bright.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">FACTOR 1 \u00B7 RIBBON EDGE PROXIMITY</p>
              <p className="text-sm text-gray-400 leading-relaxed">If the level price sits within <strong className="text-white">0.4 ATR</strong> of either Cipher Flow or Cipher Anchor, this factor lights up. The reasoning: institutional algorithms anchor to adaptive trend lines &mdash; when a swing pivot lands at the same price as an active trend line, that&apos;s confluence. Big money is watching both reads. <strong className="text-white">A level at the Ribbon&apos;s edge is a level the engine itself is defending.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FACTOR 2 \u00B7 RISK ENVELOPE BAND</p>
              <p className="text-sm text-gray-400 leading-relaxed">If the level price sits within 0.4 ATR of either Risk Envelope outer band (the volatility cloud edge), this factor lights up. Risk Envelope marks where price is statistically &ldquo;extended.&rdquo; A swing pivot at the same price means the swing happened at a volatility extreme &mdash; mean reversion has institutional weight at that price. <strong className="text-white">Two systems agreeing at the same price is the cleanest possible confluence signal.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FACTOR 3 \u00B7 ROUND NUMBER</p>
              <p className="text-sm text-gray-400 leading-relaxed">If the level price sits within 0.4 ATR of a round number &mdash; the magnitude scales with the asset (10 for sub-$100, 100 for sub-$1000, 1000 for sub-$10000) &mdash; this factor lights up. <strong className="text-white">Round numbers are universally watched price points</strong>. A swing pivot at 4800.000 has natural confluence with retail order flow, institutional algos that round up to whole numbers, and journalist headlines. The market&apos;s collective attention concentrates on round numbers.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE 0.4 ATR TOLERANCE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Each factor uses the same proximity tolerance: 0.4 ATR. This is calibrated to be tight enough that the alignment is meaningful but loose enough to absorb minor positional differences. <strong className="text-white">A level 0.5 ATR from cipher_flow doesn&apos;t score the bonus &mdash; the engine demands genuine alignment, not approximate.</strong></p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">STRENGTH = TESTS + CONFLUENCE, CAPPED AT 3</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">strength = math.min(3, tests + confluence_bonus)</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">The visual rendering caps at strength = 3 (Very Strong). A level with 2 tests and 3 confluence factors has 5 underlying points, but visually renders the same as a level with 3 points. <strong className="text-white">The cap exists for visual clarity</strong> &mdash; beyond Very Strong, the line is already maximally visible, and pushing further wouldn&apos;t add information.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FRESH LEVELS CAN BE STRONG</p>
              <p className="text-sm text-gray-400 leading-relaxed">A pivot low at 4800.000 (round) inside the Risk Envelope band, near Cipher Anchor, scores 3 confluence factors at the moment of birth &mdash; before any test. <strong className="text-white">The level renders as Strong (or Very Strong) immediately</strong>. CIPHER&apos;s thinking: institutional confluence is real evidence even without retest history. Don&apos;t demand tests when the geometry already votes.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CONFLUENCE IS COMPUTED EVERY BAR</p>
              <p className="text-sm text-gray-400 leading-relaxed">The Ribbon edges, Risk Envelope bands, and round numbers are all dynamic. Cipher Flow drifts every bar. The Risk Envelope expands and contracts with volatility. <strong className="text-white">A level that scored confluence yesterday might not today</strong> &mdash; CIPHER recomputes the bonus on every bar, and the strength tier updates accordingly. Levels can upgrade and downgrade visually as the surrounding context shifts.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE TOOLTIP SHOWS THE COUNT</p>
              <p className="text-sm text-gray-400 leading-relaxed">The level tooltip displays confluence as &ldquo;None,&rdquo; &ldquo;1 factor,&rdquo; or &ldquo;N factors.&rdquo; You can hover to see exactly how many of the three factors are active right now. <strong className="text-white">Pair this with the Strength tier to understand whether the strength comes from history (tests) or geometry (confluence) or both.</strong></p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">When you see a fresh-looking level rendering as Strong, hover the tooltip. <strong className="text-white">If confluence is 2+, that level is a high-edge entry zone before any retest.</strong> Trade it like a tested level, with normal stops. If the level is Strong purely from tests with zero confluence, it has historical weight but lacks current geometric alignment &mdash; size more conservatively.</p>
          </div>
        </motion.div>
      </section>

      {/* === S07 — Strength-Adaptive Rendering === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Strength-Adaptive Rendering</p>
          <h2 className="text-2xl font-extrabold mb-4">The chart tells you how strong each level is at a glance</h2>
          <p className="text-gray-400 leading-relaxed mb-6">CIPHER&apos;s philosophy: <strong className="text-amber-400">visual weight should match operational weight</strong>. A Speculative level should fade into the chart. A Very Strong level should be impossible to miss. Strength drives four visual properties simultaneously &mdash; line style, line width, line opacity, and box transparency &mdash; so the level&apos;s tier is decoded by your eye in milliseconds without reading any text.</p>
          <StrengthRenderingAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the four levels stacked top to bottom. They&apos;re identical in code &mdash; same role assignment logic, same lifecycle &mdash; but their visual treatment scales by strength tier. <strong className="text-white">Top level is Very Strong (strength 3)</strong>: solid, thick, opaque. <strong className="text-white">Next is Strong (2)</strong>: dashed, medium thickness. <strong className="text-white">Next is Moderate (1)</strong>: dotted, thin. <strong className="text-white">Bottom is Speculative (0)</strong>: dotted, thin, faded. The eye sorts them automatically.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">LINE STYLE BY TIER</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">Strength 0-1</strong>: dotted line. <strong className="text-white">Strength 2</strong>: dashed line. <strong className="text-white">Strength 3</strong>: solid line. The dotted-to-dashed-to-solid progression mimics how technicians naturally rank evidence &mdash; tentative to confident to certain. <strong className="text-white">A solid line is a level the engine fully stands behind.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">LINE WIDTH BY TIER</p>
              <p className="text-sm text-gray-400 leading-relaxed">Strength 0-1: width 1 pixel. Strength 2: width 2. Strength 3: width 3. A 3px solid magenta line is impossible to miss across a busy chart, while a 1px dotted line stays subtle. <strong className="text-white">Width is the second-strongest visual rank signal after style.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">OPACITY BY TIER</p>
              <p className="text-sm text-gray-400 leading-relaxed">Each tier reduces the line&apos;s transparency by ~8 units. Combined with width, this means a Very Strong level is roughly <strong className="text-white">three times more visible</strong> than a Speculative level &mdash; thicker and brighter together. The Intensity input (Subtle/Normal/Bold) shifts the entire opacity curve up or down without breaking the strength ranking.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">BOX TRANSPARENCY BY TIER</p>
              <p className="text-sm text-gray-400 leading-relaxed">Each level has a slim buffer box (the thin colored rectangle behind the line). The box width also scales with strength &mdash; Speculative buffers are 0.03 ATR wide, Very Strong buffers are 0.12 ATR. <strong className="text-white">The box represents the tolerance zone for &ldquo;at level&rdquo; reads</strong>: bigger box for stronger levels means more room for proximity-based behaviors.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">PROXIMITY GLOW</p>
              <p className="text-sm text-gray-400 leading-relaxed">When price is within 1.5 ATR of a level, the level <strong className="text-white">brightens further</strong> &mdash; a proximity glow effect that pulls the eye toward the most-relevant levels. The glow intensifies as price gets closer (within 1.0 ATR is brighter, within 0.5 ATR brightest). Levels far from price stay at their base strength visibility, decluttering the chart automatically.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PROXIMITY BUMPS THE STYLE TIER</p>
              <p className="text-sm text-gray-400 leading-relaxed">A neat trick: when price is near a level, the line style upgrades by one tier for visibility. A Moderate (dotted) level near price renders dashed. A Strong (dashed) level near price renders solid. <strong className="text-white">Distant strength is literal; proximate strength is amplified</strong>. The chart shouts about levels you&apos;re actually near.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">TREND-AWARE AMBER WARNING</p>
              <p className="text-sm text-gray-400 leading-relaxed">When price is approaching a level <strong className="text-white">counter to the Ribbon&apos;s direction</strong> (e.g. approaching support during a bear stack), the level&apos;s color shifts to amber on proximity. The thinking: a support level under siege from a bearish trend is more likely to break than hold &mdash; the visual warning prepares the operator. Counter-trend supports flash AMBER as &ldquo;this level may not hold.&rdquo;</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WITH-TREND BONUS GLOW</p>
              <p className="text-sm text-gray-400 leading-relaxed">The opposite: approaching support during a bull stack triggers extra teal glow on the level. <strong className="text-white">With-trend approaches are encouraged visually</strong>; counter-trend approaches are warned about. The chart isn&apos;t neutral &mdash; it editorialises based on trend context.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Faint dotted line = ignore unless it brightens. <strong className="text-white">Bold solid line = trade-grade level</strong>. Amber-glowing line = warning, this level may break. The chart already grades the levels for you; trust the visual hierarchy and place trades on the levels the engine is highlighting, not on every horizontal you can spot.</p>
          </div>
        </motion.div>
      </section>

      {/* === S08 — The Level Tooltip === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; The Level Tooltip</p>
          <h2 className="text-2xl font-extrabold mb-4">Hover any level. The full record is one mouse-over away.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The visual rendering is the at-a-glance tier; the tooltip is the deep read. <strong className="text-amber-400">Every level on chart carries a 6-line metadata block accessible by hovering.</strong> The tooltip is not computed at hover-time &mdash; it&apos;s rendered into the level&apos;s record on every bar, and hover just reveals what&apos;s already there. Six lines, four numbers, two qualitative grades. Everything you need to make a decision.</p>
          <LevelTooltipAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the hover glow pulse on the test dot then the tooltip card unfold. The example shows a real read from a deployed CIPHER chart: <strong className="text-white">RESISTANCE 5602.225 &middot; Age 62 bars &middot; Tests 1/4 &middot; Strength Strong (2/3) &middot; Confluence 1 factor &middot; Distance 8.1 ATR</strong>. Each line decodes a different dimension of the level&apos;s state.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">LINE 1 \u00B7 ROLE + PRICE + FLIP HISTORY</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">RESISTANCE 5602.225</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">The header line. Role (SUPPORT or RESISTANCE) plus exact price to the asset&apos;s tick precision. If the level has flipped before, a suffix appears: <strong className="text-white">&ldquo;flipped 1x&rdquo;</strong> or <strong className="text-white">&ldquo;flipped 2x&rdquo;</strong>. No flip suffix means this is the level&apos;s original role since birth.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">LINE 2 \u00B7 AGE</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">Age: 62 bars</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">How many bars since the level was born from its pivot. The age tells you <strong className="text-white">how mature this level is</strong> relative to its retirement cap (i_zone_max_age, default 200). 62 bars is mid-life &mdash; established but not yet aging. Beyond 100 bars, visual fade kicks in.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">LINE 3 \u00B7 TESTS</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">Tests: 1 / 4</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">Touches recorded versus the test cap. <strong className="text-white">1 / 4 means three more touches before retirement.</strong> Each test increments the counter and re-validates the level. Approaching 4 / 4 means &ldquo;last bounce&rdquo; territory &mdash; size accordingly.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">LINE 4 \u00B7 STRENGTH</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">Strength: Strong (2/3)</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">The strength tier plus the underlying score. Tiers: Speculative (0), Moderate (1), Strong (2), Very Strong (3). The number after the slash shows the maximum displayable tier. <strong className="text-white">The tier directly drives the visual rendering covered in S07</strong>.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">LINE 5 \u00B7 CONFLUENCE</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">Confluence: 1 factor</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">How many of the three confluence factors are currently active &mdash; Ribbon edge, Risk Envelope band, round number. Possible values: <strong className="text-white">None, 1 factor, 2 factors, 3 factors</strong>. The tooltip doesn&apos;t name which factors specifically &mdash; you would inspect the chart visually to see which alignments are present.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">LINE 6 \u00B7 DISTANCE</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">Distance: 8.1 ATR</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">How far price currently sits from the level, in ATR units. <strong className="text-white">8.1 ATR is far &mdash; this level is a magnet, not an entry zone right now.</strong> Distances below 0.5 are AT level, 0.5-1.5 are NEAR, beyond 1.5 are BETWEEN. The Command Center Structure row uses these same thresholds for its verdict.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">HOVER WORKS ON THE DOT, NOT THE LINE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Pine Script tooltips are attached to label objects. The tooltip is anchored to the test-count dot at the left edge of each level (or the flip glyph if the level has flipped). <strong className="text-white">Hover the dot, not the line</strong>. The price label at the right edge also has the same tooltip attached for convenience.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE TOOLTIP UPDATES EVERY BAR</p>
              <p className="text-sm text-gray-400 leading-relaxed">All six fields recompute on every bar. Age increments. Tests update if a touch fires. Strength recomputes from current confluence factors. Distance recomputes from current price. <strong className="text-white">The tooltip is a live snapshot, not a frozen value at level birth.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PAIR WITH THE STRUCTURE ROW FOR FULL CONTEXT</p>
              <p className="text-sm text-gray-400 leading-relaxed">The Command Center Structure row gives you nearest support and resistance as ATR distances. The tooltip gives you the full record on any individual level. <strong className="text-white">Glance at the row for &ldquo;where am I&rdquo; context; hover specific levels for &ldquo;what is this level&rdquo; details.</strong> The two are complementary &mdash; the row is the radar, the tooltip is the report.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">When a setup is forming near a level, hover the level. <strong className="text-white">Read all six lines.</strong> Decide: is this a Very Strong level with confluence (high-conviction entry), or a Speculative level on its 4th test (low-conviction skip)? The tooltip is the lookup table. Use it.</p>
          </div>
        </motion.div>
      </section>

      {/* === S09 — Anatomy of Cipher Spine === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Anatomy of Cipher Spine</p>
          <h2 className="text-2xl font-extrabold mb-4">Two midpoints, one health weight, an honest line</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The Spine is the simplest math in CIPHER and one of the most expressive reads. <strong className="text-amber-400">Two range midpoints &mdash; one tight, one smooth &mdash; blended every bar by a momentum-health weight.</strong> When momentum is healthy, the tight midpoint dominates and the spine hugs price. When momentum is dying, the smooth midpoint dominates and the spine drifts toward structure, exposing a gap that visualises the divergence. The blend is honest: the math doesn&apos;t hide what&apos;s happening.</p>
          <SpineAnatomyAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the health weight oscillate on the right meter. When it&apos;s high (healthy), the Spine pulls toward the tight midpoint (faint teal dotted line near price). When it drops low (dying), the Spine pulls toward the smooth midpoint (faint magenta dotted line, lagging behind price). <strong className="text-white">The Spine is always somewhere between the two midpoints, weighted by current momentum health.</strong> The colour also shifts &mdash; teal when healthy bull, amber when transitioning, magenta when healthy bear.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE TIGHT MIDPOINT \u00B7 5-BAR</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">tight_mid = (highest(high, 5) + lowest(low, 5)) / 2</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">The midpoint of the last 5 bars&apos; high-to-low range. Reactive. Hugs price tightly when momentum is committed in one direction. <strong className="text-white">When tight_mid dominates the blend, the Spine sits within ~0.5 ATR of price most of the time</strong> &mdash; visually, the line tracks the candles closely.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE SMOOTH MIDPOINT \u00B7 21-BAR</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">smooth_mid = (highest(high, 21) + lowest(low, 21)) / 2</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">The midpoint of the last 21 bars&apos; high-to-low range. Slow. Acts more like a structural reference &mdash; less reactive to recent price moves, more anchored to the broader range. <strong className="text-white">When smooth_mid dominates, the Spine drifts toward the centre of recent structure</strong>, leaving price out on its own.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE HEALTH WEIGHT</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">health_weight = clamp(health_smooth / 100, 0, 1)</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">A 0-to-1 normalisation of CIPHER&apos;s smoothed momentum-health score. 1.0 = full strength bull or bear momentum, 0.0 = exhausted or counter-trend. The health score itself blends MACD strength, divergence reads, and volatility ratio &mdash; a composite of three momentum dimensions.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE BLEND FORMULA</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">spine_target = tight_mid &times; weight + smooth_mid &times; (1 \u2212 weight)</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">Linear interpolation. At weight = 1.0 the Spine is purely the tight midpoint. At weight = 0.0 it&apos;s purely the smooth midpoint. <strong className="text-white">In between is where the Spine actually lives most of the time</strong> &mdash; somewhere between near-price tracking and structural drift.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">SMOOTHING LAYER</p>
              <p className="text-sm text-gray-400 leading-relaxed">The raw blended target gets one more smoothing pass &mdash; an exponential moving average with a smooth factor of <strong className="text-white">0.15 + health_weight &times; 0.25</strong>. When momentum is healthy, the smoothing is more reactive (factor up to 0.40). When dying, it&apos;s more sluggish (factor 0.15). This prevents the Spine from jumping discontinuously when health flips abruptly.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHY 5 + 21 SPECIFICALLY</p>
              <p className="text-sm text-gray-400 leading-relaxed">5 bars is short enough to track a fast trend without lag. 21 bars is roughly one trading month on daily charts &mdash; the natural &ldquo;memory&rdquo; window for institutional positioning. <strong className="text-white">The 5/21 ratio (~4x apart) gives the blend enough range to express healthy versus dying clearly</strong>. Tighter ratios would compress the read; wider ratios would make the smooth midpoint feel disconnected from current price.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE COLOUR FOLLOWS RIBBON DIRECTION</p>
              <p className="text-sm text-gray-400 leading-relaxed">The Spine borrows its colour from the Ribbon stack &mdash; teal when bull-stacked and momentum is healthy (above 35%), magenta when bear-stacked and healthy, amber when transitioning or weak. <strong className="text-white">A Spine and a Ribbon that share colour are two systems agreeing on direction</strong>; an amber Spine on a colored Ribbon flags conflict.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">VIVIDNESS SCALES WITH MOMENTUM STRENGTH</p>
              <p className="text-sm text-gray-400 leading-relaxed">The line opacity is driven by an internal &ldquo;spine_strength&rdquo; metric (health &times; velocity, normalised). <strong className="text-white">Strong sustained moves render the Spine vividly</strong>; weak chop renders it faded. The line literally fades when there&apos;s nothing meaningful to read.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">A vivid Spine hugging price = healthy momentum, ride it. <strong className="text-white">A faded Spine drifting from price = momentum dying, gap = warning.</strong> Spine colour matches Ribbon = systems agree. Spine amber while Ribbon is colored = transition. The line itself is a live readout of the engine&apos;s confidence.</p>
          </div>
        </motion.div>
      </section>

      {/* === S10 — The Health-Adaptive Bands === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; The Health-Adaptive Bands</p>
          <h2 className="text-2xl font-extrabold mb-4">Tight when controlled, wide when chaotic &mdash; the Spine breathes</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The Spine line itself is one read; the bands around it are another. <strong className="text-amber-400">Band width scales inversely with momentum health.</strong> Healthy momentum produces narrow bands &mdash; price is controlled, the channel is tight. Dying momentum produces wide bands &mdash; price is chaotic, the channel is loose. The bands literally breathe with the engine&apos;s confidence in the move.</p>
          <HealthAdaptiveBandsAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the band width oscillate as health weight cycles. <strong className="text-white">Healthy</strong> (weight near 1.0): bands compress to roughly 0.6 ATR &mdash; tight, vivid teal. <strong className="text-white">Dying</strong> (weight near 0.0): bands expand to roughly 1.8 ATR &mdash; wide, faded amber. The Spine line stays in the centre while the bands breathe around it. The right-side meter shows the live ATR width.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE BAND WIDTH FORMULA</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">band_width = ATR \u00D7 (1.8 \u2212 health_weight \u00D7 1.2)</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">At health = 1.0: band_width = ATR &times; 0.6. At health = 0.0: band_width = ATR &times; 1.8. Linear scaling between the two extremes. <strong className="text-white">Width is always ATR-normalised</strong> &mdash; the bands automatically scale to any asset&apos;s typical volatility without configuration.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">INNER VS OUTER BANDS</p>
              <p className="text-sm text-gray-400 leading-relaxed">CIPHER plots two band layers. <strong className="text-white">Inner band (40% of full width)</strong> renders vivid &mdash; this is the &ldquo;core&rdquo; channel where price normally lives. <strong className="text-white">Outer band (full width)</strong> renders faded &mdash; this is the &ldquo;edge&rdquo; channel where price is statistically extended. Two-layer gradient creates visual depth and gives the bands a 3D feel.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHY BANDS BREATHE INVERSELY TO HEALTH</p>
              <p className="text-sm text-gray-400 leading-relaxed">Healthy momentum means price is committing decisively in one direction &mdash; lower variance around the trend. Tight bands reflect that. Dying momentum means price is whipsawing as the trend loses conviction &mdash; higher variance. Wide bands reflect that. <strong className="text-white">The bands aren&apos;t a separate volatility read; they&apos;re a visualisation of the trend engine&apos;s confidence.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WIDE BANDS ARE A WARNING</p>
              <p className="text-sm text-gray-400 leading-relaxed">When you see the bands suddenly puff outward, the engine is telling you it has lost confidence in the current move. This often precedes a stack flip in the Ribbon (covered in Lesson 16) and a regime transition in the Header (Lesson 5-6). <strong className="text-white">Wide bands = stop adding to with-trend positions, tighten stops, prepare for transition</strong>.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE BAND COLOUR FOLLOWS THE SPINE</p>
              <p className="text-sm text-gray-400 leading-relaxed">The bands inherit the Spine&apos;s colour &mdash; teal when bull-stacked and healthy, magenta when bear-stacked and healthy, amber when transitioning or weak. <strong className="text-white">A trend with vivid teal bands is institutionally confident</strong>; a trend with amber-fading bands is in transition; a chart with magenta bands is in a healthy bear move.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">HOW BANDS DIFFER FROM RISK ENVELOPE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Risk Envelope (covered in Lesson 20) is a separate concentric volatility cloud with SAFE/WATCH/CAUTION/DANGER zones. The Spine&apos;s bands are <strong className="text-white">narrower, health-driven, and centred on the Spine line</strong> &mdash; not on a separate fair-value anchor. They serve different purposes: Risk Envelope quantifies overextension; Spine bands quantify momentum health.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PRICE CROSSING THE OUTER BAND</p>
              <p className="text-sm text-gray-400 leading-relaxed">When price punches through the outer Spine band, it&apos;s a momentum extreme &mdash; price has stretched beyond what current health justifies. Often resolves with mean reversion back toward the Spine. <strong className="text-white">Price outside outer band + Spine still vivid = pullback opportunity</strong>; price outside outer band + Spine going amber = warning, the move is exhausted.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Tight bands = trade with-trend confidently. <strong className="text-white">Wide bands = chop or transition; reduce risk</strong>. The bands are a passive read &mdash; you don&apos;t trade them directly. You trade <em>around</em> them, using the width as a confidence dial for your sizing.</p>
          </div>
        </motion.div>
      </section>

      {/* === S11 — Reading the Spine-Price Gap === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Reading the Spine-Price Gap</p>
          <h2 className="text-2xl font-extrabold mb-4">TRACKING / LOOSE / DRIFTING / DETACHED &mdash; the four gap states</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Beyond the Spine&apos;s line and bands, there&apos;s one more read: <strong className="text-amber-400">the gap between price and the Spine itself</strong>. CIPHER quantifies this gap in ATR units and labels it across four states: TRACKING (gap &lt; 0.4 ATR), LOOSE (0.4 to 0.8), DRIFTING (0.8 to 1.5), DETACHED (&gt; 1.5). The state isn&apos;t shown in the Command Center as text &mdash; it&apos;s readable directly from the chart by eye. Master the four labels and you can read divergence without an oscillator.</p>
          <SpinePriceGapAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the four phases. Price stays in roughly the same trend &mdash; what changes is the Spine&apos;s position. <strong className="text-white">TRACKING</strong>: Spine hugs price. <strong className="text-white">LOOSE</strong>: small visible gap, no immediate concern. <strong className="text-white">DRIFTING</strong>: noticeable gap, momentum questionable. <strong className="text-white">DETACHED</strong>: large gap, price pushing on fumes. The dotted measuring line shows the live ATR distance.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">TRACKING \u00B7 GAP &lt; 0.4 ATR</p>
              <p className="text-sm text-gray-400 leading-relaxed">The Spine is hugging price. Momentum is healthy and the engine is keeping up. <strong className="text-white">This is the default healthy-trend state</strong>. Trade with-trend, hold runners, no positional adjustment needed. Most active trends spend the majority of their lifetime in TRACKING.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">LOOSE \u00B7 GAP 0.4 to 0.8 ATR</p>
              <p className="text-sm text-gray-400 leading-relaxed">Price has stretched a small distance from the Spine. Could be a normal extension within the trend, could be early divergence. <strong className="text-white">Not actionable yet</strong> &mdash; just a flag to watch. The next bar might pull back to TRACKING or might extend further. Don&apos;t over-react; mark it mentally.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DRIFTING \u00B7 GAP 0.8 to 1.5 ATR</p>
              <p className="text-sm text-gray-400 leading-relaxed">Real divergence territory. Price is meaningfully ahead of the Spine, which means the engine&apos;s sense of trend center is lagging price&apos;s recent moves. <strong className="text-white">Two interpretations</strong>: (1) momentum is genuinely fading and price will pull back, or (2) the trend is too strong for the Spine&apos;s 21-bar smoothing to keep up. Pair with Ribbon stack &mdash; if the stack is healthy, lean toward (2); if the stack is also weakening, lean toward (1).</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DETACHED \u00B7 GAP &gt; 1.5 ATR</p>
              <p className="text-sm text-gray-400 leading-relaxed">Price has fully decoupled from the Spine. The engine can no longer claim it&apos;s tracking the move. <strong className="text-white">Price is on fumes &mdash; the move is unsustainable in its current form</strong>. Either a hard pullback to the Spine is imminent, or the Spine itself will need to catch up rapidly with a snap-recompute. Either way, with-trend continuation entries here have poor risk/reward.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE LABEL EXISTS BUT ISN&apos;T IN THE CC ROW</p>
              <p className="text-sm text-gray-400 leading-relaxed">CIPHER computes the spine_gap label on every bar, but the Structure Command Center row doesn&apos;t display it. The visual representation IS the read &mdash; <strong className="text-white">the Spine&apos;s distance from price tells you the state</strong>. No need for text; the chart shows you. The internal label feeds into other systems (alert tooltips, signal context tags) but isn&apos;t a primary surface read.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">spine_detached BOOLEAN \u00B7 GAP &gt; 1.0 ATR</p>
              <p className="text-sm text-gray-400 leading-relaxed">CIPHER also exposes a simple boolean: <code className="text-white">spine_detached = spine_gap &gt; 1.0</code>. This drives downstream conditional logic &mdash; some signal-context tags reference it, some alert payloads include it. <strong className="text-white">The 1.0 ATR threshold is slightly tighter than the DETACHED label (1.5)</strong>, providing an earlier warning for code that needs binary input.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DURATION MATTERS</p>
              <p className="text-sm text-gray-400 leading-relaxed">A single bar of DRIFTING that immediately resolves is meaningless &mdash; price wicked. <strong className="text-white">Five or more bars of sustained DRIFTING is real divergence</strong>; price is genuinely ahead of where the engine thinks it should be. Watch for persistence, not single-bar prints.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Glance at the Spine&apos;s position relative to price. Spine hugging = ride it. <strong className="text-white">Spine pulling away = tighten stops</strong>. Spine far behind price = exit runners or hedge. The label is implicit in the visual &mdash; you don&apos;t need text to read it.</p>
          </div>
        </motion.div>
      </section>

      {/* === S12 — The Structure Row in the Command Center === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">12 &mdash; The Structure Row in the Command Center</p>
          <h2 className="text-2xl font-extrabold mb-4">Two distances, one verdict, seven possible reads</h2>
          <p className="text-gray-400 leading-relaxed mb-6">All the level data and Spine reads converge into a single Command Center row. <strong className="text-amber-400">Cell 2 displays the nearest support and resistance distances in ATR. Cell 3 displays one of seven verdicts</strong> drawn from a hard-coded priority cascade. Three cells, three glances, complete positional awareness in under a second.</p>
          <StructureRowCascadeAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the four demo states cycle. <strong className="text-white">S 0.1 R 2.9</strong> &rarr; AT SUPPORT (matches Image 6 from your screenshots). <strong className="text-white">S 5 R 0.8</strong> &rarr; NEAR RESISTANCE (matches Image 5). <strong className="text-white">S 1.7 R 3.5</strong> &rarr; BETWEEN LEVELS (matches Image 1). <strong className="text-white">No active levels</strong> &rarr; NO LEVELS. Each input drives a different cascade verdict winning. The cascade evaluates top-down; first match broadcasts.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE 7 VERDICTS, IN PRIORITY ORDER</p>
              <p className="text-sm text-gray-400 leading-relaxed">1. <strong className="text-white">NO LEVELS</strong> &mdash; no active S/R zones. 2. <strong className="text-white">DECISION ZONE</strong> &mdash; AT both support AND resistance simultaneously (rare, occurs in tight ranges). 3. <strong className="text-white">AT SUPPORT</strong> &mdash; within 0.5 ATR of nearest support. 4. <strong className="text-white">AT RESISTANCE</strong> &mdash; within 0.5 ATR of nearest resistance. 5. <strong className="text-white">NEAR SUPPORT</strong> &mdash; within 1.5 ATR. 6. <strong className="text-white">NEAR RESISTANCE</strong> &mdash; within 1.5 ATR. 7. <strong className="text-white">BETWEEN LEVELS</strong> &mdash; the silent default when nothing else matches.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE ATR DISTANCES</p>
              <p className="text-sm text-gray-400 leading-relaxed">Cell 2 always displays both distances in compact form: <code className="text-white">S 1.7 ATR  R 3.5 ATR</code>. <strong className="text-white">S = nearest support, R = nearest resistance</strong>, distances measured in ATR units. ATR-normalisation means the same numbers mean the same things across any asset and timeframe &mdash; 0.5 ATR on EURUSD 5m and 0.5 ATR on BTCUSD 1D both signal &ldquo;at the level.&rdquo;</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">AT vs NEAR vs BETWEEN \u00B7 THE THRESHOLDS</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">AT</strong> = within 0.5 ATR. <strong className="text-white">NEAR</strong> = within 1.5 ATR. <strong className="text-white">BETWEEN</strong> = beyond 1.5 ATR (or no level on that side). The 0.5 / 1.5 ATR thresholds are universal across CIPHER &mdash; the same gates power the proximity glow on the chart and the verdict in the row.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DECISION ZONE \u00B7 BOTH EXTREMES AT ONCE</p>
              <p className="text-sm text-gray-400 leading-relaxed">When price is AT support and AT resistance simultaneously (within 0.5 ATR of both), the cascade outputs DECISION ZONE. <strong className="text-white">This only happens in tight ranges</strong> &mdash; the support/resistance pair is squeezed into less than 1 ATR. Operationally: a major breakout is approaching; whichever side breaks first will produce an outsized move. Same playbook as DOUBLE COIL from L11.16: mark both, trade the breakout.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">CELL COLOURS BY VERDICT</p>
              <p className="text-sm text-gray-400 leading-relaxed">AT SUPPORT and NEAR SUPPORT render in <strong className="text-white">teal</strong> &mdash; bullish proximity. AT RESISTANCE and NEAR RESISTANCE render in <strong className="text-white">magenta</strong> &mdash; bearish proximity. DECISION ZONE renders <strong className="text-white">amber</strong> &mdash; conflict. NO LEVELS and BETWEEN LEVELS render faded white &mdash; nothing actionable. The colour is itself a signal &mdash; you can read the row without parsing the words.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SUPPRESSION IS DELIBERATE</p>
              <p className="text-sm text-gray-400 leading-relaxed">When AT SUPPORT fires, NEAR SUPPORT and BETWEEN LEVELS are technically also true (their predicates aren&apos;t mutually exclusive). The cascade lets only the highest-priority match through. <strong className="text-white">A trader trying to read all three would freeze; a trader given the singular &ldquo;AT SUPPORT&rdquo; verdict acts</strong>. Trust the cascade.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PAIR WITH OTHER ROWS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Structure row alone tells you geometry. Pair it with other rows for context: <strong className="text-white">AT SUPPORT + Ribbon BULL = high-probability bounce setup</strong>. AT SUPPORT + Ribbon BEAR = level under siege, AMBER on chart, treat as breakdown candidate. NEAR RESISTANCE + Tension STRETCHED = exhaustion fade. The Structure row is one input in the multi-row read.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Glance at cell 2 for the literal distances. Glance at cell 3 for the verdict. <strong className="text-white">Two seconds, complete positional awareness</strong>. Pair with the chart visuals for confirmation, but the row is the verdict.</p>
          </div>
        </motion.div>
      </section>

      {/* === S13 — Inputs === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">13 &mdash; The Structure + Spine Inputs</p>
          <h2 className="text-2xl font-extrabold mb-4">Six toggles, four lifecycle parameters, full control</h2>
          <p className="text-gray-400 leading-relaxed mb-6">CIPHER&apos;s Structure + Spine controls span <strong className="text-amber-400">two input groups plus an S/R configuration block</strong>. Cipher Structure has its own group with toggle and intensity. Cipher Spine has its own group with toggle and intensity. The lifecycle parameters live in a separate block below the Structure group. Plus the Command Center has a separate Structure row toggle. Six controls in total, calibrated defaults, full operator tunability.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">CIPHER STRUCTURE \u00B7 master toggle</p>
              <p className="text-sm text-gray-400 leading-relaxed">Default: OFF (the indicator ships off so the chart starts clean). When OFF, all level-detection logic still runs internally &mdash; the Command Center Structure row still updates, signal context tags still fire &mdash; but no level visuals are drawn. <strong className="text-white">Turn this on first.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STRUCTURE INTENSITY \u00B7 Subtle / Normal / Bold</p>
              <p className="text-sm text-gray-400 leading-relaxed">Default: Normal. Controls opacity of zones, lines, and price labels uniformly across all strength tiers. Subtle dampens, Bold brightens. The strength-adaptive rendering hierarchy (S07) is preserved &mdash; Bold makes everything more visible without flattening tier differences.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">i_pivot_len \u00B7 default 5, range 2-20</p>
              <p className="text-sm text-gray-400 leading-relaxed">Bars left and right for swing detection. <strong className="text-white">Lower</strong> = more levels (smaller swings qualify). <strong className="text-white">Higher</strong> = fewer levels (only major swings qualify). The most operationally important Structure tuning input.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">i_max_zones \u00B7 default 8, range 4-16</p>
              <p className="text-sm text-gray-400 leading-relaxed">Maximum total active levels (above + below combined). When new pivots would exceed this, the weakest existing level is pruned. Lower values keep the chart sparse; higher values preserve more historical levels.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">i_zone_max_tests \u00B7 default 4, range 2-6</p>
              <p className="text-sm text-gray-400 leading-relaxed">Maximum touches before a level retires. Lower values treat levels as one-shot bounces; higher values preserve through multiple retests.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">i_zone_max_age \u00B7 default 200, range 50-500</p>
              <p className="text-sm text-gray-400 leading-relaxed">Maximum age in bars before a level retires regardless of test count. Beyond 100 bars, age decay starts visually fading the level. Lower values keep the chart focused on recent levels; higher values preserve historical context.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">CIPHER SPINE \u00B7 master toggle</p>
              <p className="text-sm text-gray-400 leading-relaxed">Default: OFF. Same convention as Structure &mdash; engine runs internally even when off, only visuals are gated. The Spine doesn&apos;t have a dedicated Command Center row, so when this toggle is OFF, the Spine math still feeds confluence scoring (S06) but is invisible on chart.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SPINE INTENSITY \u00B7 Subtle / Normal / Bold</p>
              <p className="text-sm text-gray-400 leading-relaxed">Default: Normal. Controls opacity of the Spine line and bands together. Subtle dims both; Bold brightens both. Use Subtle when running multiple visual layers; Bold when the Spine is your primary read.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">COMMAND CENTER STRUCTURE ROW \u00B7 default OFF</p>
              <p className="text-sm text-gray-400 leading-relaxed">Separately, the Command Center input group has a Structure row toggle. Default OFF (most CC rows ship off to keep the panel compact). <strong className="text-white">Turn this on too</strong> &mdash; the Structure row is one of the most decision-relevant rows in the Command Center.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PRESETS THAT INCLUDE STRUCTURE / SPINE</p>
              <p className="text-sm text-gray-400 leading-relaxed">The Preset dropdown at the top of the inputs has six configurations. <strong className="text-white">Scalper</strong> and <strong className="text-white">Structure</strong> presets enable Cipher Structure. <strong className="text-white">Swing Trader</strong> and <strong className="text-white">Reversal</strong> presets enable Cipher Spine. Presets override individual toggles &mdash; set Preset to None for full manual control.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">RECOMMENDED OPERATOR SETUP</p>
              <p className="text-sm text-gray-400 leading-relaxed">Cipher Structure ON, Intensity Normal, defaults on all 4 lifecycle parameters. Cipher Spine ON, Intensity Normal. Command Center Structure row ON. <strong className="text-white">Five toggles, six controls, calibrated defaults.</strong> Tune i_pivot_len up to 8 for less-cluttered swing-trading charts; tune down to 3 for high-frequency scalping that needs more micro-levels.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DON&apos;T STACK BOTH BOLD</p>
              <p className="text-sm text-gray-400 leading-relaxed">Structure Bold + Spine Bold creates a chart so dense the candles disappear. <strong className="text-white">Pick one for primary visibility</strong>: if you trade levels primarily, Structure Bold + Spine Subtle. If you trade momentum primarily, Spine Bold + Structure Subtle. Both Normal is the default and works for most operators.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">LIFECYCLE TUNING IS PER-TIMEFRAME</p>
              <p className="text-sm text-gray-400 leading-relaxed">Default lifecycle parameters work across all timeframes, but they can be tuned. <strong className="text-white">Higher timeframes (1D, 1W) benefit from longer max_age</strong> (300-500) since major levels persist longer. Lower timeframes (1m, 5m) benefit from shorter max_age (50-100) since structure decays faster.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Two master toggles, two intensities, four lifecycle parameters, one row toggle. <strong className="text-white">Defaults are calibrated.</strong> Turn the master toggles on, leave Intensity Normal, leave the lifecycle parameters at default. Tune only when you have a specific reason &mdash; usually that reason is &ldquo;the chart is too dense&rdquo; (raise pivot_len) or &ldquo;levels disappear too quickly&rdquo; (raise max_age).</p>
          </div>
        </motion.div>
      </section>

      {/* === S14 — Trading Structure + Spine === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">14 &mdash; Trading Structure + Spine</p>
          <h2 className="text-2xl font-extrabold mb-4">Entry at the level + Spine confirms. Stop beyond the level, not at it.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Structure and Spine don&apos;t fire entry signals on their own &mdash; they pair with PX/TS signals from the Signal Engine to define <strong className="text-amber-400">where the setup happens, where the stop goes, and when to scale out</strong>. The pair&apos;s job is positional: levels are the entry zones, the Spine confirms the engine&apos;s health, and the relationship between the two governs trade management.</p>
          <TradingStructureSpineAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the four-stage trade. <strong className="text-white">Stage 1</strong>: price approaches a Strong support level, Spine is healthy teal hugging price. <strong className="text-white">Stage 2</strong>: bounce confirmed, entry placed, stop sits BELOW the support level (not at it). <strong className="text-white">Stage 3</strong>: runner active, Spine still tracking the move, sleeve tight &mdash; conviction holds. <strong className="text-white">Stage 4</strong>: Spine starts drifting (turns amber), exit triggers before the actual stack flip. The Spine&apos;s drift is the early-exit signal.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">DECISION 1 \u00B7 ENTRY ELIGIBILITY</p>
              <p className="text-sm text-gray-400 leading-relaxed">Before taking any signal, check the Structure row. <strong className="text-white">AT SUPPORT or NEAR SUPPORT = bounce setups eligible</strong> for longs. <strong className="text-white">AT RESISTANCE or NEAR RESISTANCE = rejection setups eligible</strong> for shorts. BETWEEN LEVELS = no level-based setup; rely on signal-engine fires alone. NO LEVELS = wait for fresh structure to develop.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DECISION 2 \u00B7 STOP PLACEMENT</p>
              <p className="text-sm text-gray-400 leading-relaxed">Stops go <strong className="text-white">just BEYOND</strong> the level &mdash; below support for longs, above resistance for shorts &mdash; with a small ATR buffer. The level itself is the line of defense; your stop sits one tick past it. <strong className="text-white">Why beyond, not at?</strong> Because price wicks through levels constantly without truly breaking them. A stop at the level gets stopped on noise. A stop one buffer past the level only triggers when the level has genuinely broken.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DECISION 3 \u00B7 SPINE AS CONFIRMATION GATE</p>
              <p className="text-sm text-gray-400 leading-relaxed">A bounce setup at support requires Spine confirmation: <strong className="text-white">Spine is teal (healthy bull) and tracking price</strong>. If Spine is amber or detached at the moment the level setup forms, skip the trade. <strong className="text-white">Engine health doesn&apos;t agree with the level read</strong> &mdash; the level might bounce, but the broader trend is dying, so R:R is poor.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DECISION 4 \u00B7 SPINE DRIFT AS EXIT TRIGGER</p>
              <p className="text-sm text-gray-400 leading-relaxed">Once in a trade, watch the Spine&apos;s position relative to price. While Spine is TRACKING or LOOSE, hold runners. <strong className="text-white">When Spine moves to DRIFTING, tighten stop to break-even.</strong> When Spine reaches DETACHED or turns amber, exit fully. The Spine drift exits the trade <em>before</em> the formal flip mechanics in the Ribbon engage &mdash; you&apos;re ahead of the herd.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">FLIPPED LEVELS DESERVE EXTRA SIZE</p>
              <p className="text-sm text-gray-400 leading-relaxed">A level showing &ldquo;flipped 1x&rdquo; or &ldquo;flipped 2x&rdquo; in the tooltip has been defended in both directions historically. <strong className="text-white">These are the strongest possible institutional levels</strong> &mdash; the chart has proven its weight. Trade them with full size; they have the highest expected hold rate.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CONFLUENCE SCORES SCALE SIZING</p>
              <p className="text-sm text-gray-400 leading-relaxed">A level scoring 3 confluence factors should be sized larger than a level scoring 0 &mdash; same strength tier, different conviction. <strong className="text-white">Confluence factors don&apos;t guarantee outcomes, but they reflect alignment of multiple independent reads</strong>. Trade higher-confluence levels with full size; trade no-confluence levels with reduced size.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DECISION ZONE \u00B7 BREAKOUT PLAYBOOK</p>
              <p className="text-sm text-gray-400 leading-relaxed">When the Structure row reads DECISION ZONE (AT both support AND resistance), the trade pattern flips from bounce to breakout: <strong className="text-white">mark both extremes; first close beyond either is the breakout entry; stop opposite side; target the next major S/R</strong>. Same pattern as DOUBLE COIL from L11.16. Decision zones are pre-breakout, not bounce zones.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">AGED LEVELS NEED CONFIRMATION</p>
              <p className="text-sm text-gray-400 leading-relaxed">A level approaching its 4th test or with age over 150 bars is on borrowed time. <strong className="text-white">Demand a fresh PX/TS signal at the level before entering</strong> &mdash; don&apos;t enter on the level alone. The signal engine&apos;s confirmation compensates for the level&apos;s waning conviction.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE COMPLETE TRADE</p>
            <p className="text-sm text-gray-400 leading-relaxed">Structure row says AT SUPPORT. Spine is teal, tracking price. Signal engine fires PX or TS in agreement. <strong className="text-white">Enter</strong> with stop just below the level. Hold while Spine stays tight. <strong className="text-white">Tighten</strong> when Spine moves to LOOSE. <strong className="text-white">Exit</strong> when Spine reaches DRIFTING or turns amber. Reset.</p>
          </div>
        </motion.div>
      </section>

      {/* === S15 — 6 Mistakes === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">15 &mdash; The Six Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-4">How operators mis-read Structure + Spine &mdash; and the corrections</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Six failure patterns appear consistently in early Structure + Spine work. Each has a specific correction. <strong className="text-amber-400">If you find yourself doing any of these, return to the relevant section above.</strong></p>

          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 mb-4">
            <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 1 \u00B7 TREATING FRESH LEVELS AS WEAK</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-2"><strong className="text-white">The pattern:</strong> a brand-new level appears, you assume it&apos;s untested and therefore unproven, you skip the bounce.</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-2"><strong className="text-white">Why it fails:</strong> CIPHER&apos;s confluence scoring means a fresh level can be Strong without retest if it sits at a round number, near the Ribbon edge, or at a Risk Envelope band. The strength tier is honest &mdash; trust it. Skipping fresh-but-Strong levels means missing some of the highest-conviction setups.</p>
            <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-amber-400">The correction:</strong> hover the tooltip. If the strength reads Strong or Very Strong, treat it as a real level regardless of test count. Trade it with normal size. See Section 6.</p>
          </div>

          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 mb-4">
            <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 2 \u00B7 IGNORING POLARITY FLIPS</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-2"><strong className="text-white">The pattern:</strong> a level breaks below price, you mentally write it off as &ldquo;broken support, no longer relevant.&rdquo; Two days later, price returns to that level and bounces off it as resistance &mdash; the textbook flip &mdash; and you missed the short.</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-2"><strong className="text-white">Why it fails:</strong> CIPHER doesn&apos;t throw away broken levels &mdash; it flips their role. The chart shows the new role with a magenta colour and a &#10227; flip glyph. Your mental model needs to follow the engine, not stick with &ldquo;broken = gone.&rdquo;</p>
            <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-amber-400">The correction:</strong> watch for the &#10227; flip glyph on chart. Flipped levels are battle-tested liquidity in their new role &mdash; trade them with confidence. See Section 5.</p>
          </div>

          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 mb-4">
            <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 3 \u00B7 FIGHTING THE TREND-AWARE AMBER</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-2"><strong className="text-white">The pattern:</strong> price is approaching support during a strong bear stack. The level shifts to amber on chart as a warning. You take the bounce long anyway because &ldquo;the level is Strong.&rdquo; The level breaks and your stop hits.</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-2"><strong className="text-white">Why it fails:</strong> the amber colour exists specifically to flag &ldquo;this level is under siege from the trend.&rdquo; Counter-trend supports break more often than they hold. CIPHER is editorialising for a reason.</p>
            <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-amber-400">The correction:</strong> when a level turns amber on proximity, treat it as a breakdown candidate, not a bounce zone. Wait for stack alignment before trusting it. See Section 7.</p>
          </div>

          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 mb-4">
            <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 4 \u00B7 STOPPING AT THE LEVEL, NOT BEYOND IT</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-2"><strong className="text-white">The pattern:</strong> long entry on bounce. You place the stop exactly at the support price. Price wicks through by 0.1 ATR on a single noisy bar, takes you out, then immediately recovers and runs your target.</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-2"><strong className="text-white">Why it fails:</strong> levels get wicked through constantly without truly breaking. A stop AT the level gets stopped on noise; a stop BEYOND with a buffer only triggers on real breaks.</p>
            <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-amber-400">The correction:</strong> stops go just beyond the level &mdash; below support, above resistance &mdash; with a 0.2-0.5 ATR buffer. The level is the line of defense; your stop is one tick past it. See Section 14.</p>
          </div>

          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 mb-4">
            <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 5 \u00B7 CHASING SPINE DRIFT AS A SIGNAL</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-2"><strong className="text-white">The pattern:</strong> the Spine is DRIFTING below price. You short, expecting a pullback to the Spine. Price actually accelerates upward instead, and the Spine snap-recomputes to catch up &mdash; your stop hits.</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-2"><strong className="text-white">Why it fails:</strong> Spine drift is a warning, not an entry signal. It tells you momentum is questioned, not that mean reversion is imminent. Especially in strong trends, the Spine simply lags &mdash; it&apos;s 21-bar smoothing, not a forecast.</p>
            <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-amber-400">The correction:</strong> use Spine drift to <em>exit</em> with-trend positions, not to <em>enter</em> counter-trend positions. The drift signals when to leave the party, not when to bet against it. See Section 11.</p>
          </div>

          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 mb-6">
            <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 6 \u00B7 READING SPINE WITHOUT STRUCTURE</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-2"><strong className="text-white">The pattern:</strong> you focus on the Spine line, watching its colour and gap, but ignore the levels. You take momentum-based entries that immediately run into untested resistance and reverse.</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-2"><strong className="text-white">Why it fails:</strong> Spine without Structure is a reader without context &mdash; it tells you how price is doing without telling you where it is. A healthy Spine pointing into a strong resistance is still about to fail; the Spine doesn&apos;t know about the level.</p>
            <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-amber-400">The correction:</strong> always read both. Levels first (where), Spine second (how). Both must agree before entering. See Section 1 and Section 14.</p>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE PATTERN BENEATH THE PATTERNS</p>
            <p className="text-sm text-gray-400 leading-relaxed">Five of the six mistakes share one root: <strong className="text-white">treating one half of the pair as the complete read</strong>. Levels alone produce wrong-side trades when momentum is dying (Mistake 3). Spine alone produces context-blind trades into resistance (Mistake 6). Polarity flips and confluence and trend-aware AMBER all exist because <em>levels need momentum context</em>. Spine drift only matters because <em>price is positioned somewhere relative to levels</em>. Read both. Always both.</p>
          </div>
        </motion.div>
      </section>

      {/* === CHEAT SHEET === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">Cheat Sheet</p>
          <h2 className="text-2xl font-extrabold mb-4">Structure + Spine, condensed</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Print-it-out reference. Each section below distills one concept from the lesson into a single read-aloud sentence plus the one number or rule you actually need at the moment of decision.</p>
          <div className="p-6 rounded-2xl glass-card">
            <div className="pb-4 border-b border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE 10 FIELDS PER LEVEL</p>
              <p className="text-sm text-gray-400 leading-relaxed">6 scalars (price, bar, dir, tests, flips, flip_bar) + 4 visuals (box, line, dot, price_lbl). Parallel arrays indexed in sync.</p>
            </div>
            <div className="py-4 border-b border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE LIFECYCLE PARAMETERS</p>
              <p className="text-sm text-gray-400 leading-relaxed">i_pivot_len = 5 (swing detection window). i_max_zones = 8 (cap per side). i_zone_max_tests = 4 (test retirement). i_zone_max_age = 200 (age retirement, decay starts at 100).</p>
            </div>
            <div className="py-4 border-b border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE POLARITY FLIP RULE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Two consecutive closes beyond the level + minimum age (pivot_len + 3) + flip count &lt; 2 + 10-bar cooldown since last flip. Flips reset tests to 0.</p>
            </div>
            <div className="py-4 border-b border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STRENGTH = TESTS + CONFLUENCE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Capped at 3 visually. Tiers: Speculative (0), Moderate (1), Strong (2), Very Strong (3). Confluence factors: Ribbon edge, Risk Envelope band, round number &mdash; each within 0.4 ATR.</p>
            </div>
            <div className="py-4 border-b border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">VISUAL TIERS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Strength 0-1: dotted thin. Strength 2: dashed medium. Strength 3: solid thick. Counter-trend proximity = AMBER warning. With-trend proximity = brighter glow.</p>
            </div>
            <div className="py-4 border-b border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SPINE FORMULA</p>
              <p className="text-sm text-gray-400 leading-relaxed">spine = (5-bar mid) &times; health_weight + (21-bar mid) &times; (1 \u2212 health_weight). Bands = ATR &times; (1.8 \u2212 health_weight &times; 1.2).</p>
            </div>
            <div className="py-4 border-b border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SPINE-PRICE GAP STATES</p>
              <p className="text-sm text-gray-400 leading-relaxed">TRACKING (&lt;0.4 ATR), LOOSE (0.4-0.8), DRIFTING (0.8-1.5), DETACHED (&gt;1.5). spine_detached boolean fires at &gt;1.0.</p>
            </div>
            <div className="py-4 border-b border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STRUCTURE ROW VERDICTS</p>
              <p className="text-sm text-gray-400 leading-relaxed">NO LEVELS \u2192 DECISION ZONE \u2192 AT SUPPORT \u2192 AT RESISTANCE \u2192 NEAR SUPPORT \u2192 NEAR RESISTANCE \u2192 BETWEEN LEVELS. AT = within 0.5 ATR. NEAR = within 1.5 ATR.</p>
            </div>
            <div className="pt-4">
              <p className="text-xs font-bold text-amber-400 mb-1">THE TRADING RULES</p>
              <p className="text-sm text-gray-400 leading-relaxed">Entry at AT/NEAR support or resistance + Spine confirms direction. Stop just BEYOND level (not at), with ATR buffer. Hold while Spine TRACKING. Tighten on LOOSE. Exit on DRIFTING / DETACHED / amber Spine.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S16 — Scenario Game === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">16 &mdash; Scenario Game</p>
          <h2 className="text-2xl font-extrabold mb-4">Read Structure + Spine Like an Operator</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Five scenarios. Each puts you in front of a real Command Center read &mdash; tooltip metadata, cascade verdicts, polarity flips, Spine drift, trend-aware AMBER warnings. Pick the right call. Explanations appear after every answer, including the wrong ones.</p>
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
                  <p className="text-xs text-gray-400 mt-1">{finalScore >= 4 ? 'Operator-grade Structure + Spine reading installed. You see the chart\u2019s geometry and the engine\u2019s feel together.' : finalScore >= 3 ? 'Solid grasp. Re-read the polarity flip (S05), confluence scoring (S06), the cascade priorities (S12), and the trading playbook (S14) before the quiz.' : 'Re-study the lifecycle (S04), polarity flip (S05), strength rendering (S07), and the six mistakes (S15) before the quiz.'}</p>
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
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 11.17: Cipher Structure + Spine</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-sky-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Structure Operator &mdash;</p>
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
