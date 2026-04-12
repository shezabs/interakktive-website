// app/academy/lesson/first-five-seconds/page.tsx
// ATLAS Academy — Lesson 7.4: The First 5 Seconds [PRO]
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
// ANIMATION 1: The Psychological Tsunami
// Heart rate / stress spike at the moment of fill
// ============================================================
function PsychTsunamiAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.006;
    const pad = 30;
    const top = 50;
    const bot = h - 30;
    const cx = w / 2;
    const cycle = t % 7;
    const progress = Math.min(1, cycle / 5.5);
    const totalPts = 120;
    const visPts = Math.floor(progress * totalPts);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Your Stress Level: Before, During, and After Entry', cx, 16);

    // Timeline labels
    ctx.font = '9px system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    const labels = ['Scanning', 'Setup Found', 'TRIGGER', 'FILLED', 'First 5 sec', '30 sec', '2 min', 'Settled'];
    const labelPositions = [0.05, 0.2, 0.35, 0.42, 0.5, 0.6, 0.75, 0.9];
    labelPositions.forEach((pos, i) => {
      const x = pad + pos * (w - pad * 2);
      if (pos <= progress) {
        ctx.fillStyle = i === 3 ? '#ef4444' : 'rgba(255,255,255,0.3)';
        ctx.textAlign = 'center';
        ctx.fillText(labels[i], x, bot + 16);
      }
    });

    // Fill marker line
    const fillX = pad + 0.42 * (w - pad * 2);
    if (progress > 0.42) {
      ctx.strokeStyle = 'rgba(239,68,68,0.4)';
      ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(fillX, top); ctx.lineTo(fillX, bot); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#ef4444'; ctx.font = 'bold 9px system-ui'; ctx.textAlign = 'center';
      ctx.fillText('ORDER FILLED', fillX, top - 5);
    }

    // Stress curve
    ctx.beginPath();
    for (let i = 0; i <= visPts; i++) {
      const x = pad + (i / totalPts) * (w - pad * 2);
      const norm = i / totalPts;
      let stress = 20; // baseline

      if (norm < 0.2) stress = 20 + norm * 30; // slight rise during scanning
      else if (norm < 0.35) stress = 26 + (norm - 0.2) * 200; // rising as setup forms
      else if (norm < 0.42) stress = 56 + (norm - 0.35) * 400; // spike approaching trigger
      else if (norm < 0.5) stress = 84 + (norm - 0.42) * 200; // PEAK at fill
      else if (norm < 0.6) stress = 100 - (norm - 0.5) * 200; // sharp drop as adrenaline fades
      else if (norm < 0.75) stress = 80 - (norm - 0.6) * 200; // settling
      else stress = 50 - (norm - 0.75) * 120; // back toward baseline

      stress = Math.max(15, Math.min(100, stress));
      // Add heart-rate-like noise near the peak
      if (norm > 0.35 && norm < 0.65) {
        stress += Math.sin(i * 0.8) * 5;
      }

      const y = bot - (stress / 100) * (bot - top);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }

    // Gradient line colour
    const peakReached = progress > 0.45;
    ctx.strokeStyle = peakReached ? '#ef4444' : '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Peak label
    if (progress > 0.5) {
      const pulse = 0.5 + 0.5 * Math.sin(t * 4);
      ctx.fillStyle = `rgba(239,68,68,${0.5 + pulse * 0.5})`;
      ctx.font = 'bold 12px system-ui';
      ctx.textAlign = 'center';
      const peakX = pad + 0.46 * (w - pad * 2);
      const peakY = top + 5;
      ctx.fillText('⚠ PEAK STRESS', peakX, peakY);
      ctx.font = '9px system-ui';
      ctx.fillText('This is where 80% of mistakes happen', peakX, peakY + 14);
    }

    // Y-axis labels
    ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.font = '8px system-ui'; ctx.textAlign = 'right';
    ctx.fillText('High', pad - 5, top + 5);
    ctx.fillText('Low', pad - 5, bot);
    ctx.fillText('Stress', pad - 5, (top + bot) / 2);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 2: Post-Fill Protocol — 8 items checking off
