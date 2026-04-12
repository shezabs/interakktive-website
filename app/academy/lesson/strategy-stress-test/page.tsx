// app/academy/lesson/strategy-stress-test/page.tsx
// ATLAS Academy — Lesson 6.13: Strategy Stress Test [PRO]
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
// ANIMATION 1: Drawdown Waterfall — shows account declining
// then recovering, with psychological markers
// ============================================================
function DrawdownWaterfallAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.006;
    const pad = 30;
    const top = 42;
    const bot = h - 35;
    const chartW = w - pad * 2;
    const progress = Math.min(1, (t % 4.5) / 4);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Drawdown → Recovery: What Every Trader Will Experience', w / 2, 14);

    // Account balance path: grow → drawdown → recovery → grow
    const seed = (n: number) => Math.sin(n * 127.1 + 311.7) * 0.5 + 0.5;
    const totalBars = 80;
    const visBars = Math.floor(progress * totalBars);

    ctx.beginPath();
    let bal = 10000;
    let maxBal = 10000;
    let ddStart = -1;
    let ddEnd = -1;
    let maxDD = 0;
    const bals: number[] = [];

    for (let i = 0; i <= visBars; i++) {
      let phase: string;
      if (i < 20) { phase = 'grow'; const win = seed(i * 3) < 0.54; bal += win ? 200 : -100; }
      else if (i < 35) { phase = 'drawdown'; const win = seed(i * 3) < 0.30; bal += win ? 150 : -100; if (ddStart === -1) ddStart = i; ddEnd = i; }
      else if (i < 55) { phase = 'recover'; const win = seed(i * 3) < 0.52; bal += win ? 180 : -100; }
      else { phase = 'grow2'; const win = seed(i * 3) < 0.55; bal += win ? 200 : -100; }

      maxBal = Math.max(maxBal, bal);
      const dd = ((maxBal - bal) / maxBal) * 100;
      maxDD = Math.max(maxDD, dd);
      bals.push(bal);

      const px = pad + (i / totalBars) * chartW;
      const py = bot - ((bal - 8000) / 6000) * (bot - top);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }

    // Colour based on phase
    const visPhase = visBars < 20 ? 0 : visBars < 35 ? 1 : visBars < 55 ? 2 : 3;
    const colors = ['#34d399', '#ef4444', '#f59e0b', '#34d399'];
    ctx.strokeStyle = colors[visPhase]; ctx.lineWidth = 2; ctx.stroke();

    // Drawdown zone shading
    if (visBars > 20 && ddStart >= 0) {
      const ddStartX = pad + (ddStart / totalBars) * chartW;
      const ddEndX = pad + (Math.min(visBars, 55) / totalBars) * chartW;
      ctx.fillStyle = 'rgba(239,68,68,0.05)';
      ctx.fillRect(ddStartX, top, ddEndX - ddStartX, bot - top);
    }

    // Psychological markers
    const markers = [
      { bar: 22, label: '😰 Anxiety starts', y: 0.3 },
      { bar: 27, label: '😤 Frustration peaks', y: 0.2 },
      { bar: 32, label: '😱 "Strategy is broken"', y: 0.35 },
      { bar: 40, label: '🤔 Doubt: "stick or switch?"', y: 0.15 },
      { bar: 50, label: '💪 Recovery building', y: 0.25 },
      { bar: 65, label: '✅ New equity high', y: 0.1 },
    ];

    markers.forEach(m => {
      if (visBars > m.bar) {
        const px = pad + (m.bar / totalBars) * chartW;
        const py = top + m.y * (bot - top);
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.font = '8px system-ui'; ctx.textAlign = 'left';
        ctx.fillText(m.label, px + 4, py);
      }
    });

    // Max DD label
    if (visBars > 34) {
      ctx.fillStyle = 'rgba(239,68,68,0.6)';
      ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center';
      ctx.fillText(`Max Drawdown: ${maxDD.toFixed(1)}%`, w / 2, bot + 14);
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '8px system-ui';
      ctx.fillText('This is NORMAL for any positive-EV strategy', w / 2, bot + 26);
    }
  }, []);
  return <AnimScene drawFn={draw} height={310} />;
}

