// app/academy/lesson/payout-optimisation/page.tsx
// ATLAS Academy — Lesson 9.11: Payout Optimisation [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 9
// GROUNDBREAKING: Payout Calculator — multi-firm comparison with tax/frequency
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
const splitData = [
  { split: '70/30', traderPct: 70, firmPct: 30, color: '#ef4444' },
  { split: '80/20', traderPct: 80, firmPct: 20, color: '#f59e0b' },
  { split: '85/15', traderPct: 85, firmPct: 15, color: '#22c55e' },
  { split: '90/10', traderPct: 90, firmPct: 10, color: '#3b82f6' },
];

const payoutSchedules = [
  { name: 'Bi-Weekly', desc: 'Payouts every 14 days. Fastest cash flow cycle. Best for: traders who depend on prop income to cover living expenses. You see the money sooner, which keeps motivation high and reduces the temptation to over-trade for a bigger monthly number. Downside: more frequent withdrawal requests, some firms charge fees per withdrawal.', freq: '2\u00D7/month', cashFlow: 'Fastest', color: '#22c55e' },
  { name: 'Monthly', desc: 'Payouts once per calendar month. Most common structure. Best for: traders who can budget monthly and do not need rapid cash flow. Advantage: fewer transactions, lower withdrawal fees, and you see a bigger number each payout (which psychologically reinforces the business). Downside: 30 days between payouts means you need a buffer for expenses.', freq: '1\u00D7/month', cashFlow: 'Standard', color: '#3b82f6' },
  { name: 'On-Demand', desc: 'Withdraw whenever you want (after minimum holding period, usually 14 days). Maximum flexibility. Best for: experienced traders with emergency needs or irregular expenses. Downside: easy to over-withdraw, leaving insufficient buffer in the account. The temptation to pull profits immediately reduces compounding potential.', freq: 'Flexible', cashFlow: 'Variable', color: '#f59e0b' },
];

const compoundRules = [
  { title: 'The 2% Buffer Rule', desc: 'Always leave at least 2% of your starting balance as a buffer in the funded account before withdrawing. If your starting balance is \u00A3100K, keep \u00A32,000 minimum. This protects against a bad start to the next payout cycle.', verdict: 'ALWAYS', color: '#22c55e' },
  { title: 'Compound When Scaling', desc: 'If you are building toward a larger account (or the firm offers scaling based on total profit), compound for 2\u20133 months to hit the next tier. The increased balance generates more income than the payouts you delayed.', verdict: 'WHEN SCALING', color: '#3b82f6' },
  { title: 'Withdraw When Stable', desc: 'Once you have 3+ funded accounts and consistent monthly income, withdraw regularly. The income is the point. Hoarding profit in funded accounts does not earn interest and adds drawdown risk if the account is lost.', verdict: 'WHEN STABLE', color: '#f59e0b' },
  { title: 'Never Compound to Avoid Taxes', desc: 'Leaving money in a funded account does not change your tax liability. HMRC (UK) taxes you on realised profits regardless of whether you withdraw. Compounding to "avoid tax" is a myth that leads to poor financial planning.', verdict: 'NEVER', color: '#ef4444' },
];

const taxInfo = [
  { title: 'UK Self-Employment', desc: 'Prop trading income is typically classed as self-employment income (trading income) in the UK. You must register as self-employed with HMRC if you earn above the \u00A31,000 trading allowance. Income is subject to Income Tax at your marginal rate (20%/40%/45%) plus Class 2 and Class 4 National Insurance. You can deduct business expenses: challenge fees, platform costs, VPS, educational materials. File a Self Assessment tax return annually. Keep records of ALL payouts, challenge fees, and expenses for at least 5 years.', color: '#3b82f6' },
  { title: 'Record-Keeping Essentials', desc: 'Every payout: date, amount, firm, account ID. Every challenge fee: date, amount, firm, outcome (pass/fail). Monthly P&amp;L: gross payout minus firm split minus expenses. Annual summary: total income, total expenses, net taxable profit. Use a spreadsheet or accounting software (FreeAgent, Xero, QuickBooks). Separate business bank account recommended but not legally required for sole traders.', color: '#22c55e' },
  { title: 'Allowable Business Expenses', desc: 'Challenge fees (including failed attempts \u2014 these are a cost of doing business). Platform subscriptions (TradingView, data feeds). VPS hosting for trade copiers or bots. Educational courses and materials. Home office costs (proportional). Internet costs (proportional). Hardware (trading PC, monitors). Professional services (accountant fees). These reduce your taxable profit.', color: '#f59e0b' },
  { title: 'Common Tax Mistakes', desc: 'Not registering as self-employed (HMRC penalty). Not keeping records of failed challenge fees (losing deductible expenses). Mixing personal and business finances (harder to track). Not setting aside tax (recommended: 30% of net income into a separate savings account). Assuming prop income is capital gains (it is not \u2014 it is trading income / self-employment income in the UK).', color: '#ef4444' },
];

