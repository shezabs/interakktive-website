// app/academy/lesson/multi-timeframe-execution/page.tsx
// ATLAS Academy — Lesson 7.6: Multi-Timeframe Execution [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 7
// GROUNDBREAKING: Interactive MTF Decision Tree with branching scenarios
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
// ANIMATION 1: MTF Sync — Split screen showing 4H and 15M
// syncing in real-time. HTF provides direction, LTF provides entry.
// ============================================================
function MTFSyncAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.004;
    const pad = 20;
    const midY = h / 2;
    const topChart = { t: 38, b: midY - 10 };
    const botChart = { t: midY + 20, b: h - 15 };
    const seed = (n: number) => Math.sin(n * 127.1 + 311.7) * 0.5 + 0.5;
    const progress = Math.min(1, (t % 7) / 5.5);

    // Labels
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('4H — The Compass (Direction)', w / 2, 14);
    ctx.fillText('15M — The Sniper (Entry)', w / 2, midY + 14);

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath(); ctx.moveTo(pad, midY + 2); ctx.lineTo(w - pad, midY + 2); ctx.stroke();

    // 4H chart — 12 candles, clear uptrend with BOS
    const htfCandles = 12;
    const htfVis = Math.min(htfCandles, Math.floor(progress * htfCandles * 1.2));
    const htfData: number[] = [];
    let htfPrice = 2320;
    for (let i = 0; i < htfCandles; i++) {
      htfPrice += (seed(i * 5) - 0.35) * 10 + 3;
      htfData.push(htfPrice);
    }
    const htfMin = Math.min(...htfData) - 5;
    const htfMax = Math.max(...htfData) + 5;
    const htfRange = htfMax - htfMin || 1;
    const htfPy = (p: number) => topChart.b - ((p - htfMin) / htfRange) * (topChart.b - topChart.t);
    const htfCW = (w - pad * 2) / htfCandles;

    for (let i = 0; i < htfVis; i++) {
      const o = i === 0 ? 2320 : htfData[i - 1];
      const c = htfData[i];
      const bull = c >= o;
      const color = bull ? '#34d399' : '#ef4444';
      const x = pad + i * htfCW;
      const bodyT = htfPy(Math.max(o, c));
      const bodyB = htfPy(Math.min(o, c));
      ctx.fillStyle = color;
      ctx.fillRect(x + 2, bodyT, htfCW - 4, Math.max(2, bodyB - bodyT));
      ctx.strokeStyle = color; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + htfCW / 2, htfPy(Math.max(o, c) + (seed(i * 7) * 5)));
      ctx.lineTo(x + htfCW / 2, htfPy(Math.min(o, c) - (seed(i * 11) * 4)));
      ctx.stroke();
    }

    // BOS arrow on 4H
    if (htfVis >= 8) {
      const bosLevel = htfData[5];
      const bosY = htfPy(bosLevel);
      ctx.strokeStyle = 'rgba(52,211,153,0.4)'; ctx.setLineDash([3, 3]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(pad + 5 * htfCW, bosY); ctx.lineTo(w - pad, bosY); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#34d399'; ctx.font = 'bold 8px system-ui'; ctx.textAlign = 'left';
      ctx.fillText('4H BOS ✓', pad + 5 * htfCW + 5, bosY - 5);

      // Bias arrow
      ctx.fillStyle = '#34d399'; ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'right';
      ctx.fillText('BIAS: BULLISH ↑', w - pad, topChart.t + 5);
    }

    // 15M chart — 24 candles, pullback to OB then entry
    const ltfCandles = 24;
    const ltfVis = Math.min(ltfCandles, Math.floor(progress * ltfCandles * 1.5));
    const ltfData: number[] = [];
    let ltfPrice = 2345;
    for (let i = 0; i < ltfCandles; i++) {
      const noise = (seed(i * 3 + 50) - 0.5) * 5;
      let bias = 0;
      if (i < 6) bias = 3; // up with HTF
      else if (i < 10) bias = -4; // pullback
      else if (i === 10) bias = -3; // deep into OB
      else if (i === 11) bias = 8; // trigger
      else bias = 4; // continuation
      ltfPrice += noise + bias;
      ltfData.push(ltfPrice);
    }
    const ltfMin = Math.min(...ltfData) - 3;
    const ltfMax = Math.max(...ltfData) + 3;
    const ltfRange = ltfMax - ltfMin || 1;
    const ltfPy = (p: number) => botChart.b - ((p - ltfMin) / ltfRange) * (botChart.b - botChart.t);
    const ltfCW = (w - pad * 2) / ltfCandles;

    for (let i = 0; i < ltfVis; i++) {
      const o = i === 0 ? 2345 : ltfData[i - 1];
      const c = ltfData[i];
      const bull = c >= o;
      const color = bull ? '#34d399' : '#ef4444';
      const x = pad + i * ltfCW;
      const bodyT = ltfPy(Math.max(o, c));
      const bodyB = ltfPy(Math.min(o, c));
      const isTrigger = i === 11;

      if (isTrigger && ltfVis > 11) {
        ctx.fillStyle = 'rgba(245,158,11,0.1)';
        ctx.fillRect(x - 2, botChart.t, ltfCW + 4, botChart.b - botChart.t);
      }

      ctx.fillStyle = color;
      ctx.fillRect(x + 1, bodyT, ltfCW - 2, Math.max(1, bodyB - bodyT));
      ctx.strokeStyle = color; ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(x + ltfCW / 2, ltfPy(Math.max(o, c) + seed(i * 7 + 50) * 3));
      ctx.lineTo(x + ltfCW / 2, ltfPy(Math.min(o, c) - seed(i * 11 + 50) * 3));
      ctx.stroke();
    }

    // OB zone on 15M
    if (ltfVis >= 10) {
      const obTop = ltfData[9];
      const obBot = Math.min(ltfData[9], ltfData[10]) - 2;
      ctx.fillStyle = 'rgba(52,211,153,0.08)';
      ctx.fillRect(pad + 9 * ltfCW, ltfPy(obTop), (w - pad) - (pad + 9 * ltfCW), ltfPy(obBot) - ltfPy(obTop));
      ctx.fillStyle = 'rgba(52,211,153,0.4)'; ctx.font = '7px system-ui'; ctx.textAlign = 'left';
      ctx.fillText('15M OB', pad + 9 * ltfCW + 2, ltfPy(obTop) - 3);
    }

    // Entry marker
    if (ltfVis >= 12) {
      const entryY = ltfPy(ltfData[11]);
      const entryX = pad + 11.5 * ltfCW;
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath(); ctx.arc(entryX, entryY, 4, 0, Math.PI * 2); ctx.fill();
      ctx.font = 'bold 8px system-ui'; ctx.textAlign = 'left';
      ctx.fillText('ENTER ✓', entryX + 7, entryY + 3);
    }

    // Sync arrow between charts
    if (htfVis >= 8 && ltfVis >= 12) {
      const pulse = 0.5 + 0.5 * Math.sin(t * 3);
      ctx.strokeStyle = `rgba(245,158,11,${0.3 + pulse * 0.4})`;
      ctx.lineWidth = 2; ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(w / 2, topChart.b + 5);
      ctx.lineTo(w / 2, botChart.t - 5);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = `rgba(245,158,11,${0.5 + pulse * 0.5})`;
      ctx.font = 'bold 9px system-ui'; ctx.textAlign = 'center';
      ctx.fillText('4H says WHERE → 15M says WHEN', w / 2, midY + 5);
    }
  }, []);
  return <AnimScene drawFn={draw} height={380} />;
}

