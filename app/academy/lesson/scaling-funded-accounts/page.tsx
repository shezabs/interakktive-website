// app/academy/lesson/scaling-funded-accounts/page.tsx
// ATLAS Academy — Lesson 9.10: Scaling Funded Accounts [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 9
// GROUNDBREAKING: Prop Scaling Planner — 12-month income projection with scenarios
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
const singleVsMulti = [
  { aspect: 'Survival Risk', single: '1 bad week = everything gone', multi: '1 bad week = lose 1 account, others survive', verdict: 'MULTI', color: '#22c55e' },
  { aspect: 'Monthly Income', single: 'Volatile \u2014 one account\u2019s ups and downs', multi: 'Smoothed \u2014 accounts diversify variance', verdict: 'MULTI', color: '#22c55e' },
  { aspect: 'Management Complexity', single: 'Simple \u2014 one set of rules, one DD tracker', multi: 'Complex \u2014 multiple rule sets, DD trackers, sessions', verdict: 'SINGLE', color: '#f59e0b' },
  { aspect: 'Challenge Cost', single: 'One fee to start', multi: 'Multiple fees \u2014 higher upfront investment', verdict: 'SINGLE', color: '#f59e0b' },
  { aspect: 'Psychology', single: 'Full focus on one account', multi: 'Must isolate emotions per account \u2014 a loss on Account A should not affect trading on Account B', verdict: 'DEPENDS', color: '#3b82f6' },
  { aspect: 'Income Ceiling', single: 'Limited by one account\u2019s balance and payout split', multi: 'Scales linearly \u2014 3 accounts = 3x income potential', verdict: 'MULTI', color: '#22c55e' },
];

const scalingTimeline = [
  { month: 'Month 1\u20132', action: 'ONE account. Prove the process works under funded conditions.', accounts: 1, totalBal: '\u00A350\u2013100K', risk: 'Low', color: '#3b82f6', desc: 'Focus entirely on surviving and earning your first payout. Do NOT start a second challenge until you have at least 1 payout from Account 1.' },
  { month: 'Month 3\u20134', action: 'Add SECOND account at a different firm.', accounts: 2, totalBal: '\u00A3100\u2013200K', risk: 'Moderate', color: '#22c55e', desc: 'Different firm = different rules = diversified risk. If one firm\u2019s rules change or the account is lost, the other survives. Same strategy on both but isolated management.' },
  { month: 'Month 5\u20136', action: 'Evaluate: add THIRD account OR increase sizes.', accounts: '2\u20133', totalBal: '\u00A3150\u2013300K', risk: 'Moderate', color: '#f59e0b', desc: 'By now you have 3\u20134 months of funded data. If Account 1 and 2 are healthy, add Account 3 (same or new firm). If one account was lost, replace it before adding.' },
  { month: 'Month 7\u201312', action: 'Optimise: drop weakest firm, scale best performer.', accounts: '2\u20134', totalBal: '\u00A3200\u2013400K', risk: 'Managed', color: '#8b5cf6', desc: 'Data-driven decisions: which firm has the best payout history, easiest rules, best scaling plan? Double down on winners. Drop or replace underperformers. This is the business maturation phase.' },
];

const allocationStrategies = [
  { name: 'Equal Split', desc: 'Same balance, same risk, same strategy on all accounts. Simplest to manage. Best for traders who want consistency.', example: '3 \u00D7 \u00A3100K at 0.5% risk each', pros: 'Simple, balanced, easy to track', cons: 'No specialisation, all accounts face same market conditions', color: '#3b82f6' },
  { name: 'Core + Satellite', desc: 'One large "core" account (conservative, 0.5% risk) and 1\u20132 smaller "satellite" accounts (slightly more aggressive, 0.75% risk). Core for income, satellites for growth.', example: '1 \u00D7 \u00A3200K (core) + 2 \u00D7 \u00A350K (satellites)', pros: 'Core provides stable income, satellites add upside', cons: 'More complex, different risk parameters to manage', color: '#22c55e' },
  { name: 'Multi-Strategy', desc: 'Different strategies on different accounts. Account 1: London scalping. Account 2: New York swing. Account 3: Gold breakouts. Diversifies by market exposure.', example: '3 accounts, 3 different instrument/session combos', pros: 'True diversification \u2014 different strategies fail at different times', cons: 'Requires proficiency in multiple strategies. Most traders should NOT do this until they have mastered one.', color: '#f59e0b' },
];

const whenToScale = [
  { signal: 'First payout received and verified', ready: true, desc: 'Your first payout proves the funded process works end-to-end: your strategy, your risk management, and the firm\u2019s payout system. Only AFTER this confirmation should you invest in a second challenge.' },
  { signal: '2+ consecutive profitable months', ready: true, desc: 'Consistency over time, not a single lucky month. Two months proves the approach is repeatable under different market conditions.' },
  { signal: 'Overall DD usage stays below 50%', ready: true, desc: 'If your maximum DD drawdown across 2 months never exceeded 50% of the limit, your risk management is working. You have headroom to manage a second account without being overstretched.' },
  { signal: 'You passed one challenge but have not received a payout yet', ready: false, desc: 'Do NOT buy a second challenge before your first payout. You have not confirmed the end-to-end process works. What if the firm delays payouts? What if your funded strategy underperforms? Prove it first.' },
  { signal: 'You are emotionally overwhelmed by one account', ready: false, desc: 'If managing one funded account causes significant stress, anxiety, or sleep loss, adding a second will make it worse. Stabilise your psychology on one account first.' },
  { signal: 'You lost your first funded account and want to "diversify"', ready: false, desc: 'Losing an account means something went wrong (strategy, execution, psychology, or bad luck). Diagnose it first. Adding accounts does not fix the underlying problem \u2014 it multiplies the cost of the failure.' },
];

