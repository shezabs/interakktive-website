// app/academy/lesson/session-transitions/page.tsx
// ATLAS Academy — Lesson 7.9: Session Transitions [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 7
// GROUNDBREAKING: 24-Hour Session Clock + Interactive Session Playbook Builder
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
// ANIMATION 1: 24-Hour Session Clock
// Rotating clock with Asia/London/NY arcs, AMD cycle, live hand
// ============================================================
function SessionClockAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.003;
    const cx = w / 2;
    const cy = h / 2 + 5;
    const R = Math.min(w, h) * 0.38;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('The 24-Hour Market Cycle', cx, 16);

    // Sessions (UTC hours): Asia 00:00-08:00, London 07:00-16:00, NY 12:00-21:00
    const sessions = [
      { name: 'ASIA', start: 0, end: 8, color: '#3b82f6', phase: 'ACCUMULATION', emoji: '🌏' },
      { name: 'LONDON', start: 7, end: 16, color: '#26A69A', phase: 'MANIPULATION', emoji: '🌍' },
      { name: 'NEW YORK', start: 12, end: 21, color: '#EF5350', phase: 'DISTRIBUTION', emoji: '🌎' },
    ];

    // Overlaps
    const overlaps = [
      { name: 'ASIA↔LON', start: 7, end: 8, color: '#FFB300' },
      { name: 'LON↔NY', start: 12, end: 16, color: '#f59e0b' },
    ];

    const hourToAngle = (h: number) => ((h / 24) * Math.PI * 2) - Math.PI / 2;

    // Draw session arcs
    sessions.forEach((s, si) => {
      const startAngle = hourToAngle(s.start);
      const endAngle = hourToAngle(s.end);
      const innerR = R - 28;
      const outerR = R - 8 - si * 2;

      ctx.beginPath();
      ctx.arc(cx, cy, innerR + si * 8, startAngle, endAngle);
      ctx.strokeStyle = s.color + '50';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Session label
      const midAngle = (startAngle + endAngle) / 2;
      const labelR = R + 14;
      const lx = cx + Math.cos(midAngle) * labelR;
      const ly = cy + Math.sin(midAngle) * labelR;
      ctx.fillStyle = s.color;
      ctx.font = 'bold 8px system-ui'; ctx.textAlign = 'center';
      ctx.fillText(s.name, lx, ly);
      ctx.font = '7px system-ui'; ctx.fillStyle = s.color + '90';
      ctx.fillText(s.phase, lx, ly + 11);
    });

    // Overlap highlights
    overlaps.forEach(ov => {
      const startAngle = hourToAngle(ov.start);
      const endAngle = hourToAngle(ov.end);
      ctx.beginPath();
      ctx.arc(cx, cy, R - 20, startAngle, endAngle);
      ctx.strokeStyle = ov.color + '40';
      ctx.lineWidth = 22;
      ctx.stroke();

      const midAngle = (startAngle + endAngle) / 2;
      const pulse = Math.sin(t * 3) * 0.3 + 0.7;
      ctx.fillStyle = `rgba(245,158,11,${pulse * 0.8})`;
      ctx.font = 'bold 7px system-ui';
      const tx = cx + Math.cos(midAngle) * (R - 20);
      const ty = cy + Math.sin(midAngle) * (R - 20);
      ctx.fillText('⚡', tx, ty + 3);
    });

    // Hour markers
    for (let h = 0; h < 24; h++) {
      const angle = hourToAngle(h);
      const isMajor = h % 6 === 0;
      const innerR2 = R - (isMajor ? 5 : 2);
      const outerR2 = R + (isMajor ? 2 : 0);
      ctx.strokeStyle = isMajor ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)';
      ctx.lineWidth = isMajor ? 1.5 : 0.5;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * innerR2, cy + Math.sin(angle) * innerR2);
      ctx.lineTo(cx + Math.cos(angle) * outerR2, cy + Math.sin(angle) * outerR2);
      ctx.stroke();

      if (isMajor) {
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '9px system-ui'; ctx.textAlign = 'center';
        const numR = R + 10;
        ctx.fillText(`${h.toString().padStart(2, '0')}:00`, cx + Math.cos(angle) * numR, cy + Math.sin(angle) * numR + 3);
      }
    }

    // Rotating hand (simulates time cycling)
    const currentHour = (t * 1.5) % 24;
    const handAngle = hourToAngle(currentHour);
    const handR = R - 35;

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(handAngle) * handR, cy + Math.sin(handAngle) * handR);
    ctx.stroke();

    // Hand dot
    ctx.beginPath();
    ctx.arc(cx + Math.cos(handAngle) * handR, cy + Math.sin(handAngle) * handR, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();

    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1a2e';
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Current session label in center
    let currentSession = 'OFF-HOURS';
    let sessionColor = '#6b7280';
    if (currentHour >= 12 && currentHour < 21) { currentSession = 'NEW YORK'; sessionColor = '#EF5350'; }
    else if (currentHour >= 7 && currentHour < 16) { currentSession = 'LONDON'; sessionColor = '#26A69A'; }
    else if (currentHour < 8) { currentSession = 'ASIA'; sessionColor = '#3b82f6'; }

    ctx.fillStyle = sessionColor;
    ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center';
    ctx.fillText(currentSession, cx, cy + 22);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '8px system-ui';
    ctx.fillText(`${Math.floor(currentHour).toString().padStart(2, '0')}:${Math.floor((currentHour % 1) * 60).toString().padStart(2, '0')} UTC`, cx, cy + 34);
  }, []);
  return <AnimScene drawFn={draw} height={320} />;
}