// ============================================================
// ANIMATION 2: The MTF Handshake — 3 timeframes agreeing
// ============================================================
function MTFHandshakeAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.006;
    const cx = w / 2;
    const cy = h / 2 + 5;
    const cycle = t % 7;
    const phase = Math.min(4, Math.floor(cycle * 0.8));

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('The MTF Handshake: All Timeframes Must Agree', cx, 16);

    const tfs = [
      { name: 'Daily', role: 'DIRECTION', check: 'Trend direction', x: cx - 120, y: cy - 30, r: 38, color: '#3b82f6' },
      { name: '4H', role: 'STRUCTURE', check: 'BOS / OB zones', x: cx, y: cy - 50, r: 42, color: '#f59e0b' },
      { name: '15M', role: 'ENTRY', check: 'Trigger + timing', x: cx + 120, y: cy - 30, r: 38, color: '#34d399' },
    ];

    // Connection lines
    for (let i = 0; i < tfs.length - 1; i++) {
      const a = tfs[i]; const b = tfs[i + 1];
      const connected = phase > i;
      ctx.strokeStyle = connected ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.06)';
      ctx.lineWidth = connected ? 2 : 1;
      ctx.beginPath(); ctx.moveTo(a.x + a.r, a.y); ctx.lineTo(b.x - b.r, b.y); ctx.stroke();
      if (connected) {
        ctx.fillStyle = '#f59e0b'; ctx.font = '8px system-ui'; ctx.textAlign = 'center';
        ctx.fillText('✓ ALIGNED', (a.x + b.x) / 2, Math.min(a.y, b.y) - 15);
      }
    }

    // Timeframe nodes
    tfs.forEach((tf, i) => {
      const active = phase >= i;
      const current = phase === i;
      const nodeR = current ? tf.r + Math.sin(t * 4) * 3 : tf.r;

      ctx.beginPath();
      ctx.arc(tf.x, tf.y, nodeR, 0, Math.PI * 2);
      ctx.fillStyle = active ? tf.color + '20' : 'rgba(255,255,255,0.02)';
      ctx.fill();
      ctx.strokeStyle = active ? tf.color : 'rgba(255,255,255,0.1)';
      ctx.lineWidth = active ? 2.5 : 1;
      ctx.stroke();

      ctx.fillStyle = active ? '#fff' : 'rgba(255,255,255,0.3)';
      ctx.font = 'bold 13px system-ui'; ctx.textAlign = 'center';
      ctx.fillText(tf.name, tf.x, tf.y - 5);
      ctx.font = '9px system-ui';
      ctx.fillStyle = active ? tf.color : 'rgba(255,255,255,0.2)';
      ctx.fillText(tf.role, tf.x, tf.y + 10);
      ctx.font = '8px system-ui';
      ctx.fillStyle = active ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)';
      ctx.fillText(tf.check, tf.x, tf.y + 22);
    });

    // Result
    if (phase >= 3) {
      const pulse = 0.5 + 0.5 * Math.sin(t * 3);
      const resultY = cy + 55;
      ctx.fillStyle = `rgba(52,211,153,${0.1 + pulse * 0.1})`;
      ctx.beginPath(); ctx.roundRect(cx - 110, resultY - 15, 220, 35, 10); ctx.fill();
      ctx.strokeStyle = `rgba(52,211,153,${0.3 + pulse * 0.3})`;
      ctx.lineWidth = 1.5; ctx.beginPath(); ctx.roundRect(cx - 110, resultY - 15, 220, 35, 10); ctx.stroke();
      ctx.fillStyle = '#34d399'; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'center';
      ctx.fillText('MTF HANDSHAKE COMPLETE ✅', cx, resultY + 5);
    }

    // Misalignment example
    if (phase < 3) {
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '9px system-ui'; ctx.textAlign = 'center';
      ctx.fillText('Waiting for all timeframes to agree...', cx, h - 10);
    }
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// INTERACTIVE MTF DECISION TREE — branching flowchart
// Student clicks through decisions at each timeframe level
// ============================================================
interface TreeNode {
  id: string;
  question: string;
  context: string;
  options: { label: string; nextId: string; feedback: string; isCorrect: boolean }[];
}

interface TreeScenario {
  title: string;
  instrument: string;
  setup: string;
  nodes: TreeNode[];
  finalOutcome: string;
}