const commonMistakes = [
  { title: 'Scaling Before Proving the Process', mistake: '"I will buy 3 challenges simultaneously to save time." If you fail all 3, that is \u00A3900\u20131,200 in fees gone. If you pass 1 but the funded strategy underperforms, you have 2 more accounts running the same broken approach. Scaling amplifies whatever you are doing \u2014 including mistakes.', fix: 'Prove with 1. First payout confirmed. 2 profitable months. THEN add Account 2. Each new account should be funded by the INCOME from existing accounts, not by reaching deeper into your savings.' },
  { title: 'Same Firm for All Accounts', mistake: '"I like Firm A so I will run 3 accounts there." If Firm A changes their rules, delays payouts, or has a technical issue, ALL 3 accounts are affected simultaneously. You have correlated firm risk.', fix: 'Spread across 2\u20133 firms minimum. If one firm has issues, the others continue. This is the same principle as not putting all your trades on one instrument.' },
  { title: 'Letting Account A Emotions Bleed into Account B', mistake: 'Account A had a -2% day. You are frustrated. You sit down to trade Account B and immediately take a B-grade setup because you feel you "need a win somewhere." Account B pays for Account A\u2019s bad day.', fix: 'ISOLATE. Each account is a separate business. If Account A has a bad day, take a 30-minute break before trading Account B. Better yet, trade each account in a separate session block. London for Account A, New York for Account B.' },
  { title: 'Scaling Account Size Before Scaling Account Count', mistake: '"I will go straight to a \u00A3200K account instead of getting two \u00A3100K accounts." \u00A3200K has higher psychological pressure (the absolute numbers are larger) and higher challenge fees. If you lose it, you lose MORE than two \u00A3100K failures combined.', fix: 'Scale by COUNT first, then SIZE. 2 \u00D7 \u00A350K before 1 \u00D7 \u00A3200K. 3 \u00D7 \u00A3100K before 1 \u00D7 \u00A3400K. Multiple smaller accounts diversify survival risk. One large account concentrates it.' },
];

