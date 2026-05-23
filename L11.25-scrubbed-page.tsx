// app/academy/lesson/cipher-trading-discipline/page.tsx
// ATLAS Academy — Lesson 11.25: Cipher Trading Discipline [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 11 · CIPHER
// Discipline Is a Boolean — Yours or the Engine's
// Covers: The shared boolean equation (engine_correct AND operator_discipline),
//         the 8/3/5 skip pile, the discipline pyramid (Process → Plan → Execution → Review),
//         Encoded discipline (the conviction threshold, TS cooldown, preset philosophies),
//         pre-session / mid-session / post-session protocols, override doctrine,
//         operator personality types, failure cascade, asset-class differences,
//         the 30-day discipline test, and the 30-session process loop
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Crown } from 'lucide-react';

// ============================================================
// GAME ROUNDS — 5 Discipline Failure Cascade Simulator scenarios
// String-id answers, per-option explanations (teaches on wrong answers)
// Covers: override doctrine, revenge re-entry, skip discipline,
//         journaling protocol, size discipline
// ============================================================
const gameRounds = [
  {
    id: 'r1',
    scenario:
      'You are on EURUSD 15m, Sniper preset (threshold 3-of-4). A PX LONG fires but reads 2/4 conviction — Ribbon stack ✓, ADX ✓, Volume ✗, Momentum ✗. The signal label prints because you have "Strong Signals Only" off in inputs even though preset is Sniper. Chart looks promising — you feel the trade.',
    prompt: 'What does discipline say to do?',
    options: [
      {
        id: 'a',
        text: 'Take it — the chart looks good and 2/4 is close to 3/4.',
        correct: false,
        explain:
          'This is the override doctrine failure. The Sniper preset enforces a 3-of-4 conviction threshold; the signal printed because of an inputs-level override you toggled (Strong Signals Only off). Taking the trade means trusting your gut over your own selected discipline configuration. "2/4 is close to 3/4" is not a discipline argument — it is a rationalisation. The Sniper philosophy is "few trades, only the best." Either you are running it or you are not.',
      },
      {
        id: 'b',
        text: 'Skip — you selected the Sniper philosophy. 2/4 is not 3/4.',
        correct: true,
        explain:
          'Correct. Discipline is mechanical, not interpretive. You set the bar (threshold 3-of-4 via the Sniper preset). The engine printed a signal that did not meet that bar because your Strong Signals Only toggle was off. Reading the conviction count is your job. Skipping is not "missing a trade" — it is honouring the discipline configuration you chose. Re-enabling Strong Signals Only would make the engine enforce it for you on the next bar.',
      },
      {
        id: 'c',
        text: 'Take it at half size — that is a reasonable compromise.',
        correct: false,
        explain:
          'No. Half-size on a sub-threshold trade is still a discretionary trade. Sizing is the only legitimate operator variable, but only WITHIN qualified setups. Sizing your way past a discipline gate converts a deterministic system into a discretionary one. This is the override doctrine in disguise — softer, but the same failure mode.',
      },
      {
        id: 'd',
        text: 'Change preset to Trend Trader to take this signal — Trend Trader allows 0+.',
        correct: false,
        explain:
          'Mid-trade preset switching to legitimise a trade is mode-hopping for confirmation. This is the worst category of discipline failure because it disguises itself as flexibility. Lesson 11.23 says: 20-session commitment per preset, switching mid-session is NOT OK when hunting or confirming. Trade the philosophy you opened the session with.',
      },
    ],
  },
  {
    id: 'r2',
    scenario:
      'You took a PX LONG on XAUUSD 5m. It hit your stop within 4 bars — clean loss, -1R. You did everything right. Two bars after stop-out, another PX LONG fires at the same Pulse line. The setup looks identical. You can feel your finger hovering over the buy button.',
    prompt: 'What is the discipline read?',
    options: [
      {
        id: 'a',
        text: 'Take it — the previous loss is independent of this signal. Each trade stands alone.',
        correct: false,
        explain:
          'Statistically defensible, behaviourally a trap. "Each trade stands alone" is true mathematically and false psychologically. Re-entering the same direction within 4 bars of stop-out at the same level is the classic revenge re-entry pattern. CIPHER itself encodes anti-spam logic for exactly this reason — the TS cooldown — because clustered same-level same-direction signals carry low expected value. The system has a built-in cooldown; you should too.',
      },
      {
        id: 'b',
        text: 'Skip and apply a 30-minute personal cooldown. Same-level same-direction re-entry within 4 bars is the revenge pattern.',
        correct: true,
        explain:
          'Correct. The TS cooldown is direction-specific: the engine tracks the most recent TS LONG fire and blocks any further TS LONG until the cooldown window elapses. CIPHER will not refire the same TS direction within 8-12 bars depending on TF. Your personal discipline mirrors this. Same-level same-direction within bars of a stop-out is the highest-base-rate losing pattern in the dataset. The fact that the setup "looks identical" is the warning, not the case for taking it.',
      },
      {
        id: 'c',
        text: 'Take it at 2x size to recover the loss.',
        correct: false,
        explain:
          'Size creep — the second stage of the discipline failure cascade (Section 13). Recovering a loss by sizing up doubles the position and the consequence of being wrong. The base rate on revenge re-entries is already negative; doubling size on a negative-expectancy trade is a direct route to a discipline-failure blow-up. This is mistake category 6 from the mistake cards.',
      },
      {
        id: 'd',
        text: 'Switch to the opposite direction — clearly the bullish thesis is wrong.',
        correct: false,
        explain:
          'A single stop-out is noise, not evidence the thesis is wrong. Switching direction after one loss is FOMO in disguise — you are inventing a new thesis to justify another trade. The discipline answer is silence: no new trade, no new thesis, observe what happens at this level for the next 8-12 bars before considering re-engagement.',
      },
    ],
  },
  {
    id: 'r3',
    scenario:
      'End of session. You took 4 trades — 2 winners, 1 loser, 1 break-even. Net +0.8R. You also skipped 3 signals: one because conviction was 2/4, one because of news inside ±30min, one because regime was VOLATILE. Your journal protocol says "log every trade taken AND every skipped signal."',
    prompt: 'Which skipped signal MUST you log?',
    options: [
      {
        id: 'a',
        text: 'None — skipped trades are not real trades. Only log what was actually taken.',
        correct: false,
        explain:
          'This is the most common journaling discipline failure. Skipped signals are how you verify your skip discipline is working over the 30-session cycle. Without logged skips, you cannot tell whether your skip criteria are too tight (winning skips you should have taken), too loose (skipped signals that would have won), or correctly calibrated. The journal protocol from L11.24 explicitly requires logging skipped trades AT EQUAL PRIORITY to taken trades.',
      },
      {
        id: 'b',
        text: 'Only the 2/4 conviction skip — that is the discretionary one. The other two were rule-based.',
        correct: false,
        explain:
          'All skips are rule-based in a disciplined operator workflow. The 2/4 skip is a conviction-threshold rule. The news skip is a hard-skip-criterion rule. The VOLATILE regime skip is a regime-fit rule from Lesson 11.13. None of them are discretionary. The reason to log all three is to build the dataset that lets you audit which rules are pulling weight and which might be too restrictive in retrospect.',
      },
      {
        id: 'c',
        text: 'All three — and label each with the rule that triggered the skip.',
        correct: true,
        explain:
          'Correct. The journal entry for a skipped signal is shorter than for a taken trade — but it has the same fields: setup, signal type, conviction, the rule that fired the skip, what happened next on the chart. Over 30 sessions this dataset tells you whether your skip discipline is positive-EV. If 80% of your news skips would have lost, the rule is working. If 80% would have won, the rule needs revisiting. Without the log you are flying blind on skip quality.',
      },
      {
        id: 'd',
        text: 'Only the ones that would have lost — winning skips are validation enough.',
        correct: false,
        explain:
          'Survivorship bias. If you only log the skips that confirm your discipline, your journal becomes a self-congratulation log. The journal must capture both winners-you-skipped and losers-you-skipped, because the loser-skips are where your discipline is paying rent and the winner-skips are where you need to ask whether the rule is too tight.',
      },
    ],
  },
  {
    id: 'r4',
    scenario:
      'You are mid-session on BTCUSD 1H. The Header reads BULL TREND, Regime reads TREND 65%, you have one PX LONG in profit at +1.2R. A second PX LONG fires on the same chart — a continuation signal, same direction, 4/4 conviction. Your max position policy is 1 active position per asset.',
    prompt: 'What does discipline say about the second signal?',
    options: [
      {
        id: 'a',
        text: 'Add the second signal — both are 4/4 strong. Stack the position.',
        correct: false,
        explain:
          'Position size creep dressed up as a "stack". Your stated max-position policy is 1 per asset. Adding a second position because both signals are strong violates the policy you set in your pre-session checklist. The 4/4 conviction on the second signal is not a permission slip to bypass your own position-discipline rule. If you want 2 per asset, change the policy between sessions — not mid-trade.',
      },
      {
        id: 'b',
        text: 'Skip the second signal — your max-position policy is 1 per asset.',
        correct: true,
        explain:
          'Correct. Position discipline is set before the session and held during. The second 4/4 signal is real and the engine is reading correctly — but discipline at this layer is the operator filter. The first position is doing the work; adding a second changes your risk profile without consent from your pre-session self. If the first stops out at break-even (TP1 already moved it there), you can consider the second signal as a fresh entry — but only after the first closes.',
      },
      {
        id: 'c',
        text: 'Close the first position and take the second — fresher signal, more upside.',
        correct: false,
        explain:
          'Swapping a profit-running trade for a fresh signal is a discipline failure dressed as optimisation. You are taking a guaranteed +1.2R (assuming TP1 moved stop to break-even, you are locked in positive) and replacing it with a fresh trade at full risk. The math fails. The first trade is doing what it was supposed to do. Let it run, scale per the Risk Map ladder.',
      },
      {
        id: 'd',
        text: 'Add the second signal at half size — that respects the position-policy spirit.',
        correct: false,
        explain:
          'Same failure as 4a wearing camouflage. Half-size still violates the 1-per-asset rule. Position policy is a count, not a sum of fractional sizes. Spirit of the rule is "do not stack same-asset exposure in one session" and half-size still does that. Either you have one position or you have two — the engine cannot read your half-size as "still one".',
      },
    ],
  },
  {
    id: 'r5',
    scenario:
      'You have had a rough week — 8 trades, 2 winners, 6 losers, -4.2R. You wake up Monday. Your written discipline plan says "after any -3R drawdown week, mandatory 1 day off and reduced size on return." It is Monday morning. CIPHER is showing two clean 3/4 PX setups at the open.',
    prompt: 'What does discipline say?',
    options: [
      {
        id: 'a',
        text: 'Trade them — the setups are clean and the new week resets the math.',
        correct: false,
        explain:
          'The "new week resets" framing is one of the most expensive lies in trading. Your discipline plan was written by your past self who knew you would face this exact temptation. The plan specifies "after any -3R drawdown week" — and the math is -4.2R, well past the trigger. Taking the trades because they look clean ignores the rule you wrote precisely for this scenario. Past-you was disciplined; current-you is rationalising.',
      },
      {
        id: 'b',
        text: 'Skip today — mandatory day off per your own written plan. Return tomorrow at reduced size.',
        correct: true,
        explain:
          'Correct. The drawdown circuit breaker is the most-violated discipline rule in trading. Past-you put it in writing knowing this exact morning would come — clean setups, full conviction, the urge to "recover quickly." Honouring the rule today is what makes you the operator your past self trusted. Skip today, return tomorrow at reduced size per the plan, take the next week to rebuild process metrics. Discipline at this layer is what separates a -4.2R drawdown from a -10R blow-up.',
      },
      {
        id: 'c',
        text: 'Take one — splitting the difference between the rule and the opportunity.',
        correct: false,
        explain:
          'There is no "splitting the difference" with a circuit breaker. The rule is binary: triggered or not triggered. Taking one trade is the camel\'s-nose pattern — once you have justified the first violation, the second is easier. The rule\'s value is precisely that it is non-negotiable. Bending it once converts it into a guideline, and guidelines do not survive emotional pressure.',
      },
      {
        id: 'd',
        text: 'Trade them at half size — that respects the "reduced size" spirit.',
        correct: false,
        explain:
          'The plan says "mandatory 1 day off AND reduced size on return." Both clauses. Half-size today violates the day-off clause. Discipline rules read as written, not as spirited. Tomorrow at half size honours both clauses. Today at half size violates the first while pretending to honour the second.',
      },
    ],
  },
];

// ============================================================
// QUIZ — 13 questions (capstone floor: 13 correct: true)
// Covers: GC, the equation, the conviction threshold, TS cooldown, presets,
//         pyramid, pre-session, mid-session, journaling, 30-session loop,
//         override doctrine, personality types, failure cascade
// ============================================================
const quizQuestions = [
  {
    id: 'q1',
    question:
      'The Groundbreaking Concept for this lesson states that every signal you trade is the output of which equation?',
    options: [
      { id: 'a', text: 'engine correctness OR operator discipline', correct: false },
      { id: 'b', text: 'engine correctness AND operator discipline', correct: true },
      { id: 'c', text: 'engine correctness XOR operator discipline', correct: false },
      { id: 'd', text: 'engine correctness NAND operator discipline', correct: false },
    ],
    explain:
      'AND is the operator. Both must be true. The engine fires correctly OR not at all — the operator either honours the configuration OR they do not. There is no scenario where bad engine output and good discipline produce a good trade; equally, no scenario where good engine output and broken discipline produces a sustained edge. Both gates must pass.',
  },
  {
    id: 'q2',
    question: 'CIPHER\'s conviction threshold is determined by two configuration paths. Which statement correctly describes how the threshold is set?',
    options: [
      { id: 'a', text: 'Strong Signals Only toggle is the only way to set the threshold; presets do not affect it.', correct: false },
      {
        id: 'b',
        text: 'When a preset is active, Swing Trader and Sniper alone enforce a 3-of-4 threshold; all other presets leave it at zero. When no preset is active (None), the Strong Signals Only toggle decides.',
        correct: true,
      },
      { id: 'c', text: 'Every preset enforces a 4-of-4 threshold; Strong Signals Only adds a fifth required factor.', correct: false },
      { id: 'd', text: 'The threshold equals the average conviction score over the previous 20 signals.', correct: false },
    ],
    explain:
      'Two paths configure the conviction threshold. Preset path: Swing Trader and Sniper alone force the threshold to 3-of-4, all other presets leave it at zero. Manual path: when no preset is active, the Strong Signals Only toggle decides (ON = threshold 3, OFF = threshold 0). Both paths lead to the same gate. This single mechanism encodes the entire conviction-discipline architecture in the engine.',
  },
  {
    id: 'q3',
    question:
      'CIPHER\'s TS engine includes an explicit cooldown that prevents the same direction from re-firing within a bar window. What does this anti-spam mechanism teach the operator?',
    options: [
      {
        id: 'a',
        text: 'Always wait at least 8 bars between any two trades.',
        correct: false,
      },
      {
        id: 'b',
        text: 'Same-direction same-level re-entry within the cooldown window has structurally lower expected value, and the operator should mirror that constraint behaviourally.',
        correct: true,
      },
      {
        id: 'c',
        text: 'TS signals are unreliable and should always be skipped after the first one.',
        correct: false,
      },
      {
        id: 'd',
        text: 'PX signals also have a cooldown of identical length.',
        correct: false,
      },
    ],
    explain:
      'The TS cooldown is direction-specific and asset/TF-routed (8 bars on retail TFs, 12 on intraday). It was encoded because the empirical base rate on clustered same-direction TS signals is low. The operator mirror is a 30-minute personal cooldown after a stop-out at the same level in the same direction.',
  },
  {
    id: 'q4',
    question: 'What does the Sniper preset configure compared to defaults?',
    options: [
      {
        id: 'a',
        text: 'Threshold zero, default engine width — same as defaults but with different visuals.',
        correct: false,
      },
      {
        id: 'b',
        text: 'Threshold 3-of-4, widest signal-engine width — few trades, only the best, widest waiting window.',
        correct: true,
      },
      {
        id: 'c',
        text: 'Threshold 4-of-4, tight signal-engine width — all conviction factors required, tight engine.',
        correct: false,
      },
      {
        id: 'd',
        text: 'Threshold 2-of-4, very wide signal-engine width — medium threshold, very wide engine.',
        correct: false,
      },
    ],
    explain:
      'Sniper raises the conviction bar to 3-of-4 and widens the signal engine to the widest setting of any preset. The philosophy is encoded in those two configuration choices. Each preset is a discipline philosophy bundled into a single selection.',
  },
  {
    id: 'q5',
    question: 'What are the four layers of the Discipline Pyramid, in order from bottom to top?',
    options: [
      { id: 'a', text: 'Plan → Process → Execution → Review', correct: false },
      { id: 'b', text: 'Process → Plan → Execution → Review', correct: true },
      { id: 'c', text: 'Execution → Plan → Process → Review', correct: false },
      { id: 'd', text: 'Review → Execution → Plan → Process', correct: false },
    ],
    explain:
      'Process is the foundation (how you study, prepare, journal). Plan sits on Process (the specific plan for the next session). Execution is the live work. Review is the post-session reckoning. Each layer fails differently and each must be in place for the layer above to compound.',
  },
  {
    id: 'q6',
    question:
      'Of every 8 signals CIPHER fires, how many do the strongest operators trade vs skip, according to the L11.13 framework restated here?',
    options: [
      { id: 'a', text: '7 trade / 1 skip', correct: false },
      { id: 'b', text: '5 trade / 3 skip', correct: false },
      { id: 'c', text: '3 trade / 5 skip', correct: true },
      { id: 'd', text: '8 trade / 0 skip — every signal is a trade', correct: false },
    ],
    explain:
      'The 8/3/5 ratio. The engine fires correctly; the operator filter decides which 3 become trades. The 5 skipped signals are not "missed trades" — they are the price of discipline. Operators who try to trade all 8 do not last; operators who trade fewer than 3 are over-filtering.',
  },
  {
    id: 'q7',
    question: 'What is the Override Doctrine?',
    options: [
      {
        id: 'a',
        text: 'Always override the engine if the chart looks clear — your judgment is the final check.',
        correct: false,
      },
      {
        id: 'b',
        text: 'Per-trade level overrides convert a deterministic system into a discretionary one. Sizing is the only legitimate operator variable; parameter tuning via inputs is legitimate; per-trade adjustments are not.',
        correct: true,
      },
      {
        id: 'c',
        text: 'Override is allowed once per week to maintain trader autonomy.',
        correct: false,
      },
      {
        id: 'd',
        text: 'Override is allowed when conviction is 3.5/4 — close enough to the threshold.',
        correct: false,
      },
    ],
    explain:
      'The doctrine is precise: parameter changes via inputs (which preset, which signal type, which conviction threshold) are legitimate operator variables. Per-trade adjustments (moving a SL, raising a TP, taking a signal that did not pass the threshold) are overrides. The engine architecture exists precisely so that operator decisions happen at the configuration layer, not the trade layer.',
  },
  {
    id: 'q8',
    question:
      'Single-trade outcomes are noise; 30-session process metrics are signal. What is the implication for the journal?',
    options: [
      {
        id: 'a',
        text: 'Only journal once a month — daily journals are overkill.',
        correct: false,
      },
      {
        id: 'b',
        text: 'Journal every session, but extract pattern P&L attribution and protocol adherence only at the 30-session mark — not after individual trades.',
        correct: true,
      },
      {
        id: 'c',
        text: 'Stop journaling losing trades — they bias the dataset.',
        correct: false,
      },
      {
        id: 'd',
        text: 'Only journal taken trades — skipped trades are non-events.',
        correct: false,
      },
    ],
    explain:
      'Daily journal entries are the data points; the analysis happens at the 30-session mark. Individual losers and winners are unreliable signal because variance dominates samples below n=30. At n=30+ you can extract pattern-level P&L (which setups paid, which did not) and protocol adherence (which rules you broke and the cost). Both feed the next 30-session cycle.',
  },
  {
    id: 'q9',
    question:
      'Which of these is NOT a legitimate "skipped signal" log entry per the journaling protocol?',
    options: [
      { id: 'a', text: '"PX LONG fired, 2/4 conviction, threshold was 3 — skipped per rule."', correct: false },
      { id: 'b', text: '"TS SHORT fired, NFP in 20 minutes — hard skip per news rule."', correct: false },
      { id: 'c', text: '"PX LONG fired, VOLATILE regime — skipped per regime-fit rule."', correct: false },
      {
        id: 'd',
        text: '"PX LONG fired, conviction 4/4, regime TREND, no news — felt off, skipped."',
        correct: true,
      },
    ],
    explain:
      'A 4/4 signal in a trending regime with no news is not a skip — it is a trade. "Felt off" is not a discipline criterion; it is a discretionary override of the engine\'s output. If you find yourself logging "felt off" skips repeatedly on qualified signals, that is a symptom that your discipline framework is being undermined by gut intervention.',
  },
  {
    id: 'q10',
    question: 'Which operator personality type is most prone to size creep?',
    options: [
      { id: 'a', text: 'The Bagholder — refuses to close losing trades.', correct: false },
      {
        id: 'b',
        text: 'The Hero Override — confident enough in their read to override the engine, often after a streak of wins.',
        correct: true,
      },
      { id: 'c', text: 'The System Switcher — jumps between strategies every few weeks.', correct: false },
      { id: 'd', text: 'The FOMO Chaser — enters late on signals that already moved.', correct: false },
    ],
    explain:
      'Size creep typically follows winning streaks. The Hero Override personality is the one most likely to interpret recent wins as proof their judgment exceeds the engine\'s — and the most natural expression of that confidence is increasing position size beyond the framework\'s sizing protocol. The cure is mechanical sizing rules that do not flex with confidence.',
  },
  {
    id: 'q11',
    question: 'What is the 5-stage Discipline Failure Cascade?',
    options: [
      { id: 'a', text: 'Doubt → Hesitation → Skip → Regret → Override', correct: false },
      { id: 'b', text: 'Override → Size Creep → Drawdown → Revenge → Blow-up', correct: true },
      { id: 'c', text: 'Loss → Anger → Revenge → Loss → Quit', correct: false },
      { id: 'd', text: 'Win → Greed → Size Up → Loss → Size Up Again', correct: false },
    ],
    explain:
      'Override starts it — taking a sub-threshold signal because "this one is different." Size Creep follows because the override worked once. Drawdown lands when the size-creeped trades inevitably hit a losing patch. Revenge tries to recover the drawdown by sizing up further. Blow-up is the mechanical endpoint. The chain is observable in 80%+ of trader account-failure post-mortems.',
  },
  {
    id: 'q12',
    question: 'What is the 30-Day Discipline Test designed to prove?',
    options: [
      { id: 'a', text: 'That you can make profit in 30 days.', correct: false },
      { id: 'b', text: 'That you can pick the right preset.', correct: false },
      {
        id: 'c',
        text: 'That you can execute the framework mechanically with zero overrides for 30 sessions, regardless of outcome — and journal both taken and skipped trades.',
        correct: true,
      },
      { id: 'd', text: 'That you can recover from a -3R drawdown.', correct: false },
    ],
    explain:
      'The test is about execution, not outcome. Profit during the 30 days is not the criterion — adherence is. The output is a 30-session journal with protocol-adherence metrics. If you executed mechanically for 30 sessions, you have proven you can operate the framework. The P&L will follow on a longer time horizon. The test exists because most operators have never gone 30 sessions without at least one override.',
  },
  {
    id: 'q13',
    question:
      'A "skip" log entry has the same priority as a "taken trade" log entry. Why?',
    options: [
      { id: 'a', text: 'Both feel emotionally equivalent and should be treated as such.', correct: false },
      {
        id: 'b',
        text: 'Without logged skips, you cannot audit whether your skip discipline is positive-EV across 30+ sessions — winning skips and losing skips both feed pattern recognition.',
        correct: true,
      },
      { id: 'c', text: 'Skipped trades take less time to journal, so they should be prioritised.', correct: false },
      { id: 'd', text: 'Tax purposes — every signal must be recorded.', correct: false },
    ],
    explain:
      'The journal is a discipline-audit dataset. Skip entries answer the question "is my skip rule paying rent?" If you only log taken trades, you can audit execution discipline but not skip discipline. Over 30 sessions, the skip log reveals which rules are productively filtering losers and which are over-filtering legitimate setups. Without the skip log this question is unanswerable.',
  },
];

