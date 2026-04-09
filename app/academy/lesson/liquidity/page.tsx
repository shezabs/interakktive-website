// app/academy/lesson/liquidity/page.tsx
// ATLAS Academy — Lesson 3.3: Liquidity — The #1 Concept [PRO]
'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Crown, ArrowRight, ChevronDown } from 'lucide-react';

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

// ============================================================
// ANIMATED SCENES
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

// STOP HUNT ANIMATION — price sweeps below support, grabs stops, reverses
function StopHuntAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);

    const cycle = f % 360;
    const phase = cycle / 360; // 0-1

    const supportY = h * 0.55;
    const midX = w / 2;

    // Support line
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = 'rgba(14,165,233,0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(30, supportY);
    ctx.lineTo(w - 30, supportY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#0ea5e9';
    ctx.font = '9px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('SUPPORT', w - 32, supportY - 5);

    // Stop losses below support (the liquidity)
    const stopY = supportY + 25;
    ctx.fillStyle = phase < 0.5 ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.03)';
    ctx.fillRect(30, supportY + 2, w - 60, 35);

    if (phase < 0.5) {
      ctx.fillStyle = '#ef4444';
      ctx.font = '8px system-ui';
      ctx.textAlign = 'center';
      const stops = ['SL', 'SL', 'SL', 'SL', 'SL', 'SL', 'SL', 'SL'];
      stops.forEach((s, i) => {
        const sx = 50 + (i / (stops.length - 1)) * (w - 100);
        ctx.fillText(s, sx, stopY + 5);
      });
      ctx.font = '9px system-ui';
      ctx.fillStyle = '#ef4444';
      ctx.fillText('Retail Stop Losses = LIQUIDITY POOL', midX, stopY + 22);
    }

    // Price action
    const pricePoints: [number, number][] = [];
    const startX = 40;

    // Phase 1: Price approaching support (0-0.3)
    if (phase < 0.3) {
      const p = phase / 0.3;
      for (let i = 0; i <= 8; i++) {
        const t = i / 8;
        const x = startX + t * (w * 0.35);
        const y = h * 0.25 + t * (supportY - h * 0.25 - 10) + Math.sin(t * 6) * 8;
        pricePoints.push([x, y]);
      }
    }
    // Phase 2: Price breaks below, sweeps stops (0.3-0.5)
    else if (phase < 0.5) {
      const p = (phase - 0.3) / 0.2;
      for (let i = 0; i <= 8; i++) { const t = i / 8; pricePoints.push([startX + t * (w * 0.35), h * 0.25 + t * (supportY - h * 0.25 - 10) + Math.sin(t * 6) * 8]); }
      // Sweep below
      const sweepX = startX + w * 0.35 + p * w * 0.15;
      const sweepY = supportY + 10 + p * 25;
      pricePoints.push([sweepX, sweepY]);
    }
    // Phase 3: VIOLENT reversal upward (0.5-1.0)
    else {
      for (let i = 0; i <= 8; i++) { const t = i / 8; pricePoints.push([startX + t * (w * 0.35), h * 0.25 + t * (supportY - h * 0.25 - 10) + Math.sin(t * 6) * 8]); }
      pricePoints.push([startX + w * 0.5, supportY + 35]);
      const rp = (phase - 0.5) / 0.5;
      const revX = startX + w * 0.5 + rp * (w * 0.35);
      const revY = supportY + 35 - rp * (supportY + 35 - h * 0.12);
      pricePoints.push([revX, revY]);
    }

    // Draw price line
    if (pricePoints.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = '#0ea5e9';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#0ea5e9';
      ctx.shadowBlur = 4;
      pricePoints.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Labels per phase
    ctx.textAlign = 'center';
    if (phase < 0.3) {
      ctx.fillStyle = '#9ca3af';
      ctx.font = '10px system-ui';
      ctx.fillText('Price approaches support...', midX, h - 15);
    } else if (phase < 0.5) {
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 11px system-ui';
      ctx.fillText('SWEEP! Stops triggered = institution buys', midX, h - 15);
    } else {
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 11px system-ui';
      ctx.fillText('REVERSAL! Institution got their fill', midX, h - 15);

      if (phase > 0.7) {
        ctx.globalAlpha = Math.min((phase - 0.7) * 3, 1);
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 10px system-ui';
        ctx.fillText('Your stop loss was their entry ticket', midX, h - 30);
        ctx.globalAlpha = 1;
      }
    }

    // Title
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('THE LIQUIDITY SWEEP', midX, 14);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// EQUAL HIGHS/LOWS ANIMATION
function EqualLevelsAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);

    const phase = (f % 300) / 300;
    const midX = w / 2;

    // Draw price with equal highs
    const eqHighY = h * 0.2;
    const baseY = h * 0.65;
    const rand = seededRandom(42);

    const pts: [number, number][] = [];
    let price = baseY;
    for (let i = 0; i < 60; i++) {
      const x = 20 + (i / 59) * (w - 40);
      // Create 3 equal highs
      if (i === 12 || i === 30 || i === 48) {
        price = eqHighY + (rand() - 0.5) * 3;
      } else if (i === 20 || i === 38) {
        price = baseY - (rand() - 0.5) * 10;
      } else {
        price += (rand() - 0.5) * 4;
        price = Math.max(eqHighY + 10, Math.min(baseY + 10, price));
      }
      pts.push([x, price]);
    }

    // Price line
    ctx.beginPath();
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 1.5;
    pts.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
    ctx.stroke();

    // Equal highs line
    ctx.setLineDash([5, 3]);
    ctx.strokeStyle = 'rgba(239,68,68,0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(20, eqHighY);
    ctx.lineTo(w - 20, eqHighY);
    ctx.stroke();
    ctx.setLineDash([]);

    // "EQH" labels at each touch
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    [12, 30, 48].forEach(i => {
      const x = 20 + (i / 59) * (w - 40);
      ctx.fillText('EQH', x, eqHighY - 8);
      ctx.beginPath();
      ctx.arc(x, eqHighY, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Stop losses above
    if (phase > 0.2) {
      ctx.globalAlpha = Math.min((phase - 0.2) * 3, 1);
      ctx.fillStyle = 'rgba(239,68,68,0.1)';
      ctx.fillRect(20, eqHighY - 25, w - 40, 22);
      ctx.fillStyle = '#ef4444';
      ctx.font = '8px system-ui';
      ctx.fillText('Buy-Side Liquidity: Short sellers\' stop losses stacked above equal highs', midX, eqHighY - 13);
      ctx.globalAlpha = 1;
    }

    // Target label
    if (phase > 0.5) {
      ctx.globalAlpha = Math.min((phase - 0.5) * 3, 1);
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 10px system-ui';
      ctx.fillText('INSTITUTIONS TARGET THIS LIQUIDITY', midX, h - 15);
      ctx.globalAlpha = 1;
    }

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('EQUAL HIGHS = LIQUIDITY MAGNET', midX, 14);
  }, []);
  return <AnimScene drawFn={draw} height={230} />;
}

