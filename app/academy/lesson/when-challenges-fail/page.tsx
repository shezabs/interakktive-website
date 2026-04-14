// app/academy/lesson/when-challenges-fail/page.tsx
// ATLAS Academy — Lesson 9.12: When Challenges Fail [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 9
// GROUNDBREAKING: Challenge Failure Analyser — gap diagnosis + root cause + recovery plan
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
const failureTypes = [
  { type: 'Strategy Failure', emoji: '\ud83d\udcc9', desc: 'Your edge did not hold during the challenge. Win rate dropped significantly below normal. The market conditions were unfavourable for your strategy, or your strategy has a flaw that only appears under certain conditions.', signs: 'Win rate dropped 10%+ below normal. Losses were clean (followed your rules) but the setups did not work. Multiple A-grade setups failed.', recovery: 'Back to demo for 2\u20134 weeks. Test whether the strategy works in current market conditions. If it does, the failure was timing. If it does not, the strategy needs adjustment before another attempt.', color: '#3b82f6', waitWeeks: 3 },
  { type: 'Execution Failure', emoji: '\u26A0\uFE0F', desc: 'Your strategy works, but you deviated from it. Entered trades that were not in the plan. Moved stop losses. Held through news you should have avoided. Traded outside your designated session.', signs: 'Win rate similar to normal but risk:reward was worse. You took B/C-grade setups. You traded outside planned sessions. You moved stops on 2+ trades.', recovery: 'Print your trading plan and pin it next to your screen. For the next 2 weeks on demo, check EVERY entry against the plan before executing. Journal every deviation. Only re-attempt when you complete 2 weeks with zero deviations.', color: '#f59e0b', waitWeeks: 2 },
  { type: 'Psychological Failure', emoji: '\ud83e\udde0', desc: 'Revenge trading, over-sizing after losses, paralysis near the target, or time-pressure-driven decisions. The strategy and execution were fine \u2014 your emotions overrode your system.', signs: 'Risk per trade increased after losses. You traded more frequently after losing days. You froze near the target and took early exits. You deviated from the 2-loss rule.', recovery: 'Do NOT re-attempt for at least 3 weeks. Spend Week 1 journalling what happened emotionally. Week 2 on demo with the explicit goal of following the 2-loss rule perfectly. Week 3 on demo with simulated challenge conditions. Only re-attempt after 3 consecutive weeks of emotional discipline.', color: '#ef4444', waitWeeks: 3 },
  { type: 'Variance (Bad Luck)', emoji: '\ud83c\udfb2', desc: 'Your stats during the challenge were within normal range. You followed your rules. The market just did not cooperate within the time window. This is statistically expected \u2014 even a 60% WR trader will have losing streaks.', signs: 'Win rate within 5% of normal. Risk:reward within normal range. No rule violations. You simply hit the drawdown limit through normal variance or ran out of time.', recovery: 'This is the ONLY failure type where immediate re-attempt is reasonable. Wait 1 week for emotional reset, confirm your stats are genuine (not rationalising), and re-attempt. No strategy or execution changes needed.', color: '#22c55e', waitWeeks: 1 },
];

const threeStrikeRule = [
  { strike: 'Strike 1', action: 'Diagnose: which of the 4 failure types? Apply the specific recovery protocol. Re-attempt after the recommended waiting period.', color: '#22c55e' },
  { strike: 'Strike 2', action: 'Deeper diagnosis: is there a PATTERN across both failures? Same failure type = systemic issue. Different types = bad luck or compounding stress. Extend recovery period by 1 week.', color: '#f59e0b' },
  { strike: 'Strike 3', action: 'STOP. 3 failures on the same challenge means the problem is not luck. Step back to demo for a full month. Rebuild confidence. Consider a different firm, different account size, or different strategy adaptation. Do NOT purchase a 4th attempt immediately.', color: '#ef4444' },
];

const costBenefit = [
  { attempts: 1, cost: 300, totalCost: 300, funded: false },
  { attempts: 2, cost: 300, totalCost: 600, funded: false },
  { attempts: 3, cost: 300, totalCost: 900, funded: true },
  { attempts: 4, cost: 0, totalCost: 900, funded: true },
  { attempts: 5, cost: 0, totalCost: 900, funded: true },
  { attempts: 6, cost: 0, totalCost: 900, funded: true },
];

const reAttemptTree = [
  { timeframe: 'Within 48 Hours', verdict: 'NEVER', color: '#ef4444', reason: 'Emotional decision, not rational. You are paying to feel better, not to pass. The failure is still raw. Every re-attempt decision made within 48 hours of failure is statistically more likely to result in another failure.' },
  { timeframe: '1 Week', verdict: 'ANALYSE ONLY', color: '#f59e0b', reason: 'Use this week to diagnose the failure type. Review your journal. Calculate your stats. Do NOT purchase another challenge yet. This is the diagnosis phase, not the action phase.' },
  { timeframe: '2 Weeks', verdict: 'DEMO TEST', color: '#3b82f6', reason: 'If the diagnosis identified a specific fix, test it on demo for 1\u20132 weeks. Simulated challenge conditions: same rules, same risk, same daily limit. If you pass the simulated challenge, you are ready.' },
  { timeframe: '3+ Weeks', verdict: 'RATIONAL DECISION', color: '#22c55e', reason: 'Now you can make a clear-headed decision. You have diagnosed the failure, tested the fix, and confirmed the fix works. Purchase the next challenge from a position of confidence, not desperation.' },
];

