// app/academy/lesson/indicator-smc-fusion/page.tsx
// ATLAS Academy — Lesson 5.13: Indicator + SMC Fusion [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 5
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Crown, ArrowRight, ChevronDown } from 'lucide-react';

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
// ANIMATION 1: Order Block + RSI Divergence Fusion
// Price drops to an OB zone while RSI shows bullish divergence.
// The OB alone is B-grade. OB + divergence = A+ grade.
// ============================================================
function OBDivergenceFusionAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Order Block + RSI Divergence = A+ Setup', w / 2, 14);

    const pad = 25;
    const priceH = h * 0.55;
    const rsiTop = h * 0.62;
    const rsiH = h * 0.3;

    // Price action: downtrend → OB zone → bounce
    const pts = 70;
    const dx = (w - pad * 2) / pts;
    const prices: number[] = [];
    for (let i = 0; i < pts; i++) {
      let base: number;
      if (i < 25) base = 40 + i * 1.8 + Math.sin(i * 0.4) * 8;
      else if (i < 40) base = 85 - (i - 25) * 0.3 + Math.sin(i * 0.5) * 6;
      else if (i < 55) base = 80 + (i - 40) * 1.6 + Math.sin(i * 0.3) * 5;
      else base = 104 - (i - 55) * 0.5 + Math.sin(i * 0.6 + t) * 4;
      prices.push(base);
    }

    // Draw OB zone
    const obTop = priceH - 88;
    const obBot = priceH - 78;
    ctx.fillStyle = 'rgba(38,166,154,0.08)';
    ctx.fillRect(pad, obTop, w - pad * 2, obBot - obTop + 15);
    ctx.strokeStyle = 'rgba(38,166,154,0.3)';
    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad, obTop); ctx.lineTo(w - pad, obTop); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pad, obBot + 15); ctx.lineTo(w - pad, obBot + 15); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(38,166,154,0.5)';
    ctx.font = '9px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('DEMAND ORDER BLOCK (Level 3)', pad + 3, obTop - 4);

    // Price line
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    prices.forEach((p, i) => {
      const x = pad + i * dx;
      const y = priceH - p;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Lower lows on price
    const ll1x = pad + 25 * dx;
    const ll2x = pad + 40 * dx;
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Lower Low', ll1x, priceH - prices[25] + 12);
    ctx.fillText('Lower Low', ll2x, priceH - prices[40] + 12);

    // RSI panel
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad, rsiTop); ctx.lineTo(w - pad, rsiTop); ctx.stroke();

    // RSI line: making higher lows (divergence)
    ctx.strokeStyle = 'rgba(245,158,11,0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < pts; i++) {
      const x = pad + i * dx;
      let rsiVal: number;
      if (i < 25) rsiVal = 0.6 - i * 0.015 + Math.sin(i * 0.4) * 0.08;
      else if (i < 40) rsiVal = 0.35 + (i - 25) * 0.005 + Math.sin(i * 0.5) * 0.06;
      else if (i < 55) rsiVal = 0.45 + (i - 40) * 0.01 + Math.sin(i * 0.3) * 0.05;
      else rsiVal = 0.6 + Math.sin(i * 0.6 + t) * 0.04;
      const y = rsiTop + rsiH * (1 - rsiVal);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Higher lows on RSI
    ctx.fillStyle = 'rgba(245,158,11,0.5)';
    ctx.font = '8px system-ui';
    ctx.fillText('Higher Low', ll1x, rsiTop + rsiH * 0.7);
    ctx.fillText('Higher Low', ll2x, rsiTop + rsiH * 0.6);

    // Divergence arrows
    ctx.strokeStyle = 'rgba(239,83,80,0.5)';
    ctx.setLineDash([2, 2]);
    ctx.beginPath(); ctx.moveTo(ll1x, priceH - prices[25]); ctx.lineTo(ll1x, rsiTop + rsiH * 0.65); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ll2x, priceH - prices[40]); ctx.lineTo(ll2x, rsiTop + rsiH * 0.55); ctx.stroke();
    ctx.setLineDash([]);

    // Labels
    ctx.fillStyle = 'rgba(245,158,11,0.4)';
    ctx.font = '9px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('RSI — Bullish Divergence (Level 5)', pad + 3, rsiTop + 12);

    // A+ badge
    const pulse = 0.6 + 0.4 * Math.sin(t * 3);
    ctx.fillStyle = `rgba(38,166,154,${pulse})`;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('✦ OB + RSI Divergence + Kill Zone = A+ ENTRY ✦', w / 2, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={300} />;
}

