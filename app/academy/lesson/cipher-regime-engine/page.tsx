// app/academy/lesson/cipher-regime-engine/page.tsx
// ATLAS Academy — Lesson 11.4: The 3-Regime Engine [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 11 · CIPHER
// The Regime as Forecaster, Not Observer — CIPHER's RTP mechanism
// Covers: TREND / RANGE / VOLATILE classification + Regime Transition Predictor
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Crown } from 'lucide-react';

// ============================================================
// GAME ROUNDS — 5 scenario-based regime-reading challenges
// String-id answers, per-option explanations (teaches on wrong answers)
// Covers: reading-all-3-cells, RTP probability, playbook matching,
//         VOLATILE recognition, hysteresis-flicker discipline
// ============================================================
const gameRounds = [
  {
    id: 'r1',
    scenario:
      'You open EURUSD 1H and the Command Center Regime row reads: Regime | TREND | → RANGE FORMING. You\'ve had a bull position open for 40 bars. ADX is 28. Nothing looks visibly different on the chart.',
    prompt: 'What is the RTP actually telling you here?',
    options: [
      {
        id: 'a',
        text: 'Nothing urgent — regime is still TREND, keep riding the position.',
        correct: false,
        explain:
          'Wrong. The current state is TREND, yes — but the guidance cell says "→ RANGE FORMING". That means the RTP probability is between 50% and 75%. The regime is aging past historical average and is likely (not imminent, but likely) to flip. Ignoring the guidance is mistake #1 from section 14.',
      },
      {
        id: 'b',
        text: 'The current regime is TREND, but the probability of shift is 50-75%. Time to take partial profits and tighten the stop.',
        correct: true,
        explain:
          'Correct. "FORMING" means the RTP sigmoid has climbed above 50% — the regime has aged past its historical average on this chart. You\'re still in TREND, but prudent operator management is to take partials, tighten stops, and prepare for a possible flip to RANGE. Don\'t close fully yet — INTACT → FORMING → SHIFTING is the progression, and you\'re only at step 2.',
      },
      {
        id: 'c',
        text: 'Regime has already changed to RANGE — the system is slow, catch up.',
        correct: false,
        explain:
          'No — regime is clearly still TREND (cell 2). "RANGE FORMING" is a FORECAST, not a past event. If regime had actually flipped, cell 2 would read RANGE and cell 3 would read "→ RANGE HOLDING" or a new FORMING/SHIFTING toward another regime.',
      },
      {
        id: 'd',
        text: 'The ADX of 28 is wrong — you should re-run the indicator.',
        correct: false,
        explain:
          'ADX 28 is a valid trending reading and gives trend_pct = 70. That\'s not the issue. The issue is DURATION — this TREND has lasted 40 bars while the historical average for this chart is probably 30-35 bars, pushing the RTP probability above 50%. Duration over average is what drives "FORMING".',
      },
    ],
  },
  {
    id: 'r2',
    scenario:
      'A major news release fires on GBPUSD 5m. The Regime row reads: Regime | VOLATILE | → STAY CAUTIOUS. You had been running a RANGE-fading playbook (buying the lower band, selling the upper band).',
    prompt: 'What do you do with your open position and any pending setups?',
    options: [
      {
        id: 'a',
        text: 'Tighten stops on the open position, cancel pending setups, and switch to the VOLATILE playbook — reduce size or step away.',
        correct: true,
        explain:
          'Correct. VOLATILE is the most important regime to respect. The ATR spike has crossed 1.5× ATR_slow — the market is genuinely dislocating. Running a RANGE playbook through this is how traders get wrecked. "STAY CAUTIOUS" is CIPHER telling you capital preservation comes first.',
      },
      {
        id: 'b',
        text: 'Keep the RANGE playbook running — VOLATILE always fades back to RANGE quickly.',
        correct: false,
        explain:
          'This is mistake #4 from section 14 — assuming VOLATILE is negligible because it\'s rare. When VOLATILE fires, it\'s the tail-risk moment. Fading spikes during news releases is a capital-destroying playbook. "Don\'t fade the spike" is the VOLATILE playbook\'s AVOID rule for this exact reason.',
      },
      {
        id: 'c',
        text: 'Add to the open position — VOLATILE creates the biggest range extremes to fade.',
        correct: false,
        explain:
          'Dangerously wrong. News-driven VOLATILE regimes often break out of the prior range entirely rather than respect its boundaries. "Extremes" during VOLATILE are rarely mean-reverting extremes — they\'re trend-initiating moves. Adding size here is how account blow-ups happen.',
      },
      {
        id: 'd',
        text: 'Close everything and stop trading for the week.',
        correct: false,
        explain:
          'Too extreme. VOLATILE is typically a 5-15 bar event — the regime often flips back to TREND or RANGE within an hour on lower timeframes. The correct response is tighten stops + reduce size + wait it out, not shut the whole operation down.',
      },
    ],
  },
  {
    id: 'r3',
    scenario:
      'On a BTCUSDT 15m chart, you watch the Regime row flip from TREND to RANGE to TREND to RANGE over 5 consecutive bars. The third cell stays locked on "→ TREND INTACT" the entire time.',
    prompt: 'How do you interpret this?',
    options: [
      {
        id: 'a',
        text: 'CIPHER is broken or glitching — regime should never flicker like this.',
        correct: false,
        explain:
          'Not broken. CIPHER has NO hysteresis — regime is recomputed every bar from the raw three-score race. When trend_pct and range_pct are near-equal (a near-tie), small noise in ADX or ATR can flip the winner bar-to-bar. This is documented in section 12.',
      },
      {
        id: 'b',
        text: 'Single-bar flicker is noise. The guidance cell is the stable read — "TREND INTACT" means ignore the flicker and hold your trend playbook.',
        correct: true,
        explain:
          'Correct. The RTP guidance is the operator\'s smoothing layer. When raw regime flickers but guidance stays INTACT, the RTP probability is below 50% — the forecaster is telling you this is just noise around a near-tie. Mistake #3 from section 14 is trading on flicker. The guidance cell exists exactly to filter this out.',
      },
      {
        id: 'c',
        text: 'Regime is transitioning — switch playbooks immediately.',
        correct: false,
        explain:
          'No — a transition is signaled by the GUIDANCE cell changing (INTACT → FORMING → SHIFTING), not by raw regime flicker. When guidance stays on "INTACT", the RTP is confident the regime hasn\'t truly changed. Switching playbooks on flicker alone is how operators get whipsawed.',
      },
      {
        id: 'd',
        text: 'Apply a 5-bar moving average to the regime state yourself.',
        correct: false,
        explain:
          'Unnecessary — that\'s literally what the RTP\'s guidance cell does, probabilistically. Building your own hysteresis on top of CIPHER\'s already-smoothed guidance is double-filtering and introduces lag. Trust the INTACT read.',
      },
    ],
  },
  {
    id: 'r4',
    scenario:
      'You\'re looking at the CIPHER Command Center header bar on SPX 1H. It reads: ▲ BULL TREND → TREND HOLLOWING. The Regime row below reads: Regime | TREND | → TREND INTACT.',
    prompt: 'The header says "TREND HOLLOWING" but the Regime row still says INTACT — what does this mean?',
    options: [
      {
        id: 'a',
        text: 'Contradiction — one of the two is wrong, CIPHER has a bug.',
        correct: false,
        explain:
          'Not a contradiction. These two cells measure different things. Regime classification (cell 2) is about the three-score race on this bar. "TREND HOLLOWING" is an action-cell string that appears when Ribbon Divergence (rd_active) is present AND regime is still TREND. The trend is weakening internally even though it hasn\'t flipped yet.',
      },
      {
        id: 'b',
        text: 'Two different signals: regime is stable (TREND), but internal trend structure (Ribbon Divergence) is weakening. Start watching closely.',
        correct: true,
        explain:
          'Correct. The header\'s action cell reflects MORE than just regime — it factors in Ribbon Divergence, Pulse structure, momentum health, etc. "TREND HOLLOWING" means the regime is still TREND but Ribbon Divergence is signaling internal weakness. The RTP hasn\'t caught up yet (still INTACT), but your operator eye should. This is an EARLY warning.',
      },
      {
        id: 'c',
        text: 'The header is ahead of the regime row, so the regime row can be ignored.',
        correct: false,
        explain:
          'Neither cell is inferior. The regime row tells you the current state and the RTP probability. The header tells you rich action guidance based on many systems. Read BOTH — they are complementary reads of different depths. Ignoring the RTP row because the action cell looks interesting is mistake #1: reading only one cell.',
      },
      {
        id: 'd',
        text: 'Both are saying the same thing using different words.',
        correct: false,
        explain:
          'No — they\'re saying DIFFERENT things. "TREND INTACT" (regime row, cell 3) = RTP probability of regime shift is below 50%. "TREND HOLLOWING" (header action cell) = Ribbon Divergence is firing. These are independent systems that happen to both be valid readings. Don\'t collapse them.',
      },
    ],
  },
  {
    id: 'r5',
    scenario:
      'You\'re watching the Regime row on ETHUSDT 4H. Over the last 6 hours, the guidance cell has progressed: → TREND INTACT → TREND INTACT → RANGE FORMING → RANGE FORMING → SHIFTING TO RANGE → (currently on this bar).',
    prompt: 'What should your next action be?',
    options: [
      {
        id: 'a',
        text: 'Wait for the regime cell to actually flip to RANGE before acting.',
        correct: false,
        explain:
          'Too late. "SHIFTING TO RANGE" means the RTP probability is already above 75%. If you wait for cell 2 to flip, you\'ll be catching the change AFTER the market has already moved. The entire point of the RTP is to give you ADVANCE warning so you can position before the crowd sees it.',
      },
      {
        id: 'b',
        text: 'Close or reduce the trend position now, then prepare RANGE-playbook setups.',
        correct: true,
        explain:
          'Correct. The progression INTACT → FORMING → SHIFTING is a complete operator checklist: hold → prepare → act. You\'re on SHIFTING — the time to act is now. Close or scale down the trend position, then pivot to the RANGE playbook (fade the next upper/lower extreme). This is exactly the workflow the RTP was designed to enable.',
      },
      {
        id: 'c',
        text: 'Reverse into a full short position immediately — RANGE means bearish.',
        correct: false,
        explain:
          'Two errors. First, RANGE is undirectional — it\'s not bearish, it\'s "neither trending up nor trending down". Second, even if you were planning a RANGE playbook, you fade EXTREMES, you don\'t just flip direction on the current price. The RANGE playbook trades the upper/lower boundaries, not the center.',
      },
      {
        id: 'd',
        text: 'Wait 5 more bars to see if SHIFTING is confirmed.',
        correct: false,
        explain:
          'Unnecessary and risky. "SHIFTING" is already the highest-probability guidance state — the RTP is telling you >75% probability. Adding your own confirmation delay is double-filtering what\'s already a probability-aware system. You lose edge waiting for certainty that the market won\'t provide.',
      },
    ],
  },
];

// ============================================================
// QUIZ QUESTIONS — 8 questions covering lesson surface area
// 66% pass threshold (6 of 8 correct = pass)
// String-id answers with question-level explanations
// ============================================================
const quizQuestions = [
  {
    id: 'q1',
    question:
      'CIPHER classifies every bar into one of how many regimes, and what are the tie-break rules?',
    options: [
      { id: 'a', text: '5 regimes — ties broken alphabetically', correct: false },
      { id: 'b', text: '3 regimes — ties broken TREND > VOLATILE > RANGE', correct: true },
      { id: 'c', text: '4 regimes — ties unresolved (flicker)', correct: false },
      { id: 'd', text: '3 regimes — ties broken RANGE > VOLATILE > TREND', correct: false },
    ],
    explain:
      'CIPHER uses exactly three regimes (TREND, RANGE, VOLATILE) and resolves ties with a fixed priority: TREND wins over VOLATILE, VOLATILE wins over RANGE. A trending market with a moderate vol spike stays TREND. A vol spike in an otherwise-quiet market goes VOLATILE, not RANGE. This is locked design (section 07).',
  },
  {
    id: 'q2',
    question:
      'What drives the trend_pct score in the three-score regime race?',
    options: [
      { id: 'a', text: 'Moving average slope', correct: false },
      { id: 'b', text: 'Price distance from the previous close', correct: false },
      { id: 'c', text: 'ADX — trend_pct = min(100, ADX × 2.5)', correct: true },
      { id: 'd', text: 'The Cipher Ribbon stack direction', correct: false },
    ],
    explain:
      'trend_pct is a direct monotonic function of ADX with a 2.5 multiplier and a cap at 100. ADX saturates trend_pct at ADX 40+. The 2.5 multiplier is chosen so strong trends consistently win against moderate vol_spike readings (section 04).',
  },
  {
    id: 'q3',
    question:
      'When does volatile_pct first become non-zero?',
    options: [
      { id: 'a', text: 'Any time price moves', correct: false },
      { id: 'b', text: 'When current ATR exceeds 1.5× ATR_slow (50-bar SMA of ATR)', correct: true },
      { id: 'c', text: 'When ADX is below 15', correct: false },
      { id: 'd', text: 'When the Regime row is toggled on', correct: false },
    ],
    explain:
      'volatile_pct is zero below 1.5× ATR/ATR_slow, ramps linearly from 0 to 100 between 1.5× and 2.0×, and caps at 100 above 2.0×. The ratio (not an absolute ATR value) is what makes VOLATILE self-calibrating to any instrument/timeframe (section 05).',
  },
  {
    id: 'q4',
    question:
      'The RTP probability of regime shift follows a sigmoid curve. At what ratio (duration / avg) does the sigmoid output approximately 50%?',
    options: [
      { id: 'a', text: 'Ratio = 0.5 (half of historical average)', correct: false },
      { id: 'b', text: 'Ratio = 1.0 (exactly at historical average)', correct: true },
      { id: 'c', text: 'Ratio = 1.5 (50% past historical average)', correct: false },
      { id: 'd', text: 'Ratio = 2.0 (double historical average)', correct: false },
    ],
    explain:
      'The sigmoid is centered at ratio = 1.0. When the current regime has lasted exactly as long as its historical average, the probability of shift is about 50%. At 50% past average (ratio 1.5), it\'s ~85%. The curve caps at 95% to prevent false certainty (section 08).',
  },
  {
    id: 'q5',
    question:
      'The Regime row in the Command Center has three cells. What does the third cell (guidance) display?',
    options: [
      { id: 'a', text: 'The current ADX value', correct: false },
      { id: 'b', text: 'The RTP\'s plain-English forecast: INTACT, HOLDING, CAUTIOUS, FORMING, or SHIFTING TO X', correct: true },
      { id: 'c', text: 'A numeric probability percentage', correct: false },
      { id: 'd', text: 'The action cell from the header', correct: false },
    ],
    explain:
      'The third cell translates the RTP probability into one of five states. Below 50% probability = INTACT/HOLDING/CAUTIOUS (stable). 50-75% = FORMING (likely shift coming). Above 75% = SHIFTING TO X (imminent). No raw numbers — it\'s the "We Show You WHY" read (section 09).',
  },
  {
    id: 'q6',
    question:
      'How many downstream systems in CIPHER change when the regime flips?',
    options: [
      { id: 'a', text: '1 — just the Regime row', correct: false },
      { id: 'b', text: '5 — header, action cell, guidance, Risk Envelope bands, alert JSON', correct: true },
      { id: 'c', text: '3 — header, regime row, and chart background', correct: false },
      { id: 'd', text: '0 — regime is purely informational', correct: false },
    ],
    explain:
      'Regime drives five cascading effects: (1) the always-on header state label + color, (2) which action cell strings can appear, (3) the RTP guidance text, (4) Risk Envelope band widening (+10% in VOLATILE only), (5) the alert JSON payload. Regime is one of the most consequential signals in CIPHER (section 10).',
  },
  {
    id: 'q7',
    question:
      'Does CIPHER use hysteresis (N-bar confirmation) when classifying regimes?',
    options: [
      { id: 'a', text: 'Yes — 5-bar confirmation is required', correct: false },
      { id: 'b', text: 'Yes — 3-bar confirmation is required', correct: false },
      { id: 'c', text: 'No — regime is computed per-bar; RTP guidance is the stability layer instead', correct: true },
      { id: 'd', text: 'Only in VOLATILE regime', correct: false },
    ],
    explain:
      'No hysteresis. Regime is computed fresh every bar from the three-score race — which means regime can flicker bar-to-bar at near-ties. The stability operators need is in the RTP guidance cell (INTACT stays INTACT through flicker). Treating the guidance as the operator read (not the raw state) is the correct discipline (section 12).',
  },
  {
    id: 'q8',
    question:
      'In the VOLATILE playbook, what is the correct AVOID rule?',
    options: [
      { id: 'a', text: '"Don\'t fade the move" — same as TREND playbook', correct: false },
      { id: 'b', text: '"Don\'t chase breakouts" — same as RANGE playbook', correct: false },
      { id: 'c', text: '"Don\'t fade the spike" — VOLATILE often breaks prior ranges, not fades back', correct: true },
      { id: 'd', text: '"Don\'t trade at all" — always close everything', correct: false },
    ],
    explain:
      'VOLATILE\'s AVOID is "don\'t fade the spike". News-driven VOLATILE regimes frequently break out of the prior range and start new trends, rather than mean-reverting. Fading the extreme is how account blow-ups happen. The correct VOLATILE action is reduce size, step back, wait for regime to normalize before re-engaging (section 13).',
  },
];

