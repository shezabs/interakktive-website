// app/academy/lesson/interest-rates-central-banks/page.tsx
// ATLAS Academy — Lesson 8.3: Interest Rates & Central Banks [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 8
// GROUNDBREAKING: Central Bank Statement Decoder — interpret hawkish/dovish language, scored
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
// ANIMATION 1: Rate Decision Cascade — domino effect across markets
// ============================================================
function RateCascadeAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.003; const cx = w / 2;
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('Rate Hike Cascade — One Decision, Every Market Moves', cx, 16);
    const nodes = [
      { label: 'FED RAISES\nRATES', emoji: '🏦', x: 0.5, y: 0.18, color: '#f59e0b', w: 80, h: 36 },
      { label: 'USD\nSTRENGTHENS', emoji: '💵', x: 0.2, y: 0.45, color: '#26A69A', w: 70, h: 32 },
      { label: 'BONDS\nSELL OFF', emoji: '📉', x: 0.5, y: 0.45, color: '#EF5350', w: 70, h: 32 },
      { label: 'GOLD\nDROPS', emoji: '⬇️', x: 0.8, y: 0.45, color: '#EF5350', w: 70, h: 32 },
      { label: 'EUR/USD\nFALLS', emoji: '📉', x: 0.12, y: 0.75, color: '#EF5350', w: 65, h: 28 },
      { label: 'EM CURRENCIES\nSELL OFF', emoji: '🌍', x: 0.35, y: 0.75, color: '#EF5350', w: 75, h: 28 },
      { label: 'EQUITIES\nMIXED', emoji: '↔️', x: 0.62, y: 0.75, color: '#FFB300', w: 65, h: 28 },
      { label: 'COMMODITIES\nPRESSURED', emoji: '🛢️', x: 0.88, y: 0.75, color: '#EF5350', w: 75, h: 28 },
    ];
    const connections = [[0,1],[0,2],[0,3],[1,4],[1,5],[2,6],[3,7]];
    const progress = Math.min(1, (t % 10) / 6);
    const activeCount = Math.floor(progress * 8);

    // Draw connections
    connections.forEach(([from, to]) => {
      const a = nodes[from]; const b = nodes[to];
      const ax = a.x * w; const ay = a.y * h; const bx = b.x * w; const by = b.y * h;
      const lit = activeCount > Math.max(from, to);
      ctx.beginPath(); ctx.moveTo(ax, ay + a.h / 2); ctx.lineTo(bx, by - b.h / 2);
      ctx.strokeStyle = lit ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.04)'; ctx.lineWidth = lit ? 1.5 : 0.5; ctx.stroke();
    });

    // Draw nodes
    nodes.forEach((node, i) => {
      const nx = node.x * w; const ny = node.y * h; const isActive = i < activeCount;
      const isCurrent = i === activeCount - 1;
      const pulse = isCurrent ? Math.sin(t * 4) * 2 : 0;
      ctx.fillStyle = isActive ? node.color + '12' : 'rgba(255,255,255,0.01)';
      ctx.beginPath(); ctx.roundRect(nx - node.w / 2 - pulse, ny - node.h / 2 - pulse, node.w + pulse * 2, node.h + pulse * 2, 8); ctx.fill();
      ctx.strokeStyle = isActive ? node.color + '50' : 'rgba(255,255,255,0.05)';
      ctx.lineWidth = isCurrent ? 1.5 : 0.5; ctx.beginPath(); ctx.roundRect(nx - node.w / 2, ny - node.h / 2, node.w, node.h, 8); ctx.stroke();
      ctx.textAlign = 'center';
      if (isActive) {
        ctx.fillStyle = node.color; ctx.font = 'bold 7px system-ui';
        const lines = node.label.split('\n');
        lines.forEach((line, li) => ctx.fillText(line, nx, ny - 2 + li * 10));
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.font = '10px system-ui'; ctx.fillText(node.emoji, nx, ny + 4);
      }
    });
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.font = '7px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('One rate decision cascades through currencies, bonds, equities, and commodities', cx, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={270} />;
}

