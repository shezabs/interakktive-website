// app/academy/lesson/reading-the-tape/page.tsx
// ATLAS Academy — Lesson 7.8: Reading the Tape [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 7
// GROUNDBREAKING: Interactive Candle Character Quiz — 10 candle+volume sequences on canvas
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
// ANIMATION 1: Volume-Price Relationship — 4 tape characters
// ============================================================
function VolumePriceAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.005; const cx = w / 2;
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('Volume Tells the Story — Price Confirms It', cx, 16);
    const types = [
      { label: 'ACCUMULATION', candles: [{ o: 0.6, c: 0.55, h: 0.7, l: 0.5, bull: false }, { o: 0.55, c: 0.52, h: 0.62, l: 0.48, bull: false }, { o: 0.52, c: 0.56, h: 0.6, l: 0.48, bull: true }, { o: 0.56, c: 0.54, h: 0.6, l: 0.5, bull: false }, { o: 0.54, c: 0.58, h: 0.62, l: 0.5, bull: true }], vols: [0.3, 0.25, 0.6, 0.2, 0.65], color: '#26A69A', desc: 'Rising volume on up candles' },
      { label: 'DISTRIBUTION', candles: [{ o: 0.45, c: 0.5, h: 0.55, l: 0.4, bull: true }, { o: 0.5, c: 0.52, h: 0.58, l: 0.48, bull: true }, { o: 0.52, c: 0.48, h: 0.56, l: 0.44, bull: false }, { o: 0.48, c: 0.5, h: 0.54, l: 0.44, bull: true }, { o: 0.5, c: 0.45, h: 0.54, l: 0.42, bull: false }], vols: [0.25, 0.2, 0.7, 0.2, 0.75], color: '#EF5350', desc: 'Rising volume on down candles' },
      { label: 'INDECISION', candles: [{ o: 0.5, c: 0.51, h: 0.56, l: 0.46, bull: true }, { o: 0.51, c: 0.49, h: 0.54, l: 0.46, bull: false }, { o: 0.49, c: 0.5, h: 0.54, l: 0.45, bull: true }, { o: 0.5, c: 0.49, h: 0.53, l: 0.47, bull: false }, { o: 0.49, c: 0.5, h: 0.52, l: 0.47, bull: true }], vols: [0.15, 0.12, 0.18, 0.1, 0.14], color: '#FFB300', desc: 'Low volume, small bodies, dojis' },
      { label: 'CLIMAX', candles: [{ o: 0.4, c: 0.55, h: 0.58, l: 0.38, bull: true }, { o: 0.55, c: 0.65, h: 0.68, l: 0.52, bull: true }, { o: 0.65, c: 0.75, h: 0.82, l: 0.62, bull: true }, { o: 0.75, c: 0.85, h: 0.9, l: 0.72, bull: true }, { o: 0.85, c: 0.78, h: 0.92, l: 0.75, bull: false }], vols: [0.4, 0.55, 0.7, 0.9, 0.95], color: '#a855f7', desc: 'Explosive volume + reversal candle' },
    ];
    const cycle = Math.floor((t % 16) / 4); const phaseT = (t % 4) / 3;
    const activeType = types[Math.min(cycle, 3)]; const visCandleCount = Math.min(5, Math.floor(phaseT * 6));
    const colW = (w - 40) / 4;
    types.forEach((tp, i) => { const lx = 20 + i * colW + colW / 2; ctx.fillStyle = i === Math.min(cycle, 3) ? tp.color : 'rgba(255,255,255,0.15)'; ctx.font = i === Math.min(cycle, 3) ? 'bold 9px system-ui' : '8px system-ui'; ctx.textAlign = 'center'; ctx.fillText(tp.label, lx, 38); });
    const chartL = w * 0.15; const chartR = w * 0.85; const chartW = chartR - chartL;
    const candleTop = 60; const candleBot = h * 0.58; const volTop = h * 0.65; const volBot = h - 20; const cw = chartW / 7;
    for (let i = 0; i < visCandleCount; i++) {
      const cd = activeType.candles[i]; const vol = activeType.vols[i]; const cx2 = chartL + (i + 1) * cw; const bw = cw * 0.55; const range = candleBot - candleTop;
      const oY = candleTop + (1 - cd.o) * range; const cY = candleTop + (1 - cd.c) * range; const hY = candleTop + (1 - cd.h) * range; const lY = candleTop + (1 - cd.l) * range;
      const bodyTop = Math.min(oY, cY); const bodyH = Math.max(1, Math.abs(oY - cY));
      ctx.strokeStyle = cd.bull ? '#26A69A' : '#EF5350'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx2, hY); ctx.lineTo(cx2, lY); ctx.stroke();
      ctx.fillStyle = cd.bull ? '#26A69A' : '#EF5350'; ctx.fillRect(cx2 - bw / 2, bodyTop, bw, bodyH);
      const volH = vol * (volBot - volTop); ctx.fillStyle = cd.bull ? 'rgba(38,166,154,0.5)' : 'rgba(239,83,80,0.5)'; ctx.fillRect(cx2 - bw / 2, volBot - volH, bw, volH);
    }
    ctx.fillStyle = activeType.color; ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center'; ctx.fillText(activeType.desc, cx, h - 5);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 2: Tape Decision Matrix — 4 character cards
