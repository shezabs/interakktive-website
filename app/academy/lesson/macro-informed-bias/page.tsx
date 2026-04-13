// app/academy/lesson/macro-informed-bias/page.tsx
// ATLAS Academy — Lesson 8.10: Building a Macro-Informed Bias [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 8
// GROUNDBREAKING: Pre-Session Macro Bias Builder — 5 inputs, bias score + action
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
// ANIMATION 1: 3-Layer Bias Stack — Macro → Technical → Trigger
// ============================================================
function BiasStackAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.003; const cx = w / 2;
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('The 3-Layer Bias Stack — Macro → Technical → Trigger', cx, 16);
    const scenarios = [
      { macro: { label: 'BULLISH', color: '#26A69A', desc: 'Fed dovish, USD weak' }, tech: { label: 'BULLISH', color: '#26A69A', desc: '4H uptrend, OB at OTE' }, trigger: { label: 'ENTER', color: '#26A69A', desc: '15M BOS + FVG entry' }, verdict: 'FULL CONVICTION LONG', verdictColor: '#26A69A' },
      { macro: { label: 'BEARISH', color: '#EF5350', desc: 'Hot CPI, USD strong' }, tech: { label: 'BULLISH', color: '#26A69A', desc: 'Structure says buy' }, trigger: { label: 'SKIP', color: '#FFB300', desc: 'Macro contradicts' }, verdict: 'REDUCED SIZE OR SKIP', verdictColor: '#FFB300' },
      { macro: { label: 'NEUTRAL', color: '#6b7280', desc: 'No events, mixed data' }, tech: { label: 'BULLISH', color: '#26A69A', desc: 'Clean OB setup' }, trigger: { label: 'ENTER', color: '#26A69A', desc: 'Standard entry' }, verdict: 'NORMAL TRADE', verdictColor: '#3b82f6' },
    ];
    const activeIdx = Math.floor((t % 15) / 5) % 3; const sc = scenarios[activeIdx];
    const layerH = 48; const layerW = w * 0.7; const startX = (w - layerW) / 2; const startY = 38;
    const progress = Math.min(1, (t % 5) / 3);
    const layers = [
      { label: 'MACRO LAYER', sublabel: sc.macro.label, desc: sc.macro.desc, color: sc.macro.color, y: startY },
      { label: 'TECHNICAL LAYER', sublabel: sc.tech.label, desc: sc.tech.desc, color: sc.tech.color, y: startY + layerH + 8 },
      { label: 'TRIGGER LAYER', sublabel: sc.trigger.label, desc: sc.trigger.desc, color: sc.trigger.color, y: startY + (layerH + 8) * 2 },
    ];
    const visibleLayers = Math.floor(progress * 4);
    layers.forEach((layer, i) => {
      if (i >= visibleLayers) return;
      const isCurrent = i === visibleLayers - 1;
      const pulse = isCurrent ? Math.sin(t * 4) * 2 : 0;
      ctx.fillStyle = layer.color + '10';
      ctx.beginPath(); ctx.roundRect(startX - pulse, layer.y - pulse, layerW + pulse * 2, layerH + pulse * 2, 8); ctx.fill();
      ctx.strokeStyle = layer.color + (isCurrent ? '60' : '25'); ctx.lineWidth = isCurrent ? 1.5 : 0.5;
      ctx.beginPath(); ctx.roundRect(startX, layer.y, layerW, layerH, 8); ctx.stroke();
      ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '7px system-ui';
      ctx.fillText(layer.label, startX + 10, layer.y + 16);
      ctx.fillStyle = layer.color; ctx.font = 'bold 11px system-ui';
      ctx.fillText(layer.sublabel, startX + 10, layer.y + 32);
      ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '8px system-ui'; ctx.textAlign = 'right';
      ctx.fillText(layer.desc, startX + layerW - 10, layer.y + 30);
      // Arrow between layers
      if (i < 2) {
        ctx.fillStyle = '#f59e0b40'; ctx.beginPath();
        const ay = layer.y + layerH + 1;
        ctx.moveTo(cx, ay); ctx.lineTo(cx - 5, ay + 3); ctx.lineTo(cx + 5, ay + 3); ctx.closePath(); ctx.fill();
      }
    });
    // Verdict
    if (visibleLayers >= 3) {
      const vy = startY + (layerH + 8) * 3 + 4;
      ctx.fillStyle = sc.verdictColor + '15';
      ctx.beginPath(); ctx.roundRect(startX, vy, layerW, 36, 8); ctx.fill();
      ctx.strokeStyle = sc.verdictColor + '50'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(startX, vy, layerW, 36, 8); ctx.stroke();
      ctx.fillStyle = sc.verdictColor; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
      ctx.fillText('→ ' + sc.verdict, cx, vy + 22);
    }
  }, []);
  return <AnimScene drawFn={draw} height={270} />;
}

