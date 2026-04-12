// app/academy/lesson/stop-placement-science/page.tsx
// ATLAS Academy — Lesson 6.6: Stop Placement Science [PRO]
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
// ANIMATION 1: Amateur vs Pro Stop — Same trade, different stops
// Left: fixed 20-pip stop gets hunted. Right: structure stop survives.
// ============================================================
function StopComparisonAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.006;
    const mid = w / 2;
    const pad = 20;
    const top = 42;
    const bot = h - 30;
    const progress = Math.min(1, (t % 3.5) / 3);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Same Trade — Different Stop Placement', mid, 14);

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(mid, top - 5); ctx.lineTo(mid, bot + 5); ctx.stroke();
    ctx.setLineDash([]);

    // Labels
    ctx.font = 'bold 10px system-ui';
    ctx.fillStyle = '#ef4444'; ctx.textAlign = 'center';
    ctx.fillText('AMATEUR: Fixed 20-pip Stop', mid / 2, 30);
    ctx.fillStyle = '#34d399';
    ctx.fillText('PRO: Structure Stop', mid + mid / 2, 30);

    // Price path (same for both): entry → dip below 20 pips → recover → profit
    const pricePath = [
      [0.05, 0.40], [0.15, 0.38], [0.25, 0.42], [0.35, 0.50],
      [0.42, 0.58], [0.48, 0.62], [0.52, 0.65], // dip — sweeps 20-pip stop
      [0.58, 0.60], [0.65, 0.50], [0.75, 0.35],
      [0.85, 0.25], [0.95, 0.18],
    ];

    const entryY = 0.40;
    const fixedStopY = 0.56; // 20 pips below entry
    const structStopY = 0.72; // below OB structure
    const obTopY = 0.60;
    const obBotY = 0.68;

    const visCount = Math.floor(progress * pricePath.length);

    // Draw both charts
    [0, 1].forEach(side => {
      const offsetX = side === 0 ? 0 : mid;
      const chartW = mid - pad * 2;
      const startX = offsetX + pad;

      // Entry level
      const eY = top + entryY * (bot - top);
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(startX, eY); ctx.lineTo(startX + chartW, eY); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '7px system-ui'; ctx.textAlign = 'left';
      ctx.fillText('Entry', startX + 2, eY - 4);

      // Stop level
      const stopY = side === 0 ? fixedStopY : structStopY;
      const sY = top + stopY * (bot - top);
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = side === 0 ? 'rgba(239,68,68,0.5)' : 'rgba(52,211,153,0.5)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(startX, sY); ctx.lineTo(startX + chartW, sY); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = side === 0 ? 'rgba(239,68,68,0.6)' : 'rgba(52,211,153,0.6)';
      ctx.fillText(side === 0 ? 'SL: 20 pips' : 'SL: Below OB', startX + 2, sY + 10);

      // OB zone (only on pro side)
      if (side === 1) {
        const obT = top + obTopY * (bot - top);
        const obB = top + obBotY * (bot - top);
        ctx.fillStyle = 'rgba(52,211,153,0.06)';
        ctx.fillRect(startX, obT, chartW, obB - obT);
        ctx.strokeStyle = 'rgba(52,211,153,0.2)'; ctx.lineWidth = 1;
        ctx.strokeRect(startX, obT, chartW, obB - obT);
        ctx.fillStyle = 'rgba(52,211,153,0.3)'; ctx.font = '7px system-ui';
        ctx.fillText('OB', startX + 3, obT + 10);
      }

      // Price line
      ctx.beginPath();
      for (let i = 0; i <= visCount && i < pricePath.length; i++) {
        const px = startX + pricePath[i][0] * chartW;
        const py = top + pricePath[i][1] * (bot - top);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = side === 0 ? '#ef4444' : '#34d399';
      ctx.lineWidth = 2; ctx.stroke();

      // Stop hit marker (amateur side)
      if (side === 0 && visCount >= 6) {
        const hitX = startX + 0.48 * chartW;
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 9px system-ui'; ctx.textAlign = 'center';
        ctx.fillText('✗ STOPPED OUT', hitX, sY - 6);

        // Show price continuing up after stop (ghost line)
        if (visCount >= 8) {
          ctx.setLineDash([2, 2]);
          ctx.beginPath();
          for (let i = 6; i <= visCount && i < pricePath.length; i++) {
            const px = startX + pricePath[i][0] * chartW;
            const py = top + pricePath[i][1] * (bot - top);
            if (i === 6) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.strokeStyle = 'rgba(52,211,153,0.3)'; ctx.lineWidth = 1.5; ctx.stroke();
          ctx.setLineDash([]);
          if (visCount >= 11) {
            ctx.fillStyle = 'rgba(52,211,153,0.4)'; ctx.font = '8px system-ui';
            ctx.fillText('Price went to TP...', startX + 0.85 * chartW, top + 0.22 * (bot - top));
          }
        }
      }

      // Win marker (pro side)
      if (side === 1 && visCount >= 11) {
        const winX = startX + 0.90 * chartW;
        const winY = top + 0.20 * (bot - top);
        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 9px system-ui'; ctx.textAlign = 'center';
        ctx.fillText('✓ TP HIT', winX, winY - 6);
      }
    });

    // Bottom summary
    ctx.font = '9px system-ui'; ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(239,68,68,0.5)';
    ctx.fillText('Stop hit by liquidity sweep → missed the move', mid / 2, bot + 14);
    ctx.fillStyle = 'rgba(52,211,153,0.5)';
    ctx.fillText('Stop survived below structure → captured the trade', mid + mid / 2, bot + 14);
  }, []);
  return <AnimScene drawFn={draw} height={320} />;
}