// ============================================================
// ANIMATION 2: AMD Cycle — Price Path
// Shows Accumulation → Manipulation → Distribution with price action
// ============================================================
function AMDCycleAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.004;
    const progress = Math.min(1, (t % 10) / 8);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('The AMD Cycle — How Smart Money Moves Price', w / 2, 16);

    const pad = 30;
    const chartL = pad;
    const chartR = w - pad;
    const chartW = chartR - chartL;
    const top = 45;
    const bot = h - 45;
    const midY = (top + bot) / 2;

    // Phase zones
    const phases = [
      { name: 'ACCUMULATION', start: 0, end: 0.3, color: '#3b82f6', desc: 'Asia — Range builds' },
      { name: 'MANIPULATION', start: 0.3, end: 0.5, color: '#FFB300', desc: 'London Open — False break' },
      { name: 'DISTRIBUTION', start: 0.5, end: 1.0, color: '#26A69A', desc: 'London/NY — Real move' },
    ];

    phases.forEach(p => {
      if (progress >= p.start) {
        const x1 = chartL + p.start * chartW;
        const x2 = chartL + Math.min(progress, p.end) * chartW;
        ctx.fillStyle = p.color + '08';
        ctx.fillRect(x1, top, x2 - x1, bot - top);

        ctx.strokeStyle = p.color + '20'; ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(x1, top); ctx.lineTo(x1, bot); ctx.stroke();

        if (progress >= p.start + 0.05) {
          ctx.fillStyle = p.color; ctx.font = 'bold 8px system-ui'; ctx.textAlign = 'center';
          ctx.fillText(p.name, (x1 + Math.min(x2, chartL + p.end * chartW)) / 2, top - 5);
          ctx.fillStyle = p.color + '80'; ctx.font = '7px system-ui';
          ctx.fillText(p.desc, (x1 + Math.min(x2, chartL + p.end * chartW)) / 2, bot + 14);
        }
      }
    });

    // Price path
    const totalPts = 120;
    const visPts = Math.floor(progress * totalPts);
    const seed = (n: number) => Math.sin(n * 127.1 + 311.7) * 0.5 + 0.5;

    const getY = (i: number): number => {
      const norm = i / totalPts;
      const noise = (seed(i * 7) - 0.5) * 8;
      // Accumulation: tight range
      if (norm < 0.3) {
        return midY + Math.sin(norm * 40) * 12 + noise * 0.5;
      }
      // Manipulation: false break below range
      if (norm < 0.4) {
        const manipProgress = (norm - 0.3) / 0.1;
        return midY + 12 + manipProgress * 35 + noise * 0.4;
      }
      // Reversal candle
      if (norm < 0.5) {
        const revProgress = (norm - 0.4) / 0.1;
        return midY + 47 - revProgress * 50 + noise * 0.3;
      }
      // Distribution: real move up
      if (norm < 1.0) {
        const distProgress = (norm - 0.5) / 0.5;
        return midY - 3 - distProgress * 70 + noise * 0.5;
      }
      return midY;
    };

    // Draw price line
    if (visPts > 1) {
      ctx.beginPath();
      ctx.moveTo(chartL, getY(0));
      for (let i = 1; i < visPts; i++) {
        const x = chartL + (i / totalPts) * chartW;
        ctx.lineTo(x, getY(i));
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Glow dot at tip
      const tipX = chartL + ((visPts - 1) / totalPts) * chartW;
      const tipY = getY(visPts - 1);
      ctx.beginPath(); ctx.arc(tipX, tipY, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();
    }

    // Annotations
    if (progress > 0.35) {
      const sweepX = chartL + 0.38 * chartW;
      const sweepY = midY + 45;
      ctx.fillStyle = '#FFB300'; ctx.font = 'bold 8px system-ui'; ctx.textAlign = 'center';
      ctx.fillText('⬇ LIQUIDITY SWEEP', sweepX, sweepY + 18);
      ctx.fillStyle = '#FFB300' + '60'; ctx.font = '7px system-ui';
      ctx.fillText('Retail stops hunted', sweepX, sweepY + 28);
    }
    if (progress > 0.6) {
      const entryX = chartL + 0.5 * chartW;
      ctx.fillStyle = '#26A69A'; ctx.font = 'bold 8px system-ui'; ctx.textAlign = 'center';
      ctx.fillText('▲ SMART MONEY ENTRY', entryX, midY + 10);
    }
    if (progress > 0.85) {
      ctx.fillStyle = '#26A69A'; ctx.font = 'bold 9px system-ui'; ctx.textAlign = 'center';
      ctx.fillText('THE REAL MOVE', chartL + 0.75 * chartW, top + 20);
    }

    // Range lines during accumulation
    if (progress > 0.05 && progress < 0.35) {
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = 'rgba(59,130,246,0.3)'; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(chartL, midY - 15); ctx.lineTo(chartL + 0.3 * chartW, midY - 15); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(chartL, midY + 15); ctx.lineTo(chartL + 0.3 * chartW, midY + 15); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(59,130,246,0.4)'; ctx.font = '7px system-ui'; ctx.textAlign = 'left';
      ctx.fillText('Range High', chartL + 3, midY - 18);
      ctx.fillText('Range Low', chartL + 3, midY + 24);
    }
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// INTERACTIVE SESSION PLAYBOOK BUILDER
// ============================================================
interface SessionPlaybook {
  instruments: string[];
  model: string;
  maxTrades: number;
  riskPct: number;
  killZoneStart: string;
  killZoneEnd: string;
  bias: string;
  notes: string;
}

const defaultPlaybook = (): SessionPlaybook => ({ instruments: [], model: '', maxTrades: 2, riskPct: 1, killZoneStart: '', killZoneEnd: '', bias: '', notes: '' });

// ============================================================
// QUIZ & GAME DATA
// ============================================================
const quizQuestions = [
  { q: 'What is the primary purpose of the Asian session in the AMD cycle?', opts: ['Distribution — trending moves happen here', 'Accumulation — smart money builds positions in a range', 'Manipulation — false breakouts happen here', 'All sessions serve the same purpose'], correct: 1 },
  { q: 'The London open is most associated with which phase of the AMD cycle?', opts: ['Accumulation — building positions', 'Manipulation — sweeping liquidity from the Asian range', 'Distribution — running the real move', 'No specific phase — it varies'], correct: 1 },
  { q: 'When Asia builds a tight 30-pip range on XAUUSD and London opens, what should you watch for FIRST?', opts: ['Buy the London open candle immediately', 'Watch for a false break of the Asian range high OR low', 'Short because London typically reverses Asia', 'Enter based on the Daily bias regardless of Asian range'], correct: 1 },
  { q: 'The London-NY overlap (12:00-16:00 UTC) is considered the most volatile because:', opts: ['Both sessions have maximum liquidity simultaneously', 'NY traders are still waking up and make mistakes', 'It is when most news events are released', 'Asia traders are closing positions'], correct: 0 },
  { q: 'You have a bullish Daily bias. Asia ranged. London swept the low and reversed. What is the HIGHEST probability entry window?', opts: ['Asia session — enter early for the best price', 'London open — right at the manipulation sweep', 'London-NY overlap — after manipulation confirms reversal', 'NY afternoon — wait for maximum confirmation'], correct: 2 },
  { q: 'Dead zones (periods between sessions) should be traded because:', opts: ['Spreads are tighter during dead zones', 'Volume is low so moves are more predictable', 'They should NOT be traded — low volume means unreliable moves and wider spreads', 'Dead zones offer the best risk-reward setups'], correct: 2 },
  { q: 'A session-specific playbook should include:', opts: ['Only the instrument and direction', 'Instruments, kill zone times, max trades, risk %, model type, and bias criteria', 'Just the news events for the day', 'The same rules for every session'], correct: 1 },
  { q: 'If your primary instrument is XAUUSD (Gold), which session overlap gives you the HIGHEST volume and tightest spreads?', opts: ['Asia-London overlap (07:00-08:00 UTC)', 'London-NY overlap (12:00-16:00 UTC)', 'NY-Asia overlap (21:00-00:00 UTC)', 'All overlaps are equal for Gold'], correct: 1 },
];

const gameRounds = [
  { scenario: '<strong>07:55 UTC</strong> — Asia has built a 25-pip range on EUR/USD. You have a bearish Daily bias. London opens in 5 minutes. Your playbook says "wait for London manipulation before entering." You see price creeping toward the Asian high. What do you do?', options: [{ text: 'Short now — price at the Asian high is a perfect entry before London opens', correct: false, explain: 'Your playbook says wait for London manipulation. Entering 5 minutes BEFORE the session opens means you are front-running the playbook — and if London sweeps HIGHER first, you get stopped out before the real move.' }, { text: 'Wait — set alerts at the Asian high and low. Let London show you the sweep direction before entering.', correct: true, explain: 'Exactly right. The playbook exists for a reason. Let London open, let it sweep one side of the Asian range (probably the high since your bias is bearish — a false break above before selling). THEN enter after the manipulation confirms.' }, { text: 'Cancel the bearish bias — price moving to the high means bulls are in control', correct: false, explain: 'Asian session movement does NOT change your Daily bias. A creep to the high is exactly what manipulation looks like — building liquidity above the range for London to sweep. Stay with the plan.' }] },
  { scenario: '<strong>14:30 UTC</strong> — London-NY overlap. EUR/USD has swept the Asian low, reversed, and broken structure bullish on the 15M. Your playbook says "max 2 trades per session" and you\'ve already taken 1 (a winner). This setup scores 9/10 on your checklist. Do you take it?', options: [{ text: 'Yes — you still have 1 trade left and the setup is near-perfect', correct: true, explain: 'Your playbook allows 2 trades. You have used 1. The setup scores 9/10. This is exactly what the playbook was designed for — a high-conviction second trade during the highest-volume window. Take it.' }, { text: 'No — one winning trade is enough, protect your profits', correct: false, explain: 'Your playbook exists to prevent emotional decisions. "One is enough" is emotion talking, not strategy. If the setup meets all criteria and you have allocation remaining, the playbook says TAKE IT.' }, { text: 'Take it but reduce risk to 0.5% since you already have a winner', correct: false, explain: 'Reducing risk after a winner is a psychological crutch. Your playbook says 1% risk. A 9/10 setup during LON-NY overlap with trade allocation remaining = full risk. Consistency beats emotion.' }] },
  { scenario: '<strong>19:30 UTC</strong> — Late NY session. Volume is dropping. You spot what looks like a setup on GBP/USD. Your playbook says kill zone ends at 19:00 UTC. The setup formed 30 minutes AFTER your kill zone closed.', options: [{ text: 'Take it — the setup looks clean and kill zone is just a guideline', correct: false, explain: 'Your kill zone exists because setups AFTER it have statistically lower win rates and worse R:R. Late-session volume is thinner, spreads wider. "Just a guideline" is how playbooks get destroyed.' }, { text: 'Skip — the playbook says kill zone ended at 19:00. The setup is outside my trading window.', correct: true, explain: 'Discipline beats opportunity. A setup outside your kill zone is NOT a setup — it is a temptation. Close the charts, review the day, and prepare for tomorrow. The market will be there.' }, { text: 'Take it with reduced size as a "bonus" trade', correct: false, explain: '"Bonus trades" do not exist in a serious playbook. Reduced size does not make an out-of-window trade valid. You are rationalising a rule break. Close the charts.' }] },
  { scenario: '<strong>03:00 UTC</strong> — Deep Asian session. XAUUSD is ranging in a 15-pip box. You have a bullish bias. A small bullish candle appears. Your trading buddy messages: "Gold looks like it wants to break out, I\'m going long now."', options: [{ text: 'Follow the trade — your buddy sees the same bias and Asia ranges break eventually', correct: false, explain: 'Asian ranges are ACCUMULATION, not distribution. A break during Asia at 03:00 UTC is premature — there is no volume to sustain it. Wait for London to sweep and confirm the direction. Your buddy is about to get trapped.' }, { text: 'Ignore and wait — 03:00 UTC is a dead zone. Asian accumulation ranges break at London open, not at 3AM.', correct: true, explain: 'Perfect. You know the session character. Asia ACCUMULATES. The breakout happens at London open — and it often starts with a false break (manipulation) in the opposite direction first. Set your alerts and sleep.' }, { text: 'Set a buy stop above the range high to catch the breakout', correct: false, explain: 'A buy stop above Asian range during accumulation = entering the manipulation. London will likely sweep the high FIRST (triggering your stop), then reverse. This is how retail liquidity gets harvested.' }] },
  { scenario: '<strong>12:15 UTC</strong> — NY just opened. Your playbook is London-NY overlap only. Gold swept the Asian low at London open, reversed bullish, but hasn\'t given a 15M entry trigger yet. It\'s been 15 minutes since NY opened and you feel the urgency — "if I don\'t enter now, I\'ll miss the move."', options: [{ text: 'Enter now — the thesis is correct and waiting longer risks missing it', correct: false, explain: 'The thesis may be correct but your TRIGGER hasn\'t formed. Entering on urgency = entering on emotion. The overlap lasts until 16:00 — you have almost 4 hours. If the move is real, the trigger will come.' }, { text: 'Close the charts — you clearly can\'t handle the emotional pressure today', correct: false, explain: 'Recognising urgency is healthy. But closing charts abandons a valid thesis during the highest-probability window. The answer isn\'t quit — it\'s discipline.' }, { text: 'Wait for the 15M trigger. The overlap runs until 16:00. No trigger = no trade, regardless of how good the thesis is.', correct: true, explain: 'Perfect discipline. Thesis + structure + trigger. You have 2 of 3. The overlap gives you hours of runway. If the trigger never forms, that means the market didn\'t confirm your thesis — and you saved capital. That IS trading.' }] },
];

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function SessionTransitionsPage() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState(0);
  const totalSections = 12;
  const toggle = (id: string) => { setOpenSections(p => { const n = { ...p, [id]: !p[id] }; const c = Object.values(n).filter(Boolean).length; setProgress(Math.round((c / totalSections) * 100)); return n; }); };

  // Session Playbook Builder state
  const [activeSession, setActiveSession] = useState<'asia' | 'london' | 'newyork'>('asia');
  const [playbooks, setPlaybooks] = useState<Record<string, SessionPlaybook>>({
    asia: defaultPlaybook(),
    london: defaultPlaybook(),
    newyork: defaultPlaybook(),
  });
  const [playbookComplete, setPlaybookComplete] = useState(false);

  const updatePlaybook = (session: string, field: keyof SessionPlaybook, value: string | number | string[]) => {
    setPlaybooks(p => ({ ...p, [session]: { ...p[session], [field]: value } }));
  };

  const toggleInstrument = (session: string, inst: string) => {
    setPlaybooks(p => {
      const current = p[session].instruments;
      const next = current.includes(inst) ? current.filter(i => i !== inst) : [...current, inst].slice(0, 3);
      return { ...p, [session]: { ...p[session], instruments: next } };
    });
  };

  const getPlaybookScore = (): number => {
    let score = 0;
    const allSessions = ['asia', 'london', 'newyork'];
    allSessions.forEach(s => {
      const pb = playbooks[s];
      if (pb.instruments.length > 0) score += 1;
      if (pb.model) score += 1;
      if (pb.killZoneStart && pb.killZoneEnd) score += 1;
      if (pb.bias) score += 1;
    });
    return Math.round((score / 12) * 100);
  };

  const sessionMeta: Record<string, { label: string; color: string; utc: string; character: string; emoji: string }> = {
    asia: { label: 'ASIA', color: '#3b82f6', utc: '00:00 – 08:00 UTC', character: 'Accumulation — Range building', emoji: '🌏' },
    london: { label: 'LONDON', color: '#26A69A', utc: '07:00 – 16:00 UTC', character: 'Manipulation → Distribution', emoji: '🌍' },
    newyork: { label: 'NEW YORK', color: '#EF5350', utc: '12:00 – 21:00 UTC', character: 'Distribution — The real move', emoji: '🌎' },
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

  const instruments = ['XAUUSD', 'EUR/USD', 'GBP/USD', 'NASDAQ', 'US30', 'USD/JPY'];
  const models = ['OB Pullback', 'Liquidity Sweep', 'BOS Continuation', 'FVG Entry', 'Breaker Retest', 'Range Breakout'];
  const biasOptions = ['Bullish only', 'Bearish only', 'Both (with HTF confirmation)', 'No trading this session'];

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      {/* Hero */}
      <section className="max-w-2xl mx-auto px-5 pt-12 pb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link href="/academy" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 mb-6 transition-colors">&larr; Back to Academy</Link>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4"><Crown className="w-3.5 h-3.5 text-amber-400" /><span className="text-[11px] font-bold tracking-wider text-amber-400">PRO &middot; LEVEL 7</span></div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 leading-tight">Session Transitions</h1>
          <p className="text-gray-400 text-sm leading-relaxed max-w-lg">Asia accumulates. London manipulates. New York distributes. Master the 24-hour cycle and trade when the odds are stacked in your favour.</p>
          <div className="mt-4 h-1.5 rounded-full bg-white/5 overflow-hidden"><motion.div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-accent-500" animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} /></div>
          <p className="text-right text-[10px] text-gray-600 mt-1">{progress}% complete</p>
        </motion.div>
      </section>

      {/* S00 — Why This Matters */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-start gap-3 mb-4"><span className="text-xl">🔍</span><h2 className="text-xl font-extrabold">First — Why This Matters</h2></div>
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
            <p className="text-sm text-gray-300 leading-relaxed mb-4">Think of the 24-hour market cycle like a <strong className="text-white">three-act play</strong>. Act 1 (Asia) sets the stage — the range builds, positions are quietly accumulated. Act 2 (London open) is the twist — a false break that catches the crowd on the wrong side. Act 3 (London-NY) is the resolution — the real move that pays the patient traders. If you walk into the theatre during Act 3 without knowing Acts 1 and 2, the plot makes no sense.</p>
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
              <p className="text-xs font-bold text-amber-400 tracking-widest uppercase mb-2">Real Scenario</p>
              <p className="text-sm text-gray-300 leading-relaxed">1,200 Gold trades analysed over 6 months. Trades taken during the London-NY overlap (12:00-16:00 UTC) with prior Asian range context had a <strong className="text-amber-400">56% win rate and 1:2.3 average R:R</strong>. Trades during Asia or late NY: <strong className="text-red-400">38% win rate, 1:1.0 R:R</strong>. Same strategy, same instrument — the ONLY difference was session timing. Session awareness alone was worth £4,800/quarter.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S01 — Animation 1: 24-Hour Session Clock */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-extrabold mb-4">The 24-Hour Session Clock</h2>
          <SessionClockAnimation />
          <p className="text-xs text-gray-500 mt-2 text-center">Asia (blue) → London (teal) → New York (red). Overlaps marked with ⚡ — the highest-probability windows.</p>
        </motion.div>
      </section>

      {/* S02 — Animation 2: AMD Cycle */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-extrabold mb-4">The AMD Cycle — How Smart Money Moves Price</h2>
          <AMDCycleAnimation />
          <p className="text-xs text-gray-500 mt-2 text-center">Accumulation (Asia range) → Manipulation (London sweep) → Distribution (the real move). Every. Single. Day.</p>
        </motion.div>
      </section>

      {/* S03 — 3 Sessions Decoded */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-extrabold mb-4">The 3 Sessions — Decoded</h2>
          <div className="space-y-3">
            {[
              { id: 's03a', num: '01', title: '🌏 Asia (00:00 – 08:00 UTC) — The Stage Setter', content: '<strong>Character:</strong> Accumulation. Low volume, tight ranges, small bodies. Smart money is quietly building positions.<br/><br/><strong>What to do:</strong> Mark the Asian range high and low — these become the liquidity targets for London. Do NOT trade during Asia unless you specialise in ranging strategies on JPY pairs.<br/><br/><strong>Key instruments:</strong> USD/JPY, AUD/USD, NZD/USD have the most volume. XAUUSD and EUR/USD are typically dead.<br/><br/><strong>The trap:</strong> Breakouts during Asia are almost always false. The volume does not exist to sustain directional moves. Wait for London.' },
              { id: 's03b', num: '02', title: '🌍 London (07:00 – 16:00 UTC) — The Manipulator', content: '<strong>Character:</strong> Manipulation → Distribution. London opens with a BANG — it sweeps one side of the Asian range (the manipulation), then reverses into the real move (the distribution).<br/><br/><strong>What to do:</strong> Watch for the false break of the Asian range within the first 30-90 minutes of London. This is the manipulation phase. After the sweep, look for structure breaks and entry triggers on the 15M.<br/><br/><strong>Key instruments:</strong> EUR/USD, GBP/USD, XAUUSD all come alive. Maximum institutional volume.<br/><br/><strong>The golden window:</strong> 07:00-10:00 UTC is where 70% of the day\'s setups form. If nothing triggers by 10:00, the move may have happened without you — accept it.' },
              { id: 's03c', num: '03', title: '🌎 New York (12:00 – 21:00 UTC) — The Closer', content: '<strong>Character:</strong> Distribution + continuation OR reversal. NY either joins London\'s move (continuation = strongest setups) or provides the second manipulation (NY reversal = trickiest).<br/><br/><strong>What to do:</strong> The London-NY overlap (12:00-16:00 UTC) is the highest-volume window globally. If London established direction, NY entries in the same direction have the best win rates. After 16:00, volume dies — close or trail, do not enter.<br/><br/><strong>Key instruments:</strong> US indices (NASDAQ, S&P, US30), XAUUSD, USD pairs. Crypto also moves during this window.<br/><br/><strong>The trap:</strong> 13:30-14:00 UTC (US economic releases). Spreads spike, fills slip. Never hold an entry through a major news release unless you planned for it.' },
            ].map(item => (
              <div key={item.id} className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
                <button onClick={() => toggle(item.id)} className="w-full flex items-center gap-3 p-4 text-left"><span className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center text-xs font-bold text-amber-400/60">{item.num}</span><span className="flex-1 text-sm font-semibold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[item.id] ? 'rotate-180' : ''}`} /></button>
                <AnimatePresence>{openSections[item.id] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="px-5 pb-5"><p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.content }} /></div></motion.div>)}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S04 — The Overlaps */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-extrabold mb-4">The Session Overlaps — Where the Money Is</h2>
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
            <button onClick={() => toggle('s04')} className="w-full flex items-center gap-3 p-4 text-left"><span className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center text-xs font-bold text-amber-400/60">03</span><span className="flex-1 text-sm font-semibold text-gray-200">Why Overlaps Are the Highest-Probability Windows</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections['s04'] ? 'rotate-180' : ''}`} /></button>
            <AnimatePresence>{openSections['s04'] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="px-5 pb-5 space-y-3">
              <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                <p className="text-xs font-bold text-amber-400 mb-2">⚡ ASIA → LONDON OVERLAP (07:00 – 08:00 UTC)</p>
                <p className="text-xs text-gray-400 leading-relaxed">London traders enter and immediately see the Asian range. Their first move is often to <strong className="text-white">sweep the nearest liquidity</strong> — the Asian high or low. This 1-hour window is where the manipulation phase begins. Not ideal for entries but critical for context.</p>
              </div>
              <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                <p className="text-xs font-bold text-amber-400 mb-2">⚡ LONDON → NY OVERLAP (12:00 – 16:00 UTC)</p>
                <p className="text-xs text-gray-400 leading-relaxed">The single most important trading window in the 24-hour cycle. Maximum global liquidity. Tightest spreads. London has already established direction — NY either <strong className="text-white">confirms it</strong> (continuation, highest WR) or <strong className="text-white">reverses it</strong> (NY reversal, lower WR but still tradeable). If you can only trade 4 hours per day, trade these 4.</p>
              </div>
              <div className="p-4 rounded-xl border border-red-500/10 bg-red-500/5">
                <p className="text-xs font-bold text-red-400 mb-2">☠️ DEAD ZONES (21:00 – 00:00 UTC & Others)</p>
                <p className="text-xs text-gray-400 leading-relaxed">Between sessions, volume dies. Spreads widen 2-5×. Moves are unreliable. Patterns that form in dead zones are traps. <strong className="text-white">There is no edge in dead zones</strong> — only risk.</p>
              </div>
            </div></motion.div>)}</AnimatePresence>
          </div>
        </motion.div>
      </section>

      {/* S05 — 🎯 GROUNDBREAKING: Interactive Session Playbook Builder */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-center gap-2 mb-2"><span className="text-xl">🎯</span><h2 className="text-xl font-extrabold">Session Playbook Builder</h2></div>
          <p className="text-sm text-gray-400 mb-6">Build your personalised trading playbook for each session. Select instruments, models, kill zones, and rules.</p>

          {/* Session tabs */}
          <div className="flex gap-2 mb-6">
            {(['asia', 'london', 'newyork'] as const).map(s => (
              <button key={s} onClick={() => setActiveSession(s)} className={`flex-1 p-3 rounded-xl text-xs font-bold transition-all ${activeSession === s ? 'border-2' : 'bg-white/[0.02] border border-white/5 opacity-60 hover:opacity-80'}`} style={activeSession === s ? { borderColor: sessionMeta[s].color + '60', background: sessionMeta[s].color + '10', color: sessionMeta[s].color } : {}}>
                <span className="block text-sm mb-0.5">{sessionMeta[s].emoji}</span>
                {sessionMeta[s].label}
                <span className="block text-[10px] opacity-60 font-normal mt-0.5">{sessionMeta[s].utc}</span>
              </button>
            ))}
          </div>

          {!playbookComplete ? (
            <div className="space-y-5">
              {/* Session character reminder */}
              <div className="p-3 rounded-xl border border-white/5 bg-white/[0.01]">
                <p className="text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: sessionMeta[activeSession].color }}>Session Character</p>
                <p className="text-xs text-gray-400">{sessionMeta[activeSession].character}</p>
              </div>

              {/* Instruments */}
              <div>
                <p className="text-xs font-bold text-gray-300 mb-2">Instruments (max 3)</p>
                <div className="flex flex-wrap gap-2">
                  {instruments.map(inst => {
                    const selected = playbooks[activeSession].instruments.includes(inst);
                    return <button key={inst} onClick={() => toggleInstrument(activeSession, inst)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selected ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400' : 'bg-white/[0.03] border border-white/10 text-gray-400 hover:border-white/20'}`}>{inst}</button>;
                  })}
                </div>
              </div>

              {/* Model */}
              <div>
                <p className="text-xs font-bold text-gray-300 mb-2">Primary Model</p>
                <div className="flex flex-wrap gap-2">
                  {models.map(m => (
                    <button key={m} onClick={() => updatePlaybook(activeSession, 'model', m)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${playbooks[activeSession].model === m ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400' : 'bg-white/[0.03] border border-white/10 text-gray-400 hover:border-white/20'}`}>{m}</button>
                  ))}
                </div>
              </div>

              {/* Kill Zone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-bold text-gray-300 mb-2">Kill Zone Start (UTC)</p>
                  <input type="time" value={playbooks[activeSession].killZoneStart} onChange={e => updatePlaybook(activeSession, 'killZoneStart', e.target.value)} className="w-full p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white focus:border-amber-500/30 outline-none" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-300 mb-2">Kill Zone End (UTC)</p>
                  <input type="time" value={playbooks[activeSession].killZoneEnd} onChange={e => updatePlaybook(activeSession, 'killZoneEnd', e.target.value)} className="w-full p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white focus:border-amber-500/30 outline-none" />
                </div>
              </div>

              {/* Max Trades + Risk */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-bold text-gray-300 mb-2">Max Trades</p>
                  <div className="flex gap-2">
                    {[0, 1, 2, 3].map(n => (
                      <button key={n} onClick={() => updatePlaybook(activeSession, 'maxTrades', n)} className={`flex-1 p-2.5 rounded-xl text-sm font-bold transition-all ${playbooks[activeSession].maxTrades === n ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400' : 'bg-white/[0.03] border border-white/10 text-gray-400'}`}>{n}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-300 mb-2">Risk %</p>
                  <div className="flex gap-2">
                    {[0.5, 1, 1.5, 2].map(r => (
                      <button key={r} onClick={() => updatePlaybook(activeSession, 'riskPct', r)} className={`flex-1 p-2.5 rounded-xl text-sm font-bold transition-all ${playbooks[activeSession].riskPct === r ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400' : 'bg-white/[0.03] border border-white/10 text-gray-400'}`}>{r}%</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bias */}
              <div>
                <p className="text-xs font-bold text-gray-300 mb-2">Directional Bias Rule</p>
                <div className="space-y-2">
                  {biasOptions.map(b => (
                    <button key={b} onClick={() => updatePlaybook(activeSession, 'bias', b)} className={`w-full text-left p-3 rounded-xl text-xs font-semibold transition-all ${playbooks[activeSession].bias === b ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400' : 'bg-white/[0.03] border border-white/10 text-gray-400 hover:border-white/20'}`}>{b}</button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <p className="text-xs font-bold text-gray-300 mb-2">Session Notes</p>
                <textarea value={playbooks[activeSession].notes} onChange={e => updatePlaybook(activeSession, 'notes', e.target.value)} placeholder="e.g., Wait for Asian range sweep before entering. No trades before 08:00 UTC." className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-gray-600 focus:border-amber-500/30 outline-none resize-none" rows={2} />
              </div>

              {/* Score + Submit */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-gray-300">Playbook Completeness</p>
                  <p className="text-sm font-extrabold" style={{ color: getPlaybookScore() >= 75 ? '#26A69A' : getPlaybookScore() >= 50 ? '#FFB300' : '#EF5350' }}>{getPlaybookScore()}%</p>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${getPlaybookScore()}%`, background: getPlaybookScore() >= 75 ? '#26A69A' : getPlaybookScore() >= 50 ? '#FFB300' : '#EF5350' }} /></div>
                {getPlaybookScore() >= 75 && (
                  <button onClick={() => setPlaybookComplete(true)} className="mt-4 w-full px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Complete Playbook →</button>
                )}
              </div>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                <p className="text-lg font-extrabold text-amber-400 mb-1">Playbook Complete ✓</p>
                <p className="text-xs text-gray-400">Your personalised session playbook is ready. Print it or screenshot it.</p>
              </div>
              {(['asia', 'london', 'newyork'] as const).map(s => {
                const pb = playbooks[s];
                const meta = sessionMeta[s];
                return (
                  <div key={s} className="p-4 rounded-xl border bg-white/[0.02]" style={{ borderColor: meta.color + '30' }}>
                    <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: meta.color }}>{meta.emoji} {meta.label} PLAYBOOK</p>
                    <div className="space-y-1 text-xs text-gray-400">
                      <p><strong className="text-gray-300">Instruments:</strong> {pb.instruments.join(', ') || '—'}</p>
                      <p><strong className="text-gray-300">Model:</strong> {pb.model || '—'}</p>
                      <p><strong className="text-gray-300">Kill Zone:</strong> {pb.killZoneStart || '—'} → {pb.killZoneEnd || '—'} UTC</p>
                      <p><strong className="text-gray-300">Max Trades:</strong> {pb.maxTrades} | <strong className="text-gray-300">Risk:</strong> {pb.riskPct}%</p>
                      <p><strong className="text-gray-300">Bias Rule:</strong> {pb.bias || '—'}</p>
                      {pb.notes && <p><strong className="text-gray-300">Notes:</strong> {pb.notes}</p>}
                    </div>
                  </div>
                );
              })}
              <button onClick={() => setPlaybookComplete(false)} className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-semibold text-gray-300 hover:border-amber-500/30 transition-all">Edit Playbook</button>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* S06 — Session Transition Rules */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-extrabold mb-4">Session Transition Rules</h2>
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
            <button onClick={() => toggle('s06')} className="w-full flex items-center gap-3 p-4 text-left"><span className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center text-xs font-bold text-amber-400/60">04</span><span className="flex-1 text-sm font-semibold text-gray-200">What Changes When Sessions Hand Off</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections['s06'] ? 'rotate-180' : ''}`} /></button>
            <AnimatePresence>{openSections['s06'] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="px-5 pb-5 space-y-3">
              {[
                { from: 'Asia → London', rule: 'The Asian range becomes the liquidity map. Mark the high and low. London will target one side first (the manipulation) then run the other direction. Do NOT hold Asian session trades through London open unless they are already in significant profit.', color: '#3b82f6' },
                { from: 'London → NY', rule: 'If London established a clear direction, NY continuation trades have the highest win rates. If London was choppy, NY often provides a second chance — but with increased risk from news events. Re-evaluate your bias at 12:00 UTC.', color: '#26A69A' },
                { from: 'NY → Close', rule: 'After 19:00 UTC, volume drops sharply. Do NOT enter new positions. Trail existing winners or close. The last 2 hours of NY are for position management, not new entries. Spreads widen 2-3× in the final hour.', color: '#EF5350' },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <p className="text-xs font-bold mb-2" style={{ color: item.color }}>{item.from}</p>
                  <p className="text-xs text-gray-400 leading-relaxed">{item.rule}</p>
                </div>
              ))}
            </div></motion.div>)}</AnimatePresence>
          </div>
        </motion.div>
      </section>

      {/* S07 — The Manipulation Playbook */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-extrabold mb-4">The Manipulation Playbook</h2>
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
            <button onClick={() => toggle('s07')} className="w-full flex items-center gap-3 p-4 text-left"><span className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center text-xs font-bold text-amber-400/60">05</span><span className="flex-1 text-sm font-semibold text-gray-200">How to Trade the London Open Sweep</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections['s07'] ? 'rotate-180' : ''}`} /></button>
            <AnimatePresence>{openSections['s07'] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="px-5 pb-5 space-y-3">
              {[
                { step: '1', title: 'Pre-London: Map the Asian Range', desc: 'Mark the high and low of the 00:00-07:00 UTC range. These are your liquidity targets.' },
                { step: '2', title: 'London Opens: Watch the Sweep', desc: 'Within 30-90 minutes, London will typically push THROUGH one side of the range. This is the manipulation — stop hunts, liquidity grabs. Do NOT enter in the direction of the sweep.' },
                { step: '3', title: 'Wait for the Reversal Signal', desc: 'After the sweep, look for a CHoCH or BOS on the 15M in the OPPOSITE direction. This confirms the manipulation is complete.' },
                { step: '4', title: 'Enter the Real Move', desc: 'Once structure breaks, enter at the first OB/FVG pullback in the direction OPPOSITE to the sweep. Your stop goes below/above the manipulation wick.' },
                { step: '5', title: 'Target: The Other Side of the Range', desc: 'The first target is the opposite side of the Asian range. The second target is the next HTF liquidity level beyond the range.' },
              ].map(item => (
                <div key={item.step} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <p className="text-xs font-bold text-amber-400 mb-1">Step {item.step}: {item.title}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div></motion.div>)}</AnimatePresence>
          </div>
        </motion.div>
      </section>

      {/* S08 — Common Mistakes */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-extrabold mb-4">Common Session Mistakes</h2>
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
            <button onClick={() => toggle('s08')} className="w-full flex items-center gap-3 p-4 text-left"><span className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center text-xs font-bold text-amber-400/60">06</span><span className="flex-1 text-sm font-semibold text-gray-200">4 Session Errors That Drain Your Account</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections['s08'] ? 'rotate-180' : ''}`} /></button>
            <AnimatePresence>{openSections['s08'] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="px-5 pb-5 space-y-3">
              {[
                { title: 'Trading Every Session', mistake: 'Being online 16+ hours "looking for setups" in every session leads to overtrading, fatigue, and revenge trading after Asia losses.', fix: 'Pick ONE session. Build expertise. Your playbook defines when you trade — outside that window, charts are closed.' },
                { title: 'Entering During the Manipulation', mistake: 'Seeing the London open sweep and jumping in the direction of the sweep — only to get reversed immediately.', fix: 'The sweep IS the trap. Wait for the reversal signal (CHoCH/BOS on 15M). The entry comes AFTER manipulation, never during it.' },
                { title: 'Ignoring Session Context for Previous Trades', mistake: 'Carrying an Asia trade into London without adjusting stops. London volatility is 3-5× Asia — your Asian stop distance is inadequate.', fix: 'If holding through a session transition: widen stops to account for increased volatility OR close before the new session opens.' },
                { title: 'Trading Dead Zones', mistake: 'Entering between 21:00-00:00 UTC when both NY and Asia overlap with minimal volume.', fix: 'Dead zones are for analysis, journaling, and planning — never trading. Spreads are wide, moves are unreliable, and patterns are traps.' },
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
              { title: 'Asia = Stage', content: 'Range builds. Mark high/low. Do NOT trade unless JPY specialist. Smart money accumulates quietly.', color: '#3b82f6' },
              { title: 'London = Twist', content: 'Sweeps Asian range (manipulation). Wait for reversal. Enter OPPOSITE to the sweep direction.', color: '#26A69A' },
              { title: 'NY = Resolution', content: 'Continuation or reversal. LON-NY overlap (12-16 UTC) = best window. After 19:00 = close shop.', color: '#EF5350' },
              { title: 'Overlap = Gold', content: 'LON-NY overlap is the single highest-probability window. Maximum liquidity, tightest spreads, strongest moves.', color: '#f59e0b' },
              { title: 'Dead = Danger', content: '21:00-00:00 UTC, mid-Asia dead spots. No volume = no edge. Charts closed, journal open.', color: '#6b7280' },
              { title: 'One Session', content: 'Master one session before adding another. Your playbook defines when you trade. Everything else = closed charts.', color: '#a855f7' },
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
          <p className="text-gray-400 text-sm mb-6">5 time-stamped scenarios. Apply your session playbook.</p>
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
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Outstanding — you understand session dynamics like a professional.' : gameScore >= 3 ? 'Good — review the manipulation timing and dead zone rules.' : 'Re-read the 3 Sessions and the Manipulation Playbook, then retry.'}</p></motion.div>)}
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
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-blue-500 via-teal-500 to-red-500 flex items-center justify-center text-3xl shadow-lg shadow-blue-500/30">🌐</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 7: Session Transitions</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-blue-400 via-teal-400 to-red-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Session Architect &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L7.9-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
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