const commonMistakes = [
  { title: 'Immediate Re-Purchase After Failure', mistake: '"I know what went wrong, I will just try again immediately." The failure is still emotionally raw. You have not tested any fix. You are paying to feel better, not to improve. Studies show re-attempts within 48 hours have a significantly lower pass rate than those taken after a structured recovery period.', fix: 'Minimum 1-week cooldown. Diagnose first. Test the fix on demo. THEN re-attempt. Every week you wait costs nothing. Every premature re-attempt costs \u00A3300+.' },
  { title: 'Not Diagnosing the Failure Type', mistake: '"It just did not work out." This is not a diagnosis. Without identifying whether the failure was strategy, execution, psychology, or variance, you will repeat the same mistake. Each failure type has a completely different recovery protocol.', fix: 'After every failure: (1) Calculate your challenge stats (WR, R:R, trades taken, max DD). (2) Compare to your normal stats. (3) Identify the gap. (4) Match to one of the 4 failure types. (5) Follow that type\u2019s specific recovery protocol.' },
  { title: 'Blaming Variance When It Was Psychology', mistake: '"I just had bad luck." Be honest: did you follow every rule? Did you increase risk after losses? Did you trade outside your session? Did you take B-grade setups? If ANY of these are true, it was not pure variance \u2014 psychology was involved.', fix: 'The variance diagnosis requires: WR within 5% of normal, R:R within normal range, AND zero rule violations. If any condition is not met, it is NOT variance. Downgrading from psychology to variance is the most common self-deception in prop trading.' },
  { title: 'Ignoring the 3-Strike Rule', mistake: '"Third time lucky." If you have failed the same challenge 3 times, the problem is systemic. Purchasing a 4th attempt without fundamental changes is burning money. The definition of insanity is doing the same thing and expecting different results.', fix: 'After 3 failures: mandatory 1-month pause. Back to demo. Consider: different firm (maybe the rules do not suit your style), different account size (smaller = less pressure), different strategy adaptation (maybe your challenge parameters need changing). Only re-attempt after a genuine change.' },
];

