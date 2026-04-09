// app/academy/lesson/loss-acceptance/page.tsx
// ATLAS Academy — Lesson 4.5: Loss Acceptance — Your Superpower [PRO]
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
// CASINO OWNER ANIMATION — House edge over many hands
// ============================================================
function CasinoOwnerAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);

    const chartL = 50; const chartR = w - 20; const chartT = 40; const chartB = h - 35;
    const chartW = chartR - chartL; const chartH = chartB - chartT;

    // Generate a seeded equity curve: 45% win rate, 1:2.5 R:R
    const seed = 42;
    let s = seed;
    const rand = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    const totalTrades = 200;
    const equity: number[] = [0];
    let bal = 0;
    for (let i = 0; i < totalTrades; i++) {
      if (rand() < 0.45) bal += 2.5; else bal -= 1;
      equity.push(bal);
    }

    const maxBal = Math.max(...equity);
    const minBal = Math.min(...equity);
    const range = maxBal - minBal || 1;

    const cycle = (f % 900) / 900;
    const visiblePts = Math.floor(cycle * totalTrades);

    // Zero line
    const zeroY = chartB - ((0 - minBal) / range) * chartH;
    ctx.strokeStyle = 'rgba(148,163,184,0.1)';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(chartL, zeroY);
    ctx.lineTo(chartR, zeroY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = '7px system-ui';
    ctx.fillStyle = 'rgba(148,163,184,0.25)';
    ctx.textAlign = 'right';
    ctx.fillText('0R', chartL - 5, zeroY + 3);

    // Equity curve
    if (visiblePts > 1) {
      ctx.beginPath();
      for (let i = 0; i <= visiblePts; i++) {
        const x = chartL + (i / totalTrades) * chartW;
        const y = chartB - ((equity[i] - minBal) / range) * chartH;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(34,197,94,0.6)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Fill below
      const lastX = chartL + (visiblePts / totalTrades) * chartW;
      const lastY = chartB - ((equity[visiblePts] - minBal) / range) * chartH;
      ctx.lineTo(lastX, chartB);
      ctx.lineTo(chartL, chartB);
      ctx.closePath();
      ctx.fillStyle = 'rgba(34,197,94,0.03)';
      ctx.fill();

      // Current balance label
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'left';
      ctx.fillStyle = equity[visiblePts] >= 0 ? 'rgba(34,197,94,0.7)' : 'rgba(239,68,68,0.7)';
      ctx.fillText(`${equity[visiblePts] >= 0 ? '+' : ''}${equity[visiblePts].toFixed(1)}R`, lastX + 6, lastY - 4);
    }

    // Find losing streaks for markers
    let streak = 0; let worstStreak = 0; let worstEnd = 0;
    for (let i = 1; i <= Math.min(visiblePts, totalTrades); i++) {
      if (equity[i] < equity[i - 1]) { streak++; if (streak > worstStreak) { worstStreak = streak; worstEnd = i; } }
      else streak = 0;
    }

    // Mark worst losing streak
    if (worstStreak >= 5 && worstEnd <= visiblePts) {
      const startIdx = worstEnd - worstStreak;
      const sx = chartL + (startIdx / totalTrades) * chartW;
      const ex = chartL + (worstEnd / totalTrades) * chartW;
      const sy = chartB - ((equity[startIdx] - minBal) / range) * chartH;
      ctx.fillStyle = 'rgba(239,68,68,0.06)';
      ctx.fillRect(sx, chartT, ex - sx, chartH);
      ctx.font = '7px system-ui';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(239,68,68,0.4)';
      ctx.fillText(`${worstStreak} losses in a row`, (sx + ex) / 2, chartT + 12);
      ctx.fillText('STILL PROFITABLE', (sx + ex) / 2, chartT + 22);
    }

    // Title and stats
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(148,163,184,0.5)';
    ctx.fillText('200 TRADES: 45% Win Rate, 1:2.5 R:R', w / 2, 16);
    ctx.font = '8px system-ui';
    ctx.fillStyle = 'rgba(34,197,94,0.4)';
    ctx.fillText('The casino loses individual hands but wins over thousands', w / 2, h - 8);

    // Trade count
    ctx.font = '8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(148,163,184,0.2)';
    ctx.fillText(`Trade ${visiblePts}/${totalTrades}`, w / 2, h - 20);
  }, []);

  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// LOSS REFRAME ANIMATION — Same loss, two interpretations
