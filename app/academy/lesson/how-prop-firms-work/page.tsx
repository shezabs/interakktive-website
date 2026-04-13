// app/academy/lesson/how-prop-firms-work/page.tsx
// ATLAS Academy — Lesson 9.2: How Prop Firms Actually Work [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 9
// GROUNDBREAKING: Prop Firm Business Model Simulator — revenue per 100 traders
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
const firmTypes = [
  { name: 'Evaluation-Based', emoji: '📋', color: '#3b82f6', examples: 'FTMO, FundingPips, MyFundedFX', fee: '\u00A3150\u2013\u00A3650', phases: '2 phases', pros: 'Cheapest entry, most established, clear rules, refundable fee on some firms', cons: 'Longest path to funding (30-60 days), strictest rules, time pressure on Phase 1', bestFor: 'Disciplined traders with proven consistency who can handle a structured evaluation' },
  { name: 'Instant Funding', emoji: '⚡', color: '#f59e0b', examples: 'Lux Trading Firm, The5ers (some tiers)', fee: '\u00A3300\u2013\u00A32,000+', phases: 'No challenge', pros: 'Immediate funded account, no evaluation stress, start earning day 1', cons: 'Much higher upfront cost, tighter drawdown limits, lower starting balance per pound spent, some firms have trailing DD', bestFor: 'Confident traders who want to skip evaluation but can afford higher entry cost' },
  { name: 'Accelerated / Hybrid', emoji: '🚀', color: '#22c55e', examples: 'Some FundingPips tiers, True Forex Funds', fee: '\u00A3200\u2013\u00A3800', phases: '1 phase', pros: 'Faster than 2-phase (pass once, get funded), moderate cost, scaling plans available', cons: 'Higher profit target on single phase (often 10%), less established than evaluation firms', bestFor: 'Traders who find 2-phase too slow but want structure, not just instant access' },
];

const survivalFunnel = [
  { stage: '100 traders buy challenge', count: 100, color: '#3b82f6', pct: '100%' },
  { stage: 'Complete minimum trading days', count: 72, color: '#8b5cf6', pct: '72%' },
  { stage: 'Pass Phase 1', count: 15, color: '#f59e0b', pct: '15%' },
  { stage: 'Pass Phase 2', count: 10, color: '#22c55e', pct: '10%' },
  { stage: 'Survive Month 1 funded', count: 7, color: '#06b6d4', pct: '7%' },
  { stage: 'Profitable after 6 months', count: 3, color: '#ec4899', pct: '3%' },
];

const revenueStreams = [
  { source: 'Challenge Fees (failed traders)', pct: 65, color: '#ef4444', desc: 'The 85-90% who fail pay \u00A3150-\u00A3650 each. This is the primary revenue engine. At \u00A3300 avg with 85% fail rate: \u00A325,500 per 100 traders.' },
  { source: 'Challenge Fees (successful traders)', pct: 10, color: '#f59e0b', desc: 'Even traders who pass still paid the fee. Some firms refund it with first payout, others do not. ~\u00A34,500 per 100 traders.' },
  { source: 'Profit Split (firm\'s 20-30%)', pct: 15, color: '#22c55e', desc: 'The firm\u2019s 20-30% cut from the 3-10 traders who remain profitable. Smaller but recurring revenue.' },
  { source: 'Re-Attempts & Resets', pct: 10, color: '#8b5cf6', desc: 'Failed traders buying new challenges. Many traders attempt 3-5 times before succeeding or quitting. This is repeat revenue from the same customer base.' },
];

const mythsVsReality = [
  { myth: 'Prop firms want you to succeed', reality: 'Firms profit whether you pass or fail. They are FINE with you succeeding (profit split is recurring revenue), but their model does not depend on it. The challenge fees from failures sustain the business.', verdict: 'HALF TRUE' },
  { myth: 'You are trading real capital', reality: 'Many firms use simulated or mirrored accounts for funded traders. Your "funded account" may not be a real brokerage account. The profits are real, but the underlying execution varies by firm. Some firms (FTMO, for example) do route real trades.', verdict: 'VARIES BY FIRM' },
  { myth: 'If you pass, you are set for life', reality: 'The funded account has the same drawdown rules as the challenge. One bad week can terminate your account permanently. You can go from funded to zero in a single day if you breach the daily drawdown. Funded is not forever.', verdict: 'FALSE' },
  { myth: 'Prop trading is risk-free because it is not your money', reality: 'Your risk is the challenge fee (\u00A3150-\u00A3650) plus the opportunity cost of time spent. You also risk psychological damage from repeated failures. The financial risk is capped, but it is not zero.', verdict: 'MOSTLY FALSE' },
];