// ============================================================
function TapeDecisionAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.004; const cx = w / 2;
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center'; ctx.fillText('The 4 Characters of Market Tape', cx, 16);
    const characters = [
      { name: 'CONVICTION', emoji: '💪', body: 'Large', volume: 'High', wick: 'Small', action: 'ENTER in direction', color: '#26A69A' },
      { name: 'ABSORPTION', emoji: '🧽', body: 'Small', volume: 'High', wick: 'Large', action: 'REVERSAL coming', color: '#FFB300' },
      { name: 'INDECISION', emoji: '🤷', body: 'Tiny', volume: 'Low', wick: 'Equal', action: 'WAIT — no info', color: '#6b7280' },
      { name: 'EXHAUSTION', emoji: '💨', body: 'Large→Small', volume: 'Spike→Drop', wick: 'Growing', action: 'FADE the move', color: '#a855f7' },
    ];
    const cardW = (w - 50) / 4; const cardH = h - 50; const activeIdx = Math.floor((t % 8) / 2);
    characters.forEach((ch, i) => {
      const x = 15 + i * (cardW + 6); const y = 35; const isActive = i === Math.min(activeIdx, 3);
      ctx.fillStyle = isActive ? ch.color + '25' : 'rgba(255,255,255,0.03)'; ctx.beginPath(); ctx.roundRect(x, y, cardW, cardH, 8); ctx.fill();
      ctx.strokeStyle = isActive ? ch.color + '60' : 'rgba(255,255,255,0.05)'; ctx.lineWidth = isActive ? 1.5 : 0.5; ctx.beginPath(); ctx.roundRect(x, y, cardW, cardH, 8); ctx.stroke();
      const textX = x + cardW / 2; ctx.textAlign = 'center';
      ctx.fillStyle = isActive ? ch.color : 'rgba(255,255,255,0.3)'; ctx.font = `bold ${isActive ? 9 : 7}px system-ui`; ctx.fillText(ch.name, textX, y + 20);
      ctx.font = `${isActive ? 22 : 16}px system-ui`; ctx.fillText(ch.emoji, textX, y + 50);
      if (isActive) { ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '8px system-ui'; ctx.fillText(`Body: ${ch.body}`, textX, y + 75); ctx.fillText(`Volume: ${ch.volume}`, textX, y + 90); ctx.fillText(`Wicks: ${ch.wick}`, textX, y + 105); ctx.fillStyle = ch.color; ctx.font = 'bold 8px system-ui'; ctx.fillText(ch.action, textX, y + 125); }
    });
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// CANDLE CHARACTER QUIZ — Canvas renderer
// ============================================================
interface CandleData { o: number; c: number; h: number; l: number; }
interface TapeSequence { name: string; instrument: string; candles: CandleData[]; volumes: number[]; answer: 'accumulation' | 'distribution' | 'indecision' | 'climax'; explanation: string; }