// ============================================================
function PostFillProtocolAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.007;
    const cycle = t % 8;
    const activeItem = Math.min(7, Math.floor(cycle));

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('The 5-Second Post-Fill Protocol', w / 2, 16);

    const items = [
      { check: 'Stop Loss LIVE?', icon: '🛡️', time: '0.5s' },
      { check: 'Take Profit SET?', icon: '🎯', time: '0.5s' },
      { check: 'Position Size CORRECT?', icon: '📐', time: '0.5s' },
      { check: 'Correct Instrument?', icon: '📊', time: '0.3s' },
      { check: 'Screenshot TAKEN?', icon: '📸', time: '0.5s' },
      { check: 'Management Plan RECALLED?', icon: '📋', time: '1.0s' },
      { check: 'Emotion LOGGED?', icon: '🧠', time: '1.0s' },
      { check: 'Hands OFF — let it breathe', icon: '✋', time: '0.7s' },
    ];

    const startY = 34;
    const itemH = 30;
    const gap = 3;
    const leftPad = 25;
    const barMaxW = w - leftPad * 2 - 40;

    for (let i = 0; i < items.length; i++) {
      const y = startY + i * (itemH + gap);
      const done = i < activeItem;
      const current = i === activeItem;
      const alpha = done ? 1 : current ? 0.7 + 0.3 * Math.sin(t * 5) : 0.15;

      ctx.globalAlpha = alpha;

      // Background bar
      const barW = done ? barMaxW : current ? barMaxW * (cycle - activeItem) : 0;
      ctx.fillStyle = done ? 'rgba(52,211,153,0.15)' : current ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.02)';
      ctx.beginPath();
      ctx.roundRect(leftPad, y, barMaxW, itemH, 6);
      ctx.fill();

      // Progress fill
      if (barW > 0) {
        ctx.fillStyle = done ? 'rgba(52,211,153,0.2)' : 'rgba(245,158,11,0.15)';
        ctx.beginPath();
        ctx.roundRect(leftPad, y, barW, itemH, 6);
        ctx.fill();
      }

      // Icon
      ctx.font = '14px system-ui';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.fillText(items[i].icon, leftPad + 18, y + itemH / 2 + 5);

      // Text
      ctx.font = `${done ? 'bold ' : ''}10px system-ui`;
      ctx.textAlign = 'left';
      ctx.fillStyle = done ? '#34d399' : current ? '#f59e0b' : 'rgba(255,255,255,0.4)';
      ctx.fillText(items[i].check, leftPad + 38, y + itemH / 2 + 4);

      // Check mark or time
      ctx.textAlign = 'right';
      ctx.font = '9px system-ui';
      if (done) {
        ctx.fillStyle = '#34d399';
        ctx.fillText('✓', leftPad + barMaxW - 8, y + itemH / 2 + 4);
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillText(items[i].time, leftPad + barMaxW - 8, y + itemH / 2 + 4);
      }

      ctx.globalAlpha = 1;
    }

    // Bottom status
    if (activeItem >= 7) {
      const pulse = 0.5 + 0.5 * Math.sin(t * 3);
      ctx.fillStyle = `rgba(52,211,153,${0.6 + pulse * 0.4})`;
      ctx.font = 'bold 12px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('✅ ALL CHECKS COMPLETE — Trade is under control', w / 2, h - 8);
    } else {
      ctx.fillStyle = 'rgba(245,158,11,0.6)';
      ctx.font = '10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`${activeItem}/8 checks complete...`, w / 2, h - 8);
    }
  }, []);
  return <AnimScene drawFn={draw} height={310} />;
}

