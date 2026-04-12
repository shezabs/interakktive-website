// app/academy/lesson/choosing-your-battlefield/page.tsx
// ATLAS Academy — Lesson 6.2: Choosing Your Battlefield [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 6
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
// ANIMATION 1: Market Personalities — 4 mini price charts
// Each asset has a distinct visual behaviour
// ============================================================
function MarketPersonalityAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.015;
    const cols = 4;
    const colW = w / cols;
    const top = 36;
    const bot = h - 40;
    const seed = (n: number) => Math.sin(n * 127.1 + 311.7) * 0.5 + 0.5;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Each Market Has a Personality', w / 2, 14);

    const assets = [
      { name: 'GOLD', color: '#f59e0b', volatility: 2.5, trend: 0.3, personality: 'Heavyweight' },
      { name: 'EUR/USD', color: '#3b82f6', volatility: 0.8, trend: 0.1, personality: 'Steady' },
      { name: 'NASDAQ', color: '#a78bfa', volatility: 3.0, trend: 0.5, personality: 'Momentum' },
      { name: 'BITCOIN', color: '#ef4444', volatility: 4.0, trend: 0.0, personality: 'Wild Card' },
    ];

    assets.forEach((asset, ai) => {
      const cx = colW * ai + colW / 2;
      const chartL = colW * ai + 10;
      const chartR = colW * (ai + 1) - 10;
      const chartW = chartR - chartL;

      // Divider
      if (ai > 0) {
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.beginPath(); ctx.moveTo(colW * ai, top); ctx.lineTo(colW * ai, bot + 20); ctx.stroke();
      }

      // Asset label
      ctx.fillStyle = asset.color;
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(asset.name, cx, top - 2);

      // Mini price chart
      ctx.beginPath();
      let py = (top + bot) / 2;
      const steps = 50;
      for (let i = 0; i <= steps; i++) {
        const x = chartL + (i / steps) * chartW;
        const noise = (seed(i * 13 + ai * 97 + Math.floor(t + i * 0.1)) * 2 - 1) * asset.volatility;
        const drift = asset.trend * Math.sin((t + i * 0.05) * 0.5) * 2;
        py = Math.max(top + 8, Math.min(bot - 8, py + noise + drift));
        if (i === 0) ctx.moveTo(x, py); else ctx.lineTo(x, py);
      }
      ctx.strokeStyle = asset.color;
      ctx.lineWidth = 1.5; ctx.stroke();

      // Volatility bar
      const volBarW = chartW * 0.6;
      const volBarH = 4;
      const volBarX = cx - volBarW / 2;
      const volBarY = bot + 8;
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fillRect(volBarX, volBarY, volBarW, volBarH);
      ctx.fillStyle = `${asset.color}88`;
      ctx.fillRect(volBarX, volBarY, volBarW * (asset.volatility / 4.5), volBarH);

      // Personality label
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.font = '8px system-ui';
      ctx.fillText(asset.personality, cx, bot + 24);
    });
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 2: Lifestyle-Timeframe Match
// Rotating clock with session arcs + lifestyle profiles cycling
// ============================================================
function LifestyleTimeframeAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;
    const mid = w / 2;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Match Your Lifestyle to a Timeframe', mid, 14);

    // Clock on left
    const clockCx = w * 0.28;
    const clockCy = h * 0.52;
    const clockR = Math.min(w * 0.2, h * 0.35);

    // Clock face
    ctx.beginPath(); ctx.arc(clockCx, clockCy, clockR, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.02)'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1.5; ctx.stroke();

    // Session arcs (24-hour clock)
    const sessions = [
      { name: 'ASIA', start: 0, end: 3, color: '#a78bfa' },
      { name: 'LONDON', start: 7, end: 10, color: '#3b82f6' },
      { name: 'NY', start: 12, end: 15, color: '#34d399' },
      { name: 'OVERLAP', start: 12, end: 14, color: '#f59e0b' },
    ];

    sessions.forEach(s => {
      const startAngle = (s.start / 24) * Math.PI * 2 - Math.PI / 2;
      const endAngle = (s.end / 24) * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath(); ctx.arc(clockCx, clockCy, clockR - 8, startAngle, endAngle);
      ctx.strokeStyle = s.color; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.stroke();
    });

    // Hour markers
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2 - Math.PI / 2;
      const inner = clockR - 16;
      const outer = clockR - 2;
      ctx.strokeStyle = i % 6 === 0 ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.08)';
      ctx.lineWidth = i % 6 === 0 ? 1.5 : 0.5;
      ctx.beginPath();
      ctx.moveTo(clockCx + inner * Math.cos(angle), clockCy + inner * Math.sin(angle));
      ctx.lineTo(clockCx + outer * Math.cos(angle), clockCy + outer * Math.sin(angle));
      ctx.stroke();
    }

    // Rotating hand
    const handAngle = t * 0.5 - Math.PI / 2;
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(clockCx, clockCy);
    ctx.lineTo(clockCx + (clockR - 20) * Math.cos(handAngle), clockCy + (clockR - 20) * Math.sin(handAngle));
    ctx.stroke();

    // Center dot
    ctx.beginPath(); ctx.arc(clockCx, clockCy, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b'; ctx.fill();

    // Right panel — cycling lifestyle profiles
    const profiles = [
      { icon: '💼', title: '9-5 Worker', tf: '4H / Daily', session: 'NY Close', trades: '1-2/week', color: '#3b82f6' },
      { icon: '🦉', title: 'Night Owl', tf: '15M / 1H', session: 'Asia / Early London', trades: '2-4/day', color: '#a78bfa' },
      { icon: '💻', title: 'Full-Time', tf: '15M / 1H', session: 'London + NY', trades: '3-6/day', color: '#34d399' },
      { icon: '📅', title: 'Weekend Only', tf: 'Daily / Weekly', session: 'Plan Sunday, set orders', trades: '1-3/week', color: '#f59e0b' },
    ];

    const activeIdx = Math.floor(t * 0.4) % profiles.length;
    const p = profiles[activeIdx];
    const rx = w * 0.65;
    const ry = h * 0.28;
    const rw = w * 0.3;

    ctx.fillStyle = p.color;
    ctx.font = 'bold 24px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(p.icon, rx + rw / 2, ry);

    ctx.fillStyle = p.color;
    ctx.font = 'bold 12px system-ui';
    ctx.fillText(p.title, rx + rw / 2, ry + 22);

    const labels = [`TF: ${p.tf}`, `Session: ${p.session}`, `Frequency: ${p.trades}`];
    labels.forEach((l, i) => {
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '10px system-ui';
      ctx.fillText(l, rx + rw / 2, ry + 44 + i * 18);
    });

    // Session legend
    ctx.textAlign = 'left';
    ctx.font = '8px system-ui';
    const legX = w * 0.58;
    const legY = h - 30;
    sessions.forEach((s, i) => {
      ctx.fillStyle = s.color;
      ctx.fillRect(legX + i * 60, legY, 8, 8);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillText(s.name, legX + i * 60 + 11, legY + 8);
    });
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// DATA
// ============================================================
const assetProfiles = [
  { icon: '🥇', name: 'Gold (XAUUSD)', personality: 'The Heavyweight', analogy: 'Like driving a sports car — fast, exciting, requires skill', traits: 'High volatility, wide spreads, strong trending moves, reacts to USD and geopolitics', avgRange: '200-400 pips/day', bestSessions: 'London + NY Overlap', bestFor: 'Experienced traders who can handle fast moves and wider stops' },
  { icon: '💶', name: 'EUR/USD', personality: 'The Steady Workhorse', analogy: 'Like driving a family car — predictable, reliable, safe', traits: 'Low spreads, moderate volatility, well-structured moves, most liquid pair', avgRange: '50-80 pips/day', bestSessions: 'London + Early NY', bestFor: 'Beginners and swing traders who want clean structure with manageable risk' },
  { icon: '📈', name: 'NASDAQ (NAS100)', personality: 'The Momentum Machine', analogy: 'Like a roller coaster — thrilling but you need to hold on', traits: 'Huge intraday swings, gap-prone, tech-sector driven, strong trends', avgRange: '200-500 points/day', bestSessions: 'NY Open (first 2 hours)', bestFor: 'Momentum traders who thrive on fast directional moves' },
  { icon: '₿', name: 'Bitcoin (BTC)', personality: 'The Wild Card', analogy: 'Like weather in the mountains — changes without warning', traits: '24/7 trading, extreme volatility, liquidity varies by exchange, weekend risk', avgRange: '1,000-5,000 USD/day', bestSessions: 'US hours (highest volume)', bestFor: 'Risk-tolerant traders comfortable with large swings and 24/7 exposure' },
];

const timeframeGuide = [
  { tf: 'Daily / Weekly', screenTime: '15-30 min/day', setups: '1-3/week', personality: 'Patient, hands-off, busy lifestyle', stopSize: 'Wide (50-200+ pips)', analogy: 'Driving on a motorway — smooth, few turns, long distances' },
  { tf: '4-Hour', screenTime: '30-60 min, 2-3x/day', setups: '2-5/week', personality: 'Semi-active, checks charts at sessions', stopSize: 'Medium (30-80 pips)', analogy: 'Driving on A-roads — some turns, moderate speed' },
  { tf: '1-Hour', screenTime: '2-4 hours/day', setups: '1-3/day', personality: 'Active, can monitor during sessions', stopSize: 'Medium (15-40 pips)', analogy: 'Driving in town — frequent decisions, moderate pace' },
  { tf: '15M / 5M', screenTime: '4-8 hours/day', setups: '3-8/day', personality: 'Full-time, glued to screens', stopSize: 'Tight (5-20 pips)', analogy: 'Racing — fast, precise, no room for distraction' },
];

const gameRounds = [
  { scenario: 'Sarah works 9-5 in an office. She can check her phone at lunch and after work. She has a £2,000 account. What combination works best for her?', options: [
    { text: 'NASDAQ 5M — she can scalp during lunch break', correct: false, explain: 'A 5M timeframe requires constant attention. A lunch break check is not enough. Also, NASDAQ\'s volatility on a £2,000 account with 5M stops would require micro-lot sizing that barely covers the spread.' },
    { text: 'EUR/USD 4H — check at lunch, act on NY close setups after work', correct: true, explain: 'Correct. EUR/USD 4H gives her 2-5 setups per week. She can scan at lunch, mark levels, and execute after work when the NY session produces fresh candles. £2,000 can handle 4H stop distances on EUR/USD at 1% risk.' },
    { text: 'Gold 15M — it\'s the most popular instrument', correct: false, explain: 'Gold 15M requires constant screen time and has wide stops relative to a £2,000 account. Popularity doesn\'t mean suitability.' },
    { text: 'Bitcoin Daily — she never has to check', correct: false, explain: 'Daily Bitcoin stops can be £500+ which is 25% of her account. The sizing doesn\'t work for her capital.' },
  ]},
  { scenario: 'Marcus quit his job to trade full-time. He has a £25,000 account and can sit at his desk all day. He\'s an ex-athlete who thrives on intensity. What suits him?', options: [
    { text: 'EUR/USD Weekly — maximum safety', correct: false, explain: 'He would be bored out of his mind. A weekly timeframe with full-time availability wastes his screen time and doesn\'t match his personality.' },
    { text: 'Gold 15M during London + NY, with 1H for bias', correct: true, explain: 'Correct. Gold 15M gives him the intensity he craves. £25,000 handles Gold stop sizes easily. 1H bias + 15M entries is a professional structure. London + NY gives him 6+ hours of action daily.' },
    { text: 'Trade all 4 assets on 5M', correct: false, explain: 'Trading 4 assets simultaneously on 5M is overwhelming. Even full-time pros specialise in 1-2 instruments. He\'d spread his focus too thin.' },
    { text: 'Bitcoin 4H — it trades 24/7 so he\'s always busy', correct: false, explain: '4H on Bitcoin means checking every 4 hours including overnight. That\'s not sustainable even for full-time traders, and it doesn\'t match his "intensity" personality.' },
  ]},
  { scenario: 'A trader with a £500 account wants to scalp Bitcoin on 1-minute charts. His average stop is $50 on BTC. What\'s wrong with this plan?', options: [
    { text: 'Nothing — small accounts should scalp to grow quickly', correct: false, explain: 'Small accounts on 1M timeframes pay the highest commission-to-profit ratio. The spread alone can eat most of the profit on 1M BTC.' },
    { text: 'The commission tax makes it negative expectancy — $50 stop but $15-20 in spread/commission per trade', correct: true, explain: 'Correct. On a 1M chart, BTC\'s spread + commission is roughly $15-20 per trade. With a $50 stop, you\'re paying 30-40% of your risk just to enter. You need a 65%+ win rate just to break even. On a 4H chart, the same commission is <5% of the stop.' },
    { text: 'Bitcoin can\'t be scalped — it\'s only for swing trading', correct: false, explain: 'Bitcoin CAN be scalped by well-capitalised traders. But $500 capital with BTC spread costs makes it mathematically impossible to profit consistently.' },
    { text: 'He should switch to Gold 1M instead', correct: false, explain: 'Gold 1M has the same commission problem. The issue is the timeframe + account size combination, not the specific asset.' },
  ]},
  { scenario: 'A trader switched from EUR/USD 4H (where he was profitable) to Gold 15M because he saw a YouTube influencer making money on it. After 6 weeks on Gold, he\'s down 15%. Why?', options: [
    { text: 'Gold is rigged against retail traders', correct: false, explain: 'Gold is not rigged. Millions of traders profit from it. The issue is the switch, not the instrument.' },
    { text: 'He needs more time — 6 weeks isn\'t enough', correct: false, explain: 'While adaptation takes time, a 15% drawdown in 6 weeks suggests fundamental incompatibility, not just a learning curve.' },
    { text: 'He changed BOTH his asset and timeframe simultaneously without re-testing — it\'s a completely different strategy', correct: true, explain: 'Correct. EUR/USD 4H and Gold 15M require completely different stop sizes, session awareness, volatility management, and entry precision. He essentially started trading a new, untested strategy. The 3-Month Rule: commit to one asset for at least 3 months and 100+ trades before switching.' },
    { text: 'YouTube strategies never work in real markets', correct: false, explain: 'Some do, some don\'t. But the issue here isn\'t the strategy — it\'s abandoning a WORKING system for an untested one.' },
  ]},
  { scenario: 'EUR/USD has been flat for 3 days. A trader keeps entering trend continuation setups but getting stopped out in the chop. What should she diagnose?', options: [
    { text: 'Her entry trigger is broken — she needs a new one', correct: false, explain: 'Her trigger might be fine in trending conditions. The issue is she\'s applying a trend strategy in a range.' },
    { text: 'EUR/USD is dead — she should switch to Gold', correct: false, explain: 'Every asset has quiet periods. Switching to Gold mid-chop is chasing volatility, not solving the problem.' },
    { text: 'She should add more indicators to filter the noise', correct: false, explain: 'More indicators in a ranging market just add more conflicting signals. The diagnosis is simpler.' },
    { text: 'The REGIME changed — EUR/USD shifted from trending to ranging. Her trend strategy doesn\'t apply right now. Wait or adapt.', correct: true, explain: 'Correct. This is exactly why understanding your battlefield matters. EUR/USD goes through ranging periods regularly. A complete strategy includes knowing WHEN your setup doesn\'t apply. "No setup today" IS a valid trading decision.' },
  ]},
];

const quizQuestions = [
  { q: 'What percentage of successful funded traders specialise in 2 or fewer instruments?', opts: ['25%', '50%', '78%', '95%'], correct: 2, explain: '78% of successful funded traders traded a maximum of 2 instruments consistently. Specialisation beats diversification in trading.' },
  { q: 'Why is scalping a £500 account on 1-minute charts typically unprofitable?', opts: ['1-minute charts are inherently random', 'The commission/spread costs 30-40% of each trade\'s risk, requiring unrealistic win rates', 'You need at least £50,000 to scalp', 'Brokers manipulate 1-minute candles'], correct: 1, explain: 'On short timeframes, the spread + commission relative to your stop distance creates a "commission tax" that destroys your edge. The same strategy on a 4H chart pays <5% in commissions.' },
  { q: 'What is the "3-Month Rule" for asset selection?', opts: ['Trade an asset for 3 months before declaring it profitable', 'Switch assets every 3 months to diversify', 'Commit to ONE asset for 3 months and 100+ trades before evaluating or switching', 'Backtest 3 months of data before going live'], correct: 2, explain: 'Learning an asset is like learning a person — you need time and repetition. 100+ trades on one asset builds pattern recognition that switching every week destroys.' },
  { q: 'A 9-5 worker with a £3,000 account should AVOID which combination?', opts: ['EUR/USD on the 4H timeframe', 'Gold on the 15-minute timeframe', 'EUR/USD on the Daily timeframe', 'GBP/USD on the 4H timeframe'], correct: 1, explain: 'Gold 15M requires constant screen time (4-8 hours) and wide stops that strain a £3,000 account at 1% risk. A 9-5 worker physically cannot monitor 15M charts during sessions.' },
  { q: 'What determines your timeframe MORE than anything else?', opts: ['Your favourite YouTube trader\'s recommendation', 'Your available screen time and lifestyle', 'Which timeframe has the most candles', 'Which timeframe your broker recommends'], correct: 1, explain: 'Your timeframe must match your lifestyle. A 15M chart is useless if you can only check once a day. A Daily chart is pointless if you want 5 trades per day. Lifestyle dictates timeframe.' },
  { q: 'When an asset you trade goes flat for days, what should you do?', opts: ['Switch to a more volatile asset immediately', 'Force trades in the chop — persistence pays off', 'Recognise the regime change and either adapt your strategy or wait for trending conditions to return', 'Add more indicators to find hidden setups'], correct: 2, explain: 'Markets cycle between trending and ranging regimes. A trend strategy in a range is like wearing a winter coat in summer — the tool is fine, the conditions are wrong. Wait for your season.' },
  { q: 'Why do 67% of failed funded traders trade 4+ instruments per month?', opts: ['More instruments means more commission costs', 'Each instrument requires different stop sizes, sessions, and behaviour knowledge — spreading focus destroys expertise', 'Prop firms penalise multi-instrument trading', 'It\'s just a coincidence in the data'], correct: 1, explain: 'Each asset has unique personality, volatility patterns, session behaviour, and optimal stop sizes. Trading 4+ instruments means you\'re a generalist at all of them instead of a specialist at one.' },
  { q: 'What is the ideal progression for a new trader choosing their battlefield?', opts: ['Start with the most volatile instrument to learn fastest', 'Pick one instrument, one timeframe, one session — master it, then expand', 'Trade everything on paper, then pick the one with the best results', 'Follow whatever the market is doing today'], correct: 1, explain: 'One instrument + one timeframe + one session. Master that combination first. This gives you the deepest pattern recognition in the shortest time. Expand AFTER you\'re consistently profitable.' },
];

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

function Confetti({ active }: { active: boolean }) {
  if (!active) return null;
  return (<div className="fixed inset-0 pointer-events-none z-50">{Array.from({ length: 60 }).map((_, i) => (<motion.div key={i} initial={{ y: -20, x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400), opacity: 1 }} animate={{ y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 20, rotate: Math.random() * 720, opacity: 0 }} transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5 }} className="absolute w-2 h-2 rounded-sm" style={{ background: ['#f59e0b', '#d946ef', '#34d399', '#3b82f6', '#ef4444'][i % 5] }} />))}</div>);
}