// ============================================================
// ANIMATION 2: Bias Conflict Resolution — decision tree
// ============================================================
function BiasConflictAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.003; const cx = w / 2;
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('When Macro and Technicals Disagree', cx, 16);
    const combos = [
      { macro: '↑ BULLISH', tech: '↑ BULLISH', result: 'FULL SIZE', action: 'Maximum conviction.\nBoth layers agree.', color: '#26A69A', x: 0.17 },
      { macro: '↑ BULLISH', tech: '↓ BEARISH', result: 'SKIP', action: 'Macro says buy.\nChart says sell.\nNo edge — sit out.', color: '#EF5350', x: 0.39 },
      { macro: '→ NEUTRAL', tech: '↑ BULLISH', result: 'NORMAL', action: 'No macro headwind.\nTrade your setup\nat standard size.', color: '#3b82f6', x: 0.61 },
      { macro: '↓ BEARISH', tech: '↑ BULLISH', result: 'HALF SIZE', action: 'Chart says buy but\nmacro is a headwind.\n50% risk max.', color: '#FFB300', x: 0.83 },
    ];
    const activeIdx = Math.floor((t % 16) / 4) % 4;
    const cardW = w / 4 - 12; const cardH = h - 50; const topY = 35;
    combos.forEach((combo, i) => {
      const x = combo.x * w - cardW / 2; const isActive = i === activeIdx;
      ctx.fillStyle = isActive ? combo.color + '08' : 'rgba(255,255,255,0.01)';
      ctx.beginPath(); ctx.roundRect(x, topY, cardW, cardH, 8); ctx.fill();
      ctx.strokeStyle = isActive ? combo.color + '40' : 'rgba(255,255,255,0.04)';
      ctx.lineWidth = isActive ? 1.5 : 0.5;
      ctx.beginPath(); ctx.roundRect(x, topY, cardW, cardH, 8); ctx.stroke();
      ctx.textAlign = 'center'; const textX = x + cardW / 2;
      // Macro
      ctx.fillStyle = isActive ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.1)';
      ctx.font = '6px system-ui'; ctx.fillText('MACRO', textX, topY + 12);
      ctx.fillStyle = isActive ? combo.color : 'rgba(255,255,255,0.15)';
      ctx.font = `${isActive ? 'bold 8' : '7'}px system-ui`; ctx.fillText(combo.macro, textX, topY + 24);
      // Tech
      ctx.fillStyle = isActive ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.1)';
      ctx.font = '6px system-ui'; ctx.fillText('TECHNICAL', textX, topY + 42);
      ctx.fillStyle = isActive ? combo.color : 'rgba(255,255,255,0.15)';
      ctx.font = `${isActive ? 'bold 8' : '7'}px system-ui`; ctx.fillText(combo.tech, textX, topY + 54);
      // Result
      if (isActive) {
        ctx.fillStyle = combo.color; ctx.font = 'bold 10px system-ui'; ctx.fillText(combo.result, textX, topY + 76);
        ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '7px system-ui';
        combo.action.split('\n').forEach((l, li) => ctx.fillText(l, textX, topY + 92 + li * 11));
      }
    });
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// MACRO BIAS BUILDER DATA
// ============================================================
interface BiasInput { key: string; label: string; icon: string; options: { value: string; label: string; score: number }[]; }
const biasInputs: BiasInput[] = [
  { key: 'environment', label: 'Macro Environment', icon: '🌍', options: [{ value: 'risk_on', label: 'Risk-On (growth, dovish)', score: 2 }, { value: 'neutral', label: 'Neutral / Mixed', score: 0 }, { value: 'risk_off', label: 'Risk-Off (fear, hawkish)', score: -2 }] },
  { key: 'events', label: 'Event Proximity', icon: '📅', options: [{ value: 'clear', label: 'No events today', score: 1 }, { value: 'later', label: 'Event later today', score: 0 }, { value: 'imminent', label: 'Tier 1 event < 2 hours', score: -2 }] },
  { key: 'dxy', label: 'DXY Direction (for USD pair)', icon: '💵', options: [{ value: 'supports', label: 'Supports my trade', score: 2 }, { value: 'neutral', label: 'Sideways / unclear', score: 0 }, { value: 'contradicts', label: 'Contradicts my trade', score: -2 }] },
  { key: 'correlation', label: 'Correlated Pairs Alignment', icon: '🔗', options: [{ value: 'aligned', label: 'All confirm direction', score: 1 }, { value: 'mixed', label: 'Mixed signals', score: 0 }, { value: 'diverging', label: 'Diverging / contradicting', score: -1 }] },
  { key: 'sentiment', label: 'Risk Sentiment (VIX/Gold)', icon: '🧠', options: [{ value: 'calm', label: 'VIX low, Gold stable', score: 1 }, { value: 'elevated', label: 'VIX rising, mild concern', score: 0 }, { value: 'fear', label: 'VIX high, Gold surging', score: -2 }] },
];