// ============================================================
// ANIMATION 2: Hawkish-Dovish Spectrum — sliding scale with quotes
// ============================================================
function HawkishDovishAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.003; const cx = w / 2;
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('The Hawkish ←→ Dovish Spectrum', cx, 16);
    const barY = 55; const barH = 16; const pad = 30; const barW = w - pad * 2;
    // Gradient bar
    const grad = ctx.createLinearGradient(pad, 0, pad + barW, 0);
    grad.addColorStop(0, '#EF5350'); grad.addColorStop(0.35, '#FFB300'); grad.addColorStop(0.5, '#6b7280'); grad.addColorStop(0.65, '#FFB300'); grad.addColorStop(1, '#26A69A');
    ctx.fillStyle = grad; ctx.beginPath(); ctx.roundRect(pad, barY, barW, barH, 8); ctx.fill();
    // Labels
    ctx.font = 'bold 8px system-ui'; ctx.textAlign = 'left'; ctx.fillStyle = '#EF5350'; ctx.fillText('HAWKISH', pad, barY - 6);
    ctx.textAlign = 'center'; ctx.fillStyle = '#6b7280'; ctx.fillText('NEUTRAL', cx, barY - 6);
    ctx.textAlign = 'right'; ctx.fillStyle = '#26A69A'; ctx.fillText('DOVISH', pad + barW, barY - 6);

    const statements = [
      { text: '"Inflation remains unacceptably high.\nWe are prepared to raise rates further."', pos: 0.1, tone: 'VERY HAWKISH', color: '#EF5350', effect: 'USD ↑↑ | Gold ↓↓ | Equities ↓' },
      { text: '"Price stability is our primary mandate.\nWe will maintain restrictive policy."', pos: 0.3, tone: 'HAWKISH', color: '#EF5350', effect: 'USD ↑ | Gold ↓ | Bonds ↓' },
      { text: '"We are data-dependent. Future decisions\nwill be made meeting by meeting."', pos: 0.5, tone: 'NEUTRAL', color: '#6b7280', effect: 'Minimal reaction. Watch dot plot.' },
      { text: '"Inflation is moderating. We see progress\ntoward our 2% target."', pos: 0.7, tone: 'DOVISH', color: '#26A69A', effect: 'USD ↓ | Gold ↑ | Equities ↑' },
      { text: '"The labour market is cooling significantly.\nWe are considering appropriate easing."', pos: 0.9, tone: 'VERY DOVISH', color: '#26A69A', effect: 'USD ↓↓ | Gold ↑↑ | Equities ↑↑' },
    ];
    const activeIdx = Math.floor((t % 15) / 3) % 5; const s = statements[activeIdx];
    // Needle
    const needleX = pad + s.pos * barW;
    ctx.beginPath(); ctx.moveTo(needleX, barY + barH + 3); ctx.lineTo(needleX - 5, barY + barH + 12); ctx.lineTo(needleX + 5, barY + barH + 12); ctx.closePath();
    ctx.fillStyle = s.color; ctx.fill();
    // Active statement card
    const cardY = barY + barH + 20; const cardH = h - cardY - 15;
    ctx.fillStyle = s.color + '08'; ctx.beginPath(); ctx.roundRect(pad, cardY, barW, cardH, 8); ctx.fill();
    ctx.strokeStyle = s.color + '30'; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(pad, cardY, barW, cardH, 8); ctx.stroke();
    ctx.fillStyle = s.color; ctx.font = 'bold 9px system-ui'; ctx.textAlign = 'center';
    ctx.fillText(s.tone, cx, cardY + 16);
    ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.font = '8px system-ui';
    const lines = s.text.split('\n');
    lines.forEach((line, li) => ctx.fillText(line, cx, cardY + 34 + li * 14));
    ctx.fillStyle = s.color; ctx.font = 'bold 8px system-ui';
    ctx.fillText('Market Effect: ' + s.effect, cx, cardY + cardH - 10);
  }, []);
  return <AnimScene drawFn={draw} height={270} />;
}

