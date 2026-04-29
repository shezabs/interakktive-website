// app/academy/lesson/cipher-risk-map/page.tsx
// ATLAS Academy — Lesson 11.21: Cipher Risk Map [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 11 · CIPHER
// Where The Trade Goes, And Where It Doesn't.
// Covers: Risk Map anatomy (Entry/SL/TP1/TP2/TP3/Risk attached to every signal),
//         3 SL methods (Structure = swing low/high − buffer, Pulse = pulse_line ±
//         buffer, ATR = close ± atr × multiplier, default 1.5x), 0.3 ATR safety
//         buffer to avoid wick clips, 3 TP methods (R-Multiple = entry ± sl_dist ×
//         multiplier classic R/R, Structure = next S/R levels from zone_price[]
//         scan with na-fallback to R-Multiple, ATR Targets = entry ± atr ×
//         multiplier fixed distances), TP1/TP2/TP3 ladder (default 1R/2R/3R),
//         asset-class Auto-resolution via syminfo.type (Crypto → Structure SL +
//         R-Multiple TP, Forex → Pulse SL + ATR Targets TP, Stocks/Indices →
//         Structure both ways), the SL safety guard (when Pulse SL ends up on
//         profit side, fall back to ATR SL), method labels in tooltip ("Swing
//         Low", "Pulse", "1.5 ATR", "S/R", "1R"), TP/SL lines on chart with
//         auto-clear on next signal, JSON alerts, the trade plan as discipline,
//         edge cases, mistakes.

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Crown } from 'lucide-react';

// ============================================================
// GAME ROUNDS — 5 scenario-based Risk Map challenges
// Tests asset-class Auto-resolution, SL/TP method recognition,
// the safety guard logic, the Risk Map tooltip read, and the
// "trade plan as discipline" execution model.
// FILLED IN PHASE 3A — placeholder shells for now.
// ============================================================
const gameRounds: {
  id: string;
  scenario: string;
  prompt: string;
  options: { id: string; text: string; correct: boolean; explain: string }[];
}[] = [
  {
    id: 'r1-nas100-1d-tooltip',
    scenario: 'NAS100 1D  \u00B7  Short signal hover  \u00B7  Risk Map tooltip block reads:  Entry 27076.0  \u00B7  SL 27561.1 (Swing High)  \u00B7  TP1 26590.9 (1R)  \u00B7  TP2 26105.8 (2R)  \u00B7  TP3 25620.6 (3R)  \u00B7  Risk: 485.1 per unit',
    prompt: 'Reading the verbatim Risk Map tooltip from the live NAS100 1D capture: which SL method fired, and is it correct for the asset class?',
    options: [
      { id: 'a', text: 'Pulse method \u2014 standard for indices', correct: false, explain: 'The label reads &ldquo;Swing High&rdquo;, which is Structure mode (S04). Pulse mode would have shown &ldquo;Pulse&rdquo; in parens. Indices are not the standard for Pulse anyway \u2014 forex is.' },
      { id: 'b', text: 'Structure method \u2014 correct for stocks/indices', correct: true, explain: 'Correct. The label &ldquo;Swing High&rdquo; identifies Structure mode. NAS100 has syminfo.type = &ldquo;index&rdquo; which falls into the &ldquo;Other&rdquo; branch of Auto resolution \u2014 SL Structure + TP Structure. Per S08-S11, indices and stocks respect institutional S/R levels surgically; Structure SL at the recent swing high absorbs noise without giving up institutional intent.' },
      { id: 'c', text: 'ATR method \u2014 1.5 ATR fixed distance', correct: false, explain: 'The label would read &ldquo;1.5 ATR&rdquo; or similar if ATR mode fired. Auto mode for SL never resolves to ATR (S08); ATR is only available as an explicit override. The &ldquo;Swing High&rdquo; label rules out ATR.' },
      { id: 'd', text: 'Cannot determine from the tooltip alone', correct: false, explain: 'The method is fully readable from the tooltip. The parenthetical label after the price is exactly the method indicator \u2014 Structure shows &ldquo;Swing Low/High&rdquo;, Pulse shows &ldquo;Pulse&rdquo;, ATR shows &ldquo;[N] ATR&rdquo;. The labels exist precisely so operators can audit method choice without checking inputs.' },
    ],
  },
  {
    id: 'r2-btc-1d-asset-class',
    scenario: 'BTC/USD 1D  \u00B7  Short signal fires  \u00B7  Tooltip shows TP labels:  TP1 73984 (1R)  \u00B7  TP2 70887 (2R)  \u00B7  TP3 67790 (3R)  \u00B7  Auto mode active',
    prompt: 'BTC/USD with TP labels reading 1R/2R/3R confirms which Auto-mode resolution and asset-class match?',
    options: [
      { id: 'a', text: 'Forex asset class \u2014 ATR Targets TP method', correct: false, explain: 'Forex resolves to ATR Targets, which would show labels like &ldquo;1.0 ATR / 2.0 ATR / 3.0 ATR&rdquo;. The 1R/2R/3R labels are R-Multiple, not ATR Targets. BTC is also clearly not forex \u2014 syminfo.type = &ldquo;crypto&rdquo;.' },
      { id: 'b', text: 'Crypto asset class \u2014 R-Multiple TP method', correct: true, explain: 'Correct. BTC has syminfo.type = &ldquo;crypto&rdquo; which Auto mode resolves to Structure SL + R-Multiple TP (S08, S10). The R-Multiple labels (1R/2R/3R) are exactly what the engine produces for crypto. The reasoning: crypto momentum runs extend uncapped, so R-Multiple TPs let the trade ride to whatever R-multiple the move actually reaches \u2014 Structure TPs would cap at nearest S/R, leaving runners on the table.' },
      { id: 'c', text: 'Stocks asset class \u2014 Structure TP method', correct: false, explain: 'Stocks resolve to Structure both ways, with TP labels reading &ldquo;S/R&rdquo; when real levels are found. R-multiple labels would only appear as fallback when Structure couldn\u2019t find a level. All-uniform 1R/2R/3R labels strongly indicate R-Multiple as the primary method, not Structure with full fallback.' },
      { id: 'd', text: 'Manual override to ATR Targets', correct: false, explain: 'ATR Targets labels would read &ldquo;[N] ATR&rdquo;. The &ldquo;1R/2R/3R&rdquo; labels are unambiguously R-Multiple. The scenario says Auto mode active, ruling out manual override anyway.' },
    ],
  },
  {
    id: 'r3-override-discipline',
    scenario: 'EUR/USD 4H  \u00B7  Long signal fires  \u00B7  SL distance is 25 pips, larger than your normal account-size comfort  \u00B7  TPs are 1.0/2.0/3.0 ATR (forex Auto mode)',
    prompt: 'The engine&apos;s SL distance feels too wide for your account. What is the disciplined operator\u2019s response?',
    options: [
      { id: 'a', text: 'Tighten the SL to a level that fits your account size', correct: false, explain: 'This is Mistake 1 (S14, mistake #1). Per-trade SL overrides convert a calibrated stop into an arbitrary one \u2014 the new level has no structural meaning, no signal-mechanic basis, no buffer-aware noise absorption. Stop-out frequency rises; long-run statistics become meaningless.' },
      { id: 'b', text: 'Skip the trade entirely \u2014 SL doesn\u2019t fit context', correct: true, explain: 'Correct. Per S14: &ldquo;Skip is better than override.&rdquo; If the engine\u2019s SL is too wide for your account, skipping the trade preserves system integrity. Skip is a legitimate operator action that produces clean &ldquo;skipped trade with no statistical impact&rdquo;; override produces &ldquo;modified trade with unknown statistics.&rdquo; Across hundreds of trades, the discipline matters.' },
      { id: 'c', text: 'Take the trade with smaller position sizing', correct: false, explain: 'Close, but missed the actual point. Smaller sizing IS the right move IF you take the trade \u2014 sizing is the operator\u2019s legitimate variable (S14). However, the question implies you have a fundamental discomfort with the SL distance. If reducing size to make the dollar risk fit doesn\u2019t resolve the discomfort, skipping is cleaner. The right answer depends on whether sizing alone solves the issue \u2014 if yes, take with smaller size; if no, skip.' },
      { id: 'd', text: 'Tune the SL Buffer parameter to 0.1 globally', correct: false, explain: 'Tuning parameters is legitimate (S14), but tightening the buffer from 0.3 to 0.1 doesn\u2019t meaningfully reduce SL distance \u2014 it shifts SL by 0.2 ATR (a few pips on forex). It also degrades the buffer\u2019s noise-absorption value (S05). For a single trade where SL feels too wide, parameter tuning is the wrong lever; it changes ALL future signals just to fix this one. The right answer is per-trade skip.' },
    ],
  },
  {
    id: 'r4-position-sizing',
    scenario: 'Risk Map tooltip reads:  Risk: 485.1 per unit  \u00B7  Your dollar risk per trade: $200  \u00B7  Instrument: NAS100 (1 contract = $1 per index point)',
    prompt: 'Calculate the correct position size for this trade.',
    options: [
      { id: 'a', text: '0.20 contracts (rounded down to broker minimum)', correct: false, explain: '$200 / 485.1 = 0.412, not 0.20. Halving the result is incorrect math \u2014 you would only halve if your dollar risk were $100 per trade, not $200.' },
      { id: 'b', text: '0.41 contracts (rounded down to broker minimum)', correct: true, explain: 'Correct. Position size = dollar-risk-per-trade / Risk per unit = $200 / 485.1 = 0.412. Round down to 0.41 (or to your broker\u2019s contract increment) to keep the actual dollar risk at or below your stated $200 limit. Per S14, sizing is the operator\u2019s legitimate variable; the engine provides Risk per unit so this calculation removes mid-trade math. The 50/25/25 ladder then scales this position appropriately.' },
      { id: 'c', text: '485.1 contracts (Risk per unit IS the size)', correct: false, explain: 'Risk per unit is the price-distance from entry to SL (a price quantity), not the position size. Treating it as size means risking 485.1 contracts \u00D7 $1 per point \u00D7 485.1 distance = $235,322 per trade \u2014 catastrophic. The correct math divides dollar risk by Risk per unit; doesn\u2019t multiply.' },
      { id: 'd', text: '2.42 contracts ($200 \u00D7 some adjustment factor)', correct: false, explain: 'Multiplying instead of dividing inverts the relationship. Risk per unit going UP should mean smaller position (more dollars risked per contract = fewer contracts to keep total risk at $200). Multiplying $200 by 485.1 / 200 = 1212 contracts implies $588k risk, not $200. Position sizing is always division: dollar-risk \u00F7 price-distance.' },
    ],
  },
  {
    id: 'r5-safety-guard-recognition',
    scenario: 'EUR/USD 1H  \u00B7  Strong 30-bar uptrend  \u00B7  Counter-trend Short signal fires  \u00B7  Risk Map tooltip SL label reads:  &ldquo;1.5 ATR&rdquo;  \u00B7  All other inputs at default Auto mode',
    prompt: 'EUR/USD on Auto mode normally produces &ldquo;Pulse&rdquo; SL labels. This trade shows &ldquo;1.5 ATR&rdquo; instead. What happened?',
    options: [
      { id: 'a', text: 'Manual override to ATR \u2014 someone changed the SL Method input', correct: false, explain: 'Possible but the scenario states &ldquo;all other inputs at default Auto mode&rdquo;, ruling out manual override. ATR-mode SL via override would also be possible, but the scenario constraint excludes it.' },
      { id: 'b', text: 'CIPHER bug \u2014 Auto mode misclassified the asset', correct: false, explain: 'Auto mode for forex always resolves to Pulse first; the only way the result becomes ATR-derived without manual override is the SL Safety Guard (S12). Misclassification would produce a different method label entirely, not specifically ATR.' },
      { id: 'c', text: 'SL Safety Guard fired \u2014 Pulse SL would have been on profit side', correct: true, explain: 'Correct. The 30-bar uptrend has ratcheted the Pulse line above the entry price for this counter-trend short signal. Pulse-derived SL would land on the profit side of entry, which is logically impossible (S12). The safety guard catches this with the Pine check &ldquo;if sl_short &lt;= close: sl_short := sl_short_atr&rdquo; and substitutes ATR SL silently. The label transparency reveals the substitution; the engine handles it automatically.' },
      { id: 'd', text: 'Forex Auto mode bug \u2014 should always pick Pulse', correct: false, explain: 'Forex Auto mode does pick Pulse first, but the safety guard (S12) substitutes ATR when Pulse-derived SL is on the profit side. This is correct engine behavior, not a bug. The guard ensures the SL is always on the loss side; the asset-class default (Pulse) only applies when it produces a logically valid result.' },
    ],
  },
];

// ============================================================
// QUIZ QUESTIONS — 8 multiple-choice. 13 correct: true total
// (5 game + 8 quiz).
// ============================================================
const quizQuestions: {
  id: string;
  question: string;
  options: { id: string; text: string; correct: boolean }[];
  explain: string;
}[] = [
  {
    id: 'q1-tooltip-atoms',
    question: 'How many atoms appear in the Risk Map tooltip block, and what are they (in order)?',
    options: [
      { id: 'a', text: '5: Entry, SL, TP1, TP2, TP3', correct: false },
      { id: 'b', text: '6: Entry, SL, TP1, TP2, TP3, Risk per unit', correct: true },
      { id: 'c', text: '7: Entry, SL, TP1, TP2, TP3, Risk, R-multiplier', correct: false },
      { id: 'd', text: '4: Entry, SL, TP, Risk', correct: false },
    ],
    explain: 'The Risk Map tooltip has exactly 6 atoms in fixed order (S02): Entry [price], SL [price] (method), TP1 [price] (method), TP2 [price] (method), TP3 [price] (method), Risk [price-distance] per unit. The format is locked across every asset and timeframe so operators build muscle memory \u2014 same lines, same order, every signal. Method labels appear in parens after each level price for transparency.',
  },
  {
    id: 'q2-sl-methods',
    question: 'Which SL method places the stop at the recent 10-bar swing low/high minus the buffer?',
    options: [
      { id: 'a', text: 'Pulse method', correct: false },
      { id: 'b', text: 'ATR method', correct: false },
      { id: 'c', text: 'Structure method', correct: true },
      { id: 'd', text: 'Auto method (always picks this)', correct: false },
    ],
    explain: 'Structure method uses ta.lowest(low, 10) for longs and ta.highest(high, 10) for shorts, then applies the 0.3 ATR buffer (S04). The label reads &ldquo;Swing Low&rdquo; or &ldquo;Swing High&rdquo; in the tooltip. The reasoning is structural: if price closes through the recent swing, the bullish/bearish thesis is materially invalidated. Structure SL is the cleanest mechanical definition of &ldquo;the trade is wrong.&rdquo; Auto mode picks Structure for crypto, stocks, indices, and most other asset classes \u2014 but not forex (which gets Pulse).',
  },
  {
    id: 'q3-auto-resolution',
    question: 'In Auto mode, what SL/TP method pair resolves for FOREX assets?',
    options: [
      { id: 'a', text: 'Structure SL + R-Multiple TP', correct: false },
      { id: 'b', text: 'Pulse SL + ATR Targets TP', correct: true },
      { id: 'c', text: 'Structure SL + Structure TP', correct: false },
      { id: 'd', text: 'ATR SL + ATR Targets TP', correct: false },
    ],
    explain: 'Forex (syminfo.type = &ldquo;forex&rdquo;) resolves to Pulse SL + ATR Targets TP (S08, S09). The reasoning: forex moves in tight ranges that respect ATR distances surgically, so Pulse-line invalidation is clean for SLs and ATR Targets align with how forex breathes for TPs. Structure SLs would be unnecessarily wide for forex; R-Multiple TPs would couple to volatile SL distances. Auto mode for SL never resolves to ATR (Pulse and Structure are the only branches).',
  },
  {
    id: 'q4-buffer-threshold',
    question: 'What is the default SL Buffer value (in ATR multiples), and what percentage of typical wicks does it absorb?',
    options: [
      { id: 'a', text: '0.1 ATR \u2014 absorbs ~50% of wicks', correct: false },
      { id: 'b', text: '0.3 ATR \u2014 absorbs 95%+ of wicks', correct: true },
      { id: 'c', text: '0.5 ATR \u2014 absorbs 99%+ of wicks', correct: false },
      { id: 'd', text: '1.0 ATR \u2014 absorbs 100% of wicks', correct: false },
    ],
    explain: 'The default SL Buffer is 0.3 ATR (S05). At this distance, 95%+ of typical intraday wicks are absorbed without meaningfully degrading R/R. Tighter (0.1 ATR) absorbs only ~50% \u2014 high stop-out frequency. Wider (0.5 ATR) absorbs 99%+ but degrades R/R from 1:2 to roughly 1:1.6, a 20% reduction in expected return. The 0.3 figure is the empirical sweet spot, calibrated against historical wick distributions across instruments and timeframes.',
  },
  {
    id: 'q5-scaling-ladder',
    question: 'In the standard scaling ladder, what percentage scales off at TP1, and what happens to the stop on the remaining position?',
    options: [
      { id: 'a', text: '25% off; stop trails', correct: false },
      { id: 'b', text: '50% off; stop moves to break-even on remaining', correct: true },
      { id: 'c', text: '100% off; trade complete', correct: false },
      { id: 'd', text: '0% off (let it ride); stop stays at SL', correct: false },
    ],
    explain: 'At TP1, scale 50% off and move the stop to break-even on the remaining 50% (S07). This converts the trade from &ldquo;risk-on&rdquo; to &ldquo;banked-half-risk-half&rdquo; and mathematically guarantees positive expectation regardless of what happens next. Worst case (BE stop hits): +0.5R locked from the partial. Best case (price runs to TP3 with the 50% balance): +1.75R average. The scale + BE-stop combination is what turns CIPHER from a signal indicator into a system. Skipping it means accepting trades that can still go negative even after winning intermediate targets \u2014 the second-most-common discipline failure (Mistake #2).',
  },
  {
    id: 'q6-safety-guard-trigger',
    question: 'Under what condition does the SL Safety Guard fire and substitute ATR-derived SL?',
    options: [
      { id: 'a', text: 'When ATR is greater than 2.0', correct: false },
      { id: 'b', text: 'When the calculated SL is on the profit side of entry', correct: true },
      { id: 'c', text: 'When TP1 distance is less than SL distance', correct: false },
      { id: 'd', text: 'When the trader manually requests fallback', correct: false },
    ],
    explain: 'The SL Safety Guard fires when the calculated SL ends up on the profit side of entry (S12) \u2014 specifically when sl_long &gt;= close (long) or sl_short &lt;= close (short). This happens most commonly with Pulse SLs during extended trends where the Pulse line ratchets past the entry price. An SL on the profit side is logically impossible (the trade would be &ldquo;stopped out for a gain&rdquo; before any market movement), so the engine substitutes ATR SL automatically. The fallback is invisible to the operator at the tooltip level; they just see a clean SL price.',
  },
  {
    id: 'q7-chart-line-clear',
    question: 'When do the TP/SL chart lines auto-clear from the chart?',
    options: [
      { id: 'a', text: 'After exactly 20 bars elapse from signal', correct: false },
      { id: 'b', text: 'When the next buy or sell signal fires', correct: true },
      { id: 'c', text: 'When the trade hits TP3 or stops out', correct: false },
      { id: 'd', text: 'Never \u2014 they persist until manually cleared', correct: false },
    ],
    explain: 'The TP/SL chart lines auto-clear when the NEXT signal fires (S13), not after a fixed time period. If two hours pass between signals, the lines stay visible the entire time. Lines extend forward 20 bars from the signal bar but don\u2019t expire after 20 bars \u2014 they expire when superseded by a new signal\u2019s plan. This means the chart always shows the most recent signal\u2019s plan, never accumulating clutter. The auto-clear is signal-driven, not bar-driven.',
  },
  {
    id: 'q8-discipline-override',
    question: 'A signal fires with an SL distance you find too wide for your account. According to the discipline (S14), what is the correct response?',
    options: [
      { id: 'a', text: 'Tighten the SL on this trade only', correct: false },
      { id: 'b', text: 'Move all three TPs closer proportionally', correct: false },
      { id: 'c', text: 'Skip the trade or reduce position size', correct: true },
      { id: 'd', text: 'Take the trade and hope it works out', correct: false },
    ],
    explain: 'Per S14, &ldquo;Skip is better than override.&rdquo; If the engine\u2019s SL feels wrong for your account, skip the trade or take it with smaller position size (sized from Risk per unit). Skipping preserves system integrity \u2014 a clean &ldquo;skipped trade with no statistical impact.&rdquo; Overriding individual SL placement converts the system into discretionary trading with unknown long-run statistics. Sizing is the operator\u2019s legitimate variable; level overrides are not. Across hundreds of trades, the discipline distinction is what makes long-run R-expectancy measurable.',
  },
];

// ============================================================
// ANIMSCENE — viewport-gated rAF canvas wrapper
// Mirrors the gold-standard pattern from L11.11 onward.
// ============================================================
function AnimScene({
  draw,
  aspectRatio = 16 / 9,
  className = '',
}: {
  draw: (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => void;
  aspectRatio?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => setVisible(e.isIntersecting)),
      { threshold: 0.05 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      startRef.current = null;
      return;
    }
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const sizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      const w = Math.max(320, rect.width);
      const h = w / aspectRatio;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    sizeCanvas();
    const ro = new ResizeObserver(sizeCanvas);
    ro.observe(container);

    const tick = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const t = (ts - startRef.current) / 1000;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);
      draw(ctx, t, w, h);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      ro.disconnect();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      startRef.current = null;
    };
  }, [visible, draw, aspectRatio]);

  return (
    <div ref={containerRef} className={`w-full rounded-2xl overflow-hidden border border-white/5 bg-black/40 ${className}`}>
      <canvas ref={canvasRef} />
    </div>
  );
}

// ============================================================
// CONFETTI — celebratory particles on cert reveal
// ============================================================
function Confetti({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const colors = ['#FFB300', '#26A69A', '#FFC400', '#FFD54F', '#FFA000'];
    type Particle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      rot: number;
      vrot: number;
      size: number;
      color: string;
      life: number;
    };
    const particles: Particle[] = [];
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
        y: window.innerHeight / 2,
        vx: (Math.random() - 0.5) * 12,
        vy: -Math.random() * 14 - 6,
        rot: Math.random() * Math.PI,
        vrot: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1.0,
      });
    }

    const start = performance.now();
    const tick = () => {
      const elapsed = (performance.now() - start) / 1000;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.45;
        p.rot += p.vrot;
        p.life = Math.max(0, 1 - elapsed / 5);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });
      if (elapsed < 5) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [active]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-40"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
}

// ============================================================
// ANIMATION 1 — WhereTheTradeGoesAnim (S01 GC)
// Two side-by-side panels: LEFT = signal alone (just the entry arrow,
// no plan attached, operator left guessing). RIGHT = same signal with
// full Risk Map auto-attached (entry + SL + TP1/TP2/TP3 lines).
// The point: the engine doesn't just say "go", it says where to.
// ============================================================
function WhereTheTradeGoesAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);

    const cycle = 6.0;
    const phase = (t % cycle) / cycle;
    const showLeft = phase >= 0.05;
    const showRight = phase >= 0.45;

    ctx.fillStyle = 'rgba(255,179,0,0.85)';
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('SIGNAL ALONE  vs  SIGNAL + RISK MAP  \u00B7  THE PRE-BAKED TRADE PLAN', w / 2, 18);

    const padX = w * 0.05;
    const padY = h * 0.16;
    const panelW = (w - padX * 2 - 20) / 2;
    const panelH = h * 0.66;

    type Panel = {
      x: number;
      title: string;
      subtitle: string;
      hasMap: boolean;
      verdict: string;
      verdictColor: string;
      visible: boolean;
      revealAlpha: number;
    };

    const panels: Panel[] = [
      {
        x: padX,
        title: 'SIGNAL ALONE',
        subtitle: 'no plan \u00B7 operator guesses',
        hasMap: false,
        verdict: 'WHERE DO STOPS GO? WHERE\u2019S THE TARGET?',
        verdictColor: '#EF5350',
        visible: showLeft,
        revealAlpha: showLeft ? Math.min(1, (phase - 0.05) / 0.20) : 0,
      },
      {
        x: padX + panelW + 20,
        title: 'SIGNAL + RISK MAP',
        subtitle: 'plan attached \u00B7 levels precomputed',
        hasMap: true,
        verdict: 'ENTRY \u00B7 SL \u00B7 TP1 \u00B7 TP2 \u00B7 TP3 \u00B7 ALL READY',
        verdictColor: '#26A69A',
        visible: showRight,
        revealAlpha: showRight ? Math.min(1, (phase - 0.45) / 0.20) : 0,
      },
    ];

    panels.forEach((p) => {
      ctx.fillStyle = `rgba(255,255,255,${p.visible ? 0.025 * p.revealAlpha : 0})`;
      ctx.strokeStyle = `rgba(255,255,255,${p.visible ? 0.10 * p.revealAlpha : 0})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.rect(p.x, padY, panelW, panelH);
      ctx.fill();
      ctx.stroke();

      if (!p.visible) return;

      ctx.fillStyle = `rgba(255,179,0,${0.95 * p.revealAlpha})`;
      ctx.font = 'bold 11px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(p.title, p.x + panelW / 2, padY + 16);

      ctx.fillStyle = `rgba(255,255,255,${0.5 * p.revealAlpha})`;
      ctx.font = '9px ui-monospace, monospace';
      ctx.fillText(p.subtitle, p.x + panelW / 2, padY + 30);

      // Chart area
      const chartTop = padY + 42;
      const chartBot = padY + panelH - 42;
      const chartH = chartBot - chartTop;
      const chartL = p.x + 14;
      const chartR = p.x + panelW - 14;
      const chartW = chartR - chartL;

      // Synthetic price line
      const N = 40;
      const priceY: number[] = [];
      for (let i = 0; i < N; i++) {
        const x = i / (N - 1);
        const trend = chartBot - chartH * (0.30 + x * 0.30);
        const wiggle = Math.sin(i * 0.7) * chartH * 0.04;
        priceY.push(trend + wiggle);
      }

      // Draw price line
      ctx.strokeStyle = `rgba(255,255,255,${0.65 * p.revealAlpha})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        const x = chartL + (i / (N - 1)) * chartW;
        if (i === 0) ctx.moveTo(x, priceY[i]);
        else ctx.lineTo(x, priceY[i]);
      }
      ctx.stroke();

      // Entry signal arrow (both panels)
      const entryX = chartL + chartW * 0.55;
      const entryY = priceY[Math.floor(N * 0.55)];
      ctx.fillStyle = `rgba(38,166,154,${p.revealAlpha})`;
      ctx.font = 'bold 14px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('\u25B2', entryX, entryY + 16);
      ctx.font = 'bold 9px ui-sans-serif, system-ui';
      ctx.fillText('Long', entryX, entryY + 28);

      if (p.hasMap) {
        // Right panel: full Risk Map render
        const tp1Y = entryY - chartH * 0.18;
        const tp2Y = entryY - chartH * 0.36;
        const tp3Y = entryY - chartH * 0.54;
        const slY = entryY + chartH * 0.18;

        // Entry dotted line
        ctx.strokeStyle = `rgba(255,255,255,${0.70 * p.revealAlpha})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.moveTo(entryX, entryY);
        ctx.lineTo(chartR - 2, entryY);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = `rgba(255,255,255,${0.75 * p.revealAlpha})`;
        ctx.font = '8px ui-monospace, monospace';
        ctx.textAlign = 'left';
        ctx.fillText('Entry', chartR - 28, entryY - 3);

        // SL dashed line (magenta)
        ctx.strokeStyle = `rgba(239,83,80,${0.85 * p.revealAlpha})`;
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(entryX, slY);
        ctx.lineTo(chartR - 2, slY);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = `rgba(239,83,80,${0.95 * p.revealAlpha})`;
        ctx.font = 'bold 8px ui-monospace, monospace';
        ctx.textAlign = 'left';
        ctx.fillText('SL', chartR - 22, slY - 3);

        // TP1/TP2/TP3 dashed lines (teal)
        [['TP1', tp1Y, 0.85], ['TP2', tp2Y, 0.65], ['TP3', tp3Y, 0.50]].forEach(([lbl, ty, a]) => {
          ctx.strokeStyle = `rgba(38,166,154,${(a as number) * p.revealAlpha})`;
          ctx.lineWidth = 1.2;
          ctx.setLineDash([4, 3]);
          ctx.beginPath();
          ctx.moveTo(entryX, ty as number);
          ctx.lineTo(chartR - 2, ty as number);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = `rgba(38,166,154,${0.95 * p.revealAlpha})`;
          ctx.font = 'bold 8px ui-monospace, monospace';
          ctx.textAlign = 'left';
          ctx.fillText(lbl as string, chartR - 25, (ty as number) - 3);
        });
      } else {
        // Left panel: question marks where the levels should be
        const slY = entryY + chartH * 0.18;
        const tp1Y = entryY - chartH * 0.18;

        ctx.fillStyle = `rgba(239,83,80,${0.55 * p.revealAlpha})`;
        ctx.font = 'bold 16px ui-sans-serif, system-ui';
        ctx.textAlign = 'right';
        ctx.fillText('?', chartR - 8, slY);
        ctx.fillText('?', chartR - 8, tp1Y);
        ctx.fillText('?', chartR - 8, entryY - chartH * 0.36);

        ctx.fillStyle = `rgba(255,255,255,${0.40 * p.revealAlpha})`;
        ctx.font = '8px ui-monospace, monospace';
        ctx.textAlign = 'right';
        ctx.fillText('SL = ?', chartR - 18, slY);
        ctx.fillText('TP = ?', chartR - 18, tp1Y);
      }

      // Verdict at bottom
      const vr = parseInt(p.verdictColor.slice(1, 3), 16);
      const vg = parseInt(p.verdictColor.slice(3, 5), 16);
      const vb = parseInt(p.verdictColor.slice(5, 7), 16);
      ctx.fillStyle = `rgba(${vr},${vg},${vb},${0.95 * p.revealAlpha})`;
      ctx.font = 'bold 10px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(p.verdict, p.x + panelW / 2, padY + panelH - 14);
    });

    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.textAlign = 'center';
    ctx.fillText('Every CIPHER signal arrives with its trade plan precomputed.  Operator decides whether, not where.', w / 2, h - 6);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 2 — TooltipAnim (S02)
// Bakes Image 7's verbatim Risk Map tooltip values from the
// NAS100 1D short signal capture: Entry 27076.0, SL 27561.1
// (Swing High), TP1 26590.9 (1R), TP2 26105.8 (2R), TP3 25620.6
// (3R), Risk 485.1 per unit. Six lines reveal sequentially with
// callouts pointing to what each atom communicates.
// ============================================================
function TooltipAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);

    const cycle = 7.0;
    const phase = (t % cycle) / cycle;
    const linesShown = Math.min(7, Math.floor(phase * 8));

    ctx.fillStyle = 'rgba(255,179,0,0.85)';
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('THE 6-LINE RISK MAP TOOLTIP \u2014 EVERY ATOM, ONE HOVER', w / 2, 18);

    const boxX = w * 0.06;
    const boxY = h * 0.18;
    const boxW = w * 0.42;
    const boxH = h * 0.72;

    // Tooltip box
    ctx.fillStyle = 'rgba(15,15,15,0.95)';
    ctx.strokeStyle = 'rgba(255,179,0,0.45)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.rect(boxX, boxY, boxW, boxH);
    ctx.fill();
    ctx.stroke();

    // Header
    ctx.fillStyle = 'rgba(255,179,0,0.95)';
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('\u2550\u2550\u2550 RISK MAP \u2550\u2550\u2550', boxX + 12, boxY + 18);

    type Line = { text: string; color: string; mono: boolean };
    const lines: Line[] = [
      { text: 'Entry: 27076.0',           color: 'rgba(255,255,255,0.95)', mono: true },
      { text: 'SL: 27561.1 (Swing High)', color: '#EF5350',                mono: true },
      { text: 'TP1: 26590.9 (1R)',        color: '#26A69A',                mono: true },
      { text: 'TP2: 26105.8 (2R)',        color: '#26A69A',                mono: true },
      { text: 'TP3: 25620.6 (3R)',        color: '#26A69A',                mono: true },
      { text: 'Risk: 485.1 per unit',     color: '#FFB300',                mono: true },
    ];

    const lineH = 22;
    const startY = boxY + 42;

    lines.forEach((line, i) => {
      if (i >= linesShown) return;
      const y = startY + i * lineH;
      ctx.fillStyle = line.color;
      ctx.font = `${i === 0 ? 'bold ' : ''}11px ${line.mono ? 'ui-monospace, monospace' : 'ui-sans-serif, system-ui'}`;
      ctx.textAlign = 'left';
      ctx.fillText(line.text, boxX + 12, y);
    });

    // Bottom note in tooltip
    if (linesShown >= 6) {
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.font = 'italic 9px ui-sans-serif, system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('NAS100 1D \u00B7 Short Snap', boxX + 12, boxY + boxH - 12);
    }

    // Right-side callouts
    const calloutX = w * 0.54;
    type Callout = { y: number; label: string; tip: string; visible: boolean };
    const callouts: Callout[] = [
      { y: startY,             label: 'ENTRY PRICE',    tip: 'where the signal fired \u2014 your fill reference',                visible: linesShown > 0 },
      { y: startY + lineH * 1, label: 'STOP LOSS',      tip: 'method label in parens \u2014 "Swing High" = Structure mode',     visible: linesShown > 1 },
      { y: startY + lineH * 2, label: 'TAKE PROFIT 1',  tip: '"1R" label = R-Multiple mode \u2014 first scale-out target',      visible: linesShown > 2 },
      { y: startY + lineH * 3, label: 'TAKE PROFIT 2',  tip: '"2R" \u2014 second scale-out, midpoint of plan',                  visible: linesShown > 3 },
      { y: startY + lineH * 4, label: 'TAKE PROFIT 3',  tip: '"3R" \u2014 final target, runners ride here',                     visible: linesShown > 4 },
      { y: startY + lineH * 5, label: 'RISK PER UNIT',  tip: 'absolute distance entry to SL \u2014 size your position from this', visible: linesShown > 5 },
    ];

    callouts.forEach((c) => {
      if (!c.visible) return;
      ctx.strokeStyle = 'rgba(255,179,0,0.30)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(boxX + boxW + 4, c.y - 4);
      ctx.lineTo(calloutX - 6, c.y - 4);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255,179,0,0.85)';
      ctx.font = 'bold 9px ui-sans-serif, system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(c.label, calloutX, c.y - 6);

      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = '9px ui-sans-serif, system-ui';
      ctx.fillText(c.tip, calloutX, c.y + 5);
    });

    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.textAlign = 'center';
    ctx.fillText('Six atoms in one tooltip.  The trade plan is read, not constructed.', w / 2, h - 6);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 3 — InputsAnim (S03)
// Walks through the CIPHER RISK MAP input group from Image 10:
// the three toggles (TP/SL in Tooltip, TP Lines on Chart, SL Line
// on Chart), Stop Loss Method dropdown (Auto/Structure/Pulse/ATR),
// SL Buffer (0.3 ATR), Take Profit Method dropdown (Auto/R-Multiple/
// Structure/ATR Targets), TP1/TP2/TP3 multipliers (1/2/3).
// Each input row reveals sequentially with its purpose annotated.
// ============================================================
function InputsAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);

    const cycle = 9.0;
    const phase = (t % cycle) / cycle;
    const rowsShown = Math.min(8, Math.floor(phase * 9));

    ctx.fillStyle = 'rgba(255,179,0,0.85)';
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('CIPHER RISK MAP INPUTS  \u00B7  THREE TOGGLES + TWO METHODS + THREE TARGETS', w / 2, 18);

    // Inputs panel mock
    const panelX = w * 0.08;
    const panelY = h * 0.16;
    const panelW = w * 0.50;
    const panelH = h * 0.74;

    ctx.fillStyle = 'rgba(20,20,30,0.95)';
    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect(panelX, panelY, panelW, panelH);
    ctx.fill();
    ctx.stroke();

    // Group header
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 9px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('\u2500\u2500\u2500 CIPHER RISK MAP \u2500\u2500\u2500', panelX + panelW / 2, panelY + 18);

    type Row = { y: number; type: 'toggle' | 'dropdown' | 'value'; label: string; value: string; tip: string };
    const rows: Row[] = [
      { y: panelY + 42,  type: 'toggle',   label: 'TP/SL in Tooltip',      value: 'ON',   tip: 'shows the 6-line Risk Map block in every signal\u2019s hover' },
      { y: panelY + 70,  type: 'toggle',   label: 'TP Lines on Chart',     value: 'ON',   tip: 'draws TP1/TP2/TP3 dashed lines at signal moments' },
      { y: panelY + 98,  type: 'toggle',   label: 'SL Line on Chart',      value: 'ON',   tip: 'draws the SL dashed magenta line at signal moments' },
      { y: panelY + 130, type: 'dropdown', label: 'Stop Loss Method',      value: 'Auto', tip: 'Auto / Structure / Pulse / ATR' },
      { y: panelY + 160, type: 'value',    label: 'ATR Multiplier',        value: '1.5',  tip: 'used only when SL Method = ATR' },
      { y: panelY + 188, type: 'value',    label: 'SL Buffer',             value: '0.3',  tip: 'breathing room in ATR multiples to avoid wick clips' },
      { y: panelY + 218, type: 'dropdown', label: 'Take Profit Method',    value: 'Auto', tip: 'Auto / R-Multiple / Structure / ATR Targets' },
      { y: panelY + 248, type: 'value',    label: 'TP1/TP2/TP3 Targets',   value: '1 / 2 / 3', tip: 'R-multiples or ATR multiples by mode' },
    ];

    const calloutX = panelX + panelW + 24;

    rows.forEach((r, i) => {
      if (i >= rowsShown) return;
      const a = Math.min(1, ((phase - i / 9) / 0.06) * 1);

      // Label
      ctx.fillStyle = `rgba(255,255,255,${0.85 * a})`;
      ctx.font = '10px ui-sans-serif, system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(r.label, panelX + 14, r.y);

      // Value
      const valueX = panelX + panelW - 70;
      if (r.type === 'toggle') {
        const boxW = 22, boxH = 12;
        ctx.fillStyle = `rgba(255,179,0,${0.20 * a})`;
        ctx.fillRect(valueX, r.y - 9, boxW, boxH);
        ctx.strokeStyle = `rgba(255,179,0,${0.55 * a})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.rect(valueX, r.y - 9, boxW, boxH);
        ctx.stroke();
        ctx.fillStyle = `rgba(255,179,0,${0.95 * a})`;
        ctx.font = 'bold 8px ui-monospace, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('\u2713', valueX + boxW / 2, r.y);
      } else if (r.type === 'dropdown') {
        const boxW = 56, boxH = 14;
        ctx.fillStyle = `rgba(255,255,255,${0.05 * a})`;
        ctx.fillRect(valueX - 16, r.y - 10, boxW, boxH);
        ctx.strokeStyle = `rgba(255,255,255,${0.20 * a})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.rect(valueX - 16, r.y - 10, boxW, boxH);
        ctx.stroke();
        ctx.fillStyle = `rgba(255,255,255,${0.85 * a})`;
        ctx.font = '9px ui-sans-serif, system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(r.value, valueX + 12, r.y);
        // dropdown arrow
        ctx.fillText('\u25BE', valueX + 30, r.y);
      } else {
        const boxW = 56, boxH = 14;
        ctx.fillStyle = `rgba(255,255,255,${0.05 * a})`;
        ctx.fillRect(valueX - 16, r.y - 10, boxW, boxH);
        ctx.strokeStyle = `rgba(255,255,255,${0.20 * a})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.rect(valueX - 16, r.y - 10, boxW, boxH);
        ctx.stroke();
        ctx.fillStyle = `rgba(255,255,255,${0.85 * a})`;
        ctx.font = '9px ui-monospace, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(r.value, valueX + 12, r.y);
      }

      // Callout
      ctx.strokeStyle = `rgba(255,179,0,${0.25 * a})`;
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(panelX + panelW + 4, r.y - 3);
      ctx.lineTo(calloutX - 4, r.y - 3);
      ctx.stroke();
      ctx.fillStyle = `rgba(255,255,255,${0.55 * a})`;
      ctx.font = '9px ui-sans-serif, system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(r.tip, calloutX, r.y);
    });

    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.textAlign = 'center';
    ctx.fillText('Defaults: TP/SL in Tooltip ON, lines OFF, methods Auto, multipliers 1/2/3.', w / 2, h - 6);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 4 — SLMethodsAnim (S04)
