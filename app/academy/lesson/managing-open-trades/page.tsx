// app/academy/lesson/managing-open-trades/page.tsx
// ATLAS Academy — Lesson 7.7: Managing Open Trades [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 7
// GROUNDBREAKING: Live Trade Management Simulator with phase-by-phase decisions
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
// ANIMATION 1: Trade Lifecycle — Full annotated journey
// Entry → SL → +0.5R → TP1 partial → BE move → Trail → Exit
// ============================================================
function TradeLifecycleAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.004;
    const pad = 25;
    const top = 50;
    const bot = h - 35;
    const progress = Math.min(1, (t % 8) / 6.5);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('The 5 Phases of Trade Management', w / 2, 14);

    // Price path with management phases
    const totalPts = 100;
    const visPts = Math.floor(progress * totalPts);
    const seed = (n: number) => Math.sin(n * 127.1 + 311.7) * 0.5 + 0.5;

    const entry = 2340;
    const sl = 2328;
    const tp1 = 2352; // 1:1
    const tp2 = 2364; // 1:2

    const getPrice = (i: number): number => {
      const norm = i / totalPts;
      let base = entry;
      const noise = (seed(i * 3) - 0.5) * 4;
      if (norm < 0.15) base = entry + norm * 40 + noise; // initial move
      else if (norm < 0.25) base = entry + 6 - (norm - 0.15) * 60 + noise; // pullback near entry
      else if (norm < 0.45) base = entry + (norm - 0.1) * 50 + noise; // climb to TP1
      else if (norm < 0.55) base = tp1 + (norm - 0.45) * 20 + noise; // past TP1
      else if (norm < 0.7) base = tp1 + 4 - (norm - 0.55) * 30 + noise; // pullback to BE
      else if (norm < 0.85) base = tp1 + (norm - 0.55) * 40 + noise; // runner push
      else base = tp2 + (norm - 0.85) * 10 + noise; // near TP2
      return base;
    };

    const py = (p: number) => bot - ((p - (sl - 5)) / ((tp2 + 10) - (sl - 5))) * (bot - top);
    const chartW = w - pad * 2;

    // Draw price line
    ctx.beginPath();
    for (let i = 0; i <= visPts; i++) {
      const x = pad + (i / totalPts) * chartW;
      const y = py(getPrice(i));
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#34d399'; ctx.lineWidth = 2; ctx.stroke();

    // Entry line
    ctx.strokeStyle = 'rgba(59,130,246,0.5)'; ctx.setLineDash([3,3]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad, py(entry)); ctx.lineTo(pad + chartW, py(entry)); ctx.stroke();
    ctx.fillStyle = '#3b82f6'; ctx.font = '8px system-ui'; ctx.textAlign = 'left';
    ctx.fillText('Entry: 2,340', pad + 3, py(entry) - 5);

    // SL line
    ctx.strokeStyle = 'rgba(239,68,68,0.5)';
    ctx.beginPath(); ctx.moveTo(pad, py(sl)); ctx.lineTo(pad + chartW, py(sl)); ctx.stroke();
    ctx.fillStyle = '#ef4444';
    ctx.fillText('SL: 2,328', pad + 3, py(sl) + 12);

    // TP1 line
    if (visPts > 40) {
      ctx.strokeStyle = 'rgba(245,158,11,0.5)';
      ctx.beginPath(); ctx.moveTo(pad, py(tp1)); ctx.lineTo(pad + chartW, py(tp1)); ctx.stroke();
      ctx.fillStyle = '#f59e0b';
      ctx.fillText('TP1: 2,352 (1:1)', pad + 3, py(tp1) - 5);
    }

    // TP2 line
    if (visPts > 70) {
      ctx.strokeStyle = 'rgba(168,85,247,0.4)';
      ctx.beginPath(); ctx.moveTo(pad, py(tp2)); ctx.lineTo(pad + chartW, py(tp2)); ctx.stroke();
      ctx.fillStyle = '#a855f7';
      ctx.fillText('TP2: 2,364 (1:2)', pad + 3, py(tp2) - 5);
    }
    ctx.setLineDash([]);

    // Phase labels at bottom
    const phases = [
      { start: 0, end: 0.15, label: 'HOLD', color: '#3b82f6' },
      { start: 0.15, end: 0.25, label: 'SURVIVE', color: '#ef4444' },
      { start: 0.25, end: 0.45, label: 'APPROACH TP1', color: '#f59e0b' },
      { start: 0.45, end: 0.55, label: 'PARTIAL + BE', color: '#34d399' },
      { start: 0.55, end: 1, label: 'TRAIL RUNNER', color: '#a855f7' },
    ];

    phases.forEach(p => {
      if (progress >= p.start) {
        const startX = pad + p.start * chartW;
        const endX = pad + Math.min(progress, p.end) * chartW;
        const midX = (startX + endX) / 2;
        ctx.fillStyle = p.color; ctx.font = 'bold 8px system-ui'; ctx.textAlign = 'center';
        ctx.fillText(p.label, midX, bot + 14);
        // Phase marker line
        ctx.strokeStyle = p.color + '30'; ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(startX, top); ctx.lineTo(startX, bot); ctx.stroke();
      }
    });

    // Management actions
    if (visPts > 45) {
      const tp1X = pad + 0.45 * chartW;
      ctx.fillStyle = 'rgba(52,211,153,0.8)'; ctx.font = 'bold 9px system-ui'; ctx.textAlign = 'center';
      ctx.fillText('Close 50%', tp1X, py(tp1) + 20);
      ctx.fillText('Move SL → BE', tp1X, py(tp1) + 32);
    }
    if (visPts > 70) {
      const trailX = pad + 0.72 * chartW;
      ctx.fillStyle = 'rgba(168,85,247,0.8)'; ctx.font = 'bold 9px system-ui';
      ctx.fillText('Trail behind HLs', trailX, py(entry) + 15);
    }
  }, []);
  return <AnimScene drawFn={draw} height={300} />;
}