// ============================================================
// ANIMATION 2: Stress scenarios — 4 panels showing different
// stress events and their impact on a trade
// ============================================================
function StressScenariosAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;
    const activeIdx = Math.floor(t * 0.3) % 4;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('4 Stress Scenarios Your Strategy Must Survive', w / 2, 14);

    const scenarios = [
      { title: '10-Loss Streak', icon: '📉', desc: 'At 1% risk = 10% drawdown. At 2% risk = 20% drawdown. Can you survive psychologically?', impact: '-10% to -20%', color: '#ef4444' },
      { title: 'NFP Slippage', icon: '📰', desc: 'Your 10-pip stop gets filled at 25 pips due to news volatility. 2.5× planned risk on one trade.', impact: '-2.5% instead of -1%', color: '#f97316' },
      { title: 'Spread Widening', icon: '💸', desc: 'Gold spread goes from 0.3 to 3.0 pips during rollover. Your tight stop gets triggered by the spread alone.', impact: 'Stop hit by spread, not price', color: '#f59e0b' },
      { title: 'Flash Crash', icon: '⚡', desc: 'Market drops 200 pips in 3 seconds. Stops gap through. Platform freezes for 30 seconds.', impact: '-5% to -10% on one trade', color: '#ef4444' },
    ];

    const s = scenarios[activeIdx];
    const cx = w / 2;

    // Icon
    ctx.font = '40px system-ui'; ctx.textAlign = 'center';
    ctx.fillText(s.icon, cx, 70);

    // Title
    ctx.fillStyle = s.color; ctx.font = 'bold 16px system-ui';
    ctx.fillText(s.title, cx, 100);

    // Description
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '10px system-ui';
    const words = s.desc.split(' ');
    let line = '';
    let lineY = 125;
    words.forEach(word => {
      const test = line + word + ' ';
      if (ctx.measureText(test).width > w * 0.7) {
        ctx.fillText(line.trim(), cx, lineY);
        line = word + ' ';
        lineY += 16;
      } else {
        line = test;
      }
    });
    ctx.fillText(line.trim(), cx, lineY);

    // Impact
    ctx.fillStyle = s.color; ctx.font = 'bold 14px system-ui';
    ctx.fillText(`Impact: ${s.impact}`, cx, lineY + 30);

    // Question
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '10px system-ui';
    ctx.fillText('Would your account and your psychology survive this?', cx, h - 35);

    // Dots
    scenarios.forEach((_, i) => {
      ctx.beginPath(); ctx.arc(cx - 30 + i * 20, h - 15, 3, 0, Math.PI * 2);
      ctx.fillStyle = i === activeIdx ? scenarios[i].color : 'rgba(255,255,255,0.1)'; ctx.fill();
    });
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// DATA
// ============================================================
const stressTests = [
  { icon: '📉', name: 'Maximum Losing Streak', severity: 'CRITICAL', desc: 'Your backtest showed a max 7-loss streak. In live trading, expect 1.5×: 10-11 consecutive losses. At 1% risk, that is a 10-11% drawdown. At 2% risk, that is 20-22% — potentially account-ending for prop firms.', test: 'Calculate: (Backtest max streak × 1.5) × Risk% = Live max drawdown. If this exceeds 15%, reduce your risk per trade.', survival: 'At 1% risk, a 12-loss streak costs 12%. Painful but survivable. At 0.5% risk, the same streak costs 6%. Manageable. Your risk per trade must be sized so the WORST streak does not destroy you.' },
  { icon: '📰', name: 'News Event Slippage', severity: 'HIGH', desc: 'NFP, FOMC, CPI — these events create volatility spikes where your stop gets filled 10-20 pips beyond your intended level. A 10-pip stop might fill at 25 pips. That is 2.5× your planned risk on a single trade.', test: 'For every trade open during scheduled news: multiply your risk by 2-3×. If 3× risk on one trade would exceed your daily loss cap, close before the news event.', survival: 'Rule: close all short-term trades (15M, 1H) 15 minutes before major news. Keep only swing trades (4H+) open through news, and only if your stop is far enough from the current price to absorb the spike.' },
  { icon: '💸', name: 'Spread Widening', severity: 'HIGH', desc: 'Spreads widen during rollover (10PM-12AM GMT), low-liquidity periods, and news events. Gold can go from 0.3 to 5+ pips. EUR/USD from 0.1 to 3+ pips. A 10-pip stop with a 5-pip spread means you only have 5 pips of actual price movement before the stop triggers.', test: 'Add 3× normal spread to every stop as a "widening buffer." If your strategy only works with the minimum spread, it is too tight for real conditions.', survival: 'Avoid trading during rollover. Avoid opening new trades in the last 30 minutes before rollover. If you have open trades, ensure your stop has at least 2× the maximum expected spread as buffer.' },
  { icon: '⚡', name: 'Flash Crash / Gap', severity: 'CRITICAL', desc: 'CHF in 2015 moved 30% in minutes. GBP flash crash in 2016. Gold gaps on Sunday opens. Your stop does not execute at your level — it gaps through and fills at a much worse price. Slippage can be 50-200+ pips on extreme events.', test: 'Calculate: what happens if ONE trade loses 5× its planned risk (50-pip stop fills at 250 pips). If this would destroy your account, you are over-leveraged.', survival: 'Never risk more than 1% per trade. With 1% risk, a 5× slippage event costs 5% — severe but survivable. At 2%, the same event costs 10%. At 5%, it costs 25% — potentially unrecoverable. Leverage IS risk.' },
  { icon: '🔄', name: 'Regime Change', severity: 'HIGH', desc: 'Your trend strategy works for 4 months then the market enters a 2-month range. You keep trading and lose 15% before recognising the shift. The drawdown was not from bad trades — it was from applying the right strategy in the wrong conditions.', test: 'Simulate: remove all trades from your backtest that occurred during the "wrong" regime. What happens to your equity? If regime-wrong trades represent more than 20% of losses, you NEED a regime filter.', survival: 'ADX filter (ADX > 25 for trends, < 20 for ranges). Or simpler: if you lose 5+ trades in a row, stop and check whether the market regime has changed before taking the next trade.' },
  { icon: '🧠', name: 'Psychological Breakdown', severity: 'CRITICAL', desc: 'After a drawdown, you start revenge trading, increasing size, breaking rules, and overtrading. The drawdown itself might cost 8%. The psychological breakdown AFTER the drawdown costs another 12%. The compounded damage is 20% — most of it self-inflicted.', test: 'Honest question: during your last 5+ loss streak, did you follow every rule? If not, the psychological risk is your biggest threat. It is not the losing trades that blow accounts — it is the reaction to losing trades.', survival: 'Walk-away rule: after 3 consecutive losses, stop trading for the session. After 5 consecutive losses, stop for the day. After 2% daily loss, stop for the day. These hard limits prevent the emotional spiral that follows drawdowns.' },
];

