// app/academy/lesson/model-1-trend-continuation/page.tsx
// ATLAS Academy — Lesson 6.3: Model 1: Trend Continuation [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 6
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Crown,  ChevronDown } from 'lucide-react';

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
// ANIMATION 1: Trend Continuation Model — full lifecycle
// Shows: HH/HL structure → BOS → Pullback to OB → Entry → TP
// ============================================================
function TrendContinuationAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.006;
    const pad = 30;
    const top = 40;
    const bot = h - 30;
    const chartW = w - pad * 2;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Model 1: Trend Continuation — The Full Lifecycle', w / 2, 14);

    // Uptrend price path: HL1 → HH1 → HL2(pullback to OB) → HH2(target)
    const points = [
      { x: 0.05, y: 0.85, label: 'HL₁' },
      { x: 0.18, y: 0.55, label: '' },
      { x: 0.28, y: 0.65, label: 'HL₂' },
      { x: 0.42, y: 0.30, label: 'HH₁' },
      { x: 0.52, y: 0.50, label: '' },  // pullback start
      { x: 0.58, y: 0.48, label: '' },  // OB zone
      { x: 0.62, y: 0.52, label: 'PB to OB' }, // entry zone
      { x: 0.75, y: 0.18, label: 'HH₂' },
      { x: 0.88, y: 0.28, label: '' },
      { x: 0.95, y: 0.12, label: 'TP' },
    ];

    // Animate reveal
    const progress = Math.min(1, t % 3 / 2.5);
    const visibleCount = Math.floor(progress * points.length);

    // Draw price line
    ctx.beginPath();
    for (let i = 0; i <= visibleCount && i < points.length; i++) {
      const px = pad + points[i].x * chartW;
      const py = top + points[i].y * (bot - top);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 2.5; ctx.stroke();

    // Draw points and labels
    for (let i = 0; i <= visibleCount && i < points.length; i++) {
      const px = pad + points[i].x * chartW;
      const py = top + points[i].y * (bot - top);

      if (points[i].label) {
        ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = points[i].label === 'PB to OB' ? '#f59e0b' : points[i].label === 'TP' ? '#22d3ee' : '#34d399';
        ctx.fill();

        ctx.fillStyle = points[i].label === 'PB to OB' ? '#f59e0b' : points[i].label === 'TP' ? '#22d3ee' : 'rgba(255,255,255,0.7)';
        ctx.font = 'bold 9px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(points[i].label, px, py - 10);
      }
    }

    // OB zone (between HH1 and pullback)
    if (visibleCount >= 6) {
      const obLeft = pad + 0.40 * chartW;
      const obRight = pad + 0.44 * chartW;
      const obTop = top + 0.28 * (bot - top);
      const obBot = top + 0.35 * (bot - top);
      ctx.fillStyle = 'rgba(52,211,153,0.12)';
      ctx.fillRect(obLeft, obTop, obRight - obLeft, obBot - obTop);
      ctx.strokeStyle = 'rgba(52,211,153,0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(obLeft, obTop, obRight - obLeft, obBot - obTop);
      ctx.fillStyle = 'rgba(52,211,153,0.6)';
      ctx.font = '8px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('OB', obLeft + 2, obTop + 10);
    }

    // BOS line
    if (visibleCount >= 4) {
      const bosY = top + 0.30 * (bot - top);
      ctx.setLineDash([4, 3]);
      ctx.strokeStyle = 'rgba(52,211,153,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(pad + 0.42 * chartW, bosY); ctx.lineTo(pad + 0.75 * chartW, bosY); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(52,211,153,0.5)';
      ctx.font = '8px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText('BOS level', pad + 0.74 * chartW, bosY - 4);
    }

    // Entry arrow
    if (visibleCount >= 7) {
      const entryX = pad + 0.62 * chartW;
      const entryY = top + 0.52 * (bot - top);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(entryX - 6, entryY + 8);
      ctx.lineTo(entryX + 6, entryY + 8);
      ctx.lineTo(entryX, entryY - 2);
      ctx.fill();
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('ENTRY', entryX, entryY + 20);
    }

    // Stop loss line
    if (visibleCount >= 7) {
      const slY = top + 0.58 * (bot - top);
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = 'rgba(239,68,68,0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(pad + 0.56 * chartW, slY); ctx.lineTo(pad + 0.68 * chartW, slY); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(239,68,68,0.6)';
      ctx.font = '7px system-ui';
      ctx.fillText('SL', pad + 0.69 * chartW, slY + 3);
    }

    // Legend
    ctx.font = '9px system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(52,211,153,0.6)'; ctx.fillText('● Structure', pad, bot + 14);
    ctx.fillStyle = 'rgba(245,158,11,0.6)'; ctx.fillText('● Entry at OB', pad + 80, bot + 14);
    ctx.fillStyle = 'rgba(34,211,238,0.6)'; ctx.fillText('● Target', pad + 170, bot + 14);
    ctx.fillStyle = 'rgba(239,68,68,0.6)'; ctx.fillText('● Stop', pad + 230, bot + 14);
  }, []);
  return <AnimScene drawFn={draw} height={320} />;
}