const getBiasResult = (score: number): { bias: string; color: string; action: string; sizing: string; conviction: string } => {
  if (score >= 5) return { bias: 'STRONG MACRO TAILWIND', color: '#26A69A', action: 'Full conviction. Macro, DXY, correlation, and sentiment all support your trade. This is the highest-probability environment.', sizing: 'Full 1% risk. Standard stop.', conviction: '90%+' };
  if (score >= 3) return { bias: 'MODERATE TAILWIND', color: '#26A69A', action: 'Good conditions. Most factors support. One minor headwind is acceptable. Trade your setup with confidence.', sizing: 'Full 1% risk. Standard stop.', conviction: '75%' };
  if (score >= 1) return { bias: 'SLIGHT TAILWIND', color: '#3b82f6', action: 'Macro is slightly supportive or neutral. No major headwinds but no strong tailwind either. Trade normally but with awareness.', sizing: '0.75–1% risk. Slightly conservative.', conviction: '60%' };
  if (score >= -1) return { bias: 'NEUTRAL / NO EDGE', color: '#FFB300', action: 'Macro provides no directional support. Your trade relies entirely on technicals. Acceptable, but the setup must be exceptional.', sizing: '0.5–0.75% risk. Tighter stop. Must be an A+ setup.', conviction: '50%' };
  if (score >= -3) return { bias: 'MODERATE HEADWIND', color: '#EF5350', action: 'Macro is working against your trade. DXY or sentiment contradicts. Only take if the technical setup is extraordinary AND you reduce size.', sizing: '0.25–0.5% risk maximum. Very tight stop.', conviction: '35%' };
  return { bias: 'STRONG HEADWIND — SKIP', color: '#EF5350', action: 'Multiple macro factors contradict your trade. Event risk imminent. Sentiment adverse. DO NOT TRADE. Wait for conditions to improve or reverse your bias.', sizing: 'DO NOT ENTER. Capital preservation.', conviction: '<25%' };
};

// ============================================================
// CONTENT DATA
// ============================================================
const threeLayerRules = [
  { title: '🌍 Layer 1: Macro (The Weather)', desc: '<strong>What it answers:</strong> Is the macro environment supporting or opposing my trade direction?<br/><br/><strong>Inputs:</strong> Central bank stance (hawkish/dovish), recent data (CPI/NFP direction), risk sentiment (VIX level), DXY direction, intermarket signals (bonds/equities/commodities alignment).<br/><br/><strong>Time to check:</strong> Sunday evening (weekly) + pre-session (daily). Takes 2-3 minutes.<br/><br/><strong>The principle:</strong> Macro sets the BOUNDARIES of what’s possible. A bullish EUR/USD setup during a hawkish Fed + hot CPI environment is fighting gravity. Possible? Yes. Probable? No.' },
  { title: '📊 Layer 2: Technical (The Map)', desc: '<strong>What it answers:</strong> What does the chart structure say? Where are the OBs, FVGs, BOS/CHoCH levels?<br/><br/><strong>Your existing skills:</strong> Everything from Levels 1-7. Market structure, SMC concepts, your strategy models, entry triggers.<br/><br/><strong>The relationship to macro:</strong> Technical analysis is your EXECUTION tool. Macro gives you the direction. Technicals give you the ENTRY. You don’t abandon your chart skills — you FILTER them through macro context.<br/><br/><strong>The principle:</strong> A perfect OB setup with macro support = high probability. A perfect OB setup against macro headwind = reduced probability. Same setup, different context, different outcome.' },
  { title: '⚡ Layer 3: Trigger (The Go/No-Go)', desc: '<strong>What it answers:</strong> Is there a specific entry signal RIGHT NOW? BOS confirmation, FVG fill, OB reaction, candle pattern?<br/><br/><strong>The final filter:</strong> Even with macro support and a clean technical setup, you need a TRIGGER to execute. No trigger = no trade, regardless of how good the context is.<br/><br/><strong>The principle:</strong> Macro says “the environment supports bullish.” Technicals say “there’s an OB at 1.0850.” Trigger says “15M BOS just confirmed — enter NOW.” All three must align for a high-conviction entry.' },
];

const overrideRules = [
  { scenario: 'Macro BULLISH + Tech BULLISH', result: 'FULL CONVICTION', sizing: '1% risk, standard stop', color: '#26A69A', desc: 'Both layers agree. Maximum probability. This is where your edge is strongest.' },
  { scenario: 'Macro BULLISH + Tech BEARISH', result: 'SKIP', sizing: 'No entry', color: '#EF5350', desc: 'Conflicting layers. The chart says sell but the environment says buy. No edge. Wait for alignment.' },
  { scenario: 'Macro NEUTRAL + Tech BULLISH', result: 'NORMAL TRADE', sizing: '0.75–1% risk', color: '#3b82f6', desc: 'No macro headwind. Trade your setup at standard or slightly reduced size. This is the most common scenario.' },
  { scenario: 'Macro BEARISH + Tech BULLISH', result: 'REDUCED OR SKIP', sizing: '0.25–0.5% risk', color: '#FFB300', desc: 'Your chart says buy but macro is a headwind. Only take if A+ setup. Halve risk minimum. The setup has to overcome the environment.' },
  { scenario: 'Tier 1 Event < 2 hours', result: 'FLATTEN', sizing: 'No entries', color: '#EF5350', desc: 'No new trades regardless of setup quality. If already in a trade, close or widen stop. Event risk overrides all other layers.' },
];