// ============================================================
// CENTRAL BANK DECODER — 5 statements to interpret
// ============================================================
interface BankStatement { bank: string; context: string; statement: string; signals: { text: string; tone: 'hawkish' | 'dovish' | 'neutral' }[]; correctAnswer: 'hawkish' | 'dovish' | 'neutral'; explanation: string; marketImpact: string; }
const bankStatements: BankStatement[] = [
  { bank: 'Federal Reserve', context: 'CPI at 3.8% (above 2% target). Unemployment at 3.6%. GDP growth at 2.8%.', statement: 'The Committee judges that inflation remains elevated and progress toward 2% has been slower than anticipated. We remain firmly committed to returning inflation to our target. The current level of the federal funds rate is appropriate, but we are prepared to adjust policy further if incoming data warrants. The balance sheet reduction will continue as planned.', signals: [{ text: '"inflation remains elevated"', tone: 'hawkish' }, { text: '"slower than anticipated"', tone: 'hawkish' }, { text: '"prepared to adjust further"', tone: 'hawkish' }, { text: '"current level appropriate"', tone: 'neutral' }], correctAnswer: 'hawkish', explanation: '3 of 4 signals are hawkish. "Inflation remains elevated" + "slower than anticipated" + "prepared to adjust further" = the Fed is dissatisfied with progress and keeping the door open for hikes. "Current level appropriate" is the only neutral anchor.', marketImpact: 'USD strengthens. Gold drops. Rate-sensitive equities under pressure. Bond yields rise.' },
  { bank: 'European Central Bank', context: 'EU CPI at 2.4% (near target). Growth stagnating at 0.3%. Unemployment rising to 6.8%.', statement: 'Inflation has continued to moderate toward our target. However, underlying price pressures remain, particularly in services. The Governing Council will take a data-dependent approach and stands ready to adjust all instruments to ensure inflation returns sustainably to 2%. We note that economic activity has been weaker than expected.', signals: [{ text: '"inflation has continued to moderate"', tone: 'dovish' }, { text: '"underlying pressures remain"', tone: 'hawkish' }, { text: '"data-dependent approach"', tone: 'neutral' }, { text: '"weaker than expected"', tone: 'dovish' }], correctAnswer: 'dovish', explanation: '2 dovish, 1 neutral, 1 hawkish. The combination of moderating inflation + weak growth tips the balance dovish. "Weaker than expected" growth is the key signal — it opens the door to rate cuts even though they acknowledge services inflation.', marketImpact: 'EUR weakens. European equities rally (lower rates = higher valuations). Bond yields fall.' },
  { bank: 'Bank of England', context: 'UK CPI at 4.2% (well above target). GDP contracted -0.1%. Housing market cooling rapidly.', statement: 'Inflation remains significantly above the 2% target and the Committee expects it to fall only gradually. The labour market remains tight. The MPC voted 6-3 to maintain the current bank rate. Three members voted for a 25 basis point increase. The Committee will continue to monitor the data closely.', signals: [{ text: '"significantly above target"', tone: 'hawkish' }, { text: '"fall only gradually"', tone: 'hawkish' }, { text: '"labour market remains tight"', tone: 'hawkish' }, { text: '"6-3 vote, 3 wanted a hike"', tone: 'hawkish' }], correctAnswer: 'hawkish', explanation: 'Overwhelmingly hawkish. Every signal points to rate concern: inflation significantly above target, slow expected decline, tight labour, and 3 members actually voted to HIKE. Even holding rates at this meeting, the tone says "we’re not done."', marketImpact: 'GBP strengthens. UK bond yields rise. UK equities mixed (higher rates pressure valuations but signal economic resilience).' },
  { bank: 'Federal Reserve', context: 'CPI dropped to 2.3%. Unemployment rose to 4.5%. GDP slowing to 1.1%. Jobless claims trending up.', statement: 'The Committee observed that inflation has made significant progress toward 2%. The labour market has come into better balance, with the unemployment rate moving higher. Risks to achieving our employment and inflation goals are now more balanced. The Committee will assess incoming data and the evolving outlook when considering the appropriate path for monetary policy.', signals: [{ text: '"significant progress toward 2%"', tone: 'dovish' }, { text: '"better balance" + "unemployment higher"', tone: 'dovish' }, { text: '"risks more balanced"', tone: 'dovish' }, { text: '"assess incoming data"', tone: 'neutral' }], correctAnswer: 'dovish', explanation: '3 dovish, 1 neutral. This is classic pre-cut language. "Significant progress," "better balance," and "risks more balanced" are all signals that the Fed is satisfied with inflation progress and concerned about employment. A cut is coming within 1-2 meetings.', marketImpact: 'USD weakens sharply. Gold rallies. Equities surge. Bond yields drop as market prices in cuts.' },
  { bank: 'Bank of Japan', context: 'Japanese CPI at 2.8%. Yen at multi-decade weakness. Wage growth finally positive after decades.', statement: 'The Bank will patiently continue with monetary easing. However, recent developments in wages and prices suggest the likelihood of achieving our price stability target has been gradually rising. The Bank will continue to assess the sustainability of the wage-price cycle and will not hesitate to take additional easing measures if needed.', signals: [{ text: '"patiently continue easing"', tone: 'dovish' }, { text: '"likelihood of achieving target rising"', tone: 'hawkish' }, { text: '"sustainability of wage-price cycle"', tone: 'hawkish' }, { text: '"not hesitate to take additional easing"', tone: 'dovish' }], correctAnswer: 'neutral', explanation: 'Perfectly balanced. Two signals point each way. This is deliberately ambiguous — classic BOJ. They’re acknowledging progress (wage-price cycle) but refusing to commit to a policy shift yet. The market reads between the lines: they’re preparing to tighten but not ready to say it.', marketImpact: 'Muted initial reaction. Yen traders parse every word for shift signals. Any follow-up comment could tip the balance.' },
];

// ============================================================
// CONTENT DATA
// ============================================================
const bigFourBanks = [
  { title: '🇺🇸 Federal Reserve (The Fed)', desc: '<strong>Currency:</strong> USD (the world’s reserve currency — everything connects to it)<br/><strong>Meeting:</strong> 8 times per year (roughly every 6 weeks)<br/><strong>Chair:</strong> Jerome Powell (as of 2024)<br/><strong>Key tool:</strong> Federal Funds Rate<br/><br/><strong>Why it matters most:</strong> The Fed moves EVERYTHING. Rate decisions cascade through all USD pairs, Gold, equities, bonds, commodities, and even emerging market currencies. When the Fed speaks, every market listens.<br/><br/><strong>The presser trap:</strong> The rate decision is released at 19:00 UTC. Markets spike. Then Powell’s press conference at 19:30 UTC REVERSES the move 40% of the time. The statement says one thing; the tone, body language, and Q&A say another.' },
  { title: '🇪🇺 European Central Bank (ECB)', desc: '<strong>Currency:</strong> EUR<br/><strong>Meeting:</strong> 6 weeks cycle<br/><strong>President:</strong> Christine Lagarde<br/><strong>Key tool:</strong> Main Refinancing Rate<br/><br/><strong>Why it matters:</strong> EUR/USD is the most traded pair globally. ECB decisions directly drive it. When the ECB and Fed diverge (one hiking, one cutting), massive trends form.<br/><br/><strong>The divergence trade:</strong> Fed hawkish + ECB dovish = EUR/USD downtrend. Fed dovish + ECB hawkish = EUR/USD uptrend. This divergence is the single most powerful macro signal for forex traders.' },
  { title: '🇬🇧 Bank of England (BOE)', desc: '<strong>Currency:</strong> GBP<br/><strong>Meeting:</strong> 8 times per year<br/><strong>Governor:</strong> Andrew Bailey<br/><strong>Key tool:</strong> Bank Rate<br/><br/><strong>Why it matters:</strong> GBP/USD is the third most traded pair. The BOE vote split is uniquely valuable — unlike the Fed, the BOE publishes exactly how each MPC member voted. A 5-4 split tells you the next decision is a coin flip. 9-0 tells you the direction is locked.<br/><br/><strong>The vote split signal:</strong> More dissenters voting for a hike = hawkish lean. More dissenters voting for a cut = dovish lean. Trade the SHIFT in the split, not the decision itself.' },
  { title: '🇯🇵 Bank of Japan (BOJ)', desc: '<strong>Currency:</strong> JPY<br/><strong>Meeting:</strong> 8 times per year<br/><strong>Governor:</strong> Kazuo Ueda<br/><strong>Key tool:</strong> Short-term policy rate + Yield Curve Control<br/><br/><strong>Why it matters:</strong> The BOJ has been the outlier for decades — ultra-loose while everyone else tightened. This created the JPY carry trade (borrow cheap JPY, invest in higher-yielding currencies).<br/><br/><strong>The carry trade bomb:</strong> When the BOJ finally tightens, carry trades unwind violently. JPY surges. Everything paired against JPY drops. This is a rare but devastating macro event — August 2024 showed exactly this.' },
];

