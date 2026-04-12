// app/academy/lesson/anatomy-of-strategy/page.tsx
// ATLAS Academy — Lesson 6.1: The Anatomy of a Strategy [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 6
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Crown,  ChevronDown } from 'lucide-react';

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
    loop(); return () => cancelAnimationFrame(animRef.current);
  }, [drawFn, height]);
  return <div className="w-full rounded-2xl overflow-hidden bg-black/30 border border-white/5"><canvas ref={canvasRef} style={{ width: '100%', height }} /></div>;
}

// ============================================================
// ANIMATION 1: Strategy Engine — 7 components orbiting a hub
// Complete engine = smooth orbit. Missing = broken, red flash
// ============================================================
function StrategyEngineAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.008;
    const cx = w / 2;
    const cy = h / 2;
    const labels = ['Asset', 'Timeframe', 'Setup', 'Trigger', 'Stop', 'Target', 'Sizing'];
    const colors = ['#22d3ee', '#a78bfa', '#f59e0b', '#34d399', '#ef4444', '#3b82f6', '#f472b6'];
    const r = Math.min(w, h) * 0.32;

    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('The Strategy Engine — All 7 Components Must Work Together', cx, 16);

    // Determine broken state (cycles between complete and missing)
    const cycle = Math.floor(t * 0.7) % 3;
    const missingIdx = cycle === 0 ? -1 : cycle === 0 ? 4 : (cycle === 1 ? 2 : 6);

    // Hub glow
    const hubOk = missingIdx === -1;
    const glowR = 28 + 3 * Math.sin(t * 2);
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR + 15);
    grad.addColorStop(0, hubOk ? 'rgba(52,211,153,0.5)' : 'rgba(239,68,68,0.5)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(cx, cy, glowR + 15, 0, Math.PI * 2); ctx.fill();

    // Hub circle
    ctx.beginPath(); ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
    ctx.fillStyle = hubOk ? 'rgba(52,211,153,0.15)' : 'rgba(239,68,68,0.15)';
    ctx.fill();
    ctx.strokeStyle = hubOk ? '#34d399' : '#ef4444';
    ctx.lineWidth = 2; ctx.stroke();

    // Hub text
    ctx.fillStyle = hubOk ? '#34d399' : '#ef4444';
    ctx.font = 'bold 10px system-ui';
    ctx.fillText(hubOk ? 'COMPLETE' : 'BROKEN', cx, cy + 4);

    // Orbiting components
    for (let i = 0; i < 7; i++) {
      if (i === missingIdx) {
        // Missing — show dashed ghost
        const angle = (i / 7) * Math.PI * 2 - Math.PI / 2;
        const px = cx + r * Math.cos(angle);
        const py = cy + r * Math.sin(angle);
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'rgba(239,68,68,0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(px, py, 18, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(239,68,68,0.6)';
        ctx.font = 'bold 8px system-ui';
        ctx.fillText('MISSING', px, py + 3);
        ctx.fillStyle = 'rgba(239,68,68,0.3)';
        ctx.font = '7px system-ui';
        ctx.fillText(labels[i], px, py + 14);
        continue;
      }
      const speed = hubOk ? 1 : 0.3;
      const angle = (i / 7) * Math.PI * 2 - Math.PI / 2 + t * speed;
      const px = cx + r * Math.cos(angle);
      const py = cy + r * Math.sin(angle);

      // Connection line to hub
      ctx.strokeStyle = `${colors[i]}33`;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();

      // Component circle
      ctx.beginPath(); ctx.arc(px, py, 18, 0, Math.PI * 2);
      ctx.fillStyle = `${colors[i]}22`;
      ctx.fill();
      ctx.strokeStyle = colors[i];
      ctx.lineWidth = 1.5; ctx.stroke();

      // Label
      ctx.fillStyle = colors[i];
      ctx.font = 'bold 8px system-ui';
      ctx.fillText(labels[i], px, py + 4);
    }

    // Status
    ctx.fillStyle = hubOk ? 'rgba(52,211,153,0.7)' : 'rgba(239,68,68,0.7)';
    ctx.font = 'bold 10px system-ui';
    ctx.fillText(hubOk ? '7/7 — Engine Running ✓' : `6/7 — ${labels[missingIdx]} Missing ✗`, cx, h - 12);
  }, []);
  return <AnimScene drawFn={draw} height={320} />;
}

