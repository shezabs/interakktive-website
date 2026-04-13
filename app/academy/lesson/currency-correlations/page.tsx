// app/academy/lesson/currency-correlations/page.tsx
// ATLAS Academy — Lesson 8.8: Currency Correlations & the Dollar [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 8
// GROUNDBREAKING: Correlation Matrix Builder — interactive heatmap with risk warnings
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
// ANIMATION 1: Correlation Web — network graph of currency pairs
// ============================================================
function CorrelationWebAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.002; const cx = w / 2; const cy = h / 2 + 5;
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('The Correlation Web — Everything Connects Through USD', cx, 16);
    const R = Math.min(w * 0.33, h * 0.33);
    const pairs = [
      { name: 'EUR/USD', angle: 0, color: '#3b82f6' },
      { name: 'GBP/USD', angle: Math.PI / 3, color: '#8b5cf6' },
      { name: 'USD/JPY', angle: 2 * Math.PI / 3, color: '#ec4899' },
      { name: 'XAUUSD', angle: Math.PI, color: '#f59e0b' },
      { name: 'USD/CHF', angle: 4 * Math.PI / 3, color: '#26A69A' },
      { name: 'AUD/USD', angle: 5 * Math.PI / 3, color: '#EF5350' },
    ];
    const correlations = [
      { from: 0, to: 1, value: 0.88, label: '+0.88' },
      { from: 0, to: 4, value: -0.92, label: '−0.92' },
      { from: 0, to: 3, value: 0.65, label: '+0.65' },
      { from: 1, to: 5, value: 0.55, label: '+0.55' },
      { from: 2, to: 3, value: -0.72, label: '−0.72' },
      { from: 2, to: 4, value: 0.78, label: '+0.78' },
      { from: 0, to: 5, value: 0.62, label: '+0.62' },
    ];
    const activeCorr = Math.floor((t % 21) / 3) % 7;
    // DXY center
    ctx.beginPath(); ctx.arc(cx, cy, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b15'; ctx.fill();
    ctx.strokeStyle = '#f59e0b50'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = '#f59e0b'; ctx.font = 'bold 9px system-ui'; ctx.fillText('DXY', cx, cy + 3);
    // Connection lines
    correlations.forEach((corr, ci) => {
      const a = pairs[corr.from]; const b = pairs[corr.to];
      const ax = cx + Math.cos(a.angle - Math.PI / 2) * R; const ay = cy + Math.sin(a.angle - Math.PI / 2) * R;
      const bx = cx + Math.cos(b.angle - Math.PI / 2) * R; const by = cy + Math.sin(b.angle - Math.PI / 2) * R;
      const isActive = ci === activeCorr;
      const isPositive = corr.value > 0; const strength = Math.abs(corr.value);
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
      ctx.strokeStyle = isActive ? (isPositive ? '#26A69A80' : '#EF535080') : 'rgba(255,255,255,0.04)';
      ctx.lineWidth = isActive ? strength * 3 : 0.5; ctx.stroke();
      if (isActive) {
        const mx = (ax + bx) / 2; const my = (ay + by) / 2;
        ctx.fillStyle = isPositive ? '#26A69A' : '#EF5350'; ctx.font = 'bold 9px system-ui';
        ctx.fillText(corr.label, mx, my - 6);
        if (strength > 0.7) { ctx.fillStyle = '#EF535060'; ctx.font = 'bold 6px system-ui'; ctx.fillText(isPositive ? 'DOUBLED RISK' : 'NATURAL HEDGE', mx, my + 6); }
      }
    });
    // Pair nodes
    pairs.forEach((pair, i) => {
      const px = cx + Math.cos(pair.angle - Math.PI / 2) * R;
      const py = cy + Math.sin(pair.angle - Math.PI / 2) * R;
      const isInActiveCorr = correlations[activeCorr]?.from === i || correlations[activeCorr]?.to === i;
      // Spokes to center
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py);
      ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 0.5; ctx.stroke();
      // Node
      ctx.beginPath(); ctx.arc(px, py, isInActiveCorr ? 18 : 14, 0, Math.PI * 2);
      ctx.fillStyle = isInActiveCorr ? pair.color + '20' : pair.color + '08'; ctx.fill();
      ctx.strokeStyle = isInActiveCorr ? pair.color + '60' : pair.color + '20'; ctx.lineWidth = isInActiveCorr ? 1.5 : 0.5; ctx.stroke();
      ctx.fillStyle = isInActiveCorr ? pair.color : 'rgba(255,255,255,0.2)';
      ctx.font = `${isInActiveCorr ? 'bold 8' : '7'}px system-ui`; ctx.textAlign = 'center'; ctx.fillText(pair.name, px, py + 3);
    });
    ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.font = '7px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('Green lines = move together. Red lines = move opposite. Thickness = strength.', cx, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 2: DXY Domino Effect — USD moves, everything reacts
