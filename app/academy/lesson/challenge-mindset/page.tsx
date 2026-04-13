// app/academy/lesson/challenge-mindset/page.tsx
// ATLAS Academy — Lesson 9.6: The Challenge Mindset [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 9
// GROUNDBREAKING: Challenge Psychology Assessment — 10-question self-assessment
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
const emotionalCycle = [
  { phase: 'Purchase', emotion: 'Excitement', temp: 75, color: '#22c55e', desc: '"This is it. I have trained for this. Time to prove myself."' },
  { phase: 'Day 1\u20133', emotion: 'Anxiety', temp: 60, color: '#3b82f6', desc: '"Every trade feels heavy. What if I fail on Day 1? What if my strategy does not work here?"' },
  { phase: 'First Win', emotion: 'Euphoria', temp: 85, color: '#22c55e', desc: '"I knew it! I can do this. Maybe I should take a few more trades today while I am hot."' },
  { phase: 'First Loss', emotion: 'Panic', temp: 35, color: '#ef4444', desc: '"That should not have happened. Was my analysis wrong? Is my strategy broken? Should I take the next trade?"' },
  { phase: 'Mid-Challenge', emotion: 'Grinding', temp: 50, color: '#f59e0b', desc: '"Slow progress. Not exciting. Not panicking. Just\u2026 grinding. This feels boring but boring is what passes challenges."' },
  { phase: 'Near Target', emotion: 'Paralysis', temp: 40, color: '#8b5cf6', desc: '"I am so close. What if I lose now? What if I give it all back? Maybe I should stop trading until the last day."' },
  { phase: 'Pass/Fail', emotion: 'Relief / Devastation', temp: 90, color: '#ec4899', desc: 'Pass: Relief first, then pride. Fail: Devastation, then the impulse to immediately re-purchase. BOTH are emotional states. Neither should drive your next decision.' },
];

const psychTraps = [
  { name: 'The Sunk Cost Trap', trigger: 'After paying the challenge fee', thought: '"I paid \u00A3400 for this. I NEED to make it work."', reality: 'The \u00A3400 is gone whether you pass or fail. Your next trade should be identical to how you would trade on a demo account. The fee is a sunk cost \u2014 it should not influence a single trading decision.', antidote: 'Before each trade, ask: "Would I take this trade on a free demo account?" If yes, take it. If you are only taking it because you paid for the challenge, skip it.', color: '#ef4444' },
  { name: 'Time Pressure Anxiety', trigger: 'Day 10+ with low profit', thought: '"I am running out of time. I need to take more trades and bigger risk to catch up."', reality: 'Time pressure causes rushed entries, B-grade setups, and risk increases \u2014 exactly the behaviours that breach DD. The solution to being behind schedule is NEVER more risk. It is better trade selection or accepting a slower pace.', antidote: 'Calculate your remaining trades vs trades needed (Lesson 9.4). If the maths still works, trust the process. If not, the challenge may not be salvageable at safe risk levels \u2014 and that is OK.', color: '#f59e0b' },
  { name: 'Revenge Trading', trigger: 'After 2\u20133 consecutive losses', thought: '"I need to win this back right now. The market owes me."', reality: 'The market owes you nothing. Revenge trading is the #1 funded account killer. After 2 consecutive losses, your judgement is compromised by frustration. Every subsequent trade has LOWER quality because your emotional state degrades your analysis.', antidote: '2-loss rule: after 2 consecutive losses, stop trading for the day. No exceptions. This single rule prevents more challenge failures than any other.', color: '#ef4444' },
  { name: 'The Phase 1 \u2192 Phase 2 Choke', trigger: 'After passing Phase 1', thought: '"I already proved myself. Phase 2 should be easy. But what if I lose what I earned?"', reality: 'Phase 2 has a HIGHER failure rate than Phase 1 despite a lower profit target. Why? Overconfidence from passing Phase 1 + fear of losing that achievement = defensive trading that either takes too few trades (time pressure) or too many forced trades (trying to finish fast).', antidote: 'Treat Phase 2 as a completely separate challenge. Reset your mindset. Your Phase 1 result is irrelevant to Phase 2 decisions. Same plan, same parameters, same discipline.', color: '#8b5cf6' },
  { name: 'Winning Streak Overconfidence', trigger: 'After 4\u20135 consecutive wins', thought: '"I am invincible. I should increase risk and finish this challenge early."', reality: 'A 5-win streak at 58% WR has a 6.5% probability. It is not evidence of temporary skill enhancement \u2014 it is normal variance. The next trade still has a 42% chance of losing. Increasing risk after a winning streak is IDENTICAL to increasing risk after a losing streak: both are emotional, not analytical.', antidote: 'Rule: your risk per trade is set BEFORE the challenge. Winning streaks do not change it. Losing streaks do not change it. Only the pre-defined phase transition (80% of target) changes it \u2014 and only downward.', color: '#22c55e' },
];

const reAttemptFramework = [
  { trigger: 'Immediately after failure (within 48 hours)', action: 'NEVER re-attempt', reason: 'You are emotional. Anger, frustration, or desperation will carry into the next challenge. The firm\u2019s "48-hour discount" is designed to exploit this. Wait.', color: '#ef4444' },
  { trigger: '1 week after failure', action: 'Analyse ONLY', reason: 'Review the challenge: Was the failure strategy (your edge did not hold), execution (you deviated from the plan), psychology (emotional trading), or variance (bad luck within normal stats)? Be brutally honest.', color: '#f59e0b' },
  { trigger: '2 weeks after failure', action: 'Demo test the fix', reason: 'If you identified a problem, test the solution on demo for at least 5 trading days. If the problem was variance (no fix needed), still wait \u2014 emotional recovery takes time even when the strategy is sound.', color: '#3b82f6' },
  { trigger: '3+ weeks after failure', action: 'Decide: re-attempt, switch firms, or pause', reason: 'Only NOW are you ready to make a rational decision. If the failure was the firm\u2019s rules (mismatch), switch firms. If it was you (psychology, execution), confirm the fix works on demo. If it was variance, the same firm is fine.', color: '#22c55e' },
];

