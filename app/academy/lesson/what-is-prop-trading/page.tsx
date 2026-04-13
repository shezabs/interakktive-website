// app/academy/lesson/what-is-prop-trading/page.tsx
// ATLAS Academy — Lesson 9.1: What Is Prop Trading? [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 9
// GROUNDBREAKING: Prop Trading ROI Calculator — capital multiplier across funded tiers
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
const pipelineStages = [
  { label: 'Your Skill', desc: 'Levels 1-8 complete', emoji: '🧠', color: '#8b5cf6' },
  { label: 'Challenge Fee', desc: '\u00A3100-\u00A3500 one-time', emoji: '💳', color: '#f59e0b' },
  { label: 'Evaluation', desc: '2-phase test', emoji: '📋', color: '#3b82f6' },
  { label: 'Funded Account', desc: '\u00A325K-\u00A3200K capital', emoji: '🏦', color: '#22c55e' },
  { label: 'Profit Split', desc: 'You keep 70-90%', emoji: '💰', color: '#eab308' },
  { label: 'Your Income', desc: 'Skill \u00D7 Capital', emoji: '🚀', color: '#ec4899' },
];

const whoItsFor = [
  { title: 'Disciplined Traders With a Proven Edge', desc: 'You have a strategy that works on demo or a small account. You have the data to prove it: positive expectancy, consistent execution, controlled drawdowns. You just lack the capital to make it meaningful.', verdict: 'PERFECT FIT', color: '#22c55e' },
  { title: 'Traders Who Respect Rules', desc: 'Prop firms have strict rules: daily drawdown limits, overall drawdown limits, sometimes time limits. If you can follow your own trading plan, you can follow theirs. If you regularly break your own rules, prop will punish you faster.', verdict: 'GOOD FIT', color: '#22c55e' },
  { title: 'Capital-Limited But Skilled', desc: 'You can make 3-5% monthly but your account is \u00A3500. That is \u00A315-\u00A325/month. The same skill on a \u00A3100K funded account = \u00A32,400-\u00A34,000/month after split. The skill is the same. The outcome is transformative.', verdict: 'IDEAL CANDIDATE', color: '#f59e0b' },
];

const whoItsNotFor = [
  { title: 'Beginners Looking to Skip the Learning Curve', desc: 'Prop firms are not a shortcut to profitability. They amplify whatever you already are. If you are a losing trader, prop amplifies your losses and you lose the challenge fee too.', verdict: 'NOT READY', color: '#ef4444' },
  { title: 'Gamblers Who Think Funded Means Free', desc: '"I will just take big risks because it is not my money." This mindset guarantees failure. Daily drawdown limits mean one bad trade can end your funded account permanently.', verdict: 'WILL FAIL', color: '#ef4444' },
  { title: 'Traders Who Cannot Handle External Rules', desc: 'If you regularly move your stop loss, over-leverage, or revenge trade on your personal account, prop firm rules will terminate your account within days. Fix the discipline first.', verdict: 'FIX FIRST', color: '#f97316' },
];

const commonMistakes = [
  { title: 'Treating Prop as a Shortcut', mistake: '"I will skip demo trading and go straight to a funded account because I can trade with more capital." Prop firms are the final step, not the first. Levels 1-8 exist for a reason.', fix: 'Complete your education first. Trade demo until profitable for 3+ months. THEN use prop to scale what already works.' },
  { title: 'Ignoring the Business Model', mistake: '"The firm wants me to succeed so they make money from my profits." Actually, most firms make MORE money from failed challenge fees than successful trader payouts. Understanding this changes your approach.', fix: 'Accept that the firm profits whether you pass or fail. Your job is to be in the profitable 10-15%, not to feel grateful for the "opportunity."' },
  { title: 'Choosing Based on Price Alone', mistake: '"This firm is cheapest so I will go there." The cheapest challenge often has the strictest rules (tighter drawdown, shorter time). You end up paying less upfront but failing more often, spending MORE total.', fix: 'Choose based on rule compatibility with YOUR strategy, not price. A \u00A3300 challenge you pass is cheaper than three \u00A3150 challenges you fail.' },
  { title: 'Thinking One Funded Account = Financial Freedom', mistake: '"Once I pass my challenge, I am set." One funded account at \u00A350K with 4% monthly at 80/20 split = \u00A31,600/month. Before tax. That is a starting point, not a destination.', fix: 'Think in terms of SCALING: multiple accounts, multiple firms, growing account sizes. One account is the proof of concept. The business comes from scaling it.' },
];

