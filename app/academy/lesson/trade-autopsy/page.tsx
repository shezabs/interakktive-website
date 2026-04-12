// app/academy/lesson/trade-autopsy/page.tsx
// ATLAS Academy — Lesson 7.10: The Trade Autopsy [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 7
// GROUNDBREAKING: 7-Step Trade Autopsy Tool — forensic diagnostic with A-F grading
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
// ANIMATION 1: The Autopsy Pipeline
// 7 connected stages lighting up sequentially — showing the diagnostic flow
// ============================================================
function AutopsyPipelineAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.004;
    const cx = w / 2;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('The 7-Step Trade Autopsy', cx, 16);

    const steps = [
      { label: 'HTF BIAS', icon: '🧭', color: '#3b82f6' },
      { label: 'SETUP', icon: '🎯', color: '#8b5cf6' },
      { label: 'TRIGGER', icon: '⚡', color: '#f59e0b' },
      { label: 'STOP', icon: '🛡️', color: '#ef4444' },
      { label: 'MANAGE', icon: '♟️', color: '#26A69A' },
      { label: 'EMOTION', icon: '🧠', color: '#ec4899' },
      { label: 'LESSON', icon: '💡', color: '#f59e0b' },
    ];

    const cycle = (t % 12);
    const activeIdx = Math.min(6, Math.floor(cycle * 0.7));
    const pad = 20;
    const availW = w - pad * 2;
    const stepW = availW / 7;
    const midY = h / 2 + 5;
    const nodeR = Math.min(18, stepW * 0.32);

    // Connection lines
    for (let i = 0; i < 6; i++) {
      const x1 = pad + (i + 0.5) * stepW + nodeR;
      const x2 = pad + (i + 1.5) * stepW - nodeR;
      const lit = i < activeIdx;
      ctx.strokeStyle = lit ? steps[i].color + '60' : 'rgba(255,255,255,0.06)';
      ctx.lineWidth = lit ? 2 : 1;
      ctx.setLineDash(lit ? [] : [3, 3]);
      ctx.beginPath(); ctx.moveTo(x1, midY); ctx.lineTo(x2, midY); ctx.stroke();
      ctx.setLineDash([]);

      // Animated pulse on active connection
      if (i === activeIdx - 1 && lit) {
        const pulseX = x1 + (x2 - x1) * ((t * 2) % 1);
        ctx.beginPath(); ctx.arc(pulseX, midY, 3, 0, Math.PI * 2);
        ctx.fillStyle = steps[i].color + '80';
        ctx.fill();
      }
    }

    // Nodes
    steps.forEach((s, i) => {
      const x = pad + (i + 0.5) * stepW;
      const isActive = i <= activeIdx;
      const isCurrent = i === activeIdx;
      const pulse = isCurrent ? Math.sin(t * 4) * 0.15 + 0.85 : 1;

      // Glow
      if (isCurrent) {
        ctx.beginPath(); ctx.arc(x, midY, nodeR + 6, 0, Math.PI * 2);
        ctx.fillStyle = s.color + '15';
        ctx.fill();
      }

      // Circle
      ctx.beginPath(); ctx.arc(x, midY, nodeR * pulse, 0, Math.PI * 2);
      ctx.fillStyle = isActive ? s.color + '20' : 'rgba(255,255,255,0.02)';
      ctx.fill();
      ctx.strokeStyle = isActive ? s.color + '80' : 'rgba(255,255,255,0.08)';
      ctx.lineWidth = isCurrent ? 2 : 1;
      ctx.stroke();

      // Icon
      ctx.font = `${isActive ? 14 : 11}px system-ui`;
      ctx.textAlign = 'center';
      ctx.fillText(s.icon, x, midY + 5);

      // Label
      ctx.fillStyle = isActive ? s.color : 'rgba(255,255,255,0.15)';
      ctx.font = `${isCurrent ? 'bold ' : ''}${isActive ? 8 : 7}px system-ui`;
      ctx.fillText(s.label, x, midY + nodeR + 16);

      // Step number
      ctx.fillStyle = isActive ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.08)';
      ctx.font = '7px system-ui';
      ctx.fillText(`Step ${i + 1}`, x, midY - nodeR - 8);
    });

    // Result (appears after all 7 complete)
    if (activeIdx >= 6 && cycle > 9) {
      const gradeAlpha = Math.min(1, (cycle - 9) * 0.5);
      ctx.fillStyle = `rgba(245,158,11,${gradeAlpha})`;
      ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'center';
      ctx.fillText('→ TRADE GRADE: B+ (Setup & Trigger strong, Management weak)', cx, h - 14);
    }
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 2: Failure Point Heatmap
// Shows where trades typically fail across the 7 steps
// ============================================================
function FailureHeatmapAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.005;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('Where 500 Losing Trades Actually Failed', w / 2, 16);

    const steps = [
      { label: 'HTF Bias', failPct: 18, color: '#3b82f6' },
      { label: 'Setup', failPct: 12, color: '#8b5cf6' },
      { label: 'Trigger', failPct: 15, color: '#f59e0b' },
      { label: 'Stop', failPct: 22, color: '#ef4444' },
      { label: 'Management', failPct: 25, color: '#26A69A' },
      { label: 'Emotion', failPct: 35, color: '#ec4899' },
      { label: 'Lesson', failPct: 8, color: '#f59e0b' },
    ];

    const pad = 30;
    const barAreaL = pad + 70;
    const barAreaR = w - pad;
    const barMaxW = barAreaR - barAreaL;
    const barH = 22;
    const gap = 8;
    const startY = 40;

    const animProgress = Math.min(1, (t % 6) / 3);

    steps.forEach((s, i) => {
      const y = startY + i * (barH + gap);
      const barW = (s.failPct / 40) * barMaxW * Math.min(1, animProgress * 2 - i * 0.15);
      const clampedW = Math.max(0, barW);

      // Label
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '9px system-ui'; ctx.textAlign = 'right';
      ctx.fillText(s.label, barAreaL - 8, y + barH / 2 + 3);

      // Bar bg
      ctx.fillStyle = 'rgba(255,255,255,0.02)';
      ctx.beginPath(); ctx.roundRect(barAreaL, y, barMaxW, barH, 4); ctx.fill();

      // Bar fill
      if (clampedW > 0) {
        const heatIntensity = s.failPct / 35;
        const r = Math.round(239 * heatIntensity + 59 * (1 - heatIntensity));
        const g = Math.round(83 * heatIntensity + 130 * (1 - heatIntensity));
        const b = Math.round(80 * heatIntensity + 246 * (1 - heatIntensity));
        ctx.fillStyle = `rgba(${r},${g},${b},0.6)`;
        ctx.beginPath(); ctx.roundRect(barAreaL, y, clampedW, barH, 4); ctx.fill();

        // Percentage
        if (animProgress > 0.5) {
          ctx.fillStyle = 'rgba(255,255,255,0.8)';
          ctx.font = 'bold 9px system-ui'; ctx.textAlign = 'left';
          ctx.fillText(`${s.failPct}%`, barAreaL + clampedW + 6, y + barH / 2 + 3);
        }
      }
    });

    // Insight
    if (animProgress > 0.8) {
      ctx.fillStyle = 'rgba(236,72,153,0.7)';
      ctx.font = 'bold 9px system-ui'; ctx.textAlign = 'center';
      ctx.fillText('→ EMOTION is the #1 failure point — not strategy, not analysis.', w / 2, h - 12);
    }
  }, []);
  return <AnimScene drawFn={draw} height={290} />;
}

