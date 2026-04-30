// app/academy/lesson/cipher-candles/page.tsx
// ATLAS Academy — Lesson 11.23: Cipher Candles [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 11 · CIPHER
// Built to Lesson 11.11 gold standard
// Covers: 7-mode dropdown decomposed (3 metrics × 2 intensities + Default opt-out)
//         + 8-level gradient + cluster reading + regime shifts on candles
//         + candles + conviction synthesis alignment + mode-to-preset mapping
//         + 20-session commitment + mid-session switch discipline
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Crown } from 'lucide-react';

// ============================================================
// GAME ROUNDS — 5 scenario-based candle-reading challenges
// String-id answers, per-option explanations
// ============================================================
const gameRounds = [
  {
    id: 'r1',
    scenario:
      'NAS100 5m. Cipher Candles set to Tension Mode. The current bar prints TEAL_DEEP. Header reads BULL TREND, Tension row says SNAPPING.',
    prompt: 'What does the TEAL_DEEP candle mean here, and what is the operator\u2019s response?',
    options: [
      {
        id: 'a',
        text: 'Strong bull velocity — engage long at full size.',
        correct: false,
        explain:
          'Wrong. TEAL_DEEP means "strong bull" only in Trend Mode. In Tension Mode, the same shade means maximally stretched bull — the rubber band is loaded for a snap-back. This is mistake one from section fifteen: reading the shade without checking which mode is active.',
      },
      {
        id: 'b',
        text: 'Maximally stretched bull — watch for the snap, do not engage long.',
        correct: true,
        explain:
          'Correct. In Tension Mode, TEAL_DEEP indicates the bar is at peak bullish stretch from the Flow line. Combined with Header reporting TREND CURVING and Tension SNAPPING, this is the loaded-rubber-band signature. The Conviction Operator waits for the snap rather than engaging long at the peak.',
      },
      {
        id: 'c',
        text: 'Switch to Trend Mode to confirm what the candle really means.',
        correct: false,
        explain:
          'Mode-switching mid-session to clarify a read is the "hunting" failure mode (mistake two). The active mode IS the read. Switching to Trend Mode would repaint the same bar by velocity instead of stretch — a different read, not a clarification.',
      },
      {
        id: 'd',
        text: 'The candle is corrupted. Reload TradingView.',
        correct: false,
        explain:
          'The candle is rendering correctly. The operator\u2019s read of it is wrong. TEAL_DEEP in Tension Mode is the expected output when stretch is at 80%+ of 100-bar peak. No technical issue.',
      },
    ],
  },
  {
    id: 'r2',
    scenario:
      'XAUUSD 4H. Trend Mode active. The last 6 candles read: LIGHT, STD, DEEP, STD, LIGHT, PALE (all teal).',
    prompt: 'What cluster pattern is this and what is the operator\u2019s read?',
    options: [
      {
        id: 'a',
        text: 'Climactic top — expect a sharp magenta flip imminent.',
        correct: false,
        explain:
          'A climactic top would show several DEEP bars followed by an abrupt magenta flip within 1-2 bars — not a gradual fade through STD, LIGHT, PALE. This cluster is decaying gracefully, which is the opposite signature.',
      },
      {
        id: 'b',
        text: 'Sustainable trend that is now fading — trend is healthy but losing energy.',
        correct: true,
        explain:
          'Correct. The pattern LIGHT-STD-DEEP-STD-LIGHT-PALE is the sustainable trend signature with a gradual decay tail. The trend was healthy through the DEEP peak and is now fading energy. Long-side operators who entered during the STD-DEEP middle should be scaling out now; new long entries are no longer the high-edge play.',
      },
      {
        id: 'c',
        text: 'Range chop — stand aside until the next breakout.',
        correct: false,
        explain:
          'Range chop is alternating PALE bars in BOTH teal and magenta with no STD or LIGHT bars. This cluster has STD and LIGHT bars in the middle and stays in teal throughout — not range chop. The pattern is monotonic teal decaying.',
      },
      {
        id: 'd',
        text: 'Reversal building — long-side opportunity emerging.',
        correct: false,
        explain:
          'Reversal building goes from MAG_DEEP through PALE and into teal LIGHT. This cluster is the opposite — teal fading toward PALE, suggesting trend exhaustion rather than reversal initiation.',
      },
    ],
  },
  {
    id: 'r3',
    scenario:
      'Bitcoin 15m. Composite Bold mode active. A Pulse Cross Long signal fires with score 4/4 (Strong). The signal bar prints TEAL_DEEP. Tooltip context tag: Sweep + FVG.',
    prompt: 'What is the alignment read and the appropriate sizing?',
    options: [
      {
        id: 'a',
        text: 'Apex visual — size up to 1.5x baseline within cap.',
        correct: true,
        explain:
          'Correct. Strong synthesis (4/4 + Sweep+FVG apex tag) AND TEAL_DEEP candle = full alignment. The synthesis says engage at apex; the candle visually confirms with peak Composite score. Conviction-tier sizing applies: up to 1.5x baseline within max risk cap. This is the highest-confidence setup the framework produces.',
      },
      {
        id: 'b',
        text: 'Yellow flag — candle is too strong, may be exhaustion.',
        correct: false,
        explain:
          'In Composite Mode, TEAL_DEEP requires multiple factors aligning (velocity, tension, volume) — not just exhaustion. The 4/4 Strong score plus apex tag rules out the "single-dimension blowoff" reading. Yellow flag is the Strong+PALE pattern, not Strong+DEEP.',
      },
      {
        id: 'c',
        text: 'Skip — 4/4 with apex is statistically too rare to be real.',
        correct: false,
        explain:
          'Apex setups are designed to be rare, not skipped. The Sweep+FVG context tag is the priority-1 cascade entry precisely because it represents the highest-confluence setup CIPHER can identify. Skipping rare apex signals forfeits the asymmetric edge they offer.',
      },
      {
        id: 'd',
        text: 'Standard size — the Composite ambiguity prevents apex sizing.',
        correct: false,
        explain:
          'Composite Mode ambiguity affects single-bar reads, not the alignment check. With a 4/4 Strong score and an apex context tag, the synthesis layer has already resolved the Composite ambiguity. The candle confirms; sizing follows the synthesis-tier protocol.',
      },
    ],
  },
  {
    id: 'r4',
    scenario:
      'You are running the None preset with Trend Mode active. After 8 sessions of practice, you have entered a long trade based on a 3/4 Strong signal. Two bars after entry, the candles flip from TEAL_STD to MAG_LIGHT. The trade is 0.3R into drawdown.',
    prompt: 'The candles are now showing magenta. What is the right move?',
    options: [
      {
        id: 'a',
        text: 'Switch to Tension Mode — maybe it shows the trade more favorably.',
        correct: false,
        explain:
          'This is mistake six (denial via mode-switching). The candles are giving you honest data. Switching modes to hide the unfavorable read is the operator denying the data rather than honoring the read.',
      },
      {
        id: 'b',
        text: 'Honor the candle read — manage the trade per the L11.22 plan (BE move, Risk Map SL).',
        correct: true,
        explain:
          'Correct. The candle flip is information — velocity has reversed. The L11.22 trade plan still applies: SL at the Risk Map level, BE move at TP1 if reached, no widening. The flip does not necessarily mean exit-immediately, but it does mean the trade has lost its candle confirmation. Manage tightly per protocol; do not improvise.',
      },
      {
        id: 'c',
        text: 'Switch to Default mode so you can stop seeing the magenta.',
        correct: false,
        explain:
          'Pure denial. Switching to Default removes the visual data without changing what is happening on the chart. The magenta flip is broadcasting information; hiding it does not change the underlying read. This is mistake six in its purest form.',
      },
      {
        id: 'd',
        text: 'Add to the position — contrarian conviction is rewarded.',
        correct: false,
        explain:
          'Adding to a losing trade is a protocol violation regardless of candle context. The L11.22 mistake list explicitly forbids it. Contrarian thinking against the synthesis layer is reckless; against both the synthesis AND the candles is operator suicide.',
      },
    ],
  },
  {
    id: 'r5',
    scenario:
      'You picked Trend Mode 4 sessions ago. Three of the four sessions felt confusing — the colors blurred, you misjudged shade boundaries, you had two losing trades that the candle read seemed to predict but you missed. You are tempted to switch to Composite Bold for clarity.',
    prompt: 'What does the Candles Operator framework say to do?',
    options: [
      {
        id: 'a',
        text: 'Switch immediately — 4 sessions is enough to know the mode does not work.',
        correct: false,
        explain:
          '4 sessions is calibration phase, not evaluation phase. The framework explicitly states sessions 1-5 are calibration where everything feels confusing. Switching here resets the calibration and starts the same struggle on a different mode — the mistake six pattern.',
      },
      {
        id: 'b',
        text: 'Stay with Trend Mode for 16 more sessions to complete the 20-session commitment.',
        correct: true,
        explain:
          'Correct. The 20-session commitment exists precisely because the first 5-10 sessions feel confusing for every mode. Sessions 1-5 are calibration, 5-15 are pattern recognition, 15-20 are honest evaluation. You are 4 sessions in — still in calibration. The losing trades teach the calibration; switching mid-learning resets the entire process. Stick with it.',
      },
      {
        id: 'c',
        text: 'Switch to Default until you are more experienced, then come back.',
        correct: false,
        explain:
          'Switching to Default during calibration abandons the candle-reading skill development entirely. The point of calibration is building shade-recognition; running Default during the learning phase means you will not develop the skill at all. Default is for backtesting, monitor issues, or specific workflow needs — not for "wait until I am ready."',
      },
      {
        id: 'd',
        text: 'Run all three modes simultaneously across multiple charts for comparison.',
        correct: false,
        explain:
          'Running multiple modes simultaneously prevents you from internalizing any single mode\u2019s vocabulary. Each mode has its own visual pattern library; mixing them mid-learning means none of them get learned. The 20-session commitment is single-mode for this exact reason.',
      },
    ],
  },
];