// ============================================================
// LIQUIDITY CHART — shows price with liquidity zones highlighted
// ============================================================
function LiquidityChart({ prices, zones, height = 280 }: {
  prices: number[];
  zones?: { y: number; type: 'bsl' | 'ssl'; label: string }[];
  height?: number;
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
    const w = rect.width, h = rect.height;

    ctx.fillStyle = '#060a12';
    ctx.fillRect(0, 0, w, h);

    const pMin = Math.min(...prices) - 2;
    const pMax = Math.max(...prices) + 2;
    const pRange = pMax - pMin;
    const len = prices.length;

    const px = (i: number) => 15 + (i / (len - 1)) * (w - 70);
    const py = (p: number) => 15 + (h - 30) * (1 - (p - pMin) / pRange);

    // Liquidity zones
    if (zones) {
      for (const z of zones) {
        const zy = py(z.y);
        const zoneH = 16;
        ctx.fillStyle = z.type === 'bsl' ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)';
        ctx.fillRect(15, zy - zoneH / 2, w - 70, zoneH);
        ctx.setLineDash([4, 3]);
        ctx.strokeStyle = z.type === 'bsl' ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(15, zy);
        ctx.lineTo(w - 55, zy);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = z.type === 'bsl' ? '#22c55e' : '#ef4444';
        ctx.font = '8px system-ui';
        ctx.textAlign = 'left';
        ctx.fillText(z.label, w - 52, zy + 3);
      }
    }

    // Price line
    ctx.beginPath();
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 2;
    for (let i = 0; i < len; i++) {
      i === 0 ? ctx.moveTo(px(i), py(prices[i])) : ctx.lineTo(px(i), py(prices[i]));
    }
    ctx.stroke();
  }, [prices, zones, height]);
  return <canvas ref={canvasRef} style={{ width: '100%', height }} className="rounded-xl bg-[#060a12]" />;
}

