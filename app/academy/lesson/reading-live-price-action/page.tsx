// app/academy/lesson/reading-live-price-action/page.tsx
// ATLAS Academy — Lesson 7.3: Reading Live Price Action [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 7
// FLAGSHIP: Bar-by-bar candle replay simulator
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
// ANIMATION 1: Hindsight vs Live — Static chart vs bar-by-bar
// Left: full chart with "obvious" annotations
// Right: same chart revealed candle by candle with "?" at edge
// ============================================================
function HindsightVsLiveAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.004;
    const pad = 20;
    const top = 42;
    const bot = h - 25;
    const midX = w / 2;
    const seed = (n: number) => Math.sin(n * 127.1 + 311.7) * 0.5 + 0.5;
    const totalCandles = 30;
    const cycle = t % 7;
    const liveCandles = Math.min(totalCandles, Math.floor(cycle * 5.5));

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('HINDSIGHT (easy)', midX / 2, 14);
    ctx.fillText('LIVE (hard)', midX + midX / 2, 14);

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(midX, 22); ctx.lineTo(midX, bot + 5); ctx.stroke(); ctx.setLineDash([]);

    // Generate candle data
    const candles: { o: number; h: number; l: number; c: number }[] = [];
    let price = 2340;
    for (let i = 0; i < totalCandles; i++) {
      const move = (seed(i * 3) - 0.45) * 20;
      // Create a recognisable pattern: downtrend → sweep → reversal
      let bias = 0;
      if (i < 10) bias = -3; // downtrend
      else if (i === 10 || i === 11) bias = -8; // liquidity sweep
      else if (i === 12) bias = 12; // strong rejection
      else if (i > 12) bias = 4; // reversal up

      const o = price;
      const c = price + move + bias;
      const wick = Math.abs(c - o) * (0.3 + seed(i * 7) * 0.5);
      const hi = Math.max(o, c) + wick;
      const lo = Math.min(o, c) - wick;
      candles.push({ o, h: hi, l: lo, c });
      price = c;
    }

    const allPrices = candles.flatMap(c => [c.h, c.l]);
    const minP = Math.min(...allPrices);
    const maxP = Math.max(...allPrices);
    const range = maxP - minP || 1;
    const py = (p: number) => bot - ((p - minP) / range) * (bot - top);

    const drawCandle = (c: typeof candles[0], x: number, cw: number, alpha: number) => {
      ctx.globalAlpha = alpha;
      const bull = c.c >= c.o;
      const color = bull ? '#34d399' : '#ef4444';
      const bodyTop = py(Math.max(c.o, c.c));
      const bodyBot = py(Math.min(c.o, c.c));
      const bodyH = Math.max(1, bodyBot - bodyTop);

      // Wick
      ctx.strokeStyle = color; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x + cw / 2, py(c.h)); ctx.lineTo(x + cw / 2, py(c.l)); ctx.stroke();
      // Body
      ctx.fillStyle = color;
      ctx.fillRect(x + 1, bodyTop, cw - 2, bodyH);
      ctx.globalAlpha = 1;
    };

    // LEFT: Full static chart (all candles always visible)
    const leftW = midX - pad * 2;
    const cw1 = leftW / totalCandles;
    for (let i = 0; i < totalCandles; i++) {
      drawCandle(candles[i], pad + i * cw1, cw1, 1);
    }
    // Annotations on left (hindsight)
    ctx.font = '8px system-ui'; ctx.fillStyle = 'rgba(245,158,11,0.8)'; ctx.textAlign = 'center';
    const sweepX = pad + 11 * cw1;
    ctx.fillText('"Obvious" sweep', sweepX, py(candles[11].l) + 12);
    const revX = pad + 13 * cw1;
    ctx.fillText('"Easy" entry', revX + 10, py(candles[12].c) - 8);

    // RIGHT: Bar-by-bar reveal
    const rightStart = midX + pad;
    const rightW = midX - pad * 2;
    const cw2 = rightW / totalCandles;
    for (let i = 0; i < liveCandles; i++) {
      drawCandle(candles[i], rightStart + i * cw2, cw2, 1);
    }
    // Grey out future
    if (liveCandles < totalCandles) {
      ctx.fillStyle = 'rgba(255,255,255,0.02)';
      ctx.fillRect(rightStart + liveCandles * cw2, top - 5, rightW - liveCandles * cw2, bot - top + 10);
      // "?" at the edge
      const pulse = 0.5 + 0.5 * Math.sin(t * 4);
      ctx.font = `bold ${14 + pulse * 4}px system-ui`;
      ctx.fillStyle = `rgba(245,158,11,${0.5 + pulse * 0.5})`;
      ctx.textAlign = 'center';
      ctx.fillText('?', rightStart + liveCandles * cw2 + 10, (top + bot) / 2);
    }

    // Bottom labels
    ctx.font = '9px system-ui'; ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.textAlign = 'center';
    ctx.fillText('Everything looks obvious after the fact', midX / 2, h - 5);
    ctx.fillText('In real-time, every candle is a decision', midX + midX / 2, h - 5);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 2: Candle Anatomy in Motion
