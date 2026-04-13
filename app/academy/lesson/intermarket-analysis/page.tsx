// app/academy/lesson/intermarket-analysis/page.tsx
// ATLAS Academy — Lesson 8.9: Commodities, Bonds & Intermarket Analysis [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 8
// GROUNDBREAKING: Intermarket Signal Board — 4 market inputs, regime identification
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
// ANIMATION 1: Intermarket Cycle — Bonds lead, Equities follow, Commodities lag
// ============================================================
function IntermarketCycleAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.002; const cx = w / 2; const cy = h / 2 + 8;
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('The Intermarket Rotation — Bonds Lead, Equities Follow', cx, 16);
    const R = Math.min(w * 0.28, h * 0.3);
    const markets = [
      { name: 'BONDS', emoji: '📜', phase: 'LEAD', desc: 'Bonds turn first.\nYields fall = prices rise.\nSignals rate expectations.', color: '#3b82f6', angle: -Math.PI / 2 },
      { name: 'EQUITIES', emoji: '📈', phase: 'FOLLOW', desc: 'Stocks follow bonds\nby 2-4 months.\nLower rates = higher valuations.', color: '#26A69A', angle: 0 },
      { name: 'COMMODITIES', emoji: '🛢️', phase: 'LAG', desc: 'Commodities are last.\nDemand-driven. Confirm\nthe economic direction.', color: '#f59e0b', angle: Math.PI / 2 },
      { name: 'USD', emoji: '💵', phase: 'REACT', desc: 'Dollar reacts to all three.\nRate differentials +\nsafe haven flows.', color: '#8b5cf6', angle: Math.PI },
    ];
    const activeIdx = Math.floor((t % 16) / 4) % 4;
    // Rotation arrow
    ctx.beginPath(); ctx.arc(cx, cy, R + 18, -Math.PI / 2, -Math.PI / 2 + ((t % 16) / 16) * Math.PI * 2);
    ctx.strokeStyle = '#f59e0b20'; ctx.lineWidth = 2; ctx.stroke();
    // Connection circle
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 20; ctx.stroke();
    // Arrows between nodes
    for (let i = 0; i < 4; i++) {
      const a = markets[i]; const b = markets[(i + 1) % 4];
      const ax = cx + Math.cos(a.angle) * R; const ay = cy + Math.sin(a.angle) * R;
      const bx = cx + Math.cos(b.angle) * R; const by = cy + Math.sin(b.angle) * R;
      const mx = (ax + bx) / 2; const my = (ay + by) / 2;
      const lit = i === activeIdx || i === (activeIdx + 3) % 4;
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.quadraticCurveTo(mx + (cy - my) * 0.3, my + (mx - cx) * 0.3, bx, by);
      ctx.strokeStyle = lit ? '#f59e0b40' : 'rgba(255,255,255,0.03)'; ctx.lineWidth = lit ? 1.5 : 0.5; ctx.stroke();
    }
    // Market nodes
    markets.forEach((mkt, i) => {
      const mx = cx + Math.cos(mkt.angle) * R; const my = cy + Math.sin(mkt.angle) * R;
      const isActive = i === activeIdx; const pulse = isActive ? Math.sin(t * 4) * 3 : 0;
      ctx.beginPath(); ctx.arc(mx, my, (isActive ? 28 : 20) + pulse, 0, Math.PI * 2);
      ctx.fillStyle = isActive ? mkt.color + '15' : mkt.color + '05'; ctx.fill();
      ctx.strokeStyle = isActive ? mkt.color + '60' : mkt.color + '15'; ctx.lineWidth = isActive ? 1.5 : 0.5; ctx.stroke();
      ctx.textAlign = 'center';
      ctx.font = `${isActive ? 18 : 14}px system-ui`; ctx.fillText(mkt.emoji, mx, my - 2);
      ctx.fillStyle = isActive ? mkt.color : 'rgba(255,255,255,0.15)';
      ctx.font = `${isActive ? 'bold 8' : '7'}px system-ui`; ctx.fillText(mkt.name, mx, my + (isActive ? 16 : 12));
      if (isActive) {
        const descX = mx > cx ? mx + 40 : mx - 40; const descY = my > cy ? my + 10 : my - 10;
        ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '7px system-ui';
        ctx.textAlign = mx > cx ? 'left' : 'right';
        mkt.desc.split('\n').forEach((l, li) => ctx.fillText(l, descX, descY + li * 10));
        ctx.fillStyle = mkt.color + '80'; ctx.font = 'bold 7px system-ui';
        ctx.fillText(mkt.phase, descX, descY - 10);
      }
    });
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 2: Yield Curve — Normal, Flat, Inverted
// ============================================================
function YieldCurveAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.002; const cx = w / 2;
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('The Yield Curve — The Bond Market’s Crystal Ball', cx, 16);
    const curves = [
      { name: 'NORMAL', desc: 'Economy healthy. Banks lending. Growth expected.', color: '#26A69A', points: [0.25, 0.35, 0.5, 0.65, 0.78, 0.85, 0.9], signal: 'EXPANSION' },
      { name: 'FLAT', desc: 'Uncertainty. Transition point. Market can’t decide.', color: '#FFB300', points: [0.55, 0.56, 0.57, 0.57, 0.58, 0.58, 0.58], signal: 'CAUTION' },
      { name: 'INVERTED', desc: 'Predicted EVERY recession since 1970. 12-18 month lead.', color: '#EF5350', points: [0.75, 0.7, 0.62, 0.55, 0.48, 0.44, 0.42], signal: 'RECESSION WARNING' },
    ];
    const activeIdx = Math.floor((t % 15) / 5) % 3; const curve = curves[activeIdx];
    const chartL = 50; const chartR = w - 20; const chartW = chartR - chartL;
    const chartT = 50; const chartB = h - 40; const chartH = chartB - chartT;
    const maturities = ['3M', '6M', '1Y', '2Y', '5Y', '10Y', '30Y'];
    // Axes
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(chartL, chartB); ctx.lineTo(chartR, chartB); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(chartL, chartT); ctx.lineTo(chartL, chartB); ctx.stroke();
    // Labels
    ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.font = '7px system-ui'; ctx.textAlign = 'center';
    maturities.forEach((m, i) => ctx.fillText(m, chartL + (i / (maturities.length - 1)) * chartW, chartB + 14));
    ctx.save(); ctx.translate(15, (chartT + chartB) / 2); ctx.rotate(-Math.PI / 2);
    ctx.fillText('YIELD', 0, 0); ctx.restore();
    // Curve
    const progress = Math.min(1, (t % 5) / 3);
    ctx.beginPath(); ctx.lineWidth = 3;
    const visiblePts = Math.floor(progress * curve.points.length);
    for (let i = 0; i <= Math.min(visiblePts, curve.points.length - 1); i++) {
      const x = chartL + (i / (curve.points.length - 1)) * chartW;
      const y = chartB - curve.points[i] * chartH;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      // Dots
      ctx.fillStyle = curve.color; ctx.fillRect(x - 2, y - 2, 4, 4);
    }
    ctx.strokeStyle = curve.color + '80'; ctx.stroke();
    // Fill under curve
    ctx.lineTo(chartL + (Math.min(visiblePts, curve.points.length - 1) / (curve.points.length - 1)) * chartW, chartB);
    ctx.lineTo(chartL, chartB); ctx.closePath();
    ctx.fillStyle = curve.color + '08'; ctx.fill();
    // Curve name + description
    ctx.fillStyle = curve.color; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'center';
    ctx.fillText(curve.name, cx, chartT - 8);
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = '8px system-ui';
    ctx.fillText(curve.desc, cx, h - 20);
    ctx.fillStyle = curve.color + '80'; ctx.font = 'bold 8px system-ui';
    ctx.fillText('Signal: ' + curve.signal, cx, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// INTERMARKET SIGNAL BOARD DATA
// ============================================================
interface SignalInput { key: string; label: string; icon: string; options: { value: string; label: string }[]; }
const signalInputs: SignalInput[] = [
  { key: 'equities', label: 'Equities', icon: '📈', options: [{ value: 'rising', label: 'Rising / Bullish' }, { value: 'flat', label: 'Range-bound' }, { value: 'falling', label: 'Falling / Bearish' }] },
  { key: 'bonds', label: 'Bond Prices (Yields inverse)', icon: '📜', options: [{ value: 'rising', label: 'Rising (yields falling)' }, { value: 'flat', label: 'Stable' }, { value: 'falling', label: 'Falling (yields rising)' }] },
  { key: 'dollar', label: 'US Dollar (DXY)', icon: '💵', options: [{ value: 'weakening', label: 'Weakening' }, { value: 'stable', label: 'Stable' }, { value: 'strengthening', label: 'Strengthening' }] },
  { key: 'commodities', label: 'Commodities (Oil, Copper)', icon: '🛢️', options: [{ value: 'rising', label: 'Rising' }, { value: 'flat', label: 'Stable' }, { value: 'falling', label: 'Falling' }] },
];

const getIntermarketRegime = (vals: Record<string, string>): { regime: string; color: string; desc: string; next: string; trading: string } => {
  const { equities, bonds, dollar, commodities } = vals;
  if (equities === 'rising' && bonds === 'falling' && commodities === 'rising') return { regime: 'LATE-CYCLE EXPANSION', color: '#FFB300', desc: 'Classic late expansion: equities still rising but bond yields climbing (prices falling) and commodities hot. Inflation building. The Fed is likely tightening or about to.', next: 'Peak is approaching. When bonds continue falling and equities START falling, the transition to contraction begins. Watch for equity divergence — the first sector to weaken signals the turn.', trading: 'Equities: selective, avoid rate-sensitive sectors. Commodities: still working but volatile. Gold: mixed (inflation hedge vs rate pressure). USD: likely strengthening on rate hikes. Reduce overall risk — transitions from late-cycle to contraction are violent.' };
  if (equities === 'falling' && bonds === 'rising' && commodities === 'falling') return { regime: 'CONTRACTION / RECESSION', color: '#EF5350', desc: 'Classic contraction: equities dropping, bond prices rising (flight to safety, yields falling), commodities falling (weak demand). Capital is fleeing to safety.', next: 'Rate cuts are coming or already underway. When bonds stabilise and equities STOP falling, the trough is forming. The bottom is a process, not a point.', trading: 'Full risk-off. Gold longs. Bond longs. USD typically strengthens initially (safe haven) then weakens as Fed cuts. Short equities if trending. Commodity currencies (AUD, CAD) weaken. JPY strengthens on carry unwind.' };
  if (equities === 'rising' && bonds === 'rising' && dollar === 'weakening') return { regime: 'EARLY RECOVERY / GOLDILOCKS', color: '#26A69A', desc: 'The best environment for traders: equities rising, bonds supported (yields stable/falling), USD weakening. The Fed is accommodative. Liquidity is abundant.', next: 'If commodities start rising too, inflation will follow and the cycle transitions to mid-expansion. Enjoy this while it lasts — it’s the sweet spot.', trading: 'Risk-on. Equities favoured across sectors. Gold supported (weak USD). Commodity currencies rally (AUD, NZD, CAD). EUR/USD and GBP/USD in uptrends. This is where technical setups have the highest win rate — structure holds in goldilocks.' };
  if (equities === 'falling' && bonds === 'falling' && commodities === 'rising') return { regime: 'STAGFLATION', color: '#EF5350', desc: 'The worst scenario: equities falling (weak growth) while commodities rising (inflation). Bond prices falling (yields rising because of inflation fears). The Fed is stuck.', next: 'Historically rare but devastating. Eventually, either growth recovers (soft landing) or inflation forces aggressive tightening that deepens the recession. No easy exit.', trading: 'The hardest environment. Equities lose. Bonds lose. Cash and Gold are the only consistent winners. Reduce all positions to minimum. Trade very selectively. Commodity currencies may hold up (commodity exports) but with high volatility.' };
  if (equities === 'flat' && bonds === 'flat' && dollar === 'stable') return { regime: 'CONSOLIDATION', color: '#6b7280', desc: 'All markets range-bound. Low volatility. The market is waiting for a catalyst — data, central bank decision, or geopolitical event. The calm before something.', next: 'Breakout is coming. Direction unknown until the catalyst arrives. The longer the consolidation, the more violent the breakout typically is.', trading: 'Range-trading works. Mean-reversion strategies. Reduce directional bets. Build your watchlist. When the breakout comes, be ready to deploy capital in the confirmed direction. Don’t force trades in a rangy market.' };
  if (bonds === 'rising' && dollar === 'weakening' && commodities === 'rising') return { regime: 'REFLATION TRADE', color: '#26A69A', desc: 'Post-crisis recovery: central banks easing aggressively. Bond prices rising (rate cuts), USD weakening (liquidity flood), commodities recovering (demand returning).', next: 'Equities should follow. This is the “buy everything” phase. Eventually transitions to mid-expansion as activity normalises.', trading: 'Risk-on with conviction. Gold rallies (weak USD + uncertainty). Commodity currencies surge. EUR/USD uptrend. Equities bottom and begin recovery. This is where the biggest percentage gains are made.' };
  return { regime: 'MIXED / TRANSITIONAL', color: '#FFB300', desc: 'Signals are conflicting across markets. This typically occurs during regime transitions when one market leads and others haven’t caught up yet.', next: 'Wait for alignment. The market that turned FIRST (usually bonds) is typically the one that’s right. Follow the leader.', trading: 'Low conviction. Reduce position sizes. Focus only on the highest-probability setups. When 3 of 4 markets align, conviction increases significantly. Until then, capital preservation over capital deployment.' };
};

// ============================================================
// CONTENT DATA
// ============================================================
const marketConnections = [
  { title: '🪙 Gold — The Anti-Dollar', desc: '<strong>Primary driver:</strong> USD strength. Gold is priced in dollars — when USD rises, Gold becomes more expensive for non-USD buyers → demand falls → Gold drops.<br/><br/><strong>Secondary drivers:</strong> Real yields (nominal rate minus inflation). Higher real yields = higher opportunity cost of holding Gold (which pays no yield). Geopolitical fear = safe haven demand.<br/><br/><strong>The relationship:</strong> Gold and DXY have a −0.6 to −0.8 correlation. But Gold CAN rally with USD during extreme fear (both are safe havens). When Gold and USD rise together, the market is truly terrified.<br/><br/><strong>For your trading:</strong> Before going long Gold, check DXY. If DXY is strengthening, your Gold long is fighting the primary headwind. Gold longs work best when USD is weakening OR during acute geopolitical risk.' },
  { title: '🛢️ Oil — The Inflation Barometer', desc: '<strong>Currency impact:</strong> Oil rising = CAD strengthens (Canada exports oil), NOK strengthens (Norway), RUB strengthens (Russia). AUD benefits from general commodity demand.<br/><br/><strong>Inflation impact:</strong> Oil is a direct CPI input (energy = 6.9% of CPI). Oil spikes flow through to headline CPI within 1-2 months. Higher oil = hotter CPI = hawkish central banks = stronger USD.<br/><br/><strong>Geopolitical premium:</strong> Middle East tension = oil supply risk = oil spikes. This creates a double whammy: risk-off (Gold up) + inflation fear (rate expectations up). Markets hate this combination.<br/><br/><strong>For your trading:</strong> Oil above $90 = watch for CPI surprises. Oil collapse = deflationary signal = dovish central banks. CAD trades are often an oil trade in disguise.' },
  { title: '📜 Bonds — The Smart Money Signal', desc: '<strong>The inverse:</strong> Bond prices and yields move OPPOSITE. When you hear “yields are rising,” bond prices are falling. Capital is leaving bonds.<br/><br/><strong>Why bonds LEAD:</strong> The bond market is dominated by institutions, central banks, and pension funds — the “smart money.” They position BEFORE the rest of the market. When bonds start rallying (yields falling), institutions are pricing in economic weakness months before it shows in GDP or equities.<br/><br/><strong>The 2-10 spread:</strong> 2-year yield vs 10-year yield. Normal: 10Y &gt; 2Y (positive spread). Inverted: 2Y &gt; 10Y (negative spread). Inversion has predicted every recession in 50 years with 12-18 month lead time.<br/><br/><strong>For your trading:</strong> If bond yields are falling while equities are still rising, bonds are warning you. Don’t ignore the smart money. They’re usually 3-6 months ahead.' },
  { title: '📈 Equities — The Sentiment Gauge', desc: '<strong>What they reflect:</strong> Forward earnings expectations. Stocks are valued on FUTURE profits discounted by interest rates. Higher rates = lower valuations. Higher earnings = higher valuations.<br/><br/><strong>Sector rotation:</strong> Within a cycle, sectors rotate. Early cycle: financials and consumer discretionary lead. Mid-cycle: tech and industrials. Late cycle: energy and utilities. Understanding which sectors lead tells you where in the cycle you are.<br/><br/><strong>The equity-forex link:</strong> Strong US equities attract foreign capital → buy USD to invest → USD strengthens. But this is a SLOW effect. The fast effect: equity sell-offs = risk-off = USD strengthens (safe haven) + JPY strengthens (carry unwind).<br/><br/><strong>For your trading:</strong> S&P 500 direction is a macro health gauge. New highs = risk-on. Breaking below 200-day MA = risk-off warning. Use equity direction to confirm your forex macro bias.' },
];

const rotationSequence = [
  { phase: '1. Bonds turn first', what: 'Yields start falling (prices rising). Smart money pricing in slowdown or rate cuts. Equities may still be rising — this is the divergence warning.', color: '#3b82f6' },
  { phase: '2. Equities follow', what: '2-4 months after bonds. Growth stocks lead the decline. Defensive sectors (utilities, healthcare) outperform. The equity market admits what bonds already knew.', color: '#26A69A' },
  { phase: '3. Commodities confirm', what: 'Demand-driven commodities (copper, oil) fall as industrial activity slows. This confirms the contraction. Gold may RISE (safe haven) while industrial commodities fall.', color: '#f59e0b' },
  { phase: '4. Dollar reacts', what: 'Initially strengthens (safe haven). Then weakens as the Fed cuts rates. The USD direction FLIP is one of the most tradeable intermarket signals.', color: '#8b5cf6' },
];

const commonMistakes = [
  { title: 'Ignoring Bond Market Signals', mistake: 'Bond yields have been falling for 3 months. You’re still long equities because “stocks are still going up.” The bond market is telling you the economy is weakening. You’re ignoring the smartest money in the room.', fix: 'Bonds lead by 3-6 months. If yields are falling while equities rise, tighten your equity stops. The bond market is rarely wrong — it’s just early.' },
  { title: 'Trading Gold Without Checking USD', mistake: 'Beautiful Gold OB setup. You go long. DXY is at a 6-month high and strengthening. Gold drops despite the “perfect” setup. You ignored the primary driver.', fix: 'Gold’s #1 driver is USD. ALWAYS check DXY before entering Gold. If DXY is strong, your Gold long needs exceptional reasons (geopolitical crisis, extreme fear) to overcome the headwind.' },
  { title: 'Treating Commodities as Independent', mistake: 'You go long AUD/USD based on chart patterns alone. Oil collapses. AUD follows because Australia exports commodities to China, which needs oil. Your technical setup was overridden by commodity flows.', fix: 'Commodity currencies (AUD, CAD, NZD, NOK) are proxies for commodity prices. Before trading them, check the relevant commodity. AUD = iron ore + general commodities. CAD = oil. NOK = oil.' },
  { title: 'Not Understanding the Yield Curve', mistake: 'The yield curve inverts. You think it’s “just a bond thing” and continue trading equities aggressively. 14 months later, the recession arrives. The yield curve told you. You didn’t listen.', fix: 'An inverted yield curve is the most reliable recession predictor in finance. It doesn’t mean “sell everything now” — the lag is 12-18 months. But it DOES mean: tighten risk, reduce leverage, prepare for regime change.' },
];

const quizQuestions = [
  { q: 'Bond yields have been falling for 4 months while equities are still at all-time highs. This divergence signals:', opts: ['Bonds are wrong — equities confirm strength', 'Bonds are leading — the smart money is pricing in a slowdown that equities haven’t recognised yet', 'No relationship between bonds and equities', 'Buy more equities on the dip'], correct: 1, explain: 'Bonds lead by 3-6 months. Falling yields mean institutions are pricing in economic weakness or rate cuts. When equities and bonds diverge, bonds are almost always right — they’re just early. Tighten equity stops.' },
  { q: 'Gold is rallying while DXY is also strengthening. This unusual combination signals:', opts: ['Gold is in a bubble', 'Extreme fear — both are safe havens, and capital is fleeing ALL risk assets simultaneously', 'Random noise', 'USD is about to weaken'], correct: 1, explain: 'Normally Gold and USD move opposite. When BOTH rally simultaneously, the market is in genuine panic. Capital is abandoning equities, commodities, and EM assets for the two ultimate safe havens. This is a crisis signal.' },
  { q: 'Oil rises from $75 to $95 over 2 months. The MOST immediate trading implication is:', opts: ['Go long oil', 'CAD strengthens, headline CPI will be hotter in 1-2 months, and central banks may become more hawkish', 'No forex impact', 'Oil is overbought'], correct: 1, explain: 'Oil feeds directly into CPI (energy component) with a 1-2 month lag. Rising oil = hotter CPI expectations = hawkish rate expectations. CAD benefits directly (oil exporter). This cascades through rates, currencies, and equities.' },
  { q: 'The intermarket rotation order is:', opts: ['Equities → Bonds → Commodities → Dollar', 'Bonds → Equities → Commodities → Dollar. Bonds LEAD, equities follow, commodities confirm.', 'All move simultaneously', 'Dollar → everything else'], correct: 1, explain: 'Bond market (dominated by institutions) turns first. Equities follow 2-4 months later. Commodities confirm as industrial demand shifts. Dollar reacts to all three through rate differentials and safe haven flows.' },
  { q: 'Equities falling + Bond prices rising + Commodities falling + USD strengthening. This is:', opts: ['Normal market cycle', 'Classic contraction/recession: capital fleeing to safety (bonds, USD), abandoning growth assets (equities, commodities)', 'Stagflation', 'Recovery'], correct: 1, explain: 'This is textbook contraction. Every market is confirming the same story: risk-off. Bonds rallying = rate cuts expected. Equities falling = earnings declining. Commodities falling = demand weakening. USD strong = safe haven. All four aligned.' },
  { q: 'The yield curve inverts in January. Historically, a recession arrives in:', opts: ['Immediately', '12-18 months — the inversion is an EARLY warning, not an immediate signal', '5+ years', 'Never — it’s a myth'], correct: 1, explain: 'Yield curve inversion has predicted every recession since 1970, but with a 12-18 month lag. The inversion in January means recession risk is elevated for late next year. Use the time to reduce leverage and prepare, not to panic immediately.' },
  { q: 'AUD/USD is in a downtrend. Iron ore prices collapse. Copper is falling. This confirms:', opts: ['AUD weakness is technically driven', 'AUD weakness is fundamentally driven by commodity demand collapse — Australia’s export income is declining', 'Buy AUD on the dip — technical support will hold', 'Unrelated events'], correct: 1, explain: 'AUD is a commodity currency. Iron ore is Australia’s largest export. When both iron ore and copper fall, it means Chinese industrial demand (Australia’s biggest customer) is weakening. AUD’s downtrend has fundamental backing — technical support levels are less reliable.' },
  { q: 'Intermarket analysis helps forex traders by:', opts: ['Replacing technical analysis', 'Providing macro CONTEXT for technical setups — confirming whether the environment supports or contradicts your trade thesis', 'Predicting exact price targets', 'Only useful for bond traders'], correct: 1, explain: 'Intermarket analysis doesn’t replace your SMC setups. It CONTEXTUALISES them. A bullish EUR/USD setup with bonds, equities, and DXY all supporting USD weakness = high conviction. The same setup with all intermarket signals contradicting = low conviction or skip.' },
];

const gameRounds = [
  { scenario: '<strong>Current readings:</strong> S&P 500 at all-time highs. Bond yields rising (prices falling). Oil at $92. Copper at 6-month high. USD stable. Your macro bias was risk-on.', options: [
    { text: 'Maximum risk-on — equities and commodities are both bullish.', correct: false, explain: '✗ Equities up + commodities up + yields rising = LATE-CYCLE expansion. Inflation is building. The Fed will tighten further. This is the phase before the peak, not the middle of the expansion. Reduce risk, don’t add.' },
    { text: 'Cautious. Late-cycle signals: rising commodities + rising yields = inflation building. Tighten stops on equity longs. Watch for bond market divergence as the first recession warning.', correct: true, explain: '✓ You correctly identified the late-cycle pattern. Rising yields + rising commodities = inflation pressure = tighter policy ahead. This environment favours short-duration trades with tight risk. The peak is approaching.' },
    { text: 'Go risk-off — yields rising is bearish.', correct: false, explain: '✗ Yields rising in isolation isn’t bearish — it can signal strong growth. It’s yields rising + commodities hot + equities at extremes that creates the late-cycle warning. Risk-off is premature, but caution is warranted.' },
  ]},
  { scenario: '<strong>Bond yields start falling sharply.</strong> 10-year yield drops from 4.8% to 4.3% in 3 weeks. S&P 500 still at highs. Gold begins rising. DXY weakening slightly. You hold equity longs.', options: [
    { text: 'Ignore bonds — equities are the real economy indicator.', correct: false, explain: '✗ Bonds are the LEADING indicator. Institutions are repricing economic expectations downward. The equity market hasn’t caught up yet. By the time equities confirm, you’ve already lost the early warning advantage.' },
    { text: 'Tighten equity stops significantly. Bonds are warning of a slowdown. The smart money is moving to safety. If equities start falling, you’re prepared to exit quickly.', correct: true, explain: '✓ The bond-equity divergence is one of the most reliable intermarket signals. Bonds lead by 3-6 months. You don’t need to close equities yet, but tight stops protect you when equities eventually follow bonds lower.' },
    { text: 'Sell all equities and go long bonds immediately.', correct: false, explain: '✗ Bonds have already moved (4.8% to 4.3%). Entering bonds now is chasing. And equities may have weeks or months of upside remaining before turning. Tighten stops and WATCH — don’t panic rebalance.' },
  ]},
  { scenario: '<strong>Gold rallying + USD strengthening simultaneously.</strong> VIX at 28. Equities down 4% this week. Oil spiking on geopolitical news. Bond yields plunging. Everything is moving at once.', options: [
    { text: 'Buy equities on the dip — VIX at 28 means panic is overdone.', correct: false, explain: '✗ Gold UP + USD UP simultaneously = genuine fear, not a dip to buy. Both safe havens rallying at once means capital is fleeing ALL risk assets. This is a crisis signal, not a buying opportunity.' },
    { text: 'Recognise this as a crisis signal. Gold + USD both rising = extreme risk-off. Flatten risk positions. Hold or add Gold and defensive assets. Wait for VIX to normalise before re-entering risk.', correct: true, explain: '✓ Gold and USD rising together is one of the rarest and most powerful intermarket signals. It means the market trusts NOTHING except the ultimate safe havens. Trade defensively until the correlation normalises.' },
    { text: 'Short Gold — it can’t rally with USD.', correct: false, explain: '✗ During extreme fear, the Gold-USD negative correlation BREAKS. Both can rally simultaneously for days or weeks. Shorting Gold during a genuine crisis is fighting the strongest safe-haven flow in markets.' },
  ]},
  { scenario: '<strong>Post-crisis recovery phase.</strong> Fed just cut rates 50bps. Bond prices rallying. DXY dropping. Commodities starting to recover. Equities have stopped falling and are basing. Gold still elevated.', options: [
    { text: 'Stay risk-off — the crisis was too recent.', correct: false, explain: '✗ The intermarket signals are screaming recovery: rate cuts + falling USD + commodity recovery + equities basing. This is the reflation trade. Staying risk-off means missing the most profitable phase of the cycle.' },
    { text: 'Begin transitioning to risk-on. Bonds rallying + USD weakening + commodities recovering = reflation. Start building EUR/USD longs, commodity currency longs, and selective equity longs.', correct: true, explain: '✓ Classic reflation: central bank easing → USD weakens → commodities recover → equities bottom. This is where the biggest percentage gains are made. Bonds leading the way confirms the smart money agrees.' },
    { text: 'Wait for equities to make new highs before entering.', correct: false, explain: '✗ By the time equities make new highs, the reflation trade is largely complete. The intermarket signals are giving you 3-6 months of lead time. Enter now and you catch the recovery. Enter at new highs and you catch the tail end.' },
  ]},
  { scenario: '<strong>Equities falling. Bond prices falling. Oil rising. Gold rising. USD mixed.</strong> Equities down, commodities up, bonds down. An unusual combination.', options: [
    { text: 'Normal correction — everything will revert.', correct: false, explain: '✗ This is NOT normal. Normally in contraction, bonds RISE (safety). Bonds falling while equities also fall = both sides of the traditional portfolio losing. Oil rising while equities fall = inflation + weak growth. This is stagflation.' },
    { text: 'Stagflation signal. Growth weakening (equities down) while inflation rising (oil up, bonds down on inflation fear). The Fed is trapped. Reduce ALL positions. Gold is the primary winner.', correct: true, explain: '✓ Stagflation: the worst macro environment. Growth declining + inflation rising = the Fed can’t cut (inflation) and can’t hold (growth). Gold wins (inflation hedge + uncertainty). Cash wins. Almost everything else loses. Minimum exposure.' },
    { text: 'Buy equities — bonds falling means rates will rise which is good for banks.', correct: false, explain: '✗ Bonds aren’t falling because of rate hikes for growth. They’re falling because inflation expectations are rising while the economy weakens. This is the worst combination — financial sector benefits are overwhelmed by overall economic deterioration.' },
  ]},
];

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function IntermarketAnalysisPage() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setOpenSections(p => ({ ...p, [id]: !p[id] }));

  // Intermarket Signal Board
  const [sigValues, setSigValues] = useState<Record<string, string>>({});
  const [sigGenerated, setSigGenerated] = useState(false);
  const allSigFilled = signalInputs.every(s => sigValues[s.key]);
  const regime = allSigFilled ? getIntermarketRegime(sigValues) : null;

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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 8 &middot; Lesson 9</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Commodities, Bonds<br /><span className="bg-gradient-to-r from-amber-400 via-red-400 to-purple-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>&amp; Intermarket Analysis</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">Markets are not isolated planets. They&rsquo;re a connected solar system. Bonds lead, equities follow, commodities confirm, and the Dollar reacts to all three.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* S00 */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">🌌 The Financial Solar System</p>
            <p className="text-gray-400 leading-relaxed mb-4">The solar system doesn&rsquo;t have isolated planets. <strong className="text-amber-400">Gravity connects everything.</strong> When Jupiter moves, its moons follow. When the sun flares, every planet feels it. Financial markets work the same way.</p>
            <p className="text-gray-400 leading-relaxed">Bonds are the inner planet — closest to the gravitational centre (interest rates), first to move. Equities are the outer planet — they follow 3-6 months later. <strong className="text-white">Trading forex without watching bonds and commodities is like navigating space while ignoring gravity.</strong></p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">October 2023: Bond yields hit 5% (16-year high). Gold was “supposed to” drop (high yields = Gold negative). Instead, <strong className="text-green-400">Gold rallied to $2,070</strong> — because geopolitical fear (Israel-Hamas) overrode the yield relationship. Traders using intermarket analysis saw the conflict: yields said “sell Gold,” geopolitics said “buy Gold.” <strong className="text-white">The ones who understood the hierarchy of drivers won.</strong></p>
          </div>
        </motion.div>
      </section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Intermarket Rotation</p><h2 className="text-2xl font-extrabold mb-4">Bonds Lead. Equities Follow. Commodities Confirm.</h2><p className="text-gray-400 text-sm mb-6">The rotation that has repeated for over 100 years of market history.</p><IntermarketCycleAnimation /></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Yield Curve</p><h2 className="text-2xl font-extrabold mb-4">The Bond Market&rsquo;s Crystal Ball</h2><p className="text-gray-400 text-sm mb-6">Normal, flat, and inverted — each tells a different story about the future.</p><YieldCurveAnimation /></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The 4 Markets Connected</p><h2 className="text-2xl font-extrabold mb-4">Gold, Oil, Bonds &amp; Equities</h2><div className="space-y-3">{marketConnections.map((item, i) => (<div key={i}><button onClick={() => toggle(`mc-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`mc-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`mc-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.desc }} /></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The Rotation Sequence</p><h2 className="text-2xl font-extrabold mb-4">The Predictable Order of Turns</h2><div className="p-6 rounded-2xl glass-card space-y-3">{rotationSequence.map(item => (<div key={item.phase} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-xs font-bold mb-1" style={{ color: item.color }}>{item.phase}</p><p className="text-[11px] text-gray-400">{item.what}</p></div>))}</div></motion.div></section>

      {/* S05 — GROUNDBREAKING: Intermarket Signal Board */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Interactive Challenge</p><h2 className="text-2xl font-extrabold mb-2">Intermarket Signal Board</h2><p className="text-gray-400 text-sm mb-6">Input the direction of 4 markets. Get the current regime, what comes next, and trading implications.</p>
      <div className="p-6 rounded-2xl glass-card space-y-4">
        {!sigGenerated ? (<><div className="space-y-3">{signalInputs.map(input => (<div key={input.key}><p className="text-xs font-bold text-gray-300 mb-1.5">{input.icon} {input.label}</p><div className="flex flex-wrap gap-1.5">{input.options.map(opt => (<button key={opt.value} onClick={() => setSigValues(p => ({ ...p, [input.key]: opt.value }))} className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${sigValues[input.key] === opt.value ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400' : 'bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:bg-white/[0.07]'}`}>{opt.label}</button>))}</div></div>))}</div>
        {allSigFilled && (<button onClick={() => setSigGenerated(true)} className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95">Identify Regime &rarr;</button>)}
        {!allSigFilled && (<p className="text-xs text-gray-600 text-center">Select a direction for each market to identify the regime.</p>)}</>) : regime && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="p-5 rounded-xl text-center" style={{ background: regime.color + '10', border: `1px solid ${regime.color}30` }}><p className="text-2xl font-extrabold" style={{ color: regime.color }}>{regime.regime}</p></div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-[10px] font-bold text-gray-300 mb-1">CURRENT ENVIRONMENT</p><p className="text-xs text-gray-400 leading-relaxed">{regime.desc}</p></div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15"><p className="text-[10px] font-bold text-amber-400 mb-1">WHAT COMES NEXT</p><p className="text-xs text-gray-400 leading-relaxed">{regime.next}</p></div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-[10px] font-bold text-green-400 mb-1">TRADING IMPLICATIONS</p><p className="text-xs text-gray-400 leading-relaxed">{regime.trading}</p></div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-[10px] font-bold text-gray-300 mb-2">YOUR INPUTS</p><div className="grid grid-cols-4 gap-1.5">{signalInputs.map(s => (<div key={s.key} className="p-1.5 rounded-lg bg-white/[0.02] text-center"><p className="text-[9px] text-gray-600">{s.icon}</p><p className="text-[10px] font-semibold text-gray-300 capitalize">{sigValues[s.key]}</p></div>))}</div></div>
          <button onClick={() => { setSigGenerated(false); setSigValues({}); }} className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-semibold text-gray-300 hover:bg-white/[0.07]">&larr; Try Different Inputs</button>
        </motion.div>)}
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Commodity-Currency Links</p><h2 className="text-2xl font-extrabold mb-4">Currencies That Follow Commodities</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">CAD = OIL</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Canada’s #1 export. Oil up = CAD up. Oil collapse = CAD collapse. Check oil before trading USD/CAD.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#f59e0b]">AUD = IRON ORE + CHINA</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Australia exports iron ore to China. Chinese demand down = AUD down. China stimulus = AUD up.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#26A69A]">NZD = DAIRY + RISK</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">New Zealand exports dairy. But NZD also acts as a pure risk-on/off currency. Highly correlated with AUD.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#3b82f6]">NOK = OIL (Europe)</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Norway’s oil fund is the world’s largest. NOK tracks oil closely. Less liquid than CAD but same dynamic.</span></p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; When Relationships Break</p><h2 className="text-2xl font-extrabold mb-4">The Exception That Proves the Rule</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">GOLD + USD BOTH RISING</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Extreme fear. Both safe havens bid simultaneously. This is a CRISIS signal, not normal.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#FFB300]">BONDS + EQUITIES BOTH FALLING</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Stagflation or liquidity crisis. The traditional 60/40 portfolio fails. Cash and Gold are the only winners.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#26A69A]">OIL RISING + EQUITIES FALLING</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Supply shock inflation. Growth threat + inflation pressure. Central banks are stuck between two mandates.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">THE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">When normal relationships break, something unusual is happening. These are the moments to REDUCE risk and INCREASE analysis.</span></p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p><h2 className="text-2xl font-extrabold mb-4">4 Intermarket Errors</h2><div className="space-y-3">{commonMistakes.map((item, i) => (<div key={i}><button onClick={() => toggle(`cm-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`cm-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`cm-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-xs text-red-400 mb-2">&#10060; {item.mistake}</p><p className="text-xs text-green-400">&#10004; {item.fix}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Cheat Sheet</p><h2 className="text-2xl font-extrabold mb-4">Intermarket Quick Reference</h2><div className="p-6 rounded-2xl glass-card space-y-3"><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#3b82f6]">BONDS LEAD</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">If yields are falling while equities are still rising, the bond market is warning you. Listen. 3-6 month lead.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#f59e0b]">GOLD = ANTI-DOLLAR</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Check DXY before every Gold trade. Exception: Gold + USD both up = crisis. This is the fear signal.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">OIL = INFLATION FUEL</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Oil above $90 = watch for hot CPI. Oil flows through to CAD, NOK, and headline inflation within 1-2 months.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#26A69A]">4-MARKET CHECK</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Bonds + Equities + Commodities + Dollar. When 3 of 4 agree, conviction is high. When they conflict, reduce size.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">THE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Markets are a connected system. Trading one without watching the others is flying blind. Intermarket context = macro conviction.</span></p></div></div></motion.div></section>

      {/* S10 — Game */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Test Your Understanding</p><h2 className="text-2xl font-extrabold mb-2">Intermarket Regime Game</h2><p className="text-gray-400 text-sm mb-6">5 scenario-based rounds. Read the intermarket signals, identify the regime, make the call.</p>
      <div className="p-6 rounded-2xl glass-card"><div className="flex items-center justify-between mb-4"><span className="text-xs font-bold text-amber-400">Round {gameRound + 1} of {gameRounds.length}</span><span className="text-xs font-mono text-gray-500">{gameScore}/{gameRounds.length} correct</span></div><p className="text-sm text-gray-300 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: gameRounds[gameRound].scenario }} /><div className="space-y-2">{gameRounds[gameRound].options.map((opt, oi) => { const answered = gameAnswers[gameRound] !== null; const selected = gameAnswers[gameRound] === oi; const isCorrect = opt.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return (<div key={oi}><button onClick={() => handleGameAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt.text }} /></button>{answered && selected && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]"><p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`} dangerouslySetInnerHTML={{ __html: opt.explain }} /></motion.div>)}</div>); })}</div>{gameAnswers[gameRound] !== null && gameRound < gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5"><button onClick={() => setGameRound(r => r + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button></motion.div>)}{gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Outstanding — you can read intermarket signals like a macro strategist.' : gameScore >= 3 ? 'Good — review the bond-equity divergence and the stagflation scenario.' : 'Re-read the rotation sequence and the 4 market connections before proceeding.'}</p></motion.div>)}</div></motion.div></section>

      {/* S11 — Quiz + Certificate */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Knowledge Check</p><h2 className="text-2xl font-extrabold mb-6">Final Quiz &mdash; 8 Questions</h2>
      <div className="space-y-6">{quizQuestions.map((q, qi) => (<div key={qi} className="p-5 rounded-2xl glass-card"><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p><p className="text-sm font-semibold text-white mb-4">{q.q}</p><div className="space-y-2">{q.opts.map((opt, oi) => { const answered = quizAnswers[qi] !== null; const selected = quizAnswers[qi] === oi; const isCorrect = oi === q.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return <button key={oi} onClick={() => handleQuizAnswer(qi, oi)} disabled={answered} className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`}>{opt}</button>; })}</div>{quizAnswers[qi] !== null && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg bg-white/[0.02]"><p className="text-xs text-amber-400" dangerouslySetInnerHTML={{ __html: `<span class="font-bold">&#9989;</span> ${q.explain}` }} /></motion.div>)}</div>))}</div>
      {quizDone && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center"><p className="text-3xl font-extrabold mb-2">{quizScoreVal}%</p><p className="text-sm text-gray-400">{quizScoreVal >= 66 ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate. Review and try again.'}</p></motion.div>)}
      {certUnlocked && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10"><div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}><div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(139,92,246,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} /><div className="relative z-10 text-center"><div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">🌐</div><p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p><p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 8: Commodities, Bonds &amp; Intermarket Analysis</strong><br />at ATLAS Academy by Interakktive</p><p className="bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Intermarket Analyst &mdash;</p><p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L8.9-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p></div></div></motion.div>)}</motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-20 text-center"><Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">&larr; Back to Academy</Link></section>
    </div>
  );
}
