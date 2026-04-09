// app/academy/lesson/sessions-deep-dive/page.tsx
// ATLAS Academy — Lesson 3.14: Sessions Deep Dive [PRO]
'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Crown, ArrowRight, ChevronDown } from 'lucide-react';

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

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
    const loop = () => { ctx.clearRect(0, 0, rect.width, rect.height); drawFn(ctx, rect.width, rect.height, frameRef.current); frameRef.current++; animRef.current = requestAnimationFrame(loop); };
    loop();
    return () => cancelAnimationFrame(animRef.current);
  }, [drawFn]);
  return <canvas ref={canvasRef} style={{ width: '100%', height }} className="rounded-2xl" />;
}

// ============================================================
// DAILY TIMELINE ANIMATION
// ============================================================
function DailyTimelineAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);
    const pad = 20;
    const timelineY = h * 0.45;
    const barH = 28;

    // Timeline axis
    ctx.strokeStyle = 'rgba(148,163,184,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad, timelineY + barH + 15); ctx.lineTo(w - pad, timelineY + barH + 15); ctx.stroke();

    // Hour labels
    for (let hr = 0; hr <= 24; hr += 2) {
      const x = pad + ((w - pad * 2) * hr) / 24;
      ctx.fillStyle = '#64748b'; ctx.font = '7px system-ui'; ctx.textAlign = 'center';
      ctx.fillText(`${String(hr).padStart(2, '0')}`, x, timelineY + barH + 28);
    }

    const events = [
      { start: 0, end: 3, label: 'Asian KZ', color: '#a855f7', y: timelineY - 40, task: 'Mark range H/L' },
      { start: 3, end: 7, label: 'Asian Drift', color: '#a855f7', y: timelineY - 40, task: 'Low vol \u2014 wait', alpha: 0.4 },
      { start: 7, end: 10, label: 'London KZ', color: '#3b82f6', y: timelineY, task: 'Watch for sweep' },
      { start: 10, end: 13, label: 'London Trend', color: '#3b82f6', y: timelineY, task: 'Hold / trail stop', alpha: 0.5 },
      { start: 13, end: 16, label: 'OVERLAP', color: '#f59e0b', y: timelineY + 40, task: 'Peak volume' },
      { start: 16, end: 20, label: 'Late NY', color: '#22c55e', y: timelineY + 40, task: 'Take profits', alpha: 0.4 },
      { start: 20, end: 24, label: 'DEAD ZONE', color: '#ef4444', y: timelineY + 40, task: 'DO NOT TRADE', alpha: 0.3 },
    ];

    const currentHour = ((f % 720) / 720) * 24;

    events.forEach(ev => {
      const x1 = pad + ((w - pad * 2) * ev.start) / 24;
      const x2 = pad + ((w - pad * 2) * ev.end) / 24;
      const isActive = currentHour >= ev.start && currentHour < ev.end;
      const r = parseInt(ev.color.slice(1, 3), 16);
      const g = parseInt(ev.color.slice(3, 5), 16);
      const b = parseInt(ev.color.slice(5, 7), 16);
      const alpha = ev.alpha || 1;
      const baseAlpha = isActive ? 0.2 + Math.sin(f * 0.05) * 0.04 : 0.06 * alpha;

      ctx.fillStyle = `rgba(${r},${g},${b},${baseAlpha})`;
      ctx.fillRect(x1, timelineY, x2 - x1, barH);
      ctx.strokeStyle = `rgba(${r},${g},${b},${isActive ? 0.6 : 0.2 * alpha})`;
      ctx.lineWidth = isActive ? 1.5 : 0.5;
      ctx.strokeRect(x1, timelineY, x2 - x1, barH);

      ctx.font = `${isActive ? 'bold 8' : '7'}px system-ui`;
      ctx.textAlign = 'center';
      ctx.fillStyle = `rgba(${r},${g},${b},${isActive ? 1 : 0.5 * alpha})`;
      ctx.fillText(ev.label, (x1 + x2) / 2, timelineY + barH / 2 + 3);

      if (isActive) {
        ctx.font = 'bold 9px system-ui'; ctx.fillStyle = ev.color;
        ctx.fillText(ev.task, (x1 + x2) / 2, timelineY - 8);
      }
    });

    // Moving cursor
    const cursorX = pad + ((w - pad * 2) * currentHour) / 24;
    ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cursorX, timelineY - 15); ctx.lineTo(cursorX, timelineY + barH + 10); ctx.stroke();
    ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.arc(cursorX, timelineY - 15, 3, 0, Math.PI * 2); ctx.fill();

    ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center'; ctx.fillStyle = '#f59e0b';
    ctx.fillText('YOUR DAILY PLAYBOOK \u2014 Every hour has a purpose', w / 2, h - 8);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// PAIR BEHAVIOUR ANIMATION
