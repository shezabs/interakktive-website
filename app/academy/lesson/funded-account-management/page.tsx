// app/academy/lesson/funded-account-management/page.tsx
// ATLAS Academy — Lesson 9.8: Funded Account Management [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 9
// GROUNDBREAKING: Funded Account Health Dashboard — live DD gauges + health score
// TEMPLATE: Matches Level 6 Lesson 8 (trade-management) gold standard exactly
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Crown, ChevronDown } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

function Confetti({ active }: { active: boolean }) {
  if (!active) return null;
  return (<div className="fixed inset-0 pointer-events-none z-50">{Array.from({ length: 60 }).map((_, i) => (<motion.div key={i} initial={{ y: -20, x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400), opacity: 1 }} animate={{ y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 20, rotate: Math.random() * 720, opacity: 0 }} transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5 }} className="absolute w-2 h-2 rounded-sm" style={{ background: ['#f59e0b', '#d946ef', '#34d399', '#3b82f6', '#ef4444'][i % 5] }} />))}</div>);
}

function AnimScene({ drawFn, height = 300 }: { drawFn: (ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => void; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const animRef = useRef(0);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr; canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const loop = () => { ctx.clearRect(0, 0, rect.width, rect.height); drawFn(ctx, rect.width, rect.height, frameRef.current); frameRef.current++; animRef.current = requestAnimationFrame(loop); };
    loop();
    return () => cancelAnimationFrame(animRef.current);
  }, [drawFn]);
  return <canvas ref={canvasRef} className="w-full rounded-xl" style={{ height }} />;
}

/* ─── DATA ─── */
const mindsetShifts = [
  { challenge: 'Profit target focus', funded: 'Survival focus', desc: 'In the challenge you hunted +10%. Funded, your job is to NOT lose the account. Profit is secondary to drawdown management. The account that survives earns. The account that chases dies.', icon: '🎯' },
  { challenge: 'Time pressure (30 days)', funded: 'No time limit (infinite horizon)', desc: 'No deadline means no rushing. You can have zero-trade days, zero-trade weeks, and the account survives. The absence of time pressure is a superpower. Use it.', icon: '⏱️' },
  { challenge: 'Proving energy ("Can I do this?")', funded: 'Professional energy ("This is my job")', desc: 'You already proved yourself. Funded trading is not an audition. It is employment. Show up, execute the plan, collect the payout. The emotional intensity should DECREASE, not increase.', icon: '💼' },
  { challenge: 'Aggressive → Protect progression', funded: 'Protect mode is the DEFAULT state', desc: 'Challenge has phases. Funded is one continuous Protect Phase. Your baseline risk should be 0.5\u20130.75%, never higher. The account has no target to rush toward.', icon: '🛡️' },
  { challenge: 'One-shot mentality', funded: 'Infinite game mentality', desc: 'The challenge was finite: pass or fail. The funded account is infinite: survive this month, earn next month, compound over years. Every decision should serve the LONG game, not today\u2019s P&L.', icon: '♾️' },
];

const slowBleedData = [
  { day: 'Mon', pnl: -0.3, cum: -0.3, feel: 'Slight annoyance. "Bad day, it happens."' },
  { day: 'Tue', pnl: -0.2, cum: -0.5, feel: 'Mild concern. "Two red days in a row."' },
  { day: 'Wed', pnl: +0.4, cum: -0.1, feel: 'Relief. "Back on track." But you are still negative for the week.' },
  { day: 'Thu', pnl: -0.5, cum: -0.6, feel: 'Frustration. "Wednesday\u2019s win was given back and then some."' },
  { day: 'Fri', pnl: -0.4, cum: -1.0, feel: 'Worry. "Down 1% for the week. Not terrible but\u2026"' },
  { day: 'Week 2', pnl: -0.8, cum: -1.8, feel: '"This is getting concerning. My overall DD buffer is shrinking."' },
  { day: 'Week 3', pnl: -1.2, cum: -3.0, feel: 'Panic. "3% overall DD used. I never had a BLOW-UP. I just\u2026 leaked."' },
  { day: 'Week 4', pnl: -1.5, cum: -4.5, feel: 'Danger zone. "One bad day from termination. No single catastrophe. Just 20 mediocre days that compounded into a crisis."' },
];

const mandatoryDaysOff = [
  { trigger: '2 consecutive losing DAYS (not trades)', action: 'Take 1 full day off. No charts, no analysis, no "just looking."', reason: 'Two losing days in a row indicates either a market regime shift or psychological degradation. Both require distance to diagnose. The day off costs zero (no DD exposure). Trading through it risks another -0.5\u20131% that you cannot afford.', color: '#ef4444' },
  { trigger: 'Overall DD reaches 60% of limit', action: 'Reduce risk to 0.5% immediately. Consider 2\u20133 days off.', reason: 'At 60% DD used, you are in the danger zone. One bad day at normal risk could breach. Reducing risk extends your survival by 40\u201350% more trades. The smaller gains are offset by dramatically higher survival probability.', color: '#f59e0b' },
  { trigger: 'Any day where you break a rule', action: 'Stop immediately. Take the next day off.', reason: 'Rule-breaking on a funded account is a pattern, not an accident. If you broke your session filter, or took a B-grade setup, or revenge-traded, the BEHAVIOUR is the problem. One day off to diagnose and recommit to the plan.', color: '#f97316' },
  { trigger: 'After your first payout', action: 'Take 1\u20132 days off to celebrate and reset', reason: 'Your first payout is an emotional event. Euphoria can lead to overconfidence and risk-taking. Take a day to celebrate, then return with the same discipline that earned the payout.', color: '#22c55e' },
  { trigger: 'End of every month', action: 'Take a full review day', reason: 'Monthly review: score your process, check DD usage, evaluate risk parameters, plan next month. This is not optional. It is the business review that keeps the income sustainable.', color: '#3b82f6' },
];