const tapeSequences: TapeSequence[] = [
  { name: 'Sequence 1', instrument: 'XAUUSD — 15M', candles: [{ o: 50, c: 45, h: 52, l: 43 }, { o: 45, c: 42, h: 47, l: 40 }, { o: 42, c: 46, h: 48, l: 40 }, { o: 46, c: 44, h: 48, l: 42 }, { o: 44, c: 49, h: 51, l: 43 }, { o: 49, c: 47, h: 51, l: 45 }, { o: 47, c: 52, h: 54, l: 46 }], volumes: [30, 25, 55, 20, 65, 18, 70], answer: 'accumulation', explanation: 'Price is making higher lows while volume spikes on bullish candles and dries up on bearish ones. Smart money is absorbing sells — accumulating before a markup phase.' },
  { name: 'Sequence 2', instrument: 'EUR/USD — 1H', candles: [{ o: 50, c: 56, h: 58, l: 49 }, { o: 56, c: 60, h: 62, l: 55 }, { o: 60, c: 58, h: 64, l: 56 }, { o: 58, c: 62, h: 63, l: 57 }, { o: 62, c: 57, h: 64, l: 55 }, { o: 57, c: 60, h: 61, l: 55 }, { o: 60, c: 54, h: 62, l: 52 }], volumes: [25, 20, 60, 18, 70, 22, 75], answer: 'distribution', explanation: 'Price is making lower highs while bearish candles show increasing volume. Smart money is selling into buying pressure — distributing before a markdown phase.' },
  { name: 'Sequence 3', instrument: 'NASDAQ — 5M', candles: [{ o: 50, c: 51, h: 53, l: 48 }, { o: 51, c: 49, h: 52, l: 48 }, { o: 49, c: 50, h: 52, l: 47 }, { o: 50, c: 50, h: 53, l: 48 }, { o: 50, c: 51, h: 52, l: 49 }, { o: 51, c: 49, h: 52, l: 48 }, { o: 49, c: 50, h: 51, l: 48 }], volumes: [12, 10, 8, 7, 9, 8, 6], answer: 'indecision', explanation: 'Tiny bodies, overlapping candles, declining volume. Nobody is in control. This is a NO-TRADE zone.' },
  { name: 'Sequence 4', instrument: 'XAUUSD — 4H', candles: [{ o: 30, c: 42, h: 44, l: 28 }, { o: 42, c: 55, h: 58, l: 40 }, { o: 55, c: 68, h: 72, l: 52 }, { o: 68, c: 80, h: 85, l: 65 }, { o: 80, c: 88, h: 95, l: 78 }, { o: 88, c: 84, h: 96, l: 80 }, { o: 84, c: 76, h: 88, l: 72 }], volumes: [40, 55, 70, 85, 95, 90, 80], answer: 'climax', explanation: 'Parabolic move with expanding volume and bodies, followed by a rejection candle on the highest volume. Buying climax — exhaustion at the top.' },
  { name: 'Sequence 5', instrument: 'GBP/USD — 15M', candles: [{ o: 60, c: 55, h: 62, l: 53 }, { o: 55, c: 52, h: 57, l: 50 }, { o: 52, c: 54, h: 56, l: 50 }, { o: 54, c: 51, h: 56, l: 49 }, { o: 51, c: 55, h: 57, l: 49 }, { o: 55, c: 53, h: 57, l: 51 }, { o: 53, c: 58, h: 60, l: 52 }], volumes: [35, 30, 60, 22, 65, 20, 72], answer: 'accumulation', explanation: 'After an initial drop, bullish candles show progressively higher volume while bearish candles see declining volume. Classic accumulation breakout.' },
  { name: 'Sequence 6', instrument: 'NASDAQ — 1H', candles: [{ o: 50, c: 44, h: 52, l: 42 }, { o: 44, c: 38, h: 46, l: 36 }, { o: 38, c: 32, h: 40, l: 30 }, { o: 32, c: 25, h: 35, l: 22 }, { o: 25, c: 20, h: 28, l: 18 }, { o: 20, c: 15, h: 24, l: 12 }, { o: 15, c: 22, h: 26, l: 12 }], volumes: [45, 55, 65, 75, 88, 95, 92], answer: 'climax', explanation: 'Waterfall decline with expanding bearish bodies and volume spiking to extremes. The final candle is a bullish rejection — a selling climax.' },
  { name: 'Sequence 7', instrument: 'EUR/USD — 4H', candles: [{ o: 40, c: 45, h: 47, l: 38 }, { o: 45, c: 50, h: 52, l: 44 }, { o: 50, c: 47, h: 54, l: 46 }, { o: 47, c: 52, h: 53, l: 46 }, { o: 52, c: 48, h: 55, l: 46 }, { o: 48, c: 51, h: 52, l: 46 }, { o: 51, c: 46, h: 53, l: 44 }], volumes: [22, 18, 65, 15, 72, 20, 78], answer: 'distribution', explanation: 'Price makes higher highs but volume only spikes on bearish candles. Each rally has weaker volume while each sell-off gets stronger. Classic distribution.' },
  { name: 'Sequence 8', instrument: 'XAUUSD — 1H', candles: [{ o: 50, c: 51, h: 54, l: 49 }, { o: 51, c: 50, h: 53, l: 48 }, { o: 50, c: 50, h: 52, l: 49 }, { o: 50, c: 51, h: 53, l: 49 }, { o: 51, c: 50, h: 52, l: 48 }, { o: 50, c: 51, h: 53, l: 48 }], volumes: [15, 18, 12, 14, 10, 8], answer: 'indecision', explanation: 'Price barely moves. Bodies are tiny. Wicks overlap. Volume declining — market is asleep. No character, no trade.' },
  { name: 'Sequence 9', instrument: 'GBP/USD — 4H', candles: [{ o: 55, c: 60, h: 62, l: 54 }, { o: 60, c: 65, h: 67, l: 58 }, { o: 65, c: 62, h: 68, l: 60 }, { o: 62, c: 58, h: 64, l: 56 }, { o: 58, c: 55, h: 60, l: 53 }, { o: 55, c: 50, h: 57, l: 48 }, { o: 50, c: 46, h: 52, l: 44 }], volumes: [30, 35, 55, 62, 70, 75, 80], answer: 'distribution', explanation: 'After an initial rally, each subsequent candle is bearish with rising volume. Distribution complete, markdown begun.' },
  { name: 'Sequence 10', instrument: 'NASDAQ — 15M', candles: [{ o: 50, c: 55, h: 56, l: 48 }, { o: 55, c: 60, h: 62, l: 54 }, { o: 60, c: 66, h: 68, l: 58 }, { o: 66, c: 74, h: 78, l: 64 }, { o: 74, c: 82, h: 86, l: 72 }, { o: 82, c: 90, h: 95, l: 80 }, { o: 90, c: 82, h: 98, l: 78 }], volumes: [35, 45, 55, 70, 82, 95, 98], answer: 'climax', explanation: 'Textbook buying climax: accelerating price with expanding bodies and volume. Final candle shows massive upper wick on highest volume — the blow-off top.' },
];