const gameRounds = [
  { scenario: '<strong>Failure diagnosis:</strong> You failed a \u00A3100K challenge after 18 days. Stats during challenge: 52% WR (normal: 58%), 1:1.6 R:R (normal: 1:1.8), 22 trades taken (normal pace). Maximum DD reached: 8.2% of 10%. No rule violations \u2014 you followed your plan perfectly. What type of failure was this?', options: [
    { text: 'Psychology \u2014 you must have been stressed to perform worse than normal', correct: false, explain: 'No rule violations were detected. You followed the plan. The WR and R:R drops are within a range that could be explained by market conditions, not emotional decisions. Psychology failures show specific signs: increased risk, rule violations, trading outside sessions.' },
    { text: 'Strategy \u2014 your edge underperformed in these market conditions. WR dropped 6% and R:R dropped 0.2. No rule violations means you executed correctly but the setups did not deliver. Test on demo for 2\u20134 weeks to see if conditions have changed.', correct: true, explain: 'Correct diagnosis. WR dropped 6% (significant), R:R dropped slightly, but crucially there were zero rule violations. This means you executed your strategy faithfully but the market did not cooperate. This could be a temporary condition or a strategy limitation. Demo testing will reveal which.' },
    { text: 'Variance \u2014 the stats are close enough to normal, it was just bad luck', correct: false, explain: 'A 6% WR drop (52% vs 58%) is at the edge of the variance threshold. The 5% rule says within 5% = variance, beyond 5% = investigate further. At 6% drop plus R:R degradation, this is more likely a strategy issue than pure luck.' },
  ]},
  { scenario: '<strong>Re-attempt timing:</strong> You failed your challenge 3 days ago due to revenge trading after 2 consecutive losses on Day 12. You breached the daily drawdown limit by 0.8%. Your friend sent you a discount code for 20% off a new challenge that expires tomorrow. What do you do?', options: [
    { text: 'Use the discount code immediately \u2014 20% savings is significant and you know what went wrong (revenge trading).', correct: false, explain: 'The discount creates artificial urgency. You failed 3 days ago from revenge trading \u2014 the exact emotional pattern that suggests you need a cooling period, not a faster re-attempt. The \u00A360\u201380 you save on the discount will be wasted if you fail again for the same reason.' },
    { text: 'Let the code expire. You failed from a psychological issue (revenge trading) which requires at least 3 weeks of recovery: 1 week journalling, 1 week demo discipline, 1 week simulated challenge. No discount is worth repeating the same mistake.', correct: true, explain: 'Textbook response. Psychological failure requires the longest recovery period. Revenge trading is a pattern, not a one-time event. If you re-attempt without addressing the root cause, the same situation (2 consecutive losses) will trigger the same response. The discount is a psychological trap \u2014 it exploits your desire to "get back in" quickly.' },
    { text: 'Use the code but do not start trading for 2 weeks \u2014 this way you get the discount and the cooling period.', correct: false, explain: 'Purchasing the challenge now, even with delayed trading, puts financial and emotional pressure on you. You will KNOW the challenge is sitting there waiting. This creates subtle urgency that undermines the recovery process. Buy when you are ready, not when it is cheap.' },
  ]},
  { scenario: '<strong>3-Strike scenario:</strong> You have failed the same \u00A350K challenge 3 times. Failure 1: daily DD breach (bad luck \u2014 3 losses in a row, clean entries). Failure 2: time expired at +4.2% (target was 8%). Failure 3: overall DD breach from slow bleed over 3 weeks. What do you do?', options: [
    { text: 'Try a 4th time \u2014 the failures were all different types, so there is no single systemic issue. You are just unlucky.', correct: false, explain: 'Three DIFFERENT failure modes is not reassuring \u2014 it suggests multiple issues. Failure 1 (variance) was arguably bad luck. Failure 2 (too slow to hit target) suggests the strategy does not generate enough return for this challenge\u2019s parameters. Failure 3 (slow bleed) suggests the strategy underperforms in funded conditions. The pattern is: your strategy does not match this firm\u2019s rules.' },
    { text: 'Stop. 3 failures triggers the mandatory pause. 1 month demo. But the real insight is: 3 different failure modes on the same challenge means the firm\u2019s RULES do not match your strategy. Consider a different firm with wider DD limits or a lower profit target.', correct: true, explain: 'This is the key Level 9 insight. The 3-strike rule is not just about pausing \u2014 it is about diagnosing WHY this specific challenge keeps failing. Different failure modes each time suggests the challenge parameters (DD limits, target, time) are at the edge of what your strategy can handle. A firm with 5% daily DD instead of 3%, or 6% target instead of 8%, might be passable with the same strategy. Change the firm, not (necessarily) the strategy.' },
    { text: 'Increase your risk per trade to 1.5% to reach the target faster next time.', correct: false, explain: 'Increasing risk amplifies all 3 failure modes: DD breach happens faster, slow bleed accelerates, and if you are behind target, higher risk makes the daily DD even more dangerous. The solution is never "risk more" \u2014 it is "match better."' },
  ]},
  { scenario: '<strong>Cost-benefit analysis:</strong> A challenge costs \u00A3400. If you pass, the funded account earns approximately \u00A31,500/month (after split). You have failed twice (\u00A3800 total spent). Your normal pass rate across all attempts is about 30%. Should you purchase a 3rd attempt?', options: [
    { text: 'No \u2014 you have already spent \u00A3800. Cut your losses.', correct: false, explain: 'Sunk cost fallacy in reverse. The \u00A3800 is gone regardless. The question is: does the NEXT \u00A3400 have positive expected value? At 30% pass rate: EV = 0.30 \u00D7 \u00A31,500/month \u00D7 6 months average survival \u2212 \u00A3400 = \u00A32,300 expected value. The math strongly favours another attempt.' },
    { text: 'Yes \u2014 at a 30% pass rate, the expected value is strongly positive. 30% \u00D7 (\u00A31,500/month \u00D7 6 months) \u2212 \u00A3400 = +\u00A32,300 expected value. As long as you have diagnosed and fixed the previous failures, the math supports a 3rd attempt.', correct: true, explain: 'Correct EV calculation. Each \u00A3400 attempt has an expected return of \u00A32,300. Even at a 15% pass rate: 0.15 \u00D7 \u00A39,000 \u2212 \u00A3400 = +\u00A3950. The breakeven pass rate for this challenge is just 4.4%. As long as your pass rate exceeds ~5%, every attempt has positive expected value. The caveat: this only works if you are genuinely improving between attempts, not repeating the same mistakes.' },
    { text: 'Only if you can get a discount on the 3rd challenge.', correct: false, explain: 'The discount is irrelevant to the decision. At 30% pass rate, the full-price \u00A3400 attempt has +\u00A32,300 EV. A \u00A3320 discounted attempt has +\u00A32,380 EV. The \u00A380 difference is noise compared to the \u00A32,300 expected value. Do not let small discounts drive major decisions \u2014 focus on the pass rate and monthly income, not the challenge fee.' },
  ]},
  { scenario: '<strong>Honest self-assessment:</strong> You failed a challenge and your journal shows: WR 56% (normal 58%), R:R 1:1.7 (normal 1:1.8), BUT you also moved your stop loss on 2 trades (both became losses) and traded during NFP despite your plan saying to flatten before news. You want to classify this as variance. Is it?', options: [
    { text: 'Yes, it is variance \u2014 the WR and R:R are within 5% of normal.', correct: false, explain: 'The stats look like variance, but you violated 2 rules: moving stops and trading through NFP. Those 2 violations may have been the 2 losses that pushed you over the DD limit. The stats are contaminated by execution/psychological errors. You cannot claim variance when rule violations occurred.' },
    { text: 'No \u2014 the rule violations (moved stops, traded through NFP) disqualify this from being classified as variance. This is execution failure at minimum, possibly with psychological elements. The stats LOOK close to normal but are contaminated by the violations.', correct: true, explain: 'Correct. Variance requires ZERO rule violations. The 2 moved stops and the NFP trade break this condition. If those 2 trades were losses (which they were), removing them might bring the WR above 58%. The "variance" was actually created by the violations. This is the most common self-deception: rationalising execution failure as bad luck because the headline numbers look close.' },
    { text: 'Partially \u2014 the WR drop was variance but the rule violations were execution failure.', correct: false, explain: 'You cannot separate them. The rule violations affected the WR. Without the 2 violations, the WR might have been 60%+ (which would be ABOVE normal). The entire challenge result is contaminated. Classify the WHOLE failure by the worst element present: execution failure with possible psychological triggers (why did you move stops? why did you ignore the NFP rule?).' },
  ]},
];

