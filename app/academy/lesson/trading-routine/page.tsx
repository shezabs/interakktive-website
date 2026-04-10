// app/academy/lesson/trading-routine/page.tsx
// ATLAS Academy — Lesson 4.9: Building Your Trading Routine [PRO]
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
// CLOCK ANIMATION — Three-phase routine cycle
// ============================================================
function ClockAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);
    const midX = w / 2;
    const midY = h / 2;
    const radius = Math.min(w, h) * 0.32;

    // Clock face
    ctx.strokeStyle = 'rgba(148,163,184,0.15)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(midX, midY, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Three segments: PRE (green), IN (amber), POST (blue)
    const segments = [
      { start: -Math.PI / 2, end: Math.PI / 6, color: '#22c55e', label: 'PRE-SESSION', sublabel: 'Prepare' },
      { start: Math.PI / 6, end: Math.PI * 5 / 6, color: '#f59e0b', label: 'IN-SESSION', sublabel: 'Execute' },
      { start: Math.PI * 5 / 6, end: Math.PI * 3 / 2, color: '#3b82f6', label: 'POST-SESSION', sublabel: 'Review' },
    ];

    segments.forEach(seg => {
      const r = parseInt(seg.color.slice(1, 3), 16);
      const g = parseInt(seg.color.slice(3, 5), 16);
      const b = parseInt(seg.color.slice(5, 7), 16);
      ctx.fillStyle = `rgba(${r},${g},${b},0.06)`;
      ctx.beginPath();
      ctx.moveTo(midX, midY);
      ctx.arc(midX, midY, radius - 2, seg.start, seg.end);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = `rgba(${r},${g},${b},0.25)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(midX, midY, radius, seg.start, seg.end);
      ctx.stroke();

      // Label
      const midAngle = (seg.start + seg.end) / 2;
      const lx = midX + Math.cos(midAngle) * (radius + 28);
      const ly = midY + Math.sin(midAngle) * (radius + 28);
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillStyle = `rgba(${r},${g},${b},0.7)`;
      ctx.fillText(seg.label, lx, ly - 4);
      ctx.font = '7px system-ui';
      ctx.fillStyle = `rgba(${r},${g},${b},0.4)`;
      ctx.fillText(seg.sublabel, lx, ly + 8);
    });

    // Rotating hand
    const handAngle = -Math.PI / 2 + (f * 0.008) % (Math.PI * 2);
    ctx.strokeStyle = 'rgba(245,158,11,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(midX, midY);
    ctx.lineTo(midX + Math.cos(handAngle) * (radius * 0.7), midY + Math.sin(handAngle) * (radius * 0.7));
    ctx.stroke();

    // Centre dot
    ctx.fillStyle = 'rgba(245,158,11,0.8)';
    ctx.beginPath();
    ctx.arc(midX, midY, 4, 0, Math.PI * 2);
    ctx.fill();
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ARMOUR ANIMATION — Routine as psychological armour
// ============================================================
function ArmourAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);
    const midX = w / 2;
    const midY = h / 2;

    // Divider
    ctx.strokeStyle = 'rgba(148,163,184,0.08)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(midX, 20);
    ctx.lineTo(midX, h - 20);
    ctx.stroke();
    ctx.setLineDash([]);

    // LEFT — No routine (exposed)
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(239,68,68,0.5)';
    ctx.fillText('NO ROUTINE', midX / 2, 28);

    // Stick figure (left) — no shield
    const lx = midX / 2;
    const ly = midY;
    ctx.strokeStyle = 'rgba(239,68,68,0.3)';
    ctx.lineWidth = 2;
    // Head
    ctx.beginPath();
    ctx.arc(lx, ly - 30, 10, 0, Math.PI * 2);
    ctx.stroke();
    // Body
    ctx.beginPath();
    ctx.moveTo(lx, ly - 20);
    ctx.lineTo(lx, ly + 15);
    ctx.stroke();
    // Arms
    ctx.beginPath();
    ctx.moveTo(lx - 18, ly - 5);
    ctx.lineTo(lx + 18, ly - 5);
    ctx.stroke();
    // Legs
    ctx.beginPath();
    ctx.moveTo(lx, ly + 15);
    ctx.lineTo(lx - 14, ly + 35);
    ctx.moveTo(lx, ly + 15);
    ctx.lineTo(lx + 14, ly + 35);
    ctx.stroke();

    // Incoming threats (left)
    const threats = ['FEAR', 'FOMO', 'REVENGE', 'GREED', 'BOREDOM'];
    threats.forEach((t, i) => {
      const angle = (i / threats.length) * Math.PI * 1.2 - Math.PI * 0.6;
      const dist = 55 + Math.sin(f * 0.03 + i * 1.3) * 8;
      const tx = lx + Math.cos(angle) * dist;
      const ty = ly + Math.sin(angle) * dist;
      ctx.font = 'bold 7px system-ui';
      ctx.fillStyle = `rgba(239,68,68,${0.3 + Math.sin(f * 0.04 + i) * 0.15})`;
      ctx.fillText(t, tx, ty);
    });

    ctx.font = '8px system-ui';
    ctx.fillStyle = 'rgba(239,68,68,0.4)';
    ctx.fillText('Exposed to every emotion', lx, h - 25);

    // RIGHT — With routine (shielded)
    ctx.font = 'bold 9px system-ui';
    ctx.fillStyle = 'rgba(34,197,94,0.5)';
    ctx.fillText('WITH ROUTINE', midX + midX / 2, 28);

    const rx = midX + midX / 2;
    const ry = midY;

    // Shield (hexagonal aura)
    const pulse = Math.sin(f * 0.03) * 0.1 + 0.9;
    ctx.strokeStyle = `rgba(34,197,94,${0.15 * pulse})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i <= 6; i++) {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const sx = rx + Math.cos(a) * 48;
      const sy = ry + Math.sin(a) * 48;
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = `rgba(34,197,94,${0.03 * pulse})`;
    ctx.fill();

    // Stick figure (right)
    ctx.strokeStyle = 'rgba(34,197,94,0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(rx, ry - 30, 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(rx, ry - 20);
    ctx.lineTo(rx, ry + 15);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(rx - 18, ry - 5);
    ctx.lineTo(rx + 18, ry - 5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(rx, ry + 15);
    ctx.lineTo(rx - 14, ry + 35);
    ctx.moveTo(rx, ry + 15);
    ctx.lineTo(rx + 14, ry + 35);
    ctx.stroke();

    // Shield labels
    const labels = ['PRE', 'RULES', 'ALERTS', 'LIMITS', 'JOURNAL', 'TIMER'];
    labels.forEach((l, i) => {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const sx = rx + Math.cos(a) * 52;
      const sy = ry + Math.sin(a) * 52;
      ctx.font = 'bold 6px system-ui';
      ctx.fillStyle = `rgba(34,197,94,${0.45 * pulse})`;
      ctx.fillText(l, sx, sy + 3);
    });

    ctx.font = '8px system-ui';
    ctx.fillStyle = 'rgba(34,197,94,0.4)';
    ctx.fillText('Shielded by structure', rx, h - 25);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// DATA
// ============================================================
const preSessionSteps = [
  { step: 'Check the economic calendar', desc: 'High-impact news can invalidate your entire analysis. Know what&apos;s coming BEFORE you mark levels. If NFP, FOMC, or CPI is within your session, adjust expectations or sit out entirely.', time: '2 min' },
  { step: 'Mark key levels on your charts', desc: 'Support, resistance, order blocks, FVGs, liquidity pools &mdash; whatever your strategy requires. Do this on the higher timeframe first (4H/Daily), then zoom to your entry timeframe.', time: '10 min' },
  { step: 'Define your bias', desc: 'Bullish, bearish, or no trade today. Write it down. A bias keeps you from flip-flopping mid-session. If price action contradicts your bias, you sit out &mdash; you don&apos;t reverse.', time: '3 min' },
  { step: 'Set alerts at key levels', desc: 'Price alerts at every level where you&apos;d consider trading. Then close the lower timeframe chart. The alert brings you back &mdash; your eyes don&apos;t need to be glued to the screen.', time: '3 min' },
  { step: 'Read your trading rules card', desc: 'A physical or digital card with your top 5 rules. Read them aloud. This takes 30 seconds and prevents 80% of impulsive behaviour. Example: &ldquo;Max 3 trades. 1R risk. A+ only. Kill zone only. No revenge.&rdquo;', time: '1 min' },
];

const inSessionRules = [
  { rule: 'Only trade inside kill zones', desc: 'London 08:00&ndash;10:30, New York 14:30&ndash;16:30. Outside these windows, the probability of institutional displacement drops dramatically.' },
  { rule: 'Checklist before every entry', desc: 'All criteria must be met. Not most. Not &ldquo;close enough.&rdquo; ALL. If one box is empty, the trade doesn&apos;t happen.' },
  { rule: 'Respect your daily trade limit', desc: 'When you hit 2&ndash;3 trades, your session is over. No exceptions. This forces selectivity and prevents overtrading.' },
  { rule: 'No screen time between alerts', desc: 'If no alert has fired, there&apos;s nothing to do. Step away. Come back when the alert fires. Watching price crawl is how boredom trades happen.' },
  { rule: 'Circuit breaker after 2 losses', desc: 'Two consecutive losses = 2-hour break minimum. If daily loss limit hit = done for the day. Non-negotiable.' },
];

const postSessionSteps = [
  { step: 'Journal every trade (and non-trade)', desc: 'Process grade each trade (A+ to F). If you took zero trades and followed your plan, journal that as an A+ process day. Screenshots of setups, entries, and outcomes.', time: '10 min' },
  { step: 'Score your process compliance', desc: 'Out of all trades taken today, what percentage followed your complete plan? Target: 90%+. Track this weekly.', time: '2 min' },
  { step: 'Identify one thing to improve', desc: 'Not ten things. ONE. Was your bias wrong? Did you enter early? Did you move your stop? Pick the single biggest improvement and write it on tomorrow&apos;s rules card.', time: '3 min' },
  { step: 'Close the platform completely', desc: 'Not minimise. CLOSE. When the session is over, the platform should not be running. If you can&apos;t see the chart, you can&apos;t take an impulsive trade.', time: '1 min' },
  { step: 'Do something non-trading', desc: 'Exercise, family time, cooking, reading. Your brain needs to decompress. Trading is mentally intense &mdash; recovery is part of the process, not a luxury.', time: 'Rest of day' },
];

const routineMyths = [
  { myth: '&ldquo;Routines are rigid and boring&rdquo;', reality: 'Routines are FREEING. When your process is automatic, you don&apos;t waste mental energy on decisions that should already be made. A pilot&apos;s pre-flight checklist isn&apos;t boring &mdash; it&apos;s what keeps the plane in the air.' },
  { myth: '&ldquo;I trade best when I&apos;m flexible and spontaneous&rdquo;', reality: '&ldquo;Spontaneous&rdquo; is another word for &ldquo;emotional.&rdquo; Every impulse trade you&apos;ve ever taken felt spontaneous. Flexibility within structure is fine &mdash; but the structure must exist first.' },
  { myth: '&ldquo;Professional traders don&apos;t need routines &mdash; they just know&rdquo;', reality: 'Professional traders have the MOST rigid routines. Hedge fund traders, prop firm traders, institutional desks &mdash; all follow strict pre-session, in-session, and post-session protocols. The routine IS the professionalism.' },
  { myth: '&ldquo;I&apos;ll build a routine when I&apos;m profitable&rdquo;', reality: 'You will never be consistently profitable without a routine. This is cause and effect in the wrong order. The routine creates the conditions for profitability, not the other way around.' },
];

const mistakes = [
  { wrong: 'Skipping the pre-session because &ldquo;the market is already moving&rdquo;', right: 'If the market moved before your prep was done, you missed it. That&apos;s fine. There will be another setup. Jumping in without preparation is how -3R mornings happen.', emoji: '&#9200;' },
  { wrong: 'Doing post-session review &ldquo;later&rdquo; (which means never)', right: 'Journal within 30 minutes of closing. Memory fades fast. The emotions, the thought process, the rationale &mdash; all degrade within hours. Late journals are fiction.', emoji: '&#128221;' },
  { wrong: 'Having a routine but not following it consistently', right: 'An inconsistent routine is worse than no routine because it creates false confidence. If you have a checklist but skip it on &ldquo;obvious&rdquo; setups, the checklist doesn&apos;t exist.', emoji: '&#128203;' },
  { wrong: 'Copying someone else&apos;s exact routine', right: 'Use frameworks (like this lesson) but personalise the details. Your session times, your pairs, your risk rules, your life schedule. The routine must fit YOUR reality.', emoji: '&#128100;' },
];

const gameScenarios = [
  { scenario: 'It&apos;s 7:55 AM. London opens in 5 minutes. You haven&apos;t done your pre-session prep. EUR/USD is showing a potential order block tap. What do you do?', options: ['Jump in &mdash; the setup won&apos;t wait for my prep', 'Do a rushed 2-minute prep and enter', 'Skip this setup. Open my prep routine, mark levels, set alerts. If the setup is gone, it wasn&apos;t mine.'], correct: 2, explain: 'The setup that can&apos;t wait for your 15-minute prep is the setup that catches you unprepared. Skipping prep to chase a setup violates the foundation of your entire routine.' },
  { scenario: 'You&apos;ve taken 2 trades today (your daily max is 3). Both were losses. An A+ setup appears on GBP/USD. Your circuit breaker says 2-hour break after 2 losses. The setup is right now.', options: ['Take it &mdash; A+ setups override circuit breakers', 'Respect the circuit breaker. 2-hour break. The setup will come again.', 'Take it but at half size as a compromise'], correct: 1, explain: 'The circuit breaker exists for exactly this moment. After 2 losses, your emotional state is compromised whether you feel it or not. The A+ setup will appear again tomorrow. Your capital must survive until then.' },
  { scenario: 'Your session ended at 10:30 AM. You took one beautiful +2R trade. At 10:45 AM you think: &ldquo;I&apos;m in the zone &mdash; maybe one more.&rdquo; What does your routine say?', options: ['Take one more &mdash; momentum is on my side', 'Session ended at 10:30. Platform closes at 10:30. No exceptions, especially after a win.', 'Set one more alert and wait 15 minutes'], correct: 1, explain: 'The session end time is ESPECIALLY important after wins. Overconfidence after a +2R winner is exactly how the Confidence vs Overconfidence lesson applies in practice. Close the platform.' },
  { scenario: 'You finish your trading day: 1 trade taken, +1.5R, process grade A+. But you &ldquo;don&apos;t feel like journaling&rdquo; because the day was simple. Do you still journal?', options: ['No &mdash; it was a simple day, nothing to write about', 'Yes &mdash; every day gets journaled. Winning A+ days are the MOST important to record because they&apos;re the template for future success.', 'Just write the P&amp;L in a spreadsheet, skip the full journal'], correct: 1, explain: 'A+ winning days are your playbook. They show exactly what right looks like. Skipping the journal on good days means you never build a reference library of your best decisions.' },
  { scenario: 'You&apos;ve been following your routine perfectly for 2 weeks. Then you have a -3R day despite perfect process. Your friend says: &ldquo;Maybe the routine isn&apos;t working.&rdquo; What do you think?', options: ['He might be right &mdash; -3R despite following every rule feels broken', 'The routine IS working. Perfect process + temporary losses = normal variance. I change NOTHING.', 'Keep the routine but add extra trades to recover faster'], correct: 1, explain: 'A -3R day with perfect process is the cost of business. The routine protects you from turning -3R into -10R. That IS it working. Changing a winning routine because of normal variance is the #1 mistake traders make.' },
];

const quizQuestions = [
  { q: 'What are the three phases of a trading routine?', opts: ['Entry, management, exit', 'Pre-session, in-session, post-session', 'Analysis, execution, review', 'Morning, afternoon, evening'], a: 1, explain: 'The three phases are pre-session (prepare), in-session (execute), and post-session (review). Each phase has specific tasks that must be completed consistently.' },
  { q: 'What is the FIRST thing you should do in your pre-session routine?', opts: ['Mark key levels on your charts', 'Check the economic calendar for high-impact news', 'Set price alerts', 'Define your directional bias'], a: 1, explain: 'Check the economic calendar first. High-impact news (NFP, FOMC, CPI) can invalidate your entire analysis. You need to know what&apos;s coming before you mark levels.' },
  { q: 'Why should you close the trading platform completely after your session?', opts: ['To save computer resources', 'To prevent impulsive trades &mdash; if you can&apos;t see the chart, you can&apos;t click &ldquo;buy&rdquo;', 'Because charts are distracting', 'To reset your indicators'], a: 1, explain: 'Minimising isn&apos;t enough. If the chart is one click away, so is an impulsive trade. Closing the platform creates a physical barrier between you and emotional decisions.' },
  { q: 'Your session ended 15 minutes ago. A &ldquo;perfect&rdquo; setup appears. What do you do?', opts: ['Take it &mdash; perfect setups are rare', 'Close the platform. Session end time is a rule, not a guideline.', 'Take it at reduced size', 'Screenshot it for tomorrow and close'], a: 1, explain: 'Session end time is non-negotiable. However, screenshotting for tomorrow&apos;s analysis (option D) is also a mature response. The key principle: the platform closes at your end time.' },
  { q: 'How soon after your session should you complete your journal?', opts: ['Within 30 minutes', 'Before bed', 'The next morning before trading', 'Whenever you feel like it'], a: 0, explain: 'Within 30 minutes. Memory of emotions, rationale, and thought processes degrades rapidly. A journal written 6 hours later is a reconstruction, not a recording.' },
  { q: 'What should your post-session review focus on?', opts: ['How much money you made or lost', 'ONE specific improvement for tomorrow', 'Whether your indicators were correct', 'How the market moved after your exit'], a: 1, explain: 'Focus on one improvement. Not ten. One actionable change for tomorrow. This creates compound improvement over weeks and months without overwhelming yourself.' },
  { q: 'Why is a &ldquo;rules card&rdquo; part of the pre-session routine?', opts: ['To memorise your strategy', 'Reading your top 5 rules aloud takes 30 seconds and prevents 80% of impulsive behaviour', 'To impress other traders', 'Because rules change every day'], a: 1, explain: 'The rules card takes 30 seconds and works like a pilot&apos;s checklist. It pre-loads your conscious mind with your boundaries before emotions can override them.' },
  { q: 'A trader follows his routine perfectly for 2 weeks then has a -3R day. The routine is:', opts: ['Broken &mdash; needs adjustment', 'Working &mdash; perfect process + normal variance = the routine doing its job', 'Incomplete &mdash; needs more rules', 'Only useful if it produces daily profits'], a: 1, explain: 'The routine protected a -3R day from becoming -10R. That is the routine working. Temporary losses with perfect process are normal variance, not evidence of a broken system.' },
];

export default function TradingRoutinePage() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h); }, []);

  const [openMyth, setOpenMyth] = useState<string | null>(null);
  const [openMistake, setOpenMistake] = useState<string | null>(null);

  // Routine builder
  const [routineItems, setRoutineItems] = useState<Record<string, boolean>>({});
  const allPreChecked = preSessionSteps.every(s => routineItems[`pre-${s.step}`]);
  const allInChecked = inSessionRules.every(r => routineItems[`in-${r.rule}`]);
  const allPostChecked = postSessionSteps.every(s => routineItems[`post-${s.step}`]);
  const totalChecked = Object.values(routineItems).filter(Boolean).length;
  const totalItems = preSessionSteps.length + inSessionRules.length + postSessionSteps.length;

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
          <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 4 &middot; Lesson 9</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight"><span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Building Your Trading Routine</span></h1>
          <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">Structure kills emotion. Pre-session, in-session, post-session &mdash; the routine that becomes your psychological armour.</p>
        </motion.div>
      </section>

      {/* S00 — WHY THIS MATTERS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-lg font-bold text-white mb-3">&#9992;&#65039; A commercial pilot doesn&apos;t sit in the cockpit and &ldquo;feel&rdquo; their way through a flight. They follow a checklist. Before takeoff: 47 items. Before landing: 31 items. Every single flight, every single time.</p>
            <p className="text-gray-400 leading-relaxed mb-4">Does the pilot find this boring? Probably. Does it keep 200 passengers alive? Absolutely. <strong className="text-amber-400">The checklist IS the skill.</strong></p>
            <p className="text-gray-400 leading-relaxed mb-4">Your trading routine is your cockpit checklist. It&apos;s not optional, it&apos;s not for beginners, and it&apos;s not something you &ldquo;graduate&rdquo; from. The most experienced pilots still use checklists &mdash; because <strong className="text-white">experience teaches you that memory is unreliable under pressure</strong>.</p>
            <p className="text-gray-400 leading-relaxed">This lesson gives you a complete three-phase routine: <strong className="text-green-400">pre-session</strong> (prepare), <strong className="text-amber-400">in-session</strong> (execute), and <strong className="text-blue-400">post-session</strong> (review). Together, they form the armour that protects you from every psychological threat we&apos;ve studied so far.</p>
          </div>
          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">A prop firm analysed their top 50 funded traders over 6 months. The #1 predictor of long-term survival was not win rate, not R:R, not strategy type &mdash; it was <strong className="text-white">routine consistency</strong>. Traders who documented a pre/in/post routine and followed it 90%+ of the time had a 3.4x higher survival rate at the 6-month mark than those without one.</p>
          </div>
        </motion.div>
      </section>

      {/* S01 — THE THREE PHASES */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Three Phases</p>
          <h2 className="text-2xl font-extrabold mb-4">Pre &rarr; In &rarr; Post</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Every trading day has three distinct phases. Each one has a purpose, a duration, and a checklist. Skip one and the entire system weakens.</p>
          <div className="mb-6 rounded-2xl overflow-hidden border border-white/5">
            <ClockAnimation />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { phase: 'Pre-Session', color: 'green', time: '15-20 min', tasks: 'Calendar, levels, bias, alerts, rules card' },
              { phase: 'In-Session', color: 'amber', time: '2-3 hours', tasks: 'Kill zones, checklist, limits, circuit breaker' },
              { phase: 'Post-Session', color: 'blue', time: '15-20 min', tasks: 'Journal, process score, one improvement, close platform' },
            ].map(p => (
              <div key={p.phase} className={`p-3 rounded-xl glass-card text-center border ${p.color === 'green' ? 'border-green-500/15' : p.color === 'amber' ? 'border-amber-500/15' : 'border-blue-500/15'}`}>
                <p className={`text-xs font-bold mb-1 ${p.color === 'green' ? 'text-green-400' : p.color === 'amber' ? 'text-amber-400' : 'text-blue-400'}`}>{p.phase}</p>
                <p className="text-white font-extrabold text-sm">{p.time}</p>
                <p className="text-[10px] text-gray-500 mt-1">{p.tasks}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S02 — THE ARMOUR */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; Your Psychological Armour</p>
          <h2 className="text-2xl font-extrabold mb-4">Without Structure, You&apos;re Exposed</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Every lesson in Level 4 &mdash; fear, greed, FOMO, revenge, overconfidence, patience &mdash; they all attack when your guard is down. The routine is the guard.</p>
          <div className="rounded-2xl overflow-hidden border border-white/5">
            <ArmourAnimation />
          </div>
        </motion.div>
      </section>

      {/* S03 — PRE-SESSION DETAIL */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; Pre-Session (15&ndash;20 Minutes)</p>
          <h2 className="text-2xl font-extrabold mb-4">Prepare Before the Bell</h2>
          <p className="text-gray-400 leading-relaxed mb-6">This happens BEFORE the kill zone opens. Not during. Not &ldquo;while you watch the chart.&rdquo; Before.</p>
          <div className="space-y-3">
            {preSessionSteps.map((s, i) => (
              <div key={i} className="p-4 rounded-xl glass-card">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-bold text-green-400">{i + 1}. {s.step}</p>
                  <span className="text-[10px] text-gray-500 bg-green-500/10 px-2 py-0.5 rounded flex-shrink-0">{s.time}</span>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: s.desc }} />
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S04 — IN-SESSION DETAIL */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; In-Session (2&ndash;3 Hours)</p>
          <h2 className="text-2xl font-extrabold mb-4">Execute With Discipline</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The in-session phase is where all of Level 4 comes together. Every rule you&apos;ve learned lives here.</p>
          <div className="space-y-3">
            {inSessionRules.map((r, i) => (
              <div key={i} className="p-4 rounded-xl glass-card">
                <p className="text-sm font-bold text-amber-400 mb-2">{i + 1}. {r.rule}</p>
                <p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: r.desc }} />
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S05 — POST-SESSION DETAIL */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Post-Session (15&ndash;20 Minutes)</p>
          <h2 className="text-2xl font-extrabold mb-4">Review, Learn, Close</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The most skipped phase. Also the most valuable. This is where compounding improvement happens.</p>
          <div className="space-y-3">
            {postSessionSteps.map((s, i) => (
              <div key={i} className="p-4 rounded-xl glass-card">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-bold text-blue-400">{i + 1}. {s.step}</p>
                  <span className="text-[10px] text-gray-500 bg-blue-500/10 px-2 py-0.5 rounded flex-shrink-0">{s.time}</span>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: s.desc }} />
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S06 — INTERACTIVE ROUTINE BUILDER */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Build Your Routine</p>
          <h2 className="text-2xl font-extrabold mb-4">Interactive Routine Checklist</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Tick every item you will commit to. Be honest &mdash; an incomplete routine followed consistently beats a perfect routine followed occasionally.</p>
          <div className="p-5 rounded-2xl glass-card space-y-6">
            {/* Pre */}
            <div>
              <p className={`text-xs font-bold mb-3 ${allPreChecked ? 'text-green-400' : 'text-green-400/60'}`}>&#9989; PRE-SESSION {allPreChecked && '(Complete!)'}</p>
              <div className="space-y-2">
                {preSessionSteps.map(s => {
                  const key = `pre-${s.step}`;
                  return (<button key={key} onClick={() => setRoutineItems(prev => ({ ...prev, [key]: !prev[key] }))} className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${routineItems[key] ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'glass text-gray-400 hover:bg-white/5'}`}>{routineItems[key] ? '\u2713 ' : '\u25CB '}{s.step}</button>);
                })}
              </div>
            </div>
            {/* In */}
            <div>
              <p className={`text-xs font-bold mb-3 ${allInChecked ? 'text-amber-400' : 'text-amber-400/60'}`}>&#9889; IN-SESSION {allInChecked && '(Complete!)'}</p>
              <div className="space-y-2">
                {inSessionRules.map(r => {
                  const key = `in-${r.rule}`;
                  return (<button key={key} onClick={() => setRoutineItems(prev => ({ ...prev, [key]: !prev[key] }))} className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${routineItems[key] ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'glass text-gray-400 hover:bg-white/5'}`}>{routineItems[key] ? '\u2713 ' : '\u25CB '}{r.rule}</button>);
                })}
              </div>
            </div>
            {/* Post */}
            <div>
              <p className={`text-xs font-bold mb-3 ${allPostChecked ? 'text-blue-400' : 'text-blue-400/60'}`}>&#128221; POST-SESSION {allPostChecked && '(Complete!)'}</p>
              <div className="space-y-2">
                {postSessionSteps.map(s => {
                  const key = `post-${s.step}`;
                  return (<button key={key} onClick={() => setRoutineItems(prev => ({ ...prev, [key]: !prev[key] }))} className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${routineItems[key] ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'glass text-gray-400 hover:bg-white/5'}`}>{routineItems[key] ? '\u2713 ' : '\u25CB '}{s.step}</button>);
                })}
              </div>
            </div>
            {/* Score */}
            <div className="pt-4 border-t border-white/5 text-center">
              <p className={`text-3xl font-extrabold ${totalChecked === totalItems ? 'text-green-400' : totalChecked >= totalItems * 0.7 ? 'text-amber-400' : 'text-gray-500'}`}>{totalChecked}/{totalItems}</p>
              <p className="text-xs text-gray-500 mt-1">{totalChecked === totalItems ? 'Full routine committed. Print it. Follow it. Every day.' : totalChecked >= totalItems * 0.7 ? 'Strong foundation. Consider adding the unchecked items over time.' : 'Start with the items you checked. Build from there.'}</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S07 — MYTHS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Myths Busted</p>
          <h2 className="text-2xl font-extrabold mb-4">Routine Myths That Hold You Back</h2>
          <div className="space-y-3">
            {routineMyths.map(m => (
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
          <h2 className="text-2xl font-extrabold mb-6">Routine Decisions &mdash; 5 Scenarios</h2>
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
            <p className="text-sm text-gray-400">{gameScore === 5 ? 'Perfect routine discipline. The checklist is your superpower.' : gameScore >= 3 ? 'Good structure awareness. Review the circuit breaker and session end rules.' : 'The routine needs to be non-negotiable. Re-read all three phases.'}</p>
          </motion.div>
          )}
        </motion.div>
      </section>

      {/* S10 — QUIZ */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Knowledge Check</p>
          <h2 className="text-2xl font-extrabold mb-6">Trading Routine Quiz</h2>
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
        {quizDone && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 text-center p-8 glass-card rounded-2xl"><p className={`text-5xl font-extrabold mb-2 ${score >= 66 ? 'text-amber-400' : 'text-red-400'}`}>{score}%</p><p className="text-sm text-gray-400">{score === 100 ? '&#9992;&#65039; Perfect. Your pre-flight checklist is locked.' : score >= 66 ? 'Strong routine awareness. Now commit to following it every single day.' : 'Review all three phases and the interactive routine builder.'}</p></motion.div>)}
      </section>

      {/* Certificate */}
      <section className="px-5 py-16 text-center">
        {!certUnlocked ? (
          <div className="max-w-md mx-auto p-8 glass rounded-2xl"><p className="text-4xl mb-3 opacity-30">&#128274;</p><p className="text-sm text-gray-500">Score 66%+ to unlock your <strong className="text-amber-400">Pro Certificate</strong></p></div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, type: 'spring' }}
            className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(34,197,94,0.06),transparent,rgba(245,158,11,0.04),transparent,rgba(59,130,246,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
            <div className="absolute inset-[1px] rounded-3xl border border-amber-500/10" />
            <div className="relative z-10">
              <div className="w-[80px] h-[80px] mx-auto mb-5 rounded-full bg-gradient-to-br from-green-500 via-amber-500 to-blue-500 flex items-center justify-center text-4xl shadow-lg shadow-amber-500/20">&#9992;&#65039;</div>
              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest mb-2">Pro Certificate</p>
              <h3 className="text-xl font-extrabold mb-1">Certificate of Mastery</h3>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">Has mastered<br /><strong className="text-white">Level 4.9: Building Your Trading Routine</strong><br />at ATLAS Academy by Interakktive</p>
              <p className="bg-gradient-to-r from-green-400 via-amber-400 to-blue-400 bg-clip-text text-transparent font-bold text-lg mb-1" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Routine Architect &mdash;</p>
              <p className="font-mono text-[11px] text-gray-500 mb-4">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L4.9-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
            </div>
          </motion.div>
        )}
      </section>

      <section className="text-center px-5 pt-10 pb-24">
        <p className="text-xs tracking-widest uppercase text-gray-600 mb-4">Up Next</p>
        <h2 className="text-xl font-bold mb-6">Lesson 4.10 &mdash; The Trading Journal &mdash; Your Psychologist</h2>
        <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">
          Continue <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
