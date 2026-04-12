// app/academy/lesson/strategy-engineering-capstone/page.tsx
// ATLAS Academy — Lesson 6.14: Your Complete Strategy — Capstone [PRO]
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
// ANIMATION 1: Strategy Assembly — pieces clicking into place
// 7 blocks assembling into a complete blueprint
// ============================================================
function StrategyAssemblyAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.008;
    const cx = w / 2;
    const progress = Math.min(1, (t % 5) / 4);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Your Strategy — Assembled Piece by Piece', cx, 14);

    const blocks = [
      { label: 'BATTLEFIELD', sub: 'Asset + TF + Session', color: '#22d3ee', lesson: '6.2' },
      { label: 'MODEL', sub: 'M1 Continuation or M2 Reversal', color: '#34d399', lesson: '6.3-4' },
      { label: 'TRIGGER', sub: 'Engulfing / Wick / LTF BOS', color: '#f59e0b', lesson: '6.5' },
      { label: 'STOP', sub: 'Structure / ATR / Swing', color: '#ef4444', lesson: '6.6' },
      { label: 'TARGET', sub: 'Fixed R:R / Structural / Trail', color: '#3b82f6', lesson: '6.7' },
      { label: 'MANAGEMENT', sub: 'Partials → BE → Trail', color: '#a78bfa', lesson: '6.8' },
      { label: 'JOURNAL', sub: 'Record → Review → Improve', color: '#f472b6', lesson: '6.11' },
    ];

    const blockW = 90;
    const blockH = 52;
    const gap = 6;
    const totalH = blocks.length * (blockH + gap) - gap;
    const startY = (h - totalH) / 2 + 10;
    const targetX = cx - blockW / 2;

    const revealCount = Math.floor(progress * (blocks.length + 1));

    blocks.forEach((b, i) => {
      if (i >= revealCount) return;

      // Animate from scattered positions to stacked
      const scattered = progress < (i + 1) / (blocks.length + 1);
      const scatterX = scattered ? cx + (i % 2 === 0 ? -1 : 1) * (80 + i * 20) : targetX;
      const scatterY = scattered ? startY + i * (blockH + gap) + Math.sin(t + i) * 10 : startY + i * (blockH + gap);
      const x = scatterX;
      const y = scatterY;

      // Block
      ctx.fillStyle = `${b.color}15`;
      ctx.beginPath(); ctx.roundRect(x, y, blockW, blockH, 6); ctx.fill();
      ctx.strokeStyle = `${b.color}55`; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(x, y, blockW, blockH, 6); ctx.stroke();

      // Connection line to next
      if (i < blocks.length - 1 && i < revealCount - 1) {
        ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(targetX + blockW / 2, y + blockH); ctx.lineTo(targetX + blockW / 2, y + blockH + gap); ctx.stroke();
      }

      // Label
      ctx.fillStyle = b.color; ctx.font = 'bold 9px system-ui'; ctx.textAlign = 'center';
      ctx.fillText(b.label, x + blockW / 2, y + 18);
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = '7px system-ui';
      ctx.fillText(b.sub, x + blockW / 2, y + 32);
      ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.font = '7px system-ui';
      ctx.fillText(`Lesson ${b.lesson}`, x + blockW / 2, y + 44);
    });

    // Complete label
    if (revealCount > blocks.length) {
      const pulse = 0.7 + 0.3 * Math.sin(t * 3);
      ctx.fillStyle = `rgba(52,211,153,${0.15 * pulse})`;
      ctx.beginPath(); ctx.roundRect(targetX - 15, startY - 12, blockW + 30, totalH + 24, 10); ctx.fill();
      ctx.strokeStyle = `rgba(52,211,153,${0.5 * pulse})`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(targetX - 15, startY - 12, blockW + 30, totalH + 24, 10); ctx.stroke();

      ctx.fillStyle = '#34d399'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
      ctx.fillText('✓ COMPLETE STRATEGY', cx, h - 12);
    }
  }, []);
  return <AnimScene drawFn={draw} height={440} />;
}

