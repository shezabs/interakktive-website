// app/academy/lesson/challenge-strategy-design/page.tsx
// ATLAS Academy — Lesson 9.5: Designing Your Challenge Strategy [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 9
// GROUNDBREAKING: Challenge Strategy Designer — adapt personal strategy for challenge constraints
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
const adaptations = [
  { personal: 'Risk 1\u20131.5% per trade', challenge: 'Risk 0.5\u20130.75% per trade', why: 'Daily DD limit means your personal risk level is 1\u20132 bad trades from termination. Halving risk doubles your survival buffer.', icon: '📉' },
  { personal: '3\u20135 trades per day', challenge: '1\u20132 trades per day (A+ setups only)', why: 'More trades = more DD exposure per day. Each additional trade increases the probability of hitting daily DD. Quality over quantity wins challenges.', icon: '🎯' },
  { personal: 'Hold overnight freely', challenge: 'Close all by end of session (unless swing firm)', why: 'Overnight gaps cannot be controlled. A 100-pip gap against you on a funded account could breach overall DD without you being at the screen.', icon: '🌙' },
  { personal: 'Trade all sessions', challenge: 'Focus on your best 1\u20132 sessions only', why: 'Your win rate varies by session. If you are 62% WR in London but 48% in Asia, trading Asia during a challenge is negative EV with DD risk attached.', icon: '⏰' },
  { personal: 'Trade through news', challenge: 'Flatten before Tier 1 events', why: 'A single NFP spike can wipe 3\u20134% of your account in seconds. On a personal account, you recover next week. On a challenge, you are terminated.', icon: '📰' },
  { personal: 'Multiple instruments simultaneously', challenge: 'One instrument at a time (max 2 correlated)', why: 'Multiple positions multiply your DD exposure. Two correlated losing positions at 0.75% each = 1.5% daily DD consumed in one moment.', icon: '📊' },
];

const threePhases = [
  { name: 'CAUTIOUS START', days: 'Days 1\u20135', risk: '0.5%', trades: '1/day', target: 'Build \u00A31,500\u2013\u00A32,000 (+1.5\u20132%)', color: '#3b82f6', desc: 'Prove you belong. Show consistency. No hero trades. The goal is NOT to make money \u2014 it is to NOT lose money while demonstrating discipline. If you finish Day 5 at +1.5%, you are ahead of 60% of challengers.' },
  { name: 'BUILD PHASE', days: 'Days 6\u201320', risk: '0.75%', trades: '1\u20132/day', target: 'Accumulate to +8% (\u00A38,000)', color: '#22c55e', desc: 'Normal-but-controlled trading. Take your standard A+ setups at slightly reduced risk. The bulk of your profit comes from this phase. Steady, consistent, no forced trades. If no setup, no trade.' },
  { name: 'PROTECT PHASE', days: 'Days 21\u201330', risk: '0.5% or below', trades: '1/day max', target: 'Grind from +8% to +10% (\u00A32,000 more)', color: '#f59e0b', desc: 'The 80% rule activated. You need 2% more with 10 days to spare. At 0.5% risk with your EV, that is ~8\u201310 trades. You have time for 10\u201320. Slow, defensive, ultra-selective. One A+ setup per day is enough.' },
];

const frontVsSteady = [
  { approach: 'Front-Loading', desc: 'Start at 0.75\u20131% risk for the first 2 weeks, then reduce to 0.5% once ahead. Advantages: builds a profit buffer early, reduces psychological pressure in the second half. Disadvantages: higher risk of early DD breach, not suitable for traders who need time to "warm up."', bestFor: 'Confident traders with high WR who want to bank profit early and cruise to the finish.', color: '#f59e0b' },
  { approach: 'Steady-State', desc: 'Maintain 0.75% risk throughout (reducing only in the final protect phase). Advantages: consistent approach, no phase transitions to manage, simpler to execute. Disadvantages: slower start, more dependent on time limit.', bestFor: 'Most traders. Simpler to execute and less prone to the "I need to make up time" trap.', color: '#3b82f6' },
  { approach: 'Conservative Start', desc: 'Start at 0.5% for the first week, increase to 0.75% after proving consistency. The 3-phase approach. Advantages: protects against early nerves, proves the strategy works under challenge conditions. Disadvantages: slower initial progress.', bestFor: 'First-time prop challengers or traders prone to early-challenge anxiety.', color: '#22c55e' },
];

const qualityFilters = [
  { filter: 'Session Filter', personal: 'Trade any session you are awake for', challenge: 'Only trade your statistically best session (usually London or NY)', impact: 'Eliminates 30\u201350% of trades but removes the lowest-WR setups. Net effect: higher WR, fewer DD events.' },
  { filter: 'Setup Grade Filter', personal: 'Take A, B, and sometimes C setups', challenge: 'A+ setups ONLY. If it is not textbook, skip it.', impact: 'Reduces trade count by 40\u201360% but increases WR by 5\u201310%. Fewer trades with higher probability = faster, safer path to target.' },
  { filter: 'Confluence Filter', personal: '2 confluences = entry', challenge: '3+ confluences = entry (macro + technical + trigger all aligned)', impact: 'Your Level 8 macro skills become a superpower here. Only entering when macro, SMC, and trigger ALL agree dramatically reduces losers.' },
  { filter: 'Time-of-Day Filter', personal: 'Trade from market open to close', challenge: 'Trade only during your 2\u20133 highest-WR hours within your best session', impact: 'Most traders have a "golden window" of 2\u20133 hours where their WR is 5\u201310% higher. Finding and trading only this window is the highest-ROI challenge optimisation.' },
];