const commonMistakes = [
  { title: 'Checking Macro AFTER Entering', mistake: 'You enter on a clean 15M setup, then realise CPI is in 45 minutes. Macro check should happen BEFORE the chart, not after.', fix: 'The sequence is: Macro → Technical → Trigger. Never start at the chart. Start at the calendar and the macro environment. Then open charts.' },
  { title: 'Letting Macro Override Every Trade', mistake: 'Fed is slightly hawkish. You refuse to take ANY bullish EUR/USD setup for 3 weeks. Macro is a FILTER, not a blockade. Slightly hawkish is a headwind, not a wall.', fix: 'Only SKIP when macro is strongly contradictory. Moderate headwind = reduce size. Neutral = normal trade. Reserve “skip” for Tier 1 events and strong opposing signals.' },
  { title: 'No Macro Check at All', mistake: '“I’m a technical trader.” Lesson 8.1 proved with data that the same setup has 72% WR on quiet days and 18% near FOMC. Refusing to spend 2 minutes on macro costs thousands.', fix: '2 minutes of macro checking per day. Calendar + DXY + VIX. That’s it. Not an hour of Bloomberg. 2 minutes of the 3 most important inputs.' },
  { title: 'Over-Complicating the Macro Check', mistake: 'You spend 45 minutes analysing bond yields, PMI sub-components, and COT positioning before every trade. Analysis paralysis kills more trades than bad analysis.', fix: '5 questions: (1) Any events today? (2) DXY direction? (3) VIX calm/elevated? (4) Correlated pairs agree? (5) Risk-on or risk-off? Answer in 2 minutes. Trade.' },
];

const quizQuestions = [
  { q: 'The 3-Layer Bias Stack in correct order is:', opts: ['Technical → Macro → Trigger', 'Macro → Technical → Trigger — macro context first, then chart structure, then entry signal', 'Trigger → Technical → Macro', 'All three simultaneously'], correct: 1, explain: 'Macro sets the boundaries (what’s possible). Technical provides the map (where to trade). Trigger provides the timing (when to enter). This sequence ensures you never enter a trade that’s fighting the environment.' },
  { q: 'Macro is bearish USD (dovish Fed, weak data). Your EUR/USD chart shows a bearish OB setup. You should:', opts: ['Short EUR/USD — the chart is clear', 'SKIP — macro says USD weak (EUR/USD up) but chart says EUR/USD down. The layers contradict. No edge.', 'Long EUR/USD — follow macro and ignore the chart', 'Take both directions at half size'], correct: 1, explain: 'When macro and technicals contradict, there’s no edge. The bearish setup is fighting a macro tailwind for EUR/USD. The resolution is to WAIT for alignment, not force a trade in either direction.' },
  { q: 'CPI releases in 90 minutes. A perfect OB setup appears on EUR/USD. You should:', opts: ['Enter — the setup is too good to miss', 'SKIP — Tier 1 event within 2 hours overrides ALL other layers. No entries regardless of setup quality.', 'Enter at half size', 'Set a pending order for after CPI'], correct: 1, explain: 'Tier 1 event proximity is an absolute override. Within 2 hours of CPI, no new entries. The “perfect” setup will have its statistical edge destroyed by the volatility. Wait. The market will produce more setups after the event.' },
  { q: 'Your pre-session check shows: no events today, DXY weakening, VIX at 14, correlated pairs all bullish EUR/USD. The macro bias is:', opts: ['Neutral — need more data', 'Strong bullish tailwind for EUR/USD — every macro factor aligns. Trade with full conviction.', 'Bearish — low VIX means complacency', 'Can’t determine without reading bond yields'], correct: 1, explain: 'No events + DXY weakness + calm VIX + correlated alignment = every macro box is checked green. This is the highest-conviction macro environment. Your technical setups will have their maximum probability today.' },
  { q: 'The purpose of the macro check is:', opts: ['To replace technical analysis', 'To FILTER technical setups through environmental context — adding or reducing conviction based on whether macro supports or opposes your trade', 'To predict exact price targets', 'To determine which pair to trade'], correct: 1, explain: 'Macro doesn’t replace your SMC skills. It contextualises them. The same OB has different probability depending on whether macro supports or opposes it. The macro check takes 2 minutes and changes the conviction level of every trade you take.' },
  { q: 'DXY is strengthening. Your GBP/USD setup says long. Correlated pairs (EUR/USD) are also weak. The correct action:', opts: ['Enter long GBP/USD — trust the chart', 'Reduce size to 0.25–0.5%. DXY strength + correlated pairs weak = significant macro headwind. The setup has to overcome the environment.', 'Short GBP/USD instead', 'Wait for DXY to confirm weakness before entering'], correct: 1, explain: 'DXY strengthening + EUR/USD weak = broad USD strength. Your long GBP/USD is fighting this headwind. You can still take it if the setup is exceptional, but at drastically reduced size. The macro headwind reduces your probability from ~70% to ~45%.' },
  { q: 'You check macro (2 min), find it’s neutral, check charts (15 min), find a clean setup, but no trigger has appeared yet. You should:', opts: ['Enter anyway — you’ve done the analysis', 'Wait for the trigger. Macro + technical alignment without a trigger = a trade plan, not a trade. The trigger is the go/no-go.', 'Set a market order at the OB', 'Lower your timeframe until a trigger appears'], correct: 1, explain: 'All three layers must align. Macro ✓ + Technical ✓ + no trigger = wait. You have a plan ready to execute. The trigger (BOS, FVG fill, candle confirmation) activates the plan. Without it, you’re entering on hope, not signal.' },
  { q: 'How long should the daily macro check take?', opts: ['30–45 minutes minimum', '2–3 minutes: Calendar + DXY + VIX + correlated pairs + risk sentiment. Five questions, done.', 'No time — not needed', '1 hour with full bond analysis'], correct: 1, explain: '2–3 minutes. The macro check is not a research project. Five questions: (1) Events today? (2) DXY direction? (3) VIX level? (4) Correlated pairs? (5) Risk-on or off? That’s the entire pre-session macro scan. More than this is over-analysis.' },
];

