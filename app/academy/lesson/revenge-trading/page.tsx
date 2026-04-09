// app/academy/lesson/revenge-trading/page.tsx
// ATLAS Academy — Lesson 4.4: Revenge Trading — Breaking the Cycle [PRO]
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
// SPIRAL ANIMATION — 1% loss escalating through revenge trades
// ============================================================
function SpiralAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);

    const cycle = (f % 720) / 720;
    const chartLeft = 50;
    const chartRight = w - 20;
    const chartTop = 35;
    const chartBottom = h - 40;
    const chartW = chartRight - chartLeft;
    const chartH = chartBottom - chartTop;

    // Account balance line — starts at 100%, drops through revenge trades
    const trades = [
      { x: 0.0, bal: 100, label: 'Start: $10,000', color: 'rgba(148,163,184,0.5)' },
      { x: 0.12, bal: 99, label: '-1% planned loss', color: 'rgba(239,68,68,0.5)' },
      { x: 0.25, bal: 96.5, label: '-2.5% revenge #1', color: 'rgba(239,68,68,0.6)' },
      { x: 0.40, bal: 92, label: '-4.5% revenge #2 (doubled)', color: 'rgba(239,68,68,0.7)' },
      { x: 0.55, bal: 85, label: '-7% revenge #3 (tripled)', color: 'rgba(239,68,68,0.8)' },
      { x: 0.72, bal: 75, label: '-10% revenge #4 (all in)', color: 'rgba(239,68,68,0.9)' },
      { x: 0.88, bal: 60, label: '-15% spiral complete', color: 'rgba(239,68,68,1)' },
    ];

    // Y scale
    const balToY = (bal: number) => chartTop + (1 - (bal - 55) / 50) * chartH;

    // Grid lines
    ctx.strokeStyle = 'rgba(148,163,184,0.06)';
    ctx.lineWidth = 0.5;
    for (let b = 60; b <= 100; b += 10) {
      const y = balToY(b);
      ctx.beginPath();
      ctx.moveTo(chartLeft, y);
      ctx.lineTo(chartRight, y);
      ctx.stroke();
      ctx.font = '8px system-ui';
      ctx.fillStyle = 'rgba(148,163,184,0.2)';
      ctx.textAlign = 'right';
      ctx.fillText(`$${(b * 100).toLocaleString()}`, chartLeft - 5, y + 3);
    }

    // Determine visible trades based on cycle
    const visibleTrades = Math.floor(cycle * (trades.length + 1));

    // Draw balance line
    if (visibleTrades > 0) {
      ctx.beginPath();
      const firstPt = trades[0];
      ctx.moveTo(chartLeft + firstPt.x * chartW, balToY(firstPt.bal));
      for (let i = 1; i < Math.min(visibleTrades, trades.length); i++) {
        const t = trades[i];
        ctx.lineTo(chartLeft + t.x * chartW, balToY(t.bal));
      }
      ctx.strokeStyle = 'rgba(239,68,68,0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw dots and labels
      for (let i = 0; i < Math.min(visibleTrades, trades.length); i++) {
        const t = trades[i];
        const px = chartLeft + t.x * chartW;
        const py = balToY(t.bal);

        // Dot
        ctx.beginPath();
        ctx.arc(px, py, i === 0 ? 4 : 5, 0, Math.PI * 2);
        ctx.fillStyle = i === 0 ? 'rgba(148,163,184,0.6)' : t.color;
        ctx.fill();

        // Label
        ctx.font = i > 3 ? 'bold 8px system-ui' : '8px system-ui';
        ctx.textAlign = i < 3 ? 'left' : 'right';
        ctx.fillStyle = t.color;
        const labelX = i < 3 ? px + 10 : px - 10;
        ctx.fillText(t.label, labelX, py - 8);
      }
    }

    // The original planned loss marker
    if (visibleTrades >= 2) {
      const origX = chartLeft + trades[1].x * chartW;
      const origY = balToY(trades[1].bal);
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = 'rgba(34,197,94,0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(origX, origY);
      ctx.lineTo(chartRight, origY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = '8px system-ui';
      ctx.fillStyle = 'rgba(34,197,94,0.4)';
      ctx.textAlign = 'right';
      ctx.fillText('If you had stopped here: -1%', chartRight, origY - 6);
    }

    // Title
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(239,68,68,0.5)';
    ctx.fillText('THE REVENGE SPIRAL', w / 2, 18);
    ctx.font = '8px system-ui';
    ctx.fillStyle = 'rgba(148,163,184,0.3)';
    ctx.fillText('A 1% loss becomes 15% in 4 revenge trades', w / 2, h - 8);
  }, []);

  return <AnimScene drawFn={draw} height={300} />;
}

