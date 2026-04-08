// app/academy/lesson/trendlines-channels/page.tsx
// ATLAS Academy — Lesson 2.2: Trendlines & Channels [PRO]
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import Link from 'next/link';
import { Crown, ArrowRight, Target, Award, Zap, Eye, RotateCcw, TrendingUp, TrendingDown } from 'lucide-react';

// ============================================================
// PRICE DATA
// ============================================================
function seededPrices(seed: number, count: number, trendBias: number = 0): number[] {
  const p: number[] = [100]; let s = seed;
  for (let i = 1; i < count; i++) {
    s = (s * 16807) % 2147483647;
    const r = (s / 2147483647 - 0.5) * 2;
    p.push(p[i - 1] + r + trendBias + Math.sin(i * 0.1) * 0.8);
  }
  return p;
}

const uptrendPrices = seededPrices(31, 140, 0.15);
const downtrendPrices = seededPrices(88, 140, -0.12);
const channelPrices = seededPrices(55, 160, 0.08);

// ============================================================
// SWING DETECTION
// ============================================================
function findSwings(prices: number[], lb: number = 4): { lows: { i: number; p: number }[]; highs: { i: number; p: number }[] } {
  const lows: { i: number; p: number }[] = [];
  const highs: { i: number; p: number }[] = [];
  for (let i = lb; i < prices.length - lb; i++) {
    let isLow = true, isHigh = true;
    for (let j = 1; j <= lb; j++) {
      if (prices[i] > prices[i - j] || prices[i] > prices[i + j]) isLow = false;
      if (prices[i] < prices[i - j] || prices[i] < prices[i + j]) isHigh = false;
    }
    if (isLow) lows.push({ i, p: prices[i] });
    if (isHigh) highs.push({ i, p: prices[i] });
  }
  return { lows, highs };
}

// ============================================================
// CHART DRAWING
// ============================================================
function drawChart(ctx: CanvasRenderingContext2D, W: number, H: number, prices: number[], extras?: {
  trendlines?: { x1: number; y1: number; x2: number; y2: number; color: string; label?: string; dashed?: boolean; extend?: boolean }[];
  swingDots?: { i: number; p: number; color: string }[];
  channel?: { topX1: number; topY1: number; topX2: number; topY2: number; botX1: number; botY1: number; botX2: number; botY2: number; color: string };
}) {
  const pad = { t: 15, b: 15, l: 8, r: 8 };
  const cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;
  const min = Math.min(...prices) - 2, max = Math.max(...prices) + 2;
  const toX = (i: number) => pad.l + (i / (prices.length - 1)) * cw;
  const toY = (v: number) => pad.t + (1 - (v - min) / (max - min)) * ch;

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.025)'; ctx.lineWidth = 1;
  for (let i = 0; i < 6; i++) { const y = pad.t + (i / 5) * ch; ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke(); }

  // Channel fill
  if (extras?.channel) {
    const ch2 = extras.channel;
    ctx.fillStyle = 'rgba(14,165,233,0.04)';
    ctx.beginPath();
    ctx.moveTo(toX(ch2.topX1), toY(ch2.topY1));
    ctx.lineTo(toX(ch2.topX2), toY(ch2.topY2));
    ctx.lineTo(toX(ch2.botX2), toY(ch2.botY2));
    ctx.lineTo(toX(ch2.botX1), toY(ch2.botY1));
    ctx.closePath(); ctx.fill();
  }

  // Trendlines
  extras?.trendlines?.forEach(tl => {
    ctx.strokeStyle = tl.color; ctx.lineWidth = 1.5;
    if (tl.dashed) ctx.setLineDash([6, 4]); else ctx.setLineDash([]);
    ctx.beginPath();
    const x1 = toX(tl.x1), y1 = toY(tl.y1), x2 = toX(tl.x2), y2 = toY(tl.y2);
    if (tl.extend) {
      // Extend line to edge of chart
      const dx = x2 - x1, dy = y2 - y1;
      const scale = (W - pad.r - x1) / dx;
      ctx.moveTo(x1, y1); ctx.lineTo(x1 + dx * scale, y1 + dy * scale);
    } else {
      ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
    }
    ctx.stroke(); ctx.setLineDash([]);
    if (tl.label) {
      ctx.font = '600 9px sans-serif'; ctx.fillStyle = tl.color; ctx.textAlign = 'left';
      ctx.fillText(tl.label, x2 + 6, y2 - 4);
    }
  });

  // Candlesticks
  const bw = Math.max(1.5, (cw / prices.length) * 0.5);
  for (let i = 1; i < prices.length; i++) {
    const o = prices[i - 1], c = prices[i];
    const hi = Math.max(o, c) + Math.abs(c - o) * 0.25;
    const lo = Math.min(o, c) - Math.abs(c - o) * 0.25;
    const bull = c >= o; const x = toX(i);
    ctx.strokeStyle = bull ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(x, toY(hi)); ctx.lineTo(x, toY(lo)); ctx.stroke();
    ctx.fillStyle = bull ? 'rgba(34,197,94,0.6)' : 'rgba(239,68,68,0.6)';
    const top = toY(Math.max(o, c)), bot = toY(Math.min(o, c));
    ctx.fillRect(x - bw / 2, top, bw, Math.max(bot - top, 1));
  }

  // Swing dots
  extras?.swingDots?.forEach(d => {
    const x = toX(d.i), y = toY(d.p);
    ctx.fillStyle = d.color; ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = d.color.replace(/[\d.]+\)$/, '0.15)');
    ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.fill();
  });

  return { toX, toY, min, max };
}