const gameRounds = [
  { scenario: '<strong>Scaling decision:</strong> You have been funded for 2 months on a \u00A3100K account. Month 1: +2.8% (payout \u00A32,240). Month 2: +2.1% (payout \u00A31,680). Total earned: \u00A33,920. Maximum DD usage: 3.2% of 10%. Your friend suggests buying 3 more challenges this week. What do you do?', options: [
    { text: 'Buy 3 challenges immediately \u2014 you are clearly profitable and should scale as fast as possible', correct: false, explain: '3 simultaneous challenges is aggressive even for a proven trader. Each challenge requires psychological bandwidth. Running 3 evaluations while managing a funded account means splitting focus 4 ways. One at a time: buy 1 challenge, pass it, then evaluate whether to add a third.' },
    { text: 'Buy 1 challenge at a DIFFERENT firm. You have 2 profitable months and a confirmed first payout. Scale by ONE account at a time. Fund the challenge from your payout income, not savings.', correct: true, explain: 'Textbook scaling. 2 profitable months + payout confirmed = green light for Account 2. Different firm = diversified firm risk. Funded from payout income (\u00A33,920 covers any challenge fee) = no additional capital at risk. One at a time maintains focus and prevents the emotional bleed between accounts.' },
    { text: 'Wait 6 more months before scaling \u2014 2 months is not enough data', correct: false, explain: 'Overly conservative. 2 consecutive profitable months with low DD usage (\u00A33.2% max) is a strong signal. The payout has been confirmed. Waiting 6 months means 6 months of single-account income when you could have 2 accounts earning. The risk-adjusted benefit of adding Account 2 now outweighs waiting.' },
  ]},
  { scenario: '<strong>Account isolation:</strong> You run 2 funded accounts: Account A (\u00A3100K, Firm X, London session) and Account B (\u00A350K, Firm Y, New York session). This morning, Account A lost 2 trades and you triggered the 2-loss rule. You are frustrated. It is now 14:00 and your New York session is starting for Account B. What do you do?', options: [
    { text: 'Skip Account B today \u2014 your emotions from Account A will contaminate your trading', correct: false, explain: 'Skipping entirely is too conservative IF you can genuinely reset. Account B has a different session, different firm, and a fresh daily DD. The question is whether you can isolate the frustration from Account A.' },
    { text: 'Take a 30-minute break (walk, no screens). Then sit down for Account B with a clean mindset. Check: "Am I trading Account B\u2019s plan, or am I trying to recover Account A\u2019s losses?" If you cannot honestly answer "Account B\u2019s plan," skip.', correct: true, explain: 'The isolation protocol: physical break, mental reset, then an honest self-check. The 30-minute gap creates distance between the emotional state from Account A and the decision-making for Account B. The self-check question catches any lingering frustration. If you can genuinely switch modes, trade Account B. If not, skip \u2014 one day off is cheap.' },
    { text: 'Trade Account B immediately \u2014 the 2-loss rule only applies per account, and Account B is a separate entity', correct: false, explain: 'Technically true that rules are per-account. But your PSYCHOLOGY is not per-account. Your brain does not have separate emotional compartments for each funded account. The frustration from Account A will colour your perception of Account B\u2019s setups. At minimum, take a break.' },
  ]},
  { scenario: '<strong>Firm diversification:</strong> You are scaling to 3 accounts. You love Firm X (best rules, best payout experience). The temptation is to run all 3 at Firm X. Your friend warns against it. Who is right?', options: [
    { text: 'You are right \u2014 Firm X has the best rules so all 3 should be there to maximise your edge', correct: false, explain: 'Best rules today does not guarantee best rules tomorrow. Firms change rules, delay payouts, face regulatory issues, or even close. If all 3 accounts are at Firm X and Firm X has a problem, your entire prop income goes to zero simultaneously. This is correlated firm risk \u2014 the same concept as correlated currency positions from Lesson 8.8.' },
    { text: 'Your friend is right \u2014 spread across 2\u20133 firms to diversify firm risk. Even if Firm X is the best, having 1\u20132 accounts at other firms protects against firm-specific events.', correct: true, explain: 'Firm diversification is like instrument diversification. Your prop income should survive any single firm having a problem. Ideal: 2 accounts at Firm X (your best) + 1 at Firm Y. If Firm X has an issue, Firm Y continues earning. If Firm Y has an issue, Firm X carries the income. Concentrated risk is how traders go from earning to zero overnight.' },
    { text: 'Compromise: 2 at Firm X, 1 at Firm Y, but same strategy everywhere', correct: false, explain: 'This is actually the CORRECT approach. 2 at your best firm + 1 at a backup is the ideal distribution. Same strategy everywhere is fine \u2014 you are diversifying FIRM risk, not strategy risk. The "friend is right" answer captures the principle; this answer is the optimal implementation.' },
  ]},
  { scenario: '<strong>When to increase size:</strong> You have run 2 \u00D7 \u00A350K accounts for 4 months. Combined income: \u00A37,200 (after splits). Both accounts healthy, DD usage below 40%. You are considering upgrading one to \u00A3100K. When is the right time?', options: [
    { text: 'Now \u2014 4 months of consistent results proves you can handle a larger account', correct: false, explain: 'Close, but the missing step is a \u00A3100K CHALLENGE. Upgrading account size means passing a new, larger challenge. The pressure and absolute numbers are different. \u00A350K at 5% daily DD = \u00A32,500 cushion. \u00A3100K at 5% = \u00A35,000 cushion. Same percentage, different psychological weight. You need to confirm you can handle the larger numbers under challenge conditions.' },
    { text: 'After your current accounts fund the challenge fee AND you have passed a \u00A3100K challenge separately. The upgrade is earned through a new evaluation, not just requested.', correct: true, explain: 'The scaling sequence: (1) current accounts fund the \u00A3100K challenge fee from income (no savings at risk), (2) pass the \u00A3100K challenge (confirming you handle the larger numbers), (3) manage the \u00A3100K alongside your existing \u00A350K(s). The upgrade is a new challenge, not a button press. Each size increase must be earned through evaluation.' },
    { text: 'Never increase size \u2014 just keep adding more \u00A350K accounts', correct: false, explain: 'There are practical limits to managing 6\u20138 small accounts. At some point, upgrading size is more efficient than adding accounts. 2 \u00D7 \u00A3100K is easier to manage than 4 \u00D7 \u00A350K with the same total capital. The right time to upgrade is after proving consistency at the smaller size AND passing the larger challenge.' },
  ]},
  { scenario: '<strong>The breakeven question:</strong> You run 3 funded accounts (\u00A3100K each). Challenge fee per account: \u00A3400. Historical account survival rate: ~8 months average before one account is lost (normal attrition). Monthly income per surviving account: \u00A31,600 (after 80/20 split at 2%). How many accounts need to survive each month to cover the cost of replacing failed ones?', options: [
    { text: '1 account surviving is enough \u2014 \u00A31,600/month covers the \u00A3400 replacement fee easily', correct: false, explain: 'Correct that 1 account covers the replacement cost. But the question is about BREAKEVEN for the entire prop business. If 1 of 3 accounts fails every 8 months, you need ~\u00A3400/8 = \u00A350/month set aside for replacements. Even 1 surviving account covers this. But the REAL breakeven is: total income MINUS replacement costs MINUS your time value.' },
    { text: 'At \u00A31,600/account/month with \u00A3400 replacement every ~8 months: replacement cost = \u00A350/month. So even 1 of 3 accounts surviving pays for itself. 2 surviving = net +\u00A33,150/month. 3 surviving = net +\u00A34,750/month. The maths overwhelmingly favours scaling even with regular account losses.', correct: true, explain: 'This is the prop business maths. 3 accounts at \u00A31,600 = \u00A34,800/month gross. Average 1 account lost every 8 months = \u00A350/month replacement cost. Net income at full survival: \u00A34,750. Even if you lose 1 account permanently (2 remaining): \u00A33,150/month net. The breakeven point is well below 1 account. This is why scaling works \u2014 the economics absorb regular failures.' },
    { text: 'All 3 must survive every month or the business is not viable', correct: false, explain: 'Account losses are NORMAL and EXPECTED. Budgeting for replacements is a cost of business, not a failure. The maths works even with regular attrition because the monthly income per account (\u00A31,600) far exceeds the amortised replacement cost (\u00A350/month). 100% survival is unrealistic; profitable scaling does not require it.' },
  ]},
];

