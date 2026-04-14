// app/academy/lesson/passing-the-challenge/page.tsx
// ATLAS Academy — Lesson 9.7: Passing the Challenge: Phase 1 & Phase 2 [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 9
// GROUNDBREAKING: Phase Progress Simulator — interactive day-by-day challenge walkthrough
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
const p1SubPhases = [
  { name: 'CAUTIOUS START', days: 'Days 1\u20135', risk: '0.5%', trades: '1/day', goal: '+1.5\u20132%', mindset: 'Prove you belong. The first 5 days set the psychological tone. A small profit buffer here is worth more than 2% because it gives you CONFIDENCE for the Build Phase. If Day 5 ends at +1%, you are ahead of 65% of challengers.', pitfall: 'Taking 3\u20134 trades on Day 1 because you are "excited and ready." Adrenaline from starting makes everything look like an A+ setup. Force yourself to 1 trade/day.', color: '#3b82f6' },
  { name: 'BUILD PHASE', days: 'Days 6\u201320', risk: '0.75%', trades: '1\u20132/day', goal: '+6\u20138% (cumulative)', mindset: 'The grind. 70% of your profit comes from this phase. Routine, consistency, zero improvisation. Take your planned setups at your planned risk. If no A+ setup exists, no trade. The boring middle is where challenges are WON.', pitfall: 'Comparing your Day 12 equity to a linear projection and feeling "behind." Equity paths are choppy, not straight. Trust the EV maths from Lesson 9.4.', color: '#22c55e' },
  { name: 'PROTECT MODE', days: 'Days 21\u201330', risk: '0.5% or lower', trades: '1/day max', goal: 'Close from +8% to +10%', mindset: 'The 80% rule activated. You built a profit buffer. Now DEFEND it. Reduce risk, ultra-selective, one trade per day maximum. The last 2% should take 5\u20138 days, not 2. Patience here is the skill that separates passers from failers.', pitfall: 'Increasing risk to "finish faster." You have 10 days for 2%. At 0.5% risk with +0.225% EV/trade, you need ~9 trades. You have time for 10+. There is zero mathematical reason to rush.', color: '#f59e0b' },
];

const p2Differences = [
  { aspect: 'Profit Target', p1: '8\u201310%', p2: '5%', impact: 'Easier on paper. Harder in practice because lower targets feel like they should be "quick" \u2014 creating time pressure that does not mathematically exist.' },
  { aspect: 'Psychology', p1: 'Proving energy \u2014 "Can I do this?"', p2: 'Protecting energy \u2014 "Don\u2019t lose Phase 1"', impact: 'Phase 2 fear of losing Phase 1 achievement causes defensive trading: early exits, skipped entries, tightened stops. Net effect: reduced expectancy.' },
  { aspect: 'Typical Failure', p1: 'Overtrading, DD breach from aggression', p2: 'Undertaking, time expiry from paralysis', impact: 'Phase 1 kills aggressive traders. Phase 2 kills cautious traders. The paradox: the caution that PASSED Phase 1 can FAIL Phase 2 if taken too far.' },
  { aspect: 'Consistency Rules', p1: 'Usually none', p2: 'Many firms require consistency (no single day &gt;50% of total profit)', impact: 'Consistency rules catch traders who passed Phase 1 with 2\u20133 big wins. Phase 2 demands grinding \u2014 small, regular profits, not home runs.' },
  { aspect: 'Mental Reset Required', p1: 'Start fresh', p2: 'MUST treat as a new challenge', impact: 'Carrying Phase 1 momentum into Phase 2 seems logical but creates an anchor. Your Phase 1 result should not influence a single Phase 2 decision.' },
];

const consistencyRules = [
  { rule: 'No Single Day &gt; 50% of Total Profit', desc: 'If your total Phase 2 profit is \u00A35,000, no single day can account for more than \u00A32,500. This prevents "one lucky day" passes and rewards steady performance.', strategy: 'Take 1\u20132 trades per day at standard risk. Avoid the temptation to "have a big day." Consistency beats intensity in Phase 2.' },
  { rule: 'Minimum Trading Days (5\u201310)', desc: 'You must trade on at least 5\u201310 separate days. Cannot pass by trading only 2 days and getting lucky.', strategy: 'Plan to trade at least 3\u20134 days per week. Even if no A+ setup appears, log in and document "no setup" to maintain the habit. Some firms count a login as a trading day.' },
  { rule: 'No Lot Size Spikes', desc: 'Some firms flag accounts where position size suddenly increases (e.g., normally 0.5 lots then suddenly 2 lots). This is treated as a consistency violation.', strategy: 'Keep your lot size within 10\u201315% of your average. The Protect Phase reduction (0.5% from 0.75%) is acceptable. Doubling your size is not.' },
  { rule: 'Maximum Daily Loss Relative to Average', desc: 'Some firms require that your worst day is not more than 2\u20133x your average daily P&L. Prevents blow-up days even if they do not breach official DD.', strategy: 'The 2-loss rule from Lesson 9.6 naturally prevents this. If you stop after 2 losses, your worst day is capped at ~1.5% (at 0.75% risk). Well within any consistency threshold.' },
];

