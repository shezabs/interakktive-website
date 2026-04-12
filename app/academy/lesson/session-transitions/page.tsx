// app/academy/lesson/session-transitions/page.tsx
// ATLAS Academy — Lesson 7.9: Session Transitions [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 7
// GROUNDBREAKING: 24-Hour Session Clock + Interactive Session Playbook Builder
// TEMPLATE: Matches Level 6 Lesson 8 (trade-management) gold standard exactly
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Crown, ChevronDown } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

function Confetti({ active }: { active: boolean }) {
  if (!active) return null;
  return (<div className="fixed inset-0 pointer-events-none z-50">{Array.from({ length: 60 }).map((_, i) => (<motion.div key={i} initial={{ y: -20, x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400), opacity: 1 }} animate={{ y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 20, rotate: Math.random() * 720, opacity: 0 }} transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5 }} className="absolute w-2 h-2 rounded-sm" style={{ background: ['#f59e0b', '#d946ef', '#34d399', '#3b82f6', '#ef4444'][i % 5] }} />))}</div>);
}

function AnimScene({ drawFn, height = 300 }: { drawFn: (ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => void; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null); const frameRef = useRef(0); const animRef = useRef(0);
  useEffect(() => { const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext('2d'); if (!ctx) return; const dpr = window.devicePixelRatio || 1; const rect = canvas.getBoundingClientRect(); canvas.width = rect.width * dpr; canvas.height = rect.height * dpr; ctx.scale(dpr, dpr); const loop = () => { ctx.clearRect(0, 0, rect.width, rect.height); drawFn(ctx, rect.width, rect.height, frameRef.current); frameRef.current++; animRef.current = requestAnimationFrame(loop); }; loop(); return () => cancelAnimationFrame(animRef.current); }, [drawFn, height]);
  return <div className="w-full rounded-2xl overflow-hidden bg-black/30 border border-white/5"><canvas ref={canvasRef} style={{ width: '100%', height }} /></div>;
}

// ============================================================
// ANIMATION 1: 24-Hour Session Clock
// ============================================================
function SessionClockAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.003; const cx = w / 2; const cy = h / 2 + 5; const R = Math.min(w, h) * 0.38;
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center'; ctx.fillText('The 24-Hour Market Cycle', cx, 16);
    const sessions = [{ name: 'ASIA', start: 0, end: 8, color: '#3b82f6', phase: 'ACCUMULATION' }, { name: 'LONDON', start: 7, end: 16, color: '#26A69A', phase: 'MANIPULATION' }, { name: 'NEW YORK', start: 12, end: 21, color: '#EF5350', phase: 'DISTRIBUTION' }];
    const overlaps = [{ start: 7, end: 8, color: '#FFB300' }, { start: 12, end: 16, color: '#f59e0b' }];
    const hourToAngle = (h2: number) => ((h2 / 24) * Math.PI * 2) - Math.PI / 2;
    sessions.forEach((s, si) => { const sa = hourToAngle(s.start); const ea = hourToAngle(s.end); ctx.beginPath(); ctx.arc(cx, cy, R - 20 + si * 8, sa, ea); ctx.strokeStyle = s.color + '50'; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.stroke(); const ma = (sa + ea) / 2; const lr = R + 14; ctx.fillStyle = s.color; ctx.font = 'bold 8px system-ui'; ctx.textAlign = 'center'; ctx.fillText(s.name, cx + Math.cos(ma) * lr, cy + Math.sin(ma) * lr); ctx.font = '7px system-ui'; ctx.fillStyle = s.color + '90'; ctx.fillText(s.phase, cx + Math.cos(ma) * lr, cy + Math.sin(ma) * lr + 11); });
    overlaps.forEach(ov => { const sa = hourToAngle(ov.start); const ea = hourToAngle(ov.end); ctx.beginPath(); ctx.arc(cx, cy, R - 20, sa, ea); ctx.strokeStyle = ov.color + '40'; ctx.lineWidth = 22; ctx.stroke(); const ma = (sa + ea) / 2; const pulse = Math.sin(t * 3) * 0.3 + 0.7; ctx.fillStyle = `rgba(245,158,11,${pulse * 0.8})`; ctx.font = 'bold 7px system-ui'; ctx.fillText('⚡', cx + Math.cos(ma) * (R - 20), cy + Math.sin(ma) * (R - 20) + 3); });
    for (let h2 = 0; h2 < 24; h2++) { const angle = hourToAngle(h2); const isMajor = h2 % 6 === 0; ctx.strokeStyle = isMajor ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)'; ctx.lineWidth = isMajor ? 1.5 : 0.5; ctx.beginPath(); ctx.moveTo(cx + Math.cos(angle) * (R - (isMajor ? 5 : 2)), cy + Math.sin(angle) * (R - (isMajor ? 5 : 2))); ctx.lineTo(cx + Math.cos(angle) * (R + (isMajor ? 2 : 0)), cy + Math.sin(angle) * (R + (isMajor ? 2 : 0))); ctx.stroke(); if (isMajor) { ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '9px system-ui'; ctx.textAlign = 'center'; ctx.fillText(`${h2.toString().padStart(2, '0')}:00`, cx + Math.cos(angle) * (R + 10), cy + Math.sin(angle) * (R + 10) + 3); } }
    const currentHour = (t * 1.5) % 24; const handAngle = hourToAngle(currentHour); const handR = R - 35;
    ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(handAngle) * handR, cy + Math.sin(handAngle) * handR); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx + Math.cos(handAngle) * handR, cy + Math.sin(handAngle) * handR, 4, 0, Math.PI * 2); ctx.fillStyle = '#f59e0b'; ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fillStyle = '#1a1a2e'; ctx.fill(); ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 1.5; ctx.stroke();
    let currentSession = 'OFF-HOURS'; let sessionColor = '#6b7280';
    if (currentHour >= 12 && currentHour < 21) { currentSession = 'NEW YORK'; sessionColor = '#EF5350'; } else if (currentHour >= 7 && currentHour < 16) { currentSession = 'LONDON'; sessionColor = '#26A69A'; } else if (currentHour < 8) { currentSession = 'ASIA'; sessionColor = '#3b82f6'; }
    ctx.fillStyle = sessionColor; ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center'; ctx.fillText(currentSession, cx, cy + 22);
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '8px system-ui'; ctx.fillText(`${Math.floor(currentHour).toString().padStart(2, '0')}:${Math.floor((currentHour % 1) * 60).toString().padStart(2, '0')} UTC`, cx, cy + 34);
  }, []);
  return <AnimScene drawFn={draw} height={320} />;
}