function CandleQuizCanvas({ sequence, showResult }: { sequence: TapeSequence; showResult: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const dpr = window.devicePixelRatio || 1; const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr; canvas.height = rect.height * dpr; ctx.scale(dpr, dpr);
    const w = rect.width; const h = rect.height; ctx.clearRect(0, 0, w, h);
    const candles = sequence.candles; const vols = sequence.volumes; const candleCount = candles.length; const pad = 15;
    const candleAreaTop = 10; const candleAreaBot = h * 0.58; const volAreaTop = h * 0.65; const volAreaBot = h - 8;
    const chartW = w - pad * 2; const slotW = chartW / (candleCount + 1); const bodyW = slotW * 0.55;
    let minP = Infinity; let maxP = -Infinity;
    candles.forEach(cd => { if (cd.l < minP) minP = cd.l; if (cd.h > maxP) maxP = cd.h; });
    const priceRange = maxP - minP || 1; const py = (p: number) => candleAreaTop + (1 - (p - minP) / priceRange) * (candleAreaBot - candleAreaTop);
    const maxVol = Math.max(...vols);
    ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.font = '7px system-ui'; ctx.textAlign = 'left'; ctx.fillText('VOLUME', pad, volAreaTop - 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(pad, h * 0.62); ctx.lineTo(w - pad, h * 0.62); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = 'bold 9px system-ui'; ctx.textAlign = 'right'; ctx.fillText(sequence.instrument, w - pad, candleAreaTop + 10);
    for (let i = 0; i < candleCount; i++) {
      const cd = candles[i]; const vol = vols[i]; const cx = pad + (i + 1) * slotW; const isBull = cd.c >= cd.o;
      ctx.strokeStyle = isBull ? '#26A69A' : '#EF5350'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx, py(cd.h)); ctx.lineTo(cx, py(cd.l)); ctx.stroke();
      const oY = py(cd.o); const cY = py(cd.c); const top2 = Math.min(oY, cY); const bodyH = Math.max(2, Math.abs(oY - cY));
      ctx.fillStyle = isBull ? '#26A69A' : '#EF5350'; ctx.fillRect(cx - bodyW / 2, top2, bodyW, bodyH);
      const volH = (vol / maxVol) * (volAreaBot - volAreaTop); ctx.fillStyle = isBull ? 'rgba(38,166,154,0.45)' : 'rgba(239,83,80,0.45)';
      ctx.fillRect(cx - bodyW / 2, volAreaBot - volH, bodyW, volH);
      if (showResult && vol > maxVol * 0.6) { ctx.strokeStyle = 'rgba(245,158,11,0.4)'; ctx.lineWidth = 1; ctx.setLineDash([2, 2]); ctx.beginPath(); ctx.arc(cx, volAreaBot - volH - 6, 4, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); }
    }
    if (showResult) { const ac: Record<string, string> = { accumulation: '#26A69A', distribution: '#EF5350', indecision: '#FFB300', climax: '#a855f7' }; ctx.fillStyle = ac[sequence.answer] || '#fff'; ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center'; ctx.fillText(sequence.answer.toUpperCase(), w / 2, volAreaBot + 12); }
  }, [sequence, showResult]);
  return <div className="w-full rounded-2xl overflow-hidden bg-black/30 border border-white/5"><canvas ref={canvasRef} style={{ width: '100%', height: 230 }} /></div>;
}

// ============================================================
// QUIZ & GAME DATA
// ============================================================
const quizQuestions = [
  { q: 'A candle has a large bullish body with high volume after a downtrend. What character is this?', opts: ['Indecision — wait for confirmation', 'Conviction — potential trend reversal', 'Distribution — smart money selling', 'Climax — price about to reverse'], correct: 1, explain: 'A large bullish body with high volume after a downtrend is conviction — aggressive buying entering the market. This is the start of a potential reversal, not the end of it.' },
  { q: 'Volume spikes on bearish candles while bullish candles show declining volume. This is:', opts: ['Accumulation — buying pressure building', 'Indecision — market is ranging', 'Distribution — selling pressure building', 'Climax — exhaustion signal'], correct: 2, explain: 'When bearish candles carry increasing volume while bullish candles dry up, smart money is selling into any rallies. This is distribution — the setup for markdown.' },
  { q: 'You see 6 candles with tiny bodies, overlapping wicks, and declining volume. What should you do?', opts: ['Enter long — consolidation before a move', 'Enter short — weakness is bearish', 'Wait — no character means no trade', 'Scale in gradually on each candle'], correct: 2, explain: 'Tiny bodies, overlapping wicks, declining volume = indecision. There is zero directional information. Trading this is gambling. Wait for a breakout with volume confirmation.' },
  { q: 'A parabolic rally ends with the largest candle having an upper wick equal to the body and record volume. This is a:', opts: ['Continuation signal — momentum is strong', 'Buying climax — exhaustion at the top', 'Accumulation — smart money entering', 'Healthy pullback — buy the dip'], correct: 1, explain: 'A massive upper wick on record volume after a parabolic move is textbook buying climax. Sellers overwhelmed buyers at the extreme. Smart money is exiting.' },
  { q: 'In accumulation, which candles should show higher volume?', opts: ['Bearish candles (sells are being absorbed)', 'All candles equally', 'Bullish candles (buying pressure building)', 'The first and last candles only'], correct: 2, explain: 'During accumulation, bullish candles show rising volume because buyers are stepping in more aggressively. Bearish candles show declining volume because selling pressure is drying up.' },
  { q: 'Price makes higher highs but volume on each rally declines. This suggests:', opts: ['Strong trend — less resistance at each level', 'Exhaustion — the trend is losing conviction', 'Accumulation — smart money is quiet', 'Indecision — wait for a breakout'], correct: 1, explain: 'Higher highs with declining volume is a volume divergence — the trend is running out of fuel. Each new high has less institutional support. Exhaustion is building.' },
  { q: 'A selling climax is characterised by:', opts: ['Slow, steady decline with low volume', 'Parabolic drop, extreme volume, then a bullish rejection candle', 'Small bearish candles with rising volume', 'Equal bullish and bearish candles'], correct: 1, explain: 'A selling climax features panic selling (parabolic drop), capitulation volume (extreme spike), and then absorption (bullish rejection candle). Smart money buys the panic.' },
  { q: 'The most important rule when Reading the Tape is:', opts: ['Volume tells you WHO is acting, price tells you WHAT happened', 'Always trade in the direction of the largest candle', 'Ignore wicks — only bodies matter', 'High volume always means continuation'], correct: 0, explain: 'Volume reveals WHO is active (institutions or retail) and HOW aggressively. Price shows WHAT they decided. Together, they tell the complete story that neither tells alone.' },
];

