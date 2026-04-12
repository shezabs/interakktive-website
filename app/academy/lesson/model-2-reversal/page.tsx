// app/academy/lesson/model-2-reversal/page.tsx
// ATLAS Academy — Lesson 6.4: Model 2: Reversal [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 6
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
// ANIMATION 1: Reversal Model — full lifecycle
// Shows: Downtrend → Liquidity Sweep → CHoCH → Pullback → Entry → TP
// ============================================================
function ReversalModelAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.006;
    const pad = 30;
    const top = 40;
    const bot = h - 30;
    const chartW = w - pad * 2;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Model 2: Reversal — Catching the Turn', w / 2, 14);

    // Bearish trend → sweep → CHoCH → bullish reversal
    const points = [
      { x: 0.03, y: 0.15, label: '' },
      { x: 0.10, y: 0.25, label: 'LH' },
      { x: 0.18, y: 0.35, label: '' },
      { x: 0.25, y: 0.45, label: 'LH' },
      { x: 0.33, y: 0.55, label: '' },
      { x: 0.38, y: 0.60, label: 'LL' },
      { x: 0.44, y: 0.50, label: '' },
      { x: 0.50, y: 0.72, label: '' },      // sweep below LL
      { x: 0.52, y: 0.78, label: 'SWEEP' }, // deepest point
      { x: 0.56, y: 0.62, label: '' },       // rejection
      { x: 0.62, y: 0.42, label: 'CHoCH' }, // break above last LH
      { x: 0.68, y: 0.52, label: '' },       // pullback
      { x: 0.72, y: 0.55, label: 'PB' },    // entry zone
      { x: 0.80, y: 0.30, label: '' },
      { x: 0.88, y: 0.22, label: '' },
      { x: 0.95, y: 0.15, label: 'TP' },
    ];

    const progress = Math.min(1, (t % 3.5) / 3);
    const visibleCount = Math.floor(progress * points.length);

    // Bearish section in red, bullish in green
    const chochIdx = 10;
    ctx.beginPath();
    for (let i = 0; i <= Math.min(visibleCount, chochIdx) && i < points.length; i++) {
      const px = pad + points[i].x * chartW;
      const py = top + points[i].y * (bot - top);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2.5; ctx.stroke();

    if (visibleCount > chochIdx) {
      ctx.beginPath();
      const px0 = pad + points[chochIdx].x * chartW;
      const py0 = top + points[chochIdx].y * (bot - top);
      ctx.moveTo(px0, py0);
      for (let i = chochIdx + 1; i <= visibleCount && i < points.length; i++) {
        const px = pad + points[i].x * chartW;
        const py = top + points[i].y * (bot - top);
        ctx.lineTo(px, py);
      }
      ctx.strokeStyle = '#34d399'; ctx.lineWidth = 2.5; ctx.stroke();
    }

    // Labels
    for (let i = 0; i <= visibleCount && i < points.length; i++) {
      if (!points[i].label) continue;
      const px = pad + points[i].x * chartW;
      const py = top + points[i].y * (bot - top);
      ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2);
      const col = points[i].label === 'SWEEP' ? '#f59e0b' : points[i].label === 'CHoCH' ? '#a78bfa' : points[i].label === 'PB' ? '#f59e0b' : points[i].label === 'TP' ? '#22d3ee' : 'rgba(255,255,255,0.5)';
      ctx.fillStyle = col; ctx.fill();
      ctx.font = 'bold 9px system-ui'; ctx.textAlign = 'center';
      ctx.fillText(points[i].label, px, py + (points[i].label === 'SWEEP' ? 16 : -10));
    }

    // Liquidity line (previous LL level)
    if (visibleCount >= 8) {
      const llY = top + 0.60 * (bot - top);
      ctx.setLineDash([4, 3]);
      ctx.strokeStyle = 'rgba(245,158,11,0.4)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(pad + 0.36 * chartW, llY); ctx.lineTo(pad + 0.55 * chartW, llY); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(245,158,11,0.5)';
      ctx.font = '7px system-ui'; ctx.textAlign = 'left';
      ctx.fillText('Liquidity (stops below LL)', pad + 0.36 * chartW, llY - 5);
    }

    // CHoCH level line
    if (visibleCount >= 11) {
      const chochY = top + 0.45 * (bot - top);
      ctx.setLineDash([4, 3]);
      ctx.strokeStyle = 'rgba(167,139,250,0.3)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(pad + 0.23 * chartW, chochY); ctx.lineTo(pad + 0.65 * chartW, chochY); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(167,139,250,0.5)';
      ctx.font = '7px system-ui'; ctx.textAlign = 'right';
      ctx.fillText('CHoCH level (last LH broken)', pad + 0.64 * chartW, chochY - 4);
    }

    // Entry arrow
    if (visibleCount >= 13) {
      const ex = pad + 0.72 * chartW;
      const ey = top + 0.55 * (bot - top);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath(); ctx.moveTo(ex - 6, ey + 8); ctx.lineTo(ex + 6, ey + 8); ctx.lineTo(ex, ey - 2); ctx.fill();
      ctx.font = 'bold 8px system-ui'; ctx.textAlign = 'center';
      ctx.fillText('ENTRY', ex, ey + 20);
    }

    // Stop loss
    if (visibleCount >= 13) {
      const slY = top + 0.65 * (bot - top);
      ctx.setLineDash([3, 3]); ctx.strokeStyle = 'rgba(239,68,68,0.5)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(pad + 0.66 * chartW, slY); ctx.lineTo(pad + 0.78 * chartW, slY); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(239,68,68,0.6)'; ctx.font = '7px system-ui';
      ctx.fillText('SL', pad + 0.79 * chartW, slY + 3);
    }

    // Legend
    ctx.font = '9px system-ui'; ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(239,68,68,0.6)'; ctx.fillText('● Bearish trend', pad, bot + 14);
    ctx.fillStyle = 'rgba(245,158,11,0.6)'; ctx.fillText('● Sweep + Entry', pad + 90, bot + 14);
    ctx.fillStyle = 'rgba(167,139,250,0.6)'; ctx.fillText('● CHoCH', pad + 190, bot + 14);
    ctx.fillStyle = 'rgba(52,211,153,0.6)'; ctx.fillText('● Reversal', pad + 250, bot + 14);
  }, []);
  return <AnimScene drawFn={draw} height={340} />;
}

