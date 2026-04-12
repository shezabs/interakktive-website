// app/academy/lesson/entry-trigger-mastery/page.tsx
// ATLAS Academy — Lesson 6.5: Entry Trigger Mastery [PRO]
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
// ANIMATION 1: Setup vs Trigger — Traffic Light Analogy
// Left: car waiting at red (setup ready). Right: light turns green (trigger fires).
// ============================================================
function TrafficLightAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;
    const cycle = t % 5;
    const mid = w / 2;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Setup = Red Light (Wait)   →   Trigger = Green Light (Go)', mid, 14);

    // Traffic light housing
    const lightX = mid;
    const lightY = h * 0.35;
    const lightW = 40;
    const lightH = 100;

    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath(); ctx.roundRect(lightX - lightW / 2, lightY - lightH / 2, lightW, lightH, 8); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1.5; ctx.stroke();

    // Three lights
    const isGreen = cycle > 3;
    const isAmber = cycle > 2.5 && cycle <= 3;

    // Red
    ctx.beginPath(); ctx.arc(lightX, lightY - 28, 12, 0, Math.PI * 2);
    ctx.fillStyle = !isGreen && !isAmber ? 'rgba(239,68,68,0.9)' : 'rgba(239,68,68,0.15)'; ctx.fill();
    // Amber
    ctx.beginPath(); ctx.arc(lightX, lightY, 12, 0, Math.PI * 2);
    ctx.fillStyle = isAmber ? 'rgba(245,158,11,0.9)' : 'rgba(245,158,11,0.15)'; ctx.fill();
    // Green
    ctx.beginPath(); ctx.arc(lightX, lightY + 28, 12, 0, Math.PI * 2);
    ctx.fillStyle = isGreen ? 'rgba(52,211,153,0.9)' : 'rgba(52,211,153,0.15)'; ctx.fill();

    // Left side — Setup conditions (checklist)
    const checks = ['HTF Trend ✓', 'BOS ✓', 'At OB/FVG ✓', 'Kill Zone ✓'];
    const checkX = w * 0.15;
    const checkStartY = h * 0.22;

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('SETUP (Ready)', checkX + 40, checkStartY - 10);

    checks.forEach((c, i) => {
      const y = checkStartY + i * 24;
      ctx.fillStyle = 'rgba(52,211,153,0.12)';
      ctx.beginPath(); ctx.roundRect(checkX, y, 80, 20, 4); ctx.fill();
      ctx.fillStyle = '#34d399';
      ctx.font = '9px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(c, checkX + 6, y + 14);
    });

    // Right side — Trigger types
    const triggerX = w * 0.68;
    const triggerStartY = h * 0.22;

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('TRIGGER (Go)', triggerX + 50, triggerStartY - 10);

    const triggers = ['Engulfing', 'Wick Reject', 'LTF BOS', 'RSI Div', 'FVG Fill'];
    const activeT = isGreen ? Math.floor((cycle - 3) * 5) % 5 : -1;

    triggers.forEach((tr, i) => {
      const y = triggerStartY + i * 22;
      const active = i === activeT;
      ctx.fillStyle = active ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.03)';
      ctx.beginPath(); ctx.roundRect(triggerX, y, 100, 18, 4); ctx.fill();
      ctx.strokeStyle = active ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = active ? '#f59e0b' : 'rgba(255,255,255,0.3)';
      ctx.font = active ? 'bold 9px system-ui' : '9px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(active ? `→ ${tr}` : tr, triggerX + 6, y + 13);
    });

    // Bottom status
    ctx.textAlign = 'center';
    ctx.font = 'bold 12px system-ui';
    if (isGreen) {
      ctx.fillStyle = '#34d399';
      ctx.fillText('✓  TRIGGER FIRED — ENTER TRADE', mid, h - 16);
    } else if (isAmber) {
      ctx.fillStyle = '#f59e0b';
      ctx.fillText('⏳  SETUP READY — WAITING FOR TRIGGER...', mid, h - 16);
    } else {
      ctx.fillStyle = 'rgba(239,68,68,0.6)';
      ctx.fillText('✗  NO TRIGGER — DO NOT ENTER', mid, h - 16);
    }
  }, []);
  return <AnimScene drawFn={draw} height={300} />;
}

