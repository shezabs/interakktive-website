// app/academy/lesson/cipher-executive-summary/page.tsx
// ATLAS Academy — Lesson 11.6: The Executive Summary — CIPHER's Priority Waterfall [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 11 · CIPHER
// The Single Most Urgent Truth — 17-state priority cascade, one output per bar
// Covers: header action states, color grammar, regime-gated cascade,
//         conflict resolution, two-cell brief, operator reading discipline
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Crown } from 'lucide-react';

// ============================================================
// GAME ROUNDS — 5 scenario-based cascade-reading challenges
// String-id answers, per-option explanations (teaches on wrong answers)
// Covers: priority order, color grammar, regime-gated states,
//         conflict resolution, two-cell brief discipline
// ============================================================
const gameRounds = [
  {
    id: 'r1',
    scenario:
      'EURUSD 1H. The header reads: \u25b2 BULL TREND | \u2192 TREND CURVING (amber). Below it, the Regime row shows TREND | \u2192 TREND AGING (amber). Both amber. You were about to act on the Regime row\u2019s AGING signal.',
    prompt: 'Why does the header show TREND CURVING instead of TREND AGING even though both conditions are true?',
    options: [
      {
        id: 'a',
        text: 'TREND CURVING is a newer feature and overrides older signals automatically.',
        correct: false,
        explain:
          'Not how it works. The cascade is not a version hierarchy \u2014 it is a priority hierarchy. TREND CURVING (proj_converging) sits at priority 6 in the cascade. TREND AGING (stack_aging) sits at priority 7. When both are true on the same bar, priority 6 fires and priority 7 is blocked. The header always reports the single most urgent truth.',
      },
      {
        id: 'b',
        text: 'TREND CURVING has higher priority (6) than TREND AGING (7) in the cascade. Both conditions are true, but only the first true condition outputs.',
        correct: true,
        explain:
          'Correct. evaluates conditions top to bottom. proj_converging is checked before stack_aging. When both are true simultaneously, TREND CURVING fires and TREND AGING is never reached. The header is telling you the projection is bending back \u2014 a more urgent warning than the stack simply aging.',
      },
      {
        id: 'c',
        text: 'TREND AGING only appears in the Regime row, never in the header.',
        correct: false,
        explain:
          'Wrong. TREND AGING absolutely can appear in the header \u2014 it does when stack_aging is true but proj_converging is false. You can see this in real charts (your screenshots show \u2192 TREND AGING in the header). It just cannot appear when a higher-priority condition is also true on the same bar.',
      },
      {
        id: 'd',
        text: 'The header randomly picks between CURVING and AGING when both are active.',
        correct: false,
        explain:
          'No randomness in the cascade. It is a strict top-to-bottom ternary chain in Pine. The same conditions always produce the same output. CURVING beats AGING every time both fire simultaneously, by design.',
      },
    ],
  },
  {
    id: 'r2',
    scenario:
      'BTCUSDT 5m. Header reads: \u21d4 RANGING | \u2192 SNAP ZONE (amber). Below it: Tension row shows STRETCHED \u2192 SNAP LIKELY. Momentum row shows SURGING 77% \u2192 HOLD POSITION. Two rows contradicting each other \u2014 one warning, one bullish.',
    prompt: 'How do you resolve the contradiction between Tension warning and Momentum surging?',
    options: [
      {
        id: 'a',
        text: 'Average them \u2014 moderate your position size and watch for a break.',
        correct: false,
        explain:
          'The header has already resolved this for you \u2014 that\u2019s the entire design. SNAP ZONE (priority 10) fires because tension crossed ts_min_tension before any momentum-based state (priorities 14\u201317) is checked. The header is saying tension wins this bar. You do not need to average or manually resolve.',
      },
      {
        id: 'b',
        text: 'Trust the header. SNAP ZONE fired because tension (priority 10) beats momentum-based states (priority 14+). The header resolved the conflict before you finished reading.',
        correct: true,
        explain:
          'Correct. This is the core design promise from the tooltip: \u201cWhen rows show different colors, the header has already resolved the conflict for you.\u201d SNAP ZONE at priority 10 beats any momentum-based state at priorities 14\u201317. The amber header is telling you to be cautious despite surging momentum \u2014 tension is the louder signal right now.',
      },
      {
        id: 'c',
        text: 'Ignore the Tension row \u2014 Momentum is a more reliable indicator.',
        correct: false,
        explain:
          'The rows are not ranked by reliability \u2014 they measure different market dimensions (tension = price stretch from equilibrium, momentum = directional energy). The priority cascade in the header is the ranking system. On this bar, tension crossed its threshold and reached priority 10 in the cascade, which places it above momentum outputs.',
      },
      {
        id: 'd',
        text: 'Switch to a higher timeframe to get a cleaner read.',
        correct: false,
        explain:
          'Timeframe switching does not resolve intra-bar conflicts. The header exists precisely to give you a single resolved verdict from all the evidence on your current timeframe. The two-cell brief \u2014 header state + header action \u2014 is your minimum viable read. RANGING + SNAP ZONE means: the market is directionless but tension is stretched. Act accordingly.',
      },
    ],
  },
  {
    id: 'r3',
    scenario:
      'XAUUSD 15m. Header reads: \u21d4 RANGING | \u2192 FADING (bright red). You were running a range-fading playbook (buying the lower boundary). The Momentum row shows STRONG. The Risk row shows SAFE.',
    prompt: 'FADING fires in bright red on a RANGING regime \u2014 what does this mean and what do you do?',
    options: [
      {
        id: 'a',
        text: 'FADING is a Momentum signal \u2014 momentum is fading so continue buying the range boundary.',
        correct: false,
        explain:
          'FADING is not a momentum label \u2014 it is a health/spread condition. FADING fires when spread_contracting OR health_critical is true (priority 11). It means the ribbon is losing directional energy or health has degraded critically. This is independent of and higher-priority than the Momentum row\u2019s reading.',
      },
      {
        id: 'b',
        text: 'Bright red header overrides the RANGING regime color. FADING means the market is losing health regardless of regime. Pause or close range positions.',
        correct: true,
        explain:
          'Correct. The header\u2019s action cell renders in bright red (#FF1744) for FADING \u2014 the danger tier. The RANGING state cell stays amber (range regime) but the action is red. The header has resolved the conflict: health is deteriorating inside a range. Running a range-fading playbook when the ribbon health is critical is how positions get trapped. Pause new entries, protect existing ones.',
      },
      {
        id: 'c',
        text: 'Momentum is STRONG and Risk is SAFE, so FADING is a false alarm. Continue the range playbook.',
        correct: false,
        explain:
          'Priority matters here. FADING (priority 11) fires before any momentum or risk-based state in the cascade. The header\u2019s cascade already evaluated STRONG momentum and SAFE risk \u2014 and still surfaced FADING as the most urgent truth. The header is not wrong; it is processing spread_contracting or health_critical which the Momentum and Risk rows do not directly capture.',
      },
      {
        id: 'd',
        text: 'Switch to the VOLATILE playbook \u2014 red header means VOLATILE regime.',
        correct: false,
        explain:
          'Red header action does not mean VOLATILE regime. The state cell (col 2) still reads RANGING \u2014 the regime has not changed. The action cell color (bright red) reflects the urgency of FADING, not the regime type. VOLATILE is signaled in the state cell as \u26a1 VOLATILE with a magenta color. Read both cells independently.',
      },
    ],
  },
  {
    id: 'r4',
    scenario:
      'SPX 1H. Header reads: \u25b2 BULL TREND | \u2192 RIDE IT (teal). Every other row in the Command Center is mixed: Tension shows SNAPPING in magenta, Risk shows WATCH in amber, Volume shows EMPTY in amber. Multiple amber and one magenta row below a teal header.',
    prompt: 'How do you reconcile a teal RIDE IT header against multiple warning rows below?',
    options: [
      {
        id: 'a',
        text: 'Count the warning rows \u2014 3 amber/magenta rows vs 1 teal header means do not trade.',
        correct: false,
        explain:
          'Majority-vote is not how the Command Center works. The header is not one vote among many \u2014 it is the pre-resolved verdict. RIDE IT fires when spread_expanding AND health_smooth > 50 (priority 9). The cascade evaluated Tension, Risk, and Volume before reaching RIDE IT and determined none of them triggered a higher-priority state. The header\u2019s verdict is already the resolved synthesis.',
      },
      {
        id: 'b',
        text: 'Trust the header. RIDE IT fires at priority 9 only when spread is expanding and health is above 50 \u2014 both stronger signals than the warning rows\u2019 individual conditions. Trade the trend but note the Tension warning for stop discipline.',
        correct: true,
        explain:
          'Correct. RIDE IT requires spread_expanding + health_smooth > 50. These are structural trend-health conditions that override the warning signals from Tension, Risk, and Volume because they fired first in the cascade. The rows showing warnings are evidence \u2014 useful for position management (tighter stop given Tension SNAPPING) but the trend verdict is RIDE IT. Read the header, use the rows for nuance.',
      },
      {
        id: 'c',
        text: 'The header is wrong \u2014 three warning rows cannot all be overridden by one teal signal.',
        correct: false,
        explain:
          'The header is never "wrong" relative to the rows \u2014 it is the synthesis of all of them through a priority system, not a vote count. The rows show evidence; the header shows the verdict. If three rows show amber and the header shows teal RIDE IT, it means none of the amber conditions triggered a priority above 9 in the cascade. The trend structure is intact.',
      },
      {
        id: 'd',
        text: 'Switch to the SNAP ZONE playbook \u2014 Tension SNAPPING is more specific than RIDE IT.',
        correct: false,
        explain:
          'SNAP ZONE (priority 10) fires when tension crosses ts_min_tension. RIDE IT (priority 9) fires when spread is expanding and health > 50. Since RIDE IT has higher priority and fired, SNAP ZONE was NOT triggered this bar \u2014 or it was evaluated and the RIDE IT conditions took precedence. You do not manually override the cascade. Use Tension SNAPPING for stop placement, not for regime.',
      },
    ],
  },
  {
    id: 'r5',
    scenario:
      'GBPUSD 4H. The minimum viable read: header shows \u21d4 RANGING | \u2192 FADING (red). You have 10 seconds before a meeting. You cannot read any other row.',
    prompt: 'Using only the two-cell header brief, what do you know and what action does it imply?',
    options: [
      {
        id: 'a',
        text: 'RANGING = no directional trade. FADING = health deteriorating. Two actions: no new range positions, protect existing ones.',
        correct: true,
        explain:
          'Correct. The two-cell brief delivers full operator context: state cell (RANGING) tells you the market character \u2014 directionless, range playbook territory. Action cell (FADING, red) tells you the single most urgent condition \u2014 ribbon health or spread is deteriorating. No new entries. If you have open range positions, protect or close them. This is the minimum viable CIPHER read \u2014 two cells, full decision.',
      },
      {
        id: 'b',
        text: 'You need to read at least the Regime and Momentum rows before deciding. Two cells is not enough.',
        correct: false,
        explain:
          'This misunderstands the header\u2019s design purpose. The tooltip states it explicitly: "This row reads ALL intelligence below and shows the single most important action right now." The header IS the synthesis of all rows. Reading more rows adds nuance \u2014 it does not change the core verdict. In a time-constrained situation, the two-cell brief is a complete, valid operator read.',
      },
      {
        id: 'c',
        text: 'RANGING + FADING = VOLATILE regime incoming. Reduce size immediately.',
        correct: false,
        explain:
          'FADING does not predict VOLATILE. FADING means spread_contracting or health_critical in the current regime. The state cell would show \u26a1 VOLATILE if the regime had changed. RANGING still means range market physics. The action is to stop new entries and protect positions \u2014 not to invoke the VOLATILE playbook.',
      },
      {
        id: 'd',
        text: 'Red action cell means the indicator has an error. Restart CIPHER.',
        correct: false,
        explain:
          'Red action cells are intentional and documented. FADING, EXIT SOON, and REVERSAL NEAR all render in bright red (#FF1744) by design . Red means danger-tier urgency \u2014 not malfunction. The color is information, not an error state.',
      },
    ],
  },
];

// ============================================================
// QUIZ QUESTIONS — 8 questions, 66% pass threshold
// Covers: cascade order, color grammar, regime gating, header state cell,
//         conflict resolution, two-cell brief, RIDE IT conditions, FADING meaning
// ============================================================
const quizQuestions = [
  {
    id: 'q1',
    question:
      'The header action cell in CIPHER PRO evaluates conditions in what order?',
    options: [
      { id: 'a', text: 'Alphabetical by state name', correct: false },
      { id: 'b', text: 'A fixed priority waterfall \u2014 top to bottom, first true condition wins', correct: true },
      { id: 'c', text: 'Most recently triggered condition wins', correct: false },
      { id: 'd', text: 'Majority vote across all rows', correct: false },
    ],
    explain:
      'is a single long ternary chain evaluated top to bottom. The first condition that evaluates true outputs its state and blocks all remaining conditions. This is a strict priority waterfall \u2014 no averaging, no voting, no recency bias.',
  },
  {
    id: 'q2',
    question:
      'What is the header action cell\u2019s highest-priority state (first in the cascade)?',
    options: [
      { id: 'a', text: '\u2192 RIDE IT', correct: false },
      { id: 'b', text: '\u2192 TREND HOLLOWING', correct: false },
      { id: 'c', text: '\u2192 BREAKOUT \u25b2 or \u2192 BREAKOUT \u25bc', correct: true },
      { id: 'd', text: '\u2192 REDUCE SIZE', correct: false },
    ],
    explain:
      'The cascade opens with squeeze_fire: if a squeeze has just released, the header immediately reports BREAKOUT \u25b2 (teal) or BREAKOUT \u25bc (magenta) depending on direction. This is priority 1 \u2014 nothing else can override an active breakout.',
  },
  {
    id: 'q3',
    question:
      'What color does \u2192 FADING render in the header action cell?',
    options: [
      { id: 'a', text: 'Amber \u2014 caution tier', correct: false },
      { id: 'b', text: 'Magenta \u2014 volatile tier', correct: false },
      { id: 'c', text: 'Bright red (#FF1744) \u2014 danger tier', correct: true },
      { id: 'd', text: 'Teal \u2014 go tier', correct: false },
    ],
    explain:
      'assigns bright red (#FF1744) to FADING, EXIT SOON, and REVERSAL NEAR. This is a distinct color from the magenta used for VOLATILE states \u2014 it signals danger-tier urgency (capital risk) rather than volatility-regime conditions.',
  },
  {
    id: 'q4',
    question:
      'The header state cell (col 2) shows \u21d4 RANGING. What color does it render in?',
    options: [
      { id: 'a', text: 'Teal', correct: false },
      { id: 'b', text: 'Magenta', correct: false },
      { id: 'c', text: 'Amber', correct: true },
      { id: 'd', text: 'White', correct: false },
    ],
    explain:
      'the header state color for RANGING regime is AMBER. TREND is teal (bull) or magenta (bear). VOLATILE is magenta. RANGING is amber \u2014 consistent with the amber used throughout CIPHER for range/uncertainty states.',
  },
  {
    id: 'q5',
    question:
      '\u2192 RIDE IT requires which conditions to fire ()?',
    options: [
      { id: 'a', text: 'TREND regime + ADX above 30', correct: false },
      { id: 'b', text: 'TREND regime + spread_expanding + health_smooth above 50', correct: true },
      { id: 'c', text: 'TREND regime + Momentum showing SURGING', correct: false },
      { id: 'd', text: 'Any regime + spread_expanding', correct: false },
    ],
    explain:
      'From regime == "TREND" and spread_expanding and health_smooth > 50. All three must be true simultaneously. RIDE IT is regime-gated \u2014 it cannot fire during RANGE or VOLATILE. It also requires the ribbon spread to be actively expanding and the health smoothing above the midpoint.',
  },
  {
    id: 'q6',
    question:
      'You see \u21d4 RANGING in the header state cell and \u2192 FADING in red in the action cell. What does this combined read tell you?',
    options: [
      { id: 'a', text: 'The regime is RANGE and the market is about to trend', correct: false },
      { id: 'b', text: 'The regime is RANGE and ribbon health or spread is deteriorating \u2014 capital risk state', correct: true },
      { id: 'c', text: 'The regime has changed to VOLATILE', correct: false },
      { id: 'd', text: 'CIPHER has a contradictory signal error', correct: false },
    ],
    explain:
      'RANGING tells you market character: directionless, range physics. FADING (red) tells you the single most urgent condition: spread_contracting or health_critical. The two cells together mean \u201crange regime, but internal health is failing.\u201d No contradiction \u2014 the header resolved it. No new range entries; protect existing positions.',
  },
  {
    id: 'q7',
    question:
      'Which header action state is regime-gated to VOLATILE only?',
    options: [
      { id: 'a', text: '\u2192 SNAP ZONE', correct: false },
      { id: 'b', text: '\u2192 FADING', correct: false },
      { id: 'c', text: '\u2192 REDUCE SIZE', correct: true },
      { id: 'd', text: '\u2192 DOUBLE COIL', correct: false },
    ],
    explain:
      '\u2192 REDUCE SIZE fires only when regime == "VOLATILE". It is the only action state that is exclusively regime-gated to a single regime type. SNAP ZONE fires on tension regardless of regime. FADING fires on spread/health regardless of regime. DOUBLE COIL fires on ribbon + squeeze compression regardless of regime.',
  },
  {
    id: 'q8',
    question:
      'The CIPHER PRO header tooltip says: "When rows show different colors, the header has already resolved the conflict for you." What does this mean operationally?',
    options: [
      { id: 'a', text: 'You should manually average the row colors to get the true signal', correct: false },
      { id: 'b', text: 'You should switch timeframes when rows conflict', correct: false },
      { id: 'c', text: 'The header\u2019s action cell is the resolved verdict \u2014 you do not need to manually synthesise conflicting rows', correct: true },
      { id: 'd', text: 'Conflicting rows mean the indicator is in an error state', correct: false },
    ],
    explain:
      'The priority cascade processes all row conditions simultaneously on every bar and outputs the single highest-priority true condition. When Momentum is bullish but Tension is stretched, the cascade has already determined which one takes precedence. You read the header action cell \u2014 that is the synthesis. The rows below are evidence for nuance, not a second vote.',
  },
];

