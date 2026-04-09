// app/academy/lesson/premium-discount/page.tsx
// ATLAS Academy — Lesson 3.7: Premium & Discount Zones [PRO]
'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Crown, ArrowRight, ChevronDown } from 'lucide-react';

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

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
    const loop = () => { ctx.clearRect(0, 0, rect.width, rect.height); drawFn(ctx, rect.width, rect.height, frameRef.current); frameRef.current++; animRef.current = requestAnimationFrame(loop); };
    loop();
    return () => cancelAnimationFrame(animRef.current);
  }, [drawFn]);
  return <canvas ref={canvasRef} style={{ width: '100%', height }} className="rounded-2xl" />;
}

// ============================================================
// SHOPPING ANIMATION — buy on sale, sell at full price
// ============================================================
function ShoppingAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);
    const phase = (f % 400) / 400;
    const midX = w / 2;
    const midY = h / 2;

    // 50% line
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(20, midY);
    ctx.lineTo(w - 20, midY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('50% EQUILIBRIUM', midX, midY + 4);

    // Premium zone (above)
    ctx.fillStyle = 'rgba(239,68,68,0.06)';
    ctx.fillRect(20, 25, w - 40, midY - 25);
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('PREMIUM ZONE', midX, 18);
    ctx.font = '8px system-ui';
    ctx.fillStyle = '#9ca3af';
    ctx.fillText('Expensive — SELL here', midX, 38);

    // Discount zone (below)
    ctx.fillStyle = 'rgba(34,197,94,0.06)';
    ctx.fillRect(20, midY, w - 40, h - midY - 10);
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('DISCOUNT ZONE', midX, h - 8);
    ctx.font = '8px system-ui';
    ctx.fillStyle = '#9ca3af';
    ctx.fillText('Cheap — BUY here', midX, h - 22);

    // Price tag animation
    const isDiscount = phase < 0.5;
    const tagX = isDiscount ? midX - 50 : midX + 50;
    const tagY = isDiscount ? midY + (midY - 40) * (phase / 0.5) * 0.6 : 40 + (midY - 40) * ((phase - 0.5) / 0.5) * 0.6;

    ctx.font = '28px serif';
    ctx.textAlign = 'center';
    ctx.fillText(isDiscount ? '🏷️' : '💎', tagX, tagY);

    ctx.fillStyle = isDiscount ? '#22c55e' : '#ef4444';
    ctx.font = 'bold 9px system-ui';
    ctx.fillText(isDiscount ? 'ON SALE!' : 'FULL PRICE!', tagX, tagY + 18);

    // Shopping person
    ctx.font = '22px serif';
    const personX = isDiscount ? tagX + 40 : tagX - 40;
    ctx.fillText(isDiscount ? '🛒' : '💰', personX, tagY + 5);
    ctx.fillStyle = isDiscount ? '#22c55e' : '#ef4444';
    ctx.font = '7px system-ui';
    ctx.fillText(isDiscount ? 'Smart buyer' : 'Smart seller', personX, tagY + 20);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// INSTITUTIONAL CYCLE ANIMATION
// ============================================================
function InstitutionalCycleAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);
    const phase = (f % 500) / 500;
    const midY = h / 2;

    // 50% line
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = 'rgba(245,158,11,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, midY);
    ctx.lineTo(w - 20, midY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Zones
    ctx.fillStyle = 'rgba(239,68,68,0.03)';
    ctx.fillRect(20, 20, w - 40, midY - 20);
    ctx.fillStyle = 'rgba(34,197,94,0.03)';
    ctx.fillRect(20, midY, w - 40, h - midY - 10);

    // Price line that cycles: discount buy → rally → premium sell → drop → discount buy
    const pts: [number, number][] = [];
    const totalPts = 80;
    for (let i = 0; i < totalPts; i++) {
      const t = i / totalPts;
      const visible = t <= phase;
      if (!visible) break;
      const x = 30 + t * (w - 60);
      // Sinusoidal price cycling between discount and premium
      const cycle = Math.sin(t * Math.PI * 2.5) * (midY - 40);
      const y = midY - cycle;
      pts.push([x, y]);
    }

    if (pts.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = '#0ea5e9';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#0ea5e9';
      ctx.shadowBlur = 4;
      pts.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Labels at key points
    if (phase > 0.15) {
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('🏦 BUY (discount)', w * 0.15, h - 18);
    }
    if (phase > 0.35) {
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 8px system-ui';
      ctx.fillText('🏦 SELL (premium)', w * 0.38, 18);
    }
    if (phase > 0.55) {
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 8px system-ui';
      ctx.fillText('🏦 BUY again', w * 0.6, h - 18);
    }
    if (phase > 0.75) {
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 8px system-ui';
      ctx.fillText('🏦 SELL again', w * 0.82, 18);
    }

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('THE INSTITUTIONAL CYCLE: Buy Discount → Sell Premium → Repeat', w / 2, 12);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// P&D CHART
// ============================================================
function PDChart({ prices, swingHigh, swingLow, entryZone, height = 280 }: {
  prices: number[]; swingHigh: number; swingLow: number; entryZone?: 'premium' | 'discount' | null; height?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
    const w = rect.width, hh = rect.height;

    ctx.fillStyle = '#060a12';
    ctx.fillRect(0, 0, w, hh);

    const pMin = Math.min(...prices, swingLow) - 2;
    const pMax = Math.max(...prices, swingHigh) + 2;
    const pRange = pMax - pMin;
    const len = prices.length;
    const px = (i: number) => 15 + (i / (len - 1)) * (w - 70);
    const py = (p: number) => 15 + (hh - 30) * (1 - (p - pMin) / pRange);

    const eq = (swingHigh + swingLow) / 2;
    const eqY = py(eq);
    const shY = py(swingHigh);
    const slY = py(swingLow);

    // Premium zone
    ctx.fillStyle = 'rgba(239,68,68,0.05)';
    ctx.fillRect(15, shY, w - 70, eqY - shY);
    // Discount zone
    ctx.fillStyle = 'rgba(34,197,94,0.05)';
    ctx.fillRect(15, eqY, w - 70, slY - eqY);

    // 50% line
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = 'rgba(245,158,11,0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(15, eqY);
    ctx.lineTo(w - 55, eqY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Swing lines
    ctx.strokeStyle = 'rgba(239,68,68,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(15, shY); ctx.lineTo(w - 55, shY); ctx.stroke();
    ctx.strokeStyle = 'rgba(34,197,94,0.3)';
    ctx.beginPath(); ctx.moveTo(15, slY); ctx.lineTo(w - 55, slY); ctx.stroke();

    // Labels
    ctx.font = '8px system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ef4444';
    ctx.fillText('Premium', w - 52, (shY + eqY) / 2 + 3);
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('50% EQ', w - 52, eqY + 3);
    ctx.fillStyle = '#22c55e';
    ctx.fillText('Discount', w - 52, (eqY + slY) / 2 + 3);

    // Entry zone highlight
    if (entryZone === 'discount') {
      ctx.fillStyle = 'rgba(34,197,94,0.1)';
      ctx.fillRect(15, eqY, w - 70, slY - eqY);
      ctx.strokeStyle = 'rgba(34,197,94,0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(15, eqY, w - 70, slY - eqY);
      ctx.setLineDash([]);
    } else if (entryZone === 'premium') {
      ctx.fillStyle = 'rgba(239,68,68,0.1)';
      ctx.fillRect(15, shY, w - 70, eqY - shY);
      ctx.strokeStyle = 'rgba(239,68,68,0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(15, shY, w - 70, eqY - shY);
      ctx.setLineDash([]);
    }

    // Price line
    ctx.beginPath();
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 2;
    for (let i = 0; i < len; i++) {
      i === 0 ? ctx.moveTo(px(i), py(prices[i])) : ctx.lineTo(px(i), py(prices[i]));
    }
    ctx.stroke();
  }, [prices, swingHigh, swingLow, entryZone, height]);
  return <canvas ref={canvasRef} style={{ width: '100%', height }} className="rounded-xl bg-[#060a12]" />;
}

// ============================================================
// EQUILIBRIUM CALCULATOR
// ============================================================
function EquilibriumCalculator() {
  const [high, setHigh] = useState(1900);
  const [low, setLow] = useState(1800);
  const range = high - low;
  const eq = (high + low) / 2;

  const zones = [
    { pct: '100%', price: high, label: 'Swing High', color: '#6b7280' },
    { pct: '75%', price: high - range * 0.25, label: 'Deep Premium', color: '#ef4444' },
    { pct: '61.8%', price: high - range * 0.382, label: 'Premium + OTE', color: '#f97316' },
    { pct: '50%', price: eq, label: 'EQUILIBRIUM', color: '#f59e0b' },
    { pct: '38.2%', price: high - range * 0.618, label: 'Discount + OTE', color: '#22c55e' },
    { pct: '25%', price: high - range * 0.75, label: 'Deep Discount', color: '#10b981' },
    { pct: '0%', price: low, label: 'Swing Low', color: '#6b7280' },
  ];

  return (
    <div className="p-5 rounded-2xl glass-card">
      <h3 className="font-bold text-white text-sm mb-4">🧮 Premium & Discount Calculator</h3>
      <p className="text-xs text-gray-400 mb-4">Enter any swing high and swing low. See every zone with exact prices.</p>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div>
          <label className="text-[10px] text-gray-500 uppercase tracking-wider">Swing High</label>
          <input type="number" value={high} onChange={e => setHigh(Number(e.target.value))}
            className="w-full mt-1 p-2.5 rounded-lg bg-[#0d1320] border border-gray-700 text-white text-sm font-mono focus:border-amber-500 focus:outline-none" />
        </div>
        <div>
          <label className="text-[10px] text-gray-500 uppercase tracking-wider">Swing Low</label>
          <input type="number" value={low} onChange={e => setLow(Number(e.target.value))}
            className="w-full mt-1 p-2.5 rounded-lg bg-[#0d1320] border border-gray-700 text-white text-sm font-mono focus:border-amber-500 focus:outline-none" />
        </div>
      </div>
      <div className="space-y-1.5">
        {zones.map(z => (
          <div key={z.pct} className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: z.color + '08', borderLeft: `3px solid ${z.color}` }}>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold" style={{ color: z.color }}>{z.pct}</span>
              <span className="text-xs text-gray-500">{z.label}</span>
            </div>
            <span className="font-mono text-sm font-bold text-white">${z.price.toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
        <p className="text-xs text-gray-300 leading-relaxed">💡 <strong className="text-amber-400">The rule:</strong> Only BUY below ${eq.toFixed(0)} (discount). Only SELL above ${eq.toFixed(0)} (premium). The OTE zone (61.8-78.6% from the high) at ${(high - range * 0.382).toFixed(0)}-${(high - range * 0.618).toFixed(0)} is the sweet spot for entries.</p>
      </div>
    </div>
  );
}

// ============================================================
// GAME DATA
// ============================================================
function genPDScenario(type: string, seed: number): { prices: number[]; swingHigh: number; swingLow: number; entryZone: 'premium' | 'discount' | null } {
  const rand = seededRandom(seed);
  const p: number[] = [];
  let price = 100;

  if (type === 'buy_discount') {
    for (let i = 0; i < 10; i++) { price += 0.5 + (rand()-0.45)*1.2; p.push(price); }
    const sh = price;
    for (let i = 0; i < 15; i++) { price -= 0.4 + (rand()-0.5)*0.8; p.push(price); }
    // Price is now in discount zone (below 50%)
    for (let i = 0; i < 5; i++) { price -= 0.1 + (rand()-0.5)*0.5; p.push(price); }
    for (let i = 0; i < 10; i++) { price += 0.5 + (rand()-0.35)*1; p.push(price); }
    return { prices: p, swingHigh: sh, swingLow: Math.min(...p), entryZone: 'discount' };
  }
  if (type === 'sell_premium') {
    price = 90;
    for (let i = 0; i < 10; i++) { price -= 0.5 + (rand()-0.55)*1.2; p.push(price); }
    const sl = price;
    for (let i = 0; i < 15; i++) { price += 0.4 + (rand()-0.5)*0.8; p.push(price); }
    for (let i = 0; i < 5; i++) { price += 0.1 + (rand()-0.5)*0.5; p.push(price); }
    for (let i = 0; i < 10; i++) { price -= 0.5 + (rand()-0.65)*1; p.push(price); }
    return { prices: p, swingHigh: Math.max(...p), swingLow: sl, entryZone: 'premium' };
  }
  if (type === 'at_equilibrium') {
    for (let i = 0; i < 12; i++) { price += 0.4 + (rand()-0.45)*1.2; p.push(price); }
    const sh2 = price;
    for (let i = 0; i < 8; i++) { price -= 0.3 + (rand()-0.5)*0.8; p.push(price); }
    // Price sitting near 50%
    const sl2 = sh2 - (sh2 - Math.min(...p)) * 2;
    for (let i = 0; i < 10; i++) { price += (rand()-0.5)*0.8; p.push(price); }
    return { prices: p, swingHigh: sh2, swingLow: Math.min(...p), entryZone: null };
  }
  if (type === 'discount_with_ob') {
    for (let i = 0; i < 12; i++) { price += 0.5 + (rand()-0.45)*1.2; p.push(price); }
    const sh3 = price;
    for (let i = 0; i < 18; i++) { price -= 0.45 + (rand()-0.5)*0.8; p.push(price); }
    for (let i = 0; i < 8; i++) { price += 0.5 + (rand()-0.35)*1; p.push(price); }
    return { prices: p, swingHigh: sh3, swingLow: Math.min(...p), entryZone: 'discount' };
  }
  // premium_rejection
  price = 90;
  for (let i = 0; i < 12; i++) { price -= 0.4 + (rand()-0.55)*1.2; p.push(price); }
  const sl3 = price;
  for (let i = 0; i < 15; i++) { price += 0.45 + (rand()-0.5)*0.8; p.push(price); }
  // Rejection from premium
  for (let i = 0; i < 3; i++) { price += 0.1 + (rand()-0.5)*0.3; p.push(price); }
  for (let i = 0; i < 10; i++) { price -= 0.5 + (rand()-0.5)*1; p.push(price); }
  return { prices: p, swingHigh: Math.max(...p), swingLow: sl3, entryZone: 'premium' };
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function PremiumDiscountLesson() {
  const [scrollY, setScrollY] = useState(0);

  // Interactive chart
  const [showZones, setShowZones] = useState(true);
  const mainData = useMemo(() => {
    const rand = seededRandom(42);
    const p: number[] = [100];
    let price = 100;
    for (let i = 1; i < 60; i++) {
      let bias = 0;
      if (i < 15) bias = 0.4;
      else if (i < 30) bias = -0.2;
      else if (i < 45) bias = 0.3;
      else bias = -0.15;
      price += bias + (rand() - 0.5) * 2;
      p.push(price);
    }
    return p;
  }, []);
  const mainHigh = Math.max(...mainData);
  const mainLow = Math.min(...mainData);

  // Game
  const gameTypes = useMemo(() => ['buy_discount', 'sell_premium', 'at_equilibrium', 'discount_with_ob', 'premium_rejection'], []);
  const gameData = useMemo(() => gameTypes.map((t, i) => genPDScenario(t, 1000 + i * 47)), [gameTypes]);
  const gameOptions = [
    'BUY — price is in the discount zone (below 50%)',
    'SELL — price is in the premium zone (above 50%)',
    'WAIT — price is at equilibrium (no edge)',
    'BUY — discount zone + order block confluence',
    'SELL — premium zone rejection confirmed',
  ];
  const gameExplanations = [
    'Price rallied to a swing high, then pulled back deeply — well below the 50% equilibrium. This puts price in the DISCOUNT zone. Smart money buys cheap. With the trend still bullish (from the initial rally), buying in the discount is the institutional play. Wait for LTF confirmation, then enter long.',
    'Price dropped to a swing low, then rallied back — well above the 50% equilibrium. This puts price in the PREMIUM zone within a bearish range. Smart money sells expensive. The trend is bearish (from the initial drop), so selling in the premium zone is the institutional play.',
    'Price is hovering right around the 50% level — neither premium nor discount. There\'s no statistical edge at equilibrium. Smart money doesn\'t buy at full price or sell at a discount — they wait for price to move into a definitive zone. The correct action is WAIT for price to choose a side.',
    'Price is in the discount zone AND there\'s evidence of an order block at this level (a bearish candle followed by impulsive buying earlier). Discount + OB = double confluence. This is a higher-probability buy than just discount alone because you have TWO institutional reasons to expect a bounce.',
    'Price rallied into the premium zone and immediately showed rejection — a long upper wick or bearish engulfing. The premium zone acted as resistance and smart money is distributing. The rejection CONFIRMS the premium zone is active. Enter short with the institution.',
  ];

  const [gameRound, setGameRound] = useState(0);
  const [gameAnswers, setGameAnswers] = useState<(number | null)[]>(Array(5).fill(null));
  const [gameScore, setGameScore] = useState(0);
  const [gameShowNext, setGameShowNext] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  const answerGame = (choice: number) => {
    if (gameAnswers[gameRound] !== null) return;
    const na = [...gameAnswers]; na[gameRound] = choice; setGameAnswers(na);
    if (choice === gameRound) setGameScore(s => s + 1);
    setGameShowNext(true);
  };
  const nextRound = () => { if (gameRound < 4) { setGameRound(r => r + 1); setGameShowNext(false); } else setGameComplete(true); };
  const resetGame = () => { setGameRound(0); setGameAnswers(Array(5).fill(null)); setGameScore(0); setGameShowNext(false); setGameComplete(false); };

  // Quiz
  const quizQuestions = useMemo(() => [
    { q: 'The "equilibrium" or 50% level represents:', opts: ['A random price point', 'The exact midpoint between the swing high and swing low — the dividing line between premium and discount', 'The daily opening price', 'Where most volume occurred'], a: 1, explain: 'Equilibrium = (Swing High + Swing Low) / 2. Above it = premium (expensive). Below it = discount (cheap). This single line transforms how you see the entire chart — everything is either overpriced or on sale relative to this midpoint.' },
    { q: 'In layman\'s terms, premium and discount zones are like:', opts: ['Traffic signals', 'Shopping — you buy items on SALE (discount zone) and sell items at FULL PRICE (premium zone)', 'Weather patterns', 'Football positions'], a: 1, explain: 'Nobody buys a TV at full retail price if they know it\'ll be on sale next week. Smart money works the same way — they buy when price is "on sale" (discount) and sell when it\'s "overpriced" (premium). The 50% line is the price tag showing full price vs sale price.' },
    { q: 'Smart money typically BUYS in which zone?', opts: ['Premium zone (above 50%)', 'Discount zone (below 50%) — buying cheap for future profit', 'At the exact 50% level', 'It doesn\'t matter'], a: 1, explain: 'Institutions accumulate in the discount zone — buying when price is "cheap" relative to the range. This gives them the best entry price for the next leg up. They don\'t chase price into premium — they WAIT for the discount.' },
    { q: 'A trade entry in the premium zone should be:', opts: ['A long/buy position', 'A short/sell position — selling at expensive prices for future profit', 'Either direction', 'Avoided entirely'], a: 1, explain: 'Premium = sell zone. If price is above the 50% equilibrium, it\'s "expensive" — and smart money sells expensive. Your short entries belong in the premium zone, NOT your longs. Buying in the premium zone is like buying a stock at its all-time high on hype.' },
    { q: 'The OTE (Optimal Trade Entry) zone from Lesson 3.8 sits at:', opts: ['The 50% level exactly', 'The 61.8%-78.6% retracement — which falls in the DISCOUNT zone for bullish trades', '10% from the swing high', 'The opening price'], a: 1, explain: 'OTE = 61.8%-78.6% retracement from the swing high. This zone is WITHIN the discount area (below 50%). It combines Fibonacci with premium/discount — the OTE in a discount zone is the highest-probability entry in all of SMC. This is what Lesson 3.8 covers in depth.' },
    { q: 'Why should you AVOID entering at the 50% level?', opts: ['It\'s unlucky', 'There\'s no statistical edge at equilibrium — price is at "fair value" with equal probability of going up or down', 'It\'s too expensive', 'Only institutions trade at 50%'], a: 1, explain: 'At 50%, price is at "fair value" — not cheap, not expensive. There\'s no discount (for buying) and no premium (for selling). Entering here is a coin flip. Wait for price to move INTO premium or discount before taking a position.' },
    { q: 'Premium & Discount zones are most useful when combined with:', opts: ['Moving averages only', 'Order blocks, FVGs, and liquidity levels — an OB in the discount zone = maximum confluence', 'News events', 'They work best alone'], a: 1, explain: 'P&D zones filter your other SMC tools. An Order Block that sits in the discount zone is MORE valuable than one in the premium zone (for longs). An FVG in the premium zone is a better sell zone. P&D is the FILTER that grades every other zone you identify.' },
    { q: 'If the Daily chart shows a bearish range (swing high to swing low), and price rallies to the 75% level, this is:', opts: ['A buying opportunity', 'DEEP PREMIUM — a high-probability short entry zone, especially if there\'s a bearish OB or FVG here', 'Neutral', 'A breakout signal'], a: 1, explain: '75% = deep premium within a bearish range. This is where the institution will be selling. If there\'s also a bearish OB or FVG at this level, you have triple confluence (premium + OB + FVG). Set your short entry, stop above the swing high, target the discount zone or swing low.' },
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

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-900/50"><motion.div className="h-full bg-gradient-to-r from-amber-500 to-accent-500" style={{ width: `${Math.min((scrollY / (typeof document !== 'undefined' ? document.body.scrollHeight - window.innerHeight : 1)) * 100, 100)}%` }} /></div>
      <nav className="sticky top-0 z-40 px-5 py-3 flex items-center justify-between" style={{ background: 'rgba(6,10,18,0.85)', backdropFilter: 'blur(16px)' }}>
        <Link href="/academy" className="text-xs text-gray-500 hover:text-gray-300 transition">← Academy</Link>
        <div className="flex items-center gap-2"><Crown className="w-3.5 h-3.5 text-amber-400" /><span className="text-xs font-bold text-amber-400">PRO · LEVEL 3</span></div>
      </nav>

      <section className="px-5 pt-16 pb-12 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 3 · Lesson 7</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight"><span className="bg-gradient-to-r from-green-400 via-amber-400 to-red-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Premium &<br/>Discount Zones</span></h1>
          <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">Buy cheap. Sell expensive. The simplest rule in trading — and the one retail traders break most often.</p>
        </motion.div>
      </section>

      {/* 00 — WHY THIS MATTERS */}
      <section className="px-5 py-12 max-w-2xl mx-auto"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First — Why This Matters</p>
        <div className="p-6 rounded-2xl glass-card mb-6">
          <p className="text-lg font-bold text-white mb-3">🛍️ Would you buy a TV at full price if there&apos;s a sale next week?</p>
          <p className="text-gray-400 leading-relaxed mb-4">Of course not. You&apos;d wait for the discount. Yet in trading, retail traders do this CONSTANTLY — they buy when price is expensive (premium zone) because it &quot;looks bullish,&quot; and panic-sell when it&apos;s cheap (discount zone) because it &quot;looks scary.&quot;</p>
          <p className="text-gray-400 leading-relaxed mb-4"><strong className="text-white">Institutions do the opposite.</strong> They buy in the discount zone (cheap) and sell in the premium zone (expensive). Every single day. That&apos;s literally how they make billions — the same principle as buying wholesale and selling retail.</p>
          <p className="text-gray-400 leading-relaxed"><strong className="text-primary-400">Premium & Discount zones are the SIMPLEST concept in SMC</strong> but arguably the most POWERFUL filter. Once you overlay P&D on your charts, you&apos;ll immediately see which OBs and FVGs are worth trading and which ones to skip. It&apos;s the quality filter everything else passes through.</p>
        </div>
        <ShoppingAnimation />
        <div className="mt-6 p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5">
          <p className="text-xs font-bold text-amber-400 mb-2">🔍 REAL SCENARIO</p>
          <p className="text-sm text-gray-300 leading-relaxed">Gold ranges between $1,800 (swing low) and $1,900 (swing high). The 50% equilibrium is $1,850. A bullish Order Block sits at $1,825 — deep in the DISCOUNT zone. Price pulls back to $1,825, touches the OB, and a bullish engulfing forms. Entry at $1,825, stop at $1,810, target $1,890 (premium). <em className="text-amber-400">R:R = 1:4.3. All because you bought in the discount, not the premium.</em></p>
        </div>
      </motion.div></section>

      {/* 01 — THE 50% LINE */}
      <section className="px-5 py-12 max-w-2xl mx-auto"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 — The Dividing Line</p>
        <h2 className="text-2xl font-extrabold mb-4">The 50% Equilibrium</h2>
        <p className="text-sm text-gray-400 mb-6 leading-relaxed">Take any swing high and swing low. The exact midpoint between them is the equilibrium — the line that divides &quot;cheap&quot; from &quot;expensive.&quot;</p>
        <div className="p-5 rounded-2xl glass-card mb-6">
          <div className="font-mono text-center text-sm mb-4 p-3 rounded-lg bg-[#0d1320]">
            <span className="text-amber-400">Equilibrium</span> = (<span className="text-red-400">Swing High</span> + <span className="text-green-400">Swing Low</span>) / 2
          </div>
          <p className="text-sm text-gray-400 leading-relaxed mb-3">💡 <strong className="text-primary-400">In plain English:</strong> If a stock ranges between $100 and $200, the equilibrium is $150. Everything above $150 is &quot;expensive&quot; (premium). Everything below $150 is &quot;on sale&quot; (discount). You want to BUY below $150 and SELL above $150.</p>
          <p className="text-sm text-gray-400 leading-relaxed">This isn&apos;t magic — it&apos;s the same Fibonacci 50% level from Lesson 2.10. The difference is now you&apos;re using it as a FILTER for every trade decision: &quot;Am I buying cheap or buying expensive?&quot;</p>
        </div>
      </motion.div></section>

      {/* 02 — PREMIUM DEEP DIVE */}
      <section className="px-5 py-12 max-w-2xl mx-auto"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 — Premium Zone</p>
        <h2 className="text-2xl font-extrabold mb-4">Above 50% = Expensive = SELL Zone</h2>
        <div className="p-5 rounded-2xl glass-card border-l-4 border-red-400 mb-4">
          <p className="text-sm text-gray-400 leading-relaxed mb-3">When price is above the 50% equilibrium, it&apos;s trading at a <strong className="text-red-400">premium</strong> — like a product marked up above its fair value. Smart money DISTRIBUTES (sells) in this zone.</p>
          <p className="text-xs text-gray-400 leading-relaxed mb-3">💡 <strong className="text-red-400">Think of it this way:</strong> You bought a rare sneaker for $200. It&apos;s now worth $400. Would you hold it forever, or sell it while it&apos;s overpriced? Smart money sells their positions in the premium zone, taking profit from the retail traders who are buying &quot;because it looks bullish.&quot;</p>
        </div>
        <div className="space-y-2">
          {[
            { label: 'Premium (50-61.8%)', desc: 'Mildly expensive. Institutions begin distributing. Not the best sell zone but valid.' },
            { label: 'Deep Premium (61.8-78.6%)', desc: 'The sweet spot for shorts. OBs and FVGs here are high-probability sell zones. This overlaps with the OTE zone for bearish entries.' },
            { label: 'Extreme Premium (78.6-100%)', desc: 'Very close to the swing high. Highest risk for shorts (tight stop above high) but highest reward if it works.' },
          ].map((item, i) => (
            <div key={i} className="p-3 rounded-xl bg-red-500/5 border border-red-500/10"><p className="text-xs font-bold text-red-400 mb-0.5">{item.label}</p><p className="text-[10px] text-gray-400">{item.desc}</p></div>
          ))}
        </div>
      </motion.div></section>

      {/* 03 — DISCOUNT DEEP DIVE */}
      <section className="px-5 py-12 max-w-2xl mx-auto"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 — Discount Zone</p>
        <h2 className="text-2xl font-extrabold mb-4">Below 50% = Cheap = BUY Zone</h2>
        <div className="p-5 rounded-2xl glass-card border-l-4 border-green-400 mb-4">
          <p className="text-sm text-gray-400 leading-relaxed mb-3">When price is below the 50% equilibrium, it&apos;s trading at a <strong className="text-green-400">discount</strong> — like Black Friday prices. Smart money ACCUMULATES (buys) in this zone.</p>
          <p className="text-xs text-gray-400 leading-relaxed">💡 <strong className="text-green-400">Think of it this way:</strong> Your favourite stock drops 40% in a pullback. Retail panics: &quot;It&apos;s crashing!&quot; Smart money celebrates: &quot;It&apos;s on sale!&quot; They load up at discount prices, knowing the trend is still intact. When price recovers to premium, they sell to the retail traders who are now buying &quot;because it bounced.&quot;</p>
        </div>
        <div className="space-y-2">
          {[
            { label: 'Discount (38.2-50%)', desc: 'Mildly cheap. Institutions begin accumulating. Valid buy zone but not the best.' },
            { label: 'Deep Discount (21.4-38.2%)', desc: 'The sweet spot for longs. OBs and FVGs here are high-probability buy zones. Overlaps with OTE for bullish entries.' },
            { label: 'Extreme Discount (0-21.4%)', desc: 'Very close to swing low. Best price but highest risk of a genuine breakdown. Needs strong confirmation.' },
          ].map((item, i) => (
            <div key={i} className="p-3 rounded-xl bg-green-500/5 border border-green-500/10"><p className="text-xs font-bold text-green-400 mb-0.5">{item.label}</p><p className="text-[10px] text-gray-400">{item.desc}</p></div>
          ))}
        </div>
      </motion.div></section>

      {/* 04 — CALCULATOR */}
      <section className="px-5 py-12 max-w-2xl mx-auto"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 — Calculate Your Zones</p>
        <h2 className="text-2xl font-extrabold mb-6">Interactive P&D Calculator</h2>
        <EquilibriumCalculator />
      </motion.div></section>

      {/* 05 — INTERACTIVE CHART */}
      <section className="px-5 py-12 max-w-2xl mx-auto"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 — See It on a Chart</p>
        <h2 className="text-2xl font-extrabold mb-4">Premium & Discount Overlay</h2>
        <p className="text-sm text-gray-400 mb-4">The chart below shows price with the premium (red) and discount (green) zones overlaid. The amber dashed line is the 50% equilibrium.</p>
        <button onClick={() => setShowZones(!showZones)} className={`mb-4 px-4 py-2 rounded-xl text-xs font-bold transition-all ${showZones ? 'bg-amber-500 text-black' : 'glass text-gray-400'}`}>
          {showZones ? 'Zones Visible' : 'Show Zones'}
        </button>
        <PDChart prices={mainData} swingHigh={mainHigh} swingLow={mainLow} entryZone={showZones ? 'discount' : null} />
        <div className="mt-4 p-4 rounded-xl bg-primary-500/5 border border-primary-500/15">
          <p className="text-sm text-gray-300 leading-relaxed">💡 <strong className="text-primary-400">Notice:</strong> Price spends time in BOTH zones. The key is: only BUY when price is in the green (discount) zone, and only SELL when it&apos;s in the red (premium) zone. Entering at equilibrium (amber line) offers no edge.</p>
        </div>
      </motion.div></section>

      {/* 06 — INSTITUTIONAL CYCLE */}
      <section className="px-5 py-12 max-w-2xl mx-auto"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 — The Institutional Cycle</p>
        <h2 className="text-2xl font-extrabold mb-4">How Institutions Use Premium & Discount</h2>
        <p className="text-sm text-gray-400 mb-6 leading-relaxed">Watch the animation: institutions buy in the discount, ride price to the premium, sell, wait for the discount again, and repeat. This is the engine of the market.</p>
        <InstitutionalCycleAnimation />
        <div className="mt-6 space-y-3">
          {[
            { step: '1. Accumulate in Discount', desc: 'Price drops below 50%. Institution buys heavily using liquidity sweeps and OBs. Retail is panicking and selling — institution is buying their panic sells.', icon: '🛒', color: '#22c55e' },
            { step: '2. Mark Up (Rally)', desc: 'With positions loaded, the institution lets price rise. They don\'t need to push it — the selling pressure has dried up. Natural demand takes over.', icon: '📈', color: '#0ea5e9' },
            { step: '3. Distribute in Premium', desc: 'Price reaches premium zone (above 50%). Institution sells their position to retail traders who are NOW buying because "it looks bullish." The retail trader buys at the top; the institution sells to them.', icon: '💰', color: '#ef4444' },
            { step: '4. Mark Down (Drop)', desc: 'With positions offloaded, institution may even add shorts. Price drops. Retail panics. The cycle is ready to repeat from step 1.', icon: '📉', color: '#a855f7' },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -15 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="p-4 rounded-xl glass-card flex items-start gap-3" style={{ borderLeftWidth: '3px', borderLeftColor: item.color }}>
              <span className="text-xl">{item.icon}</span>
              <div><h3 className="font-bold text-white text-sm mb-1">{item.step}</h3><p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p></div>
            </motion.div>
          ))}
        </div>
      </motion.div></section>

      {/* 07 — P&D + OTHER TOOLS */}
      <section className="px-5 py-12 max-w-2xl mx-auto"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 — The Quality Filter</p>
        <h2 className="text-2xl font-extrabold mb-4">P&D Grades Everything Else</h2>
        <p className="text-sm text-gray-400 mb-6">Premium & Discount isn&apos;t a standalone signal — it&apos;s a FILTER that grades every OB, FVG, and entry you find.</p>
        <div className="space-y-3">
          {[
            { combo: 'Bullish OB in Discount Zone', grade: 'A+', desc: 'The institution\'s footprint (OB) sits at a cheap price (discount). Maximum confluence. This is where you place your full-size buy order.', color: '#22c55e' },
            { combo: 'Bullish OB in Premium Zone', grade: 'C', desc: 'The footprint exists but you\'d be buying at an expensive price. Low probability. Skip or use minimal size.', color: '#ef4444' },
            { combo: 'Bearish FVG in Premium Zone', grade: 'A+', desc: 'A price imbalance (FVG) at an expensive price. Sell-side confluence. Premium zone + FVG = high-probability short entry.', color: '#ef4444' },
            { combo: 'Bearish FVG in Discount Zone', grade: 'C', desc: 'You\'d be selling at a cheap price — against the zone\'s natural bias. Low probability. Look for bullish setups instead.', color: '#22c55e' },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              className="p-4 rounded-xl glass-card flex items-center justify-between">
              <div className="flex-1"><h3 className="font-bold text-white text-sm mb-1">{item.combo}</h3><p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p></div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 ml-3" style={{ background: item.grade === 'A+' ? '#22c55e20' : '#ef444420', color: item.grade === 'A+' ? '#22c55e' : '#ef4444' }}>{item.grade}</div>
            </motion.div>
          ))}
        </div>
      </motion.div></section>

      {/* 08 — COMMON MISTAKES */}
      <section className="px-5 py-12 max-w-2xl mx-auto"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 — Common Mistakes</p>
        <h2 className="text-2xl font-extrabold mb-6">4 P&D Mistakes That Cost Money</h2>
        <div className="space-y-4">
          {[
            { title: 'Buying in Premium', wrong: '"Price is going up so I should buy!" — you\'re buying after the move, at expensive prices.', right: 'Only buy in the DISCOUNT zone. If price is above 50%, you\'re too late for longs. Wait for a pullback.', tip: 'If it feels exciting to buy, you\'re probably in premium. If it feels scary to buy, you\'re probably in discount. Trade the scary one.' },
            { title: 'Selling in Discount', wrong: '"Price crashed, it\'s going to zero!" — you\'re selling at the cheapest price.', right: 'Only sell in the PREMIUM zone. If price is below 50%, you\'re too late for shorts. Wait for a rally.', tip: 'Your panic is the institution\'s opportunity. When you sell in fear, they buy your shares at a discount.' },
            { title: 'Ignoring the Zone When Using OBs/FVGs', wrong: 'Taking every OB trade regardless of whether it\'s in premium or discount.', right: 'Grade every OB/FVG: is it in the RIGHT zone? Bullish OBs in discount = A+. Bullish OBs in premium = skip.', tip: 'P&D is the first filter. Apply it BEFORE looking at OBs, FVGs, or any other entry.' },
            { title: 'Using Wrong Swing Points', wrong: 'Drawing P&D from random highs and lows on the 5-minute chart.', right: 'Use SIGNIFICANT swings on the HTF (Daily/4H). The swing high and low should be major turning points, not minor fluctuations.', tip: 'If the swing points aren\'t obvious to everyone, they\'re not significant enough for P&D zones.' },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="p-5 rounded-2xl glass-card">
              <h3 className="font-bold text-white mb-3">{i + 1}. {item.title}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15"><p className="text-xs font-bold text-red-400 mb-1">❌ WRONG</p><p className="text-[10px] text-gray-400 leading-relaxed">{item.wrong}</p></div>
                <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/15"><p className="text-xs font-bold text-green-400 mb-1">✅ RIGHT</p><p className="text-[10px] text-gray-400 leading-relaxed">{item.right}</p></div>
              </div>
              <p className="text-xs text-amber-400 font-bold">💡 {item.tip}</p>
            </motion.div>
          ))}
        </div>
      </motion.div></section>

      {/* 09 — GAME */}
      <section className="px-5 py-12 max-w-2xl mx-auto"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 — Zone Decision Game</p>
        <h2 className="text-2xl font-extrabold mb-2">Buy, Sell, or Wait?</h2>
        <p className="text-sm text-gray-400 mb-6">5 charts with P&D zones marked. Decide the correct action based on where price is.</p>
        {!gameComplete ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500">Round {gameRound + 1} of 5</span>
              <span className="text-xs text-amber-400 font-bold">{gameScore}/{gameRound + (gameAnswers[gameRound] !== null ? 1 : 0)} correct</span>
            </div>
            <div className="w-full h-1.5 bg-gray-800 rounded-full mb-4 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-500 to-accent-500 transition-all" style={{ width: `${((gameRound + (gameAnswers[gameRound] !== null ? 1 : 0)) / 5) * 100}%` }} />
            </div>
            <PDChart prices={gameData[gameRound].prices} swingHigh={gameData[gameRound].swingHigh} swingLow={gameData[gameRound].swingLow} entryZone={gameData[gameRound].entryZone} />
            <div className="mt-4 space-y-2">
              {gameOptions.map((opt, oi) => {
                const answered = gameAnswers[gameRound] !== null;
                const isCorrect = oi === gameRound;
                const isChosen = gameAnswers[gameRound] === oi;
                let cls = 'glass text-gray-300 hover:bg-white/5';
                if (answered) { if (isCorrect) cls = 'bg-green-500/15 border-green-500/30 text-green-400'; else if (isChosen) cls = 'bg-red-500/15 border-red-500/30 text-red-400'; else cls = 'glass text-gray-600'; }
                return (<button key={oi} onClick={() => answerGame(oi)} disabled={answered} className={`w-full text-left p-3 rounded-xl border text-sm font-medium transition-all ${cls}`}>{opt} {answered && isCorrect && '✓'} {answered && isChosen && !isCorrect && '✗'}</button>);
              })}
            </div>
            <AnimatePresence>
              {gameAnswers[gameRound] !== null && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0 }} className="mt-4">
                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15"><p className="text-sm text-gray-300 leading-relaxed"><strong className="text-amber-400">Explanation:</strong> {gameExplanations[gameRound]}</p></div>
                  {gameShowNext && (<button onClick={nextRound} className="mt-3 w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold shadow-lg shadow-amber-500/20 active:scale-95 transition-all">{gameRound < 4 ? 'Next Round →' : 'See Results →'}</button>)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-8 glass-card rounded-2xl">
            <p className={`text-5xl font-extrabold mb-2 ${gameScore >= 3 ? 'text-amber-400' : 'text-red-400'}`}>{gameScore}/5</p>
            <p className="text-sm text-gray-400 mb-4">{gameScore === 5 ? '🏆 You know when to buy cheap and sell expensive.' : gameScore >= 3 ? 'Your zone awareness is developing.' : 'Review premium vs discount and the filter section.'}</p>
            <button onClick={resetGame} className="px-6 py-2.5 rounded-xl glass text-xs text-gray-300 font-medium hover:text-white transition">Try Again</button>
          </motion.div>
        )}
      </motion.div></section>

      {/* 10 — QUIZ */}
      <section className="px-5 py-12 max-w-2xl mx-auto"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 — Knowledge Check</p>
        <h2 className="text-2xl font-extrabold mb-6">Premium & Discount Quiz</h2>
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
                if (answered) { if (isCorrect) cls = 'bg-green-500/15 border-green-500/30 text-green-400'; else if (isChosen) cls = 'bg-red-500/15 border-red-500/30 text-red-400'; else cls = 'glass text-gray-600'; }
                return (<button key={oi} onClick={() => { if (!answered) { const na = [...quizAnswers]; na[qi] = oi; setQuizAnswers(na); } }} disabled={answered} className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${cls}`}>{opt} {answered && isCorrect && '✓'} {answered && isChosen && !isCorrect && '✗'}</button>);
              })}
            </div>
            {quizAnswers[qi] !== null && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 text-sm text-gray-400 leading-relaxed"><span className="text-amber-400 font-bold">✓</span> {q.explain}</motion.div>)}
          </motion.div>
        ))}
      </div>
      {quizDone && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 text-center p-8 glass-card rounded-2xl"><p className={`text-5xl font-extrabold mb-2 ${score >= 66 ? 'text-amber-400' : 'text-red-400'}`}>{score}%</p><p className="text-sm text-gray-400">{score === 100 ? '🏆 You buy cheap and sell expensive — like an institution.' : score >= 66 ? 'Solid zone understanding.' : 'Review the zones and the quality filter section.'}</p></motion.div>)}
      </section>

      {/* Certificate */}
      <section className="px-5 py-16 text-center">
        {!certUnlocked ? (
          <div className="max-w-md mx-auto p-8 glass rounded-2xl"><p className="text-4xl mb-3 opacity-30">🔒</p><p className="text-sm text-gray-500">Score 66%+ to unlock your <strong className="text-amber-400">Pro Certificate</strong></p></div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, type: 'spring' }}
            className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(34,197,94,0.06),transparent,rgba(239,68,68,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
            <div className="absolute inset-[1px] rounded-3xl border border-amber-500/10" />
            <div className="relative z-10">
              <div className="w-[80px] h-[80px] mx-auto mb-5 rounded-full bg-gradient-to-br from-green-500 to-red-500 flex items-center justify-center text-4xl shadow-lg shadow-green-500/20">🏷️</div>
              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest mb-2">Pro Certificate</p>
              <h3 className="text-xl font-extrabold mb-1">Certificate of Mastery</h3>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">Has mastered<br /><strong className="text-white">Level 3.7: Premium & Discount Zones</strong><br />at ATLAS Academy by Interakktive</p>
              <p className="bg-gradient-to-r from-green-400 via-amber-400 to-red-400 bg-clip-text text-transparent font-bold text-lg mb-1" style={{ WebkitTransform: 'translateZ(0)' }}>— Value Trader —</p>
              <p className="font-mono text-[11px] text-gray-500 mb-4">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L3.7-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
            </div>
          </motion.div>
        )}
      </section>

      <section className="text-center px-5 pt-10 pb-24">
        <p className="text-xs tracking-widest uppercase text-gray-600 mb-4">Up Next</p>
        <h2 className="text-xl font-bold mb-6">Lesson 3.8 — Optimal Trade Entry (OTE)</h2>
        <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">
          Continue <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