// ============================================================
// ANIMATION 2: Model 1 vs Model 2 comparison — side by side
// Left: trend continuation (with trend). Right: reversal (against trend).
// ============================================================
function ModelComparisonAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;
    const mid = w / 2;
    const top = 42;
    const bot = h - 40;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Model 1 vs Model 2 — Different Tools, Different Jobs', mid, 14);

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(mid, top - 5); ctx.lineTo(mid, bot + 5); ctx.stroke();
    ctx.setLineDash([]);

    // Left — Model 1: Trend Continuation
    ctx.font = 'bold 10px system-ui';
    ctx.fillStyle = '#34d399'; ctx.textAlign = 'center';
    ctx.fillText('MODEL 1: CONTINUATION', mid / 2, 30);

    // Simple uptrend with pullback entry
    const m1Points = [
      [0.05, 0.80], [0.15, 0.55], [0.25, 0.65], [0.35, 0.35],
      [0.45, 0.50], [0.55, 0.48], [0.65, 0.20], [0.80, 0.30], [0.95, 0.10]
    ];
    ctx.beginPath();
    m1Points.forEach(([x, y], i) => {
      const px = 10 + x * (mid - 20);
      const py = top + y * (bot - top);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    ctx.strokeStyle = '#34d399'; ctx.lineWidth = 2; ctx.stroke();

    // Entry marker
    const m1Ex = 10 + 0.55 * (mid - 20);
    const m1Ey = top + 0.48 * (bot - top);
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath(); ctx.arc(m1Ex, m1Ey, 5, 0, Math.PI * 2); ctx.fill();
    ctx.font = '8px system-ui'; ctx.fillText('Entry', m1Ex, m1Ey + 14);

    // Right — Model 2: Reversal
    ctx.font = 'bold 10px system-ui';
    ctx.fillStyle = '#a78bfa'; ctx.textAlign = 'center';
    ctx.fillText('MODEL 2: REVERSAL', mid + mid / 2, 30);

    // Downtrend → sweep → reversal up
    const m2Points = [
      [0.05, 0.15], [0.15, 0.30], [0.20, 0.20], [0.30, 0.45],
      [0.35, 0.35], [0.42, 0.60], [0.48, 0.75], [0.52, 0.55],
      [0.58, 0.40], [0.68, 0.50], [0.78, 0.25], [0.90, 0.15]
    ];
    ctx.beginPath();
    m2Points.forEach(([x, y], i) => {
      const px = mid + 10 + x * (mid - 20);
      const py = top + y * (bot - top);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    ctx.strokeStyle = i => '#a78bfa';
    // Red for down, green for up
    ctx.beginPath();
    for (let i = 0; i <= 7; i++) {
      const px = mid + 10 + m2Points[i][0] * (mid - 20);
      const py = top + m2Points[i][1] * (bot - top);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath();
    for (let i = 7; i < m2Points.length; i++) {
      const px = mid + 10 + m2Points[i][0] * (mid - 20);
      const py = top + m2Points[i][1] * (bot - top);
      if (i === 7) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = '#34d399'; ctx.lineWidth = 2; ctx.stroke();

    // Entry marker
    const m2Ex = mid + 10 + 0.68 * (mid - 20);
    const m2Ey = top + 0.50 * (bot - top);
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath(); ctx.arc(m2Ex, m2Ey, 5, 0, Math.PI * 2); ctx.fill();
    ctx.font = '8px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('Entry', m2Ex, m2Ey + 14);

    // Stats boxes
    const statsY = bot + 8;
    ctx.font = '8px system-ui';
    ctx.fillStyle = 'rgba(52,211,153,0.5)'; ctx.textAlign = 'center';
    ctx.fillText('WR: ~55-60%  |  R:R: 1:1.5-2  |  Higher probability', mid / 2, statsY + 10);
    ctx.fillStyle = 'rgba(167,139,250,0.5)';
    ctx.fillText('WR: ~40-50%  |  R:R: 1:3-5  |  Higher reward', mid + mid / 2, statsY + 10);
  }, []);
  return <AnimScene drawFn={draw} height={300} />;
}

// ============================================================
// DATA
// ============================================================
const reversalSteps = [
  { num: '1', title: 'Identify Trend Exhaustion on HTF', desc: 'Look for signs the higher timeframe trend is running out of steam: RSI divergence, momentum slowing, extended move (5+ BOS without meaningful pullback), price reaching a major HTF level.', tip: 'Model 2 starts where Model 1 ends. A trend that has been running for weeks with weakening momentum is a Model 2 candidate. A fresh, healthy trend is NOT.' },
  { num: '2', title: 'Wait for Liquidity Sweep', desc: 'Smart money needs to grab liquidity before reversing. Watch for price to sweep below the most recent swing low (for bullish reversal) or above the swing high (for bearish reversal). This stop hunt is the trap that fuels the reversal.', tip: 'The sweep should be SHARP and quickly rejected. A sweep that sits below the level for multiple candles is not a sweep — it is a genuine breakdown. The wick should be fast and violent.' },
  { num: '3', title: 'Confirm Change of Character (CHoCH)', desc: 'After the sweep, wait for a CHoCH on the entry timeframe. A CHoCH is when price breaks above the LAST Lower High (for a bullish reversal) or below the LAST Higher Low (for a bearish reversal). This is the structural confirmation that the trend has flipped.', tip: 'CHoCH is NOT the same as BOS. BOS continues the existing trend. CHoCH BREAKS the existing trend. The last LH being broken means sellers can no longer make new lows — the structure has shifted.' },
  { num: '4', title: 'Mark the Order Block from the CHoCH', desc: 'The OB is the last bearish candle before the bullish CHoCH break (or vice versa). This is where institutions placed their reversal orders. It becomes your entry zone when price pulls back.', tip: 'The CHoCH OB is often STRONGER than a regular trend OB because it represents the point where institutions committed to the new direction with enough force to break structure.' },
  { num: '5', title: 'Wait for Pullback + Entry Trigger', desc: 'Price will often retest the CHoCH level or pull back to the OB. At this zone, look for your entry trigger: bullish engulfing, lower-TF CHoCH, rejection wick with volume, or RSI bouncing from oversold.', tip: 'The pullback after a CHoCH tends to be shallow compared to Model 1 pullbacks. If price pulls all the way back through the CHoCH level, the reversal has likely failed.' },
  { num: '6', title: 'Stop Below the Sweep Low', desc: 'Your stop goes below the sweep low (for longs). This is the absolute invalidation — if price makes a new low below the sweep, the reversal thesis is dead and the trend is continuing.', tip: 'The sweep low IS the bottom of the reversal. If it gets broken, you are wrong. No exceptions, no "giving it room." Below the sweep = wrong.' },
  { num: '7', title: 'Target: HTF Structure Level or 1:3+ R:R', desc: 'Model 2 targets are aggressive because you are catching a new trend early. TP1 at the origin of the last bearish leg (1:2-3 R:R). TP2 at the HTF resistance above. Some traders trail after TP1 to ride the full reversal.', tip: 'Model 2 compensates for lower win rate with MUCH higher reward. If your Model 2 setups average 1:3 R:R, you only need 30% win rate to break even.' },
];

const m1VsM2 = [
  { aspect: 'Direction', m1: 'WITH the trend — you ride existing momentum', m2: 'AGAINST the trend — you catch the turn' },
  { aspect: 'Win Rate', m1: '55-60% — higher because trend is your friend', m2: '40-50% — lower because you fight the current trend' },
  { aspect: 'Risk:Reward', m1: '1:1.5-2 — moderate targets', m2: '1:3-5 — big targets compensate for lower WR' },
  { aspect: 'Key Signal', m1: 'BOS (trend continues)', m2: 'CHoCH (trend breaks)' },
  { aspect: 'Entry Zone', m1: 'Pullback to OB after BOS', m2: 'Pullback to OB after CHoCH + sweep' },
  { aspect: 'When to Use', m1: 'Healthy trend, no divergence, fresh momentum', m2: 'Exhausted trend, divergence, liquidity swept' },
];

const gameRounds = [
  { scenario: 'Gold has been in a downtrend for 2 weeks on the 4H chart (LH/LL). Price just swept below the most recent swing low with a massive wick, then closed back above. RSI is showing bullish divergence on the 4H. On the 15M, price has just broken above the last Lower High. What model applies?', options: [
    { text: 'Model 1 — the trend is bearish so look for short continuations', correct: false, explain: 'The trend WAS bearish, but the sweep + divergence + CHoCH on 15M are all reversal signals. Model 1 (continuation) would be shorting into an exhausting trend with divergence — that is fighting the reversal.' },
    { text: 'Model 2 — this is a textbook bullish reversal setup with sweep + CHoCH + divergence', correct: true, explain: 'Correct. All 3 reversal ingredients are present: (1) Trend exhaustion with RSI divergence on 4H, (2) Liquidity sweep below the LL, (3) CHoCH on 15M breaking above the last LH. Wait for pullback to the CHoCH OB, then enter long.' },
    { text: 'Neither — wait for more confirmation', correct: false, explain: 'The sweep + CHoCH + divergence IS the confirmation. Waiting for "more" means you miss the optimal entry at the pullback to the CHoCH OB. The 3-ingredient confirmation is the maximum you get with Model 2.' },
    { text: 'Model 1 long — the CHoCH means the trend has flipped so now continue it', correct: false, explain: 'Close, but not yet. Model 1 requires an ESTABLISHED trend with a BOS. A single CHoCH is a reversal (Model 2), not a continuation. You need several HH/HL structures to form before Model 1 applies in the new direction.' },
  ]},
  { scenario: 'EUR/USD has been bullish for 3 days on the 1H. Price sweeps above the most recent swing high, creating a wick above resistance. But there is NO RSI divergence — RSI made a higher high alongside price. What does this tell you?', options: [
    { text: 'Take the reversal short — the sweep is enough', correct: false, explain: 'A sweep without divergence is often just a liquidity grab within a continuing trend, not a reversal setup. Smart money might be grabbing stops to ADD to their long positions, not reverse.' },
    { text: 'The sweep alone is insufficient — without divergence, this is more likely a continuation liquidity grab than a genuine reversal', correct: true, explain: 'Correct. Model 2 requires trend exhaustion, and RSI divergence is the primary exhaustion indicator. Without divergence, momentum is still healthy — the sweep is more likely smart money grabbing stops before pushing higher (which is actually a Model 1 continuation entry zone).' },
    { text: 'Enter long — the sweep means they grabbed liquidity for a push higher', correct: false, explain: 'You might be right, but this is a Model 1 analysis, not Model 2. The point is that this setup does NOT qualify for a Model 2 reversal short because the trend is still healthy.' },
    { text: 'Wait for a CHoCH to decide', correct: false, explain: 'Waiting for a CHoCH is reasonable as a filter, but the key diagnostic here is the ABSENCE of divergence. A CHoCH without divergence could be a fakeout. The divergence tells you the engine is dying.' },
  ]},
  { scenario: 'You enter a Model 2 bullish reversal on NASDAQ 15M after a clean sweep + CHoCH + divergence. Your stop is below the sweep low. Price moves in your favour for 1:1 R:R but then starts pulling back toward your entry. What do you do?', options: [
    { text: 'Close immediately — any pullback means the reversal has failed', correct: false, explain: 'Reversals are messy. The initial move often pulls back to retest the CHoCH level before continuing. Closing at 1:1 means you capture the least profitable part of a Model 2 trade.' },
    { text: 'Move stop to breakeven and let the trade play out — Model 2 targets are 1:3+', correct: true, explain: 'Correct. Model 2 trades are designed for high R:R. Moving to breakeven at 1:1 protects your capital while giving the trade room to reach 1:3-5. If it stops you at breakeven, you lose nothing. If it continues, you capture the full reversal.' },
    { text: 'Add another position to double down', correct: false, explain: 'Adding to a trade that is pulling back increases risk. The pullback might be a retest, or the reversal might be failing. Wait until the trade confirms direction before even thinking about adding.' },
    { text: 'Move stop further away to give it room', correct: false, explain: 'Never move a stop further from entry. Your stop below the sweep low is the invalidation point. Moving it means you are changing your thesis mid-trade.' },
  ]},
  { scenario: 'A trader sees a sweep + CHoCH on Gold 15M during the Asian session (3 AM GMT). The sweep was a slow, grinding move below the low over 8 candles — not a sharp wick. RSI divergence is present on the 1H. Should she take this Model 2 trade?', options: [
    { text: 'Yes — all the conditions are met', correct: false, explain: 'Two problems. First, the "sweep" was 8 candles of grinding — that is a breakdown, not a sweep. Genuine sweeps are fast wicks that reject immediately. Second, Asian session on Gold lacks the volume for a reversal to follow through.' },
    { text: 'No — the "sweep" was a slow grind (not a genuine sweep) AND the Asian session lacks volume for follow-through', correct: true, explain: 'Correct. Both issues are disqualifying. A genuine liquidity sweep is FAST — a sharp wick that grabs stops and reverses within 1-3 candles. An 8-candle grind below the low is a genuine breakdown, not a trap. Even if the sweep was clean, 3 AM on Gold has no institutional volume to fuel a reversal.' },
    { text: 'Yes but with reduced size due to the session', correct: false, explain: 'The session issue can be managed with sizing, but the bigger problem is the fake "sweep." A slow grind is not a sweep. Reducing size doesn\'t fix a flawed thesis.' },
    { text: 'Wait for London open — if the setup is still valid, enter then', correct: false, explain: 'By London open, the structure will have changed significantly. But the real issue is the slow grind — that will still be a problem regardless of session timing.' },
  ]},
  { scenario: 'You have been trading Model 2 reversals for a month. Your win rate is 38% but your average R:R is 1:3.2. Should you continue?', options: [
    { text: 'No — 38% win rate is too low, switch to Model 1', correct: false, explain: 'Let\'s check the maths: EV = (0.38 × 3.2R) − (0.62 × 1R) = 1.216R − 0.62R = +0.596R per trade. That is highly profitable. Win rate alone does NOT determine profitability.' },
    { text: 'Yes — the expected value is positive: (0.38 × 3.2) − (0.62 × 1) = +0.60R per trade, which is excellent', correct: true, explain: 'Correct. EV = +0.596R per trade. If you risk £100 per trade, you make an average of £59.60 per trade over time. That is a STRONG edge. Model 2\'s lower win rate is by design — the high R:R more than compensates. This is exactly how reversals are supposed to work.' },
    { text: 'He needs to increase his win rate to at least 50% before continuing', correct: false, explain: 'Trying to increase win rate on reversals usually means tightening criteria so much that you miss most setups. The current 38% at 1:3.2 R:R is already profitable. Optimising win rate might reduce R:R and make it worse.' },
    { text: 'The sample size is too small — one month is not enough', correct: false, explain: 'Sample size matters, but the maths at these numbers is clearly positive. One month might be 30-50 trades which is a reasonable initial sample for a reversal strategy.' },
  ]},
];

const quizQuestions = [
  { q: 'What is the key structural difference between a BOS (Model 1) and a CHoCH (Model 2)?', opts: ['BOS is on higher timeframes, CHoCH is on lower timeframes', 'BOS continues the existing trend, CHoCH BREAKS the existing trend', 'BOS uses Order Blocks, CHoCH uses Fair Value Gaps', 'There is no difference — they are the same thing'], correct: 1, explain: 'BOS = Break of Structure in the SAME direction as the trend (continuation). CHoCH = Change of Character — breaking structure in the OPPOSITE direction (reversal). Same mechanic, opposite meaning.' },
  { q: 'Why is a liquidity sweep necessary before a Model 2 reversal?', opts: ['It makes the chart look more dramatic', 'Smart money needs to grab stop-loss orders below/above key levels to fuel their reversal position', 'It confirms that retail traders are wrong', 'It is not necessary — only the CHoCH matters'], correct: 1, explain: 'Institutions need large orders to build positions. The stops sitting below swing lows are those orders. By sweeping below, they trigger those stops (which are sell orders), buy them up, and then reverse the market. The sweep IS the fuel.' },
  { q: 'A trader sees a CHoCH on the 15M but the 4H trend is still healthy with no divergence. Should he take the Model 2 reversal?', opts: ['Yes — the CHoCH is all you need', 'Yes but with reduced position size', 'No — a 15M CHoCH against a healthy 4H trend is likely noise or a minor retracement, not a genuine reversal', 'Yes — lower timeframes lead higher timeframes'], correct: 2, explain: 'A 15M CHoCH against a healthy, non-divergent 4H trend is most likely a pullback within the larger trend, not a genuine reversal. Model 2 requires HTF exhaustion as the first ingredient. Without it, the CHoCH is just a larger pullback that will likely resume the 4H trend.' },
  { q: 'Where does the stop loss go in a bullish Model 2 reversal?', opts: ['20 pips below entry', 'Below the Order Block', 'Below the liquidity sweep low — the absolute invalidation point', 'At the 200 EMA'], correct: 2, explain: 'The sweep low is the deepest point of the reversal. If price goes below it, the reversal has failed and the bearish trend is continuing. This is the clearest invalidation in any SMC model.' },
  { q: 'Model 2 has a 42% win rate with 1:3.5 R:R. What is the expected value per £100 risked?', opts: ['−£11 (losing)', '+£47 (profitable)', '+£89 (very profitable)', '+£147 (extremely profitable)'], correct: 1, explain: 'EV = (0.42 × £350) − (0.58 × £100) = £147 − £58 = +£89 per trade. A 42% win rate with 1:3.5 R:R is extremely profitable. This is why Model 2 is worth trading despite the lower hit rate.' },
  { q: 'What makes a "sweep" genuine versus a fake breakdown?', opts: ['Genuine sweeps happen on Mondays', 'A genuine sweep is a sharp, fast wick that rejects within 1-3 candles. A fake breakdown is a slow grind below the level over many candles.', 'All sweeps are genuine', 'A genuine sweep has high volume; a fake has low volume'], correct: 1, explain: 'The speed of rejection is the diagnostic. A sharp wick that sweeps and immediately reverses = smart money grabbed liquidity and reversed. A slow 8-candle grind below the level = the market genuinely broke down.' },
  { q: 'When should you use Model 2 instead of Model 1?', opts: ['When you are bored of Model 1', 'When the trend is exhausted — showing divergence, extended structure, reaching HTF levels', 'Always — Model 2 has better R:R', 'When the market is ranging'], correct: 1, explain: 'Model 2 is specifically for trend exhaustion. Divergence + extended moves + HTF level confluence = the trend is dying. Without these exhaustion signals, Model 1 (continuation) is the higher-probability play.' },
  { q: 'After a Model 2 entry, price reaches 1:1 R:R. What is the recommended management?', opts: ['Close the full position — take the profit', 'Move stop to breakeven and target 1:3+ — Model 2 is designed for big moves', 'Add another position to maximise profit', 'Do nothing — leave stop at original level'], correct: 1, explain: 'Moving to breakeven at 1:1 is the standard Model 2 management. It removes risk while allowing the trade to reach its designed 1:3-5 target. Closing at 1:1 wastes the entire advantage of the reversal model.' },
];

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

function Confetti({ active }: { active: boolean }) {
  if (!active) return null;
  return (<div className="fixed inset-0 pointer-events-none z-50">{Array.from({ length: 60 }).map((_, i) => (<motion.div key={i} initial={{ y: -20, x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400), opacity: 1 }} animate={{ y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 20, rotate: Math.random() * 720, opacity: 0 }} transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5 }} className="absolute w-2 h-2 rounded-sm" style={{ background: ['#f59e0b', '#d946ef', '#34d399', '#3b82f6', '#ef4444'][i % 5] }} />))}</div>);
}