// ============================================================
// DATA
// ============================================================
const checklistItems = [
  { id: 1, item: 'Stop Loss is LIVE', why: 'A mental stop is not a stop. It is a hope. The market does not care about your hope. Your stop must be a hard order on the platform — confirmed, visible, immovable. If your platform crashes, your stop still protects you.', fail: 'Trading without a stop is the single fastest way to blow an account. One flash crash, one news spike, one moment of "I will close it manually" and your account is gone. No stop = no trade.', time: '0.5 seconds', priority: 'CRITICAL' },
  { id: 2, item: 'Take Profit is SET', why: 'Your TP defines your exit BEFORE emotions get involved. TP1 (partials) and TP2 (runner) should be set at the time of entry, not decided mid-trade when greed or fear are whispering.', fail: 'Without a TP, you will either close too early (fear) or hold too long (greed). Both destroy your average R:R over time. Level 6 showed that R:R is half of the profitability equation.', time: '0.5 seconds', priority: 'CRITICAL' },
  { id: 3, item: 'Position Size is CORRECT', why: 'The wrong lot size turns a 1% risk trade into a 3% risk trade. Double-check the number on the ticket matches your pre-calculated size. Fat-finger errors are real — and expensive.', fail: 'A prop firm trader entered 1.0 lots instead of 0.1 lots on a Gold trade. The stop was 15 pips. Instead of risking £150 (1%), he risked £1,500 (10%). The trade lost. One typo cost him his funded account.', time: '0.5 seconds', priority: 'CRITICAL' },
  { id: 4, item: 'Correct Instrument', why: 'You meant to trade GBPUSD but clicked GBPJPY. You meant XAUUSD but selected XAGUSD. In the rush of execution, instrument errors happen more than traders admit. Verify the symbol.', fail: 'GBPJPY moves 2-3× more than GBPUSD per pip on the same lot size. Your "correct" stop on the wrong instrument is the wrong risk. Even if the trade wins, you did not trade your plan.', time: '0.3 seconds', priority: 'HIGH' },
  { id: 5, item: 'Screenshot TAKEN', why: 'A screenshot at the moment of entry captures: the chart state, your levels, the trigger, the entry price, and the current candle. This is your trade journal "before" photo. Without it, your post-trade review is based on memory — and memory lies.', fail: 'You cannot conduct a proper Trade Autopsy (Lesson 7.10) without screenshots. You will remember the trade as "perfect" if it won and "unlucky" if it lost. The screenshot tells the truth.', time: '0.5 seconds', priority: 'HIGH' },
  { id: 6, item: 'Management Plan RECALLED', why: 'Before the first candle after entry closes, recall your plan: "TP1 at 1:1 → close 50% → move to BE. Runner trails behind higher lows." This takes one second of internal dialogue. It primes your brain for the NEXT decision, not the LAST one.', fail: 'Without recalling the plan, you manage by emotion. Every pullback triggers anxiety. Every push toward TP triggers greed to move it further. The plan was written in calm — follow the calm version of yourself.', time: '1.0 seconds', priority: 'HIGH' },
  { id: 7, item: 'Emotional State LOGGED', why: 'Write one word: "Confident." "Anxious." "Rushed." "Calm." This takes 2 seconds and creates a dataset that, over 100 trades, reveals which emotional states produce winning trades and which produce losing ones.', fail: 'After 6 months, a trader discovered that trades entered when "anxious" had a 31% WR vs 56% WR when "confident." That one data point — emotional state — was worth more than any indicator.', time: '1.0 seconds', priority: 'MEDIUM' },
  { id: 8, item: 'Hands OFF — Let it Breathe', why: 'After the 7 checks, step back. Do NOT watch every tick. Do NOT move your stop. Do NOT check your P&L. The trade needs room to work. Your job in the first 2 minutes is to do NOTHING except observe.', fail: 'Micromanaging the first 2 minutes is how traders close winners at +5 pips and move stops on losers "to give it more room." Both destroy edge. The trade is set. Let it breathe.', time: 'Ongoing', priority: 'CRITICAL' },
];

