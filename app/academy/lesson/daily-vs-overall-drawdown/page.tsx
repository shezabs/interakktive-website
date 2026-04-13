// app/academy/lesson/daily-vs-overall-drawdown/page.tsx
// ATLAS Academy — Lesson 9.9: Daily Drawdown vs Overall Drawdown [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 9
// GROUNDBREAKING: Dual Drawdown Simulator — trade-by-trade with live gauges
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
const ddComparison = [
  { aspect: 'What It Measures', daily: 'Maximum loss allowed in a single calendar day', overall: 'Maximum cumulative loss allowed from starting balance (or highest equity if trailing)', color: '#3b82f6' },
  { aspect: 'Reset', daily: 'Resets every day at midnight (server time)', overall: 'NEVER resets \u2014 cumulative from Day 1', color: '#f59e0b' },
  { aspect: 'Typical Limit', daily: '4\u20135% of starting balance', overall: '8\u201310% of starting balance (or from highest equity if trailing)', color: '#22c55e' },
  { aspect: 'Kill Speed', daily: 'Can terminate your account in a SINGLE morning', overall: 'Gradual \u2014 the slow bleed over days or weeks', color: '#ef4444' },
  { aspect: 'Which Is Deadlier', daily: 'Daily DD kills MORE traders \u2014 it resets daily so you forget how close you were yesterday', overall: 'Overall DD is harder to recover from \u2014 every loss is permanent and cumulative', color: '#8b5cf6' },
];

const openPLScenarios = [
  { title: 'The Hidden Killer', trades: '3 open positions, each at -0.8% unrealised', dailyUsed: 2.4, dailyLimit: 5, status: 'WARNING', desc: 'You have not CLOSED anything. But your daily DD is at 48% used. One more adverse tick across all 3 and you approach breach territory. At firms that count open P&L, your UNREALISED losses are treated as REALISED for DD purposes.' },
  { title: 'The False Safety', trades: '2 open: one at +1.2%, one at -1.8%. Net: -0.6%', dailyUsed: 1.8, dailyLimit: 5, status: 'DANGER', desc: 'Net open P&L is -0.6%. But some firms calculate daily DD per POSITION, not net. The -1.8% position alone has consumed 36% of your daily limit. If it worsens to -2.5% before the winner closes, you are at 50% daily DD from ONE trade.' },
  { title: 'The Midnight Trap', trades: 'Open trade at -1.5% carried past midnight', dailyUsed: 1.5, dailyLimit: 5, status: 'CRITICAL', desc: 'Your daily DD RESET at midnight. The open trade\u2019s -1.5% unrealised loss is now counted against TODAY\u2019s fresh 5% limit. You start the new day already down 1.5% before taking a single new trade. Your actual daily DD buffer is 3.5%, not 5%.' },
];

const safeZoneRules = [
  { zone: 'GREEN ZONE (0\u201340% used)', dailyUsed: '0\u20132%', overallUsed: '0\u20134%', action: 'Trade normally at planned risk. All systems nominal. Execute the plan.', color: '#22c55e' },
  { zone: 'AMBER ZONE (40\u201360% used)', dailyUsed: '2\u20133%', overallUsed: '4\u20136%', action: 'Proceed with caution. Reduce to 0.5% risk. No new positions if 2+ already open. Consider stopping for the day if daily is amber.', color: '#f59e0b' },
  { zone: 'RED ZONE (60\u201380% used)', dailyUsed: '3\u20134%', overallUsed: '6\u20138%', action: 'STOP trading for today (daily) or REDUCE risk to 0.25\u20130.35% (overall). Diagnose the cause. Do NOT chase recovery.', color: '#ef4444' },
  { zone: 'CRITICAL (&gt;80% used)', dailyUsed: '4%+', overallUsed: '8%+', action: 'EMERGENCY. Close all positions. Stop trading for 2\u20133 days minimum. Review entire strategy. Consider whether the account is salvageable at ultra-low risk.', color: '#ef4444' },
];

const calculationMethods = [
  { method: 'Balance-Based Daily DD', formula: 'Daily DD Floor = Starting Day Balance \u2212 (Balance \u00D7 DD%)', example: 'Balance at day start: \u00A3102,000. DD limit: 5%. Floor = \u00A3102,000 \u2212 \u00A35,100 = \u00A396,900. If equity drops below \u00A396,900 at any point today, account terminated.', note: 'Most common. Resets at midnight based on starting balance of that day (not equity).', color: '#3b82f6' },
  { method: 'Equity-Based Daily DD', formula: 'Daily DD Floor = Starting Day Equity \u2212 (Equity \u00D7 DD%)', example: 'Equity at day start: \u00A398,500 (you have open losers from yesterday). DD limit: 5%. Floor = \u00A398,500 \u2212 \u00A34,925 = \u00A393,575. Your buffer is SMALLER because open losses reduced starting equity.', note: 'Rarer but deadlier. Open P&L from yesterday reduces today\u2019s buffer. Holding losers overnight compounds the danger.', color: '#f59e0b' },
  { method: 'Static Overall DD', formula: 'Overall DD Floor = Initial Funded Balance \u2212 (Balance \u00D7 DD%)', example: 'Funded at \u00A3100,000. Overall DD: 10%. Floor = \u00A390,000. FOREVER. Even if you profit to \u00A3115,000, the floor stays at \u00A390,000. You have \u00A325,000 of buffer.', note: 'Best for traders. The floor never moves up. Profits BUILD your buffer. This is the safer type.', color: '#22c55e' },
  { method: 'Trailing Overall DD', formula: 'Overall DD Floor = Highest Equity Ever \u2212 (Highest \u00D7 DD%)', example: 'Funded at \u00A3100K, reach \u00A3108K. Floor = \u00A3108K \u2212 \u00A310,800 = \u00A397,200. Now pull back to \u00A3103K. Buffer = only \u00A35,800 (not \u00A313K). Profits RAISED your floor permanently.', note: 'Most dangerous type. Every new equity high raises the floor that can never go back down. Pullbacks from highs consume buffer permanently.', color: '#ef4444' },
];

