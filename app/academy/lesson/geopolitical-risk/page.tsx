// app/academy/lesson/geopolitical-risk/page.tsx
// ATLAS Academy — Lesson 8.7: Geopolitical Risk & Black Swans [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 8
// GROUNDBREAKING: Risk Environment Scanner — 5 inputs, Risk-On/Off/Mixed classification
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
// ANIMATION 1: Risk-On vs Risk-Off Capital Flow Map
// ============================================================
function RiskFlowAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.003; const cx = w / 2;
    const isRiskOff = Math.floor(t / 8) % 2 === 1;
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
    ctx.fillText(isRiskOff ? 'RISK-OFF \u2014 Fear Drives Capital to Safety' : 'RISK-ON \u2014 Confidence Drives Capital to Growth', cx, 16);

    const center = { x: cx, y: h / 2 + 5, label: 'CAPITAL', color: '#f59e0b' };
    const assets = isRiskOff ? [
      { label: 'USD', dir: 'in', color: '#26A69A', x: 0.15, y: 0.3 },
      { label: 'JPY', dir: 'in', color: '#26A69A', x: 0.15, y: 0.7 },
      { label: 'GOLD', dir: 'in', color: '#26A69A', x: 0.85, y: 0.3 },
      { label: 'BONDS', dir: 'in', color: '#26A69A', x: 0.85, y: 0.7 },
      { label: 'EQUITIES', dir: 'out', color: '#EF5350', x: 0.35, y: 0.9 },
      { label: 'COMMODITIES', dir: 'out', color: '#EF5350', x: 0.65, y: 0.9 },
    ] : [
      { label: 'EQUITIES', dir: 'in', color: '#26A69A', x: 0.15, y: 0.3 },
      { label: 'COMMODITIES', dir: 'in', color: '#26A69A', x: 0.15, y: 0.7 },
      { label: 'AUD/NZD', dir: 'in', color: '#26A69A', x: 0.85, y: 0.3 },
      { label: 'EM CURRENCIES', dir: 'in', color: '#26A69A', x: 0.85, y: 0.7 },
      { label: 'USD', dir: 'out', color: '#EF5350', x: 0.35, y: 0.9 },
      { label: 'GOLD', dir: 'out', color: '#EF5350', x: 0.65, y: 0.9 },
    ];
    const progress = Math.min(1, (t % 8) / 5);
    const visibleCount = Math.floor(progress * 7);

    // Center node
    ctx.beginPath(); ctx.arc(center.x, center.y, 22, 0, Math.PI * 2);
    ctx.fillStyle = center.color + '15'; ctx.fill();
    ctx.strokeStyle = center.color + '50'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = center.color; ctx.font = 'bold 8px system-ui'; ctx.textAlign = 'center'; ctx.fillText(center.label, center.x, center.y + 3);

    assets.forEach((asset, i) => {
      if (i >= visibleCount) return;
      const ax = asset.x * w; const ay = asset.y * h;
      // Arrow line
      const fromX = asset.dir === 'in' ? ax : center.x; const fromY = asset.dir === 'in' ? ay : center.y;
      const toX = asset.dir === 'in' ? center.x : ax; const toY = asset.dir === 'in' ? center.y : ay;
      ctx.beginPath(); ctx.moveTo(fromX, fromY); ctx.lineTo(toX, toY);
      ctx.strokeStyle = asset.color + '40'; ctx.lineWidth = 1.5; ctx.stroke();
      // Arrowhead
      const angle = Math.atan2(toY - fromY, toX - fromX);
      const headLen = 8;
      ctx.beginPath(); ctx.moveTo(toX, toY);
      ctx.lineTo(toX - headLen * Math.cos(angle - 0.4), toY - headLen * Math.sin(angle - 0.4));
      ctx.lineTo(toX - headLen * Math.cos(angle + 0.4), toY - headLen * Math.sin(angle + 0.4));
      ctx.closePath(); ctx.fillStyle = asset.color + '60'; ctx.fill();
      // Moving particle
      const particleT = (t * 2 + i * 0.5) % 1;
      const px = fromX + (toX - fromX) * particleT; const py = fromY + (toY - fromY) * particleT;
      ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fillStyle = asset.color; ctx.fill();
      // Asset label
      ctx.beginPath(); ctx.arc(ax, ay, 16, 0, Math.PI * 2);
      ctx.fillStyle = asset.color + '10'; ctx.fill();
      ctx.strokeStyle = asset.color + '30'; ctx.lineWidth = 0.5; ctx.stroke();
      ctx.fillStyle = asset.color; ctx.font = 'bold 7px system-ui'; ctx.textAlign = 'center'; ctx.fillText(asset.label, ax, ay + 3);
      // Direction indicator
      ctx.fillStyle = asset.dir === 'in' ? '#26A69A' : '#EF5350'; ctx.font = 'bold 8px system-ui';
      ctx.fillText(asset.dir === 'in' ? '\u2191' : '\u2193', ax, ay - 14);
    });
    ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.font = '7px system-ui'; ctx.textAlign = 'center';
    ctx.fillText(isRiskOff ? 'Fear: Capital flows TO safety (USD, JPY, Gold, Bonds)' : 'Confidence: Capital flows TO growth (Equities, Commodities, EM)', cx, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={270} />;
}