// ============================================================
// ANIMSCENE — shared canvas wrapper (gold-standard pattern from L11.11)
// ============================================================
function AnimScene({
  draw,
  aspectRatio = 16 / 9,
  className = '',
}: {
  draw: (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => void;
  aspectRatio?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const resize = () => {
      const w = Math.min(parent.clientWidth, 720);
      const h = w / aspectRatio;
      canvas.width = w * window.devicePixelRatio;
      canvas.height = h * window.devicePixelRatio;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [aspectRatio]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    obs.observe(canvas);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      startRef.current = null;
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const loop = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const t = (now - startRef.current) / 1000;
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;
      ctx.clearRect(0, 0, w, h);
      draw(ctx, t, w, h);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [visible, draw]);

  return (
    <div className={`w-full rounded-2xl overflow-hidden border border-white/5 bg-black/30 ${className}`}>
      <canvas ref={canvasRef} className="block mx-auto" />
    </div>
  );
}

// ============================================================
// CONFETTI — for certificate reveal (gold-standard from L11.11)
// ============================================================
function Confetti({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    type P = { x: number; y: number; vx: number; vy: number; c: string; s: number; r: number; vr: number };
    const colors = ['#26A69A', '#FFB300', '#EF5350', '#FFFFFF', '#FBBF24'];
    const particles: P[] = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: -20,
      vx: (Math.random() - 0.5) * 6,
      vy: Math.random() * 3 + 2,
      c: colors[Math.floor(Math.random() * colors.length)],
      s: Math.random() * 6 + 4,
      r: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.2,
    }));
    let rafId = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12;
        p.r += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s);
        ctx.restore();
      });
      rafId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafId);
  }, [active]);
  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[100]"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
}

// ============================================================
// ANIMATION 1 — BooleanEquationAnim (S00 Groundbreaking Concept)
// The boolean equation morphing from particles into letters,
// then the AND gate firing with both inputs satisfied
//
// 12-second loop:
//  - 0-3s: particles drift in from edges
//  - 3-5s: particles coalesce into the equation text
//  - 5-7s: equation holds, AND gate hovers below
//  - 7-9s: ENGINE input lights teal, OPERATOR input lights teal
//  - 9-10s: AND gate fires, signal=TRUE emits as teal pulse
//  - 10-12s: hold, then loop
// ============================================================
function BooleanEquationAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.18)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    // Title
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE EQUATION — SIGNAL = ENGINE ∧ DISCIPLINE', w / 2, 22);

    const cycleDur = 12;
    const ct = t % cycleDur;

    // ── Phase timings ──
    const p1End = 3; // particles drifting
    const p2End = 5; // coalesce
    const p3End = 7; // hold
    const p4End = 9; // inputs light up
    const p5End = 10; // gate fires
    // p6 = hold (10..12)

    // Equation layout
    const eqY = h * 0.42;
    const eqLeft = w * 0.50 - 100;
    const eqAndX = w * 0.50;
    const eqRight = w * 0.50 + 100;

    // ── Phase 1+2: particles ──
    // 24 particles drift toward equation positions, coalesce
    const particleCount = 24;
    for (let i = 0; i < particleCount; i++) {
      const seed = i / particleCount;
      const angle = seed * Math.PI * 2;
      const startX = w / 2 + Math.cos(angle) * (w * 0.45);
      const startY = h / 2 + Math.sin(angle) * (h * 0.45);
      // Target: distribute around the equation text positions
      const targetGroup = i % 3; // 0=ENGINE, 1=AND, 2=DISCIPLINE
      const targetX = targetGroup === 0 ? eqLeft : targetGroup === 1 ? eqAndX : eqRight;
      const targetY = eqY;

      let particleAlpha = 1;
      let px = startX;
      let py = startY;

      if (ct < p1End) {
        // Drift
        const dt = ct / p1End;
        px = startX + (targetX - startX) * dt * 0.3;
        py = startY + (targetY - startY) * dt * 0.3;
        particleAlpha = 0.6;
      } else if (ct < p2End) {
        // Coalesce
        const dt = (ct - p1End) / (p2End - p1End);
        const easeT = 0.3 + 0.7 * (1 - Math.pow(1 - dt, 3)); // ease-out cubic
        px = startX + (targetX - startX) * easeT;
        py = startY + (targetY - startY) * easeT;
        particleAlpha = 0.6 * (1 - dt) + 0.3 * dt;
      } else {
        // Hide particles once equation appears
        particleAlpha = Math.max(0, 0.3 - (ct - p2End) * 0.5);
      }

      if (particleAlpha > 0.01) {
        ctx.fillStyle = `rgba(255,179,0,${particleAlpha})`;
        ctx.beginPath();
        ctx.arc(px, py, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // ── Phase 2+: equation text appears ──
    if (ct >= p1End * 0.7) {
      const textFade = Math.min(1, Math.max(0, (ct - p1End * 0.7) / (p2End - p1End * 0.7)));

      // ENGINE input
      const engineLit = ct >= p4End - 0.5;
      const engineColor = engineLit ? TEAL : DIM;
      ctx.fillStyle = engineLit
        ? `rgba(38,166,154,${textFade})`
        : `rgba(255,255,255,${0.5 * textFade})`;
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ENGINE', eqLeft, eqY);
      ctx.font = '9px Inter, sans-serif';
      ctx.fillStyle = engineLit
        ? `rgba(38,166,154,${textFade * 0.8})`
        : `rgba(255,255,255,${0.4 * textFade})`;
      ctx.fillText(engineLit ? '= TRUE' : '= ?', eqLeft, eqY + 16);

      // AND gate symbol
      ctx.fillStyle = `rgba(255,179,0,${textFade})`;
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.fillText('∧', eqAndX, eqY + 4);
      ctx.font = '8px Inter, sans-serif';
      ctx.fillStyle = `rgba(255,179,0,${textFade * 0.7})`;
      ctx.fillText('AND', eqAndX, eqY + 20);

      // DISCIPLINE input
      const disciplineLit = ct >= p4End;
      ctx.fillStyle = disciplineLit
        ? `rgba(38,166,154,${textFade})`
        : `rgba(255,255,255,${0.5 * textFade})`;
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillText('DISCIPLINE', eqRight, eqY);
      ctx.font = '9px Inter, sans-serif';
      ctx.fillStyle = disciplineLit
        ? `rgba(38,166,154,${textFade * 0.8})`
        : `rgba(255,255,255,${0.4 * textFade})`;
      ctx.fillText(disciplineLit ? '= TRUE' : '= ?', eqRight, eqY + 16);

      // Equal sign and SIGNAL output below
      const fired = ct >= p5End - 0.3;
      const firedFade = fired ? Math.min(1, (ct - (p5End - 0.3)) * 3) : 0;

      ctx.fillStyle = `rgba(255,255,255,${textFade * 0.4})`;
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText('═══════════════', w / 2, eqY + 44);

      ctx.fillStyle = fired ? `rgba(38,166,154,${firedFade})` : `rgba(255,255,255,${0.3 * textFade})`;
      ctx.font = 'bold 18px Inter, sans-serif';
      ctx.fillText('SIGNAL', w / 2, eqY + 68);
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillStyle = fired ? `rgba(38,166,154,${firedFade})` : `rgba(255,255,255,${0.35 * textFade})`;
      ctx.fillText(fired ? '= TRADE THE FIRE' : '= waiting...', w / 2, eqY + 86);
    }

    // ── Connecting wires (from inputs to gate) ──
    if (ct >= p3End) {
      const wireOpac = Math.min(1, (ct - p3End) / 0.5);
      ctx.strokeStyle = `rgba(255,179,0,${wireOpac * 0.5})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(eqLeft + 26, eqY + 22);
      ctx.lineTo(eqAndX - 10, eqY + 32);
      ctx.moveTo(eqRight - 30, eqY + 22);
      ctx.lineTo(eqAndX + 10, eqY + 32);
      ctx.moveTo(eqAndX, eqY + 28);
      ctx.lineTo(eqAndX, eqY + 56);
      ctx.stroke();
    }

    // ── Pulse emission on fire ──
    if (ct >= p5End - 0.2 && ct < p5End + 1.2) {
      const pulseT = ct - (p5End - 0.2);
      const r = pulseT * 80;
      ctx.strokeStyle = `rgba(38,166,154,${Math.max(0, 1 - pulseT * 0.8)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(w / 2, eqY + 68, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // ── Footer caption ──
    ctx.fillStyle = FAINT;
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Both gates must pass. Engine alone is not enough. Discipline alone is not enough.', w / 2, h - 18);
  }, []);

  return <AnimScene draw={draw} />;
}

// ============================================================
// ANIMATION 2 — PineGateFireAnim (S01 The Equation)
// Shows your active configuration on top, then below it animates a
// Pulse flip → conviction counter ticks 0→1→2→3 → the gate evaluates
// → signal label emits (or doesn't, depending on threshold)
// 10-second loop, two scenarios: pass (3/4 with threshold=3) and fail
// (2/4 with threshold=3)
// ============================================================
function PineGateFireAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.18)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    // Title
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE CONVICTION GATE — HOW SIGNALS ARE FILTERED', w / 2, 22);

    const cycleDur = 10;
    const ct = t % cycleDur;
    // Two scenarios: 0-5s = passes (3/4), 5-10s = fails (2/4)
    const scenarioPasses = ct < 5;
    const sct = scenarioPasses ? ct : ct - 5; // scenario-local time (0..5)

    // ── Configuration block at top ──
    const codeY = 50;
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fillRect(w * 0.08, codeY - 14, w * 0.84, 36);
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    ctx.strokeRect(w * 0.08, codeY - 14, w * 0.84, 36);

    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = DIM;
    ctx.fillText('YOUR CONFIG', w * 0.1, codeY - 2);
    ctx.fillStyle = AMBER;
    ctx.fillText('Threshold:', w * 0.1, codeY + 12);
    ctx.fillStyle = WHITE;
    ctx.fillText('3-of-4 required', w * 0.1 + 70, codeY + 12);
    ctx.fillStyle = AMBER;
    ctx.fillText('(Sniper preset active)', w * 0.1 + 175, codeY + 12);

    // ── Conviction factors row ──
    const factorsY = h * 0.42;
    const factorNames = ['Ribbon', 'ADX>20', 'Vol>1×', 'Mom>50%'];
    // Pass scenario: 3 of 4 light up. Fail: 2 of 4
    const passPattern = [true, true, true, false];
    const failPattern = [true, true, false, false];
    const pattern = scenarioPasses ? passPattern : failPattern;

    // Timing: bars 0..1s tick on at 1.0, 1.5, 2.0, 2.5
    ctx.textAlign = 'center';
    ctx.font = 'bold 9px Inter, sans-serif';
    const factorCount = 4;
    const factorW = w / (factorCount + 2);

    for (let i = 0; i < factorCount; i++) {
      const cx = w * 0.5 + (i - 1.5) * factorW;
      const tickTime = 1 + i * 0.5;
      const lit = pattern[i] && sct >= tickTime;
      const flashing = pattern[i] && sct >= tickTime && sct < tickTime + 0.3;

      // Factor box
      ctx.fillStyle = lit ? 'rgba(38,166,154,0.25)' : 'rgba(255,255,255,0.04)';
      ctx.strokeStyle = lit ? TEAL : FAINT;
      ctx.lineWidth = lit ? 2 : 1;
      ctx.beginPath();
      ctx.roundRect(cx - 28, factorsY - 18, 56, 36, 5);
      ctx.fill();
      ctx.stroke();

      // Checkmark or X
      ctx.font = 'bold 16px Inter, sans-serif';
      if (lit) {
        ctx.fillStyle = TEAL;
        ctx.fillText('✓', cx, factorsY - 2);
      } else if (sct >= tickTime + 0.1) {
        ctx.fillStyle = MAGENTA;
        ctx.fillText('✕', cx, factorsY - 2);
      }

      // Label
      ctx.fillStyle = lit ? TEAL : DIM;
      ctx.font = '8px Inter, sans-serif';
      ctx.fillText(factorNames[i], cx, factorsY + 14);

      // Flash ring
      if (flashing) {
        const flashT = (sct - tickTime) / 0.3;
        ctx.strokeStyle = `rgba(38,166,154,${1 - flashT})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, factorsY, 30 + flashT * 18, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // ── Counter ──
    const counterY = h * 0.65;
    const tickCount = Math.min(factorCount, Math.max(0, Math.floor((sct - 0.7) / 0.5)));
    const litSoFar = pattern.slice(0, tickCount).filter(Boolean).length;

    ctx.textAlign = 'center';
    ctx.fillStyle = WHITE;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText('conviction score =', w / 2 - 50, counterY);

    ctx.fillStyle = litSoFar >= 3 ? TEAL : litSoFar === 2 ? AMBER : DIM;
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.fillText(`${litSoFar}/4`, w / 2 + 30, counterY + 4);

    // ── Boolean eval — only after all 4 factors tick ──
    if (sct > 3.5) {
      const evalT = Math.min(1, (sct - 3.5) / 0.5);
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = `rgba(255,179,0,${evalT})`;
      ctx.fillText(`score \u2265 threshold  \u2192  ${litSoFar} \u2265 3  \u2192  ${litSoFar >= 3 ? 'TRUE' : 'FALSE'}`, w / 2, counterY + 30);

      // Signal output
      const sigT = Math.max(0, (sct - 4) / 0.5);
      if (sigT > 0) {
        const sigColor = litSoFar >= 3 ? TEAL : MAGENTA;
        ctx.fillStyle = `rgba(${litSoFar >= 3 ? '38,166,154' : '239,83,80'},${Math.min(1, sigT)})`;
        ctx.font = 'bold 13px Inter, sans-serif';
        ctx.fillText(litSoFar >= 3 ? '▲ PX LONG SIGNAL FIRES' : '✕ NO SIGNAL — gate refused', w / 2, h - 24);
        // Pulse ring on success
        if (litSoFar >= 3 && sct < 4.8) {
          const ringT = (sct - 4) / 0.8;
          ctx.strokeStyle = `rgba(38,166,154,${1 - ringT})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(w / 2, h - 28, ringT * 60, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }

    // Scenario label
    ctx.font = '8px Inter, sans-serif';
    ctx.fillStyle = DIM;
    ctx.textAlign = 'left';
    ctx.fillText(scenarioPasses ? 'Scenario 1 — 3 of 4 conviction factors satisfied' : 'Scenario 2 — only 2 of 4 conviction factors satisfied', 12, h - 8);
  }, []);

  return <AnimScene draw={draw} />;
}

// ============================================================
// ANIMATION 3 — SkipPileAnim (S02 The 8/3/5 Skip Pile)
// 8 signal arrows fire from the left. They travel right and hit
// a filter gate. 3 pass through into the "TRADE" pile on the right.
// 5 fall away into the "SKIP" pile, each with a reason label.
// 14-second loop.
// ============================================================
function SkipPileAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.18)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    // Title
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE 8/3/5 RATIO — 8 SIGNALS, 3 TRADES, 5 SKIPS', w / 2, 22);

    const cycleDur = 14;
    const ct = t % cycleDur;

    // 8 signals, each starts 1.5s after the previous, total 12s for last to land
    type Signal = { passes: boolean; reason: string; verdict: string };
    const signals: Signal[] = [
      { passes: true, reason: '', verdict: 'PX LONG · 4/4 · TRADE' },
      { passes: false, reason: '2/4', verdict: 'PX LONG · 2/4 · skip (below threshold)' },
      { passes: true, reason: '', verdict: 'TS SHORT · 3/4 · TRADE' },
      { passes: false, reason: 'news', verdict: 'PX SHORT · NFP ±30m · skip (news window)' },
      { passes: false, reason: 'regime', verdict: 'PX LONG · VOLATILE · skip (regime fit)' },
      { passes: true, reason: '', verdict: 'PX LONG · 3/4 · TRADE' },
      { passes: false, reason: 'revenge', verdict: 'TS LONG · 4-bar re-entry · skip (cooldown)' },
      { passes: false, reason: 'position', verdict: 'PX LONG · 1/asset cap · skip (position policy)' },
    ];

    const padX = 28;
    const gateX = w * 0.42;
    const tradeX = w - padX - 28;
    const startX = padX + 16;

    // Gate visualization
    ctx.strokeStyle = AMBER;
    ctx.lineWidth = 2;
    ctx.fillStyle = 'rgba(255,179,0,0.06)';
    ctx.beginPath();
    ctx.roundRect(gateX - 14, 50, 28, h - 80, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.save();
    ctx.translate(gateX, h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('OPERATOR FILTER', 0, 3);
    ctx.restore();

    // Trade pile label
    ctx.fillStyle = TEAL;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('TRADE PILE', w - padX, 50);
    ctx.font = '8px Inter, sans-serif';
    ctx.fillStyle = DIM;
    ctx.fillText('(roughly 3 of 8)', w - padX, 62);

    // Skip pile label (bottom)
    ctx.fillStyle = MAGENTA;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('SKIP PILE', padX, h - 38);
    ctx.font = '8px Inter, sans-serif';
    ctx.fillStyle = DIM;
    ctx.fillText('(roughly 5 of 8 — each for a specific reason)', padX, h - 26);

    // Animate each signal
    let tradeCount = 0;
    let skipCount = 0;
    for (let i = 0; i < signals.length; i++) {
      const signal = signals[i];
      const start = i * 1.4;
      const localT = ct - start;
      if (localT < 0) continue;

      const trackY = 80 + i * 5;
      const fallStart = 1.0; // when fail-path starts dropping
      const finalY = signal.passes ? 80 + tradeCount * 16 : h - 56 + skipCount * 4;

      // Slot assignment (only once trail is past gate)
      const reachedGate = localT > 1.0;
      if (reachedGate) {
        // assign slot
        if (signal.passes) {
          // count how many BEFORE this index are also passes
          tradeCount = signals.slice(0, i).filter((s, idx) => s.passes && ct > idx * 1.4 + 1.0).length;
        } else {
          skipCount = signals.slice(0, i).filter((s, idx) => !s.passes && ct > idx * 1.4 + 1.0).length;
        }
      }

      let sx: number;
      let sy: number;
      let alpha = Math.min(1, localT * 2);

      if (localT < 1.0) {
        // Travel from left to gate
        const travelT = localT;
        sx = startX + (gateX - startX) * travelT;
        sy = trackY;
      } else if (signal.passes) {
        // Travel gate -> trade pile
        const travelT = Math.min(1, (localT - 1.0) / 0.8);
        sx = gateX + (tradeX - gateX) * travelT;
        sy = trackY + (finalY - trackY) * travelT;
      } else {
        // Travel gate -> drop down -> skip pile
        const travelT = Math.min(1, (localT - 1.0) / 1.0);
        sx = gateX + (gateX - 12 - gateX) * 0; // stays near gate horizontally
        sx = gateX + 6 - travelT * 30; // slight bounce backward as it drops
        sy = trackY + (h - 56 - trackY) * travelT;
        alpha = Math.max(0.4, 1 - travelT * 0.4);
      }

      // Draw the signal arrow
      const color = signal.passes ? TEAL : MAGENTA;
      ctx.fillStyle = color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.moveTo(sx - 5, sy - 4);
      ctx.lineTo(sx + 5, sy);
      ctx.lineTo(sx - 5, sy + 4);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;

      // Verdict label — only show for the currently-active signal at this t
      if (localT > 1.2 && localT < 2.5 && ct < (signals.length - 1) * 1.4 + 2.5) {
        ctx.fillStyle = `rgba(255,255,255,${Math.min(1, 1 - (localT - 1.2) / 1.3)})`;
        ctx.font = '8px Inter, sans-serif';
        ctx.textAlign = signal.passes ? 'left' : 'right';
        ctx.fillText(signal.verdict, signal.passes ? sx + 10 : sx - 10, sy + 3);
      }
    }

    // Final tally panel (appears late)
    if (ct > 12.5) {
      const tallyT = Math.min(1, (ct - 12.5) / 1);
      ctx.fillStyle = `rgba(255,179,0,${0.4 * tallyT})`;
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('3 traded / 5 skipped / 8 fired', w / 2, h * 0.45);
    }
  }, []);

  return <AnimScene draw={draw} />;
}