const commonMistakes = [
  { title: 'Not Knowing Which DD Type Your Firm Uses', mistake: '"I have a 5% daily DD." But is it balance-based or equity-based? Does it include open P&L? Is the overall DD static or trailing? These details change EVERYTHING. A 5% equity-based DD with open P&L is dramatically tighter than a 5% balance-based DD on closed trades.', fix: 'Read the full DD specification in your firm\u2019s rules. Email support if unclear. You MUST know: (1) Balance or equity based? (2) Open P&L included? (3) Static or trailing? Get written confirmation before your first trade.' },
  { title: 'Forgetting That Daily DD Resets', mistake: '"I was at -3.8% yesterday and survived. Today I have a fresh start." TRUE \u2014 but yesterday\u2019s -3.8% ALSO hit your overall DD. You now have 6.2% of overall remaining (if you started at 0). The daily reset gives you a fresh 5%, but the overall never forgives.', fix: 'Track BOTH numbers daily. A spreadsheet or journal entry: "Daily DD used today: X%. Overall DD remaining: Y%." The daily resets. The overall does not. Both can kill you.' },
  { title: 'Holding Losers Past Midnight', mistake: '"I will hold this losing trade overnight because tomorrow it might recover." If the firm calculates daily DD from equity, your -1.5% open loss carries into tomorrow\u2019s fresh calculation. Your new day starts at 3.5% daily buffer instead of 5%. You gave away 30% of tomorrow\u2019s safety by hoping for a recovery.', fix: 'Close losing trades before midnight if your firm uses equity-based daily DD. The "hope" trade costs you tomorrow\u2019s DD buffer regardless of whether it recovers. Close, accept the loss, start fresh.' },
  { title: 'Multiple Positions Stacking DD', mistake: '"Each position is only 0.75% risk, so I am safe." Three positions at 0.75% each = 2.25% daily DD exposure if ALL stop out. Add correlation (two USD pairs moving together) and actual exposure could be 3\u20134%. One bad news event hits all 3 and you are at 60\u201380% of daily DD in minutes.', fix: 'Calculate TOTAL exposure: sum of all open position risks + correlation adjustment. Never exceed 2% total exposure across all positions. This is the "stacking rule" from Lesson 9.8.' },
];

