// app/academy/lesson/weekly-performance-review/page.tsx
// ATLAS Academy — Lesson 7.13: The Weekly Performance Review [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 7
// GROUNDBREAKING: Full Weekly Review Dashboard
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
  const canvasRef = useRef<HTMLCanvasElement>(null); const frameRef = useRef(0); const animRef = useRef(0);
  useEffect(() => { const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext('2d'); if (!ctx) return; const dpr = window.devicePixelRatio || 1; const rect = canvas.getBoundingClientRect(); canvas.width = rect.width * dpr; canvas.height = rect.height * dpr; ctx.scale(dpr, dpr); const loop = () => { ctx.clearRect(0, 0, rect.width, rect.height); drawFn(ctx, rect.width, rect.height, frameRef.current); frameRef.current++; animRef.current = requestAnimationFrame(loop); }; loop(); return () => cancelAnimationFrame(animRef.current); }, [drawFn, height]);
  return <div className="w-full rounded-2xl overflow-hidden bg-black/30 border border-white/5"><canvas ref={canvasRef} style={{ width: '100%', height }} /></div>;
}

// ============================================================
// ANIMATION 1: Review vs No-Review Equity Curves
// ============================================================
function ReviewImpactAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.003; const progress = Math.min(1, (t % 10) / 7.5);
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center'; ctx.fillText('Weekly Reviewers vs Non-Reviewers — 6 Months', w / 2, 16);
    const pad = 30; const chartL = pad + 5; const chartR = w - pad; const chartW = chartR - chartL; const top = 40; const bot = h - 35; const chartH = bot - top; const midY = top + chartH * 0.55;
    const totalPts = 180; const visPts = Math.floor(progress * totalPts);
    const seed = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
    const getReviewer = (i: number): number => { const norm = i / totalPts; return midY - norm * norm * chartH * 0.7 + (seed(i * 3) - 0.5) * 10; };
    const getNonReviewer = (i: number): number => { const norm = i / totalPts; return midY - norm * chartH * 0.08 + (seed(i * 7 + 50) - 0.5) * 22 + Math.sin(norm * 8) * 18; };
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 0.5; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(chartL, midY); ctx.lineTo(chartR, midY); ctx.stroke(); ctx.setLineDash([]);
    for (let m = 1; m <= 6; m++) { const x = chartL + (m / 6) * chartW; ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, bot); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.font = '7px system-ui'; ctx.textAlign = 'center'; ctx.fillText(`M${m}`, x, bot + 12); }
    if (visPts > 1) { ctx.beginPath(); for (let i = 0; i < visPts; i++) { const x = chartL + (i / totalPts) * chartW; if (i === 0) ctx.moveTo(x, getNonReviewer(i)); else ctx.lineTo(x, getNonReviewer(i)); } ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 1.5; ctx.stroke(); const ex = chartL + ((visPts - 1) / totalPts) * chartW; ctx.fillStyle = '#ef4444'; ctx.font = 'bold 8px system-ui'; ctx.textAlign = 'left'; ctx.fillText('No weekly review', ex + 4, getNonReviewer(visPts - 1) + 4); }
    if (visPts > 1) { ctx.beginPath(); for (let i = 0; i < visPts; i++) { const x = chartL + (i / totalPts) * chartW; if (i === 0) ctx.moveTo(x, getReviewer(i)); else ctx.lineTo(x, getReviewer(i)); } ctx.strokeStyle = '#26A69A'; ctx.lineWidth = 2; ctx.stroke(); const ex = chartL + ((visPts - 1) / totalPts) * chartW; ctx.fillStyle = '#26A69A'; ctx.font = 'bold 8px system-ui'; ctx.textAlign = 'left'; ctx.fillText('Weekly reviews', ex + 4, getReviewer(visPts - 1) - 8); }
    if (progress > 0.9) { ctx.fillStyle = 'rgba(38,166,154,0.7)'; ctx.font = 'bold 9px system-ui'; ctx.textAlign = 'center'; ctx.fillText('The gap accelerates — reviewers improve faster each month', w / 2, bot + 26); }
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 2: 6 Review Dimensions
// ============================================================
function SixDimensionsAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.004; const cx = w / 2; const cy = h / 2 + 8;
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center'; ctx.fillText('The 6 Dimensions of Weekly Review', cx, 16);
    const dims = [{ name: 'Session', icon: '🕐', color: '#3b82f6', desc: 'When did I perform best?' }, { name: 'Model', icon: '🎯', color: '#8b5cf6', desc: 'Which setups worked?' }, { name: 'Trigger', icon: '⚡', color: '#f59e0b', desc: 'How clean were entries?' }, { name: 'Emotion', icon: '🧠', color: '#ec4899', desc: 'How did feelings affect results?' }, { name: 'R:R', icon: '📊', color: '#26A69A', desc: 'Planned vs achieved?' }, { name: 'Rules', icon: '📋', color: '#ef4444', desc: 'How compliant was I?' }];
    const R = Math.min(w, h) * 0.3; const n = dims.length; const activeIdx = Math.floor((t % 12) / 2) % n;
    dims.forEach((d, i) => { const angle = (i / n) * Math.PI * 2 - Math.PI / 2; const x = cx + Math.cos(angle) * R; const y = cy + Math.sin(angle) * R; const isActive = i === activeIdx; const nodeR = isActive ? 24 : 18;
      ctx.strokeStyle = isActive ? d.color + '40' : 'rgba(255,255,255,0.04)'; ctx.lineWidth = isActive ? 1.5 : 0.5; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y, nodeR, 0, Math.PI * 2); ctx.fillStyle = isActive ? d.color + '20' : 'rgba(255,255,255,0.02)'; ctx.fill(); ctx.strokeStyle = isActive ? d.color + '60' : 'rgba(255,255,255,0.08)'; ctx.lineWidth = isActive ? 2 : 1; ctx.stroke();
      ctx.font = `${isActive ? 16 : 12}px system-ui`; ctx.textAlign = 'center'; ctx.fillText(d.icon, x, y + 5);
      ctx.fillStyle = isActive ? d.color : 'rgba(255,255,255,0.2)'; ctx.font = `${isActive ? 'bold 9' : '7'}px system-ui`; ctx.fillText(d.name, x, y + nodeR + 14);
      if (isActive) { ctx.fillStyle = d.color + '80'; ctx.font = '8px system-ui'; ctx.fillText(d.desc, x, y + nodeR + 26); }
    });
    ctx.beginPath(); ctx.arc(cx, cy, 16, 0, Math.PI * 2); ctx.fillStyle = 'rgba(245,158,11,0.1)'; ctx.fill(); ctx.strokeStyle = 'rgba(245,158,11,0.3)'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = '#f59e0b'; ctx.font = 'bold 8px system-ui'; ctx.textAlign = 'center'; ctx.fillText('WEEKLY', cx, cy - 2); ctx.fillText('REVIEW', cx, cy + 9);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// DASHBOARD DATA
