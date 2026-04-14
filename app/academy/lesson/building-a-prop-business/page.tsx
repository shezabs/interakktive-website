// app/academy/lesson/building-a-prop-business/page.tsx
// ATLAS Academy — Lesson 9.13: Building a Prop Business [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 9
// GROUNDBREAKING: Prop Income Forecaster — 12-month 3-scenario projection
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
const plItems = [
  { label: 'Revenue (Payouts)', type: 'income', color: '#22c55e', desc: 'Total payouts received from all funded accounts after the firm\u2019s split. This is your top-line income \u2014 the money that hits your bank account before any deductions.' },
  { label: 'COGS (Challenge Fees)', type: 'expense', color: '#ef4444', desc: 'Cost of Goods Sold: all challenge fees paid, including failed attempts. A funded account that cost 3 attempts at \u00A3400 each has a COGS of \u00A31,200. Track both successful and failed fees.' },
  { label: 'Operating Expenses', type: 'expense', color: '#f59e0b', desc: 'Recurring costs: TradingView subscription (\u00A312\u201360/month), VPS (\u00A310\u201330/month), data feeds, courses, books, accountant fees. Fixed costs that exist regardless of trading performance.' },
  { label: 'Gross Profit', type: 'subtotal', color: '#3b82f6', desc: 'Revenue minus COGS minus Operating Expenses. This is your actual business profit before tax. If this number is negative for 3+ consecutive months, the business model needs restructuring.' },
  { label: 'Tax Reserve (30%)', type: 'expense', color: '#8b5cf6', desc: '30% of Gross Profit set aside for Income Tax + National Insurance. Goes to a separate savings account. Not touched until Self Assessment.' },
  { label: 'Net Income', type: 'result', color: '#22c55e', desc: 'Your actual take-home. Gross Profit minus Tax Reserve. This is the number your lifestyle should be built around \u2014 not the gross payout, not the revenue.' },
];

const infrastructure = [
  { item: 'Dedicated Trading PC', priority: 'HIGH', desc: 'Separate from personal/gaming PC. Clean environment, no distractions. Does not need to be expensive \u2014 trading is not GPU-intensive. A \u00A3500\u2013800 PC with dual monitors is sufficient.', cost: '\u00A3500\u2013800 one-time', color: '#22c55e' },
  { item: 'Business Bank Account', priority: 'HIGH', desc: 'Separate from personal finances. All payouts go here, all challenge fees come from here, all expenses paid from here. Makes accounting, tax filing, and financial tracking dramatically easier. Free business accounts available from Starling, Tide, Monzo Business.', cost: 'Free', color: '#22c55e' },
  { item: 'Accounting Software', priority: 'MEDIUM', desc: 'FreeAgent, Xero, or QuickBooks. Automates invoice tracking, expense categorisation, and tax calculations. Connects to your business bank account for automatic transaction import. Annual cost pays for itself in time saved and tax accuracy.', cost: '\u00A310\u201330/month', color: '#3b82f6' },
  { item: 'Emergency Fund', priority: 'CRITICAL', desc: '3 months of challenge fees in reserve. If all funded accounts are lost simultaneously, you can re-purchase 3 challenges without touching personal savings or going into debt. This is the safety net that prevents a bad month from ending the business.', cost: '3\u00D7 challenge fees', color: '#f59e0b' },
  { item: 'TradingView Pro+', priority: 'MEDIUM', desc: 'Multiple chart layouts, more indicators, faster data. The \u00A312\u201325/month subscription pays for itself if it saves even one bad entry from a missed confluence. Annual billing saves ~20%.', cost: '\u00A312\u201325/month', color: '#3b82f6' },
  { item: 'VPS (Optional)', priority: 'LOW', desc: 'Virtual Private Server for running trade copiers across multiple accounts or EAs. Only needed if you automate. Not required for manual discretionary trading.', cost: '\u00A310\u201330/month', color: '#9ca3af' },
];

const sporadicVsBusiness = [
  { month: 'Jan', sporadic: 2400, business: 1800 },
  { month: 'Feb', sporadic: 0, business: 1900 },
  { month: 'Mar', sporadic: 3600, business: 2100 },
  { month: 'Apr', sporadic: -400, business: 1700 },
  { month: 'May', sporadic: 0, business: 2000 },
  { month: 'Jun', sporadic: 4200, business: 2200 },
  { month: 'Jul', sporadic: 0, business: 1800 },
  { month: 'Aug', sporadic: -800, business: 2100 },
  { month: 'Sep', sporadic: 5000, business: 2300 },
  { month: 'Oct', sporadic: 0, business: 1900 },
  { month: 'Nov', sporadic: -400, business: 2000 },
  { month: 'Dec', sporadic: 3200, business: 2200 },
];