// ============================================================
// ANIMATION 2: Black Swan Timeline — historical shocks
// ============================================================
function BlackSwanTimelineAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.002; const cx = w / 2;
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('Black Swans \u2014 Unpredictable, Devastating, Survivable', cx, 16);
    const events = [
      { year: '2001', name: '9/11', impact: 'Markets closed 4 days.\nDJIA -14% in 1 week.', recovery: '~2 months', color: '#EF5350' },
      { year: '2008', name: 'GFC', impact: 'S&P -57% peak to trough.\nLehman collapse.', recovery: '~4 years', color: '#EF5350' },
      { year: '2015', name: 'CHF Flash', impact: 'EUR/CHF -30% in minutes.\nBrokers bankrupt.', recovery: 'Permanent', color: '#a855f7' },
      { year: '2016', name: 'BREXIT', impact: 'GBP -12% overnight.\nLargest GBP drop ever.', recovery: '~6 months', color: '#FFB300' },
      { year: '2020', name: 'COVID', impact: 'S&P -34% in 23 days.\nOil went NEGATIVE.', recovery: '~5 months', color: '#EF5350' },
      { year: '2022', name: 'UKRAINE', impact: 'Oil +60%. Gas +400%.\nWheat +50%.', recovery: '~8 months', color: '#FFB300' },
      { year: '2023', name: 'SVB', impact: 'Bank run. 3 banks collapsed.\nFed emergency lending.', recovery: '~2 months', color: '#FFB300' },
    ];
    const pad = 15; const lineY = h / 2; const eventW = (w - pad * 2) / events.length;
    const activeIdx = Math.floor((t % 21) / 3) % 7;
    // Timeline line
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(pad, lineY); ctx.lineTo(w - pad, lineY); ctx.stroke();

    events.forEach((evt, i) => {
      const x = pad + (i + 0.5) * eventW; const isActive = i === activeIdx;
      // Dot
      ctx.beginPath(); ctx.arc(x, lineY, isActive ? 8 : 4, 0, Math.PI * 2);
      ctx.fillStyle = isActive ? evt.color + '40' : evt.color + '15'; ctx.fill();
      ctx.strokeStyle = isActive ? evt.color : evt.color + '30'; ctx.lineWidth = isActive ? 1.5 : 0.5; ctx.stroke();
      // Year
      ctx.fillStyle = isActive ? evt.color : 'rgba(255,255,255,0.2)'; ctx.font = `${isActive ? 'bold 9' : '7'}px system-ui`;
      ctx.textAlign = 'center'; ctx.fillText(evt.year, x, lineY + 20);
      // Name
      ctx.fillStyle = isActive ? '#ffffff' : 'rgba(255,255,255,0.1)'; ctx.font = `${isActive ? 'bold 8' : '7'}px system-ui`;
      ctx.fillText(evt.name, x, lineY - 16);
      if (isActive) {
        // Impact card above
        const cardY = 32; const cardH = lineY - 40;
        ctx.fillStyle = evt.color + '08'; ctx.beginPath(); ctx.roundRect(x - 45, cardY, 90, cardH, 6); ctx.fill();
        ctx.strokeStyle = evt.color + '30'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.roundRect(x - 45, cardY, 90, cardH, 6); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '7px system-ui';
        const lines = evt.impact.split('\n');
        lines.forEach((l, li) => ctx.fillText(l, x, cardY + 14 + li * 11));
        ctx.fillStyle = evt.color; ctx.font = 'bold 7px system-ui';
        ctx.fillText(`Recovery: ${evt.recovery}`, x, cardY + cardH - 6);
      }
    });
  }, []);
  return <AnimScene drawFn={draw} height={250} />;
}

// ============================================================
// RISK ENVIRONMENT SCANNER DATA
// ============================================================
interface ScannerInput { key: string; label: string; icon: string; options: { value: string; label: string; riskOn: number }[]; }
const scannerInputs: ScannerInput[] = [
  { key: 'vix', label: 'VIX (Fear Index)', icon: '\ud83d\udcc9', options: [{ value: 'low', label: 'Below 15 (calm)', riskOn: 3 }, { value: 'normal', label: '15\u201320 (normal)', riskOn: 2 }, { value: 'elevated', label: '20\u201330 (elevated)', riskOn: 1 }, { value: 'extreme', label: 'Above 30 (panic)', riskOn: 0 }] },
  { key: 'yields', label: 'Bond Yields Direction', icon: '\ud83d\udcca', options: [{ value: 'rising', label: 'Rising (growth)', riskOn: 3 }, { value: 'stable', label: 'Stable', riskOn: 2 }, { value: 'falling', label: 'Falling (safety)', riskOn: 0 }, { value: 'inverted', label: 'Curve inverted', riskOn: 0 }] },
  { key: 'dxy', label: 'USD (DXY) Direction', icon: '\ud83d\udcb5', options: [{ value: 'weakening', label: 'Weakening', riskOn: 3 }, { value: 'stable', label: 'Stable', riskOn: 2 }, { value: 'strengthening', label: 'Strengthening', riskOn: 1 }, { value: 'surging', label: 'Surging (flight)', riskOn: 0 }] },
  { key: 'commodities', label: 'Commodity Trend', icon: '\ud83d\udee2\ufe0f', options: [{ value: 'rising', label: 'Rising (demand)', riskOn: 3 }, { value: 'stable', label: 'Stable', riskOn: 2 }, { value: 'falling', label: 'Falling (weak demand)', riskOn: 1 }, { value: 'crashing', label: 'Crashing', riskOn: 0 }] },
  { key: 'equities', label: 'Equity Market Sentiment', icon: '\ud83d\udcc8', options: [{ value: 'bullish', label: 'New highs / bullish', riskOn: 3 }, { value: 'neutral', label: 'Range-bound', riskOn: 2 }, { value: 'bearish', label: 'Downtrend / selling', riskOn: 1 }, { value: 'panic', label: 'Crash / capitulation', riskOn: 0 }] },
];