const dayByDayMilestones = [
  { day: 'Day 1', equity: 0.3, status: 'green', note: 'One trade, one small win. Cautious Phase confirmed. Do NOT take a second trade even if another setup appears.' },
  { day: 'Day 5', equity: 1.8, status: 'green', note: 'End of Cautious Phase. Slightly above target. Transition to Build Phase: risk increases to 0.75%, up to 2 trades/day.' },
  { day: 'Day 8', equity: 1.2, status: 'amber', note: 'Drawdown from Day 5 peak. 3 losses in Build Phase. Normal variance. The 2-loss rule saved you from a -3% day. Trust the process.' },
  { day: 'Day 12', equity: 3.5, status: 'green', note: 'Recovery. 4 winning trades since Day 8. Equity path is choppy but trending up. Do NOT compare to linear 4% target at Day 12.' },
  { day: 'Day 16', equity: 5.8, status: 'green', note: 'Past 50% of target. Strong position. Maintain Build Phase. No risk changes yet \u2014 80% trigger is at +8%.' },
  { day: 'Day 20', equity: 8.2, status: 'amber', note: '80% TRIGGER HIT. Switch to Protect Phase NOW. Reduce risk to 0.5%. Max 1 trade/day. You need 1.8% in 10 days. The maths is overwhelmingly in your favour.' },
  { day: 'Day 25', equity: 9.1, status: 'green', note: 'Slow, steady progress in Protect Phase. 0.9% in 5 days at reduced risk. 5 more days for 0.9% more. Patience. Do NOT sprint.' },
  { day: 'Day 28', equity: 10.3, status: 'green', note: 'TARGET HIT. Phase 1 complete. Stop trading immediately. Do not risk the pass for "extra buffer." You are done.' },
];

const commonMistakes = [
  { title: 'Trading After Hitting the Target', mistake: '"I passed at +10.1% but I have 2 days left. Let me take one more trade for extra buffer." You CANNOT gain anything meaningful in 1\u20132 trades. But you CAN give back 0.75\u20131.5% from a loss, potentially dropping below the target. The expected value of continuing is NEGATIVE because the downside (losing the pass) outweighs the upside (marginal buffer).', fix: 'The moment you hit the profit target, STOP. Close all positions. Do not open the platform again. You are done. Any additional trade has negative expected value relative to the pass.' },
  { title: 'Changing Strategy Between Phase 1 and Phase 2', mistake: '"Phase 1 was aggressive. For Phase 2 I will be ultra-conservative." Switching strategies means switching to an UNTESTED approach. Your Phase 1 success was based on a specific strategy with known stats. Phase 2 with a different approach has unknown stats. You are now trading blind.', fix: 'Same strategy, same parameters, same plan. The ONLY change is the profit target (5% instead of 10%). Everything else \u2014 risk, sessions, trade count, phase transitions \u2014 stays identical. Phase 2 is Phase 1 with a lower finish line.' },
  { title: 'Ignoring Consistency Rules Until They Bite', mistake: '"I will worry about consistency after I hit the target." On Day 22, you hit +5.2% but the firm flags you: 60% of your profit came from a single day. Challenge failed on consistency grounds despite hitting the target. You did not read the rules.', fix: 'Read the FULL consistency requirements before starting. Calculate the maximum single-day profit allowed. If the rule says no day over 50% of total, and your target is \u00A35,000, no single day can exceed \u00A32,500. Plan your daily risk accordingly.' },
  { title: 'Phase 2 Paralysis at 80%+ of Target', mistake: 'You are at +4.2% (84% of the 5% target). You need 0.8% more. You have 8 days left. But you cannot bring yourself to take a trade. Every setup looks risky. Every candle looks like a potential loss. You freeze.', fix: 'This is the near-target paralysis from Lesson 9.6. The antidote: switch to PROCESS focus. "Is today\u2019s setup A+? Yes/No." If yes, take it at protect-mode risk (0.5%). If no, skip. You need ~3\u20134 more trades. You have 8 days. The maths works. Trust the process, not the feeling.' },
];