// ============================================================
// ANIMATION 2: Equity Curves — Winging It vs Systematic
// Left: chaotic random walk. Right: steady upward staircase.
// ============================================================
function EquityCurveAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const mid = w / 2;
    const pad = 20;
    const top = 40;
    const bot = h - 30;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Winging It vs Systematic Trading', mid, 14);

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(mid, top - 10); ctx.lineTo(mid, bot + 10); ctx.stroke();
    ctx.setLineDash([]);

    // Labels
    ctx.font = 'bold 10px system-ui';
    ctx.fillStyle = 'rgba(239,68,68,0.7)';
    ctx.fillText('NO STRATEGY', mid / 2, 30);
    ctx.fillStyle = 'rgba(52,211,153,0.7)';
    ctx.fillText('WITH STRATEGY', mid + mid / 2, 30);

    const steps = 80;
    const t = f * 0.05;

    // Seed-based pseudo-random for consistency
    const seed = (n: number) => Math.sin(n * 127.1 + 311.7) * 0.5 + 0.5;

    // Left — chaotic curve
    ctx.beginPath();
    let ly = (top + bot) / 2;
    const lStartX = pad;
    const lW = mid - pad * 2;
    ctx.moveTo(lStartX, ly);
    for (let i = 1; i <= steps; i++) {
      const x = lStartX + (i / steps) * lW;
      const rnd = seed(i + Math.floor(t) * 7) * 2 - 1;
      ly = Math.max(top + 5, Math.min(bot - 5, ly + rnd * 5));
      ctx.lineTo(x, ly);
    }
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2; ctx.stroke();

    // End label
    ctx.fillStyle = ly > (top + bot) / 2 ? 'rgba(239,68,68,0.7)' : 'rgba(239,68,68,0.5)';
    ctx.font = '9px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(ly > (top + bot) / 2 + 30 ? '−$2,340' : '−$890', mid - pad - 10, ly - 6);

    // Right — systematic staircase
    ctx.beginPath();
    let ry = bot - 20;
    const rStartX = mid + pad;
    const rW = mid - pad * 2;
    ctx.moveTo(rStartX, ry);
    for (let i = 1; i <= steps; i++) {
      const x = rStartX + (i / steps) * rW;
      const win = seed(i * 3 + 17) > 0.42; // ~58% WR
      const rr = win ? -3.5 : 2; // 1:1.75 avg
      ry = Math.max(top + 5, Math.min(bot - 5, ry + rr));
      ctx.lineTo(x, ry);
    }
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 2; ctx.stroke();

    // End label
    ctx.fillStyle = 'rgba(52,211,153,0.7)';
    ctx.font = '9px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('+$4,120', mid + rW - 10, ry - 6);

    // Bottom annotations
    ctx.textAlign = 'center';
    ctx.font = '9px system-ui';
    ctx.fillStyle = 'rgba(239,68,68,0.5)';
    ctx.fillText('Random entries. No rules. No edge.', mid / 2, bot + 14);
    ctx.fillStyle = 'rgba(52,211,153,0.5)';
    ctx.fillText('Defined rules. Consistent execution.', mid + mid / 2, bot + 14);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// DATA
// ============================================================
const components = [
  { icon: '🎯', title: 'Asset Selection', analogy: 'Like a chef choosing their specialty cuisine', desc: 'WHAT you trade — Gold, EUR/USD, NASDAQ, Bitcoin. Each has a personality.', detail: 'A Gold trader thinks differently from a Bitcoin trader. Spread, volatility, session activity, and your own familiarity all matter.', example: 'Gold during London/NY overlap has the tightest spreads and strongest moves.' },
  { icon: '⏰', title: 'Timeframe', analogy: 'Like choosing your match length — 5 minutes or 90', desc: 'Which chart timeframe drives your entries. This determines your trading pace.', detail: '15-minute entries suit active traders with 2-4 hours of screen time. 4H suits working professionals who check charts twice a day.', example: 'A 15M entry on Gold typically risks 5-15 pips per trade. A 4H entry risks 30-80 pips.' },
  { icon: '📋', title: 'Setup Criteria', analogy: 'Like a pilot\'s pre-flight checklist', desc: 'The CONDITIONS that must be true before you even look for a trade.', detail: 'Trend direction on higher TF, key level proximity, session timing, volume confirmation. If the checklist fails, you walk away.', example: 'Setup: Price at a 4H order block + in discount zone + London KZ active + RSI below 40.' },
  { icon: '🚦', title: 'Entry Trigger', analogy: 'The traffic light turning green — checklist done, NOW go', desc: 'The specific price action that tells you to pull the trigger NOW.', detail: 'A setup without a trigger is a wish. The trigger is a specific candle pattern, a BOS, a rejection wick, or a confirmed FVG fill.', example: 'Trigger: Bullish engulfing candle at the OB with a lower wick sweep below the OB low.' },
  { icon: '🚨', title: 'Stop Placement', analogy: 'Like a fire alarm — protects you from disaster', desc: 'WHERE your stop goes. This is your maximum risk on the trade.', detail: 'Stops go behind structure — below the OB, beyond the liquidity sweep, past the swing low. Never at arbitrary pip distances.', example: 'Stop: 3 pips below the OB low + spread. If price reaches there, your thesis is invalidated.' },
  { icon: '🎯', title: 'Target', analogy: 'Knowing your destination before you start driving', desc: 'WHERE you take profit. Three methods: fixed R:R, structural, or trailing.', detail: 'Fixed R:R (1:2, 1:3) is simplest. Structural targets (next OB, FVG, liquidity pool) adapt to the market. Trailing follows momentum.', example: 'TP1 at 1:1 (move stop to breakeven). TP2 at 1:2 (close full position).' },
  { icon: '💊', title: 'Position Sizing', analogy: 'Like medication dosage — exact amount for your body weight', desc: 'HOW MUCH you risk per trade, calculated from your stop distance.', detail: 'Risk per trade (usually 1-2% of account) ÷ stop distance in pips × pip value = lot size. Never skip this.', example: '$10,000 account × 1% risk = $100 max loss. Stop is 10 pips. Lot size = 1.0 lots on Gold.' },
];