// ============================================================
// ANIMATION 2: Checklist Flow — 5 conditions lighting up
// Shows each condition being met before the "TRADE" signal fires
// ============================================================
function ChecklistFlowAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;
    const cycle = t % 6;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Model 1 Checklist — All 5 Must Be Green', w / 2, 14);

    const checks = [
      { label: 'HTF Trend Confirmed', icon: '📈' },
      { label: 'BOS on Entry TF', icon: '💥' },
      { label: 'Pullback to OB/FVG', icon: '🎯' },
      { label: 'Kill Zone Active', icon: '⏰' },
      { label: 'Entry Trigger Fired', icon: '🚦' },
    ];

    const boxW = w * 0.7;
    const boxH = 36;
    const startX = (w - boxW) / 2;
    const startY = 34;
    const gap = 6;

    checks.forEach((c, i) => {
      const y = startY + i * (boxH + gap);
      const lit = cycle > (i + 1) * 0.8;

      // Box
      ctx.fillStyle = lit ? 'rgba(52,211,153,0.08)' : 'rgba(255,255,255,0.02)';
      ctx.beginPath(); ctx.roundRect(startX, y, boxW, boxH, 8); ctx.fill();
      ctx.strokeStyle = lit ? 'rgba(52,211,153,0.4)' : 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1; ctx.stroke();

      // Check or pending
      ctx.font = '14px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(c.icon, startX + 10, y + boxH / 2 + 5);

      ctx.font = '11px system-ui';
      ctx.fillStyle = lit ? '#34d399' : 'rgba(255,255,255,0.3)';
      ctx.fillText(c.label, startX + 34, y + boxH / 2 + 4);

      // Status
      ctx.textAlign = 'right';
      ctx.font = 'bold 10px system-ui';
      ctx.fillStyle = lit ? '#34d399' : 'rgba(255,255,255,0.15)';
      ctx.fillText(lit ? '✓' : '○', startX + boxW - 12, y + boxH / 2 + 4);
    });

    // Result bar
    const allLit = cycle > 5 * 0.8;
    const resultY = startY + 5 * (boxH + gap) + 10;
    if (allLit) {
      const pulse = 0.7 + 0.3 * Math.sin(t * 3);
      ctx.fillStyle = `rgba(52,211,153,${0.1 * pulse})`;
      ctx.beginPath(); ctx.roundRect(startX, resultY, boxW, boxH + 4, 10); ctx.fill();
      ctx.strokeStyle = `rgba(52,211,153,${0.6 * pulse})`;
      ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 13px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('✓  ALL CONDITIONS MET — EXECUTE TRADE', w / 2, resultY + boxH / 2 + 5);
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.02)';
      ctx.beginPath(); ctx.roundRect(startX, resultY, boxW, boxH + 4, 10); ctx.fill();
      ctx.strokeStyle = 'rgba(239,68,68,0.2)';
      ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = 'rgba(239,68,68,0.4)';
      ctx.font = 'bold 11px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('WAITING — Conditions incomplete', w / 2, resultY + boxH / 2 + 5);
    }
  }, []);
  return <AnimScene drawFn={draw} height={320} />;
}

