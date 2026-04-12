// app/academy/lesson/reading-the-tape/page.tsx
// ATLAS Academy — Lesson 7.8: Reading the Tape [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 7
// GROUNDBREAKING: Interactive Candle Character Quiz — 10 candle+volume sequences on canvas
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
// ANIMATION 1: Volume-Price Relationship
// Shows 4 candle types with matching volume bars and character labels
// ============================================================
function VolumePriceAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.005;
    const cx = w / 2;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('Volume Tells the Story — Price Confirms It', cx, 16);

    const types = [
      { label: 'ACCUMULATION', candles: [{ o: 0.6, c: 0.55, h: 0.7, l: 0.5, bull: false }, { o: 0.55, c: 0.52, h: 0.62, l: 0.48, bull: false }, { o: 0.52, c: 0.56, h: 0.6, l: 0.48, bull: true }, { o: 0.56, c: 0.54, h: 0.6, l: 0.5, bull: false }, { o: 0.54, c: 0.58, h: 0.62, l: 0.5, bull: true }], vols: [0.3, 0.25, 0.6, 0.2, 0.65], color: '#26A69A', desc: 'Rising volume on up candles' },
      { label: 'DISTRIBUTION', candles: [{ o: 0.45, c: 0.5, h: 0.55, l: 0.4, bull: true }, { o: 0.5, c: 0.52, h: 0.58, l: 0.48, bull: true }, { o: 0.52, c: 0.48, h: 0.56, l: 0.44, bull: false }, { o: 0.48, c: 0.5, h: 0.54, l: 0.44, bull: true }, { o: 0.5, c: 0.45, h: 0.54, l: 0.42, bull: false }], vols: [0.25, 0.2, 0.7, 0.2, 0.75], color: '#EF5350', desc: 'Rising volume on down candles' },
      { label: 'INDECISION', candles: [{ o: 0.5, c: 0.51, h: 0.56, l: 0.46, bull: true }, { o: 0.51, c: 0.49, h: 0.54, l: 0.46, bull: false }, { o: 0.49, c: 0.5, h: 0.54, l: 0.45, bull: true }, { o: 0.5, c: 0.49, h: 0.53, l: 0.47, bull: false }, { o: 0.49, c: 0.5, h: 0.52, l: 0.47, bull: true }], vols: [0.15, 0.12, 0.18, 0.1, 0.14], color: '#FFB300', desc: 'Low volume, small bodies, dojis' },
      { label: 'CLIMAX', candles: [{ o: 0.4, c: 0.55, h: 0.58, l: 0.38, bull: true }, { o: 0.55, c: 0.65, h: 0.68, l: 0.52, bull: true }, { o: 0.65, c: 0.75, h: 0.82, l: 0.62, bull: true }, { o: 0.75, c: 0.85, h: 0.9, l: 0.72, bull: true }, { o: 0.85, c: 0.78, h: 0.92, l: 0.75, bull: false }], vols: [0.4, 0.55, 0.7, 0.9, 0.95], color: '#a855f7', desc: 'Explosive volume + reversal candle' },
    ];

    const cycle = Math.floor((t % 16) / 4);
    const phaseT = (t % 4) / 3;
    const activeType = types[Math.min(cycle, 3)];
    const visCandleCount = Math.min(5, Math.floor(phaseT * 6));

    const colW = (w - 40) / 4;
    // Draw all 4 labels with active highlight
    types.forEach((tp, i) => {
      const lx = 20 + i * colW + colW / 2;
      ctx.fillStyle = i === Math.min(cycle, 3) ? tp.color : 'rgba(255,255,255,0.15)';
      ctx.font = i === Math.min(cycle, 3) ? 'bold 9px system-ui' : '8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(tp.label, lx, 38);
    });

    // Draw active candle sequence
    const chartL = w * 0.15;
    const chartR = w * 0.85;
    const chartW = chartR - chartL;
    const candleTop = 60;
    const candleBot = h * 0.58;
    const volTop = h * 0.65;
    const volBot = h - 20;
    const cw = chartW / 7;

    for (let i = 0; i < visCandleCount; i++) {
      const cd = activeType.candles[i];
      const vol = activeType.vols[i];
      const cx2 = chartL + (i + 1) * cw;
      const bw = cw * 0.55;
      const range = candleBot - candleTop;

      const oY = candleTop + (1 - cd.o) * range;
      const cY = candleTop + (1 - cd.c) * range;
      const hY = candleTop + (1 - cd.h) * range;
      const lY = candleTop + (1 - cd.l) * range;
      const bodyTop = Math.min(oY, cY);
      const bodyH = Math.max(1, Math.abs(oY - cY));

      // Wick
      ctx.strokeStyle = cd.bull ? '#26A69A' : '#EF5350';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx2, hY); ctx.lineTo(cx2, lY); ctx.stroke();

      // Body
      ctx.fillStyle = cd.bull ? '#26A69A' : '#EF5350';
      ctx.fillRect(cx2 - bw / 2, bodyTop, bw, bodyH);

      // Volume bar
      const volH = vol * (volBot - volTop);
      ctx.fillStyle = cd.bull ? 'rgba(38,166,154,0.5)' : 'rgba(239,83,80,0.5)';
      ctx.fillRect(cx2 - bw / 2, volBot - volH, bw, volH);
    }

    // Description
    ctx.fillStyle = activeType.color;
    ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center';
    ctx.fillText(activeType.desc, cx, h - 5);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 2: Tape Reading Decision Matrix