const gameRounds = [
  { scenario: '<strong>XAUUSD 15M</strong> — 5 small-bodied candles in a range, each with declining volume. Your friend says &quot;it&apos;s coiling for a breakout, enter now.&quot; Your call?', options: [
    { text: 'Enter long — compressed ranges precede big moves', correct: false, explain: 'Correct observation about compression, but the TIMING is wrong. With declining volume and no breakout candle, there is no character. You would be entering on hope, not evidence.' },
    { text: 'Wait — no volume, no character, no trade. Set an alert at the range high/low.', correct: true, explain: 'Exactly right. Indecision with declining volume means the market has not decided. An alert at the boundaries lets you catch the breakout WITH conviction volume.' },
    { text: 'Short — declining volume is bearish', correct: false, explain: 'Declining volume in a range is not directionally bearish — it is directionless. You need a volume spike in one direction to confirm character.' },
  ]},
  { scenario: '<strong>EUR/USD 1H</strong> — After a 150-pip rally, you see 3 massive green candles followed by one candle with a huge upper wick and the highest volume of the sequence. What is this telling you?', options: [
    { text: 'Buying climax — smart money is selling into the euphoria. Do not buy here.', correct: true, explain: 'Classic buying climax. The massive upper wick on extreme volume means sellers overwhelmed buyers at the top. Institutional traders use retail FOMO as exit liquidity.' },
    { text: 'Continuation — volume confirms the trend, buy the pullback', correct: false, explain: 'This is the dangerous misread. Volume CAN confirm a trend, but combined with a reversal candle at an extreme, it is EXHAUSTION volume, not continuation volume.' },
    { text: 'Indecision — wait for the next candle to confirm', correct: false, explain: 'A candle with the largest upper wick AND highest volume IS the confirmation. The tape is screaming exhaustion.' },
  ]},
  { scenario: '<strong>NASDAQ 4H</strong> — Price dropped 400 points over 3 days at moderate volume. Suddenly one candle drops 200 points on 3&times; average volume, then immediately prints a bullish engulfing on equally high volume. Read the tape.', options: [
    { text: 'Bearish momentum — sell the bounce', correct: false, explain: 'The capitulation candle followed by immediate bullish reversal on equal volume is a selling climax with smart money absorption — the opposite of bearish momentum.' },
    { text: 'Selling climax — capitulation + absorption = potential reversal', correct: true, explain: 'Textbook selling climax. The massive volume spike on the down candle represents forced liquidations. The immediate bullish response shows institutional buying.' },
    { text: 'Indecision — two big candles in opposite directions cancel out', correct: false, explain: 'Two cancelling candles with LOW volume = indecision. Two cancelling candles with EXTREME volume = climax absorption. Volume changes everything.' },
  ]},
  { scenario: '<strong>XAUUSD 1H</strong> — 10 candles of slow, grinding decline. Volume on bearish candles is decreasing each wave. Then a single strong bullish candle appears with 2&times; average volume. What are you seeing?', options: [
    { text: 'Accumulation breakout — the slow decline was absorption, the bullish candle is markup beginning', correct: true, explain: 'Textbook. Decreasing bearish volume = selling pressure drying up. Smart money was quietly buying. The volume spike confirms the transition from accumulation to markup.' },
    { text: 'Dead cat bounce — one candle does not change the downtrend', correct: false, explain: 'Context matters. Declining bearish volume followed by a bullish volume spike is a character change — accumulation completed.' },
    { text: 'Distribution continues — sell the rally', correct: false, explain: 'Distribution shows rising volume on bearish candles. Here, bearish volume was DECLINING. The tape character shifted.' },
  ]},
  { scenario: '<strong>GBP/USD 15M</strong> — Price rallied 60 pips. Then: bearish candle (normal vol), bullish (low vol), bearish (high vol), bullish (very low vol), bearish (highest vol). 3 lower highs formed. Diagnosis?', options: [
    { text: 'Indecision — mixed candles with varying volume', correct: false, explain: 'Not indecision — there is a clear pattern. Bearish candles have rising volume while bullish candles have declining volume. Directional conviction on the sell side.' },
    { text: 'Accumulation — low volume bullish candles mean smart money is quiet', correct: false, explain: 'Low volume on bullish candles here means lack of buying interest. Combined with high volume on bearish candles and lower highs, this is distribution.' },
    { text: 'Distribution — rising bearish volume + declining bullish volume + lower highs = sell-side conviction', correct: true, explain: 'Perfect tape reading. Volume favours the bears: each sell-off more aggressive, each rally weaker. Distribution complete — markdown is next.' },
  ]},
];

