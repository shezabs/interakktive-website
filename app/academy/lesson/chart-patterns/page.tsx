// app/academy/lesson/chart-patterns/page.tsx
// ATLAS Academy — Lesson 2.9: Chart Patterns [PRO]
'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Crown, ArrowRight, ChevronDown } from 'lucide-react';

// ============================================================
// UTILITIES
// ============================================================
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

// ============================================================
// PATTERN SHAPE GENERATORS — each returns an array of prices that form the pattern
// ============================================================
function genHeadAndShoulders(seed: number): number[] {
  const rand = seededRandom(seed);
  const p: number[] = [];
  // Uptrend into pattern
  let price = 100;
  for (let i = 0; i < 15; i++) { price += 0.3 + (rand() - 0.5) * 1.5; p.push(price); }
  // Left shoulder: rise to ~108, fall to ~104
  for (let i = 0; i < 8; i++) { price += 0.5 + (rand() - 0.5) * 0.8; p.push(price); }
  const neckline1 = price - 4;
  for (let i = 0; i < 6; i++) { price -= 0.6 + (rand() - 0.5) * 0.6; p.push(price); }
  // Head: rise to ~112, fall to neckline
  for (let i = 0; i < 10; i++) { price += 0.7 + (rand() - 0.5) * 0.8; p.push(price); }
  for (let i = 0; i < 8; i++) { price -= 0.8 + (rand() - 0.5) * 0.6; p.push(price); }
  // Right shoulder: rise to ~108, fall to neckline
  for (let i = 0; i < 7; i++) { price += 0.4 + (rand() - 0.5) * 0.7; p.push(price); }
  for (let i = 0; i < 6; i++) { price -= 0.5 + (rand() - 0.5) * 0.5; p.push(price); }
  // Breakdown below neckline
  for (let i = 0; i < 12; i++) { price -= 0.6 + (rand() - 0.5) * 1; p.push(price); }
  return p;
}

function genDoubleTop(seed: number): number[] {
  const rand = seededRandom(seed);
  const p: number[] = [];
  let price = 100;
  // Uptrend
  for (let i = 0; i < 12; i++) { price += 0.4 + (rand() - 0.5) * 1.2; p.push(price); }
  // First peak
  for (let i = 0; i < 8; i++) { price += 0.3 + (rand() - 0.5) * 0.6; p.push(price); }
  const peak = price;
  // Pullback to neckline
  for (let i = 0; i < 8; i++) { price -= 0.5 + (rand() - 0.5) * 0.5; p.push(price); }
  const neck = price;
  // Second peak (same level)
  for (let i = 0; i < 8; i++) { price += 0.5 + (rand() - 0.5) * 0.5; p.push(price); }
  price = Math.min(price, peak + 0.5); p[p.length - 1] = price;
  // Rejection & breakdown
  for (let i = 0; i < 6; i++) { price -= 0.4 + (rand() - 0.5) * 0.5; p.push(price); }
  for (let i = 0; i < 10; i++) { price -= 0.6 + (rand() - 0.5) * 1; p.push(price); }
  return p;
}

function genDoubleBottom(seed: number): number[] {
  const rand = seededRandom(seed);
  const p: number[] = [];
  let price = 110;
  // Downtrend
  for (let i = 0; i < 12; i++) { price -= 0.4 + (rand() - 0.5) * 1.2; p.push(price); }
  // First bottom
  for (let i = 0; i < 8; i++) { price -= 0.3 + (rand() - 0.5) * 0.5; p.push(price); }
  const bottom = price;
  // Rally to neckline
  for (let i = 0; i < 8; i++) { price += 0.5 + (rand() - 0.5) * 0.5; p.push(price); }
  // Second bottom
  for (let i = 0; i < 8; i++) { price -= 0.5 + (rand() - 0.5) * 0.5; p.push(price); }
  price = Math.max(price, bottom - 0.5); p[p.length - 1] = price;
  // Bounce & breakout
  for (let i = 0; i < 6; i++) { price += 0.4 + (rand() - 0.5) * 0.5; p.push(price); }
  for (let i = 0; i < 10; i++) { price += 0.6 + (rand() - 0.5) * 1; p.push(price); }
  return p;
}

function genAscTriangle(seed: number): number[] {
  const rand = seededRandom(seed);
  const p: number[] = [];
  let price = 100;
  // Approach
  for (let i = 0; i < 8; i++) { price += 0.3 + (rand() - 0.5) * 1; p.push(price); }
  const resistance = price + 2;
  // Triangle: higher lows, flat top
  for (let swing = 0; swing < 4; swing++) {
    // Up to resistance
    const target = resistance - (rand() * 1);
    while (price < target) { price += 0.4 + rand() * 0.4; p.push(Math.min(price, resistance + rand() * 0.3)); }
    // Down to higher low
    const lowTarget = 100 + swing * 1.5 + rand() * 1;
    while (price > lowTarget) { price -= 0.3 + rand() * 0.4; p.push(price); }
  }
  // Breakout above resistance
  for (let i = 0; i < 10; i++) { price += 0.7 + (rand() - 0.3) * 1; p.push(price); }
  return p;
}

function genDescTriangle(seed: number): number[] {
  const rand = seededRandom(seed);
  const p: number[] = [];
  let price = 110;
  for (let i = 0; i < 8; i++) { price -= 0.3 + (rand() - 0.5) * 1; p.push(price); }
  const support = price - 2;
  for (let swing = 0; swing < 4; swing++) {
    const target = support + rand() * 1;
    while (price > target) { price -= 0.4 + rand() * 0.4; p.push(Math.max(price, support - rand() * 0.3)); }
    const highTarget = 110 - swing * 1.5 - rand() * 1;
    while (price < highTarget) { price += 0.3 + rand() * 0.4; p.push(price); }
  }
  for (let i = 0; i < 10; i++) { price -= 0.7 + (rand() - 0.3) * 1; p.push(price); }
  return p;
}