// ============================================================
// ANIMATION 4 — DisciplinePyramidAnim (S03 The Discipline Pyramid)
// 4-tier pyramid building bottom-up. Each tier appears with a label,
// then is stress-tested (a small impact dot tries to crack it).
// 12-second loop.
// ============================================================
function DisciplinePyramidAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.18)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    // Title
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE DISCIPLINE PYRAMID — PROCESS → PLAN → EXECUTION → REVIEW', w / 2, 22);

    const cycleDur = 12;
    const ct = t % cycleDur;

    const tiers = [
      { label: 'PROCESS', sub: 'how you study, prepare, journal', failure: 'no study → no calibration' },
      { label: 'PLAN', sub: 'the specific plan for this session', failure: 'no plan → no benchmark' },
      { label: 'EXECUTION', sub: 'the live work, mechanical', failure: 'overrides → discretionary drift' },
      { label: 'REVIEW', sub: 'the post-session reckoning', failure: 'no review → no learning' },
    ];

    const pyramidCenterX = w * 0.5;
    const pyramidBottomY = h * 0.85;
    const baseW = w * 0.6;
    const tierH = (h * 0.5) / 4;

    // Each tier appears at: 0.5, 2.5, 4.5, 6.5s. Stress-test at +1.5s after each appears.
    for (let i = 0; i < tiers.length; i++) {
      const tier = tiers[i];
      const tierAppearT = 0.5 + i * 2;
      const tierStressT = tierAppearT + 1.5;
      const localT = ct - tierAppearT;
      if (localT < 0) continue;

      const fadeIn = Math.min(1, localT / 0.6);
      const tierBottomY = pyramidBottomY - i * tierH;
      const tierTopY = tierBottomY - tierH;
      const widthFraction = 1 - i * 0.2;
      const tierBottomW = baseW * widthFraction;
      const tierTopW = baseW * (widthFraction - 0.2);

      // Polygon: trapezoid
      ctx.fillStyle = `rgba(38,166,154,${0.18 * fadeIn})`;
      ctx.strokeStyle = `rgba(38,166,154,${fadeIn})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(pyramidCenterX - tierBottomW / 2, tierBottomY);
      ctx.lineTo(pyramidCenterX + tierBottomW / 2, tierBottomY);
      ctx.lineTo(pyramidCenterX + tierTopW / 2, tierTopY);
      ctx.lineTo(pyramidCenterX - tierTopW / 2, tierTopY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Tier label
      ctx.fillStyle = `rgba(255,255,255,${fadeIn})`;
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(tier.label, pyramidCenterX, (tierTopY + tierBottomY) / 2);
      ctx.fillStyle = `rgba(255,255,255,${0.4 * fadeIn})`;
      ctx.font = '7px Inter, sans-serif';
      ctx.fillText(tier.sub, pyramidCenterX, (tierTopY + tierBottomY) / 2 + 10);

      // Stress test — impact dot tries to crack the tier
      const stressLocal = ct - tierStressT;
      if (stressLocal >= 0 && stressLocal < 1.0) {
        const impactX = pyramidCenterX - tierBottomW / 2 - 30 + stressLocal * 40;
        const impactY = (tierTopY + tierBottomY) / 2 - 5;
        const impactSize = 3 + stressLocal * 2;

        ctx.fillStyle = MAGENTA;
        ctx.beginPath();
        ctx.arc(impactX, impactY, impactSize, 0, Math.PI * 2);
        ctx.fill();

        if (stressLocal > 0.5) {
          // Impact ring on tier — tier holds, shown by teal flash
          ctx.strokeStyle = `rgba(38,166,154,${1 - (stressLocal - 0.5) * 2})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(pyramidCenterX - tierBottomW / 2, tierBottomY);
          ctx.lineTo(pyramidCenterX + tierBottomW / 2, tierBottomY);
          ctx.lineTo(pyramidCenterX + tierTopW / 2, tierTopY);
          ctx.lineTo(pyramidCenterX - tierTopW / 2, tierTopY);
          ctx.closePath();
          ctx.stroke();
        }
      }

      // Failure label appears on right
      if (stressLocal > 0.6) {
        const failFade = Math.min(1, (stressLocal - 0.6) / 0.4);
        ctx.fillStyle = `rgba(239,83,80,${failFade * 0.7})`;
        ctx.font = '7px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('without it: ' + tier.failure, pyramidCenterX + tierBottomW / 2 + 12, (tierTopY + tierBottomY) / 2 + 2);
      }
    }

    // Bottom caption
    ctx.fillStyle = DIM;
    ctx.font = '8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Each tier supports the one above. Skip any tier and the structure becomes unstable.', w / 2, h - 14);
  }, []);

  return <AnimScene draw={draw} />;
}

// ============================================================
// ANIMATION 5 — ★ TSCooldownClockAnim (S05 Pine-Encoded Discipline #2)
// THE FIRST OF THREE AMBITIOUS ANIMATIONS.
//
// A TS LONG signal fires. A circular cooldown clock starts a countdown
// from the cooldown window (8 on retail TFs). A second TS LONG attempts
// to fire during the cooldown — it's REJECTED in real-time with a
// magenta ✕ marker on the chart. After the clock completes, a third
// TS LONG fires successfully.
//
// This visualizes a real Pine boolean firing live.
// 14-second loop.
// ============================================================
function TSCooldownClockAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';
    const RED = '#FF1744';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.18)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    // Title
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('\u2605 TS COOLDOWN CLOCK \u2014 SAME-DIRECTION LOCKOUT', w / 2, 22);

    const cycleDur = 14;
    const ct = t % cycleDur;

    // ── Mechanism reminder (top-right small) ──
    ctx.font = '8px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillStyle = DIM;
    ctx.fillText('Cooldown window: 8 bars (this TF)', w - 10, 40);
    ctx.fillText('Same-direction TS blocked until window elapses', w - 10, 50);

    // ── Layout ──
    const clockCx = w * 0.28;
    const clockCy = h * 0.55;
    const clockR = Math.min(h * 0.28, 70);

    const chartLeft = w * 0.5;
    const chartRight = w - 16;
    const chartY = h * 0.55;
    const chartW = chartRight - chartLeft;

    // ── Timeline ──
    // Bar 0 = first TS LONG fires (at t=1s)
    // Bar 3 = second TS LONG attempted (at t=4s) → REJECTED, magenta ✕
    // Bar 8 = cooldown completes (at t=9s)
    // Bar 9 = third TS LONG fires successfully (at t=10s)

    const fire1T = 1.0;
    const attempt2T = 4.0;
    const cooldownEndT = 9.0;
    const fire3T = 10.5;

    // Compute current bar index (visually)
    const barsTotal = 12;
    const barsElapsed = Math.min(barsTotal, ct * (barsTotal / cycleDur));

    // ── Draw cooldown clock ──
    // Background ring
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(clockCx, clockCy, clockR, 0, Math.PI * 2);
    ctx.stroke();

    // Cooldown progress arc
    if (ct >= fire1T && ct < cooldownEndT) {
      const progress = (ct - fire1T) / (cooldownEndT - fire1T);
      const startAng = -Math.PI / 2;
      const endAng = startAng + Math.PI * 2 * progress;

      // Glow when an attempt is rejected
      const isRejectionPulse = Math.abs(ct - attempt2T) < 0.4;
      if (isRejectionPulse) {
        const pulseT = Math.max(0, 1 - Math.abs(ct - attempt2T) / 0.4);
        ctx.shadowColor = MAGENTA;
        ctx.shadowBlur = 18 * pulseT;
      }

      ctx.strokeStyle = AMBER;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(clockCx, clockCy, clockR, startAng, endAng);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.lineCap = 'butt';

      // Center countdown text
      const barsRemaining = Math.max(0, 8 - Math.floor((ct - fire1T) * (8 / (cooldownEndT - fire1T))));
      ctx.fillStyle = AMBER;
      ctx.font = 'bold 26px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(barsRemaining), clockCx, clockCy + 8);
      ctx.fillStyle = DIM;
      ctx.font = '8px Inter, sans-serif';
      ctx.fillText('bars left', clockCx, clockCy + 22);
      ctx.fillText('TS LOCKOUT', clockCx, clockCy - 18);
    } else if (ct >= cooldownEndT && ct < fire3T) {
      // Cooldown complete — full teal ring
      ctx.strokeStyle = TEAL;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(clockCx, clockCy, clockR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = TEAL;
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('READY', clockCx, clockCy + 4);
    } else {
      // Idle
      ctx.fillStyle = DIM;
      ctx.font = '8px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('TS COOLDOWN', clockCx, clockCy - 4);
      ctx.fillText('(idle)', clockCx, clockCy + 8);
    }

    // ── Mini chart on the right showing bars + fires ──
    // Draw 12 candle slots
    const candleW = chartW / barsTotal;
    for (let bar = 0; bar < barsTotal; bar++) {
      const cx = chartLeft + bar * candleW + candleW / 2;
      const cy = chartY + Math.sin(bar * 0.7) * 14; // wavy price baseline

      const elapsed = bar <= barsElapsed;
      ctx.fillStyle = elapsed ? `rgba(255,255,255,${0.5 - bar * 0.02})` : 'rgba(255,255,255,0.08)';
      ctx.fillRect(cx - 3, cy - 9, 6, 18);

      // Bar index label
      if (bar % 3 === 0) {
        ctx.fillStyle = FAINT;
        ctx.font = '7px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`b${bar}`, cx, chartY + 30);
      }
    }

    // ── Fire 1: PX LONG, bar 0 ──
    if (ct >= fire1T) {
      const cx = chartLeft + 0 * candleW + candleW / 2;
      const cy = chartY + Math.sin(0 * 0.7) * 14;
      ctx.fillStyle = TEAL;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 16);
      ctx.lineTo(cx - 5, cy - 8);
      ctx.lineTo(cx + 5, cy - 8);
      ctx.closePath();
      ctx.fill();
      // Pulse on first fire
      if (ct < fire1T + 0.8) {
        const pulseT = (ct - fire1T) / 0.8;
        ctx.strokeStyle = `rgba(38,166,154,${1 - pulseT})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, pulseT * 18, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // ── Attempt 2: rejected during cooldown, bar 3 ──
    if (ct >= attempt2T) {
      const cx = chartLeft + 3 * candleW + candleW / 2;
      const cy = chartY + Math.sin(3 * 0.7) * 14;

      // Ghost arrow (faint TEAL would-be signal)
      ctx.fillStyle = 'rgba(38,166,154,0.25)';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 16);
      ctx.lineTo(cx - 5, cy - 8);
      ctx.lineTo(cx + 5, cy - 8);
      ctx.closePath();
      ctx.fill();

      // Magenta ✕ rejection marker
      ctx.strokeStyle = MAGENTA;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 5, cy - 16);
      ctx.lineTo(cx + 5, cy - 6);
      ctx.moveTo(cx + 5, cy - 16);
      ctx.lineTo(cx - 5, cy - 6);
      ctx.stroke();

      // Rejection label (briefly visible)
      if (ct < attempt2T + 1.5) {
        const labelFade = Math.max(0, 1 - (ct - attempt2T) / 1.5);
        ctx.fillStyle = `rgba(239,83,80,${labelFade})`;
        ctx.font = 'bold 8px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('COOLDOWN', cx, cy - 24);
      }
    }

    // ── Fire 3: cooldown elapsed, succeeds, bar 9 ──
    if (ct >= fire3T) {
      const cx = chartLeft + 9 * candleW + candleW / 2;
      const cy = chartY + Math.sin(9 * 0.7) * 14;
      ctx.fillStyle = TEAL;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 16);
      ctx.lineTo(cx - 5, cy - 8);
      ctx.lineTo(cx + 5, cy - 8);
      ctx.closePath();
      ctx.fill();
      if (ct < fire3T + 0.8) {
        const pulseT = (ct - fire3T) / 0.8;
        ctx.strokeStyle = `rgba(38,166,154,${1 - pulseT})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, pulseT * 18, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // ── Bottom caption ──
    ctx.fillStyle = DIM;
    ctx.font = '8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CIPHER has a cooldown. The disciplined operator has one too. Mirror the engine.', w / 2, h - 12);
  }, []);

  return <AnimScene draw={draw} aspectRatio={2.2} />;
}

// ============================================================
// ANIMATION 6 — ★★ PresetPhilosophyRingAnim (S06 Pine-Encoded #3)
// THE MOST AMBITIOUS ANIMATION IN THE LESSON.
//
// 6 presets arranged in a radial. Each cycle, the "selector" rotates
// to one preset, and the entire visual state below the ring re-configures:
//  - conviction threshold value
//  - signal engine width
//  - active visual layers (badges light up: Ribbon, Pulse, Structure, etc.)
//  - personality archetype name
//  - one-line philosophy summary
//
// 24-second cycle: 4 seconds per preset × 6 presets.
// ============================================================
function PresetPhilosophyRingAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.18)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    // Title
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('\u2605\u2605 PRESET PHILOSOPHY RING \u2014 EACH PRESET IS A DISCIPLINE', w / 2, 22);

    type Preset = {
      name: string;
      minConv: number;
      pulseMult: number;
      layers: string[];
      personality: string;
      philosophy: string;
    };
    const presets: Preset[] = [
      { name: 'TREND TRADER', minConv: 0, pulseMult: 1.0, layers: ['Ribbon', 'Pulse', 'Trend Cdl'], personality: 'The Wave Rider', philosophy: 'Follow the stack. Many trades. Take all qualified fires.' },
      { name: 'SCALPER', minConv: 0, pulseMult: 0.8, layers: ['Structure', 'FVG', 'Pulse', 'Composite'], personality: 'The Hummingbird', philosophy: 'Tight Pulse. Scalp from levels, target gaps. High frequency.' },
      { name: 'SWING TRADER', minConv: 3, pulseMult: 1.2, layers: ['Ribbon', 'Spine', 'Pulse'], personality: 'The Patient One', philosophy: 'Wide Pulse, Strong Only. Few trades, mid-timeframe.' },
      { name: 'REVERSAL', minConv: 0, pulseMult: 1.0, layers: ['Spine', 'FVG', 'Risk Env', 'Tension'], personality: 'The Contrarian', philosophy: 'Catch the snap. Tension over trend. Mean-reversion bias.' },
      { name: 'SNIPER', minConv: 3, pulseMult: 1.3, layers: ['Pulse', 'Coil'], personality: 'The Apex Predator', philosophy: 'Widest Pulse. Strong Only. Wait for squeeze, then strike.' },
      { name: 'STRUCTURE', minConv: 0, pulseMult: 1.0, layers: ['Structure', 'FVG', 'Sweeps'], personality: 'The Cartographer', philosophy: 'No signals. Pure chart reading. Map the institutional levels.' },
    ];

    const cycleDur = 24;
    const ct = t % cycleDur;
    const perPreset = cycleDur / presets.length; // 4s per preset
    const presetIdx = Math.floor(ct / perPreset);
    const presetT = (ct % perPreset) / perPreset; // 0..1 within current preset
    const preset = presets[presetIdx];

    // ── Ring layout ──
    const ringCx = w * 0.25;
    const ringCy = h * 0.5;
    const ringR = Math.min(h * 0.32, 75);

    // Draw the ring background
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(ringCx, ringCy, ringR, 0, Math.PI * 2);
    ctx.stroke();

    // Draw 6 preset positions on the ring
    for (let i = 0; i < presets.length; i++) {
      const angle = (i / presets.length) * Math.PI * 2 - Math.PI / 2;
      const px = ringCx + Math.cos(angle) * ringR;
      const py = ringCy + Math.sin(angle) * ringR;
      const isActive = i === presetIdx;

      // Selector orb
      ctx.fillStyle = isActive ? AMBER : 'rgba(255,255,255,0.1)';
      ctx.strokeStyle = isActive ? AMBER : FAINT;
      ctx.lineWidth = isActive ? 2 : 1;

      // Pulse for active
      const r = isActive ? 7 + Math.sin(t * 6) * 1.5 : 4;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Preset name label outside ring
      const labelR = ringR + 18;
      const lx = ringCx + Math.cos(angle) * labelR;
      const ly = ringCy + Math.sin(angle) * labelR;
      ctx.fillStyle = isActive ? AMBER : DIM;
      ctx.font = isActive ? 'bold 8px Inter, sans-serif' : '7px Inter, sans-serif';
      // Adjust alignment based on angle
      if (angle > -Math.PI / 4 && angle < Math.PI / 4) ctx.textAlign = 'left';
      else if (angle > 3 * Math.PI / 4 || angle < -3 * Math.PI / 4) ctx.textAlign = 'right';
      else ctx.textAlign = 'center';
      ctx.fillText(presets[i].name, lx, ly + 3);
    }

    // Selector arrow at center pointing to active
    const activeAngle = (presetIdx / presets.length) * Math.PI * 2 - Math.PI / 2;
    ctx.strokeStyle = AMBER;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ringCx, ringCy);
    ctx.lineTo(ringCx + Math.cos(activeAngle) * (ringR - 12), ringCy + Math.sin(activeAngle) * (ringR - 12));
    ctx.stroke();
    ctx.fillStyle = AMBER;
    ctx.beginPath();
    ctx.arc(ringCx, ringCy, 3, 0, Math.PI * 2);
    ctx.fill();

    // ── Right panel: configuration ──
    const panelX = w * 0.52;
    const panelTop = 50;

    // Fade in current preset's panel
    const panelFade = Math.min(1, presetT * 4);
    const panelOut = presetT > 0.85 ? 1 - (presetT - 0.85) * 6.7 : 1; // fade out at end

    ctx.globalAlpha = Math.max(0, Math.min(panelFade, panelOut));

    // Personality (large title)
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(preset.personality, panelX, panelTop);

    // Threshold + signal-engine width atoms
    ctx.fillStyle = DIM;
    ctx.font = '8px Inter, sans-serif';
    ctx.fillText('Conviction threshold:', panelX, panelTop + 22);
    ctx.fillStyle = preset.minConv >= 3 ? TEAL : WHITE;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText(preset.minConv >= 3 ? '3-of-4' : 'open', panelX + 110, panelTop + 22);

    ctx.fillStyle = DIM;
    ctx.font = '8px Inter, sans-serif';
    ctx.fillText('Signal engine width:', panelX, panelTop + 38);
    ctx.fillStyle = WHITE;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText(preset.pulseMult < 1 ? 'tight' : preset.pulseMult > 1.2 ? 'widest' : preset.pulseMult > 1 ? 'wide' : 'default', panelX + 110, panelTop + 38);

    // Active layer badges
    ctx.fillStyle = DIM;
    ctx.font = '8px Inter, sans-serif';
    ctx.fillText('VISUAL LAYERS', panelX, panelTop + 58);
    const badgeStartY = panelTop + 64;
    for (let i = 0; i < preset.layers.length; i++) {
      const bw = preset.layers[i].length * 6 + 10;
      const bx = panelX + (i % 2) * 80;
      const by = badgeStartY + Math.floor(i / 2) * 16;

      ctx.fillStyle = 'rgba(38,166,154,0.18)';
      ctx.strokeStyle = TEAL;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, 12, 3);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = TEAL;
      ctx.font = 'bold 7px Inter, sans-serif';
      ctx.fillText(preset.layers[i], bx + 5, by + 8);
    }

    // Philosophy line at bottom of panel
    ctx.fillStyle = WHITE;
    ctx.font = 'italic 9px Inter, sans-serif';
    const philosY = h - 26;
    // Wrap if long
    const words = preset.philosophy.split(' ');
    let line = '';
    let lineY = philosY - 12;
    for (const word of words) {
      const test = line + word + ' ';
      if (ctx.measureText(test).width > w * 0.45 && line.length > 0) {
        ctx.fillText(line, panelX, lineY);
        line = word + ' ';
        lineY += 12;
      } else {
        line = test;
      }
    }
    ctx.fillText(line, panelX, lineY);

    ctx.globalAlpha = 1;

    // Bottom caption
    ctx.fillStyle = DIM;
    ctx.font = '7px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Each preset bundles a threshold, a signal-engine width, and a visual layer set into one choice', w / 2, h - 8);
  }, []);

  return <AnimScene draw={draw} aspectRatio={2.0} />;
}

// ============================================================
// ANIMATION 7 — PreSessionChecklistAnim (S07 Pre-Session Discipline)
// 5-item checklist appears top-down. Each item gets a ✓ (teal) as it's
// checked. One specific item triggers a "kill criterion" — if the
// answer is no, the entire session is aborted (red flash).
// 12-second loop.
// ============================================================
function PreSessionChecklistAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.18)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    // Title
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PRE-SESSION CHECKLIST — 5 MECHANICAL CHECKS', w / 2, 22);

    type Item = { text: string; isKill: boolean; pass: boolean };
    const items: Item[] = [
      { text: 'Overnight news scanned, high-impact events flagged', isKill: false, pass: true },
      { text: 'Watchlist verified (chart roles assigned)', isKill: false, pass: true },
      { text: 'Alerts active and tested', isKill: false, pass: true },
      { text: 'Mental state check — KILL if H, A, L, or T failing', isKill: true, pass: true },
      { text: 'Drawdown circuit not triggered (≥-3R week)', isKill: true, pass: true },
    ];

    const cycleDur = 12;
    const ct = t % cycleDur;

    const startX = w * 0.1;
    const startY = 60;
    const lineH = (h - startY - 40) / items.length;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const appearT = 0.5 + i * 1.5;
      const itemY = startY + i * lineH;
      const localT = ct - appearT;
      if (localT < 0) continue;

      const fadeIn = Math.min(1, localT / 0.5);

      // Item box
      ctx.fillStyle = `rgba(255,255,255,${0.03 * fadeIn})`;
      ctx.strokeStyle = `rgba(255,255,255,${0.18 * fadeIn})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(startX, itemY, w - startX * 2, lineH - 6, 5);
      ctx.fill();
      ctx.stroke();

      // Number badge
      ctx.fillStyle = `rgba(255,179,0,${0.2 * fadeIn})`;
      ctx.beginPath();
      ctx.roundRect(startX + 8, itemY + 6, 18, 18, 3);
      ctx.fill();
      ctx.fillStyle = `rgba(255,179,0,${fadeIn})`;
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(i + 1), startX + 17, itemY + 19);

      // Item text
      ctx.fillStyle = `rgba(255,255,255,${0.85 * fadeIn})`;
      ctx.font = '9px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(item.text, startX + 34, itemY + 18);

      // Kill marker for kill items
      if (item.isKill) {
        ctx.fillStyle = `rgba(239,83,80,${fadeIn * 0.7})`;
        ctx.font = 'bold 7px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('KILL CRITERION', w - startX - 28, itemY + 18);
      }

      // ✓ checkmark after 0.7s of appearing
      if (localT > 0.7) {
        const checkFade = Math.min(1, (localT - 0.7) / 0.3);
        const checkX = w - startX - 14;
        const checkY = itemY + lineH / 2 - 3;
        ctx.strokeStyle = `rgba(38,166,154,${checkFade})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(checkX - 4, checkY);
        ctx.lineTo(checkX - 1, checkY + 4);
        ctx.lineTo(checkX + 5, checkY - 4);
        ctx.stroke();
      }
    }

    // After all items pass
    if (ct > 8.5) {
      const greenFade = Math.min(1, (ct - 8.5) / 0.8);
      ctx.fillStyle = `rgba(38,166,154,${0.18 * greenFade})`;
      ctx.fillRect(0, h - 24, w, 20);
      ctx.fillStyle = `rgba(38,166,154,${greenFade})`;
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✓ SESSION CLEARED — Proceed to live engagement', w / 2, h - 10);
    }
  }, []);

  return <AnimScene draw={draw} aspectRatio={2.0} />;
}