// ============================================================
// ANIMATION 2: Emotion-to-Error Map
// Shows which emotions cause which management errors
// ============================================================
function EmotionErrorAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.006;
    const cx = w / 2;
    const cycle = t % 8;
    const activeIdx = Math.min(3, Math.floor(cycle * 0.6));

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('The Emotion → Error → Damage Chain', cx, 16);

    const chains = [
      { emotion: '😰 FEAR', trigger: 'Trade at −2 pips', error: 'Close too early or move SL wider', damage: 'Miss +£240 winner OR take 3× planned risk', emotionColor: '#ef4444', x: cx, y: 55 },
      { emotion: '🤑 GREED', trigger: 'Trade at +1R profit', error: 'Move TP further or skip partials', damage: 'Price reverses. +£240 becomes +£40 or −£80', emotionColor: '#f59e0b', x: cx, y: 125 },
      { emotion: '😤 FRUSTRATION', trigger: '2 losses today', error: 'Increase size on next trade to "recover"', damage: '3rd loss at 2× size = 6% DD instead of 3%', emotionColor: '#ef4444', x: cx, y: 195 },
      { emotion: '😌 COMPLACENCY', trigger: '4-trade winning streak', error: 'Skip the management plan — "I can feel the market"', damage: 'Unmanaged trade hits full SL. Gives back 3 wins.', emotionColor: '#a855f7', x: cx, y: 265 },
    ];

    const colW = (w - 60) / 4;

    // Headers
    ctx.font = 'bold 8px system-ui'; ctx.textAlign = 'center';
    const headers = ['EMOTION', 'TRIGGER', 'ERROR', 'DAMAGE'];
    const headerColors = ['#ef4444', '#f59e0b', '#f59e0b', '#ef4444'];
    headers.forEach((h, i) => {
      ctx.fillStyle = headerColors[i];
      ctx.fillText(h, 30 + i * colW + colW / 2, 38);
    });

    chains.forEach((chain, i) => {
      const alpha = i <= activeIdx ? 1 : 0.15;
      const current = i === activeIdx;
      ctx.globalAlpha = alpha;

      const y = chain.y;
      const cols = [chain.emotion, chain.trigger, chain.error, chain.damage];

      cols.forEach((text, ci) => {
        const x = 30 + ci * colW;
        const bg = current && ci === 0 ? chain.emotionColor + '15' : 'rgba(255,255,255,0.02)';
        ctx.fillStyle = bg;
        ctx.beginPath(); ctx.roundRect(x, y - 12, colW - 4, 38, 6); ctx.fill();

        ctx.fillStyle = ci === 0 ? chain.emotionColor : ci === 3 ? '#ef4444' : 'rgba(255,255,255,0.6)';
        ctx.font = ci === 0 ? 'bold 10px system-ui' : '9px system-ui';
        ctx.textAlign = 'center';

        // Word wrap
        const words = text.split(' ');
        let line = '';
        let lineY = y + 2;
        words.forEach(word => {
          const test = line + word + ' ';
          if (ctx.measureText(test).width > colW - 12) {
            ctx.fillText(line.trim(), x + colW / 2, lineY);
            line = word + ' ';
            lineY += 11;
          } else { line = test; }
        });
        ctx.fillText(line.trim(), x + colW / 2, lineY);

        // Arrow between columns
        if (ci < 3) {
          ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.font = '10px system-ui';
          ctx.fillText('→', x + colW - 2, y + 5);
        }
      });

      ctx.globalAlpha = 1;
    });
  }, []);
  return <AnimScene drawFn={draw} height={310} />;
}

// ============================================================
// LIVE TRADE MANAGEMENT SIMULATOR
// Student is IN a trade. Price evolves through 5 phases.
// At each phase, choose: HOLD / PARTIAL / TRAIL / CLOSE
// ============================================================
interface SimPhase {
  desc: string;
  priceInfo: string;
  pnlPips: number;
  emotion: string;
  options: { label: string; correct: boolean; feedback: string }[];
}

interface SimScenario {
  title: string;
  instrument: string;
  entry: string;
  sl: string;
  tp1: string;
  tp2: string;
  direction: 'LONG' | 'SHORT';
  phases: SimPhase[];
}