const gameRounds = [
  { scenario: '<strong>Daily vs overall interaction:</strong> Your \u00A3100K funded account. Day start balance: \u00A3101,500 (+1.5% overall profit). Daily DD: 5%. Overall DD: 10% (static from \u00A3100K). You lose 2 trades this morning: -0.75% each = -1.5% for the day. What are your current DD numbers?', options: [
    { text: 'Daily DD used: 1.5% of 5% (30%). Overall DD: safe because you are still in profit at +0% net.', correct: false, explain: 'Daily DD is correct at 1.5% used (30%). But overall DD is not "safe because you are in profit." Your overall is measured from \u00A3100,000 starting balance. Current equity: \u00A3101,500 \u2212 \u00A31,500 = \u00A3100,000. Overall DD used: 0%. Floor is \u00A390,000. So you are correct that overall is healthy \u2014 but the reasoning should be "0% of overall DD used" not "in profit therefore safe."' },
    { text: 'Daily DD: 1.5% used of 5% limit (3.5% remaining, 70% buffer). Overall DD: 0% used (equity back to \u00A3100,000 which is the funded balance, floor is \u00A390,000, full 10% buffer). Daily is the constraint today, not overall.', correct: true, explain: 'Precise tracking. Daily: 1.5% consumed, 3.5% remaining (70% buffer \u2014 amber zone approaching). Overall: equity at \u00A3100,000 = funded balance, 0% consumed, full 10% buffer. Today\u2019s risk is the daily limit: 2 more losses at 0.75% puts daily at 3% (60%, red zone). The 2-loss rule would say STOP here.' },
    { text: 'Both are at 1.5% used. Daily and overall always match.', correct: false, explain: 'They do not always match. Daily resets each day; overall is cumulative. In this case, you started the day at +1.5% overall. The 1.5% daily loss returns overall to 0%. But if you started the day at -3% overall, the same 1.5% daily loss would put overall at -4.5%. Daily and overall can diverge significantly.' },
  ]},
  { scenario: '<strong>Open P&L trap:</strong> Your firm counts open P&L toward daily DD. You have 2 open Gold trades, both currently at -0.9% unrealised each. Total open P&L: -1.8%. You have not closed anything today. Daily DD limit: 5%. An A+ setup appears on EUR/USD. Should you take it?', options: [
    { text: 'Yes \u2014 the open P&L is unrealised so it does not count', correct: false, explain: 'At YOUR firm, it DOES count. That is the critical point. With -1.8% in open P&L, your daily DD is already at 36% used. Adding a new 0.75% risk trade creates a scenario where all 3 positions losing puts you at -1.8% + -0.9% (Gold worsens) + -0.75% (EUR loses) = -3.45% daily DD. That is 69% \u2014 deep red zone from one new trade.' },
    { text: 'No \u2014 with 1.8% daily DD already consumed by open P&L, adding a new position creates unacceptable stacking risk. Close or reduce the Gold trades first, THEN evaluate the EUR setup.', correct: true, explain: 'The correct sequence: (1) Address existing exposure first (close one Gold trade to reduce open P&L), (2) Recalculate daily DD remaining, (3) THEN evaluate whether the EUR setup fits within your remaining buffer. Never ADD positions when existing positions are consuming significant DD. Manage first, then trade.' },
    { text: 'Take it but with 0.25% risk to keep total exposure low', correct: false, explain: 'Better than full risk, but the fundamental problem remains: -1.8% open P&L + -0.25% potential = -2.05% minimum. And the Gold trades could worsen simultaneously. At 0.25% risk, the EUR trade adds marginal DD exposure, but it also adds mental load and monitoring overhead while 2 positions are already underwater. Simplify first.' },
  ]},
  { scenario: '<strong>Trailing DD trap:</strong> Your firm uses trailing overall DD. Funded at \u00A3100K with 10% trailing DD. You reached \u00A3108K equity peak last week. Current equity: \u00A3103K. What is your actual DD buffer?', options: [
    { text: '\u00A313K buffer (from \u00A3103K down to \u00A390K floor)', correct: false, explain: 'This would be true with STATIC DD. But your firm uses TRAILING DD. The floor MOVED UP when you hit \u00A3108K. New floor = \u00A3108K \u2212 10% = \u00A397,200. Your actual buffer = \u00A3103K \u2212 \u00A397,200 = \u00A35,800. That is less than HALF of what you thought.' },
    { text: '\u00A35,800 buffer (from \u00A3103K down to \u00A397,200 trailing floor). The \u00A3108K peak raised the floor to \u00A397,200 permanently. You lost \u00A37,200 of DD buffer from the pullback.', correct: true, explain: 'Exactly. Trailing DD means every equity peak raises the floor. Peak at \u00A3108K \u2192 floor at \u00A397,200. Pullback to \u00A3103K consumed \u00A35K of your buffer WITHOUT you losing a single trade today. The pullback is PERMANENT DD consumption. This is why trailing DD is the most dangerous type \u2014 profits create risk, not safety.' },
    { text: '\u00A310K buffer (10% of current equity \u00A3103K = \u00A310,300, floor at \u00A392,700)', correct: false, explain: 'Trailing DD is calculated from the HIGHEST equity ever reached, not current equity. The floor follows the peak up but NEVER comes back down. Your highest was \u00A3108K, so the floor is permanently at \u00A397,200 (not \u00A392,700).' },
  ]},
  { scenario: '<strong>The midnight reset:</strong> It is 23:45 (server time, midnight reset at 00:00). You have an open trade at -1.2% unrealised on your equity-based daily DD firm. You believe it will recover tomorrow. The trade is in your direction based on higher-timeframe analysis. What do you do?', options: [
    { text: 'Hold through midnight \u2014 the analysis supports the direction and it will probably recover', correct: false, explain: 'At an equity-based firm, your daily DD resets based on STARTING EQUITY. If you hold the -1.2% past midnight, tomorrow starts with equity at -1.2%. Your new daily buffer is 5% \u2212 1.2% = 3.8% instead of 5%. You sacrificed 24% of tomorrow\u2019s safety net for "probably." And if it gaps further against you overnight, you could start the day even deeper.' },
    { text: 'Close before midnight. Accept the -1.2% realised loss. Start tomorrow at full 5% daily DD buffer with a clean slate. The overnight recovery is uncertain; the DD impact is certain.', correct: true, explain: 'The asymmetry: closing = certain -1.2% to overall DD + full daily buffer tomorrow. Holding = uncertain recovery + guaranteed reduced daily buffer tomorrow + overnight gap risk. The certain outcome (full buffer) is more valuable than the uncertain one (recovery). Close, accept, reset. Tomorrow is a new day with full DD capacity.' },
    { text: 'Set a tight stop at -1.5% and let it run through midnight', correct: false, explain: 'A tight stop does not protect against overnight gaps. If the market gaps 50 pips at the open, your stop is skipped and filled at -2% or worse. On a balance-based firm this is less critical, but on your equity-based firm, the -1.5% (or worse) directly reduces tomorrow\u2019s daily DD buffer. Close clean before midnight.' },
  ]},
  { scenario: '<strong>Combined stress test:</strong> Friday afternoon. Overall DD: -6.2% used (3.8% remaining). Today\u2019s daily DD: -2.1% used (2.9% remaining). You have 1 open trade at +0.5% unrealised profit. Weekend is approaching. The trade is a swing that your analysis says should continue Monday. But you also remember that weekend gaps average 50\u2013100 pips on your instrument. What do you do?', options: [
    { text: 'Hold through the weekend \u2014 the analysis supports continuation and you are in profit on this trade', correct: false, explain: 'At -6.2% overall DD with only 3.8% remaining, a 100-pip adverse weekend gap could consume 1\u20132% of your buffer instantly. That takes you to 1.8\u20132.8% remaining \u2014 one bad Monday morning from termination. The +0.5% unrealised profit is tiny compared to the potential gap loss. Your overall DD position cannot absorb a gap.' },
    { text: 'Close before the weekend. Lock in the +0.5% profit. With only 3.8% overall DD remaining, you cannot afford uncontrollable weekend gap risk. Re-enter Monday if the setup is still valid.', correct: true, explain: 'Survival arithmetic: +0.5% locked in improves overall to -5.7% (4.3% remaining). Weekend gap risk eliminated. Monday you start with full daily DD and can re-enter if the setup persists. The trade idea does not disappear over the weekend \u2014 but your account could. At 3.8% overall remaining, every uncontrolled risk is an existential threat.' },
    { text: 'Set a wide stop-loss to survive the gap and hold', correct: false, explain: 'Stop-losses do NOT protect during weekend gaps. The market closes Friday and opens Monday at a different price. If it gaps 100 pips against you, your stop at 50 pips is skipped entirely. You are filled at the Monday open price regardless of where your stop was. With 3.8% remaining, this is Russian roulette.' },
  ]},
];

