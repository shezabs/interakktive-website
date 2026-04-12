// app/academy/lesson/trade-management/page.tsx
// ATLAS Academy — Lesson 6.8: Trade Management [PRO]
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
// ANIMATION 1: Trade Lifecycle — entry → partials → BE → trail → exit
// Shows the full management timeline with annotations
// ============================================================
function TradeLifecycleAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.005;
    const pad = 25;
    const top = 42;
    const bot = h - 30;
    const chartW = w - pad * 2;
    const progress = Math.min(1, (t % 4.5) / 4);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Trade Management Lifecycle — Every Decision Mapped', w / 2, 14);

    const pts = [
      [0.02, 0.62], [0.06, 0.58],
      [0.10, 0.55], // ENTRY
      [0.16, 0.48], [0.20, 0.52], [0.24, 0.42], // move to TP1
      [0.28, 0.44], // TP1 HIT
      [0.34, 0.48], [0.38, 0.46], // pullback after TP1
      [0.42, 0.38], [0.48, 0.42], // HL1 forms
      [0.54, 0.30], [0.58, 0.34], // HL2 forms
      [0.64, 0.24], [0.68, 0.28], // HL3 forms
      [0.74, 0.20], [0.78, 0.25], // push
      [0.82, 0.30], [0.86, 0.34], // trail catches
      [0.92, 0.32],
    ];

    const visCount = Math.floor(progress * pts.length);
    const entryY = 0.55;
    const stopY = 0.68;
    const tp1Y = 0.42; // 1:1

    // Price line
    ctx.beginPath();
    for (let i = 0; i <= visCount && i < pts.length; i++) {
      const px = pad + pts[i][0] * chartW;
      const py = top + pts[i][1] * (bot - top);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = '#34d399'; ctx.lineWidth = 2; ctx.stroke();

    // Entry level
    const eY = top + entryY * (bot - top);
    ctx.setLineDash([3, 3]); ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad + 0.08 * chartW, eY); ctx.lineTo(pad + 0.40 * chartW, eY); ctx.stroke();
    ctx.setLineDash([]);

    // Phase 1: Original stop
    const origSL = top + stopY * (bot - top);
    if (visCount >= 2) {
      ctx.strokeStyle = 'rgba(239,68,68,0.4)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(pad + 0.10 * chartW, origSL);
      ctx.lineTo(pad + (visCount >= 7 ? 0.28 : pts[Math.min(visCount, 6)][0]) * chartW, origSL);
      ctx.stroke();
      ctx.fillStyle = 'rgba(239,68,68,0.5)'; ctx.font = '7px system-ui'; ctx.textAlign = 'left';
      ctx.fillText('Original SL', pad + 0.10 * chartW, origSL + 10);
    }

    // ENTRY marker
    if (visCount >= 2) {
      ctx.fillStyle = '#f59e0b'; ctx.font = 'bold 8px system-ui'; ctx.textAlign = 'center';
      const ex = pad + 0.10 * chartW;
      ctx.fillText('▲ ENTRY', ex, eY + 16);
    }

    // TP1 level
    const t1Y = top + tp1Y * (bot - top);
    if (visCount >= 5) {
      ctx.setLineDash([3, 3]); ctx.strokeStyle = 'rgba(52,211,153,0.3)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(pad + 0.18 * chartW, t1Y); ctx.lineTo(pad + 0.35 * chartW, t1Y); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(52,211,153,0.5)'; ctx.font = '7px system-ui'; ctx.textAlign = 'right';
      ctx.fillText('TP1 (1:1)', pad + 0.34 * chartW, t1Y - 4);
    }

    // Phase 2: TP1 hit → close 50% → move to BE
    if (visCount >= 7) {
      const tp1X = pad + 0.28 * chartW;
      ctx.fillStyle = '#34d399'; ctx.font = 'bold 8px system-ui'; ctx.textAlign = 'center';
      ctx.fillText('✓ TP1 — Close 50%', tp1X, t1Y - 12);

      // BE stop line (replaces original)
      ctx.strokeStyle = 'rgba(245,158,11,0.5)'; ctx.lineWidth = 1.5;
      const beEndX = visCount >= 11 ? 0.48 : pts[Math.min(visCount, 10)][0];
      ctx.beginPath(); ctx.moveTo(pad + 0.28 * chartW, eY); ctx.lineTo(pad + beEndX * chartW, eY); ctx.stroke();
      ctx.fillStyle = 'rgba(245,158,11,0.5)'; ctx.font = '7px system-ui'; ctx.textAlign = 'left';
      ctx.fillText('SL → Breakeven', pad + 0.29 * chartW, eY + 10);
    }

    // Phase 3: Trailing behind HLs
    if (visCount >= 11) {
      const trailPts = [[0.48, 0.42], [0.58, 0.34], [0.68, 0.28]];
      const trailEnd = Math.min(Math.floor((visCount - 11) / 2), trailPts.length - 1);

      ctx.strokeStyle = 'rgba(167,139,250,0.5)'; ctx.lineWidth = 1.5;
      for (let i = 0; i <= trailEnd; i++) {
        const startX = i === 0 ? 0.48 : trailPts[i - 1][0];
        const px1 = pad + startX * chartW;
        const px2 = pad + trailPts[i][0] * chartW;
        const py = top + trailPts[i][1] * (bot - top);
        ctx.beginPath(); ctx.moveTo(px1, py); ctx.lineTo(px2, py); ctx.stroke();

        ctx.fillStyle = 'rgba(167,139,250,0.4)'; ctx.font = '6px system-ui'; ctx.textAlign = 'left';
        ctx.fillText(`Trail HL${i + 1}`, px1 + 2, py + 9);
      }
    }

    // Phase 4: Trail exit
    if (visCount >= 18) {
      const exitX = pad + 0.82 * chartW;
      const exitY = top + 0.28 * (bot - top);
      ctx.fillStyle = '#a78bfa'; ctx.font = 'bold 8px system-ui'; ctx.textAlign = 'center';
      ctx.fillText('✓ Trail Exit — 1:2.8 R:R', exitX, exitY + 18);
    }

    // Phase labels at bottom
    ctx.font = '8px system-ui'; ctx.textAlign = 'center';
    const phases = [
      { x: 0.15, label: 'HOLD', color: 'rgba(255,255,255,0.2)' },
      { x: 0.28, label: 'PARTIAL', color: 'rgba(52,211,153,0.4)' },
      { x: 0.38, label: 'BE', color: 'rgba(245,158,11,0.4)' },
      { x: 0.58, label: 'TRAIL', color: 'rgba(167,139,250,0.4)' },
      { x: 0.82, label: 'EXIT', color: 'rgba(167,139,250,0.5)' },
    ];
    phases.forEach(p => {
      if (pad + p.x * chartW < pad + pts[Math.min(visCount, pts.length - 1)][0] * chartW + 20) {
        ctx.fillStyle = p.color;
        ctx.fillText(p.label, pad + p.x * chartW, bot + 14);
      }
    });
  }, []);
  return <AnimScene drawFn={draw} height={320} />;
}