// ============================================================
// ANIMATION 2: Before Level 6 vs After Level 6
// Split screen: scattered concepts vs unified system
// ============================================================
function BeforeAfterAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;
    const mid = w / 2;
    const top = 38;
    const bot = h - 20;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Before Level 6 vs After Level 6', mid, 14);

    ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(mid, top - 5); ctx.lineTo(mid, bot); ctx.stroke();
    ctx.setLineDash([]);

    // LEFT — Before: scattered words floating randomly
    ctx.font = 'bold 10px system-ui'; ctx.fillStyle = '#ef4444'; ctx.textAlign = 'center';
    ctx.fillText('BEFORE', mid / 2, 28);

    const scattered = ['OB?', 'RSI?', 'stop?', '1:2?', 'when?', 'how much?', 'which pair?', 'KZ?', 'journal?', 'rules?'];
    scattered.forEach((word, i) => {
      const x = 20 + (i % 3) * (mid / 3 - 10) + Math.sin(t + i * 2) * 8;
      const y = top + 10 + Math.floor(i / 3) * 40 + Math.cos(t + i * 3) * 5;
      ctx.fillStyle = `rgba(239,68,68,${0.2 + 0.1 * Math.sin(t + i)})`;
      ctx.font = '9px system-ui'; ctx.textAlign = 'center';
      ctx.fillText(word, x + 30, y + 15);
    });

    ctx.fillStyle = 'rgba(239,68,68,0.4)'; ctx.font = '9px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('Random knowledge. No system.', mid / 2, bot - 5);

    // RIGHT — After: clean ordered list
    ctx.font = 'bold 10px system-ui'; ctx.fillStyle = '#34d399'; ctx.textAlign = 'center';
    ctx.fillText('AFTER', mid + mid / 2, 28);

    const ordered = [
      { num: '1', text: 'Gold 15M, London KZ', color: '#22d3ee' },
      { num: '2', text: 'Model 1: BOS → OB pullback', color: '#34d399' },
      { num: '3', text: 'Engulfing trigger at OB', color: '#f59e0b' },
      { num: '4', text: 'Stop below OB − 3 pips', color: '#ef4444' },
      { num: '5', text: 'TP1 at 1:1, trail runner', color: '#3b82f6' },
      { num: '6', text: '50% partial → BE → trail HL', color: '#a78bfa' },
      { num: '7', text: 'Journal every trade, review Sun', color: '#f472b6' },
    ];

    ordered.forEach((item, i) => {
      const y = top + 8 + i * 26;
      const x = mid + 15;

      ctx.fillStyle = `${item.color}22`;
      ctx.beginPath(); ctx.roundRect(x, y, mid - 30, 22, 4); ctx.fill();

      ctx.fillStyle = item.color; ctx.font = 'bold 8px system-ui'; ctx.textAlign = 'left';
      ctx.fillText(item.num, x + 6, y + 14);
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '8px system-ui';
      ctx.fillText(item.text, x + 18, y + 14);
    });

    ctx.fillStyle = 'rgba(52,211,153,0.4)'; ctx.font = '9px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('Complete system. Every decision defined.', mid + mid / 2, bot - 5);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// DATA
// ============================================================
const strategyTemplate = [
  { section: 'BATTLEFIELD', fields: [
    { label: 'Instrument', placeholder: 'e.g. XAUUSD (Gold)' },
    { label: 'Entry Timeframe', placeholder: 'e.g. 15M' },
    { label: 'Bias Timeframe', placeholder: 'e.g. 4H' },
    { label: 'Sessions', placeholder: 'e.g. London + NY Overlap only' },
  ]},
  { section: 'MODEL & SETUP', fields: [
    { label: 'Primary Model', placeholder: 'e.g. Model 1 — Trend Continuation' },
    { label: 'Setup Criteria', placeholder: 'e.g. HTF bullish (HH/HL) + 15M BOS + price at OB/FVG + KZ active' },
    { label: 'Regime Filter', placeholder: 'e.g. ADX > 25 on 4H (trend confirmed)' },
  ]},
  { section: 'ENTRY', fields: [
    { label: 'Primary Trigger', placeholder: 'e.g. Bullish engulfing at OB with body > 5-candle avg' },
    { label: 'Secondary Trigger', placeholder: 'e.g. LTF BOS on 5M (for wide OBs)' },
    { label: 'Quality Filters', placeholder: 'e.g. Volume above 20-SMA + active KZ' },
  ]},
  { section: 'RISK & STOPS', fields: [
    { label: 'Risk per Trade', placeholder: 'e.g. 1% of account' },
    { label: 'Stop Method', placeholder: 'e.g. Structure: OB low − spread − 3 pip buffer' },
    { label: 'Position Sizing', placeholder: 'e.g. Lots = (Account × 1%) ÷ (Stop pips × Pip value)' },
  ]},
  { section: 'TARGETS', fields: [
    { label: 'TP1', placeholder: 'e.g. 1:1 R:R (close 50%)' },
    { label: 'TP2 / Runner', placeholder: 'e.g. Next structural level or trail behind HLs' },
    { label: 'Minimum R:R', placeholder: 'e.g. 1:1.5 — skip if structure target is closer' },
  ]},
  { section: 'MANAGEMENT', fields: [
    { label: 'At TP1', placeholder: 'e.g. Close 50%, move stop to breakeven' },
    { label: 'Runner', placeholder: 'e.g. Trail behind structural HLs, let market decide exit' },
    { label: 'Before News', placeholder: 'e.g. Close all 15M trades 15 min before NFP/FOMC/CPI' },
  ]},
  { section: 'RULES & LIMITS', fields: [
    { label: 'Max Trades per Day', placeholder: 'e.g. 3' },
    { label: 'Daily Loss Cap', placeholder: 'e.g. 2% — stop trading for the day' },
    { label: 'Walk-Away Rule', placeholder: 'e.g. 3 consecutive losses = session over' },
    { label: 'Weekend Rule', placeholder: 'e.g. Close all positions before Friday close' },
  ]},
];