function genFlag(seed: number): number[] {
  const rand = seededRandom(seed);
  const p: number[] = [];
  let price = 100;
  // Pole (sharp rally)
  for (let i = 0; i < 10; i++) { price += 1.0 + (rand() - 0.3) * 1; p.push(price); }
  // Flag (gentle pullback channel)
  for (let i = 0; i < 15; i++) { price -= 0.15 + (rand() - 0.5) * 0.8; p.push(price); }
  // Breakout continuation
  for (let i = 0; i < 12; i++) { price += 0.8 + (rand() - 0.3) * 1; p.push(price); }
  return p;
}

function genCupAndHandle(seed: number): number[] {
  const rand = seededRandom(seed);
  const p: number[] = [];
  let price = 108;
  // Left lip
  for (let i = 0; i < 5; i++) { price += 0.1 + (rand() - 0.5) * 0.5; p.push(price); }
  const lipLevel = price;
  // Cup: gradual decline, round bottom, gradual rise
  for (let i = 0; i < 12; i++) { price -= 0.4 + (rand() - 0.5) * 0.5; p.push(price); }
  for (let i = 0; i < 6; i++) { price += (rand() - 0.5) * 0.4; p.push(price); }
  for (let i = 0; i < 12; i++) { price += 0.4 + (rand() - 0.5) * 0.5; p.push(price); }
  // Handle: small pullback
  for (let i = 0; i < 6; i++) { price -= 0.2 + (rand() - 0.5) * 0.3; p.push(price); }
  // Breakout
  for (let i = 0; i < 10; i++) { price += 0.6 + (rand() - 0.3) * 0.8; p.push(price); }
  return p;
}

function genWedge(seed: number): number[] {
  const rand = seededRandom(seed);
  const p: number[] = [];
  let price = 100;
  // Rising wedge (bearish): both highs and lows rising, but converging
  for (let i = 0; i < 8; i++) { price += 0.3 + (rand() - 0.5) * 1; p.push(price); }
  for (let swing = 0; swing < 5; swing++) {
    const upAmount = Math.max(1, 3 - swing * 0.5);
    const downAmount = Math.max(0.5, 2 - swing * 0.3);
    for (let i = 0; i < 4; i++) { price += upAmount * 0.3 + (rand() - 0.5) * 0.5; p.push(price); }
    for (let i = 0; i < 3; i++) { price -= downAmount * 0.3 + (rand() - 0.5) * 0.4; p.push(price); }
  }
  // Breakdown
  for (let i = 0; i < 10; i++) { price -= 0.7 + (rand() - 0.3) * 1; p.push(price); }
  return p;
}

// ============================================================
// PATTERN METADATA
// ============================================================
interface PatternInfo {
  name: string;
  type: 'reversal' | 'continuation';
  direction: 'bullish' | 'bearish' | 'either';
  genFn: (seed: number) => number[];
  description: string;
  layman: string;
  howToSpot: string;
  target: string;
  psychology: string;
  mistakes: string;
}

