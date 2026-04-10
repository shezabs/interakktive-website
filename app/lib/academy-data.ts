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
