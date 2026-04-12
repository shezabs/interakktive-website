// app/academy/lesson/pre-session-routine/page.tsx
// ATLAS Academy — Lesson 7.2: Pre-Session Routine [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 7
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
// ANIMATION 1: Prepared vs Reactive Trader
// Two equity curves — one with routine, one without
// ============================================================
function PreparedVsReactiveAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.005;
    const pad = 30;
    const top = 48;
    const bot = h - 30;
    const progress = Math.min(1, (t % 5) / 4);
    const seed = (n: number) => Math.sin(n * 127.1 + 311.7) * 0.5 + 0.5;
    const totalBars = 80;
    const visBars = Math.floor(progress * totalBars);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('20 Trading Days: Prepared vs Reactive', w / 2, 14);

    // Legend
    ctx.fillStyle = '#34d399'; ctx.fillRect(w / 2 - 110, 26, 10, 10);
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '10px system-ui'; ctx.textAlign = 'left';
    ctx.fillText('With Pre-Session Routine', w / 2 - 96, 35);
    ctx.fillStyle = '#ef4444'; ctx.fillRect(w / 2 + 30, 26, 10, 10);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText('No Routine', w / 2 + 44, 35);

    const chartW = w - pad * 2;

    // Prepared trader — consistent, fewer big losses
    ctx.beginPath();
    let prepBal = 10000;
    for (let i = 0; i <= visBars; i++) {
      const dayType = seed(i * 7);
      // Prepared: higher WR, fewer emotional trades, skips bad sessions
      const skip = dayType < 0.15; // 15% days skipped (bad emotional state or no setup)
      if (skip) { /* flat day */ } else {
        const win = seed(i * 11) < 0.55;
        prepBal += win ? 180 : -100;
      }
      const px = pad + (i / totalBars) * chartW;
      const py = bot - ((prepBal - 8500) / 5000) * (bot - top);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = '#34d399'; ctx.lineWidth = 2.5; ctx.stroke();

    // Reactive trader — trades every day, emotional, inconsistent
    ctx.beginPath();
    let reactBal = 10000;
    for (let i = 0; i <= visBars; i++) {
      const win = seed(i * 11) < 0.45; // lower WR from poor preparation
      const revenge = seed(i * 17) < 0.12; // 12% revenge trades
      reactBal += win ? 150 : -120;
      if (revenge) reactBal -= 100; // extra loss from revenge
      const px = pad + (i / totalBars) * chartW;
      const py = bot - ((reactBal - 8500) / 5000) * (bot - top);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2; ctx.stroke();

    // P&L labels
    if (visBars > 20) {
      ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'right';
      ctx.fillStyle = '#34d399';
      const prepPnl = prepBal - 10000;
      ctx.fillText(`£${prepPnl > 0 ? '+' : ''}${prepPnl.toLocaleString()}`, w - pad, top + 10);
      ctx.fillStyle = '#ef4444';
      const reactPnl = reactBal - 10000;
      ctx.fillText(`£${reactPnl > 0 ? '+' : ''}${reactPnl.toLocaleString()}`, w - pad, top + 28);
    }
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 2: 6-Phase Routine Clock
// Circular clock showing 6 phases lighting up sequentially
// ============================================================
function RoutineClockAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.006;
    const cx = w / 2;
    const cy = h / 2 + 5;
    const r = Math.min(w, h) * 0.32;
    const cycle = t % 8;
    const activePhase = Math.min(5, Math.floor(cycle * 0.9));

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('The 15-Minute Pre-Session Ritual', cx, 16);

    const phases = [
      { name: 'HTF Bias', icon: '📊', color: '#34d399', mins: '3 min' },
      { name: 'Key Levels', icon: '📍', color: '#3b82f6', mins: '3 min' },
      { name: 'Kill Zone', icon: '⏰', color: '#f59e0b', mins: '1 min' },
      { name: 'News Check', icon: '📰', color: '#ef4444', mins: '2 min' },
      { name: 'Mental State', icon: '🧠', color: '#d946ef', mins: '3 min' },
      { name: 'Risk Limits', icon: '🛡️', color: '#06b6d4', mins: '3 min' },
    ];

    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const px = cx + Math.cos(angle) * r;
      const py = cy + Math.sin(angle) * r;
      const active = i <= activePhase;
      const current = i === activePhase;

      // Connection line to center
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(px, py);
      ctx.strokeStyle = active ? phases[i].color : 'rgba(255,255,255,0.08)';
      ctx.lineWidth = active ? 2 : 1;
      ctx.stroke();

      // Node circle
      const nodeR = current ? 26 + Math.sin(t * 4) * 3 : active ? 24 : 20;
      ctx.beginPath();
      ctx.arc(px, py, nodeR, 0, Math.PI * 2);
      ctx.fillStyle = active ? phases[i].color + '30' : 'rgba(255,255,255,0.03)';
      ctx.fill();
      ctx.strokeStyle = active ? phases[i].color : 'rgba(255,255,255,0.1)';
      ctx.lineWidth = active ? 2 : 1;
      ctx.stroke();

      // Icon + label
      ctx.font = `${current ? '16' : '14'}px system-ui`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.fillText(phases[i].icon, px, py + 1);

      // Name below node
      ctx.font = '9px system-ui';
      ctx.fillStyle = active ? phases[i].color : 'rgba(255,255,255,0.3)';
      const labelY = py + nodeR + 14;
      ctx.fillText(phases[i].name, px, labelY);
      ctx.fillText(phases[i].mins, px, labelY + 12);
    }

    // Center hub
    const hubPulse = 0.5 + 0.5 * Math.sin(t * 3);
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.fillStyle = activePhase >= 5 ? `rgba(52,211,153,${0.15 + hubPulse * 0.15})` : 'rgba(245,158,11,0.1)';
    ctx.fill();
    ctx.strokeStyle = activePhase >= 5 ? '#34d399' : '#f59e0b';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = 'bold 10px system-ui';
    ctx.fillStyle = activePhase >= 5 ? '#34d399' : '#f59e0b';
    ctx.textAlign = 'center';
    ctx.fillText(activePhase >= 5 ? 'READY' : `${activePhase + 1}/6`, cx, cy + 4);
  }, []);
  return <AnimScene drawFn={draw} height={320} />;
}