// Shows conviction, absorption, indecision, exhaustion patterns
// ============================================================
function TapeDecisionAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.004;
    const cx = w / 2;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('The 4 Characters of Market Tape', cx, 16);

    const characters = [
      { name: 'CONVICTION', emoji: '💪', body: 'Large', volume: 'High', wick: 'Small', action: 'ENTER in direction', color: '#26A69A' },
      { name: 'ABSORPTION', emoji: '🧽', body: 'Small', volume: 'High', wick: 'Large', action: 'REVERSAL coming', color: '#FFB300' },
      { name: 'INDECISION', emoji: '🤷', body: 'Tiny', volume: 'Low', wick: 'Equal', action: 'WAIT — no info', color: '#6b7280' },
      { name: 'EXHAUSTION', emoji: '💨', body: 'Large→Small', volume: 'Spike→Drop', wick: 'Growing', action: 'FADE the move', color: '#a855f7' },
    ];

    const cardW = (w - 50) / 4;
    const cardH = h - 50;
    const pulse = Math.sin(t * 2) * 0.3 + 0.7;
    const activeIdx = Math.floor((t % 8) / 2);

    characters.forEach((ch, i) => {
      const x = 15 + i * (cardW + 6);
      const y = 35;
      const isActive = i === Math.min(activeIdx, 3);
      const alpha = isActive ? 0.15 : 0.03;

      // Card background
      ctx.fillStyle = isActive ? ch.color + '25' : `rgba(255,255,255,${alpha})`;
      ctx.beginPath();
      ctx.roundRect(x, y, cardW, cardH, 8);
      ctx.fill();

      // Border
      ctx.strokeStyle = isActive ? ch.color + '60' : 'rgba(255,255,255,0.05)';
      ctx.lineWidth = isActive ? 1.5 : 0.5;
      ctx.beginPath(); ctx.roundRect(x, y, cardW, cardH, 8); ctx.stroke();

      const textX = x + cardW / 2;
      ctx.textAlign = 'center';

      // Name
      ctx.fillStyle = isActive ? ch.color : 'rgba(255,255,255,0.3)';
      ctx.font = `bold ${isActive ? 9 : 7}px system-ui`;
      ctx.fillText(ch.name, textX, y + 20);

      // Emoji
      ctx.font = `${isActive ? 22 : 16}px system-ui`;
      ctx.fillText(ch.emoji, textX, y + 50);

      if (isActive) {
        // Details
        ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '8px system-ui';
        ctx.fillText(`Body: ${ch.body}`, textX, y + 75);
        ctx.fillText(`Volume: ${ch.volume}`, textX, y + 90);
        ctx.fillText(`Wicks: ${ch.wick}`, textX, y + 105);

        // Action
        ctx.fillStyle = ch.color;
        ctx.font = 'bold 8px system-ui';
        const actionLines = ch.action.split(' — ');
        actionLines.forEach((line, li) => {
          ctx.fillText(line, textX, y + 125 + li * 13);
        });
      }
    });
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// GROUNDBREAKING: Candle Character Quiz
// 10 sequences drawn on canvas, student classifies each
// ============================================================
interface CandleData { o: number; c: number; h: number; l: number; }
interface TapeSequence {
  name: string;
  instrument: string;
  candles: CandleData[];
  volumes: number[];
  answer: 'accumulation' | 'distribution' | 'indecision' | 'climax';
  explanation: string;
}

