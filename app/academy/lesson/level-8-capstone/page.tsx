// app/academy/lesson/level-8-capstone/page.tsx
// ATLAS Academy — Lesson 8.14: Your Macro Playbook — Capstone [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 8 · CAPSTONE
// GROUNDBREAKING: Complete Macro Playbook Builder — 6 interactive sections with progress tracking
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
const conceptNodes = [
  { label: 'Calendar', emoji: '📅', color: '#3b82f6' },
  { label: 'Rates', emoji: '🏦', color: '#8b5cf6' },
  { label: 'Inflation', emoji: '📊', color: '#ef4444' },
  { label: 'Employment', emoji: '📈', color: '#22c55e' },
  { label: 'GDP/PMI', emoji: '🔄', color: '#06b6d4' },
  { label: 'Geo Risk', emoji: '🛡️', color: '#f97316' },
  { label: 'Correlations', emoji: '🔗', color: '#ec4899' },
  { label: 'Intermarket', emoji: '🌐', color: '#14b8a6' },
  { label: 'Sentiment', emoji: '🧠', color: '#a855f7' },
  { label: 'News', emoji: '⚡', color: '#eab308' },
];

const workflowSteps = [
  { day: 'Sunday', time: '3 min', action: 'Scan calendar, mark danger days, set weekly bias', color: '#3b82f6' },
  { day: 'Pre-Session', time: '2 min', action: '5-question macro check: Events? DXY? VIX? Correlations? Sentiment?', color: '#8b5cf6' },
  { day: 'Before Entry', time: '30 sec', action: 'Confirm macro bias aligns with technical setup', color: '#22c55e' },
  { day: 'During Event', time: 'N/A', action: 'No new trades. Manage existing per pre-defined rules', color: '#ef4444' },
  { day: 'After Event', time: '5 min', action: 'Assess deviation, update bias, enter if T+15 confirms', color: '#f97316' },
  { day: 'Friday PM', time: '5 min', action: 'Gap test all positions, close losers, trail winners', color: '#ec4899' },
  { day: 'Weekly Review', time: '10 min', action: 'Score macro calls, adjust playbook, improve one thing', color: '#eab308' },
];

const lessonSummary = [
  { num: '8.1', title: 'Why Technicals Alone Aren\'t Enough', takeaway: 'Same setup: 72% WR quiet day, 18% during FOMC. Macro context is the weather forecast.', color: '#3b82f6' },
  { num: '8.2', title: 'The Economic Calendar', takeaway: 'Sunday ritual + deviation rules = your weekly flight plan. 3 minutes saves 2+ losing trades/month.', color: '#8b5cf6' },
  { num: '8.3', title: 'Interest Rates & Central Banks', takeaway: 'Don\'t fight central banks. Press conference moves more than the decision. Track language shifts.', color: '#ef4444' },
  { num: '8.4', title: 'Inflation Data (CPI & PPI)', takeaway: 'Core over headline. PPI leads CPI. Wait T+15. Trade the deviation, trend for the month.', color: '#22c55e' },
  { num: '8.5', title: 'Employment Data (NFP)', takeaway: 'The trifecta: wages first, jobs second, unemployment third. Conflicting data = no trade.', color: '#06b6d4' },
  { num: '8.6', title: 'GDP, PMI & Leading Indicators', takeaway: 'PMI leads, GDP lags. The 50-line matters. Yield curve inversion predicts every recession.', color: '#f97316' },
  { num: '8.7', title: 'Geopolitical Risk', takeaway: 'Can\'t predict, CAN survive. VIX + Gold + Bonds = the 3-asset reality check. Proportional response.', color: '#ec4899' },
  { num: '8.8', title: 'Currency Correlations', takeaway: 'EUR + GBP = 0.88 correlation. Two trades on the same pair is doubled risk, not diversification.', color: '#a855f7' },
  { num: '8.9', title: 'Intermarket Analysis', takeaway: 'Bonds lead, equities follow, commodities confirm. When relationships break, reduce size.', color: '#14b8a6' },
  { num: '8.10', title: 'Building a Macro Bias', takeaway: 'Macro → Technical → Trigger. 2-minute pre-session scan. Both agree = full size. Conflict = skip.', color: '#eab308' },
  { num: '8.11', title: 'News Trading Strategies', takeaway: 'Avoid, Ride, or Fade — decided BEFORE the data. T+15 entry window. Write the plan, follow the plan.', color: '#3b82f6' },
  { num: '8.12', title: 'Risk Management Around Events', takeaway: 'Event risk budget. Stop vs expected range test. Friday gap survival ritual. Correlation tax.', color: '#ef4444' },
  { num: '8.13', title: 'Sentiment & Positioning', takeaway: 'When everyone agrees, the market is about to disagree. COT + retail + VIX = the contrarian trinity.', color: '#a855f7' },
];

const overrideRules = [
  { macro: 'Tailwind', tech: 'Bullish', sizing: 'Full size (1R)', verdict: 'TRADE', color: '#22c55e' },
  { macro: 'Tailwind', tech: 'Bearish', sizing: 'Skip — don\'t counter macro', verdict: 'SKIP', color: '#ef4444' },
  { macro: 'Neutral', tech: 'Bullish', sizing: 'Normal size (0.75R)', verdict: 'TRADE', color: '#22c55e' },
  { macro: 'Headwind', tech: 'Bullish', sizing: 'Half size (0.5R)', verdict: 'REDUCED', color: '#f59e0b' },
  { macro: 'Headwind', tech: 'Bearish', sizing: 'Skip session entirely', verdict: 'SKIP', color: '#ef4444' },
  { macro: 'Tier 1 &lt;2h', tech: 'Any', sizing: 'Flatten all positions', verdict: 'FLATTEN', color: '#ef4444' },
];

const commonMistakes = [
  { title: 'Over-Complicating the Process', mistake: 'Tracking 15 indicators, 8 correlations, 4 sentiment sources, 3 yield curves before every trade. Analysis paralysis disguised as thoroughness.', fix: '5 questions, 2 minutes, done. Calendar + DXY + VIX + correlations + sentiment. That\'s the entire pre-session check. If it takes more than 2 minutes, you\'re over-engineering.' },
  { title: 'Abandoning Technicals for Macro', mistake: '"But the macro is bullish!" — entering a trade with no technical trigger because the fundamental story sounds compelling. Macro without technicals = guessing with extra steps.', fix: 'Macro is the weather, technicals are the map, trigger is the green light. You need ALL THREE. Macro alone never justifies an entry.' },
  { title: 'Analysis Paralysis on News Days', mistake: 'Spending 3 hours reading previews, watching analysts, checking 12 sources before CPI. By the time the data drops, you\'re mentally exhausted and too scared to execute your plan.', fix: 'Your plan was written on Sunday. Your pre-session scan took 2 minutes. When data drops, you have 3 scenarios already written. Execute the one that matches. No live analysis needed.' },
  { title: 'No Written Playbook', mistake: 'Keeping it all in your head. "I\'ll remember to check DXY before trading." You won\'t. Especially not when your last trade was a loss and you\'re emotional.', fix: 'Write it down. Print it. Pin it next to your screen. A playbook you don\'t write down is a playbook that doesn\'t exist when it matters most.' },
];

