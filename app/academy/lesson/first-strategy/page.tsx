// app/academy/lesson/first-strategy/page.tsx
// ATLAS Academy — Lesson 2.12: Building Your First Strategy [PRO]
// THE LEVEL 2 CAPSTONE — ties everything from lessons 2.1-2.11 together
'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Crown, ArrowRight, ChevronDown, Check } from 'lucide-react';

// ============================================================
// UTILITIES
// ============================================================
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

// ============================================================
// ANIMATED SCENE
// ============================================================
function AnimScene({ drawFn, height = 300 }: { drawFn: (ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => void; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const animRef = useRef(0);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const loop = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);
      drawFn(ctx, rect.width, rect.height, frameRef.current);
      frameRef.current++;
      animRef.current = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(animRef.current);
  }, [drawFn]);
  return <canvas ref={canvasRef} style={{ width: '100%', height }} className="rounded-2xl" />;
}

// ============================================================
// COCKPIT ANIMATION — rules vs feelings
// ============================================================
function CockpitAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);

    const midX = w / 2;
    const phase = (f % 300) / 300;
    const isLeft = phase < 0.5;

    // Left panel: FEELINGS (chaotic)
    const leftW = midX - 10;
    ctx.fillStyle = isLeft ? 'rgba(239,68,68,0.06)' : 'rgba(239,68,68,0.02)';
    ctx.fillRect(5, 25, leftW, h - 35);
    ctx.strokeStyle = isLeft ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.1)';
    ctx.lineWidth = 1;
    ctx.strokeRect(5, 25, leftW, h - 35);

    ctx.fillStyle = isLeft ? '#ef4444' : '#4b5563';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('TRADING BY FEELINGS', 5 + leftW / 2, 18);

    // Chaotic line
    ctx.beginPath();
    ctx.strokeStyle = isLeft ? '#ef4444' : 'rgba(239,68,68,0.3)';
    ctx.lineWidth = 2;
    const rand = seededRandom(Math.floor(f / 2));
    let y = h / 2;
    for (let x = 15; x < leftW - 5; x += 3) {
      y += (rand() - 0.5) * 20;
      y = Math.max(40, Math.min(h - 20, y));
      x === 15 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Emotion labels
    if (isLeft) {
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = '#ef4444';
      ctx.font = '9px system-ui';
      const emotions = ['FOMO!', 'PANIC!', 'GREED!', 'REVENGE!', 'HOPE...'];
      emotions.forEach((e, i) => {
        const ex = 20 + (i / emotions.length) * (leftW - 30);
        const ey = 50 + Math.sin(f * 0.03 + i * 2) * 20;
        ctx.fillText(e, ex, ey);
      });
      ctx.globalAlpha = 1;
    }

    // Right panel: STRATEGY (systematic)
    const rightX = midX + 5;
    const rightW = w - midX - 10;
    ctx.fillStyle = !isLeft ? 'rgba(14,165,233,0.06)' : 'rgba(14,165,233,0.02)';
    ctx.fillRect(rightX, 25, rightW, h - 35);
    ctx.strokeStyle = !isLeft ? 'rgba(14,165,233,0.3)' : 'rgba(14,165,233,0.1)';
    ctx.strokeRect(rightX, 25, rightW, h - 35);

    ctx.fillStyle = !isLeft ? '#0ea5e9' : '#4b5563';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('TRADING BY STRATEGY', rightX + rightW / 2, 18);

    // Systematic line (smooth uptrend with controlled drawdowns)
    ctx.beginPath();
    ctx.strokeStyle = !isLeft ? '#0ea5e9' : 'rgba(14,165,233,0.3)';
    ctx.lineWidth = 2;
    for (let x = rightX + 10; x < rightX + rightW - 5; x += 3) {
      const t = (x - rightX - 10) / (rightW - 15);
      const sy = (h - 40) - t * (h - 80) + Math.sin(t * 12) * 15;
      x === rightX + 10 ? ctx.moveTo(x, sy) : ctx.lineTo(x, sy);
    }
    ctx.stroke();

    // Checklist items
    if (!isLeft) {
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = '#0ea5e9';
      ctx.font = '8px system-ui';
      ctx.textAlign = 'left';
      ['✓ Trend confirmed', '✓ Level reached', '✓ Pattern formed', '✓ Risk calculated'].forEach((t, i) => {
        ctx.fillText(t, rightX + 8, h - 55 + i * 12);
      });
      ctx.globalAlpha = 1;
    }
  }, []);
  return <AnimScene drawFn={draw} height={220} />;
}