// ============================================================
// CANVAS ANIMATION PRIMITIVE — gold pattern from 11.4/11.5
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
  const rafRef    = useRef<number | null>(null);
  const startRef  = useRef<number | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const resize = () => {
      const w = Math.min(parent.clientWidth, 720);
      const h = w / aspectRatio;
      canvas.width  = w * window.devicePixelRatio;
      canvas.height = h * window.devicePixelRatio;
      canvas.style.width  = w + 'px';
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
      const w = canvas.width  / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;
      ctx.clearRect(0, 0, w, h);
      draw(ctx, t, w, h);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [visible, draw]);

  return (
    <div className={`w-full rounded-2xl overflow-hidden border border-white/5 bg-black/30 ${className}`}>
      <canvas ref={canvasRef} className="block mx-auto" />
    </div>
  );
}

// ============================================================
// CONFETTI — 120 particles, 5-second auto-off
// ============================================================
function Confetti({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    type P = { x: number; y: number; vx: number; vy: number; c: string; s: number; r: number; vr: number };
    const colors = ['#26A69A', '#FFB300', '#EF5350', '#FFFFFF', '#FBBF24'];
    const particles: P[] = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width, y: -20,
      vx: (Math.random() - 0.5) * 6, vy: Math.random() * 3 + 2,
      c: colors[Math.floor(Math.random() * colors.length)],
      s: Math.random() * 6 + 4,
      r: Math.random() * Math.PI * 2, vr: (Math.random() - 0.5) * 0.2,
    }));
    let rafId = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.r += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s);
        ctx.restore();
      });
      rafId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafId);
  }, [active]);
  if (!active) return null;
  return (
    <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[100]"
      style={{ width: '100vw', height: '100vh' }} />
  );
}

// ============================================================
// SHARED CC ROW DRAW HELPER — used by multiple animations
// Draws the CIPHER PRO header + optional evidence rows
// Colors/labels matched exactly from 5 real screenshots
// ============================================================
function drawCCRows(
  ctx: CanvasRenderingContext2D,
  W: number,
  startY: number,
  headerState: string,
  headerStateColor: string,
  headerAction: string,
  headerActionColor: string,
  evidenceRows: Array<{ label: string; state: string; sc: string; action: string; ac: string }>,
  highlightHeader = true
) {
  const TEAL    = '#26A69A';
  const rowH    = 26;
  const rowGap  = 2;
  const rowW    = W - 32;

  // Header row
  ctx.fillStyle = highlightHeader ? 'rgba(0,0,0,0.65)' : 'rgba(0,0,0,0.4)';
  ctx.fillRect(16, startY, rowW, rowH);
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.strokeRect(16, startY, rowW, rowH);

  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = 'bold 11px "SF Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('CIPHER PRO  \u24d8', 28, startY + rowH / 2 + 4);

  ctx.fillStyle = headerStateColor;
  ctx.font = 'bold 11px "SF Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(headerState, 16 + rowW * 0.52, startY + rowH / 2 + 4);

  if (highlightHeader) {
    ctx.shadowBlur  = headerActionColor === '#FF1744' ? 12 : headerActionColor === TEAL ? 10 : 6;
    ctx.shadowColor = headerActionColor;
  }
  ctx.fillStyle = headerActionColor;
  ctx.font = 'bold 12px "SF Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText(headerAction, 16 + rowW - 10, startY + rowH / 2 + 4);
  ctx.shadowBlur = 0;

  // Evidence rows
  evidenceRows.forEach((row, ri) => {
    const ry = startY + (rowH + rowGap) * (ri + 1);
    ctx.fillStyle = 'rgba(0,0,0,0.32)';
    ctx.fillRect(16, ry, rowW, rowH);
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.strokeRect(16, ry, rowW, rowH);

    ctx.fillStyle = 'rgba(255,255,255,0.36)';
    ctx.font = '10px "SF Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(row.label, 28, ry + rowH / 2 + 4);

    ctx.fillStyle = row.sc;
    ctx.font = 'bold 10px "SF Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(row.state, 16 + rowW * 0.52, ry + rowH / 2 + 4);

    ctx.fillStyle = row.ac;
    ctx.font = '10px "SF Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(row.action, 16 + rowW - 10, ry + rowH / 2 + 4);
  });
}