const simScenarios: SimScenario[] = [
  {
    title: 'Gold — Textbook Continuation',
    instrument: 'XAUUSD', entry: '2,331', sl: '2,323', tp1: '2,339 (1:1)', tp2: '2,347 (1:2)', direction: 'LONG',
    phases: [
      { desc: 'Entry filled. Price immediately drops 3 pips to 2,328. You are −3 pips. Your SL is at 2,323 (5 pips away).', priceInfo: 'Price: 2,328 | P&L: −3 pips', pnlPips: -3, emotion: 'Anxiety spikes. "Did I enter too early?"',
        options: [
          { label: 'HOLD — SL is structural, thesis not invalidated', correct: true, feedback: 'Correct. Your SL is below the OB at 2,323. Price at 2,328 is normal retest noise. The thesis is intact. Lesson 7.4 step 8: hands off, let it breathe.' },
          { label: 'CLOSE — cut the loss before it gets worse', correct: false, feedback: '−3 pips on Gold is the spread. Closing here guarantees a loss on a trade that has not even tested your stop. Your structural SL exists for exactly this — trust it.' },
          { label: 'Move SL to 2,326 (wider) to give it room', correct: false, feedback: 'Moving your stop WIDER increases your risk from 8 to 11 pips. This is fear-based management. Your stop was placed structurally — moving it wider means you are risking more with no additional edge.' },
        ]
      },
      { desc: 'Price recovers. You are now at +4 pips (2,335). Candle is bullish. Momentum looks good.', priceInfo: 'Price: 2,335 | P&L: +4 pips', pnlPips: 4, emotion: 'Relief. Temptation to move to breakeven.',
        options: [
          { label: 'HOLD — TP1 not hit yet, no action required', correct: true, feedback: 'Correct. Your management plan says: "Partial at TP1 (2,339), then move to BE." You are at +4 pips — TP1 is still 4 pips away. No action needed. Follow the plan, not the relief.' },
          { label: 'Move SL to breakeven — lock in the risk-free trade', correct: false, feedback: 'BE before TP1 means you get stopped out on normal noise. A 4-pip pullback from +4 would stop you at BE — and the trade then hits TP1. Level 6 Lesson 8 was clear: BE happens AFTER TP1.' },
          { label: 'CLOSE at +4 — take the small profit', correct: false, feedback: '+4 pips on an 8-pip risk = 0.5R. Your plan targets 1:2 (16 pips). Closing here captures 25% of the potential move. Over 100 trades, this habit destroys your expectancy.' },
        ]
      },
      { desc: 'Price hits TP1 at 2,339. You are at +8 pips (1:1 R:R). Decision time.', priceInfo: 'Price: 2,339 | P&L: +8 pips (1:1)', pnlPips: 8, emotion: 'Excitement. "Should I close everything or let it run?"',
        options: [
          { label: 'PARTIAL — close 50% at TP1, move SL to breakeven on the runner', correct: true, feedback: 'Correct! The ATLAS management plan: 50% off at TP1 (+4 pips locked in), SL moved to breakeven on remaining 50%. The runner is now a FREE TRADE — it can only win or breakeven. This is the highest-EV management decision.' },
          { label: 'CLOSE ALL — 1:1 is good enough', correct: false, feedback: '1:1 R:R on every trade requires 50%+ WR to be profitable. By closing all at TP1, you eliminate the possibility of capturing the 1:2 or 1:3 runners that make strategies truly profitable. Half now, runner later.' },
          { label: 'HOLD ALL — do not take partials, aim for full TP2', correct: false, feedback: 'Holding 100% to TP2 is greedy. If price reverses from TP1, you give back the entire profit. The partial locks in guaranteed profit while keeping the runner alive. Risk management over ambition.' },
        ]
      },
      { desc: 'After partials and BE move, price pulls back to 2,333 (your BE level). Your runner is at +0 pips. Price touches your BE stop and bounces.', priceInfo: 'Price: 2,333 (at BE) | Runner P&L: ±0', pnlPips: 0, emotion: 'Panic. "Should I close before it goes negative?" The runner is free — it cannot lose.',
        options: [
          { label: 'HOLD — BE was tested and held. The runner is risk-free. Let it work.', correct: true, feedback: 'Correct. The BE move was exactly for this scenario. You locked in profit on 50%. The runner tested BE and bounced — the structure is holding. If it had closed below BE, the runner exits at ±0 (no loss). The free trade lives.' },
          { label: 'CLOSE at BE — the pullback means the trade is failing', correct: false, feedback: 'The runner is at breakeven — you cannot lose on it. Closing a free trade because of a pullback removes your chance at the 1:2+ runner. Price testing BE is normal. Level 6 Lesson 8: trust the management plan.' },
          { label: 'Move SL below the last HL to give the runner more room', correct: false, feedback: 'Moving your stop from BE back to a loss-risking level defeats the purpose of the BE move. Once at breakeven, your stop only moves in ONE direction: tighter (trailing), never wider.' },
        ]
      },
      { desc: 'Price pushes through TP1 again and reaches 2,345. Your runner is now at +14 pips. Price makes a higher low at 2,341. TP2 is at 2,347 (2 pips away).', priceInfo: 'Price: 2,345 | Runner P&L: +14 pips', pnlPips: 14, emotion: 'Greed. "What if it goes to 2,360? Should I move TP2 further?"',
        options: [
          { label: 'TRAIL — move stop behind the HL at 2,340. If TP2 hits, close. If it reverses, trail catches at +9.', correct: true, feedback: 'Correct! Trail the runner behind the last higher low (2,340). TP2 is 2 pips away — likely to hit. If it reverses from here, the trail catches the runner at +9 pips (not +0 from BE). You have maximised the outcome of this trade.' },
          { label: 'Move TP2 to 2,360 — this trade could be a 1:3+', correct: false, feedback: 'Moving your TP AFTER the trade is live is greed-based management. Your plan set TP2 at 2,347 for a structural reason (supply level). Moving it further hopes for more without evidence. Take the 1:2 as planned.' },
          { label: 'CLOSE ALL at +14 — do not risk giving it back', correct: false, feedback: '+14 pips is excellent, but TP2 is only 2 pips away. Closing now captures 1:1.75 instead of 1:2. With a trail at 2,340, your WORST case is +9 pips. The risk of the last 2 pips is minimal — let the plan complete.' },
        ]
      },
    ]
  },
  {
    title: 'EUR/USD — The Losing Trade',
    instrument: 'EURUSD', entry: '1.0842', sl: '1.0854', tp1: '1.0830 (1:1)', tp2: '1.0818 (1:2)', direction: 'SHORT',
    phases: [
      { desc: 'Entry filled SHORT at 1.0842. Price immediately pushes UP 4 pips to 1.0846. You are −4 pips. SL is at 1.0854 (8 pips away).', priceInfo: 'Price: 1.0846 | P&L: −4 pips', pnlPips: -4, emotion: 'Doubt. "Did I read the structure wrong?"',
        options: [
          { label: 'HOLD — 4 pips against on EUR/USD is normal fluctuation. SL is structural.', correct: true, feedback: 'Correct. EUR/USD routinely moves 4-6 pips against you after entry — this is spread recovery + normal noise. Your SL at 1.0854 is the level where your thesis is genuinely wrong. −4 pips is not wrong, it is early.' },
          { label: 'CLOSE — the instant move against you is a bad sign', correct: false, feedback: 'EUR/USD moves against you on 60-70% of entries within the first 5 minutes. It is the most liquid pair in the world — every entry gets tested. Closing at −4 confirms a loss on a trade that had an 8-pip planned risk.' },
          { label: 'Add to the SHORT — price is now at a better level', correct: false, feedback: 'Adding to a losing position without a new independent setup is averaging down. Your original thesis has not been confirmed yet (price has not moved in your direction). Adding risk to a trade going against you is compounding hope.' },
        ]
      },
      { desc: 'Price continues rising. You are now at −8 pips (1.0850). SL is 4 pips away at 1.0854. The pressure is intense.', priceInfo: 'Price: 1.0850 | P&L: −8 pips | SL: 4 pips away', pnlPips: -8, emotion: 'Full anxiety. "Move the stop? Close? Hold?" Your hand hovers over the close button.',
        options: [
          { label: 'HOLD — SL is the plan. If it hits, I accept the loss as planned.', correct: true, feedback: 'Correct. This is the hardest decision in trading: doing NOTHING when every instinct screams to do something. Your SL is structural. The planned loss is 12 pips (−£120 at 1% risk). If it hits, it hits. That was the plan BEFORE emotions arrived.' },
          { label: 'Move SL to 1.0860 — give it more room to breathe', correct: false, feedback: 'Widening your stop from 12 to 18 pips increases your risk by 50%. You are now risking £180 instead of £120 on the same trade. If this wider stop also gets hit, you have taken a 1.5× planned loss. NEVER widen. Ever.' },
          { label: 'Close at −8 to save 4 pips of risk', correct: false, feedback: 'Closing at −8 "saves" 4 pips but also eliminates the possibility of the trade working. Many trades touch within 2-3 pips of the stop before reversing to hit TP. By closing early, you lock in a loss on a trade that was 4 pips from stop and 16 pips from TP. Accept the planned risk or do not trade.' },
        ]
      },
      { desc: 'Price pulls back to 1.0847. You are at −5 pips. The near-stop experience rattled you but the SL held. Price is now moving in your direction.', priceInfo: 'Price: 1.0847 | P&L: −5 pips', pnlPips: -5, emotion: 'Relief mixed with residual anxiety. "Should I close at BE if it gets there?"',
        options: [
          { label: 'HOLD — continue following the plan. TP1 is at 1.0830.', correct: true, feedback: 'Correct. The near-stop experience does not change your thesis or your plan. Price bounced from near your SL — the structure held. Continue holding with the original plan: TP1 at 1.0830, then partial + BE. Do not let the scare change your management.' },
          { label: 'Close when it reaches breakeven — I am done with this stress', correct: false, feedback: 'Closing at BE after surviving the near-stop means the hardest part is over but you gave up all the reward. The trade survived the test — the probability of hitting TP1 actually INCREASED because the sellers defended the structure. Stay with the plan.' },
          { label: 'Move SL tighter to lock in a smaller loss if it goes back up', correct: false, feedback: 'Moving your stop tighter after a near-stop is reactive management. If your structural stop held, the thesis is intact. A tighter stop means noise could stop you out for −3 pips instead of letting the trade work to its +12 pip target.' },
        ]
      },
      { desc: 'Price drops sharply. You are now at +6 pips (1.0836). Momentum is strongly in your direction. TP1 at 1.0830 is 6 pips away.', priceInfo: 'Price: 1.0836 | P&L: +6 pips', pnlPips: 6, emotion: 'Vindication. The urge to close everything at +6 and end the emotional rollercoaster.',
        options: [
          { label: 'HOLD — TP1 is 6 pips away with strong momentum. Follow the plan.', correct: true, feedback: 'Correct! After the emotional journey of this trade, closing at +6 would feel like relief — but it captures only 0.5R instead of the planned 1:1 at TP1. The momentum is in your favour. The hard part (the near-stop) is behind you. Let the plan deliver the reward you earned by holding.' },
          { label: 'CLOSE at +6 — after that near-stop experience, any profit is a win', correct: false, feedback: 'The near-stop experience does not change the trade mathematics. +6 pips = 0.5R. TP1 = 1:1 (12 pips profit). Closing here means you endured the worst part (−8 pips) but did not stay for the best part (TP1+). The emotional rollercoaster cost you half your reward.' },
          { label: 'Take partials now — compromise between closing and holding', correct: false, feedback: 'Partials before TP1 is premature. Your plan says: partial at TP1 (1.0830), not at +6 pips. Deviating from the plan mid-trade based on emotion — even "reasonable" emotion — is how plans erode over time.' },
        ]
      },
      { desc: 'Price hits 1.0830 — TP1 reached! You are at +12 pips (1:1). You execute the plan: close 50%, move SL to breakeven.', priceInfo: 'Price: 1.0830 | P&L: +12 pips (1:1) | 50% closed', pnlPips: 12, emotion: 'Deep satisfaction. The plan worked despite the emotional chaos.',
        options: [
          { label: 'TRAIL the runner behind the last lower high. Let the plan complete to TP2.', correct: true, feedback: 'Correct! The plan survived: the near-stop, the anxiety, the temptation to close early. 50% is banked at +12 pips. The runner is now free (BE stop). Trail it behind the last lower high and let the market decide the final reward. THIS is what professional trade management looks like.' },
          { label: 'Close the runner at TP1 too — I have had enough of this trade', correct: false, feedback: 'The emotional exhaustion from the journey is real — but closing the free runner eliminates the 1:2 possibility at zero additional risk. The runner cannot lose. Give it a chance. Your future self will thank you for the discipline.' },
          { label: 'Remove the stop on the runner — let it run as far as possible', correct: false, feedback: 'Never remove a stop. Ever. A free runner with a trailing stop can capture 1:2, 1:3, or more. A runner without a stop can reverse and turn your winning trade into a losing one. Trail, do not remove.' },
        ]
      },
    ]
  },
  {
    title: 'NASDAQ — News Event Mid-Trade',
    instrument: 'NAS100', entry: '18,440', sl: '18,410', tp1: '18,470 (1:1)', tp2: '18,500 (1:2)', direction: 'LONG',
    phases: [
      { desc: 'You entered long 25 minutes ago. Trade is at +15 pips (18,455). Price is moving well. Then you notice: US ISM Manufacturing data releases in 12 minutes. You forgot to check Phase 4 of your pre-session routine.', priceInfo: 'Price: 18,455 | P&L: +15 pips | News in 12 min', pnlPips: 15, emotion: 'Panic. You have an open profit and a data bomb approaching.',
        options: [
          { label: 'Close the entire position — protect the +15 pips from news volatility', correct: false, feedback: '+15 pips is halfway to TP1. Closing eliminates all downside risk but also eliminates the TP1 hit. Better option: take partials to lock in SOME profit while keeping exposure for the TP1 possibility.' },
          { label: 'Take 50% off now at +15, move SL to breakeven. Let the runner face the news risk-free.', correct: true, feedback: 'Correct! This is the best available decision for a mistake that already happened. Bank 50% at +15 (a good result). Move SL to BE on the rest. If ISM is bullish → runner hits TP1 or better. If ISM is bearish → runner exits at BE (no loss). You protected capital while keeping upside. Then journal: "Missed Phase 4 news check. Fix for next session."' },
          { label: 'HOLD everything — ISM probably will not affect NASDAQ much', correct: false, feedback: 'ISM Manufacturing directly impacts growth expectations, which directly impacts NASDAQ. Holding full size through an unchecked news event is gambling, not trading. The spread could widen 5-10× on NASDAQ, potentially triggering your stop on spread alone.' },
        ]
      },
      { desc: 'You took 50% off and moved to BE. ISM data releases — ABOVE expectations. NASDAQ spikes 30 points in 8 seconds. Your runner is now at +45 pips.', priceInfo: 'Price: 18,485 | Runner P&L: +45 pips', pnlPips: 45, emotion: 'Euphoria mixed with regret for closing 50%. "I should have held everything!"',
        options: [
          { label: 'Trail the runner behind the last HL (18,475). Lock in +35 minimum.', correct: true, feedback: 'Correct! The news went in your favour — great outcome. Trail the stop to protect the gain. 18,475 locks in +35 pips minimum on the runner. If the move continues, you capture more. If it reverses (common after news spikes), you keep +35. Do NOT regret the partial — it was the correct decision with the information you had at the time.' },
          { label: 'Add to the position — the news confirms the bullish thesis', correct: false, feedback: 'Adding AFTER a 30-point spike means you are entering at a much worse R:R. The move may already be exhausted. Post-news spikes frequently reverse 40-60% within 30 minutes. Trail and protect, do not add at the top of a spike.' },
          { label: 'Move TP2 to 18,550 — this could run much further', correct: false, feedback: 'News spikes create fast moves that often do not sustain. Moving your TP further after a spike is greed-based management. Your original TP2 (18,500) was set for a structural reason. If it hits, take it. Do not gamble on the post-news momentum lasting.' },
        ]
      },
      { desc: 'Price pulls back from the spike to 18,470. Your trail stop is at 18,475. The runner is about to get stopped.', priceInfo: 'Price: 18,470 | Trail stop: 18,475 | Runner about to be stopped', pnlPips: 30, emotion: 'Frustration. "I should have closed at +45."',
        options: [
          { label: 'Let the trail stop do its job. +35 pips is an excellent result on the runner.', correct: true, feedback: 'Correct! Your trail stop at 18,475 exits the runner at +35 pips. Combined with the 50% partial at +15, this trade delivered an outstanding result — especially considering you missed the news check. The trail worked exactly as designed: it captured the bulk of the move and exited when momentum reversed.' },
          { label: 'Move the trail stop down to 18,460 to give it more room', correct: false, feedback: 'Moving your trail stop BACK DOWN violates the core rule: trail stops only move in ONE direction (in your favour). Moving it wider means you are willing to give back +10 pips of locked-in profit. The trail is there to PROTECT, not to be renegotiated.' },
          { label: 'Close manually at 18,470 before the stop triggers', correct: false, feedback: 'Your stop is at 18,475 — that is +35 pips. Closing at 18,470 gives you +30 pips instead of +35. You are closing below your own stop level to "save" 5 pips that are already protected. Let the system work.' },
        ]
      },
      { desc: 'Trail stop triggered at 18,475. Runner exits at +35 pips. Total trade result: 50% at +15 pips + 50% at +35 pips = average +25 pips.', priceInfo: 'TRADE CLOSED | Average: +25 pips | 50% @+15 + 50% @+35', pnlPips: 25, emotion: 'Satisfaction — but also awareness that the news check failure could have gone badly.',
        options: [
          { label: 'Journal the trade: excellent management despite the Phase 4 miss. Fix the news check process.', correct: true, feedback: 'Correct! The result was good: +25 pips average, well-managed through an unexpected event. But the KEY lesson is: you got LUCKY that ISM was bullish. If it had been bearish, the spike would have been −30 pips through your position. Journal: "Result: +25 avg. Critical error: missed Phase 4 news check. Action: set calendar alarm 30 min before KZ."' },
          { label: 'Celebrate — the trade proved you can handle anything', correct: false, feedback: 'Dangerous conclusion. You survived the news event because it went IN your direction. If ISM had been bearish, this trade could have been a −20 pip loss through slippage. The management was good; the PREPARATION was flawed. Fix the process, do not celebrate the luck.' },
        ]
      },
      { desc: 'Post-trade reflection. What was the single most important lesson?', priceInfo: 'Post-trade review', pnlPips: 25, emotion: 'Reflective. Building the habit.',
        options: [
          { label: 'The pre-session routine (Phase 4 news check) must NEVER be skipped — luck is not a strategy', correct: true, feedback: 'Correct. The trade was profitable because ISM happened to be bullish. That is luck, not skill. The management was excellent (partials, BE, trail) but the preparation failure could have been catastrophic. The lesson is prevention: check the calendar, set alarms, never enter a Kill Zone without completing all 6 phases.' },
          { label: 'I should always take partials before news events', correct: false, feedback: 'This is a good tactic but it is treating the symptom, not the cause. The real lesson is: you should not HAVE an open trade during an unchecked news event. The news check should happen BEFORE entry, not during management.' },
        ]
      },
    ]
  },
];