const treeScenarios: TreeScenario[] = [
  {
    title: 'Gold Trend Continuation', instrument: 'XAUUSD', setup: 'You sit down for your London session. Your pre-session routine is complete.',
    nodes: [
      { id: 'daily', question: 'Step 1: What is the Daily telling you?', context: 'Daily chart shows: Higher lows, last BOS up at 2,310, price currently at 2,348. RSI at 58 — no divergence.', options: [
        { label: 'Daily is BULLISH — clear HLs and BOS up', nextId: '4h', feedback: 'Correct. Higher lows + BOS up + RSI with room = bullish bias confirmed. We trade LONG only.', isCorrect: true },
        { label: 'Daily is RANGING — no clear direction', nextId: 'skip', feedback: 'The HLs and BOS up clearly show bullish structure. This is not a range — it is an uptrend. Ranging means equal highs AND equal lows with no BOS.', isCorrect: false },
        { label: 'Daily is BEARISH — price will reverse here', nextId: 'skip', feedback: 'There is no evidence of bearish reversal. No CHoCH, no divergence, no exhaustion signal. Trading against a clear Daily trend is a Level 6 lesson violation.', isCorrect: false },
      ]},
      { id: '4h', question: 'Step 2: What does the 4H structure show?', context: '4H chart: BOS up at 2,335. Demand OB at 2,328-2,332 (unmitigated). Supply OB at 2,365. Price currently pulling back from 2,352.', options: [
        { label: '4H confirms bullish — BOS up, demand OB below current price. Wait for pullback to OB.', nextId: '15m', feedback: 'Correct. 4H aligns with Daily (both bullish). The demand OB at 2,328-2,332 is our zone of interest. We wait for price to pull back there.', isCorrect: true },
        { label: '4H is bearish because price is pulling back', nextId: 'skip', feedback: 'A pullback in an uptrend is NOT bearish. Pullbacks are how trends create entries. The 4H BOS up is intact — the structure is bullish. The pullback is the opportunity, not the threat.', isCorrect: false },
        { label: 'Enter long now at 2,348 — both timeframes are bullish', nextId: 'skip', feedback: 'Both timeframes agree on direction, but price is NOT at a key level. Entering at 2,348 with the OB at 2,328-2,332 means you are buying in no-man\'s-land with no structural stop and poor R:R.', isCorrect: false },
      ]},
      { id: '15m', question: 'Step 3: Price reaches 2,330 (inside your OB). What do you see on the 15M?', context: '15M shows: price entered the OB zone. Current candle is forming. Body is small, wicks on both sides — doji. Volume is below average.', options: [
        { label: 'ENTER — price is at the OB, that is enough', nextId: 'skip', feedback: 'Price at the OB is a ZONE, not a TRIGGER. A doji with low volume shows indecision, not buyer conviction. You need a quality trigger candle (engulfing, rejection wick, or LTF BOS) before entering.', isCorrect: false },
        { label: 'WAIT — doji is not a trigger. Watch for the next candle to show buyer conviction.', nextId: 'trigger', feedback: 'Correct. The doji shows the OB is being tested but buyers have not confirmed yet. Wait for the NEXT candle. If it closes bullish with above-average body and volume, that is your trigger.', isCorrect: true },
        { label: 'SKIP — doji means the OB will fail', nextId: 'skip', feedback: 'A doji does not mean failure — it means indecision. Many of the best OB entries show a doji BEFORE the trigger candle. Skipping here is premature. WAIT for the resolution, then decide.', isCorrect: false },
      ]},
      { id: 'trigger', question: 'Step 4: The next 15M candle closes as a strong bullish engulfing. Body is 1.5× the 5-candle average. Volume spikes above the 20-SMA. Kill Zone is active.', context: 'All conditions: Daily bullish ✓, 4H BOS + OB ✓, 15M at OB ✓, KZ active ✓, quality trigger ✓', options: [
        { label: 'ENTER LONG — all 5 conditions met. SL below OB, TP at 4H supply.', nextId: 'done', feedback: 'Correct! The MTF handshake is complete: Daily direction → 4H structure → 15M trigger. Entry at 2,331, SL at 2,325, TP1 at 2,343 (1:1), TP2 at 2,355 (1:2+). Execute within 3 seconds per Lesson 7.5.', isCorrect: true },
        { label: 'Wait for one more confirmation candle', nextId: 'skip', feedback: 'The trigger met ALL quality filters. Waiting for another candle is the confirmation addiction from Lesson 7.5. Each candle of delay degrades your R:R. The MTF handshake is complete — EXECUTE.', isCorrect: false },
        { label: 'Check the 1H and 4H again before entering', nextId: 'skip', feedback: 'This is the re-analysis loop (Lesson 7.5). Your pre-session routine ALREADY checked the HTF. The trigger is confirmed. Re-checking now costs time, degrades R:R, and does not add information.', isCorrect: false },
      ]},
    ],
    finalOutcome: 'Price rallied from the OB at 2,331 to 2,358 over the next 4 hours. TP1 hit at 2,343 (1:1), TP2 hit at 2,355 (1:2+). The MTF handshake delivered a textbook Model 1 continuation trade. The Daily showed WHERE to look, the 4H showed WHICH level, and the 15M showed WHEN to click.'
  },
  {
    title: 'EUR/USD Conflict — No Trade', instrument: 'EURUSD', setup: 'NY session. Pre-session routine complete.',
    nodes: [
      { id: 'daily', question: 'Step 1: Daily bias?', context: 'Daily chart: last 3 candles are dojis inside a 50-pip range. No BOS in either direction for 8 days. RSI at 52.', options: [
        { label: 'Daily is RANGING — no directional bias', nextId: '4h', feedback: 'Correct. Three dojis, 50-pip range, RSI at midpoint. This is textbook ranging. Your bias should be NEUTRAL until a BOS occurs.', isCorrect: true },
        { label: 'Daily is bullish — the dojis are just consolidation before a breakout up', nextId: 'skip', feedback: 'You cannot predict which direction a range will break. Assuming bullish without a BOS is bias injection, not analysis. Your Level 6 lesson on Model 1 requires a confirmed BOS.', isCorrect: false },
        { label: 'Daily is bearish — the stalling means sellers are absorbing', nextId: 'skip', feedback: 'Same problem in the opposite direction. Stalling can precede moves in EITHER direction. Without a BOS, you are guessing.', isCorrect: false },
      ]},
      { id: '4h', question: 'Step 2: 4H structure?', context: '4H shows equal highs at 1.0880 and equal lows at 1.0830. Price is oscillating between them. A BOS on the 4H would break one of these levels.', options: [
        { label: '4H confirms range — equal H/L, no BOS. No trade zone.', nextId: 'result', feedback: 'Correct. Daily ranging + 4H ranging = no directional edge. Your pre-session routine Phase 1 should have flagged this as NEUTRAL. Without HTF direction, any LTF setup is a coin flip.', isCorrect: true },
        { label: 'The equal lows are liquidity — short for a sweep below them', nextId: 'skip', feedback: 'Liquidity sweeps are valid in Model 2 (reversal) — but Model 2 requires HTF EXHAUSTION and DIVERGENCE. Neither exists here. The equal lows might get swept, but without directional bias, you do not know what happens after the sweep.', isCorrect: false },
        { label: 'Drop to 15M and find a setup within the range', nextId: 'skip', feedback: 'A 15M setup inside a ranging Daily and ranging 4H is noise trading. Your WR on setups without HTF bias drops 15-25%. The MTF handshake requires the higher timeframes to provide direction BEFORE the LTF provides entry.', isCorrect: false },
      ]},
      { id: 'result', question: 'Step 3: Your Decision?', context: 'Daily: ranging. 4H: ranging. No BOS, no direction, no edge. Your Kill Zone is active and you see price forming interesting patterns on the 15M.', options: [
        { label: 'NO TRADE — MTF handshake failed at Step 1. Move on.', nextId: 'done', feedback: 'Correct! A session with no valid MTF alignment is a SUCCESSFUL session if you follow your rules. The market is not offering a directional trade today. Protect your capital for when the handshake completes. This is discipline, not inaction.', isCorrect: true },
        { label: 'Take a range trade — buy low, sell high within the 50-pip range', nextId: 'skip', feedback: 'Range trading is a different model that requires different rules (range boundaries, mean reversion, tight targets). Your SMC-based system is designed for directional trades with HTF bias. Do not improvise a new model because you are bored.', isCorrect: false },
      ]},
    ],
    finalOutcome: 'EUR/USD continued ranging for 2 more days before breaking down through 1.0830 with a bearish BOS. Traders who forced entries during the range lost 3-5 trades on whipsaws. Traders who waited got a clean short setup AFTER the BOS. Patience paid: the post-breakout move was 80 pips in one session.'
  },
  {
    title: 'NASDAQ Reversal Setup', instrument: 'NAS100', setup: 'London session. Pre-session routine shows potential exhaustion.',
    nodes: [
      { id: 'daily', question: 'Step 1: Daily bias?', context: 'Daily: extended uptrend for 3 weeks. RSI at 78 (overbought). Last 2 candles show long upper wicks (rejection). RSI divergence forming — price made a higher high but RSI made a lower high.', options: [
        { label: 'Daily shows EXHAUSTION — RSI divergence + rejection wicks at highs', nextId: '4h', feedback: 'Correct. This is the first ingredient of a Model 2 reversal: HTF exhaustion. RSI divergence + rejection wicks signal that buyers are losing momentum. We watch for SHORT setups, not longs.', isCorrect: true },
        { label: 'Daily is bullish — uptrend for 3 weeks, keep buying', nextId: 'skip', feedback: 'The trend has been bullish, but exhaustion signals are flashing. Blindly buying into RSI divergence + rejection wicks is ignoring the warning signs. Level 6 Lesson 4 (Model 2) taught you to recognise these exactly.', isCorrect: false },
        { label: 'Skip — divergence is unreliable', nextId: 'skip', feedback: 'Divergence alone IS unreliable. But divergence + rejection wicks + extended trend = a meaningful exhaustion signal. The combination matters more than any single indicator.', isCorrect: false },
      ]},
      { id: '4h', question: 'Step 2: 4H structure?', context: '4H shows: price swept above the weekly high by 15 points, then a strong bearish candle brought it back below. A 4H CHoCH just occurred — price broke below the last higher low.', options: [
        { label: '4H confirms reversal setup — sweep above weekly high + CHoCH. Mark the supply OB from the CHoCH candle.', nextId: '15m', feedback: 'Correct! Sweep (liquidity grab above weekly high) + CHoCH (structural shift on 4H) = Model 2 reversal ingredients confirmed. The supply OB from the CHoCH candle is your entry zone. Now we wait for a 15M trigger.', isCorrect: true },
        { label: '4H CHoCH is just a pullback in the uptrend', nextId: 'skip', feedback: 'A CHoCH BY DEFINITION means the structure has shifted. Combined with the Daily exhaustion signals, this is a reversal in progress, not a pullback. The sweep + CHoCH combination is the Model 2 confirmation.', isCorrect: false },
        { label: 'Enter short immediately — the reversal is confirmed', nextId: 'skip', feedback: 'The HTF ingredients are confirmed but you need a LTF trigger at a specific level. Entering "immediately" at an arbitrary price violates the MTF handshake: the 15M has not provided WHEN yet.', isCorrect: false },
      ]},
      { id: '15m', question: 'Step 3: Price pulls back up to the 4H supply OB. 15M candle?', context: '15M shows: price rallied into the supply OB. Current candle: bearish engulfing with 1.8× average body size. Volume above 20-SMA. London KZ active.', options: [
        { label: 'ENTER SHORT — Daily exhaustion ✓, 4H sweep+CHoCH ✓, 15M trigger at OB ✓, KZ ✓', nextId: 'done', feedback: 'Correct! The full Model 2 MTF handshake: Daily exhaustion → 4H sweep + CHoCH → 15M bearish trigger at the supply OB during KZ. SL above the sweep high, TP at the 4H OB below (1:3 R:R potential). This is the trade that "feels scary" but has the highest R:R.', isCorrect: true },
        { label: 'WAIT — reversals are risky, need more confirmation', nextId: 'skip', feedback: 'Every condition in the Model 2 checklist is met. Waiting for "more" is the confirmation addiction from Lesson 7.5. Reversals DO have lower WR, but their R:R (1:3+) compensates. The MTF handshake is complete — execute.', isCorrect: false },
        { label: 'SKIP — never trade against the Daily trend', nextId: 'skip', feedback: 'The Daily is showing EXHAUSTION — this IS the Daily telling you the trend is changing. You are not trading "against" the Daily; you are trading WITH the Daily exhaustion signal. Model 2 exists specifically for this scenario.', isCorrect: false },
      ]},
    ],
    finalOutcome: 'NASDAQ reversed from the supply OB, dropping 280 points over the next 2 sessions. The Model 2 reversal delivered a 1:3.5 R:R trade. The key: every timeframe agreed that the trend was exhausted. Daily showed exhaustion, 4H confirmed the structural shift, 15M provided the entry. The MTF handshake caught the turn that continuation traders missed.'
  },
];

