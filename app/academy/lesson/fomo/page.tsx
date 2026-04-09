// app/academy/lesson/fomo/page.tsx
// ATLAS Academy — Lesson 4.3: FOMO — The Trade You Should Never Take [PRO]
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Crown, ArrowRight, ChevronDown } from 'lucide-react';

function AnimScene({ drawFn, height = 300 }: { drawFn: (ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => void; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const animRef = useRef(0);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const loop = () => { ctx.clearRect(0, 0, rect.width, rect.height); drawFn(ctx, rect.width, rect.height, frameRef.current); frameRef.current++; animRef.current = requestAnimationFrame(loop); };
    loop();
    return () => cancelAnimationFrame(animRef.current);
  }, [drawFn]);
  return <canvas ref={canvasRef} style={{ width: '100%', height }} className="rounded-2xl" />;
}

// ============================================================
// CHASE ANIMATION — Price running away, trader chasing
// ============================================================
function ChaseAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);

    const cycle = (f % 600) / 600;
    const chartLeft = 40;
    const chartRight = w - 30;
    const chartTop = 30;
    const chartBottom = h - 50;
    const chartW = chartRight - chartLeft;
    const chartH = chartBottom - chartTop;

    // Price line — rallies hard, then reverses
    const points: { x: number; y: number }[] = [];
    const totalPts = 80;
    for (let i = 0; i <= totalPts; i++) {
      const t = i / totalPts;
      const x = chartLeft + t * chartW;
      let y: number;
      if (t < 0.15) {
        y = chartBottom - chartH * 0.3 + Math.sin(t * 30) * 8;
      } else if (t < 0.6) {
        const progress = (t - 0.15) / 0.45;
        y = chartBottom - chartH * 0.3 - progress * chartH * 0.55 + Math.sin(t * 20) * 5;
      } else if (t < 0.7) {
        const progress = (t - 0.6) / 0.1;
        y = chartTop + chartH * 0.1 + Math.sin(progress * 3) * 3;
      } else {
        const progress = (t - 0.7) / 0.3;
        y = chartTop + chartH * 0.12 + progress * chartH * 0.5 + Math.sin(t * 15) * 4;
      }
      points.push({ x, y });
    }

    // Draw visible portion based on cycle
    const visiblePts = Math.floor(cycle * totalPts);

    // Price line
    if (visiblePts > 1) {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i <= visiblePts && i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      const lineGrd = ctx.createLinearGradient(chartLeft, 0, chartRight, 0);
      lineGrd.addColorStop(0, 'rgba(34,197,94,0.6)');
      lineGrd.addColorStop(0.6, 'rgba(34,197,94,0.8)');
      lineGrd.addColorStop(0.7, 'rgba(234,179,8,0.7)');
      lineGrd.addColorStop(1, 'rgba(239,68,68,0.7)');
      ctx.strokeStyle = lineGrd;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // FOMO entry point — trader chases at the top
    if (cycle > 0.55 && cycle < 0.95) {
      const entryIdx = Math.floor(0.62 * totalPts);
      if (entryIdx < points.length) {
        const ep = points[entryIdx];
        // Entry marker
        ctx.beginPath();
        ctx.arc(ep.x, ep.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(239,68,68,0.8)';
        ctx.fill();
        ctx.font = 'bold 9px system-ui';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(239,68,68,0.9)';
        ctx.fillText('FOMO ENTRY', ep.x, ep.y - 14);
        ctx.font = '8px system-ui';
        ctx.fillStyle = 'rgba(239,68,68,0.5)';
        ctx.fillText('"I have to get in NOW!"', ep.x, ep.y - 4);
      }
    }

    // "The move already happened" label
    if (cycle > 0.3 && cycle < 0.55) {
      const alpha = Math.sin((cycle - 0.3) / 0.25 * Math.PI) * 0.7;
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillStyle = `rgba(34,197,94,${alpha})`;
      ctx.fillText('The move is happening without you...', w / 2, chartBottom + 25);
    }

    // Reversal warning
    if (cycle > 0.75) {
      const alpha = Math.min((cycle - 0.75) / 0.1, 1) * 0.8;
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillStyle = `rgba(239,68,68,${alpha})`;
      ctx.fillText('Price reverses. FOMO entry trapped.', w / 2, chartBottom + 25);
    }

    // Reset phase label
    if (cycle < 0.15) {
      ctx.font = '9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(148,163,184,0.4)';
      ctx.fillText('Price consolidating... waiting for setup...', w / 2, chartBottom + 25);
    }

    // Axis labels
    ctx.font = '8px system-ui';
    ctx.fillStyle = 'rgba(148,163,184,0.2)';
    ctx.textAlign = 'right';
    ctx.fillText('Price', chartLeft - 5, chartTop + 10);
    ctx.textAlign = 'center';
    ctx.fillText('Time', w / 2, h - 5);
  }, []);

  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// OPPORTUNITY COST ANIMATION — Shows missed trades vs FOMO trades