// ============================================================
// CANVAS ANIMATION PRIMITIVE
// Shared across all animation components — consistent scroll-play behavior
// Only animates when visible (IntersectionObserver), pauses when off-screen
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

  // Animation loop
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
// ANIMATION 1 — RegimeForecasterAnim (S01 Groundbreaking Concept)
// The 4-scene cycle from the HTML preview, inlined as canvas
// Shows: naive view → CIPHER view → probability rising → transition fires
// ============================================================
function RegimeForecasterAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    // 4-scene cycle, 4.2s per scene = 16.8s total loop
    const cycleT = t % 16.8;
    const sceneIdx = Math.floor(cycleT / 4.2);
    const sceneT = (cycleT % 4.2) / 4.2; // 0..1 within scene

    // Colors
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';
    const WHITE = '#FFFFFF';

    // Scene data
    const scenes = [
      { duration: '—', avg: '—', prob: 0, probLabel: '—', next: '—', ccValue: 'TREND', ccColor: TEAL, ccAction: '→ TREND INTACT', actionColor: TEAL, title: 'NAIVE VIEW' },
      { duration: '23 bars', avg: '35 bars', prob: 24, probLabel: '24%', next: 'RANGE', ccValue: 'TREND', ccColor: TEAL, ccAction: '→ TREND INTACT', actionColor: TEAL, title: 'CIPHER VIEW' },
      { duration: '42 bars', avg: '35 bars', prob: 72, probLabel: '72%', next: 'RANGE', ccValue: 'TREND', ccColor: TEAL, ccAction: '→ RANGE FORMING', actionColor: AMBER, title: 'PROBABILITY RISING' },
      { duration: '3 bars', avg: '28 bars', prob: 5, probLabel: '5%', next: 'TREND', ccValue: 'RANGE', ccColor: AMBER, ccAction: '→ RANGE HOLDING', actionColor: AMBER, title: 'TRANSITION FIRED' },
    ];
    const s = scenes[sceneIdx];

    // Header — scene title
    ctx.fillStyle = 'rgba(245,158,11,0.7)';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`SCENE ${sceneIdx + 1} · ${s.title}`, 20, 24);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${String(sceneIdx + 1).padStart(2, '0')} / 04`, w - 20, 24);

    // Timeline (top portion)
    const tlY = 42;
    const tlH = 28;
    const tlX = 20;
    const tlW = w - 40;

    // Timeline background
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(tlX, tlY, tlW, tlH);

    // Timeline segments per scene
    const timelines = [
      [{ r: 'range', b: 12 }, { r: 'trend', b: 30 }, { r: 'volatile', b: 5 }, { r: 'range', b: 18 }, { r: 'trend', b: 15 }],
      [{ r: 'trend', b: 30 }, { r: 'volatile', b: 5 }, { r: 'range', b: 18 }, { r: 'trend', b: 23 }],
      [{ r: 'volatile', b: 5 }, { r: 'range', b: 18 }, { r: 'trend', b: 42 }],
      [{ r: 'volatile', b: 5 }, { r: 'range', b: 18 }, { r: 'trend', b: 48 }, { r: 'range', b: 3 }],
    ];
    const segs = timelines[sceneIdx];
    const totalBars = segs.reduce((sum, x) => sum + x.b, 0);
    let runX = tlX;
    segs.forEach((seg, i) => {
      const segW = (seg.b / totalBars) * tlW;
      const isCurrent = i === segs.length - 1;
      const color = seg.r === 'trend' ? TEAL : seg.r === 'range' ? AMBER : MAGENTA;
      const alpha = isCurrent ? 0.45 : 0.28;
      ctx.fillStyle = `${color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;
      ctx.fillRect(runX, tlY, segW, tlH);
      // Label inside segment
      if (segW > 40) {
        ctx.fillStyle = color;
        ctx.font = `bold 10px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(seg.r.toUpperCase(), runX + segW / 2, tlY + 18);
      }
      runX += segW;
    });

    // NOW marker
    ctx.fillStyle = WHITE;
    ctx.fillRect(tlX + tlW - 1, tlY - 4, 2, tlH + 8);
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('NOW', tlX + tlW, tlY - 8);

    // ── Panels row ──
    const pY = tlY + tlH + 24;
    const pH = 58;
    const pGap = 12;
    const pW = (tlW - pGap) / 2;

    // Duration panel (left)
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.fillRect(tlX, pY, pW, pH);
    ctx.strokeRect(tlX, pY, pW, pH);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('CURRENT DURATION', tlX + 12, pY + 16);
    ctx.fillStyle = WHITE;
    ctx.font = 'bold 22px "SF Mono", monospace';
    ctx.fillText(s.duration, tlX + 12, pY + 40);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText(`Avg historical: ${s.avg}`, tlX + 12, pY + 54);

    // Probability panel (right)
    const pX2 = tlX + pW + pGap;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(pX2, pY, pW, pH);
    ctx.strokeRect(pX2, pY, pW, pH);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.fillText('PROBABILITY OF SHIFT', pX2 + 12, pY + 16);
    const probColor = s.prob >= 60 ? AMBER : TEAL;
    ctx.fillStyle = WHITE;
    ctx.font = 'bold 22px "SF Mono", monospace';
    ctx.fillText(s.probLabel, pX2 + 12, pY + 40);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText(`Most likely next: ${s.next}`, pX2 + 12, pY + 54);
    // Prob bar
    const barY = pY + pH - 6;
    const barX = pX2 + 12;
    const barW = pW - 24;
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(barX, barY, barW, 4);
    // Eased prob bar within scene
    const probEased = s.prob * Math.min(1, sceneT * 2);
    ctx.fillStyle = probColor;
    ctx.fillRect(barX, barY, (probEased / 100) * barW, 4);

    // ── CC row preview ──
    const ccY = pY + pH + 16;
    const ccH = 38;
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(tlX, ccY, tlW, ccH);
    ctx.strokeRect(tlX, ccY, tlW, ccH);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '13px "SF Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Regime', tlX + 14, ccY + 24);
    ctx.fillStyle = s.ccColor;
    ctx.font = 'bold 13px "SF Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(s.ccValue, tlX + tlW * 0.5, ccY + 24);
    ctx.fillStyle = s.actionColor;
    ctx.font = '13px "SF Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(s.ccAction, tlX + tlW * 0.8, ccY + 24);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 2 — RegimeTriptychAnim (S02)
// Three side-by-side chart snippets: TREND bars / RANGE chop / VOLATILE spike
// Each with labeled regime pill
// ============================================================
function RegimeTriptychAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';
    const padX = 20;
    const padTop = 20;
    const gap = 12;
    const panelW = (w - padX * 2 - gap * 2) / 3;
    const panelH = h - padTop - 40;

    // Panel 1: TREND — rising staircase of bars
    const drawPanel = (x: number, regime: 'TREND' | 'RANGE' | 'VOLATILE', color: string) => {
      // Panel background
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(x, padTop, panelW, panelH);
      ctx.strokeStyle = `${color}33`;
      ctx.lineWidth = 1;
      ctx.strokeRect(x, padTop, panelW, panelH);

      // Regime pill
      const pillY = padTop + 10;
      ctx.fillStyle = `${color}22`;
      ctx.strokeStyle = `${color}66`;
      const pillW = 84;
      const pillH = 18;
      const pillX = x + (panelW - pillW) / 2;
      ctx.fillRect(pillX, pillY, pillW, pillH);
      ctx.strokeRect(pillX, pillY, pillW, pillH);
      ctx.fillStyle = color;
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(regime, x + panelW / 2, pillY + 12);

      // Chart area
      const cX = x + 10;
      const cY = padTop + 40;
      const cW = panelW - 20;
      const cH = panelH - 50;

      // Baseline
      const midY = cY + cH / 2;

      const BAR_W = 5;
      const bars = Math.floor(cW / (BAR_W + 1.5));

      if (regime === 'TREND') {
        // Rising staircase — teal bars stepping up
        for (let i = 0; i < bars; i++) {
          const progress = i / bars;
          const barX = cX + i * (BAR_W + 1.5);
          const tNow = t + i * 0.1;
          // Gentle up-trend with some noise
          const offset = Math.sin(tNow * 0.5 + i) * 3;
          const barH = Math.max(4, 10 + progress * 35 + offset);
          const direction = Math.sin(tNow * 0.3 + i * 0.5) > -0.3 ? 1 : -1;
          const actualH = Math.abs(barH) * direction > 0 ? barH : barH * 0.7;
          const barY = midY - actualH / 2;
          const barColor = direction > 0 ? TEAL : MAGENTA;
          ctx.fillStyle = direction > 0 ? `${TEAL}cc` : `${MAGENTA}aa`;
          // Shift whole staircase up as time passes
          const riseOffset = progress * 28;
          ctx.fillRect(barX, barY - riseOffset, BAR_W, actualH);
        }
      } else if (regime === 'RANGE') {
        // Sideways chop — alternating teal/magenta bars of similar height
        for (let i = 0; i < bars; i++) {
          const barX = cX + i * (BAR_W + 1.5);
          const tNow = t + i * 0.2;
          const barH = 14 + Math.sin(tNow * 1.5 + i * 0.7) * 8;
          const direction = Math.sin(tNow * 1.2 + i * 1.1) > 0 ? 1 : -1;
          const barY = midY - barH / 2 + Math.sin(tNow * 0.8 + i) * 6;
          ctx.fillStyle = direction > 0 ? `${TEAL}aa` : `${MAGENTA}99`;
          ctx.fillRect(barX, barY, BAR_W, barH);
        }
        // Range boundary lines
        ctx.strokeStyle = `${AMBER}66`;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(cX, midY - 20);
        ctx.lineTo(cX + cW, midY - 20);
        ctx.moveTo(cX, midY + 20);
        ctx.lineTo(cX + cW, midY + 20);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        // VOLATILE — erratic huge bars with magenta dominance
        for (let i = 0; i < bars; i++) {
          const barX = cX + i * (BAR_W + 1.5);
          const tNow = t + i * 0.3;
          // Random-feeling huge bars
          const barH = 14 + Math.abs(Math.sin(tNow * 2.3 + i * 1.7)) * 45 + Math.abs(Math.cos(tNow * 3.1 + i)) * 12;
          const direction = Math.sin(tNow * 2.8 + i * 0.9) > 0 ? 1 : -1;
          const barY = midY - barH / 2 + Math.sin(tNow * 1.5 + i * 2) * 4;
          ctx.fillStyle = direction > 0 ? `${TEAL}cc` : `${MAGENTA}cc`;
          ctx.fillRect(barX, barY, BAR_W, barH);
        }
      }
    };

    drawPanel(padX, 'TREND', TEAL);
    drawPanel(padX + panelW + gap, 'RANGE', AMBER);
    drawPanel(padX + (panelW + gap) * 2, 'VOLATILE', MAGENTA);

    // Bottom labels
    const labelY = h - 14;
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ADX-driven', padX + panelW / 2, labelY);
    ctx.fillText('Everything else', padX + panelW + gap + panelW / 2, labelY);
    ctx.fillText('ATR spike > 1.5×', padX + (panelW + gap) * 2 + panelW / 2, labelY);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 3 — ThreeScoreAnim (S03)
// Three racing gauges showing trend_pct / volatile_pct / range_pct
// Tallest bar wins — regime determination visualized
// ============================================================
function ThreeScoreAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';

    // 3-scene cycle showing different regime outcomes
    const cycleT = t % 12;
    const sceneIdx = Math.floor(cycleT / 4);
    const sceneT = (cycleT % 4) / 4;

    // Scenes: [trend, volatile, range] target values, winner label
    const scenes = [
      { targets: [82, 12, 6],  winner: 'TREND',    color: TEAL },
      { targets: [8,  72, 20], winner: 'VOLATILE', color: MAGENTA },
      { targets: [18, 6,  76], winner: 'RANGE',    color: AMBER },
    ];
    const s = scenes[sceneIdx];

    // Eased animation — bars grow from 0 to target during first 60% of scene
    const growT = Math.min(1, sceneT * 1.7);
    const growEased = 1 - Math.pow(1 - growT, 3);

    // Layout: three vertical bars in center
    const barCount = 3;
    const barW = 70;
    const barGap = 32;
    const totalW = barCount * barW + (barCount - 1) * barGap;
    const startX = (w - totalW) / 2;
    const baseY = h - 60;
    const maxBarH = h - 100;

    const labels = ['TREND', 'VOLATILE', 'RANGE'];
    const colors = [TEAL, MAGENTA, AMBER];

    // Header
    ctx.fillStyle = 'rgba(245,158,11,0.7)';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THREE SCORES RACE — TALLEST WINS', w / 2, 22);

    for (let i = 0; i < barCount; i++) {
      const x = startX + i * (barW + barGap);
      const val = s.targets[i] * growEased;
      const barH = (val / 100) * maxBarH;
      const y = baseY - barH;

      // Bar background track
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.fillRect(x, baseY - maxBarH, barW, maxBarH);

      // Bar fill
      const isWinner = labels[i] === s.winner && sceneT > 0.6;
      ctx.fillStyle = isWinner ? colors[i] : `${colors[i]}99`;
      ctx.fillRect(x, y, barW, barH);

      // Winner glow
      if (isWinner) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = colors[i];
        ctx.fillStyle = colors[i];
        ctx.fillRect(x, y, barW, barH);
        ctx.shadowBlur = 0;
      }

      // Value label on top
      ctx.fillStyle = colors[i];
      ctx.font = 'bold 14px "SF Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(Math.round(val) + '%', x + barW / 2, y - 8);

      // Bottom label
      ctx.fillStyle = isWinner ? colors[i] : 'rgba(255,255,255,0.6)';
      ctx.font = `${isWinner ? 'bold ' : ''}11px Inter, sans-serif`;
      ctx.fillText(labels[i], x + barW / 2, baseY + 18);

      // Winner badge
      if (isWinner) {
        const badgeY = baseY + 32;
        ctx.fillStyle = colors[i];
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.fillText('← WINNER', x + barW / 2, badgeY);
      }
    }

    // Verdict strip at bottom
    const verdictY = baseY + 48;
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    if (sceneT > 0.6) {
      ctx.fillStyle = s.color;
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillText(`Regime = ${s.winner}`, w / 2, verdictY);
    }
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 4 — ADXScaleAnim (S04)
// ADX needle swinging 0 → 40+ with trend_pct readout
// Shows: trend_pct = min(100, ADX × 2.5)
// ============================================================
function ADXScaleAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';

    const cx = w / 2;
    const cy = h * 0.62;
    const r = Math.min(w, h) * 0.38;

    // Oscillating ADX value — smooth between 0 and 50
    const adxVal = 25 + Math.sin(t * 0.6) * 20 + Math.sin(t * 1.2) * 5;
    const clampedAdx = Math.max(0, Math.min(50, adxVal));
    const trendPct = Math.min(100, clampedAdx * 2.5);

    // Arc background (0 to 180 deg, mapped to ADX 0 to 50)
    ctx.save();
    ctx.translate(cx, cy);

    // Outer arc — segmented by meaning
    const segments = [
      { from: 0, to: 15, color: 'rgba(239,83,80,0.35)', label: 'CHOP' },      // 0-15 = chop
      { from: 15, to: 25, color: 'rgba(255,179,0,0.35)', label: 'BUILDING' },  // 15-25
      { from: 25, to: 50, color: 'rgba(38,166,154,0.35)', label: 'TREND' },    // 25+ = trend
    ];

    const adxToAngle = (v: number) => Math.PI + (v / 50) * Math.PI;

    segments.forEach((seg) => {
      ctx.beginPath();
      ctx.arc(0, 0, r, adxToAngle(seg.from), adxToAngle(seg.to));
      ctx.lineWidth = 22;
      ctx.strokeStyle = seg.color;
      ctx.stroke();
    });

    // Tick marks
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1;
    for (let v = 0; v <= 50; v += 10) {
      const angle = adxToAngle(v);
      const x1 = Math.cos(angle) * (r - 16);
      const y1 = Math.sin(angle) * (r - 16);
      const x2 = Math.cos(angle) * (r - 6);
      const y2 = Math.sin(angle) * (r - 6);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      // Tick label
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = '10px "SF Mono", monospace';
      ctx.textAlign = 'center';
      const lx = Math.cos(angle) * (r + 14);
      const ly = Math.sin(angle) * (r + 14);
      ctx.fillText(String(v), lx, ly + 3);
    }

    // Needle
    const needleAngle = adxToAngle(clampedAdx);
    const needleColor = clampedAdx < 15 ? MAGENTA : clampedAdx < 25 ? AMBER : TEAL;
    ctx.strokeStyle = needleColor;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 12;
    ctx.shadowColor = needleColor;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(needleAngle) * (r - 24), Math.sin(needleAngle) * (r - 24));
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Center hub
    ctx.fillStyle = needleColor;
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Top labels
    ctx.fillStyle = 'rgba(245,158,11,0.7)';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ADX → trend_pct = min(100, ADX × 2.5)', w / 2, 22);

    // Value readouts — under gauge
    const rY = cy + r * 0.5 + 18;
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.fillText('ADX', cx - 80, rY);
    ctx.fillStyle = needleColor;
    ctx.font = 'bold 26px "SF Mono", monospace';
    ctx.fillText(clampedAdx.toFixed(1), cx - 80, rY + 26);

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.fillText('trend_pct', cx + 80, rY);
    const trendColor = trendPct >= 75 ? TEAL : trendPct >= 50 ? AMBER : MAGENTA;
    ctx.fillStyle = trendColor;
    ctx.font = 'bold 26px "SF Mono", monospace';
    ctx.fillText(Math.round(trendPct).toString(), cx + 80, rY + 26);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 5 — ATRSpikeAnim (S05)
// Animated ATR (fast) vs ATR_slow (50-bar avg) with 1.5× and 2.0× thresholds
// Shows how volatile_pct ramps from zero → 100 as vol_spike crosses thresholds
// ============================================================
function ATRSpikeAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';

    // Layout — left chart panel, right readout panel
    const chartW = w * 0.62;
    const chartH = h - 60;
    const chartX = 20;
    const chartY = 40;
    const readoutX = chartW + 36;
    const readoutW = w - readoutX - 20;

    // Header
    ctx.fillStyle = 'rgba(245,158,11,0.7)';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ATR SPIKE DETECTION — vol_spike = atr / atr_slow', w / 2, 22);

    // Chart background
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(chartX, chartY, chartW, chartH);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.strokeRect(chartX, chartY, chartW, chartH);

    // ATR_slow = flat line at mid-height
    const atrSlowY = chartY + chartH * 0.65;
    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(chartX + 5, atrSlowY);
    ctx.lineTo(chartX + chartW - 5, atrSlowY);
    ctx.stroke();
    ctx.setLineDash([]);

    // 1.5× threshold (amber) — ATR at 1.5× ATR_slow means 0.65×0.65 of height minus 35%
    const atrUnit = chartH * 0.25; // 1× ATR_slow vertical distance from slow line to "peak 2×"
    const thresh15Y = atrSlowY - atrUnit * 0.5;
    const thresh20Y = atrSlowY - atrUnit * 1.0;

    ctx.strokeStyle = `${AMBER}77`;
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(chartX + 5, thresh15Y);
    ctx.lineTo(chartX + chartW - 5, thresh15Y);
    ctx.stroke();

    ctx.strokeStyle = `${MAGENTA}88`;
    ctx.beginPath();
    ctx.moveTo(chartX + 5, thresh20Y);
    ctx.lineTo(chartX + chartW - 5, thresh20Y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Threshold labels
    ctx.font = '9px "SF Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fillText('ATR_slow (1.0×)', chartX + chartW - 85, atrSlowY - 4);
    ctx.fillStyle = AMBER;
    ctx.fillText('1.5×', chartX + chartW - 30, thresh15Y - 3);
    ctx.fillStyle = MAGENTA;
    ctx.fillText('2.0×', chartX + chartW - 30, thresh20Y - 3);

    // Animated ATR (fast) line — drawn from left→right as scrolling wave
    // Cycle: calm → spike up crossing 1.5× → continue to 2.0× → descent
    const cyclePeriod = 10;
    const phase = (t % cyclePeriod) / cyclePeriod;

    const points: { x: number; y: number; spike: number }[] = [];
    const samples = 80;
    for (let i = 0; i < samples; i++) {
      const sampleProgress = i / (samples - 1);
      const x = chartX + 5 + sampleProgress * (chartW - 10);
      // Generate ATR multiple value (1.0 = baseline, 2.0 = extreme)
      // Base wobble + one big spike centered at phase × samples
      const localT = sampleProgress * cyclePeriod - (t % cyclePeriod);
      const base = 1.0 + Math.sin(sampleProgress * 9 + t * 0.7) * 0.08; // gentle noise
      // Spike that moves across
      const spikeCenter = phase * (samples - 1);
      const distFromSpike = Math.abs(i - spikeCenter);
      const spikeBoost = Math.max(0, (12 - distFromSpike) / 12) * 1.05;
      // Double-hump spike for drama
      const spike2 = Math.max(0, (6 - distFromSpike) / 6) * 0.3;
      const atrMult = base + spikeBoost + spike2;
      // Clamp to display range [0.7, 2.2]
      const clamped = Math.max(0.7, Math.min(2.2, atrMult));
      // Map to y (ATR_slow at clamped=1.0, 2.0× at thresh20Y)
      const yFactor = (clamped - 1.0) / 1.0; // 0 at 1×, 1 at 2×
      const y = atrSlowY - yFactor * atrUnit;
      points.push({ x, y, spike: clamped });
    }

    // Fill under ATR line — amber tint above 1.5, magenta tint above 2.0
    ctx.beginPath();
    ctx.moveTo(points[0].x, atrSlowY);
    points.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, atrSlowY);
    ctx.closePath();
    ctx.fillStyle = `${AMBER}22`;
    ctx.fill();

    // ATR line itself — color segments by spike value
    for (let i = 1; i < points.length; i++) {
      const p1 = points[i - 1];
      const p2 = points[i];
      const avgSpike = (p1.spike + p2.spike) / 2;
      const color = avgSpike >= 2.0 ? MAGENTA : avgSpike >= 1.5 ? AMBER : TEAL;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.shadowBlur = avgSpike >= 1.5 ? 6 : 0;
      ctx.shadowColor = color;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;

    // Current vol_spike (at last point = NOW)
    const nowSpike = points[points.length - 1].spike;
    let volatilePct = 0;
    if (nowSpike > 2.0) volatilePct = 100;
    else if (nowSpike > 1.5) volatilePct = (nowSpike - 1.0) * 100;

    // Readout panel
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(readoutX, chartY, readoutW, chartH);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.strokeRect(readoutX, chartY, readoutW, chartH);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('VOL_SPIKE', readoutX + 14, chartY + 18);

    const spikeColor = nowSpike >= 2.0 ? MAGENTA : nowSpike >= 1.5 ? AMBER : TEAL;
    ctx.fillStyle = spikeColor;
    ctx.font = 'bold 26px "SF Mono", monospace';
    ctx.fillText(nowSpike.toFixed(2) + '×', readoutX + 14, chartY + 48);

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath();
    ctx.moveTo(readoutX + 14, chartY + 64);
    ctx.lineTo(readoutX + readoutW - 14, chartY + 64);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.fillText('VOLATILE_PCT', readoutX + 14, chartY + 80);

    ctx.fillStyle = spikeColor;
    ctx.font = 'bold 26px "SF Mono", monospace';
    ctx.fillText(Math.round(volatilePct).toString(), readoutX + 14, chartY + 110);

    // State label
    const stateLabel = nowSpike >= 2.0 ? 'EXTREME' : nowSpike >= 1.5 ? 'SPIKE' : 'CALM';
    ctx.fillStyle = spikeColor;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText(stateLabel, readoutX + 14, chartY + 130);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 6 — RangeResidualAnim (S06)
// Three cups being filled; RANGE gets what's left over
// Visualizes: range_pct = max(0, 100 − trend_pct − volatile_pct)
// ============================================================
function RangeResidualAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';

    // 3-scene cycle showing different fill configurations
    const cycleT = t % 12;
    const sceneIdx = Math.floor(cycleT / 4);
    const sceneT = (cycleT % 4) / 4;

    const scenes = [
      { trend: 60, volatile: 10, label: 'Moderate trend + quiet — RANGE still gets 30%' },
      { trend: 20, volatile: 65, label: 'Volatility spike dominates — RANGE gets 15%' },
      { trend: 25, volatile: 5,  label: 'Calm + weak trend — RANGE gets 70% (wins)' },
    ];
    const s = scenes[sceneIdx];
    const range = Math.max(0, 100 - s.trend - s.volatile);
    const winner = s.trend >= range && s.trend >= s.volatile ? 'TREND' : s.volatile >= range ? 'VOLATILE' : 'RANGE';

    // Eased fill
    const fillT = Math.min(1, sceneT * 1.7);
    const eased = 1 - Math.pow(1 - fillT, 3);

    // Header
    ctx.fillStyle = 'rgba(245,158,11,0.7)';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('range_pct = max(0, 100 − trend_pct − volatile_pct)', w / 2, 22);

    // Three cups
    const cupW = 110;
    const cupH = h * 0.48;
    const cupGap = 40;
    const totalCupsW = cupW * 3 + cupGap * 2;
    const cupsStartX = (w - totalCupsW) / 2;
    const cupTopY = 50;

    const labels = ['TREND', 'VOLATILE', 'RANGE'];
    const colors = [TEAL, MAGENTA, AMBER];
    const values = [s.trend, s.volatile, range];

    for (let i = 0; i < 3; i++) {
      const cx = cupsStartX + i * (cupW + cupGap);
      const isWinner = labels[i] === winner && sceneT > 0.6;

      // Cup outline
      ctx.strokeStyle = isWinner ? colors[i] : 'rgba(255,255,255,0.2)';
      ctx.lineWidth = isWinner ? 2 : 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, cupTopY);
      ctx.lineTo(cx, cupTopY + cupH);
      ctx.lineTo(cx + cupW, cupTopY + cupH);
      ctx.lineTo(cx + cupW, cupTopY);
      ctx.stroke();

      // Fill
      const fillVal = values[i] * eased;
      const fillH = (fillVal / 100) * cupH;
      const fillY = cupTopY + cupH - fillH;

      ctx.fillStyle = `${colors[i]}aa`;
      ctx.fillRect(cx + 2, fillY, cupW - 4, fillH);

      // Wavy top liquid effect
      ctx.strokeStyle = colors[i];
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let px = 0; px < cupW - 4; px += 2) {
        const waveY = fillY + Math.sin(px * 0.2 + t * 3 + i) * 1.5;
        if (px === 0) ctx.moveTo(cx + 2 + px, waveY);
        else ctx.lineTo(cx + 2 + px, waveY);
      }
      ctx.stroke();

      // Winner glow
      if (isWinner) {
        ctx.shadowBlur = 18;
        ctx.shadowColor = colors[i];
        ctx.strokeStyle = colors[i];
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cupTopY);
        ctx.lineTo(cx, cupTopY + cupH);
        ctx.moveTo(cx + cupW, cupTopY);
        ctx.lineTo(cx + cupW, cupTopY + cupH);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Value on top
      ctx.fillStyle = colors[i];
      ctx.font = 'bold 18px "SF Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(Math.round(fillVal) + '%', cx + cupW / 2, cupTopY - 10);

      // Label below
      ctx.fillStyle = isWinner ? colors[i] : 'rgba(255,255,255,0.6)';
      ctx.font = `${isWinner ? 'bold ' : ''}12px Inter, sans-serif`;
      ctx.fillText(labels[i], cx + cupW / 2, cupTopY + cupH + 22);

      // WINNER badge
      if (isWinner) {
        ctx.fillStyle = colors[i];
        ctx.font = 'bold 9px Inter, sans-serif';
        ctx.fillText('← REGIME', cx + cupW / 2, cupTopY + cupH + 40);
      }
    }

    // Caption at bottom
    const captY = h - 14;
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    if (sceneT > 0.7) ctx.fillText(s.label, w / 2, captY);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 7 — TieBreakAnim (S07)
// Three tie scenarios: T=V, V=R, T=R — showing priority resolution
// ============================================================
function TieBreakAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';

    // 3 tie scenarios + a normal case, 4.5s each
    const cycleT = t % 18;
    const sceneIdx = Math.floor(cycleT / 4.5);
    const sceneT = (cycleT % 4.5) / 4.5;

    const scenes = [
      { trend: 45, volatile: 45, range: 10, winner: 'TREND',    why: 'trend_pct ≥ volatile_pct → TREND wins' },
      { trend: 20, volatile: 40, range: 40, winner: 'VOLATILE', why: 'volatile_pct ≥ range_pct → VOLATILE wins' },
      { trend: 40, volatile: 20, range: 40, winner: 'TREND',    why: 'trend_pct ≥ range_pct → TREND wins' },
      { trend: 30, volatile: 10, range: 60, winner: 'RANGE',    why: 'range_pct strictly largest → RANGE wins' },
    ];
    const s = scenes[sceneIdx];

    // Header
    ctx.fillStyle = 'rgba(245,158,11,0.7)';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PRIORITY: TREND > VOLATILE > RANGE', w / 2, 22);

    // Three horizontal bars
    const labels = ['TREND', 'VOLATILE', 'RANGE'];
    const colors = [TEAL, MAGENTA, AMBER];
    const values = [s.trend, s.volatile, s.range];

    const barH = 36;
    const gap = 14;
    const barMaxW = w * 0.55;
    const startX = (w - barMaxW) / 2;
    const startY = 60;

    const growT = Math.min(1, sceneT * 1.8);

    for (let i = 0; i < 3; i++) {
      const y = startY + i * (barH + gap);
      const isWinner = labels[i] === s.winner && sceneT > 0.55;

      // Track
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.fillRect(startX, y, barMaxW, barH);

      // Bar
      const barVal = values[i] * growT;
      const barFillW = (barVal / 100) * barMaxW;
      ctx.fillStyle = isWinner ? colors[i] : `${colors[i]}88`;
      ctx.fillRect(startX, y, barFillW, barH);

      // Glow on winner
      if (isWinner) {
        ctx.shadowBlur = 14;
        ctx.shadowColor = colors[i];
        ctx.fillRect(startX, y, barFillW, barH);
        ctx.shadowBlur = 0;
      }

      // Label (left)
      ctx.fillStyle = isWinner ? colors[i] : 'rgba(255,255,255,0.7)';
      ctx.font = `${isWinner ? 'bold ' : ''}13px Inter, sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillText(labels[i], startX - 10, y + barH / 2 + 4);

      // Value (right of bar)
      ctx.fillStyle = colors[i];
      ctx.font = 'bold 14px "SF Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(Math.round(barVal) + '%', startX + barFillW + 8, y + barH / 2 + 4);

      // WINNER badge
      if (isWinner) {
        ctx.fillStyle = colors[i];
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.fillText('★ WINNER', startX + barFillW + 70, y + barH / 2 + 4);
      }
    }

    // Verdict box
    const vY = startY + 3 * (barH + gap) + 8;
    ctx.fillStyle = 'rgba(245,158,11,0.08)';
    ctx.strokeStyle = 'rgba(245,158,11,0.25)';
    ctx.fillRect(startX, vY, barMaxW, 38);
    ctx.strokeRect(startX, vY, barMaxW, 38);
    if (sceneT > 0.6) {
      ctx.fillStyle = 'rgba(245,158,11,0.9)';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(s.why, startX + barMaxW / 2, vY + 24);
    }
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 8 — RTPTimelineAnim (S08)
// The Regime Transition Predictor in action
// Shows duration tracking, historical-average bar, sigmoid probability curve
// ============================================================
function RTPTimelineAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';

    // Current regime oscillates: TREND for 12s cycle, probability rising
    // Each cycle: duration 0 → 60 bars, avg = 35, probability follows sigmoid
    const cyclePeriod = 14;
    const cycleT = t % cyclePeriod;
    const duration = (cycleT / cyclePeriod) * 60;
    const avg = 35;
    const ratio = duration / avg;
    // sigmoid(−3.5 × (ratio − 1.0))
    const prob = Math.max(5, Math.min(95, 100 / (1 + Math.exp(-3.5 * (ratio - 1.0)))));

    // Header
    ctx.fillStyle = 'rgba(245,158,11,0.7)';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SIGMOID PROBABILITY — at avg, prob ≈ 50% — past avg, rises steeply', w / 2, 22);

    // Main sigmoid chart area
    const chartX = 50;
    const chartY = 46;
    const chartW = w - 100;
    const chartH = h * 0.42;

    // Axes
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(chartX, chartY);
    ctx.lineTo(chartX, chartY + chartH);
    ctx.lineTo(chartX + chartW, chartY + chartH);
    ctx.stroke();

    // Y-axis labels (0, 50, 100)
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '9px "SF Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText('100%', chartX - 6, chartY + 4);
    ctx.fillText('50%', chartX - 6, chartY + chartH / 2 + 3);
    ctx.fillText('0%', chartX - 6, chartY + chartH + 3);

    // X-axis labels (0, avg, 2× avg)
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fillText('0', chartX, chartY + chartH + 12);
    ctx.fillText('avg', chartX + chartW / 2, chartY + chartH + 12);
    ctx.fillText('2× avg', chartX + chartW, chartY + chartH + 12);

    // Vertical average line
    ctx.strokeStyle = `${AMBER}88`;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(chartX + chartW / 2, chartY);
    ctx.lineTo(chartX + chartW / 2, chartY + chartH);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw sigmoid curve
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const steps = 100;
    for (let i = 0; i <= steps; i++) {
      const prog = i / steps; // 0..1 mapping to 0..2×avg
      const r = prog * 2;
      const p = 100 / (1 + Math.exp(-3.5 * (r - 1.0)));
      const x = chartX + prog * chartW;
      const y = chartY + chartH - (p / 100) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Animated marker at current position
    const markerRatio = Math.min(2, ratio); // clamp for display
    const markerX = chartX + (markerRatio / 2) * chartW;
    const markerY = chartY + chartH - (prob / 100) * chartH;

    // Glow trail
    ctx.shadowBlur = 16;
    const markerColor = prob >= 75 ? MAGENTA : prob >= 50 ? AMBER : TEAL;
    ctx.shadowColor = markerColor;
    ctx.fillStyle = markerColor;
    ctx.beginPath();
    ctx.arc(markerX, markerY, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Vertical drop line from marker
    ctx.strokeStyle = `${markerColor}66`;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(markerX, markerY);
    ctx.lineTo(markerX, chartY + chartH);
    ctx.stroke();
    ctx.setLineDash([]);

    // Readout row at bottom
    const readY = chartY + chartH + 30;
    const readH = 56;
    const readSlotW = (w - 60) / 3;

    const readouts = [
      { label: 'DURATION',   val: Math.round(duration) + ' bars', color: TEAL },
      { label: 'HISTORIC AVG', val: avg + ' bars',               color: 'rgba(255,255,255,0.7)' },
      { label: 'PROBABILITY', val: Math.round(prob) + '%',        color: markerColor },
    ];

    readouts.forEach((r, i) => {
      const rx = 30 + i * readSlotW;
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(rx, readY, readSlotW - 12, readH);
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.strokeRect(rx, readY, readSlotW - 12, readH);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(r.label, rx + 12, readY + 16);
      ctx.fillStyle = r.color;
      ctx.font = 'bold 20px "SF Mono", monospace';
      ctx.fillText(r.val, rx + 12, readY + 42);
    });
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 9 — RegimeRowAnim (S09)
// Command Center row replay — cycling through your actual screenshots states
// Header + Regime row together, shows TREND / RANGE / VOLATILE / transition
// ============================================================
function RegimeRowAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';

    // 5 scenes from real screenshots + synthesized VOLATILE
    const cycleT = t % 20;
    const sceneIdx = Math.floor(cycleT / 4);
    const sceneT = (cycleT % 4) / 4;

    const scenes = [
      {
        hdrState: '▲ BULL TREND',  hdrColor: TEAL,
        hdrAction: '→ TREND INTACT', hdrActionColor: TEAL,
        regime: 'TREND', regimeColor: TEAL,
        regimeGuide: '→ TREND INTACT', guideColor: TEAL,
        caption: 'TREND — young, healthy, intact',
      },
      {
        hdrState: '↔ RANGING',    hdrColor: AMBER,
        hdrAction: '→ COILING',     hdrActionColor: AMBER,
        regime: 'RANGE', regimeColor: AMBER,
        regimeGuide: '→ RANGE HOLDING', guideColor: AMBER,
        caption: 'RANGE — undirectional, coiling for breakout',
      },
      {
        hdrState: '⚡ VOLATILE',  hdrColor: MAGENTA,
        hdrAction: '→ REDUCE SIZE', hdrActionColor: MAGENTA,
        regime: 'VOLATILE', regimeColor: MAGENTA,
        regimeGuide: '→ STAY CAUTIOUS', guideColor: MAGENTA,
        caption: 'VOLATILE — ATR spike, market dislocating',
      },
      {
        hdrState: '▼ BEAR TREND',  hdrColor: MAGENTA,
        hdrAction: '→ TREND CURVING', hdrActionColor: MAGENTA,
        regime: 'TREND', regimeColor: TEAL,
        regimeGuide: '→ SHIFTING TO RANGE', guideColor: AMBER,
        caption: 'RTP FIRING — regime about to flip',
      },
      {
        hdrState: '↔ RANGING',    hdrColor: AMBER,
        hdrAction: '→ RIBBON COILED', hdrActionColor: AMBER,
        regime: 'RANGE', regimeColor: AMBER,
        regimeGuide: '→ SHIFTING TO TREND', guideColor: AMBER,
        caption: 'RTP FIRING — RANGE ending, TREND forming',
      },
    ];
    const s = scenes[sceneIdx];

    // Fade-in for new scene
    const alpha = Math.min(1, sceneT * 3);

    // Command Center panel frame
    const ccX = 30;
    const ccY = 40;
    const ccW = w - 60;
    const ccH = h - 80;

    ctx.globalAlpha = alpha;

    // Header bar (always on)
    const hdrH = 42;
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(ccX, ccY, ccW, hdrH);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.strokeRect(ccX, ccY, ccW, hdrH);

    // "CIPHER PRO" label
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('CIPHER PRO', ccX + 14, ccY + 26);

    // Header state
    ctx.fillStyle = s.hdrColor;
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(s.hdrState, ccX + ccW * 0.5, ccY + 26);

    // Header action
    ctx.fillStyle = s.hdrActionColor;
    ctx.font = '13px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(s.hdrAction, ccX + ccW - 14, ccY + 26);

    // Gap
    const rowsStartY = ccY + hdrH + 4;

    // Stub rows (greyed out, just to show neighbors)
    const stubRows = ['Ribbon', 'Pulse', 'Momentum', '...', 'Session'];
    const rowH = 22;
    stubRows.forEach((lbl, i) => {
      const ry = rowsStartY + i * rowH;
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(ccX, ry, ccW, rowH);
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '11px "SF Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(lbl, ccX + 14, ry + 15);
      // Dashed out middle
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.textAlign = 'center';
      ctx.fillText('...', ccX + ccW * 0.5, ry + 15);
      ctx.textAlign = 'right';
      ctx.fillText('...', ccX + ccW - 14, ry + 15);
    });

    // The Regime row — highlighted
    const regimeRowY = rowsStartY + stubRows.length * rowH;
    const regRowH = 32;

    ctx.fillStyle = `${s.regimeColor}15`;
    ctx.fillRect(ccX, regimeRowY, ccW, regRowH);
    ctx.strokeStyle = s.regimeColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(ccX, regimeRowY, ccW, regRowH);
    ctx.lineWidth = 1;

    // Regime label
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = 'bold 12px "SF Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Regime', ccX + 14, regimeRowY + 21);

    // Regime value (center)
    ctx.fillStyle = s.regimeColor;
    ctx.font = 'bold 13px "SF Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(s.regime, ccX + ccW * 0.5, regimeRowY + 21);

    // Guidance (right)
    ctx.fillStyle = s.guideColor;
    ctx.font = 'bold 12px "SF Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(s.regimeGuide, ccX + ccW - 14, regimeRowY + 21);

    // Arrow pointer at left
    ctx.fillStyle = s.regimeColor;
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('◄', ccX - 18, regimeRowY + 22);

    // Caption
    ctx.globalAlpha = 1;
    const captY = regimeRowY + regRowH + 18;
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(s.caption, w / 2, captY);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 10 — CascadeFiveAnim (S10)
// The 5 downstream effects of regime: header / action / guidance / envelope / alerts
// Shows regime flipping in center, 5 consequence cards lighting up
// ============================================================
function CascadeFiveAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';

    // Regime cycles every 6 seconds
    const cycleT = t % 18;
    const sceneIdx = Math.floor(cycleT / 6);
    const sceneT = (cycleT % 6) / 6;

    const scenes = [
      { regime: 'TREND',    color: TEAL,    hdr: '▲ BULL TREND',  action: '→ RIDE IT',       guide: '→ TREND INTACT',    env: 'baseline',       alert: 'regime: TREND'    },
      { regime: 'RANGE',    color: AMBER,   hdr: '↔ RANGING',     action: '→ COILING',        guide: '→ RANGE HOLDING',   env: 'baseline',       alert: 'regime: RANGE'    },
      { regime: 'VOLATILE', color: MAGENTA, hdr: '⚡ VOLATILE',   action: '→ REDUCE SIZE',    guide: '→ STAY CAUTIOUS',   env: '+10% WIDER',     alert: 'regime: VOLATILE' },
    ];
    const s = scenes[sceneIdx];
    const activation = Math.min(1, sceneT * 2);

    // Header
    ctx.fillStyle = 'rgba(245,158,11,0.7)';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ONE REGIME FLIP → FIVE DOWNSTREAM EFFECTS', w / 2, 22);

    // Center regime bubble
    const cx = w / 2;
    const cy = h / 2;
    const bubbleR = 46;

    ctx.fillStyle = `${s.color}25`;
    ctx.strokeStyle = s.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, bubbleR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Pulse ring
    const pulsePhase = (t * 1.5) % 1;
    ctx.strokeStyle = `${s.color}${Math.round((1 - pulsePhase) * 160).toString(16).padStart(2, '0')}`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, bubbleR + pulsePhase * 30, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = s.color;
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillText(s.regime, cx, cy + 5);

    // 5 satellite cards positioned around the center
    type Card = { x: number; y: number; label: string; value: string; };
    const cards: Card[] = [
      { x: w * 0.18, y: h * 0.25, label: 'HEADER',        value: s.hdr },
      { x: w * 0.82, y: h * 0.25, label: 'ACTION CELL',   value: s.action },
      { x: w * 0.18, y: h * 0.75, label: 'GUIDANCE',      value: s.guide },
      { x: w * 0.82, y: h * 0.75, label: 'RISK ENV BANDS', value: s.env },
      { x: w * 0.5,  y: h * 0.88, label: 'ALERT JSON',    value: s.alert },
    ];

    // Draw connection lines (center → each card) first
    cards.forEach((card, i) => {
      const delay = i * 0.08;
      const lineAlpha = Math.max(0, Math.min(0.6, (activation - delay) * 2));
      if (lineAlpha <= 0) return;

      ctx.strokeStyle = `${s.color}${Math.round(lineAlpha * 255).toString(16).padStart(2, '0')}`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const dx = card.x - cx;
      const dy = card.y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const unitX = dx / dist;
      const unitY = dy / dist;
      ctx.moveTo(cx + unitX * bubbleR, cy + unitY * bubbleR);
      // Slight curve
      const midX = (cx + card.x) / 2 + unitY * 8;
      const midY = (cy + card.y) / 2 - unitX * 8;
      ctx.quadraticCurveTo(midX, midY, card.x, card.y);
      ctx.stroke();
    });

    // Draw cards
    cards.forEach((card, i) => {
      const delay = i * 0.08 + 0.1;
      const cardAlpha = Math.max(0, Math.min(1, (activation - delay) * 2));
      if (cardAlpha <= 0) return;

      ctx.globalAlpha = cardAlpha;
      const cardW = 142;
      const cardH = 42;
      const cx0 = card.x - cardW / 2;
      const cy0 = card.y - cardH / 2;

      ctx.fillStyle = `${s.color}22`;
      ctx.strokeStyle = `${s.color}aa`;
      ctx.lineWidth = 1;
      ctx.fillRect(cx0, cy0, cardW, cardH);
      ctx.strokeRect(cx0, cy0, cardW, cardH);

      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(card.label, card.x, card.y - 7);

      ctx.fillStyle = s.color;
      ctx.font = 'bold 11px "SF Mono", monospace';
      ctx.fillText(card.value, card.x, card.y + 12);

      ctx.globalAlpha = 1;
    });
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 11 — EnvelopeWideningAnim (S11)
// Side-by-side: identical price candles in TREND (baseline bands) vs VOLATILE (+10% wider)
// Shows how the Risk Envelope bands WIDEN when regime flips to VOLATILE
// ============================================================
function EnvelopeWideningAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const MAGENTA = '#EF5350';
    const AMBER = '#FFB300';

    const padX = 20;
    const padTop = 40;
    const gap = 16;
    const panelW = (w - padX * 2 - gap) / 2;
    const panelH = h - padTop - 30;

    // Header
    ctx.fillStyle = 'rgba(245,158,11,0.7)';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SAME PRICE ACTION — DIFFERENT REGIME — DIFFERENT BANDS', w / 2, 22);

    // Shared price path: generate once, draw twice
    const barCount = 32;
    const cyclePhase = t * 0.4;
    const prices: number[] = [];
    for (let i = 0; i < barCount; i++) {
      const base = Math.sin(i * 0.5 + cyclePhase) * 15 + Math.sin(i * 0.3) * 8 + Math.cos(i * 1.1 + cyclePhase * 0.5) * 5;
      prices.push(base);
    }

    const drawPanel = (x: number, regimeLabel: string, regimeColor: string, bandMult: number) => {
      // Panel bg
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(x, padTop, panelW, panelH);
      ctx.strokeStyle = `${regimeColor}44`;
      ctx.lineWidth = 1;
      ctx.strokeRect(x, padTop, panelW, panelH);

      // Regime label pill at top
      const pillY = padTop + 10;
      const pillW = 110;
      const pillH = 22;
      const pillX = x + (panelW - pillW) / 2;
      ctx.fillStyle = `${regimeColor}22`;
      ctx.strokeStyle = `${regimeColor}88`;
      ctx.fillRect(pillX, pillY, pillW, pillH);
      ctx.strokeRect(pillX, pillY, pillW, pillH);
      ctx.fillStyle = regimeColor;
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(regimeLabel, x + panelW / 2, pillY + 15);

      // Chart area
      const chartX = x + 10;
      const chartY = padTop + 44;
      const chartW = panelW - 20;
      const chartH = panelH - 54;
      const midY = chartY + chartH / 2;

      // Band lines (mid-line = price moving avg, outer = mid ± ATR × mult)
      const atrWidth = 28 * bandMult;
      const innerWidth = atrWidth * 0.4;
      const midWidth = atrWidth * 0.7;

      // Draw filled band (outer)
      ctx.fillStyle = regimeLabel === 'TREND' ? 'rgba(38,166,154,0.06)' : 'rgba(239,83,80,0.08)';
      ctx.beginPath();
      ctx.rect(chartX, midY - atrWidth, chartW, atrWidth * 2);
      ctx.fill();

      // Band lines — dashed
      ctx.setLineDash([4, 3]);
      ctx.lineWidth = 1;

      // Outer bands (2.35× ATR-ish)
      ctx.strokeStyle = `${MAGENTA}88`;
      ctx.beginPath();
      ctx.moveTo(chartX, midY - atrWidth);
      ctx.lineTo(chartX + chartW, midY - atrWidth);
      ctx.moveTo(chartX, midY + atrWidth);
      ctx.lineTo(chartX + chartW, midY + atrWidth);
      ctx.stroke();

      // Mid bands
      ctx.strokeStyle = `${AMBER}88`;
      ctx.beginPath();
      ctx.moveTo(chartX, midY - midWidth);
      ctx.lineTo(chartX + chartW, midY - midWidth);
      ctx.moveTo(chartX, midY + midWidth);
      ctx.lineTo(chartX + chartW, midY + midWidth);
      ctx.stroke();

      // Inner bands
      ctx.strokeStyle = `${TEAL}88`;
      ctx.beginPath();
      ctx.moveTo(chartX, midY - innerWidth);
      ctx.lineTo(chartX + chartW, midY - innerWidth);
      ctx.moveTo(chartX, midY + innerWidth);
      ctx.lineTo(chartX + chartW, midY + innerWidth);
      ctx.stroke();

      ctx.setLineDash([]);

      // Middle line (solid teal)
      ctx.strokeStyle = TEAL;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(chartX, midY);
      ctx.lineTo(chartX + chartW, midY);
      ctx.stroke();

      // Candles
      const barW = 6;
      const barGap = (chartW - barCount * barW) / (barCount - 1);
      prices.forEach((price, i) => {
        const barX = chartX + i * (barW + barGap);
        const barY = midY + price;
        // One bar — direction from price diff
        const prev = i > 0 ? prices[i - 1] : 0;
        const dir = price < prev ? 1 : -1; // visual: close higher = bullish = teal
        const barH = 8 + Math.abs(price - prev) * 1.5;
        ctx.fillStyle = dir > 0 ? `${TEAL}cc` : `${MAGENTA}cc`;
        ctx.fillRect(barX, barY - barH / 2, barW, barH);
      });

      // Band-width label
      const labelY = padTop + panelH - 10;
      ctx.fillStyle = regimeColor;
      ctx.font = 'bold 10px "SF Mono", monospace';
      ctx.textAlign = 'center';
      const labelText = regimeLabel === 'TREND' ? 'band_scale = 1.00' : 'band_scale = 1.10 (+10%)';
      ctx.fillText(labelText, x + panelW / 2, labelY);
    };

    drawPanel(padX, 'TREND', TEAL, 1.0);
    drawPanel(padX + panelW + gap, 'VOLATILE', MAGENTA, 1.1);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 12 — NoHysteresisAnim (S12)
// Top: naive ADX flipping regime every bar (flicker problem)
// Bottom: CIPHER's approach — same flicker, but RTP guidance is the safety layer
// ============================================================
function NoHysteresisAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';

    // Header
    ctx.fillStyle = 'rgba(245,158,11,0.7)';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('NO LOCK — RTP IS THE SAFETY LAYER, NOT HYSTERESIS', w / 2, 22);

    // Split layout: top half shows raw regime (flickering), bottom half shows RTP-smoothed guidance
    const topY = 42;
    const topH = h * 0.42 - 12;
    const botY = h * 0.52;
    const botH = h * 0.42 - 12;
    const padX = 20;
    const chartW = w - padX * 2;

    // Generate regime sequence — near-tie region causing flickers
    const barCount = 60;
    const scrollT = (t * 12) % barCount;
    const regimes: string[] = [];
    for (let i = 0; i < barCount; i++) {
      // Base: mostly TREND, but with frequent near-tie bars flipping to RANGE
      const adxNoise = Math.sin(i * 0.3 + t * 0.5) * 8 + Math.sin(i * 0.8) * 5;
      const adx = 22 + adxNoise; // oscillates around the 25 threshold
      const trendScore = Math.min(100, adx * 2.5);
      const rangeScore = Math.max(0, 100 - trendScore);
      regimes.push(trendScore >= rangeScore ? 'TREND' : 'RANGE');
    }

    // Top panel: raw regime bar-by-bar (flickering)
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(padX, topY, chartW, topH);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.strokeRect(padX, topY, chartW, topH);

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('RAW REGIME (every bar)', padX + 10, topY + 16);

    const cellW = chartW / barCount;
    const stripY = topY + topH - 30;
    const stripH = 22;

    for (let i = 0; i < barCount; i++) {
      const x = padX + i * cellW;
      const color = regimes[i] === 'TREND' ? TEAL : AMBER;
      ctx.fillStyle = `${color}cc`;
      ctx.fillRect(x, stripY, cellW, stripH);
    }

    // "flickers" callout
    let flickerCount = 0;
    for (let i = 1; i < barCount; i++) {
      if (regimes[i] !== regimes[i - 1]) flickerCount++;
    }
    ctx.fillStyle = MAGENTA;
    ctx.font = 'bold 11px "SF Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${flickerCount} flips in ${barCount} bars`, padX + chartW - 10, topY + 16);

    // Bottom panel: RTP guidance overlay (stable even when raw is flickering)
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(padX, botY, chartW, botH);
    ctx.strokeStyle = 'rgba(245,158,11,0.15)';
    ctx.strokeRect(padX, botY, chartW, botH);

    ctx.fillStyle = 'rgba(245,158,11,0.9)';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('RTP GUIDANCE (probability-aware)', padX + 10, botY + 16);

    // Simulated probability line — smoother because it tracks duration, not raw bar
    const probStripY = botY + botH - 30;
    const probStripH = 22;

    // Draw background strip (mostly stable TREND)
    for (let i = 0; i < barCount; i++) {
      const x = padX + i * cellW;
      // Guidance stays TREND INTACT for first 2/3, then shifts FORMING, then SHIFTING
      const prog = i / barCount;
      let color: string;
      let label: string;
      if (prog < 0.55) {
        color = TEAL;
        label = 'INTACT';
      } else if (prog < 0.82) {
        color = AMBER;
        label = 'FORMING';
      } else {
        color = AMBER;
        label = 'SHIFTING';
      }
      ctx.fillStyle = `${color}bb`;
      ctx.fillRect(x, probStripY, cellW, probStripH);
    }

    // Guidance labels at approximate segment boundaries
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TREND INTACT →', padX + chartW * 0.25, probStripY + 14);
    ctx.fillText('RANGE FORMING →', padX + chartW * 0.68, probStripY + 14);
    ctx.fillText('SHIFTING', padX + chartW * 0.91, probStripY + 14);

    // Legend note
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Same flickers. Operator-stable guidance.', padX + 10, botY + botH - 4);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 13 — PlaybookMatrixAnim (S13)
// Three playbook cards — TREND / RANGE / VOLATILE — highlighted in rotation
// Each card shows entry / stop / size / do-not guidance
// ============================================================
function PlaybookMatrixAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';

    // Cycle: highlight each playbook for 3s
    const cycleT = t % 9;
    const activeIdx = Math.floor(cycleT / 3);

    // Header
    ctx.fillStyle = 'rgba(245,158,11,0.7)';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ONE REGIME = ONE PLAYBOOK', w / 2, 22);

    const playbooks = [
      {
        regime: 'TREND',
        color: TEAL,
        headline: 'Ride the move',
        entry: 'Pullbacks to Pulse or Flow',
        stop: 'Beyond structure, wider',
        size: 'Full size',
        avoid: "Don't fade the move",
      },
      {
        regime: 'RANGE',
        color: AMBER,
        headline: 'Fade the extremes',
        entry: 'Upper / lower range boundaries',
        stop: 'Just outside range',
        size: 'Normal to reduced',
        avoid: "Don't chase breakouts",
      },
      {
        regime: 'VOLATILE',
        color: MAGENTA,
        headline: 'Reduce and wait',
        entry: 'Skip most setups',
        stop: 'Much wider (volatility)',
        size: 'Half or none',
        avoid: "Don't fade the spike",
      },
    ];

    const padX = 20;
    const padTop = 46;
    const gap = 12;
    const cardW = (w - padX * 2 - gap * 2) / 3;
    const cardH = h - padTop - 28;

    playbooks.forEach((pb, i) => {
      const x = padX + i * (cardW + gap);
      const isActive = i === activeIdx;

      // Background
      ctx.fillStyle = isActive ? `${pb.color}18` : 'rgba(0,0,0,0.3)';
      ctx.fillRect(x, padTop, cardW, cardH);
      ctx.strokeStyle = isActive ? pb.color : 'rgba(255,255,255,0.06)';
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.strokeRect(x, padTop, cardW, cardH);

      // Regime pill
      const pillY = padTop + 10;
      const pillW = 76;
      const pillH = 20;
      const pillX = x + (cardW - pillW) / 2;
      ctx.fillStyle = `${pb.color}33`;
      ctx.strokeStyle = pb.color;
      ctx.lineWidth = 1;
      ctx.fillRect(pillX, pillY, pillW, pillH);
      ctx.strokeRect(pillX, pillY, pillW, pillH);
      ctx.fillStyle = pb.color;
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(pb.regime, x + cardW / 2, pillY + 13);

      // Headline
      ctx.fillStyle = 'white';
      ctx.font = 'bold 13px Inter, sans-serif';
      ctx.fillText(pb.headline, x + cardW / 2, pillY + 42);

      // Detail rows
      const rowY = pillY + 60;
      const rowH = 22;
      const rows = [
        { label: 'ENTRY',  val: pb.entry },
        { label: 'STOP',   val: pb.stop },
        { label: 'SIZE',   val: pb.size },
        { label: 'AVOID',  val: pb.avoid },
      ];
      rows.forEach((r, ri) => {
        const ry = rowY + ri * rowH;
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = 'bold 9px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(r.label, x + 10, ry);

        ctx.fillStyle = isActive ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.6)';
        ctx.font = '10px Inter, sans-serif';
        // Word-wrap a bit
        const maxW = cardW - 20;
        const words = r.val.split(' ');
        let line = '';
        let lineY = ry + 12;
        words.forEach((wd, wi) => {
          const test = line + (line ? ' ' : '') + wd;
          if (ctx.measureText(test).width > maxW && line) {
            ctx.fillText(line, x + 10, lineY);
            line = wd;
            lineY += 10;
          } else {
            line = test;
          }
          if (wi === words.length - 1) ctx.fillText(line, x + 10, lineY);
        });
      });
    });
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// MAIN COMPONENT
// Hero + S00 + S01-S09 rendered with gold pattern
// Phase 2A scope — Phases 2B-5 add remaining sections + game/quiz/cert
// ============================================================
export default function CipherRegimeEngineLesson() {
  const [scrollY, setScrollY] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameRound, setGameRound] = useState(0);
  const [gameSelections, setGameSelections] = useState<(string | null)[]>(new Array(gameRounds.length).fill(null));
  const [quizAnswers, setQuizAnswers] = useState<(string | null)[]>(new Array(quizQuestions.length).fill(null));
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [certRevealed, setCertRevealed] = useState(false);
  const [certId] = useState(() => `PRO-CERT-L11.4-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);

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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 11 &middot; Lesson 4</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">The 3-Regime Engine<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>TREND &middot; RANGE &middot; VOLATILE</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">Three states. One dominant winner at every bar. And a <em>forecaster</em> on top that tells you when the state is about to change.</motion.p>
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
            <p className="text-xl font-extrabold mb-3">The single most misread signal on your chart is the Regime row.</p>
            <p className="text-gray-400 leading-relaxed mb-4">Most operators see <strong className="text-teal-400">TREND</strong> in the Command Center and assume it's static &mdash; that the market is currently trending, end of story. That&apos;s a dangerous misread. Regime is computed <strong className="text-white">every single bar</strong> by a three-score race: ADX drives a trend score, ATR spike drives a volatile score, and whatever is left becomes the range score. The tallest score wins. <strong className="text-amber-400">A chart that&apos;s TREND on one bar can become RANGE on the next.</strong></p>
            <p className="text-gray-400 leading-relaxed mb-4">But CIPHER doesn&apos;t just report the current regime. It runs a separate engine &mdash; the <strong className="text-amber-400">Regime Transition Predictor (RTP)</strong> &mdash; on top, tracking how long every past regime lasted and what typically followed. When the current regime starts aging past its historical average, RTP raises the probability of shift and shows you what&apos;s most likely to come next.</p>
            <p className="text-gray-400 leading-relaxed">This is the lesson where <em>regime</em> stops meaning &ldquo;what is the market right now&rdquo; and starts meaning &ldquo;what will the market become, and when.&rdquo; The shift is the operator advantage.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#11088; THE REGIME FORECASTER PROMISE</p>
            <p className="text-sm text-gray-400 leading-relaxed">By the end of this lesson, you will never glance at the Regime row and read only the color again. You will read the <strong className="text-white">duration</strong>, you will read the <strong className="text-white">probability</strong>, and you will know <strong className="text-white">what comes next</strong>. That is the operator read.</p>
          </div>
        </motion.div>
      </section>

      {/* === S01 — The Regime as Forecaster, Not Observer (Groundbreaking Concept) === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; &#11088; The Regime as Forecaster, Not Observer</p>
          <h2 className="text-2xl font-extrabold mb-4">The Groundbreaking Concept</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Every other indicator tells you the current regime. <strong className="text-amber-400">CIPHER also tells you how long it&apos;s lasted vs average, the probability of shift, and which regime is most likely to come next</strong> &mdash; learned from your chart&apos;s actual history.</p>
          <RegimeForecasterAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the animation cycle through four scenes. <strong className="text-white">Scene 1</strong>: the naive dashboard view &mdash; just the current regime, no context. <strong className="text-white">Scene 2</strong>: CIPHER adds duration (23 bars) and compares it to the historical average on this chart (35 bars). Probability: 24% &mdash; ride it. <strong className="text-white">Scene 3</strong>: duration reaches 42 bars, well past average. The sigmoid probability curve lifts to 72% and the action column flips to <span className="text-amber-400 font-semibold">&rarr; RANGE FORMING</span>. <strong className="text-white">Scene 4</strong>: the transition fires. Regime flips to RANGE, duration resets, a new sigmoid begins &mdash; and CIPHER already knows, from this chart&apos;s history, that TREND is the most likely state to come next.</p>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S PROMISE</p>
            <p className="text-sm text-gray-400 leading-relaxed">The regime row is a <strong className="text-white">forecaster</strong>, not a status label. Read the duration, then the probability, then the next-likely state. Reading only the color is leaving 70% of the signal unused.</p>
          </div>
        </motion.div>
      </section>

      {/* === S02 — The Three Regimes === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Three Regimes</p>
          <h2 className="text-2xl font-extrabold mb-4">TREND &middot; RANGE &middot; VOLATILE</h2>
          <p className="text-gray-400 leading-relaxed mb-6">CIPHER classifies every bar into one of three regimes. Each regime has its own underlying market physics, its own color in the Command Center, and its own recommended playbook. <strong className="text-white">There is no fourth state &mdash; no CHOPPY, no TRANSITION, no MIXED.</strong> Ties are broken in the order TREND &gt; VOLATILE &gt; RANGE, so every bar has exactly one verdict.</p>
          <RegimeTriptychAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6"><strong className="text-teal-400">TREND</strong> is the ADX-driven regime. When the market moves directionally with strength, ADX climbs above 25 and the trend score dominates. <strong className="text-amber-400">RANGE</strong> is the residual regime &mdash; what&apos;s left after TREND and VOLATILE claim their share. It&apos;s the default state of a market that isn&apos;t trending and isn&apos;t spiking. <strong className="text-red-400">VOLATILE</strong> is the ATR-spike regime. When current ATR exceeds 1.5&times; the 50-bar ATR average, the volatile score lifts above the others and the market is flagged as dislocating from its own normal range.</p>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">WHY THREE AND NOT FIVE OR SEVEN</p>
            <p className="text-sm text-gray-400 leading-relaxed">More regimes = more false transitions. Three is the minimum that covers directional / undirectional / dislocating. Anything finer (STRONG TREND / WEAK TREND / TIGHT RANGE / WIDE RANGE) introduces more flicker than information. <strong className="text-white">The three-regime cut is deliberate.</strong></p>
          </div>
        </motion.div>
      </section>

      {/* === S03 — The Three-Score Math === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The Three-Score Math</p>
          <h2 className="text-2xl font-extrabold mb-4">Tallest bar wins</h2>
          <p className="text-gray-400 leading-relaxed mb-6">At every bar CIPHER computes three numbers in parallel: <strong className="text-teal-400">trend_pct</strong>, <strong className="text-red-400">volatile_pct</strong>, and <strong className="text-amber-400">range_pct</strong>. They sum to a bounded space; whichever is largest becomes the regime. No thresholds, no lockouts, no N-bar confirmation &mdash; pure winner-takes-all on this bar&apos;s values.</p>
          <ThreeScoreAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch three scenarios cycle. In each, three bars race upward to their true values, and the tallest wins the regime. <strong className="text-teal-400">Scenario 1</strong>: trend_pct dominates &rarr; TREND. <strong className="text-red-400">Scenario 2</strong>: volatile_pct spikes &rarr; VOLATILE. <strong className="text-amber-400">Scenario 3</strong>: both others are small &rarr; range_pct wins by residual &rarr; RANGE.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-teal-400 mb-1">trend_pct &middot; ADX-driven</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">trend_pct = min(100, adx_val &times; 2.5)</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">ADX 40+ saturates to 100. ADX 20 gives 50. ADX 10 gives 25. Pure monotonic map &mdash; stronger trend, higher score.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-red-400 mb-1">volatile_pct &middot; ATR spike detection</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">vol_spike = atr / atr_slow<br />volatile_pct = vol_spike &gt; 2.0 ? 100 : vol_spike &gt; 1.5 ? (vol_spike &minus; 1.0) &times; 100 : 0</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">Below 1.5&times; = zero (nothing unusual). Above 2.0&times; = 100 (extreme spike). In between = ramps linearly.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">range_pct &middot; the residual</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">range_pct = max(0, 100 &minus; trend_pct &minus; volatile_pct)</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">Whatever&apos;s left over. If trend_pct is low AND volatile_pct is zero, range_pct wins by default &mdash; and that&apos;s how CIPHER tells you the market is simply undirectional.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">TIE-BREAK PRIORITY</p>
            <p className="text-sm text-gray-400 leading-relaxed">If trend_pct == volatile_pct, TREND wins. If volatile_pct == range_pct (and both exceed trend_pct), VOLATILE wins. RANGE only wins when it&apos;s strictly the largest. <strong className="text-white">TREND &gt; VOLATILE &gt; RANGE.</strong></p>
          </div>
        </motion.div>
      </section>

      {/* === S04 — TREND — The ADX-Driven State === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; TREND &middot; The ADX-Driven State</p>
          <h2 className="text-2xl font-extrabold mb-4">How ADX maps to trend_pct</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The trend score is a direct monotonic function of ADX &mdash; the Average Directional Index computed with a 14-period lookback. CIPHER multiplies ADX by 2.5 and caps at 100, meaning ADX 40 or higher always saturates the trend score.</p>
          <ADXScaleAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the needle swing across the ADX scale. Below 15 = magenta <strong className="text-red-400">CHOP</strong>, little to no directional conviction. 15-25 = amber <strong className="text-amber-400">BUILDING</strong>, directional energy forming. Above 25 = teal <strong className="text-teal-400">TREND</strong>, strong enough that trend_pct alone is likely to dominate the three-score race.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">WHY ADX AND NOT CLOSE SLOPE OR MOVING AVERAGES</p>
              <p className="text-sm text-gray-400 leading-relaxed">ADX measures directional <strong className="text-white">strength</strong> independent of direction. A market rising steadily and a market falling steadily both produce the same ADX reading. This is exactly what regime classification needs &mdash; we&apos;re asking &ldquo;is the market trending?&rdquo; not &ldquo;which way?&rdquo;. The directional arrows in the Command Center header (&#9650; BULL TREND vs &#9660; BEAR TREND) are driven separately by pulse_dir, not by ADX.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE 2.5 MULTIPLIER</p>
              <p className="text-sm text-gray-400 leading-relaxed">ADX saturates at 40 giving trend_pct = 100. This deliberately gives strong trends a floor of winning against most volatile_pct readings, which cap at 100 only during extreme 2.0&times;+ ATR spikes. <strong className="text-white">In practice, a strong trend and a moderate volatility spike will coexist &mdash; and trend wins.</strong></p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S05 — VOLATILE · The ATR Spike State === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; VOLATILE &middot; The ATR Spike State</p>
          <h2 className="text-2xl font-extrabold mb-4">When the market dislocates from its own normal range</h2>
          <p className="text-gray-400 leading-relaxed mb-6">CIPHER uses a <strong className="text-white">ratio</strong>, not an absolute value, to decide when volatility has gone abnormal. It compares current ATR (14-period) against the 50-bar SMA of ATR (&quot;ATR_slow&quot;). When current ATR exceeds <strong className="text-amber-400">1.5&times; ATR_slow</strong>, volatile_pct starts ramping. Above <strong className="text-red-400">2.0&times;</strong>, volatile_pct saturates at 100.</p>
          <ATRSpikeAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the ATR line breathe across the chart. Most of the time it stays near the dashed <strong className="text-white">ATR_slow baseline</strong> &mdash; volatile_pct is zero, no regime claim here. When a spike lifts the line through the amber <strong className="text-amber-400">1.5&times; threshold</strong>, volatile_pct starts contributing. Cross the magenta <strong className="text-red-400">2.0&times; line</strong> and it saturates &mdash; the regime is almost certainly VOLATILE unless trend is extraordinarily strong.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">WHY A RATIO, NOT AN ABSOLUTE THRESHOLD</p>
              <p className="text-sm text-gray-400 leading-relaxed">A 50-pip ATR is calm on EURUSD 1H but extreme on EURUSD 5m. Comparing current ATR to its OWN 50-bar average makes VOLATILE <strong className="text-white">self-calibrating</strong> to the instrument and timeframe &mdash; no manual tuning needed.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE LINEAR RAMP BETWEEN 1.5 AND 2.0</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">volatile_pct = (vol_spike − 1.0) × 100 when vol_spike ∈ (1.5, 2.0)</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">At 1.5&times;, volatile_pct = 50. At 2.0&times;, volatile_pct = 100 and locks there. This lets VOLATILE compete with TREND at moderate spikes and dominate at extreme ones.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">WHEN TREND AND VOLATILE COEXIST</p>
            <p className="text-sm text-gray-400 leading-relaxed">A strong trend with ADX 40 gives trend_pct = 100. A 1.7&times; ATR spike gives volatile_pct = 70. Trend wins. But a 2.1&times; spike gives volatile_pct = 100 and a tie forms &mdash; TREND wins the tie per the priority rule (section 07). <strong className="text-white">VOLATILE only wins when the spike is genuinely exceptional AND the trend is weakening.</strong></p>
          </div>
        </motion.div>
      </section>

      {/* === S06 — RANGE · What's Left Over === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; RANGE &middot; What&apos;s Left Over</p>
          <h2 className="text-2xl font-extrabold mb-4">The residual regime</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Unlike TREND and VOLATILE, the RANGE score isn&apos;t computed from a market metric. It&apos;s <strong className="text-amber-400">the residual</strong> &mdash; what&apos;s left after TREND and VOLATILE have claimed their share. When the market is undirectional and not spiking, the trend and volatile scores stay small, and RANGE wins by default.</p>
          <RangeResidualAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Three cups fill from top and compete for what&apos;s in the water budget. TREND fills based on ADX. VOLATILE fills based on ATR spike. RANGE takes whatever&apos;s left. <strong className="text-white">Scenario 1</strong>: moderate trend + quiet market &rarr; RANGE still gets 30%. <strong className="text-white">Scenario 2</strong>: volatility dominates &rarr; RANGE only gets 15%. <strong className="text-white">Scenario 3</strong>: both other scores are tiny &rarr; RANGE wins by residual with 70%.</p>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">WHY RANGE IS DESIGNED AS THE RESIDUAL</p>
            <p className="text-sm text-gray-400 leading-relaxed">A market that isn&apos;t trending and isn&apos;t spiking is, by definition, in a range. There&apos;s nothing meaningful to measure about &ldquo;rangeness&rdquo; directly &mdash; any metric you invent (BB width, price standard deviation, etc.) is just a proxy for &ldquo;how much trend and volatility are absent.&rdquo; The residual approach cuts through that: <strong className="text-white">if the other two regimes can&apos;t claim the bar, it&apos;s RANGE</strong>. Simple, non-redundant, and honest about what RANGE actually means.</p>
          </div>
        </motion.div>
      </section>

      {/* === S07 — The Tie-Break Priority === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; The Tie-Break Priority</p>
          <h2 className="text-2xl font-extrabold mb-4">TREND &gt; VOLATILE &gt; RANGE</h2>
          <p className="text-gray-400 leading-relaxed mb-6">When two scores tie, CIPHER follows a fixed priority to resolve the ambiguity: <strong className="text-teal-400">TREND</strong> beats <strong className="text-red-400">VOLATILE</strong>, VOLATILE beats <strong className="text-amber-400">RANGE</strong>. This matters more than it looks &mdash; ties happen frequently on real charts, especially during regime transitions.</p>
          <TieBreakAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Four scenarios cycle. Three show genuine ties; the fourth shows a clean RANGE win for contrast. Watch how the verdict flips based on priority, not just the numbers. <strong className="text-white">Tie 1</strong>: trend_pct = volatile_pct = 45 &rarr; TREND wins. <strong className="text-white">Tie 2</strong>: volatile_pct = range_pct = 40 &rarr; VOLATILE wins. <strong className="text-white">Tie 3</strong>: trend_pct = range_pct = 40 &rarr; TREND wins again.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">WHY TREND WINS TIES</p>
              <p className="text-sm text-gray-400 leading-relaxed">CIPHER&apos;s design philosophy is that a trending market with a volatility spike is still a trending market &mdash; the operator plays the trend, just with wider stops. Flipping to VOLATILE during a strong trend would suppress trend signals and break the operator&apos;s playbook.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHY VOLATILE WINS OVER RANGE</p>
              <p className="text-sm text-gray-400 leading-relaxed">A spike-driven range is NOT the same as a quiet range. Reading VOLATILE tells the operator &ldquo;reduce size, don&apos;t fade the spike.&rdquo; Reading RANGE would tell the same operator &ldquo;fade the extremes&rdquo; &mdash; a catastrophic misread during a news bar.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">PRACTICAL CONSEQUENCE</p>
            <p className="text-sm text-gray-400 leading-relaxed">If you ever see regime = TREND on a chart that looks sideways and wild, check ADX &mdash; it&apos;s almost certainly above 25 with an ATR spike happening. The priority is telling you the trend is still in control. <strong className="text-white">Respect it, or wait for the regime row to flip.</strong></p>
          </div>
        </motion.div>
      </section>

      {/* === S08 — The Regime Transition Predictor === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; The Regime Transition Predictor</p>
          <h2 className="text-2xl font-extrabold mb-4">The forecaster engine, in full</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The RTP runs on top of regime classification and does three things every bar: (1) tracks how long the current regime has lasted, (2) compares that duration to the historical average of all previous regimes of that type on this chart, (3) runs a sigmoid curve on the ratio to produce a probability of shift.</p>
          <RTPTimelineAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">The sigmoid curve is steep at the crossing point &mdash; meaning a regime that&apos;s 20% past its average has a meaningfully higher shift probability than one that&apos;s 10% past. The probability climbs toward 95% (capped) as the regime ages further, never quite reaching certainty because markets occasionally trend or range much longer than average.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE SIGMOID FORMULA</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">ratio = duration / avg<br />prob = 100 / (1 + e^(−3.5 × (ratio − 1.0)))</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">At ratio = 0.5 (half of average) &rarr; prob ≈ 15%. At ratio = 1.0 (exactly at average) &rarr; prob ≈ 50%. At ratio = 1.5 (50% past average) &rarr; prob ≈ 85%. At ratio = 2.0+ &rarr; capped at 95%.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE LEARNED AVERAGE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Each time a regime ends, CIPHER appends its duration to a per-type array (the last 30 durations are kept). The average is computed from that rolling history. <strong className="text-white">This means RTP&apos;s predictions get more accurate the longer it watches a chart</strong> &mdash; it&apos;s learning the personality of that symbol+timeframe.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE TRANSITION MATRIX</p>
              <p className="text-sm text-gray-400 leading-relaxed">Alongside durations, CIPHER tracks transition counts: TREND&rarr;RANGE, TREND&rarr;VOLATILE, RANGE&rarr;TREND, RANGE&rarr;VOLATILE, VOLATILE&rarr;TREND, VOLATILE&rarr;RANGE. When probability rises, the guidance column uses this matrix to pick the most likely NEXT regime. That&apos;s what &quot;&rarr; SHIFTING TO RANGE&quot; actually means.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">WHY A SIGMOID AND NOT LINEAR</p>
            <p className="text-sm text-gray-400 leading-relaxed">A linear probability would treat &ldquo;10% past average&rdquo; the same as &ldquo;just past average.&rdquo; The sigmoid respects the reality that markets rarely transition exactly at average and the urgency accelerates once the regime is meaningfully stretched. <strong className="text-white">It matches how experienced traders actually anticipate regime changes.</strong></p>
          </div>
        </motion.div>
      </section>

      {/* === S09 — Reading the Regime Row === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Reading the Regime Row</p>
          <h2 className="text-2xl font-extrabold mb-4">Three cells, three meanings</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The Regime row in the Command Center has exactly three cells. Each carries one specific piece of information, and they&apos;re designed to be read left-to-right as a complete thought: <strong className="text-white">label &middot; current state &middot; transition guidance</strong>.</p>
          <RegimeRowAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the row cycle through five real states captured from live CIPHER sessions. Note the header bar stays in sync &mdash; <strong className="text-white">regime is the primary driver of the header&apos;s state label AND color</strong>. Even if you turn the Regime row toggle OFF, the header is still regime-colored.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">CELL 1 &middot; LABEL</p>
              <p className="text-sm text-gray-400 leading-relaxed">Always reads &quot;Regime&quot;. Fixed color, fixed text. This is just the anchor so your eye knows which row you&apos;re on.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CELL 2 &middot; CURRENT STATE</p>
              <p className="text-sm text-gray-400 leading-relaxed">One of: <strong className="text-teal-400">TREND</strong>, <strong className="text-amber-400">RANGE</strong>, <strong className="text-red-400">VOLATILE</strong>. Color matches the state. This is the three-score winner on this bar.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CELL 3 &middot; TRANSITION GUIDANCE</p>
              <p className="text-sm text-gray-400 leading-relaxed">The RTP output in plain English. Possible values:</p>
              <ul className="text-sm text-gray-400 leading-relaxed mt-2 ml-4 space-y-1">
                <li>&bull; <strong className="text-teal-400">&rarr; TREND INTACT</strong> / <strong className="text-amber-400">&rarr; RANGE HOLDING</strong> / <strong className="text-red-400">&rarr; STAY CAUTIOUS</strong> &mdash; regime is stable (probability of shift below 50%)</li>
                <li>&bull; <strong className="text-amber-400">&rarr; X FORMING</strong> &mdash; probability of shift 50%&ndash;75% (likely but not imminent)</li>
                <li>&bull; <strong className="text-amber-400">&rarr; SHIFTING TO X</strong> &mdash; probability of shift above 75% (imminent)</li>
              </ul>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE OPERATOR READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Read cell 2 first (current state), then cell 3 (what&apos;s coming). If cell 3 says <strong className="text-white">INTACT / HOLDING / CAUTIOUS</strong>, you&apos;re in stable regime &mdash; play the playbook. If cell 3 says <strong className="text-white">FORMING</strong>, start positioning for the next state. If cell 3 says <strong className="text-white">SHIFTING</strong>, close or reduce &mdash; the regime is about to flip under you.</p>
          </div>
        </motion.div>
      </section>

      {/* === S10 — The Five Downstream Effects === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; The Five Downstream Effects</p>
          <h2 className="text-2xl font-extrabold mb-4">One flip, five systems change</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Regime isn&apos;t just a label. When it changes, <strong className="text-amber-400">five separate systems in CIPHER respond</strong>. Understanding this cascade is what separates reading the regime row from operating on it.</p>
          <CascadeFiveAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the center bubble cycle through TREND / RANGE / VOLATILE. With each regime, the five satellite cards update in sequence. These aren&apos;t cosmetic &mdash; each represents a real behavior change in CIPHER.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">EFFECT 1 &middot; HEADER STATE</p>
              <p className="text-sm text-gray-400 leading-relaxed">The always-on Command Center header shows regime: <strong className="text-teal-400">&#9650; BULL TREND</strong> / <strong className="text-red-400">&#9660; BEAR TREND</strong> (in TREND regime, combined with pulse_dir), <strong className="text-amber-400">&#8596; RANGING</strong> (in RANGE), <strong className="text-red-400">&#9889; VOLATILE</strong> (in VOLATILE). <strong className="text-white">Even with the Regime row toggled OFF, the header is still reporting regime.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">EFFECT 2 &middot; ACTION CELL</p>
              <p className="text-sm text-gray-400 leading-relaxed">The header&apos;s right column shows what to DO next. Some action strings only fire in specific regimes: <strong className="text-white">&rarr; RIDE IT</strong> only appears in TREND. <strong className="text-white">&rarr; COILING</strong> only appears in RANGE. <strong className="text-white">&rarr; REDUCE SIZE</strong> only appears in VOLATILE. Regime is a hard gate on which actions CIPHER can suggest.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">EFFECT 3 &middot; TRANSITION GUIDANCE</p>
              <p className="text-sm text-gray-400 leading-relaxed">The Regime row&apos;s third cell. Drives the RTP&apos;s plain-English output (INTACT / FORMING / SHIFTING). The guidance text is regime-specific &mdash; <strong className="text-white">&rarr; TREND INTACT</strong> never appears when the current regime is RANGE.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">EFFECT 4 &middot; RISK ENVELOPE BANDS WIDEN</p>
              <p className="text-sm text-gray-400 leading-relaxed">When regime = VOLATILE, the band scale adds +0.10 (widens bands by 10%). This prevents false DANGER verdicts during big moves. <strong className="text-white">Section 11 shows this visually.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">EFFECT 5 &middot; ALERT JSON PAYLOAD</p>
              <p className="text-sm text-gray-400 leading-relaxed">Every webhook alert CIPHER fires includes <span className="font-mono text-amber-400">&quot;regime&quot;: &quot;TREND&quot;</span> (or RANGE, or VOLATILE) in the JSON. If you pipe CIPHER alerts into a bot, your automation gets the market state for every trade &mdash; so you can filter or size trades by regime downstream.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S11 — VOLATILE Widens the Envelope === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; VOLATILE Widens the Envelope</p>
          <h2 className="text-2xl font-extrabold mb-4">+10% wider bands in VOLATILE regime</h2>
          <p className="text-gray-400 leading-relaxed mb-6">One of the clearest downstream effects: when regime flips to VOLATILE, the Risk Envelope bands widen by 10%. This is a deliberate design &mdash; big moves are <em>normal</em> in VOLATILE regime, not danger signals. Without the widening, every spike would trigger a false DANGER verdict in the Risk row.</p>
          <EnvelopeWideningAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">The animation shows identical price action in both panels. Left: TREND regime, bands at baseline <span className="font-mono text-white">band_scale = 1.00</span>. Right: VOLATILE regime, bands at <span className="font-mono text-white">band_scale = 1.10</span> &mdash; 10% wider top and bottom. Same candles, more tolerance.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE CODE PATH</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">regime_scale = 0.85 + trend_pct × 0.004<br />vol_regime_bonus = regime == &quot;VOLATILE&quot; ? 0.10 : 0.0<br />band_scale = regime_scale + vol_regime_bonus</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">The base scale already widens with trend strength (stronger trend = wider bands to give the trend room). The <strong className="text-red-400">+0.10 VOLATILE bonus</strong> stacks on top.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PRACTICAL IMPACT</p>
              <p className="text-sm text-gray-400 leading-relaxed">Before the widening, a news bar would push price through CIPHER&apos;s outer band and trigger Risk = DANGER. With the widening, the bar stays within the band and Risk correctly reads CAUTION or NORMAL &mdash; matching what an operator would call it.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">NO OTHER REGIME AFFECTS BAND WIDTH</p>
            <p className="text-sm text-gray-400 leading-relaxed">TREND doesn&apos;t widen. RANGE doesn&apos;t narrow. Only VOLATILE adjusts band scale. This is intentional &mdash; VOLATILE is the regime where the Risk Envelope&apos;s normal thresholds are most likely to mislead.</p>
          </div>
        </motion.div>
      </section>

      {/* === S12 — No Hysteresis — The Honest Tradeoff === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">12 &mdash; No Hysteresis, The Honest Tradeoff</p>
          <h2 className="text-2xl font-extrabold mb-4">Regime CAN flicker bar-to-bar &mdash; here&apos;s why that&apos;s fine</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Most regime-classification systems use <strong className="text-white">hysteresis</strong> &mdash; requiring N consecutive bars of a new state before declaring a change. CIPHER does NOT. Regime is computed per-bar with no lock, no cooldown, no N-bar buffer. When trend_pct and volatile_pct are near-equal, regime can flip bar-to-bar.</p>
          <NoHysteresisAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">The animation shows why this tradeoff works. <strong className="text-white">Top strip</strong>: raw regime state per bar &mdash; yes, there&apos;s flicker. <strong className="text-white">Bottom strip</strong>: RTP guidance over the same period &mdash; stable and actionable. CIPHER solves the flicker problem not by locking the classification, but by giving you a probability-aware guidance layer on top.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">WHY CIPHER SKIPS HYSTERESIS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Hysteresis introduces <strong className="text-red-400">lag</strong>. A 5-bar confirmation rule means you learn about the regime change 5 bars late &mdash; often after the setup you would have traded is already gone. CIPHER&apos;s philosophy is to report truth in real time and let the RTP smooth the OPERATOR guidance, not the raw data.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE OPERATOR&apos;S RESPONSIBILITY</p>
              <p className="text-sm text-gray-400 leading-relaxed">Don&apos;t trade off a single bar&apos;s regime reading. Read the <strong className="text-white">guidance cell</strong>: INTACT / FORMING / SHIFTING. These are RTP-driven and stable over many bars. A single flicker from TREND to RANGE and back means nothing &mdash; the guidance stays &ldquo;TREND INTACT&rdquo; throughout.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">WHEN FLICKER MATTERS</p>
            <p className="text-sm text-gray-400 leading-relaxed">Flicker is most common at regime transitions &mdash; when the market is genuinely undecided. If you see frequent flipping AND the guidance is saying &ldquo;FORMING&rdquo; or &ldquo;SHIFTING&rdquo;, that&apos;s a real alert. If the guidance is still saying &ldquo;INTACT&rdquo;, the flicker is just noise &mdash; hold position.</p>
          </div>
        </motion.div>
      </section>

      {/* === S13 — Three Regime Playbooks === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">13 &mdash; Three Regime Playbooks</p>
          <h2 className="text-2xl font-extrabold mb-4">One regime = one playbook</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Three regimes, three distinct operator approaches. The playbooks aren&apos;t interchangeable &mdash; running your TREND playbook in a RANGE regime is how operators get chopped, and running the RANGE playbook during a VOLATILE spike is how they get wrecked.</p>
          <PlaybookMatrixAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Each playbook highlights in sequence. Study the AVOID line in each &mdash; those are the classic operator mistakes. <strong className="text-teal-400">TREND</strong>: don&apos;t fade the move, ride pullbacks. <strong className="text-amber-400">RANGE</strong>: don&apos;t chase breakouts, fade the edges. <strong className="text-red-400">VOLATILE</strong>: don&apos;t fade the spike, reduce and wait.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-teal-400 mb-1">TREND PLAYBOOK</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">Entry:</strong> pullbacks to the Pulse or Flow line. <strong className="text-white">Stop:</strong> beyond visible structure, give the trend room (bands are already wider in strong trend due to regime_scale). <strong className="text-white">Size:</strong> full size, high conviction. <strong className="text-white">Avoid:</strong> fading the move &mdash; CIPHER&apos;s &ldquo;RIDE IT&rdquo; action cell is telling you the trend is still in control.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">RANGE PLAYBOOK</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">Entry:</strong> upper/lower range boundaries (identified via Structure row S/R). <strong className="text-white">Stop:</strong> just outside range &mdash; ranges break clean, wide stops add no value. <strong className="text-white">Size:</strong> normal to reduced &mdash; ranges have lower conviction than trends. <strong className="text-white">Avoid:</strong> chasing breakouts &mdash; CIPHER&apos;s &ldquo;COILING&rdquo; action cell says the range is holding.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-red-400 mb-1">VOLATILE PLAYBOOK</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">Entry:</strong> skip most setups &mdash; volatility spikes produce more false signals than real ones. <strong className="text-white">Stop:</strong> if you must enter, stops must be much wider (band widening is a hint). <strong className="text-white">Size:</strong> half normal or none at all. <strong className="text-white">Avoid:</strong> fading the spike &mdash; CIPHER&apos;s &ldquo;REDUCE SIZE&rdquo; action cell says capital preservation comes first.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">MIXING PLAYBOOKS IS THE COMMON KILLER</p>
            <p className="text-sm text-gray-400 leading-relaxed">Most operator drawdowns happen because the regime flipped (say TREND &rarr; RANGE) and the operator kept running the TREND playbook. The Regime row exists to prevent this. <strong className="text-white">When the row flips, the playbook flips. Full stop.</strong></p>
          </div>
        </motion.div>
      </section>

      {/* === S14 — Common Behavioral Mistakes === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">14 &mdash; Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-4">Six ways the Regime row gets misread</h2>
          <p className="text-gray-400 leading-relaxed mb-6">These are the six most common regime-reading errors operators make in live trading. Each is listed with its consequence and the fix. For each, ask honestly: have I done this?</p>
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <div className="flex items-start gap-3 mb-2">
                <span className="text-2xl">&#10060;</span>
                <p className="text-sm font-extrabold text-red-400 flex-1">Mistake 1 &mdash; Reading only the current state cell, ignoring the guidance</p>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed ml-10">The regime says TREND so you keep adding size. But the third cell already said <span className="text-amber-400">&rarr; RANGE FORMING</span>. <strong className="text-white">THE FIX:</strong> read ALL THREE cells left-to-right every time. The guidance is where the forecast lives.</p>
            </div>
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <div className="flex items-start gap-3 mb-2">
                <span className="text-2xl">&#10060;</span>
                <p className="text-sm font-extrabold text-red-400 flex-1">Mistake 2 &mdash; Assuming regime is persistent because it hasn&apos;t changed in a while</p>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed ml-10">&ldquo;It&apos;s been TREND for an hour, it&apos;ll stay TREND.&rdquo; Wrong logic &mdash; the longer it&apos;s lasted, the HIGHER the probability it&apos;s about to flip (sigmoid curve, section 08). <strong className="text-white">THE FIX:</strong> treat long-lasting regimes with MORE suspicion, not less. Check RTP probability.</p>
            </div>
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <div className="flex items-start gap-3 mb-2">
                <span className="text-2xl">&#10060;</span>
                <p className="text-sm font-extrabold text-red-400 flex-1">Mistake 3 &mdash; Trading on single-bar flicker</p>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed ml-10">Regime blips from TREND to RANGE for one bar, then back. Operator closes the trend trade in panic. <strong className="text-white">THE FIX:</strong> ignore single-bar flips. Only act when the guidance cell confirms: INTACT means hold, FORMING means prepare, SHIFTING means act.</p>
            </div>
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <div className="flex items-start gap-3 mb-2">
                <span className="text-2xl">&#10060;</span>
                <p className="text-sm font-extrabold text-red-400 flex-1">Mistake 4 &mdash; Ignoring VOLATILE because it&apos;s rare</p>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed ml-10">VOLATILE rarely fires (ATR spike &gt; 1.5&times;), but when it does, it&apos;s the most important regime read on the chart. Operators skim past it because &ldquo;it barely ever shows up.&rdquo; <strong className="text-white">THE FIX:</strong> when VOLATILE fires, STOP. Reduce size or step away. It&apos;s rare for a reason &mdash; the tail-risk moment.</p>
            </div>
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <div className="flex items-start gap-3 mb-2">
                <span className="text-2xl">&#10060;</span>
                <p className="text-sm font-extrabold text-red-400 flex-1">Mistake 5 &mdash; Running the TREND playbook in a RANGE regime</p>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed ml-10">Buying dips and adding on strength &mdash; classic TREND moves. But the regime is RANGE. You&apos;re buying near the top of the range and selling near the bottom. <strong className="text-white">THE FIX:</strong> one regime, one playbook. When the regime flips, the playbook flips. No exceptions.</p>
            </div>
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <div className="flex items-start gap-3 mb-2">
                <span className="text-2xl">&#10060;</span>
                <p className="text-sm font-extrabold text-red-400 flex-1">Mistake 6 &mdash; Turning the Regime row OFF to &ldquo;reduce clutter&rdquo;</p>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed ml-10">Regime is arguably the single most consequential signal in CIPHER &mdash; it gates five downstream systems. Hiding the row to save screen space is false economy. <strong className="text-white">THE FIX:</strong> keep the Regime row ON. If you need to save space, turn off something less critical (Last Signal, FVG row).</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S15 — The Regime Cheat Sheet === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">15 &mdash; The Regime Cheat Sheet</p>
          <h2 className="text-2xl font-extrabold mb-4">Screenshot This. Pin It.</h2>
          <div className="p-5 rounded-2xl glass-card">
            <div className="space-y-3">
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">The Three Regimes</p>
                <p className="text-sm text-gray-300"><strong className="text-teal-400">TREND</strong> (ADX-driven) &middot; <strong className="text-amber-400">RANGE</strong> (residual) &middot; <strong className="text-red-400">VOLATILE</strong> (ATR spike &gt; 1.5&times;).</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">The Three Scores</p>
                <p className="text-sm text-gray-300"><strong className="text-white">trend_pct</strong> = min(100, ADX &times; 2.5) &middot; <strong className="text-white">volatile_pct</strong> = ramps 0&rarr;100 between 1.5&times; and 2.0&times; ATR/ATR_slow &middot; <strong className="text-white">range_pct</strong> = max(0, 100 &minus; trend_pct &minus; volatile_pct).</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Tie-Break Priority</p>
                <p className="text-sm text-gray-300"><strong className="text-teal-400">TREND &gt; VOLATILE &gt; RANGE</strong>. A trending market with a volatility spike is still TREND; CIPHER respects that hierarchy.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">RTP &mdash; The Forecaster</p>
                <p className="text-sm text-gray-300">Tracks regime duration vs historical average. Sigmoid probability: at avg = 50%, at 1.5&times; avg = 85%, at 2&times; avg = capped 95%. The longer a regime lasts, the higher the probability it&apos;s about to flip.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">The Regime Row &mdash; Three Cells</p>
                <p className="text-sm text-gray-300">Label <strong className="text-white">(&quot;Regime&quot;)</strong> &middot; Current state <strong className="text-white">(TREND/RANGE/VOLATILE)</strong> &middot; Guidance <strong className="text-white">(INTACT / HOLDING / CAUTIOUS / FORMING / SHIFTING)</strong>.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">The Five Downstream Effects</p>
                <p className="text-sm text-gray-300">Regime drives: <strong className="text-white">(1)</strong> the header state + color, <strong className="text-white">(2)</strong> which action cells can appear, <strong className="text-white">(3)</strong> the guidance text, <strong className="text-white">(4)</strong> Risk Envelope band widening (+10% in VOLATILE only), <strong className="text-white">(5)</strong> alert JSON payload.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Three Playbooks</p>
                <p className="text-sm text-gray-300"><strong className="text-teal-400">TREND:</strong> ride pullbacks, full size, don&apos;t fade. <strong className="text-amber-400">RANGE:</strong> fade extremes, normal size, don&apos;t chase. <strong className="text-red-400">VOLATILE:</strong> reduce and wait, don&apos;t fade the spike.</p>
              </div>
              <div>
                <p className="text-xs font-bold text-red-400 mb-1">Mistakes to Avoid</p>
                <p className="text-sm text-gray-300">&#10060; Reading only the state, ignoring guidance &middot; &#10060; Assuming regime is persistent &middot; &#10060; Trading on single-bar flicker &middot; &#10060; Ignoring VOLATILE &middot; &#10060; Wrong playbook for regime &middot; &#10060; Turning the Regime row OFF.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S16 — Scenario Game === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">16 &mdash; Scenario Game</p>
          <h2 className="text-2xl font-extrabold mb-4">Read the Regime Like an Operator</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Five scenarios. Each puts you in a real-feeling regime-reading situation. Pick the right call &mdash; explanations appear after every answer, including for the wrong ones.</p>
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
                  <p className="text-xs text-gray-400 mt-1">{finalScore >= 4 ? 'Operator-grade regime reading installed. You see the forecast, not just the state.' : finalScore >= 3 ? 'Solid grasp. Re-read the three-cell discipline (S09) and the RTP progression (S08) before the quiz.' : 'Re-study the guidance cell meanings (S09), the flicker discipline (S12), and the VOLATILE playbook (S13) before the quiz.'}</p>
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
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 11.4: The 3-Regime Engine</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-sky-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Regime Reader Operator &mdash;</p>
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
    </div>
  );
}