// ============================================================
// ANIMATED SCENE
// ============================================================
function AnimScene({ drawFn, height = 220 }: { drawFn: (ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => void; height?: number }) {
  const cRef = useRef<HTMLCanvasElement>(null); const dRef = useRef<HTMLDivElement>(null);
  const inView = useInView(dRef, { amount: 0.1 }); const fRef = useRef(0);
  useEffect(() => {
    const c = cRef.current, d = dRef.current; if (!c || !d) return;
    const ctx = c.getContext('2d'); if (!ctx) return; let id: number;
    const rs = () => { const r = d.getBoundingClientRect(); c.width = r.width * 2; c.height = r.height * 2; c.style.width = r.width + 'px'; c.style.height = r.height + 'px'; };
    rs(); window.addEventListener('resize', rs);
    const loop = () => { if (inView) { ctx.setTransform(2, 0, 0, 2, 0, 0); ctx.clearRect(0, 0, c.width, c.height); drawFn(ctx, c.width / 2, c.height / 2, fRef.current); } fRef.current++; id = requestAnimationFrame(loop); };
    loop(); return () => { cancelAnimationFrame(id); window.removeEventListener('resize', rs); };
  }, [inView, drawFn]);
  return <div ref={dRef} className="w-full rounded-2xl overflow-hidden" style={{ height, background: 'rgba(0,0,0,0.3)' }}><canvas ref={cRef} /></div>;
}

// ============================================================
// TRENDLINE TYPE DEMO
// ============================================================
function TrendlineTypeDemo() {
  const [type, setType] = useState<'uptrend' | 'downtrend' | 'channel'>('uptrend');

  const drawDemo = useCallback((ctx: CanvasRenderingContext2D, W: number, H: number) => {
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(0, 0, W, H);
    
    if (type === 'uptrend') {
      const prices = uptrendPrices;
      const { lows } = findSwings(prices, 5);
      const sortedLows = lows.sort((a, b) => a.i - b.i);
      const trendlines: any[] = [];
      const dots: any[] = sortedLows.slice(0, 4).map(l => ({ ...l, color: 'rgba(34,197,94,0.7)' }));
      if (sortedLows.length >= 2) {
        trendlines.push({ x1: sortedLows[0].i, y1: sortedLows[0].p, x2: sortedLows[Math.min(3, sortedLows.length - 1)].i, y2: sortedLows[Math.min(3, sortedLows.length - 1)].p, color: 'rgba(34,197,94,0.6)', label: 'UPTREND LINE', extend: true });
      }
      drawChart(ctx, W, H, prices, { trendlines, swingDots: dots });
    } else if (type === 'downtrend') {
      const prices = downtrendPrices;
      const { highs } = findSwings(prices, 5);
      const sortedHighs = highs.sort((a, b) => a.i - b.i);
      const trendlines: any[] = [];
      const dots: any[] = sortedHighs.slice(0, 4).map(h => ({ ...h, color: 'rgba(239,68,68,0.7)' }));
      if (sortedHighs.length >= 2) {
        trendlines.push({ x1: sortedHighs[0].i, y1: sortedHighs[0].p, x2: sortedHighs[Math.min(3, sortedHighs.length - 1)].i, y2: sortedHighs[Math.min(3, sortedHighs.length - 1)].p, color: 'rgba(239,68,68,0.6)', label: 'DOWNTREND LINE', extend: true });
      }
      drawChart(ctx, W, H, prices, { trendlines, swingDots: dots });
    } else {
      const prices = channelPrices;
      const { lows, highs } = findSwings(prices, 4);
      const sLows = lows.sort((a, b) => a.i - b.i);
      const sHighs = highs.sort((a, b) => a.i - b.i);
      const dots: any[] = [
        ...sLows.slice(0, 3).map(l => ({ ...l, color: 'rgba(34,197,94,0.6)' })),
        ...sHighs.slice(0, 3).map(h => ({ ...h, color: 'rgba(239,68,68,0.6)' })),
      ];
      const trendlines: any[] = [];
      const channel: any = {};
      if (sLows.length >= 2 && sHighs.length >= 2) {
        const bl = sLows[0], bl2 = sLows[Math.min(2, sLows.length - 1)];
        const th = sHighs[0], th2 = sHighs[Math.min(2, sHighs.length - 1)];
        trendlines.push({ x1: bl.i, y1: bl.p, x2: bl2.i, y2: bl2.p, color: 'rgba(34,197,94,0.5)', label: 'LOWER BOUND', extend: true });
        trendlines.push({ x1: th.i, y1: th.p, x2: th2.i, y2: th2.p, color: 'rgba(239,68,68,0.5)', label: 'UPPER BOUND', extend: true });
        Object.assign(channel, { topX1: th.i, topY1: th.p, topX2: th2.i, topY2: th2.p, botX1: bl.i, botY1: bl.p, botX2: bl2.i, botY2: bl2.p, color: 'rgba(14,165,233,0.04)' });
      }
      drawChart(ctx, W, H, prices, { trendlines, swingDots: dots, channel: sLows.length >= 2 && sHighs.length >= 2 ? channel : undefined });
    }
  }, [type]);

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="flex gap-2 p-3 border-b border-white/[0.06]">
        {([
          { id: 'uptrend' as const, label: '📈 Uptrend', col: 'green' },
          { id: 'downtrend' as const, label: '📉 Downtrend', col: 'red' },
          { id: 'channel' as const, label: '📊 Channel', col: 'primary' },
        ]).map(t => (
          <button key={t.id} onClick={() => setType(t.id)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95 ${type === t.id ? `bg-${t.col}-500/15 text-${t.col}-400 border border-${t.col}-500/25` : 'glass text-gray-500'}`}>
            {t.label}
          </button>
        ))}
      </div>
      <AnimScene drawFn={drawDemo} height={250} />
      <div className="p-5">
        <AnimatePresence mode="wait">
          <motion.div key={type} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            {type === 'uptrend' && (
              <><h4 className="font-bold text-[15px] mb-1 text-green-400">Ascending Trendline</h4>
              <p className="text-sm text-gray-400 leading-relaxed">Drawn along <strong>swing lows</strong> (green dots). Each low is higher than the last — that&apos;s an uptrend. The line acts as <strong>diagonal support</strong>. As long as price stays above it, buyers are in control.</p></>
            )}
            {type === 'downtrend' && (
              <><h4 className="font-bold text-[15px] mb-1 text-red-400">Descending Trendline</h4>
              <p className="text-sm text-gray-400 leading-relaxed">Drawn along <strong>swing highs</strong> (red dots). Each high is lower than the last — that&apos;s a downtrend. The line acts as <strong>diagonal resistance</strong>. As long as price stays below it, sellers are in control.</p></>
            )}
            {type === 'channel' && (
              <><h4 className="font-bold text-[15px] mb-1 text-primary-400">Price Channel</h4>
              <p className="text-sm text-gray-400 leading-relaxed">Two parallel trendlines — one along the lows, one along the highs. Price bounces between them like a ball in a corridor. The <strong>shaded area</strong> is the channel. Traders buy at the lower bound and sell at the upper bound.</p></>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================================
// TRENDLINE RULES VALIDATOR
// ============================================================
function TrendlineRulesDemo() {
  const [rule, setRule] = useState(0);
  const rules = [
    { title: 'Rule 1: Minimum 2 Touches', desc: 'A trendline needs at least 2 swing points to be valid. One point is nothing. Two points make a line. Three or more? That\'s a confirmed trendline.', icon: '✌️', importance: 'Essential' },
    { title: 'Rule 2: Use the Thick Part of Candles', desc: 'Candles have thin lines (wicks) and thick coloured parts (bodies). Use the thick parts to draw your line. The thin wicks are just momentary spikes — the body is where price actually decided to settle. It\'s like using someone\'s average height, not the height of their hair.', icon: '📐', importance: 'Important' },
    { title: 'Rule 3: If You Have to Squint, It\'s Not Real', desc: 'A good trendline is OBVIOUS. If you\'re twisting the line through candles trying to make it fit, it\'s not valid. It\'s like constellation spotting — if someone has to explain for 5 minutes why those stars look like a bear, it\'s probably not a bear.', icon: '🚫', importance: 'Critical' },
    { title: 'Rule 4: More Touches = Stronger', desc: 'A trendline with 5 touches is far more significant than one with 2. Each additional touch confirms that traders are respecting the diagonal level.', icon: '💪', importance: 'Key' },
    { title: 'Rule 5: Too Steep = Too Fragile', desc: 'A gentle slope is sustainable — like walking up a hill. A near-vertical slope is unsustainable — like trying to run up a cliff. If your trendline looks almost vertical, it WILL break soon. The best trends move at a comfortable, steady angle.', icon: '📏', importance: 'Practical' },
    { title: 'Rule 6: Break = Signal', desc: 'When price breaks through a well-established trendline, it\'s a significant event. An uptrend line break signals potential reversal to downside. Always have a plan.', icon: '💥', importance: 'Actionable' },
  ];

  return (
    <div className="space-y-3">
      {rules.map((r, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
          onClick={() => setRule(i)}
          className={`p-5 glass-card rounded-2xl cursor-pointer transition-all active:scale-[0.99] ${rule === i ? 'ring-1 ring-amber-500/20' : 'hover:translate-x-1'}`}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xl">{r.icon}</span>
            <h4 className="font-bold text-[15px] flex-1">{r.title}</h4>
            <span className="text-[9px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400">{r.importance}</span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">{r.desc}</p>
        </motion.div>
      ))}
    </div>
  );
}

// ============================================================
// INTERACTIVE: IDENTIFY THE BREAK
// ============================================================
function BreakIdentifier() {
  const [selected, setSelected] = useState<'break' | 'bounce' | null>(null);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const scenarios = [
    { prices: seededPrices(12, 100, 0.1), answer: 'bounce' as const, explain: 'Price touched the trendline and bounced higher. The uptrend is intact — this is a buying opportunity, not a break.' },
    { prices: seededPrices(45, 100, 0.08).map((p, i) => i > 70 ? p - (i - 70) * 0.4 : p), answer: 'break' as const, explain: 'Price sliced through the trendline and closed below it. The uptrend is broken — this is a bearish signal.' },
    { prices: seededPrices(78, 100, 0.12), answer: 'bounce' as const, explain: 'Another clean bounce off the ascending trendline. Higher lows are intact — bulls still in control.' },
    { prices: seededPrices(99, 100, 0.06).map((p, i) => i > 60 ? p - (i - 60) * 0.3 : p), answer: 'break' as const, explain: 'Clear break below the trendline with momentum. Time to consider shorts or exit longs.' },
  ];

  const sc = scenarios[round];

  const drawScenario = useCallback((ctx: CanvasRenderingContext2D, W: number, H: number) => {
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(0, 0, W, H);
    const { lows } = findSwings(sc.prices, 4);
    const sorted = lows.sort((a, b) => a.i - b.i);
    const trendlines: any[] = [];
    if (sorted.length >= 2) {
      trendlines.push({ x1: sorted[0].i, y1: sorted[0].p, x2: sorted[Math.min(2, sorted.length - 1)].i, y2: sorted[Math.min(2, sorted.length - 1)].p, color: 'rgba(245,158,11,0.5)', extend: true, dashed: true });
    }
    drawChart(ctx, W, H, sc.prices, { trendlines });
  }, [sc.prices]);

  const handleAnswer = (ans: 'break' | 'bounce') => {
    if (selected) return;
    setSelected(ans);
    if (ans === sc.answer) setScore(s => s + 1);
    setTimeout(() => {
      if (round < scenarios.length - 1) { setRound(r => r + 1); setSelected(null); }
      else setDone(true);
    }, 2000);
  };

  if (done) return (
    <div className="text-center p-6 glass-card rounded-2xl">
      <p className="text-3xl mb-2">{score >= 3 ? '🎯' : '📚'}</p>
      <p className="text-lg font-bold mb-1">{score}/{scenarios.length}</p>
      <p className="text-sm text-gray-400">{score >= 3 ? 'Sharp eye! You can read trendline breaks.' : 'Keep practising — breaks vs bounces is a critical skill.'}</p>
      <button onClick={() => { setRound(0); setScore(0); setDone(false); setSelected(null); }} className="mt-3 px-4 py-2 rounded-lg glass text-xs font-semibold text-amber-400">Try Again</button>
    </div>
  );

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
        <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Round {round + 1}/{scenarios.length}</span>
        <span className="text-xs text-gray-500">Score: {score}</span>
      </div>
      <AnimScene drawFn={drawScenario} height={200} />
      <div className="p-4">
        <p className="text-sm font-semibold mb-3 text-center">Did the trendline break or hold?</p>
        <div className="flex gap-2">
          {([{ id: 'bounce' as const, label: '✅ Bounce (Held)', col: 'green' }, { id: 'break' as const, label: '💥 Break (Failed)', col: 'red' }]).map(opt => {
            let cls = 'flex-1 p-3 rounded-xl text-xs font-semibold text-center cursor-pointer transition-all border active:scale-95 ';
            if (!selected) cls += 'glass hover:bg-white/[0.06]';
            else if (opt.id === sc.answer) cls += `bg-${opt.col}-500/15 border-${opt.col}-500/30 text-${opt.col}-400`;
            else if (opt.id === selected) cls += 'bg-red-500/15 border-red-500/30 text-red-400';
            else cls += 'bg-white/[0.02] border-white/[0.03] opacity-30';
            return <div key={opt.id} className={cls} onClick={() => handleAnswer(opt.id)}>{opt.label}</div>;
          })}
        </div>
        {selected && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-xs text-gray-400 leading-relaxed text-center">
            {selected === sc.answer ? '✅ Correct! ' : '❌ Not quite. '}{sc.explain}
          </motion.p>
        )}
      </div>
    </div>
  );
}

// ============================================================
// QUIZ
// ============================================================
const quizQuestions = [
  { q: "An ascending trendline is drawn along:", opts: ["Swing highs (peaks)", "Swing lows (valleys)", "Random points", "Closing prices only"], correct: 1, explain: "Ascending trendlines connect rising swing lows. Each low is higher than the last, confirming the uptrend. The line acts as diagonal support." },
  { q: "How many touch points does a trendline need to be valid?", opts: ["1 point", "Minimum 2 points", "Exactly 3 points", "At least 10 points"], correct: 1, explain: "Two points create a line. Three or more confirm it. One point is meaningless — you can draw a line through any single point in any direction." },
  { q: "What is a price channel?", opts: ["A single horizontal line", "Two parallel trendlines — one along highs, one along lows", "A moving average", "The spread between bid and ask"], correct: 1, explain: "A channel consists of two parallel diagonal lines. Price bounces between them like a ball in a corridor. Traders buy at the lower bound and sell at the upper." },
  { q: "A steep trendline (nearly vertical) is:", opts: ["The strongest kind", "Likely to break quickly", "Better than a shallow one", "Impossible to draw"], correct: 1, explain: "Very steep trendlines are unsustainable. The angle reflects momentum that can't be maintained. Moderate angles (20-35°) create the most reliable trendlines." },
  { q: "When drawing trendlines, you should connect:", opts: ["Only the absolute highest/lowest points", "Candle bodies for cleaner, more reliable lines", "Wick tips only", "Every single candle"], correct: 1, explain: "Bodies represent where price settled after the battle. Wicks are temporary spikes. Using bodies gives cleaner, more meaningful trendlines." },
  { q: "Price breaks below a well-established ascending trendline. This signals:", opts: ["Nothing — ignore it", "A potential trend reversal to the downside", "You should immediately buy", "The trendline was wrong"], correct: 1, explain: "A break of a respected trendline is a significant signal. It doesn't guarantee reversal, but it means the trend's momentum has shifted. Time to reassess." },
  { q: "In an ascending channel, where would you look to BUY?", opts: ["At the upper boundary", "At the lower boundary (support)", "In the exact middle", "Outside the channel"], correct: 1, explain: "Buy at the lower bound (channel support) with a stop below. Sell or take profit at the upper bound (channel resistance). Trade the range." },
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
export default function TrendlinesChannelsLesson() {
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
            <span className="text-sm text-amber-400">PRO — Level 2: Technical Analysis</span>
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,56px)] font-bold leading-[1.1] tracking-tight mb-5">
            Trendlines &<br /><span className="bg-gradient-to-r from-green-400 via-amber-400 to-red-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Channels</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">
            Diagonal support and resistance. The roadmap that shows you where price is heading and when the direction changes.
          </motion.p>
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-4 mt-6 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> 3 Chart Types</span>
            <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> Break vs Bounce Game</span>
            <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5" /> 7 Questions</span>
          </motion.div>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5">
            <span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span>
            <div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" />
          </motion.div>
        </motion.div>
      </section>

      {/* Section 1: What Are Trendlines */}
      
      {/* Section 00: Real-World Analogy */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">First — Why This Matters</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-4">Riding an Escalator</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-300 text-base leading-relaxed mb-4">Stand on an escalator going up. You keep rising without effort — that&apos;s a trend. Now imagine the escalator stops. You&apos;re still standing, but no longer rising. <strong className="text-white">A trendline tells you if the escalator is still running.</strong></motion.p>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-6">When price is trending up, it follows a diagonal path — like an escalator. A trendline drawn along the lows shows you the angle and speed. When price breaks below that line? The escalator just stopped. Time to step off.</motion.p>
          <motion.div variants={fadeUp} className="p-5 glass-card rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-primary-500" />
            <p className="text-sm text-gray-300 leading-relaxed"><strong className="text-amber-400">Real scenario:</strong> EUR/USD has been climbing for 3 weeks following a clean trendline. You buy on each pullback to the trendline and ride the bounce. On the fourth touch, price breaks through and closes below. <strong className="text-white">You exit immediately — saving yourself from a 150-pip drop that followed.</strong></p>
          </motion.div>
        </motion.div>
      </section>

      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">01 — The Concept</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">What Are Trendlines?</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-300 text-base leading-relaxed mb-4">
            Support and resistance are horizontal. But markets don&apos;t always move sideways — they <strong className="text-white">trend</strong>. A trendline is <strong className="text-white">diagonal support or resistance</strong> that follows the direction of the trend.
          </motion.p>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-8">
            In an uptrend, connect the rising swing lows — that line is your trendline. As long as price respects it, the trend is alive. When it breaks? That&apos;s your early warning signal that the trend may be over.
          </motion.p>
        </motion.div>

        {[
          { icon: <TrendingUp className="w-5 h-5 text-green-400" />, title: 'Ascending Trendline (Going Up)', desc: 'When price is trending upward, each dip is higher than the last — like climbing stairs. Draw a line along those dips and you get an ascending trendline. As long as price stays above this line, the uptrend is alive. Think of it as a rising floor that keeps lifting you higher.', border: 'border-l-green-500', bg: 'bg-green-500/10' },
          { icon: <TrendingDown className="w-5 h-5 text-red-400" />, title: 'Descending Trendline (Going Down)', desc: 'The opposite — each rally is weaker than the last, like a ball bouncing lower each time. Draw a line along those weakening rallies and you get a descending trendline. It\'s a falling ceiling that keeps pushing price lower.', border: 'border-l-red-500', bg: 'bg-red-500/10' },
          { icon: '📊', title: 'Price Channel (The Corridor)', desc: 'Imagine a bowling lane — price bounces between the gutters. Draw one line along the lows and another along the highs. That\'s a channel. Price ping-pongs between the two lines. Buy when it hits the bottom line, sell when it hits the top. Simple and effective.', border: 'border-l-primary-500', bg: 'bg-primary-500/10' },
        ].map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
            className={`p-5 glass-card rounded-2xl mb-3 border-l-4 ${item.border}`}>
            <div className="flex items-center gap-2 mb-2">
              {typeof item.icon === 'string' ? <span className="text-lg">{item.icon}</span> : <div className={`w-9 h-9 rounded-lg ${item.bg} flex items-center justify-center`}>{item.icon}</div>}
              <h4 className="font-bold text-[15px]">{item.title}</h4>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Section 2: Interactive Demo */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">02 — See It Live</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">Toggle Between Types</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-6">Switch between uptrend, downtrend, and channel views. Notice how the trendlines automatically connect the swing points (coloured dots).</motion.p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <TrendlineTypeDemo />
        </motion.div>
      </section>

      {/* Section 3: Drawing Rules */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">03 — The Rules</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">6 Rules for Valid Trendlines</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-8">Not every diagonal line is a trendline. Follow these rules to draw ones that actually work.</motion.p>
        </motion.div>
        <TrendlineRulesDemo />
      </section>

      {/* Section 4: Channels Deep Dive */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">04 — Channels</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">Trading Inside the Channel</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-8">Channels give you a complete trading framework: where to buy, where to sell, and when to exit.</motion.p>
        </motion.div>

        {[
          { icon: '🟢', title: 'Buy at Lower Bound', desc: 'When price touches the lower channel line, look for bullish candle patterns. Enter long with a stop just below the channel.', col: 'text-green-400' },
          { icon: '🔴', title: 'Sell at Upper Bound', desc: 'When price reaches the upper channel line, take profit or open shorts. The upper line is resistance — expect rejection.', col: 'text-red-400' },
          { icon: '💥', title: 'Channel Break = Something Big', desc: 'When price finally escapes the channel, it often makes a big move — like a compressed spring releasing. The bigger the channel (wider and longer), the bigger the breakout move tends to be. This is where significant profits are made.', col: 'text-amber-400' },
          { icon: '📏', title: 'The Middle Line Matters Too', desc: 'Draw an invisible line through the centre of the channel. Price often pauses or bounces here — it\'s like the centre line of a road. Not as powerful as the channel edges, but useful for fine-tuning your entries and exits.', col: 'text-primary-400' },
        ].map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
            className="flex items-start gap-4 p-5 glass-card rounded-2xl mb-3 hover:translate-x-1 transition-all">
            <span className="text-xl flex-shrink-0 mt-0.5">{item.icon}</span>
            <div><h4 className={`font-bold text-[15px] mb-1 ${item.col}`}>{item.title}</h4><p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p></div>
          </motion.div>
        ))}
      </section>

      {/* Section 5: Break vs Bounce Game */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">05 — Break or Bounce?</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">Can You Tell the Difference?</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-6">Look at each chart and decide: did the trendline hold or break? This is one of the most important real-time decisions you&apos;ll make as a trader.</motion.p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <BreakIdentifier />
        </motion.div>
      </section>

      {/* Section 6: Quiz */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">06 — Assessment</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">Trendlines & Channels Quiz</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-300 text-base leading-relaxed mb-8">7 questions. Prove you can draw, validate, and trade trendlines.</motion.p>
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
            <p className="text-sm text-gray-400">{score === 100 ? '🏆 Perfect. Trendlines are now in your arsenal.' : score >= 66 ? 'Solid — you can draw and trade trendlines.' : 'Review the rules and try again.'}</p>
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
              <div className="w-[80px] h-[80px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-4xl shadow-lg shadow-amber-500/30">📐</div>
              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest mb-2">Pro Certificate</p>
              <h3 className="text-xl font-extrabold mb-1">Certificate of Mastery</h3>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">Has mastered<br /><strong className="text-white">Level 2.2: Trendlines & Channels</strong><br />at ATLAS Academy by Interakktive</p>
              <p className="bg-gradient-to-r from-amber-400 to-accent-400 bg-clip-text text-transparent font-bold text-lg mb-1" style={{ WebkitTransform: 'translateZ(0)' }}>— Trendline Trader —</p>
              <p className="font-mono text-[11px] text-gray-500 mb-4">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L2.2-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
            </div>
          </motion.div>
        )}
      </section>

      {/* Next */}
      <section className="text-center px-5 pt-10 pb-24">
        <p className="text-xs tracking-widest uppercase text-gray-600 mb-4">Up Next</p>
        <h2 className="text-xl font-bold mb-6">Lesson 2.3 — Moving Averages</h2>
        <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">
          Continue <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
