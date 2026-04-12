// app/academy/lesson/execution-timing/page.tsx
// ATLAS Academy — Lesson 7.5: Execution Timing [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 7
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
// ANIMATION 1: On-Time vs Late Entry — same setup, different
// entry points, dramatically different R:R outcomes
// ============================================================
function OnTimeVsLateAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.005;
    const pad = 25;
    const top = 48;
    const bot = h - 30;
    const progress = Math.min(1, (t % 6) / 5);
    const seed = (n: number) => Math.sin(n * 127.1 + 311.7) * 0.5 + 0.5;
    const totalCandles = 24;
    const visCandles = Math.floor(progress * totalCandles);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Same Setup. Two Entries. Different Outcomes.', w / 2, 14);

    // Generate price path: pullback to OB → trigger → move up
    const candles: { o: number; h: number; l: number; c: number }[] = [];
    let price = 2340;
    for (let i = 0; i < totalCandles; i++) {
      const noise = (seed(i * 3) - 0.5) * 6;
      let bias = 0;
      if (i < 6) bias = -3; // pullback into OB
      else if (i === 6) bias = -5; // deep into OB
      else if (i === 7) bias = 10; // trigger candle — bullish engulfing
      else if (i === 8) bias = 5; // follow-through
      else if (i === 9) bias = 3; // continuation
      else if (i < 14) bias = 4; // trend continues
      else if (i < 18) bias = 2; // slower
      else bias = 1;
      const o = price;
      const c = price + noise + bias;
      const wick = Math.abs(c - o) * (0.2 + seed(i * 7) * 0.4);
      candles.push({ o, h: Math.max(o, c) + wick, l: Math.min(o, c) - wick, c });
      price = c;
    }

    const allP = candles.flatMap(c => [c.h, c.l]);
    const minP = Math.min(...allP) - 3;
    const maxP = Math.max(...allP) + 3;
    const range = maxP - minP || 1;
    const py = (p: number) => bot - ((p - minP) / range) * (bot - top);
    const chartW = w - pad * 2;
    const cw = chartW / totalCandles;

    // Draw visible candles
    for (let i = 0; i <= Math.min(visCandles, totalCandles - 1); i++) {
      const c = candles[i];
      const x = pad + i * cw;
      const bull = c.c >= c.o;
      const color = bull ? '#34d399' : '#ef4444';
      ctx.strokeStyle = color; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x + cw / 2, py(c.h)); ctx.lineTo(x + cw / 2, py(c.l)); ctx.stroke();
      const bodyT = py(Math.max(c.o, c.c));
      const bodyB = py(Math.min(c.o, c.c));
      ctx.fillStyle = color;
      ctx.fillRect(x + 2, bodyT, cw - 4, Math.max(1, bodyB - bodyT));
    }

    // OB zone
    const obTop = candles[6].o;
    const obBot = candles[6].l;
    ctx.fillStyle = 'rgba(52,211,153,0.08)';
    ctx.fillRect(pad + 5 * cw, py(obTop), chartW - 5 * cw, py(obBot) - py(obTop));
    ctx.strokeStyle = 'rgba(52,211,153,0.3)'; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(pad + 5 * cw, py(obTop)); ctx.lineTo(pad + chartW, py(obTop)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pad + 5 * cw, py(obBot)); ctx.lineTo(pad + chartW, py(obBot)); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(52,211,153,0.5)'; ctx.font = '8px system-ui'; ctx.textAlign = 'left';
    ctx.fillText('Demand OB', pad + 5 * cw + 3, py(obTop) - 3);

    if (visCandles >= 8) {
      // On-time entry marker (candle 7 close)
      const onTimeEntry = candles[7].c;
      const onTimeX = pad + 7.5 * cw;
      ctx.fillStyle = '#34d399';
      ctx.beginPath(); ctx.arc(onTimeX, py(onTimeEntry), 4, 0, Math.PI * 2); ctx.fill();
      ctx.font = 'bold 9px system-ui'; ctx.textAlign = 'left';
      ctx.fillText('ON TIME', onTimeX + 8, py(onTimeEntry) + 3);

      // Late entry marker (candle 9 — 2 candles late)
      if (visCandles >= 10) {
        const lateEntry = candles[9].c;
        const lateX = pad + 9.5 * cw;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath(); ctx.arc(lateX, py(lateEntry), 4, 0, Math.PI * 2); ctx.fill();
        ctx.font = 'bold 9px system-ui'; ctx.textAlign = 'left';
        ctx.fillText('2 CANDLES LATE', lateX + 8, py(lateEntry) + 3);

        // Stop level
        const stopLevel = obBot - 2;
        ctx.strokeStyle = 'rgba(239,68,68,0.4)'; ctx.lineWidth = 1; ctx.setLineDash([2, 2]);
        ctx.beginPath(); ctx.moveTo(pad + 7 * cw, py(stopLevel)); ctx.lineTo(pad + chartW, py(stopLevel)); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(239,68,68,0.5)'; ctx.font = '8px system-ui'; ctx.textAlign = 'left';
        ctx.fillText('SL (same for both)', pad + 7 * cw + 3, py(stopLevel) + 12);

        // R:R comparison
        if (visCandles >= totalCandles) {
          const tp = candles[totalCandles - 1].c;
          const onTimeRisk = onTimeEntry - stopLevel;
          const onTimeReward = tp - onTimeEntry;
          const onTimeRR = onTimeReward / onTimeRisk;

          const lateRisk = lateEntry - stopLevel;
          const lateReward = tp - lateEntry;
          const lateRR = lateReward / lateRisk;

          ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
          ctx.fillStyle = '#34d399';
          ctx.fillText(`On Time: 1:${onTimeRR.toFixed(1)}`, w * 0.3, top - 5);
          ctx.fillStyle = '#ef4444';
          ctx.fillText(`Late: 1:${lateRR.toFixed(1)}`, w * 0.7, top - 5);

          const diff = ((1 - lateRR / onTimeRR) * 100).toFixed(0);
          const pulse = 0.5 + 0.5 * Math.sin(t * 3);
          ctx.fillStyle = `rgba(245,158,11,${0.6 + pulse * 0.4})`;
          ctx.font = 'bold 10px system-ui';
          ctx.fillText(`${diff}% R:R destroyed by hesitation`, w / 2, bot + 18);
        }
      }
    }
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 2: R:R Degradation Over Time
// Shows how R:R drops with each candle of delay
// ============================================================
function RRDegradationAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.007;
    const pad = 40;
    const top = 50;
    const bot = h - 40;
    const cycle = t % 6;
    const cx = w / 2;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('R:R Degradation Per Candle of Delay (15M Chart)', cx, 16);

    const delays = [
      { label: 'On time', rr: 2.0, pips: 0, color: '#34d399' },
      { label: '+1 candle', rr: 1.7, pips: 3, color: '#34d399' },
      { label: '+2 candles', rr: 1.4, pips: 6, color: '#f59e0b' },
      { label: '+3 candles', rr: 1.1, pips: 9, color: '#f59e0b' },
      { label: '+4 candles', rr: 0.8, pips: 12, color: '#ef4444' },
      { label: '+5 candles', rr: 0.5, pips: 15, color: '#ef4444' },
    ];

    const visCount = Math.min(delays.length, Math.floor(cycle * 1.1));
    const barW = (w - pad * 2) / delays.length - 8;
    const maxRR = 2.2;

    // Y axis
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1;
    for (let rr = 0; rr <= 2; rr += 0.5) {
      const y = bot - (rr / maxRR) * (bot - top);
      ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(w - pad, y); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.font = '9px system-ui'; ctx.textAlign = 'right';
      ctx.fillText(`1:${rr.toFixed(1)}`, pad - 5, y + 3);
    }

    // Minimum viable line (1:1)
    const minViableY = bot - (1.0 / maxRR) * (bot - top);
    ctx.strokeStyle = 'rgba(239,68,68,0.3)'; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(pad, minViableY); ctx.lineTo(w - pad, minViableY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(239,68,68,0.4)'; ctx.font = '8px system-ui'; ctx.textAlign = 'left';
    ctx.fillText('Minimum viable (1:1)', pad + 5, minViableY - 5);

    for (let i = 0; i < visCount; i++) {
      const d = delays[i];
      const x = pad + i * (barW + 8) + 4;
      const barH = (d.rr / maxRR) * (bot - top);
      const appear = Math.min(1, (cycle - i / 1.1) * 2);
      if (appear <= 0) continue;

      ctx.globalAlpha = appear;
      ctx.fillStyle = d.color;
      ctx.beginPath();
      ctx.roundRect(x, bot - barH * appear, barW, barH * appear, 4);
      ctx.fill();

      // Label
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '8px system-ui'; ctx.textAlign = 'center';
      ctx.fillText(d.label, x + barW / 2, bot + 13);

      // R:R value on top
      ctx.fillStyle = d.color; ctx.font = 'bold 10px system-ui';
      ctx.fillText(`1:${d.rr.toFixed(1)}`, x + barW / 2, bot - barH * appear - 5);

      // Pips lost
      if (d.pips > 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '7px system-ui';
        ctx.fillText(`−${d.pips} pips`, x + barW / 2, bot + 24);
      }

      ctx.globalAlpha = 1;
    }

    // Summary
    if (visCount >= delays.length) {
      const pulse = 0.5 + 0.5 * Math.sin(t * 3);
      ctx.fillStyle = `rgba(239,68,68,${0.5 + pulse * 0.5})`;
      ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center';
      ctx.fillText('5 candles of hesitation turns a 1:2.0 winner into a 1:0.5 loser', cx, h - 5);
    }
  }, []);
  return <AnimScene drawFn={draw} height={290} />;
}

