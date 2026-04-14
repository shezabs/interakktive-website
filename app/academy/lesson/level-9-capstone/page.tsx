// app/academy/lesson/level-9-capstone/page.tsx
// ATLAS Academy — Lesson 9.14: Your Prop Business Plan — Capstone [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 9 · CAPSTONE
// GROUNDBREAKING: Complete Prop Business Plan Builder — 6 interactive sections
// TEMPLATE: Matches 9.10 (scaling-funded-accounts) gold standard exactly
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
const lessonSummary = [
  { num: '9.1', title: 'What Is Prop Trading?', takeaway: 'Prop firms are a capital multiplier. Same skill, dramatically different income.', color: '#22c55e' },
  { num: '9.2', title: 'How Prop Firms Work', takeaway: '85\u201390% fail. The firm profits from challenge fees. Understand the business model.', color: '#3b82f6' },
  { num: '9.3', title: 'Choosing Your Firm', takeaway: 'Rule compatibility beats price. Static DD beats trailing. Expected cost = fee \u00F7 pass rate.', color: '#f59e0b' },
  { num: '9.4', title: 'Challenge Mathematics', takeaway: '0.75% risk is the sweet spot for most strategies. Simulate before paying.', color: '#8b5cf6' },
  { num: '9.5', title: 'Challenge Strategy Design', takeaway: 'Same system, different parameters. 3-phase approach: Cautious \u2192 Build \u2192 Protect.', color: '#22c55e' },
  { num: '9.6', title: 'The Challenge Mindset', takeaway: '2-loss rule. 48-hour re-attempt ban. The sunk cost is gone \u2014 trade the system.', color: '#ef4444' },
  { num: '9.7', title: 'Passing the Challenge', takeaway: 'Phase 2 is harder than Phase 1. Target hit = stop trading. Consistency beats aggression.', color: '#3b82f6' },
  { num: '9.8', title: 'Funded Account Management', takeaway: 'Survival mode, not profit mode. Catch the slow bleed. Mandatory days off.', color: '#f59e0b' },
  { num: '9.9', title: 'Daily vs Overall Drawdown', takeaway: 'Trade to the tighter constraint. Open P&L counts. 60% safe zone rule.', color: '#8b5cf6' },
  { num: '9.10', title: 'Scaling Funded Accounts', takeaway: 'Count before size. Diversify firms. Fund from income, not savings.', color: '#22c55e' },
  { num: '9.11', title: 'Payout Optimisation', takeaway: 'Longevity \u00D7 split = total income. 2% buffer. 30% tax reserve. Track everything.', color: '#3b82f6' },
  { num: '9.12', title: 'When Challenges Fail', takeaway: '4 failure types, 4 recovery protocols. 3-strike rule. Diagnose before re-attempting.', color: '#ef4444' },
  { num: '9.13', title: 'Building a Prop Business', takeaway: 'Monthly P&L. Business bank account. Emergency fund. Net income, not gross.', color: '#f59e0b' },
];

const planSections = [
  { id: 'firms', title: '1. Firm Selection', emoji: '\ud83c\udfe2', color: '#3b82f6' },
  { id: 'budget', title: '2. Challenge Budget', emoji: '\ud83d\udcb0', color: '#22c55e' },
  { id: 'strategy', title: '3. Strategy Adaptation', emoji: '\u2699\uFE0F', color: '#f59e0b' },
  { id: 'scaling', title: '4. Scaling Timeline', emoji: '\ud83d\udcc8', color: '#8b5cf6' },
  { id: 'income', title: '5. Income Targets', emoji: '\ud83c\udfaf', color: '#22c55e' },
  { id: 'contingency', title: '6. Failure Contingency', emoji: '\ud83d\udee1\uFE0F', color: '#ef4444' },
];

const firmChips = ['FTMO', 'FundingPips', 'MyFundedFX', 'The5ers', 'E8 Funding', 'True Forex Funds', 'Alpha Capital', 'Other'];
const instrumentChips = ['XAUUSD', 'GBPUSD', 'EURUSD', 'USDJPY', 'NAS100', 'US30', 'Other'];

const commonMistakes = [
  { title: 'No Written Plan', mistake: '"I know what I am doing, I do not need to write it down." Without a written plan, your prop business strategy exists only in your head. Under pressure (losing streak, multiple failures), the mental plan degrades. Decisions become reactive instead of systematic. Every successful business has a written plan.', fix: 'Write it down. Print it. Pin it next to your trading station. Review it monthly. The plan is your anchor when emotions pull you off course.' },
  { title: 'Unrealistic Income Targets', mistake: '"I will earn \u00A310,000/month by Month 3." At 2.5% monthly on \u00A3100K at 80/20, your net after tax is approximately \u00A31,400. To earn \u00A310,000/month net, you need roughly 5\u20137 funded accounts at \u00A3100K+ each, all performing consistently. This takes 6\u201312 months to build.', fix: 'Start with a realistic Month 1\u20133 target: \u00A31,000\u20132,000 net. Increase targets as you add accounts. Let the numbers scale naturally rather than setting targets that create pressure.' },
  { title: 'No Failure Contingency', mistake: '"I will cross that bridge when I come to it." When all accounts fail simultaneously (it happens), the panic of having no plan makes everything worse. You make emotional re-purchase decisions, dip into personal savings, and skip the recovery protocol.', fix: 'Written contingency: emergency fund size, maximum consecutive failures before mandatory pause, demo return criteria, backup income source. When disaster strikes, you follow the plan \u2014 you do not improvise.' },
  { title: 'Treating the Plan as Static', mistake: '"I wrote the plan, now I just follow it forever." Markets change. Your skill evolves. Firms change rules. A plan written in January may be partially outdated by June. Static plans create blind spots.', fix: 'Monthly review: check actual vs projected numbers. Quarterly revision: update firm selection, strategy parameters, and targets based on real data. The plan is a living document, not a monument.' },
];