const levelRecap = [
  { lesson: '6.1', title: 'Anatomy of a Strategy', takeaway: 'A strategy has 7 components. Missing even one breaks the engine.' },
  { lesson: '6.2', title: 'Choosing Your Battlefield', takeaway: 'Match your asset, timeframe, and session to YOUR lifestyle. Specialise.' },
  { lesson: '6.3', title: 'Model 1: Trend Continuation', takeaway: 'BOS → pullback to OB → trigger. The highest-probability model.' },
  { lesson: '6.4', title: 'Model 2: Reversal', takeaway: 'Exhaustion + sweep + CHoCH. Lower WR, higher R:R. The scalpel.' },
  { lesson: '6.5', title: 'Entry Trigger Mastery', takeaway: '5 triggers. Quality filters (body, volume, session). No trigger = no trade.' },
  { lesson: '6.6', title: 'Stop Placement Science', takeaway: 'Structure stops behind the OB. Never fixed pips. Never move wider.' },
  { lesson: '6.7', title: 'Target Selection & R:R', takeaway: 'Minimum 1:1.5 R:R. Partials at TP1. Structural or trailing for TP2.' },
  { lesson: '6.8', title: 'Trade Management', takeaway: '4 phases: Hold → Partial → BE → Trail. Follow the plan, not the feelings.' },
  { lesson: '6.9', title: 'Backtesting Fundamentals', takeaway: '100 trades. Replay mode. All conditions. Record everything. No curve-fitting.' },
  { lesson: '6.10', title: 'Expectancy & Edge', takeaway: 'EV = (WR × Win) − (LR × Loss). Positive = edge. Account for erosion.' },
  { lesson: '6.11', title: 'The Strategy Journal', takeaway: 'Record → Review weekly → Change one thing → Measure. The improvement cycle.' },
  { lesson: '6.12', title: 'Common Strategy Killers', takeaway: '10 killers ranked. Curve-fitting, regime blindness, emotional breaking = critical.' },
  { lesson: '6.13', title: 'Strategy Stress Test', takeaway: 'Max streak × 1.5. Walk-away rules. Close before news. Size for the worst case.' },
];

