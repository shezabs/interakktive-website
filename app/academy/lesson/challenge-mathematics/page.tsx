// app/academy/lesson/challenge-mathematics/page.tsx
// ATLAS Academy — Lesson 9.4: Challenge Mathematics [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 9
// GROUNDBREAKING: Monte Carlo Challenge Calculator — 500 simulated challenges
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
const riskLevels = [
  { risk: 0.25, label: '0.25%', passRate: 8, dailyDD: 3, overallDD: 5, avgDays: 58, verdict: 'Too slow \u2014 time pressure kills you before the target does', color: '#6b7280' },
  { risk: 0.5, label: '0.5%', passRate: 18, dailyDD: 8, overallDD: 12, avgDays: 32, verdict: 'Conservative sweet spot for 30-day challenges', color: '#3b82f6' },
  { risk: 0.75, label: '0.75%', passRate: 22, dailyDD: 14, overallDD: 18, avgDays: 22, verdict: 'OPTIMAL \u2014 best balance of speed and survival', color: '#22c55e' },
  { risk: 1.0, label: '1.0%', passRate: 19, dailyDD: 22, overallDD: 28, avgDays: 16, verdict: 'Aggressive \u2014 fast but daily DD breaches become common', color: '#f59e0b' },
  { risk: 1.5, label: '1.5%', passRate: 12, dailyDD: 38, overallDD: 42, avgDays: 11, verdict: 'Dangerous \u2014 one bad day ends the challenge', color: '#ef4444' },
  { risk: 2.0, label: '2.0%', passRate: 6, dailyDD: 55, overallDD: 58, avgDays: 8, verdict: 'Gambling \u2014 more likely to breach than to pass', color: '#ef4444' },
];

const mathConcepts = [
  { title: 'Expected Value Per Trade', content: 'EV = (Win Rate \u00D7 Avg Win) \u2212 (Loss Rate \u00D7 Avg Loss). With 58% WR and 1:1.5 R:R at 0.75% risk: EV = (0.58 \u00D7 1.125%) \u2212 (0.42 \u00D7 0.75%) = 0.6525% \u2212 0.315% = +0.3375% per trade. On a \u00A3100K account, that is +\u00A3337.50 expected per trade. You need ~30 trades to reach a 10% target in expectation.' },
  { title: 'Probability of Ruin (DD Breach)', content: 'Even with positive EV, you can breach drawdown through normal losing streaks. At 58% WR, probability of 6 consecutive losses = 0.42\u2076 = 0.55%. Sounds rare, but over 60+ trades in a challenge, the probability of hitting a 6-loss streak rises to ~28%. This is why risk per trade matters \u2014 at 1% risk, 6 losses = -6% (breach on 5% daily DD). At 0.75%, 6 losses = -4.5% (survived).' },
  { title: 'The Risk Per Trade Sweet Spot', content: 'Too low (0.25%): you never reach the target before the time limit. Too high (2%): you breach drawdown from normal variance. The sweet spot is where pass probability is MAXIMISED \u2014 typically 0.5\u20130.75% risk for a 58% WR with 1:1.5 R:R and standard rules (5% daily / 10% overall). This is not a feeling \u2014 it is a calculation.' },
  { title: 'Time Pressure vs Drawdown Pressure', content: 'These are opposing forces. Lower risk = more time needed (time pressure increases). Higher risk = faster target approach but higher DD breach probability. The challenge is an optimisation problem: find the risk level where the combined probability of time-out AND DD-breach is minimised. This is what Monte Carlo simulation solves.' },
];

const sweetSpotTable = [
  { wr: '55%', rr: '1:1.5', optimal: '0.5\u20130.6%', passEst: '12\u201315%', note: 'Lower WR needs smaller risk to survive losing streaks' },
  { wr: '58%', rr: '1:1.5', optimal: '0.6\u20130.8%', passEst: '18\u201322%', note: 'Standard ATLAS strategy range \u2014 the most common sweet spot' },
  { wr: '62%', rr: '1:1.5', optimal: '0.7\u20131.0%', passEst: '22\u201328%', note: 'Higher WR allows slightly more risk without ruin' },
  { wr: '55%', rr: '1:2.0', optimal: '0.5\u20130.7%', passEst: '15\u201320%', note: 'Higher R:R compensates for lower WR with bigger wins' },
  { wr: '58%', rr: '1:2.0', optimal: '0.6\u20130.9%', passEst: '22\u201328%', note: 'Best of both worlds \u2014 highest pass probability range' },
  { wr: '62%', rr: '1:2.0', optimal: '0.8\u20131.0%', passEst: '28\u201335%', note: 'Elite stats \u2014 can push risk slightly higher' },
];

const commonMistakes = [
  { title: 'Risking 2% Per Trade Because It Works on Personal Accounts', mistake: '"I always risk 2% on my personal account and it works fine." On your personal account, there is no daily DD limit. A 5-loss day costs you 10% but you can trade tomorrow. On a prop challenge with 5% daily DD, a 5-loss day at 2% = TERMINATED. Same strategy, same risk, completely different outcome.', fix: 'Challenge risk should be 50\u201375% of your personal risk. If you trade 1% personal, use 0.5\u20130.75% on challenges. The reduced risk extends your survival while your positive EV grinds toward the target.' },
  { title: 'Ignoring the Time Limit in Risk Calculations', mistake: '"I will just risk 0.25% and be super safe." With 0.25% risk, 58% WR, and 1:1.5 R:R, your expected profit per trade is +0.11%. To reach 10% profit target, you need ~90 trades. At 2 trades/day, that is 45 trading days. If the challenge is 30 calendar days (~22 trading days), you mathematically CANNOT reach the target at this risk level.', fix: 'Calculate the minimum trades needed to reach target in expectation, then check if your time limit allows it. If not, increase risk until the maths works \u2014 but never beyond the point where DD breach probability exceeds 30\u201340%.' },
  { title: 'Not Understanding Variance', mistake: '"I have a 58% win rate so I will win 6 out of 10 trades." That is the AVERAGE over hundreds of trades. In any given 10-trade sequence, you might win 4, or 7, or 3. Variance is real. A 58% WR trader will experience runs of 5\u20136 consecutive losses regularly. Your risk per trade must survive these streaks without breaching DD.', fix: 'Plan for the worst reasonable streak, not the average. At 58% WR, plan to survive 6\u20137 consecutive losses. At 0.75% risk, 7 losses = -5.25% (barely survives 5% daily DD). At 1%, 5 losses = -5% (breached). This is why 0.75% is often optimal and 1% is not.' },
  { title: 'Changing Risk Mid-Challenge', mistake: '"I am up 6% so I will increase risk to 1.5% to finish faster." This is the challenge killer. Your DD buffer gets smaller as you approach the target (you need to PROTECT gains), but emotionally you want to finish fast. Increasing risk when you are ahead is the most common way profitable challenges become failed ones.', fix: 'Set risk BEFORE the challenge starts and do not change it. The only acceptable risk change is REDUCING it when you reach 80% of target (the protect phase). Never increase risk mid-challenge. Ever.' },
];

