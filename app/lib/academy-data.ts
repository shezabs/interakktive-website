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