// ============================================================
function DXYDominoAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.003; const cx = w / 2;
    const isStrong = Math.floor(t / 10) % 2 === 0;
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
    ctx.fillText(isStrong ? 'DXY RISES — The Dollar Domino Effect' : 'DXY FALLS — The Reverse Cascade', cx, 16);
    const trigger = { label: isStrong ? 'USD ↑' : 'USD ↓', color: isStrong ? '#26A69A' : '#EF5350', x: cx, y: 50 };
    const dominoes = isStrong ? [
      { label: 'EUR/USD ↓', x: 0.15, y: 0.45, color: '#EF5350' },
      { label: 'GBP/USD ↓', x: 0.38, y: 0.45, color: '#EF5350' },
      { label: 'GOLD ↓', x: 0.62, y: 0.45, color: '#EF5350' },
      { label: 'USD/JPY ↑', x: 0.85, y: 0.45, color: '#26A69A' },
      { label: 'AUD/USD ↓', x: 0.15, y: 0.75, color: '#EF5350' },
      { label: 'USD/CHF ↑', x: 0.38, y: 0.75, color: '#26A69A' },
      { label: 'EM FX ↓', x: 0.62, y: 0.75, color: '#EF5350' },
      { label: 'Commodities ↓', x: 0.85, y: 0.75, color: '#EF5350' },
    ] : [
      { label: 'EUR/USD ↑', x: 0.15, y: 0.45, color: '#26A69A' },
      { label: 'GBP/USD ↑', x: 0.38, y: 0.45, color: '#26A69A' },
      { label: 'GOLD ↑', x: 0.62, y: 0.45, color: '#26A69A' },
      { label: 'USD/JPY ↓', x: 0.85, y: 0.45, color: '#EF5350' },
      { label: 'AUD/USD ↑', x: 0.15, y: 0.75, color: '#26A69A' },
      { label: 'USD/CHF ↓', x: 0.38, y: 0.75, color: '#EF5350' },
      { label: 'EM FX ↑', x: 0.62, y: 0.75, color: '#26A69A' },
      { label: 'Commodities ↑', x: 0.85, y: 0.75, color: '#26A69A' },
    ];
    const progress = Math.min(1, (t % 10) / 6); const visibleCount = Math.floor(progress * 9);
    // Trigger
    ctx.beginPath(); ctx.roundRect(cx - 35, 35, 70, 28, 8);
    ctx.fillStyle = trigger.color + '20'; ctx.fill();
    ctx.strokeStyle = trigger.color + '60'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = trigger.color; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center'; ctx.fillText(trigger.label, cx, 53);
    // Dominoes
    dominoes.forEach((dom, i) => {
      if (i >= visibleCount) return;
      const dx = dom.x * w; const dy = dom.y * h;
      // Line from trigger
      ctx.beginPath(); ctx.moveTo(cx, 63); ctx.lineTo(dx, dy - 14);
      ctx.strokeStyle = dom.color + '20'; ctx.lineWidth = 1; ctx.stroke();
      // Domino card
      const isCurrent = i === visibleCount - 1;
      const pulse = isCurrent ? Math.sin(t * 4) * 2 : 0;
      ctx.beginPath(); ctx.roundRect(dx - 38 - pulse, dy - 14 - pulse, 76 + pulse * 2, 24 + pulse * 2, 6);
      ctx.fillStyle = dom.color + '10'; ctx.fill();
      ctx.strokeStyle = dom.color + (isCurrent ? '60' : '30'); ctx.lineWidth = isCurrent ? 1.5 : 0.5; ctx.stroke();
      ctx.fillStyle = dom.color; ctx.font = `${isCurrent ? 'bold ' : ''}8px system-ui`;
      ctx.textAlign = 'center'; ctx.fillText(dom.label, dx, dy + 3);
    });
    ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.font = '7px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('The Dollar is the sun. Everything else orbits around it.', cx, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// CORRELATION MATRIX DATA