// ============================================================
// CIRCUIT BREAKER ANIMATION — The gap between loss and action
// ============================================================
function CircuitBreakerAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);
    const midX = w / 2;
    const midY = h / 2;
    const cycle = (f % 480) / 480;

    // Three boxes: LOSS → CIRCUIT BREAKER → NEXT ACTION
    const boxW = w * 0.24;
    const boxH = 60;
    const gap = w * 0.07;
    const totalW = boxW * 3 + gap * 2;
    const startX = midX - totalW / 2;

    const boxes = [
      { label: 'LOSS', sublabel: '-1R stop hit', color: '#ef4444', emoji: '&#128308;' },
      { label: 'CIRCUIT BREAKER', sublabel: '2 hours away', color: '#f59e0b', emoji: '&#128721;' },
      { label: 'NEXT ACTION', sublabel: 'Calm, planned, fresh', color: '#22c55e', emoji: '&#9989;' },
    ];

    const activeBox = cycle < 0.33 ? 0 : cycle < 0.66 ? 1 : 2;

    boxes.forEach((b, i) => {
      const bx = startX + i * (boxW + gap);
      const by = midY - boxH / 2;
      const isActive = i === activeBox;
      const alpha = isActive ? 0.2 : 0.06;

      const r = parseInt(b.color.slice(1, 3), 16);
      const g = parseInt(b.color.slice(3, 5), 16);
      const bl = parseInt(b.color.slice(5, 7), 16);

      // Box
      ctx.fillStyle = `rgba(${r},${g},${bl},${alpha})`;
      ctx.strokeStyle = `rgba(${r},${g},${bl},${isActive ? 0.5 : 0.15})`;
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.beginPath();
      ctx.roundRect(bx, by, boxW, boxH, 10);
      ctx.fill();
      ctx.stroke();

      // Emoji
      ctx.font = '18px system-ui';
      ctx.textAlign = 'center';
      ctx.fillStyle = `rgba(${r},${g},${bl},${isActive ? 0.8 : 0.3})`;
      // Use fillText for simple labels
      ctx.fillText(i === 0 ? '●' : i === 1 ? '⛔' : '✓', bx + boxW / 2, by - 10);

      // Label
      ctx.font = `${isActive ? 'bold ' : ''}9px system-ui`;
      ctx.fillStyle = `rgba(${r},${g},${bl},${isActive ? 0.9 : 0.4})`;
      ctx.fillText(b.label, bx + boxW / 2, by + boxH / 2 - 5);

      // Sublabel
      ctx.font = '8px system-ui';
      ctx.fillStyle = `rgba(${r},${g},${bl},${isActive ? 0.5 : 0.25})`;
      ctx.fillText(b.sublabel, bx + boxW / 2, by + boxH / 2 + 10);

      // Arrow to next box
      if (i < 2) {
        const arrowX = bx + boxW + gap / 2;
        const arrowAlpha = (activeBox === i && cycle % 0.33 > 0.2) || activeBox > i ? 0.4 : 0.1;
        ctx.font = '14px system-ui';
        ctx.fillStyle = `rgba(148,163,184,${arrowAlpha})`;
        ctx.fillText('→', arrowX, midY + 3);
      }
    });

    // Without circuit breaker path (crossed out)
    const noBreakY = midY + boxH / 2 + 35;
    ctx.font = '8px system-ui';
    ctx.textAlign = 'center';

    if (cycle > 0.1) {
      ctx.fillStyle = 'rgba(239,68,68,0.25)';
      ctx.fillText('WITHOUT circuit breaker:', midX, noBreakY);
      ctx.fillStyle = 'rgba(239,68,68,0.2)';
      ctx.fillText('LOSS → ANGER → REVENGE TRADE → BIGGER LOSS → SPIRAL', midX, noBreakY + 14);

      // Strikethrough
      ctx.strokeStyle = 'rgba(239,68,68,0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(midX - 160, noBreakY + 10);
      ctx.lineTo(midX + 160, noBreakY + 10);
      ctx.stroke();
    }
  }, []);

  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// GAME SCENARIOS