// ============================================================
// ANIMATION 2: Stop Methods Visualised — 3 methods side by side
// Structure, ATR, and Swing-based stops at the same OB
// ============================================================
function StopMethodsAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.008;
    const pad = 15;
    const top = 40;
    const bot = h - 35;
    const cols = 3;
    const colW = (w - pad * 2) / cols;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('3 Stop Methods at the Same Order Block', w / 2, 14);

    const methods = [
      { name: 'Structure Stop', color: '#34d399', stopLevel: 0.78, label: 'Below OB Low', desc: 'Tightest. Best R:R.' },
      { name: 'ATR Stop', color: '#f59e0b', stopLevel: 0.85, label: 'OB Low − 1.5×ATR', desc: 'Adapts to volatility.' },
      { name: 'Swing Stop', color: '#3b82f6', stopLevel: 0.92, label: 'Below Swing Low', desc: 'Widest. Most room.' },
    ];

    const entryLevel = 0.42;
    const obTop = 0.55;
    const obBot = 0.70;

    methods.forEach((m, mi) => {
      const cx = pad + colW * mi + colW / 2;
      const left = pad + colW * mi + 5;
      const right = pad + colW * (mi + 1) - 5;
      const cw = right - left;

      // Divider
      if (mi > 0) {
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.beginPath(); ctx.moveTo(pad + colW * mi, top); ctx.lineTo(pad + colW * mi, bot); ctx.stroke();
      }

      // Method name
      ctx.fillStyle = m.color;
      ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center';
      ctx.fillText(m.name, cx, 30);

      // Entry level
      const eY = top + entryLevel * (bot - top);
      ctx.setLineDash([2, 2]); ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(left, eY); ctx.lineTo(right, eY); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '7px system-ui'; ctx.textAlign = 'left';
      ctx.fillText('Entry', left + 2, eY - 3);

      // OB zone
      const obT = top + obTop * (bot - top);
      const obB = top + obBot * (bot - top);
      ctx.fillStyle = 'rgba(52,211,153,0.06)';
      ctx.fillRect(left, obT, cw, obB - obT);
      ctx.strokeStyle = 'rgba(52,211,153,0.2)'; ctx.lineWidth = 1;
      ctx.strokeRect(left, obT, cw, obB - obT);
      ctx.fillStyle = 'rgba(52,211,153,0.25)'; ctx.font = '7px system-ui';
      ctx.fillText('OB', left + 3, obT + 10);

      // Stop level
      const sY = top + m.stopLevel * (bot - top);
      ctx.strokeStyle = m.color + '88'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(left, sY); ctx.lineTo(right, sY); ctx.stroke();

      // Stop label
      ctx.fillStyle = m.color;
      ctx.font = '8px system-ui'; ctx.textAlign = 'center';
      ctx.fillText(m.label, cx, sY + 12);

      // R:R visual (entry to stop distance vs entry to TP)
      const risk = sY - eY;
      const reward = eY - (top + 0.10 * (bot - top)); // TP at 0.10
      const rr = (reward / risk).toFixed(1);

      // Risk bar
      ctx.fillStyle = m.color + '22';
      ctx.fillRect(right - 14, eY, 10, risk);
      ctx.strokeStyle = m.color + '44'; ctx.lineWidth = 1;
      ctx.strokeRect(right - 14, eY, 10, risk);

      // R:R label
      ctx.fillStyle = m.color;
      ctx.font = 'bold 9px system-ui'; ctx.textAlign = 'center';
      ctx.fillText(`1:${rr}`, cx, bot + 8);
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '7px system-ui';
      ctx.fillText(m.desc, cx, bot + 20);
    });
  }, []);
  return <AnimScene drawFn={draw} height={310} />;
}