const commonMistakes = [
  { title: 'Not Treating Prop Trading as a Business', mistake: '"I am just trading." No \u2014 you are operating a business. You have revenue (payouts), costs (challenge fees, subscriptions), and a profit margin. Without tracking these, you do not know if you are actually making money. A trader who earns \u00A32,000/month in payouts but spends \u00A3800/month on failed challenges and \u00A3200/month on tools nets \u00A31,000 \u2014 half of what they think.', fix: 'Monthly P&L statement. Every month: Revenue \u2212 COGS \u2212 Expenses \u2212 Tax = Net Income. If you do not know your net income within \u00A350, you are not running a business.' },
  { title: 'Mixing Personal and Business Finances', mistake: '"I just use my personal bank account for everything." When tax time comes, you need to separate trading income from personal spending, challenge fees from personal purchases, and business expenses from personal ones. Doing this retrospectively across 12 months of mixed transactions is a nightmare.', fix: 'Business bank account from Day 1. All payouts in, all fees out, all expenses tracked. When your accountant asks for your P&L, you export the bank statement and it is 90% done.' },
  { title: 'No Emergency Fund', mistake: '"I will just buy another challenge if I lose the account." What if you lose 2 accounts in the same month? At \u00A3400 each, that is \u00A3800 in unexpected costs. Without an emergency fund, this either comes from personal savings (destabilising your life) or credit (expensive and stressful).', fix: '3\u00D7 challenge fee emergency fund. For 3 accounts at \u00A3400 each = \u00A31,200 minimum. This fund exists purely to re-purchase challenges. It is a business insurance policy that costs nothing to hold.' },
  { title: 'Ignoring Tax Until Self Assessment', mistake: '"I will figure out tax when the bill comes." By then, the money is spent. You receive a \u00A35,000 tax bill and do not have the cash. HMRC charges interest on late payments and penalties for underpayment.', fix: '30% of every payout goes to a separate tax reserve account on the day you receive it. No exceptions. When Self Assessment arrives, the money is already waiting. If you overpaid, the surplus is a bonus.' },
];