const survivalPriorities = [
  { priority: '#1: Daily DD Buffer', desc: 'Never use more than 60\u201370% of your daily DD limit. If your limit is 5%, your personal cap is 3\u20133.5%. This gives you room for one unexpected loss without breaching. The 2-loss rule from Lesson 9.6 still applies.', color: '#ef4444' },
  { priority: '#2: Overall DD Trajectory', desc: 'Track your overall DD usage weekly. If the trend is DOWN (toward the floor), something needs to change before you reach the danger zone. Catch the slow bleed at -2%, not at -4.5%.', color: '#f59e0b' },
  { priority: '#3: Consistency', desc: 'Funded accounts reward consistency even more than challenges. Steady +2\u20133% monthly is infinitely better than +8% then -6% then +5% then -4%. Smooth equity curves keep accounts alive AND earn trust for scaling.', color: '#22c55e' },
  { priority: '#4: Profit (last, not first)', desc: 'Profit comes FROM surviving, not the other way around. If you survive for 6 months at +2% monthly, you earn \u00A312,000+ on a \u00A3100K account. The profit takes care of itself when survival is the priority.', color: '#3b82f6' },
];

const commonMistakes = [
  { title: 'Treating Funded Like a Challenge', mistake: '"I passed the challenge at 0.75% risk, so I will use 0.75% on my funded account." The challenge had a target that required speed. The funded account has NO target. There is no reason to maintain challenge-level risk. Your funded risk should be 0.5% or even lower.', fix: 'Reduce funded risk to 50\u201375% of your challenge risk. If you passed at 0.75%, trade funded at 0.5%. The lower risk dramatically extends account survival while your positive EV generates income over time.' },
  { title: 'Ignoring the Slow Bleed', mistake: '"I have not had any bad days." You have not had any GOOD days either. -0.3% per day for 15 days is -4.5% without a single alarm. The slow bleed is the #1 funded account killer because it is invisible until it is too late.', fix: 'Track weekly net P&L. If 2 consecutive weeks are negative, stop and diagnose: is the strategy underperforming? Is the market regime different? Are you taking B-grade setups? Catch it at -2%, not -4.5%.' },
  { title: 'No Days Off', mistake: '"I need to trade every day to maximise my funded account income." The funded account has no deadline. Trading every day increases DD exposure without proportionally increasing income. Your best trading days are when you are fresh, focused, and have A+ setups.', fix: 'Trade 3\u20134 days per week maximum. Take Mondays and Fridays off (or your lowest-WR days from your journal). The days you skip protect your account more than the trades you take.' },
  { title: 'Post-Payout Overconfidence', mistake: '"I just got my first payout of \u00A32,400! I am a funded trader now. Let me increase risk to maximise next month." The first payout triggers euphoria. Increasing risk after euphoria is the mirror image of revenge trading after losses \u2014 both are emotional decisions.', fix: 'After every payout, take 1 day off. Return with the SAME risk, SAME plan, SAME parameters. The payout confirms the plan works. Changing the plan because it worked defeats the purpose.' },
];

