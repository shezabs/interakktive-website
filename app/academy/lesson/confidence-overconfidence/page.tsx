// app/academy/lesson/confidence-overconfidence/page.tsx
// ATLAS Academy — Lesson 4.6: Confidence vs Overconfidence [PRO]
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
// THERMOMETER ANIMATION — Confidence spectrum
// ============================================================
function ThermometerAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);
    const midX = w / 2;
    const thermX = midX;
    const thermTop = 40;
    const thermBot = h - 40;
    const thermH = thermBot - thermTop;
    const thermW = 30;

    // Thermometer outline
    ctx.strokeStyle = 'rgba(148,163,184,0.2)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(thermX - thermW / 2, thermTop, thermW, thermH, 15);
    ctx.stroke();

    // Zones (bottom to top): Frozen → Fearful → Calm → Ambitious → Overheated
    const zones = [
      { start: 0, end: 0.2, color: '#3b82f6', label: 'FROZEN', sublabel: 'Can\'t pull the trigger' },
      { start: 0.2, end: 0.4, color: '#60a5fa', label: 'FEARFUL', sublabel: 'Hesitant, small size' },
      { start: 0.4, end: 0.6, color: '#22c55e', label: 'CALM CONFIDENCE', sublabel: 'THE TARGET ZONE' },
      { start: 0.6, end: 0.8, color: '#eab308', label: 'AMBITIOUS', sublabel: 'Pushing limits' },
      { start: 0.8, end: 1.0, color: '#ef4444', label: 'OVERHEATED', sublabel: 'Rules are breaking' },
    ];

    zones.forEach(z => {
      const zy1 = thermBot - z.end * thermH;
      const zy2 = thermBot - z.start * thermH;
      const r = parseInt(z.color.slice(1, 3), 16);
      const g = parseInt(z.color.slice(3, 5), 16);
      const b = parseInt(z.color.slice(5, 7), 16);
      ctx.fillStyle = `rgba(${r},${g},${b},0.08)`;
      ctx.fillRect(thermX - thermW / 2 + 1, zy1, thermW - 2, zy2 - zy1);

      // Zone label
      const labelY = (zy1 + zy2) / 2;
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'left';
      ctx.fillStyle = `rgba(${r},${g},${b},0.6)`;
      ctx.fillText(z.label, thermX + thermW / 2 + 12, labelY - 4);
      ctx.font = '7px system-ui';
      ctx.fillStyle = `rgba(${r},${g},${b},0.35)`;
      ctx.fillText(z.sublabel, thermX + thermW / 2 + 12, labelY + 8);
    });

    // Mercury level — oscillates
    const cycle = (f % 600) / 600;
    const level = 0.5 + Math.sin(cycle * Math.PI * 2) * 0.35 + Math.sin(cycle * Math.PI * 5) * 0.08;
    const clampedLevel = Math.max(0.05, Math.min(0.95, level));
    const mercuryTop = thermBot - clampedLevel * thermH;

    // Mercury fill
    const currentZone = zones.find(z => clampedLevel >= z.start && clampedLevel < z.end) || zones[2];
    const r = parseInt(currentZone.color.slice(1, 3), 16);
    const g = parseInt(currentZone.color.slice(3, 5), 16);
    const b = parseInt(currentZone.color.slice(5, 7), 16);

    const mercGrd = ctx.createLinearGradient(0, thermBot, 0, mercuryTop);
    mercGrd.addColorStop(0, `rgba(${r},${g},${b},0.3)`);
    mercGrd.addColorStop(1, `rgba(${r},${g},${b},0.15)`);
    ctx.fillStyle = mercGrd;
    ctx.beginPath();
    ctx.roundRect(thermX - thermW / 2 + 3, mercuryTop, thermW - 6, thermBot - mercuryTop - 3, [0, 0, 12, 12]);
    ctx.fill();

    // Level indicator
    ctx.beginPath();
    ctx.moveTo(thermX - thermW / 2 - 6, mercuryTop);
    ctx.lineTo(thermX - thermW / 2 - 1, mercuryTop);
    ctx.strokeStyle = `rgba(${r},${g},${b},0.7)`;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Green target zone marker
    const greenTop = thermBot - 0.6 * thermH;
    const greenBot = thermBot - 0.4 * thermH;
    ctx.strokeStyle = 'rgba(34,197,94,0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(thermX - thermW / 2 - 15, greenTop);
    ctx.lineTo(thermX - thermW / 2 - 3, greenTop);
    ctx.moveTo(thermX - thermW / 2 - 15, greenBot);
    ctx.lineTo(thermX - thermW / 2 - 3, greenBot);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = '7px system-ui';
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(34,197,94,0.4)';
    ctx.fillText('TARGET', thermX - thermW / 2 - 17, (greenTop + greenBot) / 2 + 3);

    // Title
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(148,163,184,0.5)';
    ctx.fillText('CONFIDENCE THERMOMETER', midX, 20);
  }, []);

  return <AnimScene drawFn={draw} height={300} />;
}

