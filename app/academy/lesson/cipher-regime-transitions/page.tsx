// app/academy/lesson/cipher-regime-transitions/page.tsx
// ATLAS Academy — Lesson 11.5: Regime Transitions and Hysteresis [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 11 · CIPHER
// The Three-Stage Warning System — INTACT → FORMING → SHIFTING
// Covers: transition matrix, rolling duration arrays, sigmoid probability,
//         hysteresis rejection design, operator playbooks per stage
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Crown } from 'lucide-react';

// ============================================================
// GAME ROUNDS — 5 scenario-based transition-timing challenges
// String-id answers, per-option explanations (teaches on wrong answers)
// Covers: FORMING read, SHIFTING playbook, flicker vs. guidance,
//         matrix character, timeframe differences
// ============================================================
const gameRounds = [
  {
    id: 'r1',
    scenario:
      'You are long EURUSD 1H. The Command Center Regime row reads: Regime | TREND | \u2192 RANGE FORMING. The chart still looks bullish. Your position is up 1.2R and your stop is at breakeven.',
    prompt: 'What is the correct operator response to FORMING at this moment?',
    options: [
      {
        id: 'a',
        text: 'Close the full position immediately \u2014 FORMING means the regime has already ended.',
        correct: false,
        explain:
          'Wrong. FORMING means the RTP probability has crossed 50% \u2014 not that the regime has ended. Regime cell 2 still reads TREND. The market is aging past its historical average, but the transition has not fired. Closing the full position on FORMING alone abandons profitable trades too early.',
      },
      {
        id: 'b',
        text: 'Ignore it \u2014 the chart looks bullish and FORMING is just a warning, not a signal.',
        correct: false,
        explain:
          'Dangerous. FORMING is not decorative \u2014 it means this TREND has lasted longer than 50% of historical TREND durations on this chart. Combined with a 1.2R position already at breakeven stop, ignoring FORMING risks giving back profit when the transition eventually fires.',
      },
      {
        id: 'c',
        text: 'Take partial profits (30\u201350%), keep the remainder with a tighter trailing stop. Monitor for SHIFTING.',
        correct: true,
        explain:
          'Correct. FORMING is the amber light: probability elevated, regime still active. The operator response is partial exit to lock in profit, tighten the trailing stop, and watch for SHIFTING. If guidance holds at FORMING and price continues, you still participate. If it escalates to SHIFTING, you exit the remainder cleanly.',
      },
      {
        id: 'd',
        text: 'Add to the position \u2014 FORMING means the trend is strong enough to persist.',
        correct: false,
        explain:
          'Backwards. FORMING means the trend is statistically aging \u2014 it has run longer than average. Adding size when the regime is probabilistically late in its lifecycle is the opposite of prudent risk management. INTACT is the window for adding; FORMING is the window for reducing.',
      },
    ],
  },
  {
    id: 'r2',
    scenario:
      'BTCUSDT 15m. The Regime row flips to: Regime | TREND | \u2192 SHIFTING TO RANGE. You have a full-size long position with no stop tightening done yet. This is the first time SHIFTING has appeared on this chart today.',
    prompt: 'SHIFTING has just fired \u2014 what are your immediate actions?',
    options: [
      {
        id: 'a',
        text: 'Wait for the regime to actually flip to RANGE before acting \u2014 SHIFTING is still in TREND.',
        correct: false,
        explain:
          'This is mistake #2 from section 14. By the time regime cell 2 reads RANGE, you are reacting to a completed transition. SHIFTING fires at 75%+ probability \u2014 the transition is imminent. Operators act on SHIFTING, not on the confirmed flip. Waiting for confirmation costs you the best exit price.',
      },
      {
        id: 'b',
        text: 'Close the full position now. Switch to the RANGE playbook for new setups.',
        correct: true,
        explain:
          'Correct. SHIFTING is the red light: probability above 75%, transition imminent. With a full-size unprotected long and SHIFTING firing, the correct action is full exit. The regime is about to change character. Holding through a confirmed transition into RANGE while long is a TREND-playbook error. Switch playbooks now.',
      },
      {
        id: 'c',
        text: 'Reduce position by 10% \u2014 SHIFTING might be a false alarm.',
        correct: false,
        explain:
          'Too timid. SHIFTING means the sigmoid probability has crossed 75% \u2014 this regime has lasted well past its historical average. A 10% reduction leaves 90% of your risk open through a likely regime transition. FORMING is for partial reductions. SHIFTING is for full exit.',
      },
      {
        id: 'd',
        text: 'Reverse short immediately \u2014 if RANGE is coming, price will drop.',
        correct: false,
        explain:
          'RANGE is not a bearish regime \u2014 it is a directionless regime. RANGE following TREND does not mean price reverses; it means the directional move is exhausted and price oscillates within a band. Reversing short into a RANGE transition often results in getting chopped both ways.',
      },
    ],
  },
  {
    id: 'r3',
    scenario:
      'XAUUSD 1H. You watch the Regime row show RANGE | \u2192 TREND INTACT for 8 bars, then suddenly TREND | \u2192 TREND INTACT for 2 bars, then back to RANGE | \u2192 TREND INTACT for 3 bars. The guidance cell has not changed throughout.',
    prompt: 'How do you interpret this behavior?',
    options: [
      {
        id: 'a',
        text: 'CIPHER has a bug \u2014 regime should not flip back and forth this quickly.',
        correct: false,
        explain:
          'Not a bug. CIPHER has no hysteresis \u2014 regime is recomputed every bar from the raw three-score race. When trend_pct and range_pct are near-equal (a near-tie around ADX 25), small bar-to-bar noise flips the winner. This is the documented no-hysteresis behavior from section 02.',
      },
      {
        id: 'b',
        text: 'This is near-tie flicker. The guidance cell staying on INTACT tells you the RTP probability is below 50% \u2014 treat the dominant regime as RANGE and hold your RANGE playbook.',
        correct: true,
        explain:
          'Correct. The guidance cell is the operator\u2019s stability layer. When guidance holds on INTACT through raw regime flicker, the RTP is below 50% probability \u2014 the forecaster is telling you no genuine transition is underway. The near-tie between TREND and RANGE score is just noise at the boundary. Your dominant regime is the one showing most consistently \u2014 here, RANGE.',
      },
      {
        id: 'c',
        text: 'Add a 5-bar smoothing filter of your own to eliminate the flicker.',
        correct: false,
        explain:
          'Unnecessary and counterproductive. The RTP guidance cell already serves as the smoothing layer, probabilistically. Adding your own N-bar filter on top of it double-filters and introduces lag. The whole point of the no-hysteresis + RTP design is that you do not need to build your own smoothing \u2014 read the guidance cell.',
      },
      {
        id: 'd',
        text: 'Switch to the TREND playbook when TREND appears, then back to RANGE \u2014 follow each bar.',
        correct: false,
        explain:
          'This is mistake #3 from section 14: trading on flicker. Bar-by-bar playbook switching during a near-tie produces whipsaw losses. The guidance cell exists precisely to prevent this. INTACT = hold your current playbook regardless of raw regime noise.',
      },
    ],
  },
  {
    id: 'r4',
    scenario:
      'You are analyzing GBPUSD on two timeframes simultaneously. On the 1H chart, the transition matrix shows TREND\u2192RANGE happens 70% of the time. On the 5m chart of the same instrument, TREND\u2192VOLATILE happens 60% of the time.',
    prompt: 'What does this difference in matrix character tell you as an operator?',
    options: [
      {
        id: 'a',
        text: 'One of the charts has a CIPHER settings error \u2014 the same instrument should produce the same matrix.',
        correct: false,
        explain:
          'No error. CIPHER learns its transition matrix from the specific chart\u2019s own history. A 1H chart has different regime dynamics than a 5m chart on the same instrument \u2014 1H regimes last longer and transition more smoothly, while 5m regimes are more responsive to news and volatility spikes. Different timeframe = different choreography.',
      },
      {
        id: 'b',
        text: 'The 1H matrix means TREND tends to exhaust into consolidation. The 5m matrix means TREND on this instrument frequently encounters volatility events (news, spreads). Both are valid and instrument-specific.',
        correct: true,
        explain:
          'Correct. The transition matrix captures the specific character of that instrument on that timeframe. On 1H, GBPUSD trends tend to consolidate after exhaustion \u2014 TREND\u2192RANGE is the natural rhythm. On 5m, economic releases and spread events spike ATR frequently \u2014 TREND\u2192VOLATILE is common. Operators use this knowledge to anticipate what happens AFTER the current regime ends.',
      },
      {
        id: 'c',
        text: 'Use the 5m matrix to override the 1H matrix since 5m has more data points.',
        correct: false,
        explain:
          'Wrong direction. More bars on 5m does not mean better regime transition knowledge for 1H trades. Each timeframe\u2019s matrix is valid only for that timeframe\u2019s regime decisions. Mixing them introduces timeframe confusion. Use the matrix from the timeframe you are trading.',
      },
      {
        id: 'd',
        text: 'The matrices are useless since they track past behavior which may not repeat.',
        correct: false,
        explain:
          'This misunderstands the RTP\u2019s design goal. The transition matrix is probabilistic, not deterministic. It tells you the base rate for what follows the current regime on this specific instrument and timeframe \u2014 the same way knowing a coin lands heads 60% of the time is actionable even though each flip is uncertain. Base rates beat guessing.',
      },
    ],
  },
  {
    id: 'r5',
    scenario:
      'EURUSD 4H. The Regime row has been showing: Regime | RANGE | \u2192 RANGE HOLDING for 22 bars. The historical average RANGE duration on this chart is 18 bars. The transition matrix shows RANGE\u2192TREND at 75%, RANGE\u2192VOLATILE at 25%.',
    prompt: 'What does CIPHER\u2019s RTP tell you about this situation, and what do you prepare for?',
    options: [
      {
        id: 'a',
        text: 'RANGE HOLDING means the regime is perfectly stable \u2014 no action needed.',
        correct: false,
        explain:
          'Incorrect reading. RANGE HOLDING means guidance is currently below the 50% threshold, so it is still in the INTACT/HOLDING state. But the ratio is 22/18 = 1.22 \u2014 the regime is already past its average. The sigmoid at ratio 1.22 gives approximately 68\u201370% probability, which means guidance should be showing TREND FORMING, not HOLDING. Recheck the actual guidance cell \u2014 it may have updated.',
      },
      {
        id: 'b',
        text: 'At 22 bars vs. 18-bar average (ratio 1.22), probability is above 50%. Guidance should be TREND FORMING. Prepare for TREND entry setups \u2014 75% matrix probability means TREND is the most likely next regime.',
        correct: true,
        explain:
          'Correct. Ratio 1.22 puts sigmoid probability at approximately 68%, which crosses the 50% FORMING threshold. Guidance should read TREND FORMING (or similar). The transition matrix confirms TREND is the most likely next state at 75%. Operator preparation: watch for TREND entry signals, tighten any short-mean-reversion positions, and be ready to flip to the TREND playbook when the flip fires.',
      },
      {
        id: 'c',
        text: 'RANGE at 22 bars is normal variance \u2014 historical averages have wide bands.',
        correct: false,
        explain:
          'Technically true but misses the point of the RTP system. The sigmoid is designed specifically to account for variance \u2014 at exactly the average it outputs ~60%, not 100%. The point is that the probability is now elevated meaningfully above 50%, and the matrix gives you a directional bias for what comes next. Ignoring this information is leaving the forecaster\u2019s signal unused.',
      },
      {
        id: 'd',
        text: 'Add size to the RANGE trade \u2014 ranges that exceed their average tend to widen further.',
        correct: false,
        explain:
          'This is the inverse of what the data suggests. A regime that has exceeded its historical average duration has a higher-than-50% probability of ending soon. Adding size at elevated transition probability is mistake #5 from section 14 \u2014 treating FORMING as confirmation rather than warning.',
      },
    ],
  },
];

// ============================================================
// QUIZ QUESTIONS — 8 questions, 66% pass threshold
// Covers: guidance labels, sigmoid math, matrix logic, no-hysteresis,
//         timeframe character, Pine implementation, operator discipline
// ============================================================
const quizQuestions = [
  {
    id: 'q1',
    question:
      'At what RTP probability threshold does the guidance cell flip from INTACT/HOLDING to X FORMING?',
    options: [
      { id: 'a', text: '25%', correct: false },
      { id: 'b', text: '50%', correct: true },
      { id: 'c', text: '75%', correct: false },
      { id: 'd', text: '90%', correct: false },
    ],
    explain:
      'The Pine code at line 3351 reads: shift_likely = rtp_change_prob > 50. When probability crosses 50%, the guidance cell switches from the stable state (INTACT / HOLDING / CAUTIOUS) to X FORMING. The 75% threshold is for SHIFTING.',
  },
  {
    id: 'q2',
    question:
      'The sigmoid formula used by the RTP is sigmoid(\u22123.5 \u00d7 (ratio \u2212 1.0)). At ratio = 1.0 (duration exactly at historical average), what probability does the sigmoid output?',
    options: [
      { id: 'a', text: 'Approximately 25%', correct: false },
      { id: 'b', text: 'Approximately 50%', correct: false },
      { id: 'c', text: 'Approximately 60%', correct: true },
      { id: 'd', text: 'Approximately 80%', correct: false },
    ],
    explain:
      'The Pine comment on line 572 documents the actual calibration: at 100% of avg (ratio = 1.0) the sigmoid outputs approximately 60%, not 50%. The 50% FORMING threshold is crossed slightly before the regime reaches its historical average. This is intentional \u2014 it gives an earlier warning than a naive midpoint would.',
  },
  {
    id: 'q3',
    question:
      'How many duration values does the RTP store per regime type in its rolling history arrays?',
    options: [
      { id: 'a', text: '10', correct: false },
      { id: 'b', text: '20', correct: false },
      { id: 'c', text: '30', correct: true },
      { id: 'd', text: '50', correct: false },
    ],
    explain:
      'Pine line 532: rtp_max_history = 30. Each of the three arrays (dur_trend, dur_range, dur_volatile) stores a maximum of 30 completed regime durations. When the 31st is added, array.shift() removes the oldest. The average (used for sigmoid input) is computed across whatever is stored.',
  },
  {
    id: 'q4',
    question:
      'The transition matrix tracks six transition paths. If the current regime is RANGE and the matrix shows tr_range_trend = 14 and tr_range_volatile = 6, what does the RTP output as "most likely next"?',
    options: [
      { id: 'a', text: 'VOLATILE \u2014 it is less frequent and therefore more surprising', correct: false },
      { id: 'b', text: 'TREND \u2014 higher counter wins the simple comparison', correct: true },
      { id: 'c', text: 'RANGE \u2014 regime self-perpetuates by default', correct: false },
      { id: 'd', text: 'Cannot determine without the full 6-counter matrix', correct: false },
    ],
    explain:
      'Pine lines 585\u2013587: rtp_next = tr_range_trend >= tr_range_volatile ? "TREND" : "VOLATILE". Simple integer comparison between the two destination counters for the current regime row. 14 >= 6 \u2192 TREND wins as most likely next. The matrix does not use percentages for this decision \u2014 just which counter is larger.',
  },
  {
    id: 'q5',
    question:
      'The guidance cell reads "\u2192 SHIFTING TO RANGE" while the regime cell (col 2) still reads TREND. What color does the guidance cell render in?',
    options: [
      { id: 'a', text: 'Teal \u2014 TREND color', correct: false },
      { id: 'b', text: 'Magenta \u2014 danger color', correct: false },
      { id: 'c', text: 'Amber \u2014 both FORMING and SHIFTING use amber', correct: true },
      { id: 'd', text: 'White \u2014 neutral color for guidance text', correct: false },
    ],
    explain:
      'Pine line 3354: regime_guide_clr = shift_imminent ? AMBER : shift_likely ? AMBER : regime_row_clr. Both FORMING and SHIFTING render in AMBER regardless of which regime is being predicted. The stable guidance states (INTACT, HOLDING, CAUTIOUS) render in the current regime\u2019s color. This was confirmed in the screenshot from lesson setup: "\u2192 RANGE FORMING" in amber while TREND is teal.',
  },
  {
    id: 'q6',
    question:
      'Why does CIPHER use no N-bar hysteresis for regime classification?',
    options: [
      { id: 'a', text: 'N-bar locks cause Pine Script compilation errors', correct: false },
      { id: 'b', text: 'Hysteresis hides flicker but also hides early warnings; the RTP probability layer provides stability without hiding truth', correct: true },
      { id: 'c', text: 'Hysteresis would require too many additional inputs', correct: false },
      { id: 'd', text: 'Hysteresis only works on higher timeframes', correct: false },
    ],
    explain:
      'The design choice is documented in the CIPHER source comment: "No other indicator predicts WHEN the market will change character." Hysteresis delays regime confirmation by N bars, which delays the early warning signal by the same amount. CIPHER reports truth every bar and uses the RTP\u2019s three-stage guidance as the operator\u2019s smoothing layer \u2014 without introducing artificial lag.',
  },
  {
    id: 'q7',
    question:
      'Two charts of the same instrument on different timeframes produce different transition matrices. Which statement is correct?',
    options: [
      { id: 'a', text: 'The higher timeframe matrix is more reliable and should override the lower', correct: false },
      { id: 'b', text: 'The matrices are independently valid; each timeframe has its own regime choreography', correct: true },
      { id: 'c', text: 'The matrices should be averaged to produce a combined next-regime probability', correct: false },
      { id: 'd', text: 'Mismatched matrices indicate a CIPHER configuration error', correct: false },
    ],
    explain:
      'Each timeframe\u2019s matrix is learned independently from that chart\u2019s own history. A 1H EURUSD matrix captures 1H regime behavior (longer durations, smooth transitions). A 5m matrix captures 5m behavior (shorter durations, more VOLATILE events). Both are valid for their respective timeframe. Use the matrix from the timeframe you are executing on.',
  },
  {
    id: 'q8',
    question:
      'The FORMING guidance fires when RTP probability is 50\u201375%. What is the correct operator response during FORMING?',
    options: [
      { id: 'a', text: 'Full position close and playbook switch', correct: false },
      { id: 'b', text: 'Do nothing \u2014 regime is still active', correct: false },
      { id: 'c', text: 'Partial exit, stop tightening, prepare for SHIFTING', correct: true },
      { id: 'd', text: 'Add size \u2014 regime is confirmed strong', correct: false },
    ],
    explain:
      'FORMING is the amber light \u2014 probability elevated but regime still active. The three-stage operator response: (1) take partial profits 30\u201350%, (2) tighten the trailing stop to lock in remaining gain, (3) watch for SHIFTING escalation. Full exit happens at SHIFTING (75%+). Ignoring FORMING or adding size at FORMING are both documented mistakes from section 14.',
  },
];