const gameRounds = [
  { scenario: 'Your Daily chart shows bullish structure (BOS up). Your 4H chart shows bearish CHoCH (broke below last HL). Your 15M shows a bullish engulfing at a demand zone. What should you do?',
    options: [
      { text: 'Enter long — the 15M trigger is valid and the Daily is bullish', correct: false, explain: 'The 4H CHoCH breaks the MTF alignment. Daily says bullish, but 4H just shifted bearish. This conflict means the handshake is INCOMPLETE. The 15M trigger is happening inside a timeframe disagreement — this is a low-probability entry.' },
      { text: 'WAIT — the 4H and Daily disagree. No trade until they realign.', correct: true, explain: 'Correct! MTF handshake requires ALL timeframes to agree. Daily bullish + 4H bearish CHoCH = CONFLICT. Wait for either: (a) the 4H to reclaim structure and realign with Daily, or (b) the Daily to show exhaustion confirming the 4H reversal. No alignment = no trade.' },
      { text: 'Enter short — the 4H CHoCH overrides the Daily', correct: false, explain: 'A 4H CHoCH does not automatically override a Daily trend. It COULD be the start of a reversal, but it could also be a deeper pullback before continuation. Without Daily exhaustion signals (divergence, rejection wicks), shorting against a Daily uptrend is premature.' },
      { text: 'Enter long with half size as a compromise', correct: false, explain: 'Half size does not resolve conflicting timeframes. A 50% position on a conflicted trade is still a conflicted trade — it just loses half as much. Resolve the conflict first, then trade at full conviction.' },
    ]
  },
  { scenario: 'You check all three timeframes: Daily bullish, 4H bullish with BOS and demand OB below, 15M approaching the OB during your Kill Zone. The MTF handshake is about to complete. But you realise you are trading a different instrument than the one you analysed in your pre-session routine. What happened?',
    options: [
      { text: 'Irrelevant — the MTF analysis is valid on any instrument', correct: false, explain: 'Your pre-session routine Phase 2 identified levels for a SPECIFIC instrument. Different instruments have different structures, different OBs, and different behaviour. The analysis does not transfer.' },
      { text: 'You switched instruments mid-session — a discipline break that invalidates the analysis', correct: true, explain: 'Correct! Your pre-session routine prepared you for ONE instrument. Switching mid-session means you are working without the full 6-phase preparation. The MTF analysis might look valid, but it was not built on your pre-session foundation. Either do a full routine for the new instrument or return to your planned one.' },
      { text: 'Continue — you can adapt your analysis on the fly', correct: false, explain: 'On-the-fly analysis during a Kill Zone is reactive, not prepared. Your HTF bias, key levels, news check, and risk limits were set for a different instrument. Adapting mid-session introduces errors that compound through the MTF chain.' },
      { text: 'Take the trade but set a tighter stop since you are less confident', correct: false, explain: 'Tighter stops do not compensate for lack of preparation. Your stop should be structural (below the OB), not emotional (tight because uncertain). Fix the process: either prepare properly or do not trade the instrument.' },
    ]
  },
  { scenario: 'Daily: bearish. 4H: bearish, supply OB at 1.2680 marked. 15M: price rallies INTO the supply OB. A bearish rejection candle closes with a long upper wick. Volume is average (not above 20-SMA). Body is slightly below the 5-candle average. What do you do?',
    options: [
      { text: 'ENTER SHORT — the OB rejection is clear', correct: false, explain: 'The rejection candle shows the right pattern but fails TWO quality filters: volume is average (not above 20-SMA) and body is below the 5-candle average. This is a B-grade trigger. Your Level 6 Lesson 5 criteria require BOTH filters to pass.' },
      { text: 'WAIT — rejection looks good but volume and body size fail the quality filters. Watch the next candle.', correct: true, explain: 'Correct! The MTF direction is clear (Daily + 4H bearish) and price is at the right level (supply OB). But the trigger quality is marginal. Wait for the next candle: a bearish follow-through with better volume would confirm. Or drop to the 5M for a BOS as an alternative trigger.' },
      { text: 'Enter with a wider stop since the trigger is weak', correct: false, explain: 'A wider stop does not fix a weak trigger — it worsens your R:R. If the trigger does not meet your quality standards, the answer is WAIT for a better one, not enter with worse risk parameters.' },
      { text: 'SKIP — average volume means the level will fail', correct: false, explain: 'Average volume does not guarantee failure. It means the test is inconclusive. The level could still hold — it just needs a stronger signal. WAIT is the correct response, not SKIP. The MTF alignment is too strong to dismiss over one marginal candle.' },
    ]
  },
  { scenario: 'You complete the full MTF handshake: Daily bullish, 4H BOS + OB, 15M trigger at OB, KZ active. You enter long. 20 minutes later, a new 4H candle closes as a large bearish engulfing that creates a 4H CHoCH below the OB you entered from. Your trade is -6 pips. What do you do?',
    options: [
      { text: 'Close immediately — the 4H just invalidated your thesis', correct: false, explain: 'Your stop was placed below the OB for a reason — that is where your thesis is genuinely wrong. A 4H CHoCH is significant, but if your stop has not been hit, the trade is still alive. The 4H candle shifts the BIAS but does not override your structural stop.' },
      { text: 'Hold — your stop is structural and has not been hit. The 4H change is concerning but the trade plan was set at entry.', correct: true, explain: 'Correct! The 4H CHoCH changes the future outlook (you would NOT take a new long now), but your existing trade has a plan: SL at X, TP at Y. If the SL is not hit, the trade is valid. However, move your TP1 closer or take partials earlier — the change in 4H structure means the full runner is less likely.' },
      { text: 'Add to the position — price is now at a better entry', correct: false, explain: 'A 4H CHoCH just occurred and you want to ADD? This is averaging down into a deteriorating thesis. The conditions that justified the original entry have changed. Manage the existing position — do not compound it.' },
      { text: 'Move your stop to breakeven immediately', correct: false, explain: 'Your trade is -6 pips — there is no breakeven to move to. Moving to entry price means the slightest pullback stops you out. The structural stop exists for exactly this situation: protect your capital if the thesis is FULLY invalidated, not if it is slightly threatened.' },
    ]
  },
  { scenario: 'You analyse 3 instruments for your London session: XAUUSD (Daily bullish, 4H pulling back), GBPUSD (Daily bearish, 4H at supply), EURUSD (Daily ranging). Which gives you the best MTF starting point?',
    options: [
      { text: 'EURUSD — ranging Daily means price could go either way, maximum flexibility', correct: false, explain: 'A ranging Daily is the WORST starting point. MTF handshake Step 1 requires directional bias. Ranging = neutral = no edge. "Flexibility" is another word for "no direction."' },
      { text: 'GBPUSD — Daily bearish + 4H at supply = both timeframes aligned for a short', correct: true, explain: 'Correct! Daily bearish + 4H at supply OB = the strongest MTF alignment. Two timeframes already agree on direction AND level. You only need to wait for a 15M bearish trigger at the supply zone. This has the highest probability starting point because the handshake is already 2/3 complete before the session even starts.' },
      { text: 'XAUUSD — Gold always moves more, better for trading', correct: false, explain: '"More movement" does not equal better MTF alignment. XAUUSD Daily is bullish but 4H is pulling back — the handshake is only 1/3 complete (direction yes, level not yet reached). GBPUSD is 2/3 complete. Start where the alignment is strongest.' },
      { text: 'All three — trade whatever gives a trigger first', correct: false, explain: 'Trading 3 instruments simultaneously divides your attention and degrades your execution on each. Your pre-session routine Phase 2 prepared you for specific levels on specific instruments. Pick the one with the strongest MTF alignment and commit.' },
    ]
  },
];