// ============================================================
function OpportunityCostAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);
    const midX = w / 2;
    const phase = (f % 720) / 720;

    // Left side — FOMO trades (bad)
    const lx = w * 0.25;
    const barTop = 60;
    const barH = h - 100;

    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(239,68,68,0.6)';
    ctx.fillText('FOMO TRADES', lx, 25);
    ctx.font = '8px system-ui';
    ctx.fillStyle = 'rgba(148,163,184,0.3)';
    ctx.fillText('(chased entries)', lx, 38);

    // FOMO trade bars — mostly red
    const fomoTrades = [
      { result: -1.5, label: '-1.5R' },
      { result: 0.3, label: '+0.3R' },
      { result: -2.0, label: '-2.0R' },
      { result: -0.8, label: '-0.8R' },
      { result: 0.5, label: '+0.5R' },
    ];
    const barWidth = 28;
    const maxR = 2.5;
    const zeroY = barTop + barH * 0.4;

    fomoTrades.forEach((t, i) => {
      const bx = lx - (fomoTrades.length * barWidth) / 2 + i * barWidth + 2;
      const barPixelH = (Math.abs(t.result) / maxR) * (barH * 0.35);
      const visible = Math.min(1, Math.max(0, (phase * 5 - i * 0.15)));

      if (visible > 0) {
        const by = t.result > 0 ? zeroY - barPixelH * visible : zeroY;
        const bh = barPixelH * visible;
        ctx.fillStyle = t.result > 0 ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)';
        ctx.fillRect(bx, by, barWidth - 4, bh);
        ctx.strokeStyle = t.result > 0 ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(bx, by, barWidth - 4, bh);

        if (visible > 0.8) {
          ctx.font = '7px system-ui';
          ctx.textAlign = 'center';
          ctx.fillStyle = t.result > 0 ? 'rgba(34,197,94,0.6)' : 'rgba(239,68,68,0.6)';
          ctx.fillText(t.label, bx + (barWidth - 4) / 2, t.result > 0 ? by - 4 : by + bh + 10);
        }
      }
    });

    // FOMO total
    if (phase > 0.25) {
      ctx.font = 'bold 11px system-ui';
      ctx.fillStyle = 'rgba(239,68,68,0.7)';
      ctx.textAlign = 'center';
      ctx.fillText('Total: -3.5R', lx, h - 20);
    }

    // Right side — Planned trades (good)
    const rx = w * 0.75;
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(34,197,94,0.6)';
    ctx.fillText('PLANNED TRADES', rx, 25);
    ctx.font = '8px system-ui';
    ctx.fillStyle = 'rgba(148,163,184,0.3)';
    ctx.fillText('(waited for setup)', rx, 38);

    const planTrades = [
      { result: 2.5, label: '+2.5R' },
      { result: -1.0, label: '-1.0R' },
      { result: 3.0, label: '+3.0R' },
      { result: -1.0, label: '-1.0R' },
      { result: 2.0, label: '+2.0R' },
    ];

    planTrades.forEach((t, i) => {
      const bx = rx - (planTrades.length * barWidth) / 2 + i * barWidth + 2;
      const barPixelH = (Math.abs(t.result) / maxR) * (barH * 0.35);
      const visible = Math.min(1, Math.max(0, (phase * 5 - 1.5 - i * 0.15)));

      if (visible > 0) {
        const by = t.result > 0 ? zeroY - barPixelH * visible : zeroY;
        const bh = barPixelH * visible;
        ctx.fillStyle = t.result > 0 ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)';
        ctx.fillRect(bx, by, barWidth - 4, bh);
        ctx.strokeStyle = t.result > 0 ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(bx, by, barWidth - 4, bh);

        if (visible > 0.8) {
          ctx.font = '7px system-ui';
          ctx.textAlign = 'center';
          ctx.fillStyle = t.result > 0 ? 'rgba(34,197,94,0.6)' : 'rgba(239,68,68,0.6)';
          ctx.fillText(t.label, bx + (barWidth - 4) / 2, t.result > 0 ? by - 4 : by + bh + 10);
        }
      }
    });

    if (phase > 0.6) {
      ctx.font = 'bold 11px system-ui';
      ctx.fillStyle = 'rgba(34,197,94,0.7)';
      ctx.textAlign = 'center';
      ctx.fillText('Total: +5.5R', rx, h - 20);
    }

    // Centre divider
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(148,163,184,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(midX, barTop - 10);
    ctx.lineTo(midX, h - 40);
    ctx.stroke();
    ctx.setLineDash([]);

    // Zero line
    ctx.strokeStyle = 'rgba(148,163,184,0.1)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(20, zeroY);
    ctx.lineTo(w - 20, zeroY);
    ctx.stroke();
    ctx.font = '7px system-ui';
    ctx.fillStyle = 'rgba(148,163,184,0.2)';
    ctx.textAlign = 'left';
    ctx.fillText('0', 8, zeroY + 3);
  }, []);

  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// GAME SCENARIOS