const getRiskEnvironment = (score: number): { env: string; color: string; desc: string; trading: string } => {
  if (score >= 12) return { env: 'RISK-ON', color: '#26A69A', desc: 'Markets are confident. VIX low, equities rising, USD weakening, commodities in demand. Capital is flowing toward growth and yield.', trading: 'Trade with the risk appetite. Equity longs favoured. Commodity currencies (AUD, CAD, NZD) benefit. Gold and JPY underperform. Your SMC setups work well \u2014 structure holds in calm markets.' };
  if (score >= 8) return { env: 'MIXED / TRANSITIONING', color: '#FFB300', desc: 'Conflicting signals. Some indicators say growth, others say caution. The market is at an inflection point or digesting a shift.', trading: 'Reduce conviction and size. Wider stops. Avoid overnight positions in uncertain environments. Focus on the highest-quality setups only. When the market can\u2019t decide, you shouldn\u2019t force it.' };
  if (score >= 4) return { env: 'RISK-OFF', color: '#EF5350', desc: 'Fear is elevated. VIX rising, yields falling, USD strengthening, equities under pressure. Capital is flowing to safety.', trading: 'Defensive positioning. Gold longs, JPY longs, USD longs against risk currencies. Avoid equity longs. Reduce position sizes. Widen stops to account for higher volatility. Consider reducing trading frequency.' };
  return { env: 'CRISIS / EXTREME RISK-OFF', color: '#EF5350', desc: 'Panic conditions. VIX above 30, bonds rallying hard, USD surging, equities in freefall. This is a black swan or major geopolitical shock.', trading: 'CAPITAL PRESERVATION MODE. Flatten all non-defensive positions. Only trade if you are confident in the safe-haven direction (Gold long, USD long, JPY long). Otherwise, sit in cash. The market will be there when the dust settles.' };
};

// ============================================================
// CONTENT DATA
// ============================================================
const riskTypes = [
  { title: '\u2694\ufe0f Military Conflict & War', desc: '<strong>Impact:</strong> Immediate risk-off. Safe havens surge (Gold, USD, JPY, CHF). Oil spikes on supply disruption fears. Equities sell off.<br/><br/><strong>Duration:</strong> Initial shock 1-3 days. Sustained impact depends on escalation. Markets often \u201cprice in\u201d conflict within 2-4 weeks unless it escalates further.<br/><br/><strong>Recent example:</strong> Russia-Ukraine 2022. Oil +60% in weeks. European gas +400%. Gold initially spiked then settled. EUR weakened significantly. The market adapted within 2-3 months.<br/><br/><strong>Your action:</strong> Reduce overnight exposure when tensions are elevated. Tighten all stops. No new longs on risk assets. If already in Gold or USD longs, trail stops \u2014 don\u2019t take profit prematurely during genuine flight-to-safety.' },
  { title: '\ud83c\uddf3 Elections & Political Change', desc: '<strong>Impact:</strong> Volatility AROUND the event, not necessarily directional. Markets hate uncertainty \u2014 once the result is known, volatility often drops regardless of the outcome.<br/><br/><strong>The pattern:</strong> Volatility rises 2-4 weeks before. Spikes on election night. Then resolves within 1-2 days as markets price in the new reality.<br/><br/><strong>Recent example:</strong> Brexit 2016. GBP dropped 12% overnight. But within the next day, the initial panic faded and markets began pricing the new reality. Traders who entered short GBP at the open made money. Those who chased 12 hours later got caught in the bounce.<br/><br/><strong>Your action:</strong> Reduce all GBP exposure before UK elections. Reduce USD exposure before US elections. Flatten the night before. Re-enter when direction is clear (usually 24-48 hours post-result).' },
  { title: '\ud83c\udfe6 Financial System Shocks', desc: '<strong>Impact:</strong> Contagion fear. When one bank fails, the market asks \u201cwho\u2019s next?\u201d Interbank lending freezes. Credit spreads widen. Equities crash. Gold and government bonds surge.<br/><br/><strong>The acceleration:</strong> Financial shocks compound faster than geopolitical ones because they threaten the SYSTEM, not just one country or region. SVB 2023 took 48 hours from \u201cfine\u201d to \u201ccollapsed.\u201d<br/><br/><strong>Your action:</strong> If a major bank or institution makes headlines, reduce ALL exposure immediately. Don\u2019t wait for \u201cconfirmation\u201d \u2014 by the time it\u2019s confirmed, the move is done. Better to flatten and miss a bounce than hold through a 2008-style cascade.' },
  { title: '\ud83c\udf0d Sanctions, Trade Wars & Supply Shocks', desc: '<strong>Impact:</strong> Slower-burning than military or financial shocks. Tariffs and sanctions affect specific sectors and currencies first, then cascade. Supply chain disruptions drive inflation.<br/><br/><strong>The commodity link:</strong> Sanctions on Russia = oil/gas supply shock. Sanctions on China = tech supply chain disruption. Trade tariffs = import price inflation = CPI surprise = rate expectations shift.<br/><br/><strong>Your action:</strong> Identify which commodities and currencies are DIRECTLY affected. If Russia is sanctioned, watch oil and gas. If China tensions rise, watch AUD (China\u2019s biggest customer) and tech equities. Trade the FIRST-ORDER effects, not the speculation.' },
];

