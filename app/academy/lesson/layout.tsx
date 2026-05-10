// app/academy/lesson/layout.tsx
// ============================================================================
// LESSON LAYOUT — wraps every /academy/lesson/<slug> page.
//
// 1) PRO gate: FREE lessons render unchanged. PRO lessons require an active
//    subscription; otherwise the user sees a paywall card.
// 2) Lesson nav bar: prev / academy home / next, fixed to the bottom of every
//    lesson. Skips lessons that aren't in LIVE_LESSONS so we never link to a
//    page that doesn't exist.
// 3) Per-lesson cert removal: lessons individually rendered "Certificate of
//    Completion" cards. We've moved certificates to the LEVEL — a single cert
//    unlocks when all lessons in a level are completed. This layout hides any
//    leftover per-lesson cert blocks and shows a level-aware callout instead.
// ============================================================================

'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft, ArrowRight, Crown, GraduationCap, Award } from 'lucide-react';
import { academyCourses } from '@/app/lib/academy-data';
import { useProAccess } from '@/app/lib/use-pro-access';
import { findAdjacentLiveLessons, findCourseForLesson, levelShortCode } from '@/app/lib/academy-helpers';

// Build a Set of FREE lesson IDs from the data file. FREE lessons skip the gate.
const FREE_LESSON_IDS = new Set(
  academyCourses.flatMap(c => c.lessons.filter(l => l.isFree).map(l => l.id))
);

function LessonNav({ slug }: { slug: string }) {
  const { prev, next } = findAdjacentLiveLessons(slug);

  return (
    <nav className="border-t border-white/5 bg-black/40 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-5 py-5 grid grid-cols-3 items-center gap-3">
        {/* PREV */}
        <div className="flex justify-start">
          {prev ? (
            <Link
              href={`/academy/lesson/${prev.id}`}
              className="group flex items-center gap-3 text-left max-w-full"
              title={prev.title}
            >
              <span className="flex-shrink-0 w-9 h-9 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center group-hover:border-primary-400/50 group-hover:bg-primary-500/10 transition-colors">
                <ArrowLeft className="w-4 h-4 text-gray-400 group-hover:text-primary-400 transition-colors" />
              </span>
              <span className="hidden sm:flex flex-col min-w-0">
                <span className="text-[10px] uppercase tracking-widest text-gray-600">Previous</span>
                <span className="text-xs text-gray-400 truncate group-hover:text-white transition-colors max-w-[200px]">
                  {prev.title}
                </span>
              </span>
            </Link>
          ) : <span />}
        </div>

        {/* ACADEMY HOME (centered) */}
        <div className="flex justify-center">
          <Link
            href="/academy"
            className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-primary-400/50 hover:bg-primary-500/10 transition-colors"
            title="Back to ATLAS Academy"
          >
            <GraduationCap className="w-4 h-4 text-primary-400" />
            <span className="text-xs font-semibold tracking-wide text-gray-300 group-hover:text-white transition-colors">
              Academy
            </span>
          </Link>
        </div>

        {/* NEXT */}
        <div className="flex justify-end">
          {next ? (
            <Link
              href={`/academy/lesson/${next.id}`}
              className="group flex items-center gap-3 text-right max-w-full"
              title={next.title}
            >
              <span className="hidden sm:flex flex-col min-w-0 items-end">
                <span className="text-[10px] uppercase tracking-widest text-gray-600">Next</span>
                <span className="text-xs text-gray-400 truncate group-hover:text-white transition-colors max-w-[200px]">
                  {next.title}
                </span>
              </span>
              <span className="flex-shrink-0 w-9 h-9 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center group-hover:border-primary-400/50 group-hover:bg-primary-500/10 transition-colors">
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-400 transition-colors" />
              </span>
            </Link>
          ) : <span />}
        </div>
      </div>
    </nav>
  );
}

// Level-cert callout shown at the bottom of every lesson, ABOVE the lesson nav.
// Replaces the old per-lesson certs with a level-aware one.
function LevelCertCallout({ slug }: { slug: string }) {
  const course = findCourseForLesson(slug);
  if (!course) return null;
  const code = levelShortCode(course.id);

  return (
    <section className="px-5 py-12 max-w-3xl mx-auto">
      <div className="rounded-2xl border border-amber-500/15 bg-gradient-to-br from-amber-500/[0.04] to-amber-500/[0.01] p-6 sm:p-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 mb-4">
          <Award className="w-6 h-6 text-amber-400" />
        </div>
        <p className="text-[10px] tracking-widest uppercase text-amber-400/70 font-semibold mb-2">{code} Certificate</p>
        <h3 className="text-lg font-bold text-white mb-2">Earn your {course.title} certificate</h3>
        <p className="text-sm text-gray-400 max-w-md mx-auto leading-relaxed mb-5">
          Complete every lesson in this level to unlock a downloadable certificate of completion.
        </p>
        <Link
          href="/academy"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-colors text-xs font-semibold text-gray-300"
        >
          <GraduationCap className="w-3.5 h-3.5" />
          View Level Progress
        </Link>
      </div>
    </section>
  );
}