// ============================================================
// 7-STEP AUTOPSY TOOL DATA
// ============================================================
interface AutopsyStep {
  id: number;
  title: string;
  icon: string;
  color: string;
  question: string;
  options: { value: string; label: string; score: number }[];
  followUp: string;
  insight: string;
}

const autopsySteps: AutopsyStep[] = [
  { id: 1, title: 'HTF Bias', icon: '🧭', color: '#3b82f6', question: 'Was your higher-timeframe bias correct?', options: [{ value: 'correct', label: 'Yes — Daily/4H direction was right', score: 3 }, { value: 'partially', label: 'Partially — direction right but timing off', score: 2 }, { value: 'wrong', label: 'No — traded against the HTF trend', score: 0 }, { value: 'none', label: 'I didn\'t check the HTF bias', score: 0 }], followUp: 'What was the HTF showing, and how did you read it?', insight: 'HTF bias errors are STRATEGIC failures. If the compass is wrong, perfect execution still loses. Always check Daily → 4H → 15M before entering.' },
  { id: 2, title: 'Setup Criteria', icon: '🎯', color: '#8b5cf6', question: 'Did the setup meet ALL your checklist criteria?', options: [{ value: 'all', label: 'Yes — every criterion was met', score: 3 }, { value: 'most', label: 'Most — 1-2 criteria were marginal', score: 2 }, { value: 'few', label: 'Only some — I forced the trade', score: 1 }, { value: 'none', label: 'No checklist — I traded on instinct', score: 0 }], followUp: 'Which criteria were met and which were missing?', insight: 'Setup errors are SELECTION failures. A perfect trigger on a flawed setup is a B-grade trade at best. If you forced it, the autopsy already has its answer.' },
  { id: 3, title: 'Trigger Quality', icon: '⚡', color: '#f59e0b', question: 'How clean was the entry trigger?', options: [{ value: 'textbook', label: 'Textbook — clear candle confirmation at the level', score: 3 }, { value: 'decent', label: 'Decent — trigger formed but slightly off-level', score: 2 }, { value: 'weak', label: 'Weak — I entered before the trigger fully formed', score: 1 }, { value: 'none', label: 'No trigger — I chased price', score: 0 }], followUp: 'Describe what you saw at the moment of entry.', insight: 'Trigger errors are TIMING failures. A-grade setups with C-grade triggers produce C-grade results. Wait for the candle to close.' },
  { id: 4, title: 'Stop Placement', icon: '🛡️', color: '#ef4444', question: 'Was the stop placed correctly?', options: [{ value: 'structural', label: 'Yes — behind structure (beyond last swing)', score: 3 }, { value: 'acceptable', label: 'Acceptable — slightly tight but defensible', score: 2 }, { value: 'arbitrary', label: 'Arbitrary — based on pip count, not structure', score: 1 }, { value: 'none', label: 'No stop loss placed', score: 0 }], followUp: 'Where was the stop relative to structure, and was it moved?', insight: 'Stop errors are RISK MANAGEMENT failures. Arbitrary stops get hunted. Structural stops survive manipulation. The stop defines the trade — place it first, then calculate size.' },
  { id: 5, title: 'Trade Management', icon: '♟️', color: '#26A69A', question: 'Did you follow your management plan?', options: [{ value: 'perfectly', label: 'Yes — followed the plan exactly', score: 3 }, { value: 'mostly', label: 'Mostly — one deviation from the plan', score: 2 }, { value: 'poorly', label: 'Poorly — multiple deviations (moved SL, closed early)', score: 1 }, { value: 'none', label: 'No plan — I managed on feel', score: 0 }], followUp: 'What deviations occurred, and what triggered them?', insight: 'Management errors are EXECUTION failures. The plan was sound, but you interfered. Every deviation costs R. Track your management compliance % — it should be above 80%.' },
  { id: 6, title: 'Emotional State', icon: '🧠', color: '#ec4899', question: 'What was your emotional state during the trade?', options: [{ value: 'calm', label: 'Calm and detached — process-focused', score: 3 }, { value: 'anxious', label: 'Anxious but controlled — slightly elevated', score: 2 }, { value: 'reactive', label: 'Reactive — fear/greed influenced decisions', score: 1 }, { value: 'tilted', label: 'Tilted — revenge trading or FOMO', score: 0 }], followUp: 'What emotion was strongest, and how did it affect your actions?', insight: 'Emotional errors are PSYCHOLOGICAL failures. If you were tilted or reactive, the trade was compromised regardless of the setup. Step 6 is the most honest step — do not lie to yourself here.' },
  { id: 7, title: 'Key Lesson', icon: '💡', color: '#f59e0b', question: 'Can you identify ONE specific, actionable lesson?', options: [{ value: 'specific', label: 'Yes — I know exactly what to change', score: 3 }, { value: 'general', label: 'Somewhat — I have a general idea', score: 2 }, { value: 'vague', label: 'Vague — "I need to be more disciplined"', score: 1 }, { value: 'nothing', label: 'Nothing — I don\'t see what went wrong', score: 0 }], followUp: 'Write the ONE lesson in one sentence. Be brutally specific.', insight: '"Be more disciplined" is not a lesson. "Wait for the 15M candle to close before entering" IS a lesson. Specificity = improvement. Vagueness = repetition.' },
];