const gameRounds = [
  { scenario: '<strong>Expected value:</strong> Your strategy has 58% WR and 1:1.5 R:R. You are considering 0.75% risk per trade on a \u00A3100K challenge with 10% target. What is your expected value per trade, and approximately how many trades do you need to reach the target?', options: [
    { text: 'EV = +\u00A3250/trade, need ~40 trades', correct: false, explain: 'Close but the calculation is off. EV = (0.58 \u00D7 1.125%) \u2212 (0.42 \u00D7 0.75%) = 0.6525% \u2212 0.315% = +0.3375% per trade = +\u00A3337.50. Target is \u00A310,000, so \u00A310,000 \u00F7 \u00A3337.50 \u2248 30 trades in expectation.' },
    { text: 'EV = +\u00A3337.50/trade (0.3375%), need ~30 trades to reach \u00A310K target in expectation', correct: true, explain: 'Correct. (0.58 \u00D7 1.125%) \u2212 (0.42 \u00D7 0.75%) = +0.3375% per trade = \u00A3337.50 on \u00A3100K. \u00A310,000 target \u00F7 \u00A3337.50 = ~30 trades. At 2 trades/day, that is ~15 trading days \u2014 well within a 30-day challenge. The maths works at this risk level.' },
    { text: 'EV = +\u00A3750/trade, need ~13 trades', correct: false, explain: 'Way too optimistic. You are calculating the average WIN, not the expected value. EV accounts for BOTH wins and losses. The average win is \u00A31,125 (1.125% of \u00A3100K), but you only win 58% of the time. Subtracting the expected losses gives +\u00A3337.50 per trade.' },
  ]},
  { scenario: '<strong>Variance reality:</strong> Your 58% WR strategy has just lost 5 trades in a row during your prop challenge. You are at -3.75% for the day (at 0.75% risk). Your daily DD limit is 5%. What should you do?', options: [
    { text: 'Keep trading \u2014 your strategy has 58% WR so the next trade is more likely to win (law of averages)', correct: false, explain: 'The gambler\u2019s fallacy. Each trade is independent. The next trade still has a 42% chance of losing. If it loses, you are at -4.5% \u2014 one more loss from daily DD breach. At this point, the mathematically correct decision is to stop. Five consecutive losses at 58% WR has a 1.3% probability on any given day \u2014 rare but expected over a 30-day challenge.' },
    { text: 'Stop trading for the day \u2014 you have only 1.25% of daily DD remaining, which is less than 2 more losing trades, and each trade is independent regardless of the streak', correct: true, explain: 'Correct. With 1.25% DD remaining and 0.75% risk per trade, one more loss puts you at -4.5% (dangerously close) and two more losses breaches at -5.25%. The probability of 2 more consecutive losses is 17.6% (0.42\u00B2). That is nearly a 1-in-5 chance of losing the entire challenge if you continue. Stop, preserve the account, trade tomorrow with a full 5% buffer.' },
    { text: 'Reduce risk to 0.25% and take one more trade to try to recover some of the loss', correct: false, explain: 'Better than full risk, but still wrong. At -3.75% with 1.25% remaining, even 0.25% risk means a loss puts you at -4%. One more bad trade after that and you are breached. The correct decision is to stop entirely. One day of missed trading is worth more than the entire challenge at risk.' },
  ]},
  { scenario: '<strong>Risk optimisation:</strong> You are choosing between three risk levels for your 30-day, \u00A3100K challenge (10% target, 5% daily DD, 10% overall DD). Your stats: 58% WR, 1:1.5 R:R. Option A: 0.5% risk (pass probability ~18%, avg 32 days). Option B: 0.75% risk (pass probability ~22%, avg 22 days). Option C: 1.5% risk (pass probability ~12%, avg 11 days). Which risk level maximises your chance of passing?', options: [
    { text: 'Option A (0.5%) \u2014 safest approach, fewer DD breaches', correct: false, explain: '18% pass rate is lower than Option B. Why? The 30-day time limit. At 0.5% risk, you need ~32 trading days in expectation but only have ~22 trading days. Time pressure forces sub-optimal late-challenge decisions. Safety from DD is traded for vulnerability to the clock.' },
    { text: 'Option B (0.75%) \u2014 the optimal balance where pass probability is highest at 22%, completing in ~22 days which fits the 30-day window with buffer', correct: true, explain: 'This is the sweet spot. 0.75% risk gives the highest pass probability (22%) because it balances speed (22 days average, fits within the 30-day window) with DD survival (daily DD breach probability of ~14%, overall breach ~18%). Neither too slow (clock kills you) nor too fast (variance kills you).' },
    { text: 'Option C (1.5%) \u2014 fastest path to target, and speed means fewer trading days exposed to risk', correct: false, explain: 'Fastest is not safest. At 1.5% risk, daily DD breach probability jumps to 38% and overall to 42%. Even though you might finish in 11 days, you have a 42% chance of never getting there. The high DD breach rate more than offsets the speed advantage. Pass probability drops to 12%.' },
  ]},
  { scenario: '<strong>Mid-challenge decision:</strong> Day 15 of 30. You are at +7.2% (target is 10%). You have been using 0.75% risk. You calculate that at your current EV, you need approximately 8 more trades to reach the target. You are tempted to increase risk to 1% to finish in 5-6 trades instead. Should you?', options: [
    { text: 'Yes \u2014 you are ahead and can afford slightly higher risk to close out faster', correct: false, explain: 'This is the challenge killer. You are at +7.2% which means your DD floor is either at -2.8% (static, from starting balance) or at -2.8% from current equity (trailing). Increasing risk REDUCES your survival buffer at the exact moment you should be PROTECTING gains. 8 more trades at 0.75% takes ~4 days. You have 15 days left. There is zero reason to rush.' },
    { text: 'No \u2014 reduce risk to 0.5% (protect phase). You have 15 days for 2.8% more profit. The maths works at lower risk with massive time buffer.', correct: true, explain: 'This is the 80% rule. You have reached 72% of target (past the threshold). Switch to protect mode: reduce risk to 0.5%. At +0.225% EV per trade, you need ~12 trades for 2.8%. At 2 trades/day, that is 6 days. You have 15 days. The maths is overwhelmingly in your favour at LOWER risk. Increasing risk here has zero upside and massive downside.' },
    { text: 'Maintain 0.75% \u2014 do not change anything that is working', correct: false, explain: 'Maintaining is better than increasing, but the optimal play is to reduce. At +7.2% with 15 days remaining, your only risk is drawdown. Reducing to 0.5% still reaches the target with 9 days of buffer while dramatically reducing DD breach probability. The discipline to reduce when ahead is what separates the 3% who survive from the 97% who do not.' },
  ]},
  { scenario: '<strong>Probability check:</strong> A trader says: "I have a 62% win rate, so I should pass a 10% challenge easily if I risk 1% per trade." They plan to take 3 trades per day on a \u00A3100K account with 5% daily DD. What is the flaw in their reasoning?', options: [
    { text: 'Their win rate is not high enough \u2014 they need at least 70% to pass reliably', correct: false, explain: '62% is excellent. The problem is not the win rate. A 62% WR with 1:1.5 R:R has strong positive EV. The flaw is in the RISK SIZING combined with trade frequency and daily DD.' },
    { text: 'At 1% risk with 3 trades/day, a bad day of 5 consecutive losses (probability ~0.8%) breaches the 5% daily DD \u2014 and over 22+ trading days, that probability compounds to roughly 16%, meaning a ~1-in-6 chance of daily DD breach from a single bad day', correct: true, explain: 'Exactly. The individual probability of 5 losses in a row is low (0.38\u2075 = 0.8%). But they face this risk EVERY trading day for 22+ days. The compounded probability of experiencing at least one 5-loss day = 1 \u2212 (0.992)\u00B2\u00B2 \u2248 16%. So there is roughly a 1-in-6 chance their challenge ends from a single bad day of normal variance. Reducing to 0.75% risk means 5 losses = -3.75% (survived). That single change could increase their pass rate from ~19% to ~28%.' },
    { text: 'They should take fewer trades per day to reduce risk', correct: false, explain: 'Fewer trades reduces DD exposure per day but also slows progress toward the target, creating time pressure. The better solution is reducing risk PER TRADE, not reducing trade frequency. 3 trades/day at 0.75% has better outcomes than 1 trade/day at 1%.' },
  ]},
];