const gameRounds = [
  { scenario: 'A trader says: "My strategy is Gold 15M, Model 1 trend continuation, engulfing trigger at OBs, structure stop, 1:2 fixed target, 1% risk, London session only." He has all 7 components. But he has never backtested. Is he ready to trade live?', options: [
    { text: 'Yes — all 7 components are defined, the strategy is complete', correct: false, explain: 'Having all 7 components defined is necessary but not sufficient. Without backtesting, he has a THEORY, not a PROVEN strategy. He does not know his win rate, his EV, his max drawdown, or whether the strategy even works. Lesson 6.9: 100 trades in replay mode before live.' },
    { text: 'No — the strategy is defined but untested. He needs 100+ backtested trades to prove the edge exists before risking real capital.', correct: true, explain: 'Correct. A complete strategy document is step 1. Backtesting (100+ trades, replay mode, all conditions) is step 2. Demo/micro-risk live is step 3. Full live is step 4. He is trying to skip from step 1 to step 4.' },
    { text: 'He should paper trade for a week then go live', correct: false, explain: 'A week of paper trading is maybe 5-10 trades — far below the 100-trade minimum needed for statistical validity. The backtest comes first (historical data, 100+ trades), then demo/small live to validate execution.' },
    { text: 'He needs more indicators before going live', correct: false, explain: 'His setup criteria and trigger are defined. More indicators add complexity without addressing the core issue: the strategy is untested. Test what you have before adding more.' },
  ]},
  { scenario: 'After 120 backtested trades, a trader has: WR 47%, Avg R:R 1:2.1, EV +£31/trade, max streak 9. She uses 1% risk on a £10,000 account. She is about to go live. What is her expected worst-case drawdown and can her account survive it?', options: [
    { text: 'Max DD = 9% (9 × 1%). Survivable. Go live.', correct: false, explain: 'The backtest max is 9, but live trading typically produces 1.5× the backtest max = 13-14 losses. At 1% risk that is 13-14% drawdown. Still survivable but more than 9%.' },
    { text: 'Expected live max streak = 14 (9 × 1.5). Max DD ≈ 14%. Account drops to ~£8,600. Recovery needs ~16% gain ≈ 52 trades at +£31 EV. Painful but survivable. She is ready — with walk-away rules in place.', correct: true, explain: 'Correct. She has done the maths: positive EV (+£31), adequate sample (120 trades), known max DD (14%), and the recovery path is clear (~52 trades). With walk-away rules (3 losses = session over, 2% daily cap), she can manage the psychology. This is what a prepared trader looks like.' },
    { text: 'She should reduce to 0.5% risk to be safer', correct: false, explain: '0.5% risk would halve the drawdown to 7% (very safe) but also halve the EV to +£15.50/trade. At 120 trades/year, that is £1,860 vs £3,720. She needs to balance safety with income. 1% risk with 14% max DD is within professional norms.' },
    { text: 'She needs 200 more backtested trades first', correct: false, explain: '120 trades is above the 100-trade minimum. More data always helps, but she has enough to go live with confidence. The next step is live execution validation, not more historical data.' },
  ]},
  { scenario: 'Two months into live trading, a trader notices his actual R:R achieved is 1:1.3 instead of his planned 1:2. His journal shows: TP1 at 1:1 hits consistently, but his runners get stopped at breakeven 70% of the time. What specific fix should he implement?', options: [
    { text: 'Switch to 1:1 fixed target and close everything', correct: false, explain: 'Closing everything at 1:1 removes the runner opportunity entirely. The 30% of runners that DO work add significant value. The fix should improve the runner success rate, not eliminate runners.' },
    { text: 'Trail runners behind structural Higher Lows instead of a tight trail. The BE stops are getting hit by normal pullbacks because the trail is too tight. Wider structural trailing would let the 70% pullbacks develop into continuations.', correct: true, explain: 'Correct. His journal reveals the SPECIFIC leak: runners failing at BE. This means the pullbacks after TP1 are normal (not reversals) but his BE placement does not give them enough room. Trailing behind structural HLs (instead of arbitrary levels) respects the trend structure and lets normal pullbacks breathe. This is exactly what the journal is designed to reveal.' },
    { text: 'Stop using Model 1 — switch to Model 2 for better R:R', correct: false, explain: 'His Model 1 entries are working (TP1 hits consistently). The issue is purely in runner management, not the model. Switching models abandons a working entry strategy because of a fixable management problem.' },
    { text: 'Increase position size to compensate for lower R:R', correct: false, explain: 'Increasing size to compensate for reduced R:R increases risk. The R:R reduction is a management issue that should be fixed at its source (trailing method), not compensated with sizing.' },
  ]},
  { scenario: 'A trader has been following his strategy perfectly for 4 months. His journal confirms: all rules followed, sessions correct, triggers valid. But he just hit his worst losing streak — 11 trades in a row. He has £8,900 left from £10,000. Every instinct says to change something. What should he do?', options: [
    { text: 'Change his trigger — the engulfing is clearly not working anymore', correct: false, explain: 'His journal confirms rules were followed perfectly. The trigger is not the problem — the streak is variance. Changing a working component based on a normal (if painful) losing streak is strategy-killer #3: emotional rule-breaking.' },
    { text: 'Nothing. The strategy is following its tested parameters. A 11-loss streak at 1% = 11% drawdown is within the expected range (backtest max was 9, live expectation is 14). Continue executing. The EV has not changed — only the short-term results have.', correct: true, explain: 'Correct. This is the hardest moment in trading — and the moment that separates professionals from amateurs. His strategy has positive EV. His rules are being followed. The losing streak is within expected parameters. Changing ANYTHING right now is an emotional decision that would destroy a working system. The only action: check the regime filter (is the market still trending?). If yes, keep trading. If no, pause until the regime returns.' },
    { text: 'Reduce risk to 0.5% until the streak ends', correct: false, explain: 'Reducing risk during a normal drawdown means the RECOVERY trades earn half as much. If the next 11 trades win, he recovers £550 at 0.5% instead of £1,100 at 1%. The streak is normal — do not penalise the recovery.' },
    { text: 'Take a week off to reset mentally, then resume with the same rules', correct: false, explain: 'Taking a break is not wrong per se, but it is not necessary if he is managing his psychology with walk-away rules. The correct response is to check the regime filter, confirm rules are followed, and continue. A week off based on a normal streak is an emotional reaction, not a strategic one.' },
  ]},
  { scenario: 'You have completed Level 6. You have a fully documented strategy. Your next step is to backtest 100 trades. You sit down with TradingView replay mode, your rules printed next to your screen, and your spreadsheet open. After 40 trades, your WR is 38% and your R:R is 1:2.4. You feel discouraged because 38% "looks bad." Should you continue or redesign?', options: [
    { text: 'Redesign — 38% win rate will not work', correct: false, explain: 'Check the EV: (0.38 × 2.4R) − (0.62 × 1R) = 0.912R − 0.62R = +0.292R per trade. At £100 risk, that is +£29.20 per trade. That is VERY profitable. The 38% WR "feels" bad but the maths says it works.' },
    { text: 'Continue to 100 trades. EV = +0.29R per trade — strongly positive. 40 trades is too few to draw conclusions. The WR might settle at 42-45% with more data, and even if it stays at 38%, the R:R makes it profitable.', correct: true, explain: 'Correct. At 40 trades, the WR has high variance (could be 30-46% with a true rate of 42%). The EV is clearly positive. Stopping at 40 trades based on WR alone is exactly the "insufficient sample size" killer from Lesson 6.12. Continue to 100 trades, calculate the final EV, and trust the maths over the feelings.' },
    { text: 'Lower the R:R target to increase win rate', correct: false, explain: 'Lowering R:R from 1:2.4 to (say) 1:1.5 might increase WR from 38% to 48%, but the EV might stay similar or even decrease. Without testing the change, it is a guess. Finish the 100-trade backtest first, then evaluate.' },
    { text: 'The R:R is good but the WR needs to be at least 50%', correct: false, explain: 'At 1:2.4 R:R, the breakeven WR is only 29%. His 38% is 9 percentage points ABOVE breakeven — a substantial edge. Requiring 50% WR with 1:2.4 R:R is asking for a unicorn strategy that rarely exists.' },
  ]},
];