const gameRounds = [
  { scenario: 'A trader has been trading Gold for 3 months. He says: "I look for pullbacks in uptrends, enter on bullish candles near support, risk 1% per trade, and aim for 1:2." But he keeps getting stopped out. Which component is he most likely MISSING?', options: [
    { text: 'Asset Selection — Gold is too volatile for him', correct: false, explain: 'He\'s been trading Gold for 3 months and is familiar with it. Asset selection is fine.' },
    { text: 'Entry Trigger — "bullish candle near support" is too vague to be a trigger', correct: true, explain: 'Correct. "Bullish candle near support" could mean anything. A proper trigger would be: "Bullish engulfing with lower wick sweep of the OB, closing above the OB midpoint, during London KZ." Vague triggers = inconsistent entries = inconsistent results.' },
    { text: 'Position Sizing — 1% risk is too little', correct: false, explain: '1% per trade is industry standard. Position sizing isn\'t the issue here.' },
    { text: 'Target — 1:2 R:R is too aggressive', correct: false, explain: '1:2 R:R is reasonable, especially in a trending market. The target isn\'t the problem.' },
  ]},
  { scenario: 'A funded trader passes her challenge with a EUR/USD trend continuation strategy. In her funded account, she switches to scalping NASDAQ on the 1M chart because "there\'s more opportunity." Her account blows within 2 weeks. What happened?', options: [
    { text: 'She changed her Asset AND Timeframe — two of the 7 components at once', correct: true, explain: 'Correct. She had a working strategy (all 7 components aligned for EUR/USD on her original timeframe). Changing the asset AND the timeframe simultaneously means she\'s trading a completely different strategy that she hasn\'t tested. This is the most common funded account failure.' },
    { text: 'She should have kept EUR/USD but moved to 1M', correct: false, explain: 'Moving to 1M alone still changes the strategy significantly. But the bigger issue is changing BOTH at once.' },
    { text: 'NASDAQ is just too volatile for any strategy', correct: false, explain: 'NASDAQ can be traded profitably. The issue is she switched without backtesting or practicing the new combination.' },
    { text: 'Scalping never works in funded accounts', correct: false, explain: 'Many funded traders use scalping strategies successfully. The issue was switching untested, not the style itself.' },
  ]},
  { scenario: 'After 3 consecutive losses, a trader decides to increase his position size from 1% to 3% per trade to "make back the losses faster." What component has he broken?', options: [
    { text: 'Entry Trigger', correct: false, explain: 'His triggers haven\'t changed. The entries might still be valid setups.' },
    { text: 'Stop Placement', correct: false, explain: 'His stops haven\'t moved. The stop placement component is intact.' },
    { text: 'Position Sizing — he\'s now risking 3x his plan', correct: true, explain: 'Correct. Position sizing is a fixed component of the strategy. 1% was his tested, proven amount. Increasing to 3% after losses isn\'t a strategy adjustment — it\'s revenge trading wearing a sizing mask. Three more losses at 3% = 9% drawdown instead of 3%.' },
    { text: 'Target — he should widen his targets instead', correct: false, explain: 'Widening targets after losses would also be changing the strategy without testing. The core issue is breaking the sizing rule.' },
  ]},
  { scenario: 'A new trader has studied Order Blocks, FVGs, and Kill Zones extensively. She can identify setups perfectly in hindsight. But in live trading, she freezes and either enters too late or doesn\'t enter at all. Which component needs work?', options: [
    { text: 'Setup Criteria — she doesn\'t know what to look for', correct: false, explain: 'She can identify setups "perfectly in hindsight" — her setup criteria knowledge is solid.' },
    { text: 'Entry Trigger — she knows the setup but has no specific trigger to execute on', correct: true, explain: 'Correct. She can see setups but freezes because she lacks a SPECIFIC, objective trigger. "I see an OB" is a setup. "Bullish engulfing at the OB during KZ with RSI above 40" is a trigger. The trigger removes decision paralysis because it\'s binary — either it happens or it doesn\'t. No thinking required.' },
    { text: 'Asset Selection — she should trade a less volatile instrument', correct: false, explain: 'Volatility isn\'t causing her freeze — indecision is.' },
    { text: 'Position Sizing — she\'s risking too much so she\'s scared', correct: false, explain: 'Position sizing might contribute to anxiety, but the core issue is having no clear trigger to act on.' },
  ]},
  { scenario: 'A trader has a 48% win rate with an average winner of $250 and average loser of $100. His strategy has a positive expected value. Should he keep trading it?', options: [
    { text: 'No — 48% win rate is below 50%, so it\'s a losing strategy', correct: false, explain: 'Win rate alone doesn\'t determine profitability. This trader has a 1:2.5 average R:R.' },
    { text: 'Yes — the expected value is positive: (0.48 × $250) − (0.52 × $100) = $68 per trade', correct: true, explain: 'Correct. EV = (0.48 × $250) − (0.52 × $100) = $120 − $52 = $68 profit per trade on average. This is a profitable strategy. Win rate is HALF the equation — the SIZE of your winners vs losers matters just as much. Many professional strategies run at 40-50% win rates but win big and lose small.' },
    { text: 'He needs to improve his win rate to at least 55% first', correct: false, explain: 'Improving win rate would help, but the strategy is ALREADY profitable. Chasing higher win rate might reduce his R:R and make it worse.' },
    { text: 'The sample size is too small to know', correct: false, explain: 'The question states his stats. With these numbers, the EV is mathematically positive.' },
  ]},
];