const commonMistakes = [
  { title: 'Using Your Personal Strategy Unchanged', mistake: '"My strategy works on my personal account so I will use the exact same approach on the challenge." Your personal account has no daily DD limit, no time limit, no minimum trading days, and no termination risk. The same strategy in a different rule environment produces different results.', fix: 'Adapt: reduce risk to 50\u201375% of personal, increase setup selectivity, limit sessions to your best ones, and pre-define a 3-phase plan. Same SYSTEM, different PARAMETERS.' },
  { title: 'Taking Every Setup During the Challenge', mistake: '"I need to make 10% so I should take every setup I see to accumulate profit faster." More trades = more DD exposure. If your B-grade setups have 48% WR (instead of 58% for A-grade), each one has negative expected value at challenge risk levels.', fix: 'Filter ruthlessly. Only A+ setups. If you normally take 4 trades/day, challenge mode is 1\u20132. The trades you DON\u2019T take during a challenge are more important than the ones you do.' },
  { title: 'No Phase Transitions', mistake: '"I will just risk 0.75% the whole time." Flat risk ignores the changing context. At +2% on Day 5, you have different risk capacity than at +8% on Day 20. The optimal risk DECREASES as you approach the target because the downside (losing the challenge) grows relative to the upside (finishing slightly faster).', fix: 'Pre-define your 3 phases with specific transition triggers. When equity hits 80% of target, reduce risk automatically. Write it down before the challenge starts. No mid-challenge decisions.' },
  { title: 'Trading Sessions Where Your WR Is Lowest', mistake: '"I will trade London AND New York to maximise opportunities." If your London WR is 61% but New York is 49%, every NY trade has negative EV during a challenge. You are paying for the privilege of losing money.', fix: 'Audit your trade journal by session. Find your highest-WR session and ONLY trade that session during the challenge. The lost "opportunity" from skipping low-WR sessions is actually gained DD buffer.' },
];

