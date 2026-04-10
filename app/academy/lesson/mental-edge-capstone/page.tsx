// app/academy/lesson/mental-edge-capstone/page.tsx
// ATLAS Academy — Lesson 4.14: Building Your Mental Edge — Level 4 Capstone [PRO]
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
// CONSTITUTION ANIMATION — Document building up layer by layer
// ============================================================
function ConstitutionAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);
    const midX = w / 2;
    const docW = w * 0.5;
    const docH = h * 0.8;
    const docX = midX - docW / 2;
    const docY = (h - docH) / 2;

    // Document background
    ctx.fillStyle = 'rgba(245,158,11,0.03)';
    ctx.strokeStyle = 'rgba(245,158,11,0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(docX, docY, docW, docH, 8);
    ctx.fill();
    ctx.stroke();

    // Title
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(245,158,11,0.6)';
    ctx.fillText('MY PSYCHOLOGICAL', midX, docY + 22);
    ctx.fillText('CONSTITUTION', midX, docY + 35);

    // Lines building up
    const articles = [
      { label: 'Art. 1 — Identity', color: '#3b82f6' },
      { label: 'Art. 2 — Rules', color: '#22c55e' },
      { label: 'Art. 3 — Circuit Breakers', color: '#ef4444' },
      { label: 'Art. 4 — Routine', color: '#eab308' },
      { label: 'Art. 5 — Emotions Protocol', color: '#a855f7' },
      { label: 'Art. 6 — Recovery Plan', color: '#06b6d4' },
      { label: 'Art. 7 — Non-Negotiables', color: '#f97316' },
    ];

    const lineH = (docH - 60) / articles.length;
    articles.forEach((art, i) => {
      const delay = i * 25;
      const progress = Math.min(Math.max((f - delay) / 40, 0), 1);
      const y = docY + 50 + i * lineH;
      const r = parseInt(art.color.slice(1, 3), 16);
      const g = parseInt(art.color.slice(3, 5), 16);
      const b = parseInt(art.color.slice(5, 7), 16);

      // Line background
      ctx.fillStyle = `rgba(${r},${g},${b},${0.04 * progress})`;
      ctx.beginPath();
      ctx.roundRect(docX + 12, y, docW - 24, lineH - 4, 4);
      ctx.fill();

      // Label
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'left';
      ctx.fillStyle = `rgba(${r},${g},${b},${0.6 * progress})`;
      ctx.fillText(art.label, docX + 18, y + lineH / 2 + 3);

      // Check mark
      if (progress >= 1) {
        ctx.font = 'bold 10px system-ui';
        ctx.textAlign = 'right';
        ctx.fillStyle = `rgba(${r},${g},${b},0.5)`;
        ctx.fillText('✓', docX + docW - 18, y + lineH / 2 + 3);
      }
    });

    // Glow seal at bottom
    const allDone = f > articles.length * 25 + 40;
    if (allDone) {
      const pulse = Math.sin(f * 0.04) * 0.15 + 0.85;
      const sealY = docY + docH - 18;
      ctx.font = 'bold 7px system-ui';
      ctx.textAlign = 'center';
      ctx.fillStyle = `rgba(245,158,11,${0.4 * pulse})`;
      ctx.fillText('SIGNED — YOUR NAME — YOUR COMMITMENT', midX, sealY);
    }
  }, []);
  return <AnimScene drawFn={draw} height={300} />;
}

