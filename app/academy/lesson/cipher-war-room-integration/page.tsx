// app/academy/lesson/cipher-war-room-integration/page.tsx
// ATLAS Academy — Lesson 11.24: Cipher War Room Integration [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 11 · CIPHER
// Built to Lesson 11.11 gold standard
// Covers: 4 chart roles + HTF/LTF stack + cross-asset correlation
//         + watchlist discipline + alert architecture + triage protocol
//         + pre-market routine + decision under load + journal + solo vs team
//         + upgrade staircase
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Crown } from 'lucide-react';

// ============================================================
// GAME ROUNDS — 5 scenario-based war room challenges
// String-id answers, per-option explanations
// ============================================================
const gameRounds = [
  {
    id: 'r1',
    scenario:
      'You have 4 charts open: NAS100 (primary), ES (secondary), DXY (reference), and BTC (watch). Three alerts fire within 2 minutes: NAS100-SIGNAL-Long, BTC-LEVEL-Resistance, ES-VOLUME-Spike. You are mid-execution on a NAS100 setup.',
    prompt: 'How do you triage these alerts under the war room protocol?',
    options: [
      {
        id: 'a',
        text: 'Pause execution, evaluate all three alerts in priority order, resume with the strongest setup.',
        correct: false,
        explain:
          'Pausing mid-execution to evaluate other alerts is the analyzing-under-load failure. The NAS100 execution must complete first. After execution, triage in role-priority order: Primary first, then Secondary, then Watch. The BTC alert (Watch role) is the lowest priority by design.',
      },
      {
        id: 'b',
        text: 'Complete NAS100 execution. Then triage: ES-VOLUME (Secondary) first, BTC-LEVEL (Watch) last. Engage / Watch / Skip in 5s each.',
        correct: true,
        explain:
          'Correct. Execution finishes first \u2014 the war room never interrupts an in-flight trade. Then alerts triage by chart role priority: ES is Secondary so it gets first review, BTC-LEVEL is Watch so it goes last. The 5-second triage budget per alert keeps the protocol mechanical rather than analytical.',
      },
      {
        id: 'c',
        text: 'Engage the BTC alert because crypto runs 24/7 and the opportunity is fleeting.',
        correct: false,
        explain:
          'Urgency framing is a discipline trap. BTC is on the Watch chart, which is by definition not where you are spending attention. Engaging a Watch-role alert before Primary or Secondary alerts inverts your own attention budget and breaks the role discipline that defined the war room.',
      },
      {
        id: 'd',
        text: 'Disable the alerts temporarily so you can focus on NAS100.',
        correct: false,
        explain:
          'Disabling alerts mid-session means losing the structural visibility you set up the war room to provide. Better: alerts continue, you triage them after execution completes. The 5-second-per-alert budget is fast enough that triage takes 15 seconds total \u2014 less than the time it would take to disable and re-enable.',
      },
    ],
  },
  {
    id: 'r2',
    scenario:
      'You are reviewing your watchlist after 30 sessions. Asset usage breakdown: NAS100 (12 trades), GBPUSD (8 trades), XAUUSD (5 trades), BTC (2 trades), EURJPY (1 trade), AAPL (0 trades), TSLA (0 trades). Your watchlist has 7 assets total.',
    prompt: 'What does watchlist discipline say to do?',
    options: [
      {
        id: 'a',
        text: 'Keep all 7 \u2014 a diverse watchlist provides optionality.',
        correct: false,
        explain:
          'Optionality without engagement is dead weight. Two assets (AAPL, TSLA) produced zero setups in 30 sessions \u2014 they are noise on your watchlist consuming attention budget. The watchlist discipline rule is: prune assets below 1 setup per week over 30 sessions. AAPL and TSLA both fail.',
      },
      {
        id: 'b',
        text: 'Drop AAPL, TSLA, and EURJPY. Replace them with assets you have been watching that look more active.',
        correct: false,
        explain:
          'EURJPY produced 1 setup in 30 sessions \u2014 borderline by the rule (1/week minimum), but acceptable. The replace-with-three at once approach also breaks the one-in-one-out rule. Better: drop AAPL and TSLA only, replace one at a time, evaluate the replacements over 20-30 sessions before adding more.',
      },
      {
        id: 'c',
        text: 'Drop AAPL and TSLA (both at 0/30 sessions). Watch EURJPY for another 10 sessions before deciding.',
        correct: true,
        explain:
          'Correct. AAPL and TSLA are clearly below threshold (0 setups in 30 sessions = far below 1/week). EURJPY at 1/30 is borderline; the discipline rule is to extend the evaluation window for borderline cases rather than cutting reflexively. Drop the clearly-dead, observe the borderline.',
      },
      {
        id: 'd',
        text: 'Keep all assets but reduce attention to the inactive ones \u2014 attention can be partial.',
        correct: false,
        explain:
          'Partial attention to a chart still consumes monitoring overhead and creates context-switching costs. The watchlist is a binary decision \u2014 actively monitored or not. Splitting attention across 7 assets when only 5 generate edge is the war room failure that L11.24 is designed to prevent.',
      },
    ],
  },
  {
    id: 'r3',
    scenario:
      'You finish a session at 6 PM. P&L is +0.8R across 4 trades (3 wins, 1 loss). You are tired and want to skip the journal tonight \u2014 you tell yourself you will write it tomorrow morning.',
    prompt: 'What does the war room journal protocol say?',
    options: [
      {
        id: 'a',
        text: 'Skip tonight, write tomorrow \u2014 fatigue makes the entry unreliable anyway.',
        correct: false,
        explain:
          'This is mistake five from section fifteen. The journal entry written tomorrow has lost the in-the-moment context that makes journals valuable. Tomorrow you will write what you remember, which is a sanitized version of what actually happened. The 10-minute review must happen tonight.',
      },
      {
        id: 'b',
        text: 'Write the journal now, even tired \u2014 in-the-moment context is non-negotiable.',
        correct: true,
        explain:
          'Correct. The journal protocol is non-negotiable end-of-session. The 10 minutes of session-end review are the cheapest, highest-leverage discipline in the war room. Skipping because you are tired is exactly when you most need the structure \u2014 fatigued operators are the ones who repeat mistakes most often, and the journal catches them.',
      },
      {
        id: 'c',
        text: 'Write only the trades that lost \u2014 wins do not need journaling.',
        correct: false,
        explain:
          'The skipped-trades and winning-trades entries are equally important. Journals that only catalogue losses build a self-narrative of failure and skew lessons toward defensiveness. The framework explicitly requires journaling all trades \u2014 wins, losses, and skipped setups.',
      },
      {
        id: 'd',
        text: 'Voice-memo the highlights now, transcribe to journal tomorrow.',
        correct: false,
        explain:
          'Voice memos lose the structured fields (entry/exit reasons, protocol adherence, pattern observations) that make journals operationally useful. The journal format exists because freeform recall is unreliable. A voice memo is closer to "tomorrow morning rewrite" than to in-the-moment journaling.',
      },
    ],
  },
  {
    id: 'r4',
    scenario:
      'You currently run 1 chart (NAS100 only) and have stable +0.5R/session over 40 sessions. You are tempted to upgrade to 4 charts to "scale the edge."',
    prompt: 'What does the upgrade staircase say?',
    options: [
      {
        id: 'a',
        text: 'Jump straight to 4 charts \u2014 your edge is proven, scale fast.',
        correct: false,
        explain:
          'Skipping stages is mistake six from section fifteen. The staircase is 1 \u2192 2 \u2192 4 \u2192 6 charts with 20-50 sessions per stage. Going from 1 to 4 in one move means doubling your cognitive load twice without the intermediate calibration that builds the multi-chart discipline. Operators who skip stages crash within 10-15 sessions.',
      },
      {
        id: 'b',
        text: 'Go to 2 charts (primary + reference) for 20-50 sessions, evaluate, then consider 4.',
        correct: true,
        explain:
          'Correct. The staircase upgrade rule is one stage at a time, 20-50 sessions per stage. From 1 chart, the next stage is 2 (primary + reference). Reference is read-only context, low cognitive load, perfect for the first multi-chart adaptation. Spend 20-50 sessions there, evaluate honestly, then move to 4 charts only if the 2-chart phase is clean.',
      },
      {
        id: 'c',
        text: 'Stay at 1 chart \u2014 if 1 works, do not break it.',
        correct: false,
        explain:
          'Stagnation is not the framework recommendation. The staircase exists because operators systematically benefit from upgrading attention surface as their discipline matures. Refusing to upgrade locks you out of the scaling that the framework promises. Upgrade carefully, do not refuse to upgrade.',
      },
      {
        id: 'd',
        text: 'Go to 6 charts to test your maximum capacity.',
        correct: false,
        explain:
          'The framework explicitly warns against maximum-capacity testing. You upgrade because you have proven the previous stage, not to find your ceiling by failing. 6 charts is for operators who have completed the 4-chart stage successfully. From 1 chart, jumping to 6 is reckless.',
      },
    ],
  },
  {
    id: 'r5',
    scenario:
      'It is 8:55 AM. You sit down at your desk for a 9 AM session. You feel rushed and consider skipping the pre-market routine to save time.',
    prompt: 'What is the right call?',
    options: [
      {
        id: 'a',
        text: 'Skip the routine \u2014 you have done 100 sessions, you can read the market cold.',
        correct: false,
        explain:
          'This is mistake one from section fifteen. Skipping pre-market routine is what failed operators do. The 15-minute routine is not optional \u2014 it covers overnight news scan, chart role review, alert verification, HTF read, and mental state check. Skipping it means entering the session blind to the macro context that determines which signals to trust today.',
      },
      {
        id: 'b',
        text: 'Compress the 15-minute routine into 5 minutes by skipping the news scan.',
        correct: false,
        explain:
          'The news scan is one of the highest-leverage parts of the routine. A central bank announcement, an earnings beat or miss, a geopolitical event \u2014 any of these reshape the day completely. Skipping the news scan to save time is skipping the part that prevents you from trading into a buzzsaw.',
      },
      {
        id: 'c',
        text: 'Sit out the first 30 minutes of the session, do the routine properly, then engage.',
        correct: true,
        explain:
          'Correct. If you cannot do the pre-market routine before the session, the right move is not to engage at the open. Sit out the first 30 minutes, do the full routine, then engage with the rest of the session. Missing 30 minutes of opportunity is a smaller cost than trading without the macro context the routine builds.',
      },
      {
        id: 'd',
        text: 'Engage immediately and do the routine in real-time as you trade.',
        correct: false,
        explain:
          'Real-time routine + execution is the analyzing-under-load failure mode. The routine builds context that informs execution decisions. Doing both simultaneously means execution decisions are made without that context. The routine must complete before execution begins.',
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
    question: 'In the general war room calibrated for the prosumer trader, how many active charts are typical?',
    options: [
      { id: 'a', text: '1 to 2', correct: false },
      { id: 'b', text: '4 to 6', correct: true },
      { id: 'c', text: '8 to 12', correct: false },
      { id: 'd', text: '16+', correct: false },
    ],
    explain:
      'The general war room runs 4-6 charts across 1-2 monitors. Below 4 means you are still in the upgrade staircase. Above 6 means you are running an institutional setup that breaks the prosumer attention budget. 4-6 is the sweet spot for solo operators with mature discipline.',
  },
  {
    id: 'q2',
    question: 'What is the attention-budget allocation for the four chart roles?',
    options: [
      { id: 'a', text: 'Equal 25% each.', correct: false },
      { id: 'b', text: 'Primary 50%, Secondary 25%, Watch 15%, Reference 10%.', correct: true },
      { id: 'c', text: 'Primary 80%, everything else 20%.', correct: false },
      { id: 'd', text: 'It depends on the day, no fixed allocation.', correct: false },
    ],
    explain:
      'Primary 50% (where you actively trade), Secondary 25% (correlated alternative or co-pilot), Watch 15% (alerted-only setups), Reference 10% (context-only \u2014 DXY for FX, VIX for equities, BTC for alts). Total 100%. Equal allocation breaks the priority discipline that makes triage work.',
  },
  {
    id: 'q3',
    question: 'In the HTF/LTF stack, which timeframes constitute the standard four-tier hierarchy?',
    options: [
      { id: 'a', text: '1D / 4H / 1H / 15m', correct: false },
      { id: 'b', text: '4H / 1H / 15m / 5m', correct: true },
      { id: 'c', text: '1W / 1D / 4H / 1H', correct: false },
      { id: 'd', text: '1H / 30m / 15m / 5m', correct: false },
    ],
    explain:
      'The standard stack is 4H macro, 1H setup, 15m timing, 5m execution. Read top-down. When all four agree on direction and structure, the setup has cascading confirmation \u2014 the strongest engagement signal in the framework. Deviations exist for swing (1W/1D/4H/1H) and scalping (1H/15m/5m/1m), but 4H/1H/15m/5m is the prosumer default.',
  },
  {
    id: 'q4',
    question: 'What is the pruning rule for watchlist assets?',
    options: [
      { id: 'a', text: 'Drop any asset that loses 2 trades in a row.', correct: false },
      { id: 'b', text: 'Drop assets producing fewer than 1 setup per week over 30 sessions.', correct: true },
      { id: 'c', text: 'Never drop \u2014 once added, always monitored.', correct: false },
      { id: 'd', text: 'Rotate the entire watchlist every 30 days.', correct: false },
    ],
    explain:
      'The pruning rule is throughput-based, not P&L-based. An asset that generates fewer than 1 setup per week over a 30-session window is consuming attention budget without generating engagement opportunities. Drop it. Replace one in, one out. Re-evaluate the replacement over 20-30 sessions.',
  },
  {
    id: 'q5',
    question: 'What is the alert triage time budget per alert?',
    options: [
      { id: 'a', text: '30 seconds', correct: false },
      { id: 'b', text: '5 seconds', correct: true },
      { id: 'c', text: '60 seconds', correct: false },
      { id: 'd', text: 'As long as needed to evaluate fully.', correct: false },
    ],
    explain:
      '5 seconds per alert. Engage / Watch / Skip in three categorical bins. The short budget exists because alert triage must be mechanical, not analytical. Operators who spend 30+ seconds evaluating each alert are doing analysis, which fails under load. The 5-second budget is achievable when the alert is well-named and the chart role is clear.',
  },
  {
    id: 'q6',
    question: 'How long is the standard pre-market routine?',
    options: [
      { id: 'a', text: '5 minutes', correct: false },
      { id: 'b', text: '15 minutes', correct: true },
      { id: 'c', text: '30 minutes', correct: false },
      { id: 'd', text: '60 minutes', correct: false },
    ],
    explain:
      '15 minutes covering overnight news scan, chart role review, alert verification, HTF read, and mental state check. Below 15 minutes you cannot properly cover all five elements. Above 15 minutes you are over-prepping and will be mentally fatigued before the session begins. 15 minutes is calibrated for prosumer schedules.',
  },
  {
    id: 'q7',
    question: 'In the upgrade staircase, what is the recommended progression for chart count?',
    options: [
      { id: 'a', text: '1 \u2192 4 \u2192 8 \u2192 16', correct: false },
      { id: 'b', text: '1 \u2192 2 \u2192 4 \u2192 6', correct: true },
      { id: 'c', text: '2 \u2192 4 \u2192 6 \u2192 8', correct: false },
      { id: 'd', text: '1 \u2192 3 \u2192 5 \u2192 7', correct: false },
    ],
    explain:
      'Start at 1 chart (Primary only). Stage 2 adds Reference (read-only context, low cognitive load). Stage 3 adds Secondary and Watch (4 charts total). Stage 4 adds the HTF stack (6 charts). 20-50 sessions per stage. Skipping stages breaks calibration; downgrade if struggling at the current stage.',
  },
  {
    id: 'q8',
    question: 'What is the war room\u2019s rule on solo vs team workflow?',
    options: [
      { id: 'a', text: 'Always work in teams \u2014 multiple operators reduce blind spots.', correct: false },
      { id: 'b', text: 'Solo by default; two-of-two when partners cover different surfaces; decision authority stays individual.', correct: true },
      { id: 'c', text: 'Team-of-three or larger to maximize coverage.', correct: false },
      { id: 'd', text: 'Always solo \u2014 teams introduce groupthink.', correct: false },
    ],
    explain:
      'Solo by default because decision speed and accountability are higher solo. Two-of-two is the sweet spot when partners cover non-overlapping surfaces (one watches FX, one watches indices). Decision authority always stays individual \u2014 even in teams, no setup is engaged by committee. Three-or-more breaks the cognitive coherence of the war room.',
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
// Theme: workflow, charts, timeframes, alerts, journals
// ============================================================

// A1 — WorkflowVsSignalAnim (S01) — two operators, identical signals, different P&L
function WorkflowVsSignalAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 9.0;
    const tt = (t % T) / T;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SAME SIGNALS \u2014 DIFFERENT P&L', w / 2, 22);
    const panelW = (w - 50) / 2;
    const panelH = h - 80;
    const panelTop = 44;
    // Left panel: chaotic operator
    const leftX = 20;
    ctx.fillStyle = 'rgba(239, 83, 80, 0.05)';
    ctx.fillRect(leftX, panelTop, panelW, panelH);
    ctx.strokeStyle = 'rgba(239, 83, 80, 0.30)';
    ctx.lineWidth = 1;
    ctx.strokeRect(leftX, panelTop, panelW, panelH);
    ctx.fillStyle = '#EF5350';
    ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
    ctx.fillText('OPERATOR A \u2014 NO PROTOCOL', leftX + panelW / 2, panelTop + 18);
    // Right panel: protocol operator
    const rightX = leftX + panelW + 10;
    ctx.fillStyle = 'rgba(38, 166, 154, 0.05)';
    ctx.fillRect(rightX, panelTop, panelW, panelH);
    ctx.strokeStyle = 'rgba(38, 166, 154, 0.30)';
    ctx.strokeRect(rightX, panelTop, panelW, panelH);
    ctx.fillStyle = '#26A69A';
    ctx.fillText('OPERATOR B \u2014 WAR ROOM', rightX + panelW / 2, panelTop + 18);
    // Equity curves
    const curveTop = panelTop + 35;
    const curveBot = panelTop + panelH - 25;
    const reveal = Math.min(1, tt * 1.2);
    const nPoints = 40;
    // Operator A: noisy, drawdown
    ctx.strokeStyle = '#EF5350';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    for (let i = 0; i < Math.floor(nPoints * reveal); i++) {
      const px = leftX + 12 + (i / (nPoints - 1)) * (panelW - 24);
      const noise = Math.sin(i * 0.7) * 8 + Math.cos(i * 1.3) * 5;
      const trend = -i * 0.4 + noise;
      const py = curveTop + (panelH - 60) / 2 - trend;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    // Operator B: smoother, uptrend
    ctx.strokeStyle = '#26A69A';
    ctx.beginPath();
    for (let i = 0; i < Math.floor(nPoints * reveal); i++) {
      const px = rightX + 12 + (i / (nPoints - 1)) * (panelW - 24);
      const noise = Math.sin(i * 0.5) * 3;
      const trend = i * 0.55 + noise;
      const py = curveTop + (panelH - 60) / 2 - trend;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    if (tt > 0.85) {
      const fade = Math.min(1, (tt - 0.85) / 0.10);
      ctx.fillStyle = `rgba(239, 83, 80, ${fade})`;
      ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
      ctx.fillText('-12R', leftX + panelW / 2, panelTop + panelH - 10);
      ctx.fillStyle = `rgba(38, 166, 154, ${fade})`;
      ctx.fillText('+18R', rightX + panelW / 2, panelTop + panelH - 10);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.fillText('The desk choreography IS the edge.', w / 2, h - 10);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// A2 — WarRoomLayoutAnim (S02) — 4 chart panels in a 2x2 grid
function WarRoomLayoutAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 8.0;
    const tt = (t % T) / T;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE GENERAL WAR ROOM', w / 2, 22);
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.fillText('4 charts \u2014 2 monitors \u2014 prosumer scale', w / 2, 38);
    const grid = [
      { label: 'PRIMARY', sub: 'NAS100 5m', color: '#26A69A', share: 50 },
      { label: 'SECONDARY', sub: 'ES 5m', color: '#FFB300', share: 25 },
      { label: 'WATCH', sub: 'BTC 15m', color: 'rgba(255,255,255,0.6)', share: 15 },
      { label: 'REFERENCE', sub: 'DXY 1H', color: 'rgba(255,255,255,0.4)', share: 10 },
    ];
    const cellW = (w - 50) / 2;
    const cellH = (h - 100) / 2;
    const startX = 25;
    const startY = 50;
    grid.forEach((cell, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = startX + col * (cellW + 8);
      const y = startY + row * (cellH + 8);
      const reveal = Math.min(1, Math.max(0, (tt - i * 0.10) / 0.15));
      ctx.globalAlpha = reveal;
      ctx.fillStyle = `${cell.color}10`;
      ctx.fillRect(x, y, cellW, cellH);
      ctx.strokeStyle = cell.color;
      ctx.lineWidth = i === 0 ? 2 : 1;
      ctx.strokeRect(x, y, cellW, cellH);
      ctx.fillStyle = cell.color;
      ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(cell.label, x + 8, y + 16);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '9px system-ui, -apple-system, sans-serif';
      ctx.fillText(cell.sub, x + 8, y + 30);
      // Mini candle silhouettes
      const candleY = y + cellH - 40;
      const candleAreaW = cellW - 16;
      const candleAreaH = 28;
      const nC = 14;
      const cwBar = candleAreaW / nC;
      for (let j = 0; j < nC; j++) {
        const seed = Math.sin(j * 1.7 + i * 2.3) * 8 + 6;
        const cBar = candleY + candleAreaH / 2 - Math.abs(seed);
        ctx.fillStyle = cell.color;
        ctx.fillRect(x + 8 + j * cwBar + cwBar * 0.2, cBar, cwBar * 0.6, Math.abs(seed) * 1.5);
      }
      // Attention badge
      ctx.fillStyle = `${cell.color}40`;
      ctx.fillRect(x + cellW - 38, y + 6, 32, 14);
      ctx.fillStyle = cell.color;
      ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${cell.share}%`, x + cellW - 22, y + 16);
      ctx.globalAlpha = 1;
    });
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// A3 — ChartRolesAnim (S03) — 4 horizontal role bars cycling
function ChartRolesAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 12.0;
    const tt = (t % T) / T;
    const idx = Math.floor(tt * 4);
    const localT = (tt * 4) % 1;
    const roles = [
      { name: 'PRIMARY', share: 50, color: '#26A69A', desc: 'Active engagement \u2014 you trade here' },
      { name: 'SECONDARY', share: 25, color: '#FFB300', desc: 'Co-pilot \u2014 correlated alternative or alt setup' },
      { name: 'WATCH', share: 15, color: 'rgba(255,255,255,0.7)', desc: 'Alerted-only \u2014 setups that wake you up' },
      { name: 'REFERENCE', share: 10, color: 'rgba(255,255,255,0.5)', desc: 'Context-only \u2014 DXY/VIX/BTC for cross-asset read' },
    ];
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CHART ROLES', w / 2, 18);
    const r = roles[idx];
    ctx.fillStyle = r.color;
    ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
    ctx.fillText(r.name, w / 2, 40);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '11px system-ui, -apple-system, sans-serif';
    ctx.fillText(r.desc, w / 2, 58);
    // Stacked bar showing all 4 shares
    const barX = 30;
    const barW = w - 60;
    const barY = 80;
    const barH = 30;
    let cumX = barX;
    roles.forEach((rr, i) => {
      const segW = (rr.share / 100) * barW;
      const isActive = i === idx;
      ctx.fillStyle = isActive ? rr.color : `${rr.color.startsWith('rgba') ? rr.color.replace(/[\d.]+\)$/, '0.15)') : rr.color + '30'}`;
      ctx.fillRect(cumX, barY, segW, barH);
      ctx.strokeStyle = isActive ? '#FFFFFF' : 'transparent';
      ctx.lineWidth = isActive ? 1.5 : 0;
      if (isActive) ctx.strokeRect(cumX, barY, segW, barH);
      ctx.fillStyle = isActive ? '#FFFFFF' : (rr.color.startsWith('rgba') ? rr.color : 'rgba(255,255,255,0.85)');
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${rr.share}%`, cumX + segW / 2, barY + barH / 2 + 4);
      cumX += segW;
    });
    // 4 mini cards below
    const cardW = (w - 50) / 4;
    const cardY = barY + barH + 22;
    const cardH = h - cardY - 30;
    roles.forEach((rr, i) => {
      const cardX = 25 + i * (cardW + 4);
      const isActive = i === idx;
      ctx.fillStyle = isActive ? `${rr.color}20` : 'rgba(255,255,255,0.02)';
      ctx.fillRect(cardX, cardY, cardW - 4, cardH);
      ctx.strokeStyle = isActive ? rr.color : 'rgba(255,255,255,0.08)';
      ctx.lineWidth = isActive ? 1.5 : 1;
      ctx.strokeRect(cardX, cardY, cardW - 4, cardH);
      ctx.fillStyle = isActive ? rr.color : 'rgba(255,255,255,0.45)';
      ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(rr.name, cardX + (cardW - 4) / 2, cardY + 16);
      ctx.fillStyle = isActive ? '#FFFFFF' : 'rgba(255,255,255,0.3)';
      ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
      ctx.fillText(`${rr.share}%`, cardX + (cardW - 4) / 2, cardY + cardH / 2 + 6);
    });
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// A4 — TimeframeStackAnim (S04) — 4 timeframe levels cascading
function TimeframeStackAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 9.0;
    const tt = (t % T) / T;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE HTF/LTF STACK', w / 2, 22);
    const levels = [
      { tf: '4H', purpose: 'MACRO', dir: 'BULL', color: '#26A69A' },
      { tf: '1H', purpose: 'SETUP', dir: 'BULL', color: '#26A69A' },
      { tf: '15m', purpose: 'TIMING', dir: 'BULL', color: '#26A69A' },
      { tf: '5m', purpose: 'EXECUTION', dir: 'BULL', color: '#26A69A' },
    ];
    const startY = 50;
    const rowH = (h - 90) / 4;
    levels.forEach((lvl, i) => {
      const reveal = Math.min(1, Math.max(0, (tt - i * 0.18) / 0.20));
      if (reveal <= 0) return;
      const y = startY + i * rowH;
      ctx.globalAlpha = reveal;
      // Row background
      ctx.fillStyle = `${lvl.color}10`;
      ctx.fillRect(20, y, w - 40, rowH - 6);
      ctx.strokeStyle = `${lvl.color}40`;
      ctx.lineWidth = 1;
      ctx.strokeRect(20, y, w - 40, rowH - 6);
      // TF label
      ctx.fillStyle = lvl.color;
      ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(lvl.tf, 36, y + rowH / 2 + 6);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '9px system-ui, -apple-system, sans-serif';
      ctx.fillText(lvl.purpose, 36, y + rowH / 2 + 22);
      // Mini candles
      const cArea = { x: 100, y: y + 8, w: w - 200, h: rowH - 22 };
      const nC = 20;
      const cwBar = cArea.w / nC;
      for (let j = 0; j < nC; j++) {
        const variance = Math.sin(j * 1.3 + i * 0.7) * 12;
        const trend = -j * 0.6 - i * 1.2;
        const cyMid = cArea.y + cArea.h / 2 + variance + trend * 0.3;
        const bodyH = 4 + Math.abs(Math.sin(j * 0.9 + i)) * 8;
        ctx.fillStyle = lvl.color;
        ctx.fillRect(cArea.x + j * cwBar + cwBar * 0.25, cyMid - bodyH / 2, cwBar * 0.5, bodyH);
      }
      // Direction badge
      ctx.fillStyle = `${lvl.color}40`;
      ctx.fillRect(w - 80, y + rowH / 2 - 12, 60, 22);
      ctx.fillStyle = lvl.color;
      ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('\u25B2 ' + lvl.dir, w - 50, y + rowH / 2 + 3);
      ctx.globalAlpha = 1;
    });
    if (tt > 0.85) {
      const fade = Math.min(1, (tt - 0.85) / 0.10);
      ctx.fillStyle = `rgba(255, 179, 0, ${fade})`;
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('All four agree \u2192 cascading confirmation', w / 2, h - 10);
    }
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// A5 — CorrelationPairAnim (S05) — primary + reference asset agreeing/diverging
function CorrelationPairAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 12.0;
    const tt = (t % T) / T;
    const phases = [
      { name: 'AGREEMENT', primaryDir: 1, refDir: 1, color: '#26A69A', read: 'Cross-asset confirms \u2014 size up' },
      { name: 'DIVERGENCE', primaryDir: 1, refDir: -1, color: '#EF5350', read: 'Cross-asset disagrees \u2014 reduce or skip' },
    ];
    const idx = Math.floor(tt * 2);
    const p = phases[idx];
    const localT = (tt * 2) % 1;
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CROSS-ASSET CORRELATION', w / 2, 18);
    ctx.fillStyle = p.color;
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.fillText(p.name, w / 2, 38);
    const panelW = (w - 50) / 2;
    const panelTop = 56;
    const panelH = h - 130;
    // Primary panel
    ctx.fillStyle = 'rgba(38, 166, 154, 0.05)';
    ctx.fillRect(20, panelTop, panelW, panelH);
    ctx.strokeStyle = 'rgba(38, 166, 154, 0.30)';
    ctx.strokeRect(20, panelTop, panelW, panelH);
    ctx.fillStyle = '#26A69A';
    ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
    ctx.fillText('PRIMARY \u2014 NAS100', 20 + panelW / 2, panelTop + 16);
    // Reference panel
    const refX = 30 + panelW;
    ctx.fillStyle = 'rgba(255, 179, 0, 0.05)';
    ctx.fillRect(refX, panelTop, panelW, panelH);
    ctx.strokeStyle = 'rgba(255, 179, 0, 0.30)';
    ctx.strokeRect(refX, panelTop, panelW, panelH);
    ctx.fillStyle = '#FFB300';
    ctx.fillText('REFERENCE \u2014 DXY (inverted)', refX + panelW / 2, panelTop + 16);
    // Curves
    const reveal = Math.min(1, localT * 1.3);
    const nPoints = 30;
    const drawCurve = (x: number, color: string, dir: number) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      const cTop = panelTop + 30;
      const cBot = panelTop + panelH - 16;
      for (let i = 0; i < Math.floor(nPoints * reveal); i++) {
        const px = x + 12 + (i / (nPoints - 1)) * (panelW - 24);
        const trend = (i / (nPoints - 1)) * (cBot - cTop) * 0.6 * dir;
        const noise = Math.sin(i * 0.6) * 4;
        const py = (cTop + cBot) / 2 - trend + noise;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    };
    drawCurve(20, '#26A69A', p.primaryDir);
    drawCurve(refX, '#FFB300', p.refDir);
    // Read line
    if (localT > 0.6) {
      const fade = Math.min(1, (localT - 0.6) / 0.20);
      const ry = h - 50;
      ctx.fillStyle = `${p.color}15`;
      ctx.fillRect(0, ry, w, 30);
      ctx.fillStyle = `rgba(${p.color === '#26A69A' ? '38, 166, 154' : '239, 83, 80'}, ${fade})`;
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(p.read, w / 2, ry + 19);
    }
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// A6 — WatchlistPruneAnim (S06) — 7 assets, weak ones drop off
function WatchlistPruneAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 11.0;
    const tt = (t % T) / T;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('WATCHLIST DISCIPLINE', w / 2, 22);
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.fillText('Drop assets below 1 setup/week over 30 sessions', w / 2, 38);
    const assets = [
      { sym: 'NAS100', setups: 12, alive: true },
      { sym: 'GBPUSD', setups: 8, alive: true },
      { sym: 'XAUUSD', setups: 5, alive: true },
      { sym: 'BTCUSD', setups: 4, alive: true },
      { sym: 'EURJPY', setups: 1, alive: true },
      { sym: 'AAPL', setups: 0, alive: false },
      { sym: 'TSLA', setups: 0, alive: false },
    ];
    const maxSetups = 12;
    const rowH = 28;
    const startY = 56;
    const rowW = w - 80;
    assets.forEach((a, i) => {
      const reveal = Math.min(1, Math.max(0, (tt - i * 0.07) / 0.15));
      if (reveal <= 0) return;
      const y = startY + i * rowH;
      // Compute drop-off animation
      const dropStart = 0.65;
      const isDropping = !a.alive && tt > dropStart;
      const dropT = isDropping ? Math.min(1, (tt - dropStart) / 0.25) : 0;
      ctx.globalAlpha = reveal * (1 - dropT * 0.6);
      const xOffset = dropT * 60;
      // Symbol label
      ctx.fillStyle = a.alive ? 'rgba(255,255,255,0.85)' : 'rgba(239, 83, 80, 0.7)';
      ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(a.sym, 40 - xOffset, y + 14);
      // Setup count bar
      const barX = 100;
      const barW = rowW - 120;
      const fillW = (a.setups / maxSetups) * barW;
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.fillRect(barX, y + 4, barW, 14);
      ctx.fillStyle = a.alive ? '#26A69A' : '#EF5350';
      ctx.fillRect(barX, y + 4, fillW, 14);
      // Count text
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '9px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${a.setups} setups / 30 sessions`, barX + barW - 6, y + 14);
      // Drop X marker
      if (isDropping && dropT > 0.3) {
        const xFade = Math.min(1, (dropT - 0.3) / 0.30);
        ctx.fillStyle = `rgba(239, 83, 80, ${xFade})`;
        ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('\u2717', w - 30, y + 16);
      }
      ctx.globalAlpha = 1;
    });
    // Threshold line
    ctx.strokeStyle = 'rgba(255, 179, 0, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    const thresholdX = 100 + (4 / maxSetups) * (w - 200);
    ctx.beginPath();
    ctx.moveTo(thresholdX, startY - 4);
    ctx.lineTo(thresholdX, startY + 7 * rowH - 8);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255, 179, 0, 0.7)';
    ctx.font = '8px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('threshold (1/week)', thresholdX + 4, startY - 8);
  }, []);
  return <AnimScene draw={draw} aspectRatio={4 / 3} />;
}

// A7 — AlertArchitectureAnim (S07) — 4 alert categories with naming format
function AlertArchitectureAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 12.0;
    const tt = (t % T) / T;
    const cats = [
      { name: 'SIGNAL', color: '#26A69A', example: 'NAS100-SIGNAL-PulseLong' },
      { name: 'LEVEL', color: '#FFB300', example: 'GBPUSD-LEVEL-Resistance' },
      { name: 'VOLUME', color: '#EF5350', example: 'ES-VOLUME-Spike' },
      { name: 'REGIME', color: 'rgba(255,255,255,0.7)', example: 'XAU-REGIME-Shift' },
    ];
    const idx = Math.floor(tt * 4);
    const localT = (tt * 4) % 1;
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ALERT ARCHITECTURE', w / 2, 18);
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.fillText('4 categories \u2014 ASSET-CATEGORY-DETAIL', w / 2, 38);
    // 4 category cards in 2x2 grid
    const cardW = (w - 50) / 2;
    const cardH = (h - 100) / 2;
    const startX = 25;
    const startY = 56;
    cats.forEach((cat, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = startX + col * (cardW + 4);
      const y = startY + row * (cardH + 4);
      const isActive = i === idx;
      ctx.fillStyle = isActive ? `${cat.color}20` : 'rgba(255,255,255,0.03)';
      ctx.fillRect(x, y, cardW, cardH);
      ctx.strokeStyle = isActive ? cat.color : 'rgba(255,255,255,0.10)';
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.strokeRect(x, y, cardW, cardH);
      ctx.fillStyle = cat.color;
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(cat.name, x + cardW / 2, y + 22);
      // Example alert pill
      if (isActive && localT > 0.2) {
        const fade = Math.min(1, (localT - 0.2) / 0.20);
        const pillY = y + cardH / 2 + 4;
        const pillW = cardW - 24;
        const pillX = x + 12;
        ctx.fillStyle = `${cat.color}40`;
        ctx.globalAlpha = fade;
        ctx.fillRect(pillX, pillY, pillW, 22);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px monospace, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(cat.example, pillX + pillW / 2, pillY + 14);
        ctx.globalAlpha = 1;
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = '9px monospace, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(cat.example, x + cardW / 2, y + cardH / 2 + 14);
      }
    });
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('5 to 15 active alerts. More than that = noise.', w / 2, h - 10);
  }, []);
  return <AnimScene draw={draw} aspectRatio={4 / 3} />;
}