export default function Model2ReversalLesson() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);

  const [openStep, setOpenStep] = useState<number | null>(null);

  // Interactive — Model Selector: given a scenario, pick Model 1 or 2
  const [selectorIdx, setSelectorIdx] = useState(0);
  const [selectorAnswer, setSelectorAnswer] = useState<number | null>(null);
  const scenarios = [
    { text: '4H bullish trend, healthy momentum, 15M BOS in trend direction, pullback to OB.', correct: 0, explain: 'Model 1. Healthy trend + BOS + pullback = trend continuation.' },
    { text: '4H bearish for 3 weeks, RSI divergence, sweep below LL, 15M CHoCH.', correct: 1, explain: 'Model 2. Exhausted trend + divergence + sweep + CHoCH = reversal.' },
    { text: 'Daily ranging, no clear HH/HL or LH/LL. 15M shows a BOS up.', correct: 2, explain: 'NEITHER. No HTF trend means Model 1 has no trend to continue and Model 2 has no trend to reverse. Wait for clarity.' },
    { text: '1H uptrend, fresh BOS, no divergence, price at 50% retracement of last swing.', correct: 0, explain: 'Model 1. Fresh trend + BOS + pullback to discount + no divergence = continuation.' },
    { text: '4H bullish trend extended (7 consecutive BOS), RSI showing bearish div, price at major weekly resistance.', correct: 1, explain: 'Model 2. Over-extended trend + divergence + HTF resistance = exhaustion. Look for sweep + CHoCH to confirm.' },
  ];
  const handleSelector = (choice: number) => { if (selectorAnswer !== null) return; setSelectorAnswer(choice); };

  // Common mistakes
  const [openMistake, setOpenMistake] = useState<number | null>(null);
  const mistakes = [
    { title: 'Taking every CHoCH as a reversal', desc: 'A CHoCH without trend exhaustion (no divergence, fresh trend) is usually just a deeper pullback within the existing trend. It will likely get swallowed as the trend continues. Model 2 requires EXHAUSTION first — the CHoCH is the confirmation, not the trigger.' },
    { title: 'Confusing a slow breakdown for a sweep', desc: 'A genuine sweep is 1-3 candles: spike below the level, immediate rejection, close back above. If price grinds below the level for 5+ candles, that is a genuine breakdown. Do not force a sweep narrative onto a real break.' },
    { title: 'Targeting too conservatively', desc: 'Model 2 entries need 1:3+ R:R to be profitable at 40-50% win rate. If you are closing at 1:1 on every reversal trade, the maths does not work. Move to breakeven at 1:1 and let the rest ride to 1:3-5.' },
    { title: 'Fighting a healthy trend because "it looks extended"', desc: '"It has gone up a lot" is not the same as "the trend is exhausted." A strong trend with RSI making higher highs, volume confirming, and no divergence can keep running for weeks. Model 2 requires measurable exhaustion, not a gut feeling that it has gone too far.' },
  ];

  // Game
  const [gameRound, setGameRound] = useState(0);
  const [gameAnswers, setGameAnswers] = useState<(number | null)[]>(Array(gameRounds.length).fill(null));
  const [gameScore, setGameScore] = useState(0);
  const handleGameAnswer = (optIdx: number) => { if (gameAnswers[gameRound] !== null) return; const next = [...gameAnswers]; next[gameRound] = optIdx; setGameAnswers(next); if (gameRounds[gameRound].options[optIdx].correct) setGameScore(s => s + 1); };

  // Quiz
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(Array(quizQuestions.length).fill(null));
  const handleQuizAnswer = (qi: number, oi: number) => { if (quizAnswers[qi] !== null) return; const next = [...quizAnswers]; next[qi] = oi; setQuizAnswers(next); };
  const quizDone = quizAnswers.every(a => a !== null);
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
        <div className="flex items-center gap-2"><Crown className="w-3.5 h-3.5 text-amber-400" /><span className="text-xs font-bold text-amber-400">PRO &middot; LEVEL 6</span></div>
      </nav>

      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6 pt-20">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(245,158,11,0.08),transparent_70%)] pointer-events-none" />
        <div className="absolute top-[-50px] right-[20%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(217,70,239,0.05),transparent_70%)] pointer-events-none" />
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.15 } } }} className="relative z-10">
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 6 &middot; Lesson 4</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Model 2:<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Reversal</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">Catching the turn with precision. Higher reward, lower probability. The scalpel of the ATLAS toolkit.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* S00 */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">🔍 The Scalpel, Not the Hammer</p>
            <p className="text-gray-400 leading-relaxed mb-4">Model 1 is a hammer &mdash; reliable, consistent, works on most nails. Model 2 is a scalpel &mdash; precise, powerful, but only for specific operations. Use a scalpel on a nail and you break it. Use a hammer in surgery and you destroy the patient.</p>
            <p className="text-gray-400 leading-relaxed">Reversal trading is where the biggest wins live, but also where the biggest mistakes happen. This lesson teaches you exactly WHEN the scalpel is appropriate and HOW to use it without cutting yourself.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">A prop trader ran both models for 6 months. Model 1: <strong className="text-green-400">58% WR, 1:1.8 R:R, 312 trades</strong>. Model 2: <strong className="text-green-400">43% WR, 1:3.4 R:R, 87 trades</strong>. Model 1 made £14,200. Model 2 made £11,800. Both were profitable &mdash; but they worked for different reasons. Model 1 won on consistency. Model 2 won on size of winners.</p>
          </div>
        </motion.div>
      </section>

      {/* S01 — Reversal Animation */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Model Visualised</p>
          <h2 className="text-2xl font-extrabold mb-4">See the Reversal Lifecycle</h2>
          <p className="text-gray-400 text-sm mb-6">Watch the three ingredients come together: exhaustion builds, liquidity gets swept, structure breaks (CHoCH), and the reversal begins.</p>
          <ReversalModelAnimation />
          <div className="mt-4 p-4 rounded-xl bg-sky-500/5 border border-sky-500/15">
            <p className="text-sm text-gray-400 leading-relaxed">💡 <strong className="text-sky-400">The 3 ingredients are non-negotiable:</strong> (1) Trend exhaustion on HTF, (2) Liquidity sweep below/above key level, (3) CHoCH on entry TF. Missing any ONE of these turns the trade from a calculated reversal into a guess.</p>
          </div>
        </motion.div>
      </section>

      {/* S02 — Model Comparison */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; Model 1 vs Model 2</p>
          <h2 className="text-2xl font-extrabold mb-4">Side by Side</h2>
          <ModelComparisonAnimation />
          <div className="mt-6 p-4 rounded-2xl glass-card overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="text-gray-500 border-b border-white/[0.06]">
                <th className="text-left py-2 pr-3">Aspect</th><th className="text-left py-2 pr-3 text-green-400">Model 1</th><th className="text-left py-2 text-purple-400">Model 2</th>
              </tr></thead>
              <tbody className="text-gray-400">
                {m1VsM2.map((r, i) => (
                  <tr key={i} className="border-b border-white/[0.03]">
                    <td className="py-2 pr-3 font-semibold text-white">{r.aspect}</td>
                    <td className="py-2 pr-3">{r.m1}</td>
                    <td className="py-2">{r.m2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </section>

      {/* S03 — 7 Reversal Steps */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The 7 Steps</p>
          <h2 className="text-2xl font-extrabold mb-4">Model 2 — Step by Step</h2>
          <div className="space-y-3">
            {reversalSteps.map((s, i) => (
              <div key={i}>
                <button onClick={() => setOpenStep(openStep === i ? null : i)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-xs font-bold text-purple-400">{s.num}</span>
                    <p className="text-sm font-extrabold text-white">{s.title}</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openStep === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openStep === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05] space-y-3">
                      <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
                      <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/10"><p className="text-xs text-purple-400">💡 <strong>Pro Tip:</strong> {s.tip}</p></div>
                    </div>
                  </motion.div>
                )}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S04 — The 3 Ingredients Deep Dive */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The 3 Non-Negotiable Ingredients</p>
          <h2 className="text-2xl font-extrabold mb-6">All 3 or Walk Away</h2>
          <div className="space-y-4">
            <div className="p-5 rounded-xl glass-card">
              <p className="text-sm font-extrabold text-amber-400 mb-2">1. Trend Exhaustion</p>
              <p className="text-sm text-gray-400 leading-relaxed mb-2">The trend must be DYING, not just pausing. Look for: RSI divergence on HTF (price making new high, RSI making lower high), MACD histogram shrinking, 5+ consecutive BOS without deep pullbacks, price reaching a major weekly/monthly level.</p>
              <div className="p-3 rounded-lg bg-sky-500/5 border border-sky-500/10"><p className="text-xs text-sky-400">💡 A pausing trend is a Model 1 pullback opportunity. A dying trend is a Model 2 reversal candidate. The divergence is what separates them.</p></div>
            </div>
            <div className="p-5 rounded-xl glass-card">
              <p className="text-sm font-extrabold text-amber-400 mb-2">2. Liquidity Sweep</p>
              <p className="text-sm text-gray-400 leading-relaxed mb-2">Smart money needs fuel. The stop-loss orders sitting below swing lows (or above swing highs) ARE that fuel. A sharp wick that sweeps those stops and immediately reverses = institutions loading their position. The faster the rejection, the more convincing the sweep.</p>
              <div className="p-3 rounded-lg bg-sky-500/5 border border-sky-500/10"><p className="text-xs text-sky-400">💡 Think of the sweep as a mousetrap. Smart money sets the cheese (lets price drift toward the stops), snaps the trap (triggers the stops), and reverses. If the trap takes 8 candles to spring, it is not a trap — it is a genuine breakdown.</p></div>
            </div>
            <div className="p-5 rounded-xl glass-card">
              <p className="text-sm font-extrabold text-amber-400 mb-2">3. Change of Character (CHoCH)</p>
              <p className="text-sm text-gray-400 leading-relaxed mb-2">The CHoCH is structural proof that the trend has flipped. In a bearish trend, the market makes Lower Highs. When price breaks ABOVE the last Lower High, it has made a Higher High — the first one in the entire downtrend. That is the CHoCH.</p>
              <div className="p-3 rounded-lg bg-sky-500/5 border border-sky-500/10"><p className="text-xs text-sky-400">💡 The CHoCH is the moment the defendant is found "not guilty." Before CHoCH, the trend is still guilty of continuing. After CHoCH, there is reasonable doubt. You enter on the pullback to the scene of the verdict.</p></div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S05 — Interactive Model Selector */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Model Selector</p>
          <h2 className="text-2xl font-extrabold mb-2">Model 1, Model 2, or Neither?</h2>
          <p className="text-gray-400 text-sm mb-6">Read each scenario and decide which model applies.</p>
          <div className="p-6 rounded-2xl glass-card">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-amber-400">Scenario {selectorIdx + 1} of {scenarios.length}</span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed mb-5">{scenarios[selectorIdx].text}</p>
            <div className="flex gap-2 mb-4">
              {['Model 1', 'Model 2', 'Neither'].map((label, i) => {
                const answered = selectorAnswer !== null;
                const selected = selectorAnswer === i;
                const isCorrect = i === scenarios[selectorIdx].correct;
                let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]';
                if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30';
                if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30';
                if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20';
                return <button key={i} onClick={() => handleSelector(i)} disabled={answered} className={`flex-1 p-3 rounded-xl text-sm font-bold transition-all ${cls} ${i === 0 ? 'text-green-400' : i === 1 ? 'text-purple-400' : 'text-gray-400'}`}>{label}</button>;
              })}
            </div>
            {selectorAnswer !== null && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-lg bg-white/[0.02]">
                <p className={`text-xs leading-relaxed ${selectorAnswer === scenarios[selectorIdx].correct ? 'text-green-400' : 'text-red-400'}`}>
                  {selectorAnswer === scenarios[selectorIdx].correct ? '✓ ' : '✗ '}{scenarios[selectorIdx].explain}
                </p>
              </motion.div>
            )}
            {selectorAnswer !== null && selectorIdx < scenarios.length - 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
                <button onClick={() => { setSelectorIdx(i => i + 1); setSelectorAnswer(null); }} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Scenario &rarr;</button>
              </motion.div>
            )}
            {selectorAnswer !== null && selectorIdx === scenarios.length - 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                <p className="text-sm font-bold text-amber-400">Complete! You can now distinguish between Model 1, Model 2, and situations where neither applies.</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </section>

      {/* S06 — Real Trade Walkthrough */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Real Trade Walkthrough</p>
          <h2 className="text-2xl font-extrabold mb-4">Gold Bullish Reversal — Step by Step</h2>
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm text-gray-400"><strong className="text-red-400">Context:</strong> Gold 4H has been bearish for 10 days. Price made 6 consecutive lower lows. RSI on 4H shows clear bullish divergence (price lower, RSI higher). Price is approaching the weekly demand zone at 2,280.</p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm text-gray-400"><strong className="text-amber-400">Step 1:</strong> Exhaustion confirmed — 6 consecutive LL + RSI divergence + weekly demand.</p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm text-gray-400"><strong className="text-amber-400">Step 2:</strong> Price spikes to 2,275 during NY open — sweeping below the 2,278 swing low with a massive wick. Closes back above 2,282 within 2 candles. Clean sweep.</p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm text-gray-400"><strong className="text-purple-400">Step 3:</strong> On the 15M, price breaks above the last LH at 2,295, creating a CHoCH. The last bearish candle before the break (OB) sits at 2,288-2,291.</p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm text-gray-400"><strong className="text-amber-400">Step 4-5:</strong> Price pulls back to 2,290 (the OB). A bullish engulfing candle with above-average volume forms at the OB during London session. Entry at 2,291.</p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm text-gray-400"><strong className="text-red-400">Step 6:</strong> Stop at 2,273 (below the sweep low at 2,275, minus 2 pip buffer). Risk = 18 pips.</p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm text-gray-400"><strong className="text-green-400">Step 7:</strong> TP1 at 2,309 (1:1 R:R → move SL to BE). TP2 at 2,345 (1:3 R:R — the origin of the bearish leg). Trail remainder.</p></div>
            <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/15"><p className="text-sm text-green-400 font-bold">Result: TP1 hit in 3 hours. TP2 hit the following day. Full 1:3 R:R captured. The move ultimately reached 2,380 over the next week — a full trend reversal.</p></div>
          </div>
        </motion.div>
      </section>

      {/* S07 — When NOT to Use Model 2 */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; When NOT to Use Model 2</p>
          <h2 className="text-2xl font-extrabold mb-4">The Red Lines</h2>
          <div className="p-6 rounded-2xl glass-card space-y-3">
            <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15"><p className="text-sm text-gray-400"><strong className="text-red-400">No divergence:</strong> If RSI confirms the trend (higher highs in uptrend, lower lows in downtrend), the trend is healthy. A sweep in a healthy trend is a Model 1 entry, not a Model 2 reversal.</p></div>
            <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15"><p className="text-sm text-gray-400"><strong className="text-red-400">Fresh trend:</strong> A trend that started 2 days ago is not exhausted. Model 2 applies to MATURE trends (weeks of trending, 5+ BOS). Do not try to reverse a baby trend.</p></div>
            <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15"><p className="text-sm text-gray-400"><strong className="text-red-400">No sweep:</strong> CHoCH without a sweep is just a structure break — it could be a deeper pullback. The sweep is what traps traders and provides fuel. Without it, the CHoCH lacks conviction.</p></div>
            <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15"><p className="text-sm text-gray-400"><strong className="text-red-400">Ranging market:</strong> There is no trend to reverse in a range. A "CHoCH" in a range is just the market bouncing between boundaries. Neither model applies.</p></div>
          </div>
        </motion.div>
      </section>

      {/* S08 — Common Mistakes */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-6">4 Reversal Killers</h2>
          <div className="space-y-3">
            {mistakes.map((m, i) => (
              <div key={i}>
                <button onClick={() => setOpenMistake(openMistake === i ? null : i)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <p className="text-sm font-extrabold text-red-400">{i + 1}. {m.title}</p>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openMistake === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openMistake === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-sm text-gray-400 leading-relaxed">{m.desc}</p></div>
                  </motion.div>
                )}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S09 — Cheat Sheet */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Cheat Sheet</p>
          <h2 className="text-2xl font-extrabold mb-4">Model 2 Quick Reference</h2>
          <div className="p-6 rounded-2xl glass-card space-y-3">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">EXHAUSTION</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">RSI divergence + extended trend + HTF level. The trend is dying.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">SWEEP</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Sharp wick below/above key level. Fast rejection (1-3 candles). Fuel for the reversal.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-purple-400">CHoCH</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Break above last LH (bull) or below last HL (bear). Structural flip.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-green-400">ENTRY</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Pullback to the CHoCH OB + trigger. Do not chase the CHoCH candle.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-red-400">STOP</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Below sweep low (longs) or above sweep high (shorts). Absolute invalidation.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-sky-400">TARGET</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">TP1 at 1:1 (move to BE). TP2 at 1:3+ (origin of last bearish/bullish leg).</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-gray-300">MATHS</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">40-50% WR × 1:3+ R:R = positive EV. Lower WR is by design.</span></p></div>
          </div>
        </motion.div>
      </section>

      {/* S10 — Game */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Test Your Understanding</p>
          <h2 className="text-2xl font-extrabold mb-2">Reversal Decision Game</h2>
          <p className="text-gray-400 text-sm mb-6">5 live scenarios. Make the right call with Model 2.</p>
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
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Excellent — you know when and how to deploy the reversal model.' : gameScore >= 3 ? 'Solid — review the 3 ingredients and the "when NOT to use" section.' : 'Re-read the exhaustion, sweep, and CHoCH sections, then try again.'}</p></motion.div>)}
          </div>
        </motion.div>
      </section>

      {/* S11 — Quiz + Certificate */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Knowledge Check</p>
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
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center text-3xl shadow-lg shadow-purple-500/30">🔄</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 6: Model 2 — Reversal</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-purple-400 via-amber-400 to-purple-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Reversal Specialist &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L6.4-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
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