const tapeSequences: TapeSequence[] = [
  { name: 'Sequence 1', instrument: 'XAUUSD — 15M', candles: [{ o: 50, c: 45, h: 52, l: 43 }, { o: 45, c: 42, h: 47, l: 40 }, { o: 42, c: 46, h: 48, l: 40 }, { o: 46, c: 44, h: 48, l: 42 }, { o: 44, c: 49, h: 51, l: 43 }, { o: 49, c: 47, h: 51, l: 45 }, { o: 47, c: 52, h: 54, l: 46 }], volumes: [30, 25, 55, 20, 65, 18, 70], answer: 'accumulation', explanation: 'Price is making higher lows while volume spikes on bullish candles and dries up on bearish ones. Smart money is absorbing sells — accumulating before a markup phase.' },
  { name: 'Sequence 2', instrument: 'EUR/USD — 1H', candles: [{ o: 50, c: 56, h: 58, l: 49 }, { o: 56, c: 60, h: 62, l: 55 }, { o: 60, c: 58, h: 64, l: 56 }, { o: 58, c: 62, h: 63, l: 57 }, { o: 62, c: 57, h: 64, l: 55 }, { o: 57, c: 60, h: 61, l: 55 }, { o: 60, c: 54, h: 62, l: 52 }], volumes: [25, 20, 60, 18, 70, 22, 75], answer: 'distribution', explanation: 'Price is making lower highs while bearish candles show increasing volume. Smart money is selling into buying pressure — distributing before a markdown phase.' },
  { name: 'Sequence 3', instrument: 'NASDAQ — 5M', candles: [{ o: 50, c: 51, h: 53, l: 48 }, { o: 51, c: 49, h: 52, l: 48 }, { o: 49, c: 50, h: 52, l: 47 }, { o: 50, c: 50, h: 53, l: 48 }, { o: 50, c: 51, h: 52, l: 49 }, { o: 51, c: 49, h: 52, l: 48 }, { o: 49, c: 50, h: 51, l: 48 }], volumes: [12, 10, 8, 7, 9, 8, 6], answer: 'indecision', explanation: 'Tiny bodies, overlapping candles, declining volume. Nobody is in control. The market is waiting for a catalyst. This is a NO-TRADE zone — wait for a breakout with volume.' },
  { name: 'Sequence 4', instrument: 'XAUUSD — 4H', candles: [{ o: 30, c: 42, h: 44, l: 28 }, { o: 42, c: 55, h: 58, l: 40 }, { o: 55, c: 68, h: 72, l: 52 }, { o: 68, c: 80, h: 85, l: 65 }, { o: 80, c: 88, h: 95, l: 78 }, { o: 88, c: 84, h: 96, l: 80 }, { o: 84, c: 76, h: 88, l: 72 }], volumes: [40, 55, 70, 85, 95, 90, 80], answer: 'climax', explanation: 'Parabolic move with expanding volume and expanding bodies, followed by a rejection candle on the highest volume. This is a buying climax — exhaustion at the top. The reversal candle confirms smart money is exiting.' },
  { name: 'Sequence 5', instrument: 'GBP/USD — 15M', candles: [{ o: 60, c: 55, h: 62, l: 53 }, { o: 55, c: 52, h: 57, l: 50 }, { o: 52, c: 54, h: 56, l: 50 }, { o: 54, c: 51, h: 56, l: 49 }, { o: 51, c: 55, h: 57, l: 49 }, { o: 55, c: 53, h: 57, l: 51 }, { o: 53, c: 58, h: 60, l: 52 }], volumes: [35, 30, 60, 22, 65, 20, 72], answer: 'accumulation', explanation: 'After an initial drop, bullish candles show progressively higher volume while bearish candles see declining volume. The final candle breaks above resistance on the highest volume — a classic accumulation breakout.' },
  { name: 'Sequence 6', instrument: 'NASDAQ — 1H', candles: [{ o: 50, c: 44, h: 52, l: 42 }, { o: 44, c: 38, h: 46, l: 36 }, { o: 38, c: 32, h: 40, l: 30 }, { o: 32, c: 25, h: 35, l: 22 }, { o: 25, c: 20, h: 28, l: 18 }, { o: 20, c: 15, h: 24, l: 12 }, { o: 15, c: 22, h: 26, l: 12 }], volumes: [45, 55, 65, 75, 88, 95, 92], answer: 'climax', explanation: 'Waterfall decline with expanding bearish bodies and volume spiking to extremes. The final candle is a bullish rejection off the low on near-record volume — a selling climax. Panic sellers are being absorbed by smart money.' },
  { name: 'Sequence 7', instrument: 'EUR/USD — 4H', candles: [{ o: 40, c: 45, h: 47, l: 38 }, { o: 45, c: 50, h: 52, l: 44 }, { o: 50, c: 47, h: 54, l: 46 }, { o: 47, c: 52, h: 53, l: 46 }, { o: 52, c: 48, h: 55, l: 46 }, { o: 48, c: 51, h: 52, l: 46 }, { o: 51, c: 46, h: 53, l: 44 }], volumes: [22, 18, 65, 15, 72, 20, 78], answer: 'distribution', explanation: 'Price makes higher highs but volume only spikes on the bearish candles. Each rally has weaker volume while each sell-off gets stronger. Smart money is using the rallies to sell — classic distribution before a breakdown.' },
  { name: 'Sequence 8', instrument: 'XAUUSD — 1H', candles: [{ o: 50, c: 51, h: 54, l: 49 }, { o: 51, c: 50, h: 53, l: 48 }, { o: 50, c: 50, h: 52, l: 49 }, { o: 50, c: 51, h: 53, l: 49 }, { o: 51, c: 50, h: 52, l: 48 }, { o: 50, c: 51, h: 53, l: 48 }], volumes: [15, 18, 12, 14, 10, 8], answer: 'indecision', explanation: 'Price barely moves. Bodies are tiny. Wicks overlap completely. Volume is declining steadily — the market is asleep. No character, no conviction, no trade. Wait for a catalyst to wake this up.' },
  { name: 'Sequence 9', instrument: 'GBP/USD — 4H', candles: [{ o: 55, c: 60, h: 62, l: 54 }, { o: 60, c: 65, h: 67, l: 58 }, { o: 65, c: 62, h: 68, l: 60 }, { o: 62, c: 58, h: 64, l: 56 }, { o: 58, c: 55, h: 60, l: 53 }, { o: 55, c: 50, h: 57, l: 48 }, { o: 50, c: 46, h: 52, l: 44 }], volumes: [30, 35, 55, 62, 70, 75, 80], answer: 'distribution', explanation: 'After an initial rally, each subsequent candle is bearish with rising volume. The bullish candle that tried to recover (candle 2) was immediately rejected. Volume is confirming the sell-side — distribution into the rally has completed and markdown has begun.' },
  { name: 'Sequence 10', instrument: 'NASDAQ — 15M', candles: [{ o: 50, c: 55, h: 56, l: 48 }, { o: 55, c: 60, h: 62, l: 54 }, { o: 60, c: 66, h: 68, l: 58 }, { o: 66, c: 74, h: 78, l: 64 }, { o: 74, c: 82, h: 86, l: 72 }, { o: 82, c: 90, h: 95, l: 80 }, { o: 90, c: 82, h: 98, l: 78 }], volumes: [35, 45, 55, 70, 82, 95, 98], answer: 'climax', explanation: 'Textbook buying climax: accelerating price with expanding bodies and expanding volume. The final candle shows a massive upper wick on the highest volume — the blow-off top. Smart money sold into the frenzy. Expect a reversal.' },
];