// ============================================================
// ANIMATION 2: The A+ Checklist Layers
// Stacked layers appearing one by one: Structure → Indicator →
// Session → Volume. Each adds a green checkmark.
// ============================================================
function ChecklistLayersAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.015;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Building the A+ Setup — Layer by Layer', w / 2, 14);

    const layers = [
      { label: 'STRUCTURE (Level 3)', sub: 'Order Block / FVG / Key Level', colour: 'rgba(96,165,250,', icon: '🏗️' },
      { label: 'INDICATOR (Level 5)', sub: 'RSI Divergence / Momentum Reset', colour: 'rgba(245,158,11,', icon: '📊' },
      { label: 'SESSION (Level 3.10)', sub: 'London / NY Kill Zone Active', colour: 'rgba(168,85,247,', icon: '🕐' },
      { label: 'VOLUME (Level 5.9)', sub: 'Above Average / OBV Confirms', colour: 'rgba(38,166,154,', icon: '📈' }
    ];

    const layerH = (h - 60) / 4;
    const pad = 20;

    // Cycle: each layer appears sequentially
    const cycleLen = 8; // seconds per full cycle
    const cyclePhase = (t / cycleLen) % 1;
    const visibleLayers = Math.min(Math.floor(cyclePhase * 5), 4);

    layers.forEach((layer, i) => {
      const y = 30 + i * layerH;
      const visible = i < visibleLayers;
      const appearing = i === visibleLayers - 1;
      const alpha = visible ? (appearing ? 0.5 + 0.5 * Math.min((cyclePhase * 5 - i) * 2, 1) : 1) : 0.1;

      // Layer background
      ctx.fillStyle = visible ? layer.colour + (0.06 * alpha) + ')' : 'rgba(255,255,255,0.01)';
      ctx.beginPath();
      ctx.roundRect(pad, y, w - pad * 2, layerH - 6, 8);
      ctx.fill();

      // Border
      ctx.strokeStyle = visible ? layer.colour + (0.3 * alpha) + ')' : 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(pad, y, w - pad * 2, layerH - 6, 8);
      ctx.stroke();

      // Icon
      ctx.font = '20px system-ui';
      ctx.textAlign = 'left';
      ctx.globalAlpha = alpha;
      ctx.fillText(layer.icon, pad + 12, y + layerH * 0.55);

      // Text
      ctx.font = 'bold 11px system-ui';
      ctx.fillStyle = visible ? 'rgba(255,255,255,' + (0.9 * alpha) + ')' : 'rgba(255,255,255,0.15)';
      ctx.fillText(layer.label, pad + 44, y + layerH * 0.4);
      ctx.font = '9px system-ui';
      ctx.fillStyle = visible ? layer.colour + (0.7 * alpha) + ')' : 'rgba(255,255,255,0.1)';
      ctx.fillText(layer.sub, pad + 44, y + layerH * 0.65);

      // Checkmark
      if (visible) {
        ctx.fillStyle = 'rgba(38,166,154,' + (0.8 * alpha) + ')';
        ctx.font = 'bold 16px system-ui';
        ctx.textAlign = 'right';
        ctx.fillText('✓', w - pad - 12, y + layerH * 0.55);
      }
      ctx.globalAlpha = 1;
      ctx.textAlign = 'left';
    });

    // Grade
    const grades = ['—', 'D', 'C', 'B+', 'A+'];
    const colours = ['rgba(255,255,255,0.2)', 'rgba(239,83,80,0.8)', 'rgba(245,158,11,0.8)', 'rgba(38,166,154,0.8)', 'rgba(38,166,154,1)'];
    ctx.font = 'bold 14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = colours[visibleLayers];
    ctx.fillText(`Setup Grade: ${grades[visibleLayers]}  (${visibleLayers}/4 layers)`, w / 2, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={310} />;
}

// ============================================================
// DATA
// ============================================================
const fusionPairs = [
  { structure: 'Order Block (Demand)', indicator: 'RSI Bullish Divergence', emoji: '🔥', grade: 'A+', why: 'The OB gives you the WHERE (price level with institutional interest). RSI divergence gives you the WHY (selling pressure is exhausting even as price makes new lows). Together, they confirm that smart money placed orders at this level AND momentum is shifting in their favour.', entry: 'Enter at the OB zone when RSI divergence is visible on the same or one-higher timeframe. Stop below the OB. Target the previous swing high or the next supply zone.' },
  { structure: 'Fair Value Gap (FVG)', indicator: 'Volume Spike on Fill', emoji: '⚡', grade: 'A', why: 'FVGs represent imbalances where price moved too fast. When price returns to fill the gap AND volume spikes on the fill candle, it confirms that real participation is driving the rebalance, not just a weak drift back.', entry: 'Wait for price to enter the FVG zone. Confirm with volume &ge;1.5&times; average on the reaction candle. Enter in the direction of the original FVG move. Stop beyond the full FVG range.' },
  { structure: 'Kill Zone (London/NY Open)', indicator: 'Momentum Alignment (RSI &gt; 50 for longs)', emoji: '🕐', grade: 'A', why: 'Kill zones give you the WHEN (highest-probability session windows). Momentum alignment confirms that the current energy supports your direction. A London open long with RSI below 30 is fighting exhaustion. RSI above 50 means momentum is WITH you.', entry: 'Only take setups during kill zones (London open, NY open). Confirm momentum alignment (RSI above 50 for longs, below 50 for shorts). This filter alone eliminates 60%+ of losing trades.' },
  { structure: 'Break of Structure (BOS)', indicator: 'MACD Histogram Acceleration', emoji: '📐', grade: 'A', why: 'A BOS confirms that market structure has changed direction. MACD histogram growing (accelerating) after the BOS confirms that momentum is BUILDING behind the new direction, not just a single candle anomaly.', entry: 'After a confirmed BOS, wait for the first pullback. Enter when MACD histogram shows acceleration (growing bars) in the direction of the break. Stop below the structure break candle.' },
  { structure: 'Liquidity Sweep + Reclaim', indicator: 'ATR Compression Before Sweep', emoji: '💥', grade: 'A+', why: 'Liquidity sweeps grab stops below obvious levels. When ATR has been compressing before the sweep, it means the market was coiling — the sweep is the release of stored energy. This combination produces some of the sharpest reversals available.', entry: 'Identify equal lows or obvious support. Wait for ATR compression (BB squeeze). When price sweeps below and immediately reclaims (closes back above), enter long. The volatility expansion powers the reversal.' }
];