// ============================================================
// DATA
// ============================================================
const modelSteps = [
  { num: '1', title: 'Identify Higher Timeframe Trend', desc: 'Check the 4H or Daily chart. Is the market making Higher Highs and Higher Lows (bullish) or Lower Highs and Lower Lows (bearish)? If the structure is unclear, this model does NOT apply — walk away.', tip: 'Use the 200 EMA as a quick filter: price above 200 EMA = bullish bias, below = bearish. But the structure (HH/HL) is the real confirmation.' },
  { num: '2', title: 'Wait for Break of Structure (BOS) on Entry TF', desc: 'Drop to your entry timeframe (15M or 1H). Wait for a BOS in the SAME direction as the higher timeframe trend. This confirms that the trend is actively continuing, not just drifting.', tip: 'A BOS is when price breaks above the previous swing high (bullish) or below the previous swing low (bearish). This is your first "green light."' },
  { num: '3', title: 'Mark the Order Block or FVG', desc: 'After the BOS, identify the Order Block (last bearish candle before the bullish BOS) or the Fair Value Gap (3-candle imbalance) left behind. Price will likely pull back to fill these zones.', tip: 'The OB and FVG are where smart money placed their orders. When price returns, they defend their position — that is YOUR entry zone.' },
  { num: '4', title: 'Wait for Pullback INTO the Zone', desc: 'Do NOT chase the BOS candle. Let price come back to the OB or FVG naturally. This pullback is the market giving you a discount entry into a confirmed trend.', tip: 'The hardest part of Model 1 is WAITING. Most traders see the BOS and jump in at the top. The edge is in the pullback — that patience IS the strategy.' },
  { num: '5', title: 'Confirm Entry Trigger at the Zone', desc: 'Once price reaches the OB/FVG, look for a specific entry trigger: bullish engulfing, rejection wick, lower timeframe BOS, or RSI divergence. The trigger removes guesswork.', tip: 'No trigger = no trade. If price slices through the OB without showing rejection, the zone has failed. Accept it and wait for the next setup.' },
  { num: '6', title: 'Place Stop Below Structure', desc: 'Stop goes below the OB low (for longs) or above the OB high (for shorts). Add 3 pips + spread for safety. If price reaches your stop, your thesis is genuinely wrong.', tip: 'Never move your stop further from entry to "give it room." If the structure is broken, you are wrong. Accept the loss.' },
  { num: '7', title: 'Target: Previous High or Next Liquidity Pool', desc: 'TP1 at the previous swing high (1:1 R:R approximately). TP2 at the next liquidity pool above (1:2+ R:R). Move stop to breakeven after TP1 hits.', tip: 'If using a fixed R:R approach: TP1 at 1:1, close 50%. TP2 at 1:2, close remaining 50%. This protects profit while allowing runners.' },
];

const commonFilters = [
  { icon: '⏰', title: 'Kill Zone Filter', desc: 'Only take Model 1 trades during London or NY sessions. Asia session pullbacks often lack the volume for continuation. The Overlap (London + NY) is the highest-probability window.' },
  { icon: '📊', title: 'Volume Confirmation', desc: 'The BOS candle should have above-average volume. A BOS on thin volume is weak and more likely to be a liquidity grab than genuine continuation.' },
  { icon: '🔀', title: 'RSI Divergence Check', desc: 'If RSI shows bearish divergence at the BOS (price making HH, RSI making LH), the trend might be exhausting. Reduce position size or skip the trade entirely.' },
  { icon: '📐', title: 'Premium/Discount Zone', desc: 'Ideal Model 1 entries happen when the pullback reaches the discount zone (below 50% of the last swing range). Entries in the premium zone have lower probability.' },
];

