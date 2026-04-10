// app/academy/lesson/performance-pressure/page.tsx
// ATLAS Academy — Lesson 4.13: Performance Under Pressure [PRO]
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
// AMYGDALA ANIMATION — Hijack vs rational pathway
// ============================================================
function AmygdalaAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);
    const midX = w / 2;
    const midY = h / 2;

    // Brain outline (simple oval)
    ctx.strokeStyle = 'rgba(148,163,184,0.12)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(midX, midY - 10, w * 0.28, h * 0.32, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Amygdala (small red circle, lower centre)
    const amyX = midX;
    const amyY = midY + 25;
    const amyPulse = Math.sin(f * 0.06) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(239,68,68,${0.15 * amyPulse})`;
    ctx.beginPath();
    ctx.arc(amyX, amyY, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(239,68,68,${0.3 * amyPulse})`;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = `rgba(239,68,68,${0.7 * amyPulse})`;
    ctx.fillText('AMYGDALA', amyX, amyY + 3);
    ctx.font = '6px system-ui';
    ctx.fillStyle = `rgba(239,68,68,${0.4 * amyPulse})`;
    ctx.fillText('Fight or Flight', amyX, amyY + 13);

    // Prefrontal cortex (green circle, upper)
    const pfcX = midX;
    const pfcY = midY - 45;
    const pfcPulse = Math.sin(f * 0.04 + 1) * 0.2 + 0.8;
    ctx.fillStyle = `rgba(34,197,94,${0.1 * pfcPulse})`;
    ctx.beginPath();
    ctx.arc(pfcX, pfcY, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(34,197,94,${0.25 * pfcPulse})`;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.font = 'bold 7px system-ui';
    ctx.fillStyle = `rgba(34,197,94,${0.7 * pfcPulse})`;
    ctx.fillText('PREFRONTAL', pfcX, pfcY);
    ctx.font = '6px system-ui';
    ctx.fillStyle = `rgba(34,197,94,${0.4 * pfcPulse})`;
    ctx.fillText('Logic & Planning', pfcX, pfcY + 10);

    // FAST pathway (red — stimulus → amygdala → reaction)
    const stimX = midX - w * 0.32;
    const stimY = midY;
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(239,68,68,0.4)';
    ctx.fillText('THREAT', stimX, stimY - 8);
    ctx.font = '6px system-ui';
    ctx.fillStyle = 'rgba(239,68,68,0.25)';
    ctx.fillText('(-$500 loss)', stimX, stimY + 4);

    // Fast arrow: stimulus → amygdala
    const fastProgress = ((f * 0.02) % 1);
    ctx.strokeStyle = `rgba(239,68,68,${0.25 + Math.sin(f * 0.05) * 0.1})`;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(stimX + 30, stimY);
    ctx.quadraticCurveTo(midX - 40, amyY + 20, amyX - 22, amyY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Fast dot travelling
    const ft = fastProgress;
    const fastDotX = (1 - ft) * (1 - ft) * (stimX + 30) + 2 * (1 - ft) * ft * (midX - 40) + ft * ft * (amyX - 22);
    const fastDotY = (1 - ft) * (1 - ft) * stimY + 2 * (1 - ft) * ft * (amyY + 20) + ft * ft * amyY;
    ctx.fillStyle = `rgba(239,68,68,${0.6 * (1 - ft * 0.5)})`;
    ctx.beginPath();
    ctx.arc(fastDotX, fastDotY, 3, 0, Math.PI * 2);
    ctx.fill();

    // Reaction (right side)
    const reactX = midX + w * 0.32;
    const reactY = midY + 10;
    ctx.strokeStyle = 'rgba(239,68,68,0.2)';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(amyX + 22, amyY);
    ctx.quadraticCurveTo(midX + 40, amyY + 15, reactX - 30, reactY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = 'bold 7px system-ui';
    ctx.fillStyle = 'rgba(239,68,68,0.5)';
    ctx.fillText('PANIC', reactX, reactY - 5);
    ctx.font = '6px system-ui';
    ctx.fillStyle = 'rgba(239,68,68,0.3)';
    ctx.fillText('Close trade NOW', reactX, reactY + 6);

    // SLOW pathway (green — stimulus → prefrontal → measured response)
    ctx.strokeStyle = `rgba(34,197,94,${0.2 + Math.sin(f * 0.03 + 2) * 0.08})`;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(stimX + 30, stimY - 15);
    ctx.quadraticCurveTo(midX - 50, pfcY - 20, pfcX - 22, pfcY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pfcX + 22, pfcY);
    ctx.quadraticCurveTo(midX + 50, pfcY - 15, reactX - 30, reactY - 35);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = 'bold 7px system-ui';
    ctx.fillStyle = 'rgba(34,197,94,0.5)';
    ctx.fillText('EVALUATE', reactX, reactY - 38);
    ctx.font = '6px system-ui';
    ctx.fillStyle = 'rgba(34,197,94,0.3)';
    ctx.fillText('Check the plan', reactX, reactY - 27);

    // Labels
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(239,68,68,0.3)';
    ctx.fillText('FAST (12ms)', stimX - 15, h - 15);
    ctx.fillStyle = 'rgba(34,197,94,0.3)';
    ctx.textAlign = 'right';
    ctx.fillText('SLOW (500ms)', w - 15, h - 15);
  }, []);
  return <AnimScene drawFn={draw} height={270} />;
}

// ============================================================
// BREATHING ANIMATION — Box breathing 4-4-4-4 cycle
// ============================================================
function BreathingAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);
    const midX = w / 2;
    const midY = h / 2;
    const boxSize = Math.min(w, h) * 0.3;

    // Total cycle: 16 seconds (4 phases × 4 seconds). At 60fps → 960 frames per cycle
    const cycleLen = 960;
    const phase = Math.floor((f % cycleLen) / (cycleLen / 4));
    const phaseProgress = ((f % cycleLen) % (cycleLen / 4)) / (cycleLen / 4);

    const phases = [
      { label: 'INHALE', instruction: 'Breathe in...', color: '#3b82f6' },
      { label: 'HOLD', instruction: 'Hold...', color: '#22c55e' },
      { label: 'EXHALE', instruction: 'Breathe out...', color: '#eab308' },
      { label: 'HOLD', instruction: 'Hold...', color: '#a855f7' },
    ];

    // Box outline
    const bx = midX - boxSize / 2;
    const by = midY - boxSize / 2;
    ctx.strokeStyle = 'rgba(148,163,184,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect(bx, by, boxSize, boxSize);
    ctx.stroke();

    // Corner labels
    const corners = [
      { x: bx, y: by, label: '4s' },
      { x: bx + boxSize, y: by, label: '4s' },
      { x: bx + boxSize, y: by + boxSize, label: '4s' },
      { x: bx, y: by + boxSize, label: '4s' },
    ];
    corners.forEach((c, i) => {
      ctx.fillStyle = i === phase ? `rgba(255,255,255,0.4)` : 'rgba(148,163,184,0.15)';
      ctx.beginPath();
      ctx.arc(c.x, c.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Travelling dot
    let dotX = bx, dotY = by;
    if (phase === 0) { dotX = bx + phaseProgress * boxSize; dotY = by; }
    else if (phase === 1) { dotX = bx + boxSize; dotY = by + phaseProgress * boxSize; }
    else if (phase === 2) { dotX = bx + boxSize - phaseProgress * boxSize; dotY = by + boxSize; }
    else { dotX = bx; dotY = by + boxSize - phaseProgress * boxSize; }

    const cp = phases[phase];
    const r = parseInt(cp.color.slice(1, 3), 16);
    const g = parseInt(cp.color.slice(3, 5), 16);
    const b = parseInt(cp.color.slice(5, 7), 16);

    // Trace line
    ctx.strokeStyle = `rgba(${r},${g},${b},0.3)`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (phase === 0) { ctx.moveTo(bx, by); ctx.lineTo(dotX, dotY); }
    else if (phase === 1) { ctx.moveTo(bx, by); ctx.lineTo(bx + boxSize, by); ctx.lineTo(dotX, dotY); }
    else if (phase === 2) { ctx.moveTo(bx, by); ctx.lineTo(bx + boxSize, by); ctx.lineTo(bx + boxSize, by + boxSize); ctx.lineTo(dotX, dotY); }
    else { ctx.moveTo(bx, by); ctx.lineTo(bx + boxSize, by); ctx.lineTo(bx + boxSize, by + boxSize); ctx.lineTo(bx, by + boxSize); ctx.lineTo(dotX, dotY); }
    ctx.stroke();

    // Dot
    ctx.fillStyle = `rgba(${r},${g},${b},0.8)`;
    ctx.beginPath();
    ctx.arc(dotX, dotY, 6, 0, Math.PI * 2);
    ctx.fill();
    // Glow
    const glow = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, 20);
    glow.addColorStop(0, `rgba(${r},${g},${b},0.15)`);
    glow.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(dotX, dotY, 20, 0, Math.PI * 2);
    ctx.fill();

    // Central instruction
    ctx.font = 'bold 14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = `rgba(${r},${g},${b},0.7)`;
    ctx.fillText(cp.label, midX, midY - 5);
    ctx.font = '10px system-ui';
    ctx.fillStyle = `rgba(${r},${g},${b},0.4)`;
    ctx.fillText(cp.instruction, midX, midY + 12);

    // Timer countdown
    const secondsLeft = Math.ceil(4 * (1 - phaseProgress));
    ctx.font = 'bold 10px system-ui';
    ctx.fillStyle = `rgba(${r},${g},${b},0.5)`;
    ctx.fillText(`${secondsLeft}`, midX, midY + 28);

    // Bottom label
    ctx.font = '8px system-ui';
    ctx.fillStyle = 'rgba(148,163,184,0.3)';
    ctx.fillText('BOX BREATHING — 4 · 4 · 4 · 4', midX, h - 12);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// DATA
// ============================================================
const hijackSigns = [
  { sign: 'Tunnel vision', desc: 'You can only see the current trade. The bigger picture &mdash; your plan, your daily limit, your process &mdash; disappears. All that exists is this one position and its P&amp;L.', body: 'Eyes fixed on chart, peripheral awareness gone.' },
  { sign: 'Racing heartbeat', desc: 'Your pulse increases noticeably. You might feel it in your chest or neck. This is adrenaline flooding your system &mdash; your body is preparing to fight or flee, not to analyse.', body: 'Heart rate elevated 20-40 BPM above baseline.' },
  { sign: 'Impulsive clicking', desc: 'You feel the urge to DO something immediately. Close the trade. Open another. Move the stop. The delay between thought and action collapses to near-zero.', body: 'Fingers hovering over buttons, micro-movements, restlessness.' },
  { sign: 'Black-and-white thinking', desc: '&ldquo;This trade MUST work&rdquo; or &ldquo;I&apos;m going to lose EVERYTHING.&rdquo; Nuance disappears. Probability thinking is replaced by certainty thinking &mdash; and certainty is always wrong in markets.', body: 'Jaw clenched, breathing shallow, muscles tense.' },
  { sign: 'Time distortion', desc: 'Seconds feel like hours. A 1-minute candle feels like an eternity. You refresh the chart compulsively, looking for confirmation of what you fear or hope.', body: 'Checking chart every 2-3 seconds, unable to look away.' },
];

const tenSecondRule = [
  { step: '1. NOTICE', desc: 'Recognise the physical signs: heart rate up, jaw clenched, tunnel vision, urge to click. Simply noticing the hijack weakens it. Name it: &ldquo;I&apos;m being hijacked right now.&rdquo;', time: '2 seconds' },
  { step: '2. HANDS OFF', desc: 'Remove your hands from the mouse and keyboard. Physically. Put them in your lap or behind your head. You cannot make an impulsive trade if your hands aren&apos;t touching the controls.', time: '1 second' },
  { step: '3. BREATHE', desc: 'One deep breath. In for 4 seconds, out for 4 seconds. This activates the parasympathetic nervous system, which PHYSIOLOGICALLY calms the fight-or-flight response.', time: '4 seconds' },
  { step: '4. ASK', desc: 'One question: &ldquo;What does my plan say?&rdquo; Not &ldquo;What do I feel?&rdquo; Not &ldquo;What might happen?&rdquo; What. Does. My. Plan. Say. The plan was written when you were calm and rational.', time: '2 seconds' },
  { step: '5. ACT (or don&apos;t)', desc: 'Execute ONLY what the plan says. If the plan says hold, you hold. If the plan says exit at -1R, you exit at -1R. If the plan says nothing about this situation, you do NOTHING.', time: '1 second' },
];

const pressureSources = [
  { source: 'Real money at stake', desc: 'The transition from demo to live adds a layer of emotional weight that changes decision-making. £50 on a demo account means nothing. £50 of YOUR money activates loss aversion.', solution: 'Start live trading at reduced size (0.5R). Gradually increase as you prove process compliance with real money at stake.' },
  { source: 'Prop firm evaluation pressure', desc: 'The clock is ticking. You have a target to hit and a drawdown limit that terminates the account. Every trade feels like it matters disproportionately.', solution: 'Reframe: the evaluation measures PROCESS, not a single trade. One loss doesn&apos;t fail the challenge. A broken process does.' },
  { source: 'Public accountability', desc: 'You told friends or social media you&apos;re a trader. Now every loss feels like a public failure. You start trading to prove something instead of to follow the plan.', solution: 'Stop sharing live results. Share PROCESS wins instead: &ldquo;I sat out today because no setup met my criteria.&rdquo; That&apos;s more impressive than a P&amp;L screenshot.' },
  { source: 'Financial necessity', desc: 'You NEED this trade to work because rent is due, or debt is mounting, or you quit your job to trade. This is the most dangerous pressure because it removes your ability to accept losses.', solution: 'Never trade with money you can&apos;t afford to lose. If trading income is needed for survival, keep a day job and trade part-time until capital is sufficient.' },
];

const techniques = [
  { name: 'Box Breathing (4-4-4-4)', desc: 'Inhale 4 seconds, hold 4 seconds, exhale 4 seconds, hold 4 seconds. Repeat 3 cycles. Used by Navy SEALs before high-stress operations. Activates the parasympathetic nervous system within 60 seconds.', when: 'Before every trading session (preventive) and during any emotional spike (reactive).' },
  { name: 'The Physical Reset', desc: 'Stand up. Walk to a different room. Splash cold water on your face. The physical movement interrupts the neural loop that&apos;s feeding the emotional reaction. Your brain cannot maintain a panic state while performing novel physical actions.', when: 'After any loss that triggers an emotional reaction. After any trade where you feel the urge to immediately re-enter.' },
  { name: 'The Pre-Commitment Statement', desc: 'Before each session, write (or say aloud): &ldquo;Today I will follow my plan. If I take a loss, I will breathe and check my plan. I accept that losing trades are part of the process.&rdquo; This primes the rational brain before pressure arrives.', when: 'Every single session, no exceptions. Written in journal or spoken aloud during pre-session routine.' },
  { name: 'The Scenario Rehearsal', desc: 'Before you trade, mentally walk through the worst case: &ldquo;If this trade hits my stop loss, I will lose 1R. I will feel frustrated. I will breathe. I will check my plan. I will NOT revenge trade.&rdquo; Mental rehearsal prepares the brain for the emotional impact.', when: 'Before every trade entry. Takes 15 seconds and dramatically reduces emotional surprise.' },
];

const myths = [
  { myth: '&ldquo;Professional traders don&apos;t feel pressure&rdquo;', reality: 'They feel it every day. The difference: they have systems to manage it. Box breathing, the 10-second rule, pre-commitment statements. They don&apos;t eliminate pressure &mdash; they have protocols for operating under it.' },
  { myth: '&ldquo;Pressure makes me perform better — I trade best under stress&rdquo;', reality: 'This is adrenaline masquerading as performance. Studies show that decision quality degrades under stress. You FEEL sharper, but your risk assessment, patience, and discipline all decline. What feels like peak performance is often peak recklessness.' },
  { myth: '&ldquo;Just relax and you&apos;ll trade better&rdquo;', reality: '&ldquo;Just relax&rdquo; is useless advice. Relaxation under pressure requires specific techniques practised in advance. You can&apos;t remember to box breathe in a crisis if you&apos;ve never practised it in calm conditions.' },
  { myth: '&ldquo;Meditation is the only way to manage trading stress&rdquo;', reality: 'Meditation helps but it&apos;s not the only tool. The 10-second rule, physical resets, pre-commitment statements, and scenario rehearsal are all equally effective and more immediately applicable to live trading.' },
];

const mistakes = [
  { wrong: 'Trading through emotional hijacks without pausing', right: 'Recognise the signs (tunnel vision, racing heart, impulse to click). Hands off the mouse. 10-second rule. EVERY time. It takes practice, but it becomes automatic.', emoji: '&#128104;&zwj;&#128187;' },
  { wrong: 'Only practising breathing techniques when already stressed', right: 'Practise box breathing when calm so it becomes muscle memory. During a hijack, you don&apos;t &ldquo;decide&rdquo; to breathe &mdash; your training takes over. Like a fire drill.', emoji: '&#128168;' },
  { wrong: 'Using caffeine or stimulants to stay &ldquo;sharp&rdquo; during sessions', right: 'Caffeine amplifies the stress response: higher heart rate, more adrenaline, faster reaction time but WORSE decision quality. Trade with water, not coffee. Or limit to one cup before the session.', emoji: '&#9749;' },
  { wrong: 'Ignoring physical symptoms of stress', right: 'Your body knows before your mind does. Tense shoulders, shallow breathing, clenched jaw &mdash; these are EARLY warnings. Catch them and you prevent the full hijack.', emoji: '&#129506;' },
];

const gameScenarios = [
  { scenario: 'You&apos;re in a live trade. Price suddenly spikes against you &mdash; you&apos;re now -0.7R and approaching your stop. Your heart is pounding. Your finger hovers over the close button. You think: &ldquo;If I close now, I save 0.3R.&rdquo; What do you do?', options: ['Close immediately &mdash; saving 0.3R is better than losing 1R', 'Hands off the mouse. One breath. &ldquo;What does my plan say?&rdquo; If the plan says stop loss at -1R, you let it hit. The plan was written when you were rational.', 'Move the stop wider to give the trade more room'], correct: 1, explain: 'The amygdala is screaming &ldquo;CLOSE!&rdquo; but your plan says -1R stop. The 10-second rule interrupts the hijack. Your stop was set for a reason. Closing early at -0.7R feels like &ldquo;saving&rdquo; but it destroys your R:R over hundreds of trades.' },
  { scenario: 'You&apos;re 20 minutes into your session. You haven&apos;t taken a trade yet. Your friend messages: &ldquo;Gold is flying! Get in!&rdquo; You feel the FOMO spike. Tunnel vision on Gold. Heart rate elevated. What do you do?', options: ['Open Gold and look for an entry &mdash; your friend is usually right', 'Recognise the hijack: FOMO spike, tunnel vision, elevated heart rate. Hands off mouse. Breathe. &ldquo;Is Gold on my watchlist? Does my plan have a setup?&rdquo; If no: close the message and continue waiting.', 'Open a small position just to &ldquo;be part of it&rdquo;'], correct: 1, explain: 'You correctly identified three hijack signs (FOMO, tunnel vision, heart rate). The 10-second rule interrupts the cycle. If Gold isn&apos;t on your plan, someone else&apos;s trade is irrelevant to your process.' },
  { scenario: 'You&apos;re in a prop firm evaluation. Day 9 of 30. You&apos;re at +4.2% (target: 8%). You take a -1R loss. Then another. You&apos;re now at +2.2%. The pressure builds: &ldquo;I&apos;m running out of time.&rdquo; What do you do?', options: ['Increase position size to recover the lost ground faster', 'Breathe. Reframe: 21 days remain. At +2.2%, I need +5.8% in 21 days = +0.28% per day. That&apos;s achievable at normal 1R risk. The pressure is an illusion created by recency.', 'Take the rest of the day off and come back fresh tomorrow at 2x size'], correct: 1, explain: 'The reframe dissolves the pressure. +0.28% per day is less than 1 winning trade. 21 days is plenty. The amygdala says &ldquo;running out of time&rdquo; because it only sees the recent losses, not the remaining runway.' },
  { scenario: 'You notice your jaw is clenched and your shoulders are tense. You haven&apos;t taken a trade yet. No specific trigger. You just feel &ldquo;on edge.&rdquo; What should you do?', options: ['Ignore it &mdash; you haven&apos;t done anything wrong yet', 'Physical reset: stand up, walk to another room, splash cold water, 2 rounds of box breathing. Return only when the tension has released. Your body is sending early warning signals &mdash; listen to them.', 'Start trading to distract yourself from the feeling'], correct: 1, explain: 'Physical symptoms are EARLY warnings. Your body detected stress before your conscious mind did. The physical reset interrupts the building tension before it becomes a full hijack. Trading while tense produces tense decisions.' },
  { scenario: 'Before your session, you do your pre-commitment statement: &ldquo;Today I follow my plan. If I lose, I breathe and check my plan.&rdquo; Then your first trade is a -1R stop-out within 3 minutes. You feel the anger rising. But something is different &mdash; you remember the statement. What happens next?', options: ['The statement doesn&apos;t help in the moment &mdash; you take a revenge trade anyway', 'The pre-commitment primed your rational brain. You recognise the anger, breathe, check your plan. The plan says: wait for next A+ setup. You wait. The system worked.', 'You take a smaller revenge trade as a compromise'], correct: 1, explain: 'This is the pre-commitment statement working exactly as designed. It primes the prefrontal cortex BEFORE the amygdala fires. The anger still comes, but the rational pathway is already active and wins the competition. This is trainable.' },
];

const quizQuestions = [
  { q: 'What is the amygdala hijack?', opts: ['A trading strategy based on fast reactions', 'When the emotional brain overrides the rational brain, causing impulsive decisions before logic can intervene', 'A type of market manipulation', 'When you forget your trading plan'], a: 1, explain: 'The amygdala processes threats in 12 milliseconds. The prefrontal cortex (logic) takes 500+ milliseconds. In that gap, the emotional brain can trigger impulsive actions &mdash; like closing a trade early or revenge trading &mdash; before rationality catches up.' },
  { q: 'What is the FIRST step of the 10-second rule?', opts: ['Take a deep breath', 'Remove your hands from the mouse', 'NOTICE the physical signs of hijack (heart rate, tunnel vision, impulse to click)', 'Check your trading plan'], a: 2, explain: 'The first step is NOTICE. Simply recognising &ldquo;I&apos;m being hijacked right now&rdquo; weakens the hijack. You can&apos;t interrupt what you haven&apos;t identified. Physical signs are the earliest detectable signals.' },
  { q: 'How long does one full box breathing cycle take?', opts: ['4 seconds', '8 seconds', '12 seconds', '16 seconds (4 in, 4 hold, 4 out, 4 hold)'], a: 3, explain: '16 seconds per cycle: inhale 4s, hold 4s, exhale 4s, hold 4s. Three cycles (48 seconds) is enough to significantly activate the parasympathetic nervous system and reduce the fight-or-flight response.' },
  { q: 'Why should you practise breathing techniques when CALM, not just during stress?', opts: ['Because calm practice is more enjoyable', 'Because during a hijack, you don&apos;t &ldquo;decide&rdquo; to breathe &mdash; your training takes over automatically, like a fire drill', 'Because calm breathing has separate health benefits', 'Because your coach recommended it'], a: 1, explain: 'Under stress, the prefrontal cortex is partially disabled. You can&apos;t access techniques you haven&apos;t practised. But trained responses become automatic &mdash; like muscle memory. Practise when calm so the technique fires when you need it.' },
  { q: 'What is a pre-commitment statement?', opts: ['A verbal contract with your broker', 'A written or spoken declaration of your intended behaviour BEFORE the session, priming the rational brain to override emotional reactions', 'A type of trading order', 'A promise to make a certain amount of profit'], a: 1, explain: 'The pre-commitment statement primes the prefrontal cortex before pressure arrives. When the amygdala fires, the rational pathway is already active and has a head start in the competition for control.' },
  { q: 'Your shoulders are tense and your jaw is clenched, but you haven&apos;t taken any trades yet. What should you do?', opts: ['Ignore it and start trading', 'Physical reset: stand up, move, cold water, box breathing. Body symptoms are early warnings of a building stress response.', 'Drink caffeine to sharpen focus', 'Trade quickly before the stress gets worse'], a: 1, explain: 'Physical symptoms are early warnings. Your body detects stress before your conscious mind does. A physical reset interrupts the building tension before it becomes a full amygdala hijack.' },
  { q: 'Why does the 10-second rule say &ldquo;hands off the mouse&rdquo;?', opts: ['To prevent RSI', 'Because you physically cannot make an impulsive trade if your hands aren&apos;t touching the controls', 'To force you to use keyboard shortcuts instead', 'Because mice are unsanitary'], a: 1, explain: 'The physical barrier is deliberate. During a hijack, the gap between impulse and action collapses. Removing your hands from the controls adds a physical delay that gives the rational brain time to catch up.' },
  { q: 'What is the most dangerous myth about trading under pressure?', opts: ['&ldquo;Pressure makes me perform better&rdquo; &mdash; adrenaline feels like performance but actually degrades risk assessment, patience, and discipline', '&ldquo;Meditation helps&rdquo;', '&ldquo;Trading is stressful&rdquo;', '&ldquo;Losses happen&rdquo;'], a: 0, explain: 'Believing pressure HELPS is dangerous because it removes the motivation to manage it. Studies show decision quality degrades under stress. The feeling of sharpness is adrenaline, not accuracy. Peak recklessness feels like peak performance.' },
];

export default function PerformancePressurePage() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h); }, []);

  const [openSign, setOpenSign] = useState<string | null>(null);
  const [openSource, setOpenSource] = useState<string | null>(null);
  const [openTechnique, setOpenTechnique] = useState<string | null>(null);
  const [openMyth, setOpenMyth] = useState<string | null>(null);
  const [openMistake, setOpenMistake] = useState<string | null>(null);

  // Game
  const [gameRound, setGameRound] = useState(0);
  const [gameAnswer, setGameAnswer] = useState<number | null>(null);
  const [gameScore, setGameScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  // Quiz
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
          <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 4 &middot; Lesson 13</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight"><span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Performance Under Pressure</span></h1>
          <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">When the lizard brain takes over. The amygdala hijack, breathing techniques, and the 10-second rule.</p>
        </motion.div>
      </section>

      {/* S00 — WHY THIS MATTERS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-lg font-bold text-white mb-3">&#129504; Your brain has two decision systems. The fast one (amygdala) processes threats in 12 milliseconds &mdash; before you&apos;re consciously aware of them. The slow one (prefrontal cortex) takes 500+ milliseconds to evaluate rationally.</p>
            <p className="text-gray-400 leading-relaxed mb-4">When price spikes against you, the amygdala fires <strong className="text-red-400">40 times faster</strong> than your rational mind. In that gap, it can trigger a panic close, a revenge entry, or a stop-move before you&apos;ve had a single conscious thought.</p>
            <p className="text-gray-400 leading-relaxed mb-4">This is called the <strong className="text-amber-400">amygdala hijack</strong>. It evolved to save you from tigers. In trading, it destroys accounts. The tiger is a -$500 unrealised loss &mdash; and your brain treats it identically to a physical threat.</p>
            <p className="text-gray-400 leading-relaxed">This lesson gives you <strong className="text-white">specific, trainable techniques</strong> to interrupt the hijack and give your rational brain time to catch up. These aren&apos;t theory &mdash; they&apos;re used by military operators, surgeons, and elite athletes.</p>
          </div>
          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">A trader reviewed 6 months of journal data and found that trades closed within 10 seconds of a price spike against him lost an average of 0.4R more than if he had simply let them hit his planned stop. He was &ldquo;saving&rdquo; himself from -1R stops by closing at -0.6R to -0.8R &mdash; but the trades that would have recovered (62% of them) were also being killed. His panic exits cost him +37R over 6 months.</p>
          </div>
        </motion.div>
      </section>

      {/* S01 — THE AMYGDALA */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Amygdala Hijack</p>
          <h2 className="text-2xl font-extrabold mb-4">12 Milliseconds vs 500 Milliseconds</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The fast pathway fires before the slow pathway can intervene. Your job: create a DELAY that gives the rational brain time to catch up.</p>
          <div className="mb-6 rounded-2xl overflow-hidden border border-white/5">
            <AmygdalaAnimation />
          </div>
        </motion.div>
      </section>

      {/* S02 — HIJACK SIGNS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; Recognise the Hijack</p>
          <h2 className="text-2xl font-extrabold mb-4">Five Signs You&apos;re Being Hijacked</h2>
          <p className="text-gray-400 leading-relaxed mb-6">You can&apos;t interrupt what you can&apos;t identify. Learn to recognise these signals &mdash; they appear BEFORE the impulsive action.</p>
          <div className="space-y-3">
            {hijackSigns.map(s => (
              <div key={s.sign}>
                <button onClick={() => setOpenSign(openSign === s.sign ? null : s.sign)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <p className="text-sm font-bold text-white">&#128680; {s.sign}</p>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSign === s.sign ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openSign === s.sign && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden"><div className="p-4 mx-2 mt-1 rounded-xl bg-white/[0.02] border border-white/5 space-y-2"><p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: s.desc }} /><p className="text-xs text-amber-400"><strong>Physical sign:</strong> {s.body}</p></div></motion.div>)}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S03 — THE 10-SECOND RULE */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The 10-Second Rule</p>
          <h2 className="text-2xl font-extrabold mb-4">Your Emergency Protocol</h2>
          <p className="text-gray-400 leading-relaxed mb-6">10 seconds is all it takes to transfer control from the amygdala back to the prefrontal cortex. Memorise these five steps.</p>
          <div className="space-y-3">
            {tenSecondRule.map((s, i) => (
              <div key={i} className="p-4 rounded-xl glass-card">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-bold text-amber-400">{s.step}</p>
                  <span className="text-[10px] text-gray-500 bg-amber-500/10 px-2 py-0.5 rounded flex-shrink-0">{s.time}</span>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: s.desc }} />
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S04 — BOX BREATHING */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Box Breathing</p>
          <h2 className="text-2xl font-extrabold mb-4">The Navy SEAL Technique</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Follow the dot. 4 seconds inhale, 4 seconds hold, 4 seconds exhale, 4 seconds hold. 3 cycles = 48 seconds to reset your nervous system.</p>
          <div className="rounded-2xl overflow-hidden border border-white/5">
            <BreathingAnimation />
          </div>
        </motion.div>
      </section>

      {/* S05 — PRESSURE SOURCES */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Sources of Pressure</p>
          <h2 className="text-2xl font-extrabold mb-4">Where the Pressure Comes From</h2>
          <div className="space-y-3">
            {pressureSources.map(p => (
              <div key={p.source}>
                <button onClick={() => setOpenSource(openSource === p.source ? null : p.source)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <p className="text-sm font-bold text-white">{p.source}</p>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSource === p.source ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openSource === p.source && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden"><div className="p-4 mx-2 mt-1 rounded-xl bg-white/[0.02] border border-white/5 space-y-2"><p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: p.desc }} /><p className="text-xs text-green-400"><strong>Solution:</strong> <span dangerouslySetInnerHTML={{ __html: p.solution }} /></p></div></motion.div>)}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S06 — TECHNIQUES */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; The Toolkit</p>
          <h2 className="text-2xl font-extrabold mb-4">Four Techniques for Performing Under Pressure</h2>
          <div className="space-y-3">
            {techniques.map(t => (
              <div key={t.name}>
                <button onClick={() => setOpenTechnique(openTechnique === t.name ? null : t.name)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <p className="text-sm font-bold text-white">{t.name}</p>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openTechnique === t.name ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openTechnique === t.name && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden"><div className="p-4 mx-2 mt-1 rounded-xl bg-white/[0.02] border border-white/5 space-y-2"><p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: t.desc }} /><p className="text-xs text-amber-400"><strong>When to use:</strong> <span dangerouslySetInnerHTML={{ __html: t.when }} /></p></div></motion.div>)}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S07 — MYTHS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Myths Busted</p>
          <h2 className="text-2xl font-extrabold mb-4">Pressure Myths That Cost You</h2>
          <div className="space-y-3">
            {myths.map(m => (
              <div key={m.myth}>
                <button onClick={() => setOpenMyth(openMyth === m.myth ? null : m.myth)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <p className="text-sm font-bold text-white" dangerouslySetInnerHTML={{ __html: m.myth }} />
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openMyth === m.myth ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openMyth === m.myth && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden"><div className="p-4 mx-2 mt-1 rounded-xl bg-white/[0.02] border border-white/5"><p className="text-xs font-bold text-green-400 mb-1">&#10003; Reality:</p><p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: m.reality }} /></div></motion.div>)}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S08 — COMMON MISTAKES */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-4">What Most Traders Get Wrong</h2>
          <div className="space-y-3">
            {mistakes.map(m => (
              <div key={m.wrong}>
                <button onClick={() => setOpenMistake(openMistake === m.wrong ? null : m.wrong)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <div className="flex items-center gap-3"><span dangerouslySetInnerHTML={{ __html: m.emoji }} /><p className="text-sm font-bold text-white" dangerouslySetInnerHTML={{ __html: `&#10060; ${m.wrong}` }} /></div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openMistake === m.wrong ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openMistake === m.wrong && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden"><div className="p-4 mx-2 mt-1 rounded-xl bg-white/[0.02] border border-white/5"><p className="text-xs font-bold text-green-400 mb-1">&#10003; Instead:</p><p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: m.right }} /></div></motion.div>)}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S09 — GAME */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Discipline Game</p>
          <h2 className="text-2xl font-extrabold mb-6">Pressure Decisions &mdash; 5 Scenarios</h2>
          {!gameComplete ? (
          <div className="p-5 rounded-2xl glass-card">
            <p className="text-xs text-amber-400 font-bold mb-4">Round {gameRound + 1} of {gameScenarios.length}</p>
            <p className="text-sm text-gray-300 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: currentGame.scenario }} />
            <div className="space-y-2">
              {currentGame.options.map((opt, oi) => {
                const answered = gameAnswer !== null;
                const isCorrect = oi === currentGame.correct;
                const isChosen = gameAnswer === oi;
                let cls = 'glass text-gray-300 hover:bg-white/5';
                if (answered) { if (isCorrect) cls = 'bg-green-500/15 border-green-500/30 text-green-400'; else if (isChosen) cls = 'bg-red-500/15 border-red-500/30 text-red-400'; else cls = 'glass text-gray-600'; }
                return (<button key={oi} onClick={() => { if (!answered) { setGameAnswer(oi); if (oi === currentGame.correct) setGameScore(s => s + 1); } }} disabled={answered} className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt }} /> {answered && isCorrect && '\u2713'} {answered && isChosen && !isCorrect && '\u2717'}</button>);
              })}
            </div>
            {gameAnswer !== null && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 text-sm text-gray-400 leading-relaxed"><span dangerouslySetInnerHTML={{ __html: currentGame.explain }} /></motion.div>)}
            {gameAnswer !== null && (
              <div className="mt-4">
                {gameRound < gameScenarios.length - 1 ? (
                  <button onClick={() => { setGameRound(r => r + 1); setGameAnswer(null); }} className="w-full p-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all">Next Round &rarr;</button>
                ) : (
                  <button onClick={() => setGameComplete(true)} className="w-full p-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all">See Results &rarr;</button>
                )}
              </div>
            )}
          </div>
          ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-8 glass-card rounded-2xl">
            <p className="text-4xl font-extrabold text-amber-400 mb-2">{gameScore}/{gameScenarios.length}</p>
            <p className="text-sm text-gray-400">{gameScore === 5 ? 'Perfect composure. The amygdala doesn\'t stand a chance.' : gameScore >= 3 ? 'Good pressure management. Practise box breathing daily.' : 'The hijack is winning. Memorise the 10-second rule and practise it.'}</p>
          </motion.div>
          )}
        </motion.div>
      </section>

      {/* S10 — QUIZ */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Knowledge Check</p>
          <h2 className="text-2xl font-extrabold mb-6">Performance Under Pressure Quiz</h2>
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
        {quizDone && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 text-center p-8 glass-card rounded-2xl"><p className={`text-5xl font-extrabold mb-2 ${score >= 66 ? 'text-amber-400' : 'text-red-400'}`}>{score}%</p><p className="text-sm text-gray-400">{score === 100 ? '&#129504; Perfect. You control the hijack, not the other way around.' : score >= 66 ? 'Strong pressure awareness. Now practise these techniques daily.' : 'Review the amygdala hijack and the 10-second rule.'}</p></motion.div>)}
      </section>

      {/* Certificate */}
      <section className="px-5 py-16 text-center">
        {!certUnlocked ? (
          <div className="max-w-md mx-auto p-8 glass rounded-2xl"><p className="text-4xl mb-3 opacity-30">&#128274;</p><p className="text-sm text-gray-500">Score 66%+ to unlock your <strong className="text-amber-400">Pro Certificate</strong></p></div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, type: 'spring' }}
            className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(59,130,246,0.06),transparent,rgba(34,197,94,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
            <div className="absolute inset-[1px] rounded-3xl border border-amber-500/10" />
            <div className="relative z-10">
              <div className="w-[80px] h-[80px] mx-auto mb-5 rounded-full bg-gradient-to-br from-blue-500 via-green-500 to-amber-500 flex items-center justify-center text-4xl shadow-lg shadow-blue-500/20">&#129504;</div>
              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest mb-2">Pro Certificate</p>
              <h3 className="text-xl font-extrabold mb-1">Certificate of Mastery</h3>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">Has mastered<br /><strong className="text-white">Level 4.13: Performance Under Pressure</strong><br />at ATLAS Academy by Interakktive</p>
              <p className="bg-gradient-to-r from-blue-400 via-green-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Pressure Master &mdash;</p>
              <p className="font-mono text-[11px] text-gray-500 mb-4">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L4.13-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
            </div>
          </motion.div>
        )}
      </section>

      <section className="text-center px-5 pt-10 pb-24">
        <p className="text-xs tracking-widest uppercase text-gray-600 mb-4">Up Next</p>
        <h2 className="text-xl font-bold mb-6">Lesson 4.14 &mdash; Building Your Mental Edge (Capstone)</h2>
        <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">
          Continue <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