// ============================================================
// ANIMATION 2: AMD Cycle — Price Path
// ============================================================
function AMDCycleAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.004; const progress = Math.min(1, (t % 10) / 8);
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center'; ctx.fillText('The AMD Cycle — How Smart Money Moves Price', w / 2, 16);
    const pad = 30; const chartL = pad; const chartR = w - pad; const chartW = chartR - chartL; const top = 45; const bot = h - 45; const midY = (top + bot) / 2;
    const phases = [{ name: 'ACCUMULATION', start: 0, end: 0.3, color: '#3b82f6', desc: 'Asia — Range builds' }, { name: 'MANIPULATION', start: 0.3, end: 0.5, color: '#FFB300', desc: 'London Open — False break' }, { name: 'DISTRIBUTION', start: 0.5, end: 1.0, color: '#26A69A', desc: 'London/NY — Real move' }];
    phases.forEach(p => { if (progress >= p.start) { const x1 = chartL + p.start * chartW; const x2 = chartL + Math.min(progress, p.end) * chartW; ctx.fillStyle = p.color + '08'; ctx.fillRect(x1, top, x2 - x1, bot - top); ctx.strokeStyle = p.color + '20'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(x1, top); ctx.lineTo(x1, bot); ctx.stroke(); if (progress >= p.start + 0.05) { ctx.fillStyle = p.color; ctx.font = 'bold 8px system-ui'; ctx.textAlign = 'center'; ctx.fillText(p.name, (x1 + Math.min(x2, chartL + p.end * chartW)) / 2, top - 5); ctx.fillStyle = p.color + '80'; ctx.font = '7px system-ui'; ctx.fillText(p.desc, (x1 + Math.min(x2, chartL + p.end * chartW)) / 2, bot + 14); } } });
    const totalPts = 120; const visPts = Math.floor(progress * totalPts);
    const seed = (n: number) => Math.sin(n * 127.1 + 311.7) * 0.5 + 0.5;
    const getY = (i: number): number => { const norm = i / totalPts; const noise = (seed(i * 7) - 0.5) * 8; if (norm < 0.3) return midY + Math.sin(norm * 40) * 12 + noise * 0.5; if (norm < 0.4) { const mp = (norm - 0.3) / 0.1; return midY + 12 + mp * 35 + noise * 0.4; } if (norm < 0.5) { const rp = (norm - 0.4) / 0.1; return midY + 47 - rp * 50 + noise * 0.3; } if (norm < 1.0) { const dp = (norm - 0.5) / 0.5; return midY - 3 - dp * 70 + noise * 0.5; } return midY; };
    if (visPts > 1) { ctx.beginPath(); ctx.moveTo(chartL, getY(0)); for (let i = 1; i < visPts; i++) { ctx.lineTo(chartL + (i / totalPts) * chartW, getY(i)); } ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1.5; ctx.stroke(); const tipX = chartL + ((visPts - 1) / totalPts) * chartW; ctx.beginPath(); ctx.arc(tipX, getY(visPts - 1), 3, 0, Math.PI * 2); ctx.fillStyle = '#f59e0b'; ctx.fill(); }
    if (progress > 0.35) { ctx.fillStyle = '#FFB300'; ctx.font = 'bold 8px system-ui'; ctx.textAlign = 'center'; ctx.fillText('⬇ LIQUIDITY SWEEP', chartL + 0.38 * chartW, midY + 63); }
    if (progress > 0.6) { ctx.fillStyle = '#26A69A'; ctx.font = 'bold 8px system-ui'; ctx.textAlign = 'center'; ctx.fillText('▲ SMART MONEY ENTRY', chartL + 0.5 * chartW, midY + 10); }
    if (progress > 0.85) { ctx.fillStyle = '#26A69A'; ctx.font = 'bold 9px system-ui'; ctx.textAlign = 'center'; ctx.fillText('THE REAL MOVE', chartL + 0.75 * chartW, top + 20); }
    if (progress > 0.05 && progress < 0.35) { ctx.setLineDash([3, 3]); ctx.strokeStyle = 'rgba(59,130,246,0.3)'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(chartL, midY - 15); ctx.lineTo(chartL + 0.3 * chartW, midY - 15); ctx.stroke(); ctx.beginPath(); ctx.moveTo(chartL, midY + 15); ctx.lineTo(chartL + 0.3 * chartW, midY + 15); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = 'rgba(59,130,246,0.4)'; ctx.font = '7px system-ui'; ctx.textAlign = 'left'; ctx.fillText('Range High', chartL + 3, midY - 18); ctx.fillText('Range Low', chartL + 3, midY + 24); }
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// SESSION PLAYBOOK BUILDER
// ============================================================
interface SessionPlaybook { instruments: string[]; model: string; maxTrades: number; riskPct: number; killZoneStart: string; killZoneEnd: string; bias: string; notes: string; }
const defaultPlaybook = (): SessionPlaybook => ({ instruments: [], model: '', maxTrades: 2, riskPct: 1, killZoneStart: '', killZoneEnd: '', bias: '', notes: '' });

