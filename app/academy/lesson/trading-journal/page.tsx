// app/academy/lesson/trading-journal/page.tsx
// ATLAS Academy — Lesson 4.10: The Trading Journal — Your Psychologist [PRO]
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
// MIRROR ANIMATION — Journal reflects hidden patterns
// ============================================================
function MirrorAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);
    const midX = w / 2;
    const midY = h / 2;

    // Mirror frame
    ctx.strokeStyle = 'rgba(148,163,184,0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(midX, midY, w * 0.22, h * 0.38, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Mirror glass
    const pulse = Math.sin(f * 0.025) * 0.04 + 0.04;
    ctx.fillStyle = `rgba(59,130,246,${pulse})`;
    ctx.beginPath();
    ctx.ellipse(midX, midY, w * 0.21, h * 0.37, 0, 0, Math.PI * 2);
    ctx.fill();

    // Left side — What you see (surface)
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(148,163,184,0.4)';
    ctx.fillText('WHAT YOU SEE', midX - w * 0.25, 30);

    const leftItems = ['+2R', '-1R', '+1.5R', '-0.5R', '+3R'];
    leftItems.forEach((item, i) => {
      const y = midY - 50 + i * 25;
      const x = midX - w * 0.28;
      const isPos = item.startsWith('+');
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'right';
      ctx.fillStyle = isPos ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)';
      ctx.fillText(item, x, y);
    });

    // Right side — What the journal reveals (deep)
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(245,158,11,0.4)';
    ctx.fillText('WHAT THE JOURNAL REVEALS', midX + w * 0.25, 30);

    const rightItems = ['FOMO entry', 'A+ process', 'Moved TP early', 'Revenge sized', 'Boredom trade'];
    rightItems.forEach((item, i) => {
      const y = midY - 50 + i * 25;
      const x = midX + w * 0.28;
      const isGood = item.includes('A+');
      ctx.font = '9px system-ui';
      ctx.textAlign = 'left';
      ctx.fillStyle = isGood ? `rgba(34,197,94,${0.4 + Math.sin(f * 0.03 + i) * 0.1})` : `rgba(239,68,68,${0.3 + Math.sin(f * 0.03 + i) * 0.1})`;
      ctx.fillText(item, x, y);

      // Connecting line through mirror
      ctx.strokeStyle = `rgba(148,163,184,${0.05 + Math.sin(f * 0.02 + i * 0.8) * 0.03})`;
      ctx.lineWidth = 0.5;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(midX - w * 0.28 + 5, y - 4);
      ctx.lineTo(midX + w * 0.28 - 5, y - 4);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Bottom label
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(245,158,11,0.5)';
    ctx.fillText('P&L tells you WHAT happened. The journal tells you WHY.', midX, h - 20);
  }, []);
  return <AnimScene drawFn={draw} height={270} />;
}