export default function ChoosingYourBattlefieldLesson() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);

  // Expandable assets
  const [openAsset, setOpenAsset] = useState<number | null>(null);
  // Expandable timeframes
  const [openTf, setOpenTf] = useState<number | null>(null);

  // Interactive — Trading Profile Builder
  const [schedule, setSchedule] = useState<number | null>(null);
  const [capital, setCapital] = useState<number | null>(null);
  const [personality, setPersonality] = useState<number | null>(null);
  const [experience, setExperience] = useState<number | null>(null);
  const allSelected = schedule !== null && capital !== null && personality !== null && experience !== null;

  const getRecommendation = () => {
    if (!allSelected) return null;
    // Schedule: 0=minimal, 1=moderate, 2=full-time
    // Capital: 0=small(<1k), 1=medium(1k-10k), 2=large(10k+)
    // Personality: 0=patient, 1=balanced, 2=aggressive
    // Experience: 0=beginner, 1=intermediate, 2=advanced
    const timeframes = ['Daily / 4H', '4H / 1H', '1H / 15M'];
    const tfIdx = Math.min(2, Math.max(0, Math.round((schedule! + personality!) / 2)));
    const tf = timeframes[tfIdx];

    const assets = capital === 0 ? 'EUR/USD or GBP/USD' : capital === 1 ? 'EUR/USD or Gold' : 'Gold or NASDAQ';
    const style = tfIdx === 0 ? 'Swing Trading' : tfIdx === 1 ? 'Intraday' : 'Scalping / Day Trading';
    const session = schedule === 0 ? 'NY Close (after work)' : schedule === 1 ? 'London or NY' : 'London + NY Overlap';

    const notes: string[] = [];
    if (capital === 0) notes.push('With a small account, stick to low-spread pairs. Gold and NASDAQ stops will be too expensive relative to your capital.');
    if (experience === 0) notes.push('As a beginner, start with the 4H timeframe even if your schedule allows more screen time. Slower timeframes teach pattern recognition without the pressure of fast decisions.');
    if (personality === 2 && experience === 0) notes.push('Your aggressive personality combined with beginner experience is the #1 account killer. Force yourself to use the 4H or Daily timeframe for the first 3 months.');

    return { tf, assets, style, session, notes };
  };

  const rec = getRecommendation();

  // Expandable mistakes
  const [openMistake, setOpenMistake] = useState<number | null>(null);
  const mistakes = [
    { title: 'Picking an asset because a YouTuber trades it', desc: 'That YouTuber has 5+ years of experience with that asset, different capital, different timezone, and different risk tolerance. What works for them is almost certainly wrong for you. Pick YOUR asset based on YOUR lifestyle, capital, and personality.' },
    { title: 'Scalping on a 1-minute chart with a small account', desc: 'The commission tax on 1M charts is 30-50% of each trade. You need a 65%+ win rate just to break even. On 4H charts, the same commission is under 5%. Lower timeframes = higher costs = harder to profit.' },
    { title: 'Switching assets every month after losses', desc: 'Every time you switch assets, you reset your learning. Gold\'s patterns are different from EUR/USD. It takes 100+ trades to understand an asset\'s behaviour. Monthly switching means you never reach that threshold on any of them.' },
    { title: 'Trading during dead sessions', desc: 'Gold during the Asian session barely moves. EUR/USD at 3 AM has spread widening and no volume. Trading outside your asset\'s active sessions is like fishing in an empty pond — the setup might look perfect but nothing will bite.' },
  ];

  // Game
  const [gameRound, setGameRound] = useState(0);
  const [gameAnswers, setGameAnswers] = useState<(number | null)[]>(Array(gameRounds.length).fill(null));
  const [gameScore, setGameScore] = useState(0);
  const handleGameAnswer = (optIdx: number) => { if (gameAnswers[gameRound] !== null) return; const next = [...gameAnswers]; next[gameRound] = optIdx; setGameAnswers(next); if (gameRounds[gameRound].options[optIdx].correct) setGameScore(s => s + 1); };

  // Quiz
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(Array(quizQuestions.length).fill(null));
  const handleQuizAnswer = (qi: number, oi: number) => { if (quizAnswers[qi] !== null) return; const next = [...quizAnswers]; next[qi] = oi; setQuizAnswers(next); };
  const quizDone = quizAnswers.every(a => a !== null);
  const quizScore = quizDone ? Math.round((quizAnswers.filter((a, i) => a === quizQuestions[i].correct).length / quizQuestions.length) * 100) : 0;
  const certUnlocked = quizDone && quizScore >= 66;
  const [showConfetti, setShowConfetti] = useState(false);
  useEffect(() => { if (certUnlocked) { setShowConfetti(true); const t = setTimeout(() => setShowConfetti(false), 4000); return () => clearTimeout(t); }}, [certUnlocked]);

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      <Confetti active={showConfetti} />
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-900/50"><motion.div className="h-full bg-gradient-to-r from-amber-500 to-accent-500" style={{ width: `${Math.min((scrollY / (typeof document !== 'undefined' ? document.body.scrollHeight - window.innerHeight : 1)) * 100, 100)}%` }} /></div>
      <nav className="fixed top-1 left-0 right-0 z-40 flex items-center justify-between px-5 py-2.5">
        <Link href="/academy" className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-amber-400 to-accent-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>ATLAS ACADEMY</Link>
        <div className="flex items-center gap-2"><Crown className="w-3.5 h-3.5 text-amber-400" /><span className="text-xs font-bold text-amber-400">PRO &middot; LEVEL 6</span></div>
      </nav>

      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6 pt-20">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(245,158,11,0.08),transparent_70%)] pointer-events-none" />
        <div className="absolute top-[-50px] right-[20%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(217,70,239,0.05),transparent_70%)] pointer-events-none" />
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.15 } } }} className="relative z-10">
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 6 &middot; Lesson 2</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Choosing Your<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Battlefield</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">The right asset, timeframe, and session for YOUR life. Specialise in one battlefield and dominate it.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* S00 */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">🔍 A Chess Grandmaster Picks Their Opening</p>
            <p className="text-gray-400 leading-relaxed mb-4">No chess grandmaster plays every opening. They master 2-3 openings deeply. No boxer fights in every weight class. They train at THEIR weight. Trading is the same &mdash; your asset, timeframe, and session are your weight class.</p>
            <p className="text-gray-400 leading-relaxed">A Gold scalper and a EUR/USD swing trader live in completely different worlds. The strategies, the risk management, the session timing, the psychology &mdash; everything changes based on this one decision. Get it right and every other part of your strategy clicks into place. Get it wrong and nothing works, no matter how good your entries are.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">In a sample of 1,500 funded prop traders: <strong className="text-green-400">78%</strong> traded a maximum of 2 instruments. Among failed attempts, <strong className="text-red-400">67%</strong> traded 4 or more instruments per month. Specialisation isn&apos;t just nice to have &mdash; it&apos;s statistically the difference between passing and failing.</p>
          </div>
        </motion.div>
      </section>

      {/* S01 — Market Personality Animation */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; Market Personalities</p>
          <h2 className="text-2xl font-extrabold mb-4">Every Market Has a Character</h2>
          <p className="text-gray-400 text-sm mb-6">Gold moves like a heavyweight boxer. EUR/USD plods like a steady workhorse. NASDAQ sprints and crashes. Bitcoin does whatever it wants.</p>
          <MarketPersonalityAnimation />
        </motion.div>
      </section>

      {/* S02 — Lifestyle-Timeframe Match */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; Lifestyle-Timeframe Match</p>
          <h2 className="text-2xl font-extrabold mb-4">Your Life Dictates Your Timeframe</h2>
          <p className="text-gray-400 text-sm mb-6">There is no &ldquo;best&rdquo; timeframe. There is only the best timeframe FOR YOU. Watch how different lifestyles map to different trading styles.</p>
          <LifestyleTimeframeAnimation />
        </motion.div>
      </section>

      {/* S03 — Asset Profiles */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; Asset Profiles</p>
          <h2 className="text-2xl font-extrabold mb-6">Know Your Instruments</h2>
          <div className="space-y-3">
            {assetProfiles.map((a, i) => (
              <div key={i}>
                <button onClick={() => setOpenAsset(openAsset === i ? null : i)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{a.icon}</span>
                    <div><p className="text-sm font-extrabold text-white">{a.name}</p><p className="text-xs text-gray-500">{a.personality} — {a.analogy}</p></div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openAsset === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openAsset === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05] space-y-2">
                      <p className="text-sm text-gray-400"><strong className="text-white">Traits:</strong> {a.traits}</p>
                      <p className="text-sm text-gray-400"><strong className="text-white">Avg Daily Range:</strong> {a.avgRange}</p>
                      <p className="text-sm text-gray-400"><strong className="text-white">Best Sessions:</strong> {a.bestSessions}</p>
                      <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10"><p className="text-xs text-amber-400"><strong>Best For:</strong> {a.bestFor}</p></div>
                    </div>
                  </motion.div>
                )}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S04 — Timeframe Guide */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Timeframe Guide</p>
          <h2 className="text-2xl font-extrabold mb-6">Pick Your Speed</h2>
          <div className="space-y-3">
            {timeframeGuide.map((t, i) => (
              <div key={i}>
                <button onClick={() => setOpenTf(openTf === i ? null : i)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <div><p className="text-sm font-extrabold text-white">{t.tf}</p><p className="text-xs text-gray-500">{t.analogy}</p></div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openTf === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openTf === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05] space-y-2">
                      <p className="text-sm text-gray-400"><strong className="text-white">Screen Time:</strong> {t.screenTime}</p>
                      <p className="text-sm text-gray-400"><strong className="text-white">Setups:</strong> {t.setups}</p>
                      <p className="text-sm text-gray-400"><strong className="text-white">Personality Match:</strong> {t.personality}</p>
                      <p className="text-sm text-gray-400"><strong className="text-white">Stop Size:</strong> {t.stopSize}</p>
                    </div>
                  </motion.div>
                )}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S05 — Interactive Trading Profile Builder */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Trading Profile Builder</p>
          <h2 className="text-2xl font-extrabold mb-2">Find YOUR Battlefield</h2>
          <p className="text-gray-400 text-sm mb-6">Answer 4 questions and get a personalised recommendation.</p>
          <div className="p-6 rounded-2xl glass-card space-y-5">
            {/* Schedule */}
            <div>
              <p className="text-sm font-semibold text-white mb-2">How much screen time can you give trading?</p>
              <div className="flex flex-wrap gap-2">
                {['< 1 hour/day', '2-4 hours/day', '6+ hours/day'].map((opt, i) => (
                  <button key={i} onClick={() => setSchedule(i)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${schedule === i ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-white/[0.04] text-gray-500 border border-white/[0.08] hover:bg-white/[0.07]'}`}>{opt}</button>
                ))}
              </div>
            </div>
            {/* Capital */}
            <div>
              <p className="text-sm font-semibold text-white mb-2">What is your trading capital?</p>
              <div className="flex flex-wrap gap-2">
                {['Under £1,000', '£1,000 – £10,000', '£10,000+'].map((opt, i) => (
                  <button key={i} onClick={() => setCapital(i)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${capital === i ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-white/[0.04] text-gray-500 border border-white/[0.08] hover:bg-white/[0.07]'}`}>{opt}</button>
                ))}
              </div>
            </div>
            {/* Personality */}
            <div>
              <p className="text-sm font-semibold text-white mb-2">Your trading personality?</p>
              <div className="flex flex-wrap gap-2">
                {['Patient & calm', 'Balanced', 'Aggressive & intense'].map((opt, i) => (
                  <button key={i} onClick={() => setPersonality(i)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${personality === i ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-white/[0.04] text-gray-500 border border-white/[0.08] hover:bg-white/[0.07]'}`}>{opt}</button>
                ))}
              </div>
            </div>
            {/* Experience */}
            <div>
              <p className="text-sm font-semibold text-white mb-2">Your experience level?</p>
              <div className="flex flex-wrap gap-2">
                {['Beginner (< 6 months)', 'Intermediate (6-24 months)', 'Advanced (2+ years)'].map((opt, i) => (
                  <button key={i} onClick={() => setExperience(i)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${experience === i ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-white/[0.04] text-gray-500 border border-white/[0.08] hover:bg-white/[0.07]'}`}>{opt}</button>
                ))}
              </div>
            </div>

            {rec && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/15 space-y-3">
                <p className="text-sm font-extrabold text-amber-400">Your Recommended Battlefield:</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-white/[0.03]"><p className="text-[10px] text-gray-500 uppercase tracking-wider">Timeframe</p><p className="text-sm font-bold text-white">{rec.tf}</p></div>
                  <div className="p-3 rounded-lg bg-white/[0.03]"><p className="text-[10px] text-gray-500 uppercase tracking-wider">Assets</p><p className="text-sm font-bold text-white">{rec.assets}</p></div>
                  <div className="p-3 rounded-lg bg-white/[0.03]"><p className="text-[10px] text-gray-500 uppercase tracking-wider">Style</p><p className="text-sm font-bold text-white">{rec.style}</p></div>
                  <div className="p-3 rounded-lg bg-white/[0.03]"><p className="text-[10px] text-gray-500 uppercase tracking-wider">Session</p><p className="text-sm font-bold text-white">{rec.session}</p></div>
                </div>
                {rec.notes.length > 0 && (<div className="space-y-2">{rec.notes.map((n, i) => (<p key={i} className="text-xs text-amber-400/80 leading-relaxed">⚠️ {n}</p>))}</div>)}
              </motion.div>
            )}
          </div>
        </motion.div>
      </section>

      {/* S06 — The 3-Month Rule */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; The 3-Month Rule</p>
          <h2 className="text-2xl font-extrabold mb-4">Commitment Before Competence</h2>
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <p className="text-gray-400 leading-relaxed">Learning an asset is like getting to know a person. In the first week, you see the obvious stuff. After a month, you notice patterns. After 3 months, you can predict their behaviour. <strong className="text-white">You need at least 100 trades on one instrument to understand its character.</strong></p>
            <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/15">
              <p className="text-sm text-gray-400 leading-relaxed">💡 <strong className="text-purple-400">The Dating Analogy:</strong> Imagine going on one date with someone, then immediately switching to someone else, then another. After a year you&apos;ve been on 50 first dates and know nobody deeply. That&apos;s what asset-switching does to your pattern recognition.</p>
            </div>
            <p className="text-gray-400 leading-relaxed">A NASDAQ specialist who&apos;s traded it for 6 months will outperform a generalist who trades 5 instruments every month &mdash; even if the generalist has been trading longer. Depth beats breadth in trading.</p>
          </div>
        </motion.div>
      </section>

      {/* S07 — The Commission Tax */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; The Commission Tax</p>
          <h2 className="text-2xl font-extrabold mb-4">Why Small Accounts + Low TFs = Trouble</h2>
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <p className="text-gray-400 leading-relaxed">Every trade has a hidden cost: spread + commission. On a £500 account scalping the 1M chart, this &ldquo;commission tax&rdquo; eats 30-50% of each trade&apos;s risk. You need an unrealistic 65%+ win rate just to break even.</p>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="text-gray-500 border-b border-white/[0.06]">
                  <th className="text-left py-2 pr-3">Account</th><th className="text-left py-2 pr-3">TF</th><th className="text-left py-2 pr-3">Stop</th><th className="text-left py-2 pr-3">Cost</th><th className="text-left py-2">Tax %</th>
                </tr></thead>
                <tbody className="text-gray-400">
                  <tr className="border-b border-white/[0.03]"><td className="py-2 pr-3">£500</td><td className="pr-3">1M</td><td className="pr-3">5 pips</td><td className="pr-3">2 pips</td><td className="text-red-400 font-bold">40%</td></tr>
                  <tr className="border-b border-white/[0.03]"><td className="py-2 pr-3">£2,000</td><td className="pr-3">15M</td><td className="pr-3">15 pips</td><td className="pr-3">2 pips</td><td className="text-amber-400 font-bold">13%</td></tr>
                  <tr className="border-b border-white/[0.03]"><td className="py-2 pr-3">£5,000</td><td className="pr-3">1H</td><td className="pr-3">30 pips</td><td className="pr-3">2 pips</td><td className="text-green-400 font-bold">7%</td></tr>
                  <tr><td className="py-2 pr-3">£10,000</td><td className="pr-3">4H</td><td className="pr-3">60 pips</td><td className="pr-3">2 pips</td><td className="text-green-400 font-bold">3%</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">The larger your stop (higher timeframe), the less the commission impacts your edge. This is why small accounts should trade higher timeframes, not lower ones.</p>
          </div>
        </motion.div>
      </section>

      {/* S08 — Common Mistakes */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-6">4 Battlefield Blunders</h2>
          <div className="space-y-3">
            {mistakes.map((m, i) => (
              <div key={i}>
                <button onClick={() => setOpenMistake(openMistake === i ? null : i)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <p className="text-sm font-extrabold text-red-400">{i + 1}. {m.title}</p>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openMistake === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openMistake === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-sm text-gray-400 leading-relaxed">{m.desc}</p></div>
                  </motion.div>
                )}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S09 — Cheat Sheet */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Cheat Sheet</p>
          <h2 className="text-2xl font-extrabold mb-4">6 Battlefield Rules</h2>
          <div className="p-6 rounded-2xl glass-card space-y-3">
            {[
              { label: 'MATCH', text: 'Match your asset + timeframe to your lifestyle, not someone else\'s.' },
              { label: 'SPECIALISE', text: 'Trade 1-2 instruments maximum. Depth beats breadth.' },
              { label: 'SCALE', text: 'Bigger stops (higher TFs) = lower commission tax = easier profitability.' },
              { label: 'SESSION', text: 'Only trade during your asset\'s active sessions. Dead sessions = dead money.' },
              { label: 'DIAGNOSE', text: 'When your strategy stops working, check if the market regime changed before blaming the setup.' },
              { label: 'STUDY', text: 'Commit to 100+ trades on one combination before evaluating or switching.' },
            ].map((r, i) => (
              <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <p className="text-sm"><strong className="text-amber-400">{r.label}</strong> <span className="text-gray-500">&mdash;</span> <span className="text-gray-400">{r.text}</span></p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S10 — Game */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Test Your Understanding</p>
          <h2 className="text-2xl font-extrabold mb-2">Battlefield Selection Game</h2>
          <p className="text-gray-400 text-sm mb-6">5 scenarios. Pick the best battlefield for each trader.</p>
          <div className="p-6 rounded-2xl glass-card">
            <div className="flex items-center justify-between mb-4"><span className="text-xs font-bold text-amber-400">Round {gameRound + 1} of {gameRounds.length}</span><span className="text-xs font-mono text-gray-500">{gameScore}/{gameRounds.length} correct</span></div>
            <p className="text-sm text-gray-300 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: gameRounds[gameRound].scenario }} />
            <div className="space-y-2">
              {gameRounds[gameRound].options.map((opt, oi) => {
                const answered = gameAnswers[gameRound] !== null; const selected = gameAnswers[gameRound] === oi; const isCorrect = opt.correct;
                let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]';
                if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30';
                if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30';
                if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20';
                return (<div key={oi}><button onClick={() => handleGameAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt.text }} /></button>{answered && selected && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]"><p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`} dangerouslySetInnerHTML={{ __html: `${isCorrect ? '✓' : '✗'} ${opt.explain}` }} /></motion.div>)}</div>);
              })}
            </div>
            {gameAnswers[gameRound] !== null && gameRound < gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5"><button onClick={() => setGameRound(r => r + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button></motion.div>)}
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Excellent — you understand how to match traders to their battlefield.' : gameScore >= 3 ? 'Solid — review the commission and lifestyle sections to sharpen your thinking.' : 'Re-read the asset profiles and timeframe guide, then try again.'}</p></motion.div>)}
          </div>
        </motion.div>
      </section>

      {/* S11 — Quiz + Certificate */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Knowledge Check</p>
          <h2 className="text-2xl font-extrabold mb-6">Final Quiz &mdash; 8 Questions</h2>
          <div className="space-y-6">
            {quizQuestions.map((q, qi) => (
              <div key={qi} className="p-5 rounded-2xl glass-card">
                <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p>
                <p className="text-sm font-semibold text-white mb-4" dangerouslySetInnerHTML={{ __html: q.q }} />
                <div className="space-y-2">
                  {q.opts.map((opt, oi) => { const answered = quizAnswers[qi] !== null; const selected = quizAnswers[qi] === oi; const isCorrect = oi === q.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return <button key={oi} onClick={() => handleQuizAnswer(qi, oi)} disabled={answered} className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`} dangerouslySetInnerHTML={{ __html: opt }} />; })}
                </div>
                {quizAnswers[qi] !== null && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg bg-white/[0.02]"><p className="text-xs text-amber-400" dangerouslySetInnerHTML={{ __html: `<span class="font-bold">&#9989;</span> ${q.explain}` }} /></motion.div>)}
              </div>
            ))}
          </div>
          {quizDone && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center"><p className="text-3xl font-extrabold mb-2">{quizScore}%</p><p className="text-sm text-gray-400">{quizScore >= 66 ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate. Review and try again.'}</p></motion.div>)}
          {certUnlocked && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10">
              <div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(139,92,246,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
                <div className="relative z-10 text-center">
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-sky-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">🗺️</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 6: Choosing Your Battlefield</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-sky-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Battlefield Commander &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L6.2-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
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