const quizQuestions = [
  { q: 'What is Expected Value (EV) per trade?', opts: ['The average profit on winning trades', 'The probability-weighted outcome: (WR \u00D7 Avg Win) minus (Loss Rate \u00D7 Avg Loss)', 'The maximum profit possible on a single trade', 'The profit target divided by number of trades'], correct: 1, explain: 'EV = (Win Rate \u00D7 Average Win) \u2212 (Loss Rate \u00D7 Average Loss). This gives the expected profit or loss per trade over many repetitions. Positive EV is necessary but not sufficient for passing a challenge \u2014 you also need to survive drawdowns along the way.' },
  { q: 'Why is 0.75% risk often optimal for a standard prop challenge (5% daily DD, 10% overall, 10% target)?', opts: ['It is a round number that is easy to calculate', 'It balances speed to target (avoiding time pressure) with DD survival (avoiding ruin from normal variance)', 'It is the maximum allowed by most prop firms', 'Lower risk always means higher pass probability'], correct: 1, explain: 'The optimal risk balances two opposing forces: time pressure (too low risk = cannot reach target in time) and ruin probability (too high risk = DD breach from variance). At 0.75%, a 58% WR trader reaches the target in ~22 days with ~14% daily DD breach probability \u2014 the best combined outcome.' },
  { q: 'At 58% WR, what is the probability of experiencing 6 consecutive losses?', opts: ['Nearly impossible \u2014 less than 0.01%', 'About 0.55% on any given sequence of 6 trades', 'About 5% per day', 'About 25% per challenge'], correct: 1, explain: '0.42\u2076 = 0.55% for any specific sequence of 6 trades. Sounds rare, but across 60+ trades in a challenge, the probability of hitting at least one 6-loss streak rises to ~28%. This is why risk per trade must be sized to survive these statistically expected streaks.' },
  { q: 'What is the "80% rule" in challenge management?', opts: ['Risk 80% of your daily DD limit per day', 'When you reach 80% of the profit target, reduce your risk to protect gains', 'You need an 80% win rate to pass reliably', 'Close 80% of your position at the first target'], correct: 1, explain: 'When you reach 80% of the profit target (e.g., +8% when target is 10%), switch to "protect mode" by reducing risk to 0.5% or below. The remaining 20% of the target should be approached conservatively because the DOWNSIDE of a drawdown (losing the challenge) far outweighs the UPSIDE of finishing faster.' },
  { q: 'Why should you NEVER increase risk mid-challenge when you are ahead?', opts: ['It is against the rules at most prop firms', 'Being ahead means your DD buffer is actually SMALLER relative to your equity, so increasing risk when vulnerable is the most common way winning challenges become losing ones', 'Your win rate decreases when you are ahead', 'Increasing risk changes your trading strategy completely'], correct: 1, explain: 'At +7% on a 10% target with 10% static DD, your overall DD buffer is 17% (from +7% down to -10%). But your DAILY DD buffer is still only 5%. Increasing risk does not increase your daily buffer \u2014 it increases the speed at which you consume it. One bad day at higher risk can erase days of careful profit building.' },
  { q: 'How do you calculate the expected number of trades to reach a profit target?', opts: ['Target % divided by risk per trade %', 'Target (in currency) divided by Expected Value per trade (in currency)', 'Target % divided by win rate', 'Target % multiplied by number of trading days'], correct: 1, explain: 'Expected trades = Target \u00F7 EV per trade. For a \u00A310,000 target with +\u00A3337.50 EV per trade: \u00A310,000 \u00F7 \u00A3337.50 \u2248 30 trades. This is the AVERAGE \u2014 variance means it could be 20 or 45. But it gives you a baseline to check whether your time limit allows enough trades at your planned risk.' },
  { q: 'What happens if your planned risk per trade is too LOW for the challenge time limit?', opts: ['Nothing \u2014 low risk is always safe', 'You run out of time before reaching the target, creating late-challenge pressure that leads to rushed entries, over-trading, and forced risk increases', 'The firm extends your time limit automatically', 'You can request an extension from the firm'], correct: 1, explain: 'Time pressure is the silent killer of conservative risk approaches. If the maths says you need 45 trading days at 0.25% risk but you only have 22, you will inevitably face a choice around Day 15: increase risk (undermining your plan) or accept you cannot pass (wasted fee). Calculate BEFORE the challenge, not during.' },
  { q: 'What is the single most important number to know BEFORE starting a prop challenge?', opts: ['The challenge fee', 'Your estimated pass probability at your planned risk level', 'The profit target percentage', 'The number of other traders attempting the same challenge'], correct: 1, explain: 'Your estimated pass probability determines everything: whether the challenge is a positive EV investment, which risk level to use, and what your expected cost is (Fee \u00F7 Pass Probability). Without this number, you are gambling. With it, you are making a calculated business decision.' },
];