const gameRounds = [
  { scenario: '<strong>The slow bleed:</strong> Week 3 of your funded account. No blow-ups, no big losses. But your weekly P&Ls: Week 1: -0.3%, Week 2: -0.8%, Week 3 so far: -0.4%. Cumulative: -1.5%. Your overall DD limit is 10%. Each individual day felt fine. What should you do?', options: [
    { text: 'Continue trading normally \u2014 -1.5% is only 15% of the 10% DD limit, which is nothing to worry about', correct: false, explain: 'The LEVEL is not the concern \u2014 the TRAJECTORY is. Three consecutive negative weeks means something is off. By the time you "worry" at -4\u20135%, one bad day terminates you. Catching the bleed at -1.5% gives you time and space to diagnose and fix. Waiting until it is "worth worrying about" is how accounts die slowly.' },
    { text: 'Stop trading for 2\u20133 days. Diagnose: review every trade from the past 3 weeks. Identify if it is a strategy issue (market regime change), execution issue (B-grade setups creeping in), or variance. Fix before resuming.', correct: true, explain: 'Catching the slow bleed early is the funded trader\u2019s most important skill. At -1.5%, you have 8.5% of DD remaining and TIME to fix the problem. Common causes: market regime shifted (trending to ranging), setup quality degraded (taking B-grades), session creep (trading outside your best session). The diagnosis takes 2\u20133 hours. The fix saves the account.' },
    { text: 'Increase risk to 1% to recover the -1.5% faster', correct: false, explain: 'Increasing risk when you are bleeding accelerates the bleed. If the underlying cause is a market regime change, higher risk means bigger losses in the same unfavourable conditions. If it is a quality issue, higher risk on bad setups amplifies the damage. Fix the cause, not the symptom.' },
  ]},
  { scenario: '<strong>First payout day:</strong> Your first funded month is complete. You made +3.2% (\u00A33,200 on a \u00A3100K account). After the 80/20 split, your payout is \u00A32,560. You feel amazing. It is the first real money you have earned from trading. Your next session starts in 2 hours. What do you do?', options: [
    { text: 'Start trading immediately \u2014 you are on a roll and want to maximise next month\u2019s payout', correct: false, explain: 'Euphoria is the mirror of devastation. Both compromise your judgement. The trader who enters the next session riding a payout high is the same trader who enters after a big loss riding frustration. Both are trading emotions, not systems. Take the day off. Celebrate. Return tomorrow with a clear head.' },
    { text: 'Take today off. Celebrate the milestone. Tomorrow, return with the SAME risk (0.5%), SAME plan, SAME sessions. The payout confirms the plan works. Changing anything because it worked defeats the purpose.', correct: true, explain: 'This is professional trading behaviour. Celebrate: you earned \u00A32,560 from your skill. Then reset: the payout is a data point confirming your process works. Next month\u2019s goal is identical: survive, execute the plan, collect. No euphoria-driven risk increases. No "I can push harder now." The same discipline that earned the first payout will earn the next one.' },
    { text: 'Increase risk to 0.75% since you now have a \u00A33,200 profit cushion', correct: false, explain: 'Your profit cushion is NOT a risk cushion. After payout, your account resets to the funded balance. The DD limits reset from the new balance (at most firms). Your "cushion" was withdrawn. You are back to the same DD buffer as Day 1. Risk stays the same.' },
  ]},
  { scenario: '<strong>Rule break detection:</strong> Wednesday afternoon. You have been flat for 2 days (no A+ setups). A B-grade setup appears in the New York session \u2014 which is outside your planned London-only session filter. You take it. It wins +0.4%. You feel good about it. What just happened and what should you do?', options: [
    { text: 'Nothing wrong \u2014 you made money and it was still a decent setup', correct: false, explain: 'The outcome was positive but the PROCESS was wrong. You broke two rules: session filter (NY instead of London) and setup grade (B instead of A+). The win reinforces the rule-breaking behaviour. Next time a B-grade NY setup appears, you will remember "it worked last time" and take it again. Eventually one of these loses 0.75% and you have normalised a behaviour that degrades your edge.' },
    { text: 'You broke your session filter AND your setup grade filter. The win does not matter \u2014 the behaviour does. Stop trading for the day. Tomorrow, review why you broke the rules (boredom? frustration from flat days?) and recommit to the plan.', correct: true, explain: 'The most dangerous losses on a funded account are the ones that look like wins. A profitable B-grade trade in the wrong session teaches your brain that rule-breaking pays. Over 50 instances, those B-grade trades will have lower WR and erode your edge. The win today costs you 5 future losses you cannot see yet. Catching the behaviour NOW prevents the slow degradation of discipline.' },
    { text: 'Note it in your journal and continue \u2014 one exception does not matter', correct: false, explain: '"One exception" is how every funded account dies. One becomes two becomes "sometimes I trade NY." Then "sometimes B-grades." Then "sometimes 0.8% risk." Each exception is small. The cumulative effect is a completely different trading strategy than the one that passed the challenge.' },
  ]},
  { scenario: '<strong>DD threshold:</strong> Month 2 has been rough. Your overall DD is at -5.8% (limit is 10%). You have 4.2% of buffer remaining. Today\u2019s setup is a clean A+ in your best session with all macro factors aligned. What is your risk?', options: [
    { text: '0.75% \u2014 it is an A+ setup and you should not let DD fear override a good trade', correct: false, explain: 'At 4.2% remaining overall DD, a 0.75% risk means ~5.6 losing trades to termination. That is barely a week of trading. One 3-loss day puts you at 1.95% remaining. The risk is mathematically too high relative to your survival needs. The setup quality is irrelevant if the account cannot survive normal variance at this risk level.' },
    { text: '0.5% or lower \u2014 with only 4.2% DD remaining, you are in survival mode. Even on a perfect A+ setup, risk must be reduced to extend the number of trades you can survive', correct: true, explain: 'At 0.5% risk, you can survive ~8.4 losing trades before termination. At 0.35%, ~12 trades. The maths: your positive EV needs ENOUGH trades to express itself. More survival = more trades = more EV. Reducing risk when DD is depleted is not fear \u2014 it is mathematics. The A+ setup is still valid at 0.5%. The expected value is still positive. You just sized it for survival.' },
    { text: 'Skip the trade entirely \u2014 at -5.8% you should not be trading at all', correct: false, explain: 'Over-cautious. You still have 4.2% of buffer and a positive-EV strategy. Stopping entirely means your account slowly dies from inactivity (some firms have minimum trading requirements or time-based fees). The correct response is REDUCED risk, not zero risk. Trade, but size for survival.' },
  ]},
  { scenario: '<strong>The infinite game:</strong> Month 4 of your funded account. You have earned 3 payouts totalling \u00A37,200. Your account is healthy (+1.8% this month). A friend shows you a new trading strategy that a YouTube influencer claims makes 15% monthly. Your current strategy makes 2\u20133% monthly consistently. Should you switch?', options: [
    { text: 'Yes \u2014 15% monthly would mean \u00A312,000 payouts instead of \u00A32,400', correct: false, explain: '15% monthly is a fantasy return that no strategy sustains. If it were real, every fund manager on earth would use it. Your 2\u20133% monthly over 4 months with 3 payouts is REAL, proven, documented performance. Switching to an unproven strategy on a funded account risks everything you have built for a promise that is almost certainly false.' },
    { text: 'Absolutely not. Your 2\u20133% monthly has produced \u00A37,200 in 4 months on a proven, documented system. Switching to an unproven strategy risks the funded account (DD breach from unfamiliar execution) for unverified returns. If curious, test it on demo for 3 months first.', correct: true, explain: 'The infinite game: 2\u20133% monthly for 12 months = 24\u201336% annually = \u00A319,200\u201328,800 from one \u00A3100K account. Multiply by 3 accounts and you are earning \u00A358\u201386K/year. This is real income from a proven system. Chasing 15% monthly is how traders destroy working systems for unproven ones. If curious, demo test for 3+ months before risking a single penny of funded capital.' },
    { text: 'Try it on the funded account with reduced risk for a few weeks as a test', correct: false, explain: '"Reduced risk test" on a funded account is still risking the account with an unproven strategy. Every B-grade trade, every unfamiliar setup, every execution mistake from the new strategy costs real DD. And the psychological disruption of switching approaches mid-stream degrades your existing edge. Test new strategies on demo. Always.' },
  ]},
];

