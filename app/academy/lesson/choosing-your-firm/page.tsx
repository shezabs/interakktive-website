// app/academy/lesson/choosing-your-firm/page.tsx
// ATLAS Academy — Lesson 9.3: Choosing Your Firm [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 9
// GROUNDBREAKING: Prop Firm Match Engine — strategy stats → personalised firm recommendation
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
const ruleCategories = [
  { name: 'Daily Drawdown', icon: '📉', archetypes: ['5% (standard)', '4% (moderate)', '3% (strict)', '5% + trailing'], desc: 'The single most important rule. Resets daily. Determines how many losing trades you survive before the day ends your account.', importance: 'CRITICAL' },
  { name: 'Overall Drawdown', icon: '📊', archetypes: ['10% from balance', '8% from balance', '10% trailing from equity', '6% trailing'], desc: 'The ceiling above your head. Static (from starting balance) is far more forgiving than trailing (from highest equity). Trailing DD is the silent account killer.', importance: 'CRITICAL' },
  { name: 'Profit Target', icon: '🎯', archetypes: ['8% Phase 1 / 5% Phase 2', '10% Phase 1 / 5% Phase 2', '10% single phase', '6% Phase 1 / 4% Phase 2'], desc: 'How much you need to make to pass. Lower target = less pressure. But a lower target with tighter DD can be harder than a higher target with wider DD.', importance: 'HIGH' },
  { name: 'Time Limit', icon: '⏱️', archetypes: ['30 days', '45 days', '60 days', 'Unlimited'], desc: 'Unlimited is always better. Time limits create psychological pressure that causes rushed entries and over-trading. If you have the choice, always choose unlimited.', importance: 'HIGH' },
  { name: 'News Trading', icon: '📰', archetypes: ['Allowed', 'Restricted (2 min buffer)', 'Banned during Tier 1', 'Fully banned'], desc: 'If your strategy uses news reactions (even avoiding them), verify the firm\u2019s rules. Some firms auto-close trades opened within 2 minutes of high-impact events.', importance: 'MEDIUM' },
  { name: 'Weekend / Overnight', icon: '🌙', archetypes: ['Hold allowed', 'Must close Friday', 'Must close daily (EOD flat)', 'Hold with swap fees'], desc: 'If you swing trade or hold positions for days, this is a deal-breaker. Day traders can ignore this. Position traders cannot.', importance: 'STYLE-DEPENDENT' },
];

const redFlags = [
  { flag: 'No Verifiable Payout Proof', severity: 'CRITICAL', color: '#ef4444', desc: 'If a firm cannot show verified payouts (Trustpilot, public records, community evidence), do not give them money. Legitimate firms are proud of payouts and showcase them.' },
  { flag: 'Trailing Drawdown from Highest Equity', severity: 'DANGER', color: '#ef4444', desc: 'Your DD limit MOVES UP as your equity rises but NEVER moves back down. Make \u00A35K profit and your new DD floor is \u00A35K above original. One pullback from highs = breach, even if you are still in overall profit.' },
  { flag: 'Daily DD Includes Unrealised P&L', severity: 'DANGER', color: '#f97316', desc: 'Some firms count open (unrealised) losses toward your daily DD. Three open positions each at -0.8% = 2.4% daily DD used even though you have not closed anything. This is the hidden killer.' },
  { flag: 'Minimum Trading Days Above 10', severity: 'WARNING', color: '#f59e0b', desc: 'If you need 10+ trading days, you cannot pass by having a few excellent days. This forces you to trade on days when there are no setups, leading to forced trades and unnecessary losses.' },
  { flag: 'Payout Delays or Minimum Withdrawals', severity: 'WARNING', color: '#f59e0b', desc: 'Some firms require \u00A3500+ minimum withdrawal or process payouts only monthly. This affects your cash flow. Check the payout terms before purchasing.' },
  { flag: 'Restricted Instruments During News', severity: 'CHECK', color: '#3b82f6', desc: 'Not a red flag for everyone, but if you trade Gold or forex majors around NFP/FOMC, auto-restrictions can close your positions without warning. Know exactly what is restricted and when.' },
];

const evaluationChecklist = [
  { category: 'Rules', questions: ['What is the daily drawdown? Does it include open P&L?', 'Is the overall drawdown static (from balance) or trailing (from equity)?', 'Are there minimum trading days?', 'Can I hold overnight and over weekends?', 'Can I trade during news events?'] },
  { category: 'Costs', questions: ['What is the challenge fee?', 'Is the fee refunded with the first payout?', 'Are there recurring monthly fees after funding?', 'What is the cost per re-attempt?', 'Is there a reset option (cheaper than full re-purchase)?'] },
  { category: 'Payouts', questions: ['What is the profit split? Does it scale?', 'How often can I withdraw (bi-weekly, monthly)?', 'What is the minimum withdrawal amount?', 'How long does payout processing take?', 'Is there a payout history I can verify?'] },
  { category: 'Scaling', questions: ['Is there a scaling plan for account growth?', 'What are the requirements to scale up?', 'Can I run multiple accounts simultaneously?', 'What is the maximum account size available?', 'Do rules change at higher account sizes?'] },
];