// ============================================================
// DATA
// ============================================================
const timingLeaks = [
  { name: 'Hesitation Freeze', severity: 'CRITICAL', desc: 'The trigger candle closes. You see it. You KNOW it is valid. But your finger does not click. You think: "Let me wait for one more candle to confirm." By the time you enter, price has moved 3-6 pips and your R:R has degraded from 1:2.0 to 1:1.4.', fix: 'Pre-commit: "When I see my trigger at my level, I click within 3 seconds of the candle close." Set alerts so you are READY when the candle is closing — not scrambling to analyse.', icon: '🥶', cost: '15-30% of R:R per trade' },
  { name: 'Confirmation Addiction', severity: 'HIGH', desc: 'One trigger is not enough. You want a second candle, then a third. Each "confirmation" candle moves price further from the optimal entry. By the time you have triple confirmation, the move is half done and your R:R is gutted.', fix: 'Define in advance: "I need ONE trigger candle that meets my quality filters." Write this in your pre-session plan. More candles = worse entry, not better entry. The Level 6 trigger criteria were designed to be sufficient on their own.', icon: '🔁', cost: '20-40% of R:R per occurrence' },
  { name: 'Alert Lag', severity: 'MEDIUM', desc: 'Your alert fires. You are in the kitchen, on the phone, or on another tab. By the time you open TradingView and assess the chart, 1-2 candles have passed. This is not hesitation — it is logistics.', fix: 'During your Kill Zone, be AT the screen. Not "available" — physically at the desk with the chart open. Alerts are a prompt, not a substitute for presence. If you cannot be at the screen, do not set alerts that create FOMO when you hear them.', icon: '📱', cost: '5-15% of R:R, depends on delay' },
  { name: 'Re-Analysis Loop', severity: 'HIGH', desc: 'The trigger forms. Instead of executing, you re-check the 4H. Then the Daily. Then the news calendar. Then RSI. You are re-doing your pre-session analysis AT the moment of execution. By the time you finish, 3 candles have passed.', fix: 'Your pre-session routine ALREADY checked all of this. The trigger candle is not the time to re-analyse — it is the time to EXECUTE. If you do not trust your routine analysis, fix the routine. Do not compensate by re-analysing at the worst possible moment.', icon: '🔄', cost: '20-40% of R:R, often misses trade entirely' },
  { name: 'Partial-Candle Entry', severity: 'LOW', desc: 'You enter DURING the candle instead of waiting for the close. The candle looks bullish at minute 8 of 15, but reverses and closes bearish. You are now in a trade without a valid trigger.', fix: 'Wait for the CLOSE (Lesson 7.3 Principle 1). The 15 seconds between candle close and your order entry is not "delay" — it is due diligence. A candle that has not closed is not a signal.', icon: '⏰', cost: 'Variable — can turn winners into losers' },
];