const quizQuestions = [
  { q: 'What are the 7 components of a complete trading strategy?', opts: ['Entry, exit, stop, target, indicator, volume, news', 'Asset, Timeframe, Setup Criteria, Entry Trigger, Stop, Target, Position Sizing', 'Buy, sell, hold, wait, journal, review, improve', 'Model, indicator, pattern, candle, volume, session, luck'], correct: 1, explain: 'The 7 components from Lesson 6.1: (1) Asset selection, (2) Timeframe, (3) Setup criteria, (4) Entry trigger, (5) Stop placement, (6) Target, (7) Position sizing. Each one is a defined, written rule. Together they form a complete, reproducible system.' },
  { q: 'After documenting your strategy, what is the NEXT step before live trading?', opts: ['Demo trade for a day', 'Go live with small risk', 'Backtest 100+ trades in replay mode across all market conditions', 'Post it on social media for feedback'], correct: 2, explain: 'The documented strategy is a theory. Backtesting proves the theory. 100+ trades in replay mode (no hindsight bias), across trending + ranging + volatile conditions, with every trade recorded. Only after positive EV is confirmed do you transition to demo/small live.' },
  { q: 'Your backtest shows +£28 EV per trade. Your estimated edge erosion (spread + commission + slippage + mistakes) is £12 per trade. Is this strategy viable?', opts: ['No — the erosion is too high', 'Yes — net EV is +£16/trade. The strategy survives real-world costs with a meaningful edge remaining.', 'Only if erosion can be reduced to zero', 'Need more data to determine'], correct: 1, explain: 'Net EV = £28 − £12 = +£16 per trade. At 8 trades/week, that is £128/week or ~£6,600/year. The 43% erosion rate is within the normal 30-60% range. The strategy is viable because the NET edge is meaningfully positive.' },
  { q: 'What makes the ATLAS partial exit strategy (TP1 at 1:1, trail runner) superior to closing everything at 1:1?', opts: ['It looks more professional', 'TP1 secures base profit (removes risk), while the runner captures additional R:R on the 30-40% of trades that continue trending — producing a blended R:R of 1:1.3-1.8 instead of 1:1', 'It reduces commission costs', 'It does not — 1:1 is always better'], correct: 1, explain: 'Closing at 1:1 gives exactly 1:1 on every winner. The partial strategy gives 1:1 on 50% + runner profit on the other 50%. Even if only 30% of runners reach 1:2+, the blended R:R is significantly better than 1:1. You secure the base AND capture the upside.' },
  { q: 'A trader completes Level 6 and says: "I understand everything. I do not need a journal — I will just follow the rules." What is wrong with this statement?', opts: ['Nothing — understanding is enough', 'Without a journal, he cannot identify which parts of his strategy work, which leak profit, or when the regime changes. Knowledge without measurement is guesswork dressed as confidence.', 'He should journal for the first month only', 'Journals are optional for experienced traders'], correct: 1, explain: 'The journal is not a training wheel you remove after learning. It is the diagnostic system that reveals session performance, trigger success rates, emotional patterns, R:R leaks, and regime shifts. Even professional traders with 10+ years of experience journal. Without data, "following the rules" is a claim you cannot verify.' },
  { q: 'What is the correct order for strategy development?', opts: ['Trade live → backtest → document → journal', 'Document rules → backtest 100+ trades → demo/micro live → full live → journal ongoing', 'Backtest → trade live → document after profitable', 'Journal → backtest → document → trade live'], correct: 1, explain: 'Document FIRST (so rules are clear before testing). Backtest SECOND (prove the rules work on historical data). Demo/micro live THIRD (validate execution under real conditions). Full live FOURTH (scale to normal risk). Journal THROUGHOUT (from backtest onward). This is the ATLAS Strategy Engineering process.' },
  { q: 'Your strategy document says "1% risk per trade." You feel very confident about a particular setup and want to risk 3%. Should you?', opts: ['Yes — higher confidence justifies higher risk', 'No — risk per trade is a RULE, not a suggestion. The backtest was done at 1%. Changing to 3% on one trade means the next losing streak costs 3× more than planned. Confidence is a feeling; risk is a number.', 'Yes but only if the R:R is above 1:3', 'Sometimes — on A+ setups only'], correct: 1, explain: 'Every rule in the strategy document exists because it was tested at THAT parameter. If you tested at 1% and the drawdown was 12%, tripling risk on one trade means one loss costs 3% — and the next streak could cost 36%. "Confidence" is the emotion that precedes some of the worst trades in history. Stick to the tested number.' },
  { q: 'You have finished Level 6 and built your strategy. What single sentence captures the ATLAS strategy engineering philosophy?', opts: ['"Win as many trades as possible"', '"A tested, documented, positive-EV system executed with discipline over a large sample is the ONLY path to consistent profitability"', '"Find the best entries and the profits follow"', '"Trade more to earn more"'], correct: 1, explain: 'This is the essence of everything in Level 6. TESTED (Lesson 6.9), DOCUMENTED (Lesson 6.1), POSITIVE-EV (Lesson 6.10), SYSTEM (Lesson 6.1), DISCIPLINE (Lesson 6.8/6.12), LARGE SAMPLE (Lesson 6.9/6.10). Every lesson contributed a piece. Together, they form the complete philosophy.' },
];

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