// ============================================================
// WIN STREAK ANIMATION — Equity rises then blowback
// ============================================================
function WinStreakAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);
    const chartL = 40; const chartR = w - 20; const chartT = 35; const chartB = h - 35;
    const chartW = chartR - chartL; const chartH = chartB - chartT;

    const cycle = (f % 720) / 720;
    // Equity: 5 wins in a row, then trader doubles size, loses big
    const points = [
      { x: 0, bal: 0, label: '' },
      { x: 0.1, bal: 2.5, label: 'Win +2.5R' },
      { x: 0.2, bal: 5.0, label: 'Win +2.5R' },
      { x: 0.3, bal: 7.2, label: 'Win +2.2R' },
      { x: 0.4, bal: 10.0, label: 'Win +2.8R' },
      { x: 0.5, bal: 12.5, label: 'Win +2.5R' },
      { x: 0.55, bal: 12.5, label: '' },
      { x: 0.65, bal: 12.5, label: '2x SIZE' },
      { x: 0.78, bal: 7.5, label: 'Loss -5R (2x)' },
      { x: 0.88, bal: 2.0, label: 'Revenge -5.5R' },
      { x: 1.0, bal: 2.0, label: '' },
    ];

    const maxBal = 14; const minBal = -1;
    const range = maxBal - minBal;
    const balToY = (b: number) => chartT + (1 - (b - minBal) / range) * chartH;

    // Zero line
    ctx.strokeStyle = 'rgba(148,163,184,0.1)';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(chartL, balToY(0));
    ctx.lineTo(chartR, balToY(0));
    ctx.stroke();
    ctx.setLineDash([]);

    const visiblePts = Math.floor(cycle * points.length);

    if (visiblePts > 0) {
      ctx.beginPath();
      for (let i = 0; i <= Math.min(visiblePts, points.length - 1); i++) {
        const px = chartL + points[i].x * chartW;
        const py = balToY(points[i].bal);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      const lastPt = points[Math.min(visiblePts, points.length - 1)];
      const isWinPhase = lastPt.bal > 10;
      const isLossPhase = visiblePts >= 8;
      ctx.strokeStyle = isLossPhase ? 'rgba(239,68,68,0.6)' : 'rgba(34,197,94,0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Dots and labels
      for (let i = 0; i <= Math.min(visiblePts, points.length - 1); i++) {
        const pt = points[i];
        if (!pt.label) continue;
        const px = chartL + pt.x * chartW;
        const py = balToY(pt.bal);
        const isLoss = pt.label.includes('Loss') || pt.label.includes('Revenge');
        const isSize = pt.label.includes('2x');

        ctx.beginPath();
        ctx.arc(px, py, isSize ? 5 : 4, 0, Math.PI * 2);
        ctx.fillStyle = isLoss ? 'rgba(239,68,68,0.7)' : isSize ? 'rgba(251,191,36,0.7)' : 'rgba(34,197,94,0.5)';
        ctx.fill();

        ctx.font = isSize ? 'bold 8px system-ui' : '7px system-ui';
        ctx.textAlign = i > 6 ? 'right' : 'left';
        ctx.fillStyle = isLoss ? 'rgba(239,68,68,0.6)' : isSize ? 'rgba(251,191,36,0.7)' : 'rgba(34,197,94,0.4)';
        const lx = i > 6 ? px - 8 : px + 8;
        ctx.fillText(pt.label, lx, py - 6);
      }
    }

    // Overconfidence marker
    if (visiblePts >= 7) {
      const alpha = Math.min(1, (visiblePts - 7) / 2) * 0.6;
      const dangerX = chartL + 0.55 * chartW;
      ctx.fillStyle = `rgba(251,191,36,${0.04 * alpha * 10})`;
      ctx.fillRect(dangerX, chartT, chartR - dangerX, chartH);
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillStyle = `rgba(251,191,36,${alpha})`;
      ctx.fillText('OVERCONFIDENCE ZONE', (dangerX + chartR) / 2, chartT + 14);
    }

    // Result label
    if (cycle > 0.9) {
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(239,68,68,0.6)';
      ctx.fillText('5 disciplined wins (+12.5R) destroyed by 2 oversized trades', w / 2, h - 8);
    } else if (cycle > 0.05 && cycle < 0.55) {
      ctx.font = '8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(34,197,94,0.3)';
      ctx.fillText('Winning streak builds confidence...', w / 2, h - 8);
    }

    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(148,163,184,0.4)';
    ctx.fillText('THE WINNING STREAK TRAP', w / 2, 18);
  }, []);

  return <AnimScene drawFn={draw} height={270} />;
}