// ============================================================
// DATA
// ============================================================
const routinePhases = [
  { phase: 1, name: 'HTF Bias Markup', time: '3 minutes', icon: '📊', desc: 'Open your Daily and 4H charts. Mark the current structure: is it bullish, bearish, or ranging? Identify the last BOS or CHoCH. Draw a simple arrow showing the direction you will trade today.', checklist: ['Daily trend direction marked', '4H structure identified (BOS/CHoCH)', 'Key OB or FVG zones highlighted', 'Bias written down: "Today I trade LONG/SHORT on [instrument]"'], warning: 'If the Daily and 4H disagree, your bias is NEUTRAL — you wait for alignment or trade with the higher timeframe only.', proTip: 'Take a screenshot of your marked-up chart BEFORE the session opens. Compare it to what actually happens after the session. This builds your bias accuracy over time.' },
  { phase: 2, name: 'Key Levels Identification', time: '3 minutes', icon: '📍', desc: 'Mark the levels where price is most likely to react: unfilled OBs, untested FVGs, liquidity pools (equal highs/lows), and previous session highs and lows. These are your "zones of interest" for the day.', checklist: ['Nearest demand OB marked', 'Nearest supply OB marked', 'Any unfilled FVGs highlighted', 'Liquidity pools identified (equal H/L)', 'Previous session H/L drawn'], warning: 'Do NOT mark 15 levels. Mark the 3-5 most relevant ones. Too many levels creates decision paralysis — you will not know which one to trade.', proTip: 'Use different colours: green for demand, red for supply, amber for liquidity targets. Consistency makes your charts instantly readable.' },
  { phase: 3, name: 'Kill Zone Timing', time: '1 minute', icon: '⏰', desc: 'Confirm which kill zone you are trading. Set a timer or alarm for the KZ open. Know exactly when your window starts and ends. No trading outside this window.', checklist: ['Kill zone identified (London/NY/Overlap)', 'Start and end times noted', 'Alarm or timer set', 'Committed: "I will NOT trade outside this window"'], warning: 'If you trade Gold (XAUUSD), your primary KZ is London Open (08:00-10:00 GMT) and NY Open (13:00-15:00 GMT). Trading Gold in Asia drops your win rate by 15-25% on average.', proTip: 'Put your KZ times on a sticky note next to your screen. When the KZ ends, close the chart. Do not "just check" what happens next — that is where FOMO lives.' },
  { phase: 4, name: 'News Calendar Check', time: '2 minutes', icon: '📰', desc: 'Open ForexFactory or your preferred calendar. Check for high-impact (red flag) events during your kill zone. If NFP, FOMC, CPI, or any red-flag event falls inside your KZ, you have a decision: skip the session or trade only AFTER the release and reaction settle.', checklist: ['Calendar checked for today', 'Red-flag events identified with times', 'Decision made: trade normally / skip / trade after release', 'No surprises — you know what is coming'], warning: 'The 15 minutes before AND after a high-impact release are a no-trade zone. Spread widens 2-5×, slippage spikes, and your stop can be triggered by spread alone — not by price action.', proTip: 'Bookmark ForexFactory with the filter set to "High Impact Only." It takes 30 seconds to check. Those 30 seconds can save you 3% of your account.' },
  { phase: 5, name: 'Emotional State Check', time: '3 minutes', icon: '🧠', desc: 'The most overlooked phase. Ask yourself honestly: How do I feel RIGHT NOW? Score yourself 1-10 on readiness. If you are tired, angry, distracted, or coming off a fight with someone, your execution WILL suffer. A 4/10 emotional state produces 4/10 trading.', checklist: ['Readiness score assigned (1-10)', 'If below 6: session is OFF — no exceptions', 'If 6-7: trade with HALF risk or watch only', 'If 8+: full execution authorised', 'Written in journal: "Emotional state: X/10 because..."'], warning: 'This is the phase most traders skip because they "feel fine." You never feel fine right before a revenge trade either. The check forces honesty. Write it down — your brain cannot lie to a pen.', proTip: 'If you slept less than 6 hours, your cognitive ability drops 15-30%. That alone is worth a skip. The market will be here tomorrow.' },
  { phase: 6, name: 'Risk & Session Limits', time: '3 minutes', icon: '🛡️', desc: 'Set your hard limits BEFORE you trade. Maximum risk per trade. Maximum trades for the session. Maximum daily loss. Write them on a sticky note or on your chart. These are not guidelines — they are laws.', checklist: ['Risk per trade confirmed (e.g. 1%)', 'Max trades for session set (e.g. 3)', 'Daily loss limit set (e.g. 2%)', 'Walk-away rule recalled: 3 consecutive losses = session over', 'Numbers written down or on screen'], warning: 'If you do not set these BEFORE the session, you will set them DURING the session — and that means emotion sets them, not logic.', proTip: 'Use the same limits every session. Consistency removes another decision from your execution. Fewer decisions = fewer mistakes.' },
];