// ============================================================
const allPairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'NZD/USD', 'USD/CAD', 'XAUUSD', 'NASDAQ', 'US30'];
const corrMatrix: Record<string, Record<string, number>> = {
  'EUR/USD': { 'EUR/USD': 1.00, 'GBP/USD': 0.88, 'USD/JPY': -0.65, 'USD/CHF': -0.92, 'AUD/USD': 0.62, 'NZD/USD': 0.58, 'USD/CAD': -0.72, 'XAUUSD': 0.55, 'NASDAQ': 0.35, 'US30': 0.30 },
  'GBP/USD': { 'EUR/USD': 0.88, 'GBP/USD': 1.00, 'USD/JPY': -0.55, 'USD/CHF': -0.82, 'AUD/USD': 0.58, 'NZD/USD': 0.52, 'USD/CAD': -0.65, 'XAUUSD': 0.48, 'NASDAQ': 0.32, 'US30': 0.28 },
  'USD/JPY': { 'EUR/USD': -0.65, 'GBP/USD': -0.55, 'USD/JPY': 1.00, 'USD/CHF': 0.78, 'AUD/USD': -0.38, 'NZD/USD': -0.35, 'USD/CAD': 0.52, 'XAUUSD': -0.72, 'NASDAQ': -0.25, 'US30': -0.22 },
  'USD/CHF': { 'EUR/USD': -0.92, 'GBP/USD': -0.82, 'USD/JPY': 0.78, 'USD/CHF': 1.00, 'AUD/USD': -0.55, 'NZD/USD': -0.50, 'USD/CAD': 0.68, 'XAUUSD': -0.58, 'NASDAQ': -0.30, 'US30': -0.25 },
  'AUD/USD': { 'EUR/USD': 0.62, 'GBP/USD': 0.58, 'USD/JPY': -0.38, 'USD/CHF': -0.55, 'AUD/USD': 1.00, 'NZD/USD': 0.92, 'USD/CAD': -0.60, 'XAUUSD': 0.55, 'NASDAQ': 0.42, 'US30': 0.38 },
  'NZD/USD': { 'EUR/USD': 0.58, 'GBP/USD': 0.52, 'USD/JPY': -0.35, 'USD/CHF': -0.50, 'AUD/USD': 0.92, 'NZD/USD': 1.00, 'USD/CAD': -0.55, 'XAUUSD': 0.50, 'NASDAQ': 0.38, 'US30': 0.35 },
  'USD/CAD': { 'EUR/USD': -0.72, 'GBP/USD': -0.65, 'USD/JPY': 0.52, 'USD/CHF': 0.68, 'AUD/USD': -0.60, 'NZD/USD': -0.55, 'USD/CAD': 1.00, 'XAUUSD': -0.45, 'NASDAQ': -0.28, 'US30': -0.22 },
  'XAUUSD': { 'EUR/USD': 0.55, 'GBP/USD': 0.48, 'USD/JPY': -0.72, 'USD/CHF': -0.58, 'AUD/USD': 0.55, 'NZD/USD': 0.50, 'USD/CAD': -0.45, 'XAUUSD': 1.00, 'NASDAQ': 0.15, 'US30': 0.12 },
  'NASDAQ': { 'EUR/USD': 0.35, 'GBP/USD': 0.32, 'USD/JPY': -0.25, 'USD/CHF': -0.30, 'AUD/USD': 0.42, 'NZD/USD': 0.38, 'USD/CAD': -0.28, 'XAUUSD': 0.15, 'NASDAQ': 1.00, 'US30': 0.95 },
  'US30': { 'EUR/USD': 0.30, 'GBP/USD': 0.28, 'USD/JPY': -0.22, 'USD/CHF': -0.25, 'AUD/USD': 0.38, 'NZD/USD': 0.35, 'USD/CAD': -0.22, 'XAUUSD': 0.12, 'NASDAQ': 0.95, 'US30': 1.00 },
};
const getCorrColor = (v: number): string => { const a = Math.abs(v); if (a >= 0.7) return v > 0 ? '#EF5350' : '#26A69A'; if (a >= 0.4) return '#FFB300'; return '#6b7280'; };
const getCorrWarning = (v: number): string => { const a = Math.abs(v); if (a >= 0.8) return v > 0 ? '☠️ DANGER: Doubled risk' : '🛡️ Strong natural hedge'; if (a >= 0.7) return v > 0 ? '⚠️ High: Significant overlap' : '✅ Good hedge potential'; if (a >= 0.4) return '🟡 Moderate: Some overlap'; return '✅ Low: True diversification'; };

// ============================================================
// CONTENT DATA
// ============================================================
const dxyBreakdown = [
  { title: '💵 DXY: The Master Variable', desc: '<strong>What:</strong> The US Dollar Index measures USD against a basket of 6 currencies (EUR 57.6%, JPY 13.6%, GBP 11.9%, CAD 9.1%, SEK 4.2%, CHF 3.6%).<br/><br/><strong>Why it rules everything:</strong> 88% of all forex transactions involve USD on one side. Every major commodity is priced in USD. Global debt is denominated in USD. When DXY moves, EVERYTHING reacts.<br/><br/><strong>The EUR connection:</strong> EUR is 57.6% of DXY. This means DXY and EUR/USD have a −0.98 correlation. When you’re watching DXY, you’re mostly watching EUR/USD inverted. Don’t over-complicate it.' },
  { title: '🔗 Positive Correlation (Move Together)', desc: '<strong>Examples:</strong> EUR/USD and GBP/USD (+0.88). AUD/USD and NZD/USD (+0.92). NASDAQ and US30 (+0.95).<br/><br/><strong>The danger:</strong> If you’re long EUR/USD AND long GBP/USD, you think you have 2 trades. You actually have <strong>1 doubled trade</strong> against USD. If USD strengthens, BOTH lose simultaneously. Your “2% total risk” is really 3.8%.<br/><br/><strong>The rule:</strong> Correlation above +0.7 = treat as the same position for risk purposes. If you want both, halve the size on each.' },
  { title: '↔️ Negative Correlation (Move Opposite)', desc: '<strong>Examples:</strong> EUR/USD and USD/CHF (−0.92). USD/JPY and XAUUSD (−0.72).<br/><br/><strong>The opportunity:</strong> Negatively correlated pairs are natural hedges. Long EUR/USD + long USD/CHF effectively cancel each other. You’re paying spread for zero net exposure.<br/><br/><strong>The smart use:</strong> If you’re long EUR/USD and want to REDUCE risk without closing, you can open a partial USD/CHF long. The negative correlation offsets some of your EUR/USD exposure. This is professional hedging.' },
  { title: '💥 When Correlations Break', desc: '<strong>Normal times:</strong> EUR/USD and GBP/USD have +0.88 correlation. They move together like clockwork.<br/><br/><strong>Crisis times:</strong> BOE makes a surprise hawkish decision. GBP surges but EUR doesn’t. The correlation drops to +0.4 temporarily. Your paired positions that “always move together” suddenly diverge.<br/><br/><strong>The signal:</strong> When historically high correlations BREAK, it signals that a country-specific event is overriding the USD effect. This is valuable information — it tells you the move is about GBP specifically, not USD generally.<br/><br/><strong>Always monitor:</strong> If your correlated pairs start diverging, one of them is receiving country-specific flow that changes the dynamics.' },
];