// ============================================================
function PairBehaviourAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);
    const progress = Math.min(1, (f % 240) / 200);
    const pad = 30;

    const pairs = [
      { name: 'EUR/USD', asian: 20, london: 80, ny: 70, color: '#3b82f6' },
      { name: 'GBP/JPY', asian: 35, london: 95, ny: 60, color: '#22c55e' },
      { name: 'USD/JPY', asian: 65, london: 50, ny: 55, color: '#a855f7' },
      { name: 'XAU/USD', asian: 30, london: 85, ny: 90, color: '#f59e0b' },
    ];

    const barGroupW = (w - pad * 2 - 30) / pairs.length;
    const barW = barGroupW * 0.25;
    const maxBarH = h - pad * 2 - 30;

    // Session legend
    ctx.font = '8px system-ui'; ctx.textAlign = 'center';
    const legendY = pad - 10;
    [{ label: 'Asian', color: '#a855f7' }, { label: 'London', color: '#3b82f6' }, { label: 'NY', color: '#22c55e' }].forEach((l, i) => {
      const lx = w / 2 - 60 + i * 60;
      ctx.fillStyle = l.color + '30'; ctx.fillRect(lx - 15, legendY - 5, 10, 10);
      ctx.fillStyle = l.color; ctx.fillText(l.label, lx + 10, legendY + 3);
    });

    pairs.forEach((pair, pi) => {
      const groupX = pad + pi * (barGroupW + 10);
      const sessions = [
        { val: pair.asian, color: '#a855f7' },
        { val: pair.london, color: '#3b82f6' },
        { val: pair.ny, color: '#22c55e' },
      ];

      sessions.forEach((s, si) => {
        const bx = groupX + si * (barW + 2);
        const bh = (s.val / 100) * maxBarH * progress;
        const by = pad + maxBarH - bh + 15;
        const r = parseInt(s.color.slice(1, 3), 16);
        const g = parseInt(s.color.slice(3, 5), 16);
        const b = parseInt(s.color.slice(5, 7), 16);
        ctx.fillStyle = `rgba(${r},${g},${b},0.2)`;
        ctx.fillRect(bx, by, barW, bh);
        ctx.strokeStyle = s.color; ctx.lineWidth = 1;
        ctx.strokeRect(bx, by, barW, bh);

        if (progress > 0.7) {
          ctx.font = 'bold 8px system-ui'; ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
          ctx.fillText(`${s.val}`, bx + barW / 2, by - 4);
        }
      });

      // Pair label
      ctx.font = 'bold 9px system-ui'; ctx.textAlign = 'center';
      ctx.fillStyle = pair.color;
      ctx.fillText(pair.name, groupX + barGroupW * 0.4, pad + maxBarH + 30);
    });

    ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center'; ctx.fillStyle = '#94a3b8';
    ctx.fillText('Relative volatility by session (higher = more movement)', w / 2, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function SessionsDeepDiveLesson() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const [expandedHour, setExpandedHour] = useState<number | null>(null);
  const [expandedPair, setExpandedPair] = useState<number | null>(null);
  const [expandedNews, setExpandedNews] = useState<number | null>(null);
  const [expandedMistake, setExpandedMistake] = useState<number | null>(null);

  // Game
  const [gameRound, setGameRound] = useState(0);
  const [gameAnswer, setGameAnswer] = useState<number | null>(null);
  const [gameScore, setGameScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  const gameScenarios = useMemo(() => [
    { correct: 2, label: 'Pre-London Prep', q: 'It is 06:45 UTC. London opens in 15 minutes. What should you be doing RIGHT NOW?',
      opts: ['Trading the Asian breakout', 'Nothing \u2014 wait for London to open', 'Marking Asian session high and low, checking HTF bias, identifying potential sweep levels', 'Setting market orders for London open'],
      explain: 'The 15 minutes before London open is your prep window. Mark the Asian H/L (your manipulation targets), check HTF bias on the Daily/4H, and identify which side of the range is more likely to get swept. You should be READY when 07:00 hits \u2014 not scrambling to analyse.' },
    { correct: 1, label: 'Pair Selection', q: 'You want to trade the London session. Which pair benefits MOST from London volatility?',
      opts: ['USD/JPY \u2014 because it has the tightest spread', 'GBP/USD or EUR/USD \u2014 because London is their home session with maximum liquidity', 'AUD/USD \u2014 because Australia is sleeping', 'Any pair \u2014 session doesn\u0027t matter'],
      explain: 'GBP and EUR pairs see their highest volatility during London because London is the financial centre for these currencies. Trading GBP/USD during Asian session is like fishing in a pond with no fish. Trade pairs when their HOME session is active.' },
    { correct: 0, label: 'News Impact', q: 'US CPI data drops at 13:30 UTC (during the London-NY overlap). You have an open Model 1 trade. What should you do?',
      opts: ['Close or tighten stop BEFORE the release \u2014 high-impact news can invalidate any setup', 'Hold \u2014 your model is correct regardless of news', 'Add to the position \u2014 news will push it further', 'Switch to a 1-minute chart to watch the release'],
      explain: 'High-impact news (CPI, NFP, FOMC) can create moves that override ALL technical analysis. Before a scheduled release, either close the trade, move stop to breakeven, or significantly tighten your stop. Never add risk before news. The model doesn\u0027t predict headlines.' },
    { correct: 3, label: 'Session Transition', q: 'London established a strong uptrend. It is now 16:30 UTC. NY traders are taking over. What is the most likely scenario?',
      opts: ['The uptrend accelerates further', 'An immediate reversal', 'Sideways consolidation', 'Distribution begins \u2014 late NY often marks the session high/low. Tighten stops and stop adding longs.'],
      explain: 'After 16:00 UTC, the overlap ends and late NY begins. Smart money starts distributing (taking profits). The session high or low for the day is often set between 15:00\u201317:00 UTC. This doesn\u0027t mean immediate reversal, but it means the easy money from the trend is done. Tighten stops and protect profits.' },
    { correct: 2, label: 'Weekend Gap', q: 'It is Sunday evening. Markets just opened. There is a 40-pip gap on EUR/USD. What should you know?',
      opts: ['Gaps always fill \u2014 trade against the gap immediately', 'Gaps never fill \u2014 trade with the gap', 'Gaps TEND to fill but not always. Wait for the Asian session to establish a range before acting. The gap itself is not a trade signal.', 'Gaps are meaningless'],
      explain: 'Weekend gaps fill roughly 70\u201380% of the time, but timing matters. Don\u0027t blindly trade the gap fill at Sunday open \u2014 spreads are wide and liquidity is thin. Wait for the Asian session to form a range, then look for your normal PO3/Model 1 setup. The gap provides context, not a trigger.' },
  ], []);
  const currentGame = gameScenarios[gameRound];

  // Quiz
  const quizQuestions = useMemo(() => [
    { q: 'What is the single most important thing to do before London open?', opts: ['Check social media for trade ideas', 'Mark the Asian session high and low and check your HTF bias', 'Place pending orders randomly', 'Switch to the 1-minute chart'], a: 1, explain: 'Asian H/L are your manipulation targets. HTF bias tells you which direction to expect. Together they form the foundation of your London session plan. This takes 2 minutes and prevents hours of confusion.' },
    { q: 'Why do GBP pairs move most during London session?', opts: ['Because of time zones', 'Because London is the home financial centre for GBP \u2014 maximum institutional participation and liquidity', 'Because the spread is tightest', 'Because of news releases'], a: 1, explain: 'Currencies move most when their home financial centre is active. GBP\u0027s home is London. EUR\u0027s home is London/Frankfurt. JPY\u0027s home is Tokyo. USD\u0027s home is New York. Trade the pair when its home session is open.' },
    { q: 'What happens to most pairs during the dead zone (21:00\u201300:00 UTC)?', opts: ['Increased volatility', 'Clear trend moves', 'Spreads widen, liquidity drops, moves become unreliable noise', 'The best trading opportunities of the day'], a: 2, explain: 'The dead zone has minimal institutional participation. Spreads widen (costing you more per trade), liquidity vanishes (making fills worse), and any price movement is noise \u2014 not signal.' },
    { q: 'How should you handle a high-impact news release during an open trade?', opts: ['Ignore it \u2014 technicals override fundamentals', 'Add to the position for extra profit', 'Close or protect the trade before the release \u2014 news can invalidate any technical setup', 'Switch to a faster timeframe'], a: 2, explain: 'High-impact events (NFP, CPI, FOMC, ECB) create moves that can override any technical analysis. Protect your capital first. You can always re-enter after the dust settles.' },
    { q: 'When does the daily high or low most commonly form?', opts: ['During Asian session', 'Between 07:00\u201310:00 UTC (London KZ) or 13:00\u201316:00 UTC (Overlap)', 'After 20:00 UTC', 'At midnight UTC'], a: 1, explain: 'Statistical analysis shows the daily high or low is most frequently set during the London Kill Zone or the London-NY overlap. These are the windows with maximum institutional activity and volume.' },
    { q: 'USD/JPY is most active during which session?', opts: ['London only', 'New York only', 'Asian session and early London (Tokyo-London overlap)', 'The dead zone'], a: 2, explain: 'USD/JPY involves the Japanese Yen (home: Tokyo/Asian) and the US Dollar (home: New York). It is most active when either Tokyo OR New York is open, and especially during the Tokyo-London overlap when both Asian and European banks are active.' },
    { q: 'What is the recommended maximum number of trades per Kill Zone session?', opts: ['Unlimited \u2014 take every setup', '1\u20132 trades maximum', '5\u201310 trades', 'Depends on account size'], a: 1, explain: 'Quality over quantity. 1\u20132 trades per Kill Zone keeps you focused on the best setups. More than that usually means you\u0027re forcing trades that don\u0027t meet your criteria. Each additional trade dilutes your edge.' },
    { q: 'What is the purpose of a daily session routine?', opts: ['To make trading more complicated', 'To eliminate guesswork \u2014 you know exactly what to do at every hour of the day', 'To trade more often', 'To follow other traders'], a: 1, explain: 'A daily routine removes decision fatigue. Instead of opening your chart and wondering &quot;what should I do?&quot;, you have a checklist: mark Asian H/L, check HTF bias, wait for London KZ, look for your model. Structure creates consistency. Consistency creates profit.' },
  ], []);

  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(quizQuestions.map(() => null));
  const quizDone = quizAnswers.every(a => a !== null);
  const quizCorrect = quizAnswers.filter((a, i) => a === quizQuestions[i].a).length;
  const score = Math.round((quizCorrect / quizQuestions.length) * 100);
  const certUnlocked = quizDone && score >= 66;

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-900/50"><motion.div className="h-full bg-gradient-to-r from-amber-500 to-accent-500" style={{ width: `${Math.min((scrollY / (typeof document !== 'undefined' ? document.body.scrollHeight - window.innerHeight : 1)) * 100, 100)}%` }} /></div>
      <nav className="sticky top-0 z-40 px-5 py-3 flex items-center justify-between" style={{ background: 'rgba(6,10,18,0.85)', backdropFilter: 'blur(16px)' }}>
        <Link href="/academy" className="text-xs text-gray-500 hover:text-gray-300 transition">&larr; Academy</Link>
        <div className="flex items-center gap-2"><Crown className="w-3.5 h-3.5 text-amber-400" /><span className="text-xs font-bold text-amber-400">PRO &middot; LEVEL 3</span></div>
      </nav>

      <section className="px-5 pt-16 pb-12 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 3 &middot; Lesson 14</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight"><span className="bg-gradient-to-r from-purple-400 via-blue-400 to-green-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Sessions<br/>Deep Dive</span></h1>
          <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">The complete hour-by-hour playbook. What to do at every stage of the trading day &mdash; from Asian open to the dead zone.</p>
        </motion.div>
      </section>

      {/* S00 */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-lg font-bold text-white mb-3">&#128197; Kill Zones told you WHEN. This lesson tells you exactly WHAT TO DO at every hour.</p>
            <p className="text-gray-400 leading-relaxed mb-4">Lesson 3.10 introduced the three sessions and Kill Zones. But knowing &quot;London opens at 07:00&quot; isn&apos;t enough. You need a <strong className="text-white">minute-by-minute playbook</strong>: what to check, what to mark, what to watch for, and when to step away.</p>
            <p className="text-gray-400 leading-relaxed">This lesson also covers something no other SMC course teaches: <strong className="text-amber-400">which pairs behave differently in which sessions</strong>, how to integrate the economic calendar, and a complete daily routine you can follow from day one.</p>
          </div>
          <DailyTimelineAnimation />
        </motion.div>
      </section>

      {/* S01 — HOUR BY HOUR */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; Hour by Hour</p>
          <h2 className="text-2xl font-extrabold mb-4">Your Complete Daily Playbook</h2>
          <p className="text-sm text-gray-400 mb-6">Every hour of the 24-hour cycle has a purpose. Tap each block to see exactly what you should be doing:</p>
        </motion.div>
        {[
          { time: '00:00\u201303:00', label: 'Asian Kill Zone', color: '#a855f7', task: 'MARK THE RANGE', detail: 'Mark the high and low forming during these hours. This range becomes your manipulation target for London. Check HTF bias on the Daily chart. Note any equal highs/lows forming. DO NOT trade breakouts \u2014 80% are false.' },
          { time: '03:00\u201307:00', label: 'Asian Drift', color: '#a855f7', task: 'WAIT', detail: 'Volume is at its lowest. Price drifts within or near the Asian range. Use this time to prepare: mark the range lines, update your trade journal, check the economic calendar for today\u0027s events. No trading.' },
          { time: '06:45\u201307:00', label: 'Pre-London Prep', color: '#f59e0b', task: 'FINAL CHECK', detail: 'Confirm Asian H/L are marked. Check HTF bias one final time. Identify which side of the range has more liquidity (more equal highs/lows = bigger liquidity pool). Switch to your execution timeframe. Be READY.' },
          { time: '07:00\u201310:00', label: 'London Kill Zone', color: '#3b82f6', task: 'EXECUTE', detail: 'This is your primary trading window. Watch for the manipulation sweep of Asian H/L. When the sweep + reversal (BOS) occurs, execute Model 1 or Model 2. Maximum 2 entries. If no setup forms by 10:00, accept it and wait for the overlap.' },
          { time: '10:00\u201313:00', label: 'London Trend', color: '#3b82f6', task: 'MANAGE', detail: 'If you entered during London KZ, manage your trade: trail stop to breakeven at 1R, consider partial profit. If no entry yet, do NOT force one \u2014 the setup window has passed. Prepare for the overlap.' },
          { time: '13:00\u201316:00', label: 'London-NY Overlap', color: '#f59e0b', task: 'PEAK VOLUME', detail: 'Maximum volatility. If holding a London trade, this is where the biggest move happens \u2014 let it run. If looking for a fresh entry, Model 2 (OTE continuation) works well here. Watch for distribution starting around 15:00\u201316:00.' },
          { time: '16:00\u201320:00', label: 'Late New York', color: '#22c55e', task: 'WIND DOWN', detail: 'Take profits on remaining trades. Tighten stops. The daily high or low is likely set. Volume declining. New entries are LOW probability. Use this time to journal your trades and analyse what happened.' },
          { time: '20:00\u201300:00', label: 'Dead Zone', color: '#ef4444', task: 'STOP', detail: 'Close your charts. Do not trade. Spreads are at their widest. Any movement is noise. Use this time for Academy study, backtesting, or rest. Your next opportunity is tomorrow\u0027s Asian KZ.' },
        ].map((item, i) => (
          <div key={i} className="mb-2">
            <button onClick={() => setExpandedHour(expandedHour === i ? null : i)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-gray-500">{item.time}</span>
                <span className="text-sm font-bold" style={{ color: item.color }}>{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded" style={{ color: item.color, backgroundColor: item.color + '15' }}>{item.task}</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedHour === i ? 'rotate-180' : ''}`} />
              </div>
            </button>
            <AnimatePresence>
              {expandedHour === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="p-5 mx-2 mb-2 rounded-xl bg-[#0a1020] border border-white/5"><p className="text-gray-300 text-sm leading-relaxed">{item.detail}</p></div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </section>

      {/* S02 — PAIR BEHAVIOUR */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; Pair-Specific Behaviour</p>
          <h2 className="text-2xl font-extrabold mb-4">Not All Pairs Move the Same Way</h2>
          <p className="text-sm text-gray-400 mb-6">Each currency pair has a &quot;home session&quot; where it moves most. Trading a pair outside its home session is like fishing in an empty pond.</p>
          <PairBehaviourAnimation />
        </motion.div>
        {[
          { pair: 'EUR/USD', color: '#3b82f6', home: 'London + NY Overlap', detail: 'The world\u0027s most traded pair. Moves most during London (07:00\u201316:00) and especially the overlap (13:00\u201316:00). Asian session is typically a tight range \u2014 perfect for marking manipulation levels. Average daily range: 60\u201390 pips.' },
          { pair: 'GBP/USD', color: '#22c55e', home: 'London Kill Zone', detail: 'The &quot;cable&quot; is London\u0027s pair. Explosive moves at London open. Often sweeps Asian H/L aggressively. Higher volatility than EUR/USD (average 80\u2013120 pips daily). Best for Model 1 (sweep reversal) setups.' },
          { pair: 'USD/JPY', color: '#a855f7', home: 'Asian + Early London', detail: 'Unique behaviour: most active during Asian session (JPY\u0027s home). The Tokyo-London overlap (07:00\u201308:00) can produce strong moves. Less volatile during NY. Heavily influenced by Bank of Japan policy.' },
          { pair: 'XAU/USD (Gold)', color: '#f59e0b', home: 'London + NY', detail: 'Gold is active during both London and NY but comes alive during the overlap. Highly sensitive to US economic data. Average daily range: $20\u2013$40. Wider spreads during Asian = avoid trading Gold during Asian hours.' },
        ].map((item, i) => (
          <div key={i} className="mb-2">
            <button onClick={() => setExpandedPair(expandedPair === i ? null : i)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold" style={{ color: item.color }}>{item.pair}</span>
                <span className="text-xs text-gray-500">Home: {item.home}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedPair === i ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {expandedPair === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="p-5 mx-2 mb-2 rounded-xl bg-[#0a1020] border border-white/5"><p className="text-gray-300 text-sm leading-relaxed">{item.detail}</p></div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </section>

      {/* S03 — NEWS CALENDAR */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; News Calendar Integration</p>
          <h2 className="text-2xl font-extrabold mb-4">When Fundamentals Override Technicals</h2>
          <p className="text-sm text-gray-400 mb-6">Your SMC models work 95% of the time. The other 5% is when a major news release overrides everything. Here&apos;s how to handle it:</p>
        </motion.div>
        {[
          { event: 'Non-Farm Payrolls (NFP)', time: 'First Friday, 13:30 UTC', impact: 'EXTREME', color: '#ef4444', rule: 'Close all USD trades 15 minutes before. Do not open new trades until 30 minutes after the release. The initial spike is unpredictable.' },
          { event: 'CPI / Inflation Data', time: 'Monthly, 13:30 UTC (US)', impact: 'HIGH', color: '#ef4444', rule: 'Same as NFP \u2014 close or heavily protect USD trades. CPI surprises can create 50\u2013100 pip moves in seconds.' },
          { event: 'FOMC Rate Decision', time: '8x/year, 19:00 UTC', impact: 'EXTREME', color: '#ef4444', rule: 'No new trades from 18:00 UTC. Existing trades should be at breakeven minimum. The statement + press conference can whipsaw markets for hours.' },
          { event: 'ECB / BOE Decisions', time: 'Monthly, various', impact: 'HIGH', color: '#f59e0b', rule: 'Affects EUR and GBP pairs specifically. Close or protect relevant pairs before the announcement. Non-EUR/GBP pairs are usually fine.' },
        ].map((item, i) => (
          <div key={i} className="mb-2">
            <button onClick={() => setExpandedNews(expandedNews === i ? null : i)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-white">{item.event}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ color: item.color, backgroundColor: item.color + '15' }}>{item.impact}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedNews === i ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {expandedNews === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="p-5 mx-2 mb-2 rounded-xl bg-[#0a1020] border border-white/5">
                    <p className="text-xs text-gray-500 mb-2">Typical time: {item.time}</p>
                    <p className="text-gray-300 text-sm leading-relaxed">{item.rule}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
        <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
          <p className="text-sm text-gray-400 leading-relaxed">&#128161; <strong className="text-amber-400">Daily habit:</strong> Check the economic calendar EVERY morning before you trade. Bookmark <strong className="text-white">forexfactory.com/calendar</strong> or use TradingView&apos;s built-in calendar. Filter for HIGH impact events only. Mark the times on your chart. If a red event falls during your Kill Zone, adjust your plan.</p>
        </div>
      </section>

      {/* S04 — DAILY ROUTINE CHECKLIST */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Daily Routine</p>
          <h2 className="text-2xl font-extrabold mb-4">The 10-Step Daily Checklist</h2>
          <p className="text-sm text-gray-400 mb-6">Copy this routine. Follow it every day. It removes guesswork and creates consistency.</p>
          {[
            { step: 1, time: 'Before Asian', task: 'Check economic calendar for today\u0027s high-impact events', color: '#a855f7' },
            { step: 2, time: 'Asian Open', task: 'Open your pairs. Let Asian session print for 2\u20133 hours.', color: '#a855f7' },
            { step: 3, time: '03:00 UTC', task: 'Mark Asian H/L on all pairs you trade', color: '#a855f7' },
            { step: 4, time: '06:00 UTC', task: 'Check Daily/4H HTF bias. Note key OBs and liquidity levels.', color: '#f59e0b' },
            { step: 5, time: '06:45 UTC', task: 'Switch to execution TF (15M/5M). Confirm Asian H/L. Ready position.', color: '#f59e0b' },
            { step: 6, time: '07:00\u201310:00', task: 'TRADE: Watch for sweep + BOS. Execute Model 1 or 2. Max 2 entries.', color: '#3b82f6' },
            { step: 7, time: '10:00\u201313:00', task: 'MANAGE: Trail stops. Prepare for overlap. No new entries unless Model 2.', color: '#3b82f6' },
            { step: 8, time: '13:00\u201316:00', task: 'OVERLAP: Let winners run. Last chance for Model 2 entries. Watch for distribution.', color: '#22c55e' },
            { step: 9, time: '16:00\u201318:00', task: 'CLOSE: Take remaining profits. Close all trades by 18:00 for day traders.', color: '#22c55e' },
            { step: 10, time: 'Evening', task: 'JOURNAL: Record every trade. Note what worked, what didn\u0027t. Review Asian H/L accuracy.', color: '#f59e0b' },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3 mb-3">
              <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: item.color + '20', color: item.color }}>{item.step}</div>
              <div>
                <p className="text-xs text-gray-500">{item.time}</p>
                <p className="text-sm text-white">{item.task}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* S05 — WEEKLY PLANNING */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Weekly Planning</p>
          <h2 className="text-2xl font-extrabold mb-4">The Sunday Night Prep</h2>
          <p className="text-sm text-gray-400 mb-6">Professional traders don&apos;t start Monday blind. They prepare on Sunday evening. Here&apos;s your weekly routine:</p>
          {[
            { step: 1, task: 'Check the economic calendar for the ENTIRE week. Mark all high-impact events (NFP, CPI, FOMC, ECB). Note which days to be cautious.', color: '#ef4444' },
            { step: 2, task: 'Review the Weekly chart. Where is the current weekly candle relative to HTF structure? Is price in premium or discount on the Weekly?', color: '#f59e0b' },
            { step: 3, task: 'Identify the Weekly OB/FVG/Liquidity levels that price is approaching. These are your &quot;big picture&quot; targets for the week.', color: '#3b82f6' },
            { step: 4, task: 'Note the previous week&apos;s high and low. These are key liquidity levels that may get swept this week (especially Monday&ndash;Tuesday).', color: '#a855f7' },
            { step: 5, task: 'Set your maximum risk for the week: e.g. &quot;If I lose 3% this week, I stop trading until next Monday.&quot; Write it down.', color: '#ef4444' },
            { step: 6, task: 'Decide which pairs you will focus on this week based on the calendar and HTF setups. Maximum 3&ndash;4 pairs.', color: '#22c55e' },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3 mb-3">
              <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: item.color + '20', color: item.color }}>{item.step}</div>
              <p className="text-sm text-gray-400 leading-relaxed">{item.task}</p>
            </div>
          ))}
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
            <p className="text-sm text-gray-400 leading-relaxed">&#128161; <strong className="text-amber-400">Day-of-week tendencies:</strong> Monday &mdash; consolidation/range-building (accumulation for the week). Tuesday&ndash;Wednesday &mdash; the week&apos;s big move often starts. Thursday &mdash; continuation or reversal. Friday &mdash; profit-taking, especially after 13:00 UTC. These are tendencies, not rules &mdash; but they help set expectations.</p>
          </div>
        </motion.div>
      </section>

      {/* S06 — SESSION JOURNALING */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Session Journaling</p>
          <h2 className="text-2xl font-extrabold mb-4">Track Your Sessions, Not Just Your Trades</h2>
          <p className="text-sm text-gray-400 mb-6">Most traders journal their trades. The best traders journal their <strong className="text-white">sessions</strong>. After each trading day, record:</p>
          <div className="space-y-3">
            <div className="p-4 rounded-xl border-l-4 border-purple-500 bg-purple-500/5">
              <p className="text-purple-400 font-bold text-sm">Asian Range Accuracy</p>
              <p className="text-gray-400 text-sm mt-1">Did you mark the Asian H/L correctly? Did London sweep one of them? Over time you&apos;ll see that 70&ndash;80% of days, London sweeps at least one side of the Asian range.</p>
            </div>
            <div className="p-4 rounded-xl border-l-4 border-blue-500 bg-blue-500/5">
              <p className="text-blue-400 font-bold text-sm">Kill Zone Performance</p>
              <p className="text-gray-400 text-sm mt-1">Which Kill Zone did you trade? What was the outcome? After 20&ndash;30 sessions, you&apos;ll discover which Kill Zone suits your style best. Some traders thrive at London open. Others perform better in the overlap.</p>
            </div>
            <div className="p-4 rounded-xl border-l-4 border-green-500 bg-green-500/5">
              <p className="text-green-400 font-bold text-sm">Model Success Rate</p>
              <p className="text-gray-400 text-sm mt-1">Which model did you use? Did it work? Track Model 1 vs Model 2 win rates separately. You might discover you&apos;re better at one than the other &mdash; and should focus accordingly.</p>
            </div>
            <div className="p-4 rounded-xl border-l-4 border-amber-500 bg-amber-500/5">
              <p className="text-amber-400 font-bold text-sm">Emotional State</p>
              <p className="text-gray-400 text-sm mt-1">Were you calm and focused? Or were you chasing, bored, or revenge trading? The pattern between your emotional state and your results will become obvious after 2&ndash;3 weeks of honest journaling.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S07 — MISTAKES */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Session Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-4">Mistakes That Kill Session Traders</h2>
        </motion.div>
        {[
          { title: 'No Pre-Session Preparation', wrong: 'Opening charts at 07:00 and scrambling to find levels.', right: 'All levels marked by 06:45. HTF bias checked. Calendar reviewed. You are READY when London opens.', tip: 'Preparation is 90% of trading. Execution is 10%.' },
          { title: 'Trading the Wrong Pair at the Wrong Time', wrong: 'Trading GBP/USD during Asian session or USD/JPY during late NY.', right: 'Match the pair to its home session. GBP = London. JPY = Asian. Gold = London/NY.', tip: 'If a pair isn\u0027t moving, it\u0027s not its time. Switch pairs or wait.' },
          { title: 'Ignoring the Calendar', wrong: 'Getting stopped out by NFP because you didn\u0027t check the calendar.', right: 'Check the calendar EVERY morning. Mark high-impact events. Protect or close trades before them.', tip: 'Set a phone alarm 30 minutes before every red event.' },
          { title: 'Trading Without a Routine', wrong: 'Different approach every day. Sometimes trading Asian, sometimes NY, sometimes both.', right: 'Follow the same 10-step routine every single day. Consistency in process creates consistency in results.', tip: 'Print the checklist from Section 04 and tape it next to your monitor.' },
        ].map((item, i) => (
          <div key={i} className="mb-2">
            <button onClick={() => setExpandedMistake(expandedMistake === i ? null : i)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between">
              <span className="text-white text-sm font-semibold">{item.title}</span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedMistake === i ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {expandedMistake === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="p-5 mx-2 mb-2 rounded-xl bg-[#0a1020] border border-white/5 space-y-3">
                    <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10"><p className="text-red-400 text-xs font-bold mb-1">&#10060; Wrong</p><p className="text-gray-400 text-sm">{item.wrong}</p></div>
                    <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10"><p className="text-green-400 text-xs font-bold mb-1">&#10003; Right</p><p className="text-gray-400 text-sm">{item.right}</p></div>
                    <p className="text-amber-400 text-sm">&#128161; {item.tip}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </section>

      {/* S06 — GAME */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Session Decisions</p>
          <h2 className="text-2xl font-extrabold mb-2">Daily Playbook Game</h2>
          <p className="text-sm text-gray-400 mb-6">5 real-world scenarios. Make the right decision based on session context.</p>
        </motion.div>
        {!gameComplete ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500">Round {gameRound + 1} of 5</span>
              <span className="text-xs text-amber-400 font-bold">{gameScore}/{gameRound + (gameAnswer !== null ? 1 : 0)} correct</span>
            </div>
            <p className="text-white font-semibold text-sm mb-3">{currentGame.label}</p>
            <p className="text-gray-300 text-sm mb-4">{currentGame.q}</p>
            <div className="space-y-2">
              {currentGame.opts.map((opt, oi) => {
                const answered = gameAnswer !== null;
                const isCorrect = oi === currentGame.correct;
                const isChosen = gameAnswer === oi;
                let cls = 'glass text-gray-300 hover:bg-white/5';
                if (answered) { if (isCorrect) cls = 'bg-green-500/15 border-green-500/30 text-green-400'; else if (isChosen) cls = 'bg-red-500/15 border-red-500/30 text-red-400'; else cls = 'glass text-gray-600'; }
                return (<button key={oi} onClick={() => { if (!answered) { setGameAnswer(oi); if (oi === currentGame.correct) setGameScore(s => s + 1); } }} disabled={answered} className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${cls}`}>{opt} {answered && isCorrect && '\u2713'} {answered && isChosen && !isCorrect && '\u2717'}</button>);
              })}
            </div>
            {gameAnswer !== null && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15 text-sm text-gray-400 leading-relaxed mb-4"><span className="text-amber-400 font-bold">Explanation: </span>{currentGame.explain}</div>
                {gameRound < gameScenarios.length - 1 ? (
                  <button onClick={() => { setGameRound(r => r + 1); setGameAnswer(null); }} className="w-full p-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all">Next Round &rarr;</button>
                ) : (
                  <button onClick={() => setGameComplete(true)} className="w-full p-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all">See Results &rarr;</button>
                )}
              </motion.div>
            )}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-8 glass-card rounded-2xl">
            <p className="text-5xl font-extrabold mb-2 text-amber-400">{gameScore}/{gameScenarios.length}</p>
            <p className="text-sm text-gray-400">{gameScore === 5 ? '&#128197; Perfect session management!' : gameScore >= 3 ? 'Solid daily routine.' : 'Review the hour-by-hour playbook.'}</p>
          </motion.div>
        )}
      </section>

      {/* S07 — QUIZ */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Knowledge Check</p>
          <h2 className="text-2xl font-extrabold mb-6">Sessions Deep Dive Quiz</h2>
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
                  if (answered) { if (isCorrect) cls = 'bg-green-500/15 border-green-500/30 text-green-400'; else if (isChosen) cls = 'bg-red-500/15 border-red-500/30 text-red-400'; else cls = 'glass text-gray-600'; }
                  return (<button key={oi} onClick={() => { if (!answered) { const na = [...quizAnswers]; na[qi] = oi; setQuizAnswers(na); } }} disabled={answered} className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${cls}`}>{opt} {answered && isCorrect && '\u2713'} {answered && isChosen && !isCorrect && '\u2717'}</button>);
                })}
              </div>
              {quizAnswers[qi] !== null && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 text-sm text-gray-400 leading-relaxed"><span className="text-amber-400 font-bold">&#10003;</span> {q.explain}</motion.div>)}
            </motion.div>
          ))}
        </div>
        {quizDone && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 text-center p-8 glass-card rounded-2xl"><p className={`text-5xl font-extrabold mb-2 ${score >= 66 ? 'text-amber-400' : 'text-red-400'}`}>{score}%</p><p className="text-sm text-gray-400">{score === 100 ? '&#128197; You have the complete daily playbook. Unstoppable.' : score >= 66 ? 'Solid session mastery. Ready for the Level 3 Capstone.' : 'Review the hour-by-hour playbook and daily routine.'}</p></motion.div>)}
      </section>

      {/* Certificate */}
      <section className="px-5 py-16 text-center">
        {!certUnlocked ? (
          <div className="max-w-md mx-auto p-8 glass rounded-2xl"><p className="text-4xl mb-3 opacity-30">&#128274;</p><p className="text-sm text-gray-500">Score 66%+ to unlock your <strong className="text-amber-400">Pro Certificate</strong></p></div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, type: 'spring' }}
            className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(168,85,247,0.06),transparent,rgba(34,197,94,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
            <div className="absolute inset-[1px] rounded-3xl border border-amber-500/10" />
            <div className="relative z-10">
              <div className="w-[80px] h-[80px] mx-auto mb-5 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-green-500 flex items-center justify-center text-4xl shadow-lg shadow-purple-500/20">&#128197;</div>
              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest mb-2">Pro Certificate</p>
              <h3 className="text-xl font-extrabold mb-1">Certificate of Mastery</h3>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">Has mastered<br /><strong className="text-white">Level 3.14: Sessions Deep Dive</strong><br />at ATLAS Academy by Interakktive</p>
              <p className="bg-gradient-to-r from-purple-400 via-blue-400 to-green-400 bg-clip-text text-transparent font-bold text-lg mb-1" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Session Master &mdash;</p>
              <p className="font-mono text-[11px] text-gray-500 mb-4">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L3.14-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
            </div>
          </motion.div>
        )}
      </section>

      <section className="text-center px-5 pt-10 pb-24">
        <p className="text-xs tracking-widest uppercase text-gray-600 mb-4">Up Next</p>
        <h2 className="text-xl font-bold mb-6">Lesson 3.15 &mdash; Building Your SMC Strategy</h2>
        <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">
          Continue <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