const quizQuestions = [
  { q: 'What are the 4 types of challenge failure?', opts: ['Win, loss, breakeven, timeout', 'Strategy failure, execution failure, psychological failure, and variance (bad luck)', 'Daily DD, overall DD, consistency, time', 'Beginner, intermediate, advanced, expert'], correct: 1, explain: 'The 4 failure types each have completely different recovery protocols. Strategy failure = your edge underperformed. Execution failure = you deviated from the plan. Psychological failure = emotions overrode your system. Variance = bad luck within normal statistical range.' },
  { q: 'What distinguishes variance from other failure types?', opts: ['Variance means you lost money', 'Variance requires: WR within 5% of normal, R:R within normal range, AND zero rule violations \u2014 all 3 conditions must be met simultaneously', 'Variance means the market moved against you', 'Variance is the most common failure type'], correct: 1, explain: 'All 3 conditions must be met. If WR dropped 8% (strategy), or you moved stops (execution), or you increased risk after losses (psychology), it is NOT variance \u2014 even if the other metrics look normal. Variance is a diagnosis of exclusion.' },
  { q: 'What does the 3-strike rule mean?', opts: ['You get 3 free re-attempts', 'After 3 failures on the same challenge: mandatory pause, 1 month demo, and consider changing the firm or approach rather than purchasing a 4th attempt', 'You must win 3 challenges to become funded', 'You can risk up to 3% per trade'], correct: 1, explain: '3 failures = systemic issue. The problem is not luck. Either the firm\u2019s rules do not match your strategy, or there is a deeper execution/psychology pattern that needs fundamental change. A 4th attempt without genuine change is burning money.' },
  { q: 'What is the minimum recommended waiting period after a psychological failure?', opts: ['48 hours', '1 week', '3 weeks minimum: 1 week journalling, 1 week demo discipline, 1 week simulated challenge conditions', '6 months'], correct: 2, explain: 'Psychological failures (revenge trading, over-sizing, paralysis) require the longest recovery. 1 week alone is not enough \u2014 you need to identify the pattern (journalling), prove you can control it (demo discipline), and test under realistic pressure (simulated challenge) before risking another fee.' },
  { q: 'At a 30% pass rate with \u00A3400 challenge fee and \u00A31,500/month funded income (6-month survival), what is the expected value of one attempt?', opts: ['\u2212\u00A3400 (you lose the fee)', '+\u00A32,300 (30% \u00D7 \u00A39,000 \u2212 \u00A3400)', '+\u00A3100', '+\u00A31,500'], correct: 1, explain: '0.30 \u00D7 (\u00A31,500 \u00D7 6) \u2212 \u00A3400 = 0.30 \u00D7 \u00A39,000 \u2212 \u00A3400 = \u00A32,700 \u2212 \u00A3400 = +\u00A32,300. Even with a 70% failure rate, the expected value is strongly positive. The breakeven pass rate is only ~4.4%.' },
  { q: 'Why should you NOT re-attempt within 48 hours of failure?', opts: ['The firm will not allow it', 'Because the emotional impact of failure is still raw, decisions made within 48 hours are driven by loss aversion and sunk cost, not rational analysis, leading to statistically lower pass rates on immediate re-attempts', 'To save money', 'There is no reason \u2014 immediate re-attempts are fine'], correct: 1, explain: 'The 48-hour rule exists because the brain has not processed the failure yet. You are paying to feel better (regaining control after loss), not to improve. The diagnosis has not been done. The fix has not been tested. Every component of a rational re-attempt is missing.' },
  { q: 'Your challenge stats show 54% WR (normal 58%) and you moved stops on 3 trades. Is this variance?', opts: ['Yes \u2014 54% is close enough to 58%', 'No \u2014 the 3 rule violations (moved stops) disqualify this from being classified as variance, regardless of how close the WR appears', 'Partially variance, partially execution', 'Cannot determine without more data'], correct: 1, explain: 'Variance requires ZERO rule violations. Moving stops 3 times is an execution failure. The WR may have been closer to (or above) normal without those violations. The stats are contaminated and cannot be used to claim variance.' },
  { q: 'After 3 failures with 3 DIFFERENT failure modes on the same challenge, what is the most likely root cause?', opts: ['Pure bad luck \u2014 3 different types means no pattern', 'The challenge parameters (DD limits, profit target, time limit) are at the edge of what your strategy can handle \u2014 consider a different firm with rules that better match your style', 'Your strategy is fundamentally broken', 'You need more trading education'], correct: 1, explain: 'Different failure modes each time = the challenge is borderline for your strategy. DD breach, time expiry, and slow bleed are all ways of saying "the parameters are too tight." A firm with wider DD, lower target, or more time might be passable with the SAME strategy. Change the firm, not necessarily the approach.' },
];