// ============================================================
// DATA
// ============================================================
const sessionDeepDive = [
  { title: '🌏 Asia (00:00 – 08:00 UTC) — The Stage Setter', desc: '<strong>Character:</strong> Accumulation. Low volume, tight ranges, small bodies. Smart money is quietly building positions.<br/><br/><strong>What to do:</strong> Mark the Asian range high and low — these become the liquidity targets for London. Do NOT trade during Asia unless you specialise in JPY pairs.<br/><br/><strong>The trap:</strong> Breakouts during Asia are almost always false. Wait for London.' },
  { title: '🌍 London (07:00 – 16:00 UTC) — The Manipulator', desc: '<strong>Character:</strong> Manipulation &rarr; Distribution. London opens with a BANG — sweeps one side of the Asian range (manipulation), then reverses into the real move (distribution).<br/><br/><strong>What to do:</strong> Watch for the false break of the Asian range within 30-90 minutes of London. After the sweep, look for structure breaks on 15M.<br/><br/><strong>Golden window:</strong> 07:00-10:00 UTC is where 70% of the day&apos;s setups form.' },
  { title: '🌎 New York (12:00 – 21:00 UTC) — The Closer', desc: '<strong>Character:</strong> Distribution + continuation OR reversal. NY either joins London&apos;s move or provides the second manipulation.<br/><br/><strong>What to do:</strong> LON-NY overlap (12:00-16:00) is the highest-volume window globally. After 16:00 volume dies — close or trail, do not enter.<br/><br/><strong>The trap:</strong> 13:30-14:00 UTC (US releases). Spreads spike. Never hold entries through major news.' },
];

const transitionRules = [
  { from: 'Asia → London', rule: 'The Asian range becomes the liquidity map. Mark the high and low. London will target one side first (the manipulation) then run the other direction. Do NOT hold Asian trades through London open unless in significant profit.', color: '#3b82f6' },
  { from: 'London → NY', rule: 'If London established a clear direction, NY continuation trades have the highest win rates. If London was choppy, NY often provides a second chance — but with increased risk from news events. Re-evaluate your bias at 12:00 UTC.', color: '#26A69A' },
  { from: 'NY → Close', rule: 'After 19:00 UTC, volume drops sharply. Do NOT enter new positions. Trail existing winners or close. The last 2 hours of NY are for position management, not new entries.', color: '#EF5350' },
];

const manipulationSteps = [
  { step: '1', title: 'Pre-London: Map the Asian Range', desc: 'Mark the high and low of the 00:00-07:00 UTC range. These are your liquidity targets.' },
  { step: '2', title: 'London Opens: Watch the Sweep', desc: 'Within 30-90 minutes, London will push THROUGH one side. This is the manipulation. Do NOT enter in the sweep direction.' },
  { step: '3', title: 'Wait for the Reversal Signal', desc: 'After the sweep, look for CHoCH or BOS on the 15M in the OPPOSITE direction. This confirms manipulation is complete.' },
  { step: '4', title: 'Enter the Real Move', desc: 'Enter at the first OB/FVG pullback in the direction OPPOSITE to the sweep. Stop goes below/above the manipulation wick.' },
  { step: '5', title: 'Target: Other Side of Range', desc: 'First target is the opposite side of the Asian range. Second target is the next HTF liquidity level beyond.' },
];

const sessionMistakes = [
  { title: 'Trading Every Session', mistake: '16+ hours online leads to overtrading, fatigue, and revenge trading after Asia losses.', fix: 'Pick ONE session. Build expertise. Outside that window, charts are closed.' },
  { title: 'Entering During the Manipulation', mistake: 'Jumping in the direction of the London sweep — only to get reversed immediately.', fix: 'The sweep IS the trap. Wait for the reversal signal (CHoCH/BOS on 15M).' },
  { title: 'Ignoring Session Context for Previous Trades', mistake: 'Carrying an Asia trade into London without adjusting stops. London volatility is 3-5&times; Asia.', fix: 'Widen stops for session transitions OR close before the new session opens.' },
  { title: 'Trading Dead Zones', mistake: 'Entering between 21:00-00:00 UTC — minimal volume, wide spreads, unreliable patterns.', fix: 'Dead zones are for analysis and planning — never trading.' },
];

