// app/academy/lesson/strategy-journal/page.tsx
// ATLAS Academy — Lesson 6.11: The Strategy Journal [PRO]
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
// ANIMATION 1: Journal → Insight → Improvement cycle
// Circular flow: Record → Review → Discover → Adjust → Record
// ============================================================
function JournalCycleAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;
    const cx = w / 2;
    const cy = h / 2 + 5;
    const r = Math.min(w, h) * 0.28;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('The Journal Improvement Cycle', cx, 14);

    const steps = [
      { label: 'RECORD', icon: '📝', color: '#f59e0b', desc: 'Every trade, every detail' },
      { label: 'REVIEW', icon: '🔍', color: '#3b82f6', desc: 'Weekly pattern analysis' },
      { label: 'DISCOVER', icon: '💡', color: '#a78bfa', desc: 'Find what works & what fails' },
      { label: 'ADJUST', icon: '🔧', color: '#34d399', desc: 'Refine one thing at a time' },
    ];

    const activeIdx = Math.floor(t * 0.4) % 4;

    // Circle path
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();

    // Active arc
    const startAngle = (activeIdx / 4) * Math.PI * 2 - Math.PI / 2;
    const endAngle = ((activeIdx + 1) / 4) * Math.PI * 2 - Math.PI / 2;
    ctx.strokeStyle = `${steps[activeIdx].color}44`;
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(cx, cy, r, startAngle, endAngle); ctx.stroke();

    // Nodes
    steps.forEach((s, i) => {
      const angle = (i / 4) * Math.PI * 2 - Math.PI / 2;
      const nx = cx + r * Math.cos(angle);
      const ny = cy + r * Math.sin(angle);
      const isActive = i === activeIdx;

      // Node circle
      const nodeR = isActive ? 28 : 22;
      ctx.beginPath(); ctx.arc(nx, ny, nodeR, 0, Math.PI * 2);
      ctx.fillStyle = isActive ? `${s.color}22` : 'rgba(255,255,255,0.03)';
      ctx.fill();
      ctx.strokeStyle = isActive ? s.color : 'rgba(255,255,255,0.1)';
      ctx.lineWidth = isActive ? 2 : 1; ctx.stroke();

      // Icon
      ctx.font = `${isActive ? 18 : 14}px system-ui`;
      ctx.textAlign = 'center';
      ctx.fillText(s.icon, nx, ny + (isActive ? 6 : 5));

      // Label outside
      const labelR = r + 40;
      const lx = cx + labelR * Math.cos(angle);
      const ly = cy + labelR * Math.sin(angle);
      ctx.fillStyle = isActive ? s.color : 'rgba(255,255,255,0.3)';
      ctx.font = `${isActive ? 'bold ' : ''}9px system-ui`;
      ctx.fillText(s.label, lx, ly);
      if (isActive) {
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.font = '8px system-ui';
        ctx.fillText(s.desc, lx, ly + 13);
      }
    });

    // Arrows between nodes
    for (let i = 0; i < 4; i++) {
      const a1 = (i / 4) * Math.PI * 2 - Math.PI / 2 + 0.25;
      const a2 = ((i + 1) / 4) * Math.PI * 2 - Math.PI / 2 - 0.25;
      const ax = cx + (r - 1) * Math.cos((a1 + a2) / 2);
      const ay = cy + (r - 1) * Math.sin((a1 + a2) / 2);
      ctx.fillStyle = i === activeIdx ? `${steps[i].color}66` : 'rgba(255,255,255,0.1)';
      ctx.font = '10px system-ui';
      ctx.fillText('→', ax, ay + 4);
    }

    // Center text
    ctx.fillStyle = steps[activeIdx].color;
    ctx.font = 'bold 11px system-ui';
    ctx.fillText(steps[activeIdx].label, cx, cy - 2);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '8px system-ui';
    ctx.fillText('Current phase', cx, cy + 12);
  }, []);
  return <AnimScene drawFn={draw} height={290} />;
}