const gameRounds = [
  { scenario: '<strong>Monthly P&amp;L calculation:</strong> In March, you received \u00A33,200 in payouts from 2 funded accounts. You paid \u00A3400 for a failed challenge attempt. Your monthly expenses were: TradingView \u00A325, VPS \u00A315, internet (50% business) \u00A320. What is your net income after 30% tax reserve?', options: [
    { text: '\u00A33,200 \u2014 that is what you received in payouts.', correct: false, explain: 'The payout is revenue, not net income. You have not deducted COGS (the \u00A3400 failed challenge), operating expenses (\u00A360), or tax reserve. Confusing revenue with income is the most common financial mistake in prop trading.' },
    { text: '\u00A31,918 \u2014 Revenue \u00A33,200 minus COGS \u00A3400 minus Expenses \u00A360 = \u00A32,740 Gross Profit. Tax reserve (30%) = \u00A3822. Net Income = \u00A31,918.', correct: true, explain: 'Correct P&L: \u00A33,200 \u2212 \u00A3400 \u2212 \u00A360 = \u00A32,740 gross. \u00A32,740 \u00D7 0.70 = \u00A31,918 net. This is \u00A31,282 less than the \u00A33,200 payout number. If your lifestyle requires \u00A32,000/month, you are \u00A382 short this month despite \u00A33,200 in payouts.' },
    { text: '\u00A32,740 \u2014 Revenue minus costs, before tax.', correct: false, explain: 'This is gross profit, not net income. The 30% tax reserve must be deducted to find your actual take-home. Spending the gross as if it were net means a surprise tax bill in January.' },
  ]},
  { scenario: '<strong>Emergency fund scenario:</strong> You run 3 funded accounts. Account A was terminated this morning (slow bleed over 3 weeks). Account B has a -3.8% overall DD (limit is 5%). Account C is healthy. Challenge fees are \u00A3400 each. Your emergency fund has \u00A31,200. What do you do?', options: [
    { text: 'Use \u00A3400 from the emergency fund to immediately replace Account A. Keep trading Account B and C normally.', correct: false, explain: 'Replacing Account A is correct, but Account B is at 76% DD usage (3.8% of 5%). This account is in the danger zone. You should also reduce risk on Account B or take a day off. The emergency fund should be reserved for account REPLACEMENT, not drawn down while another account is at risk.' },
    { text: 'Use \u00A3400 to replace Account A. Reduce risk on Account B to 0.25% until DD recovers. Keep Account C normal. Your emergency fund drops to \u00A3800 \u2014 note this needs replenishing from next month\u2019s payouts.', correct: true, explain: 'Systematic response. Account A: replaced via emergency fund (\u00A31,200 \u2192 \u00A3800). Account B: risk reduced because 76% DD usage is critical. Account C: unaffected. The emergency fund replenishment plan ensures you rebuild the safety net. This is how a business handles setbacks \u2014 not emotionally, but procedurally.' },
    { text: 'Do not replace Account A yet. Wait until Account B either recovers or is also lost, then decide. Save the emergency fund for a worse scenario.', correct: false, explain: 'Waiting costs income. Every month without Account A = \u00A31,200\u20131,600 in lost payouts. The emergency fund exists specifically for this scenario. Hoarding it "for worse" means never using the safety net when it is needed. The purpose of the fund is to maintain income continuity.' },
  ]},
  { scenario: '<strong>Business vs hobby decision:</strong> After 6 months, your numbers are: Total payouts \u00A312,800. Total challenge fees (including 4 failures) \u00A32,800. Monthly expenses \u00A3480 total. Current funded accounts: 2. Monthly average net income after tax: ~\u00A3950. A friend suggests you "stop wasting money on prop firms and just trade your own \u00A35,000 account." What do you assess?', options: [
    { text: 'Your friend is right \u2014 \u00A32,800 in challenge fees is too much wasted money.', correct: false, explain: 'The \u00A32,800 in challenge fees generated \u00A312,800 in payouts. That is a 4.6\u00D7 return on investment. Your \u00A35,000 personal account at the same performance would generate ~\u00A3200/month. The prop business generates \u00A3950/month net. Your friend is comparing costs without considering returns.' },
    { text: 'The prop business is working. \u00A32,800 invested generated \u00A312,800 revenue (4.6\u00D7 ROI). \u00A3950/month net vs \u00A3200/month from a \u00A35,000 personal account. The challenge fees are a business investment with a strong return. Continue and scale.', correct: true, explain: 'Business analysis: \u00A32,800 total investment \u2192 \u00A312,800 revenue \u2192 ~\u00A35,700 net income over 6 months. That is a 103% return on the challenge fee investment in 6 months. Your \u00A35,000 personal account would need to return 114% in 6 months to match \u2014 which is unrealistic at 2\u20133% monthly. The numbers clearly favour the prop business.' },
    { text: 'You should do both \u2014 keep the prop accounts and trade the personal account simultaneously.', correct: false, explain: 'Adding a personal account splits your attention and adds emotional complexity. If the personal account has a bad day, it can affect your funded account trading (emotional bleed). The prop accounts already provide 4.7\u00D7 the income of the personal account. Focus generates better results than diversifying attention across different account types.' },
  ]},
  { scenario: '<strong>Tax planning:</strong> It is November. Your year-to-date prop income: \u00A318,500 gross profit after expenses. You have been setting aside 30% (\u00A35,550) in your tax reserve. Your accountant estimates your actual tax liability will be approximately \u00A34,200 (Income Tax + NI). What do you do with the \u00A31,350 surplus?', options: [
    { text: 'Spend it \u2014 it was over-saved tax money, it is yours.', correct: false, explain: 'The accountant\u2019s estimate is approximate. Your actual liability could be higher if December income pushes you into a higher bracket, or if some expenses are disallowed. Keep the surplus as a buffer until the actual Self Assessment is filed and paid.' },
    { text: 'Keep the full \u00A35,550 in the tax reserve until Self Assessment is filed and paid. The \u00A31,350 surplus acts as a safety buffer for: December income not yet accounted for, potential accountant adjustments, and payment on account for next year. Only release the surplus AFTER the tax bill is confirmed and paid.', correct: true, explain: 'Conservative and correct. HMRC may also require payments on account for next year (50% of current year\u2019s liability paid in advance). The surplus covers this. Releasing tax money before the bill is confirmed and paid introduces unnecessary risk. The surplus either covers unexpected liabilities or becomes a genuine bonus once confirmed.' },
    { text: 'Move \u00A31,000 to your emergency fund and keep \u00A3350 as tax buffer.', correct: false, explain: 'Moving tax reserve money to the emergency fund creates a dangerous crossover. If the tax bill is higher than estimated, you now need to pull from the emergency fund to pay tax, which defeats the purpose of both funds. Keep tax money in the tax account and emergency money in the emergency account.' },
  ]},
  { scenario: '<strong>Infrastructure decision:</strong> You are about to start your prop trading business. You have \u00A32,000 to set up. A friend recommends: 4K ultra-wide monitor (\u00A3800), Herman Miller chair (\u00A31,200), and premium TradingView subscription (\u00A350/month). Your challenge fee is \u00A3400. How do you allocate the \u00A32,000?', options: [
    { text: 'Buy the monitor and chair \u2014 comfort and screen quality improve trading performance.', correct: false, explain: '\u00A32,000 on setup with \u00A30 left for the actual challenge fee. You have a beautiful trading station but no funded account. The monitor and chair do not generate income. The challenge fee does.' },
    { text: 'Challenge fee (\u00A3400) + emergency fund (\u00A3800 = 2 more attempts) + basic dual monitor (\u00A3250) + basic TradingView (\u00A312/month) + business bank account (free) + remainder to emergency fund. Total setup: \u00A3662. Emergency fund: \u00A31,338. Business operational from Day 1.', correct: true, explain: 'Business-first allocation. The challenge fee is non-negotiable (no income without it). The emergency fund covers 2 additional attempts if the first fails. Basic equipment is sufficient \u2014 trading skill comes from the trader, not the monitor. The \u00A3800 Herman Miller and \u00A3800 ultra-wide are nice-to-have upgrades funded by future PROFITS, not startup capital.' },
    { text: 'Buy everything premium now \u2014 you need the right environment to succeed.', correct: false, explain: 'This is lifestyle spending disguised as business investment. A \u00A31,200 chair does not improve win rate. A \u00A3400 challenge fee generates \u00A31,500+/month if passed. Allocate startup capital to INCOME-GENERATING assets first, comfort assets second.' },
  ]},
];