const gameRounds = [
  { scenario: '<strong>Business plan integration:</strong> You are starting your prop trading business. You have \u00A32,000 in startup capital. Your strategy averages 58% WR, 1:1.8 R:R on XAUUSD, London session. You want to build a plan. What should your FIRST priority be?', options: [
    { text: 'Firm selection \u2014 find the best 90/10 split firm available.', correct: false, explain: 'Split percentage is one of MANY factors. Your first priority should be matching firm RULES to your strategy. A 58% WR Gold scalper needs: reasonable daily DD (5%+), news trading allowed (Gold moves on CPI/NFP), and static overall DD. The split is secondary to rule compatibility.' },
    { text: 'Challenge budget \u2014 calculate how many attempts your \u00A32,000 covers and allocate: challenge fee, emergency fund (2 more attempts), basic equipment, and a written financial plan BEFORE purchasing anything.', correct: true, explain: 'Budget-first is the business approach. \u00A32,000 = 1 challenge (\u00A3400) + emergency fund (\u00A3800 = 2 retries) + equipment (\u00A3250) + remainder to emergency fund (\u00A3550 extra buffer). This ensures you can survive 3 failures and still have equipment. Purchasing without budgeting is gambling with startup capital.' },
    { text: 'Strategy adaptation \u2014 design your challenge parameters first so you know what you need.', correct: false, explain: 'Strategy adaptation cannot happen until you know the firm\u2019s rules (DD limits, target, time limit). And firm selection cannot happen until you know the budget. The correct sequence is: Budget \u2192 Firm Selection \u2192 Strategy Adaptation.' },
  ]},
  { scenario: '<strong>Scaling timeline reality check:</strong> Your plan says: Month 1 \u2014 pass challenge. Month 2 \u2014 get funded, add second account. Month 3 \u2014 add third account. Month 6 \u2014 earning \u00A35,000/month. Is this timeline realistic?', options: [
    { text: 'Yes \u2014 if you are disciplined and follow the plan, this timeline is achievable.', correct: false, explain: 'This timeline assumes: 100% pass rate on first attempt (realistic pass rate is 15\u201330%), immediate profitability after funding (typical Month 1 is cautious/breakeven), and linear scaling. A more realistic timeline: Month 1\u20132 (pass first challenge, possibly 2nd attempt needed), Month 3\u20134 (first payout, prove consistency), Month 5\u20136 (add Account 2), Month 9\u201312 (\u00A33,000\u20135,000/month range).' },
    { text: 'No \u2014 this assumes first-attempt passes and instant profitability. Realistic: Month 1\u20133 for first funded account (allowing for re-attempts), Month 4\u20136 for second account and consistent income, Month 7\u201312 for \u00A33,000\u20135,000/month. Build in failure tolerance.', correct: true, explain: 'The realistic timeline accounts for: a 30% pass rate (may need 2\u20133 attempts), a cautious first month on funded (building confidence, not maximising income), and gradual scaling funded by income. The \u00A35,000/month target is achievable but takes 9\u201312 months, not 6. Plans that do not account for failures create disappointment and emotional decision-making.' },
    { text: 'It depends entirely on market conditions \u2014 impossible to plan scaling.', correct: false, explain: 'While market conditions affect individual months, the BUSINESS timeline can be planned. You know your average stats, your typical pass rate, and the expected funded income. What varies is the exact month each milestone is hit. A plan with failure tolerance (+/\u2212 2 months on each target) handles this uncertainty without abandoning the structure.' },
  ]},
  { scenario: '<strong>Income target calculation:</strong> Your plan has 3 funded accounts at \u00A3100K each, 80/20 split, targeting 2.5% monthly return, 12% monthly failure rate, \u00A3400 challenge cost, \u00A380 monthly expenses, 30% tax. What is your projected monthly NET income?', options: [
    { text: '\u00A36,000 \u2014 3 accounts \u00D7 \u00A3100K \u00D7 2.5% = \u00A37,500 gross, and 80% of that is \u00A36,000.', correct: false, explain: 'This is the gross after split but BEFORE replacement costs, expenses, and tax. The actual net is much lower. Business planning requires the full P&L, not just the top line.' },
    { text: '\u00A33,838 \u2014 Gross per account: \u00A32,000 (2.5% \u00D7 80%). Total: \u00A36,000. Replacement: \u00A3144 (3 \u00D7 12% \u00D7 \u00A3400). Expenses: \u00A380. Pre-tax: \u00A35,776. Tax (30%): \u00A31,733. Net: \u00A34,043. Wait, let me recalculate...', correct: false, explain: 'Close but the calculation has rounding issues. The precise answer: 3 \u00D7 (\u00A3100K \u00D7 2.5% \u00D7 80%) = \u00A36,000. Minus replacement: 3 \u00D7 12% \u00D7 \u00A3400 = \u00A3144. Minus expenses: \u00A380. Pre-tax: \u00A35,776. After 30% tax: \u00A34,043. But the correct answer choice does the full P&L properly.' },
    { text: '\u00A34,043 \u2014 Full P&L: Revenue \u00A36,000 (3 \u00D7 \u00A32,000 after split) minus Replacement \u00A3144 minus Expenses \u00A380 = \u00A35,776 pre-tax. After 30% tax reserve: \u00A34,043 net. This is the number your lifestyle should be built around.', correct: true, explain: 'Correct full P&L calculation. Note: \u00A34,043 net is 67% of the \u00A36,000 gross after split. The remaining 33% goes to: replacement costs (2.4%), expenses (1.3%), and tax (28.9%). If your plan says "\u00A36,000/month" without these deductions, your plan is wrong. Always plan around net income.' },
  ]},
  { scenario: '<strong>Failure contingency activation:</strong> Your contingency plan says: "If 2 consecutive challenges fail, pause for 2 weeks. If 3 consecutive challenges fail, return to demo for 1 month." You just failed your 2nd consecutive challenge. Your emotions are telling you that you "almost" passed and the 3rd attempt will succeed. What do you do?', options: [
    { text: 'Trust your gut \u2014 you were close and the 3rd attempt will be different.', correct: false, explain: '"Almost passed" is not a diagnosis. Why did you fail? Was it the same failure type both times? Your emotions are telling you to act now because the sunk cost of 2 fees (\u00A3800) feels urgent. But the contingency plan was written when you were rational. Trust the plan, not the emotion.' },
    { text: 'Follow the contingency plan: pause for 2 weeks. During the pause, diagnose both failures (were they the same type?), test fixes on demo, and only re-attempt after the 2-week period with confirmed improvement. The plan was written when you were calm. Trust it.', correct: true, explain: 'The contingency plan is your sober self protecting your emotional self. 2 consecutive failures + the urge to "try again immediately" is the exact scenario the plan was designed for. The 2-week pause costs \u00A30 and prevents a potential 3rd failure (\u00A3400). Even if you are right that you "almost" passed, 2 weeks of demo confirmation makes the 3rd attempt stronger, not weaker.' },
    { text: 'Skip straight to the 1-month demo period \u2014 2 failures means something is fundamentally wrong.', correct: false, explain: '2 failures triggers the 2-week pause, not the 1-month demo. The contingency plan has graduated responses for a reason: 2 failures could be variance + execution. 3 failures is a pattern. Follow the plan\u2019s specific threshold, not an over-correction. If the 3rd attempt also fails after the 2-week recovery, THEN the 1-month demo is triggered.' },
  ]},
  { scenario: '<strong>Complete business plan review:</strong> After 6 months, your actual numbers are: 2 funded accounts (planned for 3), \u00A313,200 total payouts (planned \u00A318,000), 5 failed challenges (planned 3), net income \u00A37,800 (planned \u00A310,800). You are behind plan on every metric. What is the correct response?', options: [
    { text: 'Scrap the plan and start over \u2014 it clearly did not work.', correct: false, explain: 'The plan was not wrong in structure, it was optimistic in targets. Revenue is 73% of plan. Net income is 72% of plan. This is a successful business that is slightly behind schedule, not a failed business. Scrapping the plan throws away 6 months of systems (bank account, P&L tracking, tax reserve) that ARE working.' },
    { text: 'Revise the plan: adjust targets to reflect actual performance (73% of original projections), extend the 3-account target to Month 9 instead of Month 6, reduce the challenge budget (5 failures means higher failure rate than estimated \u2014 update the assumption), and keep all systems running. The business is working. The timeline was optimistic.', correct: true, explain: 'Correct response. The business IS profitable (\u00A37,800 net in 6 months). The P&L system IS working. The tax reserve IS building. The only problem is that the original targets were 30% too optimistic. Revise: extend timelines, adjust failure rate assumption from 12% to 20%, scale account addition to Month 9. This is normal business maturation \u2014 every startup revises its plan within the first 6 months.' },
    { text: 'Increase risk per trade to catch up to the planned numbers.', correct: false, explain: 'Increasing risk to meet a plan target is the opposite of business thinking. The plan serves the business, not the other way around. If the plan says \u00A318,000 and reality is \u00A313,200, you adjust the plan to reality \u2014 not reality to the plan. Increasing risk increases the probability of losing funded accounts, which puts you further behind.' },
  ]},
];