const quizQuestions = [
  { q: 'What are the 3 timeframes in the MTF handshake, and what role does each play?', opts: ['1M (entry), 5M (confirmation), 15M (direction)', 'Daily (direction), 4H (structure + levels), 15M (entry trigger)', '1H (direction), 30M (structure), 5M (entry)', 'Weekly (direction), Daily (structure), 1H (entry)'], correct: 1 },
  { q: 'The Daily is bullish, the 4H is bearish (CHoCH down), and the 15M shows a bullish trigger at a demand zone. Should you enter?', opts: ['Yes — the Daily and 15M agree', 'No — the 4H conflict breaks the MTF handshake', 'Yes — two out of three timeframes is enough', 'Enter with half size'], correct: 1 },
  { q: 'What does "4H says WHERE, 15M says WHEN" mean?', opts: ['4H identifies the direction, 15M identifies the key level', '4H identifies the key level (OB/FVG), 15M provides the entry trigger and timing at that level', '4H sets the stop loss, 15M sets the take profit', 'They are interchangeable'], correct: 1 },
  { q: 'When should you SKIP a trade despite having a valid 15M trigger?', opts: ['When the 15M trigger has perfect quality filters', 'When the HTF timeframes conflict or show no directional bias', 'When the trade is in your Kill Zone', 'When you feel confident about the setup'], correct: 1 },
  { q: 'The MTF handshake is 2/3 complete: Daily bearish, 4H at supply OB. What is the final step?', opts: ['Enter short immediately', 'Wait for a 15M bearish trigger candle at the 4H supply OB during your Kill Zone', 'Check the 1H chart for confirmation', 'Set a pending order at the OB'], correct: 1 },
  { q: 'After entering a trade, the 4H structure shifts against you but your stop has not been hit. What is the correct response?', opts: ['Close immediately — HTF changed', 'Hold — your stop is structural. Consider taking partials earlier due to the HTF shift.', 'Add to the position at a better price', 'Move to breakeven'], correct: 1 },
  { q: 'You have 3 instruments available. GBPUSD has Daily+4H alignment for shorts. EURUSD Daily is ranging. XAUUSD Daily is bullish but 4H is pulling back. Which has the strongest MTF starting point?', opts: ['EURUSD — ranging means flexibility', 'XAUUSD — Gold moves more', 'GBPUSD — 2/3 of the handshake is already complete', 'All three — maximize opportunity'], correct: 2 },
  { q: 'Why is the MTF handshake more reliable than single-timeframe analysis?', opts: ['More timeframes = more indicators', 'Each timeframe filters out noise from the one below — direction from Daily, structure from 4H, precision from 15M', 'It takes longer so you make fewer mistakes', 'Lower timeframes are always more accurate'], correct: 1 },
];