// ============================================================
// ANIMATION 2: With Journal vs Without — equity curve comparison
// Left: flat/declining (no learning). Right: steadily improving.
// ============================================================
function JournalImpactAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.008;
    const mid = w / 2;
    const pad = 20;
    const top = 42;
    const bot = h - 30;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('6 Months of Trading: Journal vs No Journal', mid, 14);

    ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(mid, top - 5); ctx.lineTo(mid, bot + 5); ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = 'bold 10px system-ui';
    ctx.fillStyle = '#ef4444'; ctx.textAlign = 'center';
    ctx.fillText('NO JOURNAL', mid / 2, 30);
    ctx.fillStyle = '#34d399';
    ctx.fillText('WITH JOURNAL', mid + mid / 2, 30);

    const seed = (n: number) => Math.sin(n * 127.1 + 311.7) * 0.5 + 0.5;
    const months = 6;
    const stepsPerMonth = 15;
    const totalSteps = months * stepsPerMonth;

    // No journal: flat, same mistakes repeated
    ctx.beginPath();
    let noJBal = 0;
    const noJBals: number[] = [];
    for (let i = 0; i < totalSteps; i++) {
      const wr = 0.45; // never improves
      const win = seed(i * 3) < wr;
      noJBal += win ? 150 : -100;
      noJBals.push(noJBal);
    }
    const noJMax = Math.max(...noJBals, 100);
    const noJMin = Math.min(...noJBals, -100);
    const noJRange = noJMax - noJMin || 1;
    noJBals.forEach((b, i) => {
      const px = pad + (i / (totalSteps - 1)) * (mid - pad * 2);
      const py = bot - ((b - noJMin) / noJRange) * (bot - top);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 1.5; ctx.stroke();

    // With journal: WR improves over time (learning from data)
    ctx.beginPath();
    let jBal = 0;
    const jBals: number[] = [];
    for (let i = 0; i < totalSteps; i++) {
      const month = Math.floor(i / stepsPerMonth);
      const wr = 0.42 + month * 0.025; // improves each month: 42→55%
      const rr = 1.6 + month * 0.08; // R:R improves too: 1.6→2.08
      const win = seed(i * 7 + 99) < wr;
      jBal += win ? 100 * rr : -100;
      jBals.push(jBal);
    }
    const jMax = Math.max(...jBals, 100);
    const jMin = Math.min(...jBals, -100);
    const jRange = jMax - jMin || 1;
    jBals.forEach((b, i) => {
      const px = mid + pad + (i / (totalSteps - 1)) * (mid - pad * 2);
      const py = bot - ((b - jMin) / jRange) * (bot - top);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    ctx.strokeStyle = '#34d399'; ctx.lineWidth = 1.5; ctx.stroke();

    // Month markers
    for (let m = 1; m <= months; m++) {
      const x1 = pad + (m * stepsPerMonth / totalSteps) * (mid - pad * 2);
      const x2 = mid + pad + (m * stepsPerMonth / totalSteps) * (mid - pad * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x1, top); ctx.lineTo(x1, bot); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x2, top); ctx.lineTo(x2, bot); ctx.stroke();
    }

    // Results
    ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
    ctx.fillStyle = noJBals[noJBals.length - 1] >= 0 ? '#34d399' : '#ef4444';
    ctx.fillText(`${noJBals[noJBals.length - 1] >= 0 ? '+' : ''}£${noJBals[noJBals.length - 1].toFixed(0)}`, mid / 2, bot + 14);
    ctx.fillStyle = '#34d399';
    ctx.fillText(`+£${jBals[jBals.length - 1].toFixed(0)}`, mid + mid / 2, bot + 14);

    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.font = '7px system-ui';
    ctx.fillText('Same mistakes month after month', mid / 2, bot + 25);
    ctx.fillText('Learns, adapts, improves each month', mid + mid / 2, bot + 25);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// DATA
// ============================================================
const journalFields = [
  { category: 'BEFORE ENTRY', fields: [
    { name: 'Date & Session', why: 'Reveals which sessions you perform best in. If 80% of your winners are in London, stop trading Asia.', example: '14 Apr 2026, London KZ (08:15 GMT)' },
    { name: 'Instrument & Timeframe', why: 'Tracks which instruments give you the best edge. You might discover Gold gives you 55% WR but EUR/USD only 40%.', example: 'XAUUSD 15M (bias from 4H)' },
    { name: 'Model & Setup', why: 'Separates Model 1 vs Model 2 performance. You might be great at continuations but terrible at reversals — the journal reveals this.', example: 'Model 1: BOS + pullback to OB at 2,332' },
    { name: 'Screenshot (before)', why: 'Visual proof of what the chart looked like BEFORE you entered. Prevents hindsight rewriting of "I always saw it."', example: 'TradingView screenshot with marked OB, BOS, entry level' },
  ]},
  { category: 'THE TRADE', fields: [
    { name: 'Entry Trigger', why: 'Tracks which triggers have the highest success rate. If engulfings win 55% but LTF BOS wins 62%, you know where to focus.', example: 'Bullish engulfing at OB low with 1.5x avg body size, above-avg volume' },
    { name: 'Entry / Stop / TP1 / TP2', why: 'The exact prices for R:R calculation. No estimation — exact numbers.', example: 'Entry: 2,332 | SL: 2,325 | TP1: 2,339 | TP2: 2,348' },
    { name: 'Position Size & Risk', why: 'Confirms you followed your sizing rules. If you risked 2.5% on a "confident" trade, the journal catches it.', example: '0.8 lots, £70 risk (0.7% of £10,000 account)' },
  ]},
  { category: 'AFTER EXIT', fields: [
    { name: 'Exit Price & Method', why: 'Did you exit at TP1 partial, trail exit, or manual close? Shows whether you are following management rules.', example: 'TP1 at 2,339 (50% closed). Trail exit at 2,345 on remaining 50%.' },
    { name: 'R:R Achieved', why: 'The actual outcome — not the planned one. If your planned R:R is 1:2 but average achieved is 1:1.3, your management is leaking profit.', example: '1:1 on first half, 1:1.9 on runner. Blended: 1:1.45' },
    { name: 'Win / Loss / BE', why: 'Binary classification for win rate tracking.', example: 'WIN' },
    { name: 'Screenshot (after)', why: 'Shows the complete trade on the chart. Compare with the "before" screenshot to see if the setup played out as expected.', example: 'Chart with entry, SL, TP1, exit marked' },
    { name: 'Emotional State', why: 'Track your emotional state during the trade. Patterns emerge: "I always move to BE early when anxious" or "I overtrade after a win."', example: 'Calm at entry. Anxious during pullback to +3. Relieved at TP1.' },
    { name: 'Lessons Learned', why: 'The most valuable field. One sentence about what this trade taught you. Over 100 trades, these notes become your personal trading education.', example: 'Wick rejection at OB was clean but I hesitated 2 candles. Need to trust the trigger faster.' },
  ]},
];

const reviewQuestions = [
  { q: 'Which session has the highest win rate?', insight: 'If London = 58% and Asia = 35%, stop trading Asia. You just increased your edge by removing your worst-performing time.' },
  { q: 'Which model (M1 vs M2) performs better?', insight: 'If M1 = 52% WR and M2 = 38% WR, allocate 80% of trades to M1 until M2 improves. Play to your strength.' },
  { q: 'Which trigger has the best results?', insight: 'If engulfings = 50% but LTF BOS = 61%, prioritise LTF BOS. You found your edge within the edge.' },
  { q: 'What is your average R:R achieved vs planned?', insight: 'If planned = 1:2 but achieved = 1:1.2, you are closing too early or your targets are unrealistic. Diagnose which.' },
  { q: 'How many trades did you take outside your rules?', insight: 'If 8 of 40 trades broke rules and 7 of those 8 lost, the evidence is clear: breaking rules costs money. Quantified.' },
  { q: 'What is the emotional pattern before your losses?', insight: 'If "anxious/frustrated/FOMO" appears before 70% of losses, your emotional state IS a trading signal — a signal to stop.' },
];

const gameRounds = [
  { scenario: 'A trader reviews his 3-month journal (90 trades). He discovers: London session WR = 56%, NY session WR = 48%, Asian session WR = 31%. He currently trades all 3 sessions equally. What should he do?', options: [
    { text: 'Keep trading all sessions — more trades = more profit', correct: false, explain: 'More trades only helps if those trades have positive EV. His Asian session trades have 31% WR — at typical R:R, this is deeply negative. He is LOSING money during Asia and giving it back.' },
    { text: 'Stop trading the Asian session immediately. Focus on London (best) and NY (acceptable). This removes his worst-performing trades and increases overall edge.', correct: true, explain: 'Correct. Eliminating Asian session trades removes ~30 negative-EV trades over 3 months. His blended WR jumps from ~45% to ~52% instantly — not because he got better, but because he stopped doing the thing that was hurting him. The journal revealed the leak; the fix was simple.' },
    { text: 'Trade MORE during the Asian session to get more data', correct: false, explain: '90 trades with 30 in Asia is enough data. 31% WR over 30 trades is a clear signal, not noise. More losing trades in Asia will not magically improve the rate.' },
    { text: 'Switch to Asian-specific strategy', correct: false, explain: 'Developing a new strategy for one session is a multi-month project. The immediate fix is removing the leak. He can research an Asian strategy LATER while profiting from London/NY NOW.' },
  ]},
  { scenario: 'After 60 trades, a trader\'s journal shows: Planned R:R = 1:2 on every trade. Actual average R:R achieved = 1:1.1. She closes TP1 at 1:1 correctly but her runners almost always get stopped at breakeven. What does the journal reveal?', options: [
    { text: 'Her entries are wrong — she is entering at bad levels', correct: false, explain: 'Her TP1 hits consistently (suggesting entries are fine). The issue is AFTER TP1 — the runners are not developing.' },
    { text: 'Her trailing method is too tight — the runners get stopped at BE because normal pullbacks hit the breakeven stop before the trend continues. She needs to either give runners more room or use structural trailing behind HLs instead of a tight trail.', correct: true, explain: 'Correct. The journal data shows: TP1 works (entries are good), but runners fail (management after TP1 is the problem). The fix is specific: either widen the trailing method (trail behind HLs, not arbitrary levels) or accept 1:1 as the realistic average and adjust expectations. Without the journal, she would not know WHERE the leak was.' },
    { text: 'She should stop using runners and close everything at 1:1', correct: false, explain: 'Closing everything at 1:1 reduces her average R:R even further (from 1:1.1 to exactly 1:1). Runners that occasionally work add significant value. The fix is to improve the trail, not eliminate runners.' },
    { text: 'She needs higher win rate — the R:R does not matter', correct: false, explain: 'At 1:1.1 R:R, she needs 48%+ WR to profit. Improving R:R from 1:1.1 to even 1:1.5 would drop the breakeven WR to 40%. The R:R improvement is a higher-leverage fix than chasing WR.' },
  ]},
  { scenario: 'A trader records his emotional state in every journal entry. After 80 trades, he notices: trades taken when "calm/focused" have 54% WR. Trades taken when "frustrated/FOMO/revenge" have 28% WR. He takes about 15 emotional trades per month. What is the journal telling him?', options: [
    { text: 'He should stop trading entirely — he is too emotional', correct: false, explain: 'He does not need to stop — he needs to stop trading when emotional. His calm trades are profitable. The emotional trades are the poison.' },
    { text: 'His emotional state IS a trading filter. When he detects frustration/FOMO/revenge, he should STOP trading for the session. This one change would eliminate 15 losing trades per month.', correct: true, explain: 'Correct. The journal quantified something he probably "felt" but never proved: emotional trades lose money. 15 emotional trades at 28% WR and typical R:R = approximately £200-400 in losses per month. Stopping when emotional is the single highest-ROI change he can make — and the journal gave him the proof.' },
    { text: 'He should trade more when frustrated to overcome the fear', correct: false, explain: 'Trading through frustration is the opposite of what the data says. 28% WR during emotional states is not a "fear to overcome" — it is a statistically proven leak to eliminate.' },
    { text: 'The emotional state tracking is unreliable — humans cannot accurately assess their own emotions', correct: false, explain: 'While self-assessment is imperfect, a 26-point WR gap (54% vs 28%) across 80 trades is far too large to be recording error. The pattern is real.' },
  ]},
  { scenario: 'A trader reviews his journal and finds: Model 1 (continuation) WR = 55%, 60 trades. Model 2 (reversal) WR = 35%, 20 trades. Model 2 average R:R = 1:3.2. Model 1 average R:R = 1:1.8. Should he stop using Model 2?', options: [
    { text: 'Yes — 35% WR is terrible, focus only on Model 1', correct: false, explain: 'Check the EV before deciding. Model 2: (0.35 × 3.2R) − (0.65 × 1R) = 1.12R − 0.65R = +0.47R per trade. That is VERY profitable.' },
    { text: 'No — Model 2 EV = +0.47R per trade (profitable despite low WR). Model 1 EV = +0.54R per trade. Both have positive edge. Keep both, but take fewer Model 2 trades (quality over quantity).', correct: true, explain: 'Correct. The journal shows both models are profitable. Model 1 is slightly better per trade (+0.54R vs +0.47R) but Model 2 still contributes. The insight is not "stop Model 2" but "be MORE selective with Model 2 setups" — only take the highest-confluence reversal setups to push that 35% closer to 40%.' },
    { text: 'Switch entirely to Model 2 — the higher R:R is more exciting', correct: false, explain: 'Model 1 has higher EV per trade AND higher frequency. Switching entirely to Model 2 would reduce both income and trade count. Use both, weighted toward your stronger model.' },
    { text: 'The sample is too small — 20 Model 2 trades means nothing', correct: false, explain: '20 trades is on the lower end, but with a 1:3.2 R:R, the positive EV at 35% WR is clear. More data would increase confidence, but the signal is already there. The recommendation to be "more selective" is safe regardless of sample size.' },
  ]},
  { scenario: 'A trader has been journaling for 4 months. He reads back through his "Lessons Learned" column. The same note appears 11 times: "Entered without waiting for trigger — FOMO." He is aware of the problem. What is the journal telling him that awareness alone does not?', options: [
    { text: 'Nothing extra — awareness is enough to fix it', correct: false, explain: 'He has been "aware" of the problem for 4 months and it has happened 11 times. Awareness without action is just frustration. The journal is telling him something stronger.' },
    { text: 'The journal quantifies the damage: 11 untriggered entries × his average loss on those trades = the EXACT cost of FOMO in pounds. This turns a vague "I should stop doing that" into "FOMO cost me £847 in 4 months." Money speaks louder than awareness.', correct: true, explain: 'Correct. The journal transforms "I know I should not do this" into "This specific mistake cost me £847, occurred 11 times, and was concentrated on Mondays and after losses." The quantification creates urgency that awareness alone never does. He can now calculate: fixing this one mistake = £200+/month of recovered profit.' },
    { text: 'He should delete the journal and start fresh to reset psychologically', correct: false, explain: 'Deleting the evidence of his mistakes is the opposite of learning from them. The journal IS the diagnostic tool. Deleting it is like a doctor throwing away blood test results because they show a problem.' },
    { text: 'He should change strategies since this one makes him FOMO', correct: false, explain: 'FOMO is a trader problem, not a strategy problem. He will FOMO on any strategy until he addresses the root behavior. The journal data gives him the specific context (when, how often, what it costs) to create a concrete plan.' },
  ]},
];

const quizQuestions = [
  { q: 'What is the PRIMARY purpose of a trading journal?', opts: ['To prove to others you are a good trader', 'To create a data-driven feedback loop that reveals patterns, leaks, and improvement opportunities you cannot see in real-time', 'To record profits for tax purposes', 'To remember what you traded'], correct: 1, explain: 'The journal is a diagnostic tool. It turns subjective experiences ("I think I trade well in London") into objective data ("London WR = 56%, Asia WR = 31%"). The data reveals patterns that feelings miss, and it quantifies the cost of mistakes so you are motivated to fix them.' },
  { q: 'Which journal field is MOST valuable for long-term improvement?', opts: ['Entry price', 'Win/Loss result', 'Lessons Learned — the one-sentence insight from each trade', 'Position size'], correct: 2, explain: 'Over 100+ trades, the "Lessons Learned" column becomes your personal trading textbook. Patterns emerge: "I always hesitate at the trigger", "Monday trades underperform", "Revenge trades after losses cost me." These insights drive specific, targeted improvements that raw numbers alone cannot provide.' },
  { q: 'How often should you review your journal in depth?', opts: ['After every trade', 'Daily', 'Weekly — enough data to see patterns, frequent enough to catch problems early', 'Monthly'], correct: 2, explain: 'Weekly reviews are the sweet spot. Daily is too granular (one trade tells you nothing). Monthly is too slow (a bad habit runs for 4 weeks before you catch it). Weekly gives you 5-15 trades to analyse — enough to spot patterns while keeping the feedback loop tight.' },
  { q: 'A trader\'s journal shows 8 of his last 40 trades broke his own rules. 7 of those 8 lost. What does this tell him?', opts: ['His rules are too strict', 'Rule-breaking trades have an 87.5% loss rate — following rules is statistically proven to be more profitable than breaking them. The cost of "just this once" is quantified.', 'He should remove the rules that get broken', '8 out of 40 is not significant'], correct: 1, explain: '7/8 rule-breaking trades lost = 87.5% loss rate. His rule-following trades presumably have a ~50% WR. The journal proves that "bending the rules for a good-looking setup" has a quantified cost. Every rule break costs approximately 1R. Over a year, this could be thousands of pounds — now he has the proof to stop.' },
  { q: 'Why should you record your emotional state in the journal?', opts: ['For mental health tracking', 'Because emotions correlate with trade outcomes — the journal reveals which emotional states precede your best and worst trades', 'To make the journal look more complete', 'Emotions are irrelevant to trading'], correct: 1, explain: 'The data typically shows: calm/focused trades outperform anxious/frustrated/FOMO trades by 15-25% in WR. This turns "manage your emotions" from generic advice into specific, measurable insight: "When I detect frustration, I should stop trading because my WR drops from 54% to 28%."' },
  { q: 'What should change when your journal shows Model 2 has a lower WR than Model 1?', opts: ['Stop using Model 2 immediately', 'Check the EV of both — lower WR with higher R:R might still be profitable. Adjust frequency, not elimination.', 'Use Model 2 more to get more practice', 'Switch to a different strategy entirely'], correct: 1, explain: 'Model 2 is designed for lower WR and higher R:R. A 35% WR with 1:3 R:R is +0.40R per trade (profitable). The journal should compare EV, not WR. If Model 2 EV is positive, keep it but be more selective about which setups you take.' },
  { q: 'A trader has journaled for 6 months but never done a formal review. He has 200+ trade entries. Is this useful?', opts: ['Yes — the data exists, so the improvement happened automatically', 'No — unreviewed data is just a diary. The value is in the REVIEW, not the recording. Data without analysis is wasted effort.', 'Partially — the act of writing is itself beneficial', 'He should delete it and start with better recording'], correct: 1, explain: 'Recording without reviewing is like taking an exam and never checking your score. The data has enormous potential value — but ONLY if he reviews it. He should do a comprehensive 6-month review immediately: calculate session-by-session WR, model-by-model EV, trigger-by-trigger performance, and emotional state correlations.' },
  { q: 'How many things should you try to improve at once based on journal insights?', opts: ['Everything — fix all problems simultaneously', 'ONE thing at a time. Implement one change, trade 30-50 trades with that change, then review the impact before adding another.', '3-4 changes per review cycle', 'None — just keep recording and the patterns will fix themselves'], correct: 1, explain: 'If you change 4 things at once and your results improve, you do not know WHICH change caused the improvement. Change ONE variable, trade a sufficient sample (30-50 trades), then measure the impact. This is the scientific method applied to trading. The journal makes it possible.' },
];

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

function Confetti({ active }: { active: boolean }) {
  if (!active) return null;
  return (<div className="fixed inset-0 pointer-events-none z-50">{Array.from({ length: 60 }).map((_, i) => (<motion.div key={i} initial={{ y: -20, x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400), opacity: 1 }} animate={{ y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 20, rotate: Math.random() * 720, opacity: 0 }} transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5 }} className="absolute w-2 h-2 rounded-sm" style={{ background: ['#f59e0b', '#d946ef', '#34d399', '#3b82f6', '#ef4444'][i % 5] }} />))}</div>);
}