/* Simulator data */
const simScenarios = [
  { day: 5, equity: 1.8, phase: 'Cautious \u2192 Build', prompt: 'Day 5: You finished the Cautious Phase at +1.8%. Ahead of schedule. Time to transition to Build Phase. What do you change?', options: [
    { text: 'Increase risk to 0.75%, allow up to 2 trades/day, maintain A+ filter and session rules', correct: true, explain: 'Textbook transition. Risk moves from 0.5% to 0.75% as planned. Trade count expands to 1\u20132. Everything else stays the same. The transition was pre-defined, not emotional.' },
    { text: 'Jump to 1% risk since you are ahead \u2014 capitalise on momentum', correct: false, explain: '0.75% was calculated as optimal in Lesson 9.4. Being +1.8% ahead does not change the maths. 1% risk increases daily DD breach probability from ~14% to ~22%. The buffer you built in the Cautious Phase would be consumed by the increased risk.' },
    { text: 'Stay at 0.5% \u2014 the Cautious Phase worked, why change anything?', correct: false, explain: 'At 0.5% risk for the entire challenge, you need ~44 trades for a 10% target. At 1 trade/day, that is 44 days \u2014 but you only have 25 remaining (30 minus 5 done). You would run out of time. The Build Phase increase to 0.75% is necessary.' },
  ]},
  { day: 12, equity: 2.1, phase: 'Build (behind pace)', prompt: 'Day 12: You are at +2.1%, well below the Day 12 "ideal" of +4%. You had a rough 3-day stretch of losses. Your plan says Build Phase at 0.75%. You feel the urge to "catch up." What do you do?', options: [
    { text: 'Increase risk to 1.25% for a few days to catch up, then reduce back', correct: false, explain: 'The "temporary increase" never stays temporary. At 1.25% risk, one bad day costs -2.5% (2 losses). That puts you at -0.4% overall. From ahead to behind to NEGATIVE \u2014 in one day. The catch-up impulse is time pressure anxiety from Lesson 9.6. Recognise it. Reject it.' },
    { text: 'Check the maths: at +2.1% with 18 days left, you need 7.9% more. At 0.75% risk with +0.34% EV/trade and 1.5 trades/day, that is ~23 trades needed, 27 available. The maths works. Stay the course.', correct: true, explain: 'This is the discipline that passes challenges. 27 available trades for 23 needed = 17% buffer. Tight but workable. One good 3-day cluster (which statistically WILL happen with a 58% WR) could bring you to +5% by Day 15. Being at +2.1% on Day 12 is NORMAL VARIANCE, not a crisis. The maths from Lesson 9.4 has not changed.' },
    { text: 'Add a second trading session (New York) to get more trade opportunities', correct: false, explain: 'If your journal shows London is your best session (61% WR) and New York is weaker (52% WR), adding NY trades has lower EV and adds DD exposure. More trades at lower quality does not solve a pace problem \u2014 it creates a DD problem. The answer to "I am behind" is better trades, not more trades.' },
  ]},
  { day: 20, equity: 8.2, phase: 'Build \u2192 Protect', prompt: 'Day 20: You hit +8.2%. The 80% threshold is triggered. Your plan says switch to Protect Phase. But you are on a 4-win streak and feel like you could finish by Day 22 if you maintain current risk. What do you do?', options: [
    { text: 'Stay at 0.75% for 2 more days \u2014 you could finish by Day 22 and be done early', correct: false, explain: '"Could finish by Day 22" is a HOPE, not a plan. At 0.75% risk, a 2-loss day puts you at +6.7% \u2014 giving back 18% of your hard-earned profit. The winning streak does not predict the next trade (Lesson 9.6). The plan says Protect at 80%. Follow the plan.' },
    { text: 'Switch to Protect Phase exactly as planned: 0.5% risk, 1 trade/day max, A+ only. You need 1.8% in 10 days. At +0.225% EV/trade, that is ~8 trades. You have capacity for 10. The maths works with massive margin.', correct: true, explain: 'This is the moment. 10 days for 1.8% at 0.5% risk. You need 8 trades and have 10 available. That is a 25% buffer at REDUCED risk. The probability of reaching the target is higher in Protect Mode than in Build Mode because the reduced risk dramatically lowers the DD breach probability while the time is abundant.' },
    { text: 'Reduce to 0.25% \u2014 you want to be extra safe', correct: false, explain: 'Too conservative. At 0.25% risk, EV per trade drops to +0.113%. You need ~16 trades for 1.8%, but only have 10 available at 1 trade/day. You would run out of time. 0.5% is the correct Protect Phase risk \u2014 already calculated in Lesson 9.5.' },
  ]},
  { day: 28, equity: 10.3, phase: 'TARGET HIT', prompt: 'Day 28: You hit +10.3%. Phase 1 target is 10%. You still have 2 calendar days left. A beautiful A+ setup appears. Your mind says: "One more win and I will have a comfortable buffer for Phase 2 prep."', options: [
    { text: 'Take it \u2014 extra buffer helps psychologically for Phase 2', correct: false, explain: 'The EV of this trade is NEGATIVE relative to your goal. Win: you go to +11% (nice but unnecessary). Lose: you drop to +9.55% (below target, might need another trade, introducing anxiety). The downside risk outweighs the upside benefit. You have already won. Walk away.' },
    { text: 'STOP. Close all positions. Close the platform. You passed. Any additional trade has negative expected value because losing the pass is catastrophically worse than gaining 0.75% of buffer.', correct: true, explain: 'The correct answer for every trader who hits the target with time remaining. The asymmetry is absolute: gain = +0.75% buffer (marginal). Loss = potentially dropping below target, needing another trade, adding stress, risking DD. When you have already won, the only move is to stop playing.' },
    { text: 'Take it but with 0.25% risk to minimise downside', correct: false, explain: 'Even at 0.25%, a loss takes you to +10.05% \u2014 barely above target. Now you are stressed, watching every pip, wondering if you should have stopped. The trade was unnecessary. The risk, however small, was unnecessary. Stop means stop.' },
  ]},
  { day: 'P2 Day 7', equity: -0.3, phase: 'Phase 2 Early Struggle', prompt: 'Phase 2, Day 7: You are at -0.3%. Target is +5%. You passed Phase 1 convincingly (+10.3%) but Phase 2 feels completely different. Every trade feels heavy. You closed your last winner at +0.3R instead of the planned +1.5R because you were scared of giving it back. What is happening and what should you do?', options: [
    { text: 'Phase 2 is harder \u2014 accept that and trade even more cautiously', correct: false, explain: 'Phase 2 is not harder \u2014 the RULES are easier (5% target vs 10%). What is harder is the PSYCHOLOGY. Trading "even more cautiously" amplifies the problem: you will take even fewer trades, exit even earlier, and create the time pressure that causes Phase 2 failure. The problem is fear, not the market.' },
    { text: 'Recognise the Phase 2 choke: fear of losing Phase 1 is causing early exits and reduced expectancy. Reset: treat Phase 2 as a NEW challenge. Same plan, same parameters. Your +0.3R exit should have been +1.5R \u2014 that fear cost you +1.2R of expectancy.', correct: true, explain: 'The early exit at +0.3R instead of +1.5R is the clearest symptom. That single decision cost \u00A3900 on a \u00A3100K account (1.2% of 0.75% risk position). Over 10 instances, early exits like this destroy your positive expectancy entirely. The fix: Phase 2 is a new challenge. Phase 1 is done. Stop protecting a result that is already locked in.' },
    { text: 'Increase risk to 1% to try to finish Phase 2 quickly and get out of the uncomfortable feeling', correct: false, explain: 'The flight response: "just get it over with." Increasing risk when psychologically compromised is the fastest path to Phase 2 failure. You are converting a slow, winnable challenge into a high-risk sprint driven by discomfort, not strategy.' },
  ]},
];