function Confetti({ active }: { active: boolean }) {
  if (!active) return null;
  return (<div className="fixed inset-0 pointer-events-none z-50">{Array.from({ length: 60 }).map((_, i) => (<motion.div key={i} initial={{ y: -20, x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400), opacity: 1 }} animate={{ y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 20, rotate: Math.random() * 720, opacity: 0 }} transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5 }} className="absolute w-2 h-2 rounded-sm" style={{ background: ['#f59e0b', '#d946ef', '#34d399', '#3b82f6', '#ef4444'][i % 5] }} />))}</div>);
}

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

export default function MultiTimeframeExecutionLesson() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);

  const [openRule, setOpenRule] = useState<number | null>(null);

  // Decision Tree State
  const [treeScenario, setTreeScenario] = useState(0);
  const [treeNodeId, setTreeNodeId] = useState('daily');
  const [treeHistory, setTreeHistory] = useState<{ nodeId: string; chosen: number; correct: boolean }[]>([]);
  const [treeComplete, setTreeComplete] = useState(false);
  const [treeScore, setTreeScore] = useState(0);
  const [treeScenariosComplete, setTreeScenariosComplete] = useState<boolean[]>(Array(treeScenarios.length).fill(false));

  const currentTree = treeScenarios[treeScenario];
  const currentNode = currentTree.nodes.find(n => n.id === treeNodeId);

  const handleTreeChoice = (optIdx: number) => {
    if (!currentNode) return;
    const opt = currentNode.options[optIdx];
    const newHistory = [...treeHistory, { nodeId: treeNodeId, chosen: optIdx, correct: opt.isCorrect }];
    setTreeHistory(newHistory);

    if (opt.isCorrect) {
      if (opt.nextId === 'done') {
        setTreeComplete(true);
        setTreeScore(s => s + 1);
        const next = [...treeScenariosComplete]; next[treeScenario] = true; setTreeScenariosComplete(next);
      } else {
        setTreeNodeId(opt.nextId);
      }
    } else {
      // Wrong answer — show feedback, mark scenario complete but no score
      setTreeComplete(true);
      const next = [...treeScenariosComplete]; next[treeScenario] = true; setTreeScenariosComplete(next);
    }
  };

  const handleNextTree = () => {
    if (treeScenario < treeScenarios.length - 1) {
      setTreeScenario(s => s + 1);
      setTreeNodeId('daily');
      setTreeHistory([]);
      setTreeComplete(false);
    }
  };

  const lastChoice = treeHistory.length > 0 ? treeHistory[treeHistory.length - 1] : null;
  const lastNode = lastChoice ? currentTree.nodes.find(n => n.id === lastChoice.nodeId) : null;
  const lastOpt = lastNode && lastChoice ? lastNode.options[lastChoice.chosen] : null;

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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 7 &middot; Lesson 6</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Multi-Timeframe<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Execution</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">The Daily tells you WHERE. The 4H tells you WHICH level. The 15M tells you WHEN. Navigate the MTF decision tree and learn to execute only when all three agree.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* S00 */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">🔍 The Air Traffic Controller</p>
            <p className="text-gray-400 leading-relaxed mb-4">An air traffic controller does not look at one radar screen. They have three: one for the region (where is the plane coming from?), one for the airport zone (which runway is it approaching?), and one for the final approach (is it aligned for landing?). All three must agree before clearing a landing. If the regional radar shows the plane but the approach radar shows a crosswind — no landing.</p>
            <p className="text-gray-400 leading-relaxed">Your Daily chart is the regional radar. Your 4H is the airport zone. Your 15M is the final approach. A trade that looks perfect on the 15M but conflicts with the 4H or Daily is a plane trying to land in a crosswind — technically possible, statistically dangerous. The MTF handshake clears your trade for landing only when all three screens agree.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">A trading firm analysed <strong className="text-white">2,400 trades</strong> across 8 traders. Trades with full MTF alignment (Daily + 4H + 15M): <strong className="text-green-400">54% WR, 1:2.1 R:R</strong>. Trades with only single-timeframe analysis: <strong className="text-red-400">41% WR, 1:1.3 R:R</strong>. Trades with conflicting timeframes: <strong className="text-red-400">34% WR, 1:0.9 R:R</strong> (net negative). The MTF-aligned trades were <strong className="text-amber-400">3.8× more profitable per trade</strong> than single-TF entries.</p>
          </div>
        </motion.div>
      </section>

      {/* S01 — MTF Sync Animation */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Two-Screen View</p>
          <h2 className="text-2xl font-extrabold mb-4">4H Compass + 15M Sniper</h2>
          <p className="text-gray-400 text-sm mb-6">The 4H shows bullish structure with a demand OB. The 15M shows price pulling back to that exact OB and forming a trigger. When both sync, the entry appears. This is the MTF handshake in action.</p>
          <MTFSyncAnimation />
        </motion.div>
      </section>

      {/* S02 — MTF Handshake Animation */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Handshake</p>
          <h2 className="text-2xl font-extrabold mb-4">All Three Timeframes Must Agree</h2>
          <p className="text-gray-400 text-sm mb-6">Daily provides DIRECTION. 4H provides STRUCTURE and levels. 15M provides the ENTRY trigger. When all three align, the handshake completes and you have permission to trade.</p>
          <MTFHandshakeAnimation />
        </motion.div>
      </section>

      {/* S03 — The 3 Roles */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The 3 Roles</p>
          <h2 className="text-2xl font-extrabold mb-4">What Each Timeframe Does</h2>
          <div className="space-y-3">
            {[
              { tf: 'Daily', role: 'THE COMPASS', desc: 'Answers: "Which direction do I trade?" Look for trend direction (HH/HL or LH/LL), BOS/CHoCH, and exhaustion signals (divergence). If the Daily is ranging, your bias is NEUTRAL and you wait.', color: 'border-blue-500/20 bg-blue-500/5', what: 'Bullish, Bearish, or Neutral', icon: '🧭' },
              { tf: '4H', role: 'THE MAP', desc: 'Answers: "Where is my entry zone?" Look for BOS confirming Daily direction, unmitigated OBs and FVGs, and premium/discount zones. The 4H identifies WHERE on the map price will give you the best R:R entry.', color: 'border-amber-500/20 bg-amber-500/5', what: 'OB/FVG levels, structure, key zones', icon: '🗺️' },
              { tf: '15M', role: 'THE TRIGGER', desc: 'Answers: "Is it time to click?" Look for trigger candles (engulfing, rejection, LTF BOS) at the 4H level, quality filters (body size, volume), and Kill Zone timing. The 15M is the last gate before execution.', color: 'border-green-500/20 bg-green-500/5', what: 'Trigger quality, timing, execution', icon: '🎯' },
            ].map((tf, i) => (
              <div key={i} className={`p-5 rounded-xl border ${tf.color}`}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{tf.icon}</span>
                  <div><p className="text-sm font-bold text-white">{tf.tf} — {tf.role}</p><p className="text-xs text-gray-500">{tf.what}</p></div>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{tf.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
            <p className="text-xs text-amber-400">💡 Think of it as a relay race: Daily hands the baton (direction) to 4H, who hands it (level) to 15M, who crosses the finish line (entry). If any runner drops the baton, the trade does not complete.</p>
          </div>
        </motion.div>
      </section>

      {/* S04 — Conflict Resolution Rules */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; When Timeframes Disagree</p>
          <h2 className="text-2xl font-extrabold mb-4">Conflict Resolution Rules</h2>
          <div className="space-y-3">
            {[
              { conflict: 'Daily BULLISH + 4H BEARISH (CHoCH)', rule: 'WAIT. Could be a deeper pullback (4H re-aligns bullish) OR the start of a Daily reversal (need Daily exhaustion signals). No trade until resolved.', severity: 'HIGH CONFLICT' },
              { conflict: 'Daily RANGING + 4H has setups', rule: 'NO TRADE. A ranging Daily means no directional edge. 4H setups without Daily direction are coin flips. Wait for a Daily BOS.', severity: 'CRITICAL CONFLICT' },
              { conflict: 'Daily + 4H ALIGNED + 15M no trigger', rule: 'WAIT. Direction and level are confirmed — only the timing is missing. Keep watching for a trigger. This is patience, not skipping.', severity: 'INCOMPLETE — WAIT' },
              { conflict: 'Daily + 4H + 15M ALL ALIGNED', rule: 'EXECUTE. This is the completed handshake. Every condition is met. Hesitating here is the execution gap from Lesson 7.1.', severity: 'HANDSHAKE COMPLETE ✅' },
            ].map((item, i) => (
              <div key={i} className="rounded-xl border border-white/5 overflow-hidden">
                <button onClick={() => setOpenRule(openRule === i ? null : i)} className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
                  <p className="text-sm font-bold text-white text-left flex-1">{item.conflict}</p>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ml-2 ${openRule === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openRule === i && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="px-4 pb-4 space-y-2">
                  <p className={`text-xs font-bold ${item.severity.includes('COMPLETE') ? 'text-green-400' : item.severity.includes('WAIT') ? 'text-amber-400' : 'text-red-400'}`}>{item.severity}</p>
                  <p className="text-sm text-gray-400 leading-relaxed">{item.rule}</p>
                </div></motion.div>)}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S05 — INTERACTIVE MTF DECISION TREE */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; MTF Decision Tree</p>
          <h2 className="text-2xl font-extrabold mb-4">Navigate the Handshake — Live</h2>
          <p className="text-gray-400 text-sm mb-6">Step through real MTF scenarios. At each timeframe, make a decision. The tree branches based on your choice — just like live trading. 3 scenarios: continuation, no-trade, and reversal.</p>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
            {/* Scenario tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {treeScenarios.map((s, i) => (
                <button key={i} disabled={i !== treeScenario && !treeScenariosComplete[i]} onClick={() => { if (treeScenariosComplete[i] || i === treeScenario) { setTreeScenario(i); setTreeNodeId('daily'); setTreeHistory([]); setTreeComplete(false); }}} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${i === treeScenario ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : treeScenariosComplete[i] ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-white/[0.03] text-gray-600 border border-white/5'}`}>
                  {treeScenariosComplete[i] ? '✓ ' : ''}{i + 1}. {s.title}
                </button>
              ))}
              <span className="text-xs font-mono text-gray-500 self-center ml-2">{treeScore}/{treeScenariosComplete.filter(Boolean).length} correct</span>
            </div>

            {/* Setup */}
            <div className="p-3 rounded-lg bg-white/[0.02]">
              <p className="text-xs font-bold text-amber-400 mb-1">{currentTree.title} — {currentTree.instrument}</p>
              <p className="text-xs text-gray-400">{currentTree.setup}</p>
            </div>

            {/* Progress breadcrumbs */}
            <div className="flex gap-2 items-center">
              {['Daily', '4H', '15M', 'Trigger'].map((step, i) => {
                const stepIds = ['daily', '4h', '15m', 'trigger'];
                const visited = treeHistory.some(h => h.nodeId === stepIds[i]);
                const isCurrent = treeNodeId === stepIds[i] && !treeComplete;
                return (<div key={i} className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold ${visited ? 'bg-green-500/20 text-green-400' : isCurrent ? 'bg-amber-500/20 text-amber-400' : 'bg-white/[0.03] text-gray-600'}`}>{step}</span>
                  {i < 3 && <span className="text-gray-700">→</span>}
                </div>);
              })}
            </div>

            {/* Current question */}
            {currentNode && !treeComplete && (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                  <p className="text-sm font-bold text-white mb-1">{currentNode.question}</p>
                  <p className="text-xs text-gray-400">{currentNode.context}</p>
                </div>
                <div className="space-y-2">
                  {currentNode.options.map((opt, oi) => (
                    <button key={oi} onClick={() => handleTreeChoice(oi)} className="w-full text-left p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-amber-500/30 transition-all text-sm text-gray-300">{opt.label}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback on wrong answer or completion */}
            {treeComplete && lastOpt && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <div className={`p-4 rounded-xl border ${lastOpt.isCorrect ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                  <p className="text-sm font-bold mb-2">{lastOpt.isCorrect ? '✅ Handshake Complete!' : '❌ Wrong Path'}</p>
                  <p className="text-xs text-gray-400 leading-relaxed mb-2">{lastOpt.feedback}</p>
                  <p className="text-xs text-gray-500 italic">{currentTree.finalOutcome}</p>
                </div>
                {treeScenario < treeScenarios.length - 1 && (
                  <button onClick={handleNextTree} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Scenario →</button>
                )}
                {treeScenario === treeScenarios.length - 1 && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                    <p className="text-lg font-extrabold text-amber-400">{treeScore}/3 Scenarios Navigated Correctly</p>
                    <p className="text-xs text-gray-400 mt-1">{treeScore >= 3 ? 'Outstanding — you navigate the MTF handshake like a professional.' : treeScore >= 2 ? 'Good — review the scenario you missed and identify where the handshake broke.' : 'Review all 3 roles (Daily/4H/15M) and the conflict resolution rules.'}</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </section>

      {/* S06 — The Hierarchy Rule */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; The Hierarchy Rule</p>
          <h2 className="text-2xl font-extrabold mb-4">Higher Always Wins</h2>
          <p className="text-gray-400 text-sm mb-6">When timeframes disagree, the higher timeframe has authority. A 15M bullish trigger in a Daily downtrend is noise. A Daily reversal signal overrules a 4H continuation. The hierarchy is absolute.</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/15 text-center"><p className="text-3xl mb-2">👑</p><p className="text-xs font-bold text-blue-400">Daily</p><p className="text-[10px] text-gray-500">Supreme Authority</p></div>
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15 text-center"><p className="text-3xl mb-2">⭐</p><p className="text-xs font-bold text-amber-400">4H</p><p className="text-[10px] text-gray-500">Structure Authority</p></div>
            <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/15 text-center"><p className="text-3xl mb-2">🎯</p><p className="text-xs font-bold text-green-400">15M</p><p className="text-[10px] text-gray-500">Entry Only</p></div>
          </div>
          <div className="mt-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
            <p className="text-xs text-red-400 font-bold">🚫 A 15M signal can NEVER override a Daily or 4H direction. If you find yourself saying "but the 15M looks great," check if the higher timeframes agree. If they do not, the 15M signal is a trap.</p>
          </div>
        </motion.div>
      </section>

      {/* S07 — Practical MTF Workflow */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Your Daily Workflow</p>
          <h2 className="text-2xl font-extrabold mb-4">The Practical Step-by-Step</h2>
          <div className="space-y-3">
            {[
              { when: 'Evening before', action: 'Open Daily chart. Mark trend direction (arrow), last BOS/CHoCH, RSI state. Write bias: BULLISH/BEARISH/NEUTRAL. Takes 2 minutes.' },
              { when: 'Pre-session (Phase 1-2)', action: 'Open 4H chart. Confirm alignment with Daily. Mark demand/supply OBs, FVGs, liquidity pools. Identify 3-5 key levels. Takes 3-5 minutes.' },
              { when: 'Kill Zone opens', action: 'Open 15M chart ONLY. Watch for price to approach your 4H levels. Pre-position with alerts 2 pips before the level (Lesson 7.5).' },
              { when: 'Price at level', action: 'Watch for trigger candle. Assess quality (body, volume, session). If trigger meets criteria → 3-second execution. If no trigger → WAIT.' },
              { when: 'After execution', action: 'Do NOT go back to the 4H or Daily until the trade is closed. Your entry timeframe is 15M — manage on 15M. Re-checking HTF mid-trade creates doubt.' },
            ].map((step, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="w-24 flex-shrink-0"><p className="text-xs font-bold text-amber-400">{step.when}</p></div>
                <p className="text-xs text-gray-400 leading-relaxed">{step.action}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S08 — Common Mistakes */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-4">What NOT to Do</h2>
          <div className="space-y-3">
            {[
              { mistake: 'Checking 4 timeframes simultaneously during the Kill Zone', fix: 'Analysis paralysis. Your pre-session routine set the HTF context. During the KZ, watch ONE timeframe (15M). Switching between 4 charts every candle creates conflicting signals and delayed execution.' },
              { mistake: 'Taking 15M setups that conflict with the Daily', fix: 'A 15M bullish engulfing in a Daily downtrend is the market baiting retail traders. The Daily structure will reassert itself in most cases. The 15M is the ENTRY mechanism, not the DIRECTION mechanism.' },
              { mistake: 'Forcing MTF alignment by cherry-picking timeframes', fix: '"The 4H disagrees but the 2H sort of agrees" — this is bias injection. Use the same 3 timeframes (Daily/4H/15M) consistently. Adding or changing timeframes to match your desired outcome is confirmation bias.' },
              { mistake: 'Re-checking the Daily after entering a trade', fix: 'The Daily does not change meaningfully during your trade (it is one candle per day). Re-checking it mid-trade creates doubt about a decision that was already made. Trust the analysis from your pre-session routine.' },
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
          <h2 className="text-2xl font-extrabold mb-4">MTF Execution Quick Reference</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { title: 'Daily = Direction', body: 'Bullish, Bearish, or Neutral. Ranging = no trade. Check once (evening or pre-session).', color: 'border-blue-500/20 bg-blue-500/5' },
              { title: '4H = Structure', body: 'BOS/CHoCH, OBs, FVGs, key levels. Must align with Daily. Check in pre-session.', color: 'border-amber-500/20 bg-amber-500/5' },
              { title: '15M = Trigger', body: 'Entry candle quality + timing. Only matters when price reaches a 4H level during KZ.', color: 'border-green-500/20 bg-green-500/5' },
              { title: 'Conflict = No Trade', body: 'If Daily and 4H disagree, no 15M trigger can fix it. Wait for realignment.', color: 'border-red-500/20 bg-red-500/5' },
              { title: 'Higher Wins', body: 'Daily > 4H > 15M. Always. A 15M signal never overrides Daily direction.', color: 'border-purple-500/20 bg-purple-500/5' },
              { title: 'One Screen in KZ', body: 'Analyse on 3 timeframes pre-session. Execute on 1 timeframe (15M) during KZ.', color: 'border-cyan-500/20 bg-cyan-500/5' },
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
          <h2 className="text-2xl font-extrabold mb-2">MTF Execution Game</h2>
          <p className="text-gray-400 text-sm mb-6">5 scenarios testing your MTF decision-making across timeframe conflicts, handshake completion, and post-entry management.</p>
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
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Outstanding — you execute the MTF handshake with precision.' : gameScore >= 3 ? 'Good — review the conflict resolution rules and the hierarchy principle.' : 'Re-read the 3 roles and the decision tree scenarios, then try again.'}</p></motion.div>)}
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
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-blue-500 to-amber-500 flex items-center justify-center text-3xl shadow-lg shadow-blue-500/30">🧭</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 7: Multi-Timeframe Execution</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-blue-400 via-amber-400 to-green-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; MTF Navigator &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L7.6-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
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