const commonMistakes = [
  { title: 'Choosing a Firm Based Only on Split', mistake: '"90/10 is obviously better than 80/20." Not necessarily. A 90/10 firm with a 3% daily DD limit and trailing overall DD means you are MORE likely to lose the account. An 80/20 firm with 5% daily DD and static overall DD lets you survive longer, earn more total months, and the cumulative income exceeds the 90/10 firm that terminated you in Month 3.', fix: 'Calculate EXPECTED ANNUAL income, not per-payout income. A firm where you survive 12 months at 80/20 beats a firm where you survive 4 months at 90/10. Longevity \u00D7 split = actual income.' },
  { title: 'Withdrawing Everything Every Payout', mistake: '"I earned it, I deserve it." If you withdraw 100% every payout, your funded account balance returns to the starting level. You have zero buffer. One losing day and your overall DD usage is immediately higher. You are trading without a cushion.', fix: 'Leave 2% buffer minimum. If the firm allows you to trade on the larger balance (starting + accumulated profit), keeping some profit in the account gives you more room to breathe and sometimes qualifies for scaling.' },
  { title: 'Not Tracking Challenge Fees as Business Expenses', mistake: '"I failed 3 challenges, that is just bad luck." Those 3 failed challenges at \u00A3300 each = \u00A3900 in deductible business expenses. If you do not track them, you are paying tax on income you did not actually net. Over a year, untracked expenses can cost you hundreds in unnecessary tax.', fix: 'Track EVERY challenge fee: date, amount, firm, outcome. Failed challenges are a cost of doing business, exactly like a retailer tracking inventory that did not sell. Keep receipts and payment confirmations for 5 years.' },
  { title: 'Ignoring Payout Frequency in Firm Selection', mistake: '"Payout frequency does not matter, only the split matters." If you depend on prop income for monthly expenses, a firm that pays monthly with a 14-day minimum trading period means you might wait 45 days for your first payout. During that time, you still have bills.', fix: 'Match payout frequency to your financial needs. If you need regular cash flow, prioritise bi-weekly payouts. If you can buffer, monthly is fine. Factor this into your firm selection alongside DD rules and splits.' },
];