const safeHavens = [
  { asset: 'USD (DXY)', why: 'World\u2019s reserve currency. In crisis, debt obligations denominated in USD force buying. Capital repatriates to US.', when: 'Almost every risk-off event. Exception: if the crisis IS the US (debt ceiling, US political instability).', color: '#26A69A' },
  { asset: 'Gold (XAUUSD)', why: 'No counterparty risk. Can\u2019t be frozen, sanctioned, or defaulted. Physical store of value since 3000 BC.', when: 'Military conflict, inflation fears, central bank credibility concerns. Underperforms during rate hikes (opportunity cost).', color: '#f59e0b' },
  { asset: 'JPY (Japanese Yen)', why: 'Japan is world\u2019s largest creditor nation. In crisis, Japanese investors repatriate capital \u2192 buy JPY.', when: 'Global risk-off events. EXCEPTION: if BOJ is actively weakening JPY, the safe haven effect is suppressed.', color: '#3b82f6' },
  { asset: 'CHF (Swiss Franc)', why: 'Swiss neutrality, political stability, banking system. The \u201cneutral\u201d safe haven.', when: 'European crises specifically. Less reliable during global shocks (smaller economy, SNB intervention risk).', color: '#8b5cf6' },
  { asset: 'Government Bonds', why: 'US Treasuries / German Bunds. Backed by sovereign governments. Yields DROP (prices RISE) during risk-off.', when: 'Equity selloffs, recession fears, financial system stress. The \u201cfloor\u201d for institutional capital.', color: '#6b7280' },
];

const commonMistakes = [
  { title: 'Trying to Trade the Initial Shock', mistake: 'War breaks out Sunday night. You go long Gold at the Monday open. The gap was $40. By Tuesday, Gold has given back $25 of it.', fix: 'Gap moves are already priced in by the time you can act. Wait 24-48 hours. If the risk-off flow persists, THEN enter. Chasing gaps is donating money to institutions who positioned over the weekend.' },
  { title: 'Overreacting to Headlines', mistake: '\u201cBREAKING: Tensions rise between X and Y.\u201d You flatten everything. Markets move 10 pips and settle. Headlines =/= reality.', fix: 'Assess severity. Is this military escalation or diplomatic posturing? Check VIX, Gold, bond yields. If safe havens aren\u2019t moving, the market isn\u2019t worried. Don\u2019t let headlines trade for you.' },
  { title: 'No Geopolitical Awareness', mistake: 'You\u2019re oblivious to rising tensions. You hold a leveraged long through a weekend. Monday opens with a 200-pip gap against you.', fix: 'Sunday night: 60 seconds scanning headlines. Any military, political, or financial escalation = reduce overnight exposure. Gaps are the #1 silent account killer.' },
  { title: 'Assuming Every Shock Is 2008', mistake: 'SVB collapses. \u201cThis is 2008 all over again!\u201d You go maximum risk-off. Markets recover in 2 weeks. You missed the bounce and locked in losses.', fix: 'Most shocks are NOT systemic. 2008 was systemic. SVB was not. Check: Is the banking system at risk? Are interbank rates spiking? If not, it\u2019s a contained event. Trade proportionally.' },
];

