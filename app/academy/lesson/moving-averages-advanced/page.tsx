// app/academy/lesson/moving-averages-advanced/page.tsx
// ATLAS Academy — Lesson 5.10: Moving Averages — Advanced [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 5
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
// ANIMATION 1: EMA vs SMA Responsiveness
// Same price data, two moving averages. EMA hugs price tighter,
// SMA is smoother but lags more. Shows the trade-off in real time.
// ============================================================
function EMAvsSMAAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.02;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('EMA vs SMA — Same Period, Different Behaviour', w / 2, 14);

    const pts = 80;
    const pad = 25;
    const dx = (w - pad * 2) / pts;

    // Generate price data with a trend change
    const prices: number[] = [];
    const mid = h * 0.5;
    for (let i = 0; i < pts; i++) {
      const trendPhase = i < pts * 0.4 ? -0.8 : i < pts * 0.55 ? 0 : 1.0;
      prices.push(mid + trendPhase * (i - pts * 0.4) * 1.2 + Math.sin(i * 0.4 + t) * 12 + Math.sin(i * 1.1) * 6);
    }

    // Calculate SMA-20
    const sma: number[] = [];
    const period = 20;
    for (let i = 0; i < pts; i++) {
      if (i < period - 1) { sma.push(prices[i]); continue; }
      let sum = 0;
      for (let j = 0; j < period; j++) sum += prices[i - j];
      sma.push(sum / period);
    }

    // Calculate EMA-20
    const ema: number[] = [];
    const mult = 2 / (period + 1);
    for (let i = 0; i < pts; i++) {
      if (i === 0) { ema.push(prices[0]); continue; }
      ema.push(prices[i] * mult + ema[i - 1] * (1 - mult));
    }

    // Draw price as thin dots
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    prices.forEach((y, i) => {
      ctx.beginPath();
      ctx.arc(pad + i * dx, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw SMA
    ctx.strokeStyle = 'rgba(96,165,250,0.8)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    sma.forEach((y, i) => {
      const x = pad + i * dx;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw EMA
    ctx.strokeStyle = 'rgba(245,158,11,0.8)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ema.forEach((y, i) => {
      const x = pad + i * dx;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Trend change marker
    const changeX = pad + pts * 0.4 * dx;
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(changeX, 25); ctx.lineTo(changeX, h - 10); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Trend Change', changeX, 28);

    // Legend
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(245,158,11,0.8)';
    ctx.fillText('— EMA-20 (reacts faster)', pad, h - 8);
    ctx.fillStyle = 'rgba(96,165,250,0.8)';
    ctx.fillText('— SMA-20 (smoother, lags more)', w * 0.5, h - 8);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 2: MA Ribbon (Multiple MAs showing trend strength)
// 8 MAs from fast to slow, spread = strength, compression = weakness
// ============================================================
function MARibbonAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('MA Ribbon — Spread = Trend Strength', w / 2, 14);

    const pts = 90;
    const pad = 20;
    const dx = (w - pad * 2) / pts;
    const mid = h * 0.5;

    // Generate price with phases: trending → compressing → trending opposite
    const prices: number[] = [];
    for (let i = 0; i < pts; i++) {
      let trend = 0;
      if (i < 30) trend = -i * 0.7;
      else if (i < 50) trend = -30 * 0.7 + (i - 30) * 0.2;
      else trend = -30 * 0.7 + 20 * 0.2 + (i - 50) * 0.9;
      prices.push(mid + trend + Math.sin(i * 0.3 + t) * 8 + Math.sin(i * 0.8) * 4);
    }

    // Calculate 8 EMAs
    const periods = [8, 13, 21, 34, 55, 89, 120, 150];
    const colours = [
      'rgba(38,166,154,0.9)', 'rgba(38,166,154,0.7)', 'rgba(38,166,154,0.5)', 'rgba(38,166,154,0.35)',
      'rgba(239,83,80,0.35)', 'rgba(239,83,80,0.5)', 'rgba(239,83,80,0.7)', 'rgba(239,83,80,0.9)'
    ];
    const emas: number[][] = [];
    periods.forEach(p => {
      const ema: number[] = [];
      const mult = 2 / (p + 1);
      for (let i = 0; i < pts; i++) {
        if (i === 0) { ema.push(prices[0]); continue; }
        ema.push(prices[i] * mult + ema[i - 1] * (1 - mult));
      }
      emas.push(ema);
    });

    // Draw ribbon (fill between fastest and slowest)
    const fastEma = emas[0];
    const slowEma = emas[emas.length - 1];
    for (let i = 1; i < pts; i++) {
      const x0 = pad + (i - 1) * dx;
      const x1 = pad + i * dx;
      const bullish = fastEma[i] < slowEma[i]; // lower y = higher price
      ctx.fillStyle = bullish ? 'rgba(38,166,154,0.06)' : 'rgba(239,83,80,0.06)';
      ctx.beginPath();
      ctx.moveTo(x0, fastEma[i - 1]);
      ctx.lineTo(x1, fastEma[i]);
      ctx.lineTo(x1, slowEma[i]);
      ctx.lineTo(x0, slowEma[i - 1]);
      ctx.closePath();
      ctx.fill();
    }

    // Draw each EMA line
    emas.forEach((ema, ei) => {
      ctx.strokeStyle = colours[ei];
      ctx.lineWidth = ei === 0 || ei === emas.length - 1 ? 2 : 1;
      ctx.beginPath();
      ema.forEach((y, i) => {
        const x = pad + i * dx;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();
    });

    // Labels for phases
    ctx.font = '9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(38,166,154,0.6)';
    ctx.fillText('SPREAD = Strong Trend', pad + 15 * dx, 28);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillText('COMPRESS = Weak/Transition', pad + 42 * dx, 28);
    ctx.fillStyle = 'rgba(239,83,80,0.6)';
    ctx.fillText('SPREAD = New Trend', pad + 72 * dx, 28);

    // Legend
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(38,166,154,0.8)';
    ctx.fillText('Fast (8 EMA)', pad, h - 6);
    ctx.fillStyle = 'rgba(239,83,80,0.8)';
    ctx.fillText('Slow (150 EMA)', w - 90, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// DATA
// ============================================================
const maTypes = [
  { name: 'Simple Moving Average (SMA)', emoji: '📏', calc: 'Sum of N closing prices &divide; N', plain: 'The purest average. Add up the last 20 closes, divide by 20. Every candle in the window counts equally &mdash; the close from 20 bars ago has the same weight as yesterday&apos;s close.', pros: 'Smooth and stable. Less prone to whipsaws. Better for identifying the &ldquo;true&rdquo; average price. The 200 SMA is the most widely watched MA on the planet.', cons: 'Slow to react. When price reverses sharply, SMA takes many bars to catch up. Older data has equal influence, which can mask recent shifts.', bestFor: 'Long-term trend identification (50, 100, 200 SMA). Institutional regime analysis. Dynamic support/resistance on higher timeframes.' },
  { name: 'Exponential Moving Average (EMA)', emoji: '⚡', calc: 'Close &times; multiplier + Previous EMA &times; (1 &minus; multiplier), where multiplier = 2 &divide; (N + 1)', plain: 'A weighted average that gives MORE importance to recent prices. Yesterday&apos;s close influences the EMA far more than 20 bars ago. It&apos;s like asking &ldquo;what&apos;s the average, but care more about what happened lately.&rdquo;', pros: 'Faster reaction to price changes. Catches trend changes earlier. Better for short-term trading and dynamic entries.', cons: 'More reactive means more noise. In choppy markets, EMA gives more false signals than SMA. Can lead to over-trading.', bestFor: 'Short-to-medium term trend following (9, 21, 50 EMA). Pullback entries. Dynamic S/R on intraday charts.' },
  { name: 'Weighted Moving Average (WMA)', emoji: '⚖️', calc: 'Each price multiplied by its position weight (most recent = highest)', plain: 'A linear weighting scheme &mdash; the most recent bar gets weight N, the second most recent gets N&minus;1, and so on. It falls between SMA and EMA in responsiveness.', pros: 'More responsive than SMA, smoother than EMA. Linear weighting is more intuitive than EMA&apos;s exponential decay.', cons: 'Rarely used by institutions. Less community support and fewer strategies built around it. You&apos;ll see EMA and SMA on 99% of professional charts.', bestFor: 'Niche strategies. If you find SMA too slow and EMA too noisy, WMA is the compromise. Otherwise, stick with SMA and EMA.' }
];

const crossReality = [
  { name: 'Golden Cross (50 SMA crosses ABOVE 200 SMA)', emoji: '✝️', myth: 'Buy signal &mdash; the bull market is starting.', reality: 'By the time the 50 crosses the 200, the move has already been underway for weeks or months. It&apos;s a LAGGING CONFIRMATION of what already happened. The golden cross confirms a regime change &mdash; it does NOT predict one.', data: 'S&amp;P 500 study (1950&ndash;2023): Golden crosses led to positive 12-month returns 73% of the time, but the average gain in the 3 months BEFORE the cross was already +14%. You&apos;re entering after the move, not before it.', proUse: 'Use as a FILTER, not a TRIGGER. After a golden cross, only take long setups. It confirms the environment is bullish. Combine with pullback entries for actual timing.' },
  { name: 'Death Cross (50 SMA crosses BELOW 200 SMA)', emoji: '💀', myth: 'Sell everything &mdash; the market is crashing.', reality: 'Same lag problem. By the time the death cross forms, the decline has been happening for months. Many death crosses occur near the BOTTOM of a decline, not the beginning.', data: 'S&amp;P 500 study: 8 of the last 15 death crosses since 1970 were followed by the market being HIGHER 6 months later. The death cross has a shockingly bad track record as a sell signal.', proUse: 'Use as a risk management filter. After a death cross, reduce position size and be more selective with longs. Avoid new long positions until the 50 is back above the 200. But do NOT blindly sell everything.' }
];

const institutionalLevels = [
  { ma: '200 SMA', why: 'The single most watched moving average in global finance. Fund managers, pension funds, and algorithms all reference the 200 SMA. When price is above it, the market is considered bullish. Below it, bearish. This isn&apos;t because the 200 SMA is magical &mdash; it&apos;s because EVERYONE watches it, making it a self-fulfilling prophecy.', action: 'Major trend filter. If price is above the 200 SMA, look for longs. Below, be cautious with longs or focus on shorts.' },
  { ma: '50 SMA', why: 'The medium-term institutional benchmark. Many systematic funds use the 50/200 relationship as their primary trend indicator. The 50 SMA captures roughly one quarter&apos;s worth of data.', action: 'Secondary trend filter. Above 50 AND 200 = strong bullish. Between (below 50, above 200) = caution. Below both = bearish regime.' },
  { ma: '21 EMA', why: 'The default &ldquo;pullback MA&rdquo; for swing traders. In a healthy trend, price pulls back to the 21 EMA and bounces. When it stops bouncing, the trend is weakening.', action: 'Pullback entry level. In an uptrend, buy dips to the 21 EMA. If price closes below the 21 EMA for 3+ bars, the pullback is becoming a correction.' },
  { ma: '9 EMA', why: 'The short-term momentum gauge. Used primarily on intraday charts by day traders. Shows immediate momentum direction.', action: 'Intraday momentum filter. Price above 9 EMA = short-term bullish momentum. Below = bearish. Not for position or swing trading.' },
  { ma: 'VWAP', why: 'Not technically an MA, but functions as the most important intraday &ldquo;average&rdquo; for institutions. Algorithmic execution desks benchmark against VWAP.', action: 'Intraday fair value. Above VWAP = buyers in control today. Below = sellers. Mean-reversion trades target VWAP as the destination.' }
];

const mistakes = [
  { myth: '🚫 &ldquo;The golden cross means I should buy right now&rdquo;', wrong: 'Golden/death crosses are lagging confirmations, not entry signals. The move has been underway for weeks by the time the cross forms.', right: 'Use crosses as FILTERS that define the regime: bullish (golden) or bearish (death). Then use lower-timeframe signals for actual entries. The cross tells you WHICH DIRECTION to trade, not WHEN.' },
  { myth: '🚫 &ldquo;I use 5 different moving averages and they all say the same thing&rdquo;', wrong: 'Multiple MAs of similar periods (15, 17, 20, 22, 25) are redundant. They move together and tell you nothing new. This is the MA version of oscillator stacking.', right: 'Use MAs from DIFFERENT timeframes: one short (9&ndash;21), one medium (50), one long (200). Each captures a different time horizon. Three MAs from three horizons &gt; five MAs from one.' },
  { myth: '🚫 &ldquo;Price touched the 200 SMA so it must bounce&rdquo;', wrong: 'MAs are not walls. Price can slice through ANY moving average. The 200 SMA is watched, not sacred. In a strong downtrend, the 200 SMA barely slows price down.', right: 'Treat MAs as ZONES of interest, not exact levels. Look for CONFLUENCE: price at 200 SMA + key horizontal S/R + RSI divergence = strong zone. MA alone is never enough.' },
  { myth: '🚫 &ldquo;I optimised my MA periods to 17 and 43 based on backtesting&rdquo;', wrong: 'Over-optimised MA periods are curve-fitted to historical data. The reason 50 and 200 work isn&apos;t because they&apos;re mathematically perfect &mdash; it&apos;s because MILLIONS of traders watch them.', right: 'Stick with standard periods (9, 21, 50, 100, 200). Their power comes from crowd consensus, not mathematical purity. An MA that nobody watches has no self-fulfilling prophecy power.' }
];

const gameRounds = [
  { scenario: 'The S&amp;P 500 just formed a golden cross (50 SMA crossed above 200 SMA). Your colleague says &ldquo;Buy everything, the bull market is here!&rdquo; What is the correct response?', options: [
    { text: 'Your colleague is right &mdash; golden crosses are reliable buy signals with a strong historical track record', correct: false, explain: 'Golden crosses CONFIRM a regime change that already happened. The average gain before the cross was already +14%. It&apos;s a filter, not a trigger. You&apos;d be buying after the move, not at the start.' },
    { text: 'The golden cross confirms bullish regime &mdash; use it as a filter to take ONLY long setups, but find entries using pullbacks to the 21 EMA or structure levels', correct: true, explain: 'Exactly. The golden cross tells you the environment is bullish (filter). Your actual entries come from pullbacks, structure, and momentum signals. The cross sets the direction; other tools set the timing.' }
  ]},
  { scenario: 'You have a 15 EMA, 17 EMA, 20 SMA, and 22 EMA on your chart. They all just turned bullish. How strong is this signal?', options: [
    { text: 'Very strong &mdash; four moving averages all agree, that&apos;s powerful confluence', correct: false, explain: 'Four MAs of nearly identical periods (15&ndash;22) are essentially the same line drawn four times. This is redundancy, not confluence. You have ONE data point presented four ways.' },
    { text: 'Weak &mdash; these are all near the same period, so they&apos;re redundant. Replace with a 9, 50, and 200 for three truly different time horizons', correct: true, explain: 'Correct. True MA confluence requires different TIME HORIZONS: short (9&ndash;21), medium (50), long (200). Each captures a different window of market behaviour. Similar periods just echo each other.' }
  ]},
  { scenario: 'EUR/USD price is in a strong uptrend. It pulls back and touches the 21 EMA for the third time this week. Each previous touch bounced. What is the professional read?', options: [
    { text: 'Buy at the 21 EMA &mdash; it&apos;s proven dynamic support', correct: false, explain: 'Close, but missing context. Three touches means the market KNOWS the 21 EMA is support. When everyone watches the same level, the fourth touch often breaks through as stops cluster below it. The more obvious, the more dangerous.' },
    { text: 'Approach with caution &mdash; after multiple touches, the 21 EMA becomes obvious and is more likely to break. Look for volume confirmation before entering', correct: true, explain: 'Professional thinking. Dynamic support weakens with each touch as more participants cluster stops below it. The third or fourth touch is often the one that breaks. Always require additional confirmation (volume, RSI, structure) on repeated touches.' }
  ]},
  { scenario: 'An MA ribbon (8 EMAs from 8 to 150 periods) on the 4H chart shows all MAs compressed tightly together with minimal spread. What does this mean?', options: [
    { text: 'Compression means energy is coiling &mdash; a significant move is likely coming. Wait for the ribbon to fan out and trade in the direction of expansion', correct: true, explain: 'When a ribbon compresses, it means short-term and long-term averages agree on the same price &mdash; no trend dominance. This energy buildup typically resolves with a strong directional move. Trade the expansion direction.' },
    { text: 'Compression means the market is healthy and balanced &mdash; enter a range-trading strategy', correct: false, explain: 'Compression indicates INDECISION, not balance. While you might see range-bound conditions, the key signal is that a breakout is building. Range-trading during compression risks getting caught when the ribbon expands violently.' }
  ]},
  { scenario: 'Bitcoin is trading below the 200 SMA on the daily chart but above the 50 SMA. A bullish pin bar forms at the 50 SMA. Should you go long?', options: [
    { text: 'Yes &mdash; bullish pin bar at the 50 SMA is a strong long signal regardless of the 200 SMA', correct: false, explain: 'Below the 200 SMA means the broader regime is bearish. A pin bar at the 50 SMA is a counter-trend trade &mdash; not wrong, but higher risk. The 200 SMA overhead acts as resistance. Size down and target conservatively.' },
    { text: 'Proceed with caution &mdash; below the 200 SMA makes this a counter-trend setup. Reduce size, target the 200 SMA as resistance, and require additional confluence', correct: true, explain: 'Professional approach. The 200 SMA overhead changes the risk profile entirely. You can take the trade, but with reduced size, tighter stops, and the 200 SMA as your target, not your starting point. Regime context always comes first.' }
  ]}
];

const quizQuestions = [
  { q: 'What is the key difference between an EMA and an SMA of the same period?', opts: ['EMA uses more data points', 'EMA gives more weight to recent prices, making it more responsive', 'SMA is always above EMA', 'There is no meaningful difference'], correct: 1, explain: 'EMA applies an exponential weighting multiplier that gives more influence to recent prices. Same period, same data, but different emphasis. EMA reacts faster to new price action; SMA is smoother and more stable.' },
  { q: 'A golden cross (50 SMA crossing above 200 SMA) is best described as:', opts: ['A buy signal &mdash; enter immediately', 'A lagging confirmation of a bullish regime change &mdash; use as a directional filter, not an entry trigger', 'A sell signal &mdash; the move is over', 'An unreliable indicator with no practical use'], correct: 1, explain: 'The golden cross CONFIRMS that a bullish regime change has already occurred. By the time it forms, the initial move is done. Its value is as a FILTER: after a golden cross, favour long setups. Find actual entries through pullbacks and structure.' },
  { q: 'Why do the 50 and 200 SMAs &ldquo;work&rdquo; as support and resistance?', opts: ['They are mathematically optimal periods', 'They capture exactly one quarter and one year of data', 'Millions of traders and algorithms watch them, creating a self-fulfilling prophecy', 'They were invented by institutional traders'], correct: 2, explain: 'The 50 and 200 SMAs work because of crowd consensus, not mathematical magic. When millions of participants watch the same levels, their collective buying/selling at those levels creates the very support/resistance they expect. It&apos;s a self-fulfilling prophecy.' },
  { q: 'An MA ribbon compresses (all MAs converge to the same price). This signals:', opts: ['The trend is strong and healthy', 'Energy is coiling &mdash; a significant directional move is likely coming', 'The market is crashing', 'Moving averages have stopped working'], correct: 1, explain: 'Ribbon compression means short-term and long-term averages agree on price &mdash; no trend dominance exists. This energy buildup typically resolves with a strong expansion move. The direction of the expansion is the new trend.' },
  { q: 'Which MA setup provides TRUE confluence (not redundancy)?', opts: ['15 EMA + 17 EMA + 20 SMA', '9 EMA + 50 SMA + 200 SMA', '10 EMA + 11 EMA + 12 EMA + 13 EMA', '200 SMA + 200 EMA'], correct: 1, explain: 'True MA confluence requires different TIME HORIZONS: short (9 EMA), medium (50 SMA), long (200 SMA). Each captures a different window. Similar periods (15/17/20 or 10/11/12/13) are redundant &mdash; they move in lockstep and give you one signal disguised as many.' },
  { q: 'Price touches the 21 EMA for the FOURTH time in a trend. What is the professional concern?', opts: ['Nothing &mdash; the more touches, the stronger the support', 'Each touch weakens the level as stops cluster below it. The fourth touch is more likely to break than the first', 'The 21 EMA only works for three touches', 'Switch to the 50 EMA after three touches'], correct: 1, explain: 'Dynamic support weakens with repeated touches. Each bounce makes the level more obvious, attracting more stops below it. Institutions know this and will often push through on the third or fourth touch to trigger those stops. Require additional confirmation on later touches.' },
  { q: 'In what scenario should you AVOID using a 9 EMA as your primary trend filter?', opts: ['Day trading on the 5-minute chart', 'Swing trading on the daily chart where the 50 or 200 SMA is more appropriate', 'Scalping on the 1-minute chart', 'Trading during London session'], correct: 1, explain: 'The 9 EMA captures only 9 bars of data &mdash; about 2 weeks on a daily chart. For swing trading (holding days to weeks), the 50 or 200 SMA gives a more meaningful trend reading. Match your MA period to your trading timeframe.' },
  { q: 'Price is above the 200 SMA and 50 SMA on the daily chart. What regime are you in?', opts: ['Bearish &mdash; MAs are lagging', 'Bullish &mdash; both institutional benchmarks confirm upward bias. Favour long setups.', 'Neutral &mdash; MAs don&apos;t define regimes', 'It depends on the golden/death cross'], correct: 1, explain: 'Price above both the 50 and 200 SMA is the clearest bullish regime signal available. Both institutional benchmarks agree the trend is up. This doesn&apos;t mean &ldquo;buy now&rdquo; but it means FAVOUR longs and be very selective with shorts.' }
];

export default function MovingAveragesAdvancedPage() {
  const [scrollY, setScrollY] = useState(0);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [expandedMyths, setExpandedMyths] = useState<Record<string, boolean>>({});
  const [gameRound, setGameRound] = useState(0);
  const [gameAnswers, setGameAnswers] = useState<(number | null)[]>(Array(gameRounds.length).fill(null));
  const [gameScore, setGameScore] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(Array(quizQuestions.length).fill(null));
  const [quizDone, setQuizDone] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [certUnlocked, setCertUnlocked] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const pageH = typeof document !== 'undefined' ? document.documentElement.scrollHeight - window.innerHeight : 1;
  const progress = Math.min(scrollY / (pageH || 1), 1);

  const toggleCard = (id: string) => setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleMyth = (id: string) => setExpandedMyths(prev => ({ ...prev, [id]: !prev[id] }));

  const handleGameAnswer = (oi: number) => {
    if (gameAnswers[gameRound] !== null) return;
    const a = [...gameAnswers]; a[gameRound] = oi; setGameAnswers(a);
    if (gameRounds[gameRound].options[oi].correct) setGameScore(s => s + 1);
  };

  const handleQuizAnswer = (qi: number, oi: number) => {
    if (quizAnswers[qi] !== null) return;
    const a = [...quizAnswers]; a[qi] = oi; setQuizAnswers(a);
    const newAnswers = [...a]; newAnswers[qi] = oi;
    if (newAnswers.every(v => v !== null)) {
      const correct = newAnswers.filter((ans, idx) => ans === quizQuestions[idx].correct).length;
      const pct = Math.round((correct / quizQuestions.length) * 100);
      setQuizScore(pct); setQuizDone(true);
      if (pct >= 66) {
        setCertUnlocked(true);
        setTimeout(() => {
          try { const { default: confetti } = require('canvas-confetti'); confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 }, colors: ['#f59e0b', '#a855f7', '#22c55e', '#ef4444', '#ffffff'] }); } catch {}
        }, 400);
      }
    }
  };

  return (
    <div className="min-h-screen text-gray-200" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      {/* Progress bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 z-50 bg-white/5"><motion.div className="h-full bg-gradient-to-r from-amber-500 to-accent-500" style={{ width: `${progress * 100}%` }} /></motion.div>

      {/* Nav */}
      <nav className="fixed top-1 left-0 right-0 z-40 flex items-center justify-between max-w-3xl mx-auto px-5 py-2 rounded-2xl bg-black/40 backdrop-blur-md border border-white/[0.04]">
        <Link href="/academy" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">&larr; Academy</Link>
        <div className="flex items-center gap-2">
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-bold bg-gradient-to-r from-amber-400 to-accent-400 bg-clip-text text-transparent">PRO &middot; LEVEL 5</span>
        </div>
        <span className="text-[10px] font-bold bg-gradient-to-r from-amber-400 to-accent-400 bg-clip-text text-transparent tracking-widest">ATLAS ACADEMY</span>
      </nav>

      {/* Hero */}
      <section className="relative pt-28 pb-16 px-5 text-center overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(245,158,11,0.08), transparent 60%), radial-gradient(ellipse at 80% 60%, rgba(168,85,247,0.05), transparent 50%)' }} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 max-w-2xl mx-auto">
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-3">Level 5 &middot; Lesson 10</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">Moving Averages <span className="bg-gradient-to-r from-amber-400 to-accent-400 bg-clip-text text-transparent">Advanced</span></h1>
          <p className="text-gray-400 max-w-lg mx-auto leading-relaxed">Beyond the golden cross. How professionals actually use MAs &mdash; and why the crowd gets it wrong.</p>
        </motion.div>
      </section>

      {/* S00 — Why This Matters */}
      <section className="max-w-2xl mx-auto px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-2xl font-extrabold mb-4"><span className="text-amber-400">First</span> &mdash; Why This Matters</h2>
          <div className="glass-card p-6 rounded-2xl mb-6">
            <p className="text-sm text-gray-300 leading-relaxed">In Level 2, you learned what moving averages are. Now you&apos;ll learn why most traders use them WRONG. The golden cross isn&apos;t a buy signal. The death cross isn&apos;t a sell signal. And the real power of MAs isn&apos;t in the crossovers &mdash; it&apos;s in something far more subtle.</p>
          </div>
          <div className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">REAL SCENARIO</p>
            <p className="text-sm text-gray-300 leading-relaxed">An analysis of 15 years of S&amp;P 500 golden crosses found: traders who bought at the golden cross earned an average of +8.4% over 12 months. Traders who instead waited for the first pullback to the 21 EMA AFTER the golden cross earned +14.7% with 40% less drawdown. <strong>The cross tells you the direction. Other tools tell you the entry.</strong></p>
          </div>
        </motion.div>
      </section>

      {/* S01 — EMA vs SMA Animation */}
      <section className="max-w-2xl mx-auto px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Two Flavours</p>
          <h2 className="text-2xl font-extrabold mb-2">EMA vs SMA &mdash; The Real Difference</h2>
          <p className="text-gray-400 text-sm mb-5">Same period (20). Same data. Different weighting. Watch how EMA (amber) reacts faster at the trend change while SMA (blue) lags behind.</p>
          <EMAvsSMAAnimation />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
              <p className="text-xs font-bold text-amber-400 mb-1">EMA (Exponential)</p>
              <p className="text-[11px] text-gray-400 leading-relaxed">Weights recent prices more. Reacts faster to changes. Better for entries and short-term momentum. More whipsaws in choppy conditions.</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/15">
              <p className="text-xs font-bold text-blue-400 mb-1">SMA (Simple)</p>
              <p className="text-[11px] text-gray-400 leading-relaxed">Equal weight for all prices. Smoother and more stable. Better for trend identification and regime filtering. Slower to react to reversals.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S02 — MA Ribbon Animation */}
      <section className="max-w-2xl mx-auto px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Ribbon</p>
          <h2 className="text-2xl font-extrabold mb-2">MA Ribbon &mdash; Trend Strength Visualised</h2>
          <p className="text-gray-400 text-sm mb-5">8 EMAs from fast (8) to slow (150). When they spread apart, the trend is strong. When they compress, a transition is brewing.</p>
          <MARibbonAnimation />
          <div className="mt-4 glass-card p-4 rounded-xl">
            <p className="text-xs font-bold text-amber-400 mb-2">How to Read the Ribbon</p>
            <div className="space-y-2">
              <p className="text-[11px] text-gray-300 leading-relaxed"><strong className="text-green-400">Wide Spread (Bullish order):</strong> All fast MAs above slow MAs with large gaps between them. The trend has strong momentum. Trade WITH it, not against it.</p>
              <p className="text-[11px] text-gray-300 leading-relaxed"><strong className="text-amber-400">Compression:</strong> All MAs converge to similar prices. No trend dominance. Energy is coiling. Wait for the expansion &mdash; the direction of the fan-out is the new trade.</p>
              <p className="text-[11px] text-gray-300 leading-relaxed"><strong className="text-red-400">Wide Spread (Bearish order):</strong> All fast MAs below slow MAs. Bearish momentum is strong. Don&apos;t try to catch the bottom until the ribbon starts compressing.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S03 — Three MA Types */}
      <section className="max-w-2xl mx-auto px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The Types</p>
          <h2 className="text-2xl font-extrabold mb-2">Three Moving Average Types Decoded</h2>
          <p className="text-gray-400 text-sm mb-5">SMA, EMA, and WMA &mdash; what each calculates, when each excels, and when each fails.</p>
          <div className="space-y-3">
            {maTypes.map((ma, i) => (
              <div key={i} className="glass-card rounded-xl overflow-hidden">
                <button onClick={() => toggleCard(`ma-${i}`)} className="w-full flex items-center justify-between p-4 text-left">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{ma.emoji}</span>
                    <span className="text-sm font-extrabold text-white">{ma.name}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedCards[`ma-${i}`] ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {expandedCards[`ma-${i}`] && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4 space-y-3">
                        <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                          <p className="text-[10px] font-bold text-amber-400 mb-1">CALCULATION</p>
                          <p className="text-xs text-gray-300 font-mono" dangerouslySetInnerHTML={{ __html: ma.calc }} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-500 mb-1">PLAIN ENGLISH</p>
                          <p className="text-xs text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: ma.plain }} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2 rounded-lg bg-green-500/5">
                            <p className="text-[10px] font-bold text-green-400 mb-1">STRENGTHS</p>
                            <p className="text-[11px] text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: ma.pros }} />
                          </div>
                          <div className="p-2 rounded-lg bg-red-500/5">
                            <p className="text-[10px] font-bold text-red-400 mb-1">WEAKNESSES</p>
                            <p className="text-[11px] text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: ma.cons }} />
                          </div>
                        </div>
                        <div className="p-2 rounded-lg bg-white/[0.02]">
                          <p className="text-[10px] font-bold text-amber-400 mb-1">BEST FOR</p>
                          <p className="text-[11px] text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: ma.bestFor }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S04 — Golden/Death Cross Reality Check */}
      <section className="max-w-2xl mx-auto px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The Reality Check</p>
          <h2 className="text-2xl font-extrabold mb-2">Golden &amp; Death Cross &mdash; Myth vs Reality</h2>
          <p className="text-gray-400 text-sm mb-5">The two most famous MA signals in finance. Both are misunderstood by nearly every retail trader.</p>
          <div className="space-y-3">
            {crossReality.map((cross, i) => (
              <div key={i} className="glass-card rounded-xl overflow-hidden">
                <button onClick={() => toggleCard(`cross-${i}`)} className="w-full flex items-center justify-between p-4 text-left">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{cross.emoji}</span>
                    <span className="text-sm font-extrabold text-white">{cross.name}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedCards[`cross-${i}`] ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {expandedCards[`cross-${i}`] && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4 space-y-3">
                        <div className="p-2 rounded-lg bg-red-500/5">
                          <p className="text-[10px] font-bold text-red-400 mb-1">THE MYTH</p>
                          <p className="text-xs text-gray-300" dangerouslySetInnerHTML={{ __html: cross.myth }} />
                        </div>
                        <div className="p-2 rounded-lg bg-green-500/5">
                          <p className="text-[10px] font-bold text-green-400 mb-1">THE REALITY</p>
                          <p className="text-xs text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: cross.reality }} />
                        </div>
                        <div className="p-2 rounded-lg bg-amber-500/5">
                          <p className="text-[10px] font-bold text-amber-400 mb-1">THE DATA</p>
                          <p className="text-xs text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: cross.data }} />
                        </div>
                        <div className="p-2 rounded-lg bg-white/[0.02]">
                          <p className="text-[10px] font-bold text-amber-400 mb-1">PROFESSIONAL USE</p>
                          <p className="text-xs text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: cross.proUse }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S05 — Institutional MA Levels */}
      <section className="max-w-2xl mx-auto px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; The Institutional Levels</p>
          <h2 className="text-2xl font-extrabold mb-2">The MAs That Actually Matter</h2>
          <p className="text-gray-400 text-sm mb-5">Not all MAs are equal. These five levels are watched by billions of dollars worth of capital.</p>
          <div className="glass-card p-5 rounded-2xl space-y-4">
            {institutionalLevels.map((level, i) => (
              <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0"><span className="text-[10px] font-extrabold text-amber-400">{i + 1}</span></div>
                  <span className="text-sm font-extrabold text-white">{level.ma}</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed mb-2" dangerouslySetInnerHTML={{ __html: level.why }} />
                <p className="text-[11px] text-amber-400/80 leading-relaxed"><strong>Action:</strong> <span dangerouslySetInnerHTML={{ __html: level.action }} /></p>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE SELF-FULFILLING PROPHECY</p>
            <p className="text-xs text-gray-300 leading-relaxed">The 200 SMA doesn&apos;t work because &ldquo;200&rdquo; is mathematically special. It works because EVERYONE watches it. When Goldman Sachs, JPMorgan, and a million retail traders all have the same line on their chart, their collective behaviour at that line creates the reaction. This is why optimised periods (17, 43, 67) don&apos;t work as well &mdash; nobody else is watching them.</p>
          </div>
        </motion.div>
      </section>

      {/* S06 — Dynamic Support/Resistance */}
      <section className="max-w-2xl mx-auto px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Dynamic S/R</p>
          <h2 className="text-2xl font-extrabold mb-2">Moving Averages as Dynamic Support &amp; Resistance</h2>
          <p className="text-gray-400 text-sm mb-5">Unlike horizontal S/R (Level 2), MAs move with price. Here&apos;s how professionals use them as entry zones.</p>
          <div className="glass-card p-5 rounded-2xl space-y-4">
            <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/15">
              <p className="text-xs font-extrabold text-green-400 mb-1">Uptrend: MAs as Dynamic Support</p>
              <p className="text-[11px] text-gray-300 leading-relaxed">In a healthy uptrend, price pulls back to key MAs and bounces. The 21 EMA is the first &ldquo;floor.&rdquo; If it breaks, the 50 SMA is the next. If that breaks, the 200 SMA is the last line of defense. Each MA gives you a re-entry opportunity with defined risk.</p>
            </div>
            <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-xs font-extrabold text-red-400 mb-1">Downtrend: MAs as Dynamic Resistance</p>
              <p className="text-[11px] text-gray-300 leading-relaxed">In a downtrend, rallies hit MAs and fail. Price bounces UP to the 21 EMA and gets rejected. The 50 SMA becomes a ceiling. The 200 SMA is the ultimate resistance. Shorts can use MA rejections as entry points.</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
              <p className="text-xs font-extrabold text-amber-400 mb-1">The Weakening Rule</p>
              <p className="text-[11px] text-gray-300 leading-relaxed">Dynamic support gets WEAKER with each touch. The first bounce off the 21 EMA is strongest. The second is weaker. By the third or fourth, stops have clustered below it and the break becomes more likely. Always require additional confluence (volume, RSI, structure) on repeated touches.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S07 — Common Mistakes */}
      <section className="max-w-2xl mx-auto px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Mistakes to Avoid</p>
          <h2 className="text-2xl font-extrabold mb-2">Common Moving Average Mistakes</h2>
          <p className="text-gray-400 text-sm mb-5">Four traps that cost traders money every single day.</p>
          <div className="space-y-3">
            {mistakes.map((m, i) => (
              <div key={i} className="glass-card rounded-xl overflow-hidden">
                <button onClick={() => toggleMyth(`mistake-${i}`)} className="w-full flex items-center justify-between p-4 text-left">
                  <p className="text-sm font-semibold text-white" dangerouslySetInnerHTML={{ __html: m.myth }} />
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ml-2 ${expandedMyths[`mistake-${i}`] ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {expandedMyths[`mistake-${i}`] && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4 space-y-2">
                        <p className="text-xs text-red-400 leading-relaxed"><strong>Why It&apos;s Wrong:</strong> {m.wrong}</p>
                        <p className="text-xs text-green-400 leading-relaxed"><strong>Do This Instead:</strong> {m.right}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S08 — Cheat Sheet */}
      <section className="max-w-2xl mx-auto px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Quick Reference</p>
          <h2 className="text-2xl font-extrabold mb-2">MA Cheat Sheet</h2>
          <p className="text-gray-400 text-sm mb-5">Six scenarios and the professional response to each.</p>
          <div className="glass-card p-4 rounded-2xl space-y-2">
            {[
              { label: 'Price above 50 &amp; 200 SMA', action: 'BULLISH', colour: 'text-green-400', desc: 'Both institutional benchmarks agree the trend is up. Favour long setups. Be very selective with any shorts.' },
              { label: 'Price below 50 &amp; 200 SMA', action: 'BEARISH', colour: 'text-red-400', desc: 'Both benchmarks confirm downside. Favour shorts or stay flat. Longs are counter-trend and high-risk.' },
              { label: 'Golden Cross forms', action: 'FILTER', colour: 'text-amber-400', desc: 'Confirms bullish regime. Do NOT buy the cross itself. Wait for pullback to 21 EMA or structure for entry.' },
              { label: 'Pullback to 21 EMA in uptrend', action: 'ENTRY', colour: 'text-green-400', desc: 'Classic pullback entry zone. Confirm with volume and/or RSI. Place stop below the 21 EMA by 1 ATR.' },
              { label: 'MA ribbon compressing', action: 'WAIT', colour: 'text-amber-400', desc: 'Energy coiling. Sit on hands until the ribbon fans out. Trade the direction of the expansion.' },
              { label: 'Price rejected at 200 SMA from below', action: 'RESPECT', colour: 'text-red-400', desc: 'The 200 SMA is acting as resistance. Don&apos;t fight it. Wait for a convincing break above with volume.' }
            ].map((row, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="flex-shrink-0"><span className={`text-xs font-extrabold ${row.colour}`}>{row.action}</span></div>
                <div>
                  <p className="text-sm font-extrabold text-white" dangerouslySetInnerHTML={{ __html: row.label }} />
                  <p className="text-[11px] text-gray-400 mt-0.5" dangerouslySetInnerHTML={{ __html: row.desc }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S09 — Game */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Test Your Understanding</p>
          <h2 className="text-2xl font-extrabold mb-2">Moving Averages Game</h2>
          <p className="text-gray-400 text-sm mb-6">5 real scenarios. Think like a professional, not a retail trader.</p>
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
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'You understand MAs at a professional level. The crowd can&apos;t fool you with golden cross hype.' : gameScore >= 3 ? 'Good foundation. Review the golden/death cross section and dynamic S/R weakening rule.' : 'Moving averages have more depth than most realise. Re-read the institutional levels and cross reality sections.'}</p></motion.div>)}
          </div>
        </motion.div>
      </section>

      {/* S10 — Quiz + Cert */}
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
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(139,92,246,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
                <div className="relative z-10 text-center">
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-blue-500 to-amber-500 flex items-center justify-center text-3xl shadow-lg shadow-blue-500/30">📏</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 5: Moving Averages &mdash; Advanced</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-blue-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Trend Architect &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L5.10-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
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