// Shows how a single candle FORMS over time (wick → body → close)
// ============================================================
function CandleFormationAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.008;
    const cycle = t % 6;
    const cx = w / 2;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('How a Candle Forms in Real-Time', cx, 16);

    // Phases of candle formation
    const phases = [
      { label: 'Open', progress: 0.1 },
      { label: 'Initial move down', progress: 0.25 },
      { label: 'Wick extends', progress: 0.4 },
      { label: 'Buyers step in', progress: 0.6 },
      { label: 'Body forming', progress: 0.8 },
      { label: 'CLOSE — Bullish Rejection', progress: 1.0 },
    ];
    const phaseIdx = Math.min(phases.length - 1, Math.floor(cycle));
    const phaseProg = cycle - phaseIdx;

    const candleW = 50;
    const candleX = cx - candleW / 2;
    const openY = h * 0.45;
    const closeTarget = h * 0.32; // bullish close above open
    const lowTarget = h * 0.72; // long lower wick
    const highTarget = h * 0.28;

    // Animate candle state based on phase
    let curOpen = openY;
    let curClose = openY;
    let curLow = openY;
    let curHigh = openY;

    if (phaseIdx >= 1) { curLow = openY + (lowTarget - openY) * Math.min(1, phaseProg * 2); curClose = openY + 10; }
    if (phaseIdx >= 2) { curLow = lowTarget; curClose = openY + 5; }
    if (phaseIdx >= 3) { curClose = openY - (openY - closeTarget) * phaseProg; curHigh = openY - 5; }
    if (phaseIdx >= 4) { curClose = closeTarget + (openY - closeTarget) * 0.1; curHigh = highTarget + (openY - highTarget) * 0.3; }
    if (phaseIdx >= 5) { curClose = closeTarget; curHigh = highTarget; curLow = lowTarget; }

    // Draw candle
    const bull = curClose < curOpen;
    const color = bull ? '#34d399' : '#ef4444';

    // Wick
    ctx.strokeStyle = color; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, curHigh); ctx.lineTo(cx, curLow); ctx.stroke();

    // Body
    const bodyTop = Math.min(curOpen, curClose);
    const bodyBot = Math.max(curOpen, curClose);
    ctx.fillStyle = color;
    ctx.fillRect(candleX, bodyTop, candleW, Math.max(2, bodyBot - bodyTop));

    // Open line
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(candleX - 30, openY); ctx.lineTo(candleX + candleW + 30, openY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '9px system-ui'; ctx.textAlign = 'right';
    ctx.fillText('Open', candleX - 35, openY + 3);

    // Phase label
    ctx.fillStyle = '#f59e0b'; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'center';
    ctx.fillText(phases[phaseIdx].label, cx, h - 15);

    // Phase dots
    for (let i = 0; i < phases.length; i++) {
      ctx.beginPath();
      ctx.arc(cx - 60 + i * 24, h - 35, 4, 0, Math.PI * 2);
      ctx.fillStyle = i <= phaseIdx ? '#f59e0b' : 'rgba(255,255,255,0.1)';
      ctx.fill();
    }

    // Annotations
    if (phaseIdx >= 2) {
      ctx.fillStyle = 'rgba(239,68,68,0.6)'; ctx.font = '9px system-ui'; ctx.textAlign = 'left';
      ctx.fillText('← Sellers pushed hard', cx + candleW / 2 + 10, curLow);
    }
    if (phaseIdx >= 4) {
      ctx.fillStyle = 'rgba(52,211,153,0.6)'; ctx.textAlign = 'left';
      ctx.fillText('← Buyers absorbed + pushed up', cx + candleW / 2 + 10, curClose);
    }
  }, []);
  return <AnimScene drawFn={draw} height={300} />;
}

// ============================================================
// BAR-BY-BAR REPLAY SIMULATOR — 5 scenarios
// ============================================================
interface ReplayCandle { o: number; h: number; l: number; c: number; }
interface ReplayScenario {
  title: string;
  instrument: string;
  timeframe: string;
  context: string;
  candles: ReplayCandle[];
  decisionCandle: number; // index where student must decide
  correctAction: 'ENTER' | 'WAIT' | 'SKIP';
  explanation: string;
  outcome: string;
}

function generateCandles(seed: number, count: number, pattern: string): ReplayCandle[] {
  const s = (n: number) => Math.sin(n * 127.1 + seed * 311.7) * 0.5 + 0.5;
  const candles: ReplayCandle[] = [];
  let price = 2340;

  for (let i = 0; i < count; i++) {
    const noise = (s(i * 3 + seed) - 0.5) * 12;
    let bias = 0;

    if (pattern === 'trend-pullback') {
      if (i < 6) bias = 5; // uptrend
      else if (i < 8) bias = 8; // BOS
      else if (i < 12) bias = -4; // pullback
      else if (i === 12) bias = -2; // at OB — decision point
      else bias = 7; // continuation up
    } else if (pattern === 'false-breakout') {
      if (i < 8) bias = -3; // downtrend
      else if (i === 8 || i === 9) bias = 10; // breakout up
      else if (i === 10) bias = -15; // rejection — false breakout
      else bias = -5; // continuation down
    } else if (pattern === 'range-trap') {
      bias = (s(i * 5 + seed) - 0.5) * 8; // choppy range
      if (i === 9 || i === 10) bias = 6; // looks like breakout
      else if (i === 11) bias = -8; // back into range
    } else if (pattern === 'sweep-reversal') {
      if (i < 7) bias = -4; // downtrend
      else if (i === 7 || i === 8) bias = -10; // sweep below lows
      else if (i === 9) bias = 14; // strong bullish rejection
      else if (i === 10) bias = 3; // pullback
      else bias = 8; // reversal continuation
    } else if (pattern === 'clean-continuation') {
      if (i < 5) bias = 6; // uptrend
      else if (i === 5) bias = 10; // strong BOS
      else if (i < 9) bias = -3; // orderly pullback
      else if (i === 9) bias = 2; // at OB with engulfing forming
      else bias = 7; // textbook move
    }

    const o = price;
    const c = price + noise + bias;
    const wick = Math.abs(c - o) * (0.2 + s(i * 7 + seed) * 0.5);
    const hi = Math.max(o, c) + wick;
    const lo = Math.min(o, c) - wick * (0.8 + s(i * 11 + seed) * 0.4);
    candles.push({ o, h: hi, l: lo, c });
    price = c;
  }
  return candles;
}