const quizQuestions = [
  { q: 'What is the #1 priority on a funded account?', opts: ['Maximising monthly profit', 'Reaching the next payout as quickly as possible', 'Survival \u2014 managing drawdown to keep the account alive', 'Building a track record for scaling'], correct: 2, explain: 'Survival first. Profit comes FROM surviving, not the other way around. An account that survives 12 months at +2% monthly earns \u00A324,000+ on \u00A3100K. The profit takes care of itself when drawdown management is the priority.' },
  { q: 'What is the "slow bleed" and why is it the #1 funded account killer?', opts: ['A large single-day loss that breaches drawdown', 'Small daily losses (-0.2\u20130.5%) that individually seem harmless but compound over weeks to consume most of the DD buffer without triggering any alarm', 'Gradual spread widening from the broker', 'Slowly decreasing win rate over time'], correct: 1, explain: 'The slow bleed is invisible until it is critical. -0.3% per day for 15 days = -4.5% without a single "bad day." No alarm triggered. No emotional red flag. Just a gentle decline that becomes a crisis. Track WEEKLY net P&L to catch it early.' },
  { q: 'How should your funded account risk compare to your challenge risk?', opts: ['Same \u2014 the strategy worked at that risk', 'Higher \u2014 funded accounts have no time limit so you can be more aggressive', 'Lower (50\u201375% of challenge risk) \u2014 no time pressure means survival becomes more important than speed', 'It does not matter \u2014 risk is risk'], correct: 2, explain: 'Challenge risk was optimised for SPEED to target within a time limit. Funded accounts have no time limit. With infinite horizon, the optimal strategy is to maximise survival (reduce risk) and let positive EV compound over time. 0.5% funded risk is ideal for most traders who passed at 0.75%.' },
  { q: 'After 2 consecutive losing DAYS on your funded account, what should you do?', opts: ['Increase risk to recover', 'Continue normally \u2014 2 days is nothing', 'Take 1 full day off. No charts, no analysis. Diagnose the cause (regime change, quality degradation, or variance) before resuming.', 'Switch to a different instrument'], correct: 2, explain: 'Two consecutive losing days indicates either market regime shift or psychological degradation. Both require distance to diagnose. The day off costs zero (no DD exposure). Trading through it risks another -0.5\u20131% from the same underlying problem.' },
  { q: 'Why is a profitable B-grade trade in the wrong session potentially MORE dangerous than a loss?', opts: ['Because profitable trades are taxed more', 'Because the win reinforces rule-breaking behaviour, normalising exceptions that erode your edge over time', 'Because B-grade trades have higher commissions', 'It is not more dangerous \u2014 a win is always good'], correct: 1, explain: 'The profitable rule-break teaches your brain that exceptions pay. Next time a B-grade appears in the wrong session, you remember "it worked last time." Over 50 instances, these lower-quality trades erode your WR and expand your DD. The invisible cost of one +0.4% win is 5 future losses you cannot see yet.' },
  { q: 'When your overall DD reaches 60% of the limit (e.g., -6% on a 10% limit), what should you do?', opts: ['Continue normally \u2014 you still have 4% of buffer', 'Stop trading permanently \u2014 the account is doomed', 'Immediately reduce risk to 0.5% or lower, and consider taking 2\u20133 days off to diagnose the cause', 'Increase risk to recover faster before the limit is reached'], correct: 2, explain: 'At 60% DD used, you are in survival mode. Reducing risk extends the number of trades you can survive by 40\u201350%. The extra trades give your positive EV more chances to express itself. Days off allow diagnosis of the underlying issue. Increasing risk at this point is the fastest path to termination.' },
  { q: 'What does "infinite game mentality" mean for funded trading?', opts: ['You should trade 24/7 without breaks', 'Every decision should serve long-term survival and compounding, not today\u2019s P&L', 'You should hold positions indefinitely', 'Funded accounts never expire so you never need to withdraw'], correct: 1, explain: 'The funded account is not a sprint (like the challenge). It is an infinite game: survive this month, earn next month, compound over years. A -0.5% day that protects the account for 50 more trading sessions is worth infinitely more than a +1% day that risks the account.' },
  { q: 'After receiving your first payout, the correct response is:', opts: ['Immediately increase risk to maximise next month', 'Take 1 day off to celebrate, then return with the SAME risk and SAME plan \u2014 the payout confirms the plan works', 'Withdraw everything and re-evaluate whether to continue', 'Add a second instrument to diversify income'], correct: 1, explain: 'The first payout confirms your process works. Changing the process because it worked defeats the purpose. Take a day to celebrate (this is a real achievement). Then return with identical parameters. The discipline that earned the first payout earns the second, third, and beyond.' },
];

