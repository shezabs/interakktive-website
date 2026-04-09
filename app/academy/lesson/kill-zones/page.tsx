// app/academy/lesson/kill-zones/page.tsx
// ATLAS Academy — Lesson 3.10: Kill Zones — When to Trade [PRO]
'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Crown, ArrowRight, ChevronDown } from 'lucide-react';

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

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
// SESSION CLOCK ANIMATION — 24hr clock showing sessions
// ============================================================
function SessionClockAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);
    const midX = w / 2;
    const midY = h / 2;
    const radius = Math.min(w, h) * 0.36;

    // Clock face
    ctx.strokeStyle = 'rgba(148,163,184,0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(midX, midY, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Session arcs (UTC hours mapped to angle)
    // Asian: 00:00-08:00 UTC (midnight to 8am)
    // London: 07:00-16:00 UTC
    // New York: 13:00-22:00 UTC
    const sessions = [
      { name: 'ASIAN', start: 0, end: 8, color: '#a855f7', alpha: 0.12 },
      { name: 'LONDON', start: 7, end: 16, color: '#3b82f6', alpha: 0.12 },
      { name: 'NEW YORK', start: 13, end: 22, color: '#22c55e', alpha: 0.12 },
    ];

    const hourToAngle = (hr: number) => ((hr / 24) * Math.PI * 2) - Math.PI / 2;
    const currentPhase = (f % 720) / 720; // full cycle in ~12 seconds
    const activeSession = currentPhase < 0.33 ? 0 : currentPhase < 0.66 ? 1 : 2;

    sessions.forEach((s, i) => {
      const startAngle = hourToAngle(s.start);
      const endAngle = hourToAngle(s.end);
      const isActive = i === activeSession;
      const arcAlpha = isActive ? 0.2 + Math.sin(f * 0.05) * 0.05 : s.alpha;

      ctx.fillStyle = s.color.replace(')', `,${arcAlpha})`).replace('rgb', 'rgba').replace('#', '');
      // Convert hex to rgba
      const r = parseInt(s.color.slice(1, 3), 16);
      const g = parseInt(s.color.slice(3, 5), 16);
      const b = parseInt(s.color.slice(5, 7), 16);
      ctx.fillStyle = `rgba(${r},${g},${b},${arcAlpha})`;
      ctx.beginPath();
      ctx.moveTo(midX, midY);
      ctx.arc(midX, midY, radius - 2, startAngle, endAngle);
      ctx.closePath();
      ctx.fill();

      // Session border
      ctx.strokeStyle = `rgba(${r},${g},${b},${isActive ? 0.6 : 0.2})`;
      ctx.lineWidth = isActive ? 2.5 : 1;
      ctx.beginPath();
      ctx.arc(midX, midY, radius - 2, startAngle, endAngle);
      ctx.stroke();

      // Session label
      const midAngle = (startAngle + endAngle) / 2;
      const labelR = radius * 0.65;
      const lx = midX + Math.cos(midAngle) * labelR;
      const ly = midY + Math.sin(midAngle) * labelR;
      ctx.font = `${isActive ? 'bold ' : ''}${isActive ? 10 : 8}px system-ui`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = isActive ? s.color : `rgba(${r},${g},${b},0.5)`;
      ctx.fillText(s.name, lx, ly);
    });

    // Hour markers
    for (let i = 0; i < 24; i++) {
      const angle = hourToAngle(i);
      const inner = radius - 10;
      const outer = radius + 2;
      ctx.strokeStyle = i % 6 === 0 ? 'rgba(148,163,184,0.5)' : 'rgba(148,163,184,0.15)';
      ctx.lineWidth = i % 6 === 0 ? 1.5 : 0.5;
      ctx.beginPath();
      ctx.moveTo(midX + Math.cos(angle) * inner, midY + Math.sin(angle) * inner);
      ctx.lineTo(midX + Math.cos(angle) * outer, midY + Math.sin(angle) * outer);
      ctx.stroke();
      if (i % 6 === 0) {
        ctx.font = '9px system-ui';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText(`${i}:00`, midX + Math.cos(angle) * (radius + 14), midY + Math.sin(angle) * (radius + 14));
      }
    }

    // Rotating hand
    const handAngle = hourToAngle(currentPhase * 24);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(midX, midY);
    ctx.lineTo(midX + Math.cos(handAngle) * (radius * 0.5), midY + Math.sin(handAngle) * (radius * 0.5));
    ctx.stroke();
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(midX, midY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Bottom label
    const labels = ['Asian Session — Accumulation', 'London Session — Manipulation', 'New York Session — Distribution'];
    const colors = ['#a855f7', '#3b82f6', '#22c55e'];
    ctx.font = 'bold 12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = colors[activeSession];
    ctx.fillText(labels[activeSession], midX, h - 12);
  }, []);
  return <AnimScene drawFn={draw} height={320} />;
}

