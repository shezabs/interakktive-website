// app/academy/lesson/patience-skill/page.tsx
// ATLAS Academy — Lesson 4.8: The Waiting Game — Patience as a Skill [PRO]
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
// SNIPER ANIMATION — Patient sniper vs spray-and-pray
// ============================================================
function SniperAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);
    const midX = w / 2;
    const midY = h / 2;

    // Divider
    ctx.strokeStyle = 'rgba(148,163,184,0.1)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(midX, 20);
    ctx.lineTo(midX, h - 20);
    ctx.stroke();
    ctx.setLineDash([]);

    // LEFT — Spray and pray
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(239,68,68,0.5)';
    ctx.fillText('SPRAY & PRAY', midX / 2, 30);
    ctx.font = '7px system-ui';
    ctx.fillStyle = 'rgba(239,68,68,0.3)';
    ctx.fillText('12 trades/day', midX / 2, 42);

    // Many scattered shots
    const shots = 14;
    for (let i = 0; i < shots; i++) {
      const angle = (i / shots) * Math.PI * 2 + f * 0.005;
      const spread = 40 + Math.sin(i * 1.7 + f * 0.02) * 30;
      const sx = midX / 2 + Math.cos(angle) * spread;
      const sy = midY + Math.sin(angle) * spread * 0.7;
      const alpha = 0.15 + Math.sin(f * 0.03 + i) * 0.1;
      ctx.fillStyle = `rgba(239,68,68,${alpha})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Target circle (left)
    ctx.strokeStyle = 'rgba(239,68,68,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(midX / 2, midY, 50, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(midX / 2, midY, 25, 0, Math.PI * 2);
    ctx.stroke();

    // Result (left)
    ctx.font = 'bold 10px system-ui';
    ctx.fillStyle = 'rgba(239,68,68,0.6)';
    ctx.fillText('-4.2R', midX / 2, h - 30);

    // RIGHT — Sniper
    ctx.font = 'bold 9px system-ui';
    ctx.fillStyle = 'rgba(34,197,94,0.5)';
    ctx.fillText('SNIPER', midX + midX / 2, 30);
    ctx.font = '7px system-ui';
    ctx.fillStyle = 'rgba(34,197,94,0.3)';
    ctx.fillText('2 trades/day', midX + midX / 2, 42);

    // Crosshair (right)
    const cx = midX + midX / 2;
    const cy = midY;
    ctx.strokeStyle = 'rgba(34,197,94,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, 50, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, 25, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 60, cy);
    ctx.lineTo(cx + 60, cy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy - 60);
    ctx.lineTo(cx, cy + 60);
    ctx.stroke();

    // 2 precise shots near centre
    const pulse = Math.sin(f * 0.04) * 2;
    ctx.fillStyle = 'rgba(34,197,94,0.7)';
    ctx.beginPath();
    ctx.arc(cx - 3 + pulse, cy + 2, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 4, cy - 3 + pulse * 0.5, 4, 0, Math.PI * 2);
    ctx.fill();

    // Result (right)
    ctx.font = 'bold 10px system-ui';
    ctx.fillStyle = 'rgba(34,197,94,0.6)';
    ctx.fillText('+3.8R', cx, h - 30);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// HOURGLASS ANIMATION — 90% waiting, 10% trading
// ============================================================
function HourglassAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);
    const midX = w / 2;
    const midY = h / 2;
    const glassH = h * 0.6;
    const glassW = w * 0.18;
    const top = midY - glassH / 2;
    const bot = midY + glassH / 2;

    // Hourglass outline
    ctx.strokeStyle = 'rgba(148,163,184,0.2)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(midX - glassW, top);
    ctx.lineTo(midX + glassW, top);
    ctx.lineTo(midX + 4, midY);
    ctx.lineTo(midX + glassW, bot);
    ctx.lineTo(midX - glassW, bot);
    ctx.lineTo(midX - 4, midY);
    ctx.closePath();
    ctx.stroke();

    // Top sand (blue — waiting)
    const fillPct = 0.5 + Math.sin(f * 0.015) * 0.35;
    const sandTop = top + glassH * 0.5 * (1 - fillPct) * 0.45;
    ctx.fillStyle = 'rgba(59,130,246,0.15)';
    ctx.beginPath();
    const topW = glassW * (1 - (sandTop - top) / (glassH * 0.5) * 0.85);
    ctx.moveTo(midX - topW, sandTop);
    ctx.lineTo(midX + topW, sandTop);
    ctx.lineTo(midX + 4, midY);
    ctx.lineTo(midX - 4, midY);
    ctx.closePath();
    ctx.fill();

    // Bottom sand (amber — trading)
    const botFill = 1 - fillPct;
    const sandBot = bot - glassH * 0.5 * botFill * 0.45;
    ctx.fillStyle = 'rgba(245,158,11,0.2)';
    ctx.beginPath();
    const botW = glassW * (1 - (bot - sandBot) / (glassH * 0.5) * 0.85);
    ctx.moveTo(midX - botW, sandBot);
    ctx.lineTo(midX + botW, sandBot);
    ctx.lineTo(midX + glassW, bot);
    ctx.lineTo(midX - glassW, bot);
    ctx.closePath();
    ctx.fill();

    // Falling grains
    const grainY = midY + ((f * 1.5) % (glassH * 0.4));
    ctx.fillStyle = 'rgba(245,158,11,0.5)';
    ctx.beginPath();
    ctx.arc(midX, grainY, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Labels
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(59,130,246,0.6)';
    ctx.fillText('90% WAITING', midX + glassW + 15, midY - 30);
    ctx.font = '8px system-ui';
    ctx.fillStyle = 'rgba(59,130,246,0.35)';
    ctx.fillText('Analysing, planning, sitting', midX + glassW + 15, midY - 18);

    ctx.font = 'bold 10px system-ui';
    ctx.fillStyle = 'rgba(245,158,11,0.6)';
    ctx.fillText('10% TRADING', midX + glassW + 15, midY + 25);
    ctx.font = '8px system-ui';
    ctx.fillStyle = 'rgba(245,158,11,0.35)';
    ctx.fillText('Executing the plan', midX + glassW + 15, midY + 37);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// DATA
// ============================================================
const impatienceTypes = [
  { type: 'The Boredom Trade', emoji: '&#128564;', desc: 'Nothing is happening. The chart is flat. You enter because doing nothing feels unproductive. But flat markets are WHERE patience pays &mdash; the setup is forming, you just can&apos;t see it yet.', cost: '-1R to -3R per boredom session, plus emotional damage that bleeds into the next real setup.', fix: 'Set a rule: &ldquo;If I&apos;m bored, I leave the screen.&rdquo; Boredom is NOT a trading signal.' },
  { type: 'The Partial Setup', emoji: '&#128300;', desc: 'Three of your four entry criteria are met. Close enough, right? Wrong. A 75% setup is not an A+ setup. It&apos;s a B-grade at best, and B-grades have negative expectancy over time.', cost: 'Erodes your edge. 100 B-grade trades vs 100 A+ trades can be the difference between +30R and -10R.', fix: 'Checklist on screen. ALL boxes ticked or no trade. No exceptions, no &ldquo;close enough.&rdquo;' },
  { type: 'The Revenge Wait', emoji: '&#128545;', desc: 'You&apos;re not really waiting for a setup. You&apos;re waiting for the first opportunity to &ldquo;get back&rdquo; what you lost. This is revenge trading wearing a patience disguise.', cost: 'Worse than obvious revenge trading because you THINK you&apos;re being disciplined.', fix: 'After a loss, set a 15-minute timer. If your first thought when returning is about P&amp;L, step away again.' },
  { type: 'The Session Overstay', emoji: '&#9200;', desc: 'Your session ended 90 minutes ago. But the chart is &ldquo;almost&rdquo; at your level. So you stay. And stay. And the setup never comes &mdash; or it comes when you&apos;re mentally exhausted.', cost: 'Diminished decision quality from fatigue. Plus opportunity cost of the time itself.', fix: 'Hard session end times. When the clock hits your limit, you close the platform. No exceptions.' },
  { type: 'The Social Media Trade', emoji: '&#128241;', desc: 'Someone on Twitter/X posted a winning Gold trade. You don&apos;t trade Gold. You don&apos;t have a setup. But you open a position anyway because &ldquo;everyone else is making money.&rdquo;', cost: 'FOMO-driven entry with no plan, no stop placement logic, no exit strategy. Pure gamble.', fix: 'Unfollow anyone who posts P&amp;L screenshots during market hours. Check social media AFTER your session, not during.' },
];

const patienceTools = [
  { tool: 'The Alert System', desc: 'Set price alerts at your key levels. Then close the chart. Let the alert bring you back &mdash; don&apos;t sit and watch price crawl toward your level. TradingView alerts are free and unlimited on paid plans.' },
  { tool: 'The Session Timer', desc: 'Predefined start and end times. No early starts, no late stays. Example: 08:00&ndash;10:30 London, 14:30&ndash;16:30 New York. Outside these hours, the platform is closed.' },
  { tool: 'The Setup Checklist', desc: 'Physical or digital checklist. Every criterion must be ticked before entry is allowed. If any box is empty, the trade does not happen. Print it. Laminate it. Put it next to your monitor.' },
  { tool: 'The Away Routine', desc: 'What you do while waiting: gym, reading, walking, meal prep. Productive activities that keep you away from the screen and out of trouble. The best traders have hobbies.' },
  { tool: 'The Daily Max Rule', desc: 'Maximum 2&ndash;3 trades per day. Once hit, session is over regardless of what the chart shows. This forces selectivity because you can&apos;t waste entries on B-grade setups.' },
];

const waitingMaths = [
  { label: 'Impatient Trader', trades: 12, winRate: 38, avgWin: 1.5, avgLoss: 1.0, result: '-0.82R/day' },
  { label: 'Patient Trader', trades: 2, winRate: 55, avgWin: 2.5, avgLoss: 1.0, result: '+1.30R/day' },
];

const myths = [
  { myth: '&ldquo;More trades = more profit&rdquo;', reality: 'More trades = more commissions, more spread, more emotional decisions, more fatigue. A trader making 2 high-quality trades beats a trader making 12 mediocre trades almost every time.' },
  { myth: '&ldquo;If I&apos;m not trading, I&apos;m not making money&rdquo;', reality: 'If you&apos;re not trading, you&apos;re not LOSING money. Every day you finish flat is a day you kept your capital intact for tomorrow&apos;s A+ setup. Flat days are winning days.' },
  { myth: '&ldquo;Good traders trade every day&rdquo;', reality: 'Professional traders at prop desks regularly have zero-trade days. Some of the best weeks include 2&ndash;3 days with zero entries. The market doesn&apos;t owe you a setup every day.' },
  { myth: '&ldquo;Patience means sitting and watching the chart all day&rdquo;', reality: 'That&apos;s not patience &mdash; that&apos;s torture. Real patience is setting alerts, walking away, and letting the market come to you. Watching a chart for 8 hours is a recipe for boredom trades.' },
];

const mistakes = [
  { wrong: 'Watching the chart for 8 hours straight', right: 'Mark levels, set alerts, leave. Come back when the alert fires. Your analysis doesn&apos;t improve by staring &mdash; it degrades.', emoji: '&#128065;' },
  { wrong: 'Trading every session because you &ldquo;need to be consistent&rdquo;', right: 'Consistency means consistent PROCESS, not consistent activity. Taking zero trades on a no-setup day IS consistency.', emoji: '&#128197;' },
  { wrong: 'Lowering criteria to find more trades', right: 'If your criteria produce only 1&ndash;2 setups per day, your criteria are correct. Lowering them creates more trades but destroys your edge.', emoji: '&#128200;' },
  { wrong: 'Counting no-trade days as &ldquo;wasted&rdquo; days', right: 'No-trade days where you followed your plan are A+ process days. They belong in your journal with a gold star, not a regret.', emoji: '&#11088;' },
];

const gameScenarios = [
  { scenario: 'It&apos;s 9:45 AM London session. Your key level is 15 pips away. The chart is moving slowly. You&apos;ve been staring for 40 minutes. You feel the urge to &ldquo;scalp something while you wait.&rdquo;', options: ['Take a quick scalp to pass the time &mdash; easy money', 'Set an alert at your level, close the chart, go for a 15-minute walk', 'Switch to a lower timeframe and find a different setup'], correct: 1, explain: 'The boredom trade is one of the biggest account killers. Set the alert, walk away, let the market come to you. The scalp is a gamble disguised as productivity.' },
  { scenario: 'Your checklist requires: trend alignment, order block tap, FVG confluence, and kill zone timing. You have the first three but it&apos;s 30 minutes AFTER kill zone closes. The setup &ldquo;looks perfect.&rdquo;', options: ['Enter anyway &mdash; 3 out of 4 is close enough for such a clean setup', 'Screenshot it for review but DO NOT enter &mdash; the checklist isn&apos;t complete', 'Enter with half size as a compromise'], correct: 1, explain: 'A 75% checklist is a B-grade setup. Your edge comes from A+ ONLY. Screenshot it, learn from it, and wait for the next one that ticks ALL boxes.' },
  { scenario: 'You took a -1R loss at 9:15 AM. At 9:20 AM, another setup appears that meets all your criteria. Your circuit breaker rule says 15-minute wait after a loss. What do you do?', options: ['Take it &mdash; the setup is valid and the loss was just bad luck', 'Wait. Your 15-minute rule exists for a reason. The setup might still be there at 9:30.', 'Take it but move your stop tighter to reduce risk'], correct: 1, explain: 'The 15-minute rule protects you from revenge trading disguised as legitimate setups. If the setup is real, it will still be valid in 10 minutes. If it&apos;s gone by then, it wasn&apos;t meant for you.' },
  { scenario: 'It&apos;s 4:45 PM. Your session was supposed to end at 4:30 PM. But EUR/USD is 3 pips from your order block. You think: &ldquo;Just 5 more minutes.&rdquo;', options: ['Stay &mdash; it&apos;s so close, leaving now would be stupid', 'Close the platform. Your session end time is a rule, not a suggestion. Set an alert for tomorrow.', 'Stay but promise yourself you&apos;ll leave at 5:00 PM sharp'], correct: 1, explain: 'Session overstay is how discipline erodes. &ldquo;Just 5 more minutes&rdquo; becomes 30, then 60. Your rule says 4:30. Close the platform. The level will be there tomorrow.' },
  { scenario: 'You&apos;ve had zero trades for 3 days. Your journal shows clean analysis, correct levels, no setups met criteria. A friend says: &ldquo;You&apos;re not even trying. How do you make money without trading?&rdquo;', options: ['He&apos;s right &mdash; I should lower my criteria to find more trades', 'Three zero-trade days with perfect process is three A+ days. The market didn&apos;t present my edge. That&apos;s fine.', 'Maybe I should switch to a different strategy that trades more often'], correct: 1, explain: 'Three no-trade days with disciplined analysis is elite-level patience. You protected your capital and maintained your edge criteria. Lowering criteria to trade more is the opposite of improvement.' },
];

const quizQuestions = [
  { q: 'What percentage of a professional trader&apos;s time is typically spent WAITING vs EXECUTING?', opts: ['50% waiting, 50% executing', '70% waiting, 30% executing', '90% waiting, 10% executing', '30% waiting, 70% executing'], a: 2, explain: 'Professional trading is approximately 90% waiting and 10% executing. The vast majority of time is spent analysing, planning, and sitting on your hands.' },
  { q: 'What is a &ldquo;boredom trade&rdquo;?', opts: ['A trade taken during quiet market hours for small profit', 'A trade taken because nothing is happening and doing nothing feels unproductive', 'A trade on a boring asset like bonds', 'A practice trade on a demo account'], a: 1, explain: 'A boredom trade is entered because the trader feels they SHOULD be doing something. The chart is flat, no setup exists, but inactivity feels like failure. It&apos;s one of the biggest account killers.' },
  { q: 'Your checklist has 4 criteria. Three are met. What should you do?', opts: ['Enter &mdash; 75% is close enough', 'Enter with reduced position size', 'Do NOT enter &mdash; the checklist is pass/fail, not a percentage', 'Enter and add the missing criterion to &ldquo;watch later&rdquo;'], a: 2, explain: 'The checklist is binary: all boxes ticked = trade, any box empty = no trade. There is no &ldquo;close enough.&rdquo; B-grade setups have negative expectancy over time.' },
  { q: 'What is the best thing to do while waiting for price to reach your level?', opts: ['Watch the chart closely in case something changes', 'Set an alert, close the chart, do something productive', 'Switch to a lower timeframe for more entries', 'Open a demo account and practice'], a: 1, explain: 'Set alerts and walk away. Staring at a chart doesn&apos;t make price move faster &mdash; it makes YOU move faster, into boredom trades and bad decisions.' },
  { q: 'How should you view a day with zero trades where you followed your plan?', opts: ['A wasted day &mdash; no P&amp;L means no progress', 'A failure &mdash; the strategy needs more trade signals', 'An A+ process day &mdash; capital preserved, discipline maintained', 'Acceptable but not ideal'], a: 2, explain: 'A zero-trade day with disciplined analysis is one of the BEST outcomes. You protected capital, maintained edge criteria, and demonstrated professional patience.' },
  { q: 'Why is &ldquo;more trades = more profit&rdquo; a myth?', opts: ['Because commissions eat into profits', 'Because more trades means more emotional decisions, more spread, more fatigue, and lower average quality', 'Because markets are only open for limited hours', 'Because brokers limit the number of daily trades'], a: 1, explain: 'Each additional trade carries spread cost, commission, emotional load, and decision fatigue. Quality degrades as quantity increases. Two A+ trades beat twelve C-grade trades.' },
  { q: 'Your session end time is 4:30 PM. Price is 3 pips from your level at 4:28 PM. What do you do?', opts: ['Stay &mdash; it&apos;s almost there', 'Close at 4:30 sharp &mdash; session end time is a rule, not a suggestion', 'Stay until 5:00 PM just this once', 'Place a limit order and close the platform'], correct: 1, a: 1, explain: 'Session end time is a hard rule. &ldquo;Just 5 more minutes&rdquo; is how discipline erodes. However, placing a limit order (option D) is also acceptable IF it&apos;s part of your plan. But the best habit is clean session endings.' },
  { q: 'What does the sniper analogy teach about trading patience?', opts: ['Traders should only use one instrument', 'Fewer, higher-quality shots produce better results than spraying at everything', 'Snipers never miss their target', 'Trading requires military discipline'], a: 1, explain: 'The sniper takes 1&ndash;2 precise shots with high conviction. The spray-and-pray approach wastes ammunition (capital) on low-probability targets. Fewer trades, higher quality, better results.' },
];

export default function PatienceSkillPage() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h); }, []);

  const [openType, setOpenType] = useState<string | null>(null);
  const [openTool, setOpenTool] = useState<string | null>(null);
  const [openMyth, setOpenMyth] = useState<string | null>(null);
  const [openMistake, setOpenMistake] = useState<string | null>(null);

  // Patience Audit
  const auditQs = [
    'I set alerts instead of watching the chart',
    'I have hard session start and end times',
    'I never trade outside my kill zones',
    'I use a physical/digital checklist before entry',
    'I have a max trades-per-day rule',
    'I have a productive activity for waiting periods',
    'I journal zero-trade days as positive process days',
    'I never enter boredom trades',
  ];
  const [auditAnswers, setAuditAnswers] = useState<(boolean | null)[]>(Array(auditQs.length).fill(null));
  const auditDone = auditAnswers.every(a => a !== null);
  const auditScore = auditDone ? Math.round(auditAnswers.filter(a => a === true).length / auditQs.length * 100) : 0;

  // Game
  const [gameRound, setGameRound] = useState(0);
  const [gameAnswer, setGameAnswer] = useState<number | null>(null);
  const [gameScore, setGameScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  // Quiz
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
          <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 4 &middot; Lesson 8</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight"><span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>The Waiting Game</span></h1>
          <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">90% watching, 10% trading. Most losses come from doing something when you should be doing nothing.</p>
        </motion.div>
      </section>

      {/* S00 — WHY THIS MATTERS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-lg font-bold text-white mb-3">&#127919; Imagine a lion hunting on the savanna. It doesn&apos;t chase every gazelle it sees. It waits &mdash; sometimes for hours &mdash; watching, calculating, conserving energy. Then, when a young or injured gazelle separates from the herd, it strikes with explosive precision.</p>
            <p className="text-gray-400 leading-relaxed mb-4">The lion that chases everything catches nothing. The lion that waits for the <strong className="text-amber-400">perfect opportunity</strong> eats every single time.</p>
            <p className="text-gray-400 leading-relaxed mb-4">Trading is identical. The market presents hundreds of &ldquo;moves&rdquo; per day. Only 1&ndash;3 of those align with your specific edge. <strong className="text-white">Your job is to ignore the other 97% and wait for yours.</strong></p>
            <p className="text-gray-400 leading-relaxed">This is the hardest skill in trading. Not analysis. Not entries. Not exits. <strong className="text-red-400">Sitting on your hands when every fibre of your body screams &ldquo;DO SOMETHING.&rdquo;</strong></p>
          </div>
          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">A trader reviewed his last 60 trades. Of the 60, only 22 met ALL criteria on his checklist. Those 22 produced +31.2R. The other 38 (boredom trades, partial setups, FOMO entries) produced -18.7R. If he had ONLY taken the 22 A+ trades, his monthly return would have been +31.2R instead of +12.5R. Patience alone was worth +18.7R per month.</p>
          </div>
        </motion.div>
      </section>

      {/* S01 — SNIPER vs SPRAY */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; Sniper vs Spray &amp; Pray</p>
          <h2 className="text-2xl font-extrabold mb-4">Two Traders, Same Market, Same Day</h2>
          <p className="text-gray-400 leading-relaxed mb-6">One fires 12 shots hoping something hits. The other waits all morning for 2 perfect targets. By lunchtime, the result isn&apos;t even close.</p>
          <div className="mb-6 rounded-2xl overflow-hidden border border-white/5">
            <SniperAnimation />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {waitingMaths.map(t => (
              <div key={t.label} className={`p-4 rounded-xl glass-card text-center ${t.trades === 2 ? 'border border-green-500/20' : ''}`}>
                <p className={`text-xs font-bold mb-1 ${t.trades === 2 ? 'text-green-400' : 'text-red-400'}`}>{t.label}</p>
                <p className="text-2xl font-extrabold text-white">{t.result}</p>
                <p className="text-xs text-gray-500 mt-1">{t.trades} trades &middot; {t.winRate}% WR &middot; {t.avgWin}:{t.avgLoss} R:R</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S02 — THE HOURGLASS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The 90/10 Rule</p>
          <h2 className="text-2xl font-extrabold mb-4">What Professional Trading Actually Looks Like</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Social media shows you the 10%: the entries, the green numbers, the P&amp;L screenshots. It never shows the 90%: the waiting, the alerts, the zero-trade days, the discipline of doing nothing.</p>
          <div className="mb-6 rounded-2xl overflow-hidden border border-white/5">
            <HourglassAnimation />
          </div>
          <div className="p-5 rounded-2xl glass-card">
            <p className="text-sm font-bold text-white mb-3">A Professional Trader&apos;s Typical Day:</p>
            <div className="space-y-2 text-sm text-gray-400">
              {[
                { time: '07:00', task: 'Pre-session: mark levels, check news, set alerts', pct: 'WAITING' },
                { time: '08:00', task: 'London open: watch for displacement, check alerts', pct: 'WAITING' },
                { time: '08:00&ndash;10:30', task: 'Monitor 2&ndash;3 pairs. 0&ndash;2 setups may appear', pct: 'WAITING + MAYBE TRADING' },
                { time: '10:30', task: 'Session review. If no trade: done for the day.', pct: 'WAITING' },
                { time: '14:30', task: 'NY open: fresh alerts. Same process.', pct: 'WAITING' },
                { time: '16:30', task: 'Session over. Journal. Close platform.', pct: 'DONE' },
              ].map((row, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-amber-400 font-mono text-xs w-20 flex-shrink-0" dangerouslySetInnerHTML={{ __html: row.time }} />
                  <span className="flex-1">{row.task}</span>
                  <span className={`text-xs font-bold flex-shrink-0 ${row.pct.includes('TRADING') ? 'text-amber-400' : row.pct === 'DONE' ? 'text-green-400' : 'text-blue-400'}`}>{row.pct}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* S03 — FIVE TYPES OF IMPATIENCE */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The Five Impatience Traps</p>
          <h2 className="text-2xl font-extrabold mb-4">Know Your Enemy</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Impatience doesn&apos;t always look the same. Here are the five disguises it wears &mdash; and how to spot each one before it costs you.</p>
          <div className="space-y-3">
            {impatienceTypes.map(t => (
              <div key={t.type}>
                <button onClick={() => setOpenType(openType === t.type ? null : t.type)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <div className="flex items-center gap-3"><span dangerouslySetInnerHTML={{ __html: t.emoji }} /><p className="text-sm font-bold text-white">{t.type}</p></div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openType === t.type ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openType === t.type && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden"><div className="p-4 mx-2 mt-1 rounded-xl bg-white/[0.02] border border-white/5 space-y-2"><p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: t.desc }} /><p className="text-xs text-red-400"><strong>Cost:</strong> <span dangerouslySetInnerHTML={{ __html: t.cost }} /></p><p className="text-xs text-green-400"><strong>Fix:</strong> <span dangerouslySetInnerHTML={{ __html: t.fix }} /></p></div></motion.div>)}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S04 — PATIENCE TOOLKIT */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The Patience Toolkit</p>
          <h2 className="text-2xl font-extrabold mb-4">Five Tools That Make Waiting Easier</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Patience isn&apos;t willpower. It&apos;s systems. Build the right systems and patience becomes automatic.</p>
          <div className="space-y-3">
            {patienceTools.map(t => (
              <div key={t.tool}>
                <button onClick={() => setOpenTool(openTool === t.tool ? null : t.tool)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <p className="text-sm font-bold text-white">{t.tool}</p>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openTool === t.tool ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openTool === t.tool && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden"><div className="p-4 mx-2 mt-1 rounded-xl bg-white/[0.02] border border-white/5"><p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: t.desc }} /></div></motion.div>)}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S05 — PATIENCE AUDIT */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Self-Assessment</p>
          <h2 className="text-2xl font-extrabold mb-4">Your Patience Audit</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Answer honestly. This isn&apos;t a test &mdash; it&apos;s a diagnostic. Every &ldquo;No&rdquo; is an area to improve.</p>
          <div className="p-5 rounded-2xl glass-card">
            <div className="space-y-4">
              {auditQs.map((q, i) => (
                <div key={i} className="flex items-center justify-between">
                  <p className="text-sm text-gray-300 flex-1 mr-4">{q}</p>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => { const na = [...auditAnswers]; na[i] = true; setAuditAnswers(na); }} className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${auditAnswers[i] === true ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'glass text-gray-500 hover:text-gray-300'}`}>Yes</button>
                    <button onClick={() => { const na = [...auditAnswers]; na[i] = false; setAuditAnswers(na); }} className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${auditAnswers[i] === false ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'glass text-gray-500 hover:text-gray-300'}`}>No</button>
                  </div>
                </div>
              ))}
            </div>
            {auditDone && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-4 rounded-xl border border-white/10 text-center">
                <p className={`text-4xl font-extrabold mb-1 ${auditScore >= 75 ? 'text-green-400' : auditScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{auditScore}%</p>
                <p className="text-sm text-gray-400">Patience Score</p>
                <p className="text-xs text-gray-500 mt-2">{auditScore >= 75 ? 'Strong patience framework. You have the systems in place.' : auditScore >= 50 ? 'Decent foundation but gaps exist. Focus on your &ldquo;No&rdquo; answers.' : 'Significant work needed. Start with alerts and session times &mdash; the two highest-impact tools.'}</p>
                <button onClick={() => setAuditAnswers(Array(auditQs.length).fill(null))} className="mt-3 text-xs text-amber-400 hover:text-amber-300 transition">Retake &rarr;</button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </section>

      {/* S06 — THE MATHS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; The Maths of Patience</p>
          <h2 className="text-2xl font-extrabold mb-4">What Removing Bad Trades Is Worth</h2>
          <p className="text-gray-400 leading-relaxed mb-6">You don&apos;t need a better strategy. You need FEWER trades.</p>
          <div className="p-5 rounded-2xl glass-card">
            <div className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-gray-500">60 total trades taken</span><span className="text-white font-bold">+12.5R net</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">22 A+ trades (met all criteria)</span><span className="text-green-400 font-bold">+31.2R</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">38 non-A+ trades (boredom, partial, FOMO)</span><span className="text-red-400 font-bold">-18.7R</span></div>
              <div className="border-t border-white/10 pt-3 flex justify-between text-sm"><span className="text-amber-400 font-bold">Value of patience (eliminating 38 trades)</span><span className="text-amber-400 font-bold">+18.7R/month</span></div>
            </div>
            <p className="text-xs text-gray-500 mt-4">On a &pound;10,000 account at 1% risk, that&apos;s <strong className="text-white">&pound;1,870 per month</strong> from doing LESS, not more.</p>
          </div>
        </motion.div>
      </section>

      {/* S07 — MYTHS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Myths Busted</p>
          <h2 className="text-2xl font-extrabold mb-4">Patience Myths That Cost You Money</h2>
          <div className="space-y-3">
            {myths.map(m => (
              <div key={m.myth}>
                <button onClick={() => setOpenMyth(openMyth === m.myth ? null : m.myth)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <p className="text-sm font-bold text-white" dangerouslySetInnerHTML={{ __html: m.myth }} />
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openMyth === m.myth ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openMyth === m.myth && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden"><div className="p-4 mx-2 mt-1 rounded-xl bg-white/[0.02] border border-white/5"><p className="text-xs font-bold text-green-400 mb-1">&#10003; Reality:</p><p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: m.reality }} /></div></motion.div>)}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S08 — COMMON MISTAKES */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-4">What Most Traders Get Wrong</h2>
          <div className="space-y-3">
            {mistakes.map(m => (
              <div key={m.wrong}>
                <button onClick={() => setOpenMistake(openMistake === m.wrong ? null : m.wrong)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <div className="flex items-center gap-3"><span dangerouslySetInnerHTML={{ __html: m.emoji }} /><p className="text-sm font-bold text-white" dangerouslySetInnerHTML={{ __html: `&#10060; ${m.wrong}` }} /></div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openMistake === m.wrong ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openMistake === m.wrong && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden"><div className="p-4 mx-2 mt-1 rounded-xl bg-white/[0.02] border border-white/5"><p className="text-xs font-bold text-green-400 mb-1">&#10003; Instead:</p><p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: m.right }} /></div></motion.div>)}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S09 — GAME */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Discipline Game</p>
          <h2 className="text-2xl font-extrabold mb-6">The Waiting Game &mdash; 5 Scenarios</h2>
          {!gameComplete ? (
          <div className="p-5 rounded-2xl glass-card">
            <p className="text-xs text-amber-400 font-bold mb-4">Round {gameRound + 1} of {gameScenarios.length}</p>
            <p className="text-sm text-gray-300 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: currentGame.scenario }} />
            <div className="space-y-2">
              {currentGame.options.map((opt, oi) => {
                const answered = gameAnswer !== null;
                const isCorrect = oi === currentGame.correct;
                const isChosen = gameAnswer === oi;
                let cls = 'glass text-gray-300 hover:bg-white/5';
                if (answered) { if (isCorrect) cls = 'bg-green-500/15 border-green-500/30 text-green-400'; else if (isChosen) cls = 'bg-red-500/15 border-red-500/30 text-red-400'; else cls = 'glass text-gray-600'; }
                return (<button key={oi} onClick={() => { if (!answered) { setGameAnswer(oi); if (oi === currentGame.correct) setGameScore(s => s + 1); } }} disabled={answered} className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt }} /> {answered && isCorrect && '\u2713'} {answered && isChosen && !isCorrect && '\u2717'}</button>);
              })}
            </div>
            {gameAnswer !== null && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 text-sm text-gray-400 leading-relaxed"><span dangerouslySetInnerHTML={{ __html: currentGame.explain }} /></motion.div>)}
            {gameAnswer !== null && (
              <div className="mt-4">
                {gameRound < gameScenarios.length - 1 ? (
                  <button onClick={() => { setGameRound(r => r + 1); setGameAnswer(null); }} className="w-full p-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all">Next Round &rarr;</button>
                ) : (
                  <button onClick={() => setGameComplete(true)} className="w-full p-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all">See Results &rarr;</button>
                )}
              </div>
            )}
          </div>
          ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-8 glass-card rounded-2xl">
            <p className="text-4xl font-extrabold text-amber-400 mb-2">{gameScore}/{gameScenarios.length}</p>
            <p className="text-sm text-gray-400">{gameScore === 5 ? 'Perfect patience. You wait like a sniper.' : gameScore >= 3 ? 'Good instincts. Watch out for the boredom trade and session overstay.' : 'The boredom trade is winning. Re-read the five impatience traps.'}</p>
          </motion.div>
          )}
        </motion.div>
      </section>

      {/* S10 — QUIZ */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Knowledge Check</p>
          <h2 className="text-2xl font-extrabold mb-6">The Waiting Game Quiz</h2>
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
        {quizDone && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 text-center p-8 glass-card rounded-2xl"><p className={`text-5xl font-extrabold mb-2 ${score >= 66 ? 'text-amber-400' : 'text-red-400'}`}>{score}%</p><p className="text-sm text-gray-400">{score === 100 ? '&#127919; Perfect. The lion waits, then strikes.' : score >= 66 ? 'Strong patience awareness. Now build the systems.' : 'Review the five impatience traps and the patience toolkit.'}</p></motion.div>)}
      </section>

      {/* Certificate */}
      <section className="px-5 py-16 text-center">
        {!certUnlocked ? (
          <div className="max-w-md mx-auto p-8 glass rounded-2xl"><p className="text-4xl mb-3 opacity-30">&#128274;</p><p className="text-sm text-gray-500">Score 66%+ to unlock your <strong className="text-amber-400">Pro Certificate</strong></p></div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, type: 'spring' }}
            className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(59,130,246,0.06),transparent,rgba(245,158,11,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
            <div className="absolute inset-[1px] rounded-3xl border border-amber-500/10" />
            <div className="relative z-10">
              <div className="w-[80px] h-[80px] mx-auto mb-5 rounded-full bg-gradient-to-br from-blue-500 via-amber-500 to-orange-500 flex items-center justify-center text-4xl shadow-lg shadow-blue-500/20">&#127919;</div>
              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest mb-2">Pro Certificate</p>
              <h3 className="text-xl font-extrabold mb-1">Certificate of Mastery</h3>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">Has mastered<br /><strong className="text-white">Level 4.8: The Waiting Game</strong><br />at ATLAS Academy by Interakktive</p>
              <p className="bg-gradient-to-r from-blue-400 via-amber-400 to-orange-400 bg-clip-text text-transparent font-bold text-lg mb-1" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Patient Predator &mdash;</p>
              <p className="font-mono text-[11px] text-gray-500 mb-4">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L4.8-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
            </div>
          </motion.div>
        )}
      </section>

      <section className="text-center px-5 pt-10 pb-24">
        <p className="text-xs tracking-widest uppercase text-gray-600 mb-4">Up Next</p>
        <h2 className="text-xl font-bold mb-6">Lesson 4.9 &mdash; Building Your Trading Routine</h2>
        <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">
          Continue <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