const gameRounds = [
  { scenario: 'Your Gold LONG is at +6 pips (out of 12 to TP1). Price pulls back 3 pips to +3. Your SL has not been touched. The pullback forms a higher low on the 15M. What do you do?',
    options: [
      { text: 'HOLD — pullback forming a HL confirms the uptrend. TP1 is 6 pips away.', correct: true, explain: 'Correct. A higher low within an uptrend trade is bullish confirmation, not a warning. The pullback gives the trade a new structure to push from. TP1 is still 6 pips away with a holding HL. Your plan is intact.' },
      { text: 'CLOSE — the pullback means momentum is fading', correct: false, explain: 'A 3-pip pullback forming a HL is the opposite of fading momentum. It is the market building a foundation for the next push. Closing at +3 captures only 0.25R — far below the planned 1:1.' },
      { text: 'Move SL to breakeven to protect the remaining +3 pips', correct: false, explain: 'TP1 has not been hit. Moving to BE before TP1 means the next pullback to your entry stops you flat. Then price goes to TP1 without you. BE happens AFTER TP1, not during the approach.' },
      { text: 'Add to the position at the HL', correct: false, explain: 'Adding within your original trade management is premature scaling. The add-on would need to qualify as an independent setup (Lesson 6.8). A HL during an existing trade is structure confirmation, not a new entry signal.' },
    ]
  },
  { scenario: 'You took 50% partials at TP1 and moved to BE. Your runner is at +16 pips. You see a bearish engulfing candle form on the 15M — long upper wick, closes red. TP2 is still 8 pips away. What do you do?',
    options: [
      { text: 'CLOSE the runner — the bearish candle signals a reversal', correct: false, explain: 'A single bearish candle does not confirm a reversal — especially when your trend (Daily + 4H) is intact. It could be temporary selling before the next push. Your trail stop handles the protection.' },
      { text: 'TRAIL — move stop behind the candle low. If the reversal is real, the trail catches it. If not, the runner continues.', correct: true, explain: 'Correct. The bearish candle is a WARNING, not a confirmation. Tighten your trail behind the low of that bearish candle. If price continues up, you capture more. If it reverses, the trail exits at +12-14 pips instead of +16 — still an excellent result. The trail makes the decision FOR you.' },
      { text: 'HOLD without adjusting — trust the original plan', correct: false, explain: 'The original plan included trailing behind higher lows. The bearish candle potentially created a new reference point for your trail. Not adjusting the trail means you are ignoring new information. Trail tighter — do not remove the trail.' },
      { text: 'Add to the position — the bearish candle will reverse and the extra size will profit', correct: false, explain: 'Adding to a position when a bearish signal appears is the opposite of risk management. If the bearish candle IS the reversal, your additional size compounds the loss. Never add when the market is warning you.' },
    ]
  },
  { scenario: 'You are in a GBPUSD SHORT at 1.2710. You took partials at TP1 (1.2698), moved to BE. Your runner is at +20 pips (1.2690). Suddenly your phone rings — it is your boss. The call will take 5-10 minutes. Your TP2 is at 1.2682 (8 pips away). What do you do?',
    options: [
      { text: 'Close the runner before answering — cannot manage a trade and a phone call', correct: false, explain: 'You have a trail stop in place. The runner is a free trade (BE stop). Closing it because of a phone call means life interruptions cost you trading opportunities. The trail stop manages the trade for you.' },
      { text: 'Ensure your trail stop is set at a reasonable level, then take the call. The trail manages itself.', correct: true, explain: 'Correct. This is exactly why trail stops exist. Set your trail behind the last HL/LH, confirm TP2 is set, and take the call. If the trade hits TP2 during the call: great. If it trails out: the stop protected you. You do not need to watch every candle — that is what hard orders are for.' },
      { text: 'Ignore the call — the trade is more important', correct: false, explain: 'Trading should never dominate your life to the point where you ignore your boss. The trade has a trail stop and a TP2 order. It is managed. Proper management means the trade runs WITHOUT you staring at it.' },
      { text: 'Move SL to current price to lock in +20 pips', correct: false, explain: 'Current price minus a trail buffer is fine, but moving SL to EXACT current price (1.2690) means ANY minor fluctuation stops you. Leave a 5-8 pip buffer on your trail to allow for normal noise during the call.' },
    ]
  },
  { scenario: 'After 3 consecutive losing trades today (−1R each, −3% total), you enter a 4th trade that immediately goes to +5 pips. The trade is valid (full MTF alignment). But you feel an overwhelming urge to close at +5 because you "need" a win today. What do you do?',
    options: [
      { text: 'CLOSE at +5 — after 3 losses, any win helps psychologically', correct: false, explain: 'Psychological comfort is not a management strategy. +5 pips on a 10-pip risk = 0.5R. Your 3 losses totalled −3R. Closing at +5 pips makes the day −2.5R instead of −3R. But if the trade hits TP1 at 1:1 (10 pips), the day becomes −2R, and if TP2 hits: −1R. Your emotional need for a "win" is costing you real R.' },
      { text: 'Follow the SAME management plan as if the previous 3 losses never happened', correct: true, explain: 'Correct. Every trade is statistically independent. The previous 3 losses do not change the probability of THIS trade. Your management plan (TP1 partial → BE → trail) was designed in calm for all trades. Following it now — despite the emotional pressure — is what separates professionals from amateurs.' },
      { text: 'Hold to TP2 only — no partials. You need a big win to recover', correct: false, explain: 'Removing partials to "recover" is revenge management. If the trade pulls back from TP1, you give back 100% instead of locking in 50%. The management plan does not change because you had a bad day. Recovery comes from consistency, not desperation.' },
      { text: 'Take 75% off at +5 and let 25% run — compromise', correct: false, explain: 'This is still emotional management. Your plan says: partials at TP1, not at +5. Deviating "a little" is still deviating. Today\'s 3 losses are irrelevant to how this trade should be managed. Run the plan.' },
    ]
  },
  { scenario: 'You perfectly managed a trade: partials at TP1, BE move, trail behind HLs. The runner exited at +18 pips (1.5R on the runner). Total trade: +15 pips average across both portions. You feel great. Your NEXT setup appears 10 minutes later. You think: "I am in the zone — skip the management plan, I can feel the market." What do you do?',
    options: [
      { text: 'Trust the feeling — you earned this confidence', correct: false, explain: 'This is complacency — the 4th emotion in the Emotion→Error chain. One well-managed trade does not make you psychic. The NEXT trade needs the SAME plan, the SAME discipline, the SAME partials-at-TP1 structure. Overconfidence after a win is how winning streaks become blowups.' },
      { text: 'Apply the EXACT same management plan. The plan is the reason you won — not "the zone."', correct: true, explain: 'Correct. You won because of the PLAN, not because of intuition. The plan works across 100 trades — your "feeling" works for maybe 3 before it causes an unmanaged disaster. Same plan, every trade, regardless of how you feel. That IS the zone.' },
      { text: 'Use the management plan but with double size — you are running hot', correct: false, explain: 'Increasing size after a win is the mirror image of increasing size after a loss (revenge trading). Both are emotional sizing decisions. Your risk per trade was set in your pre-session routine Phase 6. It does not change mid-session.' },
      { text: 'Skip the next trade — do not push your luck', correct: false, explain: 'If the setup meets all your criteria (MTF handshake, trigger, KZ), skipping it because you "might push your luck" is superstition, not strategy. Valid setups should be taken regardless of recent results — win or lose.' },
    ]
  },
];