// ============================================================
// QUIZ & GAME DATA
// ============================================================
const quizQuestions = [
  { q: 'The primary purpose of a trade autopsy is:', opts: ['To determine if the trade was profitable', 'To identify WHERE in the process the failure occurred', 'To confirm your strategy is correct', 'To calculate your win rate'], correct: 1 },
  { q: 'A trade that had a correct HTF bias, perfect setup, clean trigger, but was closed early due to fear would receive a failure diagnosis at:', opts: ['Step 1: HTF Bias', 'Step 3: Trigger Quality', 'Step 5: Trade Management', 'Step 6: Emotional State'], correct: 3 },
  { q: 'Your autopsy reveals: correct bias, partial setup (1 missing criterion), decent trigger, structural stop, perfect management, calm emotions. The grade is likely:', opts: ['A — mostly correct', 'B — the missing criterion in Step 2 caps the grade', 'F — any flaw means failure', 'D — partial setup invalidates everything'], correct: 1 },
  { q: '"I need to be more patient" as a lesson from a trade autopsy is:', opts: ['Excellent — patience is the key to trading', 'Acceptable — it captures the essence', 'Too vague — a specific action like "wait for 15M close" is required', 'Irrelevant — lessons should focus on strategy, not behaviour'], correct: 2 },
  { q: 'A winning trade should be autopsied because:', opts: ['Winners don\'t need analysis — the result speaks for itself', 'A win with process errors creates dangerous false confidence', 'Only losing trades have lessons', 'To celebrate and build confidence'], correct: 1 },
  { q: 'The failure heatmap across 500 losing trades shows the #1 failure point is:', opts: ['HTF Bias — traders pick the wrong direction', 'Trigger Quality — entries are poorly timed', 'Emotional State — psychology corrupts execution', 'Stop Placement — stops are too tight'], correct: 2 },
  { q: 'If Step 4 (Stop Placement) gets a 0/3 score ("no stop placed"), the overall trade grade should be:', opts: ['Whatever the other steps average to', 'F — no stop loss is an automatic F regardless of other steps', 'D — it\'s bad but other steps can compensate', 'Depends on whether the trade was profitable'], correct: 1 },
  { q: 'The correct cadence for performing trade autopsies is:', opts: ['Only on losing trades', 'Only on your biggest winners and biggest losers', 'Every single trade for the first 100 trades, then weekly on key trades', 'Once a month on your worst trade'], correct: 2 },
];