const gameRounds = [
  { scenario: '<strong>Sunday Planning:</strong> This week\'s calendar shows CPI on Wednesday, FOMC on Thursday. Your sentiment scan shows retail 74% long EUR/USD, VIX at 19. Your technical bias from Friday\'s close was bearish EUR/USD. You need to plan your week.', options: [
    { text: 'Trade normally Monday-Tuesday, skip Wednesday-Thursday, review Friday', correct: false, explain: 'Close — but you\'re ignoring the contrarian sentiment signal (retail 74% long supports your bearish bias). Also, Friday should be gap-test day, not just review.' },
    { text: 'Mark Wed+Thu as red days (flatten before CPI), trade Mon-Tue with bearish bias (macro+sentiment aligned), Friday = gap test + weekly review', correct: true, explain: 'Perfect Sunday plan. Bearish technical + risk-off undertone + retail contrarian signal all align. CPI/FOMC are flatten days. Monday-Tuesday have full conviction. Friday is the ritual.' },
    { text: 'Skip the entire week — too many high-impact events', correct: false, explain: 'Over-cautious. Monday and Tuesday are clean trading days. The events cluster Wed-Thu only. Avoiding the whole week wastes 2 good trading days.' },
  ]},
  { scenario: '<strong>Pre-Session Check (Tuesday 08:00):</strong> You run your 2-minute scan. Calendar: clear today, CPI tomorrow. DXY: up 0.3% (supports your bearish EUR bias). VIX: 18 (calm). Correlations: GBP/USD also falling (confirms USD strength). Sentiment: retail now 76% long EUR/USD. All 5 inputs are green for your bearish EUR/USD bias.', options: [
    { text: 'Trade with reduced size — CPI is tomorrow so risk should be lower', correct: false, explain: 'CPI is tomorrow, not today. Today\'s session is clean. Reducing size on a perfect-alignment day because of tomorrow\'s event is pre-worrying, not risk management.' },
    { text: 'Full conviction entry — all 5 macro inputs align with technical bias. This is a green-light session.', correct: true, explain: 'Exactly right. Every macro input confirms your bias. Calendar is clean TODAY. CPI is tomorrow\'s problem. When everything aligns, trade with full conviction. That\'s the whole point of the 2-minute scan — to identify these days.' },
    { text: 'Wait until after CPI tomorrow for more confirmation', correct: false, explain: 'Waiting for CPI means missing a perfect-alignment trading day. Your plan handles tomorrow separately. Today stands alone as a high-conviction session.' },
  ]},
  { scenario: '<strong>Wednesday Post-CPI:</strong> CPI came in hot (+0.4% vs +0.3% forecast). USD surged, EUR/USD dropped 75 pips in 20 minutes. Your Sunday bearish bias was validated. It\'s now T+25 minutes. Price has pulled back 20 pips from the low. Your technical analysis shows a bearish FVG on the 15-minute chart.', options: [
    { text: 'Enter short immediately — CPI confirmed your bias and there\'s a technical FVG', correct: false, explain: 'The setup looks right, but you have FOMC tomorrow. Even though CPI validated your bias, entering now means holding through FOMC. Your risk management rules say: flatten before Tier 1 events within 24 hours.' },
    { text: 'Enter short with tight stop and plan to close before FOMC tomorrow morning', correct: true, explain: 'Smart. The CPI data + FVG alignment is strong, and entering at T+25 is past the 15-minute window. The key discipline: close BEFORE FOMC regardless of P&L. You\'re trading today\'s data, not gambling on tomorrow\'s decision.' },
    { text: 'Skip — FOMC tomorrow makes this too risky', correct: false, explain: 'Overly cautious. The CPI trade is a same-day opportunity. You can enter and close before FOMC. Skipping a confirmed macro+technical alignment because of tomorrow\'s event wastes the preparation you did on Sunday.' },
  ]},
  { scenario: '<strong>Thursday FOMC Day (14:00):</strong> You\'re flat (closed yesterday\'s CPI trade at +1.2R this morning). Fed decision at 19:00, press conference at 19:30. A beautiful bearish Order Block has formed on EUR/USD 1H chart at 14:15. Your macro bias is still bearish. The setup is textbook.', options: [
    { text: 'Enter short — macro bias is confirmed and the OB is textbook', correct: false, explain: 'This is the FOMC trap. The setup is real, but any position opened now will be held through the rate decision. Even a bearish Fed can produce a whipsaw that stops you out before moving your direction. Tier 1 event &lt;5 hours away = no new positions.' },
    { text: 'No new trades. Tier 1 event within 5 hours = flatten rule. Note the OB level for potential post-FOMC re-entry if bias holds.', correct: true, explain: 'Discipline over temptation. The OB will still be there after FOMC (or the market will give you a better one). Note the level, wait for the event, reassess at T+15 after the press conference. Your Sunday plan said "flatten before FOMC" — follow it.' },
    { text: 'Enter with half size as a compromise', correct: false, explain: 'Half the size doesn\'t change the fact that FOMC can move EUR/USD 100+ pips in seconds. A 50-pip stop at half size still risks the same emotional damage if FOMC whipsaws. The rule is binary: Tier 1 within hours = no new trades.' },
  ]},
  { scenario: '<strong>Friday Weekly Review:</strong> Your week: Monday +0.8R, Tuesday +1.4R (full conviction day), Wednesday +1.2R (CPI trade), Thursday no trades (FOMC discipline), Friday no new trades (gap test passed, positions trailed). Weekly total: +3.4R. You had 3 winning macro-aligned trades and 0 macro-conflict trades. Macro calls: bearish bias was correct all week. Sentiment contrarian signal (retail 76% long) was confirmed by the 180-pip drop.', options: [
    { text: 'Great week, nothing to improve. Same plan next week.', correct: false, explain: 'Every week has something to improve. Even at +3.4R. Could the Tuesday entry have been optimised? Was the CPI close timing ideal? Did you feel tempted on FOMC day? The review process is HOW you compound skill, not just profits.' },
    { text: 'Score each macro input (calendar: correct, DXY: correct, sentiment: correct), identify one improvement (e.g., "add PPI as a CPI preview signal"), update playbook, plan next week\'s calendar.', correct: true, explain: 'This is how professional traders compound. Score the process, not just the outcome. +3.4R is great, but identifying that PPI could have CONFIRMED your CPI bias earlier is how +3.4R weeks become +4R weeks. One improvement per week = 52 improvements per year.' },
    { text: 'Focus on the missed FOMC opportunity — could have made +2R more if you\'d traded it', correct: false, explain: 'Dangerous thinking. Your +3.4R week happened BECAUSE of discipline, including skipping FOMC. Reviewing what you "missed" by following rules trains your brain to break rules. Review what you DID, not what you didn\'t.' },
  ]},
];