const quizQuestions = [
  { q: 'At what point should you take partials and move to breakeven?', opts: ['Whenever the trade is in profit', 'When TP1 (1:1 R:R) is hit', 'When you feel the trade might reverse', 'After 30 minutes regardless of price'], correct: 1 },
  { q: 'Your trade is at −6 pips on a 10-pip stop. The OB structure is holding. What should you do?', opts: ['Close to save 4 pips of risk', 'Move your stop wider to give more room', 'HOLD — the thesis is not invalidated until the stop level breaks', 'Add to the position at a better price'], correct: 2 },
  { q: 'After partials and BE move, your runner pulls back to breakeven and bounces. What is the correct response?', opts: ['Close the runner — it almost stopped you out', 'HOLD — the runner is risk-free and the pullback held', 'Move stop below BE to give more room', 'Take another partial'], correct: 1 },
  { q: 'A trail stop should only ever move in which direction?', opts: ['Wider, to give the trade more room', 'In the direction of profit — NEVER back toward higher risk', 'It should not move at all once set', 'In either direction based on current candle'], correct: 1 },
  { q: 'You have 3 losing trades today. Your 4th trade is at +5 pips with TP1 at +12. What should you do?', opts: ['Close at +5 for a psychological win', 'Follow the same management plan as if the losses never happened', 'Hold everything to TP2 to recover', 'Take 75% off at +5'], correct: 1 },
  { q: 'What is the difference between "the trade is losing" and "the trade is wrong"?', opts: ['There is no difference', 'A losing trade has not hit the stop yet — the thesis is still alive. A wrong trade has hit the structural stop — the thesis is invalidated.', 'A losing trade is emotional, a wrong trade is technical', 'It depends on how you feel about it'], correct: 1 },
  { q: 'You discover a news event 12 minutes away while in an open trade at +15 pips. What is the best available action?', opts: ['Close everything', 'Take 50% off, move to BE, let the runner face the news risk-free', 'Hold everything and hope for the best', 'Remove your stop to avoid being stopped by spread widening'], correct: 1 },
  { q: 'After a well-managed winning trade, your next setup appears. You feel "in the zone." What should you change about your management plan?', opts: ['Nothing — the same plan that produced the win applies to the next trade', 'Trade with higher confidence and larger size', 'Skip the management plan — trust your intuition', 'Use tighter stops since you are reading the market well'], correct: 0 },
];

