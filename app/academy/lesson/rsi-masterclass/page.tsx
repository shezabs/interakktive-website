// app/academy/lesson/rsi-masterclass/page.tsx
// ATLAS Academy — Lesson 5.6: RSI Masterclass — Beyond Overbought/Oversold [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 5
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Crown, ArrowRight, ChevronDown } from 'lucide-react';

// ============================================================
// CANVAS ANIMATION COMPONENT
// ============================================================
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
    const loop = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);
      drawFn(ctx, rect.width, rect.height, frameRef.current);
      frameRef.current++;
      animRef.current = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(animRef.current);
  }, [drawFn, height]);
  return (
    <div className="w-full rounded-2xl overflow-hidden bg-black/30 border border-white/5">
      <canvas ref={canvasRef} style={{ width: '100%', height }} />
    </div>
  );
}

// ============================================================
// ANIMATION 1: RSI Divergence — Price HH, RSI LH
// Top panel: price making higher highs
// Bottom panel: RSI making lower highs
// Diagonal lines connect the divergence points
// ============================================================
function RSIDivergenceAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.006;
    const pulse = 0.5 + 0.5 * Math.sin(f * 0.03);

    // Panels
    const priceTop = 28;
    const priceBot = h * 0.44;
    const rsiTop = h * 0.52;
    const rsiBot = h - 20;
    const padL = 30;
    const padR = w - 20;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Bearish Divergence — The Early Warning', w / 2, 14);

    // Labels
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('PRICE', padL, priceTop + 10);
    ctx.fillText('RSI', padL, rsiTop + 10);

    // Price path: two peaks, second higher
    const pricePts = [
      { x: 0, y: 0.5 }, { x: 0.08, y: 0.45 }, { x: 0.15, y: 0.35 },
      { x: 0.25, y: 0.15 }, // Peak 1
      { x: 0.35, y: 0.35 }, { x: 0.42, y: 0.4 }, { x: 0.5, y: 0.35 },
      { x: 0.6, y: 0.2 }, { x: 0.7, y: 0.08 }, // Peak 2 (HIGHER)
      { x: 0.8, y: 0.25 }, { x: 0.88, y: 0.35 }, { x: 1, y: 0.4 },
    ];

    // RSI path: two peaks, second LOWER
    const rsiPts = [
      { x: 0, y: 0.5 }, { x: 0.08, y: 0.4 }, { x: 0.15, y: 0.25 },
      { x: 0.25, y: 0.1 }, // Peak 1 (HIGH)
      { x: 0.35, y: 0.45 }, { x: 0.42, y: 0.55 }, { x: 0.5, y: 0.45 },
      { x: 0.6, y: 0.3 }, { x: 0.7, y: 0.22 }, // Peak 2 (LOWER than Peak 1)
      { x: 0.8, y: 0.5 }, { x: 0.88, y: 0.6 }, { x: 1, y: 0.65 },
    ];

    const toScreenPrice = (pt: { x: number; y: number }) => ({
      x: padL + pt.x * (padR - padL),
      y: priceTop + 15 + pt.y * (priceBot - priceTop - 20),
    });
    const toScreenRSI = (pt: { x: number; y: number }) => ({
      x: padL + pt.x * (padR - padL),
      y: rsiTop + 15 + pt.y * (rsiBot - rsiTop - 20),
    });

    // Draw price line
    ctx.strokeStyle = 'rgba(14,165,233,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    pricePts.forEach((pt, i) => {
      const s = toScreenPrice(pt);
      i === 0 ? ctx.moveTo(s.x, s.y) : ctx.lineTo(s.x, s.y);
    });
    ctx.stroke();

    // Draw RSI line
    ctx.strokeStyle = 'rgba(245,158,11,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    rsiPts.forEach((pt, i) => {
      const s = toScreenRSI(pt);
      i === 0 ? ctx.moveTo(s.x, s.y) : ctx.lineTo(s.x, s.y);
    });
    ctx.stroke();

    // RSI 70 line
    const rsi70y = rsiTop + 15 + 0.15 * (rsiBot - rsiTop - 20);
    ctx.strokeStyle = 'rgba(239,68,68,0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(padL, rsi70y);
    ctx.lineTo(padR, rsi70y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(239,68,68,0.3)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('70', padL - 3, rsi70y + 3);

    // RSI 30 line
    const rsi30y = rsiTop + 15 + 0.75 * (rsiBot - rsiTop - 20);
    ctx.strokeStyle = 'rgba(34,197,94,0.2)';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(padL, rsi30y);
    ctx.lineTo(padR, rsi30y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(34,197,94,0.3)';
    ctx.fillText('30', padL - 3, rsi30y + 3);

    // Peak markers + divergence lines (pulsing)
    const peak1Price = toScreenPrice(pricePts[3]);
    const peak2Price = toScreenPrice(pricePts[8]);
    const peak1RSI = toScreenRSI(rsiPts[3]);
    const peak2RSI = toScreenRSI(rsiPts[8]);

    // Price peaks — higher high arrow
    ctx.strokeStyle = `rgba(14,165,233,${0.4 + pulse * 0.4})`;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(peak1Price.x, peak1Price.y - 5);
    ctx.lineTo(peak2Price.x, peak2Price.y - 5);
    ctx.stroke();
    ctx.setLineDash([]);

    // Arrow head up
    ctx.fillStyle = `rgba(14,165,233,${0.5 + pulse * 0.4})`;
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Higher High ↑', (peak1Price.x + peak2Price.x) / 2, peak2Price.y - 12);

    // RSI peaks — lower high arrow
    ctx.strokeStyle = `rgba(239,68,68,${0.4 + pulse * 0.4})`;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(peak1RSI.x, peak1RSI.y - 5);
    ctx.lineTo(peak2RSI.x, peak2RSI.y - 5);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = `rgba(239,68,68,${0.5 + pulse * 0.4})`;
    ctx.font = 'bold 9px system-ui';
    ctx.fillText('Lower High ↓', (peak1RSI.x + peak2RSI.x) / 2, peak1RSI.y - 10);

    // Vertical connection lines (pulsing)
    ctx.strokeStyle = `rgba(245,158,11,${0.15 + pulse * 0.2})`;
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(peak1Price.x, peak1Price.y + 5);
    ctx.lineTo(peak1RSI.x, peak1RSI.y - 5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(peak2Price.x, peak2Price.y + 5);
    ctx.lineTo(peak2RSI.x, peak2RSI.y - 5);
    ctx.stroke();
    ctx.setLineDash([]);

    // Divider between panels
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, (priceBot + rsiTop) / 2);
    ctx.lineTo(padR, (priceBot + rsiTop) / 2);
    ctx.stroke();

    // Warning label
    ctx.fillStyle = `rgba(239,68,68,${0.4 + pulse * 0.3})`;
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('⚠ MOMENTUM FADING — Energy behind the new high is WEAKER', w / 2, rsiBot + 2);
  }, []);
  return <AnimScene drawFn={draw} height={300} />;
}