const quizQuestions = [
  { q: 'What is the key difference between daily and overall drawdown?', opts: ['Daily is smaller and overall is bigger', 'Daily resets each day (fresh buffer every morning); overall is cumulative and never resets', 'Daily measures wins and overall measures losses', 'They are the same thing measured differently'], correct: 1, explain: 'Daily DD resets at midnight server time, giving you a fresh buffer each morning. Overall DD is cumulative from Day 1 and never resets \u2014 every loss is permanent. Both can terminate your account, but daily kills in one bad morning while overall kills over weeks.' },
  { q: 'Why is the daily DD the bigger killer even though the overall DD limit is larger?', opts: ['Because daily DD includes commissions', 'Because the daily reset creates a false sense of safety \u2014 yesterday\u2019s 4.2% close call is forgotten, leading to repeated near-misses that eventually breach', 'Because overall DD limits are more generous', 'Because daily DD is calculated differently at each firm'], correct: 1, explain: 'The daily DD resets, so you forget how close you were. A -4.2% day feels like "I survived." But the BEHAVIOUR that produced -4.2% repeats, and eventually becomes -5.1% (breach). The reset enables complacency. Track your daily DD highs and treat any day above -3% as a warning, not a near-miss.' },
  { q: 'What happens when a firm counts OPEN P&L toward daily DD?', opts: ['Nothing different \u2014 only closed trades matter', 'Unrealised losses on open positions count against your daily limit, meaning 3 positions each at -0.8% consume 2.4% of your 5% buffer before you close anything', 'It means you cannot hold positions overnight', 'Open P&L is only counted at the end of the day'], correct: 1, explain: 'Open P&L inclusion means your unrealised losses are treated as if they were realised for DD purposes. Three open positions at -0.8% each = 2.4% of daily DD consumed in real-time. If all three worsen simultaneously, you can breach daily DD without closing a single trade.' },
  { q: 'What is the difference between STATIC and TRAILING overall drawdown?', opts: ['Static is for demo accounts, trailing is for funded accounts', 'Static floor stays at (starting balance minus DD%) forever; trailing floor rises with every new equity high and never comes back down', 'Static is measured daily, trailing is measured weekly', 'There is no meaningful difference'], correct: 1, explain: 'Static: floor = \u00A390K forever on a \u00A3100K/10% account. Profits BUILD buffer. Trailing: floor follows equity highs. Peak at \u00A3108K raises floor to \u00A397,200. Pullback to \u00A3103K leaves only \u00A35,800 buffer. Trailing is dramatically harder to survive because profits RAISE the danger line.' },
  { q: 'Why should you close losing trades before midnight on an equity-based daily DD firm?', opts: ['To avoid overnight swap fees', 'Because the -1.2% open loss carries into tomorrow\u2019s fresh DD calculation, reducing your new day\u2019s buffer from 5% to 3.8% before you take a single trade', 'Because firms charge penalties for overnight positions', 'It makes no difference when you close'], correct: 1, explain: 'On equity-based firms, tomorrow\u2019s daily DD starts from your starting equity \u2014 which includes open P&L. A -1.2% open loss means tomorrow begins with only 3.8% daily buffer. You sacrificed 24% of tomorrow\u2019s safety for the uncertain hope of overnight recovery. Close, accept, start fresh.' },
  { q: 'What is the "60% safe zone rule"?', opts: ['Never use more than 60% of your account balance', 'Never consume more than 60% of your daily DD limit in a single day \u2014 the remaining 40% is your safety net for unexpected moves', 'Trade only 60% of available sessions', 'Risk 60% of your position on each trade'], correct: 1, explain: 'At 60% of daily DD used (e.g., 3% of a 5% limit), STOP. The remaining 40% (2%) is your safety net for unexpected adverse moves, spread widening, or final-trade slippage. Trading beyond 60% means one unexpected event can push you into breach territory.' },
  { q: 'With 3.8% overall DD remaining on a Friday afternoon, why should you close all positions before the weekend?', opts: ['To avoid weekend swap charges', 'Because weekend gaps cannot be controlled by stop-losses \u2014 the market opens Monday at a new price regardless of your stop, and a 100-pip gap could consume 1\u20132% of your remaining 3.8% buffer', 'Because firms do not allow weekend holds', 'To free up margin for Monday'], correct: 1, explain: 'Stop-losses do not work during market closures. A 100-pip adverse gap on Monday open fills at the new price, not your stop. With only 3.8% remaining, a 1\u20132% gap takes you to 1.8\u20132.8% \u2014 one bad morning from termination. The weekend hold risk is existential at this DD level. Close everything.' },
  { q: 'If you have 3 open positions at 0.75% risk each, what is your ACTUAL daily DD exposure?', opts: ['0.75% \u2014 risk is measured per trade', '2.25% minimum, possibly higher due to correlation \u2014 all 3 stopping out simultaneously consumes 2.25% and correlated pairs could move together for 3\u20134% actual impact', '3 \u00D7 0.75% = 2.25% maximum, correlation does not matter', 'Only the largest position counts'], correct: 1, explain: 'Three positions at 0.75% each = 2.25% if all stop out. But if two positions are correlated USD pairs, they move together \u2014 meaning all three could stop out in the same adverse move. Actual exposure could be 3\u20134% if correlation amplifies the losses. Always calculate TOTAL exposure plus correlation adjustment.' },
];

/* ─── SIMULATOR STATE ─── */
type SimTrade = { result: 'win' | 'loss'; risk: number; rr: number; pnl: number };

