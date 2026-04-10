// app/academy/lesson/process-over-outcome/page.tsx
// ATLAS Academy — Lesson 4.7: Process Over Outcome [PRO]
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
// SCOREBOARD ANIMATION — 2x2 Process vs Outcome matrix
// ============================================================
function ScoreboardAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);
    const midX = w / 2;
    const midY = h / 2;
    const boxW = w * 0.38;
    const boxH = h * 0.34;
    const gap = 8;
    const pulse = Math.sin(f * 0.04) * 0.15 + 0.85;

    // Labels
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(34,197,94,0.6)';
    ctx.fillText('GOOD PROCESS', midX - boxW / 2 - gap / 2, midY - boxH - gap - 8);
    ctx.fillStyle = 'rgba(239,68,68,0.6)';
    ctx.fillText('BAD PROCESS', midX + boxW / 2 + gap / 2, midY - boxH - gap - 8);

    ctx.save();
    ctx.translate(midX - boxW - gap - 14, midY);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = 'rgba(34,197,94,0.6)';
    ctx.fillText('WIN', 0 + boxH / 2 + gap / 2, 0);
    ctx.fillStyle = 'rgba(239,68,68,0.6)';
    ctx.fillText('LOSS', 0 - boxH / 2 - gap / 2, 0);
    ctx.restore();

    const cells = [
      { x: midX - boxW - gap / 2, y: midY - boxH - gap / 2, label: 'A+', desc: 'Best Trade', color: '#22c55e', alpha: pulse },
      { x: midX + gap / 2, y: midY - boxH - gap / 2, label: 'C-', desc: 'Lucky Gamble', color: '#eab308', alpha: 0.5 },
      { x: midX - boxW - gap / 2, y: midY + gap / 2, label: 'A', desc: 'Cost of Business', color: '#3b82f6', alpha: 0.7 },
      { x: midX + gap / 2, y: midY + gap / 2, label: 'F', desc: 'Worst Trade', color: '#ef4444', alpha: 0.5 },
    ];

    cells.forEach(c => {
      const r = parseInt(c.color.slice(1, 3), 16);
      const g = parseInt(c.color.slice(3, 5), 16);
      const b = parseInt(c.color.slice(5, 7), 16);
      ctx.fillStyle = `rgba(${r},${g},${b},${0.06 * c.alpha})`;
      ctx.beginPath();
      ctx.roundRect(c.x, c.y, boxW, boxH, 12);
      ctx.fill();
      ctx.strokeStyle = `rgba(${r},${g},${b},${0.2 * c.alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.font = `bold ${Math.min(boxW * 0.25, 36)}px system-ui`;
      ctx.textAlign = 'center';
      ctx.fillStyle = `rgba(${r},${g},${b},${0.8 * c.alpha})`;
      ctx.fillText(c.label, c.x + boxW / 2, c.y + boxH * 0.5);
      ctx.font = 'bold 9px system-ui';
      ctx.fillStyle = `rgba(${r},${g},${b},${0.5 * c.alpha})`;
      ctx.fillText(c.desc, c.x + boxW / 2, c.y + boxH * 0.75);
    });

    // Highlight arrow pointing to A+ and A
    const arrowX = midX - boxW / 2 - gap / 2;
    const arrowY = midY;
    ctx.strokeStyle = `rgba(34,197,94,${0.3 * pulse})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(arrowX - boxW * 0.4, midY - boxH - gap);
    ctx.lineTo(arrowX - boxW * 0.4, midY + boxH + gap);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = 'bold 8px system-ui';
    ctx.fillStyle = `rgba(34,197,94,${0.5 * pulse})`;
    ctx.textAlign = 'center';
    ctx.fillText('FOCUS HERE', arrowX - boxW * 0.4, midY + boxH + gap + 14);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// SCALES ANIMATION — Process vs P&L on balance scales
// ============================================================
function ScalesAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);
    const midX = w / 2;
    const baseY = h * 0.85;
    const tilt = Math.sin(f * 0.025) * 12;

    // Stand
    ctx.strokeStyle = 'rgba(148,163,184,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(midX, baseY);
    ctx.lineTo(midX, baseY - h * 0.55);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(midX, baseY - h * 0.55, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(148,163,184,0.4)';
    ctx.fill();

    // Beam
    const beamLen = w * 0.35;
    const pivotY = baseY - h * 0.55;
    const rad = (tilt * Math.PI) / 180;
    const lx = midX - Math.cos(rad) * beamLen;
    const ly = pivotY + Math.sin(rad) * beamLen * 0.3;
    const rx = midX + Math.cos(rad) * beamLen;
    const ry = pivotY - Math.sin(rad) * beamLen * 0.3;

    ctx.strokeStyle = 'rgba(148,163,184,0.4)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.lineTo(rx, ry);
    ctx.stroke();

    // Left pan — Process (heavier = good)
    const panW = 60;
    const panH = 25;
    ctx.fillStyle = 'rgba(34,197,94,0.1)';
    ctx.strokeStyle = 'rgba(34,197,94,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(lx - panW / 2, ly + 10, panW, panH, 6);
    ctx.fill();
    ctx.stroke();
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(34,197,94,0.8)';
    ctx.fillText('PROCESS', lx, ly + 26);

    // Right pan — P&L
    ctx.fillStyle = 'rgba(239,68,68,0.1)';
    ctx.strokeStyle = 'rgba(239,68,68,0.3)';
    ctx.beginPath();
    ctx.roundRect(rx - panW / 2, ry + 10, panW, panH, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(239,68,68,0.8)';
    ctx.fillText('P&L', rx, ry + 26);

    // Labels
    ctx.font = 'bold 8px system-ui';
    const pulse = Math.sin(f * 0.05) * 0.2 + 0.8;
    ctx.fillStyle = `rgba(34,197,94,${0.4 * pulse})`;
    ctx.fillText('What matters long-term', lx, ly + 48);
    ctx.fillStyle = 'rgba(239,68,68,0.3)';
    ctx.fillText('What feels important now', rx, ry + 48);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// DATA
// ============================================================
const quadrants = [
  { grade: 'A+', title: 'Good Process + Win', emoji: '&#9989;', color: 'green', desc: 'The best trade. You followed every rule and the market rewarded you. This is your bread and butter &mdash; the trades that compound your account.', action: 'Journal it. Repeat it. This is your edge in action.' },
  { grade: 'A', title: 'Good Process + Loss', emoji: '&#128170;', color: 'blue', desc: 'The second-best trade. You followed every rule and lost. This is a COST OF BUSINESS. Probability took its turn. Nothing to fix, nothing to regret.', action: 'Log it, move on. Zero changes needed. You did everything right.' },
  { grade: 'C-', title: 'Bad Process + Win', emoji: '&#9888;&#65039;', color: 'yellow', desc: 'The most dangerous trade. You broke rules and still profited. This REINFORCES bad habits. The market just rewarded you for gambling &mdash; next time it won&apos;t.', action: 'Treat this as a LOSS in your journal. The P&L lied to you.' },
  { grade: 'F', title: 'Bad Process + Loss', emoji: '&#10060;', color: 'red', desc: 'The worst trade. You broke rules and lost. At least the market gave honest feedback. But this is where spirals start &mdash; because the pain drives revenge.', action: 'Full post-mortem. Identify which rule was broken. Circuit breaker if repeated.' },
];

const gradingCriteria = [
  { id: 'setup', label: 'A+ Setup', desc: 'Did the trade meet ALL criteria from your trading plan? Not a B-grade or C-grade setup.', weight: 25 },
  { id: 'entry', label: 'Correct Entry', desc: 'Did you enter at the planned level? Not early, not late, not chasing.', weight: 20 },
  { id: 'size', label: 'Proper Sizing', desc: 'Did you risk exactly 1R (or your predefined amount)? Not more because you felt confident.', weight: 20 },
  { id: 'management', label: 'Trade Management', desc: 'Did you follow your TP and SL plan? No moving stops, no removing take-profits.', weight: 20 },
  { id: 'emotion', label: 'Emotional Control', desc: 'Were you calm? No revenge, no FOMO, no fear-based exits.', weight: 15 },
];

const myths = [
  { myth: '&ldquo;Winners don&apos;t need process grades&rdquo;', reality: 'A bad-process win is more harmful than a good-process loss. It reinforces the exact behaviour that will eventually blow your account. Winners without process are just gamblers on a streak.' },
  { myth: '&ldquo;The market doesn&apos;t care about your process&rdquo;', reality: 'Correct &mdash; the market doesn&apos;t care. But YOUR ACCOUNT does. Over 1,000 trades, the trader with consistent process will ALWAYS outperform the trader with inconsistent process, regardless of short-term results.' },
  { myth: '&ldquo;Just make money, who cares how&rdquo;', reality: 'Ask any prop firm manager: they care HOW you make money. Erratic, high-variance returns get you cut faster than a steady 5% drawdown. Process creates consistency. Consistency creates trust. Trust creates capital.' },
  { myth: '&ldquo;I&apos;ll improve process when I&apos;m profitable&rdquo;', reality: 'Backwards. Process IS how you become profitable. Waiting for profits to "earn" the right to have discipline is like waiting to be fit before joining a gym.' },
];

const mistakes = [
  { wrong: 'Only journaling winning trades', right: 'Journal EVERY trade, grading process separately from P&L. Losses with good process are your most valuable data.', emoji: '&#128221;' },
  { wrong: 'Judging a strategy by last week&apos;s results', right: 'Judge over 50-100 trades minimum. A 45% win-rate strategy can easily produce 7 losses in a row &mdash; that doesn&apos;t mean it&apos;s broken.', emoji: '&#128202;' },
  { wrong: 'Celebrating big wins without checking process', right: 'After every win, ask: &ldquo;Would I take this trade again the same way?&rdquo; If the answer is no, the win was luck, not skill.', emoji: '&#127881;' },
  { wrong: 'Changing strategy after a losing week', right: 'If every losing trade followed your plan, the plan is working. Change strategy only after process-graded data shows a genuine edge decay.', emoji: '&#128260;' },
];

const gameScenarios = [
  { scenario: 'You take a textbook A+ setup. Perfect entry, proper sizing, SL in place. The trade hits your stop loss for -1R. Your friend messages: &ldquo;Tough loss, what went wrong?&rdquo;', options: ['&ldquo;Nothing. Perfect process, market just moved against me. Cost of business.&rdquo;', '&ldquo;I should have used a wider stop loss to avoid being hit.&rdquo;', '&ldquo;Maybe this strategy isn&apos;t working anymore, I&apos;ll try something new.&rdquo;'], correct: 0, explain: 'A good-process loss needs ZERO changes. This is an A-grade trade &mdash; the second-best outcome. Moving the stop wider would have broken your rules to avoid a normal loss.' },
  { scenario: 'You enter a trade without checking your plan because &ldquo;it just looked good.&rdquo; The trade hits TP for +2R. How do you log this in your journal?', options: ['Green &mdash; a win is a win, +2R in the account', 'Process Grade: F. Outcome: +2R. This is a C- quadrant trade that got lucky.', 'Don&apos;t journal it &mdash; it was an impulse, not a &ldquo;real&rdquo; trade'], correct: 1, explain: 'This is a C- (bad process + win) &mdash; the most dangerous quadrant. Logging it as a process failure ensures you don&apos;t reinforce the gambling behaviour.' },
  { scenario: 'After 3 consecutive A-grade losses (-3R), you sit out for the rest of the day even though an A+ setup appears. A colleague says you&apos;re &ldquo;leaving money on the table.&rdquo;', options: ['He&apos;s right &mdash; an A+ setup should always be taken', 'My rule says max 3 trades per day. Process over opportunity. I sit out.', 'I&apos;ll take it but reduce size to &ldquo;earn back&rdquo; some losses'], correct: 1, explain: 'Your daily limit exists to protect you from exactly this scenario. Breaking the rule because the setup &ldquo;looks good&rdquo; is process violation. Process over opportunity, always.' },
  { scenario: 'You review your last 50 trades. Win rate: 42%. But process grade: 88% (44 of 50 trades followed the plan). Are you concerned?', options: ['Yes &mdash; 42% win rate is terrible, the strategy needs changing', 'No &mdash; 88% process compliance is excellent. The 42% WR at 1:2.5 R:R gives positive expectancy (+0.63R per trade)', 'Concerned about the 12% bad-process trades only'], correct: 1, explain: 'With 1:2.5 R:R, a 42% win rate gives +0.63R expectancy per trade. Over 50 trades that&apos;s +31.5R. High process compliance with positive expectancy = system is working perfectly.' },
  { scenario: 'Your best month ever: +22R. You&apos;re tempted to raise risk from 1% to 2% per trade because &ldquo;the strategy is clearly working.&rdquo; What does a process-first trader do?', options: ['Raise to 2% &mdash; the results justify it', 'Keep 1% &mdash; one month of data is not enough to change risk parameters. Minimum 3-6 months of process-graded data.', 'Raise to 1.5% as a compromise'], correct: 1, explain: 'One month is roughly 15-20 trades. That&apos;s nowhere near enough data to justify a permanent risk increase. A process-first trader changes parameters only after 100+ process-graded trades confirm the edge.' },
];

const quizQuestions = [
  { q: 'Which is the second-best trade outcome?', opts: ['Bad process + win', 'Good process + win', 'Good process + loss', 'Bad process + loss'], a: 2, explain: 'Good process + loss (A-grade) is the second-best outcome. You did everything right &mdash; the market simply exercised probability. Nothing to fix.' },
  { q: 'Why is a bad-process win (C-) considered <em>dangerous</em>?', opts: ['Because the profit is small', 'Because it reinforces rule-breaking behaviour', 'Because it happens rarely', 'Because the market was trending'], a: 1, explain: 'A C- win rewards you for gambling. Your brain logs &ldquo;breaking rules = profit&rdquo; and you&apos;re more likely to break rules again. The P&L lied to you.' },
  { q: 'How many trades is the minimum sample to judge a strategy&apos;s edge?', opts: ['5-10 trades', '15-20 trades', '50-100 trades', '500+ trades'], a: 2, explain: '50-100 process-graded trades is the minimum. Fewer trades and random variance dominates. You cannot distinguish edge from luck in a small sample.' },
  { q: 'What should you do after a perfect-process loss?', opts: ['Widen your stop on the next trade', 'Switch to a different strategy', 'Log it as an A-grade trade and change nothing', 'Skip the next trading session'], a: 2, explain: 'Good process + loss = A-grade = cost of business. You change NOTHING. The process was correct; the outcome was probability.' },
  { q: 'A trader has 88% process compliance but 42% win rate with 1:2.5 R:R. Is this profitable?', opts: ['No &mdash; sub-50% win rate means losing money', 'Yes &mdash; 42% &times; 2.5R wins exceed 58% &times; 1R losses', 'Cannot determine without more data', 'Only if the trader increases position size'], a: 1, explain: 'Expectancy = (0.42 &times; 2.5) - (0.58 &times; 1) = 1.05 - 0.58 = +0.47R per trade. Highly profitable. Win rate alone is meaningless without R:R context.' },
  { q: 'When should you change your risk percentage?', opts: ['After your best month', 'After 3 consecutive wins', 'After 100+ process-graded trades confirm the edge over 3-6 months', 'When you feel confident'], a: 2, explain: 'Risk parameters change only with statistically significant process-graded data. One good month or a streak is noise, not signal.' },
  { q: 'Your trading plan says max 3 trades per day. After 3 losses, an A+ setup appears. What do you do?', opts: ['Take it &mdash; an A+ setup overrides daily limits', 'Take it at half size', 'Sit out &mdash; process over opportunity', 'Take it but tighten the stop'], a: 2, explain: 'The daily limit IS part of your process. Breaking it &mdash; even for an A+ setup &mdash; is a process violation. The A+ setup will appear again tomorrow.' },
  { q: 'What does &ldquo;the P&L lied to you&rdquo; mean?', opts: ['Your broker is manipulating prices', 'A profitable trade can still be a BAD trade if the process was wrong', 'You miscalculated your position size', 'The spread was wider than expected'], a: 1, explain: 'When you profit from broken rules, the P&L says &ldquo;good job.&rdquo; But your process grade says &ldquo;you gambled and got lucky.&rdquo; Trust the process grade, not the P&L.' },
];

export default function ProcessOverOutcomePage() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h); }, []);

  const [openQuad, setOpenQuad] = useState<string | null>(null);
  const [openMyth, setOpenMyth] = useState<string | null>(null);
  const [openMistake, setOpenMistake] = useState<string | null>(null);
  const [openCriteria, setOpenCriteria] = useState<string | null>(null);

  // Interactive grading tool
  const [grades, setGrades] = useState<Record<string, boolean | null>>({});
  const gradesDone = gradingCriteria.every(c => grades[c.id] !== undefined && grades[c.id] !== null);
  const gradeScore = gradesDone ? gradingCriteria.reduce((sum, c) => sum + (grades[c.id] ? c.weight : 0), 0) : 0;
  const gradeLabel = gradeScore >= 90 ? 'A+' : gradeScore >= 75 ? 'A' : gradeScore >= 60 ? 'B' : gradeScore >= 40 ? 'C' : 'F';
  const gradeColor = gradeScore >= 75 ? 'green' : gradeScore >= 60 ? 'blue' : gradeScore >= 40 ? 'yellow' : 'red';

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
          <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 4 &middot; Lesson 7</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight"><span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Process Over Outcome</span></h1>
          <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">Grade the trade, not the P&amp;L. A losing trade with perfect process beats a winning trade with broken rules.</p>
        </motion.div>
      </section>

      {/* S00 — WHY THIS MATTERS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-lg font-bold text-white mb-3">&#127891; Imagine two students take an exam. Student A studies hard, answers every question methodically, and scores 72%. Student B doesn&apos;t study, guesses randomly, and scores 78%.</p>
            <p className="text-gray-400 leading-relaxed mb-4">Who would you bet on for the NEXT exam? <strong className="text-amber-400">Student A, every single time</strong>. Because Student A has a repeatable process. Student B got lucky. Luck doesn&apos;t scale.</p>
            <p className="text-gray-400 leading-relaxed mb-4">Trading is identical. A winning trade with broken rules is <strong className="text-red-400">worse</strong> than a losing trade with perfect rules. Because the winner teaches your brain to gamble. The loser teaches nothing &mdash; you already did everything right.</p>
            <p className="text-gray-400 leading-relaxed">This lesson gives you a <strong className="text-white">grading system for your trades</strong> that has nothing to do with whether you made or lost money. It&apos;s the single most important mindset shift a trader can make.</p>
          </div>
          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">A prop firm reviewed 2,000 trades from their top 10 performers. The #1 trader had a 41% win rate &mdash; the lowest of all ten. But his process compliance was 96%. He followed his plan on virtually every trade, never deviated on sizing, and never revenge traded. His R:R did the rest. The traders who were cut? All had 55%+ win rates but sub-70% process compliance.</p>
          </div>
        </motion.div>
      </section>

      {/* S01 — THE SCOREBOARD */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Four Quadrants</p>
          <h2 className="text-2xl font-extrabold mb-4">The Process-Outcome Matrix</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Every trade you ever take lands in one of four boxes. Two of them are obvious. The other two will change how you think about trading forever.</p>
          <div className="mb-6 rounded-2xl overflow-hidden border border-white/5">
            <ScoreboardAnimation />
          </div>
          <div className="space-y-3">
            {quadrants.map(q => (
              <div key={q.grade}>
                <button onClick={() => setOpenQuad(openQuad === q.grade ? null : q.grade)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <div className="flex items-center gap-3">
                    <span className={`text-xl font-extrabold ${q.color === 'green' ? 'text-green-400' : q.color === 'blue' ? 'text-blue-400' : q.color === 'yellow' ? 'text-yellow-400' : 'text-red-400'}`}>{q.grade}</span>
                    <div><p className="text-sm font-bold text-white" dangerouslySetInnerHTML={{ __html: q.title }} /><p className="text-xs text-gray-500" dangerouslySetInnerHTML={{ __html: q.emoji }} /></div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openQuad === q.grade ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openQuad === q.grade && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden"><div className="p-4 mx-2 mt-1 rounded-xl bg-white/[0.02] border border-white/5"><p className="text-sm text-gray-400 leading-relaxed mb-3" dangerouslySetInnerHTML={{ __html: q.desc }} /><p className="text-sm text-amber-400 font-semibold" dangerouslySetInnerHTML={{ __html: `&#9889; ${q.action}` }} /></div></motion.div>)}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S02 — THE SCALES */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Scales of Justice</p>
          <h2 className="text-2xl font-extrabold mb-4">What Professionals Actually Measure</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Amateurs measure their P&amp;L at the end of each day. Professionals measure their <strong className="text-white">process compliance</strong> at the end of each day. The P&amp;L takes care of itself.</p>
          <div className="mb-6 rounded-2xl overflow-hidden border border-white/5">
            <ScalesAnimation />
          </div>
          <div className="p-5 rounded-2xl glass-card">
            <p className="text-sm font-bold text-white mb-3">The Professional&apos;s End-of-Day Questions:</p>
            <div className="space-y-2">
              {['Did I follow my trading plan on every trade?', 'Did I stick to my predefined risk on every trade?', 'Did I avoid impulse entries?', 'Did I respect my daily limits?', 'Would I take every trade the same way again?'].map((q, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-gray-400"><span className="text-amber-400 mt-0.5">&#10003;</span><span dangerouslySetInnerHTML={{ __html: q }} /></div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-4">Notice: none of these questions mention money. That&apos;s deliberate.</p>
          </div>
        </motion.div>
      </section>

      {/* S03 — THE GRADING CRITERIA */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The Grading Rubric</p>
          <h2 className="text-2xl font-extrabold mb-4">Five Criteria, Zero About Money</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Every trade gets graded on these five process criteria. If you score 75%+ on process, the trade is a <strong className="text-green-400">good trade</strong> &mdash; regardless of outcome.</p>
          <div className="space-y-3">
            {gradingCriteria.map(c => (
              <div key={c.id}>
                <button onClick={() => setOpenCriteria(openCriteria === c.id ? null : c.id)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <div className="flex items-center gap-3"><span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded">{c.weight}%</span><p className="text-sm font-bold text-white">{c.label}</p></div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openCriteria === c.id ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openCriteria === c.id && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden"><div className="p-4 mx-2 mt-1 rounded-xl bg-white/[0.02] border border-white/5"><p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: c.desc }} /></div></motion.div>)}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S04 — INTERACTIVE TRADE GRADER */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Grade Your Last Trade</p>
          <h2 className="text-2xl font-extrabold mb-4">Interactive Process Grader</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Think of your most recent trade. Answer honestly for each criterion &mdash; did you follow the rule or break it?</p>
          <div className="p-5 rounded-2xl glass-card">
            <div className="space-y-4">
              {gradingCriteria.map(c => (
                <div key={c.id} className="flex items-center justify-between">
                  <div><p className="text-sm font-bold text-white">{c.label}</p><p className="text-xs text-gray-500">{c.weight}% weight</p></div>
                  <div className="flex gap-2">
                    <button onClick={() => setGrades(prev => ({ ...prev, [c.id]: true }))} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${grades[c.id] === true ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'glass text-gray-500 hover:text-gray-300'}`}>&#10003; Yes</button>
                    <button onClick={() => setGrades(prev => ({ ...prev, [c.id]: false }))} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${grades[c.id] === false ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'glass text-gray-500 hover:text-gray-300'}`}>&#10007; No</button>
                  </div>
                </div>
              ))}
            </div>
            {gradesDone && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-4 rounded-xl border border-white/10 text-center">
                <p className={`text-4xl font-extrabold mb-1 ${gradeColor === 'green' ? 'text-green-400' : gradeColor === 'blue' ? 'text-blue-400' : gradeColor === 'yellow' ? 'text-yellow-400' : 'text-red-400'}`}>{gradeLabel}</p>
                <p className="text-sm text-gray-400">Process Score: {gradeScore}%</p>
                <p className="text-xs text-gray-500 mt-2">{gradeScore >= 75 ? 'Excellent process. This is a good trade regardless of P&L.' : gradeScore >= 60 ? 'Decent but room to improve. Identify the broken criteria.' : 'Process failure. Journal what went wrong and add a prevention rule.'}</p>
                <button onClick={() => setGrades({})} className="mt-3 text-xs text-amber-400 hover:text-amber-300 transition">Grade another trade &rarr;</button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </section>

      {/* S05 — THE MATHS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; The Maths</p>
          <h2 className="text-2xl font-extrabold mb-4">Process Compliance Over 100 Trades</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Same strategy. Same win rate. Same R:R. The ONLY difference is process compliance.</p>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/5 text-center">
              <p className="text-xs text-green-400 font-bold mb-1">90% Process</p>
              <p className="text-2xl font-extrabold text-green-400">+42R</p>
              <p className="text-xs text-gray-500 mt-1">90 planned trades, 10 impulse trades. Planned trades: 45% WR, 1:2.5 R:R. Impulse: 30% WR, 1:1 R:R.</p>
            </div>
            <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-center">
              <p className="text-xs text-red-400 font-bold mb-1">60% Process</p>
              <p className="text-2xl font-extrabold text-red-400">+14R</p>
              <p className="text-xs text-gray-500 mt-1">60 planned trades, 40 impulse trades. Same rates. 28R less profit from 30 more impulse trades.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl glass-card">
            <p className="text-sm text-gray-400 leading-relaxed">The difference: <strong className="text-white">+28R per 100 trades</strong>. On a &pound;10,000 account risking 1%, that&apos;s <strong className="text-amber-400">&pound;2,800 per 100 trades</strong> &mdash; from process compliance alone. No strategy change. No new indicator. Just following the plan you already have.</p>
          </div>
        </motion.div>
      </section>

      {/* S06 — MYTHS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Myths Busted</p>
          <h2 className="text-2xl font-extrabold mb-4">Process Myths That Keep Traders Broke</h2>
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

      {/* S07 — THE JOURNAL TEMPLATE */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; The Process Journal</p>
          <h2 className="text-2xl font-extrabold mb-4">What Your Journal Should Actually Look Like</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Most traders write: &ldquo;Bought EUR/USD, lost $50.&rdquo; That&apos;s a transaction log, not a journal. Here&apos;s what a process-first journal entry looks like:</p>
          <div className="p-5 rounded-2xl glass-card">
            <div className="space-y-3 text-sm">
              {[
                { label: 'Date &amp; Pair', value: '10 Apr &mdash; EUR/USD' },
                { label: 'Setup Grade', value: 'A+ (all criteria met)' },
                { label: 'Entry Grade', value: 'A (entered at planned level)' },
                { label: 'Size Grade', value: 'A (1R, no deviation)' },
                { label: 'Management Grade', value: 'B (moved TP 5 pips &mdash; minor deviation)' },
                { label: 'Emotion Grade', value: 'A (calm throughout)' },
                { label: 'PROCESS SCORE', value: '90%' },
                { label: 'Outcome', value: '-1R (stop hit)' },
                { label: 'OVERALL GRADE', value: 'A &mdash; Great trade. The loss is irrelevant.' },
              ].map((row, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-gray-500" dangerouslySetInnerHTML={{ __html: row.label }} />
                  <span className={`font-bold ${i === 6 ? 'text-green-400' : i === 8 ? 'text-amber-400' : 'text-white'}`} dangerouslySetInnerHTML={{ __html: row.value }} />
                </div>
              ))}
            </div>
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
          <h2 className="text-2xl font-extrabold mb-6">Process First &mdash; 5 Scenarios</h2>
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
            <p className="text-sm text-gray-400">{gameScore === 5 ? 'Perfect process compliance. You think like a professional.' : gameScore >= 3 ? 'Good instincts. Review the C- quadrant section.' : 'The P&L is lying to you. Re-read the four quadrants.'}</p>
          </motion.div>
          )}
        </motion.div>
      </section>

      {/* S10 — QUIZ */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Knowledge Check</p>
          <h2 className="text-2xl font-extrabold mb-6">Process Over Outcome Quiz</h2>
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
        {quizDone && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 text-center p-8 glass-card rounded-2xl"><p className={`text-5xl font-extrabold mb-2 ${score >= 66 ? 'text-amber-400' : 'text-red-400'}`}>{score}%</p><p className="text-sm text-gray-400">{score === 100 ? '&#127942; Perfect. You grade the trade, not the P&L.' : score >= 66 ? 'Strong process mindset. Keep grading every trade.' : 'Review the four quadrants and the grading rubric.'}</p></motion.div>)}
      </section>

      {/* Certificate */}
      <section className="px-5 py-16 text-center">
        {!certUnlocked ? (
          <div className="max-w-md mx-auto p-8 glass rounded-2xl"><p className="text-4xl mb-3 opacity-30">&#128274;</p><p className="text-sm text-gray-500">Score 66%+ to unlock your <strong className="text-amber-400">Pro Certificate</strong></p></div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, type: 'spring' }}
            className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(34,197,94,0.06),transparent,rgba(59,130,246,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
            <div className="absolute inset-[1px] rounded-3xl border border-amber-500/10" />
            <div className="relative z-10">
              <div className="w-[80px] h-[80px] mx-auto mb-5 rounded-full bg-gradient-to-br from-green-500 via-blue-500 to-amber-500 flex items-center justify-center text-4xl shadow-lg shadow-green-500/20">&#128221;</div>
              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest mb-2">Pro Certificate</p>
              <h3 className="text-xl font-extrabold mb-1">Certificate of Mastery</h3>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">Has mastered<br /><strong className="text-white">Level 4.7: Process Over Outcome</strong><br />at ATLAS Academy by Interakktive</p>
              <p className="bg-gradient-to-r from-green-400 via-blue-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Process Master &mdash;</p>
              <p className="font-mono text-[11px] text-gray-500 mb-4">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L4.7-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
            </div>
          </motion.div>
        )}
      </section>

      <section className="text-center px-5 pt-10 pb-24">
        <p className="text-xs tracking-widest uppercase text-gray-600 mb-4">Up Next</p>
        <h2 className="text-xl font-bold mb-6">Lesson 4.8 &mdash; The Waiting Game &mdash; Patience as a Skill</h2>
        <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">
          Continue <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
