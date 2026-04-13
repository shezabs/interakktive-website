// app/academy/lesson/gdp-pmi-leading-indicators/page.tsx
// ATLAS Academy — Lesson 8.6: GDP, PMI & Leading Indicators [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 8
// GROUNDBREAKING: Economic Health Dashboard — 6 inputs, regime classification
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
// ANIMATION 1: Economic Cycle Wheel — 4 phases with indicators
// ============================================================
function EconomicCycleAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.002; const cx = w / 2; const cy = h / 2 + 5;
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('The Economic Cycle — Where Are We Now?', cx, 16);
    const R = Math.min(w * 0.32, h * 0.35);
    const phases = [
      { name: 'EXPANSION', angle: -Math.PI / 4, color: '#26A69A', emoji: '📈', indicators: 'GDP↑ PMI>50 Jobs↑', trading: 'Risk-on: Equities↑ USD mixed' },
      { name: 'PEAK', angle: Math.PI / 4, color: '#FFB300', emoji: '⚠️', indicators: 'GDP flat PMI↓ Inflation↑', trading: 'Caution: Rates peak, volatility rises' },
      { name: 'CONTRACTION', angle: 3 * Math.PI / 4, color: '#EF5350', emoji: '📉', indicators: 'GDP↓ PMI<50 Jobs↓', trading: 'Risk-off: Gold↑ Bonds↑ USD↑' },
      { name: 'TROUGH', angle: 5 * Math.PI / 4, color: '#8b5cf6', emoji: '🔄', indicators: 'GDP bottoming PMI recovering', trading: 'Recovery plays: Equities bottom' },
    ];
    const activeIdx = Math.floor((t % 16) / 4) % 4;
    // Circle
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 30; ctx.stroke();
    // Phase arcs
    phases.forEach((phase, i) => {
      const startA = phase.angle - Math.PI / 4; const endA = phase.angle + Math.PI / 4;
      const isActive = i === activeIdx;
      ctx.beginPath(); ctx.arc(cx, cy, R, startA, endA);
      ctx.strokeStyle = isActive ? phase.color + '60' : phase.color + '15'; ctx.lineWidth = isActive ? 32 : 28; ctx.stroke();
    });
    // Arrow showing rotation
    const arrowAngle = -Math.PI / 2 + (t % 16) / 16 * Math.PI * 2;
    const ax = cx + Math.cos(arrowAngle) * (R + 22); const ay = cy + Math.sin(arrowAngle) * (R + 22);
    ctx.beginPath(); ctx.arc(ax, ay, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b80'; ctx.fill();
    // Phase labels + info
    phases.forEach((phase, i) => {
      const px = cx + Math.cos(phase.angle) * (R * 0.55); const py = cy + Math.sin(phase.angle) * (R * 0.55);
      const isActive = i === activeIdx;
      ctx.textAlign = 'center';
      ctx.font = `${isActive ? 16 : 12}px system-ui`; ctx.fillText(phase.emoji, px, py - 4);
      ctx.fillStyle = isActive ? phase.color : 'rgba(255,255,255,0.15)';
      ctx.font = `${isActive ? 'bold 8' : '7'}px system-ui`; ctx.fillText(phase.name, px, py + 12);
      if (isActive) {
        ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '7px system-ui';
        ctx.fillText(phase.indicators, px, py + 24);
        ctx.fillStyle = phase.color + '80'; ctx.font = '6px system-ui';
        ctx.fillText(phase.trading, px, py + 36);
      }
    });
    ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.font = '7px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('The cycle repeats every 5–10 years — knowing where you are changes everything', cx, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 2: PMI 50-Line Threshold — gauge with history
// ============================================================
function PMIThresholdAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.003; const cx = w / 2;
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('PMI: The 50-Line That Predicts Recessions', cx, 16);
    const readings = [52.8, 53.1, 51.5, 50.2, 49.8, 48.5, 47.2, 46.1, 45.8, 47.0, 48.5, 49.8, 51.2, 52.5, 53.8, 54.2, 53.5, 52.0, 50.8, 49.5];
    const chartL = 40; const chartR = w - 20; const chartW = chartR - chartL;
    const chartT = 40; const chartB = h - 35; const chartH = chartB - chartT;
    const minV = 44; const maxV = 56; const rangeV = maxV - minV;
    // 50 line
    const fiftyY = chartT + ((maxV - 50) / rangeV) * chartH;
    ctx.strokeStyle = '#FFB30040'; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(chartL, fiftyY); ctx.lineTo(chartR, fiftyY); ctx.stroke(); ctx.setLineDash([]);
    // Zone fills
    ctx.fillStyle = '#26A69A08'; ctx.fillRect(chartL, chartT, chartW, fiftyY - chartT);
    ctx.fillStyle = '#EF535008'; ctx.fillRect(chartL, fiftyY, chartW, chartB - fiftyY);
    // Zone labels
    ctx.fillStyle = '#26A69A40'; ctx.font = 'bold 9px system-ui'; ctx.textAlign = 'left';
    ctx.fillText('EXPANSION', chartL + 5, chartT + 15);
    ctx.fillStyle = '#EF535040'; ctx.fillText('CONTRACTION', chartL + 5, chartB - 5);
    ctx.fillStyle = '#FFB300'; ctx.font = 'bold 8px system-ui'; ctx.textAlign = 'right';
    ctx.fillText('50.0', chartL - 5, fiftyY + 3);
    // Animated line
    const visibleCount = Math.min(readings.length, Math.floor((t % 10) / 10 * readings.length * 1.5));
    ctx.beginPath(); ctx.lineWidth = 2;
    for (let i = 0; i <= Math.min(visibleCount, readings.length - 1); i++) {
      const x = chartL + (i / (readings.length - 1)) * chartW;
      const y = chartT + ((maxV - readings[i]) / rangeV) * chartH;
      const aboveFifty = readings[i] >= 50;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      // Dot
      if (i === visibleCount || i === readings.length - 1) {
        ctx.strokeStyle = aboveFifty ? '#26A69A' : '#EF5350'; ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = aboveFifty ? '#26A69A' : '#EF5350'; ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 9px system-ui'; ctx.textAlign = 'center';
        ctx.fillText(readings[i].toFixed(1), x, y - 10);
      }
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.stroke();
    // Recession marker
    const recStart = chartL + (4 / (readings.length - 1)) * chartW;
    const recEnd = chartL + (8 / (readings.length - 1)) * chartW;
    if (visibleCount >= 5) {
      ctx.fillStyle = '#EF535010'; ctx.fillRect(recStart, chartT, recEnd - recStart, chartH);
      ctx.fillStyle = '#EF5350'; ctx.font = 'bold 7px system-ui'; ctx.textAlign = 'center';
      ctx.fillText('RECESSION', (recStart + recEnd) / 2, chartT + 30);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.font = '7px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('PMI below 50 for 3+ months has predicted every recession since 1970', cx, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ECONOMIC HEALTH DASHBOARD DATA
// ============================================================
interface DashboardInput { key: string; label: string; options: { value: string; label: string; score: number }[]; }
const dashboardInputs: DashboardInput[] = [
  { key: 'gdp', label: 'GDP Growth (QoQ)', options: [{ value: 'strong', label: '> 2.5%', score: 3 }, { value: 'moderate', label: '1.0–2.5%', score: 2 }, { value: 'weak', label: '0–1.0%', score: 1 }, { value: 'negative', label: '< 0%', score: 0 }] },
  { key: 'pmi', label: 'Manufacturing PMI', options: [{ value: 'strong', label: '> 55', score: 3 }, { value: 'expanding', label: '50–55', score: 2 }, { value: 'contracting', label: '45–50', score: 1 }, { value: 'deep', label: '< 45', score: 0 }] },
  { key: 'unemployment', label: 'Unemployment Trend', options: [{ value: 'falling', label: 'Falling', score: 3 }, { value: 'stable', label: 'Stable', score: 2 }, { value: 'rising', label: 'Rising slowly', score: 1 }, { value: 'spiking', label: 'Rising fast', score: 0 }] },
  { key: 'inflation', label: 'CPI Trend', options: [{ value: 'target', label: 'Near 2% target', score: 3 }, { value: 'falling', label: 'Above target but falling', score: 2 }, { value: 'sticky', label: 'Sticky / sideways', score: 1 }, { value: 'rising', label: 'Rising / accelerating', score: 0 }] },
  { key: 'retail', label: 'Retail Sales Trend', options: [{ value: 'strong', label: 'Growing > 0.5% MoM', score: 3 }, { value: 'moderate', label: 'Growing 0–0.5%', score: 2 }, { value: 'flat', label: 'Flat / stagnant', score: 1 }, { value: 'declining', label: 'Declining', score: 0 }] },
  { key: 'confidence', label: 'Consumer Confidence', options: [{ value: 'high', label: 'Above average', score: 3 }, { value: 'normal', label: 'Average', score: 2 }, { value: 'low', label: 'Below average', score: 1 }, { value: 'crisis', label: 'Crisis levels', score: 0 }] },
];

const getRegime = (score: number): { regime: string; color: string; description: string; trading: string } => {
  if (score >= 15) return { regime: 'STRONG GROWTH', color: '#26A69A', description: 'Economy firing on all cylinders. GDP strong, PMI expanding, jobs growing, consumers spending. This is the middle of an expansion cycle.', trading: 'Risk-on environment. Equities favoured. USD direction depends on rate expectations — strong economy = hawkish Fed = USD strength. Gold underperforms. Commodity currencies (AUD, CAD) benefit.' };
  if (score >= 11) return { regime: 'MODERATE GROWTH', color: '#3b82f6', description: 'Economy growing but not booming. Some indicators strong, others softening. The "Goldilocks" zone where the Fed can be patient.', trading: 'Most tradeable environment. Technicals work well because there are no macro shocks. Trade your SMC setups with full conviction. Calendar awareness still required but event risk is lower.' };
  if (score >= 7) return { regime: 'STAGNATION', color: '#FFB300', description: 'Growth stalling. PMI near 50. Consumer confidence dipping. The economy is at an inflection point — could recover or tip into recession.', trading: 'Reduce conviction. Mixed signals = choppy markets. Focus on shorter timeframes. Rate expectations swing with each data release. VIX likely elevated. Reduce position sizes 25-50%.' };
  if (score >= 4) return { regime: 'RECESSION RISK', color: '#EF5350', description: 'Multiple indicators flashing red. PMI below 50. GDP weak or negative. Unemployment rising. Consumer confidence falling. The market is pricing in a downturn.', trading: 'Risk-off dominance. Gold rallies. Bonds rally. USD strengthens (safe haven). Equities under pressure. Rate cut expectations surge. Trade with the defensive flow, not against it.' };
  return { regime: 'DEEP RECESSION', color: '#EF5350', description: 'All indicators in distress. GDP contracting. PMI well below 50. Unemployment spiking. Confidence at crisis levels. The economy is in a confirmed downturn.', trading: 'Extreme risk-off. Capital flees to USD, JPY, CHF, Gold, Government bonds. Equities in bear market. Central banks cutting aggressively. Massive trends form — trade WITH the macro, not against it.' };
};

// ============================================================
// CONTENT DATA
// ============================================================
const indicatorDeep = [
  { title: '📈 GDP (Gross Domestic Product)', desc: '<strong>What:</strong> Total value of all goods and services produced. THE big picture health check.<br/><br/><strong>Release:</strong> Quarterly (advance, preliminary, final). Advance is most impactful.<br/><strong>Lag:</strong> 1-3 months after the quarter ends. GDP tells you where the economy WAS, not where it IS.<br/><br/><strong>Trading impact:</strong> Lower than CPI or NFP intraday. But GDP TRENDS drive multi-month positioning. Two consecutive negative GDP quarters = technical recession = massive regime shift.<br/><br/><strong>The trap:</strong> A single strong GDP print in a weakening trend doesn’t reverse the trend. Similarly, one weak print during expansion doesn’t signal recession. Look at the direction over 3-4 quarters.' },
  { title: '🏭 PMI (Purchasing Managers’ Index)', desc: '<strong>What:</strong> Monthly survey of purchasing managers. Above 50 = expansion. Below 50 = contraction.<br/><br/><strong>Why it’s the BEST leading indicator:</strong> PMI surveys FORWARD-looking intentions (new orders, hiring plans, inventory levels). GDP tells you the past. PMI tells you the NEXT 3-6 months.<br/><br/><strong>ISM Manufacturing vs Services:</strong> Manufacturing PMI gets more attention, but Services PMI matters more for the US (services = 80% of GDP). When BOTH are below 50, recession is almost certain.<br/><br/><strong>The 50 line:</strong> Not just a threshold — it’s a psychological barrier. The first print below 50 after a long expansion causes a disproportionate market reaction. The DIRECTION of change matters more than the absolute level.' },
  { title: '📊 Jobless Claims (Weekly)', desc: '<strong>What:</strong> Weekly count of new unemployment insurance claims. Released every Thursday.<br/><br/><strong>Why weekly matters:</strong> In a world of monthly data, weekly claims are the highest-frequency economic pulse. Rising claims = labour market weakening. Falling claims = market tightening.<br/><br/><strong>The 4-week average:</strong> Single weeks are noisy (holidays, seasonal). The 4-week moving average smooths this and is what the market actually trades.<br/><br/><strong>Threshold:</strong> Claims below 220K = extremely tight. Above 250K = softening. Above 300K = recession territory. But the TREND matters more than any single reading.' },
  { title: '🛒 Retail Sales & Consumer Confidence', desc: '<strong>Retail Sales:</strong> Monthly measure of consumer spending. Consumer spending = 70% of US GDP. When consumers stop spending, the economy contracts.<br/><br/><strong>Consumer Confidence:</strong> Survey measuring how optimistic consumers feel about the economy. Leading indicator because sentiment drives spending decisions.<br/><br/><strong>The link:</strong> Falling confidence → reduced spending → lower retail sales → lower GDP → rate cuts. The chain takes 2-4 months to play out. You can see it coming from the confidence data.<br/><br/><strong>The contrarian signal:</strong> Extreme confidence readings (very high or very low) often mark cycle turning points. Maximum optimism = top. Maximum pessimism = bottom.' },
];

const leadingVsLagging = [
  { type: 'LEADING', indicators: 'PMI, Yield Curve, Consumer Confidence, Building Permits, Stock Market', color: '#26A69A', desc: 'Tell you where the economy is GOING. Trade these for positioning.' },
  { type: 'COINCIDENT', indicators: 'GDP, Industrial Production, Retail Sales, Employment', color: '#FFB300', desc: 'Tell you where the economy IS NOW. Confirm the leading signals.' },
  { type: 'LAGGING', indicators: 'Unemployment Rate, CPI, Corporate Profits, Bank Lending', color: '#EF5350', desc: 'Tell you where the economy WAS. Confirm the trend is established.' },
];

const commonMistakes = [
  { title: 'Treating GDP as a Trading Trigger', mistake: 'GDP comes in at +2.8% vs +2.5% forecast. You go long USD. The move is 15 pips. You expected NFP-like volatility.', fix: 'GDP is a trend indicator, not a trading trigger. It has lower intraday impact than CPI or NFP. Use GDP to set multi-week bias, not intraday entries.' },
  { title: 'Ignoring PMI Because It’s a Survey', mistake: '“It’s just opinions, not real data.” PMI has predicted every recession since 1970. It’s the most reliable leading indicator in existence.', fix: 'PMI surveys INTENTIONS. Purchasing managers decide future orders, hiring, and inventory before the economy moves. Their “opinions” become reality 3-6 months later.' },
  { title: 'Single-Point Analysis', mistake: 'PMI drops from 52.1 to 51.8. “Economy is weakening!” One reading drop within expansion territory is noise, not signal.', fix: 'DIRECTION over 3+ months matters. 54 → 52 → 51 → 50 is a trend. 52.1 → 51.8 is a rounding error. Don’t trade noise.' },
  { title: 'Not Connecting the Indicators', mistake: 'You check PMI in isolation. You check GDP in isolation. You never ask “what do they say TOGETHER?”', fix: 'The Economic Health Dashboard approach: check 4-6 indicators together. When they align, conviction is high. When they conflict, reduce exposure.' },
];

const quizQuestions = [
  { q: 'PMI prints at 49.2 after 3 months of decline (52.1 → 51.0 → 50.1 → 49.2). This signals:', opts: ['Normal fluctuation', 'A confirmed shift from expansion to contraction — the economy is likely heading toward recession', 'Temporary dip — will bounce', 'Only matters for manufacturing'], correct: 1, explain: '4 consecutive declining readings crossing below 50 is one of the strongest recession signals in economics. The direction + the 50-line cross = regime change. This shifts the macro bias from risk-on to risk-off.' },
  { q: 'GDP is the most important economic indicator because:', opts: ['It moves markets the most intraday', 'It’s the comprehensive health check of the entire economy — but it’s LAGGING, so use PMI for forward-looking signals', 'It predicts recessions', 'It’s released weekly'], correct: 1, explain: 'GDP is the definitive economic scorecard but it’s backwards-looking (1-3 month lag). For trading, use GDP for trend context and PMI for direction. GDP confirms what PMI predicted months earlier.' },
  { q: 'The yield curve inverts (short-term rates > long-term rates). This is significant because:', opts: ['It’s a technical indicator for bonds', 'Inversion has preceded every US recession in the last 50 years — it signals the bond market expects economic deterioration', 'It means rates are rising', 'It only affects bond traders'], correct: 1, explain: 'Yield curve inversion means the bond market expects the economy to weaken enough that the Fed will need to cut rates dramatically. It’s predicted every recession with a 12-18 month lead time.' },
  { q: 'PMI above 50 but falling (54 → 53 → 52 → 51). The economy is:', opts: ['In recession', 'Still expanding but decelerating — the rate of growth is slowing, which is a warning sign', 'Healthy — above 50 means expansion', 'Contracting'], correct: 1, explain: 'Above 50 = still expanding. But the declining DIRECTION signals deceleration. If this trend continues, it crosses 50 within 2-3 months. Smart money positions for the slowdown before it arrives.' },
  { q: 'Jobless Claims 4-week average rises from 210K to 280K over 2 months. This tells you:', opts: ['Nothing — claims are noisy', 'The labour market is deteriorating significantly — companies are laying off workers at an increasing rate', 'Seasonal adjustment', 'Only matters if it crosses 300K'], correct: 1, explain: 'A 70K rise in the 4-week average is a major deterioration signal. This rate of change is what preceded the 2008 and 2020 recessions. The trend matters more than any absolute threshold.' },
  { q: 'Consumer Confidence hits a 10-year high. This is:', opts: ['Purely bullish — confident consumers spend more', 'Potentially contrarian — extreme confidence readings often mark cycle peaks, not the start of more growth', 'Irrelevant to trading', 'A lagging indicator'], correct: 1, explain: 'Extreme confidence readings are contrarian indicators. Maximum optimism often coincides with cycle peaks because everyone is already invested/spending. When confidence has nowhere to go but down, the economy usually follows.' },
  { q: 'GDP: +2.8%. PMI: 48.5. Unemployment: rising. Retail: flat. These indicators are:', opts: ['All bullish — GDP is strong', 'Conflicting — GDP is lagging and shows the past. PMI, unemployment, and retail are pointing to a slowdown the GDP hasn’t captured yet.', 'Impossible to read together', 'The GDP reading overrides everything else'], correct: 1, explain: 'GDP is backward-looking. PMI, unemployment trends, and retail are more current. When leading indicators diverge from lagging ones, the leading indicators are usually right. The economy is likely already slowing despite the strong GDP headline.' },
  { q: 'Which indicator best predicts the economy 3-6 months from now?', opts: ['GDP', 'PMI — it surveys future intentions of purchasing managers, making it the best forward-looking indicator', 'Unemployment rate', 'CPI'], correct: 1, explain: 'PMI surveys ask about NEW orders, hiring plans, and inventory intentions. These are decisions that play out over the next quarter. GDP tells you what already happened. PMI tells you what’s coming.' },
];

const gameRounds = [
  { scenario: '<strong>Economic data this month:</strong> GDP: +0.3% (weak). PMI: 48.2 (contraction). Unemployment: rising from 3.8% to 4.1%. Retail Sales: -0.2% (declining). Consumer Confidence: below average. Your current bias is risk-on with equity longs.', options: [
    { text: 'Hold equities — GDP is still positive.', correct: false, explain: '✗ GDP is positive but barely. EVERY other indicator is flashing red: PMI contracting, unemployment rising, retail declining, confidence dropping. GDP is the lagging indicator here — it hasn’t caught up yet.' },
    { text: 'Shift to risk-off. Close equity longs. Look for Gold longs and defensive positions. Multiple indicators confirm economic deterioration.', correct: true, explain: '✓ When 4 out of 5 indicators point to weakness, the fifth (GDP) is likely the one that’s wrong — or rather, behind. Risk-off positioning: Gold, bonds, USD, JPY. Close equity longs.' },
    { text: 'Wait for next month’s data to confirm.', correct: false, explain: '✗ By next month, the move has already happened. The market is forward-looking and is repricing NOW based on these readings. Waiting for confirmation means entering after the bulk of the move.' },
  ]},
  { scenario: '<strong>PMI drops from 50.2 to 49.8.</strong> First sub-50 reading in 18 months. GDP was +2.1% last quarter. Market is pricing in 2 rate cuts this year. Headlines: “Economy enters contraction.”', options: [
    { text: 'Panic sell equities and go full risk-off.', correct: false, explain: '✗ One reading at 49.8 is ON the line, not deep contraction. GDP is still positive. Headlines are sensationalist. This is a WARNING, not a confirmed regime change. Need 2-3 months below 50 to confirm.' },
    { text: 'Note the warning but don’t overreact. Reduce equity exposure 25%. Watch next 2 PMI prints closely. If 49 → 48 → 47, THEN shift to risk-off.', correct: true, explain: '✓ One print below 50 is a signal, not a sentence. The DIRECTION matters — if it continues declining, the recession signal is confirmed. Reduce exposure now, prepare to shift fully if the trend continues.' },
    { text: 'Ignore it — GDP was strong last quarter.', correct: false, explain: '✗ GDP is 1-3 months behind PMI. PMI’s first sub-50 reading preceded every recession. You can’t ignore it — but you also shouldn’t overreact to a single print.' },
  ]},
  { scenario: '<strong>Weekly Jobless Claims:</strong> 4-week average has risen from 215K to 265K over the past 6 weeks. No single spike — a steady grind higher. Markets haven’t reacted much yet. Your EUR/USD is flat.', options: [
    { text: 'No action — claims are noisy and 265K is still historically low.', correct: false, explain: '✗ The TREND is the signal. A 50K rise in 6 weeks is significant and steady — not a noisy spike. This is the pattern that preceded major slowdowns. The market is complacent; you shouldn’t be.' },
    { text: 'Start building a USD-bearish bias. Rising claims = weakening labour = dovish Fed = eventual USD weakness. Don’t position aggressively yet — wait for NFP/CPI to confirm.', correct: true, explain: '✓ Claims are the early warning. The market will catch up when NFP or CPI confirms the weakness. Position your BIAS, not your TRADE yet. When the next NFP misses, you’ll be prepared while others are surprised.' },
    { text: 'Go all-in long EUR/USD now before the market catches on.', correct: false, explain: '✗ Right thesis, wrong sizing. Claims are a leading indicator but the market prices in CONFIRMED data (NFP, CPI). Build the bias. Size up AFTER confirmation.' },
  ]},
  { scenario: '<strong>Recovery signals appearing:</strong> PMI: 47.2 → 48.5 → 49.8 (3 months of recovery, approaching 50). Jobless Claims declining for 4 consecutive weeks. GDP still negative from last quarter. Consumer Confidence ticking up.', options: [
    { text: 'Stay risk-off — GDP is still negative.', correct: false, explain: '✗ GDP is backward-looking. PMI approaching 50 from below, declining claims, and rising confidence are FORWARD-looking signals that the worst is over. GDP will catch up 1-2 quarters later.' },
    { text: 'Start transitioning to risk-on. Leading indicators are turning. The bottom is likely in. Begin building equity longs and reducing Gold/bond positions.', correct: true, explain: '✓ When leading indicators align upward (PMI recovering, claims falling, confidence rising), the cycle is turning. This is where the best risk-reward entries exist — before GDP confirms and everyone else piles in.' },
    { text: 'Wait for GDP to turn positive first.', correct: false, explain: '✗ By the time GDP confirms the recovery, equities have already rallied 15-20%. The leading indicators are giving you a 2-3 month head start. Use it.' },
  ]},
  { scenario: '<strong>All indicators strong:</strong> GDP: +3.1%. PMI: 55.2. Unemployment: 3.5% (falling). Retail: +0.8% (growing). Confidence: 10-year high. Your portfolio is long equities and short Gold. It’s been working for months.', options: [
    { text: 'Add more — everything is bullish.', correct: false, explain: '✗ When ALL indicators are at extremes AND confidence is at a 10-year high, you’re likely near a cycle peak. Maximum consensus = maximum complacency. This is when to TIGHTEN stops, not add exposure.' },
    { text: 'Maintain positions but tighten stops. Extreme readings in ALL indicators + peak confidence often signals a cycle top. Don’t add, don’t cut — just protect.', correct: true, explain: '✓ The trend is your friend until it bends. Extreme readings are unsustainable. You don’t need to predict the top, but you do need to protect when everything looks “perfect.” Tighten stops. Take partials. Watch PMI for the first downtick.' },
    { text: 'Close everything and go to cash — the top must be near.', correct: false, explain: '✗ Timing the exact top is impossible and expensive. Markets can stay at extremes longer than you expect. Stay in the trade but protect aggressively. Exit when INDICATORS turn, not when you FEEL they should.' },
  ]},
];

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function GDPPMIPage() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setOpenSections(p => ({ ...p, [id]: !p[id] }));

  // Economic Health Dashboard
  const [dashValues, setDashValues] = useState<Record<string, string>>({});
  const [dashGenerated, setDashGenerated] = useState(false);
  const allFilled = dashboardInputs.every(d => dashValues[d.key]);
  const totalScore = dashboardInputs.reduce<number>((sum, d) => { const opt = d.options.find(o => o.value === dashValues[d.key]); return sum + (opt?.score || 0); }, 0);
  const regime = getRegime(totalScore);

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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 8 &middot; Lesson 6</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">GDP, PMI &amp;<br /><span className="bg-gradient-to-r from-amber-400 via-red-400 to-purple-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Leading Indicators</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">GDP tells you where the economy was. PMI tells you where it’s going. Learn to read the cycle before the market reads it for you.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* S00 */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">🚗 The Dashboard vs the Rearview Mirror</p>
            <p className="text-gray-400 leading-relaxed mb-4">GDP is the <strong className="text-amber-400">rearview mirror</strong>. It tells you where the economy has been with a 1-3 month delay. PMI is the <strong className="text-white">windshield</strong>. It shows you what’s coming in the next 3-6 months based on what businesses are actually planning to do.</p>
            <p className="text-gray-400 leading-relaxed">Most traders stare at the rearview mirror. <strong className="text-white">Winners look through the windshield.</strong></p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">Q3 2023: GDP printed +4.9% (exceptional). Headlines: <strong className="text-green-400">“Economy booming!”</strong> But PMI had been declining for 4 months. By Q1 2024, GDP slowed to +1.6%. <strong className="text-white">PMI saw it 6 months before GDP confirmed it.</strong> Traders who watched PMI repositioned early. Those who watched GDP got caught.</p>
          </div>
        </motion.div>
      </section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Economic Cycle</p><h2 className="text-2xl font-extrabold mb-4">Expansion → Peak → Contraction → Trough</h2><p className="text-gray-400 text-sm mb-6">Every economy cycles through 4 phases. Knowing where you are changes everything.</p><EconomicCycleAnimation /></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The PMI 50-Line</p><h2 className="text-2xl font-extrabold mb-4">The Recession Predictor</h2><p className="text-gray-400 text-sm mb-6">Below 50 for 3+ months has predicted every recession since 1970.</p><PMIThresholdAnimation /></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The Indicators Decoded</p><h2 className="text-2xl font-extrabold mb-4">GDP, PMI, Claims, Retail &amp; Confidence</h2><div className="space-y-3">{indicatorDeep.map((item, i) => (<div key={i}><button onClick={() => toggle(`ind-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`ind-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`ind-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.desc }} /></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Leading vs Lagging</p><h2 className="text-2xl font-extrabold mb-4">Timing Is Everything</h2><div className="p-6 rounded-2xl glass-card space-y-3">{leadingVsLagging.map(item => (<div key={item.type} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-xs font-bold mb-1" style={{ color: item.color }}>{item.type}</p><p className="text-[11px] text-gray-300 mb-1">{item.indicators}</p><p className="text-[11px] text-gray-500">{item.desc}</p></div>))}</div></motion.div></section>

      {/* S05 — GROUNDBREAKING: Economic Health Dashboard */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Interactive Challenge</p><h2 className="text-2xl font-extrabold mb-2">Economic Health Dashboard</h2><p className="text-gray-400 text-sm mb-6">Input the latest readings for 6 key indicators. Get a regime classification with trading implications.</p>
      <div className="p-6 rounded-2xl glass-card space-y-4">
        {!dashGenerated ? (<><div className="space-y-3">{dashboardInputs.map(input => (<div key={input.key}><p className="text-xs font-bold text-gray-300 mb-1.5">{input.label}</p><div className="flex flex-wrap gap-1.5">{input.options.map(opt => (<button key={opt.value} onClick={() => setDashValues(p => ({ ...p, [input.key]: opt.value }))} className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${dashValues[input.key] === opt.value ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400' : 'bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:bg-white/[0.07]'}`}>{opt.label}</button>))}</div></div>))}</div>
        {allFilled && (<button onClick={() => setDashGenerated(true)} className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95">Analyse Economy &rarr;</button>)}
        {!allFilled && (<p className="text-xs text-gray-600 text-center">Select a reading for each indicator to generate your analysis.</p>)}</>) : (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="p-5 rounded-xl text-center" style={{ background: regime.color + '10', border: `1px solid ${regime.color}30` }}><p className="text-2xl font-extrabold" style={{ color: regime.color }}>{regime.regime}</p><p className="text-xs text-gray-400 mt-1">Economic Health Score: {totalScore}/18</p></div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-[10px] font-bold text-gray-300 mb-1">ECONOMIC ASSESSMENT</p><p className="text-xs text-gray-400 leading-relaxed">{regime.description}</p></div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15"><p className="text-[10px] font-bold text-amber-400 mb-1">TRADING IMPLICATIONS</p><p className="text-xs text-gray-400 leading-relaxed">{regime.trading}</p></div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-[10px] font-bold text-gray-300 mb-2">YOUR INPUTS</p><div className="grid grid-cols-3 gap-1.5">{dashboardInputs.map(d => { const opt = d.options.find(o => o.value === dashValues[d.key]); return (<div key={d.key} className="p-1.5 rounded-lg bg-white/[0.02]"><p className="text-[9px] text-gray-600">{d.label}</p><p className="text-[10px] font-semibold text-gray-300">{opt?.label}</p></div>); })}</div></div>
          <button onClick={() => { setDashGenerated(false); setDashValues({}); }} className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-semibold text-gray-300 hover:bg-white/[0.07]">&larr; Try Different Inputs</button>
        </motion.div>)}
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; The Yield Curve Signal</p><h2 className="text-2xl font-extrabold mb-4">The Bond Market’s Recession Alarm</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#26A69A]">NORMAL CURVE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Long-term rates &gt; short-term. Economy healthy. Banks lend freely. Growth expected.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#FFB300]">FLAT CURVE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Long-term ≈ short-term. Uncertainty. The market can’t decide if growth continues or slows.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">INVERTED CURVE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Short-term &gt; long-term. Bond market expects recession. Has predicted EVERY US recession since 1970. 12-18 month lead time.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#a855f7]">UN-INVERSION</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">When an inverted curve normalises, the recession usually STARTS within 6 months. The warning light turning off is the danger signal.</span></p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Connecting the Dots</p><h2 className="text-2xl font-extrabold mb-4">How Indicators Flow Together</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">PMI ↓ (Leading)</strong> <span className="text-gray-500">→</span> <span className="text-gray-400">Confidence ↓ → Retail ↓ → Jobs ↓ → GDP ↓ (Lagging). Takes 3-6 months to cascade.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#26A69A]">PMI ↑ (Leading)</strong> <span className="text-gray-500">→</span> <span className="text-gray-400">Orders ↑ → Hiring ↑ → Wages ↑ → Spending ↑ → GDP ↑ (Lagging). Same chain, opposite direction.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#FFB300]">CLAIMS ↑ (Weekly)</strong> <span className="text-gray-500">→</span> <span className="text-gray-400">Early warning between PMI and NFP. Rising claims BEFORE NFP misses = you saw it first.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">THE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">When 4+ indicators align, conviction is high. When they conflict, reduce exposure. Never trade a single indicator in isolation.</span></p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p><h2 className="text-2xl font-extrabold mb-4">4 Macro Reading Errors</h2><div className="space-y-3">{commonMistakes.map((item, i) => (<div key={i}><button onClick={() => toggle(`cm-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`cm-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`cm-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-xs text-red-400 mb-2">&#10060; {item.mistake}</p><p className="text-xs text-green-400">&#10004; {item.fix}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Cheat Sheet</p><h2 className="text-2xl font-extrabold mb-4">Economic Indicators Quick Reference</h2><div className="p-6 rounded-2xl glass-card space-y-3"><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#26A69A]">PMI &gt; GDP</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">PMI predicts. GDP confirms. Always trade the leading indicator, not the lagging one.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">THE 50 LINE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">PMI below 50 for 3+ months = recession signal. Above 50 but falling = deceleration warning.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#FFB300]">TREND &gt; LEVEL</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Direction over 3 months matters more than any single reading. Don’t trade noise.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#a855f7]">YIELD CURVE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Inverted = recession coming (12-18 months). Un-inverting = recession starting (6 months).</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">THE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Check 4-6 indicators TOGETHER. Alignment = conviction. Conflict = reduce exposure. Never trade one number alone.</span></p></div></div></motion.div></section>

      {/* S10 — Game */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Test Your Understanding</p><h2 className="text-2xl font-extrabold mb-2">Economic Cycle Game</h2><p className="text-gray-400 text-sm mb-6">5 scenario-based rounds. Read the indicators, identify the regime, make the call.</p>
      <div className="p-6 rounded-2xl glass-card"><div className="flex items-center justify-between mb-4"><span className="text-xs font-bold text-amber-400">Round {gameRound + 1} of {gameRounds.length}</span><span className="text-xs font-mono text-gray-500">{gameScore}/{gameRounds.length} correct</span></div><p className="text-sm text-gray-300 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: gameRounds[gameRound].scenario }} /><div className="space-y-2">{gameRounds[gameRound].options.map((opt, oi) => { const answered = gameAnswers[gameRound] !== null; const selected = gameAnswers[gameRound] === oi; const isCorrect = opt.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return (<div key={oi}><button onClick={() => handleGameAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt.text }} /></button>{answered && selected && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]"><p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`} dangerouslySetInnerHTML={{ __html: opt.explain }} /></motion.div>)}</div>); })}</div>{gameAnswers[gameRound] !== null && gameRound < gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5"><button onClick={() => setGameRound(r => r + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button></motion.div>)}{gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Outstanding — you can read the economic cycle like a macro analyst.' : gameScore >= 3 ? 'Good — review the leading vs lagging distinction and the recovery signals.' : 'Re-read the cycle phases and the indicator cascade before proceeding.'}</p></motion.div>)}</div></motion.div></section>

      {/* S11 — Quiz + Certificate */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Knowledge Check</p><h2 className="text-2xl font-extrabold mb-6">Final Quiz &mdash; 8 Questions</h2>
      <div className="space-y-6">{quizQuestions.map((q, qi) => (<div key={qi} className="p-5 rounded-2xl glass-card"><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p><p className="text-sm font-semibold text-white mb-4">{q.q}</p><div className="space-y-2">{q.opts.map((opt, oi) => { const answered = quizAnswers[qi] !== null; const selected = quizAnswers[qi] === oi; const isCorrect = oi === q.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return <button key={oi} onClick={() => handleQuizAnswer(qi, oi)} disabled={answered} className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`}>{opt}</button>; })}</div>{quizAnswers[qi] !== null && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg bg-white/[0.02]"><p className="text-xs text-amber-400" dangerouslySetInnerHTML={{ __html: `<span class="font-bold">&#9989;</span> ${q.explain}` }} /></motion.div>)}</div>))}</div>
      {quizDone && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center"><p className="text-3xl font-extrabold mb-2">{quizScoreVal}%</p><p className="text-sm text-gray-400">{quizScoreVal >= 66 ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate. Review and try again.'}</p></motion.div>)}
      {certUnlocked && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10"><div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}><div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(139,92,246,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} /><div className="relative z-10 text-center"><div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">🔄</div><p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p><p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 8: GDP, PMI &amp; Leading Indicators</strong><br />at ATLAS Academy by Interakktive</p><p className="bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Cycle Navigator &mdash;</p><p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L8.6-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p></div></div></motion.div>)}</motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-20 text-center"><Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">&larr; Back to Academy</Link></section>
    </div>
  );
}