// ============================================================
// VOLUME PROFILE ANIMATION — session volume bars
// ============================================================
function VolumeProfileAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);
    const pad = 40;
    const barH = h - pad * 2;
    const barW = (w - pad * 2 - 30) / 3;
    const gap = 15;
    const progress = Math.min(1, (f % 180) / 120);

    const sessions = [
      { name: 'Asian', vol: 0.25, color: '#a855f7', desc: 'Low volume\nAccumulation' },
      { name: 'London', vol: 0.85, color: '#3b82f6', desc: 'High volume\nManipulation' },
      { name: 'New York', vol: 1.0, color: '#22c55e', desc: 'Highest volume\nDistribution' },
    ];

    sessions.forEach((s, i) => {
      const x = pad + i * (barW + gap);
      const actualH = barH * s.vol * progress;
      const y = pad + barH - actualH;

      // Bar
      const r = parseInt(s.color.slice(1, 3), 16);
      const g = parseInt(s.color.slice(3, 5), 16);
      const b = parseInt(s.color.slice(5, 7), 16);
      ctx.fillStyle = `rgba(${r},${g},${b},0.15)`;
      ctx.fillRect(x, y, barW, actualH);
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, barW, actualH);

      // Label
      ctx.font = 'bold 11px system-ui';
      ctx.textAlign = 'center';
      ctx.fillStyle = s.color;
      ctx.fillText(s.name, x + barW / 2, pad + barH + 16);

      // Volume percentage
      if (progress > 0.5) {
        ctx.font = 'bold 14px system-ui';
        ctx.fillStyle = '#fff';
        ctx.fillText(`${Math.round(s.vol * 100)}%`, x + barW / 2, y - 8);
        ctx.font = '9px system-ui';
        ctx.fillStyle = '#94a3b8';
        const lines = s.desc.split('\n');
        lines.forEach((line, li) => {
          ctx.fillText(line, x + barW / 2, y - 22 - (lines.length - 1 - li) * 12);
        });
      }
    });

    // Title
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('RELATIVE SESSION VOLUME', w / 2, 18);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// OVERLAP ANIMATION — London/NY overlap = peak
// ============================================================
function OverlapAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);
    const pad = 30;
    const barY = h * 0.35;
    const barH = 35;
    const timeW = w - pad * 2;
    const pulse = Math.sin(f * 0.06) * 0.04;

    // Time axis
    ctx.strokeStyle = 'rgba(148,163,184,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, barY + barH + 25);
    ctx.lineTo(pad + timeW, barY + barH + 25);
    ctx.stroke();

    // Hour labels (UTC)
    for (let hr = 0; hr <= 24; hr += 3) {
      const x = pad + (hr / 24) * timeW;
      ctx.fillStyle = '#64748b';
      ctx.font = '8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`${hr}:00`, x, barY + barH + 38);
      ctx.strokeStyle = 'rgba(148,163,184,0.1)';
      ctx.beginPath();
      ctx.moveTo(x, barY - 5);
      ctx.lineTo(x, barY + barH + 20);
      ctx.stroke();
    }

    // Session bars
    const bars = [
      { name: 'Asian', start: 0, end: 8, y: barY - 45, color: '#a855f7' },
      { name: 'London', start: 7, end: 16, y: barY, color: '#3b82f6' },
      { name: 'New York', start: 13, end: 22, y: barY + 45, color: '#22c55e' },
    ];

    bars.forEach(b => {
      const x1 = pad + (b.start / 24) * timeW;
      const x2 = pad + (b.end / 24) * timeW;
      const r = parseInt(b.color.slice(1, 3), 16);
      const g = parseInt(b.color.slice(3, 5), 16);
      const bl = parseInt(b.color.slice(5, 7), 16);
      ctx.fillStyle = `rgba(${r},${g},${bl},0.12)`;
      ctx.fillRect(x1, b.y, x2 - x1, barH);
      ctx.strokeStyle = b.color;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x1, b.y, x2 - x1, barH);
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillStyle = b.color;
      ctx.fillText(b.name, (x1 + x2) / 2, b.y + barH / 2 + 4);
    });

    // Overlap zone highlight (London 13:00-16:00 overlaps with NY)
    const overlapStart = pad + (13 / 24) * timeW;
    const overlapEnd = pad + (16 / 24) * timeW;
    ctx.fillStyle = `rgba(245,158,11,${0.1 + pulse})`;
    ctx.fillRect(overlapStart, barY - 55, overlapEnd - overlapStart, barH * 3 + 65);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
    ctx.strokeRect(overlapStart, barY - 55, overlapEnd - overlapStart, barH * 3 + 65);
    ctx.setLineDash([]);

    // Overlap label
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('OVERLAP ZONE', (overlapStart + overlapEnd) / 2, barY - 60);
    ctx.font = '9px system-ui';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('13:00-16:00 UTC — Peak volatility', (overlapStart + overlapEnd) / 2, h - 10);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// SESSION CHART — price data with session highlighting
