// app/academy/lesson/weekly-performance-review/page.tsx
// ATLAS Academy — Lesson 7.13: The Weekly Performance Review [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 7
// GROUNDBREAKING: Full Weekly Review Dashboard — most advanced tool in the academy
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Crown, ChevronDown } from 'lucide-react';

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
// ANIMATION 1: Review vs No-Review Equity Curves
// ============================================================
function ReviewImpactAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.003;
    const progress = Math.min(1, (t % 10) / 7.5);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('Weekly Reviewers vs Non-Reviewers — 6 Months', w / 2, 16);

    const pad = 30;
    const chartL = pad + 5;
    const chartR = w - pad;
    const chartW = chartR - chartL;
    const top = 40;
    const bot = h - 35;
    const chartH = bot - top;
    const midY = top + chartH * 0.55;

    const totalPts = 180;
    const visPts = Math.floor(progress * totalPts);
    const seed = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

    // Reviewer: steady improvement, tighter DD, upward slope steepens over time
    const getReviewer = (i: number): number => {
      const norm = i / totalPts;
      const accel = norm * norm; // accelerating improvement
      const trend = accel * chartH * 0.7;
      const noise = (seed(i * 3) - 0.5) * 10;
      return midY - trend + noise;
    };

    // Non-reviewer: flat with big swings
    const getNonReviewer = (i: number): number => {
      const norm = i / totalPts;
      const trend = norm * chartH * 0.08;
      const noise = (seed(i * 7 + 50) - 0.5) * 22;
      const dd = Math.sin(norm * 8) * 18;
      return midY - trend + noise + dd;
    };

    // Starting line
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 0.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(chartL, midY); ctx.lineTo(chartR, midY); ctx.stroke();
    ctx.setLineDash([]);

    // Non-reviewer (behind)
    if (visPts > 1) {
      ctx.beginPath();
      for (let i = 0; i < visPts; i++) {
        const x = chartL + (i / totalPts) * chartW;
        if (i === 0) ctx.moveTo(x, getNonReviewer(i)); else ctx.lineTo(x, getNonReviewer(i));
      }
      ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 1.5; ctx.stroke();
      const ex = chartL + ((visPts - 1) / totalPts) * chartW;
      ctx.fillStyle = '#ef4444'; ctx.font = 'bold 8px system-ui'; ctx.textAlign = 'left';
      ctx.fillText('No weekly review', ex + 4, getNonReviewer(visPts - 1) + 4);
    }

    // Reviewer (on top)
    if (visPts > 1) {
      ctx.beginPath();
      for (let i = 0; i < visPts; i++) {
        const x = chartL + (i / totalPts) * chartW;
        if (i === 0) ctx.moveTo(x, getReviewer(i)); else ctx.lineTo(x, getReviewer(i));
      }
      ctx.strokeStyle = '#26A69A'; ctx.lineWidth = 2; ctx.stroke();
      const ex = chartL + ((visPts - 1) / totalPts) * chartW;
      ctx.fillStyle = '#26A69A'; ctx.font = 'bold 8px system-ui'; ctx.textAlign = 'left';
      ctx.fillText('Weekly reviews', ex + 4, getReviewer(visPts - 1) - 8);
    }

    // Month markers
    for (let m = 1; m <= 6; m++) {
      const x = chartL + (m / 6) * chartW;
      ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, bot); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.font = '7px system-ui'; ctx.textAlign = 'center';
      ctx.fillText(`M${m}`, x, bot + 12);
    }

    if (progress > 0.9) {
      ctx.fillStyle = 'rgba(38,166,154,0.7)'; ctx.font = 'bold 9px system-ui'; ctx.textAlign = 'center';
      ctx.fillText('The gap accelerates — reviewers improve faster each month', w / 2, bot + 26);
    }
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 2: The 6 Review Dimensions
// ============================================================
function SixDimensionsAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.004;
    const cx = w / 2;
    const cy = h / 2 + 8;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('The 6 Dimensions of Weekly Review', cx, 16);

    const dims = [
      { name: 'Session', icon: '🕐', color: '#3b82f6', desc: 'When did I perform best?' },
      { name: 'Model', icon: '🎯', color: '#8b5cf6', desc: 'Which setups worked?' },
      { name: 'Trigger', icon: '⚡', color: '#f59e0b', desc: 'How clean were my entries?' },
      { name: 'Emotion', icon: '🧠', color: '#ec4899', desc: 'How did feelings affect results?' },
      { name: 'R:R', icon: '📊', color: '#26A69A', desc: 'Planned vs achieved?' },
      { name: 'Rules', icon: '📋', color: '#ef4444', desc: 'How compliant was I?' },
    ];

    const R = Math.min(w, h) * 0.3;
    const n = dims.length;
    const activeIdx = Math.floor((t % 12) / 2) % n;

    dims.forEach((d, i) => {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(angle) * R;
      const y = cy + Math.sin(angle) * R;
      const isActive = i === activeIdx;
      const pulse = isActive ? Math.sin(t * 3) * 0.15 + 0.85 : 1;
      const nodeR = isActive ? 24 : 18;

      // Connection to center
      ctx.strokeStyle = isActive ? d.color + '40' : 'rgba(255,255,255,0.04)';
      ctx.lineWidth = isActive ? 1.5 : 0.5;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke();

      // Node
      ctx.beginPath(); ctx.arc(x, y, nodeR * pulse, 0, Math.PI * 2);
      ctx.fillStyle = isActive ? d.color + '20' : 'rgba(255,255,255,0.02)';
      ctx.fill();
      ctx.strokeStyle = isActive ? d.color + '60' : 'rgba(255,255,255,0.08)';
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.stroke();

      // Icon
      ctx.font = `${isActive ? 16 : 12}px system-ui`; ctx.textAlign = 'center';
      ctx.fillText(d.icon, x, y + 5);

      // Label
      ctx.fillStyle = isActive ? d.color : 'rgba(255,255,255,0.2)';
      ctx.font = `${isActive ? 'bold 9' : '7'}px system-ui`;
      ctx.fillText(d.name, x, y + nodeR + 14);

      // Description (active only)
      if (isActive) {
        ctx.fillStyle = d.color + '80'; ctx.font = '8px system-ui';
        ctx.fillText(d.desc, x, y + nodeR + 26);
      }
    });

    // Center hub
    ctx.beginPath(); ctx.arc(cx, cy, 16, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(245,158,11,0.1)'; ctx.fill();
    ctx.strokeStyle = 'rgba(245,158,11,0.3)'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = '#f59e0b'; ctx.font = 'bold 8px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('WEEKLY', cx, cy - 2);
    ctx.fillText('REVIEW', cx, cy + 9);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// WEEKLY REVIEW DASHBOARD — Trade Entry
// ============================================================
interface TradeEntry {
  id: number;
  result: 'win' | 'loss';
  plannedRR: number;
  achievedRR: number;
  session: string;
  model: string;
  trigger: string;
  emotion: string;
  rulesFollowed: boolean;
}

const sessions = ['Asia', 'London', 'LON-NY Overlap', 'New York'];
const models = ['OB Pullback', 'Liquidity Sweep', 'BOS Continuation', 'FVG Entry', 'Breaker Retest', 'Other'];
const triggers = ['Clean confirmation', 'Decent — slightly off', 'Weak — entered early', 'No trigger — chased'];
const emotions = ['Calm & detached', 'Slightly anxious', 'Reactive (fear/greed)', 'Tilted / revenge'];

// ============================================================
// DASHBOARD CANVAS — Session Heat Map
// ============================================================
function SessionHeatMap({ trades }: { trades: TradeEntry[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr; canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const w = rect.width; const h = rect.height;
    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('Session Performance Heat Map', w / 2, 16);

    const pad = 15;
    const barH = 32;
    const gap = 10;
    const barAreaL = pad + 90;
    const barAreaR = w - pad - 40;
    const barMaxW = barAreaR - barAreaL;
    const startY = 35;

    sessions.forEach((session, i) => {
      const y = startY + i * (barH + gap);
      const sessionTrades = trades.filter(t => t.session === session);
      const wins = sessionTrades.filter(t => t.result === 'win').length;
      const total = sessionTrades.length;
      const wr = total > 0 ? (wins / total) * 100 : 0;

      // Label
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '9px system-ui'; ctx.textAlign = 'right';
      ctx.fillText(session, barAreaL - 8, y + barH / 2 + 3);

      // Bar bg
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      ctx.beginPath(); ctx.roundRect(barAreaL, y, barMaxW, barH, 4); ctx.fill();

      if (total > 0) {
        // Win bar
        const winW = (wins / Math.max(...sessions.map(s => trades.filter(t => t.session === s).length), 1)) * barMaxW;
        const lossW = ((total - wins) / Math.max(...sessions.map(s => trades.filter(t => t.session === s).length), 1)) * barMaxW;

        ctx.fillStyle = 'rgba(38,166,154,0.5)';
        ctx.beginPath(); ctx.roundRect(barAreaL, y, winW, barH, 4); ctx.fill();

        ctx.fillStyle = 'rgba(239,83,80,0.3)';
        ctx.beginPath(); ctx.roundRect(barAreaL + winW, y, lossW, barH, 4); ctx.fill();

        // WR label
        const color = wr >= 55 ? '#26A69A' : wr >= 45 ? '#FFB300' : '#ef4444';
        ctx.fillStyle = color; ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'left';
        ctx.fillText(`${wr.toFixed(0)}% (${total})`, barAreaL + winW + lossW + 6, y + barH / 2 + 4);
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.font = '8px system-ui'; ctx.textAlign = 'center';
        ctx.fillText('No trades', barAreaL + barMaxW / 2, y + barH / 2 + 3);
      }
    });
  }, [trades]);

  return <div className="w-full rounded-2xl overflow-hidden bg-black/30 border border-white/5"><canvas ref={canvasRef} style={{ width: '100%', height: 210 }} /></div>;
}

// ============================================================
// QUIZ & GAME DATA
// ============================================================
const quizQuestions = [
  { q: 'The primary purpose of a weekly performance review is:', opts: ['To calculate profit/loss for the week', 'To identify patterns in your execution that drive or destroy edge, then create specific action items', 'To confirm your strategy is working', 'To compare your results to other traders'], correct: 1 },
  { q: 'Your weekly review shows 80% of your winners came from LON-NY overlap and 0% from Asia. The action item is:', opts: ['Stop trading Asia immediately', 'Investigate why Asia setups fail — is it session character, volume, or your model? Collect 20 more data points before deciding.', 'Add more Asia trades to balance the distribution', 'It\'s just variance — keep trading all sessions equally'], correct: 1 },
  { q: 'Your emotional correlation analysis shows: calm trades = 58% WR, anxious trades = 41% WR, reactive trades = 28% WR. The most important insight is:', opts: ['You need better psychology training', 'Emotional state is a LEADING INDICATOR of results — anxious/reactive states should trigger reduced risk or no trading', 'The numbers are too small to matter', 'You should only trade when calm and skip all other days'], correct: 1 },
  { q: 'Your R:R analysis shows planned 1:2.0 but achieved 1:1.3 average. This gap is caused by:', opts: ['Bad luck — the market didn\'t reach your TP', 'Either closing winners too early (management issue) or placing TPs unrealistically far (planning issue). Investigate which.', 'Your strategy is wrong — find one with higher R:R', 'Normal variance — 1:1.3 is still profitable'], correct: 1 },
  { q: 'Rule compliance was 60% this week (6/10 trades followed all rules). What does this mean?', opts: ['60% is acceptable — nobody follows rules 100%', '4 rule-broken trades are the ROOT CAUSE of most problems this week. Review each broken rule specifically.', 'Rules are guidelines, not requirements', 'Only worry if compliance drops below 50%'], correct: 1 },
  { q: 'How long should a weekly review take?', opts: ['5 minutes — just check P&L', '15-30 minutes with structured analysis and ONE specific action item for next week', '2 hours — review every tick of every trade', 'Only do it when you have a losing week'], correct: 1 },
  { q: 'The most dangerous finding in a weekly review is:', opts: ['A losing week (negative P&L)', 'A winning week with low rule compliance — the profit masks process errors', 'Low win rate', 'Few trades taken'], correct: 1 },
  { q: 'Your weekly action item should be:', opts: ['A list of 5-10 things to improve', 'ONE specific, measurable behaviour change to focus on for the next 5 trading days', 'A summary of what went wrong', 'A profit target for next week'], correct: 1 },
];

const gameRounds = [
  { scenario: '<strong>Weekly Review Data:</strong> 8 trades taken. 5 wins, 3 losses (62.5% WR). Average achieved R:R: 1:1.1. Planned R:R was 1:2.0. Rule compliance: 7/8 (87.5%). All 3 losses were from London session. All 5 wins were from LON-NY overlap. Your overall P&L was +£180. What is the MOST important finding?', options: [{ text: 'Good week — 62.5% WR and positive P&L. Keep doing what you\'re doing.', correct: false, explain: 'The WR looks good but the achieved R:R (1:1.1) vs planned (1:2.0) is a 45% degradation. You\'re winning more often than planned but capturing FAR less per win. This means you\'re either closing winners early or your TP placement is unrealistic. The £180 masks a serious management leak.' }, { text: 'The R:R gap is critical — planned 1:2.0 but achieved 1:1.1. You\'re leaving nearly half your potential profit on the table. This is a management or planning problem.', correct: true, explain: 'Correct. If you achieved 1:2.0 on those 5 wins instead of 1:1.1, your P&L would be approximately £530 instead of £180. That\'s £350 left on the table — nearly 3× your actual profit. Action item: for next week, track WHERE you closed each winner relative to TP. Are you closing early (fear) or is TP unreachable (planning)?' }, { text: 'London losses are the problem — stop trading London and focus on LON-NY overlap.', correct: false, explain: 'The session data is useful but 3 London losses on 8 total trades is too small a sample for a strategic change. The R:R degradation affects ALL trades and has a much larger impact on your bottom line.' }] },
  { scenario: '<strong>Emotional Correlation:</strong> This week: 4 trades while calm (3 wins, 1 loss = 75% WR). 3 trades while anxious (1 win, 2 losses = 33% WR). 1 trade while reactive (0 wins, 1 loss = 0% WR). The reactive trade was a revenge entry after the 2nd anxious loss. Your action item should be:', options: [{ text: '"Be calmer during trading" — work on emotional control.', correct: false, explain: '"Be calmer" is an F-tier action item (remember Lesson 7.10?). It\'s not specific or measurable. Which emotion triggered the decline? At what point did anxiety become reactivity? What was the physical cue?' }, { text: '"After any trade where I rate my emotional state as anxious or worse, I will reduce risk to 0.5% for the next trade. If I rate reactive, I close charts for the day. Track compliance with this rule for 5 days."', correct: true, explain: 'A-tier action item. Specific trigger (anxiety/reactive self-rating), specific action (reduce risk or stop), specific measurement (compliance tracking), specific timeframe (5 days). This turns an emotional pattern into a mechanical rule.' }, { text: '"Only trade on days when I feel calm."', correct: false, explain: 'You can\'t predict your emotional state for the entire session in advance. Anxiety often builds mid-session after a loss. The rule needs to be RESPONSIVE (trigger during trading) not PREDICTIVE (decide before trading).' }] },
  { scenario: '<strong>Model Comparison:</strong> OB Pullback: 4 trades, 3 wins (75% WR, 1:1.8 avg R:R). Liquidity Sweep: 3 trades, 1 win (33% WR, 1:0.9 avg R:R). BOS Continuation: 1 trade, 0 wins (0% WR). Your playbook includes all 3 models. What do you do?', options: [{ text: 'Drop Liquidity Sweep and BOS Continuation — only trade OB Pullback.', correct: false, explain: 'One week of data (4 sweep trades, 1 BOS trade) is NOT enough to make strategic changes. The sweep model could have 60% WR over 100 trades but hit a rough week. You need 50+ trades per model before making removal decisions.' }, { text: 'Flag the sweep and BOS models for deeper analysis but change NOTHING yet. Continue collecting data. Action item: for next week, journal the specific reason each sweep trade lost — was it the model or the execution?', correct: true, explain: 'Correct. One week is signal, not verdict. The data says "investigate," not "abandon." Your OB Pullback could easily have a bad week next week. The action item is diagnostic — find out WHY sweeps underperformed before deciding if the model or the trader is the problem.' }, { text: 'Increase risk on OB Pullback trades since it\'s your best model.', correct: false, explain: '4 trades at 75% WR is statistically meaningless — the confidence interval is enormous. Increasing risk based on 4 trades is the same mistake as decreasing risk based on 3 losses. Data-driven decisions require DATA, not a single week.' }] },
  { scenario: '<strong>Rule Compliance:</strong> 10 trades this week. 6 followed all rules (4 wins, 2 losses). 4 broke at least one rule (1 win, 3 losses). The winning rule-break was a revenge trade with doubled size that happened to hit TP. Overall P&L: +£90. How do you grade the week?', options: [{ text: 'B — positive P&L, decent WR, just need to tighten rule compliance.', correct: false, explain: 'This is outcome bias. The +£90 includes a WINNING REVENGE TRADE with doubled risk. If that trade had lost (which it had a 67% chance of doing based on your reactive state WR), you\'d be at approximately -£310. The £90 profit was a coin flip away from being a catastrophic week.' }, { text: 'D — 40% rule violation rate is FAILING. The winning revenge trade is the most dangerous trade of the week. The £90 profit is masking a process that\'s breaking down.', correct: true, explain: 'Correct. 40% rule violation rate means 4/10 trades were compromised. The winning revenge trade reinforces the exact behaviour that will destroy you: "breaking rules works." Action item: for next week, identify the FIRST rule broken in each of the 4 trades. Is it the same rule each time? Fix that ONE rule.' }, { text: 'C — positive but needs work. Focus on the 3 losing rule-breaks.', correct: false, explain: 'Focusing only on the LOSING rule-breaks ignores the most dangerous trade — the winning one. A winning rule-break teaches your brain that breaking rules produces good outcomes. All 4 broken trades need analysis, especially the winner.' }] },
  { scenario: '<strong>Complete Weekly Summary:</strong> WR: 50% (5/10). Avg R:R: 1:1.4. Rule compliance: 80%. Session: all trades in LON-NY overlap ✓. Model: OB Pullback only ✓. Triggers: 8/10 clean, 2/10 entered early. Emotions: 9/10 calm, 1/10 anxious. P&L: +£220. What is your ONE action item for next week?', options: [{ text: '"Improve R:R to 1:2.0" — the achieved R:R of 1:1.4 is below target.', correct: false, explain: '"Improve R:R" is a goal, not an action. HOW will you improve it? The 2 early trigger entries likely degraded R:R (worse entry price = worse R:R). The action item should target the ROOT CAUSE.' }, { text: '"For the next 10 trades, I will NOT enter until the 15M trigger candle closes. Track early entries — target 0/10."', correct: true, explain: 'Perfect. 2/10 early entries is your weakest link this week. Everything else is strong (80% compliance, calm emotions, right session, right model). The R:R degradation is CAUSED by the early entries — fixing triggers fixes R:R automatically. One specific, measurable action.' }, { text: '"Take more trades — 10 is too few for a week."', correct: false, explain: '10 trades with disciplined execution is excellent. "More trades" is a volume goal that typically degrades quality. Your current week shows a strong process with one specific improvement area (trigger quality). More trades won\'t fix that.' }] },
];

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function WeeklyPerformanceReviewPage() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState(0);
  const totalSections = 12;
  const toggle = (id: string) => { setOpenSections(p => { const n = { ...p, [id]: !p[id] }; const c = Object.values(n).filter(Boolean).length; setProgress(Math.round((c / totalSections) * 100)); return n; }); };

  // Dashboard state
  const [trades, setTrades] = useState<TradeEntry[]>([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [addingTrade, setAddingTrade] = useState(false);
  const [newTrade, setNewTrade] = useState({ result: 'win' as 'win' | 'loss', plannedRR: 2, achievedRR: 0, session: '', model: '', trigger: '', emotion: '', rulesFollowed: true });

  const addTrade = () => {
    if (!newTrade.session || !newTrade.model || !newTrade.trigger || !newTrade.emotion) return;
    setTrades(prev => [...prev, { ...newTrade, id: Date.now() }]);
    setNewTrade({ result: 'win', plannedRR: 2, achievedRR: 0, session: '', model: '', trigger: '', emotion: '', rulesFollowed: true });
    setAddingTrade(false);
  };

  const removeTrade = (id: number) => setTrades(prev => prev.filter(t => t.id !== id));

  // Dashboard calculations
  const totalTrades = trades.length;
  const wins = trades.filter(t => t.result === 'win').length;
  const losses = totalTrades - wins;
  const wr = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
  const avgPlannedRR = totalTrades > 0 ? trades.reduce<number>((s, t) => s + t.plannedRR, 0) / totalTrades : 0;
  const avgAchievedRR = totalTrades > 0 ? trades.reduce<number>((s, t) => s + t.achievedRR, 0) / totalTrades : 0;
  const ruleCompliance = totalTrades > 0 ? (trades.filter(t => t.rulesFollowed).length / totalTrades) * 100 : 0;

  const getEmotionWR = (em: string): { wr: number; count: number } => {
    const t = trades.filter(tr => tr.emotion === em);
    if (t.length === 0) return { wr: 0, count: 0 };
    return { wr: (t.filter(tr => tr.result === 'win').length / t.length) * 100, count: t.length };
  };

  const getModelWR = (m: string): { wr: number; count: number; rr: number } => {
    const t = trades.filter(tr => tr.model === m);
    if (t.length === 0) return { wr: 0, count: 0, rr: 0 };
    return { wr: (t.filter(tr => tr.result === 'win').length / t.length) * 100, count: t.length, rr: t.reduce<number>((s, tr) => s + tr.achievedRR, 0) / t.length };
  };

  const getWeeklyGrade = (): { grade: string; color: string } => {
    if (totalTrades < 3) return { grade: '—', color: '#6b7280' };
    let score = 0;
    if (wr >= 50) score += 2; else if (wr >= 40) score += 1;
    if (avgAchievedRR >= avgPlannedRR * 0.8) score += 2; else if (avgAchievedRR >= avgPlannedRR * 0.6) score += 1;
    if (ruleCompliance >= 80) score += 2; else if (ruleCompliance >= 60) score += 1;
    const calmWR = getEmotionWR('Calm & detached');
    if (calmWR.count >= totalTrades * 0.7) score += 2; else if (calmWR.count >= totalTrades * 0.5) score += 1;
    if (score >= 7) return { grade: 'A', color: '#26A69A' };
    if (score >= 5) return { grade: 'B', color: '#3b82f6' };
    if (score >= 3) return { grade: 'C', color: '#FFB300' };
    return { grade: 'D', color: '#ef4444' };
  };

  // Game state
  const [gameRound, setGameRound] = useState(0);
  const [gameAnswers, setGameAnswers] = useState<(number | null)[]>(gameRounds.map(() => null));
  const [gameScore, setGameScore] = useState(0);
  const handleGameAnswer = (optIdx: number) => { if (gameAnswers[gameRound] !== null) return; const newA = [...gameAnswers]; newA[gameRound] = optIdx; setGameAnswers(newA); if (gameRounds[gameRound].options[optIdx].correct) setGameScore(s => s + 1); };

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(quizQuestions.map(() => null));
  const [quizDone, setQuizDone] = useState(false);
  const quizScore = quizDone ? Math.round(quizAnswers.reduce<number>((s, a, i) => s + (a === quizQuestions[i].correct ? 1 : 0), 0) / quizQuestions.length * 100) : 0;
  const certUnlocked = quizDone && quizScore >= 66;
  const handleQuizAnswer = (qi: number, oi: number) => { if (quizAnswers[qi] !== null) return; const n = [...quizAnswers]; n[qi] = oi; setQuizAnswers(n); };

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      {/* Hero */}
      <section className="max-w-2xl mx-auto px-5 pt-12 pb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link href="/academy" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 mb-6 transition-colors">&larr; Back to Academy</Link>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4"><Crown className="w-3.5 h-3.5 text-amber-400" /><span className="text-[11px] font-bold tracking-wider text-amber-400">PRO &middot; LEVEL 7</span></div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 leading-tight">The Weekly Performance Review</h1>
          <p className="text-gray-400 text-sm leading-relaxed max-w-lg">30 minutes that compound your edge faster than 30 hours of chart time. Input your trades, see the patterns your brain missed.</p>
          <div className="mt-4 h-1.5 rounded-full bg-white/5 overflow-hidden"><motion.div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-accent-500" animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} /></div>
          <p className="text-right text-[10px] text-gray-600 mt-1">{progress}% complete</p>
        </motion.div>
      </section>

      {/* S00 */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-start gap-3 mb-4"><span className="text-xl">🔍</span><h2 className="text-xl font-extrabold">First — Why This Matters</h2></div>
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
            <p className="text-sm text-gray-300 leading-relaxed mb-4">Elite athletes don&rsquo;t just train — they watch <strong className="text-white">game film</strong>. They study every play, every mistake, every pattern. A weekly review is your game film. You already have the data in your journal — the review turns that data into <strong className="text-white">actionable intelligence</strong>. Without it, you repeat mistakes you can&rsquo;t see. With it, every week makes the next week better. The improvement compounds.</p>
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
              <p className="text-xs font-bold text-amber-400 tracking-widest uppercase mb-2">Real Scenario</p>
              <p className="text-sm text-gray-300 leading-relaxed">Two groups of prop traders over 6 months. <strong className="text-[#26A69A]">Weekly reviewers: WR improved from 48% → 55%, EV from +0.20% → +0.52%, drawdowns decreased 40%.</strong> <strong className="text-[#ef4444]">Non-reviewers: WR stayed 47-49%, EV flat at +0.15%, drawdowns unchanged.</strong> Same starting point. Same strategy. The ONLY difference was 30 minutes every Sunday.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S01 */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-extrabold mb-4">The Compounding Effect of Weekly Reviews</h2>
          <ReviewImpactAnimation />
          <p className="text-xs text-gray-500 mt-2 text-center">The gap accelerates — each review makes the next week better. Non-reviewers stay flat.</p>
        </motion.div>
      </section>

      {/* S02 */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-extrabold mb-4">The 6 Review Dimensions</h2>
          <SixDimensionsAnimation />
          <p className="text-xs text-gray-500 mt-2 text-center">Session, Model, Trigger, Emotion, R:R, Rules — six lenses that reveal patterns invisible in real-time.</p>
        </motion.div>
      </section>

      {/* S03 — The Review Framework */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-extrabold mb-4">The 30-Minute Review Framework</h2>
          <div className="space-y-3">
            {[
              { id: 's03a', num: '01', title: 'Minutes 1-5: Raw Numbers', content: 'Count: total trades, wins, losses, WR%. Average planned R:R vs achieved R:R. Rule compliance %. Total P&L. These are the FACTS — no interpretation yet, just data collection.' },
              { id: 's03b', num: '02', title: 'Minutes 6-12: Dimension Analysis', content: '<strong>Session:</strong> Which session produced the best/worst results? <strong>Model:</strong> Which setup type had the highest WR? <strong>Trigger:</strong> How many entries were clean vs early/late? <strong>Emotion:</strong> What was the correlation between emotional state and results? This is WHERE the patterns hide.' },
              { id: 's03c', num: '03', title: 'Minutes 13-20: Root Cause Diagnosis', content: 'Find the ONE pattern that had the largest negative impact. Was it a session? A model? A trigger type? An emotional state? Use the 7-Step Autopsy on the worst 1-2 trades. Find the ROOT cause, not the symptom.' },
              { id: 's03d', num: '04', title: 'Minutes 21-25: Action Item', content: 'Write ONE specific, measurable action for next week. Not "be more disciplined." Something like: "For the next 5 sessions, I will rate my emotional state 1-10 before each trade and skip any trade where I rate below 6." One item. Specific. Measurable.' },
              { id: 's03e', num: '05', title: 'Minutes 26-30: Positive Reinforcement', content: 'Identify your BEST trade of the week — not the most profitable, but the one with the highest process quality. What made it great? Anchor this feeling. Also note what you did RIGHT consistently. Improvement requires celebrating progress, not just fixing problems.' },
            ].map(item => (
              <div key={item.id} className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
                <button onClick={() => toggle(item.id)} className="w-full flex items-center gap-3 p-4 text-left"><span className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center text-xs font-bold text-amber-400/60">{item.num}</span><span className="flex-1 text-sm font-semibold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[item.id] ? 'rotate-180' : ''}`} /></button>
                <AnimatePresence>{openSections[item.id] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="px-5 pb-5"><p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.content }} /></div></motion.div>)}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S04 — Key Metrics */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-extrabold mb-4">The Metrics That Matter</h2>
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
            <button onClick={() => toggle('s04')} className="w-full flex items-center gap-3 p-4 text-left"><span className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center text-xs font-bold text-amber-400/60">03</span><span className="flex-1 text-sm font-semibold text-gray-200">6 Numbers That Tell the Whole Story</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections['s04'] ? 'rotate-180' : ''}`} /></button>
            <AnimatePresence>{openSections['s04'] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="px-5 pb-5 space-y-2">
              {[
                { metric: 'Win Rate %', benchmark: '45-55% is normal for SMC/PA', why: 'Below 45% = entry quality issue. Above 55% = you might be closing winners too early (check R:R).', color: '#3b82f6' },
                { metric: 'R:R Achieved vs Planned', benchmark: 'Should be >75% of planned', why: 'If you plan 1:2.0 but achieve 1:1.2, you\'re leaving 40% of profit on the table. Usually a management issue.', color: '#26A69A' },
                { metric: 'Rule Compliance %', benchmark: '>80% is the minimum', why: 'Below 80% = your process is breaking down. Track WHICH rule breaks most often.', color: '#ef4444' },
                { metric: 'Emotional Correlation', benchmark: 'Calm WR should be highest', why: 'If anxious/reactive trades have similar WR to calm trades, your strategy is robust. If they\'re much lower, emotion is eroding your edge.', color: '#ec4899' },
                { metric: 'Session Distribution', benchmark: 'Should match your playbook', why: 'If you\'re supposed to trade LON-NY only but took 3 Asia trades, you broke your session rules.', color: '#f59e0b' },
                { metric: 'Trigger Quality', benchmark: '>70% clean entries', why: 'Weak or chased entries degrade R:R mechanically — worse entry price = worse R:R regardless of outcome.', color: '#a855f7' },
              ].map(item => (
                <div key={item.metric} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <p className="text-xs font-bold mb-0.5" style={{ color: item.color }}>{item.metric}</p>
                  <p className="text-[10px] text-gray-500 mb-1">Benchmark: {item.benchmark}</p>
                  <p className="text-[11px] text-gray-400">{item.why}</p>
                </div>
              ))}
            </div></motion.div>)}</AnimatePresence>
          </div>
        </motion.div>
      </section>

      {/* S05 — 🎯 GROUNDBREAKING: Weekly Review Dashboard */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-center gap-2 mb-2"><span className="text-xl">🎯</span><h2 className="text-xl font-extrabold">Weekly Review Dashboard</h2></div>
          <p className="text-sm text-gray-400 mb-6">Input this week&rsquo;s trades. The dashboard auto-generates your session heat map, model comparison, emotional correlation, and weekly grade.</p>

          {!showDashboard ? (
            <div className="space-y-4">
              {/* Trade list */}
              {trades.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-300">{trades.length} trade{trades.length !== 1 ? 's' : ''} entered</p>
                  {trades.map(t => (
                    <div key={t.id} className={`flex items-center gap-3 p-3 rounded-xl border ${t.result === 'win' ? 'bg-green-500/5 border-green-500/10' : 'bg-red-500/5 border-red-500/10'}`}>
                      <span className={`text-xs font-bold ${t.result === 'win' ? 'text-green-400' : 'text-red-400'}`}>{t.result === 'win' ? 'W' : 'L'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-gray-300 truncate">{t.session} · {t.model} · R:R {t.achievedRR}</p>
                        <p className="text-[10px] text-gray-500 truncate">{t.emotion} · {t.rulesFollowed ? 'Rules ✓' : 'Rules ✗'}</p>
                      </div>
                      <button onClick={() => removeTrade(t.id)} className="text-gray-600 hover:text-red-400 text-xs">✕</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add trade form */}
              {addingTrade ? (
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-amber-500/20 space-y-3">
                  <p className="text-xs font-bold text-amber-400">Add Trade</p>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[10px] text-gray-500 mb-1">Result</p>
                      <div className="flex gap-2">
                        {(['win', 'loss'] as const).map(r => (
                          <button key={r} onClick={() => setNewTrade(p => ({ ...p, result: r }))} className={`flex-1 p-2 rounded-lg text-xs font-bold ${newTrade.result === r ? (r === 'win' ? 'bg-green-500/20 border border-green-500/30 text-green-400' : 'bg-red-500/20 border border-red-500/30 text-red-400') : 'bg-white/[0.03] border border-white/10 text-gray-400'}`}>{r === 'win' ? 'WIN' : 'LOSS'}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 mb-1">Achieved R:R</p>
                      <input type="number" step="0.1" min="-3" max="5" value={newTrade.achievedRR} onChange={e => setNewTrade(p => ({ ...p, achievedRR: parseFloat(e.target.value) || 0 }))} className="w-full p-2 rounded-lg bg-white/[0.03] border border-white/10 text-sm text-white outline-none focus:border-amber-500/30" />
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] text-gray-500 mb-1">Session</p>
                    <div className="flex flex-wrap gap-1.5">{sessions.map(s => (<button key={s} onClick={() => setNewTrade(p => ({ ...p, session: s }))} className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold ${newTrade.session === s ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400' : 'bg-white/[0.03] border border-white/10 text-gray-400'}`}>{s}</button>))}</div>
                  </div>

                  <div>
                    <p className="text-[10px] text-gray-500 mb-1">Model</p>
                    <div className="flex flex-wrap gap-1.5">{models.map(m => (<button key={m} onClick={() => setNewTrade(p => ({ ...p, model: m }))} className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold ${newTrade.model === m ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400' : 'bg-white/[0.03] border border-white/10 text-gray-400'}`}>{m}</button>))}</div>
                  </div>

                  <div>
                    <p className="text-[10px] text-gray-500 mb-1">Trigger Quality</p>
                    <div className="space-y-1">{triggers.map(tr => (<button key={tr} onClick={() => setNewTrade(p => ({ ...p, trigger: tr }))} className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-semibold ${newTrade.trigger === tr ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400' : 'bg-white/[0.03] border border-white/10 text-gray-400'}`}>{tr}</button>))}</div>
                  </div>

                  <div>
                    <p className="text-[10px] text-gray-500 mb-1">Emotional State</p>
                    <div className="space-y-1">{emotions.map(em => (<button key={em} onClick={() => setNewTrade(p => ({ ...p, emotion: em }))} className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-semibold ${newTrade.emotion === em ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400' : 'bg-white/[0.03] border border-white/10 text-gray-400'}`}>{em}</button>))}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button onClick={() => setNewTrade(p => ({ ...p, rulesFollowed: !p.rulesFollowed }))} className={`px-3 py-2 rounded-lg text-xs font-bold ${newTrade.rulesFollowed ? 'bg-green-500/20 border border-green-500/30 text-green-400' : 'bg-red-500/20 border border-red-500/30 text-red-400'}`}>{newTrade.rulesFollowed ? 'Rules Followed ✓' : 'Rules Broken ✗'}</button>
                    <p className="text-[10px] text-gray-500">Tap to toggle</p>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => setAddingTrade(false)} className="px-4 py-2 rounded-lg bg-white/[0.05] border border-white/10 text-xs text-gray-400">Cancel</button>
                    <button onClick={addTrade} disabled={!newTrade.session || !newTrade.model || !newTrade.trigger || !newTrade.emotion} className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-accent-500 text-white text-xs font-bold disabled:opacity-30 active:scale-95 transition-transform">Add Trade</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setAddingTrade(true)} className="w-full p-3 rounded-xl bg-white/[0.03] border border-dashed border-white/10 text-sm text-gray-400 hover:border-amber-500/30 transition-all">+ Add Trade</button>
              )}

              {trades.length >= 3 && (
                <button onClick={() => setShowDashboard(true)} className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Generate Weekly Dashboard →</button>
              )}
              {trades.length > 0 && trades.length < 3 && (
                <p className="text-xs text-gray-500 text-center">Add at least 3 trades to generate the dashboard.</p>
              )}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
              {/* Weekly Grade */}
              <div className="p-5 rounded-2xl text-center border" style={{ borderColor: getWeeklyGrade().color + '30', background: getWeeklyGrade().color + '08' }}>
                <p className="text-5xl font-black mb-1" style={{ color: getWeeklyGrade().color }}>{getWeeklyGrade().grade}</p>
                <p className="text-xs text-gray-400">Weekly Process Grade — {totalTrades} trades</p>
              </div>

              {/* Key Stats Row */}
              <div className="grid grid-cols-4 gap-2">
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                  <p className="text-lg font-black" style={{ color: wr >= 50 ? '#26A69A' : '#FFB300' }}>{wr.toFixed(0)}%</p>
                  <p className="text-[9px] text-gray-500">Win Rate</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                  <p className="text-lg font-black" style={{ color: avgAchievedRR >= avgPlannedRR * 0.75 ? '#26A69A' : '#ef4444' }}>1:{avgAchievedRR.toFixed(1)}</p>
                  <p className="text-[9px] text-gray-500">Avg R:R</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                  <p className="text-lg font-black" style={{ color: ruleCompliance >= 80 ? '#26A69A' : ruleCompliance >= 60 ? '#FFB300' : '#ef4444' }}>{ruleCompliance.toFixed(0)}%</p>
                  <p className="text-[9px] text-gray-500">Rules</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                  <p className="text-lg font-black text-white">{wins}W {losses}L</p>
                  <p className="text-[9px] text-gray-500">Record</p>
                </div>
              </div>

              {/* Session Heat Map */}
              <SessionHeatMap trades={trades} />

              {/* Model Comparison */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <p className="text-xs font-bold text-gray-300 mb-3">Model Win Rates</p>
                <div className="space-y-2">
                  {models.filter(m => trades.some(t => t.model === m)).map(m => {
                    const stats = getModelWR(m);
                    return (
                      <div key={m} className="flex items-center gap-3">
                        <p className="text-[11px] text-gray-400 w-28 truncate">{m}</p>
                        <div className="flex-1 h-5 bg-white/[0.03] rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${stats.wr}%`, background: stats.wr >= 55 ? '#26A69A' : stats.wr >= 45 ? '#FFB300' : '#ef4444' }} />
                        </div>
                        <p className="text-xs font-bold w-16 text-right" style={{ color: stats.wr >= 55 ? '#26A69A' : stats.wr >= 45 ? '#FFB300' : '#ef4444' }}>{stats.wr.toFixed(0)}% ({stats.count})</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Emotional Correlation */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <p className="text-xs font-bold text-gray-300 mb-3">Emotion → Win Rate Correlation</p>
                <div className="space-y-2">
                  {emotions.filter(em => trades.some(t => t.emotion === em)).map(em => {
                    const stats = getEmotionWR(em);
                    const color = em === 'Calm & detached' ? '#26A69A' : em === 'Slightly anxious' ? '#FFB300' : '#ef4444';
                    return (
                      <div key={em} className="flex items-center gap-3">
                        <p className="text-[11px] w-32 truncate" style={{ color }}>{em}</p>
                        <div className="flex-1 h-5 bg-white/[0.03] rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${stats.wr}%`, background: color }} />
                        </div>
                        <p className="text-xs font-bold w-16 text-right" style={{ color }}>{stats.wr.toFixed(0)}% ({stats.count})</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* R:R Analysis */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <p className="text-xs font-bold text-gray-300 mb-2">R:R Analysis</p>
                <div className="flex items-center gap-4">
                  <div className="text-center flex-1">
                    <p className="text-xs text-gray-500">Planned</p>
                    <p className="text-lg font-black text-gray-300">1:{avgPlannedRR.toFixed(1)}</p>
                  </div>
                  <div className="text-2xl text-gray-600">→</div>
                  <div className="text-center flex-1">
                    <p className="text-xs text-gray-500">Achieved</p>
                    <p className="text-lg font-black" style={{ color: avgAchievedRR >= avgPlannedRR * 0.75 ? '#26A69A' : '#ef4444' }}>1:{avgAchievedRR.toFixed(1)}</p>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-xs text-gray-500">Retention</p>
                    <p className="text-lg font-black" style={{ color: avgPlannedRR > 0 && (avgAchievedRR / avgPlannedRR) >= 0.75 ? '#26A69A' : '#ef4444' }}>{avgPlannedRR > 0 ? ((avgAchievedRR / avgPlannedRR) * 100).toFixed(0) : 0}%</p>
                  </div>
                </div>
              </div>

              <button onClick={() => setShowDashboard(false)} className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-semibold text-gray-300 hover:border-amber-500/30 transition-all">← Edit Trades</button>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* S06-S08 Expandable sections */}
      {[
        { id: 's06', num: '04', title: 'The Action Item Formula', content: '<strong>Bad:</strong> "Be more disciplined." (F-tier — not actionable)<br/><strong>Bad:</strong> "Improve R:R." (goal, not action)<br/><strong>Good:</strong> "For the next 5 trading days, I will not enter until the 15M candle closes. Track compliance: target 100%."<br/><br/>Formula: <strong>For [timeframe], I will [specific action]. Track [metric]: target [number].</strong><br/><br/>ONE action item per week. Two is dilution. Three is noise.' },
        { id: 's07', num: '05', title: 'The Winning Week Trap', content: 'A profitable week with low rule compliance (e.g., +£400 with 50% rule violations) is MORE dangerous than a losing week with high compliance. Why? The profit reinforces rule-breaking. Your brain encodes: "breaking rules = profit." The NEXT time you\'re tempted to break a rule, the memory of this profitable week will push you toward violation.<br/><br/>Grade the PROCESS, not the P&L. A B-grade losing week beats an F-grade winning week every time over 100+ trades.' },
        { id: 's08', num: '06', title: 'Common Review Mistakes', content: '<strong>1. Only reviewing losing weeks.</strong> Winning weeks need reviews too — they contain hidden process errors masked by profit.<br/><br/><strong>2. Too many action items.</strong> 5 things to improve = 0 things improved. ONE action item, ruthlessly specific.<br/><br/><strong>3. Skipping the positive reinforcement.</strong> Only focusing on negatives leads to negativity bias and self-destruction. Celebrate your best process trade each week.<br/><br/><strong>4. Not tracking previous action items.</strong> Last week\'s action item should be the FIRST thing you check this week. Did you comply? If yes, graduate to the next improvement. If no, repeat it.' },
      ].map(item => (
        <section key={item.id} className="max-w-2xl mx-auto px-5 py-5">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
              <button onClick={() => toggle(item.id)} className="w-full flex items-center gap-3 p-4 text-left"><span className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center text-xs font-bold text-amber-400/60">{item.num}</span><span className="flex-1 text-sm font-semibold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[item.id] ? 'rotate-180' : ''}`} /></button>
              <AnimatePresence>{openSections[item.id] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="px-5 pb-5"><p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.content }} /></div></motion.div>)}</AnimatePresence>
            </div>
          </motion.div>
        </section>
      ))}

      {/* S09 — Cheat Sheet */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-extrabold mb-4">Cheat Sheet</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { title: '30 Minutes', content: '5 min numbers → 7 min dimensions → 8 min diagnosis → 5 min action → 5 min positives.', color: '#f59e0b' },
              { title: '6 Dimensions', content: 'Session, Model, Trigger, Emotion, R:R, Rules. Every trade gets tagged on all 6.', color: '#3b82f6' },
              { title: 'ONE Action', content: 'Formula: For [timeframe], I will [action]. Track [metric]: target [number]. One item only.', color: '#26A69A' },
              { title: 'Grade Process', content: 'A-grade losing week > F-grade winning week. The P&L lies. The process grade doesn\'t.', color: '#ef4444' },
              { title: 'Track Forward', content: 'Last week\'s action item is this week\'s first check. Complied? → Next fix. Failed? → Repeat it.', color: '#a855f7' },
              { title: 'Every Sunday', content: 'Non-negotiable. Winning week, losing week, 0-trade week. The review happens regardless.', color: '#FFB300' },
            ].map((card, i) => (
              <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <p className="text-xs font-bold mb-1" style={{ color: card.color }}>{card.title}</p>
                <p className="text-[11px] text-gray-400 leading-relaxed">{card.content}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S10 — Game */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-extrabold mb-2">Test Your Knowledge</h2>
          <p className="text-gray-400 text-sm mb-6">5 weekly review analysis scenarios.</p>
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
            <p className="text-xs tracking-widest uppercase text-amber-400 font-bold mb-3">Round {gameRound + 1} of {gameRounds.length}</p>
            <p className="text-sm text-gray-300 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: gameRounds[gameRound].scenario }} />
            <div className="space-y-3">
              {gameRounds[gameRound].options.map((opt, oi) => {
                const answered = gameAnswers[gameRound] !== null;
                const selected = gameAnswers[gameRound] === oi;
                const isCorrect = opt.correct;
                const cls = !answered ? 'bg-white/[0.03] border border-white/10 hover:border-amber-500/30' : isCorrect ? 'bg-green-500/10 border border-green-500/30' : selected ? 'bg-red-500/10 border border-red-500/30' : 'bg-white/[0.02] border border-white/5 opacity-50';
                return (<div key={oi}><button onClick={() => handleGameAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt.text }} /></button>{answered && selected && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]"><p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`} dangerouslySetInnerHTML={{ __html: `${isCorrect ? '✓' : '✗'} ${opt.explain}` }} /></motion.div>)}</div>);
              })}
            </div>
            {gameAnswers[gameRound] !== null && gameRound < gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5"><button onClick={() => setGameRound(r => r + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button></motion.div>)}
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Outstanding — you can extract actionable intelligence from performance data.' : gameScore >= 3 ? 'Good — focus on the difference between symptoms and root causes in review analysis.' : 'Re-read the 30-Minute Framework and the Action Item Formula, then retry.'}</p></motion.div>)}
          </div>
        </motion.div>
      </section>

      {/* S11 — Quiz + Certificate */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-2xl font-extrabold mb-2">Final Quiz</h2>
          <p className="text-gray-400 text-sm mb-6">8 questions — 66% to earn your certificate.</p>
          <div className="space-y-6">
            {quizQuestions.map((q, qi) => (
              <div key={qi} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p>
                <p className="text-sm text-gray-300 mb-4">{q.q}</p>
                <div className="space-y-2">{q.opts.map((opt, oi) => { const chosen = quizAnswers[qi] === oi; const isRight = oi === q.correct; const cls = quizAnswers[qi] === null ? 'bg-white/[0.03] border border-white/10 hover:border-amber-500/30' : isRight ? 'bg-green-500/10 border border-green-500/30' : chosen ? 'bg-red-500/10 border border-red-500/30' : 'bg-white/[0.02] border border-white/5 opacity-50'; return <button key={oi} onClick={() => handleQuizAnswer(qi, oi)} disabled={quizAnswers[qi] !== null} className={`w-full text-left p-3 rounded-xl text-sm transition-all ${cls}`}>{opt}</button>; })}</div>
              </div>
            ))}
          </div>
          {quizAnswers.every(a => a !== null) && !quizDone && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 text-center"><button onClick={() => setQuizDone(true)} className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white font-bold text-sm active:scale-95 transition-transform">Submit Quiz</button></motion.div>)}
          {quizDone && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center"><p className="text-3xl font-extrabold mb-2">{quizScore}%</p><p className="text-sm text-gray-400">{quizScore >= 66 ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate. Review and try again.'}</p></motion.div>)}
          {certUnlocked && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10">
              <div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(139,92,246,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
                <div className="relative z-10 text-center">
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 via-pink-500 to-blue-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">📋</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 7: The Weekly Performance Review</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-pink-400 to-blue-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Performance Analyst &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L7.13-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
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