// A8 — TriageStormAnim (S08) — 3 alerts hit, get triaged in priority order
function TriageStormAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 10.0;
    const tt = (t % T) / T;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE 5-SECOND TRIAGE', w / 2, 22);
    const alerts = [
      { src: 'NAS100-SIGNAL', role: 'PRIMARY', verdict: 'ENGAGE', color: '#26A69A', priority: 1 },
      { src: 'ES-VOLUME', role: 'SECONDARY', verdict: 'WATCH', color: '#FFB300', priority: 2 },
      { src: 'BTC-LEVEL', role: 'WATCH', verdict: 'SKIP', color: 'rgba(255,255,255,0.5)', priority: 3 },
    ];
    const sortedAlerts = [...alerts].sort((a, b) => a.priority - b.priority);
    const allArrived = tt > 0.30;
    const sortStart = 0.40;
    const sortDuration = 0.20;
    const verdictStart = 0.65;
    const lineH = 38;
    const startY = 60;
    const lineW = w - 60;
    sortedAlerts.forEach((al, i) => {
      const arriveStart = i * 0.10;
      const arrived = tt > arriveStart;
      if (!arrived) return;
      const fade = Math.min(1, (tt - arriveStart) / 0.10);
      const sortedY = startY + i * lineH;
      const initialY = startY + (alerts.findIndex(a => a.src === al.src)) * lineH;
      const sortT = Math.min(1, Math.max(0, (tt - sortStart) / sortDuration));
      const y = initialY + (sortedY - initialY) * sortT;
      const x = 30;
      ctx.globalAlpha = fade;
      // Row bg
      ctx.fillStyle = `${al.color}10`;
      ctx.fillRect(x, y, lineW, lineH - 6);
      ctx.strokeStyle = `${al.color}40`;
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, lineW, lineH - 6);
      // Priority number
      ctx.fillStyle = al.color;
      ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${al.priority}`, x + 12, y + 22);
      // Source
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = 'bold 10px monospace, monospace';
      ctx.fillText(al.src, x + 36, y + 14);
      // Role
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '9px system-ui, -apple-system, sans-serif';
      ctx.fillText(al.role, x + 36, y + 28);
      // Verdict
      if (tt > verdictStart) {
        const vFade = Math.min(1, (tt - verdictStart - i * 0.07) / 0.10);
        if (vFade > 0) {
          const vX = x + lineW - 96;
          const vW = 88;
          ctx.fillStyle = al.color;
          ctx.globalAlpha = fade * vFade;
          ctx.fillRect(vX, y + 8, vW, 18);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(al.verdict, vX + vW / 2, y + 21);
        }
      }
      ctx.globalAlpha = 1;
    });
    if (tt > 0.85) {
      const fade = Math.min(1, (tt - 0.85) / 0.10);
      ctx.fillStyle = `rgba(255, 179, 0, ${fade})`;
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Engage / Watch / Skip in 5 seconds each.', w / 2, h - 12);
    }
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// A9 — SessionTimelineAnim (S09) — pre-market routine 5-step timeline
function SessionTimelineAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 10.0;
    const tt = (t % T) / T;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PRE-MARKET ROUTINE \u2014 15 MINUTES', w / 2, 22);
    const steps = [
      { mins: 3, label: 'NEWS SCAN', color: '#26A69A' },
      { mins: 3, label: 'CHART ROLES', color: '#FFB300' },
      { mins: 3, label: 'ALERTS', color: '#EF5350' },
      { mins: 3, label: 'HTF READ', color: 'rgba(155, 220, 255, 0.9)' },
      { mins: 3, label: 'MENTAL CHECK', color: 'rgba(255,255,255,0.7)' },
    ];
    const totalMins = 15;
    const lineY = h / 2 - 10;
    const lineX = 30;
    const lineW = w - 60;
    // Background line
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(lineX, lineY, lineW, 30);
    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.strokeRect(lineX, lineY, lineW, 30);
    // Segments
    let cumX = lineX;
    steps.forEach((step, i) => {
      const segW = (step.mins / totalMins) * lineW;
      const reveal = Math.min(1, Math.max(0, (tt - i * 0.14) / 0.14));
      if (reveal <= 0) {
        cumX += segW;
        return;
      }
      ctx.globalAlpha = reveal;
      ctx.fillStyle = step.color;
      ctx.fillRect(cumX, lineY, segW * reveal, 30);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cumX, lineY);
      ctx.lineTo(cumX, lineY + 30);
      ctx.stroke();
      // Label above
      ctx.fillStyle = step.color;
      ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(step.label, cumX + segW / 2, lineY - 8);
      // Mins below
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '9px system-ui, -apple-system, sans-serif';
      ctx.fillText(`${step.mins}m`, cumX + segW / 2, lineY + 50);
      ctx.globalAlpha = 1;
      cumX += segW;
    });
    // Time labels at ends
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('T - 15min', lineX, lineY + 76);
    ctx.textAlign = 'right';
    ctx.fillText('SESSION OPEN', lineX + lineW, lineY + 76);
    // Open marker
    if (tt > 0.85) {
      const fade = Math.min(1, (tt - 0.85) / 0.10);
      ctx.fillStyle = `rgba(38, 166, 154, ${fade})`;
      ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('\u25B6', lineX + lineW + 14, lineY + 22);
    }
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// A10 — DecisionUnderLoadAnim (S11) — 4-step decision protocol cascading
function DecisionUnderLoadAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 10.0;
    const tt = (t % T) / T;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DECISION PROTOCOL UNDER LOAD', w / 2, 22);
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.fillText('Mechanical routing beats deep analysis', w / 2, 38);
    const steps = [
      { num: 1, label: 'PRIORITY', desc: 'Which chart role fired?' },
      { num: 2, label: 'CAPACITY', desc: 'Are you mid-execution?' },
      { num: 3, label: 'QUALIFY', desc: 'Conviction \u2265 threshold?' },
      { num: 4, label: 'EXECUTE', desc: 'Per L11.22 trade plan' },
    ];
    const boxW = (w - 80) / 4;
    const boxH = h - 100;
    const startX = 40;
    const startY = 56;
    steps.forEach((step, i) => {
      const arriveStart = i * 0.18;
      const reveal = Math.min(1, Math.max(0, (tt - arriveStart) / 0.18));
      if (reveal <= 0) return;
      const x = startX + i * (boxW + 8);
      ctx.globalAlpha = reveal;
      ctx.fillStyle = 'rgba(38, 166, 154, 0.10)';
      ctx.fillRect(x, startY, boxW, boxH);
      ctx.strokeStyle = '#26A69A';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, startY, boxW, boxH);
      // Number circle
      ctx.fillStyle = '#26A69A';
      ctx.beginPath();
      ctx.arc(x + boxW / 2, startY + 32, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${step.num}`, x + boxW / 2, startY + 38);
      // Label
      ctx.fillStyle = '#26A69A';
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.fillText(step.label, x + boxW / 2, startY + 70);
      // Desc - wrap
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '9px system-ui, -apple-system, sans-serif';
      const words = step.desc.split(' ');
      const half = Math.ceil(words.length / 2);
      ctx.fillText(words.slice(0, half).join(' '), x + boxW / 2, startY + boxH - 28);
      ctx.fillText(words.slice(half).join(' '), x + boxW / 2, startY + boxH - 14);
      ctx.globalAlpha = 1;
      // Arrow to next
      if (i < 3 && reveal > 0.7) {
        const arrowFade = Math.min(1, (reveal - 0.7) / 0.30);
        ctx.fillStyle = `rgba(255, 179, 0, ${arrowFade})`;
        ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
        ctx.fillText('\u2192', x + boxW + 4, startY + boxH / 2 + 5);
      }
    });
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// A11 — JournalEntryAnim (S13) — journal form filling in fields
function JournalEntryAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 11.0;
    const tt = (t % T) / T;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE JOURNAL ENTRY', w / 2, 22);
    const formX = 30;
    const formY = 50;
    const formW = w - 60;
    const formH = h - 90;
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fillRect(formX, formY, formW, formH);
    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.lineWidth = 1;
    ctx.strokeRect(formX, formY, formW, formH);
    const fields = [
      { label: 'TIMESTAMP', value: '14:32 BST' },
      { label: 'ASSET / TF', value: 'NAS100 5m' },
      { label: 'SETUP', value: 'Pulse Cross Long, 4/4 Strong' },
      { label: 'ENTRY', value: '17,842 \u2014 at signal close' },
      { label: 'STOP', value: '17,820 \u2014 Risk Map Auto' },
      { label: 'SIZE', value: '1.2x baseline (apex visual)' },
      { label: 'RESULT', value: '+1.8R \u2014 stopped at TP2' },
      { label: 'NOTES', value: 'Followed protocol cleanly' },
    ];
    const fieldH = (formH - 20) / fields.length;
    fields.forEach((f, i) => {
      const reveal = Math.min(1, Math.max(0, (tt - i * 0.11) / 0.13));
      if (reveal <= 0) return;
      const y = formY + 10 + i * fieldH;
      ctx.globalAlpha = reveal;
      // Label
      ctx.fillStyle = 'rgba(255, 179, 0, 0.85)';
      ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(f.label, formX + 14, y + fieldH / 2 + 4);
      // Value field bg
      const valX = formX + 110;
      const valW = formW - 130;
      const valFade = Math.min(1, Math.max(0, (tt - i * 0.11 - 0.06) / 0.10));
      ctx.fillStyle = `rgba(38, 166, 154, ${0.08 * valFade})`;
      ctx.fillRect(valX, y + 4, valW, fieldH - 12);
      ctx.strokeStyle = `rgba(38, 166, 154, ${0.4 * valFade})`;
      ctx.strokeRect(valX, y + 4, valW, fieldH - 12);
      // Value text
      if (valFade > 0.3) {
        ctx.fillStyle = `rgba(255,255,255,${0.95 * valFade})`;
        ctx.font = '10px monospace, monospace';
        ctx.textAlign = 'left';
        ctx.fillText(f.value, valX + 8, y + fieldH / 2 + 4);
      }
      ctx.globalAlpha = 1;
    });
  }, []);
  return <AnimScene draw={draw} aspectRatio={4 / 3} />;
}