// ============================================================
// DATA
// ============================================================
const stopMethods = [
  { icon: '🏗️', name: 'Structure Stop', subtitle: 'The ATLAS Standard', desc: 'Place the stop below the Order Block low (longs) or above the OB high (shorts), plus a small buffer (2-5 pips + spread). This is the tightest possible stop that still respects the structural thesis.', pros: 'Best R:R ratio. Tightest risk. Directly tied to your thesis — if the OB breaks, you are genuinely wrong.', cons: 'Can get swept by liquidity grabs that wick below the OB low before reversing. Slightly lower win rate due to stop hunts.', when: 'Default for Model 1 and Model 2 entries at well-defined OBs. Use when the OB has a clean low/high with clear structure behind it.', formula: 'SL = OB Low − (Spread + 2-5 pips buffer)', example: 'Gold OB at 2,328-2,332. OB low = 2,328. Spread = 0.5 pips. SL = 2,328 − 0.5 − 3 = 2,324.5. Entry at 2,332. Risk = 7.5 pips.' },
  { icon: '📏', name: 'ATR Stop', subtitle: 'Volatility-Adaptive', desc: 'Place the stop at the OB low minus a multiple of ATR (typically 0.5× to 1.5× ATR-14). This automatically adjusts to market volatility — wider in volatile markets, tighter in calm markets.', pros: 'Adapts to conditions. In a volatile session, your stop widens naturally so you do not get stopped by normal noise. In a calm session, it tightens to preserve R:R.', cons: 'Can be wider than structure stops, reducing R:R. Does not directly correspond to a structural invalidation point.', when: 'Use when the OB is in a volatile area with frequent wicks, or when you want the stop to self-adjust. Good for NASDAQ and Gold which have variable intraday volatility.', formula: 'SL = OB Low − (ATR-14 × multiplier). Common: 1.0× ATR for swing, 0.5× for intraday.', example: 'EUR/USD OB low = 1.0850. ATR-14 on 1H = 12 pips. Multiplier = 1.0×. SL = 1.0850 − 0.0012 = 1.0838. Risk = 12 pips from entry at 1.0850.' },
  { icon: '🔄', name: 'Swing Stop', subtitle: 'Maximum Protection', desc: 'Place the stop below the most recent swing low (longs) or above the most recent swing high (shorts), regardless of where the OB sits. This gives the trade maximum room but at the cost of wider risk.', pros: 'Highest survival rate — rarely gets stopped by normal price action. If this stop gets hit, the entire swing structure is broken.', cons: 'Widest stop = worst R:R. Requires larger account or smaller position size. May force you to accept 1:1 or worse R:R.', when: 'Use on higher timeframes (4H, Daily) where swing distances are large anyway. Also useful in very volatile conditions where OB stops are too tight and keep getting clipped.', formula: 'SL = Recent Swing Low − (Spread + 2-3 pips)', example: 'Gold 4H swing low at 2,310. Spread = 0.5. SL = 2,310 − 0.5 − 3 = 2,306.5. Entry at 2,332. Risk = 25.5 pips (wider, but the swing structure must break to hit it).' },
];