const quizQuestions = [
  { q: 'In a risk-off environment, which combination of trades is MOST aligned with the flow?', opts: ['Long equities + short Gold', 'Long Gold + long JPY + short AUD', 'Long commodities + long EM currencies', 'Long everything \u2014 diversification protects'], correct: 1, explain: 'Risk-off = capital flows to safety. Gold and JPY are safe havens that rise. AUD is a risk currency that falls (tied to Chinese demand and commodities). This combination trades WITH the defensive flow.' },
  { q: 'Breaking news: military escalation between two nations. Gold gaps up $35 on the Monday open. You should:', opts: ['Buy Gold immediately \u2014 safe haven demand will continue', 'Wait 24-48 hours. The gap is already priced in. If risk-off PERSISTS after the initial shock, enter then.', 'Short Gold \u2014 gaps always fill', 'Ignore it \u2014 geopolitics doesn\u2019t affect trading'], correct: 1, explain: 'The $35 gap IS the market\u2019s initial pricing of the event. Most geopolitical gaps partially retrace within 24-48 hours as the market assesses the ACTUAL severity. Enter on the persistence of the flow, not the initial shock.' },
  { q: 'VIX is at 32. Bond yields are falling. USD is surging. Equities are down 3% today. This environment is:', opts: ['Normal market volatility', 'Clear risk-off \u2014 multiple indicators confirm fear is driving capital to safety', 'Random noise', 'Good time to buy the dip'], correct: 1, explain: 'VIX above 30 + falling yields + surging USD + equity selloff is textbook risk-off. Every major indicator is confirming the same thing: capital is fleeing to safety. Trade with the flow, not against it.' },
  { q: 'The "buy the rumour, sell the news" pattern in elections means:', opts: ['Buy stocks before elections', 'Markets price in expected outcomes BEFORE the event. Once the result is known, the uncertainty premium drops \u2014 even if the result was unexpected.', 'Elections don\u2019t matter', 'Only applies to US elections'], correct: 1, explain: 'Pre-event volatility is the market pricing uncertainty. Post-event, regardless of outcome, the uncertainty resolves and vol drops. The INITIAL reaction may be violent, but the follow-through is often muted because the event is now \u201cknown.\u201d' },
  { q: 'A major bank collapses. The FIRST thing to assess is:', opts: ['How much exposure you have to that bank', 'Whether this is SYSTEMIC (threatening the banking system) or CONTAINED (one institution). Systemic = 2008. Contained = SVB.', 'Whether to buy the bank\u2019s stock', 'Nothing \u2014 banks don\u2019t affect forex'], correct: 1, explain: 'Systemic vs contained determines your response. SVB collapsed but the Fed backstopped deposits within 48 hours = contained. Lehman collapsed and nobody backstopped = systemic cascade. Your response should be proportional to the systemic risk.' },
  { q: 'Safe haven flows during a Middle East military escalation would likely strengthen:', opts: ['EUR and GBP \u2014 they\u2019re major currencies', 'USD, Gold, and JPY \u2014 the three primary safe havens during military risk events', 'All currencies equally', 'Only oil prices'], correct: 1, explain: 'Military escalation, especially in oil-producing regions, triggers classic safe haven flows. USD (reserve currency), Gold (no counterparty risk), and JPY (creditor nation repatriation) are the three primary beneficiaries.' },
  { q: 'It\u2019s Friday evening. Geopolitical tensions have been rising all week. You have an open EUR/USD long at +0.8R. Best action:', opts: ['Hold through the weekend \u2014 +0.8R has cushion', 'Close before the weekend. Geopolitical risk + weekend = gap risk. +0.8R in the bank beats a potential -2R Monday gap.', 'Add a hedge', 'Move stop to breakeven'], correct: 1, explain: 'Weekend gap risk is the most underappreciated danger in retail trading. Your stop does NOTHING during a gap. With elevated geopolitical tension, the probability of an adverse gap is meaningfully higher. Lock in the +0.8R.' },
  { q: 'During risk-off, which currency is the exception where safe-haven status can FAIL?', opts: ['USD \u2014 always works', 'Gold \u2014 always works', 'JPY \u2014 safe haven effect is suppressed when the BOJ is actively trying to weaken the yen', 'CHF \u2014 always works'], correct: 2, explain: 'JPY\u2019s safe haven status is conditional. When the BOJ is intervening to weaken JPY (as in 2022-2024), the safe haven flows compete with central bank policy. The result is a suppressed or even reversed safe haven effect. Always check BOJ policy before relying on JPY as a hedge.' },
];

