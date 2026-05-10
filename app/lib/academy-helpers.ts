// app/lib/academy-helpers.ts
// ============================================================================
// Shared helpers for the Academy. Computes which lessons are live, finds the
// containing level for a lesson, and computes prev/next adjacent lessons.
// Also has the "is level complete" logic used by certificate unlocking.
// ============================================================================

import { academyCourses, AcademyCourse, AcademyLesson } from './academy-data';

// Set of lesson IDs that are currently shipped (have a live page).
// Add new lesson IDs here as they ship.
export const LIVE_LESSONS = new Set<string>([
  'what-is-trading', 'asset-classes', 'candlestick-anatomy',
  'reading-charts', 'risk-basics', 'position-sizing',
  'support-resistance', 'trendlines-channels', 'moving-averages',
  'rsi', 'macd', 'bollinger-bands', 'volume-analysis',
  'candlestick-advanced', 'chart-patterns', 'fibonacci', 'multi-timeframe',
  'first-strategy',
  'who-are-smart-money', 'market-structure-smc', 'liquidity',
  'liquidity-sweeps', 'order-blocks', 'fair-value-gaps',
  'premium-discount', 'optimal-trade-entry', 'breaker-blocks',
  'kill-zones', 'power-of-three', 'smc-trade-models', 'smc-phantom-pro',
  'sessions-deep-dive', 'smc-strategy',
  'traders-mind', 'fear-and-greed', 'fomo', 'revenge-trading',
  'loss-acceptance', 'confidence-overconfidence', 'process-over-outcome',
  'patience-skill', 'trading-routine', 'trading-journal',
  'drawdown-psychology', 'mental-reset', 'performance-pressure',
  'mental-edge-capstone',
  'what-indicators-are', 'leading-vs-lagging', 'anatomy-of-oscillator',
  'signal-vs-noise', 'momentum-hidden-force', 'rsi-masterclass',
  'macd-deep-dive', 'stochastic-cci', 'volume-intelligence',
  'moving-averages-advanced', 'volatility-intelligence', 'confluence-matrix',
  'indicator-smc-fusion', 'indicator-stack-capstone',
  'anatomy-of-strategy', 'choosing-your-battlefield', 'model-1-trend-continuation',
  'model-2-reversal', 'entry-trigger-mastery', 'stop-placement-science',
  'target-selection', 'trade-management', 'backtesting-fundamentals',
  'expectancy-edge', 'strategy-journal', 'common-strategy-killers',
  'strategy-stress-test', 'strategy-engineering-capstone',
  'execution-gap', 'pre-session-routine', 'reading-live-price-action',
  'first-five-seconds', 'execution-timing', 'multi-timeframe-execution',
  'managing-open-trades', 'reading-the-tape', 'session-transitions',
  'trade-autopsy', 'scaling-when-and-how', 'trading-multiple-instruments',
  'weekly-performance-review', 'level-7-capstone',
  'why-technicals-alone-arent-enough', 'economic-calendar',
  'interest-rates-central-banks', 'inflation-data', 'employment-data',
  'gdp-pmi-leading-indicators', 'geopolitical-risk', 'currency-correlations',
  'intermarket-analysis', 'macro-informed-bias', 'news-trading-strategies',
  'risk-management-around-events', 'sentiment-positioning', 'level-8-capstone',
  'what-is-prop-trading', 'how-prop-firms-work', 'choosing-your-firm',
  'challenge-mathematics', 'challenge-strategy-design', 'challenge-mindset',
  'passing-the-challenge', 'funded-account-management',
  'daily-vs-overall-drawdown', 'scaling-funded-accounts', 'payout-optimisation',
  'when-challenges-fail', 'building-a-prop-business', 'level-9-capstone',
  'atlas-philosophy', 'sessions-plus-deep-dive',
  'market-acceptance-envelope-deep-dive', 'market-state-intelligence-deep-dive',
  'market-acceptance-zones-deep-dive', 'market-participation-gradient-deep-dive',
  'market-pressure-regime-deep-dive', 'volatility-state-index-deep-dive',
  'effort-result-divergence-deep-dive', 'market-efficiency-ratio-deep-dive',
  'reading-an-atlas-dashboard', 'stacking-free-indicators',
  'alert-architecture-free-tier', 'free-indicator-playbook-capstone',
  'why-cipher-operator-contract', 'cipher-command-center-anatomy',
  'cipher-inputs-anatomy-part-1', 'cipher-inputs-anatomy-part-2',
  'cipher-regime-engine', 'cipher-regime-transitions',
  'cipher-executive-summary', 'cipher-regime-sizing',
  'cipher-signal-philosophy', 'cipher-pulse-factor',
  'cipher-px-pipeline', 'cipher-ts-system', 'cipher-which-signals-to-take',
  'cipher-coil-mechanics', 'cipher-coil-reading', 'cipher-ribbon-engine',
  'cipher-structure-spine', 'cipher-imbalance', 'cipher-sweeps',
  'cipher-risk-envelope', 'cipher-risk-map', 'cipher-conviction-synthesis',
  'cipher-candles', 'cipher-war-room-integration',
]);

// Find which course (level) a lesson belongs to.
export function findCourseForLesson(lessonId: string): AcademyCourse | null {
  for (const course of academyCourses) {
    if (course.lessons.some(l => l.id === lessonId)) return course;
  }
  return null;
}

// Find the previous and next LIVE lessons relative to the given lesson.
// Walks across levels — e.g. last lesson of L1 → first lesson of L2.
export function findAdjacentLiveLessons(lessonId: string): {
  prev: { id: string; title: string; courseTitle: string } | null;
  next: { id: string; title: string; courseTitle: string } | null;
} {
  // Build a flat array of (lesson, course) for live lessons only, in order.
  const flat: { lesson: AcademyLesson; course: AcademyCourse }[] = [];
  for (const course of academyCourses) {
    for (const lesson of course.lessons) {
      if (LIVE_LESSONS.has(lesson.id)) flat.push({ lesson, course });
    }
  }

  const idx = flat.findIndex(x => x.lesson.id === lessonId);
  if (idx === -1) return { prev: null, next: null };

  const prevEntry = idx > 0 ? flat[idx - 1] : null;
  const nextEntry = idx < flat.length - 1 ? flat[idx + 1] : null;

  return {
    prev: prevEntry ? { id: prevEntry.lesson.id, title: prevEntry.lesson.title, courseTitle: prevEntry.course.title } : null,
    next: nextEntry ? { id: nextEntry.lesson.id, title: nextEntry.lesson.title, courseTitle: nextEntry.course.title } : null,
  };
}

// IDs of all LIVE lessons in a given level. Used to determine "level complete".
export function liveLessonIdsForLevel(levelId: string): string[] {
  const course = academyCourses.find(c => c.id === levelId);
  if (!course) return [];
  return course.lessons.filter(l => LIVE_LESSONS.has(l.id)).map(l => l.id);
}

// True if every live lesson in this level is in the completedLessonIds set.
export function isLevelCompleteByCompletions(levelId: string, completedLessonIds: Set<string>): boolean {
  const required = liveLessonIdsForLevel(levelId);
  if (required.length === 0) return false; // no live lessons yet, can't earn cert
  return required.every(id => completedLessonIds.has(id));
}

// Generate a presentable level label (e.g. 'L1', 'L11')
export function levelShortCode(levelId: string): string {
  const m = levelId.match(/level-(\d+)/);
  return m ? `L${m[1]}` : levelId.toUpperCase();
}
