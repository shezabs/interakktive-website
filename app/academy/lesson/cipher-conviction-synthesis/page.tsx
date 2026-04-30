// app/academy/lesson/cipher-conviction-synthesis/page.tsx
// ATLAS Academy — Lesson 11.22: Cipher Conviction Synthesis [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 11 · CIPHER
// Built to Lesson 11.11 gold standard
// Covers: 4-factor conviction score (Ribbon x ADX x Volume x Health)
//         + 13-tag context cascade
//         + synthesis tooltip
//         + tier-based sizing
//         + skip discipline
//         + the trade plan handoff
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Crown } from 'lucide-react';

// ============================================================
// GAME ROUNDS — 5 scenario-based conviction synthesis challenges
// ============================================================
const gameRounds = [
  {
    id: 'r1',
    scenario:
      'NAS100 5m. A Pulse Cross Long signal fires. Tooltip reports: Ribbon Strong (\u2713), ADX 28 (\u2713), Volume 1.6\u00d7 (\u2713), Health 72% (\u2713). Context tag: Sweep + FVG.',
    prompt: 'What is the conviction tier and how do you size?',
    options: [
      {
        id: 'a',
        text: 'Standard tier \u2014 four factors confirmed is normal, not exceptional. Size 1.0x baseline.',
        correct: false,
        explain:
          'Wrong. 4/4 factors AND a Sweep+FVG context tag is the apex setup the framework can produce. The Sweep+FVG tag is priority-1 in the cascade \u2014 the highest-confluence context CIPHER recognises. This combination is rare; treating it as standard forfeits the asymmetric edge.',
      },
      {
        id: 'b',
        text: 'Conviction tier \u2014 4/4 plus apex context tag. Size up to 1.5x baseline within risk cap.',
        correct: true,
        explain:
          'Correct. 4/4 conviction score + apex context tag = Conviction tier. Sizing protocol allows up to 1.5x baseline within the max risk cap. This is the highest-confluence setup CIPHER produces. Take the size with confidence \u2014 the framework is broadcasting alignment across every dimension.',
      },
      {
        id: 'c',
        text: 'Skip \u2014 setups this strong are usually traps.',
        correct: false,
        explain:
          'Counter-intuitive contrarianism. The framework was built to identify high-confluence setups precisely so you can engage them with conviction. Skipping a 4/4 apex setup because "it looks too good" is the operator overriding the synthesis with a hunch \u2014 mistake six in section fifteen.',
      },
      {
        id: 'd',
        text: 'Standard tier but skip the Sweep+FVG context \u2014 too complex to verify in real-time.',
        correct: false,
        explain:
          'The synthesis tooltip already verified the context tag. The cascade ran in milliseconds; you do not re-verify it. Treating the context tag as "too complex" rather than reading the tooltip is the operator failing to use the tool the framework provides.',
      },
    ],
  },
  {
    id: 'r2',
    scenario:
      'XAUUSD 1H. A Pulse Cross Short signal fires. Tooltip reports: Ribbon Strong (\u2713), ADX 19 (\u2717 below 25), Volume 1.1\u00d7 (\u2713), Health 58% (\u2713 above 50). Context tag: Breakout (priority 4).',
    prompt: 'What is the conviction tier and the right call?',
    options: [
      {
        id: 'a',
        text: 'Standard tier \u2014 3/4 factors with a mid-priority context tag. Engage at standard size.',
        correct: true,
        explain:
          'Correct. 3/4 factors + Breakout context tag = Standard tier. This is the framework\u2019s baseline engagement signal. Size 1.0x baseline within risk cap. Standard does not mean weak \u2014 it means the framework has confirmed enough factors to engage without override.',
      },
      {
        id: 'b',
        text: 'Skip \u2014 ADX failure means trend conditions are absent.',
        correct: false,
        explain:
          'ADX 19 is below the 25 threshold but the other three factors are confirmed. The 3/4 score is the Standard tier threshold by design. Skipping at 3/4 means the operator has set their personal threshold higher than the framework\u2019s \u2014 acceptable as a conservatism choice but not framework-mandated.',
      },
      {
        id: 'c',
        text: 'Conviction tier \u2014 Breakout context promotes any 3/4 to Conviction.',
        correct: false,
        explain:
          'Wrong. Only the apex context tags (Sweep+FVG, Sweep) promote to Conviction tier. Breakout is priority 4 in the cascade \u2014 mid-priority, qualifies a Standard engagement but does not promote the tier.',
      },
      {
        id: 'd',
        text: 'Standard tier but reduce size 50% because of ADX failure.',
        correct: false,
        explain:
          'The 3/4 score already accounts for the ADX failure. Reducing size further is the operator double-counting the ADX miss \u2014 once via the score, again via discretion. The framework prices the missing factor into the tier; let it.',
      },
    ],
  },
  {
    id: 'r3',
    scenario:
      'GBPUSD 15m. A Pulse Cross Long signal fires. Tooltip: Ribbon Strong (\u2713), ADX 22 (\u2717), Volume 0.8\u00d7 (\u2717), Health 45% (\u2717 below 50). Context tag: Range (priority 11, low confluence).',
    prompt: 'What does the synthesis call for?',
    options: [
      {
        id: 'a',
        text: 'Watch tier \u2014 1/4 factors plus low-priority context. Note the setup but do not engage.',
        correct: true,
        explain:
          'Correct. 1/4 factors + low-priority context = Watch tier. The synthesis is broadcasting "the signal fired but the supporting factors are absent." The right action is to log the setup in the journal as observation \u2014 not engagement. Watch tier exists precisely so operators do not reflexively trade every signal that fires.',
      },
      {
        id: 'b',
        text: 'Standard tier \u2014 the signal fired, that is sufficient.',
        correct: false,
        explain:
          'A signal firing is not engagement permission. The 4-factor synthesis exists because raw signals fire too often for blind engagement. 1/4 factors fails the Standard tier threshold (which requires 3/4). The framework is explicit: do not engage at Watch tier.',
      },
      {
        id: 'c',
        text: 'Skip but compensate by taking the next 4/4 setup at 2x size.',
        correct: false,
        explain:
          'Compensation sizing across separate setups breaks the per-trade risk discipline. Each setup gets sized on its own merits, not on a "make-up for skipped trades" basis. This is the gambler\u2019s fallacy in trading form.',
      },
      {
        id: 'd',
        text: 'Engage but with the SL at the structural minimum to limit damage.',
        correct: false,
        explain:
          'Tightening the SL to compensate for low conviction is engaging while pretending you are not. Watch tier means do not engage. Tight stops on weak setups produce frequent stop-outs without the asymmetric upside to compensate \u2014 the worst combination.',
      },
    ],
  },
  {
    id: 'r4',
    scenario:
      'You have just engaged a 4/4 Conviction tier trade on EURUSD 5m at 1.0850 long. The L11.22 trade plan calls for SL at 1.0832 (Risk Map Auto), TP1 at 1R, TP2 at 2R, TP3 at 3R, scaling 50/30/20, BE move at TP1.',
    prompt: 'Price hits TP1 at 1.0868. What do you do?',
    options: [
      {
        id: 'a',
        text: 'Take 50% off and move SL to BE. Trail the rest per plan.',
        correct: true,
        explain:
          'Correct. The L11.22 trade plan is paint-by-numbers. TP1 hit = 50% off, SL to BE. The remaining 50% (30 + 20) trails for TP2 and TP3. The plan was written before the trade so emotional state during the trade does not override execution.',
      },
      {
        id: 'b',
        text: 'Hold all of it \u2014 a 4/4 Conviction setup deserves a full hold for TP3.',
        correct: false,
        explain:
          'Conviction tier sizing is set at entry, not modified at exit. 1.5x baseline at entry already reflects the conviction. Holding 100% to TP3 abandons the staged exit that protects against reversal, and gives back the asymmetric advantage the partial exits provide.',
      },
      {
        id: 'c',
        text: 'Take 100% off \u2014 a winner is a winner.',
        correct: false,
        explain:
          'Premature exit forfeits the framework\u2019s positive expectancy. The 50/30/20 staging is calculated to capture trend extension while protecting against reversal. Exiting fully at TP1 turns a designed asymmetric trade into a flat 1R win.',
      },
      {
        id: 'd',
        text: 'Take 30% off and widen the SL to give the trade room.',
        correct: false,
        explain:
          'Two protocol violations: wrong scale-out percentage and SL widening. Widening the SL after entry is the cardinal mistake of trade management \u2014 it converts a defined-risk trade into an undefined-risk trade. Plan-driven scaling and BE moves are the discipline.',
      },
    ],
  },
  {
    id: 'r5',
    scenario:
      'You have logged 8 trades this session: 2 Conviction tier (1 winner +2.4R, 1 loser -1.0R), 4 Standard tier (2 winners totaling +2.6R, 2 losers totaling -2.0R), 2 Watch tier "engaged anyway" (both losers, -2.0R total). Net session: +0.0R.',
    prompt: 'What does the journal review tell you?',
    options: [
      {
        id: 'a',
        text: 'Even session \u2014 wash, move on.',
        correct: false,
        explain:
          'The headline P&L hides the protocol violation. Excluding the two Watch-tier engagements (which the framework explicitly forbids), session P&L is +2.0R, not 0R. The two Watch trades cost you 2R and added zero edge. The journal is showing you which discipline failure cost the session.',
      },
      {
        id: 'b',
        text: 'Watch-tier engagements cost 2R \u2014 protocol violation, journal it as the lesson.',
        correct: true,
        explain:
          'Correct. Conviction (1.4R net) + Standard (0.6R net) = +2.0R legitimate edge. The two Watch trades dragged net to flat. The journal entry should explicitly flag "engaged at Watch tier x2" as the lesson. Tomorrow\u2019s adjustment: skip Watch tier without exception until the discipline holds for 20 sessions.',
      },
      {
        id: 'c',
        text: 'Cut all sizing in half tomorrow \u2014 the win rate is too low.',
        correct: false,
        explain:
          'Reactive sizing changes mistake protocol failure for tier sizing failure. The Conviction and Standard tiers performed at expectancy; the Watch tier engagements were the leak. The fix is discipline (skip Watch), not sizing (which would only reduce already-correct R-multiples).',
      },
      {
        id: 'd',
        text: 'Take more Conviction setups tomorrow to compensate.',
        correct: false,
        explain:
          '"Force more Conviction setups" is not a real adjustment \u2014 you take what the market provides. The lesson is to NOT take Watch tier, not to take more of something else. Setting an aspirational quota for Conviction trades creates pressure that distorts the synthesis read on borderline setups.',
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
    question: 'What are the four factors in the conviction synthesis score?',
    options: [
      { id: 'a', text: 'Trend / Momentum / Volume / Volatility', correct: false },
      { id: 'b', text: 'Ribbon / ADX / Volume / Health', correct: true },
      { id: 'c', text: 'Pulse / Flow / Tension / Velocity', correct: false },
      { id: 'd', text: 'Setup / Entry / Stop / Target', correct: false },
    ],
    explain:
      'The four factors are Ribbon (trend strength), ADX (trend conviction \u2265 25), Volume (relative ratio \u2265 1.0), and Health (CIPHER\u2019s composite health score \u2265 50). Each contributes one point to the 0-4 conviction score. The factors are orthogonal by design \u2014 a Strong signal needs alignment across all four dimensions, not redundant signals.',
  },
  {
    id: 'q2',
    question: 'How many context tags are in the priority cascade?',
    options: [
      { id: 'a', text: '5', correct: false },
      { id: 'b', text: '8', correct: false },
      { id: 'c', text: '13', correct: true },
      { id: 'd', text: '21', correct: false },
    ],
    explain:
      'The cascade has 13 tags ranked by confluence. Priority 1: Sweep + FVG (apex). Priority 2: Sweep. Priorities 3-5: Breakout, S/R, Trend. Priorities 6-9: Structural alignments. Priorities 10-13: Lower-confluence contexts (Range, Chop, Counter-trend, etc.). The first matching tag wins \u2014 the cascade fires the highest-priority valid tag and stops.',
  },
  {
    id: 'q3',
    question: 'What conviction score qualifies for the Conviction tier (highest sizing)?',
    options: [
      { id: 'a', text: '2/4 with any context tag', correct: false },
      { id: 'b', text: '3/4 with apex context tag', correct: false },
      { id: 'c', text: '4/4 with apex context tag (Sweep+FVG or Sweep)', correct: true },
      { id: 'd', text: '4/4 with any context tag', correct: false },
    ],
    explain:
      'Conviction tier requires both: 4/4 factors AND an apex context tag (Sweep+FVG or Sweep). 4/4 alone with a mid-priority tag stays at Standard tier. The combined gating exists because the apex context tags are statistically rare, and pairing them with full factor confluence is the highest-edge setup the framework identifies.',
  },
  {
    id: 'q4',
    question: 'What is the sizing rule for the Standard tier?',
    options: [
      { id: 'a', text: '0.5x baseline', correct: false },
      { id: 'b', text: '1.0x baseline within max risk cap', correct: true },
      { id: 'c', text: '1.5x baseline within max risk cap', correct: false },
      { id: 'd', text: '2.0x baseline', correct: false },
    ],
    explain:
      'Standard tier sizes at 1.0x baseline within the max risk cap. Standard is the framework\u2019s default engagement size. Conviction tier scales to 1.5x within cap. Watch tier is no engagement (size 0). The cap exists so even Conviction tier never exceeds the per-trade risk limit set in the trade plan.',
  },
  {
    id: 'q5',
    question: 'What is the framework\u2019s rule on Watch tier setups?',
    options: [
      { id: 'a', text: 'Engage at half size to test the setup.', correct: false },
      { id: 'b', text: 'Engage at standard size with tight stop.', correct: false },
      { id: 'c', text: 'Do not engage. Log in journal as observation only.', correct: true },
      { id: 'd', text: 'Engage if the chart "looks right" to override the framework.', correct: false },
    ],
    explain:
      'Watch tier is do-not-engage. The synthesis is reporting that the supporting factors are absent. Engaging anyway \u2014 even at reduced size or with tight stops \u2014 is the discipline failure that section fifteen documents. Journal the setup as observation; the data accumulates and informs future framework refinements.',
  },
  {
    id: 'q6',
    question: 'In the L11.22 trade plan, what is the BE-move trigger?',
    options: [
      { id: 'a', text: 'When price moves 1R in your favor', correct: false },
      { id: 'b', text: 'When TP1 is hit', correct: true },
      { id: 'c', text: 'After 30 minutes regardless of price', correct: false },
      { id: 'd', text: 'When the candle closes against you', correct: false },
    ],
    explain:
      'BE move at TP1. The TP1 hit is the framework\u2019s confirmation that the trade is working. Moving SL to BE at TP1 protects the entry capital while the remaining 50% (30+20) trails for TP2 and TP3. Other BE triggers (time-based, candle-based) are operator overrides, not framework rules.',
  },
  {
    id: 'q7',
    question: 'What is the canonical scaling structure in the trade plan?',
    options: [
      { id: 'a', text: '100% at first target', correct: false },
      { id: 'b', text: '50/50 at TP1 and TP2', correct: false },
      { id: 'c', text: '50/30/20 at TP1/TP2/TP3 (1R/2R/3R)', correct: true },
      { id: 'd', text: '33/33/34 evenly distributed', correct: false },
    ],
    explain:
      'The canonical scaling is 50% off at TP1 (1R), 30% off at TP2 (2R), 20% trails for TP3 (3R) or extension. Front-loaded scaling protects the trade while leaving meaningful exposure to capture trend extension. The 50/30/20 ratio is calibrated for the framework\u2019s observed win-rate and average R-multiple.',
  },
  {
    id: 'q8',
    question: 'When the synthesis tooltip and your discretionary read disagree, what does the framework prescribe?',
    options: [
      { id: 'a', text: 'Override the synthesis \u2014 your eyes know better.', correct: false },
      { id: 'b', text: 'Engage at half size as a compromise.', correct: false },
      { id: 'c', text: 'Honor the synthesis. The four-factor + cascade gating is more reliable than discretion under load.', correct: true },
      { id: 'd', text: 'Wait for the next signal and skip this one regardless.', correct: false },
    ],
    explain:
      'Honor the synthesis. The four-factor score and cascade exist precisely because operator discretion fails under load. The synthesis is mechanical, fast, and consistent; discretion is biased, slow, and inconsistent. Operators who routinely override the synthesis end up with worse results than those who follow it mechanically.',
  },
];
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
// Theme: conviction synthesis, 4-factor radar, cascade, tier sizing
// ============================================================

// A1 — FourFactorHeroAnim (S01) — 4 factor pillars filling
function FourFactorHeroAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 9.0;
    const tt = (t % T) / T;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE 4-FACTOR CONVICTION SCORE', w / 2, 22);
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.fillText('Ribbon \u00d7 ADX \u00d7 Volume \u00d7 Health', w / 2, 38);
    const factors = [
      { name: 'RIBBON', sub: 'Strong', value: 1, color: '#26A69A' },
      { name: 'ADX', sub: '28 \u2265 25', value: 1, color: '#FFB300' },
      { name: 'VOLUME', sub: '1.6\u00d7', value: 1, color: '#EF5350' },
      { name: 'HEALTH', sub: '72%', value: 1, color: 'rgba(155, 220, 255, 0.9)' },
    ];
    const colW = (w - 60) / 4;
    const startX = 30;
    const colTop = 56;
    const colH = h - 110;
    factors.forEach((f, i) => {
      const arriveStart = i * 0.13;
      const reveal = Math.min(1, Math.max(0, (tt - arriveStart) / 0.15));
      if (reveal <= 0) return;
      const x = startX + i * colW + 4;
      const cw = colW - 8;
      ctx.globalAlpha = reveal;
      ctx.fillStyle = `${f.color}10`;
      ctx.fillRect(x, colTop, cw, colH);
      ctx.strokeStyle = f.color;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, colTop, cw, colH);
      ctx.fillStyle = f.color;
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(f.name, x + cw / 2, colTop + 18);
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '9px system-ui, -apple-system, sans-serif';
      ctx.fillText(f.sub, x + cw / 2, colTop + 32);
      // Big checkmark fade in
      const checkFade = Math.min(1, Math.max(0, (reveal - 0.3) / 0.40));
      ctx.fillStyle = `rgba(38, 166, 154, ${checkFade})`;
      ctx.font = 'bold 38px system-ui, -apple-system, sans-serif';
      ctx.fillText('\u2713', x + cw / 2, colTop + colH / 2 + 14);
      ctx.globalAlpha = 1;
    });
    if (tt > 0.78) {
      const fade = Math.min(1, (tt - 0.78) / 0.12);
      ctx.fillStyle = `rgba(255, 179, 0, ${fade})`;
      ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('\u2192 SCORE: 4 / 4 \u2014 STRONG', w / 2, h - 14);
    }
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// A2 — RibbonFactorAnim (S02) — ribbon strength visualization
function RibbonFactorAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 10.0;
    const tt = (t % T) / T;
    const states = [
      { name: 'STRONG', score: 1, color: '#26A69A', spread: 22 },
      { name: 'WEAK', score: 0, color: '#EF5350', spread: 4 },
    ];
    const idx = Math.floor(tt * 2);
    const state = states[idx];
    const localT = (tt * 2) % 1;
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('RIBBON FACTOR', w / 2, 18);
    ctx.fillStyle = state.color;
    ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
    ctx.fillText(state.name, w / 2, 38);
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.fillText(state.score === 1 ? 'EMAs spread, aligned, trending' : 'EMAs converged, choppy, no edge', w / 2, 54);
    // Draw 8 ribbon EMAs
    const cArea = { x: 30, y: 70, w: w - 60, h: h - 130 };
    const reveal = Math.min(1, localT * 1.5);
    for (let line = 0; line < 8; line++) {
      const lineSpread = (line - 3.5) * state.spread / 8;
      ctx.strokeStyle = state.color;
      ctx.globalAlpha = 0.4 + (line / 8) * 0.5;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      const nPoints = 40;
      for (let i = 0; i < Math.floor(nPoints * reveal); i++) {
        const px = cArea.x + (i / (nPoints - 1)) * cArea.w;
        const noise = Math.sin(i * 0.4 + line * 0.6) * (state.score === 1 ? 1.5 : 6);
        const trend = state.score === 1 ? -i * 0.5 : Math.sin(i * 0.2) * 4;
        const py = cArea.y + cArea.h / 2 + lineSpread + trend + noise;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    if (localT > 0.65) {
      const fade = Math.min(1, (localT - 0.65) / 0.20);
      const ry = h - 36;
      ctx.fillStyle = `${state.color}20`;
      ctx.fillRect(0, ry, w, 26);
      ctx.fillStyle = state.color;
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Score: ${state.score === 1 ? '\u2713 +1' : '\u2717 0'}`, w / 2, ry + 17);
    }
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// A3 — ADXFactorAnim (S03) — ADX dial above/below 25
function ADXFactorAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 11.0;
    const tt = (t % T) / T;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ADX FACTOR \u2014 THRESHOLD 25', w / 2, 22);
    // ADX value sweeps
    const adxValue = 12 + Math.abs(Math.sin(tt * Math.PI * 2)) * 35;
    const passes = adxValue >= 25;
    const cx = w / 2;
    const cy = h * 0.55;
    const radius = Math.min(w, h) * 0.32;
    // Dial arc
    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, Math.PI * 0.85, Math.PI * 0.15);
    ctx.stroke();
    // Filled arc
    const adxNorm = Math.min(1, adxValue / 50);
    const startAngle = Math.PI * 0.85;
    const endAngle = startAngle + adxNorm * (Math.PI * 1.30);
    ctx.strokeStyle = passes ? '#26A69A' : '#EF5350';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.stroke();
    // Threshold marker at 25
    const thresholdAngle = Math.PI * 0.85 + (25 / 50) * (Math.PI * 1.30);
    const tmx1 = cx + Math.cos(thresholdAngle) * (radius - 18);
    const tmy1 = cy + Math.sin(thresholdAngle) * (radius - 18);
    const tmx2 = cx + Math.cos(thresholdAngle) * (radius + 18);
    const tmy2 = cy + Math.sin(thresholdAngle) * (radius + 18);
    ctx.strokeStyle = '#FFB300';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(tmx1, tmy1);
    ctx.lineTo(tmx2, tmy2);
    ctx.stroke();
    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('25', tmx2 + 8, tmy2 - 4);
    // Center text
    ctx.fillStyle = passes ? '#26A69A' : '#EF5350';
    ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
    ctx.fillText(`${Math.round(adxValue)}`, cx, cy + 4);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
    ctx.fillText('ADX', cx, cy + 24);
    // Pass/fail badge
    ctx.fillStyle = passes ? '#26A69A' : '#EF5350';
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    ctx.fillText(passes ? '\u2713 +1' : '\u2717 0', cx, cy + 50);
    // Caption
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.fillText('ADX < 25: trend conviction absent. ADX \u2265 25: trend has commitment.', w / 2, h - 12);
  }, []);
  return <AnimScene draw={draw} aspectRatio={4 / 3} />;
}

// A4 — VolumeFactorAnim (S04) — volume bars vs threshold
function VolumeFactorAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 10.0;
    const tt = (t % T) / T;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VOLUME FACTOR \u2014 RATIO \u2265 1.0\u00d7', w / 2, 22);
    // 12 volume bars, last 3 progressively heavy
    const cArea = { x: 30, y: 56, w: w - 60, h: h - 100 };
    const ratios = [0.8, 0.9, 0.7, 1.0, 0.85, 0.95, 0.75, 1.05, 0.9, 1.1, 1.4, 1.6];
    const nBars = ratios.length;
    const cwBar = cArea.w / nBars;
    const reveal = Math.min(1, tt * 1.4);
    const visCount = Math.floor(nBars * reveal);
    // Threshold line
    const thresholdY = cArea.y + cArea.h - (1.0 / 2.0) * cArea.h;
    ctx.strokeStyle = 'rgba(255, 179, 0, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(cArea.x, thresholdY);
    ctx.lineTo(cArea.x + cArea.w, thresholdY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255, 179, 0, 0.7)';
    ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('1.0\u00d7 threshold', cArea.x + 6, thresholdY - 6);
    // Bars
    for (let i = 0; i < visCount; i++) {
      const ratio = ratios[i];
      const bx = cArea.x + i * cwBar + cwBar * 0.15;
      const bw = cwBar * 0.7;
      const bh = (ratio / 2.0) * cArea.h;
      const by = cArea.y + cArea.h - bh;
      const passes = ratio >= 1.0;
      ctx.fillStyle = passes ? '#26A69A' : 'rgba(239, 83, 80, 0.7)';
      ctx.fillRect(bx, by, bw, bh);
    }
    // Latest bar number
    if (visCount > 0) {
      const last = ratios[Math.min(nBars - 1, visCount - 1)];
      const passes = last >= 1.0;
      ctx.fillStyle = passes ? '#26A69A' : '#EF5350';
      ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${last.toFixed(2)}\u00d7`, cArea.x + cArea.w - 4, cArea.y + 14);
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.fillText(passes ? '\u2713 +1' : '\u2717 0', cArea.x + cArea.w - 4, cArea.y + 30);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Volume relative to 20-bar avg. Below 1.0 = anaemic move.', w / 2, h - 12);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// A5 — HealthFactorAnim (S05) — health gauge sweeping
function HealthFactorAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 11.0;
    const tt = (t % T) / T;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('HEALTH FACTOR \u2014 THRESHOLD 50%', w / 2, 22);
    const healthValue = 25 + Math.abs(Math.sin(tt * Math.PI * 2)) * 60;
    const passes = healthValue >= 50;
    // Horizontal gauge
    const gx = 40;
    const gy = h * 0.35;
    const gw = w - 80;
    const gh = 30;
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(gx, gy, gw, gh);
    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.strokeRect(gx, gy, gw, gh);
    // Threshold marker
    const tX = gx + (50 / 100) * gw;
    ctx.strokeStyle = '#FFB300';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(tX, gy - 6);
    ctx.lineTo(tX, gy + gh + 6);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('50%', tX, gy - 10);
    // Filled portion
    const fillW = (healthValue / 100) * gw;
    ctx.fillStyle = passes ? '#26A69A' : '#EF5350';
    ctx.fillRect(gx, gy, fillW, gh);
    // Big value
    ctx.fillStyle = passes ? '#26A69A' : '#EF5350';
    ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(healthValue)}%`, w / 2, gy + gh + 50);
    // Pass/fail badge
    ctx.fillStyle = passes ? '#26A69A' : '#EF5350';
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    ctx.fillText(passes ? '\u2713 +1' : '\u2717 0', w / 2, gy + gh + 72);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.fillText('CIPHER\u2019s composite health \u2014 a chart-wide quality gate.', w / 2, h - 12);
  }, []);
  return <AnimScene draw={draw} aspectRatio={4 / 3} />;
}

// A6 — ScoreCompositionAnim (S06) — 4 factors stack into score 0-4
function ScoreCompositionAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 12.0;
    const tt = (t % T) / T;
    const examples = [
      { name: '4/4 STRONG', factors: [1, 1, 1, 1], tier: 'CONVICTION', tierColor: '#26A69A' },
      { name: '3/4 STANDARD', factors: [1, 0, 1, 1], tier: 'STANDARD', tierColor: '#FFB300' },
      { name: '1/4 WATCH', factors: [1, 0, 0, 0], tier: 'WATCH', tierColor: 'rgba(255,255,255,0.6)' },
    ];
    const idx = Math.floor(tt * 3);
    const ex = examples[idx];
    const localT = (tt * 3) % 1;
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SCORE COMPOSITION', w / 2, 18);
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.fillText(ex.name, w / 2, 38);
    const labels = ['RIBBON', 'ADX', 'VOLUME', 'HEALTH'];
    const colW = (w - 60) / 4;
    const startX = 30;
    const colTop = 60;
    const colH = h - 130;
    const score = ex.factors.reduce((a, b) => a + b, 0);
    ex.factors.forEach((val, i) => {
      const arriveStart = i * 0.10;
      const reveal = Math.min(1, Math.max(0, (localT - arriveStart) / 0.13));
      if (reveal <= 0) return;
      const x = startX + i * colW + 4;
      const cw = colW - 8;
      ctx.globalAlpha = reveal;
      const passColor = '#26A69A';
      const failColor = '#EF5350';
      const c = val === 1 ? passColor : failColor;
      ctx.fillStyle = `${c}10`;
      ctx.fillRect(x, colTop, cw, colH);
      ctx.strokeStyle = c;
      ctx.lineWidth = 1.2;
      ctx.strokeRect(x, colTop, cw, colH);
      ctx.fillStyle = c;
      ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(labels[i], x + cw / 2, colTop + 14);
      ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
      ctx.fillText(val === 1 ? '\u2713' : '\u2717', x + cw / 2, colTop + colH / 2 + 8);
      ctx.globalAlpha = 1;
    });
    if (localT > 0.55) {
      const fade = Math.min(1, (localT - 0.55) / 0.20);
      const ry = h - 40;
      ctx.fillStyle = `${ex.tierColor.startsWith('rgba') ? ex.tierColor : ex.tierColor + '20'}`;
      ctx.fillRect(0, ry, w, 30);
      ctx.fillStyle = ex.tierColor;
      ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`SCORE ${score}/4 \u2192 ${ex.tier} TIER`, w / 2, ry + 19);
    }
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// A7 — ContextCascadeAnim (S07) — 13 tags, cascade resolves to one
function ContextCascadeAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 12.0;
    const tt = (t % T) / T;
    const tags = [
      'Sweep + FVG', 'Sweep', 'Breakout', 'S/R', 'Trend',
      'OB align', 'Imbalance', 'Volume confirm', 'Structure shift',
      'Range', 'Chop', 'Counter-trend', 'No context',
    ];
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE 13-TAG PRIORITY CASCADE', w / 2, 22);
    const startY = 44;
    const rowH = (h - 66) / 13;
    // Cascade scans top down
    const scanIdx = Math.floor(tt * 13);
    const winnerIdx = Math.min(13, scanIdx);
    tags.forEach((tag, i) => {
      const reveal = Math.min(1, Math.max(0, (tt - i * 0.04) / 0.06));
      if (reveal <= 0) return;
      const y = startY + i * rowH;
      const isWinner = i === Math.min(0, scanIdx) || (tt > 0.85 && i === 0);
      const isScanning = i === scanIdx && tt < 0.85;
      ctx.globalAlpha = reveal;
      // Priority badge
      const isApex = i < 2;
      const isMid = i >= 2 && i < 9;
      const tierColor = isApex ? '#26A69A' : (isMid ? '#FFB300' : 'rgba(255,255,255,0.4)');
      ctx.fillStyle = `${tierColor}15`;
      ctx.fillRect(20, y, w - 40, rowH - 2);
      ctx.strokeStyle = isScanning ? '#FFB300' : `${tierColor}50`;
      ctx.lineWidth = isScanning ? 2 : 1;
      ctx.strokeRect(20, y, w - 40, rowH - 2);
      // Priority number
      ctx.fillStyle = tierColor;
      ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`P${i + 1}`, 30, y + rowH / 2 + 3);
      // Tag name
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = '10px system-ui, -apple-system, sans-serif';
      ctx.fillText(tag, 64, y + rowH / 2 + 3);
      // Winner badge for P1 at end
      if (tt > 0.85 && i === 0) {
        const fade = Math.min(1, (tt - 0.85) / 0.10);
        ctx.fillStyle = `rgba(38, 166, 154, ${fade})`;
        ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('\u2192 FIRST MATCH WINS', w - 30, y + rowH / 2 + 3);
      }
      ctx.globalAlpha = 1;
    });
  }, []);
  return <AnimScene draw={draw} aspectRatio={4 / 3} />;
}

// A8 — TooltipDecodeAnim (S08) — synthesis tooltip rendering
function TooltipDecodeAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 10.0;
    const tt = (t % T) / T;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE SYNTHESIS TOOLTIP', w / 2, 22);
    // Mock chart on left, tooltip on right
    const chartX = 30;
    const chartY = 50;
    const chartW = w * 0.45;
    const chartH = h - 90;
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(chartX, chartY, chartW, chartH);
    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.strokeRect(chartX, chartY, chartW, chartH);
    // Mini candle sequence rising
    const nC = 10;
    const cwBar = chartW / nC;
    for (let i = 0; i < nC; i++) {
      const cxBar = chartX + i * cwBar + cwBar / 2;
      const trend = chartY + chartH * (0.85 - (i / nC) * 0.5);
      const bodyH = 12 + Math.abs(Math.sin(i * 0.7)) * 16;
      ctx.fillStyle = '#26A69A';
      ctx.fillRect(cxBar - cwBar * 0.3, trend - bodyH / 2, cwBar * 0.6, bodyH);
    }
    // Signal label
    if (tt > 0.20) {
      const labelFade = Math.min(1, (tt - 0.20) / 0.15);
      ctx.globalAlpha = labelFade;
      const sigX = chartX + chartW * 0.7;
      const sigY = chartY + chartH * 0.4;
      ctx.fillStyle = '#26A69A';
      ctx.fillRect(sigX - 24, sigY, 48, 18);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Long +', sigX, sigY + 13);
      ctx.globalAlpha = 1;
    }
    // Tooltip on right
    if (tt > 0.40) {
      const ttFade = Math.min(1, (tt - 0.40) / 0.20);
      const ttX = chartX + chartW + 20;
      const ttY = chartY + 10;
      const ttW = w - ttX - 20;
      const ttH = chartH - 20;
      ctx.fillStyle = `rgba(15,15,15,${0.95 * ttFade})`;
      ctx.fillRect(ttX, ttY, ttW, ttH);
      ctx.strokeStyle = `rgba(38, 166, 154, ${0.4 * ttFade})`;
      ctx.lineWidth = 1;
      ctx.strokeRect(ttX, ttY, ttW, ttH);
      ctx.globalAlpha = ttFade;
      const lines = [
        { text: 'Pulse Cross Long', color: 'rgba(255,255,255,0.95)', bold: true, big: true },
        { text: '', color: '' },
        { text: 'Ribbon: STRONG \u2713', color: '#26A69A' },
        { text: 'ADX: 28 \u2713', color: '#26A69A' },
        { text: 'Volume: 1.6\u00d7 \u2713', color: '#26A69A' },
        { text: 'Health: 72% \u2713', color: '#26A69A' },
        { text: '', color: '' },
        { text: 'Context: Sweep + FVG', color: '#FFB300', bold: true },
        { text: '', color: '' },
        { text: '\u2192 4/4 CONVICTION', color: '#26A69A', bold: true, big: true },
      ];
      const lh = 14;
      let yCursor = ttY + 16;
      lines.forEach((ln) => {
        if (!ln.text) {
          yCursor += 6;
          return;
        }
        ctx.fillStyle = ln.color;
        ctx.font = `${ln.bold ? 'bold ' : ''}${ln.big ? 11 : 10}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'left';
        ctx.fillText(ln.text, ttX + 12, yCursor);
        yCursor += lh;
      });
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('All four factors. The cascade winner. The tier. One read.', w / 2, h - 12);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// A9 — TierLadderAnim (S09) — 3 tiers cycling with sizing
function TierLadderAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 12.0;
    const tt = (t % T) / T;
    const tiers = [
      { name: 'CONVICTION', score: '4/4 + apex', size: '1.5\u00d7', color: '#26A69A', stepRise: 3 },
      { name: 'STANDARD', score: '3/4', size: '1.0\u00d7', color: '#FFB300', stepRise: 2 },
      { name: 'WATCH', score: '\u2264 2/4', size: '0\u00d7', color: 'rgba(239, 83, 80, 0.7)', stepRise: 1 },
    ];
    const idx = Math.floor(tt * 3);
    const localT = (tt * 3) % 1;
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE TIER LADDER', w / 2, 18);
    const stairBase = h - 40;
    const stepW = (w - 80) / 3;
    const stepH = 38;
    tiers.slice().reverse().forEach((tier, revI) => {
      const i = 2 - revI;
      const reveal = Math.min(1, Math.max(0, (localT - i * 0.10) / 0.18));
      if (reveal <= 0) return;
      const isActive = i === idx;
      const x = 40 + i * stepW;
      const yBot = stairBase;
      const yTop = stairBase - tier.stepRise * stepH;
      ctx.globalAlpha = reveal;
      const c = tier.color;
      const baseAlpha = isActive ? 0.30 : 0.10;
      ctx.fillStyle = c.startsWith('rgba') ? c.replace(/[\d.]+\)$/, `${baseAlpha})`) : `${c}${Math.round(baseAlpha * 255).toString(16).padStart(2, '0')}`;
      ctx.fillRect(x, yTop, stepW, yBot - yTop);
      ctx.strokeStyle = c;
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.strokeRect(x, yTop, stepW, yBot - yTop);
      ctx.fillStyle = c;
      ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(tier.name, x + stepW / 2, yTop + 20);
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '9px system-ui, -apple-system, sans-serif';
      ctx.fillText(tier.score, x + stepW / 2, yTop + 36);
      // Big sizing
      ctx.fillStyle = c;
      ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
      ctx.fillText(tier.size, x + stepW / 2, yTop + 64);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '8px system-ui, -apple-system, sans-serif';
      ctx.fillText('baseline', x + stepW / 2, yTop + 78);
      ctx.globalAlpha = 1;
    });
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Tier determines size. Size never moves mid-trade.', w / 2, 36);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// A10 — RiskMapAnim (S10) — entry, SL, TP1/2/3 with R-multiples
function RiskMapAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 10.0;
    const tt = (t % T) / T;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE RISK MAP \u2014 ENTRY, SL, TP1/2/3', w / 2, 22);
    const chartX = 40;
    const chartY = 56;
    const chartW = w - 80;
    const chartH = h - 100;
    // Grid
    const entryY = chartY + chartH * 0.62;
    const slY = chartY + chartH * 0.85;
    const tp1Y = chartY + chartH * 0.45;
    const tp2Y = chartY + chartH * 0.28;
    const tp3Y = chartY + chartH * 0.11;
    const lines = [
      { y: tp3Y, label: 'TP3 (3R)', color: '#26A69A', portion: '20%', revealAt: 0.50 },
      { y: tp2Y, label: 'TP2 (2R)', color: '#26A69A', portion: '30%', revealAt: 0.40 },
      { y: tp1Y, label: 'TP1 (1R)', color: '#26A69A', portion: '50%', revealAt: 0.30 },
      { y: entryY, label: 'ENTRY', color: '#FFB300', portion: '', revealAt: 0.0 },
      { y: slY, label: 'SL (Risk Map Auto)', color: '#EF5350', portion: '', revealAt: 0.15 },
    ];
    lines.forEach((ln) => {
      const reveal = Math.min(1, Math.max(0, (tt - ln.revealAt) / 0.10));
      if (reveal <= 0) return;
      ctx.globalAlpha = reveal;
      ctx.strokeStyle = ln.color;
      ctx.lineWidth = ln.label === 'ENTRY' ? 2 : 1.4;
      ctx.setLineDash(ln.label === 'ENTRY' ? [] : [4, 3]);
      ctx.beginPath();
      ctx.moveTo(chartX, ln.y);
      ctx.lineTo(chartX + chartW, ln.y);
      ctx.stroke();
      ctx.setLineDash([]);
      // Label on right
      ctx.fillStyle = ln.color;
      ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(ln.label, chartX + chartW - 6, ln.y - 4);
      // Portion on left
      if (ln.portion) {
        ctx.fillStyle = ln.color;
        ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(ln.portion, chartX + 8, ln.y - 4);
      }
      ctx.globalAlpha = 1;
    });
    // Risk zone shading
    if (tt > 0.20) {
      const fade = Math.min(1, (tt - 0.20) / 0.15);
      ctx.fillStyle = `rgba(239, 83, 80, ${0.10 * fade})`;
      ctx.fillRect(chartX, entryY, chartW, slY - entryY);
    }
    // Reward zone shading
    if (tt > 0.55) {
      const fade = Math.min(1, (tt - 0.55) / 0.15);
      ctx.fillStyle = `rgba(38, 166, 154, ${0.08 * fade})`;
      ctx.fillRect(chartX, tp3Y, chartW, entryY - tp3Y);
    }
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// A11 — BEMoveAnim (S11) — TP1 hit, SL slides up to entry
function BEMoveAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 10.0;
    const tt = (t % T) / T;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TP1 HIT \u2192 SL TO BE \u2192 TRAIL THE REST', w / 2, 22);
    const chartX = 40;
    const chartY = 56;
    const chartW = w - 80;
    const chartH = h - 100;
    const entryY = chartY + chartH * 0.62;
    const tp1Y = chartY + chartH * 0.42;
    const slStartY = chartY + chartH * 0.85;
    // SL slides
    const slideStart = 0.40;
    const slideT = Math.min(1, Math.max(0, (tt - slideStart) / 0.20));
    const slY = slStartY + (entryY - slStartY) * slideT;
    // Entry line
    ctx.strokeStyle = '#FFB300';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(chartX, entryY);
    ctx.lineTo(chartX + chartW, entryY);
    ctx.stroke();
    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('ENTRY', chartX + chartW - 6, entryY - 4);
    // SL
    ctx.strokeStyle = '#EF5350';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(chartX, slY);
    ctx.lineTo(chartX + chartW, slY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#EF5350';
    ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
    ctx.fillText(slideT > 0.95 ? 'SL = BE' : 'SL', chartX + chartW - 6, slY - 4);
    // TP1
    ctx.strokeStyle = '#26A69A';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(chartX, tp1Y);
    ctx.lineTo(chartX + chartW, tp1Y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#26A69A';
    ctx.fillText('TP1 (50% off)', chartX + chartW - 6, tp1Y - 4);
    // Price marker at TP1 if hit
    if (tt > 0.30) {
      const fade = Math.min(1, (tt - 0.30) / 0.10);
      ctx.fillStyle = `rgba(38, 166, 154, ${fade})`;
      ctx.beginPath();
      ctx.arc(chartX + chartW * 0.65, tp1Y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(38, 166, 154, ${fade})`;
      ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('TP1 HIT', chartX + chartW * 0.65, tp1Y + 22);
    }
    if (tt > 0.65) {
      const fade = Math.min(1, (tt - 0.65) / 0.15);
      ctx.fillStyle = `rgba(255, 179, 0, ${fade})`;
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Trade is now risk-free \u2014 trail to TP2/TP3', w / 2, h - 14);
    }
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// A12 — SkippedTradeAnim (S12) — Watch tier signal, "do not engage" stamp
function SkippedTradeAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 8.0;
    const tt = (t % T) / T;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE SKIP \u2014 WATCH TIER DISCIPLINE', w / 2, 22);
    // Mini chart with weak signal
    const chartX = 30;
    const chartY = 50;
    const chartW = w - 60;
    const chartH = h - 100;
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(chartX, chartY, chartW, chartH);
    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.strokeRect(chartX, chartY, chartW, chartH);
    // Choppy candles
    const nC = 14;
    const cwBar = chartW / nC;
    for (let i = 0; i < nC; i++) {
      const cxBar = chartX + i * cwBar + cwBar / 2;
      const noise = Math.sin(i * 1.7) * 8;
      const cy = chartY + chartH * 0.5 + noise;
      const isUp = (i % 2) === 0;
      const bodyH = 8 + Math.abs(Math.cos(i * 0.8)) * 6;
      ctx.fillStyle = isUp ? 'rgba(38, 166, 154, 0.5)' : 'rgba(239, 83, 80, 0.5)';
      ctx.fillRect(cxBar - cwBar * 0.3, cy - bodyH / 2, cwBar * 0.6, bodyH);
    }
    // Weak signal label
    if (tt > 0.20) {
      const fade = Math.min(1, (tt - 0.20) / 0.15);
      ctx.globalAlpha = fade;
      const sigX = chartX + chartW * 0.7;
      const sigY = chartY + chartH * 0.4;
      ctx.fillStyle = 'rgba(255, 179, 0, 0.50)';
      ctx.fillRect(sigX - 24, sigY, 48, 18);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Long', sigX, sigY + 13);
      ctx.globalAlpha = 1;
    }
    // SKIP stamp diagonal
    if (tt > 0.45) {
      const fade = Math.min(1, (tt - 0.45) / 0.20);
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate(-0.12);
      ctx.globalAlpha = fade;
      const stampW = w * 0.5;
      const stampH = 50;
      ctx.fillStyle = 'rgba(239, 83, 80, 0.10)';
      ctx.fillRect(-stampW / 2, -stampH / 2, stampW, stampH);
      ctx.strokeStyle = '#EF5350';
      ctx.lineWidth = 3;
      ctx.strokeRect(-stampW / 2, -stampH / 2, stampW, stampH);
      ctx.fillStyle = '#EF5350';
      ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SKIP \u2014 WATCH TIER', 0, 9);
      ctx.restore();
      ctx.globalAlpha = 1;
    }
    if (tt > 0.75) {
      const fade = Math.min(1, (tt - 0.75) / 0.15);
      ctx.fillStyle = `rgba(255,255,255,${0.5 * fade})`;
      ctx.font = '10px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Logged in journal as observation. No engagement.', w / 2, h - 10);
    }
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// A13 — PlanHandoffAnim (S13) — synthesis tooltip arrow into trade plan card
function PlanHandoffAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 11.0;
    const tt = (t % T) / T;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SYNTHESIS \u2192 TRADE PLAN', w / 2, 22);
    const cardW = (w - 70) / 2;
    const cardH = h - 90;
    const startY = 50;
    // Left card: synthesis
    const leftX = 25;
    ctx.fillStyle = 'rgba(38, 166, 154, 0.05)';
    ctx.fillRect(leftX, startY, cardW, cardH);
    ctx.strokeStyle = 'rgba(38, 166, 154, 0.40)';
    ctx.lineWidth = 1;
    ctx.strokeRect(leftX, startY, cardW, cardH);
    ctx.fillStyle = '#26A69A';
    ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SYNTHESIS', leftX + cardW / 2, startY + 18);
    const synthLines = [
      { text: '4/4 Conviction', color: 'rgba(255,255,255,0.95)', bold: true },
      { text: '', color: '' },
      { text: 'Ribbon \u2713', color: '#26A69A' },
      { text: 'ADX 28 \u2713', color: '#26A69A' },
      { text: 'Volume 1.6\u00d7 \u2713', color: '#26A69A' },
      { text: 'Health 72% \u2713', color: '#26A69A' },
      { text: '', color: '' },
      { text: 'Tag: Sweep + FVG', color: '#FFB300' },
    ];
    synthLines.forEach((ln, i) => {
      if (!ln.text) return;
      ctx.fillStyle = ln.color;
      ctx.font = `${ln.bold ? 'bold ' : ''}10px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(ln.text, leftX + 12, startY + 38 + i * 14);
    });
    // Arrow in middle
    if (tt > 0.30) {
      const fade = Math.min(1, (tt - 0.30) / 0.15);
      ctx.fillStyle = `rgba(255, 179, 0, ${fade})`;
      ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('\u2192', w / 2, startY + cardH / 2 + 8);
    }
    // Right card: plan
    const rightX = leftX + cardW + 20;
    if (tt > 0.45) {
      const fade = Math.min(1, (tt - 0.45) / 0.20);
      ctx.globalAlpha = fade;
      ctx.fillStyle = 'rgba(255, 179, 0, 0.05)';
      ctx.fillRect(rightX, startY, cardW, cardH);
      ctx.strokeStyle = 'rgba(255, 179, 0, 0.40)';
      ctx.lineWidth = 1;
      ctx.strokeRect(rightX, startY, cardW, cardH);
      ctx.fillStyle = '#FFB300';
      ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('TRADE PLAN', rightX + cardW / 2, startY + 18);
      const planLines = [
        { text: 'Size: 1.5\u00d7 baseline', color: 'rgba(255,255,255,0.95)', bold: true },
        { text: '', color: '' },
        { text: 'Entry: signal close', color: 'rgba(255,255,255,0.7)' },
        { text: 'SL: Risk Map Auto', color: '#EF5350' },
        { text: 'TP1: 1R \u2014 50% off', color: '#26A69A' },
        { text: 'TP2: 2R \u2014 30% off', color: '#26A69A' },
        { text: 'TP3: 3R \u2014 20% trail', color: '#26A69A' },
        { text: '', color: '' },
        { text: 'BE move at TP1', color: '#FFB300' },
      ];
      planLines.forEach((ln, i) => {
        if (!ln.text) return;
        ctx.fillStyle = ln.color;
        ctx.font = `${ln.bold ? 'bold ' : ''}10px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'left';
        ctx.fillText(ln.text, rightX + 12, startY + 38 + i * 13);
      });
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('The synthesis fills the plan. Plan-by-numbers.', w / 2, h - 10);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================
export default function CipherConvictionSynthesisLesson() {
  const [scrollY, setScrollY] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameRound, setGameRound] = useState(0);
  const [gameSelections, setGameSelections] = useState<(string | null)[]>(new Array(gameRounds.length).fill(null));
  const [quizAnswers, setQuizAnswers] = useState<(string | null)[]>(new Array(quizQuestions.length).fill(null));
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [certRevealed, setCertRevealed] = useState(false);
  const [certId] = useState(() => `PRO-CERT-L11.22-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);

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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 11 &middot; Lesson 22</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Cipher Conviction Synthesis<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>When Modules Agree, Trade. When They Don&apos;t, Wait.</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">CIPHER fires signals all day. Most of them are noise. The 4-factor conviction score and the 13-tag context cascade tell you which signals to trade, at what size, with which plan. This is the synthesis layer that the Visual Layer arc was building toward.</motion.p>
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
            <p className="text-xl font-extrabold mb-3">Every module said something. The synthesis says when to actually trade.</p>
            <p className="text-gray-400 leading-relaxed mb-4">By Level 11.21, you read the Ribbon, the ADX, the Volume, the Health gauge, the structural context, the candle modes &mdash; each module a separate read. In the moment of a signal, you cannot consult six modules in sequence. You have seconds. You need one decisive read.</p>
            <p className="text-gray-400 leading-relaxed mb-4">The conviction synthesis is that one read. Four factors collapse into a score. Thirteen context tags collapse into one cascade winner. The result: a tier (Conviction, Standard, Watch) that determines whether to engage, at what size, with what trade plan. The synthesis is mechanical &mdash; it runs in milliseconds and produces the same answer every time. It is the framework saying &ldquo;trade this&rdquo; or &ldquo;do not trade this&rdquo; without leaving room for hunch.</p>
            <p className="text-gray-400 leading-relaxed">This is the first capstone of Level 11. Every Visual Layer module fed into here. After this lesson, the candles (L11.23) and the war room (L11.24) operationalize what the synthesis decides.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#11088; THE CONVICTION PROMISE</p>
            <p className="text-sm text-gray-400 leading-relaxed">By the end of this lesson, you will know the <strong className="text-white">four conviction factors</strong>, the <strong className="text-white">13-tag context cascade</strong>, the <strong className="text-white">three engagement tiers</strong>, the <strong className="text-white">tier-based sizing</strong>, and the <strong className="text-white">trade plan handoff</strong>. You will read a synthesis tooltip and know exactly what to do.</p>
          </div>
        </motion.div>
      </section>

      {/* === S01 — When Modules Agree, Trade (Groundbreaking Concept) === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; &#11088; When Modules Agree</p>
          <h2 className="text-2xl font-extrabold mb-4">The Groundbreaking Concept</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Operators new to CIPHER ask the same question: &ldquo;which module do I look at first?&rdquo; The premise is wrong. You do not look at modules &mdash; you read the synthesis. Four factors get a vote. Thirteen tags compete for one slot. The result is binary: engage or do not. This is the framework&apos;s most important compression.</p>
          <FourFactorHeroAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the four factors fill in. Ribbon strength (trend alignment of the 8 EMAs). ADX (trend conviction \u2265 25). Volume ratio (\u2265 1.0\u00d7 vs 20-bar avg). Health (CIPHER&apos;s composite quality gate \u2265 50%). Each is a yes/no check; the score is 0-4. A 4/4 score with the right context tag becomes a Conviction-tier engagement &mdash; the framework&apos;s highest-confidence call.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">FACTORS ARE ORTHOGONAL BY DESIGN</p>
              <p className="text-sm text-gray-400 leading-relaxed">Ribbon, ADX, Volume, Health each measure a different dimension of trend quality. A signal can fire with one, two, three, or four confirmed. Conviction grows non-linearly with the score &mdash; 4/4 is much more than 4x as confident as 1/4 because the orthogonality means each confirmation independently lowers the noise floor.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CASCADE OVER COMMITTEE</p>
              <p className="text-sm text-gray-400 leading-relaxed">The 13-tag context cascade resolves to one winner. There is no &ldquo;average context&rdquo; or &ldquo;weighted blend.&rdquo; The first matching tag in priority order wins, and the rest are silenced. This is deliberate &mdash; cascades produce identifiable, unambiguous reads. Committees produce vague compromises.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SYNTHESIS BEATS DISCRETION UNDER LOAD</p>
              <p className="text-sm text-gray-400 leading-relaxed">Operators who override the synthesis with their gut perform worse over 100 sessions than operators who follow the synthesis mechanically. Discretion fails under load (multiple alerts, fatigue, fast-moving price). Mechanical scoring does not.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Four factors. Thirteen tags. One tier. Honor the synthesis &mdash; especially when your gut says otherwise.</p>
          </div>
        </motion.div>
      </section>

      {/* === S02 — Factor 1: The Ribbon === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; Factor 1: The Ribbon</p>
          <h2 className="text-2xl font-extrabold mb-4">Trend strength &middot; the EMA alignment vote</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The Ribbon is CIPHER&apos;s 8-EMA fan. When the EMAs are spread, ordered, and trending in the same direction, the Ribbon is Strong. When they have converged, crossed, or pinched, the Ribbon is Weak. Strong = +1, Weak = 0. The Ribbon vote captures the cleanest read on whether the chart has trend structure right now.</p>
          <RibbonFactorAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the two states cycle. STRONG: 8 EMAs spread vertically, sorted by length, all sloping the same direction. WEAK: EMAs converged in a narrow band, crossing each other, no clear slope. The Ribbon factor scores +1 in Strong and 0 in Weak. There is no half-credit &mdash; the EMA alignment is binary by Pine implementation.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">RIBBON STRONG &middot; +1</p>
              <p className="text-sm text-gray-400 leading-relaxed">The 8 EMAs are spread (good vertical separation between fastest and slowest), aligned (sorted in the same order), and sloping the same direction. This is the cleanest visual signature CIPHER has for trend structure. Most clean trends produce Strong Ribbon for the duration of the move.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">RIBBON WEAK &middot; 0</p>
              <p className="text-sm text-gray-400 leading-relaxed">The EMAs are converged, crossed, or pinched. Trend structure is absent or transitioning. Signals firing during Weak Ribbon often happen at structural inflection points &mdash; reversals, range starts, or post-event chop &mdash; where directional bias is unclear.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE BINARY VOTE</p>
              <p className="text-sm text-gray-400 leading-relaxed">No half-credit. The Pine implementation evaluates Strong/Weak as a hard threshold. This is intentional &mdash; soft thresholds invite overrides. The hard threshold means an operator either gets the Ribbon vote or does not, with no negotiation.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Strong = trend structure present. Weak = absent. Binary vote, no negotiation.</p>
          </div>
        </motion.div>
      </section>

      {/* === S03 — Factor 2: ADX === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; Factor 2: ADX</p>
          <h2 className="text-2xl font-extrabold mb-4">Trend conviction &middot; the 25 threshold</h2>
          <p className="text-gray-400 leading-relaxed mb-6">ADX measures the strength of the trend regardless of direction. Below 25, the market lacks the conviction to sustain trends &mdash; signals that fire here tend to chop and fail. At or above 25, trends have institutional backing and tend to follow through. The ADX factor scores +1 when ADX \u2265 25 and 0 below.</p>
          <ADXFactorAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the dial sweep. The amber threshold marker sits at 25. When ADX rises above the marker, the dial fills teal and the factor scores +1. When ADX is below, the dial fills magenta and the factor is 0. The threshold is from the original Wilder ADX framework and is the standard separator between trend and range markets.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">ADX \u2265 25 &middot; +1</p>
              <p className="text-sm text-gray-400 leading-relaxed">The market has trend conviction. Directional signals fired in this regime have follow-through expectancy. Most clean trend trades happen with ADX between 25 and 45; above 45 the trend is mature and reversal risk rises.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">ADX BELOW 25 &middot; 0</p>
              <p className="text-sm text-gray-400 leading-relaxed">The market is in a range or transitioning. Directional signals here have low expectancy &mdash; they often fire on noise rather than commitment. The factor scoring 0 is the framework saying &ldquo;the trend conviction layer is absent&rdquo; without forbidding engagement (the score is one of four).</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE 25 IS HARD</p>
              <p className="text-sm text-gray-400 leading-relaxed">ADX 24.9 = 0. ADX 25.0 = +1. The hard threshold is intentional. Operators who soften it (&ldquo;close enough at 24&rdquo;) progressively soften other thresholds and end up with no thresholds at all. The discipline is the threshold.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">25 or higher: trend has commitment. Below: range or transition. Hard threshold &mdash; no &ldquo;close enough.&rdquo;</p>
          </div>
        </motion.div>
      </section>

      {/* === S04 — Factor 3: Volume === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Factor 3: Volume</p>
          <h2 className="text-2xl font-extrabold mb-4">The 1.0\u00d7 ratio threshold</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Volume confirms or denies the move. The factor measures volume on the signal bar relative to the 20-bar moving average. Ratio \u2265 1.0\u00d7 means the signal bar has at least average participation &mdash; the move has crowd behind it. Below 1.0\u00d7 means the move is happening on lighter-than-average volume &mdash; an anaemic signature that often fails.</p>
          <VolumeFactorAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the 12 bars build. The amber dotted line is the 1.0\u00d7 threshold. Bars above the line score teal (volume confirms). Bars below score magenta (volume absent). The latest bar shows the current ratio and the pass/fail badge. The volume factor is the simplest of the four to verify visually.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">VOLUME \u2265 1.0\u00d7 &middot; +1</p>
              <p className="text-sm text-gray-400 leading-relaxed">The signal bar has at least average participation. Most legitimate trend signals fire on volume between 1.2\u00d7 and 2.5\u00d7 the average. Above 3\u00d7 is exhaustion territory &mdash; volume is high but the move may be climactic. The 1.0\u00d7 threshold catches the bottom edge of legitimate participation.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">VOLUME BELOW 1.0\u00d7 &middot; 0</p>
              <p className="text-sm text-gray-400 leading-relaxed">The move is happening on light volume. Light-volume moves have lower follow-through. The factor scoring 0 is a yellow flag &mdash; the signal may still be valid, but the volume isn&apos;t confirming. This is one of the four factors most likely to be the missing one in 3/4 setups.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FX SPECIAL CASE</p>
              <p className="text-sm text-gray-400 leading-relaxed">FX volume from retail brokers is tick volume, not true exchange volume. The ratio still works but with more noise. FX traders often run the framework with a 1.2\u00d7 threshold instead of 1.0\u00d7 to compensate &mdash; and the framework allows this customization in the inputs.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">1.0\u00d7 or higher: crowd is behind the move. Below: anaemic. FX traders adjust to 1.2\u00d7 if needed.</p>
          </div>
        </motion.div>
      </section>

      {/* === S05 — Factor 4: Health === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Factor 4: Health</p>
          <h2 className="text-2xl font-extrabold mb-4">CIPHER\u2019s composite quality gate</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Health is CIPHER&apos;s catch-all quality gate &mdash; a composite score that blends signal-line distance, regime cleanliness, and structural alignment. It exists to catch things the other three factors miss. Health \u2265 50% means the chart broadly looks tradeable. Below 50% means something is structurally off, even if Ribbon, ADX, and Volume all confirm.</p>
          <HealthFactorAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the gauge sweep. The 50% threshold is the pass line. Below 50% the gauge fills magenta and Health scores 0 &mdash; the chart has structural issues. Above 50% the gauge fills teal and Health scores +1. Most clean signals fire with Health between 60% and 85%. Health above 90% is rare and indicates the chart is in an unusually clean state.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">HEALTH \u2265 50% &middot; +1</p>
              <p className="text-sm text-gray-400 leading-relaxed">The chart is broadly tradeable. The composite quality gate is open. Most signals you should engage will have Health in this range. Health works as a sanity check on the other three factors.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">HEALTH BELOW 50% &middot; 0</p>
              <p className="text-sm text-gray-400 leading-relaxed">Something is structurally off. The chart may have just had a high-impact news event, may be near a major level, or may be in a transitional regime. Even if the other three factors all confirm, Health below 50% is the framework saying &ldquo;there&apos;s a structural reason this trade may not work.&rdquo;</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE CATCH-ALL FACTOR</p>
              <p className="text-sm text-gray-400 leading-relaxed">Health captures patterns that don&apos;t fit cleanly into Ribbon/ADX/Volume. A clean trend with a major news catalyst pending will often have Health in the 40s. A perfect setup at the open during high implied volatility will sometimes have Health below 50. The factor is doing real work even when the visible chart looks fine.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">50% or higher: chart is tradeable. Below: something structurally off. Trust the catch-all.</p>
          </div>
        </motion.div>
      </section>

      {/* === S06 — Score Composition === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Score Composition</p>
          <h2 className="text-2xl font-extrabold mb-4">From four factors to one number</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The four factors each contribute 0 or 1 to the score. Sum is 0-4. The score is the headline output of the synthesis &mdash; the one number that determines the engagement tier when combined with the context tag. Most signals fire at 2/4 or 3/4. The rare 4/4 with apex context is the framework&apos;s highest-edge call.</p>
          <ScoreCompositionAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Three example compositions cycle. 4/4 STRONG: every factor confirms. 3/4 STANDARD: one factor missing (commonly ADX in mid-trend, Volume during low-volatility periods). 1/4 WATCH: only one factor confirming &mdash; usually Ribbon firing on the visual signal but the supporting context is absent. Watch what the score reveals: each missing factor is a missing dimension of confirmation.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">SCORE 4 &middot; ALL FOUR ALIGN</p>
              <p className="text-sm text-gray-400 leading-relaxed">Strong Ribbon, ADX \u2265 25, Volume \u2265 1.0\u00d7, Health \u2265 50%. The setup is broadcasting full alignment. Combined with the context tag, this becomes either Conviction tier (if apex tag) or high Standard tier (if mid-priority tag).</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SCORE 3 &middot; THE WORKHORSE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Three of four confirming. Most clean trend signals land here. The missing factor is informative &mdash; missing ADX means trend conviction is borderline; missing Volume means an anaemic move; missing Health means a structural concern. 3/4 is the threshold for Standard tier engagement.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SCORE 2 OR BELOW &middot; WATCH TIER</p>
              <p className="text-sm text-gray-400 leading-relaxed">Two or fewer factors. The framework treats this as Watch tier &mdash; observe, do not engage. The signal is firing on insufficient supporting context. Engaging anyway is the discipline failure documented in section fifteen.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DISTRIBUTION OF SCORES</p>
              <p className="text-sm text-gray-400 leading-relaxed">In typical session backtests, score distribution is roughly: 4/4 = 5-10%, 3/4 = 25-35%, 2/4 = 35-45%, 1/4 = 15-25%. Most signals are 2/4 or 3/4. The rare 4/4 is what the framework is designed to spotlight.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Score \u2265 3 = engage. Score \u2264 2 = watch. The missing factor tells you which dimension is absent.</p>
          </div>
        </motion.div>
      </section>

      {/* === S07 — The 13-Tag Context Cascade === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; The 13-Tag Context Cascade</p>
          <h2 className="text-2xl font-extrabold mb-4">First match wins &middot; cascade does not blend</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The score tells you how strong the signal is. The context tag tells you what kind of setup it is. Thirteen possible tags, ranked by confluence quality. The cascade scans top-down; the first matching tag wins; the rest are silenced. The output is one tag &mdash; the framework&apos;s answer to &ldquo;what setup is this?&rdquo;</p>
          <ContextCascadeAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the cascade scan. Priorities 1-2 (Sweep+FVG, Sweep) are apex tags &mdash; they promote the score to Conviction tier when 4/4. Priorities 3-9 are mid-priority tags &mdash; structural confirmations that qualify Standard tier. Priorities 10-13 are low-confluence contexts (Range, Chop, Counter-trend) &mdash; even with a 4/4 score, these tags keep the engagement at Standard or below. The cascade is the framework&apos;s way of saying &ldquo;not all setups are equal.&rdquo;</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">PRIORITY 1-2 &middot; APEX TAGS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Sweep+FVG (priority 1) and Sweep (priority 2) are the highest-confluence contexts CIPHER recognizes. A liquidity sweep into a fair value gap is the canonical institutional reversal pattern. These tags, combined with 4/4 score, produce the Conviction tier.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PRIORITY 3-9 &middot; STRUCTURAL CONFIRMATIONS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Breakout, S/R, Trend, OB align, Imbalance, Volume confirm, Structure shift. Each is a real confluence layer but lower-quality than the apex pair. With 3/4 or 4/4 score, these tags qualify Standard tier engagement.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PRIORITY 10-13 &middot; LOW-CONFLUENCE CONTEXTS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Range, Chop, Counter-trend, No context. These tags fire when no higher-priority pattern matches. Even a 4/4 score paired with a Range or Chop tag stays at Standard tier &mdash; the cascade is saying &ldquo;the score is strong but the context is not the kind that historically follows through.&rdquo;</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FIRST-MATCH SEMANTICS</p>
              <p className="text-sm text-gray-400 leading-relaxed">The cascade scans priorities 1, 2, 3, ... 13 in order. The first matching pattern wins; the cascade exits. There is no &ldquo;multiple tags fire&rdquo; or &ldquo;weighted blend.&rdquo; This produces unambiguous tags and prevents the analytical paralysis of looking at 6 tags simultaneously.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Apex tags (P1-2) promote to Conviction. Mid (P3-9) qualifies Standard. Low (P10-13) holds at Standard or below. First match wins.</p>
          </div>
        </motion.div>
      </section>

      {/* === S08 — The Synthesis Tooltip === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; The Synthesis Tooltip</p>
          <h2 className="text-2xl font-extrabold mb-4">One read &middot; all four factors &middot; the cascade winner &middot; the tier</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The synthesis tooltip is the operator-facing surface of the entire framework. It appears on every signal label. Four factor checks, one context tag, one tier. Reading the tooltip takes under two seconds for an experienced operator. The tooltip is what you read in real-time during sessions; everything else in this lesson is what runs underneath.</p>
          <TooltipDecodeAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the tooltip render. The signal label fires on the chart. The tooltip fades in beside it: &ldquo;Pulse Cross Long&rdquo; (signal type), then the four factor checks (each with verdict), then the context tag in amber (what kind of setup), then the tier verdict. The whole tooltip is structured for fast visual scan &mdash; bold for headline, color-coded for verdicts, indented for hierarchy.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">SIGNAL HEADLINE &middot; WHAT FIRED</p>
              <p className="text-sm text-gray-400 leading-relaxed">The first line names the signal &mdash; Pulse Cross Long, Tension Snap Short, Squeeze Release Long, etc. This tells you which of CIPHER&apos;s signal generators fired. Each signal has its own historical edge profile.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FOUR FACTOR LINES &middot; THE CONFLUENCE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Ribbon, ADX, Volume, Health each get a line. Each shows the actual measured value (28 ADX, 1.6\u00d7 volume, 72% health) and a teal check or magenta cross. You can see at a glance which factors confirmed and which did not.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CONTEXT TAG &middot; THE CASCADE WINNER</p>
              <p className="text-sm text-gray-400 leading-relaxed">The amber line names the cascade winner. &ldquo;Sweep + FVG&rdquo; for apex setups, &ldquo;Breakout&rdquo; or &ldquo;Trend&rdquo; for mid-priority, &ldquo;Range&rdquo; or &ldquo;No context&rdquo; for low-confluence. The tag tells you what kind of setup this is at a glance.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">TIER VERDICT &middot; THE BOTTOM LINE</p>
              <p className="text-sm text-gray-400 leading-relaxed">The final line is the tier &mdash; Conviction, Standard, or Watch. This is the bottom line of the entire synthesis. The tier tells you whether to engage and at what size. If Conviction, size 1.5x. If Standard, size 1.0x. If Watch, do not engage.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Read top-down: signal, factors, context, tier. Two seconds. The tooltip is the entire synthesis compressed.</p>
          </div>
        </motion.div>
      </section>

      {/* === S09 — Tier Ladder & Sizing === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Tier Ladder &amp; Sizing</p>
          <h2 className="text-2xl font-extrabold mb-4">Three tiers &middot; three sizes &middot; one decision</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The score and the cascade combine into one of three tiers. Conviction at the top: 4/4 score with apex context. Standard in the middle: 3/4 score with any context, or 4/4 with mid-priority context. Watch at the bottom: 2/4 or below, or low-confluence context regardless of score. Each tier has a fixed sizing rule. The decision is mechanical.</p>
          <TierLadderAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the three tiers cycle. Conviction at 1.5x baseline within max risk cap. Standard at 1.0x baseline. Watch at 0x &mdash; do not engage. The sizing is set at entry, not modified mid-trade. Each tier&apos;s size is calibrated to the historical edge of setups that match that tier&apos;s gating criteria.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">CONVICTION &middot; 1.5\u00d7 BASELINE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Highest tier. Requires 4/4 score AND apex context tag (Sweep+FVG or Sweep). These setups are statistically rare &mdash; expect 2-5 per session on a busy chart, sometimes zero. Sizing scales to 1.5x baseline within the max risk cap. The 1.5x is the framework asking you to express the high confluence at the trade level.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STANDARD &middot; 1.0\u00d7 BASELINE</p>
              <p className="text-sm text-gray-400 leading-relaxed">The framework&apos;s default engagement size. 3/4 score qualifies, or 4/4 with mid-priority context. Most engaged trades land here. The 1.0x baseline is your defined per-trade risk &mdash; usually 0.5% to 1% of equity.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WATCH &middot; 0\u00d7 &middot; DO NOT ENGAGE</p>
              <p className="text-sm text-gray-400 leading-relaxed">2/4 score or below, or low-confluence context regardless of score. The framework explicitly says do not engage. Log the setup in the journal as observation. Operators who engage Watch tier &ldquo;just to see&rdquo; produce statistically negative outcomes &mdash; this is documented in section fifteen as mistake five.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SIZING DOES NOT MOVE MID-TRADE</p>
              <p className="text-sm text-gray-400 leading-relaxed">The tier-determined size is set at entry. The trade plan executes on that size. Mid-trade adjustments to size (adding to a winner, scaling on a loser) break the per-trade risk discipline. The plan accounts for the size; do not modify the size.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Conviction = 1.5x. Standard = 1.0x. Watch = 0. Size set at entry, never moves.</p>
          </div>
        </motion.div>
      </section>

      {/* === S10 — The Risk Map === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; The Risk Map</p>
          <h2 className="text-2xl font-extrabold mb-4">Entry &middot; SL &middot; TP1 &middot; TP2 &middot; TP3 &middot; all preset before entry</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The Risk Map auto-renders the entry, the stop-loss, and three take-profits at 1R, 2R, 3R as soon as a signal fires. Operator engages the trade by accepting the Risk Map &mdash; the entry is signal close, SL is the auto-computed structural level, TPs are the pre-set R-multiples with 50/30/20 scaling. The plan exists before the trade is taken.</p>
          <RiskMapAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the Risk Map populate. The entry line (amber) sits at the signal close. The SL (red dashed) drops to the structural level CIPHER auto-computes &mdash; usually a recent swing low for longs, swing high for shorts. The three TP lines (teal dashed) project at 1R, 2R, 3R above entry, with 50%/30%/20% scaling labels. The risk zone (red shaded) and reward zone (teal shaded) make the asymmetry visible.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">ENTRY &middot; SIGNAL CLOSE</p>
              <p className="text-sm text-gray-400 leading-relaxed">The entry is the close of the signal bar. No chasing, no waiting for retracements. The signal-close entry is what the framework&apos;s historical edge is measured against &mdash; deviating from it (waiting for a 2-bar retest, entering on the next bar open) changes the trade&apos;s expectancy.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SL &middot; RISK MAP AUTO</p>
              <p className="text-sm text-gray-400 leading-relaxed">The SL is auto-computed at the most recent structural level &mdash; swing low for longs, swing high for shorts. Operators do not eyeball the SL. The auto-computation is consistent across trades and prevents the tendency to tighten stops on weak setups (which produces frequent stop-outs).</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">TP1 / TP2 / TP3 AT 1R / 2R / 3R</p>
              <p className="text-sm text-gray-400 leading-relaxed">The three take-profits are at multiples of the risk distance. If the SL is 25 pips below entry on a long, TP1 is 25 pips above entry, TP2 is 50 pips above, TP3 is 75 pips above. The R-multiples make P&L tracking and edge calculation consistent regardless of asset or timeframe.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SCALING 50 / 30 / 20</p>
              <p className="text-sm text-gray-400 leading-relaxed">50% off at TP1, 30% off at TP2, 20% trails for TP3 or extension. The front-loaded scaling captures most of the edge by TP1 (50% banked at 1R) while leaving meaningful exposure for trend continuation. The 50/30/20 ratio is calibrated to the framework&apos;s observed average win profile.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Plan is preset. Entry at signal close. SL at Risk Map Auto. TPs at 1R/2R/3R with 50/30/20 scaling. Accept or skip.</p>
          </div>
        </motion.div>
      </section>

      {/* === S11 — The BE Move === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; The BE Move</p>
          <h2 className="text-2xl font-extrabold mb-4">TP1 hit &rarr; SL to entry &rarr; trade is risk-free</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The breakeven move is the framework&apos;s second risk-management discipline (after the auto-SL). When TP1 is hit, the SL on the remaining 50% of the position moves to entry (BE). The trade is now risk-free &mdash; if reversals stop you out, you lose nothing on the remaining size; if it continues, you trail to TP2 and TP3.</p>
          <BEMoveAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the SL slide. Entry sits at the amber line. SL starts below at the auto-computed level. When price hits TP1 (50% off there), the SL slides up to the entry level &mdash; the trade is now BE-protected. The 50% remaining trails for TP2 (30% off) and TP3 (20% trail). The trade either takes profit on extension or stops out at BE for zero loss on the remainder.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">TP1 IS THE TRIGGER</p>
              <p className="text-sm text-gray-400 leading-relaxed">The BE move is gated on TP1 being hit, not on time or candle pattern. TP1 hit = 1R achieved = framework confirmation that the signal is working. Other BE triggers (after 30 minutes, after a strong candle close) are operator overrides not framework rules.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">RISK-FREE PROPERTY</p>
              <p className="text-sm text-gray-400 leading-relaxed">After the BE move, the worst case on the remaining 50% is a flat exit. The 50% already taken at TP1 is locked in. The trade has converted from defined-risk to asymmetric &mdash; possible upside (TP2 + TP3) with no possible downside on the remaining size.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DO NOT WIDEN THE SL</p>
              <p className="text-sm text-gray-400 leading-relaxed">Once BE-moved, the SL never moves down. Widening the SL after a BE move is a protocol violation that converts a defined-risk trade into an undefined-risk trade. If the trade gets stopped out at BE, that is the framework working as designed.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">TRAIL THE FINAL 20%</p>
              <p className="text-sm text-gray-400 leading-relaxed">After TP2 (30% off there), the final 20% trails for TP3 or beyond. Trailing methods vary (3-bar swing low, ATR-based, structural levels). The framework allows operator choice on trailing &mdash; the constraint is just that you do not move the SL below the previous swing.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">TP1 hit = SL to BE. Risk-free remainder. Never widen. Trail the final 20%.</p>
          </div>
        </motion.div>
      </section>

      {/* === S12 — The Skip Discipline === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">12 &mdash; The Skip Discipline</p>
          <h2 className="text-2xl font-extrabold mb-4">Watch tier means do not engage &mdash; period</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The framework explicitly forbids Watch tier engagement. Score 2/4 or below, or low-confluence context regardless of score &mdash; these signals are observation only. Operators routinely violate this discipline because the signal &ldquo;looks right&rdquo; or &ldquo;feels different&rdquo; or because they are bored mid-session. The skip discipline is what separates Standard-tier operators from real ones.</p>
          <SkippedTradeAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the skip render. A weak signal fires on a choppy chart. The synthesis evaluates and the tier resolves to Watch. The framework stamps SKIP across the setup &mdash; not as a recommendation but as a verdict. The right action: log the setup in the journal as observation, do not engage. Over 100 sessions, the skipped Watch-tier setups have negative expectancy when traded; the data is consistent.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">WATCH TIER IS NEGATIVE EDGE</p>
              <p className="text-sm text-gray-400 leading-relaxed">The framework was built by backtesting which setups produce edge and which produce noise. Watch tier setups consistently underperform &mdash; they fire frequently but follow through rarely. Engaging them as a class is statistically negative-EV.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">&ldquo;BUT THIS ONE LOOKS DIFFERENT&rdquo;</p>
              <p className="text-sm text-gray-400 leading-relaxed">No, it does not. The Watch-tier setup that &ldquo;looks different&rdquo; is the same setup that statistically underperforms &mdash; you are just experiencing the recency bias of having seen one work recently. The framework saw 1000 of them and built the tier accordingly. Trust the dataset.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">LOG OBSERVATIONS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Skipped setups go in the journal as observations. The data accumulates. Over 100+ sessions you can verify the framework&apos;s call &mdash; mostly skipped Watch tiers chop and fail, validating the skip. Occasionally one runs and you missed it; the framework is not perfect but the expected value is clear.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SKIPPING IS THE EDGE</p>
              <p className="text-sm text-gray-400 leading-relaxed">The framework&apos;s edge comes as much from the trades you skip as from the trades you take. A 70% engagement rate (taking everything) produces near-zero edge. A 30% engagement rate (taking only Conviction and Standard) produces the framework&apos;s designed expectancy. Skipping is the discipline that produces the edge.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Watch tier = do not engage. Log as observation. Skipping is the edge.</p>
          </div>
        </motion.div>
      </section>

      {/* === S13 — Synthesis to Trade Plan Handoff === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">13 &mdash; Synthesis &rarr; Trade Plan</p>
          <h2 className="text-2xl font-extrabold mb-4">The synthesis fills the plan &middot; plan-by-numbers</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The synthesis tooltip and the trade plan are two halves of one workflow. The synthesis decides whether and at what tier. The trade plan executes that decision with paint-by-numbers fields. Tier sets size. Risk Map sets entry, SL, and TPs. Scaling and BE rules are fixed. The operator&apos;s job is to engage the plan, not invent it.</p>
          <PlanHandoffAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the handoff. Left card: synthesis output. 4/4 Conviction with apex tag. Right card: trade plan. Size 1.5x. Entry signal close. SL Risk Map Auto. TP1/2/3 with 50/30/20 scaling. BE move at TP1. The synthesis fills the plan deterministically &mdash; the operator does not decide entry, SL, TP, or scaling. The framework decides; the operator engages.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">TIER &rarr; SIZE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Conviction = 1.5x baseline within max risk cap. Standard = 1.0x baseline. Watch = 0 (do not engage). The tier is the only sizing input. Operators do not override tier-determined size.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">RISK MAP &rarr; LEVELS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Entry at signal close. SL at the auto-computed structural level. TPs at 1R, 2R, 3R. The three lines and three targets are deterministic from the Risk Map. Operators do not negotiate the levels.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SCALING &amp; BE &rarr; FIXED RULES</p>
              <p className="text-sm text-gray-400 leading-relaxed">50/30/20 scaling at TP1/TP2/TP3. BE move at TP1. These are framework constants, not operator choices. The constants exist because their alternatives have been tested and produce worse outcomes &mdash; full hold to TP3, even scaling, no BE move.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PAINT-BY-NUMBERS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Once the synthesis tier is known, the trade plan is fully determined. The operator&apos;s job is to accept or skip the plan. There is no discretion at the plan-construction stage; discretion lives only at the engage/skip decision. This is the framework&apos;s deepest compression: synthesis decides, plan executes, operator engages.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Synthesis decides. Plan executes. Operator engages. No discretion at the plan-construction stage.</p>
          </div>
        </motion.div>
      </section>

      {/* === S14 — Reading the Synthesis Live === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">14 &mdash; Reading the Synthesis Live</p>
          <h2 className="text-2xl font-extrabold mb-4">2 seconds &middot; tier first &middot; engage or skip</h2>
          <p className="text-gray-400 leading-relaxed mb-6">In the moment of a signal, you have seconds. You do not read the four factor lines individually, then the context tag, then the tier, then decide. You read the tier first. If Conviction or Standard, you engage with the corresponding plan. If Watch, you skip and log. The four factor lines exist for the journal review, not for real-time triage.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">TIER FIRST &middot; PLAN SECOND</p>
              <p className="text-sm text-gray-400 leading-relaxed">In the moment, eyes go to the tier line at the bottom of the tooltip. Conviction = engage 1.5x. Standard = engage 1.0x. Watch = skip. The factors and tag are useful context but not the decision input.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">2-SECOND RULE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Read the tier in under 2 seconds. If your read takes longer, you are over-analyzing &mdash; the synthesis already did the analysis. Trust it and act. Operators who read tooltips for 10+ seconds are not synthesizing; they are looking for permission to override.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">JOURNAL REVIEW IS THE TIME FOR DEEP READS</p>
              <p className="text-sm text-gray-400 leading-relaxed">During session-end review, read the four factor lines for each engaged trade. Note which factors were missing on losers, which were present on winners. Patterns emerge over 30+ sessions. This is the time for analytical depth.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHEN GUT DISAGREES</p>
              <p className="text-sm text-gray-400 leading-relaxed">When your gut disagrees with the synthesis tier, the discipline is to honor the synthesis. Operators who routinely override the synthesis with their gut perform measurably worse over 100 sessions than those who follow it mechanically.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Tier first. 2 seconds. Engage or skip. Deep reads in the journal review.</p>
          </div>
        </motion.div>
      </section>

      {/* === S15 — Six Common Mistakes === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">15 &mdash; Six Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-4">What goes wrong when the synthesis is misused</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The synthesis framework is mechanically precise. The failure modes are operator errors, not framework errors. Six recurring mistakes operators make when working with the synthesis. Each has a fix, and the fix is more conservative than the mistake.</p>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 1 &middot; OVERRIDING THE TIER WITH DISCRETION</p>
              <p className="text-sm text-gray-400 leading-relaxed">The synthesis says Watch. The operator engages anyway because &ldquo;the chart looks ready.&rdquo; The chart looking ready is a recency bias signal, not a structural one. <strong className="text-white">Fix:</strong> honor the tier mechanically. If you find yourself overriding 10%+ of the time, you are not running the framework &mdash; you are running discretion with framework decoration.</p>
            </div>
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 2 &middot; DOUBLE-COUNTING MISSING FACTORS</p>
              <p className="text-sm text-gray-400 leading-relaxed">A 3/4 setup fires. The synthesis already priced the missing factor into the Standard tier (vs Conviction). The operator then reduces size further because of the same missing factor. <strong className="text-white">Fix:</strong> the tier already handles the missing factor. Trade Standard tier at 1.0x baseline. Don&apos;t reduce again.</p>
            </div>
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 3 &middot; CHASING THE 4/4 SETUP</p>
              <p className="text-sm text-gray-400 leading-relaxed">Operator skips Standard tier setups while &ldquo;waiting for a 4/4.&rdquo; Conviction setups are rare; operators waiting for them often go many sessions without engaging. <strong className="text-white">Fix:</strong> Standard tier is the framework&apos;s default engagement. Take Standard setups at 1.0x. Conviction is the upside, not the threshold.</p>
            </div>
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 4 &middot; WIDENING THE SL MID-TRADE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Trade goes against you, approaching SL. Operator widens the SL to give the trade &ldquo;more room.&rdquo; This converts a defined-risk trade into an undefined-risk trade. <strong className="text-white">Fix:</strong> the SL is set at entry by the Risk Map and never moves down. Stop-outs at the auto-SL are how the framework is supposed to work.</p>
            </div>
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 5 &middot; ENGAGING WATCH TIER &ldquo;JUST TO SEE&rdquo;</p>
              <p className="text-sm text-gray-400 leading-relaxed">Watch tier setups feel like they could work. Operator engages at half size to test the framework. After 30 sessions, the Watch tier engagements net negative. <strong className="text-white">Fix:</strong> Watch tier means do not engage. Log as observation. The framework was built by backtesting that this tier underperforms. Trust the dataset.</p>
            </div>
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 6 &middot; CHANGING THE PLAN AFTER ENTRY</p>
              <p className="text-sm text-gray-400 leading-relaxed">Trade in profit, operator decides to hold the entire position to TP3 (skipping the 50% off at TP1). Or trade losing, operator decides to add to the position to lower the average. Both violate the plan. <strong className="text-white">Fix:</strong> the plan is set at entry. Execute the plan. Mid-trade modifications are the discipline failure that separates 30R quarters from -10R quarters.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === Cheat Sheet === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">The Conviction Cheat Sheet</p>
          <h2 className="text-2xl font-extrabold mb-4">For your second monitor</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Print this. The first of the three Level 11 cheat sheets. L11.23 (Candles) and L11.24 (War Room) extend it.</p>
          <div className="p-6 rounded-2xl glass-card space-y-3">
            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">The 4 Factors</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p><strong className="text-white">Ribbon</strong> Strong = +1, Weak = 0</p>
                <p><strong className="text-white">ADX</strong> \u2265 25 = +1, below = 0</p>
                <p><strong className="text-white">Volume</strong> ratio \u2265 1.0\u00d7 = +1, below = 0 (FX: 1.2\u00d7)</p>
                <p><strong className="text-white">Health</strong> \u2265 50% = +1, below = 0</p>
              </div>
            </div>
            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">The 13-Tag Cascade</p>
              <p className="text-sm text-gray-400 leading-relaxed">Apex (P1-2): Sweep+FVG, Sweep. Mid (P3-9): Breakout, S/R, Trend, OB align, Imbalance, Volume confirm, Structure shift. Low (P10-13): Range, Chop, Counter-trend, No context. First match wins.</p>
            </div>
            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">The 3 Tiers</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p><strong className="text-white">Conviction</strong> 4/4 + apex tag &middot; size 1.5\u00d7</p>
                <p><strong className="text-white">Standard</strong> 3/4 OR (4/4 + mid tag) &middot; size 1.0\u00d7</p>
                <p><strong className="text-white">Watch</strong> \u2264 2/4 OR low-confluence tag &middot; do not engage</p>
              </div>
            </div>
            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">The Trade Plan</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p>Entry: signal close</p>
                <p>SL: Risk Map Auto (structural level)</p>
                <p>TP1/2/3: 1R / 2R / 3R</p>
                <p>Scaling: 50% / 30% / 20%</p>
                <p>BE move: at TP1 hit</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">Real-Time Read</p>
              <p className="text-sm text-gray-400 leading-relaxed">Tier first. 2 seconds. Engage or skip. Deep reads happen in journal review, never mid-session.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S16 — Scenario Game === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">16 &mdash; Scenario Game</p>
          <h2 className="text-2xl font-extrabold mb-4">Read the Synthesis Like an Operator</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Five scenarios. Conviction tier sizing, Standard tier handling, Watch tier discipline, mid-trade execution, and the journal-review lesson. Pick the right call. Explanations appear after every answer, including the wrong ones.</p>
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
                  <p className="text-xs text-gray-400 mt-1">{finalScore >= 4 ? 'Conviction operator-grade. You read the tier, follow the plan, and skip Watch without override.' : finalScore >= 3 ? 'Solid grasp. Re-read the tier ladder (S09), trade plan handoff (S13), and skip discipline (S12) before the quiz.' : 'Re-study the four factors (S02-S05), the cascade (S07), tier sizing (S09), and the six mistakes (S15) before the quiz.'}</p>
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
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 11.22: Cipher Conviction Synthesis</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-sky-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Conviction Operator &mdash;</p>
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