const gameRounds = [
  { scenario: 'It is 07:45 GMT. London opens in 15 minutes. You sit down and immediately start scanning for setups on the 15M chart. You see a bullish engulfing at a demand zone on EUR/USD. You enter the trade at 07:52. Price spikes against you at 08:00 (London open liquidity grab) and stops you out. What went wrong?',
    options: [
      { text: 'The setup was invalid — bullish engulfing was a false signal', correct: false, explain: 'The engulfing was fine as a trigger. The problem is you entered 8 minutes before the kill zone opened, during the pre-session manipulation phase. The liquidity grab at 08:00 is EXACTLY what your pre-session routine would have warned you about.' },
      { text: 'No pre-session routine — jumped straight to a setup without checking bias, levels, timing, or news', correct: true, explain: 'Correct! You skipped all 6 phases. No HTF bias check (was the Daily even bullish?). No KZ timing (entered BEFORE the window). No levels marked (was that OB the best zone?). The routine exists to prevent exactly this: trading reactively instead of deliberately.' },
      { text: 'You should have used a wider stop to survive the spike', correct: false, explain: 'A wider stop does not fix the root cause. The problem is not stop width — it is entering before the kill zone during the manipulation phase. Your routine would have told you: wait for 08:00, observe the liquidity grab, THEN look for entries.' },
      { text: 'EUR/USD is too volatile during London open — switch instruments', correct: false, explain: 'EUR/USD during London open is actually one of the BEST times to trade it. The volatility is the opportunity. The problem is you entered the manipulation BEFORE the KZ instead of waiting for it to complete.' },
    ]
  },
  { scenario: 'You complete your pre-session routine. Phase 5 (Emotional State) reveals: you slept 4 hours, had an argument with your partner, and your readiness is 3/10. But you see a perfect Model 1 setup forming on Gold — BOS on 4H, pullback to a clean OB, London KZ is open. What do you do?',
    options: [
      { text: 'Take the trade — the setup is too good to miss', correct: false, explain: 'This is exactly how "one more trade" turns into 3 losses and a revenge spiral. A 3/10 emotional state means your decision-making, patience, and discipline are all impaired. The BEST setup in the world still needs YOU to manage it properly.' },
      { text: 'Take the trade but with half risk', correct: false, explain: 'Better than full risk, but still problematic. Half risk does not fix impaired judgment — it just halves the damage when you inevitably manage the trade poorly. A 3/10 is below the 6/10 minimum. The routine says: session OFF.' },
      { text: 'Skip the session entirely — 3/10 is below the 6/10 threshold', correct: true, explain: 'Correct! Your routine drew a clear line: below 6/10 = no trading. The Gold setup may win — but over 50 trades, your 3/10 sessions will produce net-negative results because YOU are the weakest link today. Screenshot the setup. Review it tomorrow. The market will produce another one.' },
      { text: 'Wait 30 minutes and reassess your emotional state', correct: false, explain: '4 hours of sleep and a fresh argument do not resolve in 30 minutes. Your cognitive impairment will last all day. The honest answer is: today is not your day. Protect your capital and your edge for when you ARE ready.' },
    ]
  },
  { scenario: 'During your Phase 4 (News Check), you see that US CPI data releases at 13:30 GMT — right in the middle of your NY kill zone (13:00-15:00). You trade XAUUSD (Gold). What is the correct adjustment?',
    options: [
      { text: 'Trade normally — CPI does not affect Gold', correct: false, explain: 'CPI significantly affects Gold. It directly impacts inflation expectations and rate-cut probability, both of which move Gold. Spread on XAUUSD can widen from 1.5 to 8+ pips around CPI.' },
      { text: 'No trades from 13:15-13:45. Look for setups only AFTER 13:45 when the reaction settles', correct: true, explain: 'Correct! The 15-minute buffer before AND after CPI protects you from spread widening, slippage, and the initial whipsaw. After 13:45, the market has digested the data and you can look for clean setups with normal spread.' },
      { text: 'Skip the entire NY session — too risky', correct: false, explain: 'Overly cautious. CPI creates ONE 30-minute danger window, not a full-session risk. Some of the cleanest setups form in the reaction AFTER CPI settles. You would miss those by skipping the entire session.' },
      { text: 'Enter trades BEFORE CPI to catch the move', correct: false, explain: 'Gambling, not trading. You do not know which direction CPI will push price. Entering before the release is a coin flip with 3-5× wider spread and guaranteed slippage. Your edge does not exist in this environment.' },
    ]
  },
  { scenario: 'You have been trading for 3 months with a pre-session routine and your results have improved: WR from 42% to 51%, avg R:R from 1:1.4 to 1:1.8. But the routine takes 15 minutes and you are tempted to shorten it to 5 minutes by skipping the emotional check and news check. What happens?',
    options: [
      { text: 'Nothing — the emotional check is just a formality after 3 months', correct: false, explain: 'The emotional check is not a beginner tool you graduate from. Emotional states are unpredictable — you cannot predict when a bad night or a stressful event will impair your trading. The check keeps you honest on the days it matters most.' },
      { text: 'Your WR and R:R will gradually slip back to pre-routine levels', correct: true, explain: 'Correct! The routine IS the reason your stats improved. Remove 2 phases and you reintroduce the exact errors they prevented. Within 4-8 weeks, you will see your old patterns return: emotional trades, news-related losses, and the "I should have checked" regret.' },
      { text: 'It is fine — 5 minutes is enough once you are experienced', correct: false, explain: 'Experience does not make you immune to emotions or news events. The 15 minutes is not a tax on your time — it is insurance on your capital. The improved results ARE the evidence that the routine works.' },
      { text: 'Shorten the routine but keep a written checklist to compensate', correct: false, explain: 'A checklist you rush through in 5 minutes is a checkbox exercise, not a genuine assessment. The emotional check requires honest self-reflection — that takes time. Skipping it means skipping honesty.' },
    ]
  },
  { scenario: 'Your pre-session routine shows: Daily BEARISH on GBPUSD (clear BOS down), 4H BEARISH, a clean supply OB at 1.2680, London KZ in 10 minutes, no news, emotional state 8/10, risk set at 1%. But on the 15M chart, price is showing a bullish CHoCH and pushing up toward your supply OB. You expected a pullback SHORT, but it looks like price might break through the OB. What do you do?',
    options: [
      { text: 'Flip your bias to bullish — the 15M CHoCH overrides the Daily', correct: false, explain: 'A 15M CHoCH does not override a Daily trend. The 15M is showing the PULLBACK into your supply zone — this is exactly what you wanted. The CHoCH on the lower timeframe is the price retracing up to give you a short entry. Your routine bias was correct.' },
      { text: 'Stick to your routine bias (bearish), wait for a short trigger at the 1.2680 OB', correct: true, explain: 'Correct! Your routine told you the bias, the level, and the plan. The 15M pushing UP into the supply OB is the setup forming — not a reason to flip. Wait for a bearish trigger (engulfing, rejection wick, LTF BOS down) at 1.2680. The routine gave you the framework; trust it.' },
      { text: 'Skip the trade — the conflicting timeframes create too much uncertainty', correct: false, explain: 'There is no conflict. The Daily is bearish. The 15M is pulling back UP into supply — that is a textbook continuation short setup. The routine prepared you for exactly this scenario. Skipping it means your preparation was wasted.' },
      { text: 'Enter short immediately at market price before it reaches the OB', correct: false, explain: 'Premature. Price has not reached your identified level (1.2680 OB) and there is no trigger yet. Your routine Phase 2 marked that OB for a reason — wait for price to arrive AND show a trigger. No trigger = no trade.' },
    ]
  },
];