const quizQuestions = [
  { q: 'What is the 3-layer bias stack, in order?', opts: ['Technical → Macro → Trigger', 'Macro → Technical → Trigger', 'Trigger → Technical → Macro', 'Sentiment → Macro → Technical'], correct: 1, explain: 'Macro first (the weather), Technical second (the map), Trigger last (the green light). Always in this order. Macro sets boundaries, technicals find setups within those boundaries, triggers execute.' },
  { q: 'How long should your daily pre-session macro scan take?', opts: ['10-15 minutes', '5-8 minutes', 'About 2 minutes', '30+ minutes for thorough analysis'], correct: 2, explain: '2 minutes. 5 questions at ~20 seconds each: Events today? DXY direction? VIX level? Correlations agree? Risk sentiment? Done. Open charts. If it takes longer, you\'re over-engineering.' },
  { q: 'When macro bias conflicts with your technical setup, what should you do?', opts: ['Trust technicals — the chart never lies', 'Always follow macro — fundamentals override', 'Reduce position size or skip the trade entirely', 'Enter with a wider stop loss'], correct: 2, explain: 'Conflict = reduced conviction. Either trade at half size or skip entirely. Never full-size into a macro headwind. The data shows 74% WR with tailwind vs 38% against — that 36% gap is real.' },
  { q: 'What are the Big 3 inputs for the pre-session scan?', opts: ['GDP, PMI, and CPI', 'Calendar events, DXY direction, and VIX level', 'COT data, retail sentiment, and social media', 'Bond yields, oil price, and equity futures'], correct: 1, explain: 'Calendar (what\'s happening), DXY (the master variable), VIX (the fear gauge). These 3 alone cover 80% of your macro context. Correlations and sentiment complete the picture.' },
  { q: 'When retail sentiment reaches 75%+ on one side, what does this signal?', opts: ['Strong trend confirmation — join the crowd', 'Contrarian alert — the crowd is usually wrong at extremes', 'No signal — sentiment is unreliable', 'Exit all positions immediately'], correct: 1, explain: 'Contrarian alert. When 75%+ of retail is on one side, the market historically reverses. This doesn\'t mean enter immediately — it means your conviction INCREASES if your technical bias opposes the retail crowd.' },
  { q: 'How much total time per week does the complete macro workflow require?', opts: ['About 2 hours', 'About 25 minutes', 'About 45 minutes', 'About 10 minutes'], correct: 1, explain: '~25 minutes total: Sunday scan (3 min) + daily pre-session (2 min × 5 days = 10 min) + event management (~5 min) + Friday ritual (5 min) + weekly review (10 min). Less time than one losing trade costs you.' },
  { q: 'Why is a WRITTEN macro playbook essential?', opts: ['It impresses other traders', 'Because memory fails under pressure — rules only work when they\'re documented', 'It\'s required by prop firms', 'To track your P&amp;L more accurately'], correct: 1, explain: 'A playbook in your head is a playbook that disappears when you\'re emotional. After a losing trade, you won\'t "remember to check DXY." After a winning streak, you\'ll skip the Sunday scan. Written rules survive the moments when discipline matters most.' },
  { q: 'What is the single most important lesson from Level 8?', opts: ['Macro is more important than technicals', 'Every economic indicator must be checked daily', 'Macro context turns the same technical setup from 72% to 18% win rate — check before you trade', 'News trading is the most profitable strategy'], correct: 2, explain: 'The same Order Block, same candles, same structure — 72% WR on a quiet day, 18% during FOMC. The chart didn\'t change. The context did. 2 minutes of macro checking before each session is the highest-ROI habit in trading.' },
];

/* ─── PLAYBOOK BUILDER TYPES ─── */
type PlaybookData = {
  watchlist: { instruments: string[]; tier1Events: string[]; tier2Events: string[]; calendarSource: string };
  preSession: { q1: string; q2: string; q3: string; q4: string; q5: string };
  newsRules: { tier1Default: string; tier2Default: string; approach: string; planTemplate: string };
  correlationAlerts: { pairs: string[]; riskRule: string; dxyRule: string };
  riskRules: { eventBudget: string; fridayRule: string; gapTest: string };
  weeklyReview: { reviewDay: string; questions: string[]; monthlyFocus: string };
};

const defaultPlaybook: PlaybookData = {
  watchlist: { instruments: [], tier1Events: [], tier2Events: [], calendarSource: '' },
  preSession: { q1: 'Any high-impact events today?', q2: 'What is DXY doing?', q3: 'VIX level — calm, elevated, or fear?', q4: 'Are my correlated pairs confirming?', q5: 'Overall risk sentiment?' },
  newsRules: { tier1Default: '', tier2Default: '', approach: '', planTemplate: '' },
  correlationAlerts: { pairs: [], riskRule: '', dxyRule: '' },
  riskRules: { eventBudget: '', fridayRule: '', gapTest: '' },
  weeklyReview: { reviewDay: '', questions: [], monthlyFocus: '' },
};