// ============================================================
// CANVAS ANIMATION PRIMITIVE
// Shared across all animation components — consistent scroll-play
// Only animates when visible (IntersectionObserver), pauses off-screen
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
// CONFETTI — 120 particles, 5-second auto-off, cert reveal
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
        p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.r += p.vr;
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
// ANIMATION 1 — ThreeStageWarningAnim (S01 — Groundbreaking Concept)
// Four-scene cycle: INTACT → FORMING threshold → SHIFTING threshold → Transition fires
// Sigmoid curve with live marker, matching screenshot CC row below
// ============================================================
function ThreeStageWarningAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL    = '#26A69A';
    const AMBER   = '#FFB300';
    const MAGENTA = '#EF5350';
    const AVG     = 35;

    // sigmoid exactly matching Pine line 574
    const sigmoid = (ratio: number) =>
      Math.min(95, Math.max(5, 100 / (1 + Math.exp(-3.5 * (ratio - 1.0)))));

    // 4 scenes × 5s = 20s loop
    const SCENE_DUR = 5.0;
    const cycleT    = t % (SCENE_DUR * 4);
    const sceneIdx  = Math.min(3, Math.floor(cycleT / SCENE_DUR));
    const sceneT    = (cycleT % SCENE_DUR) / SCENE_DUR;

    const scenes = [
      { label: 'SCENE 1 \u00b7 INTACT \u2014 Regime stable', targetRatio: 0.55, regime: 'TREND',  regimeColor: TEAL,  stage: 'INTACT',   stageColor: TEAL,    guidance: '\u2192 TREND INTACT',      guideColor: TEAL    },
      { label: 'SCENE 2 \u00b7 FORMING \u2014 Probability elevated', targetRatio: 1.05, regime: 'TREND',  regimeColor: TEAL,  stage: 'FORMING',  stageColor: AMBER,   guidance: '\u2192 RANGE FORMING',    guideColor: AMBER   },
      { label: 'SCENE 3 \u00b7 SHIFTING \u2014 Transition imminent', targetRatio: 1.42, regime: 'TREND',  regimeColor: TEAL,  stage: 'SHIFTING', stageColor: MAGENTA, guidance: '\u2192 SHIFTING TO RANGE', guideColor: AMBER   },
      { label: 'SCENE 4 \u00b7 TRANSITION FIRED \u2014 Regime reset', targetRatio: 0.09, regime: 'RANGE',  regimeColor: AMBER, stage: 'INTACT',   stageColor: TEAL,    guidance: '\u2192 RANGE HOLDING',    guideColor: AMBER   },
    ];
    const s = scenes[sceneIdx];

    // Eased progress within scene (ease-in-out quad)
    const easedT = sceneT < 0.5 ? 2 * sceneT * sceneT : 1 - Math.pow(-2 * sceneT + 2, 2) / 2;
    const curRatio = s.targetRatio * (0.88 + 0.12 * easedT);
    const curProb  = sigmoid(curRatio);
    const markerColor = curProb > 75 ? MAGENTA : curProb > 50 ? AMBER : TEAL;

    // ── Scene label ──
    ctx.fillStyle = 'rgba(255,179,0,0.65)';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(s.label, 16, 18);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${sceneIdx + 1} / 4`, w - 16, 18);

    // ── Sigmoid chart ──
    const chartX = 46;
    const chartY = 30;
    const chartW = w - 92;
    const chartH = h * 0.46;

    // Axes
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(chartX, chartY);
    ctx.lineTo(chartX, chartY + chartH);
    ctx.lineTo(chartX + chartW, chartY + chartH);
    ctx.stroke();

    // Threshold dashed lines + right-side labels
    const thresholds = [{ pct: 50, color: AMBER, label: 'FORMING' }, { pct: 75, color: MAGENTA, label: 'SHIFTING' }];
    thresholds.forEach(({ pct, color, label }) => {
      const gy = chartY + chartH - (pct / 100) * chartH;
      ctx.strokeStyle = color + '44';
      ctx.setLineDash([3, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(chartX, gy);
      ctx.lineTo(chartX + chartW, gy);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = color + 'bb';
      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(pct + '%', chartX - 5, gy + 3);
      ctx.textAlign = 'left';
      ctx.fillText(label, chartX + chartW + 5, gy + 3);
    });

    // Y top/bottom labels
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('95%', chartX - 5, chartY + 4);
    ctx.fillText('0%', chartX - 5, chartY + chartH + 3);

    // X avg marker
    const avgX = chartX + chartW / 2;
    ctx.strokeStyle = AMBER + '44';
    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(avgX, chartY);
    ctx.lineTo(avgX, chartY + chartH);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = AMBER + '88';
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('avg (' + AVG + 'b)', avgX, chartY + chartH + 11);
    ctx.fillText('0', chartX, chartY + chartH + 11);
    ctx.fillText('2\u00d7 avg', chartX + chartW, chartY + chartH + 11);

    // Sigmoid curve
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i <= 120; i++) {
      const prog = i / 120;
      const r = prog * 2;
      const p = sigmoid(r);
      const x = chartX + prog * chartW;
      const y = chartY + chartH - (p / 100) * chartH;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Animated marker
    const markerRatio = Math.min(2, curRatio);
    const markerX = chartX + (markerRatio / 2) * chartW;
    const markerY = chartY + chartH - (curProb / 100) * chartH;

    ctx.strokeStyle = markerColor + '44';
    ctx.setLineDash([2, 3]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(markerX, markerY);
    ctx.lineTo(markerX, chartY + chartH);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.shadowBlur = 18;
    ctx.shadowColor = markerColor;
    ctx.fillStyle = markerColor;
    ctx.beginPath();
    ctx.arc(markerX, markerY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // ── Readout row ──
    const readY = chartY + chartH + 18;
    const readH = 50;
    const slotW  = (w - 32) / 3;
    const readouts = [
      { label: 'DURATION',    val: Math.round(curRatio * AVG) + 'b', color: s.regimeColor },
      { label: 'AVG (30-bar)', val: AVG + 'b',                        color: 'rgba(255,255,255,0.5)' },
      { label: 'PROBABILITY', val: Math.round(curProb) + '%',         color: markerColor },
    ];
    readouts.forEach((r, i) => {
      const rx = 16 + i * slotW;
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      ctx.fillRect(rx, readY, slotW - 8, readH);
      ctx.strokeRect(rx, readY, slotW - 8, readH);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(r.label, rx + 10, readY + 13);
      ctx.fillStyle = r.color;
      ctx.font = 'bold 17px "SF Mono", monospace';
      ctx.fillText(r.val, rx + 10, readY + 37);
    });

    // ── CC row strip ──
    const ccY = readY + readH + 10;
    const ccH  = 32;
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.fillRect(16, ccY, w - 32, ccH);
    ctx.strokeRect(16, ccY, w - 32, ccH);
    const cellW = (w - 32) / 3;
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '11px "SF Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Regime', 28, ccY + 20);
    ctx.fillStyle = s.regimeColor;
    ctx.font = 'bold 12px "SF Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(s.regime, 16 + cellW * 1.5, ccY + 20);
    ctx.fillStyle = s.guideColor;
    ctx.font = '11px "SF Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(s.guidance, w - 28, ccY + 20);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 2 — HysteresisCompareAnim (S02)
// Left: lagged indicator — same bar sequence but 5-bar lock before regime change
// Right: CIPHER — truth every bar, guidance cell is the stability layer
// Shows why no-hysteresis reveals early warnings that lag hides
// ============================================================
function HysteresisCompareAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL    = '#26A69A';
    const AMBER   = '#FFB300';
    const MAGENTA = '#EF5350';

    const padX   = 16;
    const padTop = 36;
    const gap    = 14;
    const panelW = (w - padX * 2 - gap) / 2;
    const panelH = h - padTop - 24;

    // Header
    ctx.fillStyle = 'rgba(255,179,0,0.65)';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SAME PRICE ACTION \u2014 DIFFERENT DESIGN CHOICE', w / 2, 18);

    // Shared regime sequence — 40 bars, trend aging into transition
    const barCount = 40;
    const scrollOffset = (t * 5) % barCount;
    const rawRegimes: string[] = [];
    for (let i = 0; i < barCount + 10; i++) {
      // ADX-like oscillation crossing the 25 threshold around bar 30
      const adx = 32 - Math.max(0, (i - 22) * 0.6) + Math.sin(i * 0.4) * 3;
      rawRegimes.push(adx >= 25 ? 'TREND' : 'RANGE');
    }

    const drawPanel = (panelX: number, title: string, useHysteresis: boolean, titleColor: string) => {
      // Panel bg
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(panelX, padTop, panelW, panelH);
      ctx.strokeStyle = useHysteresis ? MAGENTA + '33' : TEAL + '33';
      ctx.lineWidth = 1;
      ctx.strokeRect(panelX, padTop, panelW, panelH);

      // Title pill
      ctx.fillStyle = useHysteresis ? MAGENTA + '18' : TEAL + '18';
      ctx.fillRect(panelX, padTop, panelW, 20);
      ctx.fillStyle = titleColor;
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(title, panelX + panelW / 2, padTop + 13);

      // Bar chart area
      const chartX = panelX + 8;
      const chartW2 = panelW - 16;
      const chartY2 = padTop + 28;
      const chartH2 = panelH - 56;
      const barW = chartW2 / barCount - 1;

      // Apply 5-bar hysteresis if needed
      let displayRegimes: string[] = [...rawRegimes.slice(0, barCount)];
      if (useHysteresis) {
        let lockCount = 0;
        let lockedRegime = displayRegimes[0];
        displayRegimes = displayRegimes.map((r) => {
          if (r !== lockedRegime) {
            lockCount++;
            if (lockCount >= 5) { lockedRegime = r; lockCount = 0; return r; }
            return lockedRegime;
          }
          lockCount = 0;
          return r;
        });
      }

      displayRegimes.forEach((regime, i) => {
        const bx = chartX + i * (barW + 1);
        const color = regime === 'TREND' ? TEAL : regime === 'RANGE' ? AMBER : MAGENTA;
        ctx.fillStyle = color + 'cc';
        ctx.fillRect(bx, chartY2, barW, chartH2);

        // Regime label inside bar (for wider bars)
        if (barW > 12 && i % 5 === 0) {
          ctx.fillStyle = color;
          ctx.font = 'bold 7px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.save();
          ctx.translate(bx + barW / 2, chartY2 + chartH2 / 2);
          ctx.rotate(-Math.PI / 2);
          ctx.fillText(regime[0], 0, 3);
          ctx.restore();
        }
      });

      // Key insight: mark the FIRST bar where raw regime changes
      const firstChange = rawRegimes.findIndex((r, i) => i > 0 && r !== rawRegimes[i - 1]);
      if (firstChange > 0) {
        const fx = chartX + firstChange * (barW + 1);
        const warningY = chartY2 - 4;
        if (!useHysteresis) {
          // CIPHER shows change immediately
          ctx.strokeStyle = TEAL;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(fx, warningY - 6);
          ctx.lineTo(fx, chartY2 + chartH2);
          ctx.stroke();
          ctx.fillStyle = TEAL;
          ctx.font = 'bold 7px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('TRUTH', fx, warningY - 8);
        } else {
          // Lagged shows change 5 bars later
          const laggedChange = firstChange + 5;
          if (laggedChange < barCount) {
            const lx = chartX + laggedChange * (barW + 1);
            ctx.strokeStyle = MAGENTA;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(lx, warningY - 6);
            ctx.lineTo(lx, chartY2 + chartH2);
            ctx.stroke();
            ctx.fillStyle = MAGENTA;
            ctx.font = 'bold 7px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('+5 LAG', lx, warningY - 8);
          }
        }
      }

      // Bottom label
      const bottomText = useHysteresis ? '5-bar lock hides early warning' : 'Guidance cell = stability layer';
      ctx.fillStyle = useHysteresis ? MAGENTA + 'cc' : TEAL + 'cc';
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(bottomText, panelX + panelW / 2, padTop + panelH - 6);
    };

    drawPanel(padX, 'OTHER INDICATORS \u2014 5-bar lock', true, MAGENTA);
    drawPanel(padX + panelW + gap, 'CIPHER \u2014 no hysteresis', false, TEAL);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 3 — IntactStateAnim (S03)
// CC row replica showing INTACT state with probability < 50%
// Live duration counter, sigmoid at low ratio, guidance stable
// ============================================================
function IntactStateAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL  = '#26A69A';
    const AMBER = '#FFB300';
    const AVG   = 35;
    const sigmoid = (r: number) => Math.min(95, Math.max(5, 100 / (1 + Math.exp(-3.5 * (r - 1.0)))));

    // Duration oscillates 5 → 18 bars (staying in INTACT zone, ratio 0.14 → 0.51)
    const duration = 5 + ((t * 3) % (AVG * 0.52));
    const ratio    = duration / AVG;
    const prob     = sigmoid(ratio);

    // Header
    ctx.fillStyle = 'rgba(255,179,0,0.65)';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('INTACT \u2014 Regime active, probability below 50%', w / 2, 18);

    // CC row — 3-column replica from screenshot
    const rowY = 30;
    const rowH = 36;
    const rowW = w - 32;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(16, rowY, rowW, rowH);
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 1;
    ctx.strokeRect(16, rowY, rowW, rowH);

    const col1 = 16 + rowW * 0.2;
    const col2 = 16 + rowW * 0.6;

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '12px "SF Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Regime', 28, rowY + 23);
    ctx.fillStyle = TEAL;
    ctx.font = 'bold 13px "SF Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TREND', col1 + (col2 - col1) / 2, rowY + 23);
    ctx.fillStyle = TEAL;
    ctx.font = '12px "SF Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText('\u2192 TREND INTACT', 16 + rowW - 12, rowY + 23);

    // Metrics grid
    const gridY = rowY + rowH + 16;
    const slotW = (w - 32) / 3;

    const metrics = [
      { label: 'DURATION',   val: Math.round(duration) + 'b',   color: TEAL },
      { label: 'AVG (30-bar)', val: AVG + 'b',                   color: 'rgba(255,255,255,0.5)' },
      { label: 'PROBABILITY', val: Math.round(prob) + '%',       color: TEAL },
    ];
    metrics.forEach((m, i) => {
      const mx = 16 + i * slotW;
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.fillRect(mx, gridY, slotW - 8, 54);
      ctx.strokeRect(mx, gridY, slotW - 8, 54);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(m.label, mx + 10, gridY + 14);
      ctx.fillStyle = m.color;
      ctx.font = 'bold 18px "SF Mono", monospace';
      ctx.fillText(m.val, mx + 10, gridY + 38);
    });

    // Probability bar
    const barY = gridY + 62;
    const barW2 = w - 32;
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(16, barY, barW2, 6);
    ctx.fillStyle = TEAL;
    ctx.fillRect(16, barY, (prob / 100) * barW2, 6);

    // 50% threshold marker
    const marker50X = 16 + barW2 * 0.5;
    ctx.strokeStyle = AMBER + '88';
    ctx.setLineDash([2, 3]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(marker50X, barY - 4);
    ctx.lineTo(marker50X, barY + 10);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = AMBER + 'cc';
    ctx.font = 'bold 8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FORMING threshold', marker50X, barY + 20);

    // Operator action
    const actionY = barY + 34;
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.strokeStyle = TEAL + '33';
    ctx.fillRect(16, actionY, w - 32, 40);
    ctx.strokeRect(16, actionY, w - 32, 40);
    ctx.fillStyle = TEAL + 'cc';
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('OPERATOR ACTION', 28, actionY + 14);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText('Run playbook with full conviction. Add size on valid setups.', 28, actionY + 30);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 4 — FormingStateAnim (S04)
// Live CC row showing FORMING state from actual screenshot data
// Probability 50-75%, guidance in amber, operator actions displayed
// ============================================================
function FormingStateAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL    = '#26A69A';
    const AMBER   = '#FFB300';
    const MAGENTA = '#EF5350';
    const AVG     = 35;
    const sigmoid = (r: number) => Math.min(95, Math.max(5, 100 / (1 + Math.exp(-3.5 * (r - 1.0)))));

    // Duration oscillates 36 → 50 bars (FORMING zone, ratio 1.03 → 1.43)
    const duration = 36 + ((t * 2) % (AVG * 0.4));
    const ratio    = duration / AVG;
    const prob     = sigmoid(ratio);

    // Header — replicated from screenshot
    ctx.fillStyle = 'rgba(255,179,0,0.65)';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FORMING \u2014 Probability 50\u201375%, amber guidance active', w / 2, 18);

    // Header row (CIPHER PRO header — as seen in screenshot)
    const hdrY = 28;
    const hdrH = 28;
    const rowW = w - 32;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(16, hdrY, rowW, hdrH);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.strokeRect(16, hdrY, rowW, hdrH);
    ctx.fillStyle = TEAL;
    ctx.font = 'bold 11px "SF Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('\u25b2 BULL TREND', 16 + rowW * 0.35, hdrY + 18);
    ctx.fillStyle = AMBER;
    ctx.font = '10px "SF Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText('\u2192 TREND AGING', 16 + rowW - 12, hdrY + 18);

    // Ribbon row
    const ribY = hdrY + hdrH + 1;
    const ribH = 24;
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(16, ribY, rowW, ribH);
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.strokeRect(16, ribY, rowW, ribH);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px "SF Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Ribbon', 28, ribY + 15);
    ctx.fillStyle = TEAL;
    ctx.font = 'bold 10px "SF Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('\u25b2 BULL', 16 + rowW * 0.5, ribY + 15);
    ctx.fillStyle = AMBER;
    ctx.font = '10px "SF Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText('\u2192 AGING  42b (avg 30)', 16 + rowW - 12, ribY + 15);

    // Regime row — FORMING state (from screenshot)
    const regY = ribY + ribH + 1;
    const regH = 28;
    ctx.fillStyle = 'rgba(255,179,0,0.06)';
    ctx.fillRect(16, regY, rowW, regH);
    ctx.strokeStyle = AMBER + '33';
    ctx.strokeRect(16, regY, rowW, regH);
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '12px "SF Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Regime', 28, regY + 19);
    ctx.fillStyle = TEAL;
    ctx.font = 'bold 13px "SF Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TREND', 16 + rowW * 0.5, regY + 19);
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 12px "SF Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText('\u2192 RANGE FORMING', 16 + rowW - 12, regY + 19);

    // Metrics
    const gridY = regY + regH + 14;
    const slotW = (w - 32) / 3;
    const metrics = [
      { label: 'DURATION',    val: Math.round(duration) + 'b', color: TEAL },
      { label: 'AVG (30-bar)', val: AVG + 'b',                  color: 'rgba(255,255,255,0.5)' },
      { label: 'PROBABILITY', val: Math.round(prob) + '%',      color: AMBER },
    ];
    metrics.forEach((m, i) => {
      const mx = 16 + i * slotW;
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      ctx.fillRect(mx, gridY, slotW - 8, 50);
      ctx.strokeRect(mx, gridY, slotW - 8, 50);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(m.label, mx + 10, gridY + 13);
      ctx.fillStyle = m.color;
      ctx.font = 'bold 17px "SF Mono", monospace';
      ctx.fillText(m.val, mx + 10, gridY + 36);
    });

    // Probability bar (amber zone)
    const barY2 = gridY + 58;
    const barW2  = w - 32;
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(16, barY2, barW2, 5);
    ctx.fillStyle = AMBER;
    ctx.fillRect(16, barY2, (prob / 100) * barW2, 5);
    // 75% threshold
    const m75X = 16 + barW2 * 0.75;
    ctx.strokeStyle = MAGENTA + '88';
    ctx.setLineDash([2, 3]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(m75X, barY2 - 3);
    ctx.lineTo(m75X, barY2 + 9);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = MAGENTA + 'cc';
    ctx.font = 'bold 8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SHIFTING at 75%', m75X, barY2 + 18);

    // Operator action
    const actY = barY2 + 26;
    ctx.fillStyle = 'rgba(255,179,0,0.06)';
    ctx.strokeStyle = AMBER + '33';
    ctx.fillRect(16, actY, w - 32, 36);
    ctx.strokeRect(16, actY, w - 32, 36);
    ctx.fillStyle = AMBER + 'cc';
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('OPERATOR ACTION', 28, actY + 13);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText('Take 30\u201350% partials. Tighten trailing stop. Watch for SHIFTING.', 28, actY + 27);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 5 — ShiftingStateAnim (S05)
// CC row at SHIFTING — prob > 75%, "→ SHIFTING TO X" in amber
// Shows operator decision tree: exit position, switch playbook
// ============================================================
function ShiftingStateAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL    = '#26A69A';
    const AMBER   = '#FFB300';
    const MAGENTA = '#EF5350';
    const AVG     = 35;
    const sigmoid = (r: number) => Math.min(95, Math.max(5, 100 / (1 + Math.exp(-3.5 * (r - 1.0)))));

    // Two sub-scenes: SHIFTING imminent (4s) → flip fires (4s) → repeat
    const cycleT  = t % 8;
    const sceneIdx = Math.floor(cycleT / 4);
    const sceneT   = (cycleT % 4) / 4;

    const isShifting = sceneIdx === 0;
    const duration   = isShifting ? AVG * 1.44 : 4 + sceneT * 8;
    const ratio      = duration / AVG;
    const prob       = sigmoid(ratio);
    const markerColor = prob > 75 ? MAGENTA : prob > 50 ? AMBER : TEAL;

    const regime      = isShifting ? 'TREND'  : 'RANGE';
    const regimeColor = isShifting ? TEAL     : AMBER;
    const guidance    = isShifting ? '\u2192 SHIFTING TO RANGE' : '\u2192 RANGE HOLDING';
    const guideColor  = isShifting ? AMBER    : AMBER;
    const sceneLabel  = isShifting
      ? 'SCENE 1 \u00b7 SHIFTING \u2014 Transition imminent (prob > 75%)'
      : 'SCENE 2 \u00b7 TRANSITION FIRED \u2014 New regime, clock reset';

    // Scene label
    ctx.fillStyle = isShifting ? MAGENTA + 'cc' : TEAL + 'cc';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(sceneLabel, 16, 18);

    // CC rows — header + regime
    const hdrY = 28;
    const rowW = w - 32;

    // Header row
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(16, hdrY, rowW, 26);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.strokeRect(16, hdrY, rowW, 26);
    ctx.fillStyle = isShifting ? TEAL : AMBER;
    ctx.font = 'bold 11px "SF Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(isShifting ? '\u25b2 BULL TREND' : '\u25b3 RANGE', 16 + rowW * 0.35, hdrY + 17);
    ctx.fillStyle = AMBER;
    ctx.font = '10px "SF Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(isShifting ? '\u2192 TREND AGING' : '\u2192 RANGE HOLDING', 16 + rowW - 12, hdrY + 17);

    // Regime row — highlighted
    const regY = hdrY + 27;
    const regH = 30;
    ctx.fillStyle = isShifting ? 'rgba(239,83,80,0.07)' : 'rgba(255,179,0,0.05)';
    ctx.fillRect(16, regY, rowW, regH);
    ctx.strokeStyle = isShifting ? MAGENTA + '44' : AMBER + '33';
    ctx.strokeRect(16, regY, rowW, regH);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '12px "SF Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Regime', 28, regY + 20);
    ctx.fillStyle = regimeColor;
    ctx.font = 'bold 13px "SF Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(regime, 16 + rowW * 0.5, regY + 20);
    ctx.fillStyle = guideColor;
    ctx.font = isShifting ? 'bold 12px "SF Mono", monospace' : '11px "SF Mono", monospace';
    if (isShifting) {
      ctx.shadowBlur = 8;
      ctx.shadowColor = AMBER;
    }
    ctx.textAlign = 'right';
    ctx.fillText(guidance, 16 + rowW - 12, regY + 20);
    ctx.shadowBlur = 0;

    // Metrics
    const gridY = regY + regH + 12;
    const slotW  = (w - 32) / 3;
    const metrics = [
      { label: 'DURATION',    val: Math.round(duration) + 'b', color: regimeColor },
      { label: 'AVG (30-bar)', val: AVG + 'b',                  color: 'rgba(255,255,255,0.45)' },
      { label: 'PROBABILITY', val: Math.round(prob) + '%',      color: markerColor },
    ];
    metrics.forEach((m, i) => {
      const mx = 16 + i * slotW;
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      ctx.fillRect(mx, gridY, slotW - 8, 50);
      ctx.strokeRect(mx, gridY, slotW - 8, 50);
      ctx.fillStyle = 'rgba(255,255,255,0.38)';
      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(m.label, mx + 10, gridY + 13);
      ctx.fillStyle = m.color;
      ctx.font = 'bold 17px "SF Mono", monospace';
      ctx.fillText(m.val, mx + 10, gridY + 36);
    });

    // Prob bar — full in scene 1
    const barY = gridY + 56;
    const barW2 = w - 32;
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(16, barY, barW2, 5);
    const barFill = isShifting ? prob : sigmoid(ratio);
    ctx.fillStyle = barFill > 75 ? MAGENTA : barFill > 50 ? AMBER : TEAL;
    ctx.fillRect(16, barY, (Math.min(barFill, 95) / 100) * barW2, 5);

    // Threshold markers
    [50, 75].forEach((pct, i) => {
      const mx2 = 16 + barW2 * (pct / 100);
      ctx.strokeStyle = (i === 0 ? AMBER : MAGENTA) + '66';
      ctx.setLineDash([2, 3]);
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(mx2, barY - 3); ctx.lineTo(mx2, barY + 8); ctx.stroke();
      ctx.setLineDash([]);
    });

    // Operator action box
    const actY = barY + 16;
    const actBg = isShifting ? 'rgba(239,83,80,0.06)' : 'rgba(38,166,154,0.05)';
    const actBorder = isShifting ? MAGENTA + '33' : TEAL + '22';
    ctx.fillStyle = actBg;
    ctx.strokeStyle = actBorder;
    ctx.fillRect(16, actY, w - 32, 42);
    ctx.strokeRect(16, actY, w - 32, 42);
    ctx.fillStyle = (isShifting ? MAGENTA : TEAL) + 'cc';
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('OPERATOR ACTION', 28, actY + 13);
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = '11px Inter, sans-serif';
    const actionText = isShifting
      ? 'Exit full position. Switch playbook now. Do not wait for cell 2 to flip.'
      : 'New regime born. Clock reset to bar 1. Begin RANGE playbook.';
    ctx.fillText(actionText, 28, actY + 28);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 6 — SigmoidDeepDiveAnim (S06)
// Full sigmoid curve with annotated zones
// Shows lazy-early behavior: at 50% of avg, prob only ~25%
// Live dual-label: ratio on X, prob on Y, zone highlighted
// ============================================================
function SigmoidDeepDiveAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL    = '#26A69A';
    const AMBER   = '#FFB300';
    const MAGENTA = '#EF5350';
    const sigmoid = (r: number) => Math.min(95, Math.max(5, 100 / (1 + Math.exp(-3.5 * (r - 1.0)))));

    // Animated marker sweeps 0 → 2× avg over 10s, then resets
    const cyclePeriod = 10;
    const cycleT  = t % cyclePeriod;
    const ratio   = (cycleT / cyclePeriod) * 2.0;
    const prob    = sigmoid(ratio);
    const markerColor = prob > 75 ? MAGENTA : prob > 50 ? AMBER : TEAL;

    // Header
    ctx.fillStyle = 'rgba(255,179,0,0.65)';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SIGMOID CALIBRATION \u2014 at 50% of avg \u2248 25% \u00b7 at avg \u2248 60% \u00b7 at 1.4\u00d7 avg \u2248 82%', w / 2, 16);

    // Chart bounds
    const chartX = 52;
    const chartY = 26;
    const chartW = w - 104;
    const chartH = h * 0.52;

    // Axes
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(chartX, chartY);
    ctx.lineTo(chartX, chartY + chartH);
    ctx.lineTo(chartX + chartW, chartY + chartH);
    ctx.stroke();

    // Colored zone fills behind curve
    const zones = [
      { from: 0,    to: 0.5,  color: TEAL    + '0a', label: '' },
      { from: 0.5,  to: 0.75, color: AMBER   + '0d', label: '' },
      { from: 0.75, to: 1.0,  color: MAGENTA + '0a', label: '' },
    ];
    zones.forEach(({ from, to, color }) => {
      const x1 = chartX + (from / 1) * chartW;
      const x2 = chartX + (to  / 1) * chartW;
      ctx.fillStyle = color;
      ctx.fillRect(x1, chartY, x2 - x1, chartH);
    });

    // Y-axis labels
    [0, 25, 50, 75, 95].forEach((pct) => {
      const gy = chartY + chartH - (pct / 100) * chartH;
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '9px "SF Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(pct + '%', chartX - 5, gy + 3);
      if (pct === 50 || pct === 75) {
        ctx.strokeStyle = (pct === 50 ? AMBER : MAGENTA) + '33';
        ctx.setLineDash([3, 4]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(chartX, gy);
        ctx.lineTo(chartX + chartW, gy);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    // X-axis: annotated key ratios
    const keyRatios = [
      { r: 0.5,  label: '0.5\u00d7',  sublabel: '~25%', color: TEAL  },
      { r: 1.0,  label: '1.0\u00d7',  sublabel: '~60%', color: AMBER },
      { r: 1.42, label: '1.42\u00d7', sublabel: '~82%', color: MAGENTA },
    ];
    keyRatios.forEach(({ r, label, sublabel, color }) => {
      const kx = chartX + (r / 2) * chartW;
      ctx.strokeStyle = color + '44';
      ctx.setLineDash([2, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(kx, chartY);
      ctx.lineTo(kx, chartY + chartH);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = color + 'cc';
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, kx, chartY + chartH + 11);
      ctx.fillStyle = color + '99';
      ctx.font = '8px Inter, sans-serif';
      ctx.fillText(sublabel, kx, chartY + chartH + 21);
    });

    // x-axis base labels
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('0', chartX, chartY + chartH + 11);
    ctx.fillText('2\u00d7 avg', chartX + chartW, chartY + chartH + 11);
    ctx.fillText('ratio = duration \u00f7 avg', chartX + chartW / 2, chartY + chartH + 33);

    // Sigmoid curve — full
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= 200; i++) {
      const prog = i / 200;
      const r = prog * 2;
      const p = sigmoid(r);
      const x = chartX + prog * chartW;
      const y = chartY + chartH - (p / 100) * chartH;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Animated marker dot
    const markerRatio = Math.min(2, ratio);
    const markerX = chartX + (markerRatio / 2) * chartW;
    const markerY = chartY + chartH - (prob / 100) * chartH;

    ctx.strokeStyle = markerColor + '55';
    ctx.setLineDash([2, 3]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(markerX, markerY);
    ctx.lineTo(markerX, chartY + chartH);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(chartX, markerY);
    ctx.lineTo(markerX, markerY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.shadowBlur = 16;
    ctx.shadowColor = markerColor;
    ctx.fillStyle = markerColor;
    ctx.beginPath();
    ctx.arc(markerX, markerY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Live readout — side panel
    const panX = chartX + chartW + 12;
    const panW  = w - panX - 8;
    if (panW > 40) {
      const labels2 = ['ratio', 'prob', 'stage'];
      const vals2   = [
        ratio.toFixed(2) + '\u00d7',
        Math.round(prob) + '%',
        prob > 75 ? 'SHIFT' : prob > 50 ? 'FORM' : 'INTACT',
      ];
      const colors2 = [TEAL, markerColor, markerColor];
      labels2.forEach((lbl, i) => {
        const ry = chartY + i * 44;
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = 'bold 8px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(lbl, panX, ry + 11);
        ctx.fillStyle = colors2[i];
        ctx.font = 'bold 14px "SF Mono", monospace';
        ctx.fillText(vals2[i], panX, ry + 28);
      });
    }

    // Zone legend at bottom
    const legY = chartY + chartH + 42;
    const zones2 = [
      { label: 'INTACT < 50%', color: TEAL    },
      { label: 'FORMING 50\u201375%', color: AMBER   },
      { label: 'SHIFTING > 75%', color: MAGENTA },
    ];
    const legSlotW = chartW / 3;
    zones2.forEach(({ label, color }, i) => {
      const lx = chartX + i * legSlotW;
      ctx.fillStyle = color + 'cc';
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, lx + legSlotW / 2, legY);
    });
  }, []);

  return <AnimScene draw={draw} aspectRatio={4 / 3} />;
}

// ============================================================
// ANIMATION 7 — RollingArrayAnim (S07)
// Shows the 30-deep array filling bar-by-bar with push/shift
// Three arrays: dur_trend / dur_range / dur_volatile
// Visualizes how array.avg() changes as history builds
// ============================================================
function RollingArrayAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL    = '#26A69A';
    const AMBER   = '#FFB300';
    const MAGENTA = '#EF5350';

    // Simulate array filling over time — one push every 0.6s
    const MAX = 30;
    const pushInterval = 0.6;
    const totalPushes  = Math.floor((t % (MAX * pushInterval * 2)) / pushInterval);
    const pushCount    = Math.min(MAX, totalPushes);

    // Synthetic TREND durations (realistic variance: 15–55 bars)
    const seed = (n: number, offset: number) => {
      let x = Math.sin(n * 127.1 + offset * 311.7) * 43758.5453;
      x = x - Math.floor(x);
      return 15 + Math.floor(x * 41);
    };
    const durations: number[] = Array.from({ length: pushCount }, (_, i) => seed(i, 7));
    const avg = pushCount > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / pushCount) : 0;

    // Header
    ctx.fillStyle = 'rgba(255,179,0,0.65)';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('dur_trend[ ] \u2014 last 30 completed TREND durations', 16, 16);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${pushCount} / ${MAX} stored`, w - 16, 16);

    // Array slot grid — 30 slots in 3 rows of 10
    const slotW  = (w - 32) / 10;
    const slotH  = 36;
    const slotGap = 3;
    const gridX  = 16;
    const gridY  = 26;
    const maxDur = 60;

    for (let i = 0; i < MAX; i++) {
      const col = i % 10;
      const row = Math.floor(i / 10);
      const sx  = gridX + col * (slotW);
      const sy  = gridY + row * (slotH + slotGap);
      const dur = durations[i];
      const filled = i < pushCount;
      const isNewest = i === pushCount - 1 && filled;

      // Slot background
      ctx.fillStyle = filled ? 'rgba(38,166,154,0.08)' : 'rgba(255,255,255,0.03)';
      ctx.strokeStyle = filled
        ? (isNewest ? TEAL : 'rgba(38,166,154,0.3)')
        : 'rgba(255,255,255,0.06)';
      ctx.lineWidth = isNewest ? 1.5 : 1;
      ctx.fillRect(sx, sy, slotW - slotGap, slotH);
      ctx.strokeRect(sx, sy, slotW - slotGap, slotH);

      if (filled) {
        // Mini bar showing duration magnitude
        const barH = Math.max(2, (dur / maxDur) * (slotH - 14));
        ctx.fillStyle = isNewest ? TEAL : TEAL + '77';
        ctx.fillRect(sx + 2, sy + slotH - 2 - barH, slotW - slotGap - 4, barH);

        // Value label
        ctx.fillStyle = isNewest ? TEAL : 'rgba(255,255,255,0.6)';
        ctx.font = `${isNewest ? 'bold ' : ''}9px "SF Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(String(dur), sx + (slotW - slotGap) / 2, sy + 11);
      } else {
        // Empty slot dash
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.font = '9px "SF Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('\u2014', sx + (slotW - slotGap) / 2, sy + 20);
      }
    }

    // Array.avg() readout
    const statsY = gridY + 3 * (slotH + slotGap) + 10;
    const statsH = 46;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    ctx.fillRect(16, statsY, w - 32, statsH);
    ctx.strokeRect(16, statsY, w - 32, statsH);

    const statSlotW = (w - 32) / 3;
    const stats = [
      { label: 'array.size()',  val: String(pushCount), color: TEAL },
      { label: 'array.avg()',   val: pushCount > 0 ? avg + 'b' : '\u2014',  color: AMBER },
      { label: 'rtp_max',       val: String(MAX),       color: 'rgba(255,255,255,0.4)' },
    ];
    stats.forEach((s, i) => {
      const sx2 = 16 + i * statSlotW;
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(s.label, sx2 + 12, statsY + 14);
      ctx.fillStyle = s.color;
      ctx.font = 'bold 18px "SF Mono", monospace';
      ctx.fillText(s.val, sx2 + 12, statsY + 36);
    });

    // Overflow callout — when pushCount = MAX
    if (pushCount >= MAX) {
      const ovY = statsY + statsH + 8;
      ctx.fillStyle = 'rgba(255,179,0,0.07)';
      ctx.strokeStyle = AMBER + '33';
      ctx.fillRect(16, ovY, w - 32, 28);
      ctx.strokeRect(16, ovY, w - 32, 28);
      ctx.fillStyle = AMBER + 'cc';
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('array.size() = 30 \u2192 next push triggers array.shift() \u2014 oldest value removed', 28, ovY + 18);
    }
  }, []);

  return <AnimScene draw={draw} aspectRatio={4 / 3} />;
}

// ============================================================
// ANIMATION 8 — TransitionMatrixAnim (S08)
// 6-cell matrix populating from regime history
// Shows counters incrementing, "most likely next" arrow updating
// Three cycles: TREND-dominant chart → RANGE-dominant → balanced
// ============================================================
function TransitionMatrixAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL    = '#26A69A';
    const AMBER   = '#FFB300';
    const MAGENTA = '#EF5350';

    // 3 chart scenarios, 6s each
    const cycleT   = t % 18;
    const sceneIdx = Math.floor(cycleT / 6);
    const sceneT   = (cycleT % 6) / 6;

    const scenarios = [
      {
        label: 'EURUSD 1H \u2014 Trend-dominant chart',
        tr: { TR: 12, TV: 3 },
        rt: { RT: 8,  RV: 2 },
        vt: { VT: 5,  VR: 3 },
        current: 'TREND',
      },
      {
        label: 'GBPUSD 5m \u2014 Volatile events frequent',
        tr: { TR: 6,  TV: 9 },
        rt: { RT: 5,  RV: 4 },
        vt: { VT: 7,  VR: 5 },
        current: 'RANGE',
      },
      {
        label: 'XAUUSD 4H \u2014 Balanced transitions',
        tr: { TR: 8,  TV: 7 },
        rt: { RT: 9,  RV: 8 },
        vt: { VT: 6,  VR: 7 },
        current: 'VOLATILE',
      },
    ];
    const sc = scenarios[sceneIdx];

    // Header
    ctx.fillStyle = 'rgba(255,179,0,0.65)';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(sc.label, 16, 16);
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${sceneIdx + 1} / 3`, w - 16, 16);

    // Matrix layout — 3 rows (FROM) × 2 cols (TO: X and Y)
    const matX   = 16;
    const matY   = 28;
    const cellW  = (w - 32 - 80) / 3;
    const cellH  = 48;
    const cellGap = 4;
    const labelW = 76;

    // Column headers
    const toLabels = [
      { text: '\u2192 TREND', color: TEAL    },
      { text: '\u2192 RANGE', color: AMBER   },
      { text: '\u2192 VOLATILE', color: MAGENTA },
    ];
    toLabels.forEach((lbl, i) => {
      ctx.fillStyle = lbl.color + 'aa';
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(lbl.text, matX + labelW + i * (cellW + cellGap) + cellW / 2, matY - 4);
    });

    // Rows: FROM TREND / FROM RANGE / FROM VOLATILE
    const rows = [
      {
        from: 'TREND', fromColor: TEAL,
        cells: [
          { val: 0,           color: 'rgba(255,255,255,0.1)', note: '\u2014 self' },
          { val: sc.tr.TR,    color: TEAL,    note: '' },
          { val: sc.tr.TV,    color: MAGENTA, note: '' },
        ],
        nextIdx: sc.tr.TR >= sc.tr.TV ? 1 : 2,
        currentMatch: sc.current === 'TREND',
      },
      {
        from: 'RANGE', fromColor: AMBER,
        cells: [
          { val: sc.rt.RT,    color: TEAL,    note: '' },
          { val: 0,           color: 'rgba(255,255,255,0.1)', note: '\u2014 self' },
          { val: sc.rt.RV,    color: MAGENTA, note: '' },
        ],
        nextIdx: sc.rt.RT >= sc.rt.RV ? 0 : 2,
        currentMatch: sc.current === 'RANGE',
      },
      {
        from: 'VOLATILE', fromColor: MAGENTA,
        cells: [
          { val: sc.vt.VT,    color: TEAL,    note: '' },
          { val: sc.vt.VR,    color: AMBER,   note: '' },
          { val: 0,           color: 'rgba(255,255,255,0.1)', note: '\u2014 self' },
        ],
        nextIdx: sc.vt.VT >= sc.vt.VR ? 0 : 1,
        currentMatch: sc.current === 'VOLATILE',
      },
    ];

    rows.forEach((row, ri) => {
      const ry = matY + ri * (cellH + cellGap);
      const isCurrent = row.currentMatch;

      // FROM label
      ctx.fillStyle = isCurrent ? row.fromColor : row.fromColor + '77';
      ctx.font = `${isCurrent ? 'bold ' : ''}10px Inter, sans-serif`;
      ctx.textAlign = 'left';
      if (isCurrent) {
        ctx.shadowBlur = 6;
        ctx.shadowColor = row.fromColor;
      }
      ctx.fillText('FROM ' + row.from, matX, ry + cellH / 2 + 4);
      ctx.shadowBlur = 0;

      row.cells.forEach((cell, ci) => {
        const cx2 = matX + labelW + ci * (cellW + cellGap);
        const isWinner = isCurrent && ci === row.nextIdx && cell.val > 0 && sceneT > 0.5;

        ctx.fillStyle = isWinner ? cell.color + '22' : 'rgba(0,0,0,0.3)';
        ctx.strokeStyle = isWinner ? cell.color : 'rgba(255,255,255,0.06)';
        ctx.lineWidth   = isWinner ? 2 : 1;
        ctx.fillRect(cx2, ry, cellW, cellH);
        ctx.strokeRect(cx2, ry, cellW, cellH);

        if (cell.note) {
          ctx.fillStyle = 'rgba(255,255,255,0.18)';
          ctx.font = '9px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(cell.note, cx2 + cellW / 2, ry + cellH / 2 + 4);
        } else {
          // Animated count fill
          const displayVal = Math.floor(cell.val * Math.min(1, sceneT * 2.5));
          ctx.fillStyle = isWinner ? cell.color : cell.color + '88';
          ctx.font = `bold ${isWinner ? '20' : '16'}px "SF Mono", monospace`;
          ctx.textAlign = 'center';
          if (isWinner) { ctx.shadowBlur = 10; ctx.shadowColor = cell.color; }
          ctx.fillText(String(displayVal), cx2 + cellW / 2, ry + cellH / 2 + 6);
          ctx.shadowBlur = 0;

          if (isWinner) {
            ctx.fillStyle = cell.color + 'cc';
            ctx.font = 'bold 8px Inter, sans-serif';
            ctx.fillText('MOST LIKELY', cx2 + cellW / 2, ry + cellH - 5);
          }
        }
      });
    });

    // Current regime + most-likely readout
    const readY = matY + 3 * (cellH + cellGap) + 10;
    const currentRow = rows.find((r) => r.currentMatch)!;
    const nextLabels = ['\u2192 TREND', '\u2192 RANGE', '\u2192 VOLATILE'];
    const nextColors = [TEAL, AMBER, MAGENTA];

    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.fillRect(16, readY, w - 32, 44);
    ctx.strokeRect(16, readY, w - 32, 44);

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('CURRENT REGIME', 28, readY + 14);
    ctx.fillStyle = currentRow.fromColor;
    ctx.font = 'bold 16px "SF Mono", monospace';
    ctx.fillText(sc.current, 28, readY + 34);

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MOST LIKELY NEXT', w / 2, readY + 14);
    const nextI = currentRow.nextIdx;
    ctx.fillStyle = nextColors[nextI];
    ctx.font = 'bold 16px "SF Mono", monospace';
    ctx.fillText(nextLabels[nextI], w / 2, readY + 34);

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('DETERMINATION', w - 28, readY + 14);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '10px "SF Mono", monospace';
    ctx.fillText('highest counter wins', w - 28, readY + 34);
  }, []);

  return <AnimScene draw={draw} aspectRatio={4 / 3} />;
}