const quizQuestions = [
  { q: 'What is the primary purpose of the Asian session in the AMD cycle?', opts: ['Distribution — trending moves happen here', 'Accumulation — smart money builds positions in a range', 'Manipulation — false breakouts happen here', 'All sessions serve the same purpose'], correct: 1, explain: 'Asian session is the accumulation phase. Smart money builds positions in a range, creating liquidity pools above and below that London will target.' },
  { q: 'The London open is most associated with which phase of the AMD cycle?', opts: ['Accumulation', 'Manipulation — sweeping liquidity from the Asian range', 'Distribution', 'No specific phase'], correct: 1, explain: 'London open is the manipulation phase — sweeping Asian session liquidity (stops above or below the range) before the real directional move begins.' },
  { q: 'When Asia builds a tight 30-pip range and London opens, what should you watch for FIRST?', opts: ['Buy the London open candle immediately', 'A false break of the Asian range high OR low', 'Short because London typically reverses Asia', 'Enter based on Daily bias regardless'], correct: 1, explain: 'The first move at London open is typically a false break (manipulation) of one side of the Asian range. Watch for the sweep, then wait for reversal confirmation.' },
  { q: 'The London-NY overlap (12:00-16:00 UTC) is considered the most volatile because:', opts: ['Both sessions have maximum liquidity simultaneously', 'NY traders are still waking up', 'Most news events are released then', 'Asia traders are closing positions'], correct: 0, explain: 'The overlap combines the two largest financial centres operating simultaneously, producing the highest volume and tightest spreads of the entire 24-hour cycle.' },
  { q: 'You have a bullish Daily bias. Asia ranged. London swept the low and reversed. Best entry window?', opts: ['Asia session', 'London open manipulation sweep', 'London-NY overlap — after manipulation confirms', 'NY afternoon'], correct: 2, explain: 'The London-NY overlap, after manipulation has confirmed and the reversal is underway, provides the highest-probability entry with maximum volume support.' },
  { q: 'Dead zones should be traded because:', opts: ['Spreads are tighter', 'Volume is low so moves are predictable', 'They should NOT be traded — low volume means unreliable moves and wider spreads', 'They offer best R:R'], correct: 2, explain: 'Dead zones have no institutional participation. Spreads widen, moves are erratic, and patterns formed in dead zones are traps. There is no edge.' },
  { q: 'A session-specific playbook should include:', opts: ['Only instrument and direction', 'Instruments, kill zone times, max trades, risk %, model type, and bias criteria', 'Just the news events for the day', 'Same rules for every session'], correct: 1, explain: 'A complete session playbook defines exactly what you trade, when you trade, how much you risk, and what model you use — specific to each session.' },
  { q: 'If your primary instrument is XAUUSD, which overlap gives highest volume?', opts: ['Asia-London (07:00-08:00)', 'London-NY overlap (12:00-16:00)', 'NY-Asia (21:00-00:00)', 'All overlaps are equal for Gold'], correct: 1, explain: 'XAUUSD has peak volume during the London-NY overlap when both major centres are active simultaneously — tightest spreads and strongest institutional moves.' },
];