const chartPatterns: Record<string, PatternInfo> = {
  head_shoulders: {
    name: 'Head & Shoulders',
    type: 'reversal', direction: 'bearish',
    genFn: genHeadAndShoulders,
    description: 'Three peaks where the middle peak (head) is the highest and the two outer peaks (shoulders) are lower and roughly equal. The line connecting the lows between peaks is the "neckline."',
    layman: 'Picture a person\'s silhouette from behind — left shoulder, head sticking up higher, right shoulder. The market is literally showing you that buyers tried THREE times to push higher. The first attempt was okay (left shoulder). The second attempt was their best shot (head). The third attempt couldn\'t even match the first (right shoulder). Each attempt was WEAKER. When they can\'t even reach the first shoulder\'s height, the writing is on the wall.',
    howToSpot: '1) Three distinct peaks with the middle highest. 2) The two shoulders are roughly the same height. 3) Draw a "neckline" connecting the two lows between the peaks. 4) Pattern confirms when price breaks BELOW the neckline. 5) Volume typically decreases on each successive peak — another sign of weakening.',
    target: 'Measure the distance from the head to the neckline. Subtract that distance from the neckline break point. Example: Head at $112, neckline at $104 = $8 distance. Neckline break at $104 → target = $96.',
    psychology: 'Three attempts to push higher with each one weaker. Buyers are exhausting themselves. By the third peak (right shoulder), the "smart money" has already sold into the rallies. When the neckline breaks, trapped longs who bought at the shoulders panic-sell, accelerating the decline.',
    mistakes: 'Don\'t trade BEFORE the neckline breaks — the pattern isn\'t confirmed until then. Many "head and shoulders" patterns fail when the neckline holds. Also, the shoulders don\'t need to be perfectly symmetrical — close enough is fine.',
  },
  double_top: {
    name: 'Double Top',
    type: 'reversal', direction: 'bearish',
    genFn: genDoubleTop,
    description: 'Price rises to a peak, pulls back, then rises to the SAME peak level but can\'t break through. Looks like the letter "M".',
    layman: 'Imagine running at a brick wall. You bounce off. You back up, run harder — and bounce off the EXACT SAME WALL again. At some point you realise: that wall isn\'t moving. The market hit a ceiling twice and failed both times. If buyers couldn\'t break it with two attempts, they probably won\'t break it at all.',
    howToSpot: '1) Two peaks at roughly the same price level (within 1-2%). 2) A valley (neckline/support) between them. 3) Confirms when price breaks below the valley. 4) Volume often lower on the second peak — less conviction.',
    target: 'Height of the pattern (peak to valley) subtracted from the neckline break. Peak at $110, valley at $105 = $5. Break at $105 → target = $100.',
    psychology: 'First peak: buyers hit resistance and profit-take. Valley: buyers regroup. Second peak: buyers try again but sellers are WAITING at the same level. When buyers fail twice at the same price, confidence collapses.',
    mistakes: 'The two peaks don\'t need to be exactly equal — within 1-3% is fine. Don\'t anticipate the pattern: wait for the neckline break. Many double tops become continuation patterns if the neckline holds.',
  },
  double_bottom: {
    name: 'Double Bottom',
    type: 'reversal', direction: 'bullish',
    genFn: genDoubleBottom,
    description: 'Price falls to a low, bounces, then falls to the SAME low but can\'t break through. Looks like the letter "W".',
    layman: 'Same brick wall story but upside down. The market fell to a floor twice and bounced both times. Sellers tried to push through twice and failed — that floor is REAL. Like a trampoline: the more times you bounce off the same spot, the stronger that spot proves to be.',
    howToSpot: '1) Two lows at roughly the same level. 2) A peak (neckline/resistance) between them. 3) Confirms when price breaks above the peak. 4) Volume often spikes on the second bounce — buyers defending aggressively.',
    target: 'Height of the pattern added to the neckline break. Bottom at $95, neckline at $100 = $5. Break at $100 → target = $105.',
    psychology: 'Mirror of double top. Two failed attempts to push lower means sellers are exhausted. Institutional buyers are accumulating at the lows. When the neckline breaks, short sellers cover (buy back), adding fuel to the rally.',
    mistakes: 'The two bottoms can differ by 1-3%. The "W" shape should be clear even to a beginner. Don\'t buy at the second bottom — wait for the neckline break to confirm.',
  },
  asc_triangle: {
    name: 'Ascending Triangle',
    type: 'continuation', direction: 'bullish',
    genFn: genAscTriangle,
    description: 'Flat resistance on top, rising support below. Price squeezes into the apex with buyers getting more aggressive (higher lows) while sellers hold at the same level.',
    layman: 'Imagine a football being kicked against a wall. Each time it bounces back less — because someone is standing closer and closer, kicking it back at the wall faster. Eventually the ball goes THROUGH the wall. The flat top is the wall. The rising bottom is the person getting closer. Each bounce is tighter until — BANG — breakout.',
    howToSpot: '1) Flat or near-flat resistance line on top (at least 2 touches). 2) Rising support line on the bottom (higher lows — at least 2 touches). 3) Price converges into a triangle shape. 4) Breakout typically happens in the last third of the triangle. 5) Volume decreases during the pattern, then SURGES on breakout.',
    target: 'Height of the triangle (resistance minus the lowest support point) added to the breakout level.',
    psychology: 'Each higher low means buyers are willing to pay MORE each time. Sellers are defending the same level but buyers keep coming back stronger. Eventually seller orders at resistance get absorbed and price breaks through. The decreasing volume is energy building — the breakout releases it all.',
    mistakes: 'Not every ascending triangle breaks upward — about 75% do. If it breaks DOWN, it\'s equally valid. Always wait for the breakout with volume confirmation. Don\'t trade inside the triangle — the signal is the breakout.',
  },
  desc_triangle: {
    name: 'Descending Triangle',
    type: 'continuation', direction: 'bearish',
    genFn: genDescTriangle,
    description: 'Flat support on the bottom, declining resistance above. Sellers getting more aggressive (lower highs) while buyers hold at the same level.',
    layman: 'The mirror image of the ascending triangle. The floor is solid but the ceiling keeps dropping. Each rally is weaker — sellers are pushing back harder each time. Eventually the floor cracks. Like water slowly filling a room — the ceiling (lower highs) is dropping while the floor (support) holds... until it doesn\'t.',
    howToSpot: '1) Flat support line (at least 2 touches). 2) Declining resistance (lower highs). 3) Converging into a point. 4) Breakout typically downward in the last third. 5) Volume shrinks during, surges on breakdown.',
    target: 'Height of the triangle subtracted from the breakdown level.',
    psychology: 'Each lower high shows sellers are more aggressive. Buyers defend the floor but with diminishing strength. When the floor finally breaks, it\'s often dramatic because all the buy orders stacked at support get wiped out at once.',
    mistakes: 'About 72% break down, but 28% break upward. Direction is probable, not guaranteed. Let the break happen before entering.',
  },
  bull_flag: {
    name: 'Bull Flag',
    type: 'continuation', direction: 'bullish',
    genFn: genFlag,
    description: 'A sharp rally (the "pole") followed by a gentle, downward-sloping consolidation (the "flag"). Then price breaks out upward to continue the trend.',
    layman: 'Think of a sprinter. They BURST out of the blocks (the pole), then jog lightly to catch their breath (the flag), then sprint again. The flag is just a breather — it doesn\'t mean the race is over. It means the runner is gathering energy for the next burst. The gentle pullback is healthy — it shakes out weak hands before the next leg up.',
    howToSpot: '1) A strong, steep rally (the pole) — should be near-vertical. 2) A gentle, downward-sloping channel (the flag) — should be relatively flat compared to the pole. 3) Duration: the flag should be shorter than the pole in both time and price. 4) Volume decreases during the flag, spikes on the breakout.',
    target: 'Measure the pole length. Add it to the bottom of the flag. Example: Pole = $10 rally. Flag bottom = $107. Target = $117.',
    psychology: 'The pole represents strong demand. The flag is profit-taking by short-term traders — but long-term buyers are still holding. When the flag "resolves" upward, it means the profit-takers are done and the trend resumes with fresh buyers.',
    mistakes: 'The flag should be SHORT relative to the pole. If the "flag" retraces more than 50% of the pole, it\'s probably not a flag — it\'s a reversal. Also, the flag should slope AGAINST the trend (downward for bull flag).',
  },
  cup_handle: {
    name: 'Cup & Handle',
    type: 'continuation', direction: 'bullish',
    genFn: genCupAndHandle,
    description: 'A rounded bottom (the "cup") followed by a small pullback (the "handle"), then a breakout above the cup\'s rim.',
    layman: 'Literally looks like a teacup viewed from the side. The cup is the round bottom where price gradually falls, finds a floor, and gradually recovers — no sharp V-shapes, it\'s smooth and rounded. Then the handle is a tiny dip before the tea gets poured (breakout). It\'s one of the most reliable patterns because the rounded bottom shows orderly accumulation, not panic buying.',
    howToSpot: '1) A U-shaped (not V-shaped) decline and recovery — the cup. 2) The cup\'s two lips should be at roughly the same level. 3) A small pullback forming the handle (should not retrace more than 1/3 of the cup). 4) Breakout above the rim (lip level) with volume.',
    target: 'Depth of the cup added to the rim level. Cup bottom at $100, rim at $108 = $8 cup depth. Breakout at $108 → target = $116.',
    psychology: 'The cup shows gradual accumulation — smart money buying slowly over weeks/months. The handle shakes out remaining weak holders. The breakout is the final confirmation that all sellers have been absorbed. Famous pattern — William O\'Neil popularised it in the 1980s.',
    mistakes: 'The cup should be ROUNDED, not V-shaped. V-shaped recoveries aren\'t the same pattern. The handle should be small — if it\'s too deep, the pattern may have failed. Ideally forms over weeks to months on a daily chart.',
  },
  rising_wedge: {
    name: 'Rising Wedge',
    type: 'reversal', direction: 'bearish',
    genFn: genWedge,
    description: 'Both support and resistance lines slope upward but CONVERGE — the rises are getting weaker and the pullbacks shallower. Despite rising prices, the momentum is dying.',
    layman: 'Imagine a ball thrown upward but with each bounce it goes a little less high and falls a little less far. The bounces are getting smaller — energy is running out. A rising wedge is the market slowly running out of steam while still technically going up. It\'s like a car driving uphill that\'s running out of petrol — still moving forward, but barely. When the engine dies, it rolls back FAST.',
    howToSpot: '1) Both trendlines slope upward. 2) The lines CONVERGE (the channel narrows). 3) Volume typically declines during the wedge. 4) Breakdown below the lower trendline confirms the pattern. 5) Usually takes 3-5 weeks to form.',
    target: 'Measure the height of the wedge at its widest point. Subtract from the breakdown level.',
    psychology: 'Despite prices rising, each rally covers less ground. Buyers are getting weaker with each push. The converging lines represent diminishing returns — and when the lower support finally breaks, it\'s often swift because there\'s no strong buying underneath.',
    mistakes: 'Don\'t confuse a rising wedge with an ascending triangle. Ascending triangle has a FLAT top — rising wedge has BOTH lines sloping up. Also, not every rising wedge breaks down — confirmation is key.',
  },
};