const gameRounds = [
  { scenario: 'You enter a Model 1 long on Gold 15M at 2,340. The OB low is at 2,334. ATR-14 on the 15M is 8 pips. The recent swing low is at 2,325. Where should your structure stop go?', options: [
    { text: '2,320 — 20 pips below entry (fixed distance)', correct: false, explain: '20 pips has no structural meaning. Your thesis is based on the OB at 2,334, not an arbitrary distance from entry. A fixed-pip stop ignores the market structure entirely.' },
    { text: '2,331 — OB low (2,334) minus spread (0.5) minus 2.5 pip buffer', correct: true, explain: 'Correct. Structure stop = OB Low − spread − buffer = 2,334 − 0.5 − 2.5 = 2,331. Risk = 9 pips. If price breaks below 2,331, the OB has genuinely failed and your thesis is wrong. This is the tightest valid stop.' },
    { text: '2,340 — at your entry price (breakeven)', correct: false, explain: 'A stop at entry gives zero room. Price will almost certainly wick through your entry before moving in your direction. This is the fastest way to get stopped on every trade.' },
    { text: '2,334 — exactly at the OB low', correct: false, explain: 'Placing the stop AT the OB low means a single tick below the OB triggers your stop. You need the buffer for spread + a few pips so that normal wicks do not clip you. Stops go BELOW the OB, not AT it.' },
  ]},
  { scenario: 'NASDAQ is extremely volatile today — ATR is 2x its normal value after a surprise Fed announcement. You have a Model 1 setup with an OB on the 15M. Normally your structure stop would be 15 points. But with this volatility, even normal candles are swinging 20-30 points. What do you do?', options: [
    { text: 'Use the normal 15-point structure stop — the OB is the OB', correct: false, explain: 'In 2x ATR conditions, a normal structure stop gets clipped by regular candle noise. The OB is valid, but the stop needs to account for the wider candles.' },
    { text: 'Switch to an ATR stop: OB low minus 1.0× ATR. This automatically gives you a wider stop that respects the current volatility.', correct: true, explain: 'Correct. The ATR stop adapts to conditions. If ATR is 2x normal, your stop widens proportionally. You then reduce your POSITION SIZE to keep the dollar risk the same. Wider stop × smaller size = same dollar risk.' },
    { text: 'Skip the trade entirely — high volatility is too risky', correct: false, explain: 'Skipping is a valid choice, but the question asks what to do if you take the trade. The ATR stop solves the volatility problem without skipping opportunities.' },
    { text: 'Use a 50-point fixed stop to be safe', correct: false, explain: '50 points is arbitrary. An ATR-based stop is calculated, not guessed. And 50 points might be too wide or too tight depending on the actual ATR.' },
  ]},
  { scenario: 'You entered long on EUR/USD at 1.0860. Your stop is at 1.0845 (below the OB). Price has moved to 1.0880 (+20 pips, 1:1.3 R:R). It starts pulling back. Your friend says "move your stop to breakeven." Should you?', options: [
    { text: 'Yes immediately — protect profit at all costs', correct: false, explain: 'Moving to breakeven too early means normal pullbacks (which happen on virtually every trade) will stop you at breakeven, and you miss the 1:2 or 1:3 target. The trade has not yet reached TP1.' },
    { text: 'Move to breakeven only AFTER TP1 is hit (typically 1:1 R:R). Before TP1, keep the stop at the original structural level.', correct: true, explain: 'Correct. The original stop at 1.0845 is still valid — the OB has not been broken. Moving to breakeven before TP1 turns a winning strategy into a breakeven strategy. The rule: SL stays at structure until TP1, then moves to BE. This protects the remaining position while letting winners develop.' },
    { text: 'Move the stop to 1.0855 (halfway) as a compromise', correct: false, explain: '1.0855 has no structural meaning. It is a "feel-good" stop that makes you emotionally comfortable but is not based on any market logic. If the OB at 1.0845 is valid, the stop should stay there.' },
    { text: 'Move the stop further down to give it more room', correct: false, explain: 'Moving a stop further away from entry increases risk. You should never widen a stop after entry — your risk was calculated before the trade. Wider stop = more loss if wrong.' },
  ]},
  { scenario: 'A new trader always uses a 30-pip stop on every trade, regardless of the instrument or timeframe. He trades Gold 15M, EUR/USD 4H, and NASDAQ 5M with the same 30-pip stop. What is the core problem?', options: [
    { text: '30 pips is too wide for EUR/USD', correct: false, explain: 'On the 4H, 30 pips might actually be too tight for EUR/USD. The problem is not the specific number — it is using the SAME number for everything.' },
    { text: 'A fixed-pip stop ignores market structure and volatility — 30 pips is too tight for Gold, too wide for EUR/USD 4H, and has no structural meaning on any of them', correct: true, explain: 'Correct. Gold can swing 30 pips in a single candle, so 30 pips gets stopped by noise. EUR/USD 4H OBs might have 50-pip range, making 30 pips too tight for the structure. NASDAQ 5M might only need a 10-point stop. Fixed-pip stops have ZERO relationship to the market you are trading.' },
    { text: 'He should use 50 pips instead for safety', correct: false, explain: '50 pips is equally arbitrary. The fix is not a bigger number — it is using structure-based stops that adapt to each instrument and timeframe.' },
    { text: 'He needs to trade only one instrument', correct: false, explain: 'Trading one instrument would help consistency, but the fixed-pip stop problem would remain. Even on one instrument, the correct stop distance changes with every trade based on where the OB sits.' },
  ]},
  { scenario: 'You are in a Gold short trade. Your stop is at 2,365 (above the supply OB). Price approaches 2,362 — 3 pips from your stop. You feel anxious. The urge to move the stop to 2,370 to "give it room" is strong. What is the correct response?', options: [
    { text: 'Move it to 2,370 — 5 extra pips of room might save the trade', correct: false, explain: 'Moving the stop further away is the #1 amateur mistake. Your stop was placed at 2,365 for a REASON — above the OB. If price reaches 2,365, the OB has failed. Moving to 2,370 just means you lose 5 more pips when the thesis was already wrong.' },
    { text: 'Do nothing. The stop is at 2,365 because that is where the thesis is invalidated. If it hits, you are wrong. Accept the loss.', correct: true, explain: 'Correct. The anxiety is emotional, not strategic. Your stop was calculated before the trade when you were calm and objective. Moving it during the trade is a fear-based decision. If 2,365 gets hit, the supply OB has been broken — you ARE wrong, and taking the loss is the right thing to do.' },
    { text: 'Close the trade now at a smaller loss before it hits the stop', correct: false, explain: 'Closing before your stop means you are overriding your own system. Price at 2,362 might wick to 2,363 and reverse sharply. You would have closed a winner as a loser because of anxiety.' },
    { text: 'Add to the position to average down your entry', correct: false, explain: 'Adding to a losing position that is 3 pips from your stop is doubling down on a potentially failed thesis. If it hits the stop, you now lose twice as much.' },
  ]},
];