const gameRounds = [
  { scenario: '<strong>Adaptation test:</strong> Your personal strategy: 1% risk, 4 trades/day, holds overnight, trades Gold during London and New York, trades through NFP. You are about to start a \u00A3100K challenge with 5% daily DD. What is your adapted challenge strategy?', options: [
    { text: 'Same strategy but with 0.5% risk \u2014 just reduce the risk and everything else stays the same', correct: false, explain: 'Reducing risk alone is not enough. 4 trades/day at 0.5% = 2% daily DD exposure if all lose. Add overnight hold risk and NFP exposure and you are far beyond safe limits. The FULL adaptation includes: reduced risk, fewer trades, session filtering, news avoidance, and close-by-EOD.' },
    { text: '0.5\u20130.75% risk, 1\u20132 trades/day (A+ only), London session only, flatten before NFP, close all by London close, single instrument', correct: true, explain: 'Complete adaptation. Risk halved (0.5\u20130.75%). Trade count reduced to 1\u20132 A+ setups. Best session only (London). News flattened. No overnight exposure. One instrument to avoid correlation doubling. Same underlying SYSTEM (same SMC, same entry triggers, same structure analysis), completely different PARAMETERS.' },
    { text: 'Keep everything the same but add a hard stop at -3% daily \u2014 the DD limit will protect me', correct: false, explain: 'A hard stop at -3% is a damage limit, not a strategy adaptation. At 1% risk with 4 trades, you hit -3% after just 3 losses. That is a 7.4% probability per day (0.42\u00B3). Over 22 trading days, the probability of hitting -3% at least once is ~84%. Your "protection" is almost guaranteed to trigger.' },
  ]},
  { scenario: '<strong>Quality vs quantity:</strong> During your challenge, it is 10:15 AM and you have already taken your one A+ setup for the day (+0.8% profit). A B-grade setup appears at 10:45 that meets most of your criteria but not all (missing macro confluence). Your overall challenge equity is at +4.3% (target 10%). What do you do?', options: [
    { text: 'Take it \u2014 you need 5.7% more and every trade counts toward the target', correct: false, explain: 'This is the trap. A B-grade setup has lower WR (estimated 48\u201352% vs your 58\u201362% on A-grade). At 0.75% risk, the EV of a B-grade trade might be slightly negative or breakeven. You are risking real DD for near-zero expected gain. The trade you skip costs nothing. The trade you take and lose costs 0.75% of your buffer.' },
    { text: 'Skip it \u2014 you already hit your 1-trade target for the day, the setup is B-grade, and protecting +4.3% is more valuable than the potential +0.75% from a lower-probability trade', correct: true, explain: 'Discipline over opportunity. You are +4.3% with a plan that says 1\u20132 trades/day, A+ only. You already took 1 and it worked. Adding a B-grade trade risks giving back the day\u2019s gain for marginal expected value. Over the course of the challenge, the trades you SKIP are what keep your equity curve smooth and your DD low.' },
    { text: 'Take it but with reduced risk (0.25%) to limit the downside', correct: false, explain: 'Better than full risk, but the question is not about risk sizing \u2014 it is about trade selection. A B-grade setup at any risk level is still a lower-probability trade. At 0.25% risk, the max loss is small, but you are training yourself to deviate from your A+-only rule. That discipline leak will cost more than 0.25% over the full challenge.' },
  ]},
  { scenario: '<strong>Phase transition:</strong> Day 18 of 30. You are at +8.1% (target 10%). You have been using 0.75% risk in the Build Phase. According to your pre-defined plan, +8% triggers the Protect Phase (0.5% risk, 1 trade/day max). However, you feel "hot" \u2014 your last 5 trades were all winners. What do you do?', options: [
    { text: 'Stay at 0.75% \u2014 you are on a winning streak and momentum is on your side', correct: false, explain: 'The gambler\u2019s fallacy. Your last 5 wins do not change the probability of your next trade. Each trade is independent at 58% WR. What HAS changed is your position: you are at 81% of target with 12 days remaining. The PLAN says reduce. Feelings say continue. The plan is based on maths. Feelings are based on recency bias.' },
    { text: 'Switch to Protect Phase exactly as planned \u2014 reduce to 0.5% risk, 1 trade/day max. You need 1.9% more with 12 days. The maths works easily at reduced risk.', correct: true, explain: 'This is the moment that separates the 3% from the 97%. You wrote the plan before the challenge when you were rational. Now you are mid-challenge and emotional (winning streak euphoria). Trust the plan. At 0.5% risk with +0.225% EV/trade, you need ~8 trades for 1.9%. You have 12 days. The margin is enormous. Protect the +8.1% you already earned.' },
    { text: 'Increase to 1% to finish in 2\u20133 days and lock in the pass', correct: false, explain: 'This is the classic challenge killer. "I am so close, let me just finish it." At 1% risk, a 2-loss day puts you at +6.1% \u2014 giving back 25% of your hard-earned profit. A 3-loss day: +5.6%. In 2 bad days you could go from +8.1% back to +4%. The challenge that was 80% done is now back to 40%. Protect, do not sprint.' },
  ]},
  { scenario: '<strong>Session filtering:</strong> You audit your trade journal and find your WR by session: London = 61%, New York overlap = 57%, New York afternoon = 44%, Asia = 39%. Your personal strategy trades all 4 sessions. How should you adapt for the challenge?', options: [
    { text: 'Trade all 4 sessions but with lower risk during the weaker ones', correct: false, explain: 'Lower risk during weak sessions still has negative or near-zero EV. At 44% WR and 1:1.5 R:R, EV = (0.44 \u00D7 1.125%) \u2212 (0.56 \u00D7 0.75%) = 0.495% \u2212 0.42% = +0.075% per trade. That is barely positive, and at challenge risk levels, the DD exposure is not worth the tiny expected gain.' },
    { text: 'London only (61% WR) \u2014 eliminate all other sessions entirely. The reduced trade count is offset by dramatically higher WR and lower DD exposure.', correct: true, explain: 'The optimal challenge adaptation. London at 61% WR gives EV = (0.61 \u00D7 1.125%) \u2212 (0.39 \u00D7 0.75%) = 0.686% \u2212 0.293% = +0.394% per trade. That is 5.2x the EV of NY afternoon. One good London trade per day has more expected profit than 3 NY afternoon trades combined, with 1/3 the DD exposure.' },
    { text: 'London + NY overlap (61% and 57%) for more opportunities', correct: false, explain: 'Close, and this would be acceptable. But adding NY overlap (57% WR) reduces your average WR from 61% to ~59%. The marginal trade from NY overlap has lower EV and adds DD exposure. For a first-time challenger, London-only is cleaner. For experienced prop traders, adding the overlap is reasonable \u2014 but only for A+ setups.' },
  ]},
  { scenario: '<strong>The full picture:</strong> You have adapted your strategy: 0.75% risk, 1\u20132 trades/day, London only, A+ setups, no news trading, close by end of session. Day 10 arrives and you are at +1.8% (target 10%). At this pace, you need 8.2% more in 20 days. Your EV per trade is +0.34%. At 1.5 trades/day, that is ~24 more trades needed for 8.2%. You have 20 trading days \u00D7 1.5 = 30 potential trades. Should you change your approach?', options: [
    { text: 'Yes \u2014 increase risk to 1% to speed up progress, you are behind schedule', correct: false, explain: 'At +1.8% on Day 10, you are slightly below the ideal pace but well within normal variance. You need 24 trades and have capacity for 30. That is 20% buffer. Increasing risk from 0.75% to 1% raises daily DD breach probability from ~14% to ~22% and only saves ~3 days. The added risk is not justified by the marginal time saving.' },
    { text: 'No \u2014 you have 30 potential trades for 24 needed. The maths works. Stay disciplined. The "behind schedule" feeling is emotional, not mathematical.', correct: true, explain: 'Correct. 30 available trades for 24 needed = 25% buffer. This is comfortable. The feeling of being "behind" comes from comparing Day 10 (+1.8%) to the linear target (+3.3% at Day 10). But challenge equity paths are NOT linear \u2014 they are choppy with winning and losing clusters. Being at +1.8% on Day 10 is normal variance. Changing the plan based on feelings, not maths, is how challenges fail.' },
    { text: 'Add a second instrument to double your trade opportunities', correct: false, explain: 'Adding a second instrument doubles opportunities but also doubles DD exposure and may introduce correlation risk. If both instruments lose simultaneously, you consume 1.5% of daily DD in one moment instead of 0.75%. The solution to feeling "behind" is not more exposure \u2014 it is patience and trust in the maths.' },
  ]},
];