// ============================================================
// ANIMATION 2: 3 Management Styles comparison
// Hands-off vs Active vs Over-managed — equity outcomes
// ============================================================
function ManagementStylesAnimation() {
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
    ctx.fillText('3 Management Styles — Same 50 Trades', w / 2, 14);

    const styles = [
      { name: 'Under-Managed', desc: 'No partials, no trailing. Set and forget.', color: '#ef4444', note: 'Wins big or loses big. Volatile equity.' },
      { name: 'ATLAS Standard', desc: 'TP1 partials → BE → Trail runners.', color: '#34d399', note: 'Consistent growth. Smooth equity.' },
      { name: 'Over-Managed', desc: 'Moves BE at +3 pips. Closes at +5 pips fear.', color: '#f59e0b', note: 'Lots of small wins. Never captures big moves.' },
    ];

    const seed = (n: number) => Math.sin(n * 127.1 + 311.7) * 0.5 + 0.5;

    styles.forEach((s, si) => {
      const cx = pad + colW * si + colW / 2;
      const left = pad + colW * si + 8;
      const right = pad + colW * (si + 1) - 8;
      const cw = right - left;

      if (si > 0) {
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.beginPath(); ctx.moveTo(pad + colW * si, top); ctx.lineTo(pad + colW * si, bot); ctx.stroke();
      }

      ctx.fillStyle = s.color; ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center';
      ctx.fillText(s.name, cx, 30);

      // Equity curve
      ctx.beginPath();
      let bal = 0;
      let maxB = 0, minB = 0;
      const bals: number[] = [];
      for (let i = 0; i < 50; i++) {
        const win = seed(i + si * 200) < 0.50;
        if (si === 0) bal += win ? 200 : -100; // set and forget: big wins, full losses
        else if (si === 1) bal += win ? 150 : -60; // ATLAS: partials secure + runners add
        else bal += win ? 50 : -40; // over-managed: tiny wins, normal losses
        maxB = Math.max(maxB, bal); minB = Math.min(minB, bal);
        bals.push(bal);
      }

      const range = Math.max(maxB - minB, 1);
      const eqTop = top + 12;
      const eqBot = bot - 28;
      bals.forEach((b, i) => {
        const px = left + (i / 49) * cw;
        const py = eqBot - ((b - minB) / range) * (eqBot - eqTop);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.strokeStyle = s.color; ctx.lineWidth = 1.5; ctx.stroke();

      // Final P&L
      const final = bals[bals.length - 1];
      ctx.fillStyle = final >= 0 ? '#34d399' : '#ef4444';
      ctx.font = 'bold 11px system-ui';
      ctx.fillText(final >= 0 ? `+£${final}` : `-£${Math.abs(final)}`, cx, bot - 8);

      ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.font = '7px system-ui';
      ctx.fillText(s.note, cx, bot + 6);
      ctx.fillText(s.desc, cx, bot + 16);
    });
  }, []);
  return <AnimScene drawFn={draw} height={290} />;
}