// ============================================================
// CONTENT DATA
// ============================================================
const tapeCharacters = [
  { title: 'Accumulation — Smart Money Buying Quietly', desc: '<strong>What it looks like:</strong> Price bases or drifts lower. Bullish candles show rising volume. Bearish candles show declining volume. Higher lows form.<br/><br/><strong>The story:</strong> Smart money is buying every dip while retail thinks the trend is still down. When supply is exhausted &rarr; markup begins.<br/><br/><strong>Your action:</strong> Wait for the breakout candle with volume confirmation. Set alerts at the range high.' },
  { title: 'Distribution — Smart Money Selling Into Strength', desc: '<strong>What it looks like:</strong> Price tops or pushes slightly higher. Bearish candles show rising volume. Bullish candles show declining volume. Lower highs form.<br/><br/><strong>The story:</strong> Smart money uses retail buying as exit liquidity. When demand is exhausted &rarr; markdown begins.<br/><br/><strong>Your action:</strong> Stop buying. Look for the breakdown candle on volume.' },
  { title: 'Indecision — Nobody Is In Control', desc: '<strong>What it looks like:</strong> Tiny bodies. Overlapping candles. Dojis. Declining volume everywhere. No directional progress.<br/><br/><strong>The story:</strong> Both sides have withdrawn. The market is waiting for a catalyst.<br/><br/><strong>Your action:</strong> DO NOTHING. No character = no trade. Set alerts at the range boundaries and wait.' },
  { title: 'Climax — Exhaustion at an Extreme', desc: '<strong>What it looks like:</strong> Parabolic move with expanding bodies and expanding volume. Final candle shows a reversal wick on the highest volume of the sequence.<br/><br/><strong>The story:</strong> FOMO traders pile in at the end. Smart money uses this liquidity to exit. The reversal candle = the blow-off moment.<br/><br/><strong>Your action:</strong> NEVER enter in the direction of a climax. Fade it or wait for confirmation of the reversal.' },
];

const volumeAnomalies = [
  { title: 'Volume Divergence', desc: 'Price makes a new high but volume is lower than the previous high. The move has lost institutional support.', severity: 'HIGH', color: '#EF5350' },
  { title: 'Volume Dry-Up', desc: 'Volume drops to near zero after a move. The market is resting, not reversing. Wait for volume to return.', severity: 'MEDIUM', color: '#FFB300' },
  { title: 'Volume Spike on Reversal Candle', desc: 'After a trending move, one candle prints against the trend with 2-3&times; average volume. The climax signal.', severity: 'CRITICAL', color: '#EF5350' },
  { title: 'Rising Volume, No Price Progress', desc: 'Volume increases but price barely moves. Someone is absorbing all the pressure. The wall WILL break.', severity: 'HIGH', color: '#FFB300' },
  { title: 'Ghost Volume', desc: 'Large body candles on LOW volume. A fake-out — no institutional commitment behind the move. Do NOT trust it.', severity: 'CRITICAL', color: '#EF5350' },
];