const gameRounds = [
  { scenario: '<strong>Sunday evening.</strong> Breaking news: military conflict escalation in the Middle East. Oil futures up 8% in overnight trading. You have an open EUR/USD long and a NASDAQ long from Friday. Markets open in 6 hours.', options: [
    { text: 'Hold everything \u2014 the conflict might de-escalate by morning.', correct: false, explain: '\u2717 Hope is not a risk management strategy. Oil +8% means the market is pricing in real supply disruption. EUR will weaken (energy importer), NASDAQ will drop (risk-off). Your two positions are both adverse to this environment.' },
    { text: 'Set market orders to close both at the open. Cancel any pending orders. Assess after 24-48 hours of price action.', correct: true, explain: '\u2713 Correct. Both positions are on the wrong side of a risk-off event. EUR weakens (Europe imports Middle East oil). NASDAQ drops (risk-off). Close both at the open, take whatever the gap gives you, and reassess when the dust settles.' },
    { text: 'Go long Gold to hedge.', correct: false, explain: '\u2717 Adding complexity doesn\u2019t solve the problem. You now have 3 positions to manage during a gap open with extreme spreads. Close the adverse positions. If you want Gold, enter it separately after spreads normalise.' },
  ]},
  { scenario: '<strong>VIX at 14. Equities at all-time highs. Gold flat. USD weakening. Bond yields rising.</strong> Everything screams risk-on. Your portfolio is long equities and short Gold. You\u2019ve been profitable for 3 weeks.', options: [
    { text: 'Add more \u2014 risk-on is confirmed by all indicators.', correct: false, explain: '\u2717 When ALL indicators are at risk-on extremes and you\u2019ve been profitable for 3 weeks, complacency is the danger. VIX at 14 is extreme calm \u2014 historically, it doesn\u2019t stay there. Tighten stops, don\u2019t add.' },
    { text: 'Maintain positions with tight stops. Risk-on can persist but extreme readings eventually revert. Don\u2019t add at the extreme.', correct: true, explain: '\u2713 Ride the trend but protect aggressively. VIX at 14 is the calm before storms historically. You don\u2019t need to predict the top \u2014 just ensure you\u2019re protected when the regime shifts.' },
    { text: 'Close everything and go flat \u2014 it\u2019s too good to be true.', correct: false, explain: '\u2717 Timing the exact regime shift is expensive. Markets can stay extreme longer than expected. Stay in but protect. Exit when indicators TURN, not when you FEEL they should.' },
  ]},
  { scenario: '<strong>A mid-size US bank announces liquidity problems.</strong> Headlines: \u201cIs this the next SVB?\u201d VIX jumps from 16 to 22 in one hour. Gold up $12. Bank stocks down 8%. The S&P drops 1.5%.', options: [
    { text: 'Go maximum risk-off \u2014 this could be 2008.', correct: false, explain: '\u2717 One bank with liquidity issues is SVB territory (contained), not Lehman territory (systemic). Check: Are interbank rates spiking? Are other banks affected? Is the Fed intervening? Until you see systemic signs, the response should be proportional.' },
    { text: 'Reduce risk exposure 50%. Monitor for systemic signs (interbank rate spike, multiple banks affected, Fed emergency actions). If contained, recover position within days.', correct: true, explain: '\u2713 Proportional response. Reduce exposure to account for elevated volatility. Monitor for contagion signals. Most bank failures are contained within 48-72 hours by central bank intervention. Full risk-off is only warranted if systemic indicators appear.' },
    { text: 'Buy bank stocks on the dip \u2014 SVB bounced.', correct: false, explain: '\u2717 SVB did NOT bounce. It went to zero. Buying distressed bank stocks during a liquidity crisis is gambling, not trading. Even if other banks survive, the reputational damage causes weeks of selling.' },
  ]},
  { scenario: '<strong>UK general election next week.</strong> Polls show a potential change of government. GBP/USD volatility is rising. You have a GBP/USD swing trade at +1.2R. Your target is +2R.', options: [
    { text: 'Hold for +2R \u2014 polls show the likely outcome and it\u2019s priced in.', correct: false, explain: '\u2717 Polls were wrong in 2016 (Brexit), 2016 (Trump), 2019 (UK). Trusting polls to hold a position through a binary event is gambling. Your +1.2R is real. Your +2R depends on a poll being correct.' },
    { text: 'Close at +1.2R before the election. GBP volatility around elections is extreme. Re-enter 24-48 hours after the result when direction is clear.', correct: true, explain: '\u2713 Elections are binary events with known timing. You can eliminate the risk entirely by closing beforehand and re-entering after. +1.2R locked in > +2R theoretical with a potential -3R gap on a surprise result.' },
    { text: 'Set a wide stop at breakeven to protect against a surprise.', correct: false, explain: '\u2717 Election night gaps can be 200-400 pips on GBP. Your \u201cwide stop\u201d may not get filled anywhere near BE. Gaps render stops useless.' },
  ]},
  { scenario: '<strong>Post-event assessment.</strong> The military conflict from Round 1 de-escalated after diplomatic talks. Oil has retraced 60% of its spike. VIX dropped from 28 to 19. Equities bouncing. Gold gave back $20. It\u2019s been 5 days since the initial shock.', options: [
    { text: 'The crisis is over. Go back to full risk-on positioning immediately.', correct: false, explain: '\u2717 De-escalation is not resolution. Diplomatic talks can collapse. Oil retraced but not fully. VIX is 19, not 14. The market is stabilising but not calm. Re-enter gradually, not all at once.' },
    { text: 'Gradually rebuild risk-on positions. Start at 50% normal size. Full size only when VIX returns below 16 and oil stabilises.', correct: true, explain: '\u2713 Measured re-entry. The initial shock has faded but the situation isn\u2019t resolved. Scale back in as indicators normalise. VIX below 16 and stable oil = the market has fully digested the event.' },
    { text: 'Stay fully risk-off \u2014 it could escalate again at any moment.', correct: false, explain: '\u2717 Staying risk-off when indicators are normalising means missing the recovery. The risk-off trade was correct 5 days ago. Now the environment is transitioning. Adapt with the data.' },
  ]},
];

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function GeopoliticalRiskPage() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setOpenSections(p => ({ ...p, [id]: !p[id] }));

  // Risk Environment Scanner
  const [scanValues, setScanValues] = useState<Record<string, string>>({});
  const [scanGenerated, setScanGenerated] = useState(false);
  const allScanned = scannerInputs.every(s => scanValues[s.key]);
  const riskScore = scannerInputs.reduce<number>((sum, s) => { const opt = s.options.find(o => o.value === scanValues[s.key]); return sum + (opt?.riskOn || 0); }, 0);
  const riskEnv = getRiskEnvironment(riskScore);

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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 8 &middot; Lesson 7</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Geopolitical Risk<br /><span className="bg-gradient-to-r from-amber-400 via-red-400 to-purple-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>&amp; Black Swans</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">You can&rsquo;t predict wars, pandemics, or bank failures. But you can prepare for them, survive them, and even profit from the aftermath.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* S00 */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">\ud83c\udf0a The Tsunami You Can&rsquo;t Predict</p>
            <p className="text-gray-400 leading-relaxed mb-4">You can&rsquo;t predict a tsunami. But you can build your house <strong className="text-amber-400">above the flood line</strong>. You can have an <strong className="text-white">evacuation plan</strong>. You can check the warning systems every morning. That&rsquo;s what geopolitical awareness is for traders.</p>
            <p className="text-gray-400 leading-relaxed">Every chart pattern, every OB, every FVG exists within a <strong className="text-white">geopolitical context</strong>. When that context shifts violently, your technical analysis becomes irrelevant until the new reality is priced in.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">COVID crash, March 2020. S&P 500 fell <strong className="text-red-400">34% in 23 trading days</strong>. Oil went <strong className="text-red-400">literally negative</strong> (\u2212$37/barrel). The VIX hit 82 (normal: 15). <strong className="text-white">Traders with geopolitical awareness and reduced weekend exposure survived.</strong> Those fully leveraged into the weekend of 6 March 2020: <strong className="text-red-400">many accounts were wiped</strong>.</p>
          </div>
        </motion.div>
      </section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; Risk-On vs Risk-Off</p><h2 className="text-2xl font-extrabold mb-4">Where Capital Flows During Fear and Confidence</h2><p className="text-gray-400 text-sm mb-6">The entire financial system is a tug-of-war between greed and fear.</p><RiskFlowAnimation /></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Black Swan Timeline</p><h2 className="text-2xl font-extrabold mb-4">Unpredictable. Devastating. Survivable.</h2><p className="text-gray-400 text-sm mb-6">Every major shock had survivors. Preparation, not prediction, determined who they were.</p><BlackSwanTimelineAnimation /></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; Types of Geopolitical Risk</p><h2 className="text-2xl font-extrabold mb-4">Know What You&rsquo;re Facing</h2><div className="space-y-3">{riskTypes.map((item, i) => (<div key={i}><button onClick={() => toggle(`rt-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`rt-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`rt-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.desc }} /></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The Safe Havens</p><h2 className="text-2xl font-extrabold mb-4">Where Capital Hides</h2><div className="p-6 rounded-2xl glass-card space-y-3">{safeHavens.map(item => (<div key={item.asset} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-xs font-bold mb-1" style={{ color: item.color }}>{item.asset}</p><p className="text-[11px] text-gray-300 mb-1"><strong>Why:</strong> {item.why}</p><p className="text-[11px] text-gray-500"><strong>When:</strong> {item.when}</p></div>))}</div></motion.div></section>

      {/* S05 — GROUNDBREAKING: Risk Environment Scanner */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Interactive Challenge</p><h2 className="text-2xl font-extrabold mb-2">Risk Environment Scanner</h2><p className="text-gray-400 text-sm mb-6">Evaluate 5 market indicators to classify the current risk environment.</p>
      <div className="p-6 rounded-2xl glass-card space-y-4">
        {!scanGenerated ? (<><div className="space-y-3">{scannerInputs.map(input => (<div key={input.key}><p className="text-xs font-bold text-gray-300 mb-1.5">{input.icon} {input.label}</p><div className="flex flex-wrap gap-1.5">{input.options.map(opt => (<button key={opt.value} onClick={() => setScanValues(p => ({ ...p, [input.key]: opt.value }))} className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${scanValues[input.key] === opt.value ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400' : 'bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:bg-white/[0.07]'}`}>{opt.label}</button>))}</div></div>))}</div>
        {allScanned && (<button onClick={() => setScanGenerated(true)} className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95">Scan Environment &rarr;</button>)}
        {!allScanned && (<p className="text-xs text-gray-600 text-center">Select a reading for each indicator to scan the environment.</p>)}</>) : (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="p-5 rounded-xl text-center" style={{ background: riskEnv.color + '10', border: `1px solid ${riskEnv.color}30` }}><p className="text-2xl font-extrabold" style={{ color: riskEnv.color }}>{riskEnv.env}</p><p className="text-xs text-gray-400 mt-1">Risk Score: {riskScore}/15</p></div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-[10px] font-bold text-gray-300 mb-1">ENVIRONMENT ASSESSMENT</p><p className="text-xs text-gray-400 leading-relaxed">{riskEnv.desc}</p></div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15"><p className="text-[10px] font-bold text-amber-400 mb-1">TRADING IMPLICATIONS</p><p className="text-xs text-gray-400 leading-relaxed">{riskEnv.trading}</p></div>
          <button onClick={() => { setScanGenerated(false); setScanValues({}); }} className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-semibold text-gray-300 hover:bg-white/[0.07]">&larr; Rescan</button>
        </motion.div>)}
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; The Sunday Night Check</p><h2 className="text-2xl font-extrabold mb-4">60 Seconds That Save Accounts</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">STEP 1 (20 sec)</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Scan major news headlines. Any military, political, or financial escalation? Note it.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#26A69A]">STEP 2 (20 sec)</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Check VIX futures and Gold. If VIX spiked and Gold rallied overnight, risk-off is in play.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">STEP 3 (20 sec)</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Decide: Are open positions safe? Should overnight exposure be reduced? Act before the Asian open.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#3b82f6]">THE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">If you can\u2019t check Sunday night, reduce Friday\u2019s positions to a level where a 200-pip gap won\u2019t damage you.</span></p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Proportional Response</p><h2 className="text-2xl font-extrabold mb-4">Not Every Headline Is 2008</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">SYSTEMIC</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Banking system at risk. Multiple institutions failing. Interbank lending frozen. Go maximum risk-off. Cash is king.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#FFB300]">CONTAINED</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Single institution or event. Central bank intervenes. Reduce risk 50%. Monitor for contagion. Usually resolves in 1-2 weeks.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#26A69A]">HEADLINE NOISE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Diplomatic posturing, rumours, non-events amplified by media. Check VIX and Gold \u2014 if they\u2019re not moving, the market isn\u2019t worried.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">THE TEST</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Is VIX spiking? Is Gold rallying? Are bond yields falling? If YES to all 3 = real risk-off. If NO = the market doesn\u2019t care. Neither should you.</span></p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p><h2 className="text-2xl font-extrabold mb-4">4 Geopolitical Trading Errors</h2><div className="space-y-3">{commonMistakes.map((item, i) => (<div key={i}><button onClick={() => toggle(`cm-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`cm-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`cm-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-xs text-red-400 mb-2">&#10060; {item.mistake}</p><p className="text-xs text-green-400">&#10004; {item.fix}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Cheat Sheet</p><h2 className="text-2xl font-extrabold mb-4">Geopolitical Risk Quick Reference</h2><div className="p-6 rounded-2xl glass-card space-y-3"><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#26A69A]">RISK-OFF HAVENS</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">USD, Gold, JPY, CHF, Government Bonds. These RISE when fear rises.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">RISK-OFF VICTIMS</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Equities, commodities, EM currencies, AUD, NZD. These FALL when fear rises.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#FFB300]">THE VIX TEST</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">VIX + Gold + Yields all moving defensively = real risk-off. If they\u2019re not = headline noise.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#a855f7]">PROPORTIONAL</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Systemic = maximum defence. Contained = reduce 50%. Noise = ignore. Not every shock is 2008.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">THE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">You can\u2019t predict black swans. You CAN survive them. Sunday night check + reduced weekend exposure = survival.</span></p></div></div></motion.div></section>

      {/* S10 — Game */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Test Your Understanding</p><h2 className="text-2xl font-extrabold mb-2">Geopolitical Crisis Game</h2><p className="text-gray-400 text-sm mb-6">5 scenario-based rounds. Survive wars, bank failures, elections, and black swans.</p>
      <div className="p-6 rounded-2xl glass-card"><div className="flex items-center justify-between mb-4"><span className="text-xs font-bold text-amber-400">Round {gameRound + 1} of {gameRounds.length}</span><span className="text-xs font-mono text-gray-500">{gameScore}/{gameRounds.length} correct</span></div><p className="text-sm text-gray-300 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: gameRounds[gameRound].scenario }} /><div className="space-y-2">{gameRounds[gameRound].options.map((opt, oi) => { const answered = gameAnswers[gameRound] !== null; const selected = gameAnswers[gameRound] === oi; const isCorrect = opt.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return (<div key={oi}><button onClick={() => handleGameAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt.text }} /></button>{answered && selected && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]"><p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`} dangerouslySetInnerHTML={{ __html: opt.explain }} /></motion.div>)}</div>); })}</div>{gameAnswers[gameRound] !== null && gameRound < gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5"><button onClick={() => setGameRound(r => r + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button></motion.div>)}{gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Outstanding \u2014 you can navigate geopolitical crises with a clear head.' : gameScore >= 3 ? 'Good \u2014 review the proportional response framework and the gap risk scenarios.' : 'Re-read the safe havens and the Sunday night check before proceeding.'}</p></motion.div>)}</div></motion.div></section>

      {/* S11 — Quiz + Certificate */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Knowledge Check</p><h2 className="text-2xl font-extrabold mb-6">Final Quiz &mdash; 8 Questions</h2>
      <div className="space-y-6">{quizQuestions.map((q, qi) => (<div key={qi} className="p-5 rounded-2xl glass-card"><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p><p className="text-sm font-semibold text-white mb-4">{q.q}</p><div className="space-y-2">{q.opts.map((opt, oi) => { const answered = quizAnswers[qi] !== null; const selected = quizAnswers[qi] === oi; const isCorrect = oi === q.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return <button key={oi} onClick={() => handleQuizAnswer(qi, oi)} disabled={answered} className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`}>{opt}</button>; })}</div>{quizAnswers[qi] !== null && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg bg-white/[0.02]"><p className="text-xs text-amber-400" dangerouslySetInnerHTML={{ __html: `<span class="font-bold">&#9989;</span> ${q.explain}` }} /></motion.div>)}</div>))}</div>
      {quizDone && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center"><p className="text-3xl font-extrabold mb-2">{quizScoreVal}%</p><p className="text-sm text-gray-400">{quizScoreVal >= 66 ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate. Review and try again.'}</p></motion.div>)}
      {certUnlocked && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10"><div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}><div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(139,92,246,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} /><div className="relative z-10 text-center"><div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">\ud83d\udee1\ufe0f</div><p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p><p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 8: Geopolitical Risk &amp; Black Swans</strong><br />at ATLAS Academy by Interakktive</p><p className="bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Risk Sentinel &mdash;</p><p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L8.7-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p></div></div></motion.div>)}</motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-20 text-center"><Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">&larr; Back to Academy</Link></section>
    </div>
  );
}