// ============================================================
// DATA
// ============================================================
const managementPhases = [
  { icon: '⏳', phase: 'Phase 1: Entry to TP1', title: 'Hold and Monitor', rules: ['Stop stays at original structure level — do NOT move it.', 'Do not add to the position.', 'Do not close early unless an anti-trigger appears (bearish engulfing at resistance for longs).', 'Monitor for news events that could invalidate the setup.'], tip: 'This is the hardest phase psychologically. Every pullback feels like the trade is failing. Trust the structure. If the OB holds, the pullback is normal.' },
  { icon: '✂️', phase: 'Phase 2: TP1 Hit', title: 'Secure and Reset', rules: ['Close 50% of position at TP1 (1:1 R:R).', 'Move stop to breakeven on remaining 50%.', 'You now have a RISK-FREE position. Any further profit is bonus.', 'Set your TP2 at the next structural level or switch to trailing.'], tip: 'TP1 is not a celebration — it is a management action. Close, move stop, set TP2. Three actions in 10 seconds. Practice until it is muscle memory.' },
  { icon: '🏃', phase: 'Phase 3: Runner Management', title: 'Trail and Let Go', rules: ['Trail stop behind each new Higher Low (longs) or Lower High (shorts).', 'Do NOT trail behind every candle — only behind STRUCTURAL swing points.', 'If price reaches TP2 (structural target), close the remaining position.', 'If trailing, let the market decide the exit — do not close because you are "up enough."'], tip: 'The runner is where the real money is made. A trade that goes from 1:1 to 1:3 on the runner turns an average trade into a great one. The trailing stop catches you automatically — no decision needed.' },
  { icon: '🚪', phase: 'Phase 4: Exit', title: 'Accept and Record', rules: ['When your TP2 or trailing stop is hit, the trade is over.', 'Record: entry, stop, TP1, TP2/trail exit, R:R achieved, notes on what happened.', 'Do NOT re-enter immediately in the same direction.', 'Wait for a new setup on a new candle/session.'], tip: 'The journal entry after the trade is as important as the trade itself. What did you learn? Did you follow every management rule? If yes, the trade was successful regardless of P&L.' },
];

const scenarioDecisions = [
  { title: 'Price stalls at TP1 zone but does not quite reach it', action: 'If price is within 2-3 pips of TP1 and showing a rejection candle, close the partial. The 2-3 pips are not worth risking the entire move reversing. "Close enough" at TP1 is acceptable because the primary purpose of TP1 is securing profit.', color: 'amber' },
  { title: 'Price gaps through TP1 on a news candle', action: 'If price blows through TP1 on strong momentum, close 50% at market (even if the fill is better than TP1). Move to BE immediately. Do not get greedy because the gap was big — the management plan does not change based on the size of the candle.', color: 'green' },
  { title: 'Price hits TP1, you forget to move to BE, and it pulls back to entry', action: 'Close the runner at breakeven. You missed the management step. The trade is now neutral on the runner. Do not hold and hope — the management failure means you lost your trail opportunity. Record this as a management error, not a market error.', color: 'red' },
  { title: 'Runner is at +1:2 R:R and a major news event is in 30 minutes', action: 'Close the runner before the news event. Unrealised profit is at risk from unpredictable volatility. A news candle can wipe 1:2 profit in seconds. Locking in 1:2 on the runner + 1:1 on the partial = excellent total trade.', color: 'amber' },
  { title: 'Runner trailing stop is at 1:1.5 and price is at 1:2.8 — should you tighten the trail?', action: 'Only tighten if a new HL has formed closer. Moving the trail to an arbitrary level (like 1:2) is emotional, not structural. The trail follows structure, period. If no new HL has formed, the trail stays at 1:1.5.', color: 'sky' },
];