const gameRounds = [
  { scenario: 'Gold pulls back to your demand OB at 2,328 during London open. The trigger candle (bullish engulfing, above-average body, volume spike) closes at 2,331. You see it immediately. Your analysis is done. Your pre-session plan says: "Buy at OB with trigger." But you think: "Let me wait for one more green candle to confirm." The next candle opens at 2,332 and quickly moves to 2,335. Now you enter at 2,335. Your stop is at 2,323 (below OB). Your TP was 2,347. What happened to your R:R?',
    options: [
      { text: 'R:R barely changed — 4 pips does not matter', correct: false, explain: 'It matters enormously. At 2,331 entry: risk = 8 pips, reward = 16 pips → R:R = 1:2.0. At 2,335 entry: risk = 12 pips, reward = 12 pips → R:R = 1:1.0. You halved your R:R by waiting for "confirmation." The confirmation cost you the trade.' },
      { text: 'R:R degraded from approximately 1:2.0 to approximately 1:1.0 — the hesitation halved the reward', correct: true, explain: 'Correct! On-time (2,331): 8-pip risk, 16-pip reward = 1:2.0. Late (2,335): 12-pip risk, 12-pip reward = 1:1.0. Those 4 pips of "confirmation" cut your potential profit in half while INCREASING your risk. This is the execution timing leak in its purest form.' },
      { text: 'The confirmation was worth it — the second green candle proves the trade is more likely to work', correct: false, explain: 'The trigger candle ALREADY proved the trade. The quality filters (body size, volume) were met. The extra candle moved price away from your optimal entry without improving probability. You are now risking MORE for LESS reward.' },
      { text: 'You should skip the trade now — the move has already started', correct: false, explain: 'At 1:1.0 R:R, this trade is still viable — barely. The ideal response was to enter at 2,331 when the trigger closed. Skipping a valid 1:1.0 trade is less damaging than entering a 1:0.5 trade, but the real lesson is: do not create this problem in the first place.' },
    ]
  },
  { scenario: 'You track your last 40 trades and find: 25 entries were "on time" (within 1 candle of trigger) with avg R:R of 1:1.9. 15 entries were "late" (2+ candles after trigger) with avg R:R of 1:1.2. Your win rates were similar (48% vs 45%). What is the financial impact of your timing leak?',
    options: [
      { text: 'Minimal — the win rates are nearly identical so timing does not matter', correct: false, explain: 'Win rate is only half the equation. The R:R difference is massive. On-time: EV = (0.48 × 1.9R) − (0.52 × 1R) = +0.39R. Late: EV = (0.45 × 1.2R) − (0.55 × 1R) = −0.01R. Your on-time trades are profitable. Your late trades are breakeven or losing. Timing is the entire edge.' },
      { text: 'Significant — the late entries are barely breakeven while the on-time entries are strongly profitable', correct: true, explain: 'Correct! On-time EV = +0.39R per trade. Late EV = −0.01R per trade (essentially breakeven). If your risk is £100/trade: on-time trades earned £975 over 25 trades. Late trades lost £15 over 15 trades. If ALL 40 had been on time at +0.39R: £1,560 total. The timing leak cost you approximately £600 over 40 trades — £15/trade average.' },
      { text: 'The late entries should be eliminated entirely — only take on-time entries', correct: false, explain: 'Right direction but incomplete. Some late entries happen for valid reasons (alert lag, multi-tasking). The goal is not to eliminate all late entries — it is to reduce them from 37.5% of trades to under 15%, and to SKIP the ones where R:R has degraded below 1:1.5.' },
      { text: 'You need more data — 40 trades is not enough to draw conclusions', correct: false, explain: '40 trades with a clear segmentation (on-time vs late) and measurable R:R difference IS sufficient to identify a pattern. The 0.7R gap between the two groups is large enough to be meaningful even with this sample size.' },
    ]
  },
  { scenario: 'Your alert fires: "GBPUSD at supply OB." You were checking your phone. By the time you open the chart, 2 candles have passed since the trigger. Price has moved 8 pips from your optimal entry. The R:R is now 1:1.1 instead of 1:2.0. What is the correct decision?',
    options: [
      { text: 'Enter at 1:1.1 — the setup is still valid', correct: false, explain: '1:1.1 R:R is below the minimum 1:1.5 threshold for a degraded entry. At this R:R, you need 48% WR just to breakeven. Given that late entries also tend to have slightly lower WR, this is a negative-expectancy trade. The setup WAS valid — your timing made it unviable.' },
      { text: 'SKIP — R:R has degraded below the minimum viable threshold. Log it as a missed trade, not a failed strategy.', correct: true, explain: 'Correct! A missed trade due to timing is frustrating but it is NOT a reason to force a bad entry. Log it in your journal as "Missed — alert lag, R:R degraded from 1:2.0 to 1:1.1." This data helps you fix the logistics problem (being at the screen during KZ) without compromising your edge.' },
      { text: 'Enter with a tighter stop to restore the R:R', correct: false, explain: 'A tighter stop does not fix the problem — it creates a new one. Your stop was structural (below the OB). Moving it closer means normal price fluctuation will stop you out. You are replacing a timing error with a stop placement error.' },
      { text: 'Enter with half size as a compromise', correct: false, explain: 'Half size reduces the damage but does not fix the R:R. A 1:1.1 trade at half size is still a negative-expectancy trade — it just loses half as much. Skip the trade entirely and address the alert lag problem.' },
    ]
  },
  { scenario: 'You are at your screen. The trigger candle closes — perfect bullish engulfing at your demand OB, London KZ active, all criteria met. You KNOW you should click BUY. But your finger does not move. Your brain says: "What if it fails? What if the OB breaks?" 3 seconds pass. 5 seconds. 8 seconds. The next candle opens and pushes 2 pips in your direction. What is happening and what should you do?',
    options: [
      { text: 'You are being cautious — enter now at the slightly worse price', correct: false, explain: 'This is not caution. Caution was your pre-session analysis, your checklist conditions, your quality filters. All of those said GO. What you are experiencing is FEAR — and fear at the moment of execution is the #1 cause of the hesitation freeze. Enter NOW at the 2-pip worse price and address the fear separately.' },
      { text: 'This is the hesitation freeze. Enter IMMEDIATELY — the analysis was done in calm, the freeze is adrenaline, not logic. Then journal the freeze.', correct: true, explain: 'Correct! The hesitation freeze is adrenaline overriding your rational analysis. Your calm, prepared brain said "this is a valid trade." Your stressed, in-the-moment brain says "but what if...". Trust the calm version. Click NOW. Then write in your journal: "Hesitation freeze — 8 seconds. Cost: 2 pips." Tracking the freeze is how you train it away.' },
      { text: 'Skip the trade — if you hesitated, something subconscious is telling you it is wrong', correct: false, explain: 'Dangerous logic. Hesitation at the moment of execution is almost NEVER a valid signal. It is adrenaline. If your pre-session analysis, your checklist, and your quality filters all say GO, the hesitation is your fear response, not your analytical brain. Skipping valid setups because of freeze anxiety is how you destroy a working strategy.' },
      { text: 'Wait for the candle close to see if it continues in your direction, then enter on the third candle', correct: false, explain: 'Every candle of delay costs R:R. You already waited 8 seconds through the freeze, costing 2 pips. Waiting for another full candle could cost 3-5 more pips. The trigger was valid at candle close. Enter now and accept the 2-pip freeze cost as the price of being human.' },
    ]
  },
  { scenario: 'After analysing your timing data, you find that your average entry delay is 1.8 candles after the trigger (on the 15M chart). This costs you approximately 5 pips per trade on XAUUSD. Your average stop is 12 pips. What percentage of your risk is being consumed by timing leaks alone, and what is one specific action to fix it?',
    options: [
      { text: '~42% of risk — set price alerts 2 pips before your level so you are ready BEFORE the trigger forms', correct: true, explain: 'Correct! 5 pips of delay ÷ 12-pip stop = 41.7% of your risk consumed by timing alone. The fix: set alerts 2 pips before your key level, not AT the level. This gives you a 30-60 second warning to open the chart, assess the candle forming, and be finger-on-button ready when the trigger candle closes. Pre-position, do not react.' },
      { text: '~20% of risk — accept it as normal execution cost', correct: false, explain: '5 ÷ 12 = 41.7%, not 20%. And this is NOT a normal cost — this is a fixable leak. Spread and commission (2-3% of risk) are unavoidable costs. 42% timing leak is avoidable and should be treated as the top priority fix.' },
      { text: '~42% of risk — switch to a higher timeframe to reduce the impact', correct: false, explain: 'The percentage is correct, but switching timeframes does not fix the underlying problem (hesitation and delay). On a 1H chart, 1.8 candles of delay = 1.8 hours late. The fix is faster execution at your current timeframe, not avoidance.' },
      { text: '~42% of risk — use market orders instead of limit orders', correct: false, explain: 'The entry delay is caused by hesitation and alert lag, not by order type. Market orders execute instantly but you still need to be at the screen and clicking at the right moment. The fix is pre-positioning (early alerts) and reducing hesitation freeze time.' },
    ]
  },
];