// ============================================================
function SessionChart({ prices, sessions, highlightSession }: {
  prices: number[];
  sessions: { start: number; end: number; color: string; label: string }[];
  highlightSession?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
    const W = rect.width;
    const H = rect.height;
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, W, H);
    const pad = 30;
    const chartW = W - pad * 2;
    const chartH = H - pad * 2;
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    const rangeP = maxP - minP || 1;
    const toX = (i: number) => pad + (i / (prices.length - 1)) * chartW;
    const toY = (p: number) => pad + (1 - (p - minP) / rangeP) * chartH;

    // Session zones
    sessions.forEach((s, i) => {
      const x1 = toX(s.start);
      const x2 = toX(s.end);
      const r = parseInt(s.color.slice(1, 3), 16);
      const g = parseInt(s.color.slice(3, 5), 16);
      const b = parseInt(s.color.slice(5, 7), 16);
      const isHl = highlightSession === i;
      ctx.fillStyle = `rgba(${r},${g},${b},${isHl ? 0.1 : 0.04})`;
      ctx.fillRect(x1, pad, x2 - x1, chartH);
      ctx.strokeStyle = `rgba(${r},${g},${b},${isHl ? 0.4 : 0.15})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(x1, pad); ctx.lineTo(x1, pad + chartH);
      ctx.moveTo(x2, pad); ctx.lineTo(x2, pad + chartH);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = `${isHl ? 'bold ' : ''}9px system-ui`;
      ctx.textAlign = 'center';
      ctx.fillStyle = s.color;
      ctx.fillText(s.label, (x1 + x2) / 2, pad - 6);
    });

    // Price line
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    prices.forEach((p, i) => { const x = toX(i); const y = toY(p); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
    ctx.stroke();
  }, [prices, sessions, highlightSession]);
  return <canvas ref={canvasRef} style={{ width: '100%', height: 250 }} className="rounded-2xl" />;
}

// ============================================================
// DATA GENERATORS
// ============================================================
function genSessionData(seed: number, type: 'asian_range' | 'london_manipulation' | 'ny_distribution' | 'overlap_volatility' | 'dead_zone'): {
  prices: number[];
  sessions: { start: number; end: number; color: string; label: string }[];
  highlightSession?: number;
} {
  const rand = seededRandom(seed);
  const prices: number[] = [];
  let p = 100;
  const totalBars = 72; // 3 candles per hour * 24 hours

  if (type === 'asian_range') {
    // Tight range during Asian, then London breakout
    for (let i = 0; i < 24; i++) { p += (rand() - 0.5) * 0.5; prices.push(p); } // Asian: tight
    for (let i = 0; i < 27; i++) { p += 0.6 + (rand() - 0.5) * 0.8; prices.push(p); } // London: breakout
    for (let i = 0; i < 21; i++) { p += 0.2 + (rand() - 0.5) * 0.7; prices.push(p); } // NY: continuation
    return { prices, sessions: [
      { start: 0, end: 24, color: '#a855f7', label: 'Asian' },
      { start: 21, end: 48, color: '#3b82f6', label: 'London' },
      { start: 39, end: 66, color: '#22c55e', label: 'New York' },
    ], highlightSession: 0 };
  }
  if (type === 'london_manipulation') {
    // Asian range → London sweeps low then reverses UP
    for (let i = 0; i < 24; i++) { p += (rand() - 0.5) * 0.4; prices.push(p); }
    const asianLow = Math.min(...prices);
    // London: sweep below Asian low then reversal
    for (let i = 0; i < 6; i++) { p += -0.5 + (rand() - 0.5) * 0.3; prices.push(p); } // sweep
    for (let i = 0; i < 21; i++) { p += 0.7 + (rand() - 0.5) * 0.6; prices.push(p); } // reversal
    for (let i = 0; i < 21; i++) { p += 0.15 + (rand() - 0.5) * 0.5; prices.push(p); } // NY
    return { prices, sessions: [
      { start: 0, end: 24, color: '#a855f7', label: 'Asian' },
      { start: 21, end: 48, color: '#3b82f6', label: 'London' },
      { start: 39, end: 66, color: '#22c55e', label: 'New York' },
    ], highlightSession: 1 };
  }
  if (type === 'ny_distribution') {
    // Asian range → London trend → NY reversal/distribution
    for (let i = 0; i < 24; i++) { p += (rand() - 0.5) * 0.4; prices.push(p); }
    for (let i = 0; i < 27; i++) { p += 0.5 + (rand() - 0.5) * 0.6; prices.push(p); }
    // NY: topping out then reversing
    for (let i = 0; i < 8; i++) { p += 0.1 + (rand() - 0.5) * 0.4; prices.push(p); }
    for (let i = 0; i < 13; i++) { p += -0.6 + (rand() - 0.5) * 0.5; prices.push(p); }
    return { prices, sessions: [
      { start: 0, end: 24, color: '#a855f7', label: 'Asian' },
      { start: 21, end: 48, color: '#3b82f6', label: 'London' },
      { start: 39, end: 66, color: '#22c55e', label: 'New York' },
    ], highlightSession: 2 };
  }
  if (type === 'overlap_volatility') {
    // Calm → London move → OVERLAP = explosion of volatility
    for (let i = 0; i < 24; i++) { p += (rand() - 0.5) * 0.3; prices.push(p); }
    for (let i = 0; i < 18; i++) { p += 0.3 + (rand() - 0.5) * 0.5; prices.push(p); }
    // Overlap zone: massive range expansion
    for (let i = 0; i < 9; i++) { p += 1.0 + (rand() - 0.5) * 1.2; prices.push(p); }
    for (let i = 0; i < 21; i++) { p += -0.2 + (rand() - 0.5) * 0.6; prices.push(p); }
    return { prices, sessions: [
      { start: 0, end: 24, color: '#a855f7', label: 'Asian' },
      { start: 21, end: 48, color: '#3b82f6', label: 'London' },
      { start: 39, end: 66, color: '#22c55e', label: 'New York' },
    ], highlightSession: 1 }; // overlap is within London+NY
  }
  // dead_zone — post-NY, no volume, choppy noise
  for (let i = 0; i < 24; i++) { p += (rand() - 0.5) * 0.4; prices.push(p); }
  for (let i = 0; i < 27; i++) { p += 0.4 + (rand() - 0.5) * 0.6; prices.push(p); }
  for (let i = 0; i < 21; i++) { p += (rand() - 0.5) * 0.25; prices.push(p); } // dead zone: flat noise
  return { prices, sessions: [
    { start: 0, end: 24, color: '#a855f7', label: 'Asian' },
    { start: 21, end: 48, color: '#3b82f6', label: 'London' },
    { start: 39, end: 66, color: '#22c55e', label: 'New York' },
  ] };
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function KillZonesLesson() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Interactive chart
  const [activeSession, setActiveSession] = useState<number | undefined>(undefined);
  const demoData = useMemo(() => genSessionData(42, 'london_manipulation'), []);

  // Accordions
  const [expandedSession, setExpandedSession] = useState<number | null>(null);
  const [expandedKZ, setExpandedKZ] = useState<number | null>(null);
  const [expandedMistake, setExpandedMistake] = useState<number | null>(null);
  const [expandedCombo, setExpandedCombo] = useState<number | null>(null);

  // Game
  const [gameRound, setGameRound] = useState(0);
  const [gameAnswer, setGameAnswer] = useState<number | null>(null);
  const [gameScore, setGameScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  const gameScenarios = useMemo(() => [
    { seed: 111, type: 'asian_range' as const, correct: 1, label: 'Asian Session',
      q: 'Price is ranging in a tight channel during the Asian session. What should you expect next?',
      opts: ['This range will continue all day', 'London open will likely break this range — prepare for a directional move', 'Buy immediately at the top of the range', 'The range means there is no opportunity today'],
      explain: 'Asian session ranges are the SETUP for London moves. Smart money accumulates orders during this quiet period, building up liquidity above and below the range. When London opens, one side gets swept — creating the directional move for the day. Mark the Asian high and low on your chart every single day.' },
    { seed: 222, type: 'london_manipulation' as const, correct: 2, label: 'London Manipulation',
      q: 'London opened and price immediately swept the Asian session low before reversing sharply upward. What just happened?',
      opts: ['A random spike — ignore it', 'The trend is bearish — sell the bounce', 'London manipulation — the Asian low was swept for liquidity. Look for longs.', 'Wait for New York to confirm'],
      explain: 'This is textbook London manipulation. Institutions swept the sell-side liquidity (stop losses) below the Asian low. Those stop losses became their entry. The sharp reversal confirms the sweep was intentional. This is the highest-probability setup of the day — long entry after the Asian low sweep.' },
    { seed: 333, type: 'ny_distribution' as const, correct: 0, label: 'New York Distribution',
      q: 'London established a strong uptrend. New York opened and price made a new high but momentum is fading. Volume is declining. What is this?',
      opts: ['Distribution — smart money is selling into the rally. Be cautious with new longs.', 'Confirmation of the trend — add to your long position', 'Nothing — price always pauses', 'A signal to short immediately'],
      explain: 'This is New York distribution. Smart money uses the remaining retail buying pressure to offload their long positions at premium prices. Fading momentum + declining volume + new highs = distribution. It does not mean short immediately, but it means stop adding longs and tighten stops on existing positions.' },
    { seed: 444, type: 'overlap_volatility' as const, correct: 1, label: 'London-NY Overlap',
      q: 'Price has been moving during London. The New York session just opened (13:00 UTC). What happens in the overlap zone?',
      opts: ['Volume drops — two sessions cancel each other out', 'Volatility increases significantly — this is peak volume for the day', 'Price reverses against London direction', 'Nothing changes — it is just another hour'],
      explain: 'The London-New York overlap (13:00-16:00 UTC) is the MOST volatile and highest-volume period of the entire 24-hour cycle. Two major financial centres are active simultaneously. If London established a trend, the overlap often produces the strongest continuation move. If London was manipulating, the overlap can produce the reversal.' },
    { seed: 555, type: 'dead_zone' as const, correct: 3, label: 'Dead Zone',
      q: 'It is 22:00 UTC. New York has closed. Price is barely moving. Should you be trading?',
      opts: ['Yes — low volume means easy trades', 'Yes — set up for the Asian open', 'Yes — any time is a good time', 'No — this is the dead zone. Spreads widen, liquidity disappears, and moves are unreliable.'],
      explain: 'The dead zone (roughly 21:00-00:00 UTC) sits between New York close and Asian open. Volume is at its lowest, spreads widen, and any price movement is unreliable noise. Professional traders step away during this period. Trading here is like fishing in an empty pond — you are wasting bait.' },
  ], []);

  const currentGame = gameScenarios[gameRound];
  const currentGameData = useMemo(() => genSessionData(currentGame.seed, currentGame.type), [currentGame.seed, currentGame.type]);

  // Quiz
  const quizQuestions = useMemo(() => [
    { q: 'What are the three major trading sessions?', opts: ['European, American, Australian', 'Asian, London, New York', 'Tokyo, Frankfurt, Chicago', 'Morning, Afternoon, Evening'], a: 1, explain: 'The three major sessions are Asian (Tokyo), London, and New York. Together they cover the full 24-hour trading cycle, each with a distinct role in how institutional money flows through the market.' },
    { q: 'What is the typical role of the Asian session?', opts: ['Distribution — selling at the top', 'Trend continuation from the previous day', 'Accumulation — building the range that gets broken later', 'The most volatile session of the day'], a: 2, explain: 'The Asian session is the accumulation phase. Price typically ranges, building up orders (liquidity) above and below. These levels become targets for London to sweep when it opens.' },
    { q: 'What is "London manipulation"?', opts: ['When London traders cheat', 'Sweeping Asian session highs or lows to grab liquidity before the real move', 'Random price spikes at London open', 'A conspiracy theory'], a: 1, explain: 'London manipulation is when smart money sweeps the Asian session high or low — triggering stop losses and breakout entries — before reversing in the real direction for the day. It is the most powerful repeating pattern in intraday trading.' },
    { q: 'When is the London-New York overlap?', opts: ['00:00-03:00 UTC', '07:00-08:00 UTC', '13:00-16:00 UTC', '20:00-22:00 UTC'], a: 2, explain: 'The overlap runs from approximately 13:00-16:00 UTC (1pm-4pm UTC). This is when both London and New York are active simultaneously — producing the highest volume and volatility of the entire day.' },
    { q: 'What is the "dead zone"?', opts: ['When your internet connection drops', 'The period between NY close and Asian open — low volume, unreliable moves', 'The first hour of London', 'After a big news event'], a: 1, explain: 'The dead zone sits between New York close (~21:00 UTC) and Asian open (~00:00 UTC). Volume dries up, spreads widen, and any price action is unreliable noise. Professional traders avoid this window.' },
    { q: 'Why should you mark the Asian session high and low every day?', opts: ['To make your chart look professional', 'Because they are the liquidity targets that London will sweep', 'To calculate your profit target', 'Because Asian moves always continue'], a: 1, explain: 'Asian highs and lows are where retail traders place their stop losses and breakout entries. This creates pools of liquidity that London smart money targets. Marking these levels each day gives you a roadmap for the London manipulation.' },
    { q: 'Which session typically produces the highest-probability reversal setups?', opts: ['Asian session', 'London open (after sweeping Asian liquidity)', 'Late New York', 'The dead zone'], a: 1, explain: 'London open produces the highest-probability reversal setups because the manipulation (sweeping Asian liquidity) creates a clear "trap then reverse" pattern. After the sweep, the real directional move begins — this is where most professional intraday traders focus.' },
    { q: 'If London established a bullish trend, what does the NY overlap usually do?', opts: ['Reverses the trend', 'Produces the strongest continuation move of the day', 'Creates a range', 'Has no relationship to London'], a: 1, explain: 'When London has established a clear trend, the NY overlap typically produces the strongest continuation move. The combined volume of both sessions fuels the move with maximum momentum. This is why many traders take their best entries during London and hold through the overlap.' },
  ], []);

  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(quizQuestions.map(() => null));
  const quizDone = quizAnswers.every(a => a !== null);
  const quizCorrect = quizAnswers.filter((a, i) => a === quizQuestions[i].a).length;
  const score = Math.round((quizCorrect / quizQuestions.length) * 100);
  const certUnlocked = quizDone && score >= 66;

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-900/50"><motion.div className="h-full bg-gradient-to-r from-amber-500 to-accent-500" style={{ width: `${Math.min((scrollY / (typeof document !== 'undefined' ? document.body.scrollHeight - window.innerHeight : 1)) * 100, 100)}%` }} /></div>
      <nav className="sticky top-0 z-40 px-5 py-3 flex items-center justify-between" style={{ background: 'rgba(6,10,18,0.85)', backdropFilter: 'blur(16px)' }}>
        <Link href="/academy" className="text-xs text-gray-500 hover:text-gray-300 transition">&larr; Academy</Link>
        <div className="flex items-center gap-2"><Crown className="w-3.5 h-3.5 text-amber-400" /><span className="text-xs font-bold text-amber-400">PRO &middot; LEVEL 3</span></div>
      </nav>

      <section className="px-5 pt-16 pb-12 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 3 &middot; Lesson 10</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight"><span className="bg-gradient-to-r from-purple-400 via-blue-400 to-green-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Kill Zones</span></h1>
          <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">When you trade matters as much as what you trade. Master the three sessions and never fight the clock again.</p>
        </motion.div>
      </section>

      {/* SECTION 00 — WHY THIS MATTERS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-lg font-bold text-white mb-3">&#128337; You wouldn&apos;t go fishing at midnight. So why are you trading at the wrong time?</p>
            <p className="text-gray-400 leading-relaxed mb-4">Fish feed at dawn and dusk &mdash; not at 3am. If you show up at the wrong time, it doesn&apos;t matter how good your rod is or how perfect your bait is. You&apos;ll catch nothing.</p>
            <p className="text-gray-400 leading-relaxed mb-4">Markets work the same way. There are <strong className="text-amber-400">specific hours</strong> when institutions are active, volume is high, and moves are real. And there are hours when the market is a ghost town &mdash; spreads widen, volume vanishes, and any move you see is a trap.</p>
            <p className="text-gray-400 leading-relaxed">These high-activity windows are called <strong className="text-white">Kill Zones</strong>. They&apos;re the times when smart money hunts for liquidity, executes their orders, and creates the moves that define the entire day. <strong className="text-amber-400">If you only trade during Kill Zones, you eliminate 80% of losing trades</strong> &mdash; because most losses happen when you trade outside them.</p>
          </div>
          <SessionClockAnimation />
          <div className="mt-6 p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128337; REAL SCENARIO</p>
            <p className="text-sm text-gray-300 leading-relaxed">EUR/USD ranges between 1.0880&ndash;1.0895 during the Asian session. At 07:05 UTC (London open), price spikes below to 1.0872 &mdash; sweeping the Asian low. Within 15 minutes it reverses, breaking back above the range. By the London&ndash;NY overlap (14:00 UTC), EUR/USD reaches 1.0945 &mdash; a 73-pip move from the sweep. <em className="text-amber-400">The clock told you WHEN. The sweep told you WHERE. The combination gave you a 1:6 R:R trade.</em></p>
          </div>
        </motion.div>
      </section>

      {/* SECTION 01 — THE THREE SESSIONS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Three Sessions</p>
          <h2 className="text-2xl font-extrabold mb-4">Asian, London, New York</h2>
          <p className="text-sm text-gray-400 mb-6">Every 24-hour cycle follows the same rhythm. Tap each session to understand its personality.</p>
        </motion.div>
        {[
          { name: 'Asian Session (Tokyo)', time: '00:00 &ndash; 08:00 UTC', role: 'ACCUMULATION', color: '#a855f7', emoji: '&#127752;',
            body: 'The quiet phase. Price ranges. Volume is low. Smart money is building their position &mdash; accumulating orders in both directions. Think of it as the calm before the storm.',
            analogy: 'A fisherman setting nets at dawn. Nothing is happening yet, but the nets are being placed. The Asian high and low ARE the nets &mdash; they define where the fish (liquidity) will be caught later.',
            keyRules: 'Mark the Asian high and low every day. Do NOT trade breakouts during Asian &mdash; they are traps 80% of the time. Wait for London.' },
          { name: 'London Session', time: '07:00 &ndash; 16:00 UTC', role: 'MANIPULATION', color: '#3b82f6', emoji: '&#9889;',
            body: 'The trigger. London open is when smart money reveals its hand. The first move is often a FAKE &mdash; sweeping the Asian high or low to grab liquidity. Then the real directional move begins. London produces the highest-probability setups of the day.',
            analogy: 'A poker player who raises pre-flop to force weaker hands out. The first move (the sweep) is the raise. The second move (the reversal) is the actual hand being played. Retail traders fold at the sweep. Smart money collects.',
            keyRules: 'Watch the first 30 minutes of London carefully. If Asian H/L gets swept, prepare for the real move in the opposite direction. This is the #1 intraday setup.' },
          { name: 'New York Session', time: '13:00 &ndash; 22:00 UTC', role: 'DISTRIBUTION', color: '#22c55e', emoji: '&#127919;',
            body: 'The finale. New York either continues the London trend (especially during the overlap at 13:00&ndash;16:00) or begins distributing &mdash; smart money taking profits. Late New York (after 18:00 UTC) often reverses or chops.',
            analogy: 'A concert&apos;s encore. The main act (London) is over. The encore (NY overlap) can be the most energetic part. But after the encore, people start leaving. Late NY = the crowd thinning out.',
            keyRules: 'The London-NY overlap (13:00-16:00 UTC) is the best continuation window. After 18:00 UTC, start reducing exposure. After 20:00, stop opening new trades.' },
        ].map((item, i) => (
          <div key={i} className="mb-2">
            <button onClick={() => setExpandedSession(expandedSession === i ? null : i)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg" dangerouslySetInnerHTML={{ __html: item.emoji }} />
                <div>
                  <span className="text-sm font-bold" style={{ color: item.color }}>{item.name}</span>
                  <span className="text-xs text-gray-500 ml-2" dangerouslySetInnerHTML={{ __html: item.time }} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded" style={{ color: item.color, backgroundColor: item.color + '15' }}>{item.role}</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedSession === i ? 'rotate-180' : ''}`} />
              </div>
            </button>
            <AnimatePresence>
              {expandedSession === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="p-5 mx-2 mb-2 rounded-xl bg-[#0a1020] border border-white/5 space-y-4">
                    <p className="text-gray-300 text-sm leading-relaxed">{item.body}</p>
                    <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10"><p className="text-amber-400 text-xs font-bold mb-1">&#128161; Analogy</p><p className="text-gray-400 text-sm">{item.analogy}</p></div>
                    <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5"><p className="text-white text-xs font-bold mb-1">Key Rules</p><p className="text-gray-400 text-sm">{item.keyRules}</p></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </section>

      {/* SECTION 02 — VOLUME PROFILE */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; Session Volume</p>
          <h2 className="text-2xl font-extrabold mb-4">Not All Hours Are Equal</h2>
          <p className="text-sm text-gray-400 mb-6">Volume determines whether price moves are real or fake. Look at the difference between sessions:</p>
          <VolumeProfileAnimation />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
            <p className="text-sm text-gray-400 leading-relaxed">&#128161; <strong className="text-amber-400">The pattern is clear:</strong> Asian has 25% of peak volume (quiet), London has 85% (the engine), and the London&ndash;NY overlap hits 100% (full throttle). A breakout on 25% volume is suspicious. A breakout on 100% volume is real. <strong className="text-white">Volume validates moves. Sessions determine volume.</strong></p>
          </div>
        </motion.div>
      </section>

      {/* SECTION 03 — THE OVERLAP */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The Overlap Zone</p>
          <h2 className="text-2xl font-extrabold mb-4">London&ndash;New York Overlap: Peak Power</h2>
          <p className="text-sm text-gray-400 mb-6">When two major sessions trade simultaneously, the combined volume creates the most powerful moves of the day.</p>
          <OverlapAnimation />
          <div className="space-y-3 mt-6">
            <div className="p-4 rounded-xl border-l-4 border-amber-500 bg-amber-500/5">
              <p className="text-amber-400 font-bold text-sm">13:00 &ndash; 16:00 UTC</p>
              <p className="text-gray-400 text-sm mt-1">Both London and New York banks are active. Forex volume peaks. If London established a trend, the overlap accelerates it. If London was manipulating, the overlap can produce the real reversal. Either way &mdash; the biggest moves happen here.</p>
            </div>
            <div className="p-4 rounded-xl border-l-4 border-blue-500 bg-blue-500/5">
              <p className="text-blue-400 font-bold text-sm">Why It Matters for You</p>
              <p className="text-gray-400 text-sm mt-1">If you can only trade one window per day, make it the overlap. Entries taken during London that are held through the overlap often produce the day&apos;s entire range. It is the institutional &quot;power hour&quot; &mdash; multiplied by three.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 04 — KILL ZONE TIMES */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Kill Zone Times</p>
          <h2 className="text-2xl font-extrabold mb-4">The Specific Windows That Matter</h2>
          <p className="text-sm text-gray-400 mb-6">Kill Zones are narrower than full sessions. These are the exact windows when institutional order flow peaks:</p>
        </motion.div>
        {[
          { name: 'Asian Kill Zone', time: '00:00 &ndash; 03:00 UTC', color: '#a855f7', desc: 'The range-setting window. Mark the high and low formed during these 3 hours &mdash; they become London&apos;s targets. Do not trade breakouts here.', strength: '&#9733;&#9733;' },
          { name: 'London Kill Zone', time: '07:00 &ndash; 10:00 UTC', color: '#3b82f6', desc: 'The manipulation and directional window. The first 1&ndash;2 hours often contain the sweep + reversal setup. This is the #1 intraday trading window globally.', strength: '&#9733;&#9733;&#9733;&#9733;&#9733;' },
          { name: 'NY Kill Zone', time: '13:00 &ndash; 16:00 UTC', color: '#22c55e', desc: 'The overlap and continuation window. Highest volume of the day. Trend trades from London get their strongest push here.', strength: '&#9733;&#9733;&#9733;&#9733;' },
          { name: 'Late NY', time: '16:00 &ndash; 20:00 UTC', color: '#64748b', desc: 'Decreasing volume. Distribution phase. Tighten stops, take profits, reduce new entries. Moves become less reliable.', strength: '&#9733;&#9733;' },
          { name: 'Dead Zone', time: '21:00 &ndash; 00:00 UTC', color: '#ef4444', desc: 'No major session active. Spreads widen. Liquidity disappears. DO NOT TRADE. This is when 90% of random stop-outs happen.', strength: '&#9940;' },
        ].map((item, i) => (
          <div key={i} className="mb-2">
            <button onClick={() => setExpandedKZ(expandedKZ === i ? null : i)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold" style={{ color: item.color }}>{item.name}</span>
                <span className="text-xs text-gray-500" dangerouslySetInnerHTML={{ __html: item.time }} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs" dangerouslySetInnerHTML={{ __html: item.strength }} />
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedKZ === i ? 'rotate-180' : ''}`} />
              </div>
            </button>
            <AnimatePresence>
              {expandedKZ === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="p-5 mx-2 mb-2 rounded-xl bg-[#0a1020] border border-white/5">
                    <p className="text-gray-300 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </section>

      {/* SECTION 05 — INTERACTIVE CHART */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Interactive Session Chart</p>
          <h2 className="text-2xl font-extrabold mb-2">See Sessions in Action</h2>
          <p className="text-sm text-gray-400 mb-4">Highlight each session to see how price behaves differently depending on who&apos;s active. This chart shows a typical London manipulation day.</p>
        </motion.div>
        <div className="flex flex-wrap gap-2 mb-4">
          {['Asian', 'London', 'New York'].map((name, i) => {
            const colors = ['#a855f7', '#3b82f6', '#22c55e'];
            const isActive = activeSession === i;
            return <button key={i} onClick={() => setActiveSession(isActive ? undefined : i)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${isActive ? `border text-white` : 'glass text-gray-500'}`} style={isActive ? { borderColor: colors[i] + '50', backgroundColor: colors[i] + '15', color: colors[i] } : {}}>{name}</button>;
          })}
        </div>
        <SessionChart prices={demoData.prices} sessions={demoData.sessions} highlightSession={activeSession} />
        <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
          <p className="text-sm text-gray-400 leading-relaxed">&#128161; <strong className="text-amber-400">Notice the pattern:</strong> Asian ranges tightly. London opens with a sweep below the range (manipulation), then reverses strongly upward. New York continues the move. This is the most common intraday template &mdash; and it repeats day after day across every liquid pair.</p>
        </div>
      </section>

      {/* SECTION 06 — SESSION + SMC COMBOS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Sessions + SMC</p>
          <h2 className="text-2xl font-extrabold mb-4">Combining Kill Zones with Everything You&apos;ve Learned</h2>
          <p className="text-sm text-gray-400 mb-6">Kill Zones become even more powerful when combined with SMC concepts from earlier lessons:</p>
        </motion.div>
        {[
          { title: 'Kill Zone + Liquidity Sweep (3.3 + 3.4)', color: '#ef4444', body: 'Mark Asian H/L. London sweeps one of them = liquidity collected. Enter in the opposite direction after BOS confirmation. This is the bread-and-butter intraday setup.', grade: 'A+' },
          { title: 'Kill Zone + OTE (3.8)', color: '#f59e0b', body: 'London creates an impulse. Price retraces to the OTE zone during the NY open. Enter at the OTE during the overlap window = maximum confluence of time + price.', grade: 'A+' },
          { title: 'Kill Zone + Order Block (3.5)', color: '#3b82f6', body: 'Identify OBs on the 1H/4H chart. Wait for price to reach the OB during a Kill Zone window. An OB mitigated during the dead zone is unreliable. An OB mitigated during London KZ is A-grade.', grade: 'A' },
          { title: 'Kill Zone + Breaker (3.9)', color: '#a855f7', body: 'Breaker blocks inside a Kill Zone window have significantly higher rejection rates than breakers tested during low-volume hours. Time validates the zone.', grade: 'A' },
        ].map((item, i) => (
          <div key={i} className="mb-2">
            <button onClick={() => setExpandedCombo(expandedCombo === i ? null : i)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between">
              <span className="text-sm font-semibold text-white">{item.title}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ color: item.color, backgroundColor: item.color + '15' }}>{item.grade}</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedCombo === i ? 'rotate-180' : ''}`} />
              </div>
            </button>
            <AnimatePresence>
              {expandedCombo === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="p-5 mx-2 mb-2 rounded-xl bg-[#0a1020] border border-white/5">
                    <p className="text-gray-300 text-sm leading-relaxed">{item.body}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </section>

      {/* SECTION 07 — TIMEZONE GUIDE */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Your Local Schedule</p>
          <h2 className="text-2xl font-extrabold mb-4">Kill Zones in Your Timezone</h2>
          <p className="text-sm text-gray-400 mb-6">All times above are UTC. Here&apos;s what they look like in common timezones:</p>
          <div className="overflow-x-auto">
            <div className="min-w-[500px] glass rounded-2xl overflow-hidden text-xs">
              {[
                { zone: '', asian: 'Asian KZ', london: 'London KZ', overlap: 'Overlap', dead: 'Dead Zone' },
                { zone: 'UTC', asian: '00:00-03:00', london: '07:00-10:00', overlap: '13:00-16:00', dead: '21:00-00:00' },
                { zone: 'London (GMT)', asian: '00:00-03:00', london: '07:00-10:00', overlap: '13:00-16:00', dead: '21:00-00:00' },
                { zone: 'New York (EST)', asian: '19:00-22:00*', london: '02:00-05:00', overlap: '08:00-11:00', dead: '16:00-19:00' },
                { zone: 'Dubai (GST)', asian: '04:00-07:00', london: '11:00-14:00', overlap: '17:00-20:00', dead: '01:00-04:00' },
                { zone: 'Sydney (AEST)', asian: '10:00-13:00', london: '17:00-20:00', overlap: '23:00-02:00', dead: '07:00-10:00' },
              ].map((row, i) => (
                <div key={i} className={`grid grid-cols-5 gap-0 ${i === 0 ? 'bg-amber-500/5 font-bold text-amber-400' : i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                  <div className="p-2.5 border-r border-white/5 text-gray-400 font-semibold">{row.zone}</div>
                  <div className="p-2.5 border-r border-white/5 text-purple-400">{row.asian}</div>
                  <div className="p-2.5 border-r border-white/5 text-blue-400">{row.london}</div>
                  <div className="p-2.5 border-r border-white/5 text-green-400">{row.overlap}</div>
                  <div className="p-2.5 text-red-400">{row.dead}</div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">* Previous day. Adjust for Daylight Saving Time where applicable.</p>
        </motion.div>
      </section>

      {/* SECTION 08 — COMMON MISTAKES */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-4">Kill Zone Mistakes</h2>
        </motion.div>
        {[
          { title: 'Trading the Asian Breakout', wrong: 'Buying when price breaks the Asian high during Asian hours.', right: 'Asian breakouts are false 80% of the time. Wait for London to decide direction.', tip: 'If it breaks in Asian, it will probably get swept in London.' },
          { title: 'Trading the Dead Zone', wrong: 'Opening trades between 21:00&ndash;00:00 UTC because the chart looks interesting.', right: 'Step away. No volume means no reliability. Spreads are at their widest.', tip: 'Set a phone alarm for when YOUR Kill Zone starts. Do not stare at dead markets.' },
          { title: 'Ignoring Session Context', wrong: 'Taking the same setup regardless of what time it is.', right: 'A bearish engulfing at 08:00 UTC (London KZ) is worth 10x more than the same candle at 22:00 UTC (dead zone).', tip: 'Add a session indicator to your chart (like ATLAS Sessions+) so you always know which window you are in.' },
          { title: 'Fighting London Direction After 10:00', wrong: 'Counter-trend trading after London has established direction.', right: 'After 10:00 UTC, the London trend is set. Trade WITH it through the overlap, not against it.', tip: 'London decides. You follow. NY amplifies.' },
        ].map((item, i) => (
          <div key={i} className="mb-2">
            <button onClick={() => setExpandedMistake(expandedMistake === i ? null : i)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between">
              <span className="text-white text-sm font-semibold">{item.title}</span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedMistake === i ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {expandedMistake === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="p-5 mx-2 mb-2 rounded-xl bg-[#0a1020] border border-white/5 space-y-3">
                    <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10"><p className="text-red-400 text-xs font-bold mb-1">&#10060; Wrong</p><p className="text-gray-400 text-sm" dangerouslySetInnerHTML={{ __html: item.wrong }} /></div>
                    <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10"><p className="text-green-400 text-xs font-bold mb-1">&#10003; Right</p><p className="text-gray-400 text-sm">{item.right}</p></div>
                    <p className="text-amber-400 text-sm">&#128161; {item.tip}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </section>

      {/* SECTION 09 — GAME */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Read the Session</p>
          <h2 className="text-2xl font-extrabold mb-2">Session Identification Game</h2>
          <p className="text-sm text-gray-400 mb-6">5 scenarios. Identify what is happening and what you should do based on the session.</p>
        </motion.div>
        {!gameComplete ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500">Round {gameRound + 1} of 5</span>
              <span className="text-xs text-amber-400 font-bold">{gameScore}/{gameRound + (gameAnswer !== null ? 1 : 0)} correct</span>
            </div>
            <p className="text-white font-semibold text-sm mb-3">{currentGame.label}</p>
            <SessionChart prices={currentGameData.prices} sessions={currentGameData.sessions} highlightSession={currentGameData.highlightSession} />
            <p className="text-gray-300 text-sm mt-4 mb-4">{currentGame.q}</p>
            <div className="space-y-2">
              {currentGame.opts.map((opt, oi) => {
                const answered = gameAnswer !== null;
                const isCorrect = oi === currentGame.correct;
                const isChosen = gameAnswer === oi;
                let cls = 'glass text-gray-300 hover:bg-white/5';
                if (answered) { if (isCorrect) cls = 'bg-green-500/15 border-green-500/30 text-green-400'; else if (isChosen) cls = 'bg-red-500/15 border-red-500/30 text-red-400'; else cls = 'glass text-gray-600'; }
                return (
                  <button key={oi} onClick={() => { if (!answered) { setGameAnswer(oi); if (oi === currentGame.correct) setGameScore(s => s + 1); } }} disabled={answered} className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${cls}`}>
                    {opt} {answered && isCorrect && '\u2713'} {answered && isChosen && !isCorrect && '\u2717'}
                  </button>
                );
              })}
            </div>
            {gameAnswer !== null && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15 text-sm text-gray-400 leading-relaxed mb-4"><span className="text-amber-400 font-bold">Explanation: </span>{currentGame.explain}</div>
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
            <p className="text-sm text-gray-400">{gameScore === 5 ? '&#128337; Perfect! You know exactly when to strike.' : gameScore >= 3 ? 'Solid session awareness.' : 'Review the three sessions and Kill Zone times.'}</p>
          </motion.div>
        )}
      </section>

      {/* SECTION 10 — QUIZ */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Knowledge Check</p>
          <h2 className="text-2xl font-extrabold mb-6">Kill Zones Quiz</h2>
        </motion.div>
        <div className="space-y-6">
          {quizQuestions.map((q, qi) => (
            <motion.div key={qi} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="p-5 rounded-2xl glass-card">
              <p className="text-sm font-bold text-white mb-3">{qi + 1}. {q.q}</p>
              <div className="space-y-2">
                {q.opts.map((opt, oi) => {
                  const answered = quizAnswers[qi] !== null;
                  const isCorrect = oi === q.a;
                  const isChosen = quizAnswers[qi] === oi;
                  let cls = 'glass text-gray-300 hover:bg-white/5';
                  if (answered) { if (isCorrect) cls = 'bg-green-500/15 border-green-500/30 text-green-400'; else if (isChosen) cls = 'bg-red-500/15 border-red-500/30 text-red-400'; else cls = 'glass text-gray-600'; }
                  return (<button key={oi} onClick={() => { if (!answered) { const na = [...quizAnswers]; na[qi] = oi; setQuizAnswers(na); } }} disabled={answered} className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${cls}`}>{opt} {answered && isCorrect && '\u2713'} {answered && isChosen && !isCorrect && '\u2717'}</button>);
                })}
              </div>
              {quizAnswers[qi] !== null && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 text-sm text-gray-400 leading-relaxed"><span className="text-amber-400 font-bold">&#10003;</span> {q.explain}</motion.div>)}
            </motion.div>
          ))}
        </div>
        {quizDone && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 text-center p-8 glass-card rounded-2xl"><p className={`text-5xl font-extrabold mb-2 ${score >= 66 ? 'text-amber-400' : 'text-red-400'}`}>{score}%</p><p className="text-sm text-gray-400">{score === 100 ? '&#128337; Perfect! You know when to strike and when to wait.' : score >= 66 ? 'Solid session mastery. Ready for Power of Three.' : 'Review the sessions and Kill Zone windows above.'}</p></motion.div>)}
      </section>

      {/* Certificate */}
      <section className="px-5 py-16 text-center">
        {!certUnlocked ? (
          <div className="max-w-md mx-auto p-8 glass rounded-2xl"><p className="text-4xl mb-3 opacity-30">&#128274;</p><p className="text-sm text-gray-500">Score 66%+ to unlock your <strong className="text-amber-400">Pro Certificate</strong></p></div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, type: 'spring' }}
            className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(168,85,247,0.06),transparent,rgba(34,197,94,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
            <div className="absolute inset-[1px] rounded-3xl border border-amber-500/10" />
            <div className="relative z-10">
              <div className="w-[80px] h-[80px] mx-auto mb-5 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-green-500 flex items-center justify-center text-4xl shadow-lg shadow-purple-500/20">&#128337;</div>
              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest mb-2">Pro Certificate</p>
              <h3 className="text-xl font-extrabold mb-1">Certificate of Mastery</h3>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">Has mastered<br /><strong className="text-white">Level 3.10: Kill Zones &mdash; When to Trade</strong><br />at ATLAS Academy by Interakktive</p>
              <p className="bg-gradient-to-r from-purple-400 via-blue-400 to-green-400 bg-clip-text text-transparent font-bold text-lg mb-1" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Session Sniper &mdash;</p>
              <p className="font-mono text-[11px] text-gray-500 mb-4">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L3.10-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
            </div>
          </motion.div>
        )}
      </section>

      <section className="text-center px-5 pt-10 pb-24">
        <p className="text-xs tracking-widest uppercase text-gray-600 mb-4">Up Next</p>
        <h2 className="text-xl font-bold mb-6">Lesson 3.11 &mdash; Power of Three</h2>
        <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">
          Continue <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