// ============================================================
// STRATEGY BUILDER — interactive wizard
// ============================================================
function StrategyBuilder() {
  const [style, setStyle] = useState<string>('');
  const [htf, setHtf] = useState<string>('');
  const [mtf, setMtf] = useState<string>('');
  const [ltf, setLtf] = useState<string>('');
  const [direction, setDirection] = useState<string>('');
  const [entry1, setEntry1] = useState<string>('');
  const [entry2, setEntry2] = useState<string>('');
  const [sl, setSl] = useState<string>('');
  const [tp, setTp] = useState<string>('');
  const [risk, setRisk] = useState<string>('');
  const [maxTrades, setMaxTrades] = useState<string>('');

  const steps = [
    { title: 'Trading Style', done: !!style, content: (
      <div className="space-y-2">
        <p className="text-xs text-gray-400 mb-3">How long do you plan to hold trades? This determines everything else.</p>
        {['Scalper (minutes)', 'Day Trader (hours)', 'Swing Trader (days-weeks)', 'Position Trader (weeks-months)'].map(s => (
          <button key={s} onClick={() => { setStyle(s); if (s.includes('Scalp')) { setHtf('1H'); setMtf('15M'); setLtf('5M'); } else if (s.includes('Day')) { setHtf('4H'); setMtf('1H'); setLtf('15M'); } else if (s.includes('Swing')) { setHtf('Weekly'); setMtf('Daily'); setLtf('4H'); } else { setHtf('Monthly'); setMtf('Weekly'); setLtf('Daily'); } }}
            className={`w-full p-3 rounded-xl border text-left text-sm transition-all ${style === s ? 'bg-amber-500/15 border-amber-500/30 text-amber-400 font-bold' : 'glass text-gray-400 hover:bg-white/5'}`}>
            {s} {style === s && '✓'}
          </button>
        ))}
      </div>
    )},
    { title: 'Timeframes', done: !!htf && !!mtf && !!ltf, content: (
      <div className="space-y-3">
        <p className="text-xs text-gray-400 mb-2">Auto-set based on your style. Adjust if needed.</p>
        <div className="grid grid-cols-3 gap-2">
          <div><label className="text-[10px] text-gray-500">Trend (HTF)</label><div className="mt-1 p-2.5 rounded-lg bg-[#0d1320] border border-primary-500/30 text-primary-400 text-sm font-bold text-center">{htf}</div></div>
          <div><label className="text-[10px] text-gray-500">Setup (MTF)</label><div className="mt-1 p-2.5 rounded-lg bg-[#0d1320] border border-amber-500/30 text-amber-400 text-sm font-bold text-center">{mtf}</div></div>
          <div><label className="text-[10px] text-gray-500">Entry (LTF)</label><div className="mt-1 p-2.5 rounded-lg bg-[#0d1320] border border-accent-500/30 text-accent-400 text-sm font-bold text-center">{ltf}</div></div>
        </div>
      </div>
    )},
    { title: 'Direction Bias', done: !!direction, content: (
      <div className="space-y-2">
        <p className="text-xs text-gray-400 mb-3">Will you trade both directions or focus on one?</p>
        {['Long only (buy dips in uptrends)', 'Short only (sell rallies in downtrends)', 'Both directions (requires more skill)'].map(d => (
          <button key={d} onClick={() => setDirection(d)}
            className={`w-full p-3 rounded-xl border text-left text-sm transition-all ${direction === d ? 'bg-amber-500/15 border-amber-500/30 text-amber-400 font-bold' : 'glass text-gray-400 hover:bg-white/5'}`}>
            {d} {direction === d && '✓'}
          </button>
        ))}
      </div>
    )},
    { title: 'Entry Rules', done: !!entry1 && !!entry2, content: (
      <div className="space-y-2">
        <p className="text-xs text-gray-400 mb-3">Pick TWO entry conditions. Both MUST be true before you enter. This creates confluence.</p>
        <p className="text-[10px] text-amber-400 font-bold mb-1">Condition 1 (Technical Level):</p>
        {['Price at S/R level', 'Price at Fibonacci 61.8%', 'Price at Moving Average (50/200)', 'Price at trendline'].map(e => (
          <button key={e} onClick={() => setEntry1(e)}
            className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all ${entry1 === e ? 'bg-primary-500/15 border-primary-500/30 text-primary-400 font-bold' : 'glass text-gray-400 hover:bg-white/5'}`}>
            {e} {entry1 === e && '✓'}
          </button>
        ))}
        <p className="text-[10px] text-amber-400 font-bold mb-1 mt-3">Condition 2 (Confirmation Signal):</p>
        {['Bullish/bearish engulfing candle', 'RSI divergence', 'Volume spike', 'MACD crossover'].map(e => (
          <button key={e} onClick={() => setEntry2(e)}
            className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all ${entry2 === e ? 'bg-primary-500/15 border-primary-500/30 text-primary-400 font-bold' : 'glass text-gray-400 hover:bg-white/5'}`}>
            {e} {entry2 === e && '✓'}
          </button>
        ))}
      </div>
    )},
    { title: 'Exit Rules', done: !!sl && !!tp, content: (
      <div className="space-y-2">
        <p className="text-xs text-gray-400 mb-3">Where do you get out — for both profit AND loss?</p>
        <p className="text-[10px] text-red-400 font-bold mb-1">Stop Loss:</p>
        {['Below/above the nearest S/R level', 'Below/above the entry candle low/high', 'Fixed ATR-based stop (1.5x ATR)', 'Below/above the Fib 78.6% level'].map(s => (
          <button key={s} onClick={() => setSl(s)}
            className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all ${sl === s ? 'bg-red-500/15 border-red-500/30 text-red-400 font-bold' : 'glass text-gray-400 hover:bg-white/5'}`}>
            {s} {sl === s && '✓'}
          </button>
        ))}
        <p className="text-[10px] text-green-400 font-bold mb-1 mt-3">Take Profit:</p>
        {['Next S/R level', 'Fibonacci extension (127.2% or 161.8%)', 'Fixed R:R ratio (1:2 or 1:3)', 'Trailing stop (move stop to breakeven + trail)'].map(t => (
          <button key={t} onClick={() => setTp(t)}
            className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all ${tp === t ? 'bg-green-500/15 border-green-500/30 text-green-400 font-bold' : 'glass text-gray-400 hover:bg-white/5'}`}>
            {t} {tp === t && '✓'}
          </button>
        ))}
      </div>
    )},
    { title: 'Risk Management', done: !!risk && !!maxTrades, content: (
      <div className="space-y-2">
        <p className="text-xs text-gray-400 mb-3">The rules that keep you alive. Non-negotiable.</p>
        <p className="text-[10px] text-amber-400 font-bold mb-1">Risk Per Trade:</p>
        {['0.5% of account', '1% of account', '2% of account (aggressive)'].map(r => (
          <button key={r} onClick={() => setRisk(r)}
            className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all ${risk === r ? 'bg-amber-500/15 border-amber-500/30 text-amber-400 font-bold' : 'glass text-gray-400 hover:bg-white/5'}`}>
            {r} {risk === r && '✓'}
          </button>
        ))}
        <p className="text-[10px] text-amber-400 font-bold mb-1 mt-3">Max Trades Per Day:</p>
        {['1 trade', '2-3 trades', '5 trades max'].map(m => (
          <button key={m} onClick={() => setMaxTrades(m)}
            className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all ${maxTrades === m ? 'bg-amber-500/15 border-amber-500/30 text-amber-400 font-bold' : 'glass text-gray-400 hover:bg-white/5'}`}>
            {m} {maxTrades === m && '✓'}
          </button>
        ))}
      </div>
    )},
  ];

  const allDone = steps.every(s => s.done);
  const [showResult, setShowResult] = useState(false);

  return (
    <div className="space-y-4">
      {steps.map((step, i) => (
        <div key={i} className={`p-4 rounded-2xl glass-card border-l-3 ${step.done ? 'border-l-green-400' : 'border-l-gray-700'}`} style={{ borderLeftWidth: '3px', borderLeftColor: step.done ? '#22c55e' : '#374151' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step.done ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
              {step.done ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <h3 className="font-bold text-white text-sm">{step.title}</h3>
          </div>
          {step.content}
        </div>
      ))}

      {allDone && !showResult && (
        <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          onClick={() => setShowResult(true)}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all">
          Generate My Strategy Document →
        </motion.button>
      )}

      {showResult && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-2xl border-2 border-amber-500/30" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
          <h3 className="text-lg font-extrabold text-amber-400 mb-4 text-center">📋 YOUR TRADING STRATEGY</h3>
          <div className="space-y-3 text-sm">
            <div className="p-3 rounded-xl bg-[#0d1320]">
              <span className="text-[10px] text-gray-500 uppercase">Style</span>
              <p className="text-white font-bold">{style}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#0d1320]">
              <span className="text-[10px] text-gray-500 uppercase">Timeframes</span>
              <p className="text-white font-bold">Trend: {htf} → Setup: {mtf} → Entry: {ltf}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#0d1320]">
              <span className="text-[10px] text-gray-500 uppercase">Direction</span>
              <p className="text-white font-bold">{direction}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#0d1320]">
              <span className="text-[10px] text-gray-500 uppercase">Entry Rules (BOTH must be true)</span>
              <p className="text-primary-400 font-bold">1. {entry1}</p>
              <p className="text-primary-400 font-bold">2. {entry2}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#0d1320]">
              <span className="text-[10px] text-gray-500 uppercase">Stop Loss</span>
              <p className="text-red-400 font-bold">{sl}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#0d1320]">
              <span className="text-[10px] text-gray-500 uppercase">Take Profit</span>
              <p className="text-green-400 font-bold">{tp}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#0d1320]">
              <span className="text-[10px] text-gray-500 uppercase">Risk Management</span>
              <p className="text-amber-400 font-bold">{risk} · Max {maxTrades}/day</p>
            </div>
          </div>
          <div className="mt-4 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs text-gray-300 leading-relaxed">📌 <strong className="text-amber-400">Screenshot this.</strong> Print it. Stick it next to your screen. Before EVERY trade, check: does this trade match my strategy? If yes → execute. If no → skip. No exceptions. No &quot;just this once.&quot; Discipline is the strategy.</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function FirstStrategyLesson() {
  const [scrollY, setScrollY] = useState(0);
  const [activeChecklist, setActiveChecklist] = useState<number | null>(null);

  // Game: "Would you take this trade?"
  const gameScenarios = useMemo(() => [
    { setup: 'Daily: UPTREND. 4H: Pullback to 61.8% Fib + support zone. 1H: Bullish engulfing candle. Volume: Rising.', answer: 0, explain: 'YES — this is the dream setup. HTF trend confirmed (up), price at a key level (Fib + S/R confluence), confirmation candle (engulfing), volume backing it. All 4 checkboxes ticked. Take the trade with confidence.' },
    { setup: 'Daily: DOWNTREND. 4H: Small rally. 1H: RSI overbought at 75. You want to BUY because "it looks like it\'s turning around."', answer: 1, explain: 'NO — this is a counter-trend trap. The Daily says DOWN. The 4H rally is likely just a bear flag or dead cat bounce. RSI being overbought on the 1H during a Daily downtrend is actually a SELL signal, not a buy. Your feelings say "it\'s turning" but the strategy says "don\'t fight the HTF."' },
    { setup: 'Daily: UPTREND. 4H: At resistance, no pullback happened yet. 1H: Price just made a new high. You want to buy because "it\'s going up!"', answer: 1, explain: 'NO — chasing! Price hasn\'t pulled back to any level. You\'d be buying at the worst possible entry — right at resistance with no confirmation. Wait for a pullback to a Fib level or S/R zone THEN look for an entry candle. Patience is a strategy rule.' },
    { setup: 'Daily: SIDEWAYS range. 4H: Price at range support. 1H: Double bottom + bullish engulfing. Volume: Average.', answer: 2, explain: 'MAYBE — valid setup but lower probability. The Daily range means there\'s no trending tailwind behind this trade. The double bottom at range support IS a valid setup, but you should use tighter targets (aim for range midpoint, not a breakout) and smaller position size because ranging markets are unpredictable.' },
    { setup: 'You\'ve already taken 2 trades today (your max is 2). A "perfect" setup appears on the 1H chart.', answer: 1, explain: 'NO — your strategy says max 2 trades per day. That rule exists to protect you from overtrading (the #1 account killer). Even if this setup is perfect, taking it violates your own rules. If you break rules for "perfect" setups, you\'ll break them for "pretty good" ones, then "okay" ones. Discipline IS the strategy.' },
  ], []);

  const gameOptions = ['YES — take the trade', 'NO — skip it', 'MAYBE — reduced size'];

  const [gameRound, setGameRound] = useState(0);
  const [gameAnswers, setGameAnswers] = useState<(number | null)[]>(Array(5).fill(null));
  const [gameScore, setGameScore] = useState(0);
  const [gameShowNext, setGameShowNext] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  const answerGame = (choice: number) => {
    if (gameAnswers[gameRound] !== null) return;
    const na = [...gameAnswers]; na[gameRound] = choice; setGameAnswers(na);
    if (choice === gameScenarios[gameRound].answer) setGameScore(s => s + 1);
    setGameShowNext(true);
  };
  const nextRound = () => { if (gameRound < 4) { setGameRound(r => r + 1); setGameShowNext(false); } else setGameComplete(true); };
  const resetGame = () => { setGameRound(0); setGameAnswers(Array(5).fill(null)); setGameScore(0); setGameShowNext(false); setGameComplete(false); };

  // Quiz
  const quizQuestions = useMemo(() => [
    { q: 'What is the MOST important component of a trading strategy?', opts: ['The entry signal', 'The indicator settings', 'Risk management rules', 'The timeframe'], a: 2, explain: 'Risk management is the foundation everything else is built on. You can have the worst entries in the world but if your risk management is solid (1% per trade, proper stops), you\'ll survive long enough to improve. Great entries with bad risk management = blown account.' },
    { q: 'How many entry conditions should your strategy require before entering?', opts: ['One strong signal is enough', 'At least two (confluence)', 'Five or more for safety', 'As many as possible'], a: 1, explain: 'At least two — this creates confluence. One condition (like just a Fib level) isn\'t enough. Two conditions that agree (Fib level + bullish candle) dramatically increase probability. More than 3-4 creates "analysis paralysis" where you never enter.' },
    { q: 'You\'ve had 3 losing trades in a row. Your strategy is valid (backtested). What do you do?', opts: ['Change your strategy immediately', 'Double your next trade to "win it back"', 'Keep following the strategy — losing streaks are normal', 'Stop trading for a month'], a: 2, explain: 'Losing streaks are NORMAL. Even a 60% win rate strategy will have 5-7 loss streaks regularly. Changing strategy after 3 losses means you\'ll never stick with anything long enough for it to work. Trust the backtested edge and keep executing.' },
    { q: 'What is backtesting?', opts: ['Testing your internet speed', 'Applying your strategy rules to historical charts to see if it would have been profitable', 'Trading on a demo account', 'Checking if support held in the past'], a: 1, explain: 'Backtesting is applying your exact strategy rules to historical price data — as if you were trading in the past. It tells you: win rate, average win, average loss, maximum drawdown, and whether the strategy has an edge. Never trade a strategy you haven\'t backtested.' },
    { q: 'Your strategy says "only trade with the Daily trend." The Daily is down, but you see a great 5-minute buy setup. Do you take it?', opts: ['Yes — the 5m looks perfect', 'No — it violates my strategy rules', 'Only if I reduce my position size', 'Only on Fridays'], a: 1, explain: 'No. Your strategy says Daily trend only. Breaking this rule — even for a "perfect" setup — is the beginning of the end. Once you break one rule, you\'ll break others. The power of a strategy is in following it CONSISTENTLY, especially when it\'s hard.' },
    { q: 'What should you do BEFORE entering every single trade?', opts: ['Check social media for tips', 'Run through your pre-trade checklist', 'Ask a friend for advice', 'Check the news'], a: 1, explain: 'Every single trade should pass through your pre-trade checklist: HTF trend? ✓ At a key level? ✓ Confirmation signal? ✓ Risk calculated? ✓ Position size correct? ✓ If any box is unchecked, you don\'t trade. The checklist removes emotion from the decision.' },
    { q: 'A trading journal should record:', opts: ['Only winning trades', 'Every trade — entry, exit, reason, emotion, and what you learned', 'Only the P&L amount', 'Nothing — journals are for beginners'], a: 1, explain: 'EVERY trade. Entry price, exit price, WHY you entered, how you FELT, what the market did after, and what you LEARNED. The journal is your feedback loop — without it, you repeat the same mistakes forever. The best traders are obsessive journalers.' },
    { q: 'What makes a strategy "profitable"?', opts: ['Winning 90%+ of trades', 'Having a positive expectancy: (Win Rate × Avg Win) > (Loss Rate × Avg Loss)', 'Never having losing trades', 'Using the most indicators'], a: 1, explain: 'Positive expectancy. You can win only 40% of trades and still be profitable if your winners are 3x bigger than your losers. Win rate alone means nothing. A 90% win rate with $10 wins and $100 losses = losing money. It\'s the MATH, not the feeling of winning.' },
  ], []);

  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(Array(8).fill(null));
  const quizDone = quizAnswers.every(a => a !== null);
  const score = quizDone ? Math.round((quizAnswers.filter((a, i) => a === quizQuestions[i].a).length / quizQuestions.length) * 100) : 0;
  const certUnlocked = quizDone && score >= 66;

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Pre-trade checklist items
  const checklist = [
    { title: '1. HTF Trend Confirmed?', desc: 'Check the Daily/Weekly. Is there a clear trend? If not, is there a clear range with defined support and resistance?', question: 'What direction is the higher timeframe pointing?', fail: 'If the HTF has no clear direction, skip this trade.' },
    { title: '2. At a Key Level?', desc: 'Is price at a S/R zone, Fibonacci level, moving average, or trendline? Not in the middle of nowhere?', question: 'Would you place a bet that price reacts at THIS specific price?', fail: 'If price is floating in no-man\'s land with no level nearby, there\'s no trade.' },
    { title: '3. Confirmation Signal?', desc: 'Is there a candlestick pattern, indicator signal, or volume spike confirming the level? A level without confirmation is just a line on a chart.', question: 'Is the market SHOWING you that this level matters right now?', fail: 'If the level exists but price is just passing through it, wait for confirmation.' },
    { title: '4. Risk Calculated?', desc: 'Have you identified your EXACT stop loss level? Is the distance to the stop acceptable for your account size and risk %?', question: 'If this trade hits the stop loss, will you be comfortable with the dollar amount lost?', fail: 'If the stop loss is too wide for your account or the R:R is below 1:1.5, pass.' },
    { title: '5. Position Size Correct?', desc: 'Have you calculated the exact lot size / share count based on your risk % and stop distance? (Lesson 1.6 formula)', question: 'Is this the RIGHT amount, not a "gut feel" amount?', fail: 'Never enter a trade without calculating the exact position size. Never.' },
    { title: '6. Emotional Check', desc: 'Are you calm, focused, and following your strategy? Or are you angry, desperate, bored, or chasing?', question: 'Am I trading because my strategy says to, or because I FEEL like I need to?', fail: 'If you\'re emotional — revenge trading, FOMO, bored — close the charts and walk away. Come back tomorrow.' },
  ];

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-900/50">
        <motion.div className="h-full bg-gradient-to-r from-amber-500 to-accent-500" style={{ width: `${Math.min((scrollY / (typeof document !== 'undefined' ? document.body.scrollHeight - window.innerHeight : 1)) * 100, 100)}%` }} />
      </div>

      <nav className="sticky top-0 z-40 px-5 py-3 flex items-center justify-between" style={{ background: 'rgba(6,10,18,0.85)', backdropFilter: 'blur(16px)' }}>
        <Link href="/academy" className="text-xs text-gray-500 hover:text-gray-300 transition">← Academy</Link>
        <div className="flex items-center gap-2"><Crown className="w-3.5 h-3.5 text-amber-400" /><span className="text-xs font-bold text-amber-400">PRO · CAPSTONE</span></div>
      </nav>

      {/* Hero */}
      <section className="px-5 pt-16 pb-12 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 2 · Lesson 12 · Capstone</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">
            <span className="bg-gradient-to-r from-amber-400 via-primary-400 to-accent-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Building Your<br />First Strategy</span>
          </h1>
          <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">Everything from Level 2 — combined into YOUR personal trading system. The lesson that turns knowledge into profit.</p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20">
            <span className="text-amber-400 text-xs font-bold">🏆 LEVEL 2 CAPSTONE</span>
          </div>
        </motion.div>
      </section>

      {/* SECTION 00 — WHY THIS MATTERS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First — Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-lg font-bold text-white mb-3">✈️ Pilots don&apos;t fly by feelings. They fly by checklists.</p>
            <p className="text-gray-400 leading-relaxed mb-4">An airline pilot doesn&apos;t look out the window and think &quot;hmm, feels like we should climb.&quot; They follow a precise checklist: altitude ✓, speed ✓, heading ✓, fuel ✓. Every decision is systematic. Every action is rule-based. That&apos;s why planes land safely 99.99% of the time.</p>
            <p className="text-gray-400 leading-relaxed mb-4"><strong className="text-white">A trading strategy is your cockpit checklist.</strong> Without it, you&apos;re a passenger gripping the seat, hoping for the best. With it, you&apos;re the pilot — calm, precise, and in control. You know EXACTLY what you&apos;re looking for, when to act, how much to risk, and when to exit.</p>
            <p className="text-gray-400 leading-relaxed"><strong className="text-primary-400">The brutal truth:</strong> Every single profitable trader has a written strategy. Every single one. Not a vague idea in their head — a WRITTEN, rule-based system they follow religiously. This lesson helps you build yours.</p>
          </div>

          <CockpitAnimation />

          <div className="mt-6 p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5">
            <p className="text-xs font-bold text-amber-400 mb-2">🔍 REAL SCENARIO</p>
            <p className="text-sm text-gray-300 leading-relaxed">Two traders see the same Gold chart. Trader A: &quot;Hmm, looks bullish... I think... maybe I should buy? How much? Uhh, 1 lot?&quot; Trader B: &quot;Daily uptrend ✓. Price at 61.8% Fib + support ✓. Bullish engulfing ✓. Risk: 1% = $50. Position: 0.15 lots. Stop below 78.6%. Target: previous high. Execute.&quot; <em className="text-amber-400">Same chart. One is gambling. One is trading.</em></p>
          </div>
        </motion.div>
      </section>

      {/* SECTION 01 — 7 COMPONENTS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 — The 7 Components</p>
          <h2 className="text-2xl font-extrabold mb-4">Every Strategy Needs These 7 Things</h2>
          <p className="text-sm text-gray-400 mb-6">Missing even ONE of these turns a strategy into a hope. All seven together make a system.</p>

          <div className="space-y-3">
            {[
              { num: 1, title: 'Market & Asset', desc: 'WHAT do you trade? Forex, crypto, stocks, gold? Pick 1-3 assets and master them. Trying to trade everything = mastering nothing.', icon: '🌍' },
              { num: 2, title: 'Timeframes', desc: 'THREE screens: HTF for trend, MTF for setup, LTF for entry. Your trading style determines which three (Lesson 2.11).', icon: '🕐' },
              { num: 3, title: 'Direction Rules', desc: 'When do you go long? When do you go short? When do you stay out? Clear rules, not feelings.', icon: '🧭' },
              { num: 4, title: 'Entry Conditions', desc: 'What EXACTLY must be true before you click buy/sell? At least 2 conditions for confluence. If BOTH aren\'t met, you don\'t trade.', icon: '🎯' },
              { num: 5, title: 'Stop Loss Rules', desc: 'WHERE is your stop? Set BEFORE you enter. It\'s not negotiable, not moveable, not "I\'ll just hold a little longer."', icon: '🛑' },
              { num: 6, title: 'Take Profit Rules', desc: 'WHERE do you exit for profit? A measured target, not "when it feels right." Greed without a target turns winners into losers.', icon: '💰' },
              { num: 7, title: 'Risk Management', desc: 'HOW MUCH per trade? Maximum trades per day? Maximum drawdown before stopping? These rules keep you ALIVE.', icon: '🛡️' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -15 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="p-4 rounded-xl glass-card flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-lg flex-shrink-0">{item.icon}</div>
                <div>
                  <h3 className="font-bold text-white text-sm">{item.num}. {item.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed mt-1">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* SECTION 02 — STRATEGY BUILDER */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 — Build Your Strategy</p>
          <h2 className="text-2xl font-extrabold mb-4">Interactive Strategy Builder</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">Select your choices for each component. When you&apos;re done, the builder generates your complete strategy document. <strong className="text-amber-400">Screenshot it and keep it next to your trading screen.</strong></p>

          <StrategyBuilder />
        </motion.div>
      </section>

      {/* SECTION 03 — PRE-TRADE CHECKLIST */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 — The Pre-Trade Checklist</p>
          <h2 className="text-2xl font-extrabold mb-4">Run This Before EVERY Trade</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">6 checkboxes. If any single one is unchecked, you don&apos;t trade. No exceptions. This alone will eliminate 80% of bad trades.</p>

          <div className="space-y-3">
            {checklist.map((item, i) => {
              const isOpen = activeChecklist === i;
              return (
                <motion.div key={i} layout className="rounded-2xl glass-card overflow-hidden" style={{ borderLeftWidth: '3px', borderLeftColor: i < 5 ? '#f59e0b' : '#ef4444' }}>
                  <button onClick={() => setActiveChecklist(isOpen ? null : i)} className="w-full p-4 flex items-center justify-between text-left">
                    <h3 className="font-bold text-white text-sm">{item.title}</h3>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="px-4 pb-4 space-y-3">
                          <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                          <div className="p-3 rounded-xl bg-primary-500/5 border border-primary-500/15"><p className="text-xs text-gray-300"><strong className="text-primary-400">Ask yourself:</strong> {item.question}</p></div>
                          <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15"><p className="text-xs text-gray-300"><strong className="text-red-400">If unchecked:</strong> {item.fail}</p></div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* SECTION 04 — EXPECTANCY */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 — The Math That Matters</p>
          <h2 className="text-2xl font-extrabold mb-4">Expectancy: Your Edge in One Number</h2>
          <p className="text-sm text-gray-400 mb-6">This single formula tells you if your strategy makes money over time.</p>

          <div className="p-5 rounded-2xl glass-card mb-6">
            <div className="font-mono text-center text-sm mb-4 p-3 rounded-lg bg-[#0d1320]">
              <span className="text-amber-400">Expectancy</span> = (<span className="text-green-400">Win% × Avg Win</span>) − (<span className="text-red-400">Loss% × Avg Loss</span>)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/15">
                <p className="text-xs font-bold text-green-400 mb-2">✅ PROFITABLE</p>
                <p className="text-xs text-gray-400">Win rate: 45% · Avg win: $150 · Avg loss: $75</p>
                <p className="font-mono text-sm text-green-400 mt-2">(0.45 × $150) − (0.55 × $75) = <strong>+$26.25/trade</strong></p>
                <p className="text-[10px] text-gray-500 mt-1">Wins less than half but average winner is 2x the average loser. Still profitable!</p>
              </div>
              <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
                <p className="text-xs font-bold text-red-400 mb-2">❌ UNPROFITABLE</p>
                <p className="text-xs text-gray-400">Win rate: 70% · Avg win: $30 · Avg loss: $100</p>
                <p className="font-mono text-sm text-red-400 mt-2">(0.70 × $30) − (0.30 × $100) = <strong>−$9.00/trade</strong></p>
                <p className="text-[10px] text-gray-500 mt-1">Wins 70% of the time but the losers wipe out the gains. Still losing money!</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-primary-500/5 border border-primary-500/15">
            <p className="text-sm text-gray-300 leading-relaxed">💡 <strong className="text-primary-400">The revelation:</strong> Win rate alone is MEANINGLESS. A 40% win rate with 1:3 risk-reward beats a 70% win rate with 1:0.3 risk-reward. Your strategy doesn&apos;t need to win most trades — it needs to make more money when it wins than it loses when it&apos;s wrong. <strong className="text-white">That&apos;s why risk:reward ratio matters more than win rate.</strong></p>
          </div>
        </motion.div>
      </section>

      {/* SECTION 05 — JOURNAL */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 — The Trading Journal</p>
          <h2 className="text-2xl font-extrabold mb-4">Your Personal Feedback Loop</h2>
          <p className="text-sm text-gray-400 mb-6">Every professional athlete reviews game tape. Your journal IS your game tape. Record every trade — winners AND losers.</p>

          <div className="p-5 rounded-2xl glass-card">
            <h3 className="font-bold text-amber-400 text-sm mb-4">📓 What to Record (Every. Single. Trade.)</h3>
            <div className="space-y-2">
              {[
                { field: 'Date & Time', why: 'Patterns in when you trade best (morning vs afternoon, Mon vs Fri)' },
                { field: 'Asset & Timeframe', why: 'Which markets are you most profitable in?' },
                { field: 'Direction (Long/Short)', why: 'Are you better at buying dips or selling rallies?' },
                { field: 'Entry Reason', why: 'What was the setup? What rules were met?' },
                { field: 'Entry Price & Exit Price', why: 'The raw data. P&L calculation.' },
                { field: 'Stop Loss & Take Profit', why: 'Did you follow your plan? Or did you move your stop?' },
                { field: 'Position Size', why: 'Were you properly sized? Or did you over-leverage?' },
                { field: 'Emotion Before Entry', why: 'Were you calm and systematic, or excited/fearful/bored?' },
                { field: 'Result & P&L', why: 'Win or loss? How much?' },
                { field: 'Screenshot', why: 'A picture of the chart at entry. You\'ll learn more from reviewing these than anything else.' },
                { field: 'Lesson Learned', why: 'One sentence: what did this trade teach you?' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-[#0d1320]">
                  <span className="text-amber-400 text-xs font-bold mt-0.5">{i + 1}.</span>
                  <div>
                    <span className="text-white text-xs font-bold">{item.field}</span>
                    <p className="text-[10px] text-gray-500 mt-0.5">{item.why}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
              <p className="text-xs text-gray-300 leading-relaxed">💡 <strong className="text-amber-400">Review weekly.</strong> Every Sunday, read your journal from the past week. Look for patterns: am I better on certain days? Am I revenge trading after losses? Am I moving my stops? The journal reveals truths your memory hides.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 06 — GAME */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 — Would You Take This Trade?</p>
          <h2 className="text-2xl font-extrabold mb-2">Strategy Discipline Challenge</h2>
          <p className="text-sm text-gray-400 mb-6">5 real scenarios. Read the setup and decide: does this trade meet your strategy rules?</p>

          {!gameComplete ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500">Scenario {gameRound + 1} of 5</span>
                <span className="text-xs text-amber-400 font-bold">{gameScore}/{gameRound + (gameAnswers[gameRound] !== null ? 1 : 0)} correct</span>
              </div>
              <div className="w-full h-1.5 bg-gray-800 rounded-full mb-4 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-accent-500 transition-all" style={{ width: `${((gameRound + (gameAnswers[gameRound] !== null ? 1 : 0)) / 5) * 100}%` }} />
              </div>

              <div className="p-5 rounded-2xl glass-card mb-4">
                <p className="text-xs font-bold text-amber-400 mb-2">SETUP:</p>
                <p className="text-sm text-gray-300 leading-relaxed">{gameScenarios[gameRound].setup}</p>
              </div>

              <div className="space-y-2">
                {gameOptions.map((opt, oi) => {
                  const answered = gameAnswers[gameRound] !== null;
                  const isCorrect = oi === gameScenarios[gameRound].answer;
                  const isChosen = gameAnswers[gameRound] === oi;
                  let cls = 'glass text-gray-300 hover:bg-white/5';
                  if (answered) {
                    if (isCorrect) cls = 'bg-green-500/15 border-green-500/30 text-green-400';
                    else if (isChosen) cls = 'bg-red-500/15 border-red-500/30 text-red-400';
                    else cls = 'glass text-gray-600';
                  }
                  return (
                    <button key={oi} onClick={() => answerGame(oi)} disabled={answered} className={`w-full text-left p-3.5 rounded-xl border text-sm font-medium transition-all ${cls}`}>
                      {opt} {answered && isCorrect && '✓'} {answered && isChosen && !isCorrect && '✗'}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {gameAnswers[gameRound] !== null && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0 }} className="mt-4">
                    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
                      <p className="text-sm text-gray-300 leading-relaxed"><strong className="text-amber-400">Explanation:</strong> {gameScenarios[gameRound].explain}</p>
                    </div>
                    {gameShowNext && (
                      <button onClick={nextRound} className="mt-3 w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold shadow-lg shadow-amber-500/20 active:scale-95 transition-all">
                        {gameRound < 4 ? 'Next Scenario →' : 'See Results →'}
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-8 glass-card rounded-2xl">
              <p className={`text-5xl font-extrabold mb-2 ${gameScore >= 3 ? 'text-amber-400' : 'text-red-400'}`}>{gameScore}/5</p>
              <p className="text-sm text-gray-400 mb-4">{gameScore === 5 ? '🏆 Perfect discipline! You think like a professional trader.' : gameScore >= 3 ? 'Good instincts — keep refining your discipline.' : 'Review the checklist and strategy rules.'}</p>
              <button onClick={resetGame} className="px-6 py-2.5 rounded-xl glass text-xs text-gray-300 font-medium hover:text-white transition">Try Again</button>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* SECTION 07 — QUIZ */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 — Final Exam</p>
          <h2 className="text-2xl font-extrabold mb-6">Strategy Mastery Quiz</h2>
        </motion.div>
        <div className="space-y-6">
          {quizQuestions.map((q, qi) => (
            <motion.div key={qi} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="p-5 rounded-2xl glass-card">
              <p className="text-sm font-bold text-white mb-3">{qi + 1}. {q.q}</p>
              <div className="space-y-2">
                {q.opts.map((opt, oi) => {
                  const answered = quizAnswers[qi] !== null;
                  const isCorrect = oi === q.a;
                  const isChosen = quizAnswers[qi] === oi;
                  let cls = 'glass text-gray-300 hover:bg-white/5';
                  if (answered) {
                    if (isCorrect) cls = 'bg-green-500/15 border-green-500/30 text-green-400';
                    else if (isChosen) cls = 'bg-red-500/15 border-red-500/30 text-red-400';
                    else cls = 'glass text-gray-600';
                  }
                  return (
                    <button key={oi} onClick={() => { if (!answered) { const na = [...quizAnswers]; na[qi] = oi; setQuizAnswers(na); } }} disabled={answered} className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${cls}`}>
                      {opt} {answered && isCorrect && '✓'} {answered && isChosen && !isCorrect && '✗'}
                    </button>
                  );
                })}
              </div>
              {quizAnswers[qi] !== null && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 text-sm text-gray-400 leading-relaxed">
                  <span className="text-amber-400 font-bold">✓</span> {q.explain}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
        {quizDone && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 text-center p-8 glass-card rounded-2xl">
            <p className={`text-5xl font-extrabold mb-2 ${score >= 66 ? 'text-amber-400' : 'text-red-400'}`}>{score}%</p>
            <p className="text-sm text-gray-400">{score === 100 ? '🏆 Perfect score. You\'re ready to trade with a system.' : score >= 66 ? 'You understand what makes a strategy work.' : 'Review the components and expectancy sections.'}</p>
          </motion.div>
        )}
      </section>

      {/* LEVEL 2 COMPLETE + Certificate */}
      <section className="px-5 py-16 text-center">
        {!certUnlocked ? (
          <div className="max-w-md mx-auto p-8 glass rounded-2xl"><p className="text-4xl mb-3 opacity-30">🔒</p><p className="text-sm text-gray-500">Score 66%+ to unlock your <strong className="text-amber-400">Level 2 Completion Certificate</strong></p></div>
        ) : (
          <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 to-accent-500/10 border border-amber-500/20 max-w-lg mx-auto">
              <p className="text-3xl mb-3">🎉</p>
              <h2 className="text-2xl font-extrabold text-white mb-2">LEVEL 2 COMPLETE!</h2>
              <p className="text-sm text-gray-400 leading-relaxed">You&apos;ve mastered Technical Analysis — from support & resistance to building your own strategy. You now have the knowledge that 95% of retail traders never acquire. What separates you from them is <strong className="text-amber-400">execution</strong>. Build your strategy. Follow your rules. Journal every trade. The market rewards discipline.</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, type: 'spring', delay: 0.3 }}
              className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border-2 border-amber-500/30" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
              <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.08),transparent,rgba(14,165,233,0.06),transparent)] animate-spin" style={{ animationDuration: '10s' }} />
              <div className="absolute inset-[1px] rounded-3xl border border-amber-500/15" />
              <div className="relative z-10">
                <div className="w-[90px] h-[90px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-primary-500 flex items-center justify-center text-5xl shadow-lg shadow-amber-500/30">🏆</div>
                <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest mb-2">Level 2 · Capstone Certificate</p>
                <h3 className="text-xl font-extrabold mb-1">Certificate of Mastery</h3>
                <p className="text-sm text-gray-400 mb-5 leading-relaxed">Has completed all 12 lessons of<br /><strong className="text-white">Level 2: Technical Analysis</strong><br />and built their first trading strategy<br />at ATLAS Academy by Interakktive</p>
                <p className="bg-gradient-to-r from-amber-400 via-primary-400 to-accent-400 bg-clip-text text-transparent font-bold text-xl mb-1" style={{ WebkitTransform: 'translateZ(0)' }}>— Strategy Architect —</p>
                <p className="font-mono text-[11px] text-gray-500 mb-4">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L2-COMPLETE-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
              </div>
            </motion.div>
          </div>
        )}
      </section>

      <section className="text-center px-5 pt-10 pb-24">
        <p className="text-xs tracking-widest uppercase text-gray-600 mb-4">Coming Soon</p>
        <h2 className="text-xl font-bold mb-2">Level 3 — Smart Money Concepts</h2>
        <p className="text-sm text-gray-500 mb-6">Market structure, order blocks, fair value gaps, liquidity — the institutional playbook.</p>
        <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">
          Back to Academy <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