export default function WhenChallengesFail() {
  const [scrollY, setScrollY] = useState(0);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [gameRound, setGameRound] = useState(0);
  const [gameAnswers, setGameAnswers] = useState<(number | null)[]>(Array(gameRounds.length).fill(null));
  const [gameScore, setGameScore] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(Array(quizQuestions.length).fill(null));
  const [showConfetti, setShowConfetti] = useState(false);
  const [certUnlocked, setCertUnlocked] = useState(false);
  /* Analyser state */
  const [failType, setFailType] = useState('daily-dd');
  const [chWr, setChWr] = useState(52);
  const [chRr, setChRr] = useState(1.5);
  const [chTrades, setChTrades] = useState(25);
  const [chMaxDd, setChMaxDd] = useState(8);
  const [chBigLoss, setChBigLoss] = useState(2.5);
  const [normWr, setNormWr] = useState(58);
  const [normRr, setNormRr] = useState(1.8);
  const [analysed, setAnalysed] = useState(false);

  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);
  const toggle = (id: string) => setOpenSections(s => ({ ...s, [id]: !s[id] }));

  const handleGameAnswer = (oi: number) => { if (gameAnswers[gameRound] !== null) return; const a = [...gameAnswers]; a[gameRound] = oi; setGameAnswers(a); if (gameRounds[gameRound].options[oi].correct) setGameScore(s => s + 1); };
  const handleQuizAnswer = (qi: number, oi: number) => { if (quizAnswers[qi] !== null) return; const a = [...quizAnswers]; a[qi] = oi; setQuizAnswers(a); };

  const quizDone = quizAnswers.every(a => a !== null);
  const quizScoreVal = quizDone ? Math.round(quizAnswers.reduce<number>((s, a, i) => s + (a === quizQuestions[i].correct ? 1 : 0), 0) / quizQuestions.length * 100) : 0;
  useEffect(() => { if (quizDone && quizScoreVal >= 66 && !certUnlocked) { setCertUnlocked(true); setShowConfetti(true); const t = setTimeout(() => setShowConfetti(false), 4000); return () => clearTimeout(t); } }, [quizDone, quizScoreVal, certUnlocked]);

  /* Analyser logic */
  const wrGap = normWr - chWr;
  const rrGap = normRr - chRr;
  const diagnose = () => {
    if (wrGap <= 5 && rrGap <= 0.3 && chBigLoss <= 2) return { type: 'Variance', confidence: 85, color: '#22c55e', wait: '1 week', rec: 'Your stats are within normal range. This appears to be a run of bad luck. Wait 1 week for emotional reset, confirm your stats on demo for a few days, then re-attempt with the same strategy and parameters.' };
    if (wrGap > 8 || rrGap > 0.5) return { type: 'Strategy', confidence: 75, color: '#3b82f6', wait: '3 weeks', rec: 'Significant performance gap detected. Your WR dropped ' + wrGap + '% and R:R dropped ' + rrGap.toFixed(1) + '. Back to demo for 2\u20134 weeks. Test whether the strategy works in current conditions. If it recovers on demo, the failure was market timing. If not, the strategy needs adjustment.' };
    if (chBigLoss > 2.5) return { type: 'Psychological', confidence: 80, color: '#ef4444', wait: '3 weeks', rec: 'Your biggest single loss (' + chBigLoss.toFixed(1) + '%) exceeds normal risk parameters, suggesting emotional over-sizing or stop-moving. 3-week recovery: journal the emotional triggers, demo-trade the 2-loss rule for 2 weeks, then simulated challenge conditions for 1 week.' };
    return { type: 'Execution', confidence: 70, color: '#f59e0b', wait: '2 weeks', rec: 'Moderate performance gap with stats that suggest deviation from your plan. Win rate dropped ' + wrGap + '% which is more than variance but less than strategy failure. Review your trade journal for B/C-grade setups, session violations, and moved stops. Demo for 2 weeks with strict plan adherence before re-attempting.' };
  };
  const diagnosis = diagnose();

  /* ─── DRAW FUNCTIONS ─── */
  const drawDiagnosisWheel = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(cx, cy) - 40;
    const quadrants = [
      { label: 'Strategy', color: '#3b82f6', emoji: '\ud83d\udcc9' },
      { label: 'Execution', color: '#f59e0b', emoji: '\u26A0' },
      { label: 'Psychology', color: '#ef4444', emoji: '\ud83e\udde0' },
      { label: 'Variance', color: '#22c55e', emoji: '\ud83c\udfb2' },
    ];
    const activeIdx = Math.floor((f % 240) / 60);
    quadrants.forEach((q, i) => {
      const startAngle = (i * Math.PI / 2) - Math.PI / 2;
      const endAngle = startAngle + Math.PI / 2;
      const isActive = i === activeIdx;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, startAngle, endAngle); ctx.closePath();
      ctx.fillStyle = q.color + (isActive ? '30' : '10'); ctx.fill();
      ctx.strokeStyle = q.color + (isActive ? '60' : '20'); ctx.lineWidth = isActive ? 2 : 1; ctx.stroke();
      const midAngle = startAngle + Math.PI / 4;
      const textR = r * 0.6;
      const tx = cx + Math.cos(midAngle) * textR;
      const ty = cy + Math.sin(midAngle) * textR;
      ctx.font = isActive ? 'bold 12px system-ui' : '11px system-ui'; ctx.fillStyle = isActive ? q.color : q.color + '80'; ctx.textAlign = 'center';
      ctx.fillText(q.emoji, tx, ty - 8);
      ctx.fillText(q.label, tx, ty + 10);
    });
    ctx.font = 'bold 10px system-ui'; ctx.fillStyle = '#9ca3af'; ctx.textAlign = 'center';
    ctx.fillText('FAILURE', cx, cy - 4); ctx.fillText('DIAGNOSIS', cx, cy + 10);
  }, []);

  const drawCostBenefit = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const cx = w / 2;
    const cy = h / 2;
    const chartL = 60; const chartR = w - 30; const chartT = 40; const chartB = h - 40;
    const chartW = chartR - chartL; const chartH = chartB - chartT;
    const maxCost = 1200; const months = 12;
    // Grid
    ctx.strokeStyle = '#ffffff08'; ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) { const y = chartT + (chartH / 4) * i; ctx.beginPath(); ctx.moveTo(chartL, y); ctx.lineTo(chartR, y); ctx.stroke(); }
    // Cost line (red, ascending then flat)
    const progress = Math.min(1, f / 120);
    ctx.beginPath(); ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2;
    costBenefit.forEach((d, i) => {
      const x = chartL + (i / (costBenefit.length - 1)) * chartW * progress;
      const y = chartB - (d.totalCost / maxCost) * chartH;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
    // Income line (green, starting at attempt 3)
    if (progress > 0.4) {
      ctx.beginPath(); ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 2;
      let started = false;
      costBenefit.forEach((d, i) => {
        if (!d.funded) return;
        const x = chartL + (i / (costBenefit.length - 1)) * chartW;
        const income = (i - 2) * 1500;
        const y = chartB - (Math.min(income, maxCost) / maxCost) * chartH;
        const p2 = Math.min(1, (progress - 0.4) / 0.6);
        const finalY = chartB + (y - chartB) * p2;
        if (!started) { ctx.moveTo(x, finalY); started = true; } else ctx.lineTo(x, finalY);
      });
      ctx.stroke();
    }
    // Labels
    ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'left';
    ctx.fillStyle = '#ef4444'; ctx.fillText('Challenge Costs', chartL, chartT - 8);
    ctx.fillStyle = '#22c55e'; ctx.fillText('Funded Income', chartL + 120, chartT - 8);
    ctx.font = '9px system-ui'; ctx.fillStyle = '#6b7280'; ctx.textAlign = 'center';
    ctx.fillText('Attempts / Months', cx, h - 8);
    ctx.save(); ctx.translate(12, cy); ctx.rotate(-Math.PI / 2); ctx.fillText('\u00A3', 0, 0); ctx.restore();
    // Break-even marker
    if (progress > 0.7) {
      const beX = chartL + (3 / (costBenefit.length - 1)) * chartW;
      const beY = chartB - (900 / maxCost) * chartH;
      ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.arc(beX, beY, 5, 0, Math.PI * 2); ctx.fill();
      ctx.font = 'bold 9px system-ui'; ctx.fillStyle = '#f59e0b'; ctx.textAlign = 'center';
      ctx.fillText('BREAK-EVEN', beX, beY - 12);
    }
  }, []);

  const inputCls = 'w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50';

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      <Confetti active={showConfetti} />
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-white/5"><motion.div className="h-full bg-gradient-to-r from-amber-500 to-accent-500" style={{ width: `${Math.min(100, (scrollY / (typeof document !== 'undefined' ? document.body.scrollHeight - window.innerHeight : 1)) * 100)}%` }} /></div>
      <nav className="fixed top-1 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur border border-white/[0.06]"><span className="text-xs font-bold tracking-widest bg-gradient-to-r from-amber-400 to-purple-400 bg-clip-text text-transparent">ATLAS ACADEMY</span><Crown className="w-3.5 h-3.5 text-amber-400" /><span className="text-[10px] font-mono text-amber-400/80 tracking-widest">PRO &middot; LEVEL 9</span></nav>

      <header className="relative min-h-[85vh] flex items-center justify-center overflow-hidden"><div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }} /><div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #d946ef 0%, transparent 70%)' }} /><div className="relative z-10 text-center px-6"><motion.div variants={fadeUp} initial="hidden" animate="visible"><p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-4">Level 9 &mdash; Lesson 12</p></motion.div><motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.15 }}><h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4"><span className="bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>When Challenges Fail</span></h1></motion.div><motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.3 }}><p className="text-gray-400 max-w-md mx-auto text-sm leading-relaxed">Diagnose, recover, and re-attempt with precision &mdash; the lesson everyone needs.</p></motion.div><motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.45 }} className="mt-8 flex flex-col items-center gap-2"><span className="text-[10px] uppercase tracking-widest text-gray-600">Scroll to begin</span><motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}><ChevronDown className="w-4 h-4 text-gray-600" /></motion.div></motion.div></div></header>

      <section className="max-w-2xl mx-auto px-5 py-20"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-3">00 &mdash; Why This Matters</p><h2 className="text-2xl font-extrabold mb-4">85% of Traders Fail. But Most Fail the Same Way Twice.</h2><div className="p-6 rounded-2xl glass-card"><p className="text-sm text-gray-300 leading-relaxed mb-4">A trader failed 3 consecutive challenges at &pound;400 each &mdash; &pound;1,200 total. Each time, the failure was classified as &ldquo;bad luck.&rdquo; On review: Failure 1 had 2 moved stops. Failure 2 had 3 trades outside the planned session. Failure 3 had risk increased to 1.5% after a losing streak. None of these were variance. All three were execution and psychology failures disguised as bad luck. The correct response would have saved &pound;800: diagnose after Failure 1, fix the execution, and pass on Attempt 2.</p><div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10"><p className="text-xs text-amber-400 font-semibold mb-1">&#9889; REAL SCENARIO</p><p className="text-xs text-gray-400">The difference between a trader who passes on attempt 2 and a trader who fails 5 times is not skill. It is diagnosis. Most traders never ask WHY they failed &mdash; they just try again and repeat the same mistake.</p></div></div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; Failure Diagnosis Wheel</p><h2 className="text-2xl font-extrabold mb-4">4 Quadrants of Failure</h2><div className="p-4 rounded-2xl glass-card"><AnimScene drawFn={drawDiagnosisWheel} height={280} /></div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; Cost-Benefit Analysis</p><h2 className="text-2xl font-extrabold mb-4">When Re-Attempting Makes Sense</h2><div className="p-4 rounded-2xl glass-card"><AnimScene drawFn={drawCostBenefit} /></div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The 4 Failure Types</p><h2 className="text-2xl font-extrabold mb-4">Different Failures, Different Fixes</h2><div className="space-y-3">{failureTypes.map((item, i) => (<div key={i}><button onClick={() => toggle(`ft-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><div className="flex items-center gap-3"><span className="text-lg">{item.emoji}</span><div><span className="text-sm font-bold text-gray-200">{item.type}</span><span className="ml-2 text-[10px] px-2 py-0.5 rounded-full font-mono" style={{ background: item.color + '20', color: item.color }}>Wait: {item.waitWeeks}+ weeks</span></div></div><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`ft-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`ft-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05] space-y-2"><p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p><p className="text-xs text-amber-400"><strong>Signs:</strong> {item.signs}</p><p className="text-xs text-green-400"><strong>Recovery:</strong> {item.recovery}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The 3-Strike Rule</p><h2 className="text-2xl font-extrabold mb-4">When to Stop Re-Attempting</h2><div className="p-6 rounded-2xl glass-card space-y-3">{threeStrikeRule.map((item, i) => (<div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong style={{ color: item.color }}>{item.strike}</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">{item.action}</span></p></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Challenge Failure Analyser</p><h2 className="text-2xl font-extrabold mb-2">&#127919; GROUNDBREAKING: Diagnose Your Failure</h2><p className="text-gray-400 text-sm mb-6">Enter your challenge stats vs your normal stats. The tool identifies the gap, diagnoses the root cause, and recommends a specific recovery plan.</p>
      <div className="p-6 rounded-2xl glass-card space-y-5">
        <div><label className="text-[10px] text-gray-500 uppercase tracking-wider">Failure Type</label><select value={failType} onChange={e => { setFailType(e.target.value); setAnalysed(false); }} className={inputCls}><option value="daily-dd">Daily DD Breach</option><option value="overall-dd">Overall DD Breach</option><option value="time-expired">Time Expired</option><option value="consistency">Consistency Violation</option><option value="voluntary">Voluntary Stop</option></select></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Challenge Stats</p><div className="grid grid-cols-2 gap-3"><div><label className="text-[10px] text-gray-500">Win Rate (%)</label><input type="number" value={chWr} onChange={e => { setChWr(Number(e.target.value) || 0); setAnalysed(false); }} className={inputCls} /></div><div><label className="text-[10px] text-gray-500">Avg R:R</label><input type="number" step="0.1" value={chRr} onChange={e => { setChRr(Number(e.target.value) || 0); setAnalysed(false); }} className={inputCls} /></div><div><label className="text-[10px] text-gray-500">Trades Taken</label><input type="number" value={chTrades} onChange={e => { setChTrades(Number(e.target.value) || 0); setAnalysed(false); }} className={inputCls} /></div><div><label className="text-[10px] text-gray-500">Max DD (%)</label><input type="number" step="0.1" value={chMaxDd} onChange={e => { setChMaxDd(Number(e.target.value) || 0); setAnalysed(false); }} className={inputCls} /></div><div className="col-span-2"><label className="text-[10px] text-gray-500">Biggest Single Loss (%)</label><input type="number" step="0.1" value={chBigLoss} onChange={e => { setChBigLoss(Number(e.target.value) || 0); setAnalysed(false); }} className={inputCls} /></div></div></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Normal Stats (Demo / Personal Account)</p><div className="grid grid-cols-2 gap-3"><div><label className="text-[10px] text-gray-500">Normal Win Rate (%)</label><input type="number" value={normWr} onChange={e => { setNormWr(Number(e.target.value) || 0); setAnalysed(false); }} className={inputCls} /></div><div><label className="text-[10px] text-gray-500">Normal Avg R:R</label><input type="number" step="0.1" value={normRr} onChange={e => { setNormRr(Number(e.target.value) || 0); setAnalysed(false); }} className={inputCls} /></div></div></div>
        <button onClick={() => setAnalysed(true)} className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white font-bold text-sm active:scale-95 transition-transform">Analyse Failure</button>
        {analysed && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="p-4 rounded-xl border" style={{ borderColor: diagnosis.color + '30', background: diagnosis.color + '08' }}>
            <div className="flex items-center justify-between mb-2"><span className="text-sm font-bold" style={{ color: diagnosis.color }}>Diagnosis: {diagnosis.type} Failure</span><span className="text-[10px] px-2 py-0.5 rounded-full font-mono" style={{ background: diagnosis.color + '20', color: diagnosis.color }}>{diagnosis.confidence}% confidence</span></div>
            <div className="grid grid-cols-2 gap-3 mb-3"><div className="p-2 rounded-lg bg-white/[0.02]"><p className="text-[10px] text-gray-500">WR Gap</p><p className="text-sm font-mono" style={{ color: wrGap > 5 ? '#ef4444' : wrGap > 3 ? '#f59e0b' : '#22c55e' }}>&minus;{wrGap}%</p></div><div className="p-2 rounded-lg bg-white/[0.02]"><p className="text-[10px] text-gray-500">R:R Gap</p><p className="text-sm font-mono" style={{ color: rrGap > 0.5 ? '#ef4444' : rrGap > 0.2 ? '#f59e0b' : '#22c55e' }}>&minus;{rrGap.toFixed(1)}</p></div></div>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-[10px] text-amber-400 uppercase tracking-wider font-bold mb-1">Recovery Plan</p><p className="text-xs text-gray-400 leading-relaxed">{diagnosis.rec}</p></div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center"><p className="text-[10px] text-gray-500">Recommended Waiting Period</p><p className="text-sm font-bold" style={{ color: diagnosis.color }}>{diagnosis.wait}</p></div>
          <button onClick={() => setAnalysed(false)} className="w-full py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-400 text-xs hover:bg-white/[0.07]">Reset &amp; Try Different Inputs</button>
        </motion.div>)}
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Re-Attempt Decision Tree</p><h2 className="text-2xl font-extrabold mb-4">When to Try Again</h2><div className="p-6 rounded-2xl glass-card space-y-3">{reAttemptTree.map((item, i) => (<div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><div className="flex items-center justify-between mb-1"><span className="text-sm font-bold text-gray-200">{item.timeframe}</span><span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold" style={{ background: item.color + '20', color: item.color }}>{item.verdict}</span></div><p className="text-xs text-gray-400 leading-relaxed">{item.reason}</p></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; The Expected Value Equation</p><h2 className="text-2xl font-extrabold mb-4">When Re-Attempting Is Mathematically Justified</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#22c55e]">THE FORMULA</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">EV = (Pass Rate &times; Monthly Income &times; Average Survival Months) &minus; Challenge Fee</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#3b82f6]">EXAMPLE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">30% pass rate &times; &pound;1,500/month &times; 6 months &minus; &pound;400 = +&pound;2,300 expected value. Even at 70% failure rate, every attempt is +EV.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#f59e0b]">BREAKEVEN</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">The minimum pass rate that makes the EV positive. For a &pound;400 challenge with &pound;9,000 expected funded income: &pound;400 &divide; &pound;9,000 = 4.4%. If your pass rate is above 5%, every attempt makes money long-term.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">THE CAVEAT</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">EV only works if you are genuinely improving between attempts. Repeating the same mistake 10 times does not converge to the expected value &mdash; it converges to zero.</span></p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p><h2 className="text-2xl font-extrabold mb-4">4 Post-Failure Errors</h2><div className="space-y-3">{commonMistakes.map((item, i) => (<div key={i}><button onClick={() => toggle(`cm-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`cm-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`cm-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-xs text-red-400 mb-2">&#10060; {item.mistake}</p><p className="text-xs text-green-400">&#10004; {item.fix}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Cheat Sheet</p><h2 className="text-2xl font-extrabold mb-4">Failure Recovery Quick Reference</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#22c55e]">4 TYPES</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Strategy, Execution, Psychology, Variance. Each has a different recovery protocol. Diagnose before you re-attempt.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#3b82f6]">48-HOUR RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Never re-purchase within 48 hours of failure. The decision is emotional, not rational.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#f59e0b]">3-STRIKE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">3 failures on the same challenge = mandatory pause. 1 month demo. Consider changing the firm, not just trying again.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#8b5cf6]">VARIANCE TEST</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">WR within 5% + R:R normal + zero rule violations. ALL 3 conditions must be met. If not, it is not variance.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">THE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Every failure is data. Traders who diagnose improve. Traders who just retry repeat. The diagnosis IS the competitive advantage.</span></p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Test Your Understanding</p><h2 className="text-2xl font-extrabold mb-2">Failure Analysis Game</h2><p className="text-gray-400 text-sm mb-6">5 scenario-based rounds. Diagnose failures, time re-attempts, and make cost-benefit decisions.</p>
      <div className="p-6 rounded-2xl glass-card"><div className="flex items-center justify-between mb-4"><span className="text-xs font-bold text-amber-400">Round {gameRound + 1} of {gameRounds.length}</span><span className="text-xs font-mono text-gray-500">{gameScore}/{gameRounds.length} correct</span></div><p className="text-sm text-gray-300 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: gameRounds[gameRound].scenario }} /><div className="space-y-2">{gameRounds[gameRound].options.map((opt, oi) => { const answered = gameAnswers[gameRound] !== null; const selected = gameAnswers[gameRound] === oi; const isCorrect = opt.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return (<div key={oi}><button onClick={() => handleGameAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt.text }} /></button>{answered && selected && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]"><p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`} dangerouslySetInnerHTML={{ __html: opt.explain }} /></motion.div>)}</div>); })}</div>{gameAnswers[gameRound] !== null && gameRound < gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5"><button onClick={() => setGameRound(r => r + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button></motion.div>)}{gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Outstanding \u2014 you understand failure analysis as a diagnostic discipline, not an emotional reaction.' : gameScore >= 3 ? 'Good \u2014 review the variance test conditions and 3-strike rule.' : 'Re-read the 4 failure types and re-attempt decision tree. Proper diagnosis is the foundation of everything in this lesson.'}</p></motion.div>)}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Knowledge Check</p><h2 className="text-2xl font-extrabold mb-6">Final Quiz &mdash; 8 Questions</h2>
      <div className="space-y-6">{quizQuestions.map((q, qi) => (<div key={qi} className="p-5 rounded-2xl glass-card"><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p><p className="text-sm font-semibold text-white mb-4">{q.q}</p><div className="space-y-2">{q.opts.map((opt, oi) => { const answered = quizAnswers[qi] !== null; const selected = quizAnswers[qi] === oi; const isCorrect = oi === q.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return <button key={oi} onClick={() => handleQuizAnswer(qi, oi)} disabled={answered} className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`}>{opt}</button>; })}</div>{quizAnswers[qi] !== null && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg bg-white/[0.02]"><p className="text-xs text-amber-400" dangerouslySetInnerHTML={{ __html: `<span class="font-bold">&#9989;</span> ${q.explain}` }} /></motion.div>)}</div>))}</div>
      {quizDone && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center"><p className="text-3xl font-extrabold mb-2">{quizScoreVal}%</p><p className="text-sm text-gray-400">{quizScoreVal >= 66 ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate. Review and try again.'}</p></motion.div>)}
      {certUnlocked && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10"><div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}><div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(139,92,246,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} /><div className="relative z-10 text-center"><div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">&#128300;</div><p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p><p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 9: When Challenges Fail</strong><br />at ATLAS Academy by Interakktive</p><p className="bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Failure Analyst &mdash;</p><p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L9.12-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p></div></div></motion.div>)}</motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-20 text-center"><Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">&larr; Back to Academy</Link></section>
    </div>
  );
}