const presserVsDecision = [
  { phase: 'Pre-Decision (30 min before)', what: 'Market positions based on expectations. Volatility compresses.', action: 'FLATTEN. No entries. Spreads widen 30 min before.', color: '#FFB300' },
  { phase: 'Rate Decision (19:00 UTC)', what: 'The number drops. Market spikes in the expected direction — or whipsaws if surprised.', action: 'DO NOT TRADE. The spike is unreliable. 40% reversal rate during presser.', color: '#EF5350' },
  { phase: 'Press Conference (19:30 UTC)', what: 'The REAL information. Tone, language, forward guidance. This is where trends START.', action: 'WATCH. Take notes on hawkish/dovish signals. Don’t trade yet.', color: '#EF5350' },
  { phase: 'Post-Presser (20:30+ UTC)', what: 'Direction established. Spreads normalising. Institutional positioning visible.', action: 'NOW you can trade. Direction from presser + normal spreads = your window.', color: '#26A69A' },
];

const commonMistakes = [
  { title: 'Trading the Decision, Not the Presser', mistake: 'You enter on the rate decision spike at 19:00. The press conference at 19:30 reverses it. This happens 40% of the time.', fix: 'The decision is the headline. The presser is the story. Wait for BOTH before acting.' },
  { title: 'Confusing Rates Held with Neutral', mistake: '"They held rates, so nothing happened." Wrong. A hawkish hold (rates held but language says "prepared to hike") is VERY different from a dovish hold ("considering appropriate easing").', fix: 'The rate decision is binary. The LANGUAGE is the signal. A hold can be the most hawkish or dovish outcome depending on the statement.' },
  { title: 'Ignoring Rate Divergence', mistake: 'Trading EUR/USD without considering where the ECB and Fed are heading relative to each other.', fix: 'Rate divergence is the strongest multi-week trend driver in forex. Track where each central bank is in their cycle.' },
  { title: 'Fighting the Central Bank', mistake: '"The market is wrong, rates will go the other way." The market prices in rate expectations months in advance. You do not have better information than the bond market.', fix: 'Don’t fight the Fed. Don’t fight the ECB. Don’t fight ANY central bank. They move slower but they always win.' },
];