const quizQuestions = [
  { q: 'What are the 6 sections of a complete prop business plan?', opts: ['Strategy, risk, profit, loss, review, exit', 'Firm Selection, Challenge Budget, Strategy Adaptation, Scaling Timeline, Income Targets, and Failure Contingency', 'Entry, exit, stop loss, take profit, risk, reward', 'Research, planning, execution, review, scaling, retirement'], correct: 1, explain: 'The 6 sections cover the complete business lifecycle: WHO you trade with (Firm Selection), HOW MUCH you invest (Budget), HOW you adapt (Strategy), WHEN you grow (Scaling), WHAT you earn (Income), and WHAT IF it goes wrong (Contingency).' },
  { q: 'What is the correct sequence for building a prop business plan?', opts: ['Strategy first, then find a firm that matches', 'Budget first \u2014 know what you can afford before selecting firms or designing strategy, because every subsequent decision is constrained by your available capital', 'Income targets first, then reverse-engineer everything else', 'Firm selection first, then budget around it'], correct: 1, explain: 'Budget-first is business fundamentals. You cannot select a firm without knowing your challenge budget. You cannot design a scaling timeline without knowing how many re-attempts you can afford. Every downstream decision is constrained by the startup capital. Budget \u2192 Firm \u2192 Strategy \u2192 Scaling \u2192 Income \u2192 Contingency.' },
  { q: 'Why should scaling timelines include failure tolerance?', opts: ['Because failure is expected, not exceptional \u2014 a 30% pass rate means 2\u20133 attempts per funded account, and the timeline must account for the time and cost of re-attempts', 'Because it looks more professional', 'Because firms require it', 'It should not \u2014 plan for success, not failure'], correct: 0, explain: 'At a 30% pass rate, the expected number of attempts per funded account is 3.3. A timeline that assumes first-attempt passes will always be disappointed. Building in failure tolerance (\u00B12 months per milestone) creates a plan that survives contact with reality and prevents emotional reactions when timelines slip.' },
  { q: 'How often should a prop business plan be reviewed and revised?', opts: ['Never \u2014 stick to the original plan', 'Monthly check (actual vs projected), quarterly revision (update targets and assumptions based on real data), annual overhaul (next-year plan)', 'Only when something goes wrong', 'Daily'], correct: 1, explain: 'Monthly: quick check (am I on track?). Quarterly: deeper revision (are my assumptions correct? do I need to adjust targets?). Annual: full review (next year\u2019s plan based on this year\u2019s data). The plan is a living document. Markets change, skills evolve, firms change rules.' },
  { q: 'What should happen when actual performance is consistently below plan targets?', opts: ['Increase risk to catch up', 'Revise the plan to reflect actual performance \u2014 adjust targets, extend timelines, and update failure rate assumptions while keeping all operational systems running', 'Abandon prop trading', 'Ignore it and keep following the original plan'], correct: 1, explain: 'Actual data overrides projections. If you planned for \u00A318K in 6 months and earned \u00A313K, the business IS working (73% of target). Revise timelines and assumptions. Do NOT increase risk to meet arbitrary targets \u2014 the plan serves the business, not the other way around.' },
  { q: 'Why is a written failure contingency essential?', opts: ['It is not essential \u2014 experienced traders adapt on the fly', 'Because it was written when you were rational and calm, and it protects you from emotional decisions during the exact situations (consecutive failures, account losses) when emotions are strongest', 'To impress investors', 'For tax purposes'], correct: 1, explain: 'The contingency plan is your calm self protecting your panicked self. Consecutive failures trigger emotional decisions: immediate re-purchases, increased risk, skipped recovery protocols. The written plan says: "Stop. 2 weeks. Diagnose. Demo. Then decide." Following a plan costs nothing. Emotional decisions cost \u00A3400+ each.' },
  { q: 'From Level 9, what is the single most important concept for long-term prop trading success?', opts: ['Finding the best firm', 'Having the highest win rate', 'Treating prop trading as a business with systematic operations: P&L tracking, risk management, failure diagnosis, scaling discipline, and contingency planning', 'Getting the highest payout split'], correct: 2, explain: 'The entire Level 9 progression builds to this: prop trading is a BUSINESS. Firm selection, challenge strategy, drawdown management, payout optimisation, failure analysis, and scaling \u2014 all are business operations. Traders who operate systematically survive. Traders who operate emotionally do not. The business framework IS the edge.' },
  { q: 'A complete prop business plan should be how many pages?', opts: ['50+ pages with detailed analysis', '1\u20133 pages that you can review in 10 minutes \u2014 short enough to actually read monthly, specific enough to make decisions from, and printed next to your trading station', '10\u201320 pages', 'It should be kept in your head, not written down'], correct: 1, explain: 'A 50-page plan will never be read. A mental plan will be forgotten under pressure. 1\u20133 pages covers all 6 sections with specific numbers and triggers. Short = actually reviewed. Printed = actually visible. The best plan is the one you look at every week, not the one that sits in a folder.' },
];