const corrZones = [
  { range: '+0.8 to +1.0', label: 'DANGER ZONE', color: '#EF5350', desc: 'Same position, different name. Long both = doubled risk. Choose ONE or halve both.', examples: 'EUR/USD + GBP/USD | AUD/USD + NZD/USD | NASDAQ + US30' },
  { range: '+0.4 to +0.7', label: 'MODERATE OVERLAP', color: '#FFB300', desc: 'Partial overlap. Not doubled but not independent either. Full size on both is risky during USD events.', examples: 'EUR/USD + AUD/USD | GBP/USD + NZD/USD' },
  { range: '−0.3 to +0.3', label: 'TRUE DIVERSIFICATION', color: '#26A69A', desc: 'Genuinely independent moves. Two positions at full risk = actual 2 separate trades.', examples: 'EUR/USD + NASDAQ | XAUUSD + AUD/USD' },
  { range: '−0.7 to −0.3', label: 'PARTIAL HEDGE', color: '#3b82f6', desc: 'Opposite direction tendency. Useful for reducing exposure without closing. Not a perfect hedge.', examples: 'EUR/USD + USD/CAD | GBP/USD + USD/JPY' },
  { range: '−1.0 to −0.7', label: 'NATURAL HEDGE', color: '#8b5cf6', desc: 'Near-perfect offset. Long both = near-zero net exposure. Useful for hedging, useless for doubling.', examples: 'EUR/USD + USD/CHF | Essentially inverse pairs' },
];

const commonMistakes = [
  { title: '"Diversifying" with 3 USD Pairs', mistake: 'Long EUR/USD, long GBP/USD, long AUD/USD. “I’m diversified across 3 pairs.” No — you have a triple-sized short USD position. One strong NFP = all 3 lose simultaneously.', fix: 'Check correlation before adding. If all pairs share USD on the same side, you’re not diversified — you’re concentrated. Choose the BEST setup and trade it with appropriate size.' },
  { title: 'Ignoring Correlation During News', mistake: 'You hold EUR/USD and GBP/USD into NFP, each at 1% risk. “I’m only risking 2%.” Both drop 60+ pips together. Your actual loss is closer to 3.5% because +0.88 correlation means nearly doubled exposure.', fix: 'During high-impact USD events, correlated pairs move in lockstep. Your risk COMPOUNDS, not diversifies. Flatten one or halve both before news.' },
  { title: 'Not Monitoring Correlation Shifts', mistake: 'EUR/USD and GBP/USD normally correlate +0.88. You assume this is permanent. Then BOE surprises and GBP diverges. Your paired trade goes from correlated to chaotic.', fix: 'Correlations are AVERAGES, not guarantees. Country-specific events can break them temporarily. When your pairs start diverging, ask: what’s driving the break?' },
  { title: 'Using Negative Correlation for "Double Profit"', mistake: 'Long EUR/USD + short USD/CHF. “Both should profit!” They’re −0.92 correlated. This IS the same trade. You’re paying double the spread for the same exposure.', fix: 'Use negative correlation for HEDGING (reducing exposure), not for amplifying. If you want USD weakness, choose the best single vehicle, not two inverse ones.' },
];

