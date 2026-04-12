// app/academy/lesson/trading-multiple-instruments/page.tsx
// ATLAS Academy — Lesson 7.12: Trading Multiple Instruments [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 7
// GROUNDBREAKING: Instrument Expansion Scorecard + Correlation Danger Matrix
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
  const canvasRef = useRef<HTMLCanvasElement>(null); const frameRef = useRef(0); const animRef = useRef(0);
  useEffect(() => { const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext('2d'); if (!ctx) return; const dpr = window.devicePixelRatio || 1; const rect = canvas.getBoundingClientRect(); canvas.width = rect.width * dpr; canvas.height = rect.height * dpr; ctx.scale(dpr, dpr); const loop = () => { ctx.clearRect(0, 0, rect.width, rect.height); drawFn(ctx, rect.width, rect.height, frameRef.current); frameRef.current++; animRef.current = requestAnimationFrame(loop); }; loop(); return () => cancelAnimationFrame(animRef.current); }, [drawFn, height]);
  return <div className="w-full rounded-2xl overflow-hidden bg-black/30 border border-white/5"><canvas ref={canvasRef} style={{ width: '100%', height }} /></div>;
}

// ============================================================
// ANIMATION 1: Focus vs Scatter Equity Curves
// ============================================================
function FocusVsScatterAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.003; const progress = Math.min(1, (t % 10) / 7.5);
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center'; ctx.fillText('Focused (1-2 instruments) vs Scattered (6 instruments)', w / 2, 16);
    const pad = 30; const chartL = pad + 5; const chartR = w - pad; const chartW = chartR - chartL; const top = 40; const bot = h - 35; const chartH = bot - top; const midY = top + chartH * 0.5;
    const totalPts = 150; const visPts = Math.floor(progress * totalPts);
    const seed = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
    const getFocused = (i: number): number => { const norm = i / totalPts; return midY - norm * chartH * 0.55 + (seed(i * 3) - 0.5) * 15 + Math.sin(norm * 12) * 8; };
    const getScattered = (i: number): number => { const norm = i / totalPts; return midY - norm * chartH * 0.05 + (seed(i * 7 + 99) - 0.5) * 30 + Math.sin(norm * 6) * 25 + Math.sin(norm * 15) * 10; };
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 0.5; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(chartL, midY); ctx.lineTo(chartR, midY); ctx.stroke(); ctx.setLineDash([]);
    if (visPts > 1) { ctx.beginPath(); for (let i = 0; i < visPts; i++) { const x = chartL + (i / totalPts) * chartW; if (i === 0) ctx.moveTo(x, getScattered(i)); else ctx.lineTo(x, getScattered(i)); } ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 1.5; ctx.stroke(); const ex = chartL + ((visPts - 1) / totalPts) * chartW; ctx.fillStyle = '#ef4444'; ctx.font = 'bold 8px system-ui'; ctx.textAlign = 'left'; ctx.fillText('6 instruments', ex + 4, getScattered(visPts - 1) + 4); }
    if (visPts > 1) { ctx.beginPath(); for (let i = 0; i < visPts; i++) { const x = chartL + (i / totalPts) * chartW; if (i === 0) ctx.moveTo(x, getFocused(i)); else ctx.lineTo(x, getFocused(i)); } ctx.strokeStyle = '#26A69A'; ctx.lineWidth = 2; ctx.stroke(); const ex = chartL + ((visPts - 1) / totalPts) * chartW; ctx.fillStyle = '#26A69A'; ctx.font = 'bold 8px system-ui'; ctx.textAlign = 'left'; ctx.fillText('1-2 instruments', ex + 4, getFocused(visPts - 1) - 8); }
    if (progress > 0.9) { ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 9px system-ui'; ctx.textAlign = 'center'; ctx.fillText('Depth beats breadth. Master 1, then expand.', w / 2, bot + 16); }
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 2: Correlation Danger Matrix
// ============================================================
function CorrelationMatrixAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.004;
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center'; ctx.fillText('The Correlation Danger Matrix', w / 2, 16);
    const insts = ['XAUUSD', 'EUR/USD', 'GBP/USD', 'DXY', 'NASDAQ', 'US30']; const n = insts.length;
    const corr = [[1,-.45,-.35,-.72,.25,.20],[-.45,1,.88,-.90,.15,.10],[-.35,.88,1,-.82,.12,.08],[-.72,-.90,-.82,1,-.20,-.15],[.25,.15,.12,-.20,1,.95],[.20,.10,.08,-.15,.95,1]];
    const pad = 15; const labelW = 52; const labelH = 22; const gridL = pad + labelW; const gridT = 35 + labelH;
    const cellW = (w - gridL - pad) / n; const cellH = Math.min(30, (h - gridT - 20) / n);
    const animProgress = Math.min(1, (t % 8) / 4);
    ctx.font = 'bold 7px system-ui'; ctx.textAlign = 'center';
    insts.forEach((inst, i) => { const x = gridL + i * cellW + cellW / 2; ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.save(); ctx.translate(x, gridT - 5); ctx.rotate(-0.4); ctx.fillText(inst, 0, 0); ctx.restore(); });
    insts.forEach((inst, row) => { const y = gridT + row * cellH; ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '8px system-ui'; ctx.textAlign = 'right'; ctx.fillText(inst, gridL - 5, y + cellH / 2 + 3);
      insts.forEach((_, col) => { const x = gridL + col * cellW; const val = corr[row][col]; const absVal = Math.abs(val); const cellProgress = Math.max(0, Math.min(1, animProgress * 2 - (row + col) * 0.08)); if (cellProgress <= 0) return;
        let r2 = 100, g = 100, b = 100; if (val > 0.5) { r2 = 239; g = 83; b = 80; } else if (val > 0.2) { r2 = 249; g = 115; b = 22; } else if (val < -0.5) { r2 = 59; g = 130; b = 246; } else if (val < -0.2) { r2 = 99; g = 102; b = 241; }
        const isDanger = row !== col && absVal > 0.8; const pulse = isDanger ? Math.sin(t * 3) * 0.15 + 0.85 : 1;
        ctx.fillStyle = `rgba(${r2},${g},${b},${absVal * 0.5 * cellProgress * pulse})`; ctx.fillRect(x + 1, y + 1, cellW - 2, cellH - 2);
        if (isDanger && cellProgress > 0.5) { ctx.strokeStyle = `rgba(${r2},${g},${b},0.6)`; ctx.lineWidth = 1.5; ctx.strokeRect(x + 1, y + 1, cellW - 2, cellH - 2); }
        if (cellProgress > 0.5 && row !== col) { ctx.fillStyle = `rgba(255,255,255,${absVal > 0.5 ? 0.8 : 0.3})`; ctx.font = `${absVal > 0.8 ? 'bold ' : ''}7px system-ui`; ctx.textAlign = 'center'; ctx.fillText(val.toFixed(2), x + cellW / 2, y + cellH / 2 + 3); }
        if (row === col) { ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(x + 1, y + 1, cellW - 2, cellH - 2); }
      });
    });
    if (animProgress > 0.8) { ctx.fillStyle = 'rgba(239,83,80,0.7)'; ctx.font = 'bold 8px system-ui'; ctx.textAlign = 'center'; ctx.fillText('⚠️ EUR/USD + GBP/USD = 0.88 → Trading both = DOUBLED risk, not diversification', w / 2, h - 8); }
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// SCORECARD DATA
// ============================================================
interface CriterionScore { criterion: string; description: string; options: { label: string; score: number }[]; selected: number | null; }
const defaultCriteria = (): CriterionScore[] => [
  { criterion: '100+ trades on primary instrument', description: 'Proven edge on PRIMARY before expanding.', options: [{ label: '100+ trades ✓', score: 3 }, { label: '50-99 trades', score: 1 }, { label: 'Under 50', score: 0 }], selected: null },
  { criterion: 'Positive EV on primary (last 50)', description: 'Primary must still be profitable.', options: [{ label: 'EV > +0.3%', score: 3 }, { label: 'EV +0.1 to 0.3%', score: 2 }, { label: 'EV negative/unknown', score: 0 }], selected: null },
  { criterion: 'Backtested on new instrument (50+)', description: '50 backtested setups minimum.', options: [{ label: '50+ setups', score: 3 }, { label: '20-49 setups', score: 1 }, { label: 'Not backtested', score: 0 }], selected: null },
  { criterion: 'Correlation check (<0.5)', description: '>0.7 = doubled risk, not diversification.', options: [{ label: '< 0.5', score: 3 }, { label: '0.5-0.7', score: 2 }, { label: '> 0.7', score: 0 }], selected: null },
  { criterion: 'Session compatibility', description: 'Must be active during YOUR kill zone.', options: [{ label: 'Peak volume in my KZ', score: 3 }, { label: 'Moderate volume', score: 2 }, { label: 'Low/no volume', score: 0 }], selected: null },
  { criterion: 'Spread quality', description: 'Spread must not erode edge.', options: [{ label: '< 20% of avg SL', score: 3 }, { label: '20-40% of avg SL', score: 1 }, { label: '> 40% of avg SL', score: 0 }], selected: null },
  { criterion: 'Character understanding', description: 'Every instrument has a personality.', options: [{ label: '3+ months studied', score: 3 }, { label: 'Few weeks observed', score: 1 }, { label: 'Never studied', score: 0 }], selected: null },
  { criterion: 'Psychological bandwidth', description: 'Can you monitor multiple without degrading primary?', options: [{ label: 'Confident — primary won\'t suffer', score: 3 }, { label: 'Uncertain — might split focus', score: 1 }, { label: 'Already overwhelmed', score: 0 }], selected: null },
];

// ============================================================
// CONTENT DATA
// ============================================================
const expansionCriteria = [
  { title: 'Criteria 1-4: Foundation Checks', desc: '<strong>1. 100+ trades on primary.</strong> Edge must be PROVEN before expansion.<br/><br/><strong>2. Positive EV on primary (last 50).</strong> If primary is declining, fix THAT first.<br/><br/><strong>3. 50+ backtested setups on new instrument.</strong> &ldquo;I think it works&rdquo; is not data.<br/><br/><strong>4. Correlation &lt;0.5.</strong> EUR/USD + GBP/USD at 0.88 is one position, not two.' },
  { title: 'Criteria 5-8: Compatibility Checks', desc: '<strong>5. Session compatibility.</strong> New instrument must have peak volume in YOUR kill zone.<br/><br/><strong>6. Spread quality.</strong> If spread eats &gt;20% of average SL, instrument is too expensive.<br/><br/><strong>7. Character understanding (3+ months).</strong> Gold spikes on news. NASDAQ trends in sessions. Know the personality BEFORE trading it.<br/><br/><strong>8. Psychological bandwidth.</strong> If adding a 2nd instrument makes your primary worse, net result is NEGATIVE.' },
];

const correlationPairs = [
  { pair: 'EUR/USD + GBP/USD', corr: '+0.88', verdict: '☠️ Nearly identical. Double exposure.', color: '#ef4444' },
  { pair: 'NASDAQ + US30', corr: '+0.95', verdict: '☠️ Same index. Choose ONE.', color: '#ef4444' },
  { pair: 'XAUUSD + EUR/USD', corr: '-0.45', verdict: '✓ Inverse-ish. Good diversification.', color: '#26A69A' },
  { pair: 'XAUUSD + NASDAQ', corr: '+0.25', verdict: '✓ Low correlation. Independent setups.', color: '#26A69A' },
  { pair: 'EUR/USD + DXY', corr: '-0.90', verdict: '☠️ Perfect inverse. Same trade.', color: '#ef4444' },
];

const removalTriggers = [
  { trigger: 'Negative EV after 50+ trades', detail: 'The instrument does not suit your model. Remove immediately.', color: '#ef4444' },
  { trigger: 'Primary EV drops after expansion', detail: 'New instrument degraded primary execution. Net NEGATIVE even if individually positive.', color: '#ef4444' },
  { trigger: 'Emotional state degrades', detail: 'Anxious, scattered, overwhelmed monitoring 2+ instruments. Bandwidth exceeded.', color: '#FFB300' },
  { trigger: 'Regime change invalidates character study', detail: 'Instrument behaviour shifted. Re-study before continuing.', color: '#FFB300' },
];

const expansionMistakes = [
  { title: 'Adding for "Diversification"', mistake: 'EUR/USD + GBP/USD + AUD/USD = three USD pairs = ONE position in different wrappers.', fix: 'True diversification requires correlation <0.5. XAUUSD + NASDAQ + EUR/USD is diversified.' },
  { title: 'Expanding Before Mastery', mistake: '2 instruments with 40 trades each = TWO unproven edges instead of one half-proven edge.', fix: 'Finish 100-trade milestone on primary FIRST.' },
  { title: 'Treating All Instruments the Same', mistake: 'Same parameters (stop size, session, R:R) from Gold to NASDAQ. Different ATR, spread, character.', fix: 'Each instrument needs its own parameters from 50+ backtested setups.' },
  { title: 'FOMO-Driven Expansion', mistake: '"I saw a setup on EUR/USD and I don\'t trade it — I missed money." You DIDN\'T miss money. You don\'t trade it.', fix: 'Opportunity cost only applies to instruments IN your playbook.' },
];

const quizQuestions = [
  { q: 'Before adding a second instrument, the MINIMUM requirement on your primary is:', opts: ['20 trades and a profitable month', '100+ trades with positive EV over the last 50', '50 trades and 55%+ WR', 'Any positive monthly return'], correct: 1, explain: 'The 100-trade minimum provides statistical reliability. Below 100, the edge might be variance. Positive EV over the LAST 50 confirms the edge is current, not historical.' },
  { q: 'EUR/USD and GBP/USD have 0.88 correlation. If you long both at 1% risk each, effective risk is:', opts: ['1% — separate trades', '2% — simple addition', 'Close to 2% — they move together, doubling exposure', '1.5% — partial overlap'], correct: 2, explain: 'At 0.88 correlation, the two positions move nearly in lockstep. A Dollar strengthening event hits both simultaneously. Your effective risk is approximately 2%, not 1%.' },
  { q: 'You trade XAUUSD during London. Friend suggests adding USD/JPY. The problem is:', opts: ['Gold and JPY are negatively correlated', 'USD/JPY peak volume is Tokyo session, not London', 'JPY pairs are too volatile', 'No problem'], correct: 1, explain: 'USD/JPY has peak volume during the Tokyo/Asian session. During your London kill zone, USD/JPY has moderate-to-low volume with wider spreads and weaker patterns.' },
  { q: 'Your XAUUSD edge has +0.45% EV. You add NASDAQ without backtesting. First 10 NASDAQ trades are breakeven. What happened?', opts: ['Edge stayed the same', 'Edge was diluted — breakeven trades reduced portfolio EV while consuming focus', 'Edge improved — diversification helps', 'Cannot determine'], correct: 1, explain: '10 breakeven trades consumed time and attention that could have been spent on Gold. Your portfolio EV dropped even though NASDAQ did not lose money. Dilution is real.' },
  { q: 'Correct order for instrument expansion:', opts: ['Find profitable-looking instruments → Add → Track', 'Master primary → Backtest new → Demo/micro test → Evaluate → Add or reject', 'Add 3-4 at once to diversify quickly', 'Add the most volatile for bigger returns'], correct: 1, explain: 'Sequential expansion with gates at each step. Master → Backtest → Test → Evaluate. Each step must pass before advancing, just like the Scale Ladder.' },
  { q: 'An instrument\'s "character" refers to:', opts: ['Average daily range in pips', 'How it behaves in different sessions, around news, in trends vs ranges', 'Correlation with the Dollar', 'Spread and commission costs'], correct: 1, explain: 'Character is the personality — how Gold spikes on geopolitical news, how NASDAQ trends during US hours, how EUR/USD ranges during Asia. This knowledge takes months to build.' },
  { q: 'You trade 2 instruments profitably. Want to add a 3rd. Primary EV dropped from +0.5% to +0.2% last month. What should you do?', opts: ['Add the 3rd — it might compensate', 'Fix the primary decline FIRST. Do not add complexity to a deteriorating foundation.', 'Drop one instrument, focus on strongest', 'Add 3rd but reduce primary risk'], correct: 1, explain: 'A declining primary is a red flag. Adding a third instrument to a weakening foundation compounds the problem. Diagnose and fix the primary decline before any expansion.' },
  { q: 'Maximum instruments a developing trader should trade simultaneously:', opts: ['As many as possible', '1-2 during first 6 months, expanding to 3-4 only after proving each', '5-6 across asset classes', 'Depends on account size'], correct: 1, explain: '1-2 instruments for the first 6 months builds depth. Expansion to 3-4 only after each instrument has a proven 50+ trade track record. Most professionals peak at 2-3.' },
];

const gameRounds = [
  { scenario: '<strong>You trade XAUUSD profitably (180 trades, +0.52% EV).</strong> Community buzzing about NASDAQ. Watched 2 weeks. Backtested 15 setups — 10 winners. Want to add immediately.', options: [
    { text: 'Add it — 10/15 is 67% WR, better than Gold', correct: false, explain: '15 setups is a glance, not a backtest. Need 50+. 2 weeks does not reveal character. 67% on 15 trades is meaningless noise.' },
    { text: 'Not ready — 15 backtests insufficient, 2 weeks doesn\'t reveal character. Need 50+ backtests and 3+ months.', correct: true, explain: 'Three criteria unmet: backtest sample (15 vs 50), character understanding (2 weeks vs 3 months), no correlation or session check. Your Gold edge is solid — protect it.' },
    { text: 'Add on demo for 2 weeks, then switch to live', correct: false, explain: 'Demo does not solve the fundamental issue — insufficient backtesting. 2 weeks demo + 2 weeks watching = 1 month. Need 3+ months.' },
  ]},
  { scenario: '<strong>You trade XAUUSD and EUR/USD.</strong> Gold EV +0.48%, EUR/USD +0.35%. Want to add GBP/USD because "it looks similar." EUR-GBP correlation: 0.88.', options: [
    { text: 'Acceptable — adding a third profitable instrument', correct: false, explain: 'EUR/USD and GBP/USD move together 88% of the time. Long both at 1% each = effectively 2% risk on the same Dollar move.' },
    { text: 'Dangerous — 0.88 correlation means GBP is functionally the same trade. Doubles exposure, not diversification.', correct: true, explain: 'At 0.88 correlation, a losing EUR trade almost guarantees a losing GBP trade. Choose an instrument with <0.5 correlation instead.' },
    { text: 'Fine if you reduce risk on each to 0.5%', correct: false, explain: 'Reducing risk does not solve correlation. You still consume bandwidth on a redundant position.' },
  ]},
  { scenario: '<strong>You trade XAUUSD during LON-NY overlap (12-16 UTC).</strong> Fellow trader suggests AUD/USD — "it trends beautifully." AUD peak volume: Asian-London overlap (23:00-08:00 UTC).', options: [
    { text: 'Yes — trade AUD mornings, Gold afternoons. Two kill zones.', correct: false, explain: 'Two kill zones means twice the screen time, twice the emotional load, and AUD during your KZ has wider spreads and weaker trends.' },
    { text: 'No — AUD peak volume is outside your kill zone. Low-volume AUD during LON-NY has wider spreads.', correct: true, explain: 'Session compatibility is non-negotiable. AUD during 12-16 UTC has moderate-to-low volume. The patterns that trend beautifully in Asian session do not replicate during NY afternoon.' },
    { text: 'Add but only trade AUD during high-impact AUD news', correct: false, explain: 'News-only trading on a secondary instrument is a completely different skill. One instrument, one approach, one kill zone.' },
  ]},
  { scenario: '<strong>Month 8.</strong> XAUUSD only. 220 trades, 54% WR, +0.55% EV. Friends trade 4-5 instruments. You feel "behind."', options: [
    { text: 'They\'re right — expand to 3-4 to catch more opportunities', correct: false, explain: 'More instruments does NOT equal more profit. Your +0.55% EV is objectively excellent. Their attention is split, likely reducing per-instrument EV.' },
    { text: 'FOMO is not a trading criterion. Your edge is proven. When stats say expand, expand. When they say depth, stay deep.', correct: true, explain: 'Your 220 trades at +0.55% EV is exceptional. When your setups are scarce AND you have capacity, expansion adds value. Not because others do it.' },
    { text: 'Stay on Gold forever — specialists always outperform', correct: false, explain: 'Specialisation is powerful but expansion at the RIGHT TIME adds value. The issue is premature expansion driven by FOMO, not expansion itself.' },
  ]},
  { scenario: '<strong>Added EUR/USD 6 weeks ago.</strong> XAUUSD EV remains +0.50%. EUR/USD EV: &minus;0.15% over 30 trades. Blended portfolio EV: +0.28% (was +0.50%).', options: [
    { text: 'Give EUR/USD more time — 30 trades isn\'t enough', correct: false, explain: '30 trades at negative EV is a clear signal. Your blended EV dropped 44%. The new instrument is the variable.' },
    { text: 'Drop EUR/USD immediately. Return to Gold only. Diagnose what went wrong.', correct: true, explain: 'EUR/USD is actively damaging performance. Drop it, return to single-instrument profitability. Diagnose: character? Model mismatch? Execution? Session? Fix on paper first.' },
    { text: 'Reduce EUR/USD risk to 0.25% and continue', correct: false, explain: 'Reduced risk on a negative-EV instrument still consumes attention. A negative-EV instrument at any risk is a drag on performance AND psychology.' },
  ]},
];

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function TradingMultipleInstrumentsPage() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setOpenSections(p => ({ ...p, [id]: !p[id] }));

  // Scorecard
  const [criteria, setCriteria] = useState<CriterionScore[]>(defaultCriteria());
  const [instrumentName, setInstrumentName] = useState('');
  const [scorecardDone, setScorecardDone] = useState(false);
  const handleCriterionSelect = (idx: number, optIdx: number) => { setCriteria(prev => { const next = [...prev]; next[idx] = { ...next[idx], selected: optIdx }; return next; }); setScorecardDone(false); };
  const allAnswered = criteria.every(c => c.selected !== null);
  const getTotalScore = (): number => criteria.reduce<number>((sum, c) => { if (c.selected === null) return sum; return sum + c.options[c.selected].score; }, 0);
  const getVerdict = (): { label: string; color: string; feedback: string } => {
    const score = getTotalScore(); const hasZero = criteria.some(c => c.selected !== null && c.options[c.selected!].score === 0);
    if (hasZero) return { label: 'NO-GO', color: '#ef4444', feedback: `One or more criteria scored 0 — automatic NO-GO. Fix the failed criterion first.` };
    if (score >= 21) return { label: 'GO', color: '#26A69A', feedback: `${instrumentName || 'This instrument'} passes. Proceed with micro-risk test (0.25% for 30 trades). Track EV separately.` };
    if (score >= 15) return { label: 'CAUTION', color: '#FFB300', feedback: `${instrumentName || 'This instrument'} has potential but some criteria need strengthening. 2-4 more weeks preparation.` };
    return { label: 'NO-GO', color: '#ef4444', feedback: `Too many weak criteria. Focus on primary and revisit when more preparation is complete.` };
  };

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
        <div className="flex items-center gap-2"><Crown className="w-3.5 h-3.5 text-amber-400" /><span className="text-xs font-bold text-amber-400">PRO &middot; LEVEL 7</span></div>
      </nav>

      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6 pt-20">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(245,158,11,0.08),transparent_70%)] pointer-events-none" />
        <div className="absolute top-[-50px] right-[20%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(217,70,239,0.05),transparent_70%)] pointer-events-none" />
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.15 } } }} className="relative z-10">
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 7 &middot; Lesson 12</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Trading Multiple<br /><span className="bg-gradient-to-r from-teal-400 via-blue-400 to-purple-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Instruments</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">Expand your opportunity set without diluting the edge you have built. Eight criteria that must be met before adding a single new instrument.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* S00 */}
      <section className="max-w-2xl mx-auto px-5 py-20"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
        <div className="p-6 rounded-2xl glass-card mb-6">
          <p className="text-xl font-extrabold mb-3">🔍 The Chef&rsquo;s Signature Dish</p>
          <p className="text-gray-400 leading-relaxed mb-4">A chef who mastered <strong className="text-amber-400">one signature dish</strong> — perfect, consistent, customers love it. Now imagine adding 5 more dishes overnight. Kitchen overwhelmed, every dish suffers, signature dish gets worse. Instruments work the same way. <strong className="text-white">Depth beats breadth.</strong></p>
        </div>
        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
          <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-green-400">Group A (1-2 instruments): 52% WR, 1:1.9 R:R, +0.49% EV, 14% DD.</strong> <strong className="text-red-400">Group B (4-6 instruments): 47% WR, 1:1.4 R:R, +0.11% EV, 21% DD.</strong> Group B had MORE trades but LESS profit. Attention split = execution degraded.</p>
        </div>
      </motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Equity Proof</p><h2 className="text-2xl font-extrabold mb-4">Focus vs Scatter</h2><p className="text-gray-400 text-sm mb-6">Same strategy, same period. Focused trader compounds. Scattered trader churns.</p><FocusVsScatterAnimation /></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Correlation Matrix</p><h2 className="text-2xl font-extrabold mb-4">Hidden Risk of Correlated Pairs</h2><p className="text-gray-400 text-sm mb-6">Red = high positive (same trade). Blue = inverse. Add instruments that are GREY, not red.</p><CorrelationMatrixAnimation /></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The 8 Expansion Criteria</p><h2 className="text-2xl font-extrabold mb-4">Foundation + Compatibility</h2><div className="space-y-3">{expansionCriteria.map((item, i) => (<div key={i}><button onClick={() => toggle(`ec-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`ec-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`ec-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.desc }} /></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Correlation Rules</p><h2 className="text-2xl font-extrabold mb-4">How Correlation Secretly Doubles Your Risk</h2><div className="p-6 rounded-2xl glass-card">
        <div className="grid grid-cols-3 gap-2 mb-4"><div className="p-3 rounded-xl bg-green-500/5 border border-green-500/10 text-center"><p className="text-xs font-bold text-green-400">&lt; 0.3</p><p className="text-[10px] text-gray-400">IDEAL</p></div><div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 text-center"><p className="text-xs font-bold text-amber-400">0.3 – 0.7</p><p className="text-[10px] text-gray-400">ACCEPTABLE</p></div><div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10 text-center"><p className="text-xs font-bold text-red-400">&gt; 0.7</p><p className="text-[10px] text-gray-400">DANGEROUS</p></div></div>
        <div className="space-y-2">{correlationPairs.map((item, i) => (<div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]"><span className="text-xs font-mono font-bold" style={{ color: item.color }}>{item.corr}</span><div className="flex-1"><p className="text-xs font-bold text-gray-300">{item.pair}</p><p className="text-[10px] text-gray-500">{item.verdict}</p></div></div>))}</div>
      </div></motion.div></section>

      {/* S05 — GROUNDBREAKING: Instrument Expansion Scorecard */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Interactive Challenge</p><h2 className="text-2xl font-extrabold mb-2">Instrument Expansion Scorecard</h2><p className="text-gray-400 text-sm mb-6">Evaluate a new instrument against all 8 criteria. GO / CAUTION / NO-GO verdict.</p>
      <div className="p-6 rounded-2xl glass-card">{!scorecardDone ? (<div className="space-y-4">
        <div><label className="text-xs font-bold text-gray-300 mb-1.5 block">New Instrument Name</label><input type="text" value={instrumentName} onChange={e => setInstrumentName(e.target.value)} placeholder="e.g., EUR/USD, NASDAQ" className="w-full p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-gray-600 focus:border-amber-500/30 outline-none" /></div>
        {criteria.map((c, ci) => (<div key={ci} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-xs font-bold text-amber-400 mb-0.5">Criterion {ci + 1}</p><p className="text-sm font-semibold text-gray-200 mb-1">{c.criterion}</p><p className="text-[11px] text-gray-500 mb-3">{c.description}</p><div className="space-y-1.5">{c.options.map((opt, oi) => (<button key={oi} onClick={() => handleCriterionSelect(ci, oi)} className={`w-full text-left p-2.5 rounded-lg text-xs font-semibold transition-all ${c.selected === oi ? 'border-2' : 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] text-gray-400'}`} style={c.selected === oi ? { borderColor: opt.score === 3 ? '#26A69A60' : opt.score >= 1 ? '#FFB30060' : '#ef434460', background: opt.score === 3 ? '#26A69A10' : opt.score >= 1 ? '#FFB30010' : '#ef434410', color: opt.score === 3 ? '#26A69A' : opt.score >= 1 ? '#FFB300' : '#ef4444' } : {}}><span className="flex items-center gap-2"><span className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${opt.score === 3 ? 'bg-green-500/20 text-green-400' : opt.score >= 1 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>{opt.score}</span>{opt.label}</span></button>))}</div></div>))}
        {allAnswered && (<button onClick={() => setScorecardDone(true)} className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Generate Verdict &rarr;</button>)}
      </div>) : (<motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
        <div className="p-5 rounded-xl text-center border" style={{ borderColor: getVerdict().color + '30', background: getVerdict().color + '08' }}><p className="text-4xl font-black mb-1" style={{ color: getVerdict().color }}>{getVerdict().label}</p><p className="text-sm font-semibold text-white mb-1">{instrumentName || 'New Instrument'}</p><p className="text-xs text-gray-400">{getTotalScore()}/24 points</p></div>
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-xs text-gray-400 leading-relaxed">{getVerdict().feedback}</p></div>
        <div className="space-y-1.5">{criteria.map((c, i) => { const score = c.selected !== null ? c.options[c.selected].score : 0; return (<div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]"><span className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${score === 3 ? 'bg-green-500/20 text-green-400' : score >= 1 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>{score}</span><p className="text-[11px] text-gray-400 flex-1 truncate">{c.criterion}</p></div>); })}</div>
        <button onClick={() => { setCriteria(defaultCriteria()); setInstrumentName(''); setScorecardDone(false); }} className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-semibold text-gray-300 hover:bg-white/[0.07]">Evaluate Another</button>
      </motion.div>)}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Expansion Timeline</p><h2 className="text-2xl font-extrabold mb-4">Month-by-Month Path</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        {[{ m: 'Months 1-4', n: '1', f: 'Master primary. 100+ trades. Prove the edge.', c: '#3b82f6' }, { m: 'Months 5-6', n: '1+research', f: 'Backtest + study 2nd instrument. 50+ setups. Do NOT trade live yet.', c: '#8b5cf6' }, { m: 'Months 7-8', n: '1+1 micro', f: 'Add 2nd at micro risk (0.25%). 30 trades. Track EV separately.', c: '#26A69A' }, { m: 'Months 9-10', n: '2', f: 'If micro test positive, integrate at normal risk. Monitor primary EV.', c: '#f59e0b' }, { m: 'Months 11+', n: '2+research', f: 'Only after both stable 2+ months. Repeat for 3rd. Most peak at 2-3.', c: '#a855f7' }].map(item => (<div key={item.m} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong style={{ color: item.c }}>{item.m} ({item.n})</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">{item.f}</span></p></div>))}
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; When to Remove</p><h2 className="text-2xl font-extrabold mb-4">The 4 Removal Triggers</h2><div className="space-y-3">{removalTriggers.map((item, i) => (<div key={i}><button onClick={() => toggle(`rt-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold" style={{ color: item.color }}>⚠️ {item.trigger}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`rt-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`rt-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-sm text-gray-400">{item.detail}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Expansion Mistakes</p><h2 className="text-2xl font-extrabold mb-4">4 Errors That Destroy Proven Edges</h2><div className="space-y-3">{expansionMistakes.map((item, i) => (<div key={i}><button onClick={() => toggle(`em-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`em-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`em-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-xs text-red-400 mb-2">&#10060; {item.mistake}</p><p className="text-xs text-green-400">&#10004; {item.fix}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Cheat Sheet</p><h2 className="text-2xl font-extrabold mb-4">Expansion Quick Reference</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">8 CRITERIA</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">100 trades primary, positive EV, 50 backtests, correlation &lt;0.5, session fit, spread, character, bandwidth.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#ef4444]">CORRELATION</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">&lt;0.3 ideal. 0.3-0.7 acceptable. &gt;0.7 = same trade. EUR+GBP = double exposure.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#3b82f6]">TIMELINE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Month 1-4: master. 5-6: research. 7-8: micro test. 9-10: integrate. 11+: consider 3rd.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#26A69A]">MAX COUNT</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">1-2 for year 1. 2-3 for year 2. More is rarely better.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#FFB300]">THE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Depth beats breadth. One mastered instrument &gt; five half-learned instruments. Always.</span></p></div>
      </div></motion.div></section>

      {/* S10 — Game */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Test Your Understanding</p><h2 className="text-2xl font-extrabold mb-2">Instrument Expansion Game</h2><p className="text-gray-400 text-sm mb-6">5 expansion scenarios. Apply the 8 criteria.</p>
      <div className="p-6 rounded-2xl glass-card"><div className="flex items-center justify-between mb-4"><span className="text-xs font-bold text-amber-400">Round {gameRound + 1} of {gameRounds.length}</span><span className="text-xs font-mono text-gray-500">{gameScore}/{gameRounds.length} correct</span></div><p className="text-sm text-gray-300 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: gameRounds[gameRound].scenario }} /><div className="space-y-2">{gameRounds[gameRound].options.map((opt, oi) => { const answered = gameAnswers[gameRound] !== null; const selected = gameAnswers[gameRound] === oi; const isCorrect = opt.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return (<div key={oi}><button onClick={() => handleGameAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt.text }} /></button>{answered && selected && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]"><p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`} dangerouslySetInnerHTML={{ __html: `${isCorrect ? '✓' : '✗'} ${opt.explain}` }} /></motion.div>)}</div>); })}</div>{gameAnswers[gameRound] !== null && gameRound < gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5"><button onClick={() => setGameRound(r => r + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button></motion.div>)}{gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Excellent — portfolio manager level.' : gameScore >= 3 ? 'Good — review correlation and FOMO traps.' : 'Re-read the 8 Criteria and Correlation Rules.'}</p></motion.div>)}</div></motion.div></section>

      {/* S11 — Quiz + Certificate */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Knowledge Check</p><h2 className="text-2xl font-extrabold mb-6">Final Quiz &mdash; 8 Questions</h2>
      <div className="space-y-6">{quizQuestions.map((q, qi) => (<div key={qi} className="p-5 rounded-2xl glass-card"><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p><p className="text-sm font-semibold text-white mb-4">{q.q}</p><div className="space-y-2">{q.opts.map((opt, oi) => { const answered = quizAnswers[qi] !== null; const selected = quizAnswers[qi] === oi; const isCorrect = oi === q.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return <button key={oi} onClick={() => handleQuizAnswer(qi, oi)} disabled={answered} className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`}>{opt}</button>; })}</div>{quizAnswers[qi] !== null && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg bg-white/[0.02]"><p className="text-xs text-amber-400" dangerouslySetInnerHTML={{ __html: `<span class="font-bold">&#9989;</span> ${q.explain}` }} /></motion.div>)}</div>))}</div>
      {quizDone && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center"><p className="text-3xl font-extrabold mb-2">{quizScoreVal}%</p><p className="text-sm text-gray-400">{quizScoreVal >= 66 ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate.'}</p></motion.div>)}
      {certUnlocked && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10"><div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}><div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(139,92,246,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} /><div className="relative z-10 text-center"><div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-teal-500 via-blue-500 to-purple-500 flex items-center justify-center text-3xl shadow-lg shadow-teal-500/30">🎛️</div><p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p><p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 7: Trading Multiple Instruments</strong><br />at ATLAS Academy by Interakktive</p><p className="bg-gradient-to-r from-teal-400 via-blue-400 to-purple-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Portfolio Strategist &mdash;</p><p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L7.12-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p></div></div></motion.div>)}</motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-20 text-center"><Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">&larr; Back to Academy</Link></section>
    </div>
  );
}