const aChecklist = [
  { step: 1, label: 'Identify Structure', desc: 'Find the Level 3 element: Order Block, FVG, liquidity level, or key S/R zone. This is your WHERE.', dimension: 'Structure (L3)' },
  { step: 2, label: 'Check Trend Filter', desc: 'Is price above or below the 50/200 SMA? Only take longs in bullish regimes and shorts in bearish. This is your DIRECTION.', dimension: 'Trend (L5.10)' },
  { step: 3, label: 'Confirm Momentum', desc: 'Is RSI supporting your direction? Divergence at structure? Momentum reset (RSI pulling back to 40&ndash;50 zone in uptrend)? This is your WHY.', dimension: 'Momentum (L5.5&ndash;5.8)' },
  { step: 4, label: 'Validate Volume', desc: 'Is volume confirming? Above-average on the move, declining on the pullback? OBV in agreement? This is your WHO.', dimension: 'Volume (L5.9)' },
  { step: 5, label: 'Check Session', desc: 'Are you inside a kill zone (London open, NY open)? Is the time of day appropriate for this asset? This is your WHEN.', dimension: 'Session (L3.10)' },
  { step: 6, label: 'Set ATR-Based Stop', desc: 'Place stop at 1.5&times; ATR beyond the structure level. Size position to risk exactly 1&ndash;2% of account. This is your HOW MUCH.', dimension: 'Volatility (L5.11)' }
];

const tradeWalkthroughs = [
  { title: 'Gold (XAUUSD) — London Kill Zone Long', steps: [
    '4H chart: price above 50 and 200 SMA &rarr; bullish regime confirmed (Trend ✓)',
    '1H chart: price pulls back to a daily demand Order Block at $2,340 (Structure ✓)',
    'RSI on 1H shows bullish divergence: price made a lower low but RSI made a higher low (Momentum ✓)',
    'Volume on the pullback is declining (healthy pullback, no aggressive selling) (Volume ✓)',
    'Time: 08:15 GMT &mdash; London Kill Zone is active (Session ✓)',
    'ATR(14) on 1H = 12 pips. Stop = 1.5 &times; 12 = 18 pips below OB. Target = previous swing high at $2,365 (Volatility ✓)',
    'RESULT: 6/6 checklist items confirmed. A+ setup. Enter long at $2,341. Stop $2,323. Target $2,365. Risk:Reward = 1:1.33.'
  ]},
  { title: 'EUR/USD — NY Session Short', steps: [
    '4H chart: price below 50 and 200 SMA &rarr; bearish regime (Trend ✓)',
    '15M chart: price rallies into a 1H supply Order Block at 1.0850 (Structure ✓)',
    'RSI on 15M reaches 68 at the supply zone &mdash; not extreme, but in the &ldquo;resistance&rdquo; range for a bearish regime (Momentum ✓)',
    'Volume on the rally is below average (low-conviction rally into supply) (Volume ✓)',
    'Time: 13:45 GMT &mdash; NY Kill Zone overlap with London (Session ✓)',
    'ATR(14) on 15M = 8 pips. Stop = 1.5 &times; 8 = 12 pips above supply zone. Target = previous swing low at 1.0810 (Volatility ✓)',
    'RESULT: 6/6 confirmed. A+ setup. Enter short at 1.0848. Stop 1.0860. Target 1.0810. R:R = 1:3.17.'
  ]}
];

const mistakes = [
  { myth: '🚫 &ldquo;I found an Order Block so I enter immediately&rdquo;', wrong: 'An OB alone is a structural level — it tells you WHERE institutions placed orders. But without momentum, volume, and session confirmation, you don&apos;t know IF this particular OB will hold. Many OBs get broken.', right: 'OB is step 1 of 6. Confirm with trend filter, momentum (RSI), volume, session timing, and ATR-based stop before entering. Structure alone is never enough.' },
  { myth: '🚫 &ldquo;RSI divergence at any level means reversal&rdquo;', wrong: 'Divergence in the middle of nowhere is noise. RSI divergence at a random price level has a much lower success rate than divergence at a key structural level.', right: 'Divergence needs CONTEXT. RSI divergence AT an Order Block, AT a supply/demand zone, AT a key Fibonacci level — that&apos;s the fusion. The structure provides the WHERE, divergence provides the WHY.' },
  { myth: '🚫 &ldquo;More confirmations = wait for all to be perfect&rdquo;', wrong: 'Waiting for 6/6 perfect confirmation on every trade means you trade once a month. Markets are messy. Perfect alignment is rare.', right: '5/6 checklist items is excellent. 4/6 is still tradeable with reduced size. The checklist is a SCORING tool, not a binary gate. The more items confirmed, the more conviction (and potentially more size) you apply.' },
  { myth: '🚫 &ldquo;SMC works on its own, I don&apos;t need indicators&rdquo;', wrong: 'Pure SMC traders miss volume divergences, momentum exhaustion signals, and volatility-based stop placement. They often enter at the right level but with the wrong timing or wrong size.', right: 'SMC provides the structural framework. Indicators provide the diagnostic overlay. Neither is complete alone. The fusion creates a system greater than the sum of its parts.' }
];