// ============================================================
// QUIZ QUESTIONS — knowledge check
// ============================================================
const quizQuestions = [
  {
    id: 'q1',
    question: 'How does the 7-mode Cipher Candles dropdown actually decompose architecturally?',
    options: [
      { id: 'a', text: '7 independent modes, each with its own scoring algorithm.', correct: false },
      { id: 'b', text: '3 metrics (Velocity / Tension / Composite) x 2 intensities (Standard / Bold) + Default opt-out.', correct: true },
      { id: 'c', text: '4 trend modes + 3 reversal modes.', correct: false },
      { id: 'd', text: '6 active modes that all use the same Composite formula at different weights.', correct: false },
    ],
    explain:
      'The 7 dropdown entries collapse to 3 metric choices times 2 intensity choices, plus the Default opt-out. Trend / Trend Bold = Velocity + Standard/Bold. Tension / Tension Bold = Tension + Standard/Bold. Composite / Composite Bold = blend + Standard/Bold. Default = no Cipher coloring. Three real decisions, not seven.',
  },
  {
    id: 'q2',
    question: 'In the 8-level gradient, what is the threshold for TEAL_DEEP shade?',
    options: [
      { id: 'a', text: 'Score >= 50', correct: false },
      { id: 'b', text: 'Score >= 70', correct: false },
      { id: 'c', text: 'Score >= 80', correct: true },
      { id: 'd', text: 'Score >= 100', correct: false },
    ],
    explain:
      'TEAL_DEEP fires at score >= 80, meaning the metric is at 80%+ of its 100-bar peak in the bullish direction. The four positive thresholds are 0, 20, 50, 80, mirrored on the magenta side. Score = 100 is the absolute peak (rare; everything >= 80 prints DEEP).',
  },
  {
    id: 'q3',
    question: 'What is the Composite mode formula for combining the three scores?',
    options: [
      { id: 'a', text: '40% Velocity + 40% Tension + 20% Volume', correct: false },
      { id: 'b', text: '50% Velocity + 30% Tension + 20% Volume direction', correct: true },
      { id: 'c', text: '33% each (equal weighting)', correct: false },
      { id: 'd', text: '60% Velocity + 25% Tension + 15% Volume', correct: false },
    ],
    explain:
      'Composite uses 50/30/20 weighting. Velocity dominates (50%) because directional momentum is the primary read. Tension qualifies (30%) — high velocity with high tension is exhaustion, with low tension is sustainable. Volume amplifies (20%) whichever side the candle closes on. The weights cannot push a bear to a bull.',
  },
  {
    id: 'q4',
    question: 'What is the difference between Standard and Bold variants of the same mode?',
    options: [
      { id: 'a', text: 'Bold uses different scoring formulas with higher sensitivity.', correct: false },
      { id: 'b', text: 'Standard uses 4 shades while Bold uses 8 shades.', correct: false },
      { id: 'c', text: 'Identical scores and gradient mapping; Bold renders with full saturation, Standard renders slightly muted.', correct: true },
      { id: 'd', text: 'Bold updates every bar, Standard updates every 5 bars for smoothing.', correct: false },
    ],
    explain:
      'Same metric, same scores, same 8-level gradient. Bold uses fade=0 (fully saturated) while Standard uses fade=12 (slightly muted, ~95% alpha). Bold suits dark monitors and short sessions; Standard suits bright monitors and long sessions. The choice is rendering, not analysis.',
  },
  {
    id: 'q5',
    question: 'Which preset auto-selects Composite Bold as its candle mode?',
    options: [
      { id: 'a', text: 'Trend Trader', correct: false },
      { id: 'b', text: 'Swing Trader', correct: false },
      { id: 'c', text: 'Scalper', correct: true },
      { id: 'd', text: 'Reversal', correct: false },
    ],
    explain:
      'Scalper auto-selects Composite Bold because scalping setups need maximum information per glance (Composite encodes velocity, tension, and volume) AND vivid contrast for fast decisions (Bold). Trend Trader runs Trend (Standard). Swing Trader runs Trend Bold. Reversal runs Tension (Standard). Sniper runs Default.',
  },
  {
    id: 'q6',
    question: 'A signal fires with 4/4 conviction score on a TEAL_PALE candle (Trend Mode active). What is the alignment read?',
    options: [
      { id: 'a', text: 'Apex visual — size up to 1.5x baseline.', correct: false },
      { id: 'b', text: 'Yellow flag — synthesis says engage but candle shows weak velocity.', correct: true },
      { id: 'c', text: 'Clean skip — PALE candle invalidates the signal.', correct: false },
      { id: 'd', text: 'Hidden strength — the candle understates the actual setup.', correct: false },
    ],
    explain:
      'Strong signal + PALE candle = yellow flag. The conviction synthesis (4/4) says engage but the candle shows weak underlying velocity. The trade still has the four-factor backing, but the candle warns that follow-through may be limited. Trade smaller and scale faster than baseline; do not skip outright — the synthesis is still Strong.',
  },
  {
    id: 'q7',
    question: 'You are 6 sessions into your 20-session commitment with Trend Mode and feel like switching to Composite for clarity. What does the framework recommend?',
    options: [
      { id: 'a', text: 'Switch immediately — if it does not feel right after 6 sessions, it never will.', correct: false },
      { id: 'b', text: 'Wait until session 20, then evaluate honestly.', correct: true },
      { id: 'c', text: 'Switch but plan to return to Trend Mode if Composite does not work either.', correct: false },
      { id: 'd', text: 'Run both modes on different charts to compare.', correct: false },
    ],
    explain:
      'Sessions 1-5 are calibration, 5-15 are pattern recognition, 15-20 are honest evaluation. At session 6, you are still building shade recognition and pattern library. The confusion is expected. Switching mid-learning resets the calibration and starts the same struggle on a different mode. Honor the 20-session commitment, evaluate at the end.',
  },
  {
    id: 'q8',
    question: 'Which of the following is a LEGITIMATE reason to switch candle modes mid-session?',
    options: [
      { id: 'a', text: 'The current mode is not showing the setup you want to see.', correct: false },
      { id: 'b', text: 'You are in a losing trade and want to see if another mode tells a different story.', correct: false },
      { id: 'c', text: 'You are shifting from trend trades to reversal trades within the same session.', correct: true },
      { id: 'd', text: 'The candles look noisy and you want to find a calmer-looking mode.', correct: false },
    ],
    explain:
      'Strategy context shift is one of three legitimate switches (alongside intensity adjustment for environment changes and switching to Default for chart study). Switching to hunt for a setup, to deny an unfavorable read, or to confirm an existing trade are all illegitimate — the discipline failure modes covered in section fifteen.',
  },
];

// ============================================================
// CIPHER CANDLE PALETTE — exact 8-level gradient
// ============================================================
const TEAL_DEEP = '#0E8A7F';
const TEAL_STD = '#26A69A';
const TEAL_LIGHT = '#5BC0B5';
const TEAL_PALE = '#A6E0DA';
const MAG_PALE = '#F4B8B7';
const MAG_LIGHT = '#EF8A88';
const MAG_STD = '#EF5350';
const MAG_DEEP = '#C13C39';

function scoreToColor(score: number): string {
  if (score >= 80) return TEAL_DEEP;
  if (score >= 50) return TEAL_STD;
  if (score >= 20) return TEAL_LIGHT;
  if (score >= 0) return TEAL_PALE;
  if (score >= -20) return MAG_PALE;
  if (score >= -50) return MAG_LIGHT;
  if (score >= -80) return MAG_STD;
  return MAG_DEEP;
}

const easeInOut = (x: number): number => {
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
};

// ============================================================
// CONFETTI — gold-standard from L11.11
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
// ANIMSCENE — gold-standard from L11.11
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
// ANIMATIONS — 13 total
// ============================================================