// ============================================================
const gameScenarios = [
  { scenario: 'Your EUR/USD short just got stopped out for -1R. You feel angry because price reversed 3 pips after your stop. You see another potential short entry forming. What do you do?', opts: ['Enter immediately &mdash; you were right about the direction', 'Wait at least 30 minutes before even looking at EUR/USD again', 'Enter with double size to recover the loss', 'Enter but with a tighter stop to reduce risk'], correct: 1, explain: 'After a stop-out, you need a cooling period. Your anger is distorting your analysis. The &quot;potential entry&quot; might be real or it might be your revenge brain manufacturing justification. Wait 30 minutes minimum. If the setup is still valid then, take it with NORMAL size.' },
  { scenario: 'You&apos;ve lost 2 trades in a row today (-2R total). Your circuit breaker rule says &quot;after 2 losses, close charts for 2 hours.&quot; But you see what looks like an A+ setup. What do you do?', opts: ['Take it &mdash; A+ setups override the circuit breaker', 'Close the charts as your rule says. No exceptions.', 'Take it with reduced size', 'Screenshot it and close the charts'], correct: 3, explain: 'The circuit breaker is NON-NEGOTIABLE. But screenshotting the setup lets you track what would have happened &mdash; building data without breaking rules. If you find that A+ setups regularly appear right after your circuit breaker triggers, you can adjust the rule in your MONTHLY review. Not in the moment.' },
  { scenario: 'You just lost $500 on a bad Gold trade. Your friend texts: &quot;Gold is about to bounce, get in now.&quot; You feel the urge to recover your $500. What do you do?', opts: ['Enter Gold long &mdash; your friend is usually right', 'Ignore the text. Your trading decisions are YOUR decisions.', 'Enter with exactly $500 risk to &quot;get it back&quot;', 'Ask your friend for more details about the setup'], correct: 1, explain: 'The $500 is GONE. It cannot be recovered by the next trade. Every trade is independent &mdash; the market doesn&apos;t know or care about your previous loss. Taking a trade based on a friend&apos;s tip while emotionally compromised is revenge trading plus social FOMO &mdash; the worst combination.' },
  { scenario: 'It&apos;s 3pm. You&apos;ve had your worst day in 3 months: -3.5R across 3 trades. Your daily loss limit is -3R but you already broke it. The Asian session starts in 6 hours. What do you do?', opts: ['Trade the Asian session to try to end the day positive', 'STOP. Close everything. You&apos;ve already broken a rule. Do not compound it.', 'Take one more trade with tight risk to &quot;reduce the damage&quot;', 'Switch to a different pair you haven&apos;t traded today'], correct: 1, explain: 'You&apos;ve already exceeded your daily limit. Every additional trade now is pure revenge. The ONLY correct action is to stop completely. Close the platform. Journal what went wrong. The goal is to prevent -3.5R from becoming -7R. Tomorrow is a new day with a fresh limit.' },
  { scenario: 'You lost -1R on a perfect A+ setup. Your analysis was correct, your execution was flawless, but the market went against you. You feel frustrated. What do you do?', opts: ['Take the same setup again immediately &mdash; the analysis was right', 'Accept it as a cost of business. A perfect process with a bad outcome is still a GOOD trade.', 'Change your strategy &mdash; if A+ setups can lose, something is wrong', 'Double size on the next trade because you&apos;re &quot;due&quot; a win'], correct: 1, explain: 'This is the HARDEST lesson in revenge trading psychology. A perfect trade that loses money is NOT a reason to change anything. Variance exists. The best strategy in the world loses 40-50% of trades. If your process was perfect, you did everything right. The outcome was out of your control. Move on.' },
];