// A12 — SoloVsTeamAnim (S14) — one operator vs two-of-two
function SoloVsTeamAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 9.0;
    const tt = (t % T) / T;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SOLO vs TEAM \u2014 NON-OVERLAPPING SURFACES', w / 2, 22);
    const panelW = (w - 50) / 2;
    const panelH = h - 80;
    const panelTop = 44;
    // Solo panel
    const leftX = 20;
    ctx.fillStyle = 'rgba(255, 179, 0, 0.05)';
    ctx.fillRect(leftX, panelTop, panelW, panelH);
    ctx.strokeStyle = 'rgba(255, 179, 0, 0.30)';
    ctx.lineWidth = 1;
    ctx.strokeRect(leftX, panelTop, panelW, panelH);
    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    ctx.fillText('SOLO \u2014 1 OPERATOR', leftX + panelW / 2, panelTop + 18);
    // Solo: one circle in middle covering all
    const soloFade = Math.min(1, tt * 1.4);
    if (soloFade > 0) {
      ctx.globalAlpha = soloFade;
      const cx = leftX + panelW / 2;
      const cy = panelTop + panelH / 2 + 10;
      ctx.fillStyle = '#FFB300';
      ctx.beginPath();
      ctx.arc(cx, cy, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('YOU', cx, cy + 4);
      // Tags around the circle
      const tags = ['FX', 'INDICES', 'CRYPTO', 'COMM'];
      const tagR = 60;
      tags.forEach((tag, i) => {
        const angle = (i / tags.length) * Math.PI * 2 - Math.PI / 2;
        const tx = cx + Math.cos(angle) * tagR;
        const ty = cy + Math.sin(angle) * tagR;
        ctx.fillStyle = 'rgba(255, 179, 0, 0.20)';
        ctx.fillRect(tx - 22, ty - 8, 44, 16);
        ctx.fillStyle = '#FFB300';
        ctx.font = 'bold 8px system-ui, -apple-system, sans-serif';
        ctx.fillText(tag, tx, ty + 3);
      });
      ctx.globalAlpha = 1;
    }
    // Team panel
    const rightX = leftX + panelW + 10;
    ctx.fillStyle = 'rgba(38, 166, 154, 0.05)';
    ctx.fillRect(rightX, panelTop, panelW, panelH);
    ctx.strokeStyle = 'rgba(38, 166, 154, 0.30)';
    ctx.strokeRect(rightX, panelTop, panelW, panelH);
    ctx.fillStyle = '#26A69A';
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TEAM \u2014 TWO-OF-TWO', rightX + panelW / 2, panelTop + 18);
    const teamFade = Math.min(1, Math.max(0, (tt - 0.40) / 0.30));
    if (teamFade > 0) {
      ctx.globalAlpha = teamFade;
      const cx1 = rightX + panelW * 0.3;
      const cx2 = rightX + panelW * 0.7;
      const cy = panelTop + panelH / 2;
      // Operator 1
      ctx.fillStyle = '#26A69A';
      ctx.beginPath();
      ctx.arc(cx1, cy, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('A', cx1, cy + 4);
      ctx.fillStyle = 'rgba(38, 166, 154, 0.20)';
      ctx.fillRect(cx1 - 28, cy + 32, 56, 16);
      ctx.fillStyle = '#26A69A';
      ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
      ctx.fillText('FX + COMM', cx1, cy + 43);
      // Operator 2
      ctx.fillStyle = '#26A69A';
      ctx.beginPath();
      ctx.arc(cx2, cy, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
      ctx.fillText('B', cx2, cy + 4);
      ctx.fillStyle = 'rgba(38, 166, 154, 0.20)';
      ctx.fillRect(cx2 - 32, cy + 32, 64, 16);
      ctx.fillStyle = '#26A69A';
      ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
      ctx.fillText('IDX + CRYPTO', cx2, cy + 43);
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Decision authority stays individual either way.', w / 2, h - 10);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// A13 — UpgradeStaircaseAnim (S15) — 4-stage staircase
function UpgradeStaircaseAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 12.0;
    const tt = (t % T) / T;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE UPGRADE STAIRCASE', w / 2, 22);
    const stages = [
      { charts: 1, label: 'PRIMARY', sessions: '20-50' },
      { charts: 2, label: '+ REFERENCE', sessions: '20-50' },
      { charts: 4, label: '+ SECONDARY + WATCH', sessions: '20-50' },
      { charts: 6, label: '+ HTF STACK', sessions: '20-50+' },
    ];
    const stairStart = { x: 40, y: h - 60 };
    const stepW = (w - 100) / stages.length;
    const stepH = 36;
    stages.forEach((stage, i) => {
      const reveal = Math.min(1, Math.max(0, (tt - i * 0.18) / 0.20));
      if (reveal <= 0) return;
      const x = stairStart.x + i * stepW;
      const yBot = stairStart.y;
      const yTop = stairStart.y - stepH * (i + 1);
      ctx.globalAlpha = reveal;
      // Step block
      ctx.fillStyle = `rgba(38, 166, 154, ${0.10 + i * 0.05})`;
      ctx.fillRect(x, yTop, stepW, stairStart.y - yTop);
      ctx.strokeStyle = '#26A69A';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, yTop, stepW, stairStart.y - yTop);
      // Chart count big number
      ctx.fillStyle = '#26A69A';
      ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${stage.charts}`, x + stepW / 2, yTop + 28);
      // Label
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
      ctx.fillText('CHARTS', x + stepW / 2, yTop + 42);
      // Sessions per stage
      if (reveal > 0.6) {
        ctx.fillStyle = 'rgba(255, 179, 0, 0.85)';
        ctx.font = '8px system-ui, -apple-system, sans-serif';
        ctx.fillText(`${stage.sessions} sess`, x + stepW / 2, yBot - 8);
      }
      ctx.globalAlpha = 1;
    });
    // Stage labels at bottom
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '9px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    stages.forEach((stage, i) => {
      const x = stairStart.x + i * stepW + stepW / 2;
      const reveal = Math.min(1, Math.max(0, (tt - i * 0.18 - 0.10) / 0.15));
      if (reveal <= 0) return;
      ctx.globalAlpha = reveal;
      ctx.fillText(stage.label, x, stairStart.y + 18);
      ctx.globalAlpha = 1;
    });
    if (tt > 0.85) {
      const fade = Math.min(1, (tt - 0.85) / 0.10);
      ctx.fillStyle = `rgba(255, 179, 0, ${fade})`;
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('One stage at a time. Downgrade if struggling.', w / 2, 44);
    }
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================
export default function CipherWarRoomIntegrationLesson() {
  const [scrollY, setScrollY] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameRound, setGameRound] = useState(0);
  const [gameSelections, setGameSelections] = useState<(string | null)[]>(new Array(gameRounds.length).fill(null));
  const [quizAnswers, setQuizAnswers] = useState<(string | null)[]>(new Array(quizQuestions.length).fill(null));
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [certRevealed, setCertRevealed] = useState(false);
  const [certId] = useState(() => `PRO-CERT-L11.24-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);

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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 11 &middot; Lesson 24</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Cipher War Room<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>The Desk Choreography IS the Edge.</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">Two operators with identical CIPHER fluency produce different P&amp;L. The difference isn&apos;t the indicator. It&apos;s the workflow around it &mdash; the chart roles, the alerts, the routine, the journal. This lesson is the workflow layer.</motion.p>
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
            <p className="text-xl font-extrabold mb-3">Same indicator. Same fluency. Different P&amp;L.</p>
            <p className="text-gray-400 leading-relaxed mb-4">Two operators have read every Level 11 lesson, drilled every animation, certified through every quiz. They both know CIPHER cold &mdash; the regimes, the signals, the synthesis, the candles. After 100 sessions, one is up 24R; the other is down 7R. Same fluency. Different outcome. Why?</p>
            <p className="text-gray-400 leading-relaxed mb-4">The first operator sits down at 9 AM with a 15-minute pre-market routine, four charts each in a defined role, a watchlist of six pruned assets, eight named alerts, and a journal template ready. The second operator sits down at 9 AM, opens TradingView, sees what catches her eye, takes the first setup that &ldquo;feels right.&rdquo; They both run the same indicator. The first operator runs a war room around it. The second runs nothing.</p>
            <p className="text-gray-400 leading-relaxed">The desk choreography &mdash; chart roles, alerts, routines, journals &mdash; is the layer that turns indicator fluency into consistent P&amp;L. This lesson is that layer. It opens the Operations arc that closes Level 11.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#11088; THE WAR ROOM PROMISE</p>
            <p className="text-sm text-gray-400 leading-relaxed">By the end of this lesson, you will know the <strong className="text-white">four chart roles</strong>, the <strong className="text-white">HTF/LTF stack</strong>, the <strong className="text-white">watchlist discipline</strong>, the <strong className="text-white">alert architecture</strong>, the <strong className="text-white">5-second triage protocol</strong>, the <strong className="text-white">15-minute pre-market routine</strong>, the <strong className="text-white">journal format</strong>, and the <strong className="text-white">upgrade staircase</strong>. You will build your war room and run it.</p>
          </div>
        </motion.div>
      </section>

      {/* === S01 — The desk choreography IS the edge (Groundbreaking Concept) === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; &#11088; The Desk Choreography</p>
          <h2 className="text-2xl font-extrabold mb-4">The Groundbreaking Concept</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Every operator we&apos;ve studied carries the same beliefs about edge: the indicator is the edge, the strategy is the edge, the read is the edge. <strong className="text-amber-400">The workflow is the edge.</strong> Two traders with identical fluency produce different P&amp;L because their desk choreography differs. The lesson here is to build the choreography deliberately rather than letting it emerge from habit.</p>
          <WorkflowVsSignalAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the two equity curves. Both operators read CIPHER fluently. Both engage at Strong-tier signals. The left operator runs no protocol &mdash; signals are taken when they look interesting, charts are open by mood, alerts fire and get ignored. The right operator runs a war room: defined chart roles, named alerts triaged in 5 seconds, a 15-minute pre-market routine, and an end-of-session journal. Same fluency. The right curve compounds. The left curve drifts.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">FLUENCY IS NECESSARY, NOT SUFFICIENT</p>
              <p className="text-sm text-gray-400 leading-relaxed">Reading CIPHER cleanly is the prerequisite. Without that, the war room has nothing to operate. But fluency alone leaves an operator vulnerable to fatigue, decision drift, capacity overload, and protocol skipping &mdash; all the failure modes that workflow exists to prevent.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE WAR ROOM IS A SYSTEM</p>
              <p className="text-sm text-gray-400 leading-relaxed">Chart roles + HTF stack + watchlist + alerts + triage + routine + journal. Each piece supports the others. Skip any one piece and the system has a hole through which fatigue and discretion leak in.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DELIBERATE VS HABITUAL</p>
              <p className="text-sm text-gray-400 leading-relaxed">Most operators have a war room &mdash; they just built it accidentally through years of bad habits. This lesson is the deliberate version. You design the choreography on paper, then run it. You evaluate it. You upgrade it. It becomes the operational layer that fluency stands on.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Indicator fluency is necessary. Workflow is what compounds it into P&amp;L. Build the war room deliberately.</p>
          </div>
        </motion.div>
      </section>

      {/* === S02 — The General War Room === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The General War Room</p>
          <h2 className="text-2xl font-extrabold mb-4">Calibrated for the prosumer trader</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The war room described here is calibrated for the prosumer scale &mdash; one to two monitors, four to six charts, two to four assets, five to fifteen alerts, solo by default. This calibration is deliberate. Smaller (1 chart) is the early-stage staircase. Larger (institutional 12+ charts) breaks the prosumer attention budget and is not the audience this lesson serves.</p>
          <WarRoomLayoutAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">The 2x2 grid shows the canonical layout. Primary chart (top-left) gets 50% of attention. Secondary (top-right) gets 25%. Watch (bottom-left) gets 15%. Reference (bottom-right) gets 10%. The percentages aren&apos;t aspirational &mdash; they&apos;re a budget. If you spend 40% of your attention on a Reference chart, your war room is misaligned with its design.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">SCALE &middot; PROSUMER CALIBRATION</p>
              <p className="text-sm text-gray-400 leading-relaxed">1-2 monitors, 4-6 charts, 2-4 assets, 5-15 alerts. These numbers represent the boundary where attention budget, signal density, and decision overhead all balance. Smaller setups underuse capacity. Larger setups overrun it.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SOLO BY DEFAULT</p>
              <p className="text-sm text-gray-400 leading-relaxed">The general war room assumes a solo operator. Section 14 covers when team configurations make sense, but most prosumer setups should be solo because team coordination overhead exceeds the marginal benefit of a second pair of eyes for prosumer-scale capital.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CALIBRATION OVER PERSONALITY</p>
              <p className="text-sm text-gray-400 leading-relaxed">Operators who insist on running 8 charts or 1 chart often defend the choice as personality. Often it&apos;s a mismatch between actual capacity and stated preference. The framework is honest about prosumer scale; honor it before customizing.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Prosumer scale: 4-6 charts, 5-15 alerts, solo. Deviate only with cause and only after running this configuration first.</p>
          </div>
        </motion.div>
      </section>

      {/* === S03 — Chart Roles === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; Chart Roles</p>
          <h2 className="text-2xl font-extrabold mb-4">Every chart on your screen has an explicit job</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Operators who fail under load almost always fail because their charts have no defined roles. Every chart has the same status &mdash; &ldquo;something to look at&rdquo; &mdash; so attention sprays randomly. The fix is mechanical: every chart gets one of four roles, with an explicit attention budget. Once roles are assigned, triage and decisions become deterministic.</p>
          <ChartRolesAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">The four roles cycle through with their attention shares. Primary (50%) is where you actively engage and execute. Secondary (25%) is the co-pilot &mdash; correlated alternative or a second setup running in parallel. Watch (15%) is alerted-only &mdash; the chart sleeps until something fires. Reference (10%) is context-only &mdash; DXY for FX traders, VIX for equities, BTC for alts.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">PRIMARY &middot; 50% &middot; ENGAGEMENT</p>
              <p className="text-sm text-gray-400 leading-relaxed">The chart you actively trade. Most of your attention sits here. The signals you take typically come from this chart. If a session goes badly, the Primary is where the autopsy begins.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SECONDARY &middot; 25% &middot; CO-PILOT</p>
              <p className="text-sm text-gray-400 leading-relaxed">Either a correlated alternative (ES while trading NAS100) or a second setup running in parallel (XAUUSD while trading GBPUSD). Secondary catches setups Primary missed and provides a fallback when Primary is in chop.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WATCH &middot; 15% &middot; ALERTED-ONLY</p>
              <p className="text-sm text-gray-400 leading-relaxed">The Watch chart sleeps until an alert fires. Operators don&apos;t monitor it actively. The 15% attention is reserved for the moments when an alert wakes it up &mdash; you triage the alert in 5 seconds, then return to Primary or Secondary.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">REFERENCE &middot; 10% &middot; CONTEXT-ONLY</p>
              <p className="text-sm text-gray-400 leading-relaxed">DXY for FX, VIX for indices, BTC for alts. Reference is read-only context that informs sizing and triage decisions on Primary. You glance at Reference during triage, not during execution.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Every chart has one of four roles. The role determines the attention budget. Triage in role-priority order: Primary first, Reference last.</p>
          </div>
        </motion.div>
      </section>

      {/* === S04 — The HTF/LTF Stack === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The HTF/LTF Stack</p>
          <h2 className="text-2xl font-extrabold mb-4">4H macro &rarr; 1H setup &rarr; 15m timing &rarr; 5m execution</h2>
          <p className="text-gray-400 leading-relaxed mb-6">A single chart at one timeframe is a flat read. A stack of four timeframes is a 3D read. You see the macro environment, the setup geometry, the timing precision, and the execution detail simultaneously. Operators who run the stack catch setups single-timeframe operators miss, and avoid setups single-timeframe operators take.</p>
          <TimeframeStackAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the four levels populate top-down. 4H establishes the macro direction. 1H confirms the setup is geometrically valid (S/R, structure, market phase). 15m provides the timing read &mdash; when in the 1H setup window does execution land. 5m is the actual entry trigger. When all four agree on direction, you have cascading confirmation &mdash; the strongest engagement signal in the framework.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">4H &middot; MACRO &middot; THE WIND DIRECTION</p>
              <p className="text-sm text-gray-400 leading-relaxed">The 4H tells you which way the wind is blowing this week. Counter-4H trades take longer, fail more often, and require larger stops. Operators who ignore the 4H trade against the macro and lose to drag.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">1H &middot; SETUP &middot; THE GEOMETRY</p>
              <p className="text-sm text-gray-400 leading-relaxed">The 1H is where setup geometry lives &mdash; structure breaks, S/R levels, market phase, regime classification. The 1H tells you if the setup is &ldquo;the kind of setup&rdquo; you want to take. Without a 1H confirmation, the 15m and 5m signals are just noise.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">15m &middot; TIMING &middot; THE WINDOW</p>
              <p className="text-sm text-gray-400 leading-relaxed">The 15m tells you when in the 1H setup window the execution lands. Fresh-bar 15m confirmation means the trade is timed at the start of the window. Stale 15m means the window is closing.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">5m &middot; EXECUTION &middot; THE TRIGGER</p>
              <p className="text-sm text-gray-400 leading-relaxed">The 5m is where the actual entry happens. Stop placement, scaling, BE moves &mdash; all on the 5m. The 5m is the level of detail that matters for execution but doesn&apos;t change the verdict from the higher timeframes.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Read top-down: 4H wind, 1H geometry, 15m window, 5m trigger. Cascading confirmation = strongest engagement.</p>
          </div>
        </motion.div>
      </section>

      {/* === S05 — Cross-Asset Correlation === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Cross-Asset Correlation</p>
          <h2 className="text-2xl font-extrabold mb-4">When Reference and Primary agree, you size up</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The Reference chart isn&apos;t decoration. It carries information that decides whether the Primary setup is real or fake. DXY moving down while you&apos;re long EURUSD is confirmation. DXY moving up while you&apos;re long EURUSD is divergence &mdash; the trade is fighting the macro. Operators who read the cross-asset correlation correctly catch fakes the Primary alone cannot detect.</p>
          <CorrelationPairAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">The animation cycles between two phases. AGREEMENT: NAS100 trending up while DXY (inverted) trends up &mdash; the cross-asset confirms the equities bull. Size up. DIVERGENCE: NAS100 trending up while DXY trends down &mdash; the inverted DXY says risk-off, but NAS100 is rallying. The setup is fighting the macro. Reduce size or skip.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">FX &middot; DXY AS REFERENCE</p>
              <p className="text-sm text-gray-400 leading-relaxed">FX traders run DXY on the Reference chart. DXY moving against the trade is the early warning that USD strength is reasserting. EURUSD long while DXY rallies = fighting the macro. Read DXY before sizing FX trades.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">EQUITIES &middot; VIX AS REFERENCE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Equity traders run VIX. VIX rising while you&apos;re long is a risk warning regardless of what your Primary chart shows. VIX collapsing while you&apos;re short is a risk warning. The Reference fact-checks the Primary setup.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">ALTS &middot; BTC AS REFERENCE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Alt traders run BTC. Most alts trade against BTC; reading BTC&apos;s direction tells you whether your alt setup is moving with or against the broader crypto flow. Alt long while BTC dumps is fighting the tide.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SIZING IMPLICATIONS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Cross-asset agreement = size up 25-50% within cap. Divergence = size down 50% or skip. Mixed (Reference is choppy or unclear) = standard size, manage tightly. The Reference is a sizing modifier, not a veto.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Read Reference before sizing. Agreement = size up. Divergence = size down or skip. Reference is a fact-check, not decoration.</p>
          </div>
        </motion.div>
      </section>

      {/* === S06 — Watchlist Discipline === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; The Watchlist Discipline</p>
          <h2 className="text-2xl font-extrabold mb-4">Six assets. Pruned. Reviewed.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The watchlist is the asset universe you actively monitor. It is finite by design. The framework caps it at six because beyond six, monitoring fragments and the operator becomes a tourist of their own watchlist. The discipline isn&apos;t adding assets &mdash; it&apos;s pruning them.</p>
          <WatchlistPruneAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the watchlist evaluate. Seven assets, 30 sessions of data each. NAS100 (12 setups) and GBPUSD (8) are clearly active. XAUUSD (5) and BTCUSD (4) are healthy. EURJPY (1) is borderline &mdash; right at the threshold. AAPL and TSLA (0 setups each in 30 sessions) fail the rule and drop off. The watchlist tightens from 7 to 5, with EURJPY observed for another 10 sessions before final decision.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">CURATE TO 6 WITH EXPLICIT ROLES</p>
              <p className="text-sm text-gray-400 leading-relaxed">A six-asset watchlist with each asset assigned to a chart role (Primary, Secondary, Watch, Reference) is a structured cognitive surface. Beyond six, operators stop assigning roles and the discipline collapses into &ldquo;everything is something to watch.&rdquo;</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PRUNE BELOW 1 SETUP / WEEK / 30 SESSIONS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Throughput threshold, not P&amp;L threshold. An asset producing fewer than 1 setup per week over 30 sessions is consuming attention without generating engagement. Drop it. P&amp;L isn&apos;t the metric &mdash; activity density is.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">ONE IN, ONE OUT</p>
              <p className="text-sm text-gray-400 leading-relaxed">When you drop an asset, replace it with one new asset, then run 20-30 sessions before evaluating the replacement. Don&apos;t replace 3 assets simultaneously &mdash; you can&apos;t evaluate any of them honestly.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">REVIEW EVERY 20-30 SESSIONS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Watchlist review is a calendar discipline, not a mood discipline. Schedule it. The review log tracks which assets passed each evaluation and which got pruned. Patterns emerge: certain asset classes don&apos;t fit your style; certain timeframes underperform.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Six assets, role-assigned. Prune below threshold. One in, one out. Review every 20-30 sessions.</p>
          </div>
        </motion.div>
      </section>

      {/* === S07 — Alert Architecture === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Alert Architecture</p>
          <h2 className="text-2xl font-extrabold mb-4">Four categories. Format-locked names. Five to fifteen active.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Alerts are the asynchronous nervous system of the war room. When done right, they extend your attention to charts you can&apos;t actively monitor and surface setups the moment they form. When done wrong, they create a constant noise stream that drowns the signals. The fix is structural &mdash; named categories, format-locked alert names, and a count cap.</p>
          <AlertArchitectureAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Four categories cover all alert types. SIGNAL: a CIPHER signal fired. LEVEL: price hit a S/R level you&apos;re watching. VOLUME: a volume spike or compression event. REGIME: a regime classification changed. Each alert is named with the format ASSET-CATEGORY-DETAIL &mdash; e.g., NAS100-SIGNAL-PulseLong, GBPUSD-LEVEL-Resistance, ES-VOLUME-Spike. The format-lock makes triage mechanical.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">FOUR CATEGORIES &middot; SIGNAL / LEVEL / VOLUME / REGIME</p>
              <p className="text-sm text-gray-400 leading-relaxed">Every alert maps to one of four categories. SIGNAL fires on CIPHER signals. LEVEL fires on price hitting a marked S/R or psychological level. VOLUME fires on volume events. REGIME fires when CIPHER&apos;s regime classifier changes state. Categories beyond these four are usually noise.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FORMAT &middot; ASSET-CATEGORY-DETAIL</p>
              <p className="text-sm text-gray-400 leading-relaxed">The format lock means you can read an alert name in under a second and know what fired. NAS100-SIGNAL-PulseLong tells you everything: the asset (NAS100), the category (SIGNAL), the detail (PulseLong). No notification text needed beyond the alert name.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CAP &middot; 5 TO 15 ACTIVE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Below 5 alerts, you don&apos;t have enough coverage. Above 15, alert fatigue sets in &mdash; you start ignoring the stream because there&apos;s too much. 5-15 is the operationally sustainable range. Most prosumer setups end up with 8-12 active alerts.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PRUNING &middot; ALERT FATIGUE IS REAL</p>
              <p className="text-sm text-gray-400 leading-relaxed">If you find yourself dismissing alerts without reading them, you have too many or they&apos;re named wrong. Audit the active list every 20-30 sessions. Disable noisy alerts. Replace name formats that confuse you.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Four categories. Format-locked names. 5-15 active. Audit periodically.</p>
          </div>
        </motion.div>
      </section>

      {/* === S08 — Triaging the Alert Storm === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Triaging the Alert Storm</p>
          <h2 className="text-2xl font-extrabold mb-4">Engage / Watch / Skip in 5 seconds each</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Alerts arrive in clusters. Three alerts within 30 seconds is normal during active sessions. Operators without a triage protocol freeze, alt-tab through the alerts in panic, and either miss something important or take a sub-optimal setup. The fix: triage in priority order, with a 5-second budget per alert, in three categorical bins.</p>
          <TriageStormAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch three alerts arrive and resolve. They sort by chart role priority &mdash; Primary first, Secondary second, Watch last. Each gets a 5-second triage with a verdict: ENGAGE, WATCH, or SKIP. The 5-second budget keeps the protocol mechanical rather than analytical. Deep analysis fails under load; mechanical routing succeeds.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">PRIORITY ORDER &middot; PRIMARY FIRST</p>
              <p className="text-sm text-gray-400 leading-relaxed">When multiple alerts fire, triage in chart-role priority order. Primary first, then Secondary, then Watch, then Reference. The priority is fixed &mdash; don&apos;t let urgency framing or recency bias re-order it.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">5 SECONDS PER ALERT</p>
              <p className="text-sm text-gray-400 leading-relaxed">Five seconds is intentionally short. It forces mechanical triage rather than analysis. The 5-second decision is: does the alert match a setup I&apos;m configured to engage? Yes or no. Deep analysis comes after triage, only on alerts that pass the engage filter.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THREE BINS &middot; ENGAGE / WATCH / SKIP</p>
              <p className="text-sm text-gray-400 leading-relaxed">ENGAGE: this alert matches my setup criteria, I&apos;ll evaluate it deeply now. WATCH: this alert is interesting but not actionable yet, I&apos;ll keep an eye on it. SKIP: this alert isn&apos;t my setup, dismiss it. Three bins are sufficient. More categories slow triage.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CAPACITY-AWARE</p>
              <p className="text-sm text-gray-400 leading-relaxed">If you&apos;re mid-execution on a Primary trade, all incoming alerts default to SKIP unless they&apos;re Primary alerts. Triage doesn&apos;t override execution. The war room never interrupts an in-flight trade.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Priority order. 5 seconds. Three bins. Capacity-aware. Mechanical, not analytical.</p>
          </div>
        </motion.div>
      </section>

      {/* === S09 — Pre-Market Routine === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Pre-Market Routine</p>
          <h2 className="text-2xl font-extrabold mb-4">15 minutes &middot; 5 elements &middot; non-negotiable</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The pre-market routine is the war room&apos;s ignition sequence. 15 minutes covering five elements: overnight news scan, chart role review, alert verification, HTF read, mental state check. Skip any element and you enter the session with a blind spot. The discipline is to run all five every session, even when you feel like you don&apos;t need to.</p>
          <SessionTimelineAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">The 15-minute timeline shows the five segments. NEWS SCAN (3 min): central bank announcements, earnings, geopolitical events. CHART ROLES (3 min): confirm Primary, Secondary, Watch, Reference are correctly assigned for today. ALERTS (3 min): verify all 8-12 active alerts are still relevant, no false positives. HTF READ (3 min): 4H and 1H direction, structure, regime classification. MENTAL CHECK (3 min): are you fit to trade today &mdash; sleep, stress, focus.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">NEWS SCAN &middot; HEADLINES THAT RESHAPE THE DAY</p>
              <p className="text-sm text-gray-400 leading-relaxed">Central bank decisions, FOMC, NFP, earnings beats and misses, geopolitical events. Any of these can invalidate the macro context your setups assume. 3 minutes scanning a curated news source is enough &mdash; deeper reading isn&apos;t the goal here.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CHART ROLES &middot; CONFIRM ASSIGNMENT</p>
              <p className="text-sm text-gray-400 leading-relaxed">Yesterday&apos;s Primary may not be today&apos;s Primary. If GBPUSD ranged all of yesterday and BoE is announcing today, GBPUSD might be Primary today. Re-assign roles with the day&apos;s context.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">HTF READ &middot; 4H AND 1H FRESH</p>
              <p className="text-sm text-gray-400 leading-relaxed">Read the 4H and 1H on Primary and Secondary before the session. Note direction, structure, and regime. The HTF read becomes the lens through which all session signals get evaluated.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">MENTAL CHECK &middot; ARE YOU FIT TODAY</p>
              <p className="text-sm text-gray-400 leading-relaxed">Sleep, stress, distraction. If two of these three are red, the right answer is to skip the session entirely. Trading on a mental check failure is the single highest-cost decision in the framework. The check isn&apos;t aspirational &mdash; it&apos;s a gate.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">15 minutes, 5 elements, non-negotiable. If you can&apos;t do the routine, sit out the open and do it before engaging.</p>
          </div>
        </motion.div>
      </section>

      {/* === S10 — Active Session Choreography === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Active Session Choreography</p>
          <h2 className="text-2xl font-extrabold mb-4">Open caution &middot; mid-session focus &middot; close discipline</h2>
          <p className="text-gray-400 leading-relaxed mb-6">A session has rhythms. The open is wild &mdash; high volume, false breakouts, chop. The middle is where most clean setups form. The close brings end-of-day positioning that distorts price. Operators who treat all three the same fail in the open and the close. The fix is to adapt engagement to the rhythm.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">OPEN &middot; FIRST 30-60 MINUTES &middot; CAUTION</p>
              <p className="text-sm text-gray-400 leading-relaxed">The open is hostile to clean setups. False breakouts dominate. Volume distorts. Wait 30-60 minutes after open before engaging. The first hour is for observation, not engagement. Setups taken in the first hour have a measurably lower hit rate.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">MID-SESSION &middot; PRIMARY ENGAGEMENT WINDOW</p>
              <p className="text-sm text-gray-400 leading-relaxed">90-120 minutes after open, the noise filters out. This is when CIPHER signals fire most cleanly. Most of your engagement should happen in the mid-session window. Conserve attention for this period.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CLOSE &middot; LAST 30 MINUTES &middot; DISCIPLINE</p>
              <p className="text-sm text-gray-400 leading-relaxed">The close brings end-of-day positioning &mdash; institutional orders, gamma effects, settlement flows. Setups during the close fire frequently but the price action doesn&apos;t mean what it means mid-session. Engage selectively or stand aside.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE RHYTHM IS BROKERAGE &middot; AND ASSET-CLASS-DEPENDENT</p>
              <p className="text-sm text-gray-400 leading-relaxed">FX has 24/5 sessions with London/NY overlap as the &ldquo;mid-session.&rdquo; Crypto runs 24/7 with regional volume bursts. Equities have a hard 9:30-16:00 window. Adapt the rhythm definitions to your asset class but the principle holds.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Open = wait. Mid-session = engage. Close = discipline. Adapt to your asset class.</p>
          </div>
        </motion.div>
      </section>

      {/* === S11 — Decision Protocol Under Load === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Decision Protocol Under Load</p>
          <h2 className="text-2xl font-extrabold mb-4">Mechanical routing beats deep analysis</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Under cognitive load &mdash; multiple alerts, fast-moving price, mid-execution distractions &mdash; analysis fails. The brain switches from System 2 (slow, deliberate) to System 1 (fast, biased). Operators who try to analyze under load make errors that they would never make in calm. The protocol is to compress decisions into a 4-step mechanical routing.</p>
          <DecisionUnderLoadAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">The 4-step protocol cascades. PRIORITY: which chart role fired the alert? Higher-priority charts engage first. CAPACITY: are you mid-execution? If yes, the alert defaults to WATCH or SKIP. QUALIFY: does the conviction synthesis meet your engagement threshold? If yes, proceed. If no, SKIP. EXECUTE: per the L11.22 trade plan &mdash; entry, SL, TP, scaling, BE moves. Each step takes seconds, not minutes.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">STEP 1 &middot; PRIORITY</p>
              <p className="text-sm text-gray-400 leading-relaxed">Look at which chart fired the alert. Primary, Secondary, Watch, or Reference? Higher-priority alerts engage first. Don&apos;t let urgency framing reorder priority.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STEP 2 &middot; CAPACITY</p>
              <p className="text-sm text-gray-400 leading-relaxed">Are you mid-execution on another trade? If yes, capacity is reduced. The current trade always completes before any other engagement. Capacity-aware triage is the difference between a clean session and an over-traded mess.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STEP 3 &middot; QUALIFY</p>
              <p className="text-sm text-gray-400 leading-relaxed">Does the conviction synthesis hit threshold? L11.22 taught the 4-factor score and context cascade. If the alert points at a setup with score below threshold, SKIP. The qualifier is a mechanical filter, not an evaluation.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STEP 4 &middot; EXECUTE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Per the L11.22 trade plan. Entry at signal close. SL from Risk Map. TP1/TP2/TP3 at 1R/2R/3R, scaling 50/30/20. BE move at TP1. Trail final 20%. The plan is preset; execution is paint-by-numbers.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Priority &rarr; capacity &rarr; qualify &rarr; execute. Mechanical, not analytical. Seconds, not minutes.</p>
          </div>
        </motion.div>
      </section>

      {/* === S12 — Session-End Review === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">12 &mdash; Session-End Review</p>
          <h2 className="text-2xl font-extrabold mb-4">10 minutes &middot; 4 elements &middot; before you walk away</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The session-end review is the war room&apos;s second non-negotiable bookend. 10 minutes covering P&amp;L recap, protocol adherence, pattern observation, and adjustment notes. The review is what closes the loop on the day &mdash; without it, lessons evaporate overnight and the same mistakes repeat tomorrow.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">P&amp;L RECAP &middot; THE NUMBERS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Today&apos;s P&amp;L in R-units. Number of trades. Win rate. Average winner, average loser. The recap is mechanical &mdash; just the numbers, no interpretation yet. Interpretation belongs in pattern observation.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PROTOCOL ADHERENCE &middot; DID YOU FOLLOW THE PLAN</p>
              <p className="text-sm text-gray-400 leading-relaxed">For each trade: did you take the trade per setup criteria? Did you size per the synthesis tier? Did you exit per the trade plan or override? Adherence is binary &mdash; you either followed the protocol or you didn&apos;t. Track the percentage over 30 sessions.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PATTERN OBSERVATION &middot; WHAT REPEATED</p>
              <p className="text-sm text-gray-400 leading-relaxed">Were there patterns in the wins? In the losses? Did all the losses come from one chart, one setup, or one mental state? Patterns surface in the review because freeform observation surfaces them &mdash; in the heat of the session, you see one trade at a time.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">ADJUSTMENT NOTES &middot; ONE THING TO CHANGE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Pick one thing to change tomorrow. Not three, not five. One. Compounding adjustments week-over-week is how the war room evolves. Throwing five changes at the system simultaneously prevents you from knowing which adjustment caused what.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">10 minutes, 4 elements, before you walk away. One adjustment per session. Compound weekly.</p>
          </div>
        </motion.div>
      </section>

      {/* === S13 — The Journal === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">13 &mdash; The Journal</p>
          <h2 className="text-2xl font-extrabold mb-4">Capture at the moment &middot; structured fields &middot; never edit history</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The journal is the war room&apos;s long-term memory. Every trade, every skipped setup, every decision &mdash; captured at the moment it happens, with structured fields, in a format that can be reviewed weekly. Operators who journal compound their lessons. Operators who don&apos;t journal repeat the same mistakes for years.</p>
          <JournalEntryAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">The journal entry shows the canonical fields. Timestamp, asset/TF, setup, entry, stop, size, result, notes. Each field auto-fills from the trade plan when possible (entry, stop, size) and manual when not (notes, pattern observations). The entry is captured in-the-moment &mdash; result is added at trade close, notes are added at session-end. History is never edited.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">CAPTURE AT THE MOMENT</p>
              <p className="text-sm text-gray-400 leading-relaxed">The journal entry begins the moment you engage. Entry, stop, size, setup name &mdash; logged immediately. Waiting until session-end means you write what you remember, which is a sanitized version of what happened. In-moment capture preserves accuracy.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STRUCTURED FIELDS &middot; NOT FREEFORM</p>
              <p className="text-sm text-gray-400 leading-relaxed">The fields are required. Without structure, journals devolve into &ldquo;today was OK&rdquo; entries that carry no operational signal. Required fields force the operator to actually record the data that matters &mdash; setup name, conviction tier, R-multiple result, protocol adherence.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">JOURNAL SKIPPED TRADES TOO</p>
              <p className="text-sm text-gray-400 leading-relaxed">A skipped setup is information. Why did you skip? Was the skip correct in retrospect? Patterns in skips are as informative as patterns in trades. Operators who only journal taken trades miss half the data.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">REVIEW WEEKLY &middot; NEVER EDIT</p>
              <p className="text-sm text-gray-400 leading-relaxed">Weekly review of the journal surfaces patterns invisible at the day-by-day level. Review with the same structured discipline as the entry capture. And never edit history &mdash; bad notes from a hard day are data; sanitizing them defeats the journal&apos;s purpose.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Capture in-moment. Structured fields. Skipped trades count. Review weekly. Never edit history.</p>
          </div>
        </motion.div>
      </section>

      {/* === S14 — Solo vs Team === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">14 &mdash; Solo vs Team</p>
          <h2 className="text-2xl font-extrabold mb-4">Solo by default &middot; two-of-two when partners cover different surfaces</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The general war room assumes a solo operator. Most prosumer setups should stay solo because team coordination overhead exceeds the marginal benefit of a second pair of eyes for prosumer-scale capital. The exception is two-of-two configurations where partners cover non-overlapping asset surfaces &mdash; then the team becomes a coverage multiplier rather than a coordination tax.</p>
          <SoloVsTeamAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the solo vs team comparison. Solo: one operator covering all asset surfaces &mdash; FX, indices, crypto, commodities. Team: two operators with explicit surface assignments &mdash; A covers FX and commodities, B covers indices and crypto. Coverage doubles, coordination overhead stays low because each operator has clear ownership. Decision authority remains individual either way &mdash; even in teams, no setup is engaged by committee.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">SOLO &middot; THE DEFAULT</p>
              <p className="text-sm text-gray-400 leading-relaxed">Solo is faster, more accountable, lower-overhead. Decision speed is higher because there&apos;s no coordination layer. Accountability is higher because results are unambiguously yours. For most prosumer setups, solo is right.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">TWO-OF-TWO &middot; THE SWEET SPOT</p>
              <p className="text-sm text-gray-400 leading-relaxed">When partners cover non-overlapping asset surfaces, two-of-two doubles coverage without doubling coordination. The constraint is non-overlapping &mdash; if both partners watch the same FX pairs, the team adds noise rather than coverage.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DECISION AUTHORITY STAYS INDIVIDUAL</p>
              <p className="text-sm text-gray-400 leading-relaxed">Even in two-of-two, each operator is the decision authority on their assigned surface. No setup is engaged by committee. Committee decisions are slow and sub-optimal under load. Fast, unilateral decisions are what trading rewards.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THREE-OR-MORE &middot; BREAKS COHERENCE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Three or more operators in a war room creates communication overhead that exceeds the benefit. Comments, slack messages, &ldquo;what do you think&rdquo; questions slow execution. Above two-of-two, you need formal process which breaks the prosumer scale.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Solo by default. Two-of-two when surfaces are non-overlapping. Decision authority always individual.</p>
          </div>
        </motion.div>
      </section>

      {/* === S15 — The Upgrade Staircase === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">15 &mdash; The Upgrade Staircase</p>
          <h2 className="text-2xl font-extrabold mb-4">1 chart &rarr; 2 &rarr; 4 &rarr; 6 &middot; one stage at a time</h2>
          <p className="text-gray-400 leading-relaxed mb-6">No operator runs a 6-chart war room from day one. The upgrade staircase is how operators scale their attention surface as discipline matures. Start at 1 chart. Move to 2 (add Reference). Move to 4 (add Secondary and Watch). Move to 6 (add the HTF stack). 20-50 sessions per stage. Skipping stages is the single most reliable way to crash an emerging discipline.</p>
          <UpgradeStaircaseAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the staircase build. Stage 1: Primary only. Operator focuses on one asset, one timeframe, one role. Stage 2: add Reference. Cognitive load barely rises because Reference is read-only. Stage 3: add Secondary and Watch &mdash; this is the major upgrade where operators routinely struggle. Stage 4: add the HTF stack. Each stage is 20-50 sessions. Downgrade if struggling at the current stage.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">STAGE 1 &middot; 1 CHART &middot; PRIMARY ONLY</p>
              <p className="text-sm text-gray-400 leading-relaxed">One asset, one timeframe, full attention. The discipline is simple: read the chart, take valid setups, journal them. Stage 1 builds the engagement reflex. Don&apos;t move on until you&apos;re consistently profitable here.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STAGE 2 &middot; 2 CHARTS &middot; + REFERENCE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Add the Reference chart (DXY, VIX, BTC depending on asset class). Reference is read-only context, very low cognitive load. The discipline added: reading the cross-asset before sizing. 20-50 sessions to internalize.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STAGE 3 &middot; 4 CHARTS &middot; + SECONDARY + WATCH</p>
              <p className="text-sm text-gray-400 leading-relaxed">Add the Secondary (correlated alternative) and Watch (alerted-only) charts. This is where most operators routinely struggle &mdash; cognitive load doubles, alert volume rises, triage becomes mandatory. 20-50 sessions, possibly more.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STAGE 4 &middot; 6 CHARTS &middot; + HTF STACK</p>
              <p className="text-sm text-gray-400 leading-relaxed">Add the higher timeframes (4H, 1H) for cascading confirmation reads. The HTF stack is sophisticated and demanding. By Stage 4, the operator has internalized the lower-stage disciplines and can absorb the HTF complexity without cognitive overflow.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">One stage at a time. 20-50 sessions per stage. Downgrade if struggling. Skipping stages crashes discipline.</p>
          </div>
        </motion.div>
      </section>

      {/* === S16 — Six Common Mistakes === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">16 &mdash; Six Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-4">What operators get wrong building their war rooms</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The war room framework is operationally precise. The failure modes are operationally precise too. Six recurring mistakes operators make, with the fix for each. The fix is always more conservative than the mistake.</p>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 1 &middot; SKIPPING THE PRE-MARKET ROUTINE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Operator runs late, decides the routine isn&apos;t critical, opens charts and engages. Misses the news scan that would have shown a central bank announcement. Trades into the announcement. <strong className="text-white">Fix:</strong> if you can&apos;t do the routine, sit out the open. The routine is non-negotiable. Skip the session, not the routine.</p>
            </div>
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 2 &middot; BLOATED WATCHLIST</p>
              <p className="text-sm text-gray-400 leading-relaxed">Operator adds assets without pruning. Watchlist grows from 6 to 12. Attention fragments. Missed setups on Primary because Watch chart noise distracts. <strong className="text-white">Fix:</strong> the cap is 6. Drop assets that fail the 1-setup-per-week threshold. One-in, one-out for replacements.</p>
            </div>
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 3 &middot; ALERT FATIGUE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Operator adds alerts without auditing. Active count grows past 15. Operator starts dismissing alerts without reading them. Misses real setups that fired in the noise. <strong className="text-white">Fix:</strong> 15 is the cap. Audit every 20-30 sessions. Disable noisy alerts. Format names so triage is mechanical.</p>
            </div>
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 4 &middot; ANALYZING UNDER LOAD</p>
              <p className="text-sm text-gray-400 leading-relaxed">Multiple alerts fire simultaneously. Operator tries to analyze each deeply, freezes, takes 30 seconds per alert, misses the Primary trade in the meantime. <strong className="text-white">Fix:</strong> mechanical 5-second triage. Engage / Watch / Skip in three bins. Deep analysis only on alerts that pass the engage filter.</p>
            </div>
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 5 &middot; NO JOURNAL OR DELAYED JOURNAL</p>
              <p className="text-sm text-gray-400 leading-relaxed">Operator skips the journal for &ldquo;just one day,&rdquo; or writes it tomorrow morning instead of tonight. Tomorrow&apos;s entry is sanitized recall, not in-moment data. Lessons evaporate. The same mistake repeats next week. <strong className="text-white">Fix:</strong> journal in-moment for the trade fields, end-of-session for notes. Never tomorrow morning. Never &ldquo;catch up on the journal next week.&rdquo;</p>
            </div>
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 6 &middot; SKIPPING UPGRADE STAGES</p>
              <p className="text-sm text-gray-400 leading-relaxed">Operator profitable on 1 chart, decides to jump to 4 charts. Cognitive load doubles. Alert volume triples. Operator can&apos;t triage, takes bad setups out of FOMO, blows up within 10-15 sessions. <strong className="text-white">Fix:</strong> the staircase is 1 &rarr; 2 &rarr; 4 &rarr; 6. 20-50 sessions per stage. Downgrade if struggling. The staircase is non-skippable.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === Cheat Sheet === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">The War Room Cheat Sheet</p>
          <h2 className="text-2xl font-extrabold mb-4">For your second monitor</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Print this. Pin it next to your L11.22 and L11.23 sheets. Reference all three before every session.</p>
          <div className="p-6 rounded-2xl glass-card space-y-3">
            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">The 4 Chart Roles</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p><strong className="text-white">Primary</strong> 50% &mdash; active engagement, you trade here</p>
                <p><strong className="text-white">Secondary</strong> 25% &mdash; co-pilot or correlated alternative</p>
                <p><strong className="text-white">Watch</strong> 15% &mdash; alerted-only, sleeps until firing</p>
                <p><strong className="text-white">Reference</strong> 10% &mdash; context (DXY/VIX/BTC)</p>
              </div>
            </div>
            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">HTF/LTF Stack</p>
              <p className="text-sm text-gray-400 leading-relaxed">4H macro &rarr; 1H setup &rarr; 15m timing &rarr; 5m execution. Read top-down. All four agree = cascading confirmation.</p>
            </div>
            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">Watchlist</p>
              <p className="text-sm text-gray-400 leading-relaxed">Cap 6 assets. Prune below 1 setup/week over 30 sessions. One in, one out. Review every 20-30 sessions.</p>
            </div>
            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">Alerts</p>
              <p className="text-sm text-gray-400 leading-relaxed">4 categories: SIGNAL / LEVEL / VOLUME / REGIME. Format ASSET-CATEGORY-DETAIL. Cap 15 active. Triage in 5 seconds, three bins (ENGAGE / WATCH / SKIP).</p>
            </div>
            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">Pre-Market Routine</p>
              <p className="text-sm text-gray-400 leading-relaxed">15 min total. News scan (3) &middot; Chart roles (3) &middot; Alerts (3) &middot; HTF read (3) &middot; Mental check (3). Non-negotiable.</p>
            </div>
            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">Decision Under Load</p>
              <p className="text-sm text-gray-400 leading-relaxed">Priority &rarr; Capacity &rarr; Qualify &rarr; Execute. Mechanical, not analytical.</p>
            </div>
            <div>
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">Upgrade Staircase</p>
              <p className="text-sm text-gray-400 leading-relaxed">1 &rarr; 2 &rarr; 4 &rarr; 6 charts. 20-50 sessions per stage. Downgrade if struggling.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S17 — Scenario Game === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">17 &mdash; Scenario Game</p>
          <h2 className="text-2xl font-extrabold mb-4">Run the War Room Like an Operator</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Five scenarios. Alert triage with mid-execution capacity, watchlist pruning, journal discipline, upgrade staircase progression, and pre-market routine non-negotiability. Pick the right call. Explanations appear after every answer, including the wrong ones.</p>
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
                  <p className="text-xs text-gray-400 mt-1">{finalScore >= 4 ? 'War Room operator-grade. You triage in priority, journal in-moment, and upgrade in stages.' : finalScore >= 3 ? 'Solid grasp. Re-read the triage protocol (S08), journal section (S13), and upgrade staircase (S15) before the quiz.' : 'Re-study the chart roles (S03), watchlist discipline (S06), pre-market routine (S09), and the six mistakes (S16) before the quiz.'}</p>
                </motion.div>
              );
            })()}
          </div>
        </motion.div>
      </section>

      {/* === S18 — Final Quiz === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">18 &mdash; Knowledge Check</p>
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
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 11.24: Cipher War Room Integration</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-sky-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; War Room Operator &mdash;</p>
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