// ============================================================
// ANIMATION 2: 5 Trigger Types — Visual demonstration
// Cycles through each trigger showing the candle pattern
// ============================================================
function TriggerTypesAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.008;
    const activeIdx = Math.floor(t) % 5;
    const mid = w / 2;

    const triggers = [
      { name: 'Bullish Engulfing', desc: 'Green candle body fully covers previous red candle body', color: '#34d399' },
      { name: 'Rejection Wick', desc: 'Long lower wick (2x+ body) showing buyers stepped in', color: '#f59e0b' },
      { name: 'Lower TF BOS', desc: 'Drop to 5M/1M — price breaks above the mini swing high', color: '#3b82f6' },
      { name: 'RSI Divergence', desc: 'Price makes lower low but RSI makes higher low at the OB', color: '#a78bfa' },
      { name: 'FVG Fill + Reject', desc: 'Price fills the gap, rejects with a strong close above it', color: '#22d3ee' },
    ];

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('5 Entry Triggers — Each Has Its Moment', mid, 14);

    // OB zone background
    const obTop = h * 0.45;
    const obBot = h * 0.60;
    ctx.fillStyle = 'rgba(52,211,153,0.06)';
    ctx.fillRect(w * 0.15, obTop, w * 0.7, obBot - obTop);
    ctx.strokeStyle = 'rgba(52,211,153,0.2)'; ctx.lineWidth = 1;
    ctx.strokeRect(w * 0.15, obTop, w * 0.7, obBot - obTop);
    ctx.fillStyle = 'rgba(52,211,153,0.3)'; ctx.font = '8px system-ui';
    ctx.textAlign = 'left'; ctx.fillText('ORDER BLOCK ZONE', w * 0.16, obTop + 12);

    const tr = triggers[activeIdx];

    // Draw the specific trigger pattern
    const candleX = mid;
    const candleW = 20;

    if (activeIdx === 0) {
      // Bullish Engulfing: small red then large green
      // Red candle
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(candleX - 30 - candleW / 2, obTop + 10, candleW, 25);
      ctx.fillRect(candleX - 30 - 1, obTop + 5, 2, 35);
      // Green engulfing
      ctx.fillStyle = '#34d399';
      ctx.fillRect(candleX - candleW / 2, obTop + 5, candleW, 35);
      ctx.fillRect(candleX - 1, obTop, 2, 45);
    } else if (activeIdx === 1) {
      // Rejection wick: small body, long lower wick
      ctx.fillStyle = '#34d399';
      ctx.fillRect(candleX - candleW / 2, obTop + 8, candleW, 12);
      ctx.fillRect(candleX - 1, obTop + 4, 2, 4); // upper wick
      ctx.strokeStyle = '#34d399'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(candleX, obTop + 20); ctx.lineTo(candleX, obBot - 5); ctx.stroke();
      // Label
      ctx.fillStyle = 'rgba(245,158,11,0.6)'; ctx.font = '7px system-ui'; ctx.textAlign = 'center';
      ctx.fillText('2x+ body length', candleX + 20, obBot - 10);
    } else if (activeIdx === 2) {
      // LTF BOS: mini swing with break
      const pts = [[0.30, 0.55], [0.38, 0.48], [0.44, 0.53], [0.50, 0.46], [0.56, 0.50], [0.62, 0.40]];
      ctx.beginPath();
      pts.forEach(([x, y], i) => {
        const px = w * x; const py = h * y;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 2; ctx.stroke();
      // BOS level
      const bosY = h * 0.46;
      ctx.setLineDash([3, 3]); ctx.strokeStyle = 'rgba(59,130,246,0.4)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(w * 0.48, bosY); ctx.lineTo(w * 0.65, bosY); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(59,130,246,0.6)'; ctx.font = '8px system-ui'; ctx.textAlign = 'left';
      ctx.fillText('LTF BOS ↑', w * 0.63, bosY - 4);
    } else if (activeIdx === 3) {
      // RSI Divergence: price lower, RSI higher
      // Price line going down
      ctx.beginPath(); ctx.moveTo(w * 0.30, h * 0.42); ctx.lineTo(w * 0.45, h * 0.52); ctx.lineTo(w * 0.60, h * 0.56);
      ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = 'rgba(239,68,68,0.5)'; ctx.font = '8px system-ui'; ctx.textAlign = 'right';
      ctx.fillText('Price: Lower Low ↓', w * 0.62, h * 0.40);
      // RSI line going up
      ctx.beginPath(); ctx.moveTo(w * 0.30, h * 0.72); ctx.lineTo(w * 0.45, h * 0.70); ctx.lineTo(w * 0.60, h * 0.65);
      ctx.strokeStyle = '#a78bfa'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = 'rgba(167,139,250,0.5)'; ctx.font = '8px system-ui';
      ctx.fillText('RSI: Higher Low ↑', w * 0.62, h * 0.76);
      // Divergence line
      ctx.setLineDash([2, 2]); ctx.strokeStyle = 'rgba(167,139,250,0.3)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(w * 0.60, h * 0.56); ctx.lineTo(w * 0.60, h * 0.65); ctx.stroke();
      ctx.setLineDash([]);
    } else {
      // FVG Fill: gap marked, price enters and rejects
      ctx.fillStyle = 'rgba(34,211,238,0.08)';
      ctx.fillRect(w * 0.32, obTop + 5, w * 0.36, 15);
      ctx.strokeStyle = 'rgba(34,211,238,0.3)'; ctx.lineWidth = 1;
      ctx.strokeRect(w * 0.32, obTop + 5, w * 0.36, 15);
      ctx.fillStyle = 'rgba(34,211,238,0.4)'; ctx.font = '7px system-ui'; ctx.textAlign = 'left';
      ctx.fillText('FVG', w * 0.33, obTop + 16);
      // Candle entering and rejecting
      ctx.fillStyle = '#34d399';
      ctx.fillRect(candleX - candleW / 2, obTop + 8, candleW, 18);
      ctx.fillRect(candleX - 1, obTop + 4, 2, 4);
      ctx.strokeStyle = '#34d399'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(candleX, obTop + 26); ctx.lineTo(candleX, obBot - 8); ctx.stroke();
    }

    // Active trigger label
    ctx.fillStyle = tr.color;
    ctx.font = 'bold 14px system-ui'; ctx.textAlign = 'center';
    ctx.fillText(tr.name, mid, h - 35);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui';
    ctx.fillText(tr.desc, mid, h - 18);

    // Dots indicator
    triggers.forEach((_, i) => {
      ctx.beginPath(); ctx.arc(mid - 30 + i * 15, h - 6, 3, 0, Math.PI * 2);
      ctx.fillStyle = i === activeIdx ? triggers[i].color : 'rgba(255,255,255,0.1)';
      ctx.fill();
    });
  }, []);
  return <AnimScene drawFn={draw} height={310} />;
}