export default function StrategyJournalLesson() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);

  const [openCategory, setOpenCategory] = useState<number | null>(null);
  const [openField, setOpenField] = useState<string | null>(null);
  const [openReview, setOpenReview] = useState<number | null>(null);

  // Interactive — Journal Health Check
  const [healthAnswers, setHealthAnswers] = useState<(number | null)[]>(Array(6).fill(null));
  const healthQs = [
    { q: 'Do you record every trade?', opts: ['No', 'Some trades', 'Every single trade'], weights: [0, 1, 2] },
    { q: 'Do you include screenshots?', opts: ['No', 'Sometimes', 'Before and after, every trade'], weights: [0, 1, 2] },
    { q: 'Do you record emotional state?', opts: ['No', 'Occasionally', 'Every trade'], weights: [0, 1, 2] },
    { q: 'Do you write lessons learned?', opts: ['No', 'For losses only', 'For every trade'], weights: [0, 1, 2] },
    { q: 'How often do you review?', opts: ['Never', 'Monthly', 'Weekly'], weights: [0, 1, 2] },
    { q: 'Have you made a change based on journal data?', opts: ['Never', 'Once', 'Multiple data-driven changes'], weights: [0, 1, 2] },
  ];
  const healthScore = healthAnswers.reduce((sum, a, i) => sum + (a !== null ? healthQs[i].weights[a] : 0), 0);
  const healthGrade = healthScore >= 10 ? 'A' : healthScore >= 7 ? 'B' : healthScore >= 4 ? 'C' : 'F';
  const healthColor = healthGrade === 'A' ? 'text-green-400' : healthGrade === 'B' ? 'text-sky-400' : healthGrade === 'C' ? 'text-amber-400' : 'text-red-400';
  const allHealthAnswered = healthAnswers.every(a => a !== null);

  // Mistakes
  const [openMistake, setOpenMistake] = useState<number | null>(null);
  const mistakes = [
    { title: 'Recording trades but never reviewing the data', desc: 'A journal you never read is a diary, not a diagnostic tool. The VALUE is in the weekly review — finding the session that loses money, the trigger that underperforms, the emotional pattern before losses. Recording without reviewing is 90% of the work for 0% of the benefit.' },
    { title: 'Only journaling losses (skipping winners)', desc: 'Winners contain just as much information as losers. Why did this trade win? Was the trigger especially clean? Was the session timing perfect? Winners reveal what to do MORE of. Losers reveal what to do LESS of. You need both.' },
    { title: 'Vague entries with no specifics', desc: '"Took a Gold trade, lost." This tells you nothing. Compare with: "Model 1 on Gold 15M. BOS at 2,340, OB at 2,332. Engulfing trigger during London. SL 2,325, TP1 2,339. Stopped out at 2,325. OB failed — price sliced through without rejection. Lesson: the OB was in the middle of the range, not at a HTF discount level."' },
    { title: 'Changing 5 things at once after a review', desc: 'If you change your trigger, your session timing, your R:R, your management, and your risk all at once — and results improve — you have no idea which change helped. Change ONE thing, trade 30-50 trades, measure the impact. Then change the next thing. Scientific method, not shotgun approach.' },
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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 6 &middot; Lesson 11</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">The Strategy<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Journal</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">Track, measure, improve. The tool that turns good traders into great ones.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* S00 */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">🔍 The Athlete&apos;s Playback System</p>
            <p className="text-gray-400 leading-relaxed mb-4">Every professional athlete reviews game footage after every match. Not because they enjoy watching themselves lose, but because the footage reveals patterns that feelings miss: the foot placement that caused the slip, the positioning that created the opening, the fatigue moment that led to the error.</p>
            <p className="text-gray-400 leading-relaxed">Your trading journal is your game footage. Without it, you are an athlete who plays every match but never watches the replay. You repeat the same mistakes month after month because you have no system to identify, quantify, and fix them.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">A trader journaled for 6 months (180 trades). His weekly reviews revealed: <strong className="text-green-400">London session WR = 57%</strong>, <strong className="text-red-400">Asian session WR = 29%</strong>. He was spending 8 hours/week on Asian trades that were costing him money. He stopped trading Asia. Over the next 3 months, his account grew <strong className="text-green-400">42% faster</strong> — not by getting better, but by stopping the thing that was hurting him. The journal found it. Awareness alone never did.</p>
          </div>
        </motion.div>
      </section>

      {/* S01 — Journal Cycle Animation */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Improvement Cycle</p>
          <h2 className="text-2xl font-extrabold mb-4">Record → Review → Discover → Adjust</h2>
          <p className="text-gray-400 text-sm mb-6">The journal is not a static record. It is a living feedback loop that makes you better every week.</p>
          <JournalCycleAnimation />
        </motion.div>
      </section>

      {/* S02 — Journal Impact Animation */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Impact</p>
          <h2 className="text-2xl font-extrabold mb-4">6 Months: Journal vs No Journal</h2>
          <p className="text-gray-400 text-sm mb-6">The trader without a journal repeats the same mistakes. The trader with a journal improves each month — better WR, better R:R, compounding growth.</p>
          <JournalImpactAnimation />
        </motion.div>
      </section>

      {/* S03 — What to Record */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; What to Record</p>
          <h2 className="text-2xl font-extrabold mb-4">The Complete Trade Record</h2>
          <p className="text-gray-400 text-sm mb-6">13 fields split into 3 phases. Open each category to see every field, why it matters, and an example.</p>
          <div className="space-y-4">
            {journalFields.map((cat, ci) => (
              <div key={ci}>
                <button onClick={() => setOpenCategory(openCategory === ci ? null : ci)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <p className="text-sm font-extrabold text-amber-400">{cat.category} ({cat.fields.length} fields)</p>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openCategory === ci ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openCategory === ci && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05] space-y-2">
                      {cat.fields.map((f, fi) => {
                        const fKey = `${ci}-${fi}`;
                        return (
                          <div key={fi}>
                            <button onClick={() => setOpenField(openField === fKey ? null : fKey)} className="w-full flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] text-left">
                              <p className="text-sm font-semibold text-white">{f.name}</p>
                              <ChevronDown className={`w-3 h-3 text-gray-600 transition-transform ${openField === fKey ? 'rotate-180' : ''}`} />
                            </button>
                            <AnimatePresence>{openField === fKey && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                <div className="p-3 bg-white/[0.01] space-y-2">
                                  <p className="text-xs text-gray-400"><strong className="text-sky-400">Why:</strong> {f.why}</p>
                                  <p className="text-xs text-gray-500"><strong className="text-gray-400">Example:</strong> {f.example}</p>
                                </div>
                              </motion.div>
                            )}</AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S04 — Weekly Review Questions */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The Weekly Review</p>
          <h2 className="text-2xl font-extrabold mb-4">6 Questions to Ask Your Data</h2>
          <p className="text-gray-400 text-sm mb-6">Every Sunday, ask these 6 questions. The answers drive your improvement.</p>
          <div className="space-y-3">
            {reviewQuestions.map((rq, i) => (
              <div key={i}>
                <button onClick={() => setOpenReview(openReview === i ? null : i)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <p className="text-sm font-semibold text-white">{i + 1}. {rq.q}</p>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openReview === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openReview === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-sm text-gray-400 leading-relaxed">💡 <strong className="text-amber-400">Insight:</strong> {rq.insight}</p></div>
                  </motion.div>
                )}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S05 — Interactive Journal Health Check */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Journal Health Check</p>
          <h2 className="text-2xl font-extrabold mb-2">Grade Your Current Journal</h2>
          <p className="text-gray-400 text-sm mb-6">How does your journaling practice measure up?</p>
          <div className="p-6 rounded-2xl glass-card space-y-4">
            {healthQs.map((q, qi) => (
              <div key={qi}>
                <p className="text-sm font-semibold text-white mb-2">{q.q}</p>
                <div className="flex flex-wrap gap-2">
                  {q.opts.map((opt, oi) => (
                    <button key={oi} onClick={() => { const next = [...healthAnswers]; next[qi] = oi; setHealthAnswers(next); }} className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${healthAnswers[qi] === oi ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-white/[0.04] text-gray-500 border border-white/[0.08] hover:bg-white/[0.07]'}`}>{opt}</button>
                  ))}
                </div>
              </div>
            ))}
            {allHealthAnswered && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center">
                <p className={`text-3xl font-black ${healthColor}`}>{healthGrade}</p>
                <p className="text-xs text-gray-500 mt-1">Journal Quality: {healthScore}/12</p>
                <p className="text-xs text-gray-400 mt-2">{healthGrade === 'A' ? 'Excellent practice. Your journal is a competitive advantage.' : healthGrade === 'B' ? 'Good foundation but missing some elements. Add the weak areas.' : healthGrade === 'C' ? 'Basic recording but the review and insights are lacking. Start weekly reviews.' : 'You are flying blind. Start with the 3 most important fields: entry/exit prices, win/loss, and lessons learned.'}</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </section>

      {/* S06 — The One-Change Rule */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; The One-Change Rule</p>
          <h2 className="text-2xl font-extrabold mb-4">Fix One Thing at a Time</h2>
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <p className="text-gray-400 leading-relaxed">Your journal will reveal multiple issues. The temptation is to fix everything at once. Resist it. Changing 5 things simultaneously means you cannot measure which change helped.</p>
            <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/15">
              <p className="text-sm font-extrabold text-green-400 mb-2">The Scientific Method for Trading</p>
              <p className="text-xs text-gray-400">1. Journal reveals the biggest leak (e.g., Asian session trading)</p>
              <p className="text-xs text-gray-400">2. Make ONE change (stop trading Asia)</p>
              <p className="text-xs text-gray-400">3. Trade 30-50 trades with the change</p>
              <p className="text-xs text-gray-400">4. Review: did the change improve results?</p>
              <p className="text-xs text-gray-400">5. If yes, keep it. If no, revert. Either way, move to the next issue.</p>
            </div>
            <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/15">
              <p className="text-sm text-gray-400 leading-relaxed">💡 <strong className="text-purple-400">The Lab Analogy:</strong> A scientist testing a new drug does not change the dosage, the timing, the delivery method, and the patient group all at once. They change ONE variable and measure the result. Your trading journal is your laboratory. One variable at a time.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S07 — Tools and Templates */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Tools &amp; Templates</p>
          <h2 className="text-2xl font-extrabold mb-4">Where to Keep Your Journal</h2>
          <div className="p-6 rounded-2xl glass-card space-y-3">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]"><p className="text-sm"><strong className="text-green-400">Spreadsheet (Google Sheets / Excel)</strong> <span className="text-gray-500">—</span> <span className="text-gray-400">Most flexible. Custom columns, formulas for auto-calculating WR, R:R, EV. Free. Best for traders who like data.</span></p></div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]"><p className="text-sm"><strong className="text-sky-400">Dedicated Journal App (Tradervue, TradeZella, Edgewonk)</strong> <span className="text-gray-500">—</span> <span className="text-gray-400">Auto-import trades. Built-in analytics. Cost £15-40/month. Best for traders who want analysis done for them.</span></p></div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]"><p className="text-sm"><strong className="text-amber-400">Notion / Notes App</strong> <span className="text-gray-500">—</span> <span className="text-gray-400">Good for screenshots and written reflections. Lacks automatic calculations. Best combined with a spreadsheet for the numbers.</span></p></div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]"><p className="text-sm"><strong className="text-purple-400">ATLAS Prop Dashboard</strong> <span className="text-gray-500">—</span> <span className="text-gray-400">Built-in trade journal with session tracking, R:R calculations, and narrative strips. Designed for the ATLAS workflow.</span></p></div>
          </div>
          <div className="mt-4 p-4 rounded-xl bg-sky-500/5 border border-sky-500/15">
            <p className="text-sm text-gray-400 leading-relaxed">💡 <strong className="text-sky-400">The best journal is the one you actually use.</strong> A simple spreadsheet that you fill in after every trade beats a £40/month app that you abandoned after a week. Start simple. Upgrade later if needed.</p>
          </div>
        </motion.div>
      </section>

      {/* S08 — Common Mistakes */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-6">4 Journal Killers</h2>
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
          <h2 className="text-2xl font-extrabold mb-4">Journal Quick Reference</h2>
          <div className="p-6 rounded-2xl glass-card space-y-3">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">RECORD</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Every trade. 13 fields. Screenshots before and after. Emotional state. Lessons learned.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-sky-400">REVIEW</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Weekly. 6 questions: session WR, model EV, trigger performance, R:R achieved vs planned, rule breaks, emotional patterns.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-green-400">CHANGE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">One thing at a time. 30-50 trades per change. Measure impact. Scientific method.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-purple-400">QUANTIFY</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Turn feelings into numbers. &ldquo;I think I lose in Asia&rdquo; → &ldquo;Asia WR = 29%, costing £340/month.&rdquo;</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-red-400">NEVER</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Skip trades. Review without acting. Change 5 things at once. Journal only losses.</span></p></div>
          </div>
        </motion.div>
      </section>

      {/* S10 — Game */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Test Your Understanding</p>
          <h2 className="text-2xl font-extrabold mb-2">Journal Analysis Game</h2>
          <p className="text-gray-400 text-sm mb-6">5 scenarios with real journal data. Find the insight and make the right call.</p>
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
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Excellent — you can extract actionable insights from journal data.' : gameScore >= 3 ? 'Solid — review the weekly review questions to sharpen your analysis.' : 'Re-read the recording fields and review process, then try again.'}</p></motion.div>)}
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
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-sky-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">📓</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 6: The Strategy Journal</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-sky-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Performance Analyst &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L6.11-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
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