const quizQuestions = [
  { q: 'Why is 3 \u00D7 \u00A350K generally better than 1 \u00D7 \u00A3200K for a new prop trader?', opts: ['Smaller accounts have easier rules', 'Multiple accounts diversify survival risk \u2014 losing one account does not eliminate your income, and the combined capital (\u00A3150K) still generates meaningful returns', 'Smaller accounts have better payout splits', '\u00A350K challenges are easier to pass'], correct: 1, explain: 'Diversification of survival. 1 \u00D7 \u00A3200K: one bad week = \u00A30 income. 3 \u00D7 \u00A350K: one bad week = lose 1 account, 2 still earning \u00A31,066/month combined. Same skill, same strategy, dramatically different risk profile.' },
  { q: 'When should you buy your SECOND funded account challenge?', opts: ['Immediately after passing the first challenge', 'After receiving at least 1 confirmed payout from your first funded account AND having 2+ consecutive profitable months', 'After 6 months of trading the first account', 'Whenever you can afford the challenge fee'], correct: 1, explain: 'The first payout confirms the end-to-end process works (your strategy, the firm\u2019s payout system, your funded risk management). 2 profitable months proves consistency. Until both conditions are met, scaling risks amplifying an unproven or unsustainable approach.' },
  { q: 'Why should you spread funded accounts across 2\u20133 different firms?', opts: ['Different firms have different instruments', 'To diversify firm-specific risk \u2014 if one firm changes rules, delays payouts, or has issues, your income from other firms continues', 'Because firms offer discounts for new customers', 'To take advantage of different payout schedules'], correct: 1, explain: 'Firm diversification protects against concentrated risk. If all accounts are at Firm X and Firm X changes rules or delays payouts, your ENTIRE prop income stops. Spreading across firms means any single firm\u2019s problem does not eliminate your income.' },
  { q: 'What is the "emotional isolation" principle when managing multiple accounts?', opts: ['Never feel emotions while trading', 'A loss on Account A should NOT influence trading decisions on Account B \u2014 each account is managed as a completely separate business with breaks between sessions', 'Only trade one account per week', 'Close all accounts if one has a bad day'], correct: 1, explain: 'Emotional isolation means Account A\u2019s bad day does not contaminate Account B\u2019s trading. The protocol: 30-minute break between accounts, honest self-check ("Am I trading this account\u2019s plan?"), and willingness to skip the second account if isolation fails.' },
  { q: 'What is the correct scaling sequence?', opts: ['Buy 3 challenges simultaneously', 'Scale by COUNT first (add more accounts at same size), then scale by SIZE (upgrade to larger accounts after proving consistency at smaller sizes)', 'Scale by SIZE first (get the largest account possible), then add more if needed', 'Scale randomly based on how much money you have'], correct: 1, explain: 'Count first, then size. 2 \u00D7 \u00A350K before 1 \u00D7 \u00A3200K. Multiple smaller accounts diversify survival. Larger accounts concentrate risk. Only upgrade size after: (1) consistent performance at current size, (2) income from existing accounts funds the challenge, (3) passing the larger challenge.' },
  { q: 'How should you fund new challenge purchases when scaling?', opts: ['From personal savings', 'From income generated by existing funded accounts \u2014 the prop business funds its own growth', 'From loans or credit', 'From borrowing against future payouts'], correct: 1, explain: 'Self-funding scaling: your existing funded accounts generate income, which pays for new challenge fees. This means zero additional personal capital at risk. If your funded accounts cannot generate enough to fund a new challenge, you are not earning enough to justify scaling yet.' },
  { q: 'With 3 accounts at \u00A31,600/month each and one account lost every ~8 months (replacement cost \u00A3400), what is the approximate monthly profit margin?', opts: ['\u00A31,200/month', '\u00A34,750/month (\u00A34,800 income minus \u00A350 amortised replacement cost)', '\u00A33,200/month', '\u00A32,400/month'], correct: 1, explain: '3 \u00D7 \u00A31,600 = \u00A34,800 gross monthly income. Replacement cost: \u00A3400 \u00F7 8 months = \u00A350/month. Net: \u00A34,750/month. Even losing 1 account entirely: 2 \u00D7 \u00A31,600 minus \u00A350 = \u00A33,150/month. The economics absorb regular account losses comfortably.' },
  { q: 'What is the "Core + Satellite" allocation strategy?', opts: ['One large core account at conservative risk for stable income, plus 1\u20132 smaller satellite accounts at slightly higher risk for growth', 'Trading the core session (London) and satellite sessions (Asia)', 'One account for forex and one for indices', 'The largest account is the core and smaller ones are backups'], correct: 0, explain: 'Core + Satellite: a large core account (e.g., \u00A3200K at 0.5% risk) provides stable, predictable income. Smaller satellite accounts (e.g., 2 \u00D7 \u00A350K at 0.75% risk) provide growth potential with less capital at risk if they fail. The core never changes. Satellites can be more experimental.' },
];

