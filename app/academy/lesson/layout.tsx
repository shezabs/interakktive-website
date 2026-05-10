// app/academy/lesson/layout.tsx
// ============================================================================
// LESSON GATE — wraps every /academy/lesson/<slug> page.
// FREE lessons pass through unchanged.
// PRO lessons require an active/cancelling subscription on any tier
// (Starter, Advantage, Elite). Otherwise the user sees a paywall card.
//
// This is the SERVER-SIDE half of defense-in-depth — even if a non-paying
// user types a PRO lesson URL directly, this layout intercepts before the
// lesson content renders.
// ============================================================================

'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, Crown } from 'lucide-react';
import { academyCourses } from '@/app/lib/academy-data';
import { useProAccess } from '@/app/lib/use-pro-access';

// Build a Set of FREE lesson IDs from the data file. FREE lessons skip the gate.
const FREE_LESSON_IDS = new Set(
  academyCourses.flatMap(c => c.lessons.filter(l => l.isFree).map(l => l.id))
);

export default function LessonLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const slug = pathname?.split('/').pop() || '';
  const isFreeLesson = FREE_LESSON_IDS.has(slug);

  const { state } = useProAccess();

  // FREE lessons render immediately, no auth check.
  if (isFreeLesson) return <>{children}</>;

  // PRO lesson — gate based on access state.
  if (state === 'loading') {
    // Lightweight skeleton while we resolve auth — keeps layout shift minimal.
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 text-sm">
        Verifying access…
      </div>
    );
  }

  if (state === 'paying') {
    return <>{children}</>;
  }

  // not-paying → paywall
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full glass-card rounded-2xl p-8 text-center text-white"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-accent-500/20 border border-amber-500/30 mb-6">
          <Crown className="w-8 h-8 text-amber-400" />
        </div>

        <h1 className="text-2xl font-bold mb-3">PRO Lesson</h1>
        <p className="text-gray-400 text-sm leading-relaxed mb-2">
          This lesson is part of the ATLAS PRO Academy — available to all paying subscribers.
        </p>
        <p className="text-gray-500 text-xs leading-relaxed mb-8">
          Starter, Advantage, and Elite all unlock the full Academy curriculum.
        </p>

        <Link
          href="/pricing"
          className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 rounded-lg font-semibold text-white transition-all"
        >
          See Pricing & Subscribe
          <ArrowRight className="w-4 h-4" />
        </Link>

        <Link
          href="/academy"
          className="block mt-3 text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          ← Back to Academy
        </Link>

        <div className="mt-8 pt-6 border-t border-white/5">
          <p className="text-xs text-gray-600 mb-2">Already subscribed?</p>
          <Link href="/signin" className="text-xs text-primary-400 hover:text-primary-300 transition-colors inline-flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Sign in to unlock
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