export default function FundedAccountManagement() {
  const [scrollY, setScrollY] = useState(0);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [gameRound, setGameRound] = useState(0);
  const [gameAnswers, setGameAnswers] = useState<(number | null)[]>(Array(gameRounds.length).fill(null));
  const [gameScore, setGameScore] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(Array(quizQuestions.length).fill(null));
  const [showConfetti, setShowConfetti] = useState(false);
  const [certUnlocked, setCertUnlocked] = useState(false);
  /* Dashboard state */
  const [dbBalance, setDbBalance] = useState(100000);
  const [dbEquity, setDbEquity] = useState(98500);
  const [dbDailyDD, setDbDailyDD] = useState(5);
  const [dbOverallDD, setDbOverallDD] = useState(10);
  const [dbTodayPnl, setDbTodayPnl] = useState(-0.8);
  const [dbOpenPos, setDbOpenPos] = useState(1);

  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);
  const toggle = (id: string) => setOpenSections(s => ({ ...s, [id]: !s[id] }));

  const handleGameAnswer = (oi: number) => { if (gameAnswers[gameRound] !== null) return; const a = [...gameAnswers]; a[gameRound] = oi; setGameAnswers(a); if (gameRounds[gameRound].options[oi].correct) setGameScore(s => s + 1); };
  const handleQuizAnswer = (qi: number, oi: number) => { if (quizAnswers[qi] !== null) return; const a = [...quizAnswers]; a[qi] = oi; setQuizAnswers(a); };

  const quizDone = quizAnswers.every(a => a !== null);
  const quizScoreVal = quizDone ? Math.round(quizAnswers.reduce<number>((s, a, i) => s + (a === quizQuestions[i].correct ? 1 : 0), 0) / quizQuestions.length * 100) : 0;
  useEffect(() => { if (quizDone && quizScoreVal >= 66 && !certUnlocked) { setCertUnlocked(true); setShowConfetti(true); const t = setTimeout(() => setShowConfetti(false), 4000); return () => clearTimeout(t); } }, [quizDone, quizScoreVal, certUnlocked]);

  /* Dashboard calculations */
  const overallDDUsed = ((dbBalance - dbEquity) / dbBalance) * 100;
  const overallDDRemaining = dbOverallDD - overallDDUsed;
  const dailyDDRemaining = dbDailyDD - Math.abs(dbTodayPnl);
  const maxNextRisk = Math.min(dailyDDRemaining * 0.4, overallDDRemaining * 0.15);
  const healthScore = (() => {
    let s = 10;
    if (overallDDRemaining < dbOverallDD * 0.3) s -= 4;
    else if (overallDDRemaining < dbOverallDD * 0.5) s -= 2;
    if (dailyDDRemaining < dbDailyDD * 0.3) s -= 3;
    else if (dailyDDRemaining < dbDailyDD * 0.5) s -= 1;
    if (dbTodayPnl < -2) s -= 2;
    else if (dbTodayPnl < -1) s -= 1;
    if (dbOpenPos > 2) s -= 1;
    return Math.max(1, Math.min(10, s));
  })();
  const healthColor = healthScore >= 7 ? '#22c55e' : healthScore >= 5 ? '#f59e0b' : '#ef4444';
  const recommendation = healthScore >= 8 ? 'Trade normally. All buffers healthy. Stick to your plan.' : healthScore >= 6 ? 'Proceed with caution. Consider reducing risk to 0.5% or taking fewer trades today.' : healthScore >= 4 ? 'WARNING: Reduce risk immediately. Consider stopping for the day. Review your DD trajectory this week.' : 'CRITICAL: Stop trading today. Take 1\u20132 days off. Diagnose the cause before risking any more DD.';

  /* ─── DRAW FUNCTIONS ─── */
  const drawSlowBleed = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const cx = w / 2;
    const cy = h / 2;
    const chartL = 40; const chartR = w - 20; const chartT = 35; const chartB = h - 30;
    const chartW = chartR - chartL; const chartH = chartB - chartT;
    const reveal = Math.min(Math.floor(f * 0.15), slowBleedData.length);
    // DD zones
    ctx.fillStyle = 'rgba(239,68,68,0.04)'; ctx.fillRect(chartL, chartT, chartW, chartH * 0.45);
    ctx.fillStyle = 'rgba(245,158,11,0.03)'; ctx.fillRect(chartL, chartT + chartH * 0.45, chartW, chartH * 0.2);
    // Lines
    ctx.setLineDash([4, 4]); ctx.strokeStyle = 'rgba(239,68,68,0.3)'; ctx.lineWidth = 1;
    const ddFloorY = chartT + chartH * 0.05;
    ctx.beginPath(); ctx.moveTo(chartL, ddFloorY); ctx.lineTo(chartR, ddFloorY); ctx.stroke();
    ctx.fillStyle = 'rgba(239,68,68,0.4)'; ctx.font = '7px system-ui'; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
    ctx.fillText('-10% DD FLOOR', chartL + 2, ddFloorY - 2);
    ctx.strokeStyle = 'rgba(245,158,11,0.3)';
    const dangerY = chartT + chartH * 0.35;
    ctx.beginPath(); ctx.moveTo(chartL, dangerY); ctx.lineTo(chartR, dangerY); ctx.stroke();
    ctx.fillStyle = 'rgba(245,158,11,0.4)'; ctx.fillText('-6% DANGER', chartL + 2, dangerY - 2);
    ctx.setLineDash([]);
    // Zero line
    const zeroY = chartB - chartH * 0.1;
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.beginPath(); ctx.moveTo(chartL, zeroY); ctx.lineTo(chartR, zeroY); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillText('0%', chartL + 2, zeroY - 2);
    // Equity path
    ctx.beginPath(); ctx.strokeStyle = '#ef4444aa'; ctx.lineWidth = 2;
    for (let i = 0; i < reveal; i++) {
      const px = chartL + ((i + 1) / slowBleedData.length) * chartW;
      const py = zeroY - (slowBleedData[i].cum / 6) * (zeroY - chartT);
      if (i === 0) ctx.moveTo(chartL, zeroY);
      ctx.lineTo(px, py);
      // Dot
      ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.stroke();
    // Active label
    if (reveal > 0 && reveal <= slowBleedData.length) {
      const active = slowBleedData[reveal - 1];
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '8px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText(`${active.day}: ${active.cum}% cumulative`, cx, h - 4);
    }
    // Title
    ctx.fillStyle = 'rgba(239,68,68,0.6)'; ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('The Slow Bleed: No Bad Days, Just 20 Mediocre Ones', cx, 6);
  }, []);

  const drawMindsetShift = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const cx = w / 2;
    const cy = h / 2;
    const cycle = f % 300;
    const activeIdx = Math.floor(cycle / 60) % 5;
    const colW = (w - 40) / 2;
    const rowH = (h - 50) / 5;
    // Headers
    ctx.fillStyle = 'rgba(245,158,11,0.5)'; ctx.font = 'bold 9px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('CHALLENGE', 20 + colW / 2, 16);
    ctx.fillStyle = 'rgba(34,197,94,0.5)'; ctx.fillText('FUNDED', 20 + colW + colW / 2, 16);
    ctx.fillStyle = 'rgba(245,158,11,0.5)'; ctx.font = 'bold 14px system-ui'; ctx.fillText('\u2192', cx, 16);
    for (let i = 0; i < 5; i++) {
      const ry = 30 + i * rowH;
      const isActive = i === activeIdx;
      if (isActive) { ctx.fillStyle = 'rgba(245,158,11,0.05)'; ctx.fillRect(15, ry, w - 30, rowH); }
      // Icon
      if (isActive) { ctx.font = '14px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(mindsetShifts[i].icon, cx, ry + rowH / 2); }
      // Challenge text
      ctx.fillStyle = isActive ? 'rgba(245,158,11,0.7)' : 'rgba(255,255,255,0.2)';
      ctx.font = `${isActive ? 8 : 7}px system-ui`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(mindsetShifts[i].challenge, 20 + colW / 2, ry + rowH / 2);
      // Funded text
      ctx.fillStyle = isActive ? 'rgba(34,197,94,0.8)' : 'rgba(255,255,255,0.2)';
      ctx.fillText(mindsetShifts[i].funded, 20 + colW + colW / 2, ry + rowH / 2);
    }
    // Description
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '8px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    const desc = mindsetShifts[activeIdx].desc;
    const maxW = w - 40;
    if (ctx.measureText(desc).width > maxW) {
      const words = desc.split(' '); let line = ''; const lines: string[] = [];
      for (const word of words) { const t = line + (line ? ' ' : '') + word; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = word; } else { line = t; } }
      if (line) lines.push(line);
      let ly = h - 4 - (lines.length - 1) * 10;
      for (const l of lines) { ctx.fillText(l, cx, ly); ly += 10; }
    } else { ctx.fillText(desc, cx, h - 4); }
  }, []);

  const inputCls = 'w-full p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-amber-500/40';

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      <Confetti active={showConfetti} />
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-white/5"><motion.div className="h-full bg-gradient-to-r from-amber-500 to-accent-500" style={{ width: `${Math.min((scrollY / (typeof document !== 'undefined' ? document.body.scrollHeight - window.innerHeight : 1)) * 100, 100)}%` }} /></div>
      <nav className="fixed top-1 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-5 py-2 rounded-2xl border border-white/[0.06]" style={{ background: 'rgba(6,10,18,0.85)', backdropFilter: 'blur(16px)' }}>
        <Link href="/academy" className="text-xs font-bold tracking-widest bg-gradient-to-r from-amber-400 to-purple-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>ATLAS ACADEMY</Link>
        <Crown className="w-3.5 h-3.5 text-amber-500" />
        <span className="text-[10px] font-mono tracking-wider text-amber-400/80">PRO &middot; LEVEL 9</span>
      </nav>

      <section className="min-h-[85vh] flex flex-col items-center justify-center text-center px-5 relative overflow-hidden">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(245,158,11,0.08),transparent_70%)] pointer-events-none" />
        <div className="absolute top-[-50px] right-[20%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(217,70,239,0.05),transparent_70%)] pointer-events-none" />
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="relative z-10">
          <motion.p variants={fadeUp} className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-4">Level 9 &middot; Lesson 8 of 14</motion.p>
          <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold leading-tight mb-4 bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Funded Account Management</motion.h1>
          <motion.p variants={fadeUp} className="text-gray-400 max-w-lg mx-auto text-sm leading-relaxed">Everything changes when it is real capital. The shift from pass mode to survival mode, the slow bleed, mandatory days off, and the infinite game.</motion.p>
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.8 }} className="absolute bottom-8 flex flex-col items-center gap-2 text-gray-600 text-xs">Scroll to begin<motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-amber-500">&#8964;</motion.div></motion.div>
      </section>

      <section className="max-w-2xl mx-auto px-5 py-20"><motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">00 &mdash; Why This Matters</p><h2 className="text-2xl font-extrabold mb-4">You Passed. Now the Real Work Begins.</h2><div className="p-6 rounded-2xl glass-card space-y-4">
        <p className="text-sm text-gray-300 leading-relaxed">Passing the challenge is a celebration. Managing the funded account is a job. Most traders prepare obsessively for the challenge and then improvise the funded stage. That is backwards. The challenge was a 30-day test. The funded account is your <strong className="text-white">career</strong>.</p>
        <p className="text-sm text-gray-300 leading-relaxed">The biggest shift: the challenge had a target to chase. The funded account has a <strong className="text-white">floor to avoid</strong>. In challenges, aggression was necessary to reach the target in time. In funded accounts, aggression is the enemy. The account that survives earns. The account that chases dies.</p>
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-purple-500/10 border border-amber-500/20"><p className="text-xs font-bold text-amber-400 mb-1">&#9889; REAL SCENARIO</p><p className="text-xs text-gray-300">A trader passed a &pound;100K challenge with +10.3% in 22 days. Funded, he continued at the same 0.75% risk with the same urgency. Month 1: +3.2% (payout &pound;2,560). Month 2: -4.8% (slow bleed, no blow-up). Month 3: account terminated at -10% overall DD. <strong className="text-white">Total career: 2 months. Total earned: &pound;2,560 minus &pound;400 challenge fee = &pound;2,160.</strong> If he had reduced funded risk to 0.5% and managed drawdowns, the account could have survived 12+ months earning &pound;2,000+/month = &pound;24,000+.</p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Slow Bleed</p><h2 className="text-2xl font-extrabold mb-2">No Bad Days. Just 20 Mediocre Ones.</h2><p className="text-gray-400 text-sm mb-4">Watch how small daily losses compound into a crisis without triggering any alarm.</p>
      <div className="rounded-2xl glass-card p-4"><AnimScene drawFn={drawSlowBleed} height={300} /></div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Mindset Shift</p><h2 className="text-2xl font-extrabold mb-2">Challenge Mode &rarr; Funded Mode</h2><p className="text-gray-400 text-sm mb-4">5 fundamental shifts in how you think, trade, and measure success.</p>
      <div className="rounded-2xl glass-card p-4"><AnimScene drawFn={drawMindsetShift} height={320} /></div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The Slow Bleed in Detail</p><h2 className="text-2xl font-extrabold mb-4">How -0.3% Per Day Becomes -4.5%</h2><div className="p-6 rounded-2xl glass-card space-y-2">{slowBleedData.map((d, i) => (<div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center gap-3"><span className="text-xs font-bold shrink-0 px-2 py-1 rounded-lg" style={{ color: d.cum > -2 ? '#f59e0b' : '#ef4444', background: (d.cum > -2 ? '#f59e0b' : '#ef4444') + '18' }}>{d.day}</span><div className="flex-1"><p className="text-xs text-gray-300"><strong className="text-white">{d.pnl > 0 ? '+' : ''}{d.pnl}%</strong> (cumulative: {d.cum}%)</p><p className="text-[10px] text-gray-500">{d.feel}</p></div></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Survival Priorities</p><h2 className="text-2xl font-extrabold mb-4">The 4 Priorities (In Order)</h2><div className="p-6 rounded-2xl glass-card space-y-3">{survivalPriorities.map((sp, i) => (<div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm font-bold" style={{ color: sp.color }}>{sp.priority}</p><p className="text-xs text-gray-400 mt-1">{sp.desc}</p></div>))}</div></motion.div></section>

      {/* S05 — GROUNDBREAKING: Health Dashboard */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Check Your Account</p><h2 className="text-2xl font-extrabold mb-2">&#127919; Funded Account Health Dashboard</h2><p className="text-gray-400 text-sm mb-4">Input your funded account status. See your DD gauges, maximum safe risk, health score, and specific action recommendation.</p>
      <div className="p-6 rounded-2xl glass-card space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div><p className="text-[10px] text-amber-400 font-bold mb-1">Funded Balance (&pound;)</p><input type="number" value={dbBalance} onChange={e => setDbBalance(Math.max(10000, Number(e.target.value)))} className={inputCls} /></div>
          <div><p className="text-[10px] text-amber-400 font-bold mb-1">Current Equity (&pound;)</p><input type="number" value={dbEquity} onChange={e => setDbEquity(Math.max(0, Number(e.target.value)))} className={inputCls} /></div>
          <div><p className="text-[10px] text-amber-400 font-bold mb-1">Today&apos;s P&amp;L (%)</p><input type="number" value={dbTodayPnl} onChange={e => setDbTodayPnl(Number(e.target.value))} step={0.1} className={inputCls} /></div>
          <div><p className="text-[10px] text-amber-400 font-bold mb-1">Daily DD Limit (%)</p><input type="number" value={dbDailyDD} onChange={e => setDbDailyDD(Math.max(1, Math.min(10, Number(e.target.value))))} className={inputCls} /></div>
          <div><p className="text-[10px] text-amber-400 font-bold mb-1">Overall DD Limit (%)</p><input type="number" value={dbOverallDD} onChange={e => setDbOverallDD(Math.max(2, Math.min(20, Number(e.target.value))))} className={inputCls} /></div>
          <div><p className="text-[10px] text-amber-400 font-bold mb-1">Open Positions</p><input type="number" value={dbOpenPos} onChange={e => setDbOpenPos(Math.max(0, Math.min(5, Number(e.target.value))))} className={inputCls} /></div>
        </div>
        {/* Health Score */}
        <div className="p-4 rounded-xl text-center" style={{ background: healthColor + '10', border: `1px solid ${healthColor}33` }}><p className="text-xs text-gray-400">Account Health Score</p><p className="text-3xl font-extrabold" style={{ color: healthColor }}>{healthScore}/10</p><p className="text-xs text-gray-300 mt-1">{recommendation}</p></div>
        {/* Gauges */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center"><p className="text-[10px] text-gray-500 mb-1">Daily DD Remaining</p><div className="h-3 rounded-full bg-white/[0.06] mb-1"><div className="h-full rounded-full transition-all" style={{ width: `${Math.max(0, (dailyDDRemaining / dbDailyDD) * 100)}%`, background: dailyDDRemaining > dbDailyDD * 0.5 ? '#22c55e' : dailyDDRemaining > dbDailyDD * 0.25 ? '#f59e0b' : '#ef4444' }} /></div><p className="text-sm font-bold" style={{ color: dailyDDRemaining > dbDailyDD * 0.5 ? '#22c55e' : dailyDDRemaining > dbDailyDD * 0.25 ? '#f59e0b' : '#ef4444' }}>{dailyDDRemaining.toFixed(2)}%</p><p className="text-[9px] text-gray-600">of {dbDailyDD}% limit</p></div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center"><p className="text-[10px] text-gray-500 mb-1">Overall DD Remaining</p><div className="h-3 rounded-full bg-white/[0.06] mb-1"><div className="h-full rounded-full transition-all" style={{ width: `${Math.max(0, (overallDDRemaining / dbOverallDD) * 100)}%`, background: overallDDRemaining > dbOverallDD * 0.5 ? '#22c55e' : overallDDRemaining > dbOverallDD * 0.3 ? '#f59e0b' : '#ef4444' }} /></div><p className="text-sm font-bold" style={{ color: overallDDRemaining > dbOverallDD * 0.5 ? '#22c55e' : overallDDRemaining > dbOverallDD * 0.3 ? '#f59e0b' : '#ef4444' }}>{overallDDRemaining.toFixed(2)}%</p><p className="text-[9px] text-gray-600">of {dbOverallDD}% limit</p></div>
        </div>
        {/* Max risk */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex justify-between items-center"><div><p className="text-xs font-bold text-amber-400">Maximum Safe Risk (Next Trade)</p><p className="text-[10px] text-gray-500">40% of daily DD remaining OR 15% of overall DD remaining (whichever is lower)</p></div><p className="text-lg font-extrabold" style={{ color: maxNextRisk >= 0.5 ? '#22c55e' : maxNextRisk >= 0.25 ? '#f59e0b' : '#ef4444' }}>{Math.max(0, maxNextRisk).toFixed(2)}%</p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Mandatory Days Off</p><h2 className="text-2xl font-extrabold mb-4">When NOT to Trade</h2><div className="space-y-3">{mandatoryDaysOff.map((m, i) => (<div key={i}><button onClick={() => toggle(`md-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold" style={{ color: m.color }}>{m.trigger}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`md-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`md-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05] space-y-1"><p className="text-xs text-green-400">Action: {m.action}</p><p className="text-xs text-gray-400 mt-1">{m.reason}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; The Infinite Game</p><h2 className="text-2xl font-extrabold mb-4">Long-Term Thinking Wins</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#22c55e]">12 MONTHS AT 2%</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">&pound;100K account at 2% monthly = &pound;2,000 gross &times; 80% = &pound;1,600 take-home per month. &pound;19,200 per year. Not glamorous. Absolutely real. And it compounds if you add accounts.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#3b82f6]">3 ACCOUNTS AT 2%</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">3 &times; &pound;100K at 2% monthly = &pound;4,800/month take-home. &pound;57,600/year. Same skill. Same strategy. Three accounts instead of one. This is the scaling path from Lesson 9.10.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">THE ALTERNATIVE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Chasing 8% monthly lasts 2\u20133 months before DD breach terminates the account. Total earned: &pound;5,000. Time to rebuild: 2\u20133 months of new challenges. Net result: less than the 2% trader after 6 months.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">THE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">The funded account is an infinite game. Every decision should serve survival and compounding over years, not maximising this month\u2019s payout.</span></p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p><h2 className="text-2xl font-extrabold mb-4">4 Funded Account Errors</h2><div className="space-y-3">{commonMistakes.map((item, i) => (<div key={i}><button onClick={() => toggle(`cm-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`cm-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`cm-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-xs text-red-400 mb-2">&#10060; {item.mistake}</p><p className="text-xs text-green-400">&#10004; {item.fix}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Cheat Sheet</p><h2 className="text-2xl font-extrabold mb-4">Funded Management Quick Reference</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#ef4444]">SURVIVAL FIRST</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">DD management is your job. Profit is a byproduct. Reduce funded risk to 0.5% (50\u201375% of challenge risk). The account that survives earns.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#f59e0b]">CATCH THE BLEED</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Track weekly net P&amp;L. 2 consecutive negative weeks = stop, diagnose, fix. Catch it at -2%, not -4.5%.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#3b82f6]">MANDATORY DAYS OFF</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">After 2 losing days, after 60% DD used, after rule breaks, after payouts, and end of every month. Days off cost zero DD and prevent compounding mistakes.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#22c55e]">INFINITE GAME</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">2% monthly &times; 12 months = &pound;19,200/year on one &pound;100K account. Scale by adding accounts, not by increasing risk. Consistency compounds.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">THE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Protect mode is the DEFAULT. Not a phase you enter when things go wrong. Funded trading IS protect mode. Every trade, every day, every month.</span></p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Test Your Understanding</p><h2 className="text-2xl font-extrabold mb-2">Funded Account Game</h2><p className="text-gray-400 text-sm mb-6">5 scenario-based rounds. Manage the slow bleed, handle payouts, detect rule breaks, and make DD decisions.</p>
      <div className="p-6 rounded-2xl glass-card"><div className="flex items-center justify-between mb-4"><span className="text-xs font-bold text-amber-400">Round {gameRound + 1} of {gameRounds.length}</span><span className="text-xs font-mono text-gray-500">{gameScore}/{gameRounds.length} correct</span></div><p className="text-sm text-gray-300 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: gameRounds[gameRound].scenario }} /><div className="space-y-2">{gameRounds[gameRound].options.map((opt, oi) => { const answered = gameAnswers[gameRound] !== null; const selected = gameAnswers[gameRound] === oi; const isCorrect = opt.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return (<div key={oi}><button onClick={() => handleGameAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt.text }} /></button>{answered && selected && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]"><p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`} dangerouslySetInnerHTML={{ __html: opt.explain }} /></motion.div>)}</div>); })}</div>{gameAnswers[gameRound] !== null && gameRound < gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5"><button onClick={() => setGameRound(r => r + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button></motion.div>)}{gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Outstanding \u2014 you can manage a funded account like a professional trader.' : gameScore >= 3 ? 'Good \u2014 review the slow bleed detection and rule break scenarios for extra resilience.' : 'Re-read the survival priorities and slow bleed sections. Funded management is the difference between a 2-month career and a lifetime income.'}</p></motion.div>)}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Knowledge Check</p><h2 className="text-2xl font-extrabold mb-6">Final Quiz &mdash; 8 Questions</h2>
      <div className="space-y-6">{quizQuestions.map((q, qi) => (<div key={qi} className="p-5 rounded-2xl glass-card"><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p><p className="text-sm font-semibold text-white mb-4">{q.q}</p><div className="space-y-2">{q.opts.map((opt, oi) => { const answered = quizAnswers[qi] !== null; const selected = quizAnswers[qi] === oi; const isCorrect = oi === q.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return <button key={oi} onClick={() => handleQuizAnswer(qi, oi)} disabled={answered} className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`}>{opt}</button>; })}</div>{quizAnswers[qi] !== null && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg bg-white/[0.02]"><p className="text-xs text-amber-400" dangerouslySetInnerHTML={{ __html: `<span class="font-bold">&#9989;</span> ${q.explain}` }} /></motion.div>)}</div>))}</div>
      {quizDone && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center"><p className="text-3xl font-extrabold mb-2">{quizScoreVal}%</p><p className="text-sm text-gray-400">{quizScoreVal >= 66 ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate. Review and try again.'}</p></motion.div>)}
      {certUnlocked && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10"><div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}><div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(139,92,246,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} /><div className="relative z-10 text-center"><div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">&#128737;&#65039;</div><p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p><p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 9: Funded Account Management</strong><br />at ATLAS Academy by Interakktive</p><p className="bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Account Guardian &mdash;</p><p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L9.8-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p></div></div></motion.div>)}</motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-20 text-center"><Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">&larr; Back to Academy</Link></section>
    </div>
  );
}