export default function ScalingFundedAccounts() {
  const [scrollY, setScrollY] = useState(0);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [gameRound, setGameRound] = useState(0);
  const [gameAnswers, setGameAnswers] = useState<(number | null)[]>(Array(gameRounds.length).fill(null));
  const [gameScore, setGameScore] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(Array(quizQuestions.length).fill(null));
  const [showConfetti, setShowConfetti] = useState(false);
  const [certUnlocked, setCertUnlocked] = useState(false);
  /* Planner state */
  const [plAccounts, setPlAccounts] = useState(3);
  const [plBalance, setPlBalance] = useState(100000);
  const [plReturn, setPlReturn] = useState(2);
  const [plSplit, setPlSplit] = useState(80);
  const [plChallengeCost, setPlChallengeCost] = useState(400);
  const [plFailRate, setPlFailRate] = useState(12);

  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);
  const toggle = (id: string) => setOpenSections(s => ({ ...s, [id]: !s[id] }));

  const handleGameAnswer = (oi: number) => { if (gameAnswers[gameRound] !== null) return; const a = [...gameAnswers]; a[gameRound] = oi; setGameAnswers(a); if (gameRounds[gameRound].options[oi].correct) setGameScore(s => s + 1); };
  const handleQuizAnswer = (qi: number, oi: number) => { if (quizAnswers[qi] !== null) return; const a = [...quizAnswers]; a[qi] = oi; setQuizAnswers(a); };

  const quizDone = quizAnswers.every(a => a !== null);
  const quizScoreVal = quizDone ? Math.round(quizAnswers.reduce<number>((s, a, i) => s + (a === quizQuestions[i].correct ? 1 : 0), 0) / quizQuestions.length * 100) : 0;
  useEffect(() => { if (quizDone && quizScoreVal >= 66 && !certUnlocked) { setCertUnlocked(true); setShowConfetti(true); const t = setTimeout(() => setShowConfetti(false), 4000); return () => clearTimeout(t); } }, [quizDone, quizScoreVal, certUnlocked]);

  /* Planner calculations */
  const grossPerAccount = plBalance * (plReturn / 100);
  const netPerAccount = grossPerAccount * (plSplit / 100);
  const monthlyGross = netPerAccount * plAccounts;
  const monthlyReplacementCost = (plAccounts * (plFailRate / 100) * plChallengeCost);
  const monthlyNet = monthlyGross - monthlyReplacementCost;
  const annualNet = monthlyNet * 12;
  const breakeven = Math.ceil(monthlyReplacementCost / netPerAccount * 10) / 10;
  const pessimistic = monthlyNet * 0.5;
  const optimistic = monthlyNet * 1.5;

  /* ─── DRAW FUNCTIONS ─── */
  const drawSingleVsMulti = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const cx = w / 2;
    const cy = h / 2;
    const cycle = f % 360;
    const phase = cycle < 180 ? 0 : 1;
    // Single account
    if (phase === 0) {
      ctx.fillStyle = 'rgba(239,68,68,0.08)'; ctx.fillRect(20, 35, w - 40, h - 70);
      // One big box
      ctx.fillStyle = 'rgba(239,68,68,0.25)'; ctx.strokeStyle = 'rgba(239,68,68,0.5)'; ctx.lineWidth = 2;
      const bw = w * 0.5; const bh = h * 0.4;
      ctx.beginPath(); ctx.roundRect(cx - bw / 2, cy - bh / 2, bw, bh, 8); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 14px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('\u00A3200K', cx, cy - 10);
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '10px system-ui';
      ctx.fillText('1 Account', cx, cy + 12);
      // X mark
      const pulse = Math.sin(f * 0.1) * 3;
      ctx.fillStyle = '#ef4444'; ctx.font = `bold ${20 + pulse}px system-ui`;
      ctx.fillText('\u2717', cx + bw / 2 + 20, cy);
      ctx.fillStyle = 'rgba(239,68,68,0.6)'; ctx.font = '8px system-ui';
      ctx.fillText('1 bad week = \u00A30', cx, h - 18);
    } else {
      ctx.fillStyle = 'rgba(34,197,94,0.06)'; ctx.fillRect(20, 35, w - 40, h - 70);
      // Multiple boxes
      const boxW = (w - 80) / 3;
      const boxH = h * 0.35;
      const colors = ['#22c55e', '#3b82f6', '#f59e0b'];
      for (let i = 0; i < 3; i++) {
        const bx = 30 + i * (boxW + 10);
        const by = cy - boxH / 2;
        const isLost = i === 2;
        ctx.fillStyle = isLost ? 'rgba(239,68,68,0.15)' : colors[i] + '25';
        ctx.strokeStyle = isLost ? 'rgba(239,68,68,0.4)' : colors[i] + '66';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.roundRect(bx, by, boxW, boxH, 6); ctx.fill(); ctx.stroke();
        ctx.fillStyle = isLost ? '#ef4444' : '#fff';
        ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(isLost ? '\u2717 Lost' : `\u00A3${(200 / 3).toFixed(0)}K`, bx + boxW / 2, by + boxH / 2 - 6);
        ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '8px system-ui';
        ctx.fillText(`Account ${i + 1}`, bx + boxW / 2, by + boxH / 2 + 10);
      }
      ctx.fillStyle = 'rgba(34,197,94,0.6)'; ctx.font = '8px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText('1 bad week = lose 1 account, 2 still earning', cx, h - 18);
    }
    // Title
    ctx.fillStyle = phase === 0 ? 'rgba(239,68,68,0.6)' : 'rgba(34,197,94,0.6)';
    ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(phase === 0 ? 'SINGLE ACCOUNT: All eggs, one basket' : 'MULTIPLE ACCOUNTS: Diversified survival', cx, 8);
  }, []);

  const drawScalingRoadmap = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const cx = w / 2;
    const cy = h / 2;
    const cycle = f % 480;
    const activeIdx = Math.floor(cycle / 120) % 4;
    const stepW = (w - 40) / 4;
    const baseY = cy;
    // Timeline bar
    ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(20, baseY, w - 40, 4);
    const progressW = ((activeIdx + 1) / 4) * (w - 40);
    const grad = ctx.createLinearGradient(20, 0, 20 + progressW, 0);
    grad.addColorStop(0, '#f59e0b'); grad.addColorStop(1, '#d946ef');
    ctx.fillStyle = grad; ctx.fillRect(20, baseY, progressW, 4);
    for (let i = 0; i < 4; i++) {
      const sx = 20 + stepW * i + stepW / 2;
      const isActive = i === activeIdx;
      // Dot
      ctx.beginPath(); ctx.arc(sx, baseY + 2, isActive ? 8 : 5, 0, Math.PI * 2);
      ctx.fillStyle = isActive ? scalingTimeline[i].color : 'rgba(255,255,255,0.15)'; ctx.fill();
      // Month label above
      ctx.fillStyle = isActive ? '#fff' : 'rgba(255,255,255,0.3)';
      ctx.font = `${isActive ? 'bold 9' : '8'}px system-ui`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText(scalingTimeline[i].month, sx, baseY - 14);
      // Account count below
      ctx.fillStyle = isActive ? scalingTimeline[i].color : 'rgba(255,255,255,0.25)';
      ctx.font = `${isActive ? 'bold 10' : '8'}px system-ui`;
      ctx.textBaseline = 'top';
      ctx.fillText(`${scalingTimeline[i].accounts} acct`, sx, baseY + 12);
      if (isActive) {
        ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '8px system-ui';
        ctx.fillText(scalingTimeline[i].totalBal, sx, baseY + 26);
      }
    }
    // Active description
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '8px system-ui';
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    const desc = scalingTimeline[activeIdx].action;
    const maxW = w - 40;
    if (ctx.measureText(desc).width > maxW) {
      const words = desc.split(' '); let line = ''; const lines: string[] = [];
      for (const word of words) { const t = line + (line ? ' ' : '') + word; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = word; } else { line = t; } }
      if (line) lines.push(line);
      let ly = h - 8 - (lines.length - 1) * 11;
      for (const l of lines) { ctx.fillText(l, cx, ly); ly += 11; }
    } else { ctx.fillText(desc, cx, h - 8); }
    // Title
    ctx.fillStyle = 'rgba(245,158,11,0.6)'; ctx.font = 'bold 9px system-ui'; ctx.textBaseline = 'top';
    ctx.fillText('12-Month Scaling Roadmap', cx, 6);
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
          <motion.p variants={fadeUp} className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-4">Level 9 &middot; Lesson 10 of 14</motion.p>
          <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold leading-tight mb-4 bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Scaling Funded Accounts</motion.h1>
          <motion.p variants={fadeUp} className="text-gray-400 max-w-lg mx-auto text-sm leading-relaxed">Multiple accounts as income streams. When to add, how to allocate, firm diversification, and the 12-month scaling roadmap.</motion.p>
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.8 }} className="absolute bottom-8 flex flex-col items-center gap-2 text-gray-600 text-xs">Scroll to begin<motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-amber-500">&#8964;</motion.div></motion.div>
      </section>

      <section className="max-w-2xl mx-auto px-5 py-20"><motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">00 &mdash; Why This Matters</p><h2 className="text-2xl font-extrabold mb-4">One Account Is a Proof of Concept. Three Is a Business.</h2><div className="p-6 rounded-2xl glass-card space-y-4">
        <p className="text-sm text-gray-300 leading-relaxed">One funded account earning 2% monthly is &pound;1,600/month (after 80/20 split on &pound;100K). That is a start. Three accounts earning the same is &pound;4,800/month. <strong className="text-white">Same skill. Same strategy. Three times the income.</strong> But scaling is not just &ldquo;buy more challenges.&rdquo; It is an engineering decision with specific timing, allocation, and firm diversification requirements.</p>
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-purple-500/10 border border-amber-500/20"><p className="text-xs font-bold text-amber-400 mb-1">&#9889; REAL SCENARIO</p><p className="text-xs text-gray-300">Trader A: 1 &times; &pound;200K account. Month 3: lost to DD breach. Income: &pound;0. Recovery time: 2 months (new challenge + evaluation). Trader B: 4 &times; &pound;50K accounts. Month 3: lost 1 account. Income: &pound;2,400/month from 3 surviving accounts. Replaced the lost account from payout income while still earning. <strong className="text-white">Same total capital. Completely different outcome.</strong></p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; Single vs Multiple</p><h2 className="text-2xl font-extrabold mb-2">Why Multiple Accounts Win</h2><p className="text-gray-400 text-sm mb-4">One big account vs several smaller ones. Watch the survival difference when one bad week hits.</p>
      <div className="rounded-2xl glass-card p-4"><AnimScene drawFn={drawSingleVsMulti} height={260} /></div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Scaling Roadmap</p><h2 className="text-2xl font-extrabold mb-2">12-Month Growth Plan</h2><p className="text-gray-400 text-sm mb-4">Month-by-month progression from 1 account to a diversified prop portfolio.</p>
      <div className="rounded-2xl glass-card p-4"><AnimScene drawFn={drawScalingRoadmap} height={240} /></div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; Single vs Multi Breakdown</p><h2 className="text-2xl font-extrabold mb-4">6 Comparison Points</h2><div className="p-6 rounded-2xl glass-card space-y-2">{singleVsMulti.map((sv, i) => (<div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm font-bold" style={{ color: sv.color }}>{sv.aspect} <span className="text-[10px] font-mono ml-2 text-gray-500">{sv.verdict}</span></p><div className="grid grid-cols-2 gap-3 mt-1"><div><p className="text-[10px] text-gray-500">SINGLE</p><p className="text-xs text-gray-300">{sv.single}</p></div><div><p className="text-[10px] text-gray-500">MULTIPLE</p><p className="text-xs text-gray-300">{sv.multi}</p></div></div></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; When to Scale</p><h2 className="text-2xl font-extrabold mb-4">Ready vs Not Ready</h2><div className="p-6 rounded-2xl glass-card space-y-3">{whenToScale.map((ws, i) => (<div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold text-gray-200">{ws.signal}</p><p className="text-xs text-gray-400 mt-1">{ws.desc}</p></div><span className={`text-[10px] font-bold px-2 py-1 rounded-lg shrink-0 ${ws.ready ? 'bg-green-500/15 border border-green-500/30 text-green-400' : 'bg-red-500/15 border border-red-500/30 text-red-400'}`}>{ws.ready ? 'READY' : 'NOT YET'}</span></div></div>))}</div></motion.div></section>

      {/* S05 — GROUNDBREAKING: Prop Scaling Planner */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Plan Your Scale</p><h2 className="text-2xl font-extrabold mb-2">&#127919; Prop Scaling Planner</h2><p className="text-gray-400 text-sm mb-4">Input your scaling targets. See monthly income, breakeven analysis, and 12-month projections across 3 scenarios.</p>
      <div className="p-6 rounded-2xl glass-card space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div><p className="text-[10px] text-amber-400 font-bold mb-1">Number of Accounts</p><input type="number" value={plAccounts} onChange={e => setPlAccounts(Math.max(1, Math.min(6, Number(e.target.value))))} className={inputCls} /></div>
          <div><p className="text-[10px] text-amber-400 font-bold mb-1">Balance Each (&pound;)</p><input type="number" value={plBalance} onChange={e => setPlBalance(Math.max(25000, Number(e.target.value)))} className={inputCls} /></div>
          <div><p className="text-[10px] text-amber-400 font-bold mb-1">Monthly Return (%)</p><input type="number" value={plReturn} onChange={e => setPlReturn(Math.max(0.5, Math.min(10, Number(e.target.value))))} step={0.5} className={inputCls} /></div>
          <div><p className="text-[10px] text-amber-400 font-bold mb-1">Payout Split (%)</p><input type="number" value={plSplit} onChange={e => setPlSplit(Math.max(50, Math.min(95, Number(e.target.value))))} className={inputCls} /></div>
          <div><p className="text-[10px] text-amber-400 font-bold mb-1">Challenge Cost (&pound;)</p><input type="number" value={plChallengeCost} onChange={e => setPlChallengeCost(Math.max(100, Number(e.target.value)))} className={inputCls} /></div>
          <div><p className="text-[10px] text-amber-400 font-bold mb-1">Monthly Failure Rate (%)</p><input type="number" value={plFailRate} onChange={e => setPlFailRate(Math.max(0, Math.min(50, Number(e.target.value))))} className={inputCls} /></div>
        </div>
        {/* Results */}
        <div className="space-y-2">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex justify-between items-center"><div><p className="text-xs font-bold text-gray-300">Gross Monthly Income</p><p className="text-[10px] text-gray-500">{plAccounts} &times; &pound;{netPerAccount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p></div><p className="text-sm font-extrabold text-green-400">&pound;{monthlyGross.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p></div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex justify-between items-center"><div><p className="text-xs font-bold text-gray-300">Monthly Replacement Cost</p><p className="text-[10px] text-gray-500">{plAccounts} &times; {plFailRate}% &times; &pound;{plChallengeCost}</p></div><p className="text-sm font-extrabold text-red-400">&minus;&pound;{monthlyReplacementCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p></div>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex justify-between items-center"><div><p className="text-xs font-bold text-amber-400">Net Monthly Income</p></div><p className="text-lg font-extrabold text-amber-400">&pound;{monthlyNet.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p></div>
        </div>
        {/* Scenarios */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15 text-center"><p className="text-[10px] text-gray-500">Pessimistic (50%)</p><p className="text-sm font-bold text-red-400">&pound;{pessimistic.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo</p><p className="text-[9px] text-gray-600">&pound;{(pessimistic * 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}/yr</p></div>
          <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 text-center"><p className="text-[10px] text-gray-500">Realistic</p><p className="text-sm font-bold text-amber-400">&pound;{monthlyNet.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo</p><p className="text-[9px] text-gray-600">&pound;{annualNet.toLocaleString(undefined, { maximumFractionDigits: 0 })}/yr</p></div>
          <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/15 text-center"><p className="text-[10px] text-gray-500">Optimistic (150%)</p><p className="text-sm font-bold text-green-400">&pound;{optimistic.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo</p><p className="text-[9px] text-gray-600">&pound;{(optimistic * 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}/yr</p></div>
        </div>
        {/* Breakeven */}
        <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20"><p className="text-xs font-bold text-purple-400">BREAKEVEN ANALYSIS</p><p className="text-xs text-gray-300 mt-1">Minimum accounts needed to cover replacement costs: <strong className="text-white">{breakeven < 1 ? 'Less than 1' : breakeven.toFixed(1)}</strong> accounts surviving. You have {plAccounts}. Buffer: {plAccounts - breakeven > 0 ? `+${(plAccounts - breakeven).toFixed(1)} accounts` : 'tight \u2014 consider reducing failure rate or adding an account'}.</p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Allocation Strategies</p><h2 className="text-2xl font-extrabold mb-4">How to Distribute Your Capital</h2><div className="space-y-3">{allocationStrategies.map((a, i) => (<div key={i}><button onClick={() => toggle(`al-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold" style={{ color: a.color }}>{a.name}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`al-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`al-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05] space-y-1"><p className="text-xs text-gray-300">{a.desc}</p><p className="text-xs text-gray-500 mt-1">Example: {a.example}</p><p className="text-xs text-green-400">&#10004; {a.pros}</p><p className="text-xs text-red-400">&#10060; {a.cons}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; The Scaling Sequence</p><h2 className="text-2xl font-extrabold mb-4">Count First, Then Size</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#3b82f6]">STEP 1: COUNT</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Add more accounts at the same size. 2 &times; &pound;50K, then 3 &times; &pound;50K. Each new account funded from payout income. Diversifies survival risk without increasing per-account pressure.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#22c55e]">STEP 2: SIZE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">After proving consistency at current size (3+ months), upgrade one account to the next tier. 1 &times; &pound;100K to replace 1 &times; &pound;50K. Pass the larger challenge first. Fund from payout income.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#f59e0b]">STEP 3: OPTIMISE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">After 6\u201312 months, you have data. Drop the worst-performing firm. Scale the best performer. Adjust allocation. This is the business maturation phase.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">THE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Every scaling decision should be funded by income from existing accounts. If your prop business cannot fund its own growth, you are not earning enough to justify scaling.</span></p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p><h2 className="text-2xl font-extrabold mb-4">4 Scaling Errors</h2><div className="space-y-3">{commonMistakes.map((item, i) => (<div key={i}><button onClick={() => toggle(`cm-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`cm-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`cm-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-xs text-red-400 mb-2">&#10060; {item.mistake}</p><p className="text-xs text-green-400">&#10004; {item.fix}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Cheat Sheet</p><h2 className="text-2xl font-extrabold mb-4">Scaling Quick Reference</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#22c55e]">COUNT BEFORE SIZE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">3 &times; &pound;50K before 1 &times; &pound;200K. Multiple smaller accounts diversify survival. One large account concentrates risk.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#3b82f6]">DIVERSIFY FIRMS</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">2\u20133 different firms minimum. If one firm has issues, the others continue earning. Concentrated firm risk is concentrated income risk.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#f59e0b]">FUND FROM INCOME</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Every new challenge paid from payout income, not savings. If the business cannot fund its own growth, you are not ready to scale.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#8b5cf6]">ISOLATE EMOTIONS</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Account A&apos;s bad day must not affect Account B&apos;s trading. 30-minute break between sessions. Self-check before each account.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">THE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">One account is a proof of concept. Multiple accounts is a business. Scale when the proof is confirmed, not when the excitement is high.</span></p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Test Your Understanding</p><h2 className="text-2xl font-extrabold mb-2">Scaling Strategy Game</h2><p className="text-gray-400 text-sm mb-6">5 scenario-based rounds. Time your scaling, isolate emotions, diversify firms, and calculate breakevens.</p>
      <div className="p-6 rounded-2xl glass-card"><div className="flex items-center justify-between mb-4"><span className="text-xs font-bold text-amber-400">Round {gameRound + 1} of {gameRounds.length}</span><span className="text-xs font-mono text-gray-500">{gameScore}/{gameRounds.length} correct</span></div><p className="text-sm text-gray-300 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: gameRounds[gameRound].scenario }} /><div className="space-y-2">{gameRounds[gameRound].options.map((opt, oi) => { const answered = gameAnswers[gameRound] !== null; const selected = gameAnswers[gameRound] === oi; const isCorrect = opt.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return (<div key={oi}><button onClick={() => handleGameAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt.text }} /></button>{answered && selected && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]"><p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`} dangerouslySetInnerHTML={{ __html: opt.explain }} /></motion.div>)}</div>); })}</div>{gameAnswers[gameRound] !== null && gameRound < gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5"><button onClick={() => setGameRound(r => r + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button></motion.div>)}{gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Outstanding \u2014 you understand scaling as a business discipline, not just a volume increase.' : gameScore >= 3 ? 'Good \u2014 review the firm diversification and emotional isolation scenarios.' : 'Re-read the scaling sequence and when-to-scale sections. Scaling too early or incorrectly is expensive.'}</p></motion.div>)}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Knowledge Check</p><h2 className="text-2xl font-extrabold mb-6">Final Quiz &mdash; 8 Questions</h2>
      <div className="space-y-6">{quizQuestions.map((q, qi) => (<div key={qi} className="p-5 rounded-2xl glass-card"><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p><p className="text-sm font-semibold text-white mb-4">{q.q}</p><div className="space-y-2">{q.opts.map((opt, oi) => { const answered = quizAnswers[qi] !== null; const selected = quizAnswers[qi] === oi; const isCorrect = oi === q.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return <button key={oi} onClick={() => handleQuizAnswer(qi, oi)} disabled={answered} className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`}>{opt}</button>; })}</div>{quizAnswers[qi] !== null && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg bg-white/[0.02]"><p className="text-xs text-amber-400" dangerouslySetInnerHTML={{ __html: `<span class="font-bold">&#9989;</span> ${q.explain}` }} /></motion.div>)}</div>))}</div>
      {quizDone && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center"><p className="text-3xl font-extrabold mb-2">{quizScoreVal}%</p><p className="text-sm text-gray-400">{quizScoreVal >= 66 ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate. Review and try again.'}</p></motion.div>)}
      {certUnlocked && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10"><div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}><div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(139,92,246,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} /><div className="relative z-10 text-center"><div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">&#128200;</div><p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p><p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 9: Scaling Funded Accounts</strong><br />at ATLAS Academy by Interakktive</p><p className="bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Scaling Architect &mdash;</p><p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L9.10-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p></div></div></motion.div>)}</motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-20 text-center"><Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">&larr; Back to Academy</Link></section>
    </div>
  );
}
