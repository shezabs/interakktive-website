// app/academy/lesson/who-are-smart-money/page.tsx
// ATLAS Academy — Lesson 3.1: Who Are the Smart Money? [PRO]
'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Crown, ArrowRight, ChevronDown } from 'lucide-react';

// ============================================================
// ANIMATED SCENE
// ============================================================
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
    const loop = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);
      drawFn(ctx, rect.width, rect.height, frameRef.current);
      frameRef.current++;
      animRef.current = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(animRef.current);
  }, [drawFn]);
  return <canvas ref={canvasRef} style={{ width: '100%', height }} className="rounded-2xl" />;
}

// ============================================================
// FOOD CHAIN ANIMATION
// ============================================================
function FoodChainAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);

    const phase = (f % 400) / 400;
    const activeLevel = Math.floor(phase * 4);

    const levels = [
      { label: 'Central Banks', emoji: '🏛️', size: '$6.6 Trillion/day', color: '#ef4444', desc: 'Set the rules', y: 0.12 },
      { label: 'Investment Banks', emoji: '🏦', size: '$500B+ AUM', color: '#f59e0b', desc: 'Move the markets', y: 0.34 },
      { label: 'Hedge Funds & Prop', emoji: '📊', size: '$5-50B AUM', color: '#0ea5e9', desc: 'Hunt for alpha', y: 0.56 },
      { label: 'Retail Traders', emoji: '🧑‍💻', size: '$500-$50K', color: '#6b7280', desc: 'Provide liquidity', y: 0.78 },
    ];

    // Pyramid shape
    for (let i = 0; i < levels.length; i++) {
      const lv = levels[i];
      const isActive = i === activeLevel;
      const alpha = isActive ? 1 : 0.35;
      const cy = h * lv.y;
      const barW = (w - 40) * (0.35 + (i / 3) * 0.65); // wider at bottom
      const barH = 38;
      const bx = (w - barW) / 2;

      // Bar
      ctx.globalAlpha = alpha;
      ctx.fillStyle = lv.color + (isActive ? '20' : '08');
      ctx.fillRect(bx, cy - barH / 2, barW, barH);
      ctx.strokeStyle = lv.color + (isActive ? '50' : '15');
      ctx.lineWidth = 1;
      ctx.strokeRect(bx, cy - barH / 2, barW, barH);

      // Emoji + label
      ctx.font = '18px serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'white';
      ctx.fillText(lv.emoji, w / 2 - 60, cy + 6);

      ctx.font = `${isActive ? 'bold ' : ''}11px system-ui`;
      ctx.fillStyle = isActive ? lv.color : '#6b7280';
      ctx.textAlign = 'left';
      ctx.fillText(lv.label, w / 2 - 40, cy - 4);
      ctx.font = '9px system-ui';
      ctx.fillStyle = isActive ? '#9ca3af' : '#4b5563';
      ctx.fillText(`${lv.size} — ${lv.desc}`, w / 2 - 40, cy + 10);

      // Arrow between levels
      if (i < 3) {
        ctx.fillStyle = 'rgba(100,116,139,0.15)';
        ctx.font = '10px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('▼', w / 2, h * ((lv.y + levels[i + 1].y) / 2) + 3);
      }

      ctx.globalAlpha = 1;
    }

    // Title
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('THE MARKET FOOD CHAIN', w / 2, 14);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// LIQUIDITY PROBLEM ANIMATION — shows why big funds need retail
// ============================================================
function LiquidityProblemAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);

    const phase = (f % 300) / 300;
    const midX = w / 2;

    // Left: Retail trader buying
    ctx.fillStyle = 'rgba(14,165,233,0.05)';
    ctx.fillRect(5, 30, midX - 10, h - 40);
    ctx.strokeStyle = 'rgba(14,165,233,0.15)';
    ctx.strokeRect(5, 30, midX - 10, h - 40);

    ctx.fillStyle = '#0ea5e9';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('RETAIL TRADER', midX / 2, 22);

    ctx.font = '14px serif';
    ctx.fillText('🧑‍💻', midX / 2 - 30, 70);
    ctx.font = '10px system-ui';
    ctx.fillStyle = '#9ca3af';
    ctx.fillText('"Buy 0.1 lots"', midX / 2, 90);

    // Small order block
    ctx.fillStyle = '#0ea5e9';
    const retailW = 30;
    ctx.fillRect(midX / 2 - retailW / 2, 110, retailW, 20);
    ctx.fillStyle = '#fff';
    ctx.font = '8px system-ui';
    ctx.fillText('$1,000', midX / 2, 123);

    // Arrow: "Filled instantly"
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 9px system-ui';
    ctx.fillText('✓ Filled instantly', midX / 2, 150);

    // Right: Institution buying
    ctx.fillStyle = 'rgba(239,68,68,0.05)';
    ctx.fillRect(midX + 5, 30, midX - 10, h - 40);
    ctx.strokeStyle = 'rgba(239,68,68,0.15)';
    ctx.strokeRect(midX + 5, 30, midX - 10, h - 40);

    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('INSTITUTION', midX + midX / 2, 22);

    ctx.font = '14px serif';
    ctx.fillText('🏦', midX + midX / 2 - 30, 70);
    ctx.font = '10px system-ui';
    ctx.fillStyle = '#9ca3af';
    ctx.fillText('"Buy $500 million"', midX + midX / 2, 90);

    // Massive order block that can't fill
    const instW = Math.min(midX - 30, 120);
    const fillProgress = Math.min(phase * 3, 1);
    const filledW = instW * fillProgress * 0.15; // only fills 15%

    ctx.fillStyle = '#374151';
    ctx.fillRect(midX + midX / 2 - instW / 2, 110, instW, 40);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(midX + midX / 2 - instW / 2, 110, filledW, 40);

    ctx.fillStyle = '#fff';
    ctx.font = '8px system-ui';
    ctx.fillText('$500,000,000', midX + midX / 2, 133);

    // Warning
    if (phase > 0.3) {
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 9px system-ui';
      ctx.fillText('⚠️ Only 15% filled!', midX + midX / 2, 170);
      ctx.fillStyle = '#9ca3af';
      ctx.font = '8px system-ui';
      ctx.fillText('Price moved against them', midX + midX / 2, 183);
      ctx.fillText('before they could finish', midX + midX / 2, 194);
    }

    // Bottom message
    if (phase > 0.6) {
      ctx.globalAlpha = Math.min((phase - 0.6) * 4, 1);
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('They NEED your orders to fill their positions', w / 2, h - 12);
      ctx.globalAlpha = 1;
    }
  }, []);
  return <AnimScene drawFn={draw} height={230} />;
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function WhoAreSmartMoneyLesson() {
  const [scrollY, setScrollY] = useState(0);
  const [activePlayer, setActivePlayer] = useState<string | null>(null);
  const [activeMyth, setActiveMyth] = useState<number | null>(null);

  // Game: Retail or Institutional behavior?
  const gameScenarios = useMemo(() => [
    { desc: 'Places a market order for 0.5 lots of EUR/USD during London open because the 15-minute chart "looks bullish."', answer: 0, explain: 'Classic retail behaviour. Small position, single timeframe, impulse entry based on how the chart "looks." No plan for where everyone else\'s stops are, no consideration of the larger institutional flow.' },
    { desc: 'Accumulates a $2B position in AAPL over 3 weeks using iceberg orders, never buying more than 0.1% of daily volume at a time.', answer: 1, explain: 'Institutional execution. They can\'t just "click buy" — it would move the market against them. They break the order into thousands of tiny pieces spread over weeks, hiding their intentions. This is why order blocks form — they\'re the footprint of this accumulation.' },
    { desc: 'Sets stop loss 5 pips below the obvious support level where "it should bounce."', answer: 0, explain: 'Retail playbook — and the institution\'s favourite meal. When hundreds of retail traders place stops at the same obvious level, that becomes a liquidity pool. Institutions KNOW where your stop is, and they\'ll push price through it to fill their own orders.' },
    { desc: 'Deliberately pushes price below a key support level to trigger a cascade of sell stops, then uses those sell orders as the other side of their massive buy order.', answer: 1, explain: 'This is the liquidity sweep — the core mechanism of smart money. They NEED sellers to sell TO them. By breaking support, they trigger panic selling and stop losses, creating the exact liquidity they need to buy millions of shares at a discount. What retail calls a "fakeout" is actually the institution\'s entry.' },
    { desc: 'Sees Bitcoin drop 5% and panic sells their entire position because "it\'s crashing."', answer: 0, explain: 'Emotional retail reaction — and exactly what institutions want. That panic sell becomes buy-side liquidity for the institution that engineered the drop. The "crash" was a 5% pullback designed to shake out weak hands before the real move higher.' },
  ], []);

  const gameOptions = ['Retail Trader', 'Institutional / Smart Money'];
  const [gameRound, setGameRound] = useState(0);
  const [gameAnswers, setGameAnswers] = useState<(number | null)[]>(Array(5).fill(null));
  const [gameScore, setGameScore] = useState(0);
  const [gameShowNext, setGameShowNext] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  const answerGame = (choice: number) => {
    if (gameAnswers[gameRound] !== null) return;
    const na = [...gameAnswers]; na[gameRound] = choice; setGameAnswers(na);
    if (choice === gameScenarios[gameRound].answer) setGameScore(s => s + 1);
    setGameShowNext(true);
  };
  const nextRound = () => { if (gameRound < 4) { setGameRound(r => r + 1); setGameShowNext(false); } else setGameComplete(true); };
  const resetGame = () => { setGameRound(0); setGameAnswers(Array(5).fill(null)); setGameScore(0); setGameShowNext(false); setGameComplete(false); };

  // Quiz
  const quizQuestions = useMemo(() => [
    { q: '"Smart money" in trading refers to:', opts: ['Traders who use AI tools', 'Institutional players (banks, hedge funds, market makers) with massive capital and market-moving power', 'Anyone who makes profit', 'Traders with insider information'], a: 1, explain: 'Smart money = institutions with enough capital to actually MOVE price. They don\'t react to the market — they create the moves. Banks, hedge funds, and market makers control roughly 90% of daily trading volume.' },
    { q: 'Why can\'t a hedge fund with $10B simply place a market buy order?', opts: ['It\'s illegal', 'The order is too large — it would move the market against them before they finish filling', 'They don\'t use market orders', 'Their broker won\'t allow it'], a: 1, explain: 'A $10B buy order would exhaust all available sellers at the current price, pushing price up dramatically. They\'d end up buying most of their position at much higher prices — terrible execution. This is why they need strategies (like sweeping liquidity) to accumulate without detection.' },
    { q: 'What is a "liquidity pool" in Smart Money terms?', opts: ['A swimming pool of money', 'A cluster of stop-loss orders at an obvious level that institutions target', 'A type of DeFi protocol', 'The total volume of a trading session'], a: 1, explain: 'Liquidity pools are clusters of pending orders — especially stop losses — sitting at obvious levels like support, resistance, and round numbers. Institutions target these pools because they provide the orders needed to fill massive positions. Your stop loss is their entry ticket.' },
    { q: 'Market makers primarily make money by:', opts: ['Betting on price direction', 'Collecting the spread between bid and ask prices on millions of transactions', 'Insider trading', 'Charging commissions'], a: 1, explain: 'Market makers profit from the bid-ask spread. They buy at the bid ($100.00) and sell at the ask ($100.02), keeping the $0.02 difference. Multiply by millions of transactions daily. They don\'t care about direction — they profit from VOLUME and ensuring there\'s always someone to trade with.' },
    { q: 'An "iceberg order" is used by institutions to:', opts: ['Buy during winter months', 'Hide the true size of their order by showing only a small portion at a time', 'Trade cryptocurrency', 'Set multiple stop losses'], a: 1, explain: 'Named after icebergs (90% hidden below water), these orders show only a fraction of the total size. A $500M buy order might show as a series of $50K orders. This prevents other participants from detecting the institution\'s true intentions and front-running them.' },
    { q: 'When price breaks below an obvious support level and then immediately reverses back up, this is likely:', opts: ['Random noise', 'A failed breakdown', 'An institutional liquidity sweep — they pushed price below to trigger sell stops, then bought the resulting liquidity', 'A sign the market is broken'], a: 2, explain: 'This is the quintessential smart money move. The breakdown wasn\'t "real" — it was engineered to create sell orders (from triggered stop losses) that the institution uses as the other side of their buy. What retail sees as a "fakeout" is the institution\'s precision entry.' },
    { q: 'Approximately what percentage of daily forex volume comes from retail traders?', opts: ['About 50%', 'About 25%', 'About 5-10%', 'About 1%'], a: 2, explain: 'Retail traders account for roughly 5-10% of daily forex volume. The rest is institutional: banks (40-50%), hedge funds (15-20%), corporations (10-15%), and central banks (5-10%). We are the smallest fish in the ocean — which is why understanding how the bigger fish operate is critical.' },
    { q: 'The main advantage institutions have over retail traders is:', opts: ['Better internet connections', 'Market-moving capital that allows them to CREATE liquidity events rather than just react to them', 'Access to secret information', 'They never lose money'], a: 1, explain: 'Institutions don\'t just read the market — they WRITE it. With billions in capital, they can push price to levels where retail stops cluster, trigger those stops, and use the resulting order flow to fill their own positions. They are both player and referee. Understanding this changes everything about how you read a chart.' },
  ], []);

  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(Array(8).fill(null));
  const quizDone = quizAnswers.every(a => a !== null);
  const score = quizDone ? Math.round((quizAnswers.filter((a, i) => a === quizQuestions[i].a).length / quizQuestions.length) * 100) : 0;
  const certUnlocked = quizDone && score >= 66;

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Market players data
  const players: Record<string, { name: string; emoji: string; capital: string; volume: string; edge: string; layman: string; howTheyTrade: string; yourRelationship: string }> = {
    retail: { name: 'Retail Traders', emoji: '🧑‍💻', capital: '$500 — $100,000', volume: '5-10% of daily market', edge: 'Speed, agility, no reporting requirements', layman: 'That\'s YOU. Individual traders sitting at home or on their phone. You can enter and exit instantly, nobody knows your positions, and you have zero obligations to anyone. Your disadvantage? You\'re a minnow in an ocean of whales.', howTheyTrade: 'Market orders, small positions, usually technical analysis. React to price movements. Most lose money because they trade against institutional flow without knowing it.', yourRelationship: 'You ARE this. Your goal in Level 3 is to stop acting like prey and start reading the whale\'s movements to swim alongside them.' },
    prop: { name: 'Prop Firms & Hedge Funds', emoji: '📊', capital: '$5 Million — $50 Billion', volume: '15-25% of daily market', edge: 'Sophisticated algorithms, massive research teams, leverage', layman: 'These are the wolves. Teams of 10-500 traders with PhDs in maths, running algorithms that process millions of data points per second. They look for every edge and exploit it ruthlessly. Some are quantitative (pure math), some are discretionary (human decision-making).', howTheyTrade: 'Algorithmic execution, multi-asset strategies, statistical arbitrage. They use iceberg orders, time-weighted algorithms, and dark pools to hide their activity. When they move, they leave footprints — and THAT\'S what we learn to read.', yourRelationship: 'These are the players whose footprints (order blocks, FVGs, structure shifts) you\'ll learn to identify. When you see an order block, you\'re seeing where THEY entered.' },
    banks: { name: 'Investment Banks & Dealers', emoji: '🏦', capital: '$50 Billion — $2 Trillion+', volume: '40-50% of daily market', edge: 'They ARE the market — they see order flow from clients', layman: 'JP Morgan, Goldman Sachs, Citibank, Deutsche Bank. These aren\'t just big — they\'re the OCEAN itself. They process client orders from hedge funds, corporations, and governments. They can see which way the river of money is flowing before anyone else.', howTheyTrade: 'They make markets (provide liquidity), trade client flow, and run proprietary desks. They have information about upcoming large orders that nobody else has. When a bank needs to fill a $2B sell order for a corporate client, they don\'t just dump it — they engineer the price higher first to get better execution.', yourRelationship: 'These are the entities that CREATE the liquidity events you\'ll learn about. When price "hunts stops" — that\'s often a bank engineering liquidity to fill a massive client order. You can\'t fight them, but you CAN follow their wake.' },
    mm: { name: 'Market Makers', emoji: '⚖️', capital: 'Variable — backed by exchanges', volume: 'Facilitates all transactions', edge: 'They profit from the spread, not direction', layman: 'Think of a market maker as the house in a casino. They don\'t bet on which team wins — they take a tiny cut from every single bet. By quoting both a buy price and a sell price (the spread), they profit from the difference. They trade BILLIONS of times per day.', howTheyTrade: 'They maintain an "order book" showing all buy and sell orders. They see where stop losses cluster. They adjust their quotes to manage risk. They don\'t NEED price to move in a specific direction — they need VOLUME. More trades = more spread collected.', yourRelationship: 'Market makers see your stop loss. They know where the clusters are. When you learn about liquidity pools in Lesson 3.3, you\'re learning about the targets market makers and banks use to generate the volume they need.' },
  };

  const playerKeys = ['retail', 'prop', 'banks', 'mm'];

  // Myths
  const myths = [
    { myth: '"Smart money always wins"', truth: 'Institutions lose money constantly. The difference is their RISK MANAGEMENT. A hedge fund might have a 45% win rate but with 1:3 R:R, they\'re very profitable. They lose individual trades — they don\'t lose the war.' },
    { myth: '"They have insider information"', truth: 'Mostly no. What they have is BETTER information processing. A team of 200 analysts digesting earnings reports, central bank speeches, and economic data faster than you can read a headline. Plus they see order flow — which direction the actual MONEY is moving — before it shows on a chart.' },
    { myth: '"Retail can\'t compete"', truth: 'Retail has ONE massive advantage: size. You can enter and exit in milliseconds with zero market impact. An institution needs days or weeks to build a position. You can jump in AFTER they\'ve committed and ride their momentum. That\'s the entire point of SMC.' },
    { myth: '"The market is rigged"', truth: 'The market isn\'t rigged — but it IS a game with unequal players. A poker table where one player has 100x more chips isn\'t "rigged" — it just means you need a DIFFERENT strategy than everyone else. SMC teaches you that strategy.' },
    { myth: '"Following institutions means copying their trades"', truth: 'You can\'t copy a $2B order. What you CAN do is read their FOOTPRINTS — the order blocks, the FVGs, the liquidity sweeps — and position yourself in the same direction, at the same levels, using their activity as your confirmation.' },
  ];

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-900/50">
        <motion.div className="h-full bg-gradient-to-r from-amber-500 to-accent-500" style={{ width: `${Math.min((scrollY / (typeof document !== 'undefined' ? document.body.scrollHeight - window.innerHeight : 1)) * 100, 100)}%` }} />
      </div>

      <nav className="sticky top-0 z-40 px-5 py-3 flex items-center justify-between" style={{ background: 'rgba(6,10,18,0.85)', backdropFilter: 'blur(16px)' }}>
        <Link href="/academy" className="text-xs text-gray-500 hover:text-gray-300 transition">← Academy</Link>
        <div className="flex items-center gap-2"><Crown className="w-3.5 h-3.5 text-amber-400" /><span className="text-xs font-bold text-amber-400">PRO · LEVEL 3</span></div>
      </nav>

      {/* Hero */}
      <section className="px-5 pt-16 pb-12 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 3 · Lesson 1</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">
            <span className="bg-gradient-to-r from-red-400 via-amber-400 to-primary-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Who Are the<br />Smart Money?</span>
          </h1>
          <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">Meet the players who move markets — and understand why YOUR stop loss is THEIR entry ticket.</p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20">
            <span className="text-red-400 text-xs font-bold">🏦 SMART MONEY CONCEPTS</span>
          </div>
        </motion.div>
      </section>

      {/* SECTION 00 — WHY THIS MATTERS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First — Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-lg font-bold text-white mb-3">🎰 You&apos;re playing poker against the casino. And the casino can see your cards.</p>
            <p className="text-gray-400 leading-relaxed mb-4">In the financial markets, roughly <strong className="text-white">90% of daily trading volume</strong> comes from institutions — banks, hedge funds, and market makers with billions of dollars. Retail traders like you and me account for maybe 5-10%. We are the SMALLEST fish in the ocean.</p>
            <p className="text-gray-400 leading-relaxed mb-4">But here&apos;s the uncomfortable truth that changes everything: <strong className="text-red-400">these institutions don&apos;t just trade the market. They MOVE it.</strong> When JP Morgan needs to buy $2 billion of EUR/USD, they don&apos;t click &quot;buy&quot; on their TradingView account. They engineer the price to a level where enough sellers exist to fill their massive order — and those sellers are often YOU, when your stop loss gets triggered.</p>
            <p className="text-gray-400 leading-relaxed"><strong className="text-primary-400">Level 3 teaches you to stop being the prey and start reading the predator&apos;s footprints.</strong> Once you understand HOW institutions move the market, you can position yourself alongside them instead of against them. That&apos;s what Smart Money Concepts are all about.</p>
          </div>

          <FoodChainAnimation />

          <div className="mt-6 p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5">
            <p className="text-xs font-bold text-amber-400 mb-2">🔍 REAL SCENARIO</p>
            <p className="text-sm text-gray-300 leading-relaxed">GBP/USD is at 1.2650. Thousands of retail traders have their stop losses at 1.2620 (below &quot;obvious support&quot;). A bank needs to fill a massive $800M buy order. What do they do? They <strong className="text-red-400">push price DOWN to 1.2615</strong> — triggering all those retail stops. Those stop losses are SELL orders. The bank buys those sell orders. Price immediately reverses to 1.2700. <em className="text-amber-400">Retail lost 35 pips. The bank made 85 pips on $800M. Your stop loss was their entry.</em></p>
          </div>
        </motion.div>
      </section>

      {/* SECTION 01 — THE LIQUIDITY PROBLEM */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 — The Liquidity Problem</p>
          <h2 className="text-2xl font-extrabold mb-4">Why Institutions Need YOU</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">This is the single most important concept in all of Smart Money trading. Everything else flows from this.</p>

          <LiquidityProblemAnimation />

          <div className="mt-6 space-y-4">
            <div className="p-5 rounded-2xl glass-card border-l-4 border-primary-400">
              <h3 className="font-bold text-white mb-2">You: Buy 0.1 lots ($10,000)</h3>
              <p className="text-sm text-gray-400 leading-relaxed">You click buy. It fills in 0.001 seconds. The price doesn&apos;t move. Nobody even noticed you exist. You are invisible. <strong className="text-primary-400">This is your advantage</strong> — and you don&apos;t even know it.</p>
            </div>
            <div className="p-5 rounded-2xl glass-card border-l-4 border-red-400">
              <h3 className="font-bold text-white mb-2">Institution: Buy $500 Million</h3>
              <p className="text-sm text-gray-400 leading-relaxed">They click buy. There aren&apos;t enough sellers at this price. Price starts moving up. They&apos;ve only filled 15% of their order and price is already 50 pips higher. Every additional fill costs more. <strong className="text-red-400">This is their problem</strong> — they need SELLERS to sell to them. Where do they find sellers? <em className="text-amber-400">By pushing price down to trigger YOUR stop loss.</em></p>
            </div>
          </div>

          <div className="mt-5 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-sm text-gray-300 leading-relaxed">💡 <strong className="text-amber-400">This is the entire foundation of SMC:</strong> Institutions need liquidity (your orders) to fill their massive positions. Every &quot;stop hunt,&quot; every &quot;fakeout,&quot; every &quot;manipulation&quot; is them engineering price to a level where enough orders exist. Once you see this, you can&apos;t unsee it. Every chart tells the same story.</p>
          </div>
        </motion.div>
      </section>

      {/* SECTION 02 — THE 4 PLAYERS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 — The Four Players</p>
          <h2 className="text-2xl font-extrabold mb-3">Know Your Opponents</h2>
          <p className="text-sm text-gray-400 mb-6">Tap each player to understand who they are, how they trade, and how they relate to YOU.</p>

          <div className="space-y-3">
            {playerKeys.map(pk => {
              const p = players[pk];
              const isOpen = activePlayer === pk;
              return (
                <motion.div key={pk} layout className="rounded-2xl glass-card overflow-hidden">
                  <button onClick={() => setActivePlayer(isOpen ? null : pk)} className="w-full p-4 flex items-center justify-between text-left">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{p.emoji}</span>
                      <div>
                        <h3 className="font-bold text-white text-sm">{p.name}</h3>
                        <p className="text-xs text-gray-500">{p.capital} · {p.volume}</p>
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="px-4 pb-5 space-y-3">
                          <div className="p-3 rounded-xl bg-primary-500/5 border border-primary-500/15"><p className="text-sm text-gray-300 leading-relaxed">💡 {p.layman}</p></div>
                          <div><p className="text-xs font-bold text-amber-400 mb-1">📈 HOW THEY TRADE</p><p className="text-sm text-gray-400 leading-relaxed">{p.howTheyTrade}</p></div>
                          <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15"><p className="text-sm text-gray-300 leading-relaxed">🎯 <strong className="text-amber-400">Your relationship:</strong> {p.yourRelationship}</p></div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* SECTION 03 — MYTHS DEBUNKED */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 — Myths vs Reality</p>
          <h2 className="text-2xl font-extrabold mb-6">5 Smart Money Myths — Debunked</h2>

          <div className="space-y-3">
            {myths.map((m, i) => {
              const isOpen = activeMyth === i;
              return (
                <motion.div key={i} layout className="rounded-2xl glass-card overflow-hidden">
                  <button onClick={() => setActiveMyth(isOpen ? null : i)} className="w-full p-4 flex items-center justify-between text-left">
                    <h3 className="font-bold text-red-400 text-sm">{m.myth}</h3>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="px-4 pb-4">
                          <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/15"><p className="text-sm text-gray-300 leading-relaxed">✅ <strong className="text-green-400">Reality:</strong> {m.truth}</p></div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* SECTION 04 — GAME */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 — Retail or Institutional?</p>
          <h2 className="text-2xl font-extrabold mb-2">Spot the Behaviour</h2>
          <p className="text-sm text-gray-400 mb-6">5 scenarios. Read the description and decide: is this retail trader behaviour or institutional smart money behaviour?</p>

          {!gameComplete ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500">Scenario {gameRound + 1} of 5</span>
                <span className="text-xs text-amber-400 font-bold">{gameScore}/{gameRound + (gameAnswers[gameRound] !== null ? 1 : 0)} correct</span>
              </div>
              <div className="w-full h-1.5 bg-gray-800 rounded-full mb-4 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-accent-500 transition-all" style={{ width: `${((gameRound + (gameAnswers[gameRound] !== null ? 1 : 0)) / 5) * 100}%` }} />
              </div>

              <div className="p-5 rounded-2xl glass-card mb-4">
                <p className="text-sm text-gray-300 leading-relaxed">&quot;{gameScenarios[gameRound].desc}&quot;</p>
              </div>

              <div className="space-y-2">
                {gameOptions.map((opt, oi) => {
                  const answered = gameAnswers[gameRound] !== null;
                  const isCorrect = oi === gameScenarios[gameRound].answer;
                  const isChosen = gameAnswers[gameRound] === oi;
                  let cls = 'glass text-gray-300 hover:bg-white/5';
                  if (answered) {
                    if (isCorrect) cls = 'bg-green-500/15 border-green-500/30 text-green-400';
                    else if (isChosen) cls = 'bg-red-500/15 border-red-500/30 text-red-400';
                    else cls = 'glass text-gray-600';
                  }
                  return (
                    <button key={oi} onClick={() => answerGame(oi)} disabled={answered} className={`w-full text-left p-3.5 rounded-xl border text-sm font-medium transition-all ${cls}`}>
                      {opt} {answered && isCorrect && '✓'} {answered && isChosen && !isCorrect && '✗'}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {gameAnswers[gameRound] !== null && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0 }} className="mt-4">
                    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
                      <p className="text-sm text-gray-300 leading-relaxed"><strong className="text-amber-400">Explanation:</strong> {gameScenarios[gameRound].explain}</p>
                    </div>
                    {gameShowNext && (
                      <button onClick={nextRound} className="mt-3 w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold shadow-lg shadow-amber-500/20 active:scale-95 transition-all">
                        {gameRound < 4 ? 'Next Scenario →' : 'See Results →'}
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-8 glass-card rounded-2xl">
              <p className={`text-5xl font-extrabold mb-2 ${gameScore >= 3 ? 'text-amber-400' : 'text-red-400'}`}>{gameScore}/5</p>
              <p className="text-sm text-gray-400 mb-4">{gameScore === 5 ? '🏆 You can distinguish the predator from the prey.' : gameScore >= 3 ? 'Getting the institutional eye.' : 'Review the players section carefully.'}</p>
              <button onClick={resetGame} className="px-6 py-2.5 rounded-xl glass text-xs text-gray-300 font-medium hover:text-white transition">Try Again</button>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* SECTION 05 — QUIZ */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 — Knowledge Check</p>
          <h2 className="text-2xl font-extrabold mb-6">Smart Money Quiz</h2>
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
                  if (answered) {
                    if (isCorrect) cls = 'bg-green-500/15 border-green-500/30 text-green-400';
                    else if (isChosen) cls = 'bg-red-500/15 border-red-500/30 text-red-400';
                    else cls = 'glass text-gray-600';
                  }
                  return (
                    <button key={oi} onClick={() => { if (!answered) { const na = [...quizAnswers]; na[qi] = oi; setQuizAnswers(na); } }} disabled={answered} className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${cls}`}>
                      {opt} {answered && isCorrect && '✓'} {answered && isChosen && !isCorrect && '✗'}
                    </button>
                  );
                })}
              </div>
              {quizAnswers[qi] !== null && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 text-sm text-gray-400 leading-relaxed">
                  <span className="text-amber-400 font-bold">✓</span> {q.explain}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
        {quizDone && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 text-center p-8 glass-card rounded-2xl">
            <p className={`text-5xl font-extrabold mb-2 ${score >= 66 ? 'text-amber-400' : 'text-red-400'}`}>{score}%</p>
            <p className="text-sm text-gray-400">{score === 100 ? '🏆 You understand who you\'re trading against.' : score >= 66 ? 'Solid foundation — you know the players.' : 'Review the liquidity problem and player profiles.'}</p>
          </motion.div>
        )}
      </section>

      {/* Certificate */}
      <section className="px-5 py-16 text-center">
        {!certUnlocked ? (
          <div className="max-w-md mx-auto p-8 glass rounded-2xl"><p className="text-4xl mb-3 opacity-30">🔒</p><p className="text-sm text-gray-500">Score 66%+ to unlock your <strong className="text-amber-400">Pro Certificate</strong></p></div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, type: 'spring' }}
            className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(239,68,68,0.06),transparent,rgba(245,158,11,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
            <div className="absolute inset-[1px] rounded-3xl border border-amber-500/10" />
            <div className="relative z-10">
              <div className="w-[80px] h-[80px] mx-auto mb-5 rounded-full bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center text-4xl shadow-lg shadow-red-500/30">🏦</div>
              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest mb-2">Pro Certificate</p>
              <h3 className="text-xl font-extrabold mb-1">Certificate of Mastery</h3>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">Has mastered<br /><strong className="text-white">Level 3.1: Who Are the Smart Money?</strong><br />at ATLAS Academy by Interakktive</p>
              <p className="bg-gradient-to-r from-red-400 via-amber-400 to-primary-400 bg-clip-text text-transparent font-bold text-lg mb-1" style={{ WebkitTransform: 'translateZ(0)' }}>— Institutional Awareness —</p>
              <p className="font-mono text-[11px] text-gray-500 mb-4">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L3.1-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
            </div>
          </motion.div>
        )}
      </section>

      <section className="text-center px-5 pt-10 pb-24">
        <p className="text-xs tracking-widest uppercase text-gray-600 mb-4">Up Next</p>
        <h2 className="text-xl font-bold mb-6">Lesson 3.2 — Market Structure Mastery</h2>
        <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">
          Continue <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