const gameRounds = [
  { scenario: 'You click BUY on Gold at 2,341. Your heart rate spikes. You feel the urge to immediately check if the trade is going your way. The first candle after entry drops 3 pips to 2,338. What is the FIRST thing you should do?',
    options: [
      { text: 'Check if the trade is in profit or loss', correct: false, explain: 'Checking P&L in the first 5 seconds is emotional, not strategic. A 3-pip move is noise on a 15M Gold trade. Your FIRST action should be confirming your stop loss is live — that is item #1 of the protocol.' },
      { text: 'Confirm your stop loss is live and at the correct level', correct: true, explain: 'Correct! Step 1 of the post-fill protocol: verify the stop loss order is LIVE on the platform, at the CORRECT price, and is a HARD order (not mental). Everything else — TP, screenshot, emotions — comes after. If you have no stop, nothing else matters.' },
      { text: 'Take a screenshot for your journal', correct: false, explain: 'Screenshot is important (step 5) but not the FIRST action. If your stop is not live and price spikes 50 pips against you during the screenshot, the journal entry will say "blown account." Stop first. Always.' },
      { text: 'Close the trade — the 3-pip drop means it is failing', correct: false, explain: '3 pips on Gold is noise — literally the spread. Your stop is 12+ pips away for a reason. Closing at -3 pips on a valid trade is how you turn a 52% WR strategy into a 0% WR strategy by never letting trades work.' },
    ]
  },
  { scenario: 'You entered a SHORT on EUR/USD at 1.0842. You quickly run through the protocol: SL at 1.0854 ✓, TP at 1.0818 ✓, size 0.5 lots ✓, correct instrument ✓, screenshot ✓. But you forgot to log your emotional state. You were feeling "rushed" because you almost missed the trigger. Does this matter?',
    options: [
      { text: 'No — emotional logging is optional. The important checks are done.', correct: false, explain: '"Rushed" is a critical emotional state. Over 100 trades, "rushed" entries typically show 12-18% lower WR than "calm" entries because the analysis was compressed. Skipping the log means you will never discover this pattern.' },
      { text: 'Yes — "rushed" is data. Log it now. Over time, this reveals which emotional states produce winners vs losers.', correct: true, explain: 'Correct! The emotional log is not a feelings diary — it is PERFORMANCE DATA. After 100 trades, you might discover that "rushed" entries win 38% vs "calm" entries at 54%. That single insight could reshape your entire execution process. Log "rushed" now — it takes 2 seconds.' },
      { text: 'Yes, but you should close the trade since rushed entries usually lose', correct: false, explain: 'You cannot know "rushed entries usually lose" without the data. That is exactly WHY you log it — to build the evidence. This individual trade might be perfect despite feeling rushed. The pattern only emerges over dozens of trades.' },
      { text: 'No — focus on managing the trade now, log emotions later', correct: false, explain: 'If you log it later, you will not remember the exact feeling. You will reconstruct your emotional state based on the trade outcome: "I felt fine" if it won, "I was stressed" if it lost. Log it NOW while the feeling is raw.' },
    ]
  },
  { scenario: 'You enter a LONG on NASDAQ at 18,450. You run the protocol. Item 3: position size. You calculated 0.3 lots but the ticket says 0.03 lots — ten times too small. The trade is already live. What do you do?',
    options: [
      { text: 'Add 0.27 lots to bring it to 0.3 — the entry price is still close enough', correct: false, explain: 'The entry price has already moved. Adding at a different price changes your average entry, your effective R:R, and your stop distance calculation. The correct size should have been entered BEFORE clicking buy.' },
      { text: 'Let it run at 0.03 lots — a small win is better than no trade', correct: true, explain: 'Correct! The trade is valid — the setup, trigger, and levels are all correct. The only error is size. At 0.03 lots, your risk is 10× smaller than planned, so a 1:2 R:R win nets 10× less. But it is still a profitable trade executed correctly. Log the sizing error, fix the pre-fill process, and move on.' },
      { text: 'Close it and re-enter at the correct size', correct: false, explain: 'Closing and re-entering means you pay spread twice, and the re-entry price is worse. If the move has already started, you might miss it entirely. The sizing error is annoying but not trade-killing. Let it run.' },
      { text: 'Increase size to 3.0 lots to compensate for the mistake', correct: false, explain: 'Catastrophic overreaction. 3.0 lots is 10× your intended size, not a correction. This turns a minor sizing error into a potential account-blowing mistake. Accept the small size and fix the process.' },
    ]
  },
  { scenario: 'You enter a SHORT on Gold. Protocol complete: SL ✓, TP ✓, size ✓, instrument ✓, screenshot ✓, plan recalled ✓, emotion logged ("confident") ✓, hands off ✓. 90 seconds after entry, price pulls back 4 pips TOWARD your entry (you are in profit by 4 pips). You feel the urge to move your stop to breakeven. What is the correct response?',
    options: [
      { text: 'Move to breakeven — lock in the risk-free trade', correct: false, explain: 'Your TP1 has not been hit yet. Moving to BE before TP1 means you get stopped out on normal noise. Level 6 Lesson 8 was clear: BE happens AFTER TP1 partial, not before. A 4-pip profit on Gold is the spread — this is not a meaningful move to protect.' },
      { text: 'Move stop to +2 pips — partial protection', correct: false, explain: 'Same problem. +2 pips on Gold is within normal candle noise. You will get stopped out with a tiny profit on a trade that was going to hit your full TP. This is fear disguised as risk management.' },
      { text: 'Do nothing — your protocol said "hands off." BE happens after TP1 per your management plan.', correct: true, explain: 'Correct! Your management plan (step 6) was recalled at entry: "TP1 at 1:1 → partial → BE." Price is 4 pips in profit — nowhere near TP1. The urge to move to BE is ANXIETY, not strategy. Your protocol step 8 says "hands off." Trust the protocol. Trust the plan.' },
      { text: 'Close the trade at +4 pips — take the small profit', correct: false, explain: 'You entered for a 1:2 R:R target. Closing at +4 pips means you captured approximately 0.2R. Over 100 trades, taking 0.2R on winners while absorbing full 1R on losers is mathematically guaranteed to lose money. Let the trade work.' },
    ]
  },
  { scenario: 'You are about to click BUY on GBP/USD. Your finger is on the button. Suddenly you realise: you have NOT checked the news calendar (Phase 4 of your pre-session routine). UK GDP data releases in 8 minutes. What do you do?',
    options: [
      { text: 'Enter anyway — the setup is valid and you might miss it', correct: false, explain: 'A valid setup 8 minutes before high-impact news is a TRAP. Spread will widen, slippage will spike, and the GDP number could reverse the entire move. Your pre-session routine exists to catch exactly this.' },
      { text: 'Enter with a wider stop to account for the news volatility', correct: false, explain: 'A wider stop increases your risk without improving your probability. The news is not a "wider stop" problem — it is a "should I be in a trade at all" problem. No amount of stop adjustment fixes the underlying uncertainty.' },
      { text: 'Do NOT enter. Wait for the news release and reaction to settle (15-minute buffer minimum), then reassess.', correct: true, explain: 'Correct! Your post-fill protocol cannot fix a pre-fill error. Item 0 — before the protocol even starts — is that your pre-session routine must be COMPLETE. The news check was missed. Fix it now by waiting. If the setup survives the news release, it will still be there after the 15-minute buffer.' },
      { text: 'Enter but close immediately if the news is bad', correct: false, explain: '"Close immediately if bad" assumes you can react faster than institutional algorithms. You cannot. By the time you see "bad" GDP, the move has already happened. Slippage will fill your close 5-10 pips worse than expected. Prevention is better than reaction.' },
    ]
  },
];