const gameRounds = [
  { scenario: 'Gold 15M: you entered long at 2,340. Stop at 2,330. TP1 at 2,350. Price has moved to 2,347 (+7 pips, close to TP1). A long upper wick candle forms at 2,348 — showing rejection. TP1 is 2 pips away. What do you do?', options: [
    { text: 'Hold for the full TP1 at 2,350 — 2 pips away is not there yet', correct: false, explain: 'The rejection wick at 2,348 suggests sellers are active near TP1. Holding for 2 more pips risks the entire move reversing. When price is within 2-3 pips of TP1 and showing rejection, "close enough" applies.' },
    { text: 'Close 50% at 2,347 (close enough to TP1 given the rejection), move stop to breakeven', correct: true, explain: 'Correct. TP1 is about securing profit, not hitting an exact number. A rejection wick 2 pips short of TP1 is the market telling you this is the high for now. Close 50%, move to BE, and let the runner work. The 2-pip difference is irrelevant compared to the risk of reversal.' },
    { text: 'Close everything — the rejection means the trade is over', correct: false, explain: 'One rejection wick near TP1 does not mean the trade is over. It means the FIRST target area is being tested. Close the partial but keep the runner — the overall trend may still be strong.' },
    { text: 'Move stop to +5 pips profit to protect gains', correct: false, explain: '+5 pips has no structural meaning. Your stop should be at breakeven (your entry level) or behind a structural HL. Arbitrary profit-protection stops get hit by normal noise.' },
  ]},
  { scenario: 'EUR/USD 1H: TP1 has been hit. You moved to breakeven. The runner is currently at +1:1.8 R:R. A new Higher Low has formed at +1:1.2 level. Where should your trailing stop be?', options: [
    { text: 'Keep it at breakeven — it is the safest option', correct: false, explain: 'Breakeven was correct IMMEDIATELY after TP1. But a new HL has formed at +1:1.2. Keeping the trail at BE means you could give back 1:1.2 of profit on a normal pullback. Trail behind the new HL.' },
    { text: 'Move the trail to just below the new HL at +1:1.2 — this is the structural trailing method', correct: true, explain: 'Correct. The trailing stop follows Higher Lows, not arbitrary levels. A HL at +1:1.2 means the trend has made a structural floor there. If price breaks below it, the trend on this timeframe has weakened. Trailing to +1:1 (just below the HL) locks in 1:1 profit on the runner while giving it room to continue.' },
    { text: 'Move the trail to +1:1.5 — halfway between HL and current price', correct: false, explain: '+1:1.5 has no structural meaning. The trail follows structure (HLs), not mathematical midpoints. If price pulls back to +1:3 before making a new HL, a +1:1.5 trail would choke the trade for no structural reason.' },
    { text: 'Close at +1:1.8 — that is enough profit', correct: false, explain: '"Enough profit" is an emotional decision, not a management rule. The trend is still making HLs. The trailing stop catches you IF the trend breaks. Let the system work.' },
  ]},
  { scenario: 'NASDAQ 15M: you have a runner at +1:2.5 R:R. Non-Farm Payrolls (NFP) is releasing in 25 minutes. Your trailing stop is at +1:1. What should you do?', options: [
    { text: 'Hold through NFP — the trend is strong', correct: false, explain: 'NFP creates unpredictable volatility that can move NASDAQ 200+ points in seconds. Your +1:2.5 unrealised profit could become 0 (or worse, negative if slippage jumps your trail). Holding through major news on a short-term trade is gambling, not managing.' },
    { text: 'Close the runner before NFP — lock in +1:2.5 profit. The unrealised gain is at risk from unpredictable news volatility.', correct: true, explain: 'Correct. Before major scheduled news (NFP, FOMC, CPI), close short-term runners. The risk/reward of holding through news on a 15M trade is terrible — you risk giving back 1:2.5 for a potential 1:3 that has a coin-flip chance. Total trade result: 1:1 on partial + 1:2.5 on runner = excellent.' },
    { text: 'Tighten the trail to +1:2 and hold through', correct: false, explain: 'Tightening the trail before news does not solve the problem. NFP can gap through your trail with massive slippage. You might set the trail at +1:2 and get filled at +0.5 or worse. Close cleanly before the event.' },
    { text: 'Add another position to maximise the NFP move', correct: false, explain: 'Adding before news is pure gambling. The move could go in either direction. You are adding risk into maximum uncertainty.' },
  ]},
  { scenario: 'You took a Model 1 trade on Gold. TP1 hit, moved to BE, runner is live. You go to make a cup of tea and come back 20 minutes later. The runner was at +1:2 when you left. It is now at +0.3 — price pulled back sharply while you were away. Your trail was at +0.8 but the candle wicked through it and recovered. What happened and what do you do?', options: [
    { text: 'The trade should have closed at the trail — something went wrong', correct: false, explain: 'Depending on your platform, the trailing stop might be a mental stop (not a hard order). If you set it as a hard stop-loss order on the platform, it would have triggered. If it was a "mental note," being away meant it did not execute.' },
    { text: 'Close at +0.3 and accept the lesson: always set HARD stop orders on the platform, never rely on "mental stops" or being at the screen', correct: true, explain: 'Correct. The lesson is not about the trade — it is about execution. If your trail at +0.8 was a hard order on the platform, it would have triggered at +0.8 (good outcome). If it was a "mental stop," the wick through it while you were away was a management failure. ALWAYS use hard orders for trailing stops. Screen time is unreliable.' },
    { text: 'Hold and hope it recovers to +1:2', correct: false, explain: 'Holding after a sharp pullback through your trail level is hoping, not managing. Your thesis (trail at +0.8 = structural floor) was broken. The fact that it recovered does not change that the floor was breached.' },
    { text: 'Move the stop further down to give it room', correct: false, explain: 'The trail was breached. Moving the stop further away after a breach is the opposite of management — it is refusing to accept that the thesis was tested and found wanting.' },
  ]},
  { scenario: 'A trader takes 20 trades per month. On 8 of them, he moves to breakeven at +3 pips (before TP1 is reached). On 12 of them, he waits for TP1. His results: the 8 early-BE trades get stopped at breakeven 6 times (0 profit). The 12 proper trades capture full TP1 + runners. What should he change?', options: [
    { text: 'Nothing — at least the early-BE trades did not lose money', correct: false, explain: '6 of 8 trades stopped at breakeven that WOULD have been winners if managed properly. That is 6 lost winning trades per month. The "saved" money is an illusion — he gave up 6 winners to protect against losses that his original stop already handled.' },
    { text: 'Stop moving to breakeven early — let the original stop do its job until TP1 is hit. The early-BE is killing 6 winning trades per month.', correct: true, explain: 'Correct. Moving to BE at +3 pips means any pullback greater than 3 pips (which happens on virtually every trade) stops him flat. The original stop was placed at a structural level for a reason — it protects against genuine failure. A 3-pip pullback is NOT failure, it is normal price breathing. He is losing 6 winners per month to fear-based management.' },
    { text: 'He should move to BE at +5 pips instead of +3', correct: false, explain: '+5 pips is still arbitrary and still too early. The correct time to move to BE is AFTER TP1, not after an arbitrary pip count. Normal pullbacks can be 10-20+ pips on Gold before continuing to TP1.' },
    { text: 'He should stop using breakeven entirely', correct: false, explain: 'Breakeven after TP1 is correct management. The problem is breakeven BEFORE TP1. He should keep BE in his plan but only apply it after the proper trigger (TP1 hit).' },
  ]},
];