// ============================================================
// DATA
// ============================================================
const triggerProfiles = [
  { icon: '🟢', name: 'Bullish/Bearish Engulfing', speed: 'Moderate', reliability: 'High', bestFor: 'Model 1 & Model 2 at OBs', desc: 'The current candle\'s body completely covers the previous candle\'s body in the opposite direction. A bullish engulfing at a demand OB means buyers overwhelmed sellers in a single candle — strong conviction.', when: 'Use when price reaches the OB zone and you need clear evidence that the zone is holding. Works on any timeframe.', avoid: 'Avoid if the engulfing candle has a tiny body (doji-like) or if volume is below average. A weak engulfing is not a genuine trigger — it is noise.', example: 'Gold pulls back to a 15M demand OB at 2,330. A bearish candle closes at 2,331. The next candle opens at 2,331, drops to 2,328 (sweeps the OB low), then closes at 2,336. The green body fully covers the red body. Entry at 2,336.' },
  { icon: '📌', name: 'Rejection Wick (Pin Bar)', speed: 'Fast', reliability: 'High', bestFor: 'Model 1 & Model 2 at OBs and FVGs', desc: 'A candle with a lower wick at least 2x the body length (for bullish). The wick shows that sellers pushed price into the zone, but buyers violently rejected it. The longer the wick relative to the body, the stronger the rejection.', when: 'Use when you need a fast confirmation at the zone. Rejection wicks often appear on the first touch of a strong OB. They are especially powerful when the wick sweeps below the OB low and closes back inside.', avoid: 'Avoid if the wick is only 1x the body (normal candle, not a rejection). Avoid if the rejection happens on very low volume — the "rejection" might just be a lack of sellers, not active buying.', example: 'EUR/USD reaches a 1H demand OB at 1.0850. A candle drops to 1.0842 (sweeps 8 pips below OB) then closes at 1.0858 with a 16-pip lower wick and 8-pip body. Wick = 2x body. Clear rejection. Entry at 1.0858.' },
  { icon: '📊', name: 'Lower Timeframe BOS', speed: 'Precise', reliability: 'Very High', bestFor: 'Model 2 reversals, high-conviction Model 1', desc: 'Drop to a lower timeframe (5M or 1M from 15M entry TF). Wait for a Break of Structure in the direction of your trade. This gives you the most precise entry because you see the micro-structure shift before the main TF confirms it.', when: 'Use when the OB zone is wide and you want a tighter entry within the zone. LTF BOS gives you the exact candle where buyers take control, rather than guessing from a higher TF pattern.', avoid: 'Avoid if you cannot monitor the lower timeframe in real-time. LTF BOS triggers require you to be at your screen watching the 5M/1M. If you set alerts and check later, the opportunity has often passed.', example: 'Gold 15M shows price at the demand OB. Drop to 5M. Price makes a lower low at the OB bottom, then breaks above the 5M swing high at 2,332. That 5M BOS is your trigger. Entry at 2,332 with stop below the 5M swing low.' },
  { icon: '🔀', name: 'RSI Divergence at Zone', speed: 'Slow', reliability: 'Very High', bestFor: 'Model 2 reversals, exhaustion entries', desc: 'RSI makes a higher low while price makes a lower low (bullish) or RSI makes a lower high while price makes a higher high (bearish) AT your entry zone. This is the strongest reversal trigger because it combines structural zone + momentum exhaustion.', when: 'Use for Model 2 setups at HTF levels. Divergence at an OB that also has a liquidity sweep is the highest-confluence entry in the ATLAS framework. It means the trend is dying AND the zone is holding.', avoid: 'Avoid using divergence as a standalone trigger outside of a zone. "RSI divergence on the 15M" without an OB, without a sweep, without a CHoCH is just a random oscillator reading — not a trigger.', example: 'Gold at weekly demand OB. Price makes a lower low at 2,275. RSI makes a higher low (41 vs previous 35). Meanwhile, the 2,275 low sweeps the 2,278 liquidity. CHoCH follows on 15M. Divergence + sweep + CHoCH + zone = maximum confluence.' },
  { icon: '🔲', name: 'FVG Fill + Rejection', speed: 'Moderate', reliability: 'Moderate', bestFor: 'Model 1 continuation entries', desc: 'Price fills a Fair Value Gap and immediately rejects with a strong close above the gap (bullish). The FVG represents an imbalance zone — when price returns to fill it and rejects, institutions are defending their position at fair value.', when: 'Use when the pullback reaches an FVG instead of (or alongside) an OB. FVG fills are especially useful when the OB is too far away — the FVG gives you an earlier entry in the pullback.', avoid: 'Avoid if price fills the FVG and continues through it without any rejection. A filled FVG that does not hold is not a trigger — it means the imbalance has been absorbed and the zone is dead.', example: 'NASDAQ 15M has a bullish BOS. An FVG sits between 18,450-18,465. Price pulls back to 18,455 (middle of FVG) and prints a bullish engulfing. The FVG held and produced a trigger. Entry at 18,465.' },
];