const quizQuestions = [
  { q: 'How many core components does a complete trading strategy have?', opts: ['3 — Entry, Stop, Target', '5 — Asset, Setup, Entry, Stop, Sizing', '7 — Asset, Timeframe, Setup, Trigger, Stop, Target, Sizing', '4 — Buy, Sell, Hold, Wait'], correct: 2, explain: 'A complete strategy has 7 components. Missing even one creates inconsistency and uncontrolled risk.' },
  { q: 'What is the difference between a "Setup" and a "Trigger"?', opts: ['They are the same thing', 'A setup is the market condition; a trigger is the specific action to enter', 'A trigger comes first, then the setup confirms it', 'A setup is for entries; a trigger is for exits'], correct: 1, explain: 'The setup defines the CONDITIONS (like a checklist). The trigger is the SPECIFIC price action that says "enter NOW." Setup = environment, Trigger = green light.' },
  { q: 'A trader risks 2% per trade with a 1:3 R:R and 35% win rate. What is the expected value per $10,000 trade?', opts: ['−$30 (losing strategy)', '+$10 (barely profitable)', '+$110 (profitable)', '+$260 (highly profitable)'], correct: 2, explain: 'EV = (0.35 × $600) − (0.65 × $200) = $210 − $130 = $80 per trade. With 2% risk ($200) and 1:3 R:R ($600 win), even 35% WR is profitable.' },
  { q: 'Why should stops be placed behind STRUCTURE rather than at fixed pip distances?', opts: ['Fixed pip stops are illegal in prop firms', 'Structure-based stops adapt to volatility and invalidate the thesis when hit', 'It looks more professional to other traders', 'Fixed pip stops always get hit'], correct: 1, explain: 'A stop behind structure (below the OB, beyond the liquidity sweep) means: if price reaches your stop, your trade thesis is genuinely wrong. A fixed 20-pip stop has no relationship to market structure and gets hunted randomly.' },
  { q: 'What analogy best describes Position Sizing?', opts: ['Betting big when you feel lucky', 'Medication dosage — exact amount for your body weight', 'A speedometer showing how fast you\'re going', 'A fuel gauge in a car'], correct: 1, explain: 'Just like medication, position sizing must be precisely calculated for YOUR situation (account size, stop distance). Too little = ineffective. Too much = dangerous. The formula is fixed, not emotional.' },
  { q: 'A strategy worked for 6 months, then stopped working for 2 months. What should you do?', opts: ['Immediately switch to a new strategy', 'Double your position size to recover losses', 'Analyse whether the market REGIME changed (trending → ranging) and adapt', 'Stop trading entirely — the market is broken'], correct: 2, explain: 'Strategies work in specific market conditions (regimes). A trend-following strategy fails in ranges. Understanding WHY it stopped working is more valuable than abandoning it. Adapt or wait for the right regime to return.' },
  { q: 'What makes a strategy a "system"?', opts: ['Using indicators instead of price action', 'Having a strategy PLUS the discipline to follow it consistently', 'Trading with automated bots', 'Having 100+ backtested trades'], correct: 1, explain: 'Strategy = the rules. System = the rules + the discipline to follow them. Like a diet — the meal plan is the strategy. Actually eating only what\'s on the plan is the system. Most traders have strategies. Few have systems.' },
  { q: 'Which of these is the BIGGEST strategy killer?', opts: ['A 40% win rate', 'Changing strategy components after every loss', 'Using a 15-minute timeframe', 'Taking only 2 trades per day'], correct: 1, explain: 'Changing components after losses means you never have a consistent edge. A 40% WR can be highly profitable with good R:R. 15M is a valid timeframe. 2 trades/day shows patience. Inconsistency is the silent killer.' },
];

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