const quizQuestions = [
  { q: 'What are the 3 sub-phases of Phase 1?', opts: ['Aggressive, Normal, and Conservative', 'Cautious Start (0.5% risk), Build (0.75% risk), and Protect (0.5% risk, triggered at 80% of target)', 'Phase 1A, Phase 1B, and Phase 1C', 'Morning, Afternoon, and Evening sessions'], correct: 1, explain: 'Cautious (Days 1\u20135, prove consistency), Build (Days 6\u201320, accumulate profit), Protect (Days 21+, reduce risk after hitting 80% of target). Each phase has pre-defined risk, trade count, and transition triggers. No mid-challenge decisions.' },
  { q: 'Why does Phase 2 have a higher failure rate than Phase 1 despite a lower profit target?', opts: ['Phase 2 has stricter drawdown rules', 'The overconfidence from Phase 1 combined with fear of losing that achievement causes defensive trading (early exits, skipped entries) that destroys expectancy', 'Phase 2 markets are less volatile', 'Phase 2 time limits are shorter'], correct: 1, explain: 'The Phase 2 paradox: lower target should be easier. But the psychology changes: you HAVE something to protect (Phase 1 result). This fear causes early exits (+0.3R instead of +1.5R), entry hesitation, and defensive positioning \u2014 all reducing the positive expectancy that made Phase 1 work.' },
  { q: 'What is a "consistency rule" and why does it matter?', opts: ['A rule requiring you to trade the same instrument every day', 'Rules preventing disproportionate single-day profits or lot size spikes \u2014 they reward steady performance over lucky big days', 'A rule requiring 100% win rate', 'Consistency rules only apply to demo accounts'], correct: 1, explain: 'Consistency rules (no single day over 50% of total profit, minimum trading days, no lot size spikes) reward the grinding approach over the "one big day" approach. They catch traders who passed Phase 1 with 2\u20133 lucky trades and ensure Phase 2 demonstrates repeatable skill.' },
  { q: 'The moment you hit the Phase 1 profit target with days remaining, you should:', opts: ['Take one more trade for extra buffer', 'Stop immediately. Close all positions. Close the platform. Any additional trade has negative expected value.', 'Switch to Phase 2 immediately on the same day', 'Increase risk to build maximum buffer before Phase 2'], correct: 1, explain: 'The asymmetry is absolute. Win: marginal buffer (meaningless). Lose: drop below target, need another trade, added stress, potential DD. When you have already won, every additional trade has negative EV relative to the goal. Stop means stop.' },
  { q: 'If you are at +2.1% on Day 12 of a 30-day challenge (target 10%), are you "behind schedule"?', opts: ['Yes \u2014 linear projection says you should be at +4%', 'No \u2014 equity paths are not linear, and the maths (trades needed vs available) still works at current pace with 17% buffer', 'Yes \u2014 you should increase risk to catch up', 'It depends on how many winning trades you had'], correct: 1, explain: 'Challenge equity is not linear. It is choppy with winning and losing clusters. +2.1% on Day 12 feels "behind" compared to +4% linear, but the MATHS shows 27 available trades for 23 needed = 17% buffer. One good 3-day cluster brings you back on track. Feeling behind \u2260 being behind.' },
  { q: 'How should Phase 2 strategy differ from Phase 1 strategy?', opts: ['Completely different strategy to be safe', 'It should NOT differ \u2014 same strategy, same parameters, same plan. The only difference is a lower profit target.', 'More aggressive to finish faster', 'Only trade during one session instead of two'], correct: 1, explain: 'Same system, same parameters, same execution. Your Phase 1 success proved the approach works. Changing the strategy for Phase 2 means trading an untested approach with unknown outcomes. The only variable that changes is the profit target (5% instead of 10%).' },
  { q: 'What is the "early exit symptom" of Phase 2 choke?', opts: ['Exiting the challenge early before the deadline', 'Closing winning trades at +0.3R instead of letting them reach the planned +1.5R target, because fear of giving back profit overrides the trade plan', 'Stopping trading for the day after one win', 'Exiting all positions before news events'], correct: 1, explain: 'Closing at +0.3R when the plan says +1.5R costs 1.2R of expectancy per trade. On a \u00A3100K account at 0.75% risk, that is \u00A3900 per occurrence. Over 10 trades, early exits turn a +\u00A33,375 expected outcome into +\u00A3225 \u2014 destroying your edge entirely. The fear of loss costs more than the losses themselves.' },
  { q: 'What is the correct response when you are on Day 20 at +8.2% with a 4-win streak?', opts: ['Stay aggressive \u2014 momentum will carry you to the target', 'Switch to Protect Phase as planned: 0.5% risk, 1 trade/day. 10 days for 1.8% with 25% trade buffer. The plan works.', 'Stop trading and wait until the last day', 'Increase risk to 1% and try to finish in 2 days'], correct: 1, explain: 'The 80% trigger is mechanical, not emotional. +8.2% hits the +8% threshold regardless of streaks. Protect Phase gives 10 days for 1.8% at reduced risk with massive margin. The winning streak does not change the plan. Follow the pre-defined transition.' },
];