const quizQuestions = [
  { q: 'What is the correct order of a prop trading P&amp;L statement?', opts: ['Payouts minus tax equals net income', 'Revenue (payouts) minus COGS (challenge fees) minus Operating Expenses equals Gross Profit, minus Tax Reserve equals Net Income', 'Challenge fees minus payouts equals profit', 'Net income equals payouts times split percentage'], correct: 1, explain: 'Revenue \u2212 COGS \u2212 OpEx = Gross Profit \u2212 Tax = Net Income. Each line item must be tracked separately. Your lifestyle should be built around Net Income, not Revenue.' },
  { q: 'Why should failed challenge fees be tracked as COGS?', opts: ['They should not be tracked at all', 'Failed fees are a normal cost of the business (like unsold inventory), are tax-deductible, and help you calculate the true cost of acquiring a funded account', 'Only for accounting purposes', 'To make the business look less profitable'], correct: 1, explain: 'Failed challenges are a legitimate business cost. If it takes 3 attempts (\u00A31,200) to get 1 funded account earning \u00A31,500/month, the true cost of acquisition is \u00A31,200, not \u00A3400. Tracking this reveals the real economics and ensures you deduct all allowable expenses.' },
  { q: 'What is the recommended emergency fund size for a prop trading business?', opts: ['1 month of personal expenses', '3 times your challenge fees \u2014 enough to replace all funded accounts if lost simultaneously, without touching personal savings or going into debt', '10% of annual income', 'No emergency fund needed \u2014 prop trading is low-risk'], correct: 1, explain: '3\u00D7 challenge fees covers the worst-case scenario: all accounts lost simultaneously. This ensures business continuity. The fund is replenished from payouts when used. Without it, a bad month can end the business entirely.' },
  { q: 'What is the difference between a "sporadic trader" and a "business trader"?', opts: ['Sporadic traders earn more money', 'A sporadic trader has volatile, unpredictable income with months of zero earnings, while a business trader has steady, growing, predictable income through multiple accounts, risk management, and systematic operations', 'Business traders use more indicators', 'There is no meaningful difference'], correct: 1, explain: 'The sporadic trader might earn the same TOTAL over 12 months, but with wild swings: \u00A34,000 one month, \u00A30 the next three. The business trader earns \u00A31,800\u20132,200 consistently every month. Same total income, completely different financial stability and quality of life.' },
  { q: 'Why is a separate business bank account important for prop trading?', opts: ['It is legally required', 'It separates business and personal finances, simplifies tax filing, automates expense tracking, and prevents accidentally spending tax reserve money on personal purchases', 'It earns more interest', 'It is not important \u2014 personal accounts work fine'], correct: 1, explain: 'Separation is the foundation of business accounting. All payouts in, all fees and expenses out, tax reserve transferred to savings \u2014 everything visible in one place. When the accountant asks for your records, you export the business bank statement. 90% of the work is done.' },
  { q: 'What should startup capital prioritise for a prop trading business?', opts: ['Premium equipment and software', 'Income-generating assets first (challenge fees, emergency fund), then basic equipment, with premium upgrades funded by future profits', 'Marketing and branding', 'The most expensive trading platform'], correct: 1, explain: 'Business-first allocation: challenge fee (generates income), emergency fund (ensures continuity), basic equipment (functional, not premium). A \u00A3250 dual monitor setup works identically to a \u00A3800 ultra-wide for trading purposes. Premium gear is funded by PROFITS, not startup capital.' },
  { q: 'If your monthly prop income averages \u00A32,200 gross profit and your monthly expenses total \u00A3560, what is your approximate annual net income after 30% tax reserve?', opts: ['\u00A326,400', '\u00A313,776 \u2014 Monthly: (\u00A32,200 \u2212 \u00A3560) \u00D7 0.70 = \u00A31,148 net. Annual: \u00A31,148 \u00D7 12 = \u00A313,776', '\u00A319,680', '\u00A326,400 minus tax'], correct: 1, explain: 'Gross profit minus expenses: \u00A32,200 \u2212 \u00A3560 = \u00A31,640 pre-tax monthly. After 30% reserve: \u00A31,640 \u00D7 0.70 = \u00A31,148 net monthly. Annual: \u00A31,148 \u00D7 12 = \u00A313,776. Note: the \u00A32,200 gross profit already has challenge fees deducted (COGS), so the \u00A3560 is operating expenses only.' },
  { q: 'What triggers a business model review for a prop trading operation?', opts: ['Any single losing month', 'Three or more consecutive months of negative gross profit (revenue minus COGS minus expenses) indicates the business model needs restructuring: either the challenge pass rate is too low, the funded accounts are underperforming, or costs are too high', 'Whenever a challenge fails', 'Only at year-end'], correct: 1, explain: 'One bad month is normal variance. Two months could be bad luck. Three consecutive months of negative gross profit is a systemic issue: either you are failing too many challenges (COGS too high), your funded accounts are not generating enough (revenue too low), or your expenses are too high relative to income. This requires a fundamental review, not just "trying harder."' },
];