const replayScenarios: ReplayScenario[] = [
  {
    title: 'Gold Trend Pullback', instrument: 'XAUUSD', timeframe: '15M', context: 'Daily is bullish. 4H shows BOS up at 2,348. Price has pulled back to a demand OB at 2,328-2,332. London KZ is open. You see a bullish engulfing candle forming at the OB.',
    candles: generateCandles(1, 16, 'trend-pullback'), decisionCandle: 12, correctAction: 'ENTER',
    explanation: 'This is a textbook Model 1 continuation setup. Daily bullish, 4H BOS up, pullback to OB in the Kill Zone with a bullish trigger forming. All 5 checklist conditions are met from Level 6.',
    outcome: 'Price rallied from the OB to 2,352 — a clean 1:2 R:R. The pullback to the OB was the entry, not the threat.'
  },
  {
    title: 'EUR/USD False Breakout', instrument: 'EURUSD', timeframe: '15M', context: 'Daily is bearish. Price has been dropping for 3 sessions. Suddenly, two strong green candles break above recent highs. Looks like a reversal — or is it?',
    candles: generateCandles(2, 15, 'false-breakout'), decisionCandle: 9, correctAction: 'SKIP',
    explanation: 'Two green candles breaking highs in a strong Daily downtrend is more likely a liquidity grab than a genuine reversal. There is no CHoCH on a higher timeframe, no divergence, no sweep of a significant level. This is the market grabbing stop losses from early shorts before continuing down.',
    outcome: 'The "breakout" was a liquidity sweep. Price reversed immediately after triggering buy stops, dropping 40 pips below the entry. Traders who bought the breakout were trapped.'
  },
  {
    title: 'NASDAQ Range Trap', instrument: 'NAS100', timeframe: '15M', context: 'Price has been ranging between 18,400 and 18,480 for 6 hours. No clear HTF bias — 4H is sideways. You see price nudge above 18,480 with increasing volume.',
    candles: generateCandles(3, 14, 'range-trap'), decisionCandle: 10, correctAction: 'SKIP',
    explanation: 'No clear HTF bias (4H ranging). The nudge above the range is not a confirmed BOS — it is a range expansion test. Without HTF direction, you are flipping a coin. Your pre-session routine Phase 1 should have flagged this as NEUTRAL bias = no trading.',
    outcome: 'Price broke above the range briefly then slammed back inside. Classic range trap — the breakout failed because there was no HTF momentum to sustain it.'
  },
  {
    title: 'Gold Liquidity Sweep', instrument: 'XAUUSD', timeframe: '15M', context: 'Daily showed exhaustion (RSI divergence). Price swept below the weekly low at 2,275 with two violent red candles. Then a massive bullish rejection candle appears — long lower wick, closes above 2,290. 15M shows a CHoCH breaking above last lower high.',
    candles: generateCandles(4, 15, 'sweep-reversal'), decisionCandle: 10, correctAction: 'ENTER',
    explanation: 'This is a Model 2 reversal setup: Daily exhaustion + liquidity sweep below weekly lows + 15M CHoCH + bullish rejection candle. The sweep grabbed liquidity, the CHoCH confirmed the structural shift, and the rejection proved buyers are defending the level.',
    outcome: 'Price reversed from 2,278 to 2,345 over the next 2 sessions — a massive 1:3+ R:R. The sweep was the trap, and the CHoCH was the confirmation. Waiting for both was the key.'
  },
  {
    title: 'GBP/USD Clean Continuation', instrument: 'GBPUSD', timeframe: '15M', context: 'Daily bullish with BOS at 1.2720. 4H confirms with higher lows. Price pulled back to a demand OB at 1.2685-1.2690 during London open. You see a strong bullish engulfing close right at the OB. Volume spikes above the 20-period SMA.',
    candles: generateCandles(5, 14, 'clean-continuation'), decisionCandle: 9, correctAction: 'ENTER',
    explanation: 'All 5 Level 6 checklist conditions are met: HTF trend (Daily bullish) ✓, BOS (1.2720) ✓, pullback to OB (1.2685-1.2690) ✓, Kill Zone (London open) ✓, trigger (engulfing + volume) ✓. This is as clean as it gets. Hesitating here IS the execution gap from Lesson 7.1.',
    outcome: 'Price respected the OB perfectly, hitting TP1 at 1:1 within 45 minutes and running to 1:2.3 before the session ended. This is the trade your backtest would have taken instantly — the question is whether YOU did too.'
  },
];

