// app/academy/lesson/trading-multiple-instruments/page.tsx
// ATLAS Academy — Lesson 7.12: Trading Multiple Instruments [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 7
// GROUNDBREAKING: Instrument Expansion Scorecard + Correlation Danger Matrix
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Crown, ChevronDown } from 'lucide-react';

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
// ANIMATION 1: Focus vs Scatter — Equity Curve Comparison
// Focused trader (1-2 instruments) vs scattered (6 instruments)
// ============================================================
function FocusVsScatterAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.003;
    const progress = Math.min(1, (t % 10) / 7.5);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('Focused (1-2 instruments) vs Scattered (6 instruments)', w / 2, 16);

    const pad = 30;
    const chartL = pad + 5;
    const chartR = w - pad;
    const chartW = chartR - chartL;
    const top = 40;
    const bot = h - 35;
    const chartH = bot - top;
    const midY = top + chartH * 0.5;

    const totalPts = 150;
    const visPts = Math.floor(progress * totalPts);
    const seed = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

    // Focused trader: steady growth, small DD
    const getFocused = (i: number): number => {
      const norm = i / totalPts;
      const trend = norm * chartH * 0.55;
      const noise = (seed(i * 3) - 0.5) * 15;
      const dd = Math.sin(norm * 12) * 8;
      return midY - trend + noise + dd;
    };

    // Scattered trader: choppy, big DD, net flat
    const getScattered = (i: number): number => {
      const norm = i / totalPts;
      const trend = norm * chartH * 0.05;
      const noise = (seed(i * 7 + 99) - 0.5) * 30;
      const dd = Math.sin(norm * 6) * 25 + Math.sin(norm * 15) * 10;
      return midY - trend + noise + dd;
    };

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 0.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(chartL, midY); ctx.lineTo(chartR, midY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.font = '7px system-ui'; ctx.textAlign = 'right';
    ctx.fillText('Starting Balance', chartL - 4, midY + 3);

    // Draw scattered first (behind)
    if (visPts > 1) {
      ctx.beginPath();
      for (let i = 0; i < visPts; i++) {
        const x = chartL + (i / totalPts) * chartW;
        const y = getScattered(i);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 1.5; ctx.stroke();

      // Label
      const endX = chartL + ((visPts - 1) / totalPts) * chartW;
      ctx.fillStyle = '#ef4444'; ctx.font = 'bold 8px system-ui'; ctx.textAlign = 'left';
      ctx.fillText('6 instruments', endX + 5, getScattered(visPts - 1) + 4);
    }

    // Draw focused on top
    if (visPts > 1) {
      ctx.beginPath();
      for (let i = 0; i < visPts; i++) {
        const x = chartL + (i / totalPts) * chartW;
        const y = getFocused(i);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#26A69A'; ctx.lineWidth = 2; ctx.stroke();

      const endX = chartL + ((visPts - 1) / totalPts) * chartW;
      ctx.fillStyle = '#26A69A'; ctx.font = 'bold 8px system-ui'; ctx.textAlign = 'left';
      ctx.fillText('1-2 instruments', endX + 5, getFocused(visPts - 1) - 8);
    }

    // Insight
    if (progress > 0.9) {
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 9px system-ui'; ctx.textAlign = 'center';
      ctx.fillText('Depth beats breadth. Master 1, then expand.', w / 2, bot + 16);
    }
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 2: Correlation Danger Matrix
// Shows how correlated instruments multiply risk
// ============================================================
function CorrelationMatrixAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.004;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('The Correlation Danger Matrix', w / 2, 16);

    const instruments = ['XAUUSD', 'EUR/USD', 'GBP/USD', 'DXY', 'NASDAQ', 'US30'];
    const n = instruments.length;

    // Correlation values (simplified symmetric matrix)
    const corr: number[][] = [
      [1.00, -0.45, -0.35, -0.72, 0.25, 0.20],
      [-0.45, 1.00, 0.88, -0.90, 0.15, 0.10],
      [-0.35, 0.88, 1.00, -0.82, 0.12, 0.08],
      [-0.72, -0.90, -0.82, 1.00, -0.20, -0.15],
      [0.25, 0.15, 0.12, -0.20, 1.00, 0.95],
      [0.20, 0.10, 0.08, -0.15, 0.95, 1.00],
    ];

    const pad = 15;
    const labelW = 52;
    const labelH = 22;
    const gridL = pad + labelW;
    const gridT = 35 + labelH;
    const cellW = (w - gridL - pad) / n;
    const cellH = Math.min(30, (h - gridT - 20) / n);

    const animProgress = Math.min(1, (t % 8) / 4);
    const highlightPair = Math.floor((t % 8) / 2);

    // Column headers
    ctx.font = 'bold 7px system-ui'; ctx.textAlign = 'center';
    instruments.forEach((inst, i) => {
      const x = gridL + i * cellW + cellW / 2;
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.save();
      ctx.translate(x, gridT - 5);
      ctx.rotate(-0.4);
      ctx.fillText(inst, 0, 0);
      ctx.restore();
    });

    // Row headers + cells
    instruments.forEach((inst, row) => {
      const y = gridT + row * cellH;

      // Row label
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '8px system-ui'; ctx.textAlign = 'right';
      ctx.fillText(inst, gridL - 5, y + cellH / 2 + 3);

      instruments.forEach((_, col) => {
        const x = gridL + col * cellW;
        const val = corr[row][col];
        const absVal = Math.abs(val);
        const cellProgress = Math.max(0, Math.min(1, animProgress * 2 - (row + col) * 0.08));

        if (cellProgress <= 0) return;

        // Color: strong positive = red (danger), strong negative = blue, neutral = gray
        let r = 100, g = 100, b = 100;
        if (val > 0.5) { r = 239; g = 83; b = 80; }
        else if (val > 0.2) { r = 249; g = 115; b = 22; }
        else if (val < -0.5) { r = 59; g = 130; b = 246; }
        else if (val < -0.2) { r = 99; g = 102; b = 241; }

        // Highlight dangerous pairs
        const isDanger = row !== col && absVal > 0.8;
        const pulse = isDanger ? Math.sin(t * 3) * 0.15 + 0.85 : 1;

        ctx.fillStyle = `rgba(${r},${g},${b},${absVal * 0.5 * cellProgress * pulse})`;
        ctx.fillRect(x + 1, y + 1, cellW - 2, cellH - 2);

        // Border for dangerous
        if (isDanger && cellProgress > 0.5) {
          ctx.strokeStyle = `rgba(${r},${g},${b},0.6)`;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x + 1, y + 1, cellW - 2, cellH - 2);
        }

        // Value text
        if (cellProgress > 0.5 && row !== col) {
          ctx.fillStyle = `rgba(255,255,255,${absVal > 0.5 ? 0.8 : 0.3})`;
          ctx.font = `${absVal > 0.8 ? 'bold ' : ''}7px system-ui`;
          ctx.textAlign = 'center';
          ctx.fillText(val.toFixed(2), x + cellW / 2, y + cellH / 2 + 3);
        }

        // Diagonal (self)
        if (row === col) {
          ctx.fillStyle = 'rgba(255,255,255,0.08)';
          ctx.fillRect(x + 1, y + 1, cellW - 2, cellH - 2);
        }
      });
    });

    // Warning
    if (animProgress > 0.8) {
      ctx.fillStyle = 'rgba(239,83,80,0.7)';
      ctx.font = 'bold 8px system-ui'; ctx.textAlign = 'center';
      ctx.fillText('⚠️ EUR/USD + GBP/USD = 0.88 correlation → Trading both = DOUBLED risk, not diversification', w / 2, h - 8);
    }
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// INSTRUMENT EXPANSION SCORECARD
// ============================================================
interface CriterionScore {
  criterion: string;
  description: string;
  options: { label: string; score: number }[];
  selected: number | null;
}

const defaultCriteria = (): CriterionScore[] => [
  { criterion: '100+ trades on primary instrument', description: 'You need a proven edge on your PRIMARY instrument before expanding. Below 100 trades, your primary edge is unproven.', options: [{ label: '100+ trades ✓', score: 3 }, { label: '50-99 trades', score: 1 }, { label: 'Under 50', score: 0 }], selected: null },
  { criterion: 'Positive EV on primary (last 50 trades)', description: 'Your primary instrument must still be profitable. If primary EV is declining, fix THAT — don\'t add a new problem.', options: [{ label: 'EV > +0.3%', score: 3 }, { label: 'EV +0.1 to 0.3%', score: 2 }, { label: 'EV negative or unknown', score: 0 }], selected: null },
  { criterion: 'Backtested on the new instrument (50+ setups)', description: 'Your model must work on the new instrument. 50 backtested setups minimum — not 5, not "I think it works."', options: [{ label: '50+ setups backtested', score: 3 }, { label: '20-49 setups', score: 1 }, { label: 'Not backtested', score: 0 }], selected: null },
  { criterion: 'Correlation check with existing instruments', description: 'If the new instrument is >0.7 correlated with your primary, you\'re not diversifying — you\'re doubling position size.', options: [{ label: 'Correlation < 0.5', score: 3 }, { label: 'Correlation 0.5-0.7', score: 2 }, { label: 'Correlation > 0.7', score: 0 }], selected: null },
  { criterion: 'Session compatibility', description: 'The new instrument must be active during YOUR kill zone. Adding USD/JPY when you trade London session is pointless.', options: [{ label: 'Peak volume in my KZ', score: 3 }, { label: 'Moderate volume in my KZ', score: 2 }, { label: 'Low/no volume in my KZ', score: 0 }], selected: null },
  { criterion: 'Spread and execution quality', description: 'The new instrument\'s spread + slippage must not erode your edge. Some instruments LOOK good on charts but cost 3× more to trade.', options: [{ label: 'Spread < 20% of avg SL', score: 3 }, { label: 'Spread 20-40% of avg SL', score: 1 }, { label: 'Spread > 40% of avg SL', score: 0 }], selected: null },
  { criterion: 'Character understanding', description: 'Every instrument has a personality — Gold spikes on news, NASDAQ trends in sessions, EUR/USD ranges in Asia. You must KNOW the character.', options: [{ label: 'Studied 3+ months of behaviour', score: 3 }, { label: 'Observed for a few weeks', score: 1 }, { label: 'Never studied it specifically', score: 0 }], selected: null },
  { criterion: 'Psychological bandwidth', description: 'Can you monitor multiple instruments without degrading your primary execution? If adding a second instrument makes your primary worse, the net result is NEGATIVE.', options: [{ label: 'Confident — primary won\'t suffer', score: 3 }, { label: 'Uncertain — might split focus', score: 1 }, { label: 'Already overwhelmed with primary', score: 0 }], selected: null },
];

// ============================================================
// QUIZ & GAME DATA
// ============================================================
const quizQuestions = [
  { q: 'Before adding a second instrument, the MINIMUM requirement on your primary is:', opts: ['20 trades and a profitable month', '100+ trades with positive EV over the last 50', '50 trades and a 55%+ win rate', 'Any positive monthly return'], correct: 1 },
  { q: 'EUR/USD and GBP/USD have a correlation of 0.88. If you take a long on both simultaneously at 1% risk each, your EFFECTIVE risk is:', opts: ['1% — they are separate trades', '2% — simple addition', 'Close to 2% — high correlation means they move together, doubling exposure', '1.5% — partial overlap'], correct: 2 },
  { q: 'You trade XAUUSD during London. Your friend suggests adding USD/JPY. The problem is:', opts: ['Gold and JPY are negatively correlated', 'USD/JPY peak volume is during Tokyo session, not London', 'JPY pairs are too volatile', 'There is no problem — add it'], correct: 1 },
  { q: 'Your XAUUSD edge has an EV of +0.45% per trade. You add NASDAQ without backtesting. Your first 10 NASDAQ trades are breakeven. What happened to your overall edge?', opts: ['It stayed the same — NASDAQ didn\'t lose money', 'It was diluted — 10 breakeven trades reduced your portfolio EV while consuming time and focus', 'It improved — diversification always helps', 'Cannot determine without more data'], correct: 1 },
  { q: 'The correct order for instrument expansion is:', opts: ['Find instruments that look profitable → Add them → Track results', 'Master primary → Backtest new instrument → Demo/micro test → Evaluate → Add or reject', 'Add 3-4 instruments at once to diversify quickly', 'Add the most volatile instrument for bigger returns'], correct: 1 },
  { q: 'An instrument\'s "character" refers to:', opts: ['Its average daily range in pips', 'How it behaves in different sessions, around news, in trends vs ranges — its personality', 'Its correlation with the US Dollar', 'The spread and commission costs'], correct: 1 },
  { q: 'You currently trade 2 instruments profitably. You want to add a 3rd. Your primary instrument EV has dropped from +0.5% to +0.2% over the last month. What should you do?', opts: ['Add the 3rd instrument — it might compensate for the primary decline', 'Fix the primary decline FIRST. Do not add complexity to a deteriorating foundation.', 'Drop one instrument and focus on the strongest one', 'Add the 3rd but reduce risk on primary'], correct: 1 },
  { q: 'The maximum number of instruments a developing trader should trade simultaneously is:', opts: ['As many as possible for diversification', '1-2 during the first 6 months, expanding to 3-4 only after proving each one', '5-6 across different asset classes', 'Depends on account size, not experience'], correct: 1 },
];

const gameRounds = [
  { scenario: '<strong>You trade XAUUSD profitably (180 trades, +0.52% EV, 53% WR).</strong> Your trading community is buzzing about NASDAQ. You\'ve watched it for 2 weeks and backtested 15 setups — 10 of which would have been winners. You want to add it immediately. Assessment?', options: [{ text: 'Add it — 10/15 backtested winners is a 67% win rate, better than your Gold.', correct: false, explain: '15 setups is not a backtest — it\'s a glance. You need 50+ minimum. And you\'ve only watched for 2 weeks — you have no idea how NASDAQ behaves during FOMC, earnings season, or low-volatility periods. The 67% on 15 trades is meaningless noise.' }, { text: 'Not ready — 15 backtested setups is insufficient and 2 weeks of observation doesn\'t reveal the instrument\'s character. Need 50+ backtests and 3+ months observation.', correct: true, explain: 'Correct. Three criteria are unmet: backtest sample (15 vs 50 required), character understanding (2 weeks vs 3 months), and you haven\'t checked correlation or session compatibility. Your Gold edge is solid — protect it by expanding properly.' }, { text: 'Add it on demo first for 2 weeks, then switch to live.', correct: false, explain: 'Demo is useful but doesn\'t solve the fundamental issue — you haven\'t backtested enough setups. 2 weeks of demo on top of 2 weeks of watching = 1 month. You need 3+ months of character study and 50+ backtested setups.' }] },
  { scenario: '<strong>You trade XAUUSD and EUR/USD.</strong> Your Gold EV is +0.48% and EUR/USD is +0.35%. You want to add GBP/USD because "it looks similar to EUR/USD and my model works on it." The EUR/USD–GBP/USD correlation is 0.88. What\'s the real risk?', options: [{ text: 'Acceptable — you\'re adding a third profitable instrument.', correct: false, explain: 'On paper, three profitable instruments sounds good. In reality, EUR/USD and GBP/USD move together 88% of the time. If you\'re long both at 1% risk each, your GBP/EUR exposure is effectively 2% risk. If the Dollar strengthens, BOTH lose simultaneously.' }, { text: 'Dangerous — 0.88 correlation means GBP/USD and EUR/USD are functionally the same trade. Adding it doubles exposure, not diversification.', correct: true, explain: 'Correct. At 0.88 correlation, a losing EUR/USD trade almost guarantees a losing GBP/USD trade. You\'re not adding opportunity — you\'re doubling position size while telling yourself it\'s "diversification." If you want a 3rd instrument, choose one with <0.5 correlation to your existing pair.' }, { text: 'Fine if you reduce risk on each to 0.5% instead of 1%.', correct: false, explain: 'Reducing risk doesn\'t solve the correlation problem — it just makes the correlated loss smaller. The fundamental issue remains: the two instruments provide no independent information. Your decision-making bandwidth is consumed by a redundant position.' }] },
  { scenario: '<strong>You trade XAUUSD during London-NY overlap (12:00-16:00 UTC).</strong> A fellow trader suggests adding AUD/USD because "it trends beautifully." AUD/USD peak volume is during the Asian-London overlap (23:00-08:00 UTC). Your kill zone doesn\'t overlap with AUD peak volume. Should you add it?', options: [{ text: 'Yes — trade AUD/USD in the morning and Gold in the afternoon. Two kill zones, more opportunities.', correct: false, explain: 'Two kill zones means twice the screen time, twice the emotional load, and now you\'re trading AUD outside your proven rhythm. Your Gold edge was built in the LON-NY overlap. Adding a pre-market session fragments your focus and introduces a completely different trading environment.' }, { text: 'No — AUD/USD\'s peak volume is outside your kill zone. Low-volume AUD during LON-NY will have wider spreads and weaker trends.', correct: true, explain: 'Correct. Session compatibility is non-negotiable. AUD/USD during your kill zone (12:00-16:00 UTC) has moderate-to-low volume — spreads are wider, moves are less reliable, and the patterns that "trend beautifully" in Asian session don\'t replicate during NY afternoon.' }, { text: 'Add it but only trade AUD/USD during high-impact AUD news releases during your kill zone.', correct: false, explain: 'News-only trading on a secondary instrument is a completely different skill from your technical approach on Gold. You\'re not adding AUD/USD to your arsenal — you\'re creating a second, unproven strategy. One instrument, one approach, one kill zone at a time.' }] },
  { scenario: '<strong>Month 8 of your journey.</strong> You trade XAUUSD only. Your stats are strong: 220 trades, 54% WR, +0.55% EV. Friends trade 4-5 instruments. You feel "behind" and worry about missing opportunities on other pairs. What\'s the right perspective?', options: [{ text: 'They\'re right — you should expand to 3-4 instruments to catch more opportunities.', correct: false, explain: 'More instruments does NOT equal more profit. If your Gold EV is +0.55% at 1% risk, you\'re making approximately 5% per month on available setups. Your friends with 4-5 instruments likely have lower EV per instrument because their attention is split. Total opportunity = EV × trades. Fewer high-quality trades often beats many mediocre ones.' }, { text: 'FOMO is not a trading criteria. Your edge is proven on Gold. If the stats say "expand," expand. If they say "depth," stay deep.', correct: true, explain: 'Exactly. Your 220 trades at +0.55% EV is OBJECTIVELY excellent. Comparing your instrument count to others is comparing inputs, not outputs. When your Gold setups are scarce (e.g., only 2-3 per week) and you\'re psychologically ready, THEN expansion adds value. Not because others do it.' }, { text: 'Stay on Gold forever — specialists always outperform generalists.', correct: false, explain: 'Specialisation is powerful, but expansion at the RIGHT TIME adds genuine value. The issue isn\'t expansion itself — it\'s premature expansion driven by FOMO instead of data. When your primary is strong AND you have capacity, a backtested second instrument improves total opportunity.' }] },
  { scenario: '<strong>You added EUR/USD 6 weeks ago.</strong> Your XAUUSD EV remains +0.50%. Your EUR/USD EV is −0.15% over 30 trades (negative). Total portfolio EV is now +0.28% (blended). Your EUR/USD losses are dragging down your overall performance. What\'s the diagnosis?', options: [{ text: 'Give EUR/USD more time — 30 trades isn\'t enough to judge.', correct: false, explain: '30 trades at negative EV is already a clear signal. While 30 trades has variance, the direction is concerning — especially since your Gold edge has remained stable. The new instrument is the variable. 50 trades is a fair evaluation window, but you should already be on high alert at 30 trades negative.' }, { text: 'Drop EUR/USD immediately and return to Gold only. Evaluate what went wrong.', correct: true, explain: 'Correct. Your blended EV dropped from +0.50% to +0.28% — a 44% reduction in edge. EUR/USD is actively damaging your performance. Drop it, return to single-instrument profitability, and diagnose why EUR/USD didn\'t work: different character? Model mismatch? Execution quality? Session issue? Fix it on paper before re-testing live.' }, { text: 'Reduce EUR/USD risk to 0.25% and continue collecting data.', correct: false, explain: 'Reducing risk doesn\'t fix a negative-EV instrument — it just makes the losses smaller while continuing to consume attention and bandwidth that could be spent on Gold. A negative-EV instrument at any risk level is a drag on performance AND psychology.' }] },
];

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function TradingMultipleInstrumentsPage() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState(0);
  const totalSections = 12;
  const toggle = (id: string) => { setOpenSections(p => { const n = { ...p, [id]: !p[id] }; const c = Object.values(n).filter(Boolean).length; setProgress(Math.round((c / totalSections) * 100)); return n; }); };

  // Expansion Scorecard state
  const [criteria, setCriteria] = useState<CriterionScore[]>(defaultCriteria());
  const [instrumentName, setInstrumentName] = useState('');
  const [scorecardDone, setScorecardDone] = useState(false);

  const handleCriterionSelect = (idx: number, optIdx: number) => {
    setCriteria(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], selected: optIdx };
      return next;
    });
    setScorecardDone(false);
  };

  const allAnswered = criteria.every(c => c.selected !== null);

  const getTotalScore = (): number => {
    return criteria.reduce<number>((sum, c) => {
      if (c.selected === null) return sum;
      return sum + c.options[c.selected].score;
    }, 0);
  };

  const getVerdict = (): { label: string; color: string; feedback: string } => {
    const score = getTotalScore();
    const hasZero = criteria.some(c => c.selected !== null && c.options[c.selected!].score === 0);
    if (hasZero) return { label: 'NO-GO', color: '#ef4444', feedback: `One or more criteria scored 0 — this is an automatic NO-GO. A single zero means a fundamental requirement is unmet. Fix the failed criterion before re-evaluating. The weakest link breaks the chain.` };
    if (score >= 21) return { label: 'GO', color: '#26A69A', feedback: `${instrumentName || 'This instrument'} passes all criteria. You may proceed with a micro-risk test period (0.25% risk for 30 trades). Track EV separately from your primary. If EV is positive after 30 trades, integrate at normal risk.` };
    if (score >= 15) return { label: 'CAUTION', color: '#FFB300', feedback: `${instrumentName || 'This instrument'} has potential but some criteria need strengthening. Address the weakest scores before live testing. Consider 2-4 more weeks of preparation.` };
    return { label: 'NO-GO', color: '#ef4444', feedback: `Too many criteria are weak. This instrument is not ready for live testing. Focus on your primary instrument and revisit expansion when more preparation is complete.` };
  };

  // Radar chart canvas
  const radarCanvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!scorecardDone) return;
    const canvas = radarCanvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr; canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const w = rect.width; const h = rect.height;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2; const cy = h / 2;
    const R = Math.min(w, h) * 0.38;
    const n = criteria.length;
    const angleStep = (Math.PI * 2) / n;

    // Grid rings
    [0.33, 0.66, 1].forEach(ring => {
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const x = cx + Math.cos(angle) * R * ring;
        const y = cy + Math.sin(angle) * R * ring;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 0.5; ctx.stroke();
    });

    // Spokes + labels
    const shortLabels = ['Trades', 'Primary EV', 'Backtest', 'Correlation', 'Session', 'Spread', 'Character', 'Bandwidth'];
    criteria.forEach((_, i) => {
      const angle = i * angleStep - Math.PI / 2;
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(angle) * R, cy + Math.sin(angle) * R); ctx.stroke();

      const labelR = R + 14;
      ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '7px system-ui'; ctx.textAlign = 'center';
      ctx.fillText(shortLabels[i], cx + Math.cos(angle) * labelR, cy + Math.sin(angle) * labelR + 3);
    });

    // Data polygon
    ctx.beginPath();
    criteria.forEach((c, i) => {
      const score = c.selected !== null ? c.options[c.selected].score / 3 : 0;
      const angle = i * angleStep - Math.PI / 2;
      const x = cx + Math.cos(angle) * R * score;
      const y = cy + Math.sin(angle) * R * score;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.closePath();
    const verdict = getVerdict();
    ctx.fillStyle = verdict.color + '20'; ctx.fill();
    ctx.strokeStyle = verdict.color + '80'; ctx.lineWidth = 2; ctx.stroke();

    // Data points
    criteria.forEach((c, i) => {
      const score = c.selected !== null ? c.options[c.selected].score / 3 : 0;
      const angle = i * angleStep - Math.PI / 2;
      const x = cx + Math.cos(angle) * R * score;
      const y = cy + Math.sin(angle) * R * score;
      ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = score === 1 ? '#26A69A' : score >= 0.66 ? '#FFB300' : '#ef4444';
      ctx.fill();
    });
  }, [scorecardDone, criteria]);

  // Game state
  const [gameRound, setGameRound] = useState(0);
  const [gameAnswers, setGameAnswers] = useState<(number | null)[]>(gameRounds.map(() => null));
  const [gameScore, setGameScore] = useState(0);
  const handleGameAnswer = (optIdx: number) => { if (gameAnswers[gameRound] !== null) return; const newA = [...gameAnswers]; newA[gameRound] = optIdx; setGameAnswers(newA); if (gameRounds[gameRound].options[optIdx].correct) setGameScore(s => s + 1); };

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(quizQuestions.map(() => null));
  const [quizDone, setQuizDone] = useState(false);
  const quizScore = quizDone ? Math.round(quizAnswers.reduce<number>((s, a, i) => s + (a === quizQuestions[i].correct ? 1 : 0), 0) / quizQuestions.length * 100) : 0;
  const certUnlocked = quizDone && quizScore >= 66;
  const handleQuizAnswer = (qi: number, oi: number) => { if (quizAnswers[qi] !== null) return; const n = [...quizAnswers]; n[qi] = oi; setQuizAnswers(n); };

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      {/* Hero */}
      <section className="max-w-2xl mx-auto px-5 pt-12 pb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link href="/academy" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 mb-6 transition-colors">&larr; Back to Academy</Link>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4"><Crown className="w-3.5 h-3.5 text-amber-400" /><span className="text-[11px] font-bold tracking-wider text-amber-400">PRO &middot; LEVEL 7</span></div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 leading-tight">Trading Multiple Instruments</h1>
          <p className="text-gray-400 text-sm leading-relaxed max-w-lg">Expand your opportunity set without diluting the edge you&rsquo;ve built. Eight criteria that must be met before adding a single new instrument.</p>
          <div className="mt-4 h-1.5 rounded-full bg-white/5 overflow-hidden"><motion.div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-accent-500" animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} /></div>
          <p className="text-right text-[10px] text-gray-600 mt-1">{progress}% complete</p>
        </motion.div>
      </section>

      {/* S00 — Why This Matters */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-start gap-3 mb-4"><span className="text-xl">🔍</span><h2 className="text-xl font-extrabold">First — Why This Matters</h2></div>
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
            <p className="text-sm text-gray-300 leading-relaxed mb-4">Think of a chef who mastered <strong className="text-white">one signature dish</strong> — it&rsquo;s perfect, consistent, and customers love it. Now imagine that chef adding 5 more dishes overnight. The kitchen is overwhelmed, every dish suffers, and the signature dish — the foundation — gets worse. Instruments work the same way. <strong className="text-white">Depth beats breadth</strong>. One instrument mastered is worth more than five instruments half-learned.</p>
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
              <p className="text-xs font-bold text-amber-400 tracking-widest uppercase mb-2">Real Scenario</p>
              <p className="text-sm text-gray-300 leading-relaxed">Two groups of funded traders tracked over 6 months. <strong className="text-[#26A69A]">Group A (1-2 instruments): 52% WR, 1:1.9 R:R, +0.49% EV, 14% avg drawdown.</strong> <strong className="text-[#ef4444]">Group B (4-6 instruments): 47% WR, 1:1.4 R:R, +0.11% EV, 21% avg drawdown.</strong> Group B had MORE trades but LESS profit. Their attention was split across too many instruments, degrading execution quality on all of them.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S01 — Animation 1: Focus vs Scatter */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-extrabold mb-4">Focus vs Scatter — The Equity Proof</h2>
          <FocusVsScatterAnimation />
          <p className="text-xs text-gray-500 mt-2 text-center">Same strategy, same period. The focused trader compounds. The scattered trader churns.</p>
        </motion.div>
      </section>

      {/* S02 — Animation 2: Correlation Danger Matrix */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-extrabold mb-4">The Correlation Danger Matrix</h2>
          <CorrelationMatrixAnimation />
          <p className="text-xs text-gray-500 mt-2 text-center">Red cells = high positive correlation (same trade). Blue cells = inverse. Add instruments that are GREY, not red.</p>
        </motion.div>
      </section>

      {/* S03 — The 8 Expansion Criteria */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-extrabold mb-4">The 8 Expansion Criteria</h2>
          <div className="space-y-3">
            {[
              { id: 's03a', num: '01', title: 'Criterion 1-4: Foundation Checks', content: '<strong>1. 100+ trades on primary instrument.</strong> Your primary edge must be PROVEN before expansion. Below 100 trades, the edge might be variance.<br/><br/><strong>2. Positive EV on primary (last 50 trades).</strong> If your primary is declining, fix THAT before adding complexity.<br/><br/><strong>3. 50+ backtested setups on the new instrument.</strong> Your model must demonstrably work on the new instrument. "I think it works" is not data.<br/><br/><strong>4. Correlation check (<0.5 with existing instruments).</strong> High correlation = doubled risk, not diversification. EUR/USD + GBP/USD at 0.88 correlation is one position, not two.' },
              { id: 's03b', num: '02', title: 'Criterion 5-8: Compatibility Checks', content: '<strong>5. Session compatibility.</strong> The new instrument must have peak volume during YOUR kill zone. Low-volume instruments in your window have wider spreads and unreliable patterns.<br/><br/><strong>6. Spread and execution quality.</strong> If the spread eats >20% of your average stop distance, the instrument is too expensive to trade. Your EV gets eroded before you start.<br/><br/><strong>7. Character understanding (3+ months study).</strong> Every instrument has a personality. Gold spikes on geopolitical news. NASDAQ trends during US hours. EUR/USD ranges during Asia. Know the character BEFORE trading it.<br/><br/><strong>8. Psychological bandwidth.</strong> Can you manage multiple positions without degrading primary execution? If your Gold management compliance drops after adding EUR/USD, the NET result is negative.' },
            ].map(item => (
              <div key={item.id} className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
                <button onClick={() => toggle(item.id)} className="w-full flex items-center gap-3 p-4 text-left"><span className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center text-xs font-bold text-amber-400/60">{item.num}</span><span className="flex-1 text-sm font-semibold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[item.id] ? 'rotate-180' : ''}`} /></button>
                <AnimatePresence>{openSections[item.id] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="px-5 pb-5"><p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.content }} /></div></motion.div>)}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S04 — Expansion Timeline */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-extrabold mb-4">The Expansion Timeline</h2>
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
            <button onClick={() => toggle('s04')} className="w-full flex items-center gap-3 p-4 text-left"><span className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center text-xs font-bold text-amber-400/60">03</span><span className="flex-1 text-sm font-semibold text-gray-200">Month-by-Month Realistic Expansion Path</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections['s04'] ? 'rotate-180' : ''}`} /></button>
            <AnimatePresence>{openSections['s04'] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="px-5 pb-5 space-y-2">
              {[
                { month: 'Months 1-4', instruments: '1', focus: 'Master your primary. 100+ trades. Prove the edge. Build the data.', color: '#3b82f6' },
                { month: 'Months 5-6', instruments: '1 (+ research)', focus: 'Backtest and study a second instrument. 50+ setups. Learn its character. Do NOT trade it live yet.', color: '#8b5cf6' },
                { month: 'Months 7-8', instruments: '1 + 1 micro', focus: 'Add the second instrument at micro risk (0.25%). 30 trades. Track EV separately. Primary remains full risk.', color: '#26A69A' },
                { month: 'Months 9-10', instruments: '2', focus: 'If micro test was positive, integrate at normal risk. Monitor primary EV — if it drops, the second instrument is the cause.', color: '#f59e0b' },
                { month: 'Months 11-12+', instruments: '2 (+ research for 3rd)', focus: 'Only after both are stable for 2+ months. Repeat the cycle for a 3rd instrument. Most traders peak at 2-3 instruments.', color: '#a855f7' },
              ].map(item => (
                <div key={item.month} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="flex-shrink-0 w-16 text-center">
                    <p className="text-xs font-bold" style={{ color: item.color }}>{item.month}</p>
                    <p className="text-lg font-black text-white">{item.instruments}</p>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed flex-1">{item.focus}</p>
                </div>
              ))}
            </div></motion.div>)}</AnimatePresence>
          </div>
        </motion.div>
      </section>

      {/* S05 — 🎯 GROUNDBREAKING: Instrument Expansion Scorecard */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-center gap-2 mb-2"><span className="text-xl">🎯</span><h2 className="text-xl font-extrabold">Instrument Expansion Scorecard</h2></div>
          <p className="text-sm text-gray-400 mb-6">Evaluate a new instrument against all 8 criteria. Score each honestly — the tool gives you a GO / CAUTION / NO-GO verdict.</p>

          {!scorecardDone ? (
            <div className="space-y-4">
              {/* Instrument name */}
              <div>
                <label className="text-xs font-bold text-gray-300 mb-1.5 block">New Instrument Name</label>
                <input type="text" value={instrumentName} onChange={e => setInstrumentName(e.target.value)} placeholder="e.g., EUR/USD, NASDAQ, GBP/JPY" className="w-full p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-gray-600 focus:border-amber-500/30 outline-none" />
              </div>

              {/* 8 Criteria */}
              {criteria.map((c, ci) => (
                <div key={ci} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <p className="text-xs font-bold text-amber-400 mb-1">Criterion {ci + 1}</p>
                  <p className="text-sm font-semibold text-gray-200 mb-1">{c.criterion}</p>
                  <p className="text-[11px] text-gray-500 mb-3">{c.description}</p>
                  <div className="space-y-1.5">
                    {c.options.map((opt, oi) => (
                      <button key={oi} onClick={() => handleCriterionSelect(ci, oi)} className={`w-full text-left p-2.5 rounded-lg text-xs font-semibold transition-all ${c.selected === oi ? 'border-2' : 'bg-white/[0.02] border border-white/10 hover:border-white/20 text-gray-400'}`} style={c.selected === oi ? { borderColor: opt.score === 3 ? '#26A69A60' : opt.score >= 1 ? '#FFB30060' : '#ef434460', background: opt.score === 3 ? '#26A69A10' : opt.score >= 1 ? '#FFB30010' : '#ef434410', color: opt.score === 3 ? '#26A69A' : opt.score >= 1 ? '#FFB300' : '#ef4444' } : {}}>
                        <span className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${opt.score === 3 ? 'bg-green-500/20 text-green-400' : opt.score >= 1 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>{opt.score}</span>
                          {opt.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {allAnswered && (
                <button onClick={() => setScorecardDone(true)} className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Generate Expansion Verdict →</button>
              )}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
              {/* Verdict */}
              <div className="p-5 rounded-2xl text-center border" style={{ borderColor: getVerdict().color + '30', background: getVerdict().color + '08' }}>
                <p className="text-4xl font-black mb-1" style={{ color: getVerdict().color }}>{getVerdict().label}</p>
                <p className="text-sm font-semibold text-white mb-1">{instrumentName || 'New Instrument'}</p>
                <p className="text-xs text-gray-400">{getTotalScore()}/24 points</p>
              </div>

              {/* Radar chart */}
              <div className="rounded-2xl bg-black/30 border border-white/5 overflow-hidden">
                <canvas ref={radarCanvasRef} style={{ width: '100%', height: 250 }} />
              </div>

              {/* Feedback */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <p className="text-xs text-gray-400 leading-relaxed">{getVerdict().feedback}</p>
              </div>

              {/* Criterion breakdown */}
              <div className="space-y-1.5">
                {criteria.map((c, i) => {
                  const score = c.selected !== null ? c.options[c.selected].score : 0;
                  return (
                    <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                      <span className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${score === 3 ? 'bg-green-500/20 text-green-400' : score >= 1 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>{score}</span>
                      <p className="text-[11px] text-gray-400 flex-1 truncate">{c.criterion}</p>
                    </div>
                  );
                })}
              </div>

              <button onClick={() => { setCriteria(defaultCriteria()); setInstrumentName(''); setScorecardDone(false); }} className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-semibold text-gray-300 hover:border-amber-500/30 transition-all">Evaluate Another Instrument</button>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* S06 — The Correlation Rules */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-extrabold mb-4">The Correlation Rules</h2>
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
            <button onClick={() => toggle('s06')} className="w-full flex items-center gap-3 p-4 text-left"><span className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center text-xs font-bold text-amber-400/60">04</span><span className="flex-1 text-sm font-semibold text-gray-200">How Correlation Secretly Doubles Your Risk</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections['s06'] ? 'rotate-180' : ''}`} /></button>
            <AnimatePresence>{openSections['s06'] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="px-5 pb-5 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/10 text-center">
                  <p className="text-xs font-bold text-green-400 mb-1">&lt; 0.3</p>
                  <p className="text-[10px] text-gray-400">IDEAL — genuine diversification</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 text-center">
                  <p className="text-xs font-bold text-amber-400 mb-1">0.3 – 0.7</p>
                  <p className="text-[10px] text-gray-400">ACCEPTABLE — some overlap</p>
                </div>
                <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10 text-center">
                  <p className="text-xs font-bold text-red-400 mb-1">&gt; 0.7</p>
                  <p className="text-[10px] text-gray-400">DANGEROUS — same trade</p>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { pair: 'EUR/USD + GBP/USD', corr: '+0.88', verdict: '☠️ Nearly identical. Trading both = double exposure.', color: '#ef4444' },
                  { pair: 'NASDAQ + US30', corr: '+0.95', verdict: '☠️ Essentially the same index. Choose ONE.', color: '#ef4444' },
                  { pair: 'XAUUSD + EUR/USD', corr: '-0.45', verdict: '✓ Inverse-ish. Good diversification. Different drivers.', color: '#26A69A' },
                  { pair: 'XAUUSD + NASDAQ', corr: '+0.25', verdict: '✓ Low correlation. Independent setups.', color: '#26A69A' },
                  { pair: 'EUR/USD + DXY', corr: '-0.90', verdict: '☠️ Perfect inverse. Long EUR/USD = short DXY.', color: '#ef4444' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                    <span className="text-xs font-mono font-bold" style={{ color: item.color }}>{item.corr}</span>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-300">{item.pair}</p>
                      <p className="text-[10px] text-gray-500">{item.verdict}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div></motion.div>)}</AnimatePresence>
          </div>
        </motion.div>
      </section>

      {/* S07 — When to Remove an Instrument */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-extrabold mb-4">When to Remove an Instrument</h2>
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
            <button onClick={() => toggle('s07')} className="w-full flex items-center gap-3 p-4 text-left"><span className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center text-xs font-bold text-amber-400/60">05</span><span className="flex-1 text-sm font-semibold text-gray-200">The 4 Removal Triggers</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections['s07'] ? 'rotate-180' : ''}`} /></button>
            <AnimatePresence>{openSections['s07'] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="px-5 pb-5 space-y-2">
              {[
                { trigger: 'Negative EV after 50+ trades', detail: 'The instrument doesn\'t suit your model. Remove immediately. 50 trades is a fair sample.', color: '#ef4444' },
                { trigger: 'Primary instrument EV drops after expansion', detail: 'Adding the new instrument degraded your execution on the primary. The new instrument is net NEGATIVE even if individually positive.', color: '#ef4444' },
                { trigger: 'Emotional state degrades with multiple screens', detail: 'If you feel anxious, scattered, or overwhelmed monitoring 2+ instruments, your bandwidth is exceeded.', color: '#FFB300' },
                { trigger: 'Regime change invalidates the character study', detail: 'The instrument behaved one way for 3 months but has shifted (volatility regime, correlation shift). Re-study before continuing.', color: '#FFB300' },
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <p className="text-xs font-bold mb-1" style={{ color: item.color }}>⚠️ {item.trigger}</p>
                  <p className="text-[11px] text-gray-400">{item.detail}</p>
                </div>
              ))}
            </div></motion.div>)}</AnimatePresence>
          </div>
        </motion.div>
      </section>

      {/* S08 — Common Mistakes */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-extrabold mb-4">Common Expansion Mistakes</h2>
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
            <button onClick={() => toggle('s08')} className="w-full flex items-center gap-3 p-4 text-left"><span className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center text-xs font-bold text-amber-400/60">06</span><span className="flex-1 text-sm font-semibold text-gray-200">4 Expansion Errors That Destroy Proven Edges</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections['s08'] ? 'rotate-180' : ''}`} /></button>
            <AnimatePresence>{openSections['s08'] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="px-5 pb-5 space-y-3">
              {[
                { title: 'Adding Instruments for "Diversification"', mistake: 'Trading EUR/USD + GBP/USD + AUD/USD and calling it diversification. Three USD pairs are ONE position in different wrappers.', fix: 'True diversification requires low correlation (<0.5). XAUUSD + NASDAQ + EUR/USD is diversified. Three forex pairs is NOT.' },
                { title: 'Expanding Before Mastery', mistake: 'Trading 2 instruments with 40 trades each instead of 1 instrument with 80 trades. You now have TWO unproven edges instead of one half-proven edge.', fix: 'Finish the 100-trade milestone on your primary FIRST. Unproven edges should not be multiplied — they should be tested.' },
                { title: 'Treating All Instruments the Same', mistake: 'Applying the exact same parameters (stop size, session times, R:R targets) from Gold to NASDAQ. Different instruments have different ATR, spread, character, and session profiles.', fix: 'Each instrument needs its own parameters derived from 50+ backtested setups. Copy-paste strategies degrade across instruments.' },
                { title: 'FOMO-Driven Expansion', mistake: '"I saw a setup on EUR/USD today and I don\'t trade it — I missed money." You didn\'t miss money. You don\'t trade EUR/USD. Missing a setup on an instrument you don\'t trade is not a missed opportunity.', fix: 'Opportunity cost only applies to instruments IN your playbook. Everything else is noise.' },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <p className="text-sm font-bold text-white mb-2">{item.title}</p>
                  <p className="text-xs text-red-400 mb-2">❌ {item.mistake}</p>
                  <p className="text-xs text-green-400">✓ {item.fix}</p>
                </div>
              ))}
            </div></motion.div>)}</AnimatePresence>
          </div>
        </motion.div>
      </section>

      {/* S09 — Cheat Sheet */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-extrabold mb-4">Cheat Sheet</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { title: '8 Criteria', content: '100 trades primary, positive EV, 50 backtests, correlation <0.5, session fit, spread check, character known, bandwidth clear.', color: '#f59e0b' },
              { title: 'Correlation', content: '<0.3 ideal, 0.3-0.7 acceptable, >0.7 = same trade. EUR+GBP = double exposure, not diversification.', color: '#ef4444' },
              { title: 'Timeline', content: 'Month 1-4: master primary. 5-6: research 2nd. 7-8: micro test. 9-10: integrate. 11+: consider 3rd.', color: '#3b82f6' },
              { title: 'Max Count', content: '1-2 for year 1. 2-3 for year 2. Most pros peak at 2-3 instruments. More is rarely better.', color: '#26A69A' },
              { title: 'Remove When', content: 'Negative EV after 50 trades, primary EV drops, emotional state degrades, regime change.', color: '#a855f7' },
              { title: 'The Rule', content: 'Depth beats breadth. One mastered instrument > five half-learned instruments. Always.', color: '#FFB300' },
            ].map((card, i) => (
              <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <p className="text-xs font-bold mb-1" style={{ color: card.color }}>{card.title}</p>
                <p className="text-[11px] text-gray-400 leading-relaxed">{card.content}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S10 — Game */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-extrabold mb-2">Test Your Knowledge</h2>
          <p className="text-gray-400 text-sm mb-6">5 instrument expansion scenarios. Apply the 8 criteria.</p>
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
            <p className="text-xs tracking-widest uppercase text-amber-400 font-bold mb-3">Round {gameRound + 1} of {gameRounds.length}</p>
            <p className="text-sm text-gray-300 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: gameRounds[gameRound].scenario }} />
            <div className="space-y-3">
              {gameRounds[gameRound].options.map((opt, oi) => {
                const answered = gameAnswers[gameRound] !== null;
                const selected = gameAnswers[gameRound] === oi;
                const isCorrect = opt.correct;
                const cls = !answered ? 'bg-white/[0.03] border border-white/10 hover:border-amber-500/30' : isCorrect ? 'bg-green-500/10 border border-green-500/30' : selected ? 'bg-red-500/10 border border-red-500/30' : 'bg-white/[0.02] border border-white/5 opacity-50';
                return (<div key={oi}><button onClick={() => handleGameAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt.text }} /></button>{answered && selected && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]"><p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`} dangerouslySetInnerHTML={{ __html: `${isCorrect ? '✓' : '✗'} ${opt.explain}` }} /></motion.div>)}</div>);
              })}
            </div>
            {gameAnswers[gameRound] !== null && gameRound < gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5"><button onClick={() => setGameRound(r => r + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button></motion.div>)}
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Outstanding — you understand instrument expansion like a portfolio manager.' : gameScore >= 3 ? 'Good — review correlation concepts and the FOMO-driven expansion trap.' : 'Re-read the 8 Criteria and the Correlation Rules, then retry.'}</p></motion.div>)}
          </div>
        </motion.div>
      </section>

      {/* S11 — Quiz + Certificate */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-2xl font-extrabold mb-2">Final Quiz</h2>
          <p className="text-gray-400 text-sm mb-6">8 questions — 66% to earn your certificate.</p>
          <div className="space-y-6">
            {quizQuestions.map((q, qi) => (
              <div key={qi} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p>
                <p className="text-sm text-gray-300 mb-4">{q.q}</p>
                <div className="space-y-2">{q.opts.map((opt, oi) => { const chosen = quizAnswers[qi] === oi; const isRight = oi === q.correct; const cls = quizAnswers[qi] === null ? 'bg-white/[0.03] border border-white/10 hover:border-amber-500/30' : isRight ? 'bg-green-500/10 border border-green-500/30' : chosen ? 'bg-red-500/10 border border-red-500/30' : 'bg-white/[0.02] border border-white/5 opacity-50'; return <button key={oi} onClick={() => handleQuizAnswer(qi, oi)} disabled={quizAnswers[qi] !== null} className={`w-full text-left p-3 rounded-xl text-sm transition-all ${cls}`}>{opt}</button>; })}</div>
              </div>
            ))}
          </div>
          {quizAnswers.every(a => a !== null) && !quizDone && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 text-center"><button onClick={() => setQuizDone(true)} className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white font-bold text-sm active:scale-95 transition-transform">Submit Quiz</button></motion.div>)}
          {quizDone && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center"><p className="text-3xl font-extrabold mb-2">{quizScore}%</p><p className="text-sm text-gray-400">{quizScore >= 66 ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate. Review and try again.'}</p></motion.div>)}
          {certUnlocked && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10">
              <div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(139,92,246,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
                <div className="relative z-10 text-center">
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-teal-500 via-blue-500 to-purple-500 flex items-center justify-center text-3xl shadow-lg shadow-teal-500/30">🎛️</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 7: Trading Multiple Instruments</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-teal-400 via-blue-400 to-purple-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Portfolio Strategist &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L7.12-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
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