const drawdownTable = [
  { dd: '5%', recovery: '5.3%', trades50: '~11', feeling: 'Annoying but manageable' },
  { dd: '10%', recovery: '11.1%', trades50: '~22', feeling: 'Uncomfortable. Doubt creeps in.' },
  { dd: '15%', recovery: '17.6%', trades50: '~35', feeling: 'Painful. "Is the strategy broken?"' },
  { dd: '20%', recovery: '25.0%', trades50: '~50', feeling: 'Severe. Most traders break rules here.' },
  { dd: '30%', recovery: '42.9%', trades50: '~86', feeling: 'Critical. Account potentially unrecoverable.' },
  { dd: '50%', recovery: '100%', trades50: '~200', feeling: 'Terminal. Need to double your money just to get back.' },
];

const gameRounds = [
  { scenario: 'Your backtest shows a max 8-loss streak. You risk 1.5% per trade on a £10,000 account. In live trading, you hit a 12-loss streak (1.5× the backtest max). What is your account balance after the streak?', options: [
    { text: '£8,200 — 12 × 1.5% = 18% drawdown, leaving £8,200', correct: true, explain: 'Correct. 12 × 1.5% = 18% drawdown. £10,000 × 0.82 = £8,200. This is an 18% hole that needs a 22% gain to recover. At +£25 EV per trade (after the streak), that is approximately 88 trades to recover — about 2-3 months at 8 trades/week. Can you psychologically handle 2-3 months of just recovering to breakeven?' },
    { text: '£8,800 — only 12% drawdown', correct: false, explain: '12 losses × 1.5% risk = 18%, not 12%. The loss compounds slightly too: after the first loss you have £9,850, so the second 1.5% is £147.75, not £150. The actual drawdown is closer to 16.6% with compounding, but the simple calculation gives 18%.' },
    { text: '£7,000 — 30% drawdown', correct: false, explain: '12 × 1.5% = 18%, not 30%. Though with revenge trading and emotional rule-breaking (which often follows long losing streaks), 30% is sadly realistic for many traders — the extra 12% comes from the REACTION to the drawdown, not the drawdown itself.' },
    { text: 'Impossible to calculate without more data', correct: false, explain: 'The calculation is straightforward: losses × risk per trade = approximate drawdown percentage. 12 × 1.5% = 18%. Simple maths that every trader should know BEFORE the streak happens.' },
  ]},
  { scenario: 'You have a Gold 15M trade open with a 12-pip stop. NFP is releasing in 10 minutes. The trade is currently at +4 pips. What should you do?', options: [
    { text: 'Hold through NFP — the setup is valid and you have a 4-pip buffer', correct: false, explain: 'NFP can move Gold 30-80 pips in seconds. Your 12-pip stop could get slipped to 25-35 pips. Your +4 buffer is meaningless against NFP volatility. Holding a 15M trade through major news is gambling, not managing.' },
    { text: 'Close at +4 pips profit before NFP. The risk of slippage far exceeds the potential gain. Protect the small win and re-enter after the news settles.', correct: true, explain: 'Correct. +4 pips in the bank beats a potential -25 pip slippage loss. After NFP volatility settles (15-30 minutes post-release), new setups will form. Close, protect capital, and re-assess. The 10-pip potential gain does not justify the 25-pip slippage risk.' },
    { text: 'Tighten the stop to +2 pips (lock in 2 pips profit)', correct: false, explain: 'A +2 pip stop during NFP will get slipped through instantly. Slippage during news events ignores stop levels — your +2 stop might fill at -15. The only safe action is to close the trade entirely before the event.' },
    { text: 'Double the position size to profit from the news move', correct: false, explain: 'Adding size before an unpredictable news event is pure gambling. The move could go in either direction, and slippage means even being "right" about the direction might result in a loss.' },
  ]},
  { scenario: 'Your strategy has been live for 5 months. Month 1: +£800. Month 2: +£600. Month 3: -£400. Month 4: -£200. Month 5: +£100. Total: +£900. But you have lost money for 2 consecutive months. A friend says "your strategy is dying." Is he right?', options: [
    { text: 'Yes — 2 consecutive losing months means the edge is gone', correct: false, explain: 'Two losing months is normal variance for any positive-EV strategy. Look at the TOTAL: +£900 over 5 months. The strategy is profitable. Consecutive losing months happen — even casinos have losing weeks.' },
    { text: 'No — the strategy is still net positive (+£900). Two losing months followed by a small positive month is normal variance. The total trajectory matters, not individual months.', correct: true, explain: 'Correct. Monthly results are noisy. What matters: (1) Total is positive (+£900), (2) The losing months (-£400, -£200) are smaller than the winning months (+£800, +£600), (3) Month 5 returned to positive. The trajectory is healthy. Your friend is looking at a 2-month window and ignoring the full picture.' },
    { text: 'Maybe — need to check if the market regime changed', correct: false, explain: 'Checking the regime is always good practice, but the overall numbers do not suggest a regime-caused failure. The losing months are moderate, and the strategy recovered in Month 5. This looks like normal variance, not regime failure.' },
    { text: 'He might be right — reduce risk to 0.5% until the strategy proves itself again', correct: false, explain: 'The strategy HAS proven itself — +£900 over 5 months is positive. Reducing risk based on 2 months of noise means you earn less during the recovery. If the EV is positive (which it is), maintain your risk. Do not punish a working strategy for normal variance.' },
  ]},
  { scenario: 'It is Sunday evening. Gold opens with a 40-pip gap down. You had a long trade open from Friday with a 15-pip stop at 2,330. Gold opens at 2,310 — 20 pips BELOW your stop. Your stop fills at 2,310, not 2,330. What happened and what do you learn?', options: [
    { text: 'The broker cheated you — stops should fill at the exact price', correct: false, explain: 'Stops are not guaranteed at the exact price. A stop is an order to close at the BEST AVAILABLE price once the stop level is breached. If the market gaps past your stop, the fill is at the gap open price, not your stop level. This is standard market mechanics, not broker fraud.' },
    { text: 'Weekend gap risk — your 15-pip stop became a 35-pip loss because the market gapped through it. Lesson: either close trades before the weekend or accept that weekend gaps can multiply your planned risk by 2-3×.', correct: true, explain: 'Correct. The gap added 20 pips to your planned 15-pip loss = 35 pips total (2.3× planned risk). This is a known risk of holding positions over the weekend. The defence is either: (1) Close all trades before Friday close, or (2) Only hold swing trades with stops far enough that a 40-pip gap would not significantly change the R:R, or (3) Accept the gap risk and size your position accordingly.' },
    { text: 'Move to a broker with guaranteed stops', correct: false, explain: 'Some brokers offer guaranteed stops for a premium (wider spread). This is an option but comes at a cost. The real lesson is understanding that gaps are a market reality and planning for them, not paying extra to avoid them.' },
    { text: 'Never trade Gold again — it is too risky', correct: false, explain: 'Gold gaps are a known, manageable risk. Every instrument gaps on Sunday opens and during news events. The fix is risk management (closing before weekends or sizing for gap risk), not avoiding the instrument.' },
  ]},
  { scenario: 'After a 7-loss streak, you feel the urge to: (a) double your next trade to "win it back," (b) take 3 trades at once to "catch up," and (c) skip your entry trigger because "the setup is good enough." You recognise these urges. What is the CORRECT response?', options: [
    { text: 'Follow one urge — doubling up on a strong setup is reasonable', correct: false, explain: 'Every urge (a, b, c) breaks a rule. Doubling size = wrong sizing. 3 simultaneous trades = overtrading. Skipping trigger = rule-breaking. Following ANY of them after a losing streak compounds the damage.' },
    { text: 'Recognise the psychological breakdown starting. Walk away for the session. Return tomorrow with fresh eyes and normal risk. The urges are symptoms of emotional damage, not trading intelligence.', correct: true, explain: 'Correct. The 7-loss streak is a drawdown (normal). The urges to revenge trade, overtrade, and break rules are a PSYCHOLOGICAL BREAKDOWN (dangerous). The drawdown costs 7%. The breakdown could cost another 10-15%. Walking away breaks the cycle. Your walk-away rules should already be in place: 3 consecutive losses = stop for the session.' },
    { text: 'Take all 3 actions — aggressive recovery is the fastest path back', correct: false, explain: 'Aggressive recovery is the fastest path to blowing the account. Doubling size (2%) × 3 trades × potential losses = 6% additional risk on top of the 7% drawdown. If all 3 lose (which is likely given the emotional state), you are down 13% and spiralling.' },
    { text: 'Switch to a different strategy — this one clearly is not working', correct: false, explain: 'Strategy hopping (Lesson 6.12, Killer #4). A 7-loss streak is within normal variance for any strategy. Switching abandons a potentially profitable strategy during a temporary drawdown and starts a new, untested one with zero data.' },
  ]},
];

