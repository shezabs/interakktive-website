// app/academy/lesson/target-selection/page.tsx
// ATLAS Academy — Lesson 6.7: Target Selection & R:R [PRO]
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
// ANIMATION 1: 3 Target Methods — same entry, different exits
// Shows price path with Fixed R:R, Structural, and Trailing exits
// ============================================================
function TargetMethodsAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.005;
    const pad = 25;
    const top = 42;
    const bot = h - 35;
    const chartW = w - pad * 2;
    const progress = Math.min(1, (t % 4) / 3.5);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Same Entry — 3 Different Target Methods', w / 2, 14);

    // Price path (bullish trade)
    const pts = [
      [0.02, 0.65], [0.08, 0.60], [0.14, 0.55], // approach
      [0.18, 0.58], // entry
      [0.24, 0.50], [0.30, 0.53], [0.36, 0.42], // move up
      [0.42, 0.46], [0.48, 0.35], [0.54, 0.38], // continue
      [0.60, 0.28], [0.66, 0.32], [0.72, 0.22], // strong push
      [0.78, 0.26], [0.84, 0.20], [0.90, 0.24], // final
      [0.96, 0.18],
    ];

    const visCount = Math.floor(progress * pts.length);

    // Entry and stop levels
    const entryY = 0.58;
    const stopY = 0.72;
    const risk = entryY - stopY; // negative (stop below)

    // Draw price
    ctx.beginPath();
    for (let i = 0; i <= visCount && i < pts.length; i++) {
      const px = pad + pts[i][0] * chartW;
      const py = top + pts[i][1] * (bot - top);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = '#34d399'; ctx.lineWidth = 2; ctx.stroke();

    // Entry line
    const eY = top + entryY * (bot - top);
    ctx.setLineDash([3, 3]); ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad, eY); ctx.lineTo(pad + chartW, eY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '7px system-ui'; ctx.textAlign = 'left';
    ctx.fillText('Entry', pad + 2, eY + 10);

    // Stop line
    const sY = top + stopY * (bot - top);
    ctx.setLineDash([3, 3]); ctx.strokeStyle = 'rgba(239,68,68,0.3)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad, sY); ctx.lineTo(pad + 0.3 * chartW, sY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(239,68,68,0.4)'; ctx.font = '7px system-ui';
    ctx.fillText('Stop', pad + 2, sY + 10);

    // METHOD 1: Fixed R:R (1:2) — green
    const fixed2Y = entryY + (entryY - stopY) * 2; // 1:2 above entry
    const f2Y = top + (entryY - Math.abs(risk) * 2) * (bot - top);
    if (visCount >= 6) {
      ctx.setLineDash([4, 2]); ctx.strokeStyle = 'rgba(52,211,153,0.5)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(pad + 0.18 * chartW, f2Y); ctx.lineTo(pad + 0.50 * chartW, f2Y); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#34d399'; ctx.font = 'bold 8px system-ui'; ctx.textAlign = 'left';
      ctx.fillText('Fixed 1:2 TP', pad + 0.50 * chartW + 4, f2Y + 3);

      // Hit marker
      ctx.beginPath(); ctx.arc(pad + 0.36 * chartW, f2Y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#34d399'; ctx.fill();
    }

    // METHOD 2: Structural — amber (next supply OB)
    const structY = 0.28;
    const stY = top + structY * (bot - top);
    if (visCount >= 10) {
      // Supply OB zone
      ctx.fillStyle = 'rgba(239,68,68,0.06)';
      ctx.fillRect(pad + 0.55 * chartW, stY - 8, 0.15 * chartW, 16);
      ctx.strokeStyle = 'rgba(239,68,68,0.2)'; ctx.lineWidth = 1;
      ctx.strokeRect(pad + 0.55 * chartW, stY - 8, 0.15 * chartW, 16);
      ctx.fillStyle = 'rgba(239,68,68,0.3)'; ctx.font = '6px system-ui'; ctx.textAlign = 'left';
      ctx.fillText('Supply OB', pad + 0.56 * chartW, stY + 3);

      ctx.setLineDash([4, 2]); ctx.strokeStyle = 'rgba(245,158,11,0.5)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(pad + 0.18 * chartW, stY); ctx.lineTo(pad + 0.55 * chartW, stY); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#f59e0b'; ctx.font = 'bold 8px system-ui';
      ctx.fillText('Structural TP', pad + 0.70 * chartW + 4, stY + 3);

      ctx.beginPath(); ctx.arc(pad + 0.60 * chartW, stY, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b'; ctx.fill();
    }

    // METHOD 3: Trailing — purple (follows price with offset)
    if (visCount >= 14) {
      ctx.fillStyle = '#a78bfa'; ctx.font = 'bold 8px system-ui'; ctx.textAlign = 'left';
      ctx.fillText('Trailing Exit', pad + 0.88 * chartW + 4, top + 0.28 * (bot - top));

      // Trailing stop line (follows HLs)
      const trailPts = [[0.48, 0.53], [0.54, 0.46], [0.66, 0.38], [0.78, 0.32], [0.84, 0.26]];
      ctx.beginPath();
      trailPts.forEach(([x, y], i) => {
        const px = pad + x * chartW;
        const py = top + y * (bot - top);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.strokeStyle = 'rgba(167,139,250,0.5)'; ctx.lineWidth = 1.5; ctx.setLineDash([3, 2]); ctx.stroke();
      ctx.setLineDash([]);

      // Exit where trail catches price
      ctx.beginPath(); ctx.arc(pad + 0.90 * chartW, top + 0.24 * (bot - top), 4, 0, Math.PI * 2);
      ctx.fillStyle = '#a78bfa'; ctx.fill();
    }

    // Legend
    ctx.font = '8px system-ui'; ctx.textAlign = 'left';
    const legY = bot + 10;
    ctx.fillStyle = '#34d399'; ctx.fillText('● Fixed 1:2 — exits early, guaranteed R:R', pad, legY);
    ctx.fillStyle = '#f59e0b'; ctx.fillText('● Structural — exits at next key level', pad, legY + 12);
    ctx.fillStyle = '#a78bfa'; ctx.fillText('● Trailing — rides the trend, exits on pullback', pad, legY + 24);
  }, []);
  return <AnimScene drawFn={draw} height={340} />;
}

// ============================================================
// ANIMATION 2: R:R Impact on Profitability
// 3 columns showing different R:R with win rates and equity
// ============================================================
function RRImpactAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.015;
    const pad = 15;
    const top = 38;
    const bot = h - 40;
    const cols = 3;
    const colW = (w - pad * 2) / cols;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('How R:R Changes Everything (100 Trades, £100 Risk)', w / 2, 14);

    const scenarios = [
      { rr: '1:1', wr: 55, color: '#ef4444', winAmt: 100, lossAmt: 100 },
      { rr: '1:2', wr: 45, color: '#f59e0b', winAmt: 200, lossAmt: 100 },
      { rr: '1:3', wr: 38, color: '#34d399', winAmt: 300, lossAmt: 100 },
    ];

    scenarios.forEach((s, si) => {
      const cx = pad + colW * si + colW / 2;
      const left = pad + colW * si + 8;
      const right = pad + colW * (si + 1) - 8;
      const cw = right - left;

      if (si > 0) {
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.beginPath(); ctx.moveTo(pad + colW * si, top); ctx.lineTo(pad + colW * si, bot + 10); ctx.stroke();
      }

      // Header
      ctx.fillStyle = s.color; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'center';
      ctx.fillText(s.rr, cx, 30);

      // Win rate
      ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '9px system-ui';
      ctx.fillText(`${s.wr}% Win Rate`, cx, top + 8);

      // EV calculation
      const wins = s.wr;
      const losses = 100 - s.wr;
      const totalWin = wins * s.winAmt;
      const totalLoss = losses * s.lossAmt;
      const profit = totalWin - totalLoss;
      const ev = profit / 100;

      // Mini equity curve
      const eqTop = top + 20;
      const eqBot = bot - 25;
      const eqH = eqBot - eqTop;
      const seed = (n: number) => Math.sin(n * 127.1 + si * 311.7) * 0.5 + 0.5;

      ctx.beginPath();
      let bal = 0;
      let maxBal = 0;
      let minBal = 0;
      const bals: number[] = [];
      for (let i = 0; i < 40; i++) {
        const win = seed(i + si * 100) < s.wr / 100;
        bal += win ? s.winAmt : -s.lossAmt;
        maxBal = Math.max(maxBal, bal);
        minBal = Math.min(minBal, bal);
        bals.push(bal);
      }

      const range = Math.max(maxBal - minBal, 1);
      bals.forEach((b, i) => {
        const px = left + (i / 39) * cw;
        const py = eqBot - ((b - minBal) / range) * eqH;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.strokeStyle = s.color; ctx.lineWidth = 1.5; ctx.stroke();

      // Profit/loss
      ctx.fillStyle = profit > 0 ? '#34d399' : '#ef4444';
      ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
      ctx.fillText(profit > 0 ? `+£${profit.toLocaleString()}` : `-£${Math.abs(profit).toLocaleString()}`, cx, bot - 6);

      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '8px system-ui';
      ctx.fillText(`EV: ${ev > 0 ? '+' : ''}£${ev.toFixed(0)}/trade`, cx, bot + 6);
      ctx.fillText(`${wins}W × £${s.winAmt} − ${losses}L × £${s.lossAmt}`, cx, bot + 18);
    });
  }, []);
  return <AnimScene drawFn={draw} height={300} />;
}

// ============================================================
// DATA
// ============================================================
const targetMethods = [
  { icon: '📏', name: 'Fixed R:R', subtitle: 'Simple and mechanical', desc: 'Set your target at a fixed multiple of your risk. If your stop is 10 pips, TP at 1:2 = 20 pips, 1:3 = 30 pips. The target does not move regardless of what the market shows.', pros: 'Completely mechanical — removes emotion and decision-making from exits. Easy to backtest. Consistent data for reviewing strategy performance.', cons: 'Ignores market structure. Your 1:2 target might sit in the middle of nowhere while a supply OB is 5 pips below it. Sometimes exits too early (strong trend), sometimes too late (price reverses before reaching target).', when: 'Best for beginners building discipline. Best for scalping strategies where speed matters more than optimisation. Best for prop firm challenges where consistency is more important than maximising each trade.', partials: 'TP1 at 1:1 (close 50%, move SL to BE). TP2 at 1:2 (close remaining 50%). This locks profit early while giving the rest room.' },
  { icon: '🏗️', name: 'Structural Targets', subtitle: 'Let the market tell you where to exit', desc: 'Set your target at the next significant structural level: a supply OB (for longs), a liquidity pool (equal highs/lows), a previous swing high, or a major S/R level. The target is determined by market structure, not a fixed ratio.', pros: 'Targets match where price is actually likely to react. A supply OB is a real barrier — targeting just below it is logical. Often captures more profit than fixed R:R in trending conditions because structure targets adapt to the move.', cons: 'Requires more skill to identify correct levels. The "next structure" might only give you 1:0.8 R:R — sometimes the trade is not worth taking because the structural target is too close.', when: 'Best for experienced traders who can read structure. Best for Model 1 and Model 2 where the next OB, FVG, or liquidity pool is clearly visible. Best when combined with partial exits.', partials: 'TP1 at the nearest structure (even if only 1:1). TP2 at the next structure beyond (often 1:2-3). Trail remainder if the trend is strong.' },
  { icon: '🏃', name: 'Trailing Stop', subtitle: 'Ride the trend until it breaks', desc: 'No fixed target. Instead, trail your stop behind each new Higher Low (for longs) or Lower High (for shorts) as the trade progresses. You exit when the trend finally breaks your trailing stop.', pros: 'Captures the FULL move in trending markets. In a strong trend, a trailing stop can capture 1:5, 1:8, or even 1:10+ moves that fixed targets would miss. Maximum profit extraction.', cons: 'Gives back profit on every trade — the trailing stop only triggers when price pulls back. You never exit at the top. Can be psychologically difficult to watch unrealised profit decrease before the trail triggers.', when: 'Best for strong trending conditions (Model 1 in a healthy trend). Best after TP1 is hit and you have a "free" runner. Best on higher timeframes where trends develop over hours or days.', partials: 'TP1 at fixed 1:1 (secure base profit). Remainder trails behind structure. This is the ATLAS recommended approach for most trades.' },
];

const rrTable = [
  { rr: '1:1', wr50: '+0', wr45: '-10', wr55: '+10', wr40: '-20', verdict: 'Barely breakeven at 50% WR' },
  { rr: '1:1.5', wr50: '+25', wr45: '+2.5', wr55: '+47.5', wr40: '-20', verdict: 'Profitable at 45%+ WR' },
  { rr: '1:2', wr50: '+50', wr45: '+35', wr55: '+65', wr40: '+20', verdict: 'Profitable even at 40% WR' },
  { rr: '1:3', wr50: '+100', wr45: '+85', wr55: '+115', wr40: '+20', verdict: 'Strongly profitable at 38%+ WR' },
  { rr: '1:5', wr50: '+200', wr45: '+170', wr55: '+230', wr40: '+140', verdict: 'Extremely profitable — reversal territory' },
];

const gameRounds = [
  { scenario: 'You enter a Model 1 long on Gold at 2,340. Stop at 2,330 (10-pip risk). The next supply OB is at 2,358. The next liquidity pool (equal highs) is at 2,365. What target approach makes the most sense?', options: [
    { text: 'Fixed 1:2 at 2,360 (20 pips)', correct: false, explain: '2,360 is 2 pips above the supply OB at 2,358. Price will likely react at the OB before reaching your target. You would hold through the OB reaction hoping for 2 more pips — that is poor risk management.' },
    { text: 'Structural: TP1 just below the supply OB at 2,357. TP2 at the liquidity pool at 2,364. This respects where price will actually react.', correct: true, explain: 'Correct. TP1 at 2,357 gives you 1:1.7 R:R (17 pips) and exits BEFORE the supply OB reaction. TP2 at 2,364 targets the liquidity pool above the OB (1:2.4 R:R) for the runner after TP1. The targets are based on where the market will actually respond, not arbitrary multiples.' },
    { text: 'No target — just trail the stop', correct: false, explain: 'Trailing from the start with a 10-pip stop means any 10+ pip pullback kills the trade. You need to secure TP1 first, then trail the remainder. Pure trailing without partials is for higher timeframes.' },
    { text: 'Fixed 1:1 at 2,350 and close everything', correct: false, explain: '1:1 leaves significant profit on the table when the next structure is at 2,358. With a confirmed trend and clear structure above, closing at 1:1 is too conservative.' },
  ]},
  { scenario: 'A trader always closes his entire position at 1:2 R:R. Last month he had 12 trades that reached 1:2. But 5 of those trades continued to 1:4+ after he closed. He is frustrated about "leaving money on the table." What should he change?', options: [
    { text: 'Switch to 1:4 targets on all trades', correct: false, explain: 'Moving all targets to 1:4 means many trades that currently win at 1:2 will now be losers (price reverses between 1:2 and 1:4). His win rate will drop significantly.' },
    { text: 'Use partial exits: close 50-60% at 1:2 (keeping his proven target), trail the remaining 40-50% for potential 1:4+ runners', correct: true, explain: 'Correct. Partials solve the "leaving money on the table" problem without destroying win rate. He still secures profit on the majority at 1:2 (proven to work), but gives the remainder a chance to capture the bigger moves. Over 12 trades, 5 runners at 1:4+ on 40% of position adds significant profit.' },
    { text: 'Remove targets entirely and trail everything', correct: false, explain: 'Removing the 1:2 target that has been proven to work is throwing away a winning system. The partials approach keeps the working target AND adds the runner potential.' },
    { text: 'Add more trades to compensate for the missed profit', correct: false, explain: 'More trades means more risk, not better exits. The fix is optimising exits on existing trades, not increasing trade volume.' },
  ]},
  { scenario: 'EUR/USD 4H: you have a Model 2 reversal trade that has already hit TP1 (1:1). The remaining 50% is running with stop at breakeven. The trend looks strong. Price is approaching a Daily supply OB 80 pips above your entry. Should you close or trail?', options: [
    { text: 'Close at the Daily supply OB — structural target reached', correct: false, explain: 'The Daily supply OB is a valid concern, but closing the entire runner there might be premature. The OB might not hold — it depends on the strength of the move.' },
    { text: 'Trail the stop behind the most recent Higher Low. If the Daily OB holds, the trail will trigger. If it breaks through, you ride the continuation.', correct: true, explain: 'Correct. Trailing lets the MARKET decide whether the Daily OB holds. If price reverses at the OB, your trailing stop catches you in profit. If price breaks through the OB (which happens in strong reversals), you stay in for the extended move. You do not need to predict — you let price show you.' },
    { text: 'Close half at the Daily OB and trail the rest', correct: false, explain: 'You already took partials at TP1. Taking partials again on the runner leaves you with 25% of original size — barely meaningful. Let the full runner play out against the trail.' },
    { text: 'Move stop to TP1 level for safety', correct: false, explain: 'Your stop is already at breakeven. Moving it to TP1 level chokes the trade unnecessarily. Trail behind Higher Lows, not fixed levels.' },
  ]},
  { scenario: 'You find a Gold setup where your structure stop is 15 pips and the next structural target is only 12 pips above entry (R:R = 1:0.8). The setup is otherwise perfect — HTF bullish, BOS confirmed, OB, KZ active, engulfing trigger. Should you take it?', options: [
    { text: 'Yes — the setup is perfect, the target does not matter', correct: false, explain: 'The setup quality does not override bad R:R. At 1:0.8, you need a 56%+ win rate just to break even. Even perfect setups do not win 56% of the time consistently.' },
    { text: 'No — a 1:0.8 R:R trade is mathematically unprofitable unless your win rate is above 56%. Skip and wait for a setup where the next structure gives at least 1:1.5.', correct: true, explain: 'Correct. R:R is a component of your strategy, not an afterthought. A "perfect" setup with 1:0.8 R:R has negative expected value at typical win rates. The discipline to SKIP a beautiful setup because the R:R is wrong is what separates professionals from gamblers.' },
    { text: 'Take it with double position size to compensate', correct: false, explain: 'Doubling size on a bad R:R trade doubles the problem, not the solution. You are now risking 2% on a trade with negative expected value.' },
    { text: 'Use a tighter stop to force better R:R', correct: false, explain: 'A tighter stop means placing it inside or at the OB instead of below it — that is not a valid structure stop. You cannot "force" R:R by compromising stop placement.' },
  ]},
  { scenario: 'A trader has been using 1:3 fixed targets for 3 months. His win rate is 32%. He is discouraged because he "barely wins." Is his strategy working?', options: [
    { text: 'No — 32% win rate is terrible, he should quit', correct: false, explain: 'Win rate alone means nothing. Check the maths before making conclusions.' },
    { text: 'Yes — EV = (0.32 × 3R) − (0.68 × 1R) = +0.28R per trade. He is profitable. The low win rate is expected with high R:R targets.', correct: true, explain: 'Correct. 0.32 × 3 = 0.96R won. 0.68 × 1 = 0.68R lost. Net = +0.28R per trade. If he risks £100 per trade and takes 100 trades, that is +£2,800 profit. His "problem" is psychological — the losing streaks FEEL bad even though the maths is positive. He needs to trust the expected value, not his feelings.' },
    { text: 'He should lower his target to 1:1.5 to increase win rate', correct: false, explain: 'Lowering from 1:3 to 1:1.5 would increase win rate but roughly halve his average winner. The EV might stay similar or even decrease. Without backtesting both, this is a lateral move, not an improvement.' },
    { text: 'He should increase to 1:5 to make even more per winner', correct: false, explain: 'Increasing to 1:5 would drop his win rate further, possibly below the breakeven threshold. 1:3 at 32% already works — changing it without data is gambling with a working system.' },
  ]},
];

const quizQuestions = [
  { q: 'What is the main advantage of structural targets over fixed R:R targets?', opts: ['They are always wider', 'They place your exit where price is actually likely to react (OBs, liquidity pools, S/R levels)', 'They guarantee higher profit', 'They are easier to calculate'], correct: 1, explain: 'Structural targets respect market reality. A supply OB, a liquidity pool, or a swing high is where price WILL react. A fixed 1:2 target might land in the middle of nowhere — or right inside an opposing zone where the trade reverses.' },
  { q: 'A trade has a 10-pip stop. The next structural target is 8 pips away (R:R = 1:0.8). What should you do?', opts: ['Take the trade — the setup is good', 'Skip the trade — 1:0.8 R:R is mathematically unprofitable at typical win rates', 'Widen the target to force 1:2', 'Tighten the stop to 5 pips'], correct: 1, explain: 'At 1:0.8 R:R, you need 56%+ win rate to break even. Most strategies run 45-55%. A beautiful setup with bad R:R is still a bad trade. The discipline to skip is the edge.' },
  { q: 'What is the recommended partial exit strategy for most ATLAS trades?', opts: ['Close everything at 1:1', 'Close 50% at TP1 (1:1), move stop to breakeven, trail the remaining 50%', 'Never take partials — all or nothing', 'Close 90% at 1:1 and leave 10% running'], correct: 1, explain: 'TP1 at 1:1 secures base profit (50% of position). Moving to breakeven removes risk on the remainder. Trailing the 50% runner captures additional profit if the trend continues. This balances security with opportunity.' },
  { q: 'A trader with 1:3 targets has a 32% win rate. What is his EV per £100 risked?', opts: ['-£36 (losing)', '+£28 per trade (profitable)', 'Breakeven', '+£96 per trade'], correct: 1, explain: 'EV = (0.32 × £300) − (0.68 × £100) = £96 − £68 = +£28 per trade. A 32% win rate with 1:3 R:R is solidly profitable. The low win rate is the EXPECTED tradeoff for high R:R targets.' },
  { q: 'When is trailing WITHOUT partials appropriate?', opts: ['Always — trailing is the best exit method', 'On higher timeframes (4H/Daily) in strong trends, after TP1 has already been secured on an earlier portion', 'Never — always use fixed targets', 'Only on cryptocurrency'], correct: 1, explain: 'Pure trailing (no partials) is risky because any pullback triggers the trail. It works best on higher timeframes where swings are larger and the trail has room. And it should be applied to a RUNNER after TP1, not the full position from the start.' },
  { q: 'Your Gold trade hits 1:1 (+10 pips). The trend looks strong. What is the correct management?', opts: ['Close everything — profit is profit', 'Close 50%, move stop to breakeven, let the rest run toward TP2 or trail', 'Do nothing — keep the full position and the original stop', 'Add more position because the trend is strong'], correct: 1, explain: 'At 1:1, close half (lock in profit), move stop to breakeven (eliminate risk), and let the other half target TP2 or trail. This is the optimal balance — you bank guaranteed profit while maintaining upside.' },
  { q: 'Why does increasing R:R from 1:1 to 1:2 allow a LOWER win rate to remain profitable?', opts: ['Because 1:2 trades always win', 'Because each winner now covers two losses — so you can lose more often and still come out ahead', 'Because the market favours 1:2 trades', 'It does not — higher R:R always lowers profit'], correct: 1, explain: 'At 1:1, each win covers exactly one loss (need 50%+ WR). At 1:2, each win covers TWO losses (need only 34%+ WR). At 1:3, each win covers THREE losses (need only 25%+ WR). Higher R:R means each winner does more work, compensating for more frequent losses.' },
  { q: 'What is the minimum R:R you should accept for a trade?', opts: ['1:0.5 — any profit is good', '1:1 — equal risk and reward', '1:1.5 minimum — your winners must be meaningfully larger than your losses to maintain a positive edge', '1:5 — anything less is not worth the risk'], correct: 2, explain: 'At 1:1, you need 50%+ WR just to break even (before commissions). At 1:1.5, you need 40%+ which is achievable. Below 1:1.5, the maths works against you. Above 1:1.5, the maths works for you. The minimum threshold is where maths starts being your friend.' },
];

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

function Confetti({ active }: { active: boolean }) {
  if (!active) return null;
  return (<div className="fixed inset-0 pointer-events-none z-50">{Array.from({ length: 60 }).map((_, i) => (<motion.div key={i} initial={{ y: -20, x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400), opacity: 1 }} animate={{ y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 20, rotate: Math.random() * 720, opacity: 0 }} transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5 }} className="absolute w-2 h-2 rounded-sm" style={{ background: ['#f59e0b', '#d946ef', '#34d399', '#3b82f6', '#ef4444'][i % 5] }} />))}</div>);
}