function CandleQuizCanvas({ sequence, showResult }: { sequence: TapeSequence; showResult: boolean }) {
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

    const candles = sequence.candles;
    const vols = sequence.volumes;
    const candleCount = candles.length;
    const pad = 15;
    const candleAreaTop = 10;
    const candleAreaBot = h * 0.58;
    const volAreaTop = h * 0.65;
    const volAreaBot = h - 8;
    const chartW = w - pad * 2;
    const slotW = chartW / (candleCount + 1);
    const bodyW = slotW * 0.55;

    // Find price range
    let minP = Infinity; let maxP = -Infinity;
    candles.forEach(cd => { if (cd.l < minP) minP = cd.l; if (cd.h > maxP) maxP = cd.h; });
    const priceRange = maxP - minP || 1;
    const py = (p: number) => candleAreaTop + (1 - (p - minP) / priceRange) * (candleAreaBot - candleAreaTop);

    // Find volume range
    const maxVol = Math.max(...vols);

    // Volume label
    ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.font = '7px system-ui'; ctx.textAlign = 'left';
    ctx.fillText('VOLUME', pad, volAreaTop - 2);

    // Draw separator
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(pad, h * 0.62); ctx.lineTo(w - pad, h * 0.62); ctx.stroke();

    // Instrument label
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = 'bold 9px system-ui'; ctx.textAlign = 'right';
    ctx.fillText(sequence.instrument, w - pad, candleAreaTop + 10);

    for (let i = 0; i < candleCount; i++) {
      const cd = candles[i];
      const vol = vols[i];
      const cx = pad + (i + 1) * slotW;
      const isBull = cd.c >= cd.o;

      // Candle wick
      ctx.strokeStyle = isBull ? '#26A69A' : '#EF5350';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx, py(cd.h)); ctx.lineTo(cx, py(cd.l)); ctx.stroke();

      // Candle body
      const oY = py(cd.o);
      const cY = py(cd.c);
      const top = Math.min(oY, cY);
      const bodyH = Math.max(2, Math.abs(oY - cY));
      ctx.fillStyle = isBull ? '#26A69A' : '#EF5350';
      ctx.fillRect(cx - bodyW / 2, top, bodyW, bodyH);

      // Volume bar
      const volH = (vol / maxVol) * (volAreaBot - volAreaTop);
      ctx.fillStyle = isBull ? 'rgba(38,166,154,0.45)' : 'rgba(239,83,80,0.45)';
      ctx.fillRect(cx - bodyW / 2, volAreaBot - volH, bodyW, volH);

      // Show result markers
      if (showResult) {
        // Highlight high-volume candles
        if (vol > maxVol * 0.6) {
          ctx.strokeStyle = 'rgba(245,158,11,0.4)'; ctx.lineWidth = 1;
          ctx.setLineDash([2, 2]);
          ctx.beginPath(); ctx.arc(cx, volAreaBot - volH - 6, 4, 0, Math.PI * 2); ctx.stroke();
          ctx.setLineDash([]);
        }
      }
    }

    // Answer label if showing result
    if (showResult) {
      const answerColors: Record<string, string> = { accumulation: '#26A69A', distribution: '#EF5350', indecision: '#FFB300', climax: '#a855f7' };
      ctx.fillStyle = answerColors[sequence.answer] || '#fff';
      ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center';
      ctx.fillText(sequence.answer.toUpperCase(), w / 2, volAreaBot + 12);
    }
  }, [sequence, showResult]);

  return <div className="w-full rounded-2xl overflow-hidden bg-black/30 border border-white/5"><canvas ref={canvasRef} style={{ width: '100%', height: 230 }} /></div>;
}

// ============================================================
// QUIZ & GAME DATA
// ============================================================
const quizQuestions = [
  { q: 'A candle has a large bullish body with high volume after a downtrend. What character is this?', opts: ['Indecision — wait for confirmation', 'Conviction — potential trend reversal', 'Distribution — smart money selling', 'Climax — price about to reverse'], correct: 1 },
  { q: 'Volume spikes on bearish candles while bullish candles show declining volume. This is:', opts: ['Accumulation — buying pressure building', 'Indecision — market is ranging', 'Distribution — selling pressure building', 'Climax — exhaustion signal'], correct: 2 },
  { q: 'You see 6 candles with tiny bodies, overlapping wicks, and declining volume. What should you do?', opts: ['Enter long — consolidation before a move', 'Enter short — weakness is bearish', 'Wait — no character means no trade', 'Scale in gradually on each candle'], correct: 2 },
  { q: 'A parabolic rally ends with the largest candle having an upper wick equal to the body and record volume. This is a:', opts: ['Continuation signal — momentum is strong', 'Buying climax — exhaustion at the top', 'Accumulation — smart money entering', 'Healthy pullback — buy the dip'], correct: 1 },
  { q: 'In accumulation, which candles should show higher volume?', opts: ['Bearish candles (sells are being absorbed)', 'All candles equally', 'Bullish candles (buying pressure building)', 'The first and last candles only'], correct: 2 },
  { q: 'Price makes higher highs but volume on each rally declines. This suggests:', opts: ['Strong trend — less resistance at each level', 'Exhaustion — the trend is losing conviction', 'Accumulation — smart money is quiet', 'Indecision — wait for a breakout'], correct: 1 },
  { q: 'A selling climax is characterised by:', opts: ['Slow, steady decline with low volume', 'Parabolic drop, extreme volume, then a bullish rejection candle', 'Small bearish candles with rising volume', 'Equal bullish and bearish candles'], correct: 1 },
  { q: 'The most important rule when Reading the Tape is:', opts: ['Volume tells you WHO is acting, price tells you WHAT happened', 'Always trade in the direction of the largest candle', 'Ignore wicks — only bodies matter', 'High volume always means continuation'], correct: 0 },
];