// ============================================================
// GAME SCENARIOS
// ============================================================
const gameScenarios = [
  { scenario: 'You&apos;ve won 5 trades in a row. Your total is +11.8R. You feel like you can&apos;t lose. An A+ setup appears. What do you do?', opts: ['Take it with double size &mdash; you&apos;re in the zone', 'Take it with normal size &mdash; same rules as always', 'Skip it to protect your streak', 'Take it with half size because you&apos;re suspicious of the streak'], correct: 1, explain: 'Normal size, normal rules. The streak changes NOTHING about your next trade&apos;s probability. An A+ setup at normal size is correct whether you&apos;ve won 5 in a row or lost 5 in a row. The moment you change size based on recent results, you&apos;re gambling.' },
  { scenario: 'After a great week (+8R), you find yourself scanning more pairs than usual, looking for &quot;bonus&quot; setups. Your plan covers 4 pairs. You&apos;re now watching 12. What&apos;s happening?', opts: ['Smart diversification after a profitable week', 'Overconfidence &mdash; you&apos;re expanding beyond your edge', 'Natural progression as a trader', 'Good practice for the future'], correct: 1, explain: 'Scanning 12 pairs when your plan covers 4 is a classic overconfidence symptom. Your edge exists in the 4 pairs you&apos;ve studied and tested. The extra 8 are unfamiliar territory where you have no edge. The winning week made you feel invincible, but your skill hasn&apos;t suddenly tripled.' },
  { scenario: 'A trader who has been profitable for 3 months starts telling friends they&apos;ve &quot;figured out trading.&quot; They begin planning purchases based on next month&apos;s expected profits. What stage of overconfidence is this?', opts: ['Healthy confidence from proven results', 'Dangerous overconfidence &mdash; counting chickens before they hatch', 'Normal for a successful trader', 'Only a problem if they increase position size'], correct: 1, explain: 'Planning spending based on expected future trading profits is a hallmark of overconfidence. Three months of profitability is a tiny sample. Drawdowns will come. When they do, the financial commitments made during the euphoria phase create additional pressure that compounds emotional trading.' },
  { scenario: 'You just closed your biggest win ever: +5.2R on a single trade. Your heart is racing. An okay setup appears (B-grade). What do you do?', opts: ['Take it &mdash; you&apos;re on fire today', 'Skip it &mdash; B-grade setups aren&apos;t in your plan after wins', 'Take it with bigger size &mdash; ride the momentum', 'Skip it, and consider taking a break to cool down'], correct: 3, explain: 'Your heart racing is a physical signal that your emotional state is elevated. Big wins trigger the same dopamine rush as big losses &mdash; both compromise decision-making. Skipping the B-grade setup AND taking a cooling break is the professional move. Return when your heart rate is normal.' },
  { scenario: 'You notice that after winning weeks, your next week is usually worse. Your journal shows: Win Week &rarr; Overtrading Week &rarr; Recovery Week. This cycle repeats every 3-4 weeks. What should you change?', opts: ['Stop trading after winning weeks', 'Add a post-win protocol: reduce size by 50% for 2 days after hitting your weekly target', 'Nothing &mdash; trading has natural cycles', 'Increase your weekly target so you don&apos;t get complacent'], correct: 1, explain: 'Your journal has identified the pattern: overconfidence after wins leads to overtrading, which leads to losses. A post-win protocol (like reducing size after hitting target) BREAKS the cycle by preventing overconfidence from translating into oversized trades. The data told you the problem — now build a rule to solve it.' },
];