const commonMistakes = [
  { title: 'Choosing the Cheapest Firm', mistake: '"This firm is \u00A3100 cheaper so I will go there." The cheapest challenge often has 3% daily DD, trailing overall DD, or mandatory EOD flat rules. You save \u00A3100 upfront but your pass probability drops from 15% to 5%.', fix: 'Compare expected cost to pass, not challenge fee. If firm A costs \u00A3400 with 15% pass rate, expected cost = \u00A3400/0.15 = \u00A32,667. If firm B costs \u00A3250 with 5% pass rate, expected cost = \u00A3250/0.05 = \u00A35,000. The "cheap" firm costs nearly double.' },
  { title: 'Ignoring the Drawdown Type', mistake: '"10% drawdown is 10% drawdown." No. Static 10% from starting balance means your floor never moves. Trailing 10% from highest equity means every pip of profit raises your floor. Make \u00A38K then pull back \u00A33K = safe on static, BREACHED on trailing.', fix: 'Always prioritise static drawdown over trailing. If a firm offers trailing DD, reduce your expected pass rate by 30-40% compared to the same percentage with static DD. The maths is dramatically different.' },
  { title: 'Not Checking News Rules Before Purchasing', mistake: '"I will just not trade during news." But what if the firm auto-closes any trade opened within 2 minutes of a high-impact event? What if your stop gets hit by a news spike and the firm retroactively invalidates the trade? What if Gold spreads widen to 40 pips and your stop triggers inside the widened spread?', fix: 'Read the complete news trading policy BEFORE purchasing. If you trade Gold, forex, or indices, news rules are non-negotiable. If unsure, email support and get a written answer.' },
  { title: 'Falling for Marketing Over Substance', mistake: '"This firm has amazing Instagram content and influencer sponsorships." Marketing budget has zero correlation with payout reliability. Some of the best firms have minimal marketing. Some of the worst have the loudest presence.', fix: 'Judge firms by: verified payout records, rule clarity, community reputation (Trustpilot, ForexPeaceArmy, Reddit), and how long they have been operating. Ignore influencer endorsements entirely \u2014 they are paid promotions.' },
];

const gameRounds = [
  { scenario: '<strong>Strategy match:</strong> Your strategy trades Gold (XAUUSD) during London and New York sessions. You hold trades for 2-6 hours. You trade around news events (your Level 8 macro skills). Your average hold time means you sometimes hold through lunch. Firm A: \u00A3300, 5% daily DD, news trading allowed, overnight allowed. Firm B: \u00A3200, 4% daily DD, news restricted (2-min buffer), must close all by session end. Which firm?', options: [
    { text: 'Firm B \u2014 cheaper and I can adapt to the restrictions', correct: false, explain: 'The restrictions are deal-breakers for your strategy. News trading restricted means your Level 8 macro edge is neutralised. Must-close-by-session-end kills your 2-6 hour holds. You would need to fundamentally change your strategy to fit Firm B\u2019s rules. That is a different strategy with unknown performance.' },
    { text: 'Firm A \u2014 every rule is compatible with my strategy, the \u00A3100 extra is worth keeping my edge intact', correct: true, explain: 'Perfect match. 5% daily DD gives breathing room for Gold\u2019s volatility. News trading allowed means your macro skills are an asset. Overnight holding supports your 2-6 hour average. You trade YOUR strategy, not a modified version. The extra \u00A3100 protects the integrity of your proven edge.' },
    { text: 'Either firm works \u2014 the rules do not matter much if you are a good trader', correct: false, explain: 'Rules absolutely matter. A "good trader" trading a restricted version of their strategy is no longer trading their proven system. Your win rate, R:R, and edge data are based on your CURRENT strategy. Change the strategy to fit rules and all that data becomes irrelevant.' },
  ]},
  { scenario: '<strong>Drawdown trap:</strong> You are comparing two firms. Both have \u00A3100K accounts and 10% profit targets. Firm A: 5% daily DD, 10% overall DD (STATIC from starting balance). Firm B: 5% daily DD, 10% overall DD (TRAILING from highest equity). You reach \u00A3107,000 equity on Day 12 then pull back to \u00A3103,000. What happens at each firm?', options: [
    { text: 'Both firms: you are fine with \u00A33K profit remaining and 7K until overall DD breach', correct: false, explain: 'Only true for Firm A. At Firm B with trailing DD, your floor MOVED UP when equity hit \u00A3107K. New floor = \u00A397,000 (\u00A3107K minus 10%). Your current equity is \u00A3103K, which is \u00A36K above the trailing floor. You lost \u00A34K of buffer without realising it.' },
    { text: 'Firm A: safe (\u00A33K profit, floor is \u00A390K). Firm B: reduced buffer (\u00A33K profit, but floor rose to \u00A397K from the \u00A3107K peak, leaving only \u00A36K buffer instead of the original \u00A310K)', correct: true, explain: 'Exactly. Firm A (static): floor stays at \u00A390K forever. You have \u00A313K of room. Firm B (trailing): floor followed equity to \u00A397K (\u00A3107K peak minus 10%). You now have only \u00A36K of room. The pullback from \u00A3107K to \u00A3103K "used" \u00A34K of your DD buffer permanently. This is why trailing DD is dramatically harder.' },
    { text: 'Firm B is better because the trailing DD means you have already locked in some profit', correct: false, explain: 'Trailing DD does NOT lock in profit for you. It locks in a higher FLOOR that you can never go below. It protects the FIRM, not you. The higher floor means less room for drawdowns, making your challenge harder, not safer.' },
  ]},
  { scenario: '<strong>The reset offer:</strong> You failed a challenge at Firm A on Day 22 (breached overall DD at -8.5%). The firm offers two options: (1) Buy a new full challenge for \u00A3400, or (2) Pay \u00A3150 for a "reset" which restarts the same challenge from Day 1 with the same rules. Which do you choose and why?', options: [
    { text: 'Always take the reset \u2014 it is \u00A3250 cheaper', correct: false, explain: 'The reset is cheaper, but the question should be: WHY did you fail? If the failure was a systematic problem (strategy does not fit the rules, or psychology under challenge pressure), a reset puts you right back into the same losing situation. The \u00A3250 saving is wasted if you fail again.' },
    { text: 'It depends: if the failure was variance/bad luck, take the reset. If it was a systematic problem (strategy mismatch, psychology), take the full repurchase ONLY after fixing the issue \u2014 or switch firms entirely', correct: true, explain: 'The right framework. Reset = good value IF the failure was within normal variance and your strategy is genuinely compatible with the rules. New purchase or firm switch = necessary if the failure revealed a fundamental mismatch. Spending \u00A3150 on a reset when the problem is the firm\u2019s rules is throwing money away.' },
    { text: 'Switch to a completely different firm \u2014 clearly this one does not work for you', correct: false, explain: 'One failure does not prove the firm is wrong. The challenge might be well-suited to your strategy and the failure was normal variance. Only switch firms if the failure revealed a rule incompatibility you did not recognise before.' },
  ]},
  { scenario: '<strong>Red flag detection:</strong> A new firm launches with a flashy website and influencer sponsorships. They offer a \u00A3200K account for just \u00A3350 (much cheaper than competitors). Rules: 5% daily DD, 8% overall DD (trailing), 90/10 split, bi-weekly payouts. Minimum 15 trading days. You see 3 Trustpilot reviews (all 5 stars, posted the same week the firm launched). Should you buy?', options: [
    { text: 'Yes \u2014 the price is amazing and the 90/10 split is the best I have seen', correct: false, explain: 'Multiple red flags: (1) trailing DD at only 8% is extremely tight, (2) 15 minimum trading days forces unnecessary trades, (3) only 3 reviews posted the same week screams fake/planted reviews, (4) new firm with no payout history. The low price and generous split are the bait \u2014 the trailing 8% DD is the trap.' },
    { text: 'No \u2014 trailing 8% overall DD is extremely tight, 15 minimum days forces over-trading, no verifiable payout history, and planted-looking reviews are red flags', correct: true, explain: 'Every red flag identified. Trailing 8% DD means the moment you make \u00A34K profit, your floor rises \u00A34K. Any pullback from highs eats your buffer permanently. 15 minimum days means trading on days with no setups. No payout history on a new firm is the biggest risk. The \u00A3350 price is meaningless if you cannot pass or cannot withdraw.' },
    { text: 'Wait 6 months and check again \u2014 the firm might be legitimate but is too new to trust', correct: false, explain: 'Waiting is smart, but the trailing 8% DD and 15-day minimum are structural problems that will not improve with time. Even if the firm is legitimate, the rules are too restrictive for most strategies. The red flags are in the RULES, not just the firm\u2019s age.' },
  ]},
  { scenario: '<strong>Final selection:</strong> After your research, you narrow to two firms. Firm X: \u00A3350, 5% daily DD (includes open P&L), 10% static overall DD, 10% target, 30-day limit, 80/20 split scaling to 90/10. Firm Y: \u00A3450, 5% daily DD (closed trades only), 10% static overall DD, 8% target, unlimited time, 80/20 split. You run 2-3 trades/day. Which firm?', options: [
    { text: 'Firm X \u2014 cheaper with a scaling split that reaches 90/10', correct: false, explain: 'The hidden killer: "includes open P&L" on daily DD. If you run 2-3 trades, your open positions count against daily DD even before closing. Three positions each at -0.5% unrealised = 1.5% daily DD used from open trades alone. Plus the 30-day time limit adds pressure. The scaling split is irrelevant if you fail before reaching it.' },
    { text: 'Firm Y \u2014 the "closed trades only" daily DD is a massive advantage for a multi-position trader, the lower 8% target reduces pressure, and unlimited time removes the rushing incentive', correct: true, explain: 'Three structural advantages: (1) daily DD on closed trades only means your 2-3 open positions do not count until you close them, giving you much more breathing room, (2) 8% target vs 10% means fewer trades needed to pass, and (3) unlimited time eliminates the pressure that causes rushed entries. The extra \u00A3100 buys dramatically better odds of passing.' },
    { text: 'Both are acceptable \u2014 the differences are minor', correct: false, explain: 'The differences are NOT minor. "Includes open P&L" vs "closed trades only" on daily DD is a fundamental change in how much risk you can take per day. For a trader running 2-3 concurrent positions, this single rule difference can change pass probability by 15-20%.' },
  ]},
];