// ============================================================
// QUIZ QUESTIONS
// ============================================================
const quizQuestions = [
  { q: 'Revenge trading is defined as:', opts: ['Trading to recover a specific loss by taking unplanned or oversized trades', 'Trading after a winning streak', 'Taking more than 3 trades per day', 'Using stop losses that are too wide'], a: 0, explain: 'Revenge trading is the emotional response to a loss where the trader attempts to &quot;win back&quot; the lost money through larger positions, more frequent trades, or trades that don&apos;t meet their criteria.' },
  { q: 'The revenge spiral typically starts with:', opts: ['A large loss', 'A small, planned loss followed by emotional escalation', 'A winning streak that ends', 'A technical indicator failure'], a: 1, explain: 'The spiral starts with a SMALL loss (often just -1R). It&apos;s the emotional reaction &mdash; not the loss itself &mdash; that creates the spiral. The trader doubles size, breaks rules, and turns a manageable -1R into a catastrophic -10% or worse.' },
  { q: 'A circuit breaker in trading psychology is:', opts: ['A stop loss level', 'A pre-set rule that forces you to stop trading after consecutive losses', 'A type of technical indicator', 'A risk management formula'], a: 1, explain: 'A circuit breaker is a personal rule like &quot;after 2 consecutive losses, close all charts for 2 hours.&quot; It creates a mandatory cooling period between the emotional trigger and your next action, preventing the revenge spiral.' },
  { q: 'After a stop loss is hit, the lost money:', opts: ['Can be recovered by the next trade', 'Is gone forever and has zero relationship to the next trade', 'Should determine the size of the next position', 'Means the strategy is broken'], a: 1, explain: 'Each trade is statistically independent. The market doesn&apos;t know you lost money. The next trade&apos;s probability of success is identical whether your last trade won or lost. The lost money is a sunk cost &mdash; it cannot influence future outcomes.' },
  { q: 'The most dangerous thought pattern in revenge trading is:', opts: ['&quot;I need to study more&quot;', '&quot;I need to get it back&quot;', '&quot;I should take a break&quot;', '&quot;That loss was within my plan&quot;'], a: 1, explain: '&quot;I need to get it back&quot; is the engine of revenge trading. It frames trading as a recovery operation rather than a probability game. There is nothing to &quot;get back&quot; &mdash; each trade is independent. This thought pattern leads directly to oversized positions and rule-breaking.' },
  { q: 'When a trade with perfect process loses money, the correct interpretation is:', opts: ['The strategy is broken', 'You need to change your entry criteria', 'Variance &mdash; a good trade with a bad outcome', 'You should have used a wider stop'], a: 2, explain: 'Professional traders understand that perfect process + bad outcome = variance. A 50% win rate means HALF your trades lose. If you change your strategy after every loss, you&apos;ll never give any system enough trades to prove its edge.' },
  { q: 'The best time to create circuit breaker rules is:', opts: ['Immediately after a big loss', 'During a calm moment when you&apos;re NOT trading', 'After a winning streak', 'During your first trade of the day'], a: 1, explain: 'Circuit breakers must be written during calm, rational periods &mdash; not during emotional states. The whole point is that your calm self creates rules for your emotional self to follow. Writing rules while emotional defeats their purpose.' },
  { q: 'A trader who increases position size after every loss is:', opts: ['Using a Martingale strategy (statistically valid)', 'Revenge trading &mdash; guaranteeing eventual account destruction', 'Being aggressive but strategic', 'Following Kelly Criterion'], a: 1, explain: 'Increasing size after losses (Martingale) is mathematically guaranteed to blow your account given enough trades. Each increased position brings the total risk closer to the account maximum. One extended losing streak (which WILL happen) wipes everything.' },
];

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function RevengeTradingLesson() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Accordion states
  const [openStage, setOpenStage] = useState<string | null>(null);
  const [openSign, setOpenSign] = useState<string | null>(null);
  const [openRule, setOpenRule] = useState<string | null>(null);
  const [openTool, setOpenTool] = useState<string | null>(null);
  const [openMistake, setOpenMistake] = useState<string | null>(null);

  // Simulator state
  const [simStep, setSimStep] = useState(0);
  const [simChoices, setSimChoices] = useState<string[]>([]);
  const simSteps = [
    { text: 'Your GBP/JPY long just got stopped out. -1R. You feel frustrated because the entry was good but a news spike caught you. Your circuit breaker says: &quot;After 1 loss, wait 15 minutes. After 2, close charts for 2 hours.&quot; This is loss #1 today.', opts: [
      { label: 'Wait 15 minutes, then reassess', result: 'good', feedback: 'Correct. The circuit breaker gives you a cooling period. After 15 minutes, the initial anger subsides and you can think clearly.' },
      { label: 'Enter GBP/JPY again immediately', result: 'bad', feedback: 'This is revenge. The anger from the stop-out is driving you, not analysis. The next 15 minutes are critical &mdash; your circuit breaker exists for this exact moment.' },
      { label: 'Double your size on the next trade to recover', result: 'terrible', feedback: 'This is the START of the spiral. Doubling size turns a -1R loss into potential -2R. If that loses, you&apos;ll want to quadruple. This is how accounts die.' },
    ]},
    { text: '15 minutes have passed. You&apos;ve calmed down slightly. You check your charts and see a genuine setup forming on EUR/USD &mdash; it meets your criteria. But you notice your hands are still slightly shaky. What do you do?', opts: [
      { label: 'Take the trade with normal size &mdash; it meets criteria', result: 'okay', feedback: 'The setup is valid, but &quot;slightly shaky&quot; suggests your emotional state isn&apos;t fully neutral. A better choice would be reduced size, but taking it at normal size with a valid setup is acceptable if all checklist items are met.' },
      { label: 'Take it with half size as a bridge back to normal', result: 'good', feedback: 'Smart. Reduced size honours the valid setup while respecting your emotional state. If this trade wins, you rebuild confidence. If it loses, the impact is halved. This is what professional recovery looks like.' },
      { label: 'Skip it &mdash; you&apos;re not emotionally ready', result: 'okay', feedback: 'Also valid. If you&apos;re not confident in your emotional state, sitting out is always a safe choice. The trade might win without you, but that&apos;s FOMO &mdash; and you just covered that in Lesson 4.3.' },
    ]},
    { text: 'You took the EUR/USD trade at half size. It lost. -0.5R. You&apos;re now down -1.5R today. This is loss #2. Your circuit breaker says: &quot;After 2 losses, close charts for 2 hours.&quot; What do you do?', opts: [
      { label: 'Close everything. Circuit breaker is non-negotiable.', result: 'good', feedback: 'This is the moment that separates professionals from amateurs. -1.5R is recoverable. -5R is devastating. The circuit breaker prevents the escalation. Close the charts. Walk away. Come back in 2 hours with fresh eyes.' },
      { label: 'One more trade &mdash; you&apos;re &quot;due&quot; a win', result: 'terrible', feedback: 'The gambler&apos;s fallacy: you are NEVER &quot;due&quot; a win. Each trade is independent. Your probability of winning the next trade is identical to every other trade. The only thing you&apos;re &quot;due&quot; for is a bigger loss if you keep trading while emotional.' },
      { label: 'Trade a different asset to change the energy', result: 'bad', feedback: 'Switching pairs doesn&apos;t change your emotional state. You&apos;re still angry, still wanting to recover, still in revenge mode. The circuit breaker requires you to STOP TRADING, not switch instruments.' },
    ]},
  ];

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
          <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 4 &middot; Lesson 4</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight"><span className="bg-gradient-to-r from-red-400 via-orange-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Revenge Trading</span></h1>
          <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">The spiral that turns a 1% loss into a 15% disaster. Learn to break the cycle before it breaks you.</p>
        </motion.div>
      </section>

      {/* SECTION 00 — WHY THIS MATTERS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-lg font-bold text-white mb-3">&#128293; You lose £100. That hurts. So you bet £200 to win it back. You lose again. Now you&apos;re down £300. So you bet £500. You lose. £800 gone. One more &mdash; £1,000 this time. Surely you&apos;ll win? You don&apos;t.</p>
            <p className="text-gray-400 leading-relaxed mb-4">That&apos;s not a casino story. That&apos;s what happens to traders every single day. A <strong className="text-white">small, planned, acceptable loss</strong> triggers an emotional reaction that spirals into a catastrophe.</p>
            <p className="text-gray-400 leading-relaxed mb-4">Revenge trading is the #1 account killer, ahead of bad strategy, ahead of overleveraging, ahead of FOMO. Because revenge trading doesn&apos;t just lose money &mdash; it <strong className="text-amber-400">accelerates the losses exponentially</strong>. Each trade is bigger, angrier, and less planned than the last.</p>
            <p className="text-gray-400 leading-relaxed">The good news: it&apos;s completely preventable. All you need is one tool &mdash; a <strong className="text-white">circuit breaker</strong> &mdash; and the discipline to follow it.</p>
          </div>
          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">A prop firm trader lost $320 on a valid EUR/USD setup at 8:15am London. By 11:30am, he&apos;d taken 7 more trades &mdash; none of which met his criteria &mdash; and was down $4,200. His first loss was 0.8% of his account. His revenge trading turned it into 10.5%. He failed the prop challenge that day. The first loss was fine. The next 7 were revenge.</p>
          </div>
        </motion.div>
      </section>

      {/* SECTION 01 — THE SPIRAL */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Revenge Spiral</p>
          <h2 className="text-2xl font-extrabold mb-4">Watch a 1% Loss Become 15%</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">This animation shows exactly how a single planned loss escalates through revenge trades. The green dashed line shows where you SHOULD have stopped.</p>
          <SpiralAnimation />
        </motion.div>
      </section>

      {/* SECTION 02 — THE FIVE STAGES */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Five Stages of Revenge</p>
          <h2 className="text-2xl font-extrabold mb-2">How the Spiral Unfolds</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">Every revenge spiral follows the same 5-stage progression. Recognising which stage you&apos;re in is the first step to stopping it.</p>
        </motion.div>
        <div className="space-y-3">
          {[
            { stage: '1. The Trigger', emoji: '&#128308;', color: 'text-red-400', desc: 'A loss occurs. It might be planned (stop hit) or unexpected (slippage, news spike). The loss itself is usually small &mdash; -0.5R to -1R. This is NORMAL and EXPECTED.', danger: 'The trigger isn&apos;t the problem. Every trader takes losses. The problem is what happens NEXT &mdash; the emotional reaction.', timeframe: 'Instant. The loss hits and the emotional cascade begins within seconds.' },
            { stage: '2. The Anger', emoji: '&#128545;', color: 'text-orange-400', desc: 'Your amygdala fires. You feel heat, tension, frustration. Your internal monologue shifts: &quot;That was unfair.&quot; &quot;I was right, the market was wrong.&quot; &quot;I need to get that back.&quot;', danger: 'This is the CRITICAL window. If you can interrupt yourself HERE, the spiral dies. Every second you stay at the screen makes it harder.', timeframe: '30 seconds to 5 minutes. This is when the circuit breaker must activate.' },
            { stage: '3. The Justification', emoji: '&#129300;', color: 'text-yellow-400', desc: 'Your rational brain starts working FOR the revenge trade instead of against it. &quot;I see a setup.&quot; &quot;The entry is right there.&quot; &quot;Just one more trade to recover.&quot; You&apos;re not analysing &mdash; you&apos;re rationalising.', danger: 'This stage feels rational but ISN&apos;T. Your brain is manufacturing reasons to do what your emotions have already decided. The &quot;setup&quot; you see is confirmation bias.', timeframe: '5-15 minutes after the loss. The longer you stare at charts, the more justifications you generate.' },
            { stage: '4. The Revenge Trade', emoji: '&#128165;', color: 'text-red-500', desc: 'You enter. Usually with bigger size (&quot;to recover faster&quot;), a wider stop (&quot;I&apos;m not getting stopped out again&quot;), or no stop at all (&quot;it&apos;ll come back&quot;). Every rule is broken.', danger: 'The revenge trade has NO edge. It wasn&apos;t planned. The size is wrong. The emotional state is wrong. The probability of winning is dramatically lower than a normal, planned trade.', timeframe: '15-30 minutes after the original loss. By now, you&apos;re fully in the spiral.' },
            { stage: '5. The Escalation', emoji: '&#128680;', color: 'text-red-600', desc: 'The revenge trade loses. Now you&apos;re down -3R or more. The anger doubles. You take another revenge trade, even bigger. And another. Each loss feeds the next. This continues until either you force yourself to stop, or your account forces you.', danger: 'Escalation has NO natural stopping point. The emotional state only gets worse with each loss. The only circuit breaker is a PRE-SET rule or an empty account.', timeframe: '30 minutes to several hours. Some traders revenge-trade across entire sessions.' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <button onClick={() => setOpenStage(openStage === s.stage ? null : s.stage)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                <div className="flex items-center gap-3">
                  <span className="text-xl" dangerouslySetInnerHTML={{ __html: s.emoji }} />
                  <p className={`text-sm font-extrabold ${s.color}`}>{s.stage}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openStage === s.stage ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openStage === s.stage && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="px-4 pb-4 pt-2 space-y-2">
                      <p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: s.desc }} />
                      <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/15"><p className="text-xs font-bold text-red-400 mb-1">&#9888;&#65039; Danger</p><p className="text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: s.danger }} /></div>
                      <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/15"><p className="text-xs font-bold text-amber-400 mb-1">&#9203; Timeframe</p><p className="text-sm text-gray-400">{s.timeframe}</p></div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 03 — WARNING SIGNS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; Warning Signs</p>
          <h2 className="text-2xl font-extrabold mb-2">You&apos;re Revenge Trading If&hellip;</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">Recognise these in yourself BEFORE the damage is done.</p>
        </motion.div>
        <div className="space-y-3">
          {[
            { sign: 'You&apos;re thinking about the MONEY you lost, not the SETUP', why: 'Disciplined traders think in R-multiples and process. Revenge traders think in pounds and dollars. When your internal monologue switches from &quot;that was a valid 1R stop&quot; to &quot;I just lost £200,&quot; the emotional brain has taken over.' },
            { sign: 'Your position size just increased', why: 'The only reason to increase size mid-session is revenge. Your risk parameters were set during your calm, pre-session planning. Any deviation upward during the session is emotion.' },
            { sign: 'You&apos;re trading a pair or setup NOT in your plan', why: 'If you suddenly start scanning pairs you don&apos;t normally trade, you&apos;re hunting for a win &mdash; any win &mdash; to offset the loss. This has zero edge.' },
            { sign: 'You feel physical symptoms: heat, tension, rapid heartbeat', why: 'Your body is telling you what your mind won&apos;t. Anger triggers physical stress responses. If you notice any of these, you are NOT in a state to make financial decisions.' },
            { sign: 'You&apos;ve said (or thought) &quot;I need to get it back&quot;', why: 'This is THE defining phrase of revenge trading. There is nothing to &quot;get back.&quot; The lost money is gone. Each new trade is independent. The next trade doesn&apos;t know about the last trade.' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <button onClick={() => setOpenSign(openSign === s.sign ? null : s.sign)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                <p className="text-sm font-extrabold text-red-400" dangerouslySetInnerHTML={{ __html: `&#128680; ${s.sign}` }} />
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSign === s.sign ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openSign === s.sign && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="px-4 pb-4 pt-2"><p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: s.why }} /></div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 04 — THE CIRCUIT BREAKER */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The Circuit Breaker</p>
          <h2 className="text-2xl font-extrabold mb-4">Your #1 Defence Tool</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">A circuit breaker creates a <strong className="text-white">mandatory gap</strong> between the loss and your next action. It&apos;s the single most effective tool against revenge trading.</p>
          <CircuitBreakerAnimation />
          <div className="mt-6 space-y-3">
            {[
              { rule: 'After 1 loss: 15-minute break', desc: 'Close the chart you just lost on. Stand up. Walk to a different room. Drink water. Set a timer for 15 minutes. Do NOT look at any charts until the timer completes.', why: 'The initial anger peaks in the first 5 minutes and subsides by 15. This short break is enough to reset your emotional state for most single losses.' },
              { rule: 'After 2 consecutive losses: 2-hour break', desc: 'Close ALL charts. Close the trading platform. Leave your desk entirely. Do something completely unrelated to trading for 2 hours minimum.', why: 'Two consecutive losses generate compounding frustration. The urge to &quot;fix it&quot; becomes overwhelming. A 2-hour break allows your cortisol levels to normalise and your rational brain to fully re-engage.' },
              { rule: 'After hitting daily loss limit (-2R or -3R): Done for the day', desc: 'Close the platform. Do not re-open it until your next planned session. The day is over. Journal what happened. Review tomorrow.', why: 'Your daily loss limit exists to prevent catastrophic days. If you&apos;ve hit it, continuing to trade means EVERY subsequent loss pushes you deeper into a hole that takes days to climb out of.' },
              { rule: 'After 3 losing days in a row: reduce size for 3 days', desc: 'Cut your position size to 50% of normal for the next 3 trading days. Maintain all other rules. This is not &quot;scared&quot; trading &mdash; it&apos;s capital preservation.', why: 'Consecutive losing days compound emotional damage. Reduced size limits the financial impact while you verify whether the losses are variance (normal) or execution drift (problem).' },
            ].map((r, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <button onClick={() => setOpenRule(openRule === r.rule ? null : r.rule)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <p className="text-sm font-extrabold text-amber-400">{r.rule}</p>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openRule === r.rule ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openRule === r.rule && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4 pt-2 space-y-2">
                        <p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: r.desc }} />
                        <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/15"><p className="text-xs font-bold text-amber-400 mb-1">&#128161; Why It Works</p><p className="text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: r.why }} /></div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* SECTION 05 — INTERACTIVE SIMULATOR */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Revenge Spiral Simulator</p>
          <h2 className="text-2xl font-extrabold mb-2">Walk Through the Spiral</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">Experience the decision points of a revenge spiral. At each stage, choose your response.</p>
        </motion.div>
        <div className="p-5 rounded-2xl glass-card">
          {simStep < simSteps.length ? (
            <>
              <p className="text-xs text-amber-400 font-bold mb-3">Stage {simStep + 1} of {simSteps.length}</p>
              <p className="text-sm text-gray-300 leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: simSteps[simStep].text }} />
              <div className="space-y-2">
                {simSteps[simStep].opts.map((opt, oi) => {
                  const chosen = simChoices[simStep];
                  const isChosen = chosen === opt.result;
                  let cls = 'glass text-gray-300 hover:bg-white/5';
                  if (chosen) {
                    if (isChosen && opt.result === 'good') cls = 'bg-green-500/15 border-green-500/30 text-green-400';
                    else if (isChosen && opt.result === 'okay') cls = 'bg-amber-500/15 border-amber-500/30 text-amber-400';
                    else if (isChosen && opt.result === 'bad') cls = 'bg-orange-500/15 border-orange-500/30 text-orange-400';
                    else if (isChosen && opt.result === 'terrible') cls = 'bg-red-500/15 border-red-500/30 text-red-400';
                    else if (opt.result === 'good') cls = 'bg-green-500/10 border-green-500/20 text-green-400/60';
                    else cls = 'glass text-gray-600';
                  }
                  return (
                    <button key={oi} onClick={() => { if (!chosen) { const nc = [...simChoices]; nc[simStep] = opt.result; setSimChoices(nc); }}} disabled={!!chosen} className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${cls}`}>
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              {simChoices[simStep] && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15 text-sm text-gray-400 leading-relaxed mb-3">
                    <span className="text-amber-400 font-bold">Feedback: </span>
                    <span dangerouslySetInnerHTML={{ __html: simSteps[simStep].opts.find(o => o.result === simChoices[simStep])?.feedback || '' }} />
                  </div>
                  {simStep < simSteps.length - 1 && (
                    <button onClick={() => setSimStep(s => s + 1)} className="w-full p-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all">Next Stage &rarr;</button>
                  )}
                </motion.div>
              )}
            </>
          ) : null}
          {simStep === simSteps.length - 1 && simChoices[simStep] && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-4 rounded-xl glass-card text-center">
              <p className="text-sm text-amber-400 font-bold">Simulator Complete</p>
              <p className="text-xs text-gray-400 mt-1">The circuit breaker saved you from a revenge spiral. Without it, -1.5R could easily have become -6R or worse.</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* SECTION 06 — RECOVERY TOOLS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Recovery Tools</p>
          <h2 className="text-2xl font-extrabold mb-2">What to Do During Your Break</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">The circuit breaker buys you time. Here&apos;s what to fill that time with.</p>
        </motion.div>
        <div className="space-y-3">
          {[
            { tool: 'Physical movement', icon: '&#127939;', desc: 'Walk for 10 minutes. Do pushups. Stretch. Physical activity reduces cortisol (the stress hormone) and clears the mental fog that anger creates. You don&apos;t need a gym &mdash; just move your body.' },
            { tool: 'Journal the loss', icon: '&#128221;', desc: 'Write down: what happened, what you felt, what you wanted to do, and what you actually did (followed the circuit breaker). This creates a paper trail that your future self can reference during the next spiral.' },
            { tool: 'Re-read your trading plan', icon: '&#128196;', desc: 'Literally open your trading plan document and read it. Every word. This reconnects you with the version of yourself that wrote those rules when calm and rational.' },
            { tool: 'Review your equity curve', icon: '&#128200;', desc: 'Look at your last 30 days of results. One bad day doesn&apos;t define your edge. The equity curve provides context: &quot;I&apos;m down -1.5R today but up +12R this month.&quot; Perspective kills revenge impulses.' },
          ].map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <button onClick={() => setOpenTool(openTool === t.tool ? null : t.tool)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                <div className="flex items-center gap-3">
                  <span className="text-xl" dangerouslySetInnerHTML={{ __html: t.icon }} />
                  <p className="text-sm font-extrabold text-white">{t.tool}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openTool === t.tool ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openTool === t.tool && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="px-4 pb-4 pt-2"><p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: t.desc }} /></div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 07 — THE MATHS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; The Maths of Revenge</p>
          <h2 className="text-2xl font-extrabold mb-2">Why Recovery Gets Exponentially Harder</h2>
          <div className="mt-6 space-y-3">
            {[
              { loss: '-1%', recovery: '+1.01%', days: '~1 day', color: 'text-green-400' },
              { loss: '-5%', recovery: '+5.26%', days: '~3-5 days', color: 'text-green-300' },
              { loss: '-10%', recovery: '+11.1%', days: '~1-2 weeks', color: 'text-amber-400' },
              { loss: '-20%', recovery: '+25.0%', days: '~3-4 weeks', color: 'text-orange-400' },
              { loss: '-50%', recovery: '+100%', days: '~months', color: 'text-red-400' },
            ].map((r, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl glass-card">
                <div>
                  <p className="text-sm font-extrabold text-red-400">{r.loss} loss</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-extrabold ${r.color}`}>Needs {r.recovery} to recover</p>
                  <p className="text-xs text-gray-500">{r.days} at 1% per day</p>
                </div>
              </div>
            ))}
            <div className="p-4 rounded-xl glass-card">
              <p className="text-sm text-amber-400 font-bold mb-2">The deeper you go, the harder it is to climb out.</p>
              <p className="text-sm text-gray-400 leading-relaxed">A -1% loss needs +1% to recover (easy). A -50% loss needs +100% to recover (nearly impossible). Every revenge trade pushes you deeper into a hole where recovery becomes exponentially harder. The circuit breaker&apos;s job is to keep you in the shallow end &mdash; where recovery is quick and painless.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 08 — COMMON MISTAKES */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-4">Revenge Trading Traps</h2>
        </motion.div>
        <div className="space-y-3">
          {[
            { mistake: 'Having a circuit breaker but not following it', wrong: '&quot;I know the rule is 2 losses = stop. But this setup is different.&quot; Every trader who blows an account has a rule they ignored. The circuit breaker only works if it&apos;s NON-NEGOTIABLE.', right: 'Treat the circuit breaker like a law of physics, not a suggestion. Gravity doesn&apos;t care about exceptions. Neither should your circuit breaker.', tip: 'If you struggle to follow it, set a physical alarm on your phone. When it rings, you MUST close charts. No override.' },
            { mistake: 'Switching pairs instead of stopping', wrong: '&quot;I&apos;m done with EUR/USD. But this USD/JPY setup looks good.&quot; Switching pairs doesn&apos;t reset your emotional state. You carry the anger and the desire for recovery into every new instrument.', right: 'The circuit breaker means ALL trading stops. Not just the pair you lost on. Your emotional state is the problem, not the currency pair.', tip: 'Close the PLATFORM, not just the chart. If MetaTrader is still open, the temptation remains.' },
            { mistake: '&quot;Revenge trading with small size doesn&apos;t count&quot;', wrong: 'Trading with 0.01 lots to &quot;work through&quot; the anger. This still reinforces the habit of trading while emotional, and the small wins give false confidence to trade bigger next time.', right: 'During a circuit breaker, NO trades of ANY size. The break is about resetting your psychology, not adjusting your position size.', tip: 'Small revenge trades teach your brain that &quot;I can bypass my rules if I reduce size.&quot; This eventually leads to bypassing rules at full size.' },
            { mistake: 'Not having a circuit breaker at all', wrong: '&quot;I have discipline, I don&apos;t need rules for this.&quot; Famous last words. EVERYONE needs a circuit breaker, including professional traders with 20 years of experience. Without one, the spiral is only a matter of time.', right: 'Write your circuit breaker rules NOW, during this lesson, while you&apos;re calm and rational. Put them in your trading plan. Make them non-negotiable.', tip: 'The fact that you haven&apos;t needed one yet doesn&apos;t mean you won&apos;t. It means the worst day hasn&apos;t happened yet. Be ready.' },
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

      {/* SECTION 09 — GAME */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Break the Spiral</p>
          <h2 className="text-2xl font-extrabold mb-2">Revenge Trading Game</h2>
          <p className="text-sm text-gray-400 mb-6">Five post-loss scenarios. Choose the response that breaks the cycle.</p>
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
            <p className="text-sm text-gray-400">{gameScore === 5 ? '&#128293; Perfect. The spiral has no power over you.' : gameScore >= 3 ? 'Good awareness. Build your circuit breaker rules tonight.' : 'The revenge impulse is still strong. Re-read the five stages and warning signs.'}</p>
          </motion.div>
        )}
      </section>

      {/* SECTION 10 — QUIZ */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Knowledge Check</p>
          <h2 className="text-2xl font-extrabold mb-6">Revenge Trading Quiz</h2>
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
        {quizDone && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 text-center p-8 glass-card rounded-2xl"><p className={`text-5xl font-extrabold mb-2 ${score >= 66 ? 'text-amber-400' : 'text-red-400'}`}>{score}%</p><p className="text-sm text-gray-400">{score === 100 ? '&#128293; Perfect. The cycle is broken.' : score >= 66 ? 'Strong spiral awareness. Write your circuit breaker rules tonight.' : 'Review the five stages and the circuit breaker framework.'}</p></motion.div>)}
      </section>

      {/* Certificate */}
      <section className="px-5 py-16 text-center">
        {!certUnlocked ? (
          <div className="max-w-md mx-auto p-8 glass rounded-2xl"><p className="text-4xl mb-3 opacity-30">&#128274;</p><p className="text-sm text-gray-500">Score 66%+ to unlock your <strong className="text-amber-400">Pro Certificate</strong></p></div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, type: 'spring' }}
            className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(239,68,68,0.06),transparent,rgba(249,115,22,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
            <div className="absolute inset-[1px] rounded-3xl border border-amber-500/10" />
            <div className="relative z-10">
              <div className="w-[80px] h-[80px] mx-auto mb-5 rounded-full bg-gradient-to-br from-red-500 via-orange-500 to-amber-500 flex items-center justify-center text-4xl shadow-lg shadow-red-500/20">&#128721;</div>
              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest mb-2">Pro Certificate</p>
              <h3 className="text-xl font-extrabold mb-1">Certificate of Mastery</h3>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">Has mastered<br /><strong className="text-white">Level 4.4: Revenge Trading &mdash; Breaking the Cycle</strong><br />at ATLAS Academy by Interakktive</p>
              <p className="bg-gradient-to-r from-red-400 via-orange-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Spiral Breaker &mdash;</p>
              <p className="font-mono text-[11px] text-gray-500 mb-4">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L4.4-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
            </div>
          </motion.div>
        )}
      </section>

      <section className="text-center px-5 pt-10 pb-24">
        <p className="text-xs tracking-widest uppercase text-gray-600 mb-4">Up Next</p>
        <h2 className="text-xl font-bold mb-6">Lesson 4.5 &mdash; Loss Acceptance &mdash; Your Superpower</h2>
        <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">
          Continue <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