const gameRounds = [
  { scenario: 'Gold 4H shows clear HH/HL structure (bullish). On the 15M chart, price just broke above the previous swing high with a strong impulse candle. The OB from the move is 20 pips below current price. What do you do?', options: [
    { text: 'Enter immediately — the BOS confirms the trend', correct: false, explain: 'Entering at the BOS is chasing. You are buying at the TOP of the impulse move. The edge is in the pullback to the OB, not the breakout itself. Wait for price to come back to the OB 20 pips below.' },
    { text: 'Wait for price to pull back to the OB, then look for an entry trigger at that level', correct: true, explain: 'Correct. Steps 3-5 of Model 1: mark the OB, wait for the pullback, confirm with a trigger. The BOS is Step 2 — you are not ready to enter yet. Patience here is what separates this from gambling.' },
    { text: 'Short the market — it\'s overextended after the BOS', correct: false, explain: 'Shorting against a confirmed bullish trend with a fresh BOS is counter-trend trading. That is Model 2 (reversal), not Model 1, and requires different conditions.' },
    { text: 'Move to the 1M chart to find a faster entry', correct: false, explain: 'Dropping to 1M introduces noise and commission costs. Your plan is 15M entries — stick to it. The OB on 15M is your zone.' },
  ]},
  { scenario: 'EUR/USD Daily is bearish (LH/LL). On the 1H chart, you see a bearish BOS. Price pulls back to an FVG from the BOS move. At the FVG, a strong bearish rejection wick forms during London session. BUT RSI shows bullish divergence on the 1H. What do you do?', options: [
    { text: 'Enter short — the setup is perfect', correct: false, explain: 'The setup looks good but RSI bullish divergence on the entry TF is a warning flag. It means selling pressure is weakening. This doesn\'t mean skip entirely, but proceed with caution.' },
    { text: 'Enter short with REDUCED position size — the divergence is a caution flag, not a disqualifier', correct: true, explain: 'Correct. The HTF trend is bearish, BOS confirms, pullback to FVG, rejection wick during KZ — that\'s 4 out of 5 conditions met. The RSI divergence adds risk but doesn\'t invalidate the setup. Reducing size from 1% to 0.5% acknowledges the warning while still taking the trade.' },
    { text: 'Skip entirely — RSI divergence means the trend is reversing', correct: false, explain: 'RSI divergence doesn\'t guarantee reversal. It means momentum is slowing. In a strong bearish trend, price can continue lower even with divergence. Skipping entirely is too conservative for Model 1.' },
    { text: 'Enter long instead — the divergence means a reversal is coming', correct: false, explain: 'Going long against a bearish Daily trend with a fresh bearish BOS on the 1H because of RSI divergence alone is extremely risky. Divergence is a warning, not a reversal signal.' },
  ]},
  { scenario: 'You identified a perfect Model 1 setup on Gold 15M. HTF bullish, BOS confirmed, price pulled back to the OB. But it is 2:30 AM GMT — deep in the Asian session. What do you do?', options: [
    { text: 'Enter — the setup is valid regardless of session', correct: false, explain: 'The setup criteria are met, but the Kill Zone filter is not. Gold during the Asian session has low volume, wider spreads, and limited follow-through. A perfect setup at the wrong TIME has much lower probability.' },
    { text: 'Skip this trade — set an alert for London open and look for the same setup then', correct: true, explain: 'Correct. Kill Zone timing is one of the 5 conditions. A Model 1 setup at 2:30 AM on Gold is like a football team scoring in an empty stadium — the mechanics are right but the environment doesn\'t support it. Set the alert and wait for volume.' },
    { text: 'Enter with a wider stop to account for Asian session noise', correct: false, explain: 'A wider stop doesn\'t fix the problem. The issue isn\'t stop size — it\'s that the move you\'re expecting (trend continuation) requires volume that doesn\'t exist at 2:30 AM on Gold.' },
    { text: 'Switch to a forex pair that moves during Asia, like USD/JPY', correct: false, explain: 'Switching instruments on the fly is the opposite of specialisation. If your strategy is Gold Model 1, trade Gold during Gold hours. Don\'t jump to another asset you haven\'t studied.' },
  ]},
  { scenario: 'NASDAQ Daily is bullish. On the 15M chart, price breaks above the previous high (BOS). You mark the OB and wait. Price pulls back... and SLICES straight through the OB without any rejection. It keeps falling. What happened and what do you do?', options: [
    { text: 'Enter anyway — the OB is supposed to hold', correct: false, explain: 'An OB that gets sliced through without rejection is a FAILED zone. Entering a failed zone is catching a falling knife. OBs work because smart money defends them — if they don\'t defend, your thesis is wrong.' },
    { text: 'The OB failed — this is now a potential reversal setup (Model 2), not a continuation setup', correct: true, explain: 'Correct. When the OB fails, Model 1 is invalidated on this setup. The pullback went too deep, which means either: (a) the BOS was a liquidity grab, not genuine, or (b) the higher-timeframe trend is exhausting. Either way, Model 1 doesn\'t apply here. Wait for a new BOS to form.' },
    { text: 'Add a second position to average down your entry price', correct: false, explain: 'Averaging down on a failed setup compounds the loss. You went from "wrong once" to "wrong twice with double the risk." Never add to a losing position on a failed thesis.' },
    { text: 'Move your stop further down to give it more room', correct: false, explain: 'Moving your stop widens your risk beyond what you planned. If the OB failed, the thesis is broken. A wider stop just means a bigger loss when it continues falling.' },
  ]},
  { scenario: 'You have been waiting for a Gold Model 1 pullback for 3 hours. Price pulled back to 2 pips above your OB zone but bounced before touching it. It is now making new highs. You feel frustrated about missing the trade. What is the correct response?', options: [
    { text: 'Chase the entry — it clearly worked, just enter at market', correct: false, explain: 'Chasing means entering at a worse price with a wider stop. Your R:R is now 1:1 instead of 1:2. The frustration of missing is emotional, not strategic. Model 1 requires the pullback to reach the zone.' },
    { text: 'Accept the miss — not every setup reaches the zone, and that is normal and expected', correct: true, explain: 'Correct. Model 1 does NOT guarantee price reaches your zone. Maybe 60-70% of setups pull back deep enough. The 30-40% that don\'t are not "missed trades" — they are trades that never existed. Your rules protected you from entering without confirmation. That discipline IS the edge.' },
    { text: 'Lower your OB zone so it\'s easier to reach next time', correct: false, explain: 'Adjusting your zones to be "easier to hit" defeats the purpose. The OB is where it is based on structure, not convenience. Easier entries = weaker zones = more stops hit.' },
    { text: 'Switch to Model 2 and look for a reversal trade', correct: false, explain: 'Switching models because you missed a Model 1 entry is emotional decision-making. Model 2 requires its own distinct setup criteria — you can\'t just "switch" because you\'re frustrated.' },
  ]},
];