// ============================================================
// GAME & QUIZ DATA
// ============================================================
const gameRounds = [
  { scenario: 'You are watching Gold on the 15M. Your pre-session routine says: Daily bullish, demand OB at 2,328. Price pulls back to 2,330 during London open. A doji candle forms at the OB — small body, equal wicks. No volume spike. What do you do?',
    options: [
      { text: 'ENTER — price is at the OB, that is enough', correct: false, explain: 'A doji is NOT a valid trigger. It shows indecision, not conviction. An entry trigger needs to show that buyers have stepped in — a doji shows neither side won. You need a bullish engulfing, rejection wick, or LTF BOS to confirm.' },
      { text: 'WAIT — doji is indecision, not a trigger. Wait for the next candle to confirm', correct: true, explain: 'Correct! The doji shows price REACHED the OB but has not confirmed buyer conviction. Wait for the next candle: if it is a strong bullish close above the doji high, that becomes your trigger. If it breaks below the OB, the level has failed and you skip.' },
      { text: 'SKIP — dojis always mean reversal against you', correct: false, explain: 'Dojis do not "always" mean anything. They show indecision. The correct response is to WAIT for the resolution candle, not to skip entirely. The setup is still valid — it just needs confirmation.' },
      { text: 'Enter with half size — hedge your uncertainty', correct: false, explain: 'Half size with no trigger is still a trade without a trigger. Your Level 6 Entry Trigger Mastery lesson was clear: no trigger = no trade. Wait for the confirmation candle.' },
    ]
  },
  { scenario: 'EUR/USD is in a strong Daily downtrend. On the 15M, you see 3 green candles in a row pushing up aggressively. A colleague messages you: "EUR reversing hard, get in NOW." Your OB is 25 pips higher. What do you do?',
    options: [
      { text: 'Enter long — 3 green candles is strong momentum', correct: false, explain: '3 green candles in a Daily downtrend is a PULLBACK, not a reversal. Without a CHoCH on at least the 1H, without a sweep of significant liquidity, and without exhaustion on the HTF, this is counter-trend noise.' },
      { text: 'WAIT — the pullback has not reached your identified supply OB level yet', correct: true, explain: 'Correct! Your pre-session routine Phase 2 identified the supply OB 25 pips higher. The pullback is moving TOWARD your level, not away from it. Wait for price to reach the OB, then look for a bearish trigger for a short. The 3 green candles are delivering price to YOUR entry.' },
      { text: 'Enter short now — the 3 green candles must be a liquidity grab', correct: false, explain: 'You cannot short without a trigger. The pullback is still in progress — entering short now means your stop must be very wide (above the OB you identified). Wait for price to reach the OB and show rejection first.' },
      { text: 'Skip the trade — conflicting information is too confusing', correct: false, explain: 'There is no conflict. Daily is bearish, 15M is pulling back up (normal), and your OB is 25 pips higher (your plan). This is the setup FORMING, not a reason to skip. Patience, not confusion, is the correct response.' },
    ]
  },
  { scenario: 'You are in the bar-by-bar replay. Candle 8 shows a massive bullish engulfing — exactly at your OB — during London KZ. You feel excited. But then you notice: the engulfing candle&apos;s body is only 60% of the 5-candle average body size. Volume is below the 20-period SMA. What do you do?',
    options: [
      { text: 'ENTER — it is an engulfing at an OB in a KZ, that is 3 confluences', correct: false, explain: 'The pattern is right but the QUALITY is weak. Body size below the 5-candle average and volume below the 20-SMA are both quality filter failures from Level 6 Lesson 5. A weak trigger at a good level is still a weak trigger.' },
      { text: 'WAIT — the trigger fails quality filters. Wait for a stronger candle or LTF BOS confirmation', correct: true, explain: 'Correct! The setup location is perfect but the trigger quality is insufficient. Level 6 taught: body must be > 5-candle average AND volume above 20-SMA. Wait for a stronger candle, or drop to the 5M and look for a BOS to confirm the direction. Quality over speed.' },
      { text: 'SKIP — if the first trigger is weak, the level is broken', correct: false, explain: 'One weak candle does not invalidate the level. The OB can still hold — it just needs a BETTER trigger. Some of the best trades come from the second or third test of a level, not the first touch.' },
      { text: 'Enter with a very tight stop since you are uncertain', correct: false, explain: 'A tight stop on a weak trigger means you get stopped out by normal noise. Your stop should be structural (below the OB), not emotional (tight because you are unsure). The answer is to wait for a quality trigger, not to enter with fear.' },
    ]
  },
  { scenario: 'You have been watching for 40 minutes. Your KZ ends in 20 minutes. No setup has formed — price has been ranging just above your demand OB but has not tested it. You feel frustrated and think: "I prepared for this session, I SHOULD trade." What do you do?',
    options: [
      { text: 'Enter at market — you have done the preparation, trust the level', correct: false, explain: 'Preparation does not guarantee a trade. Your routine identified the LEVEL, but the market has not delivered price TO that level with a TRIGGER. Entering without a trigger because you "deserve" a trade is emotional, not strategic.' },
      { text: 'Stay past the KZ to wait for the setup', correct: false, explain: 'Your routine Phase 3 set the KZ boundary. Extending it because you want a trade is exactly the discipline erosion that destroys edge over time. The boundary exists because your win rate drops outside it.' },
      { text: 'Accept no trade today — a session with no setups is a SUCCESSFUL session if you followed your rules', correct: true, explain: 'Correct! Not trading IS a decision. Your routine worked perfectly — it told you WHERE to look and WHEN. The market simply did not deliver the setup. Forcing a trade now creates the execution gap from Lesson 7.1. Walk away. The market will be here tomorrow.' },
      { text: 'Lower your standards — take a B-grade setup that almost meets your criteria', correct: false, explain: 'B-grade setups produce B-grade results. Lowering standards under time pressure is how A-grade strategies become C-grade execution. Your criteria exist for a reason.' },
    ]
  },
  { scenario: 'In the replay, candle 6 shows a clear BOS to the upside on the 15M. You mark the OB from candles 4-5. Candle 9 pulls back to the OB. Candle 10 is a bullish engulfing with above-average body and volume. You click ENTER. Candle 11 pulls back 4 pips into the OB before continuing up. Your stop is 8 pips below the OB low. During that 4-pip pullback, you feel intense anxiety. What is the correct internal dialogue?',
    options: [
      { text: '"This is failing — I should close before I lose more"', correct: false, explain: 'A 4-pip pullback on an 8-pip stop is normal price action. Price testing the entry area does not invalidate the thesis. Closing here locks in a small loss on a valid trade that has not been stopped out.' },
      { text: '"I should move my stop to breakeven to eliminate the risk"', correct: false, explain: 'Moving to breakeven before TP1 is reached means you get stopped out on normal fluctuations. Level 6 Lesson 8 (Trade Management) was clear: BE move happens AFTER TP1, not during initial noise.' },
      { text: '"My stop is structural. The thesis is not invalidated unless the OB low breaks. This pullback is normal."', correct: true, explain: 'Correct! Your stop is below the OB for a reason — it is the level where your thesis is genuinely WRONG. A 4-pip pullback within the OB is not a failure; it is a retest. Trust the structure, not the anxiety. This is the exact moment where the execution gap widens or narrows.' },
      { text: '"I should add to my position since price came back to a better price"', correct: false, explain: 'Adding during the initial pullback is aggressive scaling without a new independent setup. Level 6 Lesson 8 said: only add if the addition would pass as a standalone trade. A retest of your existing entry does not qualify.' },
    ]
  },
];