const quizQuestions = [
  { q: 'Why should your challenge risk be 50\u201375% of your personal account risk?', opts: ['Prop firms require lower risk by rule', 'Because daily DD limits mean your personal risk level can breach the account in 3\u20135 losing trades, while halved risk doubles your survival buffer', 'Lower risk means more trades per day', 'There is no reason to change risk for challenges'], correct: 1, explain: 'At 1% personal risk with 5% daily DD, 5 consecutive losses = breach. At 0.5\u20130.75%, you survive 6\u201310 losses \u2014 which buys time for your positive EV to work. The daily DD is a hard boundary that does not exist on personal accounts.' },
  { q: 'What is the key difference between "Front-Loading" and "Steady-State" challenge approaches?', opts: ['Front-Loading uses higher risk early to build a buffer, then reduces; Steady-State maintains consistent risk throughout (with protect phase at 80%)', 'Front-Loading means taking more trades; Steady-State means fewer trades', 'There is no practical difference', 'Front-Loading is for beginners; Steady-State is for experts'], correct: 0, explain: 'Front-Loading banks profit early at slightly higher risk (0.75\u20131%), then switches to protect mode with a cushion. Steady-State keeps 0.75% throughout and only reduces at 80% of target. Front-Loading is more aggressive but builds psychological comfort from an early buffer.' },
  { q: 'Why should you filter to A+ setups only during a challenge?', opts: ['B-grade setups are against the rules at most prop firms', 'A+ setups have higher WR, and during a challenge the DD cost of lower-WR trades outweighs their marginal contribution to profit', 'Fewer trades means less commission', 'A+ setups have higher R:R'], correct: 1, explain: 'If A+ setups are 58% WR and B-grade are 48%, each B-grade trade has near-zero or negative EV at challenge risk levels. The DD exposure from taking a B-grade loser (0.75% consumed) is worse than skipping the trade (0% consumed). Quality filtering is the highest-ROI challenge optimisation.' },
  { q: 'What does the "3-Phase Approach" look like?', opts: ['Phase 1: High risk. Phase 2: Medium risk. Phase 3: Low risk.', 'Phase 1: Cautious Start (0.5% risk, prove consistency). Phase 2: Build (0.75%, accumulate profit). Phase 3: Protect (0.5%, defend gains near target).', 'Phase 1: Research. Phase 2: Paper trade. Phase 3: Live challenge.', 'Phase 1: One instrument. Phase 2: Two instruments. Phase 3: Three instruments.'], correct: 1, explain: 'Cautious \u2192 Build \u2192 Protect. Days 1\u20135 at lower risk to prove you can execute under challenge pressure. Days 6\u201320 at normal challenge risk to accumulate the bulk of profit. Final stretch at reduced risk to defend what you have earned. Pre-defined transitions, not mid-challenge decisions.' },
  { q: 'If your London session WR is 61% and New York afternoon is 44%, what should you do during a challenge?', opts: ['Trade both but with different risk levels', 'Trade London only \u2014 the higher WR generates 5x the EV per trade with less DD exposure', 'Trade New York only because it has more volatility', 'Trade both equally since the average is above 50%'], correct: 1, explain: 'London EV per trade = +0.394%. NY afternoon EV = +0.075%. One London trade has 5.2x the expected profit of one NY trade. Adding NY afternoon sessions adds DD exposure for minimal gain. During a challenge, concentrate firepower on your strongest session.' },
  { q: 'When should you trigger the Protect Phase?', opts: ['When you feel tired or stressed', 'When you reach 80% of the profit target, regardless of how many days are left', 'Only in the final 3 days of the challenge', 'When your win rate drops below 50%'], correct: 1, explain: 'The 80% rule: when equity reaches 80% of target (e.g., +8% on a 10% target), switch to protect mode immediately. Reduce risk to 0.5%, take maximum 1 trade/day, A+ setups only. The maths at this point heavily favours slow, defensive trading regardless of remaining time.' },
  { q: 'Why is "close all positions by end of session" safer than holding overnight during a challenge?', opts: ['Overnight fees are expensive', 'Overnight gaps cannot be controlled, and a 100+ pip gap against you can breach overall DD while you sleep', 'It is required by all prop firms', 'There is no difference in risk'], correct: 1, explain: 'An overnight gap of 100\u2013200 pips is not uncommon, especially around news events or geopolitical developments. On a personal account, this is a bad day. On a challenge account, this can breach overall DD immediately \u2014 and you were asleep when it happened. Closing by session end eliminates this uncontrollable risk.' },
  { q: 'What is the most important principle of challenge strategy adaptation?', opts: ['Use maximum leverage to reach the target quickly', 'Same underlying SYSTEM (your proven SMC edge), but adapted PARAMETERS (reduced risk, fewer trades, filtered sessions, phased approach)', 'Completely change your strategy to something more conservative', 'Copy the strategy of a trader who has already passed'], correct: 1, explain: 'Your edge comes from your SYSTEM (SMC analysis, entry triggers, structure reading). The PARAMETERS (risk size, trade count, session selection) are what you adapt for challenge constraints. Changing the system means trading an unproven approach. Keeping the system but adjusting parameters preserves your edge while respecting the rules.' },
];