function Confetti({ active }: { active: boolean }) {
  if (!active) return null;
  return (<div className="fixed inset-0 pointer-events-none z-50">{Array.from({ length: 60 }).map((_, i) => (<motion.div key={i} initial={{ y: -20, x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400), opacity: 1 }} animate={{ y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 20, rotate: Math.random() * 720, opacity: 0 }} transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5 }} className="absolute w-2 h-2 rounded-sm" style={{ background: ['#f59e0b', '#d946ef', '#34d399', '#3b82f6', '#ef4444'][i % 5] }} />))}</div>);
}

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

export default function ManagingOpenTradesLesson() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);

  const [openPhase, setOpenPhase] = useState<number | null>(null);

  // Simulator State
  const [simIdx, setSimIdx] = useState(0);
  const [simPhase, setSimPhase] = useState(0);
  const [simAnswers, setSimAnswers] = useState<(number | null)[]>([]);
  const [simScore, setSimScore] = useState(0);
  const [simComplete, setSimComplete] = useState(false);
  const [simsComplete, setSimsComplete] = useState<boolean[]>(Array(simScenarios.length).fill(false));
  const [simTotalScore, setSimTotalScore] = useState(0);

  const currentSim = simScenarios[simIdx];
  const currentSimPhase = currentSim.phases[simPhase];
  const phaseAnswered = simAnswers[simPhase] !== null && simAnswers[simPhase] !== undefined;

  const handleSimAnswer = (optIdx: number) => {
    if (phaseAnswered) return;
    const next = [...simAnswers];
    next[simPhase] = optIdx;
    setSimAnswers(next);
    if (currentSimPhase.options[optIdx].correct) {
      setSimScore(s => s + 1);
    }
  };

  const handleNextPhase = () => {
    if (simPhase < currentSim.phases.length - 1) {
      setSimPhase(p => p + 1);
    } else {
      setSimComplete(true);
      setSimTotalScore(s => s + simScore);
      const next = [...simsComplete]; next[simIdx] = true; setSimsComplete(next);
    }
  };

  const handleNextSim = () => {
    if (simIdx < simScenarios.length - 1) {
      setSimIdx(s => s + 1);
      setSimPhase(0);
      setSimAnswers([]);
      setSimScore(0);
      setSimComplete(false);
    }
  };

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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 7 &middot; Lesson 7</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Managing<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Open Trades</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">The entry was 3 seconds. The management lasts 30 minutes. What you do between entry and exit is where amateurs become professionals — or blow up.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* S00 */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">🔍 The Chess Middle Game</p>
            <p className="text-gray-400 leading-relaxed mb-4">In chess, the opening moves are memorised. The endgame has clear principles. But the middle game — where most games are won or lost — is pure decision-making under uncertainty. Every move creates new possibilities and new threats. The grandmaster who wins is not the one with the best opening. It is the one who makes the best decisions when the board is complex and the clock is ticking.</p>
            <p className="text-gray-400 leading-relaxed">Your entry is the opening. Your exit is the endgame. But the 30 minutes in between — the pullbacks, the near-stops, the TP1 decisions, the trailing, the emotions — THAT is the middle game. Two traders with the same entry can finish £400 apart based purely on management. This lesson puts you IN the middle game and makes you make every decision yourself.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">Two traders took the <strong className="text-white">same 50 entries</strong> on Gold over 3 months. Same strategy, same signals, same entries. Trader A used the ATLAS management plan (partials at TP1, BE, trail): <strong className="text-green-400">+£6,800</strong>. Trader B used set-and-forget (SL + full TP2): <strong className="text-amber-400">+£2,100</strong>. Trader A also had <strong className="text-green-400">40% lower maximum drawdown</strong>. Management tripled the profit and halved the risk — on the SAME entries.</p>
          </div>
        </motion.div>
      </section>

      {/* S01 — Trade Lifecycle Animation */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The 5 Phases</p>
          <h2 className="text-2xl font-extrabold mb-4">A Trade&apos;s Complete Journey</h2>
          <p className="text-gray-400 text-sm mb-6">Watch a trade move through all 5 management phases: initial hold, survive the pullback, approach TP1, take partials + BE, and trail the runner. Each phase has a specific action and a specific emotion to manage.</p>
          <TradeLifecycleAnimation />
        </motion.div>
      </section>

      {/* S02 — Emotion-Error Map Animation */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Emotion-Error Chain</p>
          <h2 className="text-2xl font-extrabold mb-4">Every Management Error Has an Emotional Root</h2>
          <p className="text-gray-400 text-sm mb-6">Fear, greed, frustration, and complacency each trigger a specific management error. Knowing the chain BEFORE it happens is how you break it.</p>
          <EmotionErrorAnimation />
        </motion.div>
      </section>

      {/* S03 — 5 Phase Rules */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The 5 Phase Rules</p>
          <h2 className="text-2xl font-extrabold mb-4">What to Do at Every Stage</h2>
          <div className="space-y-3">
            {[
              { phase: 'Phase 1: Entry → +0.5R', action: 'HOLD. Hands off. SL is structural. Price will fluctuate. Do NOT check P&L. Do NOT move anything.', emotion: 'Anxiety is normal. It does not mean the trade is wrong.', color: 'border-blue-500/20', icon: '✋' },
              { phase: 'Phase 2: Pullback toward entry', action: 'HOLD. Unless SL is hit, the thesis is alive. A pullback is the market testing the level — not a failure signal.', emotion: 'Fear screams "close!" Logic says "the stop is the plan."', color: 'border-red-500/20', icon: '🛡️' },
              { phase: 'Phase 3: Approaching TP1', action: 'PREPARE for partials. Know your TP1 level. Know your partial size (50%). Know that BE move happens immediately after.', emotion: 'Excitement builds. Resist the urge to close everything at TP1.', color: 'border-amber-500/20', icon: '🎯' },
              { phase: 'Phase 4: TP1 Hit → Partial + BE', action: 'Close 50% at TP1. Move SL to breakeven IMMEDIATELY. The runner is now a free trade — it can only win or exit flat.', emotion: 'Relief + greed. "Should I hold everything for TP2?" No. Take the partial.', color: 'border-green-500/20', icon: '✂️' },
              { phase: 'Phase 5: Trail the Runner', action: 'Trail stop behind higher lows (longs) or lower highs (shorts). Only move in the direction of profit. NEVER widen a trail.', emotion: 'Greed to move TP further. Frustration when it trails out early. Accept the outcome.', color: 'border-purple-500/20', icon: '📈' },
            ].map((p, i) => (
              <div key={i} className="rounded-xl border border-white/5 overflow-hidden">
                <button onClick={() => setOpenPhase(openPhase === i ? null : i)} className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3"><span className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center text-sm flex-shrink-0">{p.icon}</span><p className="text-sm font-bold text-white text-left">{p.phase}</p></div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openPhase === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openPhase === i && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="px-4 pb-4 space-y-2"><div className={`p-3 rounded-lg border ${p.color} bg-white/[0.01]`}><p className="text-xs font-bold text-green-400 mb-1">ACTION</p><p className="text-sm text-gray-400">{p.action}</p></div><div className="p-3 rounded-lg bg-white/[0.02]"><p className="text-xs font-bold text-amber-400 mb-1">EMOTION TO MANAGE</p><p className="text-sm text-gray-400">{p.emotion}</p></div></div></motion.div>)}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S04 — The Golden Rules */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The 4 Golden Rules</p>
          <h2 className="text-2xl font-extrabold mb-4">Management Laws That Never Break</h2>
          <div className="space-y-3">
            {[
              { rule: 'NEVER widen a stop', why: 'Widening your stop increases your risk AFTER entry — the one moment you should be reducing risk, not increasing it. If your stop was structural, it is correct. If it was not, the problem is your stop placement, not the market.' },
              { rule: 'BE happens AFTER TP1 — never before', why: 'Moving to BE before TP1 means normal price noise stops you flat on trades that would have been winners. TP1 proves the move has begun. Before TP1, the trade is still in the "initial fluctuation" phase.' },
              { rule: 'Trail stops only move in ONE direction', why: 'A trail stop that moves backward is not a trail — it is a wider stop in disguise. Once you have locked in +10 pips, you should never expose yourself to less than +5 pips. The trail ratchets, never relaxes.' },
              { rule: 'The plan was written in calm. Follow the calm version.', why: 'Your management plan was created during your pre-session routine when you were rational. Mid-trade, you are emotional. When the emotional brain conflicts with the calm plan — the calm plan wins. Always.' },
            ].map((r, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-red-500/10">
                <p className="text-sm font-bold text-red-400 mb-2">🚫 {r.rule}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{r.why}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S05 — LIVE TRADE MANAGEMENT SIMULATOR */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Trade Management Simulator</p>
          <h2 className="text-2xl font-extrabold mb-4">You Are IN the Trade. Manage It.</h2>
          <p className="text-gray-400 text-sm mb-6">You have already entered. Price evolves through 5 phases. At each phase, choose your management action. Your decisions determine the outcome. 3 complete scenarios.</p>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
            {/* Scenario tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {simScenarios.map((s, i) => (
                <button key={i} disabled={i !== simIdx && !simsComplete[i]} onClick={() => { if (simsComplete[i] || i === simIdx) { setSimIdx(i); setSimPhase(0); setSimAnswers([]); setSimScore(0); setSimComplete(false); }}} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${i === simIdx ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : simsComplete[i] ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-white/[0.03] text-gray-600 border border-white/5'}`}>
                  {simsComplete[i] ? '✓ ' : ''}{s.title}
                </button>
              ))}
            </div>

            {/* Trade info */}
            <div className="p-3 rounded-lg bg-white/[0.02] grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-gray-500">Entry:</span> <span className="text-white font-bold">{currentSim.entry}</span></div>
              <div><span className="text-gray-500">Direction:</span> <span className={`font-bold ${currentSim.direction === 'LONG' ? 'text-green-400' : 'text-red-400'}`}>{currentSim.direction}</span></div>
              <div><span className="text-gray-500">SL:</span> <span className="text-red-400 font-bold">{currentSim.sl}</span></div>
              <div><span className="text-gray-500">TP1:</span> <span className="text-amber-400 font-bold">{currentSim.tp1}</span></div>
            </div>

            {/* Phase progress */}
            <div className="flex gap-1">
              {currentSim.phases.map((_, i) => (
                <div key={i} className={`flex-1 h-1.5 rounded-full ${i < simPhase ? 'bg-green-500' : i === simPhase ? 'bg-amber-500' : 'bg-white/10'}`} />
              ))}
            </div>

            {/* Current phase */}
            {!simComplete && currentSimPhase && (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-amber-400">Phase {simPhase + 1} of {currentSim.phases.length}</p>
                    <span className={`text-xs font-mono font-bold ${currentSimPhase.pnlPips >= 0 ? 'text-green-400' : 'text-red-400'}`}>{currentSimPhase.priceInfo}</span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">{currentSimPhase.desc}</p>
                </div>
                <div className="p-2 rounded-lg bg-purple-500/5 border border-purple-500/10">
                  <p className="text-[10px] text-purple-400">💭 What you are feeling: <span className="text-gray-400 italic">{currentSimPhase.emotion}</span></p>
                </div>
                <div className="space-y-2">
                  {currentSimPhase.options.map((opt, oi) => {
                    const answered = phaseAnswered;
                    const selected = simAnswers[simPhase] === oi;
                    const isCorrect = opt.correct;
                    const cls = !answered ? 'bg-white/[0.03] border border-white/10 hover:border-amber-500/30' : isCorrect ? 'bg-green-500/10 border border-green-500/30' : selected ? 'bg-red-500/10 border border-red-500/30' : 'bg-white/[0.02] border border-white/5 opacity-50';
                    return (<div key={oi}><button onClick={() => handleSimAnswer(oi)} disabled={answered} className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`}>{opt.label}</button>{answered && selected && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]"><p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>{isCorrect ? '✓' : '✗'} {opt.feedback}</p></motion.div>)}</div>);
                  })}
                </div>
                {phaseAnswered && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <button onClick={handleNextPhase} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">{simPhase < currentSim.phases.length - 1 ? 'Next Phase →' : 'Complete Scenario'}</button>
                  </motion.div>
                )}
              </div>
            )}

            {/* Scenario complete */}
            {simComplete && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <div className={`p-4 rounded-xl border ${simScore >= currentSim.phases.length * 0.6 ? 'bg-green-500/10 border-green-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
                  <p className="text-lg font-extrabold text-center mb-1">{simScore}/{currentSim.phases.length} Phases Managed Correctly</p>
                  <p className="text-xs text-gray-400 text-center">{simScore >= currentSim.phases.length * 0.8 ? 'Outstanding trade management — you follow the plan through the emotions.' : simScore >= currentSim.phases.length * 0.6 ? 'Good — review the phases you missed and identify which emotion caused the error.' : 'Re-read the 5 Phase Rules and the 4 Golden Rules, then retry.'}</p>
                </div>
                {simIdx < simScenarios.length - 1 && (
                  <button onClick={handleNextSim} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Scenario →</button>
                )}
                {simIdx === simScenarios.length - 1 && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                    <p className="text-lg font-extrabold text-amber-400">Total: {simTotalScore}/{simScenarios.reduce<number>((sum, s) => sum + s.phases.length, 0)} Phases</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </section>

      {/* S06-S08 condensed: Key concepts + Mistakes + Cheat Sheet */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Losing vs Wrong</p>
          <h2 className="text-2xl font-extrabold mb-4">The Most Important Distinction in Management</h2>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
              <p className="text-xs font-bold text-amber-400 mb-2">LOSING (Normal)</p>
              <p className="text-xs text-gray-400 leading-relaxed">Trade is negative but SL has not been hit. Thesis is still alive. Price is testing the zone. <span className="text-white font-bold">Action: HOLD.</span> This is what the stop was designed for.</p>
            </div>
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-xs font-bold text-red-400 mb-2">WRONG (Thesis Failed)</p>
              <p className="text-xs text-gray-400 leading-relaxed">SL has been hit. The structural level broke. The thesis is genuinely invalidated. <span className="text-white font-bold">Action: Accept the planned loss.</span> Close, journal, move on.</p>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
            <p className="text-xs text-amber-400">💡 Most management errors happen because traders treat "losing" trades as "wrong" trades. A trade that is −5 pips on a 12-pip stop is LOSING, not WRONG. The distinction preserves your edge and your discipline.</p>
          </div>
        </motion.div>
      </section>

      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-4">What NOT to Do</h2>
          <div className="space-y-3">
            {[
              { mistake: 'Closing winners early because you "need a win today"', fix: 'Every trade is independent. Your P&L today does not change the probability of this trade. Follow the plan — it was built for 100 trades, not for recovering from 3 losses.' },
              { mistake: 'Moving to BE before TP1 because it "eliminates risk"', fix: 'It eliminates risk AND eliminates the trade. BE before TP1 means noise stops you flat on 60%+ of trades that would have hit TP1. The risk was accepted at entry — let the trade work.' },
              { mistake: 'Checking P&L every 30 seconds', fix: 'P&L checking triggers emotional responses. Each check creates a new decision point: "should I close? move the stop? add?" Your management plan already answers these questions. Stop checking.' },
              { mistake: 'Micromanaging every candle on the 1M chart', fix: 'Your entry was on the 15M. Manage on the 15M. The 1M chart shows noise that your 15M thesis does not care about. Switching to 1M post-entry is emotional surveillance, not management.' },
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
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Cheat Sheet</p>
          <h2 className="text-2xl font-extrabold mb-4">Management Quick Reference</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { title: 'Phase 1-2: HOLD', body: 'Do nothing until TP1. SL is the plan. Pullbacks are normal. Hands off.', color: 'border-blue-500/20 bg-blue-500/5' },
              { title: 'Phase 3: PARTIAL', body: '50% off at TP1. Move SL to breakeven. Immediately. No hesitation.', color: 'border-green-500/20 bg-green-500/5' },
              { title: 'Phase 4-5: TRAIL', body: 'Behind HLs (long) or LHs (short). Only move in profit direction. Never widen.', color: 'border-purple-500/20 bg-purple-500/5' },
              { title: 'NEVER', body: 'Never widen a stop. Never move to BE before TP1. Never trail backwards. Never remove a stop.', color: 'border-red-500/20 bg-red-500/5' },
              { title: 'Losing ≠ Wrong', body: 'Losing = SL not hit, thesis alive. Wrong = SL hit, thesis invalidated. Only close on "wrong."', color: 'border-amber-500/20 bg-amber-500/5' },
              { title: 'The Plan', body: 'Written in calm, followed in chaos. When emotion conflicts with plan — plan wins. Always.', color: 'border-cyan-500/20 bg-cyan-500/5' },
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
          <h2 className="text-2xl font-extrabold mb-2">Trade Management Game</h2>
          <p className="text-gray-400 text-sm mb-6">5 scenarios testing in-trade decisions across pullbacks, partials, trailing, emotional pressure, and complacency.</p>
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
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Outstanding — you manage trades like a professional.' : gameScore >= 3 ? 'Good — review the Golden Rules and the Emotion-Error chain.' : 'Re-read the 5 Phase Rules and retry the simulator scenarios.'}</p></motion.div>)}
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
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center text-3xl shadow-lg shadow-purple-500/30">♟️</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 7: Managing Open Trades</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-purple-400 via-amber-400 to-purple-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Trade Commander &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L7.7-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
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
