// app/lib/academy-data.ts
// ATLAS Academy — Course & Lesson definitions

export interface AcademyCourse {
  id: string;
  title: string;
  description: string;
  level: number;
  isFree: boolean;
  lessons: AcademyLesson[];
}

export interface AcademyLesson {
  id: string;
  courseId: string;
  title: string;
  subtitle: string;
  description: string;
  estimatedMinutes: number;
  isFree: boolean;
  totalSections: number;
  quizPassThreshold: number;
}

export const academyCourses: AcademyCourse[] = [
  {
    id: 'level-1-foundations',
    title: 'Level 1 — Foundations',
    description: 'The absolute basics of trading. Start here if you\'re brand new to the markets.',
    level: 1,
    isFree: true,
    lessons: [
      {
        id: 'what-is-trading',
        courseId: 'level-1-foundations',
        title: 'What Is Trading?',
        subtitle: 'The oldest human skill, reinvented',
        description: 'From ancient bazaars to digital markets — understand what trading really is, try your first simulated trade, and earn your Level 1 certificate.',
        estimatedMinutes: 8,
        isFree: true,
        totalSections: 5,
        quizPassThreshold: 66,
      },
      {
        id: 'asset-classes',
        courseId: 'level-1-foundations',
        title: 'Asset Classes Explained',
        subtitle: 'Forex, Stocks, Crypto & more',
        description: 'Understand the different markets you can trade and what makes each one unique.',
        estimatedMinutes: 10,
        isFree: true,
        totalSections: 5,
        quizPassThreshold: 66,
      },
      {
        id: 'candlestick-anatomy',
        courseId: 'level-1-foundations',
        title: 'Anatomy of a Candlestick',
        subtitle: 'Reading the language of price',
        description: 'Every candle tells a story. Learn to read open, high, low, close and what they mean.',
        estimatedMinutes: 8,
        isFree: true,
        totalSections: 5,
        quizPassThreshold: 66,
      },
      {
        id: 'reading-charts',
        courseId: 'level-1-foundations',
        title: 'Reading Your First Chart',
        subtitle: 'From blank screen to insight',
        description: 'Learn to read timeframes, identify trends, and spot key levels on a real chart.',
        estimatedMinutes: 12,
        isFree: false,
        totalSections: 6,
        quizPassThreshold: 66,
      },
      {
        id: 'risk-basics',
        courseId: 'level-1-foundations',
        title: 'Risk — The #1 Rule',
        subtitle: 'Why most traders fail',
        description: 'Learn position sizing, stop losses, and why managing risk is more important than finding entries.',
        estimatedMinutes: 10,
        isFree: false,
        totalSections: 5,
        quizPassThreshold: 66,
      },
      {
        id: 'position-sizing',
        courseId: 'level-1-foundations',
        title: 'Position Sizing Mastery',
        subtitle: 'The exact formula for every trade',
        description: 'Master the formula that turns risk management into precise lot sizes. Includes a 10-round speed challenge.',
        estimatedMinutes: 12,
        isFree: false,
        totalSections: 7,
        quizPassThreshold: 66,
      },
    ],
  },
  {
    id: 'level-2-technical-analysis',
    title: 'Level 2 — Technical Analysis',
    description: 'Master the tools and techniques that professional traders use to read the market. 12 in-depth lessons.',
    level: 2,
    isFree: false,
    lessons: [
      { id: 'support-resistance', courseId: 'level-2-technical-analysis', title: 'Support & Resistance Mastery', subtitle: 'The invisible battlegrounds', description: 'Learn to identify, draw, and trade the most important levels on any chart.', estimatedMinutes: 15, isFree: false, totalSections: 7, quizPassThreshold: 66 },
      { id: 'trendlines-channels', courseId: 'level-2-technical-analysis', title: 'Trendlines & Channels', subtitle: 'Drawing the roadmap', description: 'Master diagonal support/resistance and trading within price channels.', estimatedMinutes: 12, isFree: false, totalSections: 6, quizPassThreshold: 66 },
      { id: 'moving-averages', courseId: 'level-2-technical-analysis', title: 'Moving Averages', subtitle: 'The trend\'s best friend', description: 'SMA, EMA, crossovers, golden cross, death cross — the indicator every trader must know.', estimatedMinutes: 14, isFree: false, totalSections: 7, quizPassThreshold: 66 },
      { id: 'rsi', courseId: 'level-2-technical-analysis', title: 'RSI — Relative Strength Index', subtitle: 'Momentum decoded', description: 'Overbought, oversold, divergences, and RSI strategies that actually work.', estimatedMinutes: 12, isFree: false, totalSections: 6, quizPassThreshold: 66 },
      { id: 'macd', courseId: 'level-2-technical-analysis', title: 'MACD — Momentum Master', subtitle: 'Signal line, histogram & more', description: 'How MACD is built, what it tells you, and how to spot momentum shifts before they happen.', estimatedMinutes: 12, isFree: false, totalSections: 6, quizPassThreshold: 66 },
      { id: 'bollinger-bands', courseId: 'level-2-technical-analysis', title: 'Bollinger Bands & Volatility', subtitle: 'Squeeze, expand, trade', description: 'Volatility-based trading with band squeezes, expansions, and mean reversion.', estimatedMinutes: 12, isFree: false, totalSections: 6, quizPassThreshold: 66 },
      { id: 'volume-analysis', courseId: 'level-2-technical-analysis', title: 'Volume Analysis', subtitle: 'The truth behind the move', description: 'Volume confirms everything. Learn to read it, spot divergences, and identify climax events.', estimatedMinutes: 12, isFree: false, totalSections: 6, quizPassThreshold: 66 },
      { id: 'candlestick-advanced', courseId: 'level-2-technical-analysis', title: 'Advanced Candlestick Patterns', subtitle: 'Multi-candle mastery', description: 'Engulfing, morning star, three soldiers, evening star — the patterns institutions watch.', estimatedMinutes: 14, isFree: false, totalSections: 7, quizPassThreshold: 66 },
      { id: 'chart-patterns', courseId: 'level-2-technical-analysis', title: 'Chart Patterns', subtitle: 'The shapes that predict', description: 'Head & shoulders, double tops, triangles, flags, wedges — with breakout targets.', estimatedMinutes: 16, isFree: false, totalSections: 8, quizPassThreshold: 66 },
      { id: 'fibonacci', courseId: 'level-2-technical-analysis', title: 'Fibonacci Retracements', subtitle: 'Nature\'s trading tool', description: 'The golden ratio in markets. Key levels, extensions, and confluence with S/R.', estimatedMinutes: 14, isFree: false, totalSections: 7, quizPassThreshold: 66 },
      { id: 'multi-timeframe', courseId: 'level-2-technical-analysis', title: 'Multiple Timeframe Analysis', subtitle: 'See the full picture', description: 'Top-down analysis from monthly to minutes. Align the big picture with your entries.', estimatedMinutes: 14, isFree: false, totalSections: 7, quizPassThreshold: 66 },
      { id: 'first-strategy', courseId: 'level-2-technical-analysis', title: 'Building Your First Strategy', subtitle: 'Putting it all together', description: 'Combine everything from Level 2 into a complete, rules-based trading strategy.', estimatedMinutes: 18, isFree: false, totalSections: 8, quizPassThreshold: 66 },
    ],
  },
  {
    id: 'level-3-smart-money',
    title: 'Level 3 — Smart Money Concepts',
    description: 'How institutions really move the market. Liquidity, order blocks, FVGs, and the strategies banks use against retail traders. 14 in-depth lessons.',
    level: 3,
    isFree: false,
    lessons: [
      { id: 'who-are-smart-money', courseId: 'level-3-smart-money', title: 'Who Are the Smart Money?', subtitle: 'Meet the players who move markets', description: 'Banks, hedge funds, and market makers — who they are, how they think, and why retail traders are their liquidity.', estimatedMinutes: 14, isFree: false, totalSections: 7, quizPassThreshold: 66 },
      { id: 'market-structure-smc', courseId: 'level-3-smart-money', title: 'Market Structure Mastery', subtitle: 'BOS, CHoCH & structure shifts', description: 'Break of Structure, Change of Character, and Market Structure Shifts — the language institutions speak.', estimatedMinutes: 16, isFree: false, totalSections: 8, quizPassThreshold: 66 },
      { id: 'liquidity', courseId: 'level-3-smart-money', title: 'Liquidity — The #1 Concept', subtitle: 'Where the stops hide', description: 'Buy-side and sell-side liquidity. Equal highs and lows. Why your stop loss is their entry.', estimatedMinutes: 16, isFree: false, totalSections: 8, quizPassThreshold: 66 },
      { id: 'liquidity-sweeps', courseId: 'level-3-smart-money', title: 'Liquidity Sweeps & Inducement', subtitle: 'The trap before the move', description: 'How institutions trigger your stops before reversing. The fake breakout explained.', estimatedMinutes: 14, isFree: false, totalSections: 7, quizPassThreshold: 66 },
      { id: 'order-blocks', courseId: 'level-3-smart-money', title: 'Order Blocks', subtitle: 'Institutional footprints', description: 'Where the big players placed their orders. Bullish and bearish OBs with mitigation.', estimatedMinutes: 16, isFree: false, totalSections: 8, quizPassThreshold: 66 },
      { id: 'fair-value-gaps', courseId: 'level-3-smart-money', title: 'Fair Value Gaps (FVGs)', subtitle: 'The imbalance magnet', description: 'Price imbalances that act as magnets. How to identify and trade them.', estimatedMinutes: 14, isFree: false, totalSections: 7, quizPassThreshold: 66 },
      { id: 'premium-discount', courseId: 'level-3-smart-money', title: 'Premium & Discount Zones', subtitle: 'Buy cheap, sell expensive', description: 'The 50% equilibrium. Above = premium (sell). Below = discount (buy).', estimatedMinutes: 12, isFree: false, totalSections: 6, quizPassThreshold: 66 },
      { id: 'optimal-trade-entry', courseId: 'level-3-smart-money', title: 'Optimal Trade Entry (OTE)', subtitle: 'The precision zone', description: 'The 62-79% retracement zone where order blocks meet Fibonacci.', estimatedMinutes: 14, isFree: false, totalSections: 7, quizPassThreshold: 66 },
      { id: 'breaker-blocks', courseId: 'level-3-smart-money', title: 'Breaker Blocks & Mitigation', subtitle: 'When zones flip', description: 'Failed order blocks become breakers. Understanding mitigation and invalidation.', estimatedMinutes: 14, isFree: false, totalSections: 7, quizPassThreshold: 66 },
      { id: 'kill-zones', courseId: 'level-3-smart-money', title: 'Kill Zones — When to Trade', subtitle: 'Timing is everything', description: 'Asian accumulation, London manipulation, New York distribution. Session-based trading.', estimatedMinutes: 14, isFree: false, totalSections: 7, quizPassThreshold: 66 },
      { id: 'power-of-three', courseId: 'level-3-smart-money', title: 'Power of Three', subtitle: 'Accumulate, manipulate, distribute', description: 'ICT\'s model: how each session unfolds in three predictable phases.', estimatedMinutes: 14, isFree: false, totalSections: 7, quizPassThreshold: 66 },
      { id: 'smc-trade-models', courseId: 'level-3-smart-money', title: 'SMC Trade Models', subtitle: 'Complete setups A to Z', description: 'Two battle-tested trade models combining every SMC concept into executable strategies.', estimatedMinutes: 18, isFree: false, totalSections: 8, quizPassThreshold: 66 },
      { id: 'smc-phantom-pro', courseId: 'level-3-smart-money', title: 'SMC + ATLAS PHANTOM PRO', subtitle: 'Automate your edge', description: 'How PHANTOM PRO detects BOS, CHoCH, order blocks, FVGs, and liquidity sweeps automatically.', estimatedMinutes: 16, isFree: false, totalSections: 7, quizPassThreshold: 66 },
      { id: 'sessions-deep-dive', courseId: 'level-3-smart-money', title: 'Sessions Deep Dive', subtitle: 'The full daily playbook', description: 'The complete session-by-session trading plan from Asian open to NY close. Pair-specific behaviour, news integration, and daily routine.', estimatedMinutes: 16, isFree: false, totalSections: 8, quizPassThreshold: 66 },
      { id: 'smc-strategy', courseId: 'level-3-smart-money', title: 'Building Your SMC Strategy', subtitle: 'The Level 3 capstone', description: 'Build a complete Smart Money strategy with session, structure, entry model, and risk rules.', estimatedMinutes: 20, isFree: false, totalSections: 8, quizPassThreshold: 66 },
    ],
  },
  {
    id: 'level-4-psychology',
    title: 'Level 4 — Trading Psychology & Mental Performance',
    description: 'The 90% of trading that happens between your ears. Master fear, greed, discipline, and the mental edge that separates professionals from gamblers. 14 in-depth lessons.',
    level: 4,
    isFree: false,
    lessons: [
      { id: 'traders-mind', courseId: 'level-4-psychology', title: 'The Trader\'s Mind', subtitle: 'Know your psychological type', description: 'Why 90% of trading is psychology. Discover your trader personality type with an interactive profiler.', estimatedMinutes: 16, isFree: false, totalSections: 10, quizPassThreshold: 66 },
      { id: 'fear-and-greed', courseId: 'level-4-psychology', title: 'Fear & Greed — The Twin Killers', subtitle: 'The two emotions that destroy accounts', description: 'An interactive tug-of-war between the forces that make you exit too early or hold too long.', estimatedMinutes: 16, isFree: false, totalSections: 10, quizPassThreshold: 66 },
      { id: 'fomo', courseId: 'level-4-psychology', title: 'FOMO — The Trade You Should Never Take', subtitle: 'Chasing the move that already left', description: 'Why chasing feels irresistible and how to sit with the discomfort of missing out.', estimatedMinutes: 16, isFree: false, totalSections: 10, quizPassThreshold: 66 },
      { id: 'revenge-trading', courseId: 'level-4-psychology', title: 'Revenge Trading — Breaking the Cycle', subtitle: 'When losses become a spiral', description: 'The 1% loss that becomes 15%. Circuit breakers, cooling periods, and stopping the spiral.', estimatedMinutes: 16, isFree: false, totalSections: 10, quizPassThreshold: 66 },
      { id: 'loss-acceptance', courseId: 'level-4-psychology', title: 'Loss Acceptance — Your Superpower', subtitle: 'Losses are a cost of business', description: 'The casino owner mindset. Why profitable traders lose 55% of their trades and still win.', estimatedMinutes: 16, isFree: false, totalSections: 10, quizPassThreshold: 66 },
      { id: 'confidence-overconfidence', courseId: 'level-4-psychology', title: 'Confidence vs Overconfidence', subtitle: 'The winning streak trap', description: 'After 5 wins you feel invincible. That is the most dangerous moment in trading.', estimatedMinutes: 16, isFree: false, totalSections: 10, quizPassThreshold: 66 },
      { id: 'process-over-outcome', courseId: 'level-4-psychology', title: 'Process Over Outcome', subtitle: 'Grade the trade, not the P&L', description: 'A losing trade with perfect process beats a winning trade with broken rules. Every time.', estimatedMinutes: 16, isFree: false, totalSections: 10, quizPassThreshold: 66 },
      { id: 'patience-skill', courseId: 'level-4-psychology', title: 'The Waiting Game — Patience as a Skill', subtitle: '90% watching, 10% trading', description: 'Most losses come from doing something when you should be doing nothing.', estimatedMinutes: 16, isFree: false, totalSections: 10, quizPassThreshold: 66 },
      { id: 'trading-routine', courseId: 'level-4-psychology', title: 'Building Your Trading Routine', subtitle: 'Structure kills emotion', description: 'Pre-session, in-session, post-session — the routine that becomes your psychological armour.', estimatedMinutes: 16, isFree: false, totalSections: 10, quizPassThreshold: 66 },
      { id: 'trading-journal', courseId: 'level-4-psychology', title: 'The Trading Journal — Your Psychologist', subtitle: 'Data-driven self-awareness', description: 'Beyond recording trades. Journal emotions, decisions, and patterns to find your edge.', estimatedMinutes: 16, isFree: false, totalSections: 10, quizPassThreshold: 66 },
      { id: 'drawdown-psychology', courseId: 'level-4-psychology', title: 'Drawdown Psychology', subtitle: 'When the account bleeds', description: 'What to do when you are down 10%. The hardest test in trading.', estimatedMinutes: 16, isFree: false, totalSections: 10, quizPassThreshold: 66 },
      { id: 'mental-reset', courseId: 'level-4-psychology', title: 'The 30-Day Mental Reset', subtitle: 'A complete recovery programme', description: 'Four weeks to rebuild your trading psychology from the ground up.', estimatedMinutes: 16, isFree: false, totalSections: 10, quizPassThreshold: 66 },
      { id: 'performance-pressure', courseId: 'level-4-psychology', title: 'Performance Under Pressure', subtitle: 'When the lizard brain takes over', description: 'The amygdala hijack, breathing techniques, and the 10-second rule.', estimatedMinutes: 16, isFree: false, totalSections: 10, quizPassThreshold: 66 },
      { id: 'mental-edge-capstone', courseId: 'level-4-psychology', title: 'Building Your Mental Edge', subtitle: 'The Level 4 capstone', description: 'Build your Psychological Constitution — the companion to your SMC Strategy from Level 3.', estimatedMinutes: 20, isFree: false, totalSections: 10, quizPassThreshold: 66 },
    ],
  },
  {
    id: 'level-5-indicators',
    title: 'Level 5 — Indicator Intelligence',
    description: 'What indicators actually do, why most traders use them wrong, and how to build confluence that prints money. Pure indicator education — no black boxes.',
    level: 5,
    isFree: false,
    lessons: [
      { id: 'what-indicators-are', courseId: 'level-5-indicators', title: 'What Indicators Actually Are', subtitle: 'Diagnostic tools, not crystal balls', description: 'Most traders think indicators predict the future. They don\'t. Learn what they really do and why that matters more.', estimatedMinutes: 18, isFree: false, totalSections: 10, quizPassThreshold: 66 },
      { id: 'leading-vs-lagging', courseId: 'level-5-indicators', title: 'Leading vs Lagging — The Truth', subtitle: 'The biggest misunderstanding in retail trading', description: 'RSI doesn\'t predict reversals. MACD doesn\'t predict crossovers. Understand the difference between measurement and prediction.', estimatedMinutes: 18, isFree: false, totalSections: 10, quizPassThreshold: 66 },
      { id: 'anatomy-of-oscillator', courseId: 'level-5-indicators', title: 'The Anatomy of an Oscillator', subtitle: 'Demystify the maths behind the lines', description: 'How RSI, MACD, and Stochastic actually calculate their values. No more black boxes — see inside the engine.', estimatedMinutes: 18, isFree: false, totalSections: 10, quizPassThreshold: 66 },
      { id: 'signal-vs-noise', courseId: 'level-5-indicators', title: 'Signal vs Noise', subtitle: 'Why 90% of indicator signals lose money', description: 'Hundreds of signals fire every day. Learn to filter the noise and keep only the ones that pay.', estimatedMinutes: 18, isFree: false, totalSections: 10, quizPassThreshold: 66 },
      { id: 'momentum-hidden-force', courseId: 'level-5-indicators', title: 'Momentum — The Hidden Force', subtitle: 'The engine behind every price move', description: 'What momentum actually is, why it matters more than price, and how acceleration and deceleration reveal what smart money is doing.', estimatedMinutes: 18, isFree: false, totalSections: 10, quizPassThreshold: 66 },
      { id: 'rsi-masterclass', courseId: 'level-5-indicators', title: 'RSI Masterclass — Beyond Overbought/Oversold', subtitle: 'The 95% of RSI that retail traders never learn', description: 'Divergence, hidden divergence, failure swings, range shifts, RSI trendlines. Most traders use 5% of what RSI can do.', estimatedMinutes: 18, isFree: false, totalSections: 10, quizPassThreshold: 66 },
      { id: 'macd-deep-dive', courseId: 'level-5-indicators', title: 'MACD & Histogram Deep Dive', subtitle: 'The momentum masterclass', description: 'Signal line crossovers, zero-line dynamics, histogram acceleration, and why MACD alone is useless but MACD with context is powerful.', estimatedMinutes: 18, isFree: false, totalSections: 10, quizPassThreshold: 66 },
      { id: 'stochastic-cci', courseId: 'level-5-indicators', title: 'Stochastic & CCI', subtitle: 'The other momentum oscillators', description: 'When to use Stochastic over RSI. What CCI reveals that others miss. How each oscillator suits different market conditions.', estimatedMinutes: 18, isFree: false, totalSections: 10, quizPassThreshold: 66 },
      { id: 'volume-intelligence', courseId: 'level-5-indicators', title: 'Volume Intelligence', subtitle: 'Smart money leaves footprints', description: 'OBV, VWAP, volume profile. Volume confirms conviction — a breakout on thin air fails. Learn to read the crowd.', estimatedMinutes: 18, isFree: false, totalSections: 10, quizPassThreshold: 66 },
      { id: 'moving-averages-advanced', courseId: 'level-5-indicators', title: 'Moving Averages — Advanced', subtitle: 'Beyond the golden cross', description: 'EMA vs SMA in depth, dynamic support/resistance, MA ribbons, death/golden cross reality check, and institutional MA levels.', estimatedMinutes: 18, isFree: false, totalSections: 10, quizPassThreshold: 66 },
      { id: 'volatility-intelligence', courseId: 'level-5-indicators', title: 'Volatility Intelligence', subtitle: 'The dimension most traders ignore', description: 'ATR for stop placement, Bollinger Band squeezes, Keltner Channels, and the volatility cycle that governs all markets.', estimatedMinutes: 18, isFree: false, totalSections: 10, quizPassThreshold: 66 },
      { id: 'confluence-matrix', courseId: 'level-5-indicators', title: 'The Confluence Matrix', subtitle: 'Stack indicators without redundancy', description: 'The 4-dimension rule: trend + momentum + volume + volatility. Why 3 independent signals beat 10 redundant ones.', estimatedMinutes: 18, isFree: false, totalSections: 10, quizPassThreshold: 66 },
      { id: 'indicator-smc-fusion', courseId: 'level-5-indicators', title: 'Indicator + SMC Fusion', subtitle: 'Where Level 3 meets Level 5', description: 'Order block + RSI divergence + volume spike + kill zone = A+ setup. The bridge between structure and confirmation.', estimatedMinutes: 18, isFree: false, totalSections: 10, quizPassThreshold: 66 },
      { id: 'indicator-stack-capstone', courseId: 'level-5-indicators', title: 'Building Your Indicator Stack — Capstone', subtitle: 'The Level 5 capstone', description: 'Build your complete personal indicator stack — which tools, why each one, how they combine. Your Indicator Playbook.', estimatedMinutes: 20, isFree: false, totalSections: 10, quizPassThreshold: 66 },
    ],
  },
  {
    id: 'level-6-strategy',
    title: 'Level 6 — Strategy Engineering',
    description: 'The bridge from theory to execution. Design your edge, define your rules, and build a strategy that survives real markets.',
    level: 6,
    isFree: false,
    lessons: [
      { id: 'anatomy-of-strategy', courseId: 'level-6-strategy', title: 'The Anatomy of a Strategy', subtitle: 'What separates a system from a gamble', description: 'Every profitable strategy has 7 components. Most traders have 3. Learn all 7 and why each one matters.', estimatedMinutes: 20, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'choosing-your-battlefield', courseId: 'level-6-strategy', title: 'Choosing Your Battlefield', subtitle: 'Asset, timeframe, and session selection', description: 'Why specialising in one instrument beats dabbling in ten. Match your lifestyle, capital, and personality to the right market.', estimatedMinutes: 20, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'model-1-trend-continuation', courseId: 'level-6-strategy', title: 'Model 1: Trend Continuation', subtitle: 'The bread and butter of professional trading', description: 'BOS + pullback to OB/FVG in the direction of the trend. The highest-probability model with a clear statistical edge.', estimatedMinutes: 22, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'model-2-reversal', courseId: 'level-6-strategy', title: 'Model 2: Reversal', subtitle: 'Catching the turn with precision', description: 'CHoCH + liquidity sweep + divergence at premium/discount extremes. Higher reward, lower probability. When and how to use it.', estimatedMinutes: 22, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'entry-trigger-mastery', courseId: 'level-6-strategy', title: 'Entry Trigger Mastery', subtitle: 'The difference between a setup and a trade', description: 'A setup without a trigger is a wish. Learn the 5 entry triggers that professional traders use and when each one applies.', estimatedMinutes: 20, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'stop-placement-science', courseId: 'level-6-strategy', title: 'Stop Placement Science', subtitle: 'Where amateurs get stopped and pros survive', description: 'Structure-based stops, ATR stops, and why fixed-pip stops are a death sentence. Your stop IS your risk — get it right.', estimatedMinutes: 20, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'target-selection', courseId: 'level-6-strategy', title: 'Target Selection & R:R', subtitle: 'Know where you are going before you enter', description: 'Fixed R:R vs structural targets vs trailing. How your target method changes your win rate, expectancy, and psychology.', estimatedMinutes: 20, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'trade-management', courseId: 'level-6-strategy', title: 'Trade Management', subtitle: 'What happens between entry and exit', description: 'Partials, breakeven moves, trailing stops, and scaling. The decisions that separate breakeven traders from profitable ones.', estimatedMinutes: 20, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'backtesting-fundamentals', courseId: 'level-6-strategy', title: 'Backtesting Fundamentals', subtitle: 'Prove your edge before risking capital', description: 'How to backtest properly — sample size, market conditions, avoiding hindsight bias, and the minimum 100-trade rule.', estimatedMinutes: 22, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'expectancy-edge', courseId: 'level-6-strategy', title: 'Expectancy & Edge', subtitle: 'The only number that matters', description: 'EV = (Win Rate × Avg Win) − (Loss Rate × Avg Loss). If this number is positive, you have an edge. If not, nothing else matters.', estimatedMinutes: 20, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'strategy-journal', courseId: 'level-6-strategy', title: 'The Strategy Journal', subtitle: 'Track, measure, improve', description: 'What to record, how to review, and the metrics that reveal whether your strategy is working or slowly dying.', estimatedMinutes: 18, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'common-strategy-killers', courseId: 'level-6-strategy', title: 'Common Strategy Killers', subtitle: 'Why good strategies fail in practice', description: 'Over-optimisation, curve-fitting, ignoring commissions, regime change blindness, and the 6 other ways traders destroy working edges.', estimatedMinutes: 20, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'strategy-stress-test', courseId: 'level-6-strategy', title: 'Strategy Stress Test', subtitle: 'Break it before the market does', description: 'Drawdown scenarios, losing streaks, slippage, spread widening, and news events. If your strategy survives this, it survives anything.', estimatedMinutes: 20, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'strategy-engineering-capstone', courseId: 'level-6-strategy', title: 'Your Complete Strategy — Capstone', subtitle: 'The Level 6 capstone', description: 'Assemble everything: model + entry + stop + target + management + journal. Walk away with a complete, tested, documented trading strategy.', estimatedMinutes: 25, isFree: false, totalSections: 12, quizPassThreshold: 66 },
    ],
  },
  {
    id: 'level-7-execution',
    title: 'Level 7 — Advanced Execution & Live Trading Mastery',
    description: 'The level nobody teaches. Bridge the gap between having a strategy on paper and being consistently profitable in live markets.',
    level: 7,
    isFree: false,
    lessons: [
      { id: 'execution-gap', courseId: 'level-7-execution', title: 'The Execution Gap', subtitle: 'Why backtests lie and live trading humbles', description: 'Your backtest says +£4,200/month. Your live account says −£800. The gap between paper and reality is where most traders die. Learn to measure and close it.', estimatedMinutes: 22, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'pre-session-routine', courseId: 'level-7-execution', title: 'Pre-Session Routine', subtitle: 'The 15 minutes that determine your whole day', description: 'Six phases that separate prepared traders from reactive ones. Build a pre-session ritual you can screenshot and use every single trading day.', estimatedMinutes: 22, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'reading-live-price-action', courseId: 'level-7-execution', title: 'Reading Live Price Action', subtitle: 'What the textbooks never show you', description: 'Candles build one at a time. You do not get to see the future. Practice making real-time decisions in a bar-by-bar replay simulator.', estimatedMinutes: 25, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'first-five-seconds', courseId: 'level-7-execution', title: 'The First 5 Seconds', subtitle: 'What to do the instant your trade is filled', description: 'The psychological tsunami of "it is real now." Eight things to verify within seconds of entry that prevent 80% of execution errors.', estimatedMinutes: 20, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'execution-timing', courseId: 'level-7-execution', title: 'Execution Timing', subtitle: 'The micro-decisions that separate 1:1.2 from 1:2.0', description: 'Two identical setups. One entered at the trigger, one entered 2 candles late. The R:R difference is devastating. Learn to quantify and fix timing leaks.', estimatedMinutes: 22, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'multi-timeframe-execution', courseId: 'level-7-execution', title: 'Multi-Timeframe Execution', subtitle: 'HTF bias to LTF trigger in real-time', description: 'Walk through a branching decision tree: what does the 4H say? What does the 15M confirm? Navigate the MTF handshake that produces high-probability entries.', estimatedMinutes: 22, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'managing-open-trades', courseId: 'level-7-execution', title: 'Managing Open Trades', subtitle: 'The hardest 30 minutes in trading', description: 'Price moves after entry. Do you hold, partial, trail, or close? Five live management scenarios where your decision determines the outcome.', estimatedMinutes: 25, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'reading-the-tape', courseId: 'level-7-execution', title: 'Reading the Tape', subtitle: 'Volume, speed, and candle character', description: 'Big body + high volume = conviction. Small body + low volume = indecision. Learn to read what the market is telling you candle by candle.', estimatedMinutes: 22, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'session-transitions', courseId: 'level-7-execution', title: 'Session Transitions', subtitle: 'How Asia to London to NY handoffs create the best trades', description: 'Accumulation in Asia, manipulation at London open, distribution in NY. Map the 24-hour cycle and build a session-specific playbook.', estimatedMinutes: 22, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'trade-autopsy', courseId: 'level-7-execution', title: 'The Trade Autopsy', subtitle: 'Forensic analysis of your own trades', description: 'Seven diagnostic steps that reveal exactly why a trade worked or failed. Not "I lost" — but WHERE in the process the failure occurred.', estimatedMinutes: 22, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'scaling-when-and-how', courseId: 'level-7-execution', title: 'Scaling: When and How', subtitle: 'From 0.5% to 2% without blowing up', description: 'The compounding difference between conservative and aggressive sizing over 200 trades — and the drawdown cost of getting it wrong.', estimatedMinutes: 20, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'trading-multiple-instruments', courseId: 'level-7-execution', title: 'Trading Multiple Instruments', subtitle: 'How to expand without diluting your edge', description: 'Eight criteria that must be met before adding a new instrument. Expand your opportunity set without destroying your proven edge.', estimatedMinutes: 20, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'weekly-performance-review', courseId: 'level-7-execution', title: 'The Weekly Performance Review', subtitle: 'The 30-minute ritual that compounds your edge', description: 'Input your trades and get a full performance dashboard: session heat maps, model comparison, trigger success rates, and emotional correlation analysis.', estimatedMinutes: 25, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'level-7-capstone', courseId: 'level-7-execution', title: 'Your First 100 Live Trades — Capstone', subtitle: 'The Level 7 capstone', description: 'Build a complete transition plan: demo phase, micro-risk phase, full risk phase, scaling milestones, and prop firm selection. Walk away with a Go Live document.', estimatedMinutes: 28, isFree: false, totalSections: 12, quizPassThreshold: 66 },
    ],
  },
  {
    id: 'level-8-macro',
    title: 'Level 8 — Macro Intelligence & News Mastery',
    description: 'The level that turns chart traders into complete market participants. Integrate economic data, central bank policy, and news events into your technical analysis.',
    level: 8,
    isFree: false,
    lessons: [
      { id: 'why-technicals-alone-arent-enough', courseId: 'level-8-macro', title: 'Why Technicals Alone Aren\'t Enough', subtitle: 'The blind spot that kills technical traders', description: 'Your Order Block means nothing if the Fed cuts rates 50bps in 20 minutes. Learn when the ground beneath your chart is about to shift.', estimatedMinutes: 22, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'economic-calendar', courseId: 'level-8-macro', title: 'The Economic Calendar', subtitle: 'Your weekly danger map', description: 'Forecast vs actual vs previous. Why the DEVIATION matters more than the number. Build a personalised weekly event schedule for your instruments.', estimatedMinutes: 22, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'interest-rates-central-banks', courseId: 'level-8-macro', title: 'Interest Rates & Central Banks', subtitle: 'The most powerful force in markets', description: 'How rate decisions cascade through currencies, equities, bonds, and commodities. Hawkish vs dovish — and why the press conference matters more than the decision.', estimatedMinutes: 25, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'inflation-data', courseId: 'level-8-macro', title: 'Inflation Data (CPI & PPI)', subtitle: 'The number that moves everything', description: 'Core vs headline, why markets react to the SURPRISE not the number, and how inflation expectations drive rate decisions that drive currencies.', estimatedMinutes: 22, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'employment-data', courseId: 'level-8-macro', title: 'Employment Data (NFP & Jobs)', subtitle: 'The most volatile day in forex', description: 'Non-Farm Payrolls: jobs, unemployment, wages — the trifecta. Why a good number can be bad for markets. NFP trading strategies for SMC traders.', estimatedMinutes: 22, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'gdp-pmi-leading-indicators', courseId: 'level-8-macro', title: 'GDP, PMI & Leading Indicators', subtitle: 'Reading the economic cycle', description: 'GDP for the big picture, PMI for the leading signal, and the indicators that predict recessions before they arrive.', estimatedMinutes: 22, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'geopolitical-risk', courseId: 'level-8-macro', title: 'Geopolitical Risk & Black Swans', subtitle: 'Events you can\'t predict but can prepare for', description: 'Wars, elections, sanctions, pandemics. Safe haven flows, risk-on vs risk-off, and how to protect your account when the world shifts.', estimatedMinutes: 22, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'currency-correlations', courseId: 'level-8-macro', title: 'Currency Correlations & the Dollar', subtitle: 'DXY is the master variable', description: 'Why everything correlates to the dollar. How correlations break and what that signals. Cross-pair confirmation for stronger bias.', estimatedMinutes: 22, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'intermarket-analysis', courseId: 'level-8-macro', title: 'Commodities, Bonds & Intermarket Analysis', subtitle: 'How all markets connect', description: 'Gold, oil, bonds, equities — the intermarket web. Yield curve inversions, commodity cycles, and the signals that flow between asset classes.', estimatedMinutes: 25, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'macro-informed-bias', courseId: 'level-8-macro', title: 'Building a Macro-Informed Bias', subtitle: 'Layer macro context onto your SMC analysis', description: 'The 3-layer bias stack: Macro → Technical → Trigger. When macro overrides technicals. When technicals override macro. Integration, not replacement.', estimatedMinutes: 22, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'news-trading-strategies', courseId: 'level-8-macro', title: 'News Trading Strategies', subtitle: 'Avoid, fade, or ride the volatility', description: 'Three approaches to news events. Pre-positioning, the 15-minute rule, spread widening, and when each strategy applies.', estimatedMinutes: 22, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'risk-management-around-events', courseId: 'level-8-macro', title: 'Risk Management Around Events', subtitle: 'Adjust before the storm hits', description: 'Position sizing before news, when to close vs hold, the event risk budget, overnight gap risk, and earnings season for equity traders.', estimatedMinutes: 22, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'sentiment-positioning', courseId: 'level-8-macro', title: 'Sentiment & Positioning', subtitle: 'What the crowd is doing — and why to fade them', description: 'COT data, retail sentiment, Fear & Greed, put/call ratios. How to use positioning as a contrarian signal, not confirmation.', estimatedMinutes: 22, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'level-8-capstone', courseId: 'level-8-macro', title: 'Your Macro Playbook — Capstone', subtitle: 'The Level 8 capstone', description: 'Build your complete macro integration document: event watchlist, pre-session checklist, news response rules, correlation alerts, and weekly review template.', estimatedMinutes: 28, isFree: false, totalSections: 12, quizPassThreshold: 66 },
    ],
  },
  {
    id: 'level-9-prop',
    title: 'Level 9 — Prop Trading Mastery',
    description: 'Turn your proven edge into funded capital. Challenge mathematics, funded account management, dual drawdown engineering, scaling strategies, and building a prop trading business.',
    level: 9,
    isFree: false,
    lessons: [
      { id: 'what-is-prop-trading', courseId: 'level-9-prop', title: 'What Is Prop Trading?', subtitle: 'And why it changes everything', description: 'What prop firms are, how they work at a high level, the capital multiplier effect, and why this is the bridge between trading skill and trading income.', estimatedMinutes: 18, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'how-prop-firms-work', courseId: 'level-9-prop', title: 'How Prop Firms Actually Work', subtitle: 'The business model nobody explains', description: 'Why 85-90% of traders fail evaluations, the 3 firm types, challenge fees as revenue, and why understanding the house edge changes your approach.', estimatedMinutes: 20, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'choosing-your-firm', courseId: 'level-9-prop', title: 'Choosing Your Firm', subtitle: 'Not all prop firms are equal', description: 'Evaluation criteria: drawdown rules, time limits, profit targets, scaling plans, payout splits, red flags, and matching your trading style to the right firm.', estimatedMinutes: 22, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'challenge-mathematics', courseId: 'level-9-prop', title: 'Challenge Mathematics', subtitle: 'The numbers that determine your fate', description: 'Profit targets vs drawdown limits vs time pressure. Expected value, probability of ruin, Monte Carlo simulation, and the risk-per-trade sweet spot.', estimatedMinutes: 25, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'challenge-strategy-design', courseId: 'level-9-prop', title: 'Designing Your Challenge Strategy', subtitle: 'Your personal strategy ≠ your challenge strategy', description: 'Adapting for challenge constraints: the 3-phase approach, front-loading vs steady-state, the 80% rule, and why fewer high-quality trades win.', estimatedMinutes: 22, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'challenge-mindset', courseId: 'level-9-prop', title: 'The Challenge Mindset', subtitle: 'Psychology under evaluation pressure', description: 'The sunk cost trap, time pressure anxiety, Phase 1 euphoria to Phase 2 choke, revenge trading risk, and the re-attempt decision framework.', estimatedMinutes: 22, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'passing-the-challenge', courseId: 'level-9-prop', title: 'Passing the Challenge: Phase 1 & Phase 2', subtitle: 'Execution strategy for both evaluation stages', description: 'Phase 1 sub-phases (cautious/build/protect), the 80% threshold, Phase 2 psychology, consistency requirements, and why verification has a higher failure rate.', estimatedMinutes: 25, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'funded-account-management', courseId: 'level-9-prop', title: 'Funded Account Management', subtitle: 'Everything changes when it is real capital', description: 'The shift from pass mode to survival mode. Drawdown management as job #1, the slow bleed problem, and when to take mandatory days off.', estimatedMinutes: 22, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'daily-vs-overall-drawdown', courseId: 'level-9-prop', title: 'Daily Drawdown vs Overall Drawdown', subtitle: 'The two kill switches', description: 'How both limits work, why daily DD kills most traders, the open P&L trap, equity vs balance calculations, and the 60% safe zone rule.', estimatedMinutes: 22, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'scaling-funded-accounts', courseId: 'level-9-prop', title: 'Scaling Funded Accounts', subtitle: 'Multiple accounts as income streams', description: 'Why 3x$50K beats 1x$200K, running different strategies per account, challenge budget allocation, and the prop portfolio concept.', estimatedMinutes: 22, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'payout-optimisation', courseId: 'level-9-prop', title: 'Payout Optimisation', subtitle: 'Maximise what you actually take home', description: 'Payout schedules, profit splits, withdraw vs compound, tax implications for UK and US traders, and record-keeping requirements.', estimatedMinutes: 22, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'when-challenges-fail', courseId: 'level-9-prop', title: 'When Challenges Fail', subtitle: 'The lesson everyone needs', description: 'Failure diagnosis (strategy/execution/psychology/variance), the decision tree for re-attempts, cost-benefit analysis, and the 3-strike rule.', estimatedMinutes: 22, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'building-a-prop-business', courseId: 'level-9-prop', title: 'Building a Prop Business', subtitle: 'From trader to trading business owner', description: 'Challenge fees as COGS, funded accounts as revenue streams, monthly P&L tracking, tax planning, professional infrastructure, and income forecasting.', estimatedMinutes: 22, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'level-9-capstone', courseId: 'level-9-prop', title: 'Your Prop Business Plan — Capstone', subtitle: 'The Level 9 capstone', description: 'Build your complete prop business plan: firm selection, challenge budget, strategy adaptation, scaling timeline, income targets, and failure contingency.', estimatedMinutes: 28, isFree: false, totalSections: 12, quizPassThreshold: 66 },
    ],
  },
  {
    id: 'level-10-free-arsenal',
    title: 'Level 10 — The Free Indicator Arsenal',
    description: 'Nine diagnostic tools, zero cost. Master the ATLAS way before you pay a penny. Every free indicator in the suite gets its own dedicated deep dive, built around the same diagnostic philosophy that powers the PRO tier.',
    level: 10,
    isFree: false,
    lessons: [
      { id: 'atlas-philosophy', courseId: 'level-10-free-arsenal', title: 'The ATLAS Philosophy', subtitle: 'Why our indicators exist', description: 'The founding axiom: honest measurement of the present beats false prediction of the future. Predictive vs diagnostic indicators, the three pillars (State / Score / Narrative), the universal color language, and the architecture that makes every ATLAS tool speak the same dialect.', estimatedMinutes: 22, isFree: false, totalSections: 12, quizPassThreshold: 66 },
      { id: 'sessions-plus-deep-dive', courseId: 'level-10-free-arsenal', title: 'Sessions+ Deep Dive', subtitle: 'The gateway to the ATLAS suite', description: 'The most comprehensive session intelligence tool on TradingView. Three sessions, five killzones, Silver Bullet windows, the five-tier level hierarchy (PHH-PQH), Power of 3 detection, Session DNA predictor, regime classification, verdict synthesis, inter-session flow, ADR integration, and a 6-view adaptive dashboard.', estimatedMinutes: 32, isFree: false, totalSections: 17, quizPassThreshold: 66 },
      { id: 'market-acceptance-envelope-deep-dive', courseId: 'level-10-free-arsenal', title: 'Market Acceptance Envelope', subtitle: 'Price belongs somewhere before it moves somewhere else', description: 'The diagnostic acceptance corridor. Asymmetric upper/lower boundaries, confidence-driven opacity, core glow scaling with acceptance strength, amber/muted-red stress tinting, and the three Explain Mode states. Nothing like Bollinger Bands or Keltner Channels. A category of its own.', estimatedMinutes: 28, isFree: false, totalSections: 16, quizPassThreshold: 66 },
      { id: 'market-state-intelligence-deep-dive', courseId: 'level-10-free-arsenal', title: 'Market State Intelligence', subtitle: 'Five regimes. Three forces. One state space.', description: 'The regime classification engine. Drive, Opposition, and Stability as the three fundamental forces. Five regimes (Compression / Expansion / Trend / Distribution / Transition). Hysteresis, execution gates, Time-to-Decision Meter, structural memory, and the pressure envelope. Market state intelligence, not signals.', estimatedMinutes: 32, isFree: false, totalSections: 17, quizPassThreshold: 66 },
      { id: 'market-acceptance-zones-deep-dive', courseId: 'level-10-free-arsenal', title: 'Market Acceptance Zones', subtitle: 'Market agreement, not support/resistance', description: 'Four-part acceptance scoring (Efficiency, ERD Balance, Vol Decay, Participation). Zone lifecycle from Active through Historic. Three zone types including multi-timeframe consensus. The 18-row Auto-MTF mapping. Zone merging, decay, and the revival via re-acceptance mechanic.', estimatedMinutes: 28, isFree: false, totalSections: 17, quizPassThreshold: 66 },
      { id: 'market-participation-gradient-deep-dive', courseId: 'level-10-free-arsenal', title: 'Market Participation Gradient', subtitle: 'A participation oscillator, not a momentum oscillator', description: 'The first sub-pane oscillator in the ATLAS suite. Efficiency × sqrt(Activity) formula. Four tiers (THIN/BUILDING/STRONG/EXTREME) and three quality states (Clean/Absorbed/Neutral). The Volume Fallback Doctrine — cross-asset engineering that works on equities, crypto, AND Forex where most volume indicators silently fail.', estimatedMinutes: 28, isFree: false, totalSections: 17, quizPassThreshold: 66 },
      { id: 'market-pressure-regime-deep-dive', courseId: 'level-10-free-arsenal', title: 'Market Pressure Regime', subtitle: 'A 4-state classifier with an off-axis TRAP state', description: 'Second sub-pane oscillator in the ATLAS suite. Bipolar pressure histogram (-100 to +100) plus a 4-state classification: RELEASE, SUPPRESSED, TRANSITION, and off-axis TRAP. The Persistence Contract requires 3 consecutive bars before committing any state change — the deliberate anti-flicker mechanism that separates diagnostic oscillators from noisy signal tools.', estimatedMinutes: 30, isFree: false, totalSections: 17, quizPassThreshold: 66 },
      { id: 'volatility-state-index-deep-dive', courseId: 'level-10-free-arsenal', title: 'Volatility State Index', subtitle: 'A derivative oscillator — volatility momentum, not volatility', description: 'Third sub-pane oscillator in the ATLAS suite. Measures the percent rate of change of smoothed ATR over 10 bars. 3-state classifier: EXPANSION, DECAY, TRANSITION. The Second-Derivative Principle — what ATR does matters more than what ATR is. Regime-aware stop placement and position sizing follow directly.', estimatedMinutes: 28, isFree: false, totalSections: 17, quizPassThreshold: 66 },
      { id: 'effort-result-divergence-deep-dive', courseId: 'level-10-free-arsenal', title: 'Effort-Result Divergence', subtitle: 'The direct oscillator — Wyckoff\'s question as a bipolar score', description: 'Fourth sub-pane oscillator in the ATLAS suite. Bar-by-bar effort-result signed score with a statistical z-score overlay. Event markers fire only on the ~5% of bars where readings are genuinely unusual for the instrument\'s own history. The Dual-Timescale Doctrine — context matters more than magnitude.', estimatedMinutes: 28, isFree: false, totalSections: 17, quizPassThreshold: 66 },
      { id: 'market-efficiency-ratio-deep-dive', courseId: 'level-10-free-arsenal', title: 'Market Efficiency Ratio', subtitle: 'The geometric oscillator — the shape of the price path, finally quantified', description: 'Fifth sub-pane oscillator in the ATLAS suite. A bounded scalar in [0, 100] measuring net displacement divided by total path length over 14 bars. Three zones (teal/grey/magenta) classifying trend, mixed, and chop regimes. The Path-Displacement Principle — price is a geometric object, not a sequence of scalar measurements. Symmetric strategy filter: green for trend-follow, green for mean-reversion, in opposite zones.', estimatedMinutes: 28, isFree: false, totalSections: 17, quizPassThreshold: 66 },
      { id: 'reading-an-atlas-dashboard', courseId: 'level-10-free-arsenal', title: 'Reading an ATLAS Dashboard', subtitle: 'The synthesis lesson — read the dashboard as a disciplined cascade, not a chorus', description: 'The capstone reading discipline for the ATLAS free suite. The 6-layer Diagnostic Cascade: Context → Regime → Direction → Efficiency → Structure → Event. The Diagnostic Cascade Doctrine — earlier layers CONDITION the interpretation of later layers; same-value readings carry opposite meanings depending on upstream state. Three live-read archetypes: six-for-six clean trend, licensed mean-rev, surface-MPR trap. The Read-Aloud Technique for catching incomplete reads. Mechanical confluence resolution rules replacing democratic voting.', estimatedMinutes: 32, isFree: false, totalSections: 18, quizPassThreshold: 66 },
      { id: 'stacking-free-indicators', courseId: 'level-10-free-arsenal', title: 'Stacking Free Indicators', subtitle: 'Seven named playbook patterns — the combinatorial math of orthogonal indicator stacking', description: 'The pattern catalog lesson. The Combinatorial Edge — P(A∩B) ≈ P(A) × P(B) for independent filters; orthogonal stacking multiplicatively tightens license windows while redundant stacking adds nothing. The 2-3 sweet spot where frequency and edge balance. Seven named patterns: Breakout Launch, Compression Coil, Clean Fade, Absorption Reversal, Session Handoff, Participation Surge, Trap Fade. Each built from a 2-3 indicator orthogonal stack. Pattern selection by trading style. Conflict zone resolution when patterns disagree.', estimatedMinutes: 32, isFree: false, totalSections: 17, quizPassThreshold: 66 },
      { id: 'alert-architecture-free-tier', courseId: 'level-10-free-arsenal', title: 'Alert Architecture (Free Tier)', subtitle: 'Seven patterns, one alert slot — the engineering craft of scarcity as information-density discipline', description: 'The alert engineering lesson. The Alert Compression Doctrine — when N setups meet K &lt;&lt; N slots, each slot must carry maximum information per fire. Multi-condition OR logic + dynamic message strings = N-pattern coverage in 1 alert. Priority tier ranking via Rarity × Edge-per-Fire. Pine Script alert patterns (alertcondition vs alert). Once-per-bar vs once-per-bar-close timing and the repaint problem. Alert hygiene as P&L-adjacent data. Webhook integration on Free. When to upgrade — architecture-first principle.', estimatedMinutes: 30, isFree: false, totalSections: 17, quizPassThreshold: 66 },
      { id: 'free-indicator-playbook-capstone', courseId: 'level-10-free-arsenal', title: 'Free Indicator Playbook Capstone', subtitle: 'The complete operational loop — thirteen doctrines in one day, end-to-end', description: 'The Level 10 finale. A complete end-to-end trading session walkthrough from 6:30 AM prep to 5:00 PM debrief, applying every prior Groundbreaking Concept in sequence. The Operational Loop — trading as a closed feedback system where each session\u2019s data tunes the next. Six day phases: Pre-Market Prep, Session Open Scan, Active Monitoring, Mid-Session Review, Closing Session, Post-Session Debrief. Weekly calibration cycle converges noise rate into the 10-20% target band. Pattern P&L attribution reveals your actual edge profile after 3 months. Scaffolding (stable) vs Tuning (continuous) — the distinction that makes compounding possible. Culminates in the "Free Arsenal Master" Level 10 graduation certificate.', estimatedMinutes: 40, isFree: false, totalSections: 18, quizPassThreshold: 66 },
    ],
  },
  {
    id: 'level-11-cipher-pro-mastery',
    title: 'Level 11 — CIPHER PRO Mastery',
    description: 'The flagship PRO indicator, taught as an operator-grade instrument. Every visible element, every setting, every trading mechanic — no stone unturned. Level 11 is dedicated entirely to CIPHER because CIPHER is the deepest tool in the suite and deserves a full curriculum, not a chapter. You finish Level 11 as a certified CIPHER operator, not a consumer.',
    level: 11,
    isFree: false,
    lessons: [
      { id: 'why-cipher-operator-contract', courseId: 'level-11-cipher-pro-mastery', title: 'Why CIPHER — The Operator Contract', subtitle: 'An instrument reports. An operator decides.', description: 'The Level 11 opener. The Operator Contract: CIPHER reports the market honestly across 50+ layers; your job is to integrate those reports into decisions. The arrow is one honest reading among many, never the command. The flight-instrument analogy that anchors it. What "earned arrow" means concretely — every signal has a receipt you can inspect. The bridge from Level 10 Diagnostic Inversion. The three dimensions every Level 11 lesson covers: UI, Settings, Trading. Your first 10 minutes with CIPHER as an opening ritual. How to study Level 11 with the Watch-Read-Drill loop.', estimatedMinutes: 35, isFree: false, totalSections: 15, quizPassThreshold: 66 },
      { id: 'cipher-command-center-anatomy', courseId: 'level-11-cipher-pro-mastery', title: 'The CIPHER Command Center — Anatomy', subtitle: 'Fifteen pre-prioritized verdicts, one operator station.', description: 'The anatomy tour of the Command Center — the information-dense panel on the right side of your chart. The Priority Waterfall doctrine: every cell is the top of a pre-prioritized stack, so cells are verdicts not raw data. The universal 3-cell grammar (Label · State · Action) that every row shares. Full tour of all 15 rows organized into 6 families: Trend, Energy, Participation, Risk, Structure, Context, plus the Last Signal row and the Live Conditions sub-panel. The five-color vocabulary that stays consistent across every row. The 10-second glance read discipline (Header → Color Scan → Deep Read). Four common reading mistakes that every beginner commits. Complete cheat sheet for your second monitor.', estimatedMinutes: 38, isFree: false, totalSections: 17, quizPassThreshold: 66 },
      { id: 'cipher-inputs-anatomy-part-1', courseId: 'level-11-cipher-pro-mastery', title: 'CIPHER Inputs Anatomy — Part 1: The Visual Layer', subtitle: 'Nine groups. Twenty-six inputs. Every toggle echoes through the system.', description: 'The first half of the CIPHER inputs tour — the visual-layer groups that DRAW on your chart. The Silent Cascade doctrine: every setting is connected to every other setting, and one toggle creates downstream effects you did not ask for. Full anatomy of nine groups: PRESET (the override engine with 6 curated combinations and the "max 3 visuals" rule), CIPHER RIBBON (with PRO-exclusive Divergence and Projection), CIPHER RISK ENVELOPE (concentric SAFE/WATCH/CAUTION/DANGER zones + the Fair Value gravity line + the display-vs-calculation trap), CIPHER STRUCTURE (lifecycle-managed S/R with pivot/max/tests/age defaults), CIPHER SPINE (health-adaptive breathing bands), CIPHER IMBALANCE (shrinking FVG boxes with auto-delete), CIPHER SWEEPS (liquidity raids with 3-bar context), CIPHER COIL (BB/KC squeeze with breakout diamond), and CIPHER PULSE (the signal engine with the most cascading slider in CIPHER — Pulse ATR Factor). The Intensity universal language (Subtle/Normal/Bold). Three ready-to-steal playbooks (Scalper / Swing / Structure reader). Six common visual-layer mistakes. Part 2 will cover the behavioral layer — Signal Engine, Risk Map, and Command Center row toggles.', estimatedMinutes: 45, isFree: false, totalSections: 16, quizPassThreshold: 66 },
      { id: 'cipher-inputs-anatomy-part-2', courseId: 'level-11-cipher-pro-mastery', title: 'CIPHER Inputs Anatomy — Part 2: The Behavioral Layer', subtitle: 'Three groups. Thirty-three inputs. Where CIPHER decides what to DO.', description: 'The second half of the CIPHER inputs tour — the behavioral-layer groups that decide what CIPHER DOES with the visuals you configured in Part 1. The Arrow Is the Last Word doctrine: every signal arrow is a TALLY of 4 upstream votes, never a trigger. Full anatomy of three groups: SIGNAL ENGINE (4 inputs — the 4 modes All/Trend/Reversal/Visuals-Only, Direction filter, the Strong Signals Only 4-factor conviction gate, and the 7 Cipher Candle modes that encode velocity/tension/composite dimensions), CIPHER RISK MAP (10 inputs — 3 display toggles plus the 4 SL methods Auto/Structure/Pulse/ATR with their asset-class routing, the 4 TP methods Auto/R-Multiple/Structure/ATR-Targets, and the TP1/TP2/TP3 scale-out mechanics with SL-to-BE on TP1), and COMMAND CENTER (19 inputs — master toggle + Position + Size + 16 row toggles organized by family Trend/Energy/Risk/Structure/Context/Signal). The Cross-Group Cascade doctrine: three settings (Strong Signals Only, Signal Engine, Pulse ATR Factor) that silently reshape 5+ downstream systems across multiple groups. Three behavioral-layer playbooks (Trend Follower / Mean Reversion / Structure-Based). Six common behavioral mistakes. Completion of this lesson earns the full CIPHER Inputs Anatomy certificate.', estimatedMinutes: 50, isFree: false, totalSections: 16, quizPassThreshold: 66 },
    ],
  },
];

export function getCourse(courseId: string): AcademyCourse | undefined {
  return academyCourses.find(c => c.id === courseId);
}

export function getLesson(lessonId: string): AcademyLesson | undefined {
  for (const course of academyCourses) {
    const lesson = course.lessons.find(l => l.id === lessonId);
    if (lesson) return lesson;
  }
  return undefined;
}

export function getNextLesson(currentLessonId: string): AcademyLesson | undefined {
  for (const course of academyCourses) {
    const idx = course.lessons.findIndex(l => l.id === currentLessonId);
    if (idx !== -1 && idx < course.lessons.length - 1) {
      return course.lessons[idx + 1];
    }
  }
  return undefined;
}