const quizQuestions = [
  { q: 'You’re long EUR/USD at 1% risk AND long GBP/USD at 1% risk. Their correlation is +0.88. Your true USD exposure is approximately:', opts: ['2% — simple addition', '1.88% — close to doubled because +0.88 means they move almost identically', '1% — diversification reduces risk', '0.5% — they offset each other'], correct: 1, explain: 'With +0.88 correlation, the two positions move nearly in lockstep. Your 1% + 1% doesn’t diversify — it compounds to approximately 1.88% of correlated USD exposure. During NFP, both lose simultaneously.' },
  { q: 'DXY strengthens 1%. The pair MOST likely to drop is:', opts: ['USD/JPY', 'EUR/USD — EUR is 57.6% of DXY, making it the most sensitive to DXY moves', 'NASDAQ', 'USD/CAD'], correct: 1, explain: 'EUR/USD has a −0.98 correlation with DXY because EUR is 57.6% of the DXY basket. A 1% DXY rise translates almost directly to a ~1% EUR/USD drop. It’s the most DXY-sensitive pair.' },
  { q: 'EUR/USD and USD/CHF have a −0.92 correlation. Being long both means:', opts: ['Double profit potential', 'Near-zero net exposure — the positions largely cancel each other out, paying double spread for nothing', 'Risk-off hedge', 'Diversification'], correct: 1, explain: '−0.92 means they move almost perfectly opposite. Long EUR/USD profits when USD weakens. Long USD/CHF profits when USD strengthens. They offset almost entirely, leaving you with nearly zero exposure but paying spread on both.' },
  { q: 'AUD/USD and NZD/USD correlate at +0.92. You want exposure to AUD weakness. The best approach is:', opts: ['Short both at full size for double exposure', 'Short AUD/USD at full size OR short both at HALF size each. Never full size on both — +0.92 means nearly identical positions.', 'Short AUD/USD and long NZD/USD', 'Short NZD/USD only — it’s cheaper'], correct: 1, explain: 'At +0.92 correlation, AUD/USD and NZD/USD are nearly the same trade. Full size on both = nearly doubled exposure to Antipodean weakness. Choose the better setup at full size, or split half-and-half.' },
  { q: 'Normally EUR/USD and GBP/USD move together (+0.88). Today GBP/USD rallies 60 pips while EUR/USD is flat. This divergence means:', opts: ['EUR/USD will catch up', 'The move is GBP-specific (likely BOE-related), not USD-driven. The correlation broke because of country-specific flow.', 'Random noise', 'The correlation is permanently broken'], correct: 1, explain: 'When highly correlated pairs diverge, it means the move is specific to one currency, not the common factor (USD). GBP rallying alone = a GBP-positive event (BOE, UK data). This is valuable information — it tells you to look at GBP factors, not USD.' },
  { q: 'You trade XAUUSD and EUR/USD. Their correlation is +0.55. For risk management, this means:', opts: ['They’re essentially the same trade', 'Moderate overlap — not independent but not doubled. Full size on both is acceptable but reduce during major USD events.', 'Completely independent', 'One must be closed'], correct: 1, explain: '+0.55 is moderate. There’s meaningful overlap through the USD connection, but they also have independent drivers (Gold = safe haven, EUR = ECB policy). Full size on both is acceptable in normal conditions, but reduce one during Tier 1 USD events.' },
  { q: 'The "DXY Domino Effect" means:', opts: ['DXY is a domino game', 'When USD strengthens or weakens, it cascades through EVERY market — currencies, Gold, commodities, equities. USD is the gravitational centre.', 'Only major pairs react to DXY', 'DXY only matters for EUR/USD'], correct: 1, explain: 'USD is in 88% of forex transactions. Commodities are priced in USD. Global debt is USD-denominated. When DXY moves, the effect cascades to currencies (directly), Gold (inversely), commodities (USD-priced), and equities (rate expectations). Everything connects through USD.' },
  { q: 'Best practice for a trader who trades EUR/USD, GBP/USD, and XAUUSD:', opts: ['Trade all three at full 1% risk always', 'Treat EUR/USD + GBP/USD as a single risk bucket. If trading both, halve each. XAUUSD is moderate overlap — can run at full size separately.', 'Only trade one at a time', 'Correlations don’t matter if your setups are good'], correct: 1, explain: 'EUR/USD and GBP/USD at +0.88 = same risk bucket. If both are active, 0.5% each. XAUUSD at +0.55 with EUR/USD is moderate — acceptable at full size in normal conditions. During NFP/FOMC, reduce the whole portfolio.' },
];