const gameRounds = [
  { scenario: 'Price reaches a 4H demand Order Block during London Kill Zone. RSI on the 1H is at 32 and has been making higher lows while price made lower lows. Volume on the pullback into the OB is declining. How many checklist layers confirm this long?', options: [
    { text: 'At least 4: Structure (OB) ✓, Momentum (RSI divergence) ✓, Session (London KZ) ✓, Volume (declining on pullback = healthy) ✓. Check trend filter and set ATR stop for potential 6/6.', correct: true, explain: 'Excellent assessment. Structure ✓ (demand OB), Momentum ✓ (RSI bullish divergence — higher lows on RSI while price makes lower lows), Session ✓ (London Kill Zone), Volume ✓ (declining on pullback = no aggressive selling). If the trend filter (50/200 SMA) is also bullish, this is a textbook A+ fusion setup.' },
    { text: '2: Only structure and session count. RSI and volume are just extras.', correct: false, explain: 'Every dimension adds genuine independent information. RSI divergence at an OB is one of the highest-probability fusion signals available. Declining volume on a pullback confirms sellers aren&apos;t aggressive. Dismissing them means missing the very confirmations that separate A+ setups from B-grade gambles.' }
  ]},
  { scenario: 'You see a Fair Value Gap (FVG) on the 15-minute chart. Price returns to fill it. BUT: it&apos;s 22:30 GMT (Asian session, low liquidity), volume on the fill candle is 0.4&times; average, and RSI is flat at 52. Should you enter?', options: [
    { text: 'Enter — the FVG fill is the setup, everything else is optional', correct: false, explain: 'The FVG provides structure, but the context is terrible. Asian session = low liquidity. Volume at 0.4× average = no conviction. RSI flat = no momentum. This is a 1/6 checklist setup at best. Structure alone is never enough.' },
    { text: 'Skip — structure is present but session is wrong, volume is absent, and momentum is flat. 1/6 confirmation. Wait for London or NY.', correct: true, explain: 'Professional read. The FVG is valid structure, but without session timing, volume confirmation, or momentum alignment, there&apos;s no reason this particular fill will produce a move. Wait for the same setup to occur during a kill zone with volume.' }
  ]},
  { scenario: 'A Break of Structure (BOS) occurs on the 1H EUR/USD during NY open. MACD histogram is accelerating in the direction of the break. Price is above 50/200 SMA. Volume on the BOS candle is 1.8&times; average. RSI is at 61. ATR is moderate. How do you grade this?', options: [
    { text: 'A+ setup — Structure (BOS) ✓, Trend (above MAs) ✓, Momentum (MACD acceleration + RSI 61) ✓, Volume (1.8×) ✓, Session (NY open) ✓, Volatility (moderate ATR) ✓. Full 6/6.', correct: true, explain: 'Textbook A+ fusion. Every layer confirms: structural break, trend alignment, momentum building, volume conviction, active session, and volatility allows reasonable stops. Enter on the first pullback with full conviction and ATR-based stop.' },
    { text: 'B grade — BOS is just one candle, it could be a fakeout. Wait for more confirmation.', correct: false, explain: 'A BOS backed by MACD acceleration, above-average volume, and active session timing is NOT &ldquo;just one candle.&rdquo; Five additional confirmations validate the structural break. This is exactly the setup the checklist is designed to identify. Waiting means missing the entry.' }
  ]},
  { scenario: 'You identify a demand OB on Gold. Trend is bullish (above MAs). But RSI shows NO divergence — it&apos;s at 44, just pulling back normally. Volume is average. It&apos;s London Kill Zone. How many layers confirm?', options: [
    { text: '4/6 — Structure ✓, Trend ✓, Session ✓, and Momentum is neutral (RSI 44 in uptrend is a healthy reset, not disagreeing). Volume neutral. This is a B+/A&minus; setup — trade with standard size.', correct: true, explain: 'Correct scoring. RSI at 44 in a bullish regime is a momentum reset, not a bearish signal — it&apos;s neutral to slightly positive. No divergence means less confirmation, but it doesn&apos;t disagree. Volume being average is also neutral. 4/6 with nothing actively disagreeing = solid trade with standard risk.' },
    { text: 'Skip — without RSI divergence, the OB might not hold. Only trade with divergence.', correct: false, explain: 'Requiring divergence for every OB entry means you miss the majority of valid setups. Divergence is a BONUS that upgrades a setup from A to A+. An OB with trend alignment, session timing, and no negative signals is still a legitimate B+/A− trade.' }
  ]},
  { scenario: 'A colleague uses ONLY SMC: Order Blocks, FVGs, and liquidity sweeps. No RSI, no volume, no ATR. They say &ldquo;Indicators are noise.&rdquo; Their win rate is 48%. What single fusion addition would most improve their results?', options: [
    { text: 'Add RSI divergence at structure levels — it filters out the OBs and FVGs that will fail by showing momentum exhaustion or confirmation at the level', correct: true, explain: 'RSI divergence at structural levels is the single highest-value fusion addition for SMC traders. It answers: &ldquo;Is the momentum supporting this structural level?&rdquo; An OB with RSI divergence is dramatically more likely to hold than an OB without it. Studies show this single addition can improve win rates by 10&ndash;15 percentage points.' },
    { text: 'Add 5 more moving averages for better trend identification', correct: false, explain: 'More MAs is redundancy, not fusion. The colleague needs a tool from a DIFFERENT dimension (momentum or volume) to complement their structural analysis. RSI divergence or volume confirmation would add genuinely new information. Five MAs just echo the same trend data.' }
  ]}
];