export default function Level9Capstone() {
  const [scrollY, setScrollY] = useState(0);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [gameRound, setGameRound] = useState(0);
  const [gameAnswers, setGameAnswers] = useState<(number | null)[]>(Array(gameRounds.length).fill(null));
  const [gameScore, setGameScore] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(Array(quizQuestions.length).fill(null));
  const [showConfetti, setShowConfetti] = useState(false);
  const [certUnlocked, setCertUnlocked] = useState(false);
  /* Builder state */
  const [activeSection, setActiveSection] = useState(0);
  const [selectedFirms, setSelectedFirms] = useState<string[]>([]);
  const [firmNotes, setFirmNotes] = useState('');
  const [budgetMonthly, setBudgetMonthly] = useState('');
  const [budgetMaxFails, setBudgetMaxFails] = useState('');
  const [budgetCostBenefit, setBudgetCostBenefit] = useState('');
  const [stratRisk, setStratRisk] = useState('');
  const [stratTrades, setStratTrades] = useState('');
  const [stratInstruments, setStratInstruments] = useState<string[]>([]);
  const [stratNotes, setStratNotes] = useState('');
  const [scaleM3, setScaleM3] = useState('');
  const [scaleM6, setScaleM6] = useState('');
  const [scaleM12, setScaleM12] = useState('');
  const [incomeMonthly, setIncomeMonthly] = useState('');
  const [incomeAnnual, setIncomeAnnual] = useState('');
  const [incomeBreakeven, setIncomeBreakeven] = useState('');
  const [contMaxFails, setContMaxFails] = useState('');
  const [contDemoTrigger, setContDemoTrigger] = useState('');
  const [contEmergencyFund, setContEmergencyFund] = useState('');
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);
  const toggle = (id: string) => setOpenSections(s => ({ ...s, [id]: !s[id] }));

  const handleGameAnswer = (oi: number) => { if (gameAnswers[gameRound] !== null) return; const a = [...gameAnswers]; a[gameRound] = oi; setGameAnswers(a); if (gameRounds[gameRound].options[oi].correct) setGameScore(s => s + 1); };
  const handleQuizAnswer = (qi: number, oi: number) => { if (quizAnswers[qi] !== null) return; const a = [...quizAnswers]; a[qi] = oi; setQuizAnswers(a); };

  const quizDone = quizAnswers.every(a => a !== null);
  const quizScoreVal = quizDone ? Math.round(quizAnswers.reduce<number>((s, a, i) => s + (a === quizQuestions[i].correct ? 1 : 0), 0) / quizQuestions.length * 100) : 0;
  useEffect(() => { if (quizDone && quizScoreVal >= 66 && !certUnlocked) { setCertUnlocked(true); setShowConfetti(true); const t = setTimeout(() => setShowConfetti(false), 4000); return () => clearTimeout(t); } }, [quizDone, quizScoreVal, certUnlocked]);

  const toggleChip = (arr: string[], set: (v: string[]) => void, val: string) => set(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  const completedSections = [selectedFirms.length > 0, budgetMonthly.length > 0, stratRisk.length > 0, scaleM3.length > 0, incomeMonthly.length > 0, contMaxFails.length > 0].filter(Boolean).length;

  /* ─── DRAW FUNCTIONS ─── */
  const drawBusinessMap = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const cx = w / 2;
    const cy = h / 2;
    const nodes = [
      { x: cx - 120, y: 40, label: 'Firm Selection', color: '#3b82f6' },
      { x: cx + 120, y: 40, label: 'Challenge Budget', color: '#22c55e' },
      { x: cx - 140, y: 120, label: 'Strategy Adapt', color: '#f59e0b' },
      { x: cx + 140, y: 120, label: 'Phase 1 & 2', color: '#8b5cf6' },
      { x: cx - 120, y: 200, label: 'Funded Mgmt', color: '#22c55e' },
      { x: cx + 120, y: 200, label: 'DD Management', color: '#ef4444' },
      { x: cx - 100, y: 270, label: 'Scaling', color: '#3b82f6' },
      { x: cx + 100, y: 270, label: 'Payouts', color: '#f59e0b' },
      { x: cx, y: 155, label: 'YOUR PLAN', color: '#f59e0b' },
    ];
    const edges = [[0,2],[1,3],[2,4],[3,5],[4,6],[5,7],[0,8],[1,8],[2,8],[3,8],[4,8],[5,8],[6,8],[7,8]];
    edges.forEach(([a, b]) => {
      const progress = Math.min(1, (f - a * 8) / 30);
      if (progress <= 0) return;
      ctx.strokeStyle = '#ffffff08'; ctx.lineWidth = 1; ctx.beginPath();
      ctx.moveTo(nodes[a].x, nodes[a].y);
      const dx = (nodes[b].x - nodes[a].x) * progress;
      const dy = (nodes[b].y - nodes[a].y) * progress;
      ctx.lineTo(nodes[a].x + dx, nodes[a].y + dy); ctx.stroke();
    });
    nodes.forEach((n, i) => {
      const appear = Math.min(1, (f - i * 10) / 20);
      if (appear <= 0) return;
      ctx.globalAlpha = appear;
      const isCenter = i === 8;
      const r = isCenter ? 40 : 30;
      ctx.fillStyle = n.color + (isCenter ? '25' : '15');
      ctx.beginPath(); ctx.roundRect(n.x - r - 10, n.y - 14, (r + 10) * 2, 28, 8); ctx.fill();
      ctx.strokeStyle = n.color + (isCenter ? '50' : '30'); ctx.lineWidth = isCenter ? 2 : 1;
      ctx.beginPath(); ctx.roundRect(n.x - r - 10, n.y - 14, (r + 10) * 2, 28, 8); ctx.stroke();
      ctx.font = isCenter ? 'bold 11px system-ui' : '10px system-ui';
      ctx.fillStyle = n.color; ctx.textAlign = 'center'; ctx.fillText(n.label, n.x, n.y + 4);
      ctx.globalAlpha = 1;
    });
  }, []);

  const drawTimeline = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const cx = w / 2;
    const cy = h / 2;
    const milestones = [
      { month: 'M1', label: 'First Challenge', color: '#3b82f6' },
      { month: 'M2', label: 'Phase 2', color: '#22c55e' },
      { month: 'M3', label: 'Funded + 2nd Challenge', color: '#f59e0b' },
      { month: 'M6', label: '3 Accounts', color: '#8b5cf6' },
      { month: 'M9', label: 'Optimise', color: '#22c55e' },
      { month: 'M12', label: 'Business Review', color: '#f59e0b' },
    ];
    const lineY = cy;
    const startX = 40; const endX = w - 40;
    const lineW = endX - startX;
    const progress = Math.min(1, f / 120);
    ctx.strokeStyle = '#ffffff10'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(startX, lineY); ctx.lineTo(startX + lineW * progress, lineY); ctx.stroke();
    milestones.forEach((m, i) => {
      const x = startX + (i / (milestones.length - 1)) * lineW;
      const appear = Math.min(1, (progress * milestones.length - i) * 2);
      if (appear <= 0) return;
      ctx.globalAlpha = appear;
      ctx.fillStyle = m.color; ctx.beginPath(); ctx.arc(x, lineY, 6, 0, Math.PI * 2); ctx.fill();
      ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center'; ctx.fillStyle = m.color;
      ctx.fillText(m.month, x, lineY - 18);
      ctx.font = '9px system-ui'; ctx.fillStyle = '#9ca3af';
      ctx.fillText(m.label, x, lineY + 22);
      ctx.globalAlpha = 1;
    });
  }, []);

  const inputCls = 'w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50';
  const textareaCls = 'w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 min-h-[60px] resize-none';

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      <Confetti active={showConfetti} />
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-white/5"><motion.div className="h-full bg-gradient-to-r from-amber-500 to-accent-500" style={{ width: `${Math.min(100, (scrollY / (typeof document !== 'undefined' ? document.body.scrollHeight - window.innerHeight : 1)) * 100)}%` }} /></div>
      <nav className="fixed top-1 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur border border-white/[0.06]"><span className="text-xs font-bold tracking-widest bg-gradient-to-r from-amber-400 to-purple-400 bg-clip-text text-transparent">ATLAS ACADEMY</span><Crown className="w-3.5 h-3.5 text-amber-400" /><span className="text-[10px] font-mono text-amber-400/80 tracking-widest">PRO &middot; LEVEL 9 &middot; CAPSTONE</span></nav>

      <header className="relative min-h-[85vh] flex items-center justify-center overflow-hidden"><div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }} /><div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #d946ef 0%, transparent 70%)' }} /><div className="relative z-10 text-center px-6"><motion.div variants={fadeUp} initial="hidden" animate="visible"><p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-4">Level 9 &mdash; Capstone</p></motion.div><motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.15 }}><h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4"><span className="bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Your Prop Business Plan</span></h1></motion.div><motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.3 }}><p className="text-gray-400 max-w-md mx-auto text-sm leading-relaxed">Build the complete document that transforms &ldquo;I want to trade prop&rdquo; into a funded, structured, income-generating operation.</p></motion.div><motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.45 }} className="mt-8 flex flex-col items-center gap-2"><span className="text-[10px] uppercase tracking-widest text-gray-600">Scroll to begin</span><motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}><ChevronDown className="w-4 h-4 text-gray-600" /></motion.div></motion.div></div></header>

      <section className="max-w-2xl mx-auto px-5 py-20"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-3">00 &mdash; Why This Matters</p><h2 className="text-2xl font-extrabold mb-4">The Plan That Doesn&rsquo;t Exist Yet</h2><div className="p-6 rounded-2xl glass-card"><p className="text-sm text-gray-300 leading-relaxed mb-4">Traders with a written business plan are 23% less likely to have a losing quarter than traders who operate from memory. The plan is not a guarantee of success &mdash; it is a framework that keeps you rational when markets, emotions, and finances try to pull you off course. Every decision in the next 12 months of your prop career should reference this document. When you are unsure whether to re-attempt a challenge, check the contingency section. When you are unsure whether to scale, check the timeline. The plan answers questions before they become emergencies.</p><div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10"><p className="text-xs text-amber-400 font-semibold mb-1">&#9889; THE CAPSTONE</p><p className="text-xs text-gray-400">This lesson brings together all 13 previous lessons into one actionable document. Your Prop Business Plan is the deliverable of Level 9.</p></div></div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Complete Prop Business Map</p><h2 className="text-2xl font-extrabold mb-4">Everything Connected</h2><div className="p-4 rounded-2xl glass-card"><AnimScene drawFn={drawBusinessMap} height={310} /></div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; 12-Month Business Timeline</p><h2 className="text-2xl font-extrabold mb-4">Your Milestones</h2><div className="p-4 rounded-2xl glass-card"><AnimScene drawFn={drawTimeline} height={200} /></div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; Level 9 Summary</p><h2 className="text-2xl font-extrabold mb-4">13 Lessons, 13 Key Takeaways</h2><div className="space-y-2">{lessonSummary.map((item, i) => (<div key={i} className="p-3 rounded-xl glass-card flex items-start gap-3"><span className="text-xs font-mono font-bold shrink-0 mt-0.5" style={{ color: item.color }}>{item.num}</span><div><p className="text-sm font-bold text-gray-200">{item.title}</p><p className="text-xs text-gray-400 mt-0.5">{item.takeaway}</p></div></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Common Mistakes</p><h2 className="text-2xl font-extrabold mb-4">4 Business Plan Errors</h2><div className="space-y-3">{commonMistakes.map((item, i) => (<div key={i}><button onClick={() => toggle(`cm-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`cm-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`cm-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-xs text-red-400 mb-2">&#10060; {item.mistake}</p><p className="text-xs text-green-400">&#10004; {item.fix}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Prop Business Plan Builder</p><h2 className="text-2xl font-extrabold mb-2">&#127919; GROUNDBREAKING: Build Your Complete Plan</h2><p className="text-gray-400 text-sm mb-4">6 interactive sections. Fill in each one to create your prop business blueprint.</p>
      <div className="p-6 rounded-2xl glass-card space-y-5">
        <div className="flex items-center justify-between"><div className="h-2 flex-1 rounded-full bg-white/[0.04] overflow-hidden mr-3"><div className="h-full bg-gradient-to-r from-amber-500 to-accent-500 transition-all" style={{ width: `${(completedSections / 6) * 100}%` }} /></div><span className="text-xs font-mono text-amber-400">{completedSections}/6</span></div>
        <div className="flex flex-wrap gap-2">{planSections.map((s, i) => (<button key={s.id} onClick={() => setActiveSection(i)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeSection === i ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400' : 'bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:bg-white/[0.07]'}`}>{s.emoji} {s.title}</button>))}</div>
        <AnimatePresence mode="wait"><motion.div key={activeSection} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
          {activeSection === 0 && (<><p className="text-xs text-gray-500">Select your target firms and note why each suits your strategy.</p><div className="flex flex-wrap gap-2">{firmChips.map(f => (<button key={f} onClick={() => toggleChip(selectedFirms, setSelectedFirms, f)} className={`px-3 py-1 rounded-full text-xs transition-all ${selectedFirms.includes(f) ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400' : 'bg-white/[0.04] border border-white/[0.08] text-gray-400'}`}>{f}</button>))}</div><textarea value={firmNotes} onChange={e => setFirmNotes(e.target.value)} placeholder="Why these firms? Rule comparison notes..." className={textareaCls} /></>)}
          {activeSection === 1 && (<><p className="text-xs text-gray-500">Define your challenge investment strategy.</p><div><label className="text-[10px] text-gray-500">Monthly Challenge Budget (&pound;)</label><input value={budgetMonthly} onChange={e => setBudgetMonthly(e.target.value)} placeholder="e.g. 400" className={inputCls} /></div><div><label className="text-[10px] text-gray-500">Max Consecutive Failures Before Pause</label><input value={budgetMaxFails} onChange={e => setBudgetMaxFails(e.target.value)} placeholder="e.g. 3" className={inputCls} /></div><textarea value={budgetCostBenefit} onChange={e => setBudgetCostBenefit(e.target.value)} placeholder="Cost-benefit notes: expected attempts to pass, total investment tolerance..." className={textareaCls} /></>)}
          {activeSection === 2 && (<><p className="text-xs text-gray-500">Adapt your personal strategy for challenge conditions.</p><div className="grid grid-cols-2 gap-3"><div><label className="text-[10px] text-gray-500">Challenge Risk Per Trade (%)</label><input value={stratRisk} onChange={e => setStratRisk(e.target.value)} placeholder="e.g. 0.75" className={inputCls} /></div><div><label className="text-[10px] text-gray-500">Max Trades Per Day</label><input value={stratTrades} onChange={e => setStratTrades(e.target.value)} placeholder="e.g. 2" className={inputCls} /></div></div><p className="text-[10px] text-gray-500 mt-2">Instruments</p><div className="flex flex-wrap gap-2">{instrumentChips.map(inst => (<button key={inst} onClick={() => toggleChip(stratInstruments, setStratInstruments, inst)} className={`px-3 py-1 rounded-full text-xs transition-all ${stratInstruments.includes(inst) ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400' : 'bg-white/[0.04] border border-white/[0.08] text-gray-400'}`}>{inst}</button>))}</div><textarea value={stratNotes} onChange={e => setStratNotes(e.target.value)} placeholder="Session restrictions, news rules, phase adjustments..." className={textareaCls} /></>)}
          {activeSection === 3 && (<><p className="text-xs text-gray-500">Set targets for each growth phase.</p><div><label className="text-[10px] text-gray-500">Month 1&ndash;3 Target</label><input value={scaleM3} onChange={e => setScaleM3(e.target.value)} placeholder="e.g. 1 funded account, first payout received" className={inputCls} /></div><div><label className="text-[10px] text-gray-500">Month 4&ndash;6 Target</label><input value={scaleM6} onChange={e => setScaleM6(e.target.value)} placeholder="e.g. 2 accounts, consistent income" className={inputCls} /></div><div><label className="text-[10px] text-gray-500">Month 7&ndash;12 Target</label><input value={scaleM12} onChange={e => setScaleM12(e.target.value)} placeholder="e.g. 3 accounts, optimise weakest firm" className={inputCls} /></div></>)}
          {activeSection === 4 && (<><p className="text-xs text-gray-500">Define your income expectations (NET after all deductions).</p><div><label className="text-[10px] text-gray-500">Monthly Net Income Target (&pound;)</label><input value={incomeMonthly} onChange={e => setIncomeMonthly(e.target.value)} placeholder="e.g. 2000" className={inputCls} /></div><div><label className="text-[10px] text-gray-500">Annual Net Income Target (&pound;)</label><input value={incomeAnnual} onChange={e => setIncomeAnnual(e.target.value)} placeholder="e.g. 24000" className={inputCls} /></div><div><label className="text-[10px] text-gray-500">Breakeven: Min Accounts Needed to Cover Costs</label><input value={incomeBreakeven} onChange={e => setIncomeBreakeven(e.target.value)} placeholder="e.g. 1.5" className={inputCls} /></div></>)}
          {activeSection === 5 && (<><p className="text-xs text-gray-500">Plan for when things go wrong.</p><div><label className="text-[10px] text-gray-500">Max Failures Before Mandatory Pause</label><input value={contMaxFails} onChange={e => setContMaxFails(e.target.value)} placeholder="e.g. 3 consecutive" className={inputCls} /></div><div><label className="text-[10px] text-gray-500">Demo Return Trigger</label><input value={contDemoTrigger} onChange={e => setContDemoTrigger(e.target.value)} placeholder="e.g. 3 strikes on same challenge = 1 month demo" className={inputCls} /></div><div><label className="text-[10px] text-gray-500">Emergency Fund Size (&pound;)</label><input value={contEmergencyFund} onChange={e => setContEmergencyFund(e.target.value)} placeholder="e.g. 1200 (3x challenge fees)" className={inputCls} /></div></>)}
        </motion.div></AnimatePresence>
        <div className="flex justify-between items-center pt-2">{activeSection > 0 && (<button onClick={() => setActiveSection(s => s - 1)} className="px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-gray-400 text-xs hover:bg-white/[0.07]">&larr; Previous</button>)}<div />{activeSection < 5 ? (<button onClick={() => setActiveSection(s => s + 1)} className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-accent-500 text-white text-xs font-bold active:scale-95 transition-transform">Next &rarr;</button>) : (<button onClick={() => setShowSummary(true)} className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-accent-500 text-white text-xs font-bold active:scale-95 transition-transform">View Summary</button>)}</div>
        {showSummary && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-white/[0.02] border border-amber-500/20 space-y-3">
          <p className="text-sm font-bold text-amber-400 text-center">Your Prop Business Plan Summary</p>
          {selectedFirms.length > 0 && <div><p className="text-[10px] text-gray-500 uppercase">Firms</p><p className="text-xs text-gray-300">{selectedFirms.join(', ')}{firmNotes && ` \u2014 ${firmNotes}`}</p></div>}
          {budgetMonthly && <div><p className="text-[10px] text-gray-500 uppercase">Budget</p><p className="text-xs text-gray-300">&pound;{budgetMonthly}/month, max {budgetMaxFails} failures{budgetCostBenefit && `. ${budgetCostBenefit}`}</p></div>}
          {stratRisk && <div><p className="text-[10px] text-gray-500 uppercase">Strategy</p><p className="text-xs text-gray-300">{stratRisk}% risk, {stratTrades} trades/day, {stratInstruments.join(', ')}{stratNotes && `. ${stratNotes}`}</p></div>}
          {scaleM3 && <div><p className="text-[10px] text-gray-500 uppercase">Scaling</p><p className="text-xs text-gray-300">M1-3: {scaleM3}. M4-6: {scaleM6}. M7-12: {scaleM12}.</p></div>}
          {incomeMonthly && <div><p className="text-[10px] text-gray-500 uppercase">Income</p><p className="text-xs text-gray-300">&pound;{incomeMonthly}/month, &pound;{incomeAnnual}/year, breakeven: {incomeBreakeven} accounts</p></div>}
          {contMaxFails && <div><p className="text-[10px] text-gray-500 uppercase">Contingency</p><p className="text-xs text-gray-300">Max {contMaxFails} fails, demo trigger: {contDemoTrigger}, emergency fund: &pound;{contEmergencyFund}</p></div>}
          <p className="text-[10px] text-gray-600 text-center">Print this page or screenshot your plan. Pin it next to your trading station.</p>
        </motion.div>)}
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Cheat Sheet</p><h2 className="text-2xl font-extrabold mb-4">Business Plan Quick Reference</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#22c55e]">WRITE IT DOWN</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">1&ndash;3 pages. Short enough to read monthly. Specific enough to make decisions from. Printed and visible.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#3b82f6]">6 SECTIONS</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Firm Selection, Budget, Strategy, Scaling, Income, Contingency. All six. No shortcuts.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#f59e0b]">REVIEW CYCLE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Monthly check, quarterly revision, annual overhaul. The plan evolves with your business.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#8b5cf6]">INCLUDE FAILURE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">A plan without a contingency section is a wish. Build failure tolerance into every timeline and budget.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">THE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">The plan serves the business. The business does not serve the plan. Revise targets to match reality, never force reality to match targets.</span></p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Test Your Understanding</p><h2 className="text-2xl font-extrabold mb-2">Capstone Integration Game</h2><p className="text-gray-400 text-sm mb-6">5 rounds covering the entire Level 9 curriculum. Plan, budget, scale, forecast, and recover.</p>
      <div className="p-6 rounded-2xl glass-card"><div className="flex items-center justify-between mb-4"><span className="text-xs font-bold text-amber-400">Round {gameRound + 1} of {gameRounds.length}</span><span className="text-xs font-mono text-gray-500">{gameScore}/{gameRounds.length} correct</span></div><p className="text-sm text-gray-300 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: gameRounds[gameRound].scenario }} /><div className="space-y-2">{gameRounds[gameRound].options.map((opt, oi) => { const answered = gameAnswers[gameRound] !== null; const selected = gameAnswers[gameRound] === oi; const isCorrect = opt.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return (<div key={oi}><button onClick={() => handleGameAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt.text }} /></button>{answered && selected && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]"><p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`} dangerouslySetInnerHTML={{ __html: opt.explain }} /></motion.div>)}</div>); })}</div>{gameAnswers[gameRound] !== null && gameRound < gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5"><button onClick={() => setGameRound(r => r + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button></motion.div>)}{gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Outstanding \u2014 you have mastered the complete prop trading business framework. Level 9 complete.' : gameScore >= 3 ? 'Good \u2014 review your weaker areas before building your final plan.' : 'Review the full Level 9 summary. Each lesson builds on the previous one \u2014 the capstone requires integrated understanding.'}</p></motion.div>)}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Knowledge Check</p><h2 className="text-2xl font-extrabold mb-6">Final Quiz &mdash; 8 Questions</h2>
      <div className="space-y-6">{quizQuestions.map((q, qi) => (<div key={qi} className="p-5 rounded-2xl glass-card"><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p><p className="text-sm font-semibold text-white mb-4" dangerouslySetInnerHTML={{ __html: q.q }} /><div className="space-y-2">{q.opts.map((opt, oi) => { const answered = quizAnswers[qi] !== null; const selected = quizAnswers[qi] === oi; const isCorrect = oi === q.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return <button key={oi} onClick={() => handleQuizAnswer(qi, oi)} disabled={answered} className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`}>{opt}</button>; })}</div>{quizAnswers[qi] !== null && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg bg-white/[0.02]"><p className="text-xs text-amber-400" dangerouslySetInnerHTML={{ __html: `<span class="font-bold">&#9989;</span> ${q.explain}` }} /></motion.div>)}</div>))}</div>
      {quizDone && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center"><p className="text-3xl font-extrabold mb-2">{quizScoreVal}%</p><p className="text-sm text-gray-400">{quizScoreVal >= 66 ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate. Review and try again.'}</p></motion.div>)}
      {certUnlocked && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10"><div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}><div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(139,92,246,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} /><div className="relative z-10 text-center"><div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">&#127942;</div><p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p><p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 9: Your Prop Business Plan &mdash; Capstone</strong><br />at ATLAS Academy by Interakktive</p><p className="bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Prop Master &mdash;</p><p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L9.14-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p></div></div></motion.div>)}</motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-20 text-center"><Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">&larr; Back to Academy</Link></section>
    </div>
  );
}