const quizQuestions = [
  { q: 'What is the MOST important rule to check when evaluating a prop firm?', opts: ['The profit target percentage', 'The daily drawdown limit and whether it includes unrealised P&L', 'The challenge fee', 'The profit split percentage'], correct: 1, explain: 'Daily drawdown is the #1 account killer. Whether it includes open P&L is the hidden variable that changes everything. A 5% daily DD that includes unrealised losses is dramatically tighter than 5% on closed trades only.' },
  { q: 'What is the difference between STATIC and TRAILING overall drawdown?', opts: ['Static is measured daily, trailing is measured weekly', 'Static stays at a fixed level from starting balance; trailing rises with your highest equity and never comes back down', 'There is no real difference \u2014 both measure from your starting balance', 'Static applies to demo accounts, trailing applies to funded accounts'], correct: 1, explain: 'Static floor = starting balance minus DD%. It never moves. Trailing floor = highest equity minus DD%. Every new equity high permanently raises your floor. A pullback from highs eats DD buffer permanently. Trailing is dramatically harder to survive.' },
  { q: 'Why is "daily DD includes open P&L" dangerous for multi-position traders?', opts: ['It means you pay more commission on open trades', 'Unrealised losses on open positions count toward your daily limit, so 3 open trades each at -0.5% uses 1.5% of your daily DD before you close anything', 'It forces you to close all trades before end of day', 'It does not actually affect your trading \u2014 only closed losses matter'], correct: 1, explain: 'With 3 open positions each at -0.5% unrealised, you have already used 1.5% of a 5% daily DD limit. One more adverse tick and you are at risk of breach \u2014 even though you have not realised any losses. For multi-position traders, this rule alone can change pass probability by 15-20%.' },
  { q: 'What should you check BEFORE buying any prop challenge?', opts: ['Only the price and the profit split', 'The full rules document, verified payout records, news trading policy, drawdown type, time limits, and community reputation', 'The firm\u2019s social media following', 'Whether influencers recommend the firm'], correct: 1, explain: 'Every rule matters: drawdown type (static vs trailing), DD calculation (open P&L or not), time limits, news policy, overnight/weekend rules, minimum trading days, payout schedule, and verified payout proof. Social media and influencer endorsements are marketing, not due diligence.' },
  { q: 'A firm offers a 90/10 profit split but has 3% daily DD and trailing overall DD. Is this a good deal?', opts: ['Yes \u2014 90/10 is the best split available', 'No \u2014 the tight 3% daily DD and trailing overall DD will cause most traders to fail before ever reaching a payout, making the split irrelevant', 'It depends on how fast you can reach the profit target', 'Only if you are an experienced prop trader'], correct: 1, explain: 'The split is marketing bait. 3% daily DD means ~3.7 losing trades at 0.8% risk before daily breach. Trailing DD permanently reduces your buffer with every pullback from highs. Your pass probability might be 3-5% instead of 12-15% with standard rules. A 90% share of nothing is still nothing.' },
  { q: 'When should you consider a prop firm RESET instead of buying a new challenge?', opts: ['Always \u2014 resets are cheaper', 'Only when the failure was due to normal variance and your strategy is genuinely compatible with the firm\u2019s rules', 'Never \u2014 resets are a waste of money', 'When the firm offers a discount on the reset'], correct: 1, explain: 'Reset = good value when: (1) your strategy fits the rules, (2) the failure was variance not systematic, and (3) you have confirmed in demo that the approach works. Reset = bad value when: the failure revealed a rule mismatch or psychological problem that the reset does not fix.' },
  { q: 'How should you calculate the TRUE cost of a prop firm, beyond the challenge fee?', opts: ['Challenge fee + platform subscription costs', 'Expected cost = Challenge fee \u00F7 your estimated pass probability, accounting for re-attempts', 'Challenge fee + taxes on future profits', 'Just the challenge fee \u2014 that is the only cost'], correct: 1, explain: 'Expected cost = Fee \u00F7 Pass Probability. A \u00A3400 challenge with 15% pass rate = \u00A32,667 expected cost. A \u00A3250 challenge with 5% pass rate = \u00A35,000 expected cost. The "cheap" firm costs nearly double when you account for re-attempts. Always think in terms of expected value.' },
  { q: 'What is the #1 reason to choose Firm A over cheaper Firm B?', opts: ['Better website design', 'Firm A\u2019s rules are more compatible with your specific trading strategy', 'Firm A has more Instagram followers', 'Firm A offers a bigger starting balance'], correct: 1, explain: 'Rule compatibility with YOUR strategy is everything. Your win rate, R:R, and edge data are based on your current strategy. A firm whose rules force you to modify that strategy invalidates all your performance data. Choose the firm that lets you trade YOUR proven system, not a compromised version of it.' },
];