const gameRounds = [
  { scenario: '<strong>07:55 UTC</strong> — Asia built a 25-pip range on EUR/USD. Bearish Daily bias. London opens in 5 minutes. Price is creeping toward the Asian high. Your playbook says &quot;wait for London manipulation.&quot;', options: [
    { text: 'Short now — price at the Asian high is perfect entry before London', correct: false, explain: 'Your playbook says wait for manipulation. Entering before the session opens means front-running the plan — if London sweeps HIGHER first, you get stopped before the real move.' },
    { text: 'Wait — set alerts at Asian high and low. Let London show the sweep direction first.', correct: true, explain: 'The playbook exists for a reason. Let London open, sweep one side, then enter after manipulation confirms. Discipline over anticipation.' },
    { text: 'Cancel bearish bias — price moving to the high means bulls are in control', correct: false, explain: 'Asian movement does NOT change your Daily bias. A creep to the high is what manipulation looks like — building liquidity for London to sweep.' },
  ]},
  { scenario: '<strong>14:30 UTC</strong> — LON-NY overlap. EUR/USD swept Asian low, reversed, broke structure bullish. Your playbook says max 2 trades. You have taken 1 winner. A 9/10 setup appears.', options: [
    { text: 'Yes — you still have 1 trade left and the setup is near-perfect', correct: true, explain: 'Your playbook allows 2 trades. You have used 1. 9/10 setup during the highest-volume window with allocation remaining — the playbook says TAKE IT.' },
    { text: 'No — one winner is enough, protect your profits', correct: false, explain: '"One is enough" is emotion, not strategy. If the setup meets all criteria and you have allocation remaining, the playbook says take it.' },
    { text: 'Take it but reduce risk to 0.5%', correct: false, explain: 'Reducing risk after a winner is a psychological crutch. Your playbook says 1% risk. 9/10 setup = full risk. Consistency beats emotion.' },
  ]},
  { scenario: '<strong>19:30 UTC</strong> — Late NY. Volume dropping. GBP/USD setup forming. Your playbook says kill zone ends at 19:00 UTC. Setup formed 30 minutes AFTER your window closed.', options: [
    { text: 'Take it — setup looks clean and kill zone is just a guideline', correct: false, explain: 'Your kill zone exists because setups after it have lower win rates and worse R:R. "Just a guideline" is how playbooks get destroyed.' },
    { text: 'Skip — playbook says kill zone ended at 19:00. Outside trading window.', correct: true, explain: 'Discipline beats opportunity. A setup outside your kill zone is a temptation, not a setup. Close charts, review the day.' },
    { text: 'Take at reduced size as a bonus trade', correct: false, explain: '"Bonus trades" do not exist in a serious playbook. Close the charts.' },
  ]},
  { scenario: '<strong>03:00 UTC</strong> — Deep Asia. XAUUSD ranging in 15-pip box. Bullish bias. Small bullish candle appears. Friend messages: &quot;Gold looks like it wants to break out, going long now.&quot;', options: [
    { text: 'Follow — same bias, Asia ranges break eventually', correct: false, explain: 'Asian ranges are ACCUMULATION, not distribution. No volume at 3AM to sustain a breakout. Your buddy is about to get trapped.' },
    { text: 'Ignore and wait — 03:00 is a dead zone. Range breaks at London open, not 3AM.', correct: true, explain: 'Asia ACCUMULATES. The breakout happens at London — and often starts with a false break first. Set alerts and wait.' },
    { text: 'Set buy stop above the range high', correct: false, explain: 'A buy stop above Asian range during accumulation = entering the manipulation. London will likely sweep it first, trigger your stop, then reverse.' },
  ]},
  { scenario: '<strong>12:15 UTC</strong> — NY just opened. Gold swept Asian low at London open, reversed bullish, but no 15M trigger yet. 15 minutes in. You feel the urgency — &quot;if I don&apos;t enter now, I&apos;ll miss the move.&quot;', options: [
    { text: 'Enter now — thesis is correct and waiting risks missing it', correct: false, explain: 'Thesis is correct but TRIGGER has not formed. Entering on urgency = entering on emotion. The overlap lasts until 16:00 — you have almost 4 hours.' },
    { text: 'Close charts — too much emotional pressure today', correct: false, explain: 'Recognising urgency is healthy, but closing charts abandons a valid thesis. The answer is discipline, not quitting.' },
    { text: 'Wait for the 15M trigger. Overlap runs until 16:00. No trigger = no trade.', correct: true, explain: 'Perfect discipline. Thesis + structure + trigger. You have 2 of 3. If the trigger never forms, that means the market did not confirm — and you saved capital. That IS trading.' },
  ]},
];