const gameRounds = [
  { scenario: '<strong>Your friend says:</strong> "I have been trading for 2 weeks and I am going to buy a \u00A3200K prop firm challenge. If I can make 10% on their money, that is \u00A320,000 in my first month!" What is wrong with this plan?', options: [
    { text: 'Nothing wrong \u2014 prop firms let anyone trade their capital, so why not start big?', correct: false, explain: '2 weeks of experience is nowhere near enough. The challenge has strict drawdown rules that will catch undisciplined traders immediately. The \u00A3200K size amplifies mistakes, not just gains.' },
    { text: 'The friend needs more experience first, should start with a smaller account size, and is dramatically overestimating realistic monthly returns', correct: true, explain: 'Three problems: (1) 2 weeks is not enough skill development, (2) starting at \u00A3200K maximises both challenge cost and psychological pressure, and (3) 10% monthly is aggressive even for experienced traders. Realistic is 3-5% on a \u00A325K-\u00A350K account after months of proven consistency.' },
    { text: 'They should just trade their own money instead of prop', correct: false, explain: 'Prop trading is a valid path, just not at 2 weeks experience with a \u00A3200K account. The concept is sound, the timing and sizing are wrong.' },
  ]},
  { scenario: '<strong>Capital comparison:</strong> You make 4% per month consistently. Your personal account has \u00A31,000. A funded account would be \u00A3100,000 with an 80/20 payout split. How much more would you earn monthly from the funded account compared to your personal account?', options: [
    { text: '\u00A340 personal vs \u00A34,000 funded = 100x more', correct: false, explain: 'Close, but you forgot the payout split. The funded account earns \u00A34,000 gross, but you keep 80% = \u00A33,200. Still 80x more than your personal \u00A340.' },
    { text: '\u00A340 personal vs \u00A33,200 funded (after 80/20 split) = 80x more from the same skill', correct: true, explain: 'Exactly. \u00A31,000 \u00D7 4% = \u00A340 personal. \u00A3100,000 \u00D7 4% = \u00A34,000 gross \u00D7 80% = \u00A33,200 take-home. Same strategy, same edge, same 4%. The only difference is capital. That is the prop multiplier.' },
    { text: '\u00A340 personal vs \u00A3800 funded = 20x more', correct: false, explain: 'You calculated the split wrong. 4% of \u00A3100K = \u00A34,000, not \u00A31,000. Your 80% share is \u00A33,200.' },
  ]},
  { scenario: '<strong>Decision time:</strong> You have been profitable on demo for 4 months with a 58% win rate and 1:1.8 R:R. Your personal account is \u00A3750. You are considering a \u00A350K prop challenge that costs \u00A3250. Is this the right move?', options: [
    { text: 'No \u2014 you should save more personal capital first and trade a larger personal account', correct: false, explain: 'At \u00A3750, even saving aggressively, it would take years to reach meaningful capital. Meanwhile your 4% monthly edge is generating just \u00A330/month. The opportunity cost of NOT scaling via prop is significant.' },
    { text: 'Yes \u2014 4 months of consistent profitability + positive expectancy + controlled risk means you are ready for a prop evaluation', correct: true, explain: 'This is the ideal prop candidate: proven edge (58% WR + 1:1.8 R:R = positive expectancy), consistent track record (4 months), and capital-limited (\u00A3750 personal). The \u00A3250 challenge fee is an investment in accessing \u00A350K of capital. If you pass and make 4%/month, the fee pays for itself in the first payout.' },
    { text: 'Yes, but start with a \u00A3200K challenge to maximise the opportunity', correct: false, explain: 'Right idea, wrong sizing. \u00A3200K challenges cost more, have more psychological pressure, and the same drawdown percentages mean larger absolute losses. Start at \u00A350K, prove it works with prop rules, THEN scale up.' },
  ]},
  { scenario: '<strong>Understanding the model:</strong> A prop firm charges \u00A3300 per challenge. Their pass rate is 12%. For every 100 traders who buy the challenge, how much does the firm collect in fees, and roughly how many traders will they actually need to pay profits to?', options: [
    { text: '\u00A330,000 in fees, about 12 traders funded, most of whom will eventually lose the account anyway', correct: true, explain: 'Correct. 100 traders \u00D7 \u00A3300 = \u00A330,000 in challenge fees. ~12 pass and get funded. Of those 12, historically only 3-5 remain profitable after 6 months. The firm collects \u00A330,000 upfront and pays out profits to perhaps 3-5 long-term survivors. This is why the model works. Your job is to be in that 3-5%.' },
    { text: '\u00A330,000 in fees, but the firm loses money because they have to fund 12 accounts', correct: false, explain: 'The firm is not "funding" with real capital at risk in most cases. Many firms use simulated or hedged accounts. The \u00A330,000 in fees is largely profit, and the payouts to the ~3-5 long-term profitable traders are a manageable cost of business.' },
    { text: '\u00A33,000 in fees from the 12 who pass, the 88 who fail pay nothing', correct: false, explain: 'Everyone pays the challenge fee upfront whether they pass or fail. 100 traders \u00D7 \u00A3300 = \u00A330,000 total. The 88 who fail lose their fee. The 12 who pass paid the same fee AND get funded.' },
  ]},
  { scenario: '<strong>The pitch:</strong> An Instagram ad says: "Get funded with \u00A3500K and make \u00A350,000 a month! No experience needed! Start today!" What should your response be?', options: [
    { text: 'Sounds exciting \u2014 the capital multiplier means even small returns on \u00A3500K would be huge', correct: false, explain: 'The maths is technically correct but the framing is predatory. "No experience needed" is the red flag. \u00A3500K accounts have extreme psychological pressure, the drawdown limits mean tiny mistakes are fatal, and the target audience (inexperienced traders) will almost certainly fail and lose their challenge fee.' },
    { text: 'Red flags everywhere: "no experience needed" is predatory, \u00A3500K starting size is reckless for beginners, and \u00A350K/month assumes 10% returns which is unrealistic for most traders', correct: true, explain: 'All three red flags identified. (1) Experience is absolutely needed \u2014 the firm profits from failures, so targeting beginners is profitable for THEM. (2) \u00A3500K magnifies every mistake. (3) 10% monthly is elite-level performance. Realistic expectations on a \u00A3100K account at 3-4% = \u00A32,400-\u00A33,200/month after split. Not glamorous, but real.' },
    { text: 'It is probably a scam \u2014 no real prop firm advertises like this', correct: false, explain: 'Actually, many legitimate prop firms DO advertise aggressively. The firm itself might be real. The problem is not the firm, it is the framing: targeting beginners with unrealistic expectations guarantees they fail and the firm profits from fees.' },
  ]},
];