const gameRounds = [
  { scenario: '<strong>Payout timing decision:</strong> You earned \u00A34,200 gross on your \u00A3100K funded account this month. Your payout split is 80/20. Your monthly expenses are \u00A32,500. The firm offers monthly payouts. How much do you withdraw?', options: [
    { text: 'Withdraw the full \u00A33,360 (80% of \u00A34,200). You earned it, take everything.', correct: false, explain: 'Full withdrawal leaves zero buffer. If next month starts with 2 losing days, your overall DD is immediately under pressure with no cushion from accumulated profit. Leave at least 2% (\u00A32,000) as buffer.' },
    { text: 'Withdraw \u00A32,500 to cover expenses, leave \u00A3860 as buffer in the account. This covers your bills while maintaining a healthy cushion for the next payout cycle.', correct: true, explain: 'Smart withdrawal. \u00A32,500 covers expenses, \u00A3860 stays as buffer (plus whatever the firm credits from the 80/20 split). You are living from the account without stripping it bare. The buffer protects your DD headroom for the next month.' },
    { text: 'Do not withdraw anything. Compound the full amount to hit the next scaling tier.', correct: false, explain: 'Unless you have another income source covering expenses, not withdrawing means you cannot pay bills. Compounding is a strategy, but not at the expense of financial stability. Income from trading should actually fund your life \u2014 that is the point.' },
  ]},
  { scenario: '<strong>Split comparison:</strong> You are choosing between two firms. Firm A: 80/20 split, 5% daily DD, 10% overall DD (static), \u00A3350 challenge fee. Firm B: 90/10 split, 3% daily DD, 8% overall DD (trailing), \u00A3450 challenge fee. Your strategy averages 2.5% monthly return with occasional \u22121.5% drawdown days. Which firm maximises your long-term income?', options: [
    { text: 'Firm B \u2014 the 90/10 split is clearly better. You keep more of every pound earned.', correct: false, explain: 'The 90/10 split is better per-payout, but the 3% daily DD means your worst days (\u22121.5%) consume 50% of the daily limit in a single session. The trailing DD means your headroom shrinks as you profit. Expected survival at Firm B: ~5 months. Expected survival at Firm A: 12+ months. Total income: Firm A wins by a wide margin.' },
    { text: 'Firm A \u2014 the wider DD limits mean longer survival. 12 months at 80/20 beats 5 months at 90/10.', correct: true, explain: 'At 2.5% monthly: Firm A = \u00A32,000/month for 12+ months = \u00A324,000+. Firm B = \u00A32,250/month for ~5 months = \u00A311,250. The 10% split difference costs you \u00A3250/month, but the survival difference is worth \u00A312,750+ over a year. Longevity always beats split percentage.' },
    { text: 'It depends entirely on your trading style \u2014 both could work equally well.', correct: false, explain: 'Not equally. With \u22121.5% worst days, the 3% daily DD at Firm B creates constant termination risk. Your strategy\u2019s drawdown profile directly determines which firm you survive longer at. The numbers show Firm A clearly.' },
  ]},
  { scenario: '<strong>Tax planning:</strong> After 6 months of prop trading, you have earned \u00A318,000 in total payouts (after firm splits). You have paid \u00A32,400 in challenge fees (4 failed, 2 passed). Your trading expenses (TradingView, VPS, courses) total \u00A3600. How much is your taxable profit?', options: [
    { text: '\u00A318,000 \u2014 the full payout amount is taxable.', correct: false, explain: 'You forgot to deduct business expenses. Challenge fees (including failed attempts) and trading expenses are deductible. Paying tax on the full \u00A318,000 means overpaying by a significant amount.' },
    { text: '\u00A315,000 \u2014 taxable profit is \u00A318,000 minus \u00A32,400 challenge fees minus \u00A3600 expenses.', correct: true, explain: '\u00A318,000 \u2212 \u00A32,400 \u2212 \u00A3600 = \u00A315,000 taxable profit. ALL challenge fees are deductible (even failed ones \u2014 they are a legitimate business cost). Platform and tool expenses are deductible. At 20% basic rate, tax on \u00A315,000 = \u00A33,000 vs tax on \u00A318,000 = \u00A33,600. Proper expense tracking saved \u00A3600 in tax.' },
    { text: '\u00A315,600 \u2014 only successful challenge fees are deductible, not failed ones.', correct: false, explain: 'Failed challenge fees ARE deductible. They are a normal cost of the prop trading business, like inventory a retailer could not sell. HMRC allows deduction of all legitimate business expenses incurred in the course of trading. Not deducting failed fees costs you money.' },
  ]},
  { scenario: '<strong>Compound vs withdraw:</strong> Your firm offers a scaling plan: reach \u00A310,000 total profit (without withdrawing) on a \u00A3100K account and they upgrade you to \u00A3200K. You are at \u00A37,200 total profit after 3 months. Your monthly return is ~\u00A32,400. Do you compound to reach the scaling tier?', options: [
    { text: 'Compound for the next 2 months to reach \u00A310,000. The \u00A3200K account will double your income permanently.', correct: true, explain: 'At \u00A32,400/month, you hit \u00A310,000 in ~6 weeks. After scaling: \u00A3200K at the same 2.4% = \u00A34,800/month (at 80/20 = \u00A33,840/month take-home). The 6 weeks of delayed withdrawals (\u00A32,880 at 80/20) are paid back in under 1 month at the higher balance. This is one of the few situations where compounding has a clear mathematical advantage.' },
    { text: 'Withdraw as normal \u2014 the scaling tier is not worth the risk of losing the accumulated profit.', correct: false, explain: 'The risk analysis favours compounding here. You are \u00A32,800 away from doubling your earning capacity permanently. If the account is lost, you lose the profit regardless of whether you withdrew. The scaling benefit (\u00A31,440 more per month) far exceeds the delayed withdrawal cost.' },
    { text: 'Partially withdraw \u2014 take \u00A31,000 and leave the rest to compound.', correct: false, explain: 'This resets your scaling progress at most firms. If the scaling requirement is \u00A310,000 without withdrawal, taking \u00A31,000 puts you back to \u00A36,200 and adds another 2+ months to reach the tier. Either commit to the scaling plan or withdraw normally \u2014 the middle ground is the worst option.' },
  ]},
  { scenario: '<strong>Multi-account payout strategy:</strong> You run 3 funded accounts: Account A (\u00A3100K, 80/20, bi-weekly payouts), Account B (\u00A350K, 85/15, monthly payouts), Account C (\u00A350K, 90/10, monthly payouts). Your total monthly income from all 3 is approximately \u00A35,200. How do you structure your withdrawals?', options: [
    { text: 'Withdraw from all 3 accounts simultaneously at the end of every month for one big payment.', correct: false, explain: 'Account A pays bi-weekly \u2014 you are leaving money in the account unnecessarily by waiting for the monthly cycle. And withdrawing from all accounts simultaneously means your entire prop portfolio has zero buffer at the same time. Stagger for cash flow stability.' },
    { text: 'Stagger withdrawals: use Account A\u2019s bi-weekly payouts for regular expenses, Account B monthly for savings/tax, Account C monthly for business reinvestment (challenge fees, tools). Each account serves a purpose.', correct: true, explain: 'Strategic allocation. Account A\u2019s bi-weekly payouts cover living expenses (regular cash flow). Account B\u2019s monthly payout goes to savings and tax reserve (30% rule). Account C\u2019s monthly payout funds new challenges and business tools. This ensures you are never fully exposed (all accounts emptied simultaneously) and each withdrawal has a designated purpose.' },
    { text: 'Only withdraw from the account with the best split (Account C at 90/10) and compound the other two.', correct: false, explain: 'This ignores the purpose of having multiple accounts. Account C at 90/10 on a \u00A350K account generates the least total income. Account A at 80/20 on \u00A3100K generates the most. Compounding accounts that do not offer scaling tiers provides no mathematical benefit \u2014 you are just accumulating risk.' },
  ]},
];