// ============================================================
// ANIMATION 8 — MidSessionDecisionTreeAnim (S08 Mid-Session)
// Branching flowchart. A signal arrives at the root node. It travels
// down the branches: Regime fit? → Structure clear? → Conviction tier?
// Final branch reveals one of three outcomes: ENGAGE (teal),
// WAIT (amber), or SKIP (magenta).
// 12-second loop with 4 different signal scenarios.
// ============================================================
function MidSessionDecisionTreeAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.18)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    // Title
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MID-SESSION DECISION TREE — 5-SECOND TRIAGE', w / 2, 22);

    const cycleDur = 12;
    const ct = t % cycleDur;
    const perScenario = 3;
    const scenarioIdx = Math.floor(ct / perScenario);
    const sct = (ct % perScenario) / perScenario;

    // 4 scenarios: each has answer at each branch + final outcome
    type Scenario = {
      label: string;
      regimeFit: boolean;
      structureClear: boolean;
      conv: number;
      outcome: 'ENGAGE' | 'WAIT' | 'SKIP';
    };
    const scenarios: Scenario[] = [
      { label: 'PX LONG · 4/4 · TREND', regimeFit: true, structureClear: true, conv: 4, outcome: 'ENGAGE' },
      { label: 'PX SHORT · 3/4 · TREND ', regimeFit: true, structureClear: true, conv: 3, outcome: 'ENGAGE' },
      { label: 'TS LONG · 2/4 · TREND', regimeFit: true, structureClear: true, conv: 2, outcome: 'SKIP' },
      { label: 'PX LONG · 3/4 · VOLATILE', regimeFit: false, structureClear: true, conv: 3, outcome: 'SKIP' },
    ];
    const scenario = scenarios[scenarioIdx];

    // Root node
    const rootCx = w / 2;
    const rootCy = 60;
    const branchL1Y = rootCy + 60;
    const branchL2Y = branchL1Y + 60;
    const branchL3Y = branchL2Y + 60;

    // Draw root signal
    ctx.fillStyle = AMBER;
    ctx.strokeStyle = AMBER;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(rootCx - 70, rootCy - 14, 140, 28, 5);
    ctx.stroke();
    ctx.fillStyle = WHITE;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(scenario.label, rootCx, rootCy + 3);

    // Travel token (signal moving down the tree)
    // Phase 1: root → L1 check (0..0.25)
    // Phase 2: L1 → L2 (0.25..0.50)
    // Phase 3: L2 → L3 (0.5..0.75)
    // Phase 4: L3 → outcome (0.75..1.0)

    // L1: Regime check
    const l1X = rootCx;
    const l1Y = branchL1Y;
    const l1Pass = scenario.regimeFit;
    drawDecisionNode(ctx, l1X, l1Y, 'REGIME FIT?', l1Pass ? 'YES — TREND' : 'NO — VOLATILE', l1Pass, sct > 0.2, sct, TEAL, MAGENTA, WHITE, DIM, FAINT, AMBER);

    // Line root → L1 (always)
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(rootCx, rootCy + 14);
    ctx.lineTo(l1X, l1Y - 14);
    ctx.stroke();

    // L2: Structure clear?
    const l2X = rootCx;
    const l2Y = branchL2Y;
    if (sct > 0.45 && l1Pass) {
      const l2Pass = scenario.structureClear;
      drawDecisionNode(ctx, l2X, l2Y, 'STRUCTURE CLEAR?', l2Pass ? 'YES' : 'NO', l2Pass, sct > 0.5, sct, TEAL, MAGENTA, WHITE, DIM, FAINT, AMBER);
      ctx.strokeStyle = FAINT;
      ctx.beginPath();
      ctx.moveTo(l1X, l1Y + 14);
      ctx.lineTo(l2X, l2Y - 14);
      ctx.stroke();
    }

    // L3: Conviction tier
    const l3X = rootCx;
    const l3Y = branchL3Y;
    if (sct > 0.7 && l1Pass && scenario.structureClear) {
      const l3Pass = scenario.conv >= 3;
      drawDecisionNode(ctx, l3X, l3Y, 'CONVICTION ≥ 3/4?', `${scenario.conv}/4`, l3Pass, sct > 0.75, sct, TEAL, MAGENTA, WHITE, DIM, FAINT, AMBER);
      ctx.strokeStyle = FAINT;
      ctx.beginPath();
      ctx.moveTo(l2X, l2Y + 14);
      ctx.lineTo(l3X, l3Y - 14);
      ctx.stroke();
    }

    // OUTCOME panel
    if (sct > 0.85) {
      const outFade = Math.min(1, (sct - 0.85) / 0.15);
      const outColor = scenario.outcome === 'ENGAGE' ? TEAL : scenario.outcome === 'WAIT' ? AMBER : MAGENTA;
      const outRGB = scenario.outcome === 'ENGAGE' ? '38,166,154' : scenario.outcome === 'WAIT' ? '255,179,0' : '239,83,80';

      ctx.fillStyle = `rgba(${outRGB},${0.2 * outFade})`;
      ctx.strokeStyle = `rgba(${outRGB},${outFade})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(rootCx - 80, h - 50, 160, 32, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = `rgba(${outRGB},${outFade})`;
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(scenario.outcome, rootCx, h - 28);
    }
  }, []);

  return <AnimScene draw={draw} aspectRatio={1.4} />;
}

// Helper for MidSessionDecisionTreeAnim
function drawDecisionNode(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  question: string, answer: string,
  pass: boolean, showAnswer: boolean, sct: number,
  TEAL: string, MAGENTA: string, WHITE: string, DIM: string, FAINT: string, AMBER: string
) {
  const color = pass ? TEAL : MAGENTA;
  const colorRGB = pass ? '38,166,154' : '239,83,80';
  ctx.fillStyle = showAnswer ? `rgba(${colorRGB},0.15)` : 'rgba(255,255,255,0.04)';
  ctx.strokeStyle = showAnswer ? color : FAINT;
  ctx.lineWidth = showAnswer ? 1.5 : 1;
  ctx.beginPath();
  ctx.roundRect(cx - 90, cy - 14, 180, 28, 5);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = WHITE;
  ctx.font = 'bold 8px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(question, cx, cy - 1);
  if (showAnswer) {
    ctx.fillStyle = color;
    ctx.font = 'bold 8px Inter, sans-serif';
    ctx.fillText(answer, cx, cy + 10);
  }
}

// ============================================================
// ANIMATION 9 — JournalComposerAnim (S09 Post-Session Journal)
// A blank journal entry. Required fields fill in sequentially as the
// session progresses. Then a "SKIPPED TRADE" entry slides in below with
// the SAME visual weight as a taken-trade entry. Highlights that
// skipped trades are equal-priority log items.
// 14-second loop.
// ============================================================
function JournalComposerAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.18)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    // Title
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('JOURNAL — TAKEN TRADES AND SKIPPED TRADES, EQUAL WEIGHT', w / 2, 22);

    const cycleDur = 14;
    const ct = t % cycleDur;

    // Two journal entries side by side
    const entryW = (w - 60) / 2;
    const entryX1 = 20;
    const entryX2 = entryX1 + entryW + 20;
    const entryY = 50;
    const entryH = h - 70;

    // ── Left entry: TAKEN TRADE ──
    const takenFields = [
      { label: 'TYPE', value: 'TAKEN — PX LONG' },
      { label: 'ASSET / TF', value: 'XAUUSD 15m' },
      { label: 'PRESET', value: 'Swing Trader' },
      { label: 'CONVICTION', value: '4 / 4 — full strong' },
      { label: 'ENTRY / SL / TPs', value: '2042.30 / 2038.20 / 1R-2R-3R' },
      { label: 'SIZE', value: '1.0R baseline' },
      { label: 'RESULT', value: '+1.8R (scaled at TP1)' },
      { label: 'PROTOCOL', value: 'Followed Risk Map exactly' },
    ];

    // Draw left card
    ctx.fillStyle = `rgba(38,166,154,0.06)`;
    ctx.strokeStyle = TEAL;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(entryX1, entryY, entryW, entryH, 8);
    ctx.fill();
    ctx.stroke();

    // Header band
    ctx.fillStyle = `rgba(38,166,154,0.15)`;
    ctx.fillRect(entryX1, entryY, entryW, 20);
    ctx.fillStyle = TEAL;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('TAKEN TRADE', entryX1 + 8, entryY + 13);

    // Fill in taken trade fields sequentially
    const fieldH = (entryH - 30) / takenFields.length;
    for (let i = 0; i < takenFields.length; i++) {
      const fy = entryY + 28 + i * fieldH;
      const appearT = 0.3 + i * 0.7;
      if (ct < appearT) continue;
      const fade = Math.min(1, (ct - appearT) / 0.4);

      ctx.fillStyle = `rgba(255,255,255,${0.4 * fade})`;
      ctx.font = 'bold 7px Inter, sans-serif';
      ctx.fillText(takenFields[i].label, entryX1 + 8, fy + 4);
      ctx.fillStyle = `rgba(255,255,255,${0.9 * fade})`;
      ctx.font = '8px Inter, sans-serif';
      ctx.fillText(takenFields[i].value, entryX1 + 8, fy + 14);
    }

    // ── Right entry: SKIPPED TRADE — slides in after taken is built ──
    const skipStartT = 6.5;
    const skipLocalT = ct - skipStartT;
    if (skipLocalT < 0) {
      // Placeholder hint
      ctx.fillStyle = FAINT;
      ctx.font = 'italic 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SKIPPED TRADE entry slides in here →', entryX2 + entryW / 2, entryY + entryH / 2);
    } else {
      const slideIn = Math.min(1, skipLocalT / 0.5);
      const offsetX = (1 - slideIn) * 40;

      ctx.globalAlpha = slideIn;
      ctx.fillStyle = `rgba(239,83,80,0.06)`;
      ctx.strokeStyle = MAGENTA;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(entryX2 + offsetX, entryY, entryW, entryH, 8);
      ctx.fill();
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Header band
      ctx.fillStyle = `rgba(239,83,80,0.15)`;
      ctx.fillRect(entryX2 + offsetX, entryY, entryW, 20);
      ctx.fillStyle = MAGENTA;
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('SKIPPED TRADE', entryX2 + 8 + offsetX, entryY + 13);

      // Equal-weight badge
      ctx.fillStyle = `rgba(255,179,0,${slideIn * 0.7})`;
      ctx.font = 'bold 6px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('EQUAL WEIGHT', entryX2 + entryW - 8 + offsetX, entryY + 13);

      const skipFields = [
        { label: 'TYPE', value: 'SKIPPED — TS SHORT' },
        { label: 'ASSET / TF', value: 'EURUSD 5m' },
        { label: 'PRESET', value: 'Sniper' },
        { label: 'CONVICTION', value: '2 / 4 — below min' },
        { label: 'SKIP REASON', value: 'Conviction below threshold' },
        { label: 'RULE FIRED', value: '3-of-4 threshold (Sniper)' },
        { label: 'OUTCOME', value: 'Hindsight: -0.6R loss (skip saved)' },
        { label: 'PROTOCOL', value: 'Discipline rule held correctly' },
      ];

      for (let i = 0; i < skipFields.length; i++) {
        const fy = entryY + 28 + i * fieldH;
        const fieldAppearT = skipStartT + 0.7 + i * 0.4;
        if (ct < fieldAppearT) continue;
        const fade = Math.min(1, (ct - fieldAppearT) / 0.3);

        ctx.fillStyle = `rgba(255,255,255,${0.4 * fade})`;
        ctx.font = 'bold 7px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(skipFields[i].label, entryX2 + 8 + offsetX, fy + 4);
        ctx.fillStyle = `rgba(255,255,255,${0.9 * fade})`;
        ctx.font = '8px Inter, sans-serif';
        ctx.fillText(skipFields[i].value, entryX2 + 8 + offsetX, fy + 14);
      }
    }

    // Bottom caption
    ctx.fillStyle = DIM;
    ctx.font = '7px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('A skip is a decision. It produces useful data. Log it.', w / 2, h - 8);
  }, []);

  return <AnimScene draw={draw} aspectRatio={2.0} />;
}

// ============================================================
// ANIMATION 10 — ★★★ ThirtySessionScrubberAnim (S10)
// THE MOST AMBITIOUS ANIMATION IN THE ENTIRE LESSON.
//
// 30-bar equity curve. User can SCRUB by clicking/dragging to inspect
// any session. Each session reveals its mini-journal: trades taken,
// trades skipped, protocol adherence, daily P&L. The aggregate curve
// shows the TRUE signal hidden under daily noise.
//
// This is genuinely interactive — not the read-only autoplay pattern
// used by other animations. Includes touch support.
// ============================================================
function ThirtySessionScrubber() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scrubIdx, setScrubIdx] = useState(15); // Mid-point default
  const [isDragging, setIsDragging] = useState(false);

  // 30 sessions of simulated data. Realistic noise profile:
  // ~62% winning sessions, ~38% losing sessions, modest positive drift.
  // Crafted so the daily P&L looks random but the 30-session sum is +18R.
  type Session = {
    idx: number;
    taken: number;
    skipped: number;
    adherence: number; // 0-100
    pnl: number; // R per session
    note: string;
  };

  const sessions: Session[] = [
    { idx: 1, taken: 3, skipped: 5, adherence: 100, pnl: 1.2, note: 'Clean session. Process held.' },
    { idx: 2, taken: 2, skipped: 6, adherence: 100, pnl: -0.8, note: 'Two stops. Discipline held.' },
    { idx: 3, taken: 3, skipped: 5, adherence: 100, pnl: 0.4, note: 'Choppy. BE on two trades.' },
    { idx: 4, taken: 4, skipped: 4, adherence: 90, pnl: -1.4, note: 'One override — sized too large.' },
    { idx: 5, taken: 3, skipped: 5, adherence: 100, pnl: 2.1, note: 'Two scalers hit TP3.' },
    { idx: 6, taken: 3, skipped: 5, adherence: 100, pnl: 0.6, note: 'Standard session.' },
    { idx: 7, taken: 2, skipped: 6, adherence: 100, pnl: 1.7, note: 'Quiet but both winners.' },
    { idx: 8, taken: 4, skipped: 4, adherence: 80, pnl: -2.1, note: 'Overrode skip rule — paid for it.' },
    { idx: 9, taken: 0, skipped: 8, adherence: 100, pnl: 0, note: 'Pre-session HALT failed. Aborted.' },
    { idx: 10, taken: 3, skipped: 5, adherence: 100, pnl: 1.3, note: 'Returned at reduced size.' },
    { idx: 11, taken: 3, skipped: 5, adherence: 100, pnl: 0.9, note: 'Standard.' },
    { idx: 12, taken: 2, skipped: 6, adherence: 100, pnl: -0.5, note: 'One small loser.' },
    { idx: 13, taken: 3, skipped: 5, adherence: 100, pnl: 1.6, note: 'TS reversal paid.' },
    { idx: 14, taken: 4, skipped: 4, adherence: 95, pnl: -0.3, note: 'One borderline take. Even.' },
    { idx: 15, taken: 3, skipped: 5, adherence: 100, pnl: 1.1, note: 'Process held cleanly.' },
    { idx: 16, taken: 3, skipped: 5, adherence: 100, pnl: 0.8, note: 'Three small winners.' },
    { idx: 17, taken: 0, skipped: 8, adherence: 100, pnl: 0, note: 'Drawdown circuit fired.' },
    { idx: 18, taken: 2, skipped: 6, adherence: 100, pnl: 1.4, note: 'Reduced size return.' },
    { idx: 19, taken: 3, skipped: 5, adherence: 100, pnl: -0.7, note: 'One loser, two BEs.' },
    { idx: 20, taken: 3, skipped: 5, adherence: 100, pnl: 1.9, note: 'Apex 4/4 setup paid 2R.' },
    { idx: 21, taken: 4, skipped: 4, adherence: 100, pnl: 1.2, note: 'Active day, all qualified.' },
    { idx: 22, taken: 3, skipped: 5, adherence: 100, pnl: 0.3, note: 'Marginal positive.' },
    { idx: 23, taken: 2, skipped: 6, adherence: 100, pnl: -1.0, note: 'Two stops, no overrides.' },
    { idx: 24, taken: 3, skipped: 5, adherence: 100, pnl: 1.5, note: 'Process held under pressure.' },
    { idx: 25, taken: 3, skipped: 5, adherence: 100, pnl: 0.8, note: 'Standard.' },
    { idx: 26, taken: 3, skipped: 5, adherence: 100, pnl: 2.4, note: 'Two scalers hit TP3.' },
    { idx: 27, taken: 4, skipped: 4, adherence: 100, pnl: 1.1, note: 'Active day, all qualified.' },
    { idx: 28, taken: 2, skipped: 6, adherence: 100, pnl: -0.4, note: 'One small loser.' },
    { idx: 29, taken: 3, skipped: 5, adherence: 100, pnl: 1.7, note: 'Clean continuation.' },
    { idx: 30, taken: 3, skipped: 5, adherence: 100, pnl: 1.3, note: '30-session mark complete.' },
  ];

  // Cumulative equity curve
  const equityCurve = sessions.reduce<number[]>((acc, s) => {
    const prev = acc.length === 0 ? 0 : acc[acc.length - 1];
    acc.push(prev + s.pnl);
    return acc;
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width / window.devicePixelRatio;
    const h = canvas.height / window.devicePixelRatio;

    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.18)';

    ctx.clearRect(0, 0, w, h);

    // Title
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('★★★ 30 SESSIONS — DRAG TO SCRUB', w / 2, 22);

    // ── Equity curve chart (upper 60%) ──
    const chartPadX = 36;
    const chartTop = 44;
    const chartH = h * 0.45;
    const chartW = w - chartPadX * 2;

    // Find min/max for y-scaling
    const allEquityValues = [0, ...equityCurve];
    const minEq = Math.min(...allEquityValues);
    const maxEq = Math.max(...allEquityValues);
    const range = (maxEq - minEq) || 1;
    const padRange = range * 1.15;
    const padMin = minEq - (padRange - range) / 2;
    const padMax = maxEq + (padRange - range) / 2;

    // Y-axis: zero line
    const zeroY = chartTop + chartH - ((0 - padMin) / (padMax - padMin)) * chartH;
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(chartPadX, zeroY);
    ctx.lineTo(chartPadX + chartW, zeroY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = DIM;
    ctx.font = '8px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('0R', chartPadX - 4, zeroY + 3);

    // Plot the cumulative equity curve
    const xStep = chartW / (sessions.length - 1);
    ctx.strokeStyle = TEAL;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < sessions.length; i++) {
      const x = chartPadX + i * xStep;
      const y = chartTop + chartH - ((equityCurve[i] - padMin) / (padMax - padMin)) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Glow under curve
    ctx.lineTo(chartPadX + (sessions.length - 1) * xStep, chartTop + chartH);
    ctx.lineTo(chartPadX, chartTop + chartH);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, chartTop, 0, chartTop + chartH);
    grad.addColorStop(0, 'rgba(38,166,154,0.15)');
    grad.addColorStop(1, 'rgba(38,166,154,0)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Plot daily P&L bars (faint, at zero line) — the noise
    for (let i = 0; i < sessions.length; i++) {
      const x = chartPadX + i * xStep - 1.5;
      const pnl = sessions[i].pnl;
      const barH = Math.abs(pnl) * 8;
      const barY = pnl >= 0 ? zeroY - barH : zeroY;
      ctx.fillStyle = pnl >= 0 ? 'rgba(38,166,154,0.35)' : 'rgba(239,83,80,0.35)';
      ctx.fillRect(x, barY, 3, barH);
    }

    // Scrub indicator (vertical line)
    const scrubX = chartPadX + scrubIdx * xStep;
    ctx.strokeStyle = AMBER;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(scrubX, chartTop);
    ctx.lineTo(scrubX, chartTop + chartH);
    ctx.stroke();
    // Scrub knob
    ctx.fillStyle = AMBER;
    ctx.beginPath();
    ctx.arc(scrubX, chartTop + chartH - ((equityCurve[scrubIdx] - padMin) / (padMax - padMin)) * chartH, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#080d16';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Session labels at endpoints
    ctx.fillStyle = DIM;
    ctx.font = '7px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Session 1', chartPadX, chartTop + chartH + 12);
    ctx.textAlign = 'right';
    ctx.fillText('Session 30', chartPadX + chartW, chartTop + chartH + 12);
    ctx.textAlign = 'center';
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 8px Inter, sans-serif';
    ctx.fillText(`Session ${scrubIdx + 1}`, scrubX, chartTop + chartH + 12);

    // ── Journal panel (lower 35%) ──
    const journalTop = chartTop + chartH + 22;
    const journalH = h - journalTop - 12;

    const session = sessions[scrubIdx];
    const cumPnl = equityCurve[scrubIdx];

    // Journal background
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(chartPadX, journalTop, chartW, journalH, 6);
    ctx.fill();
    ctx.stroke();

    // Session number title
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`SESSION ${session.idx} JOURNAL`, chartPadX + 10, journalTop + 14);

    // Metric atoms
    const stats = [
      { label: 'Taken', value: String(session.taken), color: WHITE },
      { label: 'Skipped', value: String(session.skipped), color: WHITE },
      { label: 'Adherence', value: session.adherence + '%', color: session.adherence === 100 ? TEAL : AMBER },
      { label: 'Day P&L', value: (session.pnl >= 0 ? '+' : '') + session.pnl.toFixed(1) + 'R', color: session.pnl >= 0 ? TEAL : MAGENTA },
      { label: 'Cumulative', value: (cumPnl >= 0 ? '+' : '') + cumPnl.toFixed(1) + 'R', color: cumPnl >= 0 ? TEAL : MAGENTA },
    ];
    const statSpacing = chartW / 5;
    for (let i = 0; i < stats.length; i++) {
      const sx = chartPadX + i * statSpacing + statSpacing / 2;
      const sy = journalTop + 36;
      ctx.fillStyle = DIM;
      ctx.font = '7px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(stats[i].label.toUpperCase(), sx, sy);
      ctx.fillStyle = stats[i].color;
      ctx.font = 'bold 13px Inter, sans-serif';
      ctx.fillText(stats[i].value, sx, sy + 15);
    }

    // Note at bottom of journal
    ctx.fillStyle = `rgba(255,255,255,0.7)`;
    ctx.font = 'italic 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`"${session.note}"`, w / 2, journalTop + journalH - 10);
  }, [scrubIdx, sessions, equityCurve]);

  // Resize and initial draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const resize = () => {
      const w = Math.min(parent.clientWidth, 720);
      const h = w / 1.7;
      canvas.width = w * window.devicePixelRatio;
      canvas.height = h * window.devicePixelRatio;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      draw();
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [draw]);

  // Re-draw whenever scrubIdx changes
  useEffect(() => {
    draw();
  }, [draw]);

  // Pointer handlers — translate clientX into scrub index
  const updateFromPointer = useCallback((clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const chartPadX = 36;
    const chartW = rect.width - chartPadX * 2;
    const rel = (x - chartPadX) / chartW;
    const idx = Math.max(0, Math.min(29, Math.round(rel * 29)));
    setScrubIdx(idx);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    updateFromPointer(e.clientX);
    (e.target as Element).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    updateFromPointer(e.clientX);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as Element).releasePointerCapture(e.pointerId);
  };

  return (
    <div
      ref={containerRef}
      className="w-full rounded-2xl overflow-hidden border border-amber-500/20 bg-black/30 select-none"
      style={{ touchAction: 'none' }}
    >
      <canvas
        ref={canvasRef}
        className="block mx-auto cursor-ew-resize"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />
    </div>
  );
}

// ============================================================
// ANIMATION 11 — OverrideReplayAnim (S11 The Override Doctrine)
// Replay of a single overridden trade.
// LEFT: what the engine said (chart with no signal label printed)
// RIGHT: what the operator did (chart with override-entered trade)
// BOTTOM: the P&L delta of that override over a sample of 20 overrides
// 14-second loop.
// ============================================================
function OverrideReplayAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.18)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    // Title
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE OVERRIDE REPLAY — WHAT IT COSTS, AT SCALE', w / 2, 22);

    const cycleDur = 14;
    const ct = t % cycleDur;

    // Phase markers
    const p1End = 4; // both charts draw their bars
    const p2End = 7; // engine "no fire" appears + operator entry appears
    const p3End = 11; // outcome — operator entry stops out
    // p4: aggregate chart appears 11-14s

    // Layout: two mini charts side by side, aggregate bar chart below
    const chartTopY = 46;
    const chartH = h * 0.4;
    const chartLeft1 = 24;
    const chartLeft2 = w / 2 + 12;
    const chartW = (w - 60) / 2;

    // Common candle sequence: gentle uptrend that fails at the same level
    const numBars = 14;
    const barW = chartW / numBars;
    const baselineY = chartTopY + chartH * 0.5;
    const candles = [
      0, -1, 1, 2, 1, 3, 2, 4, 3, 5, 4, 3, 1, -2, // bar 13 = stop bar (drops)
    ];

    // Draw LEFT chart: engine perspective (no signal printed)
    ctx.fillStyle = 'rgba(38,166,154,0.04)';
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(chartLeft1, chartTopY, chartW, chartH, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = TEAL;
    ctx.font = 'bold 8px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('ENGINE \u2014 conviction gate \u2192 silent', chartLeft1 + 6, chartTopY + 12);

    // Right chart: operator perspective (took the trade)
    ctx.fillStyle = 'rgba(239,83,80,0.04)';
    ctx.strokeStyle = FAINT;
    ctx.beginPath();
    ctx.roundRect(chartLeft2, chartTopY, chartW, chartH, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = MAGENTA;
    ctx.font = 'bold 8px Inter, sans-serif';
    ctx.fillText('OPERATOR — overrode the silence', chartLeft2 + 6, chartTopY + 12);

    // Phase 1: draw candles on both charts
    const barsToDraw = Math.min(numBars, Math.floor(ct / (p1End / numBars)));
    for (let i = 0; i < barsToDraw; i++) {
      const cx1 = chartLeft1 + i * barW + barW / 2;
      const cx2 = chartLeft2 + i * barW + barW / 2;
      const cy = baselineY - candles[i] * 5;
      const isStop = i === 13 && ct > p2End;

      // Bull/bear coloring
      const prev = i > 0 ? candles[i - 1] : 0;
      const curr = candles[i];
      const bull = curr >= prev;
      const color = bull ? 'rgba(38,166,154,0.6)' : 'rgba(239,83,80,0.6)';

      ctx.fillStyle = color;
      ctx.fillRect(cx1 - 2, cy - 6, 4, 12);
      ctx.fillRect(cx2 - 2, cy - 6, 4, 12);
    }

    // Phase 2: operator entry arrow on right chart at bar 8
    if (ct > p1End + 0.5) {
      const fade = Math.min(1, (ct - p1End - 0.5) / 0.4);
      const cx = chartLeft2 + 7 * barW + barW / 2;
      const cy = baselineY - candles[7] * 5;
      ctx.fillStyle = `rgba(239,83,80,${fade})`;
      ctx.beginPath();
      ctx.moveTo(cx, cy + 16);
      ctx.lineTo(cx - 5, cy + 24);
      ctx.lineTo(cx + 5, cy + 24);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = `rgba(239,83,80,${fade * 0.8})`;
      ctx.font = 'bold 7px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('OVERRIDE LONG', cx, cy + 34);
    }

    // Phase 3: stop-out at bar 13 on right
    if (ct > p2End) {
      const fade = Math.min(1, (ct - p2End) / 0.4);
      const cx = chartLeft2 + 13 * barW + barW / 2;
      const cy = baselineY - candles[13] * 5;
      ctx.strokeStyle = `rgba(255,23,68,${fade})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 5, cy - 5);
      ctx.lineTo(cx + 5, cy + 5);
      ctx.moveTo(cx + 5, cy - 5);
      ctx.lineTo(cx - 5, cy + 5);
      ctx.stroke();
      ctx.fillStyle = `rgba(255,23,68,${fade})`;
      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('-1R STOP-OUT', cx, cy + 18);
    }

    // Phase 4: aggregate across 20 overrides bar chart
    const aggregateTop = chartTopY + chartH + 18;
    const aggregateH = h - aggregateTop - 26;
    if (ct > p3End - 0.5) {
      const fade = Math.min(1, (ct - p3End + 0.5) / 1.0);
      ctx.globalAlpha = fade;

      ctx.fillStyle = `rgba(255,179,0,${0.06})`;
      ctx.strokeStyle = FAINT;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(chartLeft1, aggregateTop, w - 48, aggregateH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = AMBER;
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('20-OVERRIDE AGGREGATE', chartLeft1 + 8, aggregateTop + 12);

      // 20 result bars — biased negative (this is the override base rate)
      const aggregateBarW = (w - 80) / 20;
      const aggregateMidY = aggregateTop + aggregateH * 0.6;
      const results = [-1, 0.5, -1, -1, -0.3, -1, 0.8, -1, -1, 0.2, -1, -0.5, -1, 0.6, -1, -1, -0.1, -1, 0.4, -1];
      for (let i = 0; i < 20; i++) {
        const bx = chartLeft1 + 8 + i * aggregateBarW;
        const r = results[i];
        const barH = Math.abs(r) * 14;
        const by = r >= 0 ? aggregateMidY - barH : aggregateMidY;
        ctx.fillStyle = r >= 0 ? 'rgba(38,166,154,0.5)' : 'rgba(239,83,80,0.6)';
        ctx.fillRect(bx, by, aggregateBarW - 2, barH);
      }
      // Zero line
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(chartLeft1 + 8, aggregateMidY);
      ctx.lineTo(w - 32, aggregateMidY);
      ctx.stroke();

      // Sum label on right
      ctx.fillStyle = '#FF1744';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('Σ = -14.3R', w - 32, aggregateTop + 12);

      ctx.globalAlpha = 1;
    }

    // Bottom caption
    ctx.fillStyle = DIM;
    ctx.font = '8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Every override is a single discipline failure \u2014 engine silent, operator entered. Multiply by 20.', w / 2, h - 8);
  }, []);

  return <AnimScene draw={draw} aspectRatio={1.5} />;
}