const patternKeysList = Object.keys(chartPatterns);

// ============================================================
// ANIMATED SCENE
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
  }, [drawFn]);

  return <canvas ref={canvasRef} style={{ width: '100%', height }} className="rounded-2xl" />;
}

// ============================================================
// BLUEPRINT ANIMATION (layman: shapes in price = map of the future)
// ============================================================
function BlueprintAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);

    const phase = (f % 240) / 240;
    const drawProgress = Math.min(phase * 2, 1); // First half: draw pattern
    const labelPhase = Math.max(0, (phase - 0.5) * 2); // Second half: show labels

    // Draw an M shape (double top) progressively
    const pts = [
      [0.1, 0.7], [0.2, 0.5], [0.3, 0.25], [0.35, 0.2],
      [0.4, 0.25], [0.5, 0.55], [0.6, 0.25], [0.65, 0.2],
      [0.7, 0.25], [0.8, 0.5], [0.9, 0.75],
    ];

    const visibleCount = Math.floor(pts.length * drawProgress);

    // Grid lines
    ctx.strokeStyle = 'rgba(100,116,139,0.08)';
    ctx.lineWidth = 0.5;
    for (let y = 0.2; y <= 0.8; y += 0.15) {
      ctx.beginPath(); ctx.moveTo(0, h * y); ctx.lineTo(w, h * y); ctx.stroke();
    }

    // Pattern line
    if (visibleCount > 1) {
      ctx.beginPath();
      ctx.strokeStyle = '#0ea5e9';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#0ea5e9';
      ctx.shadowBlur = 8;
      for (let i = 0; i <= visibleCount && i < pts.length; i++) {
        const x = pts[i][0] * w;
        const y = pts[i][1] * h;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Labels
    if (labelPhase > 0) {
      ctx.globalAlpha = Math.min(labelPhase * 2, 1);

      // Peak labels
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 11px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Peak 1', pts[3][0] * w, pts[3][1] * h - 12);
      ctx.fillText('Peak 2', pts[7][0] * w, pts[7][1] * h - 12);

      // Neckline
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = 'rgba(245,158,11,0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(pts[0][0] * w, pts[4][1] * h + 20);
      ctx.lineTo(pts[10][0] * w, pts[4][1] * h + 20);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#f59e0b';
      ctx.font = '10px system-ui';
      ctx.fillText('NECKLINE', w * 0.5, pts[4][1] * h + 35);

      // Target arrow
      if (labelPhase > 0.5) {
        ctx.strokeStyle = 'rgba(14,165,233,0.5)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        const targetY = h * 0.75;
        ctx.beginPath();
        ctx.moveTo(w * 0.85, pts[4][1] * h + 20);
        ctx.lineTo(w * 0.85, targetY);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#0ea5e9';
        ctx.font = 'bold 10px system-ui';
        ctx.fillText('TARGET', w * 0.85, targetY + 14);
      }

      ctx.globalAlpha = 1;
    }
  }, []);

  return <AnimScene drawFn={draw} height={220} />;
}

