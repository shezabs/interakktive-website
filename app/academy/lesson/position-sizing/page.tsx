// app/academy/lesson/position-sizing/page.tsx
// ATLAS Academy — Lesson 1.6: Position Sizing Mastery [PRO]
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Crown, ArrowRight, Calculator, Target, Award, Zap, AlertTriangle, CheckCircle } from 'lucide-react';

// ============================================================
// FORMULA STEP ANIMATOR
// ============================================================
function FormulaAnimator() {
  const [step, setStep] = useState(-1);
  const [auto, setAuto] = useState(false);

  const steps = [
    { highlight: 'account', label: 'YOUR ACCOUNT', value: '$5,000', desc: 'Start with your total account balance. This is the money you have to work with.', color: 'text-primary-400' },
    { highlight: 'risk', label: 'RISK PERCENTAGE', value: '× 1%', desc: 'Decide how much of your account you\'re willing to lose on this ONE trade. Professionals use 1-2%. Never more.', color: 'text-amber-400' },
    { highlight: 'amount', label: 'RISK AMOUNT', value: '= $50', desc: 'This is the MAXIMUM you can lose. $5,000 × 1% = $50. If you lose more than this, your position was too big.', color: 'text-red-400' },
    { highlight: 'stop', label: 'STOP LOSS DISTANCE', value: '÷ 25 pips', desc: 'How far is your stop loss from your entry? This comes from your chart analysis — NOT from your desired position size.', color: 'text-accent-400' },
    { highlight: 'perpip', label: 'VALUE PER PIP', value: '= $2.00/pip', desc: '$50 risk ÷ 25 pips = $2.00 per pip. Each pip of movement will cost or earn you $2.', color: 'text-primary-400' },
    { highlight: 'lots', label: 'LOT SIZE', value: '= 0.20 lots', desc: '$2.00 per pip ÷ $10 per pip (standard lot) = 0.20 lots. THIS is your position size. Trade exactly this amount.', color: 'text-green-400' },
  ];

  useEffect(() => {
    if (!auto || step >= steps.length - 1) { setAuto(false); return; }
    const t = setTimeout(() => setStep(s => s + 1), 2200);
    return () => clearTimeout(t);
  }, [auto, step, steps.length]);

  const startAuto = () => { setStep(0); setAuto(true); };

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-white/[0.06]">
        <div className="text-center font-mono text-sm mb-4 leading-loose">
          <span className={`inline-block px-2 py-1 rounded-lg transition-all duration-500 ${step >= 0 ? 'bg-primary-500/15 text-primary-400 scale-110' : 'text-gray-500'}`}>Account</span>
          <span className={`inline-block px-1 transition-all ${step >= 1 ? 'text-amber-400' : 'text-gray-600'}`}>×</span>
          <span className={`inline-block px-2 py-1 rounded-lg transition-all duration-500 ${step >= 1 ? 'bg-amber-500/15 text-amber-400 scale-110' : 'text-gray-500'}`}>Risk %</span>
          <span className={`inline-block px-1 transition-all ${step >= 2 ? 'text-red-400' : 'text-gray-600'}`}>=</span>
          <span className={`inline-block px-2 py-1 rounded-lg transition-all duration-500 ${step >= 2 ? 'bg-red-500/15 text-red-400 scale-110' : 'text-gray-500'}`}>Risk $</span>
          <span className={`inline-block px-1 transition-all ${step >= 3 ? 'text-accent-400' : 'text-gray-600'}`}>÷</span>
          <span className={`inline-block px-2 py-1 rounded-lg transition-all duration-500 ${step >= 3 ? 'bg-accent-500/15 text-accent-400 scale-110' : 'text-gray-500'}`}>SL Pips</span>
          <span className={`inline-block px-1 transition-all ${step >= 4 ? 'text-primary-400' : 'text-gray-600'}`}>=</span>
          <span className={`inline-block px-2 py-1 rounded-lg transition-all duration-500 ${step >= 4 ? 'bg-primary-500/15 text-primary-400 scale-110' : 'text-gray-500'}`}>$/pip</span>
          <span className={`inline-block px-1 transition-all ${step >= 5 ? 'text-green-400' : 'text-gray-600'}`}>→</span>
          <span className={`inline-block px-2 py-1 rounded-lg transition-all duration-500 ${step >= 5 ? 'bg-green-500/15 text-green-400 scale-110 font-bold' : 'text-gray-500'}`}>LOTS</span>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mb-4">
          {steps.map((_, i) => (
            <div key={i} className={`w-6 h-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-gradient-to-r from-amber-500 to-accent-500' : 'bg-white/10'}`} />
          ))}
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <button onClick={startAuto} disabled={auto} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white font-bold text-xs active:scale-95 transition-all disabled:opacity-50">
            {auto ? 'Playing...' : '▶ Auto Play'}
          </button>
          <button onClick={() => setStep(s => Math.min(s + 1, steps.length - 1))} disabled={auto} className="px-4 py-2.5 rounded-xl glass text-xs font-semibold active:scale-95 disabled:opacity-50">Next →</button>
          <button onClick={() => { setStep(-1); setAuto(false); }} className="px-4 py-2.5 rounded-xl glass text-xs font-semibold text-gray-500 active:scale-95">↻</button>
        </div>
      </div>

      {/* Step explanation */}
      <AnimatePresence mode="wait">
        {step >= 0 ? (
          <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-2xl font-bold font-mono ${steps[step].color}`}>{steps[step].value}</span>
              <span className="text-[10px] font-semibold tracking-widest uppercase text-gray-500">{steps[step].label}</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">{steps[step].desc}</p>
          </motion.div>
        ) : (
          <motion.div key="start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 text-center">
            <p className="text-sm text-gray-500">Tap <strong className="text-gray-300">▶ Auto Play</strong> to see the formula come alive, step by step.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// MULTI-ASSET CALCULATOR
// ============================================================
function MultiAssetCalc() {
  const [asset, setAsset] = useState<'forex' | 'crypto' | 'stocks'>('forex');
  const [account, setAccount] = useState(5000);
  const [riskPct, setRiskPct] = useState(1);
  const [stopDist, setStopDist] = useState(30);
  const [entryPrice, setEntryPrice] = useState(65000); // for crypto/stocks

  const riskAmount = account * (riskPct / 100);

  let result = { size: '', unit: '', perUnit: '' };
  if (asset === 'forex') {
    const pipValue = riskAmount / stopDist;
    const lots = pipValue / 10;
    result = { size: lots.toFixed(2), unit: 'lots', perUnit: `$${pipValue.toFixed(2)}/pip` };
  } else if (asset === 'crypto') {
    const priceMove = entryPrice * (stopDist / 100); // stop as % for crypto
    const units = riskAmount / priceMove;
    result = { size: units.toFixed(6), unit: 'BTC', perUnit: `Stop: $${priceMove.toFixed(0)}` };
  } else {
    const shares = Math.floor(riskAmount / stopDist); // stop in $ for stocks
    result = { size: shares.toString(), unit: 'shares', perUnit: `$${stopDist} stop per share` };
  }

  return (
    <div className="glass-card rounded-2xl p-5">
      {/* Asset tabs */}
      <div className="flex gap-2 mb-5">
        {([
          { id: 'forex' as const, label: '🌍 Forex', sub: 'Pips → Lots' },
          { id: 'crypto' as const, label: '₿ Crypto', sub: '% → Units' },
          { id: 'stocks' as const, label: '📊 Stocks', sub: '$ → Shares' },
        ]).map(a => (
          <button key={a.id} onClick={() => setAsset(a.id)}
            className={`flex-1 p-3 rounded-xl text-center transition-all active:scale-95 border ${asset === a.id ? 'bg-amber-500/10 border-amber-500/25 text-amber-400' : 'glass text-gray-500'}`}>
            <div className="text-sm font-bold">{a.label}</div>
            <div className="text-[9px] text-gray-500 mt-0.5">{a.sub}</div>
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="space-y-4 mb-5">
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-gray-500">Account Balance</span>
            <span className="font-mono font-semibold">${account.toLocaleString()}</span>
          </div>
          <input type="range" min={500} max={100000} step={500} value={account} onChange={e => setAccount(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-400 [&::-webkit-slider-thumb]:cursor-pointer" />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-gray-500">Risk Per Trade</span>
            <span className="font-mono font-semibold text-amber-400">{riskPct}%</span>
          </div>
          <input type="range" min={0.5} max={5} step={0.5} value={riskPct} onChange={e => setRiskPct(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-400 [&::-webkit-slider-thumb]:cursor-pointer" />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-gray-500">{asset === 'forex' ? 'Stop Loss (pips)' : asset === 'crypto' ? 'Stop Loss (%)' : 'Stop Loss ($ per share)'}</span>
            <span className="font-mono font-semibold">{asset === 'forex' ? `${stopDist} pips` : asset === 'crypto' ? `${stopDist}%` : `$${stopDist}`}</span>
          </div>
          <input type="range" min={asset === 'crypto' ? 1 : 5} max={asset === 'forex' ? 100 : asset === 'crypto' ? 20 : 50} step={asset === 'crypto' ? 0.5 : 1} value={stopDist} onChange={e => setStopDist(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent-400 [&::-webkit-slider-thumb]:cursor-pointer" />
        </div>
      </div>

      {/* Result */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-accent-500/10 border border-amber-500/15 text-center">
        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Your Position Size</div>
        <div className="text-3xl font-extrabold text-amber-400 font-mono">{result.size}</div>
        <div className="text-sm text-gray-400 mt-1">{result.unit}</div>
        <div className="text-xs text-gray-500 mt-2">{result.perUnit} · Risk: ${riskAmount.toFixed(0)}</div>
      </div>
    </div>
  );
}

// ============================================================
// LOT SIZE VISUAL COMPARISON
// ============================================================
function LotComparison() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        { name: 'Micro', lot: '0.01', units: '1,000', pip: '$0.10', color: 'text-green-400', bg: 'bg-green-500/10', bar: 'w-[15%]', barCol: 'bg-green-500' },
        { name: 'Mini', lot: '0.10', units: '10,000', pip: '$1.00', color: 'text-primary-400', bg: 'bg-primary-500/10', bar: 'w-[50%]', barCol: 'bg-primary-500' },
        { name: 'Standard', lot: '1.00', units: '100,000', pip: '$10.00', color: 'text-amber-400', bg: 'bg-amber-500/10', bar: 'w-full', barCol: 'bg-amber-500' },
      ].map((l, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
          className={`p-4 rounded-xl ${l.bg} text-center border border-white/[0.04]`}>
          <div className={`text-xs font-semibold ${l.color} uppercase tracking-wider mb-2`}>{l.name}</div>
          <div className="font-mono text-lg font-bold mb-1">{l.lot}</div>
          <div className="text-[10px] text-gray-500 mb-1">{l.units} units</div>
          <div className={`text-xs font-bold ${l.color}`}>{l.pip}/pip</div>
          {/* Visual bar */}
          <div className="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div className={`h-full rounded-full ${l.barCol} ${l.bar} opacity-60`} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ============================================================
// SIZE THAT TRADE CHALLENGE
// ============================================================
const challenges = [
  { account: 10000, risk: 1, stop: 20, answer: 0.50, asset: 'EUR/USD' },
  { account: 5000, risk: 2, stop: 50, answer: 0.20, asset: 'GBP/USD' },
  { account: 2000, risk: 1, stop: 30, answer: 0.07, asset: 'USD/JPY' },
  { account: 25000, risk: 1, stop: 15, answer: 1.67, asset: 'EUR/USD' },
  { account: 3000, risk: 2, stop: 40, answer: 0.15, asset: 'AUD/USD' },
  { account: 50000, risk: 0.5, stop: 25, answer: 1.00, asset: 'GBP/JPY' },
  { account: 1000, risk: 2, stop: 20, answer: 0.10, asset: 'EUR/GBP' },
  { account: 8000, risk: 1, stop: 35, answer: 0.23, asset: 'USD/CHF' },
  { account: 15000, risk: 1, stop: 50, answer: 0.30, asset: 'NZD/USD' },
  { account: 4000, risk: 1.5, stop: 30, answer: 0.20, asset: 'EUR/JPY' },
];

function SizeChallenge() {
  const [round, setRound] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(t);
  }, [done, startTime]);

  const ch = challenges[round];

  const checkAnswer = () => {
    if (answered) return;
    const userVal = parseFloat(userInput);
    const isCorrect = Math.abs(userVal - ch.answer) <= 0.03; // tolerance of 0.03 lots
    setCorrect(isCorrect);
    if (isCorrect) setScore(s => s + 1);
    setAnswered(true);
  };

  const nextRound = () => {
    if (round >= 9) { setDone(true); return; }
    setRound(r => r + 1); setUserInput(''); setAnswered(false); setCorrect(false);
  };

  if (done) {
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    return (
      <div className="glass-card rounded-2xl p-6 text-center">
        <div className="text-4xl mb-3">{score >= 8 ? '🏆' : score >= 6 ? '💪' : score >= 4 ? '📚' : '🔄'}</div>
        <p className="text-2xl font-extrabold mb-1">{score}/10</p>
        <p className="text-sm text-gray-400 mb-1">Time: {mins}:{secs.toString().padStart(2, '0')}</p>
        <p className="text-sm text-gray-400 mb-4">
          {score === 10 ? 'Perfect! Position sizing is second nature to you.' :
           score >= 8 ? 'Excellent — you\'ve got the formula down.' :
           score >= 6 ? 'Good foundation. Keep practising the trickier ones.' :
           'Review the formula and try again. This skill is essential.'}
        </p>
        <button onClick={() => { setRound(0); setScore(0); setDone(false); setUserInput(''); setAnswered(false); }}
          className="px-6 py-2.5 rounded-xl glass text-sm font-semibold text-amber-400 hover:bg-white/[0.06] transition-all">Try Again</button>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
        <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Round {round + 1} / 10</span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">Score: {score}</span>
          <span className="text-xs font-mono text-gray-600">{Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, '0')}</span>
        </div>
      </div>

      <div className="p-5">
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Scenario</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-gray-500">Pair: </span><strong>{ch.asset}</strong></div>
            <div><span className="text-gray-500">Account: </span><strong>${ch.account.toLocaleString()}</strong></div>
            <div><span className="text-gray-500">Risk: </span><strong className="text-amber-400">{ch.risk}%</strong></div>
            <div><span className="text-gray-500">Stop Loss: </span><strong>{ch.stop} pips</strong></div>
          </div>
        </div>

        <p className="text-sm font-semibold mb-3 text-center">What lot size should you trade?</p>

        <div className="flex gap-2 mb-3">
          <input
            type="number" step="0.01" value={userInput}
            onChange={e => setUserInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && checkAnswer()}
            placeholder="0.00"
            disabled={answered}
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-center font-mono text-lg font-bold text-white placeholder:text-gray-700 focus:outline-none focus:border-amber-500/40 transition-colors disabled:opacity-50"
          />
          <span className="flex items-center text-sm text-gray-500 px-2">lots</span>
        </div>

        {!answered ? (
          <button onClick={checkAnswer} disabled={!userInput}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white font-bold text-sm active:scale-95 transition-all disabled:opacity-30">
            Check Answer
          </button>
        ) : (
          <div>
            <div className={`p-3 rounded-xl mb-3 text-sm text-center ${correct ? 'bg-green-500/10 border border-green-500/25 text-green-400' : 'bg-red-500/10 border border-red-500/25 text-red-400'}`}>
              {correct ? '✅ Correct!' : `❌ Not quite. The answer is ${ch.answer.toFixed(2)} lots.`}
              <p className="text-xs text-gray-500 mt-1">
                ${ch.account.toLocaleString()} × {ch.risk}% = ${(ch.account * ch.risk / 100).toFixed(0)} risk ÷ {ch.stop} pips = ${(ch.account * ch.risk / 100 / ch.stop).toFixed(2)}/pip ÷ $10 = {ch.answer.toFixed(2)} lots
              </p>
            </div>
            <button onClick={nextRound} className="w-full py-3 rounded-xl glass text-sm font-semibold text-amber-400 active:scale-95 transition-all">
              {round >= 9 ? 'See Results' : 'Next Round →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// QUIZ
// ============================================================
const quizQuestions = [
  { q: "The position sizing formula is:", opts: ["Account × Risk % = Lot Size", "Account × Risk % ÷ Stop Pips ÷ Pip Value = Lot Size", "Just trade 0.1 lots on everything", "Account ÷ 100 = Lot Size"], correct: 1, explain: "The complete formula: (Account × Risk%) ÷ Stop Loss Distance ÷ Pip Value per Standard Lot = Your Lot Size. Every variable matters." },
  { q: "$20,000 account, 1% risk, 40-pip stop. What's the lot size?", opts: ["0.50 lots", "2.00 lots", "0.05 lots", "1.00 lots"], correct: 0, explain: "$20,000 × 1% = $200 risk. $200 ÷ 40 pips = $5/pip. $5 ÷ $10 per standard lot = 0.50 lots." },
  { q: "What is a micro lot?", opts: ["100,000 units", "10,000 units", "1,000 units", "100 units"], correct: 2, explain: "Micro = 1,000 units (0.01 lots, ~$0.10/pip). Mini = 10,000 (0.10 lots, ~$1/pip). Standard = 100,000 (1.00 lots, ~$10/pip)." },
  { q: "You should determine your stop loss distance based on:", opts: ["How much money you want to make", "The chart analysis — where your trade idea is invalid", "Whatever gives you the biggest lot size", "Always use 50 pips"], correct: 1, explain: "Your stop loss goes where your analysis is WRONG — at a structure level, below/above a key zone. Then you calculate lot size FROM that distance. Never the other way around." },
  { q: "Your account is $1,000 and you want to risk 2%. Your stop is 50 pips. What lot size?", opts: ["0.04 lots", "0.20 lots", "0.40 lots", "1.00 lots"], correct: 0, explain: "$1,000 × 2% = $20 risk. $20 ÷ 50 pips = $0.40/pip. $0.40 ÷ $10 = 0.04 lots (4 micro lots)." },
  { q: "Why is it dangerous to decide lot size BEFORE your stop loss?", opts: ["It's not dangerous", "Because you'll place your stop to fit the lot size instead of where the market says it should go", "Because bigger lots are always better", "It doesn't matter"], correct: 1, explain: "If you pick lot size first, you'll either set an artificially tight stop (getting stopped out by noise) or move it further away (risking too much). The CHART determines the stop. The MATH determines the lots." },
];

// ============================================================
// CONFETTI
// ============================================================
function GoldConfetti({ active }: { active: boolean }) {
  const cRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!active) return;
    const c = cRef.current; if (!c) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    c.width = window.innerWidth; c.height = window.innerHeight;
    const cols = ['#f59e0b', '#fbbf24', '#d946ef', '#0ea5e9', '#fcd34d', '#e879f9'];
    const pcs = Array.from({ length: 180 }, () => ({ x: Math.random() * c.width, y: Math.random() * c.height - c.height, w: Math.random() * 10 + 4, h: Math.random() * 6 + 2, color: cols[Math.floor(Math.random() * cols.length)], vy: Math.random() * 3 + 2, vx: (Math.random() - .5) * 2.5, rot: Math.random() * 360, rv: Math.random() * 8 - 4, a: 1 }));
    let f = 0;
    const draw = () => { ctx.clearRect(0, 0, c.width, c.height); pcs.forEach(p => { p.y += p.vy; p.x += p.vx; p.rot += p.rv; if (f > 140) p.a -= .008; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot * Math.PI / 180); ctx.globalAlpha = Math.max(0, p.a); ctx.fillStyle = p.color; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore(); }); f++; if (f < 280) requestAnimationFrame(draw); };
    draw();
  }, [active]);
  if (!active) return null;
  return <canvas ref={cRef} className="fixed inset-0 pointer-events-none z-[9998]" />;
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function PositionSizingLesson() {
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(Array(quizQuestions.length).fill(null));
  const [quizDone, setQuizDone] = useState(false);
  const [score, setScore] = useState(0);
  const [certUnlocked, setCertUnlocked] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    const h = () => { const t = document.documentElement.scrollHeight - window.innerHeight; setScrollPct(Math.min(100, Math.round((window.scrollY / t) * 100))); };
    window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h);
  }, []);

  const handleAnswer = (qi: number, oi: number) => {
    if (quizAnswers[qi] !== null) return;
    const u = [...quizAnswers]; u[qi] = oi; setQuizAnswers(u);
    if (u.every(a => a !== null)) {
      const c = u.filter((a, i) => a === quizQuestions[i].correct).length;
      const p = Math.round((c / quizQuestions.length) * 100);
      setScore(p); setQuizDone(true);
      if (p >= 66) setTimeout(() => { setCertUnlocked(true); setShowConfetti(true); setTimeout(() => setShowConfetti(false), 6000); }, 800);
    }
  };

  const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } };

  return (
    <div className="min-h-screen">
      <GoldConfetti active={showConfetti} />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-3 bg-black/60 backdrop-blur-xl border-b border-white/10">
        <Link href="/academy" className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>ATLAS ACADEMY</Link>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20"><Crown className="w-3 h-3" /> PRO</span>
          <div className="w-24 h-1 rounded-full bg-white/10 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-accent-500 transition-all duration-500" style={{ width: `${scrollPct}%` }} /></div>
          <span className="font-mono text-[10px] text-gray-500">{scrollPct}%</span>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6 pt-20">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(245,158,11,0.07),transparent_70%)] pointer-events-none" />
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.15 } } }} className="relative z-10">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-7">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-400">PRO Lesson — Level 1</span>
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,56px)] font-bold leading-[1.1] tracking-tight mb-5">
            Position Sizing<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-primary-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Mastery</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">
            The exact formula that turns risk management from theory into practice. After this lesson, you&apos;ll calculate position size in your sleep.
          </motion.p>
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-4 mt-6 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Calculator className="w-3.5 h-3.5" /> Animated Formula</span>
            <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> Speed Challenge</span>
            <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5" /> Multi-Asset Calc</span>
            <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5" /> Pro Certificate</span>
          </motion.div>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5">
            <span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span>
            <div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" />
          </motion.div>
        </motion.div>
      </section>

      {/* Section 1: Why This Matters */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">01 — Why This Matters</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">The Bridge Between Knowledge and Survival</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-300 text-base leading-relaxed mb-4">You know you should risk 1-2% per trade. But <strong className="text-white">how do you actually translate that into a lot size?</strong> That&apos;s position sizing — and getting it wrong makes every other rule pointless.</motion.p>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-8">Two traders can take the exact same trade with the exact same stop loss. One risks 1% and survives. The other &quot;eyeballs it&quot; at 8% and blows up. <strong className="text-white">The difference is position sizing.</strong></motion.p>
        </motion.div>

        <div className="space-y-3">
          {[
            { icon: <AlertTriangle className="w-5 h-5 text-red-400" />, title: 'The Wrong Way', desc: '"I\'ll just trade 0.5 lots" — picking a random size without calculating risk. This is how accounts die.', bg: 'bg-red-500/10' },
            { icon: <CheckCircle className="w-5 h-5 text-green-400" />, title: 'The Right Way', desc: 'Account → Risk % → Dollar risk → Stop distance → Pip value → Lot size. A formula that adapts to EVERY trade.', bg: 'bg-green-500/10' },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="flex items-start gap-4 p-5 glass-card rounded-2xl">
              <div className={`flex-shrink-0 w-11 h-11 rounded-xl ${item.bg} flex items-center justify-center`}>{item.icon}</div>
              <div><h4 className="font-bold text-[15px] mb-1">{item.title}</h4><p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p></div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Section 2: The Formula Animated */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">02 — The Formula</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">Watch It Step by Step</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-6">Each variable lights up in sequence. By the end, you&apos;ll know exactly how a $5,000 account with a 25-pip stop becomes 0.20 lots.</motion.p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <FormulaAnimator />
        </motion.div>
      </section>

      {/* Section 3: Lot Sizes Explained */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">03 — Lot Sizes</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">Micro, Mini & Standard</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-6">In forex, position sizes are measured in &quot;lots&quot;. The lot size determines how much each pip of movement is worth in your account currency.</motion.p>
        </motion.div>
        <LotComparison />
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="mt-4 p-4 glass rounded-2xl text-center">
          <p className="text-xs text-gray-500 leading-relaxed">
            <strong className="text-amber-400">Pro Tip:</strong> Most beginners should trade micro lots (0.01-0.09). There&apos;s no shame in small sizes — the goal is <strong className="text-white">correct sizing</strong>, not big sizing.
          </p>
        </motion.div>
      </section>

      {/* Section 4: Multi-Asset Calculator */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">04 — Calculator</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">Multi-Asset Position Sizer</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-6">The same principle works across all markets — only the units change. Toggle between Forex, Crypto, and Stocks.</motion.p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <MultiAssetCalc />
        </motion.div>
      </section>

      {/* Section 5: Common Mistakes */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">05 — Mistakes to Avoid</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-6">Where Traders Go Wrong</motion.h2>
        </motion.div>

        {[
          { wrong: '"I always trade 0.5 lots"', right: 'Lot size should change with EVERY trade based on stop distance', why: 'A fixed lot size means your risk changes with every trade. A 20-pip stop at 0.5 lots risks $100, but a 50-pip stop risks $250. Your risk should be fixed, not your lot size.' },
          { wrong: '"I\'ll figure out the stop after choosing my lot size"', right: 'Always determine stop loss FIRST, then calculate lot size', why: 'The chart tells you where to place your stop (at an invalidation level). If you pick lots first, you\'ll set your stop where the math works — not where the market says it should be.' },
          { wrong: '"This setup is perfect, I\'ll risk 5% instead of 1%"', right: 'Every trade gets the same risk percentage, no exceptions', why: 'You can NEVER know which trade will win. The "perfect" setup can lose. The mediocre one can win. Consistent sizing lets probability work in your favour over time.' },
          { wrong: '"Micro lots are for beginners, I want to trade big"', right: 'Your account size determines your lot size, not your ego', why: 'A $2,000 account trading 1.0 lots is reckless (risking $10/pip). The same account trading 0.02 lots is professional (risking $0.20/pip with a 100-pip stop = 1% risk).' },
        ].map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
            className="glass-card rounded-2xl p-5 mb-3">
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 text-xs font-bold">✗</div>
              <p className="text-sm text-red-400 font-semibold">{item.wrong}</p>
            </div>
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xs font-bold">✓</div>
              <p className="text-sm text-green-400 font-semibold">{item.right}</p>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed pl-9">{item.why}</p>
          </motion.div>
        ))}
      </section>

      {/* Section 6: Speed Challenge */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">06 — Size That Trade!</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">10-Round Speed Challenge</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-6">You&apos;ll get a random scenario each round. Calculate the correct lot size and type your answer. Aim for 8/10 or better.</motion.p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <SizeChallenge />
        </motion.div>
      </section>

      {/* Section 7: Quiz */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">07 — Final Assessment</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">Position Sizing Quiz</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-300 text-base leading-relaxed mb-8">6 questions mixing theory and real calculations. Pass this and you&apos;ve truly mastered position sizing.</motion.p>
        </motion.div>
        <div className="space-y-4">
          {quizQuestions.map((q, qi) => (
            <motion.div key={qi} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: qi * 0.06 }} className="glass-card rounded-2xl p-5">
              <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p>
              <p className="font-semibold text-[15px] leading-relaxed mb-4">{q.q}</p>
              <div className="space-y-2">
                {q.opts.map((opt, oi) => {
                  const ans = quizAnswers[qi] !== null; const isC = oi === q.correct; const isS = quizAnswers[qi] === oi;
                  let c = 'p-3 rounded-xl text-sm cursor-pointer transition-all border ';
                  if (!ans) c += 'bg-white/5 border-white/10 hover:border-white/20 active:scale-[0.98]';
                  else if (isC) c += 'bg-green-500/10 border-green-500/30 text-green-400';
                  else if (isS) c += 'bg-red-500/10 border-red-500/30 text-red-400 opacity-60';
                  else c += 'bg-white/[0.02] border-white/[0.03] opacity-40 pointer-events-none';
                  return <div key={oi} className={c} onClick={() => handleAnswer(qi, oi)}>{opt}</div>;
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
            <p className="text-sm text-gray-400">{score === 100 ? '🏆 Flawless. You can size any trade on any market.' : score >= 66 ? 'Solid. Position sizing is in your toolkit.' : 'Review the formula and try the speed challenge again.'}</p>
          </motion.div>
        )}
      </section>

      {/* Certificate */}
      <section className="px-5 py-16 text-center">
        {!certUnlocked ? (
          <div className="max-w-md mx-auto p-8 glass rounded-2xl"><p className="text-4xl mb-3 opacity-30">🔒</p><p className="text-sm text-gray-500">Score 66%+ to unlock your <strong className="text-amber-400">Pro Certificate</strong></p></div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, type: 'spring' }}
            className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(217,70,239,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
            <div className="absolute inset-[1px] rounded-3xl border border-amber-500/10" />
            <div className="relative z-10">
              <div className="w-[80px] h-[80px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-4xl shadow-lg shadow-amber-500/30">🧮</div>
              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest mb-2">Pro Certificate</p>
              <h3 className="text-xl font-extrabold mb-1">Certificate of Mastery</h3>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">
                Has successfully mastered<br /><strong className="text-white">Level 1.6: Position Sizing Mastery</strong><br />at ATLAS Academy by Interakktive
              </p>
              <p className="bg-gradient-to-r from-amber-400 to-accent-400 bg-clip-text text-transparent font-bold text-lg mb-1" style={{ WebkitTransform: 'translateZ(0)' }}>— Precision Trader —</p>
              <p className="font-mono text-[11px] text-gray-500 mb-4">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L1.6-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
            </div>
          </motion.div>
        )}
      </section>

      {/* Level Complete */}
      <section className="text-center px-5 pt-10 pb-24">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="max-w-md mx-auto p-8 glass-card rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-amber-500 to-accent-500" />
          <p className="text-3xl mb-3">🎓</p>
          <h2 className="text-xl font-bold mb-2">Level 1 — Foundations Complete!</h2>
          <p className="text-sm text-gray-400 leading-relaxed mb-6">You&apos;ve completed all 6 Foundations lessons. You understand trading, markets, candlesticks, charts, risk management, and position sizing. You&apos;re ready for Level 2: Technical Analysis.</p>
          <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-primary-500/20 transition-all active:scale-95">
            Back to Academy
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