// ============================================================
// ANIMATION 12 — PersonalitySwapAnim (S12 Operator Personality Types)
// 6 operator silhouettes in a grid. Each is highlighted in sequence,
// "turning around" to reveal their characteristic discipline failure
// mode on the back.
// 18-second loop (3s per personality × 6).
// ============================================================
function PersonalitySwapAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.18)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    // Title
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SIX OPERATORS — SIX CHARACTERISTIC FAILURES', w / 2, 22);

    type Personality = { name: string; failure: string; symbol: string };
    const personalities: Personality[] = [
      { name: 'FOMO CHASER', failure: 'enters late, after the move', symbol: '⤴' },
      { name: 'REVENGE TRADER', failure: 're-enters same direction after stop', symbol: '↻' },
      { name: 'HERO OVERRIDE', failure: 'overrides engine after a win streak', symbol: '★' },
      { name: 'SIZE CREEPER', failure: 'raises size to recover drawdown', symbol: '↑' },
      { name: 'BAGHOLDER', failure: 'refuses to honour stop-loss', symbol: '⊘' },
      { name: 'SYSTEM SWITCHER', failure: 'jumps strategies every weeks', symbol: '⇋' },
    ];

    const cycleDur = 18;
    const ct = t % cycleDur;
    const perPersonality = cycleDur / personalities.length;
    const activeIdx = Math.floor(ct / perPersonality);
    const localT = (ct % perPersonality) / perPersonality;

    // 2x3 grid
    const cellW = (w - 60) / 3;
    const cellH = (h - 70) / 2;
    const startX = 30;
    const startY = 44;

    for (let i = 0; i < personalities.length; i++) {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const cx = startX + col * cellW + cellW / 2;
      const cy = startY + row * cellH + cellH / 2;
      const isActive = i === activeIdx;
      const p = personalities[i];

      // Card background
      ctx.fillStyle = isActive ? 'rgba(255,179,0,0.08)' : 'rgba(255,255,255,0.02)';
      ctx.strokeStyle = isActive ? AMBER : FAINT;
      ctx.lineWidth = isActive ? 1.5 : 1;
      ctx.beginPath();
      ctx.roundRect(cx - cellW / 2 + 6, cy - cellH / 2 + 6, cellW - 12, cellH - 12, 6);
      ctx.fill();
      ctx.stroke();

      // Flip transformation when active
      let flipScale = 1;
      let showBack = false;
      if (isActive) {
        if (localT < 0.4) {
          flipScale = 1 - localT / 0.4 * 2; // flip to back
          if (localT > 0.2) showBack = true;
        } else if (localT < 0.85) {
          flipScale = -1 + (0.85 - localT) / 0.45; // back of card (negative scale = flipped)
          showBack = true;
        } else {
          flipScale = (localT - 0.85) / 0.15 * 2 - 1; // flip back to front
          showBack = false;
        }
      }

      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(Math.abs(flipScale) === 0 ? 0.001 : Math.abs(flipScale), 1);

      if (!showBack) {
        // Front: silhouette + name
        ctx.fillStyle = isActive ? AMBER : DIM;
        ctx.font = 'bold 18px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(p.symbol, 0, -4);
        ctx.font = 'bold 8px Inter, sans-serif';
        ctx.fillStyle = isActive ? WHITE : DIM;
        ctx.fillText(p.name, 0, 12);
      } else {
        // Back: failure reveal
        ctx.fillStyle = MAGENTA;
        ctx.font = 'bold 7px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('FAILURE MODE', 0, -16);

        // Word-wrap the failure text
        const words = p.failure.split(' ');
        let line = '';
        let ly = -2;
        for (const word of words) {
          const test = line + word + ' ';
          if (ctx.measureText(test).width > cellW - 24 && line.length > 0) {
            ctx.fillStyle = WHITE;
            ctx.font = 'bold 8px Inter, sans-serif';
            ctx.fillText(line, 0, ly);
            line = word + ' ';
            ly += 11;
          } else {
            line = test;
          }
        }
        ctx.fillStyle = WHITE;
        ctx.font = 'bold 8px Inter, sans-serif';
        ctx.fillText(line, 0, ly);
      }

      ctx.restore();
    }

    // Bottom caption
    ctx.fillStyle = DIM;
    ctx.font = '8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Identify your archetype. The failure mode is your specific discipline weak point.', w / 2, h - 12);
  }, []);

  return <AnimScene draw={draw} aspectRatio={1.7} />;
}

// ============================================================
// ANIMATION 13 — FailureCascadeAnim (S13 The 5-Stage Cascade)
// 5 nodes in a chain. The signal travels through each stage:
// OVERRIDE → SIZE CREEP → DRAWDOWN → REVENGE → BLOW-UP.
// Equity curve plummets below as each stage activates.
// 12-second loop.
// ============================================================
function FailureCascadeAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';
    const RED = '#FF1744';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.18)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    // Title
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE FAILURE CASCADE — FIVE STAGES TO A BLOW-UP', w / 2, 22);

    const cycleDur = 12;
    const ct = t % cycleDur;

    const stages = [
      { name: 'OVERRIDE', detail: 'sub-threshold signal taken', color: AMBER, equity: -1 },
      { name: 'SIZE CREEP', detail: 'sized up to "recover"', color: AMBER, equity: -3 },
      { name: 'DRAWDOWN', detail: 'losing patch hits', color: MAGENTA, equity: -6 },
      { name: 'REVENGE', detail: 'doubled to "earn it back"', color: MAGENTA, equity: -10 },
      { name: 'BLOW-UP', detail: 'circuit failed; account hit', color: RED, equity: -15 },
    ];

    // Layout: 5 nodes horizontally
    const nodeY = h * 0.32;
    const nodeR = Math.min(h * 0.08, 24);
    const nodeSpacingX = (w - 80) / 4;
    const startX = 40 + nodeR;

    // Draw connecting lines first (under nodes)
    for (let i = 0; i < stages.length - 1; i++) {
      const x1 = startX + i * nodeSpacingX;
      const x2 = startX + (i + 1) * nodeSpacingX;
      const activeAtT = (i + 1) * 1.5;
      const lineActive = ct >= activeAtT - 0.3;
      ctx.strokeStyle = lineActive ? MAGENTA : FAINT;
      ctx.lineWidth = lineActive ? 2 : 1;
      if (!lineActive) ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(x1 + nodeR, nodeY);
      ctx.lineTo(x2 - nodeR, nodeY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw nodes
    for (let i = 0; i < stages.length; i++) {
      const x = startX + i * nodeSpacingX;
      const stage = stages[i];
      const activeAtT = i * 1.5 + 0.5;
      const isActive = ct >= activeAtT;
      const justActivated = ct >= activeAtT && ct < activeAtT + 0.4;

      // Pulse if just activated
      if (justActivated) {
        const pulseT = (ct - activeAtT) / 0.4;
        ctx.strokeStyle = `rgba(${stage.color === RED ? '255,23,68' : stage.color === MAGENTA ? '239,83,80' : '255,179,0'},${1 - pulseT})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, nodeY, nodeR + pulseT * 15, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Node
      ctx.fillStyle = isActive ? `rgba(${stage.color === RED ? '255,23,68' : stage.color === MAGENTA ? '239,83,80' : '255,179,0'},0.25)` : 'rgba(255,255,255,0.04)';
      ctx.strokeStyle = isActive ? stage.color : FAINT;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, nodeY, nodeR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Stage number
      ctx.fillStyle = isActive ? stage.color : DIM;
      ctx.font = 'bold 13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(i + 1), x, nodeY + 5);

      // Stage label (always visible)
      ctx.fillStyle = isActive ? stage.color : DIM;
      ctx.font = isActive ? 'bold 8px Inter, sans-serif' : '7px Inter, sans-serif';
      ctx.fillText(stage.name, x, nodeY + nodeR + 14);

      // Detail (appears with the node activation)
      if (isActive) {
        const fade = Math.min(1, (ct - activeAtT) / 0.5);
        ctx.fillStyle = `rgba(255,255,255,${0.5 * fade})`;
        ctx.font = '7px Inter, sans-serif';
        ctx.fillText(stage.detail, x, nodeY + nodeR + 26);
      }
    }

    // ── Equity curve plummeting below ──
    const eqTop = h * 0.6;
    const eqH = h * 0.32;
    const eqLeft = 40;
    const eqW = w - 80;
    const eqMinY = eqTop + eqH;
    const eqMaxY = eqTop;
    const eqMaxEquity = 0;
    const eqMinEquity = -15;

    // Background
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(eqLeft, eqTop, eqW, eqH, 4);
    ctx.fill();
    ctx.stroke();

    // Zero line
    const zeroEqY = eqMinY - ((0 - eqMinEquity) / (eqMaxEquity - eqMinEquity)) * eqH;
    ctx.strokeStyle = FAINT;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(eqLeft, zeroEqY);
    ctx.lineTo(eqLeft + eqW, zeroEqY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Plot equity curve through cascade stages
    const curvePoints: { x: number; y: number }[] = [{ x: eqLeft + 4, y: zeroEqY }];
    for (let i = 0; i < stages.length; i++) {
      const stageT = i * 1.5 + 0.5;
      if (ct < stageT) break;
      const stage = stages[i];
      const px = eqLeft + 4 + (i + 1) * (eqW / (stages.length + 1));
      const py = eqMinY - ((stage.equity - eqMinEquity) / (eqMaxEquity - eqMinEquity)) * eqH;
      curvePoints.push({ x: px, y: py });
    }

    if (curvePoints.length > 1) {
      ctx.strokeStyle = curvePoints.length >= 5 ? RED : MAGENTA;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(curvePoints[0].x, curvePoints[0].y);
      for (let i = 1; i < curvePoints.length; i++) {
        ctx.lineTo(curvePoints[i].x, curvePoints[i].y);
      }
      ctx.stroke();

      // Fill area
      ctx.lineTo(curvePoints[curvePoints.length - 1].x, zeroEqY);
      ctx.lineTo(curvePoints[0].x, zeroEqY);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, zeroEqY, 0, eqMinY);
      grad.addColorStop(0, 'rgba(239,83,80,0)');
      grad.addColorStop(1, 'rgba(255,23,68,0.3)');
      ctx.fillStyle = grad;
      ctx.fill();

      // End marker
      const last = curvePoints[curvePoints.length - 1];
      ctx.fillStyle = curvePoints.length >= 5 ? RED : MAGENTA;
      ctx.beginPath();
      ctx.arc(last.x, last.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Equity readout
    if (ct > 0.5) {
      const currentEquity = curvePoints[curvePoints.length - 1]?.y === zeroEqY ? 0 : stages[Math.max(0, curvePoints.length - 2)]?.equity || 0;
      ctx.fillStyle = currentEquity <= -10 ? RED : MAGENTA;
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${currentEquity}R cumulative`, eqLeft + eqW - 8, eqTop + 16);
    }

    // Bottom caption
    ctx.fillStyle = DIM;
    ctx.font = '8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Stage 1 is preventable. Stage 5 ends accounts. Discipline breaks the chain at Stage 1.', w / 2, h - 10);
  }, []);

  return <AnimScene draw={draw} aspectRatio={1.6} />;
}