function Confetti({ active }: { active: boolean }) {
  if (!active) return null;
  return (<div className="fixed inset-0 pointer-events-none z-50">{Array.from({ length: 80 }).map((_, i) => (<motion.div key={i} initial={{ y: -20, x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400), opacity: 1 }} animate={{ y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 20, rotate: Math.random() * 720, opacity: 0 }} transition={{ duration: 2.5 + Math.random() * 2, delay: Math.random() * 0.8 }} className="absolute w-2.5 h-2.5 rounded-sm" style={{ background: ['#f59e0b', '#d946ef', '#34d399', '#3b82f6', '#ef4444', '#22d3ee'][i % 6] }} />))}</div>);
}

export default function StrategyEngineeringCapstoneLesson() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);

  // Interactive — Strategy Builder
  const [builderValues, setBuilderValues] = useState<Record<string, string>>({});
  const updateField = (key: string, value: string) => setBuilderValues(prev => ({ ...prev, [key]: value }));
  const totalFields = strategyTemplate.reduce<number>((sum, s) => sum + s.fields.length, 0);
  const filledFields = Object.values(builderValues).filter(v => v.trim().length > 0).length;
  const completePct = Math.round((filledFields / totalFields) * 100);
  const [openSection, setOpenSection] = useState<number | null>(0);

  // Level recap toggle
  const [showRecap, setShowRecap] = useState(false);

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
  useEffect(() => { if (certUnlocked) { setShowConfetti(true); const t = setTimeout(() => setShowConfetti(false), 5000); return () => clearTimeout(t); }}, [certUnlocked]);

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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 6 &middot; Capstone</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Your Complete<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Strategy</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">Assemble everything from Level 6 into one documented, testable, tradeable system. This is where theory becomes reality.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* S00 */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">🔍 The Blueprint Before the Building</p>
            <p className="text-gray-400 leading-relaxed mb-4">No architect builds without a blueprint. No surgeon operates without a plan. No pilot flies without a checklist. And no professional trader enters the market without a complete, documented, tested strategy.</p>
            <p className="text-gray-400 leading-relaxed">Over the last 13 lessons, you learned every component of a trading strategy: what to trade, when, how to enter, where to stop, where to target, how to manage, how to test, what to measure, what kills strategies, and how to survive the worst. Now you assemble all of it into YOUR strategy document &mdash; the blueprint you will trade from every single day.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">A trader completed the ATLAS Academy. He spent 2 hours writing his strategy document, 3 weeks backtesting 110 trades, and 2 weeks on demo. His document was <strong className="text-green-400">one page</strong>. Simple. Every rule clear. No ambiguity. After 8 months of live trading: <strong className="text-green-400">+22% account growth, 4 funded accounts passed, zero blown accounts</strong>. His one-page document was worth more than any indicator or course. Because he FOLLOWED it.</p>
          </div>
        </motion.div>
      </section>

      {/* S01 — Assembly Animation */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; Assembly</p>
          <h2 className="text-2xl font-extrabold mb-4">Every Piece Clicks Into Place</h2>
          <p className="text-gray-400 text-sm mb-6">Watch the 7 components of your strategy assemble from scattered concepts into a unified blueprint.</p>
          <StrategyAssemblyAnimation />
        </motion.div>
      </section>

      {/* S02 — Before/After Animation */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Transformation</p>
          <h2 className="text-2xl font-extrabold mb-4">Before Level 6 vs After</h2>
          <BeforeAfterAnimation />
        </motion.div>
      </section>

      {/* S03 — Level 6 Recap */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; Level 6 Recap</p>
          <h2 className="text-2xl font-extrabold mb-4">13 Lessons, 13 Building Blocks</h2>
          <button onClick={() => setShowRecap(!showRecap)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left mb-3">
            <p className="text-sm font-extrabold text-amber-400">View All 13 Lesson Takeaways</p>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showRecap ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>{showRecap && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="space-y-2 p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]">
                {levelRecap.map((lr, i) => (
                  <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <p className="text-xs"><strong className="text-amber-400">{lr.lesson} — {lr.title}:</strong> <span className="text-gray-400">{lr.takeaway}</span></p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}</AnimatePresence>
        </motion.div>
      </section>

      {/* S04 — The Strategy Document Template */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The One-Page Strategy</p>
          <h2 className="text-2xl font-extrabold mb-4">What Your Document Should Look Like</h2>
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <p className="text-gray-400 leading-relaxed">Your strategy document should fit on ONE page. If it does not, it is too complicated. Every rule should be clear enough that someone else could follow it without asking you questions.</p>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-3">
              <p className="text-sm font-extrabold text-amber-400">EXAMPLE: Gold Model 1 Strategy</p>
              <p className="text-xs text-gray-400"><strong className="text-white">Battlefield:</strong> XAUUSD 15M entries, 4H bias. London + NY overlap only.</p>
              <p className="text-xs text-gray-400"><strong className="text-white">Model:</strong> Model 1 Trend Continuation. 4H must show HH/HL (bull) or LH/LL (bear). ADX &gt; 25.</p>
              <p className="text-xs text-gray-400"><strong className="text-white">Setup:</strong> 15M BOS in 4H direction + price at OB or FVG + inside KZ.</p>
              <p className="text-xs text-gray-400"><strong className="text-white">Trigger:</strong> Bullish/bearish engulfing at OB with body &gt; 5-candle avg + volume above 20-SMA.</p>
              <p className="text-xs text-gray-400"><strong className="text-white">Stop:</strong> OB low/high − spread − 3 pip buffer. Structure stop.</p>
              <p className="text-xs text-gray-400"><strong className="text-white">Target:</strong> TP1 at 1:1 (close 50%). TP2 at next structural level or trail behind HLs. Min R:R: 1:1.5.</p>
              <p className="text-xs text-gray-400"><strong className="text-white">Management:</strong> TP1 → close 50% → BE → trail HLs. Close before NFP/FOMC. No weekend holds.</p>
              <p className="text-xs text-gray-400"><strong className="text-white">Risk:</strong> 1% per trade. Max 3 trades/day. 2% daily loss cap. 3 consecutive losses = session over.</p>
            </div>
            <div className="p-4 rounded-xl bg-sky-500/5 border border-sky-500/15">
              <p className="text-sm text-gray-400 leading-relaxed">💡 <strong className="text-sky-400">Print this and tape it next to your screen.</strong> Before every trade, read each line. If any condition is not met, the trade does not happen. The document is your pilot checklist. No pilot skips the checklist because they &ldquo;feel confident.&rdquo;</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S05 — Interactive Strategy Builder */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Build YOUR Strategy</p>
          <h2 className="text-2xl font-extrabold mb-2">Interactive Strategy Builder</h2>
          <p className="text-gray-400 text-sm mb-4">Fill in every field. When complete, you will have YOUR one-page strategy document.</p>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center mb-6">
            <p className="text-sm font-bold text-amber-400">{completePct}% Complete ({filledFields}/{totalFields} fields)</p>
            <div className="w-full h-2 bg-white/[0.05] rounded-full mt-2"><div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-accent-500 transition-all" style={{ width: `${completePct}%` }} /></div>
          </div>
          <div className="space-y-3">
            {strategyTemplate.map((sec, si) => (
              <div key={si}>
                <button onClick={() => setOpenSection(openSection === si ? null : si)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <p className="text-sm font-extrabold text-amber-400">{sec.section} ({sec.fields.filter(f => (builderValues[`${si}-${f.label}`] || '').trim().length > 0).length}/{sec.fields.length})</p>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSection === si ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openSection === si && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05] space-y-3">
                      {sec.fields.map((f, fi) => {
                        const key = `${si}-${f.label}`;
                        return (
                          <div key={fi}>
                            <p className="text-xs text-gray-500 mb-1">{f.label}</p>
                            <input type="text" value={builderValues[key] || ''} onChange={e => updateField(key, e.target.value)} placeholder={f.placeholder} className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-gray-600 focus:border-amber-500/30 outline-none" />
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}</AnimatePresence>
              </div>
            ))}
          </div>
          {completePct === 100 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-5 rounded-xl bg-green-500/10 border border-green-500/30 text-center">
              <p className="text-lg font-extrabold text-green-400">✓ Strategy Document Complete</p>
              <p className="text-xs text-gray-400 mt-2">You now have a fully defined, one-page strategy. Next step: backtest 100 trades in replay mode. Then demo. Then live.</p>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* S06 — The Roadmap After Level 6 */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; What Happens Next</p>
          <h2 className="text-2xl font-extrabold mb-4">Your Post-Level 6 Roadmap</h2>
          <div className="p-6 rounded-2xl glass-card space-y-3">
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15"><p className="text-sm"><strong className="text-amber-400">Week 1-3:</strong> <span className="text-gray-400">Backtest 100+ trades in TradingView replay mode. Record every trade. Calculate WR, R:R, EV, max streak.</span></p></div>
            <div className="p-4 rounded-xl bg-sky-500/5 border border-sky-500/15"><p className="text-sm"><strong className="text-sky-400">Week 4-5:</strong> <span className="text-gray-400">Demo trade or micro-risk (0.25%) for 2 weeks. Validate execution matches backtest rules. Track management compliance.</span></p></div>
            <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/15"><p className="text-sm"><strong className="text-green-400">Week 6+:</strong> <span className="text-gray-400">Go live at planned risk (0.5-1%). Journal every trade. Weekly reviews. One change at a time. Monthly performance assessment.</span></p></div>
            <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/15"><p className="text-sm"><strong className="text-purple-400">Month 3+:</strong> <span className="text-gray-400">Evaluate live EV vs backtest EV. Identify and fix the biggest leak from your journal. Consider prop firm application if EV is consistently positive.</span></p></div>
          </div>
        </motion.div>
      </section>

      {/* S07 — The ATLAS Philosophy */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; The ATLAS Philosophy</p>
          <h2 className="text-2xl font-extrabold mb-4">One Sentence That Changes Everything</h2>
          <div className="p-6 rounded-2xl glass-card">
            <div className="p-6 rounded-xl bg-gradient-to-br from-amber-500/10 to-purple-500/10 border border-amber-500/20 text-center">
              <p className="text-lg font-extrabold text-white leading-relaxed">&ldquo;A tested, documented, positive-EV system executed with discipline over a large sample is the ONLY path to consistent profitability.&rdquo;</p>
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-xs text-gray-400"><strong className="text-amber-400">Tested</strong> = 100+ backtested trades across all conditions (Lesson 6.9)</p>
              <p className="text-xs text-gray-400"><strong className="text-green-400">Documented</strong> = One-page strategy with every rule written (Lesson 6.1, this lesson)</p>
              <p className="text-xs text-gray-400"><strong className="text-sky-400">Positive-EV</strong> = EV &gt; 0 after edge erosion (Lesson 6.10)</p>
              <p className="text-xs text-gray-400"><strong className="text-purple-400">Discipline</strong> = Following the plan, not the feelings (Lesson 6.8, 6.12)</p>
              <p className="text-xs text-gray-400"><strong className="text-red-400">Large sample</strong> = 200+ live trades before judging (Lesson 6.9, 6.10)</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S08 — Final Checklist */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Pre-Flight Checklist</p>
          <h2 className="text-2xl font-extrabold mb-4">Before You Trade Live</h2>
          <div className="p-6 rounded-2xl glass-card space-y-3">
            {[
              'Strategy document complete (all 7 components + rules)',
              '100+ trades backtested in replay mode',
              'EV is positive AFTER estimated edge erosion',
              'Max drawdown calculated and survivable at your risk%',
              'Walk-away rules defined and committed to',
              'Journal template ready (spreadsheet or app)',
              'Demo or micro-risk phase completed (2+ weeks)',
              'Strategy document printed and next to your screen',
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center gap-3">
                <div className="w-5 h-5 rounded-md bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-xs text-gray-600">□</div>
                <p className="text-sm text-gray-400">{item}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S09 — Cheat Sheet */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Level 6 Master Cheat Sheet</p>
          <h2 className="text-2xl font-extrabold mb-4">Everything in One Place</h2>
          <div className="p-6 rounded-2xl glass-card space-y-3">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-cyan-400">BATTLEFIELD</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">1 instrument + 1 timeframe + 1 session. Specialise.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-green-400">MODEL</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">M1 (continuation: BOS→OB) or M2 (reversal: exhaust→sweep→CHoCH→OB).</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">TRIGGER</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Engulfing / Wick / LTF BOS / RSI Div / FVG Fill. No trigger = no trade.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-red-400">STOP</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Structure (below OB). Never fixed pips. Never move wider.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-sky-400">TARGET</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">TP1 at 1:1 (50%) → BE → TP2 structural or trail. Min 1:1.5 R:R.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-purple-400">MANAGE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Hold → Partial → BE → Trail. Plan beats feelings. Walk-away rules are law.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-pink-400">IMPROVE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Journal → Weekly review → One change → 50 trades → Measure. Repeat forever.</span></p></div>
          </div>
        </motion.div>
      </section>

      {/* S10 — Game */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Test Your Understanding</p>
          <h2 className="text-2xl font-extrabold mb-2">Capstone Challenge</h2>
          <p className="text-gray-400 text-sm mb-6">5 final scenarios. Prove you can think like a strategy engineer.</p>
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
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Outstanding — you think like a strategy engineer. Level 6 complete.' : gameScore >= 3 ? 'Strong performance. Review the lessons where you hesitated.' : 'Revisit the key lessons before proceeding to live trading.'}</p></motion.div>)}
          </div>
        </motion.div>
      </section>

      {/* S11 — Quiz + Level 6 Certificate */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Final Knowledge Check</p>
          <h2 className="text-2xl font-extrabold mb-6">Level 6 Capstone Quiz &mdash; 8 Questions</h2>
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
          {quizDone && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center"><p className="text-3xl font-extrabold mb-2">{quizScore}%</p><p className="text-sm text-gray-400">{quizScore >= 66 ? 'You passed! Level 6 Certificate unlocked below.' : 'You need 66% to earn the Level 6 certificate. Review and try again.'}</p></motion.div>)}
          {certUnlocked && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.0 }} className="mt-10">
              <div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/30" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.08),transparent,rgba(139,92,246,0.06),transparent,rgba(52,211,153,0.04),transparent)] animate-spin" style={{ animationDuration: '10s' }} />
                <div className="relative z-10 text-center">
                  <div className="w-[80px] h-[80px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-400 via-purple-500 to-green-400 flex items-center justify-center text-4xl shadow-lg shadow-amber-500/40">🏆</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-2">LEVEL 6 CERTIFICATE OF MASTERY</p>
                  <p className="text-sm text-gray-400">Has successfully completed all 14 lessons of<br /><strong className="text-white text-lg">Level 6: Strategy Engineering</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-purple-400 to-green-400 bg-clip-text text-transparent font-black text-xl mb-1 mt-5" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Strategy Engineer &mdash;</p>
                  <p className="text-xs text-gray-500 mt-2">You now possess a complete, documented, testable trading strategy built from first principles. The edge is yours. Protect it.</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase mt-4">PRO-CERT-L6.14-CAPSTONE-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
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