const quizQuestions = [
  { q: 'When should you move your stop to breakeven?', opts: ['As soon as price is +5 pips in profit', 'After TP1 is hit and 50% of the position is closed', 'When you feel nervous about the trade', 'After 30 minutes in the trade'], correct: 1, explain: 'Breakeven timing is triggered by TP1, not by pips, time, or feelings. TP1 hit = close 50% + move remaining to BE. This ensures the trade has proven itself before you remove the original structural protection.' },
  { q: 'What is the correct way to trail a stop on a runner?', opts: ['Move it up by 5 pips every hour', 'Trail behind each new structural Higher Low (longs) or Lower High (shorts)', 'Keep it at breakeven forever', 'Trail behind every candle close'], correct: 1, explain: 'Trailing follows STRUCTURE, not time or candles. A new Higher Low is a structural floor — your trail goes just below it. This gives the trade room for normal pullbacks while catching genuine trend breaks.' },
  { q: 'NFP releases in 20 minutes. You have a 15M runner at +1:2.3 R:R. What should you do?', opts: ['Hold through — the trend will protect you', 'Close the runner before the news event — protect the unrealised profit from unpredictable volatility', 'Add another position for the news move', 'Move trail to +1:2 and hold'], correct: 1, explain: 'Major scheduled news on short-term trades = close before the event. The risk of giving back 1:2.3 of profit for a coin-flip chance at 1:3 is not worth it. Slippage during news can jump your trail.' },
  { q: 'A trader moves to breakeven at +3 pips on every trade. Out of 20 trades, 12 get stopped at breakeven. What is the likely problem?', opts: ['His entries are bad', 'Moving to BE too early — normal pullbacks hit the +3 BE before TP1, killing winning trades', 'His stop is too tight', 'He should use 1-minute charts'], correct: 1, explain: 'A +3 pip BE gets hit by ANY normal pullback. This turns winners into breakevens. The original structural stop handles genuine failures. BE should only activate after TP1 — not after an arbitrary pip count.' },
  { q: 'Your runner is at +1:1.8. A new Higher Low formed at +1:1.2. Where does the trail go?', opts: ['Stay at breakeven', 'Just below the HL at approximately +1:1', 'At +1:1.5 (halfway)', 'At +1:1.8 (current price)'], correct: 1, explain: 'The trail follows the HL structure. Just below the HL at +1:1 locks in profit while giving the trade room to form new HLs. The trail at BE is outdated (a new HL is available). +1:1.5 has no structural meaning.' },
  { q: 'What is the primary purpose of taking partial profits at TP1?', opts: ['To show off on social media', 'To secure base profit, reduce psychological pressure, and create a risk-free runner', 'To reduce position size for margin requirements', 'Because TP1 is always the best exit point'], correct: 1, explain: 'TP1 serves three purposes: (1) Lock in profit that cannot be taken away, (2) Create a risk-free runner by moving to BE, (3) Reduce the emotional burden of managing the full position. The runner can then be managed with patience because the base profit is secure.' },
  { q: 'Price hits TP1 but you do not close the partial because you think it will go straight to TP2. It reverses back to entry. What mistake did you make?', opts: ['No mistake — you were being ambitious', 'You skipped a management rule. TP1 is a RULE, not a suggestion. The partial close and BE move protect you from exactly this scenario.', 'You should have closed everything at TP1', 'The setup was wrong'], correct: 1, explain: 'TP1 is a management action, not an opinion. "I think it will keep going" is an emotion overriding a rule. If you had closed 50% and moved to BE, the reversal would have stopped you at breakeven on the runner — not a loss. The partial is INSURANCE, not optional.' },
  { q: 'Should you EVER add to a winning position (scale in)?', opts: ['Never — always exit, never add', 'Only after TP1, at a new setup/OB in the direction of the trend, with independent risk calculation', 'Yes — add every time price moves 10 pips in your favour', 'Only if you are funded'], correct: 1, explain: 'Scaling in is advanced management. It is valid ONLY at a new, independent setup point (new OB, new BOS) with its own stop and risk calculation. The additional position is a NEW trade that happens to align with the existing one — not a doubling-down on the original trade.' },
];

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