// Hides per-lesson certificate blocks that are still hardcoded in 105+ lesson
// pages, AND uses the appearance of those blocks as a completion signal — the
// lesson's existing cert is gated behind `certUnlocked`, so when the cert
// renders it means the user just passed the quiz. We use that to write a row
// into lesson_completions (one per user per lesson).
//
// We do this from the layout because adding event-emit code to 105 lesson
// pages is too risky for one session. The DOM walk is the safest universal
// hook into the existing per-lesson quiz logic.
function useHidePerLessonCertificatesAndRecordCompletion(slug: string) {
  useEffect(() => {
    let cancelled = false;
    let recorded = false;

    // Resolve current course (level) for this lesson once at mount.
    const course = findCourseForLesson(slug);
    const levelId = course?.id || '';

    const recordCompletion = async () => {
      if (recorded || cancelled || !levelId) return;
      recorded = true;
      try {
        // Lazy-import to avoid pulling supabase into every lesson bundle.
        const { supabase } = await import('@/app/lib/supabase');
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) return; // Anonymous viewer — skip silently.
        // Upsert: one row per (user_email, lesson_id). Re-takes don't double-write.
        await supabase.from('lesson_completions').upsert(
          { user_email: user.email, lesson_id: slug, level_id: levelId },
          { onConflict: 'user_email,lesson_id' }
        );
      } catch {
        // Silent — if the DB write fails, the user still sees the lesson normally.
      }
    };

    const tryHideAndRecord = () => {
      if (cancelled) return;
      const all = document.querySelectorAll<HTMLElement>('p, h2, h3, h4, span');
      let found = false;
      all.forEach(el => {
        if (el.dataset.certHidden === '1') return;
        const txt = (el.textContent || '').trim().toLowerCase();
        if (txt !== 'certificate of completion') return;
        found = true;
        // Walk up to the nearest section / motion.div wrapper.
        let cur: HTMLElement | null = el;
        for (let i = 0; i < 8 && cur; i++) {
          const tag = cur.tagName.toLowerCase();
          if (tag === 'section' || cur.classList.contains('glass-card') || (cur.parentElement && cur.parentElement.tagName.toLowerCase() === 'section')) {
            const target = tag === 'section' ? cur : (cur.closest('section') || cur);
            (target as HTMLElement).style.display = 'none';
            (target as HTMLElement).dataset.certHidden = '1';
            break;
          }
          cur = cur.parentElement;
        }
        el.dataset.certHidden = '1';
      });
      if (found) recordCompletion();
    };

    // Initial pass + polling for cert markup that animates in via framer-motion.
    tryHideAndRecord();
    const t1 = setTimeout(tryHideAndRecord, 150);
    const t2 = setTimeout(tryHideAndRecord, 600);
    const t3 = setTimeout(tryHideAndRecord, 1500);
    // Also watch for later cert reveals (e.g. user finishes quiz partway through)
    const interval = setInterval(tryHideAndRecord, 2500);
    const stopInterval = setTimeout(() => clearInterval(interval), 60_000);

    return () => {
      cancelled = true;
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearInterval(interval);
      clearTimeout(stopInterval);
    };
  }, [slug]);
}

// Inner component used for the "lesson is unlocked" branches. We wrap children
// in a fragment + add: cert-stripper effect, level-cert callout, lesson nav.
function UnlockedLesson({ children, slug }: { children: React.ReactNode; slug: string }) {
  useHidePerLessonCertificatesAndRecordCompletion(slug);
  return (
    <>
      {children}
      <LevelCertCallout slug={slug} />
      <LessonNav slug={slug} />
    </>
  );
}

export default function LessonLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const slug = pathname?.split('/').pop() || '';
  const isFreeLesson = FREE_LESSON_IDS.has(slug);

  const { state } = useProAccess();

  // FREE lessons render immediately, no auth check.
  if (isFreeLesson) {
    return <UnlockedLesson slug={slug}>{children}</UnlockedLesson>;
  }

  // PRO lesson — gate based on access state.
  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 text-sm">
        Verifying access…
      </div>
    );
  }

  if (state === 'paying') {
    return <UnlockedLesson slug={slug}>{children}</UnlockedLesson>;
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