export default function PassingTheChallenge() {
  const [scrollY, setScrollY] = useState(0);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [gameRound, setGameRound] = useState(0);
  const [gameAnswers, setGameAnswers] = useState<(number | null)[]>(Array(5).fill(null));
  const [gameScore, setGameScore] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(Array(quizQuestions.length).fill(null));
  const [showConfetti, setShowConfetti] = useState(false);
  const [certUnlocked, setCertUnlocked] = useState(false);
  /* Simulator state */
  const [simStep, setSimStep] = useState(0);
  const [simAnswers, setSimAnswers] = useState<(number | null)[]>(Array(simScenarios.length).fill(null));
  const [simScore, setSimScore] = useState(0);

  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);
  const toggle = (id: string) => setOpenSections(s => ({ ...s, [id]: !s[id] }));

  const handleGameAnswer = (oi: number) => { if (gameAnswers[gameRound] !== null) return; const a = [...gameAnswers]; a[gameRound] = oi; setGameAnswers(a); if (simScenarios[gameRound].options[oi].correct) setGameScore(s => s + 1); };
  const handleQuizAnswer = (qi: number, oi: number) => { if (quizAnswers[qi] !== null) return; const a = [...quizAnswers]; a[qi] = oi; setQuizAnswers(a); };

  const quizDone = quizAnswers.every(a => a !== null);
  const quizScoreVal = quizDone ? Math.round(quizAnswers.reduce<number>((s, a, i) => s + (a === quizQuestions[i].correct ? 1 : 0), 0) / quizQuestions.length * 100) : 0;
  useEffect(() => { if (quizDone && quizScoreVal >= 66 && !certUnlocked) { setCertUnlocked(true); setShowConfetti(true); const t = setTimeout(() => setShowConfetti(false), 4000); return () => clearTimeout(t); } }, [quizDone, quizScoreVal, certUnlocked]);

  const handleSimAnswer = (oi: number) => { if (simAnswers[simStep] !== null) return; const a = [...simAnswers]; a[simStep] = oi; setSimAnswers(a); if (simScenarios[simStep].options[oi].correct) setSimScore(s => s + 1); };

  /* ─── DRAW FUNCTIONS ─── */
  const drawPhase1Journey = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const cx = w / 2;
    const cy = h / 2;
    const chartL = 40; const chartR = w - 20; const chartT = 35; const chartB = h - 30;
    const chartW = chartR - chartL; const chartH = chartB - chartT;
    // Phase zones
    const zones = [{ end: 0.17, color: '#3b82f6', label: 'CAUTIOUS' }, { end: 0.67, color: '#22c55e', label: 'BUILD' }, { end: 1, color: '#f59e0b', label: 'PROTECT' }];
    let zx = chartL;
    for (const z of zones) {
      const zw = z.end * chartW - (zx - chartL);
      ctx.fillStyle = z.color + '0a'; ctx.fillRect(zx, chartT, zw, chartH);
      ctx.fillStyle = z.color + '66'; ctx.font = 'bold 8px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(z.label, zx + zw / 2, chartT + 3);
      zx += zw;
    }
    // Target line
    ctx.setLineDash([4, 4]); ctx.strokeStyle = 'rgba(34,197,94,0.3)'; ctx.lineWidth = 1;
    const targetY = chartT + chartH * 0.15;
    ctx.beginPath(); ctx.moveTo(chartL, targetY); ctx.lineTo(chartR, targetY); ctx.stroke();
    ctx.fillStyle = 'rgba(34,197,94,0.4)'; ctx.font = '7px system-ui'; ctx.textAlign = 'left'; ctx.fillText('+10%', chartL + 2, targetY - 9);
    // 80% line
    const eightyY = chartT + chartH * 0.3;
    ctx.strokeStyle = 'rgba(245,158,11,0.3)';
    ctx.beginPath(); ctx.moveTo(chartL, eightyY); ctx.lineTo(chartR, eightyY); ctx.stroke();
    ctx.fillStyle = 'rgba(245,158,11,0.4)'; ctx.fillText('+8% (80%)', chartL + 2, eightyY - 9);
    ctx.setLineDash([]);
    // DD floor
    const ddY = chartB;
    ctx.strokeStyle = 'rgba(239,68,68,0.2)'; ctx.beginPath(); ctx.moveTo(chartL, ddY); ctx.lineTo(chartR, ddY); ctx.stroke();
    // Milestones
    const reveal = Math.min(Math.floor(f * 0.3), dayByDayMilestones.length);
    ctx.beginPath(); ctx.strokeStyle = '#f59e0baa'; ctx.lineWidth = 2;
    for (let i = 0; i < reveal; i++) {
      const day = parseInt(dayByDayMilestones[i].day.replace(/\D/g, '')) || (i === 7 ? 28 : 0);
      const px = chartL + (day / 30) * chartW;
      const eq = dayByDayMilestones[i].equity;
      const py = chartB - (eq / 12) * chartH;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      // Dot
      const dotColor = dayByDayMilestones[i].status === 'green' ? '#22c55e' : '#f59e0b';
      ctx.fillStyle = dotColor; ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.stroke();
    // Title
    ctx.fillStyle = 'rgba(245,158,11,0.6)'; ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('Phase 1 Journey: 30 Days from Start to Target', cx, 6);
  }, []);

  const drawP1vsP2 = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const cx = w / 2;
    const cy = h / 2;
    const cycle = f % 300;
    const activeIdx = Math.floor(cycle / 60) % 5;
    const colW = (w - 30) / 3;
    const rowH = (h - 50) / 5;
    // Headers
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('Aspect', 15 + colW * 0.5, 18);
    ctx.fillStyle = '#3b82f6'; ctx.fillText('Phase 1', 15 + colW * 1.5, 18);
    ctx.fillStyle = '#f59e0b'; ctx.fillText('Phase 2', 15 + colW * 2.5, 18);
    for (let i = 0; i < 5; i++) {
      const ry = 34 + i * rowH;
      const isActive = i === activeIdx;
      if (isActive) { ctx.fillStyle = 'rgba(245,158,11,0.05)'; ctx.fillRect(10, ry, w - 20, rowH); }
      ctx.fillStyle = isActive ? '#fff' : 'rgba(255,255,255,0.3)';
      ctx.font = `${isActive ? 'bold 8' : '7'}px system-ui`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(p2Differences[i].aspect, 15 + colW * 0.5, ry + rowH / 2);
      ctx.fillStyle = isActive ? 'rgba(59,130,246,0.8)' : 'rgba(59,130,246,0.3)';
      ctx.fillText(p2Differences[i].p1, 15 + colW * 1.5, ry + rowH / 2);
      ctx.fillStyle = isActive ? 'rgba(245,158,11,0.8)' : 'rgba(245,158,11,0.3)';
      ctx.fillText(p2Differences[i].p2, 15 + colW * 2.5, ry + rowH / 2);
    }
    // Impact text
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '8px system-ui';
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    const impact = p2Differences[activeIdx].impact;
    const maxW = w - 40;
    if (ctx.measureText(impact).width > maxW) {
      const words = impact.split(' '); let line = ''; const lines: string[] = [];
      for (const word of words) { const t = line + (line ? ' ' : '') + word; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = word; } else { line = t; } }
      if (line) lines.push(line);
      let ly = h - 4 - (lines.length - 1) * 10;
      for (const l of lines) { ctx.fillText(l, cx, ly); ly += 10; }
    } else { ctx.fillText(impact, cx, h - 4); }
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
          <motion.p variants={fadeUp} className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-4">Level 9 &middot; Lesson 7 of 14</motion.p>
          <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold leading-tight mb-4 bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Passing the Challenge</motion.h1>
          <motion.p variants={fadeUp} className="text-gray-400 max-w-lg mx-auto text-sm leading-relaxed">Phase 1 and Phase 2 execution. Sub-phases, day-by-day milestones, consistency rules, and the moment you hit the target.</motion.p>
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.8 }} className="absolute bottom-8 flex flex-col items-center gap-2 text-gray-600 text-xs">Scroll to begin<motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-amber-500">&#8964;</motion.div></motion.div>
      </section>

      <section className="max-w-2xl mx-auto px-5 py-20"><motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">00 &mdash; Why This Matters</p><h2 className="text-2xl font-extrabold mb-4">The Execution Blueprint</h2><div className="p-6 rounded-2xl glass-card space-y-4">
        <p className="text-sm text-gray-300 leading-relaxed">You have the maths (9.4), the strategy (9.5), and the mindset (9.6). This lesson is the <strong className="text-white">execution blueprint</strong> &mdash; what to do on Day 1, Day 12, Day 20, and the moment you hit the target. It covers both Phase 1 (the initial evaluation) and Phase 2 (verification), because most traders prepare for Phase 1 and then improvise Phase 2.</p>
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-purple-500/10 border border-amber-500/20"><p className="text-xs font-bold text-amber-400 mb-1">&#9889; REAL SCENARIO</p><p className="text-xs text-gray-300">Phase 2 has a higher failure rate than Phase 1 at most firms despite having a LOWER profit target. Why? Phase 1 kills aggressive traders (DD breach). Phase 2 kills cautious traders (time expiry from paralysis + early exits destroying expectancy). <strong className="text-white">The approach that passes Phase 1 can fail Phase 2 if fear of losing the Phase 1 result changes your trading behaviour.</strong></p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Phase 1 Journey</p><h2 className="text-2xl font-extrabold mb-2">30 Days from Start to Target</h2><p className="text-gray-400 text-sm mb-4">Watch a realistic equity path through all 3 sub-phases: Cautious, Build, Protect. Green dots = on track. Amber = temporary setback.</p>
      <div className="rounded-2xl glass-card p-4"><AnimScene drawFn={drawPhase1Journey} height={300} /></div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; Phase 1 vs Phase 2</p><h2 className="text-2xl font-extrabold mb-2">The 5 Critical Differences</h2><p className="text-gray-400 text-sm mb-4">Same rules, different psychology. Watch each difference highlight with its impact on your trading.</p>
      <div className="rounded-2xl glass-card p-4"><AnimScene drawFn={drawP1vsP2} height={300} /></div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; Phase 1 Sub-Phases</p><h2 className="text-2xl font-extrabold mb-4">Cautious &rarr; Build &rarr; Protect</h2><div className="space-y-3">{p1SubPhases.map((sp, i) => (<div key={i}><button onClick={() => toggle(`sp-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold" style={{ color: sp.color }}>{sp.name} <span className="text-gray-500 font-normal text-xs ml-2">{sp.days} | {sp.risk} risk | {sp.trades}</span></span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`sp-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`sp-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05] space-y-2"><p className="text-xs text-gray-400">Goal: {sp.goal}</p><p className="text-xs text-gray-300">{sp.mindset}</p><p className="text-xs text-red-400 mt-1">&#9888;&#65039; Pitfall: {sp.pitfall}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Consistency Rules</p><h2 className="text-2xl font-extrabold mb-4">Phase 2&apos;s Hidden Requirements</h2><div className="space-y-3">{consistencyRules.map((cr, i) => (<div key={i}><button onClick={() => toggle(`cr-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200" dangerouslySetInnerHTML={{ __html: cr.rule }} /><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`cr-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`cr-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05] space-y-1"><p className="text-xs text-gray-400">{cr.desc}</p><p className="text-xs text-green-400 mt-1">Strategy: {cr.strategy}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      {/* S05 — GROUNDBREAKING: Phase Progress Simulator */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Walk Through It</p><h2 className="text-2xl font-extrabold mb-2">&#127919; Phase Progress Simulator</h2><p className="text-gray-400 text-sm mb-4">5 critical decision points from Day 5 to Phase 2. Make the right call at each moment. This is your challenge in fast-forward.</p>
      <div className="p-6 rounded-2xl glass-card">
        <div className="flex items-center justify-between mb-4"><span className="text-xs font-bold text-amber-400">Decision {simStep + 1} of {simScenarios.length}</span><span className="text-xs font-mono text-gray-500">{simScore}/{simScenarios.length} correct</span></div>
        {/* Equity bar */}
        <div className="mb-3"><div className="flex justify-between text-[10px] text-gray-500 mb-1"><span>{simScenarios[simStep].day}</span><span>{simScenarios[simStep].equity > 0 ? '+' : ''}{simScenarios[simStep].equity}%</span><span className="text-amber-400">{simScenarios[simStep].phase}</span></div><div className="h-2 rounded-full bg-white/[0.06]"><div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-accent-500 transition-all" style={{ width: `${Math.max(5, Math.min(100, ((typeof simScenarios[simStep].equity === 'number' ? simScenarios[simStep].equity : 0) / 10) * 100))}%` }} /></div></div>
        <p className="text-sm text-gray-300 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: simScenarios[simStep].prompt }} />
        <div className="space-y-2">{simScenarios[simStep].options.map((opt, oi) => { const answered = simAnswers[simStep] !== null; const selected = simAnswers[simStep] === oi; const isCorrect = opt.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return (<div key={oi}><button onClick={() => handleSimAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt.text }} /></button>{answered && selected && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]"><p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`} dangerouslySetInnerHTML={{ __html: opt.explain }} /></motion.div>)}</div>); })}</div>
        {simAnswers[simStep] !== null && simStep < simScenarios.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5"><button onClick={() => setSimStep(s => s + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Decision &rarr;</button></motion.div>)}
        {simAnswers[simStep] !== null && simStep === simScenarios.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{simScore}/{simScenarios.length} Correct</p><p className="text-xs text-gray-400 mt-1">{simScore >= 4 ? 'Outstanding \u2014 you navigated both phases like a seasoned prop trader.' : simScore >= 3 ? 'Good \u2014 review the behind-pace and Phase 2 choke decisions.' : 'Re-read the 3 sub-phases and Phase 2 sections. These decisions determine pass or fail.'}</p></motion.div>)}
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Day-by-Day Milestones</p><h2 className="text-2xl font-extrabold mb-4">Realistic 28-Day Pass Trajectory</h2><div className="p-6 rounded-2xl glass-card space-y-2">{dayByDayMilestones.map((m, i) => (<div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center gap-3"><span className="text-xs font-bold shrink-0 px-2 py-1 rounded-lg" style={{ color: m.status === 'green' ? '#22c55e' : '#f59e0b', background: (m.status === 'green' ? '#22c55e' : '#f59e0b') + '18' }}>{m.day}</span><div className="flex-1"><p className="text-sm font-bold text-white">{m.equity > 0 ? '+' : ''}{m.equity}%</p><p className="text-[10px] text-gray-400">{m.note}</p></div></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; The Target Moment</p><h2 className="text-2xl font-extrabold mb-4">When You Hit the Number</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-amber-500/10 border border-green-500/20 text-center"><p className="text-lg font-extrabold text-green-400">+10.0% &mdash; TARGET HIT</p><p className="text-xs text-gray-400 mt-1">Close all positions. Close the platform. You are done.</p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#22c55e]">DO</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Stop immediately. Close every position. Log out. Celebrate. You passed. The challenge is over.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">DO NOT</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Take &ldquo;one more trade for buffer.&rdquo; The expected value is NEGATIVE: win = marginal gain. Lose = potential drop below target. The asymmetry is absolute.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">THE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">When you have already won, the only correct move is to stop playing. This applies to Phase 1, Phase 2, and every future challenge you ever take.</span></p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p><h2 className="text-2xl font-extrabold mb-4">4 Execution Errors</h2><div className="space-y-3">{commonMistakes.map((item, i) => (<div key={i}><button onClick={() => toggle(`cm-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`cm-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`cm-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-xs text-red-400 mb-2">&#10060; {item.mistake}</p><p className="text-xs text-green-400">&#10004; {item.fix}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Cheat Sheet</p><h2 className="text-2xl font-extrabold mb-4">Challenge Execution Quick Reference</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#3b82f6]">CAUTIOUS &rarr; BUILD &rarr; PROTECT</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Days 1&ndash;5 at 0.5%, Days 6&ndash;20 at 0.75%, Days 21+ at 0.5% (triggered at 80% of target). Pre-defined transitions. No decisions.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#f59e0b]">PHASE 2 = NEW CHALLENGE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Same plan, same parameters, fresh mindset. Do NOT carry Phase 1 emotions. The early exit symptom (+0.3R instead of +1.5R) is the #1 sign of Phase 2 choke.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#22c55e]">CONSISTENCY MATTERS</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">No single day over 50% of total profit. No lot size spikes. Minimum trading days met. The grinding approach beats the "one big day" approach every time.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">TARGET HIT = STOP</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">The moment you reach the profit target, close everything. Do not take one more trade. The EV of continuing is negative. You won. Walk away.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">THE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">The challenge is a marathon with 3 gear changes, not a sprint. Cautious start, steady build, protected finish. The discipline to shift gears is the skill that passes challenges.</span></p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Test Your Understanding</p><h2 className="text-2xl font-extrabold mb-6">Final Quiz &mdash; 8 Questions</h2>
      <div className="space-y-6">{quizQuestions.map((q, qi) => (<div key={qi} className="p-5 rounded-2xl glass-card"><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p><p className="text-sm font-semibold text-white mb-4">{q.q}</p><div className="space-y-2">{q.opts.map((opt, oi) => { const answered = quizAnswers[qi] !== null; const selected = quizAnswers[qi] === oi; const isCorrect = oi === q.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return <button key={oi} onClick={() => handleQuizAnswer(qi, oi)} disabled={answered} className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`}>{opt}</button>; })}</div>{quizAnswers[qi] !== null && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg bg-white/[0.02]"><p className="text-xs text-amber-400" dangerouslySetInnerHTML={{ __html: `<span class="font-bold">&#9989;</span> ${q.explain}` }} /></motion.div>)}</div>))}</div>
      {quizDone && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center"><p className="text-3xl font-extrabold mb-2">{quizScoreVal}%</p><p className="text-sm text-gray-400">{quizScoreVal >= 66 ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate. Review and try again.'}</p></motion.div>)}
      {certUnlocked && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10"><div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}><div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(139,92,246,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} /><div className="relative z-10 text-center"><div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">&#9989;</div><p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p><p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 9: Passing the Challenge</strong><br />at ATLAS Academy by Interakktive</p><p className="bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Verification Specialist &mdash;</p><p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L9.7-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p></div></div></motion.div>)}</motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-20 text-center"><Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">&larr; Back to Academy</Link></section>
    </div>
  );
}