function Confetti({ active }: { active: boolean }) {
  if (!active) return null;
  return (<div className="fixed inset-0 pointer-events-none z-50">{Array.from({ length: 60 }).map((_, i) => (<motion.div key={i} initial={{ y: -20, x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400), opacity: 1 }} animate={{ y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 20, rotate: Math.random() * 720, opacity: 0 }} transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5 }} className="absolute w-2 h-2 rounded-sm" style={{ background: ['#f59e0b', '#d946ef', '#34d399', '#3b82f6', '#ef4444'][i % 5] }} />))}</div>);
}

export default function TradeManagementLesson() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);

  const [openPhase, setOpenPhase] = useState<number | null>(null);
  const [openScenario, setOpenScenario] = useState<number | null>(null);

  // Interactive — Management Simulator: trade progresses, user makes decisions
  const [simPhase, setSimPhase] = useState(0);
  const [simChoices, setSimChoices] = useState<number[]>([]);
  const simSteps = [
    { phase: 'Entry → Price at +7 pips (TP1 is at +10)', question: 'Price is pulling back from +7. What do you do?', options: ['Close at +7 — take the profit', 'Hold — TP1 is at +10, let it play out', 'Move stop to +3 for safety'], correct: 1, explain: 'Hold. +7 is not TP1. The original stop protects you. A pullback from +7 is normal — wait for TP1 at +10.' },
    { phase: 'Price reaches TP1 (+10 pips). What do you do?', question: 'TP1 has been hit.', options: ['Close everything at +10', 'Close 50%, move stop to breakeven', 'Hold everything for TP2'], correct: 1, explain: 'Close 50% at TP1, move remaining to breakeven. This secures profit and creates a risk-free runner.' },
    { phase: 'Runner is at +18 pips. A new HL formed at +12. Trail?', question: 'How do you manage the trail?', options: ['Keep trail at breakeven', 'Move trail to +11 (just below HL)', 'Close at +18 — great profit'], correct: 1, explain: 'Trail to +11 (below the HL). This locks in +11 on the runner while giving room for continuation.' },
    { phase: 'Price pulls back and hits your trail at +11. Trade over.', question: 'Total result: 50% at +10, 50% at +11.', options: ['Record and move on', 'Re-enter immediately', 'Feel bad about not closing at +18'], correct: 0, explain: 'Record the trade. 50% at 1:1 + 50% at 1:1.1 = solid result. The trail worked exactly as designed. No regrets — the system did its job.' },
  ];
  const handleSimChoice = (choice: number) => { setSimChoices([...simChoices, choice]); if (simPhase < simSteps.length - 1) setSimPhase(simPhase + 1); };
  const simScore = simChoices.filter((c, i) => c === simSteps[i]?.correct).length;

  // Mistakes
  const [openMistake, setOpenMistake] = useState<number | null>(null);
  const mistakes = [
    { title: 'Moving to breakeven before TP1', desc: 'The #1 management mistake. Normal pullbacks (5-15 pips) happen on virtually every trade. A breakeven at +3 or +5 pips gets hit by these normal pullbacks 60-70% of the time. You are converting winning trades into breakeven trades. Wait for TP1.' },
    { title: 'Closing the runner because "I am up enough"', desc: '"Enough" is an emotional threshold, not a trading plan. If the trend is still making Higher Lows and your trail has not been hit, the trade is still working. Closing because of a feeling gives back the statistical edge that runners provide. The trail catches you — let it work.' },
    { title: 'Not using hard stop orders for trailing', desc: 'A "mental stop" only works if you are at the screen. If you step away, the mental stop does not exist. Always place trailing stops as REAL orders on the platform. The market does not care about your mental notes.' },
    { title: 'Micromanaging every candle', desc: 'Checking the trade every 30 seconds and reacting to every red candle is over-management. It leads to premature exits, emotional decisions, and exhaustion. Set your management rules (TP1, BE, trail), execute them at the right moments, and step away between phases.' },
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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 6 &middot; Lesson 8</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Trade<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Management</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">What happens between entry and exit. The decisions that separate breakeven traders from profitable ones.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* S00 */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">🔍 The Pilot After Takeoff</p>
            <p className="text-gray-400 leading-relaxed mb-4">A pilot does not land the plane the moment it is airborne. Between takeoff and landing, there are dozens of management decisions: altitude adjustments, course corrections, turbulence handling, fuel monitoring, and approach planning. Skip any of these and the flight fails — even though the takeoff was perfect.</p>
            <p className="text-gray-400 leading-relaxed">Your trade entry is the takeoff. Trade management is the flight. Most traders obsess over entries (takeoff technique) and ignore management (the actual flying). The best entry in the world means nothing if you cannot manage the trade once it is live.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">Two traders took the exact same 50 trades on Gold with identical entries. Trader A used the ATLAS management plan (partials → BE → trail). Trader B used no management (set-and-forget full position, fixed TP). After 50 trades: Trader A: <strong className="text-green-400">+£6,800</strong>. Trader B: <strong className="text-amber-400">+£2,100</strong>. Same entries. Management tripled the profit.</p>
          </div>
        </motion.div>
      </section>

      {/* S01 — Trade Lifecycle Animation */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Full Lifecycle</p>
          <h2 className="text-2xl font-extrabold mb-4">Every Phase Mapped</h2>
          <p className="text-gray-400 text-sm mb-6">Watch a complete trade from entry to exit with every management decision annotated: hold → TP1 partial → breakeven → trail → exit.</p>
          <TradeLifecycleAnimation />
        </motion.div>
      </section>

      {/* S02 — Management Styles */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; Management Styles</p>
          <h2 className="text-2xl font-extrabold mb-4">Under vs Over vs Just Right</h2>
          <p className="text-gray-400 text-sm mb-6">Three management approaches with the same 50 trades. See how management style impacts the equity curve.</p>
          <ManagementStylesAnimation />
        </motion.div>
      </section>

      {/* S03 — 4 Phases */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The 4 Phases</p>
          <h2 className="text-2xl font-extrabold mb-4">Entry to Exit — Phase by Phase</h2>
          <div className="space-y-3">
            {managementPhases.map((p, i) => (
              <div key={i}>
                <button onClick={() => setOpenPhase(openPhase === i ? null : i)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <div className="flex items-center gap-3"><span className="text-xl">{p.icon}</span><div><p className="text-sm font-extrabold text-white">{p.phase}</p><p className="text-xs text-gray-500">{p.title}</p></div></div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openPhase === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openPhase === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05] space-y-3">
                      <div className="space-y-2">{p.rules.map((r, ri) => (<div key={ri} className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]"><p className="text-xs text-gray-400">{r}</p></div>))}</div>
                      <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10"><p className="text-xs text-amber-400">💡 {p.tip}</p></div>
                    </div>
                  </motion.div>
                )}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S04 — Scenario Decisions */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Edge Case Decisions</p>
          <h2 className="text-2xl font-extrabold mb-4">What To Do When...</h2>
          <p className="text-gray-400 text-sm mb-6">5 common scenarios that the basic plan does not cover. Open each one for the correct action.</p>
          <div className="space-y-3">
            {scenarioDecisions.map((s, i) => (
              <div key={i}>
                <button onClick={() => setOpenScenario(openScenario === i ? null : i)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <p className="text-sm font-extrabold text-white">{s.title}</p>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openScenario === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openScenario === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className={`p-4 rounded-b-xl bg-${s.color}-500/5 border-x border-b border-${s.color}-500/15`}><p className="text-sm text-gray-400 leading-relaxed">{s.action}</p></div>
                  </motion.div>
                )}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S05 — Interactive Management Simulator */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Management Simulator</p>
          <h2 className="text-2xl font-extrabold mb-2">Manage a Live Trade</h2>
          <p className="text-gray-400 text-sm mb-6">Walk through a Gold trade making every management decision at each phase.</p>
          <div className="p-6 rounded-2xl glass-card">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-amber-400">Phase {simPhase + 1} of {simSteps.length}</span>
              <span className="text-xs font-mono text-gray-500">{simScore}/{simChoices.length} correct</span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-4">
              <p className="text-xs text-amber-400 font-bold mb-1">{simSteps[simPhase].phase}</p>
              <p className="text-sm text-gray-300">{simSteps[simPhase].question}</p>
            </div>
            {simChoices.length <= simPhase ? (
              <div className="space-y-2">
                {simSteps[simPhase].options.map((opt, oi) => (
                  <button key={oi} onClick={() => handleSimChoice(oi)} className="w-full text-left p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] text-sm text-gray-300 transition-all">{opt}</button>
                ))}
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className={`p-3 rounded-xl ${simChoices[simPhase] === simSteps[simPhase].correct ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                  <p className={`text-xs ${simChoices[simPhase] === simSteps[simPhase].correct ? 'text-green-400' : 'text-red-400'}`}>{simChoices[simPhase] === simSteps[simPhase].correct ? '✓ ' : '✗ '}{simSteps[simPhase].explain}</p>
                </div>
                {simPhase < simSteps.length - 1 && simChoices.length > simPhase && (
                  <button onClick={() => setSimPhase(simPhase + 1)} className="mt-3 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Phase &rarr;</button>
                )}
                {simPhase === simSteps.length - 1 && simChoices.length > simPhase && (
                  <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                    <p className="text-sm font-bold text-amber-400">{simScore}/{simSteps.length} correct management decisions</p>
                    <p className="text-xs text-gray-400 mt-1">{simScore >= 3 ? 'Strong management — you can fly the plane.' : 'Review the 4 phases and try to manage with rules, not feelings.'}</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </section>

      {/* S06 — Scaling In (Advanced) */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Scaling In (Advanced)</p>
          <h2 className="text-2xl font-extrabold mb-4">Adding to Winners — When and How</h2>
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <p className="text-gray-400 leading-relaxed">Scaling in means adding a second (or third) position to a winning trade. This is ADVANCED management — get the basics right first. Scaling in done wrong is just averaging into a losing idea with extra steps.</p>
            <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/15">
              <p className="text-sm font-extrabold text-green-400 mb-2">When Scaling In Works</p>
              <p className="text-xs text-gray-400">After TP1 is secured. A NEW setup forms in the direction of the trade (new OB, new BOS on the runner). The new position has its OWN stop and risk calculation. Total exposure still within your daily risk cap.</p>
            </div>
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-extrabold text-red-400 mb-2">When Scaling In Fails</p>
              <p className="text-xs text-gray-400">Adding because "the trade is working" without a new setup. Adding before TP1 (no base profit secured). Adding without recalculating total risk. Adding on FOMO because the trade moved fast.</p>
            </div>
            <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/15">
              <p className="text-sm text-gray-400 leading-relaxed">💡 <strong className="text-purple-400">Rule of thumb:</strong> If the scaling entry would pass as a standalone trade (with its own setup, trigger, stop, and target), it is valid. If the only reason you are adding is &ldquo;it is already going my way,&rdquo; it is invalid.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S07 — The Psychology of Management */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Management Psychology</p>
          <h2 className="text-2xl font-extrabold mb-4">Your Brain vs Your Plan</h2>
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <p className="text-gray-400 leading-relaxed">Every management decision involves a battle between your plan and your emotions. Here is what each emotion is really saying:</p>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-red-400">&ldquo;I should move to breakeven now&rdquo;</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Fear of giving back profit. Reality: the OB is still valid. The plan says wait for TP1.</span></p></div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">&ldquo;I should close everything now&rdquo;</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Gratification bias. Reality: TP1 partial + runner is mathematically superior. Trust the plan.</span></p></div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-purple-400">&ldquo;I should skip TP1 and hold for TP2&rdquo;</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Greed. Reality: TP1 is insurance. Skipping it removes your safety net for a slightly bigger gamble.</span></p></div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-sky-400">&ldquo;I should move my stop further away&rdquo;</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Denial that the trade might be wrong. Reality: if the OB breaks, you are wrong. Accept it.</span></p></div>
            </div>
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
              <p className="text-sm text-gray-400 leading-relaxed">💡 <strong className="text-amber-400">The antidote:</strong> Write your management plan BEFORE entering the trade, when you are calm. Then during the trade, follow the written plan — not the voice in your head. The plan was made by your rational self. The voice belongs to your emotional self.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S08 — Common Mistakes */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-6">4 Management Killers</h2>
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
          <h2 className="text-2xl font-extrabold mb-4">Management Quick Reference</h2>
          <div className="p-6 rounded-2xl glass-card space-y-3">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">PHASE 1</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Entry → TP1. Hold. Stop at structure. Do nothing else.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-green-400">PHASE 2</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">TP1 hit → Close 50% → Move to BE. Three actions, 10 seconds.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-purple-400">PHASE 3</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Runner trails behind HLs. Let the market decide the exit.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-sky-400">PHASE 4</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Exit (TP2 or trail hit) → Record → Wait for next setup.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-red-400">NEVER</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">BE before TP1. Move stop wider. Close runner on emotion. Mental stops.</span></p></div>
          </div>
        </motion.div>
      </section>

      {/* S10 — Game */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Test Your Understanding</p>
          <h2 className="text-2xl font-extrabold mb-2">Trade Management Game</h2>
          <p className="text-gray-400 text-sm mb-6">5 in-trade scenarios. Make the right management call.</p>
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
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Excellent — you can manage a trade like a professional.' : gameScore >= 3 ? 'Solid — review the trailing and BE timing rules.' : 'Re-read the 4 phases and edge case decisions, then try again.'}</p></motion.div>)}
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
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-sky-500 to-amber-500 flex items-center justify-center text-3xl shadow-lg shadow-sky-500/30">✈️</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 6: Trade Management</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-sky-400 via-amber-400 to-sky-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Flight Commander &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L6.8-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
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