// ============================================================
// MAIN LESSON COMPONENT
// ============================================================
// Phase 1: scaffold + hero + S00 (Groundbreaking Concept)
// Phase 2A: S01-S08 (the equation, skip pile, pyramid, Pine-encoded discipline, pre/mid-session)
// Phase 2B: S09-S15 (journal, 30-session loop, override doctrine, personalities, cascade, asset class, 30-day test)
// Phase 3A: mistakes + cheat sheet + quiz data wiring
// Phase 3B: game UI + quiz UI + cert reveal + footer
// ============================================================
export default function CipherTradingDisciplineLesson() {
  const [scrollY, setScrollY] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameRound, setGameRound] = useState(0);
  const [gameSelections, setGameSelections] = useState<(string | null)[]>(new Array(gameRounds.length).fill(null));
  const [quizAnswers, setQuizAnswers] = useState<(string | null)[]>(new Array(quizQuestions.length).fill(null));
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [certRevealed, setCertRevealed] = useState(false);
  const [certId] = useState(() => `PRO-CERT-L11.25-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);

  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  const quizScore = quizAnswers.filter((ans, i) => {
    if (!quizQuestions[i]) return false;
    const correct = quizQuestions[i].options.find((o) => o.correct)?.id;
    return ans === correct;
  }).length;
  const quizPercent = quizQuestions.length > 0 ? Math.round((quizScore / quizQuestions.length) * 100) : 0;
  const quizPassed = quizPercent >= 66;

  useEffect(() => {
    if (quizPassed && quizSubmitted && !certRevealed) {
      const timer = setTimeout(() => {
        setCertRevealed(true);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [quizPassed, quizSubmitted, certRevealed]);

  const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } };

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      <Confetti active={showConfetti} />
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-900/50">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-500 to-accent-500"
          style={{ width: `${Math.min((scrollY / (typeof document !== 'undefined' ? document.body.scrollHeight - window.innerHeight : 1)) * 100, 100)}%` }}
        />
      </div>
      <nav className="fixed top-1 left-0 right-0 z-40 flex items-center justify-between px-5 py-2.5">
        <Link href="/academy" className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-amber-400 to-accent-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>ATLAS ACADEMY</Link>
        <div className="flex items-center gap-2">
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-bold text-amber-400">PRO &middot; LEVEL 11</span>
        </div>
      </nav>

      {/* === HERO === */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6 pt-20">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(245,158,11,0.08),transparent_70%)] pointer-events-none" />
        <div className="absolute top-[-50px] right-[20%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(217,70,239,0.05),transparent_70%)] pointer-events-none" />
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.15 } } }} className="relative z-10">
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 11 &middot; Lesson 25</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Cipher Trading Discipline<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Discipline Is a Boolean</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">Every signal you trade is the output of <strong className="text-amber-400">engine AND discipline</strong>. CIPHER encodes its half in Pine. Your half is the equation in human form &mdash; the configurations you set, the trades you don&apos;t take, the trades you don&apos;t re-take.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5">
            <span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span>
            <div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" />
          </motion.div>
        </motion.div>
      </section>

      {/* === S00 — First, Why This Matters (Groundbreaking Concept) === */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">Two operators. Same CIPHER. Different P&amp;L.</p>
            <p className="text-gray-400 leading-relaxed mb-4">Operator A and Operator B both use CIPHER PRO. Same indicators, same engine, same charts. They see the same Pulse line, the same Risk Envelope bands, the same conviction labels. Over 30 sessions they take roughly the same signals. <strong className="text-white">A finishes the month +12R. B finishes the month -8R.</strong></p>
            <p className="text-gray-400 leading-relaxed mb-4">The engine fired correctly for both. The chart was identical for both. <strong className="text-amber-400">The difference is not what they saw &mdash; it is what they did with what they saw.</strong> A skipped 5 of every 8 signals. B took all 8. A logged every skipped trade. B logged only winners. A had a circuit breaker after -3R weeks. B doubled size on Mondays after losing Fridays. A executed the framework mechanically. B overrode the framework whenever the chart "felt different."</p>
            <p className="text-gray-400 leading-relaxed">The edge in CIPHER is not visible in any candle. It lives in the <strong className="text-white">boolean equation</strong> that runs above the engine &mdash; the AND-gate between what the indicator says and what the operator does. This is the lesson where that equation becomes mechanical.</p>
          </div>
          <BooleanEquationAnim />
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4 mt-6">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE GROUNDBREAKING CONCEPT</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">Discipline is a boolean &mdash; yours or the engine&apos;s.</strong> Every signal you trade is the output of <strong className="text-amber-400">engine correctness AND operator discipline</strong>. CIPHER&apos;s half is encoded directly into the engine: the conviction threshold gate, the TS cooldown, the preset philosophies, the filtered-vs-raw signal tracking. Your half is the same equation in human form: <strong className="text-white">which signals you don&apos;t take, when you don&apos;t re-enter, when you don&apos;t override.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE EDGE IS IN THE SKIP PILE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Of every 8 signals CIPHER fires, the strongest operators trade <strong className="text-white">roughly 3</strong> and skip <strong className="text-white">roughly 5</strong>. The engine fires correctly. The 5 skips are the discipline filter doing its job. Trying to trade all 8 is not aggression &mdash; it is a discipline failure. Trying to trade fewer than 3 is not patience &mdash; it is over-filtering. The 3/5 ratio is the target you build the rest of this lesson around.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#11088; THE DISCIPLINE OPERATOR PROMISE</p>
            <p className="text-sm text-gray-400 leading-relaxed">By the end of this lesson, you will know the <strong className="text-white">four-layer discipline pyramid</strong> (Process, Plan, Execution, Review), the <strong className="text-white">three encoded discipline mechanisms</strong> (the conviction threshold, the TS cooldown, the preset philosophies) and their behavioural mirrors, the <strong className="text-white">5-stage failure cascade</strong> that ends accounts, the <strong className="text-white">override doctrine</strong> that protects deterministic edge, the <strong className="text-white">six operator personalities</strong> and their characteristic failures, and the <strong className="text-white">30-day discipline test</strong> that proves you can run the framework mechanically. You stop trading the market and start trading the discipline.</p>
          </div>
        </motion.div>
      </section>

      {/* === S01 — The Equation === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Equation</p>
          <h2 className="text-2xl font-extrabold mb-4">Signal Equals Engine AND Discipline</h2>
          <p className="text-gray-400 leading-relaxed mb-6">CIPHER&apos;s edge is not in the indicator alone. It lives in the boolean equation that runs above the engine on every signal. <strong className="text-amber-400">Signal = engine correctness AND operator discipline.</strong> Both gates must pass. Engine alone fires too many signals to be a strategy. Discipline alone has nothing to filter. The pair is the product.</p>
          <PineGateFireAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the animation. Scenario 1: four conviction factors check sequentially. Three pass &mdash; <strong className="text-white">conviction score = 3</strong>. The boolean evaluates <strong className="text-amber-400">3 &ge; 3 &rarr; TRUE</strong>. The PX LONG label fires. Scenario 2: only two factors pass &mdash; <strong className="text-white">conviction score = 2</strong>. The boolean evaluates <strong className="text-amber-400">2 &ge; 3 &rarr; FALSE</strong>. The signal is silent. The engine did its job. The discipline gate did its job. No trade, no override.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE ENGINE HALF</p>
              <p className="text-sm text-gray-400 leading-relaxed">CIPHER&apos;s side of the equation is locked in the engine: <strong className="text-white">Gate 1 body filter</strong>, <strong className="text-white">Gate 2 pre-cross distance</strong>, <strong className="text-white">Gate 3 chop suppression</strong>, <strong className="text-white">Gate 4 failed-flip override</strong>, plus the four conviction factors (Ribbon stack, ADX&gt;20, Volume&gt;1×, Momentum&gt;50%). The mechanics are deterministic. You can trust the gates to fire correctly.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE DISCIPLINE HALF</p>
              <p className="text-sm text-gray-400 leading-relaxed">Your side of the equation is the configuration you set (preset, signal type, Strong Signals Only toggle) PLUS the behaviour you bring to qualified signals (sizing, skip discipline, override discipline, journaling). The engine half is deterministic. <strong className="text-white">Your half is where the variance lives.</strong> Two operators with identical engine output and different discipline produce different account curves.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE AND-GATE IS NON-NEGOTIABLE</p>
              <p className="text-sm text-gray-400 leading-relaxed">A signal that meets the engine half but fails the discipline half is not a half-trade &mdash; it is a discipline violation. There is no "75% disciplined trade" because boolean AND has no fractional state. You either honour the configuration you chose, or you did not. The lesson reframe: <strong className="text-white">missing the signal is not the failure. Taking a signal that failed your discipline gate is the failure.</strong></p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S02 — The Skip Pile, Quantified === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Skip Pile, Quantified</p>
          <h2 className="text-2xl font-extrabold mb-4">Three Trades. Five Skips. Eight Fires.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Lesson 11.13 introduced the ratio. This lesson makes it mechanical. <strong className="text-amber-400">Of every 8 signals CIPHER fires, the strongest operators trade roughly 3 and skip roughly 5.</strong> Not because the 5 are bad signals &mdash; they passed the engine&apos;s gates. They get skipped because they fail the operator&apos;s gate. The skip pile is where the discipline edge lives.</p>
          <SkipPileAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Eight signals fire from the left. Three pass the operator filter and reach the trade pile. Five fall away, each for a specific reason: conviction below threshold, news window, regime mismatch, re-entry within cooldown, position cap reached. <strong className="text-white">None of these are "missed trades."</strong> Each is the discipline framework doing exactly what it was built to do.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE FIVE CATEGORIES OF SKIP</p>
              <p className="text-sm text-gray-400 leading-relaxed mb-2">Every skip lands in one of five categories. Memorise them &mdash; they are the operator filter:</p>
              <ul className="text-sm text-gray-400 leading-relaxed space-y-1.5 ml-4">
                <li><strong className="text-white">1. Conviction skip.</strong> Signal printed but conviction is below your chosen threshold. The engine&apos;s own filter is wider than your preset; either enable Strong Signals Only or skip manually.</li>
                <li><strong className="text-white">2. Regime skip.</strong> Signal type does not fit the active regime. PX continuation in VOLATILE, TS reversal in STRONG TREND, anything in regime transition.</li>
                <li><strong className="text-white">3. Structure skip.</strong> Fresh counter-FVG, untested liquidity ahead, choppy Pulse flag set, no clear room to target.</li>
                <li><strong className="text-white">4. Context skip.</strong> News window (±30m around high-impact), session boundary (London/NY open first 30m), thin-liquidity Asia.</li>
                <li><strong className="text-white">5. Personal skip.</strong> Drawdown circuit triggered, position cap reached, same-direction cooldown active, bad-day rule fired.</li>
              </ul>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHY THE RATIO IS 3 / 5, NOT 5 / 3 OR 7 / 1</p>
              <p className="text-sm text-gray-400 leading-relaxed">The ratio is empirical, not aspirational. Operators who trade 5+ of 8 over-engage and bleed into the variance. Operators who trade 1 of 8 are not patient &mdash; they are over-filtering and missing the edge. The 3 / 5 split is the sweet spot where frequency and quality balance. <strong className="text-white">Track your own ratio at the 30-session mark.</strong> If you are at 6/8, your filters are too loose. If you are at 1/8, your filters are choking the framework.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SKIPS ARE LOGGED AT EQUAL PRIORITY TO TRADES</p>
              <p className="text-sm text-gray-400 leading-relaxed">A skip is a decision, not an absence. Every skip you make produces useful data: which rule triggered it, what happened next on the chart, whether the skip was positive-EV in hindsight. <strong className="text-white">Without the skip log you cannot audit your filter quality.</strong> Section 9 covers the journaling protocol for both takes and skips.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S03 — The Discipline Pyramid === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The Discipline Pyramid</p>
          <h2 className="text-2xl font-extrabold mb-4">Process. Plan. Execution. Review.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Discipline is not a single skill. It is a four-layer structure that compounds. Each layer supports the one above. Skip a layer and the structure becomes unstable &mdash; the layers above start producing inconsistent output because their foundation is missing.</p>
          <DisciplinePyramidAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">The pyramid builds bottom-up. Each tier is stress-tested as it appears &mdash; the impact dot tries to crack it. A disciplined operator&apos;s pyramid holds because each layer was built deliberately. An undisciplined operator&apos;s pyramid is missing tiers &mdash; usually Process and Review, the unglamorous bookend layers.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">TIER 1 &mdash; PROCESS (THE FOUNDATION)</p>
              <p className="text-sm text-gray-400 leading-relaxed">Process is how you study, prepare, and calibrate between sessions. The lessons you review. The framework documentation you re-read. The chart replays you walk through. The journal entries from previous weeks you scan for patterns. Process is the only tier that does not happen during the trading day &mdash; and it is the foundation of everything that does. <strong className="text-white">Without Process you have no calibration loop.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">TIER 2 &mdash; PLAN (THE BENCHMARK)</p>
              <p className="text-sm text-gray-400 leading-relaxed">Plan is the specific plan for the upcoming session. Which preset is active. Which assets are in scope. Which timeframes you will trade. What today&apos;s high-impact news events are. What your drawdown circuit status is. The plan is the benchmark you measure execution against in the review. <strong className="text-white">Without Plan you cannot review &mdash; there is no benchmark to compare against.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">TIER 3 &mdash; EXECUTION (THE LIVE WORK)</p>
              <p className="text-sm text-gray-400 leading-relaxed">Execution is the live trading day. Signals firing, decisions made, trades opened, scaled, closed. This is the tier most operators focus 90% of their attention on &mdash; and the tier that produces the most variance per minute of investment. The reason execution is Tier 3, not Tier 1, is that <strong className="text-white">good execution is impossible without the two tiers beneath it.</strong> If Process is missing, you have no calibration to execute against. If Plan is missing, you have no benchmark.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">TIER 4 &mdash; REVIEW (THE FEEDBACK)</p>
              <p className="text-sm text-gray-400 leading-relaxed">Review is the post-session reckoning. P&amp;L recap is the easy part &mdash; the hard part is protocol adherence (did you execute the plan?) and pattern observation (which setups paid this session, which did not?). Review feeds Process for the next cycle. <strong className="text-white">Without Review you cannot learn. The same mistakes recur because no mechanism is extracting them into Process improvements.</strong></p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#11088; THE PYRAMID DIAGNOSTIC</p>
            <p className="text-sm text-gray-400 leading-relaxed">Honest self-audit. Rate each layer 0-10 for the last 30 sessions. A consistent operator scores roughly 7-7-7-7. A struggling operator usually has 2-3-9-1 (no process, weak plan, all-execution, no review) &mdash; the classic "I just want to trade" pattern. <strong className="text-white">The lowest layer is the one to fix first.</strong> A 10/10 execution does not compound when sitting on a 2/10 process.</p>
          </div>
        </motion.div>
      </section>

      {/* === S04 — Encoded Discipline #1: The Conviction Threshold === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Encoded Discipline #1</p>
          <h2 className="text-2xl font-extrabold mb-4">The Conviction Threshold &mdash; The First Gate</h2>
          <p className="text-gray-400 leading-relaxed mb-6">CIPHER&apos;s first encoded discipline mechanism is the conviction threshold. <strong className="text-amber-400">A single number, set once per session by your preset choice.</strong> It defines the score every signal must clear before printing on your chart. Set it, and the entire conviction discipline becomes mechanical.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-2">THE GATE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Every potential signal that survives CIPHER&apos;s upstream engines (Pulse Cross or Tension Snap, plus the four-gate pipeline from L11.11) must then pass one more check before its label prints: <strong className="text-white">the conviction score must equal or exceed your chosen threshold.</strong> If it does, the label prints, the Last Signal row updates, the trade is in play. If it doesn&apos;t, the engine stays silent &mdash; no label, no entry, no row update. Same potential signal, different outcome, decided by a single threshold you set.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">HOW THE THRESHOLD IS SET</p>
              <p className="text-sm text-gray-400 leading-relaxed mb-2">Two legitimate paths configure this discipline:</p>
              <ul className="text-sm text-gray-400 leading-relaxed space-y-1.5 ml-4">
                <li><strong className="text-white">Via Preset.</strong> Swing Trader and Sniper presets force the threshold to 3-out-of-4. Trend Trader, Scalper, Reversal, and Structure leave it at zero (every qualified signal prints).</li>
                <li><strong className="text-white">Via Strong Signals Only toggle.</strong> When no preset is active (None), the manual Strong Signals Only switch in the inputs decides. ON = threshold 3, OFF = threshold 0.</li>
              </ul>
              <p className="text-sm text-gray-400 leading-relaxed mt-3">Both routes lead to the same gate. Whatever the threshold evaluates to is the bar every signal must beat. <strong className="text-white">Nothing else in CIPHER overrides this.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">THE FOUR CONVICTION FACTORS</p>
              <p className="text-sm text-gray-400 leading-relaxed mb-2">The conviction score (and its bearish counterpart) sums four binary factors:</p>
              <ul className="text-sm text-gray-400 leading-relaxed space-y-1.5 ml-4">
                <li><strong className="text-white">F1 &middot; Ribbon stacked with signal direction.</strong> The trend engine agrees with the signal.</li>
                <li><strong className="text-white">F2 &middot; ADX &gt; 20.</strong> Trend strength threshold &mdash; sub-20 ADX = no-trend conditions.</li>
                <li><strong className="text-white">F3 &middot; Volume &gt; 1.0&times; average.</strong> Participation is at or above baseline.</li>
                <li><strong className="text-white">F4 &middot; Momentum health &gt; 50%.</strong> The composite health score is above midpoint.</li>
              </ul>
              <p className="text-sm text-gray-400 leading-relaxed mt-3">Each factor is binary &mdash; satisfied or not. Conviction is the sum: 0, 1, 2, 3, or 4. <strong className="text-white">A &quot;3/4 Strong&quot; signal has any three of the four; a &quot;Full Strong 4/4&quot; has all four.</strong> Below the threshold the signal is filtered &mdash; silent on chart but tracked internally so the engine&apos;s diagnostic and failed-flip logic still works (per L11.11).</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">THE OPERATOR&apos;S CHOICE</p>
              <p className="text-sm text-gray-400 leading-relaxed">You have two legitimate ways to configure this discipline: pick a preset that encodes it (Swing Trader or Sniper) or run None and toggle Strong Signals Only manually. <strong className="text-white">The illegitimate path is to leave the threshold at zero and decide which signals are &quot;really strong&quot; by feel.</strong> Strong Signals Only is the mechanical version of that feel; the threshold is the gate that enforces it. Use the gate, not the feel.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S05 — Encoded Discipline #2: The Cooldown (★) === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Encoded Discipline #2 &middot; &#9733; the cooldown clock</p>
          <h2 className="text-2xl font-extrabold mb-4">The TS Cooldown &mdash; CIPHER&apos;s Built-in Anti-Spam</h2>
          <p className="text-gray-400 leading-relaxed mb-6">PX has no cooldown &mdash; Pulse flips are naturally self-limiting (a flip cannot re-fire until Pulse flips back the other way and then back again). TS is different. Tension can repeatedly snap at the same level within minutes. <strong className="text-amber-400">If left unfiltered, TS would spam signals during choppy reversals.</strong> CIPHER fixes this with an explicit cooldown.</p>
          <TSCooldownClockAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the clock. A TS LONG fires at bar 0 &mdash; clean signal, teal arrow. Three bars later, the engine wants to fire another TS LONG at the same direction. <strong className="text-white">The cooldown blocks it.</strong> Magenta &times; marks the ghost signal that would have printed without the discipline gate. At bar 9, cooldown completes; the next qualified TS LONG fires successfully.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-2">HOW THE COOLDOWN WORKS</p>
              <p className="text-sm text-gray-400 leading-relaxed">After every TS LONG fires, the engine starts a counter for the LONG direction. Until that counter elapses, no second TS LONG will print on your chart, even if the conditions to fire one are met. <strong className="text-white">The cooldown is direction-specific</strong> &mdash; an opposite-direction TS SHORT can still fire during the lockout, because clustered SAME-direction TS at the same level is what carries negative expected value. The block isn&apos;t about pace; it&apos;s about preventing the engine from re-confirming itself on the same liquidity event.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">TIMEFRAME ROUTING</p>
              <p className="text-sm text-gray-400 leading-relaxed">The cooldown length adapts to your timeframe. Scalp/intra timeframes (1m, 5m) get a tighter window of <strong className="text-white">8 bars</strong>. Retail timeframes (15m, 1H) get a longer window of <strong className="text-white">12 bars</strong>. Higher TFs (4H+) revert to 8 because each of those bars already carries more weight individually. <strong className="text-white">Each bar is a unit of confirmation that the prior snap is not just clustering at the same level.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">THE OPERATOR MIRROR &mdash; A PERSONAL COOLDOWN</p>
              <p className="text-sm text-gray-400 leading-relaxed">The engine&apos;s cooldown teaches the behavioural rule. After ANY stop-out, the same-direction same-level re-entry within 30-90 minutes is the highest-base-rate losing pattern in the data. <strong className="text-white">Operate a personal cooldown identical in spirit to the engine&apos;s</strong>:</p>
              <ul className="text-sm text-gray-400 leading-relaxed space-y-1.5 ml-4 mt-2">
                <li><strong className="text-white">30 minutes</strong> after any stop-out on the same asset, regardless of direction</li>
                <li><strong className="text-white">8-12 bars</strong> on the timeframe you trade before re-engaging the same direction at the same level</li>
                <li><strong className="text-white">Full session lockout</strong> after two stop-outs in the same direction on the same asset</li>
              </ul>
              <p className="text-sm text-gray-400 leading-relaxed mt-3">The engine knew. Now you know. <strong className="text-white">Mirror the engine.</strong></p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S06 — Encoded Discipline #3: Preset Philosophy Ring (★★) === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Encoded Discipline #3 &middot; &#9733;&#9733; the philosophy ring</p>
          <h2 className="text-2xl font-extrabold mb-4">Presets &mdash; Discipline Philosophies in a Single Choice</h2>
          <p className="text-gray-400 leading-relaxed mb-6">CIPHER&apos;s third encoded discipline mechanism is the preset system. Each preset is not a visual configuration &mdash; it is a <strong className="text-amber-400">complete discipline philosophy</strong>, bundling conviction threshold, signal-engine width, and the visual layers most relevant to that trading style. Pick the preset whose philosophy matches your personality, and the engine enforces the discipline you would otherwise have to manually maintain.</p>
          <PresetPhilosophyRingAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the ring. Each of the six presets activates in turn. <strong className="text-white">Below the ring, the configuration reshapes:</strong> conviction threshold switches between zero and 3-out-of-4, the signal engine width shifts between tight (Scalper) and widest (Sniper), the active visual-layer badges change, the personality archetype updates, and the one-line philosophy summarises what the preset enforces.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-2">THE SIX PHILOSOPHIES</p>
              <p className="text-sm text-gray-400 leading-relaxed mb-2">Each preset defines its discipline in a single sentence:</p>
              <ul className="text-sm text-gray-400 leading-relaxed space-y-1.5 ml-4">
                <li><strong className="text-white">TREND TRADER</strong> &middot; <em>Many trades, default signal width, follow the stack. Threshold zero.</em></li>
                <li><strong className="text-white">SCALPER</strong> &middot; <em>High frequency, tight signal engine, scalp from levels. Threshold zero.</em></li>
                <li><strong className="text-white">SWING TRADER</strong> &middot; <em>Few trades, wide signal engine, Strong-only enforced. Threshold 3-of-4.</em></li>
                <li><strong className="text-white">REVERSAL</strong> &middot; <em>Tension over trend, mean-reversion bias. Threshold zero.</em></li>
                <li><strong className="text-white">SNIPER</strong> &middot; <em>Apex predator: few, only the best, widest waiting window. Threshold 3-of-4.</em></li>
                <li><strong className="text-white">STRUCTURE</strong> &middot; <em>No signals printed &mdash; pure chart reading. Threshold zero.</em></li>
              </ul>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">PICK THE PHILOSOPHY THAT MATCHES YOUR PERSONALITY</p>
              <p className="text-sm text-gray-400 leading-relaxed">If you are restless and want frequent engagement, Scalper or Trend Trader. If you have patience and want low-frequency high-conviction setups, Swing Trader or Sniper. If you want to fade extremes, Reversal. If you want to learn the chart without the temptation to take signals, Structure. <strong className="text-white">The preset enforces the discipline that matches the personality.</strong> A Sniper personality forcing themselves to use Scalper will burn out. A Scalper personality forcing Sniper will go insane waiting.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">THE 20-SESSION COMMITMENT</p>
              <p className="text-sm text-gray-400 leading-relaxed">From L11.23: 20 sessions per chosen preset before any switch. <strong className="text-white">Mid-session preset switching is mode-hopping for confirmation</strong> &mdash; the worst discipline failure because it disguises itself as flexibility. If you opened the session as Sniper and signals are not firing, that is the philosophy doing its job, not failing. Switching to Scalper to &quot;find a trade&quot; is breaking the boolean equation in the worst possible way.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">WHEN PRESET SWITCHING IS LEGITIMATE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Between sessions only. After a full session ended and journaled. If pattern P&amp;L attribution at the 30-session mark shows the current preset does not fit your discovered edge, switch to a preset that does. This is parameter tuning via inputs &mdash; the legitimate operator variable. Mid-trade or mid-session switching is not.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S07 — Pre-Session Discipline === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Pre-Session Discipline</p>
          <h2 className="text-2xl font-extrabold mb-4">The 15-Minute Briefing &mdash; Mechanical, Not Ritual</h2>
          <p className="text-gray-400 leading-relaxed mb-6">L11.24 introduced the 15-minute pre-market briefing. This lesson makes it a checklist with kill criteria. <strong className="text-amber-400">Two of the five items can abort the session if they fail.</strong> The discipline is in honouring the kill criteria when they fire &mdash; not in completing the checklist for completeness sake.</p>
          <PreSessionChecklistAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Five items, each scanned in roughly 3 minutes. <strong className="text-white">Two are kill criteria.</strong> If they fail, the session is aborted &mdash; no chart-watching, no "small trade just to stay sharp," no rationalisations. Aborted means closed, walked away, returned tomorrow. The pre-session checklist exists to catch the days when you are not fit to trade BEFORE you take a position.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-2">CHECK 1 &mdash; OVERNIGHT NEWS SCAN</p>
              <p className="text-sm text-gray-400 leading-relaxed">3 minutes. Scan Forex Factory, Investing.com economic calendar, or your news source for the next 24 hours of high-impact events on your scoped assets. Flag any event in the next 6 hours. The output is a mental list of news windows that will gate signals during the session. <strong className="text-white">Not a kill criterion</strong> &mdash; news is information, not a session-aborter.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">CHECK 2 &mdash; WATCHLIST VERIFIED</p>
              <p className="text-sm text-gray-400 leading-relaxed">3 minutes. Open each charted asset. Confirm chart role (Primary, Secondary, Watch, Reference). Confirm CIPHER PRO is loaded with the chosen preset. Confirm HTF/LTF stack is mapped (4H / 1H / 15m / 5m or your equivalent). <strong className="text-white">Not a kill criterion</strong> &mdash; missing assets get re-added or dropped; the session continues.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">CHECK 3 &mdash; ALERTS ACTIVE AND TESTED</p>
              <p className="text-sm text-gray-400 leading-relaxed">3 minutes. Confirm 5-15 active alerts per L11.24 alert architecture (Signal / Level / Volume / Regime categories). Test-fire one alert to confirm delivery is working. <strong className="text-white">Not a kill criterion</strong> &mdash; you can trade without alerts if charts are watched directly, though attention budget halves.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">CHECK 4 &mdash; MENTAL STATE (KILL CRITERION)</p>
              <p className="text-sm text-gray-400 leading-relaxed">2 minutes. Self-audit four dimensions: <strong className="text-white">H</strong>ungry, <strong className="text-white">A</strong>ngry, <strong className="text-white">L</strong>onely, <strong className="text-white">T</strong>ired. Any one of HALT failing is a session-killer per L11.24. The discipline in this check is honest self-assessment. Most operators fail Check 4 by reflexively answering "fine" without actually checking. <strong className="text-white">If you slept &lt;6 hours, or you had a fight 30 minutes ago, or you skipped breakfast, the session is aborted.</strong> Not negotiable.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">CHECK 5 &mdash; DRAWDOWN CIRCUIT (KILL CRITERION)</p>
              <p className="text-sm text-gray-400 leading-relaxed">1 minute. Audit the running drawdown over the last 5 sessions. <strong className="text-white">If at or worse than -3R cumulative, the circuit fires and the session is aborted</strong> regardless of how clean the setups look. Per L11.13 hard skip criteria. This is the rule that prevents -4R weeks from becoming -10R weeks. The fact that today&apos;s setups look great is not relevant &mdash; the circuit was set precisely so that this exact morning&apos;s rationalisation cannot bypass it.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#11088; KILL-CRITERION FAILURE = SESSION ABORTED</p>
            <p className="text-sm text-gray-400 leading-relaxed">When a kill criterion fires, the session ends. <strong className="text-white">Close the platform.</strong> Do not "just watch." Do not "take one small trade to stay sharp." Do not "wait and see how I feel after coffee." The kill criterion was set by past-you precisely so present-you cannot rationalise around it. Honour it without negotiation.</p>
          </div>
        </motion.div>
      </section>

      {/* === S08 — Mid-Session Discipline: The Engage/Wait Decision Tree === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Mid-Session Discipline</p>
          <h2 className="text-2xl font-extrabold mb-4">The 5-Second Triage &mdash; Engage, Wait, or Skip</h2>
          <p className="text-gray-400 leading-relaxed mb-6">L11.22 Conviction Synthesis introduced tier-based sizing. This lesson turns it into a 5-second decision flow. <strong className="text-amber-400">When a signal label prints on your chart, you have roughly 5 seconds to decide what to do with it</strong> before the urgency window degrades to "stale entry." The decision tree below is what you run mechanically in those 5 seconds.</p>
          <MidSessionDecisionTreeAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Three branching checks. A signal travels down. <strong className="text-white">All three must pass for ENGAGE.</strong> One failure routes to WAIT (re-evaluate next signal) or SKIP (definitively no trade). Watch four scenarios: a 4/4 in trending regime engages cleanly; a 3/4 in trend engages with sizing notes; a 2/4 skips on the conviction branch; a 3/4 in VOLATILE skips on the regime branch.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-2">BRANCH 1 &mdash; REGIME FIT</p>
              <p className="text-sm text-gray-400 leading-relaxed">Read the Header row first. TREND regime + PX continuation = pass. RANGE regime + TS reversal = pass. VOLATILE regime + anything = SKIP. Regime transition (FORMING or SHIFTING TO X) = SKIP, regardless of conviction. <strong className="text-white">Regime is the most important filter</strong> because it determines whether the engine&apos;s read is reliable at all in current conditions.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">BRANCH 2 &mdash; STRUCTURE CLEAR</p>
              <p className="text-sm text-gray-400 leading-relaxed">Check three items in 2 seconds: (1) no fresh counter-FVG in your direction, (2) no untested liquidity directly ahead of your target, (3) the Pulse choppy flag (third-most-recent flip within 20 bars) is NOT set. Any failure = SKIP. Structure failures are the most common reason a "clean signal" turns into a stop-out.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">BRANCH 3 &mdash; CONVICTION TIER</p>
              <p className="text-sm text-gray-400 leading-relaxed">Read the conviction count from the signal label or tooltip. <strong className="text-white">4/4 Full Strong</strong> = full size, ENGAGE. <strong className="text-white">3/4 Strong with the &quot;+&quot;</strong> = standard size, ENGAGE. <strong className="text-white">2/4 Standard</strong> = half size, WAIT (only engage if Branches 1 &amp; 2 are exceptionally clean and you are in an active position window). <strong className="text-white">Sub-2</strong> = SKIP (filtered out by the threshold if Strong Signals Only is active, manual skip if not).</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">THE SECONDS MATTER &mdash; WHY MECHANICAL BEATS ANALYTICAL</p>
              <p className="text-sm text-gray-400 leading-relaxed">5 seconds is the budget. Beyond 10 seconds, your entry quality degrades (price has moved, the urgency window passes). Beyond 30 seconds, you are deep into analysis paralysis. <strong className="text-white">The tree is mechanical because mechanical fits the budget.</strong> A signal that requires 30 seconds of analysis is a signal that should not be taken &mdash; the tree exists precisely so the operator never lands there.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">WAIT VS SKIP &mdash; THE DISTINCTION</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">WAIT</strong> = this signal is not engaged, but the asset and direction remain in scope for the next signal. <strong className="text-white">SKIP</strong> = this asset or this setup type is off-limits for the remainder of the session window. WAIT happens often (2/4 conviction in a clean structure window); SKIP happens less often but is more durable (VOLATILE regime active for the whole session, or news ±30m window for the next hour).</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S09 — Post-Session Journal Protocol === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Post-Session Journal Protocol</p>
          <h2 className="text-2xl font-extrabold mb-4">Log Every Trade. Log Every Skip. Same Weight.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The journal is the discipline-audit dataset. Without it you have feel, not evidence. The protocol is mechanical: <strong className="text-amber-400">every taken trade gets a full entry. Every skipped trade gets a parallel entry of equal visual weight.</strong> The skip log is what proves the operator filter is doing positive work.</p>
          <JournalComposerAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the left card fill in &mdash; standard taken-trade fields. Then the right card slides in: <strong className="text-white">SKIPPED TRADE</strong>, same field count, same visual weight, an EQUAL WEIGHT badge made explicit. The skip card&apos;s fields are slightly different (skip reason, rule fired, hindsight outcome) but the priority is identical. A journal that only shows the left card is auditing half the discipline.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-2">TAKEN-TRADE REQUIRED FIELDS</p>
              <ul className="text-sm text-gray-400 leading-relaxed space-y-1.5 ml-4">
                <li><strong className="text-white">Type</strong> &middot; PX LONG / PX SHORT / TS LONG / TS SHORT / Coil breakout / etc.</li>
                <li><strong className="text-white">Asset / TF</strong> &middot; the symbol and chart timeframe</li>
                <li><strong className="text-white">Preset</strong> &middot; the discipline configuration active at the time</li>
                <li><strong className="text-white">Conviction</strong> &middot; the 0-4 score and the four factor states</li>
                <li><strong className="text-white">Entry / SL / TPs</strong> &middot; the Risk Map values (audit method labels)</li>
                <li><strong className="text-white">Size</strong> &middot; the R multiplier on baseline risk</li>
                <li><strong className="text-white">Result</strong> &middot; final R after scaling, including BE moves</li>
                <li><strong className="text-white">Protocol adherence</strong> &middot; did you follow the engine or override? Where?</li>
              </ul>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">SKIPPED-TRADE REQUIRED FIELDS</p>
              <ul className="text-sm text-gray-400 leading-relaxed space-y-1.5 ml-4">
                <li><strong className="text-white">Type</strong> &middot; signal type that was skipped</li>
                <li><strong className="text-white">Asset / TF</strong> &middot; same as taken</li>
                <li><strong className="text-white">Preset</strong> &middot; same as taken</li>
                <li><strong className="text-white">Conviction</strong> &middot; the 0-4 score at the time of the skip</li>
                <li><strong className="text-white">Skip reason</strong> &middot; one of the 5 categories from Section 2 (conviction / regime / structure / context / personal)</li>
                <li><strong className="text-white">Rule fired</strong> &middot; the specific rule that triggered the skip (e.g. &quot;Threshold 3-of-4 enforced by Sniper preset&quot;)</li>
                <li><strong className="text-white">Hindsight outcome</strong> &middot; what happened next on the chart (winning skip / losing skip / break-even skip)</li>
                <li><strong className="text-white">Protocol adherence</strong> &middot; did the discipline framework call this skip correctly?</li>
              </ul>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">WHEN TO LOG — MOMENT OF DECISION</p>
              <p className="text-sm text-gray-400 leading-relaxed">Both entries are captured AT THE MOMENT, not at session-end. Why: post-session capture loses the "felt" data (urgency, doubt, conviction-in-the-moment) that often differentiates a process-clean trade from a borderline override. The capture cost is 30 seconds per entry. The data value compounds over 30 sessions.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">RESULT IS APPENDED, NEVER OVERWRITTEN</p>
              <p className="text-sm text-gray-400 leading-relaxed">The captured entry contains everything KNOWN at the moment. After the position closes (or after the chart confirms hindsight on a skip), append the outcome. <strong className="text-white">Never edit the original capture.</strong> Rewriting your reasoning to match the outcome is the most common journal failure &mdash; it destroys the dataset by aligning your historic reads with hindsight bias.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S10 — The 30-Session Process Loop (★★★ centerpiece) === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; The 30-Session Loop &middot; &#9733;&#9733;&#9733; centerpiece</p>
          <h2 className="text-2xl font-extrabold mb-4">Single Trades Are Noise. Thirty Sessions Are Signal.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Single-trade outcomes do not contain information. Single-session P&amp;L barely contains information. <strong className="text-amber-400">The 30-session window is the smallest sample where signal exceeds noise.</strong> This is the timeframe at which protocol adherence becomes auditable, pattern P&amp;L becomes legible, and discipline weaknesses surface as data &mdash; not anecdotes.</p>
          <ThirtySessionScrubber />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Drag the amber knob across the equity curve. Each session reveals its mini-journal: trades taken, trades skipped, adherence percentage, daily P&amp;L, cumulative P&amp;L, and the session note. Notice: <strong className="text-white">individual sessions swing wildly</strong> &mdash; +2.4R one day, -2.1R the next. Notice: <strong className="text-white">the 30-session cumulative is +18R, a clean positive curve.</strong> The daily P&amp;L is noise. The 30-session sum is signal. This is the only timescale at which discipline becomes provable.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-2">WHY 30 SESSIONS, NOT 5 OR 100</p>
              <p className="text-sm text-gray-400 leading-relaxed">At n=5 sessions, variance dominates &mdash; a single bad day can produce a -10% week regardless of process quality. At n=10, the same. At n=30, the law of large numbers begins to outweigh single-session noise: a +18R cumulative across 30 sessions cannot be explained by luck alone. At n=100, you have statistical certainty &mdash; but n=30 is the practical floor where decisions become defensible without waiting half a year.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">WHAT TO EXTRACT AT THE 30-SESSION MARK</p>
              <ul className="text-sm text-gray-400 leading-relaxed space-y-1.5 ml-4">
                <li><strong className="text-white">Pattern P&amp;L attribution.</strong> Which setup types paid (PX continuation vs TS reversal vs Coil breakout)? Which lost? Tells you where your edge actually lives.</li>
                <li><strong className="text-white">Skip quality audit.</strong> Were your skips positive-EV in hindsight? If 80%+ of news skips were losers-avoided, the rule is working. If 80%+ were winners-missed, the rule is over-filtering.</li>
                <li><strong className="text-white">Protocol adherence rate.</strong> Out of 30 sessions, how many had 100% adherence? Below 25 of 30 = discipline drift.</li>
                <li><strong className="text-white">Override audit.</strong> List every override across 30 sessions, with outcome. If overrides are net-negative (typical), the data ends the override debate permanently.</li>
                <li><strong className="text-white">Preset fit verification.</strong> Did the chosen preset (Sniper, Swing, Trend Trader) match where the edge appeared? If you ran Sniper but your edge was in PX continuation (Trend Trader territory), switch between cycles, not mid-cycle.</li>
              </ul>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">THE LOOP IS CONTINUOUS</p>
              <p className="text-sm text-gray-400 leading-relaxed">At session 30 you do the audit. Take 1-2 days off. At session 31 you begin the next 30-session cycle, applying what you learned: tighter rules for the over-loose filters, looser rules for the over-tight ones, preset adjusted if needed. <strong className="text-white">The loop never ends.</strong> Cycles 1-3 calibrate the framework to your discovered edge. Cycles 4+ compound the calibration.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">DO NOT MAKE FRAMEWORK CHANGES MID-CYCLE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Mid-cycle adjustments contaminate the dataset. If session 12 had two stops in a row, the temptation is to tighten the conviction threshold or switch preset. <strong className="text-white">Resist.</strong> A 12-session sample is not enough information to act on. Stay mechanical until session 30, journal the impulse, audit at the cycle boundary. The framework cannot calibrate to changes that happen DURING the measurement window.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S11 — The Override Doctrine === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; The Override Doctrine</p>
          <h2 className="text-2xl font-extrabold mb-4">Sizing Is the Only Legitimate Variable</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The override doctrine is the most important rule in this lesson. Read it three times: <strong className="text-amber-400">Parameter changes via inputs are legitimate operator variables. Per-trade adjustments are not.</strong> Choosing Sniper over Trend Trader is legitimate. Moving a stop-loss "because the chart looks like it has more room" is an override. The first is configuration; the second is breaking the boolean equation in real-time.</p>
          <OverrideReplayAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the replay. Left chart: the engine&apos;s perspective. The conviction gate evaluated FALSE; the engine kept the signal silent. Right chart: the operator&apos;s perspective. They saw the same chart, didn&apos;t see a signal, and entered anyway with their own thesis. Bar 13 stops them out at -1R. <strong className="text-white">The aggregate panel below shows 20 such overrides over a 90-session period: cumulative -14.3R.</strong> One override is anecdote. Twenty are a doctrine.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-2">LEGITIMATE OPERATOR VARIABLES</p>
              <ul className="text-sm text-gray-400 leading-relaxed space-y-1.5 ml-4">
                <li><strong className="text-white">Preset selection.</strong> Trend Trader vs Scalper vs Sniper, etc.</li>
                <li><strong className="text-white">Signal Type.</strong> Trend only, Reversal only, All, Visuals Only.</li>
                <li><strong className="text-white">Direction filter.</strong> Long only / Short only / Both.</li>
                <li><strong className="text-white">Strong Signals Only toggle.</strong> Manual enforcement of the 3-of-4 conviction threshold.</li>
                <li><strong className="text-white">Position size baseline.</strong> 1R = 0.5% of equity, or 1%, or 0.25% per personal risk policy. Set once per cycle.</li>
                <li><strong className="text-white">Sizing within qualified tiers.</strong> 2/4 = half size, 3/4 = standard, 4/4 = up to 1.5× cap (per L11.22). Sizing IS your one moment of legitimate trade-level discretion &mdash; but only WITHIN qualified setups.</li>
              </ul>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">ILLEGITIMATE OVERRIDES</p>
              <ul className="text-sm text-gray-400 leading-relaxed space-y-1.5 ml-4">
                <li><strong className="text-white">Taking a signal that did not pass the conviction threshold.</strong> The engine refused; you accepted anyway.</li>
                <li><strong className="text-white">Moving a stop-loss post-entry.</strong> Risk Map computed the SL; you "gave it room" because price approached.</li>
                <li><strong className="text-white">Raising a TP target.</strong> Holding past TP3 hoping for more is the override that erases the average 1.75R winner.</li>
                <li><strong className="text-white">Switching preset mid-session.</strong> Hunting for a configuration that legitimises a trade you wanted to take anyway.</li>
                <li><strong className="text-white">Taking a 2/4 signal at half-size.</strong> Half-size on a sub-threshold trade is still an override, just softer.</li>
                <li><strong className="text-white">Entering before the signal label prints.</strong> "I saw it coming" = front-running the engine you trusted enough to use.</li>
              </ul>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">WHY THE DOCTRINE EXISTS</p>
              <p className="text-sm text-gray-400 leading-relaxed">CIPHER is a deterministic system. Given the same inputs, the same outputs fire. <strong className="text-white">Per-trade overrides convert the system into a discretionary one</strong> &mdash; the moment you start picking and choosing which signals to honour, you have abandoned the framework&apos;s deterministic edge and replaced it with your own subjective read. The 20-override aggregate is the data showing what that swap costs at scale.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">THE LEGITIMATE PATH TO FRAMEWORK CHANGE</p>
              <p className="text-sm text-gray-400 leading-relaxed">If during a 30-session cycle you notice the framework is producing systematically poor signals on a specific asset, the legitimate change is at the configuration layer: blacklist the asset, switch preset, tighten the conviction threshold. <strong className="text-white">All at the cycle boundary, not mid-trade.</strong> Per-trade adjustments are emotional. Configuration adjustments are operational.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S12 — Operator Personality Types === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">12 &mdash; Operator Personality Types</p>
          <h2 className="text-2xl font-extrabold mb-4">Six Operators. Six Characteristic Failures.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Discipline failures are not random. They cluster around operator personality. <strong className="text-amber-400">Each personality has a characteristic failure mode that they will revert to under pressure</strong> &mdash; not because they are weak, but because their psychological wiring predisposes them to it. The cure is not "be stronger." The cure is mechanical rules that block the specific failure your wiring leans toward.</p>
          <PersonalitySwapAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Six archetypes cycle through. Each one is highlighted in turn, then the card flips to reveal the FAILURE MODE on the back. Read each one honestly and ask: <strong className="text-white">which of these am I?</strong> Most operators are 60% one archetype, 30% a secondary, and 10% mixed. The primary archetype is what fails first under stress. Identifying it is the prerequisite to defending against it.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">1 &middot; THE FOMO CHASER</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">Failure mode:</strong> enters late, after the signal has already moved 2-3 bars in their direction. The trade now has worse R:R; the original SL is too tight; they widen it; they get stopped at break-even or small loss.<br /><strong className="text-white">Mechanical defence:</strong> hard rule that any entry &gt;1 bar after the signal label printed is a SKIP. No exceptions, no rationalisations.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">2 &middot; THE REVENGE TRADER</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">Failure mode:</strong> re-enters same direction after a stop-out within 4-8 bars at the same level. Same setup, same loss, doubled emotional cost.<br /><strong className="text-white">Mechanical defence:</strong> mirror the TS cooldown. 30-minute personal cooldown after any stop-out; 8-12 bars on TF before same-direction re-entry; full session lockout after 2 stops on same asset.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">3 &middot; THE HERO OVERRIDE</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">Failure mode:</strong> after a streak of wins, decides their read exceeds the engine&apos;s. Starts overriding the conviction threshold. Sizes up because they &quot;feel it.&quot; First losses interpreted as variance; size grows; drawdown lands; revenge begins.<br /><strong className="text-white">Mechanical defence:</strong> sizing rules that do not flex with confidence. Baseline R is set once per cycle and does not change mid-cycle regardless of win streak.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">4 &middot; THE SIZE CREEPER</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">Failure mode:</strong> after losses, raises size to "recover faster." The math is wrong but feels right. One winning trade at 2× size covers two losers at 1× &mdash; until it doesn&apos;t.<br /><strong className="text-white">Mechanical defence:</strong> hard rule that size DECREASES during drawdown periods, not increases. -3R cumulative = half-size for next 5 sessions per the drawdown circuit.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">5 &middot; THE BAGHOLDER</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">Failure mode:</strong> refuses to honour the stop-loss. Watches price punch through SL and "waits for a bounce" that does not come. A -1R loss becomes -3R or worse.<br /><strong className="text-white">Mechanical defence:</strong> hard stop-loss orders placed at entry, not mental stops. Reading the SL as a hopeful price target is impossible when the order exists on the broker side.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">6 &middot; THE SYSTEM SWITCHER</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">Failure mode:</strong> after a losing cycle, abandons the framework and jumps to a different strategy or indicator. Never accumulates the 30-session sample any system needs to prove itself. Forever in the calibration phase.<br /><strong className="text-white">Mechanical defence:</strong> the 30-session commitment. No framework changes mid-cycle. Audit only at the cycle boundary.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">IDENTIFY, NAME, DEFEND</p>
              <p className="text-sm text-gray-400 leading-relaxed">Write down your primary archetype today. Put it in your pre-session checklist. The mechanical defence becomes a non-negotiable rule that lives outside your in-the-moment decision-making. <strong className="text-white">You cannot defend against a failure mode you have not named.</strong></p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S13 — The Discipline Failure Cascade === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">13 &mdash; The Failure Cascade</p>
          <h2 className="text-2xl font-extrabold mb-4">Five Stages. Stage One Is Preventable. Stage Five Ends Accounts.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Account failures are not random events. They are the terminal stage of a 5-step chain that begins with a single discipline lapse and compounds. <strong className="text-amber-400">The chain is observable in the post-mortem of 80%+ of blown trading accounts.</strong> The lesson here is not to fear blow-up &mdash; it is to recognise Stage 1 in real-time, before it has anywhere to compound to.</p>
          <FailureCascadeAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the chain build. Each stage activates in sequence, the equity curve below plummets. By Stage 5 the cumulative drawdown is -15R or worse. <strong className="text-white">The chain only works because each stage seemed reasonable in the moment.</strong> Stage 1 felt like "this one is different." Stage 2 felt like recovery. Stage 3 was bad luck. Stage 4 was vindication-seeking. Stage 5 was inevitable.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">STAGE 1 &middot; OVERRIDE (-1R typical)</p>
              <p className="text-sm text-gray-400 leading-relaxed">A sub-threshold signal is taken. The conviction was 2/4. Your threshold was 3. The chart &quot;looked good.&quot; Loss feels small &mdash; -1R, recoverable. But the precedent has been set: the boolean equation has been broken once. <strong className="text-white">The mental discount between &quot;engine-qualified trade&quot; and &quot;anything I want to take&quot; has narrowed.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STAGE 2 &middot; SIZE CREEP (-2R cumulative)</p>
              <p className="text-sm text-gray-400 leading-relaxed">The next trade is sized up &mdash; sometimes consciously ("one good winner covers that override"), sometimes through unconscious drift. The 1R baseline becomes 1.5R, then 2R, then "just for this one." <strong className="text-white">The sizing rule, set in calmness, has been edited under stress.</strong> If this trade wins, the size sticks. If it loses, the loss is amplified.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STAGE 3 &middot; DRAWDOWN (-6R cumulative)</p>
              <p className="text-sm text-gray-400 leading-relaxed">A losing patch lands &mdash; statistically inevitable, but now compounded by the size creep. Three losers in a row at oversized positions. <strong className="text-white">The drawdown circuit (set at -3R) should have fired by now.</strong> But the operator overrode it ("I&apos;m on the verge of recovery"). The pyramid&apos;s Process tier is gone; only Execution is happening, and it is being driven by emotion.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STAGE 4 &middot; REVENGE (-10R cumulative)</p>
              <p className="text-sm text-gray-400 leading-relaxed">"I have to make it back today." Position size doubles again. Speed of entry increases. Skip discipline collapses &mdash; every signal becomes a trade. <strong className="text-white">The framework is no longer being run.</strong> The trader is running, the framework is along for the ride. The next 3-4 trades land mostly losing because the operator filter has been removed.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STAGE 5 &middot; BLOW-UP (-15R+ or account hit)</p>
              <p className="text-sm text-gray-400 leading-relaxed">The cumulative loss now exceeds the recovery threshold by a wide margin. On a prop account, this is the daily drawdown rule firing, account closed. On a personal account, this is the position that takes equity below a psychological floor from which the operator cannot rationally return. <strong className="text-white">Stage 5 is mechanical inevitability given Stages 1-4.</strong> The fact that it &ldquo;feels sudden&rdquo; is precisely the problem with the cascade &mdash; it always feels sudden, even though it was visible four stages back.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">BREAK THE CHAIN AT STAGE 1</p>
              <p className="text-sm text-gray-400 leading-relaxed">Stages 2-5 are unstoppable once Stage 1 has happened more than once or twice. <strong className="text-white">The only durable intervention is at Stage 1.</strong> Every override prevented is a Stage 2 that never builds. Every Stage 2 prevented is a Stage 3 that never lands. The discipline rules in this lesson are not arbitrary &mdash; they are specifically calibrated to make Stage 1 mechanically impossible.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#11088; THE STAGE-1 INTERRUPT</p>
            <p className="text-sm text-gray-400 leading-relaxed">If you catch yourself rationalising "this signal is different" or "I&apos;ll just take this one even though conviction is 2/4" &mdash; <strong className="text-white">stop. Close the platform. Walk for 10 minutes.</strong> You have detected Stage 1 in real-time. This is the most valuable skill in the lesson. Stages 2-5 cannot fire if Stage 1 was caught.</p>
          </div>
        </motion.div>
      </section>

      {/* === S14 — Asset-Class Discipline Differences === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">14 &mdash; Asset-Class Differences (Preview of L11.26)</p>
          <h2 className="text-2xl font-extrabold mb-4">Same Framework. Different Asset Character.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Discipline rules generalise across asset classes &mdash; the equation, the pyramid, the override doctrine, the cascade all work the same way on EURUSD as on BTCUSD. <strong className="text-amber-400">What changes is the calibration.</strong> Each asset class has a character that demands different cooldown lengths, different position-size baselines, different news-window discipline, and different patience profiles. L11.26 covers this in depth; this section is the preview.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-2">FOREX (EURUSD / GBPUSD / USDJPY) &mdash; The Patient Asset</p>
              <p className="text-sm text-gray-400 leading-relaxed">High structural discipline, session-bound rhythm, news-event driven volatility windows. <strong className="text-white">Patience is the dominant skill.</strong> CIPHER&apos;s asset-routing tightens FX thresholds because slow ranging conditions are common. Cooldown discipline: long. News window discipline: aggressive (NFP, FOMC, CPI announcements freeze the session). Position size: standard. Best preset fit: Swing Trader or Sniper.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">INDICES (US100 / SPX500 / NAS100) &mdash; The Session-Bound Asset</p>
              <p className="text-sm text-gray-400 leading-relaxed">Strong daily session structure, sharp opens and closes, mid-session quiet. <strong className="text-white">Timing discipline is the dominant skill.</strong> First 30 minutes after open are skip windows. Last 30 minutes before close are skip windows. Mid-session (10:30-15:00 NY) is the legitimate engagement window. Position size: tighter than FX because daily ranges are wider in points. Best preset fit: Scalper or Trend Trader.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">CRYPTO (BTCUSD / ETHUSD) &mdash; The Reactive Asset</p>
              <p className="text-sm text-gray-400 leading-relaxed">24/7 markets, no session boundaries, news-driven shocks any hour, weekend gaps. <strong className="text-white">Reactivity discipline is the dominant skill.</strong> Cooldowns are shorter because bars are shorter; news windows are unpredictable; position size needs to be conservative because gap risk is real. Best preset fit: Scalper (high frequency) or Reversal (volatile snapbacks).</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">GOLD (XAUUSD) &mdash; The Macro Asset</p>
              <p className="text-sm text-gray-400 leading-relaxed">News-driven across multiple economic surfaces (USD weakness, inflation data, geopolitical risk), trends harder than FX, ranges chop harder than indices. <strong className="text-white">Context discipline is the dominant skill.</strong> Pre-session news scan is mandatory (DXY, gold-specific events). Position size: between FX and indices. Best preset fit: Sniper or Swing Trader.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">THE UNIVERSAL DISCIPLINE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Across all four classes, the equation holds: <code className="text-amber-400 text-xs bg-black/30 px-1.5 py-0.5 rounded">signal = engine AND discipline</code>. The override doctrine, the cascade, the 30-session loop, the journal protocol &mdash; all generalise. The calibration changes; the architecture does not. <strong className="text-white">L11.26 covers each asset class in full operational depth.</strong></p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S15 — The 30-Day Discipline Test === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">15 &mdash; The 30-Day Discipline Test</p>
          <h2 className="text-2xl font-extrabold mb-4">Prove It Can Be Executed Mechanically. Then Add Outcome.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The lesson ends with a single graduation criterion: <strong className="text-amber-400">execute the framework mechanically for 30 sessions with zero overrides, regardless of P&amp;L outcome.</strong> Profit is not the test. Adherence is the test. Profit follows on a longer time horizon, but only for operators who can first prove they can execute mechanically. The 30-day test exists because most operators have never gone 30 sessions without an override.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-2">THE PROTOCOL</p>
              <ul className="text-sm text-gray-400 leading-relaxed space-y-1.5 ml-4">
                <li><strong className="text-white">Paper or live, your choice.</strong> Paper is fine for the test; live adds emotional pressure that paper cannot simulate. If your goal is prop funding, run it live with strict size control.</li>
                <li><strong className="text-white">Pick one preset.</strong> Commit to it for 30 sessions. No mid-cycle switching.</li>
                <li><strong className="text-white">Run the pre-session checklist daily.</strong> Honour kill criteria when they fire (HALT failure, drawdown circuit).</li>
                <li><strong className="text-white">Engage only qualified signals.</strong> No 2/4 conviction trades on a 3-of-4 threshold preset. No mid-session preset switching to legitimise an unqualified trade.</li>
                <li><strong className="text-white">Journal every trade and every skip.</strong> Equal weight, in-the-moment capture, append outcome later.</li>
                <li><strong className="text-white">Hold sizing constant.</strong> Baseline R does not change across the 30 sessions regardless of win/loss streaks.</li>
                <li><strong className="text-white">Do not edit framework rules mid-cycle.</strong> The 30-day window is a single measurement.</li>
              </ul>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">PASS CRITERIA</p>
              <ul className="text-sm text-gray-400 leading-relaxed space-y-1.5 ml-4">
                <li><strong className="text-white">100% protocol adherence on at least 27 of 30 sessions.</strong> Three "near-miss" sessions allowed where a small drift was caught within the session and corrected. Zero overrides on those three days.</li>
                <li><strong className="text-white">Journal coverage 100%.</strong> Every taken trade logged. Every skipped trade logged. Equal weight.</li>
                <li><strong className="text-white">Drawdown circuit honoured if triggered.</strong> If a -3R week happens, the next day was a real day off, not a "watch only" day.</li>
                <li><strong className="text-white">Pre-session checklist run every session.</strong> Including the days you "felt fine."</li>
              </ul>
              <p className="text-sm text-gray-400 leading-relaxed mt-3"><strong className="text-white">Note what is NOT in the pass criteria: profit.</strong> The test does not care whether you end +20R or -5R. Profit at n=30 has too much variance to be meaningful. Process adherence at n=30 is the signal that predicts profit at n=200.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">FAIL MODES (AND WHAT EACH MEANS)</p>
              <ul className="text-sm text-gray-400 leading-relaxed space-y-1.5 ml-4">
                <li><strong className="text-white">Multiple overrides:</strong> the operator filter is not yet mechanical. Re-read Sections 11 and 12.</li>
                <li><strong className="text-white">Incomplete journal:</strong> Section 9 protocol has not been internalised. The journal must be a non-negotiable habit.</li>
                <li><strong className="text-white">Drawdown circuit ignored:</strong> kill criterion discipline is missing. Re-read Section 7.</li>
                <li><strong className="text-white">Preset switched mid-cycle:</strong> 20-session commitment from L11.23 was not honoured. The cure is to start the next 30-day test, not to extend the failed one.</li>
              </ul>
              <p className="text-sm text-gray-400 leading-relaxed mt-3">A failed test is not the end. It is data. Identify the failure category, address the specific weakness, start the next 30-day test. <strong className="text-white">Most operators pass on the third or fourth attempt.</strong> The framework rewards the attempt itself even when the test does not pass.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">WHAT HAPPENS AFTER YOU PASS</p>
              <p className="text-sm text-gray-400 leading-relaxed">You earn the right to extend to 60 sessions, then 100, where outcome metrics become statistically meaningful. You unlock the ability to make calibration changes between cycles based on real data. You have proven, to yourself, that the framework can be executed mechanically by you. <strong className="text-white">From here, profit becomes a function of compound, not effort.</strong> L11.26 (Asset-Class Adaptation) and L11.27 (Failure Modes / Mastery Capstone) extend the test into the operator&apos;s full long-term practice.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#11088; THE TEST IS THE LESSON</p>
            <p className="text-sm text-gray-400 leading-relaxed">Reading this lesson does not earn the Discipline Operator certificate at any meaningful level &mdash; it earns it formally. The real certificate is the 30-day test result: a journal with 30 sessions of mechanical execution, signed by no one but yourself. <strong className="text-white">Carry that with you. It is the only credential that compounds.</strong></p>
          </div>
        </motion.div>
      </section>

      {/* === Mistakes — Six Common Discipline Failures === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">Six Common Discipline Failures</p>
          <h2 className="text-2xl font-extrabold mb-4">The Traps Every Operator Falls Into</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Six predictable failures appear in the first 30-90 days of running CIPHER. Each one feels like a one-off in the moment. At the 30-session audit, the pattern is always visible. Recognise them, skip the year of slow learning.</p>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 1  &middot;  TAKING SUB-THRESHOLD SIGNALS BECAUSE &ldquo;THE CHART LOOKS RIGHT&rdquo;</p>
              <p className="text-sm text-gray-400 leading-relaxed">The conviction is 2/4. Your threshold is 3. You take it anyway because &ldquo;the structure looks clean.&rdquo; This is Stage 1 of the failure cascade. <strong className="text-white">Your gut is not a fifth conviction factor.</strong> The engine&apos;s gate evaluated FALSE for a reason. Either enable Strong Signals Only at the input level, or accept the silent reject. The third option &mdash; trading it anyway &mdash; is the override doctrine violation that ends accounts at scale.</p>
            </div>

            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 2  &middot;  RE-ENTERING SAME DIRECTION WITHIN THE COOLDOWN AFTER A STOP-OUT</p>
              <p className="text-sm text-gray-400 leading-relaxed">You took a TS LONG. It stopped at -1R. Three bars later another TS LONG fires at the same level. You take it because &ldquo;the setup looks identical.&rdquo; The fact that it looks identical is the warning, not the case for taking it. <strong className="text-white">CIPHER&apos;s TS engine has a built-in cooldown precisely because clustered same-direction signals carry negative expected value.</strong> Mirror the engine: 30-minute personal cooldown, 8-12 bars on TF before same-direction re-entry, full lockout after two stops on the same asset.</p>
            </div>

            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 3  &middot;  SIZING UP AFTER LOSSES TO &ldquo;RECOVER FASTER&rdquo;</p>
              <p className="text-sm text-gray-400 leading-relaxed">You&apos;re down -2R for the week. The next signal looks 4/4. You take it at 1.5R or 2R instead of baseline. The math feels right &mdash; &ldquo;one good winner covers the losses.&rdquo; The math is wrong. <strong className="text-white">Size after a drawdown should DECREASE, not increase, per the drawdown circuit.</strong> Stage 2 of the failure cascade is literally this mistake. Size creep on a losing streak compounds the drawdown geometrically, not arithmetically.</p>
            </div>

            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 4  &middot;  MOVING STOPS POST-ENTRY &ldquo;BECAUSE PRICE NEEDS ROOM&rdquo;</p>
              <p className="text-sm text-gray-400 leading-relaxed">The Risk Map computed the SL. Price approaches the SL. You widen it because &ldquo;it&apos;s just a wick.&rdquo; The wick becomes a body. You widen again. <strong className="text-white">Moving a stop-loss post-entry is the override doctrine violation that disguises itself as patience.</strong> The SL was placed at the price where the thesis was wrong; moving it converts a -1R loss into a -2R or -3R loss because the thesis was, in fact, wrong. Discipline: SL at entry, exit at SL, no negotiation.</p>
            </div>

            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 5  &middot;  IGNORING THE DRAWDOWN CIRCUIT BECAUSE &ldquo;TODAY FEELS DIFFERENT&rdquo;</p>
              <p className="text-sm text-gray-400 leading-relaxed">Last week was -4R. The rule says &ldquo;mandatory day off + reduced size on return.&rdquo; Monday morning the setups look pristine. You override the rule because &ldquo;the new week resets.&rdquo; <strong className="text-white">The new week does not reset the math.</strong> The drawdown circuit was set by past-you who knew that this exact morning&apos;s rationalisation would arrive. Honouring the rule today is what makes you the operator past-you trusted. Past-you was disciplined; current-you is rationalising.</p>
            </div>

            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 6  &middot;  JOURNALING ONLY TAKEN TRADES, NOT SKIPS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Skipping is a decision. It produces data. If you only log taken trades, your journal can audit execution discipline but not skip discipline. Over 30 sessions the skip log reveals which rules are productively filtering losers and which are over-filtering legitimate setups. <strong className="text-white">Without the skip log you cannot tell if your operator filter is positive-EV.</strong> The cure is mechanical: every signal that prints on the chart either becomes a taken-trade entry or a skipped-trade entry. Both. Equal weight. Same moment.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === Cheat Sheet === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">The Discipline Cheat Sheet</p>
          <h2 className="text-2xl font-extrabold mb-4">For Your Second Monitor</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Print this. Pin it where you can see it during a session. Reference it when the chart starts whispering &ldquo;this one is different.&rdquo;</p>

          <div className="p-6 rounded-2xl glass-card space-y-3">
            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">The Equation</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p><strong className="text-white">Signal = engine correctness AND operator discipline</strong></p>
                <p>Both gates must pass. Either gate failing = no trade.</p>
              </div>
            </div>

            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">The 8/3/5 Ratio</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p>Of every <strong className="text-white">8 signals</strong> CIPHER fires &mdash; trade <strong className="text-white">3</strong>, skip <strong className="text-white">5</strong>. Audit at 30 sessions.</p>
              </div>
            </div>

            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">The Pyramid</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p><strong className="text-white">PROCESS</strong> &middot; how you study &mdash; <strong className="text-white">PLAN</strong> &middot; the session plan &mdash; <strong className="text-white">EXECUTION</strong> &middot; the live work &mdash; <strong className="text-white">REVIEW</strong> &middot; the post-session audit</p>
                <p>Each tier supports the one above. Lowest score is the one to fix first.</p>
              </div>
            </div>

            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">Encoded Discipline (Three Mechanisms)</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p><strong className="text-white">1. Conviction Threshold</strong> &mdash; Swing/Sniper enforce 3-of-4. Sub-threshold signals silent.</p>
                <p><strong className="text-white">2. TS Cooldown</strong> &mdash; 8-12 bars by TF. Direction-specific.</p>
                <p><strong className="text-white">3. Preset Philosophies</strong> &mdash; each preset bundles threshold + engine width into one choice.</p>
              </div>
            </div>

            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">Pre-Session Checklist (15 min)</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p>1. Overnight news scanned, high-impact events flagged</p>
                <p>2. Watchlist verified, chart roles assigned</p>
                <p>3. Alerts active and tested</p>
                <p>4. <strong className="text-white">KILL</strong> &middot; mental state HALT check</p>
                <p>5. <strong className="text-white">KILL</strong> &middot; drawdown circuit not triggered (&ge;-3R week)</p>
              </div>
            </div>

            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">5-Second Mid-Session Triage</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p><strong className="text-white">Branch 1 &middot; Regime fit?</strong> TREND + PX = yes. VOLATILE + anything = SKIP.</p>
                <p><strong className="text-white">Branch 2 &middot; Structure clear?</strong> No counter-FVG, no untested liquidity, no chop flag.</p>
                <p><strong className="text-white">Branch 3 &middot; Conviction tier?</strong> 4/4 full, 3/4 standard, 2/4 half-size WAIT, sub-2 SKIP.</p>
              </div>
            </div>

            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">The Override Doctrine</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p><strong className="text-white">Legitimate variables:</strong> preset, signal type, direction, Strong Only toggle, baseline R, sizing within qualified tiers.</p>
                <p><strong className="text-white">Illegitimate overrides:</strong> sub-threshold signals, post-entry SL moves, raised TPs, mid-session preset switching, front-running labels.</p>
              </div>
            </div>

            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">The Failure Cascade</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p><strong className="text-white">Stage 1</strong> Override &mdash; <strong className="text-white">Stage 2</strong> Size Creep &mdash; <strong className="text-white">Stage 3</strong> Drawdown &mdash; <strong className="text-white">Stage 4</strong> Revenge &mdash; <strong className="text-white">Stage 5</strong> Blow-up.</p>
                <p>Break the chain at Stage 1. Stages 2-5 are unstoppable once Stage 1 has compounded.</p>
              </div>
            </div>

            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">Personal Cooldowns (Mirror the Engine)</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p><strong className="text-white">30 min</strong> after any stop-out, same asset, any direction</p>
                <p><strong className="text-white">8-12 bars</strong> on TF before same-direction re-entry same level</p>
                <p><strong className="text-white">Full session lockout</strong> after 2 stops same direction same asset</p>
              </div>
            </div>

            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">Journal Protocol</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p>Every taken trade and every skipped trade gets an entry. Equal weight. Captured at the moment. Result appended after, never overwritten.</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">The 30-Day Test</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p>Pass: 100% adherence on 27+ of 30 sessions, full journal coverage, kill criteria honoured.</p>
                <p><strong className="text-white">Profit is not in the pass criteria.</strong> Process is the test. Profit follows at n=100+.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === Discipline Failure Cascade Simulator (Game) === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">Scenario Game &middot; Discipline Failure Cascade Simulator</p>
          <h2 className="text-2xl font-extrabold mb-4">Five Decisions. Five Discipline Checks.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Five real-feeling operator decision points. Each puts you in front of a discipline choice with a satisfying-sounding wrong answer competing with a less-satisfying correct one. Pick the disciplined call. Explanations appear after every answer &mdash; including for the wrong ones, because the wrong-answer reasoning is what catches your blind spot.</p>
          <div className="p-5 rounded-2xl glass-card">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold tracking-widest uppercase text-amber-400">Round {gameRound + 1} of {gameRounds.length}</p>
              <p className="text-xs text-gray-500">Score: {gameSelections.filter((sel, i) => sel !== null && gameRounds[i].options.find(o => o.id === sel)?.correct).length}/{gameRounds.length}</p>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed mb-4">{gameRounds[gameRound].scenario}</p>
            <p className="text-sm font-semibold text-white mb-4">{gameRounds[gameRound].prompt}</p>
            <div className="space-y-2">
              {gameRounds[gameRound].options.map((opt) => {
                const answered = gameSelections[gameRound] !== null;
                const selected = gameSelections[gameRound] === opt.id;
                const isCorrect = opt.correct;
                let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]';
                if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30';
                if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30';
                if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20';
                return (
                  <div key={opt.id}>
                    <button
                      onClick={() => {
                        if (gameSelections[gameRound] !== null) return;
                        const next = [...gameSelections];
                        next[gameRound] = opt.id;
                        setGameSelections(next);
                      }}
                      disabled={answered}
                      className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}
                    >
                      <span className="text-gray-200">{opt.text}</span>
                    </button>
                    {answered && selected && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]">
                        <p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>{isCorrect ? '\u2713' : '\u2717'} {opt.explain}</p>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
            {gameSelections[gameRound] !== null && gameRound < gameRounds.length - 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5">
                <button onClick={() => setGameRound(gameRound + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button>
              </motion.div>
            )}
            {gameSelections[gameRound] !== null && gameRound === gameRounds.length - 1 && (() => {
              const finalScore = gameSelections.filter((sel, i) => sel !== null && gameRounds[i].options.find(o => o.id === sel)?.correct).length;
              return (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                  <p className="text-lg font-extrabold text-amber-400">{finalScore}/{gameRounds.length} Correct</p>
                  <p className="text-xs text-gray-400 mt-1">{finalScore >= 4 ? 'Operator-grade discipline reads. You catch Stage-1 cascades in real-time and skip the trades past-you would have taken.' : finalScore >= 3 ? 'Solid grasp. Re-read the override doctrine (S11), the failure cascade (S13), and the personality types (S12) before the quiz.' : 'Re-study the equation (S01), the override doctrine (S11), and the failure cascade (S13) before the quiz. The wrong answers above are the failure modes the lesson exists to defend against.'}</p>
                </motion.div>
              );
            })()}
          </div>
        </motion.div>
      </section>

      {/* === Final Quiz === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">Knowledge Check</p>
          <h2 className="text-2xl font-extrabold mb-6">Final Quiz &mdash; {quizQuestions.length} Questions</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Pass with 66% or better to earn the <strong className="text-amber-400">Discipline Operator</strong> certificate. Answer all questions to submit. Wrong answers reveal the reasoning so you can patch the blind spot.</p>
          <div className="space-y-6">
            {quizQuestions.map((q, qi) => (
              <div key={qi} className="p-5 rounded-2xl glass-card">
                <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p>
                <p className="text-sm font-semibold text-white mb-4">{q.question}</p>
                <div className="space-y-2">
                  {q.options.map((opt) => {
                    const answered = quizAnswers[qi] !== null;
                    const selected = quizAnswers[qi] === opt.id;
                    const isCorrect = opt.correct;
                    let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]';
                    if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30';
                    if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30';
                    if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20';
                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          if (quizAnswers[qi] !== null) return;
                          const next = [...quizAnswers];
                          next[qi] = opt.id;
                          setQuizAnswers(next);
                          if (next.every(a => a !== null)) setQuizSubmitted(true);
                        }}
                        disabled={answered}
                        className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`}
                      >
                        {opt.text}
                      </button>
                    );
                  })}
                </div>
                {quizAnswers[qi] !== null && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg bg-white/[0.02]">
                    <p className="text-xs text-amber-400"><span className="font-bold">&#9989;</span> {q.explain}</p>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
          {quizSubmitted && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center">
              <p className="text-3xl font-extrabold mb-2">{quizPercent}%</p>
              <p className="text-sm text-gray-400">{quizPassed ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate. Review and try again.'}</p>
            </motion.div>
          )}
          {certRevealed && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10">
              <div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(14,165,233,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
                <div className="relative z-10 text-center">
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-sky-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">&#9636;</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 11.25: Cipher Trading Discipline</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-sky-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Discipline Operator &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">{certId}</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </section>

      <section className="max-w-2xl mx-auto px-5 py-20 text-center">
        <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">&larr; Back to Academy</Link>
      </section>
      {/* === LESSON COMPLETE === */}
    </div>
  );
}