export default function Level8Capstone() {
  const [scrollY, setScrollY] = useState(0);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [gameRound, setGameRound] = useState(0);
  const [gameAnswers, setGameAnswers] = useState<(number | null)[]>(Array(gameRounds.length).fill(null));
  const [gameScore, setGameScore] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(Array(quizQuestions.length).fill(null));
  const [showConfetti, setShowConfetti] = useState(false);
  const [certUnlocked, setCertUnlocked] = useState(false);
  const [pbSection, setPbSection] = useState(0);
  const [playbook, setPlaybook] = useState<PlaybookData>(defaultPlaybook);
  const [pbSummary, setPbSummary] = useState(false);

  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);
  const toggle = (id: string) => setOpenSections(s => ({ ...s, [id]: !s[id] }));

  const handleGameAnswer = (oi: number) => { if (gameAnswers[gameRound] !== null) return; const a = [...gameAnswers]; a[gameRound] = oi; setGameAnswers(a); if (gameRounds[gameRound].options[oi].correct) setGameScore(s => s + 1); };
  const handleQuizAnswer = (qi: number, oi: number) => { if (quizAnswers[qi] !== null) return; const a = [...quizAnswers]; a[qi] = oi; setQuizAnswers(a); };

  const quizDone = quizAnswers.every(a => a !== null);
  const quizScoreVal = quizDone ? Math.round(quizAnswers.reduce<number>((s, a, i) => s + (a === quizQuestions[i].correct ? 1 : 0), 0) / quizQuestions.length * 100) : 0;
  useEffect(() => { if (quizDone && quizScoreVal >= 66 && !certUnlocked) { setCertUnlocked(true); setShowConfetti(true); const t = setTimeout(() => setShowConfetti(false), 4000); return () => clearTimeout(t); } }, [quizDone, quizScoreVal, certUnlocked]);

  /* Playbook progress */
  const pbProgress = (() => {
    let filled = 0; let total = 6;
    if (playbook.watchlist.instruments.length > 0 && playbook.watchlist.tier1Events.length > 0 && playbook.watchlist.calendarSource) filled++;
    if (playbook.preSession.q1 && playbook.preSession.q2 && playbook.preSession.q3 && playbook.preSession.q4 && playbook.preSession.q5) filled++;
    if (playbook.newsRules.tier1Default && playbook.newsRules.approach) filled++;
    if (playbook.correlationAlerts.pairs.length > 0 && playbook.correlationAlerts.riskRule) filled++;
    if (playbook.riskRules.eventBudget && playbook.riskRules.fridayRule) filled++;
    if (playbook.weeklyReview.reviewDay && playbook.weeklyReview.questions.length > 0) filled++;
    return Math.round((filled / total) * 100);
  })();

  /* ─── DRAW FUNCTIONS ─── */
  const drawMacroMap = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(cx, cy) - 40;
    const cycle = f % 300;
    const activeIdx = Math.floor(cycle / 30) % 10;
    // Hub
    ctx.beginPath(); ctx.arc(cx, cy, 28, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(245, 158, 11, 0.15)'; ctx.fill();
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#f59e0b'; ctx.font = 'bold 9px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('MACRO', cx, cy - 5); ctx.fillText('BIAS', cx, cy + 7);
    // Nodes
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
      const nx = cx + Math.cos(angle) * radius;
      const ny = cy + Math.sin(angle) * radius;
      const isActive = i === activeIdx;
      const alpha = isActive ? 1 : 0.35;
      // Connection line
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(nx, ny);
      ctx.strokeStyle = isActive ? conceptNodes[i].color : `rgba(255,255,255,0.08)`;
      ctx.lineWidth = isActive ? 2 : 1; ctx.stroke();
      // Node circle
      ctx.beginPath(); ctx.arc(nx, ny, isActive ? 20 : 14, 0, Math.PI * 2);
      ctx.fillStyle = isActive ? conceptNodes[i].color + '33' : 'rgba(255,255,255,0.04)';
      ctx.fill();
      ctx.strokeStyle = conceptNodes[i].color; ctx.globalAlpha = alpha; ctx.lineWidth = isActive ? 2 : 1; ctx.stroke(); ctx.globalAlpha = 1;
      // Label
      ctx.fillStyle = isActive ? '#fff' : 'rgba(255,255,255,0.4)';
      ctx.font = `${isActive ? 'bold ' : ''}${isActive ? 9 : 8}px system-ui`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(conceptNodes[i].label, nx, ny);
    }
    // Active label
    if (activeIdx < 10) {
      ctx.fillStyle = conceptNodes[activeIdx].color; ctx.font = 'bold 11px system-ui';
      ctx.textAlign = 'center'; ctx.fillText(`${conceptNodes[activeIdx].emoji} ${conceptNodes[activeIdx].label} → MACRO BIAS`, cx, h - 12);
    }
  }, []);

  const drawWorkflow = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const cx = w / 2;
    const cy = h / 2;
    const cycle = f % 350;
    const activeIdx = Math.floor(cycle / 50) % 7;
    const stepW = (w - 40) / 7;
    const baseY = cy - 10;
    // Timeline bar
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(20, baseY + 12, w - 40, 4);
    // Progress fill
    const progressW = ((activeIdx + 1) / 7) * (w - 40);
    const grad = ctx.createLinearGradient(20, 0, 20 + progressW, 0);
    grad.addColorStop(0, '#f59e0b'); grad.addColorStop(1, '#d946ef');
    ctx.fillStyle = grad; ctx.fillRect(20, baseY + 12, progressW, 4);
    // Steps
    for (let i = 0; i < 7; i++) {
      const sx = 20 + stepW * i + stepW / 2;
      const isActive = i === activeIdx;
      const isPast = i < activeIdx;
      // Dot
      ctx.beginPath(); ctx.arc(sx, baseY + 14, isActive ? 8 : 5, 0, Math.PI * 2);
      ctx.fillStyle = isActive ? workflowSteps[i].color : isPast ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.15)';
      ctx.fill();
      // Day label
      ctx.fillStyle = isActive ? '#fff' : 'rgba(255,255,255,0.4)';
      ctx.font = `${isActive ? 'bold ' : ''}${isActive ? 10 : 8}px system-ui`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText(workflowSteps[i].day, sx, baseY - 2);
      // Time badge
      if (isActive) {
        ctx.fillStyle = workflowSteps[i].color; ctx.font = 'bold 9px system-ui';
        ctx.textBaseline = 'top'; ctx.fillText(workflowSteps[i].time, sx, baseY + 28);
      }
    }
    // Active action text
    if (activeIdx < 7) {
      ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = '9px system-ui';
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      const actionText = workflowSteps[activeIdx].action;
      // Wrap text
      const maxW = w - 60;
      if (ctx.measureText(actionText).width > maxW) {
        const words = actionText.split(' ');
        let line = ''; let ly = h - 24;
        const lines: string[] = [];
        for (const word of words) {
          const test = line + (line ? ' ' : '') + word;
          if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = word; } else { line = test; }
        }
        if (line) lines.push(line);
        ly = h - 8 - lines.length * 12;
        for (const l of lines) { ctx.fillText(l, cx, ly); ly += 12; }
      } else {
        ctx.fillText(actionText, cx, h - 12);
      }
    }
    // Total time
    ctx.fillStyle = 'rgba(245,158,11,0.6)'; ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'right'; ctx.textBaseline = 'top'; ctx.fillText('Total: ~25 min/week', w - 20, 8);
  }, []);

  /* ─── PLAYBOOK BUILDER UI ─── */
  const pbSections = ['Event Watchlist', 'Pre-Session Checklist', 'News Response Rules', 'Correlation Alerts', 'Risk Adjustment Rules', 'Weekly Review'];
  const instrumentOptions = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'XAUUSD', 'NASDAQ', 'US30', 'AUD/USD', 'USD/CAD'];
  const tier1Options = ['NFP', 'CPI', 'FOMC', 'ECB Rate Decision', 'BOE Rate Decision'];
  const tier2Options = ['PPI', 'GDP', 'PMI (ISM)', 'Retail Sales', 'Jobless Claims', 'Consumer Confidence'];
  const calendarOptions = ['Forex Factory', 'Investing.com', 'TradingView Calendar', 'Myfxbook'];
  const approachOptions = ['Avoid (sit out entirely)', 'Ride (T+15 continuation)', 'Fade (small deviations only)'];
  const reviewDayOptions = ['Friday Afternoon', 'Saturday Morning', 'Sunday Evening'];

  const toggleInArray = (arr: string[], item: string) => arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];

  const renderPbSection = () => {
    const inputCls = 'w-full p-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/40';
    const chipCls = (active: boolean) => `px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${active ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400' : 'bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:bg-white/[0.07]'}`;

    switch (pbSection) {
      case 0: return (<div className="space-y-4">
        <div><p className="text-xs text-amber-400 font-bold mb-2">Instruments I Trade</p><div className="flex flex-wrap gap-2">{instrumentOptions.map(i => (<button key={i} onClick={() => setPlaybook(p => ({ ...p, watchlist: { ...p.watchlist, instruments: toggleInArray(p.watchlist.instruments, i) } }))} className={chipCls(playbook.watchlist.instruments.includes(i))}>{i}</button>))}</div></div>
        <div><p className="text-xs text-amber-400 font-bold mb-2">Tier 1 Events I Track</p><div className="flex flex-wrap gap-2">{tier1Options.map(i => (<button key={i} onClick={() => setPlaybook(p => ({ ...p, watchlist: { ...p.watchlist, tier1Events: toggleInArray(p.watchlist.tier1Events, i) } }))} className={chipCls(playbook.watchlist.tier1Events.includes(i))}>{i}</button>))}</div></div>
        <div><p className="text-xs text-amber-400 font-bold mb-2">Tier 2 Events I Track</p><div className="flex flex-wrap gap-2">{tier2Options.map(i => (<button key={i} onClick={() => setPlaybook(p => ({ ...p, watchlist: { ...p.watchlist, tier2Events: toggleInArray(p.watchlist.tier2Events, i) } }))} className={chipCls(playbook.watchlist.tier2Events.includes(i))}>{i}</button>))}</div></div>
        <div><p className="text-xs text-amber-400 font-bold mb-2">My Calendar Source</p><div className="flex flex-wrap gap-2">{calendarOptions.map(i => (<button key={i} onClick={() => setPlaybook(p => ({ ...p, watchlist: { ...p.watchlist, calendarSource: i } }))} className={chipCls(playbook.watchlist.calendarSource === i)}>{i}</button>))}</div></div>
      </div>);
      case 1: return (<div className="space-y-3">
        <p className="text-xs text-gray-400">Customise your 5 daily pre-session questions (defaults provided):</p>
        {(['q1','q2','q3','q4','q5'] as const).map((k, i) => (<div key={k}><p className="text-xs text-amber-400/60 mb-1">Question {i + 1}</p><input value={playbook.preSession[k]} onChange={e => setPlaybook(p => ({ ...p, preSession: { ...p.preSession, [k]: e.target.value } }))} className={inputCls} /></div>))}
      </div>);
      case 2: return (<div className="space-y-4">
        <div><p className="text-xs text-amber-400 font-bold mb-2">Tier 1 Event Default Strategy</p><div className="flex flex-wrap gap-2">{['Flatten all positions', 'Reduce to 50%', 'Hold if stop is wide enough'].map(i => (<button key={i} onClick={() => setPlaybook(p => ({ ...p, newsRules: { ...p.newsRules, tier1Default: i } }))} className={chipCls(playbook.newsRules.tier1Default === i)}>{i}</button>))}</div></div>
        <div><p className="text-xs text-amber-400 font-bold mb-2">Tier 2 Event Default Strategy</p><div className="flex flex-wrap gap-2">{['Reduce risk 50%', 'Hold with awareness', 'Tighten stop to breakeven'].map(i => (<button key={i} onClick={() => setPlaybook(p => ({ ...p, newsRules: { ...p.newsRules, tier2Default: i } }))} className={chipCls(playbook.newsRules.tier2Default === i)}>{i}</button>))}</div></div>
        <div><p className="text-xs text-amber-400 font-bold mb-2">My Default Post-News Approach</p><div className="flex flex-wrap gap-2">{approachOptions.map(i => (<button key={i} onClick={() => setPlaybook(p => ({ ...p, newsRules: { ...p.newsRules, approach: i } }))} className={chipCls(playbook.newsRules.approach === i)}>{i}</button>))}</div></div>
        <div><p className="text-xs text-amber-400 font-bold mb-2">My News Plan Template</p><textarea value={playbook.newsRules.planTemplate} onChange={e => setPlaybook(p => ({ ...p, newsRules: { ...p.newsRules, planTemplate: e.target.value } }))} placeholder="e.g., If beats forecast: short EUR/USD at T+15 with 30-pip stop, 60-pip target..." rows={3} className={inputCls} /></div>
      </div>);
      case 3: return (<div className="space-y-4">
        <div><p className="text-xs text-amber-400 font-bold mb-2">My Correlated Pairs to Monitor</p><div className="flex flex-wrap gap-2">{['EUR/USD + GBP/USD', 'XAUUSD + DXY (inverse)', 'USD/JPY + US10Y', 'AUD/USD + Copper', 'USD/CAD + Oil (inverse)', 'NASDAQ + Risk Sentiment'].map(i => (<button key={i} onClick={() => setPlaybook(p => ({ ...p, correlationAlerts: { ...p.correlationAlerts, pairs: toggleInArray(p.correlationAlerts.pairs, i) } }))} className={chipCls(playbook.correlationAlerts.pairs.includes(i))}>{i}</button>))}</div></div>
        <div><p className="text-xs text-amber-400 font-bold mb-2">My Correlation Risk Rule</p><input value={playbook.correlationAlerts.riskRule} onChange={e => setPlaybook(p => ({ ...p, correlationAlerts: { ...p.correlationAlerts, riskRule: e.target.value } }))} placeholder="e.g., Never hold 2 positions with correlation > 0.7 at the same time" className={inputCls} /></div>
        <div><p className="text-xs text-amber-400 font-bold mb-2">My DXY Confirmation Rule</p><input value={playbook.correlationAlerts.dxyRule} onChange={e => setPlaybook(p => ({ ...p, correlationAlerts: { ...p.correlationAlerts, dxyRule: e.target.value } }))} placeholder="e.g., Always check DXY direction before any USD pair trade" className={inputCls} /></div>
      </div>);
      case 4: return (<div className="space-y-4">
        <div><p className="text-xs text-amber-400 font-bold mb-2">My Event Risk Budget</p><div className="flex flex-wrap gap-2">{['Max 1.5% exposed to any single event', 'Max 3% exposed to any single event', 'Max 5% exposed to any single event', 'Flatten before all Tier 1 events'].map(i => (<button key={i} onClick={() => setPlaybook(p => ({ ...p, riskRules: { ...p.riskRules, eventBudget: i } }))} className={chipCls(playbook.riskRules.eventBudget === i)}>{i}</button>))}</div></div>
        <div><p className="text-xs text-amber-400 font-bold mb-2">My Friday Afternoon Rule</p><div className="flex flex-wrap gap-2">{['Close all positions before weekend', 'Trail winners, close losers', 'Hold only if stop survives 200-pip gap', 'Reduce all to 50% size'].map(i => (<button key={i} onClick={() => setPlaybook(p => ({ ...p, riskRules: { ...p.riskRules, fridayRule: i } }))} className={chipCls(playbook.riskRules.fridayRule === i)}>{i}</button>))}</div></div>
        <div><p className="text-xs text-amber-400 font-bold mb-2">My Gap Survival Test</p><input value={playbook.riskRules.gapTest} onChange={e => setPlaybook(p => ({ ...p, riskRules: { ...p.riskRules, gapTest: e.target.value } }))} placeholder="e.g., If my stop is < 1.5x the average weekend gap for this pair, close before Friday" className={inputCls} /></div>
      </div>);
      case 5: return (<div className="space-y-4">
        <div><p className="text-xs text-amber-400 font-bold mb-2">My Weekly Review Day</p><div className="flex flex-wrap gap-2">{reviewDayOptions.map(i => (<button key={i} onClick={() => setPlaybook(p => ({ ...p, weeklyReview: { ...p.weeklyReview, reviewDay: i } }))} className={chipCls(playbook.weeklyReview.reviewDay === i)}>{i}</button>))}</div></div>
        <div><p className="text-xs text-amber-400 font-bold mb-2">My Review Questions</p><div className="flex flex-wrap gap-2">{['Was my macro bias correct this week?', 'Did I follow my pre-session scan every day?', 'Did I respect event risk rules?', 'Were my correlation checks accurate?', 'What one thing can I improve next week?', 'Did I stick to my news response plan?'].map(i => (<button key={i} onClick={() => setPlaybook(p => ({ ...p, weeklyReview: { ...p.weeklyReview, questions: toggleInArray(p.weeklyReview.questions, i) } }))} className={chipCls(playbook.weeklyReview.questions.includes(i))}>{i}</button>))}</div></div>
        <div><p className="text-xs text-amber-400 font-bold mb-2">This Month&apos;s Improvement Focus</p><input value={playbook.weeklyReview.monthlyFocus} onChange={e => setPlaybook(p => ({ ...p, weeklyReview: { ...p.weeklyReview, monthlyFocus: e.target.value } }))} placeholder="e.g., Getting better at reading CPI deviations and their impact on Gold" className={inputCls} /></div>
      </div>);
      default: return null;
    }
  };

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      <Confetti active={showConfetti} />
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-white/5"><motion.div className="h-full bg-gradient-to-r from-amber-500 to-accent-500" style={{ width: `${Math.min((scrollY / (typeof document !== 'undefined' ? document.body.scrollHeight - window.innerHeight : 1)) * 100, 100)}%` }} /></div>
      {/* Nav */}
      <nav className="fixed top-1 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-5 py-2 rounded-2xl border border-white/[0.06]" style={{ background: 'rgba(6,10,18,0.85)', backdropFilter: 'blur(16px)' }}>
        <Link href="/academy" className="text-xs font-bold tracking-widest bg-gradient-to-r from-amber-400 to-purple-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>ATLAS ACADEMY</Link>
        <Crown className="w-3.5 h-3.5 text-amber-500" />
        <span className="text-[10px] font-mono tracking-wider text-amber-400/80">PRO &middot; LEVEL 8 &middot; CAPSTONE</span>
      </nav>

      {/* Hero */}
      <section className="min-h-[85vh] flex flex-col items-center justify-center text-center px-5 relative overflow-hidden">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(245,158,11,0.08),transparent_70%)] pointer-events-none" />
        <div className="absolute top-[-50px] right-[20%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(217,70,239,0.05),transparent_70%)] pointer-events-none" />
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="relative z-10">
          <motion.p variants={fadeUp} className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-4">Level 8 &middot; Capstone</motion.p>
          <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold leading-tight mb-4 bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Your Macro Playbook</motion.h1>
          <motion.p variants={fadeUp} className="text-gray-400 max-w-lg mx-auto text-sm leading-relaxed">13 lessons. 13 tools. 1 integrated playbook. Build the document that turns macro chaos into a 25-minute weekly system.</motion.p>
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.8 }} className="absolute bottom-8 flex flex-col items-center gap-2 text-gray-600 text-xs">Scroll to begin<motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-amber-500">&#8964;</motion.div></motion.div>
      </section>

      {/* S00 — Why This Matters */}
      <section className="max-w-2xl mx-auto px-5 py-20"><motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">00 &mdash; Why This Matters</p><h2 className="text-2xl font-extrabold mb-4">The Playbook That Doesn&apos;t Exist Yet</h2><div className="p-6 rounded-2xl glass-card space-y-4">
        <p className="text-sm text-gray-300 leading-relaxed">Every lesson in Level 8 gave you a piece of the puzzle. The calendar, the central banks, the inflation data, the employment reports, the leading indicators, the geopolitical risk framework, the correlation web, the intermarket connections, the bias-building process, the news strategies, the event risk management, the sentiment contrarian signals. 13 separate tools, each powerful on its own.</p>
        <p className="text-sm text-gray-300 leading-relaxed">But pieces don&apos;t win trades. <strong className="text-white">Systems</strong> do. This capstone lesson is where you assemble those 13 pieces into one integrated macro playbook &mdash; a written document you&apos;ll use before every session, during every event week, and at every weekly review. Not theory. Your personal operating system for macro intelligence.</p>
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-purple-500/10 border border-amber-500/20"><p className="text-xs font-bold text-amber-400 mb-1">&#9889; REAL SCENARIO</p><p className="text-xs text-gray-300">Traders who follow a written macro playbook report 23% fewer losing trades per month than those who &quot;keep it in their head.&quot; The difference isn&apos;t knowledge &mdash; both groups understand macro. The difference is <strong className="text-white">consistency under pressure</strong>. When your last trade was a loss and emotions are running, a printed checklist next to your screen is the difference between following the process and skipping the scan.</p></div>
      </div></motion.div></section>

      {/* S01 — Canvas 1: Macro Integration Map */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Complete Macro Map</p><h2 className="text-2xl font-extrabold mb-2">How Every Lesson Connects</h2><p className="text-gray-400 text-sm mb-4">10 concept nodes from 13 lessons, all feeding into one unified MACRO BIAS. Watch each domain light up and connect to the centre.</p>
      <div className="rounded-2xl glass-card p-4"><AnimScene drawFn={drawMacroMap} height={320} /></div></motion.div></section>

      {/* S02 — Canvas 2: Weekly Workflow */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; Weekly Macro Workflow</p><h2 className="text-2xl font-extrabold mb-2">Your 7-Step Weekly System</h2><p className="text-gray-400 text-sm mb-4">Sunday scan to weekly review &mdash; the complete macro cycle in ~25 minutes per week.</p>
      <div className="rounded-2xl glass-card p-4"><AnimScene drawFn={drawWorkflow} height={240} /></div></motion.div></section>

      {/* S03 — 13-Lesson Summary */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; Level 8 Summary</p><h2 className="text-2xl font-extrabold mb-4">13 Lessons, 13 Key Takeaways</h2><div className="space-y-2">{lessonSummary.map((ls, i) => (<div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex gap-3 items-start"><span className="text-xs font-mono font-bold shrink-0 mt-0.5" style={{ color: ls.color }}>{ls.num}</span><div><p className="text-sm font-bold text-gray-200">{ls.title}</p><p className="text-xs text-gray-400 mt-0.5">{ls.takeaway}</p></div></div>))}</div></motion.div></section>

      {/* S04 — Override Rules */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Override Rules</p><h2 className="text-2xl font-extrabold mb-4">Macro &times; Technical Sizing Matrix</h2><div className="p-6 rounded-2xl glass-card space-y-2">{overrideRules.map((r, i) => (<div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between gap-3"><div className="flex-1"><p className="text-sm"><strong className="text-gray-200">Macro: {r.macro}</strong> <span className="text-gray-500">+</span> <strong className="text-gray-200">Tech: <span dangerouslySetInnerHTML={{ __html: r.tech }} /></strong></p><p className="text-xs text-gray-400 mt-0.5">{r.sizing}</p></div><span className="text-xs font-bold px-2 py-1 rounded-lg shrink-0" style={{ color: r.color, background: r.color + '18', border: `1px solid ${r.color}33` }}>{r.verdict}</span></div>))}</div></motion.div></section>

      {/* S05 — GROUNDBREAKING: Macro Playbook Builder */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Build Your Playbook</p><h2 className="text-2xl font-extrabold mb-2">&#127919; Complete Macro Playbook Builder</h2><p className="text-gray-400 text-sm mb-4">Fill in all 6 sections to create your personal macro operating system. This is the document you print and pin next to your screen.</p>
      <div className="p-6 rounded-2xl glass-card space-y-5">
        {/* Progress bar */}
        <div><div className="flex justify-between mb-1"><span className="text-xs font-bold text-amber-400">Playbook Progress</span><span className="text-xs font-mono text-gray-500">{pbProgress}%</span></div><div className="h-2 rounded-full bg-white/[0.06]"><div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-accent-500 transition-all" style={{ width: `${pbProgress}%` }} /></div></div>
        {/* Section tabs */}
        <div className="flex flex-wrap gap-1.5">{pbSections.map((s, i) => (<button key={i} onClick={() => { setPbSummary(false); setPbSection(i); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${pbSection === i && !pbSummary ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400' : 'bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:bg-white/[0.07]'}`}>{i + 1}. {s}</button>))}<button onClick={() => setPbSummary(true)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${pbSummary ? 'bg-purple-500/20 border border-purple-500/40 text-purple-400' : 'bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:bg-white/[0.07]'}`}>&#128196; Summary</button></div>
        {/* Section content */}
        {pbSummary ? (
          <div className="space-y-3">
            <p className="text-xs text-gray-400 mb-2">Your complete macro playbook at a glance:</p>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-xs font-bold text-amber-400 mb-1">1. Event Watchlist</p><p className="text-xs text-gray-400">Instruments: {playbook.watchlist.instruments.join(', ') || 'Not set'} | Tier 1: {playbook.watchlist.tier1Events.join(', ') || 'Not set'} | Calendar: {playbook.watchlist.calendarSource || 'Not set'}</p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-xs font-bold text-amber-400 mb-1">2. Pre-Session Checklist</p>{(['q1','q2','q3','q4','q5'] as const).map((k, i) => (<p key={k} className="text-xs text-gray-400">{i + 1}. {playbook.preSession[k]}</p>))}</div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-xs font-bold text-amber-400 mb-1">3. News Response Rules</p><p className="text-xs text-gray-400">Tier 1: {playbook.newsRules.tier1Default || 'Not set'} | Approach: {playbook.newsRules.approach || 'Not set'}</p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-xs font-bold text-amber-400 mb-1">4. Correlation Alerts</p><p className="text-xs text-gray-400">Pairs: {playbook.correlationAlerts.pairs.join(', ') || 'Not set'} | Rule: {playbook.correlationAlerts.riskRule || 'Not set'}</p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-xs font-bold text-amber-400 mb-1">5. Risk Adjustment Rules</p><p className="text-xs text-gray-400">Budget: {playbook.riskRules.eventBudget || 'Not set'} | Friday: {playbook.riskRules.fridayRule || 'Not set'}</p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-xs font-bold text-amber-400 mb-1">6. Weekly Review</p><p className="text-xs text-gray-400">Day: {playbook.weeklyReview.reviewDay || 'Not set'} | Questions: {playbook.weeklyReview.questions.length}/6 selected | Focus: {playbook.weeklyReview.monthlyFocus || 'Not set'}</p></div>
          </div>
        ) : renderPbSection()}
        {/* Nav buttons */}
        {!pbSummary && (<div className="flex justify-between pt-2">{pbSection > 0 ? <button onClick={() => setPbSection(s => s - 1)} className="px-4 py-2 rounded-xl bg-white/[0.06] text-sm text-gray-300 hover:bg-white/[0.1] transition-all">&larr; Previous</button> : <div />}{pbSection < 5 ? <button onClick={() => setPbSection(s => s + 1)} className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-sm font-bold text-white active:scale-95 transition-transform">Next &rarr;</button> : <button onClick={() => setPbSummary(true)} className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-amber-500 text-sm font-bold text-white active:scale-95 transition-transform">View Summary &#128196;</button>}</div>)}
      </div></motion.div></section>

      {/* S06 — Weekly Workflow Detail */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Weekly Workflow Detail</p><h2 className="text-2xl font-extrabold mb-4">Every Step, Every Minute</h2><div className="p-6 rounded-2xl glass-card space-y-2">{workflowSteps.map((s, i) => (<div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center gap-3"><span className="text-xs font-bold shrink-0 px-2 py-1 rounded-lg" style={{ color: s.color, background: s.color + '18' }}>{s.time}</span><div><p className="text-sm font-bold text-gray-200">{s.day}</p><p className="text-xs text-gray-400">{s.action}</p></div></div>))}</div></motion.div></section>

      {/* S07 — The ROI Argument */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; The ROI of 25 Minutes</p><h2 className="text-2xl font-extrabold mb-4">25 Minutes Per Week. That&apos;s It.</h2><div className="p-6 rounded-2xl glass-card space-y-4">
        <p className="text-sm text-gray-300 leading-relaxed">Sunday scan: 3 minutes. Daily pre-session: 2 minutes &times; 5 = 10 minutes. Event management: ~5 minutes. Friday ritual: 5 minutes. Weekly review: 10 minutes. <strong className="text-amber-400">Total: ~25 minutes.</strong></p>
        <p className="text-sm text-gray-300 leading-relaxed">That&apos;s less time than one bad trade costs you in emotional recovery. Less time than the 45-minute YouTube rabbit hole you go down after a loss. Less time than explaining to yourself why you didn&apos;t check the calendar before entering that NFP candle.</p>
        <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-amber-500/10 border border-green-500/20"><p className="text-xs text-gray-300"><strong className="text-green-400">The maths:</strong> If the macro scan prevents just 2 losing trades per month (average value: 1R each), and your R = &pound;100, that&apos;s &pound;2,400/year saved from 25 minutes/week. That&apos;s a &pound;92/minute hourly rate on your investment of time.</p></div>
      </div></motion.div></section>

      {/* S08 — Common Mistakes */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p><h2 className="text-2xl font-extrabold mb-4">4 Playbook Failures</h2><div className="space-y-3">{commonMistakes.map((item, i) => (<div key={i}><button onClick={() => toggle(`cm-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`cm-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`cm-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-xs text-red-400 mb-2">&#10060; {item.mistake}</p><p className="text-xs text-green-400">&#10004; {item.fix}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      {/* S09 — Cheat Sheet */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Cheat Sheet</p><h2 className="text-2xl font-extrabold mb-4">Macro Playbook Quick Reference</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#22c55e]">BOTH AGREE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Macro tailwind + Technical bullish = full conviction, full size. These are your best days. Don&apos;t hold back.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">BOTH CONFLICT</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Macro headwind + Technical bearish = skip the session entirely. No trade is better than a bad trade in bad weather.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#FFB300]">2-MINUTE SCAN</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Events? DXY? VIX? Correlations? Sentiment? 5 questions, 20 seconds each. The highest-ROI habit in trading.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#a855f7]">WRITTEN &gt; MEMORISED</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Print your playbook. Pin it to your screen. Rules that exist only in your head vanish when emotions arrive.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">THE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">25 minutes per week transforms a chart trader into a complete market participant. The playbook is your edge. Build it, follow it, improve it.</span></p></div>
      </div></motion.div></section>

      {/* S10 — Game */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Test Your Understanding</p><h2 className="text-2xl font-extrabold mb-2">Weekly Macro Planning Game</h2><p className="text-gray-400 text-sm mb-6">5 scenario-based rounds. Apply your complete macro playbook to real trading week decisions.</p>
      <div className="p-6 rounded-2xl glass-card"><div className="flex items-center justify-between mb-4"><span className="text-xs font-bold text-amber-400">Round {gameRound + 1} of {gameRounds.length}</span><span className="text-xs font-mono text-gray-500">{gameScore}/{gameRounds.length} correct</span></div><p className="text-sm text-gray-300 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: gameRounds[gameRound].scenario }} /><div className="space-y-2">{gameRounds[gameRound].options.map((opt, oi) => { const answered = gameAnswers[gameRound] !== null; const selected = gameAnswers[gameRound] === oi; const isCorrect = opt.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return (<div key={oi}><button onClick={() => handleGameAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt.text }} /></button>{answered && selected && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]"><p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`} dangerouslySetInnerHTML={{ __html: opt.explain }} /></motion.div>)}</div>); })}</div>{gameAnswers[gameRound] !== null && gameRound < gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5"><button onClick={() => setGameRound(r => r + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button></motion.div>)}{gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Outstanding — you can plan, execute, and review a complete macro-informed trading week.' : gameScore >= 3 ? 'Good — review the FOMC discipline and weekly review scenarios to sharpen your process.' : 'Re-read the override rules and weekly workflow before proceeding.'}</p></motion.div>)}</div></motion.div></section>

      {/* S11 — Quiz + Certificate */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Knowledge Check</p><h2 className="text-2xl font-extrabold mb-6">Final Quiz &mdash; 8 Questions</h2>
      <div className="space-y-6">{quizQuestions.map((q, qi) => (<div key={qi} className="p-5 rounded-2xl glass-card"><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p><p className="text-sm font-semibold text-white mb-4" dangerouslySetInnerHTML={{ __html: q.q }} /><div className="space-y-2">{q.opts.map((opt, oi) => { const answered = quizAnswers[qi] !== null; const selected = quizAnswers[qi] === oi; const isCorrect = oi === q.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return <button key={oi} onClick={() => handleQuizAnswer(qi, oi)} disabled={answered} className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`} dangerouslySetInnerHTML={{ __html: opt }} />; })}</div>{quizAnswers[qi] !== null && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg bg-white/[0.02]"><p className="text-xs text-amber-400" dangerouslySetInnerHTML={{ __html: `<span class="font-bold">&#9989;</span> ${q.explain}` }} /></motion.div>)}</div>))}</div>
      {quizDone && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center"><p className="text-3xl font-extrabold mb-2">{quizScoreVal}%</p><p className="text-sm text-gray-400">{quizScoreVal >= 66 ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate. Review and try again.'}</p></motion.div>)}
      {certUnlocked && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10"><div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}><div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(139,92,246,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} /><div className="relative z-10 text-center"><div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">🏆</div><p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p><p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 8: Your Macro Playbook &mdash; Capstone</strong><br />at ATLAS Academy by Interakktive</p><p className="bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Macro Strategist &mdash;</p><p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L8.14-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p></div></div></motion.div>)}</motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-20 text-center"><Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">&larr; Back to Academy</Link></section>
    </div>
  );
}