const quizQuestions = [
  { q: 'What is the FIRST step in a Model 1 Trend Continuation trade?', opts: ['Find an Order Block on the 15M chart', 'Confirm the higher timeframe trend direction (HH/HL or LH/LL)', 'Wait for a pullback', 'Set your stop loss'], correct: 1, explain: 'Everything starts with the HTF trend. If the higher timeframe structure is unclear, Model 1 does not apply. The HTF trend is the foundation — without it, every other step is built on sand.' },
  { q: 'What does a Break of Structure (BOS) confirm in Model 1?', opts: ['That the trend is about to reverse', 'That smart money has exited the market', 'That the trend is actively continuing in the same direction as the HTF', 'That volume is increasing'], correct: 2, explain: 'A BOS on the entry timeframe in the SAME direction as the HTF trend confirms active continuation. It is the second green light — the trend is not just existing, it is PROGRESSING.' },
  { q: 'Why do you wait for a pullback to the OB/FVG instead of entering at the BOS?', opts: ['Because the BOS is always a fake move', 'Because the pullback gives you a better entry price with tighter stop and better R:R', 'Because you need to wait 24 hours after any BOS', 'Because OBs are more accurate than BOS'], correct: 1, explain: 'Entering at the BOS means buying at the top of the impulse. The pullback gives you a discount entry — your stop is tighter (behind the OB) and your target is further away. Same trade, better R:R, better probability.' },
  { q: 'What should you do if price slices through the OB without showing any rejection?', opts: ['Enter anyway — the OB should eventually hold', 'Add more size to average down', 'Accept that the OB failed and Model 1 is invalidated — wait for a new setup', 'Move to a lower timeframe to find a hidden entry'], correct: 2, explain: 'A failed OB means smart money did NOT defend the zone. Your thesis is broken. Entering a broken zone is hoping, not trading. Wait for a new BOS and a new OB to form.' },
  { q: 'Where should your stop loss be placed in a bullish Model 1 trade?', opts: ['20 pips below entry', 'Below the Order Block low + a few pips for safety', 'At the 200 EMA', 'At the previous day\'s low'], correct: 1, explain: 'The stop goes below the OB low because that is where your thesis is invalidated. If price breaks below the OB, smart money\'s position has been overwhelmed. Fixed pip stops have no structural meaning.' },
  { q: 'Why is the Kill Zone filter important for Model 1?', opts: ['Markets are closed outside kill zones', 'Kill zones have the highest volume — continuation moves need volume to follow through', 'Kill zones have wider spreads which are more profitable', 'It doesn\'t matter — Model 1 works 24/7'], correct: 1, explain: 'Trend continuation requires institutional volume to push price to new highs/lows. That volume is concentrated in London and NY sessions. A perfect Model 1 setup at 3 AM has no fuel to continue.' },
  { q: 'A Model 1 setup has a 55% win rate and 1:2 R:R. What is the expected value per £100 risked?', opts: ['−£10 (losing)', '+£10 (barely profitable)', '+£55 (profitable)', '+£65 (very profitable)'], correct: 2, explain: 'EV = (0.55 × £200) − (0.45 × £100) = £110 − £45 = +£65 per trade. A 55% WR with 1:2 R:R is a strong edge. Model 1 works because the R:R compensates for the trades that don\'t work out.' },
  { q: 'What is the most common mistake traders make with Model 1?', opts: ['Using the wrong indicator', 'Chasing the BOS instead of waiting for the pullback to the OB', 'Trading during London session', 'Using too tight a stop loss'], correct: 1, explain: 'Chasing is the #1 Model 1 killer. Traders see the BOS, get excited, and enter at the top. The pullback is where the edge lives — skipping it means buying at a premium with a wide stop and poor R:R.' },
];

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