/* Assessment questions */
const assessQs = [
  { q: 'After paying for something (concert tickets, a gym membership), how likely are you to force yourself to use it even when you do not want to?', cat: 'sunk', opts: ['Rarely \u2014 money spent is spent', 'Sometimes, depends on the amount', 'Often \u2014 I hate wasting money', 'Always \u2014 I will go even if I am sick'] },
  { q: 'When you are losing at a game or competition, do you tend to take bigger risks to "catch up"?', cat: 'sunk', opts: ['No \u2014 I play the same regardless', 'Occasionally, if I am close to winning', 'Yes \u2014 I shift to more aggressive play', 'Absolutely \u2014 I double down every time'] },
  { q: 'When you have a deadline approaching and you are behind schedule, how do you react?', cat: 'time', opts: ['Stay calm, prioritise, adjust pace', 'Slight anxiety but I adapt', 'Significant stress, rush to catch up', 'Full panic \u2014 I sacrifice quality for speed'] },
  { q: 'If a trading day has a strict end time, do you feel pressure to trade more as the deadline approaches?', cat: 'time', opts: ['No \u2014 I trade only when setups appear', 'Slightly \u2014 I might lower my standards a bit', 'Yes \u2014 I take trades I would normally skip', 'Definitely \u2014 I feel I must be in a trade at all times'] },
  { q: 'After 2 consecutive losing trades, what is your typical emotional response?', cat: 'revenge', opts: ['Neutral \u2014 losses are part of the process', 'Mild frustration but I follow my plan', 'Strong frustration \u2014 I want to win it back quickly', 'Anger \u2014 I immediately look for the next trade to recover'] },
  { q: 'Have you ever increased your position size after a loss specifically to recover the lost money faster?', cat: 'revenge', opts: ['Never', 'Once or twice when I was newer', 'Occasionally \u2014 it is hard to resist', 'Regularly \u2014 it feels like the logical thing to do'] },
  { q: 'After a winning streak (4\u20135 wins), how does your confidence change?', cat: 'confidence', opts: ['Stays the same \u2014 each trade is independent', 'Slightly higher but I stay disciplined', 'Noticeably higher \u2014 I feel I can take more risk', 'Much higher \u2014 I feel invincible and trade more aggressively'] },
  { q: 'If you pass an important test or evaluation, how does it affect your next performance?', cat: 'confidence', opts: ['I approach the next one identically', 'I feel slightly more relaxed, sometimes too relaxed', 'I tend to underperform \u2014 the pressure of maintaining success gets to me', 'I often coast or get overconfident'] },
  { q: 'When you are close to achieving a goal (90%+ complete), do you tend to:', cat: 'discipline', opts: ['Maintain the same approach that got me here', 'Get slightly impatient but stay disciplined', 'Rush to finish, sometimes cutting corners', 'Frequently stumble at the finish line \u2014 I tighten up or overthink'] },
  { q: 'How well do you follow pre-written plans when emotions are high?', cat: 'discipline', opts: ['Very well \u2014 the plan exists for these moments', 'Mostly \u2014 occasional small deviations', 'Poorly \u2014 I tend to override the plan in the moment', 'Almost never \u2014 plans go out the window under pressure'] },
];

const commonMistakes = [
  { title: 'Treating the Challenge Fee as an Emotional Investment', mistake: '"I spent \u00A3400 so I HAVE to make this work." This is the sunk cost fallacy in real time. The fee is spent. It cannot be recovered by trading harder, taking more risk, or forcing trades. Every decision should be based on the CURRENT setup quality, not the fee you already paid.', fix: 'Reframe: the \u00A3400 bought you ACCESS to an opportunity. The opportunity is a separate evaluation. If you would not take this trade on a free demo, do not take it because you paid for the challenge.' },
  { title: 'Comparing Progress to a Linear Target', mistake: '"I should be at +3.3% by Day 10 (10% \u00F7 30 days)." Challenge equity paths are NOT linear. They are choppy with winning and losing clusters. Being at +1.5% on Day 10 is NOT "behind schedule" \u2014 it is normal variance. One good 3-day cluster can bring you to +5% by Day 13.', fix: 'Track actual trades needed vs trades remaining (Lesson 9.4). If the maths works, the pace is fine. Do not compare to linear progression \u2014 compare to the expected trade count.' },
  { title: 'Emotional Re-Purchasing After Failure', mistake: '"I failed. I will buy another challenge RIGHT NOW and do better." 45% of traders re-purchase within 48 hours of failure. The firm knows this. The discount offer is designed for this. You are buying a new challenge in the same emotional state that caused the failure.', fix: 'Mandatory 2-week cooling period. Analyse. Demo-test the fix. THEN decide. The 2 weeks you "waste" save you the \u00A3300+ of another emotional failure.' },
  { title: 'Letting the Challenge Change Your Trading Identity', mistake: '"I am normally calm but during the challenge I become a different trader." The challenge should not change WHO you are. It should change PARAMETERS (risk, trade count, sessions). If you notice yourself making decisions you would never make on demo, stop and reset. You have become a different (worse) trader.', fix: 'Daily check: "Am I trading my system, or am I trading the challenge?" If you are trading the challenge (forcing trades, chasing, revenge trading), close the platform for the day. Return tomorrow as yourself.' },
];