const quizQuestions = [
  { q: 'What is the primary advantage of a structure-based stop over a fixed-pip stop?', opts: ['It is always tighter', 'It is placed at the point where your thesis is genuinely invalidated — if hit, you are actually wrong', 'It never gets hit', 'It is easier to calculate'], correct: 1, explain: 'A structure stop is meaningful. Below the OB = the OB has failed. Below the swing low = the structure has broken. A fixed-pip stop has no relationship to market structure — it is arbitrary, and being stopped out tells you nothing about whether your thesis was wrong.' },
  { q: 'When should you use an ATR-based stop instead of a structure stop?', opts: ['Always — ATR is more accurate', 'When volatility is significantly above normal, and structure stops keep getting clipped by regular candle noise', 'Never — structure stops are always better', 'When you are trading crypto'], correct: 1, explain: 'ATR stops adapt to volatility. In normal conditions, structure stops are optimal (tightest R:R). In high-volatility conditions (news, event-driven moves), ATR stops prevent you from getting stopped by noise while maintaining a calculated risk.' },
  { q: 'What should you do when price approaches your stop loss and you feel the urge to move it further away?', opts: ['Move it — trust your instincts', 'Move it but only by 5 pips', 'Do nothing — the stop was placed for a structural reason. If it hits, your thesis is wrong. Accept the loss.', 'Close the trade early'], correct: 2, explain: 'Moving a stop further from entry is always wrong. Your stop was calculated when you were calm and objective. During the trade, you are emotional. Trust the pre-trade plan, not the mid-trade feelings.' },
  { q: 'A Gold 15M OB has its low at 2,328. The spread is 0.5 pips. What is the correct structure stop?', opts: ['2,328 — at the OB low exactly', '2,325 — OB low minus spread minus 2.5 buffer', '2,308 — 20 pips below entry', '2,330 — above the OB low'], correct: 1, explain: 'Structure stop = OB Low − Spread − Buffer = 2,328 − 0.5 − 2.5 = 2,325. The buffer (2-5 pips) prevents normal wicks from clipping you. Placing the stop AT the OB low (2,328) is too tight — a 1-pip wick kills the trade.' },
  { q: 'Why should position size change when stop distance changes?', opts: ['It should not — always use the same lot size', 'Because your DOLLAR risk must stay constant. Wider stop = smaller position. Tighter stop = larger position.', 'Because brokers require it', 'To maximise profit on every trade'], correct: 1, explain: 'If you risk 1% of a £10,000 account = £100. With a 10-pip stop: lot size = 1.0. With a 20-pip stop: lot size = 0.5. Same £100 risk, different stop width, different position size. This is how professionals maintain consistent risk regardless of market conditions.' },
  { q: 'When is it appropriate to move your stop to breakeven?', opts: ['Immediately after entry', 'After price moves 5 pips in your favour', 'After TP1 is hit — not before', 'When you feel nervous'], correct: 2, explain: 'Moving to breakeven before TP1 means normal pullbacks (which happen on 80%+ of trades) will stop you flat. Wait for TP1 (typically 1:1 R:R), take partial profit, then move the remaining stop to breakeven. This locks in profit on the first portion while giving the rest room to reach TP2.' },
  { q: 'A swing stop below the recent swing low gives you a 50-pip stop distance. Your normal structure stop would be 15 pips. When is the swing stop justified?', opts: ['Never — always use the tightest stop', 'On higher timeframes (4H/Daily) where swing distances are naturally wider, or in extreme volatility where structure stops keep getting hit', 'Only on cryptocurrency', 'When you have a large account'], correct: 1, explain: 'On a 4H or Daily chart, a 50-pip swing stop is proportional to the timeframe. On a 15M chart, 50 pips would be excessive. The key is proportionality: the stop must match the timeframe and the volatility. Swing stops are for higher TFs or extreme conditions.' },
  { q: 'What is the formula that connects stop distance, position size, and account risk?', opts: ['Position Size = Account × Risk%', 'Position Size = (Account × Risk%) ÷ (Stop Distance in pips × Pip Value)', 'Position Size = Stop Distance × 2', 'Position Size = Account ÷ 100'], correct: 1, explain: 'This is the master formula. £10,000 account × 1% risk = £100 max loss. Stop = 10 pips. Pip value on Gold = £10/pip at 1.0 lots. Position = £100 ÷ (10 × £10) = 1.0 lots. Change the stop to 20 pips: £100 ÷ (20 × £10) = 0.5 lots. The formula ensures consistent risk.' },
];

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

function Confetti({ active }: { active: boolean }) {
  if (!active) return null;
  return (<div className="fixed inset-0 pointer-events-none z-50">{Array.from({ length: 60 }).map((_, i) => (<motion.div key={i} initial={{ y: -20, x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400), opacity: 1 }} animate={{ y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 20, rotate: Math.random() * 720, opacity: 0 }} transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5 }} className="absolute w-2 h-2 rounded-sm" style={{ background: ['#f59e0b', '#d946ef', '#34d399', '#3b82f6', '#ef4444'][i % 5] }} />))}</div>);
}