export default function BuildingAPropBusiness() {
  const [scrollY, setScrollY] = useState(0);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [gameRound, setGameRound] = useState(0);
  const [gameAnswers, setGameAnswers] = useState<(number | null)[]>(Array(gameRounds.length).fill(null));
  const [gameScore, setGameScore] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(Array(quizQuestions.length).fill(null));
  const [showConfetti, setShowConfetti] = useState(false);
  const [certUnlocked, setCertUnlocked] = useState(false);
  /* Forecaster state */
  const [fcAccounts, setFcAccounts] = useState(3);
  const [fcBalance, setFcBalance] = useState(100000);
  const [fcReturn, setFcReturn] = useState(2.5);
  const [fcSplit, setFcSplit] = useState(80);
  const [fcFailRate, setFcFailRate] = useState(12);
  const [fcChallengeCost, setFcChallengeCost] = useState(400);
  const [fcExpenses, setFcExpenses] = useState(80);
  const [fcTax, setFcTax] = useState(30);

  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);
  const toggle = (id: string) => setOpenSections(s => ({ ...s, [id]: !s[id] }));

  const handleGameAnswer = (oi: number) => { if (gameAnswers[gameRound] !== null) return; const a = [...gameAnswers]; a[gameRound] = oi; setGameAnswers(a); if (gameRounds[gameRound].options[oi].correct) setGameScore(s => s + 1); };
  const handleQuizAnswer = (qi: number, oi: number) => { if (quizAnswers[qi] !== null) return; const a = [...quizAnswers]; a[qi] = oi; setQuizAnswers(a); };

  const quizDone = quizAnswers.every(a => a !== null);
  const quizScoreVal = quizDone ? Math.round(quizAnswers.reduce<number>((s, a, i) => s + (a === quizQuestions[i].correct ? 1 : 0), 0) / quizQuestions.length * 100) : 0;
  useEffect(() => { if (quizDone && quizScoreVal >= 66 && !certUnlocked) { setCertUnlocked(true); setShowConfetti(true); const t = setTimeout(() => setShowConfetti(false), 4000); return () => clearTimeout(t); } }, [quizDone, quizScoreVal, certUnlocked]);

  /* Forecaster calcs */
  const grossPerAcct = fcBalance * (fcReturn / 100) * (fcSplit / 100);
  const monthlyGross = grossPerAcct * fcAccounts;
  const monthlyReplacement = fcAccounts * (fcFailRate / 100) * fcChallengeCost;
  const monthlyPreTax = monthlyGross - monthlyReplacement - fcExpenses;
  const monthlyNet = monthlyPreTax * (1 - fcTax / 100);
  const annualNet = monthlyNet * 12;
  const pessimistic = monthlyNet * 0.5;
  const optimistic = monthlyNet * 1.5;
  const breakeven = grossPerAcct > 0 ? Math.ceil((monthlyReplacement + fcExpenses) / grossPerAcct * 10) / 10 : 0;

  /* ─── DRAW FUNCTIONS ─── */
  const drawPL = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const cx = w / 2;
    const cy = h / 2;
    const items = [
      { label: 'Revenue', amt: 4800, color: '#22c55e', dir: 1 },
      { label: '\u2212 COGS (Fees)', amt: 400, color: '#ef4444', dir: -1 },
      { label: '\u2212 Expenses', amt: 80, color: '#f59e0b', dir: -1 },
      { label: '= Gross Profit', amt: 4320, color: '#3b82f6', dir: 1 },
      { label: '\u2212 Tax (30%)', amt: 1296, color: '#8b5cf6', dir: -1 },
      { label: '= NET INCOME', amt: 3024, color: '#22c55e', dir: 1 },
    ];
    const rowH = 36;
    const startY = 20;
    items.forEach((item, i) => {
      const progress = Math.min(1, (f - i * 18) / 30);
      if (progress <= 0) return;
      const y = startY + i * rowH;
      ctx.globalAlpha = progress;
      const isResult = i === items.length - 1;
      ctx.font = isResult ? 'bold 13px system-ui' : '12px system-ui';
      ctx.fillStyle = '#9ca3af'; ctx.textAlign = 'left';
      ctx.fillText(item.label, 20, y + 20);
      ctx.fillStyle = item.color; ctx.textAlign = 'right';
      ctx.font = isResult ? 'bold 14px system-ui' : 'bold 12px system-ui';
      ctx.fillText((item.dir > 0 ? '+' : '\u2212') + '\u00A3' + Math.round(item.amt * progress).toLocaleString(), w - 20, y + 20);
      if (!isResult) { ctx.strokeStyle = '#ffffff06'; ctx.beginPath(); ctx.moveTo(20, y + 30); ctx.lineTo(w - 20, y + 30); ctx.stroke(); }
      ctx.globalAlpha = 1;
    });
  }, []);

  const drawStability = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const cx = w / 2;
    const cy = h / 2;
    const chartL = 40; const chartR = w - 20; const chartT = 30; const chartB = h - 30;
    const chartW = chartR - chartL; const chartH = chartB - chartT;
    const maxVal = 6000;
    const progress = Math.min(1, f / 120);
    const pts = Math.floor(sporadicVsBusiness.length * progress);
    // Sporadic (red)
    ctx.beginPath(); ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2;
    for (let i = 0; i < pts; i++) {
      const x = chartL + (i / (sporadicVsBusiness.length - 1)) * chartW;
      const y = chartB - ((sporadicVsBusiness[i].sporadic + 1000) / maxVal) * chartH;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    // Business (green)
    ctx.beginPath(); ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 2;
    for (let i = 0; i < pts; i++) {
      const x = chartL + (i / (sporadicVsBusiness.length - 1)) * chartW;
      const y = chartB - ((sporadicVsBusiness[i].business + 1000) / maxVal) * chartH;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    // Zero line
    const zeroY = chartB - (1000 / maxVal) * chartH;
    ctx.strokeStyle = '#ffffff10'; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(chartL, zeroY); ctx.lineTo(chartR, zeroY); ctx.stroke();
    ctx.setLineDash([]);
    // Labels
    ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'left';
    ctx.fillStyle = '#ef4444'; ctx.fillText('Sporadic Trader', chartL, chartT - 8);
    ctx.fillStyle = '#22c55e'; ctx.fillText('Business Trader', chartL + 120, chartT - 8);
    ctx.font = '9px system-ui'; ctx.fillStyle = '#6b7280'; ctx.textAlign = 'center';
    ctx.fillText('Same total annual income. Completely different life.', cx, h - 6);
  }, []);

  const inputCls = 'w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50';
  const fmt = (n: number) => '\u00A3' + Math.round(n).toLocaleString();

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      <Confetti active={showConfetti} />
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-white/5"><motion.div className="h-full bg-gradient-to-r from-amber-500 to-accent-500" style={{ width: `${Math.min(100, (scrollY / (typeof document !== 'undefined' ? document.body.scrollHeight - window.innerHeight : 1)) * 100)}%` }} /></div>
      <nav className="fixed top-1 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur border border-white/[0.06]"><span className="text-xs font-bold tracking-widest bg-gradient-to-r from-amber-400 to-purple-400 bg-clip-text text-transparent">ATLAS ACADEMY</span><Crown className="w-3.5 h-3.5 text-amber-400" /><span className="text-[10px] font-mono text-amber-400/80 tracking-widest">PRO &middot; LEVEL 9</span></nav>

      <header className="relative min-h-[85vh] flex items-center justify-center overflow-hidden"><div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }} /><div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #d946ef 0%, transparent 70%)' }} /><div className="relative z-10 text-center px-6"><motion.div variants={fadeUp} initial="hidden" animate="visible"><p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-4">Level 9 &mdash; Lesson 13</p></motion.div><motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.15 }}><h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4"><span className="bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Building a Prop Business</span></h1></motion.div><motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.3 }}><p className="text-gray-400 max-w-md mx-auto text-sm leading-relaxed">From trader to business owner &mdash; P&amp;L tracking, tax planning, infrastructure, and income forecasting.</p></motion.div><motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.45 }} className="mt-8 flex flex-col items-center gap-2"><span className="text-[10px] uppercase tracking-widest text-gray-600">Scroll to begin</span><motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}><ChevronDown className="w-4 h-4 text-gray-600" /></motion.div></motion.div></div></header>

      <section className="max-w-2xl mx-auto px-5 py-20"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-3">00 &mdash; Why This Matters</p><h2 className="text-2xl font-extrabold mb-4">The Difference Between a Trader and a Trading Business</h2><div className="p-6 rounded-2xl glass-card"><p className="text-sm text-gray-300 leading-relaxed mb-4">Two traders, both earning &pound;2,000/month in payouts. Trader A: does not track expenses, buys challenges impulsively, has no emergency fund, gets a &pound;4,800 tax bill in January with no money set aside. Net income: unknown, probably negative some months. Trader B: monthly P&amp;L, business bank account, emergency fund, 30% tax reserve. Knows net income is &pound;1,340/month. Scales to 3 accounts by Month 6. After 12 months: Trader A earned &pound;24,000 gross but actually netted ~&pound;12,000 after costs and tax surprise. Trader B earned &pound;22,000 gross but netted ~&pound;16,000 with zero financial stress.</p><div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10"><p className="text-xs text-amber-400 font-semibold mb-1">&#9889; REAL SCENARIO</p><p className="text-xs text-gray-400">Trader B earned less gross but more net. The difference is not trading skill. It is business operations. This lesson turns you from Trader A into Trader B.</p></div></div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Prop P&amp;L Statement</p><h2 className="text-2xl font-extrabold mb-4">Your Monthly Financial Picture</h2><div className="p-4 rounded-2xl glass-card"><AnimScene drawFn={drawPL} height={260} /></div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; Income Stability</p><h2 className="text-2xl font-extrabold mb-4">Sporadic vs Business</h2><div className="p-4 rounded-2xl glass-card"><AnimScene drawFn={drawStability} /></div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; Understanding the P&amp;L</p><h2 className="text-2xl font-extrabold mb-4">Every Line Item Explained</h2><div className="space-y-3">{plItems.map((item, i) => (<div key={i}><button onClick={() => toggle(`pl-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><div className="flex items-center gap-3"><span className="w-2 h-2 rounded-full" style={{ background: item.color }} /><span className="text-sm font-bold text-gray-200">{item.label}</span><span className="text-[10px] px-2 py-0.5 rounded-full font-mono" style={{ background: item.color + '20', color: item.color }}>{item.type.toUpperCase()}</span></div><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`pl-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`pl-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Professional Infrastructure</p><h2 className="text-2xl font-extrabold mb-4">What You Need to Operate</h2><div className="space-y-3">{infrastructure.map((item, i) => (<div key={i} className="p-4 rounded-xl glass-card"><div className="flex items-center justify-between mb-2"><span className="text-sm font-bold text-gray-200">{item.item}</span><div className="flex items-center gap-2"><span className="text-[10px] px-2 py-0.5 rounded-full font-mono" style={{ background: item.color + '20', color: item.color }}>{item.priority}</span><span className="text-[10px] text-gray-500">{item.cost}</span></div></div><p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Prop Income Forecaster</p><h2 className="text-2xl font-extrabold mb-2">&#127919; GROUNDBREAKING: 12-Month Business Projection</h2><p className="text-gray-400 text-sm mb-6">Input your business parameters and see projected monthly and annual income across 3 scenarios.</p>
      <div className="p-6 rounded-2xl glass-card space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-[10px] text-gray-500 uppercase tracking-wider">Funded Accounts</label><input type="number" value={fcAccounts} onChange={e => setFcAccounts(Number(e.target.value) || 0)} className={inputCls} /></div>
          <div><label className="text-[10px] text-gray-500 uppercase tracking-wider">Balance Each (&pound;)</label><input type="number" value={fcBalance} onChange={e => setFcBalance(Number(e.target.value) || 0)} className={inputCls} /></div>
          <div><label className="text-[10px] text-gray-500 uppercase tracking-wider">Monthly Return (%)</label><input type="number" step="0.1" value={fcReturn} onChange={e => setFcReturn(Number(e.target.value) || 0)} className={inputCls} /></div>
          <div><label className="text-[10px] text-gray-500 uppercase tracking-wider">Payout Split (%)</label><input type="number" value={fcSplit} onChange={e => setFcSplit(Number(e.target.value) || 0)} className={inputCls} /></div>
          <div><label className="text-[10px] text-gray-500 uppercase tracking-wider">Challenge Cost (&pound;)</label><input type="number" value={fcChallengeCost} onChange={e => setFcChallengeCost(Number(e.target.value) || 0)} className={inputCls} /></div>
          <div><label className="text-[10px] text-gray-500 uppercase tracking-wider">Monthly Failure Rate (%)</label><input type="number" value={fcFailRate} onChange={e => setFcFailRate(Number(e.target.value) || 0)} className={inputCls} /></div>
          <div><label className="text-[10px] text-gray-500 uppercase tracking-wider">Monthly Expenses (&pound;)</label><input type="number" value={fcExpenses} onChange={e => setFcExpenses(Number(e.target.value) || 0)} className={inputCls} /></div>
          <div><label className="text-[10px] text-gray-500 uppercase tracking-wider">Tax Rate (%)</label><input type="number" value={fcTax} onChange={e => setFcTax(Number(e.target.value) || 0)} className={inputCls} /></div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[{ label: 'Pessimistic (50%)', val: pessimistic, color: '#ef4444' }, { label: 'Realistic', val: monthlyNet, color: '#22c55e' }, { label: 'Optimistic (150%)', val: optimistic, color: '#3b82f6' }].map((s, i) => (<div key={i} className="p-3 rounded-xl text-center" style={{ background: s.color + '08', border: `1px solid ${s.color}20` }}><p className="text-[10px] text-gray-500">{s.label}</p><p className="text-lg font-extrabold font-mono" style={{ color: s.color }}>{fmt(s.val)}</p><p className="text-[9px] text-gray-600">/month</p></div>))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center"><p className="text-[10px] text-gray-500">Annual Net (Realistic)</p><p className="text-lg font-extrabold text-amber-400 font-mono">{fmt(annualNet)}</p></div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center"><p className="text-[10px] text-gray-500">Breakeven Accounts</p><p className="text-lg font-extrabold text-amber-400 font-mono">{breakeven}</p></div>
        </div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-[10px] text-gray-500 mb-1">Monthly Breakdown</p><div className="grid grid-cols-2 gap-1 text-xs"><span className="text-gray-500">Gross (per acct)</span><span className="text-right font-mono text-white">{fmt(grossPerAcct)}</span><span className="text-gray-500">Total Gross ({fcAccounts} accts)</span><span className="text-right font-mono text-white">{fmt(monthlyGross)}</span><span className="text-gray-500">Replacement Cost</span><span className="text-right font-mono text-red-400">&minus;{fmt(monthlyReplacement)}</span><span className="text-gray-500">Expenses</span><span className="text-right font-mono text-red-400">&minus;{fmt(fcExpenses)}</span><span className="text-gray-500">Pre-Tax Profit</span><span className="text-right font-mono text-amber-400">{fmt(monthlyPreTax)}</span><span className="text-gray-500">Tax ({fcTax}%)</span><span className="text-right font-mono text-red-400">&minus;{fmt(monthlyPreTax * fcTax / 100)}</span><span className="text-gray-500 font-bold">Net Income</span><span className="text-right font-mono font-bold text-green-400">{fmt(monthlyNet)}</span></div></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Monthly P&amp;L Tracking</p><h2 className="text-2xl font-extrabold mb-4">The Spreadsheet That Runs Your Business</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#22c55e]">COLUMNS</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Month, Revenue (payouts), COGS (all challenge fees), Operating Expenses, Gross Profit, Tax Reserve (30%), Net Income. One row per month. Running total at the bottom.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#3b82f6]">WHEN TO UPDATE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Last day of every month. Takes 10 minutes. Export bank statement, categorise transactions, calculate totals. If you are using accounting software, most of this is automated.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#f59e0b]">RED FLAGS</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">3 consecutive negative gross profit months. COGS exceeding 40% of revenue (too many failed challenges). Net income below expenses for 2+ months. Any of these triggers a business model review.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">THE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">If you cannot state your net income within &pound;50 at any moment, you are not running a business. You are hoping.</span></p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; The Business Maturation Curve</p><h2 className="text-2xl font-extrabold mb-4">From Startup to Stable Business</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#3b82f6]">MONTHS 1&ndash;3: STARTUP</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">1 account. Prove the process. First payout. Establish systems: bank account, P&amp;L tracker, tax reserve. Net income may be low or negative (challenge fees + setup costs). This is expected. Focus: validation, not profit.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#22c55e]">MONTHS 4&ndash;6: GROWTH</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">2 accounts. Second firm added. Income exceeds expenses. Emergency fund building. First quarterly P&amp;L review. Focus: consistency and cash flow.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#f59e0b]">MONTHS 7&ndash;9: OPTIMISATION</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">2&ndash;3 accounts. Drop weakest firm. Scale best performer. Emergency fund fully funded. Income predictable within &pound;200/month. Focus: efficiency and scaling.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#8b5cf6]">MONTHS 10&ndash;12: MATURITY</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">3+ accounts. Systems running. Tax reserve on autopilot. Annual P&amp;L review. Plan next year: maintain, scale, or pivot. The business runs itself with 2&ndash;3 hours/day of trading.</span></p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p><h2 className="text-2xl font-extrabold mb-4">4 Business-Level Errors</h2><div className="space-y-3">{commonMistakes.map((item, i) => (<div key={i}><button onClick={() => toggle(`cm-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`cm-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`cm-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-xs text-red-400 mb-2">&#10060; {item.mistake}</p><p className="text-xs text-green-400">&#10004; {item.fix}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Cheat Sheet</p><h2 className="text-2xl font-extrabold mb-4">Business Quick Reference</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#22c55e]">MONTHLY P&amp;L</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Revenue &minus; COGS &minus; Expenses &minus; Tax = Net Income. Track every month. Know your number.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#3b82f6]">BUSINESS BANK</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Separate from personal. All trading money flows through one account. Simplifies everything.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#f59e0b]">EMERGENCY FUND</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">3&times; challenge fees. The safety net that keeps the business alive when accounts are lost.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#8b5cf6]">30% TAX RESERVE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Every payout, 30% to a separate savings account. Non-negotiable. No surprises in January.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">THE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">A business that cannot state its net income within &pound;50 is not a business. Track, measure, optimise.</span></p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Test Your Understanding</p><h2 className="text-2xl font-extrabold mb-2">Prop Business Game</h2><p className="text-gray-400 text-sm mb-6">5 scenario-based rounds. Calculate P&amp;L, manage emergencies, and make business decisions.</p>
      <div className="p-6 rounded-2xl glass-card"><div className="flex items-center justify-between mb-4"><span className="text-xs font-bold text-amber-400">Round {gameRound + 1} of {gameRounds.length}</span><span className="text-xs font-mono text-gray-500">{gameScore}/{gameRounds.length} correct</span></div><p className="text-sm text-gray-300 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: gameRounds[gameRound].scenario }} /><div className="space-y-2">{gameRounds[gameRound].options.map((opt, oi) => { const answered = gameAnswers[gameRound] !== null; const selected = gameAnswers[gameRound] === oi; const isCorrect = opt.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return (<div key={oi}><button onClick={() => handleGameAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt.text }} /></button>{answered && selected && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]"><p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`} dangerouslySetInnerHTML={{ __html: opt.explain }} /></motion.div>)}</div>); })}</div>{gameAnswers[gameRound] !== null && gameRound < gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5"><button onClick={() => setGameRound(r => r + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button></motion.div>)}{gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Outstanding \u2014 you think like a prop business owner, not just a trader.' : gameScore >= 3 ? 'Good \u2014 review the P&L structure and emergency fund sections.' : 'Re-read the business infrastructure and monthly P&L tracking sections. These are the operational foundations.'}</p></motion.div>)}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Knowledge Check</p><h2 className="text-2xl font-extrabold mb-6">Final Quiz &mdash; 8 Questions</h2>
      <div className="space-y-6">{quizQuestions.map((q, qi) => (<div key={qi} className="p-5 rounded-2xl glass-card"><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p><p className="text-sm font-semibold text-white mb-4" dangerouslySetInnerHTML={{ __html: q.q }} /><div className="space-y-2">{q.opts.map((opt, oi) => { const answered = quizAnswers[qi] !== null; const selected = quizAnswers[qi] === oi; const isCorrect = oi === q.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return <button key={oi} onClick={() => handleQuizAnswer(qi, oi)} disabled={answered} className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`}>{opt}</button>; })}</div>{quizAnswers[qi] !== null && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg bg-white/[0.02]"><p className="text-xs text-amber-400" dangerouslySetInnerHTML={{ __html: `<span class="font-bold">&#9989;</span> ${q.explain}` }} /></motion.div>)}</div>))}</div>
      {quizDone && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center"><p className="text-3xl font-extrabold mb-2">{quizScoreVal}%</p><p className="text-sm text-gray-400">{quizScoreVal >= 66 ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate. Review and try again.'}</p></motion.div>)}
      {certUnlocked && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10"><div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}><div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(139,92,246,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} /><div className="relative z-10 text-center"><div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">&#128084;</div><p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p><p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 9: Building a Prop Business</strong><br />at ATLAS Academy by Interakktive</p><p className="bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Prop CEO &mdash;</p><p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L9.13-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p></div></div></motion.div>)}</motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-20 text-center"><Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">&larr; Back to Academy</Link></section>
    </div>
  );
}