const commonMistakes = [
  { title: 'Reading One Candle in Isolation', mistake: 'One large red candle does NOT mean distribution. You need a SEQUENCE — minimum 5 candles.', fix: 'Never classify based on fewer than 5 candles.' },
  { title: 'Ignoring Volume Entirely', mistake: 'Two identical candle patterns can mean opposite things depending on volume.', fix: 'Volume is not optional — it is the key that unlocks the meaning.' },
  { title: 'Seeing Patterns That Are Not There', mistake: 'After learning these characters, everything looks like accumulation or climax. Confirmation bias.', fix: 'If the character is not OBVIOUS, it is indecision. Default to no-trade.' },
  { title: 'Confusing Climax with Continuation', mistake: 'A huge candle on massive volume can look like strong momentum. But if the NEXT candle reverses — that was a climax.', fix: 'Wait for the candle AFTER the spike. Climax = reversal follows. Continuation = same direction continues.' },
];

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function ReadingTheTapePage() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setOpenSections(p => ({ ...p, [id]: !p[id] }));

  // Candle Character Quiz
  const [quizSeqIdx, setQuizSeqIdx] = useState(0);
  const [seqAnswer, setSeqAnswer] = useState<string | null>(null);
  const [seqScore, setSeqScore] = useState(0);
  const [seqHistory, setSeqHistory] = useState<boolean[]>([]);
  const [seqComplete, setSeqComplete] = useState(false);
  const handleSeqAnswer = (answer: string) => { if (seqAnswer !== null) return; setSeqAnswer(answer); const correct = answer === tapeSequences[quizSeqIdx].answer; if (correct) setSeqScore(s => s + 1); setSeqHistory(h => [...h, correct]); };
  const nextSequence = () => { if (quizSeqIdx < tapeSequences.length - 1) { setQuizSeqIdx(i => i + 1); setSeqAnswer(null); } else { setSeqComplete(true); } };

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

  const answerLabels: Record<string, { label: string; color: string }> = { accumulation: { label: 'ACCUMULATION', color: '#26A69A' }, distribution: { label: 'DISTRIBUTION', color: '#EF5350' }, indecision: { label: 'INDECISION', color: '#FFB300' }, climax: { label: 'CLIMAX', color: '#a855f7' } };

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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 7 &middot; Lesson 8</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Reading the<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Tape</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">Volume, speed, and candle character — the language the market speaks when nobody is watching. Learn to hear it.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* S00 */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">🔍 The Market&rsquo;s Native Language</p>
            <p className="text-gray-400 leading-relaxed mb-4">Think of each candle as a <strong className="text-amber-400">word</strong> and each sequence as a <strong className="text-amber-400">sentence</strong>. One word tells you almost nothing. But read five words together — with volume as the <strong className="text-white">tone of voice</strong> — and the market starts telling you a story.</p>
            <p className="text-gray-400 leading-relaxed">Most traders stare at charts without hearing anything. They see candles. Tape readers hear <strong className="text-white">conversations</strong>.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">480 trades classified into four tape characters. Traders who correctly identified the character <strong className="text-white">before</strong> entering: <strong className="text-green-400">58% WR, 1:2.0 R:R</strong>. Those who did not: <strong className="text-red-400">39% WR, 1:1.1 R:R</strong>. Same setups, different context reading.</p>
          </div>
        </motion.div>
      </section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; Volume Speaks First</p><h2 className="text-2xl font-extrabold mb-4">Price Confirms</h2><p className="text-gray-400 text-sm mb-6">The 4 tape characters — each with a unique volume signature.</p><VolumePriceAnimation /></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The 4 Characters</p><h2 className="text-2xl font-extrabold mb-4">Conviction, Absorption, Indecision, Exhaustion</h2><p className="text-gray-400 text-sm mb-6">Body size + volume + wicks = complete story.</p><TapeDecisionAnimation /></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The 4 Tape Characters</p><h2 className="text-2xl font-extrabold mb-4">Decoded</h2><div className="space-y-3">{tapeCharacters.map((item, i) => (<div key={i}><button onClick={() => toggle(`tc-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`tc-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`tc-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.desc }} /></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The Volume-Character Matrix</p><h2 className="text-2xl font-extrabold mb-4">Decode Any Sequence in 3 Steps</h2><div className="p-6 rounded-2xl glass-card space-y-3"><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">STEP 1: BODIES</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Growing = momentum. Shrinking = exhaustion. Dojis = indecision.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-green-400">STEP 2: VOLUME</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">On bullish or bearish candles? Rising or declining? Spike on reversal = climax.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-purple-400">STEP 3: WICKS</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Long wicks = rejection. No wicks = conviction. Growing wicks = exhaustion.</span></p></div></div></motion.div></section>

      {/* S05 — GROUNDBREAKING: Candle Character Quiz */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Interactive Challenge</p><h2 className="text-2xl font-extrabold mb-2">Candle Character Quiz</h2><p className="text-gray-400 text-sm mb-6">10 real candle sequences with volume bars. Classify each as <span className="text-[#26A69A] font-semibold">Accumulation</span>, <span className="text-[#EF5350] font-semibold">Distribution</span>, <span className="text-[#FFB300] font-semibold">Indecision</span>, or <span className="text-[#a855f7] font-semibold">Climax</span>.</p>
      <div className="p-6 rounded-2xl glass-card">{!seqComplete ? (<div className="space-y-4"><div className="flex items-center gap-1.5 mb-2">{tapeSequences.map((_, i) => (<div key={i} className={`w-2.5 h-2.5 rounded-full transition-all ${i < quizSeqIdx ? (seqHistory[i] ? 'bg-green-500' : 'bg-red-500') : i === quizSeqIdx ? 'bg-amber-400 scale-125' : 'bg-white/10'}`} />))}<span className="ml-2 text-xs text-gray-500">{quizSeqIdx + 1}/10</span></div><p className="text-xs text-gray-500 font-medium">{tapeSequences[quizSeqIdx].instrument}</p><CandleQuizCanvas sequence={tapeSequences[quizSeqIdx]} showResult={seqAnswer !== null} />{seqAnswer === null ? (<div className="grid grid-cols-2 gap-3">{(['accumulation', 'distribution', 'indecision', 'climax'] as const).map(ans => (<button key={ans} onClick={() => handleSeqAnswer(ans)} className="p-3 rounded-xl text-sm font-semibold transition-all bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] active:scale-95" style={{ color: answerLabels[ans].color }}>{answerLabels[ans].label}</button>))}</div>) : (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><div className={`p-4 rounded-xl ${seqAnswer === tapeSequences[quizSeqIdx].answer ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}><p className={`text-sm font-bold mb-1 ${seqAnswer === tapeSequences[quizSeqIdx].answer ? 'text-green-400' : 'text-red-400'}`}>{seqAnswer === tapeSequences[quizSeqIdx].answer ? '✓ Correct!' : `✗ Incorrect — the answer is ${answerLabels[tapeSequences[quizSeqIdx].answer].label}`}</p><p className="text-xs text-gray-400 leading-relaxed">{tapeSequences[quizSeqIdx].explanation}</p></div><button onClick={nextSequence} className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">{quizSeqIdx < tapeSequences.length - 1 ? 'Next Sequence →' : 'See Results →'}</button></motion.div>)}</div>) : (<div className="text-center"><p className="text-3xl font-extrabold mb-2">{seqScore}/10</p><p className="text-sm text-gray-400 mb-4">{seqScore >= 8 ? 'Outstanding — you can read the tape like a professional.' : seqScore >= 6 ? 'Good — focus on the volume patterns you missed.' : 'Keep studying — volume is the key.'}</p><div className="flex flex-wrap justify-center gap-2 mt-4">{seqHistory.map((correct, i) => (<div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${correct ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{i + 1}</div>))}</div><button onClick={() => { setQuizSeqIdx(0); setSeqAnswer(null); setSeqScore(0); setSeqHistory([]); setSeqComplete(false); }} className="mt-6 px-5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-sm font-semibold text-gray-300 hover:bg-white/[0.07]">Retry Quiz</button></div>)}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; The Tape Reading Routine</p><h2 className="text-2xl font-extrabold mb-4">Your 30-Second Pre-Entry Tape Check</h2><div className="p-6 rounded-2xl glass-card space-y-3">{[{ step: '1', q: 'What are the bodies doing?', d: 'Growing = momentum. Shrinking = exhaustion. Dojis = indecision.' },{ step: '2', q: 'Where is the volume?', d: 'On bullish or bearish candles? Rising or declining?' },{ step: '3', q: 'What character is this?', d: 'Accumulation / Distribution / Indecision / Climax' },{ step: '4', q: 'Does this character SUPPORT my entry?', d: 'Buying? You want accumulation or conviction — NOT distribution or climax.' },{ step: '5', q: 'Am I reading — or imagining?', d: 'If candles do not clearly show a character, the answer is WAIT.' }].map(s => (<div key={s.step} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">Step {s.step}: {s.q}</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">{s.d}</span></p></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Volume Anomalies</p><h2 className="text-2xl font-extrabold mb-4">5 Warning Signs</h2><div className="space-y-3">{volumeAnomalies.map((item, i) => (<div key={i}><button onClick={() => toggle(`va-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><div className="flex items-center gap-2"><span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: item.color + '20', color: item.color }}>{item.severity}</span><span className="text-sm font-bold text-gray-200">{item.title}</span></div><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`va-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`va-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p><h2 className="text-2xl font-extrabold mb-4">4 Errors That Corrupt Your Tape Reading</h2><div className="space-y-3">{commonMistakes.map((item, i) => (<div key={i}><button onClick={() => toggle(`cm-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`cm-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`cm-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-xs text-red-400 mb-2">&#10060; {item.mistake}</p><p className="text-xs text-green-400">&#10004; {item.fix}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Cheat Sheet</p><h2 className="text-2xl font-extrabold mb-4">Tape Reading Quick Reference</h2><div className="p-6 rounded-2xl glass-card space-y-3"><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#26A69A]">ACCUMULATION</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Rising vol on bullish candles. Declining vol on bearish. Higher lows. Smart money buying quietly.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">DISTRIBUTION</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Rising vol on bearish candles. Declining vol on bullish. Lower highs. Smart money selling into strength.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#FFB300]">INDECISION</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Tiny bodies. Overlapping candles. Declining volume everywhere. NO TRADE.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#a855f7]">CLIMAX</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Parabolic move + extreme volume + reversal candle = exhaustion. NEVER enter in the climax direction.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">THE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Volume tells you WHO. Price tells you WHAT. Wicks tell you who TRIED and FAILED.</span></p></div></div></motion.div></section>

      {/* S10 — Game */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Test Your Understanding</p><h2 className="text-2xl font-extrabold mb-2">Tape Reading Game</h2><p className="text-gray-400 text-sm mb-6">5 scenario-based rounds. Apply your tape reading skills.</p>
      <div className="p-6 rounded-2xl glass-card"><div className="flex items-center justify-between mb-4"><span className="text-xs font-bold text-amber-400">Round {gameRound + 1} of {gameRounds.length}</span><span className="text-xs font-mono text-gray-500">{gameScore}/{gameRounds.length} correct</span></div><p className="text-sm text-gray-300 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: gameRounds[gameRound].scenario }} /><div className="space-y-2">{gameRounds[gameRound].options.map((opt, oi) => { const answered = gameAnswers[gameRound] !== null; const selected = gameAnswers[gameRound] === oi; const isCorrect = opt.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return (<div key={oi}><button onClick={() => handleGameAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt.text }} /></button>{answered && selected && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]"><p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`} dangerouslySetInnerHTML={{ __html: `${isCorrect ? '✓' : '✗'} ${opt.explain}` }} /></motion.div>)}</div>); })}</div>{gameAnswers[gameRound] !== null && gameRound < gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5"><button onClick={() => setGameRound(r => r + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button></motion.div>)}{gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Excellent — you can read the tape under pressure.' : gameScore >= 3 ? 'Good — focus on climax vs distribution volume patterns.' : 'Re-read the 4 Characters and retry the Candle Character Quiz.'}</p></motion.div>)}</div></motion.div></section>

      {/* S11 — Quiz + Certificate */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Knowledge Check</p><h2 className="text-2xl font-extrabold mb-6">Final Quiz &mdash; 8 Questions</h2>
      <div className="space-y-6">{quizQuestions.map((q, qi) => (<div key={qi} className="p-5 rounded-2xl glass-card"><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p><p className="text-sm font-semibold text-white mb-4">{q.q}</p><div className="space-y-2">{q.opts.map((opt, oi) => { const answered = quizAnswers[qi] !== null; const selected = quizAnswers[qi] === oi; const isCorrect = oi === q.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return <button key={oi} onClick={() => handleQuizAnswer(qi, oi)} disabled={answered} className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`}>{opt}</button>; })}</div>{quizAnswers[qi] !== null && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg bg-white/[0.02]"><p className="text-xs text-amber-400" dangerouslySetInnerHTML={{ __html: `<span class="font-bold">&#9989;</span> ${q.explain}` }} /></motion.div>)}</div>))}</div>
      {quizDone && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center"><p className="text-3xl font-extrabold mb-2">{quizScoreVal}%</p><p className="text-sm text-gray-400">{quizScoreVal >= 66 ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate. Review and try again.'}</p></motion.div>)}
      {certUnlocked && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10"><div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}><div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(139,92,246,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} /><div className="relative z-10 text-center"><div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">📊</div><p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p><p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 7: Reading the Tape</strong><br />at ATLAS Academy by Interakktive</p><p className="bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Tape Reader &mdash;</p><p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L7.8-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p></div></div></motion.div>)}</motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-20 text-center"><Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">&larr; Back to Academy</Link></section>
    </div>
  );
}