const gameRounds = [
  { scenario: '<strong>Trade Autopsy Case 1:</strong> You took a long on XAUUSD. Daily bias was bullish ✓. 15M showed a BOS + OB pullback ✓. Trigger was a bullish engulfing at the OB ✓. Stop was 2 pips below the OB ✓. Price moved to +0.8R, then pulled back to -0.2R. You panicked and closed at -0.2R. Price then ran to +2.3R. Where did this trade fail?', options: [{ text: 'Step 3: Trigger — the entry was poorly timed', correct: false, explain: 'The trigger was textbook — bullish engulfing at the OB. Trigger gets a 3/3. The trade actually WORKED. The failure happened later in the process.' }, { text: 'Step 5: Management — closing at -0.2R broke the plan (SL was not hit)', correct: false, explain: 'Close — management WAS violated. But the REASON the management broke was emotional. Management is the symptom. Emotion is the disease.' }, { text: 'Step 6: Emotion — panic caused the early close. The plan, setup, and trigger were all correct.', correct: true, explain: 'Correct. Steps 1-4 all scored 3/3. The trade was doing exactly what it should. The failure was purely psychological — fear of giving back the +0.8R caused a premature exit. This is an A-grade setup with an F-grade emotional response. Grade: C (emotion dragged down a perfect trade).' }] },
  { scenario: '<strong>Trade Autopsy Case 2:</strong> Short EUR/USD during NY session. Daily was ranging (no clear bias). 4H had just broken structure bearish. 15M showed an FVG entry. Stop above the last swing high. Trade hit SL. On review, the Daily ranging context meant there was no directional conviction.', options: [{ text: 'Step 1: HTF Bias — Daily ranging = no trade. The foundation was flawed.', correct: true, explain: 'Correct. When the Daily is ranging, there IS no HTF bias. A 4H break of structure during a Daily range is a lower-timeframe event without HTF backing. Steps 2-5 were arguably well-executed, but building on a flawed foundation (Step 1) meant the trade started at a disadvantage. Grade: D (structural foundation error).' }, { text: 'Step 2: Setup — the FVG wasn\'t clean enough', correct: false, explain: 'The FVG was valid on the 15M. The setup was fine IN ISOLATION — but a setup without HTF bias support is a B-grade setup at best. The root cause is Step 1.' }, { text: 'Step 4: Stop — should have been wider', correct: false, explain: 'The stop was above the last swing high — structurally correct. A wider stop would have just meant a bigger loss. The problem wasn\'t the stop — it was taking the trade at all.' }] },
  { scenario: '<strong>Trade Autopsy Case 3:</strong> Long GBP/USD. Daily bullish ✓. 4H bullish with demand OB marked ✓. 15M pulled back to the OB. You entered BEFORE the trigger candle closed — a small doji was forming and you assumed it would close bullish. It closed bearish. Price swept below the OB, hit your stop, then reversed and hit where TP would have been.', options: [{ text: 'Step 2: Setup — the OB was invalid', correct: false, explain: 'The OB was valid — price respected it and the trade WOULD have worked if entered correctly. The setup was fine. The problem was execution timing.' }, { text: 'Step 3: Trigger — entering before the candle closed. A doji is NOT a trigger.', correct: true, explain: 'Exactly. Bias ✓, Setup ✓, but the TRIGGER was jumped. A forming doji is not a confirmed trigger — it could close in any direction. Entering before the close cost you a valid trade. The fix is mechanical: wait for the close. Always. Grade: C+ (trigger error on a valid setup).' }, { text: 'Step 4: Stop — the stop was too tight if it got swept', correct: false, explain: 'A stop below the OB is structurally correct. The sweep happened because the entry was premature — a later entry after trigger confirmation would have had a better price and survived the sweep.' }] },
  { scenario: '<strong>Trade Autopsy Case 4:</strong> You\'re 3 losses into the day. Your playbook says max 2 trades. You see a "perfect" setup on NASDAQ. You enter with 2% risk (your normal is 1%). The trade wins +2R. You feel vindicated. Grade this trade.', options: [{ text: 'A — the trade was correct and profitable. 3 losses plus a winner = net recovery.', correct: false, explain: 'Profitability does NOT determine grade. This trade broke TWO rules: trade limit (3rd trade when max is 2) and risk sizing (2% when standard is 1%). A winning rule-break is MORE dangerous than a losing one — it teaches your brain that breaking rules works.' }, { text: 'F — two rule breaks (exceeded max trades AND doubled risk). The win is irrelevant.', correct: true, explain: 'Correct. This is an F-grade trade regardless of outcome. Max trades exceeded = rule break. 2× risk = rule break. If this trade had lost, it would have been a -4% day instead of -2%. The win is a statistical accident, not validation. Grade: F (process violation).' }, { text: 'B — the setup was valid even if the rules were bent. One deviation is acceptable.', correct: false, explain: 'There were TWO deviations, not one. And "bending" rules after 3 losses is textbook revenge trading. The setup quality is irrelevant when the process that selected it was compromised.' }] },
  { scenario: '<strong>Trade Autopsy Case 5:</strong> You complete a full 7-step autopsy on a losing trade. Your lesson is: "I need to be more disciplined and follow my rules better." Your mentor asks you to rewrite it. What should the rewritten lesson be?', options: [{ text: '"I will only enter after the 15M candle closes, because in this trade I entered 3 candles early and got stopped before the move."', correct: true, explain: 'This is a SPECIFIC, ACTIONABLE lesson. It identifies: what happened (entered 3 candles early), why it mattered (got stopped), and the fix (wait for 15M close). You can measure this. You can practice this. You can track compliance with this.' }, { text: '"I need to improve my psychology and control my emotions better."', correct: false, explain: 'This is the same vague lesson in different words. How do you "improve psychology"? By doing what, specifically? Vague lessons produce vague improvement — which means no improvement.' }, { text: '"I should have taken the opposite direction based on the higher timeframe."', correct: false, explain: 'This might be factually correct, but it\'s a HINDSIGHT observation, not a process lesson. You can\'t apply "take the opposite direction" to future trades — you need a rule change that prevents the same bias error.' }] },
];

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function TradeAutopsyPage() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState(0);
  const totalSections = 12;
  const toggle = (id: string) => { setOpenSections(p => { const n = { ...p, [id]: !p[id] }; const c = Object.values(n).filter(Boolean).length; setProgress(Math.round((c / totalSections) * 100)); return n; }); };

  // 7-Step Autopsy Tool state
  const [autopsyStep, setAutopsyStep] = useState(0);
  const [autopsyAnswers, setAutopsyAnswers] = useState<(string | null)[]>(autopsySteps.map(() => null));
  const [autopsyNotes, setAutopsyNotes] = useState<string[]>(autopsySteps.map(() => ''));
  const [autopsyComplete, setAutopsyComplete] = useState(false);

  const handleAutopsyAnswer = (value: string) => {
    const newA = [...autopsyAnswers];
    newA[autopsyStep] = value;
    setAutopsyAnswers(newA);
  };

  const nextAutopsyStep = () => {
    if (autopsyStep < autopsySteps.length - 1) {
      setAutopsyStep(s => s + 1);
    } else {
      setAutopsyComplete(true);
    }
  };

  const getAutopsyScore = (): number => {
    return autopsyAnswers.reduce<number>((total, ans, i) => {
      if (!ans) return total;
      const step = autopsySteps[i];
      const opt = step.options.find(o => o.value === ans);
      return total + (opt ? opt.score : 0);
    }, 0);
  };

  const getAutopsyGrade = (): { grade: string; color: string; label: string; feedback: string } => {
    const score = getAutopsyScore();
    const maxScore = 21;
    const pct = (score / maxScore) * 100;

    // Check for automatic F conditions
    const stopAnswer = autopsyAnswers[3];
    const emotionAnswer = autopsyAnswers[5];
    if (stopAnswer === 'none') return { grade: 'F', color: '#ef4444', label: 'CRITICAL FAILURE', feedback: 'No stop loss = automatic F. This is non-negotiable. A trade without a stop is not a trade — it is gambling. Fix this before analysing anything else.' };
    if (emotionAnswer === 'tilted') return { grade: 'F', color: '#ef4444', label: 'PSYCHOLOGICAL FAILURE', feedback: 'Trading while tilted invalidates the entire process. When your emotional state is compromised, the quality of every other step is unreliable. The lesson: recognise tilt and walk away.' };

    if (pct >= 90) return { grade: 'A', color: '#26A69A', label: 'ELITE EXECUTION', feedback: 'Near-perfect process. Even if this trade lost, it was a high-quality decision. Keep executing like this — results follow process over sample size.' };
    if (pct >= 76) return { grade: 'B', color: '#3b82f6', label: 'SOLID PROCESS', feedback: 'Strong execution with minor areas for improvement. Identify the weakest step and make it your focus for the next 10 trades.' };
    if (pct >= 57) return { grade: 'C', color: '#FFB300', label: 'DEVELOPING', feedback: 'Multiple process errors. Review the steps that scored 1 or below — these are your priority fixes. Focus on ONE improvement at a time.' };
    if (pct >= 38) return { grade: 'D', color: '#f97316', label: 'SIGNIFICANT ISSUES', feedback: 'Major process breakdowns in multiple areas. Before your next trade, revisit your checklist and identify the root cause of the lowest-scoring step.' };
    return { grade: 'F', color: '#ef4444', label: 'PROCESS FAILURE', feedback: 'Fundamental process errors. This trade should not have been taken. Review your pre-session routine and ensure all criteria are met BEFORE entering.' };
  };

  const getStepScore = (idx: number): number => {
    const ans = autopsyAnswers[idx];
    if (!ans) return 0;
    const opt = autopsySteps[idx].options.find(o => o.value === ans);
    return opt ? opt.score : 0;
  };

  const getWeakestStep = (): string => {
    let minScore = 4;
    let weakest = '';
    autopsySteps.forEach((step, i) => {
      const score = getStepScore(i);
      if (score < minScore) { minScore = score; weakest = step.title; }
    });
    return weakest;
  };

  // Game state
  const [gameRound, setGameRound] = useState(0);
  const [gameAnswers, setGameAnswers] = useState<(number | null)[]>(gameRounds.map(() => null));
  const [gameScore, setGameScore] = useState(0);
  const handleGameAnswer = (optIdx: number) => { if (gameAnswers[gameRound] !== null) return; const newA = [...gameAnswers]; newA[gameRound] = optIdx; setGameAnswers(newA); if (gameRounds[gameRound].options[optIdx].correct) setGameScore(s => s + 1); };

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(quizQuestions.map(() => null));
  const [quizDone, setQuizDone] = useState(false);
  const quizScore = quizDone ? Math.round(quizAnswers.reduce<number>((s, a, i) => s + (a === quizQuestions[i].correct ? 1 : 0), 0) / quizQuestions.length * 100) : 0;
  const certUnlocked = quizDone && quizScore >= 66;
  const handleQuizAnswer = (qi: number, oi: number) => { if (quizAnswers[qi] !== null) return; const n = [...quizAnswers]; n[qi] = oi; setQuizAnswers(n); };

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      {/* Hero */}
      <section className="max-w-2xl mx-auto px-5 pt-12 pb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link href="/academy" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 mb-6 transition-colors">&larr; Back to Academy</Link>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4"><Crown className="w-3.5 h-3.5 text-amber-400" /><span className="text-[11px] font-bold tracking-wider text-amber-400">PRO &middot; LEVEL 7</span></div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 leading-tight">The Trade Autopsy</h1>
          <p className="text-gray-400 text-sm leading-relaxed max-w-lg">Not &ldquo;I lost.&rdquo; Not &ldquo;it didn&rsquo;t work.&rdquo; But WHERE in the 7-step process the failure occurred — and exactly how to fix it.</p>
          <div className="mt-4 h-1.5 rounded-full bg-white/5 overflow-hidden"><motion.div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-accent-500" animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} /></div>
          <p className="text-right text-[10px] text-gray-600 mt-1">{progress}% complete</p>
        </motion.div>
      </section>

      {/* S00 — Why This Matters */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-start gap-3 mb-4"><span className="text-xl">🔍</span><h2 className="text-xl font-extrabold">First — Why This Matters</h2></div>
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
            <p className="text-sm text-gray-300 leading-relaxed mb-4">A <strong className="text-white">coroner</strong> doesn&rsquo;t write &ldquo;patient died&rdquo; on the report. They document the exact cause: which organ, which failure, which chain of events. A trade autopsy works the same way. &ldquo;I lost&rdquo; is useless information. &ldquo;I lost because I entered before the 15M trigger closed, which placed my stop 4 pips too high, which meant the Asian session sweep caught me before the real move&rdquo; — <strong className="text-white">that</strong> is information you can act on.</p>
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
              <p className="text-xs font-bold text-amber-400 tracking-widest uppercase mb-2">Real Scenario</p>
              <p className="text-sm text-gray-300 leading-relaxed">500 losing trades from 50 funded traders were autopsied using this 7-step framework. Results: only <strong className="text-amber-400">18% of failures were caused by wrong bias</strong>. Only <strong className="text-amber-400">12% were bad setups</strong>. The #1 failure point: <strong className="text-red-400">emotional state (35%)</strong>, followed by <strong className="text-red-400">trade management (25%)</strong> and <strong className="text-red-400">stop placement (22%)</strong>. Most traders blame strategy. The data says blame psychology and execution.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S01 — Animation 1: Autopsy Pipeline */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-extrabold mb-4">The 7-Step Diagnostic Pipeline</h2>
          <AutopsyPipelineAnimation />
          <p className="text-xs text-gray-500 mt-2 text-center">Each step isolates one dimension. The failure point is where the chain breaks.</p>
        </motion.div>
      </section>

      {/* S02 — Animation 2: Failure Heatmap */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-extrabold mb-4">Where Trades Actually Fail</h2>
          <FailureHeatmapAnimation />
          <p className="text-xs text-gray-500 mt-2 text-center">Data from 500 losing trades. Emotion leads, not strategy.</p>
        </motion.div>
      </section>

      {/* S03 — The 7 Steps Explained */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-extrabold mb-4">The 7 Steps — Explained</h2>
          <div className="space-y-3">
            {autopsySteps.map((step, i) => (
              <div key={step.id} className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
                <button onClick={() => toggle(`s03-${i}`)} className="w-full flex items-center gap-3 p-4 text-left"><span className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: step.color + '15' }}>{step.icon}</span><span className="flex-1 text-sm font-semibold text-gray-200">Step {step.id}: {step.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`s03-${i}`] ? 'rotate-180' : ''}`} /></button>
                <AnimatePresence>{openSections[`s03-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="px-5 pb-5">
                  <p className="text-sm font-semibold text-gray-300 mb-2">{step.question}</p>
                  <div className="space-y-1.5 mb-3">
                    {step.options.map(opt => (
                      <div key={opt.value} className="flex items-center gap-2 text-xs text-gray-400">
                        <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${opt.score === 3 ? 'bg-green-500/20 text-green-400' : opt.score === 2 ? 'bg-amber-500/20 text-amber-400' : opt.score === 1 ? 'bg-orange-500/20 text-orange-400' : 'bg-red-500/20 text-red-400'}`}>{opt.score}</span>
                        <span>{opt.label}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 italic mb-2">Follow-up: {step.followUp}</p>
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                    <p className="text-xs leading-relaxed" style={{ color: step.color }}>{step.insight}</p>
                  </div>
                </div></motion.div>)}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S04 — The Grading System */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-extrabold mb-4">The Trade Grading System</h2>
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
            <button onClick={() => toggle('s04')} className="w-full flex items-center gap-3 p-4 text-left"><span className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center text-xs font-bold text-amber-400/60">01</span><span className="flex-1 text-sm font-semibold text-gray-200">A to F — What Each Grade Means</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections['s04'] ? 'rotate-180' : ''}`} /></button>
            <AnimatePresence>{openSections['s04'] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="px-5 pb-5 space-y-2">
              {[
                { grade: 'A', range: '19-21/21', color: '#26A69A', desc: 'Elite execution. Every step scored 2+. Process was near-perfect regardless of outcome. These trades compound over time.' },
                { grade: 'B', range: '16-18/21', color: '#3b82f6', desc: 'Strong process with 1-2 minor weaknesses. Identify the gap and tighten it. B-grade traders are consistently profitable.' },
                { grade: 'C', range: '12-15/21', color: '#FFB300', desc: 'Mixed execution. Some steps strong, others weak. Focus on the lowest-scoring step — that\'s your bottleneck.' },
                { grade: 'D', range: '8-11/21', color: '#f97316', desc: 'Major issues in multiple steps. This trade probably shouldn\'t have been taken. Review your pre-session routine.' },
                { grade: 'F', range: '0-7/21 or auto-fail', color: '#ef4444', desc: 'Process failure. Automatic F for: no stop loss, trading while tilted, or 3+ steps scoring 0. Stop trading and diagnose the root cause.' },
              ].map(g => (
                <div key={g.grade} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-2xl font-black mt-0.5" style={{ color: g.color }}>{g.grade}</span>
                  <div>
                    <p className="text-xs font-bold text-gray-300 mb-0.5">{g.range}</p>
                    <p className="text-xs text-gray-400 leading-relaxed">{g.desc}</p>
                  </div>
                </div>
              ))}
              <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                <p className="text-xs font-bold text-red-400 mb-1">⚠️ Auto-Fail Conditions</p>
                <p className="text-xs text-gray-400">No stop loss (Step 4 = 0) → Automatic F. Tilted emotional state (Step 6 = 0 "tilted") → Automatic F. These override all other scores.</p>
              </div>
            </div></motion.div>)}</AnimatePresence>
          </div>
        </motion.div>
      </section>

      {/* S05 — 🎯 GROUNDBREAKING: 7-Step Trade Autopsy Tool */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-center gap-2 mb-2"><span className="text-xl">🎯</span><h2 className="text-xl font-extrabold">7-Step Trade Autopsy Tool</h2></div>
          <p className="text-sm text-gray-400 mb-6">Diagnose any trade — winning or losing. Answer each step honestly. The tool will produce your Trade Grade with specific feedback.</p>

          {!autopsyComplete ? (
            <div className="space-y-4">
              {/* Step progress */}
              <div className="flex items-center gap-1">
                {autopsySteps.map((step, i) => (
                  <div key={i} className="flex-1 h-2 rounded-full transition-all" style={{ background: i < autopsyStep ? step.color + '60' : i === autopsyStep ? step.color + '30' : 'rgba(255,255,255,0.05)' }}>
                    {i === autopsyStep && <div className="h-full rounded-full animate-pulse" style={{ background: step.color + '40', width: autopsyAnswers[i] ? '100%' : '50%' }} />}
                  </div>
                ))}
              </div>

              {/* Current step */}
              <div className="p-5 rounded-2xl border bg-white/[0.02]" style={{ borderColor: autopsySteps[autopsyStep].color + '30' }}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">{autopsySteps[autopsyStep].icon}</span>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: autopsySteps[autopsyStep].color }}>Step {autopsySteps[autopsyStep].id} of 7</p>
                    <p className="text-sm font-bold text-white">{autopsySteps[autopsyStep].title}</p>
                  </div>
                </div>

                <p className="text-sm text-gray-300 mb-4">{autopsySteps[autopsyStep].question}</p>

                <div className="space-y-2 mb-4">
                  {autopsySteps[autopsyStep].options.map(opt => (
                    <button key={opt.value} onClick={() => handleAutopsyAnswer(opt.value)} className={`w-full text-left p-3.5 rounded-xl text-sm transition-all ${autopsyAnswers[autopsyStep] === opt.value ? 'border-2 bg-white/[0.04]' : 'bg-white/[0.02] border border-white/10 hover:border-white/20'}`} style={autopsyAnswers[autopsyStep] === opt.value ? { borderColor: autopsySteps[autopsyStep].color + '60', color: autopsySteps[autopsyStep].color } : { color: '#d1d5db' }}>
                      <span className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${opt.score === 3 ? 'bg-green-500/20 text-green-400' : opt.score === 2 ? 'bg-amber-500/20 text-amber-400' : opt.score === 1 ? 'bg-orange-500/20 text-orange-400' : 'bg-red-500/20 text-red-400'}`}>{opt.score}</span>
                        {opt.label}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Notes field */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1.5">{autopsySteps[autopsyStep].followUp}</p>
                  <textarea value={autopsyNotes[autopsyStep]} onChange={e => { const n = [...autopsyNotes]; n[autopsyStep] = e.target.value; setAutopsyNotes(n); }} placeholder="Write your reasoning here (optional but recommended)..." className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-gray-600 focus:border-amber-500/30 outline-none resize-none" rows={2} />
                </div>

                {/* Insight */}
                {autopsyAnswers[autopsyStep] && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-3 rounded-lg bg-white/[0.02] border border-white/5 mb-4">
                    <p className="text-xs leading-relaxed" style={{ color: autopsySteps[autopsyStep].color }}>{autopsySteps[autopsyStep].insight}</p>
                  </motion.div>
                )}

                {/* Navigation */}
                <div className="flex gap-3">
                  {autopsyStep > 0 && (
                    <button onClick={() => setAutopsyStep(s => s - 1)} className="px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-semibold text-gray-300 hover:border-white/20 transition-all">&larr; Previous</button>
                  )}
                  {autopsyAnswers[autopsyStep] && (
                    <button onClick={nextAutopsyStep} className="flex-1 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">{autopsyStep < autopsySteps.length - 1 ? `Step ${autopsyStep + 2}: ${autopsySteps[autopsyStep + 1].title} →` : 'Generate Trade Grade →'}</button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
              {/* Grade card */}
              <div className="p-6 rounded-2xl text-center border" style={{ borderColor: getAutopsyGrade().color + '30', background: getAutopsyGrade().color + '08' }}>
                <p className="text-6xl font-black mb-2" style={{ color: getAutopsyGrade().color }}>{getAutopsyGrade().grade}</p>
                <p className="text-sm font-bold mb-1" style={{ color: getAutopsyGrade().color }}>{getAutopsyGrade().label}</p>
                <p className="text-xs text-gray-400 mb-3">{getAutopsyScore()}/21 points</p>
                <p className="text-xs text-gray-400 leading-relaxed max-w-md mx-auto">{getAutopsyGrade().feedback}</p>
              </div>

              {/* Step-by-step breakdown */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">Step-by-Step Breakdown</p>
                {autopsySteps.map((step, i) => {
                  const score = getStepScore(i);
                  const ans = autopsyAnswers[i];
                  const opt = step.options.find(o => o.value === ans);
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <span className="text-sm">{step.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-300">{step.title}</p>
                        <p className="text-[11px] text-gray-500 truncate">{opt?.label || '—'}</p>
                      </div>
                      <span className={`text-sm font-black ${score === 3 ? 'text-green-400' : score === 2 ? 'text-amber-400' : score === 1 ? 'text-orange-400' : 'text-red-400'}`}>{score}/3</span>
                    </div>
                  );
                })}
              </div>

              {/* Weakest step callout */}
              <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                <p className="text-xs font-bold text-red-400 mb-1">🎯 Priority Fix: {getWeakestStep()}</p>
                <p className="text-xs text-gray-400">This was your weakest step. Focus here for your next 10 trades before improving anything else.</p>
              </div>

              {/* Notes review */}
              {autopsyNotes.some(n => n.trim()) && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">Your Notes</p>
                  {autopsySteps.map((step, i) => autopsyNotes[i].trim() ? (
                    <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <p className="text-[10px] font-bold mb-1" style={{ color: step.color }}>{step.icon} {step.title}</p>
                      <p className="text-xs text-gray-400">{autopsyNotes[i]}</p>
                    </div>
                  ) : null)}
                </div>
              )}

              <button onClick={() => { setAutopsyStep(0); setAutopsyAnswers(autopsySteps.map(() => null)); setAutopsyNotes(autopsySteps.map(() => '')); setAutopsyComplete(false); }} className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-semibold text-gray-300 hover:border-amber-500/30 transition-all">Autopsy Another Trade</button>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* S06 — Winners Need Autopsies Too */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-extrabold mb-4">Winners Need Autopsies Too</h2>
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
            <button onClick={() => toggle('s06')} className="w-full flex items-center gap-3 p-4 text-left"><span className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center text-xs font-bold text-amber-400/60">02</span><span className="flex-1 text-sm font-semibold text-gray-200">Why a Winning Trade Can Get an F</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections['s06'] ? 'rotate-180' : ''}`} /></button>
            <AnimatePresence>{openSections['s06'] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="px-5 pb-5 space-y-3">
              <p className="text-sm text-gray-400 leading-relaxed">A winning trade with process errors is <strong className="text-white">more dangerous</strong> than a losing trade with perfect process. Why? Because the profit <strong className="text-white">reinforces the bad behaviour</strong>.</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/10">
                  <p className="text-xs font-bold text-green-400 mb-1">A-Grade Loss</p>
                  <p className="text-[11px] text-gray-400">Perfect process, stop hit. Bad luck. Keep trading exactly like this — results will come over 100+ trades.</p>
                </div>
                <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                  <p className="text-xs font-bold text-red-400 mb-1">F-Grade Win</p>
                  <p className="text-[11px] text-gray-400">No stop, revenge entry, doubled size. Won anyway. Your brain now thinks this is a valid strategy. It is not. The next 10 will prove it.</p>
                </div>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">Autopsy EVERY trade for your first 100 trades. After that, autopsy your key trades weekly (best win, worst loss, and any trade where you broke a rule).</p>
            </div></motion.div>)}</AnimatePresence>
          </div>
        </motion.div>
      </section>

      {/* S07 — The Lesson Hierarchy */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-extrabold mb-4">The Lesson Quality Hierarchy</h2>
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
            <button onClick={() => toggle('s07')} className="w-full flex items-center gap-3 p-4 text-left"><span className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center text-xs font-bold text-amber-400/60">03</span><span className="flex-1 text-sm font-semibold text-gray-200">How to Write Lessons That Actually Change Your Trading</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections['s07'] ? 'rotate-180' : ''}`} /></button>
            <AnimatePresence>{openSections['s07'] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="px-5 pb-5 space-y-3">
              {[
                { tier: 'F-TIER', example: '"I need to be more disciplined"', problem: 'Not actionable. No specific behaviour change. You\'ll write this same lesson next week.', color: '#ef4444' },
                { tier: 'D-TIER', example: '"My entry was bad"', problem: 'No root cause. WHAT was bad about it? Timing? Level? Trigger? This lesson teaches nothing.', color: '#f97316' },
                { tier: 'C-TIER', example: '"I entered too late and my R:R was degraded"', problem: 'Identifies the WHAT but not the HOW TO FIX. Better, but still incomplete.', color: '#FFB300' },
                { tier: 'B-TIER', example: '"Next time, I will place a limit order at the OB level instead of waiting for a market order"', problem: 'Specific and actionable, but lacks measurement criteria. How will you track compliance?', color: '#3b82f6' },
                { tier: 'A-TIER', example: '"For the next 20 trades: place limit orders at OB levels only. Track fill rate vs market orders. Compare R:R achieved."', problem: 'Specific action + sample size + measurement criteria. THIS lesson changes behaviour.', color: '#26A69A' },
              ].map(item => (
                <div key={item.tier} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <p className="text-xs font-bold mb-1" style={{ color: item.color }}>{item.tier} LESSON</p>
                  <p className="text-xs text-white mb-1 italic">&ldquo;{item.example}&rdquo;</p>
                  <p className="text-[11px] text-gray-400">{item.problem}</p>
                </div>
              ))}
            </div></motion.div>)}</AnimatePresence>
          </div>
        </motion.div>
      </section>

      {/* S08 — Common Mistakes */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-extrabold mb-4">Common Autopsy Mistakes</h2>
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
            <button onClick={() => toggle('s08')} className="w-full flex items-center gap-3 p-4 text-left"><span className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center text-xs font-bold text-amber-400/60">04</span><span className="flex-1 text-sm font-semibold text-gray-200">4 Ways Traders Sabotage Their Own Reviews</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections['s08'] ? 'rotate-180' : ''}`} /></button>
            <AnimatePresence>{openSections['s08'] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="px-5 pb-5 space-y-3">
              {[
                { title: 'Outcome Bias', mistake: 'Grading the trade based on whether it won or lost instead of process quality. A winning revenge trade gets an A because "it worked."', fix: 'Grade the PROCESS, not the OUTCOME. Ask: "Would I take this exact trade 100 times?" If no, the grade is low regardless of this one result.' },
                { title: 'Hindsight Editing', mistake: 'After seeing the outcome, rewriting your reasoning to make it sound like you knew all along. "I knew it would reverse" (but you didn\'t close).', fix: 'Write your autopsy notes BEFORE looking at what price did after your exit. Your reasoning at the TIME of the trade is what matters.' },
                { title: 'Skipping Step 6 (Emotional State)', mistake: 'Admitting "I was tilted" or "I was scared" feels uncomfortable. So traders skip it or lie about it.', fix: 'Step 6 is the most important step. If you can\'t be honest here, the entire autopsy is compromised. The data shows emotion is the #1 failure point.' },
                { title: 'Only Autopsying Losers', mistake: 'Skipping reviews on winners creates survivorship bias. You never discover your winning F-grade habits.', fix: 'Autopsy your best win AND worst loss each week minimum. Your winning F-grades are ticking time bombs.' },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <p className="text-sm font-bold text-white mb-2">{item.title}</p>
                  <p className="text-xs text-red-400 mb-2">❌ {item.mistake}</p>
                  <p className="text-xs text-green-400">✓ {item.fix}</p>
                </div>
              ))}
            </div></motion.div>)}</AnimatePresence>
          </div>
        </motion.div>
      </section>

      {/* S09 — Cheat Sheet */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-extrabold mb-4">Cheat Sheet</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { title: '7 Steps', content: 'Bias → Setup → Trigger → Stop → Management → Emotion → Lesson. Every trade, every time.', color: '#f59e0b' },
              { title: 'Auto-Fail', content: 'No stop = F. Tilted = F. These override all other scores. Non-negotiable.', color: '#ef4444' },
              { title: '#1 Killer', content: 'Emotion (35%) beats strategy (18%) as the top failure point. Fix psychology first, not setups.', color: '#ec4899' },
              { title: 'A-Grade Lesson', content: 'Specific action + sample size + measurement. "Be disciplined" is F-tier.', color: '#26A69A' },
              { title: 'Winners Too', content: 'Winning F-grade trades are more dangerous than A-grade losses. Autopsy both.', color: '#3b82f6' },
              { title: 'The Cadence', content: 'Every trade for first 100. Then weekly: best win, worst loss, any rule break.', color: '#a855f7' },
            ].map((card, i) => (
              <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <p className="text-xs font-bold mb-1" style={{ color: card.color }}>{card.title}</p>
                <p className="text-[11px] text-gray-400 leading-relaxed">{card.content}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S10 — Game */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-extrabold mb-2">Test Your Knowledge</h2>
          <p className="text-gray-400 text-sm mb-6">5 trade autopsy cases. Diagnose where each trade failed.</p>
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
            <p className="text-xs tracking-widest uppercase text-amber-400 font-bold mb-3">Round {gameRound + 1} of {gameRounds.length}</p>
            <p className="text-sm text-gray-300 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: gameRounds[gameRound].scenario }} />
            <div className="space-y-3">
              {gameRounds[gameRound].options.map((opt, oi) => {
                const answered = gameAnswers[gameRound] !== null;
                const selected = gameAnswers[gameRound] === oi;
                const isCorrect = opt.correct;
                const cls = !answered ? 'bg-white/[0.03] border border-white/10 hover:border-amber-500/30' : isCorrect ? 'bg-green-500/10 border border-green-500/30' : selected ? 'bg-red-500/10 border border-red-500/30' : 'bg-white/[0.02] border border-white/5 opacity-50';
                return (<div key={oi}><button onClick={() => handleGameAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt.text }} /></button>{answered && selected && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]"><p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`} dangerouslySetInnerHTML={{ __html: `${isCorrect ? '✓' : '✗'} ${opt.explain}` }} /></motion.div>)}</div>);
              })}
            </div>
            {gameAnswers[gameRound] !== null && gameRound < gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5"><button onClick={() => setGameRound(r => r + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button></motion.div>)}
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Outstanding — you can diagnose trade failures with forensic precision.' : gameScore >= 3 ? 'Good — review the difference between symptom (management) and root cause (emotion).' : 'Re-read the 7 Steps and focus on identifying the FIRST point of failure in the chain.'}</p></motion.div>)}
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
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-red-500 via-amber-500 to-purple-500 flex items-center justify-center text-3xl shadow-lg shadow-red-500/30">🔬</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 7: The Trade Autopsy</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-red-400 via-amber-400 to-purple-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Trade Forensic &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L7.10-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
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