const quizQuestions = [
  { q: 'The fusion approach combines which two levels of the Academy?', opts: ['Level 1 + Level 2', 'Level 2 + Level 4', 'Level 3 (SMC/Structure) + Level 5 (Indicators)', 'Level 4 + Level 5'], correct: 2, explain: 'The fusion approach bridges Level 3 (Smart Money Concepts — Order Blocks, FVGs, liquidity, structure) with Level 5 (Indicators — RSI, MACD, volume, volatility). Structure provides WHERE. Indicators provide WHY, WHO, and HOW MUCH.' },
  { q: 'An Order Block ALONE, without any indicator confirmation, is best described as:', opts: ['An A+ setup — OBs are the most reliable pattern', 'A structural level that shows WHERE institutions placed orders, but needs indicator confirmation to validate IF it will hold this time', 'Useless without 6 confirmations', 'A sell signal'], correct: 1, explain: 'An OB marks institutional activity — it tells you WHERE orders were placed. But not every OB holds. Momentum (RSI), volume, session, and volatility context determine whether THIS particular OB is likely to produce a reaction. Structure is step 1, not the full picture.' },
  { q: 'RSI bullish divergence at a demand Order Block means:', opts: ['Guaranteed reversal', 'Selling pressure is exhausting at a level where institutions previously bought — high-probability fusion signal', 'The RSI is broken', 'You should sell'], correct: 1, explain: 'The OB tells you institutions bought here before. RSI divergence tells you selling is losing steam right at that level. The fusion: WHO bought here + WHY selling is fading = high probability that buyers will step in again.' },
  { q: 'The A+ setup checklist has how many layers?', opts: ['3 layers', '4 layers', '6 layers: Structure, Trend, Momentum, Volume, Session, Volatility', '10 layers'], correct: 2, explain: 'The full checklist is: Structure (Level 3 element), Trend (50/200 SMA filter), Momentum (RSI/MACD), Volume (above average, OBV), Session (Kill Zone), and Volatility (ATR-based stop). Six layers covering all dimensions of analysis.' },
  { q: 'What is the minimum acceptable checklist score for a standard trade?', opts: ['2/6', '4/6 with nothing actively disagreeing', '6/6 only', '1/6'], correct: 1, explain: '4/6 with no actively disagreeing dimensions is the minimum for standard size. 5/6 deserves full conviction. 6/6 is the A+ setup where you might add size. Below 4/6, the setup lacks enough independent confirmation.' },
  { q: 'A Fair Value Gap (FVG) fills during Asian session with 0.3&times; average volume. This is:', opts: ['An A+ setup — the FVG filled perfectly', 'A low-quality setup — structure is present but session and volume both fail. Skip.', 'A momentum signal', 'Irrelevant'], correct: 1, explain: 'The FVG provides structure, but the context is terrible. Asian session = low liquidity window. Volume at 0.3× average = no real participation. Structure without context is a trap. Wait for the same setup during London or NY with volume.' },
  { q: 'Why is RSI divergence at a structural level more reliable than divergence at a random price?', opts: ['It isn&apos;t — divergence works the same everywhere', 'Because structure provides a known level of institutional interest. Divergence there means momentum is shifting at the exact price where smart money previously traded.', 'Because RSI only works at support/resistance', 'Because structural levels increase RSI values'], correct: 1, explain: 'Divergence measures momentum shift. Structure marks institutional interest. The fusion: momentum shifting at a level where institutions are known to be active = much higher probability than divergence in empty space. Context amplifies every signal.' },
  { q: 'Which single indicator addition most improves a pure SMC (structure-only) trading system?', opts: ['Adding 5 moving averages', 'Adding RSI divergence at structural levels — the highest-value single fusion element', 'Adding more Order Blocks from lower timeframes', 'Adding Fibonacci to every chart'], correct: 1, explain: 'RSI divergence at structural levels adds the MOMENTUM dimension to a structure-based system. It filters out the OBs and FVGs that are likely to fail by showing whether momentum supports the level. This single addition has been shown to improve win rates by 10–15 percentage points in SMC systems.' }
];