// ============================================================
function LossReframeAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);
    const midX = w / 2;
    const cycle = (f % 480) / 480;
    const activePanel = cycle < 0.5 ? 0 : 1;

    // Centre divider
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(148,163,184,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(midX, 30);
    ctx.lineTo(midX, h - 20);
    ctx.stroke();
    ctx.setLineDash([]);

    // Left panel — Amateur view (red)
    const lx = w * 0.25;
    const isLeftActive = activePanel === 0;
    const leftAlpha = isLeftActive ? 1 : 0.3;

    ctx.font = `bold 10px system-ui`;
    ctx.textAlign = 'center';
    ctx.fillStyle = `rgba(239,68,68,${0.6 * leftAlpha})`;
    ctx.fillText('AMATEUR VIEW', lx, 25);

    // Loss box
    const boxW = w * 0.35;
    const boxH = 45;
    const boxY = 45;
    ctx.fillStyle = `rgba(239,68,68,${0.08 * leftAlpha})`;
    ctx.strokeStyle = `rgba(239,68,68,${0.2 * leftAlpha})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(lx - boxW / 2, boxY, boxW, boxH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 12px system-ui';
    ctx.fillStyle = `rgba(239,68,68,${0.8 * leftAlpha})`;
    ctx.fillText('-$200', lx, boxY + 22);
    ctx.font = '8px system-ui';
    ctx.fillStyle = `rgba(239,68,68,${0.5 * leftAlpha})`;
    ctx.fillText('"I FAILED"', lx, boxY + 38);

    // Amateur thought bubbles
    const thoughts = ['"I was wrong"', '"My strategy sucks"', '"I need to win it back"', '"Maybe trading isn\'t for me"'];
    thoughts.forEach((t, i) => {
      const ty = boxY + boxH + 20 + i * 22;
      const pulse = isLeftActive ? 0.3 + Math.sin(f * 0.05 + i * 1.5) * 0.15 : 0.1;
      ctx.font = '8px system-ui';
      ctx.fillStyle = `rgba(239,68,68,${pulse})`;
      ctx.fillText(t, lx, ty);
    });

    // Right panel — Professional view (green)
    const rx = w * 0.75;
    const isRightActive = activePanel === 1;
    const rightAlpha = isRightActive ? 1 : 0.3;

    ctx.font = 'bold 10px system-ui';
    ctx.fillStyle = `rgba(34,197,94,${0.6 * rightAlpha})`;
    ctx.fillText('PROFESSIONAL VIEW', rx, 25);

    ctx.fillStyle = `rgba(34,197,94,${0.08 * rightAlpha})`;
    ctx.strokeStyle = `rgba(34,197,94,${0.2 * rightAlpha})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(rx - boxW / 2, boxY, boxW, boxH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 12px system-ui';
    ctx.fillStyle = `rgba(34,197,94,${0.8 * rightAlpha})`;
    ctx.fillText('-1R', rx, boxY + 22);
    ctx.font = '8px system-ui';
    ctx.fillStyle = `rgba(34,197,94,${0.5 * rightAlpha})`;
    ctx.fillText('"COST OF BUSINESS"', rx, boxY + 38);

    const proThoughts = ['"Process was correct"', '"Risk was pre-accepted"', '"52 losses per 100 trades"', '"Next setup, same rules"'];
    proThoughts.forEach((t, i) => {
      const ty = boxY + boxH + 20 + i * 22;
      const pulse = isRightActive ? 0.3 + Math.sin(f * 0.04 + i * 1.5) * 0.12 : 0.1;
      ctx.font = '8px system-ui';
      ctx.fillStyle = `rgba(34,197,94,${pulse})`;
      ctx.fillText(t, rx, ty);
    });

    // Same event label
    ctx.font = '8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(251,191,36,0.3)';
    ctx.fillText('Same trade. Same loss. Different interpretation.', midX, h - 8);
  }, []);

  return <AnimScene drawFn={draw} height={250} />;
}