const quizQuestions = [
  { q: 'What is a prop (proprietary trading) firm?', opts: ['A broker that gives you free leverage', 'A company that provides capital for you to trade in exchange for a share of profits', 'A hedge fund that manages your personal savings', 'An app that automates your trading strategy'], correct: 1, explain: 'A prop firm provides their capital for you to trade. You pay an evaluation fee, prove you can trade consistently within their rules, and if funded, you keep 70-90% of profits. You never risk your own capital on trades \u2014 you risk theirs.' },
  { q: 'Why do most prop firms make money even when traders pass the challenge?', opts: ['They charge hidden monthly fees to funded traders', 'The 85-90% failure rate on challenges generates more fee revenue than they pay out to the 10-15% who pass', 'They trade against their own funded traders', 'Funded traders must pay back the challenge fee from profits'], correct: 1, explain: 'With an 85-90% failure rate, the volume of challenge fees vastly exceeds payouts to successful traders. 100 traders paying \u00A3300 = \u00A330,000. Even if 12 pass and earn \u00A32,000/month each, the maths still favours the firm.' },
  { q: 'What is the "capital multiplier effect" of prop trading?', opts: ['Prop firms give you leverage beyond normal broker limits', 'The same trading skill generates dramatically more income when applied to larger capital', 'Your personal account grows faster when you also have a funded account', 'Prop firms multiply your deposits with bonus capital'], correct: 1, explain: 'A trader making 4% monthly earns \u00A340 on a \u00A31,000 personal account but \u00A33,200 on a \u00A3100K funded account (after 80/20 split). The skill is identical. The capital multiplier is what makes prop trading transformative.' },
  { q: 'Which trader is the BEST candidate for prop trading?', opts: ['A beginner who wants to learn with more capital', 'Someone profitable for 4+ months with documented positive expectancy but limited personal capital', 'A trader who makes 20% monthly but cannot follow risk management rules', 'Anyone who can afford the challenge fee'], correct: 1, explain: 'The ideal candidate has: (1) proven consistency (4+ months), (2) positive expectancy (documented WR + R:R), (3) discipline with rules, and (4) limited personal capital to scale with. Missing any of these \u2014 especially discipline \u2014 and prop will amplify the problem, not solve it.' },
  { q: 'What is the typical payout split at a prop firm?', opts: ['50/50 \u2014 you and the firm split equally', '70-90% to the trader, 10-30% to the firm', '100% to the trader after the challenge fee', '60% to the firm, 40% to the trader'], correct: 1, explain: 'Most prop firms offer 70/30 to 90/10 splits in the trader\u2019s favour. Some firms start at 80/20 and scale to 90/10 as you prove consistency. The firm takes a minority share because their risk is managed through strict drawdown rules.' },
  { q: 'Why should you NOT start with the largest available account size?', opts: ['Larger accounts have different trading rules', 'Higher challenge cost, more psychological pressure, and the same percentage drawdown means larger absolute losses', 'Larger accounts have worse payout splits', 'The firm monitors larger accounts more closely'], correct: 1, explain: 'A 5% daily drawdown on \u00A350K = \u00A32,500 cushion. On \u00A3200K = \u00A310,000 cushion. The PERCENTAGE is the same but the psychological weight of watching \u00A310,000 disappear is dramatically different. Start smaller, prove the process, then scale.' },
  { q: 'How long should you be consistently profitable before attempting a prop challenge?', opts: ['1-2 weeks is enough if you feel confident', 'At least 3-4 months of documented profitable trading', 'At least 1 year of live trading experience', 'It does not matter \u2014 the challenge itself is the test'], correct: 1, explain: '3-4 months gives you enough data to confirm your edge is real (not a lucky streak) and enough experience to handle the psychological pressure of evaluation. Shorter than 3 months and your sample size is too small. Longer is better but 3-4 months is the minimum.' },
  { q: 'What is the single most important thing to understand about the prop firm business model?', opts: ['Firms want you to succeed so they earn from your profit split', 'The firm makes money whether you pass or fail \u2014 your job is to be in the profitable minority', 'Prop firms are charities that help undercapitalised traders', 'The challenge fee is refunded when you pass'], correct: 1, explain: 'Firms profit from challenge fees (majority of revenue) AND from profit splits (minority). Understanding this removes the emotional "they believe in me" narrative and replaces it with clear-eyed business thinking: you are paying for ACCESS to capital, and your job is to make that investment profitable.' },
];