const quizQuestions = [
  { q: 'The Fed raises rates by 25bps. USD should strengthen. But EUR/USD RISES after the press conference. Most likely explanation:', opts: ['Market malfunction', 'The press conference language was dovish — signalling the hike was the last one, shifting rate expectations down', 'Random noise', 'ECB also raised rates'], correct: 1, explain: 'The rate hike was already priced in. The presser signalled it was the final hike — shifting FUTURE rate expectations downward. Markets trade the future, not the present. Dovish presser + final hike = USD weakens despite the hike itself.' },
  { q: 'A central bank statement says "inflation remains elevated and we are prepared to act further." This is:', opts: ['Dovish — they’re worried about inflation', 'Neutral — standard language', 'Hawkish — elevated inflation + willingness to raise rates further', 'Meaningless boilerplate'], correct: 2, explain: '"Inflation remains elevated" = dissatisfied with progress. "Prepared to act further" = door open for more hikes. Both are hawkish signals. This combination means the currency should strengthen and rate-sensitive assets should weaken.' },
  { q: 'The BOE votes 6-3 to hold rates. 3 members voted for a cut. Last meeting was 7-2 (2 for a cut). The shift means:', opts: ['Nothing — rates were held both times', 'The balance is shifting dovish — more members now want cuts, a cut is becoming more likely', 'The BOE is confused', 'GBP should strengthen'], correct: 1, explain: 'The vote split is shifting: 2 dissenters wanting cuts became 3. The direction of the split tells you where the next actual decision is heading. GBP should weaken as the market prices in a higher probability of a cut.' },
  { q: 'Fed is hawkish (rates rising). ECB is dovish (considering cuts). The most probable EUR/USD direction is:', opts: ['Sideways — they cancel out', 'DOWN — rate divergence favours USD over EUR', 'UP — ECB cuts help the economy', 'Unpredictable'], correct: 1, explain: 'Rate divergence is the strongest forex signal. Higher US rates attract capital to USD. Lower EU rates push capital out of EUR. The differential widens = EUR/USD trends down. This can persist for months.' },
  { q: 'FOMC rate decision at 19:00 UTC matches expectations. EUR/USD spikes 40 pips down. At 19:35 during the presser, it reverses and goes 60 pips UP. You should:', opts: ['The initial spike was correct — go short', 'Trust the presser direction — the reversal during the conference is the real institutional move', 'Ignore both — it’s just noise', 'Average into the short'], correct: 1, explain: 'The decision spike is algorithmic and priced in. The press conference move reflects NEW information from the chairman’s tone and language. When the presser reverses the decision move, it means the forward guidance changed the outlook. Trust the presser.' },
  { q: 'The BOJ hints at ending yield curve control. The immediate effect on USD/JPY is:', opts: ['Nothing — BOJ is irrelevant', 'USD/JPY drops sharply — JPY strengthens as the interest rate gap narrows and carry trades unwind', 'USD/JPY rises — USD is always stronger', 'Only affects JGB bonds'], correct: 1, explain: 'BOJ tightening = JPY strengthening. The massive carry trade (borrow JPY at 0%, invest elsewhere) starts unwinding. Capital flows back to Japan. USD/JPY drops. This can cascade into a global risk-off event.' },
  { q: 'A statement says: "Risks are now more evenly balanced between our employment and inflation mandates." This shift from "inflation remains our primary focus" means:', opts: ['Nothing changed', 'The central bank is pivoting from inflation-fighting to a balanced approach — a prerequisite for rate cuts', 'They’re raising rates for employment', 'They’ve given up on inflation'], correct: 1, explain: 'This is classic pivot language. Moving from "primary focus on inflation" to "balanced risks" signals they’re no longer solely inflation-focused. This is what happens BEFORE a cutting cycle begins. The currency should weaken on this shift.' },
  { q: 'Central bank rate decisions matter because:', opts: ['They directly set currency prices', 'Interest rates determine the return on holding a currency — capital flows to higher yields, driving exchange rates and all connected asset prices', 'They signal inflation levels', 'Traders like watching press conferences'], correct: 1, explain: 'Interest rates determine yield. Higher rates = more attractive currency = capital inflows = currency appreciation. This cascades to bonds, equities, commodities, and every financial asset. Rates are the gravitational centre of all markets.' },
];

