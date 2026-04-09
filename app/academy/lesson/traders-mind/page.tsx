// app/academy/lesson/traders-mind/page.tsx
// ATLAS Academy — Lesson 4.1: The Trader's Mind [PRO]
'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Crown, ArrowRight, ChevronDown } from 'lucide-react';

function AnimScene({ drawFn, height = 300 }: { drawFn: (ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => void; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const animRef = useRef(0);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const loop = () => { ctx.clearRect(0, 0, rect.width, rect.height); drawFn(ctx, rect.width, rect.height, frameRef.current); frameRef.current++; animRef.current = requestAnimationFrame(loop); };
    loop();
    return () => cancelAnimationFrame(animRef.current);
  }, [drawFn]);
  return <canvas ref={canvasRef} style={{ width: '100%', height }} className="rounded-2xl" />;
}

// ============================================================
// BRAIN ANIMATION — Two brains: emotional vs disciplined
// ============================================================
function BrainAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);
    const midX = w / 2;
    const midY = h / 2;
    const phase = (f % 480) / 480;

    // Left brain — emotional/chaotic
    const lx = w * 0.25;
    const brainR = Math.min(w, h) * 0.18;

    // Brain circle left
    ctx.beginPath();
    ctx.arc(lx, midY - 10, brainR, 0, Math.PI * 2);
    const lgrd = ctx.createRadialGradient(lx, midY - 10, 0, lx, midY - 10, brainR);
    lgrd.addColorStop(0, 'rgba(239,68,68,0.15)');
    lgrd.addColorStop(1, 'rgba(239,68,68,0.03)');
    ctx.fillStyle = lgrd;
    ctx.fill();
    ctx.strokeStyle = 'rgba(239,68,68,0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Chaotic sparks on left brain
    for (let i = 0; i < 8; i++) {
      const sparkPhase = (f * 0.03 + i * 0.785) % (Math.PI * 2);
      const dist = brainR * (0.3 + Math.sin(f * 0.05 + i) * 0.4);
      const sx = lx + Math.cos(sparkPhase) * dist;
      const sy = midY - 10 + Math.sin(sparkPhase * 1.5) * dist * 0.7;
      const alpha = 0.3 + Math.sin(f * 0.08 + i * 2) * 0.3;
      ctx.beginPath();
      ctx.arc(sx, sy, 2 + Math.sin(f * 0.1 + i) * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(239,68,68,${alpha})`;
      ctx.fill();
    }

    // Emotion words floating around left brain
    const emotions = ['FEAR', 'GREED', 'REVENGE', 'FOMO', 'PANIC', 'HOPE'];
    ctx.font = '8px system-ui';
    ctx.textAlign = 'center';
    emotions.forEach((e, i) => {
      const angle = (f * 0.008 + i * (Math.PI * 2 / emotions.length)) % (Math.PI * 2);
      const orbitR = brainR + 20 + Math.sin(f * 0.02 + i) * 8;
      const ex = lx + Math.cos(angle) * orbitR;
      const ey = midY - 10 + Math.sin(angle) * orbitR * 0.6;
      const alpha = 0.2 + Math.sin(f * 0.04 + i * 3) * 0.15;
      ctx.fillStyle = `rgba(239,68,68,${alpha})`;
      ctx.fillText(e, ex, ey);
    });

    ctx.font = 'bold 10px system-ui';
    ctx.fillStyle = 'rgba(239,68,68,0.6)';
    ctx.fillText('EMOTIONAL TRADER', lx, midY + brainR + 30);

    // Right brain — disciplined/calm
    const rx = w * 0.75;

    ctx.beginPath();
    ctx.arc(rx, midY - 10, brainR, 0, Math.PI * 2);
    const rgrd = ctx.createRadialGradient(rx, midY - 10, 0, rx, midY - 10, brainR);
    rgrd.addColorStop(0, 'rgba(34,197,94,0.15)');
    rgrd.addColorStop(1, 'rgba(34,197,94,0.03)');
    ctx.fillStyle = rgrd;
    ctx.fill();
    ctx.strokeStyle = 'rgba(34,197,94,0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Calm, steady pulse rings on right brain
    for (let i = 0; i < 3; i++) {
      const pulsePhase = ((f * 0.015 + i * 0.33) % 1);
      const pulseR = brainR * pulsePhase;
      const alpha = (1 - pulsePhase) * 0.15;
      ctx.beginPath();
      ctx.arc(rx, midY - 10, pulseR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(34,197,94,${alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Discipline words orbiting calmly
    const traits = ['PATIENCE', 'DISCIPLINE', 'PROCESS', 'CALM', 'RULES', 'FOCUS'];
    ctx.font = '8px system-ui';
    traits.forEach((t, i) => {
      const angle = (f * 0.004 + i * (Math.PI * 2 / traits.length)) % (Math.PI * 2);
      const orbitR = brainR + 22;
      const tx = rx + Math.cos(angle) * orbitR;
      const ty = midY - 10 + Math.sin(angle) * orbitR * 0.6;
      ctx.fillStyle = 'rgba(34,197,94,0.35)';
      ctx.fillText(t, tx, ty);
    });

    ctx.font = 'bold 10px system-ui';
    ctx.fillStyle = 'rgba(34,197,94,0.6)';
    ctx.fillText('DISCIPLINED TRADER', rx, midY + brainR + 30);

    // Centre divider
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(148,163,184,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(midX, midY - brainR - 30);
    ctx.lineTo(midX, midY + brainR + 20);
    ctx.stroke();
    ctx.setLineDash([]);

    // Centre question
    ctx.font = 'bold 11px system-ui';
    ctx.fillStyle = 'rgba(251,191,36,0.7)';
    ctx.textAlign = 'center';
    ctx.fillText('Which one are you?', midX, midY + brainR + 45);
  }, []);

  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ICEBERG ANIMATION — 10% visible (strategy), 90% hidden (psychology)
// ============================================================
function IcebergAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);
    const midX = w / 2;
    const waterY = h * 0.32;

    // Water line
    ctx.strokeStyle = 'rgba(59,130,246,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    // Wavy water line
    for (let x = 0; x <= w; x += 2) {
      const wave = Math.sin(x * 0.02 + f * 0.03) * 3 + Math.sin(x * 0.01 + f * 0.02) * 2;
      if (x === 0) ctx.moveTo(x, waterY + wave);
      else ctx.lineTo(x, waterY + wave);
    }
    ctx.stroke();

    // Water fill
    ctx.beginPath();
    for (let x = 0; x <= w; x += 2) {
      const wave = Math.sin(x * 0.02 + f * 0.03) * 3 + Math.sin(x * 0.01 + f * 0.02) * 2;
      if (x === 0) ctx.moveTo(x, waterY + wave);
      else ctx.lineTo(x, waterY + wave);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = 'rgba(59,130,246,0.04)';
    ctx.fill();

    // Iceberg tip (above water) — STRATEGY
    const tipW = 50;
    const tipH = 35;
    ctx.beginPath();
    ctx.moveTo(midX, waterY - tipH);
    ctx.lineTo(midX + tipW, waterY);
    ctx.lineTo(midX - tipW, waterY);
    ctx.closePath();
    ctx.fillStyle = 'rgba(148,163,184,0.15)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(148,163,184,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Iceberg body (below water) — PSYCHOLOGY
    const bodyW = 130;
    const bodyH = h * 0.52;
    ctx.beginPath();
    ctx.moveTo(midX - tipW, waterY);
    ctx.lineTo(midX + tipW, waterY);
    ctx.lineTo(midX + bodyW, waterY + bodyH * 0.6);
    ctx.lineTo(midX + bodyW * 0.4, waterY + bodyH);
    ctx.lineTo(midX - bodyW * 0.4, waterY + bodyH);
    ctx.lineTo(midX - bodyW, waterY + bodyH * 0.6);
    ctx.closePath();
    const igrd = ctx.createLinearGradient(midX, waterY, midX, waterY + bodyH);
    igrd.addColorStop(0, 'rgba(59,130,246,0.1)');
    igrd.addColorStop(1, 'rgba(139,92,246,0.08)');
    ctx.fillStyle = igrd;
    ctx.fill();
    ctx.strokeStyle = 'rgba(59,130,246,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Labels
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(148,163,184,0.8)';
    ctx.fillText('10%', midX + tipW + 24, waterY - tipH / 2 + 4);
    ctx.font = '9px system-ui';
    ctx.fillStyle = 'rgba(148,163,184,0.5)';
    ctx.fillText('STRATEGY', midX + tipW + 24, waterY - tipH / 2 + 16);

    ctx.font = 'bold 14px system-ui';
    ctx.fillStyle = 'rgba(251,191,36,0.7)';
    ctx.fillText('90%', midX, waterY + bodyH * 0.35);
    ctx.font = 'bold 10px system-ui';
    ctx.fillStyle = 'rgba(251,191,36,0.5)';
    ctx.fillText('PSYCHOLOGY', midX, waterY + bodyH * 0.35 + 16);

    // Psych items floating in body
    const items = ['Fear', 'Greed', 'Patience', 'Discipline', 'FOMO', 'Confidence', 'Focus', 'Revenge'];
    ctx.font = '8px system-ui';
    items.forEach((item, i) => {
      const ix = midX + Math.sin(f * 0.006 + i * 1.2) * (bodyW * 0.5);
      const iy = waterY + bodyH * 0.15 + (i / items.length) * bodyH * 0.7;
      const alpha = 0.15 + Math.sin(f * 0.03 + i * 2) * 0.08;
      ctx.fillStyle = `rgba(139,92,246,${alpha})`;
      ctx.fillText(item, ix, iy);
    });

    // "10%" and "90%" labels on left
    ctx.font = '9px system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(148,163,184,0.25)';
    ctx.fillText('Above the surface:', 16, waterY - 14);
    ctx.fillText('Entries, stops, indicators', 16, waterY - 2);
    ctx.fillText('Below the surface:', 16, waterY + 20);
    ctx.fillText('Fear, greed, discipline,', 16, waterY + 32);
    ctx.fillText('patience, identity, beliefs', 16, waterY + 44);
  }, []);

  return <AnimScene drawFn={draw} height={320} />;
}

// ============================================================
// PERSONALITY PROFILER — 12 questions, 6 types
// ============================================================
type TraderType = 'gambler' | 'perfectionist' | 'revenge' | 'freezer' | 'overtrader' | 'disciplined';

const profilerQuestions = [
  { q: 'You just had two losing trades in a row. What do you do?', opts: [
    { text: 'Double my position size to win it back fast', type: 'revenge' as TraderType },
    { text: 'Step away from the charts for at least an hour', type: 'disciplined' as TraderType },
    { text: 'Freeze up and can&apos;t bring myself to take the next trade', type: 'freezer' as TraderType },
    { text: 'Take 3 more trades immediately to &quot;make up for it&quot;', type: 'overtrader' as TraderType },
  ]},
  { q: 'A trade hits your take profit. How do you feel?', opts: [
    { text: 'Annoyed &mdash; it could have gone further if I&apos;d held', type: 'gambler' as TraderType },
    { text: 'Satisfied &mdash; the plan worked, move on', type: 'disciplined' as TraderType },
    { text: 'Already scanning for the next trade', type: 'overtrader' as TraderType },
    { text: 'Frustrated that I didn&apos;t get a perfect entry', type: 'perfectionist' as TraderType },
  ]},
  { q: 'You see a pair moving 80 pips without you. What happens?', opts: [
    { text: 'I jump in immediately &mdash; it might keep going', type: 'gambler' as TraderType },
    { text: 'I feel sick and blame myself for missing it', type: 'freezer' as TraderType },
    { text: 'I wait for a pullback to my zone, or skip it entirely', type: 'disciplined' as TraderType },
    { text: 'I spend hours analysing why my setup didn&apos;t trigger perfectly', type: 'perfectionist' as TraderType },
  ]},
  { q: 'Your trading journal shows you take an average of 8 trades per day. Your strategy says 2-3 max. What do you think?', opts: [
    { text: 'More trades = more chances to win, right?', type: 'overtrader' as TraderType },
    { text: 'Yea, I need to cut that down immediately', type: 'disciplined' as TraderType },
    { text: 'I don&apos;t keep a trading journal', type: 'gambler' as TraderType },
    { text: 'Those extra trades were all &quot;justified&quot; &mdash; they looked perfect', type: 'perfectionist' as TraderType },
  ]},
  { q: 'How do you handle a 3-day losing streak?', opts: [
    { text: 'Increase size to dig out of the hole faster', type: 'revenge' as TraderType },
    { text: 'Reduce size, review my journal, focus on process', type: 'disciplined' as TraderType },
    { text: 'Stop trading entirely and question everything', type: 'freezer' as TraderType },
    { text: 'Trade more to &quot;find&quot; a winning setup', type: 'overtrader' as TraderType },
  ]},
  { q: 'Your stop loss gets hit by 2 pips, then price reverses and goes to your target. What do you do?', opts: [
    { text: 'Widen my stops from now on &mdash; this keeps happening', type: 'gambler' as TraderType },
    { text: 'Accept it. My stop was in the right place. Variance happens.', type: 'disciplined' as TraderType },
    { text: 'Obsess over perfecting my stop placement for hours', type: 'perfectionist' as TraderType },
    { text: 'Re-enter the trade immediately without a new signal', type: 'revenge' as TraderType },
  ]},
  { q: 'How would you describe your relationship with your trading plan?', opts: [
    { text: 'I don&apos;t really have one &mdash; I trade what looks good', type: 'gambler' as TraderType },
    { text: 'I have one but I deviate whenever I &quot;feel&quot; something', type: 'overtrader' as TraderType },
    { text: 'I follow it rigidly &mdash; every trade is pre-planned', type: 'disciplined' as TraderType },
    { text: 'I have one but I keep rewriting it after every loss', type: 'revenge' as TraderType },
  ]},
  { q: 'It&apos;s been 4 hours and no setup has appeared. What do you do?', opts: [
    { text: 'Lower my standards and take a &quot;B-grade&quot; setup', type: 'overtrader' as TraderType },
    { text: 'Accept it &mdash; no setup means no trade. That IS the plan.', type: 'disciplined' as TraderType },
    { text: 'Feel anxious that I&apos;m &quot;wasting time&quot; not trading', type: 'gambler' as TraderType },
    { text: 'Start doubting whether my strategy even works', type: 'freezer' as TraderType },
  ]},
  { q: 'You&apos;ve won 5 trades in a row. What&apos;s your next move?', opts: [
    { text: 'Double my position size &mdash; I&apos;m on fire!', type: 'gambler' as TraderType },
    { text: 'Stick to my normal size. The streak changes nothing.', type: 'disciplined' as TraderType },
    { text: 'Take more trades than usual because I&apos;m &quot;in the zone&quot;', type: 'overtrader' as TraderType },
    { text: 'Become terrified of the inevitable loss that ends the streak', type: 'freezer' as TraderType },
  ]},
  { q: 'A trade goes 30 pips in profit. Your plan says TP at 50 pips. What do you do?', opts: [
    { text: 'Close it now &mdash; I can&apos;t bear to give back profit', type: 'freezer' as TraderType },
    { text: 'Move stop to breakeven and let it run to target', type: 'disciplined' as TraderType },
    { text: 'Remove TP entirely &mdash; this could be a 200-pip move', type: 'gambler' as TraderType },
    { text: 'Agonise over the perfect trailing stop distance', type: 'perfectionist' as TraderType },
  ]},
  { q: 'After a bad trading day, you are most likely to:', opts: [
    { text: 'Open more charts and try to trade the Asian session too', type: 'revenge' as TraderType },
    { text: 'Review my journal, note what went wrong, go to bed', type: 'disciplined' as TraderType },
    { text: 'Tell yourself trading isn&apos;t for you', type: 'freezer' as TraderType },
    { text: 'Blame the market/broker for manipulation', type: 'gambler' as TraderType },
  ]},
  { q: 'How do you feel about a 45% win rate with a 1:3 R:R?', opts: [
    { text: 'That&apos;s terrible &mdash; I want at least 70% win rate', type: 'perfectionist' as TraderType },
    { text: 'That&apos;s excellent &mdash; the maths makes it very profitable', type: 'disciplined' as TraderType },
    { text: 'I don&apos;t track win rates &mdash; I just want to win today', type: 'gambler' as TraderType },
    { text: 'Losing more than half my trades would destroy me mentally', type: 'freezer' as TraderType },
  ]},
];

const typeProfiles: Record<TraderType, { emoji: string; name: string; color: string; title: string; desc: string; strength: string; weakness: string; prescription: string }> = {
  gambler: {
    emoji: '&#127922;', name: 'The Gambler', color: '#ef4444', title: 'High-Risk, Thrill-Seeking',
    desc: 'You trade for the rush. The excitement of a big win matters more than consistent profit. You treat the market like a casino &mdash; and the house always wins against gamblers.',
    strength: 'Fearless in execution. You never hesitate to pull the trigger.',
    weakness: 'No risk management. You increase size after wins, chase moves, and skip your plan when &quot;gut feeling&quot; kicks in.',
    prescription: 'You need a written trading plan that you follow BEFORE looking at any chart. Size must be fixed. Journal every trade. The market is not a slot machine &mdash; it rewards preparation, not luck.',
  },
  perfectionist: {
    emoji: '&#128270;', name: 'The Perfectionist', color: '#8b5cf6', title: 'Analysis Paralysis',
    desc: 'You want every trade to be flawless. You spend so long looking for the &quot;perfect&quot; setup that you either miss it or never take it. When you do trade, a 2-pip imperfect entry can ruin your entire day.',
    strength: 'Thorough analysis. You rarely take bad setups because your standards are extremely high.',
    weakness: 'You miss 80% of good trades waiting for perfection. You rewrite your strategy after every imperfect outcome.',
    prescription: 'Accept that &quot;good enough&quot; wins. An A-grade setup taken imperfectly beats an A+ setup never taken. Set a decision timer &mdash; if your checklist is 80% met, take the trade.',
  },
  revenge: {
    emoji: '&#128293;', name: 'The Revenge Trader', color: '#f97316', title: 'Loss-Fuelled Spiral',
    desc: 'After a loss, you don&apos;t stop. You trade bigger, faster, and angrier &mdash; trying to &quot;win it back.&quot; A 1% loss becomes 5%, then 10%, then your account is gone.',
    strength: 'Passionate about trading. You genuinely care about results.',
    weakness: 'Emotion hijacks your decisions after every loss. You break every rule in your plan when anger takes over.',
    prescription: 'Your number one tool is a CIRCUIT BREAKER. After 2 consecutive losses: close all charts for 2 hours. Non-negotiable. The money you &quot;lost&quot; is gone forever &mdash; revenge trading only adds to the damage.',
  },
  freezer: {
    emoji: '&#10052;&#65039;', name: 'The Freezer', color: '#3b82f6', title: 'Fear-Driven Paralysis',
    desc: 'You know the setup. You see the signal. But you can&apos;t click the button. Fear of being wrong &mdash; fear of losing money &mdash; freezes you. And when you finally do trade, you close at the first sign of movement against you.',
    strength: 'Risk-aware. You rarely blow an account because fear keeps you small.',
    weakness: 'You leave money on the table constantly. Profitable strategies become unprofitable because you skip 60% of the signals.',
    prescription: 'Start with the smallest possible position size &mdash; so small that losing feels like nothing. Build confidence through repetition. Track every SKIPPED trade and calculate what you would have made. Seeing missed profits is more motivating than any pep talk.',
  },
  overtrader: {
    emoji: '&#9889;', name: 'The Overtrader', color: '#eab308', title: 'Activity Addiction',
    desc: 'You equate screen time with productivity. If you&apos;re not in a trade, you feel like you&apos;re wasting time. You take 8-12 trades a day when your strategy calls for 2-3. Your broker loves you. Your account doesn&apos;t.',
    strength: 'Dedicated. You&apos;re always at the desk, always watching, always learning.',
    weakness: 'You confuse activity with progress. Half your trades don&apos;t meet your own criteria. Commissions and spreads eat your edge.',
    prescription: 'Set a HARD daily trade limit: 3 trades maximum. After 3, you&apos;re done &mdash; even if the &quot;perfect&quot; setup appears. Quality over quantity. One A+ trade beats five B-grade trades every single time.',
  },
  disciplined: {
    emoji: '&#129504;', name: 'The Disciplined Trader', color: '#22c55e', title: 'Process-Driven Professional',
    desc: 'You have a plan and you follow it. Losses don&apos;t shake you because you know they&apos;re a cost of business. You trade like a business owner &mdash; not a gambler, not a perfectionist, not an addict.',
    strength: 'Consistency. You execute the same way every time, regardless of recent results. This is the ONLY sustainable approach.',
    weakness: 'Complacency. Even disciplined traders can drift if they stop journaling or stop reviewing their edge.',
    prescription: 'Keep doing what you&apos;re doing, but stay vigilant. Review your journal weekly. Check that your win rate and R:R haven&apos;t degraded. Discipline is not a destination &mdash; it&apos;s a daily practice.',
  },
};

// ============================================================
// GAME SCENARIOS
// ============================================================
const gameScenarios = [
  { scenario: 'You enter a trade. Within 30 seconds it drops 15 pips against you. Your stop is at -25 pips. Your hands are shaking. What should you do?', opts: ['Close immediately to save money', 'Hold &mdash; your stop is placed for a reason', 'Add to the position to lower your average', 'Move your stop further away'], correct: 1, explain: 'Your stop loss is placed based on your analysis BEFORE the trade. Price fluctuating within your stop range is NORMAL. Closing early because of fear means your emotions are controlling your exits, not your plan. Trust the process.' },
  { scenario: 'You&apos;ve had 4 winning trades this week. A setup appears that is B-grade at best &mdash; it doesn&apos;t quite meet all your criteria. You&apos;re feeling confident. What do you do?', opts: ['Take it &mdash; you&apos;re hot right now', 'Skip it &mdash; your criteria exist for a reason', 'Take it with half size as a compromise', 'Take it but move stop closer'], correct: 1, explain: 'Overconfidence after a winning streak is one of the most dangerous traps. Your criteria don&apos;t change based on recent results. A B-grade setup is B-grade whether you&apos;ve won 4 in a row or lost 4 in a row. Skip it.' },
  { scenario: 'You just closed a -1% loss. Your strategy says max 2 trades per day and this was trade #2. But you see what looks like an A+ setup forming. What do you do?', opts: ['Take it &mdash; A+ setups are rare!', 'Skip it &mdash; your daily limit is your daily limit', 'Take it but with reduced size', 'Screenshot it for journal review, but don&apos;t trade it'], correct: 3, explain: 'Your daily trade limit is a RULE, not a suggestion. But you can still learn from the setup! Screenshot it, track how it would have played out, and review it later. This builds data for your journal without breaking your rules. The market will be there tomorrow.' },
  { scenario: 'You closed a trade at your target for +2R. But after you closed, price continued another 100 pips in your direction. How should you think about this?', opts: ['I should have held longer &mdash; I left money on the table', 'My plan worked perfectly &mdash; I hit my target', 'I need to adjust my targets higher', 'I should have moved to breakeven and let it run'], correct: 1, explain: 'You followed your plan and hit your target. That is a PERFECT trade. The extra 100 pips were never yours &mdash; you cannot capture every pip of every move. Chasing bigger targets leads to giving back profits. A completed plan is success, full stop.' },
  { scenario: 'It&apos;s Wednesday. You&apos;ve lost 3 of your last 4 trades. Your strategy has a historical 48% win rate. What should you do?', opts: ['Something is clearly wrong &mdash; pause and rethink everything', 'This is completely normal variance &mdash; stick to the plan', 'Increase size on the next trade to recover faster', 'Switch to a different strategy'], correct: 1, explain: 'With a 48% win rate, losing 3 out of 4 is COMPLETELY NORMAL. In fact, losing 6 in a row is mathematically expected to happen multiple times per year. This is variance, not a strategy problem. Changing your approach because of a tiny sample would be a massive mistake. Trust the maths.' },
];

// ============================================================
// QUIZ QUESTIONS
// ============================================================
const quizQuestions = [
  { q: 'What percentage of trading success comes from psychology vs strategy?', opts: ['50/50', '70% strategy, 30% psychology', '90% psychology, 10% strategy', '20% psychology, 80% strategy'], a: 2, explain: 'Most professional traders agree that psychology accounts for roughly 90% of trading success. Strategy gets you in the door &mdash; psychology keeps you there.' },
  { q: 'After 3 consecutive losses, the correct response is to:', opts: ['Double your position size to recover faster', 'Reduce size, review your journal, stick to the plan', 'Switch to a different strategy immediately', 'Trade more frequently to find a winner'], a: 1, explain: 'Reducing size protects capital during drawdowns. Reviewing the journal identifies whether the losses were valid (bad luck) or invalid (broken rules). Sticking to the plan prevents emotional spiralling.' },
  { q: 'Which trader type is most likely to blow their account?', opts: ['The Perfectionist', 'The Freezer', 'The Revenge Trader', 'The Overtrader'], a: 2, explain: 'Revenge traders escalate losses by increasing size after every loss. A 1% loss becomes 5%, then 10%, then the account is gone. The revenge spiral is the single fastest way to destroy a trading account.' },
  { q: 'A trade with perfect process that loses money is:', opts: ['A bad trade', 'A good trade with a bad outcome', 'Evidence the strategy is broken', 'A reason to change your plan'], a: 1, explain: 'Process over outcome is the professional mindset. A loss with perfect process means you did everything right and variance went against you. That will happen &mdash; and it&apos;s not a reason to change anything.' },
  { q: 'What is a &quot;circuit breaker&quot; in trading psychology?', opts: ['A technical indicator that detects reversals', 'A pre-set rule that forces you to stop trading after losses', 'A strategy for trading during market crashes', 'A type of stop loss'], a: 1, explain: 'A circuit breaker is a personal rule like &quot;after 2 consecutive losses, close charts for 2 hours.&quot; It prevents emotional escalation and revenge trading by forcing a cooling-off period.' },
  { q: 'The Iceberg Model of trading success means:', opts: ['Most of your profit comes from one big trade', 'Strategy is visible but psychology is the hidden 90%', 'You should trade slowly and steadily', 'Big accounts have hidden advantages'], a: 1, explain: 'The strategy (entries, stops, indicators) is the 10% above the waterline. Psychology (fear, greed, discipline, patience) is the 90% below. Most traders focus only on the visible 10% and wonder why they fail.' },
  { q: 'Why is tracking SKIPPED trades important?', opts: ['To prove your strategy works', 'To guilt yourself into trading more', 'To reveal how much fear costs you in missed profits', 'It isn&apos;t &mdash; only taken trades matter'], a: 2, explain: 'Tracking skipped trades shows Freezer-type traders exactly how much money fear is costing them. When you see &quot;I skipped 5 valid signals this week that would have been +8R total,&quot; fear becomes tangible and addressable.' },
  { q: 'A 45% win rate with 1:3 R:R is:', opts: ['Terrible &mdash; you lose more than you win', 'Excellent &mdash; the maths makes it profitable', 'Mediocre &mdash; you need at least 60%', 'Impossible to sustain'], a: 1, explain: 'Win rate ALONE means nothing. With 1:3 R:R: 45 wins &times; 3R = 135R, 55 losses &times; 1R = 55R. Net: +80R per 100 trades. That is EXTREMELY profitable. Most beginners chase high win rates instead of understanding expectancy.' },
];

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function TradersMindLesson() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Profiler state
  const [profilerAnswers, setProfilerAnswers] = useState<(number | null)[]>(Array(profilerQuestions.length).fill(null));
  const [profilerComplete, setProfilerComplete] = useState(false);
  const [resultType, setResultType] = useState<TraderType | null>(null);
  const answeredCount = profilerAnswers.filter(a => a !== null).length;

  const calculateResult = useCallback(() => {
    const scores: Record<TraderType, number> = { gambler: 0, perfectionist: 0, revenge: 0, freezer: 0, overtrader: 0, disciplined: 0 };
    profilerQuestions.forEach((q, i) => {
      const answer = profilerAnswers[i];
      if (answer !== null) { scores[q.opts[answer].type]++; }
    });
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    return sorted[0][0] as TraderType;
  }, [profilerAnswers]);

  // Accordion states
  const [openType, setOpenType] = useState<string | null>(null);
  const [openEmotions, setOpenEmotions] = useState<string | null>(null);
  const [openStage, setOpenStage] = useState<string | null>(null);
  const [openMyth, setOpenMyth] = useState<string | null>(null);
  const [openMistake, setOpenMistake] = useState<string | null>(null);

  // Game state
  const [gameRound, setGameRound] = useState(0);
  const [gameAnswer, setGameAnswer] = useState<number | null>(null);
  const [gameScore, setGameScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(Array(quizQuestions.length).fill(null));
  const quizDone = quizAnswers.every(a => a !== null);
  const score = quizDone ? Math.round(quizAnswers.filter((a, i) => a === quizQuestions[i].a).length / quizQuestions.length * 100) : 0;
  const certUnlocked = quizDone && score >= 66;

  const currentGame = gameScenarios[gameRound];

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-900/50"><motion.div className="h-full bg-gradient-to-r from-amber-500 to-accent-500" style={{ width: `${Math.min((scrollY / (typeof document !== 'undefined' ? document.body.scrollHeight - window.innerHeight : 1)) * 100, 100)}%` }} /></div>
      <nav className="sticky top-0 z-40 px-5 py-3 flex items-center justify-between" style={{ background: 'rgba(6,10,18,0.85)', backdropFilter: 'blur(16px)' }}>
        <Link href="/academy" className="text-xs text-gray-500 hover:text-gray-300 transition">&larr; Academy</Link>
        <div className="flex items-center gap-2"><Crown className="w-3.5 h-3.5 text-amber-400" /><span className="text-xs font-bold text-amber-400">PRO &middot; LEVEL 4</span></div>
      </nav>

      <section className="px-5 pt-16 pb-12 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 4 &middot; Lesson 1</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight"><span className="bg-gradient-to-r from-red-400 via-amber-400 to-green-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>The Trader&apos;s Mind</span></h1>
          <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">Your strategy is only 10% of the battle. The other 90% is between your ears. Discover your trader type.</p>
        </motion.div>
      </section>

      {/* SECTION 00 — WHY THIS MATTERS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-lg font-bold text-white mb-3">&#129504; Two traders have the exact same strategy. Same entries. Same stops. Same risk. After 6 months, one is profitable. The other has blown two accounts. What&apos;s different?</p>
            <p className="text-gray-400 leading-relaxed mb-4">Not the strategy. Not the indicators. Not the market conditions. <strong className="text-amber-400">Their psychology.</strong></p>
            <p className="text-gray-400 leading-relaxed mb-4">Think of it like two students sitting the same exam with the same revision notes. One stays calm, reads each question carefully, and finishes methodically. The other panics after question three, skips to the end, changes answers, and runs out of time. Same knowledge &mdash; completely different results.</p>
            <p className="text-gray-400 leading-relaxed">Trading is the hardest game in the world because <strong className="text-white">the opponent is yourself</strong>. Your fear tells you to close winners too early. Your greed tells you to hold losers too long. Your ego tells you to increase size after losses. Level 4 teaches you how to beat that opponent.</p>
          </div>
          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">A prop firm study found that 78% of traders who failed their challenges had profitable strategies on paper. Their backtests showed consistent edge. But in live trading, they overtraded, revenge-traded after losses, or froze during drawdowns. The strategy was fine. The psychology destroyed them.</p>
          </div>
        </motion.div>
      </section>

      {/* SECTION 01 — THE ICEBERG MODEL */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Iceberg Model</p>
          <h2 className="text-2xl font-extrabold mb-4">What You See vs What Matters</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">Every new trader obsesses over indicators, entries, and chart patterns &mdash; the <strong className="text-white">visible</strong> part of trading. They spend months finding the perfect strategy. Then they fail. Because they never addressed the <strong className="text-amber-400">90% below the surface</strong>.</p>
          <IcebergAnimation />
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-gray-700/50 bg-white/[0.02]">
              <p className="text-xs font-bold text-gray-500 mb-2">10% &mdash; VISIBLE</p>
              <p className="text-sm text-gray-400">Strategy, entries, stops, indicators, chart patterns, risk management rules</p>
            </div>
            <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
              <p className="text-xs font-bold text-amber-400 mb-2">90% &mdash; HIDDEN</p>
              <p className="text-sm text-gray-400">Fear, greed, patience, discipline, FOMO, confidence, revenge impulses, identity, beliefs about money</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 02 — TWO BRAINS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Two Brains</p>
          <h2 className="text-2xl font-extrabold mb-4">Emotional vs Disciplined</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">Every trade is a tug-of-war between your <strong className="text-red-400">emotional brain</strong> (fast, reactive, fear-driven) and your <strong className="text-green-400">rational brain</strong> (slow, analytical, plan-driven). The emotional brain is louder and faster. The rational brain is quieter but right.</p>
          <BrainAnimation />
          <div className="mt-6 p-5 rounded-xl glass-card">
            <p className="text-sm text-gray-400 leading-relaxed">Your emotional brain evolved to keep you alive in the jungle. A rustling bush might be a tiger &mdash; <strong className="text-white">react first, think later</strong>. In trading, that same instinct makes you close winning trades too early (&quot;take the profit before it disappears!&quot;) and hold losing trades too long (&quot;it&apos;ll come back!&quot;). Level 4 teaches you to override these instincts with <strong className="text-amber-400">systems and rules</strong>.</p>
          </div>
        </motion.div>
      </section>

      {/* SECTION 03 — THE SIX TRADER TYPES */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The Six Trader Types</p>
          <h2 className="text-2xl font-extrabold mb-2">Know Your Enemy</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">Every trader falls into one of six psychological profiles. Most are a blend of two or three. The profiler in Section 04 will tell you yours &mdash; but first, learn what each type looks like.</p>
        </motion.div>
        <div className="space-y-3">
          {(Object.entries(typeProfiles) as [TraderType, typeof typeProfiles[TraderType]][]).map(([key, tp]) => (
            <motion.div key={key} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <button onClick={() => setOpenType(openType === key ? null : key)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left transition-all">
                <div className="flex items-center gap-3">
                  <span className="text-2xl" dangerouslySetInnerHTML={{ __html: tp.emoji }} />
                  <div>
                    <p className="text-sm font-extrabold text-white">{tp.name}</p>
                    <p className="text-xs text-gray-500">{tp.title}</p>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openType === key ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openType === key && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="px-4 pb-4 pt-2 space-y-3">
                      <p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: tp.desc }} />
                      <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/15"><p className="text-xs font-bold text-green-400 mb-1">&#9989; Strength</p><p className="text-sm text-gray-400">{tp.strength}</p></div>
                      <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/15"><p className="text-xs font-bold text-red-400 mb-1">&#10060; Weakness</p><p className="text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: tp.weakness }} /></div>
                      <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/15"><p className="text-xs font-bold text-amber-400 mb-1">&#128138; Prescription</p><p className="text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: tp.prescription }} /></div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 04 — INTERACTIVE PROFILER */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Discover Your Type</p>
          <h2 className="text-2xl font-extrabold mb-2">Trader Personality Profiler</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">Answer honestly &mdash; not how you <em>want</em> to trade, but how you <em>actually</em> trade right now. There are no wrong answers. This is for you.</p>
        </motion.div>

        {!profilerComplete ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-amber-500 to-accent-500 transition-all duration-500" style={{ width: `${(answeredCount / profilerQuestions.length) * 100}%` }} /></div>
              <span className="text-xs text-gray-500 font-mono">{answeredCount}/{profilerQuestions.length}</span>
            </div>
            {profilerQuestions.map((q, qi) => (
              <motion.div key={qi} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="p-5 rounded-2xl glass-card">
                <p className="text-sm font-bold text-white mb-3" dangerouslySetInnerHTML={{ __html: `${qi + 1}. ${q.q}` }} />
                <div className="space-y-2">
                  {q.opts.map((opt, oi) => {
                    const isChosen = profilerAnswers[qi] === oi;
                    return (
                      <button key={oi} onClick={() => { const na = [...profilerAnswers]; na[qi] = oi; setProfilerAnswers(na); }} className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${isChosen ? 'bg-amber-500/15 border-amber-500/30 text-amber-300' : 'glass text-gray-300 hover:bg-white/5'}`}>
                        <span dangerouslySetInnerHTML={{ __html: opt.text }} />
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            ))}
            {answeredCount === profilerQuestions.length && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <button onClick={() => { const r = calculateResult(); setResultType(r); setProfilerComplete(true); }} className="w-full p-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all">Reveal My Trader Type &rarr;</button>
              </motion.div>
            )}
          </div>
        ) : resultType && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, type: 'spring' }}>
            <div className="p-8 rounded-2xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
              <div className="text-center">
                <p className="text-5xl mb-4" dangerouslySetInnerHTML={{ __html: typeProfiles[resultType].emoji }} />
                <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-2">Your Primary Type</p>
                <h3 className="text-2xl font-extrabold mb-1" style={{ color: typeProfiles[resultType].color }}>{typeProfiles[resultType].name}</h3>
                <p className="text-sm text-gray-500 mb-6">{typeProfiles[resultType].title}</p>
                <p className="text-sm text-gray-400 leading-relaxed mb-6" dangerouslySetInnerHTML={{ __html: typeProfiles[resultType].desc }} />
                <div className="space-y-3 text-left">
                  <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/15"><p className="text-xs font-bold text-green-400 mb-1">&#9989; Your Strength</p><p className="text-sm text-gray-400">{typeProfiles[resultType].strength}</p></div>
                  <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/15"><p className="text-xs font-bold text-red-400 mb-1">&#10060; Your Weakness</p><p className="text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: typeProfiles[resultType].weakness }} /></div>
                  <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/15"><p className="text-xs font-bold text-amber-400 mb-1">&#128138; Your Prescription</p><p className="text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: typeProfiles[resultType].prescription }} /></div>
                </div>
                <button onClick={() => { setProfilerComplete(false); setProfilerAnswers(Array(profilerQuestions.length).fill(null)); setResultType(null); }} className="mt-6 text-xs text-gray-600 underline">Retake Profiler</button>
              </div>
            </div>
          </motion.div>
        )}
      </section>

      {/* SECTION 05 — THE EMOTIONAL CYCLE */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; The Emotional Cycle</p>
          <h2 className="text-2xl font-extrabold mb-2">Every Trader Goes Through This</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">The emotional cycle of trading is predictable. Understanding where you are in the cycle at any moment is the first step to controlling your response.</p>
        </motion.div>
        <div className="space-y-3">
          {[
            { stage: 'Optimism', emoji: '&#128578;', desc: 'You&apos;ve found a strategy. It backtests well. You&apos;re ready to make money.', color: 'text-green-400', danger: 'Danger: unrealistic expectations. You haven&apos;t been tested yet.' },
            { stage: 'Excitement', emoji: '&#128640;', desc: 'First few wins confirm your beliefs. &quot;This actually works!&quot;', color: 'text-green-300', danger: 'Danger: you start increasing size or trading more frequently.' },
            { stage: 'Euphoria', emoji: '&#129321;', desc: 'Peak confidence. You feel invincible. You start telling friends.', color: 'text-amber-400', danger: 'MAXIMUM DANGER. This is where most money is lost. Overconfidence leads to oversized trades.' },
            { stage: 'Anxiety', emoji: '&#128543;', desc: 'A losing streak starts. You question the strategy for the first time.', color: 'text-orange-400', danger: 'Danger: you start tweaking your system mid-drawdown.' },
            { stage: 'Denial', emoji: '&#128528;', desc: '&quot;It&apos;ll come back. I just need one good trade.&quot;', color: 'text-orange-500', danger: 'Danger: you hold losers longer and cut winners shorter.' },
            { stage: 'Panic', emoji: '&#128561;', desc: 'The account is bleeding. Everything you do loses money.', color: 'text-red-400', danger: 'Danger: revenge trading, overtrading, abandoning all rules.' },
            { stage: 'Capitulation', emoji: '&#128557;', desc: '&quot;I quit. Trading doesn&apos;t work. I&apos;m not cut out for this.&quot;', color: 'text-red-500', danger: 'Many traders stop here permanently. But this is actually close to the turning point.' },
            { stage: 'Acceptance', emoji: '&#129504;', desc: 'You stop fighting the market. You accept losses as a cost. You commit to process over outcome.', color: 'text-blue-400', danger: 'This is where professional trading BEGINS. Most never reach this stage.' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <button onClick={() => setOpenStage(openStage === s.stage ? null : s.stage)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                <div className="flex items-center gap-3">
                  <span className="text-xl" dangerouslySetInnerHTML={{ __html: s.emoji }} />
                  <div>
                    <p className={`text-sm font-extrabold ${s.color}`}>{i + 1}. {s.stage}</p>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openStage === s.stage ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openStage === s.stage && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="px-4 pb-4 pt-2 space-y-2">
                      <p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: s.desc }} />
                      <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/15">
                        <p className="text-xs font-bold text-red-400 mb-1">&#9888;&#65039; Watch Out</p>
                        <p className="text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: s.danger }} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 06 — THE FIVE EMOTIONS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; The Five Deadly Emotions</p>
          <h2 className="text-2xl font-extrabold mb-2">Know Them. Name Them. Control Them.</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">Every bad trade can be traced back to one of five emotions. When you can <em>name</em> the emotion driving your decision in real-time, you&apos;ve already broken its power.</p>
        </motion.div>
        <div className="space-y-3">
          {[
            { name: 'Fear', emoji: '&#128560;', trigger: 'Open position going against you', result: 'Closing winners too early. Skipping valid signals. Moving stops closer.', antidote: 'Pre-calculate the worst case BEFORE entering. If you can&apos;t stomach the loss, your position is too big.' },
            { name: 'Greed', emoji: '&#129297;', trigger: 'Open position running in your favour', result: 'Removing take profit. Adding to winning positions. Overriding your plan to &quot;let it run.&quot;', antidote: 'Your take profit exists for a reason. Stick to the plan. You cannot capture every pip.' },
            { name: 'FOMO', emoji: '&#128561;', trigger: 'Watching a move happen without you', result: 'Chasing entries. Entering without setup confirmation. Trading outside your session.', antidote: 'The trade you missed was never yours. There are 252 trading days per year. Another setup is coming.' },
            { name: 'Revenge', emoji: '&#128544;', trigger: 'Taking a loss you feel was &quot;unfair&quot;', result: 'Doubling size. Taking unplanned trades. Breaking every rule in your system.', antidote: 'Circuit breaker: 2 losses = close charts for 2 hours. The money is gone. Revenge only adds to the damage.' },
            { name: 'Hope', emoji: '&#128591;', trigger: 'Holding a losing trade that should be closed', result: 'Moving stop loss further away. Averaging down. &quot;It&apos;ll come back.&quot;', antidote: 'Hope is not a strategy. If the trade has invalidated your thesis, close it. The market doesn&apos;t owe you anything.' },
          ].map((e, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <button onClick={() => setOpenEmotions(openEmotions === e.name ? null : e.name)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                <div className="flex items-center gap-3">
                  <span className="text-xl" dangerouslySetInnerHTML={{ __html: e.emoji }} />
                  <p className="text-sm font-extrabold text-white">{e.name}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openEmotions === e.name ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openEmotions === e.name && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="px-4 pb-4 pt-2 space-y-2">
                      <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/15"><p className="text-xs font-bold text-red-400 mb-1">Trigger</p><p className="text-sm text-gray-400">{e.trigger}</p></div>
                      <div className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/15"><p className="text-xs font-bold text-orange-400 mb-1">What It Causes</p><p className="text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: e.result }} /></div>
                      <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/15"><p className="text-xs font-bold text-green-400 mb-1">&#128138; Antidote</p><p className="text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: e.antidote }} /></div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 07 — PSYCHOLOGY MYTHS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Psychology Myths</p>
          <h2 className="text-2xl font-extrabold mb-2">What Everyone Gets Wrong</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">Trading psychology is surrounded by terrible advice. Let&apos;s destroy the four biggest myths.</p>
        </motion.div>
        <div className="space-y-3">
          {[
            { myth: '&quot;Just control your emotions&quot;', reality: 'You CANNOT control emotions. They&apos;re biological responses, not choices. What you CAN control is your RESPONSE to emotions. That&apos;s what systems, rules, and circuit breakers do &mdash; they create a gap between feeling and action.' },
            { myth: '&quot;Profitable traders don&apos;t feel fear&quot;', reality: 'Every trader feels fear. Even traders with 20 years of experience feel fear when a position goes against them. The difference is they have SYSTEMS that prevent fear from controlling their decisions. They feel it &mdash; then follow the plan anyway.' },
            { myth: '&quot;You need a high win rate to be confident&quot;', reality: 'Confidence comes from PROCESS, not win rate. A trader with 42% win rate and perfect process is more confident than a trader with 70% win rate who breaks rules. Confidence is knowing you did the right thing, regardless of outcome.' },
            { myth: '&quot;Psychology doesn&apos;t matter if your strategy is good enough&quot;', reality: 'The graveyard of trading accounts is full of profitable strategies executed by emotional traders. Strategy without psychology is a Ferrari without a driver. The strategy tells you what to do &mdash; psychology determines whether you actually do it.' },
          ].map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <button onClick={() => setOpenMyth(openMyth === m.myth ? null : m.myth)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                <p className="text-sm font-extrabold text-white" dangerouslySetInnerHTML={{ __html: `&#128683; Myth: ${m.myth}` }} />
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openMyth === m.myth ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openMyth === m.myth && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="px-4 pb-4 pt-2">
                      <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/15">
                        <p className="text-xs font-bold text-green-400 mb-1">&#9989; Reality</p>
                        <p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: m.reality }} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 08 — COMMON MISTAKES */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-4">Psychological Traps to Avoid</h2>
        </motion.div>
        <div className="space-y-3">
          {[
            { mistake: 'Treating trading like gambling', wrong: 'No plan, random entries, chasing moves, increasing size after losses.', right: 'Written plan, fixed criteria, pre-calculated risk. Trading is a BUSINESS, not a casino.', tip: 'If you wouldn&apos;t open a restaurant without a business plan, don&apos;t open a trade without one.' },
            { mistake: 'Changing strategy after every loss', wrong: 'Monday: trend following. Tuesday: mean reversion. Wednesday: scalping. You never give any strategy enough time to prove itself.', right: 'Commit to ONE strategy for at least 50 trades before evaluating. That&apos;s the minimum sample size to judge edge.', tip: 'Would you judge a diet after one meal? Give your strategy the same patience.' },
            { mistake: 'Comparing yourself to social media traders', wrong: 'Following accounts that show only wins. Feeling inadequate when your 2% month seems small next to someone&apos;s &quot;50% in a week.&quot;', right: 'Most social media trading is fake or cherry-picked. Compare yourself only to your own journal data from last month.', tip: 'If a trader shows 50% monthly returns and no losses, they&apos;re lying. Unfollow.' },
            { mistake: 'Ignoring the post-trade review', wrong: 'Closing a trade and immediately looking for the next one. Never reviewing what you did right or wrong.', right: 'Every trade gets a journal entry: emotion rating, process score, and lesson learned. The journal IS your psychologist.', tip: 'The trade isn&apos;t over when you close the position. It&apos;s over when you&apos;ve recorded what you learned.' },
          ].map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <button onClick={() => setOpenMistake(openMistake === m.mistake ? null : m.mistake)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                <p className="text-sm font-extrabold text-white">&#10060; {m.mistake}</p>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openMistake === m.mistake ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openMistake === m.mistake && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="px-4 pb-4 pt-2 space-y-2">
                      <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/15"><p className="text-xs font-bold text-red-400 mb-1">&#10060; Wrong</p><p className="text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: m.wrong }} /></div>
                      <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/15"><p className="text-xs font-bold text-green-400 mb-1">&#9989; Right</p><p className="text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: m.right }} /></div>
                      <p className="text-xs text-amber-400/60 italic" dangerouslySetInnerHTML={{ __html: `&#128161; ${m.tip}` }} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 09 — GAME */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Test Your Psychology</p>
          <h2 className="text-2xl font-extrabold mb-2">Discipline Game</h2>
          <p className="text-sm text-gray-400 mb-6">Five scenarios. Choose the disciplined response.</p>
        </motion.div>
        {!gameComplete ? (
          <div className="p-5 rounded-2xl glass-card">
            <p className="text-xs text-amber-400 font-bold mb-3">Round {gameRound + 1} of {gameScenarios.length}</p>
            <p className="text-sm font-bold text-white mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: currentGame.scenario }} />
            <div className="space-y-2">
              {currentGame.opts.map((opt, oi) => {
                const answered = gameAnswer !== null;
                const isCorrect = oi === currentGame.correct;
                const isChosen = gameAnswer === oi;
                let cls = 'glass text-gray-300 hover:bg-white/5';
                if (answered) { if (isCorrect) cls = 'bg-green-500/15 border-green-500/30 text-green-400'; else if (isChosen) cls = 'bg-red-500/15 border-red-500/30 text-red-400'; else cls = 'glass text-gray-600'; }
                return (<button key={oi} onClick={() => { if (!answered) { setGameAnswer(oi); if (oi === currentGame.correct) setGameScore(s => s + 1); } }} disabled={answered} className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt }} /> {answered && isCorrect && '\u2713'} {answered && isChosen && !isCorrect && '\u2717'}</button>);
              })}
            </div>
            {gameAnswer !== null && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15 text-sm text-gray-400 leading-relaxed mb-4"><span className="text-amber-400 font-bold">Explanation: </span><span dangerouslySetInnerHTML={{ __html: currentGame.explain }} /></div>
                {gameRound < gameScenarios.length - 1 ? (
                  <button onClick={() => { setGameRound(r => r + 1); setGameAnswer(null); }} className="w-full p-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all">Next Round &rarr;</button>
                ) : (
                  <button onClick={() => setGameComplete(true)} className="w-full p-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all">See Results &rarr;</button>
                )}
              </motion.div>
            )}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-8 glass-card rounded-2xl">
            <p className="text-5xl font-extrabold mb-2 text-amber-400">{gameScore}/{gameScenarios.length}</p>
            <p className="text-sm text-gray-400">{gameScore === 5 ? '&#129504; Perfect discipline. You think like a professional.' : gameScore >= 3 ? 'Good awareness. A few emotional blind spots to work on.' : 'Your emotions are still in control. Re-read the five deadly emotions above.'}</p>
          </motion.div>
        )}
      </section>

      {/* SECTION 10 — QUIZ */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Knowledge Check</p>
          <h2 className="text-2xl font-extrabold mb-6">The Trader&apos;s Mind Quiz</h2>
        </motion.div>
        <div className="space-y-6">
          {quizQuestions.map((q, qi) => (
            <motion.div key={qi} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="p-5 rounded-2xl glass-card">
              <p className="text-sm font-bold text-white mb-3" dangerouslySetInnerHTML={{ __html: `${qi + 1}. ${q.q}` }} />
              <div className="space-y-2">
                {q.opts.map((opt, oi) => {
                  const answered = quizAnswers[qi] !== null;
                  const isCorrect = oi === q.a;
                  const isChosen = quizAnswers[qi] === oi;
                  let cls = 'glass text-gray-300 hover:bg-white/5';
                  if (answered) { if (isCorrect) cls = 'bg-green-500/15 border-green-500/30 text-green-400'; else if (isChosen) cls = 'bg-red-500/15 border-red-500/30 text-red-400'; else cls = 'glass text-gray-600'; }
                  return (<button key={oi} onClick={() => { if (!answered) { const na = [...quizAnswers]; na[qi] = oi; setQuizAnswers(na); } }} disabled={answered} className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt }} /> {answered && isCorrect && '\u2713'} {answered && isChosen && !isCorrect && '\u2717'}</button>);
                })}
              </div>
              {quizAnswers[qi] !== null && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 text-sm text-gray-400 leading-relaxed"><span className="text-amber-400 font-bold">&#10003;</span> <span dangerouslySetInnerHTML={{ __html: q.explain }} /></motion.div>)}
            </motion.div>
          ))}
        </div>
        {quizDone && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 text-center p-8 glass-card rounded-2xl"><p className={`text-5xl font-extrabold mb-2 ${score >= 66 ? 'text-amber-400' : 'text-red-400'}`}>{score}%</p><p className="text-sm text-gray-400">{score === 100 ? '&#129504; Perfect. You understand the most important lesson in trading.' : score >= 66 ? 'Strong psychological awareness. Ready for Fear &amp; Greed.' : 'Review the iceberg model and the five emotions above.'}</p></motion.div>)}
      </section>

      {/* Certificate */}
      <section className="px-5 py-16 text-center">
        {!certUnlocked ? (
          <div className="max-w-md mx-auto p-8 glass rounded-2xl"><p className="text-4xl mb-3 opacity-30">&#128274;</p><p className="text-sm text-gray-500">Score 66%+ to unlock your <strong className="text-amber-400">Pro Certificate</strong></p></div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, type: 'spring' }}
            className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(239,68,68,0.06),transparent,rgba(251,191,36,0.04),transparent,rgba(34,197,94,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
            <div className="absolute inset-[1px] rounded-3xl border border-amber-500/10" />
            <div className="relative z-10">
              <div className="w-[80px] h-[80px] mx-auto mb-5 rounded-full bg-gradient-to-br from-red-500 via-amber-500 to-green-500 flex items-center justify-center text-4xl shadow-lg shadow-amber-500/20">&#129504;</div>
              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest mb-2">Pro Certificate</p>
              <h3 className="text-xl font-extrabold mb-1">Certificate of Mastery</h3>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">Has mastered<br /><strong className="text-white">Level 4.1: The Trader&apos;s Mind</strong><br />at ATLAS Academy by Interakktive</p>
              <p className="bg-gradient-to-r from-red-400 via-amber-400 to-green-400 bg-clip-text text-transparent font-bold text-lg mb-1" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Mind Reader &mdash;</p>
              <p className="font-mono text-[11px] text-gray-500 mb-4">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L4.1-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
            </div>
          </motion.div>
        )}
      </section>

      <section className="text-center px-5 pt-10 pb-24">
        <p className="text-xs tracking-widest uppercase text-gray-600 mb-4">Up Next</p>
        <h2 className="text-xl font-bold mb-6">Lesson 4.2 &mdash; Fear &amp; Greed &mdash; The Twin Killers</h2>
        <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">
          Continue <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