// ============================================================
// ANIMATION 9 — TFCharacterAnim (S09)
// Side-by-side: same instrument, 1H vs 15m transition matrices
// Shows different choreography — 1H has TREND→RANGE dominant,
// 15m has TREND→VOLATILE dominant due to news/spread events
// ============================================================
function TFCharacterAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL    = '#26A69A';
    const AMBER   = '#FFB300';
    const MAGENTA = '#EF5350';

    const padX  = 14;
    const padTop = 32;
    const gap    = 12;
    const panelW = (w - padX * 2 - gap) / 2;
    const panelH = h - padTop - 16;

    // Header
    ctx.fillStyle = 'rgba(255,179,0,0.65)';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SAME INSTRUMENT \u2014 DIFFERENT TIMEFRAME \u2014 DIFFERENT CHOREOGRAPHY', w / 2, 16);

    const panels = [
      {
        tf: 'EURUSD 1H',
        tfColor: TEAL,
        note: 'Trends exhaust into consolidation',
        avgDur: { trend: 38, range: 22, volatile: 8 },
        matrix: [
          { from: 'TREND',    to: 'RANGE',    pct: 73, color: AMBER   },
          { from: 'TREND',    to: 'VOLATILE', pct: 27, color: MAGENTA },
          { from: 'RANGE',    to: 'TREND',    pct: 68, color: TEAL    },
          { from: 'RANGE',    to: 'VOLATILE', pct: 32, color: MAGENTA },
        ],
        dominant: 'TREND \u2192 RANGE (73%)',
        dominantColor: AMBER,
      },
      {
        tf: 'EURUSD 15m',
        tfColor: MAGENTA,
        note: 'News events spike volatility frequently',
        avgDur: { trend: 18, range: 14, volatile: 6 },
        matrix: [
          { from: 'TREND',    to: 'RANGE',    pct: 38, color: AMBER   },
          { from: 'TREND',    to: 'VOLATILE', pct: 62, color: MAGENTA },
          { from: 'RANGE',    to: 'TREND',    pct: 55, color: TEAL    },
          { from: 'RANGE',    to: 'VOLATILE', pct: 45, color: MAGENTA },
        ],
        dominant: 'TREND \u2192 VOLATILE (62%)',
        dominantColor: MAGENTA,
      },
    ];

    panels.forEach((panel, pi) => {
      const px = padX + pi * (panelW + gap);

      // Panel bg
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.strokeStyle = panel.tfColor + '33';
      ctx.lineWidth = 1;
      ctx.fillRect(px, padTop, panelW, panelH);
      ctx.strokeRect(px, padTop, panelW, panelH);

      // TF label pill
      ctx.fillStyle = panel.tfColor + '18';
      ctx.fillRect(px, padTop, panelW, 22);
      ctx.fillStyle = panel.tfColor;
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(panel.tf, px + panelW / 2, padTop + 14);

      // Avg duration row
      const durY = padTop + 28;
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('AVG DURATION:', px + 10, durY);
      const durLabels = [
        { r: 'T', v: panel.avgDur.trend,    c: TEAL    },
        { r: 'R', v: panel.avgDur.range,    c: AMBER   },
        { r: 'V', v: panel.avgDur.volatile, c: MAGENTA },
      ];
      durLabels.forEach(({ r, v, c }, i) => {
        ctx.fillStyle = c + 'cc';
        ctx.font = 'bold 9px "SF Mono", monospace';
        ctx.fillText(`${r}:${v}b`, px + 10 + i * (panelW - 20) / 3, durY + 13);
      });

      // Matrix rows — horizontal bars
      const matStartY = durY + 24;
      const barMaxW   = panelW - 24;
      const barH2     = 18;
      const barGap2    = 5;

      panel.matrix.forEach((row, ri) => {
        const ry = matStartY + ri * (barH2 + barGap2);
        const growT = Math.min(1, (t % 3) * 0.5);
        const barFill = (row.pct / 100) * barMaxW * growT;

        // Track
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        ctx.fillRect(px + 12, ry, barMaxW, barH2);

        // Bar
        ctx.fillStyle = row.color + '99';
        ctx.fillRect(px + 12, ry, barFill, barH2);

        // Label
        ctx.fillStyle = row.color;
        ctx.font = 'bold 8px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${row.from[0]}\u2192${row.to[0]}`, px + 14, ry + 12);

        // Percent
        ctx.fillStyle = row.color + 'cc';
        ctx.font = 'bold 9px "SF Mono", monospace';
        ctx.textAlign = 'right';
        ctx.fillText(row.pct + '%', px + 12 + barMaxW - 2, ry + 12);
      });

      // Dominant pattern callout
      const domY = matStartY + panel.matrix.length * (barH2 + barGap2) + 6;
      ctx.fillStyle = panel.dominantColor + '10';
      ctx.strokeStyle = panel.dominantColor + '33';
      ctx.fillRect(px + 10, domY, panelW - 20, 28);
      ctx.strokeRect(px + 10, domY, panelW - 20, 28);
      ctx.fillStyle = panel.dominantColor;
      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('DOMINANT: ' + panel.dominant, px + panelW / 2, domY + 11);
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.font = '8px Inter, sans-serif';
      ctx.fillText(panel.note, px + panelW / 2, domY + 23);
    });
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 10 — FormingPlaybookAnim (S10)
// Three-step sequence: FORMING fires → partial exit → stop tightened
// Live P&L bar showing profit locked vs exposed
// ============================================================
function FormingPlaybookAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL    = '#26A69A';
    const AMBER   = '#FFB300';
    const MAGENTA = '#EF5350';

    const cycleT  = t % 12;
    const stepIdx = Math.min(2, Math.floor(cycleT / 4));
    const stepT   = (cycleT % 4) / 4;
    const eased   = 1 - Math.pow(1 - Math.min(1, stepT * 1.6), 3);

    const steps = [
      { label: 'STEP 1 \u00b7 FORMING fires \u2014 read the signal',   posSize: 1.0, stopPct: 0.18, partialTaken: 0,   desc: 'Full position open. Guidance flips amber. Probability 50\u201375%.' },
      { label: 'STEP 2 \u00b7 Take 40% partial profit',                posSize: 0.6, stopPct: 0.18, partialTaken: 0.4, desc: '40% closed at market. 60% remains. Profit locked on partial.' },
      { label: 'STEP 3 \u00b7 Tighten trailing stop',                  posSize: 0.6, stopPct: 0.52, partialTaken: 0.4, desc: 'Stop moved to 52% of run. Remainder protected. Watch for SHIFTING.' },
    ];
    const s = steps[stepIdx];

    ctx.fillStyle = AMBER + 'cc';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(s.label, 16, 16);

    // CC regime row
    const ccY = 24;
    const rowW = w - 32;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(16, ccY, rowW, 26);
    ctx.strokeStyle = AMBER + '33';
    ctx.lineWidth = 1;
    ctx.strokeRect(16, ccY, rowW, 26);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '11px "SF Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Regime', 28, ccY + 17);
    ctx.fillStyle = TEAL;
    ctx.font = 'bold 12px "SF Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TREND', 16 + rowW * 0.5, ccY + 17);
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px "SF Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText('\u2192 RANGE FORMING', 16 + rowW - 12, ccY + 17);

    // Position diagram
    const diagX = 16;
    const diagY = 58;
    const diagW = w - 32;
    const diagH = 58;
    const priceY = diagY + diagH * 0.45;

    const entryX   = diagX + diagW * 0.08;
    const currentX = diagX + diagW * 0.92;

    // Entry
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(entryX, diagY + 6); ctx.lineTo(entryX, diagY + diagH - 6); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = 'bold 8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ENTRY', entryX, diagY + 3);

    // Animated stop
    const stopXBase  = diagX + diagW * 0.1;
    const stopXTight = diagX + diagW * 0.55;
    const stopX      = stepIdx < 2 ? stopXBase : stopXBase + (stopXTight - stopXBase) * eased;
    ctx.strokeStyle = MAGENTA + '99';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(stopX, diagY + 6); ctx.lineTo(stopX, diagY + diagH - 6); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = MAGENTA + 'cc';
    ctx.font = 'bold 8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('STOP', stopX, diagY + diagH + 2);

    // Current price
    ctx.strokeStyle = TEAL + '88';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(currentX, diagY + 6); ctx.lineTo(currentX, diagY + diagH - 6); ctx.stroke();
    ctx.fillStyle = TEAL;
    ctx.font = 'bold 8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('NOW', currentX, diagY + 3);

    // Profit zone
    ctx.fillStyle = TEAL + '18';
    ctx.fillRect(entryX, priceY - 10, currentX - entryX, 20);

    // Partial exit marker
    if (stepIdx >= 1) {
      const partialX = diagX + diagW * 0.55;
      ctx.fillStyle = AMBER + 'cc';
      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('40% CLOSED', partialX, priceY - 14);
      ctx.strokeStyle = AMBER + '88';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath(); ctx.moveTo(partialX, priceY - 12); ctx.lineTo(partialX, priceY + 8); ctx.stroke();
      ctx.setLineDash([]);
    }

    // P&L bars
    const plY = diagY + diagH + 14;
    const plH = 24;
    const lockedPct = stepIdx >= 1 ? 0.4 * eased : 0;
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fillRect(diagX, plY, diagW, plH);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.strokeRect(diagX, plY, diagW, plH);
    if (lockedPct > 0) {
      ctx.fillStyle = AMBER + 'cc';
      ctx.fillRect(diagX, plY, diagW * lockedPct, plH);
    }
    ctx.fillStyle = TEAL + '88';
    ctx.fillRect(diagX + diagW * lockedPct, plY, diagW * (1 - lockedPct) * 0.6, plH);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('LOCKED ' + Math.round(lockedPct * 100) + '%', diagX + 8, plY + 16);
    ctx.fillStyle = TEAL + 'cc';
    ctx.textAlign = 'right';
    ctx.fillText('EXPOSED ' + Math.round((1 - lockedPct) * 60) + '%', diagX + diagW - 8, plY + 16);

    // Desc
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(s.desc, w / 2, plY + plH + 14);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 11 — ShiftingPlaybookAnim (S11)
// 4-step timeline: FORMING partial done → SHIFTING fires → flip → new regime
// ============================================================
function ShiftingPlaybookAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL    = '#26A69A';
    const AMBER   = '#FFB300';
    const MAGENTA = '#EF5350';

    const cycleT  = t % 14;
    const stepIdx = Math.min(3, Math.floor(cycleT / 3.5));
    const stepT   = (cycleT % 3.5) / 3.5;
    const eased   = 1 - Math.pow(1 - Math.min(1, stepT * 1.8), 3);

    const steps = [
      { label: 'FORMING \u2014 partial exit done',         regime: 'TREND', guidance: '\u2192 RANGE FORMING',    gc: AMBER,  posLabel: '60% remaining',      posColor: TEAL,    actions: ['Hold 60% remainder', 'Trailing stop tightened', 'Watch for SHIFTING'] },
      { label: 'SHIFTING fires \u2014 exit full remainder', regime: 'TREND', guidance: '\u2192 SHIFTING TO RANGE', gc: AMBER,  posLabel: 'EXIT NOW \u2014 closing\u2026', posColor: MAGENTA, actions: ['EXIT full remainder NOW', 'Cancel pending long orders', 'Do not wait for cell 2 flip'] },
      { label: 'Regime flips \u2014 clock resets',         regime: 'RANGE', guidance: '\u2192 RANGE HOLDING',    gc: AMBER,  posLabel: 'FLAT \u2014 no position', posColor: 'rgba(255,255,255,0.5)', actions: ['Position closed \u2014 FLAT', 'Regime confirmed RANGE', 'Duration reset to bar 1'] },
      { label: 'RANGE INTACT \u2014 prepare new setups',   regime: 'RANGE', guidance: '\u2192 RANGE HOLDING',    gc: AMBER,  posLabel: 'RANGE playbook active', posColor: AMBER,   actions: ['Identify range boundaries', 'Mean-revert setups on support', 'Wait for RANGE INTACT'] },
    ];
    const s = steps[stepIdx];

    ctx.fillStyle = stepIdx === 1 ? MAGENTA + 'cc' : AMBER + 'cc';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(s.label, 16, 14);
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('step ' + (stepIdx + 1) + ' / 4', w - 16, 14);

    // Timeline strip
    const tlY = 22;
    const tlH = 18;
    const tlW = w - 32;
    const segs = [
      { label: 'TREND INTACT', color: TEAL,    pct: 0.28 },
      { label: 'FORMING',      color: AMBER,   pct: 0.22 },
      { label: 'SHIFTING',     color: MAGENTA, pct: 0.08 },
      { label: 'RANGE INTACT', color: AMBER,   pct: 0.42 },
    ];
    let rx2 = 16;
    segs.forEach((seg, i) => {
      const sw = tlW * seg.pct;
      const isA = i === stepIdx;
      ctx.fillStyle = isA ? seg.color + '44' : seg.color + '18';
      ctx.strokeStyle = isA ? seg.color + '88' : 'transparent';
      ctx.lineWidth = 1;
      ctx.fillRect(rx2, tlY, sw, tlH);
      if (isA) ctx.strokeRect(rx2, tlY, sw, tlH);
      if (sw > 36) {
        ctx.fillStyle = isA ? seg.color : seg.color + '55';
        ctx.font = `${isA ? 'bold ' : ''}7px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(seg.label, rx2 + sw / 2, tlY + 12);
      }
      rx2 += sw;
    });

    // CC row
    const ccY = tlY + tlH + 6;
    const rowW = w - 32;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(16, ccY, rowW, 26);
    ctx.strokeStyle = stepIdx === 1 ? MAGENTA + '44' : AMBER + '22';
    ctx.lineWidth = 1;
    ctx.strokeRect(16, ccY, rowW, 26);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '11px "SF Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Regime', 28, ccY + 17);
    ctx.fillStyle = s.regime === 'TREND' ? TEAL : AMBER;
    ctx.font = 'bold 12px "SF Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(s.regime, 16 + rowW * 0.5, ccY + 17);
    ctx.fillStyle = s.gc;
    ctx.font = stepIdx === 1 ? 'bold 11px "SF Mono", monospace' : '11px "SF Mono", monospace';
    if (stepIdx === 1) { ctx.shadowBlur = 8; ctx.shadowColor = AMBER; }
    ctx.textAlign = 'right';
    ctx.fillText(s.guidance, 16 + rowW - 12, ccY + 17);
    ctx.shadowBlur = 0;

    // Position status box
    const posY = ccY + 32;
    const posH = 36;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(16, posY, rowW, posH);
    ctx.strokeRect(16, posY, rowW, posH);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = 'bold 8px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('POSITION', 28, posY + 13);
    ctx.fillStyle = s.posColor;
    ctx.font = 'bold 15px "SF Mono", monospace';
    ctx.fillText(s.posLabel, 28, posY + 30);

    // Action list
    const actY = posY + posH + 8;
    const actH = h - actY - 8;
    if (actH > 20) {
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.fillRect(16, actY, rowW, actH);
      ctx.strokeRect(16, actY, rowW, actH);
      s.actions.forEach((line, i) => {
        ctx.fillStyle = stepIdx === 1 ? MAGENTA + 'cc' : AMBER + 'bb';
        ctx.font = 'bold 9px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('\u25b6', 26, actY + 13 + i * 15);
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = '10px Inter, sans-serif';
        ctx.fillText(line, 38, actY + 13 + i * 15);
      });
    }
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 12 — VolatileTransitionAnim (S12)
// VOLATILE is the shortest regime — RTP escalates fast
// Side-by-side: V→TREND vs V→RANGE candle patterns + RTP bar
// ============================================================
function VolatileTransitionAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL    = '#26A69A';
    const AMBER   = '#FFB300';
    const MAGENTA = '#EF5350';

    const padX   = 14;
    const padTop = 30;
    const gap    = 12;
    const panelW = (w - padX * 2 - gap) / 2;
    const panelH = h - padTop - 14;

    ctx.fillStyle = 'rgba(255,179,0,0.65)';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VOLATILE avg duration: ~7 bars \u2014 RTP escalates faster than TREND or RANGE', w / 2, 14);

    const panels = [
      { title: 'V \u2192 TREND',  titleColor: TEAL,  nextRegime: 'TREND',  desc: 'ATR spike resolves directionally', bullAfter: true  },
      { title: 'V \u2192 RANGE',  titleColor: AMBER, nextRegime: 'RANGE',  desc: 'ATR spike fades into oscillation',  bullAfter: false },
    ];

    panels.forEach((panel, pi) => {
      const px = padX + pi * (panelW + gap);

      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.strokeStyle = panel.titleColor + '33';
      ctx.lineWidth = 1;
      ctx.fillRect(px, padTop, panelW, panelH);
      ctx.strokeRect(px, padTop, panelW, panelH);

      ctx.fillStyle = panel.titleColor + '18';
      ctx.fillRect(px, padTop, panelW, 18);
      ctx.fillStyle = panel.titleColor;
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(panel.title, px + panelW / 2, padTop + 12);

      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '8px Inter, sans-serif';
      ctx.fillText(panel.desc, px + panelW / 2, padTop + 27);

      // Candle chart
      const chartX = px + 8;
      const chartY = padTop + 32;
      const chartW2 = panelW - 16;
      const chartH2 = panelH - 68;
      const midY   = chartY + chartH2 * 0.5;
      const barCount = 22;
      const barW   = chartW2 / barCount - 1;
      const divX   = chartX + 7 * (barW + 1);

      // Divider
      ctx.strokeStyle = MAGENTA + '44';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 3]);
      ctx.beginPath(); ctx.moveTo(divX, chartY - 2); ctx.lineTo(divX, chartY + chartH2 + 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = MAGENTA + '88';
      ctx.font = 'bold 7px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('VOLATILE', chartX + 3.5 * (barW + 1), chartY - 4);
      ctx.fillStyle = panel.titleColor + '88';
      ctx.fillText(panel.nextRegime, divX + (chartX + chartW2 - divX) / 2, chartY - 4);

      for (let i = 0; i < barCount; i++) {
        const bx = chartX + i * (barW + 1);
        const isVol = i < 7;
        let bh: number, bull: boolean;
        if (isVol) {
          bh = 18 + Math.abs(Math.sin(i * 1.4 + t * 0.5)) * 30;
          bull = Math.sin(i * 2.1 + t * 0.3) > 0;
        } else if (panel.bullAfter) {
          const prog = (i - 7) / 15;
          bh = 8 + prog * 18;
          bull = true;
        } else {
          bh = 10 + Math.abs(Math.sin((i - 7) * 0.9 + t * 0.4)) * 8;
          bull = Math.sin((i - 7) * 1.1) > 0;
        }
        const barColor = isVol ? MAGENTA : (bull ? TEAL : MAGENTA);
        ctx.fillStyle = barColor + (isVol ? 'dd' : '99');
        ctx.fillRect(bx, midY - bh / 2, barW, Math.min(bh, chartH2 * 0.85));
      }

      // RTP bar
      const rtpY = chartY + chartH2 + 4;
      const rtpH = 16;
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(px + 8, rtpY, panelW - 16, rtpH);
      ctx.fillStyle = MAGENTA + 'cc';
      ctx.fillRect(px + 8, rtpY, (panelW - 16) * 0.78, rtpH);
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('RTP 78% \u2192 SHIFTING TO ' + panel.nextRegime, px + 12, rtpY + 11);
    });
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 13 — FullCCContextAnim (S13)
// Full CC: Regime + Header + Ribbon + Momentum updating together
// Cycles INTACT → FORMING, shows multi-row simultaneous amber shift
// ============================================================
function FullCCContextAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL    = '#26A69A';
    const AMBER   = '#FFB300';

    const cycleT    = t % 12;
    const isForming = cycleT >= 6;

    ctx.fillStyle = 'rgba(255,179,0,0.65)';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      isForming
        ? 'FORMING fires \u2014 multiple rows shift to amber simultaneously'
        : 'INTACT \u2014 full Command Center stable, teal throughout',
      w / 2, 14
    );

    const rows = [
      { label: 'CIPHER PRO', isHeader: true,
        intactState: '\u25b2 BULL TREND', intactAction: '\u2192 TREND HOLDING', intactSc: TEAL, intactAc: TEAL,
        formingState: '\u25b2 BULL TREND', formingAction: '\u2192 TREND AGING', formingSc: TEAL, formingAc: AMBER },
      { label: 'Ribbon', isHeader: false,
        intactState: '\u25b2 BULL', intactAction: '\u2192 PRIME', intactSc: TEAL, intactAc: TEAL,
        formingState: '\u25b2 BULL', formingAction: '\u2192 AGING  42b (avg 30)', formingSc: TEAL, formingAc: AMBER },
      { label: 'Momentum', isHeader: false,
        intactState: '\u25b2 BUILDING  88%', intactAction: '\u2192 ACCELERATING', intactSc: TEAL, intactAc: TEAL,
        formingState: '\u25b2 FADING  90%\u2014', formingAction: '\u2192 REDUCE SIZE', formingSc: AMBER, formingAc: AMBER },
      { label: 'Regime', isHeader: false, highlight: true,
        intactState: 'TREND', intactAction: '\u2192 TREND INTACT', intactSc: TEAL, intactAc: TEAL,
        formingState: 'TREND', formingAction: '\u2192 RANGE FORMING', formingSc: TEAL, formingAc: AMBER },
      { label: 'Last Signal', isHeader: false,
        intactState: '\u25b2 Long  22 bars', intactAction: '\u2192 ACTIVE', intactSc: TEAL, intactAc: TEAL,
        formingState: '\u25b2 Long  45 bars', formingAction: '\u2192 AGING', formingSc: TEAL, formingAc: AMBER },
    ];

    const rowH   = 26;
    const rowW   = w - 32;
    const startY = 22;
    const rowGap = 2;

    rows.forEach((row, ri) => {
      const ry = startY + ri * (rowH + rowGap);
      const isHighlight = (row as { highlight?: boolean }).highlight;
      const stateText  = isForming ? row.formingState  : row.intactState;
      const actionText = isForming ? row.formingAction : row.intactAction;
      const stateColor  = isForming ? row.formingSc : row.intactSc;
      const actionColor = isForming ? row.formingAc : row.intactAc;

      ctx.fillStyle = isHighlight && isForming
        ? 'rgba(255,179,0,0.06)'
        : row.isHeader ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.35)';
      ctx.fillRect(16, ry, rowW, rowH);
      ctx.strokeStyle = isHighlight && isForming ? AMBER + '33' : 'rgba(255,255,255,0.05)';
      ctx.lineWidth = isHighlight && isForming ? 1.5 : 1;
      ctx.strokeRect(16, ry, rowW, rowH);

      ctx.fillStyle = row.isHeader ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.38)';
      ctx.font = '11px "SF Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(row.label, 28, ry + rowH / 2 + 4);

      ctx.fillStyle = stateColor;
      ctx.font = 'bold 11px "SF Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(stateText, 16 + rowW * 0.52, ry + rowH / 2 + 4);

      if (isForming && actionColor === AMBER) { ctx.shadowBlur = 5; ctx.shadowColor = AMBER; }
      ctx.fillStyle = actionColor;
      ctx.font = isHighlight ? 'bold 10px "SF Mono", monospace' : '10px "SF Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(actionText, 16 + rowW - 10, ry + rowH / 2 + 4);
      ctx.shadowBlur = 0;
    });

    // State badge
    const badgeY = startY + rows.length * (rowH + rowGap) + 8;
    const badgeW = 168;
    const badgeX = (w - badgeW) / 2;
    ctx.fillStyle = isForming ? 'rgba(255,179,0,0.1)' : 'rgba(38,166,154,0.08)';
    ctx.strokeStyle = isForming ? AMBER + '44' : TEAL + '33';
    ctx.lineWidth = 1;
    ctx.fillRect(badgeX, badgeY, badgeW, 26);
    ctx.strokeRect(badgeX, badgeY, badgeW, 26);
    ctx.fillStyle = isForming ? AMBER : TEAL;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      isForming ? '\u25b6 FORMING \u2014 multiple rows amber' : '\u25b6 INTACT \u2014 all rows teal',
      w / 2, badgeY + 17
    );
  }, []);

  return <AnimScene draw={draw} aspectRatio={4 / 3} />;
}

// ============================================================
// MAIN COMPONENT — Lesson 11.5
// Phase 1+2A+2B scope: hero + S00-S15 + Animations 1-13
// ============================================================
export default function CipherRegimeTransitionsLesson() {
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
    () => `PRO-CERT-L11.5-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
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
    <div
      className="min-h-screen text-white"
      style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}
    >
      <Confetti active={showConfetti} />

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-900/50">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-500 to-accent-500"
          style={{
            width: `${Math.min(
              (scrollY /
                (typeof document !== 'undefined'
                  ? document.body.scrollHeight - window.innerHeight
                  : 1)) *
                100,
              100
            )}%`,
          }}
        />
      </div>

      {/* Nav */}
      <nav className="fixed top-1 left-0 right-0 z-40 flex items-center justify-between px-5 py-2.5">
        <Link
          href="/academy"
          className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-amber-400 to-accent-400 bg-clip-text text-transparent"
          style={{ WebkitTransform: 'translateZ(0)' }}
        >
          ATLAS ACADEMY
        </Link>
        <div className="flex items-center gap-2">
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-bold text-amber-400">PRO &middot; LEVEL 11</span>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6 pt-20">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(245,158,11,0.08),transparent_70%)] pointer-events-none" />
        <div className="absolute top-[-50px] right-[20%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(217,70,239,0.05),transparent_70%)] pointer-events-none" />
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
          className="relative z-10"
        >
          <motion.div variants={fadeUp}>
            <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">
              Level 11 &middot; Lesson 5
            </p>
          </motion.div>
          <motion.h1
            variants={fadeUp}
            className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5"
          >
            Regime Transitions<br />
            <span
              className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent"
              style={{ WebkitTransform: 'translateZ(0)' }}
            >
              and Hysteresis
            </span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed"
          >
            Every other indicator would lie to you for 5 bars. CIPHER reports truth &mdash; then
            gives you a three-stage warning system so you act before the flip, not after.
          </motion.p>
          <motion.div
            variants={fadeUp}
            className="mt-12 flex flex-col items-center gap-1.5"
          >
            <span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span>
            <div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── S00 — Why This Matters ── */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">
            First &mdash; Why This Matters
          </p>
          <div className="p-6 rounded-2xl glass-card">
            <h2 className="text-2xl font-extrabold mb-4">
              Detecting a regime is half the job. Knowing it&apos;s about to end is the other half.
            </h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              Lesson 11.4 taught you how CIPHER classifies every bar into TREND, RANGE, or
              VOLATILE. But classification alone answers only one question:{' '}
              <strong className="text-white">what is the market doing right now?</strong>
            </p>
            <p className="text-gray-400 leading-relaxed mb-4">
              This lesson answers a harder question:{' '}
              <strong className="text-amber-400">when is the market about to stop doing it?</strong>{' '}
              That is the question that determines whether you ride a TREND to exhaustion or exit
              cleanly before the transition fires. The difference in P&amp;L between those two
              outcomes is significant &mdash; and it is exactly what the{' '}
              <strong className="text-white">Regime Transition Predictor (RTP)</strong> is built to
              close.
            </p>
            <p className="text-gray-400 leading-relaxed">
              The RTP gives you a three-stage warning system built on two pieces of data CIPHER
              collects silently on every chart: how long each regime has lasted historically, and
              which regime tends to follow which. When you read the guidance cell, you are reading
              the output of that system &mdash; a probability, not a guess.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ── S01 — Groundbreaking Concept ── */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">
            &#11088; 01 &mdash; Groundbreaking Concept
          </p>
          <h2 className="text-2xl font-extrabold mb-4">
            The Three-Stage Warning System &mdash; and Why Other Indicators Lie to You First
          </h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            Most regime or trend indicators use <strong className="text-white">N-bar hysteresis</strong>
            : the regime cannot change until the new state has persisted for 3, 5, or 10 bars.
            That lock eliminates flicker &mdash; but it also silently eliminates every early
            warning that lives inside those locked bars. By the time a lagged indicator confirms
            the transition, you have already given back 5 bars of profit.{' '}
            <strong className="text-amber-400">CIPHER made the opposite design choice.</strong>
          </p>
          <p className="text-gray-400 leading-relaxed mb-6">
            CIPHER reports the raw three-score race result <strong className="text-white">every bar
            </strong>, with no lock and no delay. Then it adds the{' '}
            <strong className="text-white">Regime Transition Predictor</strong> on top: a probability
            engine that tracks how long the current regime has lasted, compares it to the
            30-instance rolling average on this specific chart, and feeds the ratio into a sigmoid
            curve. The output is translated into three plain-English guidance states.
          </p>
          <ThreeStageWarningAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">
            Watch the four-scene cycle. <strong className="text-white">Scene 1</strong>: duration
            at 55% of average &mdash; probability ~25%, guidance reads{' '}
            <span className="text-teal-400 font-semibold">&rarr; TREND INTACT</span>. Run your
            playbook with full conviction. <strong className="text-white">Scene 2</strong>: duration
            past average &mdash; probability climbs above 50% and the guidance cell flips to{' '}
            <span className="text-amber-400 font-semibold">&rarr; RANGE FORMING</span>. Amber
            fires. Take partials, tighten the stop. <strong className="text-white">Scene 3</strong>:
            ratio at 1.42 &times; average &mdash; probability above 75%,{' '}
            <span className="text-amber-400 font-semibold">&rarr; SHIFTING TO RANGE</span> appears.
            Exit the remainder now. <strong className="text-white">Scene 4</strong>: regime flips,
            duration resets, the clock starts again.
          </p>
          {/* Three-light card row */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { stage: 'INTACT', prob: 'Prob < 50%', color: 'text-teal-400', bg: 'bg-teal-500/5 border border-teal-500/20', dot: 'bg-teal-400', action: 'Run playbook' },
              { stage: 'FORMING', prob: 'Prob 50\u201375%', color: 'text-amber-400', bg: 'bg-amber-500/5 border border-amber-500/20', dot: 'bg-amber-400', action: 'Tighten + partials' },
              { stage: 'SHIFTING', prob: 'Prob > 75%', color: 'text-red-400', bg: 'bg-red-500/5 border border-red-500/20', dot: 'bg-red-400', action: 'Exit + switch' },
            ].map((card) => (
              <div key={card.stage} className={`p-3 rounded-xl ${card.bg} flex flex-col items-center gap-2`}>
                <div className={`w-5 h-5 rounded-full ${card.dot}`} />
                <span className={`text-xs font-black tracking-wider uppercase ${card.color}`}>{card.stage}</span>
                <span className="text-[10px] text-gray-500 font-semibold">{card.prob}</span>
                <span className="text-[11px] text-gray-400 text-center leading-tight">{card.action}</span>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE DESIGN INVERSION</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Other indicators hide flicker by locking regime for N bars. CIPHER hides nothing
              &mdash; and gives you the probability layer instead. The guidance cell is your
              stability, not a lock. INTACT through flicker means the RTP is below 50%: ignore
              the noise. FORMING means act. SHIFTING means act now.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ── S02 — The Hysteresis Choice ── */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">
            02 &mdash; The Hysteresis Choice
          </p>
          <h2 className="text-2xl font-extrabold mb-4">Why CIPHER doesn&apos;t wait</h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            Hysteresis is a design shortcut. It replaces the hard problem of &ldquo;how do I know
            if this flip is real?&rdquo; with the easy answer: &ldquo;wait N bars and see if it
            sticks.&rdquo; That works for eliminating flicker, but it introduces a cost that is
            never acknowledged: <strong className="text-white">the early warning is inside those N
            bars.</strong> When you confirm at bar 5, bars 1&ndash;4 were actionable information
            you discarded.
          </p>
          <HysteresisCompareAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">
            The left panel shows a 5-bar hysteresis approach: the regime bar changes, but the
            indicator does not report it for 5 bars. <strong className="text-red-400">+5 LAG
            </strong> marks where the operator finally gets the signal. The right panel shows
            CIPHER: truth fires at bar 1 of the change. The{' '}
            <strong className="text-white">guidance cell</strong> &mdash; not a bar lock &mdash;
            is what distinguishes real transitions from noise. If the guidance cell stays INTACT
            through the raw flicker, the RTP probability is below 50% and the flicker is noise.
          </p>
          <div className="p-5 rounded-2xl glass-card space-y-4">
            <div>
              <p className="text-xs font-bold text-red-400 mb-1">WHAT HYSTERESIS COSTS YOU</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                On a 5-bar lock, a transition that runs for 8 bars gives you only 3 bars of the
                new regime before a reversal. On CIPHER with no lock, you get all 8 bars of
                guidance &mdash; including the FORMING warning that tells you to prepare, and the
                SHIFTING warning that tells you to act.
              </p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-teal-400 mb-1">WHAT CIPHER GIVES YOU INSTEAD</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                A probability layer that updates every bar without lock. Below 50%: stable, run
                playbook. 50&ndash;75%: elevated, act early. Above 75%: imminent, act now. The
                stability operators need is in the probability, not in an artificial delay.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── S03 — INTACT: The Green Light ── */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">
            03 &mdash; INTACT &middot; The Green Light
          </p>
          <h2 className="text-2xl font-extrabold mb-4">Regime active. Run your playbook.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            INTACT (and its variants HOLDING for RANGE, CAUTIOUS for VOLATILE) appears when the
            RTP sigmoid probability is <strong className="text-white">below 50%</strong>. The
            current regime has not yet reached its historical average duration on this chart. The
            three-score race still produces a clear winner with no elevated transition signal. This
            is the window for full-conviction execution.
          </p>
          <IntactStateAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">
            Watch the duration counter climb. As long as it stays below the historical average
            (35 bars in this example), probability stays well below 50% and the guidance cell
            holds on <span className="text-teal-400 font-semibold">&rarr; TREND INTACT</span>.
            The probability bar does not reach the FORMING threshold. This is not complacency
            &mdash; it is <strong className="text-white">calibrated confidence</strong> backed by
            the instrument&apos;s own history.
          </p>
          <div className="p-5 rounded-2xl glass-card space-y-4">
            <div>
              <p className="text-xs font-bold text-teal-400 mb-1">INTACT VARIANTS BY REGIME</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                <strong className="text-teal-400">&rarr; TREND INTACT</strong> when current
                regime is TREND and prob &lt; 50%. <strong className="text-amber-400">&rarr; RANGE
                HOLDING</strong> when regime is RANGE and prob &lt; 50%. <strong className="text-red-400"
                >&rarr; STAY CAUTIOUS</strong> is VOLATILE&apos;s stable label &mdash; it always
                carries a warning tone because VOLATILE itself demands caution.
              </p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-teal-400 mb-1">OPERATOR RULE</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                During INTACT: run your regime&apos;s playbook at full sizing. Add size on valid
                setups. Do not second-guess the regime. The probability is telling you the
                transition is not due.
              </p>
            </div>
          </div>
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">INTACT THROUGH FLICKER</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              If the raw regime cell (col 2) flickers bar-to-bar while the guidance cell holds on
              INTACT, the RTP is below 50% &mdash; that flicker is just a near-tie in the
              three-score race, not a real transition. The guidance cell is ground truth. Ignore
              the raw flicker.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ── S04 — FORMING: The Amber Light ── */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">
            04 &mdash; FORMING &middot; The Amber Light
          </p>
          <h2 className="text-2xl font-extrabold mb-4">
            Probability elevated. Tighten and prepare.
          </h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            FORMING fires when <strong className="text-amber-400">rtp_change_prob &gt; 50</strong>{' '}
            (Pine line 3351). The regime is still active &mdash; cell 2 still reads TREND, RANGE,
            or VOLATILE &mdash; but the sigmoid has crossed its midpoint. The current regime has
            run longer than roughly half of all historical durations on this chart. A transition
            is now <strong className="text-white">more likely than not</strong> in the near term.
          </p>
          <FormingStateAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">
            The animation mirrors your actual screenshot: <strong className="text-teal-400">TREND
            </strong> in cell 2, <span className="text-amber-400 font-semibold">&rarr; RANGE
            FORMING</span> in amber in cell 3. Duration is at 42 bars against a 30-bar average on
            the Ribbon row &mdash; both rows showing the same aging signal simultaneously. Watch
            the probability bar fill into the 50&ndash;75% amber zone as duration climbs, inching
            toward the SHIFTING threshold at 75%.
          </p>
          <div className="p-5 rounded-2xl glass-card space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE FORMING PLAYBOOK</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                <strong className="text-white">Step 1</strong>: Take 30&ndash;50% partial profits
                on existing positions in the current regime. <strong className="text-white">Step 2
                </strong>: Tighten trailing stop on the remainder to lock in gains.{' '}
                <strong className="text-white">Step 3</strong>: Do not add new full-size positions
                in the current regime. <strong className="text-white">Step 4</strong>: Watch the
                guidance cell for escalation to SHIFTING.
              </p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHAT FORMING IS NOT</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                FORMING is <strong className="text-white">not</strong> a confirmed transition.
                Regime cell 2 still shows the current regime. FORMING is a probability elevation
                &mdash; the transition is likely, not certain. Some FORMING states resolve back to
                INTACT if the market re-energises the current regime. The SHIFTING label (75%+)
                is the confirmed-imminent signal.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── S05 — SHIFTING: The Red Light ── */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">
            05 &mdash; SHIFTING &middot; The Red Light
          </p>
          <h2 className="text-2xl font-extrabold mb-4">
            Transition imminent. Exit and switch playbook.
          </h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            SHIFTING fires when <strong className="text-red-400">rtp_change_prob &gt; 75</strong>{' '}
            (Pine line 3352). The guidance cell switches from{' '}
            <span className="text-amber-400 font-semibold">&rarr; X FORMING</span> to{' '}
            <span className="text-amber-400 font-semibold">&rarr; SHIFTING TO X</span>, still in
            amber. The regime cell (col 2) still shows the current regime &mdash; the flip has not
            yet happened &mdash; but the sigmoid is telling you it is{' '}
            <strong className="text-white">statistically imminent</strong>. This is your last
            clean exit window before the market changes character.
          </p>
          <ShiftingStateAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">
            Scene 1 shows SHIFTING active: regime cell still reads{' '}
            <strong className="text-teal-400">TREND</strong>, guidance reads{' '}
            <span className="text-amber-400 font-semibold">&rarr; SHIFTING TO RANGE</span> with
            glow. The probability bar is above 75%. Scene 2 shows the transition that follows:
            the clock resets to bar 1, probability drops to ~5%, and the RANGE playbook begins.
            The entire SHIFTING window &mdash; the time between guidance firing and the actual
            flip &mdash; is your operator advantage. Use it.
          </p>
          <div className="p-5 rounded-2xl glass-card space-y-4">
            <div>
              <p className="text-xs font-bold text-red-400 mb-1">THE SHIFTING PLAYBOOK</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                <strong className="text-white">Step 1</strong>: Exit the full remaining position
                in the current regime. Do not wait for cell 2 to flip &mdash; that confirmation
                costs you the best price.{' '}
                <strong className="text-white">Step 2</strong>: Cancel any pending orders aligned
                with the current regime.{' '}
                <strong className="text-white">Step 3</strong>: Identify the most likely next
                regime from the guidance text (SHIFTING TO RANGE / SHIFTING TO TREND / SHIFTING
                TO VOLATILE) and prepare those setups.{' '}
                <strong className="text-white">Step 4</strong>: Wait for the flip and the new
                regime&apos;s INTACT confirmation before entering.
              </p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-red-400 mb-1">SHIFTING DOES NOT PREDICT DIRECTION</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                SHIFTING TO RANGE after a TREND does not mean price will reverse. RANGE is
                directionless &mdash; it means the trend energy is exhausting. Price may
                consolidate sideways, retrace partially, or oscillate. The regime label predicts{' '}
                <strong className="text-white">market character</strong>, not price direction.
              </p>
            </div>
          </div>
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">BOTH FORMING AND SHIFTING ARE AMBER</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Pine line 3354 sets both FORMING and SHIFTING guidance to AMBER color regardless of
              which regime is predicted. The distinction between them is the text &mdash; FORMING
              vs. SHIFTING &mdash; not the color. Read the words, not just the color.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ── S06 — The Sigmoid Engine ── */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">
            06 &mdash; The Sigmoid Engine
          </p>
          <h2 className="text-2xl font-extrabold mb-4">
            How duration becomes probability
          </h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            The probability of regime change is not linear with duration. CIPHER uses a{' '}
            <strong className="text-white">sigmoid (logistic) curve</strong> centered at a ratio
            of 1.0 &mdash; meaning when the current regime has lasted exactly as long as its
            historical average, the sigmoid outputs approximately{' '}
            <strong className="text-amber-400">60%</strong>. This is a deliberately early trigger:
            the FORMING threshold at 50% is crossed before the regime reaches its average.
          </p>
          <SigmoidDeepDiveAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">
            Watch the marker sweep from left to right. The curve is{' '}
            <strong className="text-white">lazy early</strong>: at 50% of the historical average
            (ratio 0.5), probability is only ~25% &mdash; no warning fires. The sigmoid rises
            steeply through the 1.0&times; region. At ratio 1.42&times;, probability is ~82% and
            SHIFTING fires. The curve caps at 95% to prevent false certainty &mdash; no regime
            ever shows 100% probability of ending, because history always admits exceptions.
          </p>
          <div className="p-5 rounded-2xl glass-card space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE PINE FORMULA (LINE 574)</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">
                rtp_ratio = rtp_duration / rtp_avg_dur<br />
                rtp_change_prob = min(95, max(5,<br />
                &nbsp;&nbsp;100 / (1 + exp(&minus;3.5 &times; (rtp_ratio &minus; 1.0))))<br />
                )
              </p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">
                The &minus;3.5 steepness factor controls how quickly the curve rises through the
                1.0 inflection point. Steeper = faster escalation from INTACT to FORMING to
                SHIFTING. The chosen value gives approximately a 0.4&times; ratio spread between
                the 50% and 75% thresholds.
              </p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHY SIGMOID AND NOT LINEAR</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                A linear probability would flag FORMING too early (at ratio 0.5, linear = 50%)
                and would hit 100% before the regime actually ends. The sigmoid&apos;s S-shape
                matches how regime exhaustion actually behaves: slow accumulation of risk early,
                rapid escalation once past the average, then asymptotic as the regime extends
                extremely far.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── S07 — Rolling Duration Arrays ── */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">
            07 &mdash; The Rolling Duration Arrays
          </p>
          <h2 className="text-2xl font-extrabold mb-4">
            How CIPHER learns your chart
          </h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            Every time a regime ends, CIPHER records how long it lasted by pushing that duration
            into a rolling array for that regime type. There are three arrays:{' '}
            <strong className="text-teal-400">dur_trend</strong>,{' '}
            <strong className="text-amber-400">dur_range</strong>, and{' '}
            <strong className="text-red-400">dur_volatile</strong>. Each holds a maximum of{' '}
            <strong className="text-white">30 completed durations</strong>. The historical average
            used by the sigmoid &mdash; the denominator in the ratio &mdash; is{' '}
            <strong className="text-white">array.avg()</strong> over whatever is currently stored.
          </p>
          <RollingArrayAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">
            Watch the array fill slot by slot. Each cell shows a completed TREND duration. The
            average updates on every push. When the array reaches 30 entries, the next push calls{' '}
            <strong className="text-white">array.shift()</strong> to remove the oldest value
            before adding the new one &mdash; the array stays at 30, always weighted toward
            recent behavior. This is how CIPHER self-calibrates: a chart that develops a new
            regime character over time will gradually shift its average to reflect the new normal.
          </p>
          <div className="p-5 rounded-2xl glass-card space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE PINE IMPLEMENTATION (LINES 520&ndash;551)</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">
                var array&lt;int&gt; dur_trend = array.new_int(0)<br />
                &mdash; on regime change: array.push(dur_trend, prev_dur)<br />
                &mdash; if array.size(dur_trend) &gt; 30: array.shift(dur_trend)<br />
                &mdash; rtp_avg_dur = array.avg(dur_trend)
              </p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">EARLY-SESSION BEHAVIOR</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                When CIPHER is first loaded on a chart, the arrays are empty and{' '}
                <strong className="text-white">rtp_avg_dur = na</strong>. The RTP guidance
                defaults to the stable state (INTACT / HOLDING / CAUTIOUS) until enough history
                accumulates. On an active instrument, meaningful averages typically emerge after
                5&ndash;10 completed regime cycles. Do not read transition warnings on a freshly
                loaded chart until the arrays have data.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── S08 — The Transition Matrix ── */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">
            08 &mdash; The Transition Matrix
          </p>
          <h2 className="text-2xl font-extrabold mb-4">
            Six paths. One most likely.
          </h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            Alongside the duration arrays, CIPHER maintains six integer counters &mdash; one for
            each possible transition between the three regimes. Every time a regime flip occurs,
            the matching counter increments. The six paths are:{' '}
            <strong className="text-white">T&rarr;R, T&rarr;V, R&rarr;T, R&rarr;V, V&rarr;T,
            V&rarr;R</strong>. (A regime does not transition to itself, so there are no T&rarr;T,
            R&rarr;R, or V&rarr;V counters.)
          </p>
          <TransitionMatrixAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">
            Three chart scenarios cycle. In each, the matrix counters are populated by historical
            flips. When the current regime is highlighted, the{' '}
            <strong className="text-white">most likely next regime</strong> is simply the
            destination with the higher counter from the current regime&apos;s row. It is a plain
            integer comparison &mdash; no percentages, no weighting. The chart that trends into
            range most often (EURUSD 1H, scenario 1) produces a dominant T&rarr;R path. The
            chart with frequent volatility spikes (GBPUSD 5m, scenario 2) produces a dominant
            T&rarr;V path.
          </p>
          <div className="p-5 rounded-2xl glass-card space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE PINE IMPLEMENTATION (LINES 524&ndash;565)</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">
                var int tr_trend_range = 0 &nbsp;&nbsp;// T&rarr;R<br />
                var int tr_trend_volatile = 0 // T&rarr;V<br />
                &mdash; on regime change from TREND to RANGE: tr_trend_range += 1<br />
                &mdash; rtp_next = tr_trend_range &gt;= tr_trend_volatile ? &quot;RANGE&quot; : &quot;VOLATILE&quot;
              </p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHAT THE MATRIX CANNOT DO</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                The matrix predicts the <strong className="text-white">most likely next regime
                type</strong>, not the magnitude of the move or how long the next regime will
                last. A T&rarr;R transition could be a 5-bar consolidation or a 50-bar range.
                Use the matrix for playbook preparation, not for position sizing on the new
                regime.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── S09 — Timeframe Character ── */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">
            09 &mdash; Timeframe Character
          </p>
          <h2 className="text-2xl font-extrabold mb-4">
            Why your 1H and 15m have different choreography
          </h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            The transition matrix and duration arrays are learned independently per chart. Load
            CIPHER on EURUSD 1H and EURUSD 15m simultaneously and you will get two different
            matrices, two different average durations, and two different &ldquo;most likely
            next&rdquo; outputs. This is not a bug &mdash; it is the RTP correctly capturing that{' '}
            <strong className="text-white">regime physics change with timeframe.</strong>
          </p>
          <TFCharacterAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">
            The 1H matrix (left) shows TREND&rarr;RANGE at 73% &mdash; on this timeframe,
            sustained trends exhaust into consolidation. Average TREND duration is 38 bars.
            The 15m matrix (right) shows TREND&rarr;VOLATILE at 62% &mdash; on this timeframe,
            economic releases and spread events regularly spike ATR during trending moves. Average
            TREND duration is only 18 bars. The same instrument, opposite dominant transition
            paths. <strong className="text-white">Use the matrix from the timeframe you are
            executing on.</strong>
          </p>
          <div className="p-5 rounded-2xl glass-card space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">PRACTICAL IMPLICATION</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                If you use the 1H for bias and the 15m for entry, check both matrices. The 1H
                FORMING signal tells you the bigger-picture trend is aging. The 15m matrix tells
                you whether the flip will likely land in RANGE (consolidation entry opportunity)
                or VOLATILE (stay flat). These two pieces of information together inform both
                exit timing and re-entry setup.
              </p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHEN THE MATRIX IS SPARSE</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                On a fresh chart load, the counters start at zero. If only one transition type
                has fired (e.g., two T&rarr;R with zero T&rarr;V), the matrix will show RANGE
                as most likely &mdash; but this is based on only two data points. The matrix
                becomes reliable after roughly 10&ndash;15 completed transitions per from-regime
                row. On a freshly loaded chart, treat the &ldquo;most likely next&rdquo; output
                as provisional until history builds.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── S10 — The Operator's FORMING Playbook ── */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">
            10 &mdash; The Operator&apos;s FORMING Playbook
          </p>
          <h2 className="text-2xl font-extrabold mb-4">
            What to do at 50&ndash;75% probability
          </h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            FORMING is the window between knowing something is likely and knowing it is imminent.
            That window is an advantage &mdash; it is time to act{' '}
            <strong className="text-white">before</strong> the market forces your hand. The
            three-step FORMING playbook is not about fear; it is about{' '}
            <strong className="text-amber-400">locking in what you have earned</strong> while
            the regime is still running in your favor.
          </p>
          <FormingPlaybookAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">
            Watch the three-step sequence. Step 1: FORMING fires, position is still full,
            guidance turns amber. Step 2: 40% partial exit taken at market &mdash; profit locked
            on that portion regardless of what happens next. Step 3: trailing stop moves up to
            52% of the price run &mdash; the remaining 60% is now protected against a reversal
            that returns to the halfway point. When SHIFTING fires, the remainder exits from a
            position of strength.
          </p>
          <div className="p-5 rounded-2xl glass-card space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE FOUR FORMING RULES</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                <strong className="text-white">Rule 1</strong>: Take 30&ndash;50% partial at
                market immediately on FORMING &mdash; not on the next bar, not when it
                &ldquo;looks like it&apos;s topping&rdquo;. The signal is the trigger.{' '}
                <strong className="text-white">Rule 2</strong>: Tighten trailing stop to no
                more than 50% of the current profit run.{' '}
                <strong className="text-white">Rule 3</strong>: Do not open new full-size
                positions in the current regime while FORMING is active.{' '}
                <strong className="text-white">Rule 4</strong>: Watch the guidance cell, not
                the price action, for the SHIFTING escalation.
              </p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHAT IF FORMING RESOLVES BACK TO INTACT?</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                Some FORMING states do not escalate. The regime re-energises (ADX spikes higher,
                ATR backs off) and the probability drops back below 50%. In that case: the
                partial you took is still good &mdash; it was a correct risk management action
                with the information available. The remaining position continues with the tighter
                stop. This is the right outcome of a probabilistic system, not an error.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── S11 — The Operator's SHIFTING Playbook ── */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">
            11 &mdash; The Operator&apos;s SHIFTING Playbook
          </p>
          <h2 className="text-2xl font-extrabold mb-4">
            When 75%+ fires &mdash; act before the flip
          </h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            SHIFTING is the operator&apos;s last clean exit window. The regime has not yet
            flipped &mdash; cell 2 still shows the current regime &mdash; but the sigmoid has
            crossed 75%. Waiting for cell 2 to confirm the flip is a strategy that costs you
            the best exit price. The operator who acts on SHIFTING exits into liquidity;
            the operator who waits exits into a market that has already changed character.
          </p>
          <ShiftingPlaybookAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">
            Four steps cycle: FORMING with partial done (position at 60%), SHIFTING fires (full
            exit executed immediately, do not wait for cell 2 to flip), transition confirmed
            (flat, clock resets), and new regime INTACT (RANGE playbook preparation begins).
            The most critical step is step 2: <strong className="text-red-400">exit on SHIFTING,
            not on the confirmed flip.</strong> Every bar of delay between SHIFTING and your
            exit is a bar of increasing risk.
          </p>
          <div className="p-5 rounded-2xl glass-card space-y-4">
            <div>
              <p className="text-xs font-bold text-red-400 mb-1">THE CRITICAL DISTINCTION</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                SHIFTING TO RANGE does not mean price drops. RANGE is a{' '}
                <strong className="text-white">directionless regime</strong>. The trend energy
                is exhausting. Price may consolidate sideways, retrace partially, or begin a
                slow oscillation. Do not reverse short on a SHIFTING signal &mdash; wait for
                the RANGE INTACT confirmation and look for range-fading setups from there.
              </p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-red-400 mb-1">RE-ENTRY DISCIPLINE</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                After a transition, wait for the new regime to show{' '}
                <strong className="text-white">INTACT or HOLDING</strong> guidance before
                entering new positions. SHIFTING from the prior regime + HOLDING on the new
                regime = confirmed transition. Entering during SHIFTING of the new regime
                before it has established its character is premature.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── S12 — VOLATILE Transition Special Cases ── */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">
            12 &mdash; VOLATILE Transition Special Cases
          </p>
          <h2 className="text-2xl font-extrabold mb-4">
            The regime that breaks the pattern
          </h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            VOLATILE has the shortest average regime duration of the three &mdash; typically
            5&ndash;15 bars on most instruments and timeframes. This means the RTP sigmoid
            escalates from INTACT to SHIFTING much faster during VOLATILE than during TREND or
            RANGE. When VOLATILE fires, you often have only a few bars before FORMING appears
            and only a few more before SHIFTING fires. The pace is different.
          </p>
          <VolatileTransitionAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">
            Two VOLATILE transition paths. <strong className="text-teal-400">V&rarr;TREND</strong>:
            the ATR spike resolves into a sustained directional move &mdash; the volatility was
            the birth of a new trend. <strong className="text-amber-400">V&rarr;RANGE</strong>:
            the spike fades and price returns to oscillation &mdash; the volatility was a news
            event that had no follow-through. Both are common. The transition matrix tells you
            which path this specific instrument on this specific timeframe takes more often.
          </p>
          <div className="p-5 rounded-2xl glass-card space-y-4">
            <div>
              <p className="text-xs font-bold text-red-400 mb-1">OPERATOR RULE DURING VOLATILE</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                The moment VOLATILE fires: reduce size, widen mental stops, and watch the
                transition matrix to know which follow-on regime is statistically more likely.
                Do not run the TREND or RANGE playbook through VOLATILE. Do not fade the spike.
                When VOLATILE SHIFTING fires, the incoming regime is known from the matrix &mdash;
                prepare that playbook while the transition completes.
              </p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-red-400 mb-1">VOLATILE DOES NOT COUNT IN INTACT</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                The VOLATILE guidance&apos;s stable state is{' '}
                <strong className="text-white">&rarr; STAY CAUTIOUS</strong> &mdash; not INTACT
                or HOLDING. The word choice is deliberate: VOLATILE is never a regime you run
                aggressively. Even at low probability, the regime demands caution. STAY CAUTIOUS
                is the minimum posture, not a green light.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── S13 — Transition in the Full Command Center Context ── */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">
            13 &mdash; Transition in the Full Command Center Context
          </p>
          <h2 className="text-2xl font-extrabold mb-4">
            RTP in context &mdash; when multiple rows go amber together
          </h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            The Regime row does not operate in isolation. When a FORMING or SHIFTING signal
            fires, it coincides with other Command Center rows reaching similar conclusions
            through their own engines. The header action cell, Ribbon aging, Momentum fading,
            and Last Signal aging all independently converge on the same warning. When multiple
            rows shift to amber simultaneously, the regime guidance is not a lone signal &mdash;
            it is part of a <strong className="text-white">multi-system convergence.</strong>
          </p>
          <FullCCContextAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">
            Watch the Command Center flip between INTACT and FORMING states. During INTACT, all
            rows read in teal &mdash; header, Ribbon, Momentum, Regime, Last Signal are aligned.
            When FORMING fires on the Regime row, notice the simultaneous amber shift across
            Ribbon (&rarr; AGING 42b, avg 30), Momentum (&rarr; REDUCE SIZE), header (&rarr;
            TREND AGING), and Last Signal (&rarr; AGING). This is the exact pattern visible in
            your screenshot. The multiple amber rows are independent corroboration, not
            redundancy.
          </p>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">OPERATOR CONFIDENCE LADDER</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              One row in amber = elevated probability from one engine. Two rows in amber = two
              independent engines agreeing. Three or more rows in amber = high-confidence
              transition signal. When Regime shows FORMING{' '}
              <strong className="text-white">and</strong> Ribbon shows AGING{' '}
              <strong className="text-white">and</strong> Momentum shows REDUCE SIZE, the
              partial exit on FORMING is not a timid move &mdash; it is a high-confidence
              operator action backed by three converging systems.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ── S14 — Six Common Mistakes ── */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">
            14 &mdash; Six Common Mistakes
          </p>
          <h2 className="text-2xl font-extrabold mb-4">
            The Transition Timing Operator&apos;s error log
          </h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            These are the six errors that operators make when reading regime transitions. Each
            one has a concrete cost. Knowing the mistake in advance is half the fix.
          </p>
          <div className="space-y-3">
            {[
              {
                n: '01',
                title: 'Ignoring FORMING because regime cell still says TREND',
                body: 'The guidance cell is the forecaster. Cell 2 shows what the market IS doing. Cell 3 shows what it is about to do. Ignoring cell 3 because cell 2 looks fine is reading only half the row.',
              },
              {
                n: '02',
                title: 'Waiting for cell 2 to confirm before acting on SHIFTING',
                body: 'By the time regime cell 2 flips to the new regime, SHIFTING has already fired one or more bars ago. Waiting for confirmation means exiting into a market that has already changed character, at a worse price.',
              },
              {
                n: '03',
                title: 'Trading on raw regime flicker instead of guidance',
                body: 'When raw regime flickers bar-to-bar but guidance holds INTACT, the RTP probability is below 50%. The flicker is near-tie noise. Switching playbooks on individual flicker bars produces whipsaw losses.',
              },
              {
                n: '04',
                title: 'Treating VOLATILE as negligible because it is rare',
                body: 'VOLATILE is the highest-risk regime precisely because it is infrequent. When it fires, the ATR spike has crossed 1.5\u00d7 its 50-bar average. This is a genuine dislocation event, not a temporary blip. Running any standard playbook through VOLATILE is a capital risk.',
              },
              {
                n: '05',
                title: 'Adding size at FORMING instead of reducing',
                body: 'FORMING means the regime is statistically aging \u2014 past 50% of its historical average duration. Adding size when the regime is probabilistically late in its lifecycle is the inverse of correct risk management. INTACT is the window for adding; FORMING is the window for reducing.',
              },
              {
                n: '06',
                title: 'Reading the transition matrix on a freshly loaded chart',
                body: 'The six transition counters start at zero on every fresh chart load. A matrix with only 2\u20133 recorded transitions gives statistically meaningless \u201cmost likely next\u201d outputs. Trust the matrix only after 10+ completed transitions per from-regime row.',
              },
            ].map((card) => (
              <div key={card.n} className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
                <p className="text-xs font-bold text-red-400 mb-1">
                  MISTAKE {card.n} &mdash; {card.title}
                </p>
                <p className="text-sm text-gray-400 leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── S15 — Cheat Sheet ── */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">
            15 &mdash; Cheat Sheet
          </p>
          <h2 className="text-2xl font-extrabold mb-4">Transition Timing Operator reference</h2>
          <div className="p-5 rounded-2xl glass-card space-y-5">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-2">THREE-STAGE GUIDANCE STATES</p>
              <div className="space-y-2 text-sm text-gray-400 leading-relaxed">
                <p><strong className="text-teal-400">INTACT / HOLDING / CAUTIOUS</strong> &mdash; prob &lt; 50%. Regime stable. Run playbook at full conviction.</p>
                <p><strong className="text-amber-400">X FORMING</strong> &mdash; prob 50&ndash;75%. Regime aging. Take 30&ndash;50% partials, tighten stop, watch for SHIFTING.</p>
                <p><strong className="text-amber-400">SHIFTING TO X</strong> &mdash; prob &gt; 75%. Transition imminent. Exit full remainder. Switch playbook preparation.</p>
              </div>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">SIGMOID CALIBRATION (Pine line 574)</p>
              <div className="space-y-1 text-sm text-gray-400 font-mono leading-relaxed">
                <p>ratio = duration &divide; avg_duration</p>
                <p>prob = min(95, max(5, 100 / (1 + exp(&minus;3.5 &times; (ratio &minus; 1.0)))))</p>
                <p>ratio 0.5&times; &rarr; ~25% &nbsp;&nbsp; ratio 1.0&times; &rarr; ~60% &nbsp;&nbsp; ratio 1.4&times; &rarr; ~82%</p>
              </div>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">ROLLING ARRAYS</p>
              <div className="space-y-1 text-sm text-gray-400 leading-relaxed">
                <p>Three arrays: <strong className="text-teal-400">dur_trend</strong>, <strong className="text-amber-400">dur_range</strong>, <strong className="text-red-400">dur_volatile</strong></p>
                <p>Max 30 entries each &mdash; array.push on regime end, array.shift on overflow</p>
                <p>rtp_avg_dur = array.avg() &mdash; na when empty (early session)</p>
              </div>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">TRANSITION MATRIX</p>
              <div className="space-y-1 text-sm text-gray-400 leading-relaxed">
                <p>Six integer counters: T&rarr;R, T&rarr;V, R&rarr;T, R&rarr;V, V&rarr;T, V&rarr;R</p>
                <p>Most likely next = higher counter in current regime&apos;s row (simple comparison)</p>
                <p>Reliable after ~10&ndash;15 transitions per from-regime row</p>
              </div>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">COLORS (Pine line 3354)</p>
              <div className="space-y-1 text-sm text-gray-400 leading-relaxed">
                <p><strong className="text-teal-400">Teal</strong> &mdash; TREND INTACT guidance &nbsp;&nbsp; <strong className="text-amber-400">Amber</strong> &mdash; FORMING, SHIFTING, RANGE HOLDING &nbsp;&nbsp; <strong className="text-red-400">Magenta</strong> &mdash; VOLATILE regime label only</p>
                <p>Both FORMING and SHIFTING use <strong className="text-amber-400">amber</strong> regardless of predicted next regime. Read the text, not just the color.</p>
              </div>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">TIMEFRAME INDEPENDENCE</p>
              <div className="space-y-1 text-sm text-gray-400 leading-relaxed">
                <p>Each timeframe has its own arrays, matrix, and averages. 1H and 15m on the same instrument will produce different matrices and different FORMING thresholds. Use the matrix from your execution timeframe.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── S16 — Scenario Game ── */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">
            16 &mdash; Scenario Game
          </p>
          <h2 className="text-2xl font-extrabold mb-4">Time the Transition Like an Operator</h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            Five scenarios. Each puts you in a live-feeling transition-timing situation. Pick the
            right operator response &mdash; explanations appear after every answer, including for
            wrong answers.
          </p>
          <div className="p-5 rounded-2xl glass-card">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold tracking-widest uppercase text-amber-400">
                Round {gameRound + 1} of {gameRounds.length}
              </p>
              <p className="text-xs text-gray-500">
                Score:{' '}
                {gameSelections.filter(
                  (sel, i) =>
                    sel !== null &&
                    gameRounds[i].options.find((o) => o.id === sel)?.correct
                ).length}
                /{gameRounds.length}
              </p>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed mb-4">
              {gameRounds[gameRound].scenario}
            </p>
            <p className="text-sm font-semibold text-white mb-4">
              {gameRounds[gameRound].prompt}
            </p>
            <div className="space-y-2">
              {gameRounds[gameRound].options.map((opt) => {
                const answered = gameSelections[gameRound] !== null;
                const selected = gameSelections[gameRound] === opt.id;
                const isCorrect = opt.correct;
                let cls =
                  'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]';
                if (answered && selected && isCorrect)
                  cls = 'bg-green-500/10 border border-green-500/30';
                if (answered && selected && !isCorrect)
                  cls = 'bg-red-500/10 border border-red-500/30';
                if (answered && !selected && isCorrect)
                  cls = 'bg-green-500/5 border border-green-500/20';
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
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-1 p-3 rounded-lg bg-white/[0.02]"
                      >
                        <p
                          className={`text-xs leading-relaxed ${
                            isCorrect ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {isCorrect ? '✓' : '✗'} {opt.explain}
                        </p>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
            {gameSelections[gameRound] !== null &&
              gameRound < gameRounds.length - 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-5"
                >
                  <button
                    onClick={() => setGameRound(gameRound + 1)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform"
                  >
                    Next Round &rarr;
                  </button>
                </motion.div>
              )}
            {gameSelections[gameRound] !== null &&
              gameRound === gameRounds.length - 1 &&
              (() => {
                const finalScore = gameSelections.filter(
                  (sel, i) =>
                    sel !== null &&
                    gameRounds[i].options.find((o) => o.id === sel)?.correct
                ).length;
                return (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"
                  >
                    <p className="text-lg font-extrabold text-amber-400">
                      {finalScore}/{gameRounds.length} Correct
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {finalScore >= 4
                        ? 'Operator-grade transition timing installed. You read the warning system, not just the state.'
                        : finalScore >= 3
                        ? 'Solid grasp. Re-read the FORMING playbook (S10) and the SHIFTING discipline (S11) before the quiz.'
                        : 'Re-study the three-stage system (S01), the FORMING rules (S10), and flicker discipline (S03) before the quiz.'}
                    </p>
                  </motion.div>
                );
              })()}
          </div>
        </motion.div>
      </section>

      {/* ── S17 — Final Quiz ── */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">
            17 &mdash; Knowledge Check
          </p>
          <h2 className="text-2xl font-extrabold mb-6">
            Final Quiz &mdash; {quizQuestions.length} Questions
          </h2>
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
                    let cls =
                      'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]';
                    if (answered && selected && isCorrect)
                      cls = 'bg-green-500/10 border border-green-500/30';
                    if (answered && selected && !isCorrect)
                      cls = 'bg-red-500/10 border border-red-500/30';
                    if (answered && !selected && isCorrect)
                      cls = 'bg-green-500/5 border border-green-500/20';
                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          if (quizAnswers[qi] !== null) return;
                          const next = [...quizAnswers];
                          next[qi] = opt.id;
                          setQuizAnswers(next);
                          if (next.every((a) => a !== null)) setQuizSubmitted(true);
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
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 p-3 rounded-lg bg-white/[0.02]"
                  >
                    <p className="text-xs text-amber-400">
                      <span className="font-bold">&#9989;</span> {q.explain}
                    </p>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
          {quizSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 text-center"
            >
              <p className="text-3xl font-extrabold mb-2">{quizPercent}%</p>
              <p className="text-sm text-gray-400">
                {quizPassed
                  ? 'You passed! Certificate unlocked below.'
                  : 'You need 66% to earn the certificate. Review the cheat sheet (S15) and try again.'}
              </p>
            </motion.div>
          )}
          {certRevealed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="mt-10"
            >
              <div
                className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20"
                style={{
                  background:
                    'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))',
                }}
              >
                <div
                  className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(14,165,233,0.04),transparent)] animate-spin"
                  style={{ animationDuration: '12s' }}
                />
                <div className="relative z-10 text-center">
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-sky-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">
                    &#9636;
                  </div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">
                    Certificate of Completion
                  </p>
                  <p className="text-sm text-gray-400">
                    Has successfully completed
                    <br />
                    <strong className="text-white">
                      Level 11.5: Regime Transitions and Hysteresis
                    </strong>
                    <br />
                    at ATLAS Academy by Interakktive
                  </p>
                  <p
                    className="bg-gradient-to-r from-amber-400 via-sky-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4"
                    style={{ WebkitTransform: 'translateZ(0)' }}
                  >
                    &mdash; Transition Timing Operator &mdash;
                  </p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">
                    {certId}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* Gold footer */}
      <section className="max-w-2xl mx-auto px-5 py-20 text-center">
        <Link
          href="/academy"
          className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95"
        >
          &larr; Back to Academy
        </Link>
      </section>
    </div>
  );
}