const commonMistakes = [
  { title: 'Not Understanding the House Edge', mistake: '"The firm gave me a chance, I owe them." No. You paid for access. The firm earns \u00A325,000+ from every 100 traders in fees alone. This is a business transaction, not a favour.', fix: 'Think like a business: you are paying for access to capital. Calculate your expected ROI on the challenge fee. If positive expectancy, it is a good investment. If not, fix your trading first.' },
  { title: 'Ignoring How the Firm Makes Money', mistake: '"The lower the challenge fee, the better the deal." Sometimes the cheapest challenge has the strictest rules (2% daily DD instead of 5%), making it nearly impossible to pass.', fix: 'Compare the FULL economics: fee + rules + pass probability + payout structure. A \u00A3400 challenge with 5% daily DD may be easier to pass than a \u00A3200 challenge with 2% daily DD.' },
  { title: 'Thinking Simulated Accounts Do Not Matter', mistake: '"It is just demo money anyway so I will trade differently." Whether the backend is simulated or real, your PROFITS are real and your DRAWDOWN rules are enforced. Trade it exactly like real capital.', fix: 'Treat every funded account as real capital. The payout cheque is real. The account termination is real. The simulation backend is irrelevant to your behaviour.' },
  { title: 'Not Reading the Fine Print', mistake: '"I passed! Time to withdraw everything." Some firms require minimum trading days before payout, have withdrawal minimums, or take the challenge fee from your first payout.', fix: 'Read the FULL rules document before purchasing any challenge. Check: payout frequency, minimum trading days, withdrawal process, fee refund policy, consistency rules, scaling requirements.' },
];

const gameRounds = [
  { scenario: '<strong>The numbers:</strong> A prop firm charges \u00A3300 per challenge. Their published pass rate is 12%. You know that of the 12 who pass, typically 7 get funded, and only 3 remain profitable after 6 months. The firm takes a 20% profit split from funded traders who average \u00A32,000/month gross profit. What is the firm\u2019s approximate monthly revenue from 100 initial challenge purchases?', options: [
    { text: '\u00A330,000 from fees + \u00A31,200 from profit splits = \u00A331,200 total', correct: false, explain: 'The fee revenue is right (\u00A330,000). But the profit split calc needs work: 3 profitable traders \u00D7 \u00A32,000 gross \u00D7 20% firm share = \u00A31,200/month in splits. So \u00A330,000 one-time + \u00A31,200/month recurring. But many of those 100 traders will re-attempt, generating additional fee revenue. The total picture is more complex.' },
    { text: '\u00A330,000 from initial fees, plus recurring revenue from re-attempts and profit splits \u2014 the firm profits heavily regardless of trader success rates', correct: true, explain: 'Correct framing. \u00A330,000 from 100 initial purchases. Then ~40-50% of failed traders re-attempt (another \u00A310,200-\u00A312,750 in fees). Plus \u00A31,200/month from profit splits on the 3 survivors. The business model is profitable at EVERY stage. Understanding this removes the emotional "they want me to win" narrative.' },
    { text: 'The firm loses money because funding 12 accounts is more expensive than the \u00A330,000 in fees', correct: false, explain: 'The firm does not deposit real capital into most funded accounts. Many use simulated environments. The \u00A330,000 in fees is largely direct revenue with minimal cost per funded account. The firm\u2019s expenses are technology, customer support, and payouts to the ~3 profitable survivors.' },
  ]},
  { scenario: '<strong>Firm comparison:</strong> Firm A charges \u00A3200 with 3% daily DD and 6% overall DD. Firm B charges \u00A3400 with 5% daily DD and 10% overall DD. Both have a \u00A3100K account with 10% profit target. Your strategy averages 0.8% risk per trade. Which firm gives you a better chance of passing?', options: [
    { text: 'Firm A \u2014 it is cheaper, so less money at risk', correct: false, explain: 'Cheaper fee \u2260 better value. With 3% daily DD and 0.8% risk per trade, you can only lose ~3.7 trades in a day before breaching. With Firm B\u2019s 5% daily DD, you have room for ~6.2 losses. The extra breathing room dramatically increases your pass probability. The \u00A3200 you save is worthless if you fail.' },
    { text: 'Firm B \u2014 wider drawdown limits give significantly more room for normal trading variance, making the challenge mathematically easier to pass despite costing more', correct: true, explain: 'Exactly. At 0.8% risk, Firm A gives you 3.75 losing trades of daily DD buffer. Firm B gives you 6.25. That is 67% more breathing room. The overall DD (6% vs 10%) is even more dramatic. Your pass probability might be 25% at Firm B vs 10% at Firm A. Three attempts at Firm A (\u00A3600) vs one pass at Firm B (\u00A3400) means Firm B is actually cheaper in expected cost.' },
    { text: 'Both are equal \u2014 the profit target is the same so the challenge difficulty is the same', correct: false, explain: 'Same profit target does NOT mean same difficulty. The drawdown limits are the constraint that determines pass probability, not the target. A 10% target with 3% daily DD is dramatically harder than 10% with 5% daily DD. Think of it as climbing the same mountain but with different safety ropes.' },
  ]},
  { scenario: '<strong>The myth test:</strong> Your friend passed a prop challenge and says: "I am trading with \u00A3100K of the firm\u2019s real money now. They have \u00A3100K less in their account because they gave it to me." Is your friend correct?', options: [
    { text: 'Yes \u2014 the firm deposits real capital into your account when you pass', correct: false, explain: 'Most online prop firms do NOT deposit real capital. Many use simulated environments where your trades are mirrored or not executed at all. The firm\u2019s risk management is in the RULES (drawdown limits), not in capital allocation. Some firms (like FTMO) do route real trades through partnered brokers, but this varies significantly.' },
    { text: 'Not necessarily \u2014 many firms use simulated or mirrored accounts, but the profits you earn and the rules you follow are still real', correct: true, explain: 'Correct. Whether the backend is simulated or real, two things are absolutely real: (1) your payout cheques, and (2) the account termination if you breach rules. The backend execution model is a business decision by the firm, not something that should change your trading behaviour. Trade it like real capital regardless.' },
    { text: 'No \u2014 all prop firms are scams and none of them pay out', correct: false, explain: 'This is a conspiracy extreme. Major firms (FTMO, FundingPips, MyFundedFX) have verified payout records, public reviews, and regulatory relationships. The industry has some bad actors, but the established firms are legitimate businesses that pay profitable traders.' },
  ]},
  { scenario: '<strong>Revenue analysis:</strong> A firm advertises "90/10 profit split in your favour!" but charges \u00A3800 for a \u00A3100K challenge with a 3% daily drawdown limit (much tighter than the industry standard 5%). Why might this firm be MORE profitable for the firm than one offering 80/20 with standard 5% daily DD at \u00A3400?', options: [
    { text: 'Because the 90/10 split means traders earn more, so they trade more aggressively and fail more often', correct: false, explain: 'The split does not change trading behaviour in challenges (there is no payout during evaluation). The real driver is the drawdown limit: 3% daily DD dramatically increases the failure rate, generating MORE repeat challenge purchases at \u00A3800 each.' },
    { text: 'The tighter 3% daily DD massively increases the failure rate, so the firm collects \u00A3800 per attempt from far more failed traders \u2014 the generous split is irrelevant because fewer traders survive long enough to claim it', correct: true, explain: 'The maths: with 5% daily DD, perhaps 12% pass. With 3% daily DD, maybe 5% pass. On 100 traders: Firm A collects \u00A340,000 in fees with 95 failures. Firm B collects \u00A340,000 with 88 failures. Firm A has fewer funded traders to pay and collected the same total. The "90/10 split" is marketing \u2014 it attracts traders while the tight DD ensures most never reach a payout.' },
    { text: 'Because \u00A3800 is simply more than \u00A3400, so the firm makes more per challenge sold', correct: false, explain: 'Higher fee per challenge helps, but the real profit multiplier is the failure rate. If the \u00A3800 firm had the same 12% pass rate, they would need to pay out more traders at 90/10. The tight DD is the mechanism that makes the high fee AND generous split work together \u2014 for the firm.' },
  ]},
  { scenario: '<strong>Your decision:</strong> You have failed your first challenge (breached overall DD on day 18). The firm offers a "20% discount on your next attempt" if you re-purchase within 48 hours. You are frustrated and want to prove yourself. What should you do?', options: [
    { text: 'Take the discount and start immediately \u2014 you were close and just need one more try', correct: false, explain: 'This is exactly what the firm wants. The 48-hour pressure window is designed to capture emotional re-purchases. You are frustrated, you have not analysed WHY you failed, and you are about to trade under the same psychological conditions that caused the breach. This is the re-attempt trap.' },
    { text: 'Decline the discount. Analyse why you failed (strategy, execution, psychology, or variance), wait at least 1 week, demo trade to confirm the fix, then decide whether to re-attempt', correct: true, explain: 'Discipline over impulse. The 20% discount (\u00A360 saving on a \u00A3300 challenge) is irrelevant compared to the cost of another emotional failure (\u00A3240 + another month of time). Analyse, wait, fix, then decide. If the same failure pattern exists in demo, the next challenge will fail too \u2014 regardless of the discount.' },
    { text: 'Quit prop trading entirely \u2014 one failure proves it does not work', correct: false, explain: 'One failure is data, not a verdict. Most successful prop traders failed 2-3 challenges before passing. The question is not "did you fail?" but "do you know WHY?" If the failure was variance (bad luck within normal stats), re-attempt after a reset. If it was a systematic problem, fix it first.' },
  ]},
];

