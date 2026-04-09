// app/academy/lesson/smc-strategy/page.tsx
// ATLAS Academy — Lesson 3.15: Building Your SMC Strategy [PRO] — LEVEL 3 CAPSTONE
'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Crown, ArrowRight, ChevronDown } from 'lucide-react';

export default function SMCStrategyLesson() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Strategy builder wizard
  const [builderStep, setBuilderStep] = useState(0);
  const [builderChoices, setBuilderChoices] = useState<Record<number, number>>({});
  const choose = (step: number, idx: number) => { setBuilderChoices(prev => ({ ...prev, [step]: idx })); };
  const allBuilderDone = Object.keys(builderChoices).length >= 7;

  // Accordions
  const [expandedPillar, setExpandedPillar] = useState<number | null>(null);
  const [expandedCheck, setExpandedCheck] = useState<number | null>(null);
  const [expandedJournal, setExpandedJournal] = useState<number | null>(null);
  const [expandedMistake, setExpandedMistake] = useState<number | null>(null);

  // Game
  const [gameRound, setGameRound] = useState(0);
  const [gameAnswer, setGameAnswer] = useState<number | null>(null);
  const [gameScore, setGameScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  const gameScenarios = useMemo(() => [
    { correct: 0, label: 'Perfect A+ Setup', q: 'London KZ. Asian low swept. BOS confirmed on 15M. OB in OTE zone with FVG confluence. HTF Daily is bullish. You have 1% risk calculated. Should you take this trade?',
      opts: ['YES \u2014 this is a textbook A+ Model 1 setup with full confluence', 'NO \u2014 wait for more confirmation', 'MAYBE \u2014 reduce to 0.25% risk', 'NO \u2014 it\u0027s too obvious, it must be a trap'],
      explain: 'This is the setup you have been training for across 14 lessons. Kill Zone active (3.10), PO3 manipulation complete (3.11), Model 1 sequence confirmed (3.12), OB in OTE (3.8) with FVG (3.6), HTF aligned (2.11). Full confluence = full position size. This is what discipline looks like \u2014 waiting for the A+ and then executing without hesitation.' },
    { correct: 3, label: 'Counter-Trend Trap', q: 'Daily chart is clearly bearish (LH/LL). On the 15M during London, you see a bullish BOS after a sell-side sweep. Should you go long?',
      opts: ['YES \u2014 the BOS confirms the reversal', 'YES \u2014 the sweep means smart money is buying', 'MAYBE \u2014 with tight stop only', 'NO \u2014 a 15M bullish BOS in a Daily downtrend is a counter-trend trap. Your strategy says trade WITH the HTF.'],
      explain: 'Your strategy rule #1: always align with HTF bias. A bullish 15M BOS within a Daily downtrend is just a pullback within the larger trend \u2014 not a reversal. The next move is likely bearish continuation. Model 2 SHORT is the correct approach here, not Model 1 long.' },
    { correct: 2, label: 'Two Losses Today', q: 'You\u0027ve taken two Model 1 trades during London KZ. Both hit stop loss. The overlap is starting and you see another setup forming. What do you do?',
      opts: ['Take it \u2014 third time lucky', 'Take it with double position size to recover losses', 'STOP \u2014 your strategy says maximum 2 trades per session. Close charts and journal.', 'Switch to a different pair and try again'],
      explain: 'Your strategy has a hard rule: maximum 2 trades per Kill Zone session. Two losses means you are done for today. This is not about the quality of the third setup \u2014 it is about discipline. Revenge trading after two losses leads to account destruction. Journal the losses, analyse what went wrong, and come back tomorrow fresh.' },
    { correct: 1, label: 'No Setup by 10:00', q: 'It\u0027s 10:00 UTC. London KZ is ending. Asian H/L were never swept. No BOS formed. No Model 1 setup appeared. What do you do?',
      opts: ['Force a trade on the nearest OB \u2014 you can\u0027t have a zero day', 'Accept it \u2014 no setup means no trade. Wait for the overlap or tomorrow. The best trade is sometimes no trade.', 'Switch to the 1-minute chart to find something', 'Trade based on gut feeling'],
      explain: 'Not every session produces a valid setup. If London didn\u0027t sweep the Asian range and no BOS formed, there is no Model 1 trade. You can look for a Model 2 during the overlap if an HTF OB is nearby, but forcing a non-existent setup is gambling. Your strategy protects you from yourself on days like this.' },
    { correct: 0, label: 'Strategy Review', q: 'You\u0027ve been trading your SMC strategy for 3 weeks. Your win rate is 42% but your average R:R is 1:3.2. Are you profitable?',
      opts: ['YES \u2014 Expectancy = (0.42 \u00d7 3.2) \u2013 (0.58 \u00d7 1) = 1.344 \u2013 0.58 = +0.764R per trade. That\u0027s highly profitable.', 'NO \u2014 42% win rate is too low', 'MAYBE \u2014 need more data', 'NO \u2014 you need at least 60% to be profitable'],
      explain: 'This is the expectancy formula from Lesson 2.12 applied to SMC. A 42% win rate with 1:3.2 R:R gives an expectancy of +0.764R per trade. That means for every trade you take, you expect to make 0.764 times your risk. Over 100 trades at 1% risk, that\u0027s +76.4% account growth. Win rate alone means NOTHING \u2014 risk:reward is what makes you profitable.' },
  ], []);
  const currentGame = gameScenarios[gameRound];

  // Quiz
  const quizQuestions = useMemo(() => [
    { q: 'What is the FIRST thing you check before looking for any SMC setup?', opts: ['The 1-minute chart', 'The economic calendar and HTF bias (Daily/4H direction)', 'Twitter/X for trade ideas', 'The Asian session range'], a: 1, explain: 'HTF bias is the foundation. Everything else \u2014 Kill Zones, PO3, Model selection \u2014 flows from knowing which direction the HTF supports. Without this, every setup is a coin flip.' },
    { q: 'Your strategy says "maximum 2 trades per session." You\u0027ve lost both. A perfect A+ setup appears. What do you do?', opts: ['Take it \u2014 it\u0027s A+', 'Take it with reduced size', 'Skip it \u2014 rules are rules. Two trades means two trades, regardless of quality.', 'Ask someone else what to do'], a: 2, explain: 'Strategy rules are NON-NEGOTIABLE. The rule exists to protect you from revenge trading and emotional spirals. An A+ setup will appear again tomorrow. Your account won\u0027t recover if you break discipline today.' },
    { q: 'What makes an SMC strategy different from a retail strategy?', opts: ['More indicators', 'It combines institutional concepts (liquidity, OBs, FVGs, structure) with session timing and defined trade models', 'It only works on forex', 'It guarantees profits'], a: 1, explain: 'An SMC strategy chains institutional-grade concepts into a complete execution framework: HTF bias \u2192 Session timing \u2192 Manipulation identification \u2192 Confirmation \u2192 Precise entry at institutional levels \u2192 Risk management. Each step has been covered in Lessons 3.1\u20133.14.' },
    { q: 'A 40% win rate with 1:4 R:R is\u2026', opts: ['Terrible \u2014 40% is losing', 'Breakeven', 'Profitable \u2014 expectancy is (0.4\u00d74) \u2013 (0.6\u00d71) = +1.0R per trade', 'Impossible to calculate'], a: 2, explain: 'Expectancy = (Win% \u00d7 Avg Win) \u2013 (Loss% \u00d7 Avg Loss) = (0.4 \u00d7 4) \u2013 (0.6 \u00d7 1) = 1.6 \u2013 0.6 = +1.0R per trade. That means every trade, on average, makes 1x your risk. Over 100 trades at 1% risk = +100% account growth.' },
    { q: 'Why is journaling essential to an SMC strategy?', opts: ['To show off on social media', 'To track patterns in your performance \u2014 which sessions, models, pairs, and emotional states produce your best and worst results', 'To remember trade prices', 'It is optional'], a: 1, explain: 'Journaling reveals patterns you can\u0027t see in real-time. After 30\u201350 trades, your journal will show you: which Kill Zone suits you best, which model has a higher win rate, which pairs you trade most profitably, and how emotions affect your results. This data lets you OPTIMISE your strategy.' },
    { q: 'What are the "Five Pillars" of an SMC strategy?', opts: ['Candles, indicators, trendlines, support, resistance', 'Direction (HTF bias), Timing (sessions), Entry Model, Risk Management, Psychology', 'Just risk management', 'Fibonacci, volume, RSI, MACD, Bollinger'], a: 1, explain: 'Every complete SMC strategy needs all five pillars: (1) Direction \u2014 which way (HTF bias), (2) Timing \u2014 when (Kill Zones + PO3), (3) Entry Model \u2014 how (Model 1 or 2), (4) Risk Management \u2014 how much (position size, stop, target), (5) Psychology \u2014 discipline rules.' },
    { q: 'What should your strategy document include?', opts: ['Just entry rules', 'Only risk management', 'Complete rules for direction, timing, entry, exit, risk, psychology, AND conditions for NOT trading', 'A list of indicators'], a: 2, explain: 'A strategy document is your trading constitution. It defines: when to trade, when NOT to trade, how to enter, where to stop, where to target, how much to risk, and what to do when emotions take over. If it\u0027s not written down, it\u0027s not a strategy \u2014 it\u0027s a suggestion.' },
    { q: 'After completing Level 3, what is the recommended next step?', opts: ['Start trading live with real money immediately', 'Paper trade or demo trade your strategy for 30\u201350 trades to validate the edge before risking real capital', 'Move to Level 4', 'Nothing \u2014 you\u0027re ready'], a: 1, explain: 'Knowledge without practice is dangerous. Demo trade your SMC strategy for at least 30\u201350 trades. Track your results. If your expectancy is positive after 50 trades, you have a validated edge. THEN move to live trading with small position sizes. Slow is fast.' },
  ], []);

  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(quizQuestions.map(() => null));
  const quizDone = quizAnswers.every(a => a !== null);
  const quizCorrect = quizAnswers.filter((a, i) => a === quizQuestions[i].a).length;
  const score = Math.round((quizCorrect / quizQuestions.length) * 100);
  const certUnlocked = quizDone && score >= 66;

  // Builder data
  const builderSteps = [
    { title: 'HTF Bias Method', opts: ['Daily BOS/CHoCH direction only', 'Daily + 4H confluence', 'Weekly + Daily + 4H (full top-down)'] },
    { title: 'Primary Session', opts: ['London Kill Zone (07:00\u201310:00 UTC)', 'London\u2013NY Overlap (13:00\u201316:00 UTC)', 'Both London KZ + Overlap'] },
    { title: 'Primary Model', opts: ['Model 1 (Sweep Reversal) \u2014 catching turns', 'Model 2 (OTE Continuation) \u2014 riding trends', 'Both models depending on context'] },
    { title: 'Entry Confirmation', opts: ['15M BOS/CHoCH at OB', '5M BOS/CHoCH at OB (tighter)', 'Limit order at OB (no LTF confirmation)'] },
    { title: 'Risk Per Trade', opts: ['0.5% (conservative)', '1.0% (standard)', '1.5% (aggressive \u2014 advanced only)'] },
    { title: 'Maximum Trades Per Session', opts: ['1 trade (sniper)', '2 trades (standard)', '3 trades (active \u2014 advanced only)'] },
    { title: 'Psychology Rule', opts: ['Stop after 2 consecutive losses', 'Stop after daily loss reaches 2%', 'Both \u2014 whichever hits first'] },
  ];

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-900/50"><motion.div className="h-full bg-gradient-to-r from-amber-500 to-accent-500" style={{ width: `${Math.min((scrollY / (typeof document !== 'undefined' ? document.body.scrollHeight - window.innerHeight : 1)) * 100, 100)}%` }} /></div>
      <nav className="sticky top-0 z-40 px-5 py-3 flex items-center justify-between" style={{ background: 'rgba(6,10,18,0.85)', backdropFilter: 'blur(16px)' }}>
        <Link href="/academy" className="text-xs text-gray-500 hover:text-gray-300 transition">&larr; Academy</Link>
        <div className="flex items-center gap-2"><Crown className="w-3.5 h-3.5 text-amber-400" /><span className="text-xs font-bold text-amber-400">PRO &middot; LEVEL 3</span></div>
      </nav>

      <section className="px-5 pt-16 pb-12 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 3 &middot; Lesson 15 &mdash; CAPSTONE</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight"><span className="bg-gradient-to-r from-amber-400 via-red-400 to-green-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Building Your<br/>SMC Strategy</span></h1>
          <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">The final lesson. Take everything from Level 3 and forge it into YOUR personal, rules-based Smart Money strategy.</p>
        </motion.div>
      </section>

      {/* S00 */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-lg font-bold text-white mb-3">&#128220; A strategy is not what you know. It is what you DO &mdash; consistently, every single day.</p>
            <p className="text-gray-400 leading-relaxed mb-4">You now have 14 lessons of Smart Money knowledge. Liquidity, structure, order blocks, FVGs, OTE, breakers, kill zones, PO3, trade models, PHANTOM PRO automation, and session management. That is an <strong className="text-white">enormous</strong> toolkit.</p>
            <p className="text-gray-400 leading-relaxed mb-4">But knowledge without a <strong className="text-amber-400">written, rules-based strategy</strong> is like owning every tool in a hardware store with no blueprint. You&apos;ll build something &mdash; but it won&apos;t be a house. It&apos;ll be a mess.</p>
            <p className="text-gray-400 leading-relaxed">This lesson turns your knowledge into a <strong className="text-white">personal trading constitution</strong> &mdash; a document you follow every day, in every session, for every trade. When you finish this lesson, you will have a complete, written SMC strategy that is uniquely yours.</p>
          </div>
        </motion.div>
      </section>

      {/* S01 — FIVE PILLARS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Five Pillars</p>
          <h2 className="text-2xl font-extrabold mb-4">Every Strategy Needs These Five Pillars</h2>
        </motion.div>
        {[
          { pillar: 'Direction', icon: '&#127760;', color: '#f59e0b', desc: 'HTF bias tells you WHICH WAY to trade. Daily/4H BOS direction. Premium vs discount zone. Without direction, every trade is a coin flip. (Lessons 3.2, 3.7, 2.11)', lesson: 'If the Daily says sell, you do not buy on the 15M.' },
          { pillar: 'Timing', icon: '&#128337;', color: '#3b82f6', desc: 'Kill Zones and PO3 tell you WHEN to trade. Asian accumulation, London manipulation, NY distribution. Outside these windows, your edge disappears. (Lessons 3.10, 3.11, 3.14)', lesson: 'The same setup at 08:00 UTC (London KZ) is worth 10x more than at 22:00 UTC (dead zone).' },
          { pillar: 'Entry Model', icon: '&#127919;', color: '#22c55e', desc: 'Model 1 (Sweep Reversal) or Model 2 (OTE Continuation) gives you HOW to enter. A specific, repeatable sequence of events that must occur before you risk capital. (Lesson 3.12)', lesson: 'No model = no trade. Period.' },
          { pillar: 'Risk Management', icon: '&#128737;', color: '#ef4444', desc: 'Position sizing, stop placement, take profit levels, and maximum loss limits protect your capital. Without risk rules, one bad week wipes out months of gains. (Lessons 1.5, 1.6, 3.12)', lesson: 'Risk 1%. Stop below the model\u0027s invalidation level. Target 1:2 minimum R:R.' },
          { pillar: 'Psychology', icon: '&#129504;', color: '#a855f7', desc: 'Discipline rules protect you from yourself. Maximum trades per session, loss limits, revenge trading rules, and emotional checklists. The best strategy fails without a disciplined operator. (Lessons 2.12, 3.14)', lesson: 'Two losses = done for the day. No exceptions. Ever.' },
        ].map((item, i) => (
          <div key={i} className="mb-2">
            <button onClick={() => setExpandedPillar(expandedPillar === i ? null : i)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg" dangerouslySetInnerHTML={{ __html: item.icon }} />
                <span className="text-sm font-bold" style={{ color: item.color }}>{item.pillar}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedPillar === i ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {expandedPillar === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="p-5 mx-2 mb-2 rounded-xl bg-[#0a1020] border border-white/5 space-y-3">
                    <p className="text-gray-300 text-sm leading-relaxed">{item.desc}</p>
                    <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10"><p className="text-amber-400 text-xs font-bold mb-1">&#128161; Key Rule</p><p className="text-gray-400 text-sm">{item.lesson}</p></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </section>

      {/* S02 — STRATEGY BUILDER */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; Build Your Strategy</p>
          <h2 className="text-2xl font-extrabold mb-4">Interactive Strategy Builder</h2>
          <p className="text-sm text-gray-400 mb-6">Make your choices below. When all 7 steps are complete, your personal strategy document generates automatically.</p>
        </motion.div>
        <div className="space-y-4">
          {builderSteps.map((step, si) => (
            <div key={si} className="p-4 rounded-2xl glass-card">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${builderChoices[si] !== undefined ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-500'}`}>{builderChoices[si] !== undefined ? '\u2713' : si + 1}</div>
                <p className="text-sm font-bold text-white">{step.title}</p>
              </div>
              <div className="space-y-2">
                {step.opts.map((opt, oi) => (
                  <button key={oi} onClick={() => choose(si, oi)} className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${builderChoices[si] === oi ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' : 'glass text-gray-400 hover:bg-white/5'}`}>{opt}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
        {allBuilderDone && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 p-6 rounded-2xl border-2 border-amber-500/30 bg-amber-500/5">
            <p className="text-amber-400 font-bold text-sm mb-4 uppercase tracking-wider">&#128220; Your Personal SMC Strategy</p>
            <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
              <p><strong className="text-white">Direction:</strong> {builderSteps[0].opts[builderChoices[0] ?? 0]}</p>
              <p><strong className="text-white">Timing:</strong> {builderSteps[1].opts[builderChoices[1] ?? 0]}</p>
              <p><strong className="text-white">Entry Model:</strong> {builderSteps[2].opts[builderChoices[2] ?? 0]}</p>
              <p><strong className="text-white">Confirmation:</strong> {builderSteps[3].opts[builderChoices[3] ?? 0]}</p>
              <p><strong className="text-white">Risk:</strong> {builderSteps[4].opts[builderChoices[4] ?? 0]}</p>
              <p><strong className="text-white">Max Trades:</strong> {builderSteps[5].opts[builderChoices[5] ?? 0]}</p>
              <p><strong className="text-white">Psychology Rule:</strong> {builderSteps[6].opts[builderChoices[6] ?? 0]}</p>
            </div>
            <p className="mt-4 text-xs text-gray-500">Screenshot this and keep it next to your monitor. This is your trading constitution.</p>
          </motion.div>
        )}
      </section>

      {/* S03 — PRE-TRADE CHECKLIST */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; Pre-Trade Checklist</p>
          <h2 className="text-2xl font-extrabold mb-4">Run This Before Every Single Trade</h2>
        </motion.div>
        {[
          { check: 'HTF Bias confirmed?', detail: 'Daily/4H shows clear direction (BOS/CHoCH). Price in premium or discount zone. If unclear \u2014 no trade.', color: '#f59e0b' },
          { check: 'Kill Zone active?', detail: 'Am I in London KZ (07:00\u201310:00) or Overlap (13:00\u201316:00)? If not \u2014 no trade.', color: '#3b82f6' },
          { check: 'PO3 phase identified?', detail: 'Has accumulation formed? Has manipulation (sweep) occurred? Am I entering during distribution?', color: '#a855f7' },
          { check: 'Model confirmed?', detail: 'Model 1: Sweep + MSS + OB entry? Model 2: HTF OB in OTE + LTF BOS? If neither \u2014 no trade.', color: '#22c55e' },
          { check: 'Risk calculated?', detail: 'Stop loss defined by the model. Position size calculated for my risk %. R:R is 1:2 minimum.', color: '#ef4444' },
          { check: 'News checked?', detail: 'No high-impact events in the next 30 minutes. If yes \u2014 wait or protect.', color: '#ef4444' },
          { check: 'Emotional check?', detail: 'Am I calm? Or am I chasing, revenge trading, bored, or tilted? If not calm \u2014 no trade.', color: '#a855f7' },
          { check: 'Within daily limits?', detail: 'Have I already used my maximum trades for this session? If yes \u2014 no trade.', color: '#ef4444' },
        ].map((item, i) => (
          <div key={i} className="mb-2">
            <button onClick={() => setExpandedCheck(expandedCheck === i ? null : i)} className="w-full text-left p-3 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded border-2 mt-0.5" style={{ borderColor: item.color + '50' }} />
                <span className="text-sm font-semibold text-white">{item.check}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedCheck === i ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {expandedCheck === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="p-4 mx-2 mb-1 rounded-xl bg-[#0a1020] border border-white/5"><p className="text-gray-300 text-sm leading-relaxed">{item.detail}</p></div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </section>

      {/* S04 — EXPECTANCY */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Expectancy</p>
          <h2 className="text-2xl font-extrabold mb-4">The Maths That Proves Your Edge</h2>
          <div className="p-5 rounded-2xl glass-card mb-6">
            <p className="text-amber-400 font-bold text-sm mb-2">Expectancy = (Win% &times; Avg Win) &minus; (Loss% &times; Avg Loss)</p>
            <p className="text-gray-400 text-sm leading-relaxed mt-2">If expectancy is positive, your strategy makes money over time. If negative, it loses. It is that simple.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/5">
              <p className="text-green-400 font-bold text-sm mb-2">SMC Trader (Model 1)</p>
              <p className="text-xs text-gray-400">Win Rate: 45% | Avg Win: 3.5R | Avg Loss: 1R</p>
              <p className="text-xs text-gray-400 mt-1">(0.45 &times; 3.5) &minus; (0.55 &times; 1) = <strong className="text-green-400">+1.025R per trade</strong></p>
              <p className="text-xs text-gray-500 mt-1">100 trades &times; 1% risk = +102.5% growth</p>
            </div>
            <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
              <p className="text-red-400 font-bold text-sm mb-2">Retail Trader (No Strategy)</p>
              <p className="text-xs text-gray-400">Win Rate: 65% | Avg Win: 0.8R | Avg Loss: 1R</p>
              <p className="text-xs text-gray-400 mt-1">(0.65 &times; 0.8) &minus; (0.35 &times; 1) = <strong className="text-red-400">&minus;0.13R per trade</strong></p>
              <p className="text-xs text-gray-500 mt-1">100 trades &times; 1% risk = &minus;13% loss</p>
            </div>
          </div>
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
            <p className="text-sm text-gray-400 leading-relaxed">&#128161; <strong className="text-amber-400">The SMC trader wins LESS often but makes MORE money.</strong> That is the power of high R:R setups. Your OTE entries, your sweep reversals, your OB confluences &mdash; they all create trades where the reward massively outweighs the risk.</p>
          </div>
        </motion.div>
      </section>

      {/* S05 — JOURNAL TEMPLATE */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; SMC Journal</p>
          <h2 className="text-2xl font-extrabold mb-4">What to Record After Every Trade</h2>
        </motion.div>
        {[
          { field: 'Date &amp; Session', detail: 'Which day and which Kill Zone did you trade?', color: '#3b82f6' },
          { field: 'Pair &amp; Timeframe', detail: 'Which instrument and which execution timeframe?', color: '#3b82f6' },
          { field: 'HTF Bias', detail: 'What was the Daily/4H direction? Premium or discount?', color: '#f59e0b' },
          { field: 'Model Used', detail: 'Model 1 (sweep reversal) or Model 2 (OTE continuation)?', color: '#22c55e' },
          { field: 'Entry &amp; Exit Prices', detail: 'Exact entry, stop loss, and take profit levels.', color: '#a855f7' },
          { field: 'Confluence Score', detail: 'How many confluences? OB + OTE + FVG + Sweep + KZ = A+. OB only = B.', color: '#f59e0b' },
          { field: 'R:R &amp; Result', detail: 'What was the planned R:R? What was the actual result in R?', color: '#22c55e' },
          { field: 'Screenshot', detail: 'Chart screenshot with your markup visible. Essential for review.', color: '#3b82f6' },
          { field: 'Emotion Rating', detail: '1\u20135 scale. 1 = tilted/revenge. 5 = calm/focused.', color: '#ef4444' },
          { field: 'Lesson Learned', detail: 'One sentence. What will you do differently next time?', color: '#f59e0b' },
        ].map((item, i) => (
          <div key={i} className="mb-2">
            <button onClick={() => setExpandedJournal(expandedJournal === i ? null : i)} className="w-full text-left p-3 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between">
              <span className="text-sm font-semibold" style={{ color: item.color }} dangerouslySetInnerHTML={{ __html: item.field }} />
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedJournal === i ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {expandedJournal === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="p-4 mx-2 mb-1 rounded-xl bg-[#0a1020] border border-white/5"><p className="text-gray-300 text-sm">{item.detail}</p></div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </section>

      {/* S06 — WHEN NOT TO TRADE */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; When NOT to Trade</p>
          <h2 className="text-2xl font-extrabold mb-4">Your &quot;No Trade&quot; Rules</h2>
          <p className="text-sm text-gray-400 mb-6">Knowing when to sit out is as important as knowing when to enter. Write these into your strategy:</p>
          <div className="space-y-3">
            {[
              { rule: 'Outside Kill Zones (dead zone, late NY, Asian drift)', color: '#ef4444' },
              { rule: 'No clear HTF bias (choppy structure, equilibrium)', color: '#ef4444' },
              { rule: 'High-impact news within 30 minutes', color: '#ef4444' },
              { rule: 'Already hit daily trade limit', color: '#f59e0b' },
              { rule: 'Already hit daily loss limit (e.g. 2%)', color: '#f59e0b' },
              { rule: 'Emotionally compromised (angry, tired, revenge mindset)', color: '#a855f7' },
              { rule: 'Monday before 07:00 UTC (weekly accumulation still forming)', color: '#64748b' },
              { rule: 'Friday after 13:00 UTC (weekly profit-taking, unpredictable)', color: '#64748b' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl glass">
                <span className="text-red-400 font-bold text-sm">&#10060;</span>
                <p className="text-sm text-gray-400" style={{ color: item.color }}>{item.rule}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S07 — MISTAKES */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Strategy Killers</p>
          <h2 className="text-2xl font-extrabold mb-4">What Destroys Good Strategies</h2>
        </motion.div>
        {[
          { title: 'Changing the Strategy After Every Loss', wrong: 'Modifying rules after 3 losing trades because "it doesn\u0027t work."', right: 'Follow the strategy for 50 trades MINIMUM before making ANY changes. 3 losses is noise, not data.', tip: 'Would you judge a coin as unfair after 3 heads in a row? You need sample size.' },
          { title: 'Breaking Rules for "Just This One Trade"', wrong: 'Taking a third trade after the limit, or trading the dead zone because "the setup looks good."', right: 'Rules are rules. The ONE time you break them will be the trade that blows your account. Discipline is a muscle \u2014 train it.', tip: 'Every rule exists because of a lesson learned the hard way. Trust the process.' },
          { title: 'No Written Strategy', wrong: 'Trading from memory and feelings. "I know what I\u0027m doing."', right: 'Write it down. Print it. Tape it to your monitor. If it is not written, it is not a strategy \u2014 it is a vibe.', tip: 'Screenshot the Strategy Builder output from Section 02 and use it as your starting point.' },
          { title: 'Skipping the Journal', wrong: '"I\u0027ll remember what happened." (You won\u0027t.)', right: 'Journal EVERY trade. After 50 entries, you will see patterns that are invisible in real-time. The journal is your edge over your future self.', tip: 'Spend 5 minutes journaling after each session. That\u0027s 25 minutes per week to 10x your learning speed.' },
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

      {/* S08 — GAME */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Strategy Discipline</p>
          <h2 className="text-2xl font-extrabold mb-2">Would You Take This Trade?</h2>
          <p className="text-sm text-gray-400 mb-6">5 scenarios testing whether you follow your strategy under pressure.</p>
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
            <p className="text-sm text-gray-400">{gameScore === 5 ? '&#128220; Perfect discipline. You ARE the strategy.' : gameScore >= 3 ? 'Solid discipline. A few more reps and you\u0027re there.' : 'Review the five pillars and pre-trade checklist.'}</p>
          </motion.div>
        )}
      </section>

      {/* S09 — QUIZ */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Knowledge Check</p>
          <h2 className="text-2xl font-extrabold mb-6">SMC Strategy Quiz</h2>
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
        {quizDone && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 text-center p-8 glass-card rounded-2xl"><p className={`text-5xl font-extrabold mb-2 ${score >= 66 ? 'text-amber-400' : 'text-red-400'}`}>{score}%</p><p className="text-sm text-gray-400">{score === 100 ? '&#128220; Perfect. You have a complete, rules-based SMC strategy.' : score >= 66 ? 'Solid strategy knowledge. Write it down and execute.' : 'Review the five pillars and strategy builder.'}</p></motion.div>)}
      </section>

      {/* LEVEL 3 COMPLETE + Certificate */}
      <section className="px-5 py-16 text-center">
        {!certUnlocked ? (
          <div className="max-w-md mx-auto p-8 glass rounded-2xl"><p className="text-4xl mb-3 opacity-30">&#128274;</p><p className="text-sm text-gray-500">Score 66%+ to unlock your <strong className="text-amber-400">Level 3 Capstone Certificate</strong></p></div>
        ) : (
          <div>
            {/* Level 3 Complete Banner */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, type: 'spring' }} className="mb-10">
              <p className="text-5xl sm:text-6xl font-black mb-3"><span className="bg-gradient-to-r from-amber-400 via-red-400 to-green-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>LEVEL 3 COMPLETE!</span></p>
              <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">You&apos;ve mastered Smart Money Concepts. 15 lessons. Every tool an institution uses &mdash; now in your hands. Go build your edge.</p>
            </motion.div>
            {/* Capstone Certificate */}
            <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.3, type: 'spring' }}
              className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border-2 border-amber-500/30" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
              <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.08),transparent,rgba(34,197,94,0.06),transparent,rgba(239,68,68,0.04),transparent)] animate-spin" style={{ animationDuration: '10s' }} />
              <div className="absolute inset-[2px] rounded-3xl border border-amber-500/15" />
              <div className="relative z-10">
                <div className="w-[90px] h-[90px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 via-red-500 to-green-500 flex items-center justify-center text-5xl shadow-lg shadow-amber-500/30">&#127942;</div>
                <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest mb-2">Level 3 Capstone Certificate</p>
                <h3 className="text-xl font-extrabold mb-1">Certificate of Mastery</h3>
                <p className="text-sm text-gray-400 mb-5 leading-relaxed">Has mastered<br /><strong className="text-white">Level 3: Smart Money Concepts</strong><br />15 lessons at ATLAS Academy by Interakktive</p>
                <p className="bg-gradient-to-r from-amber-400 via-red-400 to-green-400 bg-clip-text text-transparent font-bold text-lg mb-1" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Strategy Architect &mdash;</p>
                <p className="font-mono text-[11px] text-gray-500 mb-4">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">L3-CAPSTONE-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
              </div>
            </motion.div>
          </div>
        )}
      </section>

      {/* Coming Soon */}
      <section className="text-center px-5 pt-10 pb-24">
        <p className="text-xs tracking-widest uppercase text-gray-600 mb-4">Coming Soon</p>
        <h2 className="text-xl font-bold mb-3">Level 4 &mdash; Trading Psychology</h2>
        <p className="text-sm text-gray-500 mb-6">Master the mental game. Discipline, emotions, and the habits that separate profitable traders from everyone else.</p>
        <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">
          Back to Academy <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