const quizQuestions = [
  { q: 'Why might an 80/20 split firm generate more total income than a 90/10 split firm?', opts: ['It cannot \u2014 90/10 always earns more', 'Because wider drawdown limits at the 80/20 firm allow longer survival, and 12 months at 80/20 exceeds 4 months at 90/10', 'Because 80/20 firms have better customer service', 'Because the challenge fee is cheaper'], correct: 1, explain: 'Longevity \u00D7 split = total income. A 10% split advantage means nothing if the tighter DD rules terminate your account 3x sooner. Total income depends on how many months you survive earning, not what percentage of each month\u2019s profit you keep.' },
  { q: 'What is the 2% buffer rule when withdrawing profits?', opts: ['Withdraw only 2% of your balance per month', 'Always leave at least 2% of your starting balance as a buffer in the funded account before withdrawing, to protect against drawdown pressure at the start of the next cycle', 'Tax 2% of every payout', 'Keep 2% in a savings account'], correct: 1, explain: 'The 2% buffer protects your DD headroom. If your starting balance is \u00A3100K, keep at least \u00A32,000 in the account after each withdrawal. This means the next payout cycle starts with a cushion rather than zero margin for error.' },
  { q: 'Are failed challenge fees deductible as a business expense in the UK?', opts: ['No \u2014 only successful challenge fees', 'Yes \u2014 failed challenge fees are a legitimate cost of the prop trading business and are fully deductible', 'Only if you pass within 3 attempts', 'Only if you are VAT registered'], correct: 1, explain: 'Failed challenges are a normal business cost, like unsold inventory. HMRC allows deduction of all legitimate expenses incurred in the course of trading. Not tracking and deducting these costs means paying more tax than necessary.' },
  { q: 'How is prop trading income typically classified for tax purposes in the UK?', opts: ['Capital gains', 'Self-employment / trading income, subject to Income Tax and National Insurance', 'Gambling winnings (tax-free)', 'Investment income'], correct: 1, explain: 'Prop trading income is self-employment income in the UK. You register as a sole trader, file Self Assessment, pay Income Tax at your marginal rate (20/40/45%) plus National Insurance contributions. It is NOT capital gains and NOT gambling \u2014 it is a business activity.' },
  { q: 'When should you compound profits instead of withdrawing?', opts: ['Always \u2014 compounding is always better', 'When the firm offers a scaling tier you are close to reaching, and the increased future income mathematically exceeds the delayed withdrawals', 'Never \u2014 always withdraw immediately', 'Only during your first month'], correct: 1, explain: 'Compound when there is a specific scaling benefit (e.g., reaching \u00A310K total profit to unlock \u00A3200K). The math must work: the future income increase from the larger account must exceed the value of the delayed payouts within a reasonable timeframe (1\u20132 months).' },
  { q: 'What is the recommended approach for setting aside money for taxes?', opts: ['Wait until the tax return is due and pay from savings', 'Set aside approximately 30% of net income into a separate savings account immediately after each payout', 'Only worry about taxes if you earn above \u00A350,000', 'Prop trading income is not taxable'], correct: 1, explain: '30% set aside after each payout covers Income Tax + National Insurance for most basic-rate taxpayers with some buffer. Using a separate savings account prevents you from spending tax money. Waiting until the Self Assessment deadline risks not having enough.' },
  { q: 'What is the strategic advantage of staggering withdrawals across multiple accounts?', opts: ['It reduces your tax liability', 'It ensures you never have all accounts at zero buffer simultaneously, provides regular cash flow, and allows each account to serve a designated financial purpose', 'It confuses the prop firms', 'There is no advantage \u2014 withdraw from all accounts at the same time'], correct: 1, explain: 'Staggered withdrawals: bi-weekly account covers expenses, monthly Account B for tax savings, monthly Account C for business reinvestment. All accounts never empty simultaneously. Each withdrawal has a purpose. This is financial management, not just trading.' },
  { q: 'Your monthly expenses are \u00A32,800. You have a \u00A3100K funded account at 80/20 split. What minimum monthly return do you need to cover expenses from payouts alone?', opts: ['2.8% \u2014 just match expenses to gross profit', '3.5% \u2014 because you only keep 80% of gross, so you need \u00A33,500 gross to net \u00A32,800, which is 3.5% of \u00A3100K', '4.5% \u2014 to cover expenses plus tax', '2% \u2014 expenses are less than \u00A33,000'], correct: 1, explain: 'You keep 80% of gross. To net \u00A32,800: \u00A32,800 \u00F7 0.80 = \u00A33,500 gross needed. \u00A33,500 \u00F7 \u00A3100,000 = 3.5% monthly return. This does not include tax or buffer \u2014 the real number is closer to 4.5% when you factor in 30% tax set-aside and the 2% buffer rule.' },
];

