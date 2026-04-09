// app/academy/lesson/fear-and-greed/page.tsx
// ATLAS Academy — Lesson 4.2: Fear & Greed — The Twin Killers [PRO]
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
// TUG OF WAR ANIMATION — Fear vs Greed pulling a P&L rope
// ============================================================
function TugOfWarAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);
    const midX = w / 2;
    const midY = h / 2;
    const cycle = (f % 600) / 600;

    // The tug position oscillates — sometimes fear wins, sometimes greed
    const tugPos = Math.sin(cycle * Math.PI * 2) * 0.35 + Math.sin(cycle * Math.PI * 6) * 0.1;
    // tugPos: -0.45 to +0.45 (negative = fear pulling left, positive = greed pulling right)

    const ropeY = midY - 5;
    const ropeLen = w * 0.7;
    const ropeStartX = midX - ropeLen / 2;
    const ropeEndX = midX + ropeLen / 2;

    // Centre marker (the account balance)
    const markerX = midX + tugPos * (ropeLen * 0.4);

    // Rope
    ctx.strokeStyle = 'rgba(148,163,184,0.3)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(ropeStartX, ropeY);
    ctx.lineTo(ropeEndX, ropeY);
    ctx.stroke();

    // Centre line (equilibrium)
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = 'rgba(148,163,184,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(midX, ropeY - 40);
    ctx.lineTo(midX, ropeY + 40);
    ctx.stroke();
    ctx.setLineDash([]);

    // Fear figure (left side)
    const fearX = ropeStartX - 20;
    const fearPull = tugPos < 0 ? 1 : 0.4;
    // Body
    ctx.fillStyle = `rgba(59,130,246,${0.5 + fearPull * 0.3})`;
    ctx.beginPath();
    ctx.arc(fearX, midY - 25, 12, 0, Math.PI * 2);
    ctx.fill();
    // Arms reaching toward rope
    ctx.strokeStyle = `rgba(59,130,246,${0.4 + fearPull * 0.3})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(fearX + 8, midY - 18);
    ctx.lineTo(ropeStartX + 5, ropeY);
    ctx.stroke();
    // Lean animation
    const fearLean = Math.sin(f * 0.06) * 3 * fearPull;
    ctx.beginPath();
    ctx.moveTo(fearX, midY - 13);
    ctx.lineTo(fearX - 6 + fearLean, midY + 15);
    ctx.moveTo(fearX, midY - 13);
    ctx.lineTo(fearX + 4 + fearLean, midY + 15);
    ctx.stroke();

    // FEAR label
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = `rgba(59,130,246,${0.5 + fearPull * 0.4})`;
    ctx.fillText('FEAR', fearX, midY + 35);
    ctx.font = '8px system-ui';
    ctx.fillStyle = 'rgba(59,130,246,0.35)';
    ctx.fillText('"Close it NOW!"', fearX, midY + 47);
    ctx.fillText('"Save what you have!"', fearX, midY + 58);

    // Greed figure (right side)
    const greedX = ropeEndX + 20;
    const greedPull = tugPos > 0 ? 1 : 0.4;
    ctx.fillStyle = `rgba(234,179,8,${0.5 + greedPull * 0.3})`;
    ctx.beginPath();
    ctx.arc(greedX, midY - 25, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(234,179,8,${0.4 + greedPull * 0.3})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(greedX - 8, midY - 18);
    ctx.lineTo(ropeEndX - 5, ropeY);
    ctx.stroke();
    const greedLean = Math.sin(f * 0.06 + 1) * 3 * greedPull;
    ctx.beginPath();
    ctx.moveTo(greedX, midY - 13);
    ctx.lineTo(greedX + 6 + greedLean, midY + 15);
    ctx.moveTo(greedX, midY - 13);
    ctx.lineTo(greedX - 4 + greedLean, midY + 15);
    ctx.stroke();

    ctx.font = 'bold 11px system-ui';
    ctx.fillStyle = `rgba(234,179,8,${0.5 + greedPull * 0.4})`;
    ctx.fillText('GREED', greedX, midY + 35);
    ctx.font = '8px system-ui';
    ctx.fillStyle = 'rgba(234,179,8,0.35)';
    ctx.fillText('"Hold for more!"', greedX, midY + 47);
    ctx.fillText('"Remove the TP!"', greedX, midY + 58);

    // Account marker (the prize being fought over)
    const markerGlow = 0.3 + Math.sin(f * 0.08) * 0.1;
    ctx.beginPath();
    ctx.arc(markerX, ropeY, 8, 0, Math.PI * 2);
    const mgrd = ctx.createRadialGradient(markerX, ropeY, 0, markerX, ropeY, 12);
    mgrd.addColorStop(0, `rgba(251,191,36,${markerGlow + 0.3})`);
    mgrd.addColorStop(1, 'rgba(251,191,36,0)');
    ctx.fillStyle = mgrd;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(markerX, ropeY, 6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(251,191,36,0.8)';
    ctx.fill();

    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(251,191,36,0.6)';
    ctx.fillText('YOUR P&L', markerX, ropeY - 18);

    // Zone labels
    ctx.font = '8px system-ui';
    ctx.fillStyle = 'rgba(59,130,246,0.2)';
    ctx.fillText('Exit too early', midX - ropeLen * 0.25, ropeY + 60);
    ctx.fillStyle = 'rgba(234,179,8,0.2)';
    ctx.fillText('Hold too long', midX + ropeLen * 0.25, ropeY + 60);
    ctx.fillStyle = 'rgba(34,197,94,0.3)';
    ctx.fillText('BALANCE', midX, ropeY + 60);
  }, []);

  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// FEAR-GREED METER ANIMATION — Needle swinging between extremes
// ============================================================
function FearGreedMeterAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);
    const midX = w / 2;
    const meterY = h * 0.55;
    const radius = Math.min(w, h) * 0.35;

    // Meter arc (semicircle)
    const startAngle = Math.PI;
    const endAngle = Math.PI * 2;

    // Zone segments: Extreme Fear | Fear | Neutral | Greed | Extreme Greed
    const zones = [
      { start: 0, end: 0.2, color: '#3b82f6', label: 'EXTREME FEAR' },
      { start: 0.2, end: 0.4, color: '#60a5fa', label: 'FEAR' },
      { start: 0.4, end: 0.6, color: '#22c55e', label: 'NEUTRAL' },
      { start: 0.6, end: 0.8, color: '#eab308', label: 'GREED' },
      { start: 0.8, end: 1, color: '#ef4444', label: 'EXTREME GREED' },
    ];

    zones.forEach(z => {
      const a1 = startAngle + z.start * Math.PI;
      const a2 = startAngle + z.end * Math.PI;
      ctx.beginPath();
      ctx.arc(midX, meterY, radius, a1, a2);
      ctx.arc(midX, meterY, radius * 0.7, a2, a1, true);
      ctx.closePath();
      const r = parseInt(z.color.slice(1, 3), 16);
      const g = parseInt(z.color.slice(3, 5), 16);
      const b = parseInt(z.color.slice(5, 7), 16);
      ctx.fillStyle = `rgba(${r},${g},${b},0.15)`;
      ctx.fill();
      ctx.strokeStyle = `rgba(${r},${g},${b},0.25)`;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Zone label
      const midAngle = (a1 + a2) / 2;
      const labelR = radius * 0.85;
      ctx.font = '7px system-ui';
      ctx.textAlign = 'center';
      ctx.fillStyle = `rgba(${r},${g},${b},0.5)`;
      ctx.fillText(z.label, midX + Math.cos(midAngle) * labelR, meterY + Math.sin(midAngle) * labelR);
    });

    // Needle — oscillates with a bias toward extremes
    const cycle = (f % 480) / 480;
    const needlePos = 0.5 + Math.sin(cycle * Math.PI * 2) * 0.4 + Math.sin(cycle * Math.PI * 7) * 0.08;
    const needleAngle = startAngle + Math.max(0.02, Math.min(0.98, needlePos)) * Math.PI;

    // Needle shadow
    ctx.strokeStyle = 'rgba(251,191,36,0.1)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(midX, meterY);
    ctx.lineTo(midX + Math.cos(needleAngle) * (radius * 0.6), meterY + Math.sin(needleAngle) * (radius * 0.6));
    ctx.stroke();

    // Needle
    ctx.strokeStyle = 'rgba(251,191,36,0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(midX, meterY);
    ctx.lineTo(midX + Math.cos(needleAngle) * (radius * 0.62), meterY + Math.sin(needleAngle) * (radius * 0.62));
    ctx.stroke();

    // Centre dot
    ctx.beginPath();
    ctx.arc(midX, meterY, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(251,191,36,0.7)';
    ctx.fill();

    // Current reading
    const currentZone = zones.find(z => needlePos >= z.start && needlePos < z.end) || zones[2];
    ctx.font = 'bold 12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = currentZone.color;
    ctx.fillText(currentZone.label, midX, meterY + 30);

    ctx.font = '9px system-ui';
    ctx.fillStyle = 'rgba(148,163,184,0.4)';
    ctx.fillText('Your emotional state right now', midX, meterY + 45);

    // Title
    ctx.font = 'bold 10px system-ui';
    ctx.fillStyle = 'rgba(148,163,184,0.5)';
    ctx.fillText('FEAR & GREED METER', midX, meterY - radius - 15);
  }, []);

  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// INTERACTIVE SCENARIO SIMULATOR
// ============================================================
const scenarios = [
  {
    title: 'The Winning Trade',
    setup: 'You entered GBP/USD long at 1.2650. Your take profit is at 1.2700 (+50 pips). Price is currently at 1.2690 &mdash; just 10 pips from your target. But momentum looks strong.',
    stages: [
      { price: '+40 pips', emotion: 'Greed whispers: &quot;Remove the TP. This could go to +100.&quot;', fearSays: 'Take the 40 pips now. Don&apos;t give it back.', greedSays: 'It&apos;s going higher. Remove the TP and ride it.', correct: 'plan', correctText: 'Your TP was set for a reason. Stick to the plan. The extra pips were never part of your setup.' },
      { price: '+50 pips (TP hit)', emotion: 'Your plan executed perfectly. But price keeps moving to +80...', fearSays: 'Good &mdash; you banked profit. Move on.', greedSays: 'You left 30 pips on the table! You should have held!', correct: 'plan', correctText: 'A completed trade at target is a PERFECT trade. The 30 extra pips don&apos;t belong to you. Celebrate the win.' },
    ],
  },
  {
    title: 'The Losing Trade',
    setup: 'You shorted EUR/USD at 1.0880. Stop loss at 1.0910 (-30 pips). Price is at 1.0895 &mdash; 15 pips against you, halfway to your stop.',
    stages: [
      { price: '-15 pips', emotion: 'Fear screams: &quot;Close it! Save what you can!&quot;', fearSays: 'Close now and only lose 15 pips instead of 30.', greedSays: 'It&apos;ll reverse. Add to the position to lower your average.', correct: 'plan', correctText: 'Your stop is at -30 for a reason. Price fluctuating within your stop range is NORMAL. Closing at -15 because of fear means emotions are controlling your exits.' },
      { price: '-30 pips (SL hit)', emotion: 'Stop hit. -1% account loss. The plan worked as designed.', fearSays: 'See? You should have closed at -15.', greedSays: 'You should have moved the stop. It would have reversed!', correct: 'plan', correctText: 'A loss at your planned stop is a GOOD trade. You accepted the risk before entry. The stop protected your capital. This is exactly what discipline looks like.' },
    ],
  },
];

// ============================================================
// GAME SCENARIOS
// ============================================================
const gameScenarios = [
  { scenario: 'Your trade is +35 pips in profit. Your target is +50. A news event is in 10 minutes. Fear says close now. Greed says hold through the news for +100. What do you do?', opts: ['Close at +35 &mdash; secure the profit before news', 'Hold to target but move stop to breakeven', 'Remove TP and hold through news', 'Close half at +35, let half run'], correct: 1, explain: 'Moving stop to breakeven removes risk while keeping the trade alive. You&apos;re no longer exposed to a full reversal, but you still have a chance to hit your target. Closing early is fear-driven. Holding through news without protection is greed-driven. This is the balanced response.' },
  { scenario: 'You&apos;ve been watching Gold all morning. It just moved +$40 without you. You have no setup. FOMO is screaming. What do you do?', opts: ['Enter now &mdash; it&apos;s clearly going up', 'Wait for a pullback to a valid zone', 'Nothing &mdash; no setup means no trade', 'Enter with a tight stop to limit risk'], correct: 2, explain: 'No setup means no trade. It doesn&apos;t matter how far price has moved &mdash; chasing is gambling. The move already happened. Entering now gives you the worst possible R:R. There are 252 trading days per year. Another setup will come.' },
  { scenario: 'Your trade hits -1R (your maximum risk). Price is 2 pips from your stop. It looks like it might reverse. Fear wants you to widen the stop &quot;just this once.&quot; What do you do?', opts: ['Widen the stop by 10 pips &mdash; it&apos;s so close to reversing', 'Let the stop hit &mdash; your analysis placed it there for a reason', 'Close manually to save the 2 pips', 'Average down to improve your entry price'], correct: 1, explain: 'Your stop was placed based on your ANALYSIS, not your emotions. Moving it means your next loss could be 1.5R, then 2R, then your risk management breaks completely. Let the stop do its job. It exists to protect you.' },
  { scenario: 'You&apos;ve had 3 winning trades today (+3.2R total). Your plan says max 3 trades per day. But you see what looks like an A+ setup forming. Greed says &quot;one more.&quot; What do you do?', opts: ['Take it &mdash; A+ setups are rare', 'Skip it &mdash; your daily limit is your daily limit', 'Take it with half size as a compromise', 'Screenshot it and review it later'], correct: 3, explain: 'Your daily limit is a RULE. But you can still extract value from the setup by documenting it. Screenshot it, track how it plays out, add it to your journal. You stay disciplined AND you build data. The market will be there tomorrow.' },
  { scenario: 'Your account is up 8% this month. Your monthly target is 5%. There are 10 trading days left. Greed says keep pushing. What&apos;s the professional response?', opts: ['Reduce size and protect the gains', 'Keep trading normally &mdash; momentum is on your side', 'Take bigger positions to push for 15%', 'Stop trading for the rest of the month'], correct: 0, explain: 'You&apos;ve already exceeded your target. Reducing size protects your gains while keeping you in the game. Taking bigger positions after a strong month is the #1 cause of blowback &mdash; one bad trade at oversized risk erases the whole month. Professional traders scale DOWN after exceeding targets.' },
];

// ============================================================
// QUIZ QUESTIONS
// ============================================================
const quizQuestions = [
  { q: 'Fear causes traders to:', opts: ['Exit winning trades too early and skip valid signals', 'Hold winning trades too long', 'Take too many trades', 'Ignore their stop loss'], a: 0, explain: 'Fear makes traders grab profit at the first sign of movement against them and avoid entering valid setups. The result is small wins (cut short) and missed opportunities (signals skipped).' },
  { q: 'Greed causes traders to:', opts: ['Exit trades too quickly', 'Remove take profits and hold losers hoping for reversal', 'Trade less frequently', 'Use smaller position sizes'], a: 1, explain: 'Greed tells traders that every winning trade could be &quot;the big one.&quot; They remove TPs, hold losers because &quot;it&apos;ll come back,&quot; and increase size after wins. All of these erode edge over time.' },
  { q: 'The &quot;tug of war&quot; between fear and greed means the best approach is:', opts: ['Eliminate both emotions completely', 'Follow your pre-set plan regardless of emotions', 'Always lean toward fear (conservative)', 'Always lean toward greed (aggressive)'], a: 1, explain: 'You CANNOT eliminate emotions. They&apos;re biological. The solution is a PRE-SET PLAN that makes decisions for you before emotions arise. Entry, stop, target &mdash; all decided before the trade. Your job is to execute, not to decide in the moment.' },
  { q: 'When a trade is at +40 pips and your target is +50, the fear-driven response is:', opts: ['Hold to target', 'Close immediately to lock in profit', 'Move stop to breakeven', 'Add to the position'], a: 1, explain: 'Closing at +40 when your plan says +50 is fear. You&apos;re afraid the market will take back your profit. Over hundreds of trades, cutting winners short at 80% of target dramatically reduces your expectancy.' },
  { q: 'The Fear &amp; Greed Spectrum shows that EXTREME FEAR leads to:', opts: ['Overtrading', 'Analysis paralysis and skipping every signal', 'Taking oversized positions', 'Removing stop losses'], a: 1, explain: 'At the extreme fear end, traders freeze completely. They see setups but cannot pull the trigger. Every price movement against them feels catastrophic. They close winners immediately and skip most signals.' },
  { q: 'After a trade hits your stop loss at -1R, the greed-driven response is:', opts: ['Accept the loss and wait for the next setup', 'Re-enter immediately to &quot;win it back&quot;', 'Review the trade in your journal', 'Reduce size for the next trade'], a: 1, explain: 'Re-entering after a stop hit is greed disguised as revenge. The mind says &quot;the market owes me.&quot; It doesn&apos;t. Each trade is independent. The previous loss has zero influence on the next trade.' },
  { q: 'The correct way to handle emotions in trading is to:', opts: ['Suppress them completely', 'Build systems and rules that operate regardless of emotions', 'Only trade when you feel emotionally neutral', 'Let emotions guide your intuition'], a: 1, explain: 'Emotions cannot be suppressed &mdash; they&apos;re biological. The professional approach is to build SYSTEMS (written plans, fixed rules, circuit breakers) that make decisions for you. You feel the emotion, acknowledge it, then follow the plan anyway.' },
  { q: 'A trader who consistently cuts winners short and holds losers too long is experiencing:', opts: ['Only fear', 'Only greed', 'Fear on winners and greed (hope) on losers', 'Neither &mdash; they have a strategy problem'], a: 2, explain: 'This is the classic twin-killer pattern. FEAR on winners (&quot;take it before it disappears&quot;) and GREED/HOPE on losers (&quot;it&apos;ll come back&quot;). The result is small wins and large losses &mdash; the opposite of what a profitable system needs.' },
];

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function FearAndGreedLesson() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Accordion states
  const [openFear, setOpenFear] = useState<string | null>(null);
  const [openGreed, setOpenGreed] = useState<string | null>(null);
  const [openSpectrum, setOpenSpectrum] = useState<string | null>(null);
  const [openTool, setOpenTool] = useState<string | null>(null);
  const [openMistake, setOpenMistake] = useState<string | null>(null);

  // Simulator state
  const [simIndex, setSimIndex] = useState(0);
  const [simStage, setSimStage] = useState(0);
  const [simChoice, setSimChoice] = useState<string | null>(null);

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
  const currentSim = scenarios[simIndex];
  const currentStage = currentSim.stages[simStage];

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-900/50"><motion.div className="h-full bg-gradient-to-r from-amber-500 to-accent-500" style={{ width: `${Math.min((scrollY / (typeof document !== 'undefined' ? document.body.scrollHeight - window.innerHeight : 1)) * 100, 100)}%` }} /></div>
      <nav className="sticky top-0 z-40 px-5 py-3 flex items-center justify-between" style={{ background: 'rgba(6,10,18,0.85)', backdropFilter: 'blur(16px)' }}>
        <Link href="/academy" className="text-xs text-gray-500 hover:text-gray-300 transition">&larr; Academy</Link>
        <div className="flex items-center gap-2"><Crown className="w-3.5 h-3.5 text-amber-400" /><span className="text-xs font-bold text-amber-400">PRO &middot; LEVEL 4</span></div>
      </nav>

      <section className="px-5 pt-16 pb-12 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 4 &middot; Lesson 2</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight"><span className="bg-gradient-to-r from-blue-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Fear &amp; Greed</span></h1>
          <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">The two forces that make you exit too early and hold too long. Master the tug of war.</p>
        </motion.div>
      </section>

      {/* SECTION 00 — WHY THIS MATTERS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-lg font-bold text-white mb-3">&#9878;&#65039; Imagine two people on opposite ends of a rope, pulling as hard as they can. In the middle? Your trading account.</p>
            <p className="text-gray-400 leading-relaxed mb-4">On one side is <strong className="text-blue-400">Fear</strong> &mdash; screaming at you to close your trade, take the tiny profit, avoid the loss, don&apos;t enter, stay safe. On the other side is <strong className="text-yellow-400">Greed</strong> &mdash; whispering that this trade could be the big one, hold longer, remove the TP, size up, you deserve more.</p>
            <p className="text-gray-400 leading-relaxed mb-4">Both are <strong className="text-amber-400">wrong</strong>. Fear makes you exit winners too early and skip valid setups. Greed makes you hold losers too long and oversize your positions. Together, they create the exact opposite of what a profitable strategy needs: <strong className="text-white">small losses and big wins become big losses and small wins</strong>.</p>
            <p className="text-gray-400 leading-relaxed">This lesson teaches you to recognise which one is pulling you right now &mdash; and how to stand in the middle, where your plan is.</p>
          </div>
          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">A study of 10,000 retail trading accounts found that traders won 61% of their trades &mdash; but still lost money overall. Why? Their average win was $43 and their average loss was $83. Fear closed winners too early. Greed (and hope) held losers too long. The strategy was profitable. The psychology destroyed it.</p>
          </div>
        </motion.div>
      </section>

      {/* SECTION 01 — TUG OF WAR */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Tug of War</p>
          <h2 className="text-2xl font-extrabold mb-4">Your Account in the Middle</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">Watch the golden dot &mdash; that&apos;s your P&amp;L being pulled between fear and greed. When fear wins, you close winners early. When greed wins, you hold losers too long. The <strong className="text-green-400">balance point</strong> is your trading plan.</p>
          <TugOfWarAnimation />
        </motion.div>
      </section>

      {/* SECTION 02 — FEAR DEEP DIVE */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; Fear Dissected</p>
          <h2 className="text-2xl font-extrabold mb-2">The Four Faces of Fear</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">Fear isn&apos;t one emotion. It wears four masks, and each one sabotages your trading differently.</p>
        </motion.div>
        <div className="space-y-3">
          {[
            { name: 'Fear of Losing Money', icon: '&#128176;', desc: 'The most basic fear. Every pip against you feels like a physical wound. You close trades at -5 pips when your stop is at -30 because you &quot;can&apos;t watch it go lower.&quot;', impact: 'Your stop loss is never actually tested because you exit before it&apos;s hit. Your risk management is broken because you&apos;re not accepting the risk you calculated.', antidote: 'Before every trade, say: &quot;I am willing to lose [£X]. If this hits my stop, I will have lost [£X] and that is acceptable.&quot; If you can&apos;t say this, your position is too big.' },
            { name: 'Fear of Missing Out (FOMO)', icon: '&#128560;', desc: 'The move is happening RIGHT NOW and you&apos;re not in it. The chart is printing candle after candle in one direction and every second you don&apos;t enter feels like money lost.', impact: 'You chase entries with terrible R:R. You enter without a setup. You trade outside your session. Your win rate drops because FOMO entries have no structure.', antidote: 'Write this on a sticky note and put it on your monitor: &quot;The trade I missed was never mine.&quot; There are 252 trading days per year. Missing one setup is nothing.' },
            { name: 'Fear of Being Wrong', icon: '&#128566;', desc: 'Your ego can&apos;t accept a losing trade because it means you were &quot;wrong.&quot; So you move your stop, average down, or refuse to close &mdash; anything to avoid admitting the analysis was incorrect.', impact: 'Small planned losses become account-threatening disasters. A -1R loss becomes -3R, -5R, because you couldn&apos;t admit the trade was done.', antidote: 'Reframe: a loss at your stop is NOT being wrong. It&apos;s the market doing what markets do. You can have a correct analysis and still get stopped out. That&apos;s called variance.' },
            { name: 'Fear of Success', icon: '&#128561;', desc: 'Sounds strange, but many traders subconsciously sabotage winning streaks. They feel &quot;undeserving&quot; of profit, or fear that success brings pressure to maintain it.', impact: 'Self-sabotage after winning streaks: suddenly breaking rules, taking random trades, giving back profits. You end every good week with a bad Friday.', antidote: 'Track your &quot;post-win&quot; behaviour in your journal. If you notice degradation after wins, implement a rule: after 3 consecutive wins, take a 24-hour break. Return fresh.' },
          ].map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <button onClick={() => setOpenFear(openFear === f.name ? null : f.name)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                <div className="flex items-center gap-3">
                  <span className="text-xl" dangerouslySetInnerHTML={{ __html: f.icon }} />
                  <p className="text-sm font-extrabold text-blue-400">{f.name}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openFear === f.name ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openFear === f.name && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="px-4 pb-4 pt-2 space-y-2">
                      <p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: f.desc }} />
                      <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/15"><p className="text-xs font-bold text-red-400 mb-1">&#9888;&#65039; Impact on Trading</p><p className="text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: f.impact }} /></div>
                      <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/15"><p className="text-xs font-bold text-green-400 mb-1">&#128138; Antidote</p><p className="text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: f.antidote }} /></div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 03 — GREED DEEP DIVE */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; Greed Dissected</p>
          <h2 className="text-2xl font-extrabold mb-2">The Four Faces of Greed</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">Greed isn&apos;t always obvious. Sometimes it disguises itself as &quot;ambition&quot; or &quot;confidence.&quot; Here are its four masks.</p>
        </motion.div>
        <div className="space-y-3">
          {[
            { name: 'The TP Remover', icon: '&#127919;', desc: 'Your trade hits +40 of a planned +50. Greed says &quot;remove the TP &mdash; this could be +200.&quot; So you remove it. Price reverses. You close at +5, or worse, at a loss.', cost: 'Over 100 trades, removing TPs on winners turns a +2.5R average win into a +1.2R average win. Your whole edge evaporates.', fix: 'Your TP was calculated from structure, not emotion. It exists because that&apos;s where the edge ends. A hit TP is a CELEBRATION, not a regret.' },
            { name: 'The Size Inflator', icon: '&#128200;', desc: 'After three wins you feel invincible. So you double your position size on the fourth trade. It loses. One oversized loss wipes out three normal wins.', cost: 'One 2x-sized loss at -1R (-2% instead of -1%) erases 2 normal wins. Three normal wins (+3%) minus one oversized loss (-2%) = only +1%. Without the size increase, it would have been +2%.', fix: 'Position size is a RULE, not a feeling. Same size every trade, regardless of recent results. Your edge works over hundreds of trades at consistent size.' },
            { name: 'The Hope Holder', icon: '&#128591;', desc: 'Your short trade is -40 pips underwater. Your stop was at -25 but you moved it. Then removed it. Now you&apos;re &quot;hoping&quot; for a reversal. This is greed disguised as hope.', cost: 'What should have been a -1R loss becomes -3R, -5R, potentially account-ending. One &quot;hope trade&quot; can erase a month of disciplined gains.', fix: 'Stops are NON-NEGOTIABLE. Once placed, they do not move away from price. Ever. If your thesis is invalidated, close the trade. Hope is not a strategy.' },
            { name: 'The Overtrader', icon: '&#9889;', desc: 'You&apos;ve hit your daily trade limit but you keep scanning for setups. &quot;Just one more.&quot; Greed for activity. Greed for more wins. Greed for the feeling of being &quot;in the game.&quot;', cost: 'Extra trades dilute your edge. Your best setups (the ones in your plan) get buried under mediocre impulse trades. Commissions and spreads compound.', fix: 'When your limit is hit, close the charts. Physically walk away. The market will exist tomorrow. Your remaining capital might not if you overtrade today.' },
          ].map((g, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <button onClick={() => setOpenGreed(openGreed === g.name ? null : g.name)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                <div className="flex items-center gap-3">
                  <span className="text-xl" dangerouslySetInnerHTML={{ __html: g.icon }} />
                  <p className="text-sm font-extrabold text-yellow-400">{g.name}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openGreed === g.name ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openGreed === g.name && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="px-4 pb-4 pt-2 space-y-2">
                      <p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: g.desc }} />
                      <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/15"><p className="text-xs font-bold text-red-400 mb-1">&#128176; What It Costs You</p><p className="text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: g.cost }} /></div>
                      <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/15"><p className="text-xs font-bold text-green-400 mb-1">&#128138; The Fix</p><p className="text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: g.fix }} /></div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 04 — THE SPECTRUM */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The Spectrum</p>
          <h2 className="text-2xl font-extrabold mb-4">Where Are You Right Now?</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">Fear and greed exist on a spectrum. The goal is not to eliminate them &mdash; it&apos;s to stay in the <strong className="text-green-400">green zone</strong>.</p>
          <FearGreedMeterAnimation />
          <div className="mt-6 space-y-3">
            {[
              { zone: 'Extreme Fear', color: 'text-blue-400', border: 'border-blue-500/20 bg-blue-500/5', signs: 'Can&apos;t pull the trigger on valid setups. Close trades at +2 pips. Feel physically ill when a trade goes 1 pip against you. Haven&apos;t traded in 3 days despite multiple valid signals.', result: 'You miss the profitable trades your strategy is designed to capture. Win rate drops because you only take &quot;sure things&quot; (which don&apos;t exist).' },
              { zone: 'Healthy Fear', color: 'text-blue-300', border: 'border-blue-400/20 bg-blue-400/5', signs: 'You respect risk. You always use a stop. You calculate position size carefully. You feel mild discomfort but execute anyway.', result: 'This is GOOD fear. It keeps you humble and protects your capital. Don&apos;t try to eliminate this &mdash; embrace it.' },
              { zone: 'Neutral / Disciplined', color: 'text-green-400', border: 'border-green-500/20 bg-green-500/5', signs: 'You follow your plan mechanically. Wins and losses both feel the same &mdash; &quot;the plan executed.&quot; You&apos;re emotionally flat during trading.', result: 'THE TARGET ZONE. Professional traders operate here most of the time. Decisions come from the plan, not from feelings.' },
              { zone: 'Healthy Ambition', color: 'text-yellow-300', border: 'border-yellow-400/20 bg-yellow-400/5', signs: 'You&apos;re motivated to improve. You review your journal. You want to find edge. But you don&apos;t chase or oversize.', result: 'This is GOOD drive. It pushes you to optimise without breaking rules. Channel this into journal analysis, not position sizing.' },
              { zone: 'Extreme Greed', color: 'text-red-400', border: 'border-red-500/20 bg-red-500/5', signs: 'You&apos;ve removed your TP. You&apos;re trading 8 times a day. You just doubled your size after a winning streak. You&apos;re planning what you&apos;ll buy with next month&apos;s &quot;guaranteed&quot; profits.', result: 'Account destruction incoming. One oversized loss will erase weeks of gains. This is the most dangerous state in trading.' },
            ].map((z, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <button onClick={() => setOpenSpectrum(openSpectrum === z.zone ? null : z.zone)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <p className={`text-sm font-extrabold ${z.color}`}>{z.zone}</p>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSpectrum === z.zone ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openSpectrum === z.zone && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4 pt-2 space-y-2">
                        <div className={`p-3 rounded-lg border ${z.border}`}><p className="text-xs font-bold text-gray-300 mb-1">&#128269; Signs You&apos;re Here</p><p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: z.signs }} /></div>
                        <p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: `<strong class="text-white">Result:</strong> ${z.result}` }} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* SECTION 05 — INTERACTIVE SCENARIO SIMULATOR */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Experience It</p>
          <h2 className="text-2xl font-extrabold mb-2">Live Scenario Simulator</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">Walk through real trade scenarios. At each stage, hear what fear says, what greed says, and learn what the plan says.</p>
        </motion.div>
        <div className="p-5 rounded-2xl glass-card">
          <div className="flex gap-2 mb-4">
            {scenarios.map((s, i) => (
              <button key={i} onClick={() => { setSimIndex(i); setSimStage(0); setSimChoice(null); }} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${simIndex === i ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'glass text-gray-500 hover:text-gray-300'}`}>{s.title}</button>
            ))}
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-gray-700/30 mb-4">
            <p className="text-xs text-gray-500 font-bold mb-2">SETUP</p>
            <p className="text-sm text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: currentSim.setup }} />
          </div>
          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 mb-4">
            <p className="text-xs text-amber-400 font-bold mb-1">Stage {simStage + 1}: Price at {currentStage.price}</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-3" dangerouslySetInnerHTML={{ __html: currentStage.emotion }} />
            <div className="grid grid-cols-1 gap-2">
              <button onClick={() => setSimChoice('fear')} className={`p-3 rounded-xl border text-left text-sm transition-all ${simChoice === 'fear' ? (simChoice === currentStage.correct ? 'bg-green-500/15 border-green-500/30 text-green-400' : 'bg-red-500/15 border-red-500/30 text-red-400') : 'border-blue-500/20 bg-blue-500/5 text-blue-300 hover:bg-blue-500/10'}`}>
                <span className="text-xs font-bold text-blue-400">FEAR says: </span><span dangerouslySetInnerHTML={{ __html: currentStage.fearSays }} />
              </button>
              <button onClick={() => setSimChoice('greed')} className={`p-3 rounded-xl border text-left text-sm transition-all ${simChoice === 'greed' ? (simChoice === currentStage.correct ? 'bg-green-500/15 border-green-500/30 text-green-400' : 'bg-red-500/15 border-red-500/30 text-red-400') : 'border-yellow-500/20 bg-yellow-500/5 text-yellow-300 hover:bg-yellow-500/10'}`}>
                <span className="text-xs font-bold text-yellow-400">GREED says: </span><span dangerouslySetInnerHTML={{ __html: currentStage.greedSays }} />
              </button>
              <button onClick={() => setSimChoice('plan')} className={`p-3 rounded-xl border text-left text-sm transition-all ${simChoice === 'plan' ? (simChoice === currentStage.correct ? 'bg-green-500/15 border-green-500/30 text-green-400' : 'bg-red-500/15 border-red-500/30 text-red-400') : 'border-green-500/20 bg-green-500/5 text-green-300 hover:bg-green-500/10'}`}>
                <span className="text-xs font-bold text-green-400">THE PLAN says: </span>Follow your pre-set rules. No changes.
              </button>
            </div>
          </div>
          {simChoice && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15 text-sm text-gray-400 leading-relaxed mb-3">
                <span className="text-amber-400 font-bold">{simChoice === currentStage.correct ? '&#9989; Correct!' : '&#10060; Think again.'} </span>
                <span dangerouslySetInnerHTML={{ __html: currentStage.correctText }} />
              </div>
              {simStage < currentSim.stages.length - 1 ? (
                <button onClick={() => { setSimStage(s => s + 1); setSimChoice(null); }} className="w-full p-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all">Next Stage &rarr;</button>
              ) : simIndex < scenarios.length - 1 ? (
                <button onClick={() => { setSimIndex(i => i + 1); setSimStage(0); setSimChoice(null); }} className="w-full p-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all">Next Scenario &rarr;</button>
              ) : (
                <p className="text-xs text-green-400 text-center font-bold">&#9989; All scenarios complete!</p>
              )}
            </motion.div>
          )}
        </div>
      </section>

      {/* SECTION 06 — THE TOOLKIT */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Your Defence Toolkit</p>
          <h2 className="text-2xl font-extrabold mb-2">Five Weapons Against Fear &amp; Greed</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">You can&apos;t eliminate emotions. But you can build systems that operate regardless of how you feel.</p>
        </motion.div>
        <div className="space-y-3">
          {[
            { tool: 'Pre-Trade Checklist', icon: '&#9745;&#65039;', desc: 'Write down EVERY entry condition before you look at a chart. When the setup appears, check the boxes. If all boxes are checked, enter. If not, skip. No grey areas. No &quot;gut feelings.&quot;', when: 'Before EVERY trade. The checklist is your emotional firewall.' },
            { tool: 'The 10-Second Rule', icon: '&#9203;', desc: 'When you feel the urge to do ANYTHING impulsive (close a winner, chase a move, increase size), wait 10 seconds. Count them. Ask: &quot;Is this my plan, or my emotion?&quot; If it&apos;s emotion, don&apos;t do it.', when: 'During any emotional spike. The 10 seconds create a gap between impulse and action.' },
            { tool: 'Post-Trade Emotion Rating', icon: '&#128200;', desc: 'After every trade, rate your emotional state from 1 (terrified/panicking) to 5 (calm/disciplined). Track this alongside your P&amp;L. After 30 trades, you&apos;ll see the pattern: low-emotion trades are more profitable.', when: 'After EVERY trade. This data is more valuable than any indicator.' },
            { tool: 'Circuit Breaker', icon: '&#128721;', desc: 'A pre-set rule: after 2 consecutive losses OR after hitting your daily loss limit, close all charts for a minimum of 2 hours. Non-negotiable. Even if the &quot;perfect&quot; setup appears.', when: 'After consecutive losses or hitting your loss limit. Prevents revenge spirals.' },
            { tool: 'Written Trading Plan', icon: '&#128221;', desc: 'Your strategy exists ON PAPER, not in your head. Entry criteria, exit rules, position size formula, max trades per day, circuit breaker rules &mdash; all written. When emotion hits, you READ the plan instead of &quot;feeling&quot; your way through.', when: 'ALWAYS. The plan is your anchor. Without it, you&apos;re trading on emotion by default.' },
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
                    <div className="px-4 pb-4 pt-2 space-y-2">
                      <p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: t.desc }} />
                      <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/15"><p className="text-xs font-bold text-amber-400 mb-1">&#128338; When to Use</p><p className="text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: t.when }} /></div>
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
          <h2 className="text-2xl font-extrabold mb-4">Fear &amp; Greed Traps</h2>
        </motion.div>
        <div className="space-y-3">
          {[
            { mistake: 'Trying to &quot;feel nothing&quot;', wrong: 'Suppressing all emotions and trading like a robot. This always fails eventually &mdash; emotions don&apos;t disappear, they just explode later.', right: 'Acknowledge the emotion, name it (&quot;that&apos;s fear&quot;), and follow your plan anyway. Feeling fear while executing is the definition of discipline.', tip: 'The goal is not to be emotionless. The goal is to have rules that work DESPITE emotions.' },
            { mistake: 'Using mental stops instead of real stops', wrong: '&quot;I&apos;ll close at -30 pips if it gets there.&quot; But when it hits -30, you &quot;give it a bit more room.&quot; Mental stops are a promise to your future emotional self &mdash; and that person ALWAYS breaks promises.', right: 'Hard stops in the platform. Set it, forget it. If price hits it, the platform closes automatically. No emotional override possible.', tip: 'If you use mental stops, you don&apos;t use stops. Your broker has a stop loss feature for a reason &mdash; use it.' },
            { mistake: 'Checking P&amp;L every 30 seconds', wrong: 'Watching every tick makes your emotional brain louder. Each pip against you triggers fear. Each pip in your favour triggers greed. You end up micromanaging what should be a set-and-forget trade.', right: 'Set alerts at your stop and target. Close the chart. Check back at your alert or at a pre-set time (e.g. every 30 minutes, not every 30 seconds).', tip: 'Staring at the chart doesn&apos;t make price move in your direction. It only makes you more likely to interfere with a good trade.' },
            { mistake: 'Moving take profit &quot;just this once&quot;', wrong: 'Your trade is +45 of +50 target. &quot;But it&apos;s moving so well!&quot; You remove the TP. Price reverses. You close at +10 instead of +50. Over 50 trades, this destroys your R:R.', right: 'If you genuinely believe the trade has more room, use a trailing stop to lock in profit while letting it run. Never just remove the TP and hope.', tip: 'The phrase &quot;just this once&quot; is the most dangerous phrase in trading. It&apos;s never just once.' },
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

      {/* SECTION 08 — THE MATH OF FEAR */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; The Maths of Fear &amp; Greed</p>
          <h2 className="text-2xl font-extrabold mb-2">Why Small Changes Destroy Your Edge</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">Let&apos;s prove mathematically why cutting winners and holding losers destroys profitability.</p>
          <div className="space-y-4">
            <div className="p-5 rounded-xl border border-green-500/20 bg-green-500/5">
              <p className="text-xs font-bold text-green-400 mb-3">&#9989; WITH DISCIPLINE (Following the Plan)</p>
              <p className="text-sm text-gray-400 leading-relaxed">Win rate: 48% &middot; Average win: +2.5R &middot; Average loss: -1R</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-1">Per 100 trades: 48 wins &times; 2.5R = <strong className="text-green-400">+120R</strong></p>
              <p className="text-sm text-gray-400 leading-relaxed">52 losses &times; 1R = <strong className="text-red-400">-52R</strong></p>
              <p className="text-sm font-bold text-green-400 mt-2">Net: +68R per 100 trades &#9989;</p>
            </div>
            <div className="p-5 rounded-xl border border-red-500/20 bg-red-500/5">
              <p className="text-xs font-bold text-red-400 mb-3">&#10060; WITH FEAR &amp; GREED (Cutting Winners, Holding Losers)</p>
              <p className="text-sm text-gray-400 leading-relaxed">Win rate: 48% &middot; Average win: +1.2R (fear cuts early) &middot; Average loss: -1.8R (greed holds too long)</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-1">Per 100 trades: 48 wins &times; 1.2R = <strong className="text-green-400">+57.6R</strong></p>
              <p className="text-sm text-gray-400 leading-relaxed">52 losses &times; 1.8R = <strong className="text-red-400">-93.6R</strong></p>
              <p className="text-sm font-bold text-red-400 mt-2">Net: -36R per 100 trades &#10060;</p>
            </div>
            <div className="p-4 rounded-xl glass-card">
              <p className="text-sm text-amber-400 font-bold mb-2">Same strategy. Same win rate. Different psychology.</p>
              <p className="text-sm text-gray-400 leading-relaxed">One trader is +68R. The other is -36R. The ONLY difference is that fear reduced the average win from 2.5R to 1.2R, and greed increased the average loss from 1R to 1.8R. That&apos;s a <strong className="text-white">104R swing</strong> &mdash; purely from psychology.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 09 — GAME */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Fear vs Greed Challenge</p>
          <h2 className="text-2xl font-extrabold mb-2">Find the Balance</h2>
          <p className="text-sm text-gray-400 mb-6">Five scenarios. Choose the disciplined response between fear and greed.</p>
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
            <p className="text-sm text-gray-400">{gameScore === 5 ? '&#9878;&#65039; Perfect balance. Fear and greed have no power over you.' : gameScore >= 3 ? 'Good awareness. Review the spectrum &mdash; you know where the traps are.' : 'Fear or greed is still pulling you. Re-read the four faces of each.'}</p>
          </motion.div>
        )}
      </section>

      {/* SECTION 10 — QUIZ */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Knowledge Check</p>
          <h2 className="text-2xl font-extrabold mb-6">Fear &amp; Greed Quiz</h2>
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
        {quizDone && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 text-center p-8 glass-card rounded-2xl"><p className={`text-5xl font-extrabold mb-2 ${score >= 66 ? 'text-amber-400' : 'text-red-400'}`}>{score}%</p><p className="text-sm text-gray-400">{score === 100 ? '&#9878;&#65039; Perfect. You understand the twin killers completely.' : score >= 66 ? 'Strong awareness. The tug of war is tipping in your favour.' : 'Review fear and greed&apos;s four faces. Know your enemy.'}</p></motion.div>)}
      </section>

      {/* Certificate */}
      <section className="px-5 py-16 text-center">
        {!certUnlocked ? (
          <div className="max-w-md mx-auto p-8 glass rounded-2xl"><p className="text-4xl mb-3 opacity-30">&#128274;</p><p className="text-sm text-gray-500">Score 66%+ to unlock your <strong className="text-amber-400">Pro Certificate</strong></p></div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, type: 'spring' }}
            className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(59,130,246,0.06),transparent,rgba(234,179,8,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
            <div className="absolute inset-[1px] rounded-3xl border border-amber-500/10" />
            <div className="relative z-10">
              <div className="w-[80px] h-[80px] mx-auto mb-5 rounded-full bg-gradient-to-br from-blue-500 via-amber-500 to-yellow-500 flex items-center justify-center text-4xl shadow-lg shadow-amber-500/20">&#9878;&#65039;</div>
              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest mb-2">Pro Certificate</p>
              <h3 className="text-xl font-extrabold mb-1">Certificate of Mastery</h3>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">Has mastered<br /><strong className="text-white">Level 4.2: Fear &amp; Greed &mdash; The Twin Killers</strong><br />at ATLAS Academy by Interakktive</p>
              <p className="bg-gradient-to-r from-blue-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent font-bold text-lg mb-1" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Balance Master &mdash;</p>
              <p className="font-mono text-[11px] text-gray-500 mb-4">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L4.2-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
            </div>
          </motion.div>
        )}
      </section>

      <section className="text-center px-5 pt-10 pb-24">
        <p className="text-xs tracking-widest uppercase text-gray-600 mb-4">Up Next</p>
        <h2 className="text-xl font-bold mb-6">Lesson 4.3 &mdash; FOMO &mdash; The Trade You Should Never Take</h2>
        <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">
          Continue <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