// ============================================================
interface TradeEntry { id: number; result: 'win' | 'loss'; achievedRR: number; session: string; model: string; trigger: string; emotion: string; rulesFollowed: boolean; }
const sessionList = ['Asia', 'London', 'LON-NY Overlap', 'New York'];
const modelList = ['OB Pullback', 'Liquidity Sweep', 'BOS Continuation', 'FVG Entry', 'Breaker Retest', 'Other'];
const triggerList = ['Clean confirmation', 'Decent — slightly off', 'Weak — entered early', 'No trigger — chased'];
const emotionList = ['Calm & detached', 'Slightly anxious', 'Reactive (fear/greed)', 'Tilted / revenge'];

function SessionHeatMap({ trades }: { trades: TradeEntry[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext('2d'); if (!ctx) return; const dpr = window.devicePixelRatio || 1; const rect = canvas.getBoundingClientRect(); canvas.width = rect.width * dpr; canvas.height = rect.height * dpr; ctx.scale(dpr, dpr); const w = rect.width; const h = rect.height; ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center'; ctx.fillText('Session Performance Heat Map', w / 2, 16);
    const pad = 15; const barH = 32; const gap = 10; const barAreaL = pad + 90; const barAreaR = w - pad - 40; const barMaxW = barAreaR - barAreaL; const startY = 35;
    const maxCount = Math.max(...sessionList.map(s => trades.filter(t => t.session === s).length), 1);
    sessionList.forEach((session, i) => { const y = startY + i * (barH + gap); const st = trades.filter(t => t.session === session); const wins = st.filter(t => t.result === 'win').length; const total = st.length; const wr = total > 0 ? (wins / total) * 100 : 0;
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '9px system-ui'; ctx.textAlign = 'right'; ctx.fillText(session, barAreaL - 8, y + barH / 2 + 3);
      ctx.fillStyle = 'rgba(255,255,255,0.03)'; ctx.beginPath(); ctx.roundRect(barAreaL, y, barMaxW, barH, 4); ctx.fill();
      if (total > 0) { const winW = (wins / maxCount) * barMaxW; const lossW = ((total - wins) / maxCount) * barMaxW;
        ctx.fillStyle = 'rgba(38,166,154,0.5)'; ctx.beginPath(); ctx.roundRect(barAreaL, y, winW, barH, 4); ctx.fill();
        ctx.fillStyle = 'rgba(239,83,80,0.3)'; ctx.beginPath(); ctx.roundRect(barAreaL + winW, y, lossW, barH, 4); ctx.fill();
        const color = wr >= 55 ? '#26A69A' : wr >= 45 ? '#FFB300' : '#ef4444';
        ctx.fillStyle = color; ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'left'; ctx.fillText(`${wr.toFixed(0)}% (${total})`, barAreaL + winW + lossW + 6, y + barH / 2 + 4);
      } else { ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.font = '8px system-ui'; ctx.textAlign = 'center'; ctx.fillText('No trades', barAreaL + barMaxW / 2, y + barH / 2 + 3); }
    });
  }, [trades]);
  return <div className="w-full rounded-2xl overflow-hidden bg-black/30 border border-white/5"><canvas ref={canvasRef} style={{ width: '100%', height: 210 }} /></div>;
}

// ============================================================
// CONTENT DATA
// ============================================================
const reviewFramework = [
  { title: 'Minutes 1-5: Raw Numbers', desc: 'Total trades, wins, losses, WR%. Average planned vs achieved R:R. Rule compliance %. Total P&L. Just data — no interpretation yet.' },
  { title: 'Minutes 6-12: Dimension Analysis', desc: '<strong>Session:</strong> Best/worst? <strong>Model:</strong> Highest WR? <strong>Trigger:</strong> Clean vs early/late? <strong>Emotion:</strong> Correlation with results? This is WHERE patterns hide.' },
  { title: 'Minutes 13-20: Root Cause Diagnosis', desc: 'Find the ONE pattern with the largest negative impact. Use the 7-Step Autopsy on the worst 1-2 trades. Find the ROOT cause, not the symptom.' },
  { title: 'Minutes 21-25: Action Item', desc: 'Write ONE specific, measurable action. Not "be more disciplined." Something like: "For next 5 sessions, rate emotional state 1-10 before each trade, skip any trade below 6."' },
  { title: 'Minutes 26-30: Positive Reinforcement', desc: 'Identify your BEST process trade. What made it great? Anchor this. Note what you did RIGHT. Improvement requires celebrating progress, not just fixing problems.' },
];