const quizQuestions = [
  { q: 'How long should a complete pre-session routine take?', opts: ['2-3 minutes — quick scan is enough', '10-15 minutes — thorough but not excessive', '30-45 minutes — analysis paralysis is the goal', '60 minutes — mark every possible level'], correct: 1 },
  { q: 'What is the FIRST phase of the pre-session routine?', opts: ['Check the news calendar', 'Mark key levels on the 15M chart', 'Establish HTF bias on Daily and 4H charts', 'Set your risk limits'], correct: 2 },
  { q: 'Your emotional state check returns 5/10. What should you do?', opts: ['Trade normally — 5 is average', 'Trade with half risk or watch only', 'Increase risk to make the session worthwhile', 'Skip the routine — it is making you overthink'], correct: 1 },
  { q: 'During Phase 4, you see a red-flag news event 5 minutes into your kill zone. What is the correct adjustment?', opts: ['Skip the entire session', 'Create a 15-minute no-trade buffer before and after the release', 'Trade through it with a wider stop', 'Enter before the news to catch the move'], correct: 1 },
  { q: 'Why should you take a screenshot of your marked-up chart BEFORE the session?', opts: ['To post on social media', 'To compare your pre-session analysis with what actually happened — this builds bias accuracy', 'To have proof of your trades for your broker', 'To remember what levels you marked'], correct: 1 },
  { q: 'What happens when traders skip the pre-session routine after months of improved results?', opts: ['Nothing — the habits are now automatic', 'Results gradually slip back to pre-routine levels as old errors return', 'Results improve because the routine was a crutch', 'Only emotional results decline — technical results stay the same'], correct: 1 },
  { q: 'Phase 6 sets risk limits BEFORE the session. Why is this critical?', opts: ['To satisfy prop firm rules', 'Because limits set during a session are set by emotion, not logic', 'To avoid doing maths during the session', 'It is not critical — you can adjust limits in real-time'], correct: 1 },
  { q: 'How many key levels should you mark during Phase 2?', opts: ['As many as possible — more levels = more opportunities', '3-5 most relevant levels — too many creates decision paralysis', 'Exactly 2 — one buy and one sell', '10+ including minor support/resistance'], correct: 1 },
];

function Confetti({ active }: { active: boolean }) {
  if (!active) return null;
  return (<div className="fixed inset-0 pointer-events-none z-50">{Array.from({ length: 60 }).map((_, i) => (<motion.div key={i} initial={{ y: -20, x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400), opacity: 1 }} animate={{ y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 20, rotate: Math.random() * 720, opacity: 0 }} transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5 }} className="absolute w-2 h-2 rounded-sm" style={{ background: ['#f59e0b', '#d946ef', '#34d399', '#3b82f6', '#ef4444'][i % 5] }} />))}</div>);
}

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