const quizQuestions = [
  { q: 'What is the FIRST item in the post-fill protocol?', opts: ['Take a screenshot', 'Log your emotional state', 'Confirm your stop loss is live and at the correct level', 'Check if the trade is in profit'], correct: 2 },
  { q: 'Why should you take a screenshot at the moment of entry?', opts: ['To share on social media', 'To create an accurate visual record for your trade journal and post-trade review', 'To prove the trade to your broker', 'Screenshots are optional'], correct: 1 },
  { q: 'When should you move your stop to breakeven?', opts: ['As soon as the trade is 2 pips in profit', 'After TP1 has been hit and partials taken', 'When you feel anxious about the trade', 'At the end of the trading session'], correct: 1 },
  { q: 'You entered 0.5 lots but meant to enter 0.05 lots (10× too large). What should you do?', opts: ['Let it run — a bigger win is better', 'Immediately reduce the position to 0.05 lots', 'Close the entire trade and re-enter correctly', 'Add a wider stop to compensate for the larger size'], correct: 1 },
  { q: 'What does "Hands OFF — let it breathe" mean in practice?', opts: ['Never look at the chart again', 'Do not move your stop, check P&L obsessively, or interfere with the trade in the first 2 minutes', 'Set a timer and only check after 1 hour', 'Close the platform after entry'], correct: 1 },
  { q: 'Why is logging your emotional state at entry considered performance data?', opts: ['It helps you feel better about losses', 'Over 100+ trades, it reveals which emotional states correlate with winning vs losing trades', 'Therapists recommend it', 'It slows you down so you make fewer mistakes'], correct: 1 },
  { q: 'What is the connection between the post-fill protocol and the execution gap from Lesson 7.1?', opts: ['The protocol increases the execution gap', 'The protocol has no effect on the execution gap', 'The protocol systematically reduces the execution gap by preventing the 5 most common post-entry errors', 'The protocol is only for beginners'], correct: 2 },
  { q: 'You discover 8 minutes before UK GDP that you missed your news check. You have a valid setup forming. What is the correct action?', opts: ['Enter — the setup overrides the news concern', 'Enter with a wider stop', 'Do NOT enter — wait for the news release and 15-minute buffer, then reassess', 'Enter and close if the news is negative'], correct: 2 },
];

function Confetti({ active }: { active: boolean }) {
  if (!active) return null;
  return (<div className="fixed inset-0 pointer-events-none z-50">{Array.from({ length: 60 }).map((_, i) => (<motion.div key={i} initial={{ y: -20, x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400), opacity: 1 }} animate={{ y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 20, rotate: Math.random() * 720, opacity: 0 }} transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5 }} className="absolute w-2 h-2 rounded-sm" style={{ background: ['#f59e0b', '#d946ef', '#34d399', '#3b82f6', '#ef4444'][i % 5] }} />))}</div>);
}

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