// ============================================================
// ANIMATION 2: RSI Range Shift
// Shows RSI operating in bullish range (40-80) vs bearish range (20-60)
// The "overbought/oversold" zones shift with the trend
// ============================================================
function RSIRangeShiftAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;
    const mid = w / 2;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('RSI Range Shift — The Zones MOVE With the Trend', w / 2, 14);

    const chartTop = 32;
    const chartBot = h - 22;
    const chartH = chartBot - chartTop;

    // Helper: RSI value to Y
    const rsiToY = (rsi: number) => chartBot - (rsi / 100) * chartH;

    // --- LEFT: Bullish Regime ---
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Bullish Trend', mid / 2, 28);

    // Bullish range zone (40-80) — green tint
    const bull40 = rsiToY(40);
    const bull80 = rsiToY(80);
    ctx.fillStyle = 'rgba(34,197,94,0.06)';
    ctx.fillRect(20, bull80, mid - 30, bull40 - bull80);
    ctx.strokeStyle = 'rgba(34,197,94,0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(20, bull80); ctx.lineTo(mid - 10, bull80); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(20, bull40); ctx.lineTo(mid - 10, bull40); ctx.stroke();
    ctx.setLineDash([]);

    // Labels
    ctx.fillStyle = 'rgba(34,197,94,0.4)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('80 — resistance', 22, bull80 - 3);
    ctx.fillText('40 — support (NOT 30!)', 22, bull40 + 10);

    // RSI oscillating in bullish range (40-80)
    ctx.strokeStyle = 'rgba(34,197,94,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 25; x < mid - 15; x++) {
      const rx = (x - 25) / (mid - 40);
      const rsi = 60 + Math.sin(t + rx * 12) * 18 + Math.sin(rx * 5 + t * 0.7) * 5;
      const y = rsiToY(Math.max(35, Math.min(82, rsi)));
      x === 25 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Traditional 70/30 lines (dimmed — wrong framework)
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 4]);
    ctx.beginPath(); ctx.moveTo(20, rsiToY(70)); ctx.lineTo(mid - 10, rsiToY(70)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(20, rsiToY(30)); ctx.lineTo(mid - 10, rsiToY(30)); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.font = '6px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('70 (old)', mid - 12, rsiToY(70) + 3);
    ctx.fillText('30 (old)', mid - 12, rsiToY(30) + 3);

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(mid, chartTop); ctx.lineTo(mid, chartBot); ctx.stroke();
    ctx.setLineDash([]);

    // --- RIGHT: Bearish Regime ---
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Bearish Trend', mid + mid / 2, 28);

    // Bearish range zone (20-60)
    const bear20 = rsiToY(20);
    const bear60 = rsiToY(60);
    ctx.fillStyle = 'rgba(239,68,68,0.06)';
    ctx.fillRect(mid + 10, bear60, mid - 30, bear20 - bear60);
    ctx.strokeStyle = 'rgba(239,68,68,0.2)';
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(mid + 10, bear60); ctx.lineTo(w - 20, bear60); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(mid + 10, bear20); ctx.lineTo(w - 20, bear20); ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(239,68,68,0.4)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('60 — resistance (NOT 70!)', mid + 12, bear60 - 3);
    ctx.fillText('20 — support', mid + 12, bear20 + 10);

    // RSI oscillating in bearish range (20-60)
    ctx.strokeStyle = 'rgba(239,68,68,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = mid + 15; x < w - 15; x++) {
      const rx = (x - mid - 15) / (mid - 30);
      const rsi = 40 + Math.sin(t + rx * 12 + 2) * 18 + Math.sin(rx * 5 + t * 0.5) * 5;
      const y = rsiToY(Math.max(18, Math.min(62, rsi)));
      x === mid + 15 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Old 70/30 (dimmed)
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.setLineDash([2, 4]);
    ctx.beginPath(); ctx.moveTo(mid + 10, rsiToY(70)); ctx.lineTo(w - 20, rsiToY(70)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(mid + 10, rsiToY(30)); ctx.lineTo(w - 20, rsiToY(30)); ctx.stroke();
    ctx.setLineDash([]);

    // 50 midline across full width
    ctx.strokeStyle = 'rgba(245,158,11,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, rsiToY(50));
    ctx.lineTo(w - 20, rsiToY(50));
    ctx.stroke();
    ctx.fillStyle = 'rgba(245,158,11,0.3)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('50', w / 2, rsiToY(50) - 3);

    // Bottom insight
    ctx.fillStyle = 'rgba(245,158,11,0.45)';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('In uptrends RSI bounces off 40 (not 30). In downtrends RSI rejects at 60 (not 70).', w / 2, h - 5);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ADVANCED RSI TECHNIQUES
// ============================================================
const techniques = [
  { name: 'Bearish Divergence', subtitle: 'Price HH + RSI LH', detail: 'Price makes a higher high but RSI makes a lower high. The energy behind the new peak is weaker than the last one. This is the fuel gauge dropping while you&apos;re still driving. It does NOT mean reverse now &mdash; it means the trend is losing energy. <strong class="text-white">Action:</strong> Tighten stops on existing longs. Reduce new long entries. Look for a structural break (BOS) to confirm the reversal.', when: 'At the end of extended uptrends, especially near key resistance levels or supply zones.', color: 'text-red-400' },
  { name: 'Bullish Divergence', subtitle: 'Price LL + RSI HL', detail: 'Price makes a lower low but RSI makes a higher low. Selling pressure is weakening even though price is still falling. The bears are running out of ammunition. <strong class="text-white">Action:</strong> Watch for a structural shift (CHoCH or BOS to the upside). If it occurs at a demand zone with volume confirmation, this becomes an A+ reversal setup.', when: 'At the end of extended downtrends, especially near key support or demand zones.', color: 'text-green-400' },
  { name: 'Failure Swing', subtitle: 'RSI reversal without price confirmation', detail: 'A bullish failure swing: RSI drops below 30 (oversold), rallies above 30, pulls back but STAYS above 30, then breaks above the prior RSI high. The failure to make a new RSI low shows momentum has shifted BEFORE price confirms. This is one of the earliest RSI reversal signals. <strong class="text-white">Action:</strong> The break of the prior RSI high is the trigger. Still needs structural context to filter noise.', when: 'At key exhaustion points, especially after extended moves with high-impact news.', color: 'text-amber-400' },
  { name: 'Range Shift', subtitle: 'RSI operating range changes with trend', detail: 'In an uptrend, RSI tends to oscillate between 40&ndash;80 (rarely touching 30). In a downtrend, RSI oscillates between 20&ndash;60 (rarely touching 70). <strong class="text-white">This means RSI &ldquo;oversold&rdquo; in an uptrend is 40&ndash;45, not 30.</strong> Waiting for RSI to hit 30 in a strong uptrend means waiting forever. The range shift tells you the REAL support/resistance zones for RSI in the current regime.', when: 'Always. This is the framework for interpreting every RSI reading in context. Check the higher TF trend first, then adjust your RSI zones accordingly.', color: 'text-sky-400' },
  { name: 'RSI Trendlines', subtitle: 'Draw trendlines on RSI, not just price', detail: 'You can draw ascending/descending trendlines directly on RSI, connecting swing lows or swing highs. When an RSI trendline breaks, it often precedes a price trendline break by several candles. <strong class="text-white">This gives you an early warning of momentum shift before price confirms.</strong> The RSI trendline break is not a trade signal alone &mdash; it tells you to watch price for a structural break.', when: 'On 1H and 4H charts where RSI produces clean, visible swings. Less useful on lower TFs due to noise.', color: 'text-purple-400' },
  { name: 'Hidden Divergence', subtitle: 'Trend continuation signal', detail: 'Bullish hidden divergence: Price makes a HIGHER low (pullback in uptrend) but RSI makes a LOWER low. The RSI dropped more than price during the pullback &mdash; meaning the correction was deeper in momentum than in price. Fresh energy entered at a higher price. <strong class="text-white">This is a continuation signal, not a reversal signal.</strong> It tells you the trend has reloaded and is ready for the next impulse.', when: 'During pullbacks within established trends. Especially powerful at moving average support levels (50 EMA, 200 SMA).', color: 'text-accent-400' },
];

// ============================================================
// GAME DATA
// ============================================================
const gameRounds = [
  {
    scenario: 'Gold is in a strong uptrend. RSI pulls back from 74 to 43. A trader says: &ldquo;RSI isn&apos;t even close to oversold at 30, so there&apos;s no buying opportunity here.&rdquo; Is this correct?',
    options: [
      { text: 'Yes &mdash; oversold means below 30. RSI at 43 is neutral, not a buying opportunity.', correct: false, explain: 'This ignores the Range Shift concept. In a strong uptrend, RSI rarely reaches 30. The bullish operating range is 40&ndash;80. RSI dropping to 43 IS the equivalent of &ldquo;oversold&rdquo; in this regime. Waiting for 30 means missing every pullback entry in the trend. The trader is applying bearish-regime rules to a bullish-regime market.' },
      { text: 'No &mdash; in a bullish regime, RSI operates in a 40&ndash;80 range. RSI at 43 is actually near the bottom of the bullish range and could be a pullback entry zone. Apply range shift, not fixed 30/70.', correct: true, explain: 'Exactly. The range shift means you must adjust your RSI zones to match the current trend regime. In a strong uptrend: 40 = support (not 30), 80 = resistance (not 70). RSI pulling back to 43 in a bullish trend is the equivalent of a &ldquo;reset&rdquo; &mdash; a potential entry zone, not a neutral reading.' },
    ],
  },
  {
    scenario: 'EUR/USD makes a new swing high at 1.1050. RSI peaks at 71. The previous swing high was 1.1020 and RSI peaked at 78. What type of divergence is this and what should you do?',
    options: [
      { text: 'Bullish divergence &mdash; go long because RSI is still above 70', correct: false, explain: 'This is BEARISH divergence, not bullish. Price made a HIGHER high (1.1050 > 1.1020) but RSI made a LOWER high (71 < 78). Less momentum energy behind the new price peak. This does not mean &ldquo;sell now&rdquo; but it means the uptrend is losing steam. Tighten stops, reduce long exposure, and watch for a structural break.' },
      { text: 'Bearish divergence &mdash; price HH but RSI LH. The uptrend is losing energy. Tighten stops on longs, reduce exposure, and watch for structural confirmation before considering shorts.', correct: true, explain: 'Correct. Bearish divergence is a warning, not a signal. Price: 1.1020 → 1.1050 (higher high). RSI: 78 → 71 (lower high). Less energy behind the new peak. Professional response: tighten stops from 2R to 1R, stop adding new longs, and watch for a BOS to the downside. If the BOS comes, THEN the divergence is confirmed.' },
    ],
  },
  {
    scenario: 'RSI drops to 28, rallies to 38, pulls back to 31 (stays above 28), then breaks above 38. What RSI pattern is this?',
    options: [
      { text: 'Bearish divergence &mdash; RSI made a lower low signal', correct: false, explain: 'This is a BULLISH FAILURE SWING. RSI dropped below 30 (28), rallied (38), pulled back but DIDN&apos;T make a new low (31 > 28), then broke above the prior high (38). The &ldquo;failure&rdquo; to make a new RSI low shows that selling momentum has dried up. The break above 38 is the trigger point. This is one of the earliest RSI reversal patterns.' },
      { text: 'Bullish failure swing &mdash; RSI failed to make a new low, then broke above the prior swing high. This is an early reversal signal in momentum.', correct: true, explain: 'Exactly. The failure swing sequence: (1) RSI enters oversold (28), (2) bounces above 30 (38), (3) pulls back but HOLDS above prior low (31 > 28), (4) breaks above the bounce high (above 38). The failure to make a new low is the key &mdash; it means bears couldn&apos;t push momentum lower. Combined with structure (demand zone), this can be powerful.' },
    ],
  },
  {
    scenario: 'You draw a descending trendline on RSI connecting two swing highs. RSI breaks above this trendline while price is still below its own descending trendline. What does this tell you?',
    options: [
      { text: 'Nothing useful &mdash; RSI trendlines are meaningless because RSI is just a derived calculation', correct: false, explain: 'RSI trendlines are one of the most underrated tools in technical analysis. An RSI trendline break means MOMENTUM has shifted before PRICE confirms it. The momentum engine has turned before the car has changed direction. This gives you early warning to prepare for a potential price trendline break. It&apos;s not a trade entry &mdash; but it tells you to set alerts on the price trendline.' },
      { text: 'Momentum has shifted direction before price has &mdash; this is an early warning that the price trendline may break soon. Prepare for a potential structural shift, but wait for price confirmation.', correct: true, explain: 'Correct. RSI trendline break = momentum shift. Price trendline intact = direction not yet confirmed. The lag between RSI trendline break and price trendline break is your preparation window: tighten stops on shorts, identify potential long entry levels, set alerts on the price trendline. When price catches up, you are already prepared.' },
    ],
  },
  {
    scenario: 'During a pullback in a bullish trend, price makes a higher low (pullback didn&apos;t reach the prior low). But RSI made a LOWER low than the prior pullback. What type of divergence is this?',
    options: [
      { text: 'Bearish divergence &mdash; RSI making lower lows means the trend is ending', correct: false, explain: 'This is HIDDEN bullish divergence, not bearish. Price: higher low (bullish structure intact). RSI: lower low (the pullback was deeper in momentum than in price). This means fresh energy entered at a higher price level. The momentum &ldquo;overshot&rdquo; during the pullback but price held firm. This is a CONTINUATION signal &mdash; the trend has reloaded and is ready for the next impulse up.' },
      { text: 'Hidden bullish divergence &mdash; a continuation signal. Price held higher but momentum dipped deeper, showing the pullback was aggressive in energy but the structure survived. The trend has reloaded.', correct: true, explain: 'Exactly right. Hidden divergence is the opposite of regular divergence: regular = reversal warning, hidden = continuation signal. Price higher low + RSI lower low = the correction shook out weak hands (deep momentum drop) but the structure survived (price held higher). Fresh buyers entered. Next impulse incoming.' },
    ],
  },
];

// ============================================================
// QUIZ DATA
// ============================================================
const quizQuestions = [
  { q: 'In a strong uptrend, RSI typically operates in which range?', opts: ['0 to 100 (full range)', '20 to 60 (bearish range)', '40 to 80 (bullish range)', '70 to 100 (extreme range)'], correct: 2, explain: 'In a bullish regime, RSI rarely drops below 40 and often reaches 80. The operating range SHIFTS upward. Treating 30 as oversold in a strong uptrend means waiting for a level that rarely arrives.' },
  { q: 'Bearish divergence (Price HH, RSI LH) tells you to:', opts: ['Immediately sell and go short', 'Tighten stops on longs, reduce new entries, and watch for structural confirmation', 'Ignore it because divergence never works', 'Add more long positions because price is still rising'], correct: 1, explain: 'Divergence is a warning, not a signal. It says the trend is losing energy. Professional response: reduce risk (tighter stops, smaller new positions) and look for structural breaks to confirm the shift.' },
  { q: 'What is a bullish failure swing in RSI?', opts: ['RSI drops below 30, bounces, fails to make a new low, then breaks above the bounce high', 'RSI rises above 70 and stays there', 'RSI crosses the 50 line upward', 'RSI makes two equal highs'], correct: 0, explain: 'Failure swing: oversold entry → bounce → pullback that holds above prior low (failure to make new low) → break above bounce high. The &ldquo;failure&rdquo; shows sellers couldn&apos;t push lower. The breakout confirms buyer return.' },
  { q: 'Why is RSI at 43 potentially &ldquo;oversold&rdquo; in a strong uptrend?', opts: ['Because 43 is always oversold regardless of trend', 'Because the bullish range shift means RSI support moves to ~40, not the textbook 30', 'Because the RSI formula changes in uptrends', 'Because 43 is below 50 which is always bearish'], correct: 1, explain: 'Range shift: in bullish regimes, RSI bounces off 40 (not 30). RSI at 43 is near the bottom of the bullish operating range &mdash; equivalent to what 30 represents in a neutral market. Context-dependent interpretation is essential.' },
  { q: 'Hidden bullish divergence (Price HL, RSI LL) is a signal for:', opts: ['Immediate trend reversal to bearish', 'Trend continuation &mdash; the pullback exhausted itself and fresh energy entered at a higher price', 'Market crash incoming', 'No action needed &mdash; it has no significance'], correct: 1, explain: 'Hidden divergence signals continuation. The pullback was deep in momentum (RSI LL) but price held higher (HL). Fresh buyers entered at a higher level. The trend has &ldquo;reloaded&rdquo; for the next impulse.' },
  { q: 'An RSI trendline break that occurs BEFORE a price trendline break suggests:', opts: ['The RSI is broken and should be removed', 'Momentum has shifted before price confirmed it &mdash; prepare for a potential price shift', 'You should immediately trade the RSI break', 'RSI trendlines have no analytical value'], correct: 1, explain: 'RSI trendline breaks often precede price trendline breaks by several candles. It&apos;s an early warning system. Use it to prepare (set alerts, adjust risk) not to enter trades directly.' },
  { q: 'The MOST valuable use of RSI for professional traders is:', opts: ['Buying when RSI hits 30 and selling when it hits 70', 'Measuring momentum health, detecting divergence, and adapting zones to the current trend regime', 'Predicting exact reversal prices', 'Replacing all other analysis tools'], correct: 1, explain: 'Professional RSI use: (1) Assess momentum health (is it supporting the trend?), (2) Detect divergence (is energy fading?), (3) Adapt zones to regime (40-80 bullish, 20-60 bearish). This is the 95% of RSI that retail traders never learn.' },
  { q: 'When regular divergence (bearish) AND hidden divergence (bullish) appear to conflict, what should you prioritise?', opts: ['Always trust regular divergence', 'Always trust hidden divergence', 'Check the higher timeframe trend &mdash; hidden divergence in the direction of the HTF trend takes priority', 'Ignore both and only use price action'], correct: 2, explain: 'When signals conflict, zoom out. If the higher timeframe is bullish, hidden bullish divergence (continuation) on the lower timeframe takes priority over regular bearish divergence. Always trade in the direction of the dominant trend.' },
];

// ============================================================
// CONFETTI
// ============================================================
function Confetti({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const c = canvasRef.current; c.width = window.innerWidth; c.height = window.innerHeight;
    const ctx = c.getContext('2d'); if (!ctx) return;
    const pieces = Array.from({ length: 140 }, () => ({ x: Math.random() * c.width, y: Math.random() * -c.height, w: Math.random() * 8 + 4, h: Math.random() * 6 + 2, color: ['#f59e0b', '#d946ef', '#22c55e', '#ef4444', '#ffffff'][Math.floor(Math.random() * 5)], vx: (Math.random() - 0.5) * 3, vy: Math.random() * 4 + 2, rot: Math.random() * 360, rv: (Math.random() - 0.5) * 8, a: 1 }));
    let frames = 0;
    const draw = () => { ctx.clearRect(0, 0, c.width, c.height); pieces.forEach(p => { p.y += p.vy; p.x += p.vx; p.rot += p.rv; if (frames > 120) p.a -= 0.01; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot * Math.PI / 180); ctx.globalAlpha = Math.max(0, p.a); ctx.fillStyle = p.color; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore(); }); frames++; if (frames < 250) requestAnimationFrame(draw); };
    draw();
  }, [active]);
  if (!active) return null;
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[9998]" />;
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function RSIMasterclassLesson() {
  const [openTech, setOpenTech] = useState<number | null>(null);
  const [openMistake, setOpenMistake] = useState<number | null>(null);
  const [gameRound, setGameRound] = useState(0);
  const [gameAnswers, setGameAnswers] = useState<(number | null)[]>(Array(gameRounds.length).fill(null));
  const [gameScore, setGameScore] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(Array(quizQuestions.length).fill(null));
  const [quizDone, setQuizDone] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [certUnlocked, setCertUnlocked] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h); }, []);

  const handleGameAnswer = (oi: number) => { if (gameAnswers[gameRound] !== null) return; const u = [...gameAnswers]; u[gameRound] = oi; setGameAnswers(u); if (gameRounds[gameRound].options[oi].correct) setGameScore(s => s + 1); };
  const handleQuizAnswer = (qi: number, oi: number) => { if (quizAnswers[qi] !== null) return; const u = [...quizAnswers]; u[qi] = oi; setQuizAnswers(u); if (u.every(a => a !== null)) { const c = u.filter((a, i) => a === quizQuestions[i].correct).length; const pct = Math.round((c / quizQuestions.length) * 100); setQuizScore(pct); setQuizDone(true); if (pct >= 66) setTimeout(() => { setCertUnlocked(true); setShowConfetti(true); setTimeout(() => setShowConfetti(false), 5000); }, 800); } };

  const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } };

  const mistakes = [
    { wrong: 'Selling every time RSI hits 70 (&ldquo;overbought = sell&rdquo;)', right: 'RSI at 70 means momentum is strong. In an uptrend, RSI can stay above 70 for days or weeks. Only consider selling when divergence appears AND structure supports a reversal.', icon: '📉' },
    { wrong: 'Using fixed 70/30 zones regardless of trend', right: 'Apply range shift: bullish = 40&ndash;80, bearish = 20&ndash;60. The operating range changes with the regime. Check the higher TF trend FIRST, then adjust your RSI zones.', icon: '🔢' },
    { wrong: 'Trading divergence the moment it appears', right: 'Divergence is a WARNING, not an ENTRY. Wait for structural confirmation (BOS/CHoCH) before acting. Many divergences resolve with continuation, not reversal.', icon: '⏳' },
    { wrong: 'Only using RSI for overbought/oversold (5% of its capability)', right: 'RSI&apos;s power comes from divergence, failure swings, range shifts, trendlines, and hidden divergence. &ldquo;Overbought/oversold&rdquo; is the least useful application.', icon: '🧊' },
  ];

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      <Confetti active={showConfetti} />
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-900/50"><motion.div className="h-full bg-gradient-to-r from-amber-500 to-accent-500" style={{ width: `${Math.min((scrollY / (typeof document !== 'undefined' ? document.body.scrollHeight - window.innerHeight : 1)) * 100, 100)}%` }} /></div>
      <nav className="fixed top-1 left-0 right-0 z-40 flex items-center justify-between px-5 py-2.5">
        <Link href="/academy" className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-amber-400 to-accent-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>ATLAS ACADEMY</Link>
        <div className="flex items-center gap-2"><Crown className="w-3.5 h-3.5 text-amber-400" /><span className="text-xs font-bold text-amber-400">PRO &middot; LEVEL 5</span></div>
      </nav>

      {/* === HERO === */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6 pt-20">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(245,158,11,0.08),transparent_70%)] pointer-events-none" />
        <div className="absolute top-[-50px] right-[20%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(217,70,239,0.05),transparent_70%)] pointer-events-none" />
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.15 } } }} className="relative z-10">
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 5 &middot; Lesson 6</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">RSI Masterclass<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Beyond Overbought/Oversold</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">Most traders use 5% of what RSI can do. Divergence, failure swings, range shifts, trendlines &mdash; this is the other 95%.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* === S00 === */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">You Already Know RSI. Now Master It.</p>
            <p className="text-gray-400 leading-relaxed mb-4">In Level 2 you learned the basics: RSI measures the ratio of gains to losses, oscillates between 0&ndash;100, and has &ldquo;overbought&rdquo; (70) and &ldquo;oversold&rdquo; (30) zones. In Lesson 5.3 you saw the formula and understood what the numbers mean.</p>
            <p className="text-gray-400 leading-relaxed mb-4">Now it&apos;s time to go deep. <strong className="text-amber-400">The overbought/oversold framework that 90% of traders use is the LEAST useful application of RSI.</strong> The real power lies in six advanced techniques that most retail traders have never heard of &mdash; and that institutional traders use daily.</p>
            <p className="text-gray-400 leading-relaxed">This lesson will fundamentally change how you read RSI on every chart you open.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">A prop firm trader reviewed <strong className="text-white">one year of her trades</strong> and found that entries based on &ldquo;RSI overbought/oversold&rdquo; alone had a <strong className="text-red-400">29% win rate</strong>. Entries based on RSI divergence at structural levels had a <strong className="text-green-400">61% win rate</strong>. She was using the same indicator &mdash; but the advanced technique was 2&times; more effective than the basic one.</p>
          </div>
        </motion.div>
      </section>

      {/* === S01: Divergence Animation === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; Divergence Visualised</p>
          <h2 className="text-2xl font-extrabold mb-4">See Bearish Divergence in Action</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Price makes a higher high (top panel, blue). RSI makes a lower high (bottom panel, amber). The diagonal lines connect the divergence points. This is the single most powerful RSI signal &mdash; the trend&apos;s fuel gauge is dropping.</p>
          <RSIDivergenceAnimation />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Critical Distinction</p>
            <p className="text-sm text-gray-400">Divergence = <strong className="text-white">warning</strong>. Structure break = <strong className="text-white">confirmation</strong>. Professional traders use divergence to PREPARE (adjust risk, tighten stops) and structure breaks to ACT (enter trades). Never trade divergence alone.</p>
          </div>
        </motion.div>
      </section>

      {/* === S02: Range Shift Animation === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; Range Shift</p>
          <h2 className="text-2xl font-extrabold mb-4">The Zones Move With the Trend</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Forget fixed 70/30. In a bullish trend, RSI operates between 40&ndash;80. In a bearish trend, between 20&ndash;60. The old 70/30 lines become irrelevant. Watch how the operating zones shift:</p>
          <RSIRangeShiftAnimation />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/15">
              <p className="text-xs font-extrabold text-green-400 mb-1">Bullish Range (40&ndash;80)</p>
              <p className="text-[11px] text-gray-400">RSI bouncing off 40 = pullback entry zone. RSI near 80 = impulse peak. Rarely below 35.</p>
            </div>
            <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-xs font-extrabold text-red-400 mb-1">Bearish Range (20&ndash;60)</p>
              <p className="text-[11px] text-gray-400">RSI rejecting at 60 = pullback resistance. RSI near 20 = impulse trough. Rarely above 65.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S03: Six Advanced Techniques === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The Advanced Toolkit</p>
          <h2 className="text-2xl font-extrabold mb-2">Six Techniques That 95% of Traders Never Learn</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Each technique unlocks a new dimension of RSI. Together they transform it from a basic overbought/oversold tool into a professional momentum intelligence system.</p>
          <div className="space-y-3">
            {techniques.map((tech, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <button onClick={() => setOpenTech(openTech === i ? null : i)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <div>
                    <p className={`text-sm font-extrabold ${tech.color}`}>{tech.name}</p>
                    <p className="text-xs text-gray-500">{tech.subtitle}</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openTech === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openTech === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="p-4 mt-1 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-3">
                        <p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: tech.detail }} />
                        <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                          <p className="text-xs font-bold text-amber-400 mb-1">&#128197; When to Look For It</p>
                          <p className="text-sm text-gray-400">{tech.when}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* === S04: The RSI Decision Framework === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The Framework</p>
          <h2 className="text-2xl font-extrabold mb-2">Professional RSI Reading in 4 Steps</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Every time you look at RSI on a chart, run through these four steps in order:</p>
          <div className="space-y-3">
            <div className="p-4 rounded-xl glass-card"><p className="text-sm font-extrabold text-amber-400 mb-2">Step 1: Identify the Regime</p><p className="text-sm text-gray-400">Check the higher timeframe trend. Is it bullish, bearish, or ranging? This determines your RSI operating range (40&ndash;80, 20&ndash;60, or 30&ndash;70).</p></div>
            <div className="p-4 rounded-xl glass-card"><p className="text-sm font-extrabold text-sky-400 mb-2">Step 2: Check for Divergence</p><p className="text-sm text-gray-400">Compare the latest price swing high/low with the corresponding RSI swing. Regular divergence = warning. Hidden divergence = continuation. No divergence = neutral.</p></div>
            <div className="p-4 rounded-xl glass-card"><p className="text-sm font-extrabold text-green-400 mb-2">Step 3: Assess Location Within Range</p><p className="text-sm text-gray-400">Is RSI near the TOP of the operating range (impulse peak) or BOTTOM (pullback support)? This tells you whether momentum is extended or reset.</p></div>
            <div className="p-4 rounded-xl glass-card"><p className="text-sm font-extrabold text-accent-400 mb-2">Step 4: Combine With Structure</p><p className="text-sm text-gray-400">RSI reading at a key structural level (order block, demand zone, FVG) = actionable. RSI reading at random price = noise. Always pair RSI with Level 3 structure.</p></div>
          </div>
        </motion.div>
      </section>

      {/* === S05: RSI vs L2 Comparison === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Level 2 vs Level 5</p>
          <h2 className="text-2xl font-extrabold mb-4">How Your RSI Understanding Has Evolved</h2>
          <div className="p-6 rounded-2xl glass-card">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
                <p className="text-xs font-extrabold text-red-400 mb-3">Level 2 Understanding</p>
                <p className="text-xs text-gray-400 mb-1">&#10060; RSI above 70 = sell</p>
                <p className="text-xs text-gray-400 mb-1">&#10060; RSI below 30 = buy</p>
                <p className="text-xs text-gray-400 mb-1">&#10060; Fixed 70/30 zones always</p>
                <p className="text-xs text-gray-400 mb-1">&#10060; Entry signal on its own</p>
                <p className="text-xs text-gray-400">&#10060; One technique (OB/OS)</p>
              </div>
              <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/15">
                <p className="text-xs font-extrabold text-green-400 mb-3">Level 5 Understanding</p>
                <p className="text-xs text-gray-400 mb-1">&#9989; High RSI = strong momentum</p>
                <p className="text-xs text-gray-400 mb-1">&#9989; Low RSI = weak momentum</p>
                <p className="text-xs text-gray-400 mb-1">&#9989; Zones shift with regime</p>
                <p className="text-xs text-gray-400 mb-1">&#9989; Confirmation tool only</p>
                <p className="text-xs text-gray-400">&#9989; Six advanced techniques</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S06: Practical Cheat Sheet === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Cheat Sheet</p>
          <h2 className="text-2xl font-extrabold mb-4">RSI Quick Reference</h2>
          <div className="p-6 rounded-2xl glass-card space-y-3">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-green-400">Bearish divergence at supply zone</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Tighten stops, reduce longs, look for BOS down.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-green-400">Bullish divergence at demand zone</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Watch for CHoCH up, volume spike, session timing.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">RSI at 40 in bullish trend</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Momentum reset. Potential pullback entry if structure confirms.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">RSI at 60 in bearish trend</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Momentum resistance. Potential short entry if structure confirms.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-purple-400">Hidden divergence in trend</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Continuation signal. Add to position on pullback at key level.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-sky-400">RSI trendline break</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Early momentum shift. Set alerts on price structure. Prepare, don&apos;t enter.</span></p></div>
          </div>
        </motion.div>
      </section>

      {/* === S07: Common Mistakes === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-6">What to Avoid</h2>
          <div className="space-y-3">
            {mistakes.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <button onClick={() => setOpenMistake(openMistake === i ? null : i)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <div className="flex items-center gap-3"><span className="text-lg">{m.icon}</span><p className="text-sm font-extrabold text-red-400" dangerouslySetInnerHTML={{ __html: m.wrong }} /></div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openMistake === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openMistake === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="p-4 mt-1 rounded-xl bg-green-500/5 border border-green-500/10"><p className="text-xs font-bold text-green-400 mb-1">&#9989; Do This Instead</p><p className="text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: m.right }} /></div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* === S08: When NOT to Use RSI === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Know the Limits</p>
          <h2 className="text-2xl font-extrabold mb-2">When RSI Fails</h2>
          <p className="text-gray-400 leading-relaxed mb-6">No tool works in all conditions. RSI has specific environments where it breaks down. Knowing these is as important as knowing the techniques.</p>
          <div className="space-y-3">
            <div className="p-4 rounded-xl glass-card"><p className="text-sm font-extrabold text-red-400 mb-1">During major news events</p><p className="text-sm text-gray-400">One-candle spikes distort RSI. A 50-pip news candle can send RSI from 50 to 85 in one bar. This is noise, not signal. Wait 30+ minutes.</p></div>
            <div className="p-4 rounded-xl glass-card"><p className="text-sm font-extrabold text-red-400 mb-1">In extremely tight ranges</p><p className="text-sm text-gray-400">When price oscillates in a 10-pip range, RSI will flicker between 40 and 60 constantly. Every flicker looks like a signal but means nothing. Wait for the range to break.</p></div>
            <div className="p-4 rounded-xl glass-card"><p className="text-sm font-extrabold text-red-400 mb-1">On 1-minute and 5-minute charts (alone)</p><p className="text-sm text-gray-400">RSI on ultra-low timeframes produces dozens of signals per hour. The noise ratio is extreme. Use lower TF RSI only for entry timing AFTER the higher TF has given direction.</p></div>
          </div>
        </motion.div>
      </section>

      {/* === S09: Game === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Test Your Understanding</p>
          <h2 className="text-2xl font-extrabold mb-2">RSI Masterclass Game</h2>
          <p className="text-gray-400 text-sm mb-6">5 advanced scenarios. Can you apply the 95% that most traders never learn?</p>
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
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'You\'ve mastered RSI. The other 95% is now yours.' : gameScore >= 3 ? 'Strong understanding — review the techniques you missed.' : 'The advanced techniques need more practice. Re-read sections 01–03.'}</p></motion.div>)}
          </div>
        </motion.div>
      </section>

      {/* === S10: Quiz + Certificate === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Knowledge Check</p>
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
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(14,165,233,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
                <div className="relative z-10 text-center">
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-sky-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">📊</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 5: RSI Masterclass</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-sky-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; RSI Master &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L5.6-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
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