const gameRounds = [
  { scenario: '<strong>Day 3 sunk cost:</strong> You are on Day 3 of your \u00A3400 challenge. You are at -1.2%. No A+ setups have appeared today. It is 14:30 and London session is ending. A B-grade setup appears \u2014 it meets some criteria but you would normally skip it on demo. You think: "I paid \u00A3400 and I am already down. I need to take something."', options: [
    { text: 'Take it \u2014 you need to start making progress and something is better than nothing', correct: false, explain: 'This is the sunk cost trap in action. The \u00A3400 is influencing your trading decision. A B-grade setup at 48\u201352% WR has near-zero EV. Taking it because you paid for the challenge is the definition of letting emotion override analysis. On demo, you would skip this without hesitation.' },
    { text: 'Skip it \u2014 the \u00A3400 is a sunk cost and should not influence trade selection. No A+ setup means no trade. -1.2% on Day 3 is normal variance, not an emergency.', correct: true, explain: 'Discipline wins challenges. -1.2% on Day 3 is well within normal variance for a 58% WR strategy. You have 27 days and the maths from Lesson 9.4 still works. The B-grade setup would cost 0.75% DD if it loses and gain minimal EV if it wins. The trade you skip today protects the buffer you need for the A+ setup tomorrow.' },
    { text: 'Take it with reduced risk (0.25%) as a compromise', correct: false, explain: 'Still wrong, for the same reason. The issue is not risk size \u2014 it is trade SELECTION. A B-grade trade at any risk level is still a lower-probability trade driven by the sunk cost emotion. If you would not take it on demo at full risk, do not take it on the challenge at any risk.' },
  ]},
  { scenario: '<strong>Revenge trigger:</strong> Day 8. You have just lost 2 trades in a row this morning (-1.5% daily). Your overall equity is at +2.8%. A new setup appears that looks like an A-grade entry. Your emotions are running hot \u2014 you can feel the frustration from the 2 losses. What do you do?', options: [
    { text: 'Take it \u2014 it is an A-grade setup and your system says enter', correct: false, explain: 'The setup might be genuinely A-grade, but your emotional state is compromised. After 2 consecutive losses, studies show that traders\u2019 pattern recognition degrades \u2014 you are more likely to see what you WANT to see (a recovery opportunity) than what is actually there. The "A-grade" assessment is unreliable when you are frustrated.' },
    { text: 'Stop trading for the day \u2014 the 2-loss rule is absolute. Your emotional state makes all subsequent analysis unreliable. Return tomorrow at 0% daily DD with fresh eyes.', correct: true, explain: 'The 2-loss rule saves more challenges than any other single rule. At -1.5% daily with a 5% limit, you have 3.5% remaining \u2014 mathematically fine. But psychologically, the frustration from 2 losses degrades your decision-making. The "A-grade" setup you see might be a B-grade that your frustrated brain is upgrading. Stop. Tomorrow is a new day with full DD buffer and clear emotions.' },
    { text: 'Take it but set a tighter stop loss to limit further damage', correct: false, explain: 'Tighter stop = higher probability of being stopped out = the loss feels even more frustrating = stronger revenge impulse. Tightening stops after losses is a form of emotional adjustment that makes things worse, not better. The plan said 0.75% risk. The plan said A+ setups. The plan did NOT say "modify stops based on feelings."' },
  ]},
  { scenario: '<strong>Phase 2 choke:</strong> You passed Phase 1 with +10.8% in 22 days. You felt amazing. Now it is Day 4 of Phase 2. The target is +5%. You are at -0.3%. Every trade feels heavier than Phase 1. You are second-guessing entries you would normally take. You closed one position early for +0.2R instead of letting it run to +1.5R. What is happening and what should you do?', options: [
    { text: 'You are being appropriately cautious \u2014 Phase 2 matters more so you should be extra careful', correct: false, explain: 'This is not caution \u2014 it is fear. Closing at +0.2R instead of +1.5R is LOSING you money (reduced expectancy). Second-guessing entries is REDUCING your trade quality. Being "extra careful" is actually being "extra scared" \u2014 and scared trading has worse outcomes than confident trading.' },
    { text: 'The Phase 1 \u2192 Phase 2 choke. Fear of losing your Phase 1 achievement is causing defensive trading that undermines your edge. Reset: treat Phase 2 as a NEW challenge. Same plan, same parameters, same discipline.', correct: true, explain: 'Textbook Phase 2 choke. Your Phase 1 success created a mental anchor: "I already proved myself." This makes every Phase 2 loss feel like it threatens your identity. The fix: Phase 1 is DONE. Phase 2 is a separate challenge. Your Phase 1 result is irrelevant. Trade the SAME plan with the SAME parameters. The early close at +0.2R instead of +1.5R is the clearest symptom \u2014 your fear of loss overrode your system\u2019s rules.' },
    { text: 'Increase risk to 1% to try to finish Phase 2 quickly and end the psychological discomfort', correct: false, explain: 'This is the flight response \u2014 "just get it over with." Increasing risk in Phase 2 when you are already emotionally compromised is the most common way Phase 2 fails. You are converting a winnable slow grind into a high-risk coinflip because discomfort feels worse than the potential loss. Slow down, do not speed up.' },
  ]},
  { scenario: '<strong>Winning streak test:</strong> Day 14. You are at +6.2% with a 5-win streak. You feel sharp, confident, and like you cannot lose. The next setup is A-grade. You are in your Build Phase at 0.75% risk. But you think: "I am on fire. I should push to 1% and potentially finish by Day 18 instead of Day 24."', options: [
    { text: 'Increase to 1% \u2014 you are clearly in a hot zone and should capitalise on your momentum', correct: false, explain: 'There is no "hot zone." Each trade is independent at 58% WR. Your 5-win streak has a 6.5% probability \u2014 it happens to every trader roughly once every 15 trading days. The next trade still has a 42% chance of losing. "Momentum" is a feeling, not a statistical reality. The plan says 0.75% until 80% of target.' },
    { text: 'Maintain 0.75% \u2014 the risk was set before the challenge for mathematical reasons. A winning streak does not change the maths. Stick to the plan.', correct: true, explain: 'This is the correct response to EVERY winning streak during a challenge. Your risk was calculated in Lesson 9.4 to maximise pass probability. A 5-win streak does not change the underlying probabilities. It feels like you should capitalise, but "capitalising" on randomness is just increasing risk based on luck. The plan is the plan.' },
    { text: 'Reduce to 0.5% \u2014 you are at 62% of target so it is time for the Protect Phase', correct: false, explain: 'Not yet. The Protect Phase triggers at 80% of target (+8%). You are at 62% (+6.2%). Reducing too early slows progress and creates the time pressure you designed the phases to avoid. The 3-phase transitions are pre-defined: Build Phase continues until +8%.' },
  ]},
  { scenario: '<strong>Re-attempt decision:</strong> You failed your challenge on Day 18 (breached daily DD after 3 consecutive losses on a volatile FOMC day \u2014 you traded through the event despite your plan saying to flatten). The firm emails you a 25% discount if you re-purchase within 48 hours. You feel angry at yourself for breaking your own rule. What do you do?', options: [
    { text: 'Take the discount and start immediately \u2014 you know what went wrong (traded FOMC) and you will not do it again', correct: false, explain: '"I will not do it again" is the same thing every gambler says. You broke your own WRITTEN rule under live challenge pressure. That is a psychological failure, not a knowledge gap. You KNEW you should not trade FOMC. You did it anyway. Until you understand WHY you broke the rule (time pressure? Behind schedule? Thought you were an exception?), you will break it again under similar pressure.' },
    { text: 'Decline the discount. Wait 2 weeks. Analyse: Why did you break the FOMC rule? Demo-test 5 days with the rule enforced. Then decide whether to re-attempt.', correct: true, explain: 'The failure was not "I traded FOMC." The failure was "I broke my own written rule under pressure." That is a psychological issue that needs diagnosis: Were you behind schedule? Did you feel time pressure? Did 3 losses trigger revenge? The discount saves \u00A375\u2013\u00A3100. Another failed challenge costs \u00A3300+ plus weeks of time. The 2-week cooling period and demo test are investments in NOT repeating the same failure.' },
    { text: 'Quit prop trading \u2014 if you cannot follow your own rules, you are not ready', correct: false, explain: 'Over-reaction. One rule break does not prove permanent unfitness. Most successful prop traders failed 2\u20133 challenges before passing. The question is whether you learn FROM the failure or repeat it. If the analysis reveals a pattern (you always break rules under time pressure), THAT needs fixing. If it was a one-time lapse, the fix is simpler.' },
  ]},
];