const quizQuestions = [
  { q: 'On a 15M Gold trade, you enter 2 candles (30 minutes) after the trigger. Price moved 6 pips in your direction during those 2 candles. Your original stop was 10 pips. How does this affect your R:R?', opts: ['No effect — the stop is the same', 'Your effective risk increased from 10 to 16 pips (stop distance from worse entry), degrading R:R', 'Your R:R improved because price moved in your direction', 'Only the reward changes, not the risk'], correct: 1 },
  { q: 'What is the "hesitation freeze"?', opts: ['When your platform freezes during order execution', 'When price stops moving at your level', 'When you see a valid trigger but cannot bring yourself to click — adrenaline overriding rational analysis', 'When you set a limit order and it does not fill'], correct: 2 },
  { q: 'Your timing data shows 40% of your trades are entered 2+ candles late. What should you prioritise?', opts: ['Finding better setups that move slower', 'Setting alerts 2 pips before your levels and being at the screen during your Kill Zone', 'Switching to a longer timeframe', 'Using pending orders for all trades'], correct: 1 },
  { q: 'After the trigger candle closes, what is the maximum acceptable delay before entering?', opts: ['0 seconds — you should use pending orders', '1-3 seconds — enough to verify the close, not enough to degrade R:R', '30 seconds — time to re-check all timeframes', 'One full candle — confirmation is important'], correct: 1 },
  { q: 'You enter a trade 3 pips late on a 10-pip stop. What percentage of your risk is consumed by the timing leak?', opts: ['3%', '10%', '30%', '50%'], correct: 2 },
  { q: 'What is the difference between "caution" and "hesitation freeze" at the moment of entry?', opts: ['There is no difference — both are valid reasons to wait', 'Caution is pre-entry analysis; hesitation freeze is adrenaline preventing execution of an already-validated trade', 'Caution happens before the trigger; freeze happens after a loss', 'Both are caused by insufficient analysis'], correct: 1 },
  { q: 'Your R:R degrades from 1:2.0 to 1:1.1 due to late entry. What should you do?', opts: ['Enter anyway — the setup is still valid', 'SKIP — R:R below minimum viable threshold', 'Enter with a tighter stop to restore R:R', 'Enter with larger size to compensate'], correct: 1 },
  { q: 'Which timing leak typically causes the LARGEST R:R degradation?', opts: ['Partial-candle entry', 'Alert lag (1-2 minute delay)', 'Re-analysis loop (rechecking all timeframes at the moment of execution)', 'Spread widening during fast moves'], correct: 2 },
];

