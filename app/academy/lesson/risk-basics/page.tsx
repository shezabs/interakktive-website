// app/academy/lesson/risk-basics/page.tsx
// ATLAS Academy — Lesson 1.5: Risk — The #1 Rule [PRO]
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import Link from 'next/link';
import { Crown, ArrowRight, Shield, AlertTriangle, TrendingDown, Calculator, Target, Award } from 'lucide-react';

// ============================================================
// ACCOUNT BLOWUP SIMULATOR
// ============================================================
function BlowupSimulator() {
  const [riskPct, setRiskPct] = useState(2);
  const [running, setRunning] = useState(false);
  const [trades, setTrades] = useState<{ result: 'win' | 'loss'; balance: number }[]>([]);
  const [finalBalance, setFinalBalance] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const runSimulation = useCallback(() => {
    setRunning(true); setFinalBalance(null);
    const results: { result: 'win' | 'loss'; balance: number }[] = [];
    let bal = 10000;
    const winRate = 0.45; // realistic 45% win rate
    const rr = 1.5; // 1:1.5 risk-reward

    for (let i = 0; i < 50 && bal > 100; i++) {
      const win = Math.random() < winRate;
      const riskAmount = bal * (riskPct / 100);
      if (win) { bal += riskAmount * rr; } else { bal -= riskAmount; }
      bal = Math.max(0, bal);
      results.push({ result: win ? 'win' : 'loss', balance: bal });
    }

    let idx = 0;
    const step = () => {
      if (idx < results.length) {
        setTrades(results.slice(0, idx + 1));
        idx++;
        setTimeout(step, 80);
      } else {
        setRunning(false);
        setFinalBalance(results[results.length - 1]?.balance ?? 0);
      }
    };
    setTrades([]);
    step();
  }, [riskPct]);

  // Draw equity curve
  useEffect(() => {
    const c = canvasRef.current, d = containerRef.current;
    if (!c || !d || trades.length === 0) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    const r = d.getBoundingClientRect();
    c.width = r.width * 2; c.height = r.height * 2;
    c.style.width = r.width + 'px'; c.style.height = r.height + 'px';
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    const w = r.width, h = r.height;
    ctx.clearRect(0, 0, w, h); ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(0, 0, w, h);

    const allBals = [10000, ...trades.map(t => t.balance)];
    const max = Math.max(...allBals) * 1.1;
    const min = Math.min(0, Math.min(...allBals) * 0.9);

    // Starting line
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
    const startY = h - ((10000 - min) / (max - min)) * (h - 20) - 10;
    ctx.beginPath(); ctx.moveTo(0, startY); ctx.lineTo(w, startY); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = '500 8px monospace'; ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.textAlign = 'right';
    ctx.fillText('$10,000', w - 4, startY - 4);

    // Equity curve
    const pts = allBals.map((b, i) => ({ x: (i / (allBals.length - 1)) * w, y: h - ((b - min) / (max - min)) * (h - 20) - 10 }));
    ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
    pts.forEach(p => ctx.lineTo(p.x, p.y));
    const lastBal = allBals[allBals.length - 1];
    const up = lastBal >= 10000;
    ctx.strokeStyle = up ? '#22c55e' : '#ef4444'; ctx.lineWidth = 1.5; ctx.stroke();

    // Fill
    ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
    const gf = ctx.createLinearGradient(0, 0, 0, h);
    gf.addColorStop(0, up ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)'); gf.addColorStop(1, 'transparent');
    ctx.fillStyle = gf; ctx.fill();

    // End dot
    const last = pts[pts.length - 1];
    ctx.fillStyle = up ? '#22c55e' : '#ef4444';
    ctx.beginPath(); ctx.arc(last.x, last.y, 4, 0, Math.PI * 2); ctx.fill();
  }, [trades]);

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-white/[0.06]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Risk Per Trade</span>
          <span className={`font-mono font-bold text-lg ${riskPct > 10 ? 'text-red-400' : riskPct > 5 ? 'text-amber-400' : 'text-green-400'}`}>{riskPct}%</span>
        </div>
        <input type="range" min={1} max={25} value={riskPct} onChange={e => setRiskPct(Number(e.target.value))} disabled={running}
          className="w-full h-1.5 rounded-full appearance-none bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-400 [&::-webkit-slider-thumb]:cursor-pointer" />
        <div className="flex justify-between text-[9px] text-gray-600 mt-1">
          <span>1% (Safe)</span>
          <span>5%</span>
          <span>10%</span>
          <span>25% (Reckless)</span>
        </div>
      </div>

      <div ref={containerRef} className="w-full h-[180px]">
        <canvas ref={canvasRef} />
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Start: </span>
            <span className="font-mono text-sm font-semibold">$10,000</span>
          </div>
          {finalBalance !== null && (
            <div>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">After 50 trades: </span>
              <span className={`font-mono text-sm font-bold ${finalBalance >= 10000 ? 'text-green-400' : 'text-red-400'}`}>
                ${finalBalance.toFixed(0)} ({finalBalance >= 10000 ? '+' : ''}{((finalBalance - 10000) / 100).toFixed(1)}%)
              </span>
            </div>
          )}
        </div>

        <button onClick={runSimulation} disabled={running}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white font-bold text-sm active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-amber-500/20">
          {running ? 'Simulating...' : `▶ Run 50 Trades at ${riskPct}% Risk`}
        </button>

        {finalBalance !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-gray-400 leading-relaxed text-center">
            {riskPct <= 2 ? '✅ Conservative risk kept your account alive through the inevitable losing streaks.' :
             riskPct <= 5 ? '⚠️ Moderate risk — survivable, but losing streaks hurt more than you\'d expect.' :
             riskPct <= 10 ? '🔥 Aggressive risk — a bad streak could cut your account in half.' :
             '💀 This level of risk will blow up almost every account. Mathematical certainty.'}
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// POSITION SIZE CALCULATOR
// ============================================================
function PositionCalculator() {
  const [account, setAccount] = useState(5000);
  const [riskPct, setRiskPct] = useState(1);
  const [stopPips, setStopPips] = useState(30);

  const riskAmount = account * (riskPct / 100);
  const pipValue = riskAmount / stopPips;
  const lotSize = pipValue / 10; // standard lot = $10/pip

  return (
    <div className="glass-card rounded-2xl p-5">
      <h4 className="font-bold text-[15px] mb-4 flex items-center gap-2"><Calculator className="w-4 h-4 text-amber-400" /> Position Size Calculator</h4>

      <div className="space-y-4">
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
            <span className="text-gray-500">Stop Loss Distance</span>
            <span className="font-mono font-semibold">{stopPips} pips</span>
          </div>
          <input type="range" min={5} max={100} step={5} value={stopPips} onChange={e => setStopPips(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-400 [&::-webkit-slider-thumb]:cursor-pointer" />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <div className="p-3 rounded-xl bg-red-500/10 text-center">
          <div className="text-[9px] text-red-400 uppercase tracking-wider mb-1">Risk Amount</div>
          <div className="text-base font-bold font-mono text-red-400">${riskAmount.toFixed(0)}</div>
        </div>
        <div className="p-3 rounded-xl bg-primary-500/10 text-center">
          <div className="text-[9px] text-primary-400 uppercase tracking-wider mb-1">Per Pip</div>
          <div className="text-base font-bold font-mono text-primary-400">${pipValue.toFixed(2)}</div>
        </div>
        <div className="p-3 rounded-xl bg-amber-500/10 text-center">
          <div className="text-[9px] text-amber-400 uppercase tracking-wider mb-1">Lot Size</div>
          <div className="text-base font-bold font-mono text-amber-400">{lotSize.toFixed(2)}</div>
        </div>
      </div>

      <p className="mt-3 text-[11px] text-gray-500 text-center leading-relaxed">
        With a ${account.toLocaleString()} account risking {riskPct}%, you can lose <strong className="text-white">${riskAmount.toFixed(0)}</strong> per trade.
        With a {stopPips}-pip stop, trade <strong className="text-white">{lotSize.toFixed(2)} lots</strong>.
      </p>
    </div>
  );
}

// ============================================================
// DRAWDOWN RECOVERY TABLE
// ============================================================
function DrawdownTable() {
  const rows = [
    { loss: 10, needed: 11.1 }, { loss: 20, needed: 25 }, { loss: 30, needed: 42.9 },
    { loss: 40, needed: 66.7 }, { loss: 50, needed: 100 }, { loss: 60, needed: 150 },
    { loss: 70, needed: 233 }, { loss: 80, needed: 400 }, { loss: 90, needed: 900 },
  ];

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-white/[0.06]">
        <h4 className="font-bold text-[15px] flex items-center gap-2"><TrendingDown className="w-4 h-4 text-red-400" /> The Drawdown Trap</h4>
        <p className="text-xs text-gray-500 mt-1">The more you lose, the harder it is to recover. This is why protection matters more than profit.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="p-3 text-left text-[10px] text-gray-500 uppercase tracking-wider">Account Loss</th>
              <th className="p-3 text-right text-[10px] text-gray-500 uppercase tracking-wider">Gain Needed to Recover</th>
              <th className="p-3 text-right text-[10px] text-gray-500 uppercase tracking-wider">Difficulty</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <motion.tr key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="border-b border-white/[0.03]">
                <td className="p-3 font-mono font-semibold text-red-400">-{r.loss}%</td>
                <td className="p-3 text-right font-mono font-semibold text-amber-400">+{r.needed}%</td>
                <td className="p-3 text-right">
                  <div className="inline-flex">
                    {Array.from({ length: Math.min(5, Math.ceil(r.needed / 50)) }, (_, j) => (
                      <span key={j} className="text-[10px]">{r.needed > 200 ? '🔴' : r.needed > 50 ? '🟡' : '🟢'}</span>
                    ))}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 bg-red-500/5 border-t border-red-500/10">
        <p className="text-xs text-gray-400 leading-relaxed text-center">
          <strong className="text-red-400">A 50% loss requires a 100% gain just to break even.</strong> This is why professional traders obsess over limiting drawdown — not maximising profit.
        </p>
      </div>
    </div>
  );
}

// ============================================================
// QUIZ
// ============================================================
const quizQuestions = [
  { q: "You have a $10,000 account and risk 1% per trade. What's your maximum loss per trade?", opts: ["$10", "$100", "$1,000", "$500"], correct: 1, explain: "1% of $10,000 = $100. This means even after 10 consecutive losses, you've only lost $1,000 (10% of your account)." },
  { q: "Why is a 50% drawdown so devastating?", opts: ["It's not — 50% is normal", "You need a 100% gain to recover", "Your broker closes your account", "You have to pay extra fees"], correct: 1, explain: "If your $10,000 account drops to $5,000 (50% loss), you need to DOUBLE your money (+100%) just to get back to $10,000. The math gets exponentially harder." },
  { q: "With a 1:2 risk-reward ratio, what win rate do you need to be profitable?", opts: ["50%", "75%", "34%", "90%"], correct: 2, explain: "At 1:2, you risk $1 to make $2. If you win 34 trades out of 100: (34 × $2) - (66 × $1) = $68 - $66 = $2 profit. You can lose MORE often than you win and still be profitable." },
  { q: "You want to risk 1% on a trade with a 40-pip stop loss. Account is $5,000. What's your position size?", opts: ["0.125 lots", "1.25 lots", "0.5 lots", "5 lots"], correct: 0, explain: "Risk: 1% of $5,000 = $50. Per-pip value: $50 ÷ 40 pips = $1.25/pip. Lot size: $1.25 ÷ $10 per pip = 0.125 lots." },
  { q: "A trader wins 60% of their trades but risks 10% per trade with a 1:1 R:R. What's likely to happen?", opts: ["They'll get rich fast", "They'll slowly grow their account", "A losing streak will eventually destroy them", "Win rate doesn't matter"], correct: 2, explain: "Even at 60% win rate, a streak of 5-6 losses (which WILL happen eventually) means losing 50-60% of the account. At 1% risk, the same streak only costs 5-6%. Position sizing determines survival." },
  { q: "What should you determine BEFORE entering any trade?", opts: ["Your take profit only", "How much you could lose (your stop loss and risk)", "What your friend thinks", "The perfect entry price"], correct: 1, explain: "Before every trade: know your stop loss, calculate your position size based on risk percentage, THEN enter. The exit plan comes before the entry. Always." },
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
    const colors = ['#f59e0b', '#fbbf24', '#d946ef', '#0ea5e9', '#fcd34d', '#e879f9', '#38bdf8'];
    const pcs = Array.from({ length: 180 }, () => ({ x: Math.random() * c.width, y: Math.random() * c.height - c.height, w: Math.random() * 10 + 4, h: Math.random() * 6 + 2, color: colors[Math.floor(Math.random() * colors.length)], vy: Math.random() * 3 + 2, vx: (Math.random() - .5) * 2.5, rot: Math.random() * 360, rv: Math.random() * 8 - 4, a: 1 }));
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
export default function RiskBasicsLesson() {
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
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(239,68,68,0.06),transparent_70%)] pointer-events-none" />
        <div className="absolute top-[-100px] right-[20%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(245,158,11,0.06),transparent_70%)] pointer-events-none" />
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.15 } } }} className="relative z-10">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-7">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-400">PRO Lesson — Level 1</span>
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,56px)] font-bold leading-[1.1] tracking-tight mb-5">
            Risk — The<br /><span className="bg-gradient-to-r from-red-400 via-amber-400 to-accent-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>#1 Rule</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">
            This is the lesson that separates survivors from statistics. Every blown account, every failed trader — the root cause is always the same: <strong className="text-white">poor risk management</strong>.
          </motion.p>
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-4 mt-6 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> Blowup Simulator</span>
            <span className="flex items-center gap-1"><Calculator className="w-3.5 h-3.5" /> Position Calculator</span>
            <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5" /> 6 Questions</span>
            <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5" /> Pro Certificate</span>
          </motion.div>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5">
            <span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span>
            <div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" />
          </motion.div>
        </motion.div>
      </section>

      {/* Section 1: The Hard Truth */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">01 — The Hard Truth</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">Why Most Traders Fail</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-300 text-base leading-relaxed mb-4">It&apos;s not bad entries. It&apos;s not wrong predictions. It&apos;s not the market being &quot;unfair&quot;. <strong className="text-white">90% of traders fail because they risk too much per trade.</strong></motion.p>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-8">A trader with mediocre entries but excellent risk management will <strong className="text-white">always</strong> outperform a trader with perfect entries but no risk control. Always. The math guarantees it.</motion.p>
        </motion.div>

        <div className="space-y-3">
          {[
            { icon: <AlertTriangle className="w-5 h-5 text-red-400" />, title: 'The Gambler\'s Trap', desc: 'Risking 10-20% per trade because "this setup is a sure thing." There are no sure things. Every trade can lose. Every. Single. One.', bg: 'bg-red-500/10' },
            { icon: <TrendingDown className="w-5 h-5 text-amber-400" />, title: 'The Revenge Spiral', desc: 'After a loss, doubling down to "make it back quickly." This compounds losses exponentially. One bad day becomes an account-ending week.', bg: 'bg-amber-500/10' },
            { icon: <Shield className="w-5 h-5 text-green-400" />, title: 'The Professional\'s Secret', desc: 'Risk 1-2% per trade. Accept that losses are part of the game. Survive long enough for your edge to play out over hundreds of trades.', bg: 'bg-green-500/10' },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="flex items-start gap-4 p-5 glass-card rounded-2xl">
              <div className={`flex-shrink-0 w-11 h-11 rounded-xl ${item.bg} flex items-center justify-center`}>{item.icon}</div>
              <div><h4 className="font-bold text-[15px] mb-1">{item.title}</h4><p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p></div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Section 2: Blowup Simulator */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">02 — See It Yourself</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">Account Blowup Simulator</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-6">Set a risk percentage, run 50 simulated trades (45% win rate, 1:1.5 R:R), and watch what happens to your account. <strong className="text-white">Try 2%, then try 15%.</strong> See the difference.</motion.p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <BlowupSimulator />
        </motion.div>
      </section>

      {/* Section 3: The 1% Rule */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">03 — The Golden Rule</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">Never Risk More Than 1-2%</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-300 text-base leading-relaxed mb-8">This is non-negotiable for professionals. Here&apos;s the maths that proves why:</motion.p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="glass-card rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-amber-500 to-red-500" />
          <h4 className="font-bold mb-4">10 Consecutive Losses (it WILL happen eventually)</h4>
          <div className="grid grid-cols-3 gap-3">
            {[
              { risk: '1%', after: '$9,044', loss: '-9.6%', col: 'text-green-400', bg: 'bg-green-500/10', verdict: 'Painful but survivable' },
              { risk: '5%', after: '$5,987', loss: '-40.1%', col: 'text-amber-400', bg: 'bg-amber-500/10', verdict: 'Devastating damage' },
              { risk: '10%', after: '$3,487', loss: '-65.1%', col: 'text-red-400', bg: 'bg-red-500/10', verdict: 'Account destroyed' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`p-3 rounded-xl ${item.bg} text-center`}>
                <div className={`text-lg font-bold ${item.col}`}>{item.risk}</div>
                <div className="text-[10px] text-gray-500 uppercase mt-1">Per trade</div>
                <div className="font-mono text-sm font-bold mt-2">{item.after}</div>
                <div className={`text-xs font-mono ${item.col}`}>{item.loss}</div>
                <div className="text-[10px] text-gray-500 mt-1">{item.verdict}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Section 4: Position Size Calculator */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">04 — The Formula</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">Calculate Your Position Size</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-6">This calculator shows exactly how many lots to trade based on your account, risk percentage, and stop loss distance. <strong className="text-white">Use this before EVERY trade.</strong></motion.p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <PositionCalculator />
        </motion.div>
      </section>

      {/* Section 5: Drawdown Recovery */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">05 — The Maths of Recovery</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">Why Drawdowns Are Deadly</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-6">Losses and gains are NOT symmetrical. A 50% loss requires a 100% gain to recover. This table shows why protecting capital is more important than growing it.</motion.p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <DrawdownTable />
        </motion.div>
      </section>

      {/* Section 6: Key Rules */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">06 — Rules to Live By</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-6">The Risk Management Checklist</motion.h2>
        </motion.div>

        {[
          { num: '01', rule: 'Risk 1-2% maximum per trade', desc: 'This is the foundation. Everything else builds on this. No exceptions, no "just this once."' },
          { num: '02', rule: 'Always set a stop loss BEFORE entering', desc: 'Know your exit before you enter. If you don\'t know where you\'re wrong, you shouldn\'t be in the trade.' },
          { num: '03', rule: 'Calculate position size for every trade', desc: 'Don\'t guess lot sizes. Use the formula: Risk Amount ÷ Stop Distance = Position Size. Every time.' },
          { num: '04', rule: 'Aim for minimum 1:2 risk-reward', desc: 'Risk $1 to make $2. This means you can be wrong more often than right and still profit.' },
          { num: '05', rule: 'Accept losses as a business cost', desc: 'Losses are not failures. They\'re the cost of doing business. A shop pays rent; a trader pays losses. Plan for them.' },
          { num: '06', rule: 'Never move your stop loss further away', desc: 'Moving your stop gives the market more room to take your money. If you\'re wrong, be wrong quickly and cheaply.' },
        ].map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
            className="flex items-start gap-4 p-5 glass-card rounded-2xl mb-3 hover:translate-x-1 transition-all">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center font-mono text-sm font-bold text-amber-400">{item.num}</div>
            <div><h4 className="font-bold text-[15px] mb-1">{item.rule}</h4><p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p></div>
          </motion.div>
        ))}
      </section>

      {/* Section 7: Quiz */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">07 — Final Assessment</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">Risk Management Quiz</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-300 text-base leading-relaxed mb-8">6 questions. This is the most important quiz in the entire academy. Nail this and you&apos;re already ahead of 90% of traders.</motion.p>
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
            <p className="text-sm text-gray-400">{score === 100 ? '🏆 Flawless. You understand the #1 rule.' : score >= 66 ? 'Solid. You respect risk — that puts you ahead of most.' : 'Review the lesson. This one matters more than any other.'}</p>
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
              <div className="w-[80px] h-[80px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-4xl shadow-lg shadow-amber-500/30">🛡️</div>
              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest mb-2">Pro Certificate</p>
              <h3 className="text-xl font-extrabold mb-1">Certificate of Mastery</h3>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">
                Has successfully mastered<br /><strong className="text-white">Level 1.5: Risk — The #1 Rule</strong><br />at ATLAS Academy by Interakktive
              </p>
              <p className="bg-gradient-to-r from-amber-400 to-accent-400 bg-clip-text text-transparent font-bold text-lg mb-1" style={{ WebkitTransform: 'translateZ(0)' }}>— Risk-Aware Trader —</p>
              <p className="font-mono text-[11px] text-gray-500 mb-4">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L1.5-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
            </div>
          </motion.div>
        )}
      </section>

      {/* Completion */}
      <section className="text-center px-5 pt-10 pb-24">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="max-w-md mx-auto p-8 glass-card rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-amber-500 to-accent-500" />
          <p className="text-3xl mb-3">🎓</p>
          <h2 className="text-xl font-bold mb-2">Level 1 Complete!</h2>
          <p className="text-sm text-gray-400 leading-relaxed mb-6">You&apos;ve finished all 5 Foundations lessons. You now understand what trading is, the markets available, how to read candles and charts, and the most important rule of all — risk management.</p>
          <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-primary-500/20 transition-all active:scale-95">
            Back to Academy
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