const quizQuestions = [
  { q: 'What is the #1 psychological trap during a prop challenge?', opts: ['Fear of losing money', 'The sunk cost fallacy \u2014 letting the challenge fee influence trading decisions', 'Boredom during slow markets', 'Overconfidence after passing other challenges'], correct: 1, explain: 'The sunk cost fallacy ("I paid \u00A3400 so I need to make it work") causes traders to take B-grade setups, force trades, and increase risk \u2014 all to justify the fee they already spent. The fee is gone regardless. Each trade should be judged independently.' },
  { q: 'What is the "2-loss rule" and why does it work?', opts: ['After 2 losses, double your risk to recover', 'After 2 consecutive losses, stop trading for the day \u2014 because emotional degradation after losses makes all subsequent analysis unreliable', 'After 2 losses, switch to a different instrument', 'After 2 losses, reduce risk by 50%'], correct: 1, explain: 'After 2 consecutive losses, frustration compromises your pattern recognition and decision-making. The "A-grade" setup you see after 2 losses might be a B-grade that your frustrated brain is upgrading. Stopping preserves DD buffer AND emotional capital for tomorrow.' },
  { q: 'Why does Phase 2 have a higher failure rate than Phase 1 despite a lower profit target?', opts: ['Phase 2 has stricter rules', 'The overconfidence from passing Phase 1 combined with fear of losing that achievement causes defensive trading that undermines the strategy', 'Phase 2 markets are more volatile', 'Phase 2 has a shorter time limit'], correct: 1, explain: 'The Phase 1 \u2192 Phase 2 choke: passing Phase 1 creates a mental anchor. Every Phase 2 loss threatens that achievement. This causes early profit-taking (reducing R:R), entry hesitation (reducing trade count), and defensive positioning (reducing edge). The fix: treat Phase 2 as a completely separate challenge.' },
  { q: 'After failing a challenge, when is the EARLIEST you should consider re-attempting?', opts: ['Immediately \u2014 while the lessons are fresh', 'Within 48 hours to get the firm\u2019s discount', 'After at least 2 weeks of analysis and demo testing', 'After 6 months of additional training'], correct: 2, explain: 'Minimum 2 weeks: Week 1 for analysis (why did you fail? strategy, execution, psychology, or variance?). Week 2 for demo testing the fix. Only then can you make a rational decision about re-attempting. The 48-hour discount is designed to capture emotional re-purchases.' },
  { q: 'A 5-trade winning streak during your challenge means:', opts: ['You are "in the zone" and should increase risk', 'You should lock in profits and reduce risk immediately', 'Absolutely nothing about your next trade \u2014 each trade is independent at your win rate', 'Your strategy is working better than expected and you should add more instruments'], correct: 2, explain: 'Each trade is independent. A 5-win streak at 58% WR has a 6.5% probability and happens regularly. It does not predict the next trade, does not indicate temporary skill enhancement, and should not change your risk parameters. The plan was set before the challenge for mathematical reasons.' },
  { q: 'How should you handle the "I am so close to the target" paralysis?', opts: ['Take a break for several days until you feel ready', 'Trust the Protect Phase plan \u2014 reduce risk, take only A+ setups, and let the maths work over the remaining days', 'Increase risk to finish quickly and end the psychological discomfort', 'Stop trading and hope the current profit is enough to pass'], correct: 1, explain: 'The Protect Phase exists specifically for this moment. At 80%+ of target, the pre-defined plan says: reduce risk, ultra-selective A+ only, 1 trade/day max. The maths works \u2014 you calculated it in Lesson 9.4. Trust the process. The paralysis comes from OUTCOME focus. Switch to PROCESS focus: "Is today\u2019s setup A+? Yes. Take it. No. Skip it. Done."' },
  { q: 'What is the difference between "appropriate caution" and "fear-based trading" during a challenge?', opts: ['There is no difference \u2014 all caution is good', 'Appropriate caution follows the pre-defined plan; fear-based trading deviates from it (early exits, skipped entries, tightened stops) due to emotional pressure', 'Fear-based trading means not trading at all', 'Appropriate caution means taking fewer trades than planned'], correct: 1, explain: 'Appropriate caution = following the plan (which already includes reduced risk and selective entries). Fear-based trading = deviating from the plan: closing trades early at +0.2R instead of planned +1.5R, hesitating on valid entries, or tightening stops beyond the plan. If you catch yourself making decisions not in the written plan, you are trading from fear.' },
  { q: 'The daily check question every trader should ask during a challenge is:', opts: ['"How much profit did I make today?"', '"Am I trading MY system, or am I trading THE CHALLENGE?" \u2014 if the challenge pressure is changing your decisions, stop for the day', '"Did I beat other traders in the challenge?"', '"How many days do I have left?"'], correct: 1, explain: 'This is the identity check. Your system is your edge. The challenge is the environment. If the environment is changing your decisions (forcing trades, skipping valid entries, increasing/decreasing risk outside the plan), you are no longer trading your system \u2014 you are trading your emotions. Stop, reset, return tomorrow.' },
];

