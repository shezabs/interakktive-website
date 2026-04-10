// app/academy/lesson/mental-reset/page.tsx
// ATLAS Academy — Lesson 4.12: The 30-Day Mental Reset [PRO]
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Crown, ArrowRight, ChevronDown } from 'lucide-react';

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
// CALENDAR ANIMATION — 4-week progressive phases
// ============================================================
function CalendarAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);
    const padL = 20;
    const padR = 20;
    const padT = 35;
    const padB = 25;
    const chartW = w - padL - padR;
    const weekW = chartW / 4;
    const barH = h - padT - padB;

    const weeks = [
      { label: 'WEEK 1', subtitle: 'Detox', color: '#ef4444', tasks: ['No live trading', 'Journal review', 'Physical exercise'] },
      { label: 'WEEK 2', subtitle: 'Rebuild', color: '#eab308', tasks: ['Demo only', 'Backtest edge', 'Rewrite rules'] },
      { label: 'WEEK 3', subtitle: 'Test', color: '#3b82f6', tasks: ['Demo at 0.25R', 'Process grading', 'Routine drills'] },
      { label: 'WEEK 4', subtitle: 'Return', color: '#22c55e', tasks: ['Live at 0.5R', 'Full routine', 'Daily journal'] },
    ];

    // Progress line
    const progress = Math.min((f * 0.3) / chartW, 1);
    const lineY = padT + barH * 0.15;

    weeks.forEach((wk, i) => {
      const x = padL + i * weekW;
      const weekProgress = Math.min(Math.max((progress * chartW - i * weekW) / weekW, 0), 1);
      const r = parseInt(wk.color.slice(1, 3), 16);
      const g = parseInt(wk.color.slice(3, 5), 16);
      const b = parseInt(wk.color.slice(5, 7), 16);

      // Week background
      ctx.fillStyle = `rgba(${r},${g},${b},${0.04 * weekProgress})`;
      ctx.beginPath();
      ctx.roundRect(x + 4, padT, weekW - 8, barH, 8);
      ctx.fill();

      // Week border
      ctx.strokeStyle = `rgba(${r},${g},${b},${0.12 * weekProgress})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x + 4, padT, weekW - 8, barH, 8);
      ctx.stroke();

      // Week label
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillStyle = `rgba(${r},${g},${b},${0.7 * weekProgress})`;
      ctx.fillText(wk.label, x + weekW / 2, padT + 20);

      // Subtitle
      ctx.font = 'bold 7px system-ui';
      ctx.fillStyle = `rgba(${r},${g},${b},${0.4 * weekProgress})`;
      ctx.fillText(wk.subtitle.toUpperCase(), x + weekW / 2, padT + 33);

      // Tasks
      wk.tasks.forEach((task, ti) => {
        const taskY = padT + 52 + ti * 18;
        const taskAlpha = Math.min(Math.max(weekProgress * 3 - ti * 0.5, 0), 1);
        ctx.font = '7px system-ui';
        ctx.fillStyle = `rgba(${r},${g},${b},${0.3 * taskAlpha})`;
        ctx.fillText(task, x + weekW / 2, taskY);
      });

      // Progress dot
      if (weekProgress > 0) {
        ctx.fillStyle = `rgba(${r},${g},${b},${0.6 * weekProgress})`;
        ctx.beginPath();
        ctx.arc(x + weekW / 2, lineY, 4 * weekProgress, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Progress line connecting dots
    const lineEnd = padL + progress * chartW;
    ctx.strokeStyle = 'rgba(148,163,184,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL + weekW / 2, lineY);
    ctx.lineTo(Math.min(lineEnd, padL + chartW - weekW / 2), lineY);
    ctx.stroke();

    // Arrow
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(148,163,184,0.3)';
    ctx.fillText('→ PROGRESS →', w / 2, h - 8);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// PHOENIX ANIMATION — Rebirth from ashes
// ============================================================
function PhoenixAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);
    const midX = w / 2;
    const midY = h / 2;

    // Ashes at bottom (fading embers)
    for (let i = 0; i < 15; i++) {
      const ex = midX + (Math.sin(i * 2.3) * w * 0.3);
      const ey = h - 30 + Math.sin(i * 1.1) * 10;
      const alpha = 0.1 + Math.sin(f * 0.03 + i * 0.7) * 0.08;
      ctx.fillStyle = `rgba(239,68,68,${alpha})`;
      ctx.beginPath();
      ctx.arc(ex, ey, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Rising particles (transformation)
    for (let i = 0; i < 20; i++) {
      const phase = (f * 0.02 + i * 0.3) % 1;
      const startY = h - 30;
      const endY = 30;
      const py = startY + (endY - startY) * phase;
      const px = midX + Math.sin(phase * Math.PI * 3 + i * 1.5) * (30 + i * 3);
      const size = 1.5 * (1 - phase);

      // Color transitions: red at bottom → amber in middle → green at top
      const r2 = phase < 0.5 ? 239 : Math.round(239 - (239 - 34) * ((phase - 0.5) * 2));
      const g2 = phase < 0.5 ? Math.round(68 + (179 - 68) * (phase * 2)) : Math.round(179 + (197 - 179) * ((phase - 0.5) * 2));
      const b2 = phase < 0.5 ? 68 : Math.round(68 + (94 - 68) * ((phase - 0.5) * 2));
      const alpha = 0.3 * (1 - phase * 0.5);
      ctx.fillStyle = `rgba(${r2},${g2},${b2},${alpha})`;
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Central glow
    const pulse = Math.sin(f * 0.03) * 0.3 + 0.7;
    const gradient = ctx.createRadialGradient(midX, midY + 20, 0, midX, midY + 20, 60);
    gradient.addColorStop(0, `rgba(245,158,11,${0.06 * pulse})`);
    gradient.addColorStop(1, 'rgba(245,158,11,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(midX, midY + 20, 60, 0, Math.PI * 2);
    ctx.fill();

    // Labels
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(239,68,68,0.4)';
    ctx.fillText('OLD HABITS', midX, h - 12);
    ctx.fillStyle = 'rgba(34,197,94,0.4)';
    ctx.fillText('NEW DISCIPLINE', midX, 18);
    ctx.fillStyle = `rgba(245,158,11,${0.5 * pulse})`;
    ctx.font = 'bold 10px system-ui';
    ctx.fillText('TRANSFORMATION', midX, midY + 22);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// DATA
// ============================================================
const week1Tasks = [
  { task: 'Stop all live trading', desc: 'Zero live trades for 7 days. This is non-negotiable. Your account needs a break and so does your brain. If you can&apos;t stop for one week, that itself is a warning sign.', priority: 'critical' },
  { task: 'Review your last 50 journal entries', desc: 'Read every entry. Look for patterns: when do you break rules? Which emotions precede your worst trades? What time of day produces most losses? Write down every pattern you find.', priority: 'critical' },
  { task: 'Exercise every day', desc: 'Minimum 30 minutes of physical activity. Walking counts. Exercise reduces cortisol (stress hormone) and increases serotonin (mood regulator). Your trading psychology starts with your body.', priority: 'high' },
  { task: 'Write your &ldquo;trading autobiography&rdquo;', desc: 'A 1&ndash;2 page document answering: Why did I start trading? What have I learned? What are my biggest weaknesses? What would I tell my day-one self? This creates self-awareness that no indicator can provide.', priority: 'high' },
  { task: 'Delete social media trading accounts (temporarily)', desc: 'Unfollow or mute every trading account for 30 days. Other people&apos;s P&amp;L screenshots, signals, and opinions are noise that contaminates your reset. You need silence to hear your own thoughts.', priority: 'medium' },
];

const week2Tasks = [
  { task: 'Backtest your strategy on 100 trades', desc: 'Manual backtesting only &mdash; no automation. Click through historical charts, mark entries, record results. This rebuilds confidence in your edge and reminds you WHY the strategy works.', priority: 'critical' },
  { task: 'Rewrite your trading plan from scratch', desc: 'Don&apos;t copy-paste the old one. Write it fresh. Entry criteria, exit rules, risk parameters, session times, circuit breakers. If you can&apos;t write it clearly, you don&apos;t understand it clearly.', priority: 'critical' },
  { task: 'Demo trade with full process', desc: 'Take demo trades following your new plan exactly. Journal them with full 12-field entries. Process grade every trade. The P&amp;L is irrelevant &mdash; the PROCESS is the test.', priority: 'high' },
  { task: 'Create your rules card', desc: 'A physical card (index card, laminated sheet) with your top 5&ndash;7 rules. This goes next to your monitor and is read aloud before every session for the rest of your trading career.', priority: 'high' },
  { task: 'Identify your top 3 psychological weaknesses', desc: 'From your Week 1 journal review, name your three biggest enemies. Examples: &ldquo;Revenge trading after losses&rdquo;, &ldquo;FOMO on social media setups&rdquo;, &ldquo;Overtrading in the last hour.&rdquo; Write specific rules to counter each one.', priority: 'high' },
];

const week3Tasks = [
  { task: 'Demo trade at 0.25R equivalent', desc: 'Full sessions, full routine, but simulated at quarter size. This builds execution confidence without real-money pressure. Aim for 90%+ process compliance across 10+ demo trades.', priority: 'critical' },
  { task: 'Practice your full routine daily', desc: 'Pre-session prep, in-session execution, post-session journal. Time each phase. By the end of Week 3, the routine should feel automatic &mdash; not something you have to remember.', priority: 'critical' },
  { task: 'Process grade every single demo trade', desc: 'A+ to F, using the 5-criteria rubric from Lesson 4.7. If your average process grade is below B+, stay in Week 3 for another week. Do NOT rush to live.', priority: 'high' },
  { task: 'Visualisation practice', desc: '10 minutes per day: close your eyes and mentally walk through your ideal trading day. See yourself following the routine, waiting patiently, executing calmly, journaling thoroughly. Mental rehearsal wires the neural pathways.', priority: 'medium' },
  { task: 'Weekly review meeting with yourself', desc: 'Sunday evening, 30 minutes. Review the week&apos;s demo trades, process grades, and emotional patterns. Write one paragraph: &ldquo;This week I learned...&rdquo; and one paragraph: &ldquo;Next week I will focus on...&rdquo;', priority: 'high' },
];

const week4Tasks = [
  { task: 'Return to live trading at 0.5R', desc: 'Half your normal size. This is a graduated return, not a celebration. 0.5R for a minimum of 2 weeks before considering full size. The goal: prove you can execute the new routine with real money at stake.', priority: 'critical' },
  { task: 'Follow the full routine with zero exceptions', desc: 'Every pre-session step. Every in-session rule. Every post-session journal entry. If you miss any step, you stop trading for the day and journal WHY you skipped it.', priority: 'critical' },
  { task: 'Daily process compliance score', desc: 'At the end of each day, calculate: (process-correct trades / total trades) &times; 100. Target: 90%+. This number matters more than your P&amp;L for the entire first month back.', priority: 'high' },
  { task: 'No size increase for 2 more weeks', desc: 'Even if you&apos;re profitable. Even if you feel great. Stay at 0.5R until you have 2 full weeks of 90%+ process compliance. Then &mdash; and ONLY then &mdash; move to 0.75R.', priority: 'high' },
  { task: 'Celebrate the process, not the profits', desc: 'At the end of Week 4, celebrate if your process compliance was 90%+. That IS the victory. The profits are a byproduct. If process was below 90%, extend the reset by another week.', priority: 'medium' },
];

const triggers = [
  { trigger: 'You&apos;ve blown 2 or more accounts', desc: 'Multiple blown accounts mean the problem is psychological, not strategic. You need a full reset before risking more capital.' },
  { trigger: 'Your drawdown exceeds -15%', desc: 'At -15%, your emotional state is severely compromised. Continuing to trade is gambling, not trading. A reset prevents the spiral from continuing.' },
  { trigger: 'You can&apos;t follow your own rules for 5+ consecutive days', desc: 'Persistent rule-breaking despite knowing the rules means your habits have overridden your knowledge. You need to rebuild the habits from scratch.' },
  { trigger: 'Trading is causing anxiety, insomnia, or relationship problems', desc: 'When trading impacts your health or relationships, you&apos;ve lost perspective. The reset restores the boundary between trading and the rest of your life.' },
  { trigger: 'You don&apos;t know what your edge is anymore', desc: 'If asked &ldquo;What is your strategy?&rdquo; and you can&apos;t explain it in 3 sentences, you&apos;ve drifted. The reset rebuilds clarity.' },
];

const myths = [
  { myth: '&ldquo;Taking a break means I&apos;m weak&rdquo;', reality: 'Professional athletes take recovery weeks. Elite soldiers rotate off the front line. Fund managers take sabbaticals. Stepping back to rebuild is the strongest thing a trader can do. Continuing to trade broken is what&apos;s weak.' },
  { myth: '&ldquo;I&apos;ll miss opportunities while I&apos;m on reset&rdquo;', reality: 'The market has been open for over 100 years. It will be there in 30 days. The setups will come back. Your capital and mental health might not if you keep trading without a reset.' },
  { myth: '&ldquo;30 days is too long &mdash; a weekend break is enough&rdquo;', reality: 'It takes 21+ days to form new habits. A weekend break doesn&apos;t rewire anything &mdash; you return on Monday with the same problems. The 30-day structure systematically rebuilds every layer: physical, analytical, routine, and live execution.' },
  { myth: '&ldquo;I&apos;ll lose my skills if I stop trading for a month&rdquo;', reality: 'You won&apos;t lose skills &mdash; you&apos;ll lose BAD habits. Demo trading in Weeks 2-3 maintains execution skills while the reset eliminates destructive patterns. You return sharper, not rustier.' },
];

const mistakes = [
  { wrong: 'Rushing through the reset to get back to live trading', right: 'Each week has exit criteria. If you can&apos;t meet them, you repeat the week. Rushing defeats the entire purpose. The reset takes exactly as long as it needs to.', emoji: '&#9200;' },
  { wrong: 'Skipping the demo phase (&ldquo;I know how to trade, I just need discipline&rdquo;)', right: 'If you &ldquo;just needed discipline,&rdquo; you wouldn&apos;t need a reset. The demo phase rebuilds execution habits in a zero-pressure environment. Skip it and the old habits return under live pressure.', emoji: '&#128187;' },
  { wrong: 'Returning to full size immediately after the reset', right: '0.5R for 2 weeks minimum. Then 0.75R. Then 1R. Graduated return. If you jump to full size, one bad day can psychologically undo the entire 30-day reset.', emoji: '&#128200;' },
  { wrong: 'Doing the reset alone without any accountability', right: 'Tell someone: a trading partner, a mentor, or even a non-trading friend. &ldquo;I&apos;m doing a 30-day trading reset. Ask me about it in 2 weeks.&rdquo; External accountability doubles completion rates.', emoji: '&#129309;' },
];

const gameScenarios = [
  { scenario: 'You&apos;ve just blown your second prop firm account in 3 months. Your friend says: &ldquo;Just buy another challenge and trade tighter this time.&rdquo; What should you do?', options: ['Buy another challenge immediately &mdash; the third time&apos;s the charm', 'Start the 30-day mental reset. Two blown accounts = the problem is psychological, not strategic. Trading tighter without fixing the root cause produces the same result.', 'Take a 3-day break then buy another challenge'], correct: 1, explain: 'Two blown accounts is a clear trigger for a full reset. The pattern will repeat with a new challenge unless the underlying psychology is rebuilt. 30 days of structured work beats 30 days of repeating the same mistakes.' },
  { scenario: 'It&apos;s Day 4 of your Week 1 detox. You see an incredible setup on Gold while checking the news. The urge to trade is overwhelming. What do you do?', options: ['Take it on demo &mdash; it&apos;s not real money so it doesn&apos;t count as breaking the detox', 'Take it live &mdash; you can&apos;t miss a setup this good', 'Screenshot it, close the chart, go for a walk. Week 1 is zero trading &mdash; live OR demo. The setup confirms your edge exists. It will come again.'], correct: 2, explain: 'Week 1 is a complete detox from ALL trading &mdash; including demo. The purpose is to break the compulsive need to act. Screenshotting it shows discipline. The setup confirms your analysis is sound. It will return.' },
  { scenario: 'You&apos;re in Week 3 (demo trading). Your process grade across 12 demo trades is 75%. Your plan says you need 90%+ to move to Week 4. It&apos;s been 7 days already. What do you do?', options: ['Move to Week 4 anyway &mdash; 75% is close enough and you&apos;re eager to trade live', 'Repeat Week 3. 75% process compliance means old habits are still active. Moving to live trading at 75% will produce the same results that triggered the reset.', 'Skip to live trading at 0.25R as a compromise'], correct: 1, explain: 'The exit criteria exist for a reason. 75% means 1 in 4 trades is breaking the plan. Under live pressure, that number drops further. Repeat Week 3 until you consistently hit 90%+. The extra week is an investment, not a delay.' },
  { scenario: 'Week 4, Day 3. You&apos;re live at 0.5R. You&apos;ve had 2 winners and 1 loser, all with A+ process grades. You feel fantastic. The temptation: &ldquo;I&apos;m clearly fixed. Let me go back to 1R.&rdquo;', options: ['Go back to 1R &mdash; the reset worked and I&apos;m ready', 'Stay at 0.5R. Three trades is not enough data. The plan says 2 full weeks at 0.5R with 90%+ process before ANY size increase. Follow the plan.', 'Increase to 0.75R as a middle ground'], correct: 1, explain: 'Three trades is noise, not signal. The graduated return exists because early success after a reset feels euphoric &mdash; and euphoria is overconfidence in disguise. Two full weeks of data at 0.5R. Then 0.75R. Then 1R.' },
  { scenario: 'You complete the full 30-day reset. Process compliance: 92%. You feel disciplined and focused. Three weeks later, you notice old habits creeping back: skipping pre-session prep, overtrading on Fridays. What do you do?', options: ['Start another full 30-day reset', 'Catch it early. Do a &ldquo;mini-reset&rdquo;: 1 week off, review journal, demo for 3 days, return at reduced size. You don&apos;t need the full programme &mdash; you caught it before it spiralled.', 'Ignore it &mdash; everyone has off days'], correct: 1, explain: 'Catching early warning signs is the sign of a mature trader. A mini-reset (1 week) addresses the drift before it becomes a crisis. Ignoring it guarantees a full relapse. You don&apos;t need 30 days &mdash; you caught it early.' },
];

const quizQuestions = [
  { q: 'What is the purpose of Week 1 in the 30-day reset?', opts: ['Demo trading with new strategies', 'Complete detox &mdash; zero trading, journal review, physical exercise, self-reflection', 'Backtesting and strategy development', 'Live trading at reduced size'], a: 1, explain: 'Week 1 is a complete detox. No live trading, no demo trading. The focus is breaking the compulsive need to trade and reviewing journal data to identify psychological patterns.' },
  { q: 'When should a trader consider a 30-day mental reset?', opts: ['After any losing week', 'After blowing 2+ accounts, exceeding -15% drawdown, or persistent inability to follow their own rules', 'Every quarter as maintenance', 'Only when a mentor recommends it'], a: 1, explain: 'The reset is triggered by serious structural problems: multiple blown accounts, severe drawdowns, or chronic rule-breaking. It&apos;s a recovery programme, not routine maintenance.' },
  { q: 'What is the minimum process compliance needed to move from Week 3 (demo) to Week 4 (live)?', opts: ['70%', '80%', '90%', '100%'], a: 2, explain: '90%+ process compliance across demo trades. If you can&apos;t follow the plan in a zero-pressure demo environment, you certainly can&apos;t follow it with real money. Repeat Week 3 until you hit 90%+.' },
  { q: 'At what size should you return to live trading in Week 4?', opts: ['Full 1R immediately', '0.75R', '0.5R with graduated increase over 2+ weeks', '0.25R'], a: 2, explain: '0.5R for a minimum of 2 weeks. Then 0.75R. Then 1R. The graduated return prevents one bad day from psychologically undoing the entire reset. Each size increase requires sustained process compliance.' },
  { q: 'Why is Week 1 a COMPLETE detox (no demo trading either)?', opts: ['Because demo platforms are unreliable', 'Because the purpose is to break the compulsive need to act &mdash; any trading, even demo, feeds the compulsion', 'Because you need to focus on learning new strategies', 'Because your broker account needs to settle'], a: 1, explain: 'The Week 1 detox breaks the addiction cycle. Even demo trading satisfies the compulsive urge. True detox means no charts, no entries, no exits. Journal review and physical activity replace the trading habit.' },
  { q: 'What should you do if your process compliance is 75% at the end of Week 3?', opts: ['Move to Week 4 &mdash; close enough', 'Repeat Week 3 until you consistently achieve 90%+', 'Switch to a simpler strategy', 'Skip ahead to live trading at smaller size'], a: 1, explain: '75% means 1 in 4 trades is breaking the plan. Under live pressure, that ratio worsens. Repeat Week 3. The extra time is an investment in preventing the same problems that triggered the reset.' },
  { q: 'Three weeks after completing the reset, old habits start creeping back. What should you do?', opts: ['Start a full 30-day reset again', 'A mini-reset: 1 week off, journal review, 3 days demo, return at reduced size', 'Ignore it &mdash; occasional lapses are normal', 'Quit trading permanently'], a: 1, explain: 'Catching early warning signs is maturity. A mini-reset (1 week) addresses the drift before it becomes a crisis. You don&apos;t need the full 30 days because you caught it early. Ignoring it guarantees a full relapse.' },
  { q: 'What is the single most important metric during the first month back after a reset?', opts: ['Total P&amp;L', 'Win rate', 'Process compliance percentage', 'Number of trades taken'], a: 2, explain: 'Process compliance is the ONLY metric that matters for the first month. Profits are a byproduct. If process compliance is 90%+ at 0.5R, the system is working. P&amp;L takes care of itself.' },
];

export default function MentalResetPage() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h); }, []);

  const [openTrigger, setOpenTrigger] = useState<string | null>(null);
  const [openMyth, setOpenMyth] = useState<string | null>(null);
  const [openMistake, setOpenMistake] = useState<string | null>(null);

  // Weekly tracker
  const [activeWeek, setActiveWeek] = useState(0);
  const weekData = [week1Tasks, week2Tasks, week3Tasks, week4Tasks];
  const weekLabels = ['Week 1 — Detox', 'Week 2 — Rebuild', 'Week 3 — Test', 'Week 4 — Return'];
  const weekColors = ['red', 'amber', 'blue', 'green'];
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({});

  // Game
  const [gameRound, setGameRound] = useState(0);
  const [gameAnswer, setGameAnswer] = useState<number | null>(null);
  const [gameScore, setGameScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  // Quiz
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(Array(quizQuestions.length).fill(null));
  const quizDone = quizAnswers.every(a => a !== null);
  const score = quizDone ? Math.round(quizAnswers.filter((a, i) => a === quizQuestions[i].a).length / quizQuestions.length * 100) : 0;
  const certUnlocked = quizDone && score >= 66;

  const currentGame = gameScenarios[gameRound];
  const currentWeekTasks = weekData[activeWeek];
  const currentWeekChecked = currentWeekTasks.filter(t => checkedTasks[`${activeWeek}-${t.task}`]).length;

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-900/50"><motion.div className="h-full bg-gradient-to-r from-amber-500 to-accent-500" style={{ width: `${Math.min((scrollY / (typeof document !== 'undefined' ? document.body.scrollHeight - window.innerHeight : 1)) * 100, 100)}%` }} /></div>
      <nav className="sticky top-0 z-40 px-5 py-3 flex items-center justify-between" style={{ background: 'rgba(6,10,18,0.85)', backdropFilter: 'blur(16px)' }}>
        <Link href="/academy" className="text-xs text-gray-500 hover:text-gray-300 transition">&larr; Academy</Link>
        <div className="flex items-center gap-2"><Crown className="w-3.5 h-3.5 text-amber-400" /><span className="text-xs font-bold text-amber-400">PRO &middot; LEVEL 4</span></div>
      </nav>

      <section className="px-5 pt-16 pb-12 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 4 &middot; Lesson 12</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight"><span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>The 30-Day Mental Reset</span></h1>
          <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">A complete recovery programme. Four weeks to rebuild your trading psychology from the ground up.</p>
        </motion.div>
      </section>

      {/* S00 — WHY THIS MATTERS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-lg font-bold text-white mb-3">&#128293; When a building is structurally compromised, you don&apos;t repaint the walls. You strip it back to the foundation, inspect every beam, replace what&apos;s damaged, and rebuild from the ground up.</p>
            <p className="text-gray-400 leading-relaxed mb-4">Sometimes your trading psychology is that building. Too many blown accounts, too many revenge spirals, too many broken rules. The damage isn&apos;t cosmetic &mdash; it&apos;s structural. <strong className="text-amber-400">A new indicator won&apos;t fix it. A new strategy won&apos;t fix it. Only a complete rebuild will.</strong></p>
            <p className="text-gray-400 leading-relaxed mb-4">The 30-Day Mental Reset is that rebuild. Four structured weeks that take you from <strong className="text-red-400">total detox</strong> through <strong className="text-amber-400">strategy reconstruction</strong> to <strong className="text-blue-400">controlled demo</strong> to <strong className="text-green-400">graduated live return</strong>.</p>
            <p className="text-gray-400 leading-relaxed">This isn&apos;t for everyone. It&apos;s for traders who recognise that what they&apos;ve been doing isn&apos;t working &mdash; and are brave enough to stop and rebuild.</p>
          </div>
          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">A trader blew 3 prop firm accounts in 4 months. Each time he bought a new challenge immediately, convinced the strategy was fine and he just needed &ldquo;more discipline.&rdquo; After the third blow-up, he did a 30-day reset. He discovered through journal review that 68% of his losses came from revenge trades taken within 20 minutes of a stop-out. One rule &mdash; &ldquo;15-minute mandatory break after any loss&rdquo; &mdash; transformed his results. He passed his fourth challenge in Week 3 and has been funded for 8 months since.</p>
          </div>
        </motion.div>
      </section>

      {/* S01 — THE FOUR PHASES */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Four Phases</p>
          <h2 className="text-2xl font-extrabold mb-4">Detox &rarr; Rebuild &rarr; Test &rarr; Return</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Each week has a specific purpose, specific tasks, and specific exit criteria. You don&apos;t move to the next week until the current one is complete.</p>
          <div className="mb-6 rounded-2xl overflow-hidden border border-white/5">
            <CalendarAnimation />
          </div>
        </motion.div>
      </section>

      {/* S02 — THE PHOENIX */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Transformation</p>
          <h2 className="text-2xl font-extrabold mb-4">Old Habits Burn. New Discipline Rises.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The reset isn&apos;t about becoming a different trader. It&apos;s about becoming the trader you already know how to be &mdash; without the psychological baggage holding you back.</p>
          <div className="rounded-2xl overflow-hidden border border-white/5">
            <PhoenixAnimation />
          </div>
        </motion.div>
      </section>

      {/* S03 — WHEN TO TRIGGER */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; Trigger Conditions</p>
          <h2 className="text-2xl font-extrabold mb-4">When Do You Need a Reset?</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Not every losing streak needs a 30-day reset. But these conditions do:</p>
          <div className="space-y-3">
            {triggers.map(t => (
              <div key={t.trigger}>
                <button onClick={() => setOpenTrigger(openTrigger === t.trigger ? null : t.trigger)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <p className="text-sm font-bold text-white" dangerouslySetInnerHTML={{ __html: `&#128680; ${t.trigger}` }} />
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openTrigger === t.trigger ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openTrigger === t.trigger && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden"><div className="p-4 mx-2 mt-1 rounded-xl bg-white/[0.02] border border-white/5"><p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: t.desc }} /></div></motion.div>)}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S04–S05 — INTERACTIVE WEEKLY TRACKER */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The Programme</p>
          <h2 className="text-2xl font-extrabold mb-4">Your 30-Day Tracker</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Explore each week&apos;s tasks. Tick them off as you complete them. Each task has a priority level: critical (must do), high (strongly recommended), or medium (beneficial).</p>
          <div className="p-5 rounded-2xl glass-card">
            {/* Week tabs */}
            <div className="flex gap-2 mb-5">
              {weekLabels.map((label, i) => (
                <button key={i} onClick={() => setActiveWeek(i)} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeWeek === i ? `${weekColors[i] === 'red' ? 'bg-red-500/15 text-red-400 border border-red-500/30' : weekColors[i] === 'amber' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : weekColors[i] === 'blue' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30' : 'bg-green-500/15 text-green-400 border border-green-500/30'}` : 'glass text-gray-500'}`}>{label.split(' — ')[0]}</button>
              ))}
            </div>
            <p className={`text-sm font-bold mb-4 ${weekColors[activeWeek] === 'red' ? 'text-red-400' : weekColors[activeWeek] === 'amber' ? 'text-amber-400' : weekColors[activeWeek] === 'blue' ? 'text-blue-400' : 'text-green-400'}`}>{weekLabels[activeWeek]}</p>
            <div className="space-y-2">
              {currentWeekTasks.map(t => {
                const key = `${activeWeek}-${t.task}`;
                return (
                  <button key={key} onClick={() => setCheckedTasks(prev => ({ ...prev, [key]: !prev[key] }))} className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${checkedTasks[key] ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'glass text-gray-400 hover:bg-white/5'}`}>
                    <div className="flex items-start justify-between">
                      <span>{checkedTasks[key] ? '\u2713 ' : '\u25CB '}<span dangerouslySetInnerHTML={{ __html: t.task }} /></span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ml-2 ${t.priority === 'critical' ? 'text-red-400 bg-red-500/10' : t.priority === 'high' ? 'text-amber-400 bg-amber-500/10' : 'text-gray-400 bg-gray-500/10'}`}>{t.priority}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed" dangerouslySetInnerHTML={{ __html: t.desc }} />
                  </button>
                );
              })}
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 text-center">
              <p className={`text-sm font-bold ${currentWeekChecked === currentWeekTasks.length ? 'text-green-400' : 'text-gray-500'}`}>{currentWeekChecked}/{currentWeekTasks.length} tasks completed</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S06 — GRADUATED RETURN */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; The Return Ladder</p>
          <h2 className="text-2xl font-extrabold mb-4">How to Come Back Safely</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The graduated return is as important as the reset itself. Jumping back to full size undoes everything.</p>
          <div className="p-5 rounded-2xl glass-card space-y-3">
            {[
              { phase: 'Week 4', size: '0.5R', criteria: '90%+ process compliance on demo in Week 3', color: 'blue' },
              { phase: 'Week 5-6', size: '0.5R', criteria: '2 full weeks of 90%+ process compliance at 0.5R live', color: 'blue' },
              { phase: 'Week 7-8', size: '0.75R', criteria: '2 more weeks of 90%+ process at 0.75R', color: 'amber' },
              { phase: 'Week 9+', size: '1.0R', criteria: 'Sustained process compliance. Full routine automatic.', color: 'green' },
            ].map((tier, i) => (
              <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${tier.color === 'blue' ? 'border-blue-500/15 bg-blue-500/[0.03]' : tier.color === 'amber' ? 'border-amber-500/15 bg-amber-500/[0.03]' : 'border-green-500/15 bg-green-500/[0.03]'}`}>
                <div><p className="text-sm font-bold text-white">{tier.phase}</p><p className="text-xs text-gray-500">{tier.criteria}</p></div>
                <p className={`text-lg font-extrabold ${tier.color === 'blue' ? 'text-blue-400' : tier.color === 'amber' ? 'text-amber-400' : 'text-green-400'}`}>{tier.size}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S07 — MYTHS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Myths Busted</p>
          <h2 className="text-2xl font-extrabold mb-4">Reset Myths That Prevent Recovery</h2>
          <div className="space-y-3">
            {myths.map(m => (
              <div key={m.myth}>
                <button onClick={() => setOpenMyth(openMyth === m.myth ? null : m.myth)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <p className="text-sm font-bold text-white" dangerouslySetInnerHTML={{ __html: m.myth }} />
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openMyth === m.myth ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openMyth === m.myth && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden"><div className="p-4 mx-2 mt-1 rounded-xl bg-white/[0.02] border border-white/5"><p className="text-xs font-bold text-green-400 mb-1">&#10003; Reality:</p><p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: m.reality }} /></div></motion.div>)}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S08 — COMMON MISTAKES */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-4">What Most Traders Get Wrong</h2>
          <div className="space-y-3">
            {mistakes.map(m => (
              <div key={m.wrong}>
                <button onClick={() => setOpenMistake(openMistake === m.wrong ? null : m.wrong)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <div className="flex items-center gap-3"><span dangerouslySetInnerHTML={{ __html: m.emoji }} /><p className="text-sm font-bold text-white" dangerouslySetInnerHTML={{ __html: `&#10060; ${m.wrong}` }} /></div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openMistake === m.wrong ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openMistake === m.wrong && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden"><div className="p-4 mx-2 mt-1 rounded-xl bg-white/[0.02] border border-white/5"><p className="text-xs font-bold text-green-400 mb-1">&#10003; Instead:</p><p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: m.right }} /></div></motion.div>)}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S09 — GAME */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Discipline Game</p>
          <h2 className="text-2xl font-extrabold mb-6">Reset Decisions &mdash; 5 Scenarios</h2>
          {!gameComplete ? (
          <div className="p-5 rounded-2xl glass-card">
            <p className="text-xs text-amber-400 font-bold mb-4">Round {gameRound + 1} of {gameScenarios.length}</p>
            <p className="text-sm text-gray-300 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: currentGame.scenario }} />
            <div className="space-y-2">
              {currentGame.options.map((opt, oi) => {
                const answered = gameAnswer !== null;
                const isCorrect = oi === currentGame.correct;
                const isChosen = gameAnswer === oi;
                let cls = 'glass text-gray-300 hover:bg-white/5';
                if (answered) { if (isCorrect) cls = 'bg-green-500/15 border-green-500/30 text-green-400'; else if (isChosen) cls = 'bg-red-500/15 border-red-500/30 text-red-400'; else cls = 'glass text-gray-600'; }
                return (<button key={oi} onClick={() => { if (!answered) { setGameAnswer(oi); if (oi === currentGame.correct) setGameScore(s => s + 1); } }} disabled={answered} className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt }} /> {answered && isCorrect && '\u2713'} {answered && isChosen && !isCorrect && '\u2717'}</button>);
              })}
            </div>
            {gameAnswer !== null && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 text-sm text-gray-400 leading-relaxed"><span dangerouslySetInnerHTML={{ __html: currentGame.explain }} /></motion.div>)}
            {gameAnswer !== null && (
              <div className="mt-4">
                {gameRound < gameScenarios.length - 1 ? (
                  <button onClick={() => { setGameRound(r => r + 1); setGameAnswer(null); }} className="w-full p-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all">Next Round &rarr;</button>
                ) : (
                  <button onClick={() => setGameComplete(true)} className="w-full p-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all">See Results &rarr;</button>
                )}
              </div>
            )}
          </div>
          ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-8 glass-card rounded-2xl">
            <p className="text-4xl font-extrabold text-amber-400 mb-2">{gameScore}/{gameScenarios.length}</p>
            <p className="text-sm text-gray-400">{gameScore === 5 ? 'Perfect reset awareness. You understand the rebuild.' : gameScore >= 3 ? 'Good recovery instincts. Review the exit criteria and graduated return.' : 'The reset is a programme, not a break. Re-read all four phases.'}</p>
          </motion.div>
          )}
        </motion.div>
      </section>

      {/* S10 — QUIZ */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Knowledge Check</p>
          <h2 className="text-2xl font-extrabold mb-6">The 30-Day Reset Quiz</h2>
        </motion.div>
        <div className="space-y-6">
          {quizQuestions.map((q, qi) => (
            <motion.div key={qi} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="p-5 rounded-2xl glass-card">
              <p className="text-sm font-bold text-white mb-3" dangerouslySetInnerHTML={{ __html: `${qi + 1}. ${q.q}` }} />
              <div className="space-y-2">
                {q.opts.map((opt, oi) => {
                  const answered = quizAnswers[qi] !== null;
                  const isCorrect = oi === q.a;
                  const isChosen = quizAnswers[qi] === oi;
                  let cls = 'glass text-gray-300 hover:bg-white/5';
                  if (answered) { if (isCorrect) cls = 'bg-green-500/15 border-green-500/30 text-green-400'; else if (isChosen) cls = 'bg-red-500/15 border-red-500/30 text-red-400'; else cls = 'glass text-gray-600'; }
                  return (<button key={oi} onClick={() => { if (!answered) { const na = [...quizAnswers]; na[qi] = oi; setQuizAnswers(na); } }} disabled={answered} className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt }} /> {answered && isCorrect && '\u2713'} {answered && isChosen && !isCorrect && '\u2717'}</button>);
                })}
              </div>
              {quizAnswers[qi] !== null && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 text-sm text-gray-400 leading-relaxed"><span className="text-amber-400 font-bold">&#10003;</span> <span dangerouslySetInnerHTML={{ __html: q.explain }} /></motion.div>)}
            </motion.div>
          ))}
        </div>
        {quizDone && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 text-center p-8 glass-card rounded-2xl"><p className={`text-5xl font-extrabold mb-2 ${score >= 66 ? 'text-amber-400' : 'text-red-400'}`}>{score}%</p><p className="text-sm text-gray-400">{score === 100 ? '&#128293; Perfect. From ashes, discipline rises.' : score >= 66 ? 'Strong recovery mindset. Bookmark this lesson for when you need it.' : 'Review all four phases and the trigger conditions.'}</p></motion.div>)}
      </section>

      {/* Certificate */}
      <section className="px-5 py-16 text-center">
        {!certUnlocked ? (
          <div className="max-w-md mx-auto p-8 glass rounded-2xl"><p className="text-4xl mb-3 opacity-30">&#128274;</p><p className="text-sm text-gray-500">Score 66%+ to unlock your <strong className="text-amber-400">Pro Certificate</strong></p></div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, type: 'spring' }}
            className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(239,68,68,0.06),transparent,rgba(234,179,8,0.04),transparent,rgba(34,197,94,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
            <div className="absolute inset-[1px] rounded-3xl border border-amber-500/10" />
            <div className="relative z-10">
              <div className="w-[80px] h-[80px] mx-auto mb-5 rounded-full bg-gradient-to-br from-red-500 via-amber-500 to-green-500 flex items-center justify-center text-4xl shadow-lg shadow-amber-500/20">&#128293;</div>
              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest mb-2">Pro Certificate</p>
              <h3 className="text-xl font-extrabold mb-1">Certificate of Mastery</h3>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">Has mastered<br /><strong className="text-white">Level 4.12: The 30-Day Mental Reset</strong><br />at ATLAS Academy by Interakktive</p>
              <p className="bg-gradient-to-r from-red-400 via-amber-400 to-green-400 bg-clip-text text-transparent font-bold text-lg mb-1" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Phoenix Trader &mdash;</p>
              <p className="font-mono text-[11px] text-gray-500 mb-4">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L4.12-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
            </div>
          </motion.div>
        )}
      </section>

      <section className="text-center px-5 pt-10 pb-24">
        <p className="text-xs tracking-widest uppercase text-gray-600 mb-4">Up Next</p>
        <h2 className="text-xl font-bold mb-6">Lesson 4.13 &mdash; Performance Under Pressure</h2>
        <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">
          Continue <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