/* ─── MATCH ENGINE STATE TYPES ─── */
type MatchInputs = {
  winRate: string; avgRR: string; tradesPerDay: string;
  instruments: string[]; tradesNews: string; holdsOvernight: string;
  avgHoldTime: string; riskTolerance: string;
};

const defaultMatch: MatchInputs = {
  winRate: '', avgRR: '', tradesPerDay: '',
  instruments: [], tradesNews: '', holdsOvernight: '',
  avgHoldTime: '', riskTolerance: '',
};

export default function ChoosingYourFirm() {
  const [scrollY, setScrollY] = useState(0);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [gameRound, setGameRound] = useState(0);
  const [gameAnswers, setGameAnswers] = useState<(number | null)[]>(Array(gameRounds.length).fill(null));
  const [gameScore, setGameScore] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(Array(quizQuestions.length).fill(null));
  const [showConfetti, setShowConfetti] = useState(false);
  const [certUnlocked, setCertUnlocked] = useState(false);
  const [match, setMatch] = useState<MatchInputs>(defaultMatch);
  const [matchResult, setMatchResult] = useState(false);

  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);
  const toggle = (id: string) => setOpenSections(s => ({ ...s, [id]: !s[id] }));

  const handleGameAnswer = (oi: number) => { if (gameAnswers[gameRound] !== null) return; const a = [...gameAnswers]; a[gameRound] = oi; setGameAnswers(a); if (gameRounds[gameRound].options[oi].correct) setGameScore(s => s + 1); };
  const handleQuizAnswer = (qi: number, oi: number) => { if (quizAnswers[qi] !== null) return; const a = [...quizAnswers]; a[qi] = oi; setQuizAnswers(a); };

  const quizDone = quizAnswers.every(a => a !== null);
  const quizScoreVal = quizDone ? Math.round(quizAnswers.reduce<number>((s, a, i) => s + (a === quizQuestions[i].correct ? 1 : 0), 0) / quizQuestions.length * 100) : 0;
  useEffect(() => { if (quizDone && quizScoreVal >= 66 && !certUnlocked) { setCertUnlocked(true); setShowConfetti(true); const t = setTimeout(() => setShowConfetti(false), 4000); return () => clearTimeout(t); } }, [quizDone, quizScoreVal, certUnlocked]);

  /* ─── MATCH ENGINE LOGIC ─── */
  const generateMatch = () => {
    const dealBreakers: string[] = [];
    const requirements: string[] = [];
    const recommendations: string[] = [];
    let firmType = 'Standard Evaluation (2-Phase)';
    let ddPref = '5% daily DD (standard)';
    let overallPref = 'Static overall DD (from starting balance)';
    const multiPos = Number(match.tradesPerDay) >= 2;
    if (match.tradesNews === 'yes') { requirements.push('News trading MUST be allowed \u2014 no buffers, no restrictions'); dealBreakers.push('Any firm that restricts or bans news trading'); }
    if (match.holdsOvernight === 'yes') { requirements.push('Overnight and weekend holding must be permitted'); dealBreakers.push('Any firm requiring EOD flat or no weekend holds'); }
    if (multiPos) { requirements.push('Daily DD should be calculated on CLOSED trades only (not open P&L)'); recommendations.push('With ' + match.tradesPerDay + ' trades/day, open P&L inclusion on daily DD is extremely dangerous. Prioritise firms with closed-trade-only DD calculation.'); }
    if (match.riskTolerance === 'conservative') { ddPref = '5% daily DD (you need the full standard buffer)'; firmType = 'Standard Evaluation (2-Phase) with unlimited time'; recommendations.push('Conservative risk tolerance \u2192 choose firms with unlimited time limits and the widest possible drawdown buffers.'); }
    if (match.riskTolerance === 'aggressive') { firmType = 'Accelerated (1-Phase) or standard with higher profit target'; recommendations.push('Aggressive risk tolerance \u2192 consider 1-phase challenges to get funded faster, but watch the DD limits carefully \u2014 your aggression is an asset only if the rules accommodate it.'); }
    if (match.instruments.includes('Gold (XAUUSD)')) { recommendations.push('Gold has higher volatility \u2014 ensure at least 5% daily DD. Firms with 3-4% DD and Gold trading are extremely difficult.'); }
    if (match.instruments.includes('Indices (NASDAQ/US30)')) { recommendations.push('Index trading during US session means high volatility windows. Verify the firm allows index trading and check spread conditions.'); }
    if (match.avgHoldTime === 'intraday-long') { requirements.push('Firm should allow multi-hour holds without EOD-flat requirements'); }
    if (match.avgHoldTime === 'swing') { requirements.push('Swing trading requires overnight hold permission + weekend hold permission'); dealBreakers.push('Any firm with EOD-flat or no-weekend rules'); }
    const filledInputs = [match.winRate, match.avgRR, match.tradesPerDay, match.tradesNews, match.holdsOvernight, match.avgHoldTime, match.riskTolerance].filter(Boolean).length + (match.instruments.length > 0 ? 1 : 0);
    if (filledInputs < 5) return;
    setMatchResult(true);
    return { firmType, ddPref, overallPref, requirements, dealBreakers, recommendations };
  };
  const matchData = matchResult ? generateMatch() : null;

  /* ─── DRAW FUNCTIONS ─── */
  const drawRuleMatrix = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const cx = w / 2;
    const cy = h / 2;
    const cycle = f % 360;
    const activeRow = Math.floor(cycle / 60) % 6;
    const colW = (w - 20) / 5;
    const rowH = (h - 50) / 6;
    const startY = 40;
    // Header
    const headers = ['Rule', 'Standard', 'Moderate', 'Strict', 'Flexible'];
    const headerColors = ['#f59e0b', '#22c55e', '#3b82f6', '#ef4444', '#8b5cf6'];
    for (let c = 0; c < 5; c++) {
      ctx.fillStyle = headerColors[c]; ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(headers[c], 10 + colW * c + colW / 2, 22);
    }
    // Rows
    for (let r = 0; r < 6; r++) {
      const ry = startY + r * rowH;
      const isActive = r === activeRow;
      // Row background
      if (isActive) {
        ctx.fillStyle = 'rgba(245,158,11,0.06)';
        ctx.fillRect(10, ry, w - 20, rowH);
      }
      // Rule name
      ctx.fillStyle = isActive ? '#f59e0b' : 'rgba(255,255,255,0.4)';
      ctx.font = `${isActive ? 'bold ' : ''}${isActive ? 9 : 8}px system-ui`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(ruleCategories[r].name, 10 + colW / 2, ry + rowH / 2);
      // Archetype values
      for (let c = 0; c < 4; c++) {
        ctx.fillStyle = isActive ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.25)';
        ctx.font = `${isActive ? 8 : 7}px system-ui`;
        ctx.textAlign = 'center';
        ctx.fillText(ruleCategories[r].archetypes[c], 10 + colW * (c + 1) + colW / 2, ry + rowH / 2);
      }
    }
    // Active importance badge
    ctx.fillStyle = ruleCategories[activeRow].importance === 'CRITICAL' ? '#ef4444' : ruleCategories[activeRow].importance === 'HIGH' ? '#f59e0b' : '#3b82f6';
    ctx.font = 'bold 9px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText(`${ruleCategories[activeRow].icon} ${ruleCategories[activeRow].importance}`, cx, h - 4);
  }, []);

  const drawRedFlags = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const cx = w / 2;
    const cy = h / 2;
    const cycle = f % 360;
    const activeIdx = Math.floor(cycle / 60) % 6;
    const cardW = w - 40;
    const cardH = (h - 50) / 3;
    const cols = 2;
    const rows = 3;
    const gapX = 8;
    const gapY = 6;
    const cw = (cardW - gapX) / cols;
    const ch = (h - 40 - gapY * 2) / rows;
    for (let i = 0; i < 6; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const rx = 20 + col * (cw + gapX);
      const ry = 30 + row * (ch + gapY);
      const isActive = i === activeIdx;
      // Card
      ctx.fillStyle = isActive ? redFlags[i].color + '22' : 'rgba(255,255,255,0.02)';
      ctx.strokeStyle = isActive ? redFlags[i].color + '66' : 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      const r = 6;
      ctx.moveTo(rx + r, ry); ctx.lineTo(rx + cw - r, ry);
      ctx.quadraticCurveTo(rx + cw, ry, rx + cw, ry + r);
      ctx.lineTo(rx + cw, ry + ch - r);
      ctx.quadraticCurveTo(rx + cw, ry + ch, rx + cw - r, ry + ch);
      ctx.lineTo(rx + r, ry + ch);
      ctx.quadraticCurveTo(rx, ry + ch, rx, ry + ch - r);
      ctx.lineTo(rx, ry + r);
      ctx.quadraticCurveTo(rx, ry, rx + r, ry);
      ctx.fill(); ctx.stroke();
      // Severity badge
      ctx.fillStyle = isActive ? redFlags[i].color : 'rgba(255,255,255,0.3)';
      ctx.font = `bold ${isActive ? 8 : 7}px system-ui`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(redFlags[i].severity, rx + cw / 2, ry + 6);
      // Flag text
      ctx.fillStyle = isActive ? '#fff' : 'rgba(255,255,255,0.3)';
      ctx.font = `${isActive ? 8 : 7}px system-ui`;
      ctx.textBaseline = 'middle';
      // Word wrap
      const words = redFlags[i].flag.split(' ');
      let line = ''; let ly = ry + ch / 2 - 4;
      const maxW = cw - 12;
      const lines: string[] = [];
      for (const word of words) {
        const test = line + (line ? ' ' : '') + word;
        if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = word; } else { line = test; }
      }
      if (line) lines.push(line);
      ly = ry + ch / 2 - (lines.length * 10) / 2 + 6;
      for (const l of lines) { ctx.fillText(l, rx + cw / 2, ly); ly += 10; }
    }
    // Title
    ctx.fillStyle = 'rgba(245,158,11,0.6)'; ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillText('6 Red Flags to Watch For', cx, 6);
  }, []);

  const chipCls = (active: boolean) => `px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${active ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400' : 'bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:bg-white/[0.07]'}`;
  const toggleArr = (arr: string[], item: string) => arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];

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
          <motion.p variants={fadeUp} className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-4">Level 9 &middot; Lesson 3 of 14</motion.p>
          <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold leading-tight mb-4 bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Choosing Your Firm</motion.h1>
          <motion.p variants={fadeUp} className="text-gray-400 max-w-lg mx-auto text-sm leading-relaxed">Not all prop firms are equal. The wrong firm wastes your money. The right firm multiplies your edge. Learn to match rules to your strategy.</motion.p>
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.8 }} className="absolute bottom-8 flex flex-col items-center gap-2 text-gray-600 text-xs">Scroll to begin<motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-amber-500">&#8964;</motion.div></motion.div>
      </section>

      {/* S00 */}
      <section className="max-w-2xl mx-auto px-5 py-20"><motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">00 &mdash; Why This Matters</p><h2 className="text-2xl font-extrabold mb-4">The Most Expensive Mistake in Prop Trading</h2><div className="p-6 rounded-2xl glass-card space-y-4">
        <p className="text-sm text-gray-300 leading-relaxed">The #1 reason traders fail prop challenges is not bad strategy or poor psychology. It is <strong className="text-white">choosing the wrong firm</strong>. A trader with a 60% win rate and 1:2 R:R might have a 20% pass probability at one firm and a 5% pass probability at another &mdash; same trader, same strategy, dramatically different outcomes.</p>
        <p className="text-sm text-gray-300 leading-relaxed">The difference? Rules. Daily drawdown type, overall drawdown type (static vs trailing), time limits, news trading permissions, overnight holding rules, and minimum trading days. Each rule either supports or undermines your specific strategy.</p>
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-purple-500/10 border border-amber-500/20"><p className="text-xs font-bold text-amber-400 mb-1">&#9889; REAL SCENARIO</p><p className="text-xs text-gray-300">A Gold scalper chose a firm with 3% daily DD because it was &pound;120 cheaper. Gold&apos;s average daily range is 200+ pips. At 0.8% risk per trade, 3% DD gave him room for only 3.7 losing trades per day. He breached daily DD on Day 4 after 4 consecutive losses (well within normal variance for a 58% WR). The &pound;120 he &ldquo;saved&rdquo; cost him &pound;300+ when he needed to buy the challenge again. <strong className="text-white">Rule compatibility &gt; challenge price. Always.</strong></p></div>
      </div></motion.div></section>

      {/* S01 — Canvas 1: Rule Matrix */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; Rule Comparison Matrix</p><h2 className="text-2xl font-extrabold mb-2">6 Rules Across 4 Firm Archetypes</h2><p className="text-gray-400 text-sm mb-4">Every firm falls somewhere on this spectrum. Watch each rule highlight with its importance rating.</p>
      <div className="rounded-2xl glass-card p-4"><AnimScene drawFn={drawRuleMatrix} height={300} /></div></motion.div></section>

      {/* S02 — Canvas 2: Red Flags */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; Red Flag Scanner</p><h2 className="text-2xl font-extrabold mb-2">6 Warning Signs Before You Buy</h2><p className="text-gray-400 text-sm mb-4">From critical deal-breakers to style-dependent checks. Know what to look for.</p>
      <div className="rounded-2xl glass-card p-4"><AnimScene drawFn={drawRedFlags} height={300} /></div></motion.div></section>

      {/* S03 — Deep Dive: 6 Rule Categories */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The 6 Rules That Matter</p><h2 className="text-2xl font-extrabold mb-4">Deep Dive Into Each Rule Category</h2><div className="space-y-3">{ruleCategories.map((rc, i) => (<div key={i}><button onClick={() => toggle(`rc-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{rc.icon} {rc.name} <span className="text-[10px] font-mono ml-2 text-amber-400/60">{rc.importance}</span></span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`rc-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`rc-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-xs text-gray-300 leading-relaxed mb-2">{rc.desc}</p><p className="text-xs text-gray-500">Typical range: {rc.archetypes.join(' | ')}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      {/* S04 — Red Flags Detail */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Red Flags in Detail</p><h2 className="text-2xl font-extrabold mb-4">Know Before You Buy</h2><div className="p-6 rounded-2xl glass-card space-y-3">{redFlags.map((rf, i) => (<div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold text-gray-200">{rf.flag}</p><p className="text-xs text-gray-400 mt-1">{rf.desc}</p></div><span className="text-[10px] font-bold px-2 py-1 rounded-lg shrink-0" style={{ color: rf.color, background: rf.color + '18', border: `1px solid ${rf.color}33` }}>{rf.severity}</span></div></div>))}</div></motion.div></section>

      {/* S05 — GROUNDBREAKING: Prop Firm Match Engine */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Find Your Match</p><h2 className="text-2xl font-extrabold mb-2">&#127919; Prop Firm Match Engine</h2><p className="text-gray-400 text-sm mb-4">Input your strategy profile. Get a personalised firm recommendation with deal-breakers and requirements.</p>
      <div className="p-6 rounded-2xl glass-card space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div><p className="text-[10px] text-amber-400 font-bold mb-1">Win Rate (%)</p><input type="number" value={match.winRate} onChange={e => { setMatch(m => ({ ...m, winRate: e.target.value })); setMatchResult(false); }} placeholder="e.g., 58" className="w-full p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-amber-500/40" /></div>
          <div><p className="text-[10px] text-amber-400 font-bold mb-1">Avg R:R</p><input type="number" value={match.avgRR} onChange={e => { setMatch(m => ({ ...m, avgRR: e.target.value })); setMatchResult(false); }} placeholder="e.g., 1.8" step={0.1} className="w-full p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-amber-500/40" /></div>
          <div><p className="text-[10px] text-amber-400 font-bold mb-1">Trades/Day</p><input type="number" value={match.tradesPerDay} onChange={e => { setMatch(m => ({ ...m, tradesPerDay: e.target.value })); setMatchResult(false); }} placeholder="e.g., 2" className="w-full p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-amber-500/40" /></div>
        </div>
        <div><p className="text-[10px] text-amber-400 font-bold mb-1">Instruments You Trade</p><div className="flex flex-wrap gap-1.5">{['Forex Majors', 'Forex Minors', 'Gold (XAUUSD)', 'Indices (NASDAQ/US30)', 'Oil', 'Crypto'].map(i => (<button key={i} onClick={() => { setMatch(m => ({ ...m, instruments: toggleArr(m.instruments, i) })); setMatchResult(false); }} className={chipCls(match.instruments.includes(i))}>{i}</button>))}</div></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div><p className="text-[10px] text-amber-400 font-bold mb-1">Trade News?</p><div className="flex gap-1">{[{l:'Yes',v:'yes'},{l:'No',v:'no'}].map(o => (<button key={o.v} onClick={() => { setMatch(m => ({ ...m, tradesNews: o.v })); setMatchResult(false); }} className={chipCls(match.tradesNews === o.v)}>{o.l}</button>))}</div></div>
          <div><p className="text-[10px] text-amber-400 font-bold mb-1">Hold Overnight?</p><div className="flex gap-1">{[{l:'Yes',v:'yes'},{l:'No',v:'no'}].map(o => (<button key={o.v} onClick={() => { setMatch(m => ({ ...m, holdsOvernight: o.v })); setMatchResult(false); }} className={chipCls(match.holdsOvernight === o.v)}>{o.l}</button>))}</div></div>
          <div><p className="text-[10px] text-amber-400 font-bold mb-1">Avg Hold Time</p><div className="flex flex-wrap gap-1">{[{l:'Scalp',v:'scalp'},{l:'Intraday',v:'intraday-long'},{l:'Swing',v:'swing'}].map(o => (<button key={o.v} onClick={() => { setMatch(m => ({ ...m, avgHoldTime: o.v })); setMatchResult(false); }} className={chipCls(match.avgHoldTime === o.v)}>{o.l}</button>))}</div></div>
          <div><p className="text-[10px] text-amber-400 font-bold mb-1">Risk Tolerance</p><div className="flex flex-wrap gap-1">{[{l:'Safe',v:'conservative'},{l:'Mid',v:'moderate'},{l:'Aggro',v:'aggressive'}].map(o => (<button key={o.v} onClick={() => { setMatch(m => ({ ...m, riskTolerance: o.v })); setMatchResult(false); }} className={chipCls(match.riskTolerance === o.v)}>{o.l}</button>))}</div></div>
        </div>
        <button onClick={() => generateMatch()} className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-sm font-bold text-white active:scale-95 transition-transform">Generate My Firm Match &rarr;</button>
        {matchResult && matchData && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 pt-2">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20"><p className="text-xs font-bold text-amber-400">RECOMMENDED FIRM TYPE</p><p className="text-sm text-white mt-1">{matchData.firmType}</p></div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-xs font-bold text-green-400">DD PREFERENCE</p><p className="text-xs text-gray-300 mt-1">{matchData.ddPref}</p><p className="text-xs text-gray-300">{matchData.overallPref}</p></div>
          {matchData.requirements.length > 0 && (<div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20"><p className="text-xs font-bold text-blue-400 mb-1">MUST-HAVE REQUIREMENTS</p>{matchData.requirements.map((r, i) => (<p key={i} className="text-xs text-gray-300">&#10004; {r}</p>))}</div>)}
          {matchData.dealBreakers.length > 0 && (<div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20"><p className="text-xs font-bold text-red-400 mb-1">DEAL BREAKERS</p>{matchData.dealBreakers.map((d, i) => (<p key={i} className="text-xs text-gray-300">&#10060; {d}</p>))}</div>)}
          {matchData.recommendations.length > 0 && (<div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20"><p className="text-xs font-bold text-purple-400 mb-1">PERSONALISED RECOMMENDATIONS</p>{matchData.recommendations.map((r, i) => (<p key={i} className="text-xs text-gray-300">&#128161; {r}</p>))}</div>)}
        </motion.div>)}
      </div></motion.div></section>

      {/* S06 — The Evaluation Checklist */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Before You Buy</p><h2 className="text-2xl font-extrabold mb-4">The Complete Evaluation Checklist</h2><div className="space-y-3">{evaluationChecklist.map((cat, i) => (<div key={i}><button onClick={() => toggle(`cl-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{cat.category}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`cl-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`cl-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05] space-y-1.5">{cat.questions.map((q, qi) => (<p key={qi} className="text-xs text-gray-300">&#9744; {q}</p>))}</div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      {/* S07 — Expected Cost Formula */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; The True Cost Formula</p><h2 className="text-2xl font-extrabold mb-4">Expected Cost = Fee &divide; Pass Probability</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#22c55e]">FIRM A</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">&pound;400 fee, 5% daily DD, static 10% overall DD. Your estimated pass rate: 15%. Expected cost: &pound;400 &divide; 0.15 = <strong className="text-green-400">&pound;2,667</strong></span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">FIRM B</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">&pound;250 fee, 3% daily DD, trailing 8% overall DD. Your estimated pass rate: 5%. Expected cost: &pound;250 &divide; 0.05 = <strong className="text-red-400">&pound;5,000</strong></span></p></div>
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20"><p className="text-xs text-gray-300"><strong className="text-amber-400">The &ldquo;cheap&rdquo; firm costs nearly DOUBLE.</strong> Always calculate expected cost, not sticker price. The pass probability is determined by how well the firm&apos;s rules match your strategy. Better rule match = higher pass probability = lower expected cost.</p></div>
      </div></motion.div></section>

      {/* S08 — Common Mistakes */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p><h2 className="text-2xl font-extrabold mb-4">4 Firm Selection Errors</h2><div className="space-y-3">{commonMistakes.map((item, i) => (<div key={i}><button onClick={() => toggle(`cm-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`cm-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`cm-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-xs text-red-400 mb-2">&#10060; {item.mistake}</p><p className="text-xs text-green-400">&#10004; {item.fix}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      {/* S09 — Cheat Sheet */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Cheat Sheet</p><h2 className="text-2xl font-extrabold mb-4">Firm Selection Quick Reference</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#ef4444]">DAILY DD = #1 RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Check the percentage AND whether it includes open P&amp;L. This single rule determines more pass/fail outcomes than any other.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#f59e0b]">STATIC &gt; TRAILING</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Always prefer static overall DD. Trailing DD permanently reduces your buffer with every equity peak. Same percentage, dramatically harder survival.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#3b82f6]">EXPECTED COST</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Fee &divide; Pass Probability. A &pound;400 firm with 15% pass rate (&pound;2,667 expected) is cheaper than a &pound;250 firm with 5% pass rate (&pound;5,000 expected).</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#22c55e]">MATCH RULES TO STRATEGY</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Your performance data is based on your current strategy. A firm that forces you to modify that strategy invalidates all your data. Trade YOUR system.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">THE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Choose the firm whose rules let you trade your proven strategy unchanged. Then compare price and split. Never choose price first and rules second.</span></p></div>
      </div></motion.div></section>

      {/* S10 — Game */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Test Your Understanding</p><h2 className="text-2xl font-extrabold mb-2">Firm Selection Challenge</h2><p className="text-gray-400 text-sm mb-6">5 scenario-based rounds. Match strategies to firms, spot red flags, and calculate true costs.</p>
      <div className="p-6 rounded-2xl glass-card"><div className="flex items-center justify-between mb-4"><span className="text-xs font-bold text-amber-400">Round {gameRound + 1} of {gameRounds.length}</span><span className="text-xs font-mono text-gray-500">{gameScore}/{gameRounds.length} correct</span></div><p className="text-sm text-gray-300 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: gameRounds[gameRound].scenario }} /><div className="space-y-2">{gameRounds[gameRound].options.map((opt, oi) => { const answered = gameAnswers[gameRound] !== null; const selected = gameAnswers[gameRound] === oi; const isCorrect = opt.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return (<div key={oi}><button onClick={() => handleGameAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt.text }} /></button>{answered && selected && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]"><p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`} dangerouslySetInnerHTML={{ __html: opt.explain }} /></motion.div>)}</div>); })}</div>{gameAnswers[gameRound] !== null && gameRound < gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5"><button onClick={() => setGameRound(r => r + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button></motion.div>)}{gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Outstanding \u2014 you can evaluate prop firms like a business analyst, not a hopeful applicant.' : gameScore >= 3 ? 'Good \u2014 review the trailing DD and open P&L scenarios to sharpen your firm evaluation skills.' : 'Re-read the rule categories and red flags sections. Choosing the wrong firm is the most expensive mistake in prop trading.'}</p></motion.div>)}</div></motion.div></section>

      {/* S11 — Quiz + Certificate */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Knowledge Check</p><h2 className="text-2xl font-extrabold mb-6">Final Quiz &mdash; 8 Questions</h2>
      <div className="space-y-6">{quizQuestions.map((q, qi) => (<div key={qi} className="p-5 rounded-2xl glass-card"><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p><p className="text-sm font-semibold text-white mb-4">{q.q}</p><div className="space-y-2">{q.opts.map((opt, oi) => { const answered = quizAnswers[qi] !== null; const selected = quizAnswers[qi] === oi; const isCorrect = oi === q.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return <button key={oi} onClick={() => handleQuizAnswer(qi, oi)} disabled={answered} className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`}>{opt}</button>; })}</div>{quizAnswers[qi] !== null && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg bg-white/[0.02]"><p className="text-xs text-amber-400" dangerouslySetInnerHTML={{ __html: `<span class="font-bold">&#9989;</span> ${q.explain}` }} /></motion.div>)}</div>))}</div>
      {quizDone && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center"><p className="text-3xl font-extrabold mb-2">{quizScoreVal}%</p><p className="text-sm text-gray-400">{quizScoreVal >= 66 ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate. Review and try again.'}</p></motion.div>)}
      {certUnlocked && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10"><div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}><div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(139,92,246,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} /><div className="relative z-10 text-center"><div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">&#129517;</div><p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p><p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 9: Choosing Your Firm</strong><br />at ATLAS Academy by Interakktive</p><p className="bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Firm Navigator &mdash;</p><p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L9.3-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p></div></div></motion.div>)}</motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-20 text-center"><Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">&larr; Back to Academy</Link></section>
    </div>
  );
}