const quizQuestions = [
  { q: 'Your backtest shows a max 6-loss streak. What should you prepare for in live trading?', opts: ['Exactly 6 losses', '9-10 consecutive losses (1.5× backtest max)', '3-4 losses (live is easier)', '0 losses if you follow the rules'], correct: 1, explain: 'Live trading adds slippage, emotional errors, and untested conditions. The rule of thumb: expect 1.5× your backtest max losing streak. 6 × 1.5 = 9-10. Size your risk so that 10 consecutive losses does not destroy your account or your psychology.' },
  { q: 'A 10% drawdown requires what percentage gain to recover?', opts: ['10%', '11.1%', '15%', '20%'], correct: 1, explain: '£10,000 → 10% drawdown = £9,000. To get back to £10,000: £1,000 ÷ £9,000 = 11.1%. The deeper the drawdown, the harder recovery becomes: 20% DD needs 25%, 30% DD needs 42.9%, 50% DD needs 100%. Drawdowns compound against you.' },
  { q: 'When should you close short-term trades before a major news event?', opts: ['Never — news creates opportunity', 'Only if you are in a loss', '15 minutes before the event — slippage risk exceeds potential gain', 'Only during Asian session'], correct: 2, explain: '15 minutes before major news (NFP, FOMC, CPI) gives time to close cleanly before volatility spikes. Slippage during news can turn a 10-pip stop into a 30-pip loss. The potential gain from holding through news does not justify the risk on short-term trades.' },
  { q: 'What is the "walk-away rule" and when does it activate?', opts: ['Walk away after every trade to avoid screen addiction', 'Walk away after your first loss to preserve capital', 'Stop trading for the session after 3 consecutive losses, for the day after reaching a 2% daily loss cap — prevents emotional spiral', 'Walk away only when you feel emotional'], correct: 2, explain: 'Fixed walk-away thresholds remove emotion from the decision. "3 losses = session over" and "2% daily cap = day over" are RULES, not suggestions. They prevent the psychological breakdown that follows drawdowns — the breakdown that typically costs more than the drawdown itself.' },
  { q: 'A weekend gap on Gold moves your 15-pip stop to a 40-pip fill. How do you prevent this in the future?', opts: ['Switch brokers', 'Use guaranteed stop-loss orders on every trade', 'Either close positions before the weekend, or size trades so that a 3× gap would still be within acceptable risk', 'Stop trading Gold'], correct: 2, explain: 'Weekend gaps are a market reality, not a broker problem. The solution is risk management: close before weekends (safest), or size your position so that 3× planned risk is still within your risk tolerance (e.g., risk 0.3% instead of 1% on Friday trades to allow for a 3× gap = 0.9%).' },
  { q: 'What is the most dangerous phase of a drawdown?', opts: ['The initial losses', 'The middle of the streak', 'The REACTION after the streak — revenge trading, oversizing, and rule-breaking that compounds the drawdown', 'The recovery phase'], correct: 2, explain: 'A 7-loss streak at 1% costs 7%. Manageable. But the revenge trading, doubled position sizes, and broken rules that follow the streak can cost another 10-15%. The compounded damage (7% + 12% = 19%) is mostly self-inflicted. The drawdown hurts. The reaction kills.' },
  { q: 'How should you size your risk if your max backtest losing streak is 8 and your prop firm maximum drawdown is 10%?', opts: ['1% risk — 8 losses = 8%, under the 10% limit', '0.8% risk — 12 losses (1.5× max) = 9.6%, just under the 10% limit with a buffer', '2% risk — 8 × 2% = 16%, the prop firm allows it', '0.5% risk — far too conservative'], correct: 1, explain: 'Expected live max streak = 8 × 1.5 = 12 losses. At 0.8% risk: 12 × 0.8% = 9.6% — under the 10% limit with a tiny buffer. At 1%: 12 × 1% = 12% — exceeds the 10% limit. The 0.8% sizing gives you enough room to survive the worst expected streak without breaching the prop firm cap.' },
  { q: 'Your strategy has been net positive for 6 months but had 2 losing months. Is the strategy working?', opts: ['No — losing months mean the edge is dying', 'Yes — net positive over 6 months with losing months is normal variance. Losing months are expected even in profitable strategies.', 'Only if the losing months were small', 'Cannot determine without 12 months of data'], correct: 1, explain: 'A positive-EV strategy WILL have losing days, losing weeks, and losing months. That is how variance works. The question is whether the NET result over a meaningful sample (6+ months) is positive. If yes, the strategy is working — the losing months are the price you pay for the winning months.' },
];

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