// ============================================================
// ICEBERG JOURNAL ANIMATION — Surface P&L vs deep data
// ============================================================
function IcebergJournalAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);
    const midX = w / 2;
    const waterY = h * 0.35;

    // Water line
    const waveOffset = f * 0.02;
    ctx.strokeStyle = 'rgba(59,130,246,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < w; x += 2) {
      const y = waterY + Math.sin(x * 0.03 + waveOffset) * 3;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Above water — small triangle (P&L)
    ctx.fillStyle = 'rgba(148,163,184,0.08)';
    ctx.beginPath();
    ctx.moveTo(midX, waterY - 55);
    ctx.lineTo(midX - 35, waterY);
    ctx.lineTo(midX + 35, waterY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(148,163,184,0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(148,163,184,0.5)';
    ctx.fillText('10% — P&L', midX, waterY - 30);
    ctx.font = '7px system-ui';
    ctx.fillStyle = 'rgba(148,163,184,0.3)';
    ctx.fillText('Win/loss, R gained', midX, waterY - 18);

    // Below water — large shape (journal data)
    ctx.fillStyle = 'rgba(245,158,11,0.04)';
    ctx.beginPath();
    ctx.moveTo(midX - 35, waterY + 2);
    ctx.lineTo(midX + 35, waterY + 2);
    ctx.lineTo(midX + 80, waterY + 60);
    ctx.lineTo(midX + 60, waterY + 120);
    ctx.lineTo(midX, waterY + 145);
    ctx.lineTo(midX - 60, waterY + 120);
    ctx.lineTo(midX - 80, waterY + 60);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(245,158,11,0.12)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Labels below water
    const deepLabels = [
      { text: 'Emotions felt', y: waterY + 35 },
      { text: 'Rules followed/broken', y: waterY + 52 },
      { text: 'Entry quality', y: waterY + 69 },
      { text: 'Decision rationale', y: waterY + 86 },
      { text: 'Patterns over time', y: waterY + 103 },
      { text: 'Psychological triggers', y: waterY + 120 },
    ];
    deepLabels.forEach((l, i) => {
      const alpha = 0.3 + Math.sin(f * 0.025 + i * 0.7) * 0.1;
      ctx.font = '8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillStyle = `rgba(245,158,11,${alpha})`;
      ctx.fillText(l.text, midX, l.y);
    });

    ctx.font = 'bold 8px system-ui';
    ctx.fillStyle = 'rgba(245,158,11,0.4)';
    ctx.fillText('90% — JOURNAL DATA', midX, waterY + 140);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// DATA
// ============================================================
const journalFields = [
  { field: 'Date &amp; Time', desc: 'When the trade was taken. Over time, you&apos;ll discover patterns: &ldquo;I lose more on Mondays&rdquo; or &ldquo;My best trades are in the first hour of London.&rdquo;', category: 'basic' },
  { field: 'Pair / Asset', desc: 'What you traded. After 100 entries, you&apos;ll see which instruments you perform best on &mdash; and which ones cost you money.', category: 'basic' },
  { field: 'Direction &amp; Bias', desc: 'Were you long or short? Did this match your pre-session bias? Trades against your bias tend to underperform.', category: 'basic' },
  { field: 'Setup Type', desc: 'Order block, FVG, liquidity sweep, etc. Knowing which setup type has the highest win rate IN YOUR DATA is invaluable.', category: 'technical' },
  { field: 'Entry Trigger', desc: 'What specifically made you click the button? A displacement candle? A ChoCH? Or was it &ldquo;it just looked right&rdquo;? Be brutally honest.', category: 'technical' },
  { field: 'Process Grade (A+ to F)', desc: 'Did you follow your plan? This is the single most important field. Grade the trade, not the P&amp;L. See Lesson 4.7.', category: 'psychology' },
  { field: 'Emotion Before Entry', desc: 'Calm, anxious, excited, bored, frustrated, revenge-driven? One word. Over 50 trades, patterns emerge that will shock you.', category: 'psychology' },
  { field: 'Emotion During Trade', desc: 'Did you feel urge to close early? Move the stop? Add size? These micro-emotions reveal your psychological weaknesses.', category: 'psychology' },
  { field: 'Emotion After Exit', desc: 'Relief, regret, satisfaction, anger? Post-exit emotion predicts whether your NEXT trade will be rational or emotional.', category: 'psychology' },
  { field: 'Screenshot', desc: 'Chart screenshot at entry with levels marked. In 3 months, you&apos;ll review these and see your analysis improving visibly.', category: 'technical' },
  { field: 'What I&apos;d Do Differently', desc: 'One sentence. Not five paragraphs. One actionable change. This compounds into massive improvement over months.', category: 'review' },
  { field: 'Outcome (R)', desc: 'The LAST field, not the first. Outcome is recorded for data purposes but is the least important column for learning.', category: 'basic' },
];

const journalPatterns = [
  { pattern: 'Time-based patterns', example: '&ldquo;My win rate drops 40% after 10:30 AM&rdquo;', action: 'Stop trading after 10:30. Your data just gave you a free edge improvement.', emoji: '&#9200;' },
  { pattern: 'Emotion-outcome correlation', example: '&ldquo;When I journal &apos;excited&apos; before entry, I lose 73% of the time&rdquo;', action: 'Excitement = red flag. Add a rule: if excited, wait 5 minutes and re-check the setup.', emoji: '&#128293;' },
  { pattern: 'Setup-type performance', example: '&ldquo;Order blocks: 52% WR. FVGs: 38% WR.&rdquo;', action: 'Drop FVG trades or refine the criteria. Focus capital on your proven edge.', emoji: '&#128200;' },
  { pattern: 'Day-of-week analysis', example: '&ldquo;Fridays are net negative every month&rdquo;', action: 'Consider not trading Fridays. Or reduce size by 50% on Fridays.', emoji: '&#128197;' },
  { pattern: 'Post-loss behaviour', example: '&ldquo;After 2+ losses, my next 3 trades have 22% WR vs my normal 48%&rdquo;', action: 'Tighten your circuit breaker. After 2 losses, mandatory break. Your data proves it.', emoji: '&#128680;' },
];

const journalTypes = [
  { type: 'Spreadsheet', pros: 'Easy to sort, filter, and calculate stats. Best for quantitative analysis. Google Sheets or Excel.', cons: 'No screenshots inline. Can feel clinical. Easy to skip the emotional fields.', best: 'Traders who love data and want to run pivot tables on their performance.' },
  { type: 'Notion / Digital Notes', pros: 'Screenshots, text, tables all in one place. Flexible layout. Searchable.', cons: 'Harder to run calculations. Can become disorganised without a template.', best: 'Traders who want a rich, visual journal with screenshots and narrative.' },
  { type: 'Physical Notebook', pros: 'Forces you to slow down. Writing by hand improves retention. No distractions.', cons: 'Can&apos;t search, sort, or calculate statistics. No screenshots. Hard to review 100+ entries.', best: 'Traders who think best with pen and paper and are willing to digitise monthly.' },
  { type: 'Dedicated Platform', pros: 'Purpose-built features: auto-import trades, analytics dashboards, tagging. Examples: TraderSync, Edgewonk, Tradervue.', cons: 'Monthly subscription cost. Learning curve. May not capture YOUR specific fields.', best: 'Traders who want automated analytics and are willing to pay for the tooling.' },
];

const myths = [
  { myth: '&ldquo;I&apos;ll remember my trades without writing them down&rdquo;', reality: 'You won&apos;t. After 3 days, you&apos;ll remember the P&amp;L but forget the emotion, the rationale, and the process grade. After a month, you&apos;ll confuse trades with each other. Memory is unreliable &mdash; that&apos;s why journals exist.' },
  { myth: '&ldquo;Journaling takes too long&rdquo;', reality: 'A proper journal entry takes 3&ndash;5 minutes. If you can spend 3 hours watching a chart, you can spend 5 minutes recording what happened. The ROI on those 5 minutes is the highest of any trading activity.' },
  { myth: '&ldquo;I only need to journal losing trades&rdquo;', reality: 'Winning trades are EQUALLY important. You need to know what RIGHT looks like so you can repeat it. Plus, bad-process wins (C- quadrant) need to be flagged just like losses.' },
  { myth: '&ldquo;My broker statement is my journal&rdquo;', reality: 'Your broker statement shows entry, exit, and P&amp;L. It shows NOTHING about your emotional state, your process compliance, your rationale, or your decision quality. That&apos;s like saying a hospital bill is a medical diagnosis.' },
];

const mistakes = [
  { wrong: 'Journaling P&amp;L first (or only)', right: 'Put outcome (R) as the LAST field. Lead with process grade, emotion, and setup type. This trains your brain to evaluate process before profit.', emoji: '&#128176;' },
  { wrong: 'Writing entries days later from memory', right: 'Journal within 30 minutes of your session. Emotional memory degrades within hours. A journal written the next morning is historical fiction.', emoji: '&#128336;' },
  { wrong: 'Never reviewing past entries', right: 'Schedule a weekly 30-minute review every Sunday. Read the last 5&ndash;10 entries. Look for patterns. This is where the journal pays for itself.', emoji: '&#128218;' },
  { wrong: 'Making entries too long and detailed', right: 'Each field should be 1&ndash;2 sentences max. Emotion: one word. Process grade: one letter. If it takes 20 minutes, you&apos;ll stop doing it by week 2.', emoji: '&#128214;' },
];

const gameScenarios = [
  { scenario: 'You just closed a +2.5R trade. You feel great. Your journal template has 12 fields to fill in. You think: &ldquo;It was a win, I&apos;ll just note the P&amp;L and move on.&rdquo; What should you do?', options: ['Just log +2.5R and the pair &mdash; it was a straightforward win', 'Fill in ALL 12 fields. Winning trades need full documentation because you need to know exactly what RIGHT looks like to repeat it.', 'Skip the journal entirely &mdash; wins don&apos;t need analysis'], correct: 1, explain: 'Winning trades are your playbook. You need to know WHY you won &mdash; was it process? Was it luck? Was it a C- win? Only the full journal entry reveals this.' },
  { scenario: 'You review your last 30 journal entries and notice: when you write &ldquo;excited&rdquo; in the pre-entry emotion field, your win rate is 28%. When you write &ldquo;calm&rdquo;, it&apos;s 54%. What do you do with this data?', options: ['Ignore it &mdash; emotions are too subjective to be useful data', 'Add a new rule: if I feel excited before a trade, I wait 5 minutes and re-evaluate the setup before entering', 'Stop recording emotions &mdash; it&apos;s making me overthink'], correct: 1, explain: 'This is the journal working as your psychologist. It found a pattern you couldn&apos;t see in real-time. Excitement = FOMO or overconfidence signal. The 5-minute pause interrupts the emotional circuit.' },
  { scenario: 'It&apos;s 11 PM. You traded at 9 AM. You haven&apos;t journaled yet. You&apos;re tired. What do you do?', options: ['Journal now &mdash; better late than never, and you can still remember most of it', 'Skip today &mdash; you&apos;ll journal tomorrow&apos;s trades properly instead', 'Write a brief entry noting that you failed to journal on time, and set an alarm for tomorrow&apos;s post-session window'], correct: 2, explain: 'Option A is okay but degraded quality. Option C is best: acknowledge the process failure, capture what you can, and fix the system (alarm) so it doesn&apos;t happen again. Skipping entirely (B) breaks the habit.' },
  { scenario: 'Your journal shows that your FVG trades have a 35% win rate over 40 trades, while your order block trades have a 53% win rate over 60 trades. Both use 1:2 R:R. What action do you take?', options: ['Stop trading FVGs entirely and focus exclusively on order blocks', 'Reduce FVG trade size to 0.5R while maintaining OB at 1R, and investigate WHY FVGs are underperforming', 'Keep trading both the same way &mdash; 40 trades isn&apos;t enough data'], correct: 1, explain: 'Reducing size (not eliminating) preserves the learning while protecting capital. Investigating WHY matters: are you misidentifying FVGs? Taking them in the wrong context? 40 trades IS enough to flag a concern, but reducing rather than eliminating lets you gather more data safely.' },
  { scenario: 'You&apos;ve journaled consistently for 8 weeks. A friend asks to see your journal. You notice your entries have become shorter and more formulaic &mdash; &ldquo;calm, A+, OB, +1R&rdquo; for almost every trade. Is this a problem?', options: ['No &mdash; efficient entries mean you&apos;ve optimised the process', 'Yes &mdash; formulaic entries suggest you&apos;re on autopilot. You&apos;re recording habits, not insights. Dig deeper on at least 2&ndash;3 entries per week.', 'It&apos;s fine as long as the P&amp;L is positive'], correct: 1, explain: 'Autopilot journaling is a common trap. If every entry looks identical, you&apos;re not reflecting &mdash; you&apos;re just ticking boxes. Force yourself to write one UNIQUE observation per session, even on routine days.' },
];

const quizQuestions = [
  { q: 'What is the MOST important field in a trading journal?', opts: ['Outcome (P&amp;L in R)', 'Process grade (A+ to F)', 'Setup type', 'Entry time'], a: 1, explain: 'Process grade is the most important field because it separates skill from luck. A +2R C- trade and a -1R A+ trade look opposite in P&amp;L but the A+ loss is the better trade.' },
  { q: 'Why should &ldquo;Outcome (R)&rdquo; be the LAST field in your journal template?', opts: ['Because it&apos;s the least accurate number', 'Because putting it first trains your brain to evaluate P&amp;L before process &mdash; the opposite of what professionals do', 'Because you might not know the exact R yet', 'Because it takes the longest to calculate'], a: 1, explain: 'Leading with P&amp;L anchors your entire evaluation around money. Leading with process grade, emotion, and setup type trains you to evaluate QUALITY first. The P&amp;L is just the scoreboard &mdash; the journal reveals the game.' },
  { q: 'How soon after your session should you complete your journal?', opts: ['Within 24 hours', 'Within 30 minutes', 'The following morning before trading', 'Whenever you have free time'], a: 1, explain: 'Within 30 minutes. Emotional memory &mdash; the most valuable data &mdash; degrades rapidly. A journal written hours later is a reconstruction, not a recording.' },
  { q: 'Your journal shows you lose 73% of trades where you felt &ldquo;excited&rdquo; before entry. This means:', opts: ['You should stop recording emotions', 'Excitement is a red flag that correlates with FOMO or overconfidence &mdash; add a pause rule', 'You need a better strategy', 'Emotions are unreliable data points'], a: 1, explain: 'This is the journal working as a psychologist. It identified a pattern invisible in real-time. The correct response is a process rule: excitement = wait 5 minutes and re-evaluate.' },
  { q: 'How often should you review past journal entries for patterns?', opts: ['After every losing trade', 'Weekly (30-minute Sunday review)', 'Monthly at minimum', 'Only when you&apos;re in a drawdown'], a: 1, explain: 'A weekly 30-minute review is the sweet spot. Frequent enough to catch patterns early, but not so frequent that you overfit to noise. Sunday before the new trading week is ideal.' },
  { q: 'What&apos;s wrong with using your broker statement as your journal?', opts: ['Broker statements are often inaccurate', 'They show entry/exit/P&amp;L but nothing about emotion, process, rationale, or decision quality', 'They don&apos;t include screenshots', 'Nothing &mdash; broker statements are sufficient'], a: 1, explain: 'A broker statement is a transaction log, not a journal. It tells you WHAT happened but nothing about WHY. The WHY is where all learning lives.' },
  { q: 'Your journal entries have become formulaic (&ldquo;calm, A+, OB, +1R&rdquo; every trade). This is:', opts: ['Efficient and optimised', 'A warning sign &mdash; you&apos;re on autopilot and recording habits instead of insights', 'Fine as long as you&apos;re profitable', 'Normal after 8+ weeks of journaling'], a: 1, explain: 'Formulaic entries mean you&apos;ve stopped reflecting. The journal&apos;s value comes from unique observations, not repeated templates. Force yourself to write one unique insight per session.' },
  { q: 'Which journal approach is BEST for quantitative analysis (sorting, filtering, calculating win rates)?', opts: ['Physical notebook', 'Spreadsheet (Google Sheets / Excel)', 'Notion', 'Social media posts'], a: 1, explain: 'Spreadsheets allow you to sort by setup type, filter by emotion, calculate win rates per session, and run pivot tables. They&apos;re the best tool for turning journal data into actionable statistics.' },
];

export default function TradingJournalPage() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h); }, []);

  const [openPattern, setOpenPattern] = useState<string | null>(null);
  const [openType, setOpenType] = useState<string | null>(null);
  const [openMyth, setOpenMyth] = useState<string | null>(null);
  const [openMistake, setOpenMistake] = useState<string | null>(null);

  // Interactive journal entry builder
  const [entryValues, setEntryValues] = useState<Record<string, string>>({});
  const filledCount = Object.values(entryValues).filter(v => v.trim().length > 0).length;

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
          <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 4 &middot; Lesson 10</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight"><span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>The Trading Journal</span></h1>
          <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">Your psychologist, your pattern-finder, your accountability partner. Beyond recording trades &mdash; journal emotions, decisions, and patterns.</p>
        </motion.div>
      </section>

      {/* S00 — WHY THIS MATTERS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-lg font-bold text-white mb-3">&#128218; Imagine going to a doctor who doesn&apos;t take notes. No medical history. No test results. No records of what worked and what didn&apos;t. Every visit starts from scratch.</p>
            <p className="text-gray-400 leading-relaxed mb-4">You&apos;d switch doctors immediately. Yet most traders do <strong className="text-amber-400">exactly this to themselves</strong>. They trade every day with no record of what happened yesterday, no data on their patterns, no evidence of what works and what doesn&apos;t.</p>
            <p className="text-gray-400 leading-relaxed mb-4">A trading journal is not a diary. It&apos;s not a spreadsheet of P&amp;L. It&apos;s a <strong className="text-white">diagnostic tool</strong> that reveals patterns you cannot see in real-time. It shows you WHY you&apos;re losing on Fridays, WHY your FOMO trades lose 73% of the time, WHY your best month was followed by your worst.</p>
            <p className="text-gray-400 leading-relaxed">The journal is your psychologist, your analyst, and your accountability partner &mdash; all for the cost of <strong className="text-green-400">5 minutes per trade</strong>.</p>
          </div>
          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">A trader journaled consistently for 12 weeks. At the 8-week review, he discovered that trades taken when he journaled &ldquo;excited&rdquo; as his pre-entry emotion had a 28% win rate, while trades taken when he journaled &ldquo;calm&rdquo; had a 54% win rate. Same strategy, same pairs, same timeframe. He added one rule: &ldquo;If I feel excited, I wait 5 minutes.&rdquo; His next month was his best ever.</p>
          </div>
        </motion.div>
      </section>

      {/* S01 — THE MIRROR */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Mirror</p>
          <h2 className="text-2xl font-extrabold mb-4">P&amp;L Shows WHAT. The Journal Shows WHY.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Your broker statement tells you the score. Your journal tells you the game. Without the game data, the score is meaningless.</p>
          <div className="mb-6 rounded-2xl overflow-hidden border border-white/5">
            <MirrorAnimation />
          </div>
        </motion.div>
      </section>

      {/* S02 — THE ICEBERG */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Data Iceberg</p>
          <h2 className="text-2xl font-extrabold mb-4">90% of the Value Is Below the Surface</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Most traders only record the visible 10% &mdash; the P&amp;L. Professional traders record the invisible 90% &mdash; emotions, process, rationale, and patterns.</p>
          <div className="rounded-2xl overflow-hidden border border-white/5">
            <IcebergJournalAnimation />
          </div>
        </motion.div>
      </section>

      {/* S03 — THE 12 FIELDS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The Complete Journal Template</p>
          <h2 className="text-2xl font-extrabold mb-4">12 Fields, 5 Minutes Per Trade</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Not all fields are equal. The <strong className="text-amber-400">psychology fields</strong> are where the real value lives. Notice: outcome is LAST.</p>
          <div className="space-y-2">
            {journalFields.map((jf, i) => (
              <div key={i} className={`p-3 rounded-xl glass-card border-l-2 ${jf.category === 'psychology' ? 'border-l-amber-500/40' : jf.category === 'technical' ? 'border-l-blue-500/30' : jf.category === 'review' ? 'border-l-green-500/30' : 'border-l-gray-500/20'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-white" dangerouslySetInnerHTML={{ __html: `${i + 1}. ${jf.field}` }} />
                    <p className="text-xs text-gray-500 leading-relaxed mt-1" dangerouslySetInnerHTML={{ __html: jf.desc }} />
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ml-2 ${jf.category === 'psychology' ? 'text-amber-400 bg-amber-500/10' : jf.category === 'technical' ? 'text-blue-400 bg-blue-500/10' : jf.category === 'review' ? 'text-green-400 bg-green-500/10' : 'text-gray-400 bg-gray-500/10'}`}>{jf.category}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S04 — INTERACTIVE JOURNAL ENTRY */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Practice Entry</p>
          <h2 className="text-2xl font-extrabold mb-4">Build a Journal Entry Right Now</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Think of your most recent trade (or invent one). Fill in each field. This is what 5 minutes of journaling feels like.</p>
          <div className="p-5 rounded-2xl glass-card space-y-3">
            {journalFields.map((jf, i) => (
              <div key={i}>
                <label className="text-xs font-bold text-gray-400 block mb-1" dangerouslySetInnerHTML={{ __html: jf.field }} />
                <input type="text" placeholder={jf.category === 'psychology' ? 'One word or short phrase...' : 'Brief entry...'} value={entryValues[jf.field] || ''} onChange={e => setEntryValues(prev => ({ ...prev, [jf.field]: e.target.value }))} className="w-full p-2.5 rounded-lg bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/30 transition" />
              </div>
            ))}
            <div className="pt-3 border-t border-white/5 text-center">
              <p className={`text-sm font-bold ${filledCount === journalFields.length ? 'text-green-400' : filledCount >= 8 ? 'text-amber-400' : 'text-gray-500'}`}>{filledCount}/{journalFields.length} fields completed</p>
              <p className="text-xs text-gray-500 mt-1">{filledCount === journalFields.length ? 'Complete entry. This is what professional journaling looks like.' : filledCount >= 8 ? 'Good start. Try to fill ALL fields consistently.' : 'Keep going. The psychology fields are the most valuable.'}</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S05 — PATTERNS THE JOURNAL REVEALS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Hidden Patterns</p>
          <h2 className="text-2xl font-extrabold mb-4">What 50+ Entries Reveal</h2>
          <p className="text-gray-400 leading-relaxed mb-6">You can&apos;t see these patterns in real-time. They only emerge from data. This is why the journal exists.</p>
          <div className="space-y-3">
            {journalPatterns.map(p => (
              <div key={p.pattern}>
                <button onClick={() => setOpenPattern(openPattern === p.pattern ? null : p.pattern)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <div className="flex items-center gap-3"><span dangerouslySetInnerHTML={{ __html: p.emoji }} /><p className="text-sm font-bold text-white">{p.pattern}</p></div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openPattern === p.pattern ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openPattern === p.pattern && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden"><div className="p-4 mx-2 mt-1 rounded-xl bg-white/[0.02] border border-white/5 space-y-2"><p className="text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: `<strong class="text-amber-400">Example:</strong> ${p.example}` }} /><p className="text-sm text-green-400" dangerouslySetInnerHTML={{ __html: `<strong>Action:</strong> ${p.action}` }} /></div></motion.div>)}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S06 — JOURNAL TYPES */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Choosing Your Format</p>
          <h2 className="text-2xl font-extrabold mb-4">Four Journal Types</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The best journal is the one you&apos;ll actually use. Pick the format that matches how your brain works.</p>
          <div className="space-y-3">
            {journalTypes.map(t => (
              <div key={t.type}>
                <button onClick={() => setOpenType(openType === t.type ? null : t.type)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <p className="text-sm font-bold text-white">{t.type}</p>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openType === t.type ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openType === t.type && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden"><div className="p-4 mx-2 mt-1 rounded-xl bg-white/[0.02] border border-white/5 space-y-2"><p className="text-xs text-green-400"><strong>Pros:</strong> <span dangerouslySetInnerHTML={{ __html: t.pros }} /></p><p className="text-xs text-red-400"><strong>Cons:</strong> <span dangerouslySetInnerHTML={{ __html: t.cons }} /></p><p className="text-xs text-amber-400"><strong>Best for:</strong> <span dangerouslySetInnerHTML={{ __html: t.best }} /></p></div></motion.div>)}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S07 — MYTHS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Myths Busted</p>
          <h2 className="text-2xl font-extrabold mb-4">Journal Myths That Keep You Blind</h2>
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
          <h2 className="text-2xl font-extrabold mb-6">Journal Decisions &mdash; 5 Scenarios</h2>
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
            <p className="text-sm text-gray-400">{gameScore === 5 ? 'Perfect. Your journal is your competitive edge.' : gameScore >= 3 ? 'Good data instincts. Review the emotion-pattern section.' : 'The journal is your psychologist. Re-read the 12 fields and pattern discovery sections.'}</p>
          </motion.div>
          )}
        </motion.div>
      </section>

      {/* S10 — QUIZ */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Knowledge Check</p>
          <h2 className="text-2xl font-extrabold mb-6">The Trading Journal Quiz</h2>
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
        {quizDone && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 text-center p-8 glass-card rounded-2xl"><p className={`text-5xl font-extrabold mb-2 ${score >= 66 ? 'text-amber-400' : 'text-red-400'}`}>{score}%</p><p className="text-sm text-gray-400">{score === 100 ? '&#128218; Perfect. The journal sees what you cannot.' : score >= 66 ? 'Strong journal awareness. Now commit to 5 minutes per trade.' : 'Review the 12 fields and the pattern discovery section.'}</p></motion.div>)}
      </section>

      {/* Certificate */}
      <section className="px-5 py-16 text-center">
        {!certUnlocked ? (
          <div className="max-w-md mx-auto p-8 glass rounded-2xl"><p className="text-4xl mb-3 opacity-30">&#128274;</p><p className="text-sm text-gray-500">Score 66%+ to unlock your <strong className="text-amber-400">Pro Certificate</strong></p></div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, type: 'spring' }}
            className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(59,130,246,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
            <div className="absolute inset-[1px] rounded-3xl border border-amber-500/10" />
            <div className="relative z-10">
              <div className="w-[80px] h-[80px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 flex items-center justify-center text-4xl shadow-lg shadow-amber-500/20">&#128218;</div>
              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest mb-2">Pro Certificate</p>
              <h3 className="text-xl font-extrabold mb-1">Certificate of Mastery</h3>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">Has mastered<br /><strong className="text-white">Level 4.10: The Trading Journal</strong><br />at ATLAS Academy by Interakktive</p>
              <p className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent font-bold text-lg mb-1" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Pattern Detective &mdash;</p>
              <p className="font-mono text-[11px] text-gray-500 mb-4">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L4.10-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
            </div>
          </motion.div>
        )}
      </section>

      <section className="text-center px-5 pt-10 pb-24">
        <p className="text-xs tracking-widest uppercase text-gray-600 mb-4">Up Next</p>
        <h2 className="text-xl font-bold mb-6">Lesson 4.11 &mdash; Drawdown Psychology</h2>
        <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">
          Continue <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