const keyMetrics = [
  { metric: 'Win Rate %', benchmark: '45-55% normal for SMC/PA', why: 'Below 45% = entry quality issue. Above 55% = you might be closing winners too early.', color: '#3b82f6' },
  { metric: 'R:R Achieved vs Planned', benchmark: 'Should be >75% of planned', why: 'If planned 1:2.0 but achieved 1:1.2, you are leaving 40% of profit on the table.', color: '#26A69A' },
  { metric: 'Rule Compliance %', benchmark: '>80% is the minimum', why: 'Below 80% = process breaking down. Track WHICH rule breaks most often.', color: '#ef4444' },
  { metric: 'Emotional Correlation', benchmark: 'Calm WR should be highest', why: 'If anxious/reactive trades have much lower WR, emotion is eroding your edge.', color: '#ec4899' },
  { metric: 'Session Distribution', benchmark: 'Should match your playbook', why: 'If supposed to trade LON-NY only but took 3 Asia trades, you broke session rules.', color: '#f59e0b' },
  { metric: 'Trigger Quality', benchmark: '>70% clean entries', why: 'Weak/chased entries degrade R:R mechanically — worse entry price = worse R:R.', color: '#a855f7' },
];

const reviewMistakes = [
  { title: 'Only Reviewing Losing Weeks', mistake: 'Winning weeks contain hidden process errors masked by profit.', fix: 'Review EVERY week. Winning weeks with low compliance are the most dangerous.' },
  { title: 'Too Many Action Items', mistake: '5 things to improve = 0 things improved. Attention dilutes.', fix: 'ONE action item per week. Ruthlessly specific. Measurable.' },
  { title: 'Skipping Positive Reinforcement', mistake: 'Only focusing on negatives leads to negativity bias and self-destruction.', fix: 'Celebrate your best PROCESS trade each week. Anchor the positive.' },
  { title: 'Not Tracking Previous Action Items', mistake: 'Last week\'s action item is forgotten by Monday.', fix: 'First thing each review: did I comply with last week\'s action? If yes, graduate. If no, repeat.' },
];

const quizQuestions = [
  { q: 'The primary purpose of a weekly review is:', opts: ['Calculate profit/loss', 'Identify patterns in execution that drive or destroy edge, then create action items', 'Confirm strategy is working', 'Compare results to others'], correct: 1, explain: 'A weekly review turns raw trade data into actionable intelligence. The goal is patterns and specific fixes — not a P&L summary.' },
  { q: 'Your review shows 80% of winners came from LON-NY overlap and 0% from Asia. The action item is:', opts: ['Stop trading Asia immediately', 'Investigate WHY Asia fails — session character, volume, or model? Collect 20 more data points.', 'Add more Asia trades to balance', 'Just variance — keep trading all sessions'], correct: 1, explain: 'One week of data suggests a pattern but does not confirm it. The action is investigation with more data, not an immediate strategic change.' },
  { q: 'Emotional correlation shows: calm = 58% WR, anxious = 41%, reactive = 28%. Most important insight:', opts: ['Need better psychology training', 'Emotional state is a LEADING INDICATOR — anxious/reactive should trigger reduced risk or no trading', 'Numbers too small to matter', 'Only trade when calm, skip everything else'], correct: 1, explain: 'The data shows emotion directly predicts results. This makes emotional state an actionable, measurable trading filter — not just a feeling to manage.' },
  { q: 'R:R analysis shows planned 1:2.0 but achieved 1:1.3. This gap is caused by:', opts: ['Bad luck', 'Either closing winners early (management) or unrealistic TPs (planning). Investigate which.', 'Strategy is wrong', 'Normal variance — 1:1.3 is fine'], correct: 1, explain: 'The 35% R:R degradation has a specific cause. Closing early = management issue. Unreachable TPs = planning issue. The fix depends on the diagnosis.' },
  { q: 'Rule compliance was 60% this week (6/10 followed rules). This means:', opts: ['60% is acceptable', '4 rule-broken trades are the ROOT CAUSE of most problems. Review each specifically.', 'Rules are guidelines', 'Only worry below 50%'], correct: 1, explain: '40% rule violation rate means nearly half your trades were process-compromised. Each broken rule needs specific diagnosis — is it the same rule each time?' },
  { q: 'How long should a weekly review take?', opts: ['5 minutes — check P&L', '15-30 minutes with structured analysis and ONE action item', '2 hours — review every tick', 'Only on losing weeks'], correct: 1, explain: '15-30 minutes with the 5-phase framework: numbers → dimensions → diagnosis → action item → positive reinforcement. Structured, not exhaustive.' },
  { q: 'The most dangerous finding in a weekly review is:', opts: ['A losing week', 'A winning week with low rule compliance — profit masks process errors', 'Low win rate', 'Few trades taken'], correct: 1, explain: 'Profitable weeks with poor compliance reinforce rule-breaking behaviour. Your brain encodes "breaking rules = profit." This is a ticking time bomb.' },
  { q: 'Your weekly action item should be:', opts: ['A list of 5-10 improvements', 'ONE specific, measurable behaviour change for the next 5 trading days', 'A summary of what went wrong', 'A profit target for next week'], correct: 1, explain: 'Formula: "For [timeframe], I will [specific action]. Track [metric]: target [number]." One item, specific, measurable, time-bound.' },
];