function Confetti({ active }: { active: boolean }) {
  if (!active) return null;
  return (<div className="fixed inset-0 pointer-events-none z-50">{Array.from({ length: 60 }).map((_, i) => (<motion.div key={i} initial={{ y: -20, x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400), opacity: 1 }} animate={{ y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 20, rotate: Math.random() * 720, opacity: 0 }} transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5 }} className="absolute w-2 h-2 rounded-sm" style={{ background: ['#f59e0b', '#d946ef', '#34d399', '#3b82f6', '#ef4444'][i % 5] }} />))}</div>);
}

export default function StrategyStressTestLesson() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);

  const [openTest, setOpenTest] = useState<number | null>(null);

  // Interactive — Stress Test Calculator
  const [stAccount, setStAccount] = useState('10000');
  const [stRisk, setStRisk] = useState('1');
  const [stMaxStreak, setStMaxStreak] = useState('8');
  const [stAvgWin, setStAvgWin] = useState('200');
  const [stAvgLoss, setStAvgLoss] = useState('100');
  const [stWR, setStWR] = useState('48');

  const account = parseFloat(stAccount) || 0;
  const risk = parseFloat(stRisk) || 0;
  const maxStreak = parseFloat(stMaxStreak) || 0;
  const avgWin = parseFloat(stAvgWin) || 0;
  const avgLoss = parseFloat(stAvgLoss) || 0;
  const wr = parseFloat(stWR) / 100 || 0;

  const liveMaxStreak = Math.ceil(maxStreak * 1.5);
  const maxDD = liveMaxStreak * risk;
  const ddAmount = account * (maxDD / 100);
  const accountAfterDD = account - ddAmount;
  const recoveryPct = ddAmount / accountAfterDD * 100;
  const ev = (wr * avgWin) - ((1 - wr) * avgLoss);
  const tradesToRecover = ev > 0 ? Math.ceil(ddAmount / ev) : Infinity;

  // Walk-away rules
  const [openWalkaway, setOpenWalkaway] = useState<number | null>(null);
  const walkawayRules = [
    { trigger: '3 consecutive losses', action: 'Stop trading for the rest of the session. Return next session with fresh eyes.', reason: '3 losses in a row activates frustration. The 4th trade is often emotional, not strategic.' },
    { trigger: '2% daily loss', action: 'Stop trading for the entire day. No exceptions.', reason: 'A 2% daily loss cap limits the damage from any single bad day. Without it, one bad session can cost 5%+.' },
    { trigger: '5% weekly loss', action: 'Stop trading for the week. Review journal. Identify the problem.', reason: '5% in a week suggests either a regime change or an emotional spiral. Either way, stepping back prevents further damage.' },
    { trigger: 'Recognised emotional state (anger, FOMO, revenge)', action: 'Close the platform immediately. Do not take "one more trade." Walk away for minimum 2 hours.', reason: 'Emotional states produce 75-85% losing trades. Every additional trade in this state compounds the damage.' },
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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 6 &middot; Lesson 13</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Strategy<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Stress Test</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">Break it before the market does. If your strategy survives these tests, it survives anything.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* S00 */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">🔍 The Earthquake Drill</p>
            <p className="text-gray-400 leading-relaxed mb-4">Japan builds every skyscraper to withstand a magnitude 9 earthquake — not because they expect one every week, but because when it comes, the building must survive. They do not build for average conditions. They build for the WORST conditions.</p>
            <p className="text-gray-400 leading-relaxed">Your trading strategy must survive its own earthquake: 10+ consecutive losses, news slippage that triples your risk, spread widening that triggers your stop, and the psychological breakdown that follows all of these. If you have not stress-tested for these scenarios, you are a skyscraper built for calm weather.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">A funded trader had a solid strategy: 51% WR, 1:2 R:R, 1% risk. Backtest max streak: 7. In month 4, he hit 11 consecutive losses (<strong className="text-red-400">11% drawdown</strong>) and panicked. He doubled his risk to "recover faster" and lost 4 more trades at 2% each (<strong className="text-red-400">+8% additional damage</strong>). Total: 19% drawdown. The prop firm cut him at 20%. If he had stayed at 1% through the streak, the 11 losses would have cost 11%, he would have recovered within 6 weeks, and he would still be funded.</p>
          </div>
        </motion.div>
      </section>

      {/* S01 — Drawdown Animation */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Drawdown Journey</p>
          <h2 className="text-2xl font-extrabold mb-4">What Every Trader Will Experience</h2>
          <p className="text-gray-400 text-sm mb-6">Watch an account go through a drawdown and recovery. Notice the psychological markers — these are the moments where most traders break.</p>
          <DrawdownWaterfallAnimation />
        </motion.div>
      </section>

      {/* S02 — Stress Scenarios Animation */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; 4 Stress Events</p>
          <h2 className="text-2xl font-extrabold mb-4">Your Strategy Must Survive All of These</h2>
          <StressScenariosAnimation />
        </motion.div>
      </section>

      {/* S03 — 6 Stress Tests */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The 6 Stress Tests</p>
          <h2 className="text-2xl font-extrabold mb-4">Run Each One on Your Strategy</h2>
          <div className="space-y-3">
            {stressTests.map((st, i) => (
              <div key={i}>
                <button onClick={() => setOpenTest(openTest === i ? null : i)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <div className="flex items-center gap-3"><span className="text-lg">{st.icon}</span><div><p className="text-sm font-extrabold text-white">{st.name}</p><p className="text-xs text-gray-500">Severity: <span className={st.severity === 'CRITICAL' ? 'text-red-400' : 'text-orange-400'}>{st.severity}</span></p></div></div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openTest === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openTest === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05] space-y-3">
                      <p className="text-sm text-gray-400 leading-relaxed">{st.desc}</p>
                      <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10"><p className="text-xs text-amber-400">🧪 <strong>The Test:</strong> {st.test}</p></div>
                      <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10"><p className="text-xs text-green-400">🛡️ <strong>Survival:</strong> {st.survival}</p></div>
                    </div>
                  </motion.div>
                )}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S04 — Drawdown Recovery Table */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The Drawdown Trap</p>
          <h2 className="text-2xl font-extrabold mb-4">Why Deep Drawdowns Are Exponentially Harder to Recover</h2>
          <div className="p-4 rounded-2xl glass-card overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="text-gray-500 border-b border-white/[0.06]">
                <th className="text-left py-2 pr-2">Drawdown</th><th className="text-left py-2 pr-2">Gain to Recover</th><th className="text-left py-2 pr-2">Trades at +£50 EV</th><th className="text-left py-2">How It Feels</th>
              </tr></thead>
              <tbody className="text-gray-400">
                {drawdownTable.map((r, i) => (
                  <tr key={i} className="border-b border-white/[0.03]">
                    <td className={`py-2 pr-2 font-bold ${i < 2 ? 'text-amber-400' : i < 4 ? 'text-orange-400' : 'text-red-400'}`}>{r.dd}</td>
                    <td className="py-2 pr-2">{r.recovery}</td>
                    <td className="py-2 pr-2">{r.trades50}</td>
                    <td className="py-2">{r.feeling}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-4 rounded-xl bg-sky-500/5 border border-sky-500/15">
            <p className="text-sm text-gray-400 leading-relaxed">💡 <strong className="text-sky-400">The asymmetry is the key insight.</strong> A 10% drawdown needs 11.1% to recover — manageable. A 50% drawdown needs 100% — you need to DOUBLE your remaining money. This is why risk per trade must be small enough that even the worst possible streak keeps you in recoverable territory (&lt;15%).</p>
          </div>
        </motion.div>
      </section>

      {/* S05 — Interactive Stress Test Calculator */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Stress Test Calculator</p>
          <h2 className="text-2xl font-extrabold mb-2">Stress Test YOUR Strategy</h2>
          <p className="text-gray-400 text-sm mb-6">Enter your numbers and see how the worst-case scenario plays out.</p>
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-xs text-gray-500 mb-1">Account (£)</p><input type="number" value={stAccount} onChange={e => setStAccount(e.target.value)} className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:border-amber-500/30 outline-none" /></div>
              <div><p className="text-xs text-gray-500 mb-1">Risk per Trade (%)</p><input type="number" value={stRisk} onChange={e => setStRisk(e.target.value)} className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:border-amber-500/30 outline-none" /></div>
              <div><p className="text-xs text-gray-500 mb-1">Backtest Max Losing Streak</p><input type="number" value={stMaxStreak} onChange={e => setStMaxStreak(e.target.value)} className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:border-amber-500/30 outline-none" /></div>
              <div><p className="text-xs text-gray-500 mb-1">Win Rate (%)</p><input type="number" value={stWR} onChange={e => setStWR(e.target.value)} className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:border-amber-500/30 outline-none" /></div>
              <div><p className="text-xs text-gray-500 mb-1">Avg Win (£)</p><input type="number" value={stAvgWin} onChange={e => setStAvgWin(e.target.value)} className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:border-amber-500/30 outline-none" /></div>
              <div><p className="text-xs text-gray-500 mb-1">Avg Loss (£)</p><input type="number" value={stAvgLoss} onChange={e => setStAvgLoss(e.target.value)} className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:border-amber-500/30 outline-none" /></div>
            </div>

            <div className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/15 space-y-3">
              <p className="text-xs font-bold text-amber-400 mb-2">WORST-CASE SCENARIO RESULTS:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="p-3 rounded-lg bg-white/[0.03] text-center"><p className="text-[10px] text-gray-500 uppercase">Expected Live Max Streak</p><p className="text-sm font-bold text-red-400">{liveMaxStreak} losses</p></div>
                <div className="p-3 rounded-lg bg-white/[0.03] text-center"><p className="text-[10px] text-gray-500 uppercase">Max Drawdown</p><p className={`text-sm font-bold ${maxDD > 15 ? 'text-red-400' : maxDD > 10 ? 'text-orange-400' : 'text-amber-400'}`}>{maxDD.toFixed(1)}%</p></div>
                <div className="p-3 rounded-lg bg-white/[0.03] text-center"><p className="text-[10px] text-gray-500 uppercase">Account After DD</p><p className="text-sm font-bold text-white">£{accountAfterDD.toFixed(0)}</p></div>
                <div className="p-3 rounded-lg bg-white/[0.03] text-center"><p className="text-[10px] text-gray-500 uppercase">£ Lost in DD</p><p className="text-sm font-bold text-red-400">-£{ddAmount.toFixed(0)}</p></div>
                <div className="p-3 rounded-lg bg-white/[0.03] text-center"><p className="text-[10px] text-gray-500 uppercase">Recovery Needed</p><p className="text-sm font-bold text-amber-400">{recoveryPct.toFixed(1)}%</p></div>
                <div className="p-3 rounded-lg bg-white/[0.03] text-center"><p className="text-[10px] text-gray-500 uppercase">Trades to Recover</p><p className="text-sm font-bold text-green-400">{tradesToRecover === Infinity ? '∞' : `~${tradesToRecover}`}</p></div>
              </div>
              <p className={`text-xs text-center ${maxDD > 15 ? 'text-red-400 font-bold' : maxDD > 10 ? 'text-orange-400' : 'text-green-400'}`}>
                {maxDD > 20 ? '⚠️ DANGER: Max drawdown exceeds 20%. Reduce risk per trade immediately.' : maxDD > 15 ? '⚠️ WARNING: Max drawdown exceeds 15%. Consider reducing to 0.5-0.8% risk.' : maxDD > 10 ? 'Moderate risk. Survivable but psychologically challenging.' : '✓ Manageable drawdown. Your sizing is appropriate for the expected worst case.'}
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S06 — Walk-Away Rules */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Walk-Away Rules</p>
          <h2 className="text-2xl font-extrabold mb-4">Hard Limits That Save Accounts</h2>
          <p className="text-gray-400 text-sm mb-6">These are NOT suggestions. They are circuit breakers that prevent the psychological spiral following drawdowns.</p>
          <div className="space-y-3">
            {walkawayRules.map((r, i) => (
              <div key={i}>
                <button onClick={() => setOpenWalkaway(openWalkaway === i ? null : i)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <p className="text-sm font-extrabold text-red-400">{r.trigger}</p>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openWalkaway === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openWalkaway === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05] space-y-2">
                      <p className="text-sm text-gray-400"><strong className="text-amber-400">Action:</strong> {r.action}</p>
                      <p className="text-sm text-gray-400"><strong className="text-sky-400">Why:</strong> {r.reason}</p>
                    </div>
                  </motion.div>
                )}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S07 — Prop Firm Stress Test */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Prop Firm Survival</p>
          <h2 className="text-2xl font-extrabold mb-4">Sizing for Funded Accounts</h2>
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <p className="text-gray-400 leading-relaxed">Prop firms typically allow 5-10% maximum drawdown. Your risk per trade must be sized so that the WORST expected streak stays under this limit.</p>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <p className="text-sm font-mono text-amber-400 text-center mb-2">Risk% = Max DD Allowed ÷ (Backtest Max Streak × 1.5)</p>
              <div className="space-y-2">
                <p className="text-xs text-gray-400"><strong className="text-white">5% DD limit, 8 max streak:</strong> 5 ÷ 12 = <strong className="text-green-400">0.42%</strong> per trade</p>
                <p className="text-xs text-gray-400"><strong className="text-white">8% DD limit, 8 max streak:</strong> 8 ÷ 12 = <strong className="text-green-400">0.67%</strong> per trade</p>
                <p className="text-xs text-gray-400"><strong className="text-white">10% DD limit, 8 max streak:</strong> 10 ÷ 12 = <strong className="text-green-400">0.83%</strong> per trade</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/15">
              <p className="text-sm text-gray-400 leading-relaxed">💡 <strong className="text-purple-400">The uncomfortable truth:</strong> most funded traders risk 1-2% per trade on accounts with 10% DD limits. With a 12-loss streak, that is 12-24% — instant breach. The math says 0.5-0.8% is the maximum safe risk. This feels painfully small, but it is the price of staying funded.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S08 — Common Mistakes */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-6">4 Stress Test Failures</h2>
          <div className="p-6 rounded-2xl glass-card space-y-3">
            <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15"><p className="text-sm text-gray-400"><strong className="text-red-400">1. "That streak would never happen to me"</strong> — It will. Every statistical anomaly eventually occurs. The question is not IF but WHEN. Size for it NOW.</p></div>
            <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15"><p className="text-sm text-gray-400"><strong className="text-red-400">2. Increasing risk after a drawdown to "recover faster"</strong> — This is the #1 account killer. After a 10% DD, doubling risk means the NEXT losing streak costs 20% instead of 10%. Recovery gets harder, not easier.</p></div>
            <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15"><p className="text-sm text-gray-400"><strong className="text-red-400">3. No walk-away rules</strong> — Without hard limits, you trade through emotional spirals. The 7-loss drawdown (7%) becomes a 15% catastrophe because you took 8 more emotional trades trying to recover.</p></div>
            <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15"><p className="text-sm text-gray-400"><strong className="text-red-400">4. Holding trades through major news</strong> — Your 10-pip stop becomes a 30-pip loss through slippage. One news event can cost 3× your planned risk. Close short-term trades before scheduled releases.</p></div>
          </div>
        </motion.div>
      </section>

      {/* S09 — Cheat Sheet */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Cheat Sheet</p>
          <h2 className="text-2xl font-extrabold mb-4">Stress Test Quick Reference</h2>
          <div className="p-6 rounded-2xl glass-card space-y-3">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-red-400">MAX STREAK</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Backtest max &times; 1.5. Size risk so this does not exceed 15%.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">NEWS</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Close short-term trades 15 min before NFP/FOMC/CPI. No exceptions.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-sky-400">SPREAD</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Avoid trading during rollover. Add 3&times; normal spread buffer to stops.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-green-400">WALK-AWAY</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">3 losses = session over. 2% daily = day over. 5% weekly = week over.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-purple-400">PROP SIZING</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Risk% = DD limit &divide; (max streak &times; 1.5). Usually 0.5-0.8% per trade.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-red-400">NEVER</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Increase risk after a drawdown. Hold through major news on 15M. Skip walk-away rules.</span></p></div>
          </div>
        </motion.div>
      </section>

      {/* S10 — Game */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Test Your Understanding</p>
          <h2 className="text-2xl font-extrabold mb-2">Stress Test Game</h2>
          <p className="text-gray-400 text-sm mb-6">5 worst-case scenarios. Make the survival call.</p>
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
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Excellent — your strategy can survive the worst the market throws at it.' : gameScore >= 3 ? 'Solid — review the walk-away rules and drawdown recovery maths.' : 'Re-read the 6 stress tests and the drawdown table, then try again.'}</p></motion.div>)}
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
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-3xl shadow-lg shadow-orange-500/30">🔥</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 6: Strategy Stress Test</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-orange-400 via-red-400 to-orange-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Stress Survivor &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L6.13-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
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