// ============================================================
const gameScenarios = [
  { scenario: 'EUR/USD just broke above a major resistance level and has moved +60 pips in 20 minutes. You have no position. Your plan didn&apos;t signal an entry. You feel sick watching it go. What do you do?', opts: ['Enter now &mdash; the breakout is confirmed', 'Wait for a pullback to the broken resistance (now support)', 'Nothing &mdash; you had no setup, it&apos;s not your trade', 'Enter with a tight 10-pip stop to limit risk'], correct: 2, explain: 'No setup = no trade. The 60-pip move already happened &mdash; entering now gives you the WORST possible entry with zero edge. The market doesn&apos;t care that you feel sick. Your plan didn&apos;t signal, so you don&apos;t trade. There will be 251 more trading days this year.' },
  { scenario: 'You skipped a valid GBP/USD setup 2 hours ago because you were reviewing your journal. It&apos;s now +80 pips in profit. You feel angry at yourself. A new, marginal setup appears on the same pair. What do you do?', opts: ['Take it &mdash; you owe yourself after missing the first one', 'Skip it &mdash; marginal setups aren&apos;t in your plan', 'Take it with larger size to make up for the missed trade', 'Take it but set a wider target to compensate'], correct: 1, explain: 'The missed trade is gone. It cannot be recovered by taking a DIFFERENT, inferior trade. Marginal setups lose money over time. Taking a bad trade to &quot;compensate&quot; for a missed good trade is pure FOMO compounding. Stick to your criteria.' },
  { scenario: 'Your trading group chat is buzzing. Everyone is long Gold. Screenshots of +$2,000 days everywhere. You don&apos;t have a Gold setup but you feel left out. What do you do?', opts: ['Open a Gold position &mdash; everyone can&apos;t be wrong', 'Stick to your own analysis and pairs', 'Open a small Gold position &mdash; just to participate', 'Ask the group for their entry levels and copy them'], correct: 1, explain: 'Social FOMO is the most dangerous kind. Group chats show ONLY wins. Nobody posts their losses. Those +$2,000 screenshots might be from $100,000 accounts risking 5% per trade. Your edge comes from YOUR plan, not someone else&apos;s. If Gold isn&apos;t in your setup, it doesn&apos;t exist.' },
  { scenario: 'Bitcoin is up 12% today. It&apos;s all over social media. You don&apos;t trade crypto. Your strategy is forex only. But &quot;everyone&quot; is making money. What do you do?', opts: ['Open a crypto exchange account and buy Bitcoin', 'Stick to forex &mdash; your edge is in your lane', 'Buy a small amount &mdash; you don&apos;t want to miss the train', 'Switch to crypto trading for the week'], correct: 1, explain: 'FOMO across asset classes is account suicide. You have ZERO edge in crypto. Your edge exists in forex because you&apos;ve studied it, backtested it, and built rules for it. Jumping to crypto because of one day&apos;s headlines is gambling, not trading. Stay in your lane.' },
  { scenario: 'You took 2 trades today (your daily max). Both were +1.5R wins. An A+ setup just appeared. Your plan says stop at 2 trades. What do you do?', opts: ['Take it &mdash; A+ setups are rare and you&apos;re on a roll', 'Skip it &mdash; rules are rules, even when it hurts', 'Take it with half size as a compromise', 'Screenshot it and track what would have happened'], correct: 3, explain: 'Your daily limit is 2 trades. Period. But FOMO doesn&apos;t mean you can&apos;t LEARN from the setup. Screenshot it, track the outcome, and add it to your journal data. If you consistently find valid setups after your limit, you might adjust the limit in your MONTHLY review &mdash; not in the heat of the moment.' },
];

