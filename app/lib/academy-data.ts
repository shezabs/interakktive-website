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