const gameRounds = [
  { scenario: 'Gold 15M: bullish setup confirmed. Price has pulled back to the demand OB at 2,330. The first candle at the OB is a small-bodied doji with equal upper and lower wicks. No significant volume. What do you do?', options: [
    { text: 'Enter — price is at the OB, that is enough', correct: false, explain: 'Being at the OB is the SETUP, not the trigger. A doji with equal wicks shows indecision, not rejection. There is no evidence yet that buyers are defending this zone.' },
    { text: 'Wait — this is NOT a trigger. A doji shows indecision. Wait for a proper engulfing, rejection wick, or LTF BOS before entering.', correct: true, explain: 'Correct. The doji is neutral — it tells you nothing about who will win at this zone. Patience here is the edge. Wait for a candle that shows CONVICTION: a full-body engulfing, a long rejection wick, or a 5M BOS above the zone.' },
    { text: 'Short the market — the doji means the OB will fail', correct: false, explain: 'A doji does not predict failure. It shows indecision. The OB might hold on the next candle with a strong engulfing. Shorting here is guessing.' },
    { text: 'Drop to 1M and enter immediately', correct: false, explain: 'Dropping to 1M is a valid approach for a LTF BOS trigger, but only after the 1M shows a structural break. Entering "immediately" on 1M without a trigger is the same problem — no confirmation.' },
  ]},
  { scenario: 'EUR/USD 1H: Model 2 reversal setup. Sweep + CHoCH confirmed. Price pulls back to the CHoCH OB. At the OB, RSI on the 1H shows bullish divergence AND a rejection wick forms with 3x body length. Which trigger are you using?', options: [
    { text: 'RSI Divergence only — ignore the wick', correct: false, explain: 'You don\'t have to choose just one. Having BOTH is better — but the question is which one gives you the actual entry timing.' },
    { text: 'The rejection wick — it gives the precise entry candle. The RSI divergence is confluence, not the trigger itself.', correct: true, explain: 'Correct. The wick is your TRIGGER (the specific candle that says "enter now"). The RSI divergence is CONFLUENCE (extra evidence supporting the thesis). You enter on the wick close, not when the divergence appears. Think of it as: divergence tells you the reversal is likely, the wick tells you the reversal is happening RIGHT NOW.' },
    { text: 'Both equally — enter as soon as either one appears', correct: false, explain: 'Divergence appeared before the wick (divergence builds over multiple candles). If you entered when divergence appeared but before the wick, you might have entered too early — price could still have dropped further before rejecting.' },
    { text: 'Neither — wait for a LTF BOS for extra confirmation', correct: false, explain: 'RSI divergence + 3x rejection wick at a CHoCH OB after a sweep is already maximum confluence. Adding a LTF BOS would mean missing the entry — the wick IS the entry candle.' },
  ]},
  { scenario: 'A trader uses "bullish engulfing at the OB" as his only trigger. He enters every time he sees one, regardless of wick length, volume, or session timing. After 3 months, his win rate is 39%. What is likely wrong?', options: [
    { text: 'Engulfing candles are unreliable — he should switch to a different trigger', correct: false, explain: 'Engulfing candles are reliable when used correctly. The issue is not the trigger type — it is the lack of QUALITY FILTERS on the trigger.' },
    { text: 'He is not filtering for quality — tiny-body engulfings, low volume, and dead sessions are diluting his results', correct: true, explain: 'Correct. Not all engulfings are equal. A small-body engulfing on below-average volume at 3 AM is noise, not a trigger. He needs quality filters: body must be larger than the 5-candle average, volume above 20-period SMA, and session must be active (London or NY). With these filters, the same trigger typically jumps to 50-55% win rate.' },
    { text: 'He needs to add more indicators to confirm each engulfing', correct: false, explain: 'More indicators add complexity, not quality. The fix is filtering the existing trigger for quality (size, volume, session), not adding RSI + MACD + Stochastic on top.' },
    { text: '39% is fine — his R:R is probably good enough', correct: false, explain: '39% can be profitable with high R:R, but the question is about WHAT IS WRONG, not whether it is profitable. The lack of quality filtering is the issue.' },
  ]},
  { scenario: 'NASDAQ 15M: bullish BOS, price at the OB. You drop to 5M looking for a LTF BOS trigger. The 5M makes a lower low at the OB bottom, then bounces... but does NOT break above the 5M swing high. It stalls just below. What do you do?', options: [
    { text: 'Enter anyway — it bounced, that is close enough', correct: false, explain: '"Close enough" is not a trigger. The LTF BOS requires a BREAK above the swing high. A bounce that stalls below it means buyers tried but failed to take control. This could go either way.' },
    { text: 'Wait — the LTF BOS has NOT fired. No trigger = no trade. Either wait for the 5M break or look for an alternative trigger (wick rejection, engulfing) on the 15M.', correct: true, explain: 'Correct. A LTF BOS that does not complete is not a trigger. The 5M price is testing but has not confirmed. You have two options: wait for the actual break, or pivot to a different trigger type on the 15M (if a strong engulfing or rejection wick appears while you wait).' },
    { text: 'Short it — the failed bounce means the OB will break', correct: false, explain: 'Shorting a bullish OB after a bounce in a bullish setup is counter-trend and speculative. The 5M is stalling, not reversing. Wait for clarity.' },
    { text: 'Add more position size to force the breakout', correct: false, explain: 'Your position size has no effect on whether the 5M breaks the swing high. This is magical thinking. The market does not care about your order size.' },
  ]},
  { scenario: 'You have identified the perfect Gold setup: HTF bullish, 15M BOS, price at the OB, London KZ active. You are watching for a trigger. A bearish engulfing candle forms at the OB — the OPPOSITE of what you wanted. What does this mean?', options: [
    { text: 'Ignore it — the setup is still valid, wait for the next candle', correct: false, explain: 'You should not ignore a bearish engulfing at your demand OB. It is direct evidence that sellers are active at this zone. While it does not guarantee failure, it significantly reduces the probability of the OB holding.' },
    { text: 'The OB is showing weakness — reduce your conviction. If the next candle does not show strong buying, the zone is likely to fail. Consider skipping this trade.', correct: true, explain: 'Correct. A bearish engulfing at your entry zone is an ANTI-trigger. It is the opposite of what you need to see. The zone might still hold (a sweep below followed by a strong rejection), but the initial evidence is negative. Reduce conviction, consider skipping, or wait for a much stronger trigger on the next candle.' },
    { text: 'Enter short — the bearish engulfing means the trend is reversing', correct: false, explain: 'A bearish engulfing at one OB does not reverse a bullish HTF trend. It means THIS specific zone is weak. The trend can continue by finding support at a deeper OB or FVG.' },
    { text: 'Enter long immediately — bearish engulfings at OBs are liquidity grabs', correct: false, explain: 'Sometimes they are, sometimes they are not. Assuming every bearish candle at an OB is a "grab" is wishful thinking. You need the NEXT candle to show actual buying before entering.' },
  ]},
];