// ============================================================
// ANIMATION 1 — PriorityWaterfallAnim (S01 — Groundbreaking Concept)
// 5-scene cycle: RIDE IT → TREND CURVING → TREND AGING → SNAP ZONE → FADING
// Live cascade list: active row glows, higher rows dim as blocked
// All 5 from real screenshots
// ============================================================
function PriorityWaterfallAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL    = '#26A69A';
    const AMBER   = '#FFB300';
    const RED     = '#FF1744';
    const MAGENTA = '#EF5350';

    const SCENE_DUR = 5.0;
    const cycleT    = t % (SCENE_DUR * 5);
    const sceneIdx  = Math.min(4, Math.floor(cycleT / SCENE_DUR));
    const sceneT    = (cycleT % SCENE_DUR) / SCENE_DUR;

    const scenes = [
      {
        label: 'SCENE 1 \u00b7 RIDE IT \u2014 Clean trend running',
        hState: '\u25b2 BULL TREND', hSC: TEAL,
        hAction: '\u2192 RIDE IT', hAC: TEAL, activeP: 9,
        rows: [
          { label: 'Ribbon',   state: '\u25b2 BULL',          sc: TEAL,    action: 'PRIME 13b (avg 26)',     ac: TEAL  },
          { label: 'Momentum', state: '\u25b2 BUILDING 70%\u25bc', sc: TEAL, action: '\u2192 ENTRY ZONE',   ac: TEAL  },
          { label: 'Regime',   state: 'TREND',                sc: TEAL,    action: '\u2192 TREND INTACT',   ac: TEAL  },
        ],
        note: 'Priorities 1\u20138 all false. RIDE IT fires at priority 9.',
      },
      {
        label: 'SCENE 2 \u00b7 TREND CURVING \u2014 Projection bending',
        hState: '\u25b2 BULL TREND', hSC: TEAL,
        hAction: '\u2192 TREND CURVING', hAC: AMBER, activeP: 6,
        rows: [
          { label: 'Ribbon',   state: '\u25b2 BULL',          sc: TEAL,  action: '\u2192 CURVING',             ac: AMBER   },
          { label: 'Momentum', state: '\u25bc FADING 57%\u25bc', sc: AMBER, action: '\u2192 REDUCE SIZE',      ac: MAGENTA },
          { label: 'Regime',   state: 'TREND',                sc: TEAL,  action: '\u2192 SHIFTING TO RANGE',   ac: AMBER   },
        ],
        note: 'CURVING (priority 6) fires, blocking AGING (7) even if also true.',
      },
      {
        label: 'SCENE 3 \u00b7 TREND AGING \u2014 Stack past average',
        hState: '\u25b2 BULL TREND', hSC: TEAL,
        hAction: '\u2192 TREND AGING', hAC: AMBER, activeP: 7,
        rows: [
          { label: 'Ribbon',   state: '\u25b2 BULL',          sc: TEAL,  action: '\u2192 EXTENDED 50b (avg 30)', ac: AMBER   },
          { label: 'Momentum', state: '\u25bc FADING 56%\u25bc', sc: AMBER, action: '\u2192 REDUCE SIZE',        ac: MAGENTA },
          { label: 'Regime',   state: 'TREND',                sc: TEAL,  action: '\u2192 RANGE FORMING',         ac: AMBER   },
        ],
        note: 'CURVING is false this bar. AGING fires at priority 7.',
      },
      {
        label: 'SCENE 4 \u00b7 SNAP ZONE \u2014 Tension beats momentum',
        hState: '\u21d4 RANGING', hSC: AMBER,
        hAction: '\u2192 SNAP ZONE', hAC: AMBER, activeP: 10,
        rows: [
          { label: 'Tension',  state: '\u25b2 STRETCHED',     sc: MAGENTA, action: '\u2192 SNAP LIKELY',   ac: AMBER },
          { label: 'Momentum', state: '\u25b2 SURGING 77%\u25b2', sc: TEAL, action: '\u2192 HOLD POSITION', ac: TEAL  },
          { label: 'Regime',   state: 'RANGE',               sc: AMBER,   action: '\u2192 RANGE HOLDING', ac: AMBER },
        ],
        note: 'Tension (priority 10) outranks any momentum state (priority 14+).',
      },
      {
        label: 'SCENE 5 \u00b7 FADING \u2014 Health critical, danger tier',
        hState: '\u21d4 RANGING', hSC: AMBER,
        hAction: '\u2192 FADING', hAC: RED, activeP: 11,
        rows: [
          { label: 'Ribbon',   state: '\u25bc BEAR',          sc: MAGENTA, action: '\u2192 CURVING',         ac: AMBER },
          { label: 'Momentum', state: '\u25b2 STRONG 62%\u2212', sc: TEAL, action: '\u2192 TIGHTEN STOPS',   ac: AMBER },
          { label: 'Regime',   state: 'RANGE',               sc: AMBER,   action: '\u2192 SHIFTING TO TREND', ac: AMBER },
        ],
        note: 'Rows show mixed colors. Header resolved: health failing = red FADING.',
      },
    ];
    const s = scenes[sceneIdx];

    // ── Layout: top label bar, then LEFT = CC rows, RIGHT = cascade list ──
    const LABEL_H  = 18;
    const PAD      = 10;
    const listW    = Math.min(110, w * 0.28); // cascade panel width
    const leftW    = w - listW - PAD * 3;     // CC panel width

    // Scene label
    ctx.fillStyle = 'rgba(255,179,0,0.7)';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(s.label, PAD, LABEL_H - 4);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${sceneIdx + 1} / 5`, w - PAD, LABEL_H - 4);

    // ── LEFT: CC rows (constrained to leftW) ──
    const ccStartY = LABEL_H + 4;
    const rowH     = 28;
    const rowGap   = 2;

    // Header row
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(PAD, ccStartY, leftW, rowH);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.strokeRect(PAD, ccStartY, leftW, rowH);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 10px "SF Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('CIPHER PRO \u24d8', PAD + 8, ccStartY + rowH / 2 + 4);

    ctx.fillStyle = s.hSC;
    ctx.font = 'bold 10px "SF Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(s.hState, PAD + leftW * 0.5, ccStartY + rowH / 2 + 4);

    if (s.hAC === RED) { ctx.shadowBlur = 10; ctx.shadowColor = RED; }
    else if (s.hAC === TEAL) { ctx.shadowBlur = 8; ctx.shadowColor = TEAL; }
    ctx.fillStyle = s.hAC;
    ctx.font = 'bold 11px "SF Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(s.hAction, PAD + leftW - 8, ccStartY + rowH / 2 + 4);
    ctx.shadowBlur = 0;

    // Evidence rows
    s.rows.forEach((row, ri) => {
      const ry = ccStartY + (rowH + rowGap) * (ri + 1);
      ctx.fillStyle = 'rgba(0,0,0,0.32)';
      ctx.fillRect(PAD, ry, leftW, rowH);
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.strokeRect(PAD, ry, leftW, rowH);

      ctx.fillStyle = 'rgba(255,255,255,0.36)';
      ctx.font = '10px "SF Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(row.label, PAD + 8, ry + rowH / 2 + 4);

      ctx.fillStyle = row.sc;
      ctx.font = 'bold 10px "SF Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(row.state, PAD + leftW * 0.5, ry + rowH / 2 + 4);

      ctx.fillStyle = row.ac;
      ctx.font = '9px "SF Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(row.action, PAD + leftW - 8, ry + rowH / 2 + 4);
    });

    // Note bar below CC rows
    const noteY = ccStartY + (rowH + rowGap) * 4 + 6;
    ctx.fillStyle = s.hAC === RED ? 'rgba(255,23,68,0.07)' : 'rgba(255,179,0,0.06)';
    ctx.strokeStyle = s.hAC === RED ? 'rgba(255,23,68,0.25)' : 'rgba(255,179,0,0.2)';
    ctx.lineWidth = 1;
    ctx.fillRect(PAD, noteY, leftW, 22);
    ctx.strokeRect(PAD, noteY, leftW, 22);
    ctx.fillStyle = s.hAC === RED ? RED + 'cc' : 'rgba(255,179,0,0.8)';
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(s.note, PAD + leftW / 2, noteY + 14);

    // ── RIGHT: Cascade priority list ──
    const cascadeItems = [
      { p: 1,  label: 'BREAKOUT',    color: TEAL    },
      { p: 2,  label: 'BRKOUT LOAD', color: AMBER   },
      { p: 3,  label: 'DBL COIL',    color: MAGENTA },
      { p: 4,  label: 'HOLLOWING',   color: AMBER   },
      { p: 5,  label: 'CURVING',     color: AMBER   },
      { p: 6,  label: 'AGING',       color: AMBER   },
      { p: 7,  label: 'COILED',      color: AMBER   },
      { p: 8,  label: 'RIDE IT',     color: TEAL    },
      { p: 9,  label: 'SNAP ZONE',   color: AMBER   },
      { p: 10, label: 'FADING',      color: RED     },
      { p: 11, label: 'BUILDING',    color: '#00BCD4'},
      { p: 12, label: 'COILING',     color: AMBER   },
      { p: 13, label: 'REDUCE SIZE', color: MAGENTA },
      { p: 14, label: 'WAIT',        color: 'rgba(255,255,255,0.3)' },
    ];

    const listX   = w - listW - PAD;
    const listY   = ccStartY;
    const listH   = h - listY - PAD;
    const itemH   = listH / (cascadeItems.length + 1);

    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.fillRect(listX, listY, listW, listH);
    ctx.strokeRect(listX, listY, listW, listH);

    ctx.fillStyle = 'rgba(255,179,0,0.5)';
    ctx.font = 'bold 7px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PRIORITY CASCADE', listX + listW / 2, listY + 10);

    cascadeItems.forEach((item, idx) => {
      const iy       = listY + itemH + idx * itemH;
      const isActive = item.p === s.activeP;
      const isBlocked = item.p < s.activeP;

      if (isActive) {
        ctx.fillStyle = item.color + '28';
        ctx.fillRect(listX, iy - itemH * 0.3, listW, itemH * 0.9);
        ctx.shadowBlur  = 8;
        ctx.shadowColor = item.color;
      }

      ctx.fillStyle = isBlocked
        ? 'rgba(255,255,255,0.14)'
        : isActive ? item.color : item.color + 'bb';
      ctx.font = `${isActive ? 'bold ' : ''}8px Inter, sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(`${item.p}. ${item.label}`, listX + 6, iy + itemH * 0.25);
      ctx.shadowBlur = 0;

      if (isBlocked) {
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(listX + 6, iy + itemH * 0.12);
        ctx.lineTo(listX + listW - 6, iy + itemH * 0.12);
        ctx.stroke();
      }
    });
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 2 — HeaderStateCellAnim (S02)
// The 4 header STATE cell values: ▲ BULL TREND / ▼ BEAR TREND / ⚡ VOLATILE / ↔ RANGING
// Shows what drives each + color, cycling through real examples
// ============================================================
function HeaderStateCellAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL    = '#26A69A';
    const AMBER   = '#FFB300';
    const MAGENTA = '#EF5350';

    const cycleT   = t % 16;
    const sceneIdx = Math.min(3, Math.floor(cycleT / 4));
    const sceneT   = (cycleT % 4) / 4;

    const states = [
      { state: '\u25b2 BULL TREND', color: TEAL,    driver: 'TREND regime + pulse_dir = bull',  note: 'Ribbon stacked bull + ADX-driven trend wins' },
      { state: '\u25bc BEAR TREND', color: MAGENTA, driver: 'TREND regime + pulse_dir = bear',  note: 'Ribbon stacked bear + ADX-driven trend wins' },
      { state: '\u26a1 VOLATILE',   color: MAGENTA, driver: 'VOLATILE regime active',           note: 'ATR spike > 1.5\u00d7 ATR_slow dominates race' },
      { state: '\u21d4 RANGING',    color: AMBER,   driver: 'RANGE regime active',              note: 'Neither trend nor vol spike wins the race' },
    ];
    const s = states[sceneIdx];

    ctx.fillStyle = 'rgba(255,179,0,0.65)';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('HEADER STATE CELL (col 2) \u2014 driven by regime + ribbon direction', w / 2, 16);

    // Big state display
    const midY = h * 0.38;
    ctx.shadowBlur  = 24;
    ctx.shadowColor = s.color;
    ctx.fillStyle   = s.color;
    ctx.font        = 'bold 28px "SF Mono", monospace';
    ctx.textAlign   = 'center';
    ctx.fillText(s.state, w / 2, midY);
    ctx.shadowBlur  = 0;

    // Color swatch
    const swatchY = midY + 20;
    const swW = 80;
    ctx.fillStyle = s.color + '22';
    ctx.strokeStyle = s.color + '88';
    ctx.lineWidth = 1;
    const swX = (w - swW) / 2;
    ctx.fillRect(swX, swatchY, swW, 18);
    ctx.strokeRect(swX, swatchY, swW, 18);
    ctx.fillStyle = s.color;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.fillText(
      s.color === TEAL ? 'TEAL \u2014 bull' : s.color === MAGENTA ? 'MAGENTA \u2014 volatile/bear' : 'AMBER \u2014 range',
      w / 2, swatchY + 12
    );

    // Driver text
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.fillText('CONDITION:', w / 2, swatchY + 38);
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = '11px "SF Mono", monospace';
    ctx.fillText(s.driver, w / 2, swatchY + 54);

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText(s.note, w / 2, swatchY + 72);

    // Four-panel selector at bottom
    const panelY = h - 44;
    const panelW = (w - 32) / 4;
    states.forEach((st, i) => {
      const px = 16 + i * panelW;
      const isActive = i === sceneIdx;
      ctx.fillStyle = isActive ? st.color + '22' : 'rgba(255,255,255,0.03)';
      ctx.strokeStyle = isActive ? st.color + '88' : 'rgba(255,255,255,0.06)';
      ctx.lineWidth = isActive ? 1.5 : 1;
      ctx.fillRect(px, panelY, panelW - 4, 34);
      ctx.strokeRect(px, panelY, panelW - 4, 34);
      ctx.fillStyle = isActive ? st.color : st.color + '66';
      ctx.font = `${isActive ? 'bold ' : ''}9px "SF Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(st.state, px + (panelW - 4) / 2, panelY + 20);
    });
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 3 — ColorGrammarAnim (S03)
// Four-color urgency system — cycles through real header states
// Teal = go, Amber = caution, Red = danger, Magenta = volatile
// ============================================================
function ColorGrammarAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL    = '#26A69A';
    const AMBER   = '#FFB300';
    const RED     = '#FF1744';
    const MAGENTA = '#EF5350';

    // Sweep t % 20, 5s per tier
    const cycleT   = t % 20;
    const tierIdx  = Math.min(3, Math.floor(cycleT / 5));
    const tierT    = (cycleT % 5) / 5;

    const tiers = [
      {
        color: TEAL, label: 'TEAL \u2014 Go', urgency: 'Lowest urgency / Positive action',
        states: ['\u2192 RIDE IT', '\u2192 BREAKOUT \u25b2', '\u2192 ENTRY ZONE'],
        meaning: 'The trend is structurally healthy and running. Execute your playbook with full conviction.',
      },
      {
        color: AMBER, label: 'AMBER \u2014 Caution', urgency: 'Prepare / Warning',
        states: ['\u2192 TREND AGING', '\u2192 TREND CURVING', '\u2192 SNAP ZONE', '\u2192 COILING'],
        meaning: 'Something requires your attention. Not a stop signal \u2014 a preparation signal. Tighten, reduce, or watch for escalation.',
      },
      {
        color: RED, label: 'RED \u2014 Danger', urgency: 'Capital risk \u2014 act now',
        states: ['\u2192 FADING', '\u2192 EXIT SOON', '\u2192 REVERSAL NEAR'],
        meaning: 'Health is deteriorating or exit conditions are imminent. Protect capital. No new entries in this direction.',
      },
      {
        color: MAGENTA, label: 'MAGENTA \u2014 Volatile', urgency: 'Regime-specific / Structural',
        states: ['\u2192 REDUCE SIZE', '\u2192 BREAKOUT \u25bc', '\u2192 DOUBLE COIL'],
        meaning: 'VOLATILE regime is active, or a squeeze is firing bearish, or both ribbon layers are compressed simultaneously.',
      },
    ];
    const tier = tiers[tierIdx];

    // Header
    ctx.fillStyle = 'rgba(255,179,0,0.65)';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('COLOR GRAMMAR \u2014 read the color before you read the word', w / 2, 16);

    // Big color dot + label
    const dotY = h * 0.28;
    ctx.shadowBlur  = 30;
    ctx.shadowColor = tier.color;
    ctx.fillStyle   = tier.color;
    ctx.beginPath();
    ctx.arc(w / 2, dotY, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur  = 0;

    ctx.fillStyle = tier.color;
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(tier.label, w / 2, dotY + 42);

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText(tier.urgency, w / 2, dotY + 60);

    // State pills
    const pillY = dotY + 80;
    const totalW = tier.states.reduce((sum, s) => {
      ctx.font = '10px "SF Mono", monospace';
      return sum + ctx.measureText(s).width + 28;
    }, -8);
    let pillX = (w - Math.min(totalW, w - 32)) / 2;

    tier.states.forEach((st) => {
      ctx.font = '10px "SF Mono", monospace';
      const tw = ctx.measureText(st).width;
      const pH = 20;
      const pW = tw + 20;
      if (pillX + pW > w - 16) return;
      ctx.fillStyle = tier.color + '18';
      ctx.strokeStyle = tier.color + '55';
      ctx.lineWidth = 1;
      ctx.fillRect(pillX, pillY, pW, pH);
      ctx.strokeRect(pillX, pillY, pW, pH);
      ctx.fillStyle = tier.color;
      ctx.textAlign = 'left';
      ctx.fillText(st, pillX + 10, pillY + 13);
      pillX += pW + 8;
    });

    // Meaning
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    const maxW = w - 60;
    const words = tier.meaning.split(' ');
    let line = '';
    let lineY = pillY + 36;
    words.forEach((word, wi) => {
      const test = line + (line ? ' ' : '') + word;
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, w / 2, lineY);
        line = word; lineY += 18;
      } else { line = test; }
      if (wi === words.length - 1) ctx.fillText(line, w / 2, lineY);
    });

    // Four tier dots at bottom
    const dotRowY = h - 28;
    const spacing = 60;
    const startX  = w / 2 - (tiers.length - 1) * spacing / 2;
    tiers.forEach((ti, i) => {
      const dx = startX + i * spacing;
      ctx.shadowBlur  = i === tierIdx ? 12 : 0;
      ctx.shadowColor = ti.color;
      ctx.fillStyle   = i === tierIdx ? ti.color : ti.color + '44';
      ctx.beginPath();
      ctx.arc(dx, dotRowY, i === tierIdx ? 8 : 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 4 — TwoCellBriefAnim (S04)
// The minimum viable read: header state + header action only
// 4 scenarios showing how 2 cells deliver full operator context
// ============================================================
function TwoCellBriefAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL    = '#26A69A';
    const AMBER   = '#FFB300';
    const RED     = '#FF1744';
    const MAGENTA = '#EF5350';

    const cycleT   = t % 20;
    const sceneIdx = Math.min(3, Math.floor(cycleT / 5));

    const briefs = [
      {
        state: '\u25b2 BULL TREND', sc: TEAL,
        action: '\u2192 RIDE IT', ac: TEAL,
        market: 'TREND regime, bull direction, ribbon health > 50%',
        operator: 'Run trend playbook at full conviction. Ride pullbacks. Do not fade.',
        color: TEAL,
      },
      {
        state: '\u25b2 BULL TREND', sc: TEAL,
        action: '\u2192 TREND AGING', ac: AMBER,
        market: 'TREND regime, bull direction, stack past average',
        operator: 'Regime still active but aging. Take partials. Tighten stop. Watch for SHIFTING.',
        color: AMBER,
      },
      {
        state: '\u21d4 RANGING', sc: AMBER,
        action: '\u2192 SNAP ZONE', ac: AMBER,
        market: 'RANGE regime, tension stretched past threshold',
        operator: 'Range market, but tension is coiled. No new mean-reversion entries. Wait for snap or resolution.',
        color: AMBER,
      },
      {
        state: '\u21d4 RANGING', sc: AMBER,
        action: '\u2192 FADING', ac: RED,
        market: 'RANGE regime, ribbon health or spread deteriorating',
        operator: 'Range market but health failing. No new entries. Protect or close existing positions.',
        color: RED,
      },
    ];
    const b = briefs[sceneIdx];

    ctx.fillStyle = 'rgba(255,179,0,0.65)';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE TWO-CELL BRIEF \u2014 full operator context from state + action alone', w / 2, 16);

    // Large two-cell display
    const cellY   = 28;
    const cellH   = 44;
    const rowW    = w - 32;
    const cellW   = rowW / 2 - 4;

    // State cell
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(16, cellY, cellW, cellH);
    ctx.strokeStyle = b.sc + '55';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(16, cellY, cellW, cellH);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = 'bold 8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('STATE CELL (col 2)', 16 + cellW / 2, cellY + 12);
    ctx.fillStyle = b.sc;
    ctx.font = 'bold 14px "SF Mono", monospace';
    ctx.fillText(b.state, 16 + cellW / 2, cellY + 33);

    // Action cell
    const ac2X = 16 + cellW + 8;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(ac2X, cellY, cellW, cellH);
    ctx.strokeStyle = b.ac + '55';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(ac2X, cellY, cellW, cellH);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = 'bold 8px Inter, sans-serif';
    ctx.fillText('ACTION CELL (col 3)', ac2X + cellW / 2, cellY + 12);
    ctx.shadowBlur  = b.ac === RED ? 10 : b.ac === TEAL ? 8 : 5;
    ctx.shadowColor = b.ac;
    ctx.fillStyle   = b.ac;
    ctx.font = 'bold 14px "SF Mono", monospace';
    ctx.fillText(b.action, ac2X + cellW / 2, cellY + 33);
    ctx.shadowBlur  = 0;

    // Market read
    const mrY = cellY + cellH + 18;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    ctx.fillRect(16, mrY, rowW, 36);
    ctx.strokeRect(16, mrY, rowW, 36);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = 'bold 8px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('MARKET READ', 28, mrY + 13);
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText(b.market, 28, mrY + 28);

    // Operator action
    const opY = mrY + 44;
    ctx.fillStyle = b.color + '08';
    ctx.strokeStyle = b.color + '30';
    ctx.fillRect(16, opY, rowW, 44);
    ctx.strokeRect(16, opY, rowW, 44);
    ctx.fillStyle = b.color + 'cc';
    ctx.font = 'bold 8px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('OPERATOR ACTION', 28, opY + 13);
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = '11px Inter, sans-serif';
    // Word-wrap
    const words = b.operator.split(' ');
    let line = '';
    let lineY = opY + 27;
    const maxW = rowW - 24;
    words.forEach((word, wi) => {
      const test = line + (line ? ' ' : '') + word;
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, 28, lineY);
        line = word; lineY += 14;
      } else { line = test; }
      if (wi === words.length - 1) ctx.fillText(line, 28, lineY);
    });

    // Scene dots
    const dotsY = h - 20;
    const dSpacing = 20;
    const dStart = w / 2 - (briefs.length - 1) * dSpacing / 2;
    briefs.forEach((br, i) => {
      ctx.fillStyle = i === sceneIdx ? br.color : br.color + '44';
      ctx.beginPath();
      ctx.arc(dStart + i * dSpacing, dotsY, i === sceneIdx ? 5 : 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 5 — RegimeGatingAnim (S05)
// Three regime panels: which states CAN and CANNOT fire in each
// ============================================================
function RegimeGatingAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A'; const AMBER = '#FFB300'; const MAGENTA = '#EF5350';
    const padX = 14; const padTop = 30; const gap = 10;
    const panelW = (w - padX * 2 - gap * 2) / 3;
    const panelH = h - padTop - 14;
    ctx.fillStyle = 'rgba(255,179,0,0.65)'; ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('REGIME GATING \u2014 some header states only fire in specific regimes', w / 2, 16);
    const panels = [
      { regime: 'TREND', color: TEAL,
        can:    ['\u2192 RIDE IT', '\u2192 TREND AGING', '\u2192 TREND CURVING', '\u2192 TREND HOLLOWING', '\u2192 BUILDING'],
        cannot: ['\u2192 REDUCE SIZE', '\u2192 COILING'],
        note:   'RIDE IT, AGING, CURVING, HOLLOWING, BUILDING all require regime == "TREND"' },
      { regime: 'RANGE', color: AMBER,
        can:    ['\u2192 SNAP ZONE', '\u2192 FADING', '\u2192 COILING', '\u2192 ENTRY ZONE', '\u2192 EXIT SOON'],
        cannot: ['\u2192 RIDE IT', '\u2192 TREND AGING', '\u2192 REDUCE SIZE'],
        note:   'COILING requires regime == "RANGE" + vol_ratio_atr < 0.8 ' },
      { regime: 'VOLATILE', color: MAGENTA,
        can:    ['\u2192 REDUCE SIZE', '\u2192 SNAP ZONE', '\u2192 FADING'],
        cannot: ['\u2192 RIDE IT', '\u2192 TREND AGING', '\u2192 COILING', '\u2192 BUILDING'],
        note:   'REDUCE SIZE fires ONLY in VOLATILE \u2014 priority 14, regime-exclusive' },
    ];
    const hi = Math.floor(t / 4) % 3;
    panels.forEach((panel, pi) => {
      const px = padX + pi * (panelW + gap);
      const isHi = pi === hi;
      ctx.fillStyle = isHi ? panel.color + '0f' : 'rgba(0,0,0,0.28)';
      ctx.strokeStyle = isHi ? panel.color + '66' : 'rgba(255,255,255,0.06)';
      ctx.lineWidth = isHi ? 1.5 : 1;
      ctx.fillRect(px, padTop, panelW, panelH);
      ctx.strokeRect(px, padTop, panelW, panelH);
      ctx.fillStyle = panel.color + '22'; ctx.fillRect(px, padTop, panelW, 20);
      ctx.fillStyle = panel.color; ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center'; ctx.fillText(panel.regime, px + panelW / 2, padTop + 13);
      ctx.fillStyle = 'rgba(38,166,154,0.7)'; ctx.font = 'bold 8px Inter, sans-serif';
      ctx.textAlign = 'left'; ctx.fillText('CAN FIRE:', px + 8, padTop + 32);
      panel.can.forEach((st, i) => {
        ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = '9px "SF Mono", monospace';
        ctx.fillText(st, px + 8, padTop + 44 + i * 14);
      });
      const cannotY = padTop + 44 + panel.can.length * 14 + 8;
      ctx.fillStyle = 'rgba(239,83,80,0.7)'; ctx.font = 'bold 8px Inter, sans-serif';
      ctx.fillText('REGIME-BLOCKED:', px + 8, cannotY);
      panel.cannot.forEach((st, i) => {
        ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.font = '9px "SF Mono", monospace';
        ctx.fillText(st, px + 8, cannotY + 12 + i * 14);
        const tw = ctx.measureText(st).width;
        ctx.strokeStyle = 'rgba(239,83,80,0.5)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(px + 8, cannotY + 8 + i * 14);
        ctx.lineTo(px + 8 + tw, cannotY + 8 + i * 14); ctx.stroke();
      });
      if (isHi) {
        const noteY = padTop + panelH - 28;
        ctx.fillStyle = panel.color + '0c'; ctx.fillRect(px + 4, noteY, panelW - 8, 24);
        ctx.fillStyle = panel.color + 'aa'; ctx.font = '7px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(panel.note.substring(0, 48), px + panelW / 2, noteY + 10);
        if (panel.note.length > 48) ctx.fillText(panel.note.substring(48), px + panelW / 2, noteY + 20);
      }
    });
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 6 — CascadeDepthAnim (S06)
// Animated waterfall: conditions light up top-to-bottom, first true stops cascade
// 3 scenarios stopping at different priorities
// ============================================================
function CascadeDepthAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A'; const AMBER = '#FFB300';
    const RED = '#FF1744'; const MAGENTA = '#EF5350'; const CYAN = '#00BCD4';
    const cycleT = t % 21; const sceneIdx = Math.min(2, Math.floor(cycleT / 7));
    const sceneT = (cycleT % 7) / 7;
    const allStates = [
      { p: 1,  label: 'BREAKOUT \u25b2/\u25bc', color: TEAL    },
      { p: 2,  label: 'BREAKOUT LOADING',        color: AMBER   },
      { p: 3,  label: 'DOUBLE COIL',              color: MAGENTA },
      { p: 4,  label: 'TREND HOLLOWING',          color: AMBER   },
      { p: 5,  label: 'TREND CURVING',            color: AMBER   },
      { p: 6,  label: 'TREND AGING',              color: AMBER   },
      { p: 7,  label: 'RIBBON COILED',            color: AMBER   },
      { p: 8,  label: 'RIDE IT',                  color: TEAL    },
      { p: 9,  label: 'SNAP ZONE',                color: AMBER   },
      { p: 10, label: 'FADING',                   color: RED     },
      { p: 11, label: 'BUILDING',                 color: CYAN    },
      { p: 12, label: 'COILING',                  color: AMBER   },
      { p: 13, label: 'REDUCE SIZE',              color: MAGENTA },
      { p: 14, label: 'ENTRY ZONE',               color: TEAL    },
      { p: 15, label: 'EXIT SOON',                color: RED     },
      { p: 16, label: 'REVERSAL NEAR',            color: RED     },
      { p: 17, label: 'SNAP LIKELY',              color: AMBER   },
      { p: 18, label: 'WAIT',                     color: 'rgba(255,255,255,0.35)' },
    ];
    const stopAt = [8, 9, 18];
    const stopLabels = ['RIDE IT (priority 8)', 'SNAP ZONE (priority 9)', 'WAIT \u2014 all conditions false'];
    const stop = stopAt[sceneIdx];
    const flowProgress = Math.min(1, sceneT * 1.8);
    const statesReached = Math.floor(flowProgress * allStates.length);
    ctx.fillStyle = 'rgba(255,179,0,0.65)'; ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('SCENARIO ' + (sceneIdx + 1) + ' \u2014 stops at: ' + stopLabels[sceneIdx], 16, 14);
    ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.textAlign = 'right';
    ctx.fillText((sceneIdx + 1) + ' / 3', w - 16, 14);
    const startY = 22; const itemH = (h - startY - 14) / allStates.length;
    const barMaxW = w * 0.5; const labelW = w * 0.3;
    allStates.forEach((state, idx) => {
      const iy = startY + idx * itemH;
      const reached = idx < statesReached;
      const isStop = state.p === stop && reached;
      const isPast = state.p < stop && reached;
      const isBelow = state.p > stop;
      if (isStop) { ctx.fillStyle = state.color + '18'; ctx.fillRect(0, iy, w, itemH); }
      ctx.fillStyle = reached && !isBelow ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)';
      ctx.font = '9px "SF Mono", monospace'; ctx.textAlign = 'right';
      ctx.fillText(String(state.p), 26, iy + itemH * 0.72);
      ctx.fillStyle = isStop ? state.color : isPast ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)';
      ctx.font = isStop ? 'bold 10px "SF Mono", monospace' : '9px "SF Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('\u2192 ' + state.label, 32, iy + itemH * 0.72);
      if (reached && !isBelow) {
        ctx.fillStyle = isStop ? state.color : state.color + '30';
        ctx.fillRect(labelW + 16, iy + itemH * 0.18, isStop ? barMaxW : barMaxW * 0.35, itemH * 0.6);
      }
      if (isStop && sceneT > 0.5) {
        ctx.shadowBlur = 12; ctx.shadowColor = state.color;
        ctx.strokeStyle = state.color; ctx.lineWidth = 2;
        ctx.strokeRect(0, iy, w, itemH); ctx.shadowBlur = 0;
        ctx.fillStyle = state.color; ctx.font = 'bold 9px Inter, sans-serif';
        ctx.textAlign = 'right'; ctx.fillText('\u25c4 FIRES', w - 10, iy + itemH * 0.72);
      }
      if (isPast) {
        ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(32, iy + itemH * 0.6); ctx.lineTo(labelW, iy + itemH * 0.6); ctx.stroke();
      }
    });
  }, []);
  return <AnimScene draw={draw} aspectRatio={3 / 4} />;
}

// ============================================================
// ANIMATION 7 — RideItDeepDiveAnim (S07)
// RIDE IT: 3 conditions that must ALL be true simultaneously
// Animated gauges per scenario: all true / spread false / health false
// ============================================================
function RideItDeepDiveAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A'; const MAGENTA = '#EF5350';
    const cycleT = t % 15; const sceneIdx = Math.min(2, Math.floor(cycleT / 5));
    const sceneT = (cycleT % 5) / 5;
    const eased = 1 - Math.pow(1 - Math.min(1, sceneT * 1.6), 3);
    const scenarios = [
      { label: 'ALL THREE TRUE \u2014 RIDE IT fires', regimeTrue: true, spreadVal: 0.82, spreadTrue: true, healthVal: 68, healthTrue: true, fires: true },
      { label: 'SPREAD NOT EXPANDING \u2014 blocked', regimeTrue: true, spreadVal: 0.28, spreadTrue: false, healthVal: 72, healthTrue: true, fires: false },
      { label: 'HEALTH BELOW 50 \u2014 blocked',      regimeTrue: true, spreadVal: 0.76, spreadTrue: true, healthVal: 31, healthTrue: false, fires: false },
    ];
    const sc = scenarios[sceneIdx];
    ctx.fillStyle = 'rgba(255,179,0,0.65)'; ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'left'; ctx.fillText(sc.label, 16, 14);
    const conditions = [
      { label: 'regime == "TREND"', val: sc.regimeTrue ? 1 : 0, isTrue: sc.regimeTrue, display: 'TREND' },
      { label: 'spread_expanding',  val: sc.spreadVal,           isTrue: sc.spreadTrue, display: Math.round(sc.spreadVal * 100) + '% spread' },
      { label: 'health_smooth > 50', val: sc.healthVal / 100,   isTrue: sc.healthTrue, display: Math.round(sc.healthVal) + '%' },
    ];
    const gaugeY = 24; const gaugeH = (h - gaugeY - 60) / 3; const gaugeGap = 8;
    conditions.forEach((cond, i) => {
      const gy = gaugeY + i * (gaugeH + gaugeGap);
      const color = cond.isTrue ? TEAL : MAGENTA;
      ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1; ctx.fillRect(16, gy, w - 32, gaugeH); ctx.strokeRect(16, gy, w - 32, gaugeH);
      ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'left'; ctx.fillText(cond.label, 26, gy + 14);
      const barX = 26; const barY2 = gy + 20; const barW2 = w - 68; const barH2 = gaugeH - 28;
      ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.fillRect(barX, barY2, barW2, barH2);
      ctx.fillStyle = color + (cond.isTrue ? 'cc' : '88');
      ctx.fillRect(barX, barY2, barW2 * cond.val * eased, barH2);
      ctx.fillStyle = color; ctx.font = 'bold 16px "SF Mono", monospace';
      ctx.textAlign = 'right'; ctx.fillText(cond.display, w - 28, gy + gaugeH - 10);
      const badgeW = 44; const badgeH = 16;
      const badgeX = w - 32 - badgeW; const badgeYy = gy + 10;
      ctx.fillStyle = cond.isTrue ? 'rgba(38,166,154,0.2)' : 'rgba(239,83,80,0.2)';
      ctx.strokeStyle = cond.isTrue ? TEAL + '66' : MAGENTA + '66';
      ctx.fillRect(badgeX, badgeYy, badgeW, badgeH); ctx.strokeRect(badgeX, badgeYy, badgeW, badgeH);
      ctx.fillStyle = cond.isTrue ? TEAL : MAGENTA; ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center'; ctx.fillText(cond.isTrue ? 'TRUE' : 'FALSE', badgeX + badgeW / 2, badgeYy + 11);
    });
    const resY = h - 44;
    ctx.fillStyle = sc.fires ? 'rgba(38,166,154,0.1)' : 'rgba(255,179,0,0.05)';
    ctx.strokeStyle = sc.fires ? TEAL + '44' : 'rgba(255,255,255,0.07)';
    ctx.lineWidth = sc.fires ? 1.5 : 1;
    ctx.fillRect(16, resY, w - 32, 36); ctx.strokeRect(16, resY, w - 32, 36);
    if (sc.fires) { ctx.shadowBlur = 10; ctx.shadowColor = TEAL; }
    ctx.fillStyle = sc.fires ? TEAL : 'rgba(255,255,255,0.35)';
    ctx.font = 'bold 12px "SF Mono", monospace'; ctx.textAlign = 'center';
    ctx.fillText(sc.fires ? '\u2192 RIDE IT \u2014 priority 9 fires' : '\u2192 RIDE IT blocked \u2014 cascade continues past priority 9', w / 2, resY + 22);
    ctx.shadowBlur = 0;
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 8 — ConflictResolutionAnim (S08)
// 3 real conflict examples: rows show opposing signals, header resolves
// ============================================================
function ConflictResolutionAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A'; const AMBER = '#FFB300'; const RED = '#FF1744'; const MAGENTA = '#EF5350';
    const cycleT = t % 18; const sceneIdx = Math.min(2, Math.floor(cycleT / 6));
    const sceneT = (cycleT % 6) / 6;
    const conflicts = [
      { label: 'CONFLICT 1 \u00b7 Tension (warn) vs Momentum (bull)',
        row1: { label: 'Tension',  state: '\u25b2 STRETCHED', sc: MAGENTA, action: '\u2192 SNAP LIKELY',    ac: AMBER },
        row2: { label: 'Momentum', state: '\u25b2 SURGING 77%', sc: TEAL, action: '\u2192 HOLD POSITION',  ac: TEAL  },
        hState: '\u21d4 RANGING', hSC: AMBER, hAction: '\u2192 SNAP ZONE', hAC: AMBER,
        winner: 'Tension priority 10 beats Momentum priority 15+', winnerColor: AMBER },
      { label: 'CONFLICT 2 \u00b7 Health failing vs Momentum strong',
        row1: { label: 'Ribbon',   state: '\u25bc BEAR',  sc: MAGENTA, action: '\u2192 CURVING',       ac: AMBER },
        row2: { label: 'Momentum', state: '\u25b2 STRONG 62%', sc: TEAL, action: '\u2192 TIGHTEN STOPS', ac: AMBER },
        hState: '\u21d4 RANGING', hSC: AMBER, hAction: '\u2192 FADING', hAC: RED,
        winner: 'FADING (health, priority 11) beats TIGHTEN STOPS (momentum, priority 17)', winnerColor: RED },
      { label: 'CONFLICT 3 \u00b7 CURVING (p6) vs AGING (p7) both true',
        row1: { label: 'Ribbon',  state: '\u25b2 BULL',  sc: TEAL,  action: '\u2192 CURVING',            ac: AMBER },
        row2: { label: 'Regime',  state: 'TREND',      sc: TEAL,  action: '\u2192 RANGE FORMING',        ac: AMBER },
        hState: '\u25b2 BULL TREND', hSC: TEAL, hAction: '\u2192 TREND CURVING', hAC: AMBER,
        winner: 'TREND CURVING (priority 6) blocks TREND AGING (priority 7)', winnerColor: AMBER },
    ];
    const cf = conflicts[sceneIdx];
    ctx.fillStyle = 'rgba(255,179,0,0.65)'; ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'left'; ctx.fillText(cf.label, 16, 14);
    ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.textAlign = 'right';
    ctx.fillText((sceneIdx + 1) + ' / 3', w - 16, 14);
    const rowH = 28; const rowW = w - 32;
    [cf.row1, cf.row2].forEach((row, ri) => {
      const ry = 22 + ri * (rowH + 3);
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
      ctx.fillRect(16, ry, rowW, rowH); ctx.strokeRect(16, ry, rowW, rowH);
      ctx.fillStyle = 'rgba(255,255,255,0.38)'; ctx.font = '10px "SF Mono", monospace';
      ctx.textAlign = 'left'; ctx.fillText(row.label, 28, ry + rowH / 2 + 4);
      ctx.fillStyle = row.sc; ctx.font = 'bold 10px "SF Mono", monospace';
      ctx.textAlign = 'center'; ctx.fillText(row.state, 16 + rowW * 0.52, ry + rowH / 2 + 4);
      ctx.fillStyle = row.ac; ctx.font = '10px "SF Mono", monospace';
      ctx.textAlign = 'right'; ctx.fillText(row.action, 16 + rowW - 10, ry + rowH / 2 + 4);
    });
    const vsY = 22 + 2 * (rowH + 3) + 4;
    if (sceneT > 0.2) {
      ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center'; ctx.fillText('\u2195 CONFLICT \u2014 cascade resolves \u25bc', w / 2, vsY + 14);
    }
    if (sceneT > 0.5) {
      const hdrY = vsY + 28;
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.strokeStyle = cf.hAC + '55'; ctx.lineWidth = 1.5;
      ctx.fillRect(16, hdrY, rowW, rowH + 4); ctx.strokeRect(16, hdrY, rowW, rowH + 4);
      ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.font = 'bold 10px "SF Mono", monospace';
      ctx.textAlign = 'left'; ctx.fillText('CIPHER PRO  \u24d8', 28, hdrY + (rowH + 4) / 2 + 4);
      ctx.fillStyle = cf.hSC; ctx.font = 'bold 10px "SF Mono", monospace';
      ctx.textAlign = 'center'; ctx.fillText(cf.hState, 16 + rowW * 0.52, hdrY + (rowH + 4) / 2 + 4);
      if (cf.hAC === RED) { ctx.shadowBlur = 10; ctx.shadowColor = RED; }
      ctx.fillStyle = cf.hAC; ctx.font = 'bold 12px "SF Mono", monospace';
      ctx.textAlign = 'right'; ctx.fillText(cf.hAction, 16 + rowW - 10, hdrY + (rowH + 4) / 2 + 4);
      ctx.shadowBlur = 0;
    }
    if (sceneT > 0.72) {
      const expY = vsY + 70;
      ctx.fillStyle = cf.winnerColor + '08'; ctx.strokeStyle = cf.winnerColor + '2a'; ctx.lineWidth = 1;
      ctx.fillRect(16, expY, rowW, 26); ctx.strokeRect(16, expY, rowW, 26);
      ctx.fillStyle = cf.winnerColor + 'cc'; ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center'; ctx.fillText(cf.winner, w / 2, expY + 17);
    }
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 9 — HeaderReadOrderAnim (S09)
// 4-step operator read discipline: color → text → state → rows
// Animated highlight sweeping through each element
// ============================================================
function HeaderReadOrderAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A'; const AMBER = '#FFB300'; const MAGENTA = '#EF5350';
    const cycleT = t % 12; const stepIdx = Math.min(3, Math.floor(cycleT / 3));
    const steps = [
      { label: 'STEP 1 \u00b7 ACTION COLOR',  desc: 'Teal = go. Amber = prepare. Red = danger. Magenta = volatile. Identify urgency before reading a word.', hi: 'color'  },
      { label: 'STEP 2 \u00b7 ACTION TEXT',   desc: 'What is the specific condition? RIDE IT / TREND AGING / SNAP ZONE / FADING / REDUCE SIZE...', hi: 'action' },
      { label: 'STEP 3 \u00b7 STATE CELL',    desc: 'Market character: \u25b2 BULL TREND / \u21d4 RANGING / \u26a1 VOLATILE / \u25bc BEAR TREND', hi: 'state'  },
      { label: 'STEP 4 \u00b7 EVIDENCE ROWS', desc: 'Nuance for stop distance and sizing. Never to override the header verdict. The rows are evidence, not votes.', hi: 'rows'   },
    ];
    const step = steps[stepIdx];
    ctx.fillStyle = 'rgba(255,179,0,0.65)'; ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'left'; ctx.fillText(step.label, 16, 14);
    ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.textAlign = 'right';
    ctx.fillText('step ' + (stepIdx + 1) + ' / 4', w - 16, 14);
    const rowH = 28; const rowW = w - 32;
    // Header row
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(16, 22, rowW, rowH);
    ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 1; ctx.strokeRect(16, 22, rowW, rowH);
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 11px "SF Mono", monospace';
    ctx.textAlign = 'left'; ctx.fillText('CIPHER PRO  \u24d8', 28, 22 + rowH / 2 + 4);
    if (step.hi === 'state' || step.hi === 'color') {
      ctx.fillStyle = TEAL + '15'; ctx.fillRect(16 + rowW * 0.32, 22, rowW * 0.35, rowH);
    }
    ctx.fillStyle = TEAL; ctx.font = 'bold 11px "SF Mono", monospace';
    ctx.textAlign = 'center'; ctx.fillText('\u25b2 BULL TREND', 16 + rowW * 0.52, 22 + rowH / 2 + 4);
    if (step.hi === 'action' || step.hi === 'color') {
      ctx.fillStyle = AMBER + '15'; ctx.fillRect(16 + rowW * 0.67, 22, rowW * 0.33, rowH);
      if (step.hi === 'color') { ctx.shadowBlur = 10; ctx.shadowColor = AMBER; }
    }
    ctx.fillStyle = AMBER; ctx.font = 'bold 12px "SF Mono", monospace';
    ctx.textAlign = 'right'; ctx.fillText('\u2192 TREND AGING', 16 + rowW - 10, 22 + rowH / 2 + 4);
    ctx.shadowBlur = 0;
    const evidenceRows = [
      { label: 'Ribbon',   state: '\u25b2 BULL',      sc: TEAL,    action: '\u2192 EXTENDED 50b (avg 30)', ac: AMBER   },
      { label: 'Momentum', state: '\u25bc FADING 56%', sc: AMBER,   action: '\u2192 REDUCE SIZE',          ac: MAGENTA },
      { label: 'Regime',   state: 'TREND',             sc: TEAL,    action: '\u2192 RANGE FORMING',        ac: AMBER   },
    ];
    const rowsHi = step.hi === 'rows';
    evidenceRows.forEach((row, ri) => {
      const ry = 22 + (rowH + 2) * (ri + 1) + 4;
      ctx.fillStyle = rowsHi ? 'rgba(0,0,0,0.32)' : 'rgba(0,0,0,0.18)';
      ctx.fillRect(16, ry, rowW, rowH);
      ctx.strokeStyle = rowsHi ? 'rgba(255,179,0,0.15)' : 'rgba(255,255,255,0.03)';
      ctx.strokeRect(16, ry, rowW, rowH);
      ctx.globalAlpha = rowsHi ? 1 : 0.32;
      ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '10px "SF Mono", monospace';
      ctx.textAlign = 'left'; ctx.fillText(row.label, 28, ry + rowH / 2 + 4);
      ctx.fillStyle = row.sc; ctx.font = 'bold 10px "SF Mono", monospace';
      ctx.textAlign = 'center'; ctx.fillText(row.state, 16 + rowW * 0.52, ry + rowH / 2 + 4);
      ctx.fillStyle = row.ac; ctx.font = '10px "SF Mono", monospace';
      ctx.textAlign = 'right'; ctx.fillText(row.action, 16 + rowW - 10, ry + rowH / 2 + 4);
      ctx.globalAlpha = 1;
    });
    const descY = 22 + (rowH + 2) * 4 + 16;
    ctx.fillStyle = 'rgba(255,179,0,0.06)'; ctx.strokeStyle = 'rgba(255,179,0,0.2)'; ctx.lineWidth = 1;
    ctx.fillRect(16, descY, rowW, 42); ctx.strokeRect(16, descY, rowW, 42);
    ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'center';
    const words = step.desc.split(' '); let line = ''; let lineY2 = descY + 14; const maxW2 = rowW - 24;
    words.forEach((wd, wi) => {
      const test = line + (line ? ' ' : '') + wd;
      if (ctx.measureText(test).width > maxW2 && line) { ctx.fillText(line, w / 2, lineY2); line = wd; lineY2 += 14; }
      else line = test;
      if (wi === words.length - 1) ctx.fillText(line, w / 2, lineY2);
    });
    const dotY2 = h - 16;
    [0, 1, 2, 3].forEach(i => {
      ctx.fillStyle = i === stepIdx ? AMBER : 'rgba(255,179,0,0.3)';
      ctx.beginPath(); ctx.arc(w / 2 + (i - 1.5) * 20, dotY2, i === stepIdx ? 5 : 3, 0, Math.PI * 2); ctx.fill();
    });
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}
// ============================================================
// ANIMATION 10 — HollowingVsCurvingAnim (S10)
// TREND HOLLOWING (p4) vs TREND CURVING (p5) — both amber, different causes
// ============================================================
function HollowingVsCurvingAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A'; const AMBER = '#FFB300'; const MAGENTA = '#EF5350';
    const padX = 14; const padTop = 30; const gap = 14;
    const panelW = (w - padX * 2 - gap) / 2; const panelH = h - padTop - 14;
    ctx.fillStyle = 'rgba(255,179,0,0.65)'; ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BOTH AMBER — very different warnings underneath', w / 2, 16);
    const panels = [
      { state: '→ TREND HOLLOWING', priority: 4, condition: 'rd_active + regime == "TREND"',
        what: 'Ribbon DIVERGENCE: price new high/low but ribbon internal spread weakening. Trend deteriorating from inside before candles show it.',
        action: 'Earliest warning of trend failure. Tighten stops. No new longs.', urgency: 'HIGHEST amber — priority 4' },
      { state: '→ TREND CURVING', priority: 6, condition: 'proj_converging + regime == "TREND"',
        what: 'Ribbon projection bending back toward Flow line. Trajectory losing upward angle. Not yet deteriorating — just slowing.',
        action: 'Prepare for regime aging. Can still ride with tighter stops.', urgency: 'MID amber — priority 6' },
    ];
    panels.forEach((panel, pi) => {
      const px = padX + pi * (panelW + gap);
      const isHi = Math.floor(t / 5) % 2 === pi;
      ctx.fillStyle = isHi ? 'rgba(255,179,0,0.07)' : 'rgba(0,0,0,0.28)';
      ctx.strokeStyle = isHi ? AMBER + '55' : 'rgba(255,255,255,0.06)';
      ctx.lineWidth = isHi ? 1.5 : 1;
      ctx.fillRect(px, padTop, panelW, panelH); ctx.strokeRect(px, padTop, panelW, panelH);
      ctx.fillStyle = AMBER + '22'; ctx.fillRect(px, padTop, panelW, 22);
      ctx.fillStyle = AMBER; ctx.font = 'bold 10px "SF Mono", monospace';
      ctx.textAlign = 'center'; ctx.fillText(panel.state, px + panelW / 2, padTop + 15);
      ctx.fillStyle = AMBER + '18'; ctx.fillRect(px + panelW - 58, padTop + 26, 52, 16);
      ctx.fillStyle = AMBER + 'aa'; ctx.font = 'bold 8px Inter, sans-serif';
      ctx.fillText('priority ' + panel.priority, px + panelW - 32, padTop + 37);
      const items = [
        { lbl: 'CONDITION:', val: panel.condition, color: AMBER + 'cc', font: '8px "SF Mono", monospace' },
        { lbl: 'WHAT IT MEANS:', val: panel.what, color: 'rgba(255,255,255,0.65)', font: '8px Inter, sans-serif' },
        { lbl: 'OPERATOR:', val: panel.action, color: pi === 0 ? MAGENTA + 'cc' : AMBER + 'cc', font: '8px Inter, sans-serif' },
        { lbl: 'URGENCY:', val: panel.urgency, color: pi === 0 ? MAGENTA + 'cc' : AMBER + 'aa', font: '8px Inter, sans-serif' },
      ];
      let iy = padTop + 52;
      items.forEach(item => {
        ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = 'bold 8px Inter, sans-serif';
        ctx.textAlign = 'left'; ctx.fillText(item.lbl, px + 8, iy);
        iy += 12;
        ctx.fillStyle = item.color; ctx.font = item.font;
        const words = item.val.split(' '); let line = '';
        words.forEach((wd, wi) => {
          const test = line + (line ? ' ' : '') + wd;
          if (ctx.measureText(test).width > panelW - 16 && line) { ctx.fillText(line, px + 8, iy); line = wd; iy += 11; }
          else line = test;
          if (wi === words.length - 1) { ctx.fillText(line, px + 8, iy); iy += 13; }
        });
      });
    });
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 11 — FadingVsReduceSizeAnim (S11)
// Bright red FADING vs Magenta REDUCE SIZE — the two danger colors
// ============================================================
function FadingVsReduceSizeAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const AMBER = '#FFB300'; const RED = '#FF1744'; const MAGENTA = '#EF5350';
    const padX = 14; const padTop = 30; const gap = 14;
    const panelW = (w - padX * 2 - gap) / 2; const panelH = h - padTop - 14;
    ctx.fillStyle = 'rgba(255,179,0,0.65)'; ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TWO DANGER COLORS — two different crises, two different playbooks', w / 2, 16);
    const panels = [
      { state: '→ FADING', color: RED, colorLabel: 'BRIGHT RED #FF1744',
        regime: 'Any regime', condition: 'spread_contracting OR health_critical',
        what: 'Ribbon health failing or spread contracting. Trend engine losing power regardless of candle appearance.',
        playbook: 'Stop new entries. Protect or close existing. Wait for recovery.' },
      { state: '→ REDUCE SIZE', color: MAGENTA, colorLabel: 'MAGENTA #EF5350',
        regime: 'VOLATILE only', condition: 'regime == "VOLATILE"',
        what: 'ATR spike > 1.5x ATR_slow. Market dislocating from own normal range. Large adverse move risk.',
        playbook: 'Reduce size 50-100%. Do not fade spike. Wait for VOLATILE to resolve.' },
    ];
    panels.forEach((panel, pi) => {
      const px = padX + pi * (panelW + gap);
      ctx.fillStyle = panel.color + '08'; ctx.strokeStyle = panel.color + '44'; ctx.lineWidth = 1.5;
      ctx.fillRect(px, padTop, panelW, panelH); ctx.strokeRect(px, padTop, panelW, panelH);
      ctx.fillStyle = panel.color + '25'; ctx.fillRect(px, padTop, panelW, 22);
      if (pi === 0) { ctx.shadowBlur = 8; ctx.shadowColor = RED; }
      ctx.fillStyle = panel.color; ctx.font = 'bold 10px "SF Mono", monospace';
      ctx.textAlign = 'center'; ctx.fillText(panel.state, px + panelW / 2, padTop + 15);
      ctx.shadowBlur = 0;
      ctx.fillStyle = panel.color + '22'; ctx.fillRect(px + 6, padTop + 26, panelW - 12, 18);
      ctx.fillStyle = panel.color; ctx.font = 'bold 8px Inter, sans-serif';
      ctx.fillText(panel.colorLabel, px + panelW / 2, padTop + 38);
      const items = [
        { lbl: 'REGIME:', val: panel.regime },
        { lbl: 'CONDITION:', val: panel.condition },
        { lbl: 'WHAT IT MEANS:', val: panel.what },
        { lbl: 'PLAYBOOK:', val: panel.playbook },
      ];
      let iy = padTop + 52;
      items.forEach(item => {
        ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = 'bold 8px Inter, sans-serif';
        ctx.textAlign = 'left'; ctx.fillText(item.lbl, px + 8, iy); iy += 12;
        ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.font = '8px Inter, sans-serif';
        const words = item.val.split(' '); let line = '';
        words.forEach((wd, wi) => {
          const test = line + (line ? ' ' : '') + wd;
          if (ctx.measureText(test).width > panelW - 16 && line) { ctx.fillText(line, px + 8, iy); line = wd; iy += 11; }
          else line = test;
          if (wi === words.length - 1) { ctx.fillText(line, px + 8, iy); iy += 13; }
        });
      });
    });
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 12 — RealChartContextAnim (S12)
// Full CC replay: 5 real screenshot states cycling
// ============================================================
function RealChartContextAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A'; const AMBER = '#FFB300'; const RED = '#FF1744'; const MAGENTA = '#EF5350';
    const cycleT = t % 25; const sceneIdx = Math.min(4, Math.floor(cycleT / 5));
    const scenes = [
      { label: 'BTCUSDT 5m — RIDE IT (teal)',
        hState: '▲ BULL TREND', hSC: TEAL, hAction: '→ RIDE IT', hAC: TEAL,
        rows: [
          { label: 'Ribbon', state: '▲ BULL', sc: TEAL, action: 'PRIME  13b (avg 26)', ac: TEAL },
          { label: 'Momentum', state: '▲ BUILDING  70%▼', sc: TEAL, action: '→ ENTRY ZONE DETACHED', ac: TEAL },
          { label: 'Regime', state: 'TREND', sc: TEAL, action: '→ TREND INTACT', ac: TEAL },
        ] },
      { label: 'BTCUSDT 5m — TREND CURVING (amber)',
        hState: '▲ BULL TREND', hSC: TEAL, hAction: '→ TREND CURVING', hAC: AMBER,
        rows: [
          { label: 'Ribbon', state: '▲ BULL', sc: TEAL, action: '→ CURVING', ac: AMBER },
          { label: 'Momentum', state: '▼ FADING  57%▼', sc: AMBER, action: '→ REDUCE SIZE', ac: MAGENTA },
          { label: 'Regime', state: 'TREND', sc: TEAL, action: '→ SHIFTING TO RANGE', ac: AMBER },
        ] },
      { label: 'BTCUSDT 5m — TREND AGING (amber)',
        hState: '▲ BULL TREND', hSC: TEAL, hAction: '→ TREND AGING', hAC: AMBER,
        rows: [
          { label: 'Ribbon', state: '▲ BULL', sc: TEAL, action: '→ EXTENDED  50b (avg 30)', ac: AMBER },
          { label: 'Momentum', state: '▼ FADING  56%▼', sc: AMBER, action: '→ REDUCE SIZE', ac: MAGENTA },
          { label: 'Regime', state: 'TREND', sc: TEAL, action: '→ RANGE FORMING', ac: AMBER },
        ] },
      { label: 'BTCUSDT 5m — SNAP ZONE (amber, RANGING)',
        hState: '⇔ RANGING', hSC: AMBER, hAction: '→ SNAP ZONE', hAC: AMBER,
        rows: [
          { label: 'Tension', state: '▲ STRETCHED', sc: MAGENTA, action: '→ SNAP LIKELY', ac: AMBER },
          { label: 'Momentum', state: '▲ SURGING  77%▲', sc: TEAL, action: '→ HOLD POSITION', ac: TEAL },
          { label: 'Regime', state: 'RANGE', sc: AMBER, action: '→ RANGE HOLDING', ac: AMBER },
        ] },
      { label: 'BTCUSDT 5m — FADING (red, RANGING)',
        hState: '⇔ RANGING', hSC: AMBER, hAction: '→ FADING', hAC: RED,
        rows: [
          { label: 'Ribbon', state: '▼ BEAR', sc: MAGENTA, action: '→ CURVING', ac: AMBER },
          { label: 'Momentum', state: '▲ STRONG  62%−', sc: TEAL, action: '→ TIGHTEN STOPS', ac: AMBER },
          { label: 'Regime', state: 'RANGE', sc: AMBER, action: '→ SHIFTING TO TREND', ac: AMBER },
        ] },
    ];
    const sc = scenes[sceneIdx];
    ctx.fillStyle = 'rgba(255,179,0,0.6)'; ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'left'; ctx.fillText(sc.label, 16, 14);
    ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.textAlign = 'right';
    ctx.fillText((sceneIdx + 1) + ' / 5', w - 16, 14);
    drawCCRows(ctx, w, 22, sc.hState, sc.hSC, sc.hAction, sc.hAC, sc.rows, true);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 13 — WaitStateAnim (S13)
// The WAIT fallback: dim white, all conditions false, what it implies
// ============================================================
function WaitStateAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const AMBER = '#FFB300';
    const pulse = Math.sin(t * 0.8) * 0.15 + 0.85;
    ctx.fillStyle = 'rgba(255,179,0,0.65)'; ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('WAIT — all 17 named conditions false on this bar', w / 2, 16);
    const rowH = 30; const rowW = w - 32;
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(16, 24, rowW, rowH);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1; ctx.strokeRect(16, 24, rowW, rowH);
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 11px "SF Mono", monospace';
    ctx.textAlign = 'left'; ctx.fillText('CIPHER PRO  ⓘ', 28, 24 + rowH / 2 + 4);
    ctx.fillStyle = AMBER; ctx.font = 'bold 11px "SF Mono", monospace';
    ctx.textAlign = 'center'; ctx.fillText('⇔ RANGING', 16 + rowW * 0.52, 24 + rowH / 2 + 4);
    ctx.fillStyle = 'rgba(255,255,255,' + (pulse * 0.35).toFixed(2) + ')';
    ctx.font = 'bold 12px "SF Mono", monospace'; ctx.textAlign = 'right';
    ctx.fillText('→ WAIT', 16 + rowW - 10, 24 + rowH / 2 + 4);
    const listY = 66; const abbreviated = [
      'squeeze_fire', 'squeeze BREAKOUT READY', 'rs_double_coil', 'rd_active + TREND',
      'proj_converging + TREND', 'stack_aging + TREND', 'rs_confirmed',
      'spread_expanding + health > 50', 'tension > ts_min + 8 more…',
    ];
    const itemH2 = (h - listY - 60) / abbreviated.length;
    ctx.fillStyle = 'rgba(255,179,0,0.4)'; ctx.font = 'bold 8px Inter, sans-serif';
    ctx.textAlign = 'left'; ctx.fillText('↓ ALL CONDITIONS EVALUATED — ALL FALSE:', 16, listY - 4);
    abbreviated.forEach((cond, i) => {
      const iy = listY + i * itemH2;
      ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.font = '9px "SF Mono", monospace';
      const txt = '✕  ' + cond;
      ctx.fillText(txt, 24, iy + itemH2 * 0.75);
      ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(24, iy + itemH2 * 0.65); ctx.lineTo(24 + ctx.measureText(txt).width, iy + itemH2 * 0.65); ctx.stroke();
    });
    const impY = h - 50;
    ctx.fillStyle = 'rgba(255,255,255,0.03)'; ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 1;
    ctx.fillRect(16, impY, rowW, 42); ctx.strokeRect(16, impY, rowW, 42);
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = 'bold 9px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('WHAT WAIT MEANS', w / 2, impY + 13);
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '11px Inter, sans-serif';
    ctx.fillText('No urgent condition. Quiet bar. Reduce activity, wait for a colored action cell.', w / 2, impY + 28);
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '10px Inter, sans-serif';
    ctx.fillText('WAIT is not bearish. It is the absence of urgency.', w / 2, impY + 40);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// MAIN COMPONENT — Lesson 11.6
// Phase 1+2A+2B scope: hero + S00-S15 + Animations 1-13
// ============================================================
export default function CipherExecutiveSummaryLesson() {
  const [scrollY, setScrollY] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameRound, setGameRound] = useState(0);
  const [gameSelections, setGameSelections] = useState<(string | null)[]>(
    new Array(gameRounds.length).fill(null)
  );
  const [quizAnswers, setQuizAnswers] = useState<(string | null)[]>(
    new Array(quizQuestions.length).fill(null)
  );
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [certRevealed, setCertRevealed] = useState(false);
  const [certId] = useState(
    () => `PRO-CERT-L11.6-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  );

  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  const quizScore = quizAnswers.filter((ans, i) => {
    const correct = quizQuestions[i].options.find((o) => o.correct)?.id;
    return ans === correct;
  }).length;
  const quizPercent = Math.round((quizScore / quizQuestions.length) * 100);
  const quizPassed  = quizPercent >= 66;

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

  const fadeUp = {
    hidden:  { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
  };

  return (
    <div className="min-h-screen text-white"
      style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      <Confetti active={showConfetti} />

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-900/50">
        <motion.div className="h-full bg-gradient-to-r from-amber-500 to-accent-500"
          style={{ width: `${Math.min((scrollY / (typeof document !== 'undefined' ? document.body.scrollHeight - window.innerHeight : 1)) * 100, 100)}%` }} />
      </div>

      {/* Nav */}
      <nav className="fixed top-1 left-0 right-0 z-40 flex items-center justify-between px-5 py-2.5">
        <Link href="/academy" className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-amber-400 to-accent-400 bg-clip-text text-transparent"
          style={{ WebkitTransform: 'translateZ(0)' }}>ATLAS ACADEMY</Link>
        <div className="flex items-center gap-2">
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-bold text-amber-400">PRO &middot; LEVEL 11</span>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6 pt-20">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(245,158,11,0.08),transparent_70%)] pointer-events-none" />
        <div className="absolute top-[-50px] right-[20%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(217,70,239,0.05),transparent_70%)] pointer-events-none" />
        <motion.div initial="hidden" animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.15 } } }} className="relative z-10">
          <motion.div variants={fadeUp}>
            <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">
              Level 11 &middot; Lesson 6
            </p>
          </motion.div>
          <motion.h1 variants={fadeUp}
            className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">
            The Executive Summary<br />
            <span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent"
              style={{ WebkitTransform: 'translateZ(0)' }}>
              CIPHER&apos;s Priority Waterfall
            </span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">
            17 conditions. One output. The header has already resolved every conflict in the Command
            Center before you finish reading the first row.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5">
            <span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span>
            <div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── S00 — Why This Matters ── */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">
            First &mdash; Why This Matters
          </p>
          <div className="p-6 rounded-2xl glass-card">
            <h2 className="text-2xl font-extrabold mb-4">
              The most watched cell in the Command Center is also the most misunderstood.
            </h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              The CIPHER PRO header row &mdash; the always-on row at the top of the Command Center
              &mdash; is the only row that can never be turned off. It reads{' '}
              <strong className="text-white">every other row simultaneously</strong> and outputs a
              single plain-English verdict: the single most important action on this bar. Not an
              average. Not a vote. The single highest-priority true condition from a 17-state
              cascade evaluated top to bottom.
            </p>
            <p className="text-gray-400 leading-relaxed mb-4">
              Most operators glance at it, note the color, and move to the rows below to &ldquo;verify.&rdquo;
              This is backwards. The header is{' '}
              <strong className="text-amber-400">the synthesis</strong>. The rows are the evidence.
              When Momentum is teal and Tension is magenta and the header is amber, the header has
              already resolved that conflict using a deterministic priority system baked into the
              Pine source. You do not need to resolve it manually.
            </p>
            <p className="text-gray-400 leading-relaxed">
              This lesson teaches you to read the header first, use the rows for nuance, and trust
              the cascade that CIPHER runs 17 conditions deep on every bar.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ── S01 — Groundbreaking Concept ── */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">
            &#11088; 01 &mdash; Groundbreaking Concept
          </p>
          <h2 className="text-2xl font-extrabold mb-4">
            The Single Most Urgent Truth
          </h2>
          <p className="text-gray-400 leading-relaxed mb-4">
            Every bar, CIPHER asks one question:{' '}
            <strong className="text-white">what is the single most important thing this operator
            needs to know right now?</strong> Seventeen possible states compete for that slot.
            The first true condition in the priority cascade wins. Everything below it is blocked.
          </p>
          {/* Tooltip quote */}
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15 mb-6">
            <p className="text-xs font-bold text-amber-400 mb-2">FROM THE CIPHER PRO HEADER TOOLTIP </p>
            <p className="text-sm text-gray-300 leading-relaxed italic">
              &ldquo;This row reads ALL intelligence below and shows the single most important
              action right now. Rows below are the evidence &mdash; they show different dimensions
              of the market (trend, energy, stretch, volatility). When rows show different colors,
              the header has already resolved the conflict for you. Green = go. Amber = caution.
              Red = danger.&rdquo;
            </p>
          </div>
          <PriorityWaterfallAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">
            Five scenes from your actual Command Center. Watch the priority cascade list on the
            right: as each scene loads, the active priority lights up and all higher priorities
            dim as &ldquo;blocked.&rdquo; <strong className="text-teal-400">Scene 1</strong>:
            RIDE IT fires at priority 9 &mdash; priorities 1&ndash;8 are all false, spread is
            expanding and health is above 50. <strong className="text-white">Scene 2</strong>:
            TREND CURVING fires at priority 6, blocking TREND AGING at 7 even though both are
            true. <strong className="text-white">Scene 3</strong>: TREND AGING fires at 7 when
            CURVING is false. <strong className="text-white">Scene 4</strong>: SNAP ZONE at
            priority 10 fires despite Momentum SURGING at priority 15 &mdash; tension outranks
            momentum. <strong className="text-amber-400">Scene 5</strong>: FADING fires in bright
            red at priority 11 &mdash; rows show mixed colors, header has resolved the conflict.
          </p>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ ORDER</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              <strong className="text-white">1. Header action color</strong> &mdash; teal/amber/red/magenta
              tells you urgency before you read a word.{' '}
              <strong className="text-white">2. Header action text</strong> &mdash; the specific
              state tells you what to do.{' '}
              <strong className="text-white">3. Header state cell</strong> &mdash; the regime and
              direction context.{' '}
              <strong className="text-white">4. Evidence rows</strong> &mdash; for nuance and
              stop/size decisions. Never for overriding the header.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ── S02 — The Header State Cell ── */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">
            02 &mdash; The Header State Cell
          </p>
          <h2 className="text-2xl font-extrabold mb-4">
            Four states. Regime + direction in one cell.
          </h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            The header&apos;s middle cell (col 2) is not the same as the Regime row&apos;s state
            cell. It combines regime classification with ribbon direction to give you a richer
            context label. There are exactly four possible outputs, each with its own color
            locked by CIPHER enforces this.
          </p>
          <HeaderStateCellAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">
            Watch the four states cycle.{' '}
            <strong className="text-teal-400">&#9650; BULL TREND</strong>: TREND regime with
            pulse_dir = bull &mdash; teal, the most confident positive state.{' '}
            <strong className="text-red-400">&#9660; BEAR TREND</strong>: TREND regime with
            pulse_dir = bear &mdash; magenta, directional trend but against the bull bias.{' '}
            <strong className="text-red-400">&#9889; VOLATILE</strong>: VOLATILE regime &mdash;
            magenta, the highest-risk state regardless of direction.{' '}
            <strong className="text-amber-400">&#8596; RANGING</strong>: RANGE regime &mdash;
            amber, the undirectional state.
          </p>
          <div className="p-5 rounded-2xl glass-card space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">WHY BEAR TREND IS MAGENTA, NOT RED</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                Magenta in CIPHER means &ldquo;bearish or volatile structural condition&rdquo; &mdash;
                not danger-tier urgency (that is bright red #FF1744). A bearish trend is a valid
                market state with its own playbook. It is not a capital-risk signal. The distinction
                between magenta (structural) and bright red (danger) is precise and intentional.
              </p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE DIRECTION DRIVER</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                Bull vs. bear in the header is driven by <strong className="text-white">pulse_dir</strong>
                &mdash; the ribbon&apos;s directional state &mdash; not by the regime race or by
                ADX alone. A chart can show TREND regime (ADX-driven) with &#9660; BEAR TREND if
                the ribbon is stacked bearish. The regime says &ldquo;trending&rdquo;; the direction
                says &ldquo;which way.&rdquo;
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── S03 — The Color Grammar ── */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">
            03 &mdash; The Color Grammar
          </p>
          <h2 className="text-2xl font-extrabold mb-4">
            Read the color before you read the word
          </h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            The header action cell uses four distinct colors, each encoding an urgency tier. You
            should be able to identify the tier within one second of glancing at the header &mdash;
            before your brain has processed the text. This is the color grammar, locked by Pine
            line 3090.
          </p>
          <ColorGrammarAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">
            Four tiers cycle. <strong className="text-teal-400">Teal</strong> is the go tier:
            RIDE IT, BREAKOUT &#9650;, ENTRY ZONE. Execute. <strong className="text-amber-400">
            Amber</strong> is the caution tier: AGING, CURVING, SNAP ZONE, COILING. Prepare.{' '}
            <strong style={{ color: '#FF1744' }}>Bright red</strong> is the danger tier: FADING,
            EXIT SOON, REVERSAL NEAR. Protect capital.{' '}
            <strong className="text-red-400">Magenta</strong> is the volatile/structural tier:
            REDUCE SIZE, BREAKOUT &#9660;, DOUBLE COIL. Regime-specific alert.
          </p>
          <div className="p-5 rounded-2xl glass-card space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE MAGENTA VS RED DISTINCTION</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                Magenta (#EF5350) and bright red (#FF1744) are two separate danger signals.
                Magenta = VOLATILE regime or bearish structural condition. Bright red = active
                health deterioration or imminent exit condition. A bright red header demands
                immediate capital protection action. A magenta header demands regime-appropriate
                caution (reduce size, widen stops). They are not interchangeable.
              </p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CYAN \u2014 THE FIFTH COLOR</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                There is a fifth color: <strong style={{ color: '#00BCD4' }}>cyan (#00BCD4)</strong>
                , used exclusively for{' '}
                <strong className="text-white">&rarr; BUILDING</strong> when TREND regime and
                momentum is in the BUILDING phase. It is distinct from teal &mdash; a lighter,
                more cautious positive. BUILDING means the trend is gaining energy but not yet at
                full RIDE IT strength.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── S04 — The Two-Cell Brief ── */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">
            04 &mdash; The Two-Cell Brief
          </p>
          <h2 className="text-2xl font-extrabold mb-4">
            Full operator context in two cells
          </h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            The header&apos;s state cell and action cell together form the{' '}
            <strong className="text-white">minimum viable CIPHER read</strong>. State tells you
            the market character; action tells you what to do about it right now. In a
            time-constrained situation &mdash; news event, fast market, mid-meeting &mdash; two
            cells deliver a complete, valid operator decision. The rows below add nuance for
            stop placement and sizing, but they do not change the core verdict.
          </p>
          <TwoCellBriefAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">
            Four brief combinations cycle, each drawn from real Command Center states. State cell
            gives you regime + direction. Action cell gives you the resolved verdict. The operator
            action box shows what that two-cell read implies in practice &mdash;
            no additional rows required.
          </p>
          <div className="p-5 rounded-2xl glass-card space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE READ ORDER IN PRACTICE</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                <strong className="text-white">Step 1</strong>: Look at the action cell color.
                Teal = go, amber = prepare, red = protect, magenta = regime alert.{' '}
                <strong className="text-white">Step 2</strong>: Read the action cell text.
                Confirms the specific condition. <strong className="text-white">Step 3</strong>:
                Read the state cell for regime + direction context.{' '}
                <strong className="text-white">Step 4</strong>: Scan evidence rows for stop
                distance and sizing nuance. Never use evidence rows to override the header.
              </p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHEN THE HEADER IS WHITE/DIM</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                <strong className="text-white">&rarr; WAIT</strong> renders in dim white and is
                the cascade fallback &mdash; all 17 conditions above it are false on this bar. It
                is not a negative signal; it means the market has no urgent condition worth
                flagging. Stand by. Reduce activity until a colored state appears.
              </p>
            </div>
          </div>
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE CONFLICT RESOLUTION GUARANTEE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              When the rows below the header show different colors simultaneously &mdash;
              one teal, one amber, one red &mdash; that is not a problem to solve. It is
              information. The header has already processed all of it through the priority cascade
              and output the single most urgent truth.{' '}
              <strong className="text-white">Your job is to read the header, not to re-run the
              cascade manually.</strong>
            </p>
          </div>
        </motion.div>
      </section>

      {/* ── S05 — Regime Gating ── */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">
            05 &mdash; Regime Gating
          </p>
          <h2 className="text-2xl font-extrabold mb-4">
            Some states can only fire in specific regimes
          </h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            Not all 17 header states are available on every bar. Several are{' '}
            <strong className="text-white">regime-gated</strong> &mdash; they can only output
            when a specific regime is active. This is hardcoded into the cascade conditions on
            The cascade logic, not a setting you control.
          </p>
          <RegimeGatingAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">
            Three regime panels cycle. <strong className="text-teal-400">TREND</strong> unlocks
            RIDE IT, TREND AGING, TREND CURVING, TREND HOLLOWING, and BUILDING &mdash; five
            states that cannot fire in RANGE or VOLATILE.{' '}
            <strong className="text-amber-400">RANGE</strong> unlocks COILING (vol_ratio_atr
            &lt; 0.8 in RANGE only) but blocks all five TREND states.{' '}
            <strong className="text-red-400">VOLATILE</strong> has the narrowest unlocked set:
            REDUCE SIZE is its exclusive state and cannot fire in any other regime.
          </p>
          <div className="p-5 rounded-2xl glass-card space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">CROSS-REGIME STATES</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                Several states fire regardless of regime: SNAP ZONE (any regime, just requires
                tension &gt; ts_min_tension), FADING (any regime, requires spread_contracting
                or health_critical), ENTRY ZONE and EXIT SOON (any regime, driven by
                mom_next). These are the &ldquo;pure condition&rdquo; states that the market
                can reach from any starting point.
              </p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHY THIS MATTERS FOR READING</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                If you see <strong className="text-white">&rarr; RIDE IT</strong> in the header,
                you already know the regime is TREND without reading the state cell &mdash; RIDE
                IT is impossible in RANGE or VOLATILE. Similarly, if you see{' '}
                <strong className="text-white">&rarr; REDUCE SIZE</strong>, you know VOLATILE is
                active. The action cell encodes the regime implicitly for certain states.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── S06 — The Full Cascade, in Order ── */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">
            06 &mdash; The Full Cascade, in Order
          </p>
          <h2 className="text-2xl font-extrabold mb-4">
            17 conditions. Top to bottom. First true wins.
          </h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            The full cascade from The cascade logic, visualized as an animated waterfall. When the
            market bar closes, CIPHER evaluates each condition from priority 1 downward. The
            first condition that evaluates true immediately outputs its state and{' '}
            <strong className="text-white">blocks all remaining conditions</strong> from being
            evaluated. The cascade stops at that point.
          </p>
          <CascadeDepthAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">
            Three scenarios demonstrate different stopping points. When RIDE IT fires at priority
            8, priorities 9&ndash;18 are never reached &mdash; even if their conditions are true.
            When the cascade reaches WAIT at the bottom, it means all 17 named conditions above
            it were false on this bar: no squeeze, no divergence, no projection convergence, no
            aging stack, no tension breach, no health deterioration, no momentum extreme. A quiet
            bar with no urgent signal.
          </p>
          <div className="p-5 rounded-2xl glass-card space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE FULL PRIORITY ORDER</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                1. BREAKOUT &#9650;/&#9660; &rarr; 2. BREAKOUT LOADING &rarr; 3. DOUBLE COIL
                &rarr; 4. TREND HOLLOWING &rarr; 5. TREND CURVING &rarr; 6. TREND AGING &rarr;
                7. RIBBON COILED &rarr; 8. RIDE IT &rarr; 9. SNAP ZONE &rarr; 10. FADING &rarr;
                11. BUILDING &rarr; 12. COILING &rarr; 13. REDUCE SIZE &rarr; 14. ENTRY ZONE
                &rarr; 15. EXIT SOON &rarr; 16. REVERSAL NEAR &rarr; 17. SNAP LIKELY &rarr;
                18. WAIT
              </p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHY BREAKOUT IS PRIORITY 1</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                A squeeze breakout is the highest-conviction event in CIPHER &mdash; compressed
                energy releasing directionally. When it fires, nothing else matters. The cascade
                opens with this check because any other signal during a live breakout is
                subordinate. Even TREND HOLLOWING (internal deterioration) is less urgent than
                a live squeeze releasing.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── S07 — RIDE IT Deep Dive ── */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">
            07 &mdash; RIDE IT &mdash; The Teal Signal
          </p>
          <h2 className="text-2xl font-extrabold mb-4">
            The most sought-after header state &mdash; and why it is rare
          </h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            <strong className="text-teal-400">&rarr; RIDE IT</strong> is the most unambiguous
            operator signal in CIPHER. Teal, priority 8, three simultaneous conditions required.
            When it appears, the cascade has already confirmed that no squeeze, no divergence,
            no coiling, no hollowing, no curving, and no aging override it. The trend is
            structurally clean and actively expanding.
          </p>
          <RideItDeepDiveAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">
            Three scenarios. All three true &mdash; RIDE IT fires. Spread not expanding &mdash;
            blocked, cascade continues past priority 8. Health below 50 &mdash; blocked, cascade
            continues. The requirement that <strong className="text-white">all three be true
            simultaneously</strong> is what makes RIDE IT relatively rare and highly reliable
            when it does appear. A trend with low ribbon health will never show RIDE IT regardless
            of how strong the trend looks on the candles.
          </p>
          <div className="p-5 rounded-2xl glass-card space-y-4">
            <div>
              <p className="text-xs font-bold text-teal-400 mb-1">THE THREE CONDITIONS </p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">
                regime == &quot;TREND&quot;<br />
                AND spread_expanding &nbsp;&nbsp;// ribbon width actively growing<br />
                AND health_smooth &gt; 50 &nbsp;// adaptive health above midpoint
              </p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-teal-400 mb-1">WHAT TO DO ON RIDE IT</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                Run the TREND playbook at full conviction. Ride pullbacks to the Pulse or Flow
                line. Do not fade. Do not take early partials unless the Regime row is showing
                FORMING. RIDE IT means the trend is healthy, expanding, and not yet aging.
                It is the &ldquo;stay in the trade&rdquo; signal.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── S08 — Conflict Resolution in Practice ── */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">
            08 &mdash; Conflict Resolution in Practice
          </p>
          <h2 className="text-2xl font-extrabold mb-4">
            When rows disagree, the header has already decided
          </h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            The most common operator confusion is seeing two rows with contradicting signals
            and trying to resolve them manually. The tooltip says it explicitly:{' '}
            <strong className="text-white">&ldquo;When rows show different colors, the header
            has already resolved the conflict for you.&rdquo;</strong> The cascade ran all
            conditions on this bar and output the single highest-priority true one.
          </p>
          <ConflictResolutionAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">
            Three real conflict pairs cycle. Conflict 1: Tension warns (SNAP LIKELY) while
            Momentum surges (HOLD POSITION) &mdash; header outputs SNAP ZONE because tension
            at priority 9 outranks any momentum-derived state at priority 14+. Conflict 2:
            health failing while Momentum is strong &mdash; header outputs FADING (bright red)
            at priority 10. Conflict 3: CURVING and AGING both true simultaneously &mdash; header
            outputs CURVING because priority 5 beats priority 6.
          </p>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE RULE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Never manually average, vote, or synthesise conflicting rows. The header has
              already done this with a deterministic algorithm. Use the header action as the
              verdict. Use the conflicting rows as <strong className="text-white">evidence
              </strong> for stop distance, position sizing, and risk management &mdash; not for
              overriding the verdict.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ── S09 — The Operator Read Discipline ── */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">
            09 &mdash; The Operator Read Discipline
          </p>
          <h2 className="text-2xl font-extrabold mb-4">
            Four steps. Always in this order.
          </h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            The header is designed to be read in a specific order that extracts maximum
            information in minimum time. This four-step discipline applies every time you
            open CIPHER &mdash; whether you have 2 seconds or 2 minutes.
          </p>
          <HeaderReadOrderAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">
            Watch the highlight sweep through each step. <strong className="text-white">Step 1
            </strong>: action cell color &mdash; urgency tier before you read a word. A teal
            header means you can proceed; a red header means stop and protect.{' '}
            <strong className="text-white">Step 2</strong>: action cell text &mdash; the
            specific condition. <strong className="text-white">Step 3</strong>: state cell &mdash;
            regime and direction context. <strong className="text-white">Step 4</strong>:
            evidence rows &mdash; nuance for execution decisions. The evidence rows are step 4,
            not step 1.
          </p>
          <div className="p-5 rounded-2xl glass-card space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE 10-SECOND GLANCE READ</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                In a fast market: glance at the header action color (1 second). If teal &mdash;
                run your playbook. If amber &mdash; what specifically? (read text, 2 seconds).
                If red &mdash; protect capital now. Full four-step read takes 10 seconds once
                the discipline is installed. The goal is to reach step 4 (evidence rows) on
                every bar without skipping steps 1&ndash;3.
              </p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE WAIT STATE</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                <strong className="text-white">&rarr; WAIT</strong> (dim white) is the cascade
                fallback. All 17 named conditions are false. This is not a negative signal &mdash;
                it means the market has no urgent condition worth flagging on this bar. Reduce
                activity. Wait for a colored action cell to appear before entering new positions.
                WAIT is information: the market has nothing urgent to say right now.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── S10 — TREND HOLLOWING vs TREND CURVING ── */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">
            10 &mdash; TREND HOLLOWING vs TREND CURVING
          </p>
          <h2 className="text-2xl font-extrabold mb-4">Both amber. Very different warnings.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            Two of the most misread amber states share a surface similarity &mdash; both appear
            during a TREND regime and both are amber. But their causes and implications are
            completely different, and their priorities reflect that:{' '}
            <strong className="text-amber-400">&rarr; TREND HOLLOWING</strong> sits at priority
            4, <strong className="text-amber-400">&rarr; TREND CURVING</strong> at priority 6.
            When both are true simultaneously, HOLLOWING wins because it is the more urgent
            condition.
          </p>
          <HollowingVsCurvingAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">
            Panels alternate highlight. TREND HOLLOWING fires when{' '}
            <strong className="text-white">rd_active</strong> is true &mdash; the ribbon
            divergence detector has identified that price is making a new structural extreme while
            the ribbon&apos;s internal spread is weakening. The trend is dying from inside before
            the candles show it. This is the most valuable early warning in CIPHER. TREND CURVING
            fires when <strong className="text-white">proj_converging</strong> is true &mdash; the
            ribbon&apos;s projected trajectory is bending back. Not yet deteriorating; just losing
            momentum. Two bars of difference in urgency.
          </p>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE OPERATOR DIFFERENCE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              HOLLOWING: tighten stops immediately, no new entries in trend direction, watch for
              SHIFTING. CURVING: tighten stops, watch for escalation to HOLLOWING, can still
              ride existing position. The word &ldquo;hollowing&rdquo; means the interior
              structure is failing &mdash; even if the outside looks fine.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ── S11 — FADING vs REDUCE SIZE ── */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">
            11 &mdash; FADING vs REDUCE SIZE
          </p>
          <h2 className="text-2xl font-extrabold mb-4">Two danger colors. Two different crises.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            The two non-amber danger states are the most commonly confused pair in the Command
            Center. <strong style={{ color: '#FF1744' }}>&rarr; FADING</strong> renders in
            bright red (#FF1744) and means the ribbon engine&apos;s internal health or spread is
            failing. <strong className="text-red-400">&rarr; REDUCE SIZE</strong> renders in
            magenta (#EF5350) and means the VOLATILE regime is active. Same urgency tier
            visually, completely different causes and playbooks.
          </p>
          <FadingVsReduceSizeAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">
            FADING fires in any regime when spread_contracting or health_critical is true. It is
            a <strong className="text-white">ribbon health signal</strong>, not a regime signal.
            A ranging market with a failing ribbon produces bright red FADING. REDUCE SIZE fires
            only in VOLATILE regime &mdash; a pure regime gate. The color difference encodes this:
            bright red = active health crisis, magenta = structural/regime condition.
          </p>
          <div className="p-5 rounded-2xl glass-card space-y-4">
            <div>
              <p className="text-xs font-bold" style={{ color: '#FF1744' }}>FADING PLAYBOOK</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                Stop all new entries. If you have open positions, tighten stops or close. The
                ribbon is losing the energy required to sustain any directional move. FADING
                in a TREND regime often precedes a regime flip to RANGE.
              </p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-red-400 mb-1">REDUCE SIZE PLAYBOOK</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                VOLATILE regime is active &mdash; ATR has spiked above 1.5&times; ATR_slow.
                Reduce position size 50&ndash;100%. Do not fade the spike. Do not run the RANGE
                mean-reversion playbook. Wait for VOLATILE to resolve before new standard entries.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── S12 — The Header in Full Command Center Context ── */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">
            12 &mdash; The Header in Full Context
          </p>
          <h2 className="text-2xl font-extrabold mb-4">
            Five real states from your Command Center
          </h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            The header always sits above the evidence rows. Each of the five states below is
            drawn from a real screenshot of CIPHER PRO in a live session. Watch how the header
            action cell changes as market conditions shift &mdash; and notice how the evidence
            rows below sometimes show mixed colors while the header has already resolved the
            single most important verdict.
          </p>
          <RealChartContextAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">
            Scene 1 (RIDE IT): all rows teal, perfect alignment, full conviction trade.
            Scene 2 (TREND CURVING): Ribbon amber, Momentum magenta, Regime amber &mdash; three
            different conditions, header picks CURVING at priority 6.
            Scene 3 (TREND AGING): similar to scene 2 but proj_converging is false this bar,
            so stack_aging at priority 7 fires instead.
            Scene 4 (SNAP ZONE): Tension magenta warning vs Momentum teal surge &mdash; header
            picks tension.
            Scene 5 (FADING): Ribbon magenta, Momentum teal, Regime amber &mdash; header fires
            bright red FADING at priority 11. Mixed rows, resolved verdict.
          </p>
        </motion.div>
      </section>

      {/* ── S13 — The WAIT State ── */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">
            13 &mdash; The WAIT State
          </p>
          <h2 className="text-2xl font-extrabold mb-4">When the cascade has nothing to report</h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            <strong className="text-white">&rarr; WAIT</strong> is the cascade fallback. It
            appears in dim white when all 17 named conditions above it evaluate false on this
            bar. No squeeze, no divergence, no projection convergence, no aging, no coiling, no
            tension breach, no health failure, no momentum extreme. The market is quiet enough
            that the Priority Waterfall has nothing urgent to report.
          </p>
          <WaitStateAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">
            The animation shows the cascade with all conditions struck through as false, ending
            at WAIT in dim pulsing white. WAIT is{' '}
            <strong className="text-white">not a bearish signal</strong> and not a malfunction.
            It is the absence of urgency &mdash; the market equivalent of a quiet room. When you
            see WAIT, reduce activity, avoid new entries until a colored action cell appears, and
            use the time to study the evidence rows for setup preparation.
          </p>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">WAIT IS INFORMATION</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              A market that consistently produces WAIT has no squeeze building, no divergence,
              no tension, no aging trend. It is genuinely undecided and unexciting. This is the
              correct time to stand aside. When WAIT flips to any colored state, the cascade has
              found the first true condition &mdash; that is your signal to re-engage.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ── S14 — Six Common Mistakes ── */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">
            14 &mdash; Six Common Mistakes
          </p>
          <h2 className="text-2xl font-extrabold mb-4">The Narrative Reader Operator&apos;s error log</h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            These are the six errors operators make when reading the Executive Summary row.
          </p>
          <div className="space-y-3">
            {[
              { n: '01', title: 'Reading the evidence rows before the header',
                body: 'The header is the synthesis; the rows are the evidence. Starting with rows and working up to the header is backwards. The cascade has already processed all rows. Read header first: color, then text, then state. Rows are step 4.' },
              { n: '02', title: 'Trying to manually override the header with a majority vote from rows',
                body: 'If Momentum is teal, Tension is amber, and Volume is amber, that is not "2 against 1 = amber." The header runs a priority cascade, not a vote. One high-priority condition can fire over multiple lower-priority conditions. Trust the cascade.' },
              { n: '03', title: 'Confusing FADING (bright red) with REDUCE SIZE (magenta)',
                body: 'Two different colors, two different crises. Bright red = ribbon health or spread failing (any regime). Magenta = VOLATILE regime active. The playbooks are different. The color tells you which crisis you are in before you read the word.' },
              { n: '04', title: 'Assuming TREND CURVING and TREND AGING are the same signal',
                body: 'Both amber, both in TREND. But CURVING (priority 6) means the projection is bending back. AGING (priority 7) means the stack has outlasted its historical average. CURVING is an earlier, more structural warning than AGING. When CURVING appears, AGING is blocked.' },
              { n: '05', title: 'Treating WAIT as a bearish signal',
                body: 'WAIT means all 17 named conditions above it are false on this bar. The market has nothing urgent. It is not bearish — it is quiet. Standing aside during WAIT is correct. Forcing trades during WAIT is how operators manufacture setups that are not there.' },
              { n: '06', title: 'Missing regime-gated states because you are on the wrong regime',
                body: 'RIDE IT requires TREND regime. COILING requires RANGE. REDUCE SIZE requires VOLATILE. If you are expecting RIDE IT but the regime is RANGE, it cannot appear. The cascade will never output a regime-gated state when that regime is inactive, regardless of how strong the other conditions are.' },
            ].map((card) => (
              <div key={card.n} className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
                <p className="text-xs font-bold text-red-400 mb-1">MISTAKE {card.n} &mdash; {card.title}</p>
                <p className="text-sm text-gray-400 leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── S15 — Cheat Sheet ── */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">
            15 &mdash; Cheat Sheet
          </p>
          <h2 className="text-2xl font-extrabold mb-4">Narrative Reader Operator reference</h2>
          <div className="p-5 rounded-2xl glass-card space-y-5">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-2">COLOR GRAMMAR </p>
              <div className="space-y-1 text-sm text-gray-400 leading-relaxed">
                <p><strong className="text-teal-400">Teal</strong> &mdash; Go: RIDE IT &middot; BREAKOUT &#9650; &middot; ENTRY ZONE</p>
                <p><strong className="text-amber-400">Amber</strong> &mdash; Caution: AGING &middot; CURVING &middot; HOLLOWING &middot; SNAP ZONE &middot; COILING &middot; BREAKOUT LOADING</p>
                <p><strong style={{ color: '#FF1744' }}>Bright Red #FF1744</strong> &mdash; Danger: FADING &middot; EXIT SOON &middot; REVERSAL NEAR</p>
                <p><strong className="text-red-400">Magenta #EF5350</strong> &mdash; Volatile/Structural: REDUCE SIZE &middot; BREAKOUT &#9660; &middot; DOUBLE COIL</p>
                <p><strong style={{ color: '#00BCD4' }}>Cyan #00BCD4</strong> &mdash; Building: BUILDING (TREND + mom_now BUILDING only)</p>
              </div>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">FULL PRIORITY ORDER </p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">
                1 BREAKOUT &rarr; 2 BREAKOUT LOADING &rarr; 3 DOUBLE COIL &rarr; 4 TREND HOLLOWING &rarr; 5 TREND CURVING &rarr; 6 TREND AGING &rarr; 7 RIBBON COILED &rarr; 8 RIDE IT &rarr; 9 SNAP ZONE &rarr; 10 FADING &rarr; 11 BUILDING &rarr; 12 COILING &rarr; 13 REDUCE SIZE &rarr; 14 ENTRY ZONE &rarr; 15 EXIT SOON &rarr; 16 REVERSAL NEAR &rarr; 17 SNAP LIKELY &rarr; WAIT
              </p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">REGIME-GATED STATES</p>
              <div className="space-y-1 text-sm text-gray-400 leading-relaxed">
                <p><strong className="text-teal-400">TREND only</strong>: RIDE IT &middot; TREND AGING &middot; TREND CURVING &middot; TREND HOLLOWING &middot; BUILDING</p>
                <p><strong className="text-amber-400">RANGE only</strong>: COILING (vol_ratio_atr &lt; 0.8)</p>
                <p><strong className="text-red-400">VOLATILE only</strong>: REDUCE SIZE</p>
                <p><strong className="text-white">Any regime</strong>: SNAP ZONE &middot; FADING &middot; ENTRY ZONE &middot; EXIT SOON &middot; REVERSAL NEAR</p>
              </div>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">RIDE IT CONDITIONS</p>
              <p className="text-sm text-gray-400 font-mono">regime == &quot;TREND&quot; AND spread_expanding AND health_smooth &gt; 50</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-1">All three must be simultaneously true. Priority 8.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">FOUR-STEP READ ORDER</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                <strong className="text-white">1.</strong> Action color (urgency tier) &rarr;
                <strong className="text-white"> 2.</strong> Action text (specific condition) &rarr;
                <strong className="text-white"> 3.</strong> State cell (regime + direction) &rarr;
                <strong className="text-white"> 4.</strong> Evidence rows (stop &amp; sizing nuance). Never rows before header.
              </p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">HEADER STATE CELL (col 2)</p>
              <div className="space-y-1 text-sm text-gray-400 leading-relaxed">
                <p><strong className="text-teal-400">&#9650; BULL TREND</strong> &mdash; TREND + pulse_dir bull</p>
                <p><strong className="text-red-400">&#9660; BEAR TREND</strong> &mdash; TREND + pulse_dir bear</p>
                <p><strong className="text-red-400">&#9889; VOLATILE</strong> &mdash; VOLATILE regime</p>
                <p><strong className="text-amber-400">&#8596; RANGING</strong> &mdash; RANGE regime</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── S16 — Scenario Game ── */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">
            16 &mdash; Scenario Game
          </p>
          <h2 className="text-2xl font-extrabold mb-4">Read the Header Like an Operator</h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            Five scenarios. Each puts you in a real-feeling header-reading situation. Pick the
            right call &mdash; explanations appear after every answer, including wrong ones.
          </p>
          <div className="p-5 rounded-2xl glass-card">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold tracking-widest uppercase text-amber-400">
                Round {gameRound + 1} of {gameRounds.length}
              </p>
              <p className="text-xs text-gray-500">
                Score:{' '}
                {gameSelections.filter((sel, i) => sel !== null && gameRounds[i].options.find((o) => o.id === sel)?.correct).length}
                /{gameRounds.length}
              </p>
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
                        const next = [...gameSelections]; next[gameRound] = opt.id; setGameSelections(next);
                      }}
                      disabled={answered}
                      className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}
                    >
                      <span className="text-gray-200">{opt.text}</span>
                    </button>
                    {answered && selected && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]">
                        <p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                          {isCorrect ? '✓' : '✗'} {opt.explain}
                        </p>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
            {gameSelections[gameRound] !== null && gameRound < gameRounds.length - 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5">
                <button onClick={() => setGameRound(gameRound + 1)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">
                  Next Round &rarr;
                </button>
              </motion.div>
            )}
            {gameSelections[gameRound] !== null && gameRound === gameRounds.length - 1 && (() => {
              const finalScore = gameSelections.filter((sel, i) => sel !== null && gameRounds[i].options.find((o) => o.id === sel)?.correct).length;
              return (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                  <p className="text-lg font-extrabold text-amber-400">{finalScore}/{gameRounds.length} Correct</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {finalScore >= 4 ? 'Operator-grade cascade reading installed. You read the header, not the rows.' : finalScore >= 3 ? 'Solid. Re-read the priority order (S06) and the conflict resolution rule (S08) before the quiz.' : 'Re-study the groundbreaking concept (S01), color grammar (S03), and the four-step read order (S09).'}
                  </p>
                </motion.div>
              );
            })()}
          </div>
        </motion.div>
      </section>

      {/* ── S17 — Final Quiz ── */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">
            17 &mdash; Knowledge Check
          </p>
          <h2 className="text-2xl font-extrabold mb-6">Final Quiz &mdash; {quizQuestions.length} Questions</h2>
          <div className="space-y-6">
            {quizQuestions.map((q, qi) => (
              <div key={q.id} className="p-5 rounded-2xl glass-card">
                <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">
                  Question {qi + 1} of {quizQuestions.length}
                </p>
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
                      <button key={opt.id}
                        onClick={() => {
                          if (quizAnswers[qi] !== null) return;
                          const next = [...quizAnswers]; next[qi] = opt.id; setQuizAnswers(next);
                          if (next.every((a) => a !== null)) setQuizSubmitted(true);
                        }}
                        disabled={answered}
                        className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`}>
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
              <p className="text-sm text-gray-400">
                {quizPassed ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate. Review the cheat sheet (S15) and try again.'}
              </p>
            </motion.div>
          )}
          {certRevealed && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10">
              <div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20"
                style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(14,165,233,0.04),transparent)] animate-spin"
                  style={{ animationDuration: '12s' }} />
                <div className="relative z-10 text-center">
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-sky-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">
                    &#9636;
                  </div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">
                    Has successfully completed<br />
                    <strong className="text-white">Level 11.6: The Executive Summary &mdash; CIPHER&apos;s Priority Waterfall</strong><br />
                    at ATLAS Academy by Interakktive
                  </p>
                  <p className="bg-gradient-to-r from-amber-400 via-sky-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4"
                    style={{ WebkitTransform: 'translateZ(0)' }}>
                    &mdash; Narrative Reader Operator &mdash;
                  </p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">{certId}</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* Gold footer */}
      <section className="max-w-2xl mx-auto px-5 py-20 text-center">
        <Link href="/academy"
          className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">
          &larr; Back to Academy
        </Link>
      </section>
    </div>
  );
}