// ============================================================
// QUIZ QUESTIONS
// ============================================================
const quizQuestions = [
  { q: 'FOMO stands for Fear Of Missing Out. In trading, this most commonly leads to:', opts: ['Exiting trades too early', 'Chasing entries without a valid setup', 'Using stop losses that are too tight', 'Trading smaller position sizes'], a: 1, explain: 'FOMO makes traders enter trades they shouldn&apos;t be in. The move has already happened, the entry has no edge, the R:R is terrible &mdash; but the pain of watching it go without you overrides rational analysis.' },
  { q: 'The phrase &quot;The trade you missed was never yours&quot; means:', opts: ['You shouldn&apos;t feel bad about losses', 'A trade that didn&apos;t trigger your setup was never a valid opportunity for YOU', 'You should only trade winning setups', 'Missing trades is always a mistake'], a: 1, explain: 'Your edge only exists within your specific criteria. A move that happened outside your rules was never your trade, no matter how profitable it was. Just as a football player doesn&apos;t regret not scoring from the stands &mdash; you can&apos;t regret not catching a trade you had no business taking.' },
  { q: 'Social FOMO (following group chat trades) is dangerous because:', opts: ['Other traders have better strategies', 'Group chats show only wins, creating a false picture of success', 'You should always trade alone', 'Group chats are always wrong'], a: 1, explain: 'Survivorship bias: you see screenshots of winners, never the losses. Group pressure creates a false sense that &quot;everyone is winning&quot; when the reality is very different. Your edge comes from your own analysis, not crowd-following.' },
  { q: 'After missing a valid setup that went +80 pips, the correct response is to:', opts: ['Take the next trade immediately to compensate', 'Wait for your next valid setup, even if it takes hours', 'Enter the same pair at market price', 'Increase size on the next trade to make up for it'], a: 1, explain: 'The missed trade is gone. No future action can recover it. Taking an inferior trade or increasing size to &quot;compensate&quot; is FOMO compounding &mdash; it turns one missed opportunity into an actual loss.' },
  { q: 'A trader who jumps from forex to crypto to stocks based on daily headlines is experiencing:', opts: ['Good diversification', 'Asset-class FOMO', 'Risk management', 'Opportunistic trading'], a: 1, explain: 'Chasing whichever asset class is in the news is FOMO across markets. Your edge exists in the asset you&apos;ve studied and tested. Jumping to crypto because it&apos;s up 12% today means trading with zero edge in an unfamiliar market.' },
  { q: 'The &quot;FOMO Entry&quot; typically gives you:', opts: ['An excellent risk-to-reward ratio', 'The worst possible entry with maximum risk and minimum reward', 'Average entry quality', 'Better entries than planned entries'], a: 1, explain: 'FOMO entries happen AFTER the move. You&apos;re buying at the top of a rally or selling at the bottom of a drop. Your stop is huge (must go below the entire move), your target is small (most of the move is done), and your R:R is often 1:0.5 or worse.' },
  { q: 'The best way to handle FOMO is to:', opts: ['Never look at charts you&apos;re not trading', 'Have a written plan that defines exactly when you trade, and follow it', 'Trade every setup so you never miss one', 'Increase your number of pairs to catch more moves'], a: 1, explain: 'A written plan with specific criteria is your FOMO defence. When the urge hits, you check: &quot;Does this meet my criteria?&quot; If no, you don&apos;t trade. The plan makes the decision, not your emotion.' },
  { q: 'Tracking &quot;missed&quot; trades in your journal helps because:', opts: ['It makes you feel bad enough to trade more', 'It provides data to refine your rules without breaking them in the moment', 'It proves your strategy doesn&apos;t work', 'It helps you time the market better'], a: 1, explain: 'Tracking missed setups gives you DATA. After 50 tracked misses, you might discover that most of them failed anyway (reducing FOMO) or that you should adjust your criteria in your monthly review (improving your system). Either way, the data guides you &mdash; not the emotion.' },
];

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function FOMOLesson() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Accordion states
  const [openTrigger, setOpenTrigger] = useState<string | null>(null);
  const [openType, setOpenType] = useState<string | null>(null);
  const [openStep, setOpenStep] = useState<string | null>(null);
  const [openMistake, setOpenMistake] = useState<string | null>(null);
  const [openMantra, setOpenMantra] = useState<string | null>(null);

  // Game state
  const [gameRound, setGameRound] = useState(0);
  const [gameAnswer, setGameAnswer] = useState<number | null>(null);
  const [gameScore, setGameScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(Array(quizQuestions.length).fill(null));
  const quizDone = quizAnswers.every(a => a !== null);
  const score = quizDone ? Math.round(quizAnswers.filter((a, i) => a === quizQuestions[i].a).length / quizQuestions.length * 100) : 0;
  const certUnlocked = quizDone && score >= 66;

  const currentGame = gameScenarios[gameRound];

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-900/50"><motion.div className="h-full bg-gradient-to-r from-amber-500 to-accent-500" style={{ width: `${Math.min((scrollY / (typeof document !== 'undefined' ? document.body.scrollHeight - window.innerHeight : 1)) * 100, 100)}%` }} /></div>
      <nav className="sticky top-0 z-40 px-5 py-3 flex items-center justify-between" style={{ background: 'rgba(6,10,18,0.85)', backdropFilter: 'blur(16px)' }}>
        <Link href="/academy" className="text-xs text-gray-500 hover:text-gray-300 transition">&larr; Academy</Link>
        <div className="flex items-center gap-2"><Crown className="w-3.5 h-3.5 text-amber-400" /><span className="text-xs font-bold text-amber-400">PRO &middot; LEVEL 4</span></div>
      </nav>

      <section className="px-5 pt-16 pb-12 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 4 &middot; Lesson 3</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight"><span className="bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>FOMO</span></h1>
          <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">The trade you missed was never yours. Learn to sit with the discomfort of watching the market move without you.</p>
        </motion.div>
      </section>

      {/* SECTION 00 — WHY THIS MATTERS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-lg font-bold text-white mb-3">&#128652; Imagine you&apos;re at a bus stop. The bus you needed just left. You can see it pulling away. Do you sprint after it, arms flailing, hoping to catch it at the next stop?</p>
            <p className="text-gray-400 leading-relaxed mb-4">Of course not. You wait for the next one. <strong className="text-amber-400">But in trading, almost every beginner sprints after the bus.</strong></p>
            <p className="text-gray-400 leading-relaxed mb-4">FOMO &mdash; Fear Of Missing Out &mdash; is the voice that says &quot;it&apos;s going without me, I HAVE to get in NOW.&quot; It makes you enter trades after the move has happened, at the worst possible price, with the worst possible R:R, in the worst possible emotional state.</p>
            <p className="text-gray-400 leading-relaxed">The result? You buy at the top and sell at the bottom. You enter right before the reversal. You give back a week of discipline in one impulsive trade. <strong className="text-white">FOMO is the single biggest account killer for beginner traders.</strong></p>
          </div>
          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">Gold rallied $45 in 3 hours during a London session. A trader with no Gold setup saw it happening on Twitter, opened a long position at $2,048 (near the high), and set a 15-pip stop. Gold reversed within minutes. The stop hit in 8 minutes. -1R. Then he re-entered. -1R again. And again. Three FOMO trades, three losses: -3R total. If he&apos;d done nothing, he&apos;d have had a flat day instead of his worst day that month.</p>
          </div>
        </motion.div>
      </section>

      {/* SECTION 01 — THE CHASE */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; Anatomy of a FOMO Trade</p>
          <h2 className="text-2xl font-extrabold mb-4">Watch the Chase in Action</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">Watch what happens: price moves without you. FOMO kicks in. You enter at the worst possible moment. Price reverses. You&apos;re trapped.</p>
          <ChaseAnimation />
          <div className="mt-4 p-4 rounded-xl glass-card">
            <p className="text-sm text-gray-400 leading-relaxed">The green rally is <strong className="text-white">someone else&apos;s trade</strong>. They entered at the base because they had a plan. You entered at the top because you had an emotion. The FOMO entry gives you maximum risk and minimum reward &mdash; the exact opposite of what a professional setup provides.</p>
          </div>
        </motion.div>
      </section>

      {/* SECTION 02 — FOMO TRIGGERS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Five FOMO Triggers</p>
          <h2 className="text-2xl font-extrabold mb-2">Know What Sets You Off</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">FOMO doesn&apos;t appear randomly. It&apos;s triggered by specific situations. Name the trigger, break its power.</p>
        </motion.div>
        <div className="space-y-3">
          {[
            { name: 'The Runaway Chart', icon: '&#128200;', desc: 'A pair moves 80+ pips in one direction and you have no position. Every candle that prints makes the pain worse. Your brain says: &quot;This could be the trade of the year and I&apos;m missing it.&quot;', reality: 'For every 80-pip runaway that continues to 200, there are five that reverse immediately. You only REMEMBER the ones that kept going. That&apos;s called recency bias.', defence: 'Close the chart. If you don&apos;t have a setup, watching the move only increases pain. Open a different pair where your setup might form. Or step away entirely.' },
            { name: 'Social Media Wins', icon: '&#128241;', desc: 'Your feed is full of screenshots: &quot;+$5,000 today on Gold&quot;, &quot;Caught that entire BTC move.&quot; Everyone seems to be winning. You feel like the only trader NOT making money.', reality: 'Nobody posts their losses. For every $5,000 win screenshot, there are 20 $500 losses they didn&apos;t share. Social media trading is a highlight reel, not reality.', defence: 'Mute trading accounts for 30 days. Track your own results only. Compare yourself to your last month, not to someone else&apos;s best day.' },
            { name: 'The Missed Setup', icon: '&#128561;', desc: 'You had a valid setup. You were away from the screen. It triggered and hit target without you. Now you feel angry and want to &quot;make up for it&quot; by taking the next thing that moves.', reality: 'The missed trade is gone. Taking an inferior trade to compensate doesn&apos;t recover the missed one &mdash; it just adds a new, worse trade.', defence: 'Journal the missed trade. Track what would have happened. Use the data in your monthly review. A missed trade provides information, not an excuse to chase.' },
            { name: 'The Group Chat Buzz', icon: '&#128172;', desc: 'Your trading group is piling into a trade. Messages flying: &quot;I&apos;m in!&quot; &quot;Let&apos;s gooo!&quot; &quot;Easy money.&quot; You don&apos;t want to be the only one NOT participating.', reality: 'Herd behaviour is the #1 destroyer of retail accounts. When &quot;everyone&quot; is doing something, you&apos;re usually providing exit liquidity for smart money.', defence: 'Mute the group during trading hours. Your plan is YOUR plan. Nobody in the group chat will refund your losses when their &quot;easy money&quot; trade fails.' },
            { name: 'The News Spike', icon: '&#128240;', desc: 'Breaking news: rate decision, NFP, CPI. Price spikes 100 pips in seconds. You weren&apos;t positioned. Now you want to jump in to catch the continuation.', reality: 'News spikes are the WORST time to enter. Spreads widen to 10-30 pips, slippage is extreme, and 60% of initial spikes reverse within 15 minutes.', defence: 'Wait. Let the spike settle. If there&apos;s a valid setup 30-60 minutes after the news, take it. The post-news pullback often provides a much better entry than the spike itself.' },
          ].map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <button onClick={() => setOpenTrigger(openTrigger === t.name ? null : t.name)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                <div className="flex items-center gap-3">
                  <span className="text-xl" dangerouslySetInnerHTML={{ __html: t.icon }} />
                  <p className="text-sm font-extrabold text-orange-400">{t.name}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openTrigger === t.name ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openTrigger === t.name && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="px-4 pb-4 pt-2 space-y-2">
                      <p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: t.desc }} />
                      <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/15"><p className="text-xs font-bold text-blue-400 mb-1">&#128161; The Reality</p><p className="text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: t.reality }} /></div>
                      <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/15"><p className="text-xs font-bold text-green-400 mb-1">&#128737;&#65039; Your Defence</p><p className="text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: t.defence }} /></div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 03 — THREE TYPES OF FOMO */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; Three Types of FOMO</p>
          <h2 className="text-2xl font-extrabold mb-2">Not All FOMO Is the Same</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">Understanding WHICH type of FOMO is attacking you determines how to respond.</p>
        </motion.div>
        <div className="space-y-3">
          {[
            { type: 'Entry FOMO', color: 'text-red-400', border: 'border-red-500/20 bg-red-500/5', desc: 'You want to get IN a trade that&apos;s already moving. The entry window has closed but your finger is hovering over the buy button. You tell yourself &quot;it&apos;s not too late.&quot;', danger: 'Entry FOMO gives you the worst possible R:R. Your stop must cover the entire move that already happened. Your target has already been partially consumed. Even if the trade wins, the maths doesn&apos;t work.', cure: 'If the entry zone has passed, the trade is GONE. Wait for the next setup. Write on a sticky note: &quot;Late entries have negative expectancy.&quot;' },
            { type: 'Exit FOMO', color: 'text-yellow-400', border: 'border-yellow-500/20 bg-yellow-500/5', desc: 'Your trade hit your target, but price kept going. You closed at +50 pips and it went to +150. Now you feel robbed. Next time, you remove your TP to &quot;let it run.&quot;', danger: 'Exit FOMO trains you to hold winners too long. The 1 time it works (+150 pips) is memorable. The 4 times it fails (reversal from +50 to -10) are devastating and forgotten.', cure: 'Track what happens AFTER your TP for 30 trades. You&apos;ll find that in most cases, price reverses or consolidates shortly after. Your TP is based on structure, not hope.' },
            { type: 'Asset FOMO', color: 'text-purple-400', border: 'border-purple-500/20 bg-purple-500/5', desc: 'A different market is moving &mdash; crypto, indices, commodities. You trade forex but Bitcoin is up 15%. You want to jump across. &quot;Everyone&quot; is making money over there.', danger: 'You have ZERO edge in an unfamiliar market. Your patterns, your sessions, your risk rules &mdash; none of them apply. You&apos;re a tourist, not a trader.', cure: 'Stay. In. Your. Lane. Your edge exists in the market you&apos;ve studied. A 2% monthly return in forex with discipline beats a -20% gamble in crypto every time.' },
          ].map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <button onClick={() => setOpenType(openType === t.type ? null : t.type)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                <p className={`text-sm font-extrabold ${t.color}`}>{t.type}</p>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openType === t.type ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openType === t.type && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="px-4 pb-4 pt-2 space-y-2">
                      <p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: t.desc }} />
                      <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/15"><p className="text-xs font-bold text-red-400 mb-1">&#9888;&#65039; The Danger</p><p className="text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: t.danger }} /></div>
                      <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/15"><p className="text-xs font-bold text-green-400 mb-1">&#128138; The Cure</p><p className="text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: t.cure }} /></div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 04 — THE COST */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The Cost of FOMO</p>
          <h2 className="text-2xl font-extrabold mb-4">FOMO Trades vs Planned Trades</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">The numbers don&apos;t lie. Watch the difference between 5 FOMO trades and 5 planned trades over the same week.</p>
          <OpportunityCostAnimation />
          <div className="mt-4 p-4 rounded-xl glass-card">
            <p className="text-sm text-amber-400 font-bold mb-2">A 9R difference in one week &mdash; from the same number of trades.</p>
            <p className="text-sm text-gray-400 leading-relaxed">FOMO trades have poor R:R (chasing gives you a big stop and small target), low win rate (entering after the move means entering before the reversal), and high emotional cost (losses from FOMO feel worse because you KNOW you shouldn&apos;t have been in them).</p>
          </div>
        </motion.div>
      </section>

      {/* SECTION 05 — THE FOMO DECISION TREE */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; The FOMO Decision Tree</p>
          <h2 className="text-2xl font-extrabold mb-2">When You Feel the Urge</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">Follow these 5 steps EVERY time FOMO hits. Tape this to your monitor.</p>
        </motion.div>
        <div className="space-y-3">
          {[
            { step: '1. STOP', icon: '&#128721;', instruction: 'Take your hand off the mouse. Do NOT click anything. The 10-second rule starts now.', detail: 'FOMO creates urgency. &quot;I have to enter NOW or it&apos;s too late!&quot; That urgency is FAKE. The market will exist in 10 seconds. Your impulsive click won&apos;t.' },
            { step: '2. CHECK', icon: '&#9745;&#65039;', instruction: 'Does this meet EVERY criterion on your checklist? Yes or no. No maybes.', detail: 'Pull up your written trading plan. Go through each entry condition. If even ONE is not met, the answer is NO. &quot;Close enough&quot; is not good enough.' },
            { step: '3. MEASURE', icon: '&#128207;', instruction: 'What is the R:R from HERE? Not from where you wish you&apos;d entered &mdash; from the current price.', detail: 'If the R:R from current price is below 1:2, the trade has no edge for you. It doesn&apos;t matter that the R:R from the original setup was 1:4. You missed that. The current R:R is what matters.' },
            { step: '4. ASK', icon: '&#128172;', instruction: '&quot;Am I entering because my plan says so, or because I can&apos;t stand watching it move without me?&quot;', detail: 'Be brutally honest. If the answer is emotion, close the chart. If the answer is genuinely your plan, proceed to step 5.' },
            { step: '5. DECIDE', icon: '&#9989;', instruction: 'If ALL boxes are checked AND R:R is valid: enter with normal size. If not: screenshot it, journal it, and walk away.', detail: 'Even if you walk away, you WIN. You protected your capital. You followed your rules. You proved that discipline beats emotion. That is a victory.' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <button onClick={() => setOpenStep(openStep === s.step ? null : s.step)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                <div className="flex items-center gap-3">
                  <span className="text-xl" dangerouslySetInnerHTML={{ __html: s.icon }} />
                  <div>
                    <p className="text-sm font-extrabold text-white">{s.step}</p>
                    <p className="text-xs text-gray-500">{s.instruction}</p>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openStep === s.step ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openStep === s.step && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="px-4 pb-4 pt-2">
                      <p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: s.detail }} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 06 — FOMO MANTRAS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; FOMO Mantras</p>
          <h2 className="text-2xl font-extrabold mb-2">Phrases That Kill FOMO Instantly</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">Memorise these. Say them out loud when the urge hits. They work because they reframe the situation.</p>
        </motion.div>
        <div className="space-y-3">
          {[
            { mantra: '&quot;The trade I missed was never mine.&quot;', why: 'You can only catch trades within your specific criteria. A move that happened outside your rules belonged to someone else&apos;s plan. It was never yours to catch.' },
            { mantra: '&quot;There are 252 trading days this year.&quot;', why: 'Missing one setup means nothing in the context of a year. If you take 2 trades per day, that&apos;s 504 opportunities. Chasing one bad trade to avoid missing one good one is terrible maths.' },
            { mantra: '&quot;Discipline IS the profit.&quot;', why: 'Every time you resist FOMO, you&apos;re protecting capital. Protected capital compounds. The money you saved by NOT chasing is money that grows in future winning trades.' },
            { mantra: '&quot;I don&apos;t chase. I wait.&quot;', why: 'Identity-based. You&apos;re not someone who chases. You&apos;re a trader who waits for setups. Framing it as identity makes it harder to violate than framing it as a rule.' },
            { mantra: '&quot;Late entries have negative expectancy.&quot;', why: 'This is a mathematical FACT. Entering after the move gives you worse R:R, worse win rate, and negative expected value. FOMO entries lose money over time. Period.' },
          ].map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <button onClick={() => setOpenMantra(openMantra === m.mantra ? null : m.mantra)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                <p className="text-sm font-extrabold text-amber-400" dangerouslySetInnerHTML={{ __html: m.mantra }} />
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openMantra === m.mantra ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openMantra === m.mantra && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="px-4 pb-4 pt-2">
                      <p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: m.why }} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 07 — COMMON MISTAKES */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-4">FOMO Traps That Catch Everyone</h2>
        </motion.div>
        <div className="space-y-3">
          {[
            { mistake: '&quot;Just a small position&quot;', wrong: 'Entering a FOMO trade with reduced size feels &quot;responsible&quot; but it&apos;s still a trade without edge. A small losing trade is still a losing trade.', right: 'No edge = no trade, regardless of size. The size doesn&apos;t make a bad trade good.', tip: 'If you wouldn&apos;t take it at full size, you shouldn&apos;t take it at half size either.' },
            { mistake: 'Switching timeframes to justify entry', wrong: 'Your 1H setup isn&apos;t there, so you drop to the 5M and &quot;find&quot; a setup. You&apos;re not analysing &mdash; you&apos;re hunting for confirmation of what you&apos;ve already decided to do.', right: 'Your trading plan specifies which timeframes you use. Switching to find justification is FOMO with extra steps.', tip: 'If your plan says 1H entries, and the 1H says no &mdash; that&apos;s the answer. The 5M doesn&apos;t override the 1H.' },
            { mistake: 'Trading outside your session', wrong: 'Your plan says London Kill Zone only. But a move is happening in the Asian session. &quot;Just this once&quot; you&apos;ll trade Asian. The setup isn&apos;t there &mdash; the FOMO is.', right: 'Sessions are rules, not suggestions. Asian volume and patterns are completely different from London. Your edge doesn&apos;t transfer.', tip: 'If it&apos;s outside your Kill Zone, it&apos;s outside your edge. Period.' },
            { mistake: 'Re-entering after a stop hit on the same pair', wrong: 'Your GBP/USD short got stopped out. Price dropped 50 pips after your stop hit. FOMO says re-enter. But the ORIGINAL analysis is gone &mdash; this is a revenge/FOMO hybrid.', right: 'Once stopped out, that trade is DEAD. A new entry requires a new, independent setup &mdash; not anger about the one that didn&apos;t work.', tip: 'After a stop, close the chart for that pair for at least 1 hour. Fresh eyes, fresh analysis, fresh setup.' },
          ].map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <button onClick={() => setOpenMistake(openMistake === m.mistake ? null : m.mistake)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                <p className="text-sm font-extrabold text-white" dangerouslySetInnerHTML={{ __html: `&#10060; ${m.mistake}` }} />
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openMistake === m.mistake ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openMistake === m.mistake && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="px-4 pb-4 pt-2 space-y-2">
                      <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/15"><p className="text-xs font-bold text-red-400 mb-1">&#10060; Wrong</p><p className="text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: m.wrong }} /></div>
                      <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/15"><p className="text-xs font-bold text-green-400 mb-1">&#9989; Right</p><p className="text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: m.right }} /></div>
                      <p className="text-xs text-amber-400/60 italic" dangerouslySetInnerHTML={{ __html: `&#128161; ${m.tip}` }} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 08 — THE MATHS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; The Maths of Missing Out</p>
          <h2 className="text-2xl font-extrabold mb-2">What FOMO Actually Costs</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">Let&apos;s compare the cost of missing a trade vs the cost of taking a FOMO trade.</p>
          <div className="space-y-4">
            <div className="p-5 rounded-xl border border-gray-700/50 bg-white/[0.02]">
              <p className="text-xs font-bold text-gray-400 mb-3">MISSING A TRADE (doing nothing)</p>
              <p className="text-sm text-gray-400 leading-relaxed">Financial cost: <strong className="text-green-400">£0</strong></p>
              <p className="text-sm text-gray-400 leading-relaxed">Emotional cost: Mild regret for 30 minutes</p>
              <p className="text-sm text-gray-400 leading-relaxed">Impact on account: <strong className="text-green-400">Zero</strong></p>
              <p className="text-sm text-gray-400 leading-relaxed">Impact on psychology: Builds patience muscle</p>
            </div>
            <div className="p-5 rounded-xl border border-red-500/20 bg-red-500/5">
              <p className="text-xs font-bold text-red-400 mb-3">TAKING A FOMO TRADE (chasing)</p>
              <p className="text-sm text-gray-400 leading-relaxed">Financial cost: <strong className="text-red-400">-1R to -3R</strong> (often multiple attempts)</p>
              <p className="text-sm text-gray-400 leading-relaxed">Emotional cost: Anger, self-doubt, revenge urge lasting hours</p>
              <p className="text-sm text-gray-400 leading-relaxed">Impact on account: <strong className="text-red-400">-1% to -3%</strong> in a single impulse</p>
              <p className="text-sm text-gray-400 leading-relaxed">Impact on psychology: Reinforces impulsive behaviour, weakens discipline</p>
            </div>
            <div className="p-4 rounded-xl glass-card">
              <p className="text-sm text-amber-400 font-bold">Missing a trade costs you £0. Chasing a trade costs you money AND mental capital.</p>
              <p className="text-sm text-gray-400 mt-2 leading-relaxed">The &quot;cost&quot; of missing out is always lower than the cost of chasing. Always. This is not an opinion &mdash; it&apos;s arithmetic.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 09 — GAME */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Resist the Chase</p>
          <h2 className="text-2xl font-extrabold mb-2">FOMO Resistance Game</h2>
          <p className="text-sm text-gray-400 mb-6">Five FOMO scenarios. Choose the disciplined response.</p>
        </motion.div>
        {!gameComplete ? (
          <div className="p-5 rounded-2xl glass-card">
            <p className="text-xs text-amber-400 font-bold mb-3">Round {gameRound + 1} of {gameScenarios.length}</p>
            <p className="text-sm font-bold text-white mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: currentGame.scenario }} />
            <div className="space-y-2">
              {currentGame.opts.map((opt, oi) => {
                const answered = gameAnswer !== null;
                const isCorrect = oi === currentGame.correct;
                const isChosen = gameAnswer === oi;
                let cls = 'glass text-gray-300 hover:bg-white/5';
                if (answered) { if (isCorrect) cls = 'bg-green-500/15 border-green-500/30 text-green-400'; else if (isChosen) cls = 'bg-red-500/15 border-red-500/30 text-red-400'; else cls = 'glass text-gray-600'; }
                return (<button key={oi} onClick={() => { if (!answered) { setGameAnswer(oi); if (oi === currentGame.correct) setGameScore(s => s + 1); } }} disabled={answered} className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt }} /> {answered && isCorrect && '\u2713'} {answered && isChosen && !isCorrect && '\u2717'}</button>);
              })}
            </div>
            {gameAnswer !== null && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15 text-sm text-gray-400 leading-relaxed mb-4"><span className="text-amber-400 font-bold">Explanation: </span><span dangerouslySetInnerHTML={{ __html: currentGame.explain }} /></div>
                {gameRound < gameScenarios.length - 1 ? (
                  <button onClick={() => { setGameRound(r => r + 1); setGameAnswer(null); }} className="w-full p-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all">Next Round &rarr;</button>
                ) : (
                  <button onClick={() => setGameComplete(true)} className="w-full p-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all">See Results &rarr;</button>
                )}
              </motion.div>
            )}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-8 glass-card rounded-2xl">
            <p className="text-5xl font-extrabold mb-2 text-amber-400">{gameScore}/{gameScenarios.length}</p>
            <p className="text-sm text-gray-400">{gameScore === 5 ? '&#128652; Perfect. FOMO has zero power over you.' : gameScore >= 3 ? 'Good resistance. A few triggers still have a hold on you.' : 'FOMO is still driving your decisions. Re-read the decision tree and mantras.'}</p>
          </motion.div>
        )}
      </section>

      {/* SECTION 10 — QUIZ */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Knowledge Check</p>
          <h2 className="text-2xl font-extrabold mb-6">FOMO Quiz</h2>
        </motion.div>
        <div className="space-y-6">
          {quizQuestions.map((q, qi) => (
            <motion.div key={qi} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="p-5 rounded-2xl glass-card">
              <p className="text-sm font-bold text-white mb-3" dangerouslySetInnerHTML={{ __html: `${qi + 1}. ${q.q}` }} />
              <div className="space-y-2">
                {q.opts.map((opt, oi) => {
                  const answered = quizAnswers[qi] !== null;
                  const isCorrect = oi === q.a;
                  const isChosen = quizAnswers[qi] === oi;
                  let cls = 'glass text-gray-300 hover:bg-white/5';
                  if (answered) { if (isCorrect) cls = 'bg-green-500/15 border-green-500/30 text-green-400'; else if (isChosen) cls = 'bg-red-500/15 border-red-500/30 text-red-400'; else cls = 'glass text-gray-600'; }
                  return (<button key={oi} onClick={() => { if (!answered) { const na = [...quizAnswers]; na[qi] = oi; setQuizAnswers(na); } }} disabled={answered} className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt }} /> {answered && isCorrect && '\u2713'} {answered && isChosen && !isCorrect && '\u2717'}</button>);
                })}
              </div>
              {quizAnswers[qi] !== null && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 text-sm text-gray-400 leading-relaxed"><span className="text-amber-400 font-bold">&#10003;</span> <span dangerouslySetInnerHTML={{ __html: q.explain }} /></motion.div>)}
            </motion.div>
          ))}
        </div>
        {quizDone && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 text-center p-8 glass-card rounded-2xl"><p className={`text-5xl font-extrabold mb-2 ${score >= 66 ? 'text-amber-400' : 'text-red-400'}`}>{score}%</p><p className="text-sm text-gray-400">{score === 100 ? '&#128652; Perfect. The bus left without you and you didn&apos;t even flinch.' : score >= 66 ? 'Strong FOMO resistance. You know when to wait.' : 'FOMO still has a grip. Review the triggers and decision tree.'}</p></motion.div>)}
      </section>

      {/* Certificate */}
      <section className="px-5 py-16 text-center">
        {!certUnlocked ? (
          <div className="max-w-md mx-auto p-8 glass rounded-2xl"><p className="text-4xl mb-3 opacity-30">&#128274;</p><p className="text-sm text-gray-500">Score 66%+ to unlock your <strong className="text-amber-400">Pro Certificate</strong></p></div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, type: 'spring' }}
            className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(249,115,22,0.06),transparent,rgba(239,68,68,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
            <div className="absolute inset-[1px] rounded-3xl border border-amber-500/10" />
            <div className="relative z-10">
              <div className="w-[80px] h-[80px] mx-auto mb-5 rounded-full bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 flex items-center justify-center text-4xl shadow-lg shadow-orange-500/20">&#128652;</div>
              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest mb-2">Pro Certificate</p>
              <h3 className="text-xl font-extrabold mb-1">Certificate of Mastery</h3>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">Has mastered<br /><strong className="text-white">Level 4.3: FOMO &mdash; The Trade You Should Never Take</strong><br />at ATLAS Academy by Interakktive</p>
              <p className="bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent font-bold text-lg mb-1" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Patient Predator &mdash;</p>
              <p className="font-mono text-[11px] text-gray-500 mb-4">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L4.3-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
            </div>
          </motion.div>
        )}
      </section>

      <section className="text-center px-5 pt-10 pb-24">
        <p className="text-xs tracking-widest uppercase text-gray-600 mb-4">Up Next</p>
        <h2 className="text-xl font-bold mb-6">Lesson 4.4 &mdash; Revenge Trading &mdash; Breaking the Cycle</h2>
        <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">
          Continue <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