const gameRounds = [
  { scenario: '<strong>XAUUSD 15M</strong> — 5 small-bodied candles in a range, each with declining volume. Your friend says "it\'s coiling for a breakout, enter now." Your call?', options: [{ text: 'Enter long — compressed ranges precede big moves', correct: false, explain: 'Correct observation about compression, but the TIMING is wrong. With declining volume and no breakout candle, there\'s no character. You\'d be entering on hope, not evidence.' }, { text: 'Wait — no volume, no character, no trade. Set an alert at the range high/low.', correct: true, explain: 'Exactly right. Indecision with declining volume means the market hasn\'t decided. An alert at the boundaries lets you catch the breakout WITH conviction volume.' }, { text: 'Short — declining volume is bearish', correct: false, explain: 'Declining volume in a range is not directionally bearish — it\'s directionless. You need a volume spike in one direction to confirm character.' }] },
  { scenario: '<strong>EUR/USD 1H</strong> — After a 150-pip rally, you see 3 massive green candles followed by one candle with a huge upper wick and the highest volume of the sequence. What is this telling you?', options: [{ text: 'Buying climax — smart money is selling into the euphoria. Do not buy here.', correct: true, explain: 'Classic buying climax. The massive upper wick on extreme volume means sellers overwhelmed buyers at the top. The move has exhausted itself. Institutional traders use retail FOMO as exit liquidity.' }, { text: 'Continuation — volume confirms the trend, buy the pullback', correct: false, explain: 'This is the dangerous misread. Volume CAN confirm a trend, but when combined with a reversal candle (huge upper wick) at an extreme, it\'s EXHAUSTION volume, not continuation volume.' }, { text: 'Indecision — wait for the next candle to confirm', correct: false, explain: 'This is overly cautious. A candle with the largest upper wick AND highest volume in the sequence IS the confirmation. The tape is screaming exhaustion.' }] },
  { scenario: '<strong>NASDAQ 4H</strong> — Price has dropped 400 points over 3 days. Volume was moderate. Suddenly, one candle drops 200 points on 3× average volume, then immediately prints a bullish engulfing candle on equally high volume. Read the tape.', options: [{ text: 'Bearish momentum — sell the bounce', correct: false, explain: 'The capitulation candle (3× volume) followed by an immediate bullish reversal on equal volume is the opposite of bearish momentum — it\'s a selling climax with smart money absorption.' }, { text: 'Selling climax — capitulation + absorption = potential reversal', correct: true, explain: 'This is a textbook selling climax. The massive spike in volume on the down candle represents forced liquidations and panic. The immediate bullish response on high volume shows institutional buying. Smart money just absorbed the panic sellers\' inventory.' }, { text: 'Indecision — two big candles in opposite directions cancel out', correct: false, explain: 'Two cancelling candles with LOW volume = indecision. Two cancelling candles with EXTREME volume = climax absorption. Volume changes everything.' }] },
  { scenario: '<strong>XAUUSD 1H</strong> — 10 candles of slow, grinding price decline. Volume on bearish candles is decreasing with each wave. Then a single strong bullish candle appears with 2× the average volume of the last 10 candles. What are you seeing?', options: [{ text: 'Accumulation breakout — the slow decline was absorption, the bullish candle is the markup beginning', correct: true, explain: 'Textbook. Decreasing bearish volume = selling pressure drying up. Smart money was quietly buying the entire decline. The volume spike on the bullish breakout confirms the transition from accumulation to markup.' }, { text: 'Dead cat bounce — one candle doesn\'t change the downtrend', correct: false, explain: 'Context matters. If the decline was on INCREASING volume, one bullish candle would be suspect. But declining bearish volume followed by a bullish volume spike is a character change — accumulation completed.' }, { text: 'Distribution continues — sell the rally', correct: false, explain: 'Distribution shows rising volume on bearish candles. Here, bearish volume was DECLINING (opposite). The tape character shifted from distribution to accumulation.' }] },
  { scenario: '<strong>GBP/USD 15M</strong> — Price rallied 60 pips. Then you see: bearish candle (normal vol), bullish candle (low vol), bearish candle (high vol), bullish candle (very low vol), bearish candle (highest vol in sequence). Price has made 3 lower highs. Your diagnosis?', options: [{ text: 'Indecision — mixed candles with varying volume', correct: false, explain: 'This is not indecision — there\'s a clear pattern. Bearish candles have rising volume while bullish candles have declining volume. That\'s directional conviction on the sell side.' }, { text: 'Accumulation — low volume bullish candles mean smart money is being quiet', correct: false, explain: 'Low volume on bullish candles here means lack of buying interest, not quiet accumulation. Combined with high volume on bearish candles and lower highs, this is the opposite — distribution.' }, { text: 'Distribution — rising bearish volume + declining bullish volume + lower highs = sell-side conviction', correct: true, explain: 'Perfect tape reading. The volume pattern clearly favours the bears: each sell-off gets more aggressive while each rally gets weaker. Combined with the lower high structure, distribution is complete — markdown is next.' }] },
];

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function ReadingTheTapePage() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState(0);
  const totalSections = 12;
  const toggle = (id: string) => { setOpenSections(p => { const n = { ...p, [id]: !p[id] }; const c = Object.values(n).filter(Boolean).length; setProgress(Math.round((c / totalSections) * 100)); return n; }); };

  // Candle Character Quiz state
  const [quizSeqIdx, setQuizSeqIdx] = useState(0);
  const [seqAnswer, setSeqAnswer] = useState<string | null>(null);
  const [seqScore, setSeqScore] = useState(0);
  const [seqHistory, setSeqHistory] = useState<boolean[]>([]);
  const [seqComplete, setSeqComplete] = useState(false);

  const handleSeqAnswer = (answer: string) => {
    if (seqAnswer !== null) return;
    setSeqAnswer(answer);
    const correct = answer === tapeSequences[quizSeqIdx].answer;
    if (correct) setSeqScore(s => s + 1);
    setSeqHistory(h => [...h, correct]);
  };
  const nextSequence = () => {
    if (quizSeqIdx < tapeSequences.length - 1) {
      setQuizSeqIdx(i => i + 1);
      setSeqAnswer(null);
    } else {
      setSeqComplete(true);
    }
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

  const answerLabels: Record<string, { label: string; color: string }> = {
    accumulation: { label: 'ACCUMULATION', color: '#26A69A' },
    distribution: { label: 'DISTRIBUTION', color: '#EF5350' },
    indecision: { label: 'INDECISION', color: '#FFB300' },
    climax: { label: 'CLIMAX', color: '#a855f7' },
  };

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      {/* Hero */}
      <section className="max-w-2xl mx-auto px-5 pt-12 pb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link href="/academy" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 mb-6 transition-colors">&larr; Back to Academy</Link>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4"><Crown className="w-3.5 h-3.5 text-amber-400" /><span className="text-[11px] font-bold tracking-wider text-amber-400">PRO &middot; LEVEL 7</span></div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 leading-tight">Reading the Tape</h1>
          <p className="text-gray-400 text-sm leading-relaxed max-w-lg">Volume, speed, and candle character — the language the market speaks when nobody is watching. Learn to hear it.</p>
          <div className="mt-4 h-1.5 rounded-full bg-white/5 overflow-hidden"><motion.div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-accent-500" animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} /></div>
          <p className="text-right text-[10px] text-gray-600 mt-1">{progress}% complete</p>
        </motion.div>
      </section>

      {/* S00 — Why This Matters */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-start gap-3 mb-4"><span className="text-xl">🔍</span><h2 className="text-xl font-extrabold">First — Why This Matters</h2></div>
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
            <p className="text-sm text-gray-300 leading-relaxed mb-4">Think of each candle as a <strong className="text-white">word</strong> and each sequence as a <strong className="text-white">sentence</strong>. One word tells you almost nothing. But read five words together — with volume as the <strong className="text-white">tone of voice</strong> — and the market starts telling you a story. Loud aggressive selling? That&rsquo;s a shout. Quiet small candles? A whisper. Explosive volume followed by a reversal? The market just said the opposite of what everyone expected.</p>
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
              <p className="text-xs font-bold text-amber-400 tracking-widest uppercase mb-2">Real Scenario</p>
              <p className="text-sm text-gray-300 leading-relaxed">480 trades were classified into four tape characters: accumulation, distribution, indecision, and climax. Traders who correctly identified the character <strong className="text-white">before</strong> entering had a <strong className="text-amber-400">58% win rate with 1:2.0 average R:R</strong>. Those who didn&rsquo;t read the tape: <strong className="text-red-400">39% win rate, 1:1.1 R:R</strong>. Reading the tape turned net-negative traders into net-positive ones — same setups, different context reading.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S01 — Animation 1: Volume-Price Relationship */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-extrabold mb-4">Volume Speaks First, Price Confirms</h2>
          <VolumePriceAnimation />
          <p className="text-xs text-gray-500 mt-2 text-center">The 4 tape characters — accumulation, distribution, indecision, climax — each with a unique volume signature.</p>
        </motion.div>
      </section>

      {/* S02 — Animation 2: Tape Decision Matrix */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-extrabold mb-4">The 4 Characters of Market Tape</h2>
          <TapeDecisionAnimation />
          <p className="text-xs text-gray-500 mt-2 text-center">Each character tells you WHO is in control and WHAT they&rsquo;re doing — body size + volume + wicks = complete story.</p>
        </motion.div>
      </section>

      {/* S03 — 4 Tape Characters Deep Dive */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-extrabold mb-4">The 4 Tape Characters — Decoded</h2>
          <div className="space-y-3">
            {[
              { id: 's03a', num: '01', title: 'Accumulation — Smart Money Buying Quietly', content: '<strong>What it looks like:</strong> Price bases or drifts lower. Bullish candles show rising volume. Bearish candles show declining volume. Higher lows form.<br/><br/><strong>The story:</strong> Smart money is buying every dip while retail thinks the trend is still down. Each sell-off gets weaker because there are fewer sellers left. When supply is exhausted → markup begins.<br/><br/><strong>Your action:</strong> Wait for the breakout candle with volume confirmation. Do NOT try to front-run accumulation — you can\'t know when it ends. Set alerts at the range high.' },
              { id: 's03b', num: '02', title: 'Distribution — Smart Money Selling Into Strength', content: '<strong>What it looks like:</strong> Price tops or pushes slightly higher. Bearish candles show rising volume. Bullish candles show declining volume. Lower highs form.<br/><br/><strong>The story:</strong> Smart money uses retail buying as exit liquidity. Each rally gets weaker because institutional selling overwhelms it. When demand is exhausted → markdown begins.<br/><br/><strong>Your action:</strong> Stop buying. Look for the breakdown candle on volume. Distribution is complete when the range low breaks with conviction.' },
              { id: 's03c', num: '03', title: 'Indecision — Nobody Is In Control', content: '<strong>What it looks like:</strong> Tiny bodies. Overlapping candles. Dojis. Declining volume across the entire sequence. No directional progress.<br/><br/><strong>The story:</strong> Both sides have withdrawn. The market is waiting for a catalyst — news event, session open, key level test. There is zero information in these candles.<br/><br/><strong>Your action:</strong> DO NOTHING. No character = no trade. Set alerts at the range boundaries and wait. Trading indecision is gambling.' },
              { id: 's03d', num: '04', title: 'Climax — Exhaustion at an Extreme', content: '<strong>What it looks like:</strong> Parabolic move (up or down) with expanding bodies and expanding volume. Final candle shows a reversal wick on the highest volume of the sequence.<br/><br/><strong>The story:</strong> FOMO traders pile in at the end. Smart money uses this liquidity to exit. The reversal candle on extreme volume = the blow-off moment. It can be a buying climax (top) or selling climax (bottom).<br/><br/><strong>Your action:</strong> NEVER enter in the direction of a climax. Fade it — or wait for confirmation of the reversal. The climax candle IS the signal.' },
            ].map(item => (
              <div key={item.id} className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
                <button onClick={() => toggle(item.id)} className="w-full flex items-center gap-3 p-4 text-left"><span className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center text-xs font-bold text-amber-400/60">{item.num}</span><span className="flex-1 text-sm font-semibold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[item.id] ? 'rotate-180' : ''}`} /></button>
                <AnimatePresence>{openSections[item.id] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="px-5 pb-5"><p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.content }} /></div></motion.div>)}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S04 — The Volume-Character Matrix */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-extrabold mb-4">The Volume-Character Matrix</h2>
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
            <button onClick={() => toggle('s04')} className="w-full flex items-center gap-3 p-4 text-left"><span className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center text-xs font-bold text-amber-400/60">03</span><span className="flex-1 text-sm font-semibold text-gray-200">How to Decode Any Candle Sequence in 3 Steps</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections['s04'] ? 'rotate-180' : ''}`} /></button>
            <AnimatePresence>{openSections['s04'] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="px-5 pb-5 space-y-4">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-2">STEP 1: Read the bodies</p>
                <p className="text-sm text-gray-400">Are they growing or shrinking? All one direction or mixed? Large bodies = conviction. Small bodies = indecision. Growing bodies in one direction = climax building.</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-2">STEP 2: Read the volume</p>
                <p className="text-sm text-gray-400">Which candles have the highest volume — bullish or bearish? Rising volume on bullish = accumulation. Rising volume on bearish = distribution. Volume spike on reversal candle = climax. Declining volume everywhere = indecision.</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-2">STEP 3: Read the wicks</p>
                <p className="text-sm text-gray-400">Long wicks = rejection (absorption). No wicks = full conviction. Growing wicks after a move = exhaustion. The wick shows you what was attempted but failed.</p>
              </div>
            </div></motion.div>)}</AnimatePresence>
          </div>
        </motion.div>
      </section>

      {/* S05 — 🎯 GROUNDBREAKING: Interactive Candle Character Quiz */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-center gap-2 mb-4"><span className="text-xl">🎯</span><h2 className="text-xl font-extrabold">Candle Character Quiz — Read the Tape</h2></div>
          <p className="text-sm text-gray-400 mb-6">10 real candle sequences with volume bars. Classify each as <span className="text-[#26A69A] font-semibold">Accumulation</span>, <span className="text-[#EF5350] font-semibold">Distribution</span>, <span className="text-[#FFB300] font-semibold">Indecision</span>, or <span className="text-[#a855f7] font-semibold">Climax</span>.</p>

          {!seqComplete ? (
            <div className="space-y-4">
              {/* Progress dots */}
              <div className="flex items-center gap-1.5 mb-2">
                {tapeSequences.map((_, i) => (
                  <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all ${i < quizSeqIdx ? (seqHistory[i] ? 'bg-green-500' : 'bg-red-500') : i === quizSeqIdx ? 'bg-amber-400 scale-125' : 'bg-white/10'}`} />
                ))}
                <span className="ml-2 text-xs text-gray-500">{quizSeqIdx + 1}/10</span>
              </div>

              <p className="text-xs text-gray-500 font-medium">{tapeSequences[quizSeqIdx].instrument}</p>

              {/* Canvas drawing */}
              <CandleQuizCanvas sequence={tapeSequences[quizSeqIdx]} showResult={seqAnswer !== null} />

              {/* Answer buttons */}
              {seqAnswer === null ? (
                <div className="grid grid-cols-2 gap-3">
                  {(['accumulation', 'distribution', 'indecision', 'climax'] as const).map(ans => (
                    <button key={ans} onClick={() => handleSeqAnswer(ans)} className="p-3 rounded-xl text-sm font-semibold transition-all bg-white/[0.03] border border-white/10 hover:border-amber-500/30 active:scale-95" style={{ color: answerLabels[ans].color }}>{answerLabels[ans].label}</button>
                  ))}
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className={`p-4 rounded-xl ${seqAnswer === tapeSequences[quizSeqIdx].answer ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                    <p className={`text-sm font-bold mb-1 ${seqAnswer === tapeSequences[quizSeqIdx].answer ? 'text-green-400' : 'text-red-400'}`}>{seqAnswer === tapeSequences[quizSeqIdx].answer ? '✓ Correct!' : `✗ Incorrect — the answer is ${answerLabels[tapeSequences[quizSeqIdx].answer].label}`}</p>
                    <p className="text-xs text-gray-400 leading-relaxed">{tapeSequences[quizSeqIdx].explanation}</p>
                  </div>
                  <button onClick={nextSequence} className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">{quizSeqIdx < tapeSequences.length - 1 ? 'Next Sequence →' : 'See Results →'}</button>
                </motion.div>
              )}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
              <p className="text-3xl font-extrabold mb-2">{seqScore}/10</p>
              <p className="text-sm text-gray-400 mb-4">{seqScore >= 8 ? 'Outstanding — you can read the tape like a professional.' : seqScore >= 6 ? 'Good — focus on the volume patterns you missed. Review accumulation vs distribution.' : seqScore >= 4 ? 'Developing — re-read the 4 Characters and pay close attention to which candles carry the volume.' : 'Keep studying — volume is the key. Go back to the Volume-Character Matrix and try again.'}</p>
              {/* Score breakdown */}
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {seqHistory.map((correct, i) => (
                  <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${correct ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{i + 1}</div>
                ))}
              </div>
              <button onClick={() => { setQuizSeqIdx(0); setSeqAnswer(null); setSeqScore(0); setSeqHistory([]); setSeqComplete(false); }} className="mt-6 px-5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-sm font-semibold text-gray-300 hover:border-amber-500/30 transition-all">Retry Quiz</button>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* S06 — Reading Order of Operations */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-extrabold mb-4">The Tape Reading Routine</h2>
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
            <button onClick={() => toggle('s06')} className="w-full flex items-center gap-3 p-4 text-left"><span className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center text-xs font-bold text-amber-400/60">04</span><span className="flex-1 text-sm font-semibold text-gray-200">Your 30-Second Pre-Entry Tape Check</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections['s06'] ? 'rotate-180' : ''}`} /></button>
            <AnimatePresence>{openSections['s06'] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="px-5 pb-5 space-y-3">
              <p className="text-sm text-gray-400 leading-relaxed">Before every entry, look at the <strong className="text-white">last 5-10 candles</strong> and ask:</p>
              <div className="space-y-2">
                {[
                  { step: '1', q: 'What are the bodies doing?', detail: 'Growing = momentum. Shrinking = exhaustion. Dojis = indecision.' },
                  { step: '2', q: 'Where is the volume?', detail: 'On the bullish or bearish candles? Rising or declining?' },
                  { step: '3', q: 'What character is this?', detail: 'Accumulation / Distribution / Indecision / Climax' },
                  { step: '4', q: 'Does this character SUPPORT my entry?', detail: 'If you\'re buying, you want accumulation or buying conviction — NOT distribution or a buying climax.' },
                  { step: '5', q: 'Am I reading — or imagining?', detail: 'If the candles don\'t clearly show a character, the answer is WAIT.' },
                ].map(s => (
                  <div key={s.step} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <p className="text-xs font-bold text-amber-400 mb-1">Step {s.step}: {s.q}</p>
                    <p className="text-xs text-gray-400">{s.detail}</p>
                  </div>
                ))}
              </div>
            </div></motion.div>)}</AnimatePresence>
          </div>
        </motion.div>
      </section>

      {/* S07 — Volume Anomalies */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-extrabold mb-4">Volume Anomalies — The Warning Signs</h2>
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
            <button onClick={() => toggle('s07')} className="w-full flex items-center gap-3 p-4 text-left"><span className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center text-xs font-bold text-amber-400/60">05</span><span className="flex-1 text-sm font-semibold text-gray-200">5 Volume Patterns That Change Everything</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections['s07'] ? 'rotate-180' : ''}`} /></button>
            <AnimatePresence>{openSections['s07'] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="px-5 pb-5 space-y-3">
              {[
                { title: 'Volume Divergence', desc: 'Price makes a new high but volume is lower than the previous high. The move has lost institutional support — distribution is likely underway.', severity: 'HIGH', color: '#EF5350' },
                { title: 'Volume Dry-Up', desc: 'Volume drops to near zero after a move. The market is resting, not reversing. Wait for volume to return before making a decision.', severity: 'MEDIUM', color: '#FFB300' },
                { title: 'Volume Spike on Reversal Candle', desc: 'After a trending move, one candle prints against the trend with 2-3× average volume. This is the climax signal — the move is exhausted.', severity: 'CRITICAL', color: '#EF5350' },
                { title: 'Rising Volume, No Price Progress', desc: 'Volume increases but price barely moves. Someone is absorbing all the pressure. The wall WILL break — the question is which direction.', severity: 'HIGH', color: '#FFB300' },
                { title: 'Ghost Volume', desc: 'Large body candles on LOW volume. This is a fake-out — there\'s no institutional commitment behind the move. Do NOT trust it.', severity: 'CRITICAL', color: '#EF5350' },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-2 mb-2"><span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: item.color + '20', color: item.color }}>{item.severity}</span><p className="text-sm font-bold text-white">{item.title}</p></div>
                  <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div></motion.div>)}</AnimatePresence>
          </div>
        </motion.div>
      </section>

      {/* S08 — Common Mistakes */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-extrabold mb-4">Common Tape Reading Mistakes</h2>
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
            <button onClick={() => toggle('s08')} className="w-full flex items-center gap-3 p-4 text-left"><span className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center text-xs font-bold text-amber-400/60">06</span><span className="flex-1 text-sm font-semibold text-gray-200">4 Errors That Corrupt Your Tape Reading</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections['s08'] ? 'rotate-180' : ''}`} /></button>
            <AnimatePresence>{openSections['s08'] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="px-5 pb-5 space-y-3">
              {[
                { title: 'Reading One Candle in Isolation', mistake: 'One large red candle does NOT mean distribution. You need a SEQUENCE — minimum 5 candles — to identify character.', fix: 'Never classify based on fewer than 5 candles.' },
                { title: 'Ignoring Volume Entirely', mistake: 'Two identical candle patterns can mean opposite things depending on volume. Without volume, you\'re reading half the story.', fix: 'Volume is not optional — it\'s the key that unlocks the meaning.' },
                { title: 'Seeing Patterns That Aren\'t There', mistake: 'After learning these characters, everything looks like accumulation or climax. Confirmation bias makes you see what you want to see.', fix: 'If the character isn\'t OBVIOUS, it\'s indecision. Default to no-trade.' },
                { title: 'Confusing Climax with Continuation', mistake: 'A huge candle on massive volume can look like strong momentum. But if the NEXT candle reverses on equal or higher volume — that was a climax, not continuation.', fix: 'Wait for the candle AFTER the spike. Climax = reversal follows. Continuation = same direction continues on same or higher volume.' },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <p className="text-sm font-bold text-white mb-2">{item.title}</p>
                  <p className="text-xs text-red-400 mb-2">❌ {item.mistake}</p>
                  <p className="text-xs text-green-400">✓ {item.fix}</p>
                </div>
              ))}
            </div></motion.div>)}</AnimatePresence>
          </div>
        </motion.div>
      </section>

      {/* S09 — Cheat Sheet */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-extrabold mb-4">Cheat Sheet</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { title: '4 Characters', content: 'Accumulation (buy quiet) · Distribution (sell into strength) · Indecision (no trade) · Climax (exhaustion reversal)', color: '#f59e0b' },
              { title: 'Volume Rule', content: 'Volume on bullish candles = buying conviction. Volume on bearish candles = selling conviction. Low volume everywhere = nobody cares.', color: '#26A69A' },
              { title: '3-Step Decode', content: '1. Bodies → 2. Volume → 3. Wicks. Character = all three together.', color: '#a855f7' },
              { title: 'Climax Signal', content: 'Parabolic move + extreme volume + reversal candle = exhaustion. NEVER enter in the climax direction.', color: '#EF5350' },
              { title: 'No Character?', content: 'If you can\'t identify a character in 5 seconds, it\'s indecision. Default = NO TRADE.', color: '#FFB300' },
              { title: 'The Golden Rule', content: 'Volume tells you WHO is acting. Price tells you WHAT they decided. Wicks tell you who TRIED and FAILED.', color: '#3b82f6' },
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
          <p className="text-gray-400 text-sm mb-6">5 scenario-based rounds. Apply your tape reading skills.</p>
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
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Excellent — you can read the tape under pressure.' : gameScore >= 3 ? 'Good — focus on the volume patterns in climax vs distribution scenarios.' : 'Re-read the 4 Characters and retry the Candle Character Quiz.'}</p></motion.div>)}
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
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">📊</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 7: Reading the Tape</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Tape Reader &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L7.8-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
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