// ============================================================
// GAME SCENARIOS
// ============================================================
const gameScenarios = [
  { scenario: 'Your strategy has a backtested win rate of 47%. You&apos;ve just lost 6 trades in a row. Your account is down -4.2R. A friend says: &quot;Your system is broken. Change it.&quot; What do you think?', opts: ['They&apos;re probably right &mdash; 6 losses means something is wrong', '6 losses at 47% win rate is statistically expected &mdash; stick to the plan', 'Reduce size until the losing streak ends', 'Take a 1-week break and come back fresh'], correct: 1, explain: 'At 47% win rate, a 6-loss streak has roughly a 4.4% chance of occurring in any 100-trade sample. Over a year of trading (500+ trades), it&apos;s virtually GUARANTEED to happen. This is normal variance, not a broken strategy. Changing your system based on 6 trades is reacting to noise.' },
  { scenario: 'You took a perfect A+ setup: Kill Zone, OTE, Order Block confluence, 1:3 R:R. It hit your stop loss. How should you grade this trade?', opts: ['F &mdash; it lost money', 'A+ &mdash; the process was perfect, the outcome was variance', 'C &mdash; something must have been wrong with the analysis', 'B &mdash; good setup but the loss proves it wasn&apos;t quite right'], correct: 1, explain: 'This trade gets an A+ because every element of your process was correct. The outcome (loss) is IRRELEVANT to the grade. Professional traders grade PROCESS, not P&L. A perfect process that loses is still a perfect trade. This is the core of loss acceptance.' },
  { scenario: 'A trader tells you: &quot;I haven&apos;t had a losing trade in 3 weeks.&quot; What do you think?', opts: ['They&apos;re an amazing trader', 'They&apos;re probably not taking enough trades or are lying', 'Their strategy must be better than mine', 'I should copy their approach'], correct: 1, explain: 'Any strategy with edge will produce losses. A 3-week winning streak either means: (a) they took very few trades, (b) they&apos;re only sharing wins, or (c) their &quot;strategy&quot; is actually holding losers until they eventually come back (which guarantees eventual blowup). Consistent losses are a SIGN of an honest edge being executed.' },
  { scenario: 'Your monthly results show: 23 wins, 27 losses (46% win rate). Average win: +2.8R. Average loss: -1.0R. How do you feel about this month?', opts: ['Terrible &mdash; I lost more trades than I won', 'Excellent &mdash; that&apos;s +37.4R net profit', 'Mediocre &mdash; I need to improve my win rate', 'Anxious &mdash; losing 54% of trades is unsustainable'], correct: 1, explain: '23 wins &times; 2.8R = +64.4R. 27 losses &times; 1.0R = -27.0R. Net: +37.4R. That is EXCELLENT. Win rate is meaningless without R:R context. A 46% win rate with 1:2.8 R:R is more profitable than a 70% win rate with 1:0.5 R:R. The maths is all that matters.' },
  { scenario: 'You&apos;re about to enter a trade. Before clicking &quot;buy,&quot; you think: &quot;I can&apos;t afford to lose this one.&quot; What should you do?', opts: ['Enter anyway &mdash; confidence is key', 'Do NOT enter. If you can&apos;t accept the loss, you shouldn&apos;t take the trade.', 'Enter with a tighter stop to reduce the potential loss', 'Enter with half size'], correct: 1, explain: 'If you cannot psychologically accept the worst-case outcome BEFORE entering, you are not ready for the trade. Loss acceptance happens BEFORE the trade, not after. Either your position is too big, or your emotional state is compromised. Reduce size until the maximum loss feels like &quot;the cost of doing business.&quot;' },
];