export default function FirstFiveSecondsLesson() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);

  const [openItem, setOpenItem] = useState<number | null>(null);

  // Interactive — Post-Entry Checklist Simulator
  const [checkStates, setCheckStates] = useState<boolean[]>(Array(8).fill(false));
  const [checkTimer, setCheckTimer] = useState<number | null>(null);
  const [checkStarted, setCheckStarted] = useState(false);
  const [checkComplete, setCheckComplete] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startChecklist = () => {
    setCheckStates(Array(8).fill(false));
    setCheckTimer(0);
    setCheckStarted(true);
    setCheckComplete(false);
    timerRef.current = setInterval(() => {
      setCheckTimer(prev => (prev ?? 0) + 0.1);
    }, 100);
  };

  const toggleCheck = (idx: number) => {
    if (!checkStarted || checkComplete) return;
    const next = [...checkStates];
    next[idx] = !next[idx];
    setCheckStates(next);
    if (next.every(Boolean)) {
      setCheckComplete(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  useEffect(() => { return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, []);

  const getTimerGrade = (seconds: number) => {
    if (seconds <= 5) return { grade: 'ELITE', color: 'text-green-400', msg: 'Under 5 seconds — you executed like a professional. Every check confirmed before the first candle closed.' };
    if (seconds <= 10) return { grade: 'GOOD', color: 'text-amber-400', msg: '5-10 seconds — solid execution. With practice, you can get this under 5 seconds.' };
    if (seconds <= 20) return { grade: 'SLOW', color: 'text-orange-400', msg: '10-20 seconds — you hesitated on some checks. Print the checklist and practise until it is automatic.' };
    return { grade: 'TOO SLOW', color: 'text-red-400', msg: '20+ seconds — in a real trade, this delay means you are reacting to the first candle emotionally instead of systematically. Drill this until it is muscle memory.' };
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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 7 &middot; Lesson 4</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">The First<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>5 Seconds</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">The instant your trade is filled, a psychological tsunami hits. What you do in the next 5 seconds determines whether the tsunami drowns you or you ride it.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* S00 */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">🔍 The Surgeon&apos;s First Cut</p>
            <p className="text-gray-400 leading-relaxed mb-4">A surgeon spends hours preparing: scans reviewed, team briefed, instruments sterilised, patient prepped. Then the scalpel touches skin — and everything changes. The preparation was theoretical. This is real. The surgeon&apos;s heart rate spikes. Their hands must remain steady. The next few seconds determine whether the incision is precise or sloppy.</p>
            <p className="text-gray-400 leading-relaxed">Your trade entry is the first cut. Everything before it — your routine, your analysis, your trigger — was preparation. The moment the order fills, your money is at risk, adrenaline floods your brain, and every instinct screams at you to DO something. The post-fill protocol is what keeps your hands steady. Without it, you operate on adrenaline instead of process.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">A funded trader analysed his last <strong className="text-white">200 trades</strong>. He found that <strong className="text-red-400">23 trades (11.5%)</strong> had errors in the first 5 seconds: 8 had no stop loss set, 6 had the wrong position size, 4 were on the wrong instrument, and 5 had immediate emotional interference (closing within 30 seconds of entry). Those 23 trades cost him <strong className="text-red-400">£2,800</strong> — more than an entire month of edge. After implementing an 8-item post-fill protocol, his first-5-second error rate dropped to <strong className="text-green-400">1.5%</strong> (3 trades out of 200). Cost of those 3 errors: £180.</p>
          </div>
        </motion.div>
      </section>

      {/* S01 — Psychological Tsunami Animation */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Psychological Tsunami</p>
          <h2 className="text-2xl font-extrabold mb-4">Your Stress Curve at the Moment of Entry</h2>
          <p className="text-gray-400 text-sm mb-6">Watch your stress level spike the instant the order fills. The peak lasts 5-15 seconds. This is where 80% of post-entry mistakes happen — and where the protocol catches them.</p>
          <PsychTsunamiAnimation />
        </motion.div>
      </section>

      {/* S02 — Post-Fill Protocol Animation */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The 8-Item Protocol</p>
          <h2 className="text-2xl font-extrabold mb-4">5 Seconds. 8 Checks. Zero Errors.</h2>
          <p className="text-gray-400 text-sm mb-6">Watch each check complete in sequence. When all 8 are done, the trade is under control — and your brain shifts from panic to process.</p>
          <PostFillProtocolAnimation />
        </motion.div>
      </section>

      {/* S03 — 8 Items Deep Dive */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The 8 Checks Decoded</p>
          <h2 className="text-2xl font-extrabold mb-4">What Each Check Does and Why It Is Non-Negotiable</h2>
          <div className="space-y-3">
            {checklistItems.map((item, i) => (
              <div key={i} className="rounded-xl border border-white/5 overflow-hidden">
                <button onClick={() => setOpenItem(openItem === i ? null : i)} className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${item.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : item.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-400' : 'bg-sky-500/20 text-sky-400'}`}>{item.id}</span>
                    <div className="text-left"><p className="text-sm font-bold text-white">{item.item}</p><p className="text-xs text-gray-500 mt-0.5">{item.time} · <span className={item.priority === 'CRITICAL' ? 'text-red-400' : item.priority === 'HIGH' ? 'text-amber-400' : 'text-sky-400'}>{item.priority}</span></p></div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openItem === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openItem === i && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="px-4 pb-4 space-y-3">
                  <div className="p-3 rounded-lg bg-white/[0.02]"><p className="text-xs font-bold text-green-400 mb-1">Why This Check Exists</p><p className="text-sm text-gray-400 leading-relaxed">{item.why}</p></div>
                  <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10"><p className="text-xs font-bold text-red-400 mb-1">What Happens When You Skip It</p><p className="text-sm text-gray-400 leading-relaxed">{item.fail}</p></div>
                </div></motion.div>)}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S04 — The Error Cascade */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The Error Cascade</p>
          <h2 className="text-2xl font-extrabold mb-4">How One Missed Check Triggers Three Mistakes</h2>
          <p className="text-gray-400 text-sm mb-6">Post-entry errors rarely happen in isolation. One missed check creates panic, which causes a second error, which compounds into a third. The protocol breaks the chain at step 1.</p>
          <div className="space-y-4">
            {[
              { chain: ['No stop loss set', 'Price drops 8 pips — panic rises', 'You set a mental stop 5 pips wider than planned', 'Price drops further — you move the mental stop again', 'Final result: 3× planned risk, 0× discipline'], color: 'border-red-500/20' },
              { chain: ['Wrong position size (10× too large)', 'Trade moves 3 pips against you — £300 loss instead of £30', 'Panic: "I need to close NOW"', 'You close at the worst price — the trade then reverses and would have hit TP', 'Final result: £300 loss on what should have been a £60 win'], color: 'border-orange-500/20' },
              { chain: ['No screenshot taken', 'Trade wins +£200 — you feel great', 'Weekly review: you cannot remember WHY you entered', 'You try to replicate the "feeling" of the trade', 'Final result: 3 undocumented emotion-based trades = −£450'], color: 'border-amber-500/20' },
            ].map((cascade, i) => (
              <div key={i} className={`p-4 rounded-xl border ${cascade.color} bg-white/[0.01]`}>
                <div className="space-y-1.5">
                  {cascade.chain.map((step, si) => (
                    <div key={si} className="flex items-start gap-2">
                      <span className={`text-xs font-bold mt-0.5 ${si === 0 ? 'text-red-400' : si === cascade.chain.length - 1 ? 'text-red-500' : 'text-gray-500'}`}>{si === 0 ? '✗' : '→'}</span>
                      <p className={`text-xs leading-relaxed ${si === 0 ? 'text-red-400 font-bold' : si === cascade.chain.length - 1 ? 'text-red-400 font-bold' : 'text-gray-400'}`}>{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S05 — Interactive Post-Entry Checklist Simulator */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Checklist Speed Drill</p>
          <h2 className="text-2xl font-extrabold mb-4">How Fast Can You Complete the Protocol?</h2>
          <p className="text-gray-400 text-sm mb-6">Click &quot;Start Drill&quot; and tap each check as fast as you can — in order. Your time is tracked. Aim for under 5 seconds. This builds muscle memory so the protocol becomes automatic in live trading.</p>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
            {!checkStarted ? (
              <button onClick={startChecklist} className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white font-bold text-sm active:scale-95 transition-transform">⚡ Start Drill — Timer begins on click</button>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400">Post-Fill Protocol Drill</span>
                  <span className={`text-lg font-mono font-bold ${checkComplete ? 'text-green-400' : 'text-amber-400'}`}>{(checkTimer ?? 0).toFixed(1)}s</span>
                </div>
                <div className="space-y-2">
                  {checklistItems.map((item, i) => (
                    <button key={i} onClick={() => toggleCheck(i)} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${checkStates[i] ? 'bg-green-500/10 border border-green-500/30' : 'bg-white/[0.03] border border-white/10 hover:border-amber-500/30'}`}>
                      <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 ${checkStates[i] ? 'bg-green-500/30 text-green-400' : 'bg-white/[0.05] text-gray-500'}`}>{checkStates[i] ? '✓' : i + 1}</span>
                      <span className={`text-sm ${checkStates[i] ? 'text-green-400 line-through' : 'text-gray-300'}`}>{item.item}</span>
                    </button>
                  ))}
                </div>
                {checkComplete && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    {(() => { const grade = getTimerGrade(checkTimer ?? 99); return (
                      <div className={`p-4 rounded-xl ${checkTimer! <= 5 ? 'bg-green-500/10 border border-green-500/20' : checkTimer! <= 10 ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                        <div className="flex items-center justify-between mb-2"><p className={`text-sm font-bold ${grade.color}`}>{grade.grade}</p><p className="text-lg font-mono font-bold text-white">{(checkTimer ?? 0).toFixed(1)}s</p></div>
                        <p className="text-xs text-gray-400 leading-relaxed">{grade.msg}</p>
                      </div>
                    ); })()}
                    <button onClick={startChecklist} className="w-full py-3 mt-3 rounded-xl bg-white/[0.05] border border-white/10 text-sm font-bold text-gray-300 hover:bg-white/[0.08] transition-all">Try Again</button>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </section>

      {/* S06 — Before vs After Protocol */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Before vs After</p>
          <h2 className="text-2xl font-extrabold mb-4">The Protocol in Action</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-xs font-bold text-red-400 mb-3">WITHOUT Protocol</p>
              <div className="space-y-2 text-xs text-gray-400">
                <p>• Entry → immediately check P&L</p>
                <p>• -3 pips → anxiety spike</p>
                <p>• "Did I set a stop?" → panic scroll</p>
                <p>• Move stop wider in panic</p>
                <p>• Forget management plan</p>
                <p>• Close at -8 pips from fear</p>
                <p>• Trade would have hit TP at +24</p>
                <p className="text-red-400 font-bold mt-2">Result: −£80 instead of +£240</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/15">
              <p className="text-xs font-bold text-green-400 mb-3">WITH Protocol</p>
              <div className="space-y-2 text-xs text-gray-400">
                <p>• Entry → SL confirmed ✓</p>
                <p>• TP set ✓ Size correct ✓</p>
                <p>• Screenshot ✓ Plan recalled ✓</p>
                <p>• Emotion: "focused" ✓</p>
                <p>• Hands off. Watch. Breathe.</p>
                <p>• -3 pips = normal noise</p>
                <p>• TP1 hit → partial → BE</p>
                <p className="text-green-400 font-bold mt-2">Result: +£240 as planned</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S07 — Building the Reflex */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Building the Reflex</p>
          <h2 className="text-2xl font-extrabold mb-4">From Checklist to Instinct</h2>
          <p className="text-gray-400 text-sm mb-6">The protocol starts as a conscious process. Over 50-100 trades, it becomes a reflex — like checking your mirrors when driving.</p>
          <div className="space-y-3">
            {[
              { phase: 'Trades 1-20', title: 'Read the list', desc: 'Print the 8-item checklist. Stick it next to your screen. Read each item out loud after every entry. It will feel slow and mechanical. That is fine — slow and correct beats fast and wrong.', color: 'text-red-400' },
              { phase: 'Trades 20-50', title: 'Glance at the list', desc: 'You remember most items but still need the physical reference for 2-3 of them. The sequence is becoming familiar. Speed drops from 15s to 8s.', color: 'text-amber-400' },
              { phase: 'Trades 50-100', title: 'Automatic', desc: 'The protocol runs without conscious effort. SL-TP-Size-Instrument-Screenshot-Plan-Emotion-Hands off. Under 5 seconds. You notice when something is WRONG because the rhythm breaks.', color: 'text-green-400' },
            ].map((stage, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-3 mb-2"><span className={`text-xs font-bold ${stage.color}`}>{stage.phase}</span><span className="text-sm font-bold text-white">{stage.title}</span></div>
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
          <h2 className="text-2xl font-extrabold mb-4">What NOT to Do After Entry</h2>
          <div className="space-y-3">
            {[
              { mistake: 'Checking P&L before confirming your stop', fix: 'P&L is irrelevant if you have no stop. A £50 unrealised loss with a stop is a controlled trade. A £50 unrealised loss without a stop is a ticking bomb. Confirm the stop FIRST.' },
              { mistake: 'Moving your stop within the first 2 minutes', fix: 'Unless your stop was placed incorrectly (wrong level), moving it in the first 2 minutes is always emotional. The thesis has not had time to play out. Your stop is structural — trust the structure.' },
              { mistake: 'Closing the trade within 60 seconds of entry', fix: 'Unless you genuinely entered the wrong instrument or the wrong direction, closing within 60 seconds means you did not trust your own analysis. If you did not trust it, why did you enter? Fix the entry process, not the exit.' },
              { mistake: 'Skipping the screenshot because "I will remember"', fix: 'You will not remember. After 10 trades, they blur together. After 50, you cannot recall the chart state of trade #12. The screenshot is the ONLY accurate record. Take it every time.' },
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
          <h2 className="text-2xl font-extrabold mb-4">Post-Fill Protocol Quick Reference</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { title: '1-3: The Non-Negotiables', body: 'Stop Loss LIVE → Take Profit SET → Position Size CORRECT. These 3 protect your capital. Everything else is secondary.', color: 'border-red-500/20 bg-red-500/5' },
              { title: '4-5: Verify & Document', body: 'Correct Instrument → Screenshot TAKEN. Prevents wrong-instrument errors and creates your trade record.', color: 'border-amber-500/20 bg-amber-500/5' },
              { title: '6-7: Process & Data', body: 'Management Plan RECALLED → Emotion LOGGED. Primes your decision-making and builds performance data.', color: 'border-sky-500/20 bg-sky-500/5' },
              { title: '8: The Hardest One', body: 'Hands OFF — let it breathe. Do not watch every tick. Do not move anything. The trade needs time. Give it time.', color: 'border-green-500/20 bg-green-500/5' },
              { title: 'Target Time', body: 'Under 5 seconds = elite. 5-10s = good. 10-20s = needs practice. 20s+ = drill until automatic.', color: 'border-purple-500/20 bg-purple-500/5' },
              { title: 'The Rule', body: 'If ANY of the first 3 items are wrong, fix them IMMEDIATELY. Wrong size, wrong stop, wrong TP = close or correct before doing anything else.', color: 'border-pink-500/20 bg-pink-500/5' },
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
          <h2 className="text-2xl font-extrabold mb-2">Post-Fill Protocol Game</h2>
          <p className="text-gray-400 text-sm mb-6">5 scenarios that test your first-5-seconds decision-making.</p>
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
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Excellent — your post-fill instincts are sharp.' : gameScore >= 3 ? 'Good — review the 8 items and the error cascade section.' : 'Re-read the protocol. Print it. Stick it next to your screen.'}</p></motion.div>)}
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
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center text-3xl shadow-lg shadow-red-500/30">⚡</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 7: The First 5 Seconds</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-red-400 via-amber-400 to-red-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Rapid Responder &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L7.4-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
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