const gameRounds = [
  { scenario: '<strong>You’re long EUR/USD at 1% risk.</strong> A clean GBP/USD setup appears. Also bullish. Correlation between them: +0.88. You normally risk 1% per trade.', options: [
    { text: 'Enter GBP/USD at 1% risk too — it’s a separate setup.', correct: false, explain: '✗ It’s a separate SETUP but not a separate RISK. At +0.88, these are essentially the same USD trade. If USD strengthens, both lose simultaneously. Your real exposure would be ~1.88%, not the 2% you think.' },
    { text: 'Enter GBP/USD at 0.5% risk (halved). Total correlated exposure: ~1% EUR/USD + ~0.5% GBP/USD = manageable.', correct: true, explain: '✓ You recognised the correlation and adjusted. Taking both at half size each is also acceptable. The key is acknowledging that +0.88 correlation means your risk compounds, not diversifies.' },
    { text: 'Skip GBP/USD entirely — you already have EUR/USD.', correct: false, explain: '✗ Skipping entirely is too conservative. The setups are independent entries. You just need to SIZE appropriately. Half size captures the opportunity without doubling risk.' },
  ]},
  { scenario: '<strong>NFP in 25 minutes.</strong> You have: EUR/USD long (1%), GBP/USD long (0.5%), XAUUSD long (1%). All are in profit. EUR+GBP correlation: +0.88. EUR+Gold: +0.55.', options: [
    { text: 'Hold all — they’re all in profit.', correct: false, explain: '✗ NFP is a Tier 1 USD event. ALL three of your positions are USD-negative (you need USD weakness). EUR and GBP will move almost identically during NFP. Gold will partially correlate. A hot NFP hits all three. Profit becomes loss in seconds.' },
    { text: 'Close EUR/USD and GBP/USD (highest correlation pair). Hold Gold at reduced risk — it has independent drivers beyond USD.', correct: true, explain: '✓ EUR + GBP are the most correlated and most sensitive to NFP. Close both. Gold has a +0.55 correlation — it’ll be affected but also has safe-haven flows that can partially offset. Reducing Gold to 0.5% is even better.' },
    { text: 'Close everything and go flat.', correct: false, explain: '✗ This is acceptable but overly cautious. Gold’s lower correlation and independent safe-haven driver means it’s not as exposed as the currency pairs. Closing the high-correlation pairs and managing Gold is more nuanced.' },
  ]},
  { scenario: '<strong>Normally EUR/USD and GBP/USD: +0.88.</strong> Today, ECB is hawkish — EUR surges 50 pips. GBP is flat. The correlation has temporarily broken. You have no open positions.', options: [
    { text: 'Long GBP/USD — it should “catch up” to EUR/USD.', correct: false, explain: '✗ Assuming pairs “catch up” is the correlation reversion trap. The divergence is telling you this move is EUR-SPECIFIC (ECB hawkish), not USD-driven. GBP has no reason to follow unless USD weakens broadly.' },
    { text: 'The divergence signals an ECB-specific move, not a USD move. Trade EUR/USD if the ECB setup is clean. Don’t expect GBP/USD to follow.', correct: true, explain: '✓ When correlated pairs diverge, it identifies the SOURCE of the move. EUR surging while GBP is flat = ECB is the driver, not USD. Trade EUR directly if you have a setup. GBP/USD should be evaluated on its own merits, not as a EUR follower.' },
    { text: 'Short GBP/USD — if EUR is strong and GBP isn’t, GBP must be weak.', correct: false, explain: '✗ GBP being flat while EUR rises doesn’t mean GBP is weak. It means GBP isn’t being driven by the same factor (ECB). GBP/USD direction depends on BOE and UK data, not on EUR movements.' },
  ]},
  { scenario: '<strong>Your portfolio:</strong> Short USD/JPY (betting JPY strength). Long XAUUSD (Gold). These correlate at −0.72 with each other. USD/JPY down = USD weak. Gold up = USD weak. Both trades are: pro-JPY and pro-Gold.', options: [
    { text: 'Good diversification — two different instruments.', correct: false, explain: '✗ Different instruments but the SAME directional bet. Both profit from USD weakness / risk-off flows. At −0.72 between USD/JPY and Gold (meaning they naturally move opposite, but your SHORT USD/JPY aligns with long Gold), you’re doubling your USD-weakness bet.' },
    { text: 'Recognise this is a concentrated bet on USD weakness. Both positions benefit from the same macro scenario. Size accordingly — reduce one or halve both.', correct: true, explain: '✓ Short USD/JPY + long Gold = same directional thesis (USD weak / risk-off). They’ll both profit or both suffer from the same macro driver. This is concentration, not diversification. Halve both or choose the better vehicle.' },
    { text: 'Perfect hedge — if one loses, the other gains.', correct: false, explain: '✗ This is NOT a hedge. Both positions PROFIT from USD weakness. For it to be a hedge, one would need to profit from USD strength. Short USD/JPY + short XAUUSD would be closer to hedged (but still not perfect).' },
  ]},
  { scenario: '<strong>You want to build a truly diversified 3-position portfolio.</strong> Your main instrument is EUR/USD. Which two additions provide the BEST diversification?', options: [
    { text: 'GBP/USD and AUD/USD — three major pairs.', correct: false, explain: '✗ EUR/USD + GBP/USD = +0.88. EUR/USD + AUD/USD = +0.62. GBP/USD + AUD/USD = +0.58. All positive, all USD-linked. This is a triple USD concentration, not diversification.' },
    { text: 'NASDAQ and USD/JPY — low correlation to EUR/USD (+0.35 and −0.65), and different drivers (tech sector, JPY carry trade).', correct: true, explain: '✓ NASDAQ at +0.35 and USD/JPY at −0.65 provide genuine diversification from EUR/USD. NASDAQ is driven by tech earnings and growth expectations. USD/JPY has BOJ policy as an independent driver. Three truly different positions.' },
    { text: 'GBP/USD and USD/CHF — one positive, one negative to EUR/USD.', correct: false, explain: '✗ GBP/USD at +0.88 is the same as EUR/USD. USD/CHF at −0.92 OFFSETS EUR/USD. Together, you have EUR/USD + its clone + its inverse = messy exposure that mostly cancels out with high spread costs.' },
  ]},
];

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function CurrencyCorrelationsPage() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setOpenSections(p => ({ ...p, [id]: !p[id] }));

  // Correlation Matrix Builder
  const [selectedPairs, setSelectedPairs] = useState<string[]>([]);
  const togglePair = (p: string) => setSelectedPairs(prev => prev.includes(p) ? prev.filter(x => x !== p) : prev.length < 5 ? [...prev, p] : prev);
  const pairCombos: { a: string; b: string; corr: number }[] = [];
  for (let i = 0; i < selectedPairs.length; i++) { for (let j = i + 1; j < selectedPairs.length; j++) { pairCombos.push({ a: selectedPairs[i], b: selectedPairs[j], corr: corrMatrix[selectedPairs[i]]?.[selectedPairs[j]] || 0 }); } }
  const hasDanger = pairCombos.some(c => Math.abs(c.corr) >= 0.7);

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
        <div className="flex items-center gap-2"><Crown className="w-3.5 h-3.5 text-amber-400" /><span className="text-xs font-bold text-amber-400">PRO &middot; LEVEL 8</span></div>
      </nav>

      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6 pt-20">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(245,158,11,0.08),transparent_70%)] pointer-events-none" />
        <div className="absolute top-[-50px] right-[20%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(217,70,239,0.05),transparent_70%)] pointer-events-none" />
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.15 } } }} className="relative z-10">
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 8 &middot; Lesson 8</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Currency Correlations<br /><span className="bg-gradient-to-r from-amber-400 via-red-400 to-purple-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>&amp; the Dollar</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">The Dollar is the sun. Everything else orbits around it. Understand correlations or discover — painfully — that your &ldquo;diversified&rdquo; portfolio is actually one giant USD bet.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* S00 */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">🌐 The Invisible Thread</p>
            <p className="text-gray-400 leading-relaxed mb-4">Imagine you own two shops on the same street. One sells umbrellas. One sells raincoats. When it rains, <strong className="text-amber-400">both profit</strong>. When it’s sunny, <strong className="text-white">both suffer</strong>. You thought you were diversified. You actually own <strong className="text-white">the same business twice</strong>.</p>
            <p className="text-gray-400 leading-relaxed">That’s what happens when traders go long EUR/USD and GBP/USD simultaneously. Same underlying bet: <strong className="text-amber-400">USD weakness</strong>. Different labels, same exposure.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">Trader holds <strong className="text-white">EUR/USD long (1%)</strong> + <strong className="text-white">GBP/USD long (1%)</strong> into NFP. Both at “1% risk each.” NFP beats massively. USD surges. EUR/USD drops 85 pips. GBP/USD drops 70 pips. <strong className="text-red-400">Both positions stopped: −1.9% total loss.</strong> The trader thought they risked 2% with diversification. They actually risked <strong className="text-red-400">~3.8% on a single USD event</strong>. Correlation turned “2 trades” into 1 doubled bet.</p>
          </div>
        </motion.div>
      </section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Correlation Web</p><h2 className="text-2xl font-extrabold mb-4">Everything Connects Through USD</h2><p className="text-gray-400 text-sm mb-6">Currency pairs are connected by an invisible web. Green = move together. Red = move opposite.</p><CorrelationWebAnimation /></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Dollar Domino Effect</p><h2 className="text-2xl font-extrabold mb-4">When DXY Moves, Everything Reacts</h2><p className="text-gray-400 text-sm mb-6">Alternates between USD strength and weakness cascades.</p><DXYDominoAnimation /></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; Understanding Correlation</p><h2 className="text-2xl font-extrabold mb-4">DXY, Positive, Negative &amp; Breaks</h2><div className="space-y-3">{dxyBreakdown.map((item, i) => (<div key={i}><button onClick={() => toggle(`db-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`db-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`db-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.desc }} /></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The 5 Correlation Zones</p><h2 className="text-2xl font-extrabold mb-4">From Danger to Diversification</h2><div className="p-6 rounded-2xl glass-card space-y-3">{corrZones.map(z => (<div key={z.range} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><div className="flex items-center justify-between mb-1"><p className="text-xs font-bold" style={{ color: z.color }}>{z.range}</p><span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: z.color + '20', color: z.color }}>{z.label}</span></div><p className="text-[11px] text-gray-400 mb-1">{z.desc}</p><p className="text-[10px] text-gray-600">Examples: {z.examples}</p></div>))}</div></motion.div></section>

      {/* S05 — GROUNDBREAKING: Correlation Matrix Builder */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Interactive Challenge</p><h2 className="text-2xl font-extrabold mb-2">Correlation Matrix Builder</h2><p className="text-gray-400 text-sm mb-6">Select your trading pairs (up to 5). See every correlation, warnings for doubled risk, and true diversification opportunities.</p>
      <div className="p-6 rounded-2xl glass-card space-y-4">
        <div><p className="text-xs font-bold text-gray-300 mb-2">Select Your Pairs (max 5)</p><div className="flex flex-wrap gap-1.5">{allPairs.map(p => (<button key={p} onClick={() => togglePair(p)} className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${selectedPairs.includes(p) ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400' : 'bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:bg-white/[0.07]'}`}>{p}</button>))}</div></div>
        {selectedPairs.length >= 2 && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          {hasDanger && (<div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20"><p className="text-xs font-bold text-red-400">⚠ HIGH CORRELATION DETECTED</p><p className="text-[10px] text-gray-400">Some of your pairs have correlation above ±0.7. Trading both at full risk = concentrated exposure.</p></div>)}
          <div className="space-y-2">{pairCombos.map((combo, i) => { const color = getCorrColor(combo.corr); const warning = getCorrWarning(combo.corr); return (<div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><div className="flex items-center justify-between mb-1"><p className="text-xs font-semibold text-gray-300">{combo.a} ↔ {combo.b}</p><p className="text-sm font-extrabold" style={{ color }}>{combo.corr > 0 ? '+' : ''}{combo.corr.toFixed(2)}</p></div><p className="text-[10px]" style={{ color: getCorrColor(combo.corr) }}>{warning}</p></div>); })}</div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-[10px] font-bold text-gray-300 mb-1">PORTFOLIO ASSESSMENT</p><p className="text-xs text-gray-400">{pairCombos.filter(c => Math.abs(c.corr) >= 0.7).length > 0 ? `${pairCombos.filter(c => c.corr >= 0.7).length} pair(s) with dangerous positive correlation. Consider halving size on the most correlated pair or choosing only the best setup.` : 'Good diversification. No dangerous correlation overlap detected.'}</p></div>
        </motion.div>)}
        {selectedPairs.length < 2 && (<p className="text-xs text-gray-600 text-center">Select at least 2 pairs to see correlation data.</p>)}
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Cross-Pair Confirmation</p><h2 className="text-2xl font-extrabold mb-4">Using Correlation to Strengthen Your Bias</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#26A69A]">CONFIRMATION</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">EUR/USD bearish setup + DXY bullish structure + GBP/USD also weak = STRONG USD conviction. All pieces align.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#FFB300]">DIVERGENCE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">EUR/USD dropping but GBP/USD rising = NOT a USD move. It’s EUR-specific or GBP-specific. Reduce conviction.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">CONTRADICTION</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">DXY falling but Gold is ALSO falling = unusual. Something non-standard is driving flows. Reduce size until clarity.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">THE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Check DXY direction before entering ANY USD pair. If your trade agrees with DXY, conviction is higher. If it contradicts, ask why.</span></p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Portfolio Risk Rules</p><h2 className="text-2xl font-extrabold mb-4">Managing Correlated Exposure</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">RULE 1: &gt;+0.7</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Treat as ONE position. If trading both, halve each. Never full size on two highly correlated pairs.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#FFB300]">RULE 2: +0.4 to +0.7</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Moderate overlap. Full size acceptable in normal conditions. Reduce one during Tier 1 USD events.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#26A69A]">RULE 3: &lt;+0.3</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">True diversification. Full size on both is genuine 2-position risk. This is what diversification actually means.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#a855f7]">RULE 4: NEGATIVE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Same direction on both = offsetting (hedge, not doubling). Opposite direction = genuine doubling. Check the DIRECTION.</span></p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p><h2 className="text-2xl font-extrabold mb-4">4 Correlation Errors That Blow Accounts</h2><div className="space-y-3">{commonMistakes.map((item, i) => (<div key={i}><button onClick={() => toggle(`cm-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`cm-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`cm-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-xs text-red-400 mb-2">&#10060; {item.mistake}</p><p className="text-xs text-green-400">&#10004; {item.fix}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Cheat Sheet</p><h2 className="text-2xl font-extrabold mb-4">Correlation Quick Reference</h2><div className="p-6 rounded-2xl glass-card space-y-3"><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">EUR+GBP = 0.88</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Same trade. Choose one or halve both. NEVER full size on both into NFP.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#26A69A]">DXY FIRST</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Check DXY direction before entering any USD pair. Alignment = conviction. Contradiction = caution.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#FFB300]">DIVERGENCE = SIGNAL</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">When correlated pairs diverge, the move is country-specific, not USD-driven. Valuable information.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#3b82f6]">NEWS AMPLIFIES</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Correlations spike during USD events. Your “2 positions” become 1 doubled position. Flatten or halve before Tier 1.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">THE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Diversification is measured by correlation, not by instrument count. 3 USD pairs ≠ 3 trades.</span></p></div></div></motion.div></section>

      {/* S10 — Game */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Test Your Understanding</p><h2 className="text-2xl font-extrabold mb-2">Correlation Portfolio Game</h2><p className="text-gray-400 text-sm mb-6">5 scenario-based rounds. Build portfolios, manage correlated risk, read divergence signals.</p>
      <div className="p-6 rounded-2xl glass-card"><div className="flex items-center justify-between mb-4"><span className="text-xs font-bold text-amber-400">Round {gameRound + 1} of {gameRounds.length}</span><span className="text-xs font-mono text-gray-500">{gameScore}/{gameRounds.length} correct</span></div><p className="text-sm text-gray-300 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: gameRounds[gameRound].scenario }} /><div className="space-y-2">{gameRounds[gameRound].options.map((opt, oi) => { const answered = gameAnswers[gameRound] !== null; const selected = gameAnswers[gameRound] === oi; const isCorrect = opt.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return (<div key={oi}><button onClick={() => handleGameAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt.text }} /></button>{answered && selected && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]"><p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`} dangerouslySetInnerHTML={{ __html: opt.explain }} /></motion.div>)}</div>); })}</div>{gameAnswers[gameRound] !== null && gameRound < gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5"><button onClick={() => setGameRound(r => r + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button></motion.div>)}{gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Outstanding — you understand portfolio correlation at a professional level.' : gameScore >= 3 ? 'Good — review the NFP multi-position scenario and the divergence signal.' : 'Re-read the correlation zones and the DXY domino effect before proceeding.'}</p></motion.div>)}</div></motion.div></section>

      {/* S11 — Quiz + Certificate */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Knowledge Check</p><h2 className="text-2xl font-extrabold mb-6">Final Quiz &mdash; 8 Questions</h2>
      <div className="space-y-6">{quizQuestions.map((q, qi) => (<div key={qi} className="p-5 rounded-2xl glass-card"><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p><p className="text-sm font-semibold text-white mb-4">{q.q}</p><div className="space-y-2">{q.opts.map((opt, oi) => { const answered = quizAnswers[qi] !== null; const selected = quizAnswers[qi] === oi; const isCorrect = oi === q.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return <button key={oi} onClick={() => handleQuizAnswer(qi, oi)} disabled={answered} className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`}>{opt}</button>; })}</div>{quizAnswers[qi] !== null && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg bg-white/[0.02]"><p className="text-xs text-amber-400" dangerouslySetInnerHTML={{ __html: `<span class="font-bold">&#9989;</span> ${q.explain}` }} /></motion.div>)}</div>))}</div>
      {quizDone && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center"><p className="text-3xl font-extrabold mb-2">{quizScoreVal}%</p><p className="text-sm text-gray-400">{quizScoreVal >= 66 ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate. Review and try again.'}</p></motion.div>)}
      {certUnlocked && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10"><div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}><div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(139,92,246,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} /><div className="relative z-10 text-center"><div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">🔗</div><p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p><p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 8: Currency Correlations &amp; the Dollar</strong><br />at ATLAS Academy by Interakktive</p><p className="bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Correlation Architect &mdash;</p><p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L8.8-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p></div></div></motion.div>)}</motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-20 text-center"><Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">&larr; Back to Academy</Link></section>
    </div>
  );
}