// ============================================================
// GAME DATA
// ============================================================
function genLiquidityScenario(type: string, seed: number): { prices: number[]; zones: { y: number; type: 'bsl' | 'ssl'; label: string }[] } {
  const rand = seededRandom(seed);
  const p: number[] = [100];
  let price = 100;

  if (type === 'eqh_bsl') {
    // Equal highs with BSL above — price will sweep up
    for (let i = 0; i < 15; i++) { price += 0.3 + (rand() - 0.45) * 1.5; p.push(price); }
    const eqH = price;
    for (let i = 0; i < 8; i++) { price -= 0.4 + (rand() - 0.5) * 0.8; p.push(price); }
    for (let i = 0; i < 10; i++) { price += 0.3 + (rand() - 0.45) * 1; p.push(price); }
    price = eqH + (rand() - 0.5) * 0.5; p.push(price);
    for (let i = 0; i < 6; i++) { price -= 0.3 + (rand() - 0.5) * 0.8; p.push(price); }
    return { prices: p, zones: [{ y: eqH + 1, type: 'bsl', label: 'BSL' }] };
  }
  if (type === 'eql_ssl') {
    // Equal lows with SSL below
    price = 110;
    p[0] = 110;
    for (let i = 0; i < 15; i++) { price -= 0.3 + (rand() - 0.55) * 1.5; p.push(price); }
    const eqL = price;
    for (let i = 0; i < 8; i++) { price += 0.4 + (rand() - 0.5) * 0.8; p.push(price); }
    for (let i = 0; i < 10; i++) { price -= 0.3 + (rand() - 0.55) * 1; p.push(price); }
    price = eqL + (rand() - 0.5) * 0.5; p.push(price);
    for (let i = 0; i < 6; i++) { price += 0.3 + (rand() - 0.5) * 0.8; p.push(price); }
    return { prices: p, zones: [{ y: eqL - 1, type: 'ssl', label: 'SSL' }] };
  }
  if (type === 'swing_high_bsl') {
    for (let i = 0; i < 20; i++) { price += 0.4 + (rand() - 0.45) * 1.5; p.push(price); }
    const swH = price;
    for (let i = 0; i < 15; i++) { price -= 0.3 + (rand() - 0.5) * 1; p.push(price); }
    for (let i = 0; i < 8; i++) { price += 0.2 + (rand() - 0.5) * 0.8; p.push(price); }
    return { prices: p, zones: [{ y: swH + 0.5, type: 'bsl', label: 'BSL' }] };
  }
  if (type === 'swing_low_ssl') {
    price = 112;
    p[0] = 112;
    for (let i = 0; i < 20; i++) { price -= 0.4 + (rand() - 0.55) * 1.5; p.push(price); }
    const swL = price;
    for (let i = 0; i < 15; i++) { price += 0.3 + (rand() - 0.5) * 1; p.push(price); }
    for (let i = 0; i < 8; i++) { price -= 0.2 + (rand() - 0.5) * 0.8; p.push(price); }
    return { prices: p, zones: [{ y: swL - 0.5, type: 'ssl', label: 'SSL' }] };
  }
  // both_sides
  for (let i = 0; i < 10; i++) { price += 0.4 + (rand() - 0.45) * 1.5; p.push(price); }
  const topLiq = price;
  for (let i = 0; i < 15; i++) { price -= 0.3 + (rand() - 0.5) * 1.2; p.push(price); }
  const botLiq = price;
  for (let i = 0; i < 10; i++) { price += 0.2 + (rand() - 0.5) * 1; p.push(price); }
  return { prices: p, zones: [{ y: topLiq + 0.5, type: 'bsl', label: 'BSL' }, { y: botLiq - 0.5, type: 'ssl', label: 'SSL' }] };
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function LiquidityLesson() {
  const [scrollY, setScrollY] = useState(0);
  const [activeConcept, setActiveConcept] = useState<string | null>(null);

  // Interactive chart
  const mainPrices = useMemo(() => {
    const rand = seededRandom(42);
    const p: number[] = [100];
    let price = 100;
    for (let i = 1; i < 60; i++) {
      let bias = 0;
      if (i < 15) bias = 0.3;
      else if (i < 25) bias = -0.2;
      else if (i < 40) bias = 0.25;
      else bias = -0.15;
      price += bias + (rand() - 0.5) * 2;
      p.push(price);
    }
    return p;
  }, []);

  const [showBSL, setShowBSL] = useState(false);
  const [showSSL, setShowSSL] = useState(false);

  const mainZones = useMemo(() => {
    const zones: { y: number; type: 'bsl' | 'ssl'; label: string }[] = [];
    const maxP = Math.max(...mainPrices);
    const minP = Math.min(...mainPrices);
    if (showBSL) zones.push({ y: maxP + 0.5, type: 'bsl', label: 'BSL (Buy-Side)' });
    if (showSSL) zones.push({ y: minP - 0.5, type: 'ssl', label: 'SSL (Sell-Side)' });
    return zones;
  }, [mainPrices, showBSL, showSSL]);

  // Game
  const gameTypes = useMemo(() => ['eqh_bsl', 'eql_ssl', 'swing_high_bsl', 'swing_low_ssl', 'both_sides'], []);
  const gameData = useMemo(() => gameTypes.map((t, i) => genLiquidityScenario(t, 600 + i * 47)), [gameTypes]);
  const gameOptions = ['Buy-Side Liquidity above equal highs', 'Sell-Side Liquidity below equal lows', 'Buy-Side Liquidity above swing high', 'Sell-Side Liquidity below swing low', 'Liquidity on BOTH sides (range)'];
  const gameExplanations = [
    'Price made equal highs — a flat ceiling that every retail trader sees as "resistance." Short sellers have their stop losses just above. That cluster of buy stops IS the buy-side liquidity. Institutions will push price up through those equal highs to trigger those stops and fill their sell orders.',
    'Price made equal lows — a flat floor that looks like "strong support." Long traders have stop losses just below. That cluster of sell stops IS the sell-side liquidity. Institutions will push price down through those equal lows to grab the liquidity and fill their buy orders.',
    'A prominent swing high with stop losses from short sellers sitting above it. Even without equal highs, any obvious swing high accumulates buy-side liquidity above it. The more "obvious" the high, the more stops are resting above it.',
    'A prominent swing low with stop losses from long traders sitting below it. Institutional traders know exactly where retail places stops — below obvious lows. This swing low is a liquidity target waiting to be swept.',
    'Price is ranging between clear highs and lows. Liquidity is building on BOTH sides — above the range highs (BSL from shorts) and below the range lows (SSL from longs). When institutions are ready, they\'ll sweep one side to fill orders, then push toward the other side.',
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
    { q: 'In Smart Money Concepts, "liquidity" primarily refers to:', opts: ['How much cash is in your account', 'Clusters of pending orders (especially stop losses) at obvious price levels that institutions target', 'The spread between bid and ask', 'Trading volume'], a: 1, explain: 'Liquidity in SMC = clusters of orders. When 10,000 traders put stop losses below the same support level, that\'s a liquidity pool. Institutions see this pool as their fuel — they need those orders to fill their massive positions.' },
    { q: '"Buy-Side Liquidity" (BSL) is found:', opts: ['Below support levels', 'ABOVE resistance levels, equal highs, and swing highs — where short sellers\' stop losses rest', 'In the middle of a range', 'Only on the daily chart'], a: 1, explain: 'BSL = buy orders stacked ABOVE obvious highs. Short sellers place stop losses (buy orders) above highs. Breakout traders place buy entries above highs. Both create buy-side liquidity that institutions target.' },
    { q: '"Sell-Side Liquidity" (SSL) is found:', opts: ['BELOW support levels, equal lows, and swing lows — where long traders\' stop losses rest', 'Above resistance', 'At moving averages', 'During news events only'], a: 0, explain: 'SSL = sell orders stacked BELOW obvious lows. Long traders put stop losses (sell orders) below lows. Breakdown traders put sell entries below lows. Both create sell-side liquidity.' },
    { q: 'Why are "equal highs" a liquidity magnet?', opts: ['They look pretty on a chart', 'Every trader sees the same level and places stops/entries at the same place — creating a dense cluster of orders', 'They indicate a strong trend', 'They\'re random coincidences'], a: 1, explain: 'Equal highs are the most visible level on any chart. Every retail trader sees the same flat resistance. Short sellers put stops above. Breakout traders put buy orders above. The result: a HUGE pool of buy-side liquidity right above those equal highs. For institutions, it\'s a buffet.' },
    { q: 'An institution needs to buy $1B of EUR/USD. They will likely:', opts: ['Click "market buy" for $1B', 'Push price DOWN first to trigger sell-side liquidity, then buy those sell orders at a cheaper price', 'Wait for a news event', 'Buy $1B in pre-market only'], a: 1, explain: 'They push price into SSL (below support) to trigger sell stops. Those triggered stops become sell orders — which the institution uses as the other side of their buy. They get filled at a CHEAPER price. What you call a "fakeout below support" is them filling their order.' },
    { q: 'After a liquidity sweep (price spikes past a level then reverses), what typically happens?', opts: ['Price continues in the sweep direction', 'Price reverses sharply — the sweep was the entry, the reversal is the real move', 'Nothing — it\'s random', 'The market closes'], a: 1, explain: 'The sweep IS the institutional entry. Once they\'ve grabbed the liquidity they needed, price reverses violently in the opposite direction. That\'s why "fake breakouts" reverse so fast — the institution got their fill and the real move has begun.' },
    { q: 'Which of these creates the MOST liquidity at a level?', opts: ['A single touch of support', 'Multiple touches creating equal lows with many traders seeing the same "strong support"', 'A round number with no touches', 'A moving average crossover'], a: 1, explain: 'Multiple touches = more traders see the level = more stops placed there = more liquidity. Equal lows after 3-4 tests are an absolute honey pot for institutions because the concentration of orders below is enormous.' },
    { q: 'To STOP being liquidity and START using it, you should:', opts: ['Place stops at obvious levels like everyone else', 'Understand where liquidity builds, wait for it to be swept, then enter in the direction of the real move', 'Never use stop losses', 'Only trade during Asian session'], a: 1, explain: 'Once you see liquidity as the fuel institutions need, you stop placing your stop at the obvious level and instead WAIT for the sweep. When price sweeps below support and immediately reverses, that\'s your entry signal — you\'re entering WITH the institution, not against them.' },
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

  const concepts: Record<string, { title: string; desc: string; where: string; who: string; analogy: string }> = {
    bsl: { title: 'Buy-Side Liquidity (BSL)', desc: 'Buy orders resting ABOVE obvious highs. Includes: short sellers\' stop losses (buy-to-close) and breakout traders\' entries (buy-to-open). Both are BUY orders waiting to be triggered.', where: 'Above equal highs, above swing highs, above resistance levels, above round numbers (e.g. $100, $2,000).', who: 'Short sellers with stops above + breakout buyers with entries above = massive cluster of buy orders.', analogy: 'Imagine a shelf of prizes just above reach. Everyone is jumping for it. The market maker IS the shelf — they\'ll lower it just enough to let a few people grab one, then yank it higher.' },
    ssl: { title: 'Sell-Side Liquidity (SSL)', desc: 'Sell orders resting BELOW obvious lows. Includes: long traders\' stop losses (sell-to-close) and breakdown traders\' entries (sell-to-open). Both are SELL orders waiting to be triggered.', where: 'Below equal lows, below swing lows, below support levels, below round numbers.', who: 'Long traders with stops below + breakdown sellers with entries below = massive cluster of sell orders.', analogy: 'A trapdoor beneath a stage. Everyone\'s standing on it thinking the floor is solid. The institution controls the lever — they open it, catch the falling traders\' orders, then close it and walk away with the liquidity.' },
    eqhl: { title: 'Equal Highs & Equal Lows', desc: 'When price tests the same level 2-3+ times and creates a flat line of highs or lows. These are the MOST powerful liquidity magnets because EVERYONE can see them. The more visible a level, the more stops cluster there.', where: 'Any chart where price bounces off the same price multiple times creating a flat top (EQH) or flat bottom (EQL).', who: 'Virtually every retail trader sees equal levels. They all place stops in the same spot. The concentration is extreme.', analogy: 'Like putting a "FREE MONEY" sign on the ground. Everyone runs toward it. The sign is bait — the institution is waiting behind the bush to collect the crowd\'s orders.' },
    internal: { title: 'Internal vs External Liquidity', desc: 'External liquidity = the obvious swing highs/lows on the current timeframe. Internal liquidity = the minor highs/lows BETWEEN the major swings. Price tends to take internal liquidity before external.', where: 'External: major swing points. Internal: the smaller swings between them.', who: 'External targets have more liquidity. Internal targets are stepping stones toward the bigger pool.', analogy: 'External = the ocean. Internal = the streams that flow into it. Price follows the streams before reaching the ocean.' },
  };

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-900/50"><motion.div className="h-full bg-gradient-to-r from-amber-500 to-accent-500" style={{ width: `${Math.min((scrollY / (typeof document !== 'undefined' ? document.body.scrollHeight - window.innerHeight : 1)) * 100, 100)}%` }} /></div>

      <nav className="sticky top-0 z-40 px-5 py-3 flex items-center justify-between" style={{ background: 'rgba(6,10,18,0.85)', backdropFilter: 'blur(16px)' }}>
        <Link href="/academy" className="text-xs text-gray-500 hover:text-gray-300 transition">← Academy</Link>
        <div className="flex items-center gap-2"><Crown className="w-3.5 h-3.5 text-amber-400" /><span className="text-xs font-bold text-amber-400">PRO · LEVEL 3</span></div>
      </nav>

      {/* Hero */}
      <section className="px-5 pt-16 pb-12 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 3 · Lesson 3</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight"><span className="bg-gradient-to-r from-red-400 via-amber-400 to-primary-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Liquidity</span></h1>
          <p className="text-lg font-bold text-amber-400 mb-2">The #1 Concept in Smart Money Trading</p>
          <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">Where the stops hide. Where institutions hunt. The single concept that explains 90% of &quot;confusing&quot; price action.</p>
        </motion.div>
      </section>

      {/* SECTION 00 — WHY THIS MATTERS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First — Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-lg font-bold text-white mb-3">🎣 Every &quot;fakeout&quot; you&apos;ve ever seen was an institution collecting liquidity.</p>
            <p className="text-gray-400 leading-relaxed mb-4">Remember every time price broke below support, triggered your stop loss, then immediately reversed back up? You thought it was random. It wasn&apos;t. <strong className="text-red-400">It was an institution grabbing your sell order to fill their massive buy.</strong></p>
            <p className="text-gray-400 leading-relaxed mb-4">Liquidity is the FUEL that makes markets move. Without it, institutions can&apos;t fill their billion-dollar orders. So they CREATE liquidity events by pushing price to levels where stop losses cluster — then they harvest those orders.</p>
            <p className="text-gray-400 leading-relaxed"><strong className="text-primary-400">Once you understand liquidity, every chart tells the same story:</strong> Where is the liquidity building? Where will price go to grab it? And where will it go AFTER the grab? This lesson answers all three questions.</p>
          </div>

          <StopHuntAnimation />

          <div className="mt-6 p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5">
            <p className="text-xs font-bold text-amber-400 mb-2">🔍 REAL SCENARIO</p>
            <p className="text-sm text-gray-300 leading-relaxed">EUR/USD has tested 1.0900 support THREE times — creating perfect equal lows. Thousands of retail traders have stops at 1.0895. One morning, price spikes to 1.0890 — all stops triggered. Retail traders are stopped out with losses. But price immediately reverses to 1.0950. <em className="text-amber-400">The bank needed those sell orders at 1.0890 to buy $800M of EUR/USD. Your stop loss at 1.0895 was their entry at 1.0890.</em></p>
          </div>
        </motion.div>
      </section>

      {/* SECTION 01 — BSL vs SSL */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 — The Two Sides</p>
          <h2 className="text-2xl font-extrabold mb-4">Buy-Side vs Sell-Side Liquidity</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">Every price level has liquidity on BOTH sides. Understanding which side the institution needs tells you which direction price will go.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="p-5 rounded-2xl glass-card border-t-4 border-green-400">
              <h3 className="font-bold text-green-400 text-sm mb-2">BSL — Buy-Side Liquidity</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-3">BUY orders sitting ABOVE obvious highs. Short sellers&apos; stop losses + breakout buyers&apos; entries.</p>
              <div className="p-2.5 rounded-lg bg-green-500/5 border border-green-500/15"><p className="text-[10px] text-gray-300">💡 <strong className="text-green-400">Found above:</strong> Equal highs, swing highs, resistance, round numbers. Price goes UP to grab BSL.</p></div>
            </div>
            <div className="p-5 rounded-2xl glass-card border-t-4 border-red-400">
              <h3 className="font-bold text-red-400 text-sm mb-2">SSL — Sell-Side Liquidity</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-3">SELL orders sitting BELOW obvious lows. Long traders&apos; stop losses + breakdown sellers&apos; entries.</p>
              <div className="p-2.5 rounded-lg bg-red-500/5 border border-red-500/15"><p className="text-[10px] text-gray-300">💡 <strong className="text-red-400">Found below:</strong> Equal lows, swing lows, support, round numbers. Price goes DOWN to grab SSL.</p></div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-primary-500/5 border border-primary-500/15">
            <p className="text-sm text-gray-300 leading-relaxed">💡 <strong className="text-primary-400">The key insight:</strong> If an institution wants to BUY, they push price DOWN into SSL first (to trigger sells that they can buy). If they want to SELL, they push price UP into BSL first (to trigger buys that they can sell into). <strong className="text-white">The sweep direction is OPPOSITE to the institution&apos;s intention.</strong></p>
          </div>
        </motion.div>
      </section>

      {/* SECTION 02 — EQUAL HIGHS/LOWS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 — The Liquidity Magnets</p>
          <h2 className="text-2xl font-extrabold mb-4">Equal Highs & Equal Lows</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">The most OBVIOUS levels on any chart are the biggest liquidity pools. And nothing is more obvious than a flat line of equal highs or equal lows.</p>

          <EqualLevelsAnimation />

          <div className="mt-6 space-y-3">
            {[
              { title: 'Why equal levels attract stops', desc: 'When price tests the same level 3+ times, every trader on the planet sees it. Short sellers above EQH place stops there. Breakout traders place entries there. The concentration of orders is MASSIVE.', icon: '🧲' },
              { title: 'The more touches, the bigger the pool', desc: 'Level tested 2 times = moderate liquidity. Tested 4 times = huge liquidity. Tested 6 times = institutional feast. Each touch adds more stops from more traders who "trust" the level.', icon: '📈' },
              { title: 'Equal levels are TARGETS, not protection', desc: 'Retail sees equal lows as "strong support that held 4 times." SMC sees equal lows as "a massive pool of sell stops waiting to be triggered." Same chart, completely opposite conclusion.', icon: '🎯' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -15 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="p-4 rounded-xl glass-card flex items-start gap-3">
                <span className="text-xl">{item.icon}</span>
                <div><h3 className="font-bold text-white text-sm mb-1">{item.title}</h3><p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p></div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* SECTION 03 — INTERACTIVE CHART */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 — See Liquidity on a Chart</p>
          <h2 className="text-2xl font-extrabold mb-4">Where Is the Liquidity?</h2>
          <p className="text-sm text-gray-400 mb-6">Toggle the overlays to see where buy-side and sell-side liquidity builds on this chart.</p>

          <div className="flex gap-2 mb-4">
            <button onClick={() => setShowBSL(!showBSL)} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${showBSL ? 'bg-green-500 text-black' : 'glass text-gray-400'}`}>BSL (Above Highs)</button>
            <button onClick={() => setShowSSL(!showSSL)} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${showSSL ? 'bg-red-500 text-white' : 'glass text-gray-400'}`}>SSL (Below Lows)</button>
          </div>

          <LiquidityChart prices={mainPrices} zones={mainZones} height={280} />

          <div className="mt-4 p-4 rounded-xl bg-primary-500/5 border border-primary-500/15">
            <p className="text-sm text-gray-300 leading-relaxed">💡 <strong className="text-primary-400">What to observe:</strong> Above the highest high = BSL zone (short sellers&apos; stops + breakout buyers). Below the lowest low = SSL zone (long traders&apos; stops + breakdown sellers). Institutions will push price into ONE of these zones to fill their orders, then reverse.</p>
          </div>
        </motion.div>
      </section>

      {/* SECTION 04 — CONCEPTS DEEP DIVE */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 — Deep Dive</p>
          <h2 className="text-2xl font-extrabold mb-3">Liquidity Concepts Explained</h2>
          <p className="text-sm text-gray-400 mb-6">Tap each concept for the full breakdown with location, participants, and analogy.</p>

          <div className="space-y-3">
            {Object.entries(concepts).map(([key, c]) => {
              const isOpen = activeConcept === key;
              return (
                <motion.div key={key} layout className="rounded-2xl glass-card overflow-hidden">
                  <button onClick={() => setActiveConcept(isOpen ? null : key)} className="w-full p-4 flex items-center justify-between text-left">
                    <h3 className="font-bold text-white text-sm">{c.title}</h3>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="px-4 pb-5 space-y-3">
                          <p className="text-sm text-gray-400 leading-relaxed">{c.desc}</p>
                          <div className="p-3 rounded-xl bg-primary-500/5 border border-primary-500/15"><p className="text-xs text-gray-300"><strong className="text-primary-400">Where:</strong> {c.where}</p></div>
                          <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15"><p className="text-xs text-gray-300"><strong className="text-amber-400">Who:</strong> {c.who}</p></div>
                          <div className="p-3 rounded-xl bg-accent-500/5 border border-accent-500/15"><p className="text-xs text-gray-300">💡 <strong className="text-accent-400">Analogy:</strong> {c.analogy}</p></div>
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

      {/* SECTION 05 — STOP BEING LIQUIDITY */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 — The Mindshift</p>
          <h2 className="text-2xl font-extrabold mb-6">Stop Being Liquidity. Start Using It.</h2>

          <div className="space-y-4">
            {[
              { wrong: 'Place your stop loss 5 pips below obvious support where everyone else does.', right: 'Place your stop below the liquidity zone — below WHERE the sweep would reach. If support is at $100 and the sweep might go to $99.50, your stop goes at $99.30.', shift: 'Stops go below the SWEEP zone, not below the level itself.' },
              { wrong: 'Buy the breakout above resistance immediately.', right: 'WAIT for the breakout to sweep above, then look for rejection. The sweep above is often a BSL grab. If price sweeps above and immediately shows bearish structure, the real move is DOWN.', shift: 'Breakouts are often sweeps. Wait for confirmation AFTER the sweep.' },
              { wrong: 'Panic sell when price breaks below your support.', right: 'Recognise the break as a potential liquidity sweep. If price breaks below and immediately shows bullish structure (CHoCH), the sweep IS your buy signal.', shift: 'What retail sees as a "breakdown" you see as a buying opportunity.' },
              { wrong: 'See equal highs/lows as "strong levels that will hold."', right: 'See equal levels as "liquidity targets that will be TAKEN." Plan your trades around the sweep: where will price go after it grabs that liquidity?', shift: 'Equal levels = targets, not protection.' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="p-5 rounded-2xl glass-card">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15"><p className="text-xs font-bold text-red-400 mb-1">❌ BEING LIQUIDITY</p><p className="text-[10px] text-gray-400 leading-relaxed">{item.wrong}</p></div>
                  <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/15"><p className="text-xs font-bold text-green-400 mb-1">✅ USING LIQUIDITY</p><p className="text-[10px] text-gray-400 leading-relaxed">{item.right}</p></div>
                </div>
                <p className="text-xs text-amber-400 font-bold">🔑 {item.shift}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* SECTION 06 — GAME */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 — Spot the Liquidity</p>
          <h2 className="text-2xl font-extrabold mb-2">Where Is the Target?</h2>
          <p className="text-sm text-gray-400 mb-6">5 charts with liquidity zones marked. Identify what type of liquidity is building.</p>

          {!gameComplete ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500">Round {gameRound + 1} of 5</span>
                <span className="text-xs text-amber-400 font-bold">{gameScore}/{gameRound + (gameAnswers[gameRound] !== null ? 1 : 0)} correct</span>
              </div>
              <div className="w-full h-1.5 bg-gray-800 rounded-full mb-4 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-accent-500 transition-all" style={{ width: `${((gameRound + (gameAnswers[gameRound] !== null ? 1 : 0)) / 5) * 100}%` }} />
              </div>

              <LiquidityChart prices={gameData[gameRound].prices} zones={gameData[gameRound].zones} height={260} />

              <div className="mt-4 space-y-2">
                {gameOptions.map((opt, oi) => {
                  const answered = gameAnswers[gameRound] !== null;
                  const isCorrect = oi === gameRound;
                  const isChosen = gameAnswers[gameRound] === oi;
                  let cls = 'glass text-gray-300 hover:bg-white/5';
                  if (answered) {
                    if (isCorrect) cls = 'bg-green-500/15 border-green-500/30 text-green-400';
                    else if (isChosen) cls = 'bg-red-500/15 border-red-500/30 text-red-400';
                    else cls = 'glass text-gray-600';
                  }
                  return (
                    <button key={oi} onClick={() => answerGame(oi)} disabled={answered} className={`w-full text-left p-3 rounded-xl border text-sm font-medium transition-all ${cls}`}>
                      {opt} {answered && isCorrect && '✓'} {answered && isChosen && !isCorrect && '✗'}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {gameAnswers[gameRound] !== null && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0 }} className="mt-4">
                    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
                      <p className="text-sm text-gray-300 leading-relaxed"><strong className="text-amber-400">Explanation:</strong> {gameExplanations[gameRound]}</p>
                    </div>
                    {gameShowNext && (
                      <button onClick={nextRound} className="mt-3 w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold shadow-lg shadow-amber-500/20 active:scale-95 transition-all">
                        {gameRound < 4 ? 'Next Round →' : 'See Results →'}
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-8 glass-card rounded-2xl">
              <p className={`text-5xl font-extrabold mb-2 ${gameScore >= 3 ? 'text-amber-400' : 'text-red-400'}`}>{gameScore}/5</p>
              <p className="text-sm text-gray-400 mb-4">{gameScore === 5 ? '🏆 You see where the stops hide.' : gameScore >= 3 ? 'Your liquidity vision is developing.' : 'Review BSL vs SSL and equal levels.'}</p>
              <button onClick={resetGame} className="px-6 py-2.5 rounded-xl glass text-xs text-gray-300 font-medium hover:text-white transition">Try Again</button>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* SECTION 07 — QUIZ */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 — Knowledge Check</p>
          <h2 className="text-2xl font-extrabold mb-6">Liquidity Quiz</h2>
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
            <p className="text-sm text-gray-400">{score === 100 ? '🏆 Liquidity master — you see the invisible.' : score >= 66 ? 'Solid understanding of liquidity.' : 'Review BSL/SSL and the mindshift section.'}</p>
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
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(239,68,68,0.06),transparent,rgba(245,158,11,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
            <div className="absolute inset-[1px] rounded-3xl border border-amber-500/10" />
            <div className="relative z-10">
              <div className="w-[80px] h-[80px] mx-auto mb-5 rounded-full bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center text-4xl shadow-lg shadow-red-500/30">🎣</div>
              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest mb-2">Pro Certificate</p>
              <h3 className="text-xl font-extrabold mb-1">Certificate of Mastery</h3>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">Has mastered<br /><strong className="text-white">Level 3.3: Liquidity — The #1 Concept</strong><br />at ATLAS Academy by Interakktive</p>
              <p className="bg-gradient-to-r from-red-400 via-amber-400 to-primary-400 bg-clip-text text-transparent font-bold text-lg mb-1" style={{ WebkitTransform: 'translateZ(0)' }}>— Liquidity Hunter —</p>
              <p className="font-mono text-[11px] text-gray-500 mb-4">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L3.3-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
            </div>
          </motion.div>
        )}
      </section>

      <section className="text-center px-5 pt-10 pb-24">
        <p className="text-xs tracking-widest uppercase text-gray-600 mb-4">Up Next</p>
        <h2 className="text-xl font-bold mb-6">Lesson 3.4 — Liquidity Sweeps & Inducement</h2>
        <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">
          Continue <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