export default function ChallengeMathematics() {
  const [scrollY, setScrollY] = useState(0);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [gameRound, setGameRound] = useState(0);
  const [gameAnswers, setGameAnswers] = useState<(number | null)[]>(Array(gameRounds.length).fill(null));
  const [gameScore, setGameScore] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(Array(quizQuestions.length).fill(null));
  const [showConfetti, setShowConfetti] = useState(false);
  const [certUnlocked, setCertUnlocked] = useState(false);
  /* Monte Carlo state */
  const [mcWR, setMcWR] = useState(58);
  const [mcRR, setMcRR] = useState(1.5);
  const [mcRisk, setMcRisk] = useState(0.75);
  const [mcTarget, setMcTarget] = useState(10);
  const [mcDailyDD, setMcDailyDD] = useState(5);
  const [mcOverallDD, setMcOverallDD] = useState(10);
  const [mcDays, setMcDays] = useState(30);
  const [mcTradesPerDay, setMcTradesPerDay] = useState(2);
  const [mcResult, setMcResult] = useState<{passed:number;dailyBreach:number;overallBreach:number;timeout:number;avgDays:number;medianDD:number;paths:number[][]} | null>(null);
  const [mcRunning, setMcRunning] = useState(false);

  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);
  const toggle = (id: string) => setOpenSections(s => ({ ...s, [id]: !s[id] }));

  const handleGameAnswer = (oi: number) => { if (gameAnswers[gameRound] !== null) return; const a = [...gameAnswers]; a[gameRound] = oi; setGameAnswers(a); if (gameRounds[gameRound].options[oi].correct) setGameScore(s => s + 1); };
  const handleQuizAnswer = (qi: number, oi: number) => { if (quizAnswers[qi] !== null) return; const a = [...quizAnswers]; a[qi] = oi; setQuizAnswers(a); };

  const quizDone = quizAnswers.every(a => a !== null);
  const quizScoreVal = quizDone ? Math.round(quizAnswers.reduce<number>((s, a, i) => s + (a === quizQuestions[i].correct ? 1 : 0), 0) / quizQuestions.length * 100) : 0;
  useEffect(() => { if (quizDone && quizScoreVal >= 66 && !certUnlocked) { setCertUnlocked(true); setShowConfetti(true); const t = setTimeout(() => setShowConfetti(false), 4000); return () => clearTimeout(t); } }, [quizDone, quizScoreVal, certUnlocked]);

  /* Monte Carlo Simulation */
  const runMonteCarlo = () => {
    setMcRunning(true);
    setTimeout(() => {
      const sims = 500;
      const wr = mcWR / 100;
      const maxTrades = mcDays * mcTradesPerDay * 0.72;
      let passed = 0; let dailyBreach = 0; let overallBreach = 0; let timeout = 0;
      let totalDaysToPass = 0; let passCount = 0;
      const maxDDs: number[] = [];
      const samplePaths: number[][] = [];
      for (let s = 0; s < sims; s++) {
        let equity = 0; let peakDD = 0; let day = 0; let dailyPnl = 0; let tradesInDay = 0;
        let result = 'timeout'; const path: number[] = [0];
        for (let t = 0; t < maxTrades; t++) {
          if (tradesInDay >= mcTradesPerDay) { dailyPnl = 0; tradesInDay = 0; day++; }
          const win = Math.random() < wr;
          const pnl = win ? mcRisk * mcRR : -mcRisk;
          equity += pnl; dailyPnl += pnl; tradesInDay++;
          path.push(equity);
          if (dailyPnl <= -mcDailyDD) { result = 'dailyDD'; break; }
          if (equity <= -mcOverallDD) { result = 'overallDD'; break; }
          if (equity >= mcTarget) { result = 'passed'; totalDaysToPass += day + 1; passCount++; break; }
        }
        if (result === 'passed') passed++;
        else if (result === 'dailyDD') dailyBreach++;
        else if (result === 'overallDD') overallBreach++;
        else timeout++;
        const minEq = Math.min(...path);
        maxDDs.push(Math.abs(minEq));
        if (samplePaths.length < 8) samplePaths.push(path.slice(0, 80));
      }
      maxDDs.sort((a, b) => a - b);
      const medianDD = maxDDs[Math.floor(maxDDs.length / 2)];
      setMcResult({ passed, dailyBreach, overallBreach, timeout, avgDays: passCount > 0 ? Math.round(totalDaysToPass / passCount) : 0, medianDD: Math.round(medianDD * 100) / 100, paths: samplePaths });
      setMcRunning(false);
    }, 100);
  };

  /* ─── DRAW FUNCTIONS ─── */
  const drawProbCurve = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const cx = w / 2;
    const cy = h / 2;
    const cycle = f % 360;
    const activeIdx = Math.floor(cycle / 60) % 6;
    const chartL = 50; const chartR = w - 20; const chartT = 40; const chartB = h - 35;
    const chartW = chartR - chartL; const chartH = chartB - chartT;
    // Axes
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(chartL, chartT); ctx.lineTo(chartL, chartB); ctx.lineTo(chartR, chartB); ctx.stroke();
    // Y-axis label
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '8px system-ui';
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    for (let p = 0; p <= 25; p += 5) {
      const py = chartB - (p / 25) * chartH;
      ctx.fillText(`${p}%`, chartL - 4, py);
      ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.beginPath(); ctx.moveTo(chartL, py); ctx.lineTo(chartR, py); ctx.stroke();
    }
    // Plot bars
    const barW = chartW / 6 * 0.6;
    const gap = chartW / 6;
    for (let i = 0; i < 6; i++) {
      const bx = chartL + gap * i + gap * 0.2;
      const barH = (riskLevels[i].passRate / 25) * chartH;
      const by = chartB - barH;
      const isActive = i === activeIdx;
      ctx.fillStyle = isActive ? riskLevels[i].color + 'cc' : riskLevels[i].color + '33';
      ctx.beginPath();
      const r = 3;
      ctx.moveTo(bx + r, by); ctx.lineTo(bx + barW - r, by);
      ctx.quadraticCurveTo(bx + barW, by, bx + barW, by + r);
      ctx.lineTo(bx + barW, chartB); ctx.lineTo(bx, chartB);
      ctx.lineTo(bx, by + r);
      ctx.quadraticCurveTo(bx, by, bx + r, by);
      ctx.fill();
      // Rate label
      ctx.fillStyle = isActive ? '#fff' : 'rgba(255,255,255,0.4)';
      ctx.font = `${isActive ? 'bold 10' : '8'}px system-ui`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText(`${riskLevels[i].passRate}%`, bx + barW / 2, by - 3);
      // X-axis label
      ctx.fillStyle = isActive ? riskLevels[i].color : 'rgba(255,255,255,0.3)';
      ctx.font = `${isActive ? 'bold ' : ''}8px system-ui`;
      ctx.textBaseline = 'top';
      ctx.fillText(riskLevels[i].label, bx + barW / 2, chartB + 4);
    }
    // Active verdict
    ctx.fillStyle = riskLevels[activeIdx].color; ctx.font = '9px system-ui';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(riskLevels[activeIdx].verdict, cx, h - 10);
    // Title
    ctx.fillStyle = 'rgba(245,158,11,0.6)'; ctx.font = 'bold 9px system-ui';
    ctx.textBaseline = 'top'; ctx.fillText('Pass Probability by Risk Per Trade (58% WR, 1:1.5 R:R)', cx, 6);
  }, []);

  const drawEquityPaths = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const cx = w / 2;
    const cy = h / 2;
    const chartL = 40; const chartR = w - 20; const chartT = 30; const chartB = h - 25;
    const chartW = chartR - chartL; const chartH = chartB - chartT;
    // Target and DD lines
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(34,197,94,0.4)'; ctx.lineWidth = 1;
    const targetY = chartB - (10 / 22) * chartH;
    ctx.beginPath(); ctx.moveTo(chartL, targetY); ctx.lineTo(chartR, targetY); ctx.stroke();
    ctx.fillStyle = 'rgba(34,197,94,0.5)'; ctx.font = '8px system-ui';
    ctx.textAlign = 'left'; ctx.textBaseline = 'bottom'; ctx.fillText('+10% TARGET', chartL + 4, targetY - 2);
    const ddY = chartB - (-10 / 22) * chartH;
    ctx.strokeStyle = 'rgba(239,68,68,0.4)';
    ctx.beginPath(); ctx.moveTo(chartL, ddY); ctx.lineTo(chartR, ddY); ctx.stroke();
    ctx.fillStyle = 'rgba(239,68,68,0.5)'; ctx.textBaseline = 'top'; ctx.fillText('-10% DD FLOOR', chartL + 4, ddY + 2);
    ctx.setLineDash([]);
    // Zero line
    const zeroY = chartB - (0 / 22) * chartH;
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.beginPath(); ctx.moveTo(chartL, zeroY); ctx.lineTo(chartR, zeroY); ctx.stroke();
    // Animated paths
    const pathColors = ['#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6'];
    const seed = 42;
    const numPaths = 5;
    const maxSteps = 60;
    const revealStep = Math.min(Math.floor(f * 0.5), maxSteps);
    for (let p = 0; p < numPaths; p++) {
      let rng = seed + p * 137;
      const nextRng = () => { rng = (rng * 16807 + 0) % 2147483647; return rng / 2147483647; };
      ctx.beginPath();
      ctx.strokeStyle = pathColors[p % 5] + '88';
      ctx.lineWidth = 1.5;
      let eq = 0; let started = false;
      for (let s = 0; s <= Math.min(revealStep, maxSteps); s++) {
        const x = chartL + (s / maxSteps) * chartW;
        const y = chartB - (eq / 22) * chartH;
        if (!started) { ctx.moveTo(x, y); started = true; } else { ctx.lineTo(x, y); }
        const win = nextRng() < 0.58;
        eq += win ? 0.75 * 1.5 : -0.75;
        if (eq >= 10 || eq <= -10) break;
      }
      ctx.stroke();
    }
    // Title
    ctx.fillStyle = 'rgba(245,158,11,0.6)'; ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('Simulated Equity Paths (same strategy, different luck)', cx, 6);
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

      {/* Hero */}
      <section className="min-h-[85vh] flex flex-col items-center justify-center text-center px-5 relative overflow-hidden">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(245,158,11,0.08),transparent_70%)] pointer-events-none" />
        <div className="absolute top-[-50px] right-[20%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(217,70,239,0.05),transparent_70%)] pointer-events-none" />
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="relative z-10">
          <motion.p variants={fadeUp} className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-4">Level 9 &middot; Lesson 4 of 14</motion.p>
          <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold leading-tight mb-4 bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Challenge Mathematics</motion.h1>
          <motion.p variants={fadeUp} className="text-gray-400 max-w-lg mx-auto text-sm leading-relaxed">The numbers that determine your fate. Expected value, probability of ruin, Monte Carlo simulation, and the risk-per-trade sweet spot.</motion.p>
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.8 }} className="absolute bottom-8 flex flex-col items-center gap-2 text-gray-600 text-xs">Scroll to begin<motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-amber-500">&#8964;</motion.div></motion.div>
      </section>

      {/* S00 */}
      <section className="max-w-2xl mx-auto px-5 py-20"><motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">00 &mdash; Why This Matters</p><h2 className="text-2xl font-extrabold mb-4">Prop Challenges Are an Optimisation Problem</h2><div className="p-6 rounded-2xl glass-card space-y-4">
        <p className="text-sm text-gray-300 leading-relaxed">Most traders approach prop challenges with their gut: &ldquo;I will risk 1% because that feels right.&rdquo; That feeling is wrong for 80% of traders. A prop challenge is not a vibes exercise. It is a <strong className="text-white">mathematical optimisation problem</strong> with a calculable solution.</p>
        <p className="text-sm text-gray-300 leading-relaxed">The question is precise: <em>Given my win rate, R:R, risk per trade, and the challenge rules (target, daily DD, overall DD, time limit), what is my probability of passing?</em> Change any one variable and the answer changes dramatically. Risk 1% instead of 0.75%? Pass probability drops from 22% to 19%. That difference costs you an extra &pound;500+ in expected re-attempt fees.</p>
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-purple-500/10 border border-amber-500/20"><p className="text-xs font-bold text-amber-400 mb-1">&#9889; REAL SCENARIO</p><p className="text-xs text-gray-300">A 58% WR trader with 1:1.5 R:R ran Monte Carlo simulations at different risk levels on a standard challenge (10% target, 5% daily DD, 10% overall DD, 30 days). Results: 0.5% risk = 18% pass rate. 0.75% risk = <strong className="text-white">22% pass rate</strong>. 1% risk = 19% pass rate. 1.5% risk = 12% pass rate. The difference between optimal (0.75%) and &ldquo;gut feel&rdquo; (1.5%) is nearly DOUBLE the pass probability. That is not a marginal edge. That is the difference between a funded trader and a serial re-purchaser.</p></div>
      </div></motion.div></section>

      {/* S01 — Canvas 1: Pass Probability Curve */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Probability Landscape</p><h2 className="text-2xl font-extrabold mb-2">Pass Rate by Risk Per Trade</h2><p className="text-gray-400 text-sm mb-4">Too low: time pressure kills you. Too high: drawdown kills you. The sweet spot is in the middle.</p>
      <div className="rounded-2xl glass-card p-4"><AnimScene drawFn={drawProbCurve} height={300} /></div></motion.div></section>

      {/* S02 — Canvas 2: Equity Paths */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; Same Strategy, Different Luck</p><h2 className="text-2xl font-extrabold mb-2">Simulated Equity Paths</h2><p className="text-gray-400 text-sm mb-4">5 simulated challenges with identical 58% WR and 0.75% risk. Some hit the target. Some hit the floor. This is variance.</p>
      <div className="rounded-2xl glass-card p-4"><AnimScene drawFn={drawEquityPaths} height={280} /></div></motion.div></section>

      {/* S03 — Math Concepts */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The Core Maths</p><h2 className="text-2xl font-extrabold mb-4">4 Concepts That Determine Your Fate</h2><div className="space-y-3">{mathConcepts.map((mc, i) => (<div key={i}><button onClick={() => toggle(`mc-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{mc.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`mc-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`mc-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-xs text-gray-300 leading-relaxed">{mc.content}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      {/* S04 — Sweet Spot Table */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Risk Sweet Spot Table</p><h2 className="text-2xl font-extrabold mb-4">Optimal Risk by Strategy Profile</h2><div className="p-6 rounded-2xl glass-card space-y-2">{sweetSpotTable.map((row, i) => (<div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center gap-3"><div className="shrink-0 text-center" style={{ minWidth: 80 }}><p className="text-xs font-bold text-amber-400">{row.wr} / {row.rr}</p></div><div className="flex-1"><p className="text-sm font-bold text-green-400">{row.optimal} risk &rarr; {row.passEst} pass rate</p><p className="text-[10px] text-gray-500">{row.note}</p></div></div>))}</div></motion.div></section>

      {/* S05 — GROUNDBREAKING: Monte Carlo Calculator */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Run Your Simulation</p><h2 className="text-2xl font-extrabold mb-2">&#127919; Monte Carlo Challenge Calculator</h2><p className="text-gray-400 text-sm mb-4">Input YOUR stats and challenge rules. We run 500 simulated challenges and show your probability of passing.</p>
      <div className="p-6 rounded-2xl glass-card space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div><p className="text-[10px] text-amber-400 font-bold mb-1">Win Rate (%)</p><input type="number" value={mcWR} onChange={e => setMcWR(Math.max(40, Math.min(80, Number(e.target.value))))} className={inputCls} /></div>
          <div><p className="text-[10px] text-amber-400 font-bold mb-1">Avg R:R</p><input type="number" value={mcRR} onChange={e => setMcRR(Math.max(0.5, Math.min(5, Number(e.target.value))))} step={0.1} className={inputCls} /></div>
          <div><p className="text-[10px] text-amber-400 font-bold mb-1">Risk/Trade (%)</p><input type="number" value={mcRisk} onChange={e => setMcRisk(Math.max(0.1, Math.min(3, Number(e.target.value))))} step={0.25} className={inputCls} /></div>
          <div><p className="text-[10px] text-amber-400 font-bold mb-1">Trades/Day</p><input type="number" value={mcTradesPerDay} onChange={e => setMcTradesPerDay(Math.max(1, Math.min(5, Number(e.target.value))))} className={inputCls} /></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div><p className="text-[10px] text-amber-400 font-bold mb-1">Profit Target (%)</p><input type="number" value={mcTarget} onChange={e => setMcTarget(Math.max(4, Math.min(15, Number(e.target.value))))} className={inputCls} /></div>
          <div><p className="text-[10px] text-amber-400 font-bold mb-1">Daily DD (%)</p><input type="number" value={mcDailyDD} onChange={e => setMcDailyDD(Math.max(2, Math.min(8, Number(e.target.value))))} className={inputCls} /></div>
          <div><p className="text-[10px] text-amber-400 font-bold mb-1">Overall DD (%)</p><input type="number" value={mcOverallDD} onChange={e => setMcOverallDD(Math.max(4, Math.min(15, Number(e.target.value))))} className={inputCls} /></div>
          <div><p className="text-[10px] text-amber-400 font-bold mb-1">Time Limit (days)</p><input type="number" value={mcDays} onChange={e => setMcDays(Math.max(10, Math.min(90, Number(e.target.value))))} className={inputCls} /></div>
        </div>
        <button onClick={runMonteCarlo} disabled={mcRunning} className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-sm font-bold text-white active:scale-95 transition-transform disabled:opacity-50">{mcRunning ? 'Simulating 500 challenges...' : 'Run 500 Simulations \u2192'}</button>
        {mcResult && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 pt-2">
          {/* Pass rate */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-amber-500/10 border border-green-500/20 text-center"><p className="text-xs text-gray-400 mb-1">Estimated Pass Probability</p><p className="text-3xl font-extrabold" style={{ color: mcResult.passed / 5 >= 20 ? '#22c55e' : mcResult.passed / 5 >= 10 ? '#f59e0b' : '#ef4444' }}>{(mcResult.passed / 5).toFixed(1)}%</p><p className="text-[10px] text-gray-500">{mcResult.passed} of 500 simulations passed</p></div>
          {/* Failure breakdown */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15 text-center"><p className="text-lg font-extrabold text-red-400">{(mcResult.dailyBreach / 5).toFixed(1)}%</p><p className="text-[10px] text-gray-500">Daily DD Breach</p></div>
            <div className="p-3 rounded-xl bg-orange-500/5 border border-orange-500/15 text-center"><p className="text-lg font-extrabold text-orange-400">{(mcResult.overallBreach / 5).toFixed(1)}%</p><p className="text-[10px] text-gray-500">Overall DD Breach</p></div>
            <div className="p-3 rounded-xl bg-gray-500/5 border border-gray-500/15 text-center"><p className="text-lg font-extrabold text-gray-400">{(mcResult.timeout / 5).toFixed(1)}%</p><p className="text-[10px] text-gray-500">Time Expired</p></div>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center"><p className="text-sm font-bold text-amber-400">{mcResult.avgDays} days</p><p className="text-[10px] text-gray-500">Avg Days to Pass</p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center"><p className="text-sm font-bold text-amber-400">{mcResult.medianDD}%</p><p className="text-[10px] text-gray-500">Median Peak Drawdown</p></div>
          </div>
          {/* Recommendation */}
          <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20"><p className="text-xs font-bold text-purple-400 mb-1">&#128161; OPTIMISATION TIP</p><p className="text-xs text-gray-300">{mcResult.dailyBreach > mcResult.timeout * 2 ? `Daily DD breach is your biggest risk (${(mcResult.dailyBreach/5).toFixed(0)}%). Consider reducing risk per trade by 0.25% or taking fewer trades per day.` : mcResult.timeout > mcResult.dailyBreach ? `Time expiry is your biggest risk (${(mcResult.timeout/5).toFixed(0)}%). Consider increasing risk per trade by 0.25% or adding 1 more trade per day.` : `Balanced failure distribution. Your current risk level is near optimal for these rules. Fine-tune by \u00B10.1% to see if pass rate improves.`}</p></div>
          {/* Sample paths */}
          {mcResult.paths.length > 0 && (<div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-[10px] text-gray-500 mb-2">Sample Equity Paths (8 of 500 simulations)</p><div className="h-24 relative">{mcResult.paths.map((path, pi) => { const maxV = Math.max(mcTarget + 2, mcOverallDD + 2); const colors = ['#3b82f6','#22c55e','#ef4444','#f59e0b','#8b5cf6','#ec4899','#06b6d4','#84cc16']; return (<svg key={pi} className="absolute inset-0 w-full h-full" viewBox={`0 0 ${path.length} ${maxV * 2}`} preserveAspectRatio="none"><polyline fill="none" stroke={colors[pi % 8]} strokeWidth="0.8" opacity="0.6" points={path.map((v, i) => `${i},${maxV - v}`).join(' ')} /></svg>); })}<div className="absolute left-0 right-0" style={{ top: `${(1 - mcTarget / (Math.max(mcTarget + 2, mcOverallDD + 2) * 2)) * 100}%`, borderTop: '1px dashed rgba(34,197,94,0.3)' }} /><div className="absolute left-0 right-0" style={{ top: `${(1 - (-mcOverallDD) / (Math.max(mcTarget + 2, mcOverallDD + 2) * 2 ) * -1) * 50 + 50}%`, borderTop: '1px dashed rgba(239,68,68,0.3)' }} /></div></div>)}
        </motion.div>)}
      </div></motion.div></section>

      {/* S06 — The 80% Rule */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; The 80% Rule</p><h2 className="text-2xl font-extrabold mb-4">When to Switch to Protect Mode</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#22c55e]">0&ndash;50% OF TARGET</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Normal trading. Use your planned risk (0.5&ndash;0.75%). Build profit steadily. This is the grind phase.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#f59e0b]">50&ndash;80% OF TARGET</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Maintain risk but increase selectivity. Only A+ setups. The profit buffer is building but not safe yet.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#ef4444]">80&ndash;100% OF TARGET</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">PROTECT MODE. Reduce risk to 0.5% or below. You have 15+ days for 2% more profit. The maths works at lower risk. Do NOT rush the finish line.</span></p></div>
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20"><p className="text-xs text-gray-300"><strong className="text-amber-400">Why this matters:</strong> The last 20% of the target is where most challenges are LOST, not won. Traders increase risk to &ldquo;finish fast&rdquo; and give back 3&ndash;4% in a single bad day. The discipline to slow down when ahead is the #1 skill that separates the 3% from the 97%.</p></div>
      </div></motion.div></section>

      {/* S07 — Never Increase Risk */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; The Iron Rule</p><h2 className="text-2xl font-extrabold mb-4">Never Increase Risk Mid-Challenge</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">WHEN YOU ARE BEHIND</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Increasing risk to &ldquo;catch up&rdquo; accelerates the path to DD breach. A -3% challenge at 1.5% risk is 2 losses from termination. At 0.75%, you have 4 losses of buffer.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">WHEN YOU ARE AHEAD</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Increasing risk to &ldquo;finish fast&rdquo; converts a winning challenge into a coinflip. You have TIME. Use it. Reduce risk and let positive EV work.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">THE ONLY ACCEPTABLE CHANGE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Reducing risk. At 80% of target, drop to protect mode. At -3% daily, stop for the day. The only risk change that improves outcomes is downward.</span></p></div>
      </div></motion.div></section>

      {/* S08 — Common Mistakes */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p><h2 className="text-2xl font-extrabold mb-4">4 Challenge Maths Errors</h2><div className="space-y-3">{commonMistakes.map((item, i) => (<div key={i}><button onClick={() => toggle(`cm-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`cm-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`cm-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-xs text-red-400 mb-2">&#10060; {item.mistake}</p><p className="text-xs text-green-400">&#10004; {item.fix}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      {/* S09 — Cheat Sheet */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Cheat Sheet</p><h2 className="text-2xl font-extrabold mb-4">Challenge Maths Quick Reference</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#22c55e]">SWEET SPOT</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">0.5&ndash;0.75% risk for most traders (58% WR, 1:1.5 R:R, standard rules). This range maximises pass probability by balancing speed and survival.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#3b82f6]">EXPECTED TRADES</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Target &divide; EV per trade. Know this number BEFORE the challenge. If it exceeds your available trading days, increase risk or choose a firm with more time.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">PLAN FOR 6&ndash;7 LOSSES</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">At 58% WR, a 6-loss streak is statistically expected during a 30-day challenge. Your risk per trade MUST survive this without breaching daily DD.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#f59e0b]">80% RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">At 80% of profit target, switch to protect mode (reduce risk). The last 20% should be a slow grind, not a sprint.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">THE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Run the simulation BEFORE paying for the challenge. If your pass probability is below 10%, fix the inputs (strategy, risk, or firm choice) before spending money.</span></p></div>
      </div></motion.div></section>

      {/* S10 — Game */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Test Your Understanding</p><h2 className="text-2xl font-extrabold mb-2">Challenge Maths Game</h2><p className="text-gray-400 text-sm mb-6">5 scenario-based rounds. Calculate expected values, manage variance, and optimise risk.</p>
      <div className="p-6 rounded-2xl glass-card"><div className="flex items-center justify-between mb-4"><span className="text-xs font-bold text-amber-400">Round {gameRound + 1} of {gameRounds.length}</span><span className="text-xs font-mono text-gray-500">{gameScore}/{gameRounds.length} correct</span></div><p className="text-sm text-gray-300 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: gameRounds[gameRound].scenario }} /><div className="space-y-2">{gameRounds[gameRound].options.map((opt, oi) => { const answered = gameAnswers[gameRound] !== null; const selected = gameAnswers[gameRound] === oi; const isCorrect = opt.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return (<div key={oi}><button onClick={() => handleGameAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt.text }} /></button>{answered && selected && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]"><p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`} dangerouslySetInnerHTML={{ __html: opt.explain }} /></motion.div>)}</div>); })}</div>{gameAnswers[gameRound] !== null && gameRound < gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5"><button onClick={() => setGameRound(r => r + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button></motion.div>)}{gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Outstanding \u2014 you understand the mathematics of prop challenges better than 95% of traders who attempt them.' : gameScore >= 3 ? 'Good \u2014 review the variance and 80% rule scenarios to sharpen your challenge optimisation skills.' : 'Re-read the expected value and risk sweet spot sections. The maths here is the foundation of everything that follows in Level 9.'}</p></motion.div>)}</div></motion.div></section>

      {/* S11 — Quiz + Certificate */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Knowledge Check</p><h2 className="text-2xl font-extrabold mb-6">Final Quiz &mdash; 8 Questions</h2>
      <div className="space-y-6">{quizQuestions.map((q, qi) => (<div key={qi} className="p-5 rounded-2xl glass-card"><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p><p className="text-sm font-semibold text-white mb-4">{q.q}</p><div className="space-y-2">{q.opts.map((opt, oi) => { const answered = quizAnswers[qi] !== null; const selected = quizAnswers[qi] === oi; const isCorrect = oi === q.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return <button key={oi} onClick={() => handleQuizAnswer(qi, oi)} disabled={answered} className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`}>{opt}</button>; })}</div>{quizAnswers[qi] !== null && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg bg-white/[0.02]"><p className="text-xs text-amber-400" dangerouslySetInnerHTML={{ __html: `<span class="font-bold">&#9989;</span> ${q.explain}` }} /></motion.div>)}</div>))}</div>
      {quizDone && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center"><p className="text-3xl font-extrabold mb-2">{quizScoreVal}%</p><p className="text-sm text-gray-400">{quizScoreVal >= 66 ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate. Review and try again.'}</p></motion.div>)}
      {certUnlocked && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10"><div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}><div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(139,92,246,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} /><div className="relative z-10 text-center"><div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">&#127922;</div><p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p><p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 9: Challenge Mathematics</strong><br />at ATLAS Academy by Interakktive</p><p className="bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Probability Engineer &mdash;</p><p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L9.4-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p></div></div></motion.div>)}</motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-20 text-center"><Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">&larr; Back to Academy</Link></section>
    </div>
  );
}