// ============================================================
// SHIELD ANIMATION — All L4 concepts combining into mental shield
// ============================================================
function ShieldAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);
    const midX = w / 2;
    const midY = h / 2;

    // Shield shape (pointed bottom)
    const sw = w * 0.28;
    const sh = h * 0.6;
    const st = midY - sh * 0.4;
    const pulse = Math.sin(f * 0.025) * 0.12 + 0.88;

    ctx.fillStyle = `rgba(245,158,11,${0.03 * pulse})`;
    ctx.strokeStyle = `rgba(245,158,11,${0.15 * pulse})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(midX - sw, st);
    ctx.lineTo(midX + sw, st);
    ctx.lineTo(midX + sw, st + sh * 0.55);
    ctx.lineTo(midX, st + sh);
    ctx.lineTo(midX - sw, st + sh * 0.55);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Layers of the shield (each a Level 4 concept)
    const layers = [
      { label: 'IDENTITY', color: '#3b82f6', y: 0.08 },
      { label: 'FEAR & GREED', color: '#ef4444', y: 0.2 },
      { label: 'PROCESS', color: '#22c55e', y: 0.32 },
      { label: 'PATIENCE', color: '#eab308', y: 0.44 },
      { label: 'ROUTINE', color: '#06b6d4', y: 0.56 },
      { label: 'JOURNAL', color: '#a855f7', y: 0.68 },
      { label: 'PRESSURE', color: '#f97316', y: 0.8 },
    ];

    layers.forEach((l, i) => {
      const ly = st + sh * l.y;
      const animDelay = i * 15;
      const alpha = Math.min(Math.max((f - animDelay) / 30, 0), 1);
      const r = parseInt(l.color.slice(1, 3), 16);
      const g = parseInt(l.color.slice(3, 5), 16);
      const b = parseInt(l.color.slice(5, 7), 16);

      ctx.font = 'bold 7px system-ui';
      ctx.textAlign = 'center';
      ctx.fillStyle = `rgba(${r},${g},${b},${0.5 * alpha * pulse})`;
      ctx.fillText(l.label, midX, ly + 5);
    });

    // Orbiting concepts (outside the shield)
    const orbitLabels = ['4.1', '4.2', '4.3', '4.4', '4.5', '4.6', '4.7', '4.8', '4.9', '4.10', '4.11', '4.12', '4.13'];
    const orbitR = Math.min(w, h) * 0.42;
    orbitLabels.forEach((ol, i) => {
      const angle = (i / orbitLabels.length) * Math.PI * 2 + f * 0.005;
      const ox = midX + Math.cos(angle) * orbitR;
      const oy = midY + Math.sin(angle) * orbitR * 0.5;
      const alpha = 0.15 + Math.sin(f * 0.03 + i) * 0.08;
      ctx.font = 'bold 7px system-ui';
      ctx.textAlign = 'center';
      ctx.fillStyle = `rgba(245,158,11,${alpha})`;
      ctx.fillText(ol, ox, oy);
    });

    // Centre label
    ctx.font = 'bold 9px system-ui';
    ctx.fillStyle = `rgba(245,158,11,${0.5 * pulse})`;
    ctx.fillText('YOUR MENTAL EDGE', midX, st + sh + 18);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// DATA
// ============================================================
const levelSummary = [
  { lesson: '4.1 — The Trader&apos;s Mind', key: 'Trading is 90% psychology. Know your trader type.', rule: 'I know my psychological profile and its weaknesses.' },
  { lesson: '4.2 — Fear &amp; Greed', key: 'Exit too early (fear) or hold too long (greed). Both destroy R:R.', rule: 'I let my plan manage entries and exits, not my emotions.' },
  { lesson: '4.3 — FOMO', key: 'The trade you missed was never yours. Chasing has negative expectancy.', rule: 'I never chase. I wait for MY setup at MY level.' },
  { lesson: '4.4 — Revenge Trading', key: '1% loss becomes 15%. The spiral has no natural stopping point.', rule: 'After 2 losses: 15-minute break. After daily limit: I am DONE.' },
  { lesson: '4.5 — Loss Acceptance', key: 'Good-process losses are the cost of business. 45% WR at 1:2.5 R:R is profitable.', rule: 'I accept every loss that followed my plan. I change nothing.' },
  { lesson: '4.6 — Confidence vs Overconfidence', key: 'Your most profitable period is your most dangerous period.', rule: 'After 3+ wins: re-read rules. After best day: journal before next session.' },
  { lesson: '4.7 — Process Over Outcome', key: 'Grade the trade, not the P&amp;L. C- wins are more dangerous than A losses.', rule: 'I process-grade every trade. Bad-process wins are logged as failures.' },
  { lesson: '4.8 — Patience', key: '90% waiting, 10% trading. Fewer trades = better results.', rule: 'I set alerts and walk away. Boredom is not a trading signal.' },
  { lesson: '4.9 — Trading Routine', key: 'Pre-session, in-session, post-session. Structure kills emotion.', rule: 'I follow my 3-phase routine every session without exception.' },
  { lesson: '4.10 — Trading Journal', key: 'P&amp;L tells you WHAT. The journal tells you WHY.', rule: 'I journal within 30 minutes. All 12 fields. Every trade.' },
  { lesson: '4.11 — Drawdown Psychology', key: 'Reduce size, don&apos;t increase it. Swim sideways, not against the current.', rule: 'At -5%: 0.75R. At -8%: 0.5R. At -10%: 0.25R or PAUSE.' },
  { lesson: '4.12 — The 30-Day Reset', key: 'When the foundation is cracked, rebuild from scratch.', rule: 'If I blow 2 accounts or can&apos;t follow rules for 5+ days: full reset.' },
  { lesson: '4.13 — Performance Under Pressure', key: 'The amygdala fires in 12ms. The 10-second rule gives rationality time.', rule: 'Hijack signs → hands off → breathe → &ldquo;What does my plan say?&rdquo;' },
];

const constitutionArticles = [
  { article: 'Article 1 — My Identity', prompt: 'I am a ______ trader. My edge comes from ______. My biggest psychological weakness is ______.', example: 'I am a patient, process-driven SMC trader. My edge comes from order block entries in London kill zone with 1:2.5 R:R. My biggest weakness is revenge trading after losses.' },
  { article: 'Article 2 — My Non-Negotiable Rules', prompt: 'List your top 5 rules that can NEVER be broken, regardless of how you feel.', example: '1. Max 3 trades per day. 2. 1R risk per trade, no exceptions. 3. A+ setups only (full checklist). 4. Kill zone entries only. 5. 15-minute break after any loss.' },
  { article: 'Article 3 — My Circuit Breakers', prompt: 'Define the exact conditions that force you to stop trading.', example: '2 consecutive losses → 15 min break. Daily loss limit (-2R) → done for the day. 3 losing days in a row → reduce to 0.5R. -8% drawdown → reduce to 0.5R. -10% → pause for 1 week.' },
  { article: 'Article 4 — My Routine', prompt: 'Write your pre-session, in-session, and post-session routine.', example: 'PRE (15 min): Calendar → Levels → Bias → Alerts → Rules card. IN: Kill zones only, checklist before entry, alerts between setups. POST (15 min): Journal → Process score → One improvement → Close platform.' },
  { article: 'Article 5 — My Emotional Protocol', prompt: 'How will you handle fear, greed, FOMO, and revenge impulses?', example: 'Fear/Greed: Follow the plan, not the feeling. FOMO: If I have to chase, it&apos;s not my trade. Revenge: Circuit breaker activates automatically. Overconfidence: Re-read rules after 3+ wins.' },
  { article: 'Article 6 — My Recovery Plan', prompt: 'What will you do when (not if) you face a significant drawdown?', example: 'At -5%: reduce size, review last 20 trades. At -8%: 0.5R, daily journal mandatory. At -10%: 1-week pause, backtest, demo. Return at 0.25R with graduated increase.' },
  { article: 'Article 7 — My Commitment', prompt: 'A personal statement of why you trade and what you&apos;re committing to.', example: 'I trade to build long-term financial freedom. I commit to following this constitution every session. When I break a rule, I journal it and add a prevention measure. This document is my edge.' },
];

const mentalEdgeChecklist = [
  'I know my trader personality type and its vulnerabilities',
  'I have a written trading plan with specific entry/exit criteria',
  'I have circuit breakers for daily losses and consecutive losses',
  'I follow a 3-phase routine (pre, in, post) every session',
  'I journal every trade within 30 minutes using 12+ fields',
  'I process-grade every trade (A+ to F) independently from P&amp;L',
  'I have a drawdown size-reduction ladder written down',
  'I know the 10-second rule and have practised box breathing',
  'I have a rules card next to my monitor',
  'I review my journal weekly for patterns',
  'I have a pre-commitment statement I read before each session',
  'I know when to trigger a 30-day reset',
];

const myths = [
  { myth: '&ldquo;Psychology is soft stuff &mdash; real traders focus on strategy&rdquo;', reality: 'Strategy is the 10% above the waterline. Psychology is the 90% below. A trader with a C+ strategy and A+ psychology will outperform a trader with an A+ strategy and C+ psychology every single time. The prop firm data proves it.' },
  { myth: '&ldquo;I&apos;ve read Level 4 so now my psychology is fixed&rdquo;', reality: 'Reading is awareness. Practice is change. You need to IMPLEMENT: the routine, the journal, the circuit breakers, the 10-second rule. Knowledge without execution is entertainment, not education.' },
  { myth: '&ldquo;Psychological discipline is a personality trait &mdash; you either have it or you don&apos;t&rdquo;', reality: 'Discipline is a SKILL, not a trait. It&apos;s built through systems (routine, checklist, circuit breakers) not willpower. Every tool in Level 4 is a system that makes discipline automatic.' },
  { myth: '&ldquo;Once I master psychology, I&apos;ll never have emotional trades again&rdquo;', reality: 'You will. The difference: you&apos;ll catch them earlier, recover faster, and they won&apos;t destroy your account. Mastery isn&apos;t the absence of emotion &mdash; it&apos;s the management of it.' },
];

const gameScenarios = [
  { scenario: 'It&apos;s Monday morning. You sit down to trade. What are the FIRST three things you do before looking at any chart?', options: ['Open the chart, check what happened overnight, look for setups', 'Check economic calendar → Read my rules card aloud → Mark key levels and set alerts. THEN I look for setups.', 'Check Twitter/X for what other traders are watching'], correct: 1, explain: 'The pre-session routine happens BEFORE the chart. Calendar first (is NFP today?), rules card second (prime the rational brain), levels and alerts third. Looking at charts before prep is how emotional trading starts.' },
  { scenario: 'You take an A+ setup. Perfect entry, correct sizing, SL in place. The trade hits your stop for -1R. You feel frustrated. Your process grade for this trade is:', options: ['F — I lost money', 'C — Close to right but the result proves something was wrong', 'A — Perfect process. The outcome is irrelevant. This is the cost of doing business and I change nothing.'], correct: 2, explain: 'This is the Level 4 mindset in one answer. Good process + loss = A-grade trade. The frustration is normal and human. The RESPONSE (change nothing) is professional. This is Lessons 4.5 and 4.7 working together.' },
  { scenario: 'You&apos;re 3 weeks into a prop firm evaluation. Process compliance: 92%. Win rate: 43%. R:R: 1:2.3. P&amp;L: +5.8%. But your friend says your 43% win rate is &ldquo;terrible.&rdquo; How do you respond?', options: ['He&apos;s right — I need to improve my win rate before continuing', 'My expectancy is positive: (0.43 × 2.3) - (0.57 × 1) = +0.42R per trade. My process compliance is 92%. The system is working. Win rate is meaningless without R:R context.', 'I should switch to a higher win rate strategy for the evaluation'], correct: 1, explain: 'This combines Lessons 4.5 (loss acceptance), 4.7 (process over outcome), and basic expectancy maths. +0.42R per trade at 92% process compliance is EXCELLENT. Your friend is measuring the wrong number.' },
  { scenario: 'Final scenario. You&apos;ve completed all 14 lessons of Level 4. You understand every concept. But you haven&apos;t written your Psychological Constitution yet. What is the status of your mental edge?', options: ['Complete — I know everything I need to know', 'Incomplete — knowledge without a written constitution is awareness without commitment. The constitution turns concepts into non-negotiable rules I follow daily.', 'Mostly complete — I&apos;ll write the constitution when I have time'], correct: 1, explain: 'This is the entire point of the capstone. Knowledge lives in your head. The constitution lives on paper next to your monitor. Under pressure, you won&apos;t remember Lesson 4.7. But you WILL read the card that says &ldquo;Grade the trade, not the P&L.&rdquo;' },
  { scenario: 'Six months from now, you notice you&apos;re skipping pre-session prep, overtrading on Fridays, and your journal entries are formulaic. Your process compliance has dropped from 92% to 71%. What do you do?', options: ['Keep trading — 71% is still passing', 'Recognise the drift. Mini-reset: 1 week off, full journal review, 3 days demo, return at reduced size. Re-read and re-sign my Psychological Constitution. Catch it before it becomes a crisis.', 'Start a full 30-day reset immediately'], correct: 1, explain: 'You caught it early. A mini-reset (Lesson 4.12) addresses the drift before it spirals. Re-signing the constitution recommits you to the standards. A full 30-day reset isn&apos;t needed because you caught it at 71%, not 40%. This is the mental edge working.' },
];

const quizQuestions = [
  { q: 'What is the Psychological Constitution?', opts: ['A personality test', 'A written document containing your identity, rules, circuit breakers, routine, emotional protocols, recovery plan, and personal commitment — kept next to your monitor', 'A trading strategy document', 'A certificate from Level 4'], a: 1, explain: 'The Psychological Constitution is the tangible output of Level 4. It turns 14 lessons of knowledge into a single, actionable document you reference daily. It&apos;s your trading psychology in writing.' },
  { q: 'Which is MORE important: a great strategy with poor psychology, or an average strategy with great psychology?', opts: ['Great strategy, poor psychology', 'Average strategy, great psychology', 'They are equally important', 'Neither — only market conditions matter'], a: 1, explain: 'An average strategy with great psychology produces consistent, survivable results. A great strategy with poor psychology produces erratic, eventually fatal results. Psychology is the multiplier that makes or breaks any strategy.' },
  { q: 'What should your Psychological Constitution&apos;s Article 3 (Circuit Breakers) define?', opts: ['Your favourite trading setups', 'The exact conditions that force you to stop trading: consecutive loss limits, daily loss limits, drawdown thresholds, and mandatory break durations', 'Your profit targets', 'Your preferred trading hours'], a: 1, explain: 'Circuit breakers are pre-defined, non-negotiable rules that override your emotional desire to continue trading. They must be specific (2 losses = 15 min break) not vague (&ldquo;take a break if needed&rdquo;).' },
  { q: 'After completing Level 4, what is the single most important daily habit?', opts: ['Checking Twitter/X for trade ideas', 'Following your 3-phase routine and journaling every trade with process grades', 'Backtesting new strategies', 'Meditating for 30 minutes'], a: 1, explain: 'The routine + journal is the compound interest of trading psychology. Every other habit is secondary. Consistent routine execution and honest journaling produce more improvement than any other single activity.' },
  { q: 'How often should you re-read your Psychological Constitution?', opts: ['Once, when you write it', 'Weekly during your Sunday review, and any time you notice psychological drift', 'Monthly', 'Only after a major loss'], a: 1, explain: 'Weekly re-reading keeps the commitment fresh. During Sunday reviews, check: am I following Article 2 (rules)? Am I using Article 3 (circuit breakers)? If drift is detected, the constitution brings you back.' },
  { q: 'You have 92% process compliance and 43% win rate with 1:2.3 R:R. Your expectancy per trade is:', opts: ['-0.42R (losing money)', '+0.42R (profitable)', '+0.92R', 'Cannot be calculated'], a: 1, explain: 'Expectancy = (0.43 × 2.3) - (0.57 × 1.0) = 0.989 - 0.57 = +0.419R per trade. Over 100 trades that&apos;s +41.9R. Win rate alone is meaningless. R:R and process compliance are what matter.' },
  { q: 'What does &ldquo;discipline is a skill, not a trait&rdquo; mean?', opts: ['Some people are naturally disciplined and others aren&apos;t', 'Discipline is built through SYSTEMS (routine, checklist, circuit breakers) that make correct behaviour automatic — anyone can build it', 'Discipline comes from willpower alone', 'You need a specific personality type to trade'], a: 1, explain: 'Discipline is not willpower. It&apos;s systems. A checklist makes correct entries automatic. A circuit breaker makes stopping automatic. A routine makes preparation automatic. Every Level 4 tool is a discipline SYSTEM.' },
  { q: 'Six months post-Level 4, your process compliance drops from 92% to 71%. The correct response is:', opts: ['Keep trading — 71% is above average', 'Mini-reset: 1 week off, journal review, demo days, return at reduced size, re-sign constitution', 'Full 30-day reset', 'Quit trading'], a: 1, explain: 'You caught the drift early (71%, not 40%). A mini-reset addresses it before crisis. Re-signing the constitution recommits to your standards. Full 30-day reset is for structural breaks, not gradual drift.' },
];

export default function MentalEdgeCapstonePage() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h); }, []);

  const [openMyth, setOpenMyth] = useState<string | null>(null);
  const [activeArticle, setActiveArticle] = useState(0);
  const [constitutionEntries, setConstitutionEntries] = useState<Record<number, string>>({});

  // Readiness checklist
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;

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
          <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 4 &middot; Capstone</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight"><span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Building Your Mental Edge</span></h1>
          <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">The Level 4 capstone. Build your Psychological Constitution &mdash; the companion to your SMC Strategy from Level 3.</p>
        </motion.div>
      </section>

      {/* S00 — WHY THIS MATTERS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-lg font-bold text-white mb-3">&#128220; In Level 3, you built your SMC Strategy &mdash; a written document defining HOW you trade. That was your technical constitution. Now you build the other half: your <strong className="text-amber-400">Psychological Constitution</strong> &mdash; a written document defining how you THINK while you trade.</p>
            <p className="text-gray-400 leading-relaxed mb-4">Over 13 lessons, you&apos;ve studied every psychological threat a trader faces: fear, greed, FOMO, revenge, overconfidence, impatience, drawdowns, and pressure. You know the theory. <strong className="text-white">Now you turn it into a single, actionable document.</strong></p>
            <p className="text-gray-400 leading-relaxed mb-4">The Psychological Constitution lives next to your monitor. You read it before every session. It contains your identity, your rules, your circuit breakers, your routine, your emotional protocols, your recovery plan, and your personal commitment.</p>
            <p className="text-gray-400 leading-relaxed"><strong className="text-green-400">Knowledge fades under pressure. Written commitments endure.</strong> That&apos;s why this document matters more than all 13 previous lessons combined.</p>
          </div>
          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">A prop firm trader completed a comprehensive trading psychology course. Three months later, his process compliance was 62% &mdash; barely better than before. A mentor suggested he write a one-page &ldquo;Trading Constitution&rdquo; and read it every morning. Within 6 weeks, process compliance rose to 91%. The knowledge was always there. The written commitment made it accessible under pressure.</p>
          </div>
        </motion.div>
      </section>

      {/* S01 — THE SHIELD */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; Your Mental Shield</p>
          <h2 className="text-2xl font-extrabold mb-4">13 Lessons, One Shield</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Every lesson in Level 4 is a layer of protection. Together, they form a shield that defends your capital and your psychology against every threat the market throws at you.</p>
          <div className="mb-6 rounded-2xl overflow-hidden border border-white/5">
            <ShieldAnimation />
          </div>
        </motion.div>
      </section>

      {/* S02 — LEVEL 4 SUMMARY */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Complete Map</p>
          <h2 className="text-2xl font-extrabold mb-4">Every Lesson, One Rule Each</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Each lesson distilled to its single most important rule. These 13 rules form the backbone of your Psychological Constitution.</p>
          <div className="space-y-2">
            {levelSummary.map((ls, i) => (
              <div key={i} className="p-3 rounded-xl glass-card">
                <p className="text-xs font-bold text-amber-400 mb-1" dangerouslySetInnerHTML={{ __html: ls.lesson }} />
                <p className="text-xs text-gray-500 mb-1" dangerouslySetInnerHTML={{ __html: ls.key }} />
                <p className="text-sm text-white font-semibold" dangerouslySetInnerHTML={{ __html: `&ldquo;${ls.rule}&rdquo;` }} />
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S03 — THE CONSTITUTION */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The Document</p>
          <h2 className="text-2xl font-extrabold mb-4">Your Psychological Constitution</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Seven articles. One page. This is the most important document you will ever write as a trader.</p>
          <div className="mb-6 rounded-2xl overflow-hidden border border-white/5">
            <ConstitutionAnimation />
          </div>
        </motion.div>
      </section>

      {/* S04 — INTERACTIVE CONSTITUTION BUILDER */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Write It Now</p>
          <h2 className="text-2xl font-extrabold mb-4">Interactive Constitution Builder</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Select each article tab. Read the prompt and example. Write YOUR version. This is personal &mdash; no two constitutions are the same.</p>
          <div className="p-5 rounded-2xl glass-card">
            <div className="flex flex-wrap gap-1.5 mb-5">
              {constitutionArticles.map((a, i) => (
                <button key={i} onClick={() => setActiveArticle(i)} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${activeArticle === i ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'glass text-gray-500 hover:text-gray-300'}`}>Art. {i + 1}</button>
              ))}
            </div>
            <div>
              <p className="text-sm font-bold text-amber-400 mb-2">{constitutionArticles[activeArticle].article}</p>
              <p className="text-xs text-gray-400 mb-3" dangerouslySetInnerHTML={{ __html: `<strong>Prompt:</strong> ${constitutionArticles[activeArticle].prompt}` }} />
              <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 mb-3">
                <p className="text-[10px] font-bold text-amber-400/60 mb-1">EXAMPLE:</p>
                <p className="text-xs text-gray-500 leading-relaxed" dangerouslySetInnerHTML={{ __html: constitutionArticles[activeArticle].example }} />
              </div>
              <textarea value={constitutionEntries[activeArticle] || ''} onChange={e => setConstitutionEntries(prev => ({ ...prev, [activeArticle]: e.target.value }))} placeholder="Write your version here..." rows={4} className="w-full p-3 rounded-lg bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/30 transition resize-none" />
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 text-center">
              <p className={`text-sm font-bold ${Object.keys(constitutionEntries).filter(k => constitutionEntries[Number(k)]?.trim()).length === 7 ? 'text-green-400' : 'text-gray-500'}`}>{Object.keys(constitutionEntries).filter(k => constitutionEntries[Number(k)]?.trim()).length}/7 articles written</p>
              <p className="text-xs text-gray-500 mt-1">{Object.keys(constitutionEntries).filter(k => constitutionEntries[Number(k)]?.trim()).length === 7 ? 'Constitution complete. Print it. Sign it. Put it next to your monitor.' : 'Complete all 7 articles to finish your constitution.'}</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S05 — READINESS CHECKLIST */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Mental Edge Readiness</p>
          <h2 className="text-2xl font-extrabold mb-4">Are You Ready?</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Tick every item you can honestly confirm. This is your Level 4 graduation checklist.</p>
          <div className="p-5 rounded-2xl glass-card space-y-2">
            {mentalEdgeChecklist.map((item, i) => (
              <button key={i} onClick={() => setCheckedItems(prev => ({ ...prev, [i]: !prev[i] }))} className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${checkedItems[i] ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'glass text-gray-400 hover:bg-white/5'}`}>
                <span dangerouslySetInnerHTML={{ __html: `${checkedItems[i] ? '✓' : '○'} ${item}` }} />
              </button>
            ))}
            <div className="pt-3 border-t border-white/5 text-center">
              <p className={`text-3xl font-extrabold ${checkedCount === mentalEdgeChecklist.length ? 'text-green-400' : checkedCount >= 9 ? 'text-amber-400' : 'text-gray-500'}`}>{checkedCount}/{mentalEdgeChecklist.length}</p>
              <p className="text-xs text-gray-500 mt-1">{checkedCount === mentalEdgeChecklist.length ? 'Full mental edge. You are Level 4 complete.' : checkedCount >= 9 ? 'Strong foundation. Address the unchecked items this week.' : 'Keep building. Each checked item is a layer of protection.'}</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S06 — HOW TO USE */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Living Document</p>
          <h2 className="text-2xl font-extrabold mb-4">How to Use Your Constitution</h2>
          <div className="p-5 rounded-2xl glass-card space-y-4">
            {[
              { when: 'Every morning before trading', what: 'Read the entire constitution. 2 minutes. This primes your rational brain before the market tests your emotions.' },
              { when: 'Every Sunday during weekly review', what: 'Check each article against the past week. Did you follow Article 2 (rules)? Did you use Article 3 (circuit breakers)? Note any drift.' },
              { when: 'After any rule violation', what: 'Re-read the specific article you violated. Add a prevention measure. The constitution evolves as you learn more about yourself.' },
              { when: 'After any drawdown exceeding -5%', what: 'Re-read Article 6 (Recovery Plan). Follow it exactly. The constitution was written when you were calm &mdash; trust calm-you over stressed-you.' },
              { when: 'Every quarter', what: 'Full review and revision. Your constitution should evolve as you grow. Add new rules from experience. Remove rules that no longer apply.' },
            ].map((item, i) => (
              <div key={i}>
                <p className="text-sm font-bold text-amber-400 mb-1">{item.when}</p>
                <p className="text-sm text-gray-400 leading-relaxed">{item.what}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S07 — MYTHS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Final Myths</p>
          <h2 className="text-2xl font-extrabold mb-4">The Last Myths Standing</h2>
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

      {/* S08 — GAME */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Capstone Challenge</p>
          <h2 className="text-2xl font-extrabold mb-6">The Mental Edge &mdash; 5 Final Scenarios</h2>
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
            <p className="text-sm text-gray-400">{gameScore === 5 ? 'Perfect. Level 4 complete. Your mental edge is forged.' : gameScore >= 3 ? 'Strong foundation. Write your constitution and the edge sharpens.' : 'Review the Level 4 summary and write your constitution.'}</p>
          </motion.div>
          )}
        </motion.div>
      </section>

      {/* S09 — QUIZ */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Knowledge Check</p>
          <h2 className="text-2xl font-extrabold mb-6">The Mental Edge Final Quiz</h2>
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
        {quizDone && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 text-center p-8 glass-card rounded-2xl"><p className={`text-5xl font-extrabold mb-2 ${score >= 66 ? 'text-amber-400' : 'text-red-400'}`}>{score}%</p><p className="text-sm text-gray-400">{score === 100 ? '&#128220; Perfect. Your mental edge is complete. Now sign the constitution.' : score >= 66 ? 'Level 4 mastered. Write your constitution and trade with discipline.' : 'Review the Level 4 lessons and complete your constitution.'}</p></motion.div>)}
      </section>

      {/* Certificate */}
      <section className="px-5 py-16 text-center">
        {!certUnlocked ? (
          <div className="max-w-md mx-auto p-8 glass rounded-2xl"><p className="text-4xl mb-3 opacity-30">&#128274;</p><p className="text-sm text-gray-500">Score 66%+ to unlock your <strong className="text-amber-400">Level 4 Capstone Certificate</strong></p></div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, type: 'spring' }}
            className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.08),transparent,rgba(234,179,8,0.06),transparent,rgba(249,115,22,0.04),transparent)] animate-spin" style={{ animationDuration: '10s' }} />
            <div className="absolute inset-[1px] rounded-3xl border border-amber-500/15" />
            <div className="relative z-10">
              <div className="w-[90px] h-[90px] mx-auto mb-5 rounded-full bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 flex items-center justify-center text-5xl shadow-lg shadow-amber-500/30">&#128220;</div>
              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest mb-2">Level 4 Capstone Certificate</p>
              <h3 className="text-xl font-extrabold mb-1">Certificate of Mastery</h3>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">Has completed<br /><strong className="text-white">Level 4: Trading Psychology &amp; Mental Performance</strong><br />14 lessons &middot; ATLAS Academy by Interakktive</p>
              <p className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 bg-clip-text text-transparent font-bold text-xl mb-2" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Mental Edge Master &mdash;</p>
              <p className="text-xs text-gray-500 mb-4">The 90% that separates professionals from gamblers.</p>
              <p className="font-mono text-[11px] text-gray-500 mb-4">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L4.14-CAPSTONE-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
            </div>
          </motion.div>
        )}
      </section>

      <section className="text-center px-5 pt-10 pb-24">
        <p className="text-xs tracking-widest uppercase text-gray-600 mb-4">Level 4 Complete</p>
        <h2 className="text-xl font-bold mb-3">You&apos;ve Mastered Trading Psychology</h2>
        <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">14 lessons. From the Trader&apos;s Mind to your Psychological Constitution. Print it. Sign it. Trade with it. The mental edge is yours.</p>
        <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">
          Back to Academy <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