export default function DailyVsOverallDD() {
  const [scrollY, setScrollY] = useState(0);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [gameRound, setGameRound] = useState(0);
  const [gameAnswers, setGameAnswers] = useState<(number | null)[]>(Array(gameRounds.length).fill(null));
  const [gameScore, setGameScore] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(Array(quizQuestions.length).fill(null));
  const [showConfetti, setShowConfetti] = useState(false);
  const [certUnlocked, setCertUnlocked] = useState(false);
  /* Simulator */
  const [simTrades, setSimTrades] = useState<SimTrade[]>([]);
  const [simDailyDD, setSimDailyDD] = useState(0);
  const [simOverallDD, setSimOverallDD] = useState(0);
  const [simOpenPL, setSimOpenPL] = useState(0);
  const [simIncludeOpen, setSimIncludeOpen] = useState(false);
  const [simDayNum, setSimDayNum] = useState(1);
  const [simBreach, setSimBreach] = useState<string | null>(null);

  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);
  const toggle = (id: string) => setOpenSections(s => ({ ...s, [id]: !s[id] }));

  const handleGameAnswer = (oi: number) => { if (gameAnswers[gameRound] !== null) return; const a = [...gameAnswers]; a[gameRound] = oi; setGameAnswers(a); if (gameRounds[gameRound].options[oi].correct) setGameScore(s => s + 1); };
  const handleQuizAnswer = (qi: number, oi: number) => { if (quizAnswers[qi] !== null) return; const a = [...quizAnswers]; a[qi] = oi; setQuizAnswers(a); };

  const quizDone = quizAnswers.every(a => a !== null);
  const quizScoreVal = quizDone ? Math.round(quizAnswers.reduce<number>((s, a, i) => s + (a === quizQuestions[i].correct ? 1 : 0), 0) / quizQuestions.length * 100) : 0;
  useEffect(() => { if (quizDone && quizScoreVal >= 66 && !certUnlocked) { setCertUnlocked(true); setShowConfetti(true); const t = setTimeout(() => setShowConfetti(false), 4000); return () => clearTimeout(t); } }, [quizDone, quizScoreVal, certUnlocked]);

  /* Simulator functions */
  const addSimTrade = (win: boolean) => {
    if (simBreach) return;
    const risk = 0.75;
    const rr = 1.5;
    const pnl = win ? risk * rr : -risk;
    const trade: SimTrade = { result: win ? 'win' : 'loss', risk, rr, pnl };
    const newTrades = [...simTrades, trade];
    const newDaily = simDailyDD + (pnl < 0 ? Math.abs(pnl) : -pnl * 0.1);
    const actualDaily = pnl < 0 ? simDailyDD + Math.abs(pnl) : Math.max(0, simDailyDD - 0);
    const newOverall = simOverallDD + (pnl < 0 ? Math.abs(pnl) : 0) - (pnl > 0 ? pnl : 0);
    const effectiveDaily = simIncludeOpen ? actualDaily + Math.max(0, simOpenPL) : actualDaily;
    setSimTrades(newTrades);
    if (pnl < 0) setSimDailyDD(simDailyDD + Math.abs(pnl));
    setSimOverallDD(prev => prev - pnl);
    if (simDailyDD + (pnl < 0 ? Math.abs(pnl) : 0) >= 5) setSimBreach('DAILY DD BREACH');
    if (simOverallDD - pnl >= 10) setSimBreach('OVERALL DD BREACH');
  };
  const addOpenPL = (val: number) => { setSimOpenPL(val); if (simIncludeOpen && simDailyDD + Math.abs(val) >= 5) setSimBreach('DAILY DD BREACH (Open P&L)'); };
  const newDay = () => { setSimDailyDD(0); setSimDayNum(d => d + 1); setSimOpenPL(0); };
  const resetSim = () => { setSimTrades([]); setSimDailyDD(0); setSimOverallDD(0); setSimOpenPL(0); setSimDayNum(1); setSimBreach(null); };

  const dailyPct = Math.min(100, (simDailyDD / 5) * 100);
  const overallPct = Math.min(100, (simOverallDD / 10) * 100);
  const dailyColor = dailyPct < 40 ? '#22c55e' : dailyPct < 60 ? '#f59e0b' : '#ef4444';
  const overallColor = overallPct < 40 ? '#22c55e' : overallPct < 60 ? '#f59e0b' : '#ef4444';

  /* ─── DRAW FUNCTIONS ─── */
  const drawDualGauges = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const cx = w / 2;
    const cy = h / 2;
    const cycle = f % 600;
    // Simulate a trading day
    const trades = [
      { t: 0, daily: 0, overall: 0, label: 'Day Start' },
      { t: 60, daily: 0.75, overall: 0.75, label: 'Trade 1: Loss (-0.75%)' },
      { t: 120, daily: 0.75, overall: -0.375, label: 'Trade 2: Win (+1.125%)' },
      { t: 180, daily: 1.5, overall: 0.375, label: 'Trade 3: Loss (-0.75%)' },
      { t: 240, daily: 2.25, overall: 1.125, label: 'Trade 4: Loss (-0.75%)' },
      { t: 300, daily: 0, overall: 1.125, label: '\u2014 MIDNIGHT RESET \u2014' },
      { t: 360, daily: 0.75, overall: 1.875, label: 'Day 2 Trade 1: Loss (-0.75%)' },
      { t: 420, daily: 0.75, overall: 0.75, label: 'Day 2 Trade 2: Win (+1.125%)' },
      { t: 480, daily: 1.5, overall: 1.5, label: 'Day 2 Trade 3: Loss (-0.75%)' },
      { t: 540, daily: 2.25, overall: 2.25, label: 'Day 2 Trade 4: Loss (-0.75%)' },
    ];
    const active = trades.filter(t => t.t <= cycle);
    const current = active[active.length - 1] || trades[0];
    const gaugeW = (w - 60) / 2;
    const gaugeH = 20;
    const gaugeY = cy - 10;
    // Daily gauge
    ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(20, gaugeY, gaugeW, gaugeH);
    const dailyFill = Math.min(1, current.daily / 5);
    const dCol = dailyFill < 0.4 ? '#22c55e' : dailyFill < 0.6 ? '#f59e0b' : '#ef4444';
    ctx.fillStyle = dCol + 'aa'; ctx.fillRect(20, gaugeY, gaugeW * dailyFill, gaugeH);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 9px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText('DAILY DD', 20 + gaugeW / 2, gaugeY - 4);
    ctx.fillStyle = dCol; ctx.textBaseline = 'top'; ctx.fillText(`${current.daily.toFixed(2)}% / 5%`, 20 + gaugeW / 2, gaugeY + gaugeH + 4);
    // Overall gauge
    const oX = 40 + gaugeW;
    ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(oX, gaugeY, gaugeW, gaugeH);
    const overallFill = Math.min(1, current.overall / 10);
    const oCol = overallFill < 0.4 ? '#22c55e' : overallFill < 0.6 ? '#f59e0b' : '#ef4444';
    ctx.fillStyle = oCol + 'aa'; ctx.fillRect(oX, gaugeY, gaugeW * Math.max(0, overallFill), gaugeH);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 9px system-ui'; ctx.textBaseline = 'bottom';
    ctx.fillText('OVERALL DD', oX + gaugeW / 2, gaugeY - 4);
    ctx.fillStyle = oCol; ctx.textBaseline = 'top'; ctx.fillText(`${Math.max(0, current.overall).toFixed(2)}% / 10%`, oX + gaugeW / 2, gaugeY + gaugeH + 4);
    // Current action
    ctx.fillStyle = current.label.includes('MIDNIGHT') ? '#f59e0b' : 'rgba(255,255,255,0.5)';
    ctx.font = `${current.label.includes('MIDNIGHT') ? 'bold ' : ''}9px system-ui`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText(current.label, cx, h - 6);
    // Highlight midnight reset
    if (current.label.includes('MIDNIGHT')) {
      ctx.fillStyle = 'rgba(245,158,11,0.15)'; ctx.fillRect(0, gaugeY - 20, w, gaugeH + 40);
    }
    // Title
    ctx.fillStyle = 'rgba(245,158,11,0.6)'; ctx.font = 'bold 9px system-ui'; ctx.textBaseline = 'top';
    ctx.fillText('Daily resets at midnight. Overall never resets.', cx, 6);
  }, []);

  const drawOpenPLTrap = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const cx = w / 2;
    const cy = h / 2;
    const cycle = f % 300;
    const phase = Math.floor(cycle / 100) % 3;
    const scenario = openPLScenarios[phase];
    // DD gauge
    const gaugeW = w - 60;
    const gaugeH = 24;
    const gaugeY = cy - 30;
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.beginPath();
    const r = 6;
    ctx.moveTo(30 + r, gaugeY); ctx.lineTo(30 + gaugeW - r, gaugeY);
    ctx.quadraticCurveTo(30 + gaugeW, gaugeY, 30 + gaugeW, gaugeY + r);
    ctx.lineTo(30 + gaugeW, gaugeY + gaugeH - r);
    ctx.quadraticCurveTo(30 + gaugeW, gaugeY + gaugeH, 30 + gaugeW - r, gaugeY + gaugeH);
    ctx.lineTo(30 + r, gaugeY + gaugeH);
    ctx.quadraticCurveTo(30, gaugeY + gaugeH, 30, gaugeY + gaugeH - r);
    ctx.lineTo(30, gaugeY + r);
    ctx.quadraticCurveTo(30, gaugeY, 30 + r, gaugeY);
    ctx.fill();
    // Fill
    const fill = scenario.dailyUsed / scenario.dailyLimit;
    const col = scenario.status === 'CRITICAL' ? '#ef4444' : scenario.status === 'DANGER' ? '#f97316' : '#f59e0b';
    ctx.fillStyle = col + 'aa';
    ctx.fillRect(30, gaugeY, gaugeW * fill, gaugeH);
    // Percentage
    ctx.fillStyle = '#fff'; ctx.font = 'bold 12px system-ui';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(`${scenario.dailyUsed}% / ${scenario.dailyLimit}%`, cx, gaugeY + gaugeH / 2);
    // Status badge
    ctx.fillStyle = col; ctx.font = 'bold 10px system-ui'; ctx.textBaseline = 'bottom';
    ctx.fillText(scenario.status, cx, gaugeY - 6);
    // Title
    ctx.fillStyle = '#fff'; ctx.font = 'bold 10px system-ui'; ctx.textBaseline = 'top';
    ctx.fillText(scenario.title, cx, 8);
    // Description
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '8px system-ui';
    ctx.textBaseline = 'top';
    const maxW = w - 40;
    const words = scenario.trades.split(' '); let line = ''; const lines: string[] = [];
    for (const word of words) { const t = line + (line ? ' ' : '') + word; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = word; } else { line = t; } }
    if (line) lines.push(line);
    let ly = gaugeY + gaugeH + 20;
    for (const l of lines) { ctx.fillText(l, cx, ly); ly += 12; }
  }, []);

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
          <motion.p variants={fadeUp} className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-4">Level 9 &middot; Lesson 9 of 14</motion.p>
          <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold leading-tight mb-4 bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Daily vs Overall Drawdown</motion.h1>
          <motion.p variants={fadeUp} className="text-gray-400 max-w-lg mx-auto text-sm leading-relaxed">The two kill switches. How they interact, why daily DD kills more accounts, the open P&amp;L trap, and the 60% safe zone rule.</motion.p>
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.8 }} className="absolute bottom-8 flex flex-col items-center gap-2 text-gray-600 text-xs">Scroll to begin<motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-amber-500">&#8964;</motion.div></motion.div>
      </section>

      <section className="max-w-2xl mx-auto px-5 py-20"><motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">00 &mdash; Why This Matters</p><h2 className="text-2xl font-extrabold mb-4">Two Limits. Two Threats. One Account.</h2><div className="p-6 rounded-2xl glass-card space-y-4">
        <p className="text-sm text-gray-300 leading-relaxed">Your funded account has two independent kill switches running simultaneously. The <strong className="text-white">daily drawdown</strong> limits how much you can lose TODAY. The <strong className="text-white">overall drawdown</strong> limits how much you can lose EVER. Breach either one and your account is terminated immediately. No warning. No second chance.</p>
        <p className="text-sm text-gray-300 leading-relaxed">Most traders understand these numbers but do not understand how they <strong className="text-white">interact</strong>. A bad day hits daily DD. A bad WEEK hits overall DD. Open positions can hit BOTH simultaneously without you closing a single trade. And the calculation method (balance vs equity, static vs trailing) changes everything.</p>
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-purple-500/10 border border-amber-500/20"><p className="text-xs font-bold text-amber-400 mb-1">&#9889; REAL SCENARIO</p><p className="text-xs text-gray-300">A funded trader with 5% daily DD and 10% overall DD was at -6.8% overall (3.2% remaining). One morning he lost 2 trades (-1.5% daily). Normal. But then he saw his overall was now at -8.3%. <strong className="text-white">He had less daily DD remaining (3.5%) than overall DD remaining (1.7%).</strong> One more loss at 0.75% would breach OVERALL even though daily was still within limits. He stopped, saved the account, and spent the next 2 weeks at 0.25% risk grinding back to -5%. The traders who do not track BOTH numbers do not catch this until termination.</p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Dual Gauges</p><h2 className="text-2xl font-extrabold mb-2">Watch Both Limits Move Together</h2><p className="text-gray-400 text-sm mb-4">Each trade moves both gauges. Daily resets at midnight. Overall never does. Watch how 2 days of trading affect each differently.</p>
      <div className="rounded-2xl glass-card p-4"><AnimScene drawFn={drawDualGauges} height={240} /></div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Open P&amp;L Trap</p><h2 className="text-2xl font-extrabold mb-2">Unrealised Losses That Kill</h2><p className="text-gray-400 text-sm mb-4">3 scenarios showing how open positions consume daily DD at firms that count unrealised P&amp;L.</p>
      <div className="rounded-2xl glass-card p-4"><AnimScene drawFn={drawOpenPLTrap} height={240} /></div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The 5 Differences</p><h2 className="text-2xl font-extrabold mb-4">Daily DD vs Overall DD</h2><div className="p-6 rounded-2xl glass-card space-y-2">{ddComparison.map((dc, i) => (<div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm font-bold" style={{ color: dc.color }}>{dc.aspect}</p><div className="grid grid-cols-2 gap-3 mt-1"><div><p className="text-[10px] text-gray-500">DAILY</p><p className="text-xs text-gray-300">{dc.daily}</p></div><div><p className="text-[10px] text-gray-500">OVERALL</p><p className="text-xs text-gray-300">{dc.overall}</p></div></div></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Calculation Methods</p><h2 className="text-2xl font-extrabold mb-4">How Firms Calculate DD</h2><div className="space-y-3">{calculationMethods.map((cm, i) => (<div key={i}><button onClick={() => toggle(`cm2-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold" style={{ color: cm.color }}>{cm.method}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`cm2-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`cm2-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05] space-y-1"><p className="text-xs text-gray-400">Formula: {cm.formula}</p><p className="text-xs text-gray-300 mt-1">Example: {cm.example}</p><p className="text-xs text-amber-400 mt-1">{cm.note}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      {/* S05 — GROUNDBREAKING: Dual Drawdown Simulator */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Experience It Live</p><h2 className="text-2xl font-extrabold mb-2">&#127919; Dual Drawdown Simulator</h2><p className="text-gray-400 text-sm mb-4">Enter trades one by one. Watch both DD gauges move in real-time. Toggle open P&amp;L mode. Reset the day. See how fast both limits can be consumed.</p>
      <div className="p-6 rounded-2xl glass-card space-y-4">
        <div className="flex items-center justify-between"><span className="text-xs font-bold text-amber-400">Day {simDayNum}</span><span className="text-xs font-mono text-gray-500">{simTrades.length} trades taken</span></div>
        {/* Gauges */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center"><p className="text-[10px] text-gray-500 mb-1">Daily DD Used</p><div className="h-4 rounded-full bg-white/[0.06] mb-1"><div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, dailyPct)}%`, background: dailyColor }} /></div><p className="text-sm font-bold" style={{ color: dailyColor }}>{simDailyDD.toFixed(2)}% / 5%</p></div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center"><p className="text-[10px] text-gray-500 mb-1">Overall DD Used</p><div className="h-4 rounded-full bg-white/[0.06] mb-1"><div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, overallPct)}%`, background: overallColor }} /></div><p className="text-sm font-bold" style={{ color: overallColor }}>{simOverallDD.toFixed(2)}% / 10%</p></div>
        </div>
        {/* Open PL toggle */}
        <div className="flex items-center gap-3"><button onClick={() => setSimIncludeOpen(!simIncludeOpen)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${simIncludeOpen ? 'bg-red-500/20 border border-red-500/40 text-red-400' : 'bg-white/[0.04] border border-white/[0.08] text-gray-400'}`}>{simIncludeOpen ? 'Open P&L: ON (firm counts it)' : 'Open P&L: OFF (closed trades only)'}</button>{simIncludeOpen && <span className="text-[10px] text-red-400">Open P&amp;L adds to daily DD in real-time</span>}</div>
        {/* Breach alert */}
        {simBreach && (<div className="p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-center"><p className="text-lg font-extrabold text-red-400">&#9888;&#65039; {simBreach}</p><p className="text-xs text-gray-400 mt-1">Account terminated. This is permanent.</p></div>)}
        {/* Trade buttons */}
        {!simBreach && (<div className="flex gap-2"><button onClick={() => addSimTrade(true)} className="flex-1 py-3 rounded-xl bg-green-500/15 border border-green-500/30 text-sm font-bold text-green-400 active:scale-95 transition-transform">&#10004; WIN (+{(0.75 * 1.5).toFixed(2)}%)</button><button onClick={() => addSimTrade(false)} className="flex-1 py-3 rounded-xl bg-red-500/15 border border-red-500/30 text-sm font-bold text-red-400 active:scale-95 transition-transform">&#10060; LOSS (-0.75%)</button></div>)}
        {/* Open PL input */}
        {simIncludeOpen && !simBreach && (<div className="flex items-center gap-2"><p className="text-[10px] text-amber-400 shrink-0">Open P&amp;L (%):</p><input type="number" value={simOpenPL} onChange={e => addOpenPL(Number(e.target.value))} step={0.25} className="w-24 p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-amber-500/40" /><p className="text-[10px] text-gray-500">(negative = unrealised loss)</p></div>)}
        {/* Day controls */}
        <div className="flex gap-2"><button onClick={newDay} disabled={!!simBreach} className="flex-1 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs font-bold text-amber-400 active:scale-95 transition-transform disabled:opacity-40">New Day (Daily DD Resets) &rarr;</button><button onClick={resetSim} className="px-4 py-2 rounded-xl bg-white/[0.06] text-xs text-gray-400 hover:bg-white/[0.1] transition-all">Reset All</button></div>
        {/* Trade log */}
        {simTrades.length > 0 && (<div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-[10px] text-gray-500 mb-1">Trade Log</p><div className="flex flex-wrap gap-1">{simTrades.map((t, i) => (<span key={i} className={`text-[10px] px-1.5 py-0.5 rounded ${t.result === 'win' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>{t.result === 'win' ? '+' : ''}{t.pnl.toFixed(2)}%</span>))}</div></div>)}
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Safe Zone Rules</p><h2 className="text-2xl font-extrabold mb-4">Know Your Zone at All Times</h2><div className="p-6 rounded-2xl glass-card space-y-2">{safeZoneRules.map((sz, i) => (<div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm font-bold" style={{ color: sz.color }}>{sz.zone}</p><div className="grid grid-cols-2 gap-2 mt-1"><div><p className="text-[10px] text-gray-500">Daily</p><p className="text-xs text-gray-300">{sz.dailyUsed}</p></div><div><p className="text-[10px] text-gray-500">Overall</p><p className="text-xs text-gray-300">{sz.overallUsed}</p></div></div><p className="text-xs text-gray-400 mt-1" dangerouslySetInnerHTML={{ __html: sz.action }} /></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; The Interaction Point</p><h2 className="text-2xl font-extrabold mb-4">When Overall Becomes the Binding Constraint</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#3b82f6]">EARLY DAYS</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Daily DD is the constraint. You have full 10% overall buffer. The risk of breach comes from one bad morning, not from cumulative losses.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#f59e0b]">CROSSOVER POINT</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">When overall DD remaining drops below daily DD limit (e.g., 4% overall remaining with 5% daily limit), overall becomes the binding constraint. Your EFFECTIVE daily limit is now 4%, not 5%.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#ef4444]">DANGER ZONE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">When overall DD remaining is less than 2x your daily risk exposure. At 2% overall remaining with 0.75% risk per trade, you can afford 2.6 losing trades TOTAL before termination. Survival mode: reduce risk to 0.25%.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">THE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Your EFFECTIVE risk limit at any moment is the LOWER of daily DD remaining and overall DD remaining. Track both. Trade to the tighter one.</span></p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p><h2 className="text-2xl font-extrabold mb-4">4 Drawdown Errors</h2><div className="space-y-3">{commonMistakes.map((item, i) => (<div key={i}><button onClick={() => toggle(`cm-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`cm-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`cm-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-xs text-red-400 mb-2">&#10060; {item.mistake}</p><p className="text-xs text-green-400">&#10004; {item.fix}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Cheat Sheet</p><h2 className="text-2xl font-extrabold mb-4">Dual DD Quick Reference</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#ef4444]">DAILY DD KILLS FAST</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">One bad morning can terminate your account. The reset creates false safety. Track your daily high-water mark and treat anything above 60% as a stop signal.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#f59e0b]">OVERALL DD KILLS SLOW</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Cumulative. Never resets. The slow bleed. Track weekly. Catch the trajectory at -2%, not at -8%.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#8b5cf6]">OPEN P&amp;L MATTERS</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">At firms that count open P&amp;L, 3 positions at -0.8% each = 2.4% daily DD consumed without closing anything. Know your firm\u2019s calculation method.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#22c55e]">60% SAFE ZONE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Never exceed 60% of either DD limit in a single day. The remaining 40% is your safety net for unexpected adverse moves.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">THE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Your effective risk limit is the LOWER of daily DD remaining and overall DD remaining. Track both. Trade to the tighter constraint. Always.</span></p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Test Your Understanding</p><h2 className="text-2xl font-extrabold mb-2">Dual Drawdown Game</h2><p className="text-gray-400 text-sm mb-6">5 scenario-based rounds. Calculate both DDs, navigate the open P&amp;L trap, and make survival decisions.</p>
      <div className="p-6 rounded-2xl glass-card"><div className="flex items-center justify-between mb-4"><span className="text-xs font-bold text-amber-400">Round {gameRound + 1} of {gameRounds.length}</span><span className="text-xs font-mono text-gray-500">{gameScore}/{gameRounds.length} correct</span></div><p className="text-sm text-gray-300 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: gameRounds[gameRound].scenario }} /><div className="space-y-2">{gameRounds[gameRound].options.map((opt, oi) => { const answered = gameAnswers[gameRound] !== null; const selected = gameAnswers[gameRound] === oi; const isCorrect = opt.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return (<div key={oi}><button onClick={() => handleGameAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt.text }} /></button>{answered && selected && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]"><p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`} dangerouslySetInnerHTML={{ __html: opt.explain }} /></motion.div>)}</div>); })}</div>{gameAnswers[gameRound] !== null && gameRound < gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5"><button onClick={() => setGameRound(r => r + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button></motion.div>)}{gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Outstanding \u2014 you understand both kill switches and how they interact.' : gameScore >= 3 ? 'Good \u2014 review the trailing DD and midnight reset scenarios for extra precision.' : 'Re-read the calculation methods and open P&L sections. These mechanics determine account survival.'}</p></motion.div>)}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Knowledge Check</p><h2 className="text-2xl font-extrabold mb-6">Final Quiz &mdash; 8 Questions</h2>
      <div className="space-y-6">{quizQuestions.map((q, qi) => (<div key={qi} className="p-5 rounded-2xl glass-card"><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p><p className="text-sm font-semibold text-white mb-4">{q.q}</p><div className="space-y-2">{q.opts.map((opt, oi) => { const answered = quizAnswers[qi] !== null; const selected = quizAnswers[qi] === oi; const isCorrect = oi === q.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return <button key={oi} onClick={() => handleQuizAnswer(qi, oi)} disabled={answered} className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`}>{opt}</button>; })}</div>{quizAnswers[qi] !== null && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg bg-white/[0.02]"><p className="text-xs text-amber-400" dangerouslySetInnerHTML={{ __html: `<span class="font-bold">&#9989;</span> ${q.explain}` }} /></motion.div>)}</div>))}</div>
      {quizDone && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center"><p className="text-3xl font-extrabold mb-2">{quizScoreVal}%</p><p className="text-sm text-gray-400">{quizScoreVal >= 66 ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate. Review and try again.'}</p></motion.div>)}
      {certUnlocked && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10"><div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}><div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(139,92,246,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} /><div className="relative z-10 text-center"><div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">&#128208;</div><p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p><p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 9: Daily vs Overall Drawdown</strong><br />at ATLAS Academy by Interakktive</p><p className="bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Drawdown Engineer &mdash;</p><p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L9.9-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p></div></div></motion.div>)}</motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-20 text-center"><Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">&larr; Back to Academy</Link></section>
    </div>
  );
}