// ============================================================
// QUIZ QUESTIONS
// ============================================================
const quizQuestions = [
  { q: 'The difference between confidence and overconfidence is:', opts: ['Confidence is always good, overconfidence is always bad', 'Confidence follows rules regardless of results; overconfidence changes rules based on recent wins', 'There is no meaningful difference', 'Confidence means taking bigger positions'], a: 1, explain: 'True confidence is trust in your PROCESS. It doesn&apos;t change based on recent results. Overconfidence is trust in your STREAK. It makes you deviate from rules because you &quot;feel good.&quot; The process stays constant; the feeling is what changes.' },
  { q: 'After 5 consecutive wins, your probability of winning the 6th trade is:', opts: ['Higher than normal &mdash; you&apos;re in the zone', 'Exactly the same as every other trade', 'Lower than normal &mdash; you&apos;re due for a loss', 'Depends on your confidence level'], a: 1, explain: 'Each trade is statistically independent. The coin doesn&apos;t remember previous flips. Your 6th trade has the exact same probability as your 1st, regardless of the streak. The &quot;hot hand&quot; is a cognitive bias, not a statistical reality.' },
  { q: 'The &quot;winning streak trap&quot; most commonly leads to:', opts: ['Increased position sizes, expanded criteria, and eventual blowback', 'Better trading performance', 'Consistent profits', 'More disciplined trading'], a: 0, explain: 'Winning streaks trigger overconfidence which leads to: bigger positions (&quot;I can handle more risk&quot;), looser criteria (&quot;I don&apos;t need all boxes checked&quot;), more pairs/timeframes (&quot;my skill applies everywhere&quot;). Then one oversized loss erases multiple wins.' },
  { q: 'A professional trader&apos;s position size after 5 consecutive wins should be:', opts: ['Doubled to maximise the streak', 'Exactly the same as after 5 consecutive losses', 'Slightly increased to compound gains', 'Reduced to protect profits'], a: 1, explain: 'Position size is a RULE, not a feeling. Same size after wins, same size after losses. The only input to your size formula should be account balance and risk percentage — never recent results or emotional state.' },
  { q: 'Euphoria in trading is dangerous because:', opts: ['Happy traders make bad decisions', 'It leads to rule-breaking: bigger size, more trades, lower standards', 'It always precedes a crash', 'Emotions should be suppressed'], a: 1, explain: 'Euphoria isn&apos;t the opposite of fear — it&apos;s the mirror image. Both distort decision-making. Euphoria makes you feel invincible, which leads to breaking the very rules that created the wins. The rules work BECAUSE you follow them, not despite them.' },
  { q: 'The best response after your most profitable week ever is:', opts: ['Increase size to capitalise on momentum', 'Take the next week off', 'Continue with EXACTLY the same rules, same size, same criteria', 'Set higher targets for next week'], a: 2, explain: 'Same rules. Same size. Same criteria. The profitable week was the RESULT of your process. Changing the process because of one good result is like rewriting the recipe after one delicious cake. The recipe works — don&apos;t touch it.' },
  { q: 'Physical signs that overconfidence has taken over include:', opts: ['Calmness and clear thinking', 'Excitement, elevated heart rate, urge to trade more, and feeling &quot;invincible&quot;', 'Anxiety and hesitation', 'Boredom and disinterest'], a: 1, explain: 'Overconfidence has physical markers: elevated heart rate, restlessness, the urge to &quot;do something&quot; (trade more), and a sense of invincibility. These are the same dopamine-driven responses that make gambling addictive. Recognise them and activate your post-win protocol.' },
  { q: 'A post-win protocol is:', opts: ['A celebration ritual after wins', 'Pre-set rules that prevent overconfidence from affecting your next trades', 'A way to increase profits during streaks', 'Only needed for beginner traders'], a: 1, explain: 'A post-win protocol is a set of rules designed to counteract overconfidence: reduce size after hitting weekly target, take a 24-hour break after 4+ consecutive wins, re-read your trading plan before the next session. It&apos;s the opposite of a circuit breaker — it activates after WINS, not losses.' },
];

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function ConfidenceOverconfidenceLesson() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const [openZone, setOpenZone] = useState<string | null>(null);
  const [openSign, setOpenSign] = useState<string | null>(null);
  const [openRule, setOpenRule] = useState<string | null>(null);
  const [openTrap, setOpenTrap] = useState<string | null>(null);
  const [openMistake, setOpenMistake] = useState<string | null>(null);

  const [gameRound, setGameRound] = useState(0);
  const [gameAnswer, setGameAnswer] = useState<number | null>(null);
  const [gameScore, setGameScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

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
          <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 4 &middot; Lesson 6</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight"><span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Confidence vs Overconfidence</span></h1>
          <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">After 5 wins you feel invincible. That is the most dangerous moment in trading.</p>
        </motion.div>
      </section>

      {/* S00 — WHY THIS MATTERS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-lg font-bold text-white mb-3">&#127942; A footballer scores 3 goals. He starts trying bicycle kicks from 40 yards. A poker player wins 5 hands. He starts going all-in on mediocre cards. A trader wins 5 trades. He doubles his position size.</p>
            <p className="text-gray-400 leading-relaxed mb-4">In every domain, <strong className="text-amber-400">success breeds overconfidence</strong>. And overconfidence breeds destruction. The skills that created the winning streak don&apos;t change &mdash; but the behaviour does.</p>
            <p className="text-gray-400 leading-relaxed mb-4">This lesson draws a razor-sharp line between <strong className="text-green-400">confidence</strong> (trust in your process) and <strong className="text-red-400">overconfidence</strong> (trust in your streak). One keeps you profitable. The other erases weeks of disciplined work in a single day.</p>
            <p className="text-gray-400 leading-relaxed">The cruel irony: <strong className="text-white">your most profitable period is when you&apos;re at greatest risk</strong>. Because that&apos;s when the rules feel optional.</p>
          </div>
          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">A trader had his best month ever: +14.2R in 3 weeks. Feeling invincible, he doubled his position size in week 4. Two losses at 2x size (-4R total) erased more than a quarter of his month&apos;s gains in 48 hours. His win rate didn&apos;t change. His strategy didn&apos;t change. His SIZE changed &mdash; and that&apos;s all it took.</p>
          </div>
        </motion.div>
      </section>

      {/* S01 — THE THERMOMETER */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Confidence Thermometer</p>
          <h2 className="text-2xl font-extrabold mb-4">Five Zones, One Target</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">Your confidence level should stay in the <strong className="text-green-400">green zone</strong>. Too cold and you freeze. Too hot and you burn.</p>
          <ThermometerAnimation />
        </motion.div>
        <div className="mt-6 space-y-3">
          {[
            { zone: 'Frozen (0-20%)', color: 'text-blue-400', border: 'border-blue-500/20 bg-blue-500/5', desc: 'You can&apos;t pull the trigger. Every setup looks like a trap. You skip signals, question your strategy, and sit on your hands. Your win rate is 0% &mdash; because you&apos;re not trading.', fix: 'Start with the smallest possible size. Trade paper if needed. Track every SKIPPED signal. The data will rebuild confidence.' },
            { zone: 'Fearful (20-40%)', color: 'text-blue-300', border: 'border-blue-400/20 bg-blue-400/5', desc: 'You trade, but hesitantly. You enter with smaller size than your plan says. You close winners at the first sign of pullback. Your strategy is profitable but your execution dilutes the edge.', fix: 'Review your last 50 trades. If the process is solid, the results will follow. Trust the data over the feeling.' },
            { zone: 'Calm Confidence (40-60%)', color: 'text-green-400', border: 'border-green-500/20 bg-green-500/5', desc: 'You follow your plan. Wins feel normal. Losses feel normal. You don&apos;t check Twitter for validation. You don&apos;t feel &quot;excited&quot; or &quot;terrified&quot; &mdash; you feel NEUTRAL. This is the professional state.', fix: 'MAINTAIN THIS. The goal is to STAY here. Post-win protocols and circuit breakers are designed to keep you in this zone.' },
            { zone: 'Ambitious (60-80%)', color: 'text-yellow-400', border: 'border-yellow-500/20 bg-yellow-500/5', desc: 'You&apos;re pushing. Looking at extra pairs. Considering &quot;just a slightly larger&quot; position. Your checklist feels too restrictive. You want to trade MORE because the last few went well.', fix: 'Warning zone. Re-read your rules. Ask: &quot;Would I be doing this if my last 3 trades had LOST?&quot; If no, you&apos;re not confident &mdash; you&apos;re overconfident.' },
            { zone: 'Overheated (80-100%)', color: 'text-red-400', border: 'border-red-500/20 bg-red-500/5', desc: 'Rules are breaking. Size is up. You&apos;re trading outside your session, on unfamiliar pairs, with B-grade setups. You feel invincible. You&apos;re telling people about your winning streak.', fix: 'EMERGENCY. Post-win protocol IMMEDIATELY. Reduce size to 50%. Take a 24-hour break. The blowback trade is coming if you don&apos;t cool down.' },
          ].map((z, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <button onClick={() => setOpenZone(openZone === z.zone ? null : z.zone)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                <p className={`text-sm font-extrabold ${z.color}`}>{z.zone}</p>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openZone === z.zone ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openZone === z.zone && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="px-4 pb-4 pt-2 space-y-2">
                      <div className={`p-3 rounded-lg border ${z.border}`}><p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: z.desc }} /></div>
                      <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/15"><p className="text-xs font-bold text-amber-400 mb-1">&#128161; Action</p><p className="text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: z.fix }} /></div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* S02 — THE WINNING STREAK TRAP */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Winning Streak Trap</p>
          <h2 className="text-2xl font-extrabold mb-4">Watch How Overconfidence Destroys Wins</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">5 disciplined wins build +12.5R. Then overconfidence kicks in. Two oversized trades erase 84% of the gains.</p>
          <WinStreakAnimation />
        </motion.div>
      </section>

      {/* S03 — WARNING SIGNS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; Warning Signs</p>
          <h2 className="text-2xl font-extrabold mb-2">You&apos;re Overconfident If&hellip;</h2>
        </motion.div>
        <div className="space-y-3">
          {[
            { sign: 'You&apos;re thinking about SPENDING your trading profits', why: 'Mental spending (&quot;I&apos;ll buy that watch with next week&apos;s profits&quot;) creates expectations. When drawdowns come, the &quot;lost&quot; purchase triggers emotional trading. Profits aren&apos;t real until they&apos;re withdrawn.' },
            { sign: 'Your checklist feels &quot;too restrictive&quot;', why: 'The checklist felt fine during your losing weeks. Now it feels like it&apos;s holding you back. This is overconfidence talking. The checklist IS your edge. Without it, you&apos;re gambling.' },
            { sign: 'You&apos;re telling friends/family about your winning streak', why: 'Sharing wins creates social pressure to maintain them. When the inevitable drawdown comes, the embarrassment adds emotional weight to every loss. Keep your trading private during streaks.' },
            { sign: 'You&apos;ve increased position size without updating your risk formula', why: 'If your account grew 5% and you increased size proportionally via your formula &mdash; that&apos;s correct. If you increased size because you &quot;feel confident&quot; &mdash; that&apos;s overconfidence. Size changes should come from MATHS, never feelings.' },
            { sign: 'You&apos;re taking B-grade setups &quot;because why not&quot;', why: 'During losing weeks, you wouldn&apos;t touch a B-grade setup. During winning weeks, they look &quot;good enough.&quot; Your criteria haven&apos;t changed &mdash; your standards have dropped. That&apos;s overconfidence eroding your edge.' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <button onClick={() => setOpenSign(openSign === s.sign ? null : s.sign)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                <p className="text-sm font-extrabold text-yellow-400" dangerouslySetInnerHTML={{ __html: `&#9888;&#65039; ${s.sign}` }} />
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

      {/* S04 — THE POST-WIN PROTOCOL */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The Post-Win Protocol</p>
          <h2 className="text-2xl font-extrabold mb-2">Your Defence Against Overconfidence</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">Just like a circuit breaker activates after losses, the post-win protocol activates after wins. Write these into your trading plan.</p>
        </motion.div>
        <div className="space-y-3">
          {[
            { rule: 'After 3 consecutive wins: re-read your trading plan', detail: 'Three wins in a row is great. But it&apos;s also the threshold where overconfidence typically begins. Before your next trade, re-read your full trading plan. Reconnect with the rules that got you here.' },
            { rule: 'After hitting weekly target: reduce size by 50% for remaining days', detail: 'If your weekly target is +5R and you hit it by Wednesday, reduce size to 0.5x for Thursday and Friday. This protects the gain while keeping you in the game. The reduced size prevents overconfidence from turning a great week into an average one.' },
            { rule: 'After 5+ consecutive wins: 24-hour break', detail: 'Five wins in a row is statistically uncommon (roughly 2-3% chance at 45% win rate). Your emotional state is ELEVATED even if you don&apos;t feel it. Take 24 hours off. Return fresh. The market will be there.' },
            { rule: 'After your best day ever: journal BEFORE your next session', detail: 'Before opening charts the next day, write a journal entry about how you FEEL. If the words &quot;invincible,&quot; &quot;unstoppable,&quot; or &quot;easy&quot; appear, you&apos;re overconfident. Trade at half size until those words disappear.' },
          ].map((r, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <button onClick={() => setOpenRule(openRule === r.rule ? null : r.rule)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                <p className="text-sm font-extrabold text-amber-400">{r.rule}</p>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openRule === r.rule ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openRule === r.rule && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="px-4 pb-4 pt-2"><p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: r.detail }} /></div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* S05 — CONFIDENCE vs OVERCONFIDENCE TABLE */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Side by Side</p>
          <h2 className="text-2xl font-extrabold mb-4">Confidence vs Overconfidence</h2>
          <div className="space-y-3">
            {[
              { trait: 'Source', conf: 'Trust in PROCESS (data, backtests, journal)', over: 'Trust in STREAK (recent wins, feelings)' },
              { trait: 'Position size', conf: 'Same after wins and losses (formula-based)', over: 'Increases after wins (emotion-based)' },
              { trait: 'Criteria', conf: 'A+ setups only, always', over: 'B-grade &quot;good enough&quot; during streaks' },
              { trait: 'Session scope', conf: 'Same pairs, same session, same plan', over: 'More pairs, more sessions, more &quot;experiments&quot;' },
              { trait: 'After a loss', conf: '&quot;Cost of business. Next setup.&quot;', over: '&quot;Impossible. Something must be wrong.&quot;' },
              { trait: 'Longevity', conf: 'Sustainable for years. Compounds.', over: 'Lasts days to weeks. Blowback inevitable.' },
            ].map((row, i) => (
              <div key={i} className="p-3 rounded-xl glass-card">
                <p className="text-xs font-bold text-gray-500 mb-2">{row.trait}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2 rounded-lg bg-green-500/5 border border-green-500/15"><p className="text-xs font-bold text-green-400 mb-1">&#9989; Confidence</p><p className="text-xs text-gray-400" dangerouslySetInnerHTML={{ __html: row.conf }} /></div>
                  <div className="p-2 rounded-lg bg-red-500/5 border border-red-500/15"><p className="text-xs font-bold text-red-400 mb-1">&#10060; Overconfidence</p><p className="text-xs text-gray-400" dangerouslySetInnerHTML={{ __html: row.over }} /></div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S06 — THE HOT HAND FALLACY */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; The Hot Hand Fallacy</p>
          <h2 className="text-2xl font-extrabold mb-2">Your Streak Doesn&apos;t Change the Odds</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">The &quot;hot hand&quot; &mdash; the belief that winning makes you more likely to keep winning &mdash; is one of the most studied cognitive biases in psychology. And it&apos;s <strong className="text-white">wrong</strong>.</p>
          <div className="space-y-3">
            {[
              { trap: 'The basketball myth', desc: 'Studies of NBA shooters found that a player&apos;s probability of making a shot is the SAME whether they&apos;ve hit the last 5 or missed the last 5. The &quot;hot hand&quot; is a story the brain invents to find patterns in randomness.' },
              { trap: 'Each trade is a new coin flip', desc: 'Your 6th trade doesn&apos;t know about the first 5. The market doesn&apos;t reward streaks. Your probability of winning the next trade is IDENTICAL whether you&apos;ve won 10 in a row or lost 10 in a row.' },
              { trap: 'The dangerous feeling of certainty', desc: 'After 5 wins, the next trade FEELS certain. That feeling is dopamine, not analysis. The brain releases the same reward chemical for winning streaks that it releases for gambling highs. You&apos;re not more skilled &mdash; you&apos;re more drugged.' },
            ].map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <button onClick={() => setOpenTrap(openTrap === t.trap ? null : t.trap)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <p className="text-sm font-extrabold text-white">{t.trap}</p>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openTrap === t.trap ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openTrap === t.trap && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4 pt-2"><p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: t.desc }} /></div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S07 — THE BLOWBACK TRADE */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; The Blowback Trade</p>
          <h2 className="text-2xl font-extrabold mb-2">The Trade That Erases Everything</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">The &quot;blowback trade&quot; is the oversized, poorly-planned trade that wipes out a winning streak. Here&apos;s the maths:</p>
          <div className="space-y-3">
            <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/5">
              <p className="text-xs font-bold text-green-400 mb-2">5 DISCIPLINED WINS</p>
              <p className="text-sm text-gray-400">5 trades &times; 1x size &times; +2.5R avg = <strong className="text-green-400">+12.5R</strong></p>
            </div>
            <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
              <p className="text-xs font-bold text-red-400 mb-2">1 OVERCONFIDENT BLOWBACK</p>
              <p className="text-sm text-gray-400">1 trade &times; 3x size &times; -1R = <strong className="text-red-400">-3R</strong></p>
              <p className="text-sm text-gray-400 mt-1">+ Revenge trade at 3x: <strong className="text-red-400">-3R</strong></p>
              <p className="text-sm text-gray-400 mt-1">+ Another revenge at 4x: <strong className="text-red-400">-4R</strong></p>
              <p className="text-sm text-red-400 font-bold mt-2">Total blowback: -10R</p>
            </div>
            <div className="p-4 rounded-xl glass-card">
              <p className="text-sm text-amber-400 font-bold">Net result: +12.5R &minus; 10R = +2.5R</p>
              <p className="text-sm text-gray-400 mt-2 leading-relaxed">Five weeks of disciplined trading reduced to a mediocre result by one afternoon of overconfidence. At normal size, the 3 losing trades would have cost -3R total. The extra -7R came entirely from inflated position sizes driven by overconfidence.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S08 — COMMON MISTAKES */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-4">Overconfidence Traps</h2>
        </motion.div>
        <div className="space-y-3">
          {[
            { mistake: '&quot;I&apos;ve earned the right to take bigger positions&quot;', wrong: 'A winning streak doesn&apos;t change your edge. Your strategy doesn&apos;t become MORE profitable because you&apos;ve been winning. Each trade has the same probability regardless of history.', right: 'You&apos;ve earned the right to keep doing what works. Same size. Same rules. The streak IS the reward &mdash; don&apos;t cash it in for one oversized gamble.', tip: 'If you want larger positions, increase them through your risk formula as your account grows &mdash; not through emotional impulse.' },
            { mistake: 'Skipping the pre-trade checklist after wins', wrong: '&quot;I don&apos;t need to check every box &mdash; I can FEEL the setups now.&quot; This is overconfidence disguised as intuition. The checklist IS your intuition &mdash; it&apos;s just written down.', right: 'The checklist applies to EVERY trade, especially after wins. In fact, some traders add an EXTRA check after wins: &quot;Am I taking this trade because it meets criteria, or because I&apos;m feeling good?&quot;', tip: 'Add this to your checklist: &quot;Emotional state check: Would I take this trade if my last 3 had lost?&quot;' },
            { mistake: 'Trading outside your session after a great morning', wrong: 'You made +4R by noon. &quot;Why stop? I&apos;m on fire.&quot; So you trade the afternoon session, which your plan says to skip. The edge that made you +4R doesn&apos;t exist in the afternoon &mdash; your session-specific analysis doesn&apos;t apply.', right: 'When your planned session ends, you end. A great morning is a great morning. Don&apos;t turn it into an average day by gambling the afternoon.', tip: 'Set a hard alarm for session end. When it rings, close the platform. No exceptions.' },
            { mistake: 'Confusing a winning streak with skill improvement', wrong: '&quot;I&apos;ve finally figured it out.&quot; No &mdash; you&apos;ve had a statistically expected cluster of wins. Your skill hasn&apos;t changed in 2 weeks. Variance gave you a streak. Variance will also give you a drawdown.', right: 'Skill improvement is measured over MONTHS with data: improving R:R, reducing C/D-grade trades, better session adherence. Not over days with P&amp;L.', tip: 'Real skill changes slowly. If you suddenly feel &quot;better&quot; after one good week, that&apos;s dopamine, not development.' },
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

      {/* S09 — GAME */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Cool the Thermometer</p>
          <h2 className="text-2xl font-extrabold mb-2">Overconfidence Game</h2>
          <p className="text-sm text-gray-400 mb-6">Five post-win scenarios. Keep the thermometer in the green zone.</p>
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
            <p className="text-sm text-gray-400">{gameScore === 5 ? '&#127942; Perfect. The thermometer stays green.' : gameScore >= 3 ? 'Good temperature control. Build your post-win protocol tonight.' : 'Overconfidence is still pulling you. Re-read the warning signs and thermometer zones.'}</p>
          </motion.div>
        )}
      </section>

      {/* S10 — QUIZ */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Knowledge Check</p>
          <h2 className="text-2xl font-extrabold mb-6">Confidence vs Overconfidence Quiz</h2>
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
        {quizDone && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 text-center p-8 glass-card rounded-2xl"><p className={`text-5xl font-extrabold mb-2 ${score >= 66 ? 'text-amber-400' : 'text-red-400'}`}>{score}%</p><p className="text-sm text-gray-400">{score === 100 ? '&#127942; Perfect. Calm confidence only.' : score >= 66 ? 'Good temperature awareness. Stay in the green zone.' : 'Review the thermometer and the winning streak trap.'}</p></motion.div>)}
      </section>

      {/* Certificate */}
      <section className="px-5 py-16 text-center">
        {!certUnlocked ? (
          <div className="max-w-md mx-auto p-8 glass rounded-2xl"><p className="text-4xl mb-3 opacity-30">&#128274;</p><p className="text-sm text-gray-500">Score 66%+ to unlock your <strong className="text-amber-400">Pro Certificate</strong></p></div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, type: 'spring' }}
            className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(234,179,8,0.06),transparent,rgba(249,115,22,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
            <div className="absolute inset-[1px] rounded-3xl border border-amber-500/10" />
            <div className="relative z-10">
              <div className="w-[80px] h-[80px] mx-auto mb-5 rounded-full bg-gradient-to-br from-yellow-500 via-amber-500 to-orange-500 flex items-center justify-center text-4xl shadow-lg shadow-amber-500/20">&#127942;</div>
              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest mb-2">Pro Certificate</p>
              <h3 className="text-xl font-extrabold mb-1">Certificate of Mastery</h3>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">Has mastered<br /><strong className="text-white">Level 4.6: Confidence vs Overconfidence</strong><br />at ATLAS Academy by Interakktive</p>
              <p className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 bg-clip-text text-transparent font-bold text-lg mb-1" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Temperature Controller &mdash;</p>
              <p className="font-mono text-[11px] text-gray-500 mb-4">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L4.6-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
            </div>
          </motion.div>
        )}
      </section>

      <section className="text-center px-5 pt-10 pb-24">
        <p className="text-xs tracking-widest uppercase text-gray-600 mb-4">Up Next</p>
        <h2 className="text-xl font-bold mb-6">Lesson 4.7 &mdash; Process Over Outcome</h2>
        <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">
          Continue <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