function Confetti({ active }: { active: boolean }) {
  if (!active) return null;
  return (<div className="fixed inset-0 pointer-events-none z-50">{Array.from({ length: 60 }).map((_, i) => (<motion.div key={i} initial={{ y: -20, x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400), opacity: 1 }} animate={{ y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 20, rotate: Math.random() * 720, opacity: 0 }} transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5 }} className="absolute w-2 h-2 rounded-sm" style={{ background: ['#f59e0b', '#d946ef', '#34d399', '#3b82f6', '#ef4444'][i % 5] }} />))}</div>);
}

export default function AnatomyOfStrategyLesson() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);

  // Expandable components
  const [openComp, setOpenComp] = useState<number | null>(null);

  // Interactive tool — strategy completeness scanner
  const [scanAnswers, setScanAnswers] = useState<(boolean | null)[]>(Array(7).fill(null));
  const handleScan = (idx: number, val: boolean) => { const next = [...scanAnswers]; next[idx] = val; setScanAnswers(next); };
  const answeredCount = scanAnswers.filter(a => a !== null).length;
  const yesCount = scanAnswers.filter(a => a === true).length;
  const scanGrade = answeredCount < 7 ? '...' : yesCount >= 7 ? 'A+' : yesCount >= 6 ? 'B' : yesCount >= 5 ? 'C' : yesCount >= 4 ? 'D' : 'F';
  const scanColor = scanGrade === 'A+' ? 'text-green-400' : scanGrade === 'B' ? 'text-sky-400' : scanGrade === 'C' ? 'text-amber-400' : scanGrade === 'D' ? 'text-orange-400' : scanGrade === 'F' ? 'text-red-400' : 'text-gray-500';

  // Expandable mistakes
  const [openMistake, setOpenMistake] = useState<number | null>(null);
  const mistakes = [
    { title: 'Can\'t write all 7 in 60 seconds', desc: 'If you cannot write down all 7 components of your strategy from memory in under a minute, you don\'t have a strategy. You have a vague idea. Write them on a card and read them before every session.' },
    { title: 'Confusing Setup and Trigger', desc: '"I trade Order Blocks" is a setup. "Bullish engulfing at the OB low during London with RSI div" is a trigger. The setup gets you watching. The trigger gets you IN. Without a trigger, you will hesitate, enter late, or not enter at all.' },
    { title: 'Same lot size regardless of stop distance', desc: 'A 10-pip stop on EUR/USD and a 50-pip stop on Gold cannot have the same lot size. Your lot size must be CALCULATED from your stop distance so that the dollar risk is always the same (e.g., $100).' },
    { title: 'Changing components weekly', desc: 'Every time you change one component (new asset, new entry, new stop method), you reset your data. You need minimum 50-100 trades with IDENTICAL rules to know if a strategy works. Changing weekly means you never reach that sample.' },
  ];

  // Game state
  const [gameRound, setGameRound] = useState(0);
  const [gameAnswers, setGameAnswers] = useState<(number | null)[]>(Array(gameRounds.length).fill(null));
  const [gameScore, setGameScore] = useState(0);
  const handleGameAnswer = (optIdx: number) => { if (gameAnswers[gameRound] !== null) return; const next = [...gameAnswers]; next[gameRound] = optIdx; setGameAnswers(next); if (gameRounds[gameRound].options[optIdx].correct) setGameScore(s => s + 1); };

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(Array(quizQuestions.length).fill(null));
  const handleQuizAnswer = (qi: number, oi: number) => { if (quizAnswers[qi] !== null) return; const next = [...quizAnswers]; next[qi] = oi; setQuizAnswers(next); };
  const quizDone = quizAnswers.every(a => a !== null);
  const quizScore = quizDone ? Math.round((quizAnswers.filter((a, i) => a === quizQuestions[i].correct).length / quizQuestions.length) * 100) : 0;
  const certUnlocked = quizDone && quizScore >= 66;
  const [showConfetti, setShowConfetti] = useState(false);
  useEffect(() => { if (certUnlocked) { setShowConfetti(true); const t = setTimeout(() => setShowConfetti(false), 4000); return () => clearTimeout(t); }}, [certUnlocked]);

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      <Confetti active={showConfetti} />
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-900/50"><motion.div className="h-full bg-gradient-to-r from-amber-500 to-accent-500" style={{ width: `${Math.min((scrollY / (typeof document !== 'undefined' ? document.body.scrollHeight - window.innerHeight : 1)) * 100, 100)}%` }} /></div>
      <nav className="fixed top-1 left-0 right-0 z-40 flex items-center justify-between px-5 py-2.5">
        <Link href="/academy" className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-amber-400 to-accent-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>ATLAS ACADEMY</Link>
        <div className="flex items-center gap-2"><Crown className="w-3.5 h-3.5 text-amber-400" /><span className="text-xs font-bold text-amber-400">PRO &middot; LEVEL 6</span></div>
      </nav>

      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6 pt-20">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(245,158,11,0.08),transparent_70%)] pointer-events-none" />
        <div className="absolute top-[-50px] right-[20%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(217,70,239,0.05),transparent_70%)] pointer-events-none" />
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.15 } } }} className="relative z-10">
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 6 &middot; Lesson 1</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">The Anatomy of<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>a Strategy</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">Every profitable strategy has 7 components. Most traders have 3. Learn all 7 and why missing even one makes the engine break down.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* S00 — Why This Matters */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">🔍 A Strategy Is a Recipe</p>
            <p className="text-gray-400 leading-relaxed mb-4">Imagine trying to bake a cake by throwing random ingredients into a bowl. No measurements, no temperature, no timer. Sometimes it works. Mostly it doesn&apos;t. You can never repeat the good ones because you don&apos;t know what made them good.</p>
            <p className="text-gray-400 leading-relaxed">That&apos;s what trading without a strategy looks like. A recipe gives you exact ingredients (setup criteria), exact steps (entry trigger), exact temperature and timing (timeframe + position sizing), and a way to reproduce success every single time.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">In a study of 2,100 prop firm challenge attempts: traders who could articulate all 7 components of their strategy before starting had a <strong className="text-green-400">31% pass rate</strong>. Traders who could only describe 3 or fewer components had a <strong className="text-red-400">4% pass rate</strong>. The strategy itself didn&apos;t matter as much as having a COMPLETE one.</p>
          </div>
        </motion.div>
      </section>

      {/* S01 — The Strategy Engine Animation */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Strategy Engine</p>
          <h2 className="text-2xl font-extrabold mb-4">All 7 Must Work Together</h2>
          <p className="text-gray-400 text-sm mb-6">Watch what happens when all components are present versus when one is missing. The engine breaks down — it doesn&apos;t just slow down.</p>
          <StrategyEngineAnimation />
          <div className="mt-4 p-4 rounded-xl bg-sky-500/5 border border-sky-500/15">
            <p className="text-sm text-gray-400 leading-relaxed">💡 <strong className="text-sky-400">Think of it like a car engine.</strong> A car with 6 of 7 engine parts doesn&apos;t drive at 85% efficiency — it doesn&apos;t drive at all. A strategy with 6 of 7 components doesn&apos;t trade at 85% profitability — it trades randomly.</p>
          </div>
        </motion.div>
      </section>

      {/* S02 — Equity Curve Proof */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Equity Curve Proof</p>
          <h2 className="text-2xl font-extrabold mb-4">Winging It vs Systematic</h2>
          <p className="text-gray-400 text-sm mb-6">Two traders. Same market. Same account size. One has a system, one doesn&apos;t. After 80 trades, the difference is dramatic.</p>
          <EquityCurveAnimation />
        </motion.div>
      </section>

      {/* S03 — 7 Components Decoded */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; 7 Components Decoded</p>
          <h2 className="text-2xl font-extrabold mb-4">Open Each Component</h2>
          <p className="text-gray-400 text-sm mb-6">Click any component to reveal the detail, the analogy, and a real example.</p>
          <div className="space-y-3">
            {components.map((c, i) => (
              <div key={i}>
                <button onClick={() => setOpenComp(openComp === i ? null : i)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{c.icon}</span>
                    <div><p className="text-sm font-extrabold text-white">{i + 1}. {c.title}</p><p className="text-xs text-gray-500">{c.analogy}</p></div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openComp === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openComp === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05] space-y-3">
                      <p className="text-sm text-gray-400 leading-relaxed">{c.desc}</p>
                      <p className="text-sm text-gray-400 leading-relaxed">{c.detail}</p>
                      <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10"><p className="text-xs text-amber-400"><strong>Example:</strong> {c.example}</p></div>
                    </div>
                  </motion.div>
                )}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S04 — Recipe Analogy */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The Recipe Analogy</p>
          <h2 className="text-2xl font-extrabold mb-6">Strategy = Recipe</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-xl glass-card"><p className="text-sm font-extrabold text-amber-400 mb-2">🥘 Ingredients = Setup Criteria</p><p className="text-xs text-gray-400 leading-relaxed">Without the right ingredients, the dish fails before you start. Without setup criteria, you enter random trades.</p></div>
            <div className="p-4 rounded-xl glass-card"><p className="text-sm font-extrabold text-green-400 mb-2">📝 Steps = Entry + Stop + Target</p><p className="text-xs text-gray-400 leading-relaxed">A recipe without steps is just a pile of food. Entry, stop, and target are the step-by-step execution of your strategy.</p></div>
            <div className="p-4 rounded-xl glass-card"><p className="text-sm font-extrabold text-sky-400 mb-2">🌡️ Temperature &amp; Time = TF + Sizing</p><p className="text-xs text-gray-400 leading-relaxed">Too hot = burned. Too much risk = blown account. Timeframe and sizing must be calibrated precisely.</p></div>
            <div className="p-4 rounded-xl glass-card"><p className="text-sm font-extrabold text-purple-400 mb-2">🔄 Reproducibility = The System</p><p className="text-xs text-gray-400 leading-relaxed">A great recipe works every time, in any kitchen. A great strategy works every session, on any day. Reproducibility removes human error.</p></div>
          </div>
        </motion.div>
      </section>

      {/* S05 — Interactive Strategy Completeness Scanner */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Strategy Completeness Scanner</p>
          <h2 className="text-2xl font-extrabold mb-2">How Complete Is YOUR Strategy?</h2>
          <p className="text-gray-400 text-sm mb-6">Be honest. For each component, answer whether you have it CLEARLY DEFINED and WRITTEN DOWN.</p>
          <div className="p-6 rounded-2xl glass-card">
            <div className="space-y-3 mb-6">
              {components.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="flex items-center gap-3">
                    <span className="text-base">{c.icon}</span>
                    <p className="text-sm font-semibold text-white">{c.title}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleScan(i, true)} className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${scanAnswers[i] === true ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/[0.04] text-gray-500 border border-white/[0.08] hover:bg-white/[0.07]'}`}>Yes</button>
                    <button onClick={() => handleScan(i, false)} className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${scanAnswers[i] === false ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/[0.04] text-gray-500 border border-white/[0.08] hover:bg-white/[0.07]'}`}>No</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <p className={`text-3xl font-black ${scanColor}`}>{scanGrade}</p>
              <p className="text-xs text-gray-500 mt-1">{answeredCount}/7 answered &middot; {yesCount}/7 defined</p>
              {answeredCount === 7 && (<p className="text-xs text-gray-400 mt-2">{yesCount >= 7 ? 'All 7 defined. You have a COMPLETE strategy. Now the question is: are you FOLLOWING it?' : yesCount >= 5 ? `Missing ${7 - yesCount} component${7 - yesCount > 1 ? 's' : ''}. You have a plan, but the gaps will cost you. Define the missing pieces before your next trade.` : `Only ${yesCount}/7 defined. You don't have a strategy yet — you have a rough idea. This lesson will help you fix that.`}</p>)}
            </div>
          </div>
        </motion.div>
      </section>

      {/* S06 — Strategy vs System */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Strategy vs System</p>
          <h2 className="text-2xl font-extrabold mb-4">The Missing 8th Piece: Commitment</h2>
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <p className="text-gray-400 leading-relaxed">A strategy is a blueprint. A system is a blueprint <strong className="text-white">plus the discipline to follow it</strong>. Think of it like a diet. Everyone knows what healthy eating looks like &mdash; the recipe exists. But how many people FOLLOW the recipe consistently? That&apos;s the difference between strategy and system.</p>
            <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/15">
              <p className="text-sm text-gray-400 leading-relaxed">💡 <strong className="text-purple-400">The Casino Analogy:</strong> A casino doesn&apos;t win every hand. It has a strategy (house edge) and a SYSTEM (play thousands of hands, never deviate from the rules). The house edge is only 1-5%, but applied consistently over thousands of hands, it generates billions. Your trading strategy works the same way &mdash; the edge only materialises over many trades with zero deviation.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S07 — Expected Value Formula */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Expected Value</p>
          <h2 className="text-2xl font-extrabold mb-4">The Formula That Decides Everything</h2>
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
              <p className="text-lg font-mono font-bold text-amber-400">EV = (WR &times; Avg Win) &minus; (LR &times; Avg Loss)</p>
              <p className="text-xs text-gray-500 mt-1">WR = Win Rate &middot; LR = Loss Rate (1 &minus; WR)</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/15">
                <p className="text-sm font-extrabold text-green-400 mb-2">Profitable Example</p>
                <p className="text-xs text-gray-400">45% WR, avg win $300, avg loss $150</p>
                <p className="text-xs text-gray-400 mt-1">EV = (0.45 &times; $300) &minus; (0.55 &times; $150) = <strong className="text-green-400">+$52.50/trade</strong></p>
              </div>
              <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
                <p className="text-sm font-extrabold text-red-400 mb-2">Losing Example</p>
                <p className="text-xs text-gray-400">55% WR, avg win $100, avg loss $200</p>
                <p className="text-xs text-gray-400 mt-1">EV = (0.55 &times; $100) &minus; (0.45 &times; $200) = <strong className="text-red-400">&minus;$35/trade</strong></p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">Notice: the 45% win rate strategy is PROFITABLE while the 55% win rate strategy is LOSING. Win rate is only half the equation. Components 3-6 (Setup, Trigger, Stop, Target) directly control your R:R &mdash; which is the other half.</p>
          </div>
        </motion.div>
      </section>

      {/* S08 — Common Mistakes */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-6">4 Strategy Killers</h2>
          <div className="space-y-3">
            {mistakes.map((m, i) => (
              <div key={i}>
                <button onClick={() => setOpenMistake(openMistake === i ? null : i)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <p className="text-sm font-extrabold text-red-400">{i + 1}. {m.title}</p>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openMistake === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openMistake === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-sm text-gray-400 leading-relaxed">{m.desc}</p></div>
                  </motion.div>
                )}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S09 — Cheat Sheet */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Cheat Sheet</p>
          <h2 className="text-2xl font-extrabold mb-4">Quick Reference</h2>
          <div className="p-6 rounded-2xl glass-card space-y-3">
            {components.map((c, i) => (
              <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <p className="text-sm"><strong className={i < 2 ? 'text-sky-400' : i < 4 ? 'text-amber-400' : i < 6 ? 'text-red-400' : 'text-purple-400'}>{i + 1}. {c.title}</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">{c.desc}</span></p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S10 — Game */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Test Your Understanding</p>
          <h2 className="text-2xl font-extrabold mb-2">Strategy Diagnosis Game</h2>
          <p className="text-gray-400 text-sm mb-6">5 scenarios. Find the missing or broken component.</p>
          <div className="p-6 rounded-2xl glass-card">
            <div className="flex items-center justify-between mb-4"><span className="text-xs font-bold text-amber-400">Round {gameRound + 1} of {gameRounds.length}</span><span className="text-xs font-mono text-gray-500">{gameScore}/{gameRounds.length} correct</span></div>
            <p className="text-sm text-gray-300 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: gameRounds[gameRound].scenario }} />
            <div className="space-y-2">
              {gameRounds[gameRound].options.map((opt, oi) => {
                const answered = gameAnswers[gameRound] !== null; const selected = gameAnswers[gameRound] === oi; const isCorrect = opt.correct;
                let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]';
                if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30';
                if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30';
                if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20';
                return (<div key={oi}><button onClick={() => handleGameAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt.text }} /></button>{answered && selected && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]"><p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`} dangerouslySetInnerHTML={{ __html: `${isCorrect ? '✓' : '✗'} ${opt.explain}` }} /></motion.div>)}</div>);
              })}
            </div>
            {gameAnswers[gameRound] !== null && gameRound < gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5"><button onClick={() => setGameRound(r => r + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button></motion.div>)}
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Excellent — you can diagnose strategy problems like a pro.' : gameScore >= 3 ? 'Solid — review the 7 components to sharpen your diagnostic eye.' : 'Re-read the components section and try to identify which piece is missing in each scenario.'}</p></motion.div>)}
          </div>
        </motion.div>
      </section>

      {/* S11 — Quiz + Certificate */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Knowledge Check</p>
          <h2 className="text-2xl font-extrabold mb-6">Final Quiz &mdash; 8 Questions</h2>
          <div className="space-y-6">
            {quizQuestions.map((q, qi) => (
              <div key={qi} className="p-5 rounded-2xl glass-card">
                <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p>
                <p className="text-sm font-semibold text-white mb-4" dangerouslySetInnerHTML={{ __html: q.q }} />
                <div className="space-y-2">
                  {q.opts.map((opt, oi) => { const answered = quizAnswers[qi] !== null; const selected = quizAnswers[qi] === oi; const isCorrect = oi === q.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return <button key={oi} onClick={() => handleQuizAnswer(qi, oi)} disabled={answered} className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`} dangerouslySetInnerHTML={{ __html: opt }} />; })}
                </div>
                {quizAnswers[qi] !== null && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg bg-white/[0.02]"><p className="text-xs text-amber-400" dangerouslySetInnerHTML={{ __html: `<span class="font-bold">&#9989;</span> ${q.explain}` }} /></motion.div>)}
              </div>
            ))}
          </div>
          {quizDone && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center"><p className="text-3xl font-extrabold mb-2">{quizScore}%</p><p className="text-sm text-gray-400">{quizScore >= 66 ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate. Review and try again.'}</p></motion.div>)}
          {certUnlocked && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10">
              <div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(139,92,246,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
                <div className="relative z-10 text-center">
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">🏗️</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 6: The Anatomy of a Strategy</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Strategy Architect &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L6.1-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </section>

      <section className="max-w-2xl mx-auto px-5 py-20 text-center">
        <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">&larr; Back to Academy</Link>
      </section>
    </div>
  );
}