// ============================================================
// PATTERN CHART RENDERER
// ============================================================
function PatternChart({ prices, height = 280, label }: { prices: number[]; height?: number; label?: string }) {
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
    const w = rect.width, h = rect.height;

    ctx.fillStyle = '#060a12';
    ctx.fillRect(0, 0, w, h);

    const pMin = Math.min(...prices) - 1;
    const pMax = Math.max(...prices) + 1;
    const pRange = pMax - pMin;
    const len = prices.length;

    const px = (i: number) => 20 + (i / (len - 1)) * (w - 40);
    const py = (p: number) => 20 + (h - 40) * (1 - (p - pMin) / pRange);

    // Price line with gradient
    ctx.beginPath();
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 2;
    for (let i = 0; i < len; i++) {
      i === 0 ? ctx.moveTo(px(i), py(prices[i])) : ctx.lineTo(px(i), py(prices[i]));
    }
    ctx.stroke();

    // Fill below
    ctx.lineTo(px(len - 1), h - 15);
    ctx.lineTo(px(0), h - 15);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(14,165,233,0.12)');
    grad.addColorStop(1, 'rgba(14,165,233,0)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Label
    if (label) {
      ctx.fillStyle = 'rgba(245,158,11,0.8)';
      ctx.font = 'bold 11px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(label, 25, 16);
    }
  }, [prices, height, label]);

  return <canvas ref={canvasRef} style={{ width: '100%', height }} className="rounded-xl bg-[#060a12]" />;
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function ChartPatternsLesson() {
  const [scrollY, setScrollY] = useState(0);
  const [activePattern, setActivePattern] = useState<string | null>(null);
  const [playgroundPattern, setPlaygroundPattern] = useState('head_shoulders');
  const [playgroundSeed, setPlaygroundSeed] = useState(42);

  // Pre-generate encyclopedia chart data
  const encyclopediaPrices = useMemo(() => {
    const result: Record<string, number[]> = {};
    for (const pk of patternKeysList) {
      result[pk] = chartPatterns[pk].genFn(42);
    }
    return result;
  }, []);

  const playgroundPrices = useMemo(() => chartPatterns[playgroundPattern].genFn(playgroundSeed), [playgroundPattern, playgroundSeed]);

  // Game
  const gamePatterns = useMemo(() => ['head_shoulders', 'double_bottom', 'asc_triangle', 'bull_flag', 'cup_handle'], []);
  const gamePrices = useMemo(() => gamePatterns.map((pk, i) => chartPatterns[pk].genFn(300 + i * 53)), [gamePatterns]);
  const gameOptions = useMemo(() => ['Head & Shoulders', 'Double Bottom', 'Ascending Triangle', 'Bull Flag', 'Cup & Handle'], []);

  const [gameRound, setGameRound] = useState(0);
  const [gameAnswers, setGameAnswers] = useState<(number | null)[]>(Array(5).fill(null));
  const [gameScore, setGameScore] = useState(0);
  const [gameShowNext, setGameShowNext] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  const answerGame = (choice: number) => {
    if (gameAnswers[gameRound] !== null) return;
    const na = [...gameAnswers]; na[gameRound] = choice; setGameAnswers(na);
    if (choice === gameRound) setGameScore(s => s + 1);
    setGameShowNext(true);
  };
  const nextRound = () => { if (gameRound < 4) { setGameRound(r => r + 1); setGameShowNext(false); } else setGameComplete(true); };
  const resetGame = () => { setGameRound(0); setGameAnswers(Array(5).fill(null)); setGameScore(0); setGameShowNext(false); setGameComplete(false); };

  // Quiz
  const quizQuestions = useMemo(() => [
    { q: 'A Head & Shoulders pattern has three peaks. Which peak is the highest?', opts: ['Left shoulder', 'The head (middle peak)', 'Right shoulder', 'They\'re all equal'], a: 1, explain: 'The head is the highest — that\'s what makes it the "head." The two shoulders are lower and roughly equal. Three peaks, middle highest, weakening momentum.' },
    { q: 'A "Double Top" looks like which letter?', opts: ['W', 'M', 'V', 'U'], a: 1, explain: 'M — two peaks at the same level with a valley between them. Flip it upside down and a Double Bottom looks like W.' },
    { q: 'In an ascending triangle, which line is flat?', opts: ['The support (bottom)', 'The resistance (top)', 'Both', 'Neither — both slope up'], a: 1, explain: 'The resistance (top) is flat while the support (bottom) rises. Higher lows pushing against a flat ceiling until it breaks.' },
    { q: 'What is the "pole" in a Bull Flag pattern?', opts: ['The gentle pullback channel', 'The sharp initial rally', 'The breakout point', 'The stop loss level'], a: 1, explain: 'The pole is the sharp, near-vertical rally that happens BEFORE the flag forms. The flag itself is the gentle pullback. Pole = sprint, flag = breather.' },
    { q: 'How do you calculate the target for a Double Top breakdown?', opts: ['Add the pattern height to the neckline', 'Subtract the pattern height from the neckline', 'Double the current price', 'Use Fibonacci levels only'], a: 1, explain: 'Subtract the height (peak minus valley) from the neckline. If peak=$110, valley=$105, break at $105, target = $105 - $5 = $100. The pattern "projects" its own height downward.' },
    { q: 'A Cup & Handle pattern should have a cup shaped like:', opts: ['A sharp V', 'A rounded U', 'A flat line', 'A triangle'], a: 1, explain: 'A rounded U — this shows gradual, orderly accumulation. V-shaped recoveries are too aggressive and don\'t represent the same slow institutional buying.' },
    { q: 'Volume during a triangle pattern typically:', opts: ['Increases steadily', 'Decreases as price converges, then spikes on breakout', 'Stays constant', 'Is irrelevant'], a: 1, explain: 'Decreases during the triangle (less participation as range narrows) then spikes on the breakout. The volume spike confirms the breakout is genuine.' },
    { q: 'A rising wedge is typically:', opts: ['Bullish — prices are rising', 'Bearish — momentum is dying despite rising prices', 'Neutral', 'Only valid on weekly charts'], a: 1, explain: 'Bearish — even though prices rise, the converging lines show DECREASING momentum. It\'s a car running out of fuel going uphill. The breakdown is usually swift and sharp.' },
  ], []);

  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(Array(8).fill(null));
  const quizDone = quizAnswers.every(a => a !== null);
  const score = quizDone ? Math.round((quizAnswers.filter((a, i) => a === quizQuestions[i].a).length / quizQuestions.length) * 100) : 0;
  const certUnlocked = quizDone && score >= 66;

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-900/50">
        <motion.div className="h-full bg-gradient-to-r from-amber-500 to-accent-500" style={{ width: `${Math.min((scrollY / (typeof document !== 'undefined' ? document.body.scrollHeight - window.innerHeight : 1)) * 100, 100)}%` }} />
      </div>

      <nav className="sticky top-0 z-40 px-5 py-3 flex items-center justify-between" style={{ background: 'rgba(6,10,18,0.85)', backdropFilter: 'blur(16px)' }}>
        <Link href="/academy" className="text-xs text-gray-500 hover:text-gray-300 transition">← Academy</Link>
        <div className="flex items-center gap-2"><Crown className="w-3.5 h-3.5 text-amber-400" /><span className="text-xs font-bold text-amber-400">PRO</span></div>
      </nav>

      {/* Hero */}
      <section className="px-5 pt-16 pb-12 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 2 · Lesson 9</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">
            <span className="bg-gradient-to-r from-primary-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Chart Patterns</span>
          </h1>
          <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">The shapes price draws when it&apos;s about to make a big move. Learn to see them before everyone else.</p>
        </motion.div>
      </section>

      {/* SECTION 00 — WHY THIS MATTERS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First — Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-lg font-bold text-white mb-3">🏗️ Price draws blueprints before it moves.</p>
            <p className="text-gray-400 leading-relaxed mb-4">Before a building goes up, there&apos;s a blueprint. Before a price breakout, there&apos;s a pattern. Chart patterns are the market&apos;s blueprints — shapes that price draws repeatedly because human psychology is predictable. Fear, greed, and indecision create the same shapes over and over.</p>
            <p className="text-gray-400 leading-relaxed"><strong className="text-white">These patterns have been documented for over 100 years</strong> (first catalogued by Charles Dow in the 1900s and refined by Edwards & Magee in the 1940s). They work because they reflect timeless crowd psychology — not indicators, not algorithms, but <em className="text-primary-400">how groups of humans behave when money is at stake</em>.</p>
          </div>

          <BlueprintAnimation />

          <div className="mt-6 p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5">
            <p className="text-xs font-bold text-amber-400 mb-2">🔍 REAL SCENARIO</p>
            <p className="text-sm text-gray-300 leading-relaxed">Bitcoin in November 2021 formed a textbook Double Top at $69,000. The two peaks were nearly identical. When the neckline at $56,000 broke, the measured target was $43,000 (the $13,000 height subtracted from $56,000). Bitcoin eventually fell to $33,000 — <em className="text-amber-400">overshooting the target by 30%</em>. Traders who recognised the pattern at the neckline break avoided the worst of the crash or profited from the short.</p>
          </div>
        </motion.div>
      </section>

      {/* SECTION 01 — TWO TYPES */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 — The Two Types</p>
          <h2 className="text-2xl font-extrabold mb-6">Reversal vs Continuation</h2>
          <p className="text-sm text-gray-400 mb-6">Every chart pattern answers one question: &quot;Is the current trend going to flip, or keep going?&quot;</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl glass-card border-l-4 border-red-400">
              <h3 className="font-bold text-white text-lg mb-2">🔄 Reversal Patterns</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-3">Signal that the current trend is ENDING and price is about to go the other way.</p>
              <p className="text-xs text-gray-500 leading-relaxed mb-2">💡 <strong className="text-primary-400">Think:</strong> A car doing a U-turn. It was going north, now it&apos;s going south.</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {['Head & Shoulders', 'Double Top', 'Double Bottom', 'Rising Wedge'].map(n => (
                  <span key={n} className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 text-[10px] font-medium">{n}</span>
                ))}
              </div>
            </div>
            <div className="p-5 rounded-2xl glass-card border-l-4 border-primary-400">
              <h3 className="font-bold text-white text-lg mb-2">➡️ Continuation Patterns</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-3">Signal that the current trend is PAUSING — taking a breather — then continuing in the same direction.</p>
              <p className="text-xs text-gray-500 leading-relaxed mb-2">💡 <strong className="text-primary-400">Think:</strong> A runner stopping for water, then continuing the race.</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {['Asc Triangle', 'Desc Triangle', 'Bull Flag', 'Cup & Handle'].map(n => (
                  <span key={n} className="px-2 py-0.5 rounded bg-primary-500/10 text-primary-400 text-[10px] font-medium">{n}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 p-4 rounded-xl bg-primary-500/5 border border-primary-500/15">
            <p className="text-sm text-gray-300 leading-relaxed">💡 <strong className="text-primary-400">Key insight:</strong> Every pattern has a <strong className="text-white">measured move target</strong> — you can calculate exactly how far price should go after the breakout. It&apos;s like the pattern tells you the destination before the journey starts.</p>
          </div>
        </motion.div>
      </section>

      {/* SECTION 02 — INTERACTIVE PLAYGROUND */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 — Pattern Playground</p>
          <h2 className="text-2xl font-extrabold mb-4">See Every Pattern in Action</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">Select a pattern to see what it looks like on a real chart. Hit &quot;Randomise&quot; to see a different variation — because no two patterns look exactly the same in the wild.</p>

          <div className="flex flex-wrap gap-2 mb-4">
            {patternKeysList.map(pk => (
              <button key={pk} onClick={() => { setPlaygroundPattern(pk); setPlaygroundSeed(42); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${playgroundPattern === pk ? 'bg-amber-500 text-black' : 'glass text-gray-400 hover:text-white'}`}>
                {chartPatterns[pk].name}
              </button>
            ))}
          </div>

          <PatternChart prices={playgroundPrices} label={chartPatterns[playgroundPattern].name} />

          <div className="mt-3 flex items-center justify-between">
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${chartPatterns[playgroundPattern].type === 'reversal' ? 'bg-red-500/15 text-red-400' : 'bg-primary-500/15 text-primary-400'}`}>
              {chartPatterns[playgroundPattern].type === 'reversal' ? '🔄 Reversal' : '➡️ Continuation'} · {chartPatterns[playgroundPattern].direction}
            </span>
            <button onClick={() => setPlaygroundSeed(s => s + 7)} className="px-4 py-2 rounded-xl glass text-xs text-gray-400 hover:text-white font-medium transition active:scale-95">
              🎲 Randomise
            </button>
          </div>

          <div className="mt-4 p-4 rounded-xl bg-primary-500/5 border border-primary-500/15">
            <p className="text-sm text-gray-300 leading-relaxed">💡 <strong className="text-primary-400">Tip:</strong> Hit Randomise a few times and notice how the SHAPE stays the same but the details change. That&apos;s the key — you&apos;re looking for the shape, not perfection. Real patterns are messy. If you wait for a textbook-perfect pattern, you&apos;ll never trade.</p>
          </div>
        </motion.div>
      </section>

      {/* SECTION 03 — PATTERN ENCYCLOPEDIA */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 — The Pattern Encyclopedia</p>
          <h2 className="text-2xl font-extrabold mb-3">8 Patterns in Full Detail</h2>
          <p className="text-sm text-gray-400 mb-6">Tap any pattern. Each includes: chart, plain English explanation, how to spot it, measured move target, psychology, and common mistakes.</p>

          <div className="space-y-3">
            {patternKeysList.map(pk => {
              const p = chartPatterns[pk];
              const isOpen = activePattern === pk;
              const prices = encyclopediaPrices[pk];
              return (
                <motion.div key={pk} layout className="rounded-2xl glass-card overflow-hidden">
                  <button onClick={() => setActivePattern(isOpen ? null : pk)} className="w-full p-4 flex items-center justify-between text-left">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-8 rounded-full ${p.type === 'reversal' ? 'bg-red-400' : 'bg-primary-400'}`} />
                      <div>
                        <h3 className="font-bold text-white text-sm">{p.name}</h3>
                        <p className="text-xs text-gray-500">{p.type === 'reversal' ? '🔄 Reversal' : '➡️ Continuation'} · {p.direction}</p>
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="px-4 pb-5 space-y-4">
                          <PatternChart prices={prices} height={220} />

                          <div><p className="text-xs font-bold text-amber-400 mb-1">📝 WHAT IT IS</p><p className="text-sm text-gray-400 leading-relaxed">{p.description}</p></div>

                          <div className="p-3 rounded-xl bg-primary-500/5 border border-primary-500/15"><p className="text-sm text-gray-300 leading-relaxed">💡 <strong className="text-primary-400">In plain English:</strong> {p.layman}</p></div>

                          <div><p className="text-xs font-bold text-amber-400 mb-1">🔍 HOW TO SPOT IT</p><p className="text-sm text-gray-400 leading-relaxed">{p.howToSpot}</p></div>

                          <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15"><p className="text-sm text-gray-300 leading-relaxed">🎯 <strong className="text-amber-400">Measured Move Target:</strong> {p.target}</p></div>

                          <div><p className="text-xs font-bold text-amber-400 mb-1">🧠 PSYCHOLOGY</p><p className="text-sm text-gray-400 leading-relaxed">{p.psychology}</p></div>

                          <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15"><p className="text-sm text-gray-300 leading-relaxed">⚠️ <strong className="text-red-400">Common Mistakes:</strong> {p.mistakes}</p></div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* SECTION 04 — COMMON MISTAKES */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 — Universal Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-6">5 Mistakes Every Pattern Trader Makes</h2>

          <div className="space-y-4">
            {[
              { title: 'Trading Before Confirmation', wrong: 'Seeing half a Head & Shoulders and selling immediately.', right: 'Wait for the neckline break with volume. Until then, it\'s just three bumps on a chart.', tip: 'The pattern doesn\'t exist until it\'s complete. A half-pattern is just noise.' },
              { title: 'Expecting Textbook Perfection', wrong: 'Dismissing a Double Top because the peaks are $0.50 apart.', right: 'Real patterns are messy. Shoulders aren\'t equal. Peaks differ by 1-3%. Triangles aren\'t geometric. Look for the SHAPE, not perfection.', tip: 'If you can squint and see the pattern, it counts.' },
              { title: 'Ignoring Volume', wrong: 'Trading every triangle breakout regardless of volume.', right: 'Breakouts on low volume are fakeouts. Volume should DECREASE during the pattern and SPIKE on the breakout.', tip: 'Volume is the pattern\'s heartbeat. No heartbeat = dead pattern.' },
              { title: 'Using Tiny Timeframes', wrong: 'Trading a "Head & Shoulders" on a 1-minute chart.', right: 'Patterns on higher timeframes (4H, Daily, Weekly) are far more reliable. They represent more decisions by more traders.', tip: 'A pattern on a daily chart = thousands of traders agreeing. On a 1-minute chart = maybe 50 people.' },
              { title: 'Forgetting the Target', wrong: 'Taking profit randomly or letting winners turn into losers.', right: 'Every pattern gives you a CALCULATED target. Use it. Set your take-profit at the measured move. Discipline wins.', tip: 'The pattern told you where it was going BEFORE the breakout. Trust the math.' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="p-5 rounded-2xl glass-card">
                <h3 className="font-bold text-white mb-3">{i + 1}. {item.title}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15"><p className="text-xs font-bold text-red-400 mb-1">❌ WRONG</p><p className="text-xs text-gray-400 leading-relaxed">{item.wrong}</p></div>
                  <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/15"><p className="text-xs font-bold text-green-400 mb-1">✅ RIGHT</p><p className="text-xs text-gray-400 leading-relaxed">{item.right}</p></div>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">💡 {item.tip}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* SECTION 05 — GAME */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 — Name That Shape</p>
          <h2 className="text-2xl font-extrabold mb-2">Pattern Recognition Challenge</h2>
          <p className="text-sm text-gray-400 mb-6">5 rounds. Study the chart and identify the pattern.</p>

          {!gameComplete ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500">Round {gameRound + 1} of 5</span>
                <span className="text-xs text-amber-400 font-bold">{gameScore}/{gameRound + (gameAnswers[gameRound] !== null ? 1 : 0)} correct</span>
              </div>
              <div className="w-full h-1.5 bg-gray-800 rounded-full mb-4 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-accent-500 transition-all" style={{ width: `${((gameRound + (gameAnswers[gameRound] !== null ? 1 : 0)) / 5) * 100}%` }} />
              </div>

              <PatternChart prices={gamePrices[gameRound]} height={260} />

              <div className="mt-4 space-y-2">
                {gameOptions.map((opt, oi) => {
                  const answered = gameAnswers[gameRound] !== null;
                  const isCorrect = oi === gameRound;
                  const isChosen = gameAnswers[gameRound] === oi;
                  let cls = 'glass text-gray-300 hover:bg-white/5';
                  if (answered) {
                    if (isCorrect) cls = 'bg-green-500/15 border-green-500/30 text-green-400';
                    else if (isChosen) cls = 'bg-red-500/15 border-red-500/30 text-red-400';
                    else cls = 'glass text-gray-600';
                  }
                  return (
                    <button key={oi} onClick={() => answerGame(oi)} disabled={answered} className={`w-full text-left p-3.5 rounded-xl border text-sm font-medium transition-all ${cls}`}>
                      {opt} {answered && isCorrect && '✓'} {answered && isChosen && !isCorrect && '✗'}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {gameAnswers[gameRound] !== null && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0 }} className="mt-4">
                    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
                      <p className="text-sm text-gray-300 leading-relaxed"><strong className="text-amber-400">{chartPatterns[gamePatterns[gameRound]].name}:</strong> {chartPatterns[gamePatterns[gameRound]].layman}</p>
                    </div>
                    {gameShowNext && (
                      <button onClick={nextRound} className="mt-3 w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold shadow-lg shadow-amber-500/20 active:scale-95 transition-all">
                        {gameRound < 4 ? 'Next Round →' : 'See Results →'}
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-8 glass-card rounded-2xl">
              <p className={`text-5xl font-extrabold mb-2 ${gameScore >= 3 ? 'text-amber-400' : 'text-red-400'}`}>{gameScore}/5</p>
              <p className="text-sm text-gray-400 mb-4">{gameScore === 5 ? '🏆 Pattern master! You see shapes before they complete.' : gameScore >= 3 ? 'Getting the eye — keep practising pattern recognition.' : 'Review the encyclopedia and study each shape carefully.'}</p>
              <button onClick={resetGame} className="px-6 py-2.5 rounded-xl glass text-xs text-gray-300 font-medium hover:text-white transition">Try Again</button>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* SECTION 06 — QUIZ */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 — Knowledge Check</p>
          <h2 className="text-2xl font-extrabold mb-6">Chart Pattern Quiz</h2>
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
                  if (answered) {
                    if (isCorrect) cls = 'bg-green-500/15 border-green-500/30 text-green-400';
                    else if (isChosen) cls = 'bg-red-500/15 border-red-500/30 text-red-400';
                    else cls = 'glass text-gray-600';
                  }
                  return (
                    <button key={oi} onClick={() => { if (!answered) { const na = [...quizAnswers]; na[qi] = oi; setQuizAnswers(na); } }} disabled={answered} className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${cls}`}>
                      {opt} {answered && isCorrect && '✓'} {answered && isChosen && !isCorrect && '✗'}
                    </button>
                  );
                })}
              </div>
              {quizAnswers[qi] !== null && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 text-sm text-gray-400 leading-relaxed">
                  <span className="text-amber-400 font-bold">✓</span> {q.explain}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
        {quizDone && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 text-center p-8 glass-card rounded-2xl">
            <p className={`text-5xl font-extrabold mb-2 ${score >= 66 ? 'text-amber-400' : 'text-red-400'}`}>{score}%</p>
            <p className="text-sm text-gray-400">{score === 100 ? '🏆 Perfect — you see patterns everywhere now.' : score >= 66 ? 'Solid grasp of chart patterns.' : 'Review the encyclopedia and the mistakes section.'}</p>
          </motion.div>
        )}
      </section>

      {/* Certificate */}
      <section className="px-5 py-16 text-center">
        {!certUnlocked ? (
          <div className="max-w-md mx-auto p-8 glass rounded-2xl"><p className="text-4xl mb-3 opacity-30">🔒</p><p className="text-sm text-gray-500">Score 66%+ to unlock your <strong className="text-amber-400">Pro Certificate</strong></p></div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, type: 'spring' }}
            className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(14,165,233,0.06),transparent,rgba(245,158,11,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
            <div className="absolute inset-[1px] rounded-3xl border border-amber-500/10" />
            <div className="relative z-10">
              <div className="w-[80px] h-[80px] mx-auto mb-5 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-4xl shadow-lg shadow-primary-500/30">📐</div>
              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest mb-2">Pro Certificate</p>
              <h3 className="text-xl font-extrabold mb-1">Certificate of Mastery</h3>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">Has mastered<br /><strong className="text-white">Level 2.9: Chart Patterns</strong><br />at ATLAS Academy by Interakktive</p>
              <p className="bg-gradient-to-r from-primary-400 via-accent-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1" style={{ WebkitTransform: 'translateZ(0)' }}>— Pattern Architect —</p>
              <p className="font-mono text-[11px] text-gray-500 mb-4">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L2.9-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
            </div>
          </motion.div>
        )}
      </section>

      <section className="text-center px-5 pt-10 pb-24">
        <p className="text-xs tracking-widest uppercase text-gray-600 mb-4">Up Next</p>
        <h2 className="text-xl font-bold mb-6">Lesson 2.10 — Fibonacci Retracements</h2>
        <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">
          Continue <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