const quizQuestions = [
  { q: 'What is the primary revenue source for most online prop firms?', opts: ['Profit splits from funded traders', 'Challenge fees from all traders (especially the 85-90% who fail)', 'Subscription fees for platform access', 'Trading commissions on funded accounts'], correct: 1, explain: 'Challenge fees from all traders \u2014 particularly the 85-90% who fail \u2014 are the primary revenue engine. 100 traders at \u00A3300 = \u00A330,000. The profit split from the 3-10 survivors is secondary, recurring revenue.' },
  { q: 'What are the 3 main types of online prop firms?', opts: ['Forex, Crypto, and Equity firms', 'Evaluation-based (2-phase), Instant Funding, and Accelerated (1-phase)', 'Regulated, Unregulated, and Hybrid firms', 'Individual, Corporate, and Institutional firms'], correct: 1, explain: 'Evaluation-based (2-phase challenge, cheapest), Instant Funding (no challenge, expensive), and Accelerated/Hybrid (1-phase, mid-price). Each has different cost, time-to-funding, and rule structures.' },
  { q: 'Out of 100 traders who purchase a prop challenge, approximately how many remain profitable after 6 months?', opts: ['About 25-30', 'About 15-20', 'About 3-5', 'About 40-50'], correct: 2, explain: 'The survival funnel is brutal: ~15 pass Phase 1, ~10 pass Phase 2, ~7 survive Month 1 funded, and only ~3-5 remain profitable after 6 months. Your job is to be in that 3-5% through preparation, not luck.' },
  { q: 'Why might a firm offering a "generous" 90/10 split actually be MORE profitable for the firm?', opts: ['Because 90% of something is better than 80% of something', 'Because firms with generous splits often have tighter drawdown rules, increasing the failure rate so fewer traders ever reach a payout', 'Because 90/10 firms charge higher monthly fees', 'Because traders get overconfident with 90/10 splits and trade recklessly'], correct: 1, explain: 'The split is marketing. The drawdown limits are the mechanism. Tighter DD = higher failure rate = more fee revenue = fewer payouts needed. A "90/10 split" firm with 3% daily DD might pay out to fewer traders than an "80/20 split" firm with 5% daily DD.' },
  { q: 'Are you trading "real money" on a funded prop account?', opts: ['Always \u2014 the firm deposits real capital', 'Never \u2014 all prop firms are simulated', 'It varies by firm, but your profits and rules are real regardless of the backend', 'Only if you pay extra for a "real account" upgrade'], correct: 2, explain: 'Some firms route real trades, others use simulated environments. The backend varies. What does NOT vary: your payout cheques are real, your account termination is real, and your trading behaviour should be identical regardless.' },
  { q: 'After failing a challenge, a firm offers a 48-hour discount on re-attempts. What should you do?', opts: ['Take it immediately \u2014 discounts are rare and valuable', 'Decline, analyse the failure, wait at least a week, confirm the fix in demo, then decide', 'Report the firm for predatory marketing', 'Take the discount but wait a week to start the new challenge'], correct: 1, explain: 'The 48-hour window is designed to capture emotional re-purchases. The \u00A340-80 discount is irrelevant compared to the cost of another emotional failure. Analyse first, wait, fix, then decide with a clear head.' },
  { q: 'Why do prop firms have daily drawdown limits specifically?', opts: ['To limit how much profit you can make per day', 'To prevent a single bad day from destroying the account \u2014 it forces traders to stop before catastrophic losses', 'To make the challenge impossible to pass', 'Daily limits are optional at most firms'], correct: 1, explain: 'Daily DD is a circuit breaker. It prevents one emotional trading session from wiping out weeks of profits (or breaching overall DD). The limit forces you to STOP after a bad morning rather than revenge-trading into a blown account.' },
  { q: 'What is the most important factor when comparing prop firms?', opts: ['The cheapest challenge fee', 'The highest profit split percentage', 'Rule compatibility with your specific trading strategy and style', 'The largest available account size'], correct: 2, explain: 'A firm\u2019s rules must be compatible with YOUR strategy. If you trade news but the firm bans news trading, the 90/10 split is irrelevant. If your strategy needs overnight holds but the firm requires flat EOD, the cheap fee is wasted. Match rules to strategy, then compare price and split.' },
];