export default function ChallengeStrategyDesign() {
  const [scrollY, setScrollY] = useState(0);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [gameRound, setGameRound] = useState(0);
  const [gameAnswers, setGameAnswers] = useState<(number | null)[]>(Array(gameRounds.length).fill(null));
  const [gameScore, setGameScore] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(Array(quizQuestions.length).fill(null));
  const [showConfetti, setShowConfetti] = useState(false);
  const [certUnlocked, setCertUnlocked] = useState(false);
  /* Designer state */
  const [dsWR, setDsWR] = useState(58);
  const [dsRR, setDsRR] = useState(1.5);
  const [dsRisk, setDsRisk] = useState(1);
  const [dsTrades, setDsTrades] = useState(3);
  const [dsTarget, setDsTarget] = useState(10);
  const [dsDays, setDsDays] = useState(30);
  const [dsResult, setDsResult] = useState(false);

  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);
  const toggle = (id: string) => setOpenSections(s => ({ ...s, [id]: !s[id] }));

  const handleGameAnswer = (oi: number) => { if (gameAnswers[gameRound] !== null) return; const a = [...gameAnswers]; a[gameRound] = oi; setGameAnswers(a); if (gameRounds[gameRound].options[oi].correct) setGameScore(s => s + 1); };
  const handleQuizAnswer = (qi: number, oi: number) => { if (quizAnswers[qi] !== null) return; const a = [...quizAnswers]; a[qi] = oi; setQuizAnswers(a); };

  const quizDone = quizAnswers.every(a => a !== null);
  const quizScoreVal = quizDone ? Math.round(quizAnswers.reduce<number>((s, a, i) => s + (a === quizQuestions[i].correct ? 1 : 0), 0) / quizQuestions.length * 100) : 0;
  useEffect(() => { if (quizDone && quizScoreVal >= 66 && !certUnlocked) { setCertUnlocked(true); setShowConfetti(true); const t = setTimeout(() => setShowConfetti(false), 4000); return () => clearTimeout(t); } }, [quizDone, quizScoreVal, certUnlocked]);

  /* Designer calculations */
  const challengeRisk = Math.round(dsRisk * 0.65 * 100) / 100;
  const challengeTrades = Math.max(1, Math.min(2, Math.ceil(dsTrades * 0.45)));
  const evPerTrade = (dsWR / 100) * (challengeRisk * dsRR) - ((100 - dsWR) / 100) * challengeRisk;
  const tradesNeeded = evPerTrade > 0 ? Math.ceil(dsTarget / evPerTrade) : 999;
  const tradingDays = Math.round(dsDays * 0.72);
  const tradesAvailable = tradingDays * challengeTrades;
  const tradeBuffer = tradesAvailable > 0 ? Math.round(((tradesAvailable - tradesNeeded) / tradesAvailable) * 100) : 0;
  const p1End = Math.round(dsTarget * 0.2 * 10) / 10;
  const p2End = Math.round(dsTarget * 0.8 * 10) / 10;
  const dangerDay = evPerTrade > 0 ? Math.ceil((dsTarget * 0.5) / (evPerTrade * challengeTrades)) : 999;

  /* ─── DRAW FUNCTIONS ─── */
  const drawAdaptation = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const cx = w / 2;
    const cy = h / 2;
    const cycle = f % 360;
    const activeIdx = Math.floor(cycle / 60) % 6;
    const colW = (w - 30) / 2;
    const rowH = (h - 50) / 6;
    // Headers
    ctx.fillStyle = 'rgba(239,68,68,0.6)'; ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('PERSONAL', 15 + colW / 2, 16);
    ctx.fillStyle = 'rgba(34,197,94,0.6)'; ctx.fillText('CHALLENGE', 15 + colW + colW / 2, 16);
    // Arrow in middle
    ctx.fillStyle = 'rgba(245,158,11,0.5)'; ctx.font = 'bold 14px system-ui';
    ctx.fillText('\u2192', cx, 16);
    for (let i = 0; i < 6; i++) {
      const ry = 32 + i * rowH;
      const isActive = i === activeIdx;
      // Row bg
      if (isActive) { ctx.fillStyle = 'rgba(245,158,11,0.05)'; ctx.fillRect(10, ry, w - 20, rowH); }
      // Personal side
      ctx.fillStyle = isActive ? 'rgba(239,68,68,0.7)' : 'rgba(255,255,255,0.2)';
      ctx.font = `${isActive ? 8 : 7}px system-ui`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(adaptations[i].personal, 15 + colW / 2, ry + rowH / 2);
      // Challenge side
      ctx.fillStyle = isActive ? 'rgba(34,197,94,0.8)' : 'rgba(255,255,255,0.2)';
      ctx.fillText(adaptations[i].challenge, 15 + colW + colW / 2, ry + rowH / 2);
      // Icon
      if (isActive) {
        ctx.font = '12px system-ui'; ctx.fillText(adaptations[i].icon, cx, ry + rowH / 2);
      }
    }
    // Active why
    if (activeIdx < 6) {
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '8px system-ui';
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      const why = adaptations[activeIdx].why;
      const maxW = w - 30;
      if (ctx.measureText(why).width > maxW) {
        const words = why.split(' '); let line = ''; const lines: string[] = [];
        for (const word of words) { const t = line + (line ? ' ' : '') + word; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = word; } else { line = t; } }
        if (line) lines.push(line);
        let ly = h - 4 - (lines.length - 1) * 10;
        for (const l of lines) { ctx.fillText(l, cx, ly); ly += 10; }
      } else { ctx.fillText(why, cx, h - 4); }
    }
  }, []);

  const drawPhases = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const cx = w / 2;
    const cy = h / 2;
    const cycle = f % 360;
    const activeIdx = Math.floor(cycle / 120) % 3;
    const chartL = 40; const chartR = w - 20; const chartT = 35; const chartB = h - 40;
    const chartW = chartR - chartL; const chartH = chartB - chartT;
    // Target line
    ctx.setLineDash([4, 4]); ctx.strokeStyle = 'rgba(34,197,94,0.3)'; ctx.lineWidth = 1;
    const targetY = chartT + chartH * 0.1;
    ctx.beginPath(); ctx.moveTo(chartL, targetY); ctx.lineTo(chartR, targetY); ctx.stroke();
    ctx.fillStyle = 'rgba(34,197,94,0.4)'; ctx.font = '7px system-ui';
    ctx.textAlign = 'left'; ctx.textBaseline = 'bottom'; ctx.fillText('+10% TARGET', chartL + 4, targetY - 2);
    ctx.setLineDash([]);
    // Phase zones
    const phaseWidths = [0.17, 0.5, 0.33];
    let phaseX = chartL;
    for (let i = 0; i < 3; i++) {
      const pw = phaseWidths[i] * chartW;
      const isActive = i === activeIdx;
      ctx.fillStyle = isActive ? threePhases[i].color + '18' : 'rgba(255,255,255,0.02)';
      ctx.fillRect(phaseX, chartT, pw, chartH);
      // Phase label
      ctx.fillStyle = isActive ? threePhases[i].color : 'rgba(255,255,255,0.2)';
      ctx.font = `${isActive ? 'bold 9' : '7'}px system-ui`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(threePhases[i].name, phaseX + pw / 2, chartT + 4);
      // Risk label
      if (isActive) {
        ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '8px system-ui';
        ctx.fillText(`Risk: ${threePhases[i].risk} | ${threePhases[i].trades} trades`, phaseX + pw / 2, chartT + 18);
      }
      // Phase boundary
      if (i < 2) {
        ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.setLineDash([2, 2]);
        ctx.beginPath(); ctx.moveTo(phaseX + pw, chartT); ctx.lineTo(phaseX + pw, chartB); ctx.stroke();
        ctx.setLineDash([]);
      }
      phaseX += pw;
    }
    // Equity curve
    const seed = 77; let rng = seed;
    const nextRng = () => { rng = (rng * 16807 + 0) % 2147483647; return rng / 2147483647; };
    ctx.beginPath(); ctx.strokeStyle = '#f59e0baa'; ctx.lineWidth = 2;
    let eq = 0;
    const steps = 44;
    for (let s = 0; s <= steps; s++) {
      const x = chartL + (s / steps) * chartW;
      const y = chartB - (eq / 12) * chartH;
      if (s === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      const phaseIdx = s < 5 ? 0 : s < 30 ? 1 : 2;
      const risk = phaseIdx === 0 ? 0.5 : phaseIdx === 1 ? 0.75 : 0.5;
      const win = nextRng() < 0.58;
      eq += win ? risk * 1.5 : -risk;
    }
    ctx.stroke();
    // Active phase description
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '8px system-ui';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(threePhases[activeIdx].days + ' | Target: ' + threePhases[activeIdx].target, cx, chartB + 6);
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
          <motion.p variants={fadeUp} className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-4">Level 9 &middot; Lesson 5 of 14</motion.p>
          <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold leading-tight mb-4 bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Designing Your Challenge Strategy</motion.h1>
          <motion.p variants={fadeUp} className="text-gray-400 max-w-lg mx-auto text-sm leading-relaxed">Your personal strategy is NOT your challenge strategy. Same system, adapted parameters. The 3-phase approach that maximises pass probability.</motion.p>
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.8 }} className="absolute bottom-8 flex flex-col items-center gap-2 text-gray-600 text-xs">Scroll to begin<motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-amber-500">&#8964;</motion.div></motion.div>
      </section>

      <section className="max-w-2xl mx-auto px-5 py-20"><motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">00 &mdash; Why This Matters</p><h2 className="text-2xl font-extrabold mb-4">Same System, Different Parameters</h2><div className="p-6 rounded-2xl glass-card space-y-4">
        <p className="text-sm text-gray-300 leading-relaxed">Your trading system &mdash; your SMC analysis, your entry triggers, your structure reading &mdash; is your edge. That does not change for a challenge. What changes is <strong className="text-white">every parameter around it</strong>: risk per trade, number of trades, session selection, news handling, and the phased approach to profit accumulation.</p>
        <p className="text-sm text-gray-300 leading-relaxed">Think of it like a race car entering a different track. The engine (your system) stays the same. The suspension, gear ratios, and tyre pressures (your parameters) are tuned for the specific track conditions (the challenge rules).</p>
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-purple-500/10 border border-amber-500/20"><p className="text-xs font-bold text-amber-400 mb-1">&#9889; REAL SCENARIO</p><p className="text-xs text-gray-300">Two traders with identical 58% WR and 1:1.5 R:R. Trader A used their personal strategy unchanged (1% risk, 4 trades/day, all sessions). Failed on Day 11 (daily DD breach). Trader B adapted: 0.75% risk, 1&ndash;2 trades/day, London only, 3-phase approach. <strong className="text-white">Passed on Day 24 at +10.3%.</strong> Same system. Same edge. Different parameters. Different outcome.</p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Adaptation Map</p><h2 className="text-2xl font-extrabold mb-2">6 Parameters That Change</h2><p className="text-gray-400 text-sm mb-4">Personal strategy on the left, challenge adaptation on the right. Watch each parameter shift with the reasoning.</p>
      <div className="rounded-2xl glass-card p-4"><AnimScene drawFn={drawAdaptation} height={320} /></div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The 3-Phase Approach</p><h2 className="text-2xl font-extrabold mb-2">Cautious &rarr; Build &rarr; Protect</h2><p className="text-gray-400 text-sm mb-4">Pre-defined phase transitions with a simulated equity path showing how a disciplined 3-phase challenge unfolds.</p>
      <div className="rounded-2xl glass-card p-4"><AnimScene drawFn={drawPhases} height={300} /></div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; 3-Phase Deep Dive</p><h2 className="text-2xl font-extrabold mb-4">Each Phase in Detail</h2><div className="space-y-3">{threePhases.map((p, i) => (<div key={i}><button onClick={() => toggle(`ph-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold" style={{ color: p.color }}>{p.name} <span className="text-gray-500 font-normal text-xs ml-2">{p.days}</span></span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`ph-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`ph-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05] space-y-1"><p className="text-xs text-gray-400">Risk: {p.risk} | Trades: {p.trades} | Target: {p.target}</p><p className="text-xs text-gray-300 leading-relaxed mt-1">{p.desc}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Approach Comparison</p><h2 className="text-2xl font-extrabold mb-4">Front-Loading vs Steady-State vs Conservative</h2><div className="p-6 rounded-2xl glass-card space-y-3">{frontVsSteady.map((a, i) => (<div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm font-bold" style={{ color: a.color }}>{a.approach}</p><p className="text-xs text-gray-400 mt-1">{a.desc}</p><p className="text-xs text-amber-400/70 mt-1">Best for: {a.bestFor}</p></div>))}</div></motion.div></section>

      {/* S05 — GROUNDBREAKING: Challenge Strategy Designer */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Design Your Challenge Plan</p><h2 className="text-2xl font-extrabold mb-2">&#127919; Challenge Strategy Designer</h2><p className="text-gray-400 text-sm mb-4">Input your PERSONAL stats and challenge rules. The tool generates your adapted challenge plan with 3-phase progression.</p>
      <div className="p-6 rounded-2xl glass-card space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div><p className="text-[10px] text-amber-400 font-bold mb-1">Your WR (%)</p><input type="number" value={dsWR} onChange={e => { setDsWR(Math.max(40, Math.min(80, Number(e.target.value)))); setDsResult(false); }} className={inputCls} /></div>
          <div><p className="text-[10px] text-amber-400 font-bold mb-1">Your R:R</p><input type="number" value={dsRR} onChange={e => { setDsRR(Math.max(0.5, Math.min(5, Number(e.target.value)))); setDsResult(false); }} step={0.1} className={inputCls} /></div>
          <div><p className="text-[10px] text-amber-400 font-bold mb-1">Personal Risk (%)</p><input type="number" value={dsRisk} onChange={e => { setDsRisk(Math.max(0.25, Math.min(3, Number(e.target.value)))); setDsResult(false); }} step={0.25} className={inputCls} /></div>
          <div><p className="text-[10px] text-amber-400 font-bold mb-1">Personal Trades/Day</p><input type="number" value={dsTrades} onChange={e => { setDsTrades(Math.max(1, Math.min(10, Number(e.target.value)))); setDsResult(false); }} className={inputCls} /></div>
          <div><p className="text-[10px] text-amber-400 font-bold mb-1">Profit Target (%)</p><input type="number" value={dsTarget} onChange={e => { setDsTarget(Math.max(4, Math.min(15, Number(e.target.value)))); setDsResult(false); }} className={inputCls} /></div>
          <div><p className="text-[10px] text-amber-400 font-bold mb-1">Time Limit (days)</p><input type="number" value={dsDays} onChange={e => { setDsDays(Math.max(10, Math.min(90, Number(e.target.value)))); setDsResult(false); }} className={inputCls} /></div>
        </div>
        <button onClick={() => setDsResult(true)} className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-sm font-bold text-white active:scale-95 transition-transform">Generate Challenge Plan &rarr;</button>
        {dsResult && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 pt-2">
          {/* Adapted params */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20"><p className="text-xs font-bold text-amber-400 mb-2">ADAPTED CHALLENGE PARAMETERS</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center"><p className="text-[10px] text-gray-500">Risk/Trade</p><p className="text-sm font-bold text-white">{dsRisk}% &rarr; {challengeRisk}%</p></div>
              <div className="text-center"><p className="text-[10px] text-gray-500">Trades/Day</p><p className="text-sm font-bold text-white">{dsTrades} &rarr; {challengeTrades}</p></div>
              <div className="text-center"><p className="text-[10px] text-gray-500">EV/Trade</p><p className="text-sm font-bold" style={{ color: evPerTrade > 0 ? '#22c55e' : '#ef4444' }}>+{evPerTrade.toFixed(3)}%</p></div>
              <div className="text-center"><p className="text-[10px] text-gray-500">Trades Needed</p><p className="text-sm font-bold text-white">~{tradesNeeded}</p></div>
            </div>
          </div>
          {/* 3-phase plan */}
          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20"><p className="text-xs font-bold text-blue-400">PHASE 1: CAUTIOUS (Days 1&ndash;5)</p><p className="text-xs text-gray-300">Risk {Math.round(challengeRisk * 0.7 * 100) / 100}% | 1 trade/day | Target: +{p1End}%</p></div>
            <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/20"><p className="text-xs font-bold text-green-400">PHASE 2: BUILD (Days 6&ndash;{Math.round(dsDays * 0.7)})</p><p className="text-xs text-gray-300">Risk {challengeRisk}% | {challengeTrades} trades/day | Target: +{p2End}%</p></div>
            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20"><p className="text-xs font-bold text-amber-400">PHASE 3: PROTECT (Days {Math.round(dsDays * 0.7) + 1}&ndash;{dsDays})</p><p className="text-xs text-gray-300">Risk {Math.round(challengeRisk * 0.7 * 100) / 100}% | 1 trade/day | Grind: +{p2End}% &rarr; +{dsTarget}%</p></div>
          </div>
          {/* Feasibility */}
          <div className="p-3 rounded-xl" style={{ background: tradeBuffer >= 15 ? 'rgba(34,197,94,0.05)' : tradeBuffer >= 0 ? 'rgba(245,158,11,0.05)' : 'rgba(239,68,68,0.05)', border: `1px solid ${tradeBuffer >= 15 ? 'rgba(34,197,94,0.2)' : tradeBuffer >= 0 ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
            <p className="text-xs font-bold" style={{ color: tradeBuffer >= 15 ? '#22c55e' : tradeBuffer >= 0 ? '#f59e0b' : '#ef4444' }}>FEASIBILITY CHECK</p>
            <p className="text-xs text-gray-300 mt-1">Trading days: ~{tradingDays} | Trades available: ~{tradesAvailable} | Trades needed: ~{tradesNeeded}</p>
            <p className="text-xs mt-1" style={{ color: tradeBuffer >= 15 ? '#22c55e' : tradeBuffer >= 0 ? '#f59e0b' : '#ef4444' }}>{tradeBuffer >= 15 ? `\u2705 Comfortable: ${tradeBuffer}% trade buffer. The maths works well.` : tradeBuffer >= 0 ? `\u26A0\uFE0F Tight: only ${tradeBuffer}% buffer. Consider increasing risk by 0.1% or adding 1 trade/day.` : `\u274C Not feasible at these parameters. Increase risk or trades/day, or choose a firm with more time.`}</p>
            {dangerDay < tradingDays && (<p className="text-xs text-gray-500 mt-1">Danger day: if below +{(dsTarget * 0.5).toFixed(1)}% by Day {dangerDay}, re-evaluate pace (but do NOT increase risk impulsively).</p>)}
          </div>
        </motion.div>)}
      </div></motion.div></section>

      {/* S06 — Quality Filters */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Quality Filters</p><h2 className="text-2xl font-extrabold mb-4">4 Filters That Boost Your Win Rate</h2><div className="space-y-3">{qualityFilters.map((qf, i) => (<div key={i}><button onClick={() => toggle(`qf-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{qf.filter}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`qf-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`qf-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05] space-y-1"><p className="text-xs text-red-400">Personal: {qf.personal}</p><p className="text-xs text-green-400">Challenge: {qf.challenge}</p><p className="text-xs text-gray-400 mt-1">Impact: {qf.impact}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      {/* S07 — Pre-Challenge Checklist */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Before You Start</p><h2 className="text-2xl font-extrabold mb-4">Pre-Challenge Strategy Checklist</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#22c55e]">RISK DEFINED</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Challenge risk per trade written down. Phase transitions defined (Cautious/Build/Protect triggers). No mid-challenge risk decisions.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#3b82f6]">SESSIONS SELECTED</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Best 1&ndash;2 sessions identified from journal data. Other sessions eliminated. No "I will just take a quick look at Asia" exceptions.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#f59e0b]">DAILY STOP DEFINED</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Maximum daily loss written down (typically 60&ndash;70% of daily DD limit). If hit, close everything and stop for the day. No exceptions.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#a855f7]">NEWS PLAN READY</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Calendar checked for the full challenge duration. High-impact events marked. Default rule: flatten before Tier 1, reduce before Tier 2.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">WRITTEN DOWN</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">The entire plan: risk per phase, session times, setup criteria, daily stop, news rules, and phase transition triggers. Printed and pinned next to your screen.</span></p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p><h2 className="text-2xl font-extrabold mb-4">4 Strategy Design Errors</h2><div className="space-y-3">{commonMistakes.map((item, i) => (<div key={i}><button onClick={() => toggle(`cm-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`cm-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`cm-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-xs text-red-400 mb-2">&#10060; {item.mistake}</p><p className="text-xs text-green-400">&#10004; {item.fix}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Cheat Sheet</p><h2 className="text-2xl font-extrabold mb-4">Strategy Design Quick Reference</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#22c55e]">SAME SYSTEM, NEW PARAMS</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Keep your proven SMC edge. Adapt: risk (halve it), trades (reduce to 1&ndash;2), sessions (best only), news (flatten), and phase your approach.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#3b82f6]">3-PHASE PLAN</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Cautious (Days 1&ndash;5, prove consistency) &rarr; Build (Days 6&ndash;20, accumulate) &rarr; Protect (80%+ of target, slow grind to finish).</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">A+ SETUPS ONLY</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">The trades you skip during a challenge are more important than the trades you take. B-grade trades cost DD for minimal EV.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#f59e0b]">BEST SESSION ONLY</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Find your highest-WR session from your journal. Trade only that session. The "lost opportunity" from skipping weak sessions is actually gained DD buffer.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">THE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Write the FULL plan before the challenge starts. Print it. Pin it. Follow it without deviation. Mid-challenge decisions are emotional decisions.</span></p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Test Your Understanding</p><h2 className="text-2xl font-extrabold mb-2">Strategy Design Game</h2><p className="text-gray-400 text-sm mb-6">5 scenario-based rounds. Adapt strategies, filter trades, manage phases, and design challenge plans.</p>
      <div className="p-6 rounded-2xl glass-card"><div className="flex items-center justify-between mb-4"><span className="text-xs font-bold text-amber-400">Round {gameRound + 1} of {gameRounds.length}</span><span className="text-xs font-mono text-gray-500">{gameScore}/{gameRounds.length} correct</span></div><p className="text-sm text-gray-300 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: gameRounds[gameRound].scenario }} /><div className="space-y-2">{gameRounds[gameRound].options.map((opt, oi) => { const answered = gameAnswers[gameRound] !== null; const selected = gameAnswers[gameRound] === oi; const isCorrect = opt.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return (<div key={oi}><button onClick={() => handleGameAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt.text }} /></button>{answered && selected && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]"><p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`} dangerouslySetInnerHTML={{ __html: opt.explain }} /></motion.div>)}</div>); })}</div>{gameAnswers[gameRound] !== null && gameRound < gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5"><button onClick={() => setGameRound(r => r + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button></motion.div>)}{gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Outstanding \u2014 you can design a challenge strategy like a prop trading professional.' : gameScore >= 3 ? 'Good \u2014 review the session filtering and phase transition scenarios to refine your approach.' : 'Re-read the adaptation map and 3-phase sections. Strategy design is the foundation of challenge success.'}</p></motion.div>)}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Knowledge Check</p><h2 className="text-2xl font-extrabold mb-6">Final Quiz &mdash; 8 Questions</h2>
      <div className="space-y-6">{quizQuestions.map((q, qi) => (<div key={qi} className="p-5 rounded-2xl glass-card"><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p><p className="text-sm font-semibold text-white mb-4">{q.q}</p><div className="space-y-2">{q.opts.map((opt, oi) => { const answered = quizAnswers[qi] !== null; const selected = quizAnswers[qi] === oi; const isCorrect = oi === q.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return <button key={oi} onClick={() => handleQuizAnswer(qi, oi)} disabled={answered} className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`}>{opt}</button>; })}</div>{quizAnswers[qi] !== null && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg bg-white/[0.02]"><p className="text-xs text-amber-400" dangerouslySetInnerHTML={{ __html: `<span class="font-bold">&#9989;</span> ${q.explain}` }} /></motion.div>)}</div>))}</div>
      {quizDone && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center"><p className="text-3xl font-extrabold mb-2">{quizScoreVal}%</p><p className="text-sm text-gray-400">{quizScoreVal >= 66 ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate. Review and try again.'}</p></motion.div>)}
      {certUnlocked && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10"><div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}><div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(139,92,246,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} /><div className="relative z-10 text-center"><div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">&#9881;&#65039;</div><p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p><p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 9: Designing Your Challenge Strategy</strong><br />at ATLAS Academy by Interakktive</p><p className="bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Strategy Adapter &mdash;</p><p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L9.5-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p></div></div></motion.div>)}</motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-20 text-center"><Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">&larr; Back to Academy</Link></section>
    </div>
  );
}