export default function WhatIsPropTrading() {
  const [scrollY, setScrollY] = useState(0);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [gameRound, setGameRound] = useState(0);
  const [gameAnswers, setGameAnswers] = useState<(number | null)[]>(Array(gameRounds.length).fill(null));
  const [gameScore, setGameScore] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(Array(quizQuestions.length).fill(null));
  const [showConfetti, setShowConfetti] = useState(false);
  const [certUnlocked, setCertUnlocked] = useState(false);
  /* ROI Calculator state */
  const [personalBalance, setPersonalBalance] = useState(1000);
  const [monthlyReturn, setMonthlyReturn] = useState(4);
  const [selectedSplit, setSelectedSplit] = useState(80);

  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);
  const toggle = (id: string) => setOpenSections(s => ({ ...s, [id]: !s[id] }));

  const handleGameAnswer = (oi: number) => { if (gameAnswers[gameRound] !== null) return; const a = [...gameAnswers]; a[gameRound] = oi; setGameAnswers(a); if (gameRounds[gameRound].options[oi].correct) setGameScore(s => s + 1); };
  const handleQuizAnswer = (qi: number, oi: number) => { if (quizAnswers[qi] !== null) return; const a = [...quizAnswers]; a[qi] = oi; setQuizAnswers(a); };

  const quizDone = quizAnswers.every(a => a !== null);
  const quizScoreVal = quizDone ? Math.round(quizAnswers.reduce<number>((s, a, i) => s + (a === quizQuestions[i].correct ? 1 : 0), 0) / quizQuestions.length * 100) : 0;
  useEffect(() => { if (quizDone && quizScoreVal >= 66 && !certUnlocked) { setCertUnlocked(true); setShowConfetti(true); const t = setTimeout(() => setShowConfetti(false), 4000); return () => clearTimeout(t); } }, [quizDone, quizScoreVal, certUnlocked]);

  /* ─── ROI Calculator ─── */
  const fundedTiers = [25000, 50000, 100000, 200000];
  const challengeFees: Record<number, number> = { 25000: 150, 50000: 250, 100000: 400, 200000: 650 };
  const personalIncome = personalBalance * (monthlyReturn / 100);

  /* ─── DRAW FUNCTIONS ─── */
  const drawPipeline = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const cx = w / 2;
    const cy = h / 2;
    const cycle = f % 360;
    const activeIdx = Math.floor(cycle / 60) % 6;
    const stepW = (w - 60) / 6;
    // Draw connectors
    for (let i = 0; i < 5; i++) {
      const x1 = 30 + stepW * i + stepW / 2 + 18;
      const x2 = 30 + stepW * (i + 1) + stepW / 2 - 18;
      const isPast = i < activeIdx;
      ctx.beginPath(); ctx.moveTo(x1, cy); ctx.lineTo(x2, cy);
      ctx.strokeStyle = isPast ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 2; ctx.setLineDash(isPast ? [] : [4, 4]); ctx.stroke(); ctx.setLineDash([]);
      // Arrow
      if (isPast) {
        const mx = (x1 + x2) / 2;
        ctx.beginPath(); ctx.moveTo(mx - 4, cy - 4); ctx.lineTo(mx + 4, cy); ctx.lineTo(mx - 4, cy + 4);
        ctx.fillStyle = 'rgba(245,158,11,0.5)'; ctx.fill();
      }
    }
    // Draw stage nodes
    for (let i = 0; i < 6; i++) {
      const sx = 30 + stepW * i + stepW / 2;
      const isActive = i === activeIdx;
      const isPast = i < activeIdx;
      // Circle
      ctx.beginPath(); ctx.arc(sx, cy, isActive ? 20 : 15, 0, Math.PI * 2);
      ctx.fillStyle = isActive ? pipelineStages[i].color + '33' : isPast ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.04)';
      ctx.fill();
      ctx.strokeStyle = isActive ? pipelineStages[i].color : isPast ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.1)';
      ctx.lineWidth = isActive ? 2 : 1; ctx.stroke();
      // Label below
      ctx.fillStyle = isActive ? '#fff' : 'rgba(255,255,255,0.4)';
      ctx.font = `${isActive ? 'bold ' : ''}${isActive ? 9 : 8}px system-ui`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(pipelineStages[i].label, sx, cy + (isActive ? 26 : 20));
      // Emoji inside
      ctx.font = `${isActive ? 16 : 12}px system-ui`;
      ctx.textBaseline = 'middle'; ctx.fillText(pipelineStages[i].emoji, sx, cy);
    }
    // Active description
    ctx.fillStyle = pipelineStages[activeIdx].color; ctx.font = '10px system-ui';
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText(pipelineStages[activeIdx].desc, cx, h - 8);
  }, []);

  const drawMultiplier = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const cx = w / 2;
    const cy = h / 2;
    const cycle = f % 240;
    const activeIdx = Math.floor(cycle / 60) % 4;
    const tiers = [
      { label: '\u00A31K Personal', amount: 40, color: '#6b7280' },
      { label: '\u00A350K Funded', amount: 1600, color: '#3b82f6' },
      { label: '\u00A3100K Funded', amount: 3200, color: '#8b5cf6' },
      { label: '\u00A3200K Funded', amount: 6400, color: '#22c55e' },
    ];
    const maxAmt = 6400;
    const barW = (w - 100) / 4;
    const barMaxH = h - 90;
    const baseY = h - 40;
    for (let i = 0; i < 4; i++) {
      const bx = 40 + barW * i + barW / 2;
      const isActive = i === activeIdx;
      const targetH = (tiers[i].amount / maxAmt) * barMaxH;
      const barH = i <= activeIdx ? targetH : Math.max(targetH * 0.3, 4);
      // Bar
      ctx.fillStyle = isActive ? tiers[i].color + 'cc' : tiers[i].color + '44';
      const r = 4;
      const bLeft = bx - barW * 0.3;
      const bWidth = barW * 0.6;
      const bTop = baseY - barH;
      ctx.beginPath();
      ctx.moveTo(bLeft + r, bTop); ctx.lineTo(bLeft + bWidth - r, bTop);
      ctx.quadraticCurveTo(bLeft + bWidth, bTop, bLeft + bWidth, bTop + r);
      ctx.lineTo(bLeft + bWidth, baseY); ctx.lineTo(bLeft, baseY);
      ctx.lineTo(bLeft, bTop + r);
      ctx.quadraticCurveTo(bLeft, bTop, bLeft + r, bTop);
      ctx.fill();
      // Amount label
      ctx.fillStyle = isActive ? '#fff' : 'rgba(255,255,255,0.4)';
      ctx.font = `${isActive ? 'bold 11' : '9'}px system-ui`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText(`\u00A3${tiers[i].amount.toLocaleString()}/mo`, bx, bTop - 4);
      // Tier label
      ctx.fillStyle = isActive ? tiers[i].color : 'rgba(255,255,255,0.35)';
      ctx.font = `${isActive ? 'bold ' : ''}8px system-ui`;
      ctx.textBaseline = 'top'; ctx.fillText(tiers[i].label, bx, baseY + 4);
      // Multiplier badge
      if (isActive && i > 0) {
        const mult = Math.round(tiers[i].amount / tiers[0].amount);
        ctx.fillStyle = tiers[i].color; ctx.font = 'bold 10px system-ui';
        ctx.textBaseline = 'bottom'; ctx.fillText(`${mult}x`, bx, bTop - 18);
      }
    }
    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '9px system-ui';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('Same 4% monthly return \u2014 different capital = different life', cx, 6);
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
          <motion.p variants={fadeUp} className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-4">Level 9 &middot; Lesson 1 of 14</motion.p>
          <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold leading-tight mb-4 bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>What Is Prop Trading?</motion.h1>
          <motion.p variants={fadeUp} className="text-gray-400 max-w-lg mx-auto text-sm leading-relaxed">The bridge between trading skill and trading income. How funded accounts turn your proven edge into real capital.</motion.p>
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.8 }} className="absolute bottom-8 flex flex-col items-center gap-2 text-gray-600 text-xs">Scroll to begin<motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-amber-500">&#8964;</motion.div></motion.div>
      </section>

      {/* S00 */}
      <section className="max-w-2xl mx-auto px-5 py-20"><motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">00 &mdash; Why This Matters</p><h2 className="text-2xl font-extrabold mb-4">The Problem Every Skilled Trader Faces</h2><div className="p-6 rounded-2xl glass-card space-y-4">
        <p className="text-sm text-gray-300 leading-relaxed">You have spent 8 levels learning to trade. You understand Smart Money Concepts, you have a strategy, you manage risk, you check the macro calendar, you follow your rules. You are a competent trader.</p>
        <p className="text-sm text-gray-300 leading-relaxed">But your account has &pound;500 in it. At 4% monthly, that is &pound;20. You could trade perfectly for a year and earn &pound;240. That does not change your life. That does not even cover your TradingView subscription.</p>
        <p className="text-sm text-gray-300 leading-relaxed"><strong className="text-white">Prop trading solves this problem.</strong> A prop firm gives you &pound;50,000&ndash;&pound;200,000 of their capital to trade. You keep 70&ndash;90% of the profits. Same skill, same strategy, same 4% &mdash; but now that is &pound;1,600&ndash;&pound;6,400 per month instead of &pound;20.</p>
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-purple-500/10 border border-amber-500/20"><p className="text-xs font-bold text-amber-400 mb-1">&#9889; REAL SCENARIO</p><p className="text-xs text-gray-300">A trader with a consistent 4% monthly return on a &pound;1,000 personal account earns &pound;480/year. The same trader, same edge, on a &pound;100K funded account at an 80/20 split earns <strong className="text-white">&pound;38,400/year</strong>. The skill did not change. The capital did. Prop trading is the multiplier between &quot;I can trade&quot; and &quot;I earn from trading.&quot;</p></div>
      </div></motion.div></section>

      {/* S01 — Canvas 1: Pipeline */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Prop Trading Pipeline</p><h2 className="text-2xl font-extrabold mb-2">From Skill to Income in 6 Steps</h2><p className="text-gray-400 text-sm mb-4">Your trading skill, a challenge fee, a 2-phase evaluation, a funded account, a profit split, your income. That is the entire pipeline.</p>
      <div className="rounded-2xl glass-card p-4"><AnimScene drawFn={drawPipeline} height={200} /></div></motion.div></section>

      {/* S02 — Canvas 2: Capital Multiplier */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Capital Multiplier</p><h2 className="text-2xl font-extrabold mb-2">Same Skill, Different Life</h2><p className="text-gray-400 text-sm mb-4">4% monthly on &pound;1,000 = &pound;40. The same 4% on &pound;200K funded = &pound;6,400 after split. Watch the multiplier in action.</p>
      <div className="rounded-2xl glass-card p-4"><AnimScene drawFn={drawMultiplier} height={280} /></div></motion.div></section>

      {/* S03 — What Is a Prop Firm */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; Understanding Prop Firms</p><h2 className="text-2xl font-extrabold mb-4">The Complete Picture</h2><div className="space-y-3">
        {[
          { title: 'What a Prop Firm Actually Is', content: 'A proprietary trading firm provides you with their capital to trade. You pay a one-time evaluation fee (\u00A3100-\u00A3500), pass a trading challenge that proves consistency and risk management, and receive a funded account (\u00A325K-\u00A3200K+). You keep 70-90% of profits. You never risk your own money on trades \u2014 you risk theirs.' },
          { title: 'Brief History: From Wall Street to Your Laptop', content: 'Prop trading traditionally meant sitting in a firm\u2019s office (Goldman Sachs, Jane Street, Citadel). Online prop firms (FTMO, FundingPips, MyFundedFX) democratised access from ~2019 onwards. Now anyone with a laptop, a trading edge, and a challenge fee can access six-figure capital. The barrier to entry went from an Ivy League degree to a proven track record.' },
          { title: 'The Evaluation Structure', content: 'Most firms use a 2-phase evaluation. Phase 1: hit a profit target (typically 8-10%) without breaching drawdown limits (typically 5% daily, 10% overall). Phase 2: lower target (5%), same drawdown rules, proving consistency. Pass both = funded account. Some firms offer 1-phase or instant funding with different fee structures.' },
          { title: 'The Profit Split Explained', content: 'When you profit on your funded account, you keep 70-90% and the firm takes 10-30%. Most firms start at 80/20 and scale to 90/10 as you prove consistency. Payouts are typically bi-weekly or monthly. The firm\u2019s 20% share is their compensation for providing the capital and absorbing the downside risk.' },
        ].map((item, i) => (<div key={i}><button onClick={() => toggle(`u-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`u-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`u-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-xs text-gray-300 leading-relaxed">{item.content}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      {/* S04 — Who It's For */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Who Prop Trading Is For</p><h2 className="text-2xl font-extrabold mb-4">The Right Candidates</h2><div className="p-6 rounded-2xl glass-card space-y-3">{whoItsFor.map((item, i) => (<div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold text-gray-200">{item.title}</p><p className="text-xs text-gray-400 mt-1">{item.desc}</p></div><span className="text-[10px] font-bold px-2 py-1 rounded-lg shrink-0" style={{ color: item.color, background: item.color + '18', border: `1px solid ${item.color}33` }}>{item.verdict}</span></div></div>))}</div></motion.div></section>

      {/* S05 — Who It's NOT For */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Who Prop Trading Is NOT For</p><h2 className="text-2xl font-extrabold mb-4">Honest Reality Check</h2><div className="p-6 rounded-2xl glass-card space-y-3">{whoItsNotFor.map((item, i) => (<div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold text-gray-200">{item.title}</p><p className="text-xs text-gray-400 mt-1">{item.desc}</p></div><span className="text-[10px] font-bold px-2 py-1 rounded-lg shrink-0" style={{ color: item.color, background: item.color + '18', border: `1px solid ${item.color}33` }}>{item.verdict}</span></div></div>))}</div></motion.div></section>

      {/* S06 — GROUNDBREAKING: ROI Calculator */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Calculate Your Multiplier</p><h2 className="text-2xl font-extrabold mb-2">&#127919; Prop Trading ROI Calculator</h2><p className="text-gray-400 text-sm mb-4">Input your current situation and see exactly how prop trading multiplies your income.</p>
      <div className="p-6 rounded-2xl glass-card space-y-5">
        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div><p className="text-xs text-amber-400 font-bold mb-2">Personal Account (&pound;)</p><input type="number" value={personalBalance} onChange={e => setPersonalBalance(Math.max(0, Number(e.target.value)))} className="w-full p-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-amber-500/40" /></div>
          <div><p className="text-xs text-amber-400 font-bold mb-2">Monthly Return (%)</p><input type="number" value={monthlyReturn} onChange={e => setMonthlyReturn(Math.max(0, Math.min(20, Number(e.target.value))))} step={0.5} className="w-full p-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-amber-500/40" /></div>
          <div><p className="text-xs text-amber-400 font-bold mb-2">Payout Split (Your %)</p><div className="flex gap-1.5">{[70, 80, 90].map(s => (<button key={s} onClick={() => setSelectedSplit(s)} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${selectedSplit === s ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400' : 'bg-white/[0.04] border border-white/[0.08] text-gray-400'}`}>{s}/{100 - s}</button>))}</div></div>
        </div>
        {/* Personal baseline */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-xs text-gray-500">YOUR PERSONAL ACCOUNT</p><p className="text-lg font-extrabold text-gray-400">&pound;{personalIncome.toFixed(0)}<span className="text-xs font-normal text-gray-600"> /month from &pound;{personalBalance.toLocaleString()} at {monthlyReturn}%</span></p></div>
        {/* Funded tiers */}
        <div className="space-y-2">{fundedTiers.map(tier => {
          const gross = tier * (monthlyReturn / 100);
          const net = gross * (selectedSplit / 100);
          const multiplier = personalIncome > 0 ? Math.round(net / personalIncome) : 0;
          const fee = challengeFees[tier];
          const breakeven = net > 0 ? (fee / net).toFixed(1) : 'N/A';
          return (<div key={tier} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="flex items-center justify-between mb-1"><p className="text-sm font-bold text-white">&pound;{tier.toLocaleString()} Funded</p><span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-green-500/15 border border-green-500/30 text-green-400">{multiplier}x multiplier</span></div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div><p className="text-[10px] text-gray-600">Gross</p><p className="text-xs font-bold text-gray-300">&pound;{gross.toFixed(0)}</p></div>
              <div><p className="text-[10px] text-gray-600">Your {selectedSplit}%</p><p className="text-xs font-bold text-green-400">&pound;{net.toFixed(0)}</p></div>
              <div><p className="text-[10px] text-gray-600">Challenge Fee</p><p className="text-xs font-bold text-gray-400">&pound;{fee}</p></div>
              <div><p className="text-[10px] text-gray-600">Breakeven</p><p className="text-xs font-bold text-amber-400">{breakeven} months</p></div>
            </div>
          </div>);
        })}</div>
        {/* Skill leverage ratio */}
        <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-purple-500/10 border border-amber-500/20 text-center"><p className="text-xs text-gray-400 mb-1">Skill Leverage Ratio</p><p className="text-2xl font-extrabold text-amber-400">{personalIncome > 0 ? Math.round((200000 * (monthlyReturn / 100) * (selectedSplit / 100)) / personalIncome) : 0}x</p><p className="text-[10px] text-gray-500">Your edge generates {personalIncome > 0 ? Math.round((200000 * (monthlyReturn / 100) * (selectedSplit / 100)) / personalIncome) : 0} times more income on a &pound;200K funded account than your personal &pound;{personalBalance.toLocaleString()}</p></div>
      </div></motion.div></section>

      {/* S07 — How Much Does It Cost */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; The Cost of Entry</p><h2 className="text-2xl font-extrabold mb-4">What You Pay, What You Get</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#3b82f6]">&pound;25K ACCOUNT</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Challenge fee: ~&pound;150. Lowest pressure. Best for first-time prop traders proving the concept. Monthly income potential at 4%: ~&pound;800 after 80/20 split.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#8b5cf6]">&pound;50K ACCOUNT</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Challenge fee: ~&pound;250. Sweet spot for most traders. Meaningful income without excessive pressure. Monthly potential at 4%: ~&pound;1,600 after split.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#22c55e]">&pound;100K ACCOUNT</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Challenge fee: ~&pound;400. Serious income territory. Requires proven consistency. Monthly potential at 4%: ~&pound;3,200 after split. Most popular tier for experienced traders.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#f59e0b]">&pound;200K ACCOUNT</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Challenge fee: ~&pound;650. Maximum capital, maximum pressure. The 5% daily drawdown is &pound;10,000 &mdash; psychologically heavy. Only for traders who have passed smaller challenges first.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">THE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Start with &pound;25K-&pound;50K. Prove the process. Scale up after your first successful payout. The challenge fee is a business investment, not a gambling stake.</span></p></div>
      </div></motion.div></section>

      {/* S08 — Common Mistakes */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p><h2 className="text-2xl font-extrabold mb-4">4 Prop Trading Errors</h2><div className="space-y-3">{commonMistakes.map((item, i) => (<div key={i}><button onClick={() => toggle(`cm-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`cm-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`cm-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-xs text-red-400 mb-2">&#10060; {item.mistake}</p><p className="text-xs text-green-400">&#10004; {item.fix}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      {/* S09 — Cheat Sheet */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Cheat Sheet</p><h2 className="text-2xl font-extrabold mb-4">Prop Trading Quick Reference</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#22c55e]">THE MULTIPLIER</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Prop trading multiplies your existing edge by 50-200x through capital access. It does not create edge. It amplifies what you already have.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#3b82f6]">THE COST</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Challenge fees (&pound;150-&pound;650) are a business investment. If your first payout exceeds the fee, you are in profit. Most traders break even within 1-2 months of being funded.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">THE RISK</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">85-90% of traders fail the evaluation. The challenge fee is the maximum you can lose. You never owe the firm money. The risk is capped, the upside is not.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#FFB300]">THE PREREQUISITE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">3-4 months of consistent profitability on demo or a small personal account. Documented positive expectancy. Rule-following discipline. Without these, prop amplifies failure.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">THE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Prop trading is the bridge between &quot;I can trade&quot; and &quot;I earn from trading.&quot; Build the skill first (Levels 1-8), then use prop to monetise it.</span></p></div>
      </div></motion.div></section>

      {/* S10 — Game */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Test Your Understanding</p><h2 className="text-2xl font-extrabold mb-2">Prop Trading Reality Check</h2><p className="text-gray-400 text-sm mb-6">5 scenario-based rounds. Separate the hype from the reality of prop trading.</p>
      <div className="p-6 rounded-2xl glass-card"><div className="flex items-center justify-between mb-4"><span className="text-xs font-bold text-amber-400">Round {gameRound + 1} of {gameRounds.length}</span><span className="text-xs font-mono text-gray-500">{gameScore}/{gameRounds.length} correct</span></div><p className="text-sm text-gray-300 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: gameRounds[gameRound].scenario }} /><div className="space-y-2">{gameRounds[gameRound].options.map((opt, oi) => { const answered = gameAnswers[gameRound] !== null; const selected = gameAnswers[gameRound] === oi; const isCorrect = opt.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return (<div key={oi}><button onClick={() => handleGameAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt.text }} /></button>{answered && selected && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]"><p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`} dangerouslySetInnerHTML={{ __html: opt.explain }} /></motion.div>)}</div>); })}</div>{gameAnswers[gameRound] !== null && gameRound < gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5"><button onClick={() => setGameRound(r => r + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button></motion.div>)}{gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Outstanding \u2014 you understand the reality of prop trading, not just the hype.' : gameScore >= 3 ? 'Good \u2014 review the business model and capital multiplier sections to sharpen your understanding.' : 'Re-read the lesson carefully. Understanding the fundamentals here is critical before proceeding to challenge strategy.'}</p></motion.div>)}</div></motion.div></section>

      {/* S11 — Quiz + Certificate */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Knowledge Check</p><h2 className="text-2xl font-extrabold mb-6">Final Quiz &mdash; 8 Questions</h2>
      <div className="space-y-6">{quizQuestions.map((q, qi) => (<div key={qi} className="p-5 rounded-2xl glass-card"><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p><p className="text-sm font-semibold text-white mb-4">{q.q}</p><div className="space-y-2">{q.opts.map((opt, oi) => { const answered = quizAnswers[qi] !== null; const selected = quizAnswers[qi] === oi; const isCorrect = oi === q.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return <button key={oi} onClick={() => handleQuizAnswer(qi, oi)} disabled={answered} className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`}>{opt}</button>; })}</div>{quizAnswers[qi] !== null && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg bg-white/[0.02]"><p className="text-xs text-amber-400" dangerouslySetInnerHTML={{ __html: `<span class="font-bold">&#9989;</span> ${q.explain}` }} /></motion.div>)}</div>))}</div>
      {quizDone && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center"><p className="text-3xl font-extrabold mb-2">{quizScoreVal}%</p><p className="text-sm text-gray-400">{quizScoreVal >= 66 ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate. Review and try again.'}</p></motion.div>)}
      {certUnlocked && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10"><div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}><div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(139,92,246,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} /><div className="relative z-10 text-center"><div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">&#128640;</div><p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p><p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 9: What Is Prop Trading?</strong><br />at ATLAS Academy by Interakktive</p><p className="bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Prop Explorer &mdash;</p><p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L9.1-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p></div></div></motion.div>)}</motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-20 text-center"><Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">&larr; Back to Academy</Link></section>
    </div>
  );
}