// ============================================================
// QUIZ QUESTIONS
// ============================================================
const quizQuestions = [
  { q: 'The &quot;casino owner&quot; mindset means:', opts: ['Gambling with your money', 'Accepting individual losses because the edge wins over many trades', 'Always winning', 'Taking maximum risk for maximum reward'], a: 1, explain: 'Casinos lose on individual hands all the time. But they have a mathematical edge that guarantees profit over thousands of hands. Professional traders think the same way: each trade is a small bet with edge, and losses are the cost of staying in the game.' },
  { q: 'A strategy with 45% win rate and 1:2.5 R:R is:', opts: ['Unprofitable because you lose more than you win', 'Highly profitable: +0.625R expected per trade', 'Break-even', 'Only profitable in certain market conditions'], a: 1, explain: 'Expected value = (0.45 &times; 2.5) + (0.55 &times; -1) = 1.125 - 0.55 = +0.575R per trade. Over 100 trades: +57.5R. Win rate alone tells you NOTHING about profitability.' },
  { q: 'Loss acceptance means:', opts: ['Not caring about losses', 'Pre-accepting the maximum loss before every trade as a cost of business', 'Accepting that you will eventually blow your account', 'Lowering your standards for trade quality'], a: 1, explain: 'Loss acceptance is not apathy. It&apos;s a conscious, pre-trade decision: &quot;I am risking 1R on this trade. If it loses, I have paid the cost of finding out whether my edge would work this time. That cost is acceptable.&quot;' },
  { q: 'An 8-trade losing streak in a 48% win rate system is:', opts: ['Impossible if the system works', 'Statistically expected to occur multiple times per year', 'Proof the system needs fixing', 'Extremely unlikely and concerning'], a: 1, explain: 'The probability of 8 losses in a row at 48% win rate is 0.52^8 = 0.37%. Sounds rare. But over 500 trades per year, you&apos;ll see it 1-2 times. Over a 5-year career, roughly 8 times. It&apos;s not just possible &mdash; it&apos;s guaranteed.' },
  { q: 'Before entering a trade, you should be able to say:', opts: ['&quot;I will definitely win this trade&quot;', '&quot;I am willing to lose [X amount] and that is acceptable&quot;', '&quot;I have a feeling this will work&quot;', '&quot;I can&apos;t afford to lose this&quot;'], a: 1, explain: 'Pre-trade loss acceptance is the foundation. If you cannot say &quot;I am willing to lose this amount&quot; with genuine calm, your position is too big or you&apos;re not ready to trade. The loss must feel like a business expense, not a catastrophe.' },
  { q: 'A trade that followed perfect process but lost money should be graded:', opts: ['F &mdash; it lost money', 'A &mdash; process quality determines the grade, not outcome', 'C &mdash; a loss is always a partial failure', 'D &mdash; something must have gone wrong'], a: 1, explain: 'Process over outcome is the professional standard. The outcome of any single trade is largely random. The process is what you control. A perfect process that loses is an A-grade trade. A broken process that wins is a D-grade trade.' },
  { q: 'The phrase &quot;losses are the cost of doing business&quot; means:', opts: ['You should expect to lose all your money', 'Like rent or inventory, losses are regular expenses that come with having a profitable operation', 'Losses don&apos;t matter at all', 'You should budget for losses in your personal finances'], a: 1, explain: 'A restaurant pays rent even on slow days. A shop buys inventory that doesn&apos;t sell. These are costs of operating a business. Trading losses are the same: they&apos;re the regular, expected costs of running a strategy with edge. Without them, you&apos;re not in the game.' },
  { q: 'When a professional trader takes a loss, their immediate thought is:', opts: ['&quot;I need to win the next one&quot;', '&quot;Did I follow my process? If yes, move on. If no, review and fix.&quot;', '&quot;I should have known better&quot;', '&quot;The market is unfair&quot;'], a: 1, explain: 'The only question that matters after a loss: was the PROCESS correct? If yes, the loss was a valid business expense and requires no action. If no, there&apos;s something to fix in the plan. Either way, the response is calm, analytical, and forward-looking &mdash; never emotional.' },
];

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function LossAcceptanceLesson() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Accordion states
  const [openReframe, setOpenReframe] = useState<string | null>(null);
  const [openGrade, setOpenGrade] = useState<string | null>(null);
  const [openStep, setOpenStep] = useState<string | null>(null);
  const [openMyth, setOpenMyth] = useState<string | null>(null);
  const [openMistake, setOpenMistake] = useState<string | null>(null);

  // Calculator state
  const [calcWinRate, setCalcWinRate] = useState(45);
  const [calcRR, setCalcRR] = useState(2.5);
  const expectancy = (calcWinRate / 100) * calcRR - ((100 - calcWinRate) / 100) * 1;
  const per100 = expectancy * 100;

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
          <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 4 &middot; Lesson 5</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight"><span className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Loss Acceptance</span></h1>
          <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">The most powerful mindset shift in trading. Losses are not failures. They are the cost of doing business.</p>
        </motion.div>
      </section>

      {/* SECTION 00 — WHY THIS MATTERS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-lg font-bold text-white mb-3">&#127183; A casino owner watches someone win £50,000 at the blackjack table. Does he panic? Does he change the rules of blackjack? Does he close the casino?</p>
            <p className="text-gray-400 leading-relaxed mb-4">No. He smiles. Because he knows the maths. Over thousands of hands, the house edge guarantees profit. <strong className="text-amber-400">Individual losses are irrelevant.</strong> They&apos;re the cost of running the game.</p>
            <p className="text-gray-400 leading-relaxed mb-4">Professional traders think exactly like casino owners. They have a strategy with edge. They know that 45-55% of their trades will lose. They know that losing streaks of 6, 8, even 10 trades in a row are <strong className="text-white">mathematically inevitable</strong>. And they don&apos;t flinch.</p>
            <p className="text-gray-400 leading-relaxed">This lesson is about making that shift &mdash; from viewing losses as <strong className="text-red-400">failures</strong> to viewing them as <strong className="text-green-400">business expenses</strong>. It&apos;s the single most important mindset change you&apos;ll ever make as a trader.</p>
          </div>
          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">A hedge fund trader with 20 years of experience was asked: &quot;What&apos;s your win rate?&quot; He answered: &quot;About 42%.&quot; The interviewer was shocked. &quot;You lose more than you win?&quot; The trader said: &quot;Every month. My average win is 3.2R and my average loss is 0.9R. I&apos;m one of the most profitable traders at this firm.&quot; He understood what most beginners never learn: <strong className="text-white">win rate is meaningless without R:R</strong>.</p>
          </div>
        </motion.div>
      </section>

      {/* SECTION 01 — THE CASINO OWNER */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Casino Owner Mindset</p>
          <h2 className="text-2xl font-extrabold mb-4">Watch 200 Trades Play Out</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">This chart shows a strategy with 45% win rate and 1:2.5 R:R over 200 trades. Watch the losing streaks. Watch the drawdowns. <strong className="text-green-400">Watch it end in profit.</strong></p>
          <CasinoOwnerAnimation />
          <div className="mt-4 p-4 rounded-xl glass-card">
            <p className="text-sm text-amber-400 font-bold mb-2">Would you close this strategy after the losing streak?</p>
            <p className="text-sm text-gray-400 leading-relaxed">Most beginners would quit during the 5-8 loss streak in the middle. They&apos;d call the strategy &quot;broken.&quot; But the professional holds through because they understand the maths: 45% &times; 2.5R &minus; 55% &times; 1R = <strong className="text-green-400">+0.575R per trade</strong>. Over 200 trades, that&apos;s roughly +115R. The losing streak was just noise.</p>
          </div>
        </motion.div>
      </section>

      {/* SECTION 02 — THE REFRAME */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Reframe</p>
          <h2 className="text-2xl font-extrabold mb-4">Same Loss, Different Brain</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">The same -$200 loss produces completely different responses depending on your mindset.</p>
          <LossReframeAnimation />
        </motion.div>
        <div className="mt-6 space-y-3">
          {[
            { label: 'From &quot;I lost money&quot; to &quot;I paid the cost of finding out&quot;', old: 'Losses feel like failures. Each one erodes your confidence and triggers emotional responses.', new: 'Losses are data points. You paid 1R to test whether your edge would work this time. Sometimes it does, sometimes it doesn&apos;t. Either way, you got information.' },
            { label: 'From &quot;I was wrong&quot; to &quot;The probability didn&apos;t land this time&quot;', old: 'Being &quot;wrong&quot; attacks your identity. You question your analysis, your skill, your worth as a trader.', new: 'A coin with 55% heads still lands tails 45% of the time. You weren&apos;t wrong. The probability just landed on the minority side. That is expected and normal.' },
            { label: 'From &quot;I need to win the next one&quot; to &quot;I need to follow my process&quot;', old: 'Outcome-focused thinking creates pressure, revenge trading, and oversized positions.', new: 'Process-focused thinking creates calm execution. The next trade&apos;s job is to follow the rules &mdash; not to &quot;fix&quot; the previous loss.' },
            { label: 'From &quot;Losses mean I&apos;m bad at this&quot; to &quot;Losses mean I&apos;m in the game&quot;', old: 'Self-doubt spiral: loss &rarr; &quot;I&apos;m not good enough&quot; &rarr; hesitation &rarr; missed trades &rarr; more frustration.', new: 'The only traders with zero losses are traders who don&apos;t trade. If you&apos;re taking losses, you&apos;re playing. And if your process is correct, the maths will win eventually.' },
          ].map((r, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <button onClick={() => setOpenReframe(openReframe === r.label ? null : r.label)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                <p className="text-sm font-extrabold text-white" dangerouslySetInnerHTML={{ __html: r.label }} />
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openReframe === r.label ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openReframe === r.label && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="px-4 pb-4 pt-2 space-y-2">
                      <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/15"><p className="text-xs font-bold text-red-400 mb-1">&#10060; Old Mindset</p><p className="text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: r.old }} /></div>
                      <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/15"><p className="text-xs font-bold text-green-400 mb-1">&#9989; New Mindset</p><p className="text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: r.new }} /></div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 03 — EXPECTANCY CALCULATOR */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; Expectancy Calculator</p>
          <h2 className="text-2xl font-extrabold mb-2">See Your Edge in Numbers</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">Adjust win rate and R:R to see how profitable your system is &mdash; even with a &quot;low&quot; win rate.</p>
        </motion.div>
        <div className="p-5 rounded-2xl glass-card">
          <div className="space-y-5">
            <div>
              <div className="flex justify-between mb-2"><p className="text-xs text-gray-400">Win Rate</p><p className="text-xs font-bold text-amber-400">{calcWinRate}%</p></div>
              <input type="range" min={20} max={80} value={calcWinRate} onChange={e => setCalcWinRate(Number(e.target.value))} className="w-full accent-amber-500" />
            </div>
            <div>
              <div className="flex justify-between mb-2"><p className="text-xs text-gray-400">Average Win (R-multiple)</p><p className="text-xs font-bold text-amber-400">{calcRR.toFixed(1)}R</p></div>
              <input type="range" min={10} max={50} value={calcRR * 10} onChange={e => setCalcRR(Number(e.target.value) / 10)} className="w-full accent-amber-500" />
            </div>
          </div>
          <div className="mt-6 p-4 rounded-xl border border-gray-700/50 bg-white/[0.02]">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div><p className="text-xs text-gray-500 mb-1">Expectancy</p><p className={`text-lg font-extrabold ${expectancy >= 0 ? 'text-green-400' : 'text-red-400'}`}>{expectancy >= 0 ? '+' : ''}{expectancy.toFixed(2)}R</p><p className="text-[10px] text-gray-600">per trade</p></div>
              <div><p className="text-xs text-gray-500 mb-1">Per 100 Trades</p><p className={`text-lg font-extrabold ${per100 >= 0 ? 'text-green-400' : 'text-red-400'}`}>{per100 >= 0 ? '+' : ''}{per100.toFixed(0)}R</p></div>
              <div><p className="text-xs text-gray-500 mb-1">Losses per 100</p><p className="text-lg font-extrabold text-gray-300">{100 - calcWinRate}</p><p className="text-[10px] text-gray-600">expected losses</p></div>
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-500 text-center">Even at {calcWinRate}% win rate, you lose {100 - calcWinRate} trades per 100. {expectancy > 0 ? `But each trade has +${expectancy.toFixed(2)}R expected value. The losses are BUILT INTO the profit.` : 'This combination needs a higher R:R or win rate to be profitable.'}</p>
        </div>
      </section>

      {/* SECTION 04 — LOSS QUALITY GRADING */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Loss Quality Grading</p>
          <h2 className="text-2xl font-extrabold mb-2">Not All Losses Are Equal</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">Grade every loss. The grade determines your response.</p>
        </motion.div>
        <div className="space-y-3">
          {[
            { grade: 'A-Grade Loss', color: 'text-green-400', border: 'border-green-500/20 bg-green-500/5', criteria: 'Perfect process. Met all checklist criteria. Stop placed correctly. Size was correct. You did EVERYTHING right.', response: 'No action needed. This is the cost of business. Move to the next setup with zero adjustment.', example: 'Kill Zone entry, OTE zone, Order Block confluence. Stop at -1R. Price swept your stop by 3 pips and reversed. Variance.' },
            { grade: 'B-Grade Loss', color: 'text-amber-400', border: 'border-amber-500/20 bg-amber-500/5', criteria: 'Mostly correct process with ONE minor deviation. Maybe entered 5 minutes before the Kill Zone opened, or the OB was slightly stretched.', response: 'Note the deviation in your journal. If the same deviation appears 3+ times in a month, add it to your checklist as a specific rule.', example: 'Valid OTE zone entry but you entered at 60.5% instead of waiting for 62% confirmation. Process was 90% correct.' },
            { grade: 'C-Grade Loss', color: 'text-orange-400', border: 'border-orange-500/20 bg-orange-500/5', criteria: 'Multiple process violations. Wrong session, ignored HTF bias, forced a setup that wasn&apos;t really there, or sized up after a win.', response: 'STOP and review. This loss was avoidable. Identify which rules you broke and WHY. Was it FOMO? Overconfidence? Boredom?', example: 'Traded Asian session (your plan says London only). Setup was B-grade at best. You took it because you hadn&apos;t traded all day.' },
            { grade: 'D-Grade Loss', color: 'text-red-400', border: 'border-red-500/20 bg-red-500/5', criteria: 'Pure emotional trade. No setup. No plan. Revenge, FOMO, or gambling. You KNEW it was wrong when you entered.', response: 'This is a CRISIS. Full circuit breaker. Journal extensively. This loss doesn&apos;t belong in your statistics &mdash; it belongs in your therapy file.', example: 'Lost -1R and immediately re-entered with 2x size on the same pair, no new setup. Pure revenge. Lost -2R more.' },
          ].map((g, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <button onClick={() => setOpenGrade(openGrade === g.grade ? null : g.grade)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                <p className={`text-sm font-extrabold ${g.color}`}>{g.grade}</p>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openGrade === g.grade ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openGrade === g.grade && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="px-4 pb-4 pt-2 space-y-2">
                      <div className={`p-3 rounded-lg border ${g.border}`}><p className="text-xs font-bold text-gray-300 mb-1">Criteria</p><p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: g.criteria }} /></div>
                      <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/15"><p className="text-xs font-bold text-amber-400 mb-1">&#128161; Correct Response</p><p className="text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: g.response }} /></div>
                      <p className="text-xs text-gray-500 italic" dangerouslySetInnerHTML={{ __html: `Example: ${g.example}` }} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 05 — PRE-TRADE ACCEPTANCE */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Pre-Trade Acceptance Ritual</p>
          <h2 className="text-2xl font-extrabold mb-2">Accept the Loss BEFORE You Enter</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">Loss acceptance doesn&apos;t happen after the loss. It happens BEFORE the trade. Follow these 4 steps before every single entry.</p>
        </motion.div>
        <div className="space-y-3">
          {[
            { step: '1. Calculate the exact loss', icon: '&#128178;', detail: 'Before clicking &quot;buy&quot; or &quot;sell,&quot; calculate: &quot;If this hits my stop, I will lose [exact amount].&quot; Not &quot;about 1%&quot; &mdash; the exact pound amount. £50. £200. Whatever it is. Make it concrete.' },
            { step: '2. Say it out loud', icon: '&#128483;&#65039;', detail: '&quot;I am willing to lose £[X] on this trade. That is the price of testing my edge.&quot; Saying it out loud engages a different part of your brain than just thinking it. It makes the acceptance REAL.' },
            { step: '3. Check your body', icon: '&#129728;', detail: 'Does the amount make you feel sick? Does your stomach tighten? If YES: your position is too big. Reduce size until the loss feels like &quot;annoying but acceptable&quot; &mdash; not &quot;devastating.&quot;' },
            { step: '4. Set and forget', icon: '&#9989;', detail: 'Place the stop loss in the platform. Set alerts at stop and target. Close the chart or set a timer. The trade is now running. Your job is done. The outcome is out of your control.' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <button onClick={() => setOpenStep(openStep === s.step ? null : s.step)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                <div className="flex items-center gap-3">
                  <span className="text-xl" dangerouslySetInnerHTML={{ __html: s.icon }} />
                  <p className="text-sm font-extrabold text-white">{s.step}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openStep === s.step ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openStep === s.step && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="px-4 pb-4 pt-2"><p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: s.detail }} /></div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 06 — LOSING STREAK MATHS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Losing Streak Maths</p>
          <h2 className="text-2xl font-extrabold mb-2">How Often Streaks Actually Happen</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">At a 48% win rate, here&apos;s how often you&apos;ll experience consecutive losses:</p>
          <div className="space-y-2">
            {[
              { streak: '3 losses in a row', prob: '14.1%', freq: 'Multiple times per month', color: 'text-green-400' },
              { streak: '5 losses in a row', prob: '3.8%', freq: 'Every few months', color: 'text-amber-400' },
              { streak: '7 losses in a row', prob: '1.0%', freq: '1-2 times per year', color: 'text-orange-400' },
              { streak: '10 losses in a row', prob: '0.14%', freq: 'Once every few years', color: 'text-red-400' },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl glass-card">
                <p className={`text-sm font-extrabold ${s.color}`}>{s.streak}</p>
                <div className="text-right">
                  <p className="text-sm text-gray-300">{s.prob} chance per 100 trades</p>
                  <p className="text-xs text-gray-500">{s.freq}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 rounded-xl glass-card">
            <p className="text-sm text-amber-400 font-bold">Every one of these streaks is NORMAL.</p>
            <p className="text-sm text-gray-400 mt-2 leading-relaxed">If you change your strategy after 5 losses, you&apos;ll change your strategy every few months &mdash; never giving any system enough time to prove its edge. If you panic after 7 losses, you&apos;ll panic 1-2 times per year. These are not failures. They are statistics.</p>
          </div>
        </motion.div>
      </section>

      {/* SECTION 07 — MYTHS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Loss Acceptance Myths</p>
          <h2 className="text-2xl font-extrabold mb-4">What People Get Wrong</h2>
        </motion.div>
        <div className="space-y-3">
          {[
            { myth: '&quot;Loss acceptance means you don&apos;t care about losing&quot;', reality: 'You absolutely care. Losses hurt. But you&apos;ve pre-accepted them as part of the game. A surgeon doesn&apos;t enjoy seeing patients in pain &mdash; but they don&apos;t freeze up when it happens, because they&apos;ve accepted it as part of the profession.' },
            { myth: '&quot;A high win rate means you&apos;re a better trader&quot;', reality: 'Win rate without R:R is meaningless. A 30% win rate with 1:5 R:R (expectancy +0.2R/trade) is more profitable than a 70% win rate with 1:0.5 R:R (expectancy -0.15R/trade). The 70% trader feels great but loses money.' },
            { myth: '&quot;Profitable traders don&apos;t have losing streaks&quot;', reality: 'Every profitable trader has losing streaks. The difference is they don&apos;t change their strategy during one. They ride it out because they trust the maths. The losing streak is just a toll booth on the road to profit.' },
            { myth: '&quot;If I could just avoid the losing trades, I&apos;d be profitable&quot;', reality: 'You cannot avoid losing trades. They are MATHEMATICALLY GUARANTEED to occur. Trying to avoid them leads to: skipping valid setups (reducing your sample size), moving stops (increasing loss size), and analysis paralysis. Accept them and focus on process.' },
          ].map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <button onClick={() => setOpenMyth(openMyth === m.myth ? null : m.myth)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                <p className="text-sm font-extrabold text-white" dangerouslySetInnerHTML={{ __html: `&#128683; ${m.myth}` }} />
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openMyth === m.myth ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openMyth === m.myth && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="px-4 pb-4 pt-2"><div className="p-3 rounded-lg bg-green-500/5 border border-green-500/15"><p className="text-xs font-bold text-green-400 mb-1">&#9989; Reality</p><p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: m.reality }} /></div></div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 08 — COMMON MISTAKES */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-4">Loss Acceptance Traps</h2>
        </motion.div>
        <div className="space-y-3">
          {[
            { mistake: 'Changing strategy after a losing streak', wrong: 'You trade Model 1 for 3 weeks. You hit a 5-loss streak. You switch to Model 2. You hit another 4-loss streak. You switch to scalping. You never give any system enough trades to prove edge.', right: 'Commit to a MINIMUM of 50 trades before evaluating. Log every trade. After 50+, the data tells you if the edge is real. A losing streak within 50 trades is noise, not signal.', tip: '50 trades is roughly 2-4 weeks for most traders. That is the MINIMUM sample size to judge anything.' },
            { mistake: 'Widening stops to avoid &quot;unnecessary&quot; losses', wrong: 'You got stopped out twice by 3 pips before price reversed. So you add 10 pips to every stop. Now your R:R drops from 1:3 to 1:2.2 and your entire edge is gone.', right: 'Wick stop-outs are NORMAL variance. Over 100 trades, adding 10 pips to every stop costs you far more than the occasional wick save.', tip: 'Track wick stop-outs in your journal. If it happens more than 15% of the time, your stop placement method needs review &mdash; not your stop width.' },
            { mistake: 'Skipping trades after losses', wrong: 'You lost 2 in a row, so you skip the next 3 valid signals &quot;to be safe.&quot; Those 3 trades would have been winners. Your actual win rate drops because you&apos;re only trading when you &quot;feel&quot; good.', right: 'Take EVERY valid signal regardless of recent results. Your edge requires a full sample. Cherry-picking signals based on feelings destroys the statistical advantage.', tip: 'Track skipped trades. If skipped signals would have been profitable, your fear is costing you more than your losses.' },
            { mistake: 'Treating every loss as a learning moment', wrong: '&quot;What did I do wrong?&quot; after every single loss. Sometimes the answer is: NOTHING. You did everything right. The market just went the other way. Not every loss needs a lesson.', right: 'Grade the loss first (A/B/C/D). A-grade losses need zero analysis. B-grade losses get a quick note. Only C and D losses require deep review.', tip: 'Over-analysing A-grade losses leads to over-optimisation, which leads to curve-fitting, which leads to a worse strategy.' },
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
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Accept the Loss</p>
          <h2 className="text-2xl font-extrabold mb-2">Loss Acceptance Game</h2>
          <p className="text-sm text-gray-400 mb-6">Five scenarios testing your relationship with losses.</p>
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
            <p className="text-sm text-gray-400">{gameScore === 5 ? '&#127183; Perfect. You think like a casino owner.' : gameScore >= 3 ? 'Good reframing. The casino mindset is developing.' : 'Losses still feel personal. Re-read the reframe section and the expectancy calculator.'}</p>
          </motion.div>
        )}
      </section>

      {/* SECTION 10 — QUIZ */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Knowledge Check</p>
          <h2 className="text-2xl font-extrabold mb-6">Loss Acceptance Quiz</h2>
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
        {quizDone && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 text-center p-8 glass-card rounded-2xl"><p className={`text-5xl font-extrabold mb-2 ${score >= 66 ? 'text-amber-400' : 'text-red-400'}`}>{score}%</p><p className="text-sm text-gray-400">{score === 100 ? '&#127183; Perfect. You own the casino now.' : score >= 66 ? 'Strong loss acceptance. Losses are your business expenses.' : 'Losses still feel like failures. Re-read the casino owner section and the reframe.'}</p></motion.div>)}
      </section>

      {/* Certificate */}
      <section className="px-5 py-16 text-center">
        {!certUnlocked ? (
          <div className="max-w-md mx-auto p-8 glass rounded-2xl"><p className="text-4xl mb-3 opacity-30">&#128274;</p><p className="text-sm text-gray-500">Score 66%+ to unlock your <strong className="text-amber-400">Pro Certificate</strong></p></div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, type: 'spring' }}
            className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(34,197,94,0.06),transparent,rgba(16,185,129,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
            <div className="absolute inset-[1px] rounded-3xl border border-amber-500/10" />
            <div className="relative z-10">
              <div className="w-[80px] h-[80px] mx-auto mb-5 rounded-full bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 flex items-center justify-center text-4xl shadow-lg shadow-green-500/20">&#127183;</div>
              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest mb-2">Pro Certificate</p>
              <h3 className="text-xl font-extrabold mb-1">Certificate of Mastery</h3>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">Has mastered<br /><strong className="text-white">Level 4.5: Loss Acceptance &mdash; Your Superpower</strong><br />at ATLAS Academy by Interakktive</p>
              <p className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent font-bold text-lg mb-1" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Casino Owner &mdash;</p>
              <p className="font-mono text-[11px] text-gray-500 mb-4">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L4.5-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
            </div>
          </motion.div>
        )}
      </section>

      <section className="text-center px-5 pt-10 pb-24">
        <p className="text-xs tracking-widest uppercase text-gray-600 mb-4">Up Next</p>
        <h2 className="text-xl font-bold mb-6">Lesson 4.6 &mdash; Confidence vs Overconfidence</h2>
        <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">
          Continue <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