// Three side-by-side panels showing the same entry with three
// different SL methods: STRUCTURE (SL at recent swing low minus
// buffer), PULSE (SL at pulse_line minus buffer), ATR (SL at
// close minus atr × 1.5). Same chart, three different SL prices,
// three different risk distances.
// ============================================================
function SLMethodsAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);

    const cycle = 5.0;
    const phase = (t % cycle) / cycle;
    const showA = phase >= 0.05;
    const showB = phase >= 0.30;
    const showC = phase >= 0.55;

    ctx.fillStyle = 'rgba(255,179,0,0.85)';
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('THREE SL METHODS  \u00B7  STRUCTURE  \u00B7  PULSE  \u00B7  ATR  \u00B7  SAME ENTRY, THREE STOPS', w / 2, 18);

    const padX = w * 0.04;
    const padY = h * 0.16;
    const panelW = (w - padX * 2 - 30) / 3;
    const panelH = h * 0.66;

    type Panel = {
      x: number;
      label: string;
      formula: string;
      slDist: number;
      visible: boolean;
      revealAlpha: number;
    };

    const panels: Panel[] = [
      { x: padX,                         label: 'STRUCTURE', formula: 'swing_low \u2212 buffer', slDist: 0.45, visible: showA, revealAlpha: showA ? Math.min(1, (phase - 0.05) / 0.20) : 0 },
      { x: padX + panelW + 15,           label: 'PULSE',     formula: 'pulse_line \u2212 buffer', slDist: 0.30, visible: showB, revealAlpha: showB ? Math.min(1, (phase - 0.30) / 0.20) : 0 },
      { x: padX + panelW * 2 + 30,       label: 'ATR',       formula: 'close \u2212 1.5 ATR',     slDist: 0.55, visible: showC, revealAlpha: showC ? Math.min(1, (phase - 0.55) / 0.20) : 0 },
    ];

    panels.forEach((p) => {
      ctx.fillStyle = `rgba(255,255,255,${p.visible ? 0.025 * p.revealAlpha : 0})`;
      ctx.strokeStyle = `rgba(255,255,255,${p.visible ? 0.10 * p.revealAlpha : 0})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.rect(p.x, padY, panelW, panelH);
      ctx.fill();
      ctx.stroke();

      if (!p.visible) return;

      // Title
      ctx.fillStyle = `rgba(255,179,0,${0.95 * p.revealAlpha})`;
      ctx.font = 'bold 11px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(p.label, p.x + panelW / 2, padY + 16);

      // Formula
      ctx.fillStyle = `rgba(255,255,255,${0.55 * p.revealAlpha})`;
      ctx.font = '9px ui-monospace, monospace';
      ctx.fillText(p.formula, p.x + panelW / 2, padY + 30);

      // Mini chart
      const chartTop = padY + 42;
      const chartBot = padY + panelH - 36;
      const chartH = chartBot - chartTop;
      const chartL = p.x + 10;
      const chartR = p.x + panelW - 10;
      const chartW = chartR - chartL;

      // Synthetic price wandering near a swing low
      const N = 20;
      const priceY: number[] = [];
      for (let i = 0; i < N; i++) {
        const x = i / (N - 1);
        // Down then up shape; swing low at i=8
        const v = x < 0.4 ? chartTop + chartH * (0.30 + x * 0.5)
                : x < 0.5 ? chartBot - chartH * 0.10
                : chartTop + chartH * (0.55 - (x - 0.5) * 0.5);
        priceY.push(v);
      }

      ctx.strokeStyle = `rgba(255,255,255,${0.65 * p.revealAlpha})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        const x = chartL + (i / (N - 1)) * chartW;
        if (i === 0) ctx.moveTo(x, priceY[i]);
        else ctx.lineTo(x, priceY[i]);
      }
      ctx.stroke();

      // Entry at right side
      const entryX = chartL + chartW * 0.85;
      const entryY = priceY[Math.floor(N * 0.85)];

      // Entry dotted
      ctx.strokeStyle = `rgba(255,255,255,${0.85 * p.revealAlpha})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(chartL + 4, entryY);
      ctx.lineTo(chartR - 4, entryY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = `rgba(255,255,255,${0.95 * p.revealAlpha})`;
      ctx.font = 'bold 8px ui-monospace, monospace';
      ctx.textAlign = 'left';
      ctx.fillText('Entry', chartL + 6, entryY - 3);

      // SL line — distance varies by method
      const slY = entryY + chartH * p.slDist;
      ctx.strokeStyle = `rgba(239,83,80,${0.85 * p.revealAlpha})`;
      ctx.lineWidth = 1.3;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(chartL + 4, slY);
      ctx.lineTo(chartR - 4, slY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = `rgba(239,83,80,${0.95 * p.revealAlpha})`;
      ctx.font = 'bold 8px ui-monospace, monospace';
      ctx.textAlign = 'left';
      ctx.fillText('SL', chartL + 6, slY - 3);

      // Risk box (red shaded)
      ctx.fillStyle = `rgba(239,83,80,${0.10 * p.revealAlpha})`;
      ctx.fillRect(chartL + 4, entryY, chartR - chartL - 8, slY - entryY);

      // Risk distance label
      ctx.fillStyle = `rgba(239,83,80,${0.85 * p.revealAlpha})`;
      ctx.font = 'bold 9px ui-monospace, monospace';
      ctx.textAlign = 'center';
      const distLabel = p.slDist === 0.30 ? 'TIGHTEST' : p.slDist === 0.45 ? 'STRUCTURAL' : 'WIDEST';
      ctx.fillText(distLabel, p.x + panelW / 2, padY + panelH - 18);
    });

    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.textAlign = 'center';
    ctx.fillText('All three add a 0.3 ATR buffer to avoid wick clips.  Auto mode picks per asset class.', w / 2, h - 6);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 5 — BufferAnim (S05)
// Two side-by-side panels showing the same swing low entry with
// (LEFT) SL exactly at the swing — frequent wick clips
// (RIGHT) SL at swing minus 0.3 ATR buffer — wicks absorbed
// Visualizes why the buffer matters and how 0.3 ATR is empirically
// calibrated to absorb typical noise without degrading R/R.
// ============================================================
function BufferAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);

    const cycle = 6.0;
    const phase = (t % cycle) / cycle;
    const showLeft = phase >= 0.05;
    const showRight = phase >= 0.50;

    ctx.fillStyle = 'rgba(255,179,0,0.85)';
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('THE 0.3 ATR BUFFER  \u00B7  WICK CLIPS  vs  ABSORBED NOISE', w / 2, 18);

    const padX = w * 0.05;
    const padY = h * 0.16;
    const panelW = (w - padX * 2 - 20) / 2;
    const panelH = h * 0.66;

    type Panel = {
      x: number;
      title: string;
      subtitle: string;
      hasBuffer: boolean;
      verdict: string;
      verdictColor: string;
      visible: boolean;
      revealAlpha: number;
    };

    const panels: Panel[] = [
      { x: padX,                title: 'NO BUFFER',         subtitle: 'SL at swing exactly',     hasBuffer: false, verdict: 'STOPPED OUT BY WICK NOISE',  verdictColor: '#EF5350', visible: showLeft,  revealAlpha: showLeft ? Math.min(1, (phase - 0.05) / 0.20) : 0 },
      { x: padX + panelW + 20,  title: 'WITH 0.3 ATR BUFFER', subtitle: 'SL at swing \u2212 0.3 ATR', hasBuffer: true,  verdict: 'WICKS ABSORBED \u2014 TRADE CONTINUES', verdictColor: '#26A69A', visible: showRight, revealAlpha: showRight ? Math.min(1, (phase - 0.50) / 0.20) : 0 },
    ];

    panels.forEach((p) => {
      ctx.fillStyle = `rgba(255,255,255,${p.visible ? 0.025 * p.revealAlpha : 0})`;
      ctx.strokeStyle = `rgba(255,255,255,${p.visible ? 0.10 * p.revealAlpha : 0})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.rect(p.x, padY, panelW, panelH);
      ctx.fill();
      ctx.stroke();

      if (!p.visible) return;

      ctx.fillStyle = `rgba(255,179,0,${0.95 * p.revealAlpha})`;
      ctx.font = 'bold 11px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(p.title, p.x + panelW / 2, padY + 16);

      ctx.fillStyle = `rgba(255,255,255,${0.55 * p.revealAlpha})`;
      ctx.font = '9px ui-monospace, monospace';
      ctx.fillText(p.subtitle, p.x + panelW / 2, padY + 30);

      // Chart area
      const chartTop = padY + 42;
      const chartBot = padY + panelH - 36;
      const chartH = chartBot - chartTop;
      const chartL = p.x + 10;
      const chartR = p.x + panelW - 10;
      const chartW = chartR - chartL;

      // Synthetic price with a swing low + multiple wicks below
      const N = 30;
      type Bar = { high: number; low: number; close: number };
      const bars: Bar[] = [];
      for (let i = 0; i < N; i++) {
        const x = i / (N - 1);
        let mid: number;
        if (x < 0.30) mid = chartTop + chartH * (0.30 + x * 0.7);
        else if (x < 0.40) mid = chartBot - chartH * 0.18;
        else if (x < 0.55) mid = chartTop + chartH * (0.55 - (x - 0.40) * 0.6);
        else if (x < 0.75) mid = chartBot - chartH * (0.18 + Math.sin((x - 0.55) * 12) * 0.04);
        else mid = chartTop + chartH * (0.50 - (x - 0.75) * 0.8);

        const wickRange = chartH * 0.06;
        // Some bars have abnormally deep wicks below
        const deepWick = (i === 18 || i === 22) ? chartH * 0.08 : 0;
        bars.push({ high: mid - wickRange, low: mid + wickRange + deepWick, close: mid });
      }

      // Find swing low (the deepest low at i ~= 8)
      const swingLowY = bars[8].low;

      // SL line position
      const slY = p.hasBuffer ? swingLowY + chartH * 0.05 : swingLowY;

      // SL band (red shaded zone)
      ctx.fillStyle = `rgba(239,83,80,${0.10 * p.revealAlpha})`;
      ctx.fillRect(chartL + 4, slY, chartW - 8, chartBot - slY);

      // Draw bars (price action)
      for (let i = 0; i < N; i++) {
        const x = chartL + (i / (N - 1)) * chartW;
        const b = bars[i];
        // wick
        ctx.strokeStyle = `rgba(255,255,255,${0.70 * p.revealAlpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, b.high);
        ctx.lineTo(x, b.low);
        ctx.stroke();

        // Highlight bars where wick clips SL (only relevant on noBuffer panel)
        const wickClipped = b.low > slY;
        if (wickClipped && !p.hasBuffer) {
          ctx.strokeStyle = `rgba(239,83,80,${0.95 * p.revealAlpha})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(x, b.high);
          ctx.lineTo(x, b.low);
          ctx.stroke();
          // X marker
          ctx.fillStyle = `rgba(239,83,80,${0.95 * p.revealAlpha})`;
          ctx.font = 'bold 9px ui-monospace, monospace';
          ctx.textAlign = 'center';
          ctx.fillText('\u2715', x, b.low + 12);
        }
      }

      // SL line
      ctx.strokeStyle = `rgba(239,83,80,${0.85 * p.revealAlpha})`;
      ctx.lineWidth = 1.4;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(chartL + 4, slY);
      ctx.lineTo(chartR - 4, slY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = `rgba(239,83,80,${0.95 * p.revealAlpha})`;
      ctx.font = 'bold 9px ui-monospace, monospace';
      ctx.textAlign = 'left';
      ctx.fillText('SL', chartL + 6, slY - 3);

      // Swing low reference line (only show on right panel for clarity)
      if (p.hasBuffer) {
        ctx.strokeStyle = `rgba(255,255,255,${0.30 * p.revealAlpha})`;
        ctx.lineWidth = 0.8;
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.moveTo(chartL + 4, swingLowY);
        ctx.lineTo(chartR - 4, swingLowY);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = `rgba(255,255,255,${0.55 * p.revealAlpha})`;
        ctx.font = '8px ui-monospace, monospace';
        ctx.textAlign = 'left';
        ctx.fillText('Swing Low', chartL + 6, swingLowY - 3);

        // Buffer arrow showing the gap
        ctx.strokeStyle = `rgba(255,179,0,${0.65 * p.revealAlpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(chartR - 30, swingLowY);
        ctx.lineTo(chartR - 30, slY);
        ctx.stroke();
        ctx.fillStyle = `rgba(255,179,0,${0.95 * p.revealAlpha})`;
        ctx.font = 'bold 8px ui-monospace, monospace';
        ctx.textAlign = 'right';
        ctx.fillText('0.3 ATR', chartR - 6, (swingLowY + slY) / 2 + 3);
      }

      // Verdict
      const vr = parseInt(p.verdictColor.slice(1, 3), 16);
      const vg = parseInt(p.verdictColor.slice(3, 5), 16);
      const vb = parseInt(p.verdictColor.slice(5, 7), 16);
      ctx.fillStyle = `rgba(${vr},${vg},${vb},${0.95 * p.revealAlpha})`;
      ctx.font = 'bold 10px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(p.verdict, p.x + panelW / 2, padY + panelH - 14);
    });

    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.textAlign = 'center';
    ctx.fillText('0.3 ATR is empirically calibrated  \u00B7  tighter clips wicks  \u00B7  wider degrades R/R', w / 2, h - 6);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 6 — TPMethodsAnim (S06)
// Three side-by-side panels showing the same entry with three
// different TP methods producing different TP1/TP2/TP3 ladders:
// R-MULTIPLE (entry + sl_dist × 1/2/3 — uniform spacing)
// STRUCTURE (entry + nearest S/R levels — irregular spacing)
// ATR TARGETS (entry + atr × 1/2/3 — uniform but ATR-based)
// ============================================================
function TPMethodsAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);

    const cycle = 6.5;
    const phase = (t % cycle) / cycle;
    const showA = phase >= 0.05;
    const showB = phase >= 0.30;
    const showC = phase >= 0.55;

    ctx.fillStyle = 'rgba(255,179,0,0.85)';
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('THREE TP METHODS  \u00B7  R-MULTIPLE  \u00B7  STRUCTURE  \u00B7  ATR TARGETS', w / 2, 18);

    const padX = w * 0.04;
    const padY = h * 0.16;
    const panelW = (w - padX * 2 - 30) / 3;
    const panelH = h * 0.66;

    type Panel = {
      x: number;
      label: string;
      formula: string;
      tpYs: number[];
      tpLabels: string[];
      visible: boolean;
      revealAlpha: number;
    };

    // tpYs are RELATIVE positions (0=entry, 1=top of chart) — uniform vs structural
    const panels: Panel[] = [
      {
        x: padX,
        label: 'R-MULTIPLE',
        formula: 'entry + sl_dist \u00D7 [1, 2, 3]',
        tpYs: [0.20, 0.40, 0.60], // uniform 1R/2R/3R spacing
        tpLabels: ['1R', '2R', '3R'],
        visible: showA,
        revealAlpha: showA ? Math.min(1, (phase - 0.05) / 0.20) : 0,
      },
      {
        x: padX + panelW + 15,
        label: 'STRUCTURE',
        formula: 'next S/R levels (na fallback to R)',
        tpYs: [0.18, 0.45, 0.72], // irregular structural levels
        tpLabels: ['S/R', 'S/R', 'S/R'],
        visible: showB,
        revealAlpha: showB ? Math.min(1, (phase - 0.30) / 0.20) : 0,
      },
      {
        x: padX + panelW * 2 + 30,
        label: 'ATR TARGETS',
        formula: 'entry + atr \u00D7 [1, 2, 3]',
        tpYs: [0.22, 0.42, 0.62], // uniform ATR spacing (slightly different from R-Mult)
        tpLabels: ['1.0 ATR', '2.0 ATR', '3.0 ATR'],
        visible: showC,
        revealAlpha: showC ? Math.min(1, (phase - 0.55) / 0.20) : 0,
      },
    ];

    panels.forEach((p) => {
      ctx.fillStyle = `rgba(255,255,255,${p.visible ? 0.025 * p.revealAlpha : 0})`;
      ctx.strokeStyle = `rgba(255,255,255,${p.visible ? 0.10 * p.revealAlpha : 0})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.rect(p.x, padY, panelW, panelH);
      ctx.fill();
      ctx.stroke();

      if (!p.visible) return;

      // Title
      ctx.fillStyle = `rgba(255,179,0,${0.95 * p.revealAlpha})`;
      ctx.font = 'bold 11px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(p.label, p.x + panelW / 2, padY + 16);

      // Formula
      ctx.fillStyle = `rgba(255,255,255,${0.55 * p.revealAlpha})`;
      ctx.font = '8px ui-monospace, monospace';
      ctx.fillText(p.formula, p.x + panelW / 2, padY + 30);

      // Mini chart area
      const chartTop = padY + 42;
      const chartBot = padY + panelH - 30;
      const chartH = chartBot - chartTop;
      const chartL = p.x + 10;
      const chartR = p.x + panelW - 10;

      // Entry at bottom of chart area
      const entryY = chartBot - chartH * 0.10;

      // SL below (just hinted at)
      const slY = entryY + chartH * 0.06;

      // Entry dotted
      ctx.strokeStyle = `rgba(255,255,255,${0.85 * p.revealAlpha})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(chartL + 4, entryY);
      ctx.lineTo(chartR - 4, entryY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = `rgba(255,255,255,${0.95 * p.revealAlpha})`;
      ctx.font = 'bold 8px ui-monospace, monospace';
      ctx.textAlign = 'left';
      ctx.fillText('Entry', chartL + 6, entryY - 3);

      // SL hint
      ctx.strokeStyle = `rgba(239,83,80,${0.55 * p.revealAlpha})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(chartL + 4, slY);
      ctx.lineTo(chartR - 4, slY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = `rgba(239,83,80,${0.85 * p.revealAlpha})`;
      ctx.font = 'bold 7px ui-monospace, monospace';
      ctx.fillText('SL', chartL + 6, slY + 8);

      // Three TP lines at relative positions
      const tpAlphas = [0.95, 0.75, 0.60];
      p.tpYs.forEach((yRel, i) => {
        const tpY = entryY - chartH * yRel;
        ctx.strokeStyle = `rgba(38,166,154,${tpAlphas[i] * p.revealAlpha})`;
        ctx.lineWidth = 1.3;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(chartL + 4, tpY);
        ctx.lineTo(chartR - 4, tpY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Label
        ctx.fillStyle = `rgba(38,166,154,${tpAlphas[i] * p.revealAlpha})`;
        ctx.font = 'bold 8px ui-monospace, monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`TP${i + 1}  ${p.tpLabels[i]}`, chartL + 6, tpY - 3);
      });

      // Spacing characteristic note
      ctx.fillStyle = `rgba(255,255,255,${0.55 * p.revealAlpha})`;
      ctx.font = '9px ui-monospace, monospace';
      ctx.textAlign = 'center';
      const spacingChar = p.label === 'STRUCTURE' ? 'irregular spacing' : 'uniform spacing';
      ctx.fillText(spacingChar, p.x + panelW / 2, padY + panelH - 12);
    });

    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.textAlign = 'center';
    ctx.fillText('Same entry, three TP ladders.  Structure = real S/R magnets; R-Multiple = pure R/R math; ATR = volatility-based.', w / 2, h - 6);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 7 — TPLadderAnim (S07)
// Visualizes the TP1/TP2/TP3 scaling ladder over time:
// - At entry: full position
// - At TP1: scale 50% off, move stop to break-even
// - At TP2: scale 25% off, trail stop
// - At TP3: close remaining 25%, trade complete
// Animation walks through the position sizing transitions.
// ============================================================
function TPLadderAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);

    const cycle = 8.0;
    const phase = (t % cycle) / cycle;

    ctx.fillStyle = 'rgba(255,179,0,0.85)';
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('TP1 / TP2 / TP3 LADDER  \u00B7  SCALE 50% \u2192 25% \u2192 25%  \u00B7  TRAIL STOP', w / 2, 18);

    const padX = w * 0.06;
    const padY = h * 0.16;
    const chartW = w - padX * 2;
    const chartH = h * 0.62;

    ctx.fillStyle = 'rgba(255,255,255,0.015)';
    ctx.fillRect(padX, padY, chartW, chartH);

    // Entry, SL, TP levels
    const entryY = padY + chartH * 0.75;
    const slY = padY + chartH * 0.92;
    const tp1Y = padY + chartH * 0.55;
    const tp2Y = padY + chartH * 0.35;
    const tp3Y = padY + chartH * 0.15;

    // Determine current price progression
    // 0-0.20: at entry (full position)
    // 0.20-0.40: walking up to TP1
    // 0.40-0.60: walking from TP1 to TP2
    // 0.60-0.80: walking from TP2 to TP3
    // 0.80-1.00: complete

    let priceY: number;
    let positionPct: number;
    let stopY: number;
    let stopLabel: string;
    let stage: string;

    if (phase < 0.20) {
      const p = phase / 0.20;
      priceY = entryY - (entryY - tp1Y) * p * 0.30;
      positionPct = 100;
      stopY = slY;
      stopLabel = 'SL';
      stage = 'ENTRY \u00B7 100% POSITION \u00B7 SL active';
    } else if (phase < 0.40) {
      const p = (phase - 0.20) / 0.20;
      priceY = entryY - (entryY - tp1Y) * (0.30 + p * 0.70);
      positionPct = 100;
      stopY = slY;
      stopLabel = 'SL';
      stage = 'APPROACHING TP1 \u00B7 100% POSITION';
    } else if (phase < 0.60) {
      const p = (phase - 0.40) / 0.20;
      priceY = tp1Y - (tp1Y - tp2Y) * p;
      positionPct = 50;
      stopY = entryY;
      stopLabel = 'BE (Entry)';
      stage = 'TP1 HIT \u00B7 50% SCALED OFF \u00B7 STOP TO BREAK-EVEN';
    } else if (phase < 0.80) {
      const p = (phase - 0.60) / 0.20;
      priceY = tp2Y - (tp2Y - tp3Y) * p;
      positionPct = 25;
      // Trail stop midway between BE and TP1
      stopY = entryY - (entryY - tp1Y) * 0.6;
      stopLabel = 'TRAIL';
      stage = 'TP2 HIT \u00B7 25% MORE OFF \u00B7 STOP TRAILING';
    } else {
      priceY = tp3Y;
      positionPct = 0;
      stopY = entryY - (entryY - tp1Y) * 0.6;
      stopLabel = 'TRAIL';
      stage = 'TP3 HIT \u00B7 100% CLOSED \u00B7 TRADE COMPLETE';
    }

    // Draw level lines
    type Level = { y: number; label: string; color: string; pricelabel: string };
    const levels: Level[] = [
      { y: tp3Y,  label: 'TP3', color: '#26A69A', pricelabel: '3R' },
      { y: tp2Y,  label: 'TP2', color: '#26A69A', pricelabel: '2R' },
      { y: tp1Y,  label: 'TP1', color: '#26A69A', pricelabel: '1R' },
      { y: entryY, label: 'Entry', color: '#FFFFFF', pricelabel: '' },
      { y: slY,    label: 'SL',  color: '#EF5350', pricelabel: '' },
    ];

    levels.forEach((lv) => {
      ctx.strokeStyle = lv.color === '#FFFFFF' ? 'rgba(255,255,255,0.65)' : `${lv.color}AA`;
      ctx.lineWidth = lv.color === '#FFFFFF' ? 1 : 1.2;
      ctx.setLineDash(lv.color === '#FFFFFF' ? [2, 3] : [4, 3]);
      ctx.beginPath();
      ctx.moveTo(padX + 8, lv.y);
      ctx.lineTo(padX + chartW - 8, lv.y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = lv.color;
      ctx.font = 'bold 9px ui-monospace, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(lv.label, padX + 12, lv.y - 3);
      if (lv.pricelabel) {
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.textAlign = 'right';
        ctx.fillText(lv.pricelabel, padX + chartW - 14, lv.y - 3);
      }
    });

    // Active stop highlight (different from SL when trailing/BE)
    if (stopLabel !== 'SL') {
      ctx.strokeStyle = '#FFB300';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      ctx.beginPath();
      ctx.moveTo(padX + 8, stopY);
      ctx.lineTo(padX + chartW - 8, stopY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#FFB300';
      ctx.font = 'bold 9px ui-monospace, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`STOP \u2192 ${stopLabel}`, padX + 12, stopY - 3);
    }

    // Price marker
    const priceX = padX + chartW * (0.10 + phase * 0.80);
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(priceX, priceY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0a0a0a';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Position size readout
    const readoutY = padY + chartH + 22;
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '10px ui-sans-serif, system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('POSITION:', padX + 12, readoutY);

    // Position bar visualization
    const barX = padX + 90;
    const barW = 100;
    const barH = 12;
    const barY = readoutY - 9;

    ctx.fillStyle = 'rgba(255,255,255,0.10)';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = positionPct > 50 ? '#26A69A' : positionPct > 25 ? '#FFB300' : positionPct > 0 ? '#EF5350' : 'rgba(255,255,255,0.30)';
    ctx.fillRect(barX, barY, barW * (positionPct / 100), barH);
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect(barX, barY, barW, barH);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 11px ui-monospace, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`${positionPct}%`, barX + barW + 10, readoutY);

    // Stage banner
    const stageY = readoutY + 24;
    ctx.fillStyle = 'rgba(255,179,0,0.95)';
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(stage, w / 2, stageY);

    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.textAlign = 'center';
    ctx.fillText('Scale 50% at TP1 + stop to BE.  Scale 25% at TP2 + trail.  Close last 25% at TP3.', w / 2, h - 6);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 8 — AutoModeAnim (S08)
// Decision tree visualization showing how syminfo.type drives
// the SL and TP method resolution. Three branches:
// CRYPTO → SL Structure + TP R-Multiple
// FOREX  → SL Pulse + TP ATR Targets
// ELSE   → SL Structure + TP Structure (Stocks/Indices/Commodities)
// Cycles through three example tickers showing the routing.
// ============================================================
function AutoModeAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);

    const cycle = 9.0;
    const phase = (t % cycle) / cycle;
    const sliceIdx = Math.floor(phase * 3);

    type Scenario = {
      ticker: string;
      symType: string;
      slMethod: string;
      tpMethod: string;
      reason: string;
      branchIdx: number;
    };

    const scenarios: Scenario[] = [
      { ticker: 'BTCUSD',     symType: 'crypto',  slMethod: 'Structure',     tpMethod: 'R-Multiple',   reason: 'volatile wicks need structural protection',         branchIdx: 0 },
      { ticker: 'EURUSD',     symType: 'forex',   slMethod: 'Pulse',         tpMethod: 'ATR Targets',  reason: 'tight ranges \u00B7 Pulse invalidation is clean',   branchIdx: 1 },
      { ticker: 'NAS100',     symType: 'index',   slMethod: 'Structure',     tpMethod: 'Structure',    reason: 'institutional swing levels matter',                 branchIdx: 2 },
    ];

    const current = scenarios[Math.min(sliceIdx, scenarios.length - 1)];

    ctx.fillStyle = 'rgba(255,179,0,0.85)';
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('AUTO MODE  \u00B7  syminfo.type DRIVES METHOD RESOLUTION', w / 2, 18);

    // Input row at top
    const inputY = 40;
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '10px ui-sans-serif, system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('TICKER:', w * 0.06, inputY);
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.font = 'bold 11px ui-monospace, monospace';
    ctx.fillText(current.ticker, w * 0.18, inputY);

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '10px ui-sans-serif, system-ui';
    ctx.fillText('syminfo.type:', w * 0.40, inputY);
    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 11px ui-monospace, monospace';
    ctx.fillText(`"${current.symType}"`, w * 0.55, inputY);

    // Three branches
    type Branch = {
      y: number;
      condition: string;
      sl: string;
      tp: string;
      label: string;
    };
    const branches: Branch[] = [
      { y: 80,  condition: 'syminfo.type == "crypto"', sl: 'Structure', tp: 'R-Multiple',  label: 'CRYPTO' },
      { y: 145, condition: 'syminfo.type == "forex"',  sl: 'Pulse',     tp: 'ATR Targets', label: 'FOREX' },
      { y: 210, condition: 'else (stocks/indices/commodities)', sl: 'Structure', tp: 'Structure', label: 'OTHER' },
    ];

    branches.forEach((b, i) => {
      const isMatch = i === current.branchIdx;
      const fadeOpacity = isMatch ? 1 : 0.30;

      // Branch box
      const boxX = w * 0.06;
      const boxW = w * 0.88;
      const boxH = 50;

      if (isMatch) {
        ctx.fillStyle = 'rgba(255,179,0,0.10)';
        ctx.fillRect(boxX, b.y - 18, boxW, boxH);
        ctx.strokeStyle = 'rgba(255,179,0,0.55)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.rect(boxX, b.y - 18, boxW, boxH);
        ctx.stroke();
      } else {
        ctx.strokeStyle = 'rgba(255,255,255,0.10)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.rect(boxX, b.y - 18, boxW, boxH);
        ctx.stroke();
      }

      // Match arrow
      if (isMatch) {
        ctx.fillStyle = 'rgba(255,179,0,0.95)';
        ctx.font = 'bold 11px ui-sans-serif, system-ui';
        ctx.textAlign = 'left';
        ctx.fillText('\u25B6', boxX + 8, b.y);
      }

      // Branch label
      ctx.fillStyle = `rgba(255,179,0,${fadeOpacity})`;
      ctx.font = `${isMatch ? 'bold ' : ''}11px ui-sans-serif, system-ui`;
      ctx.textAlign = 'left';
      ctx.fillText(b.label, boxX + 28, b.y);

      // Condition
      ctx.fillStyle = `rgba(255,255,255,${fadeOpacity * 0.55})`;
      ctx.font = '9px ui-monospace, monospace';
      ctx.fillText(b.condition, boxX + 28, b.y + 14);

      // SL & TP outputs
      ctx.fillStyle = `rgba(239,83,80,${fadeOpacity})`;
      ctx.font = `${isMatch ? 'bold ' : ''}10px ui-monospace, monospace`;
      ctx.textAlign = 'right';
      ctx.fillText(`SL: ${b.sl}`, boxX + boxW * 0.72, b.y);

      ctx.fillStyle = `rgba(38,166,154,${fadeOpacity})`;
      ctx.fillText(`TP: ${b.tp}`, boxX + boxW - 14, b.y);
    });

    // Bottom: reason
    const reasonY = h * 0.85;
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '10px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('WHY THIS METHOD', w / 2, reasonY);
    ctx.fillStyle = 'rgba(255,179,0,0.85)';
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.fillText(current.reason, w / 2, reasonY + 16);

    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.textAlign = 'center';
    ctx.fillText('Auto mode is the default.  Reads syminfo.type at runtime.  Picks structurally-fit method for asset class.', w / 2, h - 6);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 9 — ForexLogicAnim (S09)
// Visualizes the forex playbook geometry: Pulse SL trailing close
// to recent action (tight) + ATR Targets TPs at fixed 1/2/3 ATR
// distances. Side panel shows the same chart at 15m / 4h / 1D
// timeframes scaling proportionally. The TF-scaling demonstrates
// that the same logic produces context-appropriate distances.
// ============================================================
function ForexLogicAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);

    const cycle = 7.0;
    const phase = (t % cycle) / cycle;
    const tfIdx = Math.floor(phase * 3);

    type TF = {
      label: string;
      slDist: number;     // relative to chart H
      tp1Dist: number;
      tp2Dist: number;
      tp3Dist: number;
      atrLabel: string;
    };

    const tfs: TF[] = [
      { label: '15m',  slDist: 0.10, tp1Dist: 0.14, tp2Dist: 0.20, tp3Dist: 0.26, atrLabel: '~12 pips' },
      { label: '4h',   slDist: 0.13, tp1Dist: 0.18, tp2Dist: 0.25, tp3Dist: 0.32, atrLabel: '~50 pips' },
      { label: '1D',   slDist: 0.15, tp1Dist: 0.22, tp2Dist: 0.30, tp3Dist: 0.38, atrLabel: '~120 pips' },
    ];

    const current = tfs[Math.min(tfIdx, tfs.length - 1)];

    ctx.fillStyle = 'rgba(255,179,0,0.85)';
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('FOREX PLAYBOOK  \u00B7  PULSE SL + ATR TARGETS  \u00B7  TIMEFRAME SCALING', w / 2, 18);

    // TF selector at top
    const tfBarY = 38;
    tfs.forEach((tf, i) => {
      const isMatch = i === tfIdx;
      const x = w * 0.30 + i * w * 0.13;
      ctx.fillStyle = isMatch ? 'rgba(255,179,0,0.20)' : 'rgba(255,255,255,0.05)';
      ctx.fillRect(x - 25, tfBarY - 12, 50, 18);
      ctx.strokeStyle = isMatch ? 'rgba(255,179,0,0.65)' : 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.rect(x - 25, tfBarY - 12, 50, 18);
      ctx.stroke();
      ctx.fillStyle = isMatch ? 'rgba(255,179,0,0.95)' : 'rgba(255,255,255,0.55)';
      ctx.font = `${isMatch ? 'bold ' : ''}10px ui-sans-serif, system-ui`;
      ctx.textAlign = 'center';
      ctx.fillText(tf.label, x, tfBarY);
    });

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '9px ui-monospace, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('EUR/USD  \u00B7  ATR:', w * 0.06, tfBarY);
    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 9px ui-monospace, monospace';
    ctx.fillText(current.atrLabel, w * 0.20, tfBarY);

    // Chart
    const chartX = w * 0.06;
    const chartW = w - chartX * 2;
    const chartY = h * 0.20;
    const chartH = h * 0.58;

    ctx.fillStyle = 'rgba(255,255,255,0.015)';
    ctx.fillRect(chartX, chartY, chartW, chartH);

    // Synthetic forex price (tight oscillation + uptrend)
    const N = 50;
    const priceY: number[] = [];
    for (let i = 0; i < N; i++) {
      const x = i / (N - 1);
      const trend = chartY + chartH * (0.65 - x * 0.10);
      const osc = Math.sin(i * 0.5) * chartH * 0.04 + Math.sin(i * 0.18) * chartH * 0.02;
      priceY.push(trend + osc);
    }

    // Pulse line (trails close to price, slightly below)
    const pulseY: number[] = [];
    for (let i = 0; i < N; i++) {
      pulseY.push(priceY[i] + chartH * 0.04);
    }

    // Draw price
    ctx.strokeStyle = 'rgba(255,255,255,0.65)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const x = chartX + (i / (N - 1)) * chartW;
      if (i === 0) ctx.moveTo(x, priceY[i]);
      else ctx.lineTo(x, priceY[i]);
    }
    ctx.stroke();

    // Draw Pulse line (faint amber dotted)
    ctx.strokeStyle = 'rgba(255,179,0,0.55)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const x = chartX + (i / (N - 1)) * chartW;
      if (i === 0) ctx.moveTo(x, pulseY[i]);
      else ctx.lineTo(x, pulseY[i]);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(255,179,0,0.85)';
    ctx.font = '8px ui-monospace, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Pulse', chartX + 8, pulseY[2] - 3);

    // Entry at right side
    const entryX = chartX + chartW * 0.65;
    const entryY = priceY[Math.floor(N * 0.65)];

    // Entry signal
    ctx.fillStyle = '#26A69A';
    ctx.font = 'bold 14px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('\u25B2', entryX, entryY + 14);

    // Entry dotted
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(entryX, entryY);
    ctx.lineTo(chartX + chartW - 4, entryY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.font = 'bold 8px ui-monospace, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Entry', chartX + chartW - 28, entryY - 3);

    // SL — Pulse-derived (tight)
    const slY = entryY + chartH * current.slDist;
    ctx.strokeStyle = 'rgba(239,83,80,0.85)';
    ctx.lineWidth = 1.3;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(entryX, slY);
    ctx.lineTo(chartX + chartW - 4, slY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(239,83,80,0.95)';
    ctx.font = 'bold 8px ui-monospace, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('SL (Pulse)', chartX + chartW - 50, slY - 3);

    // TPs — ATR Targets (uniform spacing)
    [['TP1', current.tp1Dist, '1.0 ATR'], ['TP2', current.tp2Dist, '2.0 ATR'], ['TP3', current.tp3Dist, '3.0 ATR']].forEach(([lbl, d, atrLbl], i) => {
      const tpY = entryY - chartH * (d as number);
      const alpha = 0.85 - i * 0.15;
      ctx.strokeStyle = `rgba(38,166,154,${alpha})`;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(entryX, tpY);
      ctx.lineTo(chartX + chartW - 4, tpY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = `rgba(38,166,154,${alpha})`;
      ctx.font = 'bold 8px ui-monospace, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`${lbl}  ${atrLbl}`, chartX + chartW - 60, (tpY as number) - 3);
    });

    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.textAlign = 'center';
    ctx.fillText('Same Pulse + ATR logic at every timeframe.  Distances scale with ATR.  Method is consistent.', w / 2, h - 6);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 10 — CryptoLogicAnim (S10)
// Visualizes the crypto playbook geometry: Structure SL at swing
// low (deep, absorbs volatile wicks) + R-Multiple TPs (uniform
// 1R/2R/3R distances that let momentum runs extend). Synthetic
// BTC-style chart with deep wicks and momentum continuation.
// ============================================================
function CryptoLogicAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);

    const cycle = 6.0;
    const phase = (t % cycle) / cycle;
    const showLeft = phase >= 0.05;
    const showRight = phase >= 0.45;

    ctx.fillStyle = 'rgba(255,179,0,0.85)';
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('CRYPTO PLAYBOOK  \u00B7  STRUCTURE SL + R-MULTIPLE TP  \u00B7  DEEP WICKS, UNCAPPED RUNS', w / 2, 18);

    const padX = w * 0.05;
    const padY = h * 0.16;
    const panelW = (w - padX * 2 - 20) / 2;
    const panelH = h * 0.66;

    type Panel = {
      x: number;
      title: string;
      subtitle: string;
      isStructure: boolean;
      visible: boolean;
      revealAlpha: number;
    };

    const panels: Panel[] = [
      { x: padX,                title: 'PULSE SL  (WRONG FOR CRYPTO)', subtitle: 'shaken out by volatile wicks',     isStructure: false, visible: showLeft,  revealAlpha: showLeft ? Math.min(1, (phase - 0.05) / 0.20) : 0 },
      { x: padX + panelW + 20,  title: 'STRUCTURE SL  (CORRECT)',     subtitle: 'absorbs wicks, holds the trend',     isStructure: true,  visible: showRight, revealAlpha: showRight ? Math.min(1, (phase - 0.45) / 0.20) : 0 },
    ];

    panels.forEach((p) => {
      ctx.fillStyle = `rgba(255,255,255,${p.visible ? 0.025 * p.revealAlpha : 0})`;
      ctx.strokeStyle = `rgba(255,255,255,${p.visible ? 0.10 * p.revealAlpha : 0})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.rect(p.x, padY, panelW, panelH);
      ctx.fill();
      ctx.stroke();

      if (!p.visible) return;

      ctx.fillStyle = `rgba(255,179,0,${0.95 * p.revealAlpha})`;
      ctx.font = 'bold 11px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(p.title, p.x + panelW / 2, padY + 16);

      ctx.fillStyle = `rgba(255,255,255,${0.55 * p.revealAlpha})`;
      ctx.font = '9px ui-monospace, monospace';
      ctx.fillText(p.subtitle, p.x + panelW / 2, padY + 30);

      // Chart area
      const chartTop = padY + 42;
      const chartBot = padY + panelH - 36;
      const chartH = chartBot - chartTop;
      const chartL = p.x + 10;
      const chartR = p.x + panelW - 10;
      const chartW = chartR - chartL;

      // Crypto-style price action with deep wicks + momentum extension
      const N = 30;
      type Bar = { high: number; low: number; close: number };
      const bars: Bar[] = [];
      for (let i = 0; i < N; i++) {
        const x = i / (N - 1);
        // Up trend with deep wicks at i=10 (post-entry shake)
        let mid: number;
        if (x < 0.20) mid = chartTop + chartH * (0.50 + Math.sin(i * 0.5) * 0.05);
        else if (x < 0.40) mid = chartTop + chartH * (0.55 - (x - 0.20) * 0.10);
        else mid = chartTop + chartH * (0.45 - (x - 0.40) * 0.65);

        const wickRange = chartH * 0.05;
        // Deep wick at i=10-12 (post-entry crypto noise)
        const deepWick = (i >= 10 && i <= 12) ? chartH * 0.10 : 0;
        bars.push({ high: mid - wickRange, low: mid + wickRange + deepWick, close: mid });
      }

      // Swing low at i=2
      const swingLowY = bars[2].low;
      // Pulse line (trails close to price)
      const pulseLineY = bars[8].close + chartH * 0.04;

      // SL position depends on panel
      const slY = p.isStructure ? swingLowY + chartH * 0.04 : pulseLineY;

      // SL band shaded
      ctx.fillStyle = `rgba(239,83,80,${0.10 * p.revealAlpha})`;
      ctx.fillRect(chartL + 4, slY, chartW - 8, chartBot - slY);

      // Draw bars with wicks
      for (let i = 0; i < N; i++) {
        const x = chartL + (i / (N - 1)) * chartW;
        const b = bars[i];
        // Wick clipped check
        const wickClipped = !p.isStructure && b.low > slY;
        ctx.strokeStyle = wickClipped ? `rgba(239,83,80,${0.95 * p.revealAlpha})` : `rgba(255,255,255,${0.65 * p.revealAlpha})`;
        ctx.lineWidth = wickClipped ? 1.5 : 1;
        ctx.beginPath();
        ctx.moveTo(x, b.high);
        ctx.lineTo(x, b.low);
        ctx.stroke();
        // X marker on clipped bar
        if (wickClipped) {
          ctx.fillStyle = `rgba(239,83,80,${0.95 * p.revealAlpha})`;
          ctx.font = 'bold 9px ui-monospace, monospace';
          ctx.textAlign = 'center';
          ctx.fillText('\u2715', x, b.low + 12);
        }
      }

      // SL line
      ctx.strokeStyle = `rgba(239,83,80,${0.85 * p.revealAlpha})`;
      ctx.lineWidth = 1.4;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(chartL + 4, slY);
      ctx.lineTo(chartR - 4, slY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = `rgba(239,83,80,${0.95 * p.revealAlpha})`;
      ctx.font = 'bold 8px ui-monospace, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(p.isStructure ? 'SL (Swing Low)' : 'SL (Pulse)', chartL + 6, slY - 3);

      // TPs only show on Structure panel — R-Multiple ladder
      if (p.isStructure) {
        const entryY = bars[8].close; // Entry at bar 8
        const slDist = slY - entryY;
        // R-Multiple: TP1=1R, TP2=2R, TP3=3R from entry (above for long)
        [['TP1', 1, 0.85], ['TP2', 2, 0.65], ['TP3', 3, 0.50]].forEach(([lbl, mult, a]) => {
          const tpY = entryY - slDist * (mult as number);
          if (tpY < chartTop + 8) return; // skip if off-chart
          ctx.strokeStyle = `rgba(38,166,154,${(a as number) * p.revealAlpha})`;
          ctx.lineWidth = 1.2;
          ctx.setLineDash([4, 3]);
          ctx.beginPath();
          ctx.moveTo(chartL + 4, tpY);
          ctx.lineTo(chartR - 4, tpY);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = `rgba(38,166,154,${(a as number) * p.revealAlpha})`;
          ctx.font = 'bold 8px ui-monospace, monospace';
          ctx.textAlign = 'left';
          ctx.fillText(`${lbl}  ${mult}R`, chartL + 6, tpY - 3);
        });
      } else {
        // Wrong panel: show stop-out
        ctx.fillStyle = `rgba(239,83,80,${0.85 * p.revealAlpha})`;
        ctx.font = 'bold 10px ui-sans-serif, system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('STOPPED OUT BY WICKS', p.x + panelW / 2, padY + panelH - 16);
      }
    });

    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.textAlign = 'center';
    ctx.fillText('Crypto wicks deep \u00B7 Structure SL absorbs noise \u00B7 R-Multiple TPs let momentum run uncapped', w / 2, h - 6);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 11 — StocksLogicAnim (S11)
// Visualizes the stocks/indices playbook: Structure SL at swing
// + Structure TP at next S/R levels (irregular spacing). Shows
// real S/R levels on the chart with TPs landing exactly at them.
// ============================================================
function StocksLogicAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);

    const cycle = 6.0;
    const phase = (t % cycle) / cycle;
    const showStructure = phase >= 0.05;
    const showSL = phase >= 0.25;
    const showTP1 = phase >= 0.40;
    const showTP2 = phase >= 0.55;
    const showTP3 = phase >= 0.70;

    ctx.fillStyle = 'rgba(255,179,0,0.85)';
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('STOCKS / INDICES PLAYBOOK  \u00B7  STRUCTURE SL + STRUCTURE TP  \u00B7  REAL S/R MAGNETS', w / 2, 18);

    const chartX = w * 0.06;
    const chartW = w - chartX * 2;
    const chartY = h * 0.16;
    const chartH = h * 0.68;

    ctx.fillStyle = 'rgba(255,255,255,0.015)';
    ctx.fillRect(chartX, chartY, chartW, chartH);

    // Structure S/R levels — irregular spacing
    type Level = { y: number; label: string; strength: number };
    const levels: Level[] = [
      { y: chartY + chartH * 0.10, label: 'R3', strength: 0.65 },
      { y: chartY + chartH * 0.22, label: 'R2', strength: 0.85 },
      { y: chartY + chartH * 0.38, label: 'R1', strength: 0.95 },
      { y: chartY + chartH * 0.65, label: 'Entry', strength: 1.00 },
      { y: chartY + chartH * 0.82, label: 'S1 (SL)', strength: 0.95 },
    ];

    // Draw structure levels
    if (showStructure) {
      const a = Math.min(1, (phase - 0.05) / 0.15);
      levels.forEach((lv) => {
        if (lv.label === 'Entry') return;
        ctx.strokeStyle = `rgba(255,179,0,${0.30 * lv.strength * a})`;
        ctx.lineWidth = 0.8;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.moveTo(chartX + 8, lv.y);
        ctx.lineTo(chartX + chartW - 8, lv.y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = `rgba(255,179,0,${0.55 * a})`;
        ctx.font = '8px ui-monospace, monospace';
        ctx.textAlign = 'left';
        ctx.fillText(lv.label, chartX + 12, lv.y - 3);
      });
    }

    // Synthetic price line (long signal moving up)
    const N = 60;
    const priceY: number[] = [];
    for (let i = 0; i < N; i++) {
      const x = i / (N - 1);
      // Comes down to entry, signal fires, moves up through levels
      const v = chartY + chartH * (0.50 + Math.sin(i * 0.4) * 0.03 - x * 0.05);
      priceY.push(v);
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.65)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const x = chartX + (i / (N - 1)) * chartW;
      if (i === 0) ctx.moveTo(x, priceY[i]);
      else ctx.lineTo(x, priceY[i]);
    }
    ctx.stroke();

    const entryY = chartY + chartH * 0.65;
    const entryX = chartX + chartW * 0.55;

    // Entry signal
    ctx.fillStyle = '#26A69A';
    ctx.font = 'bold 14px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('\u25B2', entryX, entryY + 14);

    // Entry dotted line
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(entryX, entryY);
    ctx.lineTo(chartX + chartW - 4, entryY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.font = 'bold 8px ui-monospace, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Entry', chartX + chartW - 30, entryY - 3);

    // SL at S1 (Structure-based)
    if (showSL) {
      const a = Math.min(1, (phase - 0.25) / 0.10);
      const slY = chartY + chartH * 0.82;
      ctx.strokeStyle = `rgba(239,83,80,${0.85 * a})`;
      ctx.lineWidth = 1.4;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(entryX, slY);
      ctx.lineTo(chartX + chartW - 4, slY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = `rgba(239,83,80,${0.95 * a})`;
      ctx.font = 'bold 9px ui-monospace, monospace';
      ctx.textAlign = 'left';
      ctx.fillText('SL  (Swing Low)', chartX + chartW - 80, slY - 3);
    }

    // TPs land exactly at structure levels — IRREGULAR SPACING
    type TPSpec = { y: number; label: string; show: boolean; alpha: number; delay: number };
    const tpSpecs: TPSpec[] = [
      { y: chartY + chartH * 0.38, label: 'TP1  (S/R)', show: showTP1, alpha: 0.95, delay: 0.40 },
      { y: chartY + chartH * 0.22, label: 'TP2  (S/R)', show: showTP2, alpha: 0.75, delay: 0.55 },
      { y: chartY + chartH * 0.10, label: 'TP3  (S/R)', show: showTP3, alpha: 0.60, delay: 0.70 },
    ];

    tpSpecs.forEach((tp) => {
      if (!tp.show) return;
      const a = Math.min(1, (phase - tp.delay) / 0.10);
      ctx.strokeStyle = `rgba(38,166,154,${tp.alpha * a})`;
      ctx.lineWidth = 1.4;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(entryX, tp.y);
      ctx.lineTo(chartX + chartW - 4, tp.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = `rgba(38,166,154,${tp.alpha * a})`;
      ctx.font = 'bold 9px ui-monospace, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(tp.label, chartX + chartW - 70, tp.y - 3);

      // Magnet glow at the level
      ctx.fillStyle = `rgba(38,166,154,${0.15 * a})`;
      ctx.fillRect(chartX + 8, tp.y - 4, chartW - 16, 8);
    });

    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.textAlign = 'center';
    ctx.fillText('TPs land at real S/R levels  \u00B7  irregular spacing  \u00B7  institutional flow respects the roadmap', w / 2, h - 6);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 12 — SafetyGuardAnim (S12)
// Three-stage demo of the SL Safety Guard:
// 1. Normal Pulse SL placement (correct, on loss side)
// 2. Pulse trails too tight, SL crosses into profit territory (broken)
// 3. Safety guard fires, ATR fallback substitutes (corrected)
// ============================================================
function SafetyGuardAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);

    const cycle = 9.0;
    const phase = (t % cycle) / cycle;
    // Three stages: 0-0.33 normal, 0.33-0.66 broken, 0.66-1.0 corrected
    const stageIdx = Math.floor(phase * 3);

    type Stage = {
      title: string;
      subtitle: string;
      pulseY: number;
      slY: number;
      slLabel: string;
      slColor: string;
      verdictColor: string;
      verdict: string;
    };

    const chartTopRel = 0.18;
    const chartBotRel = 0.82;
    const entryRel = 0.40; // Entry at 40% of chart (long, so SL should be below = higher Y)

    const stages: Stage[] = [
      {
        title: 'STAGE 1  \u00B7  NORMAL PULSE SL',
        subtitle: 'Pulse trails close, SL below entry on loss side',
        pulseY: 0.55,
        slY: 0.58, // below entry (correct)
        slLabel: 'SL  (Pulse)',
        slColor: '#EF5350',
        verdictColor: '#26A69A',
        verdict: '\u2713 SL ON LOSS SIDE  \u00B7  TRADE WORKS NORMALLY',
      },
      {
        title: 'STAGE 2  \u00B7  PULSE RATCHETS TOO TIGHT',
        subtitle: 'Extended trend pulls Pulse line above entry',
        pulseY: 0.33,
        slY: 0.36, // above entry (BROKEN!)
        slLabel: 'SL  (Pulse, BROKEN)',
        slColor: '#FF1744',
        verdictColor: '#EF5350',
        verdict: '\u2717 SL ON PROFIT SIDE  \u00B7  LOGICALLY IMPOSSIBLE',
      },
      {
        title: 'STAGE 3  \u00B7  SAFETY GUARD FIRES',
        subtitle: 'Engine substitutes ATR-derived SL automatically',
        pulseY: 0.33, // pulse still ratcheted high
        slY: 0.62, // ATR fallback below entry (correct again)
        slLabel: 'SL  (1.5 ATR)',
        slColor: '#FFB300',
        verdictColor: '#26A69A',
        verdict: '\u2713 ATR FALLBACK  \u00B7  SL RESTORED TO LOSS SIDE',
      },
    ];

    const current = stages[Math.min(stageIdx, stages.length - 1)];

    ctx.fillStyle = 'rgba(255,179,0,0.85)';
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('SL SAFETY GUARD  \u00B7  PROFIT-SIDE SL DETECTION + ATR FALLBACK', w / 2, 18);

    // Stage indicator
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.font = 'bold 11px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(current.title, w / 2, 38);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillText(current.subtitle, w / 2, 52);

    const chartX = w * 0.06;
    const chartW = w - chartX * 2;
    const chartY = h * 0.20;
    const chartH = h * 0.55;

    ctx.fillStyle = 'rgba(255,255,255,0.015)';
    ctx.fillRect(chartX, chartY, chartW, chartH);

    // Synthetic uptrending price (extended)
    const N = 50;
    const priceY: number[] = [];
    for (let i = 0; i < N; i++) {
      const x = i / (N - 1);
      // Strong uptrend
      priceY.push(chartY + chartH * (0.65 - x * 0.40));
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.65)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const x = chartX + (i / (N - 1)) * chartW;
      if (i === 0) ctx.moveTo(x, priceY[i]);
      else ctx.lineTo(x, priceY[i]);
    }
    ctx.stroke();

    // Pulse line (trailing)
    const pulseY = chartY + chartH * current.pulseY;
    ctx.strokeStyle = 'rgba(255,179,0,0.55)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(chartX + 8, pulseY);
    ctx.lineTo(chartX + chartW - 8, pulseY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255,179,0,0.85)';
    ctx.font = '8px ui-monospace, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Pulse', chartX + 12, pulseY - 3);

    // Entry line
    const entryY = chartY + chartH * entryRel;
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(chartX + 8, entryY);
    ctx.lineTo(chartX + chartW - 8, entryY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.font = 'bold 9px ui-monospace, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Entry', chartX + 12, entryY - 3);

    // SL line
    const slY = chartY + chartH * current.slY;
    const sr = parseInt(current.slColor.slice(1, 3), 16);
    const sg = parseInt(current.slColor.slice(3, 5), 16);
    const sb = parseInt(current.slColor.slice(5, 7), 16);
    ctx.strokeStyle = `rgba(${sr},${sg},${sb},0.95)`;
    ctx.lineWidth = 1.6;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(chartX + 8, slY);
    ctx.lineTo(chartX + chartW - 8, slY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = `rgba(${sr},${sg},${sb},0.95)`;
    ctx.font = 'bold 10px ui-monospace, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(current.slLabel, chartX + chartW - 130, slY - 3);

    // Stage 2 visual: highlight the broken case
    if (stageIdx === 1) {
      // Red zone showing SL above entry (impossible)
      ctx.fillStyle = 'rgba(255,23,68,0.15)';
      ctx.fillRect(chartX + 8, slY, chartW - 16, entryY - slY);
      ctx.fillStyle = 'rgba(255,23,68,0.95)';
      ctx.font = 'bold 9px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('SL > ENTRY (impossible)', chartX + chartW / 2, (slY + entryY) / 2);
    }

    // Verdict banner
    const verdictY = chartY + chartH + 26;
    const vr = parseInt(current.verdictColor.slice(1, 3), 16);
    const vg = parseInt(current.verdictColor.slice(3, 5), 16);
    const vb = parseInt(current.verdictColor.slice(5, 7), 16);
    ctx.fillStyle = `rgba(${vr},${vg},${vb},0.95)`;
    ctx.font = 'bold 12px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(current.verdict, w / 2, verdictY);

    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.textAlign = 'center';
    ctx.fillText('Pine guard:  if sl_long >= close: sl_long := sl_long_atr  \u00B7  invisible to operator, ensures correctness', w / 2, h - 6);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 13 — ChartLinesAnim (S13)
// Visualizes the lifecycle of TP/SL chart lines:
// - At signal fire: lines render forward 20 bars from entry
// - During trade: lines persist, price action moves toward TPs
// - At next signal: previous lines auto-clear, new lines render
// Cycle shows three signals firing in sequence with line replacement.
// ============================================================
function ChartLinesAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);

    const cycle = 9.0;
    const phase = (t % cycle) / cycle;

    ctx.fillStyle = 'rgba(255,179,0,0.85)';
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('TP/SL CHART LINES  \u00B7  RENDER FORWARD 20 BARS  \u00B7  AUTO-CLEAR ON NEXT SIGNAL', w / 2, 18);

    const chartX = w * 0.06;
    const chartW = w - chartX * 2;
    const chartY = h * 0.16;
    const chartH = h * 0.68;

    ctx.fillStyle = 'rgba(255,255,255,0.015)';
    ctx.fillRect(chartX, chartY, chartW, chartH);

    // Simulated price walking left to right
    const totalProgress = phase;
    const priceX = chartX + chartW * totalProgress;

    // Three signals fire at progress points 0.10, 0.45, 0.80
    type Signal = {
      progress: number;
      isLong: boolean;
      entryY: number;
      slY: number;
      tp1Y: number;
      tp2Y: number;
      tp3Y: number;
    };

    const signals: Signal[] = [
      { progress: 0.10, isLong: true,  entryY: chartY + chartH * 0.55, slY: chartY + chartH * 0.72, tp1Y: chartY + chartH * 0.42, tp2Y: chartY + chartH * 0.30, tp3Y: chartY + chartH * 0.18 },
      { progress: 0.45, isLong: false, entryY: chartY + chartH * 0.30, slY: chartY + chartH * 0.18, tp1Y: chartY + chartH * 0.43, tp2Y: chartY + chartH * 0.55, tp3Y: chartY + chartH * 0.68 },
      { progress: 0.80, isLong: true,  entryY: chartY + chartH * 0.50, slY: chartY + chartH * 0.66, tp1Y: chartY + chartH * 0.38, tp2Y: chartY + chartH * 0.26, tp3Y: chartY + chartH * 0.14 },
    ];

    // Find the most recent fired signal
    const activeSignals = signals.filter((s) => s.progress <= totalProgress);
    const currentSignal = activeSignals[activeSignals.length - 1];

    // Synthetic price trail
    const N = 80;
    const priceTrail: number[] = [];
    for (let i = 0; i < N; i++) {
      const x = i / (N - 1);
      let y = chartY + chartH * 0.50;
      // Wander based on signal direction at this point
      signals.forEach((s) => {
        if (x >= s.progress && x < (signals[signals.indexOf(s) + 1]?.progress ?? 1.0)) {
          const dx = x - s.progress;
          y = s.entryY + (s.isLong ? -1 : 1) * chartH * dx * 0.5;
        }
      });
      priceTrail.push(y);
    }

    // Draw price trail up to current progress
    const drawTo = Math.floor(N * totalProgress);
    ctx.strokeStyle = 'rgba(255,255,255,0.65)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let i = 0; i <= drawTo; i++) {
      const x = chartX + (i / (N - 1)) * chartW;
      if (i === 0) ctx.moveTo(x, priceTrail[i]);
      else ctx.lineTo(x, priceTrail[i]);
    }
    ctx.stroke();

    // Render only the current signal's lines (auto-clear previous)
    if (currentSignal) {
      const sigX = chartX + chartW * currentSignal.progress;
      const lineEndX = Math.min(chartX + chartW - 4, sigX + chartW * 0.20);

      // Entry signal arrow
      ctx.fillStyle = currentSignal.isLong ? '#26A69A' : '#EF5350';
      ctx.font = 'bold 14px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(currentSignal.isLong ? '\u25B2' : '\u25BC', sigX, currentSignal.entryY + (currentSignal.isLong ? 14 : -14));

      // Entry dotted
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(sigX, currentSignal.entryY);
      ctx.lineTo(lineEndX, currentSignal.entryY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.font = 'bold 8px ui-monospace, monospace';
      ctx.textAlign = 'left';
      ctx.fillText('Entry', lineEndX - 26, currentSignal.entryY - 3);

      // SL dashed magenta
      ctx.strokeStyle = 'rgba(239,83,80,0.85)';
      ctx.lineWidth = 1.3;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(sigX, currentSignal.slY);
      ctx.lineTo(lineEndX, currentSignal.slY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(239,83,80,0.95)';
      ctx.font = 'bold 8px ui-monospace, monospace';
      ctx.textAlign = 'left';
      ctx.fillText('SL', lineEndX - 16, currentSignal.slY - 3);

      // TPs dashed teal
      [['TP1', currentSignal.tp1Y, 0.85], ['TP2', currentSignal.tp2Y, 0.65], ['TP3', currentSignal.tp3Y, 0.50]].forEach(([lbl, ty, a]) => {
        ctx.strokeStyle = `rgba(38,166,154,${a as number})`;
        ctx.lineWidth = 1.3;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.moveTo(sigX, ty as number);
        ctx.lineTo(lineEndX, ty as number);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = `rgba(38,166,154,${a as number})`;
        ctx.font = 'bold 8px ui-monospace, monospace';
        ctx.textAlign = 'left';
        ctx.fillText(lbl as string, lineEndX - 22, (ty as number) - 3);
      });
    }

    // Mark previous signal points (faded, no lines — they auto-cleared)
    activeSignals.forEach((s) => {
      if (s === currentSignal) return;
      const sigX = chartX + chartW * s.progress;
      ctx.fillStyle = 'rgba(255,255,255,0.30)';
      ctx.font = 'bold 14px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(s.isLong ? '\u25B2' : '\u25BC', sigX, s.entryY + (s.isLong ? 14 : -14));
    });

    // Live price marker
    if (currentSignal) {
      const liveY = priceTrail[drawTo] || priceTrail[priceTrail.length - 1];
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(priceX, liveY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0a0a0a';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Signal counter
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '10px ui-monospace, monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`Active signal: ${activeSignals.length} of ${signals.length}`, chartX + chartW - 6, chartY + 14);

    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.textAlign = 'center';
    ctx.fillText('Lines render at signal moment  \u00B7  persist 20 bars  \u00B7  clear when next signal fires', w / 2, h - 6);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function CipherRiskMapLesson() {
  const [scrollY, setScrollY] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameRound, setGameRound] = useState(0);
  const [gameSelections, setGameSelections] = useState<(string | null)[]>(new Array(gameRounds.length).fill(null));
  const [quizAnswers, setQuizAnswers] = useState<(string | null)[]>(new Array(quizQuestions.length).fill(null));
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [certRevealed, setCertRevealed] = useState(false);
  const [certId] = useState(() => `PRO-CERT-L11.21-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);

  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  const quizScore = quizAnswers.filter((ans, i) => {
    if (!quizQuestions[i]) return false;
    const correct = quizQuestions[i].options.find((o) => o.correct)?.id;
    return ans === correct;
  }).length;
  const quizPercent = quizQuestions.length > 0 ? Math.round((quizScore / quizQuestions.length) * 100) : 0;
  const quizPassed = quizPercent >= 66;

  useEffect(() => {
    if (quizPassed && quizSubmitted && !certRevealed) {
      const timer = setTimeout(() => {
        setCertRevealed(true);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [quizPassed, quizSubmitted, certRevealed]);

  const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } };

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      <Confetti active={showConfetti} />
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-900/50">
        <div className="h-full bg-gradient-to-r from-amber-400 to-accent-400 transition-all duration-100" style={{ width: `${Math.min(100, (scrollY / (typeof document !== 'undefined' ? document.body.scrollHeight - window.innerHeight : 1)) * 100)}%` }} />
      </div>

      <nav className="fixed top-1 left-0 right-0 z-40 px-6 py-3 backdrop-blur-md bg-black/40 border-b border-white/5 flex items-center justify-between">
        <Link href="/academy" className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-amber-400 to-accent-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>ATLAS ACADEMY</Link>
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold tracking-widest uppercase text-amber-400">PRO &middot; LEVEL 11 &middot; CIPHER</span>
        </div>
      </nav>

      {/* === HERO === */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6 pt-20">
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.15 } } }}>
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 11 &middot; Lesson 21</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Cipher Risk Map<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Where The Trade Goes, And Where It Doesn&apos;t</span></motion.h1>
          <motion.p variants={fadeUp} className="text-lg text-gray-300 max-w-xl mx-auto mb-8 leading-relaxed">Every signal arrives with its trade plan precomputed. Entry, stop, three targets, risk per unit &mdash; all calculated, asset-class-aware, and ready to execute. The operator decides whether to take the trade. The engine decides where it goes.</motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-2 text-xs font-mono text-gray-500">
            <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300">17 sections</span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">13 animations</span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">5-round game</span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">8-question quiz</span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">Risk Map Operator cert</span>
          </motion.div>
        </motion.div>
      </section>

      {/* === S00 — First, Why This Matters === */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">First, Why This Matters</p>
          <h2 className="text-2xl font-extrabold mb-4">Most Signals Don&apos;t Come With A Plan.</h2>
          <p className="text-gray-400 leading-relaxed mb-4">Open any retail trading indicator. The classic ones (RSI, MACD, moving averages) tell you when something is happening &mdash; price crossed above a level, momentum flipped, the trend changed direction. <strong className="text-white">None of them tell you where the trade goes</strong>. You see the buy signal. Now what? Where does the stop go? Where do you scale out? When do you take profit? <strong className="text-amber-400">The signal is a starting line; the trader has to figure out the rest of the race themselves</strong>. The result is a thousand operators all trading the same indicator with a thousand different stop placements, take-profit ladders, and risk-per-trade interpretations &mdash; with predictably variable outcomes.</p>
          <p className="text-gray-400 leading-relaxed">CIPHER&apos;s Risk Map fixes this. <strong className="text-white">Every buy and sell signal arrives with the full trade plan attached</strong>: entry price, stop loss, three take-profit targets, exact risk per unit. The plan is precomputed using methods calibrated to the asset class &mdash; crypto trades differently than forex trades differently than stocks &mdash; so the right method is auto-applied without operator configuration. <strong className="text-white">The signal isn&apos;t just &ldquo;go&rdquo;; it&apos;s &ldquo;go HERE, with stop HERE, and these three exits&rdquo;</strong>. Risk Map is the engine&apos;s answer to the question every signal raises but most signals duck: where does the trade end?</p>
        </motion.div>
      </section>

      {/* === S01 — Where The Trade Goes (Groundbreaking Concept) === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Groundbreaking Concept</p>
          <h2 className="text-2xl font-extrabold mb-4">The Engine Decides Where. The Operator Decides Whether.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Risk Map inverts the standard signal-indicator relationship. Most indicators say &ldquo;here&apos;s a setup &mdash; you figure out the levels&rdquo;. Risk Map says <strong className="text-white">&ldquo;here&apos;s the setup AND its levels &mdash; you figure out whether to take it&rdquo;</strong>. The shift moves operator effort from level-construction (where do stops go, where do targets go) to position-management (do I trust this signal in this context). <strong className="text-amber-400">Construction is mechanical and rule-based; trust is contextual and judgment-based</strong>. The engine handles the mechanical part; the operator handles the judgment. Both layers have appropriate work; neither overlaps with the other&apos;s strength.</p>
          <WhereTheTradeGoesAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">The two-panel comparison shows the structural difference. <strong className="text-white">Left</strong>: a signal arrow alone with question marks where the levels should be &mdash; the operator&apos;s entire workload happens after the signal fires. They have to identify swing levels, calculate ATR distances, decide on R-multiples, and remember to do all of this in real time during a market move. <strong className="text-white">Right</strong>: the same signal with the full Risk Map auto-attached &mdash; entry dotted line, SL dashed magenta, three TP dashed teals, all positioned at exactly the right prices for this asset and timeframe. <strong className="text-amber-400">Same signal moment, two completely different operator experiences</strong>.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE PROBLEM WITH SIGNAL-ALONE INDICATORS</p>
              <p className="text-sm text-gray-400 leading-relaxed">A buy signal without level guidance creates work right at the worst moment. <strong className="text-white">Price is moving, the signal is fresh, the operator&apos;s emotion is engaged &mdash; and now they have to construct the trade plan from scratch</strong>. Where&apos;s the recent swing low? How many ATR is it away? What R-multiple makes sense? Should TP1 be at structure or at fixed R? In the heat of the moment, retail traders typically default to whatever feels right that day &mdash; meaning the same setup gets traded differently across sessions and weeks. Inconsistency is the result; the indicator can&apos;t be blamed because it never claimed to address levels in the first place.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE RISK MAP SOLUTION</p>
              <p className="text-sm text-gray-400 leading-relaxed">CIPHER computes the trade plan at signal-firing time, attaches it to the signal label as a tooltip, and (optionally) renders the lines on the chart. <strong className="text-white">The operator sees the plan before deciding to enter</strong>. They can verify the SL distance fits their account size, confirm the TP ladder matches their style, and check the asset-class method makes sense for the instrument. None of this construction happens during the trade &mdash; it&apos;s all precomputed, visible, and auditable before the click. <strong className="text-white">The operator&apos;s job becomes &ldquo;execute or skip&rdquo;, not &ldquo;execute and figure out levels&rdquo;</strong>.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CONSTRUCTION VS JUDGMENT &mdash; TWO DIFFERENT JOBS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Level construction (finding swing lows, calculating ATR distances, picking R-multiples) is rule-based mechanical work that computers do faster and more consistently than humans. <strong className="text-white">Trade judgment (does this setup match my edge, is the regime favourable, am I emotionally fit to take this trade) is contextual work that requires the operator&apos;s full bandwidth</strong>. When operators do construction work in real time, they have less bandwidth for judgment work &mdash; the trade plan suffers AND the entry decision suffers. Risk Map removes the construction load entirely so judgment can be the operator&apos;s only focus at the moment that matters.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE OPERATOR PROMISE THE ENGINE MAKES</p>
              <p className="text-sm text-gray-400 leading-relaxed">When a CIPHER signal fires, the operator can trust three things absolutely. <strong className="text-white">First</strong>: the SL is positioned at a structurally meaningful level (swing low, Pulse line, or ATR multiple) with a 0.3 ATR safety buffer to avoid wick clips. <strong className="text-white">Second</strong>: the TPs are positioned at structurally meaningful targets (R-multiples, S/R levels, or ATR multiples) using the method that empirically performs best for this asset class. <strong className="text-white">Third</strong>: the entire plan is consistent with how every other CIPHER signal across every other asset and timeframe works &mdash; same logic, same buffer, same method-resolution discipline. <strong className="text-amber-400">Consistency across signals is the operator&apos;s edge; Risk Map enforces it by design</strong>.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE PRECOMPUTED PLAN HAS SIX ATOMS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Every Risk Map output contains exactly six pieces of information: <strong className="text-white">Entry, SL (with method label), TP1 (with method label), TP2, TP3, and Risk per unit</strong>. The Entry is the close of the signal bar. The SL has a label like &ldquo;Swing Low&rdquo;, &ldquo;Pulse&rdquo;, or &ldquo;1.5 ATR&rdquo; so the operator knows which method was used. The TPs have labels like &ldquo;1R&rdquo;, &ldquo;S/R&rdquo;, or &ldquo;1.0 ATR&rdquo; so the method is transparent. Risk per unit is the absolute distance from entry to SL &mdash; the basis for position sizing. <strong className="text-white">All six atoms render together in the signal&apos;s tooltip</strong> so the operator gets the entire plan in one hover.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">METHOD LABELS MAKE THE ENGINE TRANSPARENT</p>
              <p className="text-sm text-gray-400 leading-relaxed">A trade plan that doesn&apos;t reveal its assumptions is a black box. Risk Map avoids this by labeling every level with the method that produced it. <strong className="text-white">SL labels report &ldquo;Swing Low&rdquo; for Structure mode, &ldquo;Pulse&rdquo; for Pulse mode, or &ldquo;X ATR&rdquo; for ATR mode</strong>. <strong className="text-white">TP labels report &ldquo;S/R&rdquo; when Structure mode found a real S/R level, or &ldquo;XR&rdquo; when it fell back to R-Multiple, or &ldquo;X ATR&rdquo; for ATR Targets mode</strong>. The operator can audit any level by reading its label &mdash; if a TP says &ldquo;S/R&rdquo;, they know it&apos;s a real structural target; if it says &ldquo;1R&rdquo;, they know it&apos;s a fallback because Structure didn&apos;t find a level there. <strong className="text-white">Transparency through labels makes Risk Map auditable, not magical</strong>.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">ASSET CLASS DRIVES METHOD SELECTION</p>
              <p className="text-sm text-gray-400 leading-relaxed">A 1R stop on bitcoin is structurally different from a 1R stop on EUR/USD. <strong className="text-white">Crypto wicks deeper, ranges further, and has wider intraday volatility relative to baseline</strong>. <strong className="text-white">Forex moves in tight ranges with consistent ATR scaling and respects technical levels with surgical precision</strong>. <strong className="text-white">Stocks and indices move on fundamental flows with strong S/R memory at psychological levels</strong>. Each asset class has a method that works best for it &mdash; and Risk Map&apos;s Auto mode automatically selects per <code className="text-amber-400">syminfo.type</code>. Operators don&apos;t configure per-asset; the engine reads the symbol and applies the right method without explicit setup.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE PLAN IS ATTACHED, NOT A SUGGESTION</p>
              <p className="text-sm text-gray-400 leading-relaxed">A subtle point worth emphasizing. <strong className="text-white">Risk Map is not advisory commentary attached to the signal; it&apos;s the operator&apos;s actual execution plan</strong>. The TP1 in the tooltip is the price where the operator scales 50% off. The SL is the price where the operator&apos;s stop sits. The Risk per unit is the basis for the operator&apos;s position size. The discipline only works if Risk Map is treated as the trade plan, not as ideas to consider. <strong className="text-amber-400">Override the SL = abandon the discipline. Take TPs at different prices = abandon the consistency</strong>. The plan is the plan; treating it as suggestion-level converts CIPHER from a system into a vibes-based indicator.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">The engine decides where; the operator decides whether. <strong className="text-white">Read the plan in the tooltip, verify it makes sense for your account size and style, decide if you trust the setup in this regime, then execute or skip</strong>. Don&apos;t override levels. Don&apos;t reconstruct your own version. Don&apos;t treat Risk Map as &ldquo;ideas the indicator suggests&rdquo;. <strong className="text-white">The plan is the plan</strong>. The 16 lessons that come before this one taught you what context the engine reads; this lesson teaches you the trade plan that comes attached when the signals fire. Same engine, complete loop.</p>
          </div>
        </motion.div>
      </section>

      {/* === S02 — The 6-Atom Risk Map Tooltip === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The 6-Atom Tooltip</p>
          <h2 className="text-2xl font-extrabold mb-4">Entry. SL. TP1. TP2. TP3. Risk Per Unit.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Hover any CIPHER signal label and the tooltip displays the full Risk Map block as part of its content. <strong className="text-white">Six lines, fixed format, identical structure across every asset and timeframe</strong>. The block opens with a header divider <code className="text-amber-400">&#9552;&#9552;&#9552; RISK MAP &#9552;&#9552;&#9552;</code>, then six atoms each on its own line: Entry, SL with method label, TP1 with method label, TP2 with method label, TP3 with method label, Risk per unit. The format is intentionally regular so operators develop muscle memory &mdash; every Risk Map looks the same; only the numbers and method labels change. Consistency across thousands of signals is what makes the format scannable.</p>
          <TooltipAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">The animation shows a real Risk Map tooltip baked verbatim from a NAS100 1D short signal. <strong className="text-white">Entry: 27076.0. SL: 27561.1 (Swing High). TP1: 26590.9 (1R). TP2: 26105.8 (2R). TP3: 25620.6 (3R). Risk: 485.1 per unit</strong>. The method labels reveal which mode was active: SL &ldquo;Swing High&rdquo; means Structure mode picked the recent swing high (this is a short, so SL goes above entry to a structural level). The TP labels &ldquo;1R/2R/3R&rdquo; mean R-Multiple mode &mdash; a fallback that fires when Structure mode doesn&apos;t find clean S/R levels at the right distances. <strong className="text-amber-400">The operator can audit every level by reading its method label</strong>.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">LINE 1 &mdash; ENTRY PRICE</p>
              <p className="text-sm text-gray-400 leading-relaxed">The entry is the close of the signal bar. <strong className="text-white">Format: <code className="text-amber-400">Entry: [price]</code></strong> with the price formatted to the instrument&apos;s mintick precision. For NAS100, mintick is 0.1 so the price reads &ldquo;27076.0&rdquo;; for EUR/USD it would read &ldquo;1.16941&rdquo; with five decimals; for BTC/USD it might read &ldquo;75298.5&rdquo;. <strong className="text-white">The entry price is the operator&apos;s execution reference</strong> &mdash; their fill should land at or near this number on a market order taken at the close of the signal bar. Slippage moves it slightly; the entry price is the engine&apos;s clean reference for everything downstream.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">LINE 2 &mdash; STOP LOSS WITH METHOD LABEL</p>
              <p className="text-sm text-gray-400 leading-relaxed">The SL has the price plus a parenthetical method label. <strong className="text-white">Format: <code className="text-amber-400">SL: [price] ([method])</code></strong>. The method label reads &ldquo;Swing Low&rdquo; or &ldquo;Swing High&rdquo; for Structure mode (depending on long/short), &ldquo;Pulse&rdquo; for Pulse mode, or &ldquo;[N] ATR&rdquo; for ATR mode showing the actual multiplier value. Image 7 shows &ldquo;Swing High&rdquo; meaning Structure mode placed the SL at the recent 10-bar swing high (minus buffer for shorts; plus buffer for longs). <strong className="text-white">The label tells you which method the engine used and lets you trace back to S04&apos;s SL methods coverage</strong> for what each implies operationally.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">LINES 3-5 &mdash; TP1, TP2, TP3 WITH METHOD LABELS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Three TP lines, each with price plus method label. <strong className="text-white">Format: <code className="text-amber-400">TP[N]: [price] ([method])</code></strong>. Method labels: &ldquo;1R/2R/3R&rdquo; for R-Multiple mode, &ldquo;S/R&rdquo; for Structure mode (only when a real level was found), &ldquo;[N] ATR&rdquo; for ATR Targets mode. <strong className="text-white">A subtle but important note</strong>: even in Structure mode, individual TPs can fall back to R-Multiple if no structural level exists at the right distance. So a Structure-mode trade might show TP1 as &ldquo;S/R&rdquo;, TP2 as &ldquo;2R&rdquo;, and TP3 as &ldquo;S/R&rdquo; &mdash; mixed labels indicating partial fallback. Image 7&apos;s example shows uniform &ldquo;1R/2R/3R&rdquo; suggesting clean R-Multiple resolution throughout.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">LINE 6 &mdash; RISK PER UNIT</p>
              <p className="text-sm text-gray-400 leading-relaxed">The closing line gives the operator their position-sizing input. <strong className="text-white">Format: <code className="text-amber-400">Risk: [price-distance] per unit</code></strong>. This is the absolute distance from entry to SL in price terms. Image 7 reads &ldquo;485.1 per unit&rdquo; meaning $485.10 of NAS100 movement between entry and stop. <strong className="text-white">For position sizing</strong>: divide the operator&apos;s dollar-risk-per-trade by this number to get the contract/share quantity. Example: an operator risking $200 per trade on this NAS100 short would size at 200 / 485.1 = 0.41 contracts (rounded down to fit broker minimums). The line removes the math from real-time decision-making.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE TOOLTIP IS DEFAULT-ON, ALWAYS RENDERED</p>
              <p className="text-sm text-gray-400 leading-relaxed">The TP/SL in Tooltip toggle in the inputs panel defaults to <strong className="text-white">ON</strong>. This means every signal label, on every chart, on every asset, automatically includes the Risk Map block in its tooltip without operator configuration. Hover any past signal in chart history and the same six lines appear with the values calculated for that bar at that signal moment. <strong className="text-white">The tooltip is the universal signal-information surface</strong>. Even operators who hide the chart-level TP/SL lines (the other two toggles) still get the tooltip block on hover. Hiding the tooltip is unusual; operators virtually always want the trade plan reachable on demand.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE TOOLTIP COEXISTS WITH SIGNAL CONTEXT</p>
              <p className="text-sm text-gray-400 leading-relaxed">The Risk Map block sits at the bottom of the signal&apos;s tooltip, below all the upstream context (regime, ribbon, pulse, ADX, volume, momentum, tension, reversion). <strong className="text-white">The full tooltip is a complete trading record</strong>: signal source, context tag, multi-timeframe alignment, regime classification, confluence factors, and finally the precomputed trade plan. Reading top-to-bottom gives the operator the entire decision surface in one hover. <strong className="text-white">Image 7 shows this stacking explicitly</strong> &mdash; W: Bull, M: Bull, Regime: TREND, Ribbon: Not stacked, Pulse: Support 15b YOUNG, ADX: 32, Volume: 1.18x, Momentum: 59% DETACHED, Tension: 1.4 ATR, Reversion: MODERATE 48%, +Strong 3/4 factors, then the RISK MAP block.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PRICE FORMATTING USES INSTRUMENT MINTICK</p>
              <p className="text-sm text-gray-400 leading-relaxed">All prices in the tooltip use <code className="text-amber-400">format.mintick</code> &mdash; the instrument&apos;s minimum price increment. For forex pairs like EUR/USD with mintick 0.00001, prices show 5 decimals. For NAS100 with mintick 0.1, prices show 1 decimal. For BTC/USD with mintick 0.01, prices show 2 decimals. <strong className="text-white">This means the displayed precision matches the instrument&apos;s actual quote precision &mdash; no spurious decimals, no trailing zeros</strong>. Operators reading the tooltip get prices that look exactly like the prices on their broker&apos;s order entry screen, which makes mental cross-reference fast and error-free.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE FORMAT IS LOCKED &mdash; MUSCLE MEMORY MATTERS</p>
              <p className="text-sm text-gray-400 leading-relaxed">The 6-line block format never changes. Same divider header, same line order, same field labels (&ldquo;Entry:&rdquo;, &ldquo;SL:&rdquo;, &ldquo;TP1:&rdquo;, &ldquo;TP2:&rdquo;, &ldquo;TP3:&rdquo;, &ldquo;Risk:&rdquo;), same parenthetical method tags. <strong className="text-white">After scanning a few hundred signals, operators build muscle memory: their eyes go directly to the SL price first (sizing reference), the SL method label second (audit), then TP1 (first scale-out), then TP3 (full target)</strong>. The fixed format is what enables this rapid scanning. Variable formats would require re-reading every tooltip from scratch; the locked format converts each tooltip into a 2-second scan.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Six atoms, one hover, complete plan. <strong className="text-white">Hover the signal label, scan top-to-bottom, decide</strong>. Don&apos;t copy values into spreadsheets &mdash; the alert system can deliver the JSON-formatted plan to your trade journal automatically (covered in S13). Don&apos;t reconstruct your own SL or TP &mdash; the engine&apos;s placement is the system&apos;s discipline. <strong className="text-white">If the SL distance is too large for your account, skip the trade or trade a smaller timeframe where the SL would be tighter</strong>. The tooltip is the operator&apos;s primary reading surface for every CIPHER signal; mastering it is mastering the loop between detection and execution.</p>
          </div>
        </motion.div>
      </section>

      {/* === S03 — The Inputs Panel === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The Inputs Panel</p>
          <h2 className="text-2xl font-extrabold mb-4">Three Toggles. Two Methods. Three Targets. One Buffer.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The CIPHER RISK MAP input group exposes nine controls, organized into three logical clusters. <strong className="text-white">Visibility cluster</strong>: TP/SL in Tooltip (default ON), TP Lines on Chart (default OFF), SL Line on Chart (default OFF). <strong className="text-white">Method cluster</strong>: Stop Loss Method (default Auto), Take Profit Method (default Auto). <strong className="text-white">Parameter cluster</strong>: ATR Multiplier (1.5), SL Buffer (0.3), TP1/TP2/TP3 Targets (1, 2, 3). The defaults are calibrated empirically &mdash; most operators never need to change them. Auto mode handles asset-class differences automatically; the buffer prevents wick clips; the 1R/2R/3R ladder is the time-tested classic for risk-reward scaling. <strong className="text-amber-400">Customize sparingly; the defaults are defaults for good reason</strong>.</p>
          <InputsAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">The animation walks through the eight visible input rows from Image 10&apos;s real inputs panel. <strong className="text-white">Each row reveals with its purpose annotated to the right</strong>. Visibility toggles control what renders on the chart and tooltip. Method dropdowns control which logic the engine applies for SL and TP placement. ATR Multiplier and SL Buffer are numeric tuning parameters. TP1/TP2/TP3 Targets are the multipliers for whichever TP mode is active &mdash; in R-Multiple mode they&apos;re R-multiples; in ATR Targets mode they&apos;re ATR multiples; in Structure mode they&apos;re fallback values used only when Structure can&apos;t find an S/R level at the desired distance.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">VISIBILITY TOGGLES &mdash; TOOLTIP, TP LINES, SL LINE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Three independent boolean toggles control what the operator sees. <strong className="text-white">TP/SL in Tooltip (default ON)</strong>: adds the 6-line Risk Map block to every signal&apos;s hover. <strong className="text-white">TP Lines on Chart (default OFF)</strong>: draws TP1/TP2/TP3 dashed teal lines extending forward from the signal bar. <strong className="text-white">SL Line on Chart (default OFF)</strong>: draws the SL dashed magenta line. The lines auto-clear when the next signal fires; only the most recent signal&apos;s plan stays visible. <strong className="text-white">Most operators run Tooltip-only by default</strong> for clean charts, then toggle the chart lines ON when actively monitoring a trade in progress for visual stop/target reference.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STOP LOSS METHOD DROPDOWN &mdash; AUTO / STRUCTURE / PULSE / ATR</p>
              <p className="text-sm text-gray-400 leading-relaxed">Four options, default <strong className="text-white">Auto</strong>. <strong className="text-white">Auto</strong> picks per asset class (covered fully in S08). <strong className="text-white">Structure</strong> places SL at the recent 10-bar swing low (long) or swing high (short) minus the buffer. <strong className="text-white">Pulse</strong> places SL at the Cipher Pulse line (signal invalidation level) minus the buffer. <strong className="text-white">ATR</strong> places SL at a fixed distance using the ATR Multiplier (default 1.5x). Each method is mechanically deterministic; given the same chart conditions, each produces the same SL price every time. <strong className="text-white">The operator&apos;s choice is &ldquo;which method best matches my style&rdquo;</strong>; Auto handles asset-class fitting automatically.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">TAKE PROFIT METHOD DROPDOWN &mdash; AUTO / R-MULTIPLE / STRUCTURE / ATR TARGETS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Four options, default <strong className="text-white">Auto</strong>. <strong className="text-white">Auto</strong> picks per asset class. <strong className="text-white">R-Multiple</strong> places TPs at entry &plusmn; (sl_dist &times; multiplier) &mdash; classic risk/reward. <strong className="text-white">Structure</strong> places TPs at the next S/R levels from CIPHER&apos;s Cipher Structure module (with R-Multiple fallback if levels are missing at desired distances). <strong className="text-white">ATR Targets</strong> places TPs at entry &plusmn; (atr &times; multiplier) &mdash; fixed ATR distances independent of SL geometry. The four modes produce visibly different TP ladders; the Auto mode resolution per asset class is what makes Risk Map work across the board without manual configuration.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">ATR MULTIPLIER &mdash; THE ATR-MODE SL DISTANCE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Default <strong className="text-white">1.5</strong>. Used only when SL Method is set to ATR (or when Auto resolves to ATR &mdash; though Auto never resolves to ATR in current logic; it picks Structure or Pulse). <strong className="text-white">1.5x ATR is the operator&apos;s &ldquo;standard&rdquo; distance</strong> &mdash; tight enough to keep R/R favorable, wide enough to absorb normal pullbacks. Operators who want tighter ATR stops can set 1.0 (typical scalper); operators who want wider stops for swing trades can set 2.0+. <strong className="text-white">Tightening ATR multiplier without changing TPs improves R/R but increases stop-out frequency</strong>; widening it reduces stop-outs but degrades R/R. The 1.5 default is the empirical sweet spot.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">SL BUFFER &mdash; THE 0.3 ATR SAFETY CUSHION</p>
              <p className="text-sm text-gray-400 leading-relaxed">Default <strong className="text-white">0.3</strong> in ATR multiples. Applied across all SL methods (Structure, Pulse, ATR all add the buffer). <strong className="text-white">The buffer&apos;s job is to prevent wick clips on noisy bars</strong>: a stop placed exactly at the swing low gets shaken by every retest wick; a stop placed 0.3 ATR below the swing low absorbs typical wick noise. <strong className="text-white">0.3 is the empirical sweet spot</strong>: tighter (0.1-0.2) increases shake-out rate; wider (0.5+) meaningfully degrades R/R without proportional reduction in shake-outs. Operators trading particularly volatile instruments (some crypto pairs, news periods) can widen to 0.4-0.5; the default 0.3 is calibrated for normal conditions.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">TP1/TP2/TP3 TARGETS &mdash; 1 / 2 / 3</p>
              <p className="text-sm text-gray-400 leading-relaxed">Defaults <strong className="text-white">1.0 / 2.0 / 3.0</strong>. Their interpretation depends on the active TP method. <strong className="text-white">In R-Multiple mode</strong>: 1R/2R/3R from entry, calculated as entry &plusmn; (sl_dist &times; multiplier). <strong className="text-white">In ATR Targets mode</strong>: 1.0/2.0/3.0 ATR multiples from entry. <strong className="text-white">In Structure mode</strong>: fallback values when no S/R level exists at the structurally-preferred distance. The 1/2/3 ladder is the time-tested classic; operators who scale 50% at TP1 and trail the balance to TP3 get average exits between 1.5R and 2R per trade, comfortable above break-even on a 50%+ win rate. <strong className="text-white">Scalpers can set 0.5/1.0/1.5</strong>; <strong className="text-white">swing traders can set 1.5/3.0/5.0</strong>; the default 1/2/3 is the cross-style default.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DEFAULTS ARE STARTING POINTS, NOT MANDATES</p>
              <p className="text-sm text-gray-400 leading-relaxed">The empirical defaults work for the median operator on the median asset class on the median timeframe. <strong className="text-white">An operator who scalps 5m EUR/USD might want tighter ATR multipliers and tighter TP ladders</strong>. <strong className="text-white">An operator who swing trades weekly stocks might want wider buffers and wider TPs</strong>. Risk Map exposes the parameters precisely so style customization is possible. <strong className="text-amber-400">The discipline is: pick a configuration, stick with it, evaluate over hundreds of trades, and tune from data, not from feeling</strong>. The defaults are a starting point; tuning is iterative; consistency matters more than optimum.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE INPUTS LIVE UNDER &ldquo;CIPHER RISK MAP&rdquo; HEADER</p>
              <p className="text-sm text-gray-400 leading-relaxed">In the Inputs panel, these nine controls cluster under the <code className="text-amber-400">&#9472;&#9472;&#9472; CIPHER RISK MAP &#9472;&#9472;&#9472;</code> group header, sitting between the Signal Engine controls (above) and the Command Center controls (below). <strong className="text-white">The visual grouping makes finding the controls fast</strong> &mdash; operators looking to tune trade plan parameters scroll directly to the Risk Map header. The group sits above the Command Center because Risk Map drives the trade plan at signal-time, while Command Center drives the operator&apos;s scanning surface across all rows including Risk. The vertical order in the inputs panel mirrors the logical order: detection layers first, plan layer second, monitoring layer last.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Three toggles, two methods, three targets, two parameters. <strong className="text-white">Defaults work for most operators on most assets</strong>. The only configuration most users ever change: turn TP Lines on Chart and SL Line on Chart ON when actively monitoring a trade for visual reference. Method dropdowns left at Auto handle asset-class differences automatically. Parameters left at defaults work cleanly. <strong className="text-white">Override only when you have a measured reason</strong> &mdash; tighter scalping style, wider swing style, instrument-specific volatility. Don&apos;t tune from feeling; tune from data after hundreds of trades. The defaults are defaults because they work.</p>
          </div>
        </motion.div>
      </section>

      {/* === S04 — Three SL Methods === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Three SL Methods</p>
          <h2 className="text-2xl font-extrabold mb-4">Structure At The Swing. Pulse At The Line. ATR At Fixed Distance.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">CIPHER ships three SL placement methods, plus an Auto mode that picks the right one per asset class. <strong className="text-white">Structure</strong> places SL at the recent 10-bar swing low (for longs) or swing high (for shorts) minus the 0.3 ATR buffer &mdash; the trade is wrong if price closes beyond the structural level. <strong className="text-white">Pulse</strong> places SL at the Cipher Pulse line (signal invalidation reference) &mdash; the trade is wrong if the underlying signal pattern breaks. <strong className="text-white">ATR</strong> places SL at a fixed distance using the ATR multiplier (default 1.5x) &mdash; the trade is wrong if price moves more than the typical bar range against entry. Each method has different strengths; Auto mode picks based on what historically performs best for the asset class. <strong className="text-amber-400">Same entry, three different SLs, three different risk distances</strong>.</p>
          <SLMethodsAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">The animation shows the three methods side-by-side on a synthetic chart with a visible swing low and a long entry. <strong className="text-white">Structure SL</strong> sits below the swing low &mdash; structurally meaningful, often the widest of the three on this chart. <strong className="text-white">Pulse SL</strong> sits at the Pulse line &mdash; tighter than Structure here because Pulse trails close to recent price. <strong className="text-white">ATR SL</strong> sits at fixed 1.5 ATR below entry &mdash; widest of all three on this configuration because the ATR distance is large relative to the structural distance. <strong className="text-amber-400">The risk distances differ by 50%+ across methods on the same chart</strong> &mdash; method choice is a meaningful decision that affects R/R math and stop-out probability significantly.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">STRUCTURE METHOD &mdash; AT THE SWING, INVALIDATION-BASED</p>
              <p className="text-sm text-gray-400 leading-relaxed">Structure SL uses <code className="text-amber-400">ta.lowest(low, 10)</code> for longs (recent 10-bar swing low) and <code className="text-amber-400">ta.highest(high, 10)</code> for shorts (recent 10-bar swing high), then subtracts (long) or adds (short) the 0.3 ATR buffer. <strong className="text-white">The reasoning is structural</strong>: if price closes below the recent swing low, the bullish thesis is materially invalidated &mdash; the prior demand zone broke, supply is winning. <strong className="text-white">SL at the swing is the cleanest mechanical definition of &ldquo;the trade is wrong&rdquo;</strong>. Structure-mode SLs are typically the widest of the three methods because swings include extension &mdash; recent volatility&apos;s low/high is usually further from current price than Pulse or fixed-ATR distances. The trade gets more room; R/R suffers; win rate rises (fewer wick clips).</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PULSE METHOD &mdash; AT THE PULSE LINE, SIGNAL-INVALIDATION-BASED</p>
              <p className="text-sm text-gray-400 leading-relaxed">Pulse SL uses the <code className="text-amber-400">pulse_line</code> value from the Cipher Pulse module &mdash; the dynamic S/R line that trails recent price action. SL = pulse_line minus 0.3 ATR buffer (long) or plus 0.3 ATR (short). <strong className="text-white">The reasoning is signal-mechanical</strong>: if price closes through the Pulse line, the underlying signal pattern that fired the entry breaks &mdash; the same pattern would no longer trigger if it tried to fire again. <strong className="text-white">Pulse SLs are typically tighter than Structure</strong> because Pulse trails close to recent price action; the trade gets less room but the stop is mathematically tied to signal logic. R/R improves; win rate degrades (more wick clips). Pulse SL works best in tight ranges where structural swings are too far away to be meaningful.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">ATR METHOD &mdash; FIXED DISTANCE, VOLATILITY-BASED</p>
              <p className="text-sm text-gray-400 leading-relaxed">ATR SL uses <code className="text-amber-400">close &plusmn; atr &times; i_sl_atr</code> where the multiplier defaults to 1.5. <strong className="text-white">No structural reference, no signal reference &mdash; just &ldquo;normal volatility distance&rdquo;</strong>. ATR SLs are mathematically clean and produce consistent risk distances across charts; they don&apos;t care about swing levels or pulse lines. <strong className="text-white">The downside is they&apos;re structurally arbitrary</strong> &mdash; a fixed ATR distance might land in the middle of nothing, neither at a swing nor at a pulse level. Wick clips happen at the same rate as random distances. ATR mode is the simplest, most predictable, and least context-aware of the three. Operators who prefer pure mechanical risk management without structural reasoning use it; everyone else lets Auto pick Structure or Pulse based on asset class.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">AUTO MODE PICKS PER ASSET CLASS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Auto mode reads <code className="text-amber-400">syminfo.type</code> and resolves to one of the three explicit methods. <strong className="text-white">Forex &rarr; Pulse</strong> (tight ranges, Pulse invalidation is clean and matches forex price action). <strong className="text-white">Crypto &rarr; Structure</strong> (volatile wicks need structural protection; Pulse stops get clipped on crypto noise). <strong className="text-white">Stocks/Indices &rarr; Structure</strong> (institutional swing levels matter; Pulse line is too tight for swing-style stock action). Notably, Auto mode never resolves to ATR &mdash; ATR is available as an explicit override but isn&apos;t the empirical best for any standard asset class. <strong className="text-white">Operators who select Auto get the right method for free</strong>; operators who select an explicit method override the asset-class default and live with the consequences.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">METHOD LABEL APPEARS IN TOOLTIP</p>
              <p className="text-sm text-gray-400 leading-relaxed">Whatever method resolved (whether through Auto or explicit choice), the tooltip&apos;s SL line shows the method label in parens. <strong className="text-white">Structure mode &rarr; &ldquo;Swing Low&rdquo; (long) or &ldquo;Swing High&rdquo; (short)</strong>. <strong className="text-white">Pulse mode &rarr; &ldquo;Pulse&rdquo;</strong>. <strong className="text-white">ATR mode &rarr; &ldquo;[N] ATR&rdquo;</strong> showing the actual multiplier. The label gives the operator immediate audit visibility &mdash; they can verify the engine picked the expected method for the asset. If a stocks chart suddenly shows &ldquo;Pulse&rdquo; (typically Forex&apos;s method), something has been overridden manually and the operator knows to check inputs. <strong className="text-white">Method labels make the engine&apos;s decisions auditable in one glance</strong>.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">METHOD CHOICE AFFECTS R/R BY 30-100%</p>
              <p className="text-sm text-gray-400 leading-relaxed">A typical example to make this concrete. EUR/USD on 1H, signal fires. <strong className="text-white">Structure SL might be 25 pips away</strong> (recent swing low - buffer). <strong className="text-white">Pulse SL might be 12 pips away</strong> (Pulse line - buffer). <strong className="text-white">ATR SL at 1.5x might be 18 pips away</strong>. With a fixed TP1 at 1R, the three methods produce TP1 distances of 25, 12, and 18 pips respectively. <strong className="text-white">Win rates and stop-out frequencies differ across methods even at the same R-multiple targets</strong> because shorter stops get hit more often by noise. The right method for an asset class produces the best long-run win-rate-to-R/R balance &mdash; that&apos;s what Auto mode encodes from backtest history.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SL CHOICE COMPOSES WITH TP CHOICE</p>
              <p className="text-sm text-gray-400 leading-relaxed">SL method affects sl_dist (the distance from entry to SL). TP method&apos;s output frequently uses sl_dist as input (R-Multiple TPs are entry &plusmn; sl_dist &times; multiplier). <strong className="text-white">A wider SL pushes R-Multiple TPs further out; a tighter SL pulls them closer</strong>. This means switching SL method changes both SL placement AND TP placement when TP method is R-Multiple. <strong className="text-white">Structure mode for both SL and TP creates a self-consistent structural plan</strong>: SL at swing, TPs at S/R levels (with R-Multiple fallback). Mixed-mode plans (Pulse SL + R-Multiple TP) work fine but require the operator to mentally separate &ldquo;why my SL is here&rdquo; from &ldquo;why my TP is here&rdquo;. Auto mode picks coherent pairs by asset class.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">A SAFETY GUARD WATCHES PULSE SL PLACEMENT</p>
              <p className="text-sm text-gray-400 leading-relaxed">Pulse line ratchets with the trend. After extended moves, the Pulse line can end up on the PROFIT side of the entry &mdash; meaning a bear Pulse SL could land below entry on a short, which is logically wrong (SL would be in profit territory). <strong className="text-white">CIPHER detects this and falls back to ATR SL when it happens</strong>: if <code className="text-amber-400">sl_long &gt;= close</code> or <code className="text-amber-400">sl_short &lt;= close</code>, the engine substitutes the ATR-derived SL. The safety guard fires silently &mdash; the operator just sees a clean SL. The label still reads &ldquo;Pulse&rdquo; in early implementations; later builds may show &ldquo;Pulse-ATR fallback&rdquo;. The mechanism is covered in detail in S12.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Three SL methods; pick Auto unless you have a specific reason. <strong className="text-white">Structure for crypto and stocks; Pulse for forex; ATR is the fallback override</strong>. The method label in the tooltip tells you which one fired &mdash; verify it matches the asset class. Method choice meaningfully affects R/R and stop-out frequency; switching methods mid-session breaks the consistency that makes long-run statistics meaningful. <strong className="text-white">Pick a method per instrument, stick with it, evaluate over hundreds of trades</strong>. Auto mode handles 95% of operators correctly without configuration; the remaining 5% have measured reasons to override.</p>
          </div>
        </motion.div>
      </section>

      {/* === S05 — The 0.3 ATR Buffer === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; The 0.3 ATR Buffer</p>
          <h2 className="text-2xl font-extrabold mb-4">A Tiny Cushion. A Big Difference In Win Rate.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Every CIPHER SL method &mdash; Structure, Pulse, ATR &mdash; adds a <strong className="text-white">0.3 ATR safety buffer</strong> beyond the calculated stop level. The buffer is the engine&apos;s acknowledgment that price action isn&apos;t infinitely precise. Real bars wick beyond their bodies; real swing lows get retested with shake-out wicks; real Pulse lines get briefly punctured before price respects them. <strong className="text-amber-400">A stop placed exactly at the swing low gets clipped by every retest wick</strong>. A stop placed 0.3 ATR below the swing low absorbs typical wick noise without sacrificing significant R/R. The 0.3 figure isn&apos;t arbitrary &mdash; it&apos;s empirically calibrated against thousands of bars across instruments and timeframes. Tighter (0.1-0.2) clips wicks too often; wider (0.5+) meaningfully degrades R/R without proportional reduction in shake-outs.</p>
          <BufferAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">The two-panel comparison shows the same swing-low setup with and without the buffer. <strong className="text-white">Left (NO BUFFER)</strong>: SL placed exactly at the swing low. Two of the post-entry retest wicks pierce below, both producing stop-outs marked with red ✕. The trade gets killed by noise that wasn&apos;t structurally meaningful. <strong className="text-white">Right (WITH 0.3 ATR BUFFER)</strong>: SL placed at swing low minus 0.3 ATR. The same retest wicks happen but stay above the SL. The trade survives the noise and continues to its actual conclusion. <strong className="text-amber-400">Same chart, same swing low, same wicks &mdash; opposite outcomes</strong>. The 0.3 ATR cushion is what differentiates a system that works on real charts from a system that only works on idealized backtests.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">WHY 0.3 (NOT 0.1 OR 0.5)</p>
              <p className="text-sm text-gray-400 leading-relaxed">The 0.3 ATR figure was calibrated empirically against historical wick distributions. <strong className="text-white">In typical conditions, roughly 95% of intraday wicks are within 0.25-0.30 ATR of the bar body</strong>. Setting the buffer at 0.3 ATR means the SL absorbs 95%+ of normal wick noise without being so wide that R/R degrades meaningfully. <strong className="text-white">At 0.1 ATR, the buffer absorbs only ~50% of wicks</strong> &mdash; high stop-out frequency. <strong className="text-white">At 0.5 ATR, the buffer absorbs 99%+ of wicks but pushes R/R from 1:2 to roughly 1:1.6</strong> &mdash; a 20% degradation in expected return per trade. The 0.3 figure is the empirical sweet spot between these extremes; calibrated, not chosen.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">BUFFER APPLIES TO ALL THREE SL METHODS</p>
              <p className="text-sm text-gray-400 leading-relaxed">The buffer isn&apos;t a Structure-mode-only feature. <strong className="text-white">All three SL methods (Structure, Pulse, ATR) add the same 0.3 ATR buffer to their calculated raw level</strong>. Structure-mode raw level is the swing low/high; the actual SL is swing &plusmn; 0.3 ATR. Pulse-mode raw level is the Pulse line; the actual SL is Pulse line &plusmn; 0.3 ATR. ATR-mode raw level is close &plusmn; 1.5 ATR; the actual SL is close &plusmn; 1.5 ATR... wait, ATR mode doesn&apos;t add an additional buffer because the ATR distance itself is the cushion. <strong className="text-white">Correction</strong>: Structure and Pulse add the buffer; ATR mode&apos;s &ldquo;buffer&rdquo; is built into its multiplier. The result is that effective SL distance from price is similar across methods despite different raw-level sources.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">USER-CONFIGURABLE VIA SL BUFFER INPUT</p>
              <p className="text-sm text-gray-400 leading-relaxed">The buffer is exposed via the &ldquo;SL Buffer&rdquo; input in the Risk Map input group. Default is 0.3; range is 0.1 to 1.0 in 0.1 increments. <strong className="text-white">Operators trading particularly volatile assets (specific crypto pairs, news periods) can widen to 0.4-0.5</strong> to absorb the larger noise envelope. <strong className="text-white">Scalpers on calm forex pairs (EUR/USD, USD/JPY in low-volatility sessions) can tighten to 0.2</strong> for better R/R when wicks are statistically smaller. The 0.3 default is the cross-instrument cross-style default; per-instrument tuning is reserved for operators who&apos;ve measured the noise distribution explicitly. Default first; tune from data.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">BUFFER ALSO APPLIES TO STRUCTURE TPs</p>
              <p className="text-sm text-gray-400 leading-relaxed">A subtle detail. <strong className="text-white">When TP method is Structure (TPs at next S/R levels), the engine doesn&apos;t add a buffer to the TP price &mdash; the TP sits exactly at the structural level</strong>. The reasoning: TPs are exit prices, not SL prices. A wick clipping the TP doesn&apos;t hurt the trader; it just means a partial fill might happen slightly early. The buffer is asymmetric &mdash; SL-side wick protection, TP-side no protection. The asymmetry reflects the different operator concerns: SL clips kill trades; TP clips just rearrange the exit timing slightly. <strong className="text-white">No-buffer TPs also produce cleaner labels in the tooltip</strong> (&ldquo;S/R&rdquo; without ATR-distance noise).</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">BUFFER MATTERS MORE AT SHORTER TIMEFRAMES</p>
              <p className="text-sm text-gray-400 leading-relaxed">Shorter timeframes have proportionally larger wick-to-body noise ratios. <strong className="text-white">A 5-minute bar can have a wick that&apos;s 30%+ of its range; a daily bar&apos;s wick is rarely more than 15% of range</strong>. This means the buffer&apos;s impact on stop-out frequency is larger at lower timeframes. <strong className="text-white">An operator scalping 5m EUR/USD without the buffer would have a stop-out rate 2-3x higher than the same setup at 1H or 4H</strong>. The buffer&apos;s value scales inversely with timeframe; lower TFs need it most. CIPHER applies the same 0.3 figure across all timeframes because the figure is in ATR units &mdash; ATR itself rescales with timeframe so the absolute distance scales appropriately while the proportional cushion stays at 0.3.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE BUFFER DOESN&apos;T HIDE THE STRUCTURAL LEVEL</p>
              <p className="text-sm text-gray-400 leading-relaxed">When the SL line renders on chart (toggled by SL Line on Chart input), it draws at the buffered level &mdash; the actual stop. <strong className="text-white">But the underlying structural reference (swing low, Pulse line) is still there in the chart, visible via Cipher Structure or Cipher Pulse if those layers are enabled</strong>. The operator can see both: the SL where the engine stops, and the structural level that drove the SL placement. <strong className="text-white">Visual separation between &ldquo;the engine&apos;s stop&rdquo; and &ldquo;the structural reason for the stop&rdquo;</strong> aids both audit and learning &mdash; experienced operators see the relationship between structure and stops at a glance.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">BUFFER REDUCTIONS COMPOUND DOWNSTREAM</p>
              <p className="text-sm text-gray-400 leading-relaxed">If an operator shrinks the SL buffer from 0.3 to 0.1 to chase tighter R/R, two compounding effects happen. <strong className="text-white">First</strong>: stop-out rate rises (more wicks clip the SL). <strong className="text-white">Second</strong>: when stops do hit, they do so at lower-quality moments &mdash; mid-bar wicks, retest noise, low-conviction shake-outs &mdash; rather than at structurally-clean invalidation points. <strong className="text-amber-400">The trader pays for tighter R/R with both more frequent and less informative stops</strong>. The 0.3 default is the empirical R/R-vs-stop-quality optimum; tightening below it costs more than the R/R math suggests because the additional stops are themselves lower-information events.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SAFETY GUARD STILL APPLIES (S12)</p>
              <p className="text-sm text-gray-400 leading-relaxed">Even with the buffer applied, edge cases can produce a calculated SL on the wrong side of entry &mdash; specifically when Pulse-derived SLs end up on the profit side after extended trends. <strong className="text-white">The SL Safety Guard catches this and falls back to ATR SL</strong> regardless of which method was originally selected. The buffer doesn&apos;t prevent the issue (the issue is structural, not noise-related), but it composes cleanly with the safety guard: the buffer protects against noise; the safety guard protects against logical impossibility. Both layers combine to ensure the SL is always (a) on the loss side of entry and (b) cushioned against typical wick noise. The full edge-case logic is covered in S12.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">The 0.3 ATR buffer is invisible discipline that converts noisy stops into clean ones. <strong className="text-white">Don&apos;t shrink it to chase R/R</strong> &mdash; the math punishes you faster than the shrunk distance helps. <strong className="text-white">Don&apos;t expand it as a panic measure</strong> &mdash; wider stops degrade R/R without proportional benefit. Trust the 0.3 default for normal conditions; tune to 0.4-0.5 only when you have measured noise distributions on a specific instrument. The buffer is the engine&apos;s recognition that markets are imperfect; the operator&apos;s job is to leave the buffer alone and let it do its work invisibly.</p>
          </div>
        </motion.div>
      </section>

      {/* === S06 — Three TP Methods === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Three TP Methods</p>
          <h2 className="text-2xl font-extrabold mb-4">R-Multiple. Structure. ATR Targets.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">CIPHER ships three TP placement methods, plus an Auto mode that picks per asset class. <strong className="text-white">R-Multiple</strong> places TPs at entry &plusmn; (sl_dist &times; multiplier) using the TP1/TP2/TP3 inputs as R-multipliers (default 1/2/3). <strong className="text-white">Structure</strong> places TPs at the next 1st/2nd/3rd S/R levels found by scanning Cipher Structure&apos;s zone_price array, with R-Multiple fallback if structural levels aren&apos;t available at the right distances. <strong className="text-white">ATR Targets</strong> places TPs at entry &plusmn; (atr &times; multiplier) using the TP1/TP2/TP3 inputs as ATR-multipliers. Each method produces a structurally different TP ladder. <strong className="text-amber-400">Same entry, three different ladders, three different exit price points</strong> &mdash; method choice meaningfully affects outcomes over the long run.</p>
          <TPMethodsAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">The three side-by-side panels show the same entry with each TP method applied. <strong className="text-white">R-Multiple (left)</strong>: uniform spacing because each TP is a fixed multiple of sl_dist. TP1 at 1R, TP2 at 2R, TP3 at 3R &mdash; equal vertical gaps. <strong className="text-white">Structure (middle)</strong>: irregular spacing because TPs sit at real S/R levels found by scanning the Structure zone_price array. The first level might be close, the second much further, the third closer again &mdash; depending on what structurally exists. <strong className="text-white">ATR Targets (right)</strong>: uniform spacing because each TP is a fixed ATR multiple. Looks similar to R-Multiple at a glance, but the spacing reference is the instrument&apos;s ATR rather than the trade&apos;s SL distance. <strong className="text-amber-400">Each method encodes a different theory of where price tends to stop</strong>.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">R-MULTIPLE METHOD &mdash; CLASSIC RISK/REWARD</p>
              <p className="text-sm text-gray-400 leading-relaxed">R-Multiple is the time-tested classic. <strong className="text-white">TP1 = entry &plusmn; sl_dist &times; 1.0; TP2 = entry &plusmn; sl_dist &times; 2.0; TP3 = entry &plusmn; sl_dist &times; 3.0</strong>. The default 1/2/3 ladder produces a 1:1, 1:2, and 1:3 risk/reward at each level. Scaling 50% at TP1 + trailing the rest produces an average-exit-R typically between 1.5R and 2R, comfortably above break-even for any system with 50%+ win rate. <strong className="text-white">R-Multiple ignores chart structure entirely</strong> &mdash; the TP could land in the middle of nothing, between levels, at random prices that have no meaning beyond their R-distance from entry. This is a feature, not a bug, in instruments where structural levels are weak (crypto on lower TFs); it&apos;s a flaw in instruments where levels are strong (stocks, indices on higher TFs).</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STRUCTURE METHOD &mdash; REAL S/R LEVELS AS MAGNETS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Structure mode targets real price magnets. <strong className="text-white">TP1 = next S/R level above (long) or below (short) the entry; TP2 = 2nd nearest level; TP3 = 3rd nearest level</strong>. The engine uses helper functions <code className="text-amber-400">find_level_above(close, N)</code> and <code className="text-amber-400">find_level_below(close, N)</code> that scan the zone_price array (populated by Cipher Structure module) for the Nth-closest level with a minimum 0.1 ATR gap from the previous level (to avoid stacking near-duplicate levels). <strong className="text-white">The result is irregular TP spacing that follows actual chart structure</strong> &mdash; TPs land where price has historically reacted, not at fixed multiples. When this works, it produces high-quality fills near real S/R; when no structural level exists at the desired distance, the engine falls back to R-Multiple for that specific TP slot.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STRUCTURE FALLBACK &mdash; NA-AWARE GRACEFUL DEGRADATION</p>
              <p className="text-sm text-gray-400 leading-relaxed">A critical detail. <strong className="text-white">When Structure mode can&apos;t find a level at the desired TP slot, it doesn&apos;t fail or skip the TP &mdash; it falls back to R-Multiple for that slot</strong>. The fallback is per-slot, not all-or-nothing. So a Structure trade might produce TP1 = &ldquo;S/R&rdquo;, TP2 = &ldquo;2R&rdquo; (fallback), TP3 = &ldquo;S/R&rdquo; if the chart has structural levels at TP1 and TP3 distances but not at TP2 distance. <strong className="text-white">Mixed labels in the tooltip reveal this immediately</strong>. The fallback is what makes Structure mode robust &mdash; it never produces missing or undefined TPs even when the chart&apos;s structural memory is sparse. Operators see exactly which TPs are real S/R and which are mathematical fallbacks via the tooltip method labels.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">ATR TARGETS METHOD &mdash; FIXED ATR DISTANCES</p>
              <p className="text-sm text-gray-400 leading-relaxed">ATR Targets is the third option. <strong className="text-white">TP1 = entry &plusmn; atr &times; 1.0; TP2 = entry &plusmn; atr &times; 2.0; TP3 = entry &plusmn; atr &times; 3.0</strong>. Looks similar to R-Multiple but the reference is the instrument&apos;s ATR (a volatility measure) rather than the trade&apos;s SL distance. <strong className="text-white">The two diverge when SL distance differs significantly from 1.0 ATR</strong>. If SL is at 1.5 ATR (typical for ATR-mode SL), R-Multiple TP1 = 1.5 ATR; ATR Targets TP1 = 1.0 ATR. Same TP1 multiplier (1.0), different distances. ATR Targets is best in instruments where volatility matters more than R-relationships &mdash; forex pairs that respect ATR-distance moves but have no structural memory at random R-distances. The forex playbook (covered in S09) uses ATR Targets for exactly this reason.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">METHOD LABEL APPEARS IN TP TOOLTIP LINES</p>
              <p className="text-sm text-gray-400 leading-relaxed">Same as the SL method labels covered in S04. <strong className="text-white">Each TP line in the tooltip shows the method that produced it</strong>: &ldquo;1R/2R/3R&rdquo; for R-Multiple, &ldquo;S/R&rdquo; for Structure (only when a real level was found, not for fallbacks), &ldquo;1.0/2.0/3.0 ATR&rdquo; for ATR Targets. <strong className="text-white">Mixed labels in Structure mode reveal partial fallback transparently</strong>. An operator hovering a Structure-mode signal sees instantly which TPs are real magnets and which are mathematical placeholders &mdash; useful information for trade management because real S/R levels have stronger statistical pull than R-multiple distances. The label is the engine&apos;s honesty layer.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">AUTO MODE PICKS PER ASSET CLASS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Same Auto-mode logic as SL methods. <strong className="text-white">Crypto &rarr; R-Multiple</strong> (momentum-driven; let R run; structural levels are noisy on crypto). <strong className="text-white">Forex &rarr; ATR Targets</strong> (range-bound; fixed ATR distances align with how forex breathes). <strong className="text-white">Stocks/Indices &rarr; Structure</strong> (institutional flow respects S/R; real levels matter more than mathematical distances). Note: Auto picks Structure when symbol is neither crypto nor forex &mdash; this includes commodities, indices, stocks, and any default fallback. The Auto-mode TP resolution is independent of the Auto-mode SL resolution &mdash; you can have Pulse SL + ATR Targets TP (forex) or Structure SL + R-Multiple TP (crypto), each consistent with the asset class&apos;s nature.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">METHOD CHOICE AFFECTS R/R, FILL RATE, AND EXIT QUALITY</p>
              <p className="text-sm text-gray-400 leading-relaxed">A worked comparison. EUR/USD 4H, signal fires, ATR is 50 pips, SL distance from Pulse method is 30 pips. <strong className="text-white">R-Multiple TPs</strong>: 30, 60, 90 pips from entry. <strong className="text-white">ATR Targets TPs</strong>: 50, 100, 150 pips from entry. <strong className="text-white">Structure TPs</strong>: nearest 3 S/R levels which might be 25, 75, 130 pips. <strong className="text-white">Three different ladders, three different fill probabilities, three different average exit qualities</strong>. R-Multiple maximizes R-consistency at the cost of structural ignorance. ATR Targets adapts to volatility but ignores levels. Structure adapts to levels but produces uneven R-multiples. Auto mode picks the right trade-off per asset; manual operators trade with the choice consciously.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">YOU CAN MIX SL AND TP METHODS &mdash; AUTO HANDLES IT</p>
              <p className="text-sm text-gray-400 leading-relaxed">SL method and TP method are independently configurable. <strong className="text-white">You can run Structure SL with R-Multiple TP, or Pulse SL with Structure TP</strong> &mdash; the engine doesn&apos;t enforce coupling. The R-Multiple TP method uses sl_dist as input, so it adapts to whatever SL method produced sl_dist; this means R-Multiple TP works cleanly with any SL method. ATR Targets and Structure TPs don&apos;t depend on SL distance directly &mdash; they use ATR or zone_price independently. <strong className="text-white">Auto mode picks the asset-class-appropriate pair</strong>: Crypto = Structure SL + R-Multiple TP, Forex = Pulse SL + ATR Targets TP, Other = Structure SL + Structure TP. The pairs aren&apos;t arbitrary; they reflect the empirically-best combinations per asset.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Three TP methods; pick Auto unless you have a measured reason. <strong className="text-white">R-Multiple for crypto; ATR Targets for forex; Structure for stocks/indices</strong>. The method label in the tooltip tells you which fired &mdash; verify it matches the asset class. Mixed labels in Structure mode reveal partial fallback; treat &ldquo;S/R&rdquo; TPs as higher-conviction targets than &ldquo;XR&rdquo; fallbacks. Don&apos;t mix methods mid-session for the same instrument &mdash; consistency across hundreds of trades is what makes long-run statistics meaningful. <strong className="text-white">Pick a method per asset, lock it in, evaluate from the data, tune deliberately</strong>.</p>
          </div>
        </motion.div>
      </section>

      {/* === S07 — TP1/TP2/TP3 Ladder === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; The TP Ladder</p>
          <h2 className="text-2xl font-extrabold mb-4">Scale 50% At TP1. 25% At TP2. Trail 25% To TP3.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The three TP levels aren&apos;t targets to be hit one at a time &mdash; they&apos;re a scaling ladder. <strong className="text-white">At TP1, scale 50% of the position off and move the stop to break-even on the remaining 50%</strong>. <strong className="text-white">At TP2, scale 25% of the original position off (50% of the remainder) and trail the stop on the final 25%</strong>. <strong className="text-white">At TP3, close the final 25% and the trade is complete</strong>. The discipline turns every winner into a guaranteed positive-R outcome regardless of how much further the move runs &mdash; once TP1 hits and the stop moves to break-even, the worst case is +0.5R (50% banked at 1R). <strong className="text-amber-400">No scaling = no break-even insurance = every winner can still turn into a loser</strong>. The ladder is the operator&apos;s edge converter; without it, even a high-win-rate system underperforms its theoretical R-expectancy.</p>
          <TPLadderAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">The animation walks through the full position lifecycle. <strong className="text-white">Stage 1 (entry to TP1)</strong>: 100% position, original SL active &mdash; the trade is &ldquo;at risk&rdquo; in its purest form. <strong className="text-white">Stage 2 (TP1 hit)</strong>: 50% banked, stop moved to BE (Entry) &mdash; the trade is now mathematically guaranteed at least break-even, often 0.5R locked. <strong className="text-white">Stage 3 (TP2 hit)</strong>: 75% banked total (50%+25%), stop trailing &mdash; the trade is locking incremental gains. <strong className="text-white">Stage 4 (TP3 hit)</strong>: 100% closed, trade complete &mdash; full plan executed. <strong className="text-amber-400">Position bar at the bottom shows the percentage decay; stop position migrates from SL to BE to TRAIL</strong>. Visual continuity makes the ladder discipline operationally clear.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">SCALE 50% AT TP1 &mdash; THE FOUNDATIONAL DISCIPLINE</p>
              <p className="text-sm text-gray-400 leading-relaxed">The single most important risk-management discipline in CIPHER. <strong className="text-white">When TP1 hits, scale 50% of the position off as a market exit</strong>. The 50% partial converts the trade from &ldquo;risk-on&rdquo; to &ldquo;banked-half-risk-half&rdquo;. <strong className="text-white">Combined with moving the stop on the remaining 50% to break-even, the trade is now mathematically guaranteed positive expectation</strong> regardless of what happens next. Worst case (BE stop hits): +0.5R locked from the 50% scaled. Best case (price runs to TP3 with the 50% balance): +1.75R average. <strong className="text-white">The scale + BE-stop combination is what turns CIPHER from a signal indicator into a system</strong>. Skipping the scale or skipping the BE-move means accepting trades that can still go negative even after winning intermediate targets.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">MOVE STOP TO BREAK-EVEN AT TP1 &mdash; THE INSURANCE LAYER</p>
              <p className="text-sm text-gray-400 leading-relaxed">Equally critical to the scale itself. <strong className="text-white">Once TP1 fills, the stop moves from its original SL position to entry price</strong> (or entry &plusmn; a small buffer to avoid spread/commission impact). The remaining 50% position now has zero downside risk; if price reverses and stops out at BE, the operator keeps the 0.5R from the partial fill. <strong className="text-white">If the BE move is skipped, the worst case becomes -1R on the remaining 50% (which is -0.5R total accounting for the partial)</strong> &mdash; a 0.5R swing in maximum drawdown for an action that takes 5 seconds on most platforms. <strong className="text-amber-400">The BE move is free insurance with infinite ROI</strong>; skipping it is gross malpractice in any serious trading system.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SCALE 25% AT TP2 + TRAIL THE STOP</p>
              <p className="text-sm text-gray-400 leading-relaxed">When TP2 hits (price reaches 2R or 2.0 ATR from entry depending on TP method), scale another 25% of the original position off. <strong className="text-white">Now 75% banked total, 25% remaining</strong>. The stop trails &mdash; usually pegged 50% of the way between entry and the prior TP, or at the most recent micro-pivot, depending on operator style. <strong className="text-white">The trailing stop locks in incremental gains as the trade extends</strong>. If price reverses from TP2 area, the trail catches it before too much of the gain reverses; if price continues to TP3, the trail just keeps following. The 25% partial at TP2 is smaller than the 50% at TP1 because by TP2 the trade has already proven itself; the operator&apos;s remaining job is to let the runner ride.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CLOSE 25% AT TP3 &mdash; FULL EXIT, TRADE COMPLETE</p>
              <p className="text-sm text-gray-400 leading-relaxed">When TP3 hits (3R or 3.0 ATR), close the final 25%. <strong className="text-white">The trade is now fully exited and complete</strong>. Total P&amp;L: 50% &times; 1R + 25% &times; 2R + 25% &times; 3R = 0.5 + 0.5 + 0.75 = <strong className="text-white">1.75R average</strong>. Compared to a single-TP-at-1R approach (0.5R average for a 50% win rate), the ladder generates 3.5x the per-trade R-expectancy. Compared to a hold-to-TP3-only approach, the ladder reduces variance significantly &mdash; many winners stop short of TP3 and the ladder banks 0.75R-1.25R on those instead of the all-or-nothing TP3 outcome. <strong className="text-white">The ladder optimizes both expectancy and consistency simultaneously</strong>.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE LADDER WORKS ACROSS METHODS</p>
              <p className="text-sm text-gray-400 leading-relaxed">The 50% / 25% / 25% sequence is method-agnostic. <strong className="text-white">Whether TPs are at 1R/2R/3R (R-Multiple), at S/R levels (Structure), or at 1.0/2.0/3.0 ATR (ATR Targets), the scaling discipline is identical</strong>. The percentages are tied to the trade&apos;s position management, not to the specific TP method. An operator who runs Auto mode for the methods can apply the same ladder logic mentally regardless of which method actually fired &mdash; the labels in the tooltip change but the operator&apos;s actions don&apos;t. <strong className="text-white">This consistency across methods is what makes the ladder a learnable habit</strong>: practice once, apply everywhere.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CIPHER DOES NOT EXECUTE THE LADDER &mdash; THE OPERATOR DOES</p>
              <p className="text-sm text-gray-400 leading-relaxed">A critical clarification. <strong className="text-white">CIPHER computes the TP levels and broadcasts them in the tooltip + chart lines + JSON alerts</strong>. The actual scaling, stop-moving, and trailing happens in the operator&apos;s broker platform &mdash; CIPHER doesn&apos;t place orders or modify positions. <strong className="text-white">The discipline lives in the operator&apos;s execution habit, supported by CIPHER&apos;s level computation</strong>. Manual operators set the orders themselves at signal time; some use OCO orders to automate partial fills; others use trade-management tools that integrate with TradingView via Pine connector or 3rd-party services. The plan is precomputed; the execution is the operator&apos;s responsibility.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PARTIAL FILLS PROTECT AGAINST FALSE BREAKOUTS</p>
              <p className="text-sm text-gray-400 leading-relaxed">A specific scenario worth highlighting. Some signals fire in CAUTION-zone conditions (covered in L11.20) where mean reversion is statistically more likely than continuation. <strong className="text-white">In these setups, TP1 hits frequently but the move stalls before TP2/TP3</strong>. Operators who don&apos;t scale at TP1 see those trades round-trip back to break-even or worse; operators who scale at TP1 lock at least 0.5R from each. Across hundreds of trades, the ladder discipline turns the &ldquo;false breakout&rdquo; problem from a system-killer into a routine variance pattern. <strong className="text-white">Trade quality variance increases with the volatility of context; the ladder is the universal absorber</strong>.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CUSTOMIZING THE LADDER &mdash; STYLE-DRIVEN VARIATIONS</p>
              <p className="text-sm text-gray-400 leading-relaxed">The 50/25/25 split is the default, but operators can adapt to style. <strong className="text-white">Conservative scalpers might use 70/20/10</strong> &mdash; bank more at TP1 because intraday moves often stall quickly. <strong className="text-white">Aggressive swing traders might use 33/33/34</strong> &mdash; equal partials because daily/weekly moves run further. <strong className="text-white">Mean-reversion operators in CAUTION zones might use 75/25/0</strong> &mdash; skip TP3 entirely because the move is unlikely to extend that far. The 50/25/25 default is the cross-style default; customization should follow measured data on personal style and instrument behavior. <strong className="text-amber-400">Whatever you pick, lock it in for hundreds of trades before evaluating</strong>; consistency makes evaluation possible.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">The ladder is what converts CIPHER signals into a system. <strong className="text-white">Scale 50% at TP1, move stop to break-even, scale 25% at TP2, trail, close 25% at TP3</strong>. The 1.75R average per winner (combined with normal stop-out rates on losers) produces consistent positive expectancy that compounds over months. <strong className="text-white">Skipping the ladder = accepting variance you don&apos;t need</strong>. The discipline is mechanical; muscle memory forms after 50-100 trades. Operators who automate the ladder via OCO or third-party trade-management tools eliminate the discipline-breaking risk of manual execution drift &mdash; highly recommended for any serious deployment.</p>
          </div>
        </motion.div>
      </section>

      {/* === S08 — Asset-Class Auto-Resolution === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Asset-Class Auto-Resolution</p>
          <h2 className="text-2xl font-extrabold mb-4">Crypto, Forex, Stocks. The Engine Reads The Symbol.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">When SL Method or TP Method is set to Auto (the default), the engine reads <code className="text-amber-400">syminfo.type</code> from TradingView&apos;s symbol metadata and resolves to the asset-class-appropriate explicit method. <strong className="text-white">Crypto &rarr; Structure SL + R-Multiple TP</strong>. <strong className="text-white">Forex &rarr; Pulse SL + ATR Targets TP</strong>. <strong className="text-white">Stocks/Indices/everything else &rarr; Structure SL + Structure TP</strong>. The Auto resolution happens at runtime per bar &mdash; same chart, different symbol, different method. <strong className="text-amber-400">Operators don&apos;t configure per-asset; the engine reads the symbol and applies the right method without explicit setup</strong>. The decision tree is simple, fast, and structurally calibrated.</p>
          <AutoModeAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">The animation cycles through three example tickers. <strong className="text-white">BTCUSD with syminfo.type = &ldquo;crypto&rdquo;</strong> matches the crypto branch &mdash; SL Structure + TP R-Multiple. <strong className="text-white">EURUSD with syminfo.type = &ldquo;forex&rdquo;</strong> matches the forex branch &mdash; SL Pulse + TP ATR Targets. <strong className="text-white">NAS100 with syminfo.type = &ldquo;index&rdquo;</strong> falls through to the &ldquo;else&rdquo; branch &mdash; SL Structure + TP Structure. <strong className="text-amber-400">The reason annotation at the bottom explains why each pairing fits its asset class</strong>. The decision tree is structural, not magical &mdash; it encodes empirical findings from cross-asset backtests rather than arbitrary defaults.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">CRYPTO BRANCH &mdash; STRUCTURE SL + R-MULTIPLE TP</p>
              <p className="text-sm text-gray-400 leading-relaxed">Crypto has two characteristics that drive the method choice. <strong className="text-white">First</strong>: volatile wicks routinely punch beyond Pulse-line distances, so Pulse SLs get shaken out frequently. Structure SLs at swing levels survive crypto noise because they sit at deeper, more meaningful retest points. <strong className="text-white">Second</strong>: crypto moves momentum-driven, often extending well beyond static S/R levels because the institutional flow is asymmetric and compounding. R-Multiple TPs let the trade run to whatever R-multiple the move actually reaches; Structure TPs would cap the move at the nearest S/R, leaving runners on the table. <strong className="text-white">Structure SL + R-Multiple TP = protected entries, uncapped exits</strong> &mdash; the right combination for an asset where volatility drives both shake-outs and extensions.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FOREX BRANCH &mdash; PULSE SL + ATR TARGETS TP</p>
              <p className="text-sm text-gray-400 leading-relaxed">Forex characteristics are mirror-opposite to crypto. <strong className="text-white">First</strong>: forex moves in tight ranges with minimal wick excess. Pulse SLs work cleanly because the Pulse line is itself ATR-calibrated; pulse-line distances align with how forex actually breathes. Structure SLs would be unnecessarily wide for the typical forex move. <strong className="text-white">Second</strong>: forex respects ATR distances surgically &mdash; a 1.0 ATR move from entry is structurally meaningful in EUR/USD; a 2.0 ATR move is approaching extension; 3.0 ATR is rare and significant. ATR Targets TPs align with these natural distances. R-Multiple TPs would force the targets to depend on SL distance, which is volatile across forex pairs and timeframes; ATR Targets gives consistent, instrument-relative distances. <strong className="text-white">Pulse SL + ATR Targets TP = tight stops, ATR-respecting exits</strong>.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STOCKS/INDICES BRANCH &mdash; STRUCTURE BOTH WAYS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Stocks, indices, and everything else (commodities, CFDs, ETFs, anything that isn&apos;t crypto or forex) hit the &ldquo;else&rdquo; branch. <strong className="text-white">Structure SL + Structure TP</strong>. The reasoning: institutional flow drives stock and index movement, and institutions respect S/R levels with surgical precision. <strong className="text-white">Stops at structural swings absorb noise without giving up institutional intent; TPs at structural levels land at real magnets where price has historically reverted</strong>. R-Multiple TPs would ignore the S/R history that drives stock action; ATR Targets would target arbitrary distances unrelated to the structural memory. Structure-both-ways encodes &ldquo;follow the institutional roadmap&rdquo; &mdash; the right approach for assets where the roadmap is real and well-defined.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SYMINFO.TYPE IS TRADINGVIEW METADATA</p>
              <p className="text-sm text-gray-400 leading-relaxed">The asset-class detection depends on TradingView&apos;s built-in <code className="text-amber-400">syminfo.type</code> field, populated automatically by TradingView for all standard symbols. Possible values include: <code className="text-amber-400">&quot;forex&quot;</code>, <code className="text-amber-400">&quot;crypto&quot;</code>, <code className="text-amber-400">&quot;stock&quot;</code>, <code className="text-amber-400">&quot;index&quot;</code>, <code className="text-amber-400">&quot;futures&quot;</code>, <code className="text-amber-400">&quot;commodity&quot;</code>, <code className="text-amber-400">&quot;cfd&quot;</code>, <code className="text-amber-400">&quot;bond&quot;</code>. CIPHER&apos;s Auto resolution checks for &ldquo;forex&rdquo; and &ldquo;crypto&rdquo; explicitly; everything else falls through to the &ldquo;Other&rdquo; branch. <strong className="text-white">No operator configuration is needed</strong> &mdash; TradingView sets the value at chart load time based on the exchange and symbol metadata. Operators who use unusual ticker constructions (specific CFDs, custom brokers) can override Auto with explicit method choice if the symbol type is misclassified.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">AUTO MODE NEVER RESOLVES TO ATR (FOR SL)</p>
              <p className="text-sm text-gray-400 leading-relaxed">A subtle but worth-knowing detail. <strong className="text-white">Auto mode for SL never picks ATR &mdash; it picks Structure (crypto, stocks, others) or Pulse (forex) but never ATR</strong>. The reasoning: ATR-mode SL is structurally arbitrary &mdash; it doesn&apos;t reference any market structure or signal mechanic, just &ldquo;normal volatility distance&rdquo;. For any asset class that has structural references available, those references produce better stops than abstract ATR distances. <strong className="text-white">ATR-mode SL is available as an explicit override</strong> for operators who specifically want pure-ATR risk management (e.g. backtesting baselines, or instruments with broken Structure/Pulse data), but it&apos;s never the asset-class-appropriate choice. Auto users will never see &ldquo;1.5 ATR&rdquo; in their SL labels; they&apos;ll see &ldquo;Swing Low&rdquo; or &ldquo;Pulse&rdquo;.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SAME LOGIC AT EVERY TIMEFRAME</p>
              <p className="text-sm text-gray-400 leading-relaxed">The Auto resolution doesn&apos;t change per timeframe. <strong className="text-white">EUR/USD on 5m, 1H, 4H, and Daily all resolve to Pulse SL + ATR Targets TP &mdash; the asset class drives the choice, not the chart context</strong>. The methods themselves scale appropriately because Pulse line, ATR, and structural levels all rescale with timeframe. A 5m forex chart has tighter Pulse, smaller ATR, and closer S/R levels than a Daily forex chart; the methods produce TF-appropriate distances automatically. <strong className="text-white">Operator workflow is consistent across timeframes</strong> &mdash; the same method label appears, the same ladder discipline applies, the same scaling logic works. Multi-timeframe traders benefit most: switching from 1H to 4H doesn&apos;t require re-learning the trade plan structure.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">MANUAL OVERRIDE IS ALWAYS AVAILABLE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Operators who want to override Auto can set the SL Method or TP Method dropdowns to an explicit choice. <strong className="text-white">The override applies globally to all signals on that chart from that point forward</strong>; toggle back to Auto to restore asset-class resolution. Common override scenarios: testing a method&apos;s behavior on a specific symbol, applying a personal style preference (e.g. always use Structure regardless of asset), or working with a misclassified symbol where Auto picks the wrong branch. <strong className="text-white">Most operators leave Auto on permanently</strong>; the override is rarely needed once the engine&apos;s asset-class logic is trusted. The dropdown exists for transparency and edge cases, not for daily configuration.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SL AND TP AUTO RESOLUTIONS ARE INDEPENDENT</p>
              <p className="text-sm text-gray-400 leading-relaxed">Both SL Method and TP Method default to Auto, but the resolutions are computed independently. <strong className="text-white">Auto SL on EUR/USD picks Pulse; Auto TP on EUR/USD picks ATR Targets</strong> &mdash; the two methods are different but both forex-appropriate. An operator can set SL Method to Auto and TP Method to a specific override (e.g. Structure) without affecting the SL resolution. The independence makes mixed configurations possible: Auto-resolved SL with manual TP, or vice versa. The default Auto-Auto pair is what most operators use; explicit overrides are for measured-style customizations.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Auto mode is the default. <strong className="text-white">Crypto = Structure SL + R-Multiple TP. Forex = Pulse SL + ATR Targets TP. Everything else = Structure both ways</strong>. Verify the method labels in the tooltip match the asset class &mdash; if a forex chart shows &ldquo;Swing Low&rdquo; SL, something has been overridden manually. The asset-class logic encodes empirical findings from cross-asset backtests; trust it unless you have measured reasons to override. <strong className="text-white">The operator&apos;s job is to read the symbol&apos;s asset class once at chart load and trust that the engine has applied the right method</strong>. Per-trade method decisions aren&apos;t needed; per-symbol overrides are rare; the default just works.</p>
          </div>
        </motion.div>
      </section>

      {/* === S09 — The Forex Playbook (Pulse SL + ATR Targets) === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; The Forex Playbook</p>
          <h2 className="text-2xl font-extrabold mb-4">Pulse SL. ATR Targets. Same Logic, Every Timeframe.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Forex is the asset class where Risk Map&apos;s Auto-mode resolution is most distinctive. <strong className="text-white">Pulse SL + ATR Targets TP</strong> &mdash; neither method appears in the crypto or stocks/indices branches. The combination reflects forex&apos;s specific behavior: tight ranges that respect ATR distances, with Pulse-line invalidation as the cleanest signal-mechanical SL. The same logic applies whether you&apos;re trading 5-minute scalps or weekly swings &mdash; only the absolute distances change. <strong className="text-amber-400">Pulse trails close to recent action so SLs are tight; ATR Targets land at fixed multiples so TPs are predictable</strong>. The result is a forex playbook that&apos;s consistent across timeframes and pairs &mdash; the operator&apos;s muscle memory transfers cleanly from EUR/USD 15m to GBP/JPY 4H without method-relearning.</p>
          <ForexLogicAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">The animation cycles through 15m, 4H, and 1D timeframes for the same EUR/USD chart, showing how the Pulse + ATR Targets method scales with timeframe. <strong className="text-white">15m</strong>: ATR ~12 pips, SL distance ~10 pips, TP ladder at 12/24/36 pips &mdash; intraday scalp distances. <strong className="text-white">4H</strong>: ATR ~50 pips, SL ~40 pips, TPs at 50/100/150 pips &mdash; swing scale. <strong className="text-white">1D</strong>: ATR ~120 pips, SL ~95 pips, TPs at 120/240/360 pips &mdash; positional distances. <strong className="text-amber-400">Same logic, three timeframes, distances scale 10-50x</strong> &mdash; but the operator workflow is identical. Pulse trails the chart at every TF; ATR Targets stay uniform at every TF; the ladder discipline applies universally.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">EUR/USD 15M EXAMPLE &mdash; THE INTRADAY SCALP CONFIG</p>
              <p className="text-sm text-gray-400 leading-relaxed">A real EUR/USD 15-minute chart with a fired Long+ signal at 1.16941. <strong className="text-white">SL at 1.16781 (16 pips below entry, Pulse-derived)</strong>. <strong className="text-white">TP1 at 1.16938, TP2 at 1.17001, TP3 at 1.17064 (typical ATR Targets distances at 15m forex ATR)</strong>. The Risk per unit reads ~16 pips. With a $200 risk-per-trade discipline, the operator sizes 200 / (16 &times; pip-value) = appropriate lot size for the account. <strong className="text-white">The Risk row in the Command Center reads SAFE / NORMAL SIZE</strong> indicating no overextension concern; the trade can take full size. The trade-plan attachment is what converts a fast-moving 15-minute setup into a deterministic execution &mdash; no time spent calculating levels mid-bar.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">EUR/USD 4H EXAMPLE &mdash; THE SWING-SCALE CONFIG</p>
              <p className="text-sm text-gray-400 leading-relaxed">Same EUR/USD on the 4H timeframe. A short signal fires at 1.17220. <strong className="text-white">SL at 1.17449 (23 pips above entry, Pulse-derived)</strong>. <strong className="text-white">TP1 at 1.16769 (45 pips below), TP2 at 1.16565 (66 pips below), TP3 at 1.16361 (86 pips below)</strong>. <strong className="text-white">Risk Map row reads WATCH 2b → STAY ALERT</strong> indicating mild stretch but actionable. <strong className="text-amber-400">The 23-pip SL is structurally similar to the 15m&apos;s 16-pip SL once you account for the 3-4x ATR difference</strong>; the engine&apos;s Pulse SL discipline produces proportionate distances at every TF. Same playbook, larger absolute numbers, identical execution pattern.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">EUR/USD DAILY EXAMPLE &mdash; THE POSITIONAL CONFIG</p>
              <p className="text-sm text-gray-400 leading-relaxed">EUR/USD on the Daily timeframe. A Short signal fires at ~1.18000. <strong className="text-white">SL at 1.18586 (~58 pips above entry)</strong>. <strong className="text-white">TP1 at 1.16668 (~133 pips below), TP2 at 1.15901 (~210 pips below), TP3 at 1.15134 (~287 pips below)</strong>. <strong className="text-white">Risk Map row reads SAFE → NORMAL SIZE</strong>. The daily timeframe produces positional distances that hold for days or weeks; the 50/25/25 ladder discipline now plays out over multiple trading days. <strong className="text-white">A 58-pip SL on Daily forex represents a meaningful position size for most retail accounts</strong>; the trade is structurally cleaner because Daily noise is proportionally smaller than intraday noise. The Pulse + ATR Targets logic remains identical &mdash; just bigger numbers.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PULSE SL TRACKS CLOSER THAN STRUCTURE WOULD</p>
              <p className="text-sm text-gray-400 leading-relaxed">The reason forex uses Pulse SL specifically is the tight tracking. <strong className="text-white">Pulse line trails within 1.0-1.5 ATR of recent price action; the recent swing low/high (Structure&apos;s reference) is often 2-3+ ATR away during trending forex moves</strong>. A Structure-based SL on a moving forex pair would be unnecessarily wide, degrading R/R without proportional benefit. Pulse SL gives the trade a tighter mathematical leash that still respects signal logic &mdash; if price closes through Pulse, the underlying signal pattern broke. <strong className="text-white">Forex&apos;s tight ranges and consistent mean-reversion mean Pulse-line breaks are meaningful invalidations</strong>; in volatile crypto, Pulse-line breaks are routine noise.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">ATR TARGETS RESPECT FOREX&apos;S NATURAL DISTANCES</p>
              <p className="text-sm text-gray-400 leading-relaxed">Forex pairs respect ATR distances with surgical precision. <strong className="text-white">A 1.0 ATR move from entry is structurally meaningful; a 2.0 ATR move is approaching extension; a 3.0 ATR move is rare</strong>. ATR Targets place the TP ladder at exactly these natural distances. The 1R/2R/3R approach (R-Multiple) would couple TP distance to SL distance, but in forex, SL distance varies meaningfully with signal-mechanical context (Pulse can be tight or loose depending on how price has been trending). ATR Targets disconnects TPs from SL geometry and places them at structurally-meaningful absolute distances. <strong className="text-white">The result is consistent TP fill rates across signal contexts</strong> &mdash; TP1 hits at similar rates whether the SL was tight or loose because the TP1 distance is constant in ATR units regardless of SL.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FOREX SESSION TIMING MATTERS FOR FILL QUALITY</p>
              <p className="text-sm text-gray-400 leading-relaxed">Forex has session-driven liquidity patterns that affect fill quality. <strong className="text-white">London open (07:00 UTC) and New York open (12:00 UTC) sessions have the highest liquidity and tightest spreads</strong>. Asian session (00:00-06:00 UTC) has lower liquidity and wider spreads. <strong className="text-white">Risk Map fills are best during high-liquidity sessions</strong>; signals that fire during Asian hours sometimes show wider entry slippage than the price referenced in the tooltip. The Command Center includes a Session row that reports the current session; operators can use this as a fill-quality indicator. <strong className="text-amber-400">Don&apos;t override the Risk Map levels because of session-specific concerns</strong>; just accept that lower-liquidity sessions produce slightly noisier fills around the same prices.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PULSE SAFETY GUARD STILL FIRES ON FOREX</p>
              <p className="text-sm text-gray-400 leading-relaxed">The SL safety guard described in S04 (and detailed fully in S12) applies to forex too. <strong className="text-white">In extended forex trends, the Pulse line can ratchet far enough that a Pulse-derived SL ends up on the profit side of entry</strong>. When this happens, the safety guard substitutes ATR-mode SL automatically. The fallback is invisible to the operator at the tooltip level &mdash; they just see a clean SL price &mdash; but the SL distance is now atr-based rather than pulse-based. <strong className="text-white">Forex traders should understand this can happen on aggressive trend continuations</strong> where Pulse has trailed too tight; the safety guard ensures the SL remains on the loss side of entry under all conditions.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FOREX-SPECIFIC TUNING IS USUALLY UNNECESSARY</p>
              <p className="text-sm text-gray-400 leading-relaxed">Most operators trading forex via CIPHER never need to override the defaults. <strong className="text-white">Auto mode picks Pulse SL + ATR Targets TP, the 0.3 ATR buffer absorbs typical wick noise, and the 1/2/3 TP ladder produces clean R/R distributions</strong>. Operators who scalp 1m or 5m forex might want to widen the buffer to 0.4-0.5 (more wick noise on lower TFs) or tighten the ATR multiplier on TPs to 0.7/1.4/2.1 (intraday scalps don&apos;t typically reach 3 ATR extensions). Operators who position-trade weekly forex might want wider buffers and TPs reaching 4-5 ATR. <strong className="text-white">For 80%+ of forex use cases, the defaults work cleanly</strong> &mdash; the tuning conversation only matters when measured edge cases require it.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Forex Risk Map = Pulse SL + ATR Targets TP. <strong className="text-white">Tight stops at Pulse-line invalidation; uniform TP spacing at 1/2/3 ATR multiples</strong>. Same logic at every timeframe; only the absolute distances change. Verify the tooltip&apos;s SL label reads &ldquo;Pulse&rdquo; on forex pairs &mdash; if it doesn&apos;t, something has been overridden. <strong className="text-white">Trust Auto mode; trust the 0.3 buffer; trust the 1/2/3 ladder</strong>. Forex&apos;s consistent breathing pattern is exactly what the Pulse + ATR Targets combination is calibrated for. The operator&apos;s job: read the plan, decide whether the setup is worth taking, execute the ladder. The engine&apos;s job: produce the right plan automatically. Each layer plays its position.</p>
          </div>
        </motion.div>
      </section>

      {/* === S10 — The Crypto Playbook (Structure SL + R-Multiple TP) === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; The Crypto Playbook</p>
          <h2 className="text-2xl font-extrabold mb-4">Structure SL. R-Multiple TP. Survive Wicks, Ride Runners.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Crypto is the asset class where Pulse-style stops fail and momentum-style targets thrive. <strong className="text-white">Structure SL + R-Multiple TP</strong> &mdash; the Auto-resolution for any symbol with <code className="text-amber-400">syminfo.type == &ldquo;crypto&rdquo;</code>. The combination encodes two facts about crypto behavior: wicks routinely punch deep (so SLs need structural depth, not Pulse-line tightness) AND momentum runs extend uncapped (so TPs should respect R-multiples, not arbitrary structural levels that might cap a clean trend). <strong className="text-amber-400">Protected entries, uncapped exits</strong>. The same Auto resolution applies whether you&apos;re trading BTC on the 5m or ETH on the daily &mdash; only the absolute distances change.</p>
          <CryptoLogicAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">The two-panel comparison shows what happens when the wrong method is used. <strong className="text-white">Left (Pulse SL on crypto)</strong>: deep wicks at bars 10-12 punch through the Pulse-derived SL, marked with red ✕. The trade is shaken out by routine crypto noise &mdash; the signal pattern was correct, the SL placement was wrong for the asset class. <strong className="text-white">Right (Structure SL on crypto)</strong>: the same deep wicks happen but stay above the Structure-derived SL (placed at the recent swing low minus buffer). The trade survives the noise. R-Multiple TPs at 1R/2R/3R let the momentum continuation run to its natural extension. <strong className="text-amber-400">Same chart, same wicks, opposite outcomes &mdash; method choice matters most on crypto</strong>.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">WHY STRUCTURE SL FOR CRYPTO</p>
              <p className="text-sm text-gray-400 leading-relaxed">Crypto markets have the deepest intraday wicks of any retail-tradeable asset class. <strong className="text-white">Routine wicks of 1.5-2.0 ATR are common during normal price action; news wicks can exceed 3 ATR briefly</strong>. Pulse line trails within 1.0-1.5 ATR of recent action &mdash; meaning wicks routinely puncture Pulse-derived stops. Structure SL at the 10-bar swing low/high sits deeper, often 2-3 ATR from current price, which absorbs all routine wick noise without giving up structural meaning. <strong className="text-white">A swing-low break on crypto is genuinely meaningful</strong>: when price closes below a recent swing, the bullish thesis materially changed; a wick beyond Pulse line means nothing. Structure SL converts crypto&apos;s wick volatility from a stop-out generator into a non-event.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHY R-MULTIPLE TP FOR CRYPTO</p>
              <p className="text-sm text-gray-400 leading-relaxed">Crypto momentum runs frequently extend 5-10R or more from entry. <strong className="text-white">Bull runs in BTC routinely produce 20-50% moves in days; alt seasons compound multi-hundred-percent moves over weeks</strong>. Structure TPs would cap these moves at the nearest S/R level &mdash; which on crypto is often 1.5-3R away &mdash; leaving the runner on the table. R-Multiple TPs at 1R/2R/3R let the trade scale partially at meaningful intermediate distances while the final 25% balance can ride to the actual move&apos;s exhaustion via trailing stop. <strong className="text-white">Crypto is a runners-pay-the-system asset class</strong>; capping at S/R kills the compounding edge.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE BTC 1D EXAMPLE &mdash; A WORKED CASE</p>
              <p className="text-sm text-gray-400 leading-relaxed">A real BTC/USD daily chart with a Short signal that just fired (1 bar ago). <strong className="text-white">Entry: ~78000. SL: 80177 (~2177 above entry, Structure-derived from recent swing high)</strong>. <strong className="text-white">TP1: 73984 (1R below = 4016 distance). TP2: 70887 (2R below = 7113 distance). TP3: 67790 (3R below = 10210 distance)</strong>. <strong className="text-white">Risk Map row reads SAFE / NORMAL SIZE</strong>. <strong className="text-amber-400">Notice the TP distances</strong>: TP3 at $67,790 is $10,210 below entry &mdash; a 13% move. Structure-mode TPs would have capped this at maybe 5-7% based on the nearest S/R; R-Multiple lets the full momentum potential play out. The 50% scale at TP1 banks early; the 25% rides to TP3 if the move continues.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CRYPTO STRUCTURE SLs ARE OFTEN 2-4% AWAY</p>
              <p className="text-sm text-gray-400 leading-relaxed">A characteristic worth noting for position sizing. <strong className="text-white">A typical Structure SL on crypto is 2-4% from entry on Daily, 1-2% on 4H, 0.5-1% on 1H, 0.2-0.5% on 15m</strong>. These are wider than typical forex SLs (5-30 pips, often 0.05-0.30%) in absolute percentage terms. Operators sizing crypto trades to fixed dollar risk per trade need smaller crypto positions per dollar than they would for forex &mdash; the wider SL distance means the position must be smaller to keep the same risk-per-trade. <strong className="text-white">Position size = dollar-risk-per-trade / (entry-to-SL distance &times; coin-price)</strong>. The Risk Map &ldquo;Risk per unit&rdquo; line gives this distance directly &mdash; no manual calculation needed.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">CRYPTO 24/7 AFFECTS STRUCTURE FRESHNESS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Unlike forex (24/5 with weekend gap) and stocks (8 hours/day with overnight gaps), crypto trades continuously. <strong className="text-white">This means Structure swing levels stay continuously fresh &mdash; the engine&apos;s 10-bar lookback always references genuinely recent action</strong>. There&apos;s no &ldquo;weekend gap means yesterday&apos;s swing low is stale&rdquo; problem. <strong className="text-white">Crypto Structure SLs are arguably the cleanest of any asset class</strong> because the underlying structural references are continuously current. Operators monitoring crypto across multiple sessions get the same Structure-mode behavior at every check-in; the engine&apos;s read doesn&apos;t need recalibration after a session break.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CRYPTO ATR EXPANDS ON BREAKOUTS &mdash; SLs ADAPT</p>
              <p className="text-sm text-gray-400 leading-relaxed">Crypto bull and bear breakouts produce ATR expansions of 2-5x baseline within 24-48 hours. <strong className="text-white">When ATR expands, the 0.3 ATR buffer expands proportionally &mdash; the buffer&apos;s percentage size stays at 30% of current ATR regardless</strong>. This means crypto Structure SLs widen automatically during volatile periods (giving the trade more room when more is needed) and tighten back when ATR normalizes. <strong className="text-white">The buffer&apos;s ATR-relative scaling is what makes Risk Map work across crypto&apos;s volatility regime shifts</strong> &mdash; no operator tuning required even when BTC moves from 2% daily ranges to 8% daily ranges during a major trend break.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PARTIAL FILLS WORK BETTER ON CRYPTO THAN FOREX</p>
              <p className="text-sm text-gray-400 leading-relaxed">A subtle execution detail. <strong className="text-white">Crypto exchange order books typically have higher liquidity at all price levels than forex spreads</strong> &mdash; major coins (BTC, ETH) have deep books at every meaningful price. This means partial-fill orders for the 50/25/25 scaling ladder execute cleanly on crypto: TP1 at 1R fills exactly, TP2 at 2R fills exactly, TP3 at 3R fills exactly. <strong className="text-white">Forex partial fills sometimes get spread-shifted by 1-2 pips during low-liquidity sessions</strong>; crypto partial fills are usually exact-price. The execution-quality bonus on crypto is one reason the asset class supports the R-Multiple ladder cleanly.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">METHOD LABEL CONFIRMS &ldquo;Swing Low&rdquo; OR &ldquo;Swing High&rdquo;</p>
              <p className="text-sm text-gray-400 leading-relaxed">When trading crypto, verify the SL label in the tooltip reads &ldquo;Swing Low&rdquo; (long) or &ldquo;Swing High&rdquo; (short). <strong className="text-white">If it reads &ldquo;Pulse&rdquo;, something has been overridden manually &mdash; the engine&apos;s Auto resolution would have picked Structure</strong>. If it reads &ldquo;1.5 ATR&rdquo; or other ATR multiplier, ATR mode has been explicitly selected. The label discrepancy is the operator&apos;s audit signal that Auto-mode behavior has been bypassed. <strong className="text-white">For most crypto trading, restore Auto mode and trust the asset-class default</strong>; the explicit override is for measured-style customization, not for daily configuration.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Crypto = Structure SL + R-Multiple TP. <strong className="text-white">Wide stops at swing levels absorb noise; uniform R-Multiple TPs let momentum extend</strong>. Verify the SL label reads &ldquo;Swing Low&rdquo; or &ldquo;Swing High&rdquo;. Position-size crypto carefully &mdash; SL distances of 2-4% on Daily mean smaller positions per dollar of risk than forex equivalents. The 50/25/25 ladder banks profits at 1R while letting runners ride to 3R+ on momentum trends. <strong className="text-white">Crypto&apos;s wick-rich, run-friendly behavior is exactly what Structure + R-Multiple is calibrated for</strong>; trust Auto mode and execute the ladder.</p>
          </div>
        </motion.div>
      </section>

      {/* === S11 — The Stocks/Indices Playbook (Structure both ways) === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; The Stocks &amp; Indices Playbook</p>
          <h2 className="text-2xl font-extrabold mb-4">Structure Both Ways. Follow The Institutional Roadmap.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Stocks, indices, and everything else that isn&apos;t crypto or forex (commodities, CFDs, futures, ETFs) hit the &ldquo;Other&rdquo; branch of Auto-mode resolution. <strong className="text-white">Structure SL + Structure TP &mdash; both methods using real S/R levels from the Cipher Structure module</strong>. The reasoning: institutional flow drives stock and index movement, and institutions respect S/R levels with surgical precision. Real S/R levels matter more than R-Multiple math; the chart&apos;s structural memory is the trade plan&apos;s reference. <strong className="text-amber-400">Stops at structural swings absorb noise without giving up institutional intent; TPs at structural levels land at real magnets where price has historically reverted</strong>. The full playbook is &ldquo;follow the roadmap&rdquo; &mdash; no R-Multiple math involved unless Structure-mode TP can&apos;t find a level (in which case it falls back to R-Multiple per slot).</p>
          <StocksLogicAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">The animation shows a NAS100-style chart with Structure levels (R3, R2, R1 above entry; S1 below at SL) drawn as faint amber lines. <strong className="text-white">The signal fires at entry; the SL drops to S1 (Swing Low Structure level); TP1 lands exactly at R1; TP2 at R2; TP3 at R3</strong>. Each TP corresponds to a real historical S/R level &mdash; not a mathematical R-multiple distance. <strong className="text-amber-400">The TP spacing is irregular by design</strong>: R1 might be 2% above entry, R2 might be 5% above, R3 might be 9% above &mdash; based on where institutional levels actually sit on the chart. Stocks respect these levels because the institutional players who originally traded them remember them and re-engage at the same prices.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">WHY STRUCTURE SL FOR STOCKS/INDICES</p>
              <p className="text-sm text-gray-400 leading-relaxed">Stocks and indices have less wick-noise than crypto but more than forex. <strong className="text-white">A typical Structure SL on a stock or index sits 1-3 ATR from current price &mdash; deep enough to absorb noise, tight enough to keep R/R favorable</strong>. Pulse SL would be too tight (Pulse trails close to recent action; stock pullbacks routinely retest Pulse before continuing). ATR SL would be structurally arbitrary &mdash; a 1.5 ATR distance might land in the middle of nothing. <strong className="text-white">Structure SL at the recent swing low (long) or swing high (short) lands at a real institutional reference</strong>: the price where prior buying or selling pressure last decisively turned the market. If price closes through that level, the institutional thesis materially changed.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHY STRUCTURE TP FOR STOCKS/INDICES</p>
              <p className="text-sm text-gray-400 leading-relaxed">Unlike crypto&apos;s momentum-driven moves, stocks and indices respect S/R levels with mathematical precision. <strong className="text-white">A clear S/R level on SPY, QQQ, or NAS100 is where institutional limit orders cluster &mdash; price reaches the level, partial fills happen, and the move pauses or reverses</strong>. R-Multiple TPs would ignore this institutional behavior; the TP at 2R might land between two S/R levels, in dead space where price has no reason to stop. <strong className="text-white">Structure TPs at real S/R levels align with where the trade is actually likely to fill at scale</strong> &mdash; partial scale-outs execute cleanly because the levels are real magnets with real liquidity. Risk Map mode for stocks delivers exits where the institutions are already trading.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE NAS100 1H EXAMPLE &mdash; ACTIVE LONG TRADE</p>
              <p className="text-sm text-gray-400 leading-relaxed">A real US 100 (NAS100) 1-hour chart with an active long signal that fired 15 bars ago. <strong className="text-white">Entry: ~27217. SL: 26986.2 (Swing Low, ~230 below entry, ~0.85% below)</strong>. <strong className="text-white">TP1: 27386.4 (S/R level, ~170 above entry). TP2: 27586.5 (S/R, ~370 above). TP3: 27786.6 (S/R, ~570 above)</strong>. Notice the irregular spacing: 170, 200, 200 increment (TP1 to TP2 is 200; TP2 to TP3 is also 200) &mdash; these aren&apos;t equal because they&apos;re structural levels that just happened to align this way. <strong className="text-white">Risk Map row reads SAFE / NORMAL SIZE / Last Signal 15 bars / ACTIVE</strong>. The trade is in active management mode &mdash; the operator scaled at TP1 already, stop is at break-even, the 25% balance is riding toward TP2.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE NAS100 1D EXAMPLE &mdash; FRESH SHORT</p>
              <p className="text-sm text-gray-400 leading-relaxed">Same NAS100 instrument on the Daily timeframe. <strong className="text-white">A fresh Short signal just fired (1 bar ago, JUST FIRED status)</strong>. <strong className="text-white">Entry: ~27212. SL: 27561.1 (Swing High, ~349 above entry, ~1.3% above). TP1: 26590.9 (S/R, ~620 below). TP2: 26105.8 (S/R, ~1106 below). TP3: 25620.6 (S/R, ~1591 below)</strong>. Notice the spacing here: 620, 485, 485 &mdash; again irregular but with clear structural reasoning. The TP1 is the more recent S/R level (closer); TP2 and TP3 are older institutional levels at deeper price action. <strong className="text-white">The 1D timeframe&apos;s structural levels are spaced wider than the 1H timeframe&apos;s</strong>; same logic, larger absolute distances. Same playbook, scaling cleanly with timeframe.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">STRUCTURE-MODE PARTIAL FALLBACK PER TP SLOT</p>
              <p className="text-sm text-gray-400 leading-relaxed">A critical detail covered briefly in S06 worth re-emphasizing here. <strong className="text-white">When Structure mode can&apos;t find an S/R level at one of the TP slots, it falls back to R-Multiple for that specific slot &mdash; not all-or-nothing</strong>. So a stocks trade might produce TP1 = &ldquo;S/R&rdquo; (level found), TP2 = &ldquo;2R&rdquo; (no level at desired distance, fallback), TP3 = &ldquo;S/R&rdquo; (level found). The mixed labels reveal which TPs are real magnets and which are mathematical placeholders. <strong className="text-white">Mixed labels are normal on charts with sparse structural memory</strong> &mdash; freshly trending stocks that have moved into new price territory often have only 1-2 real S/R levels available for TPs. The fallback makes Structure mode robust; the labels make the fallback transparent.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SESSION GAPS DON&apos;T BREAK STRUCTURE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Stocks and indices trade in sessions (8 hours, weekday-only typically). <strong className="text-white">Overnight gaps and weekend gaps create discontinuities in the price series; the engine handles this by treating gap-bridged levels as still-valid until invalidated by a close beyond them</strong>. A swing low set at Friday&apos;s close that price gaps below at Monday&apos;s open is still tracked as the relevant SL reference until a closing-price-based invalidation occurs. <strong className="text-white">Operators trading after session gaps should verify the Risk Map levels are reasonable for the new opening price</strong>; if a gap dramatically changed the chart, the SL/TP levels may need re-evaluation before entering. The engine reports the levels mechanically; the operator&apos;s judgment handles edge cases.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FUTURES, COMMODITIES, CFDs ALL HIT THIS BRANCH</p>
              <p className="text-sm text-gray-400 leading-relaxed">The &ldquo;Other&rdquo; branch isn&apos;t just stocks and indices &mdash; it&apos;s everything that isn&apos;t crypto or forex. <strong className="text-white">ES (S&amp;P futures), NQ (Nasdaq futures), CL (Crude oil), GC (Gold), and any CFD instrument with syminfo.type set to anything other than &ldquo;crypto&rdquo; or &ldquo;forex&rdquo; resolves to Structure both ways</strong>. The reasoning: institutional flow drives all these markets similarly; the differences between commodity and equity micro-structure are smaller than the differences between either and crypto/forex behavior. <strong className="text-white">A single playbook covers a large portion of CIPHER&apos;s instrument coverage</strong> &mdash; one reason Auto mode is recommended for cross-asset traders.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">METHOD LABELS CONFIRM &ldquo;Swing Low/High&rdquo; AND &ldquo;S/R&rdquo;</p>
              <p className="text-sm text-gray-400 leading-relaxed">Verification at signal time: the SL label should read &ldquo;Swing Low&rdquo; (long) or &ldquo;Swing High&rdquo; (short); TP labels should ideally read &ldquo;S/R&rdquo; (real structural levels). <strong className="text-white">If TP labels show R-multiples instead</strong>, Structure mode fell back because no S/R level existed at the desired distance. This is normal on freshly trending charts but warrants a second look &mdash; if all three TPs are R-multiple fallbacks, the chart has no structural references nearby and the trade is effectively running pure R-Multiple in stocks-mode setup. The label transparency lets the operator audit Structure-mode quality at signal time.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Stocks/Indices = Structure both ways. <strong className="text-white">SL at swing levels for noise absorption; TPs at real S/R levels for institutional-magnet exits</strong>. Verify SL label reads &ldquo;Swing Low/High&rdquo; and TP labels read &ldquo;S/R&rdquo; (mostly &mdash; some R-multiple fallbacks are normal). The irregular TP spacing is a feature, not a bug &mdash; it follows actual chart structure. Session gaps don&apos;t break the system but warrant edge-case verification. <strong className="text-white">Stocks and indices reward operators who follow the institutional roadmap</strong>; Risk Map&apos;s Structure-both-ways approach IS that roadmap, automatically constructed at signal time. Trust the levels; execute the ladder.</p>
          </div>
        </motion.div>
      </section>

      {/* === S12 — The SL Safety Guard === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">12 &mdash; The SL Safety Guard</p>
          <h2 className="text-2xl font-extrabold mb-4">When Pulse Goes Wrong, ATR Steps In.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">An edge case worth its own section. <strong className="text-white">Pulse line ratchets with extended trends &mdash; in some scenarios, a long-running uptrend pulls the Pulse line above the entry price for a short signal, putting the Pulse-derived SL on the profit side</strong>. This is logically impossible: an SL on the profit side of entry would mean the trade is &ldquo;stopped out for a gain&rdquo; before any movement happened &mdash; nonsense. CIPHER detects this condition and substitutes the ATR-derived SL automatically. <strong className="text-amber-400">The substitution is invisible to the operator but ensures the SL is always on the loss side of entry</strong>. The Pine guard is short and direct: <code className="text-amber-400">if sl_long &gt;= close: sl_long := sl_long_atr</code> and the mirror for shorts.</p>
          <SafetyGuardAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">The animation walks through three stages of the safety guard&apos;s lifecycle. <strong className="text-white">Stage 1</strong>: normal Pulse SL placement &mdash; SL below entry on the loss side, trade works as expected. <strong className="text-white">Stage 2</strong>: extended trend ratchets the Pulse line above the entry price for a short signal &mdash; the Pulse-derived SL would land in profit territory (logically impossible). <strong className="text-white">Stage 3</strong>: the safety guard fires &mdash; ATR-derived SL substitutes automatically, restoring the SL to the loss side of entry. <strong className="text-amber-400">Same chart, same Pulse line, same problem detected and corrected silently</strong>. The operator sees only the corrected SL in the tooltip; the substitution happens at calculation time before the tooltip renders.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">WHY THE GUARD EXISTS &mdash; A LOGICAL IMPOSSIBILITY</p>
              <p className="text-sm text-gray-400 leading-relaxed">An SL on the profit side of entry doesn&apos;t make logical sense. <strong className="text-white">If you&apos;re short at 100 and your SL is at 90, your trade is &ldquo;stopped out&rdquo; the moment you enter &mdash; for a 10-point profit before any market movement</strong>. The platform would close the position immediately. This isn&apos;t a stop-loss; it&apos;s a profit-locking malfunction. The Pulse-derived SL can land in this state when extended trends pull the Pulse line past the entry price, which is rare but not impossible &mdash; especially on aggressively trending pairs at lower timeframes where Pulse line trails very tight to recent action. <strong className="text-white">The guard ensures CIPHER never ships an SL that would immediately stop the position out for a gain</strong>.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE PINE IMPLEMENTATION &mdash; TWO LINES</p>
              <p className="text-sm text-gray-400 leading-relaxed">The full safety guard logic in Pine Script is just two conditional lines. <strong className="text-white"><code className="text-amber-400">if sl_long &gt;= close: sl_long := sl_long_atr</code></strong> &mdash; for longs, if the calculated SL is at or above current close, substitute the ATR-derived SL. <strong className="text-white"><code className="text-amber-400">if sl_short &lt;= close: sl_short := sl_short_atr</code></strong> &mdash; for shorts, if the calculated SL is at or below current close, substitute. <strong className="text-white">The check fires at every bar after the SL calculation but before the tooltip render</strong>. Operators never see the broken state; they see only the corrected output. The simplicity of the guard reflects how rare the issue is &mdash; complex logic isn&apos;t needed because the failure mode is well-defined.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE GUARD APPLIES ONLY TO PULSE-MODE SLs</p>
              <p className="text-sm text-gray-400 leading-relaxed">A subtle but important detail. <strong className="text-white">The guard only fires when the active SL method is Pulse (or Auto-resolved-to-Pulse for forex)</strong>. Structure-derived SLs use the recent swing low/high, which is by definition on the loss side of entry &mdash; the swing low is below current price for a long entry; the swing high is above for a short. ATR-derived SLs use entry &plusmn; (atr &times; multiplier), guaranteeing loss-side placement. <strong className="text-white">Only Pulse-derived SLs can land on the profit side</strong> because Pulse line tracks recent price action and can ratchet past entry during extended trends. The guard isn&apos;t needed for the other methods.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHAT THE GUARD SUBSTITUTES &mdash; ATR SL</p>
              <p className="text-sm text-gray-400 leading-relaxed">When the guard fires, it doesn&apos;t fall back to Structure SL &mdash; it falls back to ATR SL specifically. <strong className="text-white">Why ATR? Because the safety guard&apos;s job is mathematical correctness, not asset-class fit</strong>. ATR SL is mechanically deterministic: entry minus (1.5 ATR) for longs, entry plus (1.5 ATR) for shorts. It&apos;s guaranteed to be on the loss side. Structure SL would also work logically, but in extended-trend conditions where Pulse already failed, Structure&apos;s recent swing might also be problematic (the trend has been so strong that recent swings are far away or stale). <strong className="text-white">ATR SL provides a clean, deterministic, distance-based fallback that always works regardless of chart conditions</strong>.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE LABEL REVEALS THE FALLBACK</p>
              <p className="text-sm text-gray-400 leading-relaxed">Earlier implementations of the safety guard kept the SL label as &ldquo;Pulse&rdquo; even after the ATR substitution &mdash; technically misleading because the actual SL was ATR-derived. <strong className="text-white">Newer implementations show the actual method used: &ldquo;Pulse-ATR fallback&rdquo; or simply &ldquo;1.5 ATR&rdquo; depending on the version</strong>. Operators who see an unexpected ATR label on a forex pair can investigate whether the safety guard fired (extended trend pushing Pulse past entry) or whether the method was manually overridden. The label transparency reveals the engine&apos;s decision-making at signal time. <strong className="text-amber-400">Always verify the SL label matches what you expected for the asset class and current trend conditions</strong>.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHEN THE GUARD FIRES &mdash; EXTENDED TRENDS</p>
              <p className="text-sm text-gray-400 leading-relaxed">The guard most commonly fires during extended trends where Pulse line trails extremely tight to recent action. <strong className="text-white">A 20-30 bar uptrend where each bar makes a new high pulls the Pulse line up bar-by-bar; eventually the Pulse line can be 1-2 ATR above the moving-average baseline that the entry was calculated against</strong>. For a short signal in this context (countertrend), the Pulse SL would be 1-2 ATR above the current price, which is where current price already sits &mdash; SL on the profit side. The guard catches this and substitutes 1.5 ATR distance from entry, restoring loss-side placement. <strong className="text-white">Counter-trend setups in strong trends are exactly the conditions where the guard matters most</strong>; it&apos;s a corner-case protector for an inherent Pulse-mode behavior.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE GUARD HAPPENS BEFORE TP CALCULATION</p>
              <p className="text-sm text-gray-400 leading-relaxed">A logical detail: the safety guard fires before TP calculations consume sl_dist. <strong className="text-white">When the guard substitutes ATR SL, the new sl_dist (now ATR-based) is what feeds R-Multiple TP calculations</strong>. So a substitution affects the entire trade plan, not just the SL line. R-Multiple TPs scale with the substituted SL distance; the trade plan stays internally consistent. ATR Targets TPs are unaffected (they don&apos;t depend on sl_dist); Structure TPs are unaffected (they use S/R levels independently). <strong className="text-white">Only R-Multiple TP method is affected by safety-guard substitutions</strong>, and the affect is to keep the TP ladder consistent with the new SL distance.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">OPERATOR SHOULDN&apos;T NEED TO ACT &mdash; IT&apos;S AUTOMATIC</p>
              <p className="text-sm text-gray-400 leading-relaxed">The guard is fully automatic. <strong className="text-white">Operators don&apos;t configure it, can&apos;t disable it, and don&apos;t need to verify it</strong>. The engine handles the substitution silently and ships clean SL prices in tooltips and chart lines. The only operator-side awareness needed is recognizing what the SL label tells you: if forex shows &ldquo;Pulse&rdquo;, normal operation; if forex shows ATR-distance label, either the guard fired or manual override happened. <strong className="text-amber-400">The guard is invisible discipline that ensures the engine never ships logically-broken trade plans</strong>; the operator&apos;s job is to trust that the engine has handled this edge case automatically.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">The SL Safety Guard is invisible insurance. <strong className="text-white">Pulse SLs that would land on the profit side automatically substitute to ATR SLs &mdash; SL stays on the loss side under all conditions</strong>. The fallback is rare (mostly in extended trends with counter-trend signals) but the protection is universal. Verify SL labels: if forex unexpectedly shows ATR-distance, either the guard fired or method was overridden. <strong className="text-white">Don&apos;t override the guard; don&apos;t worry about it firing</strong>. The engine&apos;s job is to ensure the SL is always logically valid; the operator&apos;s job is to trust that this layer of correctness is handled automatically.</p>
          </div>
        </motion.div>
      </section>

      {/* === S13 — TP/SL Lines on Chart === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">13 &mdash; TP/SL Lines On Chart</p>
          <h2 className="text-2xl font-extrabold mb-4">Visual Render. 20-Bar Forward Projection. Auto-Clear.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">When the TP Lines on Chart and SL Line on Chart toggles are enabled, CIPHER renders the most recent signal&apos;s Risk Map levels directly on the chart. <strong className="text-white">Entry is rendered as a dotted white line; SL as a dashed magenta line; TPs as three dashed teal lines (TP1 brightest, TP3 faintest)</strong>. All lines extend forward 20 bars from the signal bar. <strong className="text-amber-400">When the next signal fires, the previous lines auto-clear and the new signal&apos;s lines render</strong> &mdash; only one signal&apos;s plan stays visible at a time. The auto-clear behavior keeps the chart readable even on heavily-signaled instruments and removes the operator&apos;s burden to manually delete stale levels.</p>
          <ChartLinesAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">The animation simulates three signals firing in sequence as price walks left to right. <strong className="text-white">When signal 1 fires, its full Risk Map renders forward 20 bars</strong>. <strong className="text-white">When signal 2 fires, signal 1&apos;s lines auto-clear and signal 2&apos;s lines render</strong>. <strong className="text-white">When signal 3 fires, signal 2&apos;s lines clear and signal 3&apos;s lines render</strong>. Past signal markers (▲ or ▼) stay visible on the chart at their original bars but their associated TP/SL lines are gone &mdash; only the active signal&apos;s plan shows. <strong className="text-amber-400">Signal counter at the top right tracks how many signals have fired in the cycle</strong>. The chart never accumulates clutter; it always shows the current trade plan.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">LINE COLORS AND STYLES &mdash; LOCKED PALETTE</p>
              <p className="text-sm text-gray-400 leading-relaxed">CIPHER uses a locked color and style palette for Risk Map chart lines. <strong className="text-white">Entry: dotted white line at 50 transparency &mdash; visible but not loud, the operator&apos;s reference point</strong>. <strong className="text-white">SL: dashed magenta line at 25 transparency &mdash; vivid enough to scan, faded enough to coexist with chart elements</strong>. <strong className="text-white">TP1: dashed teal at 25 transparency. TP2: dashed teal at 40 transparency. TP3: dashed teal at 55 transparency &mdash; progressively fainter to indicate priority</strong>. The fading TP color cues the operator that TP1 is the primary scale-out target while TP3 is the runner extension. The locked palette means operators trained on one chart can scan another with identical visual conventions.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PRICE LABELS APPEAR AT LINE END</p>
              <p className="text-sm text-gray-400 leading-relaxed">Each Risk Map line has a price label at its forward-projection endpoint. <strong className="text-white">SL label reads &ldquo;SL [price]&rdquo;</strong> &mdash; e.g. &ldquo;SL 1.16781&rdquo;. <strong className="text-white">TP labels read &ldquo;TP1 [price]&rdquo;, &ldquo;TP2 [price]&rdquo;, &ldquo;TP3 [price]&rdquo;</strong>. The labels float to the right of the lines so they don&apos;t overlap with chart price action. <strong className="text-white">Price formatting uses instrument mintick</strong> &mdash; same as the tooltip&apos;s formatting in S02. The labels make the chart self-documenting; an operator scanning a chart from across the room can read the trade plan without hovering anything.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">20-BAR FORWARD PROJECTION</p>
              <p className="text-sm text-gray-400 leading-relaxed">The lines extend exactly 20 bars forward from the signal bar. <strong className="text-white">On a 15-minute chart, that&apos;s 5 hours of forward projection; on a 1H chart, 20 hours; on a Daily chart, 20 trading days</strong>. The 20-bar window is the typical maximum trade duration for CIPHER signals &mdash; most trades complete (hit TP3, get stopped, or get re-signaled) within this window. <strong className="text-white">Lines extending exactly 20 bars give the operator the right amount of forward visibility</strong>: enough to plan the trade lifecycle but not so much that the chart gets cluttered with stale projections. After 20 bars, the lines reach their endpoint and don&apos;t extend further.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">AUTO-CLEAR IS PER-SIGNAL, NOT TIME-BASED</p>
              <p className="text-sm text-gray-400 leading-relaxed">A subtle but important detail. <strong className="text-white">Lines auto-clear when the NEXT signal fires &mdash; not after a fixed time period</strong>. If two hours pass between signals, the original lines stay visible the entire time. If two minutes pass, they clear quickly. <strong className="text-white">The auto-clear is signal-driven, not bar-driven</strong>. This means a long-duration trade where no new signal fires can have its Risk Map lines visible for many bars, even past the 20-bar forward projection (the lines just don&apos;t extend further). Once the next buy or sell signal fires, the chart resets cleanly to show the new plan.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">CHART LINES VS TOOLTIP &mdash; COMPLEMENTARY, NOT REDUNDANT</p>
              <p className="text-sm text-gray-400 leading-relaxed">The chart lines and the tooltip serve different operator needs. <strong className="text-white">Tooltip is hover-on-demand &mdash; reach the trade plan when you specifically check it</strong>. <strong className="text-white">Chart lines are always-visible &mdash; the trade plan is part of your peripheral vision while monitoring</strong>. Operators in active trade-management mode (waiting for TP1 to hit, watching the SL distance) benefit from chart lines. Operators in scan-mode (looking for fresh signals across multiple charts) benefit from tooltip-on-demand. <strong className="text-white">Most operators run tooltip ON, chart lines toggle ON only during active trade monitoring</strong>. The two display layers compose; neither replaces the other.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DEFAULT CONFIGURATION &mdash; TOOLTIP ON, LINES OFF</p>
              <p className="text-sm text-gray-400 leading-relaxed">CIPHER ships with TP/SL in Tooltip default ON, TP Lines on Chart default OFF, SL Line on Chart default OFF. <strong className="text-white">The reasoning</strong>: tooltip works for everyone universally (no chart clutter, hover-on-demand), while chart lines benefit some workflows (active monitoring) but clutter others (multi-chart scanning). The opt-in default for chart lines respects the more conservative preference. <strong className="text-white">Operators who actively trade single charts</strong> typically toggle both line settings ON for the duration of their session. <strong className="text-white">Operators who scan many charts simultaneously</strong> typically leave them OFF and rely on tooltip-on-demand. Either configuration produces the same engine output; only the visual surface changes.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SL AND TP TOGGLES ARE INDEPENDENT</p>
              <p className="text-sm text-gray-400 leading-relaxed">A common-sense detail: TP Lines on Chart and SL Line on Chart are independent toggles. <strong className="text-white">Operators can show only the SL line (without TPs) by toggling SL ON and TPs OFF</strong>. This is unusual but appropriate for some workflows: a swing trader monitoring a long-duration position might want only the SL visible (their stop reference) while preferring to scale at discretionary levels rather than the engine&apos;s precomputed TPs. <strong className="text-white">Conversely, showing only TPs (no SL)</strong> is also possible &mdash; useful for traders who scale at TP levels but use external stop management (e.g. a broker-platform OCO trailing stop). The independence supports diverse execution styles.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CHART LINES DON&apos;T ARTICULATE METHOD &mdash; LABELS DO</p>
              <p className="text-sm text-gray-400 leading-relaxed">A subtle limitation: the chart-line labels show only the level price, not the method. <strong className="text-white">A chart line reads &ldquo;SL 1.16781&rdquo; without indicating whether the SL came from Pulse, Structure, or ATR</strong>. To audit which method fired, the operator hovers the signal label and reads the tooltip&apos;s SL line which includes the method label in parens. <strong className="text-white">This is intentional &mdash; the chart-line labels are kept short to avoid visual clutter</strong>; the tooltip is where method audit lives. Operators who want method visibility on chart can use TradingView&apos;s text annotation tools to add notes; CIPHER itself keeps the chart minimal.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Chart lines are the visual extension of the Risk Map tooltip. <strong className="text-white">Entry dotted white, SL dashed magenta, TPs three dashed teals (brightest to faintest), 20-bar forward projection, auto-clear on next signal</strong>. Toggle ON during active trade monitoring; toggle OFF for multi-chart scanning workflows. The locked palette and consistent geometry mean operators&apos; muscle memory transfers across instruments. Method audit lives in the tooltip; chart lines show prices only. <strong className="text-white">The visual layer is configurable; the underlying intelligence is invariant</strong> &mdash; signals and Risk Maps work the same whether chart lines are visible or not.</p>
          </div>
        </motion.div>
      </section>

      {/* === S14 — The Trade Plan As Discipline === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">14 &mdash; The Trade Plan As Discipline</p>
          <h2 className="text-2xl font-extrabold mb-4">Override The Plan = Abandon The System.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The hardest section to write because the message is uncomfortable. <strong className="text-white">Risk Map only works as a system if the operator treats the plan as the actual execution plan, not as suggestions to consider</strong>. The TP1 in the tooltip is the price where you scale 50% off &mdash; not the price you might scale at if you feel like it. The SL is the price where your stop sits &mdash; not the price you might use unless your gut says wider/tighter. The Risk per unit is your sizing input &mdash; not a number to mentally adjust. <strong className="text-amber-400">Override the plan = abandon the discipline</strong>. The system stops being a system the moment the operator starts second-guessing the precomputed levels. Long-run statistics only work if the trades being measured are actually running the prescribed plan; mixed-execution data tells you nothing about whether the system has edge.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">WHY OVERRIDES FEEL JUSTIFIED IN THE MOMENT</p>
              <p className="text-sm text-gray-400 leading-relaxed">Every override has a reason that feels valid at the time. <strong className="text-white">&ldquo;The SL is too wide for this account size&rdquo;</strong> &mdash; tighten it. <strong className="text-white">&ldquo;TP1 is just below a key resistance level&rdquo;</strong> &mdash; move it. <strong className="text-white">&ldquo;The trend looks really strong&rdquo;</strong> &mdash; skip TP1 entirely and ride to TP2. <strong className="text-white">&ldquo;This signal is high-conviction so I&apos;ll size up&rdquo;</strong> &mdash; ignore the Risk per unit and use a bigger position. Each individual override has its own logic. <strong className="text-amber-400">But the cumulative effect of overrides is to convert a deterministic system into a discretionary one</strong>. Discretionary trading isn&apos;t worse than deterministic per se; it&apos;s a different thing entirely. The operator is no longer trading CIPHER &mdash; they&apos;re trading a personal interpretation of CIPHER, which has unknown long-run statistics because nobody&apos;s ever measured it.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SIZING IS THE ONE LEGITIMATE OPERATOR CONTROL</p>
              <p className="text-sm text-gray-400 leading-relaxed">Risk Map computes the trade plan but doesn&apos;t set the position size in dollars. <strong className="text-white">The operator&apos;s legitimate role is sizing &mdash; how many dollars to risk on each trade given their account, their risk tolerance, their style</strong>. Risk Map gives you Risk per unit (the price distance from entry to SL); the operator multiplies that by their per-trade dollar risk to get position size in contracts/shares/coins. <strong className="text-white">Sizing is operator-controlled because it&apos;s the only correct operator-level variable</strong>. Everything else &mdash; SL placement, TP placement, scaling discipline &mdash; is engine-controlled because it&apos;s structurally calibrated. Sizing too large or too small affects how big a winner or loser feels; the level placements affect whether the trade wins or loses, which is structurally separable.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SKIP IS BETTER THAN OVERRIDE</p>
              <p className="text-sm text-gray-400 leading-relaxed">When a signal&apos;s Risk Map levels feel wrong for the operator&apos;s context (SL too wide for the account, TPs at impossible-looking distances), the right answer is to skip the trade. <strong className="text-white">&ldquo;Skip&rdquo; is a perfectly legitimate operator action</strong> &mdash; it preserves the system&apos;s integrity by leaving the engine&apos;s plan untouched. <strong className="text-white">Override is the wrong answer</strong> because it converts a clean &ldquo;skipped trade with no impact on statistics&rdquo; into a &ldquo;modified trade with unknown statistics&rdquo;. Across hundreds of trades, an operator who skips 10% of signals because they don&apos;t fit context retains clean system data; an operator who modifies 10% of signals to fit context dilutes the data and makes long-run evaluation impossible.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">INPUTS PARAMETER TUNING IS LEGITIMATE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Tuning the Risk Map input parameters (SL Buffer, ATR Multiplier, TP1/TP2/TP3 Targets) is different from overriding individual trades. <strong className="text-white">Parameter tuning changes the engine&apos;s output for ALL future signals consistently &mdash; the system stays deterministic, just with different parameters</strong>. An operator who tightens TP1 from 1.0 to 0.7 sees that change applied to every future signal; the long-run statistics measure the new configuration. <strong className="text-white">Parameter tuning is auditable, comparable, and statistically valid</strong>. Per-trade overrides are none of those things. The right way to customize Risk Map is via parameters, not via per-trade adjustments. <strong className="text-amber-400">Tune the inputs, lock the inputs, run hundreds of trades, evaluate</strong>.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE TWO LAYERS OF DISCIPLINE</p>
              <p className="text-sm text-gray-400 leading-relaxed">CIPHER&apos;s Risk Map produces a trade plan; the operator executes it via the broker platform. <strong className="text-white">The two layers must align</strong>: if the engine says SL at 1.16781, the broker order must be set at 1.16781. If the engine says TP1 at 1.16938 with 50% scale, the broker partial fill must execute at 1.16938. <strong className="text-white">Most execution discipline failures happen at the broker layer</strong> &mdash; not setting the SL at all, setting it at a different price, forgetting to scale at TP1, holding past TP1 hoping for more. The engine&apos;s plan is precomputed and visible; the operator&apos;s job is to faithfully translate it into broker orders. Discipline lives in the bridge between engine output and platform execution.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">AUTOMATION REDUCES DISCIPLINE FAILURES</p>
              <p className="text-sm text-gray-400 leading-relaxed">For operators who struggle with execution discipline, automation is the answer. <strong className="text-white">CIPHER&apos;s JSON alert payloads (covered briefly in S13) include all Risk Map levels &mdash; entry, SL, TP1/TP2/TP3, sl_mode, tp_mode</strong>. These can be fed into broker integrations (TradingView webhooks to broker APIs, third-party trade-management tools) that automatically place SL and TP orders matching the engine&apos;s plan. The automation eliminates discretion at the execution layer &mdash; the trader can&apos;t accidentally override SL because they&apos;re not setting it manually. <strong className="text-white">Automation isn&apos;t required to use Risk Map effectively</strong>, but operators who measure their execution-discipline performance and find themselves drifting should strongly consider it.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">EDGE CASE &mdash; SAFETY-GUARD-INVOLVED TRADES</p>
              <p className="text-sm text-gray-400 leading-relaxed">When the SL Safety Guard fires (S12), the engine substitutes ATR SL for what would have been Pulse SL. <strong className="text-white">The substituted plan is still the engine&apos;s plan &mdash; it&apos;s the corrected output, not a fallback to discretion</strong>. Operators should treat safety-guard-involved trades identically to normal trades: take the entry, set the SL, scale at TPs. The fact that the SL came from ATR rather than Pulse doesn&apos;t change the discipline; the engine has already made the correction logic-correct. <strong className="text-white">Don&apos;t treat &ldquo;ATR SL on a forex pair&rdquo; as a reason to override the plan</strong> &mdash; it&apos;s a normal output of the engine&apos;s safety-guard system, not a signal that something is wrong.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE EXIT STRATEGY IS THE LADDER, NOT INTUITION</p>
              <p className="text-sm text-gray-400 leading-relaxed">A specific override pattern worth calling out: holding past TP1 because the trade &ldquo;feels strong&rdquo;. <strong className="text-white">This is the most common discipline failure in Risk Map execution</strong>. The trader sees TP1 hit, momentum still strong, and decides to skip the 50% scale-out hoping for the full move. Sometimes this works; often it doesn&apos;t. <strong className="text-white">Across hundreds of trades, the 50/25/25 ladder produces 1.75R average per winner</strong>; the &ldquo;hold to TP3&rdquo; approach produces a higher peak R-per-trade but with much higher variance and a meaningfully lower win rate (because partial scale-outs convert near-misses into 0.5R wins instead of break-even round-trips). <strong className="text-amber-400">The ladder is the system&apos;s edge converter</strong>; skipping it gives up the consistency that makes long-run statistics work.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">The plan is the plan. <strong className="text-white">Take the entry at engine close. Set SL at engine SL. Scale 50% at TP1, move stop to BE. Scale 25% at TP2, trail. Close 25% at TP3</strong>. Don&apos;t override individual trades; tune parameters globally if you want different behavior. Skip is better than override. Sizing is the only legitimate operator control; everything else is engine-determined. <strong className="text-white">Automation eliminates execution-layer drift</strong>; consider it if measured discipline performance shows you&apos;re drifting. The system only works if the operator runs the system; partial compliance is statistically worse than full compliance OR full discretion.</p>
          </div>
        </motion.div>
      </section>

      {/* === S15 — The Cheat Sheet === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">15 &mdash; The Cheat Sheet</p>
          <h2 className="text-2xl font-extrabold mb-4">Everything You Need, One Reference Card</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Print this section. Pin it next to your charts. <strong className="text-white">The cheat sheet collapses every actionable rule from the lesson into a single dense reference</strong> &mdash; tooltip atoms, input panel, SL methods, TP methods, ladder discipline, asset-class auto-resolution, safety guard, chart lines, edge cases. Use it to verify a setup before entering, to check level placements after entering, to recognize an edge case in real time. The whole CIPHER Risk Map system, distilled.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE 6-ATOM TOOLTIP (S02)</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">Entry: [price]</strong> &middot; <strong className="text-white">SL: [price] ([method])</strong> &middot; <strong className="text-white">TP1: [price] ([method])</strong> &middot; <strong className="text-white">TP2: [price] ([method])</strong> &middot; <strong className="text-white">TP3: [price] ([method])</strong> &middot; <strong className="text-white">Risk: [price-distance] per unit</strong>. Method labels: SL = &ldquo;Swing Low/High&rdquo; (Structure), &ldquo;Pulse&rdquo;, or &ldquo;[N] ATR&rdquo;. TPs = &ldquo;1R/2R/3R&rdquo; (R-Multiple), &ldquo;S/R&rdquo; (Structure), or &ldquo;[N] ATR&rdquo; (ATR Targets).</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SL METHODS (S04)</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">Structure</strong>: ta.lowest(low, 10) &mdash; buffer (long) / ta.highest(high, 10) + buffer (short). <strong className="text-white">Pulse</strong>: pulse_line &mdash; buffer (long) / pulse_line + buffer (short). <strong className="text-white">ATR</strong>: close &mdash; atr &times; multiplier (default 1.5). All three add 0.3 ATR buffer. <strong className="text-white">Auto resolution</strong>: forex &rarr; Pulse, crypto/stocks/everything else &rarr; Structure (never resolves to ATR).</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">TP METHODS (S06)</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">R-Multiple</strong>: entry &plusmn; sl_dist &times; [1, 2, 3] (defaults). <strong className="text-white">Structure</strong>: nearest 1st/2nd/3rd S/R levels (na fallback to R-Multiple per slot). <strong className="text-white">ATR Targets</strong>: entry &plusmn; atr &times; [1, 2, 3]. <strong className="text-white">Auto resolution</strong>: crypto &rarr; R-Multiple, forex &rarr; ATR Targets, stocks/indices/everything else &rarr; Structure.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SCALING LADDER (S07)</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">At TP1: scale 50% off + move stop to break-even on remaining 50%</strong>. <strong className="text-white">At TP2: scale 25% off (50% of remaining) + trail stop on final 25%</strong>. <strong className="text-white">At TP3: close final 25%</strong>. Average exit per winner: 50% &times; 1R + 25% &times; 2R + 25% &times; 3R = 1.75R.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">ASSET-CLASS AUTO-RESOLUTION (S08-S11)</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">Crypto (syminfo.type = &ldquo;crypto&rdquo;)</strong>: SL Structure + TP R-Multiple. Wide stops absorb wicks; uncapped TPs ride momentum. <strong className="text-white">Forex (syminfo.type = &ldquo;forex&rdquo;)</strong>: SL Pulse + TP ATR Targets. Tight stops at signal invalidation; ATR-respecting exits. <strong className="text-white">Stocks/indices/everything else</strong>: SL Structure + TP Structure. Real S/R magnets at both ends. <strong className="text-white">Auto mode is the default</strong>; manual override available but rarely needed.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE 0.3 ATR BUFFER (S05)</p>
              <p className="text-sm text-gray-400 leading-relaxed">All SL methods add 0.3 ATR buffer to absorb wick noise. <strong className="text-white">95%+ of typical wicks are within 0.25-0.30 ATR of bar bodies</strong>; 0.3 absorbs them without meaningfully degrading R/R. Tighter (0.1-0.2) clips wicks; wider (0.5+) hurts R/R. Default 0.3 is empirically calibrated. Range: 0.1-1.0 in 0.1 increments. Buffer applies asymmetrically &mdash; SL only, not TP.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SAFETY GUARD (S12)</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">Pine guard</strong>: <code className="text-amber-400">if sl_long &gt;= close: sl_long := sl_long_atr</code> + mirror for shorts. Catches Pulse SLs that ratchet to profit side during extended trends. Substitutes ATR SL automatically. Invisible to operator; ensures SL always logically valid.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CHART LINES (S13)</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">Entry: dotted white</strong>, <strong className="text-white">SL: dashed magenta</strong>, <strong className="text-white">TP1/TP2/TP3: dashed teal</strong> (brightest to faintest). 20-bar forward projection. Auto-clear on next signal. <strong className="text-white">Defaults</strong>: tooltip ON, lines OFF. Toggle lines ON during active trade monitoring.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">INPUTS (S03)</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">Visibility</strong>: TP/SL in Tooltip (ON), TP Lines on Chart (OFF), SL Line on Chart (OFF). <strong className="text-white">Methods</strong>: Stop Loss Method (Auto), Take Profit Method (Auto). <strong className="text-white">Parameters</strong>: ATR Multiplier (1.5), SL Buffer (0.3), TP1/TP2/TP3 Targets (1, 2, 3). Defaults work for most operators on most assets. Tune via inputs (consistent for all signals); never override individual trades.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">EDGE-CASE TABLE</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">Mixed S/R + R-Multiple labels in Structure mode</strong>: na-fallback per slot, normal on charts with sparse structural memory. <strong className="text-white">SL Safety Guard fires</strong>: extended trend, Pulse line above entry; ATR SL substitutes silently. <strong className="text-white">Session gaps on stocks</strong>: gap-bridged levels still valid until close-based invalidation. <strong className="text-white">Crypto 24/7</strong>: Structure levels continuously fresh, no stale-reference issues. <strong className="text-white">Misclassified syminfo.type</strong>: manual method override available; rarely needed.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DISCIPLINE TABLE</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">Override individual trade levels</strong>: NO. Tune parameters globally if needed. <strong className="text-white">Skip a signal whose levels feel wrong</strong>: YES, skip is legitimate. <strong className="text-white">Adjust position size to dollar-risk-per-trade</strong>: YES, sizing is the operator&apos;s legitimate variable. <strong className="text-white">Hold past TP1 hoping for more</strong>: NO, this is the most common discipline failure. <strong className="text-white">Use automation to eliminate execution drift</strong>: STRONGLY RECOMMENDED if discipline is measurably weak. <strong className="text-white">Tune inputs and re-evaluate over hundreds of trades</strong>: YES, this is the only correct customization path.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE ENTIRE LESSON IN ONE SENTENCE</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">Every CIPHER signal arrives with a precomputed, asset-class-aware, mechanically-calibrated trade plan attached &mdash; entry, SL, three TPs, risk per unit &mdash; and the operator&apos;s job is to execute the plan faithfully, size from the Risk per unit, scale 50/25/25 at the TP ladder, and never override individual levels.</strong></p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === MISTAKES — SIX COMMON FAILURES === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">Six Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-4">The Failure Modes &mdash; Recognize Them, Avoid Them</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Every operator new to Risk Map makes the same six mistakes. <strong className="text-white">Each one converts the deterministic system into discretionary trading and destroys the long-run statistics that make CIPHER work</strong>. Recognizing them in your own trading is half the fix; the other half is operationalizing the cheat sheet rules above so the mistakes never happen in the first place. Below are the six failure modes ordered by frequency.</p>
          <div className="grid grid-cols-1 gap-4 mt-6">
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 mb-4">
              <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 1 &mdash; OVERRIDING THE SL ON INDIVIDUAL TRADES</p>
              <p className="text-sm text-gray-400 leading-relaxed">Most common mistake. The trader sees the engine&apos;s SL price and decides it&apos;s too wide for their account, so they tighten it to a closer level. <strong className="text-white">This converts a calibrated SL into an arbitrary one</strong> &mdash; the new level has no structural meaning, no signal-mechanic basis, no buffer-aware noise absorption. Stop-out frequency rises; structural awareness drops; long-run statistics become meaningless. <strong className="text-white">Fix</strong>: if the SL is too wide for your account, skip the trade or tune the SL Method parameter globally. Never override per-trade.</p>
            </div>
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 mb-4">
              <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 2 &mdash; HOLDING PAST TP1 HOPING FOR MORE</p>
              <p className="text-sm text-gray-400 leading-relaxed">The second most common mistake. TP1 hits, momentum still strong, the trader skips the 50% scale-out hoping for the full move. <strong className="text-white">Sometimes works; often the trade rounds back through entry and stops at break-even or worse for a 0R outcome</strong>. The 50% scale + BE-stop is what guarantees positive expectation per winner; skipping it accepts variance you don&apos;t need to take. <strong className="text-white">Fix</strong>: scale 50% at TP1 every time, no exceptions. Move stop to BE every time. Let the 25%/25% ladder ride to TP2/TP3 with the safety net of a guaranteed-positive trade locked in.</p>
            </div>
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 mb-4">
              <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 3 &mdash; OVERRIDING METHOD CHOICE PER TRADE</p>
              <p className="text-sm text-gray-400 leading-relaxed">The trader sees the Auto-resolved method and overrides it for a specific trade because the chart &ldquo;looks different&rdquo;. <strong className="text-white">Auto mode encodes empirical findings from cross-asset backtests &mdash; per-trade overrides ignore the data and substitute discretion</strong>. The trade gets a different SL/TP geometry than the system was calibrated for. <strong className="text-white">Fix</strong>: leave Auto mode on permanently. If you have a measured reason to use a different method (proven by backtest data on YOUR account), set it globally via input dropdown so all signals get the same treatment consistently.</p>
            </div>
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 mb-4">
              <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 4 &mdash; MOVING TPs TO &ldquo;OBVIOUS&rdquo; LEVELS</p>
              <p className="text-sm text-gray-400 leading-relaxed">The trader sees TP1 at the engine&apos;s computed price, notices a &ldquo;clear resistance&rdquo; just above, and moves TP1 there. <strong className="text-white">The engine&apos;s TP placement uses the configured method; moving TPs to discretionary levels breaks both the method&apos;s consistency and the ladder&apos;s R-multiple math</strong>. Now the position has a 50% scale at a non-1R distance; the BE-stop math no longer applies cleanly. <strong className="text-white">Fix</strong>: trust the method. If you want TPs at structural levels, use Structure TP method globally; if you want round-number TPs, use ATR Targets globally. Never adjust per-trade.</p>
            </div>
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 mb-4">
              <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 5 &mdash; IGNORING METHOD LABELS IN TOOLTIP</p>
              <p className="text-sm text-gray-400 leading-relaxed">The trader hovers the signal, reads the prices, but doesn&apos;t check the method labels in parens. <strong className="text-white">Method labels are how you audit which mode fired and whether it matches the asset class</strong>. A forex chart unexpectedly showing &ldquo;Swing Low&rdquo; SL means something has been overridden; a Structure-mode trade with all R-multiple TP labels means structural fallback fired across all slots. <strong className="text-white">Fix</strong>: always read the method labels. Verify Auto-mode resolution matches the asset class; investigate any unexpected labels before executing the trade. The labels are the engine&apos;s transparency layer.</p>
            </div>
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 mb-6">
              <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 6 &mdash; SIZING WITHOUT READING RISK PER UNIT</p>
              <p className="text-sm text-gray-400 leading-relaxed">The trader takes a fixed lot size or position quantity without computing the dollar-risk-per-trade. <strong className="text-white">Risk per unit varies trade-to-trade based on SL distance &mdash; a 30-pip SL on EUR/USD risks 6x more per lot than a 5-pip SL</strong>. Fixed-lot sizing means risk per trade fluctuates wildly; some trades risk too much, others too little. The R/R math doesn&apos;t aggregate cleanly. <strong className="text-white">Fix</strong>: every trade, compute position size as (dollar-risk-per-trade) / (Risk per unit from tooltip). Lock the dollar risk per trade across your account; let position size adjust per signal. This is the operator&apos;s legitimate sizing role.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === GAME UI — 5-round scenario challenge === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">The Risk Map Operator Challenge</p>
          <h2 className="text-2xl font-extrabold mb-4">Five Live Scenarios &mdash; Pick The Right Read</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Five real CIPHER situations using the Risk Map module: tooltip method labels, asset-class auto-resolution, override-vs-skip discipline, position sizing math, and safety-guard recognition. Each scenario gives you a tooltip read or chart condition; you pick what an Operator does next. <strong className="text-white">No partial credit, no points</strong> &mdash; the goal is calibrating your gut instinct to the engine&apos;s reading framework. Pick honestly. Read every explanation. By the end you should be able to glance at any Risk Map tooltip and know without thinking which method fired and what your next action is.</p>

          <div className="mb-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-semibold text-amber-400/80 mb-2">PROGRESS</p>
            <div className="flex gap-2 flex-wrap">
              {gameRounds.map((r, i) => {
                const sel = gameSelections[i];
                const correct = r.options.find((o) => o.id === sel)?.correct;
                const dotColor =
                  sel === null
                    ? 'bg-white/10'
                    : correct
                    ? 'bg-teal-400'
                    : 'bg-red-400';
                return (
                  <div key={r.id} className="flex items-center gap-1">
                    <div className={`w-3 h-3 rounded-full ${dotColor}`} />
                    <button
                      type="button"
                      onClick={() => setGameRound(i)}
                      className={`text-xs font-mono px-2 py-1 rounded ${i === gameRound ? 'bg-amber-400/15 text-amber-300' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                      R{i + 1}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {gameRounds[gameRound] && (
            <div className="p-5 rounded-2xl glass-card mb-6">
              <p className="text-xs font-semibold text-amber-400/70 mb-2">ROUND {gameRound + 1} OF {gameRounds.length}</p>
              <p className="text-sm text-amber-300/90 font-mono mb-4 leading-relaxed">{gameRounds[gameRound].scenario}</p>
              <p className="text-base text-white font-semibold mb-5 leading-relaxed">{gameRounds[gameRound].prompt}</p>

              <div className="space-y-3">
                {gameRounds[gameRound].options.map((opt) => {
                  const selected = gameSelections[gameRound] === opt.id;
                  const revealed = gameSelections[gameRound] !== null;
                  const isCorrect = opt.correct;
                  let optClass = 'border-white/10 hover:border-white/20 bg-white/5';
                  if (revealed && selected && isCorrect) optClass = 'border-teal-400/55 bg-teal-500/10';
                  else if (revealed && selected && !isCorrect) optClass = 'border-red-400/55 bg-red-500/10';
                  else if (revealed && !selected && isCorrect) optClass = 'border-teal-400/30 bg-teal-500/5';
                  else if (revealed && !selected) optClass = 'border-white/5 bg-white/[0.02] opacity-60';

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={revealed}
                      onClick={() => {
                        const next = [...gameSelections];
                        next[gameRound] = opt.id;
                        setGameSelections(next);
                      }}
                      className={`w-full text-left p-4 rounded-xl border transition-colors ${optClass}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`text-xs font-bold mt-0.5 ${revealed && isCorrect ? 'text-teal-300' : revealed && selected ? 'text-red-300' : 'text-amber-400/70'}`}>{opt.id.toUpperCase()}.</span>
                        <span className="text-sm text-gray-200 leading-relaxed flex-1">{opt.text}</span>
                      </div>
                      {revealed && selected && (
                        <p className={`text-xs leading-relaxed mt-3 pt-3 border-t border-white/10 ${isCorrect ? 'text-teal-200/85' : 'text-red-200/85'}`}>
                          <span className="font-bold">{isCorrect ? '\u2713 CORRECT \u2014 ' : '\u2717 INCORRECT \u2014 '}</span>
                          {opt.explain}
                        </p>
                      )}
                      {revealed && !selected && isCorrect && (
                        <p className="text-xs text-teal-200/65 leading-relaxed mt-3 pt-3 border-t border-white/10">
                          <span className="font-bold">{'\u2713 CORRECT ANSWER \u2014 '}</span>
                          {opt.explain}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between items-center mt-5 pt-5 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setGameRound(Math.max(0, gameRound - 1))}
                  disabled={gameRound === 0}
                  className="text-sm font-semibold text-gray-400 hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  &larr; Previous
                </button>
                <button
                  type="button"
                  onClick={() => setGameRound(Math.min(gameRounds.length - 1, gameRound + 1))}
                  disabled={gameRound === gameRounds.length - 1}
                  className="text-sm font-semibold text-amber-400 hover:text-amber-300 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next &rarr;
                </button>
              </div>
            </div>
          )}

          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; HOW TO USE THIS</p>
            <p className="text-sm text-gray-400 leading-relaxed">If you missed a round, re-read the corresponding lesson section. Round 1 maps to the tooltip method labels covered in S02 + S04. Round 2 maps to asset-class Auto-resolution in S08 + S10. Round 3 maps to the override-vs-skip discipline in S14. Round 4 maps to position sizing math (Risk per unit usage in S02 + S14). Round 5 maps to the SL Safety Guard in S12. <strong className="text-white">Calibration first; the quiz comes next</strong>.</p>
          </div>
        </motion.div>
      </section>

      {/* === QUIZ UI — 8 multiple choice with submit gate === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">Knowledge Check</p>
          <h2 className="text-2xl font-extrabold mb-4">Eight Questions &mdash; Pass At 66% To Earn The Cert</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Eight short-form questions covering tooltip atoms, SL methods, TP methods, Auto resolution, the buffer, the scaling ladder, the safety guard, chart-line behavior, and the discipline. <strong className="text-white">66% pass threshold (6 of 8 correct)</strong>. Pick all eight, then submit. You&apos;ll see your score, per-question feedback, and &mdash; if you pass &mdash; your Risk Map Operator certificate appears at the bottom of the page.</p>

          <div className="space-y-5">
            {quizQuestions.map((q, qi) => {
              const ans = quizAnswers[qi];
              const correct = q.options.find((o) => o.correct)?.id;
              const isCorrect = ans === correct;
              const showFeedback = quizSubmitted && ans !== null;

              return (
                <div key={q.id} className={`p-5 rounded-2xl glass-card ${quizSubmitted ? (isCorrect ? 'border-teal-400/30' : 'border-red-400/30') : ''}`}>
                  <div className="flex items-start gap-3 mb-4">
                    <span className="text-xs font-bold text-amber-400/70 mt-1">Q{qi + 1}.</span>
                    <p className="text-sm text-white font-semibold leading-relaxed flex-1">{q.question}</p>
                  </div>

                  <div className="space-y-2">
                    {q.options.map((opt) => {
                      const selected = ans === opt.id;
                      const isThisCorrect = opt.correct;
                      let optClass = 'border-white/10 hover:border-white/20 bg-white/[0.02]';
                      if (selected && !quizSubmitted) optClass = 'border-amber-400/40 bg-amber-500/5';
                      if (showFeedback && selected && isThisCorrect) optClass = 'border-teal-400/55 bg-teal-500/10';
                      else if (showFeedback && selected && !isThisCorrect) optClass = 'border-red-400/55 bg-red-500/10';
                      else if (showFeedback && !selected && isThisCorrect) optClass = 'border-teal-400/25 bg-teal-500/5';

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          disabled={quizSubmitted}
                          onClick={() => {
                            if (quizSubmitted) return;
                            const next = [...quizAnswers];
                            next[qi] = opt.id;
                            setQuizAnswers(next);
                          }}
                          className={`w-full text-left p-3 rounded-xl border transition-colors ${optClass}`}
                        >
                          <div className="flex items-start gap-3">
                            <span className={`text-xs font-bold mt-0.5 ${showFeedback && isThisCorrect ? 'text-teal-300' : showFeedback && selected ? 'text-red-300' : selected ? 'text-amber-300' : 'text-gray-500'}`}>{opt.id.toUpperCase()}.</span>
                            <span className="text-sm text-gray-200 leading-relaxed flex-1">{opt.text}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {showFeedback && (
                    <p className={`text-xs leading-relaxed mt-4 pt-4 border-t border-white/5 ${isCorrect ? 'text-teal-200/80' : 'text-red-200/80'}`}>
                      <span className="font-bold">{isCorrect ? '\u2713 CORRECT \u2014 ' : '\u2717 INCORRECT \u2014 '}</span>
                      {q.explain}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {!quizSubmitted && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => setQuizSubmitted(true)}
                disabled={quizAnswers.some((a) => a === null)}
                className="px-8 py-4 rounded-xl font-bold text-base bg-gradient-to-r from-amber-400 to-accent-400 text-black disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              >
                Submit Quiz &rarr;
              </button>
            </div>
          )}

          {quizSubmitted && (
            <div className={`mt-8 p-6 rounded-2xl ${quizPassed ? 'bg-teal-500/10 border border-teal-400/30' : 'bg-red-500/10 border border-red-400/30'}`}>
              <p className="text-xs font-bold tracking-widest uppercase text-amber-400/70 mb-2">RESULT</p>
              <p className="text-3xl font-extrabold mb-2">{quizScore} / {quizQuestions.length} <span className="text-lg font-mono text-gray-400">({quizPercent}%)</span></p>
              {quizPassed ? (
                <p className="text-sm text-teal-200 leading-relaxed">Pass. Your Risk Map Operator certificate is being prepared below. The 66% threshold is calibrated so passing means you can reliably read the engine&apos;s output during live trading without second-guessing the trade plan.</p>
              ) : (
                <p className="text-sm text-red-200 leading-relaxed">Below the 66% threshold. Re-read the sections corresponding to the questions you missed and try the quiz again &mdash; specifically the cheat sheet (S15) which collapses every actionable rule into a single reference card.</p>
              )}
              {!quizPassed && (
                <button
                  type="button"
                  onClick={() => {
                    setQuizSubmitted(false);
                    setQuizAnswers(new Array(quizQuestions.length).fill(null));
                  }}
                  className="mt-4 text-sm font-semibold text-amber-400 hover:text-amber-300"
                >
                  &larr; Reset and try again
                </button>
              )}
            </div>
          )}
        </motion.div>
      </section>

      {/* === CERTIFICATE — Risk Map Operator === */}
      {certRevealed && (
        <section className="max-w-2xl mx-auto px-5 py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">Lesson Complete</p>
            <h2 className="text-2xl font-extrabold mb-4">Your Risk Map Operator Certificate</h2>
            <p className="text-gray-400 leading-relaxed mb-6">Earned by demonstrating proficiency on the eight-question knowledge check. Your certificate ID below is generated uniquely for this session and ties this completion to your Operator profile across the ATLAS Academy. <strong className="text-white">You can now reliably read every CIPHER Risk Map tooltip in real time</strong> &mdash; the six atoms, three SL methods with method labels, three TP methods with na-fallback, asset-class Auto resolution, the 0.3 ATR buffer, the 50/25/25 scaling ladder, the SL Safety Guard, the chart line lifecycle, and the override-vs-skip discipline.</p>

            <div className="relative p-8 rounded-3xl overflow-hidden border border-amber-400/35 bg-gradient-to-br from-amber-500/[0.08] via-yellow-500/[0.04] to-orange-500/[0.06]">
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 30% 20%, rgba(255,179,0,0.10), transparent 60%), radial-gradient(circle at 70% 80%, rgba(255,140,0,0.06), transparent 50%)' }} />

              <div className="relative">
                <div className="flex items-center justify-center mb-6">
                  <Crown className="w-12 h-12 text-amber-400" strokeWidth={1.5} />
                </div>

                <p className="text-center text-xs font-bold tracking-[0.3em] uppercase text-amber-400/70 mb-2">ATLAS Academy &middot; Cipher Pro</p>
                <h3 className="text-center text-3xl font-black mb-3 bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-300 bg-clip-text text-transparent">Risk Map Operator</h3>
                <p className="text-center text-xs tracking-widest uppercase text-amber-400/55 mb-6">Level 11 &middot; Lesson 21 &middot; Visual Layer Arc Complete</p>

                <div className="border-t border-amber-400/15 pt-5 mb-5">
                  <p className="text-center text-sm text-gray-300 leading-relaxed mb-3">This certificate confirms its holder has demonstrated proficiency in the CIPHER Risk Map module &mdash; the 6-atom tooltip block, the three SL methods (Structure / Pulse / ATR) with their 0.3 ATR buffer, the three TP methods (R-Multiple / Structure / ATR Targets) with na-aware fallback, asset-class Auto resolution via syminfo.type, the 50% / 25% / 25% scaling ladder with break-even-stop discipline, the SL Safety Guard for profit-side detection, the auto-clear chart-line lifecycle, and the operator-discipline framework that distinguishes legitimate sizing customization from system-breaking level overrides.</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-black/20 border border-white/5">
                    <p className="text-amber-400/65 font-mono uppercase tracking-wider mb-1">Certificate ID</p>
                    <p className="text-gray-200 font-mono break-all">{certId}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-black/20 border border-white/5">
                    <p className="text-amber-400/65 font-mono uppercase tracking-wider mb-1">Score</p>
                    <p className="text-gray-200 font-mono">{quizScore} / {quizQuestions.length} ({quizPercent}%)</p>
                  </div>
                  <div className="p-3 rounded-lg bg-black/20 border border-white/5">
                    <p className="text-amber-400/65 font-mono uppercase tracking-wider mb-1">Awarded</p>
                    <p className="text-gray-200 font-mono">{new Date().toISOString().slice(0, 10)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-black/20 border border-white/5">
                    <p className="text-amber-400/65 font-mono uppercase tracking-wider mb-1">Issued by</p>
                    <p className="text-gray-200 font-mono">Interakktive Ltd</p>
                  </div>
                </div>

                <div className="mt-6 flex justify-center">
                  <p className="text-xs text-amber-400/50 font-mono uppercase tracking-[0.25em]">Where The Trade Goes, And Where It Doesn&apos;t</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
              <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ &middot; VISUAL LAYER ARC COMPLETE</p>
              <p className="text-sm text-gray-400 leading-relaxed">You&apos;ve earned the badge by demonstrating you can read the engine&apos;s trade plan. <strong className="text-white">The Visual Layer arc is now complete &mdash; Ribbon Engine, Structure + Spine, Imbalance, Sweeps, Risk Envelope, Risk Map</strong>. Six lessons, six certs, the full sensory layer of CIPHER. The next phase is paper trading the Risk Map dimension on a live demo &mdash; OANDA MT5 or any chart with CIPHER applied. Track 30 trades using the engine&apos;s precomputed levels exactly as broadcast, log per-trade method labels, and verify your execution discipline matches the prescribed 50/25/25 ladder. <strong className="text-white">The cert says you can read; the demo says you can execute</strong>. Both matter. With this lesson done, the remaining 6 capstone lessons (L11.22-27) shift focus from individual modules to integration, conviction synthesis, and asset-class adaptation across the full system.</p>
            </div>
          </motion.div>
        </section>
      )}

      {/* === FOOTER — next lesson + back to academy === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="border-t border-white/10 pt-8">
            <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">Visual Layer Arc Complete &middot; Next In Level 11</p>
            <h2 className="text-2xl font-extrabold mb-4">L11.22 &mdash; Cipher Conviction Synthesis</h2>
            <p className="text-gray-400 leading-relaxed mb-6">Lesson 11.21 &mdash; Cipher Risk Map is complete, and with it <strong className="text-white">the entire Visual Layer arc closes out</strong>: Ribbon Engine (L11.16), Structure + Spine (L11.17), Imbalance (L11.18), Sweeps (L11.19), Risk Envelope (L11.20), Risk Map (L11.21). Six modules, six certs, every visual layer of CIPHER mastered. <strong className="text-white">L11.22 begins the integration phase</strong> &mdash; Conviction Synthesis weaves the Visual Layer&apos;s outputs together with the Signal Engine&apos;s context cascades to produce trade-conviction reads that capture more than any individual module can alone. The remaining capstones (L11.23-27) will cover War Room integration, trading discipline frameworks, asset-class adaptation, failure-mode analysis, and the L11.27 Mastery Capstone.</p>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Link
                href="/academy"
                className="flex-1 px-5 py-3 rounded-xl text-center font-bold text-sm bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                &larr; Back to Academy
              </Link>
              <Link
                href="/academy/level/11"
                className="flex-1 px-5 py-3 rounded-xl text-center font-bold text-sm bg-gradient-to-r from-amber-400 to-accent-400 text-black hover:opacity-90 transition-opacity"
              >
                Level 11 Index &rarr;
              </Link>
            </div>

            <p className="text-xs text-gray-600 text-center mt-8 font-mono">
              ATLAS Academy &middot; CIPHER PRO &middot; Level 11 &middot; Lesson 21 &middot; Cipher Risk Map
            </p>
            <p className="text-xs text-gray-600 text-center mt-1 font-mono">
              {scrollY > 0 ? `Scroll: ${scrollY}px` : 'Top of lesson'} &middot; Where The Trade Goes, And Where It Doesn&apos;t
            </p>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