const quizQuestions = [
  { q: 'What is the biggest difference between reading a static chart and reading live price action?', opts: ['Static charts have more candles', 'Live price action includes volume but static does not', 'In live, you cannot see the future — every candle requires a decision without knowing what comes next', 'There is no difference — the patterns are the same'], correct: 2 },
  { q: 'In the bar-by-bar replay, you see an OB form but no trigger candle yet. What is the correct response?', opts: ['Enter now — the OB is enough', 'WAIT — an OB without a trigger is a zone, not an entry', 'Skip — if the trigger has not formed by now, it will not', 'Enter with half position size'], correct: 1 },
  { q: 'Why is hindsight bias the most dangerous bias in live trading?', opts: ['It makes you overtrade', 'It makes every past setup look obvious, creating unrealistic expectations for real-time decision speed', 'It only affects beginners', 'It causes you to use too many indicators'], correct: 1 },
  { q: 'During a live session, no valid setup forms in your entire kill zone. What is the correct outcome?', opts: ['Take a B-grade setup anyway — you prepared for this', 'Extend the kill zone by 30 minutes', 'No trade today — following your rules IS a successful session', 'Switch to a different instrument'], correct: 2 },
  { q: 'A bullish engulfing forms at your demand OB, but the body is smaller than the 5-candle average. What do you do?', opts: ['Enter — engulfing pattern is all that matters', 'WAIT for a stronger confirmation candle or LTF BOS', 'Skip the entire level', 'Enter with a tighter stop'], correct: 1 },
  { q: 'After entering a valid trade, price pulls back 40% toward your stop. The OB has not been broken. What should you do?', opts: ['Close the trade to protect capital', 'Move stop to breakeven', 'Hold — the thesis is not invalidated until the stop level breaks', 'Add to the position at a "better price"'], correct: 2 },
  { q: 'What does a candle with a long lower wick and a small bullish body at a demand zone tell you in REAL-TIME?', opts: ['The market is bearish — look at how far down the wick went', 'Sellers pushed hard but buyers absorbed the pressure and closed near the high — potential demand confirmation', 'Nothing — one candle is not enough information', 'You should enter immediately on the next candle open'], correct: 1 },
  { q: 'In the bar-by-bar replay, 3 consecutive green candles push up during a Daily DOWNTREND. What is most likely happening?', opts: ['The trend is reversing — get long', 'A pullback within the downtrend — price is moving TOWARD your supply zone', 'The Daily bias is wrong — update your routine', 'A breakout — the downtrend is over'], correct: 1 },
];

function Confetti({ active }: { active: boolean }) {
  if (!active) return null;
  return (<div className="fixed inset-0 pointer-events-none z-50">{Array.from({ length: 60 }).map((_, i) => (<motion.div key={i} initial={{ y: -20, x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400), opacity: 1 }} animate={{ y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 20, rotate: Math.random() * 720, opacity: 0 }} transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5 }} className="absolute w-2 h-2 rounded-sm" style={{ background: ['#f59e0b', '#d946ef', '#34d399', '#3b82f6', '#ef4444'][i % 5] }} />))}</div>);
}

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