const quizQuestions = [
  { q: 'What is the difference between a "setup" and a "trigger"?', opts: ['They are the same thing', 'A setup is the market conditions that must be true; a trigger is the specific candle/action that says "enter now"', 'A trigger comes before a setup', 'A setup is for Model 1, a trigger is for Model 2'], correct: 1, explain: 'Setup = environment (HTF trend, BOS, at zone, KZ active). Trigger = the specific price action at the zone that proves the zone is holding. Setup without trigger = a wish. Trigger without setup = a gamble.' },
  { q: 'Which entry trigger gives the MOST precise entry with the tightest stop?', opts: ['Bullish engulfing', 'Rejection wick', 'Lower timeframe BOS', 'RSI divergence'], correct: 2, explain: 'LTF BOS (dropping to 5M/1M for a structural break) gives the exact candle where buyers take control. Your stop goes below the LTF swing low, which is tighter than a 15M OB-based stop. The tradeoff: you must be at your screen watching.' },
  { q: 'A bullish engulfing at an OB has a tiny body (3-pip range) on below-average volume during Asian session. Is this a valid trigger?', opts: ['Yes — an engulfing is an engulfing', 'No — small body + low volume + dead session = a noise candle, not a genuine trigger', 'Yes but with half position size', 'It depends on RSI'], correct: 1, explain: 'Quality filters matter. A genuine engulfing has a body larger than the recent average, above-average volume (institutions participating), and occurs during an active session. This candle fails all three tests.' },
  { q: 'When is RSI divergence MOST powerful as an entry trigger?', opts: ['Any time RSI shows divergence', 'When it appears at a random price level', 'When it occurs AT your entry zone (OB/FVG) in a Model 2 reversal with a liquidity sweep', 'When RSI is exactly at 50'], correct: 2, explain: 'RSI divergence alone is just an oscillator reading. RSI divergence AT a zone WITH a sweep in a Model 2 context = maximum confluence. The zone provides the level, the sweep provides the trap, the divergence provides the exhaustion proof.' },
  { q: 'Price reaches your demand OB and a bearish engulfing forms (the opposite of what you wanted). What should you do?', opts: ['Enter long anyway — the setup is still valid', 'Recognise this as an anti-trigger — reduce conviction, consider skipping, or wait for a stronger bullish trigger next candle', 'Enter short immediately', 'Delete the chart and start over'], correct: 1, explain: 'A bearish engulfing at your demand zone is negative evidence. It does not guarantee failure, but it means sellers are active here. Reduce conviction and require a STRONGER trigger (sweep below + rejection) to enter.' },
  { q: 'What makes a rejection wick a "valid" trigger versus a normal candle?', opts: ['Any lower wick counts as a rejection', 'The wick must be at least 2x the body length, showing violent buying pressure that overwhelmed sellers', 'The candle must close green', 'The wick must be exactly 10 pips'], correct: 1, explain: 'A valid rejection wick has a lower wick at least 2x the body length. This shows that sellers pushed price significantly lower but buyers overwhelmed them and pushed it back up. A 1x wick is a normal candle — not enough evidence of rejection.' },
  { q: 'You drop to 5M for a LTF BOS trigger. The 5M bounces from the OB but stalls just BELOW the swing high. What is the correct action?', opts: ['Enter — the bounce is close enough', 'Wait for the actual break above the 5M swing high — close is not the same as confirmed', 'Short it — the stall means failure', 'Switch to the 1M chart'], correct: 1, explain: 'A LTF BOS that does not complete is not a trigger. "Close enough" means "not confirmed." Either wait for the actual break or pivot to a different trigger type (engulfing or rejection wick on the 15M).' },
  { q: 'A trader uses 3 different triggers: engulfing for quick entries, LTF BOS for precision, and RSI divergence for reversals. Is this approach correct?', opts: ['No — pick one trigger and use it for everything', 'Yes — different situations call for different triggers, and having a toolkit of 2-3 gives flexibility without overcomplication', 'No — you need all 5 triggers on every trade', 'It depends on the instrument'], correct: 1, explain: 'Professional traders have a toolkit of 2-3 triggers, not one and not ten. Each trigger suits different conditions: engulfing for clear zones, LTF BOS for wide zones where precision matters, divergence for reversals. The key is knowing WHEN each one applies.' },
];

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