export default function HowPropFirmsWork() {
  const [scrollY, setScrollY] = useState(0);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [gameRound, setGameRound] = useState(0);
  const [gameAnswers, setGameAnswers] = useState<(number | null)[]>(Array(gameRounds.length).fill(null));
  const [gameScore, setGameScore] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(Array(quizQuestions.length).fill(null));
  const [showConfetti, setShowConfetti] = useState(false);
  const [certUnlocked, setCertUnlocked] = useState(false);
  /* Simulator state */
  const [simFee, setSimFee] = useState(300);
  const [simPassRate, setSimPassRate] = useState(12);
  const [simSurvival, setSimSurvival] = useState(30);
  const [simAvgProfit, setSimAvgProfit] = useState(2000);
  const [simSplit, setSimSplit] = useState(80);

  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);
  const toggle = (id: string) => setOpenSections(s => ({ ...s, [id]: !s[id] }));

  const handleGameAnswer = (oi: number) => { if (gameAnswers[gameRound] !== null) return; const a = [...gameAnswers]; a[gameRound] = oi; setGameAnswers(a); if (gameRounds[gameRound].options[oi].correct) setGameScore(s => s + 1); };
  const handleQuizAnswer = (qi: number, oi: number) => { if (quizAnswers[qi] !== null) return; const a = [...quizAnswers]; a[qi] = oi; setQuizAnswers(a); };

  const quizDone = quizAnswers.every(a => a !== null);
  const quizScoreVal = quizDone ? Math.round(quizAnswers.reduce<number>((s, a, i) => s + (a === quizQuestions[i].correct ? 1 : 0), 0) / quizQuestions.length * 100) : 0;
  useEffect(() => { if (quizDone && quizScoreVal >= 66 && !certUnlocked) { setCertUnlocked(true); setShowConfetti(true); const t = setTimeout(() => setShowConfetti(false), 4000); return () => clearTimeout(t); } }, [quizDone, quizScoreVal, certUnlocked]);

  /* Simulator calculations */
  const simTraders = 100;
  const simPassed = Math.round(simTraders * (simPassRate / 100));
  const simFailed = simTraders - simPassed;
  const simFunded = Math.round(simPassed * 0.7);
  const simSurvivors = Math.max(1, Math.round(simFunded * (simSurvival / 100)));
  const simFeeRevenue = simTraders * simFee;
  const simReAttemptRevenue = Math.round(simFailed * 0.45 * simFee);
  const simMonthlyPayout = simSurvivors * simAvgProfit * (simSplit / 100);
  const simFirmSplitRevenue = simSurvivors * simAvgProfit * ((100 - simSplit) / 100);
  const simTotalFirstMonth = simFeeRevenue + simReAttemptRevenue + simFirmSplitRevenue;

  /* ─── DRAW FUNCTIONS ─── */
  const drawFunnel = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const cx = w / 2;
    const cy = h / 2;
    const cycle = f % 360;
    const activeIdx = Math.floor(cycle / 60) % 6;
    const barMaxW = w - 80;
    const barH = (h - 60) / 6 - 4;
    const startY = 30;
    for (let i = 0; i < 6; i++) {
      const by = startY + i * (barH + 4);
      const ratio = survivalFunnel[i].count / 100;
      const bw = ratio * barMaxW;
      const bx = cx - bw / 2;
      const isActive = i === activeIdx;
      // Bar
      ctx.fillStyle = isActive ? survivalFunnel[i].color + 'cc' : survivalFunnel[i].color + '33';
      ctx.beginPath();
      const r = 4;
      ctx.moveTo(bx + r, by); ctx.lineTo(bx + bw - r, by);
      ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + r);
      ctx.lineTo(bx + bw, by + barH - r);
      ctx.quadraticCurveTo(bx + bw, by + barH, bx + bw - r, by + barH);
      ctx.lineTo(bx + r, by + barH);
      ctx.quadraticCurveTo(bx, by + barH, bx, by + barH - r);
      ctx.lineTo(bx, by + r);
      ctx.quadraticCurveTo(bx, by, bx + r, by);
      ctx.fill();
      // Count badge
      ctx.fillStyle = isActive ? '#fff' : 'rgba(255,255,255,0.5)';
      ctx.font = `bold ${isActive ? 13 : 10}px system-ui`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(`${survivalFunnel[i].count}`, cx, by + barH / 2);
      // Label
      ctx.fillStyle = isActive ? survivalFunnel[i].color : 'rgba(255,255,255,0.3)';
      ctx.font = `${isActive ? 'bold ' : ''}${isActive ? 9 : 8}px system-ui`;
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      const labelX = bx - 6;
      if (labelX > 10) ctx.fillText(survivalFunnel[i].pct, labelX, by + barH / 2);
      // Stage label (right)
      if (isActive) {
        ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = '8px system-ui';
        ctx.textAlign = 'left';
        const rightX = bx + bw + 6;
        if (rightX < w - 5) ctx.fillText(survivalFunnel[i].stage, rightX, by + barH / 2);
      }
    }
    // Title
    ctx.fillStyle = 'rgba(245,158,11,0.6)'; ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('The Survival Funnel: 100 Traders In, 3 Survivors Out', cx, 6);
  }, []);

  const drawRevenue = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const cx = w / 2;
    const cy = h / 2;
    const cycle = f % 480;
    const activeIdx = Math.floor(cycle / 120) % 4;
    // Pie chart
    const radius = Math.min(cx, cy) - 40;
    let startAngle = -Math.PI / 2;
    for (let i = 0; i < 4; i++) {
      const sweep = (revenueStreams[i].pct / 100) * Math.PI * 2;
      const isActive = i === activeIdx;
      const midAngle = startAngle + sweep / 2;
      const offset = isActive ? 6 : 0;
      const ox = Math.cos(midAngle) * offset;
      const oy = Math.sin(midAngle) * offset;
      ctx.beginPath();
      ctx.moveTo(cx + ox, cy + oy);
      ctx.arc(cx + ox, cy + oy, isActive ? radius + 4 : radius, startAngle, startAngle + sweep);
      ctx.closePath();
      ctx.fillStyle = isActive ? revenueStreams[i].color + 'cc' : revenueStreams[i].color + '44';
      ctx.fill();
      // Percentage label inside
      if (isActive) {
        const lx = cx + ox + Math.cos(midAngle) * (radius * 0.6);
        const ly = cy + oy + Math.sin(midAngle) * (radius * 0.6);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 14px system-ui';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(`${revenueStreams[i].pct}%`, lx, ly);
      }
      startAngle += sweep;
    }
    // Active label below
    ctx.fillStyle = revenueStreams[activeIdx].color; ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(revenueStreams[activeIdx].source, cx, h - 20);
    // Top label
    ctx.fillStyle = 'rgba(245,158,11,0.6)'; ctx.font = 'bold 9px system-ui';
    ctx.textBaseline = 'top'; ctx.fillText('Where the Money Comes From', cx, 6);
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

      {/* Hero */}
      <section className="min-h-[85vh] flex flex-col items-center justify-center text-center px-5 relative overflow-hidden">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(245,158,11,0.08),transparent_70%)] pointer-events-none" />
        <div className="absolute top-[-50px] right-[20%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(217,70,239,0.05),transparent_70%)] pointer-events-none" />
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="relative z-10">
          <motion.p variants={fadeUp} className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-4">Level 9 &middot; Lesson 2 of 14</motion.p>
          <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold leading-tight mb-4 bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>How Prop Firms Actually Work</motion.h1>
          <motion.p variants={fadeUp} className="text-gray-400 max-w-lg mx-auto text-sm leading-relaxed">The business model nobody explains. Why 85% fail, where the money goes, and how to think like a business when entering the prop world.</motion.p>
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.8 }} className="absolute bottom-8 flex flex-col items-center gap-2 text-gray-600 text-xs">Scroll to begin<motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-amber-500">&#8964;</motion.div></motion.div>
      </section>

      {/* S00 */}
      <section className="max-w-2xl mx-auto px-5 py-20"><motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">00 &mdash; Why This Matters</p><h2 className="text-2xl font-extrabold mb-4">Know the Game Before You Play</h2><div className="p-6 rounded-2xl glass-card space-y-4">
        <p className="text-sm text-gray-300 leading-relaxed">Most traders approach prop firms emotionally: &ldquo;They are giving me a chance to prove myself.&rdquo; That framing costs money. A prop firm is a <strong className="text-white">business</strong>. It makes money from challenge fees, profit splits, and re-attempts. Understanding this is not cynical &mdash; it is essential.</p>
        <p className="text-sm text-gray-300 leading-relaxed">When you understand the business model, you stop making emotional decisions. You choose firms based on rule compatibility, not price. You treat challenge fees as calculated investments, not lottery tickets. You analyse failures systematically instead of rage-repurchasing within 48 hours.</p>
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-purple-500/10 border border-amber-500/20"><p className="text-xs font-bold text-amber-400 mb-1">&#9889; REAL SCENARIO</p><p className="text-xs text-gray-300">A prop firm with 10,000 monthly challenge purchases at &pound;300 average collects <strong className="text-white">&pound;3,000,000/month in fees alone</strong>. If 12% pass and 3% survive 6 months, they pay out to ~300 traders. Even at &pound;2,000/month average payout, that is &pound;600,000 &mdash; a fraction of fee revenue. The model is profitable at every stage. Your job is to be in the profitable 3%, not to feel grateful for the &ldquo;opportunity.&rdquo;</p></div>
      </div></motion.div></section>

      {/* S01 — Canvas 1: Survival Funnel */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Survival Funnel</p><h2 className="text-2xl font-extrabold mb-2">100 In, 3 Out</h2><p className="text-gray-400 text-sm mb-4">Watch 100 traders enter the challenge pipeline. See where each group drops off. The brutal reality of the numbers.</p>
      <div className="rounded-2xl glass-card p-4"><AnimScene drawFn={drawFunnel} height={300} /></div></motion.div></section>

      {/* S02 — Canvas 2: Revenue Breakdown */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; Where the Money Goes</p><h2 className="text-2xl font-extrabold mb-2">The Firm&apos;s Revenue Model</h2><p className="text-gray-400 text-sm mb-4">Challenge fees from failures, fees from successes, profit splits, and re-attempts. Four income streams, one business.</p>
      <div className="rounded-2xl glass-card p-4"><AnimScene drawFn={drawRevenue} height={300} /></div></motion.div></section>

      {/* S03 — 3 Firm Types */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The 3 Firm Types</p><h2 className="text-2xl font-extrabold mb-4">Not All Prop Firms Are Built the Same</h2><div className="space-y-3">{firmTypes.map((ft, i) => (<div key={i}><button onClick={() => toggle(`ft-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{ft.emoji} {ft.name}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`ft-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`ft-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05] space-y-2"><p className="text-xs text-gray-500">Examples: {ft.examples}</p><p className="text-xs text-gray-400"><strong className="text-gray-300">Fee:</strong> {ft.fee} | <strong className="text-gray-300">Structure:</strong> {ft.phases}</p><p className="text-xs text-green-400">&#10004; {ft.pros}</p><p className="text-xs text-red-400">&#10060; {ft.cons}</p><p className="text-xs text-amber-400">Best for: {ft.bestFor}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      {/* S04 — Myths vs Reality */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Myths vs Reality</p><h2 className="text-2xl font-extrabold mb-4">What Most Traders Get Wrong</h2><div className="p-6 rounded-2xl glass-card space-y-3">{mythsVsReality.map((item, i) => (<div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold text-gray-200">&ldquo;{item.myth}&rdquo;</p><p className="text-xs text-gray-400 mt-1">{item.reality}</p></div><span className="text-[10px] font-bold px-2 py-1 rounded-lg shrink-0 bg-amber-500/15 border border-amber-500/30 text-amber-400">{item.verdict}</span></div></div>))}</div></motion.div></section>

      {/* S05 — GROUNDBREAKING: Business Model Simulator */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; See the Business Model</p><h2 className="text-2xl font-extrabold mb-2">&#127919; Prop Firm Business Model Simulator</h2><p className="text-gray-400 text-sm mb-4">Adjust the inputs and watch how the firm&apos;s revenue changes. Understand where YOU sit in the ecosystem.</p>
      <div className="p-6 rounded-2xl glass-card space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div><p className="text-[10px] text-amber-400 font-bold mb-1">Challenge Fee (&pound;)</p><input type="number" value={simFee} onChange={e => setSimFee(Math.max(50, Number(e.target.value)))} className="w-full p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-amber-500/40" /></div>
          <div><p className="text-[10px] text-amber-400 font-bold mb-1">Pass Rate (%)</p><input type="number" value={simPassRate} onChange={e => setSimPassRate(Math.max(1, Math.min(50, Number(e.target.value))))} className="w-full p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-amber-500/40" /></div>
          <div><p className="text-[10px] text-amber-400 font-bold mb-1">6-Mo Survival (%)</p><input type="number" value={simSurvival} onChange={e => setSimSurvival(Math.max(5, Math.min(100, Number(e.target.value))))} className="w-full p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-amber-500/40" /></div>
          <div><p className="text-[10px] text-amber-400 font-bold mb-1">Avg Monthly Profit</p><input type="number" value={simAvgProfit} onChange={e => setSimAvgProfit(Math.max(100, Number(e.target.value)))} className="w-full p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-amber-500/40" /></div>
          <div><p className="text-[10px] text-amber-400 font-bold mb-1">Trader Split (%)</p><input type="number" value={simSplit} onChange={e => setSimSplit(Math.max(50, Math.min(95, Number(e.target.value))))} className="w-full p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-amber-500/40" /></div>
        </div>
        {/* Funnel */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-xs font-bold text-gray-300 mb-2">Trader Funnel (per 100 purchases)</p>
          <div className="flex items-center gap-1 text-center flex-wrap">{[
            { label: 'Buy Challenge', val: simTraders, color: '#3b82f6' },
            { label: 'Pass', val: simPassed, color: '#f59e0b' },
            { label: 'Get Funded', val: simFunded, color: '#22c55e' },
            { label: 'Survive 6mo', val: simSurvivors, color: '#ec4899' },
          ].map((s, i) => (<div key={i} className="flex items-center gap-1">{i > 0 && <span className="text-gray-600 text-xs">&rarr;</span>}<div className="px-2 py-1 rounded-lg" style={{ background: s.color + '18', border: `1px solid ${s.color}33` }}><p className="text-lg font-extrabold" style={{ color: s.color }}>{s.val}</p><p className="text-[9px] text-gray-500">{s.label}</p></div></div>))}</div>
        </div>
        {/* Revenue breakdown */}
        <div className="space-y-2">
          <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15 flex justify-between items-center"><div><p className="text-xs font-bold text-red-400">Challenge Fee Revenue</p><p className="text-[10px] text-gray-500">{simTraders} traders &times; &pound;{simFee}</p></div><p className="text-sm font-extrabold text-red-400">&pound;{simFeeRevenue.toLocaleString()}</p></div>
          <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/15 flex justify-between items-center"><div><p className="text-xs font-bold text-purple-400">Re-Attempt Revenue (est.)</p><p className="text-[10px] text-gray-500">~45% of {simFailed} failed traders retry</p></div><p className="text-sm font-extrabold text-purple-400">&pound;{simReAttemptRevenue.toLocaleString()}</p></div>
          <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/15 flex justify-between items-center"><div><p className="text-xs font-bold text-green-400">Firm&apos;s Profit Split (monthly)</p><p className="text-[10px] text-gray-500">{simSurvivors} survivors &times; &pound;{simAvgProfit} &times; {100 - simSplit}%</p></div><p className="text-sm font-extrabold text-green-400">&pound;{simFirmSplitRevenue.toLocaleString()}/mo</p></div>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex justify-between items-center"><div><p className="text-xs font-bold text-amber-400">Total First-Month Revenue</p><p className="text-[10px] text-gray-500">Fees + re-attempts + split</p></div><p className="text-lg font-extrabold text-amber-400">&pound;{simTotalFirstMonth.toLocaleString()}</p></div>
        </div>
        {/* Trader payout comparison */}
        <div className="p-3 rounded-xl bg-gradient-to-r from-green-500/10 to-amber-500/10 border border-green-500/20 text-center"><p className="text-xs text-gray-400 mb-1">Total Paid to Surviving Traders</p><p className="text-lg font-extrabold text-green-400">&pound;{simMonthlyPayout.toLocaleString()}/month</p><p className="text-[10px] text-gray-500">to {simSurvivors} traders | Firm keeps &pound;{simFirmSplitRevenue.toLocaleString()}/mo | Firm collected &pound;{(simFeeRevenue + simReAttemptRevenue).toLocaleString()} in fees</p></div>
      </div></motion.div></section>

      {/* S06 — Revenue Streams Detail */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Revenue Streams</p><h2 className="text-2xl font-extrabold mb-4">The 4 Ways Firms Make Money</h2><div className="p-6 rounded-2xl glass-card space-y-3">{revenueStreams.map((rs, i) => (<div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong style={{ color: rs.color }}>{rs.source} ({rs.pct}%)</strong></p><p className="text-xs text-gray-400 mt-1">{rs.desc}</p></div>))}</div></motion.div></section>

      {/* S07 — What This Means For You */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; What This Means For You</p><h2 className="text-2xl font-extrabold mb-4">Thinking Like a Business</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#22c55e]">THE CHALLENGE FEE IS AN INVESTMENT</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Not a lottery ticket. Calculate expected ROI: if your pass probability is 30% and funded income is &pound;2,000/month, expected value of a &pound;300 challenge = (0.3 &times; &pound;2,000 &times; 6 months) &minus; &pound;300 = &pound;3,300. Positive EV = good business decision.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#3b82f6]">RULES ARE THE FIRM&apos;S RISK MANAGEMENT</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Daily drawdown, overall drawdown, and consistency requirements exist to protect the firm. Understanding this means you stop seeing rules as obstacles and start seeing them as the parameters of your business contract.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">THE FIRM PROFITS FROM YOUR FAILURE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">This is not malicious &mdash; it is the business model. Gyms profit from members who do not show up. Firms profit from traders who do not pass. Your advantage: unlike gym members, you have ATLAS Levels 1-8 behind you.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#FFB300]">RE-ATTEMPTS ARE THE HIDDEN COST</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">45% of failed traders re-attempt within a month. The firm knows this. Discounts, urgency windows, and &ldquo;retry offers&rdquo; are designed for emotional repurchasing. Wait. Analyse. Fix. Then decide.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">THE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">The firm is your business partner, not your benefactor. Both sides profit when you succeed. But only YOUR side loses when you fail. Treat every decision accordingly.</span></p></div>
      </div></motion.div></section>

      {/* S08 — Common Mistakes */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p><h2 className="text-2xl font-extrabold mb-4">4 Business Model Errors</h2><div className="space-y-3">{commonMistakes.map((item, i) => (<div key={i}><button onClick={() => toggle(`cm-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`cm-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`cm-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-xs text-red-400 mb-2">&#10060; {item.mistake}</p><p className="text-xs text-green-400">&#10004; {item.fix}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      {/* S09 — Cheat Sheet */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Cheat Sheet</p><h2 className="text-2xl font-extrabold mb-4">Business Model Quick Reference</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#ef4444]">85-90% FAIL</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">This is the primary revenue engine. Challenge fees from failures fund the business. Your job: be in the 10-15% who pass, then the 3-5% who survive.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#3b82f6]">3 FIRM TYPES</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Evaluation (cheapest, slowest, strictest), Instant (expensive, immediate, tighter DD), Accelerated (mid-price, 1-phase, faster). Choose based on your strategy needs, not price.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#22c55e]">SIMULATED &ne; FAKE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Many firms use simulated accounts. Your payouts are real. Your rules are enforced. The backend is irrelevant to your behaviour. Trade it like real capital.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#f59e0b]">WAIT BEFORE RE-ATTEMPTING</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Minimum 1 week after failure. Analyse why. Fix in demo. THEN decide. The 48-hour discount is designed for emotional purchases, not rational ones.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">THE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">The firm is your business partner, not your benefactor. Both sides profit from your success. Only YOU lose from your failure. Every decision should reflect this asymmetry.</span></p></div>
      </div></motion.div></section>

      {/* S10 — Game */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Test Your Understanding</p><h2 className="text-2xl font-extrabold mb-2">Business Model Challenge</h2><p className="text-gray-400 text-sm mb-6">5 scenario-based rounds. Think like a business, not a hopeful applicant.</p>
      <div className="p-6 rounded-2xl glass-card"><div className="flex items-center justify-between mb-4"><span className="text-xs font-bold text-amber-400">Round {gameRound + 1} of {gameRounds.length}</span><span className="text-xs font-mono text-gray-500">{gameScore}/{gameRounds.length} correct</span></div><p className="text-sm text-gray-300 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: gameRounds[gameRound].scenario }} /><div className="space-y-2">{gameRounds[gameRound].options.map((opt, oi) => { const answered = gameAnswers[gameRound] !== null; const selected = gameAnswers[gameRound] === oi; const isCorrect = opt.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return (<div key={oi}><button onClick={() => handleGameAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt.text }} /></button>{answered && selected && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]"><p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`} dangerouslySetInnerHTML={{ __html: opt.explain }} /></motion.div>)}</div>); })}</div>{gameAnswers[gameRound] !== null && gameRound < gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5"><button onClick={() => setGameRound(r => r + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button></motion.div>)}{gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Outstanding \u2014 you understand the prop business model like a business owner, not a hopeful applicant.' : gameScore >= 3 ? 'Good \u2014 review the revenue analysis and firm comparison scenarios to sharpen your business thinking.' : 'Re-read the business model and myths sections. Understanding the economics is non-negotiable before spending on a challenge.'}</p></motion.div>)}</div></motion.div></section>

      {/* S11 — Quiz + Certificate */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Knowledge Check</p><h2 className="text-2xl font-extrabold mb-6">Final Quiz &mdash; 8 Questions</h2>
      <div className="space-y-6">{quizQuestions.map((q, qi) => (<div key={qi} className="p-5 rounded-2xl glass-card"><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p><p className="text-sm font-semibold text-white mb-4">{q.q}</p><div className="space-y-2">{q.opts.map((opt, oi) => { const answered = quizAnswers[qi] !== null; const selected = quizAnswers[qi] === oi; const isCorrect = oi === q.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return <button key={oi} onClick={() => handleQuizAnswer(qi, oi)} disabled={answered} className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`}>{opt}</button>; })}</div>{quizAnswers[qi] !== null && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg bg-white/[0.02]"><p className="text-xs text-amber-400" dangerouslySetInnerHTML={{ __html: `<span class="font-bold">&#9989;</span> ${q.explain}` }} /></motion.div>)}</div>))}</div>
      {quizDone && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center"><p className="text-3xl font-extrabold mb-2">{quizScoreVal}%</p><p className="text-sm text-gray-400">{quizScoreVal >= 66 ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate. Review and try again.'}</p></motion.div>)}
      {certUnlocked && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10"><div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}><div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(139,92,246,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} /><div className="relative z-10 text-center"><div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">&#127970;</div><p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p><p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 9: How Prop Firms Actually Work</strong><br />at ATLAS Academy by Interakktive</p><p className="bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Prop Realist &mdash;</p><p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L9.2-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p></div></div></motion.div>)}</motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-20 text-center"><Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">&larr; Back to Academy</Link></section>
    </div>
  );
}