export default function ReadingLivePriceActionLesson() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);

  // Replay Simulator State
  const [replayIdx, setReplayIdx] = useState(0);
  const [replayCandle, setReplayCandle] = useState(5); // start with 5 candles visible
  const [replayDecision, setReplayDecision] = useState<string | null>(null);
  const [replayRevealed, setReplayRevealed] = useState(false);
  const [replayScore, setReplayScore] = useState(0);
  const [replayCompleted, setReplayCompleted] = useState<boolean[]>(Array(replayScenarios.length).fill(false));

  const currentScenario = replayScenarios[replayIdx];
  const atDecisionPoint = replayCandle >= currentScenario.decisionCandle && !replayDecision;
  const pastDecision = !!replayDecision;

  const handleReplayAdvance = () => {
    if (replayCandle < currentScenario.candles.length - 1 && !atDecisionPoint) {
      setReplayCandle(c => c + 1);
    }
  };

  const handleReplayDecision = (action: string) => {
    setReplayDecision(action);
    // Reveal remaining candles
    setReplayCandle(currentScenario.candles.length - 1);
    setReplayRevealed(true);
    if (action === currentScenario.correctAction) {
      setReplayScore(s => s + 1);
    }
    const next = [...replayCompleted];
    next[replayIdx] = true;
    setReplayCompleted(next);
  };

  const handleNextScenario = () => {
    if (replayIdx < replayScenarios.length - 1) {
      setReplayIdx(i => i + 1);
      setReplayCandle(5);
      setReplayDecision(null);
      setReplayRevealed(false);
    }
  };

  // Replay canvas drawing
  const drawReplay = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const pad = 25;
    const top = 30;
    const bot = h - 20;
    const scenario = replayScenarios[replayIdx];
    const visibleCandles = scenario.candles.slice(0, replayCandle + 1);

    const allPrices = visibleCandles.flatMap(c => [c.h, c.l]);
    const minP = Math.min(...allPrices) - 5;
    const maxP = Math.max(...allPrices) + 5;
    const range = maxP - minP || 1;
    const py = (p: number) => bot - ((p - minP) / range) * (bot - top);

    const chartW = w - pad * 2;
    const totalSlots = scenario.candles.length;
    const cw = chartW / totalSlots;

    // Draw visible candles
    for (let i = 0; i < visibleCandles.length; i++) {
      const c = visibleCandles[i];
      const x = pad + i * cw;
      const bull = c.c >= c.o;
      const color = bull ? '#34d399' : '#ef4444';
      const isDecisionCandle = i === scenario.decisionCandle;

      // Highlight decision candle
      if (isDecisionCandle && !replayRevealed) {
        ctx.fillStyle = 'rgba(245,158,11,0.08)';
        ctx.fillRect(x - 2, top - 5, cw + 4, bot - top + 10);
      }

      // Post-decision candles in different shade
      const isAfterDecision = replayRevealed && i > scenario.decisionCandle;

      ctx.globalAlpha = isAfterDecision ? 0.7 : 1;
      // Wick
      ctx.strokeStyle = color; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x + cw / 2, py(c.h)); ctx.lineTo(x + cw / 2, py(c.l)); ctx.stroke();
      // Body
      const bodyTop = py(Math.max(c.o, c.c));
      const bodyBot = py(Math.min(c.o, c.c));
      ctx.fillStyle = color;
      ctx.fillRect(x + 2, bodyTop, cw - 4, Math.max(1, bodyBot - bodyTop));
      ctx.globalAlpha = 1;
    }

    // Future area grey
    if (!replayRevealed && replayCandle < totalSlots - 1) {
      const futureX = pad + (replayCandle + 1) * cw;
      ctx.fillStyle = 'rgba(255,255,255,0.015)';
      ctx.fillRect(futureX, top - 5, w - futureX - pad, bot - top + 10);
    }

    // Decision point marker
    if (atDecisionPoint) {
      const dpX = pad + scenario.decisionCandle * cw + cw / 2;
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 11px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('▼ DECIDE NOW', dpX, top - 10);
    }

    // Candle counter
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '9px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(`Candle ${replayCandle + 1}/${totalSlots}`, pad, h - 5);
  }, [replayIdx, replayCandle, atDecisionPoint, replayRevealed]);

  const replayCanvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = replayCanvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr; canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);
    drawReplay(ctx, rect.width, rect.height);
  }, [drawReplay]);

  const [openTip, setOpenTip] = useState<number | null>(null);

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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 7 &middot; Lesson 3</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Reading Live<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Price Action</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">The textbook shows you finished charts. The market shows you one candle at a time. Learn to make decisions without seeing the future.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* S00 */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">🔍 The Fog of War</p>
            <p className="text-gray-400 leading-relaxed mb-4">Military strategists study battles after they are over. In those case studies, every troop movement makes sense. The flanking manoeuvre was &quot;obvious.&quot; The ambush was &quot;predictable.&quot; But in the actual battle, with smoke, noise, incomplete information, and lives at stake — nothing was obvious. That is the fog of war.</p>
            <p className="text-gray-400 leading-relaxed">Trading has the same fog. When you study a chart in hindsight, every OB reaction looks obvious, every sweep looks textbook, every BOS looks clean. But in real-time, with real money, the candle forming right now could become anything. You have to decide BEFORE it closes. This lesson teaches you to operate in the fog — not to eliminate it, but to make good decisions despite it.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">A trading psychologist tested 200 traders on the same 50 setups: <strong className="text-white">Group A</strong> saw static charts (full picture). <strong className="text-white">Group B</strong> saw bar-by-bar replays (live simulation). Group A identified <strong className="text-green-400">82% of valid entries correctly</strong>. Group B identified only <strong className="text-red-400">47%</strong> — and 31% of Group B also took trades that Group A unanimously rejected. Same charts. Same patterns. The ONLY difference was whether they could see the future.</p>
          </div>
        </motion.div>
      </section>

      {/* S01 — Hindsight vs Live Animation */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; Hindsight vs Live</p>
          <h2 className="text-2xl font-extrabold mb-4">The Same Chart, Two Realities</h2>
          <p className="text-gray-400 text-sm mb-6">Left: the full chart in hindsight — everything looks &quot;obvious.&quot; Right: the same chart revealed candle by candle. Notice how the &quot;?&quot; at the edge changes everything about your confidence.</p>
          <HindsightVsLiveAnimation />
        </motion.div>
      </section>

      {/* S02 — Candle Formation Animation */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; How a Candle Forms</p>
          <h2 className="text-2xl font-extrabold mb-4">The Story Inside a Single Candle</h2>
          <p className="text-gray-400 text-sm mb-6">A candle is not a fixed shape — it is a battle between buyers and sellers that unfolds over the entire period. Watch how a bullish rejection candle FORMS in real-time: sellers push down, buyers absorb, then buyers win.</p>
          <CandleFormationAnimation />
        </motion.div>
      </section>

      {/* S03 — 5 Live Reading Principles */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; 5 Principles of Live Reading</p>
          <h2 className="text-2xl font-extrabold mb-4">How Professionals Read the Right Edge</h2>
          <div className="space-y-3">
            {[
              { title: 'Wait for the CLOSE', desc: 'A candle means nothing until it closes. A 15M candle can look like a strong bullish engulfing at minute 12, then reverse and close as a shooting star by minute 15. Never enter before the candle closes — unless you are using an LTF trigger.', icon: '⏳' },
              { title: 'Context trumps pattern', desc: 'A bullish engulfing at a demand OB during London KZ in a Daily uptrend is a completely different signal than the same candle in a range during Asia. The pattern is the same — the context changes everything.', icon: '🗺️' },
              { title: 'The current candle is always uncertain', desc: 'Accept that the candle forming RIGHT NOW could close green or red. Your job is not to predict it — your job is to have a PLAN for both outcomes. "If it closes bullish, I enter. If it closes bearish, I wait."', icon: '❓' },
              { title: 'Speed of movement matters', desc: 'A fast move into a zone (large body, high volume) means participants are aggressive. A slow drift (small bodies, low volume) means no one cares. Reaction quality at a zone depends on HOW price arrived.', icon: '⚡' },
              { title: 'One candle is not enough', desc: 'A single bullish candle at support is a hypothesis. Two candles confirming is evidence. Three candles holding is conviction. Do not enter on a hypothesis — wait for at least one confirmation.', icon: '📊' },
            ].map((principle, i) => (
              <div key={i} className="rounded-xl border border-white/5 overflow-hidden">
                <button onClick={() => setOpenTip(openTip === i ? null : i)} className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3"><span className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center text-sm flex-shrink-0">{principle.icon}</span><p className="text-sm font-bold text-white text-left">{principle.title}</p></div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openTip === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openTip === i && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="px-4 pb-4"><p className="text-sm text-gray-400 leading-relaxed">{principle.desc}</p></div></motion.div>)}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S04 — The Decision Framework */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The Real-Time Decision Framework</p>
          <h2 className="text-2xl font-extrabold mb-4">ENTER / WAIT / SKIP</h2>
          <p className="text-gray-400 text-sm mb-6">Every candle at a zone produces one of three decisions. Here is when each applies.</p>
          <div className="space-y-3">
            {[
              { action: 'ENTER ✅', when: 'All 5 Level 6 checklist conditions are met: HTF bias ✓, BOS ✓, price at OB/FVG ✓, Kill Zone ✓, quality trigger candle ✓. You can write one sentence explaining why this trade is valid.', color: 'bg-green-500/10 border-green-500/20' },
              { action: 'WAIT ⏸️', when: 'Price is at or near a zone but no trigger yet. The setup is FORMING but not confirmed. Also: trigger quality is marginal (weak body, low volume). Wait for the next candle or drop to LTF for confirmation.', color: 'bg-amber-500/10 border-amber-500/20' },
              { action: 'SKIP ❌', when: 'No HTF bias, wrong session, price not at a key level, conflicting structure, news imminent, or emotional state compromised. The market is offering noise, not opportunity. The best trade is no trade.', color: 'bg-red-500/10 border-red-500/20' },
            ].map((item, i) => (
              <div key={i} className={`p-4 rounded-xl border ${item.color}`}>
                <p className="text-sm font-bold text-white mb-2">{item.action}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{item.when}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
            <p className="text-xs text-amber-400">💡 If you cannot immediately decide between ENTER and WAIT, the answer is WAIT. Hesitation IS information — it means the setup is not clean enough. Clean setups feel obvious in real-time.</p>
          </div>
        </motion.div>
      </section>

      {/* S05 — BAR-BY-BAR REPLAY SIMULATOR */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Bar-by-Bar Replay Simulator</p>
          <h2 className="text-2xl font-extrabold mb-4">Make Your Decision — Then See What Happens</h2>
          <p className="text-gray-400 text-sm mb-6">Candles build one at a time. When you reach the decision point, choose ENTER, WAIT, or SKIP. Then the remaining candles reveal the outcome. 5 scenarios. This is the closest you can get to live trading inside a lesson.</p>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
            {/* Scenario selector */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {replayScenarios.map((s, i) => (
                <button key={i} disabled={i !== replayIdx && !replayCompleted[i]} onClick={() => { if (replayCompleted[i] || i === replayIdx) { setReplayIdx(i); setReplayCandle(5); setReplayDecision(null); setReplayRevealed(false); }}} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${i === replayIdx ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : replayCompleted[i] ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-white/[0.03] text-gray-600 border border-white/5'}`}>
                  {replayCompleted[i] ? '✓' : ''} {i + 1}
                </button>
              ))}
              <span className="text-xs font-mono text-gray-500 self-center ml-2">{replayScore}/{replayScenarios.filter((_, i) => replayCompleted[i]).length} correct</span>
            </div>

            {/* Context */}
            <div className="p-3 rounded-lg bg-white/[0.02]">
              <p className="text-xs font-bold text-amber-400 mb-1">{currentScenario.title} — {currentScenario.instrument} {currentScenario.timeframe}</p>
              <p className="text-xs text-gray-400 leading-relaxed">{currentScenario.context}</p>
            </div>

            {/* Replay Canvas */}
            <div className="w-full rounded-xl overflow-hidden bg-black/30 border border-white/5">
              <canvas ref={replayCanvasRef} style={{ width: '100%', height: 220 }} />
            </div>

            {/* Controls */}
            {!atDecisionPoint && !pastDecision && (
              <button onClick={handleReplayAdvance} className="w-full py-3 rounded-xl bg-white/[0.05] border border-white/10 text-sm font-bold text-gray-300 hover:bg-white/[0.08] active:scale-[0.98] transition-all">
                Next Candle &rarr; ({replayCandle + 1}/{currentScenario.candles.length})
              </button>
            )}

            {atDecisionPoint && !pastDecision && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-amber-400 text-center">⚡ DECISION POINT — What do you do?</p>
                <div className="grid grid-cols-3 gap-2">
                  {['ENTER', 'WAIT', 'SKIP'].map(action => (
                    <button key={action} onClick={() => handleReplayDecision(action)} className={`py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${action === 'ENTER' ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30' : action === 'WAIT' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'}`}>{action}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Result */}
            {replayRevealed && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <div className={`p-4 rounded-xl border ${replayDecision === currentScenario.correctAction ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                  <p className="text-sm font-bold mb-2">
                    {replayDecision === currentScenario.correctAction ? '✅ Correct!' : `❌ You chose ${replayDecision} — correct answer: ${currentScenario.correctAction}`}
                  </p>
                  <p className="text-xs text-gray-400 leading-relaxed mb-2">{currentScenario.explanation}</p>
                  <p className="text-xs text-gray-500 italic">{currentScenario.outcome}</p>
                </div>
                {replayIdx < replayScenarios.length - 1 && (
                  <button onClick={handleNextScenario} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Scenario &rarr;</button>
                )}
                {replayIdx === replayScenarios.length - 1 && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                    <p className="text-lg font-extrabold text-amber-400">{replayScore}/5 Scenarios Correct</p>
                    <p className="text-xs text-gray-400 mt-1">{replayScore >= 4 ? 'Outstanding — you read live price action like a professional.' : replayScore >= 3 ? 'Good — review the scenarios you missed and identify what you overlooked.' : 'Practice the decision framework: ENTER when all conditions are met, WAIT when uncertain, SKIP when wrong.'}</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </section>

      {/* S06 — What the Candle Tells You */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Candle Character Guide</p>
          <h2 className="text-2xl font-extrabold mb-4">What Each Candle Type Tells You in Real-Time</h2>
          <div className="space-y-3">
            {[
              { type: 'Large body, small wicks', meaning: 'CONVICTION — one side dominated. Bulls or bears are in control. In the direction of your bias, this confirms momentum.', action: 'If at your zone with correct bias: this IS your trigger.', color: 'border-green-500/20' },
              { type: 'Long lower wick, small bullish body', meaning: 'REJECTION — sellers tried and failed. Buyers absorbed the pressure. At a demand zone, this is bullish confirmation.', action: 'Wait for the close. If it closes above the open with a long lower wick at demand: trigger confirmed.', color: 'border-green-500/20' },
              { type: 'Doji (equal body and wicks)', meaning: 'INDECISION — neither side won. The battle is ongoing. This is NOT a trigger — it is a pause.', action: 'WAIT. The next candle resolves the indecision. Bullish follow-through = confirm. Bearish break = level may fail.', color: 'border-amber-500/20' },
              { type: 'Small body, low volume', meaning: 'APATHY — nobody cares. Price is drifting, not being driven. Setups in apathetic conditions have lower probability.', action: 'WAIT or SKIP. Low volume at a zone means the test is weak. Strong reactions need volume.', color: 'border-amber-500/20' },
              { type: 'Large body AGAINST your bias', meaning: 'WARNING — the opposing side showed strength. At a demand zone, a large red candle may mean the level is being absorbed (broken).', action: 'If your zone is broken with a strong candle: SKIP. The thesis is invalidated. Do not hope.', color: 'border-red-500/20' },
            ].map((candle, i) => (
              <div key={i} className={`p-4 rounded-xl border ${candle.color} bg-white/[0.01]`}>
                <p className="text-sm font-bold text-white mb-1">{candle.type}</p>
                <p className="text-xs text-gray-400 leading-relaxed mb-2">{candle.meaning}</p>
                <p className="text-xs text-amber-400">→ {candle.action}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S07 — The Patience Paradox */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; The Patience Paradox</p>
          <h2 className="text-2xl font-extrabold mb-4">The Best Traders Do the Least</h2>
          <p className="text-gray-400 text-sm mb-6">In a 2-hour London kill zone, a professional might watch 8 candles form on the 15M chart. Of those 8 candles, maybe 1-2 are at an interesting level. Of those 1-2, maybe 0-1 produce a valid trigger. Some days, the number is zero. And zero is a perfectly acceptable answer.</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-xs font-bold text-red-400 mb-2">Reactive Trader</p>
              <p className="text-xs text-gray-400 leading-relaxed">Watches every candle. Interprets every move. Feels compelled to trade. Takes 3-5 trades per session. Most are B-grade. Net result: breakeven or negative after costs.</p>
            </div>
            <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/15">
              <p className="text-xs font-bold text-green-400 mb-2">Prepared Trader</p>
              <p className="text-xs text-gray-400 leading-relaxed">Watches for price at their pre-marked levels. Ignores everything else. Takes 0-1 trades per session. A-grade only. Net result: consistently positive with low drawdowns.</p>
            </div>
          </div>
          <div className="mt-4 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
            <p className="text-xs text-amber-400">💡 The paradox: doing LESS produces MORE. Because every trade you take is A-grade, your EV per trade is higher, your drawdown is lower, and your emotional capital is preserved for the trades that matter.</p>
          </div>
        </motion.div>
      </section>

      {/* S08 — Common Mistakes */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-4">What NOT to Do in Live Reading</h2>
          <div className="space-y-3">
            {[
              { mistake: 'Entering before the candle closes', fix: 'A candle can reverse entirely in its final minutes. Wait for the CLOSE. The 3-second delay between the close and your order is not a cost — it is insurance.' },
              { mistake: 'Seeing patterns that are not there', fix: 'Pareidolia — seeing faces in clouds. Your brain wants to find setups because you WANT to trade. If you have to squint to see the pattern, it is not a pattern.' },
              { mistake: 'Comparing live candles to textbook diagrams', fix: 'Textbook engulfing patterns are perfect. Real ones are messy. Focus on the PRINCIPLE (buyers overwhelmed sellers) not the pixel-perfect shape.' },
              { mistake: 'Watching every timeframe simultaneously', fix: 'Your pre-session routine set the HTF bias. In live, you watch ONE timeframe (your entry TF). Checking 4 timeframes every candle creates conflicting signals and paralysis.' },
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
          <h2 className="text-2xl font-extrabold mb-4">Live Reading Quick Reference</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { title: 'ENTER', body: 'All 5 conditions met. Quality trigger closed. You can explain the trade in one sentence. No hesitation.', color: 'border-green-500/20 bg-green-500/5' },
              { title: 'WAIT', body: 'At a zone but no trigger. Trigger quality marginal. Indecision candle. Need one more candle to confirm.', color: 'border-amber-500/20 bg-amber-500/5' },
              { title: 'SKIP', body: 'No HTF bias. Wrong session. Not at a level. Conflicting structure. News imminent. Emotional state impaired.', color: 'border-red-500/20 bg-red-500/5' },
              { title: 'Wait for the CLOSE', body: 'Never enter before the candle closes. The last minutes can reverse everything. Patience is not a weakness.', color: 'border-purple-500/20 bg-purple-500/5' },
              { title: 'Context > Pattern', body: 'The same candle means different things in different contexts. A bullish engulfing in a downtrend at supply is bearish bait.', color: 'border-sky-500/20 bg-sky-500/5' },
              { title: 'Zero Trades = Success', body: 'A session with no valid setups where you followed your rules is a WIN. Protecting capital IS trading.', color: 'border-pink-500/20 bg-pink-500/5' },
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
          <h2 className="text-2xl font-extrabold mb-2">Live Reading Game</h2>
          <p className="text-gray-400 text-sm mb-6">5 real-time decision scenarios. Apply the ENTER/WAIT/SKIP framework.</p>
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
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Outstanding — you can read live candles and make decisions under uncertainty.' : gameScore >= 3 ? 'Good — review the candle character guide and the patience paradox.' : 'Re-read the 5 principles of live reading and the decision framework.'}</p></motion.div>)}
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
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">🎯</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 7: Reading Live Price Action</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Live Reader &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L7.3-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
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
