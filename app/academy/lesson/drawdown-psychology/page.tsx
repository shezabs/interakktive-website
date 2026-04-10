// app/academy/lesson/drawdown-psychology/page.tsx
// ATLAS Academy — Lesson 4.11: Drawdown Psychology [PRO]
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
// DRAWDOWN CURVE ANIMATION — Equity entering drawdown with stages
// ============================================================
function DrawdownCurveAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);
    const padL = 40;
    const padR = 20;
    const padT = 30;
    const padB = 40;
    const chartW = w - padL - padR;
    const chartH = h - padT - padB;

    // Equity curve data: rise then drawdown then partial recovery
    const points = [
      0, 2, 3, 5, 4, 7, 8, 10, 11, 12, 13, 12, 14, // up phase
      13, 11, 10, 8, 7, 5, 4, 3, 2, 3, // drawdown
      4, 5, 6, 7, 6, 8, 9, // recovery
    ];
    const maxVal = 15;
    const drawProgress = Math.min((f * 0.5) / points.length, 1);
    const visibleCount = Math.floor(drawProgress * points.length);

    // Grid
    ctx.strokeStyle = 'rgba(148,163,184,0.06)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      const y = padT + (i / 4) * chartH;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(w - padR, y);
      ctx.stroke();
    }

    // Peak line
    const peakIdx = 12;
    const peakY = padT + (1 - points[peakIdx] / maxVal) * chartH;
    ctx.strokeStyle = 'rgba(34,197,94,0.15)';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(padL, peakY);
    ctx.lineTo(w - padR, peakY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = '7px system-ui';
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(34,197,94,0.3)';
    ctx.fillText('Peak', padL - 5, peakY + 3);

    // Trough line
    const troughIdx = 21;
    if (visibleCount > troughIdx) {
      const troughY = padT + (1 - points[troughIdx] / maxVal) * chartH;
      ctx.strokeStyle = 'rgba(239,68,68,0.15)';
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(padL, troughY);
      ctx.lineTo(w - padR, troughY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(239,68,68,0.3)';
      ctx.fillText('Trough', padL - 5, troughY + 3);

      // Drawdown bracket
      const bracketX = w - padR - 15;
      ctx.strokeStyle = 'rgba(239,68,68,0.2)';
      ctx.lineWidth = 1;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(bracketX, peakY);
      ctx.lineTo(bracketX + 8, peakY);
      ctx.lineTo(bracketX + 8, troughY);
      ctx.lineTo(bracketX, troughY);
      ctx.stroke();
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(239,68,68,0.5)';
      ctx.fillText('DRAWDOWN', bracketX + 8, (peakY + troughY) / 2 + 3);
    }

    // Draw equity curve
    ctx.beginPath();
    for (let i = 0; i < visibleCount; i++) {
      const x = padL + (i / (points.length - 1)) * chartW;
      const y = padT + (1 - points[i] / maxVal) * chartH;
      const isDrawdown = i > peakIdx && i <= troughIdx;
      if (i === 0) { ctx.moveTo(x, y); }
      else { ctx.lineTo(x, y); }
    }
    // Two-tone: green before peak, red in drawdown, blue recovery
    if (visibleCount > 0) {
      ctx.strokeStyle = visibleCount <= peakIdx + 1 ? 'rgba(34,197,94,0.6)' : visibleCount <= troughIdx + 1 ? 'rgba(239,68,68,0.5)' : 'rgba(59,130,246,0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Emotional stage labels
    const stages = [
      { idx: 14, label: 'Denial', color: 'rgba(234,179,8,0.4)' },
      { idx: 17, label: 'Frustration', color: 'rgba(239,68,68,0.4)' },
      { idx: 19, label: 'Panic', color: 'rgba(239,68,68,0.5)' },
      { idx: 21, label: 'Capitulation', color: 'rgba(239,68,68,0.6)' },
      { idx: 25, label: 'Acceptance', color: 'rgba(59,130,246,0.5)' },
      { idx: 29, label: 'Recovery', color: 'rgba(34,197,94,0.5)' },
    ];
    stages.forEach(s => {
      if (visibleCount > s.idx) {
        const x = padL + (s.idx / (points.length - 1)) * chartW;
        const y = padT + (1 - points[s.idx] / maxVal) * chartH;
        ctx.font = 'bold 7px system-ui';
        ctx.textAlign = 'center';
        ctx.fillStyle = s.color;
        ctx.fillText(s.label, x, y - 10);
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// RECOVERY MATH ANIMATION — Exponential recovery required
// ============================================================
function RecoveryMathAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);
    const midX = w / 2;
    const padT = 35;
    const padB = 25;
    const barH = h - padT - padB;

    const data = [
      { loss: 5, recovery: 5.3, color: '#22c55e' },
      { loss: 10, recovery: 11.1, color: '#22c55e' },
      { loss: 20, recovery: 25, color: '#eab308' },
      { loss: 30, recovery: 42.9, color: '#eab308' },
      { loss: 40, recovery: 66.7, color: '#ef4444' },
      { loss: 50, recovery: 100, color: '#ef4444' },
      { loss: 70, recovery: 233, color: '#dc2626' },
      { loss: 90, recovery: 900, color: '#dc2626' },
    ];

    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(239,68,68,0.4)';
    ctx.fillText('LOSS %', midX / 2, 18);
    ctx.fillStyle = 'rgba(34,197,94,0.4)';
    ctx.fillText('GAIN NEEDED TO RECOVER', midX + midX / 2, 18);

    const rowH = barH / data.length;
    const maxRec = 233; // cap visual at 233 for readability

    data.forEach((d, i) => {
      const y = padT + i * rowH;
      const animDelay = i * 8;
      const progress = Math.min(Math.max((f - animDelay) / 40, 0), 1);

      // Loss bar (left, red)
      const lossW = (d.loss / 100) * (midX - 40);
      ctx.fillStyle = `rgba(239,68,68,${0.15 * progress})`;
      ctx.beginPath();
      ctx.roundRect(midX - 10 - lossW * progress, y + 4, lossW * progress, rowH - 8, 4);
      ctx.fill();

      // Loss label
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'right';
      ctx.fillStyle = `rgba(239,68,68,${0.6 * progress})`;
      ctx.fillText(`-${d.loss}%`, midX - 15 - lossW * progress, y + rowH / 2 + 3);

      // Recovery bar (right, green/yellow/red)
      const recW = (Math.min(d.recovery, maxRec) / maxRec) * (midX - 40);
      const r = parseInt(d.color.slice(1, 3), 16);
      const g = parseInt(d.color.slice(3, 5), 16);
      const b = parseInt(d.color.slice(5, 7), 16);
      ctx.fillStyle = `rgba(${r},${g},${b},${0.15 * progress})`;
      ctx.beginPath();
      ctx.roundRect(midX + 10, y + 4, recW * progress, rowH - 8, 4);
      ctx.fill();

      // Recovery label
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'left';
      ctx.fillStyle = `rgba(${r},${g},${b},${0.6 * progress})`;
      const label = d.recovery >= 900 ? '+900%!' : `+${d.recovery}%`;
      ctx.fillText(label, midX + 15 + recW * progress, y + rowH / 2 + 3);
    });

    // Centre divider
    ctx.strokeStyle = 'rgba(148,163,184,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(midX, padT);
    ctx.lineTo(midX, h - padB);
    ctx.stroke();
  }, []);
  return <AnimScene drawFn={draw} height={300} />;
}

// ============================================================
// DATA
// ============================================================
const drawdownStages = [
  { stage: 'Denial', emoji: '&#129300;', range: '-1% to -3%', desc: '&ldquo;This is just a rough patch. My strategy is fine.&rdquo; You keep trading exactly the same. You don&apos;t adjust, don&apos;t review, don&apos;t acknowledge there&apos;s a problem. This is normal for the first few days of a drawdown.', danger: 'You miss the early warning signs. Small adjustments here could prevent the drawdown from deepening.' },
  { stage: 'Frustration', emoji: '&#128545;', range: '-3% to -6%', desc: '&ldquo;What is WRONG with this market? Every setup is failing.&rdquo; You start blaming external factors: the broker, the news, market manipulation. Your journal entries (if you&apos;re still writing them) become shorter and angrier.', danger: 'Frustration triggers revenge trading. You start forcing trades to &ldquo;get back&rdquo; what you lost. This accelerates the drawdown.' },
  { stage: 'Panic', emoji: '&#128561;', range: '-6% to -10%', desc: '&ldquo;I&apos;m going to blow this account. Maybe trading isn&apos;t for me.&rdquo; Sleep suffers. You check your balance multiple times a day. You start thinking in money, not R. Every pip feels personal.', danger: 'Decision quality collapses. You might abandon your strategy entirely, switch to something new, or increase size to &ldquo;make it back faster.&rdquo;' },
  { stage: 'Capitulation', emoji: '&#128557;', range: '-10% to -15%+', desc: '&ldquo;I quit. I&apos;m done. I&apos;m withdrawing what&apos;s left.&rdquo; The lowest point. You want to walk away from trading forever. If this is a prop firm account, you might deliberately blow it just to end the pain.', danger: 'The worst decisions happen here. Quitting permanently, blowing the remaining capital on reckless trades, or withdrawing during the deepest point of the drawdown.' },
  { stage: 'Acceptance', emoji: '&#129502;', range: 'Post-trough', desc: '&ldquo;Drawdowns are part of the game. My process is intact. The maths will work over time.&rdquo; You stop checking P&amp;L obsessively. You re-read your journal, identify what went wrong, and reduce size. The healing begins.', danger: 'None &mdash; this is the TARGET. Getting here faster is the entire point of this lesson.' },
  { stage: 'Recovery', emoji: '&#128200;', range: 'Building back', desc: 'Reduced size, strict process, one trade at a time. You&apos;re not trying to &ldquo;get it all back.&rdquo; You&apos;re rebuilding trust in your system by executing flawlessly at reduced risk. Equity curve slowly turns upward.', danger: 'The temptation to increase size prematurely. Recovery at 0.5R takes twice as long but is 10x safer.' },
];

const recoveryTable = [
  { loss: 5, recovery: 5.3, money: '£10,000 → £9,500', back: '£9,500 → £10,003' },
  { loss: 10, recovery: 11.1, money: '£10,000 → £9,000', back: '£9,000 → £9,999' },
  { loss: 20, recovery: 25.0, money: '£10,000 → £8,000', back: '£8,000 → £10,000' },
  { loss: 30, recovery: 42.9, money: '£10,000 → £7,000', back: '£7,000 → £10,003' },
  { loss: 50, recovery: 100.0, money: '£10,000 → £5,000', back: '£5,000 → £10,000' },
  { loss: 70, recovery: 233.3, money: '£10,000 → £3,000', back: '£3,000 → £9,999' },
  { loss: 90, recovery: 900.0, money: '£10,000 → £1,000', back: '£1,000 → £10,000' },
];

const survivalRules = [
  { rule: 'Reduce size immediately', desc: 'At -5% drawdown: reduce to 0.75R. At -8%: reduce to 0.5R. At -10%: reduce to 0.25R. Smaller size means each loss hurts less, slowing the drawdown and giving your system time to recover.', emoji: '&#128201;' },
  { rule: 'Stop thinking in money', desc: 'Switch to R and percentages. &ldquo;I lost £500&rdquo; creates panic. &ldquo;I lost 1R&rdquo; creates perspective. If you can&apos;t stop seeing money, hide your account balance.', emoji: '&#128176;' },
  { rule: 'Review your last 20 trades', desc: 'Are you still following the plan? If 15+ out of 20 followed process, the drawdown is variance. If fewer than 15, the drawdown is YOU &mdash; and the fix is discipline, not a new strategy.', emoji: '&#128218;' },
  { rule: 'Set a maximum drawdown circuit breaker', desc: 'If you reach -10%, you stop live trading for 1 week. Review journal, backtest, demo trade. Return at 0.5R size. This prevents -10% from becoming -30%.', emoji: '&#128680;' },
  { rule: 'Talk to someone', desc: 'Another trader, a mentor, a trading community. Drawdowns in isolation breed destructive thinking. Even just verbalising &ldquo;I&apos;m down 8% and feeling frustrated&rdquo; reduces the emotional intensity.', emoji: '&#128172;' },
];

const myths = [
  { myth: '&ldquo;Professional traders don&apos;t have drawdowns&rdquo;', reality: 'Every professional trader has drawdowns. Hedge funds budget for 10&ndash;15% drawdowns annually. Renaissance Technologies, the most successful fund in history, has had multiple 10%+ drawdowns. The difference: professionals have a PLAN for drawdowns.' },
  { myth: '&ldquo;The best response to a drawdown is to trade more to recover faster&rdquo;', reality: 'The best response is to trade LESS. Reduce size, tighten criteria, slow down. Trading more during a drawdown is like an injured athlete training harder &mdash; it makes the injury worse.' },
  { myth: '&ldquo;If I&apos;m in drawdown, my strategy is broken&rdquo;', reality: 'A drawdown of 5&ndash;10% with high process compliance is EXPECTED with any legitimate strategy. A 48% win rate strategy will routinely produce 5&ndash;8 loss streaks. That&apos;s maths, not a broken system.' },
  { myth: '&ldquo;I should switch strategies when the drawdown hits 5%&rdquo;', reality: 'Switching strategies during a drawdown resets your learning curve and introduces new, untested risk. If your process grade is 85%+, the strategy isn&apos;t the problem &mdash; variance is. Stay the course.' },
];

const mistakes = [
  { wrong: 'Increasing position size to recover faster', right: 'Decrease size. If you double size to recover, one more loss doubles your drawdown speed. The maths is brutally simple: bigger size in drawdown = faster death.', emoji: '&#128200;' },
  { wrong: 'Switching to a new strategy mid-drawdown', right: 'Your current strategy produced profits before the drawdown. The drawdown is temporary variance unless your process grade has collapsed. New strategy = new learning curve = more losses.', emoji: '&#128260;' },
  { wrong: 'Hiding the drawdown from your journal', right: 'Drawdowns are the MOST important periods to journal. Every entry, every emotion, every decision. This data prevents the next drawdown from being as severe.', emoji: '&#128214;' },
  { wrong: 'Setting recovery targets (&ldquo;I need +5% this week&rdquo;)', right: 'Process targets, not P&amp;L targets. &ldquo;I will follow my plan on every trade this week.&rdquo; Recovery happens as a byproduct of process compliance, not as a goal.', emoji: '&#127919;' },
];

const gameScenarios = [
  { scenario: 'You&apos;re down -6% this week after 8 losing trades. Your process grade on those 8 trades: 87% (7 out of 8 followed the plan). A friend says: &ldquo;Your strategy is clearly broken, try mine.&rdquo; What do you do?', options: ['Switch strategies &mdash; 8 losses in a row means something is wrong', 'Stay the course. 87% process compliance means this is variance, not a broken system. Reduce size to 0.5R and continue.', 'Take a break from trading for a month'], correct: 1, explain: '87% process compliance + drawdown = normal variance. Your strategy produced these losses WITHIN your plan. Switching strategies resets your edge to zero. Reduce size to slow the drawdown and let probability normalise.' },
  { scenario: 'Your account is at -10%. You feel physically sick checking the balance. You notice you&apos;re checking your phone every 20 minutes to see if the market moved. What should you do FIRST?', options: ['Take the next A+ setup to start recovering', 'Activate your circuit breaker: stop live trading for 1 week. Review journal. Backtest. Return at 0.25R.', 'Withdraw the remaining capital to prevent further loss'], correct: 1, explain: 'At -10%, your emotional state is compromised. The circuit breaker forces a cooling period. One week of review, backtesting, and mental reset is worth more than 5 trades taken in panic.' },
  { scenario: 'You&apos;re down -7% and decide to reduce your position size from 1R to 0.5R. Your next 3 trades are all winners (+1.5R at half size = +0.75R each = +2.25R). You think: &ldquo;I should go back to 1R to recover faster.&rdquo;', options: ['Go back to 1R &mdash; the losing streak is over and you&apos;re ready', 'Stay at 0.5R until you&apos;ve recovered to -3% or better. The size increase has a rule: only after sustained recovery, not after 3 wins.', 'Go to 1.5R to accelerate recovery even more'], correct: 1, explain: 'Three wins doesn&apos;t end a drawdown. The reduced size rule has a threshold for re-escalation (e.g., -3% or better). Jumping back to full size after a mini-streak is exactly how drawdowns deepen on the next loss.' },
  { scenario: 'It&apos;s Friday afternoon. You&apos;re at -4.8% for the week. Your weekly loss limit is -5%. One more loss and you&apos;re done for the week. An A+ setup appears on EUR/USD. What do you do?', options: ['Take it &mdash; A+ setups are rare and this could be the recovery trade', 'Check: if this trade loses, I hit -5.8% which breaks my weekly limit. The responsible choice is to sit out and start fresh Monday.', 'Take it at 0.25R to stay within the limit even if it loses'], correct: 2, explain: 'Option C is the best answer here. It respects the weekly limit (a -0.25R loss puts you at -5.05%, barely over) while not wasting a genuine A+ setup. Option B is also acceptable. Option A ignores risk management.' },
  { scenario: 'You&apos;ve been in a -12% drawdown for 3 weeks. You took a 1-week break, backtested, confirmed the edge, and returned at 0.25R. After 2 weeks of recovery, you&apos;re at -8%. You feel impatient &mdash; at 0.25R it will take months to recover. What do you think?', options: ['Increase to 1R &mdash; the edge is confirmed and the recovery is too slow', 'Increase to 0.5R &mdash; you&apos;ve earned a step up. The next threshold is -5%, where you can go back to 0.75R.', 'Stay at 0.25R until fully recovered to 0%'], correct: 1, explain: 'A graduated re-escalation is the professional approach: 0.25R → 0.5R → 0.75R → 1R as recovery milestones are hit. Jumping straight to 1R from -8% is reckless. But 0.25R forever stalls recovery. Step up gradually.' },
];

const quizQuestions = [
  { q: 'What is the first emotional stage most traders experience in a drawdown?', opts: ['Panic', 'Acceptance', 'Denial', 'Frustration'], a: 2, explain: 'Denial is the first stage: &ldquo;This is just a rough patch, my strategy is fine.&rdquo; The trader doesn&apos;t adjust, doesn&apos;t review, and misses early warning signs.' },
  { q: 'To recover from a 50% drawdown, how much gain is needed?', opts: ['50%', '75%', '100%', '150%'], a: 2, explain: 'A 50% loss requires a 100% gain to recover. £10,000 → £5,000 requires doubling back to £10,000. This is why preventing deep drawdowns is exponentially more important than recovering from them.' },
  { q: 'What should you do to position size when you enter a drawdown?', opts: ['Increase it to recover faster', 'Keep it the same &mdash; don&apos;t let the drawdown change your plan', 'Reduce it progressively (-5% → 0.75R, -8% → 0.5R, -10% → 0.25R)', 'Stop trading entirely'], a: 2, explain: 'Progressive size reduction slows the drawdown. Each loss hurts less, giving your system time to recover. Increasing size is the #1 mistake traders make in drawdowns.' },
  { q: 'Your process grade is 90% but you&apos;re in a -7% drawdown. This means:', opts: ['Your strategy is broken and needs changing', 'This is normal variance &mdash; high process compliance + drawdown = the maths playing out', 'You should switch to demo trading', 'Your process grade calculation is wrong'], a: 1, explain: '90% process compliance + drawdown = variance. Your strategy will produce drawdowns even when executed perfectly. A 48% win rate with 1:2 R:R is profitable but will routinely produce 5&ndash;8 trade losing streaks.' },
  { q: 'At -10% drawdown, what is the FIRST action you should take?', opts: ['Find the next A+ trade to start recovering', 'Activate your circuit breaker: stop live trading, review journal, backtest, return at reduced size', 'Increase risk to 2% per trade to recover in half the time', 'Switch to a higher timeframe for bigger wins'], a: 1, explain: 'The circuit breaker at -10% forces a pause. Your emotional state at -10% is compromised whether you feel it or not. One week of review and reset prevents -10% from becoming -25%.' },
  { q: 'Why is switching strategies during a drawdown dangerous?', opts: ['Because new strategies are always worse', 'Because it resets your learning curve and introduces untested risk during your most vulnerable period', 'Because brokers charge for strategy changes', 'Because your indicators won&apos;t work on a new strategy'], a: 1, explain: 'A new strategy means zero data, zero confidence, zero muscle memory &mdash; during the period when you most need all three. If process compliance is high, the strategy isn&apos;t broken. Variance is.' },
  { q: 'After 2 weeks of recovery at 0.25R (from -12% to -8%), when should you increase back to 0.5R?', opts: ['Immediately &mdash; you&apos;ve proven the edge still works', 'After hitting a specific recovery milestone (e.g., -5%) &mdash; graduated re-escalation', 'After 3 consecutive wins', 'Only when you&apos;re back to 0% drawdown'], a: 1, explain: 'Graduated re-escalation uses recovery milestones: 0.25R until -5%, then 0.5R until -3%, then 0.75R until breakeven, then full 1R. This prevents premature size increases while not stalling recovery indefinitely.' },
  { q: 'During a drawdown, you should focus your journal on:', opts: ['P&amp;L recovery targets', 'Process grades, emotions, and what specifically is different about losing trades vs past winning trades', 'Only the winning trades to stay positive', 'Daily account balance'], a: 1, explain: 'Drawdown journals should obsess over process, emotion, and the DIFFERENCE between these losing trades and your historical winners. This data reveals whether the drawdown is variance or a genuine edge decay.' },
];

export default function DrawdownPsychologyPage() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h); }, []);

  const [openStage, setOpenStage] = useState<string | null>(null);
  const [openRule, setOpenRule] = useState<string | null>(null);
  const [openMyth, setOpenMyth] = useState<string | null>(null);
  const [openMistake, setOpenMistake] = useState<string | null>(null);

  // Drawdown calculator
  const [calcLoss, setCalcLoss] = useState(10);
  const calcRecovery = ((1 / (1 - calcLoss / 100)) - 1) * 100;
  const calcMoney = 10000 * (1 - calcLoss / 100);

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
          <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 4 &middot; Lesson 11</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight"><span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Drawdown Psychology</span></h1>
          <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">When the account bleeds. What to do when you&apos;re down 10%. The hardest test in trading.</p>
        </motion.div>
      </section>

      {/* S00 — WHY THIS MATTERS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-lg font-bold text-white mb-3">&#127754; Imagine you&apos;re swimming in the ocean and the current starts pulling you out. Your instinct screams: SWIM HARDER. Fight the current. But every lifeguard knows the correct response is the opposite: <strong className="text-amber-400">swim sideways</strong>. Stop fighting the force. Conserve energy. Work WITH the water, not against it.</p>
            <p className="text-gray-400 leading-relaxed mb-4">A drawdown is a rip current. Every instinct tells you to fight it: trade more, size bigger, switch strategies, &ldquo;get it back.&rdquo; But fighting a drawdown makes it deeper. <strong className="text-white">The professional response is counterintuitive: slow down, reduce size, trust the process.</strong></p>
            <p className="text-gray-400 leading-relaxed">This lesson isn&apos;t about preventing drawdowns &mdash; they&apos;re inevitable. It&apos;s about <strong className="text-green-400">surviving them</strong> with your capital and your psychology intact.</p>
          </div>
          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">A prop firm trader hit -8% drawdown in week 3. Instead of reducing size, he doubled it to &ldquo;recover faster.&rdquo; Two more losses at 2x size pushed him to -14%. Panicking, he tripled his size on a &ldquo;revenge trade.&rdquo; The account hit the -15% firm limit and was terminated. If he had simply reduced to 0.5R at -8%, the maximum additional damage per trade would have been 0.5% &mdash; and the drawdown would have stabilised.</p>
          </div>
        </motion.div>
      </section>

      {/* S01 — THE DRAWDOWN CURVE */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Emotional Journey</p>
          <h2 className="text-2xl font-extrabold mb-4">What a Drawdown Looks and Feels Like</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Every drawdown follows the same emotional arc. Knowing which stage you&apos;re in is the first step to managing it.</p>
          <div className="mb-6 rounded-2xl overflow-hidden border border-white/5">
            <DrawdownCurveAnimation />
          </div>
          <div className="space-y-3">
            {drawdownStages.map(s => (
              <div key={s.stage}>
                <button onClick={() => setOpenStage(openStage === s.stage ? null : s.stage)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <div className="flex items-center gap-3"><span dangerouslySetInnerHTML={{ __html: s.emoji }} /><div><p className="text-sm font-bold text-white">{s.stage}</p><p className="text-xs text-gray-500">{s.range}</p></div></div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openStage === s.stage ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openStage === s.stage && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden"><div className="p-4 mx-2 mt-1 rounded-xl bg-white/[0.02] border border-white/5 space-y-2"><p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: s.desc }} /><p className="text-xs text-red-400"><strong>&#9888;&#65039; Danger:</strong> <span dangerouslySetInnerHTML={{ __html: s.danger }} /></p></div></motion.div>)}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S02 — RECOVERY MATHS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Maths of Recovery</p>
          <h2 className="text-2xl font-extrabold mb-4">Why Prevention Beats Cure</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The deeper the hole, the exponentially harder it is to climb out. This single chart explains why risk management exists.</p>
          <div className="mb-6 rounded-2xl overflow-hidden border border-white/5">
            <RecoveryMathAnimation />
          </div>
          <div className="p-5 rounded-2xl glass-card">
            <div className="space-y-2">
              {recoveryTable.map((r, i) => (
                <div key={i} className={`flex items-center justify-between text-xs py-1.5 ${i > 3 ? 'text-red-400' : i > 1 ? 'text-amber-400' : 'text-gray-400'}`}>
                  <span className="font-bold">-{r.loss}%</span>
                  <span className="text-gray-500">{r.money}</span>
                  <span className="font-bold">+{r.recovery}% needed</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3 border-t border-white/5 pt-3">After -50%, you need to <strong className="text-white">DOUBLE your remaining capital</strong>. After -90%, you need a <strong className="text-red-400">900% return</strong>. This is why every percentage point of drawdown prevention is worth 10x more than recovery.</p>
          </div>
        </motion.div>
      </section>

      {/* S03 — INTERACTIVE CALCULATOR */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; Drawdown Calculator</p>
          <h2 className="text-2xl font-extrabold mb-4">See It For Yourself</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Drag the slider. Watch the recovery requirement grow exponentially.</p>
          <div className="p-5 rounded-2xl glass-card text-center">
            <input type="range" min={1} max={95} value={calcLoss} onChange={e => setCalcLoss(Number(e.target.value))} className="w-full accent-amber-500 mb-4" />
            <div className="grid grid-cols-3 gap-4">
              <div><p className="text-xs text-gray-500 mb-1">Drawdown</p><p className={`text-2xl font-extrabold ${calcLoss >= 30 ? 'text-red-400' : calcLoss >= 15 ? 'text-amber-400' : 'text-green-400'}`}>-{calcLoss}%</p></div>
              <div><p className="text-xs text-gray-500 mb-1">Account Balance</p><p className="text-2xl font-extrabold text-white">&pound;{Math.round(calcMoney).toLocaleString()}</p></div>
              <div><p className="text-xs text-gray-500 mb-1">Recovery Needed</p><p className={`text-2xl font-extrabold ${calcRecovery >= 100 ? 'text-red-400' : calcRecovery >= 40 ? 'text-amber-400' : 'text-green-400'}`}>+{calcRecovery.toFixed(1)}%</p></div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S04 — SURVIVAL RULES */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The Survival Protocol</p>
          <h2 className="text-2xl font-extrabold mb-4">Five Rules for Surviving a Drawdown</h2>
          <p className="text-gray-400 leading-relaxed mb-6">These rules exist to be followed when you DON&apos;T feel like following them. That&apos;s the point.</p>
          <div className="space-y-3">
            {survivalRules.map(r => (
              <div key={r.rule}>
                <button onClick={() => setOpenRule(openRule === r.rule ? null : r.rule)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <div className="flex items-center gap-3"><span dangerouslySetInnerHTML={{ __html: r.emoji }} /><p className="text-sm font-bold text-white">{r.rule}</p></div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openRule === r.rule ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openRule === r.rule && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden"><div className="p-4 mx-2 mt-1 rounded-xl bg-white/[0.02] border border-white/5"><p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: r.desc }} /></div></motion.div>)}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S05 — SIZE REDUCTION FRAMEWORK */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; The Size Ladder</p>
          <h2 className="text-2xl font-extrabold mb-4">Graduated Size Reduction &amp; Recovery</h2>
          <p className="text-gray-400 leading-relaxed mb-6">A clear, pre-defined plan for adjusting position size as drawdown deepens &mdash; and as recovery progresses.</p>
          <div className="p-5 rounded-2xl glass-card">
            <div className="space-y-3">
              {[
                { dd: '0% to -5%', size: '1.0R', color: 'green', label: 'Normal trading' },
                { dd: '-5% to -8%', size: '0.75R', color: 'green', label: 'First reduction' },
                { dd: '-8% to -10%', size: '0.5R', color: 'amber', label: 'Defensive mode' },
                { dd: '-10%+', size: '0.25R or PAUSE', color: 'red', label: 'Circuit breaker zone' },
              ].map((tier, i) => (
                <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${tier.color === 'green' ? 'border-green-500/15 bg-green-500/[0.03]' : tier.color === 'amber' ? 'border-amber-500/15 bg-amber-500/[0.03]' : 'border-red-500/15 bg-red-500/[0.03]'}`}>
                  <div><p className="text-sm font-bold text-white">{tier.dd}</p><p className="text-xs text-gray-500">{tier.label}</p></div>
                  <p className={`text-lg font-extrabold ${tier.color === 'green' ? 'text-green-400' : tier.color === 'amber' ? 'text-amber-400' : 'text-red-400'}`}>{tier.size}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-4">Recovery works in reverse: when you reach -8% recovering, move back to 0.5R. At -5%, back to 0.75R. At breakeven, back to 1R. Never jump straight from 0.25R to 1R.</p>
          </div>
        </motion.div>
      </section>

      {/* S06 — MYTHS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Myths Busted</p>
          <h2 className="text-2xl font-extrabold mb-4">Drawdown Myths That Deepen the Hole</h2>
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

      {/* S07 — PROP FIRM SPECIFIC */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Prop Firm Drawdowns</p>
          <h2 className="text-2xl font-extrabold mb-4">When the Limit Is Non-Negotiable</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Prop firms typically enforce hard drawdown limits: 5&ndash;10% daily, 10&ndash;15% total. Breach them and the account is terminated instantly. This adds a unique layer of pressure.</p>
          <div className="p-5 rounded-2xl glass-card space-y-4">
            {[
              { rule: 'Know your exact limits BEFORE the challenge starts', desc: 'Daily limit: often 5%. Total limit: often 10&ndash;12%. Calculate in advance: at 1R = 1%, you can lose 5 trades in a day before the daily limit. Plan accordingly.' },
              { rule: 'Set personal limits TIGHTER than the firm&apos;s', desc: 'If the firm allows -10% total, set your personal limit at -7%. This gives you a 3% buffer. You never want to be one trade away from account termination.' },
              { rule: 'Reduce size at 50% of the limit', desc: 'If total limit is -10%, reduce to 0.5R at -5%. This means you can lose 10 more trades before termination instead of 5. Time and room to recover.' },
              { rule: 'Never, ever revenge trade on a prop account', desc: 'One revenge trade at 3x size can breach a daily limit in a single candle. The account is gone. There is no appeal. The circuit breaker is non-optional.' },
            ].map((item, i) => (
              <div key={i}>
                <p className="text-sm font-bold text-amber-400 mb-1">{item.rule}</p>
                <p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.desc }} />
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
          <h2 className="text-2xl font-extrabold mb-6">Drawdown Decisions &mdash; 5 Scenarios</h2>
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
            <p className="text-sm text-gray-400">{gameScore === 5 ? 'Perfect drawdown management. You swim sideways, not against the current.' : gameScore >= 3 ? 'Good survival instincts. Review the size ladder and circuit breaker rules.' : 'The drawdown is winning. Re-read the survival protocol and recovery maths.'}</p>
          </motion.div>
          )}
        </motion.div>
      </section>

      {/* S10 — QUIZ */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Knowledge Check</p>
          <h2 className="text-2xl font-extrabold mb-6">Drawdown Psychology Quiz</h2>
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
        {quizDone && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 text-center p-8 glass-card rounded-2xl"><p className={`text-5xl font-extrabold mb-2 ${score >= 66 ? 'text-amber-400' : 'text-red-400'}`}>{score}%</p><p className="text-sm text-gray-400">{score === 100 ? '&#127754; Perfect. You swim sideways, not against the current.' : score >= 66 ? 'Strong drawdown awareness. Print the size ladder and tape it to your monitor.' : 'Review the recovery maths and the survival protocol.'}</p></motion.div>)}
      </section>

      {/* Certificate */}
      <section className="px-5 py-16 text-center">
        {!certUnlocked ? (
          <div className="max-w-md mx-auto p-8 glass rounded-2xl"><p className="text-4xl mb-3 opacity-30">&#128274;</p><p className="text-sm text-gray-500">Score 66%+ to unlock your <strong className="text-amber-400">Pro Certificate</strong></p></div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, type: 'spring' }}
            className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(239,68,68,0.06),transparent,rgba(234,179,8,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
            <div className="absolute inset-[1px] rounded-3xl border border-amber-500/10" />
            <div className="relative z-10">
              <div className="w-[80px] h-[80px] mx-auto mb-5 rounded-full bg-gradient-to-br from-red-500 via-amber-500 to-green-500 flex items-center justify-center text-4xl shadow-lg shadow-red-500/20">&#127754;</div>
              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest mb-2">Pro Certificate</p>
              <h3 className="text-xl font-extrabold mb-1">Certificate of Mastery</h3>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">Has mastered<br /><strong className="text-white">Level 4.11: Drawdown Psychology</strong><br />at ATLAS Academy by Interakktive</p>
              <p className="bg-gradient-to-r from-red-400 via-amber-400 to-green-400 bg-clip-text text-transparent font-bold text-lg mb-1" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Drawdown Survivor &mdash;</p>
              <p className="font-mono text-[11px] text-gray-500 mb-4">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L4.11-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
            </div>
          </motion.div>
        )}
      </section>

      <section className="text-center px-5 pt-10 pb-24">
        <p className="text-xs tracking-widest uppercase text-gray-600 mb-4">Up Next</p>
        <h2 className="text-xl font-bold mb-6">Lesson 4.12 &mdash; The 30-Day Mental Reset</h2>
        <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">
          Continue <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