function Confetti({ active }: { active: boolean }) {
  if (!active) return null;
  return (<div className="fixed inset-0 pointer-events-none z-50">{Array.from({ length: 60 }).map((_, i) => (<motion.div key={i} initial={{ y: -20, x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400), opacity: 1 }} animate={{ y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 20, rotate: Math.random() * 720, opacity: 0 }} transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5 }} className="absolute w-2 h-2 rounded-sm" style={{ background: ['#f59e0b', '#d946ef', '#34d399', '#3b82f6', '#ef4444'][i % 5] }} />))}</div>);
}

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

export default function ExecutionTimingLesson() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);

  const [openLeak, setOpenLeak] = useState<number | null>(null);

  // Interactive — Timing Analyser
  const [taOptimalEntry, setTaOptimalEntry] = useState('2331');
  const [taActualEntry, setTaActualEntry] = useState('2335');
  const [taStopLevel, setTaStopLevel] = useState('2323');
  const [taTpLevel, setTaTpLevel] = useState('2347');
  const [taTradesTotal, setTaTradesTotal] = useState('40');
  const [taTradesLate, setTaTradesLate] = useState('15');
  const [taRiskPerTrade, setTaRiskPerTrade] = useState('100');

  const optimal = parseFloat(taOptimalEntry) || 0;
  const actual = parseFloat(taActualEntry) || 0;
  const stop = parseFloat(taStopLevel) || 0;
  const tp = parseFloat(taTpLevel) || 0;
  const totalTrades = parseFloat(taTradesTotal) || 1;
  const lateTrades = parseFloat(taTradesLate) || 0;
  const riskPer = parseFloat(taRiskPerTrade) || 0;

  const optimalRisk = Math.abs(optimal - stop);
  const optimalReward = Math.abs(tp - optimal);
  const optimalRR = optimalRisk > 0 ? optimalReward / optimalRisk : 0;

  const actualRisk = Math.abs(actual - stop);
  const actualReward = Math.abs(tp - actual);
  const actualRR = actualRisk > 0 ? actualReward / actualRisk : 0;

  const rrDegradation = optimalRR > 0 ? ((optimalRR - actualRR) / optimalRR * 100) : 0;
  const pipsLost = Math.abs(actual - optimal);
  const pipsAsPctOfRisk = optimalRisk > 0 ? (pipsLost / optimalRisk * 100) : 0;
  const latePct = (lateTrades / totalTrades * 100);
  const costPerLate = riskPer * (rrDegradation / 100);
  const totalTimingCost = costPerLate * lateTrades;

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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 7 &middot; Lesson 5</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Execution<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Timing</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">Two identical setups. One entered at the trigger, one entered 2 candles late. The R:R difference is the difference between profit and breakeven.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* S00 */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">🔍 The Race Photographer</p>
            <p className="text-gray-400 leading-relaxed mb-4">A photographer at a Formula 1 race has ONE moment to capture the winning move. The shutter fires 50 milliseconds too late, and instead of the dramatic overtake, they get the car already past the corner. The image is technically fine — it is just not the winning shot. The lens, the settings, the position were all perfect. The timing was not.</p>
            <p className="text-gray-400 leading-relaxed">Your trigger candle is the winning moment. Your analysis, your level, your Kill Zone — all perfect setup. But if you click 2 candles too late, you get a mediocre entry instead of the optimal one. The difference between 1:2.0 R:R and 1:1.2 R:R is not your strategy. It is not your analysis. It is the 5-10 seconds between seeing the trigger and clicking the button.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">A trader tracked <strong className="text-white">120 entries</strong> over 4 months. Entries within 1 candle of trigger: <strong className="text-green-400">avg R:R = 1:1.9, WR = 51%</strong>. Entries 2+ candles late: <strong className="text-red-400">avg R:R = 1:1.1, WR = 46%</strong>. Same strategy. Same levels. Same triggers. The on-time entries produced <strong className="text-green-400">+£3,200</strong>. The late entries produced <strong className="text-red-400">−£180</strong>. Timing was worth <strong className="text-amber-400">£3,380 over 120 trades</strong>.</p>
          </div>
        </motion.div>
      </section>

      {/* S01 — On Time vs Late Animation */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; Same Setup, Two Entries</p>
          <h2 className="text-2xl font-extrabold mb-4">The R:R Cost of Hesitation</h2>
          <p className="text-gray-400 text-sm mb-6">Watch the same trade entered at two different times. The on-time entry captures the full R:R. The late entry — just 2 candles later — pays more risk for less reward.</p>
          <OnTimeVsLateAnimation />
        </motion.div>
      </section>

      {/* S02 — R:R Degradation Animation */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Degradation Curve</p>
          <h2 className="text-2xl font-extrabold mb-4">How R:R Drops With Every Candle of Delay</h2>
          <p className="text-gray-400 text-sm mb-6">Each candle of hesitation moves price further from your optimal entry. Watch a 1:2.0 trade become a 1:0.5 loser — not because the strategy failed, but because you waited too long.</p>
          <RRDegradationAnimation />
        </motion.div>
      </section>

      {/* S03 — 5 Timing Leaks */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The 5 Timing Leaks</p>
          <h2 className="text-2xl font-extrabold mb-4">Where Your Timing Goes Wrong</h2>
          <div className="space-y-3">
            {timingLeaks.map((leak, i) => (
              <div key={i} className="rounded-xl border border-white/5 overflow-hidden">
                <button onClick={() => setOpenLeak(openLeak === i ? null : i)} className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center text-sm flex-shrink-0">{leak.icon}</span>
                    <div className="text-left"><p className="text-sm font-bold text-white">{leak.name}</p><p className="text-xs text-gray-500 mt-0.5"><span className={leak.severity === 'CRITICAL' ? 'text-red-400' : leak.severity === 'HIGH' ? 'text-amber-400' : leak.severity === 'MEDIUM' ? 'text-yellow-400' : 'text-sky-400'}>{leak.severity}</span> · Cost: {leak.cost}</p></div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openLeak === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openLeak === i && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="px-4 pb-4 space-y-3"><div className="p-3 rounded-lg bg-white/[0.02]"><p className="text-xs font-bold text-red-400 mb-1">The Problem</p><p className="text-sm text-gray-400 leading-relaxed">{leak.desc}</p></div><div className="p-3 rounded-lg bg-white/[0.02]"><p className="text-xs font-bold text-green-400 mb-1">The Fix</p><p className="text-sm text-gray-400 leading-relaxed">{leak.fix}</p></div></div></motion.div>)}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S04 — The 3-Second Rule */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The 3-Second Rule</p>
          <h2 className="text-2xl font-extrabold mb-4">See Trigger → Click in 3 Seconds</h2>
          <p className="text-gray-400 text-sm mb-6">Your pre-session routine did the analysis. Your checklist defined the conditions. When those conditions are met and the trigger candle closes, you have exactly 3 seconds to execute. Not 3 seconds to re-analyse. 3 seconds to click.</p>
          <div className="space-y-3">
            {[
              { second: '0s', action: 'Trigger candle CLOSES', desc: 'The candle you were watching completes. Body size, wick quality, and volume all match your criteria. The signal is confirmed.' },
              { second: '1s', action: 'Visual confirmation', desc: 'Your eyes confirm: correct instrument, correct direction (BUY/SELL), price is at your pre-marked level. This is a scan, not an analysis.' },
              { second: '2s', action: 'Size already calculated', desc: 'Your position size was calculated in your pre-session routine (Phase 6). You are not doing maths now — you are recalling a number you already prepared.' },
              { second: '3s', action: 'CLICK', desc: 'Execute the order. Market or limit, depending on your system. The order fills. Your post-fill protocol (Lesson 7.4) begins.' },
            ].map((step, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="w-12 h-12 rounded-lg bg-amber-400/10 flex items-center justify-center text-sm font-black text-amber-400 flex-shrink-0">{step.second}</div>
                <div><p className="text-sm font-bold text-white mb-1">{step.action}</p><p className="text-xs text-gray-400 leading-relaxed">{step.desc}</p></div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
            <p className="text-xs text-amber-400">💡 The 3-second rule works because ALL the thinking was done BEFORE the trigger formed. You are not deciding — you are executing a decision that was already made. The difference between good traders and great traders is not the analysis. It is the speed between "I see it" and "I am in it."</p>
          </div>
        </motion.div>
      </section>

      {/* S05 — Interactive Timing Analyser */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Your Timing Analyser</p>
          <h2 className="text-2xl font-extrabold mb-4">Measure YOUR Timing Leak</h2>
          <p className="text-gray-400 text-sm mb-6">Input a recent trade where you entered late. See exactly how much R:R you lost, the cost per trade, and the total damage across your late entries.</p>
          <div className="space-y-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Optimal entry price', val: taOptimalEntry, set: setTaOptimalEntry },
                { label: 'Actual entry price', val: taActualEntry, set: setTaActualEntry },
                { label: 'Stop level', val: taStopLevel, set: setTaStopLevel },
                { label: 'Target level', val: taTpLevel, set: setTaTpLevel },
                { label: 'Total trades (sample)', val: taTradesTotal, set: setTaTradesTotal },
                { label: 'Late entries (2+ candles)', val: taTradesLate, set: setTaTradesLate },
              ].map((inp, i) => (
                <div key={i}><label className="text-xs text-gray-500 block mb-1">{inp.label}</label><input type="number" value={inp.val} onChange={e => inp.set(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white text-right focus:outline-none focus:border-amber-500/50" /></div>
              ))}
              <div className="col-span-2"><label className="text-xs text-gray-500 block mb-1">Risk per trade (£)</label><input type="number" value={taRiskPerTrade} onChange={e => setTaRiskPerTrade(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white text-right focus:outline-none focus:border-amber-500/50" /></div>
            </div>

            <div className="space-y-3 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/15 text-center">
                  <p className="text-xs text-gray-500 mb-1">Optimal R:R</p>
                  <p className="text-2xl font-black text-green-400">1:{optimalRR.toFixed(1)}</p>
                  <p className="text-[10px] text-gray-600">Risk: {optimalRisk.toFixed(1)} · Reward: {optimalReward.toFixed(1)}</p>
                </div>
                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 text-center">
                  <p className="text-xs text-gray-500 mb-1">Actual R:R (late)</p>
                  <p className={`text-2xl font-black ${actualRR >= 1.5 ? 'text-amber-400' : 'text-red-400'}`}>1:{actualRR.toFixed(1)}</p>
                  <p className="text-[10px] text-gray-600">Risk: {actualRisk.toFixed(1)} · Reward: {actualReward.toFixed(1)}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                  <p className="text-[10px] text-gray-500 mb-1">R:R Degradation</p>
                  <p className={`text-lg font-black ${rrDegradation > 30 ? 'text-red-400' : rrDegradation > 15 ? 'text-amber-400' : 'text-green-400'}`}>{rrDegradation.toFixed(0)}%</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                  <p className="text-[10px] text-gray-500 mb-1">Pips Lost</p>
                  <p className="text-lg font-black text-amber-400">{pipsLost.toFixed(1)}</p>
                  <p className="text-[9px] text-gray-600">{pipsAsPctOfRisk.toFixed(0)}% of risk</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                  <p className="text-[10px] text-gray-500 mb-1">Late Entry %</p>
                  <p className={`text-lg font-black ${latePct > 30 ? 'text-red-400' : latePct > 15 ? 'text-amber-400' : 'text-green-400'}`}>{latePct.toFixed(0)}%</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center justify-between mb-2"><p className="text-xs text-gray-500">Total timing cost</p><p className={`text-xl font-black ${totalTimingCost > 500 ? 'text-red-400' : totalTimingCost > 200 ? 'text-amber-400' : 'text-green-400'}`}>£{totalTimingCost.toFixed(0)}</p></div>
                <p className="text-[10px] text-gray-600">{lateTrades} late trades × £{costPerLate.toFixed(0)} R:R cost per trade = £{totalTimingCost.toFixed(0)} lost to timing across your sample</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S06 — The Pre-Position Strategy */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Pre-Position, Do Not React</p>
          <h2 className="text-2xl font-extrabold mb-4">Be Ready BEFORE the Trigger Forms</h2>
          <p className="text-gray-400 text-sm mb-6">The best execution is not fast reaction — it is pre-positioning. You should be watching the candle approach your level, not scrambling to assess it after the fact.</p>
          <div className="space-y-3">
            {[
              { step: 'Alert at level −2 pips', desc: 'Set your alert 2 pips BEFORE your key level. When it fires, you have 30-60 seconds to open the chart, position your cursor, and watch the candle form. You are now pre-positioned.' },
              { step: 'Watch the candle form', desc: 'As the trigger candle develops, assess in real-time: body growing? Volume spiking? Wick rejecting? You are building conviction BEFORE the close, not starting analysis AFTER it.' },
              { step: 'Finger on button at close', desc: 'By the time the candle closes, your assessment is 90% done. The close is the final 10% — confirming body size, wick quality, and volume. Your finger is already on BUY/SELL.' },
              { step: '3-second execution', desc: 'Candle closes → visual check → click. The entire process feels instantaneous because the analysis happened during the candle, not after it.' },
            ].map((s, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center text-xs font-black text-amber-400 flex-shrink-0">{i + 1}</span>
                <div><p className="text-sm font-bold text-white mb-1">{s.step}</p><p className="text-xs text-gray-400 leading-relaxed">{s.desc}</p></div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S07 — When Late Entry Is Acceptable */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; When Late Is Acceptable</p>
          <h2 className="text-2xl font-extrabold mb-4">The Minimum R:R Threshold</h2>
          <p className="text-gray-400 text-sm mb-6">Sometimes you ARE late — alert lag, life happens. The question is: does the trade still meet your minimum R:R?</p>
          <div className="space-y-3">
            {[
              { rr: '1:1.5 or better', verdict: 'ENTER', color: 'bg-green-500/10 border-green-500/20 text-green-400', desc: 'R:R is degraded but still viable. The trade is profitable over a large sample. Accept the reduced R:R and execute.' },
              { rr: '1:1.0 to 1:1.4', verdict: 'MARGINAL — enter with caution', color: 'bg-amber-500/10 border-amber-500/20 text-amber-400', desc: 'Barely viable. At 1:1.0, you need 50% WR just to breakeven. Only enter if every other condition is exceptional (HTF, trigger quality, session, no news).' },
              { rr: 'Below 1:1.0', verdict: 'SKIP', color: 'bg-red-500/10 border-red-500/20 text-red-400', desc: 'Negative expectancy. No matter how perfect the setup WAS, the current R:R means you are risking more than you can gain. Log it as "missed — timing" and move on.' },
            ].map((tier, i) => (
              <div key={i} className={`p-4 rounded-xl border ${tier.color.split(' ').slice(0, 2).join(' ')}`}>
                <div className="flex items-center justify-between mb-2"><span className="text-sm font-bold text-white">{tier.rr}</span><span className={`text-xs font-bold ${tier.color.split(' ')[2]}`}>{tier.verdict}</span></div>
                <p className="text-xs text-gray-400 leading-relaxed">{tier.desc}</p>
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
              { mistake: 'Chasing entries after the move has started', fix: 'If price has moved 60%+ toward your TP, the trade is over. You did not miss a trade — you missed THIS instance. The setup will repeat. Let it go.' },
              { mistake: 'Tightening stops to "restore" R:R on a late entry', fix: 'Your stop is structural (below the OB). Moving it closer does not fix the entry problem — it creates a stop problem. You will get stopped out by noise and blame the strategy instead of the timing.' },
              { mistake: 'Entering during the candle because "it looks like it will be bullish"', fix: 'Lesson 7.3 Principle 1: wait for the CLOSE. A candle at minute 8 of 15 can reverse completely. Partial-candle entries turn timing confidence into timing gambling.' },
              { mistake: 'Not tracking timing data in your journal', fix: 'If you do not record your optimal vs actual entry, you cannot measure the leak. Add one column to your journal: "Candles after trigger (0 = on time)." This creates the data to quantify your timing cost.' },
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
          <h2 className="text-2xl font-extrabold mb-4">Execution Timing Quick Reference</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { title: '3-Second Rule', body: 'Trigger closes → visual check → CLICK. All analysis was done before. Execution is not thinking time.', color: 'border-green-500/20 bg-green-500/5' },
              { title: 'Pre-Position', body: 'Alert at level −2 pips. Watch candle form. Finger on button before close. Anticipate, do not react.', color: 'border-sky-500/20 bg-sky-500/5' },
              { title: 'Min R:R Threshold', body: '≥1:1.5 = enter. 1:1.0-1:1.4 = marginal. <1:1.0 = SKIP. No exceptions.', color: 'border-amber-500/20 bg-amber-500/5' },
              { title: '5 Timing Leaks', body: 'Freeze, Confirmation Addiction, Alert Lag, Re-Analysis Loop, Partial-Candle Entry. Know your dominant leak.', color: 'border-red-500/20 bg-red-500/5' },
              { title: 'Track It', body: 'Journal column: "Candles after trigger." Without data, you cannot fix what you cannot measure.', color: 'border-purple-500/20 bg-purple-500/5' },
              { title: 'The Math', body: 'Each pip of delay = X% of risk consumed. On a 10-pip stop, 3 pips late = 30% of risk wasted before the trade begins.', color: 'border-pink-500/20 bg-pink-500/5' },
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
          <h2 className="text-2xl font-extrabold mb-2">Execution Timing Game</h2>
          <p className="text-gray-400 text-sm mb-6">5 scenarios that test your ability to quantify and manage timing leaks.</p>
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
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Excellent — you understand exactly how timing affects your edge.' : gameScore >= 3 ? 'Good — review the R:R degradation maths and the pre-position strategy.' : 'Re-read the 5 timing leaks and the 3-second rule, then try again.'}</p></motion.div>)}
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
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-green-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">⏱️</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 7: Execution Timing</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-green-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Precision Timer &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L7.5-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
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