const gameRounds = [
  { scenario: '<strong>FOMC at 19:00 UTC.</strong> Market expects a hold. The Fed holds rates (as expected). The statement says: "Inflation has made considerable progress. The Committee will assess the evolving outlook." EUR/USD barely moves on the decision. Press conference starts at 19:30.', options: [
    { text: 'Go short EUR/USD now — rates held means USD strength.', correct: false, explain: '✗ Rates held was priced in. "Considerable progress" is dovish language — it suggests the Fed is satisfied with inflation. Wait for the presser to confirm direction.' },
    { text: 'Wait for the press conference. "Considerable progress" sounds dovish — could signal cuts coming.', correct: true, explain: '✓ Correct. The statement language shifted dovish. The presser will clarify. If Powell reinforces "considerable progress," EUR/USD likely rises as the market prices in rate cuts.' },
    { text: 'Go long Gold immediately — dovish statement means Gold rallies.', correct: false, explain: '✗ Right thesis, wrong timing. Spreads are still extreme at 19:01. Wait for the presser to confirm the dovish read, then enter Gold after 20:00+ with normalised spreads.' },
  ]},
  { scenario: '<strong>BOE decision.</strong> Last meeting: 7-2 vote to hold (2 wanted hike). This meeting: 5-4 vote to hold (4 wanted a HIKE). GBP/USD is currently in a mild downtrend.', options: [
    { text: 'Continue short — GBP is weak and rates were held.', correct: false, explain: '✗ The vote split shifted dramatically hawkish. 2 hike voters became 4. One more member and rates ARE rising. This is a GBP-positive signal.' },
    { text: 'Close the short. The vote split shifted strongly hawkish — GBP is likely to strengthen.', correct: true, explain: '✓ 5-4 means the BOE is one vote away from a hike. The shift from 7-2 to 5-4 is a massive signal. GBP should strengthen as the market prices in higher probability of future hikes.' },
    { text: 'Add to the short — they didn’t hike, so GBP stays weak.', correct: false, explain: '✗ Catastrophically wrong. The DIRECTION of the split is what matters. Adding to a short when the BOE is one vote from hiking is fighting a central bank.' },
  ]},
  { scenario: '<strong>ECB meeting.</strong> ECB cuts rates 25bps. This was fully expected. The statement says: "Further easing may be appropriate given deteriorating economic conditions." EUR/USD drops 30 pips.', options: [
    { text: 'Go long EUR/USD — the cut was priced in, so it should bounce.', correct: false, explain: '✗ The cut was priced in, yes, but the statement signalled MORE cuts coming. "Further easing may be appropriate" is new forward guidance that wasn’t priced in. EUR/USD likely continues lower.' },
    { text: 'Go short EUR/USD — the forward guidance signals more cuts, which wasn’t fully priced in. EUR weakness should continue.', correct: true, explain: '✓ The rate cut was expected, but the dovish forward guidance (“further easing”) is new information. Markets now reprice for additional cuts. EUR/USD extends lower.' },
    { text: 'No trade — the cut was expected so nothing new happened.', correct: false, explain: '✗ The cut was expected. The forward guidance was NOT. "Further easing may be appropriate" changes the rate path. This IS new information worth trading.' },
  ]},
  { scenario: '<strong>Fed is hiking. BOJ is still at near-zero.</strong> USD/JPY has trended up for 6 months (strong USD, weak JPY). Suddenly the BOJ announces they are "reviewing yield curve control parameters."', options: [
    { text: 'Continue long USD/JPY — the trend is your friend.', correct: false, explain: '✗ "Reviewing yield curve control" is BOJ code for tightening. This is the most significant BOJ policy shift in years. Carry trade unwind is coming. USD/JPY reversal risk is extreme.' },
    { text: 'Close long USD/JPY immediately. BOJ reviewing YCC = potential tightening = JPY strengthening = carry trade unwind. Reassess after clarity.', correct: true, explain: '✓ This is a regime-change signal. The carry trade that powered USD/JPY’s 6-month uptrend is built on BOJ ultra-loose policy. If that changes, the entire trade unwinds. Close immediately.' },
    { text: 'Hedge with a Gold long — uncertainty is good for Gold.', correct: false, explain: '✗ Hedging doesn’t address the core issue: your USD/JPY long is at risk of a regime change. Close the position, don’t add complexity.' },
  ]},
  { scenario: '<strong>Fed presser in progress.</strong> The rate decision (hold) matched expectations. During Q&A, Powell says: "We do not need to be in a hurry to adjust our policy stance." Markets had been pricing in 3 cuts this year.', options: [
    { text: 'Bullish signal — they’re not cutting means they’re confident.', correct: false, explain: '✗ "Not in a hurry to cut" when the market has priced in 3 cuts is HAWKISH. It means fewer cuts than expected. The repricing will strengthen USD.' },
    { text: 'USD bullish. "Not in a hurry" pushes back against market pricing of 3 cuts. Expect rate expectations to shift, USD strengthens, Gold drops.', correct: true, explain: '✓ The market had priced in 3 cuts. Powell just signalled fewer. This is a hawkish repricing event — USD strengthens as the market adjusts expectations from 3 cuts to maybe 1-2.' },
    { text: 'No impact — they held rates as expected.', correct: false, explain: '✗ The hold was expected. The LANGUAGE was not. "Not in a hurry" directly contradicts the market’s rate cut timeline. Forward guidance is the trade.' },
  ]},
];

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function InterestRatesCentralBanksPage() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setOpenSections(p => ({ ...p, [id]: !p[id] }));

  // Central Bank Decoder
  const [decoderIdx, setDecoderIdx] = useState(0);
  const [decoderAnswer, setDecoderAnswer] = useState<string | null>(null);
  const [decoderScore, setDecoderScore] = useState(0);
  const [decoderHistory, setDecoderHistory] = useState<boolean[]>([]);
  const [decoderComplete, setDecoderComplete] = useState(false);
  const handleDecoderAnswer = (answer: string) => { if (decoderAnswer !== null) return; setDecoderAnswer(answer); const correct = answer === bankStatements[decoderIdx].correctAnswer; if (correct) setDecoderScore(s => s + 1); setDecoderHistory(h => [...h, correct]); };
  const nextStatement = () => { if (decoderIdx < bankStatements.length - 1) { setDecoderIdx(i => i + 1); setDecoderAnswer(null); } else { setDecoderComplete(true); } };

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

  const toneColors: Record<string, string> = { hawkish: '#EF5350', dovish: '#26A69A', neutral: '#6b7280' };
  const stmt = bankStatements[decoderIdx];

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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 8 &middot; Lesson 3</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Interest Rates &amp;<br /><span className="bg-gradient-to-r from-amber-400 via-red-400 to-purple-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Central Banks</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">The most powerful force in all financial markets. One sentence from a central banker moves trillions. Learn to read the language before the market reads it for you.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* S00 */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">🏦 The Gravitational Centre of Markets</p>
            <p className="text-gray-400 leading-relaxed mb-4">Interest rates are to financial markets what <strong className="text-amber-400">gravity is to the solar system</strong>. Every planet orbits the sun. Every asset price orbits the interest rate. Change the rate and you change the orbit of <strong className="text-white">everything</strong> — currencies, bonds, equities, commodities, real estate.</p>
            <p className="text-gray-400 leading-relaxed">Central banks control this gravity. A single sentence from the Fed Chair can move <strong className="text-white">trillions of dollars</strong> in minutes. You don’t need to predict what they’ll do. You need to understand <strong className="text-amber-400">what they said and what it means</strong>.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">Fed presser, March 2024. Rate decision: hold (as expected). EUR/USD moves 12 pips. Then Powell says: <strong className="text-white">“Inflation has made considerable progress.”</strong> EUR/USD reverses and rallies <strong className="text-green-400">85 pips in 40 minutes</strong>. One sentence. Not the decision. The <strong className="text-white">language</strong>.</p>
          </div>
        </motion.div>
      </section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Cascade Effect</p><h2 className="text-2xl font-extrabold mb-4">One Decision Moves Every Market</h2><p className="text-gray-400 text-sm mb-6">A rate hike cascades through currencies, bonds, equities, and commodities.</p><RateCascadeAnimation /></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; Reading the Language</p><h2 className="text-2xl font-extrabold mb-4">Hawkish vs Dovish</h2><p className="text-gray-400 text-sm mb-6">Central bankers choose every word deliberately. Here’s how to decode them.</p><HawkishDovishAnimation /></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The Big 4 Central Banks</p><h2 className="text-2xl font-extrabold mb-4">Know Your Market Movers</h2><div className="space-y-3">{bigFourBanks.map((item, i) => (<div key={i}><button onClick={() => toggle(`b4-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`b4-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`b4-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.desc }} /></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Decision vs Press Conference</p><h2 className="text-2xl font-extrabold mb-4">The Real Information Comes Later</h2><div className="p-6 rounded-2xl glass-card space-y-3">{presserVsDecision.map(item => (<div key={item.phase} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-xs font-bold mb-1" style={{ color: item.color }}>{item.phase}</p><p className="text-[11px] text-gray-400 mb-1">{item.what}</p><p className="text-[11px] font-semibold" style={{ color: item.color }}>{item.action}</p></div>))}</div></motion.div></section>

      {/* S05 — GROUNDBREAKING: Central Bank Statement Decoder */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Interactive Challenge</p><h2 className="text-2xl font-extrabold mb-2">Central Bank Statement Decoder</h2><p className="text-gray-400 text-sm mb-6">Read 5 real-style central bank statements. Identify the tone. Get scored on interpretation accuracy.</p>
      <div className="p-6 rounded-2xl glass-card">{!decoderComplete ? (<div className="space-y-4">
        <div className="flex items-center gap-1.5 mb-2">{bankStatements.map((_, i) => (<div key={i} className={`w-2.5 h-2.5 rounded-full transition-all ${i < decoderIdx ? (decoderHistory[i] ? 'bg-green-500' : 'bg-red-500') : i === decoderIdx ? 'bg-amber-400 scale-125' : 'bg-white/10'}`} />))}<span className="ml-2 text-xs text-gray-500">{decoderIdx + 1}/5</span></div>
        <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15"><p className="text-[10px] font-bold text-amber-400 mb-1">{stmt.bank}</p><p className="text-[10px] text-gray-500">{stmt.context}</p></div>
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-xs text-gray-300 leading-relaxed italic">&ldquo;{stmt.statement}&rdquo;</p></div>
        {decoderAnswer === null ? (<div><p className="text-xs font-bold text-gray-300 mb-2">What is the overall tone?</p><div className="grid grid-cols-3 gap-3">{(['hawkish', 'neutral', 'dovish'] as const).map(tone => (<button key={tone} onClick={() => handleDecoderAnswer(tone)} className="p-3 rounded-xl text-sm font-bold transition-all bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] active:scale-95 uppercase" style={{ color: toneColors[tone] }}>{tone}</button>))}</div></div>) : (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className={`p-4 rounded-xl ${decoderAnswer === stmt.correctAnswer ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}><p className={`text-sm font-bold mb-1 ${decoderAnswer === stmt.correctAnswer ? 'text-green-400' : 'text-red-400'}`}>{decoderAnswer === stmt.correctAnswer ? '✓ Correct!' : `✗ Incorrect — the tone is ${stmt.correctAnswer.toUpperCase()}`}</p></div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-[10px] font-bold text-gray-300 mb-2">Signal Breakdown:</p><div className="space-y-1">{stmt.signals.map((sig, si) => (<div key={si} className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: toneColors[sig.tone] }} /><span className="text-[10px] text-gray-400">{sig.text}</span><span className="text-[10px] font-bold ml-auto uppercase" style={{ color: toneColors[sig.tone] }}>{sig.tone}</span></div>))}</div></div>
          <p className="text-xs text-gray-400 leading-relaxed">{stmt.explanation}</p>
          <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15"><p className="text-[10px] font-bold text-amber-400 mb-1">MARKET IMPACT</p><p className="text-[10px] text-gray-400">{stmt.marketImpact}</p></div>
          <button onClick={nextStatement} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">{decoderIdx < bankStatements.length - 1 ? 'Next Statement →' : 'See Results →'}</button>
        </motion.div>)}
      </div>) : (<div className="text-center"><p className="text-3xl font-extrabold mb-2">{decoderScore}/5</p><p className="text-sm text-gray-400 mb-4">{decoderScore >= 4 ? 'Excellent — you can decode central bank language like a macro analyst.' : decoderScore >= 3 ? 'Good — review the signal breakdown for the ones you missed.' : 'Re-read the hawkish/dovish spectrum and try again.'}</p><div className="flex flex-wrap justify-center gap-2">{decoderHistory.map((correct, i) => (<div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${correct ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{i + 1}</div>))}</div><button onClick={() => { setDecoderIdx(0); setDecoderAnswer(null); setDecoderScore(0); setDecoderHistory([]); setDecoderComplete(false); }} className="mt-6 px-5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-sm font-semibold text-gray-300 hover:bg-white/[0.07]">Retry Decoder</button></div>)}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Rate Divergence</p><h2 className="text-2xl font-extrabold mb-4">The Strongest Signal in Forex</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">FED HAWKISH + ECB DOVISH</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">EUR/USD downtrend. Capital flows to higher USD yields. Can persist for months.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#26A69A]">FED DOVISH + ECB HAWKISH</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">EUR/USD uptrend. Capital flows to EUR. The mirror image.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#FFB300]">BOTH HAWKISH or BOTH DOVISH</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">No divergence. Range-bound. Relative speed of hikes/cuts determines direction.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#a855f7]">BOJ TIGHTENING</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Carry trade unwind. JPY surges. USD/JPY drops. Potential global risk-off cascade.</span></p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Key Language Phrases</p><h2 className="text-2xl font-extrabold mb-4">Your Decoder Ring</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">HAWKISH PHRASES</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">“Remains elevated” • “Prepared to act further” • “Slower than anticipated” • “Primary mandate” • “Not in a hurry” (to cut)</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#26A69A]">DOVISH PHRASES</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">“Considerable progress” • “Risks more balanced” • “Labour market cooling” • “Appropriate easing” • “Sustainable return to target”</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#6b7280]">NEUTRAL PHRASES</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">“Data-dependent” • “Meeting by meeting” • “Monitor closely” • “Assess evolving outlook”</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">THE KEY</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Track the SHIFT. Same phrase repeated = priced in. New phrase = new information = market move.</span></p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p><h2 className="text-2xl font-extrabold mb-4">4 Errors When Trading Central Banks</h2><div className="space-y-3">{commonMistakes.map((item, i) => (<div key={i}><button onClick={() => toggle(`cm-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`cm-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`cm-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-xs text-red-400 mb-2">&#10060; {item.mistake}</p><p className="text-xs text-green-400">&#10004; {item.fix}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Cheat Sheet</p><h2 className="text-2xl font-extrabold mb-4">Central Bank Quick Reference</h2><div className="p-6 rounded-2xl glass-card space-y-3"><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">HAWKISH</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Rates up or staying high. Currency strengthens. Gold drops. Bonds sell off.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#26A69A]">DOVISH</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Rates down or heading there. Currency weakens. Gold rallies. Equities surge.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#FFB300]">DIVERGENCE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Two banks heading opposite directions = strongest forex trend signal. Trade the direction of the widening gap.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#a855f7]">PRESSER &gt; DECISION</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">The rate decision is the headline. The press conference is the story. Wait for both.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">THE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Don’t fight central banks. They are slower, but they always win. Trade WITH them.</span></p></div></div></motion.div></section>

      {/* S10 — Game */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Test Your Understanding</p><h2 className="text-2xl font-extrabold mb-2">Central Bank Decision Game</h2><p className="text-gray-400 text-sm mb-6">5 scenario-based rounds. Trade the language, not the headline.</p>
      <div className="p-6 rounded-2xl glass-card"><div className="flex items-center justify-between mb-4"><span className="text-xs font-bold text-amber-400">Round {gameRound + 1} of {gameRounds.length}</span><span className="text-xs font-mono text-gray-500">{gameScore}/{gameRounds.length} correct</span></div><p className="text-sm text-gray-300 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: gameRounds[gameRound].scenario }} /><div className="space-y-2">{gameRounds[gameRound].options.map((opt, oi) => { const answered = gameAnswers[gameRound] !== null; const selected = gameAnswers[gameRound] === oi; const isCorrect = opt.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return (<div key={oi}><button onClick={() => handleGameAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt.text }} /></button>{answered && selected && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]"><p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`} dangerouslySetInnerHTML={{ __html: opt.explain }} /></motion.div>)}</div>); })}</div>{gameAnswers[gameRound] !== null && gameRound < gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5"><button onClick={() => setGameRound(r => r + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button></motion.div>)}{gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Outstanding — you can read central bank moves like a macro trader.' : gameScore >= 3 ? 'Good — review the presser vs decision timing and vote split signals.' : 'Re-read the Big 4 banks and rate divergence sections carefully.'}</p></motion.div>)}</div></motion.div></section>

      {/* S11 — Quiz + Certificate */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Knowledge Check</p><h2 className="text-2xl font-extrabold mb-6">Final Quiz &mdash; 8 Questions</h2>
      <div className="space-y-6">{quizQuestions.map((q, qi) => (<div key={qi} className="p-5 rounded-2xl glass-card"><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p><p className="text-sm font-semibold text-white mb-4">{q.q}</p><div className="space-y-2">{q.opts.map((opt, oi) => { const answered = quizAnswers[qi] !== null; const selected = quizAnswers[qi] === oi; const isCorrect = oi === q.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return <button key={oi} onClick={() => handleQuizAnswer(qi, oi)} disabled={answered} className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`}>{opt}</button>; })}</div>{quizAnswers[qi] !== null && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg bg-white/[0.02]"><p className="text-xs text-amber-400" dangerouslySetInnerHTML={{ __html: `<span class="font-bold">&#9989;</span> ${q.explain}` }} /></motion.div>)}</div>))}</div>
      {quizDone && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center"><p className="text-3xl font-extrabold mb-2">{quizScoreVal}%</p><p className="text-sm text-gray-400">{quizScoreVal >= 66 ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate. Review and try again.'}</p></motion.div>)}
      {certUnlocked && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10"><div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}><div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(139,92,246,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} /><div className="relative z-10 text-center"><div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">🏦</div><p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p><p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 8: Interest Rates &amp; Central Banks</strong><br />at ATLAS Academy by Interakktive</p><p className="bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Rate Strategist &mdash;</p><p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L8.3-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p></div></div></motion.div>)}</motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-20 text-center"><Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">&larr; Back to Academy</Link></section>
    </div>
  );
}