export default function TargetSelectionLesson() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);

  const [openMethod, setOpenMethod] = useState<number | null>(null);

  // Interactive — R:R Expectancy Calculator
  const [calcWR, setCalcWR] = useState('50');
  const [calcRR, setCalcRR] = useState('2');
  const [calcRisk, setCalcRisk] = useState('100');
  const [calcTrades, setCalcTrades] = useState('100');
  const wr = parseFloat(calcWR) / 100 || 0;
  const rr = parseFloat(calcRR) || 0;
  const risk = parseFloat(calcRisk) || 0;
  const trades = parseInt(calcTrades) || 0;
  const ev = (wr * rr * risk) - ((1 - wr) * risk);
  const totalProfit = ev * trades;
  const beWR = rr > 0 ? (1 / (1 + rr)) * 100 : 0;

  // Mistakes
  const [openMistake, setOpenMistake] = useState<number | null>(null);
  const mistakes = [
    { title: 'Closing the entire position at 1:1', desc: 'At 1:1, you need 50%+ win rate AFTER commissions to be profitable. Most strategies run 45-55% before commissions. Closing everything at 1:1 means your strategy has almost no mathematical edge. Use 1:1 for PARTIALS (close 50%), not for the full exit.' },
    { title: 'Ignoring R:R before entering', desc: 'Many traders find a beautiful setup, enter, then look at where the target should be and discover it is only 1:0.8. R:R should be calculated BEFORE entry, not after. If the maths does not work, the trade does not happen — no matter how pretty the setup looks.' },
    { title: 'Moving targets closer during the trade', desc: 'Fear causes traders to shrink their targets mid-trade. They set 1:2 but close at 1:0.7 because price paused. This turns a positive-expectancy system into a negative one. Your target was set for a reason. Let it play out or get stopped — do not micromanage.' },
    { title: 'Using the same R:R for every market condition', desc: '1:2 works in trending markets but not in ranges (price chops before reaching target). In ranging conditions, structural targets near range boundaries work better. Your target method should adapt to the market regime, just like your stop method adapts to volatility.' },
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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 6 &middot; Lesson 7</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Target Selection<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>&amp; Risk:Reward</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">Know where you are going before you enter. Your target method determines your win rate, your expectancy, and your psychology.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* S00 */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">🔍 The Destination Before the Journey</p>
            <p className="text-gray-400 leading-relaxed mb-4">You would never start driving without knowing your destination. Yet most traders enter trades without knowing where they will exit. They &ldquo;see how it goes.&rdquo; That is the trading equivalent of driving randomly and hoping you end up somewhere good.</p>
            <p className="text-gray-400 leading-relaxed">Your target is half of the R:R equation. Together with your stop (Lesson 6.6), it determines your expected value per trade. Get both right and you have a mathematical edge. Get either one wrong and you are gambling with a spreadsheet.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">A trader had a <strong className="text-red-400">45% win rate</strong> with 1:1 targets and was losing money. He switched to <strong className="text-green-400">1:2 targets with partials</strong> — same setups, same entries, same stops. His win rate dropped to 38% but his account grew <strong className="text-green-400">+£4,200 in 3 months</strong>. The maths: (0.38 &times; £200) &minus; (0.62 &times; £100) = +£14/trade. R:R turned a loser into a winner.</p>
          </div>
        </motion.div>
      </section>

      {/* S01 — Target Methods Animation */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; 3 Target Methods</p>
          <h2 className="text-2xl font-extrabold mb-4">Same Entry, Different Exits</h2>
          <p className="text-gray-400 text-sm mb-6">Watch the same trade exit at three different points depending on the method. Fixed R:R exits first. Structural exits at the key level. Trailing rides the full trend.</p>
          <TargetMethodsAnimation />
        </motion.div>
      </section>

      {/* S02 — R:R Impact Animation */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; R:R Changes Everything</p>
          <h2 className="text-2xl font-extrabold mb-4">The Maths of Winning</h2>
          <p className="text-gray-400 text-sm mb-6">Three traders: same number of trades, same risk. Different R:R. Watch how the equity curves diverge.</p>
          <RRImpactAnimation />
        </motion.div>
      </section>

      {/* S03 — Method Profiles */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; Method Profiles</p>
          <h2 className="text-2xl font-extrabold mb-4">Each Method in Detail</h2>
          <div className="space-y-3">
            {targetMethods.map((m, i) => (
              <div key={i}>
                <button onClick={() => setOpenMethod(openMethod === i ? null : i)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <div className="flex items-center gap-3"><span className="text-xl">{m.icon}</span><div><p className="text-sm font-extrabold text-white">{m.name}</p><p className="text-xs text-gray-500">{m.subtitle}</p></div></div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openMethod === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openMethod === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05] space-y-3">
                      <p className="text-sm text-gray-400 leading-relaxed">{m.desc}</p>
                      <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10"><p className="text-xs text-green-400">✓ <strong>Pros:</strong> {m.pros}</p></div>
                      <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10"><p className="text-xs text-red-400">✗ <strong>Cons:</strong> {m.cons}</p></div>
                      <div className="p-3 rounded-lg bg-sky-500/5 border border-sky-500/10"><p className="text-xs text-sky-400">🕐 <strong>When:</strong> {m.when}</p></div>
                      <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10"><p className="text-xs text-amber-400">📐 <strong>Partials:</strong> {m.partials}</p></div>
                    </div>
                  </motion.div>
                )}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S04 — R:R Expectancy Table */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The R:R Table</p>
          <h2 className="text-2xl font-extrabold mb-4">Expected Profit per 100 Trades (£100 risk)</h2>
          <div className="p-4 rounded-2xl glass-card overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="text-gray-500 border-b border-white/[0.06]">
                <th className="text-left py-2 pr-2">R:R</th><th className="text-center py-2 pr-2">40% WR</th><th className="text-center py-2 pr-2">45% WR</th><th className="text-center py-2 pr-2">50% WR</th><th className="text-center py-2 pr-2">55% WR</th><th className="text-left py-2">Verdict</th>
              </tr></thead>
              <tbody className="text-gray-400">
                {rrTable.map((r, i) => (
                  <tr key={i} className="border-b border-white/[0.03]">
                    <td className="py-2 pr-2 font-semibold text-white">{r.rr}</td>
                    <td className={`text-center pr-2 ${r.wr40.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>£{r.wr40}</td>
                    <td className={`text-center pr-2 ${r.wr45.startsWith('+') ? 'text-green-400' : r.wr45.startsWith('-') ? 'text-red-400' : 'text-gray-400'}`}>£{r.wr45}</td>
                    <td className={`text-center pr-2 ${r.wr50.startsWith('+') ? 'text-green-400' : 'text-gray-400'}`}>£{r.wr50}</td>
                    <td className={`text-center pr-2 text-green-400`}>£{r.wr55}</td>
                    <td className="py-2 text-gray-500">{r.verdict}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-4 rounded-xl bg-sky-500/5 border border-sky-500/15">
            <p className="text-sm text-gray-400 leading-relaxed">💡 <strong className="text-sky-400">Key insight:</strong> At 1:2 R:R, even a 40% win rate is profitable (+£20 per 100 trades). At 1:1, you need 50%+ just to break even. The higher your R:R, the less your win rate matters. This is why target selection is at least as important as entry selection.</p>
          </div>
        </motion.div>
      </section>

      {/* S05 — Interactive R:R Expectancy Calculator */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Expectancy Calculator</p>
          <h2 className="text-2xl font-extrabold mb-2">Test Any Combination</h2>
          <p className="text-gray-400 text-sm mb-6">Enter your win rate, R:R, risk per trade, and number of trades to see your expected outcome.</p>
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-xs text-gray-500 mb-1">Win Rate (%)</p><input type="number" value={calcWR} onChange={e => setCalcWR(e.target.value)} className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:border-amber-500/30 outline-none" /></div>
              <div><p className="text-xs text-gray-500 mb-1">R:R (e.g. 2 = 1:2)</p><input type="number" value={calcRR} onChange={e => setCalcRR(e.target.value)} className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:border-amber-500/30 outline-none" /></div>
              <div><p className="text-xs text-gray-500 mb-1">Risk per Trade (£)</p><input type="number" value={calcRisk} onChange={e => setCalcRisk(e.target.value)} className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:border-amber-500/30 outline-none" /></div>
              <div><p className="text-xs text-gray-500 mb-1">Number of Trades</p><input type="number" value={calcTrades} onChange={e => setCalcTrades(e.target.value)} className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:border-amber-500/30 outline-none" /></div>
            </div>
            <div className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/15">
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="p-3 rounded-lg bg-white/[0.03] text-center"><p className="text-[10px] text-gray-500 uppercase">EV / Trade</p><p className={`text-sm font-bold ${ev >= 0 ? 'text-green-400' : 'text-red-400'}`}>{ev >= 0 ? '+' : ''}£{ev.toFixed(0)}</p></div>
                <div className="p-3 rounded-lg bg-white/[0.03] text-center"><p className="text-[10px] text-gray-500 uppercase">Total ({trades} trades)</p><p className={`text-sm font-bold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{totalProfit >= 0 ? '+' : ''}£{totalProfit.toFixed(0)}</p></div>
                <div className="p-3 rounded-lg bg-white/[0.03] text-center"><p className="text-[10px] text-gray-500 uppercase">Breakeven WR</p><p className="text-sm font-bold text-amber-400">{beWR.toFixed(0)}%</p></div>
              </div>
              <p className="text-xs text-gray-400 text-center">{ev > 0 ? `Your strategy is profitable. Each trade earns £${ev.toFixed(0)} on average.` : ev === 0 ? 'Breakeven — you need either higher WR or higher R:R to profit.' : `Your strategy is losing £${Math.abs(ev).toFixed(0)} per trade. Increase R:R or improve WR.`}</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S06 — Partials Deep Dive */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; The Partials Strategy</p>
          <h2 className="text-2xl font-extrabold mb-4">ATLAS Recommended Exit Plan</h2>
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <p className="text-gray-400 leading-relaxed">The ATLAS standard for most trades combines the safety of fixed targets with the upside of trailing:</p>
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/15">
                <p className="text-sm font-extrabold text-green-400 mb-2">Step 1 — TP1 at 1:1 R:R (close 50%)</p>
                <p className="text-xs text-gray-400">Secures base profit. Covers the risk of the remaining portion. Psychological relief — you CANNOT lose money on this trade now.</p>
              </div>
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
                <p className="text-sm font-extrabold text-amber-400 mb-2">Step 2 — Move stop to breakeven</p>
                <p className="text-xs text-gray-400">The remaining 50% is now a FREE trade. Zero risk. Any additional profit is bonus money. This is where patience gets rewarded.</p>
              </div>
              <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/15">
                <p className="text-sm font-extrabold text-purple-400 mb-2">Step 3 — TP2 at structure or trail</p>
                <p className="text-xs text-gray-400">Target the next structural level (supply OB, liquidity pool). OR trail behind Higher Lows. If the trend is strong, trailing captures 1:3, 1:5, or more.</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-sky-500/5 border border-sky-500/15">
              <p className="text-sm text-gray-400 leading-relaxed">💡 <strong className="text-sky-400">Why this works psychologically:</strong> TP1 at 1:1 gives you a &ldquo;win&rdquo; quickly. This satisfies the need for certainty. The runner at breakeven satisfies the need for possibility. You never feel like you left too much on the table OR took too little.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S07 — When R:R Lies */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; When R:R Lies</p>
          <h2 className="text-2xl font-extrabold mb-4">Targets Must Be Realistic</h2>
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <p className="text-gray-400 leading-relaxed">A 1:5 R:R looks amazing on paper, but if your target sits beyond a major resistance level, the market may never reach it. R:R only works if the target is achievable.</p>
            <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15"><p className="text-sm text-gray-400"><strong className="text-red-400">Fake R:R:</strong> 5-pip stop, 50-pip target (1:10!) but price must pass through 3 supply OBs, a daily resistance, and a round number. The target is fantasy.</p></div>
            <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/15"><p className="text-sm text-gray-400"><strong className="text-green-400">Real R:R:</strong> 10-pip stop, 20-pip target (1:2) with clear space to the next supply OB. No obstacles between entry and target. The target is realistic.</p></div>
            <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/15">
              <p className="text-sm text-gray-400 leading-relaxed">💡 <strong className="text-purple-400">The Motorway Analogy:</strong> A 1:5 R:R with 3 obstacles is like saying you can drive 500 miles in 5 hours — but there are 3 roadblocks on the route. The distance is real, but the obstacles mean you will never get there in time. Target the next clear stretch, not the horizon.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S08 — Common Mistakes */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-6">4 Target Killers</h2>
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
          <h2 className="text-2xl font-extrabold mb-4">Target Quick Reference</h2>
          <div className="p-6 rounded-2xl glass-card space-y-3">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-green-400">MINIMUM R:R</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">1:1.5. Below this, the maths works against you.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">PARTIALS</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">TP1 at 1:1 (50%) → BE → TP2 at structure or trail (50%). The ATLAS standard.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-sky-400">STRUCTURAL</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Target just below the next supply OB, liquidity pool, or swing high. Respect where price reacts.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-purple-400">TRAILING</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">For runners after TP1. Trail behind HLs (longs) or LHs (shorts). Let the market decide the exit.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-red-400">SKIP</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">If the next structure only gives 1:0.8 R:R, skip. Beautiful setup + bad R:R = bad trade.</span></p></div>
          </div>
        </motion.div>
      </section>

      {/* S10 — Game */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Test Your Understanding</p>
          <h2 className="text-2xl font-extrabold mb-2">Target Selection Game</h2>
          <p className="text-gray-400 text-sm mb-6">5 scenarios. Choose the right exit strategy.</p>
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
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Excellent — you understand how targets and R:R drive profitability.' : gameScore >= 3 ? 'Solid — review the partials strategy and the R:R table.' : 'Re-read the 3 methods and the expectancy section, then try again.'}</p></motion.div>)}
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
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-cyan-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">🎯</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 6: Target Selection &amp; R:R</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-cyan-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Target Architect &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L6.7-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
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