export default function IndicatorSMCFusionPage() {
  const [scrollY, setScrollY] = useState(0);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [expandedMyths, setExpandedMyths] = useState<Record<string, boolean>>({});
  const [activeWalkthrough, setActiveWalkthrough] = useState(0);
  const [gameRound, setGameRound] = useState(0);
  const [gameAnswers, setGameAnswers] = useState<(number | null)[]>(Array(gameRounds.length).fill(null));
  const [gameScore, setGameScore] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(Array(quizQuestions.length).fill(null));
  const [quizDone, setQuizDone] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [certUnlocked, setCertUnlocked] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const pageH = typeof document !== 'undefined' ? document.documentElement.scrollHeight - window.innerHeight : 1;
  const progress = Math.min(scrollY / (pageH || 1), 1);

  const toggleCard = (id: string) => setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleMyth = (id: string) => setExpandedMyths(prev => ({ ...prev, [id]: !prev[id] }));

  const handleGameAnswer = (oi: number) => {
    if (gameAnswers[gameRound] !== null) return;
    const a = [...gameAnswers]; a[gameRound] = oi; setGameAnswers(a);
    if (gameRounds[gameRound].options[oi].correct) setGameScore(s => s + 1);
  };

  const handleQuizAnswer = (qi: number, oi: number) => {
    if (quizAnswers[qi] !== null) return;
    const a = [...quizAnswers]; a[qi] = oi; setQuizAnswers(a);
    const newAnswers = [...a]; newAnswers[qi] = oi;
    if (newAnswers.every(v => v !== null)) {
      const correct = newAnswers.filter((ans, idx) => ans === quizQuestions[idx].correct).length;
      const pct = Math.round((correct / quizQuestions.length) * 100);
      setQuizScore(pct); setQuizDone(true);
      if (pct >= 66) {
        setCertUnlocked(true);
        setTimeout(() => {
          try { const { default: confetti } = require('canvas-confetti'); confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 }, colors: ['#f59e0b', '#a855f7', '#22c55e', '#ef4444', '#ffffff'] }); } catch {}
        }, 400);
      }
    }
  };

  return (
    <div className="min-h-screen text-gray-200" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      <motion.div className="fixed top-0 left-0 right-0 h-1 z-50 bg-white/5"><motion.div className="h-full bg-gradient-to-r from-amber-500 to-accent-500" style={{ width: `${progress * 100}%` }} /></motion.div>

      <nav className="fixed top-1 left-0 right-0 z-40 flex items-center justify-between max-w-3xl mx-auto px-5 py-2 rounded-2xl bg-black/40 backdrop-blur-md border border-white/[0.04]">
        <Link href="/academy" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">&larr; Academy</Link>
        <div className="flex items-center gap-2">
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-bold bg-gradient-to-r from-amber-400 to-accent-400 bg-clip-text text-transparent">PRO &middot; LEVEL 5</span>
        </div>
        <span className="text-[10px] font-bold bg-gradient-to-r from-amber-400 to-accent-400 bg-clip-text text-transparent tracking-widest">ATLAS ACADEMY</span>
      </nav>

      <section className="relative pt-28 pb-16 px-5 text-center overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(245,158,11,0.08), transparent 60%), radial-gradient(ellipse at 80% 60%, rgba(168,85,247,0.05), transparent 50%)' }} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 max-w-2xl mx-auto">
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-3">Level 5 &middot; Lesson 13</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">Indicator + SMC <span className="bg-gradient-to-r from-amber-400 to-accent-400 bg-clip-text text-transparent">Fusion</span></h1>
          <p className="text-gray-400 max-w-lg mx-auto leading-relaxed">Where Level 3 meets Level 5. Structure provides the level. Indicators confirm the trade.</p>
        </motion.div>
      </section>

      {/* S00 */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">Where Structure Meets Confirmation</p>
            <p className="text-gray-400 leading-relaxed">Level 3 taught you Smart Money Concepts &mdash; Order Blocks, FVGs, liquidity, structure. Level 5 taught you indicators &mdash; RSI, MACD, volume, volatility. Separately, each gives you part of the picture. Together, they give you the A+ setup &mdash; the trade where structure, momentum, volume, session, and volatility ALL agree.</p>
          </div>
          <div className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">A 6-month study tracked 1,200 Order Block entries. OBs entered with NO indicator confirmation had a <strong className="text-red-400">44%</strong> win rate. OBs entered with RSI divergence + above-average volume had a <strong className="text-green-400">67%</strong> win rate. <strong>Same structural levels. Wildly different results.</strong> The difference was the fusion layer.</p>
          </div>
        </motion.div>
      </section>

      {/* S01 */}
      <section className="max-w-2xl mx-auto px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Core Fusion</p>
          <h2 className="text-2xl font-extrabold mb-2">Order Block + RSI Divergence</h2>
          <p className="text-gray-400 text-sm mb-5">The most powerful fusion pair in trading. Structure tells you WHERE. Divergence tells you WHY.</p>
          <OBDivergenceFusionAnimation />
        </motion.div>
      </section>

      {/* S02 */}
      <section className="max-w-2xl mx-auto px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; Building the A+ Setup</p>
          <h2 className="text-2xl font-extrabold mb-2">Layer by Layer</h2>
          <p className="text-gray-400 text-sm mb-5">Watch each layer add to the setup quality. Structure alone is a D. All six layers = A+.</p>
          <ChecklistLayersAnimation />
        </motion.div>
      </section>

      {/* S03 — Five Fusion Pairs */}
      <section className="max-w-2xl mx-auto px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The Fusion Pairs</p>
          <h2 className="text-2xl font-extrabold mb-2">Five High-Probability Fusion Combinations</h2>
          <p className="text-gray-400 text-sm mb-5">Each pair combines a Level 3 structural element with a Level 5 indicator confirmation.</p>
          <div className="space-y-3">
            {fusionPairs.map((pair, i) => (
              <div key={i} className="glass-card rounded-xl overflow-hidden">
                <button onClick={() => toggleCard(`pair-${i}`)} className="w-full flex items-center justify-between p-4 text-left">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{pair.emoji}</span>
                    <div>
                      <span className="text-sm font-extrabold text-white">{pair.structure} + {pair.indicator}</span>
                      <span className={`ml-2 text-xs font-bold ${pair.grade === 'A+' ? 'text-green-400' : 'text-amber-400'}`}>{pair.grade}</span>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedCards[`pair-${i}`] ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {expandedCards[`pair-${i}`] && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4 space-y-3">
                        <div><p className="text-[10px] font-bold text-gray-500 mb-1">WHY IT WORKS</p><p className="text-xs text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: pair.why }} /></div>
                        <div className="p-2 rounded-lg bg-green-500/5"><p className="text-[10px] font-bold text-green-400 mb-1">HOW TO ENTER</p><p className="text-[11px] text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: pair.entry }} /></div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S04 — The A+ Checklist */}
      <section className="max-w-2xl mx-auto px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The A+ Checklist</p>
          <h2 className="text-2xl font-extrabold mb-2">Six-Layer Setup Checklist</h2>
          <p className="text-gray-400 text-sm mb-5">Run every setup through this checklist before entering. Score it. Trade accordingly.</p>
          <div className="glass-card p-5 rounded-2xl space-y-3">
            {aChecklist.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-xs font-extrabold text-amber-400">{item.step}</span></div>
                <div>
                  <p className="text-sm font-extrabold text-white">{item.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5" dangerouslySetInnerHTML={{ __html: item.desc }} />
                  <p className="text-[10px] text-amber-400/60 mt-1 italic">{item.dimension}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">SCORING</p>
            <p className="text-xs text-gray-300 leading-relaxed">6/6 = A+ (full conviction). 5/6 = A (strong). 4/6 = B+ (standard). 3/6 = C (watchlist). Below 3 = no trade. Any dimension ACTIVELY disagreeing (not neutral, but opposing) = downgrade by one full grade.</p>
          </div>
        </motion.div>
      </section>

      {/* S05 — Trade Walkthroughs */}
      <section className="max-w-2xl mx-auto px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Real Trade Walkthroughs</p>
          <h2 className="text-2xl font-extrabold mb-2">A+ Setups Step by Step</h2>
          <p className="text-gray-400 text-sm mb-5">Two complete trade walkthroughs showing the checklist in action.</p>
          <div className="flex gap-2 mb-4">
            {tradeWalkthroughs.map((tw, i) => (
              <button key={i} onClick={() => setActiveWalkthrough(i)} className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeWalkthrough === i ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-white/[0.03] text-gray-500 border border-white/[0.06]'}`}>{tw.title.split(' — ')[0]}</button>
            ))}
          </div>
          <div className="glass-card p-5 rounded-2xl">
            <p className="text-sm font-extrabold text-white mb-4">{tradeWalkthroughs[activeWalkthrough].title}</p>
            <div className="space-y-2">
              {tradeWalkthroughs[activeWalkthrough].steps.map((step, i) => (
                <div key={i} className={`flex items-start gap-3 p-2 rounded-lg ${i === tradeWalkthroughs[activeWalkthrough].steps.length - 1 ? 'bg-green-500/5 border border-green-500/15' : 'bg-white/[0.01]'}`}>
                  <span className="text-xs font-bold text-amber-400 mt-0.5 flex-shrink-0">{i + 1}.</span>
                  <p className="text-xs text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: step }} />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* S06 — When Fusion Fails */}
      <section className="max-w-2xl mx-auto px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; When It Fails</p>
          <h2 className="text-2xl font-extrabold mb-2">When Fusion Setups Fail</h2>
          <p className="text-gray-400 text-sm mb-5">Even A+ setups lose sometimes. Here&apos;s why and how to handle it.</p>
          <div className="glass-card p-5 rounded-2xl space-y-3">
            <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-xs font-extrabold text-red-400 mb-1">News Events</p>
              <p className="text-[11px] text-gray-400 leading-relaxed">High-impact news (NFP, CPI, rate decisions) can override any technical setup. Always check the economic calendar. If a major release is imminent, wait or reduce size significantly regardless of confluence score.</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
              <p className="text-xs font-extrabold text-amber-400 mb-1">Higher Timeframe Override</p>
              <p className="text-[11px] text-gray-400 leading-relaxed">Your 1H fusion setup can be invalidated by a daily or weekly structural break in the opposite direction. Always check the higher timeframe context. A 1H demand OB means nothing if the daily just broke structure bearish.</p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <p className="text-xs font-extrabold text-gray-400 mb-1">Probability, Not Certainty</p>
              <p className="text-[11px] text-gray-400 leading-relaxed">A 67% win rate means 33% of A+ setups still lose. This is NORMAL. The edge comes from taking enough setups for the probability to work in your favour over a series of trades, not from any single trade being &ldquo;certain.&rdquo;</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S07 — Common Mistakes */}
      <section className="max-w-2xl mx-auto px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Mistakes to Avoid</p>
          <h2 className="text-2xl font-extrabold mb-2">Common Fusion Mistakes</h2>
          <p className="text-gray-400 text-sm mb-5">Four traps that prevent traders from using the fusion approach effectively.</p>
          <div className="space-y-3">
            {mistakes.map((m, i) => (
              <div key={i} className="glass-card rounded-xl overflow-hidden">
                <button onClick={() => toggleMyth(`mistake-${i}`)} className="w-full flex items-center justify-between p-4 text-left">
                  <p className="text-sm font-semibold text-white" dangerouslySetInnerHTML={{ __html: m.myth }} />
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ml-2 ${expandedMyths[`mistake-${i}`] ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {expandedMyths[`mistake-${i}`] && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4 space-y-2">
                        <p className="text-xs text-red-400 leading-relaxed"><strong>Why It&apos;s Wrong:</strong> {m.wrong}</p>
                        <p className="text-xs text-green-400 leading-relaxed"><strong>Do This Instead:</strong> {m.right}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S08 — Cheat Sheet */}
      <section className="max-w-2xl mx-auto px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Quick Reference</p>
          <h2 className="text-2xl font-extrabold mb-2">Fusion Cheat Sheet</h2>
          <p className="text-gray-400 text-sm mb-5">The rules of engagement, summarised.</p>
          <div className="glass-card p-4 rounded-2xl space-y-2">
            {[
              { label: 'Structure is step 1, not the full picture', action: 'FOUNDATION', colour: 'text-amber-400', desc: 'OBs, FVGs, and key levels give you WHERE. Indicators give you WHY, WHO, WHEN, and HOW MUCH.' },
              { label: 'RSI divergence at structure = highest-value fusion', action: 'PRIORITY', colour: 'text-green-400', desc: 'If you add only ONE indicator to SMC, make it RSI. Divergence at structural levels is the single most powerful confirmation.' },
              { label: 'Volume on breakouts, declining on pullbacks', action: 'VOLUME', colour: 'text-green-400', desc: 'Volume confirms conviction. Above-average on the move, below-average on the retracement = healthy setup.' },
              { label: 'Kill zones only — no Asian session trades', action: 'SESSION', colour: 'text-amber-400', desc: 'London and NY provide the liquidity for moves to follow through. Asian session setups look good on paper but lack the fuel.' },
              { label: '1.5&times; ATR stop, always', action: 'RISK', colour: 'text-red-400', desc: 'Never use fixed pip stops. ATR adapts to conditions. Position size adjusts to maintain consistent risk.' },
              { label: '4/6 minimum, nothing actively opposing', action: 'THRESHOLD', colour: 'text-green-400', desc: 'Four layers confirming, zero layers disagreeing = trade. Below that = wait.' }
            ].map((row, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="flex-shrink-0"><span className={`text-xs font-extrabold ${row.colour}`}>{row.action}</span></div>
                <div>
                  <p className="text-sm font-extrabold text-white">{row.label}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5" dangerouslySetInnerHTML={{ __html: row.desc }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S09 — Game */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Test Your Understanding</p>
          <h2 className="text-2xl font-extrabold mb-2">Indicator + SMC Fusion Game</h2>
          <p className="text-gray-400 text-sm mb-6">5 scenarios. Score the setup, make the call.</p>
          <div className="p-6 rounded-2xl glass-card">
            <div className="flex items-center justify-between mb-4"><span className="text-xs font-bold text-amber-400">Round {gameRound + 1} of {gameRounds.length}</span><span className="text-xs font-mono text-gray-500">{gameScore}/{gameRounds.length} correct</span></div>
            <p className="text-sm text-gray-300 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: gameRounds[gameRound].scenario }} />
            <div className="space-y-2">
              {gameRounds[gameRound].options.map((opt, oi) => {
                const answered = gameAnswers[gameRound] !== null; const selected = gameAnswers[gameRound] === oi; const isCorrect = opt.correct;
                let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]';
                if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30';
                if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30';
                if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20';
                return (<div key={oi}><button onClick={() => handleGameAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt.text }} /></button>{answered && selected && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]"><p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`} dangerouslySetInnerHTML={{ __html: `${isCorrect ? '✓' : '✗'} ${opt.explain}` }} /></motion.div>)}</div>);
              })}
            </div>
            {gameAnswers[gameRound] !== null && gameRound < gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5"><button onClick={() => setGameRound(r => r + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button></motion.div>)}
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'You understand the fusion approach at a professional level. Structure + indicators = A+ setups.' : gameScore >= 3 ? 'Solid grasp. Review the checklist scoring and the FVG/volume interaction.' : 'The fusion approach is the most advanced concept so far. Re-read the fusion pairs and trade walkthroughs.'}</p></motion.div>)}
          </div>
        </motion.div>
      </section>

      {/* S10 — Quiz + Cert */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Knowledge Check</p>
          <h2 className="text-2xl font-extrabold mb-6">Final Quiz &mdash; 8 Questions</h2>
          <div className="space-y-6">
            {quizQuestions.map((q, qi) => (
              <div key={qi} className="p-5 rounded-2xl glass-card">
                <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p>
                <p className="text-sm font-semibold text-white mb-4" dangerouslySetInnerHTML={{ __html: q.q }} />
                <div className="space-y-2">
                  {q.opts.map((opt, oi) => { const answered = quizAnswers[qi] !== null; const selected = quizAnswers[qi] === oi; const isCorrect = oi === q.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return <button key={oi} onClick={() => handleQuizAnswer(qi, oi)} disabled={answered} className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`} dangerouslySetInnerHTML={{ __html: opt }} />; })}
                </div>
                {quizAnswers[qi] !== null && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg bg-white/[0.02]"><p className="text-xs text-amber-400" dangerouslySetInnerHTML={{ __html: `<span class="font-bold">&#9989;</span> ${q.explain}` }} /></motion.div>)}
              </div>
            ))}
          </div>
          {quizDone && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center"><p className="text-3xl font-extrabold mb-2">{quizScore}%</p><p className="text-sm text-gray-400">{quizScore >= 66 ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate. Review and try again.'}</p></motion.div>)}
          {certUnlocked && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10">
              <div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(139,92,246,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
                <div className="relative z-10 text-center">
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">🔗</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 5: Indicator + SMC Fusion</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Fusion Strategist &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L5.13-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
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