function Confetti({ active }: { active: boolean }) {
  if (!active) return null;
  return (<div className="fixed inset-0 pointer-events-none z-50">{Array.from({ length: 60 }).map((_, i) => (<motion.div key={i} initial={{ y: -20, x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400), opacity: 1 }} animate={{ y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 20, rotate: Math.random() * 720, opacity: 0 }} transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5 }} className="absolute w-2 h-2 rounded-sm" style={{ background: ['#f59e0b', '#d946ef', '#34d399', '#3b82f6', '#ef4444'][i % 5] }} />))}</div>);
}

export default function EntryTriggerMasteryLesson() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);

  const [openTrigger, setOpenTrigger] = useState<number | null>(null);

  // Interactive — Trigger Quality Rater
  const [raterBody, setRaterBody] = useState<number | null>(null);
  const [raterWick, setRaterWick] = useState<number | null>(null);
  const [raterVol, setRaterVol] = useState<number | null>(null);
  const [raterSession, setRaterSession] = useState<number | null>(null);
  const allRated = raterBody !== null && raterWick !== null && raterVol !== null && raterSession !== null;
  const raterScore = allRated ? raterBody! + raterWick! + raterVol! + raterSession! : 0;
  const raterGrade = raterScore >= 7 ? 'A' : raterScore >= 5 ? 'B' : raterScore >= 3 ? 'C' : 'F';
  const raterColor = raterGrade === 'A' ? 'text-green-400' : raterGrade === 'B' ? 'text-sky-400' : raterGrade === 'C' ? 'text-amber-400' : 'text-red-400';

  // Mistakes
  const [openMistake, setOpenMistake] = useState<number | null>(null);
  const mistakes = [
    { title: 'Treating the setup as the trigger', desc: '"Price is at my OB" is a setup, not a trigger. It means you should be WATCHING for a trigger, not entering. The zone is the destination. The trigger is the key that unlocks the door. Being at the door is not the same as opening it.' },
    { title: 'Accepting any candle pattern as confirmation', desc: 'A small doji, an inside bar, a spinning top — these are indecision candles, not triggers. A trigger must show CONVICTION: a full-body engulfing, a 2x+ rejection wick, or a structural break. Weak candles at your zone mean "wait," not "enter."' },
    { title: 'Using too many triggers simultaneously', desc: 'Requiring an engulfing AND a wick rejection AND divergence AND LTF BOS before entering means you will never trade. Pick 1-2 triggers for your strategy and master them. Additional signals are confluence, not requirements.' },
    { title: 'Entering without checking volume and session', desc: 'The same engulfing pattern during London KZ on above-average volume is a genuine trigger. The same pattern at 3 AM on thin volume is noise. Volume and session are quality filters that separate real triggers from fake ones.' },
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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 6 &middot; Lesson 5</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Entry Trigger<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Mastery</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">A setup without a trigger is a wish. Learn the 5 triggers that turn &ldquo;I see a zone&rdquo; into &ldquo;I am in the trade.&rdquo;</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* S00 */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">🔍 The Traffic Light Moment</p>
            <p className="text-gray-400 leading-relaxed mb-4">You are a driver at an intersection. The setup is everything that got you here &mdash; the route, the destination, the fuel in the tank. But you do NOT drive through the intersection until the light turns green. The green light is the trigger.</p>
            <p className="text-gray-400 leading-relaxed">Most traders who freeze, hesitate, or enter randomly do so because they have setups but no triggers. They are sitting at the intersection staring at a red light, unsure when to go. This lesson gives you 5 specific green lights so you never have to guess again.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">A trader added ONE quality filter to his existing engulfing trigger (body must be larger than the 5-candle average). His win rate jumped from <strong className="text-red-400">42%</strong> to <strong className="text-green-400">56%</strong> with the same number of trades. He didn&apos;t change his strategy, his zones, or his targets. He just stopped accepting weak engulfings as triggers.</p>
          </div>
        </motion.div>
      </section>

      {/* S01 — Traffic Light Animation */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; Setup vs Trigger</p>
          <h2 className="text-2xl font-extrabold mb-4">The Green Light Principle</h2>
          <p className="text-gray-400 text-sm mb-6">The setup gets you to the intersection. The trigger turns the light green. Without the green light, you sit and wait. That patience IS the edge.</p>
          <TrafficLightAnimation />
        </motion.div>
      </section>

      {/* S02 — 5 Trigger Types Animation */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The 5 Triggers</p>
          <h2 className="text-2xl font-extrabold mb-4">Your Toolkit</h2>
          <p className="text-gray-400 text-sm mb-6">Each trigger works at the OB/FVG zone. Watch how each one looks in practice.</p>
          <TriggerTypesAnimation />
        </motion.div>
      </section>

      {/* S03 — 5 Trigger Profiles */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; Trigger Profiles</p>
          <h2 className="text-2xl font-extrabold mb-4">Deep Dive — Each Trigger</h2>
          <p className="text-gray-400 text-sm mb-6">Open each trigger to see when it shines, when to avoid it, and a real example.</p>
          <div className="space-y-3">
            {triggerProfiles.map((tp, i) => (
              <div key={i}>
                <button onClick={() => setOpenTrigger(openTrigger === i ? null : i)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{tp.icon}</span>
                    <div><p className="text-sm font-extrabold text-white">{tp.name}</p><p className="text-xs text-gray-500">Speed: {tp.speed} · Reliability: {tp.reliability} · Best for: {tp.bestFor}</p></div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openTrigger === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openTrigger === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05] space-y-3">
                      <p className="text-sm text-gray-400 leading-relaxed">{tp.desc}</p>
                      <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10"><p className="text-xs text-green-400">✓ <strong>When to use:</strong> {tp.when}</p></div>
                      <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10"><p className="text-xs text-red-400">✗ <strong>When to avoid:</strong> {tp.avoid}</p></div>
                      <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10"><p className="text-xs text-amber-400">📌 <strong>Example:</strong> {tp.example}</p></div>
                    </div>
                  </motion.div>
                )}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S04 — Quality Filters */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Quality Filters</p>
          <h2 className="text-2xl font-extrabold mb-4">Not All Triggers Are Equal</h2>
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <p className="text-gray-400 leading-relaxed">The same engulfing pattern can be a powerful trigger or worthless noise depending on THREE quality filters:</p>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <p className="text-sm font-extrabold text-green-400 mb-2">1. Body Size</p>
              <p className="text-xs text-gray-400">The trigger candle&apos;s body must be larger than the average of the last 5 candles. A small-body engulfing is indecision wearing a costume — it looks like conviction but has none.</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <p className="text-sm font-extrabold text-sky-400 mb-2">2. Volume</p>
              <p className="text-xs text-gray-400">Above the 20-period volume average. Institutions participate on volume. A trigger candle on low volume means retail is guessing, not institutions committing.</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <p className="text-sm font-extrabold text-amber-400 mb-2">3. Session Timing</p>
              <p className="text-xs text-gray-400">London or NY sessions (preferably overlap). A perfect trigger at 3 AM on Gold has no institutional backing. The same trigger at 2 PM has maximum participation.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S05 — Interactive Trigger Quality Rater */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Trigger Quality Rater</p>
          <h2 className="text-2xl font-extrabold mb-2">Rate Your Last Trigger</h2>
          <p className="text-gray-400 text-sm mb-6">Think of a recent entry trigger you took. Rate it on 4 factors.</p>
          <div className="p-6 rounded-2xl glass-card space-y-4">
            {[
              { label: 'Candle Body Size', opts: ['Smaller than avg', 'Average', 'Larger than avg'], state: raterBody, setter: setRaterBody },
              { label: 'Wick Quality (for wick triggers)', opts: ['No wick / <1x body', '1-2x body', '2x+ body (clear reject)'], state: raterWick, setter: setRaterWick },
              { label: 'Volume', opts: ['Below average', 'Average', 'Above average'], state: raterVol, setter: setRaterVol },
              { label: 'Session Timing', opts: ['Asian / Off-peak', 'London or NY', 'London-NY Overlap'], state: raterSession, setter: setRaterSession },
            ].map((q, qi) => (
              <div key={qi}>
                <p className="text-sm font-semibold text-white mb-2">{q.label}</p>
                <div className="flex flex-wrap gap-2">
                  {q.opts.map((opt, oi) => (
                    <button key={oi} onClick={() => q.setter(oi)} className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${q.state === oi ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-white/[0.04] text-gray-500 border border-white/[0.08] hover:bg-white/[0.07]'}`}>{opt}</button>
                  ))}
                </div>
              </div>
            ))}
            {allRated && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center">
                <p className={`text-3xl font-black ${raterColor}`}>{raterGrade}</p>
                <p className="text-xs text-gray-500 mt-1">Trigger Quality: {raterScore}/8</p>
                <p className="text-xs text-gray-400 mt-2">{raterGrade === 'A' ? 'High-quality trigger. This is the standard you should maintain.' : raterGrade === 'B' ? 'Decent trigger, but one factor is dragging it down. Consider what you could improve.' : raterGrade === 'C' ? 'Marginal trigger. Multiple factors are weak. This is the kind of entry that dilutes your win rate.' : 'Poor quality. This trigger should not have been taken. Review which factors failed and add them as filters.'}</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </section>

      {/* S06 — Decision Tree */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Trigger Decision Tree</p>
          <h2 className="text-2xl font-extrabold mb-4">Which Trigger for Which Situation?</h2>
          <div className="p-6 rounded-2xl glass-card space-y-3">
            <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/15"><p className="text-sm text-gray-400"><strong className="text-green-400">Quick entry needed + clear zone →</strong> Engulfing or Rejection Wick. Fast, visible on entry TF, no need to drop timeframes.</p></div>
            <div className="p-4 rounded-xl bg-sky-500/5 border border-sky-500/15"><p className="text-sm text-gray-400"><strong className="text-sky-400">Wide OB zone + want tight entry →</strong> Lower TF BOS. Drop to 5M/1M for precise entry within the zone. Tighter stop = better R:R.</p></div>
            <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/15"><p className="text-sm text-gray-400"><strong className="text-purple-400">Model 2 reversal + exhaustion context →</strong> RSI Divergence + another trigger. Divergence confirms exhaustion, the second trigger confirms timing.</p></div>
            <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/15"><p className="text-sm text-gray-400"><strong className="text-cyan-400">OB missed but FVG nearby →</strong> FVG Fill + Rejection. Enter at the imbalance zone when price fills and rejects.</p></div>
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15"><p className="text-sm text-gray-400"><strong className="text-amber-400">No trigger fires at zone →</strong> SKIP the trade. No trigger = no trade. This is discipline, not missed opportunity.</p></div>
          </div>
        </motion.div>
      </section>

      {/* S07 — Anti-Triggers */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Anti-Triggers</p>
          <h2 className="text-2xl font-extrabold mb-4">When to Walk Away</h2>
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <p className="text-gray-400 leading-relaxed">An anti-trigger is a candle or pattern at your zone that tells you the zone is FAILING. Recognising anti-triggers saves you from entering trades that look right but are about to fail:</p>
            <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15"><p className="text-sm text-gray-400"><strong className="text-red-400">Bearish engulfing at demand OB</strong> — Sellers are active at your buy zone. Reduce conviction or skip.</p></div>
            <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15"><p className="text-sm text-gray-400"><strong className="text-red-400">Price slicing through OB without any wick</strong> — The zone has failed. No hesitation, no "it might come back." Move on.</p></div>
            <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15"><p className="text-sm text-gray-400"><strong className="text-red-400">3+ candles sitting at the zone with no trigger</strong> — If the zone was going to hold, it would have shown conviction by now. The more time at the zone without rejection, the weaker the zone.</p></div>
            <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15"><p className="text-sm text-gray-400"><strong className="text-red-400">Volume climax at the zone</strong> — Extremely high volume at your OB often means institutions are dumping, not defending. High volume at support = distribution, not accumulation (in most cases).</p></div>
          </div>
        </motion.div>
      </section>

      {/* S08 — Common Mistakes */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-6">4 Trigger Mistakes</h2>
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
          <h2 className="text-2xl font-extrabold mb-4">Trigger Quick Reference</h2>
          <div className="p-6 rounded-2xl glass-card space-y-3">
            {triggerProfiles.map((tp, i) => (
              <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <p className="text-sm"><strong className={i === 0 ? 'text-green-400' : i === 1 ? 'text-amber-400' : i === 2 ? 'text-sky-400' : i === 3 ? 'text-purple-400' : 'text-cyan-400'}>{tp.icon} {tp.name}</strong> <span className="text-gray-500">&mdash;</span> <span className="text-gray-400">{tp.bestFor}. Speed: {tp.speed}. Reliability: {tp.reliability}.</span></p>
              </div>
            ))}
            <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15"><p className="text-sm"><strong className="text-red-400">No trigger</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">No trade. This IS a decision, not a failure.</span></p></div>
          </div>
        </motion.div>
      </section>

      {/* S10 — Game */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Test Your Understanding</p>
          <h2 className="text-2xl font-extrabold mb-2">Entry Trigger Game</h2>
          <p className="text-gray-400 text-sm mb-6">5 scenarios at the zone. Make the right call.</p>
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
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Excellent — you know when to pull the trigger and when to wait.' : gameScore >= 3 ? 'Solid — review the quality filters to sharpen your trigger recognition.' : 'Re-read the trigger profiles and anti-triggers section, then try again.'}</p></motion.div>)}
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
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-green-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">🚦</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 6: Entry Trigger Mastery</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-green-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Trigger Master &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L6.5-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
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