const gameRounds = [
  { scenario: '<strong>Pre-session check:</strong> No high-impact events today. DXY has been weakening for 3 days. VIX at 13 (very calm). EUR/USD and GBP/USD both in uptrends (correlated bullish). Your EUR/USD chart shows a clean bullish OB pullback to OTE with FVG confluence.', options: [
    { text: 'Enter at full 1% risk. Every macro layer supports this trade.', correct: true, explain: '✓ This is the dream scenario. No events + DXY weak + VIX calm + correlation aligned + clean technical setup. Every layer of the 3-layer stack says GO. Full conviction, full size.' },
    { text: 'Enter at 0.5% — always be conservative.', correct: false, explain: '✗ Being conservative when every signal is green is leaving money on the table. The macro check exists to tell you WHEN to trade full size. This is that moment.' },
    { text: 'Skip — it’s too perfect, something must be wrong.', correct: false, explain: '✗ Paranoia is not risk management. If every input checks green, trust your process. The whole point of the macro filter is to identify these high-probability windows.' },
  ]},
  { scenario: '<strong>Pre-session check:</strong> FOMC tonight at 19:00 UTC. Your London session is 07:00–16:00. DXY has been range-bound for 2 weeks. A beautiful EUR/USD bearish setup appears at 08:30.', options: [
    { text: 'Enter — FOMC isn’t until 19:00, that’s 10+ hours away.', correct: false, explain: '✗ While FOMC is hours away, the market ALREADY positions for it. Pre-FOMC volatility compresses, spreads widen, and the range-bound DXY tells you the market is WAITING. Your technical setup’s probability is degraded by the positioning uncertainty.' },
    { text: 'Enter at reduced size (0.5%) with a hard close time of 16:00. The setup is clean but FOMC tonight adds uncertainty. Lock in any profit before the event.', correct: true, explain: '✓ Smart compromise. The setup is valid and FOMC is far enough away for a London session trade. But reduce size and set a hard exit time. Do NOT hold into the evening. This is the “macro slight headwind” scenario.' },
    { text: 'Skip entirely — FOMC day means no trading at all.', correct: false, explain: '✗ FOMC is at 19:00. London session ends at 16:00. You have 8+ hours of tradeable time. Skipping an entire day because of an evening event is overly cautious. Reduce and time-limit instead.' },
  ]},
  { scenario: '<strong>Mid-session.</strong> You entered a EUR/USD long at 09:00 based on a clean setup. Macro was neutral. At 10:30, breaking news: unexpected hawkish ECB comments. EUR/USD spikes 40 pips in your favour. You’re now at +1.5R.', options: [
    { text: 'Add to the position — ECB hawkish = EUR bullish.', correct: false, explain: '✗ The spike was driven by unexpected news, not your setup. Adding on a news spike increases your exposure at the worst price. The initial reaction often partially retraces. Take the gift, don’t double down on it.' },
    { text: 'Trail stop to +1R and let it run. The macro environment just SHIFTED in your favour. Your trade now has macro + technical support. Protect the gain and let the trend develop.', correct: true, explain: '✓ The ECB comment just upgraded your trade from “neutral macro” to “macro tailwind.” Trail the stop to lock in profit and let the new macro context drive further movement. This is the 3-layer stack improving MID-TRADE.' },
    { text: 'Close immediately at +1.5R — news spikes are unreliable.', correct: false, explain: '✗ Closing at +1.5R is acceptable, but sub-optimal. Unlike NFP/CPI spikes, unexpected hawkish ECB comments create a new FUNDAMENTAL reality that can drive price for hours. A trailing stop captures more while protecting your profit.' },
  ]},
  { scenario: '<strong>Pre-session:</strong> Hot CPI yesterday pushed USD higher. DXY up 0.8%. VIX ticked up to 19. Bond yields rising. Your GBP/USD chart shows a bullish OB. Correlated EUR/USD is also showing a bullish pattern.', options: [
    { text: 'Long GBP/USD — the chart is bullish.', correct: false, explain: '✗ Macro layer: Hot CPI = hawkish Fed = USD strength. DXY +0.8% = USD momentum. VIX rising = uncertainty. Your bullish GBP/USD setup is fighting macro headwinds on multiple fronts.' },
    { text: 'Skip or reduce to 0.25%. The macro headwind is strong: hot CPI + DXY momentum + rising VIX all oppose a bullish GBP/USD trade. If entering, it must be tiny and the setup must be A+.', correct: true, explain: '✓ Three macro factors oppose your trade: post-CPI USD strength, DXY momentum, and rising VIX. Your bullish chart pattern is fighting the environment. If you insist, 0.25% max with tight stop. Better to skip and wait for macro to align.' },
    { text: 'Reverse to short GBP/USD — macro says USD strong.', correct: false, explain: '✗ You don’t have a bearish TECHNICAL setup. You have a bullish chart with bearish macro. The answer isn’t to invent a short trade you don’t see on the chart. It’s to WAIT until technicals and macro align in one direction.' },
  ]},
  { scenario: '<strong>Weekly planning (Sunday night).</strong> This week: PMI Monday, nothing Tuesday, CPI Wednesday 13:30, Jobless Claims Thursday, NFP Friday 13:30. You trade EUR/USD in the London session (07:00–16:00).', options: [
    { text: 'Trade every day at full size — events are outside London hours.', correct: false, explain: '✗ CPI at 13:30 and NFP at 13:30 are WITHIN your session. You need to plan around them. Tuesday and Thursday are your cleanest days.' },
    { text: 'Monday: full (PMI is medium, outside London). Tuesday: full (clean). Wednesday: reduced AM, flat by 13:00. Thursday: full (claims = low impact). Friday: reduced AM, flat by 13:00.', correct: true, explain: '✓ Perfect weekly planning. You identified that CPI and NFP fall within your session and planned exit times. Monday and Thursday are clean for full-size trading. Tuesday is your best day — zero events.' },
    { text: 'Only trade Tuesday — it’s the only completely clean day.', correct: false, explain: '✗ Monday (PMI = medium, outside your session = manageable) and Thursday (claims = low impact) are both tradeable at full size. Restricting to one day when three are available costs you 2/3 of your opportunities.' },
  ]},
];

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function MacroInformedBiasPage() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setOpenSections(p => ({ ...p, [id]: !p[id] }));

  // Macro Bias Builder
  const [biasValues, setBiasValues] = useState<Record<string, string>>({});
  const [biasGenerated, setBiasGenerated] = useState(false);
  const allBiasFilled = biasInputs.every(b => biasValues[b.key]);
  const biasScore = biasInputs.reduce<number>((sum, b) => { const opt = b.options.find(o => o.value === biasValues[b.key]); return sum + (opt?.score || 0); }, 0);
  const biasResult = getBiasResult(biasScore);

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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 8 &middot; Lesson 10</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Building a Macro<br /><span className="bg-gradient-to-r from-amber-400 via-red-400 to-purple-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Informed Bias</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">This is where everything connects. Macro context layered onto your SMC analysis layered onto your entry trigger. Three filters. One trade. Maximum probability.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* S00 */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">🎨 The Master Painting</p>
            <p className="text-gray-400 leading-relaxed mb-4">Lessons 8.1–8.9 gave you individual colours: calendar, rates, inflation, employment, GDP, geopolitics, correlations, intermarket. Each colour is powerful alone. But a master painter doesn&rsquo;t use one colour — they <strong className="text-amber-400">blend them all on a single canvas</strong>.</p>
            <p className="text-gray-400 leading-relaxed">This lesson is the canvas. You’ll learn to blend macro context into a <strong className="text-white">single pre-session bias</strong> that makes every technical setup you take either stronger (macro tailwind) or weaker (macro headwind). <strong className="text-white">2 minutes of macro checking before each session = transformed trading.</strong></p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">Same OB setup on EUR/USD. <strong className="text-green-400">With macro tailwind (DXY weak, no events, VIX calm): 74% WR, 1:2.1 avg R:R.</strong> <strong className="text-red-400">Against macro headwind (DXY strong, pre-CPI, VIX elevated): 38% WR, 1:1.0 R:R.</strong> Same chart. Same candles. Same everything — except context. <strong className="text-white">The 2-minute macro check is worth 36% win rate.</strong></p>
          </div>
        </motion.div>
      </section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The 3-Layer Stack</p><h2 className="text-2xl font-extrabold mb-4">Macro → Technical → Trigger</h2><p className="text-gray-400 text-sm mb-6">Three scenarios showing how the layers combine to produce different verdicts.</p><BiasStackAnimation /></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; Conflict Resolution</p><h2 className="text-2xl font-extrabold mb-4">When the Layers Disagree</h2><p className="text-gray-400 text-sm mb-6">4 possible combinations and the correct sizing decision for each.</p><BiasConflictAnimation /></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The 3 Layers Explained</p><h2 className="text-2xl font-extrabold mb-4">Macro, Technical, Trigger</h2><div className="space-y-3">{threeLayerRules.map((item, i) => (<div key={i}><button onClick={() => toggle(`tlr-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`tlr-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`tlr-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.desc }} /></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The Override Rules</p><h2 className="text-2xl font-extrabold mb-4">Sizing Based on Layer Alignment</h2><div className="p-6 rounded-2xl glass-card space-y-3">{overrideRules.map(item => (<div key={item.scenario} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><div className="flex items-center justify-between mb-1"><p className="text-[11px] font-bold text-gray-300">{item.scenario}</p><span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: item.color + '20', color: item.color }}>{item.result}</span></div><p className="text-[11px] text-gray-500 mb-1">{item.desc}</p><p className="text-[10px] font-semibold" style={{ color: item.color }}>Sizing: {item.sizing}</p></div>))}</div></motion.div></section>

      {/* S05 — GROUNDBREAKING: Pre-Session Macro Bias Builder */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Interactive Challenge</p><h2 className="text-2xl font-extrabold mb-2">Pre-Session Macro Bias Builder</h2><p className="text-gray-400 text-sm mb-6">Answer 5 questions about today’s environment. Get your Macro Bias Score with specific sizing and conviction guidance.</p>
      <div className="p-6 rounded-2xl glass-card space-y-4">
        {!biasGenerated ? (<><div className="space-y-3">{biasInputs.map(input => (<div key={input.key}><p className="text-xs font-bold text-gray-300 mb-1.5">{input.icon} {input.label}</p><div className="flex flex-wrap gap-1.5">{input.options.map(opt => (<button key={opt.value} onClick={() => setBiasValues(p => ({ ...p, [input.key]: opt.value }))} className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${biasValues[input.key] === opt.value ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400' : 'bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:bg-white/[0.07]'}`}>{opt.label}</button>))}</div></div>))}</div>
        {allBiasFilled && (<button onClick={() => setBiasGenerated(true)} className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95">Generate Bias Score &rarr;</button>)}
        {!allBiasFilled && (<p className="text-xs text-gray-600 text-center">Answer all 5 questions to generate your macro bias.</p>)}</>) : (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="p-5 rounded-xl text-center" style={{ background: biasResult.color + '10', border: `1px solid ${biasResult.color}30` }}><p className="text-2xl font-extrabold" style={{ color: biasResult.color }}>{biasResult.bias}</p><p className="text-xs text-gray-400 mt-1">Macro Score: {biasScore > 0 ? '+' : ''}{biasScore} | Conviction: {biasResult.conviction}</p></div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-[10px] font-bold text-gray-300 mb-1">RECOMMENDED ACTION</p><p className="text-xs text-gray-400 leading-relaxed">{biasResult.action}</p></div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15"><p className="text-[10px] font-bold text-amber-400 mb-1">POSITION SIZING</p><p className="text-xs font-semibold" style={{ color: biasResult.color }}>{biasResult.sizing}</p></div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-[10px] font-bold text-gray-300 mb-2">YOUR INPUTS</p><div className="space-y-1">{biasInputs.map(b => { const opt = b.options.find(o => o.value === biasValues[b.key]); return (<div key={b.key} className="flex items-center justify-between"><span className="text-[10px] text-gray-500">{b.icon} {b.label}</span><span className="text-[10px] font-semibold text-gray-300">{opt?.label}</span></div>); })}</div></div>
          <button onClick={() => { setBiasGenerated(false); setBiasValues({}); }} className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-semibold text-gray-300 hover:bg-white/[0.07]">&larr; Rescan</button>
        </motion.div>)}
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; The 2-Minute Pre-Session Scan</p><h2 className="text-2xl font-extrabold mb-4">Your Daily Macro Checklist</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">Q1 (20 sec)</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Any high-impact events today for my instruments? If yes, when? Plan exit times.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#26A69A]">Q2 (20 sec)</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">DXY direction this week? Strengthening = headwind for long XXX/USD. Weakening = tailwind.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#3b82f6]">Q3 (20 sec)</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">VIX level? Below 16 = calm, trade normally. 16-25 = cautious. Above 25 = reduce everything.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#8b5cf6]">Q4 (20 sec)</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Do correlated pairs agree with my bias? If EUR/USD is bullish, is GBP/USD also? Alignment = confidence.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">Q5 (20 sec)</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Overall risk sentiment? Risk-on = growth. Risk-off = defensive. This sets the macro BIAS before you open a single chart.</span></p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; When Macro Changes Mid-Session</p><h2 className="text-2xl font-extrabold mb-4">Adapting in Real Time</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#26A69A]">MACRO IMPROVES</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Unexpected dovish comment, data miss in your favour. Trail stop tighter. The trade now has BETTER backing. Let it run.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">MACRO DETERIORATES</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Unexpected hawkish data, VIX spikes, geopolitical news. Tighten stop immediately. Consider closing if the macro shift is significant.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#FFB300]">BREAKING NEWS</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Geopolitical event, surprise central bank action. Close all positions. Reassess. Re-enter when the new reality is priced in.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">THE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Macro is not static. If the environment shifts mid-trade, your management must shift too. The bias you had at 08:00 may be wrong by 11:00.</span></p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p><h2 className="text-2xl font-extrabold mb-4">4 Macro Integration Errors</h2><div className="space-y-3">{commonMistakes.map((item, i) => (<div key={i}><button onClick={() => toggle(`cm-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`cm-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`cm-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-xs text-red-400 mb-2">&#10060; {item.mistake}</p><p className="text-xs text-green-400">&#10004; {item.fix}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Cheat Sheet</p><h2 className="text-2xl font-extrabold mb-4">Macro Bias Quick Reference</h2><div className="p-6 rounded-2xl glass-card space-y-3"><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#26A69A]">MACRO + TECH AGREE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Full conviction. Full size. This is where your edge is strongest. Don’t hold back.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">MACRO + TECH CONFLICT</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Skip or half size. When the layers fight, there’s no edge. Wait for alignment.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#FFB300]">2-MINUTE SCAN</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">5 questions every morning: Calendar? DXY? VIX? Correlations? Sentiment? Done. Open charts.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#3b82f6]">TIER 1 = ABSOLUTE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">FOMC/NFP/CPI within 2 hours = no entries. No exceptions. No “but the setup is perfect.”</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">THE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Macro → Technical → Trigger. Always in this order. 2 minutes of context = 36% win rate difference on the same setup.</span></p></div></div></motion.div></section>

      {/* S10 — Game */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Test Your Understanding</p><h2 className="text-2xl font-extrabold mb-2">Macro Integration Game</h2><p className="text-gray-400 text-sm mb-6">5 scenario-based rounds. Layer macro onto technicals and make the right sizing decision.</p>
      <div className="p-6 rounded-2xl glass-card"><div className="flex items-center justify-between mb-4"><span className="text-xs font-bold text-amber-400">Round {gameRound + 1} of {gameRounds.length}</span><span className="text-xs font-mono text-gray-500">{gameScore}/{gameRounds.length} correct</span></div><p className="text-sm text-gray-300 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: gameRounds[gameRound].scenario }} /><div className="space-y-2">{gameRounds[gameRound].options.map((opt, oi) => { const answered = gameAnswers[gameRound] !== null; const selected = gameAnswers[gameRound] === oi; const isCorrect = opt.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return (<div key={oi}><button onClick={() => handleGameAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt.text }} /></button>{answered && selected && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]"><p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`} dangerouslySetInnerHTML={{ __html: opt.explain }} /></motion.div>)}</div>); })}</div>{gameAnswers[gameRound] !== null && gameRound < gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5"><button onClick={() => setGameRound(r => r + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button></motion.div>)}{gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Outstanding — you can integrate macro into every trading decision.' : gameScore >= 3 ? 'Good — review the FOMC day compromise and the macro headwind sizing.' : 'Re-read the 3-layer stack and the override rules before proceeding.'}</p></motion.div>)}</div></motion.div></section>

      {/* S11 — Quiz + Certificate */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Knowledge Check</p><h2 className="text-2xl font-extrabold mb-6">Final Quiz &mdash; 8 Questions</h2>
      <div className="space-y-6">{quizQuestions.map((q, qi) => (<div key={qi} className="p-5 rounded-2xl glass-card"><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p><p className="text-sm font-semibold text-white mb-4">{q.q}</p><div className="space-y-2">{q.opts.map((opt, oi) => { const answered = quizAnswers[qi] !== null; const selected = quizAnswers[qi] === oi; const isCorrect = oi === q.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return <button key={oi} onClick={() => handleQuizAnswer(qi, oi)} disabled={answered} className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`}>{opt}</button>; })}</div>{quizAnswers[qi] !== null && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg bg-white/[0.02]"><p className="text-xs text-amber-400" dangerouslySetInnerHTML={{ __html: `<span class="font-bold">&#9989;</span> ${q.explain}` }} /></motion.div>)}</div>))}</div>
      {quizDone && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center"><p className="text-3xl font-extrabold mb-2">{quizScoreVal}%</p><p className="text-sm text-gray-400">{quizScoreVal >= 66 ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate. Review and try again.'}</p></motion.div>)}
      {certUnlocked && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10"><div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}><div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(139,92,246,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} /><div className="relative z-10 text-center"><div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">⚙️</div><p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p><p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 8: Building a Macro-Informed Bias</strong><br />at ATLAS Academy by Interakktive</p><p className="bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Bias Engineer &mdash;</p><p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L8.10-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p></div></div></motion.div>)}</motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-20 text-center"><Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">&larr; Back to Academy</Link></section>
    </div>
  );
}
