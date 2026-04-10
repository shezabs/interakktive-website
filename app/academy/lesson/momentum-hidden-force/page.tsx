// app/academy/lesson/momentum-hidden-force/page.tsx
// ATLAS Academy — Lesson 5.5: Momentum — The Hidden Force [PRO]
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
// ANIMATION 1: Train Momentum
// A train moves along tracks. Speed gauge shows acceleration/deceleration.
// Key insight: the train slows down BEFORE it stops — momentum fades
// before price reverses.
// ============================================================
function TrainMomentumAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.008;
    const cycle = (Math.sin(t) + 1) / 2; // 0-1 oscillation

    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Momentum = The Speed of Price Movement', w / 2, 16);

    // Ground/track line
    const trackY = h * 0.58;
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(20, trackY);
    ctx.lineTo(w - 20, trackY);
    ctx.stroke();

    // Track sleepers
    for (let i = 0; i < 30; i++) {
      const sx = 20 + i * ((w - 40) / 30);
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fillRect(sx, trackY - 2, 8, 6);
    }

    // Train position — moves right, then slows, stops, reverses
    const speed = Math.cos(t) * 0.7; // -0.7 to 0.7
    const accel = -Math.sin(t) * 0.7; // derivative of speed
    const trainX = w * 0.15 + (w * 0.65) * cycle;

    // Train body
    const tw = 50;
    const th = 22;
    const trainTop = trackY - th - 2;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(trainX, trackY + 4, tw / 2 + 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    const bodyGrad = ctx.createLinearGradient(trainX - tw / 2, trainTop, trainX - tw / 2, trainTop + th);
    bodyGrad.addColorStop(0, speed > 0.1 ? '#22c55e' : speed < -0.1 ? '#ef4444' : '#f59e0b');
    bodyGrad.addColorStop(1, speed > 0.1 ? '#166534' : speed < -0.1 ? '#991b1b' : '#92400e');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.roundRect(trainX - tw / 2, trainTop, tw, th, 4);
    ctx.fill();

    // Wheels
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath(); ctx.arc(trainX - 15, trackY, 5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(trainX + 15, trackY, 5, 0, Math.PI * 2); ctx.fill();

    // Window
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(trainX - 8, trainTop + 4, 16, 8);

    // Speed label on train
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(speed > 0.1 ? '→ MOVING' : speed < -0.1 ? '← REVERSING' : '■ STOPPED', trainX, trainTop + th + 18);

    // === SPEED GAUGE (top right) ===
    const gaugeX = w - 70;
    const gaugeY = 55;
    const gaugeR = 32;

    // Gauge background
    ctx.beginPath();
    ctx.arc(gaugeX, gaugeY, gaugeR, Math.PI * 0.75, Math.PI * 2.25);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 8;
    ctx.stroke();

    // Gauge value arc
    const normSpeed = (speed + 0.7) / 1.4; // 0-1
    const startA = Math.PI * 0.75;
    const endA = startA + Math.PI * 1.5 * normSpeed;
    const gaugeColor = speed > 0.3 ? '#22c55e' : speed > 0 ? '#f59e0b' : speed > -0.3 ? '#f59e0b' : '#ef4444';
    ctx.beginPath();
    ctx.arc(gaugeX, gaugeY, gaugeR, startA, endA);
    ctx.strokeStyle = gaugeColor;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.lineCap = 'butt';

    // Gauge needle
    const needleA = startA + Math.PI * 1.5 * normSpeed;
    ctx.beginPath();
    ctx.moveTo(gaugeX, gaugeY);
    ctx.lineTo(gaugeX + Math.cos(needleA) * (gaugeR - 12), gaugeY + Math.sin(needleA) * (gaugeR - 12));
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center dot
    ctx.beginPath();
    ctx.arc(gaugeX, gaugeY, 3, 0, Math.PI * 2);
    ctx.fillStyle = gaugeColor;
    ctx.fill();

    // Speed value
    ctx.fillStyle = gaugeColor;
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${(speed * 100).toFixed(0)}`, gaugeX, gaugeY + gaugeR * 0.5);
    ctx.font = '8px system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillText('MOMENTUM', gaugeX, gaugeY + gaugeR * 0.75);

    // === ACCELERATION INDICATOR (top left) ===
    const accX = 70;
    const accY = 55;

    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('ACCELERATION', accX, accY - 28);

    // Arrow showing acceleration direction
    const arrowLen = Math.abs(accel) * 35;
    const arrowColor = accel > 0.05 ? '#22c55e' : accel < -0.05 ? '#ef4444' : '#f59e0b';
    ctx.strokeStyle = arrowColor;
    ctx.fillStyle = arrowColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    if (Math.abs(accel) > 0.05) {
      const dir = accel > 0 ? 1 : -1;
      ctx.beginPath();
      ctx.moveTo(accX - dir * arrowLen / 2, accY);
      ctx.lineTo(accX + dir * arrowLen / 2, accY);
      ctx.stroke();
      // Arrow head
      ctx.beginPath();
      ctx.moveTo(accX + dir * arrowLen / 2, accY);
      ctx.lineTo(accX + dir * (arrowLen / 2 - 8), accY - 5);
      ctx.lineTo(accX + dir * (arrowLen / 2 - 8), accY + 5);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.font = 'bold 12px system-ui';
      ctx.fillText('—', accX, accY + 5);
    }
    ctx.lineCap = 'butt';

    ctx.font = '9px system-ui';
    ctx.fillStyle = arrowColor;
    ctx.fillText(accel > 0.1 ? 'Speeding up!' : accel < -0.1 ? 'Slowing down!' : 'Flat', accX, accY + 18);

    // Key insight at bottom
    ctx.fillStyle = 'rgba(245,158,11,0.5)';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('The train slows down BEFORE it stops — momentum fades BEFORE price reverses', w / 2, h - 10);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 2: Wave Energy
// Ocean waves where height = momentum energy
// Waves build (acceleration), peak (max momentum),
// then fade (deceleration) before the next set
// ============================================================
function WaveEnergyAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Price is the wave. Momentum is the energy behind it.', w / 2, 16);

    const baseY = h * 0.55;

    // Draw water surface (price wave)
    ctx.strokeStyle = 'rgba(14,165,233,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const pricePoints: { x: number; y: number }[] = [];
    for (let x = 0; x <= w; x += 2) {
      const phase = x * 0.02 + t;
      // Wave height varies — builds then fades (momentum envelope)
      const envelope = 0.5 + 0.5 * Math.sin(phase * 0.15 - t * 0.3);
      const waveH = envelope * 30 + 5;
      const y = baseY - Math.sin(phase) * waveH;
      pricePoints.push({ x, y });
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Fill water
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = 'rgba(14,165,233,0.04)';
    ctx.fill();

    // Momentum energy bars below the wave (showing energy behind each section)
    const barY = h * 0.82;
    const barMaxH = h * 0.15;
    const numBars = 40;
    const barW = (w - 20) / numBars;

    for (let i = 0; i < numBars; i++) {
      const bx = 10 + i * barW;
      const phase = bx * 0.02 + t;
      const envelope = 0.5 + 0.5 * Math.sin(phase * 0.15 - t * 0.3);
      const barH = envelope * barMaxH;

      const isStrong = envelope > 0.65;
      const isWeak = envelope < 0.35;

      ctx.fillStyle = isStrong ? 'rgba(34,197,94,0.4)' : isWeak ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)';
      ctx.fillRect(bx, barY - barH, barW - 2, barH);
    }

    // Labels
    ctx.font = '9px system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(14,165,233,0.6)';
    ctx.fillText('PRICE (the wave you see)', 15, baseY - 42);
    ctx.fillStyle = 'rgba(245,158,11,0.6)';
    ctx.fillText('MOMENTUM (the energy you measure)', 15, barY - barMaxH - 5);

    // Annotations — find a building and fading section
    const buildX = w * 0.25;
    const fadeX = w * 0.7;

    ctx.fillStyle = 'rgba(34,197,94,0.5)';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('↑ Energy building', buildX, barY + 14);

    ctx.fillStyle = 'rgba(239,68,68,0.5)';
    ctx.fillText('↓ Energy fading', fadeX, barY + 14);

    // Bottom insight
    ctx.fillStyle = 'rgba(245,158,11,0.45)';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('When energy fades, the next wave will be smaller — momentum predicts wave SIZE, not timing', w / 2, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// MOMENTUM CONCEPTS
// ============================================================
const concepts = [
  { title: 'Momentum is the SPEED of price change', detail: 'Price can go up slowly or quickly. Both are uptrends. But the SPEED at which price moves tells you about the conviction behind the move. A stock rising £2 per day has very different momentum than one rising £20 per day &mdash; even if both are &ldquo;bullish.&rdquo; Momentum measures HOW FAST, not which direction.', analogy: 'A car driving north at 30 km/h and one driving north at 150 km/h are both heading north. But the second car has 5&times; the momentum. If you need to predict which one will overshoot the exit, it&apos;s the fast one.', color: 'text-amber-400' },
  { title: 'Acceleration tells you MORE than speed', detail: 'Momentum has its own momentum &mdash; called acceleration. If price is rising and the RATE of rise is increasing, that&apos;s acceleration. If price is still rising but the rate is slowing, that&apos;s deceleration. Deceleration doesn&apos;t mean reversal yet &mdash; but it means the engine is losing power. This is what the MACD histogram measures: the acceleration of momentum.', analogy: 'Press the accelerator in a car: you&apos;re gaining speed (accelerating). Lift your foot off the pedal: you&apos;re still moving forward but slowing (decelerating). You haven&apos;t braked yet. You haven&apos;t reversed. But the dynamics have shifted.', color: 'text-sky-400' },
  { title: 'Momentum fades BEFORE price reverses', detail: 'This is the single most valuable insight in all of momentum analysis. Before a trend reverses, the momentum behind it weakens. Price makes a new high, but the energy behind that high is less than the energy behind the previous high. This is called <strong class="text-white">divergence</strong> &mdash; and it&apos;s the closest thing to a &ldquo;warning signal&rdquo; that indicators can produce. It doesn&apos;t guarantee reversal. But it tells you the engine is running out of fuel.', analogy: 'A ball thrown upward is still rising as it decelerates. At the peak, its speed is zero for one instant before it falls. Momentum (speed) was zero BEFORE the ball started falling. The reversal in direction came AFTER the reversal in momentum. Markets work the same way.', color: 'text-green-400' },
  { title: 'Momentum and trend are NOT the same thing', detail: 'A trend tells you DIRECTION (up or down). Momentum tells you ENERGY (strong or weak). You can have a bullish trend with fading momentum (tired trend, possible reversal). You can have a bearish trend with increasing momentum (accelerating selloff). The combination of trend + momentum gives you a far richer picture than either alone.', analogy: 'A river always flows downhill (trend = direction). But sometimes the current is raging (strong momentum) and sometimes it&apos;s barely moving (weak momentum). A kayaker needs to know BOTH the river&apos;s direction AND its strength.', color: 'text-purple-400' },
  { title: 'Momentum measures conviction, not value', detail: 'High momentum doesn&apos;t mean price is &ldquo;too high&rdquo; or &ldquo;overvalued.&rdquo; It means that the participants moving price right now are doing so with significant force. Strong momentum in an uptrend means buyers are aggressive. Weak momentum in an uptrend means buyers are losing interest. Neither says anything about whether the price is &ldquo;correct&rdquo; &mdash; that&apos;s a fundamentals question, not a momentum question.', analogy: 'A crowd running toward a shop sale with enthusiasm (high momentum) doesn&apos;t tell you whether the sale is good value. It tells you the crowd BELIEVES it is. The crowd could be right or wrong &mdash; but their conviction is measurable.', color: 'text-red-400' },
];

// ============================================================
// GAME DATA
// ============================================================
const gameRounds = [
  {
    scenario: 'Gold has been rising for 3 weeks. Today it made a new high at $2,085 &mdash; but RSI made a LOWER high than it did at the previous price high of $2,070. What is this pattern called, and what does it suggest?',
    options: [
      { text: 'This is a double top pattern &mdash; sell immediately because price will reverse', correct: false, explain: 'This is NOT a double top (that&apos;s a price pattern). This is a BEARISH DIVERGENCE between price and momentum. Price made a higher high ($2,085 > $2,070) but RSI made a lower high (less energy behind the new peak). It suggests momentum is fading and the trend MAY be weakening. It does NOT guarantee reversal &mdash; it&apos;s a warning, not a signal. You still need structure and volume to confirm.' },
      { text: 'Bearish divergence &mdash; price made a higher high but momentum (RSI) made a lower high. This warns that the energy behind the trend is weakening, though it does not guarantee reversal.', correct: true, explain: 'Exactly right. Bearish divergence means the fuel tank is draining. Each new high requires LESS momentum to reach. Eventually the engine stalls. But &ldquo;eventually&rdquo; could be the next candle or 50 candles away. Divergence is a warning light, not a brake pedal. Combine it with structure (supply zone?) and volume (declining?) for a valid setup.' },
    ],
  },
  {
    scenario: 'EUR/USD is in a downtrend. MACD histogram has been negative for 2 weeks. Today the histogram bar is LESS negative than yesterday (&minus;3.2 vs &minus;4.1). Price is still falling. What does this mean?',
    options: [
      { text: 'The downtrend is over &mdash; MACD histogram turning means it&apos;s time to buy', correct: false, explain: 'The histogram is still NEGATIVE (&minus;3.2), which means the fast EMA is still below the slow EMA (bearish). What changed is that the gap is NARROWING &mdash; the histogram is less negative. This is deceleration, not reversal. The car is still moving downhill but the slope is getting gentler. Buying now would be fighting a trend that is slowing but not reversed.' },
      { text: 'Bearish momentum is DECELERATING &mdash; the downtrend is losing speed but has not reversed. The fast EMA is converging toward the slow EMA. Watch for further signs but do not buy yet.', correct: true, explain: 'Correct. A shrinking negative histogram means the 12 EMA is catching up to the 26 EMA. Momentum is fading but direction is still bearish. Deceleration → possible pause → possible reversal OR continuation. You need a structure break (BOS) and momentum crossing zero before the trend is actually reversed. Patience.' },
    ],
  },
  {
    scenario: 'A trader says: &ldquo;RSI at 78 means gold is overvalued and due for a correction.&rdquo; What is fundamentally wrong with this statement?',
    options: [
      { text: 'Nothing &mdash; RSI above 70 means overvalued by definition', correct: false, explain: 'RSI does NOT measure value. It measures the ratio of recent gains to recent losses &mdash; that is MOMENTUM, not valuation. RSI at 78 means upward momentum is currently strong. Whether gold is &ldquo;overvalued&rdquo; requires fundamental analysis (supply, demand, inflation, central bank policy). Momentum and value are completely different dimensions.' },
      { text: 'RSI measures momentum (speed of price change), not value. RSI at 78 means upward momentum is strong &mdash; it says nothing about whether the asset is overvalued or undervalued.', correct: true, explain: 'Exactly. Momentum and value exist in different dimensions. Bitcoin could have RSI at 90 and still be &ldquo;undervalued&rdquo; if adoption is accelerating. A stock could have RSI at 20 and still be &ldquo;overvalued&rdquo; if earnings collapsed. RSI measures the speed of recent price change. That is all.' },
    ],
  },
  {
    scenario: 'You are watching two stocks. Stock A: price rose 5% this week, RSI rose from 55 to 68. Stock B: price also rose 5%, but RSI only moved from 55 to 60. Which move has more momentum conviction?',
    options: [
      { text: 'Both are equal &mdash; they both rose 5%, so momentum is the same', correct: false, explain: 'Price change alone does not tell you about momentum quality. Stock A&apos;s RSI jumped 13 points for a 5% move &mdash; the rise was dominated by strong, consistent gains. Stock B&apos;s RSI only moved 5 points for the same 5% rise &mdash; the gains were offset by interspersed losses (choppier move). Stock A has cleaner, stronger momentum behind its 5% rise.' },
      { text: 'Stock A &mdash; its RSI moved more for the same price change, meaning the rise was cleaner and more dominated by consistent gains. Stock B had choppier, less convincing momentum.', correct: true, explain: 'Correct. RSI measures the ratio of gains to losses. Stock A&apos;s gains heavily outweighed its losses (RSI jumped 13 points). Stock B had gains mixed with losses (RSI only moved 5 points). Same destination, very different journeys. Stock A&apos;s momentum is healthier and more likely to continue.' },
    ],
  },
  {
    scenario: 'A trend trader waits for a pullback. Price pulls back to the 50 EMA. RSI falls from 72 to 48 during the pullback. Is this a good entry?',
    options: [
      { text: 'No &mdash; RSI dropped below 50 which means the trend is over and momentum has reversed bearish', correct: false, explain: 'RSI dropping to 48 during a pullback in a bullish trend is perfectly normal and healthy. It means the PULLBACK had enough momentum to push RSI below the midline briefly. As long as the higher-timeframe trend structure is intact (no BOS to the downside) and price is at a key level (50 EMA), this is momentum cooling off &mdash; not a trend reversal. In fact, RSI resetting from overbought territory during a pullback is what creates the NEXT entry opportunity.' },
      { text: 'Potentially yes &mdash; RSI cooling from 72 to 48 during a pullback is healthy. Momentum reset at a key level (50 EMA) with trend structure intact is a classic re-entry setup. Needs volume and session confirmation.', correct: true, explain: 'Exactly right. Momentum is cyclical within trends. RSI rises during impulses and falls during pullbacks. RSI at 48 during a pullback, with price at the 50 EMA and no structural break, is a momentum &ldquo;reset&rdquo; &mdash; the engine cooled down and is ready for the next push. Add session timing and volume confirmation for an A+ setup.' },
    ],
  },
];

// ============================================================
// QUIZ DATA
// ============================================================
const quizQuestions = [
  { q: 'What does momentum measure in trading?', opts: ['The direction price is moving (up or down)', 'The SPEED and FORCE of price movement', 'Whether an asset is overvalued or undervalued', 'How many traders are in the market'], correct: 1, explain: 'Momentum measures how FAST and with how much FORCE price is moving. Direction is trend. Speed is momentum. They are related but distinct dimensions.' },
  { q: 'What is the difference between momentum and acceleration?', opts: ['They are the same thing', 'Momentum is the speed of price; acceleration is the speed of momentum (is it speeding up or slowing down?)', 'Acceleration is faster momentum', 'Momentum only exists in uptrends; acceleration only exists in downtrends'], correct: 1, explain: 'Momentum = how fast price is moving. Acceleration = is that speed INCREASING or DECREASING? Acceleration is the rate of change of momentum. The MACD histogram measures acceleration.' },
  { q: 'When price makes a new high but RSI makes a lower high, this is called:', opts: ['A double top', 'Bullish confirmation', 'Bearish divergence', 'RSI failure'], correct: 2, explain: 'Bearish divergence: price higher high + RSI lower high = less momentum energy behind the new peak. The trend&apos;s fuel is draining. Warning sign, not reversal confirmation.' },
  { q: 'The MACD histogram measures:', opts: ['Price direction', 'The gap between two moving averages', 'The RATE OF CHANGE of the gap between two EMAs (momentum acceleration)', 'Volume'], correct: 2, explain: 'The histogram = MACD Line &minus; Signal Line. Since MACD is already the gap between fast and slow EMAs, the histogram measures whether that gap is GROWING (accelerating) or SHRINKING (decelerating). It is a second derivative &mdash; acceleration of momentum.' },
  { q: 'A stock is rising but momentum is decelerating. This means:', opts: ['Price will definitely reverse in the next candle', 'The rate of price increase is slowing, which MAY precede a reversal but could also precede a continuation after consolidation', 'The stock is overvalued', 'Momentum indicators are broken'], correct: 1, explain: 'Deceleration means the engine is losing power. The car is still moving forward but slowing. This COULD lead to a stop and reversal, OR it could lead to a pause and then re-acceleration. Deceleration is information, not a trade signal.' },
  { q: 'Why is &ldquo;momentum fades before price reverses&rdquo; the most valuable insight in momentum analysis?', opts: ['Because it lets you predict exact reversal points', 'Because fading momentum provides an early WARNING that the trend may be losing energy, giving you time to prepare (tighten stops, reduce size, look for structural confirmation)', 'Because momentum always reverses before price', 'Because you should sell every time momentum fades'], correct: 1, explain: 'Fading momentum is an early warning system. It doesn&apos;t guarantee reversal &mdash; but it tells you to be ALERT. Professional response: tighten stops, reduce new entries, watch for structural breaks. It buys you preparation time.' },
  { q: 'RSI drops from 72 to 48 during a pullback in a strong uptrend. The trend structure is intact. This RSI reading suggests:', opts: ['The uptrend has ended and you should sell', 'A healthy momentum reset &mdash; RSI cooling off creates the next potential entry opportunity if structure and volume confirm', 'RSI is broken because it went below 50 in an uptrend', 'You should switch to a downtrend strategy immediately'], correct: 1, explain: 'RSI cycling between overbought (impulse) and neutral/oversold (pullback) within an intact trend is normal and healthy. RSI at 48 during a pullback is a momentum &ldquo;reset&rdquo; &mdash; the next impulse can push it back above 60-70 if the trend continues.' },
  { q: 'Which statement about momentum and trend is correct?', opts: ['Momentum and trend always agree', 'You can have a bullish trend with fading momentum (tired trend) or a bearish trend with increasing momentum (accelerating selloff)', 'Momentum determines trend direction', 'Trend is always more important than momentum'], correct: 1, explain: 'Trend (direction) and momentum (energy) are independent dimensions. A tired uptrend (bullish direction, fading momentum) behaves very differently from a fresh uptrend (bullish direction, strong momentum). Measuring both gives you a richer picture.' },
];

// ============================================================
// CONFETTI
// ============================================================
function Confetti({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const c = canvasRef.current;
    c.width = window.innerWidth; c.height = window.innerHeight;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const pieces = Array.from({ length: 140 }, () => ({
      x: Math.random() * c.width, y: Math.random() * -c.height, w: Math.random() * 8 + 4, h: Math.random() * 6 + 2,
      color: ['#f59e0b', '#d946ef', '#22c55e', '#ef4444', '#ffffff'][Math.floor(Math.random() * 5)],
      vx: (Math.random() - 0.5) * 3, vy: Math.random() * 4 + 2, rot: Math.random() * 360, rv: (Math.random() - 0.5) * 8, a: 1,
    }));
    let frames = 0;
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      pieces.forEach(p => {
        p.y += p.vy; p.x += p.vx; p.rot += p.rv; if (frames > 120) p.a -= 0.01;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot * Math.PI / 180); ctx.globalAlpha = Math.max(0, p.a);
        ctx.fillStyle = p.color; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
      });
      frames++;
      if (frames < 250) requestAnimationFrame(draw);
    };
    draw();
  }, [active]);
  if (!active) return null;
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[9998]" />;
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function MomentumHiddenForceLesson() {
  const [openConcept, setOpenConcept] = useState<number | null>(null);
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
  // Momentum simulator
  const [simPrice, setSimPrice] = useState(50);
  const [simMomentum, setSimMomentum] = useState(60);

  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  const handleGameAnswer = (oi: number) => {
    if (gameAnswers[gameRound] !== null) return;
    const u = [...gameAnswers]; u[gameRound] = oi; setGameAnswers(u);
    if (gameRounds[gameRound].options[oi].correct) setGameScore(s => s + 1);
  };

  const handleQuizAnswer = (qi: number, oi: number) => {
    if (quizAnswers[qi] !== null) return;
    const u = [...quizAnswers]; u[qi] = oi; setQuizAnswers(u);
    if (u.every(a => a !== null)) {
      const c = u.filter((a, i) => a === quizQuestions[i].correct).length;
      const pct = Math.round((c / quizQuestions.length) * 100);
      setQuizScore(pct); setQuizDone(true);
      if (pct >= 66) setTimeout(() => { setCertUnlocked(true); setShowConfetti(true); setTimeout(() => setShowConfetti(false), 5000); }, 800);
    }
  };

  // Momentum simulator diagnosis
  const getSimDiagnosis = () => {
    const trend = simPrice > 60 ? 'bullish' : simPrice < 40 ? 'bearish' : 'neutral';
    const mom = simMomentum > 65 ? 'strong' : simMomentum < 35 ? 'weak' : 'moderate';
    if (trend === 'bullish' && mom === 'strong') return { text: 'Healthy bullish trend with strong momentum. Ideal conditions for trend-following entries on pullbacks.', color: 'text-green-400', label: 'STRONG TREND' };
    if (trend === 'bullish' && mom === 'weak') return { text: 'DIVERGENCE WARNING — Price is bullish but momentum is fading. The trend is tired. Tighten stops, reduce new longs, watch for structural breaks.', color: 'text-red-400', label: 'TIRED TREND ⚠️' };
    if (trend === 'bullish' && mom === 'moderate') return { text: 'Bullish trend with moderate momentum. Healthy but not explosive. Watch for acceleration or deceleration to determine next move.', color: 'text-amber-400', label: 'STEADY TREND' };
    if (trend === 'bearish' && mom === 'strong') return { text: 'Wait — strong momentum in a bearish trend? This would mean RSI is high while price is falling. Something unusual is happening — possible divergence forming.', color: 'text-purple-400', label: 'BULLISH DIVERGENCE?' };
    if (trend === 'bearish' && mom === 'weak') return { text: 'Strong bearish conditions. Trend is down and momentum confirms. Do not fight this. Look for shorts on pullbacks or stay out entirely.', color: 'text-red-400', label: 'STRONG DOWNTREND' };
    if (trend === 'bearish' && mom === 'moderate') return { text: 'Bearish but momentum is neutral. The selloff may be pausing. Watch for momentum to accelerate (continuation) or reverse (bottom forming).', color: 'text-amber-400', label: 'SLOWING SELLOFF' };
    if (trend === 'neutral' && mom === 'strong') return { text: 'Price is range-bound but momentum is building. A breakout may be developing. Set alerts on range boundaries and wait for direction.', color: 'text-sky-400', label: 'BREAKOUT BREWING' };
    if (trend === 'neutral' && mom === 'weak') return { text: 'Dead market. No trend, no momentum. This is a no-trade zone. Absolutely no reason to be in this market right now.', color: 'text-gray-400', label: 'NO TRADE ZONE' };
    return { text: 'Mixed conditions. Monitor for clearer alignment before committing capital.', color: 'text-gray-400', label: 'MIXED' };
  };

  const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } };

  const mistakes = [
    { wrong: 'Confusing momentum with trend direction', right: 'Trend = which direction (up/down). Momentum = how fast and with what force. You need BOTH dimensions. A bullish trend with fading momentum is a very different animal from a bullish trend with rising momentum.', icon: '🧭' },
    { wrong: 'Treating RSI &ldquo;overbought&rdquo; as meaning &ldquo;overvalued&rdquo;', right: 'RSI measures speed of recent gains vs losses. It says nothing about VALUE. An &ldquo;overbought&rdquo; stock can stay overbought for months if the fundamental story is strong. Overbought = strong momentum, not wrong price.', icon: '💰' },
    { wrong: 'Expecting immediate reversal when divergence appears', right: 'Divergence is a WARNING, not a TIMER. Momentum can fade for weeks before price actually reverses. Use divergence to PREPARE (tighten stops, reduce size), not to ENTER reversal trades immediately.', icon: '⏰' },
    { wrong: 'Ignoring momentum entirely and trading on price alone', right: 'Price shows you WHAT happened. Momentum shows you the ENERGY behind it. A new high on strong momentum is continuation. A new high on weak momentum is exhaustion. Same price event, totally different implications.', icon: '🔋' },
  ];

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      <Confetti active={showConfetti} />

      {/* === PROGRESS BAR === */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-900/50">
        <motion.div className="h-full bg-gradient-to-r from-amber-500 to-accent-500" style={{ width: `${Math.min((scrollY / (typeof document !== 'undefined' ? document.body.scrollHeight - window.innerHeight : 1)) * 100, 100)}%` }} />
      </div>

      {/* === NAV === */}
      <nav className="fixed top-1 left-0 right-0 z-40 flex items-center justify-between px-5 py-2.5">
        <Link href="/academy" className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-amber-400 to-accent-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>ATLAS ACADEMY</Link>
        <div className="flex items-center gap-2"><Crown className="w-3.5 h-3.5 text-amber-400" /><span className="text-xs font-bold text-amber-400">PRO &middot; LEVEL 5</span></div>
      </nav>

      {/* === HERO === */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6 pt-20">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(245,158,11,0.08),transparent_70%)] pointer-events-none" />
        <div className="absolute top-[-50px] right-[20%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(217,70,239,0.05),transparent_70%)] pointer-events-none" />
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.15 } } }} className="relative z-10">
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 5 &middot; Lesson 5</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,56px)] font-black leading-[1.1] tracking-tight mb-5">
            Momentum<br />
            <span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>The Hidden Force</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">
            Price tells you WHERE the market went. Momentum tells you HOW it got there &mdash; and whether it has the energy to keep going.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5">
            <span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span>
            <div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" />
          </motion.div>
        </motion.div>
      </section>

      {/* === S00: First — Why This Matters === */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">The Force You Can&apos;t See &mdash; But Must Measure</p>
            <p className="text-gray-400 leading-relaxed mb-4">Imagine watching a ball thrown into the air. You can SEE it rising. But can you tell, just by looking, whether it&apos;s about to keep rising or about to peak? Not easily. But if you could measure its <strong className="text-amber-400">speed</strong>, you&apos;d know. A ball still travelling at 50 km/h has plenty of energy left. A ball travelling at 2 km/h is about to stop.</p>
            <p className="text-gray-400 leading-relaxed mb-4">Price is the ball. Momentum is the speed. When you only watch price, you see the ball rising. When you <em>measure</em> momentum, you know whether it has energy to continue &mdash; or whether it&apos;s about to peak.</p>
            <p className="text-gray-400 leading-relaxed"><strong className="text-white">Momentum is the single most important hidden dimension in trading.</strong> It is the engine behind every price move. And unlike price, which only shows what happened, momentum gives you insight into the QUALITY and SUSTAINABILITY of the move.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">A hedge fund study examined <strong className="text-white">10 years of S&amp;P 500 data</strong> and found that <strong className="text-green-400">83% of major reversals</strong> were preceded by momentum divergence (price making new highs while RSI/MACD made lower highs). The divergence appeared an average of <strong className="text-white">5&ndash;15 candles before the reversal</strong>. Traders who measured momentum had a warning. Traders who only watched price were blindsided.</p>
          </div>
        </motion.div>
      </section>

      {/* === S01: The Train === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Train Analogy</p>
          <h2 className="text-2xl font-extrabold mb-4">Watch Momentum in Action</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The train moves along the track (price). The speed gauge shows momentum. The acceleration arrow shows whether momentum is building or fading. Watch the key moment: <strong className="text-amber-400">the train slows down before it stops.</strong></p>
          <TrainMomentumAnimation />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Key Insight</p>
            <p className="text-sm text-gray-400">Momentum (speed) reaches zero BEFORE the train reverses direction. In markets: RSI/MACD start fading BEFORE price makes its final high. This is the early warning system that most retail traders don&apos;t use.</p>
          </div>
        </motion.div>
      </section>

      {/* === S02: Wave Energy === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Wave Analogy</p>
          <h2 className="text-2xl font-extrabold mb-4">Price Is the Wave. Momentum Is the Energy.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Ocean waves are powered by wind energy. When the wind is strong, waves are big. When it fades, the next wave is smaller. In markets, momentum is the wind. When it fades, the next price move will be weaker.</p>
          <WaveEnergyAnimation />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/15">
              <p className="text-xs font-extrabold text-green-400 mb-1">Building Energy</p>
              <p className="text-[11px] text-gray-400">Momentum bars growing = each price wave will be bigger than the last. The trend is accelerating. Favour trend-following entries.</p>
            </div>
            <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-xs font-extrabold text-red-400 mb-1">Fading Energy</p>
              <p className="text-[11px] text-gray-400">Momentum bars shrinking = each price wave will be smaller. The trend is exhausting. Tighten stops, reduce exposure, prepare for a possible shift.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S03: Five Core Concepts === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; Core Concepts</p>
          <h2 className="text-2xl font-extrabold mb-2">Five Things You Must Know About Momentum</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Each concept builds on the one before it. Together they form a complete understanding of the force that drives every price move.</p>
          <div className="space-y-3">
            {concepts.map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <button onClick={() => setOpenConcept(openConcept === i ? null : i)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <p className={`text-sm font-extrabold ${c.color}`}>{c.title}</p>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openConcept === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openConcept === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="p-4 mt-1 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-3">
                        <p className="text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: c.detail }} />
                        <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                          <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Analogy</p>
                          <p className="text-sm text-gray-400">{c.analogy}</p>
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

      {/* === S04: Interactive Momentum Simulator === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Try It Yourself</p>
          <h2 className="text-2xl font-extrabold mb-2">Trend + Momentum Simulator</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Set the trend direction and momentum level independently. Watch how the combination changes the diagnosis. This is exactly how professionals read markets &mdash; two dimensions, not one.</p>
          <div className="p-6 rounded-2xl glass-card space-y-5">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs font-bold text-sky-400">Price Trend (MA direction)</span>
                <span className="text-xs font-mono text-sky-400">{simPrice < 40 ? 'Bearish' : simPrice > 60 ? 'Bullish' : 'Neutral'}</span>
              </div>
              <input type="range" min={0} max={100} value={simPrice} onChange={e => setSimPrice(Number(e.target.value))} className="w-full h-1.5 rounded-full appearance-none cursor-pointer" style={{ accentColor: '#0ea5e9', background: `linear-gradient(to right, #ef4444 0%, #f59e0b 40%, #f59e0b 60%, #22c55e 100%)` }} />
              <div className="flex justify-between text-[9px] text-gray-600 mt-0.5"><span>Strong Downtrend</span><span>Neutral</span><span>Strong Uptrend</span></div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs font-bold text-amber-400">Momentum (RSI level)</span>
                <span className="text-xs font-mono text-amber-400">{simMomentum < 35 ? 'Weak' : simMomentum > 65 ? 'Strong' : 'Moderate'}</span>
              </div>
              <input type="range" min={0} max={100} value={simMomentum} onChange={e => setSimMomentum(Number(e.target.value))} className="w-full h-1.5 rounded-full appearance-none cursor-pointer" style={{ accentColor: '#f59e0b', background: `linear-gradient(to right, #ef4444 0%, #f59e0b 35%, #f59e0b 65%, #22c55e 100%)` }} />
              <div className="flex justify-between text-[9px] text-gray-600 mt-0.5"><span>Weak Momentum</span><span>Moderate</span><span>Strong Momentum</span></div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-amber-400">&#128202; DIAGNOSIS</p>
                <span className={`text-xs font-mono font-bold ${getSimDiagnosis().color}`}>{getSimDiagnosis().label}</span>
              </div>
              <p className={`text-sm ${getSimDiagnosis().color}`}>{getSimDiagnosis().text}</p>
            </div>
          </div>
          <div className="mt-4 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Try These Combinations</p>
            <p className="text-sm text-gray-400">Bullish trend + Weak momentum = Tired trend (divergence warning). Bearish trend + Strong momentum = Possible bullish divergence. Neutral trend + Strong momentum = Breakout brewing. Each combination tells a different story.</p>
          </div>
        </motion.div>
      </section>

      {/* === S05: Divergence Deep Dive === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Divergence</p>
          <h2 className="text-2xl font-extrabold mb-2">The Most Powerful Momentum Signal</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Divergence occurs when price and momentum tell different stories. It is the single most useful signal that momentum analysis provides &mdash; and the one most misunderstood.</p>
          <div className="space-y-3">
            <div className="p-4 rounded-xl glass-card">
              <p className="text-sm font-extrabold text-red-400 mb-2">Bearish Divergence (Warning for Longs)</p>
              <p className="text-sm text-gray-400 mb-2">Price: Higher High &uarr; &nbsp;&nbsp; RSI: Lower High &darr;</p>
              <p className="text-sm text-gray-400">Meaning: price reached a new peak but the ENERGY behind it was weaker than the previous peak. The trend is running on fumes. Does NOT mean &ldquo;sell now&rdquo; &mdash; means &ldquo;be cautious, tighten stops, look for structure confirmation.&rdquo;</p>
            </div>
            <div className="p-4 rounded-xl glass-card">
              <p className="text-sm font-extrabold text-green-400 mb-2">Bullish Divergence (Warning for Shorts)</p>
              <p className="text-sm text-gray-400 mb-2">Price: Lower Low &darr; &nbsp;&nbsp; RSI: Higher Low &uarr;</p>
              <p className="text-sm text-gray-400">Meaning: price made a new low but selling pressure was weaker than the previous low. Bears are exhausted. Does NOT mean &ldquo;buy now&rdquo; &mdash; means &ldquo;watch for a structural break to the upside (BOS).&rdquo;</p>
            </div>
            <div className="p-4 rounded-xl glass-card">
              <p className="text-sm font-extrabold text-amber-400 mb-2">Hidden Divergence (Trend Continuation)</p>
              <p className="text-sm text-gray-400 mb-2">Bullish: Price Higher Low &uarr; &nbsp;&nbsp; RSI: Lower Low &darr;</p>
              <p className="text-sm text-gray-400">Meaning: the pullback was deeper in momentum than in price. Fresh energy entered at a higher price level. The trend has RELOADED. This is a continuation signal, not a reversal warning.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S06: Momentum in Practice === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Practical Application</p>
          <h2 className="text-2xl font-extrabold mb-2">Three Ways to Use Momentum Right Now</h2>
          <p className="text-gray-400 leading-relaxed mb-6">You don&apos;t need to master everything at once. Start with these three actionable applications:</p>
          <div className="space-y-3">
            <div className="p-4 rounded-xl glass-card">
              <p className="text-sm font-extrabold text-green-400 mb-2">1. Trend Health Check</p>
              <p className="text-sm text-gray-400">Before entering any trend trade, check: is momentum SUPPORTING the trend? RSI above 50 in an uptrend = healthy. RSI below 50 in an uptrend = warning. Takes 3 seconds. Eliminates tired-trend entries.</p>
            </div>
            <div className="p-4 rounded-xl glass-card">
              <p className="text-sm font-extrabold text-amber-400 mb-2">2. Divergence Watch</p>
              <p className="text-sm text-gray-400">When price makes a new swing high/low, check if RSI confirms. If not (divergence), add it to your awareness. Don&apos;t trade on it alone, but use it to adjust risk: tighter stops, smaller size, fewer new entries in that direction.</p>
            </div>
            <div className="p-4 rounded-xl glass-card">
              <p className="text-sm font-extrabold text-sky-400 mb-2">3. Pullback Quality Assessment</p>
              <p className="text-sm text-gray-400">During a pullback, check momentum. RSI dropping to 40&ndash;50 in a bullish trend = healthy reset. RSI crashing to 20 = something bigger is happening. The depth of the momentum pullback tells you about the quality of the next opportunity.</p>
            </div>
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
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{m.icon}</span>
                    <p className="text-sm font-extrabold text-red-400" dangerouslySetInnerHTML={{ __html: m.wrong }} />
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openMistake === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openMistake === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="p-4 mt-1 rounded-xl bg-green-500/5 border border-green-500/10">
                        <p className="text-xs font-bold text-green-400 mb-1">&#9989; Do This Instead</p>
                        <p className="text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: m.right }} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* === S08: Momentum Cheat Sheet === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Cheat Sheet</p>
          <h2 className="text-2xl font-extrabold mb-4">Momentum Quick Reference</h2>
          <div className="p-6 rounded-2xl glass-card space-y-3">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <p className="text-sm"><strong className="text-green-400">Rising momentum + Rising price</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Healthy trend. Hold positions. Add on pullbacks.</span></p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <p className="text-sm"><strong className="text-red-400">Fading momentum + Rising price</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Divergence warning. Tighten stops. Reduce new longs.</span></p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <p className="text-sm"><strong className="text-amber-400">Momentum reset to neutral during pullback</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Healthy correction. Potential re-entry zone.</span></p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <p className="text-sm"><strong className="text-purple-400">Momentum divergence at key structure</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">High-probability reversal zone. Add session + volume for A+ setup.</span></p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <p className="text-sm"><strong className="text-gray-400">No momentum, no trend</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">No trade. Walk away. Capital preservation is a position.</span></p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S09: Game === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Test Your Understanding</p>
          <h2 className="text-2xl font-extrabold mb-2">Momentum Intelligence Game</h2>
          <p className="text-gray-400 text-sm mb-6">5 scenarios. Can you read the hidden force behind the price?</p>
          <div className="p-6 rounded-2xl glass-card">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-amber-400">Round {gameRound + 1} of {gameRounds.length}</span>
              <span className="text-xs font-mono text-gray-500">{gameScore}/{gameRounds.length} correct</span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: gameRounds[gameRound].scenario }} />
            <div className="space-y-2">
              {gameRounds[gameRound].options.map((opt, oi) => {
                const answered = gameAnswers[gameRound] !== null;
                const selected = gameAnswers[gameRound] === oi;
                const isCorrect = opt.correct;
                let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]';
                if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30';
                if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30';
                if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20';
                return (
                  <div key={oi}>
                    <button onClick={() => handleGameAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt.text }} /></button>
                    {answered && selected && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]">
                        <p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`} dangerouslySetInnerHTML={{ __html: `${isCorrect ? '✓' : '✗'} ${opt.explain}` }} />
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
            {gameAnswers[gameRound] !== null && gameRound < gameRounds.length - 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5">
                <button onClick={() => setGameRound(r => r + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button>
              </motion.div>
            )}
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                <p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p>
                <p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'You can see the hidden force. Momentum has no secrets from you.' : gameScore >= 3 ? 'Good grasp — momentum concepts take practice to internalise fully.' : 'Review the five core concepts and the divergence section, then try again.'}</p>
              </motion.div>
            )}
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
                  {q.opts.map((opt, oi) => {
                    const answered = quizAnswers[qi] !== null;
                    const selected = quizAnswers[qi] === oi;
                    const isCorrect = oi === q.correct;
                    let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]';
                    if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30';
                    if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30';
                    if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20';
                    return <button key={oi} onClick={() => handleQuizAnswer(qi, oi)} disabled={answered} className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`} dangerouslySetInnerHTML={{ __html: opt }} />;
                  })}
                </div>
                {quizAnswers[qi] !== null && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg bg-white/[0.02]">
                    <p className="text-xs text-amber-400" dangerouslySetInnerHTML={{ __html: `<span class="font-bold">&#9989;</span> ${q.explain}` }} />
                  </motion.div>
                )}
              </div>
            ))}
          </div>

          {quizDone && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center">
              <p className="text-3xl font-extrabold mb-2">{quizScore}%</p>
              <p className="text-sm text-gray-400">{quizScore >= 66 ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate. Review and try again.'}</p>
            </motion.div>
          )}

          {certUnlocked && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10">
              <div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(139,92,246,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
                <div className="relative z-10 text-center">
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-red-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">⚡</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">
                    Has successfully completed<br />
                    <strong className="text-white">Level 5: Momentum &mdash; The Hidden Force</strong><br />
                    at ATLAS Academy by Interakktive
                  </p>
                  <p className="bg-gradient-to-r from-amber-400 via-red-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Force Reader &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L5.5-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* === Back to Academy === */}
      <section className="max-w-2xl mx-auto px-5 py-20 text-center">
        <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">
          &larr; Back to Academy
        </Link>
      </section>
    </div>
  );
}