export default function ChallengeMindset() {
  const [scrollY, setScrollY] = useState(0);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [gameRound, setGameRound] = useState(0);
  const [gameAnswers, setGameAnswers] = useState<(number | null)[]>(Array(gameRounds.length).fill(null));
  const [gameScore, setGameScore] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(Array(quizQuestions.length).fill(null));
  const [showConfetti, setShowConfetti] = useState(false);
  const [certUnlocked, setCertUnlocked] = useState(false);
  /* Assessment state */
  const [assessAnswers, setAssessAnswers] = useState<(number | null)[]>(Array(assessQs.length).fill(null));
  const [assessDone, setAssessDone] = useState(false);

  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);
  const toggle = (id: string) => setOpenSections(s => ({ ...s, [id]: !s[id] }));

  const handleGameAnswer = (oi: number) => { if (gameAnswers[gameRound] !== null) return; const a = [...gameAnswers]; a[gameRound] = oi; setGameAnswers(a); if (gameRounds[gameRound].options[oi].correct) setGameScore(s => s + 1); };
  const handleQuizAnswer = (qi: number, oi: number) => { if (quizAnswers[qi] !== null) return; const a = [...quizAnswers]; a[qi] = oi; setQuizAnswers(a); };

  const quizDone = quizAnswers.every(a => a !== null);
  const quizScoreVal = quizDone ? Math.round(quizAnswers.reduce<number>((s, a, i) => s + (a === quizQuestions[i].correct ? 1 : 0), 0) / quizQuestions.length * 100) : 0;
  useEffect(() => { if (quizDone && quizScoreVal >= 66 && !certUnlocked) { setCertUnlocked(true); setShowConfetti(true); const t = setTimeout(() => setShowConfetti(false), 4000); return () => clearTimeout(t); } }, [quizDone, quizScoreVal, certUnlocked]);

  /* Assessment scoring */
  const catScores = assessDone ? (() => {
    const cats: Record<string, number[]> = { sunk: [], time: [], revenge: [], confidence: [], discipline: [] };
    assessQs.forEach((q, i) => { if (assessAnswers[i] !== null) cats[q.cat].push(assessAnswers[i] as number); });
    const avg = (arr: number[]) => arr.length ? arr.reduce<number>((s, v) => s + v, 0) / arr.length : 0;
    return { sunk: avg(cats.sunk), time: avg(cats.time), revenge: avg(cats.revenge), confidence: avg(cats.confidence), discipline: avg(cats.discipline) };
  })() : null;
  const readinessScore = catScores ? Math.round(10 - ((catScores.sunk + catScores.time + catScores.revenge + catScores.confidence + catScores.discipline) / 5) * 3) : 0;
  const weakest = catScores ? Object.entries(catScores).sort((a, b) => b[1] - a[1])[0] : null;
  const catLabels: Record<string, string> = { sunk: 'Sunk Cost Sensitivity', time: 'Time Pressure Response', revenge: 'Revenge Trading Risk', confidence: 'Confidence Calibration', discipline: 'Plan Adherence Under Pressure' };
  const catStrategies: Record<string, string> = {
    sunk: 'Before each trade, ask: "Would I take this on a free demo?" If the answer is no, you are trading the fee, not the setup. Write this question on a sticky note next to your screen.',
    time: 'Set a calendar reminder at Day 10 and Day 20 to check trades-remaining vs trades-needed (Lesson 9.4 formula). If the maths works, ignore the calendar. Never check the day count daily.',
    revenge: 'Implement the 2-loss rule as NON-NEGOTIABLE. After 2 consecutive losses, close the platform. Set a phone timer for the next morning. No exceptions. This one rule prevents more failures than any other.',
    confidence: 'Write your risk parameters on paper and tape them to your monitor. After winning streaks, read them aloud before your next trade. "My risk is 0.75%. My risk is 0.75%." Physical reminders override emotional drift.',
    discipline: 'Print your entire challenge plan (Lesson 9.5 output). Before each session, read the current phase rules. After each trade, mark whether it followed the plan (Y/N). If 2 consecutive Ns, stop for the day.',
  };

  /* ─── DRAW FUNCTIONS ─── */
  const drawEmotionalCycle = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const cx = w / 2;
    const cy = h / 2;
    const cycle = f % 420;
    const activeIdx = Math.floor(cycle / 60) % 7;
    const chartL = 30; const chartR = w - 20; const chartT = 35; const chartB = h - 45;
    const chartW = chartR - chartL; const chartH = chartB - chartT;
    // Emotional temperature line
    ctx.beginPath(); ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]); ctx.moveTo(chartL, chartT + chartH * 0.5); ctx.lineTo(chartR, chartT + chartH * 0.5); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.font = '7px system-ui'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText('Calm', chartL - 4, chartB); ctx.fillText('High', chartL - 4, chartT);
    // Points and curve
    ctx.beginPath();
    for (let i = 0; i < 7; i++) {
      const px = chartL + (i / 6) * chartW;
      const py = chartB - (emotionalCycle[i].temp / 100) * chartH;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = 'rgba(245,158,11,0.4)'; ctx.lineWidth = 2; ctx.stroke();
    // Points
    for (let i = 0; i < 7; i++) {
      const px = chartL + (i / 6) * chartW;
      const py = chartB - (emotionalCycle[i].temp / 100) * chartH;
      const isActive = i === activeIdx;
      ctx.beginPath(); ctx.arc(px, py, isActive ? 8 : 4, 0, Math.PI * 2);
      ctx.fillStyle = isActive ? emotionalCycle[i].color : emotionalCycle[i].color + '44'; ctx.fill();
      // Phase label
      ctx.fillStyle = isActive ? '#fff' : 'rgba(255,255,255,0.3)';
      ctx.font = `${isActive ? 'bold 8' : '7'}px system-ui`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(emotionalCycle[i].phase, px, chartB + 4);
    }
    // Active emotion + quote
    if (activeIdx < 7) {
      ctx.fillStyle = emotionalCycle[activeIdx].color; ctx.font = 'bold 11px system-ui';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(emotionalCycle[activeIdx].emotion, cx, 6);
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'italic 8px system-ui';
      const quote = emotionalCycle[activeIdx].desc;
      const maxW = w - 40;
      if (ctx.measureText(quote).width > maxW) {
        const words = quote.split(' '); let line = ''; const lines: string[] = [];
        for (const word of words) { const t = line + (line ? ' ' : '') + word; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = word; } else { line = t; } }
        if (line) lines.push(line);
        let ly = h - 8 - (lines.length - 1) * 10;
        for (const l of lines) { ctx.fillText(l, cx, ly); ly += 10; }
      } else { ctx.fillText(quote, cx, h - 12); }
    }
  }, []);

  const drawSunkCost = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const cx = w / 2;
    const cy = h / 2;
    const cycle = f % 240;
    const phase = cycle < 120 ? 0 : 1;
    // Scale beam
    const beamY = cy - 20;
    const beamW = w * 0.6;
    const tiltMax = 15;
    const tilt = phase === 0 ? Math.sin(cycle * 0.05) * tiltMax : 0;
    ctx.save(); ctx.translate(cx, beamY); ctx.rotate(tilt * Math.PI / 180);
    // Beam
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-beamW / 2, 0); ctx.lineTo(beamW / 2, 0); ctx.stroke();
    // Fulcrum
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-8, 20); ctx.lineTo(8, 20); ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fill();
    // Left pan (sunk cost)
    const panY = 30;
    ctx.fillStyle = phase === 0 ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.1)';
    ctx.fillRect(-beamW / 2 - 30, panY, 60, 35);
    ctx.fillStyle = phase === 0 ? '#ef4444' : 'rgba(239,68,68,0.4)';
    ctx.font = 'bold 9px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('\u00A3400', -beamW / 2, panY + 12);
    ctx.font = '7px system-ui'; ctx.fillText('SPENT', -beamW / 2, panY + 24);
    // Right pan (rational decision)
    ctx.fillStyle = phase === 1 ? 'rgba(34,197,94,0.3)' : 'rgba(34,197,94,0.1)';
    ctx.fillRect(beamW / 2 - 30, panY, 60, 35);
    ctx.fillStyle = phase === 1 ? '#22c55e' : 'rgba(34,197,94,0.4)';
    ctx.font = 'bold 9px system-ui'; ctx.fillText('NEXT', beamW / 2, panY + 12);
    ctx.font = '7px system-ui'; ctx.fillText('TRADE', beamW / 2, panY + 24);
    ctx.restore();
    // Labels
    ctx.fillStyle = phase === 0 ? '#ef4444' : '#22c55e'; ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(phase === 0 ? 'TILTED: Fee is driving decisions' : 'LEVEL: Each trade judged independently', cx, 8);
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '8px system-ui'; ctx.textBaseline = 'bottom';
    ctx.fillText(phase === 0 ? 'The \u00A3400 pulls the scale. Your trading is biased.' : 'The fee is sunk. Your next trade is a clean decision.', cx, h - 6);
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
          <motion.p variants={fadeUp} className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-4">Level 9 &middot; Lesson 6 of 14</motion.p>
          <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold leading-tight mb-4 bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>The Challenge Mindset</motion.h1>
          <motion.p variants={fadeUp} className="text-gray-400 max-w-lg mx-auto text-sm leading-relaxed">The psychology that separates the 3% who pass from the 97% who don&apos;t. Sunk costs, revenge triggers, phase chokes, and the re-attempt framework.</motion.p>
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.8 }} className="absolute bottom-8 flex flex-col items-center gap-2 text-gray-600 text-xs">Scroll to begin<motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-amber-500">&#8964;</motion.div></motion.div>
      </section>

      <section className="max-w-2xl mx-auto px-5 py-20"><motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">00 &mdash; Why This Matters</p><h2 className="text-2xl font-extrabold mb-4">Your Biggest Enemy Has a Heartbeat</h2><div className="p-6 rounded-2xl glass-card space-y-4">
        <p className="text-sm text-gray-300 leading-relaxed">Lessons 9.3&ndash;9.5 gave you the maths, the firm selection, and the strategy design. Every number was optimised. Every parameter was calculated. And none of it matters if your <strong className="text-white">psychology breaks under challenge pressure</strong>.</p>
        <p className="text-sm text-gray-300 leading-relaxed">The prop challenge environment is psychologically unique. You paid money (sunk cost bias). There is a deadline (time pressure). There is a termination threat (loss aversion amplified). And every trade carries the weight of &ldquo;this could end my challenge.&rdquo; No other trading context combines all four psychological pressures simultaneously.</p>
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-purple-500/10 border border-amber-500/20"><p className="text-xs font-bold text-amber-400 mb-1">&#9889; REAL SCENARIO</p><p className="text-xs text-gray-300">A trader with 62% WR and a perfect Lesson 9.5 challenge plan failed 3 consecutive challenges. Each time, the failure was NOT strategic &mdash; it was psychological. Challenge 1: revenge-traded after 2 losses on Day 7, breached daily DD. Challenge 2: increased risk on Day 22 to &ldquo;finish fast,&rdquo; gave back 4%. Challenge 3: froze at +8.5% (near target), took zero trades for 5 days, then panic-traded on the last day. <strong className="text-white">Same strategy. Same maths. Three different psychological failures.</strong> This lesson exists to prevent that.</p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Emotional Cycle</p><h2 className="text-2xl font-extrabold mb-2">7 Phases Every Challenger Experiences</h2><p className="text-gray-400 text-sm mb-4">From purchase excitement to pass/fail relief. Knowing the cycle means recognising each phase BEFORE it hijacks your decisions.</p>
      <div className="rounded-2xl glass-card p-4"><AnimScene drawFn={drawEmotionalCycle} height={300} /></div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Sunk Cost Scale</p><h2 className="text-2xl font-extrabold mb-2">Is the Fee Driving Your Decisions?</h2><p className="text-gray-400 text-sm mb-4">The challenge fee tilts the decision scale. Your job is to level it. Each trade should be judged as if the challenge were free.</p>
      <div className="rounded-2xl glass-card p-4"><AnimScene drawFn={drawSunkCost} height={240} /></div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; 5 Psychological Traps</p><h2 className="text-2xl font-extrabold mb-4">Know Your Enemy</h2><div className="space-y-3">{psychTraps.map((trap, i) => (<div key={i}><button onClick={() => toggle(`trap-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{trap.name}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`trap-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`trap-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05] space-y-2"><p className="text-xs text-gray-500">Trigger: {trap.trigger}</p><p className="text-xs text-red-400">Thought: {trap.thought}</p><p className="text-xs text-gray-300">Reality: {trap.reality}</p><p className="text-xs text-green-400">Antidote: {trap.antidote}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Re-Attempt Framework</p><h2 className="text-2xl font-extrabold mb-4">After Failure: The 4-Week Timeline</h2><div className="p-6 rounded-2xl glass-card space-y-3">{reAttemptFramework.map((step, i) => (<div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><div className="flex items-start gap-3"><span className="text-xs font-bold px-2 py-1 rounded-lg shrink-0 mt-0.5" style={{ color: step.color, background: step.color + '18', border: `1px solid ${step.color}33` }}>{step.action}</span><div><p className="text-sm font-bold text-gray-200">{step.trigger}</p><p className="text-xs text-gray-400 mt-1">{step.reason}</p></div></div></div>))}</div></motion.div></section>

      {/* S05 — GROUNDBREAKING: Challenge Psychology Assessment */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Know Yourself</p><h2 className="text-2xl font-extrabold mb-2">&#127919; Challenge Psychology Assessment</h2><p className="text-gray-400 text-sm mb-4">10 questions across 5 vulnerability categories. Discover which psychological traps you are most susceptible to and get targeted strategies.</p>
      <div className="p-6 rounded-2xl glass-card space-y-5">
        {!assessDone ? (<>{assessQs.map((aq, qi) => (<div key={qi} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-xs font-bold text-amber-400 mb-1">Q{qi + 1}/10</p><p className="text-sm text-gray-200 mb-3">{aq.q}</p><div className="space-y-1.5">{aq.opts.map((opt, oi) => (<button key={oi} onClick={() => { const a = [...assessAnswers]; a[qi] = oi; setAssessAnswers(a); }} className={`w-full text-left p-2.5 rounded-lg text-xs transition-all ${assessAnswers[qi] === oi ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400' : 'bg-white/[0.03] border border-white/[0.06] text-gray-400 hover:bg-white/[0.06]'}`}>{opt}</button>))}</div></div>))}<button onClick={() => { if (assessAnswers.every(a => a !== null)) setAssessDone(true); }} disabled={!assessAnswers.every(a => a !== null)} className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-sm font-bold text-white active:scale-95 transition-transform disabled:opacity-40">Generate My Readiness Profile &rarr;</button></>) : catScores && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-purple-500/10 border border-amber-500/20 text-center"><p className="text-xs text-gray-400">Challenge Readiness Score</p><p className="text-3xl font-extrabold" style={{ color: readinessScore >= 7 ? '#22c55e' : readinessScore >= 5 ? '#f59e0b' : '#ef4444' }}>{readinessScore}/10</p><p className="text-xs text-gray-500">{readinessScore >= 7 ? 'Strong psychological readiness. Focus on your weakest category below.' : readinessScore >= 5 ? 'Moderate readiness. Address your top vulnerability before starting a challenge.' : 'Significant vulnerabilities detected. Work on the strategies below before spending on a challenge.'}</p></div>
          {/* Category breakdown */}
          <div className="space-y-2">{Object.entries(catScores).map(([cat, score]) => { const pct = Math.round((1 - score / 3) * 100); const color = pct >= 70 ? '#22c55e' : pct >= 40 ? '#f59e0b' : '#ef4444'; return (<div key={cat} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><div className="flex justify-between mb-1"><p className="text-xs font-bold" style={{ color }}>{catLabels[cat]}</p><p className="text-xs font-mono" style={{ color }}>{pct}%</p></div><div className="h-1.5 rounded-full bg-white/[0.06]"><div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} /></div></div>); })}</div>
          {/* Weakest area + strategy */}
          {weakest && (<div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20"><p className="text-xs font-bold text-red-400 mb-1">&#9888;&#65039; YOUR #1 VULNERABILITY: {catLabels[weakest[0]].toUpperCase()}</p><p className="text-xs text-gray-300">{catStrategies[weakest[0]]}</p></div>)}
          <button onClick={() => { setAssessDone(false); setAssessAnswers(Array(assessQs.length).fill(null)); }} className="text-xs text-gray-500 underline">Retake Assessment</button>
        </motion.div>)}
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; The Daily Check</p><h2 className="text-2xl font-extrabold mb-4">One Question Every Session</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-purple-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">&ldquo;Am I trading my SYSTEM, or am I trading the CHALLENGE?&rdquo;</p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#22c55e]">TRADING YOUR SYSTEM</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">A+ setups only. Pre-defined risk. Session filter respected. 2-loss rule followed. Phase transitions as planned. Decisions match the written plan.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">TRADING THE CHALLENGE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Taking B-grade setups because you &ldquo;need to make progress.&rdquo; Increasing risk because you are &ldquo;behind.&rdquo; Skipping valid entries because you are &ldquo;protecting gains.&rdquo; Any decision not in the written plan.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">THE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">If you catch yourself making decisions not in the plan, stop. Close the platform. Return tomorrow. You have become a different trader and that trader will lose the challenge.</span></p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; The 2-Loss Rule</p><h2 className="text-2xl font-extrabold mb-4">The Single Most Powerful Rule</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#3b82f6]">THE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">After 2 consecutive losses, stop trading for the day. No exceptions. Not &ldquo;one more trade.&rdquo; Not &ldquo;reduced risk.&rdquo; Done. Platform closed. See you tomorrow.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#22c55e]">WHY IT WORKS</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">After 2 losses, your daily DD is down 1.5% (at 0.75% risk). You have 3.5% remaining. Mathematically, this is fine. Psychologically, your pattern recognition is degraded by frustration. The &ldquo;A-grade&rdquo; setup you see might be a B-grade your emotional brain is upgrading.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#f59e0b]">THE COST OF IGNORING IT</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">A 3rd loss puts you at -2.25% daily. A 4th at -3%. A 5th at -3.75%. One more and you breach. That is how a -1.5% morning becomes a -5% termination. The 2-loss rule would have saved the challenge at -1.5%.</span></p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p><h2 className="text-2xl font-extrabold mb-4">4 Mindset Failures</h2><div className="space-y-3">{commonMistakes.map((item, i) => (<div key={i}><button onClick={() => toggle(`cm-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`cm-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`cm-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-xs text-red-400 mb-2">&#10060; {item.mistake}</p><p className="text-xs text-green-400">&#10004; {item.fix}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Cheat Sheet</p><h2 className="text-2xl font-extrabold mb-4">Challenge Mindset Quick Reference</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#ef4444]">SUNK COST TEST</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">&ldquo;Would I take this trade on a free demo?&rdquo; If no, you are trading the fee, not the setup. Skip it.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#3b82f6]">2-LOSS RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">2 consecutive losses = done for the day. Non-negotiable. This single rule prevents more challenge failures than any strategy adjustment.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#8b5cf6]">PHASE 2 RESET</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Treat Phase 2 as a completely new challenge. Your Phase 1 result is irrelevant. Same plan, same parameters, fresh mindset.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#f59e0b]">2-WEEK COOLDOWN</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">After any failure: minimum 2 weeks before re-attempt. Week 1 = analyse. Week 2 = demo test the fix. THEN decide.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">THE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">&ldquo;Am I trading my system, or am I trading the challenge?&rdquo; Ask before every session. If the answer is the challenge, close the platform.</span></p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Test Your Understanding</p><h2 className="text-2xl font-extrabold mb-2">Challenge Mindset Game</h2><p className="text-gray-400 text-sm mb-6">5 scenario-based rounds. Navigate sunk costs, revenge triggers, phase chokes, and re-attempt decisions.</p>
      <div className="p-6 rounded-2xl glass-card"><div className="flex items-center justify-between mb-4"><span className="text-xs font-bold text-amber-400">Round {gameRound + 1} of {gameRounds.length}</span><span className="text-xs font-mono text-gray-500">{gameScore}/{gameRounds.length} correct</span></div><p className="text-sm text-gray-300 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: gameRounds[gameRound].scenario }} /><div className="space-y-2">{gameRounds[gameRound].options.map((opt, oi) => { const answered = gameAnswers[gameRound] !== null; const selected = gameAnswers[gameRound] === oi; const isCorrect = opt.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return (<div key={oi}><button onClick={() => handleGameAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt.text }} /></button>{answered && selected && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]"><p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`} dangerouslySetInnerHTML={{ __html: opt.explain }} /></motion.div>)}</div>); })}</div>{gameAnswers[gameRound] !== null && gameRound < gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5"><button onClick={() => setGameRound(r => r + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button></motion.div>)}{gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Outstanding \u2014 your psychological awareness is at a level most prop traders never reach.' : gameScore >= 3 ? 'Good \u2014 review the revenge trading and Phase 2 choke scenarios for extra resilience.' : 'Re-read the 5 psychological traps and the 2-loss rule. Mindset failures cost more than strategy failures.'}</p></motion.div>)}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Knowledge Check</p><h2 className="text-2xl font-extrabold mb-6">Final Quiz &mdash; 8 Questions</h2>
      <div className="space-y-6">{quizQuestions.map((q, qi) => (<div key={qi} className="p-5 rounded-2xl glass-card"><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p><p className="text-sm font-semibold text-white mb-4">{q.q}</p><div className="space-y-2">{q.opts.map((opt, oi) => { const answered = quizAnswers[qi] !== null; const selected = quizAnswers[qi] === oi; const isCorrect = oi === q.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return <button key={oi} onClick={() => handleQuizAnswer(qi, oi)} disabled={answered} className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`}>{opt}</button>; })}</div>{quizAnswers[qi] !== null && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg bg-white/[0.02]"><p className="text-xs text-amber-400" dangerouslySetInnerHTML={{ __html: `<span class="font-bold">&#9989;</span> ${q.explain}` }} /></motion.div>)}</div>))}</div>
      {quizDone && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center"><p className="text-3xl font-extrabold mb-2">{quizScoreVal}%</p><p className="text-sm text-gray-400">{quizScoreVal >= 66 ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate. Review and try again.'}</p></motion.div>)}
      {certUnlocked && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10"><div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}><div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(139,92,246,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} /><div className="relative z-10 text-center"><div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">&#129504;</div><p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p><p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 9: The Challenge Mindset</strong><br />at ATLAS Academy by Interakktive</p><p className="bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Challenge Psychologist &mdash;</p><p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L9.6-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p></div></div></motion.div>)}</motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-20 text-center"><Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">&larr; Back to Academy</Link></section>
    </div>
  );
}