const gameRounds = [
  { scenario: '<strong>Weekly Data:</strong> 8 trades. 5W/3L (62.5% WR). Avg achieved R:R: 1:1.1. Planned R:R: 1:2.0. Rule compliance: 87.5%. All losses from London. All wins from LON-NY overlap. P&L: +&pound;180. Most important finding?', options: [
    { text: 'Good week — 62.5% WR and positive P&L. Keep going.', correct: false, explain: 'WR looks good but achieved R:R (1:1.1) vs planned (1:2.0) is a 45% degradation. At 1:2.0 on 5 wins, P&L would be ~&pound;530 instead of &pound;180. &pound;350 left on the table.' },
    { text: 'The R:R gap is critical — planned 1:2.0 but achieved 1:1.1. Leaving nearly half potential profit on the table.', correct: true, explain: 'Correct. The R:R degradation is the biggest impact. Action item: track WHERE you closed each winner relative to TP. Are you closing early (fear) or is TP unreachable (planning)?' },
    { text: 'London losses are the problem — stop trading London', correct: false, explain: '3 London losses on 8 trades is too small for strategic change. R:R degradation affects ALL trades and has much larger P&L impact.' },
  ]},
  { scenario: '<strong>Emotional Correlation:</strong> 4 calm trades (3W/1L = 75% WR). 3 anxious (1W/2L = 33%). 1 reactive (0W/1L = 0%). The reactive trade was revenge after 2nd anxious loss. Action item?', options: [
    { text: '"Be calmer during trading"', correct: false, explain: 'F-tier action item. Not specific, not measurable. Which emotion triggered the decline? What was the physical cue?' },
    { text: '"After any trade rated anxious or worse, reduce risk to 0.5% for next trade. If reactive, close charts for the day. Track compliance 5 days."', correct: true, explain: 'A-tier. Specific trigger (anxiety self-rating), specific action (reduce or stop), specific measurement (compliance), specific timeframe (5 days).' },
    { text: '"Only trade on days when I feel calm"', correct: false, explain: 'Cannot predict emotional state for entire session in advance. Anxiety often builds mid-session. Rule needs to be RESPONSIVE, not PREDICTIVE.' },
  ]},
  { scenario: '<strong>Model Comparison:</strong> OB Pullback: 4 trades, 3W (75%, 1:1.8 R:R). Liquidity Sweep: 3 trades, 1W (33%, 1:0.9). BOS Continuation: 1 trade, 0W. Playbook includes all 3.', options: [
    { text: 'Drop Sweep and BOS — only trade OB Pullback', correct: false, explain: 'One week (4 sweep trades, 1 BOS) is not enough for strategic changes. The sweep model could have 60% WR over 100 trades.' },
    { text: 'Flag sweep and BOS for deeper analysis. Change NOTHING yet. Journal why each sweep trade lost.', correct: true, explain: 'One week is signal, not verdict. OB Pullback could have a bad week next week. Diagnosis first — find out WHY sweeps underperformed.' },
    { text: 'Increase risk on OB Pullback — it\'s your best model', correct: false, explain: '4 trades at 75% is statistically meaningless. Increasing risk based on 4 trades is the same mistake as decreasing based on 3 losses.' },
  ]},
  { scenario: '<strong>Rule Compliance:</strong> 10 trades. 6 followed rules (4W/2L). 4 broke rules (1W/3L). The winning rule-break was a revenge trade with doubled size. P&L: +&pound;90. Grade?', options: [
    { text: 'B — positive P&L, decent WR, tighten compliance', correct: false, explain: 'The +&pound;90 includes a WINNING REVENGE TRADE at doubled risk. If that trade lost (67% chance), you would be at ~&minus;&pound;310. Profit masks process failure.' },
    { text: 'D — 40% rule violation rate is FAILING. The winning revenge trade is the most dangerous trade of the week.', correct: true, explain: '40% violations = process breaking down. The winning revenge trade reinforces "breaking rules works." All 4 broken trades need analysis, ESPECIALLY the winner.' },
    { text: 'C — positive but needs work. Focus on the 3 losing rule-breaks.', correct: false, explain: 'Focusing ONLY on losing rule-breaks ignores the most dangerous trade — the winning one. A winning rule-break teaches your brain to repeat.' },
  ]},
  { scenario: '<strong>Complete Summary:</strong> 50% WR (5/10). Avg R:R: 1:1.4. Compliance: 80%. All trades LON-NY ✓. OB Pullback only ✓. Triggers: 8/10 clean, 2/10 early. Emotions: 9/10 calm, 1 anxious. P&L: +&pound;220. ONE action item?', options: [
    { text: '"Improve R:R to 1:2.0"', correct: false, explain: '"Improve R:R" is a goal, not action. The 2 early entries likely degraded R:R. Target the ROOT CAUSE.' },
    { text: '"For next 10 trades, no entry until 15M candle closes. Track early entries — target 0/10."', correct: true, explain: '2/10 early entries is the weakest link. Everything else is strong. Early entries degrade R:R mechanically — fixing triggers fixes R:R automatically.' },
    { text: '"Take more trades — 10 is too few"', correct: false, explain: '10 disciplined trades is excellent. "More trades" typically degrades quality. Focus on the one improvement area.' },
  ]},
];

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function WeeklyPerformanceReviewPage() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setOpenSections(p => ({ ...p, [id]: !p[id] }));

  // Dashboard
  const [trades, setTrades] = useState<TradeEntry[]>([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [addingTrade, setAddingTrade] = useState(false);
  const [newTrade, setNewTrade] = useState({ result: 'win' as 'win' | 'loss', achievedRR: 0, session: '', model: '', trigger: '', emotion: '', rulesFollowed: true });
  const addTrade = () => { if (!newTrade.session || !newTrade.model || !newTrade.trigger || !newTrade.emotion) return; setTrades(prev => [...prev, { ...newTrade, id: Date.now() }]); setNewTrade({ result: 'win', achievedRR: 0, session: '', model: '', trigger: '', emotion: '', rulesFollowed: true }); setAddingTrade(false); };
  const removeTrade = (id: number) => setTrades(prev => prev.filter(t => t.id !== id));
  const totalTrades = trades.length; const wins = trades.filter(t => t.result === 'win').length; const losses = totalTrades - wins;
  const wr = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
  const avgRR = totalTrades > 0 ? trades.reduce<number>((s, t) => s + t.achievedRR, 0) / totalTrades : 0;
  const ruleCompliance = totalTrades > 0 ? (trades.filter(t => t.rulesFollowed).length / totalTrades) * 100 : 0;
  const getEmotionWR = (em: string) => { const t = trades.filter(tr => tr.emotion === em); if (t.length === 0) return { wr: 0, count: 0 }; return { wr: (t.filter(tr => tr.result === 'win').length / t.length) * 100, count: t.length }; };
  const getModelWR = (m: string) => { const t = trades.filter(tr => tr.model === m); if (t.length === 0) return { wr: 0, count: 0 }; return { wr: (t.filter(tr => tr.result === 'win').length / t.length) * 100, count: t.length }; };
  const getWeeklyGrade = (): { grade: string; color: string } => { if (totalTrades < 3) return { grade: '—', color: '#6b7280' }; let score = 0; if (wr >= 50) score += 2; else if (wr >= 40) score += 1; if (avgRR >= 1.5) score += 2; else if (avgRR >= 1.0) score += 1; if (ruleCompliance >= 80) score += 2; else if (ruleCompliance >= 60) score += 1; const calmWR = getEmotionWR('Calm & detached'); if (calmWR.count >= totalTrades * 0.7) score += 2; else if (calmWR.count >= totalTrades * 0.5) score += 1; if (score >= 7) return { grade: 'A', color: '#26A69A' }; if (score >= 5) return { grade: 'B', color: '#3b82f6' }; if (score >= 3) return { grade: 'C', color: '#FFB300' }; return { grade: 'D', color: '#ef4444' }; };

  // Game
  const [gameRound, setGameRound] = useState(0);
  const [gameAnswers, setGameAnswers] = useState<(number | null)[]>(gameRounds.map(() => null));
  const [gameScore, setGameScore] = useState(0);
  const handleGameAnswer = (optIdx: number) => { if (gameAnswers[gameRound] !== null) return; const newA = [...gameAnswers]; newA[gameRound] = optIdx; setGameAnswers(newA); if (gameRounds[gameRound].options[optIdx].correct) setGameScore(s => s + 1); };

  // Quiz
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(quizQuestions.map(() => null));
  const handleQuizAnswer = (qi: number, oi: number) => { if (quizAnswers[qi] !== null) return; const n = [...quizAnswers]; n[qi] = oi; setQuizAnswers(n); };
  const quizDone = quizAnswers.every(a => a !== null);
  const quizScoreVal = quizDone ? Math.round((quizAnswers.filter((a, i) => a === quizQuestions[i].correct).length / quizQuestions.length) * 100) : 0;
  const certUnlocked = quizDone && quizScoreVal >= 66;
  const [showConfetti, setShowConfetti] = useState(false);
  useEffect(() => { if (certUnlocked) { setShowConfetti(true); const t = setTimeout(() => setShowConfetti(false), 4000); return () => clearTimeout(t); }}, [certUnlocked]);

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      <Confetti active={showConfetti} />
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-900/50"><motion.div className="h-full bg-gradient-to-r from-amber-500 to-accent-500" style={{ width: `${Math.min((scrollY / (typeof document !== 'undefined' ? document.body.scrollHeight - window.innerHeight : 1)) * 100, 100)}%` }} /></div>
      <nav className="fixed top-1 left-0 right-0 z-40 flex items-center justify-between px-5 py-2.5">
        <Link href="/academy" className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-amber-400 to-accent-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>ATLAS ACADEMY</Link>
        <div className="flex items-center gap-2"><Crown className="w-3.5 h-3.5 text-amber-400" /><span className="text-xs font-bold text-amber-400">PRO &middot; LEVEL 7</span></div>
      </nav>

      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6 pt-20">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(245,158,11,0.08),transparent_70%)] pointer-events-none" />
        <div className="absolute top-[-50px] right-[20%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(217,70,239,0.05),transparent_70%)] pointer-events-none" />
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.15 } } }} className="relative z-10">
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 7 &middot; Lesson 13</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">The Weekly<br /><span className="bg-gradient-to-r from-amber-400 via-pink-400 to-blue-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Performance Review</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">30 minutes that compound your edge faster than 30 hours of chart time. Input your trades, see the patterns your brain missed.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* S00 */}
      <section className="max-w-2xl mx-auto px-5 py-20"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
        <div className="p-6 rounded-2xl glass-card mb-6">
          <p className="text-xl font-extrabold mb-3">🔍 Game Film</p>
          <p className="text-gray-400 leading-relaxed mb-4">Elite athletes don&rsquo;t just train — they watch <strong className="text-amber-400">game film</strong>. They study every play, every mistake, every pattern. A weekly review is your game film. The data is in your journal. The review turns it into <strong className="text-white">actionable intelligence</strong>.</p>
          <p className="text-gray-400 leading-relaxed">Without it, you repeat mistakes you cannot see. With it, every week makes the next week better. <strong className="text-white">The improvement compounds.</strong></p>
        </div>
        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
          <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-green-400">Weekly reviewers: WR 48%&rarr;55%, EV +0.20%&rarr;+0.52%, drawdowns decreased 40%.</strong> <strong className="text-red-400">Non-reviewers: WR 47-49%, EV flat +0.15%, drawdowns unchanged.</strong> Same starting point. Same strategy. The ONLY difference was 30 minutes every Sunday.</p>
        </div>
      </motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Compounding Effect</p><h2 className="text-2xl font-extrabold mb-4">Reviews Accelerate Growth</h2><p className="text-gray-400 text-sm mb-6">The gap accelerates — each review makes the next week better.</p><ReviewImpactAnimation /></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The 6 Dimensions</p><h2 className="text-2xl font-extrabold mb-4">Six Lenses That Reveal Hidden Patterns</h2><p className="text-gray-400 text-sm mb-6">Session, Model, Trigger, Emotion, R:R, Rules — six dimensions invisible in real-time.</p><SixDimensionsAnimation /></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The 30-Minute Framework</p><h2 className="text-2xl font-extrabold mb-4">Five Phases, Every Sunday</h2><div className="p-6 rounded-2xl glass-card space-y-3">{reviewFramework.map((item, i) => (<div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">{item.title}</strong> <span className="text-gray-500">=</span> <span className="text-gray-400" dangerouslySetInnerHTML={{ __html: item.desc }} /></p></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The Metrics That Matter</p><h2 className="text-2xl font-extrabold mb-4">6 Numbers That Tell the Story</h2><div className="space-y-3">{keyMetrics.map((item, i) => (<div key={i}><button onClick={() => toggle(`km-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold" style={{ color: item.color }}>{item.metric}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`km-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`km-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-[10px] text-gray-500 mb-1">Benchmark: {item.benchmark}</p><p className="text-sm text-gray-400">{item.why}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      {/* S05 — GROUNDBREAKING: Weekly Review Dashboard */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Interactive Challenge</p><h2 className="text-2xl font-extrabold mb-2">Weekly Review Dashboard</h2><p className="text-gray-400 text-sm mb-6">Input trades. The dashboard auto-generates session heat map, model comparison, emotional correlation, and weekly grade.</p>
      <div className="p-6 rounded-2xl glass-card">{!showDashboard ? (<div className="space-y-4">
        {trades.length > 0 && (<div className="space-y-2"><p className="text-xs font-bold text-gray-300">{trades.length} trade{trades.length !== 1 ? 's' : ''}</p>{trades.map(t => (<div key={t.id} className={`flex items-center gap-3 p-3 rounded-xl border ${t.result === 'win' ? 'bg-green-500/5 border-green-500/10' : 'bg-red-500/5 border-red-500/10'}`}><span className={`text-xs font-bold ${t.result === 'win' ? 'text-green-400' : 'text-red-400'}`}>{t.result === 'win' ? 'W' : 'L'}</span><div className="flex-1 min-w-0"><p className="text-[11px] text-gray-300 truncate">{t.session} &middot; {t.model} &middot; R:R {t.achievedRR}</p><p className="text-[10px] text-gray-500 truncate">{t.emotion} &middot; {t.rulesFollowed ? 'Rules ✓' : 'Rules ✗'}</p></div><button onClick={() => removeTrade(t.id)} className="text-gray-600 hover:text-red-400 text-xs">✕</button></div>))}</div>)}
        {addingTrade ? (<div className="p-4 rounded-xl bg-white/[0.02] border border-amber-500/20 space-y-3"><p className="text-xs font-bold text-amber-400">Add Trade</p>
          <div className="grid grid-cols-2 gap-2"><div><p className="text-[10px] text-gray-500 mb-1">Result</p><div className="flex gap-2">{(['win', 'loss'] as const).map(r => (<button key={r} onClick={() => setNewTrade(p => ({ ...p, result: r }))} className={`flex-1 p-2 rounded-lg text-xs font-bold ${newTrade.result === r ? (r === 'win' ? 'bg-green-500/20 border border-green-500/30 text-green-400' : 'bg-red-500/20 border border-red-500/30 text-red-400') : 'bg-white/[0.04] border border-white/[0.08] text-gray-400'}`}>{r.toUpperCase()}</button>))}</div></div><div><p className="text-[10px] text-gray-500 mb-1">Achieved R:R</p><input type="number" step="0.1" min="-3" max="5" value={newTrade.achievedRR} onChange={e => setNewTrade(p => ({ ...p, achievedRR: parseFloat(e.target.value) || 0 }))} className="w-full p-2 rounded-lg bg-white/[0.03] border border-white/10 text-sm text-white outline-none focus:border-amber-500/30" /></div></div>
          <div><p className="text-[10px] text-gray-500 mb-1">Session</p><div className="flex flex-wrap gap-1.5">{sessionList.map(s => (<button key={s} onClick={() => setNewTrade(p => ({ ...p, session: s }))} className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold ${newTrade.session === s ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400' : 'bg-white/[0.04] border border-white/[0.08] text-gray-400'}`}>{s}</button>))}</div></div>
          <div><p className="text-[10px] text-gray-500 mb-1">Model</p><div className="flex flex-wrap gap-1.5">{modelList.map(m => (<button key={m} onClick={() => setNewTrade(p => ({ ...p, model: m }))} className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold ${newTrade.model === m ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400' : 'bg-white/[0.04] border border-white/[0.08] text-gray-400'}`}>{m}</button>))}</div></div>
          <div><p className="text-[10px] text-gray-500 mb-1">Trigger</p><div className="space-y-1">{triggerList.map(tr => (<button key={tr} onClick={() => setNewTrade(p => ({ ...p, trigger: tr }))} className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-semibold ${newTrade.trigger === tr ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400' : 'bg-white/[0.04] border border-white/[0.08] text-gray-400'}`}>{tr}</button>))}</div></div>
          <div><p className="text-[10px] text-gray-500 mb-1">Emotion</p><div className="space-y-1">{emotionList.map(em => (<button key={em} onClick={() => setNewTrade(p => ({ ...p, emotion: em }))} className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-semibold ${newTrade.emotion === em ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400' : 'bg-white/[0.04] border border-white/[0.08] text-gray-400'}`}>{em}</button>))}</div></div>
          <div className="flex items-center gap-3"><button onClick={() => setNewTrade(p => ({ ...p, rulesFollowed: !p.rulesFollowed }))} className={`px-3 py-2 rounded-lg text-xs font-bold ${newTrade.rulesFollowed ? 'bg-green-500/20 border border-green-500/30 text-green-400' : 'bg-red-500/20 border border-red-500/30 text-red-400'}`}>{newTrade.rulesFollowed ? 'Rules ✓' : 'Rules ✗'}</button><p className="text-[10px] text-gray-500">Tap to toggle</p></div>
          <div className="flex gap-2"><button onClick={() => setAddingTrade(false)} className="px-4 py-2 rounded-lg bg-white/[0.05] border border-white/10 text-xs text-gray-400">Cancel</button><button onClick={addTrade} disabled={!newTrade.session || !newTrade.model || !newTrade.trigger || !newTrade.emotion} className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-accent-500 text-white text-xs font-bold disabled:opacity-30 active:scale-95">Add Trade</button></div>
        </div>) : (<button onClick={() => setAddingTrade(true)} className="w-full p-3 rounded-xl bg-white/[0.04] border border-dashed border-white/[0.08] text-sm text-gray-400 hover:bg-white/[0.07]">+ Add Trade</button>)}
        {trades.length >= 3 && (<button onClick={() => setShowDashboard(true)} className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Generate Dashboard &rarr;</button>)}
        {trades.length > 0 && trades.length < 3 && (<p className="text-xs text-gray-500 text-center">Add at least 3 trades to generate.</p>)}
      </div>) : (<motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
        <div className="p-5 rounded-xl text-center border" style={{ borderColor: getWeeklyGrade().color + '30', background: getWeeklyGrade().color + '08' }}><p className="text-5xl font-black mb-1" style={{ color: getWeeklyGrade().color }}>{getWeeklyGrade().grade}</p><p className="text-xs text-gray-400">Weekly Process Grade — {totalTrades} trades</p></div>
        <div className="grid grid-cols-4 gap-2">{[{ v: `${wr.toFixed(0)}%`, l: 'WR', c: wr >= 50 ? '#26A69A' : '#FFB300' }, { v: `1:${avgRR.toFixed(1)}`, l: 'R:R', c: avgRR >= 1.5 ? '#26A69A' : '#ef4444' }, { v: `${ruleCompliance.toFixed(0)}%`, l: 'Rules', c: ruleCompliance >= 80 ? '#26A69A' : '#ef4444' }, { v: `${wins}W ${losses}L`, l: 'Record', c: '#fff' }].map((m, i) => (<div key={i} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center"><p className="text-lg font-black" style={{ color: m.c }}>{m.v}</p><p className="text-[9px] text-gray-500">{m.l}</p></div>))}</div>
        <SessionHeatMap trades={trades} />
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-xs font-bold text-gray-300 mb-3">Model Win Rates</p><div className="space-y-2">{modelList.filter(m => trades.some(t => t.model === m)).map(m => { const s = getModelWR(m); return (<div key={m} className="flex items-center gap-3"><p className="text-[11px] text-gray-400 w-28 truncate">{m}</p><div className="flex-1 h-5 bg-white/[0.03] rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${s.wr}%`, background: s.wr >= 55 ? '#26A69A' : s.wr >= 45 ? '#FFB300' : '#ef4444' }} /></div><p className="text-xs font-bold w-16 text-right" style={{ color: s.wr >= 55 ? '#26A69A' : s.wr >= 45 ? '#FFB300' : '#ef4444' }}>{s.wr.toFixed(0)}% ({s.count})</p></div>); })}</div></div>
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-xs font-bold text-gray-300 mb-3">Emotion &rarr; Win Rate</p><div className="space-y-2">{emotionList.filter(em => trades.some(t => t.emotion === em)).map(em => { const s = getEmotionWR(em); const color = em === 'Calm & detached' ? '#26A69A' : em === 'Slightly anxious' ? '#FFB300' : '#ef4444'; return (<div key={em} className="flex items-center gap-3"><p className="text-[11px] w-32 truncate" style={{ color }}>{em}</p><div className="flex-1 h-5 bg-white/[0.03] rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${s.wr}%`, background: color }} /></div><p className="text-xs font-bold w-16 text-right" style={{ color }}>{s.wr.toFixed(0)}% ({s.count})</p></div>); })}</div></div>
        <button onClick={() => setShowDashboard(false)} className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-semibold text-gray-300 hover:bg-white/[0.07]">&larr; Edit Trades</button>
      </motion.div>)}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; The Action Item Formula</p><h2 className="text-2xl font-extrabold mb-4">How to Write Actions That Work</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-red-400">BAD</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">&ldquo;Be more disciplined.&rdquo; (F-tier — not actionable)</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-red-400">BAD</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">&ldquo;Improve R:R.&rdquo; (Goal, not action)</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-green-400">GOOD</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">&ldquo;For next 5 sessions, no entry until 15M close. Track compliance: target 100%.&rdquo;</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">FORMULA</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">For [timeframe], I will [specific action]. Track [metric]: target [number].</span></p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; The Winning Week Trap</p><h2 className="text-2xl font-extrabold mb-4">Why Profitable Weeks Can Be Dangerous</h2><div className="p-6 rounded-2xl glass-card"><p className="text-sm text-gray-400 leading-relaxed mb-4">A profitable week with low compliance is <strong className="text-white">MORE dangerous</strong> than a losing week with high compliance. The profit <strong className="text-white">reinforces rule-breaking</strong>.</p><div className="grid grid-cols-2 gap-3"><div className="p-3 rounded-xl bg-green-500/5 border border-green-500/10"><p className="text-xs font-bold text-green-400 mb-1">B-Grade Losing Week</p><p className="text-[11px] text-gray-400">High compliance, stop hit. Process was sound. Losses are variance.</p></div><div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10"><p className="text-xs font-bold text-red-400 mb-1">F-Grade Winning Week</p><p className="text-[11px] text-gray-400">Low compliance, revenge trades, rules broken. Won anyway. Time bomb.</p></div></div></div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Review Mistakes</p><h2 className="text-2xl font-extrabold mb-4">4 Ways Traders Sabotage Reviews</h2><div className="space-y-3">{reviewMistakes.map((item, i) => (<div key={i}><button onClick={() => toggle(`rm-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`rm-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`rm-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-xs text-red-400 mb-2">&#10060; {item.mistake}</p><p className="text-xs text-green-400">&#10004; {item.fix}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Cheat Sheet</p><h2 className="text-2xl font-extrabold mb-4">Review Quick Reference</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">30 MINUTES</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">5 min numbers &rarr; 7 min dimensions &rarr; 8 min diagnosis &rarr; 5 min action &rarr; 5 min positives.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#3b82f6]">6 DIMENSIONS</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Session, Model, Trigger, Emotion, R:R, Rules. Every trade tagged on all 6.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#26A69A]">ONE ACTION</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">For [timeframe], I will [action]. Track [metric]: target [number]. One item only.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#ef4444]">GRADE PROCESS</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">A-grade losing week &gt; F-grade winning week. P&L lies. Process grade doesn&rsquo;t.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#FFB300]">EVERY SUNDAY</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Non-negotiable. Winning, losing, 0-trade week. The review happens regardless.</span></p></div>
      </div></motion.div></section>

      {/* S10 — Game */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Test Your Understanding</p><h2 className="text-2xl font-extrabold mb-2">Weekly Review Game</h2><p className="text-gray-400 text-sm mb-6">5 review analysis scenarios.</p>
      <div className="p-6 rounded-2xl glass-card"><div className="flex items-center justify-between mb-4"><span className="text-xs font-bold text-amber-400">Round {gameRound + 1} of {gameRounds.length}</span><span className="text-xs font-mono text-gray-500">{gameScore}/{gameRounds.length} correct</span></div><p className="text-sm text-gray-300 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: gameRounds[gameRound].scenario }} /><div className="space-y-2">{gameRounds[gameRound].options.map((opt, oi) => { const answered = gameAnswers[gameRound] !== null; const selected = gameAnswers[gameRound] === oi; const isCorrect = opt.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return (<div key={oi}><button onClick={() => handleGameAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt.text }} /></button>{answered && selected && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]"><p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`} dangerouslySetInnerHTML={{ __html: `${isCorrect ? '✓' : '✗'} ${opt.explain}` }} /></motion.div>)}</div>); })}</div>{gameAnswers[gameRound] !== null && gameRound < gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5"><button onClick={() => setGameRound(r => r + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button></motion.div>)}{gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Excellent — you can extract actionable intelligence from data.' : gameScore >= 3 ? 'Good — review symptom vs root cause in analysis.' : 'Re-read the Framework and Action Item Formula.'}</p></motion.div>)}</div></motion.div></section>

      {/* S11 — Quiz + Certificate */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Knowledge Check</p><h2 className="text-2xl font-extrabold mb-6">Final Quiz &mdash; 8 Questions</h2>
      <div className="space-y-6">{quizQuestions.map((q, qi) => (<div key={qi} className="p-5 rounded-2xl glass-card"><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p><p className="text-sm font-semibold text-white mb-4">{q.q}</p><div className="space-y-2">{q.opts.map((opt, oi) => { const answered = quizAnswers[qi] !== null; const selected = quizAnswers[qi] === oi; const isCorrect = oi === q.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return <button key={oi} onClick={() => handleQuizAnswer(qi, oi)} disabled={answered} className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`}>{opt}</button>; })}</div>{quizAnswers[qi] !== null && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg bg-white/[0.02]"><p className="text-xs text-amber-400" dangerouslySetInnerHTML={{ __html: `<span class="font-bold">&#9989;</span> ${q.explain}` }} /></motion.div>)}</div>))}</div>
      {quizDone && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center"><p className="text-3xl font-extrabold mb-2">{quizScoreVal}%</p><p className="text-sm text-gray-400">{quizScoreVal >= 66 ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate.'}</p></motion.div>)}
      {certUnlocked && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10"><div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}><div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(139,92,246,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} /><div className="relative z-10 text-center"><div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 via-pink-500 to-blue-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">📋</div><p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p><p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 7: The Weekly Performance Review</strong><br />at ATLAS Academy by Interakktive</p><p className="bg-gradient-to-r from-amber-400 via-pink-400 to-blue-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Performance Analyst &mdash;</p><p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L7.13-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p></div></div></motion.div>)}</motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-20 text-center"><Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">&larr; Back to Academy</Link></section>
    </div>
  );
}