export default function StopPlacementScienceLesson() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);

  const [openMethod, setOpenMethod] = useState<number | null>(null);

  // Interactive — Stop Calculator
  const [calcEntry, setCalcEntry] = useState('');
  const [calcObLow, setCalcObLow] = useState('');
  const [calcSpread, setCalcSpread] = useState('0.5');
  const [calcBuffer, setCalcBuffer] = useState('3');
  const [calcAccount, setCalcAccount] = useState('10000');
  const [calcRiskPct, setCalcRiskPct] = useState('1');
  const [calcPipVal, setCalcPipVal] = useState('10');

  const entry = parseFloat(calcEntry) || 0;
  const obLow = parseFloat(calcObLow) || 0;
  const spread = parseFloat(calcSpread) || 0;
  const buffer = parseFloat(calcBuffer) || 0;
  const account = parseFloat(calcAccount) || 0;
  const riskPct = parseFloat(calcRiskPct) || 0;
  const pipVal = parseFloat(calcPipVal) || 1;

  const stopLevel = obLow > 0 ? obLow - spread - buffer : 0;
  const stopDist = entry > 0 && stopLevel > 0 ? Math.abs(entry - stopLevel) : 0;
  const dollarRisk = account * (riskPct / 100);
  const lotSize = stopDist > 0 && pipVal > 0 ? dollarRisk / (stopDist * pipVal) : 0;
  const hasCalc = entry > 0 && obLow > 0;

  // Mistakes
  const [openMistake, setOpenMistake] = useState<number | null>(null);
  const mistakes = [
    { title: 'Using fixed-pip stops on every trade', desc: 'A 20-pip stop on Gold, EUR/USD, and NASDAQ treats completely different markets identically. Gold can swing 20 pips in a single candle. EUR/USD 4H candles barely move 20 pips. NASDAQ points and forex pips are not the same thing. Structure-based stops adapt to each trade.' },
    { title: 'Moving the stop further away during the trade', desc: 'This is fear masquerading as risk management. Your stop was placed at a structural level for a reason. Moving it further away means you are now risking more than planned on a thesis that is ALREADY showing weakness (price is near your stop). If the OB breaks, you are wrong — adding distance just means being wrong with a bigger loss.' },
    { title: 'Moving to breakeven too early', desc: 'Moving to breakeven after 5 pips of profit means every normal pullback stops you flat. You end up with a 50% breakeven rate and a 50% loss rate — the profitable trades never develop because you choked them at birth. Wait for TP1 before moving to BE.' },
    { title: 'Placing the stop AT the OB low instead of BELOW it', desc: 'A stop at exactly the OB low gets triggered by any wick that touches the OB boundary. Normal price action wicks below OBs by a few pips before bouncing. The buffer (2-5 pips + spread) is not optional — it is the difference between getting stopped by noise and staying in the trade.' },
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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 6 &middot; Lesson 6</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Stop Placement<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Science</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">Your stop IS your risk. Where you place it determines everything &mdash; your R:R, your position size, and whether you survive.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* S00 */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">🔍 The Fire Alarm Analogy</p>
            <p className="text-gray-400 leading-relaxed mb-4">A fire alarm placed too close to the kitchen goes off every time you cook. You start ignoring it. A fire alarm placed too far from the kitchen never goes off when there is an actual fire. The right alarm is close enough to detect real danger but far enough to ignore normal cooking smoke.</p>
            <p className="text-gray-400 leading-relaxed">Your stop loss works exactly the same way. Too tight and it triggers on normal price noise (you get &ldquo;stopped out&rdquo; on trades that would have won). Too wide and it gives back too much when you are genuinely wrong. The science is in finding the exact distance that says: &ldquo;If this level is reached, my thesis is ACTUALLY wrong.&rdquo;</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">A trader switched from 20-pip fixed stops to structure-based stops on Gold. His average stop went from 20 pips to 12 pips (tighter), his R:R improved from 1:1.2 to <strong className="text-green-400">1:2.1</strong>, and his win rate stayed the same. Result: <strong className="text-green-400">+68% more profit</strong> from the same setups, simply by placing stops correctly.</p>
          </div>
        </motion.div>
      </section>

      {/* S01 — Stop Comparison Animation */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; Amateur vs Pro</p>
          <h2 className="text-2xl font-extrabold mb-4">Same Trade, Different Outcome</h2>
          <p className="text-gray-400 text-sm mb-6">Watch the same price action with two different stop placements. The amateur gets stopped by a liquidity sweep. The pro survives and captures the full move.</p>
          <StopComparisonAnimation />
        </motion.div>
      </section>

      {/* S02 — 3 Stop Methods */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; 3 Stop Methods</p>
          <h2 className="text-2xl font-extrabold mb-4">Structure, ATR, and Swing</h2>
          <p className="text-gray-400 text-sm mb-6">Three ways to place your stop. Each has tradeoffs between tightness (better R:R) and survival (fewer stops hit).</p>
          <StopMethodsAnimation />
        </motion.div>
      </section>

      {/* S03 — Method Deep Dive */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; Deep Dive</p>
          <h2 className="text-2xl font-extrabold mb-4">Each Method Explained</h2>
          <div className="space-y-3">
            {stopMethods.map((m, i) => (
              <div key={i}>
                <button onClick={() => setOpenMethod(openMethod === i ? null : i)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{m.icon}</span>
                    <div><p className="text-sm font-extrabold text-white">{m.name}</p><p className="text-xs text-gray-500">{m.subtitle}</p></div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openMethod === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openMethod === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05] space-y-3">
                      <p className="text-sm text-gray-400 leading-relaxed">{m.desc}</p>
                      <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10"><p className="text-xs text-green-400">✓ <strong>Pros:</strong> {m.pros}</p></div>
                      <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10"><p className="text-xs text-red-400">✗ <strong>Cons:</strong> {m.cons}</p></div>
                      <div className="p-3 rounded-lg bg-sky-500/5 border border-sky-500/10"><p className="text-xs text-sky-400">📐 <strong>Formula:</strong> {m.formula}</p></div>
                      <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10"><p className="text-xs text-amber-400">📌 <strong>Example:</strong> {m.example}</p></div>
                    </div>
                  </motion.div>
                )}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S04 — The Golden Rule */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The Golden Rule</p>
          <h2 className="text-2xl font-extrabold mb-4">Your Stop = Your Thesis Invalidation</h2>
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <p className="text-gray-400 leading-relaxed">Every stop must answer ONE question: <strong className="text-white">&ldquo;At what price is my trade thesis genuinely wrong?&rdquo;</strong></p>
            <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/15">
              <p className="text-sm text-gray-400 leading-relaxed">If you entered long because the OB at 2,330 should hold, then your stop goes below the OB. If 2,330 breaks, your thesis (&ldquo;the OB holds&rdquo;) is WRONG. Taking the loss is correct. Staying in the trade is hoping.</p>
            </div>
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm text-gray-400 leading-relaxed">A fixed 20-pip stop says nothing about your thesis. If price moves 20 pips against you, is your thesis wrong? Maybe. Maybe not. The OB might be 25 pips below entry. A 20-pip stop takes you out 5 pips BEFORE the invalidation. The thesis was never tested.</p>
            </div>
            <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/15">
              <p className="text-sm text-gray-400 leading-relaxed">💡 <strong className="text-purple-400">The Court Analogy:</strong> A fixed-pip stop is like sentencing someone after hearing only half the evidence. A structure stop is like waiting for ALL the evidence before making a verdict. Let the market prove your thesis wrong before you exit.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S05 — Interactive Stop Calculator */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Stop Calculator</p>
          <h2 className="text-2xl font-extrabold mb-2">Calculate Your Stop &amp; Position Size</h2>
          <p className="text-gray-400 text-sm mb-6">Enter your trade details and see the exact stop level and lot size.</p>
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-xs text-gray-500 mb-1">Entry Price</p><input type="number" value={calcEntry} onChange={e => setCalcEntry(e.target.value)} placeholder="e.g. 2332" className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-gray-600 focus:border-amber-500/30 outline-none" /></div>
              <div><p className="text-xs text-gray-500 mb-1">OB Low</p><input type="number" value={calcObLow} onChange={e => setCalcObLow(e.target.value)} placeholder="e.g. 2328" className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-gray-600 focus:border-amber-500/30 outline-none" /></div>
              <div><p className="text-xs text-gray-500 mb-1">Spread (pips)</p><input type="number" value={calcSpread} onChange={e => setCalcSpread(e.target.value)} className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:border-amber-500/30 outline-none" /></div>
              <div><p className="text-xs text-gray-500 mb-1">Buffer (pips)</p><input type="number" value={calcBuffer} onChange={e => setCalcBuffer(e.target.value)} className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:border-amber-500/30 outline-none" /></div>
              <div><p className="text-xs text-gray-500 mb-1">Account Size (£)</p><input type="number" value={calcAccount} onChange={e => setCalcAccount(e.target.value)} className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:border-amber-500/30 outline-none" /></div>
              <div><p className="text-xs text-gray-500 mb-1">Risk %</p><input type="number" value={calcRiskPct} onChange={e => setCalcRiskPct(e.target.value)} className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:border-amber-500/30 outline-none" /></div>
            </div>
            <div><p className="text-xs text-gray-500 mb-1">Pip Value (£ per pip at 1.0 lot)</p><input type="number" value={calcPipVal} onChange={e => setCalcPipVal(e.target.value)} className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:border-amber-500/30 outline-none" /></div>

            {hasCalc && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/15 space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-white/[0.03]"><p className="text-[10px] text-gray-500 uppercase tracking-wider">Stop Level</p><p className="text-sm font-bold text-red-400">{stopLevel.toFixed(1)}</p></div>
                  <div className="p-3 rounded-lg bg-white/[0.03]"><p className="text-[10px] text-gray-500 uppercase tracking-wider">Stop Distance</p><p className="text-sm font-bold text-amber-400">{stopDist.toFixed(1)} pips</p></div>
                  <div className="p-3 rounded-lg bg-white/[0.03]"><p className="text-[10px] text-gray-500 uppercase tracking-wider">Dollar Risk</p><p className="text-sm font-bold text-white">£{dollarRisk.toFixed(0)}</p></div>
                  <div className="p-3 rounded-lg bg-white/[0.03]"><p className="text-[10px] text-gray-500 uppercase tracking-wider">Position Size</p><p className="text-sm font-bold text-green-400">{lotSize.toFixed(2)} lots</p></div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </section>

      {/* S06 — Stop Management Rules */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Stop Management</p>
          <h2 className="text-2xl font-extrabold mb-4">After Entry — The Rules</h2>
          <div className="p-6 rounded-2xl glass-card space-y-3">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-red-400">NEVER move a stop further from entry.</strong> <span className="text-gray-400">If the stop was placed at the OB low for a reason, moving it wider means you are now risking more on a weakening thesis.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">Move to breakeven ONLY after TP1.</strong> <span className="text-gray-400">Before TP1, the stop stays at structure. Normal pullbacks hit breakeven stops 80%+ of the time.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-green-400">Trail the stop behind structure on runners.</strong> <span className="text-gray-400">After TP1, if you leave a portion running, trail the stop below each new Higher Low (for longs) as they form.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-sky-400">Accept the loss when hit.</strong> <span className="text-gray-400">A stop hit means your thesis was wrong. Re-entering immediately is revenge trading. Wait for a new setup.</span></p></div>
          </div>
        </motion.div>
      </section>

      {/* S07 — Position Size Connection */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Stop ↔ Position Size</p>
          <h2 className="text-2xl font-extrabold mb-4">The Inseparable Pair</h2>
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <p className="text-gray-400 leading-relaxed">Your stop distance and position size are mathematically linked. When one changes, the other MUST change to keep dollar risk constant:</p>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
              <p className="text-lg font-mono font-bold text-amber-400">Lots = (Account &times; Risk%) &divide; (Stop Pips &times; Pip Value)</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/15">
                <p className="text-sm font-extrabold text-green-400 mb-2">10-pip stop</p>
                <p className="text-xs text-gray-400">£10,000 &times; 1% = £100 risk</p>
                <p className="text-xs text-gray-400">£100 &divide; (10 &times; £10) = <strong className="text-white">1.0 lots</strong></p>
              </div>
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
                <p className="text-sm font-extrabold text-amber-400 mb-2">25-pip stop</p>
                <p className="text-xs text-gray-400">£10,000 &times; 1% = £100 risk</p>
                <p className="text-xs text-gray-400">£100 &divide; (25 &times; £10) = <strong className="text-white">0.4 lots</strong></p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">Same £100 risk. Same account. Different stops. Different position sizes. This is how professionals handle different volatility conditions without changing their risk profile.</p>
          </div>
        </motion.div>
      </section>

      {/* S08 — Common Mistakes */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-6">4 Stop Placement Killers</h2>
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
          <h2 className="text-2xl font-extrabold mb-4">Stop Placement Quick Reference</h2>
          <div className="p-6 rounded-2xl glass-card space-y-3">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-green-400">Structure Stop</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">OB Low/High − spread − buffer. Tightest. Default for Model 1 &amp; 2.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">ATR Stop</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">OB Low − (ATR &times; multiplier). Adapts to volatility. Use in high-vol conditions.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-sky-400">Swing Stop</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Below recent swing low. Widest. Use on HTF or extreme conditions.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-red-400">NEVER</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Fixed-pip stops. Moving stops wider. BE before TP1. Stops AT the OB level.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-purple-400">FORMULA</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Lots = (Account &times; Risk%) &divide; (Stop Pips &times; Pip Value). Always calculate.</span></p></div>
          </div>
        </motion.div>
      </section>

      {/* S10 — Game */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Test Your Understanding</p>
          <h2 className="text-2xl font-extrabold mb-2">Stop Placement Game</h2>
          <p className="text-gray-400 text-sm mb-6">5 scenarios. Place the stop correctly.</p>
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
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Excellent — your stops will protect your capital and your sanity.' : gameScore >= 3 ? 'Solid — review the structure stop formula and management rules.' : 'Re-read the 3 methods and the golden rule, then try again.'}</p></motion.div>)}
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
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center text-3xl shadow-lg shadow-red-500/30">🛡️</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 6: Stop Placement Science</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-red-400 via-amber-400 to-red-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Risk Guardian &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L6.6-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
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