function Confetti({ active }: { active: boolean }) {
  if (!active) return null;
  return (<div className="fixed inset-0 pointer-events-none z-50">{Array.from({ length: 60 }).map((_, i) => (<motion.div key={i} initial={{ y: -20, x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400), opacity: 1 }} animate={{ y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 20, rotate: Math.random() * 720, opacity: 0 }} transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5 }} className="absolute w-2 h-2 rounded-sm" style={{ background: ['#f59e0b', '#d946ef', '#34d399', '#3b82f6', '#ef4444'][i % 5] }} />))}</div>);
}

export default function Model1TrendContinuationLesson() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);

  // Expandable steps
  const [openStep, setOpenStep] = useState<number | null>(null);
  // Expandable filters
  const [openFilter, setOpenFilter] = useState<number | null>(null);

  // Interactive — Model 1 Checklist Simulator
  const [checkStates, setCheckStates] = useState<boolean[]>(Array(5).fill(false));
  const toggleCheck = (i: number) => { const next = [...checkStates]; next[i] = !next[i]; setCheckStates(next); };
  const allChecked = checkStates.every(Boolean);
  const checkLabels = ['HTF Trend Confirmed', 'BOS on Entry TF', 'Pullback to OB/FVG', 'Kill Zone Active', 'Entry Trigger Fired'];

  // Expandable mistakes
  const [openMistake, setOpenMistake] = useState<number | null>(null);
  const mistakes = [
    { title: 'Chasing the BOS candle', desc: 'The BOS is Step 2 of 7. It is a confirmation, not an entry signal. Buying at the BOS means buying at the highest price in the impulse with the widest possible stop. The pullback to the OB gives you the same trade at a better price.' },
    { title: 'Entering without a trigger', desc: '"Price is at my OB" is not a trigger. A trigger is a SPECIFIC candle pattern or price action event at the OB: engulfing, rejection wick, lower-TF BOS, RSI divergence. Without a trigger, you are guessing whether the OB will hold.' },
    { title: 'Ignoring the Higher Timeframe', desc: 'A 15M BOS in a range-bound 4H chart is NOT a Model 1 setup. The HTF must show clear trending structure. Without HTF direction, you are trading noise on the lower timeframe.' },
    { title: 'Trading Model 1 during Asian session on Gold', desc: 'Gold has minimal volume from 22:00-06:00 GMT. A Model 1 setup needs institutional volume to push to new structure. Setting up during Asia means the move won\'t have fuel until London opens — by which time the setup may have been invalidated.' },
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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 6 &middot; Lesson 3</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Model 1:<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Trend Continuation</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">The bread and butter of professional trading. BOS + pullback to OB/FVG. High probability, clear structure, repeatable edge.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* S00 */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">🔍 Surfing, Not Swimming</p>
            <p className="text-gray-400 leading-relaxed mb-4">Model 1 is like surfing a wave, not swimming against it. You wait for the ocean (higher timeframe) to push a wave in your direction. You wait for the wave to form (BOS). Then you paddle into position (pullback to OB) and ride it. You never fight the current.</p>
            <p className="text-gray-400 leading-relaxed">This is the model that professional prop traders use most. It is not glamorous. It does not catch tops or bottoms. But it has the highest probability of any SMC model because you are trading WITH the institutional flow, not against it.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">In a 500-trade backtest across Gold and EUR/USD: Model 1 (trend continuation) achieved a <strong className="text-green-400">57% win rate with 1:2 average R:R</strong> during kill zone hours. The same setups outside kill zones dropped to <strong className="text-red-400">41% win rate</strong>. The model works &mdash; but only when ALL conditions are met.</p>
          </div>
        </motion.div>
      </section>

      {/* S01 — Trend Continuation Animation */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Model Visualised</p>
          <h2 className="text-2xl font-extrabold mb-4">See the Full Lifecycle</h2>
          <p className="text-gray-400 text-sm mb-6">Watch the trend continuation model play out step by step: structure forms, BOS fires, price pulls back to the OB, entry triggers, and the trade reaches target.</p>
          <TrendContinuationAnimation />
          <div className="mt-4 p-4 rounded-xl bg-sky-500/5 border border-sky-500/15">
            <p className="text-sm text-gray-400 leading-relaxed">💡 <strong className="text-sky-400">The key insight:</strong> The entry is NOT at the BOS. It is at the pullback to the OB. The BOS tells you the trend is alive. The pullback gives you the discount entry. Patience between the BOS and the pullback IS the edge.</p>
          </div>
        </motion.div>
      </section>

      {/* S02 — Checklist Flow Animation */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The 5-Point Checklist</p>
          <h2 className="text-2xl font-extrabold mb-4">All 5 Must Be Green</h2>
          <p className="text-gray-400 text-sm mb-6">Model 1 is a checklist, not a feeling. Watch each condition light up before the trade activates.</p>
          <ChecklistFlowAnimation />
        </motion.div>
      </section>

      {/* S03 — 7 Steps Decoded */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The 7 Steps</p>
          <h2 className="text-2xl font-extrabold mb-4">Model 1 — Step by Step</h2>
          <p className="text-gray-400 text-sm mb-6">Open each step to see the detail and the pro tip.</p>
          <div className="space-y-3">
            {modelSteps.map((s, i) => (
              <div key={i}>
                <button onClick={() => setOpenStep(openStep === i ? null : i)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-xs font-bold text-amber-400">{s.num}</span>
                    <p className="text-sm font-extrabold text-white">{s.title}</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openStep === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openStep === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05] space-y-3">
                      <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
                      <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10"><p className="text-xs text-amber-400">💡 <strong>Pro Tip:</strong> {s.tip}</p></div>
                    </div>
                  </motion.div>
                )}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S04 — Confluence Filters */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Confluence Filters</p>
          <h2 className="text-2xl font-extrabold mb-4">Stack the Odds Further</h2>
          <p className="text-gray-400 text-sm mb-6">The 7 steps are the minimum. These filters increase your probability.</p>
          <div className="space-y-3">
            {commonFilters.map((cf, i) => (
              <div key={i}>
                <button onClick={() => setOpenFilter(openFilter === i ? null : i)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <div className="flex items-center gap-3"><span className="text-xl">{cf.icon}</span><p className="text-sm font-extrabold text-white">{cf.title}</p></div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openFilter === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openFilter === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-sm text-gray-400 leading-relaxed">{cf.desc}</p></div>
                  </motion.div>
                )}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S05 — Interactive Checklist Simulator */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Checklist Simulator</p>
          <h2 className="text-2xl font-extrabold mb-2">Try It Yourself</h2>
          <p className="text-gray-400 text-sm mb-6">Toggle each condition on/off. See how the trade decision changes when conditions are missing.</p>
          <div className="p-6 rounded-2xl glass-card">
            <div className="space-y-3 mb-6">
              {checkLabels.map((label, i) => (
                <button key={i} onClick={() => toggleCheck(i)} className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${checkStates[i] ? 'bg-green-500/10 border border-green-500/30' : 'bg-white/[0.03] border border-white/[0.06]'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${checkStates[i] ? 'bg-green-500/20 text-green-400' : 'bg-white/[0.05] text-gray-600'}`}>{checkStates[i] ? '✓' : i + 1}</div>
                    <p className={`text-sm font-semibold ${checkStates[i] ? 'text-green-400' : 'text-gray-400'}`}>{label}</p>
                  </div>
                  <span className={`text-xs font-bold ${checkStates[i] ? 'text-green-400' : 'text-gray-600'}`}>{checkStates[i] ? 'MET' : 'NOT MET'}</span>
                </button>
              ))}
            </div>
            <div className={`p-4 rounded-xl text-center transition-all ${allChecked ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/5 border border-red-500/15'}`}>
              <p className={`text-lg font-extrabold ${allChecked ? 'text-green-400' : 'text-red-400'}`}>{allChecked ? '✓ EXECUTE TRADE' : '✗ DO NOT TRADE'}</p>
              <p className="text-xs text-gray-500 mt-1">{allChecked ? 'All 5 conditions met. Enter with confidence.' : `${checkStates.filter(Boolean).length}/5 conditions met. ${5 - checkStates.filter(Boolean).length} missing — no trade.`}</p>
              {!allChecked && checkStates.filter(Boolean).length >= 3 && (<p className="text-xs text-amber-400 mt-2">⚠️ Close but not complete. Taking trades with 3-4 conditions drops win rate by 15-25%. The missing conditions are there for a reason.</p>)}
            </div>
          </div>
        </motion.div>
      </section>

      {/* S06 — When Model 1 Does NOT Apply */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; When NOT to Use Model 1</p>
          <h2 className="text-2xl font-extrabold mb-4">Know Your Boundaries</h2>
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <p className="text-gray-400 leading-relaxed">Model 1 is powerful but it is NOT a universal tool. It fails in specific conditions:</p>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15"><p className="text-sm text-gray-400"><strong className="text-red-400">Ranging HTF:</strong> If the 4H/Daily is choppy with no clear HH/HL or LH/LL, there is no trend to continue. Model 1 becomes a coin flip.</p></div>
              <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15"><p className="text-sm text-gray-400"><strong className="text-red-400">After extended trend:</strong> After 5+ consecutive BOS moves, the trend is likely exhausting. Model 1 becomes lower probability. Look for divergence warnings.</p></div>
              <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15"><p className="text-sm text-gray-400"><strong className="text-red-400">Major news events:</strong> NFP, FOMC, CPI releases create unpredictable volatility. Existing structure gets destroyed. Wait for new structure to form after the event.</p></div>
              <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15"><p className="text-sm text-gray-400"><strong className="text-red-400">Conflicting timeframes:</strong> Daily bullish but 4H just made a lower low. When timeframes disagree, sit out until they realign.</p></div>
            </div>
            <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/15">
              <p className="text-sm text-gray-400 leading-relaxed">💡 <strong className="text-purple-400">The Umbrella Analogy:</strong> Model 1 is like an umbrella — perfect for rain but useless in a hurricane. Know the weather before you bring it out.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S07 — Real Trade Walkthrough */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Real Trade Walkthrough</p>
          <h2 className="text-2xl font-extrabold mb-4">Gold Model 1 — Step by Step</h2>
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm text-gray-400"><strong className="text-sky-400">Step 1:</strong> Gold Daily shows clear HH/HL structure. Price above 200 EMA. Bullish bias confirmed.</p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm text-gray-400"><strong className="text-sky-400">Step 2:</strong> Drop to 15M. A strong bullish BOS breaks the previous swing high at 2,340 with a full-body candle. Volume is 1.8x average.</p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm text-gray-400"><strong className="text-green-400">Step 3:</strong> The last bearish candle before the BOS (the OB) sits at 2,328-2,332. An FVG also formed between 2,334-2,337.</p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm text-gray-400"><strong className="text-amber-400">Step 4:</strong> Price pulls back from 2,345 down to 2,331 — right into the OB zone. It is 09:45 GMT — London KZ active.</p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm text-gray-400"><strong className="text-amber-400">Step 5:</strong> A bullish engulfing candle forms at 2,331 with a lower wick that sweeps the OB low at 2,328 then closes above 2,333. Trigger confirmed.</p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm text-gray-400"><strong className="text-red-400">Step 6:</strong> Stop at 2,325 (OB low 2,328 minus 3 pips). Risk = 8 pips from entry at 2,333.</p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm text-gray-400"><strong className="text-green-400">Step 7:</strong> TP1 at 2,341 (1:1 R:R, previous high). TP2 at 2,349 (1:2 R:R). Move SL to breakeven after TP1.</p></div>
            <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/15"><p className="text-sm text-green-400 font-bold">Result: TP1 hit in 45 minutes. TP2 hit 2 hours later. Full 1:2 R:R captured.</p></div>
          </div>
        </motion.div>
      </section>

      {/* S08 — Common Mistakes */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-6">4 Model 1 Killers</h2>
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
          <h2 className="text-2xl font-extrabold mb-4">Model 1 Quick Reference</h2>
          <div className="p-6 rounded-2xl glass-card space-y-3">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-sky-400">HTF</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Must show clear HH/HL (bull) or LH/LL (bear). No trend = no Model 1.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-green-400">BOS</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Entry TF break of structure in HTF direction. Confirmation, not entry.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">OB/FVG</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Mark the zone left behind by the BOS. This is your entry zone.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">Pullback</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Wait for price to return to the OB/FVG. Do NOT chase.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-purple-400">Trigger</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Specific candle/action at the zone. Engulfing, wick rejection, LTF BOS, or RSI div.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-red-400">Stop</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Below OB low (longs) or above OB high (shorts) + buffer.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-green-400">Target</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">TP1 at previous HH (1:1). TP2 at next liquidity pool (1:2+). BE after TP1.</span></p></div>
          </div>
        </motion.div>
      </section>

      {/* S10 — Game */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Test Your Understanding</p>
          <h2 className="text-2xl font-extrabold mb-2">Model 1 Decision Game</h2>
          <p className="text-gray-400 text-sm mb-6">5 live scenarios. Make the right call at each stage of Model 1.</p>
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
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Excellent — you can execute Model 1 with discipline.' : gameScore >= 3 ? 'Solid — review the steps where you hesitated.' : 'Re-read the 7 steps and the "When NOT to use" section, then try again.'}</p></motion.div>)}
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
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-green-500 to-amber-500 flex items-center justify-center text-3xl shadow-lg shadow-green-500/30">🏄</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 6: Model 1 — Trend Continuation</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-green-400 via-amber-400 to-green-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Trend Surfer &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L6.3-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
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