export default function PreSessionRoutineLesson() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);

  const [openPhase, setOpenPhase] = useState<number | null>(null);

  // ============================================================
  // INTERACTIVE: 6-Phase Pre-Session Planner
  // Student fills each phase → gets a Session Ready score
  // ============================================================
  const [plannerPhase, setPlannerPhase] = useState(0);
  const [plannerData, setPlannerData] = useState({
    bias: '', biasInstrument: '', biasDirection: '',
    levels: ['', '', ''],
    killZone: '', kzStart: '', kzEnd: '',
    newsEvents: '', newsDecision: '',
    emotionalScore: 5, emotionalNote: '',
    riskPerTrade: '', maxTrades: '', dailyLossLimit: '',
  });
  const [plannerComplete, setPlannerComplete] = useState(false);

  const updatePlanner = (field: string, value: string | number) => {
    setPlannerData(prev => ({ ...prev, [field]: value }));
  };
  const updateLevel = (idx: number, value: string) => {
    setPlannerData(prev => {
      const levels = [...prev.levels];
      levels[idx] = value;
      return { ...prev, levels };
    });
  };

  const getPlannerScore = () => {
    let score = 0;
    if (plannerData.biasDirection) score += 15;
    if (plannerData.biasInstrument) score += 5;
    if (plannerData.levels.filter(l => l.trim()).length >= 2) score += 15;
    if (plannerData.killZone) score += 10;
    if (plannerData.kzStart && plannerData.kzEnd) score += 5;
    if (plannerData.newsDecision) score += 10;
    if (plannerData.emotionalScore >= 6) score += 15;
    else if (plannerData.emotionalScore >= 4) score += 5;
    if (plannerData.emotionalNote) score += 5;
    if (plannerData.riskPerTrade) score += 10;
    if (plannerData.maxTrades) score += 5;
    if (plannerData.dailyLossLimit) score += 5;
    return score;
  };

  const getReadinessGrade = (score: number) => {
    if (score >= 90) return { grade: 'SESSION READY ✅', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', msg: 'All 6 phases complete. You have a clear bias, identified levels, timing confirmed, news checked, emotional state verified, and risk limits set. Execute with confidence.' };
    if (score >= 70) return { grade: 'MOSTLY READY ⚠️', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', msg: 'Good preparation but some gaps remain. Fill in the missing fields — each one reduces a specific execution error.' };
    if (score >= 50) return { grade: 'UNDERPREPARED ⚠️', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', msg: 'Several phases are incomplete. Trading with this level of preparation invites reactive decisions. Complete the routine before opening any trade.' };
    return { grade: 'NOT READY ❌', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', msg: 'Your preparation is critically incomplete. Trading now is gambling. Finish the routine or skip the session.' };
  };

  // Game
  const [gameRound, setGameRound] = useState(0);
  const [gameAnswers, setGameAnswers] = useState<(number | null)[]>(Array(gameRounds.length).fill(null));
  const [gameScore, setGameScore] = useState(0);
  const handleGameAnswer = (optIdx: number) => { if (gameAnswers[gameRound] !== null) return; const next = [...gameAnswers]; next[gameRound] = optIdx; setGameAnswers(next); if (gameRounds[gameRound].options[optIdx].correct) setGameScore(s => s + 1); };

  // Quiz
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(Array(quizQuestions.length).fill(null));
  const [quizDone, setQuizDone] = useState(false);
  const handleQuizAnswer = (qi: number, oi: number) => { if (quizDone) return; const next = [...quizAnswers]; next[qi] = oi; setQuizAnswers(next); };
  const quizScore = quizDone ? Math.round((quizAnswers.filter((a, i) => a === quizQuestions[i].correct).length / quizQuestions.length) * 100) : 0;
  const certUnlocked = quizDone && quizScore >= 66;
  const [showConfetti, setShowConfetti] = useState(false);
  useEffect(() => { if (certUnlocked) { setShowConfetti(true); const t = setTimeout(() => setShowConfetti(false), 4000); return () => clearTimeout(t); }}, [certUnlocked]);

  const plannerScore = getPlannerScore();
  const readiness = getReadinessGrade(plannerScore);

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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 7 &middot; Lesson 2</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Pre-Session<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Routine</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">15 minutes of preparation prevents 15 days of regret. Build a pre-session ritual that transforms your trading from reactive to deliberate.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* S00 */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">🔍 The Pilot&apos;s Pre-Flight Checklist</p>
            <p className="text-gray-400 leading-relaxed mb-4">Every commercial pilot — no matter how experienced — runs a pre-flight checklist before takeoff. They check fuel, instruments, weather, runway conditions, and emergency procedures. Every. Single. Flight. They do not skip it because they have done it 10,000 times. They do not rush it because they are running late.</p>
            <p className="text-gray-400 leading-relaxed">A pilot who skips the checklist is not confident — they are dangerous. Your pre-session routine is your pre-flight checklist. The 15 minutes you invest before the session prevents the 3 catastrophic mistakes you would make without it. Professionals do not trade on talent. They trade on preparation.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">A prop firm tracked <strong className="text-white">312 funded traders</strong> for 6 months. Traders who used a documented pre-session routine: <strong className="text-green-400">51% WR, 1:1.8 R:R, 12% average monthly return</strong>. Traders without: <strong className="text-red-400">43% WR, 1:1.3 R:R, 3% average monthly return</strong>. The routine traders also had <strong className="text-green-400">67% fewer revenge trades</strong> and <strong className="text-green-400">42% fewer emotional rule breaks</strong>. Same strategies. Same markets. The only difference: 15 minutes of preparation.</p>
          </div>
        </motion.div>
      </section>

      {/* S01 — Prepared vs Reactive Animation */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The 20-Day Comparison</p>
          <h2 className="text-2xl font-extrabold mb-4">Prepared vs Reactive</h2>
          <p className="text-gray-400 text-sm mb-6">Same strategy, same market conditions, same capital. One trader runs the routine. The other sits down and starts clicking. Watch the difference compound over 20 days.</p>
          <PreparedVsReactiveAnimation />
        </motion.div>
      </section>

      {/* S02 — Routine Clock Animation */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The 6-Phase Ritual</p>
          <h2 className="text-2xl font-extrabold mb-4">15 Minutes. 6 Phases. Zero Excuses.</h2>
          <p className="text-gray-400 text-sm mb-6">Watch each phase activate in sequence. When all 6 light up, you are SESSION READY. Skip one, and you trade with a blind spot.</p>
          <RoutineClockAnimation />
        </motion.div>
      </section>

      {/* S03-S04: 6 Phases Deep Dive (split into expandable sections) */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The 6 Phases</p>
          <h2 className="text-2xl font-extrabold mb-4">Your Complete Pre-Session Playbook</h2>
          <p className="text-gray-400 text-sm mb-6">Each phase has a specific purpose, a checklist, a warning, and a pro tip. Expand each to learn exactly what to do.</p>
          <div className="space-y-3">
            {routinePhases.map((phase, i) => (
              <div key={i} className="rounded-xl border border-white/5 overflow-hidden">
                <button onClick={() => setOpenPhase(openPhase === i ? null : i)} className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center text-sm flex-shrink-0">{phase.icon}</span>
                    <div className="text-left">
                      <p className="text-sm font-bold text-white">Phase {phase.phase}: {phase.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{phase.time}</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openPhase === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openPhase === i && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="px-4 pb-4 space-y-3">
                  <p className="text-sm text-gray-400 leading-relaxed">{phase.desc}</p>
                  <div className="p-3 rounded-lg bg-white/[0.02]">
                    <p className="text-xs font-bold text-green-400 mb-2">✅ Checklist</p>
                    <div className="space-y-1.5">{phase.checklist.map((item, ci) => (<p key={ci} className="text-xs text-gray-400 flex items-start gap-2"><span className="text-green-400 mt-0.5">•</span>{item}</p>))}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                    <p className="text-xs font-bold text-red-400 mb-1">⚠️ Warning</p>
                    <p className="text-xs text-gray-400 leading-relaxed">{phase.warning}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                    <p className="text-xs font-bold text-amber-400 mb-1">💡 Pro Tip</p>
                    <p className="text-xs text-gray-400 leading-relaxed">{phase.proTip}</p>
                  </div>
                </div></motion.div>)}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S04 — Why Each Phase Exists */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Why Each Phase Exists</p>
          <h2 className="text-2xl font-extrabold mb-4">The Error Each Phase Prevents</h2>
          <p className="text-gray-400 text-sm mb-6">Every phase in the routine was born from a specific trading failure. Skip the phase, invite the error.</p>
          <div className="space-y-3">
            {[
              { phase: 'HTF Bias', error: 'Trading against the trend', cost: 'Counter-trend trades have 35-40% lower WR on average. Without a bias, you take trades in both directions and wonder why half of them fail.', color: 'border-green-500/20' },
              { phase: 'Key Levels', error: 'Trading in no-man\'s land', cost: 'Entries away from key levels have no logical stop placement and no structural target. Your R:R is random, not planned.', color: 'border-blue-500/20' },
              { phase: 'Kill Zone', error: 'Trading dead sessions', cost: 'Gold in Asia: 29% WR vs London: 57% WR (from Level 6). Session timing alone can halve or double your edge.', color: 'border-amber-500/20' },
              { phase: 'News Check', error: 'Stop triggered by spread, not price', cost: 'A 5-pip spread spike on a 10-pip stop = 50% of your risk consumed by spread alone. One surprise news event can cost 2-3% of your account.', color: 'border-red-500/20' },
              { phase: 'Mental State', error: 'Revenge trades and emotional overrides', cost: 'Emotional sessions produce 2-3× more rule breaks. A 3/10 day with 2 revenge trades can cost more than a full week of disciplined trading.', color: 'border-purple-500/20' },
              { phase: 'Risk Limits', error: 'No hard stop on the damage', cost: 'Without a daily loss limit, one bad session becomes a 5%+ drawdown. With a 2% cap, the worst day costs exactly 2%.', color: 'border-cyan-500/20' },
            ].map((item, i) => (
              <div key={i} className={`p-4 rounded-xl border ${item.color} bg-white/[0.01]`}>
                <div className="flex items-center gap-2 mb-2"><span className="text-xs font-bold text-amber-400">Phase {i + 1}: {item.phase}</span><span className="text-[10px] text-gray-600">→</span><span className="text-xs font-bold text-red-400">Prevents: {item.error}</span></div>
                <p className="text-xs text-gray-400 leading-relaxed">{item.cost}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S05 — Interactive 6-Phase Pre-Session Planner */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Your Pre-Session Planner</p>
          <h2 className="text-2xl font-extrabold mb-4">Build Your Session Plan — Right Now</h2>
          <p className="text-gray-400 text-sm mb-6">Fill in each phase as if you are preparing for a real session. When complete, you will get a Session Readiness score. Use this tool before every session.</p>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-6">
            {/* Phase tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-2">
              {['📊 Bias', '📍 Levels', '⏰ KZ', '📰 News', '🧠 Mental', '🛡️ Risk'].map((label, i) => (
                <button key={i} onClick={() => setPlannerPhase(i)} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${plannerPhase === i ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-white/[0.03] text-gray-500 border border-white/5 hover:text-gray-300'}`}>{label}</button>
              ))}
            </div>

            {/* Phase 1: Bias */}
            {plannerPhase === 0 && (<div className="space-y-3">
              <p className="text-xs font-bold text-amber-400">Phase 1: HTF Bias Markup</p>
              <div className="space-y-2">
                <div><label className="text-xs text-gray-500 block mb-1">Instrument</label><input type="text" placeholder="e.g. XAUUSD, GBPUSD" value={plannerData.biasInstrument} onChange={e => updatePlanner('biasInstrument', e.target.value)} className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500/50" /></div>
                <div><label className="text-xs text-gray-500 block mb-1">HTF Bias Direction</label>
                  <div className="flex gap-2">{['BULLISH', 'BEARISH', 'NEUTRAL'].map(d => (<button key={d} onClick={() => updatePlanner('biasDirection', d)} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${plannerData.biasDirection === d ? (d === 'BULLISH' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : d === 'BEARISH' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30') : 'bg-white/[0.03] text-gray-500 border border-white/5'}`}>{d}</button>))}</div>
                </div>
                <div><label className="text-xs text-gray-500 block mb-1">Bias Notes (e.g. &quot;Daily BOS up, 4H OB at 2,340&quot;)</label><input type="text" placeholder="What the structure says..." value={plannerData.bias} onChange={e => updatePlanner('bias', e.target.value)} className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500/50" /></div>
              </div>
            </div>)}

            {/* Phase 2: Levels */}
            {plannerPhase === 1 && (<div className="space-y-3">
              <p className="text-xs font-bold text-amber-400">Phase 2: Key Levels</p>
              <p className="text-xs text-gray-500">Mark your top 3 zones of interest (OBs, FVGs, liquidity pools)</p>
              {plannerData.levels.map((level, i) => (<div key={i}><label className="text-xs text-gray-500 block mb-1">Level {i + 1}</label><input type="text" placeholder={`e.g. ${['Demand OB at 2,328-2,332', 'Supply OB at 2,365-2,370', 'Equal lows liquidity at 2,310'][i]}`} value={level} onChange={e => updateLevel(i, e.target.value)} className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500/50" /></div>))}
            </div>)}

            {/* Phase 3: Kill Zone */}
            {plannerPhase === 2 && (<div className="space-y-3">
              <p className="text-xs font-bold text-amber-400">Phase 3: Kill Zone Timing</p>
              <div><label className="text-xs text-gray-500 block mb-1">Which Kill Zone?</label>
                <div className="flex gap-2 flex-wrap">{['London Open', 'NY Open', 'London/NY Overlap', 'Other'].map(kz => (<button key={kz} onClick={() => updatePlanner('killZone', kz)} className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${plannerData.killZone === kz ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-white/[0.03] text-gray-500 border border-white/5'}`}>{kz}</button>))}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs text-gray-500 block mb-1">KZ Start (GMT)</label><input type="text" placeholder="e.g. 08:00" value={plannerData.kzStart} onChange={e => updatePlanner('kzStart', e.target.value)} className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500/50" /></div>
                <div><label className="text-xs text-gray-500 block mb-1">KZ End (GMT)</label><input type="text" placeholder="e.g. 10:00" value={plannerData.kzEnd} onChange={e => updatePlanner('kzEnd', e.target.value)} className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500/50" /></div>
              </div>
            </div>)}

            {/* Phase 4: News */}
            {plannerPhase === 3 && (<div className="space-y-3">
              <p className="text-xs font-bold text-amber-400">Phase 4: News Calendar Check</p>
              <div><label className="text-xs text-gray-500 block mb-1">Any red-flag events during your KZ?</label><input type="text" placeholder="e.g. CPI at 13:30 GMT, or 'None'" value={plannerData.newsEvents} onChange={e => updatePlanner('newsEvents', e.target.value)} className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500/50" /></div>
              <div><label className="text-xs text-gray-500 block mb-1">Your decision</label>
                <div className="flex gap-2 flex-wrap">{['Trade normally', 'Buffer around event', 'Trade after only', 'Skip session'].map(d => (<button key={d} onClick={() => updatePlanner('newsDecision', d)} className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${plannerData.newsDecision === d ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-white/[0.03] text-gray-500 border border-white/5'}`}>{d}</button>))}</div>
              </div>
            </div>)}

            {/* Phase 5: Emotional State */}
            {plannerPhase === 4 && (<div className="space-y-3">
              <p className="text-xs font-bold text-amber-400">Phase 5: Emotional State Check</p>
              <div><label className="text-xs text-gray-500 block mb-1">Readiness Score: <span className={`font-bold ${plannerData.emotionalScore >= 8 ? 'text-green-400' : plannerData.emotionalScore >= 6 ? 'text-amber-400' : 'text-red-400'}`}>{plannerData.emotionalScore}/10</span></label>
                <input type="range" min={1} max={10} value={plannerData.emotionalScore} onChange={e => updatePlanner('emotionalScore', parseInt(e.target.value))} className="w-full accent-amber-500" />
                <div className="flex justify-between text-[10px] text-gray-600"><span>1 — Skip</span><span>6 — Minimum</span><span>10 — Peak</span></div>
              </div>
              {plannerData.emotionalScore < 6 && (<div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20"><p className="text-xs text-red-400 font-bold">⚠️ Below 6/10 — Session should be OFF. Protect your capital for a better day.</p></div>)}
              <div><label className="text-xs text-gray-500 block mb-1">Why this score? (be honest)</label><input type="text" placeholder="e.g. 'Slept well, feeling focused' or 'Tired, had an argument'" value={plannerData.emotionalNote} onChange={e => updatePlanner('emotionalNote', e.target.value)} className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500/50" /></div>
            </div>)}

            {/* Phase 6: Risk Limits */}
            {plannerPhase === 5 && (<div className="space-y-3">
              <p className="text-xs font-bold text-amber-400">Phase 6: Risk & Session Limits</p>
              <div className="grid grid-cols-3 gap-2">
                <div><label className="text-xs text-gray-500 block mb-1">Risk/trade (%)</label><input type="text" placeholder="e.g. 1%" value={plannerData.riskPerTrade} onChange={e => updatePlanner('riskPerTrade', e.target.value)} className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white text-center focus:outline-none focus:border-amber-500/50" /></div>
                <div><label className="text-xs text-gray-500 block mb-1">Max trades</label><input type="text" placeholder="e.g. 3" value={plannerData.maxTrades} onChange={e => updatePlanner('maxTrades', e.target.value)} className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white text-center focus:outline-none focus:border-amber-500/50" /></div>
                <div><label className="text-xs text-gray-500 block mb-1">Daily loss cap (%)</label><input type="text" placeholder="e.g. 2%" value={plannerData.dailyLossLimit} onChange={e => updatePlanner('dailyLossLimit', e.target.value)} className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white text-center focus:outline-none focus:border-amber-500/50" /></div>
              </div>
              <button onClick={() => setPlannerComplete(true)} className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white font-bold text-sm active:scale-95 transition-transform mt-2">Complete Routine → Get Score</button>
            </div>)}

            {/* Navigation */}
            <div className="flex justify-between pt-2">
              <button onClick={() => setPlannerPhase(Math.max(0, plannerPhase - 1))} disabled={plannerPhase === 0} className="px-4 py-2 rounded-lg bg-white/[0.03] text-xs font-bold text-gray-500 disabled:opacity-30">&larr; Previous</button>
              <button onClick={() => setPlannerPhase(Math.min(5, plannerPhase + 1))} disabled={plannerPhase === 5} className="px-4 py-2 rounded-lg bg-white/[0.03] text-xs font-bold text-gray-500 disabled:opacity-30">Next &rarr;</button>
            </div>

            {/* Score */}
            {plannerComplete && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
              <div className={`p-5 rounded-xl border ${readiness.bg}`}>
                <div className="flex items-center justify-between mb-3">
                  <p className={`text-lg font-black ${readiness.color}`}>{readiness.grade}</p>
                  <p className="text-2xl font-black text-white">{plannerScore}%</p>
                </div>
                <div className="w-full h-2 bg-black/30 rounded-full mb-3"><div className={`h-full rounded-full transition-all ${plannerScore >= 90 ? 'bg-green-500' : plannerScore >= 70 ? 'bg-amber-500' : plannerScore >= 50 ? 'bg-orange-500' : 'bg-red-500'}`} style={{ width: `${plannerScore}%` }} /></div>
                <p className="text-xs text-gray-400 leading-relaxed">{readiness.msg}</p>
              </div>
            </motion.div>)}
          </div>
        </motion.div>
      </section>

      {/* S06 — Non-Negotiable Rules */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Non-Negotiable Rules</p>
          <h2 className="text-2xl font-extrabold mb-4">The Lines You Never Cross</h2>
          <div className="space-y-3">
            {[
              { rule: 'NEVER trade without completing all 6 phases', reason: 'Each skipped phase is a blind spot. One blind spot is a mistake. Two blind spots is a pattern. Three is a blown account.' },
              { rule: 'NEVER override the emotional check', reason: 'If you score yourself below 6/10 and trade anyway, you are proving that you cannot trust your own system. That is a bigger problem than missing one session.' },
              { rule: 'NEVER extend the kill zone because "the setup looks close"', reason: 'The KZ boundaries exist because your win rate drops outside them. Extending the window to take "one more trade" is how discipline erodes.' },
              { rule: 'NEVER start the routine during the session', reason: 'A routine completed after price starts moving is a rationalisation exercise, not preparation. Do it 15 minutes before or not at all.' },
            ].map((r, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-red-500/10">
                <p className="text-sm font-bold text-red-400 mb-2">🚫 {r.rule}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{r.reason}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S07 — Building the Habit */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Building the Habit</p>
          <h2 className="text-2xl font-extrabold mb-4">From Effort to Autopilot</h2>
          <p className="text-gray-400 text-sm mb-6">The routine feels slow at first. After 2-3 weeks, it takes under 10 minutes and becomes automatic — like brushing your teeth.</p>
          <div className="space-y-3">
            {[
              { week: 'Week 1-2', title: 'Mechanical', desc: 'It feels forced. You keep forgetting steps. Use a physical checklist (print it, stick it to your monitor). Time yourself — it should take 12-18 minutes.', color: 'text-red-400' },
              { week: 'Week 3-4', title: 'Habitual', desc: 'You remember most steps without the checklist. Time drops to 8-12 minutes. You start noticing WHEN you have skipped a phase because something feels off.', color: 'text-amber-400' },
              { week: 'Month 2+', title: 'Automatic', desc: 'The routine IS your trading identity. Skipping it feels wrong — like leaving the house without your phone. Time: 8-10 minutes. Your execution stats show measurable improvement.', color: 'text-green-400' },
            ].map((stage, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-3 mb-2"><span className={`text-xs font-bold ${stage.color}`}>{stage.week}</span><span className="text-sm font-bold text-white">{stage.title}</span></div>
                <p className="text-xs text-gray-400 leading-relaxed">{stage.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S08 — Common Mistakes */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-4">What NOT to Do</h2>
          <div className="space-y-3">
            {[
              { mistake: 'Doing the routine in your head instead of writing it down', fix: 'Your brain lies. A written routine forces specificity. "I think the bias is bullish" becomes "Daily BOS up at 2,340, 4H OB at 2,328." Precision prevents ambiguity.' },
              { mistake: 'Marking 10+ levels on your chart', fix: '3-5 levels maximum. More levels = more decisions = more paralysis. You do not need to mark every possible reaction point. Mark the MOST LIKELY ones.' },
              { mistake: 'Skipping the emotional check because "I always feel fine"', fix: 'You also "felt fine" before your last 3 revenge trades. The check is insurance. The day you truly need it, you will be glad it is there.' },
              { mistake: 'Doing the routine but trading outside its parameters', fix: 'A routine you do not follow is a ritual, not a system. If your routine says BEARISH and you take a LONG trade, the routine failed because YOU failed — not the routine.' },
            ].map((m, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <p className="text-sm font-bold text-red-400 mb-2">❌ {m.mistake}</p>
                <p className="text-xs text-gray-400 leading-relaxed">✅ {m.fix}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S09 — Cheat Sheet */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Cheat Sheet</p>
          <h2 className="text-2xl font-extrabold mb-4">Pre-Session Quick Reference</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { title: 'Phase 1: HTF Bias', body: 'Daily + 4H structure. Mark BOS/CHoCH. Write direction. Disagreement = NEUTRAL.', color: 'border-green-500/20 bg-green-500/5' },
              { title: 'Phase 2: Key Levels', body: '3-5 zones only. OBs, FVGs, liquidity pools. Use consistent colours. Less is more.', color: 'border-blue-500/20 bg-blue-500/5' },
              { title: 'Phase 3: Kill Zone', body: 'Set timer for KZ start/end. No trading outside. Close chart when KZ ends.', color: 'border-amber-500/20 bg-amber-500/5' },
              { title: 'Phase 4: News', body: 'Check ForexFactory. Red-flag = 15-min buffer. No trades 15 min before or after.', color: 'border-red-500/20 bg-red-500/5' },
              { title: 'Phase 5: Mental State', body: 'Score 1-10. Below 6 = session OFF. 6-7 = half risk. 8+ = full execution.', color: 'border-purple-500/20 bg-purple-500/5' },
              { title: 'Phase 6: Risk Limits', body: 'Risk/trade, max trades, daily loss cap. Written down. Not negotiable mid-session.', color: 'border-cyan-500/20 bg-cyan-500/5' },
            ].map((card, i) => (
              <div key={i} className={`p-4 rounded-xl border ${card.color}`}>
                <p className="text-xs font-bold text-white mb-1">{card.title}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S10 — Game */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-2xl font-extrabold mb-2">Pre-Session Game</h2>
          <p className="text-gray-400 text-sm mb-6">5 real trading scenarios. In each, identify the routine failure or make the correct pre-session decision.</p>
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center justify-between mb-4"><span className="text-xs font-bold text-amber-400">Round {gameRound + 1} of {gameRounds.length}</span><span className="text-xs font-mono text-gray-500">{gameScore}/{gameRounds.length} correct</span></div>
            <p className="text-sm text-gray-300 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: gameRounds[gameRound].scenario }} />
            <div className="space-y-2.5">
              {gameRounds[gameRound].options.map((opt, oi) => {
                const answered = gameAnswers[gameRound] !== null;
                const selected = gameAnswers[gameRound] === oi;
                const isCorrect = opt.correct;
                const cls = !answered ? 'bg-white/[0.03] border border-white/10 hover:border-amber-500/30' : isCorrect ? 'bg-green-500/10 border border-green-500/30' : selected ? 'bg-red-500/10 border border-red-500/30' : 'bg-white/[0.02] border border-white/5 opacity-50';
                return (<div key={oi}><button onClick={() => handleGameAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt.text }} /></button>{answered && selected && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]"><p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`} dangerouslySetInnerHTML={{ __html: `${isCorrect ? '✓' : '✗'} ${opt.explain}` }} /></motion.div>)}</div>);
              })}
            </div>
            {gameAnswers[gameRound] !== null && gameRound < gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5"><button onClick={() => setGameRound(r => r + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button></motion.div>)}
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Excellent — you understand why preparation beats reaction every time.' : gameScore >= 3 ? 'Good — review the 6 phases and the non-negotiable rules.' : 'Re-read the 6 phases carefully, then try again.'}</p></motion.div>)}
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
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-3xl shadow-lg shadow-blue-500/30">✈️</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 7: Pre-Session Routine</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Flight Planner &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L7.2-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
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