export default function PayoutOptimisation() {
  const [scrollY, setScrollY] = useState(0);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [gameRound, setGameRound] = useState(0);
  const [gameAnswers, setGameAnswers] = useState<(number | null)[]>(Array(gameRounds.length).fill(null));
  const [gameScore, setGameScore] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(Array(quizQuestions.length).fill(null));
  const [showConfetti, setShowConfetti] = useState(false);
  const [certUnlocked, setCertUnlocked] = useState(false);
  /* Payout Calculator state */
  const [pcBalance, setPcBalance] = useState(100000);
  const [pcReturn, setPcReturn] = useState(3);
  const [pcSplitA, setPcSplitA] = useState(80);
  const [pcSplitB, setPcSplitB] = useState(85);
  const [pcSplitC, setPcSplitC] = useState(90);
  const [pcFreq, setPcFreq] = useState<'biweekly' | 'monthly'>('monthly');
  const [pcTax, setPcTax] = useState(20);
  const [pcExpenses, setPcExpenses] = useState(2500);

  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);
  const toggle = (id: string) => setOpenSections(s => ({ ...s, [id]: !s[id] }));

  const handleGameAnswer = (oi: number) => { if (gameAnswers[gameRound] !== null) return; const a = [...gameAnswers]; a[gameRound] = oi; setGameAnswers(a); if (gameRounds[gameRound].options[oi].correct) setGameScore(s => s + 1); };
  const handleQuizAnswer = (qi: number, oi: number) => { if (quizAnswers[qi] !== null) return; const a = [...quizAnswers]; a[qi] = oi; setQuizAnswers(a); };

  const quizDone = quizAnswers.every(a => a !== null);
  const quizScoreVal = quizDone ? Math.round(quizAnswers.reduce<number>((s, a, i) => s + (a === quizQuestions[i].correct ? 1 : 0), 0) / quizQuestions.length * 100) : 0;
  useEffect(() => { if (quizDone && quizScoreVal >= 66 && !certUnlocked) { setCertUnlocked(true); setShowConfetti(true); const t = setTimeout(() => setShowConfetti(false), 4000); return () => clearTimeout(t); } }, [quizDone, quizScoreVal, certUnlocked]);

  /* Payout Calculator computations */
  const grossMonthly = pcBalance * (pcReturn / 100);
  const calcFirm = (split: number) => {
    const netMonth = grossMonthly * (split / 100);
    const payoutsPerYear = pcFreq === 'biweekly' ? 26 : 12;
    const perPayout = (netMonth * 12) / payoutsPerYear;
    const taxAmt = netMonth * (pcTax / 100);
    const takeHome = netMonth - taxAmt;
    const surplus = takeHome - pcExpenses;
    return { netMonth, perPayout, taxAmt, takeHome, surplus, split };
  };
  const firmA = calcFirm(pcSplitA);
  const firmB = calcFirm(pcSplitB);
  const firmC = calcFirm(pcSplitC);
  const minReturnForExpenses = pcExpenses > 0 ? ((pcExpenses / (1 - pcTax / 100)) / (pcSplitA / 100) / pcBalance * 100) : 0;

  /* ─── DRAW FUNCTIONS ─── */
  const drawSplitComparison = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const cx = w / 2;
    const cy = h / 2;
    const grossAmt = 2000;
    const maxBarW = w * 0.65;
    const barH = 28;
    const startY = 50;
    const gap = 52;
    ctx.font = 'bold 14px system-ui'; ctx.fillStyle = '#9ca3af'; ctx.textAlign = 'center';
    ctx.fillText(`Same \u00A3${grossAmt.toLocaleString()} Gross Profit`, cx, 28);
    splitData.forEach((d, i) => {
      const y = startY + i * gap;
      const progress = Math.min(1, (f - i * 12) / 60);
      if (progress <= 0) return;
      const traderAmt = grossAmt * d.traderPct / 100;
      const traderW = maxBarW * (d.traderPct / 100) * progress;
      const firmW = maxBarW * (d.firmPct / 100) * progress;
      const barX = (w - maxBarW) / 2;
      ctx.fillStyle = d.color + '30'; ctx.beginPath(); ctx.roundRect(barX, y, traderW, barH, 6); ctx.fill();
      ctx.fillStyle = d.color; ctx.beginPath(); ctx.roundRect(barX, y, traderW, barH, 6); ctx.fill(); ctx.globalAlpha = 0.3; ctx.fill(); ctx.globalAlpha = 1;
      ctx.fillStyle = d.color; ctx.beginPath(); ctx.roundRect(barX, y, traderW, barH, 6); ctx.fill();
      ctx.fillStyle = '#ffffff10'; ctx.beginPath(); ctx.roundRect(barX + traderW, y, firmW, barH, 6); ctx.fill();
      ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'left'; ctx.fillStyle = '#fff';
      ctx.fillText(d.split, barX + 8, y + 18);
      ctx.textAlign = 'right'; ctx.fillStyle = d.color;
      ctx.fillText(`\u00A3${Math.round(traderAmt * progress).toLocaleString()}`, barX + traderW - 8, y + 18);
    });
    ctx.font = '10px system-ui'; ctx.fillStyle = '#6b7280'; ctx.textAlign = 'center';
    ctx.fillText('The split difference adds up to thousands per year', cx, h - 12);
  }, []);

  const drawCompoundTree = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const cx = w / 2;
    const cy = h / 2;
    const cycle = f % 300;
    const nodes = [
      { x: cx, y: 40, label: 'Monthly Profit', color: '#f59e0b' },
      { x: cx, y: 100, label: 'Buffer above 2%?', color: '#8b5cf6' },
      { x: cx - 100, y: 170, label: 'YES', color: '#22c55e' },
      { x: cx + 100, y: 170, label: 'NO', color: '#ef4444' },
      { x: cx - 100, y: 230, label: 'Scaling?', color: '#3b82f6' },
      { x: cx + 100, y: 230, label: 'Compound', color: '#f59e0b' },
      { x: cx - 160, y: 280, label: 'NO \u2192 Withdraw', color: '#22c55e' },
      { x: cx - 40, y: 280, label: 'YES \u2192 Compound', color: '#3b82f6' },
    ];
    const edges = [[0,1],[1,2],[1,3],[2,4],[3,5],[4,6],[4,7]];
    edges.forEach(([a, b]) => {
      const progress = Math.min(1, (cycle - a * 20) / 30);
      if (progress <= 0) return;
      ctx.strokeStyle = '#ffffff10'; ctx.lineWidth = 1; ctx.beginPath();
      ctx.moveTo(nodes[a].x, nodes[a].y + 14); ctx.lineTo(nodes[a].x + (nodes[b].x - nodes[a].x) * progress, nodes[a].y + 14 + (nodes[b].y - 14 - nodes[a].y - 14) * progress);
      ctx.stroke();
    });
    nodes.forEach((n, i) => {
      const appear = Math.min(1, (cycle - i * 15) / 20);
      if (appear <= 0) return;
      ctx.globalAlpha = appear;
      ctx.fillStyle = n.color + '20'; ctx.beginPath(); ctx.roundRect(n.x - 55, n.y - 12, 110, 26, 8); ctx.fill();
      ctx.strokeStyle = n.color + '40'; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(n.x - 55, n.y - 12, 110, 26, 8); ctx.stroke();
      ctx.font = 'bold 10px system-ui'; ctx.fillStyle = n.color; ctx.textAlign = 'center'; ctx.fillText(n.label, n.x, n.y + 4);
      ctx.globalAlpha = 1;
    });
  }, []);

  const inputCls = 'w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50';
  const fmt = (n: number) => '\u00A3' + Math.round(n).toLocaleString();

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      <Confetti active={showConfetti} />
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-white/5"><motion.div className="h-full bg-gradient-to-r from-amber-500 to-accent-500" style={{ width: `${Math.min(100, (scrollY / (typeof document !== 'undefined' ? document.body.scrollHeight - window.innerHeight : 1)) * 100)}%` }} /></div>
      <nav className="fixed top-1 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur border border-white/[0.06]"><span className="text-xs font-bold tracking-widest bg-gradient-to-r from-amber-400 to-purple-400 bg-clip-text text-transparent">ATLAS ACADEMY</span><Crown className="w-3.5 h-3.5 text-amber-400" /><span className="text-[10px] font-mono text-amber-400/80 tracking-widest">PRO &middot; LEVEL 9</span></nav>

      <header className="relative min-h-[85vh] flex items-center justify-center overflow-hidden"><div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }} /><div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #d946ef 0%, transparent 70%)' }} /><div className="relative z-10 text-center px-6"><motion.div variants={fadeUp} initial="hidden" animate="visible"><p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-4">Level 9 &mdash; Lesson 11</p></motion.div><motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.15 }}><h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4"><span className="bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Payout Optimisation</span></h1></motion.div><motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.3 }}><p className="text-gray-400 max-w-md mx-auto text-sm leading-relaxed">Maximise what you actually take home &mdash; splits, tax, frequency, and the buffer rule.</p></motion.div><motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.45 }} className="mt-8 flex flex-col items-center gap-2"><span className="text-[10px] uppercase tracking-widest text-gray-600">Scroll to begin</span><motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}><ChevronDown className="w-4 h-4 text-gray-600" /></motion.div></motion.div></div></header>

      <section className="max-w-2xl mx-auto px-5 py-20"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-3">00 &mdash; Why This Matters</p><h2 className="text-2xl font-extrabold mb-4">The Money You Earn Is Not the Money You Keep</h2><div className="p-6 rounded-2xl glass-card"><p className="text-sm text-gray-300 leading-relaxed mb-4">Two traders earn the same 3% monthly return on the same &pound;100K funded account. Same strategy. Same edge. Trader A: 90/10 split, monthly payouts, does not track expenses, pays tax on gross. Takes home &pound;1,890/month. Trader B: 80/20 split, bi-weekly payouts, deducts &pound;300/month in challenge fees and expenses, sets aside 30% for tax. Takes home &pound;1,820/month &mdash; but survives 3&times; longer because the wider DD rules at the 80/20 firm protect the account. After 12 months: Trader A earned &pound;9,450 (terminated Month 5). Trader B earned &pound;21,840. Same skill. Different payout strategy.</p><div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10"><p className="text-xs text-amber-400 font-semibold mb-1">&#9889; REAL SCENARIO</p><p className="text-xs text-gray-400">The difference between &pound;9,450 and &pound;21,840 is not trading skill. It is payout optimisation: understanding splits, timing withdrawals, tracking expenses, and choosing firms where you survive long enough to collect.</p></div></div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; Payout Split Comparison</p><h2 className="text-2xl font-extrabold mb-4">Same Profit, Different Take-Home</h2><div className="p-4 rounded-2xl glass-card"><AnimScene drawFn={drawSplitComparison} height={280} /></div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; Withdraw vs Compound</p><h2 className="text-2xl font-extrabold mb-4">Decision Tree</h2><div className="p-4 rounded-2xl glass-card"><AnimScene drawFn={drawCompoundTree} /></div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; Payout Schedules</p><h2 className="text-2xl font-extrabold mb-4">When You Get Paid Matters</h2><div className="space-y-3">{payoutSchedules.map((item, i) => (<div key={i}><button onClick={() => toggle(`ps-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><div className="flex items-center gap-3"><span className="text-lg">{['\u23F0', '\ud83d\udcc5', '\u26A1'][i]}</span><div><span className="text-sm font-bold text-gray-200">{item.name}</span><span className="ml-2 text-[10px] px-2 py-0.5 rounded-full font-mono" style={{ background: item.color + '20', color: item.color }}>{item.freq}</span></div></div><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`ps-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`ps-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Compound vs Withdraw</p><h2 className="text-2xl font-extrabold mb-4">The Buffer Rule &amp; When to Compound</h2><div className="space-y-3">{compoundRules.map((item, i) => (<div key={i} className="p-4 rounded-xl glass-card"><div className="flex items-center justify-between mb-2"><span className="text-sm font-bold text-gray-200">{item.title}</span><span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold" style={{ background: item.color + '20', color: item.color }}>{item.verdict}</span></div><p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Payout Calculator</p><h2 className="text-2xl font-extrabold mb-2">&#127919; GROUNDBREAKING: Multi-Firm Payout Comparison</h2><p className="text-gray-400 text-sm mb-6">Compare 3 different payout splits side by side. See gross, net, tax, take-home, and surplus after expenses.</p>
      <div className="p-6 rounded-2xl glass-card space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-[10px] text-gray-500 uppercase tracking-wider">Funded Balance (&pound;)</label><input type="number" value={pcBalance} onChange={e => setPcBalance(Number(e.target.value) || 0)} className={inputCls} /></div>
          <div><label className="text-[10px] text-gray-500 uppercase tracking-wider">Monthly Return (%)</label><input type="number" step="0.1" value={pcReturn} onChange={e => setPcReturn(Number(e.target.value) || 0)} className={inputCls} /></div>
          <div><label className="text-[10px] text-gray-500 uppercase tracking-wider">Payout Frequency</label><select value={pcFreq} onChange={e => setPcFreq(e.target.value as 'biweekly' | 'monthly')} className={inputCls}><option value="monthly">Monthly</option><option value="biweekly">Bi-Weekly</option></select></div>
          <div><label className="text-[10px] text-gray-500 uppercase tracking-wider">Tax Rate (%)</label><input type="number" value={pcTax} onChange={e => setPcTax(Number(e.target.value) || 0)} className={inputCls} /></div>
          <div className="col-span-2"><label className="text-[10px] text-gray-500 uppercase tracking-wider">Monthly Expenses (&pound;)</label><input type="number" value={pcExpenses} onChange={e => setPcExpenses(Number(e.target.value) || 0)} className={inputCls} /></div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="text-[10px] text-gray-500 uppercase tracking-wider">Firm A Split (%)</label><input type="number" value={pcSplitA} onChange={e => setPcSplitA(Number(e.target.value) || 0)} className={inputCls} /></div>
          <div><label className="text-[10px] text-gray-500 uppercase tracking-wider">Firm B Split (%)</label><input type="number" value={pcSplitB} onChange={e => setPcSplitB(Number(e.target.value) || 0)} className={inputCls} /></div>
          <div><label className="text-[10px] text-gray-500 uppercase tracking-wider">Firm C Split (%)</label><input type="number" value={pcSplitC} onChange={e => setPcSplitC(Number(e.target.value) || 0)} className={inputCls} /></div>
        </div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center"><p className="text-xs text-gray-500">Gross Monthly Profit</p><p className="text-lg font-extrabold text-amber-400">{fmt(grossMonthly)}</p></div>
        <div className="space-y-3">{[firmA, firmB, firmC].map((firm, fi) => (<div key={fi} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"><div className="flex items-center justify-between mb-3"><span className="text-sm font-bold" style={{ color: ['#3b82f6', '#22c55e', '#f59e0b'][fi] }}>Firm {['A', 'B', 'C'][fi]} &mdash; {firm.split}/{100 - firm.split}</span><span className="text-[10px] px-2 py-0.5 rounded-full font-mono" style={{ background: (firm.surplus >= 0 ? '#22c55e' : '#ef4444') + '20', color: firm.surplus >= 0 ? '#22c55e' : '#ef4444' }}>{firm.surplus >= 0 ? 'SURPLUS' : 'DEFICIT'}</span></div><div className="grid grid-cols-2 gap-2 text-xs"><div><span className="text-gray-500">Net After Split</span><p className="font-mono text-white">{fmt(firm.netMonth)}/mo</p></div><div><span className="text-gray-500">Per Payout</span><p className="font-mono text-white">{fmt(firm.perPayout)}</p></div><div><span className="text-gray-500">Est. Tax ({pcTax}%)</span><p className="font-mono text-red-400">&minus;{fmt(firm.taxAmt)}/mo</p></div><div><span className="text-gray-500">Take-Home</span><p className="font-mono text-green-400">{fmt(firm.takeHome)}/mo</p></div></div><div className="mt-2 pt-2 border-t border-white/[0.04] flex justify-between text-xs"><span className="text-gray-500">Surplus After Expenses</span><span className="font-mono font-bold" style={{ color: firm.surplus >= 0 ? '#22c55e' : '#ef4444' }}>{firm.surplus >= 0 ? '+' : ''}{fmt(firm.surplus)}/mo</span></div></div>))}</div>
        {pcExpenses > 0 && (<div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 text-center"><p className="text-xs text-gray-500">Min. Monthly Return to Cover Expenses (Firm A)</p><p className="text-sm font-bold text-amber-400">{minReturnForExpenses.toFixed(2)}% of {fmt(pcBalance)}</p></div>)}
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Tax &amp; Record-Keeping</p><h2 className="text-2xl font-extrabold mb-4">UK Self-Employment Tax for Prop Traders</h2><div className="space-y-3">{taxInfo.map((item, i) => (<div key={i}><button onClick={() => toggle(`tax-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.name}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`tax-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`tax-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-xs text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.desc }} /></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; The 30% Rule</p><h2 className="text-2xl font-extrabold mb-4">Set Aside Tax Before You Spend</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#22c55e]">THE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">After every payout, immediately transfer 30% to a separate savings account labelled &ldquo;Tax Reserve.&rdquo; Do not touch this money until Self Assessment is due.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#3b82f6]">WHY 30%</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Basic rate Income Tax (20%) + Class 4 NI (~6%) + Class 2 NI (~&pound;3.45/week) &asymp; 27%. The extra 3% provides a buffer for underpayment estimates, late payment interest, and the peace of mind of knowing tax is covered.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#f59e0b]">SEPARATE ACCOUNT</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">If tax money sits in your current account, you will spend it. A separate savings account with no debit card creates a psychological and practical barrier. When HMRC asks for payment, the money is already waiting.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">THE FORMULA</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Payout &rarr; 30% to Tax Reserve &rarr; 2% stays as account buffer &rarr; remainder = your actual take-home. Plan your lifestyle around this number, not the gross payout.</span></p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p><h2 className="text-2xl font-extrabold mb-4">4 Payout Errors</h2><div className="space-y-3">{commonMistakes.map((item, i) => (<div key={i}><button onClick={() => toggle(`cm-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`cm-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`cm-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-xs text-red-400 mb-2">&#10060; {item.mistake}</p><p className="text-xs text-green-400">&#10004; {item.fix}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Cheat Sheet</p><h2 className="text-2xl font-extrabold mb-4">Payout Quick Reference</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#22c55e]">LONGEVITY BEATS SPLIT</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">12 months at 80/20 beats 5 months at 90/10. Total income = months survived &times; monthly payout.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#3b82f6]">2% BUFFER</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Always leave 2% of starting balance in the account after withdrawal. Never strip it bare.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#f59e0b]">30% TAX RESERVE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Immediately after every payout, 30% goes to a separate tax savings account. No exceptions.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#8b5cf6]">TRACK EVERYTHING</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Every payout, every challenge fee (including failures), every expense. Failed fees are deductible. Missing them costs you real tax money.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">THE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Your actual income = payout &minus; firm split &minus; tax &minus; expenses. Optimise the whole equation, not just the split percentage.</span></p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Test Your Understanding</p><h2 className="text-2xl font-extrabold mb-2">Payout Strategy Game</h2><p className="text-gray-400 text-sm mb-6">5 scenario-based rounds. Optimise withdrawals, compare splits, plan taxes, and manage multi-account payouts.</p>
      <div className="p-6 rounded-2xl glass-card"><div className="flex items-center justify-between mb-4"><span className="text-xs font-bold text-amber-400">Round {gameRound + 1} of {gameRounds.length}</span><span className="text-xs font-mono text-gray-500">{gameScore}/{gameRounds.length} correct</span></div><p className="text-sm text-gray-300 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: gameRounds[gameRound].scenario }} /><div className="space-y-2">{gameRounds[gameRound].options.map((opt, oi) => { const answered = gameAnswers[gameRound] !== null; const selected = gameAnswers[gameRound] === oi; const isCorrect = opt.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return (<div key={oi}><button onClick={() => handleGameAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt.text }} /></button>{answered && selected && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]"><p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`} dangerouslySetInnerHTML={{ __html: opt.explain }} /></motion.div>)}</div>); })}</div>{gameAnswers[gameRound] !== null && gameRound < gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5"><button onClick={() => setGameRound(r => r + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button></motion.div>)}{gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Outstanding \u2014 you understand payout optimisation as a business discipline, not just a percentage comparison.' : gameScore >= 3 ? 'Good \u2014 review the tax planning and compound vs withdraw sections.' : 'Re-read the longevity vs split and 30% tax rule sections. These directly impact your annual income.'}</p></motion.div>)}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Knowledge Check</p><h2 className="text-2xl font-extrabold mb-6">Final Quiz &mdash; 8 Questions</h2>
      <div className="space-y-6">{quizQuestions.map((q, qi) => (<div key={qi} className="p-5 rounded-2xl glass-card"><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p><p className="text-sm font-semibold text-white mb-4">{q.q}</p><div className="space-y-2">{q.opts.map((opt, oi) => { const answered = quizAnswers[qi] !== null; const selected = quizAnswers[qi] === oi; const isCorrect = oi === q.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return <button key={oi} onClick={() => handleQuizAnswer(qi, oi)} disabled={answered} className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`}>{opt}</button>; })}</div>{quizAnswers[qi] !== null && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg bg-white/[0.02]"><p className="text-xs text-amber-400" dangerouslySetInnerHTML={{ __html: `<span class="font-bold">&#9989;</span> ${q.explain}` }} /></motion.div>)}</div>))}</div>
      {quizDone && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center"><p className="text-3xl font-extrabold mb-2">{quizScoreVal}%</p><p className="text-sm text-gray-400">{quizScoreVal >= 66 ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate. Review and try again.'}</p></motion.div>)}
      {certUnlocked && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10"><div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}><div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(139,92,246,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} /><div className="relative z-10 text-center"><div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">&#128176;</div><p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p><p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 9: Payout Optimisation</strong><br />at ATLAS Academy by Interakktive</p><p className="bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Payout Strategist &mdash;</p><p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L9.11-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p></div></div></motion.div>)}</motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-20 text-center"><Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">&larr; Back to Academy</Link></section>
    </div>
  );
}