const instruments = ['XAUUSD', 'EUR/USD', 'GBP/USD', 'NASDAQ', 'US30', 'USD/JPY'];
const models = ['OB Pullback', 'Liquidity Sweep', 'BOS Continuation', 'FVG Entry', 'Breaker Retest', 'Range Breakout'];
const biasOptions = ['Bullish only', 'Bearish only', 'Both (with HTF confirmation)', 'No trading this session'];
const sessionMeta: Record<string, { label: string; color: string; utc: string; character: string; emoji: string }> = {
  asia: { label: 'ASIA', color: '#3b82f6', utc: '00:00 – 08:00 UTC', character: 'Accumulation — Range building', emoji: '🌏' },
  london: { label: 'LONDON', color: '#26A69A', utc: '07:00 – 16:00 UTC', character: 'Manipulation → Distribution', emoji: '🌍' },
  newyork: { label: 'NEW YORK', color: '#EF5350', utc: '12:00 – 21:00 UTC', character: 'Distribution — The real move', emoji: '🌎' },
};

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function SessionTransitionsPage() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setOpenSections(p => ({ ...p, [id]: !p[id] }));

  // Playbook Builder
  const [activeSession, setActiveSession] = useState<'asia' | 'london' | 'newyork'>('asia');
  const [playbooks, setPlaybooks] = useState<Record<string, SessionPlaybook>>({ asia: defaultPlaybook(), london: defaultPlaybook(), newyork: defaultPlaybook() });
  const [playbookComplete, setPlaybookComplete] = useState(false);
  const updatePlaybook = (session: string, field: keyof SessionPlaybook, value: string | number | string[]) => { setPlaybooks(p => ({ ...p, [session]: { ...p[session], [field]: value } })); };
  const toggleInstrument = (session: string, inst: string) => { setPlaybooks(p => { const current = p[session].instruments; const next = current.includes(inst) ? current.filter(i => i !== inst) : [...current, inst].slice(0, 3); return { ...p, [session]: { ...p[session], instruments: next } }; }); };
  const getPlaybookScore = (): number => { let score = 0; ['asia', 'london', 'newyork'].forEach(s => { const pb = playbooks[s]; if (pb.instruments.length > 0) score += 1; if (pb.model) score += 1; if (pb.killZoneStart && pb.killZoneEnd) score += 1; if (pb.bias) score += 1; }); return Math.round((score / 12) * 100); };

  // Game
  const [gameRound, setGameRound] = useState(0);
  const [gameAnswers, setGameAnswers] = useState<(number | null)[]>(gameRounds.map(() => null));
  const [gameScore, setGameScore] = useState(0);
  const handleGameAnswer = (optIdx: number) => { if (gameAnswers[gameRound] !== null) return; const newA = [...gameAnswers]; newA[gameRound] = optIdx; setGameAnswers(newA); if (gameRounds[gameRound].options[optIdx].correct) setGameScore(s => s + 1); };

  // Quiz
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(quizQuestions.map(() => null));
  const handleQuizAnswer = (qi: number, oi: number) => { if (quizAnswers[qi] !== null) return; const n = [...quizAnswers]; n[qi] = oi; setQuizAnswers(n); };
  const quizDone = quizAnswers.every(a => a !== null);
  const quizScoreVal = quizDone ? Math.round((quizAnswers.filter((a, i) => a === quizQuestions[i].correct).length / quizQuestions.length) * 100) : 0;
  const certUnlocked = quizDone && quizScoreVal >= 66;
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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 7 &middot; Lesson 9</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Session<br /><span className="bg-gradient-to-r from-blue-400 via-teal-400 to-red-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Transitions</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">Asia accumulates. London manipulates. New York distributes. Master the 24-hour cycle and trade when the odds are stacked in your favour.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* S00 */}
      <section className="max-w-2xl mx-auto px-5 py-20"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
        <div className="p-6 rounded-2xl glass-card mb-6">
          <p className="text-xl font-extrabold mb-3">🔍 The Three-Act Play</p>
          <p className="text-gray-400 leading-relaxed mb-4">Think of the 24-hour market cycle like a <strong className="text-amber-400">three-act play</strong>. Act 1 (Asia) sets the stage — the range builds, positions are quietly accumulated. Act 2 (London open) is the twist — a false break that catches the crowd on the wrong side. Act 3 (London-NY) is the resolution — the real move that pays the patient traders.</p>
          <p className="text-gray-400 leading-relaxed">If you walk into the theatre during Act 3 without knowing Acts 1 and 2, <strong className="text-white">the plot makes no sense</strong>.</p>
        </div>
        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
          <p className="text-sm text-gray-400 leading-relaxed">1,200 Gold trades analysed over 6 months. Trades during LON-NY overlap (12:00-16:00 UTC) with prior Asian range context: <strong className="text-green-400">56% WR, 1:2.3 R:R</strong>. Trades during Asia or late NY: <strong className="text-red-400">38% WR, 1:1.0 R:R</strong>. Same strategy, same instrument — session timing alone worth &pound;4,800/quarter.</p>
        </div>
      </motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The 24-Hour Clock</p><h2 className="text-2xl font-extrabold mb-4">Three Sessions, One Cycle</h2><p className="text-gray-400 text-sm mb-6">Asia (blue) &rarr; London (teal) &rarr; New York (red). Overlaps marked with ⚡.</p><SessionClockAnimation /></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The AMD Cycle</p><h2 className="text-2xl font-extrabold mb-4">Accumulation &rarr; Manipulation &rarr; Distribution</h2><p className="text-gray-400 text-sm mb-6">Every single day, smart money runs the same playbook.</p><AMDCycleAnimation /></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The 3 Sessions Decoded</p><h2 className="text-2xl font-extrabold mb-4">Asia, London, New York</h2><div className="space-y-3">{sessionDeepDive.map((item, i) => (<div key={i}><button onClick={() => toggle(`sd-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`sd-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`sd-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.desc }} /></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Session Overlaps</p><h2 className="text-2xl font-extrabold mb-4">Where the Money Is</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#FFB300]">ASIA &rarr; LONDON (07:00-08:00)</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Manipulation begins. London sees Asian range and targets the nearest liquidity. Context, not entries.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#f59e0b]">LONDON &rarr; NY (12:00-16:00)</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">The single most important window. Maximum liquidity, tightest spreads. If you can only trade 4 hours — trade these 4.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#ef4444]">DEAD ZONES (21:00-00:00)</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Volume dies, spreads widen 2-5&times;. No edge exists here — only risk. Close charts.</span></p></div>
      </div></motion.div></section>

      {/* S05 — GROUNDBREAKING: Session Playbook Builder */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Interactive Challenge</p><h2 className="text-2xl font-extrabold mb-2">Session Playbook Builder</h2><p className="text-gray-400 text-sm mb-6">Build your personalised trading playbook for each session.</p>
      <div className="p-6 rounded-2xl glass-card">
        <div className="flex gap-2 mb-6">{(['asia', 'london', 'newyork'] as const).map(s => (<button key={s} onClick={() => setActiveSession(s)} className={`flex-1 p-3 rounded-xl text-xs font-bold transition-all ${activeSession === s ? 'border-2' : 'bg-white/[0.02] border border-white/5 opacity-60 hover:opacity-80'}`} style={activeSession === s ? { borderColor: sessionMeta[s].color + '60', background: sessionMeta[s].color + '10', color: sessionMeta[s].color } : {}}><span className="block text-sm mb-0.5">{sessionMeta[s].emoji}</span>{sessionMeta[s].label}<span className="block text-[10px] opacity-60 font-normal mt-0.5">{sessionMeta[s].utc}</span></button>))}</div>
        {!playbookComplete ? (<div className="space-y-4">
          <div className="p-3 rounded-xl border border-white/5 bg-white/[0.01]"><p className="text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: sessionMeta[activeSession].color }}>Session Character</p><p className="text-xs text-gray-400">{sessionMeta[activeSession].character}</p></div>
          <div><p className="text-xs font-bold text-gray-300 mb-2">Instruments (max 3)</p><div className="flex flex-wrap gap-2">{instruments.map(inst => { const selected = playbooks[activeSession].instruments.includes(inst); return <button key={inst} onClick={() => toggleInstrument(activeSession, inst)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selected ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400' : 'bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:bg-white/[0.07]'}`}>{inst}</button>; })}</div></div>
          <div><p className="text-xs font-bold text-gray-300 mb-2">Primary Model</p><div className="flex flex-wrap gap-2">{models.map(m => (<button key={m} onClick={() => updatePlaybook(activeSession, 'model', m)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${playbooks[activeSession].model === m ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400' : 'bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:bg-white/[0.07]'}`}>{m}</button>))}</div></div>
          <div className="grid grid-cols-2 gap-3"><div><p className="text-xs font-bold text-gray-300 mb-2">Kill Zone Start (UTC)</p><input type="time" value={playbooks[activeSession].killZoneStart} onChange={e => updatePlaybook(activeSession, 'killZoneStart', e.target.value)} className="w-full p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white focus:border-amber-500/30 outline-none" /></div><div><p className="text-xs font-bold text-gray-300 mb-2">Kill Zone End (UTC)</p><input type="time" value={playbooks[activeSession].killZoneEnd} onChange={e => updatePlaybook(activeSession, 'killZoneEnd', e.target.value)} className="w-full p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white focus:border-amber-500/30 outline-none" /></div></div>
          <div className="grid grid-cols-2 gap-3"><div><p className="text-xs font-bold text-gray-300 mb-2">Max Trades</p><div className="flex gap-2">{[0, 1, 2, 3].map(n => (<button key={n} onClick={() => updatePlaybook(activeSession, 'maxTrades', n)} className={`flex-1 p-2.5 rounded-xl text-sm font-bold transition-all ${playbooks[activeSession].maxTrades === n ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400' : 'bg-white/[0.04] border border-white/[0.08] text-gray-400'}`}>{n}</button>))}</div></div><div><p className="text-xs font-bold text-gray-300 mb-2">Risk %</p><div className="flex gap-2">{[0.5, 1, 1.5, 2].map(r => (<button key={r} onClick={() => updatePlaybook(activeSession, 'riskPct', r)} className={`flex-1 p-2.5 rounded-xl text-sm font-bold transition-all ${playbooks[activeSession].riskPct === r ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400' : 'bg-white/[0.04] border border-white/[0.08] text-gray-400'}`}>{r}%</button>))}</div></div></div>
          <div><p className="text-xs font-bold text-gray-300 mb-2">Directional Bias Rule</p><div className="space-y-1.5">{biasOptions.map(b => (<button key={b} onClick={() => updatePlaybook(activeSession, 'bias', b)} className={`w-full text-left p-3 rounded-xl text-xs font-semibold transition-all ${playbooks[activeSession].bias === b ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400' : 'bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:bg-white/[0.07]'}`}>{b}</button>))}</div></div>
          <div><p className="text-xs font-bold text-gray-300 mb-2">Session Notes</p><textarea value={playbooks[activeSession].notes} onChange={e => updatePlaybook(activeSession, 'notes', e.target.value)} placeholder="e.g., Wait for Asian range sweep before entering..." className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-gray-600 focus:border-amber-500/30 outline-none resize-none" rows={2} /></div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5"><div className="flex items-center justify-between mb-2"><p className="text-xs font-bold text-gray-300">Playbook Completeness</p><p className="text-sm font-extrabold" style={{ color: getPlaybookScore() >= 75 ? '#26A69A' : getPlaybookScore() >= 50 ? '#FFB300' : '#EF5350' }}>{getPlaybookScore()}%</p></div><div className="h-2 rounded-full bg-white/5 overflow-hidden"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${getPlaybookScore()}%`, background: getPlaybookScore() >= 75 ? '#26A69A' : getPlaybookScore() >= 50 ? '#FFB300' : '#EF5350' }} /></div>{getPlaybookScore() >= 75 && (<button onClick={() => setPlaybookComplete(true)} className="mt-4 w-full px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Complete Playbook &rarr;</button>)}</div>
        </div>) : (<motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400 mb-1">Playbook Complete ✓</p><p className="text-xs text-gray-400">Screenshot or print your playbook.</p></div>
          {(['asia', 'london', 'newyork'] as const).map(s => { const pb = playbooks[s]; const meta = sessionMeta[s]; return (<div key={s} className="p-4 rounded-xl border bg-white/[0.02]" style={{ borderColor: meta.color + '30' }}><p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: meta.color }}>{meta.emoji} {meta.label}</p><div className="space-y-1 text-xs text-gray-400"><p><strong className="text-gray-300">Instruments:</strong> {pb.instruments.join(', ') || '—'}</p><p><strong className="text-gray-300">Model:</strong> {pb.model || '—'}</p><p><strong className="text-gray-300">Kill Zone:</strong> {pb.killZoneStart || '—'} &rarr; {pb.killZoneEnd || '—'} UTC</p><p><strong className="text-gray-300">Max Trades:</strong> {pb.maxTrades} | <strong className="text-gray-300">Risk:</strong> {pb.riskPct}%</p><p><strong className="text-gray-300">Bias:</strong> {pb.bias || '—'}</p>{pb.notes && <p><strong className="text-gray-300">Notes:</strong> {pb.notes}</p>}</div></div>); })}
          <button onClick={() => setPlaybookComplete(false)} className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-semibold text-gray-300 hover:bg-white/[0.07]">Edit Playbook</button>
        </motion.div>)}
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Session Transition Rules</p><h2 className="text-2xl font-extrabold mb-4">What Changes at Handoffs</h2><div className="space-y-3">{transitionRules.map((item, i) => (<div key={i}><button onClick={() => toggle(`tr-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold" style={{ color: item.color }}>{item.from}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`tr-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`tr-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-sm text-gray-400 leading-relaxed">{item.rule}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; The Manipulation Playbook</p><h2 className="text-2xl font-extrabold mb-4">How to Trade the London Open Sweep</h2><div className="p-6 rounded-2xl glass-card space-y-3">{manipulationSteps.map(s => (<div key={s.step} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">Step {s.step}: {s.title}</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">{s.desc}</span></p></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Session Mistakes</p><h2 className="text-2xl font-extrabold mb-4">4 Errors That Drain Your Account</h2><div className="space-y-3">{sessionMistakes.map((item, i) => (<div key={i}><button onClick={() => toggle(`sm-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`sm-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`sm-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-xs text-red-400 mb-2">&#10060; {item.mistake}</p><p className="text-xs text-green-400">&#10004; {item.fix}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Cheat Sheet</p><h2 className="text-2xl font-extrabold mb-4">Session Quick Reference</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#3b82f6]">ASIA = STAGE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Range builds. Mark high/low. Do NOT trade. Smart money accumulates.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#26A69A]">LONDON = TWIST</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Sweeps Asian range (manipulation). Wait for reversal. Enter OPPOSITE to the sweep.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">NY = RESOLUTION</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Continuation or reversal. LON-NY overlap = best window. After 19:00 = close shop.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#f59e0b]">OVERLAP = GOLD</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">12:00-16:00 UTC. Maximum liquidity, tightest spreads, strongest moves.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#6b7280]">DEAD = DANGER</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">21:00-00:00 UTC. No volume = no edge. Charts closed, journal open.</span></p></div>
      </div></motion.div></section>

      {/* S10 — Game */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Test Your Understanding</p><h2 className="text-2xl font-extrabold mb-2">Session Transitions Game</h2><p className="text-gray-400 text-sm mb-6">5 time-stamped scenarios. Apply your session playbook.</p>
      <div className="p-6 rounded-2xl glass-card"><div className="flex items-center justify-between mb-4"><span className="text-xs font-bold text-amber-400">Round {gameRound + 1} of {gameRounds.length}</span><span className="text-xs font-mono text-gray-500">{gameScore}/{gameRounds.length} correct</span></div><p className="text-sm text-gray-300 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: gameRounds[gameRound].scenario }} /><div className="space-y-2">{gameRounds[gameRound].options.map((opt, oi) => { const answered = gameAnswers[gameRound] !== null; const selected = gameAnswers[gameRound] === oi; const isCorrect = opt.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return (<div key={oi}><button onClick={() => handleGameAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt.text }} /></button>{answered && selected && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]"><p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`} dangerouslySetInnerHTML={{ __html: `${isCorrect ? '✓' : '✗'} ${opt.explain}` }} /></motion.div>)}</div>); })}</div>{gameAnswers[gameRound] !== null && gameRound < gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5"><button onClick={() => setGameRound(r => r + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button></motion.div>)}{gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Excellent — you understand session dynamics like a professional.' : gameScore >= 3 ? 'Good — review the manipulation timing and dead zone rules.' : 'Re-read the 3 Sessions and the Manipulation Playbook.'}</p></motion.div>)}</div></motion.div></section>

      {/* S11 — Quiz + Certificate */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Knowledge Check</p><h2 className="text-2xl font-extrabold mb-6">Final Quiz &mdash; 8 Questions</h2>
      <div className="space-y-6">{quizQuestions.map((q, qi) => (<div key={qi} className="p-5 rounded-2xl glass-card"><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p><p className="text-sm font-semibold text-white mb-4">{q.q}</p><div className="space-y-2">{q.opts.map((opt, oi) => { const answered = quizAnswers[qi] !== null; const selected = quizAnswers[qi] === oi; const isCorrect = oi === q.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return <button key={oi} onClick={() => handleQuizAnswer(qi, oi)} disabled={answered} className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`}>{opt}</button>; })}</div>{quizAnswers[qi] !== null && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg bg-white/[0.02]"><p className="text-xs text-amber-400" dangerouslySetInnerHTML={{ __html: `<span class="font-bold">&#9989;</span> ${q.explain}` }} /></motion.div>)}</div>))}</div>
      {quizDone && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center"><p className="text-3xl font-extrabold mb-2">{quizScoreVal}%</p><p className="text-sm text-gray-400">{quizScoreVal >= 66 ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate. Review and try again.'}</p></motion.div>)}
      {certUnlocked && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10"><div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}><div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(139,92,246,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} /><div className="relative z-10 text-center"><div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-blue-500 via-teal-500 to-red-500 flex items-center justify-center text-3xl shadow-lg shadow-blue-500/30">🌐</div><p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p><p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 7: Session Transitions</strong><br />at ATLAS Academy by Interakktive</p><p className="bg-gradient-to-r from-blue-400 via-teal-400 to-red-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Session Architect &mdash;</p><p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L7.9-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p></div></div></motion.div>)}</motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-20 text-center"><Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">&larr; Back to Academy</Link></section>
    </div>
  );
}