// A1 — GradientHeroAnim (S01) — 8-shade gradient row with score sweep
function GradientHeroAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 8.0;
    const tt = (t % T) / T;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE CIPHER CANDLE GRADIENT', w / 2, 26);
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.fillText('8 shades \u2014 4 teal + 4 magenta \u2014 score \u2212100 to +100', w / 2, 44);
    const scores = [-90, -65, -35, -10, 10, 35, 65, 90];
    const labels = ['MAG_DEEP', 'MAG_STD', 'MAG_LIGHT', 'MAG_PALE', 'TEAL_PALE', 'TEAL_LIGHT', 'TEAL_STD', 'TEAL_DEEP'];
    const candleW = (w * 0.85) / 8;
    const candleH = h * 0.42;
    const startX = (w - candleW * 8) / 2;
    const candleY = 70;
    scores.forEach((score, i) => {
      const revealStart = i * 0.07;
      if (tt < revealStart) return;
      const fade = Math.min(1, (tt - revealStart) / 0.10);
      const x = startX + i * candleW;
      ctx.globalAlpha = fade;
      ctx.fillStyle = scoreToColor(score);
      ctx.fillRect(x + candleW * 0.15, candleY + 10, candleW * 0.7, candleH - 20);
      ctx.strokeStyle = scoreToColor(score);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + candleW / 2, candleY + 4);
      ctx.lineTo(x + candleW / 2, candleY + candleH - 4);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.fillText(score > 0 ? `+${score}` : `${score}`, x + candleW / 2, candleY + candleH + 14);
      ctx.fillStyle = scoreToColor(score);
      ctx.font = 'bold 8px system-ui, -apple-system, sans-serif';
      ctx.fillText(labels[i], x + candleW / 2, candleY + candleH + 28);
      ctx.globalAlpha = 1;
    });
    if (tt > 0.65) {
      const sweepT = (tt - 0.65) / 0.30;
      const score = -100 + sweepT * 200;
      const idx = Math.max(0, Math.min(7, Math.floor((score + 100) / 25)));
      const pX = startX + (idx + 0.5) * candleW;
      ctx.strokeStyle = '#FFB300';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pX, candleY - 4);
      ctx.lineTo(pX, candleY + candleH + 4);
      ctx.stroke();
      ctx.fillStyle = '#FFB300';
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.fillText(`score: ${Math.round(score)}`, pX, candleY - 8);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.fillText('Saturation = conviction. Direction = side.', w / 2, h - 12);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// A2 — ThreeScoresAnim (S02) — three columns, score formulas computing
function ThreeScoresAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 10.0;
    const tt = (t % T) / T;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THREE SCORES \u2014 ONE BAR', w / 2, 24);
    const colW = (w - 60) / 3;
    const startX = 30;
    const colTop = 50;
    const colH = h - 110;
    const cols = [
      { name: 'VELOCITY', score: 65, formula: 'c_velocity / vel_max \u00D7 100', desc: 'Directional momentum' },
      { name: 'TENSION', score: 40, formula: 'c_tension / tens_max \u00D7 100', desc: 'Stretch from Flow' },
      { name: 'COMPOSITE', score: 51, formula: '0.50V + 0.30T + 0.20Vol', desc: 'Three dimensions blended' },
    ];
    cols.forEach((col, i) => {
      const x = startX + i * colW + (i * 5);
      const cw = colW - 5;
      ctx.fillStyle = 'rgba(255,255,255,0.02)';
      ctx.fillRect(x, colTop, cw, colH);
      ctx.strokeStyle = 'rgba(255,255,255,0.10)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, colTop, cw, colH);
      ctx.fillStyle = '#FFB300';
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(col.name, x + cw / 2, colTop + 18);
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.font = '9px system-ui, -apple-system, sans-serif';
      ctx.fillText(col.desc, x + cw / 2, colTop + 32);
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '9px system-ui, -apple-system, sans-serif';
      ctx.fillText(col.formula, x + cw / 2, colTop + 50);
      const fillT = i < 2
        ? Math.max(0, Math.min(1, (tt - 0.20 - i * 0.10) / 0.20))
        : Math.max(0, Math.min(1, (tt - 0.5) / 0.20));
      const visScore = Math.round(col.score * fillT);
      const barY = colTop + 70;
      const barH = 20;
      const barX = x + 15;
      const barW = cw - 30;
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fillRect(barX, barY, barW, barH);
      ctx.strokeStyle = 'rgba(255,255,255,0.10)';
      ctx.strokeRect(barX, barY, barW, barH);
      const fillW = (col.score / 100) * barW * fillT;
      ctx.fillStyle = scoreToColor(col.score);
      ctx.fillRect(barX, barY, fillW, barH);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${visScore}`, x + cw / 2, barY + 50);
      if (fillT > 0.90) {
        const candleX = x + cw / 2 - 10;
        const candleY = barY + 70;
        ctx.fillStyle = scoreToColor(col.score);
        ctx.fillRect(candleX, candleY, 20, 60);
        ctx.strokeStyle = scoreToColor(col.score);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(candleX + 10, candleY - 8);
        ctx.lineTo(candleX + 10, candleY + 68);
        ctx.stroke();
      }
    });
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Three scores. Three modes. Pick one to paint with.', w / 2, h - 14);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// A3 — EightLevelGradientAnim (S03) — single candle morphs through shades
function EightLevelGradientAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 12.0;
    const tt = (t % T) / T;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SCORE \u2192 SHADE', w / 2, 22);
    const half = tt < 0.5 ? tt / 0.5 : 1 - (tt - 0.5) / 0.5;
    const score = -100 + half * 200;
    const thresholds = [
      { lo: 80, hi: 100, label: 'TEAL_DEEP' },
      { lo: 50, hi: 80, label: 'TEAL_STD' },
      { lo: 20, hi: 50, label: 'TEAL_LIGHT' },
      { lo: 0, hi: 20, label: 'TEAL_PALE' },
      { lo: -20, hi: 0, label: 'MAG_PALE' },
      { lo: -50, hi: -20, label: 'MAG_LIGHT' },
      { lo: -80, hi: -50, label: 'MAG_STD' },
      { lo: -100, hi: -80, label: 'MAG_DEEP' },
    ];
    const listX = 24;
    const listW = 130;
    const listTop = 50;
    const listRowH = (h - 100) / 8;
    thresholds.forEach((th, i) => {
      const y = listTop + i * listRowH;
      const isActive = score >= th.lo && score < th.hi;
      const c = scoreToColor((th.lo + th.hi) / 2);
      ctx.fillStyle = isActive ? c + '30' : 'rgba(255,255,255,0.02)';
      ctx.fillRect(listX, y, listW, listRowH - 3);
      ctx.strokeStyle = isActive ? c : 'rgba(255,255,255,0.08)';
      ctx.lineWidth = isActive ? 1.5 : 1;
      ctx.strokeRect(listX, y, listW, listRowH - 3);
      ctx.fillStyle = isActive ? '#FFFFFF' : 'rgba(255,255,255,0.5)';
      ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      const range = th.hi === 100 ? '\u226580' : th.lo === -100 ? '<-80' : `${th.lo} to ${th.hi}`;
      ctx.fillText(range, listX + 6, y + listRowH * 0.45);
      ctx.fillStyle = c;
      ctx.font = 'bold 8px system-ui, -apple-system, sans-serif';
      ctx.fillText(th.label, listX + 6, y + listRowH * 0.78);
    });
    const candleX = w * 0.62;
    const candleW = 60;
    const candleY = 70;
    const candleH = h - 130;
    ctx.fillStyle = scoreToColor(score);
    ctx.fillRect(candleX, candleY, candleW, candleH);
    ctx.strokeStyle = scoreToColor(score);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(candleX + candleW / 2, candleY - 14);
    ctx.lineTo(candleX + candleW / 2, candleY + candleH + 14);
    ctx.stroke();
    ctx.fillStyle = scoreToColor(score);
    ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(score >= 0 ? `+${Math.round(score)}` : `${Math.round(score)}`, candleX + candleW / 2, candleY + candleH + 48);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
    ctx.fillText('current score', candleX + candleW / 2, candleY + candleH + 64);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.fillText('Eight shades. One number maps to one color.', w / 2, h - 12);
  }, []);
  return <AnimScene draw={draw} aspectRatio={4 / 3} />;
}

// A4 — TrendModeAnim (S05) — candles painted by velocity
function TrendModeAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 9.0;
    const tt = (t % T) / T;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TREND MODE \u2014 PAINTED BY VELOCITY', w / 2, 22);
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.fillText('Deep color = strong velocity. Pale = decelerating.', w / 2, 38);
    const cx = 30;
    const cy = 60;
    const cw = w - 60;
    const ch = h - 110;
    const candleData = [
      { o: 0.62, c: 0.60, vel: -10 }, { o: 0.60, c: 0.58, vel: -15 },
      { o: 0.58, c: 0.59, vel: 5 }, { o: 0.59, c: 0.56, vel: 25 },
      { o: 0.56, c: 0.52, vel: 45 }, { o: 0.52, c: 0.47, vel: 65 },
      { o: 0.47, c: 0.41, vel: 85 }, { o: 0.41, c: 0.34, vel: 95 },
      { o: 0.34, c: 0.28, vel: 90 }, { o: 0.28, c: 0.24, vel: 75 },
      { o: 0.24, c: 0.22, vel: 50 }, { o: 0.22, c: 0.21, vel: 30 },
      { o: 0.21, c: 0.20, vel: 15 }, { o: 0.20, c: 0.21, vel: -5 },
      { o: 0.21, c: 0.22, vel: -15 }, { o: 0.22, c: 0.23, vel: -10 },
    ];
    const nC = candleData.length;
    const cwBar = cw / nC;
    const reveal = Math.min(1, tt * 1.6);
    const visCount = Math.floor(nC * reveal);
    for (let i = 0; i < visCount; i++) {
      const cd = candleData[i];
      const score = cd.c < cd.o ? -cd.vel : cd.vel;
      const color = scoreToColor(score);
      const cxBar = cx + i * cwBar + cwBar / 2;
      const oY = cy + cd.o * ch;
      const ccY = cy + cd.c * ch;
      const top = Math.min(oY, ccY);
      const bot = Math.max(oY, ccY);
      ctx.fillStyle = color;
      ctx.fillRect(cxBar - cwBar * 0.32, top, cwBar * 0.64, Math.max(2, bot - top));
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cxBar, top - 4);
      ctx.lineTo(cxBar, bot + 4);
      ctx.stroke();
    }
    if (visCount > 0) {
      const last = candleData[Math.min(nC - 1, visCount - 1)];
      const score = last.c < last.o ? -last.vel : last.vel;
      ctx.fillStyle = scoreToColor(score);
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`velocity: ${score >= 0 ? '+' : ''}${score}`, cx + cw - 8, cy + 16);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Glance-readable trend strength. No panel needed.', w / 2, h - 10);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// A5 — TensionModeAnim (S06) — candles painted by stretch
function TensionModeAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 10.0;
    const tt = (t % T) / T;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TENSION MODE \u2014 PAINTED BY STRETCH', w / 2, 22);
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.fillText('Deep color = stretched. Pale = near Flow line.', w / 2, 38);
    const cx = 30;
    const cy = 60;
    const cw = w - 60;
    const ch = h - 110;
    const flowY = cy + ch * 0.55;
    ctx.strokeStyle = 'rgba(255,179,0,0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(cx, flowY);
    ctx.lineTo(cx + cw, flowY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255,179,0,0.6)';
    ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Flow line', cx + cw - 4, flowY - 4);
    const candleData = [
      { o: 0.55, c: 0.54, tens: 5 }, { o: 0.54, c: 0.52, tens: 12 },
      { o: 0.52, c: 0.49, tens: 22 }, { o: 0.49, c: 0.46, tens: 35 },
      { o: 0.46, c: 0.42, tens: 50 }, { o: 0.42, c: 0.38, tens: 65 },
      { o: 0.38, c: 0.34, tens: 78 }, { o: 0.34, c: 0.30, tens: 88 },
      { o: 0.30, c: 0.27, tens: 95 }, { o: 0.27, c: 0.30, tens: 78 },
      { o: 0.30, c: 0.36, tens: 55 }, { o: 0.36, c: 0.43, tens: 30 },
      { o: 0.43, c: 0.50, tens: 10 }, { o: 0.50, c: 0.54, tens: -10 },
      { o: 0.54, c: 0.55, tens: -5 }, { o: 0.55, c: 0.55, tens: 0 },
    ];
    const nC = candleData.length;
    const cwBar = cw / nC;
    const reveal = Math.min(1, tt * 1.6);
    const visCount = Math.floor(nC * reveal);
    for (let i = 0; i < visCount; i++) {
      const cd = candleData[i];
      const isAboveFlow = cd.c > 0.55;
      const finalScore = isAboveFlow ? Math.abs(cd.tens) * 0.3 : -cd.tens;
      const color = scoreToColor(finalScore);
      const cxBar = cx + i * cwBar + cwBar / 2;
      const oY = cy + cd.o * ch;
      const ccY = cy + cd.c * ch;
      const top = Math.min(oY, ccY);
      const bot = Math.max(oY, ccY);
      ctx.fillStyle = color;
      ctx.fillRect(cxBar - cwBar * 0.32, top, cwBar * 0.64, Math.max(2, bot - top));
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cxBar, top - 4);
      ctx.lineTo(cxBar, bot + 4);
      ctx.stroke();
    }
    if (visCount > 8) {
      const peakX = cx + 8 * cwBar + cwBar / 2;
      const peakY = cy + 0.27 * ch;
      ctx.fillStyle = '#FFB300';
      ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('peak stretch', peakX, peakY - 16);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Stretch builds in deep color. Snap-back fades to pale.', w / 2, h - 10);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// A6 — CompositeModeAnim (S07) — 50/30/20 blend visualization
function CompositeModeAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 12.0;
    const tt = (t % T) / T;
    const examples = [
      { name: 'TREND DAY', v: 80, te: 30, vol: 60, label: 'high velocity, mid tension' },
      { name: 'EXHAUSTION', v: 60, te: 90, vol: 70, label: 'high velocity AND high tension' },
      { name: 'FAKE BREAKOUT', v: 40, te: 20, vol: -30, label: 'velocity without volume' },
    ];
    const idx = Math.floor(tt * 3);
    const ex = examples[idx];
    const localT = (tt * 3) % 1;
    const composite = Math.max(-100, Math.min(100, ex.v * 0.50 + ex.te * 0.30 + Math.abs(ex.vol) * Math.sign(ex.vol) * 0.20));
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SCENARIO', w / 2, 18);
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.fillText(ex.name, w / 2, 36);
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.fillText(ex.label, w / 2, 52);
    const layers = [
      { name: 'VELOCITY', score: ex.v, weightLabel: '50%' },
      { name: 'TENSION', score: ex.te, weightLabel: '30%' },
      { name: 'VOLUME', score: ex.vol, weightLabel: '20%' },
    ];
    const barX = 30;
    const barW = w - 60;
    const barTop = 70;
    const barRowH = 36;
    const barH = 22;
    layers.forEach((ly, i) => {
      const revealStart = i * 0.10;
      if (localT < revealStart) return;
      const fillT = Math.min(1, (localT - revealStart) / 0.15);
      const y = barTop + i * barRowH;
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${ly.name}  (${ly.weightLabel})`, barX, y - 4);
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${ly.score >= 0 ? '+' : ''}${Math.round(ly.score * fillT)}`, barX + barW, y - 4);
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.fillRect(barX, y, barW, barH);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.strokeRect(barX, y, barW, barH);
      const midX = barX + barW / 2;
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(midX, y);
      ctx.lineTo(midX, y + barH);
      ctx.stroke();
      const halfW = barW / 2;
      const fillProportion = (ly.score / 100) * fillT;
      const fillW = Math.abs(fillProportion) * halfW;
      const fillStart = ly.score >= 0 ? midX : midX - fillW;
      ctx.fillStyle = scoreToColor(ly.score);
      ctx.fillRect(fillStart, y, fillW, barH);
    });
    if (localT > 0.55) {
      const fade = Math.min(1, (localT - 0.55) / 0.15);
      const compY = barTop + 3 * barRowH + 8;
      ctx.fillStyle = `rgba(255, 179, 0, ${fade})`;
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      const eq = `${ex.v}\u00D70.5 + ${ex.te}\u00D70.3 + ${ex.vol}\u00D70.2  =  ${Math.round(composite)}`;
      ctx.fillText(eq, w / 2, compY);
      const candleX = w / 2 - 14;
      const candleY = compY + 14;
      ctx.fillStyle = scoreToColor(composite);
      ctx.globalAlpha = fade;
      ctx.fillRect(candleX, candleY, 28, 56);
      ctx.strokeStyle = scoreToColor(composite);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(candleX + 14, candleY - 6);
      ctx.lineTo(candleX + 14, candleY + 62);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }, []);
  return <AnimScene draw={draw} aspectRatio={4 / 3} />;
}

// A7 — StandardVsBoldAnim (S08) — saturation contrast
function StandardVsBoldAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 8.0;
    const tt = (t % T) / T;
    const panelW = (w - 30) / 2;
    const panelH = h - 50;
    const padX = 12;
    const padY = 30;
    const candleData = [
      { o: 0.55, c: 0.50, score: 35 }, { o: 0.50, c: 0.45, score: 55 },
      { o: 0.45, c: 0.39, score: 75 }, { o: 0.39, c: 0.32, score: 90 },
      { o: 0.32, c: 0.30, score: 70 }, { o: 0.30, c: 0.32, score: 25 },
      { o: 0.32, c: 0.36, score: -15 }, { o: 0.36, c: 0.42, score: -45 },
      { o: 0.42, c: 0.48, score: -65 }, { o: 0.48, c: 0.53, score: -55 },
      { o: 0.53, c: 0.55, score: -25 }, { o: 0.55, c: 0.55, score: 0 },
    ];
    const nC = candleData.length;
    const renderPanel = (px: number, py: number, isBold: boolean) => {
      const pw = panelW;
      const ph = panelH;
      ctx.fillStyle = 'rgba(255,255,255,0.02)';
      ctx.fillRect(px, py, pw, ph);
      ctx.strokeStyle = isBold ? 'rgba(38, 166, 154, 0.3)' : 'rgba(255,255,255,0.10)';
      ctx.lineWidth = 1;
      ctx.strokeRect(px, py, pw, ph);
      ctx.fillStyle = isBold ? '#26A69A' : 'rgba(255,255,255,0.7)';
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(isBold ? 'BOLD  (fade = 0)' : 'STANDARD  (fade = 12)', px + pw / 2, py + 18);
      const cArea = { x: px + 12, y: py + 32, w: pw - 24, h: ph - 50 };
      const cwBar = cArea.w / nC;
      const reveal = Math.min(1, tt * 1.5);
      const visCount = Math.floor(nC * reveal);
      for (let i = 0; i < visCount; i++) {
        const cd = candleData[i];
        const baseColor = scoreToColor(cd.score);
        const renderColor = isBold ? baseColor : baseColor + 'E6';
        const cxBar = cArea.x + i * cwBar + cwBar / 2;
        const oY = cArea.y + cd.o * cArea.h;
        const ccY = cArea.y + cd.c * cArea.h;
        const top = Math.min(oY, ccY);
        const bot = Math.max(oY, ccY);
        ctx.fillStyle = renderColor;
        ctx.fillRect(cxBar - cwBar * 0.32, top, cwBar * 0.64, Math.max(2, bot - top));
        ctx.strokeStyle = renderColor;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cxBar, top - 4);
        ctx.lineTo(cxBar, bot + 4);
        ctx.stroke();
      }
    };
    renderPanel(padX, padY, false);
    renderPanel(padX + panelW + 8, padY, true);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('STANDARD vs BOLD \u2014 SAME SCORES', w / 2, 18);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.fillText('Same data. Saturation differs. Pick for your monitor.', w / 2, h - 8);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// A8 — SingleBarDecodeAnim (S09) — 4 example bars decoded
function SingleBarDecodeAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 11.0;
    const tt = (t % T) / T;
    const bars = [
      { score: 88, mode: 'Trend', shade: 'TEAL_DEEP', read: 'Strong bull velocity' },
      { score: -35, mode: 'Tension', shade: 'MAG_LIGHT', read: 'Stretched bear fading' },
      { score: 12, mode: 'Composite', shade: 'TEAL_PALE', read: 'Faintly bullish blend' },
      { score: -82, mode: 'Trend', shade: 'MAG_DEEP', read: 'Strong bear velocity' },
    ];
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('READING A SINGLE BAR', w / 2, 22);
    const colW = (w - 40) / 4;
    const startX = 20;
    const candleY = 50;
    const candleH = 90;
    bars.forEach((bar, i) => {
      const revealStart = i * 0.18;
      if (tt < revealStart) return;
      const revealT = Math.min(1, (tt - revealStart) / 0.15);
      const x = startX + i * colW;
      const candleX = x + colW / 2 - 16;
      ctx.globalAlpha = revealT;
      ctx.fillStyle = scoreToColor(bar.score);
      ctx.fillRect(candleX, candleY, 32, candleH);
      ctx.strokeStyle = scoreToColor(bar.score);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(candleX + 16, candleY - 8);
      ctx.lineTo(candleX + 16, candleY + candleH + 8);
      ctx.stroke();
      ctx.globalAlpha = 1;
      if (revealT > 0.6) {
        const decodeFade = Math.min(1, (revealT - 0.6) / 0.30);
        const decodeY = candleY + candleH + 18;
        const decodeX = x + 4;
        const decodeW = colW - 8;
        ctx.fillStyle = `rgba(255,255,255,${0.04 * decodeFade})`;
        ctx.fillRect(decodeX, decodeY, decodeW, h - decodeY - 18);
        ctx.strokeStyle = `rgba(255,255,255,${0.10 * decodeFade})`;
        ctx.strokeRect(decodeX, decodeY, decodeW, h - decodeY - 18);
        ctx.fillStyle = `rgba(255,255,255,${decodeFade})`;
        ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${bar.score >= 0 ? '+' : ''}${bar.score}`, x + colW / 2, decodeY + 22);
        ctx.fillStyle = scoreToColor(bar.score);
        ctx.globalAlpha = decodeFade;
        ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
        ctx.fillText(bar.shade, x + colW / 2, decodeY + 38);
        ctx.globalAlpha = 1;
        ctx.fillStyle = `rgba(255,255,255,${0.5 * decodeFade})`;
        ctx.font = '8px system-ui, -apple-system, sans-serif';
        ctx.fillText(`mode: ${bar.mode}`, x + colW / 2, decodeY + 52);
        ctx.fillStyle = `rgba(255,255,255,${0.8 * decodeFade})`;
        ctx.font = 'bold 8px system-ui, -apple-system, sans-serif';
        const words = bar.read.split(' ');
        const halfIdx = Math.ceil(words.length / 2);
        const line1 = words.slice(0, halfIdx).join(' ');
        const line2 = words.slice(halfIdx).join(' ');
        ctx.fillText(line1, x + colW / 2, decodeY + 68);
        if (line2) ctx.fillText(line2, x + colW / 2, decodeY + 80);
      }
    });
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Score \u2192 shade \u2192 read. Practice until under one second.', w / 2, h - 8);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// A9 — ClusterReadAnim (S10) — 4 cluster patterns cycling
function ClusterReadAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 12.0;
    const tt = (t % T) / T;
    const patterns = [
      { name: 'SUSTAINABLE TREND', read: 'Healthy bull trend, sustainable', scores: [40, 60, 85, 65, 35, 15] },
      { name: 'CLIMACTIC TOP', read: 'Bull peak then sharp reversal', scores: [50, 70, 90, 88, -15, -45] },
      { name: 'RANGE CHOP', read: 'No directional edge', scores: [10, -10, 15, -8, 12, -12] },
      { name: 'REVERSAL BUILDING', read: 'Bear exhaustion, bull starting', scores: [-85, -65, -40, -15, 10, 30] },
    ];
    const idx = Math.floor(tt * 4);
    const p = patterns[idx];
    const localT = (tt * 4) % 1;
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CLUSTER PATTERN', w / 2, 18);
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.fillText(p.name, w / 2, 36);
    const nC = 6;
    const candleW = (w * 0.7) / nC;
    const candleH = h * 0.40;
    const startX = (w - candleW * nC) / 2;
    const candleY = 60;
    p.scores.forEach((score, i) => {
      const revealStart = i * 0.10;
      if (localT < revealStart) return;
      const fade = Math.min(1, (localT - revealStart) / 0.12);
      const x = startX + i * candleW;
      ctx.globalAlpha = fade;
      ctx.fillStyle = scoreToColor(score);
      ctx.fillRect(x + candleW * 0.18, candleY + 8, candleW * 0.64, candleH - 16);
      ctx.strokeStyle = scoreToColor(score);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + candleW / 2, candleY);
      ctx.lineTo(x + candleW / 2, candleY + candleH);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(score >= 0 ? `+${score}` : `${score}`, x + candleW / 2, candleY + candleH + 14);
      ctx.globalAlpha = 1;
    });
    if (localT > 0.55) {
      const readFade = Math.min(1, (localT - 0.55) / 0.20);
      const ry = h - 60;
      const rh = 38;
      ctx.fillStyle = `rgba(255, 179, 0, ${0.10 * readFade})`;
      ctx.fillRect(0, ry, w, rh);
      ctx.strokeStyle = `rgba(255, 179, 0, ${0.4 * readFade})`;
      ctx.lineWidth = 1;
      ctx.strokeRect(0, ry, w, rh);
      ctx.fillStyle = `rgba(255, 179, 0, ${readFade})`;
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`\u2192 ${p.read}`, w / 2, ry + 23);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Read the sequence, not the bar.', w / 2, h - 10);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// A10 — RegimeShiftAnim (S11) — 14 bars showing trend-to-range transition
function RegimeShiftAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 10.0;
    const tt = (t % T) / T;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('REGIME SHIFT \u2014 TREND TO RANGE', w / 2, 22);
    const scoreSeq = [75, 85, 90, 80, 75, 65, 55, 45, 30, 15, 5, -10, 12, -8];
    const nC = scoreSeq.length;
    const cx = 30;
    const cy = 50;
    const cw = w - 60;
    const ch = h - 110;
    const cwBar = cw / nC;
    const reveal = Math.min(1, tt * 1.4);
    const visCount = Math.floor(nC * reveal);
    for (let i = 0; i < visCount; i++) {
      const score = scoreSeq[i];
      const color = scoreToColor(score);
      const cxBar = cx + i * cwBar + cwBar / 2;
      const intensity = Math.abs(score) / 100;
      const bodyH = 20 + intensity * 60;
      const midY = cy + ch / 2 + (score < 0 ? bodyH / 4 : -bodyH / 4);
      const top = midY - bodyH / 2;
      const bot = midY + bodyH / 2;
      ctx.fillStyle = color;
      ctx.fillRect(cxBar - cwBar * 0.32, top, cwBar * 0.64, bot - top);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cxBar, top - 5);
      ctx.lineTo(cxBar, bot + 5);
      ctx.stroke();
    }
    if (visCount >= 8) {
      const divX = cx + 8 * cwBar;
      ctx.strokeStyle = 'rgba(255,179,0,0.5)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(divX, cy);
      ctx.lineTo(divX, cy + ch);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    if (visCount >= 4) {
      ctx.fillStyle = '#26A69A';
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('TREND', cx + 4 * cwBar, cy - 8);
    }
    if (visCount >= 12) {
      ctx.fillStyle = '#FFB300';
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('RANGE', cx + 12 * cwBar, cy - 8);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('The cluster color flip IS the regime shift.', w / 2, h - 10);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// A11 — CandlesPlusSynthesisAnim (S12) — Strong signal on TEAL_DEEP candle
function CandlesPlusSynthesisAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 10.0;
    const tt = (t % T) / T;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CANDLES CONFIRM THE SYNTHESIS', w / 2, 20);
    const cx = 30;
    const cy = 50;
    const cw = w * 0.55;
    const ch = h - 110;
    const scores = [10, 25, 40, 55, 65, 75, 85, 90, 88, 80, 70, 60];
    const nC = scores.length;
    const cwBar = cw / nC;
    const reveal = Math.min(1, tt * 1.6);
    const visCount = Math.floor(nC * reveal);
    for (let i = 0; i < visCount; i++) {
      const score = scores[i];
      const color = scoreToColor(score);
      const cxBar = cx + i * cwBar + cwBar / 2;
      const intensity = Math.abs(score) / 100;
      const bodyH = 16 + intensity * 50;
      const yProg = i / (nC - 1);
      const midY = cy + ch * (0.85 - yProg * 0.5);
      const top = midY - bodyH / 2;
      const bot = midY + bodyH / 2;
      ctx.fillStyle = color;
      ctx.fillRect(cxBar - cwBar * 0.32, top, cwBar * 0.64, bot - top);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cxBar, top - 4);
      ctx.lineTo(cxBar, bot + 4);
      ctx.stroke();
    }
    if (visCount > 8) {
      const sigX = cx + 8 * cwBar + cwBar / 2;
      const yProg = 8 / (nC - 1);
      const sigY = cy + ch * (0.85 - yProg * 0.5);
      const labelW = 50;
      const labelH = 18;
      const lblY = sigY + 30;
      const pulse = 0.5 + 0.5 * Math.sin(t * 4);
      const grad = ctx.createRadialGradient(sigX, sigY, 0, sigX, sigY, 30 + 5 * pulse);
      grad.addColorStop(0, `rgba(38, 166, 154, ${0.4 * pulse})`);
      grad.addColorStop(1, 'rgba(38, 166, 154, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(sigX - 40, sigY - 40, 80, 80);
      ctx.fillStyle = '#26A69A';
      ctx.fillRect(sigX - labelW / 2, lblY, labelW, labelH);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Long +', sigX, lblY + 12);
    }
    if (tt > 0.5) {
      const ttFade = Math.min(1, (tt - 0.5) / 0.15);
      const ttX = cx + cw + 20;
      const ttY = cy + 20;
      const ttW = w - ttX - 20;
      const ttH = ch - 50;
      ctx.fillStyle = `rgba(15,15,15,${0.95 * ttFade})`;
      ctx.fillRect(ttX, ttY, ttW, ttH);
      ctx.strokeStyle = `rgba(38, 166, 154, ${0.4 * ttFade})`;
      ctx.lineWidth = 1;
      ctx.strokeRect(ttX, ttY, ttW, ttH);
      ctx.globalAlpha = ttFade;
      const lines = [
        { text: 'Pulse Cross', color: 'rgba(255,255,255,0.95)', bold: true },
        { text: 'Trend: STRONG \u2713', color: '#26A69A' },
        { text: 'ADX: 28 \u2713', color: '#26A69A' },
        { text: 'Volume: 1.6\u00D7 \u2713', color: '#26A69A' },
        { text: 'Health: 72% \u2713', color: '#26A69A' },
        { text: '', color: '' },
        { text: '\u2795 Strong \u2014 4/4', color: '#26A69A', bold: true },
      ];
      const lh = 16;
      lines.forEach((ln, i) => {
        if (!ln.text) return;
        ctx.fillStyle = ln.color;
        ctx.font = `${ln.bold ? 'bold ' : ''}10px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'left';
        ctx.fillText(ln.text, ttX + 10, ttY + 18 + i * lh);
      });
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TEAL_DEEP candle + Strong synthesis = aligned.', w / 2, h - 10);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// A12 — PresetWheelAnim (S13) — 5 presets cycling, each highlights its candle mode
function PresetWheelAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 12.0;
    const tt = (t % T) / T;
    const presets = [
      { name: 'TREND TRADER', mode: 'Trend', sampleScore: 75 },
      { name: 'SCALPER', mode: 'Composite Bold', sampleScore: 60 },
      { name: 'SWING TRADER', mode: 'Trend Bold', sampleScore: 85 },
      { name: 'REVERSAL', mode: 'Tension', sampleScore: -65 },
      { name: 'SNIPER', mode: 'Default', sampleScore: 0 },
    ];
    const activeIdx = Math.floor(tt * 5) % 5;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PRESETS \u2192 CANDLE MODES', w / 2, 24);
    const cardW = (w - 40) / 5;
    const cardH = h - 90;
    const startX = 20;
    const startY = 50;
    presets.forEach((p, i) => {
      const cardX = startX + i * cardW + 2;
      const cw = cardW - 4;
      const isActive = i === activeIdx;
      ctx.fillStyle = isActive ? 'rgba(38, 166, 154, 0.15)' : 'rgba(255,255,255,0.03)';
      ctx.fillRect(cardX, startY, cw, cardH);
      ctx.strokeStyle = isActive ? '#26A69A' : 'rgba(255,255,255,0.08)';
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.strokeRect(cardX, startY, cw, cardH);
      ctx.fillStyle = isActive ? '#FFB300' : 'rgba(255,255,255,0.5)';
      ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(p.name, cardX + cw / 2, startY + 18);
      ctx.fillStyle = isActive ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.3)';
      ctx.font = 'bold 8px system-ui, -apple-system, sans-serif';
      ctx.fillText(p.mode, cardX + cw / 2, startY + 32);
      const candleX = cardX + cw / 2 - 10;
      const candleY = startY + 50;
      if (p.mode === 'Default') {
        ctx.fillStyle = isActive ? '#26A69A' : 'rgba(38, 166, 154, 0.3)';
      } else {
        ctx.fillStyle = isActive ? scoreToColor(p.sampleScore) : scoreToColor(p.sampleScore) + '40';
      }
      ctx.fillRect(candleX, candleY, 20, 50);
      ctx.strokeStyle = ctx.fillStyle as string;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(candleX + 10, candleY - 4);
      ctx.lineTo(candleX + 10, candleY + 54);
      ctx.stroke();
    });
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Each preset paints by what its archetype needs to see.', w / 2, h - 14);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// A13 — ModeRecommenderAnim (S14) — decision-tree style branches
function ModeRecommenderAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 12.0;
    const tt = (t % T) / T;
    const branches = [
      { question: 'Trend strength', answer: 'Trend or Trend Bold', color: '#26A69A', score: 75 },
      { question: 'Stretch / exhaustion', answer: 'Tension or Tension Bold', color: '#EF5350', score: -75 },
      { question: 'All three at once', answer: 'Composite or Composite Bold', color: '#FFB300', score: 50 },
      { question: 'None of the above', answer: 'Default', color: 'rgba(255,255,255,0.6)', score: 0 },
    ];
    const idx = Math.floor(tt * 4);
    const localT = (tt * 4) % 1;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('WHAT DOES YOUR STRATEGY', w / 2, 28);
    ctx.fillText('NEED TO SEE?', w / 2, 46);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w / 2, 56);
    ctx.lineTo(w / 2, 80);
    ctx.stroke();
    const cardW = (w - 60) / 2;
    const cardH = (h - 200) / 2;
    const gridStartX = 30;
    const gridStartY = 90;
    branches.forEach((b, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = gridStartX + col * (cardW + 10);
      const y = gridStartY + row * (cardH + 10);
      const isActive = i === idx;
      ctx.fillStyle = isActive ? `${b.color}25` : 'rgba(255,255,255,0.03)';
      ctx.fillRect(x, y, cardW, cardH);
      ctx.strokeStyle = isActive ? b.color : 'rgba(255,255,255,0.08)';
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.strokeRect(x, y, cardW, cardH);
      ctx.fillStyle = isActive ? '#FFB300' : 'rgba(255,255,255,0.5)';
      ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(b.question.toUpperCase(), x + cardW / 2, y + 22);
      if (i !== 3) {
        const candleX = x + cardW / 2 - 10;
        const candleY = y + 36;
        ctx.fillStyle = isActive ? scoreToColor(b.score) : scoreToColor(b.score) + '40';
        ctx.fillRect(candleX, candleY, 20, 36);
        ctx.strokeStyle = ctx.fillStyle as string;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(candleX + 10, candleY - 4);
        ctx.lineTo(candleX + 10, candleY + 40);
        ctx.stroke();
      }
      if (isActive && localT > 0.4) {
        const fade = Math.min(1, (localT - 0.4) / 0.20);
        ctx.fillStyle = `rgba(255,255,255,${fade * 0.95})`;
        ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`\u2192 ${b.answer}`, x + cardW / 2, y + cardH - 16);
      } else if (!isActive) {
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = '9px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(b.answer, x + cardW / 2, y + cardH - 16);
      }
    });
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('One question. Four answers. Pick once, run it.', w / 2, h - 12);
  }, []);
  return <AnimScene draw={draw} aspectRatio={4 / 3} />;
}

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================
export default function CipherCandlesLesson() {
  const [scrollY, setScrollY] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameRound, setGameRound] = useState(0);
  const [gameSelections, setGameSelections] = useState<(string | null)[]>(new Array(gameRounds.length).fill(null));
  const [quizAnswers, setQuizAnswers] = useState<(string | null)[]>(new Array(quizQuestions.length).fill(null));
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [certRevealed, setCertRevealed] = useState(false);
  const [certId] = useState(() => `PRO-CERT-L11.23-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);

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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 11 &middot; Lesson 23</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Cipher Candles<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Three Metrics. Two Intensities. One Read.</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">The seven-mode dropdown looks complicated. Underneath: three Cipher metrics, two saturation levels, plus an opt-out. Once you see the architecture, every candle on your chart starts to read itself.</motion.p>
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
            <p className="text-xl font-extrabold mb-3">The panel reads the market. The candles let you skip the panel.</p>
            <p className="text-gray-400 leading-relaxed mb-4">Every prior Visual Layer lesson taught you to read CIPHER through the panel &mdash; rows of verdicts you scan top to bottom. That works. It is also a constant cognitive load. Your eyes leave the price action, find the panel, parse a row, return to price. Multiply by 6 modules and 200 bars in a session and the friction adds up.</p>
            <p className="text-gray-400 leading-relaxed mb-4">Cipher Candles compress the panel onto the candles themselves. Pick one of three Cipher metrics &mdash; Velocity, Tension, or Composite &mdash; and CIPHER paints every bar with that metric&apos;s eight-shade gradient. Strong bull velocity prints deep teal. Pale teal means decelerating. Faint magenta means early reversal. The bars you are already looking at carry the read. The panel becomes confirmation rather than scanner.</p>
            <p className="text-gray-400 leading-relaxed">This is the lesson that closes the Visual Layer arc. Every module from 11.16 to 11.22 fed into a panel; this lesson lifts the read off the panel and onto the bars themselves. You stop being panel-dependent.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#11088; THE CANDLES PROMISE</p>
            <p className="text-sm text-gray-400 leading-relaxed">By the end of this lesson, you will know the <strong className="text-white">three score metrics</strong>, the <strong className="text-white">eight gradient shades</strong>, and the <strong className="text-white">cluster patterns</strong> that turn the candles into your primary read. You will pick a mode for your style and run it for 20 sessions until the decode is automatic.</p>
          </div>
        </motion.div>
      </section>

      {/* === S01 — Three Metrics. Two Intensities. (Groundbreaking Concept) === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; &#11088; Three Metrics. Two Intensities.</p>
          <h2 className="text-2xl font-extrabold mb-4">The Groundbreaking Concept</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The Cipher Candles dropdown looks like seven options. The Pine implementation tells a cleaner story: <strong className="text-amber-400">three metrics</strong> (Velocity, Tension, Composite), times <strong className="text-amber-400">two intensities</strong> (Standard, Bold), plus one opt-out (Default). Once you see this, the dropdown stops being a menu and becomes a dial &mdash; pick a metric, pick a saturation, paint the bars.</p>
          <GradientHeroAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the gradient appear. Eight shades, four teal positive, four magenta negative. Each shade maps to a score band. The same gradient is used by all three metric modes &mdash; Trend Mode paints by velocity score, Tension Mode paints by stretch score, Composite Mode paints by the 50/30/20 blended score. The shade you see depends on which metric is active, but the visual vocabulary is identical.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">METRIC 1 &middot; VELOCITY</p>
              <p className="text-sm text-gray-400 leading-relaxed">The Cipher Velocity score &mdash; directional momentum normalized to the chart&apos;s 100-bar peak. High velocity = strong directional move. Low velocity = the move is decelerating or absent. Trend mode paints by Velocity. Most common choice for trend traders.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">METRIC 2 &middot; TENSION</p>
              <p className="text-sm text-gray-400 leading-relaxed">The Cipher Tension score &mdash; stretch from the Flow line, normalized to 100-bar peak stretch. High tension = price extended, snap-back imminent. Low tension = price near Flow, no immediate reversion pressure. Reversal traders use this because tension predicts the snap before momentum confirms it.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">METRIC 3 &middot; COMPOSITE</p>
              <p className="text-sm text-gray-400 leading-relaxed">A weighted blend: 50% Velocity + 30% Tension + 20% Volume direction. The most information-dense choice &mdash; every candle encodes three dimensions in its single color. Scalpers run Composite because their setups need all three reads simultaneously and they cannot afford the eye-shift to a panel.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Pick a metric for what your strategy needs to see. Pick an intensity for your monitor and your eyes. The dropdown is a dial, not a menu.</p>
          </div>
        </motion.div>
      </section>

      {/* === S02 — The 3-Score Architecture === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The 3-Score Architecture</p>
          <h2 className="text-2xl font-extrabold mb-4">Velocity. Tension. Composite. Each normalized to 100-bar peak.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Each Cipher Candle mode is built from one of three scores. Each score is computed live, normalized, and mapped to the 8-shade gradient. The math is small and the operator-facing read is large. Once you understand what each score measures, you understand which mode will tell you what.</p>
          <ThreeScoresAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the three columns compute in parallel. Velocity reads at +65 (strong bullish momentum). Tension reads at +40 (moderately stretched bull). Composite resolves to +51 via 0.5 &times; 65 + 0.3 &times; 40 + 0.2 &times; 30 (volume direction). Three scores from the same bar, three different resulting shades, depending on which mode is active.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">VELOCITY &mdash; c_velocity / vel_max &times; 100</p>
              <p className="text-sm text-gray-400 leading-relaxed">The Cipher Velocity reading divided by its 100-bar absolute peak, scaled to &plusmn;100. Velocity is the directional rate of change of the Pulse line. Fast moves print high scores. Stalling moves print low scores.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">TENSION &mdash; c_tension / tens_max &times; 100</p>
              <p className="text-sm text-gray-400 leading-relaxed">Tension measures how stretched price is from the Flow line in ATR units, divided by 100-bar peak stretch. The signed direction (above or below Flow) determines teal vs magenta.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">COMPOSITE &mdash; 0.50V + 0.30T + 0.20Vol</p>
              <p className="text-sm text-gray-400 leading-relaxed">Velocity dominates (50%) because directional momentum is primary. Tension qualifies (30%) &mdash; high velocity with high tension is exhaustion, with low tension is sustainable. Volume amplifies (20%) the candle&apos;s close direction.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SELF-CALIBRATING</p>
              <p className="text-sm text-gray-400 leading-relaxed">The 100-bar normalization makes every chart speak the same color language. Deep teal on XAUUSD means &ldquo;strong by gold&apos;s recent standards.&rdquo; Deep teal on EURUSD means &ldquo;strong by euro&apos;s recent standards.&rdquo; The operator does not need per-asset thresholds.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Three orthogonal scores, each self-calibrating. Pick the score whose dimension matters most to your style. The candles will paint that score on every bar.</p>
          </div>
        </motion.div>
      </section>

      {/* === S03 — The 8-Level Gradient === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The 8-Level Gradient</p>
          <h2 className="text-2xl font-extrabold mb-4">Four teal positive shades. Four magenta negative shades.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Each score in [&minus;100, +100] maps to one of eight discrete shades. The thresholds are 0, &plusmn;20, &plusmn;50, &plusmn;80. Crossing a threshold flips the candle to the next shade tier. Discrete, not continuous &mdash; the discreteness makes the read robust to small fluctuations.</p>
          <EightLevelGradientAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the score sweep from &minus;100 to +100 and back. The candle morphs through MAG_DEEP, MAG_STD, MAG_LIGHT, MAG_PALE, TEAL_PALE, TEAL_LIGHT, TEAL_STD, TEAL_DEEP. Eight shades is the design choice that makes Cipher Candles work. Two would carry no more information than the broker&apos;s native red/green. Sixteen would create a continuous gradient impossible to read at a glance. Eight is where the operator can name the shade in under a second.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">TEAL_DEEP &middot; SCORE &ge; 80</p>
              <p className="text-sm text-gray-400 leading-relaxed">Strong bull conviction. The metric is reading at 80%+ of its 100-bar peak in the bullish direction. These bars are rare in normal markets &mdash; expect them in clear trends, after squeeze releases, or during institutional flow.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">TEAL_STD &middot; 50 TO 80</p>
              <p className="text-sm text-gray-400 leading-relaxed">Steady bull. The metric is well above normal but not at peak. Most healthy bullish bars in a trend land here. STD clusters across multiple bars indicate a sustainable move.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">TEAL_LIGHT &middot; 20 TO 50</p>
              <p className="text-sm text-gray-400 leading-relaxed">Developing or fading bull. Either the metric is just starting to rise (early trend) or it is decaying from a stronger reading (post-peak). Context determines which. A LIGHT after a cluster of PALE means starting; a LIGHT after a cluster of DEEP means fading.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">MAGENTA SIDE &middot; MIRRORED</p>
              <p className="text-sm text-gray-400 leading-relaxed">MAG_PALE (&minus;20 to 0), MAG_LIGHT (&minus;50 to &minus;20), MAG_STD (&minus;80 to &minus;50), MAG_DEEP (&lt;&minus;80). Same threshold cuts, same operator-read meanings, opposite direction.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Eight shades, four thresholds. Saturation = conviction strength. Direction = side. Read clusters, not individual bars.</p>
          </div>
        </motion.div>
      </section>

      {/* === S04 — Default — The Opt-Out === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Default &mdash; The Opt-Out</p>
          <h2 className="text-2xl font-extrabold mb-4">When raw exchange candles are the right answer</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Default mode disables Cipher Candle coloring entirely. The chart shows the broker&apos;s native red/green candles &mdash; the same coloring you would see on any non-CIPHER chart. No score is painted, no gradient is rendered. Default exists because for some workflows, raw price is the right ground truth.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">REASON 1 &middot; BACKTESTING WITH PURITY</p>
              <p className="text-sm text-gray-400 leading-relaxed">When you scroll a chart looking for setups in hindsight, Cipher coloring biases the search &mdash; your eye is drawn to TEAL_DEEP clusters whether or not they correspond to your strategy criteria. Default removes the bias. You evaluate setups by structure and math alone, then confirm against the panel.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">REASON 2 &middot; MONITOR LIMITATIONS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Some monitors compress the green-blue spectrum poorly. TEAL_PALE and TEAL_LIGHT can look identical on lower-end displays, especially with f.lux or night-mode filters active. If you cannot reliably distinguish all four shades on each side, you cannot use the candles for their intended purpose.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">REASON 3 &middot; INDICATOR STACKING</p>
              <p className="text-sm text-gray-400 leading-relaxed">If you also run another candle-coloring indicator &mdash; a Heikin Ashi overlay, a custom volume-weighted painter &mdash; only one can win. CIPHER&apos;s Default tells it to step aside.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DEFAULT IS NOT INFERIOR</p>
              <p className="text-sm text-gray-400 leading-relaxed">The dropdown puts Default at position one for a reason. It is a legitimate first choice. Operators who do not yet trust their candle reads should run Default until the panel reads are second nature, then graduate to Trend or Composite.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Default is the legitimate opt-out. Use it for backtesting, on bad monitors, or when stacking indicators. Switching back from Default takes a session to recalibrate.</p>
          </div>
        </motion.div>
      </section>

      {/* === S05 — Trend Mode === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Trend Mode</p>
          <h2 className="text-2xl font-extrabold mb-4">Velocity painted on every bar</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Trend Mode paints each candle by the Cipher Velocity score. The signal is direct: how fast is price moving in its current direction, normalized to the 100-bar peak velocity? Strong velocity in either direction prints deep colors. Stalling moves print pale. The mode reads the trend itself rather than its context.</p>
          <TrendModeAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the candles transition through the velocity profile. Bars 1-2 stall (PALE). Bars 3-7 build (LIGHT into STD). Bars 7-9 peak (DEEP). Bars 10-13 decay (STD into LIGHT into PALE). Bars 14-16 reverse direction (faint magenta). Same trend, full lifecycle painted in shade transitions. The trend trader reads acceleration, peak, and decay in real time without ever consulting the panel.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">DEEP COLOR &middot; VELOCITY AT PEAK</p>
              <p className="text-sm text-gray-400 leading-relaxed">When a Trend Mode candle prints TEAL_DEEP or MAG_DEEP, the bar&apos;s velocity is at 80%+ of the 100-bar peak velocity for that direction. A cluster of deep bars is a high-conviction trending sequence; isolated deep bars are usually false breakouts that fail within 1-2 bars.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STD &middot; THE WORKHORSE</p>
              <p className="text-sm text-gray-400 leading-relaxed">TEAL_STD or MAG_STD (50-80 score) is where most healthy trend bars live. The trend is well-established but not at peak intensity. Operators who size on Strong-tier conviction signals find that those signals frequently fire during STD-cluster sequences.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PALE TIER &middot; DECAY OR EARLY</p>
              <p className="text-sm text-gray-400 leading-relaxed">PALE candles after a DEEP cluster signal velocity decay. PALE candles after a flat patch signal early trend formation. The two contexts are visually identical but operationally opposite. Read the cluster history, not just the latest bar.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FLIP TO MAGENTA &middot; THE EARLY WARNING</p>
              <p className="text-sm text-gray-400 leading-relaxed">Trend Mode flips to magenta when velocity goes negative. The flip from TEAL_PALE to MAG_PALE is often the earliest visible sign of a regime change &mdash; several bars before the panel&apos;s Header row says TREND CURVING.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Deep = trend at peak. STD = sustainable. PALE = decaying or early. Magenta flip = early warning. Read clusters, not bars.</p>
          </div>
        </motion.div>
      </section>

      {/* === S06 — Tension Mode === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Tension Mode</p>
          <h2 className="text-2xl font-extrabold mb-4">Stretch painted on every bar</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Tension Mode paints each candle by Cipher Tension &mdash; how stretched price is from the Flow line in ATR units, normalized to 100-bar peak stretch. Deep colors mean price is far from Flow and the rubber band is taut. Pale colors mean price is near Flow and there is no stretch to snap.</p>
          <TensionModeAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the price stretch below Flow then snap back. The candles deepen as stretch builds, peak (DEEP magenta) at maximum extension, then fade through LIGHT and PALE as price returns to Flow. Reversal traders watch this exact signature unfold &mdash; the deeper the cluster, the higher the snap-back probability. The fade phase is the trade in progress.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">DEEP &middot; MAXIMALLY STRETCHED</p>
              <p className="text-sm text-gray-400 leading-relaxed">DEEP in Tension Mode means price has stretched 80%+ of the 100-bar peak stretch from Flow. These bars are statistically rare &mdash; they appear at exhaustion points and pre-snap setups. When Tension prints DEEP, the rubber band is loaded.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SUSTAINED DEEP &middot; LOADED, NOT YET SNAPPING</p>
              <p className="text-sm text-gray-400 leading-relaxed">A cluster of DEEP candles is a loaded zone &mdash; high probability of a reversion move, but no timing. Tension can stay at DEEP for 5-10 bars before resolving. The reversal trader waits for a Tension Snap signal to fire before engaging.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">RAPID DECAY &middot; THE SNAP IN PROGRESS</p>
              <p className="text-sm text-gray-400 leading-relaxed">When a DEEP cluster transitions through STD, LIGHT, PALE in 2-3 bars, the snap is in progress. Tension is collapsing as price returns to Flow. This is the post-engagement read for reversal traders &mdash; the trade is working.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DIRECTION-BLIND TO TREND</p>
              <p className="text-sm text-gray-400 leading-relaxed">Unlike Trend Mode, Tension Mode is non-monotonic with the trend. A strong bull trend can have low tension (price grinds up alongside Flow) or high tension (price runs away from Flow into a snap). The mode cares about distance from the dynamic anchor, not direction.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Deep = loaded rubber band. Sustained deep = watch list. Decay = snap in progress. Pale = fair value, no edge.</p>
          </div>
        </motion.div>
      </section>

      {/* === S07 — Composite Mode === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Composite Mode</p>
          <h2 className="text-2xl font-extrabold mb-4">Velocity, Tension, and Volume blended into one shade</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Composite Mode is the information-dense option. The score is a weighted blend: 50% Velocity, 30% Tension, 20% Volume direction. Three orthogonal dimensions compress into a single color per bar. The operator who masters Composite reads three reads at once with no eye-shift.</p>
          <CompositeModeAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch three scenarios cycle. TREND DAY: high velocity, mid tension, bullish volume &mdash; resolves to TEAL_STD. EXHAUSTION: high velocity AND high tension AND volume &mdash; resolves to TEAL_DEEP, but the read is risky (stretched). FAKE BREAKOUT: moderate velocity, low tension, bearish volume divergence &mdash; resolves to weak teal, signaling that the move is not confirmed.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">VELOCITY 50% &middot; THE DOMINANT VOICE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Half the composite score comes from Velocity alone. A candle with velocity score 80 will print deep teal under Composite Mode regardless of tension or volume. Velocity is the floor; the other two adjust around it.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">TENSION 30% &middot; THE QUALIFIER</p>
              <p className="text-sm text-gray-400 leading-relaxed">Tension qualifies what velocity is doing. High velocity with low tension means a sustainable move. High velocity with high tension means an exhaustive move &mdash; the composite still leans toward velocity but with reduced shade depth.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">VOLUME 20% &middot; THE AMPLIFIER</p>
              <p className="text-sm text-gray-400 leading-relaxed">Volume direction is the candle&apos;s close-direction times the volume ratio score. It amplifies whichever side the candle closes on. Enough to push a bar from TEAL_LIGHT to TEAL_STD, but not enough to flip a bear to a bull.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE INTERPRETATION CHALLENGE</p>
              <p className="text-sm text-gray-400 leading-relaxed">A TEAL_DEEP Composite candle could be high velocity + low tension + bullish volume (sustainable trend), OR extreme velocity + moderate tension + neutral volume (climactic trend), OR high velocity + low tension + huge volume (institutional flow). The operator cannot distinguish from color alone &mdash; this is the trade-off.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">50/30/20 = Velocity, Tension, Volume. Dense but ambiguous. Best for advanced operators who already read the panel cleanly.</p>
          </div>
        </motion.div>
      </section>

      {/* === S08 — Standard vs Bold === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Standard vs Bold</p>
          <h2 className="text-2xl font-extrabold mb-4">Same metric. Same scores. Different saturation.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Once you pick a metric, the second decision is intensity. Standard variants render with a fade value of 12 in Pine &mdash; about 95% alpha, slightly muted. Bold variants render with fade 0 &mdash; fully saturated. The score, the gradient mapping, and the threshold rules are identical. Only the rendering vivacity differs.</p>
          <StandardVsBoldAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">The two panels show the same 12-bar sequence rendered side-by-side. Identical scores produce identical shades. The only difference is saturation &mdash; Bold pops more vividly, Standard takes the visual edge off. On a daylight monitor in a long session, Standard reduces eye fatigue. On a dark-themed chart in a short session, Bold cuts through the visual noise.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">STANDARD &middot; FOR EXTENDED SESSIONS</p>
              <p className="text-sm text-gray-400 leading-relaxed">The slight transparency in Standard mode is intentional. Over 4-8 hour sessions, fully saturated colors create eye fatigue. Standard&apos;s 95% alpha keeps the colors readable while taking the visual edge off.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">BOLD &middot; FOR DARK CHARTS AND LOW LIGHT</p>
              <p className="text-sm text-gray-400 leading-relaxed">Bold variants exist because dark TradingView themes and low-light trading environments suppress color saturation. What looks vivid on a daylight monitor looks muted at night. Bold compensates &mdash; full saturation cuts through the visual noise of a dark theme.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PRESET DEFAULTS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Trend Trader runs Trend (Standard). Swing Trader runs Trend Bold. Scalper runs Composite Bold. Reversal runs Tension (Standard). The preset designers chose intensities to match their archetypes&apos; cognitive needs.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SWITCHING INTENSITY MID-SESSION</p>
              <p className="text-sm text-gray-400 leading-relaxed">Intensity is one of the few CIPHER settings where mid-session changes are encouraged. As the lighting in your room changes, as your fatigue level rises, the intensity that was right at session start may not be right four hours in. Switching changes only the rendering, not any computed values.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Bold for short sessions and dark monitors. Standard for long sessions and bright monitors. Switch as conditions change.</p>
          </div>
        </motion.div>
      </section>

      {/* === S09 — Reading a Single Bar === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Reading a Single Bar</p>
          <h2 className="text-2xl font-extrabold mb-4">Score, shade, mode, read &mdash; in under one second</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The Conviction Operator reads conviction at a glance. The Candles Operator reads each bar at a glance. The decode protocol is short: identify the shade, recall the score range, infer the mode read, translate to operational meaning. Practiced operators do this in under one second per bar &mdash; faster than they can move their eyes to the panel.</p>
          <SingleBarDecodeAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Four example bars decoded. The first (TEAL_DEEP at +88, Trend Mode) reads as &ldquo;strong bull velocity.&rdquo; The second (MAG_LIGHT at &minus;35, Tension Mode) reads as &ldquo;stretched bear, fading.&rdquo; The third (TEAL_PALE at +12, Composite Mode) reads as &ldquo;faintly bullish blend.&rdquo; The fourth (MAG_DEEP at &minus;82, Trend Mode) reads as &ldquo;strong bear velocity.&rdquo; Same shade family, different operational meaning depending on the active mode.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">STEP 1 &middot; IDENTIFY THE SHADE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Pattern-match the candle&apos;s color to one of 8 shades. New operators struggle with PALE-vs-LIGHT and STD-vs-DEEP boundary cases; experienced operators identify shade in under 200 ms.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STEP 2 &middot; RECALL THE SCORE RANGE</p>
              <p className="text-sm text-gray-400 leading-relaxed">The four positive thresholds are 0, 20, 50, 80. The four negative thresholds mirror them. Each shade corresponds to a 20-30 point band. After 50-100 hours of practice, the operator no longer thinks &ldquo;TEAL_STD = 50 to 80&rdquo; consciously &mdash; they just know the bar is in that range.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STEP 3 &middot; INFER THE MODE READ</p>
              <p className="text-sm text-gray-400 leading-relaxed">Trend Mode read: this is the velocity. Tension Mode read: this is the stretch. Composite Mode read: this is the blended score &mdash; with the ambiguity that means. The operator&apos;s active mode is in the inputs panel; the read changes meaning based on what is selected.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STEP 4 &middot; TRANSLATE TO OPERATIONAL MEANING</p>
              <p className="text-sm text-gray-400 leading-relaxed">TEAL_DEEP in Trend Mode = trend at peak, sustainable but watch for decay. MAG_STD in Tension Mode = bear stretch, watching for snap-back. TEAL_PALE in Composite = weak bullish blend, no edge yet. The translation is what makes the decode operationally useful.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Shade &rarr; range &rarr; mode read &rarr; operational meaning. Practice 30 minutes a day for three days. After that, decode is automatic.</p>
          </div>
        </motion.div>
      </section>

      {/* === S10 — Reading a Cluster === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Reading a Cluster</p>
          <h2 className="text-2xl font-extrabold mb-4">Six bars carry more meaning than any single bar</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Single-bar decode tells you the magnitude of one bar&apos;s read. Cluster reading tells you what is happening in context. Six bars in a row form a phrase &mdash; the operator reads the phrase and identifies the pattern. Sustainable trends, climactic tops, range chop, and reversal bases each have characteristic six-bar signatures.</p>
          <ClusterReadAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">The animation cycles through four signature patterns. Sustainable trend (LIGHT-STD-DEEP-STD-LIGHT-PALE) reads as healthy trend with a fading tail. Climactic top (DEEP-DEEP-DEEP then sharp magenta flip) reads as capitulation. Range chop (alternating PALE in both teal and magenta) reads as no edge. Reversal building (MAG_DEEP fading through PALE into teal LIGHT) reads as bear exhaustion with bull starting.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">PATTERN 1 &middot; SUSTAINABLE TREND</p>
              <p className="text-sm text-gray-400 leading-relaxed">LIGHT &rarr; STD &rarr; STD &rarr; DEEP &rarr; STD &rarr; LIGHT, then often a pale exit. The middle bars peak in STD-DEEP; early and late bars are lighter. Trade with the trend during the STD-DEEP middle; exit when the late LIGHT bars print.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PATTERN 2 &middot; CLIMACTIC TOP</p>
              <p className="text-sm text-gray-400 leading-relaxed">Several bars at STD-DEEP teal, then an abrupt flip to MAG_LIGHT or MAG_STD within 1-2 bars. The transition is fast &mdash; no gradual decay through PALE. Long-side operators exit at the first MAG_LIGHT print; reversal traders see the flip as an entry signal.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PATTERN 3 &middot; RANGE CHOP</p>
              <p className="text-sm text-gray-400 leading-relaxed">Six bars alternating between TEAL_PALE and MAG_PALE with no STD or LIGHT bars appearing. Monotonously light &mdash; no edge in either direction. Operators reading this pattern stay on the sidelines until a STD or DEEP bar breaks the pattern.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PATTERN 4 &middot; REVERSAL BUILDING</p>
              <p className="text-sm text-gray-400 leading-relaxed">MAG_DEEP &rarr; MAG_STD &rarr; MAG_LIGHT &rarr; MAG_PALE &rarr; PALE &rarr; LIGHT (teal). Magenta exhaustion fading toward pale, then teal emerging. Long-side operators wait for the LIGHT teal bar to confirm the reversal before engaging.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Six bars form a phrase. Phrases beat single bars. Sustainable, climactic, chop, reversal &mdash; learn the four signatures, then expand the library through practice.</p>
          </div>
        </motion.div>
      </section>

      {/* === S11 — Regime Shifts on Candles === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Regime Shifts on Candles</p>
          <h2 className="text-2xl font-extrabold mb-4">The cluster color flip IS the regime shift</h2>
          <p className="text-gray-400 leading-relaxed mb-6">When the market transitions between regimes &mdash; TREND to RANGE, RANGE to TREND, COMPRESSION to EXPANSION &mdash; the candles broadcast the shift in real time. A wall of TEAL_STD bars fading through LIGHT, PALE, then alternating with magenta is the visual signature of TREND ending and RANGE beginning. The Header row reports the same transition seconds later. The candles are the leading edge.</p>
          <RegimeShiftAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the 14-bar transition. Bars 1-4 print STD-DEEP teal (TREND regime, strong velocity). Bars 5-8 fade through LIGHT into PALE (TREND decaying). Bar 9 onward alternates pale teal with pale magenta &mdash; RANGE regime confirmed. The amber dotted line marks the regime shift point. Operators who watch candles catch this shift a bar or two before the panel confirms.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">TREND TO RANGE</p>
              <p className="text-sm text-gray-400 leading-relaxed">A sustained cluster of STD-DEEP shades (one direction) decaying through LIGHT, PALE, then alternating with the opposite color&apos;s PALE. When you see the alternating-pale pattern emerge, the trend has ended and the range has begun.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">RANGE TO TREND</p>
              <p className="text-sm text-gray-400 leading-relaxed">The reverse signature: alternating PALE bars suddenly resolve into a one-direction LIGHT &rarr; STD &rarr; DEEP cluster. The transition bar is usually a STD-tier bar with no recent precedent in the cluster &mdash; the chart breaking out of its own monotony.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">TIMING THE TRANSITION</p>
              <p className="text-sm text-gray-400 leading-relaxed">The exact bar where the regime shifts is rarely the first bar that prints differently. Wait for confirmation &mdash; usually two to three bars in the new pattern. Single-bar transitions can be false signals. The two-to-three-bar wait sacrifices some entry but eliminates most false transitions.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE PANEL AS CONFIRMATION</p>
              <p className="text-sm text-gray-400 leading-relaxed">When you spot a regime shift in the candles, glance at the Header row to confirm. If Header still says BULL TREND while your candles show range chop, wait one more bar &mdash; the Header is lagging but it will catch up.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Cluster color flip = regime shift. Wait two bars for confirmation. Glance at Header. Engage in the new direction once both agree.</p>
          </div>
        </motion.div>
      </section>

      {/* === S12 — Cipher Candles + Conviction Synthesis === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">12 &mdash; Candles + Conviction Synthesis</p>
          <h2 className="text-2xl font-extrabold mb-4">When the candle and the synthesis agree, you have alignment</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Lesson 11.22 taught the conviction synthesis layer &mdash; the four-factor score and the context-tag cascade. This lesson shows where the candle read fits into that decision. The candle on the signal bar is a corroborating data point. When the candle agrees with the synthesis, you have alignment. When they disagree, the panel is broadcasting noise the synthesis is hiding.</p>
          <CandlesPlusSynthesisAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the signal label fire on a TEAL_DEEP candle. The tooltip reports 4/4 Strong with all four factors confirmed. Both reads agree at peak intensity &mdash; this is the apex visual signature. The candle visually confirms what the tooltip says in text. Reading both takes under two seconds combined for an experienced operator.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">STRONG + DEEP CANDLE = APEX VISUAL</p>
              <p className="text-sm text-gray-400 leading-relaxed">When a signal fires with 4/4 conviction AND the candle on that bar is TEAL_DEEP (Trend Mode), you have synthesis-and-candle alignment. The score, the context tag, and the candle all broadcast the same direction at peak intensity. Conviction-tier sizing applies.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STRONG + PALE CANDLE = YELLOW FLAG</p>
              <p className="text-sm text-gray-400 leading-relaxed">A Strong signal firing on a PALE candle means the synthesis says engage but the underlying velocity (or stretch, or composite) is weak. The trade still has the four-factor backing, but the candle warns the move may not have follow-through. Trade smaller, scale faster.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STANDARD + DEEP = HIDDEN STRENGTH</p>
              <p className="text-sm text-gray-400 leading-relaxed">A 2/4 Standard signal firing on a TEAL_DEEP candle. The synthesis is borderline, but the candle shows peak velocity. This is the rare case where the candle catches strength the four-factor score missed. Operators with experience may engage at half size; learners should still skip.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STANDARD + PALE = THE SKIP</p>
              <p className="text-sm text-gray-400 leading-relaxed">2/4 score with a PALE candle is the most reliable skip in the framework. Both the synthesis and the candle agree the read is weak. Save the capital for setups where both agree on strength.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Strong + DEEP = apex. Strong + PALE = yellow flag. Standard + DEEP = hidden strength. Standard + PALE = clean skip. Read both in under a second.</p>
          </div>
        </motion.div>
      </section>

      {/* === S13 — Mode-to-Preset Mapping === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">13 &mdash; Mode-to-Preset Mapping</p>
          <h2 className="text-2xl font-extrabold mb-4">Each preset paints by what its archetype needs to see</h2>
          <p className="text-gray-400 leading-relaxed mb-6">When you activate a preset, CIPHER also activates a candle mode. The mapping is deliberate &mdash; each preset selects the mode that matches its trader archetype&apos;s primary read. Trend Trader paints by velocity. Reversal paints by stretch. Scalper paints by everything. The preset is a complete configuration; the candle mode is part of that configuration.</p>
          <PresetWheelAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">The five active presets cycle. Trend Trader runs Trend (Standard, longer sessions). Scalper runs Composite Bold (vivid contrast for fast decisions). Swing Trader runs Trend Bold (high-stakes evaluations need contrast). Reversal runs Tension (Standard, slow stretch development). Sniper runs Default (the squeeze indicator does the work, candles do not add).</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">TREND TRADER &rarr; TREND</p>
              <p className="text-sm text-gray-400 leading-relaxed">Trend Trader catches sustained moves. The Trend candle mode paints by Velocity, which is exactly what trend traders need to see. Standard intensity because trend trades evaluate over longer windows where eye fatigue matters.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SCALPER &rarr; COMPOSITE BOLD</p>
              <p className="text-sm text-gray-400 leading-relaxed">Scalpers strike from levels with maximum information per glance. Composite encodes velocity, tension, and volume into one color. Bold intensity because scalps need vivid contrast for fast decisions.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SWING TRADER &rarr; TREND BOLD</p>
              <p className="text-sm text-gray-400 leading-relaxed">Swing trades evaluate one or two setups per day, hold for days. Trend Mode paints by velocity (the dominant read). Bold intensity because each evaluation is high-stakes and visual contrast helps the trader commit to multi-day positions.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">REVERSAL &rarr; TENSION &middot; SNIPER &rarr; DEFAULT</p>
              <p className="text-sm text-gray-400 leading-relaxed">Reversal traders fade exhaustion &mdash; Tension Mode paints stretch, the literal mechanism they fade. The Sniper&apos;s edge is timing the squeeze release; the squeeze indicator does that work, not the candles. Default keeps the chart clean for squeeze focus.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">The preset chooses the mode. Switching presets repaints the chart. Run the preset as designed unless you have a specific reason to override.</p>
          </div>
        </motion.div>
      </section>

      {/* === S14 — Choosing a Mode for Your Style === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">14 &mdash; Choosing a Mode for Your Style</p>
          <h2 className="text-2xl font-extrabold mb-4">One question. Four answers. Pick once.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Operators who run None preset face the candle-mode decision directly. The decision tree is short. What does your strategy primarily need to see? Trend strength leads to Trend or Trend Bold. Stretch and exhaustion leads to Tension or Tension Bold. All three dimensions at once leads to Composite or Composite Bold. None of the above leads to Default.</p>
          <ModeRecommenderAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">The decision tree branches four ways. The wrong way to pick a mode is to try them all and stick with whichever &ldquo;feels best&rdquo; visually. Visual preference is recency bias. The correct method is to identify what your strategy needs to see, pick the corresponding mode, and commit to it for at least 20 sessions before evaluating. Over 20 sessions you will learn whether the mode actually serves your strategy.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">QUESTION &middot; WHAT DOES YOUR STRATEGY NEED TO SEE?</p>
              <p className="text-sm text-gray-400 leading-relaxed">Strategy here means the actual setup you trade. Not your aspirational style, not what feels sophisticated. Be honest. If you fade exhaustion, your strategy needs stretch. If you ride trends, your strategy needs velocity.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE 20-SESSION COMMITMENT</p>
              <p className="text-sm text-gray-400 leading-relaxed">Once you pick a mode, run it for at least 20 sessions before evaluating. Sessions 1-5 are calibration. Sessions 5-15 are pattern recognition. Sessions 15-20 are honest evaluation. Switching mid-learning resets the calibration and starts the same struggle on a different mode.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DON&apos;T MIX MODES MID-LEARNING</p>
              <p className="text-sm text-gray-400 leading-relaxed">Switching candle modes during the 20-session learning phase resets the calibration. Each mode has its own visual vocabulary; mixing them mid-learning means you never master any one of them.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DEFAULT IS A LEGITIMATE ANSWER</p>
              <p className="text-sm text-gray-400 leading-relaxed">If your strategy genuinely does not benefit from any of the three Cipher metrics, or you are backtesting visually, or your monitor cannot render the gradient cleanly &mdash; Default is the right answer. Not a fallback.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Identify what your strategy needs. Pick the matching mode. Commit for 20 sessions. Evaluate. Switch only with cause, not with curiosity.</p>
          </div>
        </motion.div>
      </section>

      {/* === S15 — Six Common Mistakes === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">15 &mdash; Six Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-4">What goes wrong when candles are misread</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The Candles Operator framework is a rendering tool, not a magic indicator. The failure modes are operator errors, not tool errors. Six recurring mistakes operators make when learning Cipher Candles. Each has a fix and the fix is more conservative than the mistake.</p>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 1 &middot; READING SHADE WITHOUT MODE</p>
              <p className="text-sm text-gray-400 leading-relaxed">The operator sees a TEAL_DEEP candle and assumes &ldquo;strong bull&rdquo; without checking which mode is active. In Trend Mode this is correct. In Tension Mode the same shade means maximally stretched bull (an exhaustion warning). <strong className="text-white">Fix:</strong> always confirm the active mode before decoding any bar. The shade is contextual.</p>
            </div>
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 2 &middot; SWITCHING MODES TO HUNT</p>
              <p className="text-sm text-gray-400 leading-relaxed">The current mode shows a chop pattern. Operator switches modes hoping for clearer signal. None of them show what they want. This is the strategy hunting for permission to trade. <strong className="text-white">Fix:</strong> when in doubt, wait. Mode-switching mid-session should be triggered by environment or context shifts, not by the absence of a setup you wanted.</p>
            </div>
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 3 &middot; READING SINGLE BARS IN ISOLATION</p>
              <p className="text-sm text-gray-400 leading-relaxed">One TEAL_DEEP bar in isolation looks like strength. The same bar at the end of a four-bar TEAL_DEEP cluster is a peak about to fade. Operators who decode single bars without reading the cluster context misjudge sustainable trends as continuations and exhaustions as breakouts. <strong className="text-white">Fix:</strong> always read the prior 5-6 bars before assigning operational meaning to the current bar.</p>
            </div>
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 4 &middot; SUBSTITUTING CANDLES FOR PANEL</p>
              <p className="text-sm text-gray-400 leading-relaxed">The candles read clean, the operator stops looking at the panel entirely. Then a structural setup (Sweep, FVG, S/R level) fires that the candles cannot encode &mdash; and the operator misses it. <strong className="text-white">Fix:</strong> candles are a faster read for momentum; the panel is the source of truth for structural context. Use both.</p>
            </div>
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 5 &middot; OVER-WEIGHTING THE CANDLE IN ALIGNMENT</p>
              <p className="text-sm text-gray-400 leading-relaxed">A 2/4 Standard signal fires on a TEAL_DEEP candle. The operator engages because the candle &ldquo;confirms&rdquo; strength. But the conviction synthesis is still 2/4. <strong className="text-white">Fix:</strong> the synthesis layer remains the engagement decision. The candle adds confidence to a Strong signal but cannot promote a Standard signal to Strong.</p>
            </div>
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 6 &middot; SKIPPING THE 20-SESSION COMMITMENT</p>
              <p className="text-sm text-gray-400 leading-relaxed">The operator picks Trend Mode, runs it for 3 sessions, decides &ldquo;the colors are confusing,&rdquo; switches to Composite, runs that for 4 sessions, switches to Tension, and so on. After 30 sessions of mode-hopping they have not mastered any mode. <strong className="text-white">Fix:</strong> pick a mode, commit for 20 sessions. The first 5-10 sessions ARE supposed to feel confusing &mdash; that is calibration. Trust the protocol.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === Cheat Sheet === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">The Cipher Candles Cheat Sheet</p>
          <h2 className="text-2xl font-extrabold mb-4">For your second monitor</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Print this. Pin it next to your L11.22 sheet. Reference both before every session.</p>
          <div className="p-6 rounded-2xl glass-card space-y-3">
            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">The 3 Metrics</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p><strong className="text-white">Velocity</strong> &mdash; directional momentum / 100-bar peak</p>
                <p><strong className="text-white">Tension</strong> &mdash; stretch from Flow / 100-bar peak stretch</p>
                <p><strong className="text-white">Composite</strong> &mdash; 0.50V + 0.30T + 0.20Vol direction</p>
              </div>
            </div>
            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">The 8-Level Gradient</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p>TEAL_DEEP &ge;80 &middot; TEAL_STD 50-80 &middot; TEAL_LIGHT 20-50 &middot; TEAL_PALE 0-20</p>
                <p>MAG_PALE &minus;20 to 0 &middot; MAG_LIGHT &minus;50 to &minus;20 &middot; MAG_STD &minus;80 to &minus;50 &middot; MAG_DEEP &lt;&minus;80</p>
              </div>
            </div>
            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">The 2 Intensities</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">Standard</strong> (fade=12, muted) for long sessions / bright monitors. <strong className="text-white">Bold</strong> (fade=0, vivid) for short sessions / dark monitors.</p>
            </div>
            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">Cluster Patterns</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p><strong className="text-white">Sustainable trend</strong> &mdash; LIGHT-STD-DEEP-STD-LIGHT-PALE</p>
                <p><strong className="text-white">Climactic top</strong> &mdash; DEEP cluster then sharp magenta flip</p>
                <p><strong className="text-white">Range chop</strong> &mdash; alternating PALE both sides</p>
                <p><strong className="text-white">Reversal building</strong> &mdash; MAG_DEEP fading to PALE then teal LIGHT</p>
              </div>
            </div>
            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">Candles + Synthesis Alignment</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p><strong className="text-white">Strong + DEEP</strong> = apex visual (size up)</p>
                <p><strong className="text-white">Strong + PALE</strong> = yellow flag (smaller, faster scale)</p>
                <p><strong className="text-white">Standard + DEEP</strong> = hidden strength (skip while learning)</p>
                <p><strong className="text-white">Standard + PALE</strong> = clean skip</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">Preset Mappings</p>
              <p className="text-sm text-gray-400 leading-relaxed">Trend Trader &rarr; Trend &middot; Scalper &rarr; Composite Bold &middot; Swing Trader &rarr; Trend Bold &middot; Reversal &rarr; Tension &middot; Sniper &rarr; Default</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S16 — Scenario Game === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">16 &mdash; Scenario Game</p>
          <h2 className="text-2xl font-extrabold mb-4">Read the Candles Like an Operator</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Five scenarios. Shade-without-mode confusion, cluster pattern recognition, apex alignment, candle flip during a live trade, and the 20-session commitment. Pick the right call. Explanations appear after every answer, including the wrong ones.</p>
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
                  <p className="text-xs text-gray-400 mt-1">{finalScore >= 4 ? 'Operator-grade candle reading installed. You see the shade, the mode, and the cluster simultaneously.' : finalScore >= 3 ? 'Solid grasp. Re-read the cluster patterns (S10), candles+synthesis alignment (S12), and the 20-session commitment (S14) before the quiz.' : 'Re-study the 3 metrics (S02), the 8-level gradient (S03), the cluster patterns (S10), and the six mistakes (S15) before the quiz.'}</p>
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
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 11.23: Cipher Candles</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-sky-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Candles Operator &mdash;</p>
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
